import unittest

from build_reasoning_comparisons import (CONDITIONS, VIDEO_MODEL_SLUGS, matched_comparisons,
                                        matched_study_comparisons as build_studies)


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


def study_report():
    report = sample_report()
    for condition in report["conditions"]:
        for index, row in enumerate(condition["experiments"]):
            row["experiment"] = ("Beller2020Language/exp1", "Beller2020Language/exp2",
                                 "Bass2022Partial/exp1")[index]
            row["r2"]["all"] = row["r2"]["non_uncertainty"]
            row["item_counts"] = {"all": 4 if index == 0 else 40}
        if condition["display_name"].startswith("Unified Parser / "):
            condition["experiments"][2]["r2"]["all"] = None
    return report


def video_report():
    return {"models": [{"model_slug": slug, "status": "passed", "question_count": 636,
        "coggym": {"experiments": [
            {"experiment": "Beller2020Language/exp1", "r2_pooled": 0.1, "predicted_item_count": 4},
            {"experiment": "Beller2020Language/exp2", "r2_pooled": 0.2, "predicted_item_count": 40},
            {"experiment": "Bass2022Partial/exp1", "r2_pooled": 0.9, "predicted_item_count": 40},
        ]}} for slug in VIDEO_MODEL_SLUGS.values()]}


def matched_study_comparisons(report):
    return build_studies(report, video_report())


class StudyComparisonTests(unittest.TestCase):
    def test_matched_mean_is_per_experiment_not_item_weighted(self):
        models = matched_study_comparisons(study_report())
        self.assertEqual(len(models), 3)
        for model in models:
            self.assertEqual(len(model["studies"]), 1)
            row = model["studies"][0]
            self.assertEqual(row["n"], 2)
            self.assertEqual([e["experiment"] for e in row["experiments"]], ["exp1", "exp2"])
            self.assertAlmostEqual(row["full"], 0.3)
            self.assertAlmostEqual(row["video_only"], 0.15)
            self.assertAlmostEqual(row["abstracted"], 0.45)
            self.assertAlmostEqual(row["delta"], 0.15)
            self.assertAlmostEqual(row["delta_vs_video_only"], 0.30)
            self.assertEqual(model["excluded_experiments"], ["Bass2022Partial/exp1"])

    def test_zero_is_valid_and_decreases_are_retained(self):
        report = study_report()
        for condition in report["conditions"]:
            if condition["display_name"].startswith("Task-specific Abstraction / "):
                for row in condition["experiments"]:
                    row["r2"]["all"] = 0.0
        for model in matched_study_comparisons(report):
            row = model["studies"][0]
            self.assertEqual(row["abstracted"], 0.0)
            self.assertAlmostEqual(row["delta"], -0.3)
            self.assertAlmostEqual(row["delta_vs_video_only"], -0.15)

    def test_direct_comparison_can_decrease_while_full_comparison_increases(self):
        video = video_report()
        for model in video["models"]:
            for experiment in model["coggym"]["experiments"]:
                experiment["r2_pooled"] = 0.6
        for model in build_studies(study_report(), video):
            row = model["studies"][0]
            self.assertAlmostEqual(row["delta"], 0.15)
            self.assertAlmostEqual(row["delta_vs_video_only"], -0.15)

    def test_direct_comparison_keeps_zero(self):
        video = video_report()
        for model in video["models"]:
            model["coggym"]["experiments"][0]["r2_pooled"] = 0.3
            model["coggym"]["experiments"][1]["r2_pooled"] = 0.6
        for model in build_studies(study_report(), video):
            self.assertAlmostEqual(model["studies"][0]["delta_vs_video_only"], 0.0)

    def test_no_dependence_on_direct_vlm_scores(self):
        report = study_report()
        report["conditions"] = [c for c in report["conditions"] if " / " in c["display_name"]]
        self.assertEqual(len(matched_study_comparisons(report)), 3)

    def test_invalid_metric_is_not_treated_as_missing(self):
        for value in (float("nan"), float("inf"), -0.1, 1.1, True):
            with self.subTest(value=value):
                report = study_report()
                report["conditions"][1]["experiments"][0]["r2"]["all"] = value
                with self.assertRaisesRegex(ValueError, "Invalid squared correlation"):
                    matched_study_comparisons(report)

    def test_rejects_mismatched_inputs(self):
        report = study_report()
        report["conditions"][1]["mapped_item_coverage_sha256"] = "different"
        with self.assertRaisesRegex(ValueError, "coverage differs"):
            matched_study_comparisons(report)

    def test_rejects_different_item_counts(self):
        report = study_report()
        report["conditions"][1]["experiments"][0]["item_counts"]["all"] += 1
        with self.assertRaisesRegex(ValueError, "Item counts differ"):
            matched_study_comparisons(report)

    def test_rejects_duplicate_experiments(self):
        report = study_report()
        report["conditions"][1]["experiments"].append(report["conditions"][1]["experiments"][0])
        with self.assertRaisesRegex(ValueError, "Duplicate experiment"):
            matched_study_comparisons(report)

    def test_rejects_different_experiment_sets(self):
        report = study_report()
        report["conditions"][1]["experiments"].pop()
        with self.assertRaisesRegex(ValueError, "Experiment coverage differs"):
            matched_study_comparisons(report)

    def test_rejects_all_undefined_studies(self):
        report = study_report()
        for row in report["conditions"][1]["experiments"]:
            row["r2"]["all"] = None
        with self.assertRaisesRegex(ValueError, "No common valid studies"):
            matched_study_comparisons(report)

    def test_video_missing_changes_all_three_cohorts(self):
        video = video_report()
        for model in video["models"]:
            model["coggym"]["experiments"][1]["r2_pooled"] = None
        for model in build_studies(study_report(), video):
            row = model["studies"][0]
            self.assertEqual(row["n"], 1)
            self.assertAlmostEqual(row["video_only"], 0.1)
            self.assertAlmostEqual(row["full"], 0.2)
            self.assertAlmostEqual(row["abstracted"], 0.3)
            self.assertAlmostEqual(row["delta_vs_video_only"], 0.2)

    def test_video_zero_is_valid(self):
        video = video_report()
        video["models"][0]["coggym"]["experiments"][0]["r2_pooled"] = 0
        result = build_studies(study_report(), video)
        self.assertAlmostEqual(result[0]["studies"][0]["video_only"], 0.1)

    def test_video_item_mismatch_rejected(self):
        video = video_report()
        video["models"][0]["coggym"]["experiments"][0]["predicted_item_count"] = 5
        with self.assertRaisesRegex(ValueError, "Item counts differ"):
            build_studies(study_report(), video)

    def test_incomplete_video_rejected(self):
        video = video_report()
        video["models"][0]["question_count"] = 635
        with self.assertRaisesRegex(ValueError, "Incomplete video-only"):
            build_studies(study_report(), video)


if __name__ == "__main__":
    unittest.main()
