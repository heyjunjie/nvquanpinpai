import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),data=fs.mkdtempSync(path.join(os.tmpdir(),'nvquanpinpai-test-'));
const proc=spawn(process.execPath,['--experimental-sqlite',path.join(root,'server.mjs')],{env:{...process.env,DATA_DIR:data,PORT:'18789'},stdio:['ignore','pipe','pipe']});
let log='';proc.stderr.on('data',b=>log+=b);
const base='http://127.0.0.1:18789';
async function req(url,{method='GET',body,auth,headers={}}={}){const r=await fetch(base+url,{method,headers:{...headers,...(auth?{Cookie:auth.cookie,'X-CSRF-Token':auth.csrf}:{})},body});return {status:r.status,body:r.headers.get('content-type')?.includes('json')?await r.json():await r.arrayBuffer(),cookie:r.headers.get('set-cookie')}}
const json=(v)=>({body:JSON.stringify(v),headers:{'Content-Type':'application/json'}});
try{
 for(let n=0;n<30;n++){try{await fetch(base+'/healthz');break}catch{await new Promise(r=>setTimeout(r,100))}}
 const credential=JSON.parse(fs.readFileSync(path.join(data,'admin-credentials.json')));
 const login=await req('/api/session',{method:'POST',...json(credential)});assert.equal(login.status,200);const admin={cookie:login.cookie.split(';')[0],csrf:login.body.csrf};
 const reg=await req('/api/session',{method:'POST',...json({mode:'register',username:'验收用户',password:'isolated-check-password'})});assert.equal(reg.status,200);const user={cookie:reg.cookie.split(';')[0],csrf:reg.body.csrf};
 assert.equal((await req('/api/admin/feedback')).status,403);assert.equal((await req('/api/admin/feedback',{auth:user})).status,403);
 const form=new FormData();for(const [k,v] of Object.entries({brand:'回力',title:'审核流程验收记录',content:'这是隔离环境的完整审核流程验收记录，包含图片和视频附件。',category:'其他反馈',consent:'yes'}))form.append(k,v);
 form.append('images',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5XcAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'check.png');
 const media=Buffer.alloc(48);media.write('ftyp',4);form.append('videos',new Blob([media],{type:'video/mp4'}),'range-fixture.mp4'); // Transport fixture only, not a playable video.
 assert.equal((await req('/api/feedback',{method:'POST',body:form})).status,400);
 const submission=await req('/api/feedback',{method:'POST',body:form,auth:user});assert.equal(submission.status,201);const item=submission.body.item;assert.equal(item.status,'pending');
 assert.equal((await req('/api/feedback')).body.items.length,0);
 for(const key of [...JSON.parse(item.images),...JSON.parse(item.videos)]){assert.equal((await req('/api/images/'+key)).status,404);assert.equal((await req('/api/images/'+key,{auth:admin})).status,200);assert.equal((await req('/api/images/'+key,{auth:user})).status,200)}
 assert.equal((await req('/api/admin/feedback/'+item.id,{method:'PATCH',...json({status:'approved'}),auth:{...admin,csrf:'bad'}})).status,403);
 assert.equal((await req('/api/admin/feedback/'+item.id,{method:'PATCH',...json({status:'approved',note:'附件与来源已检查'}),auth:admin})).status,200);
 assert.equal((await req('/api/feedback')).body.items[0].contributor,'验收用户');
 const stats=(await req('/api/stats')).body;assert.equal(stats.contributors,1);assert.equal(stats.approved,1);assert.equal(stats.ranking[0].contributions,1);
 const key=JSON.parse(item.videos)[0];assert.equal((await req('/api/images/'+key,{headers:{Range:'bytes=0-31'}})).status,206);
 const visit=await req('/api/visit',{method:'POST'});await req('/api/visit',{method:'POST',headers:{Cookie:visit.cookie.split(';')[0]}});assert.equal((await req('/api/stats')).body.visitors,1);await req('/api/visit',{method:'POST'});await req('/api/visit',{method:'POST'});assert.equal((await req('/api/stats')).body.visitors,1);
 for(const status of ['rejected','pending']){assert.equal((await req('/api/admin/feedback/'+item.id,{method:'PATCH',...json({status,note:'隔离测试'}),auth:admin})).status,200);assert.equal((await req('/api/feedback')).body.items.length,0);assert.equal((await req('/api/images/'+key)).status,404);assert.equal((await req('/api/stats')).body.contributors,0)}
 assert.equal((await req('/api/mine',{auth:user})).body.items[0].status,'pending');
 await req('/api/session',{method:'DELETE',auth:user});assert.equal((await req('/api/mine',{auth:user})).status,401);
 form.set('guest_name','未注册验收');
 const guest=await req('/api/feedback',{method:'POST',body:form});assert.equal(guest.status,201);assert.equal(guest.body.item.contributor,'未注册验收');
 const gid=guest.body.item.id,gkey=JSON.parse(guest.body.item.images)[0];assert.equal((await req('/api/images/'+gkey)).status,404);
 assert.equal((await req('/api/admin/feedback',{auth:admin})).body.items.find(x=>x.id===gid).contributor,'未注册验收');
 await req('/api/admin/feedback/'+gid,{method:'PATCH',...json({status:'approved'}),auth:admin});
 assert.equal((await req('/api/feedback')).body.items[0].contributor,'未注册验收');assert.equal((await req('/api/images/'+gkey)).status,200);
 const gs=(await req('/api/stats')).body;assert.equal(gs.contributors,1);assert.equal(gs.ranking[0].guest,1);
 form.set('guest_name','验收用户');assert.equal((await req('/api/feedback',{method:'POST',body:form})).status,400);
 console.log('PASS: named guest submission, required name, reserved account name, moderation, private media, approval credit and guest ranking');
 console.log('PASS: account, admin permissions, CSRF, pending image/video privacy, approval attribution/ranking, rejection/retraction, video ranges, visitor deduplication, logout.');
}catch(e){console.error(log);throw e}finally{proc.kill();await new Promise(r=>proc.once('exit',r));fs.rmSync(data,{recursive:true,force:true});}
