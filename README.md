# Unified and Adaptive Visual Parser for CogGym Reasoning

Static GitHub Pages project for the CCVL research demo.

## Local preview

```bash
cd /Users/always/Desktop/ccvl-intern.github.io
python3 -m http.server 8796 --bind 127.0.0.1
```

Open <http://127.0.0.1:8796/>.

## Data provenance

The section wording, architecture names, and presentation figures follow `ccvl-0819.pptx`. Slide-derived figures are packaged under `assets/slides/` so the deployed page has no external presentation dependency.

The web tables are packaged in `data/results.json` and `data/reasoning_results.json`. Structured experiment artifacts take precedence where a slide contains an older or incomplete number. The example in `data/hamrick_code.json` is an exact projection of accepted code `code_a7e49b129d726046e570`; no evaluation target is included. Its t = 0, 1, 2 values index sampled records; `timestamp_sec` gives elapsed time.

All 12 animated media files in `assets/demos/` are byte-identical to GIFs embedded in `ccvl-0819.pptx`. Each contains the original video at left and the bbox-only reconstruction at right. They are presentation assets, not model inputs.

Component variants explicitly list the modules used inside the shared pipeline; they are not standalone model evaluations. The saved report evaluates temporal 2D Center RPE on 130 samples with released temporal center ground truth. mIoU uses 280 samples; MotionCrafter excludes 34 static images. The report's sample SD is not random-seed variation.

Reasoning R-squared is mean squared Pearson correlation with human item means across valid experiments. The uncertainty comparison charts use paired valid experiments. Full and abstracted code are different reasoning inputs; parsing scores in the parsing view are measured before evidence selection.

The separate Video only view (`#video-only`) uses `data/video_only_results.json`, transcribed without numeric changes from `physics_280_video_only_vlm_matrix_20260826_r3/coggym_model_summary.csv`. Its 14 rows are archived video-and-question-only results from August 26, not corrected reruns. They use each model's valid experiments and must not be treated as a matched comparison with the parsed-code views.

Table 7 in Per-study (`#panel-studies`) uses `data/study_reasoning_results.json`, exported by `scripts/build_reasoning_comparisons.py --report <September-6-report> --video-report <August-26-results>`. Video-only, full-code and abstracted-code R2 use the same finite experiments within each study, with matching experiment IDs and evaluated item counts. Undefined experiments are excluded from all three conditions; studies with no remaining comparisons are omitted, never zero-filled. Ratios match Table 1: Instruct 0.7, Thinking 0.9, and GLM 0.7. Experiment values and source-report hashes remain in the downloadable JSON. These are archived results, not the corrected ten-round rerun; no inference was performed for this website update. The visible explanatory footnotes were removed at the user's request. The two change columns show abstraction minus full code (`delta`) and abstraction minus video-only (`delta_vs_video_only`), calculated from unrounded scores and displayed in percentage points.

Table 4 uses `data/parsing_throughput.json`, produced by `scripts/build_parsing_throughput.py --timing-dir <archived-timing-directory>`. The August 4 run used Qwen3-VL-8B-Instruct + SAM3.1 + VGGT-Omega + SpatialTrackerV2: 4,439 sampled frame instances across 280 samples / 13,657.10791680077 summed single-GPU worker seconds = 0.3250322123 images/s/GPU. All four workers had one RTX A5000 each. This includes loading and the end-to-end pipeline, not only neural inference or all source-video frames. The previous display added four stage averages with different sample denominators; it was not a measured end-to-end latency and is no longer displayed. Original slide timing values remain in the archived `data/results.json`, separate from the throughput measurement.

## Interface

- Static HTML, CSS, and JavaScript, with no build step or third-party runtime requests.
- Reasoning, video-only, parsing, per-study, and efficiency views; condition and RPE interval selectors.
- Stable result labels: Tables 1-6 cover parsed-code reasoning, video-only reasoning, parsing quality, efficiency, PhysBench, and the abstraction pilot; Table 7 adds before/after reasoning by study with a model selector. Figures 1-3 cover question-type comparisons, per-study accuracy, and qualitative examples.
- Slide GIF gallery, scene filters, figure enlargement, animation pause, and reduced-motion support.
- Original numerical JSON and slide/GIF files are unchanged by the September 8 design update.
- Icons are vendored from lucide-static 0.468.0; license is in `assets/icons/LICENSE`.
- Search-engine exclusion metadata and `robots.txt` remain in place. They discourage indexing, but do not make GitHub Pages private.

## Publication

The intended GitHub Pages repository is `ccvl-intern/ccvl-intern.github.io`. GitHub Pages serves the default branch at <https://ccvl-intern.github.io/>.
