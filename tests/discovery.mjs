import assert from 'node:assert/strict';
import {discovery} from '../discovery.mjs';
import {currentRoute,publicPath,routePath,visitChannel} from '../frontend/routes.mjs';
const template='<!doctype html><head><title>old</title><meta name="description" content="old"><script type="module" crossorigin src="/assets/app.js"></script></head><body><div id="root"></div></body>';
const item={id:'public',brand:'回力',title:'回力店铺资料与回应',content:'事件概述\n留存截图，原始发布仍待核。',images:'["public/image"]',videos:'[]',status:'approved',record_type:'event',event_date:'2026-10-09',created:1780000000000,verification_status:'unverified',evidence_level:'third_party',publisher_scope:'shop',response_summary:'暂无已核验回应',source:'https://example.com/?a=1&b=2'};
let rows=[item,{...item,id:'secret',title:'PENDING_SECRET',status:'pending'},{...item,id:'old',brand:'微星/MSI',event_date:'2001',images:'[]'}];
const service=discovery({template,getItems:()=>rows});
const root=service.handle('/');assert.equal(root.status,200);assert.match(root.body,/事件概述|留存截图/);assert.match(root.body,/href="\/event\/public"/);assert.ok(!root.body.includes('PENDING_SECRET'));assert.match(root.body,/id="public-records"/);
const page=service.handle('/event/public');assert.match(page.body,/<link rel="canonical" href="https:\/\/notbuy.top\/event\/public"/);assert.match(page.body,/og:image/);assert.match(page.body,/原始发布仍待核/);assert.ok(page.body.indexOf('<figure>')<page.body.indexOf('<h2>事件经过'));
assert.equal(service.handle('/event/secret').status,404);assert.ok(!service.handle('/event/secret').body.includes('PENDING_SECRET'));
assert.equal(service.handle('/brand/微星/MSI').status,200);assert.equal(service.handle('/brand/OPPO').status,200);assert.equal(service.handle('/brand/does-not-exist').status,404);
const map=service.handle('/sitemap.xml');assert.ok(!map.body.includes('secret'));assert.match(map.body,/brand\/微星|brand\/%E5%BE%AE/);assert.ok(!map.body.includes('#/'));
assert.match(map.body,/\/updates/);const updates=service.handle('/updates');assert.equal(updates.status,200);assert.match(updates.body,/最近更新/);assert.ok(!updates.body.includes('PENDING_SECRET'));assert.ok(updates.body.includes('/assets/app.js'));assert.match(updates.body,/2001/);
assert.match(service.handle('/topics/history').body,/\/event\/old/);assert.ok(service.handle('/topics/history').body.includes('/assets/app.js'));assert.ok(service.handle('/topics/history').body.includes('id="public-records"'));
assert.match(service.handle('/feed.xml').body,/rss version="2.0"/);assert.match(service.handle('/admin').body,/noindex,follow/);assert.equal(service.handle('/attachment/public/image').noindex,true);
const brandFeed=service.handle('/feed.xml','?brand='+encodeURIComponent('微星/MSI'));assert.equal(brandFeed.status,200);assert.ok(brandFeed.body.includes('/event/old'));assert.ok(!brandFeed.body.includes('/event/public'));assert.equal(service.handle('/feed.xml','?brand=unknown').status,404);
assert.equal(service.handle('/tasks').status,200);assert.ok(map.body.includes('/tasks'));assert.ok(service.handle('/tasks').body.includes('/assets/app.js'));
const taskService=discovery({template,getItems:()=>rows,getTasks:()=>[{id:'task',event_id:'public',brand:'回力',event_title:'关联事件',kind:'original',status:'open',title:'<script>task</script>',need:'需要完整原件',contributions:[]}]});
const taskPage=taskService.handle('/tasks').body;assert.ok(taskPage.includes('/reply/public?task=task'));assert.ok(!taskPage.includes('<script>task</script>'));assert.ok(taskPage.includes('&lt;script&gt;task&lt;/script&gt;'));
rows=[{...item,title:'</script><script>alert(1)</script>',content:'<img src=x onerror=alert(1)>',source:'javascript:alert(1)'}];
const escaped=service.handle('/event/public').body;assert.ok(!escaped.includes('</script><script>alert'));assert.ok(!escaped.includes('<img src=x'));assert.ok(!escaped.includes('href="javascript:'));assert.match(escaped,/\\u003c\/script/);
rows=[{...item,status:'rejected'}];assert.equal(service.handle('/event/public').status,404);assert.ok(!service.handle('/sitemap.xml').body.includes('/event/public'));
assert.deepEqual(currentRoute({pathname:'/event/a',hash:''}),{type:'event',value:'a'});assert.deepEqual(currentRoute({pathname:'/',hash:'#/brand/%E5%BE%AE%E6%98%9F%2FMSI'}),{type:'brand',value:'微星/MSI'});assert.equal(publicPath('brand','微星/MSI'),'/brand/%E5%BE%AE%E6%98%9F%2FMSI');assert.equal(routePath('#/event/a'),'/event/a');assert.equal(routePath('//evil.example'),'/');
assert.equal(visitChannel('https://notbuy.top/event/a?utm_source=weibo'),'weibo');assert.equal(visitChannel('https://notbuy.top/','https://www.google.com/search?q=private'),'google');assert.equal(visitChannel('https://notbuy.top/','https://notbuy.top/topics/history'),'direct');assert.equal(visitChannel('https://notbuy.top/','https://notgoogle.com/'),'referral');assert.equal(visitChannel('https://notbuy.top/?utm_source=arbitrary'),'referral');
assert.equal(visitChannel('https://notbuy.top/event/a','https://notbuy.top/topics/store-posts','weibo'),'weibo');
assert.equal(visitChannel('https://notbuy.top/event/a?utm_source=google','','weibo'),'google');

