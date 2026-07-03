import { chromium } from '/home/user/Carrier-manager-/tests/visual/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CPM_CHROME });
const p = await b.newPage({ viewport:{width:600,height:1700}, deviceScaleFactor:2 });
await p.goto('file:///tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/styles2.html');
await p.waitForTimeout(700);
await p.screenshot({ path:'/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/styles2.png', fullPage:true });
await b.close(); console.log('shot2 done');
