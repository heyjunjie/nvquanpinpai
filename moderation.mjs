import {archive} from './archive.mjs';
import {channels} from './frontend/routes.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function moderation(db,DATA,json){
 const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
 const hash=p=>{const salt=crypto.randomBytes(16).toString('hex');return salt+':'+crypto.scryptSync(p,salt,64).toString('hex')};
 const matches=(p,h)=>{const [salt,digest]=h.split(':');const a=crypto.scryptSync(p,salt,64),b=Buffer.from(digest,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)};
 for(const [name,definition] of [['status',"TEXT NOT NULL DEFAULT 'pending'"],['user_id','TEXT'],['review_note',"TEXT NOT NULL DEFAULT ''"],['reviewed_at','INTEGER']])if(!db.prepare('PRAGMA table_info(feedback)').all().some(c=>c.name===name)){db.exec(`ALTER TABLE feedback ADD COLUMN ${name} ${definition}`);if(name==='status')db.exec("UPDATE feedback SET status='approved'");}
 db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE COLLATE NOCASE,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS visitors(id TEXT PRIMARY KEY,first_seen INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS visitor_keys(key TEXT PRIMARY KEY,visitor_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS review_log(id INTEGER PRIMARY KEY,feedback_id TEXT NOT NULL,reviewer_id TEXT NOT NULL,status TEXT NOT NULL,note TEXT NOT NULL,created INTEGER NOT NULL);`);
 if(!db.prepare("SELECT id FROM users WHERE role='admin'").get()){
  const file=path.join(DATA,'admin-credentials.json');const credential=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{username:'admin',password:crypto.randomBytes(24).toString('base64url')};
  if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify(credential),{mode:0o600,flag:'wx'});
  db.prepare('INSERT INTO users(id,username,password,role,created) VALUES(?,?,?,?,?)').run(crypto.randomUUID(),credential.username,hash(credential.password),'admin',Date.now());
 }
 const keyFile=path.join(DATA,'visitor-key');
 if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,crypto.randomBytes(32),{mode:0o600,flag:'wx'});
 const visitorSecret=fs.readFileSync(keyFile);
 const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(v=>{const n=v.indexOf('=');return[v.slice(0,n).trim(),v.slice(n+1)]}));
 const cookie=(req,name,value,maxAge)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${req.headers['x-forwarded-proto']==='https'||process.env.COOKIE_SECURE==='true'?'; Secure':''}`;
 const session=req=>{const token=cookies(req).bw_session;return token?db.prepare('SELECT sessions.csrf,users.id,users.username,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(sha(token),Date.now())||null:null};
 const rates=new Map();
 function limited(req,scope,max=20){const ip=req.headers['x-forwarded-for']?.split(',')[0].trim()||req.socket.remoteAddress,key=scope+':'+ip,now=Date.now(),r=rates.get(key)||{at:now,n:0};if(now-r.at>60000){r.at=now;r.n=0}r.n++;rates.set(key,r);if(rates.size>5000)rates.clear();return r.n>max}
 async function readJSON(req){let data='';for await(const b of req){data+=b;if(data.length>16384)throw Error('请求过大')}return JSON.parse(data||'{}')}
 if(!db.prepare('PRAGMA table_info(feedback)').all().some(c=>c.name==='guest_name'))db.exec("ALTER TABLE feedback ADD COLUMN guest_name TEXT");
 const records=archive(db,DATA);
 db.exec('CREATE TABLE IF NOT EXISTS growth_visits(day TEXT NOT NULL,visitor_id TEXT NOT NULL,channel TEXT NOT NULL,PRIMARY KEY(day,visitor_id,channel))');
 const items=(where,args=[])=>db.prepare(`SELECT feedback.*,COALESCE(users.username,feedback.guest_name,'站点整理') AS contributor FROM feedback LEFT JOIN users ON users.id=feedback.user_id ${where}`).all(...args).map(records.extras);
 async function handle(req,res,p,current){
  const reply=(status,data)=>{json(res,status,data);return true};
  if(['POST','PATCH','DELETE'].includes(req.method)){
   const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)return reply(403,{error:'请求来源无效'});
   if(current&&req.headers['x-csrf-token']!==current.csrf)return reply(403,{error:'登录状态已变化，请刷新页面重试'});
  }
  if(p==='/api/session'&&req.method==='GET')return reply(200,{user:current?{username:current.username,role:current.role}:null,csrf:current?.csrf||''});
  if(p==='/api/session'&&req.method==='POST'){
   if(limited(req,'auth',10))return reply(429,{error:'操作过于频繁，请稍后再试'});
   const {username,password,mode}=await readJSON(req);
   if(typeof username!=='string'||typeof password!=='string'||!/^[\p{L}\p{N}_-]{2,24}$/u.test(username)||password.length<10||password.length>128)return reply(400,{error:'用户名需2—24个中英文、数字或下划线；密码需10—128位'});
   let user=db.prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE').get(username);
   if(mode==='register'){
    if(db.prepare('SELECT id FROM feedback WHERE guest_name=? COLLATE NOCASE').get(username))return reply(409,{error:'该名字已有未注册署名记录，请选择其他用户名'});
    if(user)return reply(409,{error:'用户名已被使用'});
    if(limited(req,'register',3))return reply(429,{error:'注册过于频繁，请稍后再试'});
    const id=crypto.randomUUID();db.prepare('INSERT INTO users(id,username,password,created) VALUES(?,?,?,?)').run(id,username,hash(password),Date.now());user=db.prepare('SELECT * FROM users WHERE id=?').get(id);
   }else if(!user||!matches(password,user.password))return reply(401,{error:'用户名或密码不正确'});
   const token=crypto.randomBytes(32).toString('hex'),csrf=crypto.randomBytes(24).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(sha(token),user.id,csrf,Date.now()+7*86400000);res.setHeader('Set-Cookie',cookie(req,'bw_session',token,7*86400));return reply(200,{user:{username:user.username,role:user.role},csrf});
  }
  if(p==='/api/session'&&req.method==='DELETE'){db.prepare('DELETE FROM sessions WHERE token=?').run(sha(cookies(req).bw_session||''));res.setHeader('Set-Cookie',cookie(req,'bw_session','',0));return reply(200,{ok:true})}
  if(p==='/api/stats'&&req.method==='GET'){
   const ranking=db.prepare("SELECT COALESCE(users.username,guest_name) username,CASE WHEN user_id IS NULL THEN 1 ELSE 0 END guest,COUNT(*) contributions FROM feedback LEFT JOIN users ON users.id=feedback.user_id WHERE status='approved' AND (user_id IS NOT NULL OR guest_name IS NOT NULL) GROUP BY CASE WHEN user_id IS NOT NULL THEN 'user:'||user_id ELSE 'guest:'||lower(guest_name) END ORDER BY contributions DESC,MIN(feedback.created) ASC").all();
   return reply(200,{visitors:db.prepare('SELECT COUNT(*) n FROM visitors').get().n,started:db.prepare('SELECT MIN(first_seen) d FROM visitors').get().d,contributors:ranking.length,approved:ranking.reduce((n,r)=>n+r.contributions,0),ranking:ranking.slice(0,10)});
  }
  if(p==='/api/visit'&&req.method==='POST'){
   const body=await readJSON(req),channel=channels.includes(body?.channel)?body.channel:'direct';
   let id=cookies(req).bw_visitor;if(!/^[a-f0-9]{48}$/.test(id||'')){if(limited(req,'visit',60))return reply(429,{error:'请求过于频繁'});id=crypto.randomBytes(24).toString('hex');res.setHeader('Set-Cookie',cookie(req,'bw_visitor',id,365*86400));}
   const ip=req.headers['x-forwarded-for']?.split(',')[0].trim()||req.socket.remoteAddress;
   const agent=(req.headers['user-agent']||'unknown').slice(0,512);
   const fingerprint=crypto.createHmac('sha256',visitorSecret).update(JSON.stringify([ip,agent])).digest('hex');
   // Preserve historical cookie-based visitors, then deduplicate on the server even without cookies.
   db.exec('BEGIN IMMEDIATE');try{
    const known=db.prepare('SELECT visitor_id FROM visitor_keys WHERE key=?').get(fingerprint);
    const visitorId=known?.visitor_id||(db.prepare('SELECT id FROM visitors WHERE id=?').get(sha(id))?.id)||sha(id);
    db.prepare('INSERT OR IGNORE INTO visitors VALUES(?,?)').run(visitorId,Date.now());
    db.prepare('INSERT OR IGNORE INTO visitor_keys VALUES(?,?)').run(fingerprint,visitorId);
    if(current?.role!=='admin'&&!/bot|crawler|spider|headless/i.test(agent))db.prepare('INSERT OR IGNORE INTO growth_visits VALUES(?,?,?)').run(new Date(Date.now()+8*3600000).toISOString().slice(0,10),visitorId,channel);
    db.exec('COMMIT');
   }catch(e){db.exec('ROLLBACK');throw e}
   return reply(200,{ok:true});
  }
  if(p==='/api/admin/growth'&&req.method==='GET'){
   if(current?.role!=='admin')return reply(403,{error:'需要管理员权限'});
   const since=new Date(Date.now()+8*3600000-29*86400000).toISOString().slice(0,10);
   return reply(200,{started:db.prepare('SELECT MIN(day) day FROM growth_visits').get().day,since,timezone:'Asia/Shanghai',channels:db.prepare('SELECT channel,COUNT(DISTINCT visitor_id) visitors,COUNT(*) daily_visits FROM growth_visits WHERE day>=? GROUP BY channel ORDER BY visitors DESC,channel').all(since),daily:db.prepare('SELECT day,COUNT(DISTINCT visitor_id) visitors FROM growth_visits WHERE day>=? GROUP BY day ORDER BY day DESC').all(since),total:db.prepare('SELECT COUNT(DISTINCT visitor_id) n FROM growth_visits WHERE day>=?').get(since).n});
  }
  if(p==='/api/mine'&&req.method==='GET'){if(!current)return reply(401,{error:'请先登录'});return reply(200,{items:items('WHERE feedback.user_id=? ORDER BY created DESC',[current.id])})}
  if(p==='/api/admin/feedback'&&req.method==='GET'){if(current?.role!=='admin')return reply(403,{error:'需要管理员权限'});return reply(200,{items:items('ORDER BY created DESC')})}
  if(p.startsWith('/api/admin/feedback/')&&req.method==='PATCH'){
   if(current?.role!=='admin')return reply(403,{error:'需要管理员权限'});const id=p.slice('/api/admin/feedback/'.length),{status,note=''}=await readJSON(req);if(!['approved','rejected','pending'].includes(status)||typeof note!=='string'||note.length>1000)return reply(400,{error:'审核内容无效'});if(!db.prepare('SELECT id FROM feedback WHERE id=?').get(id))return reply(404,{error:'反馈不存在'});
   db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE feedback SET status=?,review_note=?,reviewed_at=? WHERE id=?').run(status,note,Date.now(),id);db.prepare('INSERT INTO review_log(feedback_id,reviewer_id,status,note,created) VALUES(?,?,?,?,?)').run(id,current.id,status,note,Date.now());db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}records.publication(id,status);return reply(200,{ok:true});
  }
  if(p==='/api/feedback'&&req.method==='GET'){const all=records.publicItems();return reply(200,{items:all,total:all.length})}
  if(p.startsWith('/api/archive/')&&req.method==='PATCH'){if(current?.role!=='admin')return reply(403,{error:'需要管理员权限'});const result=records.edit(p.slice('/api/archive/'.length),await readJSON(req));return reply(result.status,result)}
  return false;
 }
 return {session,handle,records,canView:(id,current)=>{const item=db.prepare('SELECT status,user_id FROM feedback WHERE id=?').get(id);return item&&(item.status==='approved'||current?.role==='admin'||current&&current.id===item.user_id)}};
}
