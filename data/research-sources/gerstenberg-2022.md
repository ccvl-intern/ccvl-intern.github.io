# Gerstenberg 2022: common-schema timeline

Frozen pre-unification development evidence. These are historically exposed questions, not held-out validation or a full-cohort result.

## Task

Experiment 2: conditional gate passage under the original intervention.

Population: 8 questions, 8 source/scene units, 8 scalar items per condition. Declared source and question counts must not be treated as independent scene replications.

## Method

Instantiate the intervened scene from parsed geometry and motion, update velocity after supported contacts, and hand the bounded timeline to the VLM.

1. Retain source geometry, clocks, intervention and shared source-derived mechanism assumptions.
2. Search for supported contacts in the intervened scene and compute their velocity consequences.
3. Record the resulting event sequence, crossing predicates, stop reasons and unsupported dependencies.
4. Use one source-independent explanation-first answer schema for every arm.
5. Ask the reasoner for the original continuous rating, not a program-assigned probability.

## Saved Results

Single slider response type; the common-schema comparison is distinct from earlier schema-dependent results.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video + shared mechanisms | 9.2751 | -0.3045 | 0.6029 | matched common mechanisms |
| Saved 8B-Thinking direct code + mechanisms | Undefined | Undefined | 0.5949 | matched common mechanisms |
| Full code + mechanisms | 7.7665 | 0.2787 | 0.4925 | matched common mechanisms |
| Predicted numerical timeline | 93.4629 | 0.9668 | 0.2145 | matched common mechanisms |
| Factual-reference numerical timeline | 61.1476 | 0.7820 | 0.3105 | partial reference not upper bound |

## Decision

The direct-code answers are constant, so its correlation is undefined. Both timelines beat the defined controls and reduce error, but the strict all-control R2 gate does not pass.

## Limits

- Eight exposed cases, not held-out validation or the full study.
- Direct parsing is saved8B, not the 27B reasoner. Video receives the shared mechanism rules.
- The reference result is 61.15% in this matched schema; an older 95.27% result uses a different schema and cannot replace it.
- A reference explanation correctly describes no crossing within the horizon but emits a high supporting rating; explanation/answer polarity and calibration remain unresolved.
- Event-order agreement and good anchor geometry do not imply identical judgments or a complete oracle.
## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- coggym_clean_chain_controls_20261029_v1 / summary.json: `6a58647dab9e58f788309b71555c461689f7b7cd23dc2d6c7104b702a13e7f0b`.
- docs / COGGYM_CLEAN_CHAIN_CONTROLS_2026-10-29.md: `c8c3e47c548537d8bc5226b67d75b716c9a819a70cc43957bfdb16dabda0477c`.
