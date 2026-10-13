/* UI labels only. Lesson text, names, grades and input values are never translated. */
(() => {
 const entries=[
 ['Башкы бет','Home'],['Главная','Home'],['БОП','School curriculum (БОП)'],
 ['Менин классым','My classes'],['Мой класс','My class'],['Мои классы','My classes'],
 ['Журналым','My journals'],['Мои журналы','My journals'],['Менин журналым','My timetable'],['Мой журнал','My timetable'],['Журнал','Journal'],
 ['Классымдын журналы','Class journal'],['Журнал моего класса','Class journal'],
 ['Чейректик баа','Quarter grades'],['Четвертные оценки','Quarter grades'],['Жылдык баа','Annual grades'],['Годовые оценки','Annual grades'],
 ['Көчүрүү экзамен','Promotion exam'],['Переводной экзамен','Promotion exam'],['Мамлекеттик экзамен','State exam'],['Государственный экзамен','State exam'],
 ['Чейректик/Жылдык баа (Вакант)','Quarter / annual grades (vacant post)'],['Журнал/Чейрек','Journal / quarter'],['Журнал/Четверть','Journal / quarter'],
 ['Чейрек Отчет','Quarter reports'],['Четвертной отчет','Quarter reports'],['Аттестат','School certificate'],['Эскертмелер','Notices'],['Уведомления','Notifications'],
 ['Портфолио','Portfolio'],['Класстын подгруппасы','Class subgroups'],['Подгруппы класса','Class subgroups'],['Физикалык нормативдер','Physical fitness standards'],['Физические нормативы','Physical fitness standards'],
 ['Ден соолук','Health'],['Здоровье','Health'],['Окуу китептери','Textbooks'],['Учебники','Textbooks'],['Окуучулар','Students'],['Ученики','Students'],['Учащиеся','Students'],
 ['Жылдык окуу табели','Annual school report'],['Годовой табель','Annual school report'],
 ['Артка','Back'],['Назад','Back'],['Баа коюу','Enter grades'],['Выставить оценки','Enter grades'],
 ['Тема жана Тапшырма','Topic and homework'],['Тема и задание','Topic and homework'],['Тема и домашнее задание','Topic and homework'],
 ['Темалар жана тапшырмалардын тизмеси','Topics and homework list'],['Список тем и заданий','Topics and homework list'],
 ['Сактоо','Save'],['Сохранить','Save'],['Баарын сактоо','Save all'],['Сохранить все','Save all'],['Жокко чыгаруу','Cancel'],['Отмена','Cancel'],
 ['Кошуу','Add'],['Добавить','Add'],['Изменить','Edit'],['Редактировать','Edit'],['Удалить','Delete'],['Закрыть','Close'],['Жабуу','Close'],
 ['Настройки','Settings'],['Выход','Sign out'],['Печать','Print'],['Обновить','Refresh'],['Поиск','Search']
 ];
 const normalize=s=>s.replace(/\s+/g,' ').trim().toLocaleLowerCase();
 const dictionary=new Map([...entries,...(globalThis.KundolukUILabels||[])].map(([a,b])=>[normalize(a),b]));
 const translate=s=>dictionary.get(normalize(s)) || (/^Базисный учебный план\s+\d{2}\/\d{2}$/i.test(s.trim())?'Basic curriculum '+s.trim().match(/\d{2}\/\d{2}$/)[0]:undefined) || (/^(Ученики|Окуучулар)\s*\(\d+\)$/i.test(s.trim())?'Students '+s.trim().match(/\(\d+\)$/)[0]:undefined) || (/^(Кол\.|Саны)\s*:\s*\d+$/i.test(s.trim())?'Count: '+s.match(/\d+$/)[0]:undefined);
 const originals=new Map(),titles=new Map();let enabled=true;
 function originalText(element){return [...element.childNodes].map(n=>n.nodeType===3?(originals.get(n)?.original??n.textContent):originalText(n)).join('');}
 globalThis.KundolukEnglish={translate,originalText};
 const selector='button,a,[role="button"],[role="treeitem"],[role="menuitem"],.dx-menu-item,h1,h2,h3,h4,h5,h6,th,[role="columnheader"],.dx-datagrid-group-panel,.dx-group-panel-message,.dx-datagrid-summary-item,.info-label,label,[role="option"],div,span,strong,small';
 function apply(){
  observer.disconnect();
  for(const [node,record] of originals){if(!node.isConnected){originals.delete(node);continue;}if(node.textContent!==record.translated){originals.delete(node);continue;}if(!enabled){node.textContent=record.original;originals.delete(node);}}
  for(const [el,old] of titles){if(!el.isConnected){titles.delete(el);continue;}if(!enabled){if(old===null)el.removeAttribute('title');else el.setAttribute('title',old);titles.delete(el);}}
  if(enabled)for(const el of document.querySelectorAll(selector)){
   if(el.closest('[contenteditable="true"],textarea,input,select'))continue;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
   while((node=walker.nextNode())){
    if(originals.has(node)||node.parentElement?.closest('textarea,input,select,[contenteditable="true"]'))continue;
    // Plain layout wrappers contribute only their direct labels, never descendant records.
    if(['DIV','SPAN','STRONG','SMALL'].includes(el.tagName)&&node.parentElement!==el)continue;
    if(node.parentElement?.closest('.info-value,td:not([role="columnheader"]),[role="gridcell"],script,style,pre,code'))continue;
    const english=translate(node.textContent);if(!english)continue;
    const original=node.textContent,translated=original.replace(original.trim(),english);
    originals.set(node,{original,translated});node.textContent=translated;
    const parent=node.parentElement;if(!titles.has(parent))titles.set(parent,parent.getAttribute('title'));parent.setAttribute('title',original.trim());
   }
  }
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
 }
 let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply();},80);});
 const root=document.getElementById('kundoluk-companion')?.shadowRoot;
 if(root){const label=document.createElement('label');label.className='check';const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=true;label.append(toggle,document.createTextNode('English menus (hover for original labels)'));root.querySelector('main').prepend(label);
  toggle.onchange=()=>{enabled=toggle.checked;apply();globalThis.chrome?.storage?.local.set({englishMenus:enabled}).catch(()=>{});};
  globalThis.chrome?.storage?.local.get('englishMenus').then(value=>{enabled=value.englishMenus!==false;toggle.checked=enabled;apply();}).catch(()=>{});
 }
 apply();
})();
