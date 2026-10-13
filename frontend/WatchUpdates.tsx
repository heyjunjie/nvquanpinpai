import {useState} from 'react';
import {ArrowUpRight,Rss} from 'lucide-react';
import {unreadUpdates} from './watch.mjs';
import {formatUpdateTime} from './reading.mjs';
import {publicPath} from './routes.mjs';
import type {RecordItem} from './ArchiveUI';
export default function WatchUpdates({items,saved,read,onReadAll}:{items:RecordItem[];saved:string[];read:Record<string,number>;onReadAll:()=>void}){
 const [all,setAll]=useState(false),rows=unreadUpdates(items,saved,read);
 if(!saved.length)return null;
 return <section className="watch-updates" aria-labelledby="watch-title"><div className="section-line"><h2 id="watch-title">我关注的更新</h2><span>{rows.length?`${rows.length} 条未读`:'已读完'}</span></div><p className="section-footnote">关注与已读保存在本浏览器。打开记录即标为已读；清除浏览器数据会移除关注，不影响站点累计访客。</p>{rows.length?<><ul className="participation-list">{(all?rows:rows.slice(0,3)).map((r:any)=><li key={r.event_id}><a href={publicPath('event',r.event_id)}><span className="participation-meta">{r.brand} · {r.label} · {formatUpdateTime(r.at)}</span><strong>{r.title}</strong><ArrowUpRight size={17}/></a></li>)}</ul><div className="participation-actions">{rows.length>3&&<button className="text-button" onClick={()=>setAll(!all)}>{all?'收起':`查看全部 ${rows.length} 条`}</button>}<button className="text-button" onClick={onReadAll}>全部标为已读</button></div></>:<p className="watch-empty">目前没有未读更新。再次访问时，可在这里查看新收录的资料和档案更正。</p>}<details className="brand-subscriptions"><summary><Rss size={16}/>订阅关注品牌的 RSS</summary><p>复制链接到 RSS 阅读器，可在不同设备接收公开档案更新。</p><div>{saved.map(brand=><a key={brand} href={'/feed.xml?brand='+encodeURIComponent(brand)}>{brand} RSS<ArrowUpRight size={14}/></a>)}</div></details></section>;
}
