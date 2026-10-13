import {recentUpdates} from './reading.mjs';
export function readWatchState(storage){
 let saved=[],read={};try{const value=JSON.parse(storage.getItem('brand-watch-saved')||'[]');if(Array.isArray(value))saved=[...new Set(value.filter(v=>typeof v==='string'&&v.length>0&&v.length<=60))]}catch{}
 try{const value=JSON.parse(storage.getItem('brand-watch-read')||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))read=Object.fromEntries(Object.entries(value).filter(([id,t])=>id.length<=100&&Number.isFinite(t)&&t>=0))}catch{}
 return {saved,read};
}
export function latestUpdates(items){const seen=new Set();return recentUpdates(items,Number.MAX_SAFE_INTEGER).filter(row=>{if(seen.has(row.event_id))return false;seen.add(row.event_id);return true})}
export function unreadUpdates(items,saved,read){return latestUpdates(items).filter(row=>saved.includes(row.brand)&&row.at>(read[row.event_id]||0))}
