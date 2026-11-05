export const WIDTH = 1000;
export const HEIGHT = 760;
export const COLORS = {
  ink: '#222725', muted: '#626d68', teal: '#137c78', tealDark: '#09605e',
  coral: '#bd513d', blue: '#496da0', pink: '#c5598d', line: '#d7deda',
  soft: '#f6f8f7', pale: '#eaf4f1', white: '#ffffff', gray: '#87928c'
};

// All displayed facts are paraphrases of post-parsing-methods.json. Geometry
// and movement illustrate the operations; this renderer runs no physics model.
export const SCENES = [
  {
    id: 'bass42', name: 'Bass', title: 'Separate event occurrence from its meaning',
    question: 'If gray were absent, would pink end up in the hole?',
    stages: ['Read parse + cached episodes', 'Bind the requested world', 'Split occurrence and relation', 'Pass explicit evidence to the VLM'],
    fields: [['Identities', 'gray / pink / hole'], ['World', 'remove_gray'], ['Event', 'pink_hole_sensor'], ['Interval', '1.43-1.44 s']],
    notes: ['Extra input: existing modeled callbacks; no new simulation.', 'Physical removal is not conditioning on a collision.', 'No gray/pink collision does not cancel a positive sensor event.', 'A sensor event does not certify eventual residence.'],
    evidence: [['MODELED', 'Pink hole-sensor event recorded at 1.43-1.44 s.'], ['RELATION', 'No gray/pink collision recorded within 0-5 s.'], ['UNKNOWN', 'Whether pink eventually remains in the hole.']],
    domain: 'Probability / category', terms: ['remove_gray', 'pink_hole_sensor', '1.43', '1.44'],
    alt: 'Cached removal-world events are split into occurrence, collision relation and an unknown endpoint before VLM judgment.'
  },
  {
    id: 'ger2021_8', name: 'Gerstenberg 2021', title: 'Turn geometry into a conditional timeline',
    question: 'Would B go through the gate if A were absent?',
    stages: ['Read B, walls and source time', 'Remove A; bind the opening', 'Update after supported contacts', 'Report the bounded stop to the VLM'],
    fields: [['B', 'box + observed motion'], ['Walls', 'recorded boundaries'], ['Opening', 'derived from walls'], ['Intervention', 'remove A']],
    notes: ['Extra input: shared source-derived elastic-wall rules.', 'Observed B motion is assumed to initialize the changed world.', 'Unsupported geometry stops computation; no invented continuation.', 'No established exit does not mean B would never exit.'],
    evidence: [['DERIVED', 'Gate corridor: (0, 201, 20, 400) px.'], ['MODELED', 'Stop at 6.43271 s: unsupported contact geometry.'], ['UNKNOWN', 'No whole-body exit established within this chain.']],
    domain: '0-100 likelihood', terms: ['201', '400', '6.43271', 'unsupported_contact_geometry'],
    alt: 'B and wall records define an intervened scene; a supported contact loop produces a bounded timeline with an unresolved stop.'
  },
  {
    id: 'ger2022_8', name: 'Gerstenberg 2022', title: 'Recompute the next contact, then continue',
    question: 'Would B pass the gate after removing A?',
    stages: ['Read B and retained obstacles', 'Bind the changed scene', 'Execute the contact chain', 'Report the conditional crossing'],
    fields: [['B at 1.4 s', '(665,269,727,331) px'], ['B velocity', '(-147.009,-0.012545)'], ['Retained', 'walls / gate / block'], ['Removed', 'ball_A']],
    notes: ['Velocity units: px/s. Shared mechanics are an extra input.', 'Retaining factual block motion is a declared assumption.', 'Each supported contact updates B before the next event.', 'Computed crossing is not observed counterfactual truth.'],
    evidence: [['INPUT', 'B starts at 1.4 s with observed state and velocity.'], ['MODELED', 'Fitting gate-plane crossing computed at 6.0664 s.'], ['ASSUMPTION', 'Observed initialization and retained block motion.']],
    domain: '0-100 agreement', terms: ['1.4', '665', '147.009', '6.0664'],
    alt: 'Remove only A, retain the block, recompute supported contacts and deliver a conditional gate-crossing certificate to the VLM.'
  },
  {
    id: 'wu8', name: 'Wu', title: 'Convert action states into a route witness',
    question: 'Could the other path have reached the star?',
    stages: ['Read cells, doors and action steps', 'Build legal move / wait states', 'Search time-respecting routes', 'Pass reachability, not probability'],
    fields: [['Start', 'blue path [0,2]'], ['Door', '[5,2] open at state 4'], ['Clock', 'discrete action steps'], ['Goal', '[6,1]']],
    notes: ['Extra observations: frozen pixel-derived grid, OCR and doors.', 'Actions occur before toggles; missing door states stay unknown.', 'Saved witness: earliest arrival at action 7, all-closed completion.', 'An existing route is not a player policy or success probability.'],
    evidence: [['OBSERVED', 'Door [5,2] is open at preceding state 4.'], ['COMPUTED', 'The saved blue-start route reaches the goal at action 7.'], ['ASSUMPTION', 'Door timing remains unaffected by the choice.']],
    domain: 'Original task judgment', terms: ['[0, 2]', 'action 7', 'preceding state 4'],
    alt: 'Grid cells become time-indexed action states; legal moves and waits yield a conditional route ending at action seven.'
  },
  {
    id: 'sosa22', name: 'Sosa 2025', title: 'Expand a target pair into the whole scene',
    question: 'Would ball and goal contact after disappearance?',
    stages: ['Read all observed scene nodes', 'Add context, not just the pair', 'Bind relations to observed time', 'Ask about the unseen continuation'],
    fields: [['Target pair', 'ball / goal'], ['Context', 'slide / container'], ['State at t_i', 'centers + boxes'], ['Time', 'observed samples only']],
    notes: ['This entire example is schematic; no invented numeric data.', 'Include context with geometry; group names are not new boxes.', 'Observed relations stop at disappearance; no future simulation.', 'Prospective task clarification is part of this tested method.'],
    evidence: [['OBSERVED', 'Ball, goal and scene context at recorded samples.'], ['DERIVED', 'Pair separation, projections and supported motion.'], ['UNKNOWN', 'Future contact after the scene disappears.']],
    domain: 'Yes / No', terms: ['slide', 'container', 'Future contact: not computed'],
    alt: 'A ball-goal pair expands to include slide and container nodes; observed relations stop at disappearance, leaving continuation to the VLM.'
  },
  {
    id: 'beller20', name: 'Beller', title: 'Anchor an event path in measured positions',
    question: "Which sentence describes A's role in B's exit?",
    stages: ['Read identities; add pixel measures', 'Bind before / encounter / after', 'Attach positions to event paths', 'Leave the causal judgment to VLM'],
    fields: [['Time / frame', '2.44 s / 122'], ['A center', '(394.50,219.50) px'], ['B center', '(438.50,305.50) px'], ['Radius', '30.20 px each']],
    notes: ['Extra input: event-local circle measurements from source pixels.', 'Source coordinates: x rightward, y downward.', 'Paths preserve time order; proximity is not verified causation.', 'The measured world is not the world with A removed.'],
    evidence: [['MEASURED', 'At 2.44 s: A=(394.50,219.50), B=(438.50,305.50).'], ['BOUND', 'Source frame 122; these are before-E1 anchors.'], ['UNKNOWN', 'The outcome with A removed is not computed.']],
    domain: 'Four causal descriptions', terms: ['2.44s', '122', '394.50', '438.50', '30.20'],
    alt: 'Parsed identities and extra circle measurements bind to event E1, then to a chronological candidate path without assigning causation.'
  },
  {
    id: 'smith5', name: 'Smith', title: 'Keep visible states and missing states separate',
    question: 'How surprising was the physical event?',
    stages: ['Read visible image-space records', 'Bind identities to source frames', 'Preserve observation gaps', 'Supply evidence without a verdict'],
    fields: [['Entities', 'target / occluder'], ['Clock', '2.88 s / frame 72'], ['Pair center', 'unavailable'], ['Target velocity', 'before / after unknown']],
    notes: ['Image coordinates are not verified world geometry.', 'Track identity does not prove hidden physical persistence.', 'No interpolation through a gap; missing detection is not disappearance.', 'This run requested a rating only, not a VLM explanation.'],
    evidence: [['OBSERVED', 'At 2.88 s / frame 72, pair-center data is unavailable.'], ['UNKNOWN', 'Target velocity before and after is unknown.'], ['LIMIT', 'The gap does not establish physical disappearance.']],
    domain: '0-100 surprise only', terms: ['2.88s/f72', 'becomes unavailable', 'before unknown; after unknown'],
    alt: 'Visible target and occluder records are aligned by time; the missing pair observation remains a gap rather than an invented trajectory.'
  },
  {
    id: 'stephan8', name: 'Stephan', title: 'Turn scene geometry into an intersection test',
    question: 'For whom is knocking the marble into the gate harder?',
    stages: ['Read centers and obstacle boxes', 'Construct a hypothetical segment', 'Test the segment against boxes', 'Report geometry, not difficulty'],
    fields: [['Blue center', '(774.27,538.53) px'], ['Gray marble', '(77.61,298.57) px'], ['Scene', 'barrier / wall boxes'], ['Parameter', 'u along a segment']],
    notes: ['Blue is the saved example; the operator tests both players.', 'The segment goes to the marble, not to the gate.', 'u is a line parameter, not time; no moving body is simulated.', 'Finite-body access and the gate goal remain unevaluated.'],
    evidence: [['COMPUTED', 'Blue-to-marble segment intersects the barrier.'], ['INTERVAL', 'Intersection at u=0.34395107 to 0.43563265.'], ['UNKNOWN', 'Body clearance, gate success and comparative difficulty.']],
    domain: '-50 blue / +50 green', terms: ['774.27027', '77.614986', '0.34395107', '0.43563265'],
    alt: 'The hypothetical player-to-marble center segment is intersected with obstacle boxes; the resulting interval is evidence, not a difficulty score.'
  }
];

