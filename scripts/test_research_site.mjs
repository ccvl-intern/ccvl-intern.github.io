import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { SCENES, WIDTH, HEIGHT } from './method_animation_scenes.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const data = JSON.parse(await read('data/research-20261105.json'));
const methods = JSON.parse(await read('data/post-parsing-methods.json'));
const media = JSON.parse(await read('data/study-media.json'));
const stories = JSON.parse(await read('data/study-story.json'));
const animations = JSON.parse(await read('data/method-animations.json'));
const html = await read('index.html');
const conditionIds = ['video', 'saved_direct_code', 'full_code', 'predictedtask', 'partialoracle'];

test('Code2Evidence branding is consistent and the snapshot banner is removed', async () => {
  const title = 'Code2Evidence: Cognitive Spatial Reasoning in Physical World';
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes('<h1>Code2Evidence: <span>Cognitive Spatial Reasoning in Physical World</span></h1>'));
  assert.match(html, /class="wordmark"[^>]*>Code2Evidence/);
  assert.ok((await read('README.md')).startsWith(`# ${title}\n`));
  assert.doesNotMatch(html, /Research snapshot|progress-date|Unified and Adaptive Visual Parser/);
  assert.doesNotMatch(await read('assets/research.js'), /progress-date|snapshotDate/);
});

function inspectGif(bytes) {
  assert.equal(bytes.subarray(0, 6).toString(), 'GIF89a');
  let offset = 13 + ((bytes[10] & 128) ? 3 * 2 ** ((bytes[10] & 7) + 1) : 0);
  let frames = 0, duration = 0;
  function skipBlocks() {
    while (bytes[offset] > 0) offset += bytes[offset] + 1;
    assert.equal(bytes[offset++], 0);
  }
  while (offset < bytes.length) {
    const marker = bytes[offset++];
    if (marker === 0x3b) return {frames, duration};
    if (marker === 0x21) {
      const extension = bytes[offset++];
      if (extension === 0xf9) {
        assert.equal(bytes[offset], 4);
        duration += bytes.readUInt16LE(offset + 2) * 10;
      }
      skipBlocks();
    } else if (marker === 0x2c) {
      const packed = bytes[offset + 8];
      offset += 9 + ((packed & 128) ? 3 * 2 ** ((packed & 7) + 1) : 0);
      offset++;
      skipBlocks();
      frames++;
    } else assert.fail(`Unexpected GIF block: ${marker}`);
  }
  assert.fail('Missing GIF trailer');
}

test('every method animation has four distinct stages bound to existing evidence', async () => {
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(animations.methods_sha256, hash(await read('data/post-parsing-methods.json')));
  assert.deepEqual(animations.records.map(row => row.panel_id), data.panels.map(row => row.id));
  assert.deepEqual(SCENES.map(row => row.id), data.panels.map(row => row.id));
  for (const record of animations.records) {
    const method = methods.methods.find(row => row.panel_id === record.panel_id);
    const scene = SCENES.find(row => row.id === record.panel_id);
    assert.equal(record.evidence_source_sha256, method.example.sha256);
    assert.equal(record.example_kind, method.example.kind);
    assert.deepEqual(record.source_ids, method.source_ids);
    assert.equal(record.kind, 'method_schematic');
    assert.deepEqual(record.stages, scene.stages);
    assert.equal(new Set(record.stage_sha256).size, 4);
    assert.equal(record.alt, scene.alt);
    for (const term of scene.terms) assert.ok(method.example.evidence.includes(term), `${scene.id}: ${term}`);
    const bytes = await readFile(new URL(record.url, root));
    const poster = await readFile(new URL(record.poster, root));
    assert.equal(hash(bytes), record.sha256);
    assert.equal(hash(poster), record.poster_sha256);
    assert.equal(record.poster_sha256, record.stage_sha256.at(-1));
    assert.equal(bytes.readUInt16LE(6), WIDTH);
    assert.equal(bytes.readUInt16LE(8), HEIGHT);
    assert.equal(poster.readUInt32BE(16), WIDTH);
    assert.equal(poster.readUInt32BE(20), HEIGHT);
    const gif = inspectGif(bytes);
    assert.equal(gif.frames, record.frame_count);
    assert.equal(gif.duration, record.duration_ms);
    assert.ok(gif.frames >= 80 && gif.duration >= 15000 && gif.duration <= 25000);
    assert.ok(bytes.length < 5 * 1024 * 1024, 'Keep each lazy-selected GIF below 5 MiB');
  }
});

