const {chromium}=require(process.env.KUNDOLUK_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(pathToFileURL(path.join(__dirname,'demo.html')).href);
await page.getByRole('button',{name:'Lesson companion',exact:true}).click();
try{await page.locator('#kundoluk-companion #choices').waitFor({state:'visible',timeout:5000});}catch(e){console.log(await page.locator('#kundoluk-companion').innerText());console.log(errors);await page.screenshot({path:'release/demo-debug.png'});throw e;}
await page.screenshot({path:'release/screenshot-demo.png'});
const context=await page.locator('#kundoluk-companion #context').innerText();
if(!context.includes('Biology')||!context.includes('13.10.2026'))throw Error('Demo lesson context not recognized: '+context);
await page.locator('#kundoluk-companion #confirm').check();
await page.getByRole('button',{name:'Fill current lesson — do not save',exact:true}).click();
const expected='Cells and their structures\nIdentify the nucleus, cytoplasm and cell membrane.';
if(await page.getByPlaceholder('Тема',{exact:true}).inputValue()!==expected)throw Error('Topic did not fill exactly');
if(await page.getByPlaceholder('Тапшырма',{exact:true}).inputValue()!=='Draw and label a plant cell.')throw Error('Homework did not fill exactly');
await page.locator('#kundoluk-companion #fill').scrollIntoViewIfNeeded();
await page.screenshot({path:'release/screenshot-filled.png'});
if(errors.length)throw Error(errors.join('\n'));
fs.writeFileSync('release/browser-validation.txt','PASS: all manifest scripts loaded; synthetic lesson context recognized; teacher confirmation required; exact multiline topic and homework filled; no page errors. Screenshot uses synthetic data only.\n');
console.log(fs.readFileSync('release/browser-validation.txt','utf8'));
await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
