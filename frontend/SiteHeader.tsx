import {useState} from 'react';
import {Menu,Plus,X} from 'lucide-react';
import type {Account} from './Community';
export default function SiteHeader({api,user,onAccount,onSubmit}:{api:string;user:Account|null;onAccount:()=>void;onSubmit:()=>void}){
 const [menu,setMenu]=useState(false);
 const home=location.pathname==='/admin'?api+'/':'';
 const links=[['/lookup','买前速查'],[home+'#brands','品牌目录'],[home+'#recent','事件时间线'],['/global','全球观察'],['/updates','最近更新'],['/tasks','一起补证']];
 const englishPath=/^\/(brand|event|attachment|reply)\//.test(location.pathname)?'/en'+location.pathname+location.search:'/en';
 return <><a className="skip-link" href="#main-content">跳到主要内容</a><header className="phase-two-header"><a className="logo" href={api+'/'}>女拳品牌观察<span className="logo-tag">NOTBUY.TOP</span></a><nav aria-label="主导航">{links.map(([href,title])=><a key={href} href={href}>{title}</a>)}</nav><div className="header-actions"><a className="language-switch" href={englishPath} lang="en">EN</a><button className="text-button" onClick={onAccount}>{user?user.username:'登录 / 注册'}</button><button className="small-primary" onClick={onSubmit}><Plus size={16}/>提交反馈</button><button className="icon-button mobile-menu-toggle" aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu?'关闭导航':'打开导航'} onClick={()=>setMenu(!menu)}>{menu?<X size={22}/>:<Menu size={22}/>}</button></div></header><nav id="mobile-nav" className="mobile-nav" data-open={menu} aria-label="手机导航" onKeyDown={e=>{if(e.key==='Escape')setMenu(false)}}>{links.map(([href,title])=><a key={href} href={href} onClick={()=>setMenu(false)}>{title}</a>)}<a href={englishPath} lang="en">English</a><button className="text-button" onClick={()=>{setMenu(false);onSubmit()}}>提交反馈<Plus size={16}/></button></nav></>;
}
