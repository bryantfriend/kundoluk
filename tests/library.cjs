const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data={lessonWorkbook:{version:1,sheets:[{name:'Biology',lessons:[{lesson:'Exact\n text ',homework:''}]}]}};
let fail=false,id=0;
const storage={async get(){return structuredClone(data)},async set(values){if(fail)throw Error('quota');Object.assign(data,structuredClone(values))},async remove(keys){for(const key of [keys].flat())delete data[key]}};
function reload(){const scope={crypto:{randomUUID:()=>String(++id)}};vm.createContext(scope);vm.runInContext(fs.readFileSync('extension/library.js','utf8'),scope);return scope.KundolukLibrary.create(storage)}
(async()=>{
 let lib=reload();assert.equal((await lib.list()).length,1);assert.equal((await lib.list()).length,1);
 const book=structuredClone(data.lessonWorkbook);
 await Promise.all([lib.add('Geography.xlsx',book),lib.add('Biology.xlsx',book)]);
 lib=reload();let entries=await lib.list();assert.equal(entries.length,3);assert.equal(entries[0].book.sheets[0].lessons[0].lesson,'Exact\n text ');
 fail=true;await assert.rejects(lib.add('failed.xlsx',book),/quota/);fail=false;assert.equal((await lib.list()).length,3);
 await lib.remove('lessonPlan:legacy');assert.equal((await reload().list()).length,2);assert.equal(data.lessonWorkbook,undefined);
 await assert.rejects(lib.remove('unrelated'),/Invalid/);
 console.log('PASS: migration, repeated reload, multiple imports, exact text, failed writes preserve library, selective removal.');
})().catch(e=>{console.error(e);process.exitCode=1});
