import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {applyDateAudit} from '../deploy/apply-event-dates.mjs';
import {recentRecords} from '../frontend/presentation.mjs';
const audit=JSON.parse(fs.readFileSync(new URL('../docs/event-dates-20261012.json',import.meta.url),'utf8'));
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE feedback(id TEXT PRIMARY KEY,brand TEXT,title TEXT,record_type TEXT,status TEXT,event_date TEXT,date_precision TEXT,pending_summary TEXT,content TEXT,source_date TEXT,verification_status TEXT);
CREATE TABLE event_changes(id INTEGER PRIMARY KEY,event_id TEXT,created INTEGER,action TEXT,changes TEXT,public_note TEXT);`);
const fixture=structuredClone(audit);
for(const r of fixture.events){
 r.expected_pending_sha256=crypto.createHash('sha256').update('原待核事项').digest('hex');
 r.expected_date_precision='unknown';
 db.prepare('INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(r.id,r.brand,r.title,'event','approved','','unknown','原待核事项','原文不变','报道日期不变','unverified');
}
assert.equal(applyDateAudit(db,fixture).updated,36);
assert.equal(db.prepare('SELECT COUNT(*) n FROM event_changes').get().n,0,'Dry run has no writes');
db.prepare('UPDATE feedback SET pending_summary=? WHERE id=?').run('后来人工更正',fixture.events.at(-1).id);
assert.throws(()=>applyDateAudit(db,fixture,{dryRun:false}),/review required/);
assert.equal(db.prepare('SELECT COUNT(*) n FROM event_changes').get().n,0,'Conflict at final record rolls back all earlier writes');
assert.equal(db.prepare("SELECT COUNT(*) n FROM feedback WHERE event_date<>''").get().n,0);
db.prepare('UPDATE feedback SET pending_summary=? WHERE id=?').run('原待核事项',fixture.events.at(-1).id);
const result=applyDateAudit(db,fixture,{dryRun:false,now:123});
assert.deepEqual([result.dated,result.pending],[28,8]);
assert.equal(db.prepare('SELECT COUNT(*) n FROM event_changes').get().n,36);
for(const r of db.prepare('SELECT * FROM feedback').all()){
 assert.equal(r.content,'原文不变');assert.equal(r.source_date,'报道日期不变');assert.equal(r.verification_status,'unverified');
}
db.prepare('UPDATE feedback SET event_date=? WHERE id=?').run('2023-11-04',fixture.events[0].id);
assert.equal(applyDateAudit(db,fixture,{dryRun:false}).updated,0);
assert.equal(db.prepare('SELECT event_date FROM feedback WHERE id=?').get(fixture.events[0].id).event_date,'2023-11-04','Rerun preserves a later human edit');
const sorted=recentRecords(audit.events.map((r,n)=>({...r,status:'approved',record_type:'event',created:1000-n})));
assert.equal(sorted[0].brand,'TVB');
assert.equal(sorted.at(-9).event_date,'2021-10-14');
assert.equal(sorted.slice(-8).every(r=>r.event_date===''),true);
assert.equal(audit.events.find(r=>r.brand==='YOLO VI美妆店').event_date,'','Do not infer YOLO year from the next paragraph');
assert.equal(audit.events.find(r=>r.brand==='德芙').event_date,'2026-08','Keep conflicting days unresolved');
db.close();
console.log('PASS: 36-row date audit, atomic conflict rollback, dry run, 28 dated/8 pending, unchanged evidence fields and idempotency preserving human corrections.');
