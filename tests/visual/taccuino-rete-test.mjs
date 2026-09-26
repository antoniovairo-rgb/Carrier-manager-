#!/usr/bin/env node
/* [7.999.15] GUARDIANO — LA BOZZA DEL TACCUINO NON DICE «IN RETE» SE LA PALLA NON E' ENTRATA (appunti PO 26/09: tap-in e colpo di
   testa «esito miss ma la palla e' finita IN RETE»; sulle stesse scene forzate la palla si ferma a x 45,8-47,0, linea a 48,6).
   Tre scene sintetiche date alla bozza vera (window.__CPM_DRAFTNOTE): (A) tiro che sfila a 3,8 dal centro, oltre il palo;
   (B) parata a x 46, poi i 320 ms di coda col pallone riposizionato sulla linea; (C) palla davvero fra i pali oltre la linea.
   Verde: A e B senza «IN RETE», C con. CPM_ROSSO=1 → __CPM_NO_RETE15: la soglia larga denuncia A e B. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_RETE15 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Rete15' });
const esiti = await page.evaluate(() => {
  const scena = (fine, coda) => { const S = []; let t = 1000;
    for (let i = 0; i <= 20; i++) { const k = i / 20; S.push({ t, x: 38 + (fine.x - 38) * k, y: 0.3 + (fine.y - 0.3) * k, z: fine.z * k, f: 9, sk: 7, cx: 30, cy: 8, cz: 0, lx: 40, ly: 0, lz: 0, hx: 38, hz: 0, md: 0, ws: 2, wl: 0 }); t += 40; }
    if (coda) S.push({ ...S[S.length - 1], t: t + 100, x: coda.x, y: coda.y, z: coda.z, f: 0 });
    return { samples: S, goalX: 48.6, homeX: -48.6, now: t + 400, span: 1, res: 1 }; };
  const nota = s => { try { return String(window.__CPM_DRAFTNOTE(s, { out: 'miss', sceneKey: 7, intent: 'shot' }) || ''); } catch (e) { return 'ERR ' + e.message; } };
  return { A: nota(scena({ x: 48.9, y: 0.8, z: 3.8 })), B: nota(scena({ x: 46.0, y: 0.5, z: 0.4 }, { x: 48.7, y: 0.1, z: 0 })), C: nota(scena({ x: 48.9, y: 1.0, z: 1.0 })) };
});
await b.close(); srv.close();
const rete = s => /IN RETE/.test(s);
for (const k of ['A', 'B', 'C']) console.log(`  ${k}: ${rete(esiti[k]) ? 'IN RETE' : 'non in rete'}${/^ERR/.test(esiti[k]) ? ' ' + esiti[k] : ''}`);
if (ROSSO) { const ok = rete(esiti.A) && rete(esiti.B); console.log(ok ? '✅ ROSSO come atteso: con la soglia larga la bozza denuncia tiri fuori e la coda' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = [];
if (rete(esiti.A)) fails.push('A: tiro fuori accanto al palo letto come IN RETE');
if (rete(esiti.B)) fails.push('B: la coda di riposizionamento letta come IN RETE');
if (!rete(esiti.C)) fails.push('C: palla davvero in rete non denunciata (sonda cieca)');
console.log(fails.length ? '❌ FAIL taccuino-rete\n  ' + fails.join('\n  ') : '✅ PASS taccuino-rete'); process.exit(fails.length ? 1 : 0);
