import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {publicPath} from './routes.mjs';
export type EvidenceTask={id:string;event_id:string;title:string;need:string;kind:string;status:string;brand:string;event_title:string;resolution_note:string;proof:null|{id:string;title:string;contributor:string;guest:boolean};contributions:{id:string;title:string;contributor:string;guest:boolean}[]};
export const taskKind:Record<string,string>={original:'原始材料',identity:'发布主体',date:'日期核对',response:'回应原件'};
export const taskHref=(task:EvidenceTask)=>publicPath('reply',task.event_id)+'?task='+encodeURIComponent(task.id);
export function TaskRow({task,compact=false}:{task:EvidenceTask;compact?:boolean}){
 return <article className="evidence-task"><div className="participation-meta"><span>{task.brand} · {taskKind[task.kind]}</span><span>{task.status==='resolved'?'已补齐 · 查看依据':'等待补证'}</span></div><h3>{task.title}</h3><p>{task.need}</p>{!compact&&<a className="task-parent" href={publicPath('event',task.event_id)}>关联事件：{task.event_title}<ArrowUpRight size={15}/></a>}{task.status==='resolved'&&task.proof?<div className="task-resolution"><p>{task.resolution_note}</p><a href={publicPath('event',task.proof.id)}>查看完成依据<ArrowUpRight size={15}/></a><small>贡献者：{task.proof.contributor}{task.proof.guest?'（未注册署名）':''} · 补齐材料不代表整个事件已核实</small></div>:<a className="task-submit" href={taskHref(task)}>我有这份资料<ArrowUpRight size={16}/></a>}{task.status==='open'&&!!task.contributions.length&&<p className="task-credit">已公开补证：{task.contributions.map((c,n)=><span key={c.id}>{n>0?'、':''}<a href={publicPath('event',c.id)}>{c.contributor}{c.guest?'（未注册）':''}</a></span>)}；仍待核对任务是否补齐。</p>}</article>;
}
export function EventTasks({tasks,error}:{tasks:EvidenceTask[];error?:string}){
 if(!tasks.length&&!error)return null;
 return <section className="event-tasks"><h3>这份档案还需要什么</h3>{error?<p role="status">补证任务暂时无法读取，仍可使用下方“补充回应或更正”。</p>:tasks.map(task=><TaskRow key={task.id} task={task} compact/>)}</section>;
}
export default function TaskBoard({tasks,loading,error,onRetry}:{tasks:EvidenceTask[];loading:boolean;error:string;onRetry:()=>void}){
 const open=tasks.filter(t=>t.status==='open');
 return <section className="task-board" aria-labelledby="task-board-title"><div className="section-line"><h2 id="task-board-title">一起补证</h2><a href="/tasks">全部任务<ArrowRight size={15}/></a></div><p className="section-footnote">从一份具体资料开始。提交后由管理员审核，公开时保留你的署名。</p>{loading?<p role="status">正在读取补证任务…</p>:error?<div role="status"><p>补证任务暂时无法加载。</p><button className="text-button" onClick={onRetry}>重新加载任务</button></div>:open.length?open.slice(0,3).map(task=><TaskRow key={task.id} task={task}/>):<p>目前没有待补证任务，可以在具体事件中提供回应或更正。</p>}</section>;
}
