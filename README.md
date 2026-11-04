# Unified and Adaptive Visual Parser for CogGym Reasoning

Static research site redesigned around methods, study-level results, limitations
and source-linked evidence. Plain HTML, CSS and JavaScript; no build step,
backend or GPU inference is needed to preview the saved results.

## Local preview

Run from the repository root:

```bash
python3 -m http.server 8797 --bind 127.0.0.1
```

Open [the local preview](http://127.0.0.1:8797/). Use HTTP rather than opening
the HTML directly, because the page fetches local JSON and example records.

## Research scope

- **Eight development panels:** heterogeneous, previously exposed methods,
  prompts and controls. They are not one unified benchmark run and have no
  combined development score.
- **Frozen full cohort:** 13 studies and 490 questions. All five strict
  fixed-22-primary-experiment aggregates remain undefined. Missing outputs,
  constant predictions and insufficient type-level samples are not zero-filled.
- **Matched diagnostic:** 410 questions across 15 common complete-and-defined
  experiments. This is not the full-cohort score or evidence of overall success.

The main metric equally averages response-type squared Pearson correlations
within each experiment, then equally averages experiments. Local completeness,
minimum-three-point and nonzero-variance rules are disclosed. The official
released evaluator uses normalized pooled correlation, a different estimator
and denominator; these results are not an official ten-run replication.
Signed r and nRMSE accompany R2 because negative correlation can yield high R2.

`data/research-20261105.json` is a dated, non-live snapshot. Its 50-question
unification entry records preparation and native-input verification, with
inference pending and no new reasoning result at the snapshot time.

## Page contents

The five numbered tables are:

1. Development results at a glance.
2. Frozen full-cohort results by study.
3. Matched complete-and-defined diagnostic.
4. Archived parsing comparison.
5. Computational cost, with distinct work units and timing scopes.

Parsing error bars report population SD across samples (`ddof=0`), not sample
SD or seed uncertainty. The 84.14% mIoU is an accepted-box merge; the 7.26%
temporal RPE comes from a separate Qwen3-VL-8B-Thinking condition. The 0.3250
sampled images/s/GPU throughput uses Qwen3-VL-8B-Instruct. These are not jointly
measured accuracy and runtime results from one configuration.

Study tabs include methods, controls, limitations and source records. Real
archived study GIFs show source imagery at left and box reconstruction at right;
they do not visualize new reasoning outputs. The saved-run viewer contains
archived 8B/9B examples, not outputs from the newer 27B development experiments.

## Files and provenance

- `index.html`, `assets/research.css`, `assets/research.js`: redesigned page and
  research views; `assets/examples.js` renders saved examples.
- `data/research-20261105.json`: scoped results, metric definitions, snapshot
  status and provenance hashes; `data/research-sources/` contains sanitized
  source-report extracts.
- `data/run_examples.json`, `data/examples/`, `assets/examples/`: saved example
  metadata, code records and original videos.
- `assets/demos/`, `assets/figures/`, `assets/slides/`: archived study GIFs and
  presentation figures. Earlier result JSON, site assets and archived records
  are retained, not regenerated or silently replaced.

## Checks and publication

Run the site checks with Node.js:

```bash
node --test scripts/test_research_site.mjs
```

The client-side password screen is a **presentation gate, not security**.
Published HTML, JavaScript, data and media remain publicly accessible.
Search-engine exclusion metadata and `robots.txt` do not provide access control.
Do not publish secrets or private research artifacts.

`output/` and `.playwright-cli/` are intentional local QA directories. Retain
them locally, but exclude them from the published site.
