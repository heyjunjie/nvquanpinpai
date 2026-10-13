import {useEffect,useState} from 'react';
import {Download,ImagePlus,Share2} from 'lucide-react';
import type {RecordItem} from './ArchiveUI';
export default function ShareCard({item,api}:{item:RecordItem;api:string}){
 const [expanded,setExpanded]=useState(false),[orientation,setOrientation]=useState('portrait'),[textOnly,setTextOnly]=useState(false),[revision,setRevision]=useState(0);
 const [result,setResult]=useState<{url:string;blob:Blob}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  if(!expanded)return;let active=true,url='';setBusy(true);setError('');setResult(null);setNotice('');
  (async()=>{const response=await fetch(api+'/api/feedback');if(!response.ok)throw Error('暂时无法确认档案状态，请重试。');const data=await response.json();const current=data.items?.find((i:RecordItem)=>i.id===item.id&&i.status==='approved'&&i.record_type==='event');if(!current)throw Error('这条事件已不公开，不能生成资料卡。');const {renderShareCard}=await import('./share-card.mjs');const rendered=await renderShareCard(current,{orientation,api,textOnly});if(!active)return;url=URL.createObjectURL(rendered.blob as Blob);setResult({url,blob:rendered.blob as Blob})})().catch(e=>{if(active)setError(e.message||'生成失败，请重试。')}).finally(()=>{if(active)setBusy(false)});
  return()=>{active=false;if(url)URL.revokeObjectURL(url)};
 },[expanded,item.id,api,orientation,textOnly,revision]);
 const filename=`notbuy-${item.brand.replace(/[\\/:*?"<>|]/g,'-')}-${orientation}.png`;
 async function share(){if(!result)return;const file=new File([result.blob],filename,{type:'image/png'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:item.title});setNotice('已交给系统分享')}else setNotice('此浏览器不支持图片直传，请保存图片后在社交应用中选择它。')}catch(e){if((e as Error).name!=='AbortError')setNotice('系统分享未完成，可以先保存图片。')}}
 if(item.status!=='approved'||item.record_type!=='event')return null;
 return <details className="share-card-tools" onToggle={e=>setExpanded(e.currentTarget.open)}><summary><ImagePlus size={19}/>生成分享资料卡</summary>{expanded&&<div className="share-card-body"><p>保留原图比例、时间与核实提示。扫码可查看完整来源和后续更正。</p><div className="share-card-controls" role="group" aria-label="资料卡版式"><button aria-pressed={orientation==='portrait'} onClick={()=>setOrientation('portrait')}>竖版</button><button aria-pressed={orientation==='landscape'} onClick={()=>setOrientation('landscape')}>横版</button><label><input type="checkbox" checked={textOnly} onChange={e=>setTextOnly(e.target.checked)}/>文字版</label></div>{busy&&<p role="status">正在读取最新档案并生成图片…</p>}{error&&<div role="alert"><p>{error}</p><button className="text-button" onClick={()=>setRevision(n=>n+1)}>重新生成</button></div>}{result&&<><div className="share-card-preview"><img src={result.url} alt={`${item.brand}事件资料卡预览，${orientation==='portrait'?'竖版':'横版'}`}/></div><div className="share-card-actions"><a className="primary" href={result.url} download={filename}><Download size={17}/>保存 PNG 图片</a><button className="text-button" onClick={share}><Share2 size={17}/>分享图片</button></div><small>图片是生成时的资料摘要；最新核实状态以原档案为准。手机也可长按预览保存。</small></>}<p role="status">{notice}</p></div>}</details>;
}
