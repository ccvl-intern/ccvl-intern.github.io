"use strict";

(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c]));
  const conditionOrder = ["video", "saved_direct_code", "full_code", "predictedtask", "partialoracle"];
  const verdicts = {
    bass42: ["Local improvement", "passed"], ger2021_8: ["Local comparison passed", "passed"],
    ger2022_8: ["Undefined direct-code control", "caution"], wu8: ["Component gain; full-code control undefined", "caution"],
    sosa22: ["Ties historical direct-code ceiling", "caution"], beller20: ["Below preset improvement threshold", "caution"],
    smith5: ["No improvement", "failed"], stephan8: ["Below direct code", "caution"]
  };
  const handoffs = {
    bass42: ["Event ledger", "Probability / category"],
    ger2021_8: ["Conditional timeline", "0-100 likelihood"],
    ger2022_8: ["Conditional timeline", "0-100 agreement"],
    wu8: ["Action graph + routes", "Original task judgment"],
    sosa22: ["Complete-scene graph", "Yes / No"],
    beller20: ["Interaction paths", "Causal-language choice"],
    smith5: ["Visible-state graph", "Surprise rating"],
    stephan8: ["Geometry certificate", "-50 to +50 difficulty"]
  };
  const comparabilityLabels = {
    observation_coverage_differs: "Observation coverage differs from the candidate",
    added_observation_coverage_in_candidate: "Candidate adds observed evidence",
    historical_reference_presentation: "Earlier reference presentation; not a matched Oracle",
    unmatched_clarification: "Original wording; not the clarified candidate contract",
    administrative_condition_labels_leak: "Clean comparison unavailable",
    not_run: "Matched condition not run",
    not_the_corrected_reference_baseline: "Historical reference; not the corrected base"
  };
  let data;
  let methodData;
  let studyMedia;
  let activePanel = "bass42";
  let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function number(value, digits = 2, reason = "Metric unavailable or undefined") {
    if (!Number.isFinite(value)) return `<span class="metric-missing" title="${escape(reason)}">${reason === "Not reported" ? "Not reported" : "Undefined"}</span>`;
    if (digits === 2 && value > 0 && value < 0.005) return "&lt;0.01";
    return value.toFixed(digits);
  }

  function metricRow(row, candidateId) {
    const unavailable = row.status === "unavailable_clean_control";
    const hint = row.reason || (unavailable ? "Clean matched control unavailable; not zero" : "Correlation is undefined; see the experiment record");
    const note = comparabilityLabels[row.comparability] || "";
    const cell = unavailable ? '<span class="metric-missing">Unavailable</span>' : number(row.r2_percent, 2, hint);
    return `<tr class="${row.id === candidateId ? "candidate-row" : unavailable ? "excluded-row" : ""}"><th scope="row">${escape(row.label)}${note ? `<small>${escape(note)}</small>` : ""}</th><td>${cell}</td><td>${number(row.signed_r, 4, row.r2_percent == null ? hint : "Not reported")}</td><td>${number(row.nrmse, 4, "Not reported")}</td></tr>`;
  }

  function label(panel) {
    return data.full_cohort.studies.find(study => study.id === panel.study_id).label;
  }

  function renderMethod(panel) {
    const method = methodData.methods.find(row => row.panel_id === panel.id);
    const actors = {program: "Program", vlm: "VLM", contract: "Input contract"};
    $("handoff-evidence").textContent = handoffs[panel.id][0];
    $("handoff-domain").textContent = handoffs[panel.id][1];
    $("study-representation-diagram").replaceChildren($("diagram-" + panel.id).content.cloneNode(true));
    $("postparse-family").textContent = method.family;
    $("postparse-change").textContent = method.change_summary;
    $("postparse-flow").innerHTML = method.stages.map((stage, index) => `<li data-actor="${escape(stage.actor)}"><div class="stage-heading"><span class="stage-number">${index + 1}</span><span class="stage-actor">${actors[stage.actor]}</span></div><h5>${escape(stage.title)}</h5><dl><div><dt>Input</dt><dd>${escape(stage.input)}</dd></div><div><dt>Operation</dt><dd>${escape(stage.operation)}</dd></div><div><dt>Output</dt><dd>${escape(stage.output)}</dd></div></dl></li>`).join("");
    const letter = String.fromCharCode(97 + data.panels.indexOf(panel));
    $("postparse-caption").textContent = `Figure 2${letter}. ${label(panel)} method schematic. Positions and symbolic times are illustrative, not measured.`;
    $("postparse-inputs").innerHTML = method.input_fields.map(field => `<li>${escape(field)}</li>`).join("");
    $("postparse-representation").innerHTML = [["Entities / states", method.representation.entities], ["Relations / events", method.representation.relations], ["Unknowns / limits", method.representation.unknowns]].map(([title, items]) => `<div><dt>${title}</dt><dd><ul>${items.map(item => `<li>${escape(item)}</li>`).join("")}</ul></dd></div>`).join("");
    const example = method.example;
    $("postparse-example-kind").textContent = example.kind === "saved_excerpt" ? "Saved input excerpt / not a model answer" : "Schematic example / not a recorded model input";
    $("postparse-question").textContent = `${example.question_kind === "paraphrase" ? "Question, paraphrased" : "Recorded question"}: ${example.question}`;
    $("postparse-evidence").textContent = example.evidence;
    $("postparse-explanation").textContent = example.explanation;
    $("postparse-example-source").textContent = `Source: ${example.source_document}`;
    $("postparse-boundary").textContent = method.boundary;
  }

  function jumpToStudy(event) {
    event.preventDefault();
    selectStudy(event.currentTarget.dataset.studyLink, true);
    $("studies").scrollIntoView();
    $("study-panel").focus({preventScroll: true});
  }

  function renderMethodMap() {
    $("method-map").innerHTML = data.panels.map(panel => {
      const method = methodData.methods.find(row => row.panel_id === panel.id);
      return `<tr><th scope="row"><a href="#study-${panel.id}" data-study-link="${panel.id}">${escape(label(panel))}</a></th><td>${escape(method.family)}</td></tr>`;
    }).join("");
    $("method-map").querySelectorAll("a").forEach(link => link.addEventListener("click", jumpToStudy));
    const developed = new Set(data.panels.map(panel => panel.study_id));
    const others = data.full_cohort.studies.filter(study => !developed.has(study.id)).map(study => study.label);
    $("other-study-methods").textContent = `The other five studies (${others.join(", ")}) remain in the earlier full-cohort comparison. No separate validated post-parsing development method is claimed for them here.`;
    $("earlier-method-steps").innerHTML = data.full_cohort.method.process.map(step => `<li>${escape(step)}</li>`).join("");
  }

  function updateMotion(img) {
    const frame = img.closest(".motion-frame");
    frame.querySelector("canvas")?.remove();
    img.style.visibility = "visible";
    if (!paused || !img.complete || !img.naturalWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.setAttribute("aria-hidden", "true");
    canvas.getContext("2d").drawImage(img, 0, 0);
    frame.append(canvas);
    img.style.visibility = "hidden";
  }

  function setMedia(img, src) {
    img.onload = () => updateMotion(img);
    img.closest(".motion-frame").querySelector("canvas")?.remove();
    img.style.visibility = "visible";
    img.src = src;
    if (img.complete) updateMotion(img);
  }

  function syncMotion() {
    document.querySelectorAll(".motion-image").forEach(updateMotion);
    document.querySelectorAll("[data-motion-toggle]").forEach(button => {
      button.title = paused ? "Play animations" : "Pause animations";
      button.setAttribute("aria-label", button.title);
      button.querySelector("img").src = `assets/icons/${paused ? "play" : "pause"}.svg`;
    });
  }

  function studyRows(panel) {
    const ids = new Set([...panel.headline.control_ids, panel.headline.candidate_id, panel.headline.reference_id]);
    if (panel.id === "wu8") ids.add("predicted_semantic_graph");
    if (panel.id === "beller20") ids.add("dense_event_notes");
    if (panel.id === "stephan8") ids.add("predictedtask");
    if (panel.id === "sosa22") ids.add("fixed_8b_direct_code");
    const rows = $("all-study-conditions").checked ? panel.results : panel.results.filter(row => ids.has(row.id));
    $("study-comparison").innerHTML = rows.map(row => metricRow(row, panel.headline.candidate_id)).join("");
  }

  function selectStudy(id, navigate = false) {
    const panel = data.panels.find(item => item.id === id);
    if (!panel) return;
    activePanel = id;
    $("all-study-conditions").checked = false;
    document.querySelectorAll("#study-tabs [role=tab]").forEach(button => {
      const selected = button.dataset.study === id;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $("study-panel").setAttribute("aria-labelledby", `study-tab-${id}`);
    $("study-scope").textContent = `${panel.question_count} questions / ${panel.source_count} sources / exposed development panel`;
    $("study-title").textContent = label(panel);
    $("study-verdict").textContent = verdicts[id][0];
    $("study-verdict").dataset.kind = verdicts[id][1];
    const candidate = panel.results.find(row => row.id === panel.headline.candidate_id);
    $("study-scoreline").innerHTML = `<div><span>Study-specific method</span><strong>${number(candidate.r2_percent)}<small>% R&sup2;</small></strong></div><div><span>Signed correlation</span><strong>${number(candidate.signed_r, 4, "Not reported")}</strong></div><p>${id === "bass42" ? "Type-averaged over 42 questions. Slider-only R²: 44.28%." : escape(panel.metric_context)}</p>`;
    $("study-method-title").textContent = panel.method.name;
    $("study-description").textContent = panel.method.summary;
    renderMethod(panel);
    $("study-finding").textContent = panel.gate.description;
    $("study-limitations").innerHTML = panel.limitations.map(item => `<li>${escape(item)}</li>`).join("");
    $("study-metric-note").textContent = panel.metric_context;
    $("study-model").textContent = `${data.model.reasoner} / FP16 / non-thinking greedy / ${panel.task}`;
    $("study-source").href = data.sources.find(source => source.id === panel.source_ids[0]).url;
    const illustration = studyMedia.records.find(row => row.panel_id === id);
    $("study-image").closest(".motion-frame").style.aspectRatio = `${illustration.width} / ${illustration.height}`;
    $("study-image").alt = `${label(panel)}: ${illustration.source_id}, original at left and archived parsed boxes at right`;
    $("study-media-caption").textContent = illustration.kind === "static_diagram" ? "Original task diagram and same-source parsed boxes. Not a physical simulation." : "Same-source sampled frames and archived parsed boxes. Animation is not original video speed; not a physical simulation.";
    setMedia($("study-image"), illustration.url);
    $("study-original").replaceChildren();
    if (illustration.original) {
      const original = illustration.original;
      const format = original.format === "mp4" ? "video" : original.format === "gif" ? "animated stimulus" : "static diagram";
      const player = original.format === "mp4" ? `<video controls playsinline preload="metadata" src="${escape(original.url)}" aria-label="Original ${escape(label(panel))} stimulus"></video>` : original.format === "gif" ? `<div class="motion-frame"><img class="motion-image" alt="Original ${escape(label(panel))} animated stimulus"></div>` : `<img src="${escape(original.url)}" loading="lazy" alt="Original ${escape(label(panel))} stimulus">`;
      $("study-original").innerHTML = `<details class="paper-details original-stimulus"><summary>Original ${format} at source resolution</summary>${player}<p class="caption">${escape(illustration.source_id)}</p><p class="caption">${escape(illustration.relation_to_method)}</p></details>`;
      if (original.format === "gif") setMedia($("study-original").querySelector(".motion-image"), original.url);
    }
    studyRows(panel);
    $("study-diagnostic").hidden = panel.id !== "bass42";
    if (panel.id === "bass42") {
      const diagnostic = panel.diagnostics.find(item => item.id === "slider40");
      const score = diagnostic.results.find(row => row.id === panel.headline.candidate_id);
      $("study-diagnostic").innerHTML = `<strong>40 slider questions: ${number(score.r2_percent)}% R&sup2;</strong><p>Signed r = ${number(score.signed_r, 4)}; nRMSE = ${number(score.nrmse, 4)}. The two categorical checks are perfect in every condition and receive half the type-averaged weight. The 42-question score is not accuracy or slider-only performance.</p>`;
    }
    if (navigate) history.replaceState(null, "", `#study-${id}`);
  }

  function keyboardTabs(container, activate) {
    container.addEventListener("keydown", event => {
      const buttons = [...container.querySelectorAll('[role="tab"]')];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      activate(buttons[next]);
    });
  }

  function renderDevelopment() {
    $("study-tabs").innerHTML = data.panels.map(panel => `<button role="tab" id="study-tab-${panel.id}" aria-selected="false" aria-controls="study-panel" tabindex="-1" data-study="${panel.id}">${escape(label(panel))}</button>`).join("");
    $("development-table").innerHTML = data.panels.map(panel => {
      const candidate = panel.results.find(row => row.id === panel.headline.candidate_id);
      return `<tr><th scope="row"><a href="#study-${panel.id}" data-study-link="${panel.id}">${escape(label(panel))}</a><small>${escape(panel.title)}</small></th><td>${panel.question_count}</td><td>${escape(panel.method.name)}</td><td><b>${number(candidate.r2_percent)}</b>${panel.id === "bass42" ? "<small>Slider only: 44.28</small>" : ""}</td><td>${escape(verdicts[panel.id][0])}</td></tr>`;
    }).join("");
    $("study-tabs").querySelectorAll("button").forEach(button => button.addEventListener("click", () => selectStudy(button.dataset.study, true)));
    keyboardTabs($("study-tabs"), button => selectStudy(button.dataset.study, true));
    $("development-table").querySelectorAll("a").forEach(link => link.addEventListener("click", jumpToStudy));
  }

  function renderCohort() {
    const search = $("study-search").value.trim().toLowerCase();
    const studies = data.full_cohort.studies.filter(study => study.label.toLowerCase().includes(search));
    $("cohort-table").innerHTML = studies.map(study => {
      const experiments = study.primary_experiments.map(id => id.split("/").pop()).join(", ");
      const diagnostic = study.diagnostic_experiments.length ? `; ${study.diagnostic_experiments.length} diagnostic` : "";
      const cells = conditionOrder.map(id => {
        const row = study.results.find(result => result.id === id).primary;
        const reason = row.undefined_experiments.length ? `Undefined experiment(s): ${row.undefined_experiments.map(key => key.split("/").pop()).join(", ")}. Full details in the source data.` : "No primary experiments in this study";
        return `<td>${number(row.r2_percent, 2, reason)}</td>`;
      }).join("");
      return `<tr><th scope="row">${escape(study.label)}<small>${escape((experiments || "Diagnostic only") + diagnostic)}</small></th><td>${study.question_count}</td>${cells}</tr>`;
    }).join("") || '<tr><td colspan="7">No studies match this search.</td></tr>';
    $("cohort-count").textContent = `${studies.length} of 13 studies shown. ${studies.reduce((sum, study) => sum + study.question_count, 0)} question records in view.`;
  }

  function renderAggregate() {
    $("aggregate-table").innerHTML = data.full_cohort.matched15.results.map(row => metricRow({...row, label: data.condition_labels[row.id]}, "predictedtask")).join("");
    $("cohort-source").href = data.sources.find(source => source.id === "full-cohort").url;
  }

  async function loadResearch() {
    $("research-loading").hidden = false;
    $("research-error").hidden = true;
    try {
      const response = await fetch("data/research-20261105.json");
      if (!response.ok) throw new Error(`Research data: ${response.status}`);
      data = await response.json();
      const methodsResponse = await fetch("data/post-parsing-methods.json");
      if (!methodsResponse.ok) throw new Error(`Method data: ${methodsResponse.status}`);
      methodData = await methodsResponse.json();
      const mediaResponse = await fetch("data/study-media.json?v=20261105-stimuli");
      if (!mediaResponse.ok) throw new Error(`Study media: ${mediaResponse.status}`);
      studyMedia = await mediaResponse.json();
      renderMethodMap();
      renderDevelopment();
      renderCohort();
      renderAggregate();
      const requested = location.hash.startsWith("#study-") ? location.hash.slice(7) : "bass42";
      selectStudy(data.panels.some(panel => panel.id === requested) ? requested : "bass42");
      $("research-content").hidden = false;
      if (location.hash.startsWith("#study-")) $("studies").scrollIntoView();
    } catch (error) {
      $("research-error").hidden = false;
      console.error(error);
    } finally {
      $("research-loading").hidden = true;
    }
  }

  async function loadParsing() {
    try {
      const response = await fetch("data/results.json");
      if (!response.ok) throw new Error(`Parsing data: ${response.status}`);
      const parsing = await response.json();
      const rows = parsing.parsing_baselines.methods.filter(row => row.group !== "Parsing Models");
      $("parsing-table").innerHTML = rows.map(row => `<tr class="${row.group === "Ours" ? "candidate-row" : ""}"><th scope="row">${escape(row.method === "ParseAnything" ? "Parse Anything" : row.method)}</th><td>${number(row.mean_iou * 100)} &plusmn; ${number(row.sample_iou_std * 100)}</td><td>${number(row.rpe_1_frame * 100)} &plusmn; ${number(row.rpe_1_frame_std * 100)}</td></tr>`).join("");
    } catch (error) {
      $("parsing-table").innerHTML = '<tr><td colspan="3">Parsing records could not be loaded.</td></tr>';
      console.error(error);
    }
  }

  document.addEventListener("site:unlocked", () => {
    setMedia($("hero-image"), $("hero-image").dataset.motionSrc);
    document.querySelectorAll("[data-motion-toggle]").forEach(button => button.addEventListener("click", () => { paused = !paused; syncMotion(); }));
    syncMotion();
    $("research-retry").addEventListener("click", loadResearch);
    $("all-study-conditions").addEventListener("change", () => studyRows(data.panels.find(panel => panel.id === activePanel)));
    $("study-search").addEventListener("input", () => { if (data) renderCohort(); });
    const tabs = $("tab-cohort").parentElement;
    const activate = button => {
      tabs.querySelectorAll("button").forEach(item => {
        const selected = item === button;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        $(item.getAttribute("aria-controls")).hidden = !selected;
      });
    };
    tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => activate(button)));
    keyboardTabs(tabs, activate);
    window.addEventListener("hashchange", () => {
      if (data && location.hash.startsWith("#study-")) { selectStudy(location.hash.slice(7)); $("studies").scrollIntoView(); }
    });
    loadResearch();
    loadParsing();
  }, {once: true});
})();