test('method figures offer motion controls, downloads and a static overview', async () => {
  for (const id of ['study-method-animation', 'study-method-open', 'study-method-download']) {
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.match(html, /Static method overview/);
  assert.match(html, /id="study-method-download"[^>]*download/);
  assert.match(html, /id="study-method-open"[^>]*rel="noopener"/);
  const script = await read('assets/research.js');
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /paused \? img.dataset.motionPoster : img.dataset.motionSrc/);
  assert.match(script, /setMedia\(\$\("study-method-animation"\), animation.url, animation.poster\)/);
});

test('the frozen inventory retains every study and diagnostic question', () => {
  const cohort = data.full_cohort;
  assert.equal(cohort.studies.length, 13);
  assert.equal(cohort.studies.reduce((n, study) => n + study.question_count, 0), 490);
  assert.equal(cohort.primary_membership.questions, 487);
  assert.equal(cohort.diagnostic_membership.questions, 3);
  assert.equal(cohort.primary_membership.experiments.length, 22);
  for (const study of cohort.studies) {
    assert.deepEqual(study.results.map(row => row.id), conditionIds);
    for (const result of study.results) {
      const value = result.primary.r2_percent;
      assert.ok(value === null || (Number.isFinite(value) && value >= 0 && value <= 100));
      if (result.primary.undefined_experiments.length) assert.equal(value, null);
    }
  }
});

test('strict aggregates remain undefined; matched subset stays labeled separately', () => {
  assert.equal(data.full_cohort.strict_primary.length, 5);
  for (const row of data.full_cohort.strict_primary) {
    assert.equal(row.r2_percent, null);
    assert.equal(row.expected_experiments, 22);
  }
  const matched = data.full_cohort.matched15;
  assert.equal(matched.question_count, 410);
  assert.equal(matched.experiment_count, 15);
  assert.deepEqual(matched.results.map(row => row.r2_percent.toFixed(2)), ['18.10', '22.58', '21.51', '27.02', '13.53']);
});

test('development headline scores and their provenance resolve without pooling', () => {
  const expected = {bass42:'72.14', ger2021_8:'74.55', ger2022_8:'93.46', wu8:'88.55', sosa22:'86.14', beller20:'25.39', smith5:'2.86', stephan8:'34.33'};
  assert.equal(data.panels.length, Object.keys(expected).length);
  const sources = new Set(data.sources.map(source => source.id));
  for (const panel of data.panels) {
    assert.ok(panel.method.process.length > 0);
    assert.ok(panel.limitations.length > 0);
    const candidate = panel.results.find(row => row.id === panel.headline.candidate_id);
    assert.equal(candidate.r2_percent.toFixed(2), expected[panel.id]);
    for (const id of [...panel.headline.control_ids, panel.headline.reference_id]) {
      assert.ok(panel.results.some(row => row.id === id), `${panel.id}: missing ${id}`);
    }
    for (const row of panel.results) {
      for (const id of row.source_ids) assert.ok(sources.has(id), `Unknown source ${id}`);
      if (row.status === 'unavailable_clean_control') assert.equal(row.r2_percent, null);
    }
  }
});

test('Bass type weighting and slider-only diagnostic remain numerically consistent', () => {
  const panel = data.panels.find(row => row.id === 'bass42');
  const slider = panel.diagnostics.find(row => row.id === 'slider40');
  for (const row of slider.results) {
    const combined = panel.results.find(item => item.id === row.id);
    assert.ok(Math.abs(combined.r2_percent - (100 + row.r2_percent) / 2) < 1e-10);
  }
  assert.equal(slider.results.find(row => row.id === panel.headline.candidate_id).r2_percent.toFixed(2), '44.28');
});

test('unification preparation is not presented as an inference result', () => {
  assert.equal(data.snapshot.live, false);
  assert.equal(data.unification.question_count, 50);
  assert.equal(data.unification.completed_fresh_calls, 0);
  assert.equal(data.unification.new_r2_percent, null);
  assert.match(html, /No unified-method score is reported/);
});

