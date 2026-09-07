#!/usr/bin/env python3
"""Package existing inference artifacts, never run models or change answers."""

import argparse
import csv
import gzip
import hashlib
import json
import re
import shutil
from pathlib import Path


MODELS = {
    "thinking": "Qwen3-VL-8B-Thinking",
    "instruct": "Qwen3-VL-8B-Instruct",
    "glm": "GLM-4.1V-9B-Thinking",
}
EXAMPLES = {
    "physics_package_3783e9a67ca6fade0f27": ("Hamrick · block mass", "hamrick-mass", "non_uncertainty"),
    "physics_package_9d90e863adb211cab8d5": ("Hamrick · fall likelihood", "hamrick-fall", "uncertainty"),
    "physics_package_214e12975f6672c9e82f": ("Bass · outcome likelihood", "bass-likelihood", "uncertainty"),
}
PATH_PATTERN = re.compile(r"/(?:scratch|Users|home)/[^\s\"\\<>]*")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(path.read_text())


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def delivered_context(source, trace):
    context = trace["code_context"]
    assert sha(source) == context["source_sha256"], "Source code changed since inference"
    payload = json.loads(source)
    supplied = payload if context["context_policy"] == "uncut" else [payload]
    serialized = json.dumps(supplied, ensure_ascii=False, separators=(",", ":")).encode()
    stats = context["prompt_stats"]
    if stats["cutoff_applied"]:
        marker = ("\n\n[PARSED_CODE_CUTOFF policy=deterministic_token_prefix_v1 "
                  f"original_tokens={stats['original_tokens']} token_budget={stats['token_budget']}]").encode()
        serialized = serialized[:stats["delivered_bytes"] - len(marker)] + marker
    assert len(serialized) == stats["delivered_bytes"], "Delivered byte count mismatch"
    assert sha(serialized) == stats["delivered_sha256"], "Cannot reproduce exact delivered code"
    return serialized.decode()


def excerpt(text):
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        return text[:5500], "First 5,500 characters of the recorded cutoff payload; full delivered text is downloadable."
    doc = value[0] if isinstance(value, list) else value
    if isinstance(doc, dict) and isinstance(doc.get("4d_spatial_code"), list):
        atoms = doc["4d_spatial_code"]
        geometry = [row for row in atoms if row.get("group") in {"geometry_2d", "geometry_3d", "motion", "relations"}]
        selected = (geometry or atoms)[:8]
        lines = ["["] + ["  " + json.dumps(row, ensure_ascii=False) + ("," if i < len(selected) - 1 else "") for i, row in enumerate(selected)] + ["]"]
        return "\n".join(lines), f"{len(selected)}-record excerpt from {len(atoms):,} supplied records, in stored order; not a new abstraction."
    formatted = json.dumps(value, ensure_ascii=False, indent=2)
    lines = formatted.splitlines()
    return "\n".join(lines[:100]), f"First {min(100, len(lines))} of {len(lines):,} formatted lines; full delivered text is downloadable."


