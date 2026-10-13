(() => {
 const root=document.getElementById('kundoluk-companion')?.shadowRoot,storage=globalThis.chrome?.storage?.local;
 if(!root||!storage)return;
 const panel=document.createElement('details');panel.open=true;
 panel.innerHTML=`<summary><b>My classes and lesson plans</b></summary><p class="muted">Plans stay on file in this Chrome profile. Each subject/class has its own assignment.</p><label>School year <input id="class-year" type="number" min="2020" max="2100"></label><button id="class-scan">Add classes from this screen</button><p class="muted">Scan each timetable week to include classes not shown this week, or add a class below.</p><label>Subject <input id="class-subject" placeholder="Geography"></label><label>Class <input id="class-name" placeholder="7A - Year"></label><button id="class-add">Add class</button><p id="class-setup" role="status"></p><p id="class-status" role="status"></p><div id="class-list"></div>`;
 root.querySelector('main').prepend(panel);
 const $=id=>panel.querySelector('#'+id),library=KundolukLibrary.create(storage);
 const now=new Date();$('class-year').value=now.getFullYear()-(now.getMonth()<8?1:0);
 const key=(subject,className,year)=>'classPlan:'+JSON.stringify([subject.trim(),className.trim(),Number(year)]);
 let busy=false,revision=0,last='',setup=false;
 async function add(subject,className){
  const year=Number($('class-year').value);
  if(!subject.trim()||!className.trim()||!Number.isInteger(year)||year<2020||year>2100)throw Error('Enter a subject, class and valid school year.');
  const id=key(subject,className,year),old=await storage.get(id);
  if(!old[id])await storage.set({[id]:{subject:subject.trim(),className:className.trim(),year}});
 }
 async function render(){
  const rev=++revision,all=await storage.get(null),books=await library.list();if(rev!==revision)return;
  const rows=Object.entries(all).filter(([k,c])=>k.startsWith('classPlan:')&&c.year===Number($('class-year').value));
  const list=$('class-list');list.replaceChildren();
 const missing=rows.filter(([,c])=>!books.some(b=>b.id===c.book&&b.book.sheets[c.sheet]));
 $('class-setup').textContent=setup?(missing.length?'Upload a curriculum for each class below, or choose a saved workbook. Reuse the same workbook for other classes if appropriate.':'Setup complete: every listed class has a curriculum on file.'):'Click Add classes from this screen to begin.';
  $('class-status').textContent=`${rows.length} subject/class assignments. ${rows.filter(([,c])=>books.some(b=>b.id===c.book&&b.book.sheets[c.sheet])).length} have a plan on file.`;
  for(const [id,c] of rows.sort((a,b)=>(a[1].subject+a[1].className).localeCompare(b[1].subject+b[1].className))){
   const card=document.createElement('div');card.className='context';card.style.marginTop='12px';
   const title=document.createElement('strong');title.textContent=`${c.subject} · ${c.className}`;card.append(title);
   const label=document.createElement('p');const assigned=books.find(b=>b.id===c.book);label.textContent=assigned?.book.sheets[c.sheet]?`Curriculum loaded: ${assigned.name} / ${assigned.book.sheets[c.sheet].name} · ${assigned.book.sheets[c.sheet].lessons.length} lesson blocks`:'Curriculum needed — upload below';card.append(label);
   const warnings=assigned?.book.sheets[c.sheet]?.warnings||[];
   if(warnings.length){const warning=document.createElement('p');warning.textContent=`Import completed with ${warnings.length} notes about skipped rows or inferred session counts. Review details below.`;warning.style.color='#873819';card.append(warning);const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Show import notes';details.append(summary);for(const text of warnings){const row=document.createElement('p');row.textContent=text;details.append(row);}card.append(details);}
   const select=document.createElement('select');select.setAttribute('aria-label','Workbook for '+title.textContent);select.append(new Option('Choose saved workbook',''));for(const b of books)select.append(new Option(b.name,b.id));select.value=assigned?c.book:'';card.append(select);
   const sheets=document.createElement('select');sheets.setAttribute('aria-label','Worksheet for '+title.textContent);card.append(sheets);
   function choices(){sheets.replaceChildren();const b=books.find(b=>b.id===select.value);b?.book.sheets.forEach((s,i)=>sheets.append(new Option(s.name,String(i))));if(b?.id===c.book)sheets.value=String(c.sheet);}
   select.onchange=choices;choices();
   const save=document.createElement('button');save.textContent='Assign saved plan';save.onclick=()=>run(async()=>{if(!select.value||!sheets.value)throw Error('Choose a workbook and worksheet.');await storage.set({[id]:{...c,book:select.value,sheet:Number(sheets.value)}});});card.append(save);
   const upload=document.createElement('input');upload.type='file';upload.accept='.xlsx';upload.setAttribute('aria-label','Upload plan for '+title.textContent);upload.onchange=()=>{const file=upload.files[0];upload.value='';if(!file)return;return run(async()=>{const parsed=await KundolukWorkbook.read(await file.arrayBuffer());const b=await library.add(file.name,parsed);await storage.set({[id]:{...c,book:b.id,sheet:0}});});};card.append(upload);
   const uploadButton=document.createElement('button');uploadButton.textContent=assigned?'Replace curriculum…':'Upload curriculum…';uploadButton.onclick=()=>upload.click();upload.hidden=true;card.insertBefore(uploadButton,upload);
 const hint=document.createElement('p');hint.className='muted';hint.textContent='Upload saves and assigns the first worksheet. Select a different worksheet above if needed.';card.append(hint);list.append(card);
  }
 }
 async function run(fn){if(busy)return;busy=true;panel.querySelectorAll('button,input,select').forEach(e=>e.disabled=true);try{await fn();await render();if(setup)$('class-setup').scrollIntoView({block:'nearest'});}catch(e){$('class-status').textContent='Not saved: '+e.message;$('class-status').scrollIntoView({block:'nearest'});}finally{busy=false;panel.querySelectorAll('button,input,select').forEach(e=>e.disabled=false);}}
 $('class-add').onclick=()=>run(()=>add($('class-subject').value,$('class-name').value));$('class-year').onchange=()=>render();
 $('class-scan').onclick=()=>run(async()=>{
  if(!location.pathname.endsWith('/journalschedule'))throw Error('Open My journal’s weekly timetable first.');
  const candidates=[...document.querySelectorAll('div')].filter(e=>e.getClientRects().length&&e.children.length<=6).map(e=>e.innerText||'');
  const found=KundolukClassScan.parseCards(candidates);
  if(!found.length)throw Error('No class cards recognized. Open the weekly timetable, or add the subject/class names manually below.');
  for(const {subject,className} of found)await add(subject,className);
  setup=true;panel.open=true;
 });
 storage.get(null).then(()=>render()).catch(e=>$('class-status').textContent=e.message);
 chrome.storage.onChanged.addListener((changes)=>{if(!Object.keys(changes).some(k=>k.startsWith('classPlan:')||k.startsWith('lessonPlan:')))return;if(Object.keys(changes).some(k=>k.startsWith('classPlan:')||k.startsWith('lessonPlan:')))last='';if(!busy)render().catch(e=>$('class-status').textContent=e.message);});
 setInterval(async()=>{const c=KundolukAdapter.context();if(!c.ready||c.key===last)return;last=c.key;const year=Number(c.date.slice(6))-(Number(c.date.slice(3,5))<9?1:0);try{
  const id=key(c.subject,c.className,year),all=await storage.get(null),assignment=all[id];
  if(!assignment){await storage.set({[id]:{subject:c.subject,className:c.className,year}});return;}
  const saved=root.getElementById('saved');if(!all[assignment.book]||![...saved.options].some(o=>o.value===assignment.book))return;
  saved.value=assignment.book;saved.dispatchEvent(new Event('change'));const sheet=root.getElementById('sheet');sheet.value=String(assignment.sheet);sheet.dispatchEvent(new Event('change'));
 }catch(e){$('class-status').textContent=e.message;}},1200);
})();
