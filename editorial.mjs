import fs from 'node:fs';
import crypto from 'node:crypto';

const briefs=JSON.parse(fs.readFileSync(new URL('./docs/editorial-briefs-20261013.json',import.meta.url),'utf8'));
export const fingerprintFields=['id','brand','title','content','source','images','videos','record_type','event_date','date_precision','publisher_scope','response_summary','pending_summary','verification_status','evidence_level','source_date','source_type','editor_summary','material_status','region','topic'];
export function fingerprint(item){return crypto.createHash('sha256').update(JSON.stringify(fingerprintFields.map(k=>item[k]||''))).digest('hex')}
const safeURL=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}};
export function editorialBrief(item,entries=briefs){
 if(item.status!=='approved'||item.record_type!=='event')return null;
 const entry=entries.find(b=>b.event_id===item.id&&b.fingerprint===fingerprint(item));
 if(!entry)return null;
 const reference=point=>({...point,references:[...new Set(point.refs||[])].filter(n=>Number.isInteger(n)&&n>0&&item.attachments?.[n-1]).map(n=>({number:n,key:item.attachments[n-1].key,caption:item.attachments[n-1].caption||'查看原附件'})),sources:[...new Set((point.sources||[]).map(safeURL).filter(Boolean))]});
 return {summary:entry.summary,facts:entry.facts.map(reference),response:reference(entry.response),uncertainties:entry.uncertainties,date_note:entry.date_note,publisher_note:entry.publisher_note,edited_at:entry.edited_at,note:'按现有公开材料整理；不改变事实核实状态。'};
}
