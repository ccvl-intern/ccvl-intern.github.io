# Wu: executable action routes

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Five counterfactual questions in experiment 2 and three causal judgments in experiment 3.

Population: 8 questions, 8 source/scene units, 8 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Combine frozen pixel-derived grid/actor/door observations with parsed identities, then compute legal transitions and route bounds under unknown future door states.

1. Bind source clocks, actors, grid geometry, OCR and door observations to the parsed scene.
2. Build an explicit action-state graph without filling unknown future states.
3. Compute legal transitions, feasible paths and bounds for the stated intervention.
4. Compare graph-only and graph-plus-calculation inputs with identical factual evidence.
5. Have the unchanged VLM supply the original human-judgment rating.

## Saved Results

R2 and signed_r are equal-experiment means over the 5-question and 3-question experiments. nrmse is pooled across all eight scalars, not the mean of experiment RMSEs.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video, cached | 11.2640 | -0.2237 | 0.5640 | observation coverage differs |
| Same-27B direct code | 22.3036 | 0.4688 | 0.5167 | observation coverage differs |
| Full code, cached | Undefined | Undefined | 0.5687 | observation coverage differs |
| Predicted semantic graph | 70.4237 | 0.8198 | 0.2186 | matched facts component contrast |
| Predicted graph + route calculations | 88.5468 | 0.9392 | 0.1626 | matched facts component contrast |
| Source-state reference JSON | 61.1430 | 0.7365 | 0.2633 | historical reference presentation |
| Source-state reference prose | 61.2371 | 0.7379 | 0.2585 | historical reference presentation |
| Earlier reference JSON + route calculations | 93.8850 | 0.9685 | 0.1325 | historical reference presentation |

## Decision

The route candidate improves its matched graph by 18.12 percentage points and beats the completed own27B direct control. This is not an all-control strict pass: full-code correlation is undefined.

## Limits

- Full-code causal answers are constant; strict two-experiment R2 is null, not zero.
- The gain comes primarily from three causal questions; counterfactual R2 slightly decreases.
- Predicted graphs contain 79 observed action states versus 74 in older controls. Only the graph-versus-route contrast holds evidence fixed.
- Same-method reference requests are native-input aliases of predicted requests, not independent oracle replications. The 93.89% reference row is an older, differently presented diagnostic.
- No held-out cross-study transfer or whole-cohort claim follows from this panel.

## Reference And Control Boundaries

The later own27B direct control completed all eight answers and is included above. Earlier incomplete-control status is superseded. Same-method source-reference graph/route requests exactly alias the predicted native inputs, so they are not independent reference calls. The separately displayed earlier reference JSON/prose/route results use a different presentation. The full-code null comes from constant causal responses; its finite pooled RMSE does not make strict R2 defined.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- coggym_wu_missing_case_20261031_v2 / scored_summary.json: `2dfbe2384433f7d492b0de95b23acd67fadd085302ca47a927ffab2630b39e66`.
- docs / COGGYM_PREDICTED_ACTION_VQA_RESULT_2026-10-31.md: `a1d80ea6b7ea71b7ce37d9d7e14f656ff368ca267c090248e4d3cdd615110185`.
