/* Read-only XLSX import. Cell text is never translated, trimmed or summarized. */
(() => {
  const headers = ['№ урока', 'Количество уроков', 'План урока', 'Домашнее задание'];
  function fromRows(rows, sheet) {
    const head = rows.findIndex(r => r && headers.every(h => r.includes(h)));
    if (head < 0) return null;
    const columns = headers.map(h => rows[head].indexOf(h));
    const lessons = [], warnings = [];
    const empty = v => v == null || (typeof v === 'string' && !v.trim());
    for (let i = head + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row.some(v => v !== '' && v != null)) continue;
      let [number, count, lesson, homework] = columns.map(c => row[c] ?? '');
      if(empty(lesson) && empty(homework)) {
        warnings.push(`Row ${i+1} (lesson ${number}): skipped because the lesson and homework cells are empty.${!empty(count)?' Session-count cell contains: '+String(count):''}`);
        continue;
      }
      if (typeof lesson !== 'string' || !lesson.trim()) throw Error(`${sheet}, row ${i+1}: lesson block is missing or is not text.`);
      if(empty(count)) {
        const range=String(number).trim().match(/^(\d+)(?:\s*[-–—]\s*(\d+))?$/);
        if(range){count=range[2]?Number(range[2])-Number(range[1])+1:1;warnings.push(`Row ${i+1}: blank session count inferred as ${count} from lesson number ${number}.`);}
      }
      if (!Number.isInteger(Number(count)) || Number(count) < 1 || Number(count) > 100) throw Error(`${sheet}, row ${i+1}: session count must be a whole number from 1 to 100.`);
      if (homework !== '' && typeof homework !== 'string') throw Error(`${sheet}, row ${i+1}: homework must be text.`);
      lessons.push({id:`${sheet}:${i+1}`, row:i+1, number:String(number), sessions:Number(count), lesson, homework});
    }
    if (!lessons.length) throw Error(`${sheet}: no lesson rows found.`);
    return {name:sheet, lessons, warnings};
  }
  async function read(buffer) {
    if (buffer.byteLength > 15*1024*1024) throw Error('Please use a workbook under 15 MB.');
    const zip = await JSZip.loadAsync(buffer);
    let budget = 0;
    async function xml(path, optional=false) {
      const file = zip.file(path);
      if (!file) { if (optional) return null; throw Error(`Workbook part missing: ${path}`); }
      const text = await file.async('string');
      budget += text.length;
      if (budget > 40*1024*1024) throw Error('Workbook is too large to import.');
      const doc = new DOMParser().parseFromString(text,'application/xml');
      if (doc.querySelector('parsererror')) throw Error('Workbook XML could not be read.');
      return doc;
    }
    const all = (el, name) => Array.from(el.getElementsByTagNameNS('*',name));
    const textOf = el => all(el,'t').filter(t=>t.parentElement?.localName!=='rPh').map(t=>t.textContent).join('');
    const shared = await xml('xl/sharedStrings.xml',true);
    const strings = shared ? all(shared,'si').map(textOf) : [];
    const wb = await xml('xl/workbook.xml');
    const rel = await xml('xl/_rels/workbook.xml.rels');
    const relations = new Map(all(rel,'Relationship').filter(r=>r.getAttribute('TargetMode')!=='External').map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
    const sheets = [];
    for (const sheet of all(wb,'sheet')) {
      const target = relations.get(sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'));
      if (!target) throw Error('Worksheet relationship missing.');
      const path = target.startsWith('/') ? target.slice(1) : 'xl/'+target;
      if (path.includes('..')) throw Error('Unsupported worksheet path.');
      const doc = await xml(path);
      if (all(doc,'mergeCell').length) throw Error(`${sheet.getAttribute('name')}: unmerge lesson data cells before importing.`);
      const rows = [];
      for (const r of all(doc,'row')) {
        const n = Number(r.getAttribute('r'));
        if (n < 1 || n > 10000) throw Error('Worksheet exceeds 10,000 rows.');
        const row = [];
        for (const c of all(r,'c')) {
          if (all(c,'f').length) throw Error('Use text values rather than formulas in lesson-plan workbooks.');
          const ref = c.getAttribute('r')?.match(/^([A-Z]+)\d+$/);
          if (!ref) throw Error('Invalid cell address.');
          const col = [...ref[1]].reduce((n,x)=>n*26+x.charCodeAt(0)-64,0)-1;
          if (col>1000) throw Error('Worksheet is too wide.');
          const type = c.getAttribute('t');
          const v = all(c,'v')[0]?.textContent ?? '';
          if (type==='e') throw Error('Workbook contains an Excel error.');
          row[col] = type==='s' ? strings[Number(v)] : type==='inlineStr' ? textOf(c) : v;
          if (row[col] === undefined) throw Error('Invalid shared string reference.');
        }
        rows[n-1] = row;
      }
      const mapped = fromRows(rows,sheet.getAttribute('name'));
      if (mapped) sheets.push(mapped);
    }
    if (!sheets.length) throw Error('Expected columns: '+headers.join(', '));
    return {version:1,sheets};
  }
  globalThis.KundolukWorkbook = {read,fromRows};
})();
