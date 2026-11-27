#!/usr/bin/env node
/* [giro 433 · PO-687] FOTO per il PO (non guardiano): ingresso in campo, GLB acceso, ora congelata (CPM_TOD, default notte).
   Connor Quinn e Oscar Hayes (carnagione «scura»), piu' un'ambrata e una chiara della stessa fila per controllo, col ritratto accanto.
   docs/collaudo-po/433-<braccio>-<tod>-<n>.png · braccio «prima» = window.__CPM_NO_G433 (tinta del giro 240), «dopo» = gioco.
   Uso: node foto-433.mjs [--rosso] */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriIngresso, leggiCorpi } from './misura-412.mjs';
import { foto414 } from './misura-414.mjs';
import fs from 'node:fs'; import path from 'node:path';
const ROSSO = process.argv.includes('--rosso'), TOD = process.env.CPM_TOD || 'night', BR = ROSSO ? 'prima' : 'dopo';
const DIR = path.resolve('../../docs/collaudo-po'); fs.mkdirSync(DIR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const { ctx, p, ok } = await apriIngresso(b, port, ROSSO ? ['__CPM_NO_G433'] : []); if (!ok) { console.log('NON GIUDICATO: ingresso non raggiunto'); process.exit(1); }
const C = await leggiCorpi(p);
const pick = ['Connor Quinn', 'Oscar Hayes'].map(n => C.find(x => x.nome === n)).filter(Boolean);
for (const k of ['a', 'c']) { const c = C.find(x => x.ruolo !== 'eroe' && x.fig && x.fig.k === k && !pick.includes(x)); if (c) pick.push(c); }
const tit = `${ROSSO ? 'prima (giro 240)' : 'dopo (giro 433)'} · ${TOD}`;
for (let i = 0; i < pick.length; i++) { const f = path.join(DIR, `433-${BR}-${TOD}-${i + 1}.png`); const r = await foto414(p, pick[i].nome, f, tit); console.log(`foto ${r ? f : 'NON SCRITTA'} (${pick[i].nome}, ${pick[i].fig && pick[i].fig.k})`); }
await ctx.close(); await b.close(); srv.close();
