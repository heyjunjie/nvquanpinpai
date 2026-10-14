import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {translate,localizeRecord,localizeTask} from '../frontend/i18n-data.mjs';

// The switch changes display language, not the identity or evidence submitted to
// moderation. Source prose that resembles interface vocabulary stays original.
const record=Object.freeze({id:'event-stable',brand:'回力',title:'中文事件标题',content:'回力原文：查看来源，品牌回应仍待核。',source:'https://example.com/original',images:'["event/image"]',videos:'[]',content_language:'zh-CN',record_type:'event',editor_summary:'中文摘要',response_summary:'中文回应',pending_summary:'中文待核',date_precision:'月',brief:Object.freeze({summary:'原文要点'}),global:Object.freeze({translations:{en:{brand:'Warrior',title:'Reviewed English event title',summary:'Reviewed English summary',response:'Reviewed response',pending:'Review still needed',date_precision:'Month'}}})});
const english=localizeRecord(record,'en');
assert.equal(localizeRecord(record,'zh-CN'),record);
assert.equal(english.title,'Reviewed English event title');
assert.equal(english.editor_summary,'Reviewed English summary');
assert.equal(english.response_summary,'Reviewed response');
assert.equal(english.pending_summary,'Review still needed');
assert.equal(english.date_precision,'Month');
assert.equal(english.brand,record.brand);
assert.equal(english.display_brand,'Warrior');
assert.equal(english.id,record.id);
assert.equal(english.source,record.source);
assert.equal(english.images,record.images);
assert.equal(english.content,record.content);
assert.equal(english.brief,record.brief);
assert.equal(english.original_record,record);
assert.equal(localizeRecord(english,'zh-CN'),record);
assert.equal(localizeRecord(english,'en').original_record,record);
assert.match(english.translation_note,/original record/);
assert.doesNotThrow(()=>JSON.stringify(english));

const stale=localizeRecord({...record,global:{translation_stale:true,translations:record.global.translations}},'en-US');
assert.equal(stale.title,record.title);
assert.equal(stale.editor_summary,record.editor_summary);
assert.equal(stale.response_summary,record.response_summary);
assert.equal(stale.pending_summary,record.pending_summary);
assert.equal(stale.date_precision,record.date_precision);
assert.match(stale.translation_note,/needs review/);
assert.equal(stale.display_language,'zh-CN');
const untranslated=localizeRecord({...record,global:null},'en');
assert.equal(untranslated.title,record.title);
assert.match(untranslated.translation_note,/Original Chinese/);
assert.equal(untranslated.display_language,'zh-CN');
assert.match(localizeRecord({...record,global:null,content_language:'en'},'en').translation_note,/Original English/);
assert.equal(localizeRecord({...record,global:{translations:{en:{date_precision:'Month'}}}},'en').display_language,'zh-CN');

const task=Object.freeze({id:'task-stable',event_id:'event-stable',brand:'回力',title:'中文任务',need:'请补充原始材料',translations:{en:{title:'Original material needed',need:'Provide the complete original material'}}});
assert.equal(localizeTask(task,'zh-CN'),task);
const translatedTask=localizeTask(task,'en');
assert.equal(translatedTask.id,task.id);
assert.equal(translatedTask.event_id,task.event_id);
assert.equal(translatedTask.brand,task.brand);
assert.equal(translatedTask.title,'Original material needed');
assert.equal(translatedTask.need,'Provide the complete original material');
assert.equal(translatedTask.original_task,task);
assert.equal(localizeTask(translatedTask,'zh-CN'),task);
assert.equal(localizeTask({...task,translation_stale:true},'en').title,task.title);
assert.match(localizeTask({...task,translations:{}},'en').translation_note,/original Chinese/);

assert.equal(translate('品牌目录'),'品牌目录');
assert.equal(translate('简体中文','en'),'简体中文');
assert.equal(translate('品牌目录','en'),'Brand directory');
assert.equal(translate('访问总人数','en'),'Total visitors');
assert.equal(translate('匹配 7 个品牌 · 12 条记录','en'),'7 matching brands · 12 records');
assert.equal(translate('查看第 3 份视频','en'),'View video 3');
assert.equal(translate('事实待核 · 第三方留存','en'),'Facts unconfirmed · Third-party copy');
assert.equal(translate('取消关注回力','en'),'Unfollow Warrior');
assert.equal(translate('访问总人数20，贡献总人数1','en'),'Total visitors 20; total contributors 1');
assert.equal(translate(' 贡献者： ','en'),' Contributor: ');
assert.equal(translate('此段事实包含品牌回应和第三方留存，但必须保留原文。','en'),'此段事实包含品牌回应和第三方留存，但必须保留原文。');
assert.equal(translate(record.content,'en'),record.content);
assert.equal(translate('来源标题：品牌目录与回应','en'),'来源标题：品牌目录与回应');

// A native JSX translation layer sees individual text children. Ensure every
// literal Chinese UI text node has a display translation, including fragments
// on either side of counters. Keep the target language name in Chinese.
const missing=[];
const frontend=new URL('../frontend/',import.meta.url);
for(const filename of fs.readdirSync(frontend).filter(name=>name.endsWith('.tsx'))){
 const source=ts.createSourceFile(filename,fs.readFileSync(new URL(filename,frontend),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const walk=node=>{
  if(ts.isJsxText(node)){
   const value=node.text.trim();
   if(/[一-龥]/.test(value)&&value!=='简体中文'&&translate(value,'en')===value)missing.push(`${filename}: ${value}`);
  }
  ts.forEachChild(node,walk);
 };
 walk(source);
}
assert.deepEqual(missing,[],`Untranslated UI text nodes: ${missing.join('; ')}`);
console.log('i18n-data: canonical record/task identity, stale translations, source preservation and public JSX text coverage passed');
