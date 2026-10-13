import {useState} from 'react';
import {ArrowLeft,ArrowRight,Expand,Play} from 'lucide-react';
import {AttachmentInfo,type RecordItem} from './ArchiveUI';
export default function EvidenceReader({item,api,onNavigate}:{item:RecordItem;api:string;onNavigate:(v:string)=>void}){
 const images:string[]=JSON.parse(item.images||'[]'),videos:string[]=JSON.parse(item.videos||'[]');
 const media=[...images.map(key=>({key,video:false})),...videos.map(key=>({key,video:true}))];
 const [index,setIndex]=useState(0),[failed,setFailed]=useState(false);
 const current=media[index];
 function choose(n:number){setIndex(n);setFailed(false)}
 if(!current)return <div className="detail-no-image">暂无可公开图片或视频，保留原文与待核说明。</div>;
 return <section className="evidence-reader" aria-label="事件图片与视频"><figure>{failed?<div className="detail-no-image" role="alert">附件加载失败。<button className="text-button" onClick={()=>setFailed(false)}>重试</button></div>:current.video?<video key={current.key} className="evidence" src={api+'/api/images/'+current.key} controls playsInline preload="metadata" onError={()=>setFailed(true)}/>:<button className="evidence-open" aria-label="预览图片证据" onClick={()=>onNavigate(`#/attachment/${encodeURIComponent(current.key)}`)}><img className="evidence" src={api+'/api/images/'+current.key} alt={`${item.title} · 图片 ${index+1}`} onError={()=>setFailed(true)}/></button>}<div className="media-toolbar"><div className="media-nav"><button aria-label="上一份附件" disabled={index===0} onClick={()=>choose(index-1)}><ArrowLeft size={17}/></button><span aria-live="polite">{index+1} / {media.length} {current.video?'· 视频':'· 图片'}</span><button aria-label="下一份附件" disabled={index===media.length-1} onClick={()=>choose(index+1)}><ArrowRight size={17}/></button></div>{!current.video&&<button onClick={()=>onNavigate(`#/attachment/${encodeURIComponent(current.key)}`)}>放大查看<Expand size={15}/></button>}</div><AttachmentInfo item={item} keyName={current.key} index={index} compact/></figure>{media.length>1&&<div className="media-thumbnails" aria-label="选择附件">{media.map((m,n)=><button key={m.key} aria-label={`查看第 ${n+1} 份${m.video?'视频':'图片'}`} aria-pressed={n===index} onClick={()=>choose(n)}>{m.video?<Play size={20}/>:<img src={api+'/api/images/'+m.key} loading="lazy" alt=""/>}<span>{n+1}</span></button>)}</div>}</section>;
}
