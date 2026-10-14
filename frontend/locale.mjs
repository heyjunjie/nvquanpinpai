import {translate} from './i18n-data.mjs';
export const localeFromPath=(path='')=>/^\/(?:brand-watch\/)?en(?:\/|$)/.test(path)?'en':'zh-CN';
export function canonicalPath(path='/'){const value=path.replace(/^\/brand-watch(?=\/|[?#]|$)/,'').replace(/^\/en(?=\/|[?#]|$)/,'');return !value?'/':/^[?#]/.test(value)?'/'+value:value}
export function localePath(input='/',locale='zh-CN'){
 if(!input.startsWith('/')||input.startsWith('//')||/^\/(api|admin|feed\.xml|robots\.txt|sitemap\.xml)(?:\/|\?|$)/.test(input))return input;
 const base=input.startsWith('/brand-watch/')?'/brand-watch':'';
 let path=canonicalPath(input);if(/^\/global(?=\?|#|$)/.test(path))path=path.replace(/^\/global/,'/');
 return base+(locale==='en'?'/en'+(path==='/'?'':/^\/[?#]/.test(path)?path.slice(1):path):path);
}
export const currentLocale=()=>localeFromPath(typeof location==='undefined'?'':location.pathname);
export const ui=text=>typeof text==='string'?translate(text,currentLocale()):text;
export const localizedHref=href=>typeof href==='string'?localePath(href,currentLocale()):href;
export function switchLanguage(locale){history.pushState(null,'',localePath(location.pathname,locale)+location.search+location.hash);window.dispatchEvent(new Event('languagechange'))}
