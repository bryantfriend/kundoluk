(() => {
 function fit(value,vw,vh){
  const maxW=Math.max(1,vw-16),maxH=Math.max(1,vh-16);
  const width=Math.min(maxW,Math.max(Math.min(300,maxW),Number.isFinite(value.width)?value.width:360));
  const height=Math.min(maxH,Math.max(Math.min(240,maxH),Number.isFinite(value.height)?value.height:460));
  return {width,height,x:Math.max(8,Math.min(vw-width-8,Number.isFinite(value.x)?value.x:vw-width-18)),y:Math.max(8,Math.min(vh-height-8,Number.isFinite(value.y)?value.y:vh-height-18))};
 }
 globalThis.KundolukWindow={fit};
 const host=document.getElementById('kundoluk-companion'),root=host?.shadowRoot;if(!root)return;
 const panel=root.getElementById('panel'),header=root.querySelector('header'),storage=globalThis.chrome?.storage?.local;
 const style=document.createElement('style');style.textContent=`
 #panel{display:flex;flex-direction:column;width:360px;height:460px;min-width:0;max-height:none;overflow:hidden;border-radius:12px}
 #panel header{flex:none;padding:10px 12px;cursor:move;touch-action:none;user-select:none}
 #panel header h2{font-size:16px}#panel header p{display:none}
 #panel main{flex:1;min-height:0;overflow:auto;padding:12px}
 #panel textarea{min-height:95px}#panel #homework{min-height:60px}
 #window-footer{flex:none;display:flex;justify-content:space-between;align-items:center;padding:3px 8px;border-top:1px solid #d4deea;background:#f5f8fc;font-size:11px}
 #window-reset{border:0;background:none;color:#123f71;font-size:11px;padding:4px}
 #window-resize{cursor:nwse-resize;touch-action:none;border:0;background:none;font-size:20px;color:#123f71;width:30px;height:27px}
 `;root.append(style);
 const footer=document.createElement('div');footer.id='window-footer';
 const reset=document.createElement('button');reset.id='window-reset';reset.textContent='Reset size / position';
 const grip=document.createElement('button');grip.id='window-resize';grip.textContent='◢';grip.setAttribute('aria-label','Resize companion; drag or use arrow keys');
 footer.append(reset,document.createTextNode('Drag header to move'),grip);panel.append(footer);
 header.tabIndex=0;header.setAttribute('aria-label','Move companion: drag or use arrow keys');
 let geometry=fit({},innerWidth,innerHeight),gesture=null,changed=false;
 function apply(){geometry=fit(geometry,innerWidth,innerHeight);panel.style.width=geometry.width+'px';panel.style.height=geometry.height+'px';
  if(panel.hidden){host.style.left='auto';host.style.top='auto';host.style.right='18px';host.style.bottom='18px';}
  else{host.style.left=geometry.x+'px';host.style.top=geometry.y+'px';host.style.right='auto';host.style.bottom='auto';}
 }
 function save(){changed=true;storage?.set({companionWindow:geometry}).catch(()=>{});}
 function start(e,kind){if(e.button!==0||(kind==='move'&&e.target.closest('button')))return;e.preventDefault();changed=true;gesture={kind,x:e.clientX,y:e.clientY,initial:{...geometry},id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}
 function move(e){if(!gesture||gesture.id!==e.pointerId)return;const {initial,kind,x,y}=gesture,dx=e.clientX-x,dy=e.clientY-y;geometry=kind==='move'?{...initial,x:initial.x+dx,y:initial.y+dy}:{...initial,width:initial.width+dx,height:initial.height+dy};apply();}
 function stop(e){if(gesture?.id!==e.pointerId)return;gesture=null;save();}
 for(const [el,kind] of [[header,'move'],[grip,'resize']]){el.addEventListener('pointerdown',e=>start(e,kind));el.addEventListener('pointermove',move);el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);el.addEventListener('keydown',e=>{if(e.target!==el||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const amount=e.shiftKey?30:10,delta={ArrowLeft:[-amount,0],ArrowRight:[amount,0],ArrowUp:[0,-amount],ArrowDown:[0,amount]}[e.key];if(kind==='move'){geometry.x+=delta[0];geometry.y+=delta[1];}else{geometry.width+=delta[0];geometry.height+=delta[1];}apply();save();});}
 reset.onclick=()=>{geometry=fit({},innerWidth,innerHeight);apply();save();};
 new MutationObserver(apply).observe(panel,{attributes:true,attributeFilter:['hidden']});
 addEventListener('resize',()=>{apply();});
 storage?.get('companionWindow').then(data=>{if(!changed&&data.companionWindow&&typeof data.companionWindow==='object')geometry=fit(data.companionWindow,innerWidth,innerHeight);apply();}).catch(()=>{});
 apply();
})();
