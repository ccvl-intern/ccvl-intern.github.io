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

The web tables are packaged in `data/results.json` and trace back to the validated Physics-280 artifacts listed in that file. Structured experiment artifacts take precedence where a slide contains an older or incomplete number. The example code in `data/hamrick_code.json` is a compact, exact projection of accepted code `code_3bf2a125e94ff8838387`; no evaluation target is included.

The animated media in `assets/demos/` are accepted parsing overlays from the Physics-280 package. They are presentation assets, not model inputs.

The specialist parsing table reports each method as a 280-sample pipeline condition. The specialist component is invoked on 40 routed 3D samples; the remaining 240 strict-2D outputs are unchanged by design.

## Publication

The intended GitHub Pages repository is `ccvl-intern/ccvl-intern.github.io`. GitHub Pages serves the default branch at <https://ccvl-intern.github.io/>.
