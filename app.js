import {messages,localize} from './i18n.js?v=20261119-taste';
import {escapeHTML as e,safeURL,validateContent,workCategories,pageImages} from './shared.js?v=20261119-banners';
const $=s=>document.querySelector(s);
let previews={};
function imageSource(img,path,responsive=false,hero=false){
  const sources=responsive&&previews[path];
  if(sources){img.src=sources.at(-1).src;img.srcset=sources.map(s=>s.src+' '+s.width+'w').join(',');img.sizes=hero?'100vw':'(max-width:639px) calc(100vw - 48px), (max-width:1023px) calc(50vw - 64px), 50vw';}
  else{img.src=path;img.removeAttribute('srcset');img.removeAttribute('sizes');}
}
function art(value,alt,cls='',responsive=false){
  const el=document.createElement('div');el.className='art m-zoom '+cls;
  const url=safeURL(value);
  if(url){const img=document.createElement('img');imageSource(img,url,responsive);img.alt=alt;img.loading='lazy';img.decoding='async';if(responsive)img.fetchPriority='low';img.width=2000;img.height=1500;img.dataset.source='Artist portfolio';img.dataset.subject=alt;el.append(img);}
  else if(/^atlas:[0-3]$/.test(value)){el.style.backgroundImage="url('assets/studies.png')";el.style.backgroundSize='200% 200%';el.style.backgroundPosition=['0 0','100% 0','0 100%','100% 100%'][+value.at(-1)];el.role='img';el.setAttribute('aria-label',alt);}
  return el;
}
let data,original,active='All';
let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('portfolio-language')||'zh';
if(!['zh','en'].includes(lang))lang='zh';
const t=k=>messages[lang][k];
const dialog=$('#project');let opener;
function showProject(w){
  opener=document.activeElement;
  const body=$('#projectBody');body.innerHTML=`<h2 id="projectTitle">${e(w.title)}</h2><p class="project-meta">${[w.year,w.medium].filter(Boolean).map(e).join(' · ')}</p>${w.demo?`<p class="demo-label">${e(t('demo'))}</p>`:''}<p class="credits">${e(w.credits||'')}</p><div id="detailCover"></div><p class="project-description">${e(w.description)}</p>`;
  body.querySelector('#detailCover').replaceWith(art(w.image,w.title));
  for(const image of w.gallery||[]){const url=safeURL(image);if(url){const img=document.createElement('img');img.src=url;img.alt=w.title+' · '+t('detail');img.className='detail-image';img.loading='lazy';img.decoding='async';body.append(img);}}
  if(safeURL(w.video)){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.src=safeURL(w.video);body.append(video);}
  if(safeURL(w.attachment)){const a=document.createElement('a');a.href=safeURL(w.attachment);a.textContent=t('document');a.className='link';a.target='_blank';a.rel='noopener';body.append(a);}
  dialog.showModal();document.body.classList.add('project-open');
}
$('#closeProject').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{document.body.classList.remove('project-open');opener?.focus();});
dialog.onclick=event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}};
function renderWorks(){
  const categories=data.categories||[...new Map(data.works.flatMap(w=>workCategories(w)).map(c=>[c.id,c])).values()];
  $('#filters').replaceChildren();
  for(const category of [{id:'All',label:t('all')},...categories]){const b=document.createElement('button');b.textContent=category.label;b.type='button';b.setAttribute('aria-pressed',category.id===active);b.onclick=()=>{active=category.id;renderWorks();};$('#filters').append(b);}
  $('#workGrid').replaceChildren();const selected=data.works.filter(w=>active==='All'||workCategories(w,categories).some(c=>c.id===active));$('#empty').hidden=selected.length>0;
  for(const w of selected){
    const b=document.createElement('button');b.type='button';b.className='card work-card span-6';b.setAttribute('aria-label',t('view')+' '+w.title);b.setAttribute('aria-haspopup','dialog');
    const meta=document.createElement('div');meta.innerHTML=`<div class="work-head"><h3>${e(w.title)}</h3><span class="work-year">${e(w.year)}</span></div><p class="work-medium">${workCategories(w,categories).map(c=>e(c.label)).join(' · ')}</p>${w.demo?`<p class="demo-label">${e(t('demo'))}</p>`:''}`;
    b.append(meta,art(w.image,w.title,'',true));if(w===selected[0])b.querySelector('img')?.setAttribute('sizes','(max-width:639px) calc(100vw - 48px), calc(100vw - 160px)');b.onclick=()=>showProject(w);$('#workGrid').append(b);
  }
}
function setImage(id,path,alt){const img=$(id);const url=safeURL(path);img.hidden=!url;if(url){imageSource(img,url,true,['#heroBanner','#portrait','#closingPhoto'].includes(id));img.alt=alt;}}
function render(){
  const openGroups=new Set([...document.querySelectorAll('.archive-group[open]')].map(g=>g.dataset.group));
  data=localize(original,lang);document.documentElement.lang=lang==='zh'?'zh-Hant':'en';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $('#languageToggle').textContent=lang==='zh'?'English':'中文';$('#languageToggle').setAttribute('aria-label',lang==='zh'?'English':'繁體中文');$('#languageToggle').lang=lang==='zh'?'en':'zh-Hant';const destination=new URL(location.href);destination.searchParams.set('lang',lang==='zh'?'en':'zh');$('#languageToggle').href=destination.href;
  $('.nav__toggle').setAttribute('aria-label',t('menu'));$('.nav__links').setAttribute('aria-label',t('navigation'));$('#filters').setAttribute('aria-label',t('filter'));
  const p=data.profile;document.title=p.name+' | '+p.role;$('#brand').textContent=p.name;$('#name').textContent=p.name;$('#role').textContent=p.role;$('#footerName').textContent=p.name;
  for(const key of ['intro','location','statement','research','contactNote'])$('#'+key).textContent=p[key]||'';
  const images=pageImages(data);
  setImage('#heroBanner',images.hero,images.heroAlt);
  setImage('#portrait',images.portrait,images.portraitCaption);
  $('#portraitCaption').textContent=images.portraitCaption;
  $('.cv-portrait').hidden=!safeURL(images.portrait);
  $('#cv').hidden=!safeURL(p.cv);if(safeURL(p.cv)){$('#cv').href=safeURL(p.cv);$('#cv').target='_blank';$('#cv').rel='noopener';}
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email||'')?p.email:'';$('#email').hidden=!email;$('#email').textContent=email;if(email)$('#email').href='mailto:'+email;else $('#email').removeAttribute('href');
  $('#workCount').textContent=String(data.works.length).padStart(2,'0');renderWorks();
  $('#archiveRows').innerHTML=data.archive.map(g=>`<details class="archive-group" data-group="${e(g.id)}"${openGroups.has(g.id)||(!openGroups.size&&g.id==='education')?' open':''}><summary>${e(g.title)}</summary><div class="archive-items">${g.items.map(x=>`<div class="archive-item"><span class="year">${e(x.year)}</span><p>${safeURL(x.url)?`<a href="${e(safeURL(x.url))}" target="_blank" rel="noopener">${e(x.title)}</a>`:e(x.title)}<small>${e(x.detail)}</small></p></div>`).join('')}</div></details>`).join('');
  const researchWork=data.works.find(w=>w.id==='vanishing-route')||data.works[0];
  if(researchWork)setImage('#practicePhoto',researchWork.gallery?.[0]||researchWork.image,researchWork.title);
  setImage('#closingPhoto',images.footer,images.footerAlt);
  $('.closing-photo').hidden=!safeURL(images.footer);
  $('#socials').innerHTML=(p.socials||[]).filter(x=>safeURL(x.url)).map(x=>`<a class="link" href="${e(safeURL(x.url))}" target="_blank" rel="noopener">${e(x.label)}</a>`).join('');$('#copyright').textContent='© '+new Date().getFullYear()+' '+p.name;
  document.documentElement.dataset.contentReady='true';
}
$('#languageToggle').onclick=event=>{event.preventDefault();lang=lang==='zh'?'en':'zh';const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);localStorage.setItem('portfolio-language',lang);render();};
try{
  try{const response=await fetch('assets/previews/manifest.json');if(response.ok)previews=await response.json();}catch{}
  if(new URLSearchParams(location.search).has('preview')){data=JSON.parse(localStorage.getItem('studio-preview'));document.body.classList.add('preview');}
  if(!data){const response=await fetch('data/content.json',{cache:'no-cache'});if(!response.ok)throw Error('Load failed');data=await response.json();}
  validateContent(data);original=data;render();
}catch(error){$('#loadError').hidden=false;console.error(error);}
