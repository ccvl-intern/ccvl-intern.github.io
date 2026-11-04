# Gerstenberg 2021: conditional trajectory

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Experiment 1 counterfactual subset: whether B would exit if A were removed.

Population: 8 questions, 8 source/scene units, 8 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Compute a conditional trajectory from unchanged observed boxes and source-supplied wall mechanics, then ask the VLM for the continuous judgment.

1. Select the first supported visible motion anchors for B, retaining times and provenance.
2. Remove A as the question stipulates; retain wall geometry and shared static elastic-wall assumptions.
3. Derive the gate corridor and execute supported contacts, velocity changes and whole-body exit checks.
4. Stop at the recorded horizon or unsupported geometry; do not invent completion.
5. Present the numerical timeline with the original visual input, question and common mechanisms to the reasoner.

## Saved Results

Single slider response type on eight fixed questions; R2 is squared Pearson r.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video + shared mechanisms | 6.3359 | -0.2517 | 0.5221 | matched common mechanisms |
| Saved 8B direct code + mechanisms | 3.2753 | -0.1810 | 0.5265 | matched common mechanisms |
| Same-27B direct code + mechanisms | 1.6275 | 0.1276 | 0.4994 | matched common mechanisms |
| Full code + mechanisms | 4.8262 | 0.2197 | 0.4902 | matched common mechanisms |
| Predicted numerical timeline | 74.5509 | 0.8634 | 0.2619 | matched common mechanisms |
| Partial-reference numerical timeline | 81.4954 | 0.9027 | 0.2421 | partial reference not upper bound |

## Decision

Both timelines have positive r, higher R2 and no worse nRMSE than video, full code, saved8B direct and the completed same27B direct control. Explanation faithfulness remains incomplete.

## Limits

- Only eight exposed counterfactual questions, not all 48 Gerstenberg2021 questions or an untouched holdout.
- Adds physical computation and source-supplied mechanics; it is not a format-only ablation or unaided video baseline.
- Box approximation differs from the source circular-body engine. Unsupported corner/contact states remain.
- Some explanations turn unresolved stops into definite success or failure; high R2 does not establish faithful uncertainty handling.
- Partial-reference geometry and historical source-identity caveats do not constitute a complete oracle.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- coggym_static_gate_own_direct_20261029_v1 / summary.json: `fcf722298c77a94bab44008f6d76185c2cc8993cbc45188d8e72c3df76236fd0`.
- docs / COGGYM_STATIC_GATE_OWN_DIRECT_2026-10-29.md: `2cd2b66526521c1524d9d89f0d25dde7430b631b621476176caed39fc9d6cda0`.
