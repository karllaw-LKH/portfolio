import {escapeHTML as e, safeURL, validateContent, workCategories, pageImages} from '../shared.js?v=20261119-banners';
const $=s=>document.querySelector(s), KEY='artist-studio-draft-v2', CONFIG='artist-studio-github-v1';
let content,tab='profile',token='',baseSha='',busy=false,dirty=false;
let config=JSON.parse(localStorage.getItem(CONFIG)||'null')||{owner:'karllaw-LKH',repo:'portfolio',branch:'main'};
if(config.owner==='karllawglacia-png'&&config.repo==='phd-portfolio'){
  config={...config,owner:'karllaw-LKH',repo:'portfolio'};
  localStorage.setItem(CONFIG,JSON.stringify(config));
}
let uploads=new Map();
const titles={profile:'个人介绍',works:'作品管理',archive:'履历与成就',settings:'发布设置'};
function status(s,error=false){$('#status').textContent=s;$('#status').style.color=error?'#99472f':'';}
function save(){dirty=true;for(const w of content.works){if(Array.isArray(w.categoryIds)){const first=workCategories(w,content.categories)[0];w.category=first?.label||'';w.category_zh=first?.label_zh||'';}}try{localStorage.setItem(KEY,JSON.stringify(content));status('草稿已保存到此浏览器。点击「发布到网站」后才会更新线上内容。');}catch{status('浏览器存储已满，请立即导出备份。',true);}}
const translatedKeys=new Set(['name','role','intro','location','portraitCaption','heroBannerAlt','footerBannerAlt','statement','research','contactNote','title','category','medium','description','detail','label','credits']);
function field(obj,key,label,multiline=false){
 const wrap=document.createElement('div');wrap.className='field';const translated=translatedKeys.has(key);
 const add=(k,title)=>{const s=document.createElement('label');s.textContent=title;const input=document.createElement(multiline?'textarea':'input');input.id='field-'+crypto.randomUUID();s.htmlFor=input.id;input.value=obj[k]||'';input.oninput=()=>{obj[k]=input.value;save();};wrap.append(s,input);};
 add(key,label+(translated?'（英文）':''));
 if(translated){const sub=document.createElement('label');sub.className='field translation-field';const title=document.createElement('span');title.textContent=label+'（繁體中文）';const input=document.createElement(multiline?'textarea':'input');input.value=obj[key+'_zh']||'';input.oninput=()=>{obj[key+'_zh']=input.value;save();};sub.append(title,input);wrap.append(sub);}
 return wrap;
}
function panel(title,parent=$('#editor')){const d=document.createElement('section');d.className='panel';const h=document.createElement('h2');h.textContent=title;d.append(h);parent.append(d);return d;}
function button(text,fn,cls=''){const b=document.createElement('button');b.textContent=text;b.type='button';b.className=cls;b.onclick=fn;return b;}
function uid(){return crypto.randomUUID();}
function ensurePageImages(){
  const p=content.profile,images=pageImages(content);
  if(p.heroBanner===undefined)p.heroBanner=images.hero;
  if(p.heroBannerAlt===undefined)p.heroBannerAlt=images.heroAlt;
  if(p.heroBannerAlt_zh===undefined)p.heroBannerAlt_zh=p.portraitCaption_zh||p.name_zh||p.name;
  if(p.footerBanner===undefined)p.footerBanner=images.footer;
  if(p.footerBannerAlt===undefined)p.footerBannerAlt=images.footerAlt;
}
function ensureCategories(){
  if(!Array.isArray(content.categories))content.categories=[...new Map(content.works.flatMap(w=>workCategories(w)).map(c=>[c.id,c])).values()];
  for(const w of content.works)if(!Array.isArray(w.categoryIds))w.categoryIds=workCategories(w,content.categories).map(c=>c.id);
}
function categoryChoices(w){
  const group=document.createElement('fieldset');group.className='category-choices';const legend=document.createElement('legend');legend.textContent='所属分类（可多选，同一作品共用内容）';group.append(legend);
  for(const c of content.categories){const label=document.createElement('label');label.className='check';const box=document.createElement('input');box.type='checkbox';box.checked=w.categoryIds.includes(c.id);box.onchange=()=>{w.categoryIds=box.checked?[...new Set([...w.categoryIds,c.id])]:w.categoryIds.filter(id=>id!==c.id);save();};label.append(box,c.label_zh||c.label);group.append(label);}
  return group;
}
function asset(obj,key,label,accept,multiple=false){
  const box=document.createElement('div');box.append(field(obj,key,label,multiple));
  const row=document.createElement('div');row.className='upload-row';const file=document.createElement('input');file.type='file';file.accept=accept;file.multiple=multiple;file.setAttribute('aria-label','上传'+label);
  const note=document.createElement('small');note.className='hint';note.textContent='单个文件 ≤ 20 MB；上传文件公开可访问。';
  file.onchange=async()=>{try{const paths=[];for(const f of file.files){if(f.size>20*1024*1024)throw Error('单个文件请控制在 20 MB 内，大型视频请填写外部 HTTPS 地址。');const ext=f.name.split('.').pop().toLowerCase();if(!/^(png|jpg|jpeg|webp|gif|avif|pdf|mp4|webm|mp3|wav|zip|obj|glb|gltf)$/.test(ext))throw Error('不支持此格式。支持常用图片、PDF、MP4、ZIP、GLB、OBJ。');const path='uploads/'+uid()+'.'+ext;const b64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(f);});uploads.set(path,b64);paths.push(path);}if(multiple)obj[key]=[...(obj[key]||[]),...paths];else obj[key]=paths[0]||obj[key];save();render();status('文件已加入本次发布队列，请保持此页面打开并发布；文件字节不会保存在草稿备份内。');}catch(err){status(err.message,true);}};
  row.append(file,note);box.append(row);return box;
}
function gallery(w){const box=document.createElement('div');const temp={value:(w.gallery||[]).join('\n')};const el=field(temp,'value','更多图片（每行一个地址）',true);el.querySelector('textarea').oninput=ev=>{w.gallery=ev.target.value.split('\n').map(s=>s.trim()).filter(Boolean);save();};box.append(el);const f=asset(w,'gallery','批量上传详情图片','image/png,image/jpeg,image/webp,image/gif,image/avif',true);f.firstElementChild.remove();box.append(f);return box;}
function reorder(list,i,delta){if(i+delta<0||i+delta>=list.length)return;[list[i],list[i+delta]]=[list[i+delta],list[i]];save();render();}
function tools(list,i){const d=document.createElement('div');d.className='tools';d.append(button('上移',()=>reorder(list,i,-1)),button('下移',()=>reorder(list,i,1)),button('删除',()=>{if(confirm('从草稿中删除此项？可在发布前重新读取线上内容恢复。')){list.splice(i,1);save();render();}},'danger'));return d;}
function render(){
  $('#pageTitle').textContent=titles[tab];$('#editor').replaceChildren();document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='profile'){
    ensurePageImages();const p=content.profile;const a=panel('01 / 基本资料');const grid=document.createElement('div');grid.className='grid';for(const [k,l] of [['name','姓名 / 艺术家名称'],['role','身份 / 一句话定位'],['location','所在地 / 当前状态'],['email','联系邮箱']])grid.append(field(p,k,l));a.append(grid,field(p,'intro','首页个人介绍',true));
    const media=panel('02 / 頁面圖片與 Banner');const note=document.createElement('p');note.className='hint';note.textContent='三個圖片位置各自獨立：首頁個人介紹背景、履歷上方個人肖像、頁尾交流區下方 Banner。可填寫現有圖片地址或上傳新圖片。';media.append(note,asset(p,'heroBanner','首頁 Banner（個人介紹背景）','image/png,image/jpeg,image/webp,image/avif'),field(p,'heroBannerAlt','首頁 Banner 圖片說明'),asset(p,'portrait','履歷上方個人肖像 Banner','image/png,image/jpeg,image/webp,image/avif'),field(p,'portraitCaption','個人肖像顯示文字'),asset(p,'footerBanner','頁尾 Banner（展覽、策展與研究交流下方）','image/png,image/jpeg,image/webp,image/avif'),field(p,'footerBannerAlt','頁尾 Banner 圖片說明'));
    const b=panel('03 / 艺术陈述与研究');b.append(field(p,'statement','艺术陈述标题',true),field(p,'research','创作理念 / PhD 研究方向',true),asset(p,'cv','履历 PDF','application/pdf'),field(p,'contactNote','联系区域说明'));
    const c=panel('04 / 社交与外部链接');p.socials.forEach((x,i)=>{const row=document.createElement('div');row.className='link-row';row.append(field(x,'label','显示名称'),field(x,'url','HTTPS 地址'),button('删除',()=>{p.socials.splice(i,1);save();render();}));c.append(row);});c.append(button('＋ 添加链接',()=>{p.socials.push({label:'',url:''});save();render();}));
  }else if(tab==='works'){
    ensureCategories();const categoryPanel=panel('首页筛选分类');categoryPanel.classList.add('category-editor');const note=document.createElement('p');note.className='hint';note.textContent='每件作品可勾选多个分类；修改分类名称会同步用于所有作品。';categoryPanel.append(note);
    content.categories.forEach((c,i)=>{const row=document.createElement('div');row.className='link-row';row.append(field(c,'label','分类名称'),button('删除分类',()=>{if(confirm('移除此分类？作品本身会保留。')){content.categories.splice(i,1);content.works.forEach(w=>w.categoryIds=w.categoryIds.filter(id=>id!==c.id));save();render();}}));categoryPanel.append(row);});
    categoryPanel.append(button('＋ 添加分类',()=>{content.categories.push({id:uid(),label:'New category',label_zh:'新分類'});save();render();}));
    const info=document.createElement('p');info.className='hint';info.textContent='每个作品有独立详情。可以调整顺序，上传封面、详情图、视频及作品文件。';$('#editor').append(info,button('＋ 新建作品',()=>{content.works.unshift({id:uid(),title:'Untitled work',year:'',categoryIds:[],medium:'',image:'',description:'',gallery:[],attachment:'',video:'',demo:false});save();render();}));
    content.works.forEach((w,i)=>{const d=document.createElement('section');d.className='item';const head=document.createElement('div');head.className='item-head';const h=document.createElement('h2');h.textContent=String(i+1).padStart(2,'0')+' / '+w.title;head.append(h,tools(content.works,i));d.append(head);const grid=document.createElement('div');grid.className='grid';for(const [k,l] of [['title','作品名称'],['year','年份'],['medium','媒介 / 材料 / 尺寸']])grid.append(field(w,k,l));d.append(grid,categoryChoices(w),asset(w,'image','作品封面','image/png,image/jpeg,image/webp,image/avif'),field(w,'description','作品叙述 / 创作过程',true),field(w,'credits','藝術家 / 合作者 / 策展人'),gallery(w),asset(w,'video','视频地址 / 上传 MP4、WebM','video/mp4,video/webm'),asset(w,'attachment','作品附件 / PDF、ZIP、GLB、OBJ','.pdf,.zip,.glb,.gltf,.obj'));const label=document.createElement('label');label.className='check';const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!w.demo;cb.onchange=()=>{w.demo=cb.checked;save();};label.append(cb,'这是示例作品（前台显示示例标记）');d.append(label);$('#editor').append(d);});
  }else if(tab==='archive'){
    $('#editor').append(button('＋ 添加履历栏目',()=>{content.archive.push({id:uid(),title:'New section',items:[]});save();render();}));
    content.archive.forEach((g,i)=>{const d=document.createElement('section');d.className='item';const head=document.createElement('div');head.className='item-head';head.append(field(g,'title','栏目名称（教育 / 展览 / 奖项 / 出版物等）'),tools(content.archive,i));d.append(head);g.items.forEach((x,j)=>{const row=document.createElement('div');row.className='item';const grid=document.createElement('div');grid.className='grid';grid.append(field(x,'year','年份'),field(x,'title','名称 / 标题'));row.append(grid,field(x,'detail','机构、地点、角色或成果描述',true),field(x,'url','证明 / 论文链接（可选）'),tools(g.items,j));d.append(row);});d.append(button('＋ 添加条目',()=>{g.items.push({year:'',title:'',detail:'',url:''});save();render();}));$('#editor').append(d);});
  }else{
    const d=panel('GitHub 连接与发布');const info=document.createElement('div');info.className='warning';info.innerHTML='网站托管在 GitHub Pages；后台通过 GitHub API 将内容和文件作为一次提交保存。<br>首次使用需要一个仅授权此仓库的 fine-grained token，权限设为 <code>Contents: Read and write</code>。<br>Token 只在当前页面内存使用，刷新或关闭即清除，不写入网站、备份或浏览器存储。<br><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">在 GitHub 创建 Token ↗</a> · <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" target="_blank" rel="noopener noreferrer">官方设置说明 ↗</a><br>公开仓库中的内容、上传文件及历史提交均可被访问；请只发布希望公开的资料。';d.append(info);
    for(const [k,l] of [['owner','GitHub 用户名'],['repo','仓库名称'],['branch','分支']]){const f=field(config,k,l);f.querySelector('input').oninput=ev=>{config[k]=ev.target.value.trim();localStorage.setItem(CONFIG,JSON.stringify(config));baseSha='';};d.append(f);}const f=document.createElement('label');f.className='field';f.innerHTML='<span>GitHub Fine-grained Token（本次页面有效）</span>';const input=document.createElement('input');input.type='password';input.autocomplete='off';input.value=token;input.oninput=()=>{token=input.value;};f.append(input);d.append(f,button('连接并读取仓库最新内容',()=>connect()),button('断开连接 / 清除 Token',()=>{token='';baseSha='';render();status('已清除 Token。');}));
    const note=document.createElement('p');note.className='hint';note.textContent='发布后通常需要等待 GitHub Pages 构建完成。大视频建议放在外部视频服务，以 HTTPS 视频文件地址填写。备份 JSON 包含文字与文件路径，不包含文件本身。';d.append(note);
  }
}
async function api(path,method='GET',body){
  if(!/^[\w.-]+$/.test(config.owner)||!/^[\w.-]+$/.test(config.repo)||!config.branch)throw Error('仓库配置不正确。');
  const r=await fetch('https://api.github.com/repos/'+encodeURIComponent(config.owner)+'/'+encodeURIComponent(config.repo)+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok){if(r.status===401)throw Error('Token 无效或已过期，请在发布设置中更新。');if(r.status===403)throw Error('没有写入权限，或 GitHub 请求次数受限。请检查 Token 和仓库权限。');if(r.status===404)throw Error('找不到仓库、分支或文件。请检查仓库配置与 Token 授权。');if(r.status===409||r.status===422)throw Error('仓库已变化或提交受保护。请导出草稿备份后重新连接读取最新内容。');throw Error('GitHub 请求失败（'+r.status+'）。请稍后重试。');}return r.status===204?null:r.json();
}
function decode(b64){return new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g,'')),x=>x.charCodeAt(0)));}
async function readRemote(){const ref=await api('/git/ref/heads/'+encodeURIComponent(config.branch));const sha=ref.object.sha;const f=await api('/contents/data/content.json?ref='+sha);return {sha,content:validateContent(JSON.parse(decode(f.content)))};}
async function connect(){if(!token){status('请先填写 GitHub Token。',true);return;}if(dirty&&!confirm('读取仓库会替换当前草稿。请确认已导出需要保留的内容。'))return;try{status('正在验证连接并读取最新内容…');const remote=await readRemote();content=remote.content;baseSha=remote.sha;uploads.clear();localStorage.setItem(KEY,JSON.stringify(content));dirty=false;render();status('已连接，内容已从 GitHub 最新提交读取。');}catch(err){status(err.message,true);}}
function walkStrings(value,fn){if(typeof value==='string')fn(value);else if(Array.isArray(value))value.forEach(x=>walkStrings(x,fn));else if(value&&typeof value==='object')Object.values(value).forEach(x=>walkStrings(x,fn));}
async function publish(){
  if(busy)return;if(!token){tab='settings';render();status('请先在发布设置中填写 Token。草稿已保留。',true);return;}
  try{validateContent(content);busy=true;$('#publish').disabled=true;status('正在检查仓库并上传文件…');
    const remote=await readRemote();if(baseSha&&remote.sha!==baseSha)throw Error('线上内容已被其他窗口更新。为避免覆盖，请先导出草稿，然后重新连接。');
    if(!baseSha&&JSON.stringify(remote.content)!==JSON.stringify(content)&&!confirm('当前草稿将替换 GitHub 上的内容。确认发布？'))return;
    const paths=new Set();walkStrings(content,v=>{if(v.startsWith('uploads/'))paths.add(v);});const tree=[];
    for(const path of paths){if(uploads.has(path)){const blob=await api('/git/blobs','POST',{content:uploads.get(path),encoding:'base64'});tree.push({path,mode:'100644',type:'blob',sha:blob.sha});}else{await api('/contents/'+path+'?ref='+remote.sha);}}
    tree.push({path:'data/content.json',mode:'100644',type:'blob',content:JSON.stringify(content,null,2)+'\n'});
    const commit=await api('/git/commits/'+remote.sha);const newTree=await api('/git/trees','POST',{base_tree:commit.tree.sha,tree});const created=await api('/git/commits','POST',{message:'Update artist portfolio from Studio',tree:newTree.sha,parents:[remote.sha]});
    await api('/git/refs/heads/'+encodeURIComponent(config.branch),'PATCH',{sha:created.sha,force:false});baseSha=created.sha;uploads.clear();dirty=false;localStorage.setItem(KEY,JSON.stringify(content));status('发布提交已保存到 GitHub！等待 Pages 部署完成后，刷新前台查看。');
  }catch(err){status(err.message||'发布失败，草稿仍保留。',true);}finally{busy=false;$('#publish').disabled=false;}
}
$('#tabs').onclick=event=>{const b=event.target.closest('[data-tab]');if(b){tab=b.dataset.tab;render();}};$('#publish').onclick=publish;
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='portfolio-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import').onchange=async event=>{try{const f=event.target.files[0];if(!f)return;const next=validateContent(JSON.parse(await f.text()));if(confirm('导入将替换当前草稿，是否继续？')){content=next;save();render();}}catch(err){status('导入失败：'+err.message,true);}event.target.value='';};
$('#restore').onclick=async()=>{if(!confirm('放弃当前草稿，重新读取线上内容？'))return;try{const r=await fetch('../data/content.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('读取失败');content=validateContent(await r.json());uploads.clear();baseSha='';localStorage.setItem(KEY,JSON.stringify(content));dirty=false;render();status('已重新读取当前部署的内容。');}catch(err){status(err.message,true);}};
$('#preview').onclick=()=>{if(uploads.size){status('新上传文件尚未发布，草稿预览中可能暂时无法显示；发布后即可查看。');}localStorage.setItem('studio-preview',JSON.stringify(content));window.open('../?preview=1','_blank','noopener');};
window.addEventListener('beforeunload',event=>{if(uploads.size||busy){event.preventDefault();event.returnValue='';}});
try{const draft=localStorage.getItem(KEY);if(draft){content=validateContent(JSON.parse(draft));try{const response=await fetch('../data/content.json',{cache:'no-cache'});if(response.ok){const online=validateContent(await response.json());for(const key of ['heroBanner','heroBannerAlt','heroBannerAlt_zh','footerBanner','footerBannerAlt','footerBannerAlt_zh'])if(content.profile[key]===undefined&&online.profile[key]!==undefined)content.profile[key]=online.profile[key];}}catch{}dirty=true;status('已恢复此浏览器中的草稿。Banner 可在「頁面圖片與 Banner」設定，原有編輯保留。');}else{const r=await fetch('../data/content.json',{cache:'no-cache'});if(!r.ok)throw Error('无法读取内容');content=validateContent(await r.json());status('内容已加载。修改后自动保留本地草稿。');}render();}catch(err){status('读取内容失败：'+err.message,true);}
