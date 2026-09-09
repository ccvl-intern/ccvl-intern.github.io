#!/usr/bin/env python3
"""Export three-way matched charts from saved uncertainty-split scores."""

import argparse
import hashlib
import json
import math
from pathlib import Path
from statistics import mean


CONDITIONS = (
    ("Qwen3-VL-8B-Instruct", 0.7),
    ("Qwen3-VL-8B-Thinking", 0.9),
    ("GLM-4.1V-9B-Thinking", 0.7),
)
VIDEO_MODEL_SLUGS = {
    "Qwen3-VL-8B-Instruct": "qwen3_vl_8b_instruct",
    "Qwen3-VL-8B-Thinking": "qwen3_vl_8b_thinking",
    "GLM-4.1V-9B-Thinking": "glm_4_1v_9b_thinking",
}

STUDY_LABELS = {
    "Bass2022Partial": "Bass et al., 2022",
    "Bates2019Modeling": "Bates et al., 2019",
    "Beller2020Language": "Beller et al., 2020",
    "Gerstenberg2021A_Counterfactual": "Gerstenberg et al., 2021",
    "Gerstenberg2022What": "Gerstenberg et al., 2022",
    "hamrick2016inferring": "Hamrick et al., 2016",
    "Smith2019Modeling": "Smith et al., 2019",
    "sosa2021Moral": "Sosa et al., 2021",
    "Sosa2025Blending": "Sosa et al., 2025",
    "stephan2021counterfactual": "Stephan et al., 2021",
    "Ullman2018Learning": "Ullman et al., 2018",
    "Wu2022That": "Wu et al., 2022",
    "Zhou2023Mental": "Zhou et al., 2023",
}


def matched_study_comparisons(report, video_report):
    """Compare video-only and both code conditions on common valid experiments."""
    by_name = {row["display_name"]: row for row in report["conditions"]}
    video_models = {row["model_slug"]: row for row in video_report["models"]}
    if len(video_models) != len(video_report["models"]):
        raise ValueError("Duplicate video-only model")
    models = []
    for reasoner, ratio in CONDITIONS:
        names = {"full": f"Unified Parser / {reasoner}",
                 "abstracted": f"Task-specific Abstraction / {reasoner} (r={ratio})"}
        conditions = {key: by_name[name] for key, name in names.items()}
        video = video_models[VIDEO_MODEL_SLUGS[reasoner]]
        if video["status"] != "passed" or video["question_count"] != 636:
            raise ValueError(f"Incomplete video-only run: {reasoner}")
        if {row["mapped_item_coverage_sha256"] for row in conditions.values()} != {
            report["mapped_item_coverage_sha256"]
        }:
            raise ValueError(f"Question/item coverage differs: {reasoner}")
        experiments = {}
        for key, condition in conditions.items():
            entries = condition["experiments"]
            experiments[key] = {row["experiment"]: row for row in entries}
            if len(experiments[key]) != len(entries):
                raise ValueError(f"Duplicate experiment: {reasoner}/{key}")
        video_entries = video["coggym"]["experiments"]
        experiments["video_only"] = {row["experiment"]: {
            "r2": {"all": row["r2_pooled"]},
            "item_counts": {"all": row["predicted_item_count"]},
        } for row in video_entries}
        if len(experiments["video_only"]) != len(video_entries):
            raise ValueError(f"Duplicate experiment: {reasoner}/video_only")
        if any(set(rows) != set(experiments["full"]) for rows in experiments.values()):
            raise ValueError(f"Experiment coverage differs: {reasoner}")
        grouped, excluded = {}, []
        for name in sorted(experiments["full"]):
            study, experiment = name.split("/", 1)
            if study not in STUDY_LABELS:
                raise ValueError(f"Unknown study: {study}")
            pair = {key: rows[name] for key, rows in experiments.items()}
            values = {key: row["r2"]["all"] for key, row in pair.items()}
            if any(value is not None and (type(value) not in (int, float)
                   or not math.isfinite(value) or not 0 <= value <= 1) for value in values.values()):
                raise ValueError(f"Invalid squared correlation: {reasoner}/{name}")
            if len({row["item_counts"]["all"] for row in pair.values()}) != 1:
                raise ValueError(f"Item counts differ: {reasoner}/{name}")
            if any(value is None for value in values.values()):
                excluded.append(name)
                continue
            grouped.setdefault(study, []).append({"experiment": experiment, **values,
                "item_count": pair["full"]["item_counts"]["all"]})
        studies = []
        for study, rows in sorted(grouped.items(), key=lambda item: STUDY_LABELS[item[0]]):
            full = mean(row["full"] for row in rows)
            abstracted = mean(row["abstracted"] for row in rows)
            studies.append({"study": study, "label": STUDY_LABELS[study],
                "video_only": mean(row["video_only"] for row in rows),
                "full": full, "abstracted": abstracted, "delta": abstracted - full,
                "n": len(rows), "experiments": rows})
        if not studies:
            raise ValueError(f"No common valid studies: {reasoner}")
        models.append({"reasoner": reasoner, "abstraction_ratio": ratio,
            "source_conditions": {"video_only": f"Video + question / {reasoner}", **names}, "studies": studies,
            "excluded_experiments": excluded})
    return models


