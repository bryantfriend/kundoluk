(() => {
 const root=document.getElementById('kundoluk-companion')?.shadowRoot;
 if(!root||!globalThis.chrome?.storage?.local)return;
 const $=id=>root.getElementById(id),storage=chrome.storage.local,P=KundolukProgress;
 const box=document.createElement('section');
 box.innerHTML=`<hr><h3>Lesson progress</h3><p>Start lesson 1 on the first scheduled date for this class.</p><p class="muted">Open Kundoluk’s “Темалар жана тапшырмалардын тизмеси” (topics and homework list) for the full school year, then capture it below. Check that its first date is your first scheduled teaching date.</p><button id="progress-schedule">Use displayed dates as this class’s schedule</button><p id="progress-message" role="status"></p><button id="progress-use">Select suggested lesson</button> <button id="progress-plan">Plan selected lesson</button><label class="check"><input type="checkbox" id="progress-confirm">I reopened this lesson in Kundoluk and verified the selected topic/homework was saved.</label><button id="progress-posted">Record as posted</button> <button id="progress-remove">Clear this date’s record</button><p class="muted">Tracks each subject/class and school year separately. Posted means confirmed by you. Filling a form never marks it posted. Captured schedule dates take priority over manual progress. Each listed date consumes one session of your plan; refresh the capture after timetable changes. Existing saved topics are never overwritten automatically.</p><details><summary>Recorded dates for this class and workbook</summary><div id="progress-history"></div></details>`;
 $('choices').prepend(box);
 let books={},records=[],result=null,signature='',loading=true;
 function selection(){const c=KundolukAdapter.context(),book=$('saved').value,sheet=Number($('sheet').value);return {c,book,sheet,plan:books[book]?.book?.sheets[sheet]};}
 async function reload(){const all=await storage.get(null);books=all;records=Object.entries(all).filter(([k])=>k.startsWith('lessonProgress:')).map(([,v])=>v);loading=false;signature='';render();}
 function render(){
  const {c,book,sheet,plan}=selection();
  const sig=JSON.stringify([c.key,book,sheet,loading,records]);if(sig===signature)return;signature=sig;$('progress-confirm').checked=false;
  const ready=!loading&&c.ready&&!!plan;
  const schedule=books['lessonSchedule:'+P.course(c)];
  result=ready?(schedule?.book===book&&schedule.sheet===sheet?P.scheduled(schedule.rows,c,plan):P.suggest(records,c,book,sheet,plan)):null;
  $('progress-schedule').disabled=!ready;
  $('progress-message').textContent=result?.reason||'Open a lesson card and select its saved workbook and worksheet.';
  if(result?.record){const r=result.record,l=plan.lessons[r.lesson];$('progress-message').textContent+=` Lesson ${l?.number||r.lesson+1}, session ${r.session}: ${l?.lesson.slice(0,100)||''}`;}
  $('progress-use').disabled=!result?.record;
  $('progress-plan').disabled=!ready;$('progress-posted').disabled=true;$('progress-remove').disabled=!ready;
  const history=$('progress-history');history.replaceChildren();
  if(ready)for(const r of records.filter(r=>r.course===P.course(c)&&r.book===book&&r.sheet===sheet).sort((a,b)=>P.day(a.date).localeCompare(P.day(b.date)))){const line=document.createElement('p');line.textContent=`${r.date} · ${r.period} · Lesson ${plan.lessons[r.lesson]?.number||r.lesson+1}, session ${r.session} — ${r.state==='posted'?'confirmed posted':'planned'}`;history.append(line);}
 }
 $('progress-schedule').onclick=async()=>{
  const {c,book,sheet}=selection();if(!c.ready)return;
  try{
   const dialogs=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length&&(globalThis.KundolukEnglish?.originalText(e) ?? e.textContent).includes('Темалар жана тапшырмалардын тизмеси'));
   if(dialogs.length!==1)throw Error('Open the topics and homework list for this class first.');
   const tables=[...dialogs[0].querySelectorAll('table')].filter(t=>['Күнү','Тема','Тапшырма'].every(label=>(globalThis.KundolukEnglish?.originalText(t) ?? t.textContent).includes(label)));
   if(tables.length!==1)throw Error('Could not identify a complete topic table.');
   const rows=[...tables[0].querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.textContent.trim())).filter(cells=>cells.length===4).map(cells=>({date:cells[1],topic:cells[2],homework:cells[3]}));
   if(!rows.length||rows.some(r=>!P.day(r.date)||P.course({...c,date:r.date})!==P.course(c)))throw Error('Choose the current full school year; dates are missing or belong to another year.');
   if(KundolukAdapter.context().key!==c.key)throw Error('Class or date changed; try again.');
   await storage.set({['lessonSchedule:'+P.course(c)]:{book,sheet,rows}});await reload();
  }catch(e){$('progress-message').textContent=e.message;}
 };
 function key(c){return 'lessonProgress:'+JSON.stringify([P.course(c),c.date,c.period]);}
 async function record(state){
  const {c,book,sheet,plan}=selection();if(!c.ready||!plan)return;
  const lesson=Number($('lesson').value),session=Number($('session').value);
  if(state==='posted'&&!$('progress-confirm').checked)return;
  if(!plan.lessons[lesson]||session<1||session>plan.lessons[lesson].sessions)return;
  try{await storage.set({[key(c)]:{course:P.course(c),date:c.date,period:c.period,book,sheet,lesson,session,state}});await reload();}
  catch(e){$('progress-message').textContent=`Progress was not saved: ${e.message}`;}
 }
 $('progress-use').onclick=()=>{const r=result?.record;if(!r)return;$('lesson').value=r.lesson;$('lesson').dispatchEvent(new Event('change'));$('session').value=r.session;$('session').dispatchEvent(new Event('change'));$('progress-confirm').checked=false;$('progress-posted').disabled=true;};
 $('progress-plan').onclick=()=>record('planned');$('progress-posted').onclick=()=>record('posted');
 $('progress-confirm').onchange=()=>{$('progress-posted').disabled=!$('progress-confirm').checked||!KundolukAdapter.context().ready;};
 $('progress-remove').onclick=async()=>{const {c}=selection();if(!c.ready)return;try{await storage.remove(key(c));await reload();}catch(e){$('progress-message').textContent=e.message;}};
 for(const id of ['lesson','session','saved','sheet'])$(id).addEventListener('change',()=>{$('progress-confirm').checked=false;$('progress-posted').disabled=true;signature='';render();});
 chrome.storage.onChanged.addListener(()=>{reload().catch(e=>{$('progress-message').textContent=e.message;});});
 reload().catch(e=>{$('progress-message').textContent=`Could not load progress: ${e.message}`;});setInterval(render,1000);
})();
