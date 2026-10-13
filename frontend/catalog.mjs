// Public names and spelling aliases, not corporate ownership or product equivalence.
export const baseBrands=['回力','罗蒙','Dickies','匹克','德芙','罗技','OPPO','滴露','TVB'];
export const brandAliases={
 '回力':['warrior'],'罗蒙':['romon'],'Dickies':['dickies','dickles'],'匹克':['peak'],'德芙':['dove'],
 '罗技':['logitech'],'OPPO':['oppo'],'滴露':['dettol'],'TVB':['tvb'],
 'Apple苹果':['apple','苹果'],'大疆':['dji'],'微星/MSI':['msi','微星'],'梅赛德斯-奔驰':['mercedes','mercedes-benz','benz','奔驰'],
 '长城欧拉':['ora','欧拉'],'李宁运动生活':['lining','li-ning','李宁'],'极氪':['zeekr'],'京东':['jd.com'],
 '可口可乐':['coca-cola','coca cola'],'乐道':['onvo'],'雷诺韩国':['renault korea'],'梅见':['meijian'],
 '美团买药':['meituan'],'珀莱雅':['proya'],'舍得酒业':['shede'],'烫/FEEEIVER':['feeeiver'],
 '淘宝':['taobao'],'天猫':['tmall'],'雅诗兰黛':['estée lauder','estee lauder'],'伊黛爾':['edele'],
 'Keep':['keep'],'MAIA ACTIVE':['maia active'],'YOLO VI美妆店':['yolo vi']
};
export const normalizeQuery=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}]+/gu,' ').trim();
export function matchesText(text,query){const hay=normalizeQuery(text);return normalizeQuery(query).split(' ').filter(Boolean).every(word=>hay.includes(word));}
export function brandMatches(brand,query){return matchesText([brand,...(brandAliases[brand]||[])].join(' '),query);}
export function publicBrandNames(items){return [...new Set([...baseBrands,...items.filter(i=>i.status==='approved'&&i.record_type!=='site').map(i=>i.brand)])].sort((a,b)=>a.localeCompare(b,'zh-CN'));}
