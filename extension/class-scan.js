(() => {
 function parseCards(cards){
  const found=new Map();
  for(const text of cards){
   const lines=text.split('\n').map(s=>s.replace(/[\uE000-\uF8FF]/g,'').trim()).filter(Boolean);
   if(lines.length!==3||!/^\d{1,2}\s*[A-ZА-ЯЁ]\b/i.test(lines[2].replace(/([A-ZА-ЯЁ])(?=\s*-)/i,'$1 '))||!lines[1]||lines[1].includes(':'))continue;
   found.set(JSON.stringify([lines[1],lines[2]]),{subject:lines[1],className:lines[2]});
  }
  return [...found.values()];
 }
 globalThis.KundolukClassScan={parseCards};
})();
