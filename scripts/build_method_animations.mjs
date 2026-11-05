import {createCanvas} from '@napi-rs/canvas';
import gifenc from 'gifenc';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {SCENES, WIDTH, HEIGHT, paintScene} from './method_animation_scenes.mjs';

const {GIFEncoder, quantize, applyPalette} = gifenc;
const root=fileURLToPath(new URL('../',import.meta.url));
const qaArg=process.argv.find(arg=>arg.startsWith('--qa-dir='));
const qa=qaArg?resolve(qaArg.slice(9)):null;
const postersOnly=process.argv.includes('--posters-only');
const methodsBytes=await readFile(resolve(root,'data/post-parsing-methods.json'));
const methods=JSON.parse(methodsBytes).methods;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(resolve(root,'assets/methods'),{recursive:true});
if(qa)await mkdir(qa,{recursive:true});
const canvas=createCanvas(WIDTH,HEIGHT),ctx=canvas.getContext('2d');
const blend=createCanvas(WIDTH,HEIGHT),blendCtx=blend.getContext('2d');
const records=[];

for(const scene of SCENES){
  const method=methods.find(m=>m.panel_id===scene.id);
  for(const term of scene.terms)if(!method.example.evidence.includes(term))throw new Error(`${scene.id}: saved evidence no longer supports ${term}`);
  const stageHashes=[];
  const overview=qa?createCanvas(WIDTH*2,HEIGHT*2):null;
  for(let stage=0;stage<4;stage++){
    paintScene(ctx,scene,stage,1);
    overview?.getContext('2d').drawImage(canvas,(stage%2)*WIDTH,Math.floor(stage/2)*HEIGHT);
    const png=await canvas.encode('png');
    stageHashes.push(hash(png));
    if(qa)await writeFile(resolve(qa,`${scene.id}-stage-${stage+1}.png`),png);
  }
  if(qa)await writeFile(resolve(qa,`${scene.id}-overview.png`),await overview.encode('png'));
  const poster=`assets/methods/${scene.id}-method.png`;
  const posterBytes=await canvas.encode('png');
  await writeFile(resolve(root,poster),posterBytes);
  if(postersOnly){console.log(`${scene.id}: four layouts checked`);continue;}
  const gif=GIFEncoder();
  let frameCount=0,durationMs=0;
  function encode(delay){
    const rgba=ctx.getImageData(0,0,WIDTH,HEIGHT).data;
    const palette=quantize(rgba,128);
    gif.writeFrame(applyPalette(rgba,palette),WIDTH,HEIGHT,{palette,delay,repeat:0});
    frameCount++;durationMs+=delay;
  }
  for(let stage=0;stage<4;stage++){
    for(let step=1;step<=20;step++){paintScene(ctx,scene,stage,step/20);encode(100);}
    encode(stage===3?4000:2000);
    if(stage===3)continue;
    blendCtx.drawImage(canvas,0,0);
    for(let step=1;step<=4;step++){
      paintScene(ctx,scene,stage+1,.05);
      ctx.save();ctx.globalAlpha=1-step/4;ctx.drawImage(blend,0,0);ctx.restore();encode(100);
    }
  }
  gif.finish();
  const bytes=gif.bytes();
  const url=`assets/methods/${scene.id}-method.gif`;
  await writeFile(resolve(root,url),bytes);
  records.push({panel_id:scene.id,url,poster,width:WIDTH,height:HEIGHT,frame_count:frameCount,duration_ms:durationMs,
    sha256:hash(bytes),poster_sha256:hash(posterBytes),stage_sha256:stageHashes,
    kind:'method_schematic',stages:scene.stages,alt:scene.alt,
    example_kind:method.example.kind,evidence_source_sha256:method.example.sha256,source_ids:method.source_ids});
  console.log(`${scene.id}: ${frameCount} frames, ${(durationMs/1000).toFixed(1)} s, ${(bytes.length/1024).toFixed(0)} KiB`);
}
if(!postersOnly)await writeFile(resolve(root,'data/method-animations.json'),JSON.stringify({schema_version:1,
  scope:'Animated explanations of eight distinct development methods. Geometry and animation timing are schematic, not source-video replay. Saved facts are paraphrased from the cited evidence; Sosa is wholly schematic. No new parsing, simulation, VLM inference or answer is produced.',
  methods_sha256:hash(methodsBytes),records},null,2)+'\n');
