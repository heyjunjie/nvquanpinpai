import fs from 'node:fs';
import crypto from 'node:crypto';

export const globalId=key=>'global-'+crypto.createHash('sha256').update('notbuy.global.v1:'+key).digest('hex').slice(0,24);
export const globalTaskId=(key,need)=>'global-task-'+crypto.createHash('sha256').update(key+':'+need).digest('hex').slice(0,24);
export function globalSchema(db){
 db.exec(`CREATE TABLE IF NOT EXISTS global_event_meta(event_id TEXT PRIMARY KEY,case_key TEXT NOT NULL UNIQUE,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS global_task_meta(task_id TEXT PRIMARY KEY,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS global_imports(case_key TEXT PRIMARY KEY,event_id TEXT NOT NULL,published INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS global_submission_languages(event_id TEXT PRIMARY KEY,language TEXT NOT NULL);`);
}
export function globalRecord(db,record){
 const row=db.prepare('SELECT payload FROM global_event_meta WHERE event_id=?').get(record.id);
 if(!row)return null;
 const meta=JSON.parse(row.payload);
 if(meta.translation_basis&&Object.entries(meta.translation_basis).some(([key,value])=>record[key]!==value))return {...meta,translations:{},translation_stale:true,response_class:record.response_summary!==meta.translation_basis.response_summary?'unknown':meta.response_class};
 return meta;
}
export function initializeGlobal(db,catalog=null){
 globalSchema(db);
 if(catalog===null)catalog=JSON.parse(fs.readFileSync(new URL('./docs/global-cases-20261013.json',import.meta.url),'utf8'));
 if(catalog.schema!==1||!Array.isArray(catalog.cases))throw Error('Invalid global case catalog');
 const published=[];
 db.exec('BEGIN IMMEDIATE');
 try{
  for(const c of catalog.cases){
   if(!/^[a-z0-9-]+$/.test(c.key)||!c.brand||!c.title_zh||!c.summary_zh||!c.title_en||!c.summary_en||!Array.isArray(c.sources)||!c.sources.length||!['apologized','defended','no_response','unknown','refused'].includes(c.response_class)||!['partial','unverified','disputed','verified'].includes(c.verification_status)||!['evidence','background','lead'].includes(c.material_status)||!['original','third_party','none'].includes(c.evidence_level)||!['headquarters','partner','shop','other','unknown'].includes(c.publisher_scope)||!['advertising','partnership','experience','other'].includes(c.topic)||!/^[A-Z]{2}$/.test(c.market)||!/^$|^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(c.event_date))throw Error('Invalid global case: '+c.key);
   if(c.sources.some(s=>{try{return !['https:','http:'].includes(new URL(s.url).protocol)}catch{return true}}))throw Error('Invalid case source: '+c.key);
   // Publication is append-only: restarting must not restore withdrawn cases or overwrite edits.
   if(db.prepare('SELECT 1 FROM global_imports WHERE case_key=?').get(c.key))continue;
   const id=globalId(c.key),now=Date.now();
   if(db.prepare('SELECT id FROM feedback WHERE id=?').get(id))throw Error('Global case ID collision');
   const content=`事件概述\n${c.summary_zh}\n\n发生与报道时间\n${c.event_date||'发生日期待核'}；${c.date_precision_zh}\n\n发布主体与判断边界\n${c.decision_zh}\n\n品牌回应\n${c.response_zh}\n\n待核事项\n${c.pending_zh}\n\n来源（${catalog.checked_at} 核查，来源页日期与发生时间分别判断）\n${c.sources.map(s=>`${s.label_zh}\n${s.url}\n${s.access_zh}`).join('\n\n')}`;
   const fields={id,brand:c.brand,title:c.title_zh,content,source:c.sources[0].url,images:'[]',videos:'[]',category:c.category_zh||'广告表达',created:now,status:'approved',record_type:'event',verification_status:c.verification_status,evidence_level:c.evidence_level,publisher_scope:c.publisher_scope,region:'overseas',material_status:c.material_status,topic:c.topic,event_date:c.event_date,date_precision:c.date_precision_zh,source_date:'',source_type:'海外来源核查；逐项可访问状态见来源列表',editor_summary:c.summary_zh,response_summary:c.response_zh,pending_summary:c.pending_zh};
   const names=Object.keys(fields);db.prepare(`INSERT INTO feedback(${names.join(',')}) VALUES(${names.map(()=>'?').join(',')})`).run(...Object.values(fields));
   const basisKeys=['brand','title','editor_summary','event_date','date_precision','response_summary','pending_summary','verification_status','publisher_scope','material_status','topic'];
   const payload={market:c.market,language:c.language,brand_type_zh:c.brand_type_zh,brand_type_en:c.brand_type_en,response_class:c.response_class,decision_zh:c.decision_zh,decision_en:c.decision_en,checked_at:catalog.checked_at,sources:c.sources,translation_basis:Object.fromEntries(basisKeys.map(key=>[key,fields[key]])),translations:{en:{brand:c.brand_en,title:c.title_en,summary:c.summary_en,date_precision:c.date_precision_en,response:c.response_en,pending:c.pending_en,decision:c.decision_en}},needs:c.needs||[]};
   db.prepare('INSERT INTO global_event_meta VALUES(?,?,?)').run(id,c.key,JSON.stringify(payload));
   db.prepare('INSERT INTO global_imports VALUES(?,?,?)').run(c.key,id,now);
   db.prepare('INSERT OR IGNORE INTO archive_extractions VALUES(?)').run(id);db.prepare('INSERT OR IGNORE INTO archive_response_extractions VALUES(?)').run(id);
   db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(id,now,'海外案例发布','["global","editor_summary","event_date","response_summary","pending_summary"]','依据 global-cases-20261013 收录；原片、原文、日期与主体缺口分别列出，译文由本站整理。内容审核不代表指控成立。');
   for(const need of c.needs||[]){
    if(!/^[a-z0-9-]+$/.test(need.key)||!['original','date','identity','response'].includes(need.kind)||!need.title_zh||!need.need_zh||!need.title_en||!need.need_en)throw Error('Invalid evidence need: '+c.key);
    const taskId=globalTaskId(c.key,need.key);
    db.prepare('INSERT INTO evidence_tasks(id,event_id,title,need,kind,priority,created,updated) VALUES(?,?,?,?,?,?,?,?)').run(taskId,id,need.title_zh,need.need_zh,need.kind,need.kind==='original'?2:1,now,now);
    db.prepare('INSERT INTO global_task_meta VALUES(?,?)').run(taskId,JSON.stringify({en:{title:need.title_en,need:need.need_en}}));
   }
   published.push(id);
  }
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error}
 return published;
}
