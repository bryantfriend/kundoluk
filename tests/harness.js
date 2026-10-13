const modal=document.getElementById('modal');
let saves=0,changes=0;
document.getElementById('open').onclick=()=>modal.hidden=false;
document.getElementById('cancel').onclick=()=>modal.hidden=true;
document.getElementById('save').onclick=()=>saves++;
document.getElementById('source-test').onclick=async()=>{
 const out=document.getElementById('source-results');
 try {
  const [file,expectedFile]=await Promise.all([fetch('private/source.xlsx'),fetch('private/expected.json')]);
  if(!file.ok||!expectedFile.ok)throw Error('Private fixtures not available.');
  const expected=await expectedFile.json();
  const bytes=await file.arrayBuffer();
  const imported=await KundolukWorkbook.read(bytes);
  const lessons=imported.sheets[0].lessons;
  if(lessons.length!==expected.length)throw Error('Row count differs');
  lessons.forEach((l,i)=>{for(const key of ['number','sessions','lesson','homework'])if(l[key]!==expected[i][key])throw Error(`Row ${i+2}: ${key} differs`);});
  out.textContent=`PASS: all ${lessons.length} source rows match independent Python extraction character for character, including session counts and empty homework.`;
  const transfer=new DataTransfer();transfer.items.add(new File([bytes],'Biology_Grade_7_Kunduluk.xlsx'));
  const input=document.getElementById('kundoluk-companion').shadowRoot.getElementById('file');
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 }catch(e){out.textContent='FAIL: '+e.message;}
};
modal.addEventListener('change',()=>changes++);
document.getElementById('run').onclick=async()=>{
 const output=document.getElementById('results');const lines=[];
 function ok(v,name){if(!v)throw Error(name);lines.push('PASS '+name);output.textContent=lines.join('\n');}
 async function rejects(fn,name){let rejected=false;try{await fn();}catch{rejected=true;}ok(rejected,name);}
 try{
  const W=KundolukWorkbook,A=KundolukAdapter;
  const text='  Точный текст\nSecond line & <not HTML>\n• Final line  ';
  const sheet=W.fromRows([['№ урока','Количество уроков','План урока','Домашнее задание'],[1,3,text,'Homework\n exact  ']],'Test');
  ok(sheet.lessons[0].lesson===text,'preserves exact multiline lesson text');
  ok(sheet.lessons[0].sessions===3,'three-session count retained');
  await rejects(()=>W.fromRows([['№ урока','Количество уроков','План урока','Домашнее задание'],[1,1.5,'x','']],'Test'),'fractional session count rejected');
  const key=A.context().key;
  const result=await A.fill(key,text,'Homework\n exact  ',false);
  let f=A.fields();ok(f.topic.value===text&&f.homework.value==='Homework\n exact  ','exact filling in both fields');
  ok(changes===2,'application input/change events delivered');
  ok(result.includes('Not saved')&&saves===0,'never automatically saves');
  await rejects(()=>A.fill(key,'Replacement','',false),'existing text protected');
  await A.fill(key,'Replacement','',true);ok(f.homework.value==='Homework\n exact  ','blank homework preserves destination');
  document.querySelector('.info-value').textContent='Geography';
  await rejects(()=>A.fill(key,'WRONG','WRONG',true),'changed subject blocks filling');
  document.querySelector('.info-value').textContent='Биология';
  f.topic.maxLength=3;
  await rejects(()=>A.fill(key,'Too long','',true),'length limit blocks truncation');f.topic.removeAttribute('maxlength');
  const clone=f.topic.cloneNode();modal.append(clone);
  await rejects(()=>A.fill(key,'Ambiguous','',true),'ambiguous visible fields blocked');clone.remove();
  // Test the real ZIP/XML reader, including shared strings and inline strings.
  const zip=new JSZip();
  zip.file('xl/workbook.xml','<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Test" r:id="r1"/></sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/></Relationships>');
  zip.file('xl/sharedStrings.xml','<sst><si><t xml:space="preserve">  Shared\ntext  </t></si></sst>');
  const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
  const cell=(ref,s)=>`<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(s)}</t></is></c>`;
  const header=['№ урока','Количество уроков','План урока','Домашнее задание'].map((h,i)=>cell(String.fromCharCode(65+i)+'1',h)).join('');
  zip.file('xl/worksheets/sheet1.xml',`<worksheet><sheetData><row r="1">${header}</row><row r="2"><c r="A2"><v>1</v></c><c r="B2"><v>3</v></c><c r="C2" t="s"><v>0</v></c>${cell('D2','HW\n  exact')}</row></sheetData></worksheet>`);
  const imported=await W.read(await zip.generateAsync({type:'arraybuffer'}));
  ok(imported.sheets[0].lessons[0].lesson==='  Shared\ntext  ','XLSX shared strings preserve whitespace');
  ok(imported.sheets[0].lessons[0].homework==='HW\n  exact','XLSX inline homework exact');
  ok(imported.sheets[0].lessons[0].sessions===3,'XLSX multiple sessions');
  zip.file('xl/worksheets/sheet1.xml','<worksheet><sheetData><row r="1"><c r="A1"><f>1+1</f><v>2</v></c></row></sheetData></worksheet>');
  await rejects(async()=>W.read(await zip.generateAsync({type:'arraybuffer'})),'formula workbook rejected');
  modal.hidden=true;output.textContent=lines.join('\n')+'\nALL CHECKS PASSED';
 }catch(e){output.textContent=lines.join('\n')+'\nFAIL '+e.message;}
};
