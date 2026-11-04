# Stephan: goal-conditioned geometry

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Eight experiment-3 difficulty questions/order variants over two static diagrams; original slider [-50,50].

Population: 8 questions, 2 source/scene units, 8 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Compute whether each actor-to-target center segment intersects a declared obstacle box. Independently source-correct the reference barrier through the geometry evaluator/exporter.

1. Keep the two original diagrams, source variants, questions, scale and original participant instructions.
2. Validate the reference barrier against source pixels and source rendering parameters; preserve historical reference results separately.
3. Compute center-segment/obstacle-box intersections from predicted or source-corrected geometry.
4. Append geometric predicates and unresolved finite-body/action qualifications to the matched base evidence.
5. Ask the unchanged reasoner for comparative difficulty; supply no simulated action, outcome or calibrated rating.

## Saved Results

One slider type. Eight question variants are only two physical scene clusters. QA-ID nuisance differences remain in evidence prompts.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video, cached | Undefined | Undefined | 0.6310 | matched question media schema |
| Saved 8B-Instruct direct code, cached | 98.4651 | 0.9923 | 0.1285 | matched question media schema |
| Full code, cached | Undefined | Undefined | 0.6310 | matched question media schema |
| Predicted task graph, cached | 20.6023 | 0.4539 | 0.5109 | matched question media schema |
| Historical partial-reference graph | 53.5566 | 0.7318 | 0.5103 | not the corrected reference baseline |
| Predicted graph + certificates | 34.3350 | 0.5860 | 0.4533 | matched question media schema |
| Source-corrected reference graph | 18.3981 | 0.4289 | 0.5899 | matched question media schema |
| Source-corrected reference + certificates | 98.4651 | 0.9923 | 0.1452 | matched question media schema |

## Decision

Both certificate arms pass their own matched-base gates. Predicted 34.33% remains below direct 98.47%; corrected-reference certificates tie direct R2 with worse nRMSE.

## Limits

- Video/full answers are constant, so their correlation is undefined, not zero.
- Only two diagrams underlie eight variants. Same-image video/direct/full inputs form two native classes, while evidence inputs retain administrative QA-ID differences.
- Segment intersection is not finite-body clearance, a feasible physical action, success probability or subjective difficulty.
- Two predicted certificate outputs contradict their own verbal direction when mapping to the signed response scale.
- The original barrier-location instruction tension is preserved. Source-corrected reference geometry is not a complete physical oracle.
- Identical reference-certificate and direct R2 follows from a positive affine relation between their two-group outputs, not identical calibration.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- result_evidence / summary.json: `69b0bee37d02e30c7647a0787004353a54b818d4b7479f8ae549d90c9bbc63c2`.
- coggym_goal_geometry_recovery_20261104_v1 / REPORT.md: `f5db9a8be751092c5076ac32f825d2bcbcbf4504930c692410a87652158cfe3a`.
