import {escapeHTML as e, safeURL, validateContent} from './shared.js';
const $ = s => document.querySelector(s);
function art(value, alt, cls='') {
  const el = document.createElement('div'); el.className='art '+cls; el.role='img'; el.setAttribute('aria-label',alt);
  if (/^atlas:[0-3]$/.test(value)) el.classList.add('atlas','q'+value.split(':')[1]);
  else { const url=safeURL(value); if(url) el.style.backgroundImage=`url(${JSON.stringify(url)})`; }
  return el;
}
let data, active='All';
const dialog=$('#project'); let opener;
function showProject(w){
  opener=document.activeElement;
  const body=$('#projectBody'); body.innerHTML=`<h2>${e(w.title)}</h2><p class="eyebrow">${e(w.year)} / ${e(w.medium)}</p>${w.demo?'<p class="demo-label">ILLUSTRATIVE PROJECT · AI-GENERATED IMAGERY</p>':''}<div id="detailCover"></div><p>${e(w.description)}</p>`;
  body.querySelector('#detailCover').replaceWith(art(w.image,w.title));
  for(const img of w.gallery||[]) {const url=safeURL(img);if(url){const el=document.createElement('img');el.src=url;el.alt=w.title+' — detail';el.loading='lazy';body.append(el);}}
  if(safeURL(w.video)){const v=document.createElement('video');v.controls=true;v.preload='metadata';v.src=safeURL(w.video);body.append(v);}
  if(safeURL(w.attachment)){const a=document.createElement('a');a.href=safeURL(w.attachment);a.textContent='View project document ↗';a.target='_blank';a.rel='noopener';body.append(a);}
  dialog.showModal();
}
$('#closeProject').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());dialog.onclick=event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}};
function renderWorks(){
  $('#filters').replaceChildren();for(const category of ['All',...new Set(data.works.map(w=>w.category).filter(Boolean))]){const b=document.createElement('button');b.textContent=category;b.setAttribute('aria-pressed',category===active);b.onclick=()=>{active=category;renderWorks();};$('#filters').append(b);}
  $('#workGrid').replaceChildren();const selected=data.works.filter(w=>active==='All'||w.category===active);$('#empty').hidden=selected.length>0;
  for(const w of selected){const b=document.createElement('button');b.className='work-card';b.setAttribute('aria-label','View '+w.title);b.append(art(w.image,w.title));const t=document.createElement('div');t.innerHTML=`<div class="work-meta"><h3>${e(w.title)} ↗</h3><span>${e(w.year)}</span></div><p>${e(w.medium)}</p>${w.demo?'<span class="demo-label">ILLUSTRATIVE PROJECT / REPLACEABLE IMAGE</span>':''}`;b.append(t);b.onclick=()=>showProject(w);$('#workGrid').append(b);}
}
function render(){
  const p=data.profile;document.title=p.name+' — Artist & researcher';$('#brand').textContent=p.name.toUpperCase();$('#name').innerHTML=e(p.name)+'<span>'+e(p.role)+'</span>';
  for(const k of ['intro','location','portraitCaption','statement','research','contactNote'])$('#'+k).textContent=p[k]||'';
  $('#portrait').replaceWith(Object.assign(art(p.portrait,p.portraitCaption||p.name),{id:'portrait'}));
  if(safeURL(p.cv)){$('#cv').hidden=false;$('#cv').href=safeURL(p.cv);$('#cv').target='_blank';$('#cv').rel='noopener';}
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email||'')?p.email:'';$('#email').textContent=email||'Contact details coming soon';if(email)$('#email').href='mailto:'+email;
  $('#workCount').textContent=String(data.works.length).padStart(2,'0');renderWorks();
  $('#archiveRows').innerHTML=data.archive.map(g=>`<div class="archive-group"><h3>${e(g.title)}</h3><div>${g.items.map(x=>`<div class="archive-item"><span class="year">${e(x.year)}</span><p>${safeURL(x.url)?`<a href="${e(safeURL(x.url))}" target="_blank" rel="noopener">${e(x.title)} ↗</a>`:e(x.title)}<small>${e(x.detail)}</small></p></div>`).join('')}</div></div>`).join('');
  $('#socials').innerHTML=(p.socials||[]).filter(x=>safeURL(x.url)).map(x=>`<a href="${e(safeURL(x.url))}" target="_blank" rel="noopener">${e(x.label)} ↗</a>`).join('');$('#copyright').textContent='© '+new Date().getFullYear()+' '+p.name;
}
try{if(new URLSearchParams(location.search).has('preview')){data=JSON.parse(localStorage.getItem('studio-preview'));document.body.classList.add('preview');}if(!data){const r=await fetch('data/content.json',{cache:'no-cache'});if(!r.ok)throw Error('Load failed');data=await r.json();}validateContent(data);render();}catch(err){$('#loadError').hidden=false;console.error(err);}
