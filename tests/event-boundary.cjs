const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync('extension/event-boundary.js','utf8'),scope);
const handlers=new Map();scope.KundolukEventBoundary.install({addEventListener(type,handler,options){assert.ok(!options?.capture);handlers.set(type,handler);}});
for(const type of ['click','pointerdown','pointermove','pointerup','mousedown','touchstart','keydown','focusin']){
 let stopped=false;handlers.get(type)({stopPropagation(){stopped=true},preventDefault(){assert.fail('Must preserve native controls and text selection');}});assert.ok(stopped,type);
}
assert.ok(!handlers.has('input'));assert.ok(!handlers.has('change'));
console.log('PASS: interaction events isolated in bubble phase; default actions and form input/change preserved.');
