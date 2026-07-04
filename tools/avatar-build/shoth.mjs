import { chromium } from '/home/user/Carrier-manager-/tests/visual/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:process.env.CPM_CHROME});
const p=await b.newPage({viewport:{width:560,height:420},deviceScaleFactor:2});
await p.goto('file:///tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/heroes.html');
await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/heroes.png',fullPage:true});
await b.close();console.log('done');
