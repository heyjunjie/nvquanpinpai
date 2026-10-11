import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
export default function ImagePreview({src,onClose}:{src:string;onClose:()=>void}){
 const viewport=useRef<HTMLDivElement>(null);
 const [available,setAvailable]=useState({width:0,height:0}),[natural,setNatural]=useState({width:0,height:0}),[zoom,setZoom]=useState(1);
 useEffect(()=>{const box=viewport.current;if(!box)return;const measure=()=>setAvailable({width:box.clientWidth,height:box.clientHeight});measure();const observer=new ResizeObserver(measure);observer.observe(box);return()=>observer.disconnect()},[]);
 const fit=natural.width&&natural.height?Math.min(1,available.width/natural.width,available.height/natural.height):0;
 const width=natural.width*fit*zoom,height=natural.height*fit*zoom;
 return <div className="image-preview" role="dialog" aria-modal="true" aria-label="图片预览" onClick={onClose}><div className="image-preview-toolbar" onClick={e=>e.stopPropagation()}><button aria-label="缩小图片" disabled={zoom<=0.5} onClick={()=>setZoom(z=>Math.max(0.5,z-0.25))}>−</button><span title="相对于适合窗口的比例">{Math.round(zoom*100)}%</span><button aria-label="放大图片" disabled={zoom>=4} onClick={()=>setZoom(z=>Math.min(4,z+0.25))}>＋</button><button onClick={()=>{setZoom(1);viewport.current?.scrollTo(0,0)}}>适合窗口</button><button aria-label="关闭图片预览" onClick={onClose}><X size={22}/></button></div><div ref={viewport} className="image-preview-scroll" onClick={e=>e.stopPropagation()}><div className="image-preview-stage" style={{width,height}}><img src={src} alt="图片证据原图预览" onLoad={e=>setNatural({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} style={{width,height}}/></div></div></div>
}
