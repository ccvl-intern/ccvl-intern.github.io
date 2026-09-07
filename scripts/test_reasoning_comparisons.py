import unittest

from build_reasoning_comparisons import CONDITIONS, matched_comparisons


def sample_report():
    rows = []
    for model, ratio in CONDITIONS:
        names = (model, f"Unified Parser / {model}", f"Task-specific Abstraction / {model} (r={ratio})")
        for index, name in enumerate(names):
            rows.append({
                "display_name": name,
                "condition_root": "model_own_cutoff_code" if index == 0 else "parser_run",
                "mapped_item_coverage_sha256": "same-items",
                "experiments": [{
                    "experiment": experiment,
                    "r2": {group: value for group in ("non_uncertainty", "uncertainty")},
                } for experiment, value in (
                    ("study/a", (index + 1) / 10),
                    ("study/b", (index + 1) / 5),
                    ("study/constant", None if index == 0 else 0.9),
                )],
            })
    return {"conditions": rows, "mapped_item_coverage_sha256": "same-items"}


class MatchedComparisonTests(unittest.TestCase):
    def test_means_share_three_way_intersection(self):
        result = matched_comparisons(sample_report())
        self.assertEqual(len(result), 6)
        for row in result:
            self.assertEqual(row["n"], 2)
            self.assertEqual(row["experiments"], ["study/a", "study/b"])
            for key, expected in (("direct", 0.15), ("full", 0.3), ("abstracted", 0.45)):
                self.assertAlmostEqual(row[key], expected)

    def test_rejects_different_items(self):
        report = sample_report()
        report["conditions"][0]["mapped_item_coverage_sha256"] = "different-items"
        with self.assertRaisesRegex(ValueError, "coverage differs"):
            matched_comparisons(report)

    def test_rejects_video_only_run(self):
        report = sample_report()
        report["conditions"][0]["condition_root"] = "model_video_only"
        with self.assertRaisesRegex(ValueError, "own parsed-code"):
            matched_comparisons(report)

    def test_rejects_missing_experiment(self):
        report = sample_report()
        report["conditions"][0]["experiments"].pop()
        with self.assertRaisesRegex(ValueError, "Experiment coverage differs"):
            matched_comparisons(report)

    def test_rejects_empty_intersection(self):
        report = sample_report()
        for item in report["conditions"][0]["experiments"]:
            item["r2"]["uncertainty"] = None
        with self.assertRaisesRegex(ValueError, "No common valid experiments"):
            matched_comparisons(report)


if __name__ == "__main__":
    unittest.main()
