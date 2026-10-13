/* Separate storage keys keep imports in different tabs from overwriting each other. */
(() => {
  const prefix='lessonPlan:';
  const valid=book=>book?.version===1&&Array.isArray(book.sheets)&&book.sheets.length>0;
  function create(storage) {
    function available(){if(!storage)throw new Error('Persistent storage is unavailable. Open the installed Chrome extension to save plans.');}
    return {
      async list(){
        available();
        const all=await storage.get(null);
        if(valid(all.lessonWorkbook)&&!all[prefix+'legacy']) {
          const entry={id:prefix+'legacy',name:'Previously imported workbook',book:all.lessonWorkbook};
          await storage.set({[entry.id]:entry});
          all[entry.id]=entry;
        }
        return Object.entries(all).filter(([key,e])=>key.startsWith(prefix)&&e?.id===key&&valid(e.book)).map(([,e])=>e).sort((a,b)=>a.name.localeCompare(b.name));
      },
      async add(name,book){
        available();
        if(!valid(book))throw new Error('Invalid lesson workbook.');
        const entry={id:prefix+crypto.randomUUID(),name,book};
        await storage.set({[entry.id]:entry});
        return entry;
      },
      async remove(id){
        available();
        if(!id.startsWith(prefix))throw new Error('Invalid workbook ID.');
        await storage.remove(id===prefix+'legacy'?[id,'lessonWorkbook']:id);
      }
    };
  }
  globalThis.KundolukLibrary={create};
})();
