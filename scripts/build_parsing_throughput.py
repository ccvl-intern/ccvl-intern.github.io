#!/usr/bin/env python3
"""Export per-GPU input-frame throughput from the archived one-GPU workers."""

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path


def throughput(rows, summary, devices):
    profiles = devices["device"]["profiles"]
    if len(profiles) != summary["shard_count"] or len(rows) != summary["sample_count"]:
        raise ValueError("Incomplete timing cohort")
    if len({row["sample_id"] for row in rows}) != len(rows):
        raise ValueError("Duplicate timing sample")
    job_ids = set()
    for profile in profiles:
        gpus = profile["cuda"]["devices"]
        if len(gpus) != 1 or gpus[0]["name"] != "NVIDIA RTX A5000":
            raise ValueError("Expected one RTX A5000 per worker")
        if profile["slurm"]["SLURM_GPUS_ON_NODE"] != "1":
            raise ValueError("Expected a single-GPU allocation")
        job_ids.add(profile["slurm"]["SLURM_JOB_ID"])
    if job_ids != {row["slurm_job_id"] for row in rows}:
        raise ValueError("GPU workers do not match timing rows")
    if summary["status"] != "passed" or summary["timing_cache_hit_count"] != 0:
        raise ValueError("Expected a successful fresh parsing run")
    counts = [int(row["sampled_frame_count"]) for row in rows]
    seconds = float(summary["worker_wall_time_sec"])
    if min(counts) < 1 or not math.isfinite(seconds) or seconds <= 0:
        raise ValueError("Invalid frame count or timing")
    return {
        "device": "NVIDIA RTX A5000", "gpu_count_per_worker": 1,
        "worker_count": len(profiles), "sample_count": len(rows),
        "sampled_frame_count": sum(counts), "worker_wall_time_sec": seconds,
        "images_per_second_per_gpu": sum(counts) / seconds,
        "unit": "sampled input images/second/GPU",
        "evaluation_date": "2026-08-04", "status": "archived",
        "identifier": "Qwen3-VL-8B-Instruct",
        "source_revision": summary["source_revision"],
        "protocol": "Sum of sampled input frame instances divided by summed wall time of independent one-GPU workers. Includes model loading, decoding, reconstruction and code writing; not combined multi-GPU throughput or full-video FPS.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timing-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data/parsing_throughput.json")
    args = parser.parse_args()
    sources = {name: (args.timing_dir / name).read_bytes()
               for name in ("per_sample.csv", "summary.json", "devices.json")}
    rows = list(csv.DictReader(sources["per_sample.csv"].decode().splitlines()))
    result = throughput(rows, json.loads(sources["summary.json"]), json.loads(sources["devices.json"]))
    result["source_sha256"] = {name: hashlib.sha256(value).hexdigest() for name, value in sources.items()}
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
