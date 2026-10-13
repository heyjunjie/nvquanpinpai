import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {moderation} from '../moderation.mjs';
import {archive} from '../archive.mjs';
import {initializeGlobal,globalId,globalTaskId} from '../global-data.mjs';
const data=fs.mkdtempSync(path.join(os.tmpdir(),'notbuy-global-')),db=new DatabaseSync(':memory:');
try{
 db.exec("CREATE TABLE feedback(id TEXT PRIMARY KEY,brand TEXT NOT NULL,title TEXT NOT NULL,content TEXT NOT NULL,source TEXT NOT NULL,images TEXT NOT NULL,videos TEXT NOT NULL,category TEXT NOT NULL,created INTEGER NOT NULL)");
 db.prepare('INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?,?)').run('legacy','旧品牌','现有原文','原文不能覆盖','','[]','[]','其他反馈',1);
 const mod=moderation(db,data,()=>{}),before=JSON.stringify(db.prepare("SELECT * FROM feedback WHERE id='legacy'").get());
 const c={key:'fixture',brand:'海外品牌',brand_en:'Foreign brand',brand_type_zh:'食品',brand_type_en:'Food',market:'GB',language:'en',event_date:'2019-06',date_precision_zh:'月份；原发布日待核',date_precision_en:'Month only; original date unknown',title_zh:'海外广告测试事件',title_en:'Overseas advertising case',summary_zh:'有来源的海外广告事件，原片仍然待补。',summary_en:'A sourced advertising case; the original video is missing.',response_class:'unknown',response_zh:'修改表述，不认定已经道歉。',response_en:'Wording amended; an apology is not established.',decision_zh:'仅该当地表达，不推断为全球政策。',decision_en:'Local expression only; no global policy inferred.',pending_zh:'需要完整原片及原发布时间。',pending_en:'Full original video and publication date needed.',sources:[{url:'https://example.org/case',label_zh:'来源',label_en:'Source',access_zh:'可核对',access_en:'Available'}],verification_status:'partial',evidence_level:'third_party',material_status:'background',publisher_scope:'unknown',topic:'advertising',needs:[{key:'original',title_zh:'补齐完整原片',title_en:'Find the full video',need_zh:'请提供完整原片、来源链接与日期，保留完整上下文。',need_en:'Provide the full video, source and date with context.',kind:'original'}]};
 const catalog={schema:1,checked_at:'2026-10-13',cases:[c]};
 assert.deepEqual(initializeGlobal(db,catalog),[globalId('fixture')]);
 assert.equal(JSON.stringify(db.prepare("SELECT * FROM feedback WHERE id='legacy'").get()),before);
 const item=mod.records.publicItems().find(i=>i.id===globalId('fixture'));
 assert.equal(item.global.market,'GB');assert.equal(item.global.translations.en.title,c.title_en);assert.equal(item.contributor,'站点整理');assert.equal(item.user_id,null);assert.equal(item.guest_name,null);assert.equal(item.event_date,'2019-06');assert.equal(item.images,'[]');assert.equal(item.status,'approved');
 const task=mod.tasks.publicItems().find(t=>t.id===globalTaskId('fixture','original'));assert.equal(task.translations.en.need,c.needs[0].need_en);assert.equal(task.status,'open');assert.equal(task.event_id,item.id);
 db.prepare('UPDATE feedback SET editor_summary=? WHERE id=?').run('管理员已纠正的摘要',item.id);
 const revised=mod.records.publicItems().find(i=>i.id===item.id);assert.equal(revised.global.translation_stale,true);assert.deepEqual(revised.global.translations,{},'An English summary must not silently outlive a Chinese correction');
 db.prepare("UPDATE feedback SET status='rejected' WHERE id=?").run(item.id);
 db.prepare("UPDATE evidence_tasks SET status='archived' WHERE id=?").run(task.id);
 assert.equal(initializeGlobal(db,catalog).length,0);archive(db,data);
 assert.equal(db.prepare('SELECT editor_summary,status FROM feedback WHERE id=?').get(item.id).editor_summary,'管理员已纠正的摘要');assert.equal(db.prepare('SELECT status FROM feedback WHERE id=?').get(item.id).status,'rejected');assert.equal(mod.tasks.publicItems().some(t=>t.id===task.id),false);
 const oldCount=db.prepare('SELECT COUNT(*) n FROM feedback').get().n;
 assert.throws(()=>initializeGlobal(db,{schema:1,checked_at:'2026-10-13',cases:[{...c,key:'second'}, {...c,key:'bad',sources:[{url:'javascript:bad'}]}]}));
 assert.equal(db.prepare('SELECT COUNT(*) n FROM feedback').get().n,oldCount,'Catalog failure rolls back all additions');
 const live=JSON.parse(fs.readFileSync(new URL('../docs/global-cases-20261013.json',import.meta.url)));assert.ok(live.cases.length>=15);assert.equal(new Set(live.cases.map(c=>c.key)).size,live.cases.length);
 for(const row of live.cases){assert.ok(row.sources.length);assert.ok(row.needs.length);assert.ok(!row.event_date||/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(row.event_date));if(row.response_class==='refused')assert.ok(row.sources.some(s=>/refus|拒绝/i.test(s.label_en+' '+s.label_zh+' '+s.access_en+' '+s.access_zh)),'Explicit refusal requires directly identified support')}
 initializeGlobal(db,live);assert.equal(mod.records.publicItems().filter(i=>i.global).length,live.cases.length);assert.ok(mod.tasks.publicItems().length>=live.cases.length);
 console.log('PASS global data: append-only publication, translation/task association, existing records preserved, withdrawn cases stay withdrawn, transactional rollback and catalog validation');
}finally{db.close();fs.rmSync(data,{recursive:true,force:true})}
