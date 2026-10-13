const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=[];function element(text){const attrs=new Map();const e={childNodes:[],closest:()=>null,getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),isConnected:true};const n={nodeType:3,textContent:text,parentElement:e,isConnected:true};e.childNodes=[n];nodes.push(e);return e;}
const menu=element('  Менин журналым  '),save=element('Сактоо'),unknown=element('Private lesson text');
const scope={MutationObserver:class{disconnect(){}observe(){}},NodeFilter:{SHOW_TEXT:4},document:{documentElement:{},getElementById:()=>null,querySelectorAll:()=>nodes,createTreeWalker:e=>{let i=0;return {nextNode:()=>e.childNodes[i++]||null};}}};vm.createContext(scope);vm.runInContext(fs.readFileSync('extension/ui-labels.js','utf8'),scope);vm.runInContext(fs.readFileSync('extension/english.js','utf8'),scope);
assert.equal(menu.childNodes[0].textContent,'  My timetable  ');assert.equal(save.childNodes[0].textContent,'Save');assert.equal(unknown.childNodes[0].textContent,'Private lesson text');assert.equal(scope.KundolukEnglish.originalText(save),'Сактоо');assert.equal(menu.getAttribute('title'),'Менин журналым');assert.equal(scope.KundolukEnglish.translate('Чейректик баа'),'Quarter grades');console.log('PASS: English labels, original hover labels, original adapter text, unknown content untouched.');

for(const [source,expected] of [['Учебный год','School year'],['Класс(А,Б,В...)','Class section'],['Статус перевода','Promotion status'],['Четвертной отчёт','Quarter reports'],['Кол. : 1','Count: 1']])assert.equal(scope.KundolukEnglish.translate(source),expected);
assert.match(scope.KundolukUIHelp['My classes'],/Right-click/);
console.log('PASS: screenshot headers, counts and English contextual help.');

for(const [source,expected] of [['Расписание учителей','Teacher timetable'],['Выставление оценок','Enter grades'],['Отменить','Cancel'],['Оценка за четверть','Quarter grades'],['Ф.И.О.','Student full name'],['Ученики (19)','Students (19)'],['Базисный учебный план 26/27','Basic curriculum 26/27'],['Понедельник','Monday']])assert.equal(scope.KundolukEnglish.translate(source),expected);
for(const label of ['Homework','Topic','Enter grades','Save all','Grade / mark','Choose a grade / mark'])assert.ok(scope.KundolukUIHelp[label].length>50);
assert.match(scope.KundolukUIHelp['Info code (Инф)'],/not been verified/);
console.log('PASS: timetable/grading screenshot variants, dynamic labels, homework and grade instructions.');
