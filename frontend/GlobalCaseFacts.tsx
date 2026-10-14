import {currentLocale} from './locale.mjs';
import type {RecordItem} from './ArchiveUI';
const responses:Record<string,string>={apologized:'已找到明确致歉',defended:'解释或维持原表达',no_response:'未找到公开回应',unknown:'回应性质仍待核',refused:'已有明确拒绝记录'};
const safeURL=(value:string)=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}};
export default function GlobalCaseFacts({item}:{item:RecordItem}){
 const g=item.global;if(!g)return null;const en=currentLocale()==='en',tr=!g.translation_stale?g.translations?.en:null;
 let market='地区待核';try{if(g.market&&g.market!=='ZZ')market=new Intl.DisplayNames([currentLocale()],{type:'region'}).of(g.market)||g.market}catch{}
 return <section className="global-case-facts"><h3>海外案例分类与来源</h3><p>{market} · {(en?g.brand_type_en:g.brand_type_zh)||'品类待补充'} · 来源语言：{g.language||'待核'} · {responses[g.response_class]||'回应待核'}</p><p>{en&&tr?(tr.decision||g.decision_en):g.decision_zh}</p><p>核查日期：{g.checked_at}。不同来源的报道或决定日期，不自动作为广告首发日期。</p><ol>{g.sources?.map((s:any,n:number)=><li key={n}>{safeURL(s.url)?<a href={safeURL(s.url)} target="_blank" rel="noreferrer">{en?s.label_en:s.label_zh}</a>:s.label_zh}<p>{en?s.access_en:s.access_zh}</p></li>)}</ol></section>;
}
