import {useState} from 'react';
import {ArrowUpRight,Bookmark,Plus,Search,X} from 'lucide-react';
import {CommunityStats} from './Community';
import {labels,recordLabel,type RecordItem} from './ArchiveUI';
import {eventSummary,publisherText,criticalNote,recentRecords} from './presentation.mjs';

type Brand={name:string;en:string;type:string};
type FilterProps={topic:string;material:string;scope:string;region:string;onTopic:(v:string)=>void;onMaterial:(v:string)=>void;onScope:(v:string)=>void;onRegion:(v:string)=>void;onClear:()=>void};
type Props=FilterProps&{api:string;items:RecordItem[];shown:RecordItem[];brands:Brand[];matchingBrands:Brand[];visible:Brand[];leadBrands:Brand[];saved:string[];filter:string;onFilter:(v:string)=>void;onBookmark:(v:string)=>void;query:string;onQuery:(v:string)=>void;loading:boolean;error:string;onRetry:()=>void;onNavigate:(v:string)=>void;onSubmit:(brand?:string)=>void;statsRevision:number;summaryFor:(brand:string)=>string};

function Filters(p:FilterProps){
 const [open,setOpen]=useState(false);
 const count=Number(p.topic!=='全部资料')+Number(p.material!=='all')+Number(p.scope!=='all')+Number(p.region!=='all');
 return <section className="filter-controls" aria-label="组合筛选">
  <div className="filter-heading"><span>筛选范围 · 已选 {count} 项</span><button className="filter-toggle" aria-expanded={open} aria-controls="filter-panel" onClick={()=>setOpen(!open)}>筛选 · 已选 {count} 项 {open?'收起':'展开'}</button><button className="text-button" onClick={p.onClear}>清空条件<X size={15}/></button></div>
  <div id="filter-panel" className="filter-panel" data-open={open}>
   <label>事件主题<select aria-label="事件主题" value={p.topic} onChange={e=>p.onTopic(e.target.value)}>{['全部资料','advertising','partnership','experience','other'].map(v=><option key={v} value={v}>{labels[v]||v}</option>)}</select></label>
   <label>材料状态<select aria-label="材料状态" value={p.material} onChange={e=>p.onMaterial(e.target.value)}>{['all','evidence','lead','background'].map(v=><option key={v} value={v}>{v==='all'?'全部材料':labels[v]}</option>)}</select></label>
   <label>主体关系<select aria-label="主体关系" value={p.scope} onChange={e=>p.onScope(e.target.value)}>{['all','unknown','shop','headquarters','partner','other'].map(v=><option key={v} value={v}>{v==='all'?'全部主体':labels[v]}</option>)}</select></label>
   <label>地区<select aria-label="地区" value={p.region} onChange={e=>p.onRegion(e.target.value)}>{['all','mainland','overseas','unknown'].map(v=><option key={v} value={v}>{v==='all'?'全部地区':labels[v]}</option>)}</select></label>
  </div>
 </section>;
}

function RecordCard({item,api,onNavigate}:{item:RecordItem;api:string;onNavigate:(hash:string)=>void}){
 const first=JSON.parse(item.images||'[]')[0];
 return <article className="event-card" data-record-type={item.record_type}>
  <button className="event-card-open" aria-label={`查看事件与证据：${item.title}`} onClick={()=>onNavigate(`#/event/${item.id}`)}>
   <div className="event-thumbnail">{first?<img src={api+'/api/images/'+first} alt={item.title+' · 原始留存图片预览'} loading="lazy"/>:<div className="no-material">尚无可公开图片<span>保留原线索 · 等待原始资料</span></div>}</div>
   <div className="event-card-copy"><div className="record-tags"><strong>{item.brand}</strong><span>{labels[item.material_status]||'材料待核'}</span><span>{labels[item.verification_status]||'事实待核'}</span></div><h3>{item.title}</h3><p className="event-excerpt">{eventSummary(item)}</p><dl className="card-facts"><div><dt>发布主体</dt><dd>{publisherText(item)}</dd></div><div><dt>品牌回应</dt><dd>{item.response_summary||'暂无已核验回应'}</dd></div></dl><p className="card-caution">{criticalNote(item)}</p><footer><span>收录 {new Date(item.created).toLocaleDateString('zh-CN')} · {item.event_date?'事件 '+item.event_date:'事件日期待核'}</span><strong>看图片与来源<ArrowUpRight size={17}/></strong></footer></div>
  </button>
 </article>;
}

