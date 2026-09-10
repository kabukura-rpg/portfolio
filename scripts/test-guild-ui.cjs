// Run with Node.js; lifecycle tests require no browser dependencies.
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const {join} = require('node:path');
function harness(script,{mobile=true,reduced=false}={}) {
  let now=0,id=0,focus=null;
  const timers=new Map();
  class Element {
    constructor(){this.events={};this.attrs={};this.dataset={};this.style={overflow:''};const set=new Set();this.classList={add:x=>set.add(x),remove:x=>set.delete(x),contains:x=>set.has(x),toggle:(x,on)=>on?set.add(x):set.delete(x)};}
    addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
    fire(type,event={}){for(const fn of this.events[type]||[])fn(event);}
    setAttribute(k,v){this.attrs[k]=v;}
    getAttribute(k){return this.attrs[k]??null;}
    focus(){focus=this;}
    contains(el){return el===this;}
    getBoundingClientRect(){return {left:10,right:100,top:10,bottom:100};}
  }
  const document=new Element(),window=new Element(),header=new Element(),footer=new Element(),menu=new Element(),toggle=new Element(),grid=new Element(),dialog=new Element(),detail=new Element(),close=new Element(),opener=new Element();
  const mobileQuery=new Element(),reducedQuery=new Element();mobileQuery.matches=mobile;reducedQuery.matches=reduced;
  document.body=new Element();
  const selectors={'[data-header]':header,'[data-footer]':footer,'.main-nav':menu,'.menu-toggle':toggle,'[data-characters]':grid,'#character-dialog':dialog};
  document.querySelector=s=>selectors[s];document.querySelectorAll=()=>[];
  dialog.querySelector=s=>s==='[data-detail]'?detail:close;
  dialog.open=false;dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;dialog.fire('close');};
  opener.dataset.character='0';opener.closest=()=>opener;
  window.KABUKURA_CHARACTERS=[{name:'テスト仲間',image:'./test.jpeg',description:'仲間'}];window.kabukuraIcon=()=>'';
  runInNewContext(readFileSync(join(__dirname,'../assets/js',script),'utf8'),{document,window,location:{href:'https://example.com/guild/characters.html',pathname:'/guild/characters.html'},matchMedia:q=>q.includes('reduced')?reducedQuery:mobileQuery,URL,HTMLImageElement:class {},setTimeout(fn,ms){timers.set(++id,{fn,time:now+ms});return id;},clearTimeout:key=>timers.delete(key)});
  function tick(ms){const end=now+ms;while(true){const next=[...timers].find(([,t])=>t.time<=end);if(!next)break;timers.delete(next[0]);now=next[1].time;next[1].fn();}now=end;}
  return {document,window,header,menu,toggle,grid,dialog,close,opener,mobileQuery,reducedQuery,tick,focus:()=>focus,open:()=>grid.fire('click',{target:opener}),toggleMenu:()=>toggle.fire('click',{stopPropagation(){}})};
}
let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
test('mobile menu inaccessible while closed and accessible when open',()=>{const h=harness('common.js');assert.equal(h.menu.inert,true);h.toggleMenu();assert.equal(h.menu.inert,false);assert.equal(h.toggle.getAttribute('aria-expanded'),'true');h.toggleMenu();assert.equal(h.menu.inert,true);});
test('desktop navigation is never inert',()=>{const h=harness('common.js',{mobile:false});assert.equal(h.menu.inert,false);h.window.fire('pageshow');assert.equal(h.menu.inert,false);});
test('Escape closes menu and restores toggle focus',()=>{const h=harness('common.js');h.toggleMenu();h.document.fire('keydown',{key:'Escape'});assert.equal(h.menu.inert,true);assert.equal(h.focus(),h.toggle);});
test('leaving header with keyboard closes menu',()=>{const h=harness('common.js');h.toggleMenu();h.document.fire('focusin',{target:{}});assert.equal(h.menu.inert,true);});
test('menu link selection closes the panel',()=>{const h=harness('common.js');h.toggleMenu();h.document.fire('click',{target:{closest:()=>({})}});assert.equal(h.menu.inert,true);});
test('viewport change restores desktop links',()=>{const h=harness('common.js');h.mobileQuery.matches=false;h.mobileQuery.fire('change');assert.equal(h.menu.inert,false);});
test('bfcache restoration closes menu',()=>{const h=harness('common.js');h.toggleMenu();h.window.fire('pageshow');assert.equal(h.menu.inert,true);assert.equal(h.toggle.getAttribute('aria-expanded'),'false');});
test('status closes within 220ms and restores focus and scroll',()=>{const h=harness('characters.js');h.document.body.style.overflow='auto';h.open();assert(h.dialog.open);assert.equal(h.document.body.style.overflow,'hidden');h.close.fire('click');h.tick(219);assert(h.dialog.open);h.tick(1);assert(!h.dialog.open);assert.equal(h.document.body.style.overflow,'auto');assert.equal(h.focus(),h.opener);});
test('repeated close does not prolong the timer',()=>{const h=harness('characters.js');h.open();h.close.fire('click');h.tick(100);h.close.fire('click');h.tick(120);assert(!h.dialog.open);});
for(const options of [{mobile:false},{reduced:true}])test('instant close '+JSON.stringify(options),()=>{const h=harness('characters.js',options);h.open();h.close.fire('click');assert(!h.dialog.open);});
test('native Escape cancel uses the same close lifecycle',()=>{const h=harness('characters.js');h.open();let prevented=false;h.dialog.fire('cancel',{preventDefault(){prevented=true;}});assert(prevented);h.tick(220);assert(!h.dialog.open);});
test('backdrop dismisses, interior click does not',()=>{const h=harness('characters.js');h.open();h.dialog.fire('click',{target:h.dialog,clientX:50,clientY:50});h.tick(220);assert(h.dialog.open);h.dialog.fire('click',{target:h.dialog,clientX:0,clientY:0});h.tick(220);assert(!h.dialog.open);});
test('motion preference change during close releases modal immediately',()=>{const h=harness('characters.js');h.open();h.close.fire('click');h.reducedQuery.matches=true;h.reducedQuery.fire('change');assert(!h.dialog.open);});
test('navigation away releases scroll lock',()=>{const h=harness('characters.js');h.open();h.window.fire('pagehide');assert(!h.dialog.open);assert.equal(h.document.body.style.overflow,'');});
test('reopening has no stale timer or closing class',()=>{const h=harness('characters.js');h.open();h.close.fire('click');h.tick(220);h.open();h.tick(500);assert(h.dialog.open);assert(!h.dialog.classList.contains('is-closing'));});
console.log(`${count} tests passed`);
