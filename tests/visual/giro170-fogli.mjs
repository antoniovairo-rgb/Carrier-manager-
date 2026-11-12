#!/usr/bin/env node
/* [giro 170] FOGLI-PROVINI: affianca le foto di una scena in un'unica immagine (docs/collaudo/giro170/fogli/).
   Uso: node giro170-fogli.mjs <prefisso> [colonne] [larghezzaCella]   es. node giro170-fogli.mjs ingresso-tel 6 250 */
import fs from 'node:fs'; import path from 'node:path';
import { launchBrowser } from './lib/harness.mjs'; import { OUT } from './giro170-lib.mjs';
const [pre, col = '6', cw = '250', nome = pre] = process.argv.slice(2); const RX = new RegExp('^(' + pre + ')'); const D = path.join(OUT, 'fogli'); fs.mkdirSync(D, { recursive: true });
const L = fs.readdirSync(OUT).filter(f => RX.test(f) && f.endsWith('.png')).sort(); if (!L.length) { console.log('nessuna foto per', pre); process.exit(1); }
const b = await launchBrowser(); const page = await b.newPage({ viewport: { width: +col * (+cw + 6) + 6, height: 600 } });
const html = `<body style="margin:0;background:#111;font:11px sans-serif;color:#fff"><div id="g" style="display:grid;grid-template-columns:repeat(${col},${cw}px);gap:6px;padding:6px">` +
  L.map(f => `<div><img src="data:image/png;base64,${fs.readFileSync(path.join(OUT, f)).toString('base64')}" style="width:${cw}px;display:block"><div>${f.replace('.png', '')}</div></div>`).join('') + '</div></body>';
await page.setContent(html); await page.waitForTimeout(600); const el = await page.$('#g'); await el.screenshot({ path: path.join(D, nome + '.png') }); await b.close(); console.log('foglio', path.join(D, nome + '.png'), L.length, 'foto');
