const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync('extension/workbook.js','utf8'),scope);const parse=scope.KundolukWorkbook.fromRows,h=['№ урока','Количество уроков','План урока','Домашнее задание'];
const result=parse([h,['1','2',' Exact\ntext ',''],['3','','',''],['4','','','']],'Test');assert.equal(result.lessons.length,1);assert.equal(result.lessons[0].lesson,' Exact\ntext ');assert.equal(result.warnings.length,2);
assert.equal(parse([h,['1','1','A',''],['2','','',''],['3','1','B','']],'Test').lessons.length,2);
assert.throws(()=>parse([h,['1','1','','']],'Test'),/no lesson/);
assert.throws(()=>parse([h,['1','','','Homework']],'Test'),/missing/);
assert.throws(()=>parse([h,['1','','','']],'Test'),/no lesson/);
console.log('PASS: trailing templates allowed with warnings; empty middle rows skipped; homework-only rows rejected; exact text retained.');
