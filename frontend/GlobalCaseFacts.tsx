import type {RecordItem} from './ArchiveUI';
const responses:Record<string,string>={apologized:'已找到明确致歉',defended:'解释或维持原表达',no_response:'未找到公开回应',unknown:'回应性质仍待核',refused:'已有明确拒绝记录'};
const safeURL=(value:string)=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}};
export default function GlobalCaseFacts({item}:{item:RecordItem}){
 const g=item.global;if(!g)return null;
 let market='地区待核';try{if(g.market&&g.market!=='ZZ')market=new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(g.market)||g.market}catch{}
 return <section className="global-case-facts"><h3>海外案例分类与来源</h3><p>{market} · {g.brand_type_zh||'品类待补充'} · 来源语言：{g.language||'待核'} · {responses[g.response_class]||'回应待核'}</p><p>{g.decision_zh}</p><p>核查日期：{g.checked_at}。不同来源的报道或决定日期，不自动作为广告首发日期。</p><ol>{g.sources?.map((s:any,n:number)=><li key={n}>{safeURL(s.url)?<a href={safeURL(s.url)} target="_blank" rel="noreferrer">{s.label_zh}</a>:s.label_zh}<p>{s.access_zh}</p></li>)}</ol><a href={'/en/event/'+encodeURIComponent(item.id)} lang="en">Read the English summary</a></section>;
}
