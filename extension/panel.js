(() => {
  if(document.getElementById('kundoluk-companion')) return;
  const host=document.createElement('div'); host.id='kundoluk-companion';
  document.documentElement.append(host);
  const root=host.attachShadow({mode:'open'});
  KundolukEventBoundary.install(root);
  root.innerHTML=`<style>
  :host{all:initial;position:fixed;right:18px;bottom:18px;z-index:2147483000;font:14px/1.5 system-ui,sans-serif;color:#172b46}
  *{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:default}
  #launcher{background:#123f71;color:white;border:0;border-radius:28px;padding:13px 22px;box-shadow:0 5px 24px #172b4640;font-weight:650}
  #panel{width:min(440px,calc(100vw - 36px));max-height:calc(100vh - 36px);overflow:auto;background:#fff;border:1px solid #d4deea;border-radius:18px;box-shadow:0 12px 55px #172b4640}
  header{padding:18px 22px;background:#123f71;color:#fff;display:flex;align-items:center;justify-content:space-between}h2{font-size:18px;margin:0}header p{margin:3px 0 0;color:#c7ddf6;font-size:12px}
  #close{background:none;border:0;color:white;font-size:24px}main{padding:20px}label{display:block;font-weight:600;margin:14px 0 6px}select,input[type=file]{width:100%;padding:9px;border:1px solid #c8d4e2;border-radius:8px;background:white}
  .context{padding:12px 14px;background:#eff5fc;border-radius:9px;white-space:pre-line}.muted{color:#64758a;font-size:12px}p{margin:8px 0}textarea{width:100%;resize:vertical;min-height:130px;padding:12px;border:1px solid #c8d4e2;border-radius:8px;line-height:1.55;color:#24374d;background:#fafcff}
  #homework{min-height:70px}.check{display:flex;gap:9px;align-items:flex-start;font-size:13px;font-weight:400}.check input{margin-top:4px}#fill{width:100%;padding:12px;background:#126c62;color:white;border:0;border-radius:9px;margin-top:15px;font-weight:650}
  #status{white-space:pre-wrap;border-left:3px solid #8aaaca;padding:8px 12px;background:#f2f6fa;font-size:13px}#status.error{border-color:#b84b28;background:#fff3ed;color:#873819}#forget{border:0;background:none;color:#5a6d82;text-decoration:underline;font-size:12px;padding:8px 0}
  [hidden]{display:none!important}:focus-visible{outline:3px solid #eead36;outline-offset:2px}
  </style>
  <button id="launcher">Lesson companion</button>
  <section id="panel" hidden aria-label="English lesson companion"><header><div><h2>Lesson companion</h2><p>Exact lesson blocks · English controls</p></div><button id="close" aria-label="Minimize companion">×</button></header>
  <main><details id="student-access"><summary style="cursor:pointer;font-weight:650;padding:10px 0">Student access — PIN / password help</summary>
  <p>For a forgotten login code, look for <b>password reset</b>. A field named <b>ПИН</b> may be a personal identification number; do not change it to reset a password.</p>
  <p><b>Open the student roster:</b> Open the ☰ menu, expand <b>Менин классым / Мои классы (My classes)</b>, then choose the child item with the same name. Right-click your class row and choose <b>Окуучулар (Students)</b>. Double-clicking the class opens its annual report instead.</p>
  <p class="muted">Verified on October 1, 2026: this teacher account can open the roster, but no student reset control was visible there. The reset route is still unverified. Ask the school’s Kundoluk administrator where student login resets are available for your role. The header password button is for your own account.</p>
  <p>The translations below describe recognized visible labels; they do not confirm that a control belongs to a student.</p>
  <button id="scan-access" type="button">Translate visible access controls</button><div id="access-labels" role="status"></div>
  <p>You enter any new credential and complete the reset in Kundoluk yourself. The companion does not read, store or submit passwords or PINs.</p></details>
  <hr style="border:0;border-top:1px solid #d4deea;margin:14px 0">
  <div id="context" class="context"></div><p class="muted">Open the intended lesson in Kundoluk before filling.</p>
  <label for="saved">Saved workbooks</label><select id="saved" disabled></select><p class="muted">Kept in this Chrome profile between visits. New imports keep your existing plans.</p>
  <label for="file">Add lesson-plan workbook</label><input id="file" type="file" accept=".xlsx"><p class="muted">Processed locally. Text and line breaks stay unchanged.</p>
  <div id="choices" hidden><label for="sheet">Worksheet</label><select id="sheet"></select><label for="lesson">Lesson block</label><select id="lesson"></select><label for="session">Session of this lesson</label><select id="session"></select><p class="muted">For a lesson spanning multiple sessions, select each session on its intended class date. The full block stays identical; nothing is automatically advanced or scheduled.</p>
  <label for="topic">Lesson / topic — exact cell text</label><textarea id="topic" readonly></textarea><label for="homework">Homework — exact cell text</label><textarea id="homework" readonly></textarea><p id="blank" class="muted"></p>
  <label class="check"><input id="confirm" type="checkbox"><span>I checked that this workbook, lesson and session belong to the subject, class and date shown above.</span></label>
  <label class="check"><input id="replace" type="checkbox"><span>Allow replacing existing topic/homework text in the form. Blank homework cells still leave existing homework untouched.</span></label>
  <button id="fill" disabled>Fill current lesson — do not save</button></div>
  <p id="status" role="status">Loading saved plans…</p><button id="forget">Remove selected saved workbook</button></main></section>`;
  const $=id=>root.getElementById(id);
  $('scan-access').onclick=()=>{
    const entries=globalThis.KundolukStudentAccess?.labels() || [];
    const target=$('access-labels');target.replaceChildren();
    if(!entries.length){target.textContent='No recognized access labels are visible. Open the class/student menu and try again.';return;}
    for(const [original,english] of entries){const line=document.createElement('p');line.textContent=`${original} → ${english}`;target.append(line);}
  };
  let book=null, current=null, contextKey='',busy=true,entries=[];
  const storage=globalThis.chrome?.storage?.local;
  const library=KundolukLibrary.create(storage);
  globalThis.chrome?.storage?.onChanged?.addListener((changes,area)=>{
    if(area!=='local'||busy||!Object.keys(changes).some(k=>k.startsWith('lessonPlan:')))return;
    const selected=$('saved').value;
    library.list().then(saved=>{if(busy)return;entries=saved;renderLibrary(selected);enable();}).catch(e=>status(e.message,true));
  });
  function renderLibrary(selected){
    options($('saved'),entries.map(e=>[e.id,e.name]));
    if(entries.some(e=>e.id===selected))$('saved').value=selected;
    const entry=entries.find(e=>e.id===$('saved').value);
    if(entry)load(entry.book);
    else {book=null;current=null;$('choices').hidden=true;reset();}
  }
  function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
  function reset(){ $('confirm').checked=false;$('replace').checked=false; enable(); }
  function enable(){ $('file').disabled=busy;$('saved').disabled=busy||!entries.length;$('forget').disabled=busy||!entries.length;$('fill').disabled=busy||!current||!KundolukAdapter.context().ready||!$('confirm').checked; }
  function options(select,items){select.replaceChildren(...items.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));}
  function chooseLesson(){
    current=book.sheets[Number($('sheet').value)].lessons[Number($('lesson').value)];
    options($('session'),Array.from({length:current.sessions},(_,i)=>[i+1,`Session ${i+1} of ${current.sessions}`]));
    $('topic').value=current.lesson;$('homework').value=current.homework;
    $('blank').textContent=current.homework===''?'No homework in this cell. Existing homework will be left unchanged.':'';
    reset();status(`Source row ${current.row}. Preview is read-only to preserve the spreadsheet text.`);
  }
  function chooseSheet(){const sheet=book.sheets[Number($('sheet').value)]; options($('lesson'),sheet.lessons.map((l,i)=>[i,`${l.number || l.row} · ${l.lesson.slice(0,65)}${l.lesson.length>65?'…':''}`]));chooseLesson();}
  function load(value){book=value;options($('sheet'),book.sheets.map((s,i)=>[i,s.name]));$('choices').hidden=false;chooseSheet();}
  function refresh(){const c=KundolukAdapter.context();if(c.key!==contextKey){contextKey=c.key;reset();}$('context').textContent=c.ready?`${c.subject} · ${c.className}\n${c.date} · ${c.period}`:`Lesson details not detected: ${(c.missing||[]).join(', ')}. Open a lesson card or refresh this page.`;enable();}
  $('launcher').onclick=()=>{$('launcher').hidden=true;$('panel').hidden=false;refresh();};
  $('close').onclick=()=>{$('panel').hidden=true;$('launcher').hidden=false;};
  $('sheet').onchange=chooseSheet;$('lesson').onchange=chooseLesson;$('session').onchange=reset;$('confirm').onchange=enable;
  $('file').onchange=async()=>{
    const file=$('file').files[0];if(!file||busy)return;busy=true;enable();status('Reading and saving workbook…');
    try{const parsed=await KundolukWorkbook.read(await file.arrayBuffer());const entry=await library.add(file.name,parsed);entries.push(entry);renderLibrary(entry.id);status(`Saved ${file.name}. Choose it from Saved workbooks on your next visit.`);}
    catch(e){status(`Could not save workbook: ${e.message}. Existing saved plans are unchanged.`,true);}
    finally{busy=false;$('file').value='';enable();}
  };
  $('saved').onchange=()=>{const entry=entries.find(e=>e.id===$('saved').value);if(entry)load(entry.book);};
  $('forget').onclick=async()=>{
    if(busy||!entries.length)return;const id=$('saved').value;busy=true;enable();
    try{await library.remove(id);entries=entries.filter(e=>e.id!==id);renderLibrary();status('Selected workbook removed. Other saved plans are unchanged.');}
    catch(e){status(`Could not remove workbook: ${e.message}`,true);}
    finally{busy=false;enable();}
  };
  $('fill').onclick=async()=>{
    if($('fill').disabled)return;
    const expected=contextKey,block=current;busy=true;enable();
    try{const result=await KundolukAdapter.fill(expected,block.lesson,block.homework,$('replace').checked);status(result);$('confirm').checked=false;}
    catch(e){status(e.message,true);}finally{busy=false;enable();}
  };
  refresh();setInterval(refresh,1000);
  library.list().then(saved=>{entries=saved;renderLibrary();status(entries.length?`Restored ${entries.length} saved workbook(s). Choose one above.`:'Import a workbook once to add it to your saved library.');}).catch(e=>status(`Could not restore saved plans: ${e.message}`,true)).finally(()=>{busy=false;enable();});
})();
