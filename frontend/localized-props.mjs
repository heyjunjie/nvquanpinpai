import {ui,localizedHref} from './locale.mjs';
const display=value=>typeof value==='string'?ui(value):Array.isArray(value)?value.map(display):value;
export function localizeProps(type,props){
 if(typeof type!=='string'||!props)return props;
 const next={...props};
 if(type==='option'&&next.value===undefined&&typeof next.children==='string')next.value=next.children;
 if(!['script','style','code','pre','textarea'].includes(type)&&props['data-original']===undefined)next.children=display(next.children);
 for(const key of ['aria-label','placeholder','title','alt'])if(typeof next[key]==='string')next[key]=ui(next[key]);
 if(type==='a'&&props['data-language']===undefined)next.href=localizedHref(next.href);
 return next;
}
