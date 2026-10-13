/* Progress is local teacher confirmation, never inferred from a Fill click. */
(() => {
 const day=value=>{const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};
 const course=c=>JSON.stringify([c.subject,c.className,Number(c.date.slice(6))-(Number(c.date.slice(3,5))<9?1:0)]);
 const slots=sheet=>sheet.lessons.flatMap((lesson,index)=>Array.from({length:lesson.sessions},(_,i)=>({lesson:index,session:i+1})));
 function suggest(records,c,book,sheet,plan){
  const relevant=records.filter(r=>r.course===course(c)&&r.book===book&&r.sheet===sheet);
  const exact=relevant.find(r=>r.date===c.date&&r.period===c.period);
  if(exact)return {record:exact,reason:exact.state==='posted'?'You confirmed this lesson was posted.':'Planned for this date; not confirmed posted.'};
  const earlier=relevant.filter(r=>day(r.date)<day(c.date)||(r.date===c.date&&r.period.localeCompare(c.period,undefined,{numeric:true})<0));
  earlier.sort((a,b)=>day(b.date).localeCompare(day(a.date))||b.period.localeCompare(a.period,undefined,{numeric:true}));
  if(!earlier.length)return {reason:'Starting point unknown. Check your last posted lesson, or select the correct lesson/session for this date and click Plan selected lesson.'};
  const previous=earlier[0],sequence=slots(plan),i=sequence.findIndex(s=>s.lesson===previous.lesson&&s.session===previous.session);
  if(i<0)return {reason:'The workbook no longer matches recorded progress. Select the correct starting point.'};
  if(i+1===sequence.length)return {reason:'The recorded sequence has reached the end of this worksheet.'};
  return {record:sequence[i+1],reason:`Suggested after ${previous.date} (${previous.state==='posted'?'confirmed posted':'planned only'}). Unrecorded or cancelled lessons may change this suggestion.`};
 }
 function scheduled(rows,c,plan){
  const dates=rows.map(r=>r.date);
  if(!dates.length||dates.some(d=>!day(d)))return {reason:'Read the complete topic/date list first.'};
  if(new Set(dates).size!==dates.length)return {reason:'Multiple sessions share a date. The topic list does not identify periods, so select this lesson manually.'};
  const ordered=[...rows].sort((a,b)=>day(a.date).localeCompare(day(b.date)));
  const index=ordered.findIndex(r=>r.date===c.date);
  if(index<0)return {reason:'This date is not in the captured schedule. Open the topic list and refresh the schedule.'};
  const record=slots(plan)[index];
  if(!record)return {reason:'This scheduled date is beyond the end of the uploaded plan.'};
  const topic=ordered[index].topic;
  return {record,reason:`Plan-based session ${index+1}, counting from ${ordered[0].date}. ${topic&&topic!=='—'?'Kundoluk already has a topic: '+topic:'No saved topic shown in the captured list.'}`};
 }
 globalThis.KundolukProgress={day,course,slots,suggest,scheduled};
})();
