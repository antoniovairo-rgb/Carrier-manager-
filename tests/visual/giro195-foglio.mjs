#!/usr/bin/env node
/* [giro 195] foglio-provini: affianca N foto in una sola immagine. Uso: node giro195-foglio.mjs uscita.png larghezzaCella foto1 foto2 ... */
import fs from 'node:fs'; import path from 'node:path';
import { launchBrowser } from './lib/harness.mjs';
const [out, cw, ...ff] = process.argv.slice(2);
const b = await launchBrowser(); const page = await b.newPage({ viewport: { width: Math.min(ff.length, 6) * (+cw + 8) + 8, height: 600 } });
const html = '<body style="margin:0;background:#444;font:11px sans-serif;color:#fff"><div style="display:flex;flex-wrap:wrap;gap:8px;padding:8px">' + ff.map(f => `<div style="width:${cw}px"><div style="overflow:hidden;white-space:nowrap">${path.basename(f)}</div><img style="width:${cw}px;display:block" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"></div>`).join('') + '</div></body>';
await page.setContent(html); await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true }); await b.close(); console.log('foglio', out);