// Language is a view of the same public archive and the same compiled React application.
const globalItem={...item,id:'global',brand:'Overseas example',images:'[]',event_date:'2019',title:'海外原始标题',editor_summary:'海外原始摘要',global:{market:'GB',sources:[{url:'https://example.com/decision',label_en:'Published decision',access_en:'Decision available; original video missing.'}],translations:{en:{brand:'Example Brand',title:'Example Brand advertising record',summary:'A sourced summary that preserves the scope of findings.',response:'A response was recorded.',pending:'The original video is missing.',decision:'Only the published decision is verified.'}}}};
const siteItem={...item,id:'site',record_type:'site',title:'Public site information',content_language:'en',videos:'["site/video"]',images:'[]'};
const unifiedRows=[item,globalItem,siteItem,{...item,id:'hidden',status:'pending',title:'PRIVATE_PENDING_TITLE',user_id:'PRIVATE_ACCOUNT',guest_name:'PRIVATE_GUEST'}];
const unified=discovery({template:template.replace('<head>','<html lang="zh-CN"><head>').replace('</body>','</body></html>'),getItems:()=>unifiedRows});
const bootstrap=body=>JSON.parse(body.match(/<script id="public-records" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const assets=body=>[...body.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]);
for(const canonical of ['/','/archive','/lookup','/updates','/tasks','/topics/history','/brand/回力','/event/public','/attachment/public/image','/reply/public']){
 const zh=unified.handle(canonical),en=unified.handle(canonical==='/'?'/en':'/en'+canonical);
 assert.equal(zh.status,200,canonical);assert.equal(en.status,200,'English '+canonical);
 assert.deepEqual(assets(en.body),assets(zh.body));assert.deepEqual(bootstrap(en.body),bootstrap(zh.body));assert.equal(bootstrap(en.body).length,3);
 assert.ok(!en.body.includes('global-tools.js'));assert.ok(!en.body.includes('global.css'));assert.ok(!en.body.includes('PRIVATE_PENDING_TITLE'));
 assert.match(zh.body,/<html lang="zh-CN">/);assert.match(en.body,/<html lang="en">/);
}
const alias=unified.handle('/global','?market=GB&q=example');assert.deepEqual(bootstrap(alias.body),bootstrap(unified.handle('/').body));assert.match(alias.body,/rel="canonical" href="https:\/\/notbuy.top\/"/);assert.match(alias.body,/href="\/en\?market=GB&amp;q=example"/);
const enHome=unified.handle('/en').body;assert.match(enHome,/hreflang="zh-CN" href="https:\/\/notbuy.top\/"/);assert.match(enHome,/hreflang="en" href="https:\/\/notbuy.top\/en"/);assert.ok(!enHome.includes('hreflang="zh-CN" href="https://notbuy.top/global"'));
const enTranslated=unified.handle('/en/event/global').body;assert.match(enTranslated,/<meta property="og:title" content="Example Brand advertising record"/);assert.match(enTranslated,/Published decision/);assert.match(enTranslated,/Only the published decision is verified/);
const enOriginal=unified.handle('/en/event/public').body;assert.match(enOriginal,/Original Chinese record/);assert.ok(enOriginal.indexOf('<figure>')<enOriginal.indexOf('<h2>Event and scope of findings'));
assert.equal(unified.handle('/en/event/site').status,200);assert.equal(unified.handle('/en/event/site').noindex,true);assert.match(unified.handle('/en/event/site').body,/<video[^>]*controls playsinline/);
for(const route of ['/event/hidden','/en/event/hidden','/reply/hidden','/en/reply/hidden','/reply/missing','/en/reply/missing','/en/brand/not-public','/en/topics/not-public']){assert.equal(unified.handle(route).status,404,route);assert.ok(!unified.handle(route).body.includes('PRIVATE_PENDING_TITLE'));}
const unifiedMap=unified.handle('/sitemap.xml').body;assert.ok(!unifiedMap.includes('<loc>https://notbuy.top/global</loc>'));assert.match(unifiedMap,/\/en\/topics\/history/);
const stale=discovery({template,getItems:()=>[{...globalItem,global:{...globalItem.global,translation_stale:true}}]}).handle('/en/event/global').body;assert.match(stale,/English translation needs review/);assert.ok(!stale.includes('<meta property="og:title" content="Example Brand advertising record"'));
console.log('PASS discovery: one React app, full shared archive, reciprocal locales, SEO, media-first originals, privacy, withdrawal and compatibility routing');
