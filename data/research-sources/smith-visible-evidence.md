# Smith: source-aligned visible evidence

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Physical-event expectation/surprise judgments on five exposed examples.

Population: 5 questions, 5 source/scene units, 5 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Deliver complete source-aligned visible object states and relations under the frozen answer-only protocol, keeping predicted and recovered visible-reference inputs distinct.

1. Bind original sampled frames and timestamps to all saved object observations.
2. Use image-plane centers/boxes, visible identities and explicit unknowns; retain every source state and pair.
3. Render predicted observations and recovered visible-reference observations with the same graph method.
4. Keep the original video, task, answer-only schema and native decoding.
5. Score the frozen ratings without inventing explanations for answer-only outputs.

## Saved Results

One scalar rating per question. A high squared correlation with negative signed r is not correct-direction success.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video, clean cached control | 12.2806 | 0.3504 | 0.6336 | matched input contract |
| Clean direct-code control unavailable | Undefined | Undefined | Undefined | Unavailable clean control |
| Clean full-code control unavailable | Undefined | Undefined | Undefined | Unavailable clean control |
| Predicted image graph | 2.8566 | -0.1690 | 0.4413 | matched input contract |
| Original visible-reference graph | 52.6802 | 0.7258 | 0.3311 | visible reference not physical oracle |

## Decision

Predicted graph r is negative and R2 is below clean video. Clean code-control superiority is unavailable because cached direct/full prompts contain condition-bearing administrative names.

## Limits

- All ten cached code-control prompts are contaminated. Their historical metrics are preserved separately, not displayed as clean comparison scores.
- Five questions are only a subset of the 20-question study; not held out.
- Visible-reference evidence improves the local result but does not certify physical identity, hidden state or a complete oracle.
- Answer-only outputs support no invented rationale. Improved geometry does not isolate the cause of remaining judgment errors.

## Preserved Contaminated Numbers

Historical unblinded direct code:95.2402% R2, signed r+0.9759, nRMSE0.1912. Historical unblinded full code:46.3531%, r+0.6808, nRMSE0.3436. Both contain condition-bearing administrative names. They are retained for provenance, not available as clean controls or fair superiority evidence.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- verified / summary.json: `f2fd902d4e7d547f2a4e1d16ba3d6baa08977579b41dc341c2999402a02636d6`.
- docs / COGGYM_SMITH_IMAGE_ANSWER_2026-10-28.md: `27b840032ecd4d61b7ca96d93b5abab7a7d5dd575cd56fe8314cee85a0a449ac`.
