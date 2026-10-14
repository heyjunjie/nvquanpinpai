import {localePath} from './locale.mjs';
import {translate} from './i18n-data.mjs';

const pages={
 archive:['全部品牌与事件档案','All brands and event records'],
 tasks:['一起补证：公开资料缺口','Evidence gaps: help complete the record'],
 updates:['最近更新：补证、回应与更正','Latest updates: evidence, responses and corrections'],
 lookup:['买前速查：品牌与别名检索','Before you buy: brand and alias lookup'],
 admin:['管理后台','Administration']
};
const topics={
 history:['品牌广告争议历史时间线：旧事件与来源回看','Historical brand advertising records and sources'],
 responses:['品牌回应怎么查：回应记录、纠错与待核事项','Brand responses, corrections and unresolved questions'],
 'store-posts':['回力、匹克、Dickies 店铺争议：图片、时间与发布主体','Warrior, PEAK and Dickies store posts: sources and publisher identity']
};
export function pageMetadata({route,locale='zh-CN',detail=null,brand='',reply=null,missing=false,origin,pathname,search=''}){
 const en=locale==='en',pick=pair=>pair[en?1:0];
 let title=pick(['品牌事件、原始资料与回应','Brand events, original sources and responses']);
 let description=pick(['按品牌和发生时间查阅公开事件，图片、来源、回应和待核事项分别记录。','Browse public events by brand and event date, with media, sources, responses and evidence gaps recorded separately.']);
 if(missing){title=pick(['记录未公开或链接无效','Record unavailable']);description=pick(['请返回目录查阅公开资料。','Return to the directory to read public records.']);}
 else if(route.type==='admin'){title=pick(pages.admin);description=pick(['登录管理员账户审核投稿。','Sign in to review contributions.']);}
 else if(detail){title=detail.title;description=(detail.editor_summary||detail.title).slice(0,180);}
 else if(route.type==='reply'){title=pick(['补充回应与更正','Contribute a response or correction'])+(reply?': '+reply.title:'');description=pick(['署名提交关联资料，审核后公开。','Submit named evidence linked to this event for moderation.']);}
 else if(brand){const label=translate(brand,locale);title=en?label+' — sources and responses':brand+'品牌事件与资料';description=en?'Read public event records, sources, responses and unresolved questions for '+label+'.':brand+'的公开图片、事件、来源与回应。';}
 else if(route.type==='topics'&&topics[route.value]){title=pick(topics[route.value]);description=pick(['一起核对事件、来源、时间与回应，保留待核事项。','Read events, sources, dates and responses together, retaining unresolved questions.']);}
 else if(pages[route.type])title=pick(pages[route.type]);
 const filtered=['q','market','topic','response_class','material_status','publisher_scope','region'].some(key=>new URLSearchParams(search).has(key));
 const noindex=missing||route.type==='admin'||['reply','attachment'].includes(route.type)||detail?.record_type==='site'||filtered;
 const canonical=origin+localePath(pathname,locale);
 return {title:title+' | '+translate('女拳品牌观察',locale),ogTitle:title,description,robots:noindex?'noindex,follow':'index,follow',canonical,
  zh:origin+localePath(pathname,'zh-CN'),en:origin+localePath(pathname,'en')};
}
