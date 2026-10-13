import {eventSummary,publisherText,criticalNote,recentRecords} from './frontend/presentation.mjs';
import {recentUpdates,formatUpdateTime} from './frontend/reading.mjs';
const SITE='女拳品牌观察';
export const topics=[
 {slug:'store-posts',title:'回力、匹克、Dickies 店铺争议：图片、时间与发布主体',description:'把三组店铺相关资料放在一起查阅：先核对截图中的账号，再看传播日期、原片缺口与品牌回应。店铺行为与总部立场分别记录。',intro:'相似的截图在传播中很容易被合并成同一件事。这份专题按事件发生或争议传播时间排列，保留每组图片的来源和主体限制。原视频尚未取得的，不把截图当成完整语境。',match:i=>['回力','匹克','Dickies'].includes(i.brand)},
 {slug:'history',title:'品牌广告争议历史时间线：旧事件与来源回看',description:'回看本站已公开的 2024 年以前品牌事件，区分发生、报道与收录日期，并逐条查阅图片和回应。',intro:'旧材料重新传播，不等于新的品牌表态。这里仅列发生时间可定位到 2024 年以前的公开档案；日期待核的条目留在完整目录，不人为补齐年月日。海外历史研究仍在核验，完成核验与发布审核后再进入事件档案。',match:i=>/^\d{4}/.test(i.event_date||'')&&Number(i.event_date.slice(0,4))<2024},
 {slug:'responses',title:'品牌回应怎么查：回应记录、纠错与待核事项',description:'逐条查阅已公开档案里的品牌回应及待核事项；没有找到回应，不等于品牌明确拒绝道歉。',intro:'回应是否来自品牌本人、回应了什么、是否撤回或道歉，是三个不同的问题。以下按事件时间列出已有记录，回应原文与来源以对应档案为准。没有核实的部分继续标注，不用“沉默”推断“拒绝道歉”。',match:i=>!!i.response_summary}
];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pathFor=(type,value)=>'/'+type+'/'+encodeURIComponent(value);
const safeURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const media=item=>[...JSON.parse(item.images||'[]'),...JSON.parse(item.videos||'[]')];
const typeLabel=i=>({event:'事件档案',opinion:'个人观点',correction:'回应／纠错',site:'站点说明'}[i.record_type]||'记录');
const stateLabel=i=>({verified:'已核实（查看依据）',partial:'部分核实',disputed:'存在争议／冲突',unverified:'事实待核'}[i.verification_status]||'事实待核');
function briefHTML(brief){
 if(!brief)return '';
 const refs=p=>[...(p.references||[]).map(r=>`<a href="${pathFor('attachment',r.key)}">附件 ${esc(r.number)}</a>`),...(p.sources||[]).filter(safeURL).map(url=>`<a href="${esc(url)}" target="_blank" rel="noreferrer">来源</a>`)].join(' · ');
 return `<section><h2>30 秒看懂这份资料</h2><p>${esc(brief.summary)}</p><dl><dt>时间怎么读</dt><dd>${esc(brief.date_note)}</dd><dt>发布主体</dt><dd>${esc(brief.publisher_note)}</dd></dl><h3>现有材料记载了什么</h3><ul>${brief.facts.map(p=>`<li>${esc(p.text)} ${refs(p)}</li>`).join('')}</ul><h3>品牌回应</h3><p>${esc(brief.response.text)} ${refs(brief.response)}</p><h3>还不能确定的部分</h3><ul>${brief.uncertainties.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="discovery-meta">${esc(brief.note)} 摘要整理：${esc(formatUpdateTime(brief.edited_at))}</p></section>`;
}
function updatesHTML(items,limit=100){const rows=recentUpdates(items,limit);return rows.length?`<ol class="discovery-list update-list">${rows.map(u=>`<li><p class="discovery-meta"><time datetime="${new Date(u.at).toISOString()}">${esc(formatUpdateTime(u.at))}</time> · ${esc(u.label)}</p><h2><a href="${pathFor('event',u.event_id)}">${esc(u.title)}</a></h2><p>${esc(u.note)}</p><p class="discovery-meta">事件时间：${esc(u.event_date)} · 与本站更新时间分别记录</p></li>`).join('')}</ol>`:'<p>尚无可公开的更新记录。</p>'}
export function discovery({template,getItems,getTasks=()=>[],origin='https://notbuy.top',assetVersion='1'}) {
 const siteURL=new URL(origin);if(!['https:','http:'].includes(siteURL.protocol))throw Error('Invalid public origin');
 const base=siteURL.origin;
 function shell({title,description,path='/',body,noindex=false,app=false,image='',items=[]}) {
  const canonical=base+path;
  const structured={'@context':'https://schema.org','@type':path==='/'?'WebSite':'WebPage',name:title,description,url:canonical,inLanguage:'zh-CN',isPartOf:{'@type':'WebSite',name:SITE,url:base+'/'}};
  const head=`<title>${esc(title)} | ${SITE}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}"><meta name="robots" content="${noindex?'noindex,follow':'index,follow'}"><meta property="og:type" content="website"><meta property="og:site_name" content="${SITE}"><meta property="og:locale" content="zh_CN"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}">${image?`<meta property="og:image" content="${esc(base+'/api/images/'+image)}"><meta property="og:image:alt" content="${esc(title+' · 留存材料，核实状态见原档案')}">`:''}<meta name="twitter:card" content="summary"><link rel="alternate" type="application/rss+xml" title="${SITE}公开档案更新" href="/feed.xml"><link rel="stylesheet" href="/discovery.css?v=${esc(assetVersion)}"><script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script>`;
  let html=template.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta name="description"[^>]*>/,'').replace('</head>',head+'</head>');
  if(!app)html=html.replace(/<script\b[^>]*src=["'][^"']+["'][^>]*>[\s\S]*?<\/script>/g,'');
  const content=`<div class="discovery-page"><header><a class="discovery-logo" href="/">${SITE}</a><nav aria-label="资料导航"><a href="/archive">全部档案</a><a href="/updates">最近更新</a><a href="/tasks">一起补证</a><a href="/topics/store-posts">店铺争议</a><a href="/topics/history">历史回看</a><a href="/feed.xml">RSS 订阅</a></nav></header><main id="main-content"><h1>${esc(title)}</h1><p class="discovery-deck">${esc(description)}</p>${body}</main><footer><p>独立消费者反馈站 · 与所列品牌无关联。收录与内容审核不代表指控成立。</p><a href="mailto:tojunjie@gmail.com">联系站长 / 提供更正</a><a href="/">回到首页提交反馈与证据</a></footer></div>`;
  const bootstrap=app?`<script id="public-records" type="application/json">${JSON.stringify(items).replace(/</g,'\\u003c')}</script>`:'<script type="module" src="/discovery-visit.js"></script>';
  return html.replace('<div id="root"></div>',`<div id="root">${content}</div>${bootstrap}`);
 }
 function list(rows,responses=false) {return rows.length?`<ol class="discovery-list">${rows.map(i=>`<li><p class="discovery-meta">${esc(i.event_date||'发生日期待核')} · ${esc(typeLabel(i))} · ${esc(stateLabel(i))}</p><h2><a href="${pathFor('event',i.id)}">${esc(i.title)}</a></h2><p>${esc(eventSummary(i))}</p>${responses?`<h3>回应记录</h3><p>${esc(i.response_summary||'暂无已核验回应')}</p><details><summary>查看待核事项</summary><p>${esc(i.pending_summary||'完整语境与发布主体待核')}</p></details>`:''}<p class="discovery-meta">${esc(publisherText(i))} · 贡献者：${esc(i.contributor||'站点整理')}</p></li>`).join('')}</ol>`:'<p>暂时没有符合条件的公开档案。</p>';}
 function handle(pathname,query='') {
  const items=getItems().filter(i=>i.status==='approved');
  const events=recentRecords(items),brands=[...new Set(['回力','罗蒙','Dickies','匹克','德芙','罗技','OPPO','滴露','TVB',...items.filter(i=>i.record_type!=='site').map(i=>i.brand)])].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  const html=(options,status=200)=>({status,type:'text/html; charset=utf-8',body:shell({...options,items}),noindex:options.noindex});
  if(pathname==='/tasks'){
   const tasks=getTasks(),kinds={original:'原始材料',date:'日期核对',identity:'发布主体',response:'回应原件'};
   const render=t=>`<li><p class="discovery-meta">${esc(t.brand)} · ${esc(kinds[t.kind])} · ${t.status==='resolved'?'已补齐材料':'等待补证'}</p><h3>${esc(t.title)}</h3><p>${esc(t.need)}</p><p><a href="${pathFor('event',t.event_id)}">关联事件：${esc(t.event_title)}</a></p>${t.status==='resolved'&&t.proof?`<p>${esc(t.resolution_note)}</p><p><a href="${pathFor('event',t.proof.id)}">查看完成依据</a> · 贡献者：${esc(t.proof.contributor)}${t.proof.guest?'（未注册署名）':''}</p><p class="discovery-meta">补齐此项材料不代表整个事件已核实。</p>`:`<p><a class="discovery-task-action" href="${pathFor('reply',t.event_id)}?task=${encodeURIComponent(t.id)}">我有这份资料</a></p>${t.contributions.length?`<p class="discovery-meta">已公开补证：${t.contributions.map(c=>`<a href="${pathFor('event',c.id)}">${esc(c.contributor)}${c.guest?'（未注册）':''}</a>`).join('、')}；仍待核对任务是否补齐。</p>`:''}`}</li>`;
   return html({path:pathname,title:'一起补证：让缺失的资料回到档案里',description:'查找需要原图、完整视频、回应原件或日期依据的具体任务。可以不注册，但必须留名；审核后公开署名与关联材料。',body:`<p>只提交你持有或能提供来源的材料。每项任务都关联具体事件，完成时附公开依据；依据撤回后重新待补。</p>${['open','resolved'].map(status=>{const rows=tasks.filter(t=>t.status===status);return `<section><h2>${status==='open'?'等待补证':'已经补齐'} <span class="discovery-meta">${rows.length} 项</span></h2>${rows.length?`<ol class="discovery-list task-list">${rows.map(render).join('')}</ol>`:`<p>${status==='open'?'目前没有待补证任务。':'尚无已完成任务。'}</p>`}</section>`}).join('')}`});
  }
  if(pathname==='/updates')return html({path:pathname,title:'最近更新：补证、回应与更正',description:'按本站更新时间查阅公开档案的新增资料、阅读摘要与更正。事件发生时间另列，不把旧事件当作新事件。',body:updatesHTML(items)});
  if(pathname==='/robots.txt')return {status:200,type:'text/plain; charset=utf-8',body:`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin/\nDisallow: /api/mine\nDisallow: /api/session\nDisallow: /reply/\nSitemap: ${base}/sitemap.xml\n`};
  if(pathname==='/sitemap.xml') {
   const urls=['/','/archive','/updates','/tasks',...topics.map(t=>'/topics/'+t.slug),...brands.map(b=>pathFor('brand',b)),...items.filter(i=>i.record_type!=='site').map(i=>pathFor('event',i.id))];
   return {status:200,type:'application/xml; charset=utf-8',body:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(p=>`<url><loc>${esc(base+p)}</loc></url>`).join('')}</urlset>`};
  }
  if(pathname==='/feed.xml') {
   const brand=new URLSearchParams(query).get('brand');if(brand!==null&&!brands.includes(brand))return {status:404,type:'text/plain; charset=utf-8',body:'品牌不存在或暂不公开'};
   const updated=i=>Math.max(Date.parse(i.brief?.edited_at||'')||0,i.created,...(i.changes||[]).map(c=>c.created));
   const rows=items.filter(i=>i.record_type!=='site'&&(brand===null||i.brand===brand)).sort((a,b)=>updated(b)-updated(a)).slice(0,30);
   return {status:200,type:'application/rss+xml; charset=utf-8',body:`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE} · ${brand===null?'公开档案':esc(brand)}更新</title><link>${base}/</link><description>按本站收录或修订时间发布；事件发生日期另列。内容审核不代表事实成立。</description><language>zh-CN</language>${rows.map(i=>`<item><title>${esc(i.title)}</title><link>${esc(base+pathFor('event',i.id))}</link><guid isPermaLink="false">${esc(i.id+':'+updated(i))}</guid><pubDate>${new Date(updated(i)).toUTCString()}</pubDate><description>${esc(`事件日期：${i.event_date||'待核'}。${eventSummary(i)} ${criticalNote(i)}。贡献者：${i.contributor||'站点整理'}`)}</description></item>`).join('')}</channel></rss>`};
  }
  if(pathname==='/'||pathname==='/index.html'||pathname==='/archive')return html({path:pathname==='/index.html'?'/':pathname,title:pathname==='/archive'?'全部品牌与事件档案':'品牌事件、原始资料与回应',description:`按品牌和发生时间查阅 ${events.length} 条公开事件。图片、视频、来源、品牌回应和待核事项分别记录。`,app:pathname!=='/archive',body:`<section><h2>品牌目录</h2><div class="discovery-brands">${brands.map(b=>`<a href="${pathFor('brand',b)}">${esc(b)}</a>`).join('')}</div></section><section><h2>专题导读</h2>${topics.map(t=>`<p><a href="/topics/${t.slug}">${esc(t.title)}</a></p>`).join('')}</section><section><h2>最近更新了什么</h2><p><a href="/updates">查阅全部更新</a></p>${updatesHTML(items,4)}</section>${list(events)}${items.some(i=>['opinion','correction'].includes(i.record_type))?`<section><h2>消费者观点与更正</h2>${list(items.filter(i=>['opinion','correction'].includes(i.record_type)))}</section>`:''}`});
  if(pathname.startsWith('/topics/')){const topic=topics.find(t=>'/topics/'+t.slug===pathname);if(topic)return html({path:pathname,title:topic.title,description:topic.description,body:`<p>${esc(topic.intro)}</p>${list(events.filter(topic.match),topic.slug==='responses')}<p><a href="/archive">查阅完整档案目录</a></p>`});}
  if(pathname.startsWith('/brand/')) {const name=pathname.slice(7);if(brands.includes(name)){const rows=items.filter(i=>i.brand===name);return html({path:pathFor('brand',name),title:`${name}品牌事件与资料`,description:`${name}的 ${rows.length} 条公开记录：图片、事件经过、原始来源、品牌回应与待核事项。`,app:true,body:`<p><a href="/feed.xml?brand=${encodeURIComponent(name)}">订阅 ${esc(name)} 的 RSS 更新</a></p>`+list([...recentRecords(rows),...rows.filter(i=>i.record_type!=='event')])});}}
  if(pathname.startsWith('/event/')||pathname.startsWith('/attachment/')) {
   const attachment=pathname.startsWith('/attachment/'),value=pathname.slice(attachment?12:7);
   const item=attachment?items.find(i=>media(i).includes(value)):items.find(i=>i.id===value);
   if(item){
    const mediaHTML=media(item).filter(k=>!attachment||k===value).map((key,n)=>{const meta=item.attachments?.find(a=>a.key===key);return `<figure>${JSON.parse(item.images||'[]').includes(key)?`<a href="${pathFor('attachment',key)}"><img src="/api/images/${esc(key)}" alt="${esc(meta?.caption||item.title+' · 附件 '+(n+1))}" loading="lazy"></a>`:`<video src="/api/images/${esc(key)}" controls playsinline preload="metadata"></video>`}<figcaption>${esc(meta?.caption||'逐图说明待核')} · 来源日期：${esc(meta?.date||'待核')}${safeURL(meta?.source)?` · <a href="${esc(safeURL(meta.source))}" rel="noreferrer">附件来源</a>`:''}</figcaption></figure>`}).join('');
    const description=`${typeLabel(item)} · ${stateLabel(item)}。${eventSummary(item)}`.slice(0,155);
    return html({path:pathFor(attachment?'attachment':'event',value),title:item.title,description,noindex:attachment||item.record_type==='site',app:true,image:JSON.parse(item.images||'[]')[0],body:`<p>${esc(typeLabel(item))} · ${esc(stateLabel(item))} · 贡献者：${esc(item.contributor||'站点整理')}</p><p>${esc(criticalNote(item))}</p>${mediaHTML}${attachment?'':briefHTML(item.brief)}<section><h2>事件经过</h2><p>${esc(eventSummary(item))}</p><dl><dt>事件日期</dt><dd>${esc(item.event_date||'待核')} ${esc(item.date_precision||'')}</dd><dt>来源日期</dt><dd>${esc(item.source_date||'待核')}</dd><dt>发布主体</dt><dd>${esc(publisherText(item))}</dd><dt>品牌回应</dt><dd>${esc(item.response_summary||'暂无已核验回应')}</dd><dt>待核事项</dt><dd>${esc(item.pending_summary||'完整语境、原始主体及日期待核')}</dd></dl><p class="discovery-original">${esc(item.content)}</p>${safeURL(item.source)?`<a href="${esc(safeURL(item.source))}" rel="noreferrer">查看原始来源</a>`:''}</section><p><a href="${pathFor('brand',item.brand)}">继续查阅 ${esc(item.brand)} 品牌档案</a></p>${attachment?`<a href="${pathFor('event',item.id)}">返回所属事件</a>`:''}`});
   }
  }
  if(pathname==='/admin'||pathname.startsWith('/reply/'))return html({path:pathname,title:pathname==='/admin'?'管理后台':'补充回应与更正',description:'登录管理或提供关联资料。',noindex:true,app:true,body:'<p>请通过页面表单继续操作。</p>'});
  return html({path:pathname,title:'记录未公开或链接无效',description:'此记录暂不可访问，请返回目录查阅公开资料。',noindex:true,body:'<p><a href="/archive">返回公开档案目录</a></p>'},404);
 }
 return {handle};
}
