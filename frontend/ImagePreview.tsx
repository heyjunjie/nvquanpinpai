import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
export default function ImagePreview({src,onClose}:{src:string;onClose:()=>void}){
 const viewport=useRef<HTMLDivElement>(null);
 const [available,setAvailable]=useState({width:0,height:0}),[natural,setNatural]=useState({width:0,height:0}),[zoom,setZoom]=useState(1),[mode,setMode]=useState('fit');
 useEffect(()=>{const box=viewport.current;if(!box)return;const measure=()=>setAvailable({width:box.clientWidth,height:box.clientHeight});measure();const observer=new ResizeObserver(measure);observer.observe(box);return()=>observer.disconnect()},[]);
 const fit=natural.width&&natural.height?Math.min(1,available.width/natural.width,available.height/natural.height):0;
 const scale=(mode==='native'?1:mode==='width'?Math.min(1,available.width/Math.max(natural.width,1)):fit)*zoom;
 const width=natural.width*scale,height=natural.height*scale;
 return <div className="image-preview" role="dialog" aria-modal="true" aria-label="图片预览" onClick={onClose}><div className="image-preview-toolbar" onClick={e=>e.stopPropagation()}><button aria-label="缩小图片" disabled={zoom<=0.5} onClick={()=>setZoom(z=>Math.max(0.5,z-0.25))}>−</button><span title="相对原始像素比例">{Math.round(scale*100)}%</span><button aria-label="放大图片" disabled={zoom>=4} onClick={()=>setZoom(z=>Math.min(4,z+0.25))}>＋</button><button onClick={()=>{setMode('fit');setZoom(1);viewport.current?.scrollTo(0,0)}}>适合窗口</button><button onClick={()=>{setMode('width');setZoom(1);viewport.current?.scrollTo(0,0)}}>按宽适配</button><button onClick={()=>{setMode('native');setZoom(1);viewport.current?.scrollTo(0,0)}}>原尺寸</button><a href={src} download>下载原图</a><button aria-label="关闭图片预览" onClick={onClose}><X size={22}/></button></div><div ref={viewport} className="image-preview-scroll" onClick={e=>e.stopPropagation()}><div className="image-preview-stage" style={{width,height}}><img src={src} alt="图片证据原图预览" onLoad={e=>setNatural({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} style={{width,height}}/></div></div></div>
}
