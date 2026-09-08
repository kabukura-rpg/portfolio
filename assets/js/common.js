(() => {
'use strict';
const paths = { sword:'<path d="m14.5 3 6.5 0 0 6.5-11 11-6.5-6.5z"/><path d="m3 3 5 5m8 8 5 5M3 21l4-4m-3-6 9 9"/>', scroll:'<path d="M8 4h11a3 3 0 0 1 3 3v2h-5V7a3 3 0 0 1 3-3M7 4a3 3 0 0 0-3 3v12a2 2 0 0 1-4 0v-2h14v2a2 2 0 0 0 4 0V8"/><path d="M8 9h5m-5 4h5"/>', users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>', monitor:'<rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8m-4-4v4m-4-9 3 3 5-6"/>', mobile:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4m-2-12-2 4 3 1-2 4"/>', arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>', user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>', lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>', menu:'<path d="M3 6h18M3 12h18M3 18h18"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>', back:'<path d="M20 12H4m6-6-6 6 6 6"/>' };
window.kabukuraIcon=(name)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.sword}</svg>`;
const icon=window.kabukuraIcon;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const links=[['index.html','TOP'],['about.html','株クラRPGとは'],['characters.html','人物紹介'],['games-pc.html','PCゲーム'],['games-mobile.html','スマホゲーム']];
const current=location.pathname.split('/').pop() || 'index.html';
const nav=links.map(([url,label])=>`<a href="./${url}"${current===url?' aria-current="page"':''}>${label}</a>`).join('');
const header=document.querySelector('[data-header]');
if(header)header.innerHTML=`<div class="container header-inner"><a href="./index.html" class="brand">${icon('sword')}<span>株クラRPG<small>ADVENTURERS GUILD</small></span></a><button class="menu-toggle" aria-label="メニューを開く" aria-expanded="false" aria-controls="main-nav">${icon('menu')}</button><nav class="main-nav" id="main-nav" aria-label="メインナビゲーション">${nav}</nav></div>`;
const config=window.KABUKURA_SITE||{};
const safeUrl=value=>{try {const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const social=[['X',config.xUrl],['GitHub',config.githubUrl]].map(([label,url])=>{const href=url&&safeUrl(url);return href?`<a href="${href.replaceAll('&','&amp;').replaceAll('"','&quot;')}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:`<span class="social-unset">${label}（準備中）</span>`;}).join('');
document.querySelector('[data-footer]').innerHTML=`<div class="container"><div class="footer-top"><a class="footer-brand" href="./index.html">株クラRPG</a><nav class="footer-nav" aria-label="フッターナビゲーション">${nav}</nav></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} 株クラRPG</span><div class="social-links">${social}</div><span>さあ、爆益の先へ。</span></div></div>`;
const toggle=document.querySelector('.menu-toggle'),menu=document.querySelector('.main-nav');
if(toggle&&menu){
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','メニューを開く');menu.classList.remove('is-open');toggle.innerHTML=icon('menu');}
toggle.addEventListener('click',e=>{e.stopPropagation();const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');menu.classList.toggle('is-open',open);toggle.innerHTML=icon(open?'close':'menu');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('is-open')){closeMenu();toggle.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
matchMedia('(min-width: 768px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
}
})();
