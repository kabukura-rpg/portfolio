// Dependency-free navigation regression tests: node scripts/test-dungeon.cjs
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(new URL('../assets/js/dungeon.js', `file://${__filename}`), 'utf8');
function harness({mobile=true, reduced=false, io=true, fail=false}={}) {
  let now=0, serial=0;
  const timers=new Map(), events={}, windowEvents={}, navigations=[], elements=[];
  function node() {
    const classes=new Set();
    return {className:'', dataset:{}, classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)}, setAttribute(){},append(){},contains(){return false;},getBoundingClientRect(){return {top:900};}};
  }
  const section=node();
  const media=value=>({matches:value,addEventListener(type,fn){this.change=fn;}});
  const mq=media(mobile), rm=media(reduced);
  const location={href:'https://example.com/guild/index.html',assign(url){if(fail)throw Error('offline');navigations.push({url,time:now});}};
  let observer;
  const document={hidden:false,body:{append(){}},createElement(){const el=node();elements.push(el);return el;},querySelector(){return null;},querySelectorAll(){return [section];},addEventListener(type,fn){(events[type]??=[]).push(fn);},dispatchEvent(){}};
  const window={innerHeight:800,addEventListener(type,fn){(windowEvents[type]??=[]).push(fn);}};
  if(io)window.IntersectionObserver=class {constructor(fn){this.callback=fn;this.observed=new Set();observer=this;}observe(el){this.observed.add(el);}unobserve(el){this.observed.delete(el);}disconnect(){this.observed.clear();}};
  runInNewContext(source,{document,window,location,matchMedia:q=>q.includes('reduced')?rm:mq,IntersectionObserver:window.IntersectionObserver,URL,WeakSet,CustomEvent:class {},setTimeout(fn,ms){timers.set(++serial,{fn,time:now+ms});return serial;},clearTimeout:id=>timers.delete(id)});
  function fire(type,event={}){(events[type]||[]).forEach(fn=>fn(event));}
  function tick(ms){const end=now+ms;while(true){const entry=[...timers].filter(([,t])=>t.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!entry)break;timers.delete(entry[0]);now=entry[1].time;entry[1].fn();}now=end;}
  function link(kind='door',href='./about.html',attrs={}) {return Object.assign(node(),{href:new URL(href,location.href).href,dataset:{navigation:kind,destination:'about'},getAttribute:k=>attrs[k]||null,hasAttribute:k=>k in attrs});}
  function click(el=link(),extras={}){const e={button:0,target:{closest:()=>el},defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extras};fire('click',e);return e;}
  return {link,click,tick,fire,navigations,section,mq,rm,overlay:elements[0],observer,windowFire:type=>(windowEvents[type]||[]).forEach(fn=>fn())};
}
let count=0;
function test(name,fn){fn();console.log(`PASS ${name}`);count++;}
for(const [kind,delay] of [['door',400],['page',360],['game',560]]) test(`${kind} timing and recovery`,()=>{const h=harness();assert(h.click(h.link(kind,kind==='game'?'https://games.example.com/?v=2':'./about.html')).defaultPrevented);h.tick(delay-1);assert.equal(h.navigations.length,0);h.tick(1);assert.equal(h.navigations.length,1);assert.equal(h.navigations[0].time,delay);h.tick(100);assert(!h.overlay.classList.contains('is-visible'));});
for(const options of [{mobile:false},{reduced:true}]) test(`native with ${JSON.stringify(options)}`,()=>{const h=harness(options);assert(!h.click().defaultPrevented);h.tick(1000);assert.equal(h.navigations.length,0);assert(!h.section.classList.contains('explore-pending'));});
for(const extras of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}]) test(`native modified click ${JSON.stringify(extras)}`,()=>{const h=harness();h.click(h.link(),extras);h.tick(1000);assert.equal(h.navigations.length,0);});
for(const [kind,url,attrs] of [['door','./about.html',{target:'_blank'}],['door','./about.html',{download:''}],['scroll','#main',{}],['page','#main',{}],['page','https://other.example.com/',{}],['page','mailto:test@example.com',{}],['page','./index.html',{}]]) test(`native link ${url} ${JSON.stringify(attrs)}`,()=>{const h=harness();assert(!h.click(h.link(kind,url,attrs)).defaultPrevented);h.tick(1000);assert.equal(h.navigations.length,0);});
test('double tap does not delay or duplicate',()=>{const h=harness(),link=h.link();h.click(link);h.tick(200);h.click(link);h.tick(200);assert.equal(h.navigations.length,1);assert.equal(h.navigations[0].time,400);});
test('latest link intent wins',()=>{const h=harness();h.click();h.tick(200);h.click(h.link('door','./characters.html'));h.tick(400);assert.equal(h.navigations.length,1);assert(h.navigations[0].url.endsWith('/characters.html'));});
test('native link cancels pending navigation',()=>{const h=harness();h.click();h.tick(50);assert(!h.click(h.link('scroll','#main')).defaultPrevented);h.tick(1000);assert.equal(h.navigations.length,0);});
for(const type of ['pagehide','pageshow']) test(`${type} resets overlay and timer`,()=>{const h=harness();h.click();h.windowFire(type);h.tick(1000);assert.equal(h.navigations.length,0);assert(!h.overlay.classList.contains('is-visible'));});
test('Escape cancels wait',()=>{const h=harness();h.click();h.fire('keydown',{key:'Escape'});h.tick(1000);assert.equal(h.navigations.length,0);});
test('changing motion preference completes pending intent immediately',()=>{const h=harness();h.click();h.tick(100);h.rm.matches=true;h.rm.change();assert.equal(h.navigations[0].time,100);assert(!h.overlay.classList.contains('is-visible'));});
test('failed navigation releases overlay',()=>{const h=harness({fail:true});h.click();h.tick(400);assert(!h.overlay.classList.contains('is-visible'));});
test('reveal only once on intersection',()=>{const h=harness();assert(h.section.classList.contains('explore-pending'));h.observer.callback([{target:h.section,isIntersecting:true}]);assert(!h.section.classList.contains('explore-pending'));assert.equal(h.observer.observed.size,0);h.windowFire('pageshow');assert(!h.section.classList.contains('explore-pending'));});
test('focused content is immediately visible',()=>{const h=harness();h.fire('focusin',{target:{closest:()=>h.section}});assert(!h.section.classList.contains('explore-pending'));});
test('no IntersectionObserver leaves content visible',()=>{const h=harness({io:false});assert(!h.section.classList.contains('explore-pending'));});
console.log(`${count} tests passed`);