test('each study has a distinct diagram, complete post-parsing route and sourced example', () => {
  assert.deepEqual(methods.methods.map(method => method.panel_id), data.panels.map(panel => panel.id));
  const sources = new Set(data.sources.map(source => source.id));
  for (const method of methods.methods) {
    assert.ok(html.includes(`id="diagram-${method.panel_id}"`));
    assert.equal(method.stages.length, 4);
    assert.equal(method.stages.at(-1).actor, 'vlm');
    for (const stage of method.stages) {
      assert.ok(['program', 'vlm', 'contract'].includes(stage.actor));
      for (const field of ['title', 'input', 'operation', 'output']) assert.ok(stage[field]?.length > 10);
    }
    for (const key of ['entities', 'relations', 'unknowns']) assert.ok(method.representation[key].length >= 2);
    assert.ok(['saved_excerpt', 'schematic'].includes(method.example.kind));
    assert.equal(method.example.question_kind, 'paraphrase');
    assert.ok(method.example.evidence.length > 100 && method.example.evidence.length <= 1000);
    assert.match(method.example.sha256, /^[0-9a-f]{64}$/);
    for (const id of method.source_ids) assert.ok(sources.has(id));
  }
  assert.equal(methods.methods.filter(method => method.example.kind === 'saved_excerpt').length, 7);
  assert.equal(methods.methods.find(method => method.panel_id === 'sosa22').example.kind, 'schematic');
  for (const id of ['ger2021_8', 'ger2022_8']) {
    assert.match(methods.methods.find(method => method.panel_id === id).stages[0].operation, /pre-interaction state/);
  }
  assert.doesNotMatch(html, /<img[^>]+adaptive-abstraction/);
});

test('visual walkthroughs keep every study, comparison and visible limitation grounded', () => {
  assert.deepEqual(stories.stories.map(row => row.panel_id), data.panels.map(row => row.id));
  assert.deepEqual(['local', 'partial', 'open'].map(group => stories.stories.filter(row => row.group === group).length), [2, 3, 3]);
  for (const story of stories.stories) {
    const panel = data.panels.find(row => row.id === story.panel_id);
    assert.equal(story.recipe.length, 3);
    assert.equal(story.evidence.length, 2);
    assert.ok(story.limit.length > 40);
    assert.equal(story.comparison_ids.length, story.comparison_labels.length);
    assert.ok(story.comparison_ids.includes(panel.headline.candidate_id));
    assert.equal(story.comparison_ids.filter(id => id === panel.headline.reference_id).length, 1);
    assert.ok(story.reference_scope.length > 10);
    assert.ok(story.reference_note.length > 40);
    for (const id of story.comparison_ids) assert.ok(panel.results.some(row => row.id === id));
    assert.ok(story.comparison_note.length > 40);
    assert.equal(Object.hasOwn(story, 'r2_percent'), false, 'Charts must read audited scores, not copy editorial numbers');
  }
  assert.match(stories.stories.find(row => row.panel_id === 'wu8').comparison_note, /same facts/);
  assert.match(stories.stories.find(row => row.panel_id === 'sosa22').limit, /not run/);
  assert.match(stories.stories.find(row => row.panel_id === 'smith5').limit, /negative/);
  assert.match(html, /not one matched end-to-end trial/);
  assert.match(html, /Human answers are used for evaluation, never as evidence/);
  assert.match(html, /Undefined is not zero/);
  for (const id of ['study-question', 'study-recipe', 'evidence-highlights', 'study-takeaway', 'study-visible-limit', 'study-result-bars', 'study-status-map']) {
    assert.ok(html.includes(`id="${id}"`));
  }
});

test('GT/reference results are exposed without claiming a complete upper bound', () => {
  const expected = ['66.96', '81.50', '61.15', '93.89', '69.33', '32.63', '52.68', '98.47'];
  assert.deepEqual(data.panels.map(panel => panel.results.find(row => row.id === panel.headline.reference_id).r2_percent.toFixed(2)), expected);
  assert.match(html, /<h2>Subset Results<\/h2>/);
  assert.doesNotMatch(html, /Local gains\. Not yet a unified solution\./);
  assert.match(html, /GT \/ reference input<br>R&sup2;/);
  assert.match(html, /Not yet evaluated for the unified 50-question method/);
  assert.match(stories.stories.find(row => row.panel_id === 'wu8').reference_scope, /Historical/);
  assert.match(stories.stories.find(row => row.panel_id === 'wu8').reference_note, /no independent matched GT/);
  assert.match(html, /do not establish a verified upper bound/);
});

