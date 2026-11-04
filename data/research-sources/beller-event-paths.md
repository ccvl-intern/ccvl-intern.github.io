# Beller: event-local temporal paths

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Choose among four causal-language descriptions of interactions.

Population: 20 questions, 20 source/scene units, 80 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Augment parsed observations with source-pixel event measurements, then expose time-respecting paths and event-local positions without supplying a causal category.

1. Use parsed identities and coarse motion to select event windows in original video pixels.
2. Measure circles in those windows; retain missing/ambiguous observations rather than asserting absence.
3. Build near-contact events and before/after motion, with source time and measured geometry.
4. Connect only temporally supported paths and attach event-local position anchors; retain unknown counterfactual consequences.
5. Let the reasoner choose the original causal-language response. No removed-world outcome or human label is inserted.

## Saved Results

20 categorical responses yield 80 option-level scalars. These are not 80 independent videos.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video | 0.3114 | 0.0558 | 0.5042 | added observation coverage in candidate |
| Saved 8B-Thinking direct code | 2.0863 | 0.1444 | 0.4822 | added observation coverage in candidate |
| Full code | 0.3300 | -0.0574 | 0.5311 | added observation coverage in candidate |
| Previous full observation graph | 3.0270 | 0.1740 | 0.4746 | within development sequence |
| Previous interaction ledger | 4.8374 | 0.2199 | 0.4625 | within development sequence |
| Dense event notes | 15.9080 | 0.3988 | 0.4123 | within development sequence |
| Connected relations | 13.5176 | 0.3677 | 0.4215 | within development sequence |
| Chronological paths | 15.6472 | 0.3956 | 0.4133 | within development sequence |
| Paths + event-local positions | 25.3910 | 0.5039 | 0.3797 | within development sequence |
| Initial-only reference graph | 1.1382 | 0.1067 | 0.4917 | different partial reference coverage |
| Same renderer, partial ball-only reference | 32.6259 | 0.5712 | 0.3573 | same renderer ball geometry intervention |
| Later relation plots | 16.0392 | 0.4005 | 0.4118 | additional visual pages and legend |
| Later same-fact raster tables | 19.7853 | 0.4448 | 0.3984 | matched plot table facts |

## Decision

Anchored paths improve the three historical baselines but gain only 9.48 percentage points over dense notes, below the frozen 10pp threshold. Four of five gates pass; expansion is not supported.

## Limits

- The candidate extends perception with a study-specific circle observer; it is not unchanged Parse Anything or only a text reformat.
- Near-contact windows and observed causal paths do not prove necessity or the removed-A outcome.
- The 32.63% ball-only reference diagnostic changes only factual ball geometry, not all scene fields; it is not a complete physical oracle.
- Later plots and tables regress to 16.04% and 19.79%, respectively; they are retained rather than selecting only the higher result.
- Saved direct parsing is 8B, not same27B. Twenty exposed sources do not establish transfer.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- coggym_relation_canvas_vqa_20261030_v1 / summary.json: `d319a68ff0a1ffe18aca430ffa4f56d5961f9bb86524503abc164e98cba6a063`.
- coggym_event_path_screen_20261029_v1 / summary.json: `476bf3dce1524fbc14923a02fa32c6a3ab4bbba41bdf830c762b33c6d704f365`.
- coggym_ball_oracle_event_screen_20261029_v1 / summary.json: `da7a89db01d65b4989c53357f1c7aa1b08c74cc9dc853bc9ff6873f448f05d4b`.
- docs / COGGYM_TEMPORAL_PATH_RESULT_2026-10-30.md: `e67444e0871d51e322d5e632e5c6d084efc1abdc38807473e0edf4b82e8f39aa`.
- docs / COGGYM_RELATION_CANVAS_VQA_RESULT_2026-10-30.md: `e529d212275492096c7dd884ffa75a4ef92034a3e20dda71680aeb54564a372f`.
- docs / COGGYM_BALL_ORACLE_RESULT_2026-10-30.md: `889cf5260fce1f609c379571b46e58ef01f3f86d4ac7b00cf99273899d7ee7f5`.
