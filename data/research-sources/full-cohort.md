# Frozen Full-Cohort Comparison

Snapshot: 5 November 2026, Asia/Shanghai. This is a one-run scoring correction over already frozen predictions, not a new model result or complete official replication.

## Population And Status

490 questions, 188 declared source IDs, 13 studies, 24 experiments and 1,280 canonical scalar items per condition. Five conditions yield 2,450 question-condition records: 2,432 complete, two execution failures, four invalid and 12 overlength. All attempts are accounted for; valid-answer coverage is not 100%.

The fixed primary includes 22 experiments, 487 questions and 1,277 scalars. Beller2025/exp1 (one question) and Stephan2021/exp2 (two questions) are diagnostics. They are retained in the all-study inventory, not added to primary scores.

All conditions use Qwen3.5-27B FP16, native non-thinking greedy reasoning. The direct-code source is saved Qwen3-VL-8B-Instruct parsing, not a fresh same-27B parsing run. Partial-reference evidence is not a complete physical oracle.

## Metric Contract

For each experiment, average squared Pearson correlation equally over native response regime/scale groups; then average experiments equally. The local policy requires at least three scalar items per type, treats exact zero variance as undefined, and propagates missing/undefined types through strict aggregates. It uses one run, no ten-run replication and no human split-half estimate. R2 is not accuracy, and squaring removes the sign of correlation.

All five strict fixed22 R2 values are undefined. The video condition is complete but still structurally undefined because two Zhou2023/exp1 types contain only one and two scalar items.

## Shared Diagnostic Panel

Exactly the same 15 complete-and-defined primary experiments, 410 questions and 1,067 scalars are used in every row. This is a selected diagnostic, not a replacement primary.

| Condition | R2 (%) | Signed r | nRMSE | Comparison status |
| --- | ---: | ---: | ---: | --- |
| Video only | 18.1010 | 0.1141 | 0.4872 | shared 15 experiments |
| Saved direct-parsed code | 22.5759 | 0.3627 | 0.4331 | shared 15 experiments |
| Full Parse Anything code | 21.5148 | 0.3115 | 0.4402 | shared 15 experiments |
| Task-conditioned evidence | 27.0152 | 0.2871 | 0.4111 | shared 15 experiments |
| Partial-reference evidence | 13.5319 | 0.2489 | 0.4730 | shared 15 experiments |

Here nRMSE and signed r use equal-type/equal-experiment averaging. Scalar-within-experiment nRMSE is separately preserved in the JSON. Task evidence has higher R2 and lower normalized error on this shared panel, but lower signed r than both code controls. This does not establish robust full-cohort superiority.

## All 13 Studies

These columns use the fixed primary experiments within each study; Q includes its diagnostic questions. The JSON separately retains strict all-experiment scores and exact primary/diagnostic memberships. Undefined cells are not zero or omitted experiments.

| Study | Q | Sources | Primary / diagnostic experiments | Video | Direct code | Full code | Task evidence | Partial reference |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Bass 2022 | 42 | 20 | 1 / 0 | 50.2676 | 51.5046 | 52.4721 | 50.3556 | 50.3384 |
| Beller 2020 | 20 | 20 | 1 / 0 | 4.4832 | 9.2203 | 7.6036 | 0.0388 | 2.2309 |
| Beller 2025 | 1 | 1 | 0 / 1 | Undefined | Undefined | Undefined | Undefined | Undefined |
| Gerstenberg 2021 | 48 | 20 | 3 / 0 | 16.2235 | Undefined | 9.4402 | 24.7770 | 8.9667 |
| Gerstenberg 2022 | 16 | 16 | 2 / 0 | 31.5425 | Undefined | 14.3281 | 13.5646 | 7.5922 |
| Hamrick 2016 | 12 | 6 | 2 / 0 | 12.8696 | 41.1460 | Undefined | Undefined | Undefined |
| Smith 2019 | 20 | 20 | 1 / 0 | 11.7806 | 0.1245 | 5.2151 | 0.0012 | 5.5302 |
| Sosa 2021 | 38 | 12 | 2 / 0 | 0.0347 | 14.5125 | 54.1463 | 49.3853 | 5.5797 |
| Sosa 2025 | 32 | 20 | 2 / 0 | 26.5629 | 50.6892 | 19.0340 | 20.4177 | 3.9966 |
| Stephan 2021 | 30 | 10 | 2 / 1 | 14.4899 | 32.9757 | 21.4466 | 9.3838 | 11.6223 |
| Ullman 2018 | 181 | 20 | 1 / 0 | 0.0150 | 0.8592 | 1.7059 | 0.2851 | 0.3884 |
| Wu 2022 | 8 | 8 | 2 / 0 | 20.0198 | 21.1992 | Undefined | 71.0757 | 22.3036 |
| Zhou 2023 | 42 | 15 | 3 / 0 | Undefined | Undefined | Undefined | Undefined | Undefined |

No selected development result is substituted into this frozen comparison. Declared IDs are not a count of independent physical scenes. Historical pooled estimators and their different memberships are not interchangeable with this typed table.

## Provenance

Sanitized extract of frozen local scientific evidence. The hashes below identify the original audited documents, not this extract. No raw internal reports, individual human ratings, private paths or scheduling records are published.

- results_frozen / results.json: `39f2baf8b5217701c9455b548a6a05feeb14c0306788a6e7a73838933146fabf`.
- results_frozen / inventory.json: `8f901be77bda73a0e773d2cb720292fe7f8c62423c12bd54a92f9f4b7d5582bc`.
- results_frozen / REPORT.md: `d12350a877c5e0c047c560e7587e954c49002fb9875eb15db77513575a6803b2`.
