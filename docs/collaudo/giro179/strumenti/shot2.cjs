const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:1,viewport:{width:1800,height:900}});
await p.goto('file://'+process.argv[2]);const el=await p.$('#w');await el.screenshot({path:process.argv[3]});await b.close();})();
