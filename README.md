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

## Interface

- Static HTML, CSS, and JavaScript, with no build step or third-party runtime requests.
- Reasoning, parsing, per-study, and efficiency views; condition and RPE interval selectors.
- Slide GIF gallery, scene filters, figure enlargement, animation pause, and reduced-motion support.
- Original numerical JSON and slide/GIF files are unchanged by the September 8 design update.
- Icons are vendored from lucide-static 0.468.0; license is in `assets/icons/LICENSE`.
- Search-engine exclusion metadata and `robots.txt` remain in place. They discourage indexing, but do not make GitHub Pages private.

## Publication

The intended GitHub Pages repository is `ccvl-intern/ccvl-intern.github.io`. GitHub Pages serves the default branch at <https://ccvl-intern.github.io/>.
