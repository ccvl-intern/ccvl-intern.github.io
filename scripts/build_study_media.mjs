import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const archive = process.argv[2];
const originalsDirectory = process.argv[3];
if (!archive || !originalsDirectory) throw new Error('Usage: node scripts/build_study_media.mjs <parsing-delivery-directory> <original-stimuli-directory>');
const root = fileURLToPath(new URL('../', import.meta.url));
const manifestBytes = await readFile(resolve(archive, 'MANIFEST.json'));
const manifest = JSON.parse(manifestBytes);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const selection = [
  ['bass42', 'bass2022_partial', 4, 'Matches the source of the saved event excerpt; the callbacks are modeled, not visible events in this reconstruction.'],
  ['ger2021_8', 'gerstenberg2021_counterfactual', 1, 'Experiment-1 source of the saved timeline excerpt. The reconstruction is observed-state geometry, not the intervened trajectory.'],
  ['ger2022_8', 'gerstenberg2022_what', 10, 'Source of the saved conditional-chain excerpt. The counterfactual computation is not part of this archived reconstruction.'],
  ['wu8', 'wu2022_that', 10, 'Experiment-2 trial 11. Later route evidence adds action-state observations; it is not the box visualization.'],
  ['sosa22', 'sosa2025_blending', 17, 'Audited scene_1_11 example. The text example is schematic; no future continuation is depicted.'],
  ['beller20', 'beller2020_language', 6, 'Source clip14 matches the measured-anchor excerpt. Added circle observations belong to the later method, not this archived reconstruction.'],
  ['smith5', 'smith2019_modeling', 18, 'Matches the source of the saved observation excerpt. No hidden state or surprise judgment is rendered.'],
  ['stephan8', 'stephan2021_counterfactual', 15, 'Static barrier_bottom task diagram, not the introductory video. Hypothetical segment predicates are explained separately.']
];
await mkdir(resolve(root, 'assets/studies'), { recursive: true });
const records = [];
for (const [panelId, study, index, note] of selection) {
  const record = manifest.records.find(row => row.study === study && row.example_index === index);
  if (!record) throw new Error(`Missing source: ${panelId}`);
  const codeHash = hash(await readFile(resolve(archive, record.code)));
  if (codeHash !== record.code_sha256) throw new Error(`Code hash mismatch: ${panelId}`);
  const source = resolve(archive, record.original_vs_bbox_only_gif);
  const bytes = await readFile(source);
  const url = `assets/studies/${panelId}-parsing.gif`;
  await copyFile(source, resolve(root, url));
  const format = panelId === 'wu8' ? 'gif' : panelId === 'stephan8' ? 'png' : 'mp4';
  const originalSource = resolve(originalsDirectory, `${panelId}.${format}`);
  const originalBytes = await readFile(originalSource);
  const originalUrl = `assets/studies/${panelId}-original.${format}`;
  await copyFile(originalSource, resolve(root, originalUrl));
  const original = {url: originalUrl, format, sha256: hash(originalBytes)};
  records.push({panel_id: panelId, source_id: record.sample_id, url,
    sha256: hash(bytes), code_sha256: codeHash, frame_count: record.bbox_comparison_frame_count,
    width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8), original,
    kind: record.parse_mode === 'static_2d_observation' ? 'static_diagram' : 'sampled_video',
    relation_to_method: note});
}
await writeFile(resolve(root, 'data/study-media.json'), JSON.stringify({schema_version: 1,
  scope: 'Archived source/prediction pairs from the parsing delivery, with exact original stimuli for all eight examples. Paired animation timing is presentation timing, not original video speed. The reconstructions illustrate observations, not later conditional computations or VLM answers. Wu uses an original GIF and Stephan a static PNG; the other six use MP4 videos.',
  manifest_sha256: hash(manifestBytes), records}, null, 2) + '\n');
console.log(`Copied and verified ${records.length} paired source/parsing illustrations.`);
