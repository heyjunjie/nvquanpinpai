import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';

const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const action='争议传播时间补充';
export function applyPropagationAudit(db,audit,{dryRun=true,now=Date.now()}={}){
 if(audit.audit_id!=='propagation-dates-20261012'||audit.events.length!==3||new Set(audit.events.map(r=>r.id)).size!==3)throw Error('Invalid audit manifest');
 const changes=[];
 db.exec('BEGIN IMMEDIATE');
 try{
  for(const r of audit.events){
   const old=db.prepare('SELECT * FROM feedback WHERE id=?').get(r.id);
   if(!old||old.brand!==r.brand||old.title!==r.title||old.record_type!=='event'||old.status!=='approved')throw Error('Record identity/publication changed: '+r.id);
   const prior=db.prepare('SELECT public_note FROM event_changes WHERE event_id=? AND action=?').all(r.id,action).some(c=>c.public_note.includes(audit.audit_id));
   // An already applied audit never overrides a subsequent human correction.
   if(prior)continue;
   if(old.event_date!==''||old.date_precision!==r.expected_date_precision||digest(old.pending_summary)!==r.expected_pending_sha256)throw Error('Date or pending metadata changed; review required: '+r.id);
   if(r.event_date&&!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(r.event_date))throw Error('Noncanonical date');
   const note=`${audit.audit_id}：${r.event_date||'发生时间仍待核'}；${r.date_precision==='unknown'?'待核':r.date_precision}。公开传播页：${r.source}。此日期仅为已知争议传播节点，广告首次发布日期仍待核。 核对依据：https://github.com/heyjunjie/nvquanpinpai/blob/main/docs/PROPAGATION-DATES-20261012.md`;
   const pending=`【2026-10-12传播时间更正】原广告首发仍待核；已有明确公开传播节点，按该节点排序。此前“待核”针对广告首发，不否定已知传播时间。\n【此前记录，保留溯源】${old.pending_summary}`;
   if(pending.length>1500||note.length>1000)throw Error('Audit text too long');
   const fields=['pending_summary'];
   if(r.event_date)fields.unshift('event_date','date_precision');
   changes.push({id:r.id,event_date:r.event_date,fields});
   if(!dryRun){
    if(r.event_date)db.prepare('UPDATE feedback SET event_date=?,date_precision=?,pending_summary=? WHERE id=?').run(r.event_date,r.date_precision,pending,r.id);
    else db.prepare('UPDATE feedback SET pending_summary=? WHERE id=?').run(pending,r.id);
    db.prepare('INSERT INTO event_changes(event_id,created,action,changes,public_note) VALUES(?,?,?,?,?)').run(r.id,now,action,JSON.stringify(fields),note);
   }
  }
  db.exec(dryRun?'ROLLBACK':'COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e}
 return {audit_id:audit.audit_id,dryRun,reviewed:3,updated:changes.length,dated:audit.events.filter(r=>r.event_date).length,pending:audit.events.filter(r=>!r.event_date).length};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(!['--check','--apply'].includes(mode))throw Error('Use --check (no write) or --apply (backup then transaction)');
 const dir=process.env.DATA_DIR;
 if(!dir||!path.isAbsolute(dir))throw Error('Set absolute DATA_DIR');
 const audit=JSON.parse(fs.readFileSync(new URL('../docs/propagation-dates-20261012.json',import.meta.url),'utf8'));
 const db=new DatabaseSync(path.join(dir,'feedback.sqlite'));
 db.exec('PRAGMA busy_timeout=10000');
 const check=applyPropagationAudit(db,audit);
 if(mode==='--check'){console.log(JSON.stringify(check));db.close();}
 else{
  if(check.updated){
   const backupDir=path.join(dir,'date-audit-backups');fs.mkdirSync(backupDir,{recursive:true,mode:0o700});
   const backup=path.join(backupDir,`${audit.audit_id}-before-${Date.now()}.sqlite`);
   db.exec(`VACUUM INTO '${backup.replaceAll("'","''")}'`);fs.chmodSync(backup,0o600);
   console.log('Consistent SQLite backup: '+backup);
  }
  console.log(JSON.stringify(applyPropagationAudit(db,audit,{dryRun:false})));db.close();
 }
}
