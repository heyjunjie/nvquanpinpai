import {publicPath} from './routes.mjs';
import {formatUpdateTime} from './reading.mjs';
import type {RecordItem} from './ArchiveUI';

function References({point}:{point:any}){
 return <span className="brief-references">{(point.references||[]).map((r:any)=><a key={r.key} href={publicPath('attachment',r.key)}>附件 {r.number}<span className="sr-only">：{r.caption}</span></a>)}{(point.sources||[]).map((url:string,n:number)=><a key={url} href={url} target="_blank" rel="noreferrer">来源{point.sources.length>1?` ${n+1}`:''}</a>)}</span>;
}
export default function EventBrief({item}:{item:RecordItem}){
 const brief=item.brief;if(!brief)return null;
 return <section className="event-brief" aria-labelledby={'brief-'+item.id}>
  <h3 id={'brief-'+item.id}>30 秒看懂这份资料</h3><p className="brief-summary">{brief.summary}</p>
  <dl className="brief-context"><div><dt>时间怎么读</dt><dd>{brief.date_note}</dd></div><div><dt>发布主体</dt><dd>{brief.publisher_note}</dd></div></dl>
  <h4>现有材料记载了什么</h4><ul className="brief-facts">{brief.facts.map((point:any,n:number)=><li key={n}>{point.text}<References point={point}/></li>)}</ul>
  <h4>品牌回应</h4><p>{brief.response.text}<References point={brief.response}/></p>
  <h4>还不能确定的部分</h4><ul>{brief.uncertainties.map((text:string)=><li key={text}>{text}</li>)}</ul>
  <p className="brief-note">{brief.note} 摘要整理：{formatUpdateTime(brief.edited_at)}。</p>
 </section>;
}
