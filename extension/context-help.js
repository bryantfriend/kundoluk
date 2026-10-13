/* Floating help buttons do not modify native menu or table click targets. */
(() => {
 const host=document.createElement('div');host.id='kundoluk-context-help';document.documentElement.append(host);const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>:host{font:14px/1.5 system-ui;color:#172b46}button{cursor:pointer;font:inherit}.help{position:fixed;width:19px;height:19px;border-radius:50%;border:1px solid #476f9c;background:#fff;color:#164776;padding:0;font-weight:bold;z-index:2147482998}dialog{max-width:min(480px,90vw);border:1px solid #adc1d8;border-radius:14px;padding:24px;color:#172b46;font:16px/1.6 system-ui}dialog::backdrop{background:#142b4666}h2{font-size:20px;margin-top:0}.close{padding:8px 18px}p{white-space:pre-line}</style><dialog aria-labelledby="help-title"><h2 id="help-title"></h2><p id="help-body"></p><button class="close">Close</button></dialog>`;
 const dialog=root.querySelector('dialog');let previous=null;
 root.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>previous?.isConnected&&previous.focus());
 function show(button,title,text){previous=button;root.querySelector('h2').textContent=title;root.querySelector('p').textContent=text;if(!dialog.open)dialog.showModal();}
 const badges=new Map();
 function refresh(){
  const seen=new Set(),english=globalThis.KundolukEnglish;if(!english)return;
  for(const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,th,[role="columnheader"],.info-label,.dx-group-panel-message,button,a,[role="menuitem"],.dx-treeview-item-content,label,strong,small,span,div')){
   const original=english.originalText(el).replace(/[\uE000-\uF8FF]/g,'').trim(),title=english.translate(original)||original;
   if(el.closest('.info-value,td:not([role="columnheader"]),[role="gridcell"],input,textarea,select'))continue;
   const help=globalThis.KundolukUIHelp[title] || (/^Students \(\d+\)$/.test(title)?globalThis.KundolukUIHelp.Students:null);if(!help)continue;
   const rect=el.getBoundingClientRect();if(rect.height>100)continue;if(!rect.width||!rect.height||rect.bottom<0||rect.top>innerHeight||getComputedStyle(el).visibility==='hidden')continue;
   // Avoid nested duplicate targets, and keep help outside the native click handler.
   if([...seen].some(other=>other.contains(el)||el.contains(other)))continue;
   seen.add(el);let button=badges.get(el);if(!button){button=document.createElement('button');button.className='help';button.textContent='?';button.setAttribute('aria-label','Help: '+title);button.title='Help: '+title;button.onclick=()=>show(button,title,help);root.append(button);badges.set(el,button);}
   button.style.left=Math.min(innerWidth-22,Math.max(0,rect.right-18))+'px';button.style.top=Math.max(0,rect.top+1)+'px';
  }
  for(const [el,button] of badges)if(!seen.has(el)){button.remove();badges.delete(el);}
 }
 setInterval(refresh,700);addEventListener('scroll',refresh,true);addEventListener('resize',refresh);refresh();
})();
