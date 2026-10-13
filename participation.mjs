import fs from 'node:fs';
import crypto from 'node:crypto';
import {globalSchema} from './global-data.mjs';
const seeds=JSON.parse(fs.readFileSync(new URL('./docs/evidence-tasks-20261013.json',import.meta.url),'utf8'));
const kinds=['original','date','identity','response'];
export function participation(db,getItems,initial=seeds){
 globalSchema(db);
 db.exec(`CREATE TABLE IF NOT EXISTS evidence_tasks(id TEXT PRIMARY KEY,event_id TEXT NOT NULL,title TEXT NOT NULL,need TEXT NOT NULL,kind TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',priority INTEGER NOT NULL DEFAULT 1,created INTEGER NOT NULL,updated INTEGER NOT NULL,resolution_id TEXT NOT NULL DEFAULT '',resolution_note TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS evidence_task_links(feedback_id TEXT PRIMARY KEY,task_id TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS evidence_task_event ON evidence_tasks(event_id);`);
 const approved=()=>getItems().filter(i=>i.status==='approved');
 const event=id=>approved().find(i=>i.id===id&&i.record_type==='event');
 const insert=db.prepare('INSERT INTO evidence_tasks(id,event_id,title,need,kind,priority,created,updated) VALUES(?,?,?,?,?,?,?,?)');
 for(const seed of initial){const item=event(seed.event_id);if(item&&!db.prepare('SELECT id FROM evidence_tasks WHERE id=?').get(seed.id)&&!(seed.kind==='date'&&item.event_date)){const now=Date.now();insert.run(seed.id,seed.event_id,seed.title,seed.need,seed.kind,seed.priority||1,now,now)}}
 function publicItems(){
  const rows=approved(),events=new Map(rows.filter(i=>i.record_type==='event').map(i=>[i.id,i]));
  return db.prepare("SELECT * FROM evidence_tasks WHERE status!='archived' ORDER BY priority DESC,created,id").all().filter(t=>events.has(t.event_id)).map(t=>{
   const candidates=rows.filter(i=>i.record_type==='correction'&&i.parent_event_id===t.event_id);
   const credit=i=>({id:i.id,title:i.title,contributor:i.contributor||'署名待补',guest:!!i.guest_name,created:i.created});
   const proof=candidates.find(i=>i.id===t.resolution_id);
   const links=new Set(db.prepare('SELECT feedback_id FROM evidence_task_links WHERE task_id=?').all(t.id).map(r=>r.feedback_id));
   const parent=events.get(t.event_id),status=t.status==='resolved'&&proof?'resolved':'open';
   const translation=db.prepare('SELECT payload FROM global_task_meta WHERE task_id=?').get(t.id);
   return {id:t.id,event_id:t.event_id,title:t.title,need:t.need,kind:t.kind,priority:t.priority,created:t.created,updated:t.updated,status,brand:parent.brand,event_title:parent.title,translations:translation?JSON.parse(translation.payload):null,proof:status==='resolved'?credit(proof):null,resolution_note:status==='resolved'?t.resolution_note:'',contributions:candidates.filter(i=>links.has(i.id)).map(credit)};
  });
 }
 function create(f){
  if(!event(f.event_id)||typeof f.title!=='string'||f.title.trim().length<4||f.title.length>80||typeof f.need!=='string'||f.need.trim().length<10||f.need.length>700||!kinds.includes(f.kind))return {status:400,error:'请选择公开事件，填写4—80字任务标题、10—700字材料要求和任务类型'};
  const id=crypto.randomUUID(),now=Date.now();insert.run(id,f.event_id,f.title.trim(),f.need.trim(),f.kind,f.priority===2?2:1,now,now);return {status:201,item:publicItems().find(t=>t.id===id)};
 }
 function update(id,f){
  const task=db.prepare('SELECT * FROM evidence_tasks WHERE id=?').get(id);if(!task)return {status:404,error:'任务不存在'};
  if(!['open','resolved','archived'].includes(f.status))return {status:400,error:'任务状态无效'};
  if(f.status==='resolved'){
   const proof=approved().find(i=>i.id===f.resolution_id&&i.record_type==='correction'&&i.parent_event_id===task.event_id);
   if(!event(task.event_id)||!proof||typeof f.resolution_note!=='string'||f.resolution_note.trim().length<10||f.resolution_note.length>700)return {status:400,error:'完成任务需要已公开的关联补证，以及10—700字核对说明'};
  }
  db.prepare('UPDATE evidence_tasks SET status=?,resolution_id=?,resolution_note=?,updated=? WHERE id=?').run(f.status,f.status==='resolved'?f.resolution_id:'',f.status==='resolved'?f.resolution_note.trim():'',Date.now(),id);return {status:200,ok:true};
 }
 function validateSubmission(f){if(!f.task_id)return '';const task=publicItems().find(t=>t.id===f.task_id);if(!task||task.status!=='open')return '补证任务已关闭或暂不公开，请刷新后选择其他任务';if(f.parent_event_id!==task.event_id)return '补证任务与关联事件不一致';return ''}
 function link(feedbackId,taskId){if(taskId)db.prepare('INSERT INTO evidence_task_links VALUES(?,?)').run(feedbackId,taskId)}
 function adminItems(){const visible=publicItems();return db.prepare('SELECT * FROM evidence_tasks ORDER BY updated DESC,id').all().map(t=>({...t,public:visible.find(v=>v.id===t.id)||null,submissions:db.prepare('SELECT feedback.id,feedback.status FROM evidence_task_links JOIN feedback ON feedback.id=evidence_task_links.feedback_id WHERE task_id=?').all(t.id),candidates:approved().filter(i=>i.record_type==='correction'&&i.parent_event_id===t.event_id).map(i=>({id:i.id,title:i.title,contributor:i.contributor||'署名待补'}))}))}
 return {publicItems,adminItems,create,update,validateSubmission,link};
}
