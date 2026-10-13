import fs from 'node:fs';
import {globalSchema,globalRecord} from './global-data.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
import {editorialBrief} from './editorial.mjs';

export const archiveFields={
 record_type:['event','opinion','correction','site'],
 verification_status:['unverified','partial','verified','disputed'],
 evidence_level:['none','third_party','original'],
 publisher_scope:['unknown','shop','headquarters','partner','other'],
 region:['mainland','overseas','unknown'],
 material_status:['lead','evidence','background'],
 topic:['advertising','partnership','experience','other'],
};
export const metadataText=['event_date','source_date','date_precision','source_type','response_summary','pending_summary','parent_event_id','reply_type','editor_summary'];
export function archive(db,DATA){
 globalSchema(db);
 const columns=db.prepare('PRAGMA table_info(feedback)').all().map(c=>c.name);
 for(const name of [...Object.keys(archiveFields),...metadataText])if(!columns.includes(name))db.exec(`ALTER TABLE feedback ADD COLUMN ${name} TEXT NOT NULL DEFAULT ''`);
 db.exec(`CREATE TABLE IF NOT EXISTS event_changes(id INTEGER PRIMARY KEY,event_id TEXT NOT NULL,created INTEGER NOT NULL,action TEXT NOT NULL,changes TEXT NOT NULL,public_note TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS attachment_index(key TEXT PRIMARY KEY,event_id TEXT NOT NULL,sha256 TEXT NOT NULL,size INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS archive_extractions(event_id TEXT PRIMARY KEY);`);
 // Legacy publication never implies verification. Preserve all source material and dates verbatim.
 db.exec(`UPDATE feedback SET record_type=CASE WHEN brand IN ('站点说明','平台说明','本站') THEN 'site' WHEN user_id IS NOT NULL OR guest_name IS NOT NULL THEN 'opinion' ELSE 'event' END WHERE record_type='';
 UPDATE feedback SET verification_status='unverified' WHERE verification_status='';
 UPDATE feedback SET evidence_level=CASE WHEN images!='[]' OR videos!='[]' THEN 'third_party' ELSE 'none' END WHERE evidence_level='';
 UPDATE feedback SET publisher_scope='unknown' WHERE publisher_scope='';
 UPDATE feedback SET region=CASE WHEN category='海外补充' OR brand IN ('雷诺韩国','Apple苹果','伊黛爾') THEN 'overseas' ELSE 'unknown' END WHERE region='';
 UPDATE feedback SET material_status=CASE WHEN category='背景对照' OR title LIKE '%背景%' THEN 'background' WHEN category='线索待核' OR evidence_level='none' THEN 'lead' ELSE 'evidence' END WHERE material_status='';
 UPDATE feedback SET date_precision='unknown' WHERE date_precision='';
 UPDATE feedback SET topic=CASE WHEN category LIKE '%合作%' THEN 'partnership' WHEN category='消费体验' THEN 'experience' WHEN category LIKE '%广告%' OR category LIKE '%表达%' OR category LIKE '%营销%' OR category LIKE '%宣传%' OR category LIKE '%性别%' THEN 'advertising' ELSE 'other' END WHERE topic='';
 UPDATE feedback SET source_type=CASE WHEN source='' THEN '未提供外部来源' ELSE '来源链接／留存资料（主体待核）' END WHERE source_type='';
 UPDATE feedback SET response_summary='尚未结构化核验回应，请结合原文及附件判断' WHERE response_summary='';
 UPDATE feedback SET pending_summary='原始发布主体、完整语境及日期待核；第三方资料不代表指控成立' WHERE pending_summary='';
 UPDATE feedback SET editor_summary=title WHERE editor_summary='' AND record_type='event' AND user_id IS NULL AND guest_name IS NULL;`);
 const knownShops=['e63d1cfc-2f03-5a1a-beb2-143eedccbd04','80c837c8-2fff-51fd-9862-b3bfd7fd54ce','bdec48d4-cfb5-5841-8965-ae995f076f7a'];
 for(const row of db.prepare("SELECT * FROM feedback WHERE record_type='event' AND user_id IS NULL AND guest_name IS NULL").all())if(!db.prepare('SELECT event_id FROM archive_extractions WHERE event_id=?').get(row.id)){
  const headings=['事件概述','发生与报道时间','证据与核实情况','资料分类与证据层级','完整语境、回应与待核事项','附件索引'];
  const section=(heading)=>{const start=row.content.indexOf(heading);if(start<0)return '';const rest=row.content.slice(start+heading.length);const next=headings.map(h=>rest.indexOf('\n'+h)).filter(n=>n>=0);return rest.slice(0,next.length?Math.min(...next):undefined).trim()};
  const timing=section('发生与报道时间');
  const constraints=section('完整语境、回应与待核事项')||section('证据与核实情况');
  const overview=section('完整语境、回应与待核事项')||section('事件概述');
  const dates=[...new Set([...row.content.matchAll(/(?:来源日期|日期依据)：([^\n]+)/g)].map(m=>m[1].trim()))];
  db.prepare('UPDATE feedback SET event_date=?,source_date=?,date_precision=?,pending_summary=?,response_summary=?,publisher_scope=? WHERE id=?').run(row.brand==='德芙'?'':timing,dates.join('；'),timing?'原文时间说明／未独立核实':'unknown',constraints||row.pending_summary,overview.includes('回应')||overview.includes('声明')||overview.includes('致歉')?overview:row.response_summary,knownShops.includes(row.id)?'shop':row.publisher_scope,row.id);
  db.prepare('INSERT INTO archive_extractions VALUES(?)').run(row.id);
 }
 // A legacy timing paragraph mixes occurrence and reporting dates: retain it as a note, never present it as the event date.
 for(const row of db.prepare("SELECT id,event_date,pending_summary FROM feedback WHERE date_precision='原文时间说明／未独立核实' AND event_date!=''").all()){
  db.prepare('UPDATE feedback SET event_date=?,date_precision=?,pending_summary=? WHERE id=?').run('','unknown',row.pending_summary+'；原始时间说明（包含报道时间，事件日期未独立确认）：'+row.event_date,row.id);
  db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(row.id,Date.now(),'日期字段分离','["event_date","pending_summary"]','原文时间说明保留在待核事项；不将报道时间推断为事件发生日期。');
 }
 db.exec('CREATE TABLE IF NOT EXISTS archive_response_extractions(event_id TEXT PRIMARY KEY)');
 for(const row of db.prepare("SELECT * FROM feedback WHERE record_type='event' AND user_id IS NULL AND guest_name IS NULL").all())if(!db.prepare('SELECT event_id FROM archive_response_extractions WHERE event_id=?').get(row.id)){
  const edited=db.prepare("SELECT changes FROM event_changes WHERE event_id=? AND action='档案更正'").all(row.id).some(c=>JSON.parse(c.changes).includes('response_summary'));
  if(!edited){
   const body=row.content.split('附件索引')[0];
   const noResponse=knownShops.includes(row.id)||/尚未取得[^。\n]*品牌回应|未取得[^。\n]*品牌回应/.test(body);
   const sentences=body.split(/[。！？\n]/).map(t=>t.trim()).filter(t=>t&&/(?:官方|品牌|公司|官博|账号|声明|文中|截图).*(?:致歉|道歉|回应)|(?:发布|发表|删除).*(?:致歉|道歉|声明)/.test(t)&&!/(?:尚未|未取得|待核实|暂无|不能确认)/.test(t)).slice(0,3);
   const value=noResponse?'尚未取得品牌回应（原文说明）':sentences.length?'原文记录的回应（未独立核验）：'+sentences.join('。')+'。':'尚未结构化核验回应，请结合原文及附件判断';
   db.prepare('UPDATE feedback SET response_summary=? WHERE id=?').run(value,row.id);
   if(value!==row.response_summary)db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(row.id,Date.now(),'回应字段归位','["response_summary"]','仅保留原文中提及的回应或未取得回应说明，事件概述保留在原正文；不自动认定回应已核实。');
  }
  db.prepare('INSERT INTO archive_response_extractions VALUES(?)').run(row.id);
 }
 const dove=db.prepare("SELECT id FROM feedback WHERE brand='德芙' AND record_type='event' AND user_id IS NULL AND guest_name IS NULL AND pending_summary NOT LIKE '%日期冲突%'").all();
 for(const row of dove){const note='日期冲突待核：原站内描述rmfzw报道为2026-08-26；来源页头为2026-08-25 19:57:07；致歉截图为26-8-25 23:31。保留原文，不选择其中一个日期作为定论。';db.prepare('UPDATE feedback SET pending_summary=?,verification_status=? WHERE id=?').run(note,'disputed',row.id);db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(row.id,Date.now(),'日期冲突标注','["pending_summary","verification_status"]',note)}
 for(const row of db.prepare('SELECT id,images,videos FROM feedback').all())for(const key of [...JSON.parse(row.images),...JSON.parse(row.videos||'[]')])index(key,row.id);
 function index(key,id){if(db.prepare('SELECT key FROM attachment_index WHERE key=?').get(key))return;const file=path.join(DATA,'uploads',key);if(fs.existsSync(file)){const bytes=fs.readFileSync(file);db.prepare('INSERT OR IGNORE INTO attachment_index VALUES(?,?,?,?)').run(key,id,crypto.createHash('sha256').update(bytes).digest('hex'),bytes.length)}}
 function extras(row){
  const parts=[...row.content.matchAll(/图(\d+)：[\s\S]*?(?=\n图\d+：|\n整理上传：|$)/g)];
  const attachments=[...JSON.parse(row.images),...JSON.parse(row.videos||'[]')].map((key,n)=>{const meta=db.prepare('SELECT sha256,size FROM attachment_index WHERE key=?').get(key);const block=parts.find(p=>Number(p[1])===n+1)?.[0]||'';return{key,caption:/说明：([^\n]+)/.exec(block)?.[1]||`附件 ${n+1} · 逐图说明待核（保留原附件索引）`,source:/来源页：(https?:\/\/[^\s]+)/.exec(block)?.[1]||'',source_type:block?'原附件索引／第三方留存': '逐图来源待核（不自动沿用事件主来源）',date:/(?:来源日期|日期依据)：([^\n]+)/.exec(block)?.[1]||'未知',...(meta||{}),duplicate_count:meta?db.prepare("SELECT COUNT(*) n FROM attachment_index JOIN feedback ON feedback.id=attachment_index.event_id WHERE sha256=? AND feedback.status='approved'").get(meta.sha256).n:1}});
  const changes=db.prepare('SELECT created,action,changes,public_note FROM event_changes WHERE event_id=? ORDER BY id').all(row.id).map(r=>({...r,changes:JSON.parse(r.changes)}));
  const record={...row,moderation_status:row.status,collected_at:row.created,attachments,changes,global:globalRecord(db,row),content_language:db.prepare('SELECT language FROM global_submission_languages WHERE event_id=?').get(row.id)?.language||'zh-CN'};
  return {...record,brief:editorialBrief(record)};
 }
 const publicItems=()=>db.prepare("SELECT feedback.*,COALESCE(users.username,guest_name,'站点整理') contributor FROM feedback LEFT JOIN users ON users.id=feedback.user_id WHERE feedback.status='approved' ORDER BY feedback.created DESC,feedback.id").all().map(extras);
 function initializeSubmission(id,fields){
  if(fields.content_language)db.prepare('INSERT INTO global_submission_languages VALUES(?,?)').run(id,fields.content_language);
  const parent=fields.parent_event_id||'';const reply=fields.reply_type||'';
  const type=parent?'correction':fields.record_type||'opinion';
  db.prepare('UPDATE feedback SET record_type=?,verification_status=?,evidence_level=?,publisher_scope=?,region=?,material_status=?,date_precision=?,source_type=?,parent_event_id=?,reply_type=?,pending_summary=?,response_summary=?,topic=? WHERE id=?').run(type,'unverified',(fields.has_media?'third_party':'none'),'unknown','unknown',fields.has_media?'evidence':'lead','unknown',fields.source?'用户提供来源（待核）':'未提供外部来源',parent,reply,'用户投稿，内容审核不代表事实核实','暂无已核验回应',fields.category==='广告表达'?'advertising':fields.category==='消费体验'?'experience':'other',id);
  const row=db.prepare('SELECT images,videos FROM feedback WHERE id=?').get(id);for(const key of [...JSON.parse(row.images),...JSON.parse(row.videos||'[]')])index(key,id);
 }
 function validateSubmission(f){
  if(f.content_language&&!['en','zh-CN'].includes(f.content_language))return '投稿语言无效 / Invalid contribution language';
  if(f.record_type&&!['opinion','event'].includes(f.record_type))return '投稿类型无效';
  if(f.parent_event_id){const parent=db.prepare("SELECT id,brand,record_type FROM feedback WHERE id=? AND status='approved'").get(f.parent_event_id);if(!parent||parent.record_type!=='event'||parent.brand!==f.brand)return '关联事件无效或品牌不一致';if(!['correction','response','counterevidence'].includes(f.reply_type))return '请选择补充类型'}
  return '';
 }
 function edit(id,body){
  const current=db.prepare('SELECT * FROM feedback WHERE id=?').get(id);if(!current)return{status:404,error:'事件不存在'};
  const edits={};for(const [key,allowed] of Object.entries(archiveFields))if(key in body){if(!allowed.includes(body[key]))return{status:400,error:'字段值无效：'+key};edits[key]=body[key]}
  for(const key of metadataText.filter(k=>!['parent_event_id','reply_type'].includes(k)))if(key in body){if(typeof body[key]!=='string'||body[key].length>1500)return{status:400,error:'文本字段无效'};edits[key]=body[key].trim()}
  if('editor_summary' in edits&&edits.editor_summary&&(edits.record_type||current.record_type)!=='event')return{status:400,error:'只有事件可设置品牌摘要'};
  const keys=Object.keys(edits);if(!keys.length)return{status:400,error:'没有变更字段'};
  if(typeof(body.public_note||'')!=='string'||(body.public_note||'').length>1000)return{status:400,error:'公开变更说明过长'};
  db.exec('BEGIN IMMEDIATE');try{db.prepare(`UPDATE feedback SET ${keys.map(k=>k+'=?').join(',')} WHERE id=?`).run(...Object.values(edits),id);db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(id,Date.now(),'档案更正',JSON.stringify(keys),body.public_note||'结构化档案更新');db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
  return{status:200,ok:true};
 }
 function publication(id,status){db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(id,Date.now(),'内容审核',JSON.stringify(['moderation_status']),status==='approved'?'允许公开；不表示事实核实':'公开状态调整')}
 return{publicItems,extras,initializeSubmission,validateSubmission,edit,publication};
}
