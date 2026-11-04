# Sosa: complete-scene prospective evidence

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Experiment 2 binary judgments about future contact after disappearance.

Population: 22 questions, 10 source/scene units, 44 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Preserve all scene objects and spatial relations, and clarify that the question concerns continuation rather than contact already seen.

1. Read the unchanged saved object graph, source timestamps and original image-plane coordinates.
2. Include context objects and complete scene relations rather than only target-pair measurements.
3. Render scene evidence with an explicit prospective task clarification.
4. Retain the original video, question and Yes/No answer domain.
5. Freeze model choices before comparing their one-hot scalars with human response proportions.

## Saved Results

22 binary choices yield 44 one-hot scalar items. Their R2 is not 86% classification accuracy.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video, original wording | 3.0542 | 0.1748 | 0.5712 | unmatched clarification |
| Saved 8B-Instruct direct code, original wording | 86.1357 | 0.9281 | 0.2055 | unmatched clarification |
| Full code, original wording | 76.1865 | 0.8728 | 0.2511 | unmatched clarification |
| Pair graph, original wording | 3.0542 | 0.1748 | 0.5712 | unmatched clarification |
| Video + matched clarification | 42.7588 | 0.6539 | 0.3816 | matched input contract |
| Pair graph + matched clarification | 31.7535 | 0.5635 | 0.4239 | matched input contract |
| Complete-scene graph + clarification | 86.1357 | 0.9281 | 0.2055 | matched input contract |
| Partial-reference complete scene + clarification | 69.3341 | 0.8327 | 0.2796 | partial reference not upper bound |
| Direct code + matched clarification: unmeasured | Undefined | Undefined | Undefined | Unavailable clean control |
| Full code + matched clarification: unmeasured | Undefined | Undefined | Undefined | Unavailable clean control |

## Decision

The candidate exactly matches the historical direct-code answers and attains the same 86.135706% hard-choice ceiling. It does not beat direct code; equally clarified direct/full controls are unmeasured.

## Limits

- Clarification and complete-scene representation initially changed together. Clarified video and pair-graph controls help separate wording effects, but there is no complete-scene/no-clarification cell or matched clarified direct/full comparison.
- Ten underlying sources support 22 question records; exact-input aliases are not independent scenes.
- Partial-reference dynamic coverage is initial-only, not a temporal or physical upper bound.
- The full490 task experiment later scores 30.41% on this same exp2, despite identical canonical graph, visual frames and question/schema. Delivery, ordering, added measurements and runtime source differ, so the regression has no isolated causal explanation.
- No further improvement beyond this hard-choice ceiling can be claimed without changing the question/answer protocol; the current primary is not changed.

## Answer-Format Diagnostic

The reference-aware deterministic Yes/No ceiling is86.135706% R2 with normalized error floor0.205471. The independently generated complete-scene and historical direct-code outputs both attain it. This is a property of the fixed one-hot answer format and reference vector, not a model, physical-oracle or human-reliability result. It cannot be used to fit prompts or answers.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- coggym_sosa_scene_vqa_20261025_v2 / summary.json: `16d965e3c57762bf6507955049c6cd66c0f395192b140a69eafe69f2b7f4acc2`.
- coggym_sosa_readout_controls_20261025_v1 / summary.json: `f28d455d90fe2deff5f9af7169f3e717223fdbbb96808a316d4f7fda679d23e4`.
- coggym_sosa_scene_vqa_20261025_v2 / binary_ceiling.json: `4fae17e061b569bf2e5109b87dbb12e43ef92497ade59d36276fd3eb1dc0cd03`.
- docs / COGGYM_SOSA_GRAPH_TRANSFER_2026-10-25.md: `3d61d7c7a6d26e649741b3d4bfb0edaea8c793df9699fb38c13f99db01e2b055`.
- coggym_sosa_handoff_audit_20261103_v1 / REPORT.md: `305d410e5f9a4b276def84cb08456420fa42b6f885bf9a1b2184de6c267c7062`.
