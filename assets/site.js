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

function formatUnifiedCode(code) {
  const lines = ["{"];
  const metadata = Object.entries(code).filter(([key]) => key !== "frames");
  metadata.forEach(([key, value]) => lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)},`));
  lines.push('  "frames": [');
  code.frames.forEach((frame, frameIndex) => {
    const comma = frameIndex < code.frames.length - 1 ? "," : "";
    lines.push(`    {"t": ${frame.t}, "timestamp_sec": ${frame.timestamp_sec}, "source_frame": ${frame.source_frame},`);
    lines.push(`      "bbox_2d": ${JSON.stringify(frame.bbox_2d)}, "center_2d": ${JSON.stringify(frame.center_2d)}, "mask_score": ${frame.mask_score},`);
    lines.push(`      "camera_intrinsics": ${JSON.stringify(frame.camera_intrinsics)},`);
    lines.push(`      "camera_pose": ${JSON.stringify(frame.camera_pose)},`);
    lines.push(`      "camera_roundtrip_error_px": ${frame.camera_roundtrip_error_px},`);
    lines.push(`      "center_3d": ${JSON.stringify(frame.center_3d)},`);
    lines.push(`      "bbox_3d_center": ${JSON.stringify(frame.bbox_3d_center)}, "bbox_3d_size": ${JSON.stringify(frame.bbox_3d_size)},`);
    lines.push(`      "bbox_3d_rotation": ${JSON.stringify(frame.bbox_3d_rotation)},`);
    lines.push(`      "bbox_3d_source": ${JSON.stringify(frame.bbox_3d_source)}, "bbox_3d_confidence": ${frame.bbox_3d_confidence},`);
    lines.push(`      "visibility": ${frame.visibility}}${comma}`);
  });
  lines.push("  ]");
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
    <div class="mini-bar-row" title="${study.label}: ${percent(study.mean_iou)} mIoU">
      <span>${study.label}</span>
      <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${study.mean_iou * 100}%"></div></div>
      <strong>${percent(study.mean_iou, 1)}</strong>
    </div>
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
    <div><span>Corpus evaluated</span><strong>${ours.evaluated_samples}</strong><small>Physics-280</small></div>`;

  document.querySelector("#direct-vlm-table-body").innerHTML = baselines.direct_vlm.map(row => `
    <tr><td>${row.method}</td><td>280</td><td>${percent(row.mean_iou)}</td></tr>
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
  renderTiming(state.results.timing);
  renderParsingBaselines(state.results.parsing_baselines);
  renderRefinement(state.results.parsing_baselines.refinement_pilot);
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
