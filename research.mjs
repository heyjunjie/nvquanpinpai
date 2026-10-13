import {brandAliases,brandMatches,publicBrandNames} from './frontend/catalog.mjs';
import {recentRecords,eventSummary,publisherText,criticalNote} from './frontend/presentation.mjs';
export const citationNotice='这是导出时的公开档案快照。内容审核不代表事实成立；引用时请核对原文、发布主体、回应与待核事项，并回到原档案查看后续更正。';
export const traceNotice='仅比对本站公开附件的 SHA-256。相同字节说明文件内容一致，不能证明原始出处、真实性或独立证据数量；裁剪、压缩后的相似图片不会被匹配。';
export const safeSource=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
const media=i=>[...JSON.parse(i.images||'[]'),...JSON.parse(i.videos||'[]')];
const publicRows=items=>items.filter(i=>i.status==='approved'&&i.record_type!=='site');
export const verificationLabel=value=>({verified:'已核实（查看依据）',partial:'部分核实',disputed:'存在争议／冲突',unverified:'事实待核'}[value]||'事实待核');
export function lookupBrands(items,query=''){
 const rows=publicRows(items);
 return publicBrandNames(rows).filter(b=>brandMatches(b,query)).map(brand=>{
  const records=rows.filter(i=>i.brand===brand),events=recentRecords(records);
  return {brand,aliases:brandAliases[brand]||[],events,record_count:records.length,attachment_count:records.reduce((n,i)=>n+media(i).length,0),unknown_dates:events.filter(i=>!i.event_date).length};
 });
}
export function materialTrace(items,key){
 const rows=publicRows(items),owner=rows.find(i=>media(i).includes(key));
 if(!owner)return null;
 const attachment=owner.attachments?.find(a=>a.key===key);
 if(!attachment?.sha256)return {key,sha256:null,size:null,matches:[],notice:'附件指纹暂未建立，请稍后重试。'};
 const matches=rows.flatMap(i=>(i.attachments||[]).filter(a=>media(i).includes(a.key)&&a.sha256===attachment.sha256).map(a=>({event_id:i.id,brand:i.brand,title:i.title,record_type:i.record_type,event_date:i.event_date||'',date_precision:i.date_precision||'',collected_at:i.collected_at||i.created,contributor:i.contributor||'站点整理',key:a.key,caption:a.caption||'',source:safeSource(a.source),source_date:a.date||'待核',source_type:a.source_type||'逐图来源待核'}))).sort((a,b)=>a.collected_at-b.collected_at||a.key.localeCompare(b.key));
 return {key,sha256:attachment.sha256,size:attachment.size,matches,notice:traceNotice};
}
export function citationPack(items,id,{origin='https://notbuy.top',now=new Date()}={}){
 const rows=publicRows(items),i=rows.find(i=>i.id===id);if(!i)return null;
 const base=new URL(origin).origin,link=(type,value)=>base+'/'+type+'/'+encodeURIComponent(value);
 const attachments=media(i).map((key,n)=>{const a=i.attachments?.find(a=>a.key===key)||{};return {number:n+1,key,url:link('attachment',key),kind:JSON.parse(i.images||'[]').includes(key)?'image':'video',caption:a.caption||'逐图说明待核',source:safeSource(a.source),source_type:a.source_type||'逐图来源待核',source_date:a.date||'待核',sha256:a.sha256||'',size:a.size??null};});
 const statement=p=>({text:p?.text||'',sources:(p?.sources||[]).map(safeSource).filter(Boolean),references:(p?.references||[]).filter(r=>attachments.some(a=>a.key===r.key)).map(r=>({key:r.key,number:r.number,url:link('attachment',r.key)}))});
 const brief=i.brief?{summary:i.brief.summary,date_note:i.brief.date_note,publisher_note:i.brief.publisher_note,facts:(i.brief.facts||[]).map(statement),response:statement(i.brief.response),uncertainties:i.brief.uncertainties||[],edited_at:i.brief.edited_at,note:i.brief.note}:null;
 return {schema_version:1,generated_at:now.toISOString(),site:'女拳品牌观察',notice:citationNotice,rights:'软件代码采用 MIT；第三方截图、视频、商标和投稿内容不在该授权内。本文件提供资料索引，附件未打包。',
  record:{id:i.id,url:link('event',i.id),brand:i.brand,title:i.title,record_type:i.record_type,contributor:i.contributor||'站点整理',verification_status:i.verification_status||'unverified',verification_label:verificationLabel(i.verification_status),evidence_level:i.evidence_level||'none',publisher:publisherText(i),event_date:i.event_date||'',date_precision:i.date_precision||'',source_date:i.source_date||'',collected_at:new Date(i.collected_at||i.created).toISOString(),summary:eventSummary(i),content:i.content||'',source:safeSource(i.source),source_type:i.source_type||'待核',response:i.response_summary||'暂无已核验回应',pending:i.pending_summary||'完整语境、原始主体及日期待核',critical_note:criticalNote(i),parent_url:rows.some(p=>p.id===i.parent_event_id)?link('event',i.parent_event_id):''},
  brief,attachments,related:rows.filter(r=>r.parent_event_id===i.id).map(r=>({title:r.title,url:link('event',r.id),kind:r.reply_type,contributor:r.contributor||'站点整理'})),changes:(i.changes||[]).map(c=>({at:new Date(c.created).toISOString(),action:c.action,fields:c.changes,note:c.public_note}))};
}
const md=value=>String(value??'').replace(/[\\`*_[\]<>#|]/g,'\\$&');
const url=value=>value?'<'+value.replace(/[<>\s]/g,c=>encodeURIComponent(c))+'>':'待核';
export function citationMarkdown(pack){
 const i=pack.record,lines=[`# ${md(i.title)}`,'',pack.notice,'',`- 档案：${url(i.url)}`,`- 导出时间：${pack.generated_at}`,`- 品牌：${md(i.brand)}`,`- 记录类型：${md(i.record_type)}；核实状态：${md(i.verification_label)}`,`- 贡献者：${md(i.contributor)}`,`- 发布主体：${md(i.publisher)}`,`- 事件时间：${md(i.event_date||'待核')}；精度：${md(i.date_precision||'待核')}`,`- 来源时间：${md(i.source_date||'待核')}`,`- 本站收录时间：${i.collected_at}`,'','## 摘要','',md(i.summary),'',md(i.critical_note),'','## 回应与待核事项','',md(i.response),'',md(i.pending),'','## 来源','',`来源类型：${md(i.source_type)}`,url(i.source)];
 if(pack.brief){const b=pack.brief;lines.push('','## 编辑导读','',md(b.summary),'',md(b.date_note),'',md(b.publisher_note));for(const p of [...b.facts,b.response])lines.push('',md(p.text),...p.sources.map(url),...p.references.map(r=>`附件 ${r.number}：${url(r.url)}`));lines.push('',...b.uncertainties.map(s=>'- '+md(s)),md(b.note),`导读整理：${md(b.edited_at)}`)}
 lines.push('','## 附件索引（图片与视频）','');
 for(const a of pack.attachments)lines.push(`### 附件 ${a.number} · ${a.kind==='image'?'图片':'视频'}`,'',md(a.caption),`- 独立链接：${url(a.url)}`,`- 逐图来源：${url(a.source)}`,`- 来源类型：${md(a.source_type)}`,`- 来源日期：${md(a.source_date)}`,`- SHA-256：${a.sha256||'待建立'}`,'');
 if(!pack.attachments.length)lines.push('暂无公开附件。');
 lines.push('','## 关联回应与纠错','',...pack.related.map(r=>`- ${md(r.title)} · ${md(r.contributor)} ${url(r.url)}`),...(!pack.related.length?['暂无已公开关联补充。']:[]),'','## 公开变更记录','',...pack.changes.map(c=>`- ${c.at} · ${md(c.action)} · ${md(c.note)}；变更字段：${md((c.fields||[]).join('、'))}`),'','## 档案原文','',md(i.content),'','## 使用说明','',pack.rights,'');
 return lines.join('\n');
}
