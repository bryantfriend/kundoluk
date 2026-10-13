/* Compact lesson view; setup remains available without changing school data. */
(() => {
 const root=document.getElementById('kundoluk-companion')?.shadowRoot,storage=globalThis.chrome?.storage?.local;
 if(!root||!storage)return;
 const $=id=>root.getElementById(id),panel=$('panel');
 const style=document.createElement('style');style.textContent=`
 #panel.lesson-focused main > :not(#lesson-focus-bar):not(#context):not(#choices):not(#status){display:none!important}
 #panel.lesson-focused #choices > section{display:none!important}
 #panel.lesson-focused #choices > label[for=sheet],#panel.lesson-focused #sheet{display:none!important}
 #lesson-focus-bar{margin-bottom:14px}#lesson-focus-note{font-size:13px;white-space:pre-line}
 #lesson-focus-bar button{padding:7px 12px;border:1px solid #bbcce0;border-radius:7px;background:#f4f8fc;color:#123f71;margin:4px 6px 4px 0}
 `;root.append(style);
 const bar=document.createElement('div');bar.id='lesson-focus-bar';bar.hidden=true;
 const note=document.createElement('p');note.id='lesson-focus-note';note.setAttribute('role','status');
 const manage=document.createElement('button');manage.type='button';manage.textContent='Manage classes';
 const suggest=document.createElement('button');suggest.type='button';suggest.textContent='Use suggested lesson';
 bar.append(note,suggest,manage);root.querySelector('main').prepend(bar);
 let management=false,last='',generation=0;
 function mode(focused){panel.classList.toggle('lesson-focused',focused);manage.textContent=focused?'Manage classes':'Back to current lesson';}
 manage.onclick=()=>{management=!management;mode(!management);if(!management){last='';update();}};
 suggest.onclick=()=>{const button=$('progress-use');if(button&&!button.disabled)button.click();};
 async function update(){
  if(panel.hidden)return;
  const c=KundolukAdapter.context();
  if(!c.ready){bar.hidden=true;mode(false);last='';return;}
  bar.hidden=false;mode(!management);
  suggest.disabled=!$('progress-use')||$('progress-use').disabled;
  if(management)return;
  // Wait until workbook restoration/import has finished.
  if($('file').disabled)return;
  if(last===c.key)return;
  const ticket=++generation;last=c.key;note.textContent='Finding this class’s curriculum…';$('choices').hidden=true;
  try{
   const year=Number(c.date.slice(6))-(Number(c.date.slice(3,5))<9?1:0);
   const id='classPlan:'+JSON.stringify([c.subject.trim(),c.className.trim(),year]);
   const data=await storage.get(null);if(ticket!==generation||management||KundolukAdapter.context().key!==c.key)return;
   const assignment=data[id],entry=assignment&&data[assignment.book];
   if(!entry?.book?.sheets[assignment.sheet]){
    note.textContent=`No curriculum assigned to ${c.subject} · ${c.className}. Open Manage classes to upload or assign one.`;
    $('choices').hidden=true;suggest.disabled=true;return;
   }
   const saved=$('saved');if(![...saved.options].some(o=>o.value===assignment.book)){last='';return;}
   if(saved.value!==assignment.book||$('choices').hidden){saved.value=assignment.book;saved.dispatchEvent(new Event('change'));}
   if($('sheet').value!==String(assignment.sheet)){$('sheet').value=String(assignment.sheet);$('sheet').dispatchEvent(new Event('change'));}
   note.textContent=`Curriculum: ${entry.name}\n${entry.book.sheets[assignment.sheet].name}`;
  }catch(e){last='';note.textContent='Could not load the class curriculum: '+e.message;}
 }
 $('launcher').addEventListener('click',()=>{management=false;last='';update();panel.scrollTop=0;});
 storage && chrome.storage.onChanged.addListener((changes)=>{if(Object.keys(changes).some(k=>k.startsWith('classPlan:')||k.startsWith('lessonPlan:')))last='';});
 setInterval(update,400);
})();
