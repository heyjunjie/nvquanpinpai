import {shareModel,formatUpdateTime} from './reading.mjs';
const ink='#222420',muted='#62645e',paper='#fafaf8',line='#d9dad4';
const sans="'Microsoft YaHei UI','PingFang SC',sans-serif",serif="'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif";
export function wrapLines(text,measure,width,maxLines){
 const lines=[];let current='';const chars=Array.from(String(text||'').replace(/\s+/g,' ').trim());
 for(const char of chars){if(current&&measure(current+char)>width){lines.push(current);current=char}else current+=char}if(current)lines.push(current);
 if(lines.length>maxLines){lines.length=maxLines;let end=lines[maxLines-1];while(end&&measure(end+'…')>width)end=Array.from(end).slice(0,-1).join('');lines[maxLines-1]=end+'…'}return lines;
}
function text(ctx,value,x,y,width,size,maxLines=3,{bold=false,display=false,color=ink}={}){
 ctx.font=`${bold?700:400} ${size}px ${display?serif:sans}`;ctx.fillStyle=color;ctx.textBaseline='top';
 const rows=wrapLines(value,s=>ctx.measureText(s).width,width,maxLines);rows.forEach((row,n)=>ctx.fillText(row,x,y+n*size*1.42));return rows.length*size*1.42;
}
function rule(ctx,y,width){ctx.strokeStyle=line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(56,y);ctx.lineTo(width-56,y);ctx.stroke()}
function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();const timer=setTimeout(()=>{image.src='';reject(Error('图片读取超时，可重试或生成文字版资料卡。'))},10000);image.onload=()=>{clearTimeout(timer);resolve(image)};image.onerror=()=>{clearTimeout(timer);reject(Error('原图暂时无法读取，可重试或生成文字版资料卡。'))};image.src=url})}
function photo(ctx,image,x,y,w,h){ctx.fillStyle='#f0f0ec';ctx.fillRect(x,y,w,h);if(image){const ratio=Math.min(w/image.naturalWidth,h/image.naturalHeight);ctx.drawImage(image,x+(w-image.naturalWidth*ratio)/2,y+(h-image.naturalHeight*ratio)/2,image.naturalWidth*ratio,image.naturalHeight*ratio)}else{text(ctx,'文字资料卡',x+24,y+h/2-20,w-48,28,1,{color:muted})}}
export async function renderShareCard(item,{orientation='portrait',api='',textOnly=false}={}){
 const {default:QRCode}=await import('qrcode');
 const model=shareModel(item),landscape=orientation==='landscape',width=landscape?1200:1080,height=landscape?800:1440;
 const first=JSON.parse(item.images||'[]')[0];
 if(document.fonts)await document.fonts.ready;
 const image=!textOnly&&first?await loadImage(api+'/api/images/'+first):null;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('浏览器无法生成图片，请使用事件链接分享。');ctx.fillStyle=paper;ctx.fillRect(0,0,width,height);
 text(ctx,'女拳品牌观察',56,44,width-112,34,1,{display:true,bold:true});text(ctx,'资料摘要 · '+model.status,width-390,52,334,24,1,{color:muted});rule(ctx,108,width);
 text(ctx,model.title,56,138,width-112,landscape?46:54,landscape?2:3,{display:true,bold:true});
 text(ctx,'事件时间：'+model.date,56,landscape?278:386,width-112,landscape?24:26,2,{color:muted});
 if(landscape){
  photo(ctx,image,56,368,260,206);text(ctx,model.summary,348,368,796,28,4);text(ctx,'回应：'+model.response,348,532,796,23,2,{color:muted});
  text(ctx,'核实提示：'+model.limitation,56,606,890,23,2);rule(ctx,686,width);
 }else{
  photo(ctx,image,56,482,332,286);text(ctx,model.summary,422,484,602,32,6);text(ctx,'发布主体：'+model.publisher,56,802,968,27,2,{color:muted});
  text(ctx,'品牌回应',56,908,968,28,1,{bold:true});text(ctx,model.response,56,956,968,29,3);
  text(ctx,'核实提示：'+model.limitation,56,1100,756,25,3);rule(ctx,1240,width);
 }
 const qr=document.createElement('canvas'),qrSize=landscape?164:174;
 await QRCode.toCanvas(qr,model.url,{width:qrSize,margin:4,errorCorrectionLevel:'M',color:{dark:ink,light:paper}});
 ctx.drawImage(qr,width-56-qrSize,landscape?602:1248);
 const footerY=landscape?704:1270,footerWidth=width-qrSize-152;
 text(ctx,'notbuy.top · 扫码查看原图、来源与后续',56,footerY,footerWidth,landscape?21:26,1,{bold:true});
 text(ctx,'来源：'+model.sources,56,footerY+(landscape?30:44),footerWidth,landscape?19:23,1,{color:muted});
 text(ctx,`整理：${model.contributor} · 生成 ${formatUpdateTime(Date.now())}`,56,footerY+(landscape?56:82),footerWidth,landscape?17:21,1,{color:muted});
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('生成图片失败，请重试。');return {blob,width,height,model};
}
