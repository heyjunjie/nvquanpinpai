import {ArrowRight} from 'lucide-react';
import {recentUpdates,formatUpdateTime} from './reading.mjs';
import {publicPath} from './routes.mjs';
import type {RecordItem} from './ArchiveUI';
export default function RecentUpdates({items,loading,error}:{items:RecordItem[];loading:boolean;error:string}){
 const updates=recentUpdates(items,4);
 return <section className="recent-updates" aria-labelledby="updates-title"><div className="section-line"><h2 id="updates-title">最近更新了什么</h2><a href="/updates">全部更新<ArrowRight size={16}/></a></div><p className="updates-intro">补了哪些资料，改了哪些说明。这里按本站更新时间排列。</p>{loading?<p role="status">正在读取更新…</p>:error?<p>暂时无法读取更新，请在页面上方重新加载。</p>:updates.length?<ol>{updates.map(u=><li key={u.key}><div className="update-meta"><time dateTime={new Date(u.at).toISOString()}>{formatUpdateTime(u.at)}</time><span>{u.label}</span></div><a href={publicPath('event',u.event_id)}>{u.title}</a><p>{u.note}</p></li>)}</ol>:<p>尚无可公开的更新记录。</p>}<small>事件发生时间仍以事件时间线和原档案为准。</small></section>;
}
