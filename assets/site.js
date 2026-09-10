"use strict";

const state = { results: null, code: null, reasoning: null, videoOnly: null, studyReasoning: null, throughput: null, paused: matchMedia("(prefers-reduced-motion: reduce)").matches };
const $ = selector => document.querySelector(selector);
const percent = (value, digits = 2) => value == null ? "N/A" : `${(value * 100).toFixed(digits)}%`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const metricPair = (mean, sd) => `${percent(mean)} <span class="deviation">± ${percent(sd)}</span>`;
const figureObserver = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => loadFigureImage(entry.target));
}, { rootMargin: "80px" });

function loadFigureImage(img) {
  if (!img.dataset.src) return;
  img.src = img.dataset.src;
  delete img.dataset.src;
  figureObserver.unobserve(img);
}

function observeFigures(root = document) {
  root.querySelectorAll("img[data-src]").forEach(img => figureObserver.observe(img));
}

const scenes = [
  ["bass2022_partial", "bass-cannonball", "Bass et al., 2022", "2d", 1292, 382],
  ["beller2020_language", "beller2020-language", "Beller et al., 2020", "2d", 1292, 536],
  ["beller2025_multimodal", "beller-plinko", "Beller et al., 2025", "2d", 1260, 576],
  ["gerstenberg2021_counterfactual", "gerstenberg-collision", "Gerstenberg et al., 2021", "2d", 1292, 536],
  ["gerstenberg2022_what", "gerstenberg2022-what", "Gerstenberg et al., 2022", "2d", 1292, 536],
  ["hamrick2016_inferring", "hamrick-tower", "Hamrick et al., 2016", "frozen3d", 1292, 536],
  ["smith2019_modeling", "smith-discontinuity", "Smith et al., 2019", "dynamic3d", 1292, 483],
  ["sosa2021_moral", "sosa2021-moral", "Sosa et al., 2021", "2d", 1292, 416],
  ["sosa2025_blending", "sosa2025-blending", "Sosa et al., 2025", "2d", 844, 576],
  ["stephan2021_counterfactual", "stephan-counterfactual", "Stephan et al., 2021", "2d", 1292, 535],
  ["ullman2018_learning", "ullman-rules", "Ullman et al., 2018", "2d", 1292, 536],
  ["wu2022_that", "wu-gridworld", "Wu et al., 2022", "2d", 1292, 252],
];

function syntaxHighlightJson(value) {
  return escapeHtml(value).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;\s*:|&quot;(?:[^&]|&(?!quot;))*?&quot;|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g, match => {
    let type = "json-number";
    if (match.startsWith("&quot;")) type = /:$/.test(match) ? "json-key" : "json-string";
    else if (/^(true|false|null)$/.test(match)) type = "json-boolean";
    return `<span class="${type}">${match}</span>`;
  });
}

