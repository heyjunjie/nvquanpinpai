// Real URLs are shared by server rendering, in-page navigation and share actions.
import {localePath,currentLocale,canonicalPath} from './locale.mjs';
export function publicPath(type, value='') {
  const prefix=typeof location!=='undefined'&&location.pathname.startsWith('/brand-watch/')?'/brand-watch':'';
  return localePath(prefix+'/'+type+(value?'/'+encodeURIComponent(value):''),currentLocale());
}
export function routePath(input='') {
  const raw=input.replace(/^#/, '')||'/';
  return localePath(raw.startsWith('/')&&!raw.startsWith('//')?raw:'/',currentLocale());
}
export function currentRoute(loc) {
  const raw=loc.hash?.startsWith('#/')?loc.hash.slice(1):loc.pathname.replace(/^\/brand-watch(?=\/|$)/,'');
  const parts=canonicalPath(raw).split('/').filter(Boolean);
  try {return {type:parts[0]||'',value:decodeURIComponent(parts.slice(1).join('/'))};}
  catch {return {type:'invalid',value:''};}
}
export const channels=['direct','google','bing','baidu','weibo','xiaohongshu','douyin','bilibili','wechat','x','github','referral'];
export function visitChannel(href, referrer='', previous='direct') {
  const internal=channels.includes(previous)?previous:'direct';
  const url=new URL(href), tagged=url.searchParams.get('utm_source');
  if(tagged)return channels.includes(tagged)?tagged:'referral';
  if(!referrer)return internal;
  let host;try{const ref=new URL(referrer);if(ref.origin===url.origin)return internal;host=ref.hostname;}catch{return internal;}
  for(const [channel,domains] of Object.entries({google:['google.com','google.co.uk','google.com.hk'],bing:['bing.com'],baidu:['baidu.com'],weibo:['weibo.com','weibo.cn'],xiaohongshu:['xiaohongshu.com','xhslink.com'],douyin:['douyin.com'],bilibili:['bilibili.com','b23.tv'],wechat:['weixin.qq.com'],x:['x.com','t.co','twitter.com'],github:['github.com']}))
    if(domains.some(d=>host===d||host.endsWith('.'+d)))return channel;
  return 'referral';
}
export function browserVisitChannel() {
  let previous='direct';
  try {const saved=JSON.parse(sessionStorage.getItem('bw-source')||'null');if(saved&&Date.now()-saved.at<30*60000)previous=saved.channel;}catch{}
  const channel=visitChannel(location.href,document.referrer,previous);
  try{sessionStorage.setItem('bw-source',JSON.stringify({channel,at:Date.now()}));}catch{}
  return channel;
}
