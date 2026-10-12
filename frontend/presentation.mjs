// Presentation only: these helpers never upgrade verification or infer dates.
export function eventSummary(item){
 const body=(item.content||'').split('附件索引')[0];
 const start=body.indexOf('事件概述');
 const section=start>=0?body.slice(start+4).split(/发生与报道时间|证据与核实情况|资料分类与证据层级|完整语境、回应与待核事项/)[0]:body;
 return section.trim()||item.editor_summary||item.title;
}
export function publisherText(item){
 if(item.publisher_scope==='shop'){
  const accounts=(item.attachments||[]).map(a=>a.caption||'').join(' ');
  if(item.brand==='回力'&&accounts.includes('回力路优专卖店'))return '回力路优专卖店（截图所示）';
  if(item.brand==='匹克'&&accounts.includes('匹克汇鑫洋服饰专卖店'))return '匹克汇鑫洋服饰专卖店（截图所示）';
  if(item.brand==='Dickies')return 'Dickies店铺（账号名称截断，完整身份待核）';
  return '店铺账号（具体身份待核）';
 }
 return ({headquarters:'品牌总部（依据见档案）',partner:'合作方（具体主体见档案）',other:'其他发布主体（见档案）'})[item.publisher_scope]||'发布账号与授权主体待核';
}
export function criticalNote(item){
 if(item.record_type==='opinion')return '消费者个人观点，内容审核不代表事实成立。';
 if(item.verification_status==='disputed')return item.pending_summary||'资料存在冲突，需核对原始来源。';
 const material=item.evidence_level==='third_party'?'第三方留存；完整原始材料仍需核验。':item.evidence_level==='none'?'尚无可公开附件，保留线索待核。':'核实依据与限制见档案。';
 const originalText=[item.content,item.pending_summary].filter(Boolean).join(' ');
 const missingVideo=/原始?视频(?:尚未取得|未取得)|完整原视频未取得|尚未取得(?:完整)?原(?:始)?(?:视频|片)|原片[、，]完整/.test(originalText)?'原视频尚未取得。':'';
 return material+missingVideo+(item.publisher_scope==='shop'?'店铺发布不等于品牌总部立场。':item.publisher_scope==='unknown'?'发布主体待核，不将转载者当作原发布者。':'');
}
export function recentRecords(items){return items.filter(i=>i.status==='approved'&&i.record_type==='event').slice().sort((a,b)=>b.created-a.created||a.id.localeCompare(b.id))}