def matched_comparisons(report):
    by_name = {row["display_name"]: row for row in report["conditions"]}
    comparisons = []
    for reasoner, ratio in CONDITIONS:
        names = {
            "direct": reasoner,
            "full": f"Unified Parser / {reasoner}",
            "abstracted": f"Task-specific Abstraction / {reasoner} (r={ratio})",
        }
        rows = {key: by_name[name] for key, name in names.items()}
        if not rows["direct"]["condition_root"].endswith("_own_cutoff_code"):
            raise ValueError(f"Expected the VLM's own parsed-code run: {reasoner}")
        fingerprints = {row["mapped_item_coverage_sha256"] for row in rows.values()}
        if fingerprints != {report["mapped_item_coverage_sha256"]}:
            raise ValueError(f"Question/item coverage differs: {reasoner}")
        experiments = {
            key: {item["experiment"]: item for item in row["experiments"]}
            for key, row in rows.items()
        }
        if any(set(items) != set(experiments["direct"]) for items in experiments.values()):
            raise ValueError(f"Experiment coverage differs: {reasoner}")
        for group, label in (("non", "non_uncertainty"), ("unc", "uncertainty")):
            common = sorted(set.intersection(*(
                {name for name, item in items.items() if item["r2"][label] is not None}
                for items in experiments.values()
            )))
            if not common:
                raise ValueError(f"No common valid experiments: {reasoner}/{group}")
            scores = {}
            for key, items in experiments.items():
                values = [items[name]["r2"][label] for name in common]
                if any(not math.isfinite(value) or not 0 <= value <= 1 for value in values):
                    raise ValueError(f"Invalid squared correlation: {reasoner}/{key}")
                scores[key] = mean(values)
            comparisons.append({
                "reasoner": reasoner,
                "group": group,
                "n": len(common),
                **scores,
                "abstraction_ratio": ratio,
                "source_conditions": names,
                "experiments": common,
            })
    return comparisons


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--video-report", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data/reasoning_results.json")
    parser.add_argument("--study-output", type=Path, default=Path(__file__).resolve().parents[1] / "data/study_reasoning_results.json")
    args = parser.parse_args()
    source = args.report.read_bytes()
    report = json.loads(source)
    video_source = args.video_report.read_bytes()
    result = json.loads(args.output.read_text())
    studies = matched_study_comparisons(report, json.loads(video_source))
    result["matched_comparisons"] = matched_comparisons(report)
    result["provenance"]["comparison_report_sha256"] = hashlib.sha256(source).hexdigest()
    result["provenance"]["comparison_cohort"] = "Common valid experiments across direct VLM full code, Unified Parser full code, and Unified Parser abstracted code."
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    study_result = {
        "schema_version": "ccvl_study_reasoning.2",
        "provenance": {"report": "physics_280_uncertainty_split_20260906",
            "report_sha256": hashlib.sha256(source).hexdigest(), "inference_rerun": False,
            "video_only_report": "physics_280_video_only_vlm_matrix_20260826_r3/results.json",
            "video_only_report_sha256": hashlib.sha256(video_source).hexdigest(),
            "status": "archived", "mapped_item_coverage_sha256": report["mapped_item_coverage_sha256"]},
        "metric": "Mean squared Pearson correlation within each study, over the same valid experiments in all three conditions.",
        "matching": "Experiment IDs and evaluated item counts are matched across all three conditions. The coverage fingerprint applies to the two code conditions; video-only is the saved 26 August run, not the corrected rerun.",
        "missing_policy": "Experiments with undefined R2 in any condition are excluded from all three; studies with no remaining comparisons are omitted.",
        "models": studies,
    }
    args.study_output.write_text(json.dumps(study_result, indent=2, ensure_ascii=False, allow_nan=False) + "\n")
    for row in result["matched_comparisons"]:
        scores = " / ".join(f"{100 * row[key]:.2f}%" for key in ("direct", "full", "abstracted"))
        print(f"{row['reasoner']} {row['group']} n={row['n']}: {scores}")


if __name__ == "__main__":
    main()
