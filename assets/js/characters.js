(() => {
'use strict';
const grid=document.querySelector('[data-characters]'),dialog=document.querySelector('#character-dialog');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl=value=>{try{const u=new URL(value,location.href);return ['http:','https:','file:'].includes(u.protocol)?u.href:'./assets/images/placeholders/adventurer.svg';}catch{return './assets/images/placeholders/adventurer.svg';}};
const portrait=(c,i)=>`<div class="portrait"><span class="portrait-tag">GUILD MEMBER / ${String(i+1).padStart(2,'0')}</span><img src="${esc(imageUrl(c.image))}" alt="${esc(c.name)}${c.placeholder?'の仮画像':'の立ち絵'}" width="240" height="280" loading="lazy">${c.placeholder?'<span class="portrait-label">PORTRAIT COMING SOON</span>':''}</div>`;
const members=window.KABUKURA_CHARACTERS||[];
grid.innerHTML=members.map((c,i)=>`<article class="character-card">${portrait(c,i)}<div class="character-body"><h2>${esc(c.name)}</h2><span class="class-label">CLASS / ${esc(c.className)}</span><p>${esc(c.description)}</p><button class="gold-button" data-character="${i}" aria-haspopup="dialog" aria-label="${esc(c.name)}の詳細を見る">詳細を見る ${window.kabukuraIcon('arrow')}</button></div></article>`).join('')||'<p class="empty-state">冒険者の情報を準備中です。</p>';
let opener;
const rating=v=>Number.isInteger(v)&&v>=0&&v<=5?'★'.repeat(v)+'☆'.repeat(5-v):'未設定';
grid.addEventListener('click',e=>{const button=e.target.closest('[data-character]');if(!button)return;const index=Number(button.dataset.character),c=members[index];if(!c)return;opener=button;dialog.querySelector('[data-detail]').innerHTML=`<div class="modal-layout">${portrait(c,index)}<div class="modal-copy"><p class="eyebrow">Adventurer profile</p><h2 id="character-name">${esc(c.name)}</h2><span class="class-label">CLASS / ${esc(c.className)}</span><dl class="stats">${[['HP','hp'],['投資力','investing'],['開発力','development']].map(([label,key])=>`<div class="stat"><dt>${label}</dt><dd>${rating(c.stats?.[key])}</dd></div>`).join('')}</dl><p class="eyebrow">PROFILE</p><p>${esc(c.profile||c.description)}</p></div></div>`;dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('.modal-close').focus();});
dialog.querySelector('.modal-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='./assets/images/placeholders/adventurer.svg';e.target.alt='人物画像を準備中';}},true);
})();
