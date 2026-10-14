import {useState} from 'react';
import {ArrowLeft,Search} from 'lucide-react';
import {RecordCard} from './Homepage';
import {CommunityStats} from './Community';
import RecentUpdates from './RecentUpdates';
import TaskBoard,{TaskRow,type EvidenceTask} from './TaskBoard';
import {matchesQuery,type RecordItem} from './ArchiveUI';
import {recentRecords} from './presentation.mjs';
type Props={page:{type:string;value:string};api:string;items:RecordItem[];tasks:EvidenceTask[];tasksLoading:boolean;tasksError:string;onTasksRetry:()=>void;query:string;onQuery:(v:string)=>void;onNavigate:(v:string)=>void;statsRevision:number};
const topicNames:Record<string,string>={'history':'品牌广告争议历史时间线：旧事件与来源回看','responses':'品牌回应怎么查：回应记录、纠错与待核事项','store-posts':'回力、匹克、Dickies 店铺争议：图片、时间与发布主体'};
export default function SharedPages(p:Props){
 const [limit,setLimit]=useState(24);
 const type=p.page.type,title=type==='tasks'?'一起补证':type==='updates'?'最近更新':type==='lookup'?'买前速查':type==='topics'?topicNames[p.page.value]||'专题导读':'全部品牌与事件档案';
 let rows=recentRecords(p.items).filter((i:RecordItem)=>matchesQuery(i,p.query));
 if(type==='topics')rows=rows.filter((i:RecordItem)=>p.page.value==='history'?/^\d{4}/.test(i.event_date||'')&&Number(i.event_date.slice(0,4))<2024:p.page.value==='store-posts'?['回力','匹克','Dickies'].includes(i.brand):!!i.response_summary);
 return <main id="main-content" className="newspaper shared-page" tabIndex={-1}><a className="text-button" href="/"><ArrowLeft size={16}/>返回首页</a><div className="section-line"><h1>{title}</h1></div><div className="newspaper-layout"><div className="reading-column">
 {type==='tasks'?<>{p.tasksLoading||p.tasksError?<TaskBoard tasks={p.tasks} loading={p.tasksLoading} error={p.tasksError} onRetry={p.onTasksRetry}/>:['open','resolved'].map(status=><section key={status}><h2>{status==='open'?'等待补证':'已经补齐'}</h2>{p.tasks.filter(t=>t.status===status).map(t=><TaskRow task={t} key={t.id}/>)}{!p.tasks.some(t=>t.status===status)&&<p>目前没有相应任务。</p>}</section>)}</>:type==='updates'?<RecentUpdates limit={100} items={p.items} loading={false} error=""/>:<>
 <form className="directory-search" role="search" onSubmit={e=>e.preventDefault()}><Search size={21}/><label className="sr-only" htmlFor="page-query">搜索品牌或事件</label><input id="page-query" value={p.query} placeholder="品牌、英文别名或事件关键词" onChange={e=>{p.onQuery(e.target.value);setLimit(24)}}/><button className="search-submit">查资料</button></form><p className="section-footnote">按发生时间倒序 · 日期待核的置后</p>{type==='lookup'&&<p>收录不代表指控成立；没有检索结果也不代表该品牌不存在争议。</p>}
 <p role="status">{rows.length} 条事件档案</p><div className="event-list">{rows.slice(0,limit).map((item:RecordItem)=><RecordCard key={item.id} item={item} api={p.api} onNavigate={p.onNavigate}/>)}</div>{rows.length>limit&&<button className="more-records" onClick={()=>setLimit(n=>n+24)}>继续查看事件</button>}{!rows.length&&<div className="empty"><p>没有匹配的品牌档案</p><button className="text-button" onClick={()=>p.onQuery('')}>清除搜索</button></div>}</>}
 </div><aside className="newspaper-sidebar"><CommunityStats api={p.api} revision={p.statsRevision} compact/></aside></div></main>;
}
