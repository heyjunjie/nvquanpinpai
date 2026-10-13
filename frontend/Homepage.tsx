import {publicPath} from './routes.mjs';
import RecentUpdates from './RecentUpdates';
import WatchUpdates from './WatchUpdates';
import TaskBoard,{type EvidenceTask} from './TaskBoard';
import {useState} from 'react';
import {ArrowRight,ArrowUpRight,Bookmark,ChevronDown,Plus,Search,SlidersHorizontal,X} from 'lucide-react';
import {CommunityStats} from './Community';
import {labels,recordLabel,type RecordItem} from './ArchiveUI';
import {eventSummary,publisherText,recentRecords,filterTimeline} from './presentation.mjs';

type Brand={name:string;en:string;type:string};
type FilterProps={topic:string;material:string;scope:string;region:string;onTopic:(v:string)=>void;onMaterial:(v:string)=>void;onScope:(v:string)=>void;onRegion:(v:string)=>void;onClear:()=>void};
type Props=FilterProps&{api:string;items:RecordItem[];shown:RecordItem[];brands:Brand[];matchingBrands:Brand[];visible:Brand[];leadBrands:Brand[];saved:string[];filter:string;onFilter:(v:string)=>void;onBookmark:(v:string)=>void;query:string;onQuery:(v:string)=>void;loading:boolean;error:string;onRetry:()=>void;onNavigate:(v:string)=>void;onSubmit:(brand?:string)=>void;statsRevision:number;read:Record<string,number>;onReadAll:()=>void;tasks:EvidenceTask[];tasksLoading:boolean;tasksError:string;onTasksRetry:()=>void;summaryFor:(brand:string)=>string};

function Filters(p:FilterProps){
 const [open,setOpen]=useState(false);
 const fields=[{name:'事件主题',value:p.topic,reset:'全部资料',change:p.onTopic,values:['全部资料','advertising','partnership','experience','other'],all:'全部主题'},
  {name:'材料状态',value:p.material,reset:'all',change:p.onMaterial,values:['all','evidence','lead','background'],all:'全部材料'},
  {name:'主体关系',value:p.scope,reset:'all',change:p.onScope,values:['all','unknown','shop','headquarters','partner','other'],all:'全部主体'},
  {name:'地区',value:p.region,reset:'all',change:p.onRegion,values:['all','mainland','overseas','unknown'],all:'全部地区'}];
 const active=fields.filter(f=>f.value!==f.reset);
 return <div className="filter-controls">
  <button className="filter-toggle" aria-expanded={open} aria-controls="filter-panel" onClick={()=>setOpen(!open)}><SlidersHorizontal size={16}/>组合筛选{active.length>0&&`（${active.length}）`}<ChevronDown size={15} className={open?'rotate':''}/></button>
  <div className="active-filters">{active.map(f=><button key={f.name} onClick={()=>f.change(f.reset)} aria-label={`取消${f.name}：${labels[f.value]||f.value}`}>{labels[f.value]||f.value}<X size={13}/></button>)}</div>
  <div id="filter-panel" className="filter-panel" hidden={!open}>{fields.map(f=><label key={f.name}>{f.name}<select value={f.value} onChange={e=>f.change(e.target.value)}>{f.values.map(v=><option key={v} value={v}>{v===f.reset?f.all:labels[v]||v}</option>)}</select></label>)}</div>
 </div>;
}

function RecordCard({item,api,onNavigate}:{item:RecordItem;api:string;onNavigate:(hash:string)=>void}){
 const first=JSON.parse(item.images||'[]')[0];
 return <article className="event-card" data-record-type={item.record_type}>
  <div className="event-date"><time>{item.event_date||'日期待核'}</time><span>{item.region==='overseas'?'海外补充':labels[item.topic]||item.category}</span></div>
  <a href={publicPath('event',item.id)} className="event-card-open" aria-label={`查看事件与证据：${item.title}`}>
   <div className="event-card-copy"><div className="record-tags"><span>{item.brand}</span><span>{labels[item.material_status]||'材料待核'}</span><span>{labels[item.verification_status]||'事实待核'}</span></div><h3>{item.title}</h3><p className="event-excerpt">{eventSummary(item)}</p><div className="event-bottom"><span>{publisherText(item)}</span><ArrowUpRight size={18}/></div></div>
   <div className="event-thumbnail">{first?<img src={api+'/api/images/'+first} alt={item.title+' · 留存图片'} loading="lazy"/>:<span>待补图片</span>}<span className="media-count">{JSON.parse(item.images||'[]').length} 图</span></div>
  </a>
 </article>;
}

