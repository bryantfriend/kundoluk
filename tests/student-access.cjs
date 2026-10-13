const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function element(text,visible=true){return {textContent:text,getAttribute:()=>null,getClientRects:()=>visible?[{}]:[]};}
const nodes=[element('Сбросить пароль'),element('Пароль'),element('ПИН'),element('Student Private Name'),element('Сохранить',false)];
const sandbox={document:{querySelectorAll(selector){assert(!selector.includes('input'));return nodes;}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('extension/student-access.js','utf8'),sandbox);
const result=JSON.parse(JSON.stringify(sandbox.KundolukStudentAccess.labels()));
assert.deepEqual(result,[['Сбросить пароль','Reset password'],['Пароль','Password'],['ПИН','Personal identification number (not necessarily a password)']]);
console.log('PASS: recognized visible labels translated; hidden labels and unrelated names excluded; inputs never queried.');
