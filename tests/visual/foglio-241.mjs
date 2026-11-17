// GIRO 241 — foglio-foto di una sequenza del banco misura-241 (CPM_FOTO=1): node foglio-241.mjs <prefisso file foto> <uscita.jpg> "<titolo>" [passo s]
import fs from 'node:fs'; import path from 'node:path'; import { launchBrowser } from './lib/harness.mjs';
const [pre, dst, titolo, passo] = process.argv.slice(2); const dir = path.dirname(pre), base = path.basename(pre), P = +(passo || 0.4);
const files = fs.readdirSync(dir).filter(f => f.startsWith(base + '-') && f.endsWith('.jpg')).sort();
if (!files.length) { console.error('nessuna foto con prefisso ' + pre); process.exit(1); }
const b = await launchBrowser(); const p = await b.newPage({ viewport: { width: 1480, height: 900 } });
const html = `<body style="margin:0;background:#111;color:#eee;font:14px sans-serif"><div style="padding:6px 10px">${titolo || base} — un fotogramma ogni ${String(P).replace('.', ',')} s di scena</div><div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px">${files.map((f, i) => `<div style="position:relative"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}" style="width:180px;display:block"><span style="position:absolute;left:4px;top:4px;background:#000a;padding:1px 5px;border-radius:3px">${(i * P).toFixed(2).replace('.', ',')} s</span></div>`).join('')}</div></body>`;
await p.setContent(html); await p.waitForTimeout(300); const h = await p.evaluate(() => document.body.scrollHeight); await p.setViewportSize({ width: 1480, height: h });
await p.screenshot({ path: dst, type: 'jpeg', quality: 70 }); await b.close(); console.log(dst + ' · ' + files.length + ' foto');
