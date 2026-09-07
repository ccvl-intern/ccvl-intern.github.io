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
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data/reasoning_results.json")
    args = parser.parse_args()
    source = args.report.read_bytes()
    report = json.loads(source)
    result = json.loads(args.output.read_text())
    result["matched_comparisons"] = matched_comparisons(report)
    result["provenance"]["comparison_report_sha256"] = hashlib.sha256(source).hexdigest()
    result["provenance"]["comparison_cohort"] = "Common valid experiments across direct VLM full code, Unified Parser full code, and Unified Parser abstracted code."
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    for row in result["matched_comparisons"]:
        scores = " / ".join(f"{100 * row[key]:.2f}%" for key in ("direct", "full", "abstracted"))
        print(f"{row['reasoner']} {row['group']} n={row['n']}: {scores}")


if __name__ == "__main__":
    main()
