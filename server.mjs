import http from 'node:http';
import {moderation} from './moderation.mjs';
import {discovery} from './discovery.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const ROOT=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const DATA=path.resolve(process.env.DATA_DIR||path.join(ROOT,'data'));
const PORT=Number(process.env.PORT||8787),MAX_BODY=33*1024*1024,MAX_STORAGE=Number(process.env.MAX_STORAGE_MB||1024)*1024*1024;
fs.mkdirSync(path.join(DATA,'uploads'),{recursive:true});
const db=new DatabaseSync(path.join(DATA,'feedback.sqlite'));db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS feedback(id TEXT PRIMARY KEY,brand TEXT NOT NULL,title TEXT NOT NULL,content TEXT NOT NULL,source TEXT NOT NULL,images TEXT NOT NULL,videos TEXT NOT NULL DEFAULT \'[]\',category TEXT NOT NULL,created INTEGER NOT NULL);');
const insert=db.prepare('INSERT INTO feedback(id,brand,title,content,source,images,videos,category,created) VALUES(?,?,?,?,?,?,?,?,?)');
function add(item){insert.run(item.id,item.brand,item.title,item.content,item.source||'',item.images||'[]',item.videos||'[]',item.category,item.created)}
if(fs.existsSync(path.join(DATA,'import.json'))){const imported=JSON.parse(fs.readFileSync(path.join(DATA,'import.json'),'utf8'));for(const item of imported.items||[])if(!db.prepare('SELECT id FROM feedback WHERE id=?').get(item.id))add(item);}
const mod=moderation(db,DATA,json);
let publicPages;
function size(dir){let n=0;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);n+=e.isDirectory()?size(p):fs.statSync(p).size}return n}
let storage=size(path.join(DATA,'uploads'));
const rate=new Map();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
async function multipart(req){const type=req.headers['content-type']||'';const m=/boundary=(?:"([^"]+)"|([^;]+))/i.exec(type);if(!m||!type.startsWith('multipart/form-data'))throw Error('请使用投稿表单提交');const boundary=m[1]||m[2];if(boundary.length>200)throw Error('无效表单');const chunks=[];let total=0;for await(const c of req){total+=c.length;if(total>MAX_BODY)throw Error('提交内容过大，视频需小于25MB');chunks.push(c)}const body=Buffer.concat(chunks),sep=Buffer.from('--'+boundary),fields={},files=[];let pos=body.indexOf(sep);while(pos>=0){let start=pos+sep.length;if(body.subarray(start,start+2).toString()==='--')break;start+=2;const end=body.indexOf(sep,start);if(end<0)break;const split=body.indexOf(Buffer.from('\r\n\r\n'),start);if(split<0||split>end)throw Error('表单数据损坏');const head=body.subarray(start,split).toString(),value=body.subarray(split+4,end-2),name=/\bname="([^"]+)"/.exec(head)?.[1];if(!name)throw Error('表单字段缺失');if(/\bfilename="/.test(head)){if(value.length)files.push({name,type:/Content-Type:\s*([^\r\n]+)/i.exec(head)?.[1]||'',bytes:value})}else fields[name]=value.toString().trim();pos=end}return{fields,files}}
function mediaType(b){return b[0]===255&&b[1]===216&&b[2]===255?'image/jpeg':b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71?'image/png':b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'?'image/webp':b.subarray(4,8).toString()==='ftyp'?'video/mp4':b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163?'video/webm':''}
function serve(req,res,file,type){const stat=fs.statSync(file),range=req.headers.range;let start=0,end=stat.size-1,status=200;const h={'Content-Type':type,'X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Cache-Control':type.startsWith('text/html')||['discovery.css','discovery-visit.js','routes.mjs'].includes(path.basename(file))||file.startsWith(path.join(DATA,'uploads'))?'no-store':'public, max-age=3600'};if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end()}if(m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end}else{start=Math.max(0,stat.size-Number(m[2]))}if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end()}status=206;h['Content-Range']=`bytes ${start}-${end}/${stat.size}`}h['Content-Length']=String(end-start+1);res.writeHead(status,h);if(req.method==='HEAD')return res.end();fs.createReadStream(file,{start,end}).pipe(res)}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer(async(req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{return json(res,400,{error:'路径无效'})}pathname=pathname.replace(/^\/brand-watch(?=\/|$)/,'')||'/';
try{
const current=mod.session(req);if(await mod.handle(req,res,pathname,current))return;
if(pathname==='/healthz')return json(res,200,{ok:true,service:'brand-watch',version:process.env.RELEASE_SHA||'development'});
if(pathname==='/api/version'&&req.method==='GET')return json(res,200,{version:process.env.RELEASE_SHA||'development'});
if(pathname==='/api/feedback'&&req.method==='GET')return json(res,200,{items:db.prepare('SELECT * FROM feedback ORDER BY created DESC LIMIT 200').all()});
if(pathname==='/api/feedback'&&req.method==='POST'){
 const origin=req.headers.origin,forwarded=req.headers['x-forwarded-proto']||'http';if(origin){const u=new URL(origin);if(u.host!==req.headers.host)return json(res,403,{error:'请求来源无效'})}
 const ip=req.socket.remoteAddress;const now=Date.now();const r=rate.get(ip)||{at:now,n:0};if(now-r.at>60000){r.at=now;r.n=0}if(++r.n>30)return json(res,429,{error:'提交过于频繁，请一分钟后再试'});rate.set(ip,r);if(rate.size>5000)rate.clear();
 const {fields:f,files}=await multipart(req);if(!f.brand||f.brand.length>60||!f.title||f.title.length<4||f.title.length>80||!f.content||f.content.length<20||f.content.length>3000||(f.source||'').length>500||!['广告表达','消费体验','品牌回应','其他反馈'].includes(f.category)||f.consent!=='yes')return json(res,400,{error:'请填写完整内容并确认投稿规则'});
 if(f.source&&!/^https?:\/\//i.test(f.source))return json(res,400,{error:'来源链接需以 http:// 或 https:// 开头'});
 const submissionError=mod.records.validateSubmission(f);if(submissionError)return json(res,400,{error:submissionError});
 const guestName=current?null:(f.guest_name||'').normalize('NFKC').trim();if(!current&&(!/^[\p{L}\p{N}_-]{2,24}$/u.test(guestName)||['admin','管理员','站点整理'].includes(guestName.toLowerCase())||db.prepare('SELECT id FROM users WHERE username=? COLLATE NOCASE').get(guestName)))return json(res,400,{error:'请填写2—24位署名（中英文、数字、下划线），不能使用保留名或已有账户名'});
 const images=files.filter(x=>x.name==='images'),videos=files.filter(x=>x.name==='videos');if(files.length!==images.length+videos.length||images.length>3||videos.length>1||images.some(x=>x.bytes.length>2097152||!['image/jpeg','image/png','image/webp'].includes(x.type))||videos.some(x=>x.bytes.length>25*1024*1024||!['video/mp4','video/webm'].includes(x.type)))return json(res,400,{error:'最多3张图片（每张2MB）和1个视频（25MB），请检查文件类型和大小'});
 if(files.some(x=>mediaType(x.bytes)!==x.type))return json(res,400,{error:'文件内容与格式不符，请重新选择图片或视频'});
 const total=files.reduce((n,x)=>n+x.bytes.length,0);const disk=fs.statfsSync(DATA);if(storage+total>MAX_STORAGE||disk.bavail*disk.bsize-total<512*1024*1024)return json(res,507,{error:'存储空间不足，请联系站点管理员'});
 const id=crypto.randomUUID(),folder=path.join(DATA,'uploads',id),imageKeys=[],videoKeys=[];fs.mkdirSync(folder);try{for(const file of files){const part=crypto.randomUUID(),key=id+'/'+part;fs.writeFileSync(path.join(folder,part),file.bytes,{flag:'wx'});fs.writeFileSync(path.join(folder,part+'.json'),JSON.stringify({type:file.type}));(file.name==='images'?imageKeys:videoKeys).push(key)}const item={id,brand:f.brand,title:f.title,content:f.content,source:f.source||'',category:f.category,images:JSON.stringify(imageKeys),videos:JSON.stringify(videoKeys),created:Date.now()};db.exec('BEGIN IMMEDIATE');try{add(item);db.prepare("UPDATE feedback SET user_id=?,guest_name=?,status='pending' WHERE id=?").run(current?.id||null,guestName,id);mod.records.initializeSubmission(id,{...f,has_media:files.length>0});db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}storage+=total;return json(res,201,{item:{...item,status:'pending',contributor:current?.username||guestName,guest_name:guestName}})}catch(e){fs.rmSync(folder,{recursive:true,force:true});throw e}
}
if(pathname.startsWith('/api/images/')&&['GET','HEAD'].includes(req.method)){const key=pathname.slice(12);if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(key))return json(res,404,{error:'文件不存在'});if(!mod.canView(key.split('/')[0],current))return json(res,404,{error:'文件不存在'});const file=path.join(DATA,'uploads',key);if(!fs.existsSync(file))return json(res,404,{error:'文件不存在'});const meta=JSON.parse(fs.readFileSync(file+'.json'));return serve(req,res,file,meta.type)}
if(pathname.startsWith('/api/'))return json(res,404,{error:'接口不存在'});
if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'不支持此操作'});
if(pathname==='/discovery-routes.mjs')return serve(req,res,path.join(ROOT,'frontend/routes.mjs'),'text/javascript; charset=utf-8');
if(pathname==='/'||pathname==='/index.html'||pathname==='/admin'||/^\/(event|brand|attachment|reply|topics)(\/|$)/.test(pathname)||['/archive','/robots.txt','/sitemap.xml','/feed.xml'].includes(pathname)){
 publicPages||=discovery({template:fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8'),getItems:mod.records.publicItems,origin:process.env.PUBLIC_SITE_URL||'https://notbuy.top',assetVersion:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'dist/discovery.css'))).digest('hex').slice(0,12)});
 const page=publicPages.handle(pathname);res.writeHead(page.status,{'Content-Type':page.type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(page.noindex?{'X-Robots-Tag':'noindex, follow'}:{})});return res.end(req.method==='HEAD'?'':page.body);
}
const staticRoot=path.resolve(ROOT,'dist'),file=path.resolve(staticRoot,'.'+pathname);if(!file.startsWith(staticRoot+path.sep)&&file!==staticRoot)return json(res,403,{error:'路径无效'});if(fs.existsSync(file)&&fs.statSync(file).isFile())return serve(req,res,file,mime[path.extname(file)]||'application/octet-stream');if(pathname==='/'||pathname==='/index.html'||pathname==='/admin')return serve(req,res,path.join(staticRoot,'index.html'),mime['.html']);return json(res,404,{error:'页面不存在'});
}catch(e){console.error('request error',e.message);if(!res.headersSent)json(res,400,{error:'提交未完成：'+e.message});else res.end()}});
server.requestTimeout=120000;server.headersTimeout=30000;server.listen(PORT,'0.0.0.0',()=>console.log(`Brand Watch listening on ${PORT}; data directory ready`));

