import {currentLocale,localePath} from './locale.mjs';
import {eventSummary,publisherText,criticalNote} from './presentation.mjs';

const labels={unverified:'事实待核',partial:'部分核实',verified:'已有核实依据',disputed:'资料存在冲突'};
const publicFields=new Set(['event_date','source_date','date_precision','source_type','editor_summary','response_summary','pending_summary','publisher_scope','verification_status','evidence_level','region','material_status','topic','record_type']);
const stamp=value=>{const n=typeof value==='number'?value:Date.parse(value);return Number.isFinite(n)&&n>0?n:0};
export function recentUpdates(items,limit=100){
 const approved=items.filter(i=>i.status==='approved'&&['event','correction'].includes(i.record_type));
 const ids=new Set(approved.filter(i=>i.record_type==='event').map(i=>i.id));
 const updates=[];
 for(const item of approved){
  if(item.record_type==='correction'&&!ids.has(item.parent_event_id))continue;
  const base={event_id:item.id,title:item.title,brand:item.brand,event_date:item.event_date||'待核',record_type:item.record_type};
  const publish=(item.changes||[]).filter(c=>c.action==='内容审核'&&c.public_note?.startsWith('允许公开')&&stamp(c.created)).sort((a,b)=>stamp(b.created)-stamp(a.created))[0];
  const at=stamp(publish?.created)||stamp(item.created);
  if(at)updates.push({...base,key:item.id+':published',at,kind:'published',label:publish?'公开资料':'收录资料',note:item.record_type==='correction'?'新增关联回应或更正，点击查看原文。':'本站收录时间，事件发生时间另列。'});
  for(const [n,c] of (item.changes||[]).entries()){
   if(c.action==='内容审核'||!stamp(c.created)||!(c.changes||[]).some(k=>publicFields.has(k)))continue;
   updates.push({...base,key:item.id+':change:'+n,at:stamp(c.created),kind:'change',label:c.action||'档案更正',note:c.public_note||'结构化档案已更新，具体依据见事件。'});
  }
  if(item.brief&&stamp(item.brief.edited_at))updates.push({...base,key:item.id+':brief',at:stamp(item.brief.edited_at),kind:'brief',label:'整理阅读摘要',note:'增加材料要点、回应与待核事项，并关联原附件；未升级事实核实状态。'});
 }
 const seen=new Set();
 return updates.sort((a,b)=>b.at-a.at||a.key.localeCompare(b.key)).filter(u=>{const key=[u.event_id,u.at,u.kind,u.note].join('|');if(seen.has(key))return false;seen.add(key);return true}).slice(0,limit);
}
export function formatUpdateTime(value){return new Intl.DateTimeFormat(currentLocale(),{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))}
export function shareModel(item){
 const sources=[item.source,...(item.attachments||[]).map(a=>a.source)].filter(Boolean).flatMap(value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?[u.hostname]:[]}catch{return []}});
 return {title:item.title,brand:item.brand,status:labels[item.verification_status]||'事实待核',date:`${item.event_date||'日期待核'}${item.date_precision?' · '+item.date_precision:''}`,summary:item.brief?.summary||eventSummary(item),publisher:item.brief?.publisher_note||publisherText(item),response:item.brief?.response.text||item.response_summary||'暂无已核验回应',limitation:item.brief?.uncertainties.map(s=>s.replace(/[。；;]+$/,'')).join('；')||criticalNote(item),sources:[...new Set(sources)].slice(0,2).join(' / ')||'来源待核',url:'https://notbuy.top'+localePath('/event/'+encodeURIComponent(item.id),currentLocale()),contributor:item.contributor||'站点整理'};
}
