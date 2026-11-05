# Bass: explicit event semantics

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Physical probability, conjunction and intervention judgments; 40 slider questions and two categorical checks.

Population: 42 questions, 20 source/scene units, 44 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Disambiguate already computed model events without changing their physical facts. Separate event occurrence from a named collision relation, world, objects, time and ordering.

1. Reuse the frozen modeled factual/intervention episodes and their source bindings.
2. Represent positive sensor events separately from absence of a named collision within the horizon.
3. Preserve world identity, participants, intervals, order, finite-horizon limits and unresolved endpoints.
4. Render the same facts explicitly; retain the original video, question, header, schema and native decoder.
5. Use the unchanged 27B reasoner for the probability judgment; human targets enter scoring only.

## Saved Results

All42 is the equal-weight mean of categorical and slider R2. The displayed nrmse is equal-type; nrmse_scalar is also retained.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video only | 50.2676 | 0.5366 | 0.2451 | matched input contract |
| Saved 8B-Instruct direct code | 51.5046 | 0.5867 | 0.2302 | matched input contract |
| Full Parse Anything code | 52.4721 | 0.6112 | 0.2207 | matched input contract |
| Previous task evidence | 50.3556 | 0.5422 | 0.2286 | matched input contract |
| Previous partial-reference evidence | 50.3384 | 0.4589 | 0.2278 | matched input contract |
| Predicted factual events | 63.1486 | 0.7564 | 0.2069 | matched input contract |
| Predicted conditional events | 63.2716 | 0.7576 | 0.2078 | matched input contract |
| Reference factual events | 54.6541 | 0.6525 | 0.2281 | partial reference not upper bound |
| Reference conditional events | 54.4431 | 0.6490 | 0.2299 | partial reference not upper bound |
| Predicted explicit event semantics | 72.1411 | 0.8327 | 0.1695 | matched input contract |
| GT/source state + event semantics | 66.9571 | 0.7912 | 0.1877 | source-state reference, not a verified upper bound |

This arm uses source-verified positions, velocities, gravity and scene geometry with the same event-semantic method. Its five-second factual and object-removal events are computed, not directly observed outcome GT. It is distinct from the earlier partial-reference evidence arm.

## Decision

Each semantic arm exceeds its matched factual arm by at least 5 percentage points, with positive slider r and no nRMSE regression. This is not a whole-cohort or transfer gate.

## Limits

- Two categorical checks contribute four perfect one-hot items in every arm. All42 R2 = (1 + slider40 R2)/2, so 72.14% is neither accuracy nor slider-only performance.
- Predicted slider40 R2 is 44.28%, signed r +0.6654, nRMSE 0.3391. Conditional9 R2 is 52.72%, below video 78.91%; conditional reasoning is not solved.
- The explicit handoff changes interpretation, not parsing, simulation or physical facts in this contrast.
- Source-verified states do not make the computed events or human probabilities ground truth. Differing source headers prevent an isolated parser-quality or oracle ranking claim.
- All 42 questions were exposed development data. No source-cluster uncertainty or held-out gain is established.

## Slider Diagnostic

All40 sliders are retained. This is reported alongside, not instead of, the all42 typed primary.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video only | 0.5352 | 0.0732 | 0.4903 | fixed 40 slider questions |
| Saved 8B-Instruct direct code | 3.0091 | 0.1735 | 0.4604 | fixed 40 slider questions |
| Full Parse Anything code | 4.9441 | 0.2224 | 0.4414 | fixed 40 slider questions |
| Previous task evidence | 0.7112 | 0.0843 | 0.4573 | fixed 40 slider questions |
| Previous partial-reference evidence | 0.6768 | -0.0823 | 0.4556 | fixed 40 slider questions |
| Predicted factual events | 26.2971 | 0.5128 | 0.4138 | fixed 40 slider questions |
| Predicted conditional events | 26.5433 | 0.5152 | 0.4156 | fixed 40 slider questions |
| Reference factual events | 9.3083 | 0.3051 | 0.4561 | fixed 40 slider questions |
| Reference conditional events | 8.8863 | 0.2981 | 0.4597 | fixed 40 slider questions |
| Predicted explicit event semantics | 44.2822 | 0.6654 | 0.3391 | fixed 40 slider questions |
| GT/source state + event semantics | 33.9142 | 0.5824 | 0.3755 | fixed 40 slider questions |

Conditional9: predicted explicit semantics 52.7218% R2, reference explicit semantics 48.5438%, video 78.9113%. This negative conditional comparison is retained.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- result_evidence / summary.json: `f3f4603a29fd71ec03dee427ec8cf8d7379cc613f107fc2ac91ba12f4f2446c8`.
- coggym_event_semantics_20261104_v1 / REPORT.md: `e96ecf68b2e09b31bfb9b347e785af1b62166adbe9f463a0e34aaa5bcfb4b3f0`.
