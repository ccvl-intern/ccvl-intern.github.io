import unittest

from build_parsing_throughput import throughput


class ThroughputTests(unittest.TestCase):
    def fixture(self):
        rows = [{"sample_id": "a", "slurm_job_id": "1", "sampled_frame_count": "16"},
                {"sample_id": "b", "slurm_job_id": "2", "sampled_frame_count": "32"}]
        summary = {"shard_count": 2, "sample_count": 2, "status": "passed",
                   "timing_cache_hit_count": 0, "worker_wall_time_sec": 100, "source_revision": "test"}
        devices = {"device": {"profiles": [{
            "cuda": {"devices": [{"name": "NVIDIA RTX A5000"}]},
            "slurm": {"SLURM_JOB_ID": job, "SLURM_GPUS_ON_NODE": "1"},
        } for job in ("1", "2")]}}
        return rows, summary, devices

    def test_frames_divided_by_summed_worker_time(self):
        result = throughput(*self.fixture())
        self.assertEqual(result["images_per_second_per_gpu"], 0.48)
        self.assertEqual(result["sampled_frame_count"], 48)

    def test_rejects_multiple_gpus(self):
        rows, summary, devices = self.fixture()
        devices["device"]["profiles"][0]["slurm"]["SLURM_GPUS_ON_NODE"] = "2"
        with self.assertRaises(ValueError):
            throughput(rows, summary, devices)

    def test_rejects_cache_hits(self):
        rows, summary, devices = self.fixture()
        summary["timing_cache_hit_count"] = 1
        with self.assertRaises(ValueError):
            throughput(rows, summary, devices)

    def test_rejects_invalid_time(self):
        for time in (0, -1, float("nan")):
            rows, summary, devices = self.fixture()
            summary["worker_wall_time_sec"] = time
            with self.assertRaises(ValueError):
                throughput(rows, summary, devices)


if __name__ == "__main__":
    unittest.main()