export function EventOverview({item}:{item:RecordItem}){
 return <section className="event-overview"><h3>{item.record_type==='opinion'?'观点原文':'具体经过'}</h3><p>{eventSummary(item)}</p><h3>品牌回应</h3><p>{item.response_summary||'暂无已核验回应'}</p><p className="detail-timing">事件日期：{item.event_date||'待核'}<br/>本站收录：{new Date(item.created).toLocaleDateString('zh-CN')}（不代表事件发生日）</p></section>;
}

export default function Homepage(p:Props){
 const [allEvents,setAllEvents]=useState(false);
 const events=recentRecords(p.shown),recent=allEvents?events:events.slice(0,5);
 const corrections=p.shown.filter(i=>i.record_type==='correction');
 const opinions=p.shown.filter(i=>i.record_type==='opinion');
 const hasConditions=!!p.query.trim()||p.topic!=='全部资料'||p.material!=='all'||p.scope!=='all'||p.region!=='all'||p.filter==='我的关注';
 const goToResults=(e:React.FormEvent)=>{e.preventDefault();document.getElementById('recent')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});};
 return <main className="phase-two">
  <section className="stance-hero"><div className="masthead-note">独立消费者记录 / 原文 · 回应 · 更正</div><h1>拿男性当笑料，<br/><span>还想让我们买单？</span></h1><p className="stance-deck">谁说了什么，谁发布的，证据在哪里。逐条留下记录，让男性消费者自己决定，这笔钱给谁。</p>
   <form className="hero-search" onSubmit={goToResults}><label><Search size={21}/><span className="sr-only">搜索品牌或事件</span><input aria-label="搜索品牌或事件" placeholder="输入品牌、英文别名或事件关键词" value={p.query} onChange={e=>p.onQuery(e.target.value)}/></label><button className="primary" type="submit">查品牌，看证据<ArrowUpRight size={19}/></button></form>
   <div className="hero-secondary"><button className="text-button" onClick={()=>p.onSubmit()}>提交反馈与证据<Plus size={17}/></button><span>有立场，也保留原文、回应和不确定性。</span></div>
  </section>
  <Filters {...p}/>
  <p className="search-status" role="status">{p.loading?'正在读取公开档案…':p.error?'资料暂时无法加载':`匹配 ${p.matchingBrands.length} 个品牌，${p.shown.length} 条记录${hasConditions?' · 当前筛选适用于下方全部栏目':''}`}</p>
  <section id="recent" className="recent-section"><div className="section-line"><div className="section-title"><span className="section-number">01 / EVIDENCE</span><h2>近期收录事件</h2><p>按本站收录时间排列。收录时间不等于事件发生日，背景对照与待核线索分别标明。</p></div><span className="section-count">{p.loading?'…':events.length} 条事件档案</span></div>
   {p.loading?<div className="loading-records" role="status">正在加载图片与事件…</div>:p.error?<div className="empty">{p.error}<button className="text-button" onClick={p.onRetry}>重新加载</button></div>:recent.length?<><div className="recent-grid">{recent.map(i=><RecordCard item={i} api={p.api} onNavigate={p.onNavigate} key={i.id}/>)}</div>{events.length>5&&<button className="more-events" onClick={()=>setAllEvents(!allEvents)}>{allEvents?'收起事件列表':`查看全部 ${events.length} 条匹配事件`}<ArrowUpRight size={17}/></button>}</>:<div className="empty"><h3>没有匹配的公开事件</h3><p>可调整关键词或条件，也可查看下方品牌线索与个人观点。</p><button className="text-button" onClick={p.onClear}>清空条件</button></div>}
  </section>
  <section id="brands" className="brand-directory"><div className="section-title"><span className="section-number">02 / DIRECTORY</span><h2>品牌观察目录</h2><p>按品牌归档。查看具体事件与发布主体，收录不代表指控成立。</p></div><div className="toolbar"><div className="tabs">{['全部品牌','我的关注'].map(t=><button className={p.filter===t?'active':''} onClick={()=>p.onFilter(t)} key={t}>{t}{t==='全部品牌'&&<span>{p.loading?'…':p.brands.length}</span>}</button>)}</div><label className="search"><Search size={17}/><input aria-label="目录搜索" placeholder="搜索品牌或事件" value={p.query} onChange={e=>p.onQuery(e.target.value)}/></label></div>
   <div className="brand-grid">{p.visible.map(b=><article className="brand-card" key={b.name}><div className="card-top"><button className={'icon-button '+(p.saved.includes(b.name)?'marked':'')} onClick={()=>p.onBookmark(b.name)} aria-label={(p.saved.includes(b.name)?'取消关注':'关注')+b.name}><Bookmark size={19} fill={p.saved.includes(b.name)?'currentColor':'none'}/></button></div><div className="brand-name"><h3><button className="brand-title-button" onClick={()=>p.onNavigate(`#/brand/${encodeURIComponent(b.name)}`)}>{b.name}</button></h3><span>{b.en}</span></div><div className="brand-type">{b.type}</div><p className="brand-description">{p.summaryFor(b.name)}</p><span className="status">核实状态见具体档案</span><div className="card-footer"><button className="brand-record-link" onClick={()=>p.onNavigate(`#/brand/${encodeURIComponent(b.name)}`)}>查看资料（{p.items.filter(i=>i.brand===b.name).length}）</button><button onClick={()=>p.onSubmit(b.name)}>补充证据<Plus size={15}/></button></div></article>)}</div>
   {!p.loading&&!p.visible.length&&<div className="empty">{p.filter==='我的关注'?'暂无匹配的关注品牌，点击书签添加关注。':'没有匹配的有材料品牌；下方线索区仍可搜索。'}</div>}
   {!p.loading&&<section className="lead-directory" aria-label="线索征集"><h3>线索征集与观点记录</h3><p>暂无可发布事件材料的品牌保留于此，不作为已证实争议案例。</p><div className="lead-links">{p.matchingBrands.filter(b=>p.leadBrands.some(l=>l.name===b.name)).map(b=><button key={b.name} onClick={()=>p.onNavigate(`#/brand/${encodeURIComponent(b.name)}`)}>{b.name}<span>{p.items.filter(i=>i.brand===b.name).length} 条公开线索／观点</span></button>)}</div></section>}
  </section>
  <section id="responses" className="responses-section"><div className="section-title"><span className="section-number">03 / RESPONSE</span><h2>回应与更正</h2><p>品牌回应与反证一并保留。通过事件内的“补充回应或更正”关联原记录。</p></div>{corrections.length?<div className="feedback-grid">{corrections.map(i=><article className="feedback-card" key={i.id}><span className="status">{recordLabel(i)}</span><h3><a href={`#/event/${i.id}`}>{i.title}</a></h3><p>{i.content}</p><a className="text-button" href={`#/event/${i.parent_event_id}`}>查看关联原事件<ArrowUpRight size={16}/></a></article>)}</div>:<p className="empty-response">{p.loading?'正在加载关联记录…':'当前条件下暂无已公开的用户关联回应或纠错。'}已收录的品牌回应列在各事件摘要和原附件中，公开变更记录保留在事件页。</p>}</section>
  <section id="feedback" className="opinions-section"><div className="section-line"><div className="section-title"><span className="section-number">04 / VOICES</span><h2>消费者观点</h2><p>署名展示个人观点；观点不覆盖品牌事件摘要，内容审核不代表事实成立。</p></div><button className="text-button" onClick={()=>p.onSubmit()}>写下你的反馈<Plus size={16}/></button></div>{opinions.length?<div className="feedback-grid">{opinions.map(i=><button className="feedback-card opinion-card" key={i.id} onClick={()=>p.onNavigate(`#/event/${i.id}`)}><div><strong>{i.brand}</strong><span className="status">{recordLabel(i)}</span></div><h3>{i.title}</h3><p>{i.content}</p><footer><span>贡献者：{i.contributor||'署名待补'}</span><span>收录 {new Date(i.created).toLocaleDateString('zh-CN')}</span></footer></button>)}</div>:<p className="empty-response">{p.loading?'正在加载观点…':'当前条件下暂无已公开的消费者观点。'}</p>}</section>
  <section id="principles" className="manifesto"><h2>我们的立场</h2><p>我们反对把男性的尊严拿来做营销。广告里的贬低、消费里的双标，值得被记录、被质疑，也值得成为不买的理由。原文、回应与更正一并摆出来。钱在我们手里，选择由我们自己做。</p><div><span>原文有出处</span><span>主体有区分</span><span>反证有入口</span></div></section>
  <CommunityStats api={p.api} revision={p.statsRevision} compact/>
  <footer className="site-footer"><a className="logo" href={p.api+'/'}>女拳品牌观察</a><span>独立消费者反馈站 · 与所列品牌无关联</span><a href="mailto:tojunjie@gmail.com">联系站长：tojunjie@gmail.com</a><a href="/admin">管理后台</a></footer>
 </main>;
}
