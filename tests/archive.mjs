import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {archive} from '../archive.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const data=fs.mkdtempSync(path.join(os.tmpdir(),'archive-migration-'));
const db=new DatabaseSync(':memory:');
try{
 db.exec("CREATE TABLE feedback(id TEXT PRIMARY KEY,brand TEXT,title TEXT,content TEXT,source TEXT,images TEXT,videos TEXT,category TEXT,created INTEGER,status TEXT,user_id TEXT,guest_name TEXT); CREATE TABLE users(id TEXT PRIMARY KEY,username TEXT);");
 const put=db.prepare('INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
 const text='事件概述\n店铺宣传的留存资料。\n\n发生与报道时间\n2024-10-14宣传；2024-10-18回应。\n\n资料分类与证据层级\n第三方留存\n\n完整语境、回应与待核事项\n有回应截图，原视频未取得。\n\n附件索引（按顺序）：\n图1：a.jpg\n日期依据：2024-10-14\n说明：店铺截图\n来源页：https://example.org/a\n图2：b.jpg\n来源日期：2024-10-18\n说明：回应截图\n来源页：https://example.org/b';
 put.run('event','品牌','测试事件',text,'https://example.org/main','["event/a","event/b"]','[]','广告表达',1,'approved',null,null);
 put.run('opinion','品牌','无来源观点','用户想法','','[]','[]','其他反馈',2,'approved','u',null);
 put.run('dove','德芙','日期冲突','事件概述\n致歉截图。\n\n发生与报道时间\n2026年8月25日；媒体报道于8月26日至28日。\n\n证据与核实情况\n待核。','','[]','[]','广告表达',3,'approved',null,null);
 for(let n=0;n<205;n++)put.run('row'+n,'老品牌'+n,'历史资料'+n,'原文保留','','[]','[]','其他反馈',n,'approved',null,null);
 const records=archive(db,data),items=records.publicItems(),event=items.find(i=>i.id==='event');
 assert.equal(items.length,208,'Public archive must not silently truncate at 200');
 assert.equal(event.event_date,'2024-10-14宣传；2024-10-18回应。');assert.equal(event.event_date.includes('附件'),false);
 assert.equal(event.attachments[0].source,'https://example.org/a');assert.equal(event.attachments[1].source,'https://example.org/b');assert.equal(event.attachments[0].date,'2024-10-14');
 assert.equal(items.find(i=>i.id==='opinion').record_type,'opinion');assert.equal(items.find(i=>i.id==='opinion').editor_summary,'');
 const dove=items.find(i=>i.id==='dove');assert.equal(dove.event_date,'');assert.equal(dove.verification_status,'disputed');assert.match(dove.pending_summary,/日期冲突/);
 assert.equal(event.content,text);assert.equal(event.verification_status,'unverified');
 const counts=db.prepare('SELECT COUNT(*) n FROM event_changes').get().n;archive(db,data);assert.equal(db.prepare('SELECT COUNT(*) n FROM event_changes').get().n,counts,'Migration must be idempotent');
 console.log('PASS: legacy sections, per-attachment provenance, >200 records, opinion separation, conflicting dates and idempotent migration.');
}finally{db.close();fs.rmSync(data,{recursive:true,force:true})}
