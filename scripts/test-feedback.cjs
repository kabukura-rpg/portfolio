const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const {join}=require('node:path');
const source=readFileSync(join(__dirname,'../assets/js/feedback.js'),'utf8');
function harness({saved=null,mobile=true,reduced=false,audio=true,haptics=true,storage=true,audioFails=false,vibrateFails=false}={}){
 const records={contexts:0,tones:[],vibrations:[],saved:[],stops:0};let time=0;
 class Element{constructor(){this.events={};this.children=[];this.attrs={};this.dataset={};}addEventListener(t,fn){(this.events[t]??=[]).push(fn);}fire(t,e={}){(this.events[t]||[]).forEach(fn=>fn(e));}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}hasAttribute(k){return k in this.attrs;}append(...xs){this.children.push(...xs);}closest(){return this;}}
 const menu=new Element(),doc=new Element(),win=new Element();doc.hidden=false;doc.querySelector=()=>menu;doc.createElement=()=>new Element();
 const mq=new Element(),rm=new Element();mq.matches=mobile;rm.matches=reduced;
 class Engine{constructor(){if(audioFails)throw Error('unsupported');records.contexts++;this.state='running';this.currentTime=0;this.destination={};}resume(){return Promise.resolve();}suspend(){return Promise.resolve();}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}createOscillator(){return {frequency:{setValueAtTime(f,t){records.tones.push({f,t});}},connect(){},disconnect(){},start(){},stop(){records.stops++;}};}}
 if(audio)win.AudioContext=Engine;
 const nav={};if(haptics)nav.vibrate=ms=>{records.vibrations.push(ms);return !vibrateFails;};
 runInNewContext(source,{document:doc,window:win,navigator:nav,sessionStorage:{getItem(){if(!storage)throw Error();return saved&&JSON.stringify(saved);},setItem(k,v){if(!storage)throw Error();records.saved.push({k,v:JSON.parse(v)});}},matchMedia:q=>q.includes('reduced')?rm:mq,performance:{now:()=>time},Promise});
 const [soundButton,vibrationButton,note]=menu.children[0].children;
 const action=kind=>{const el=new Element();el.dataset.navigation=kind;el.closest=selector=>selector==='[data-feedback]'?null:el;return el;};
 function click(target,extras={}){time+=150;doc.fire('click',{target,button:0,isTrusted:true,...extras});}
 return {records,doc,win,mq,rm,soundButton,vibrationButton,note,action,click};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
let count=0;
async function test(name,fn){await fn();count++;console.log('PASS '+name);}
(async()=>{
 await test('initial load and ordinary tap stay silent',async()=>{const h=harness();h.click(h.action('door'));await flush();assert.equal(h.records.contexts,0);assert.deepEqual(h.records.vibrations,[]);assert.equal(h.soundButton.getAttribute('aria-pressed'),'false');});
 await test('restored opt-in does not auto-play on page load',async()=>{const h=harness({saved:{sound:true,vibration:true}});await flush();assert.equal(h.records.contexts,0);assert.deepEqual(h.records.vibrations,[]);});
 await test('explicit sound opt-in creates one quiet short cue',async()=>{const h=harness();h.click(h.soundButton);await flush();assert.equal(h.records.contexts,1);assert.equal(h.records.tones.length,1);assert.equal(h.soundButton.textContent,'SOUND ON');assert.equal(h.records.vibrations.length,0);});
 await test('door and quest have distinct cues',async()=>{const h=harness({saved:{sound:true}});h.click(h.action('door'));await flush();assert.equal(h.records.tones.length,2);h.records.tones.length=0;h.click(h.action('game'));await flush();assert.equal(h.records.tones.length,3);assert(h.records.tones[2].f>h.records.tones[0].f);});
 await test('turning sound off cancels a queued cue',async()=>{const h=harness();h.click(h.soundButton);h.click(h.soundButton);await flush();assert.equal(h.records.tones.length,0);assert.equal(h.soundButton.textContent,'SOUND OFF');});
 await test('untrusted events cannot enable sound',async()=>{const h=harness();h.click(h.soundButton,{isTrusted:false});await flush();assert.equal(h.records.contexts,0);assert.equal(h.soundButton.textContent,'SOUND OFF');});
 for(const extras of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}])await test('native modified action '+JSON.stringify(extras),async()=>{const h=harness({saved:{sound:true,vibration:true}});h.click(h.action('door'),extras);await flush();assert.equal(h.records.contexts,0);assert.deepEqual(h.records.vibrations,[]);});
 await test('desktop never plays',async()=>{const h=harness({mobile:false,saved:{sound:true,vibration:true}});h.click(h.action('game'));await flush();assert.equal(h.records.contexts,0);assert.deepEqual(h.records.vibrations,[]);});
 await test('vibration is independent and bounded at 15ms',()=>{const h=harness();h.click(h.vibrationButton);assert.deepEqual(h.records.vibrations,[15]);assert.equal(h.records.contexts,0);});
 await test('unsupported vibration is visibly disabled',()=>{const h=harness({haptics:false});assert(h.vibrationButton.disabled);h.click(h.vibrationButton);assert.deepEqual(h.records.vibrations,[]);});
 await test('reduced motion blocks vibration even when saved ON',()=>{const h=harness({reduced:true,saved:{vibration:true}});h.click(h.action('game'));assert.deepEqual(h.records.vibrations,[]);assert(h.vibrationButton.disabled);});
 await test('denied vibration fails safely',()=>{const h=harness({vibrateFails:true});h.click(h.vibrationButton);assert(h.vibrationButton.disabled);});
 await test('unsupported audio is visibly disabled',()=>{const h=harness({audio:false});assert(h.soundButton.disabled);h.click(h.soundButton);assert.equal(h.records.contexts,0);});
 await test('audio constructor failure leaves navigation independent',()=>{const h=harness({audioFails:true});h.click(h.soundButton);assert(h.soundButton.disabled);});
 await test('blocked storage retains usable in-page preference',async()=>{const h=harness({storage:false});h.click(h.soundButton);await flush();assert.equal(h.soundButton.textContent,'SOUND ON');assert(h.note.textContent.includes('このページ'));});
 await test('only namespaced session preference is written',()=>{const h=harness();h.click(h.vibrationButton);assert.equal(h.records.saved[0].k,'kabukura.portal.feedback.v1');assert.deepEqual(h.records.saved[0].v,{sound:false,vibration:true});});
 await test('pagehide cancels pending playback',async()=>{const h=harness({saved:{sound:true}});h.click(h.action('game'));h.win.fire('pagehide');await flush();assert.equal(h.records.tones.length,0);});
 await test('hidden tab cancels pending playback',async()=>{const h=harness({saved:{sound:true}});h.click(h.action('door'));h.doc.hidden=true;h.doc.fire('visibilitychange');await flush();assert.equal(h.records.tones.length,0);});
 await test('scroll and blank-target links bypass feedback',async()=>{const h=harness({saved:{sound:true,vibration:true}});h.click(h.action('scroll'));const el=h.action('game');el.setAttribute('target','_blank');h.click(el);await flush();assert.equal(h.records.contexts,0);assert.deepEqual(h.records.vibrations,[]);});
 console.log(`${count} tests passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