test('the overview covers alternative representations and the main results use five fixed roles', () => {
  assert.match(html, /Task-conditioned representation/);
  assert.doesNotMatch(html, /Task-bound graph/);
  assert.match(html, /Alternative task representations: graph, timeline or state table/);
  assert.match(html, /Detailed metrics &amp; ablations/);
  const expectedControls = {
    bass42: ['video', 'saved_direct_code', 'full_code'],
    ger2021_8: ['video_rules', 'own_27b_direct_code', 'full_code_rules'],
    ger2022_8: ['video_rules', 'saved_8b_direct_rules', 'full_code_rules'],
    wu8: ['video', 'own_27b_direct_code', 'full_code'],
    sosa22: ['video_prospective', 'fixed_8b_direct_code', 'full_prospective_unmeasured'],
    beller20: ['video', 'saved_8b_direct', 'full_code'],
    smith5: ['video', 'fixed_8b_direct_code', 'full_code'],
    stephan8: ['video', 'saved_direct_code', 'full_code']
  };
  for (const story of stories.stories) {
    const panel = data.panels.find(row => row.id === story.panel_id);
    assert.deepEqual(story.comparison_ids, [...expectedControls[panel.id], panel.headline.candidate_id, panel.headline.reference_id]);
    assert.match(story.comparison_labels[3], /\(ours\)/);
    assert.match(story.comparison_labels[0], /^Video/);
    assert.match(story.comparison_labels[1], /direct/);
    assert.match(story.comparison_labels[2], /^Full code/);
  }
  const story = id => stories.stories.find(row => row.panel_id === id);
  assert.match(story('ger2021_8').comparison_labels[1], /27B/);
  assert.match(story('wu8').comparison_labels[1], /27B/);
  for (const id of ['ger2022_8', 'beller20']) assert.match(story(id).comparison_labels[1], /8B-Thinking/);
  assert.ok(data.panels.find(row => row.id === 'bass42').results.some(row => row.id === 'predicted_factual'));
  assert.ok(data.panels.find(row => row.id === 'wu8').results.some(row => row.id === 'predicted_semantic_graph'));
});

test('all eight paired illustrations are source-bound and byte-verified', async () => {
  assert.deepEqual(media.records.map(row => row.panel_id), data.panels.map(row => row.id));
  for (const record of media.records) {
    const bytes = await readFile(new URL(record.url, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
    assert.match(record.code_sha256, /^[0-9a-f]{64}$/);
    assert.ok(record.frame_count > 0);
    assert.ok(record.width > 0 && record.height > 0);
    assert.ok(record.relation_to_method.length > 30);
    if (record.original) {
      const originalBytes = await readFile(new URL(record.original.url, root));
      assert.equal(createHash('sha256').update(originalBytes).digest('hex'), record.original.sha256);
    }
  }
  assert.match(media.records.find(row => row.panel_id === 'ger2021_8').source_id, /_exp1_/);
  assert.match(media.records.find(row => row.panel_id === 'wu8').source_id, /_exp2_/);
  assert.equal(media.records.find(row => row.panel_id === 'stephan8').kind, 'static_diagram');
  assert.ok(media.records.every(row => row.original));
  assert.equal(media.records.filter(row => row.original.format === 'mp4').length, 6);
});

test('all public audit records exist and omit private operational details', async () => {
  const privateContent = /\/Users\/|\/scratch\/|\/home\/|ssh\s|Slurm|JobId=|Johns Hopkins|Stanford University|Jieneng Chen|Alan.{0,5}Yuille/i;
  for (const source of data.sources) {
    assert.ok(source.url.startsWith('data/research-sources/'));
    const document = await read(source.url);
    assert.doesNotMatch(document, privateContent);
    for (const original of source.provenance) assert.match(original.sha256, /^[0-9a-f]{64}$/);
  }
  assert.doesNotMatch(JSON.stringify(data), privateContent);
  assert.doesNotMatch(JSON.stringify(methods), privateContent);
  assert.doesNotMatch(JSON.stringify(media), privateContent);
  assert.doesNotMatch(JSON.stringify(stories), privateContent);
  assert.doesNotMatch(html, /Johns Hopkins|Stanford University|Jieneng Chen|Alan.{0,5}Yuille|class="authors?"/i);
});

test('all literal local HTML media and script dependencies exist', async () => {
  for (const [, raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(raw)) continue;
    const path = raw.split('?')[0];
    await access(new URL(path, root));
  }
  for (const name of ['hamrick-tower', 'bass-cannonball', 'gerstenberg-collision', 'gerstenberg2022-what', 'wu-gridworld', 'sosa2025-blending', 'beller2020-language', 'smith-discontinuity', 'stephan-counterfactual']) {
    await access(new URL(`assets/demos/${name}.gif`, root));
  }
});