const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1 - (1 - clamp(x)) ** 3;

export function paintScene(ctx, scene, stage, progress = 1) {
  const C = COLORS;
  const p = ease(progress);
  ctx.resetTransform();
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function text(value, x, y, size = 28, color = C.ink, weight = 400, max = 920, align = 'left') {
    ctx.font = `${weight} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    if (ctx.measureText(value).width > max + 1) throw new Error(`${scene.id} stage ${stage}: text exceeds ${max}px: ${value}`);
    ctx.fillText(value, x, y);
  }
  function wrap(value, x, y, width, size = 28, color = C.ink, weight = 400, maxLines = 3) {
    ctx.font = `${weight} ${size}px Arial`;
    const words = value.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) throw new Error(`${scene.id} stage ${stage}: too many lines: ${value}`);
    lines.forEach((line, i) => text(line, x, y + i * size * 1.28, size, color, weight, width));
    return lines.length * size * 1.28;
  }
  function line(x1, y1, x2, y2, color = C.line, width = 3, dashed = false) {
    ctx.beginPath(); ctx.setLineDash(dashed ? [9, 8] : []); ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
  }
  function arrow(x1, y1, x2, y2, color = C.teal, width = 3, amount = 1, dashed = false) {
    const x = x1 + (x2 - x1) * amount, y = y1 + (y2 - y1) * amount;
    line(x1, y1, x, y, color, width, dashed);
    if (amount < 0.05) return;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    line(x, y, x - 11 * Math.cos(angle - 0.5), y - 11 * Math.sin(angle - 0.5), color, width);
    line(x, y, x - 11 * Math.cos(angle + 0.5), y - 11 * Math.sin(angle + 0.5), color, width);
  }
  function rect(x, y, w, h, fill = C.soft, stroke = C.line, dashed = false) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fillStyle = fill; ctx.fill();
    ctx.setLineDash(dashed ? [8, 7] : []); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  }
  function circle(x, y, r, color, label, pale = false) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = pale ? C.soft : color;
    ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
    if (label) text(label, x, y - 16, 30, pale ? color : C.white, 700, r * 2, 'center');
  }
  function card(x, y, w, h, label, color = C.teal, size = 28) {
    rect(x, y, w, h, C.white, color);
    text(label, x + w / 2, y + (h - size) / 2 - 2, size, color, 700, w - 20, 'center');
  }
  function reveal(start, callback) {
    const opacity = clamp((p - start) * 4);
    if (!opacity) return;
    ctx.save(); ctx.globalAlpha = opacity; callback(); ctx.restore();
  }
  function caption(value, y = 557, color = C.muted) { wrap(value, 60, y, 880, 25, color, 400, 2); }
  function path(points, amount = 1, color = C.teal, width = 5, dashed = false) {
    const count = (points.length - 1) * amount;
    for (let i = 0; i < points.length - 1 && i < count; i++) {
      const f = Math.min(1, count - i);
      line(points[i][0], points[i][1], points[i][0] + (points[i + 1][0] - points[i][0]) * f,
        points[i][1] + (points[i + 1][1] - points[i][1]) * f, color, width, dashed);
    }
  }

  text(scene.name.toUpperCase(), 40, 24, 21, C.tealDark, 700);
  text('METHOD ILLUSTRATION', 960, 24, 18, C.muted, 400, 400, 'right');
  text(scene.title, 40, 62, 34, C.ink, 700);
  wrap(scene.question, 40, 113, 920, 26, C.muted, 400, 2);
  line(40, 158, 960, 158);
  text(`${String(stage + 1).padStart(2, '0')}  ${scene.stages[stage]}`, 40, 180, 29, stage === 3 ? C.coral : C.tealDark, 700, 850);

  function input() {
    scene.fields.forEach(([key, value], i) => reveal(i * .15, () => {
      const y = 240 + i * 75;
      text(key, 60, y, 22, C.muted, 700, 440);
      text(value, 60, y + 29, 26, C.ink, 400, 460);
      line(60, y + 64, 505, y + 64);
    }));
    arrow(532, 384, 588, 384, C.teal, 3, p);
    const nodes = scene.id === 'wu8' ? ['cell', 'door', 'step'] : scene.id === 'bass42' ? ['body', 'world', 'event'] : ['object', 'time', 'state'];
    nodes.forEach((name, i) => reveal(.12 + i * .18, () => card(630, 258 + i * 90, 280, 60, name, i === 1 ? C.blue : C.teal)));
    caption('Saved fields stay bound to their identities and source context.');
  }

  function bass() {
    if (stage === 1) {
      text('REQUESTED WORLD', 65, 245, 22, C.muted, 700);
      circle(170, 360, 46, C.gray, 'G', true);
      line(126, 316, 214, 404, C.coral, 5);
      text('gray removed', 170, 425, 26, C.coral, 700, 240, 'center');
      circle(385, 360, 46, C.pink, 'P');
      text('pink retained', 385, 425, 26, C.ink, 400, 240, 'center');
      arrow(450, 360, 590, 360, C.teal, 4, p);
      reveal(.35, () => {
        rect(620, 275, 300, 170, C.pale, C.teal);
        text('Cached episode', 645, 298, 29, C.tealDark, 700, 250);
        text('world =', 645, 350, 23, C.muted);
        text('remove_gray', 645, 385, 31, C.tealDark, 700, 250);
      });
      caption('Retrieve the existing removal trace; do not infer a new branch.');
    } else {
      card(60, 245, 880, 62, 'pink_hole_sensor  |  1.43-1.44 s  |  remove_gray', C.teal, 28);
      arrow(360, 320, 270, 370, C.teal, 3, p);
      arrow(640, 320, 730, 370, C.blue, 3, p);
      reveal(.18, () => {
        text('OCCURRENCE', 80, 395, 23, C.tealDark, 700);
        wrap('Positive callback recorded', 80, 435, 370, 35, C.tealDark, 700, 2);
      });
      reveal(.4, () => {
        text('COLLISION RELATION', 550, 395, 23, C.blue, 700);
        wrap('No gray/pink collision in 0-5 s', 550, 435, 370, 33, C.blue, 700, 2);
      });
      caption('Two different statements. Neither supplies an eventual destination.');
    }
  }

  function contactChain() {
    const moving = scene.id === 'ger2022_8';
    if (stage === 1) {
      line(110, 270, 510, 270, C.gray, 11); line(510, 270, 510, 510, C.gray, 11);
      line(110, 510, 510, 510, C.gray, 11); line(110, 270, 110, 330, C.gray, 11); line(110, 450, 110, 510, C.gray, 11);
      text('opening', 70, 365, 23, C.tealDark, 700, 150);
      circle(300, 350, 31, C.gray, 'A', true); line(274, 324, 326, 376, C.coral, 4);
      rect(400, 380, 52, 52, C.pale, C.teal); text('B', 426, 390, 29, C.tealDark, 700, 45, 'center');
      arrow(395, 406, 330, 406, C.teal, 4, p);
      if (moving) { rect(225, 455, 85, 25, C.soft, C.blue); arrow(320, 465, 365, 465, C.blue, 3, p); }
      reveal(.2, () => {
        text('REMOVE A ONLY', 600, 265, 27, C.coral, 700, 340);
        wrap(moving ? 'Keep walls and block.' : 'Keep fixed wall geometry.', 600, 330, 330, 30, C.ink, 400, 2);
      });
      reveal(.45, () => wrap(moving ? 'Assume factual block motion is unchanged.' : 'Derive the opening from retained walls.', 600, 425, 330, 28, C.blue, 400, 3));
      caption('Scene layout is schematic; observed initialization is an assumption.');
    } else {
      const steps = ['Current B', 'Next contact', 'Update v', 'Test exit'];
      steps.forEach((s, i) => {
        reveal(i * .13, () => card(60 + i * 235, 275, 175, 76, s, i === 3 ? C.blue : C.teal, 23));
        if (i < 3) arrow(245 + i * 235, 313, 280 + i * 235, 313, C.teal, 3, clamp((p - i * .13) * 2));
      });
      path([[610, 365], [610, 420], [145, 420], [145, 365]], p, C.blue, 3);
      reveal(.3, () => text('Repeat with the updated state', 376, 440, 27, C.blue, 400, 600, 'center'));
      reveal(.6, () => {
        rect(630, 450, 315, 85, moving ? C.pale : C.soft, moving ? C.teal : C.coral);
        text(moving ? 'Crossing at 6.0664 s' : 'Stop at 6.43271 s', 785, 466, 27, moving ? C.tealDark : C.coral, 700, 290, 'center');
        text(moving ? 'conditional, fitting body' : 'unsupported contact', 785, 503, 21, C.muted, 400, 290, 'center');
      });
      caption(moving ? 'Gate crossing is computed under the retained-mechanism assumptions.' : 'A bounded stop leaves eventual passage unresolved.');
    }
  }

  function wu() {
    const x0 = 72, y0 = 260, cell = 72;
    const points = Array.from({length:7}, (_, i) => [x0 + (i + .5) * cell, y0 + 2.5 * cell]);
    points.push([x0 + 6.5 * cell, y0 + 1.5 * cell]);
    for (let x = 0; x < 7; x++) for (let y = 0; y < 3; y++) {
      const inRoute = y === 2 || (x === 6 && y === 1);
      rect(x0 + x * cell, y0 + y * cell, cell - 5, cell - 5, inRoute ? C.pale : C.soft, C.line);
    }
    text('Only route-witness cells highlighted', 72, 232, 23, C.muted, 400, 560);
    rect(x0 + 5 * cell + 9, y0 + 2 * cell + 9, 48, 48, C.white, C.blue);
    text('D', x0 + 5.5 * cell - 2, y0 + 2.5 * cell - 19, 30, C.blue, 700, 60, 'center');
    if (stage === 1) {
      path(points, p, C.teal, 4, true);
      reveal(.35, () => {
        wrap('state = cell + action step', 650, 260, 290, 31, C.tealDark, 700, 3);
        wrap('move or wait', 650, 382, 290, 28, C.ink);
        wrap('then door toggle', 650, 440, 290, 28, C.blue);
      });
      caption('Unobserved door states receive bounds, not invented schedules.');
    } else {
      const step = Math.min(7, Math.floor(progress * 8));
      path(points, step / 7, C.teal, 6);
      points.forEach(([x,y], i) => { if (i <= step) circle(x, y, 19, C.teal, String(i)); });
      text(`ACTION ${step}`, 670, 260, 34, C.tealDark, 700, 260);
      wrap('Door open at preceding state 4', 650, 335, 290, 28, C.blue, 400, 3);
      if (step === 7) wrap('Goal reached in the saved route', 650, 450, 290, 28, C.tealDark, 700, 3);
      caption('All-closed unknown completion; recorded door states are preserved.');
    }
  }

  function sosa() {
    const nodes = [{x:190,y:320,label:'Ball'}, {x:560,y:320,label:'Goal'}, {x:190,y:485,label:'Slide'}, {x:560,y:485,label:'Container'}];
    const edges = [[0,1],[0,2],[1,3],[0,3],[1,2],[2,3]];
    edges.forEach(([a,b], i) => {
      const u=nodes[a], v=nodes[b];
      line(u.x,u.y,u.x+(v.x-u.x)*clamp((p-i*.07)*2),u.y+(v.y-u.y)*clamp((p-i*.07)*2),i===0?C.teal:C.line,3);
    });
    nodes.forEach((n,i) => reveal(i < 2 ? 0 : .25, () => card(n.x-80,n.y-30,160,60,n.label,i<2?C.teal:C.blue,26)));
    if (stage === 1) {
      text('target pair', 375, 260, 23, C.tealDark, 400, 300, 'center');
      text('+ scene context', 375, 540, 25, C.blue, 700, 350, 'center');
      wrap('Every supported node and pair', 735, 310, 215, 29, C.ink, 700, 4);
    } else {
      text('Observed t_i', 375, 248, 27, C.tealDark, 700, 400, 'center');
      line(695,240,695,550,C.coral,3,true);
      wrap('Scene disappears', 730, 245, 220, 28, C.coral, 700, 3);
      text('?', 830, 375, 90, C.coral, 700, 150, 'center');
      wrap('No future edges computed', 730, 485, 220, 27, C.muted, 400, 3);
    }
  }

  function beller() {
    if (stage === 1) {
      text('SOURCE FRAME 122 / 2.44 s', 60, 242, 26, C.blue, 700);
      const A=[210,335],B=[298,507];
      line(120,285,120,535,C.gray,2); line(120,285,430,285,C.gray,2);
      arrow(410,285,455,285,C.gray,2); text('x',462,270,23,C.muted);
      circle(...A,40,C.teal,'A'); circle(...B,40,C.blue,'B');
      reveal(.2, () => {
        text('A  (394.50, 219.50)', 535, 315, 30, C.tealDark, 700, 410);
        text('B  (438.50, 305.50)', 535, 390, 30, C.blue, 700, 410);
        text('radius 30.20 px each', 535, 465, 27, C.muted, 400, 410);
      });
      caption('Before-event anchors; image pixels, not a removed-A world.');
    } else {
      const labels=['before','encounter','after'];
      labels.forEach((label,i) => {
        card(70+i*310,260,230,65,label,i===1?C.coral:C.teal,29);
        if(i<2)arrow(310+i*310,293,367+i*310,293,C.teal,3,p);
      });
      reveal(.15,()=>{ text('E1 / frame 122',85,355,27,C.blue,700); text('A + B positions',85,402,26); });
      reveal(.4,()=>{ card(390,385,220,70,'Candidate E1',C.coral,25); });
      arrow(310,419,375,419,C.teal,3,p); arrow(625,419,690,419,C.teal,3,p,true);
      reveal(.55,()=>wrap('Chronological path constraints',715,372,220,29,C.tealDark,700,3));
      caption('Before/after fits and local positions accompany each candidate event.');
    }
  }

  function smith() {
    if (stage===1) {
      card(65,250,245,65,'target velocity',C.teal,26);
      card(65,410,245,65,'occluder velocity',C.blue,24);
      for(let i=0;i<3;i++){
        const x=430+i*210;
        text(['before','2.88 s','after'][i],x,250,25,C.muted,700,160,'center');
        reveal(i*.2,()=>{
          rect(x-70,305,140,70,C.soft,C.coral,true);
          text('unknown',x,326,25,C.coral,400,130,'center');
          rect(x-70,425,140,55,C.pale,C.blue);
          text(['left / up','not fitted','right / down'][i],x,442,20,C.blue,400,130,'center');
        });
      }
      caption('Velocity fits require supported adjacent observations.');
    }else{
      line(100,340,900,340,C.line,4);
      circle(170,340,30,C.teal,''); circle(830,340,30,C.teal,'');
      line(210,340,410,340,C.teal,5); line(590,340,790,340,C.teal,5);
      rect(420,295,160,90,C.white,C.coral,true); text('?',500,309,58,C.coral,700,120,'center');
      text('pair observation unavailable',500,235,30,C.coral,700,750,'center');
      reveal(.25,()=>text('2.88 s / frame 72',500,420,31,C.ink,700,750,'center'));
      reveal(.5,()=>text('Target velocity: unknown before AND after',500,485,30,C.muted,400,900,'center'));
      caption('The blank remains blank: no interpolation, disappearance or verdict.');
    }
  }

  function stephan() {
    const from=[830,480],to=[155,320];
    const at=u=>[from[0]+(to[0]-from[0])*u,from[1]+(to[1]-from[1])*u];
    text('Hypothetical centerline, not observed motion',60,228,25,C.muted);
    line(...from,...to,C.line,4,true);
    if(stage===1){
      path([from,to],p,C.blue,4,true);
      text('p(u) = start + u (target - start)',470,565,29,C.blue,700,650,'center');
      text('u = 0',870,430,24,C.muted); text('u = 1',100,270,24,C.muted);
    } else {
      const a=at(.34395107),b=at(.43563265);
      rect(b[0],b[1]-25,a[0]-b[0],a[1]-b[1]+50,C.soft,C.coral,true);
      line(...from,...to,C.blue,4);
      line(...a,...b,C.coral,16);
      const u=.34395107+(.43563265-.34395107)*p;
      circle(...at(u),8,C.coral,'');
      arrow(485,330,(a[0]+b[0])/2,(a[1]+b[1])/2-15,C.coral,3,p);
      text('barrier intersection',470,285,30,C.coral,700,430,'center');
      text('u = 0.34395107 ... 0.43563265',470,565,27,C.coral,700,850,'center');
    }
    circle(...from,32,C.blue,'B'); circle(...to,28,C.gray,'M');
    text('blue player',from[0],from[1]+45,26,C.blue,700,250,'center');
    text('gray marble',to[0],to[1]+43,26,C.muted,700,250,'center');
  }

  function output() {
    scene.evidence.forEach(([kind,value],i)=>reveal(i*.18,()=>{
      const y=240+i*108, color=i===2?C.coral:C.teal;
      line(60,y,60,y+84,color,4);
      text(kind,80,y,20,color,700,540);
      wrap(value,80,y+28,540,28,C.ink,400,2);
    }));
    line(660,238,660,568,C.line,2);
    reveal(.35,()=>{
      text(scene.id === 'stephan8' ? '+ original diagram' : '+ original video',805,260,26,C.muted,400,270,'center');
      text('+ question',805,305,26,C.muted,400,270,'center');
      arrow(805,350,805,385,C.coral,3);
      card(700,403,215,75,'VLM',C.coral,36);
    });
    reveal(.65,()=>wrap(scene.domain,710,505,210,27,C.coral,700,3));
  }

  if(stage===0)input();
  else if(stage===3)output();
  else if(scene.id==='bass42')bass();
  else if(scene.id.startsWith('ger'))contactChain();
  else if(scene.id==='wu8')wu();
  else if(scene.id==='sosa22')sosa();
  else if(scene.id==='beller20')beller();
  else if(scene.id==='smith5')smith();
  else if(scene.id==='stephan8')stephan();

  line(40,613,960,613);
  wrap(scene.notes[stage],40,632,920,25,C.muted,400,2);
  const names=['Parsed fields','Representation','Operation','VLM input'];
  names.forEach((name,i)=>{
    const x=40+i*235,active=i===stage;
    line(x,708,x+210,708,i<=stage?C.teal:C.line,active?5:2);
    text(`${i+1} ${name}`,x,724,21,active?C.tealDark:C.muted,active?700:400,215);
  });
}
