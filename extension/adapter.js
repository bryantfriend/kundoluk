(() => {
  const visible = e => !!e && e.getClientRects().length>0 && getComputedStyle(e).visibility !== 'hidden';
  const norm = s => s.replace(/\s+/g,' ').trim().toLowerCase();
  function context() {
    const out = {subject:'',className:'',date:'',period:''};
    const aliases={subject:['предмет','subject'],className:['класс','grade','class'],date:['күнү','дата','date'],period:['сабак','урок','lesson period']};
    const candidates={subject:new Set(),className:new Set(),date:new Set(),period:new Set()};
    for (const labelElement of document.querySelectorAll('.info-label')) {
      if(!visible(labelElement))continue;
      const label=norm(globalThis.KundolukEnglish?.originalText(labelElement) ?? labelElement.textContent);
      const field=Object.keys(aliases).find(k=>aliases[k].includes(label));if(!field)continue;
      let container=labelElement.parentElement;
      for(let depth=0;container&&depth<3;depth++,container=container.parentElement){
        // Never read a value from a wrapper spanning multiple metadata fields.
        if(container.querySelectorAll('.info-label').length!==1)break;
        const values=Array.from(container.querySelectorAll(field==='date'?'input[role="combobox"],.info-value':'.info-value')).filter(visible);
        const texts=values.map(e=>String(e.value??e.textContent??'').trim()).filter(Boolean);
        if(texts.length){for(const text of texts)if(field!=='date'||/^\d{2}\.\d{2}\.\d{4}$/.test(text))candidates[field].add(text);break;}
      }
    }
    for(const field of Object.keys(candidates))if(candidates[field].size===1)out[field]=[...candidates[field]][0];
    out.missing=Object.keys(candidates).filter(k=>!out[k]);
    out.ready=out.missing.length===0;
    out.key=JSON.stringify([out.subject,out.className,out.date,out.period]);
    return out;
  }
  function button(names) {
    const matches = Array.from(document.querySelectorAll('button,[role="button"]')).filter(e=>visible(e)&&names.includes(norm(globalThis.KundolukEnglish?.originalText(e) ?? e.textContent)));
    if(matches.length!==1) throw Error('Could not identify the topic/homework button unambiguously.');
    return matches[0];
  }
  function fields() {
    const get = names => Array.from(document.querySelectorAll('textarea')).filter(e=>visible(e)&&names.includes(norm(e.placeholder)));
    const topic=get(['тема']); const homework=get(['тапшырма','домашнее задание','задание']);
    if (topic.length!==1 || homework.length!==1) return null;
    return {topic:topic[0],homework:homework[0]};
  }
  async function open(expected) {
    if (!context().ready || context().key!==expected) throw Error('Lesson changed. Review the current class and date again.');
    let f=fields();
    if (!f) {
      if (Array.from(document.querySelectorAll('[role="dialog"]')).some(visible)) throw Error('Close the other Kundoluk dialog first.');
      button(['тема жана тапшырма','тема и задание','тема и домашнее задание']).click();
      for(let i=0;i<30&&!f;i++) { await new Promise(r=>setTimeout(r,100)); f=fields(); }
    }
    if(!f) throw Error('Topic/homework form not found. Open it manually, then try again.');
    if(context().key!==expected) throw Error('Lesson changed while opening the form.');
    return f;
  }
  function set(e,value) {
    if(e.disabled||e.readOnly) throw Error('Kundoluk has locked this field.');
    if(e.maxLength>=0&&value.length>e.maxLength) throw Error('The source block exceeds the field length limit.');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,value);
    e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));
    e.dispatchEvent(new FocusEvent('blur',{bubbles:true}));
  }
  async function fill(expected,lesson,homework,replace) {
    const f=await open(expected);
    const targets=[[f.topic,lesson],...(homework!==''?[[f.homework,homework]]:[])];
    for (const [e,v] of targets) {
      if(e.disabled||e.readOnly||(e.maxLength>=0&&v.length>e.maxLength)) throw Error('A field is locked or too short for the source block.');
      if(e.value!==''&&e.value!==v&&!replace) throw Error('This form already contains text. Review it, then allow replacement if intended.');
    }
    const previous=targets.map(([e])=>e.value);
    try {
      targets.forEach(([e,v])=>set(e,v));
      await new Promise(r=>setTimeout(r,150));
      if(context().key!==expected||targets.some(([e,v])=>!e.isConnected||e.value!==v)) throw Error('Field verification failed. Nothing was submitted.');
    } catch(error) { targets.forEach(([e],i)=>{if(e.isConnected)set(e,previous[i]);}); throw error; }
    return 'Exact text filled and checked. Not saved. Review Kundoluk’s form and use its Save button when ready.';
  }
  globalThis.KundolukAdapter={context,fill,fields};
})();