function formatUnifiedCode(code) {
  const lines = ["{"];
  const metadata = Object.entries(code).filter(([key]) => key !== "frames");
  metadata.forEach(([key, value]) => lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)},`));
  lines.push('  "frames": [');
  code.frames.forEach((frame, index) => {
    lines.push("    {");
    Object.entries(frame).forEach(([key, value], fieldIndex, fields) => {
      lines.push(`      ${JSON.stringify(key)}: ${JSON.stringify(value)}${fieldIndex < fields.length - 1 ? "," : ""}`);
    });
    lines.push(`    }${index < code.frames.length - 1 ? "," : ""}`);
  });
  lines.push("  ]", "}");
  return lines.join("\n");
}

function renderHeadline() {
  const { results, reasoning } = state;
  $('[data-stat="samples"]').textContent = results.corpus.sample_count;
  $('[data-stat="studies"]').textContent = results.corpus.study_count;
  $('[data-stat="mean-iou"]').textContent = percent(results.geometry.mean_sample_iou);
  $('[data-stat="iou-sd"]').textContent = `± ${percent(results.geometry.sample_iou_std)} SD`;
  $('[data-stat="questions"]').textContent = reasoning.question_split.total;
  $('[data-question-group="non"]').textContent = reasoning.question_split.non_uncertainty;
  $('[data-question-group="unc"]').textContent = reasoning.question_split.uncertainty;
}

function renderDemo() {
  const { demo } = state.reasoning;
  $("#demo-question").textContent = demo.question;
  $("#demo-answer").textContent = demo.model_answer;
  $("#demo-reference").textContent = `Objective reference: ${demo.objective_reference}`;
  $("#demo-reasoner").textContent = `${demo.reasoner} · original video + question + abstracted code · context ratio ${demo.abstraction_ratio}`;
  $("#code-output").innerHTML = syntaxHighlightJson(formatUnifiedCode(state.code));
}

function renderSplitComparisons() {
  for (const group of ["non", "unc"]) {
    $(`#paired-${group}`).innerHTML = state.reasoning.matched_comparisons.filter(row => row.group === group).map(row => `
      <article class="paired-row">
        <div class="paired-label"><strong>${escapeHtml(row.reasoner)}</strong><span>${row.n} matched experiments</span></div>
        <div class="paired-bars">
          <div class="direct"><span>VLM full</span><i aria-hidden="true"><b style="width:${row.direct * 200}%"></b></i><strong>${percent(row.direct)}</strong></div>
          <div><span>Parser full</span><i aria-hidden="true"><b style="width:${row.full * 200}%"></b></i><strong>${percent(row.full)}</strong></div>
          <div class="abstracted"><span>Abstracted</span><i aria-hidden="true"><b style="width:${row.abstracted * 200}%"></b></i><strong>${percent(row.abstracted)}</strong></div>
        </div>
      </article>`).join("");
  }
}

function splitMetricCell(metric) {
  return metric.r2 == null ? 'N/A<small>no valid experiments</small>' : `${percent(metric.r2)}<small>n = ${metric.n}</small>`;
}

function renderVideoOnlyTable() {
  $("#video-only-table-body").innerHTML = state.videoOnly.models.map(row =>
    `<tr><th scope="row">${escapeHtml(row.model)}</th><td>${percent(row.mean_experiment_r2)}</td></tr>`
  ).join("");
}

function renderReasoningTable() {
  if (!state.reasoning) return;
  const filter = $("#reasoning-filter").value;
  const sectionLabels = {
    direct_vlm: "Direct VLM parsing + corresponding VLM reasoning",
    gt_abstraction: "Ground-truth parsing + task-specific abstraction",
    predicted_parsing: "Unified Parser + corresponding VLM reasoning",
  };
  let priorSection = null;
  const output = [];
  state.reasoning.conditions.filter(row => filter === "all" || row.section === filter).forEach(row => {
    if (row.section !== priorSection) {
      output.push(`<tr class="method-group"><th colspan="5" scope="colgroup">${sectionLabels[row.section]}</th></tr>`);
      priorSection = row.section;
    }
    const abstracted = row.parsing.includes("abstraction");
    const evidence = row.section === "direct_vlm" ? "Direct parsed code" : row.section === "gt_abstraction" ? "GT + abstraction" : abstracted ? "Task-specific abstraction" : "Full parsed code";
    const ratio = row.ratio == null ? "" : `<small>context ratio ${row.ratio}</small>`;
    output.push(`<tr${abstracted ? ' class="emphasis"' : ""}>
      <th scope="row">${escapeHtml(row.reasoner)}</th>
      <td>${evidence}${ratio}</td>
      <td>${abstracted ? "<b>" : ""}${percent(row.overall)}${abstracted ? "</b>" : ""}</td>
      <td>${splitMetricCell(row.non)}</td>
      <td>${splitMetricCell(row.unc)}</td>
    </tr>`);
  });
  $("#reasoning-table-body").innerHTML = output.join("");
}

function renderParsingTable() {
  if (!state.results) return;
  const interval = $("#rpe-interval").value;
  const label = { "1_frame": "1 frame", "0_5_sec": "0.5s", "1_sec": "1s" }[interval];
  $("#rpe-column").textContent = `Center RPE@${label} (%) ↓`;
  const names = {
    Any4D: "SAM3.1 + Any4D + SpatialTrackerV2",
    "Trace Anything": "SAM3.1 + VGGT-Ω + Trace Anything",
    MotionCrafter: "SAM3.1 + VGGT-Ω + MotionCrafter",
    ParseAnything: "SAM3.1 + VGGT-Ω + SpatialTrackerV2",
  };
  const groups = { VLM: "Direct VLM parsing", "Parsing Models": "Unified Parser · component variants", Ours: "Unified Parser · default" };
  let priorGroup = null;
  const output = [];
  state.results.parsing_baselines.methods.forEach(row => {
    if (row.group !== priorGroup) {
      output.push(`<tr class="method-group"><th colspan="3" scope="colgroup">${groups[row.group]}</th></tr>`);
      priorGroup = row.group;
    }
    output.push(`<tr${row.group === "Ours" ? ' class="emphasis"' : ""}><th scope="row">${escapeHtml(names[row.method] || row.method)}</th><td>${metricPair(row.mean_iou, row.sample_iou_std)}</td><td>${metricPair(row[`rpe_${interval}`], row[`rpe_${interval}_std`])}</td></tr>`);
  });
  $("#parsing-method-table-body").innerHTML = output.join("");
  const ours = state.results.parsing_baselines.methods.find(row => row.group === "Ours");
  $("#parsing-summary").innerHTML = `<div><span>Unified Parser · mIoU</span><strong>${metricPair(ours.mean_iou, ours.sample_iou_std)}</strong></div><div><span>Normalized Center RPE@${label}</span><strong>${metricPair(ours[`rpe_${interval}`], ours[`rpe_${interval}_std`])}</strong></div>`;
}

function renderStudies() {
  $("#study-bars").innerHTML = state.results.geometry.studies.map(study => {
    const dimension = /hamrick|smith/.test(study.id) ? "3D" : "2D";
    return `<div class="mini-bar-row" data-dimension="${dimension}" title="${escapeHtml(study.id)} · ${dimension} bbox">
      <span>${escapeHtml(study.label)}</span><div class="mini-bar-track" aria-hidden="true"><div class="mini-bar-fill" style="width:${study.mean_iou * 100}%"></div></div><strong>${percent(study.mean_iou)}</strong>
    </div>`;
  }).join("");
}

function renderStudyReasoning() {
  if (!state.studyReasoning) return;
  const model = state.studyReasoning.models.find(row => row.reasoner === $("#study-reasoner").value);
  const n = model.studies.reduce((total, row) => total + row.n, 0);
  $("#study-reasoning-status").textContent = `Context ratio ${model.abstraction_ratio} · ${model.studies.length} studies · ${n} matched experiments`;
  $("#study-reasoning-body").innerHTML = model.studies.map(row => {
    const changes = [row.delta, row.delta_vs_video_only].map(value => {
      const change = Number((value * 100).toFixed(2));
      const style = change > 0 ? "positive" : change < 0 ? "negative" : "";
      return `<td class="${style}">${change > 0 ? "+" : ""}${change.toFixed(2)}</td>`;
    }).join("");
    return `<tr data-study="${escapeHtml(row.study)}"><th scope="row">${escapeHtml(row.label)}<small>${row.experiments.map(item => escapeHtml(item.experiment)).join(", ")} · n = ${row.n}</small></th><td>${(row.video_only * 100).toFixed(2)}</td><td>${(row.full * 100).toFixed(2)}</td><td><b>${(row.abstracted * 100).toFixed(2)}</b></td>${changes}</tr>`;
  }).join("");
}

function renderTiming() {
  const timing = state.throughput;
  $("#efficiency-summary").innerHTML = [
    [timing.images_per_second_per_gpu.toFixed(3), "Images / second / GPU"],
    [timing.sampled_frame_count.toLocaleString("en-US"), "Sampled input images"],
    [timing.sample_count, "Samples"],
  ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
  $("#stage-timing").innerHTML = `<tr><th scope="row">Unified Parser<small>Qwen3-VL-8B-Instruct + SAM3.1 + VGGT-Ω + SpatialTrackerV2</small></th><td>RTX A5000</td><td><b>${timing.images_per_second_per_gpu.toFixed(3)}</b></td></tr>`;
}

function renderRefinement() {
  const pilot = state.results.parsing_baselines.refinement_pilot;
  if (pilot.status !== "accepted") {
    $("#refinement-summary").textContent = `${pilot.samples}-sample pilot · ${pilot.label}`;
    return;
  }
  $("#refinement-summary").innerHTML = `<span>${pilot.samples}-sample Hamrick pilot · mIoU</span><strong>${percent(pilot.before_mean_iou)} → ${percent(pilot.after_mean_iou)}</strong><small>SD ${percent(pilot.before_sample_iou_std)} → ${percent(pilot.after_sample_iou_std)} · ${pilot.changed_codes}/${pilot.samples} codes changed</small>`;
}

function renderGallery() {
  $("#demo-grid").innerHTML = scenes.map(([studyId, file, label, mode, width, height]) => {
    const study = state.results.geometry.studies.find(row => row.id === studyId);
    return `<article class="demo-card" data-mode="${mode}">
      <div class="animation-frame"><img id="gif-${file}" class="animated-media" data-src="assets/demos/${file}.gif" alt="${escapeHtml(label)}: original video at left, bbox-only reconstruction at right" width="${width}" height="${height}"></div>
      <div class="demo-caption"><div><h3>${label}</h3><p>${mode === "2d" ? "2D" : "3D"} boxes · Study mIoU <span>${percent(study.mean_iou)}</span></p></div><button class="icon-button" data-expand="gif-${file}" aria-label="Enlarge ${label} comparison" title="Enlarge comparison"><img src="assets/icons/maximize-2.svg" alt=""></button></div>
    </article>`;
  }).join("");
  $("#gallery-status").textContent = `${scenes.length} examples`;
  document.querySelectorAll("#demo-grid .animated-media").forEach(bindMotionImage);
  observeFigures($("#demo-grid"));
}

// Freeze only the displayed GIF; source assets and reconstruction data are untouched.
function freezeImage(img) {
  if (!img.complete || !img.naturalWidth || img.nextElementSibling?.matches("canvas")) return;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.setAttribute("aria-hidden", "true");
  canvas.getContext("2d").drawImage(img, 0, 0);
  img.after(canvas);
  img.classList.add("motion-paused");
}

function unfreezeImage(img) {
  if (img.nextElementSibling?.matches("canvas")) img.nextElementSibling.remove();
  img.classList.remove("motion-paused");
}

function bindMotionImage(img) {
  img.addEventListener("load", () => { if (state.paused) freezeImage(img); });
  if (state.paused) freezeImage(img);
}

function syncMotionButtons() {
  document.querySelectorAll("[data-toggle-motion]").forEach(button => {
    const label = state.paused ? "Play animations" : "Pause animations";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.querySelector("img").src = `assets/icons/${state.paused ? "play" : "pause"}.svg`;
  });
}

function setPaused(paused) {
  state.paused = paused;
  document.querySelectorAll(".animated-media").forEach(img => paused ? freezeImage(img) : unfreezeImage(img));
  syncMotionButtons();
}

function openFigure(id) {
  const source = document.getElementById(id);
  if (!source) return;
  loadFigureImage(source);
  const target = $("#dialog-image");
  unfreezeImage(target);
  target.classList.toggle("animated-media", source.src.endsWith(".gif"));
  $("#figure-dialog [data-toggle-motion]").hidden = !source.src.endsWith(".gif");
  target.src = source.src;
  target.alt = source.alt;
  $("#dialog-title").textContent = source.alt;
  $("#dialog-download").href = source.src;
  $("#dialog-download").download = source.src.split("/").pop();
  $("#figure-dialog").showModal();
  if (state.paused && target.classList.contains("animated-media")) freezeImage(target);
}

function activateTab(tab) {
  document.querySelectorAll('[role="tab"]').forEach(button => {
    const selected = button === tab;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.getElementById(button.getAttribute("aria-controls")).hidden = !selected;
  });
}

function bindInteractions() {
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.title = "Open navigation";
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    toggle.title = open ? "Close navigation" : "Open navigation";
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeNav(); });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", event => {
      const target = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
      if (target == null) return;
      event.preventDefault();
      activateTab(tabs[target]);
      tabs[target].focus();
    });
  });
  const openLinkedTab = () => {
    const tab = tabs.find(button => button.getAttribute("aria-controls") === location.hash.slice(1));
    if (!tab) return;
    activateTab(tab);
    $(".results-nav").scrollIntoView({ block: "start" });
  };
  addEventListener("hashchange", openLinkedTab);
  openLinkedTab();
  $("#reasoning-filter").addEventListener("change", renderReasoningTable);
  $("#study-reasoner").addEventListener("change", renderStudyReasoning);
  $("#rpe-interval").addEventListener("change", renderParsingTable);
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    let count = 0;
    document.querySelectorAll(".demo-card").forEach(card => {
      card.hidden = button.dataset.filter !== "all" && card.dataset.mode !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    $("#gallery-status").textContent = `${count} ${count === 1 ? "example" : "examples"}`;
  }));
  document.addEventListener("click", event => {
    const expand = event.target.closest("[data-expand]");
    if (expand) openFigure(expand.dataset.expand);
    if (event.target.closest("[data-toggle-motion]")) setPaused(!state.paused);
  });
  $("#dialog-close").addEventListener("click", () => $("#figure-dialog").close());
  $("#figure-dialog").addEventListener("click", event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
  });
  $("#dialog-image").addEventListener("load", event => {
    if (state.paused && event.target.classList.contains("animated-media")) freezeImage(event.target);
  });
  $("#retry-data").addEventListener("click", loadData);
  document.querySelectorAll(".animated-media").forEach(bindMotionImage);
  syncMotionButtons();
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", event => setPaused(event.matches));
}

async function loadData() {
  $("#data-error").hidden = true;
  try {
    const names = ["results", "hamrick_code", "reasoning_results", "video_only_results", "study_reasoning_results", "parsing_throughput"];
    const data = await Promise.all(names.map(async name => {
      const response = await fetch(`data/${name}.json?v=20260909-direct-delta`);
      if (!response.ok) throw new Error(`Could not load ${name} (${response.status})`);
      return response.json();
    }));
    [state.results, state.code, state.reasoning, state.videoOnly, state.studyReasoning, state.throughput] = data;
    renderHeadline();
    renderDemo();
    renderSplitComparisons();
    renderReasoningTable();
    renderVideoOnlyTable();
    renderParsingTable();
    renderStudies();
    renderStudyReasoning();
    renderTiming();
    renderRefinement();
    renderGallery();
    document.body.dataset.ready = "true";
  } catch (error) {
    $("#data-error").hidden = false;
    $("#code-output").textContent = "Example unavailable. See the data loading error in Results.";
    console.error(error);
  }
}

document.addEventListener("site:unlocked", () => {
  bindInteractions();
  observeFigures();
  loadData();
}, { once: true });
