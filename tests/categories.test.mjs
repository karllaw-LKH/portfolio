import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,access} from 'node:fs/promises';
import {workCategories,validateContent} from '../shared.js';
import {localize} from '../i18n.js';

const root=new URL('../',import.meta.url);
const content=JSON.parse(await readFile(new URL('data/content.json',root),'utf8'));

test('a work appears once in every assigned category in both languages',()=>{
  for(const lang of ['en','zh']){
    const data=localize(content,lang);
    const inCategory=id=>data.works.filter(w=>workCategories(w,data.categories).some(c=>c.id===id)).map(w=>w.id);
    assert(inCategory('public-art').includes('bamboo-echo-chamber'));
    assert(inCategory('interactive-installation').includes('bamboo-echo-chamber'));
    assert(!inCategory('public-art').includes('floating-fish'));
    assert(inCategory('installation-fieldwork').includes('floating-fish'));
    assert(inCategory('award-winning-project').includes('huaqiangbei-cooling-field'));
    assert(inCategory('award-winning-project').includes('bamboo-echo-chamber'));
    for(const c of data.categories)assert.equal(new Set(inCategory(c.id)).size,inCategory(c.id).length);
    assert.equal(data.categories.find(c=>c.id==='installation-fieldwork').label,lang==='zh'?'裝置及田野調查':'Installation & field research');
  }
});

test('legacy single-category backups remain readable',()=>{
  assert.deepEqual(workCategories({category:'Public art',category_zh:'公共藝術'},content.categories).map(c=>c.id),['public-art']);
  assert.deepEqual(workCategories({category:'Custom category'}).map(c=>c.id),['Custom category']);
  assert.deepEqual(workCategories({},[{id:'x',label:'Untranslated'}]),[]);
  assert.deepEqual(workCategories({categoryIds:[],category:'Public art'},content.categories),[]);
});

test('invalid category references and duplicated category IDs cannot be published',()=>{
  validateContent(content);
  const unknown=structuredClone(content);unknown.works[0].categoryIds=['does-not-exist'];
  assert.throws(()=>validateContent(unknown));
  const duplicate=structuredClone(content);duplicate.categories.push({...duplicate.categories[0]});
  assert.throws(()=>validateContent(duplicate));
  const duplicateAssignment=structuredClone(content);duplicateAssignment.works[0].categoryIds=['public-art','public-art'];
  assert.throws(()=>validateContent(duplicateAssignment));
});

test('the new cover, bilingual content and deduplicated assets are complete',async()=>{
  assert.equal(content.works.length,15);
  const folds=content.works.find(w=>w.id==='folds-of-time');
  assert.equal(folds.image,'assets/portfolio/ab42b0a63b0273.jpg');
  assert(!folds.gallery.includes(folds.image));
  const images=new Set([content.profile.portrait]);
  for(const w of content.works){
    assert(w.title_zh&&w.description_zh&&w.credits_zh);
    assert.equal(w.demo,false);
    const paths=[w.image,...w.gallery];
    assert.equal(new Set(paths).size,paths.length,w.id);
    paths.forEach(p=>images.add(p));
  }
  assert.equal(images.size,90);
  await Promise.all([...images].map(path=>access(new URL(path,root))));
  const entries=content.archive.flatMap(g=>g.items.map(x=>[x.year,x.title_zh].join('|')));
  assert.equal(entries.length,60);
  assert.equal(new Set(entries).size,entries.length);
});
