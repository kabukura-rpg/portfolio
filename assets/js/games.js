(() => {
'use strict';
const grid=document.querySelector('[data-games]'),platform=grid.dataset.games;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{if(!value)return null;try{const u=new URL(value,location.href);return ['http:','https:','file:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const games=(window.KABUKURA_GAMES||[]).filter(g=>g.platform===platform);
const available=g=>g.status==='available'&&safeUrl(g.url);
document.querySelector('.quest-intro p').textContent=games.some(available)?'気になるクエストを選んで、冒険を始めよう。':'クエストはただいま準備中。公開をお楽しみに。';
document.querySelector('[data-count]').textContent=`${games.filter(available).length} 公開中 / ${games.length} クエスト`;
grid.innerHTML=games.map((g,i)=>{const url=available(g),thumb=safeUrl(g.thumbnail);const difficulty=Number.isInteger(g.difficulty)&&g.difficulty>=0&&g.difficulty<=5?'★'.repeat(g.difficulty)+'☆'.repeat(5-g.difficulty):'未定';return `<article class="quest-card ${url?'':'is-locked'}"><div class="quest-art">${thumb?`<img src="${esc(thumb)}" alt="${esc(g.title+' '+g.subtitle)}" width="480" height="300" loading="lazy">`:window.kabukuraIcon(url?'sword':'lock')}<span class="quest-badge">QUEST ${String(i+1).padStart(2,'0')} / ${url?'AVAILABLE':'COMING SOON'}</span></div><div class="quest-body"><h2>${esc(g.title)}</h2><p class="quest-subtitle">${esc(g.subtitle)}</p><div class="quest-meta"><span>${esc(g.controls)}</span><span>PLAYER ${esc(g.players||1)}</span>${g.orientation?`<span>${esc(g.orientation)}推奨</span>`:''}</div><dl class="quest-facts"><div><dt>難易度</dt><dd aria-label="${g.difficulty==null?'未定':`5段階中${g.difficulty}`}">${difficulty}</dd></div><div><dt>対応</dt><dd>${platform==='pc'?'PC':'スマートフォン'}</dd></div></dl>${g.osNote?`<p class="placeholder-note">${esc(g.osNote)}</p>`:''}${url?`<a class="gold-button" href="${esc(url)}"${g.newTab?' target="_blank" rel="noopener noreferrer"':''}>冒険を始める ${window.kabukuraIcon('arrow')}</a>`:`<button class="sub-button" disabled>${window.kabukuraIcon('lock')} 公開準備中</button>`}</div></article>`;}).join('')||'<p class="empty-state">新しいクエストを準備中です。</p>';
grid.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){const img=e.target;img.insertAdjacentHTML('afterend',window.kabukuraIcon('sword'));img.remove();}},true);
})();
