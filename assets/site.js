const state = {
  results: null,
  code: null,
};

const percent = (value, digits = 2) => value == null ? "N/A" : `${(value * 100).toFixed(digits)}%`;

function syntaxHighlightJson(value) {
  const json = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(/("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:|"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g, match => {
    let type = "json-number";
    if (/^"/.test(match)) type = /:$/.test(match) ? "json-key" : "json-string";
    else if (/true|false/.test(match)) type = "json-boolean";
    else if (/null/.test(match)) type = "json-boolean";
    return `<span class="${type}">${match}</span>`;
  });
}

function compactObject(lines, key, value, indent, trailingComma) {
  const pad = " ".repeat(indent);
  const childPad = " ".repeat(indent + 2);
  const entries = Object.entries(value);
  lines.push(`${pad}${JSON.stringify(key)}: {`);
  entries.forEach(([childKey, childValue], index) => {
    const comma = index < entries.length - 1 ? "," : "";
    lines.push(`${childPad}${JSON.stringify(childKey)}: ${JSON.stringify(childValue)}${comma}`);
  });
  lines.push(`${pad}}${trailingComma ? "," : ""}`);
}

function formatUnifiedCode(code) {
  const identity = code.identity_relations_camera;
  const lines = ["{"];
  lines.push(`  "code_id": ${JSON.stringify(identity.code_id)},`);
  lines.push(`  "sample_id": ${JSON.stringify(identity.sample_id)},`);
  lines.push(`  "parse_mode": ${JSON.stringify(identity.parse_mode)},`);
  lines.push(`  "t": ${identity.camera.frame_offset},`);
  lines.push(`  "object": ${JSON.stringify(identity.object)},`);
  lines.push(`  "relation": ${JSON.stringify(identity.relation)},`);
  compactObject(lines, "camera", identity.camera, 2, true);
  compactObject(lines, "direct_fields", code.direct_fields, 2, true);
  compactObject(lines, "computed_fields", code.computed_fields, 2, false);
  lines.push("}");
  return lines.join("\n");
}

function renderHeadline(results) {
  document.querySelector('[data-stat="samples"]').textContent = results.corpus.sample_count;
  document.querySelector('[data-stat="studies"]').textContent = results.corpus.study_count;
  document.querySelector('[data-stat="mean-iou"]').textContent = percent(results.geometry.mean_sample_iou);
  document.querySelector('[data-stat="parsing-time"]').textContent = `${results.timing.mean_exclusive_sec_per_sample.toFixed(2)} s`;
}

function renderStudyBars(studies) {
  const root = document.querySelector("#study-bars");
  root.innerHTML = studies.map(study => `
    <div class="mini-bar-row" title="${study.label}: ${percent(study.mean_iou)} mean sample IoU">
      <span>${study.label}</span>
      <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${study.mean_iou * 100}%"></div></div>
      <strong>${percent(study.mean_iou, 1)}</strong>
    </div>
  `).join("");
}

function renderReasoning(conditions) {
  const bars = document.querySelector("#reasoning-bars");
  bars.innerHTML = conditions.map(condition => {
    const classNames = [condition.id.startsWith("gpt") ? "gpt" : "", condition.id.endsWith("full") ? "full" : ""].filter(Boolean).join(" ");
    return `
      <div class="reasoning-row ${classNames}">
        <span>${condition.label}</span>
        <div class="reasoning-track"><div class="reasoning-fill" style="width:${condition.normalized * 100}%"></div></div>
        <strong>${percent(condition.normalized, 1)}</strong>
      </div>`;
  }).join("");

  const tableBody = document.querySelector("#reasoning-table-body");
  tableBody.innerHTML = conditions.map(condition => `
    <tr>
      <td>${condition.label}</td>
      <td>${percent(condition.normalized)}</td>
      <td>${percent(condition.categorical)}</td>
      <td>${percent(condition.number_score)}</td>
      <td>${percent(condition.multi_select_f1)}</td>
      <td>${percent(condition.confidence)}</td>
    </tr>
  `).join("");
}

function renderTiming(timing) {
  const max = Math.max(...timing.stages.map(stage => stage.p95));
  document.querySelector("#stage-timing").innerHTML = timing.stages.map(stage => `
    <div class="timing-row">
      <span>${stage.label}</span>
      <div class="timing-track" title="p95 ${stage.p95.toFixed(2)} seconds"><div class="timing-fill" style="width:${(stage.p95 / max) * 100}%"></div></div>
      <strong>${stage.mean.toFixed(2)} / ${stage.median.toFixed(2)} / ${stage.p95.toFixed(2)} s</strong>
    </div>
  `).join("") + `<p class="timing-legend">Bars show P95 latency. Labels report mean / median / P95. Device: ${timing.device}; ${timing.worker_count} workers.</p>`;
}

function renderParsingBaselines(baselines) {
  const ours = baselines.parse_anything;
  document.querySelector("#parse-anything-summary").innerHTML = `
    <div><span>Parse Anything</span><strong>${percent(ours.mean_iou)}</strong><small>latest full-corpus rerun · mIoU mean ± SD ${percent(ours.sample_iou_std)}</small></div>
    <div><span>Corpus evaluated</span><strong>${ours.evaluated_samples}</strong><small>Physics-280</small></div>
    <div><span>Micro IoU</span><strong>${percent(ours.micro_iou)}</strong><small>prediction coverage ${percent(ours.prediction_coverage)}</small></div>`;

  document.querySelector("#direct-vlm-table-body").innerHTML = baselines.direct_vlm.map(row => `
    <tr><td>${row.method}</td><td>280</td><td>${percent(row.mean_iou)}</td><td>${percent(row.coverage)}</td></tr>
  `).join("");

  document.querySelector("#specialist-table-body").innerHTML = baselines.specialists.map(row => `
    <tr>
      <td>${row.method}${row.status ? `<small>${row.status}</small>` : ""}</td>
      <td>${row.evaluated_samples || "N/A"}</td>
      <td>${row.specialist_invoked_samples || "N/A"}</td>
      <td>${percent(row.mean_iou)}</td>
    </tr>
  `).join("");
}

function renderRefinement(refinement) {
  document.querySelector("#refinement-summary").innerHTML = `
    <div><span>Target-blind Hamrick pilot</span><strong>${refinement.samples} samples</strong></div>
    <div><span>mIoU</span><strong>${percent(refinement.before_mean_iou)} → ${percent(refinement.after_mean_iou)}</strong></div>
    <div><span>Center RMSE</span><strong>${refinement.before_center_rmse.toFixed(4)} → ${refinement.after_center_rmse.toFixed(4)}</strong></div>
    <div><span>Canonical codes changed</span><strong>${refinement.changed_codes} / ${refinement.samples}</strong></div>`;
}

function renderDistribution(rootSelector, entries, total) {
  const root = document.querySelector(rootSelector);
  const max = Math.max(...entries.map(([, value]) => value));
  root.innerHTML = entries.map(([label, value]) => {
    const slug = label.toLowerCase().replaceAll(" ", "-").replaceAll("_", "-");
    return `
      <div class="dist-row ${slug}">
        <span>${label.replaceAll("_", " ")}</span>
        <div class="dist-track"><div class="dist-fill" style="width:${(value / max) * 100}%"></div></div>
        <strong>${value} · ${((value / total) * 100).toFixed(1)}%</strong>
      </div>`;
  }).join("");
}

function renderErrorPropagation(data) {
  renderDistribution("#influence-chart", Object.entries(data.influence), data.effect_count);
  renderDistribution("#classification-chart", Object.entries(data.classification), data.effect_count);
}

function renderUnifiedCode() {
  const output = document.querySelector("#code-output");
  output.innerHTML = syntaxHighlightJson(formatUnifiedCode(state.code));
  output.parentElement.scrollTop = 0;
}

function bindInteractions() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".demo-card").forEach(card => { card.hidden = filter !== "all" && card.dataset.mode !== filter; });
  }));
}

async function loadData() {
  const [resultsResponse, codeResponse] = await Promise.all([fetch("data/results.json"), fetch("data/hamrick_code.json")]);
  if (!resultsResponse.ok || !codeResponse.ok) throw new Error("Unable to load structured project data.");
  state.results = await resultsResponse.json();
  state.code = await codeResponse.json();
  renderHeadline(state.results);
  renderStudyBars(state.results.geometry.studies);
  renderReasoning(state.results.reasoning.conditions);
  renderTiming(state.results.timing);
  renderParsingBaselines(state.results.parsing_baselines);
  renderRefinement(state.results.parsing_baselines.refinement_pilot);
  renderErrorPropagation(state.results.error_propagation);
  renderUnifiedCode();
}

document.addEventListener("DOMContentLoaded", async () => {
  bindInteractions();
  try {
    await loadData();
  } catch (error) {
    document.querySelector("#code-output").textContent = error.message;
    console.error(error);
  }
});
