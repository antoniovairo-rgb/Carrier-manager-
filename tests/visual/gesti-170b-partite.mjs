#!/usr/bin/env node
/* [giro 170b PO-367] QUANTE VOLTE APPARE OGNI GESTO IN UNA PARTITA VERA — strumento, non guardiano.
   Salvataggio S12 (fixtures/save-190-s12-ovr93.json), partita di campionato intera in autoplay, GLB acceso, velocita' 4.
   Il NOME del giocatore cambia a ogni partita (il seme di partita nasce anche dal nome: 7.496) → partite diverse.
   Conta: (a) gli highlight risolti per famiglia/variante/esito dal bus eventi (__CPM_TIMELINE, ActionResolved);
          (b) le clip montate dall'eroe (cambi di __CPM_GST.cur/cn, campionati ogni 40 ms reali).
   Uso: CPM_PARTITE=3 node gesti-170b-partite.mjs  → out/giro170b/partite.json */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname as LIBDIR } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const N = +(process.env.CPM_PARTITE || 3); const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Gialli', 'Blu'];
const OUT = path.join(LIBDIR, '..', 'out', 'giro170b'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const b = await launchBrowser(); const partite = [];
for (let i = 0; i < N; i++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__C170 = { clip: {}, ultimo: null, az: [], tAz: -1 }; setInterval(() => { try { const T = window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []; for (const e of T) if (e.type === 'ActionResolved' && e.t > window.__C170.tAz) { window.__C170.tAz = e.t; window.__C170.az.push({ clip: {}, t: e.hlType || null, v: e.hlVariant || null, ok: !!e.ok, key: e.key || null, kind: e.outKind || null, label: e.label || null }); } } catch (e) {} try { const g = window.__CPM_GST; const k = g && g.cur ? g.cur + '/' + (g.cn || '?') : null; if (k !== window.__C170.ultimo) { window.__C170.ultimo = k; if (k) window.__C170.clip[k] = (window.__C170.clip[k] | 0) + 1; } if (k && window.__C170.az.length) { const u = window.__C170.az[window.__C170.az.length - 1]; u.clip[k] = (u.clip[k] | 0) + 1; }/* clip viste DOPO la risoluzione dell'azione, fino alla successiva (conta campioni) */ } catch (e) {} }, 40); }, { ...save, name: NOMI[i % NOMI.length] });
  const t0 = Date.now(); let ph = '';
  try {
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(sd => { window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 150 }); }, 11 + i * 7);
    while (Date.now() - t0 < 560000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
    const r = await page.evaluate(() => { const T = (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []); return { eventi: T.length, azioni: window.__C170.az, clip: window.__C170.clip, punteggio: window.__CPM_SCORE ? (typeof window.__CPM_SCORE === 'function' ? window.__CPM_SCORE() : window.__CPM_SCORE) : null, minuto: (window.__CPM_STATE && window.__CPM_STATE() || {}).clock || null }; });
    partite.push({ i, nome: NOMI[i % NOMI.length], fase: ph, sReali: Math.round((Date.now() - t0) / 1000), ...r });
    console.log(`partita ${i} (${NOMI[i % NOMI.length]}) fase ${ph} · ${r.azioni.length} highlight risolti · clip eroe ${JSON.stringify(r.clip)}`);
  } catch (e) { console.log(`partita ${i} ERRORE ${String(e.message).slice(0, 160)}`); partite.push({ i, errore: String(e.message).slice(0, 160) }); }
  await ctx.close();
  fs.writeFileSync(path.join(OUT, 'partite.json'), JSON.stringify(partite, null, 1));
}
await b.close(); srv.close(); console.log('FINE');
