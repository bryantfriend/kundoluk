const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const scope={document:{getElementById:()=>null}};vm.createContext(scope);vm.runInContext(fs.readFileSync('extension/window.js','utf8'),scope);const fit=scope.KundolukWindow.fit;
let r=fit({},1920,1080);assert.equal(r.width,360);assert.equal(r.height,460);assert.ok(r.y>500);
r=fit({x:-500,y:9999,width:4000,height:3000},800,600);assert.equal(r.x,8);assert.equal(r.y,8);assert.equal(r.width,784);assert.equal(r.height,584);
r=fit({x:1500,y:900,width:360,height:460},375,500);assert.ok(r.x+r.width<=375);assert.ok(r.y+r.height<=500);
r=fit({width:NaN,height:Infinity},1920,1080);assert.equal(r.width,360);assert.equal(r.height,460);console.log('PASS: compact defaults, off-screen recovery, viewport resizing, malformed saved settings.');
