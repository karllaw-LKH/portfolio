import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pageImages} from '../shared.js';
import {localize} from '../i18n.js';

test('hero, CV portrait and footer images can be updated independently',()=>{
  const content={profile:{name:'Karl Law',heroBanner:'assets/hero.jpg',heroBannerAlt:'Installation',portrait:'uploads/portrait.jpg',portraitCaption:'Karl Law · Artist portrait',portraitCaption_zh:'羅嘉豪・個人肖像',footerBanner:'assets/footer.jpg',footerBannerAlt:'Exhibition'},works:[]};
  const images=pageImages(content);
  assert.equal(images.hero,'assets/hero.jpg');
  assert.equal(images.portrait,'uploads/portrait.jpg');
  assert.equal(images.footer,'assets/footer.jpg');
  assert.equal(pageImages(localize(content,'zh')).portraitCaption,'羅嘉豪・個人肖像');
  content.profile.heroBanner='assets/new-hero.jpg';
  assert.equal(pageImages(content).portrait,'uploads/portrait.jpg');
  assert.equal(pageImages(content).footer,'assets/footer.jpg');
});

test('legacy backups use the original hero and artwork-based footer',()=>{
  const content={profile:{name:'Karl Law',portrait:'assets/portrait.jpg',portraitCaption:'Artist portrait'},works:[{id:'archive-point',title:'Archive Point',image:'assets/cover.jpg',gallery:['assets/one.jpg','assets/two.jpg','assets/three.jpg']}]};
  assert.equal(pageImages(content).hero,'assets/portrait.jpg');
  assert.equal(pageImages(content).footer,'assets/three.jpg');
  content.profile.heroBanner='';content.profile.footerBanner='';
  assert.equal(pageImages(content).hero,'');
  assert.equal(pageImages(content).footer,'');
});
