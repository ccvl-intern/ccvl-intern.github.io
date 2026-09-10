"use strict";

(() => {
  let examples;
  let revision = 0;
  const cache = new Map();
  const el = id => document.getElementById(id);
  const text = (id, value) => { el(id).textContent = value; };
  const number = value => Number(value).toLocaleString("en-US");
  const labels = { full: "Predicted full code", abstracted: "Predicted + task-specific abstraction", oracle: "GT + task-specific abstraction" };

  function setOptions(id, rows, value) {
    el(id).replaceChildren(...rows.map(row => new Option(row.label, row.id)));
    el(id).value = value;
  }

  function setDownload(id, path) {
    const link = el(id);
    link.href = path;
    link.download = path.split("/").pop();
  }

  function renderQuestion(example) {
    const style = example.question_style;
    el("example-question-note").hidden = !style;
    if (!style) {
      text("example-question", example.question);
      return;
    }
    el("example-question").replaceChildren(...style.parts.map(part => {
      if (typeof part === "string") return document.createTextNode(part);
      const group = document.createElement("span");
      group.className = "question-color";
      const swatch = document.createElement("span");
      swatch.className = "question-swatch";
      swatch.style.backgroundColor = part.color;
      swatch.setAttribute("aria-hidden", "true");
      group.title = `${part.label}: ${part.name} (${part.color})`;
      group.append(`${part.label}: `, swatch, part.name);
      return group;
    }));
  }

  async function json(path) {
    if (!cache.has(path)) {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Example data: ${response.status}`);
      cache.set(path, await response.json());
    }
    return cache.get(path);
  }

  async function render() {
    const current = ++revision;
    const example = examples.examples.find(row => row.id === el("example-select").value);
    const condition = examples.conditions.find(row => row.model === el("example-model").value && row.kind === el("example-condition").value);
    text("example-status", "Loading saved run");
    el("examples-viewer").setAttribute("aria-busy", "true");
    el("examples-viewer").dataset.ready = "false";
    text("example-run-label", "Loading saved run…");
    text("example-run-score", "");
    el("examples-error").hidden = true;
    try {
      const recordPath = example.runs[condition.id];
      const record = await json(recordPath);
      if (current !== revision) return;
      const model = examples.models.find(row => row.id === condition.model);
      text("example-run-label", `${labels[condition.kind]}${condition.ratio == null ? "" : ` · ratio ${condition.ratio}`}`);
      text("example-run-score", `Condition R² ${(condition.r2 * 100).toFixed(2)}%`);
      const video = el("example-video");
      if (video.getAttribute("src") !== example.media.src) {
        video.pause();
        video.src = example.media.src;
        video.load();
      }
      setDownload("example-video-download", example.media.src);
      text("example-video-note", example.media.note);
      renderQuestion(example);
      text("example-question-group", example.group === "uncertainty" ? "With uncertainty" : "Without uncertainty");
      text("example-answer-schema", example.answer_format);
      text("example-prediction", record.prediction.display);
      text("example-prediction-note", record.prediction.note);
      text("example-human", record.human_reference);
      text("example-code-title", condition.kind === "oracle" ? "Supplied GT-derived code" : condition.kind === "abstracted" ? "Supplied abstracted code" : "Supplied predicted code");
      text("example-code-meta", record.code.description);
      text("example-code-label", record.code.label);
      text("example-code-size", record.code.delivered_tokens == null ? `${number(record.code.source_bytes)} bytes in code record` : `${number(record.code.delivered_tokens)} code tokens delivered`);
      text("example-code", record.code.excerpt);
      text("example-excerpt-note", record.code.excerpt_note);
      setDownload("example-code-download", record.code.download);
      setDownload("example-record-download", recordPath);
      const fields = [
        ["Reasoning model", model.label],
        ["Code source", condition.code_source],
        ["Question ID", example.id],
        ["Recorded question", example.question],
        ["Sample ID", example.sample_id],
        ["Run", condition.run],
        ["Input policy", record.input_policy],
        ["Code SHA-256", record.code.sha256],
      ];
      el("example-provenance").replaceChildren(...fields.flatMap(([label, value]) => {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        return [dt, dd];
      }));
      text("example-response", record.response);
      text("example-status", `${example.label}. ${model.label}. ${labels[condition.kind]}. Prediction: ${record.prediction.display}`);
      el("examples-loading").hidden = true;
      el("examples-viewer").hidden = false;
      el("examples-viewer").dataset.ready = "true";
    } catch (error) {
      if (current !== revision) return;
      el("examples-error").hidden = false;
      el("examples-viewer").hidden = true;
      el("examples-loading").hidden = true;
      console.error(error);
    } finally {
      if (current === revision) el("examples-viewer").removeAttribute("aria-busy");
    }
  }

  async function load() {
    el("examples-error").hidden = true;
    el("examples-loading").hidden = false;
    try {
      examples = await json("data/run_examples.json?v=20260908-colors");
      setOptions("example-select", examples.examples, examples.default_example);
      setOptions("example-model", examples.models, examples.default_model);
      await render();
    } catch (error) {
      el("examples-error").hidden = false;
      el("examples-loading").hidden = true;
      console.error(error);
    }
  }

  document.addEventListener("site:unlocked", () => {
    ["example-select", "example-model", "example-condition"].forEach(id => el(id).addEventListener("change", render));
    el("examples-retry").addEventListener("click", () => examples ? render() : load());
    load();
  }, { once: true });
})();