export function EventOverview({item}:{item:RecordItem}){
 return <section className="event-overview"><div><h3>{item.record_type==='opinion'?'观点原文':'事件经过'}</h3><p>{eventSummary(item)}</p></div><div><h3>品牌回应</h3><p>{item.response_summary||'暂无已核验回应'}</p></div><p className="detail-timing">事件日期：{item.event_date||'待核'} · 本站收录：{new Date(item.created).toLocaleDateString('zh-CN')}（不代表事件发生日）</p></section>;
}

export default function Homepage(p:Props){
 const [allBrands,setAllBrands]=useState(false),[eventLimit,setEventLimit]=useState(6),[year,setYear]=useState('all');
 const events=recentRecords(p.shown),timeline=filterTimeline(p.shown,year);
 const years=Array.from(new Set(events.map((i:RecordItem)=>i.event_date?.slice(0,4)).filter(Boolean))).sort().reverse() as string[];
 const corrections=p.shown.filter(i=>i.record_type==='correction'),opinions=p.shown.filter(i=>i.record_type==='opinion');
 const leads=p.matchingBrands.filter(b=>p.leadBrands.some(l=>l.name===b.name));
 const hasConditions=!!p.query.trim()||p.topic!=='全部资料'||p.material!=='all'||p.scope!=='all'||p.region!=='all'||p.filter==='我的关注';
 const visible=allBrands||hasConditions?p.visible:p.visible.slice(0,8);
 const goToResults=(e:React.FormEvent)=>{e.preventDefault();document.getElementById('directory-results')?.focus({preventScroll:true});};
 return <main id="main-content" className="newspaper" tabIndex={-1}>
  <section className="opening-note"><h1>拿男性当笑料，<br/>还想让我们买单？</h1><div><p>谁说了什么，谁发布的，证据在哪里。逐条留下记录，让男性消费者自己决定，这笔钱给谁。</p><a href="#principles">我们的立场与记录原则<ArrowRight size={16}/></a></div></section>
  <div className="newspaper-layout"><div className="reading-column">
   <section id="brands" className="brand-directory">
    <div className="section-line"><h2>品牌观察目录</h2><span className="section-count">{p.loading?'—':p.brands.length} 个品牌 / 机构</span></div>
    <form className="directory-search" role="search" onSubmit={goToResults}><Search size={21}/><label className="sr-only" htmlFor="brand-query">搜索品牌或事件</label><input id="brand-query" placeholder="品牌、英文别名或事件关键词" value={p.query} onChange={e=>p.onQuery(e.target.value)}/>{p.query&&<button type="button" className="icon-button" aria-label="清除搜索" onClick={()=>p.onQuery('')}><X size={18}/></button>}<button className="search-submit" type="submit">查资料<ArrowRight size={16}/></button></form>
    <p className="lookup-entry"><a href={'/lookup'+(p.query.trim()?'?q='+encodeURIComponent(p.query.trim()):'')}>买前速查：用品牌别名快速核对事件<ArrowUpRight size={15}/></a></p>
    <div className="directory-toolbar"><div className="tabs">{['全部品牌','我的关注'].map(t=><button aria-pressed={p.filter===t} className={p.filter===t?'active':''} onClick={()=>p.onFilter(t)} key={t}>{t}{t==='我的关注'&&p.saved.length>0&&<span>{p.saved.length}</span>}</button>)}</div><Filters {...p}/></div>
    <div className="search-status" role="status">{p.loading?'正在读取公开档案…':p.error?'资料暂时无法加载':hasConditions?`匹配 ${p.matchingBrands.length} 个品牌 · ${p.shown.length} 条记录`:'按品牌查阅事件、图片、来源与回应。收录不代表指控成立。'}{hasConditions&&<button onClick={p.onClear}>清空条件<X size={13}/></button>}</div>
    <div id="directory-results" tabIndex={-1} className="directory-results">
     {p.loading?<div className="archive-loading" role="status"><span/><span/><span/><span/><span/><span/><p>正在读取品牌资料…</p></div>:p.error?<div className="empty"><h3>暂时无法读取档案</h3><p>{p.error}</p><button className="primary" onClick={p.onRetry}>重新加载</button></div>:<>
      <div className="brand-grid">{visible.map(b=><article className="brand-card" key={b.name}><div className="brand-heading"><h3><a className="brand-title-button" href={publicPath('brand',b.name)}>{b.name}</a></h3><button className={'icon-button '+(p.saved.includes(b.name)?'marked':'')} onClick={()=>p.onBookmark(b.name)} aria-pressed={p.saved.includes(b.name)} aria-label={(p.saved.includes(b.name)?'取消关注':'关注')+b.name}><Bookmark size={17} fill={p.saved.includes(b.name)?'currentColor':'none'}/></button></div><span className="brand-type">{b.type}</span><a className="brand-record-link" href={publicPath('brand',b.name)}><span>{p.summaryFor(b.name)}</span><ArrowUpRight size={17}/></a><small>{p.items.filter(i=>i.brand===b.name).length} 条公开记录{b.en&&` · ${b.en}`}</small></article>)}</div>
      {!visible.length&&<div className="empty"><h3>{p.filter==='我的关注'?'还没有匹配的关注品牌':'没有匹配的品牌档案'}</h3><p>{p.filter==='我的关注'?'在品牌旁点击书签，建立你的查阅清单。':'试试品牌别名，或取消部分筛选条件。'}</p><button className="text-button" onClick={p.onClear}>查看全部品牌<ArrowRight size={16}/></button></div>}
      {!hasConditions&&p.visible.length>8&&<button className="more-records" aria-expanded={allBrands} onClick={()=>setAllBrands(!allBrands)}>{allBrands?'收起品牌目录':`展开全部 ${p.visible.length} 个有材料品牌`}<ChevronDown size={17} className={allBrands?'rotate':''}/></button>}
      {!!leads.length&&<details className="lead-directory"><summary>待核线索与观点 <span>{leads.length} 个品牌</span></summary><p>暂无可发布事件材料，保留线索等待补充。</p><div className="lead-links">{leads.map(b=><button key={b.name} onClick={()=>p.onNavigate(`#/brand/${encodeURIComponent(b.name)}`)}>{b.name}<ArrowUpRight size={14}/></button>)}</div></details>}
     </>}
    </div>
   </section>
   <WatchUpdates items={p.items} saved={p.saved} read={p.read} onReadAll={p.onReadAll}/>
   <RecentUpdates items={hasConditions?p.shown:p.items} loading={p.loading} error={p.error}/>
   <TaskBoard tasks={p.tasks} loading={p.tasksLoading} error={p.tasksError} onRetry={p.onTasksRetry}/>
   <section className="topic-digest" aria-labelledby="topic-digest-title"><div className="section-line"><h2 id="topic-digest-title">专题导读</h2><a href="/archive">完整目录<ArrowRight size={15}/></a></div><a href="/topics/store-posts"><strong>回力、匹克、Dickies：店铺争议如何核对？</strong><span>一起查图片、传播时间与发布主体<ArrowUpRight size={17}/></span></a><a href="/topics/history"><strong>旧事件回看：别把收录日当发生日</strong><span>按时间查阅历史材料<ArrowUpRight size={17}/></span></a><a href="/topics/responses"><strong>品牌回应了什么，还有哪些待核？</strong><span>回应、来源与更正放在一起看<ArrowUpRight size={17}/></span></a></section>
   <section id="recent" className="recent-section"><div className="section-line"><h2>事件时间线</h2><span className="section-count">{events.length} 条事件档案</span></div><div className="timeline-controls"><p>按发生时间倒序 · 日期待核的置后</p><label><span className="sr-only">按年份查阅</span><select value={year} onChange={e=>{setYear(e.target.value);setEventLimit(6)}}><option value="all">全部年份</option>{years.map(y=><option key={y} value={y}>{y} 年</option>)}<option value="unknown">日期待核</option></select></label></div>
    {!p.loading&&!p.error&&(timeline.length?<><div className="event-list">{timeline.slice(0,eventLimit).map((i:RecordItem)=><RecordCard item={i} api={p.api} onNavigate={p.onNavigate} key={i.id}/>)}</div>{timeline.length>eventLimit?<button className="more-records" onClick={()=>setEventLimit(n=>n+12)}>继续查看事件（还有 {timeline.length-eventLimit} 条）<ChevronDown size={17}/></button>:<p className="timeline-end">已展示当前条件下的全部 {timeline.length} 条事件</p>}</>:<div className="empty"><p>该年份或筛选条件下没有公开事件。</p><button className="text-button" onClick={()=>{setYear('all');p.onClear()}}>重置时间与筛选<ArrowRight size={16}/></button></div>)}
    <p className="section-footnote">仅能确认月份或年份的保留原精度。报道、回应、收录日期另列于档案。</p>
   </section>
   <section id="responses" className="responses-section"><div className="section-line"><h2>回应与更正</h2><span className="section-count">保留不同证据</span></div>{corrections.length?<div className="feedback-grid">{corrections.map(i=><article className="feedback-card" key={i.id}><span className="status">{recordLabel(i)}</span><h3><a href={publicPath('event',i.id)}>{i.title}</a></h3><p>{i.content}</p><a className="text-button" href={publicPath('event',i.parent_event_id)}>查看关联原事件<ArrowUpRight size={16}/></a></article>)}</div>:<div className="empty-response"><p>当前条件下暂无已公开的用户关联回应或纠错。已收录的品牌回应与变更记录，可在具体事件中查阅。</p><a href="#recent">查找事件，补充回应<ArrowRight size={16}/></a></div>}</section>
   <section id="feedback" className="opinions-section"><div className="section-line"><h2>消费者观点</h2><button className="text-button" onClick={()=>p.onSubmit()}>写下反馈<Plus size={16}/></button></div><p className="section-footnote">署名个人观点，内容审核不代表事实成立。</p>{opinions.length?<div className="feedback-grid">{opinions.map(i=><button className="feedback-card opinion-card" key={i.id} onClick={()=>p.onNavigate(`#/event/${i.id}`)}><div><strong>{i.brand}</strong><span className="status">{recordLabel(i)}</span></div><h3>{i.title}</h3><p>{i.content}</p><footer><span>贡献者：{i.contributor||'署名待补'}</span><span>{new Date(i.created).toLocaleDateString('zh-CN')}</span></footer></button>)}</div>:<p className="empty-response">当前条件下暂无已公开的消费者观点。</p>}</section>
  </div>
  <aside className="newspaper-sidebar" aria-label="站点统计与参与"><CommunityStats api={p.api} revision={p.statsRevision}/><section className="contribution-invite"><h2>一起补全记录</h2><p>一张原图、一段原片，或一份回应，都能帮助还原完整的事件。</p><button className="primary" onClick={()=>p.onSubmit()}>提交反馈与证据<Plus size={17}/></button><small>可以不注册，必须留名。审核后公开。</small><a className="text-button" href="/tasks">看看还缺哪些资料<ArrowRight size={16}/></a></section><section className="reading-guide"><h2>如何读一份档案</h2><dl><div><dt>先看发布主体</dt><dd>店铺、合作方与品牌总部分别记录。</dd></div><div><dt>再看原文与来源</dt><dd>截图保留语境；缺失材料明确待核。</dd></div><div><dt>最后看回应与更正</dt><dd>新证据和反证都可以关联到原事件。</dd></div></dl><a href="mailto:tojunjie@gmail.com">联系站长<ArrowUpRight size={15}/></a></section></aside>
  </div>
  <section id="principles" className="manifesto"><h2>我们的立场</h2><p>我们反对把男性的尊严拿来做营销。广告里的贬低、消费里的双标，值得被记录、被质疑，也值得成为不买的理由。原文、回应与更正一并摆出来。钱在我们手里，选择由我们自己做。</p></section>
  <footer className="site-footer"><div><a className="logo" href={p.api+'/'}>女拳品牌观察</a><span>独立消费者反馈站 · 与所列品牌无关联</span></div><div><a href="mailto:tojunjie@gmail.com">联系站长：tojunjie@gmail.com</a><a href="https://github.com/heyjunjie/nvquanpinpai" target="_blank" rel="noreferrer">开源项目<ArrowUpRight size={14}/></a><a href="/feed.xml">RSS 订阅更新</a><a href="/admin">管理后台</a></div></footer>
 </main>;
}