def scored_rows(source_root, condition_path, question):
    directory = source_root / "runs" / condition_path / "coggym" / "items"
    norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    candidates = [p for p in directory.glob("*.csv") if norm(p.stem.split("__")[0]) == norm(question["study"])]
    result = []
    for path in candidates:
        with path.open(newline="") as handle:
            for row in csv.DictReader(handle):
                if row["item_id"].rsplit("#", 1)[0] == question["source_record_id"] and row["tag"] == question["query_tag"]:
                    result.append(row)
    result.sort(key=lambda row: int(row["item_id"].rsplit("#", 1)[1]))
    assert result, f"Missing scored prediction: {question['qa_id']}"
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--traces", type=Path, required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    args = parser.parse_args()
    traces = read(args.traces)
    questions = {q["qa_id"]: q for q in read(args.source / "questions.json")["questions"]}
    reasoning = read(args.site / "data/reasoning_results.json")
    question_styles = read(args.site / "data/question_styles.json")
    out = args.site / "data/examples"
    out.mkdir(parents=True, exist_ok=True)
    manifest = {"schema_version": "saved_run_examples.1", "default_example": next(iter(EXAMPLES)),
                "default_model": "thinking", "models": [{"id": k, "label": v} for k, v in MODELS.items()],
                "conditions": [], "examples": []}
    conditions = {}
    for item in traces:
        cid = item["condition"]
        model, kind = cid.split("_", 1)
        if cid in conditions:
            continue
        row = next(r for r in reasoning["conditions"] if r["reasoner"] == MODELS[model] and
                   (r["section"] == "gt_abstraction" if kind == "oracle" else
                    r["section"] == "predicted_parsing" and ("abstraction" in r["parsing"]) == (kind == "abstracted")))
        run = item["trace"]["condition_slug"]
        if kind == "oracle":
            path = f"oracle_identifier_experiment_20260902_r1/oracle_reasoning/models/{run}"
            code_source = "Released GT geometry, encoded and abstracted; no human answer targets"
        elif model == "thinking":
            parent = "adaptive_reasoning_90_conditions_20260831" if kind == "abstracted" else "physics_280_code_vlm_matrix_20260828_r6"
            path = f"{parent}/models/{run}"
            code_source = "Qwen3-VL-8B-Thinking + SAM3.1 + VGGT-Omega + SpatialTrackerV2"
        else:
            parent = "identifier_adaptive_reasoning_20260905" if kind == "abstracted" else "oracle_identifier_experiment_20260902_r1/identifier_reasoning"
            path = f"{parent}/models/{run}"
            code_source = MODELS[model] + " identifier + SAM3.1 + VGGT-Omega + SpatialTrackerV2"
        condition = {"id": cid, "model": model, "kind": kind, "r2": row["overall"], "ratio": row.get("ratio"),
                     "run": run, "run_path": path, "code_source": code_source}
        conditions[cid] = condition
        manifest["conditions"].append(condition)

    for qid, (label, slug, group) in EXAMPLES.items():
        q = questions[qid]
        schema = q["answer_schema"]
        src = args.archive / q["media_paths"][0].lstrip("/")
        media_path = f"assets/examples/{slug}.mp4"
        (args.site / media_path).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, args.site / media_path)
        form = "Options: " + " / ".join(schema["options"]) if schema["type"] == "categorical" else f"Answer scale: {schema['minimum']:g}-{schema['maximum']:g}."
        example = {"id": qid, "label": label, "sample_id": q["sample_id"], "study": q["study"], "question": q["question"],
                   "answer_format": form, "answer_schema": schema, "group": group,
                   "media": {"src": media_path, "sha256": sha(src.read_bytes()), "note": "Original stimulus clip. The saved inference used 8 sampled frames."}, "runs": {}}
        if qid in question_styles:
            style = question_styles[qid]
            assert style["recorded_question"] == q["question"]
            assert style["source_record_id"] == q["source_record_id"] and style["query_tag"] == q["query_tag"]
            example["question_style"] = style
        for item in [x for x in traces if x["qa_id"] == qid]:
            cid, trace = item["condition"], item["trace"]
            condition = conditions[cid]
            assert trace["status"] == "complete" and trace["sample_id"] == q["sample_id"]
            assert trace["hf_id"].split("/")[-1] == MODELS[condition["model"]]
            source = (args.archive / trace["code_context"]["source_path"].lstrip("/")).read_bytes()
            delivered = delivered_context(source, trace)
            public, redactions = PATH_PATTERN.subn("[local artifact path]", delivered)
            code_sha = trace["code_context"]["delivered_sha256"]
            code_path = f"data/examples/{slug}-{cid}.txt.gz"
            (args.site / code_path).write_bytes(gzip.compress(public.encode(), mtime=0))
            preview, preview_note = excerpt(public)
            scored = scored_rows(args.source, condition["run_path"], q)
            if schema["type"] == "categorical":
                assert len(scored) == len(schema["options"])
                assert trace["answer"] in schema["options"]
                selected_index = schema["options"].index(trace["answer"])
                assert all(float(row["model_mean"]) == int(i == selected_index) for i, row in enumerate(scored))
                display = trace["answer"]
                human = "; ".join(f"{option}: {float(row['human']) * 100:.1f}%" for option, row in zip(schema["options"], scored))
                prediction_note = "Saved categorical answer."
            else:
                assert len(scored) == 1 and float(scored[0]["model_mean"]) == float(trace["answer"])
                display = f"{trace['answer']:g} / {schema['maximum']:g}"
                human = f"Human mean: {float(scored[0]['human']):g} on the {schema['minimum']:g}-{schema['maximum']:g} scale."
                prediction_note = "Saved likelihood rating, not model confidence."
            stats = trace["code_context"]["prompt_stats"]
            cut = bool(stats["cutoff_applied"])
            repair = bool(stats.get("batch_repair_fallback"))
            policy = f"{trace['visual_frame_count']} sampled frames; " + (f"token-prefix cutoff to {stats['delivered_tokens']:,} code tokens" if cut else "code delivered without a token cutoff")
            if repair:
                prediction_note += " An answer-format repair pass was recorded."
                policy += "; format-repair pass: the code token count describes the initial answer pass"
            response_keys = ("answer", "evidence_summary", "confidence", "evidence_ids", "tool_calls", "invalid_tool_calls")
            response = {key: trace[key] for key in response_keys if key in trace}
            description = "Archived delivered-code text, verified against the trace SHA-256."
            if cut:
                description += " The full-code condition applied a token-prefix cutoff."
            if redactions:
                description += " Local filesystem paths are redacted in the public copy."
            record = {"schema_version": "saved_run_example.1", "condition_id": cid, "qa_id": qid,
                      "prediction": {"display": display, "answer": trace["answer"], "note": prediction_note},
                      "human_reference": human, "input_policy": policy,
                      "code": {"description": description, "label": "Delivered code excerpt", "delivered_tokens": stats["delivered_tokens"],
                               "source_bytes": len(source), "sha256": code_sha, "public_sha256": sha(public.encode()),
                               "local_path_redactions": redactions, "download": code_path, "excerpt": preview, "excerpt_note": preview_note,
                               "cutoff_applied": cut, "original_tokens": stats["original_tokens"], "format_repair": repair},
                      "response": json.dumps(response, ensure_ascii=False, indent=2),
                      "provenance": {"source_sha256": sha(source), "trace_fingerprint": trace["fingerprint"], "inference_rerun": False,
                                     "source_record_id": q["source_record_id"], "csv_prediction_verified": True}}
            record_path = f"data/examples/{slug}-{cid}.json"
            write_json(args.site / record_path, record)
            example["runs"][cid] = record_path
        assert len(example["runs"]) == 9
        manifest["examples"].append(example)
    write_json(args.site / "data/run_examples.json", manifest)
    print(json.dumps({"examples": len(manifest["examples"]), "conditions": len(conditions), "records": sum(len(e["runs"]) for e in manifest["examples"]),
                      "source_and_delivered_hashes_verified": True, "predictions_match_scored_csv": True}))


if __name__ == "__main__":
    main()
