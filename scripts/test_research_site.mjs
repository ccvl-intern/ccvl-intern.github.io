import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const data = JSON.parse(await read('data/research-20261105.json'));
const methods = JSON.parse(await read('data/post-parsing-methods.json'));
const media = JSON.parse(await read('data/study-media.json'));
const html = await read('index.html');
const conditionIds = ['video', 'saved_direct_code', 'full_code', 'predictedtask', 'partialoracle'];

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
