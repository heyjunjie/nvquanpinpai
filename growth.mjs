const staticPages=new Map([['/','首页'],['/lookup','买前速查'],['/archive','全部档案'],['/updates','最近更新'],['/tasks','补证任务'],['/topics/store-posts','店铺争议专题'],['/topics/history','历史回看专题'],['/topics/responses','品牌回应专题']]);
const baseBrands=['回力','罗蒙','Dickies','匹克','德芙','罗技','OPPO','滴露','TVB'];
export const activityActions=['view','share_click','card_download','submit_start'];
export function growth(db,getItems){
 db.exec(`CREATE TABLE IF NOT EXISTS content_activity(day TEXT NOT NULL,visitor_id TEXT NOT NULL,path TEXT NOT NULL,action TEXT NOT NULL,channel TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(day,visitor_id,path,action,channel));
 CREATE TABLE IF NOT EXISTS content_landings(day TEXT NOT NULL,visitor_id TEXT NOT NULL,channel TEXT NOT NULL,path TEXT NOT NULL,PRIMARY KEY(day,visitor_id,channel));
 CREATE TABLE IF NOT EXISTS submission_attribution(feedback_id TEXT PRIMARY KEY,day TEXT NOT NULL,channel TEXT NOT NULL,path TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS growth_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
 db.prepare('INSERT OR IGNORE INTO growth_meta VALUES(?,?)').run('content_started',new Date().toISOString());
 const day=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 function target(raw,catalog){
  if(typeof raw!=='string'||raw.length>500||!raw.startsWith('/')||raw.startsWith('//'))return null;
  let pathname;try{pathname=decodeURIComponent(new URL(raw,'https://notbuy.top').pathname).replace(/^\/brand-watch(?=\/|$)/,'')||'/'}catch{return null}
  if(staticPages.has(pathname))return {path:pathname,title:staticPages.get(pathname)};
  const items=catalog||getItems().filter(i=>i.status==='approved'&&i.record_type!=='site');
  if(pathname.startsWith('/event/')){const item=items.find(i=>'/event/'+i.id===pathname);if(item)return {path:'/event/'+encodeURIComponent(item.id),title:item.title}}
  if(pathname.startsWith('/brand/')){const name=pathname.slice(7);if(baseBrands.includes(name)||items.some(i=>i.brand===name))return {path:'/brand/'+encodeURIComponent(name),title:name+' · 品牌档案'}}
  return null;
 }
 function record(visitorId,channel,action,raw){
  const page=target(raw);if(!visitorId||!page||!activityActions.includes(action))return false;
  if(['share_click','card_download'].includes(action)&&!page.path.startsWith('/event/'))return false;
  db.prepare('INSERT OR IGNORE INTO content_activity VALUES(?,?,?,?,?,?)').run(day(),visitorId,page.path,action,channel,Date.now());
  if(action==='view')db.prepare('INSERT OR IGNORE INTO content_landings VALUES(?,?,?,?)').run(day(),visitorId,channel,page.path);
  return true;
 }
 function submission(id,parentId,channel){const page=target(parentId?'/event/'+parentId:'/');if(page)db.prepare('INSERT INTO submission_attribution VALUES(?,?,?,?)').run(id,day(),channel,page.path)}
 function summary(){
  const catalog=getItems().filter(i=>i.status==='approved'&&i.record_type!=='site');
  const since=new Date(Date.now()+8*3600000-29*86400000).toISOString().slice(0,10);
  const submitted=db.prepare("SELECT path,COUNT(*) submitted,SUM(CASE WHEN feedback.status='approved' THEN 1 ELSE 0 END) approved FROM submission_attribution JOIN feedback ON feedback.id=submission_attribution.feedback_id WHERE day>=? GROUP BY path").all(since);
  const counts=new Map(submitted.map(r=>[r.path,r]));
  const activity=db.prepare("SELECT path,COUNT(DISTINCT CASE WHEN action='view' THEN visitor_id END) views,COUNT(DISTINCT CASE WHEN action='share_click' THEN visitor_id END) shares,COUNT(DISTINCT CASE WHEN action='card_download' THEN visitor_id END) downloads,COUNT(DISTINCT CASE WHEN action='submit_start' THEN visitor_id END) starts FROM content_activity WHERE day>=? GROUP BY path").all(since);
  for(const row of submitted)if(!activity.some(a=>a.path===row.path))activity.push({path:row.path,views:0,shares:0,downloads:0,starts:0});
  const content=activity.map(row=>{const page=target(row.path,catalog);return page?{...row,title:page.title,submitted:counts.get(row.path)?.submitted||0,approved:counts.get(row.path)?.approved||0}:null}).filter(Boolean).sort((a,b)=>b.views-a.views||b.approved-a.approved||a.path.localeCompare(b.path));
  const landings=db.prepare('SELECT channel,path,COUNT(DISTINCT visitor_id) visitors FROM content_landings WHERE day>=? GROUP BY channel,path ORDER BY visitors DESC,path').all(since).map(r=>{const page=target(r.path,catalog);return page?{...r,title:page.title}:null}).filter(Boolean);
  const returning=db.prepare('SELECT COUNT(DISTINCT a.visitor_id) n FROM growth_visits a WHERE a.day>=? AND EXISTS(SELECT 1 FROM growth_visits b WHERE b.visitor_id=a.visitor_id AND b.day<a.day)').get(since).n;
  return {since,started:db.prepare("SELECT value FROM growth_meta WHERE key='content_started'").get().value,returning,content,landings};
 }
 return {record,submission,summary,target};
}
