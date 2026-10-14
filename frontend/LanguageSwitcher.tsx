import {currentLocale,localePath,switchLanguage} from './locale.mjs';
export default function LanguageSwitcher(){
 const locale=currentLocale(),next=locale==='en'?'zh-CN':'en';
 return <a data-language className="language-switch" href={localePath(location.pathname,next)+location.search+location.hash} lang={next} aria-label={next==='en'?'Switch to English':'切换简体中文'} onClick={e=>{e.preventDefault();switchLanguage(next)}}>{next==='en'?'EN':'简体中文'}</a>;
}
