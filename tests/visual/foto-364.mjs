#!/usr/bin/env node
/* [giro 364, PO-650] FOTO PRIMA/DOPO per il PO (sonda, non guardiano). GLB acceso, teatro acceso, telefono 412x915 a densita' 2.
   Tre scene di fascia costruite dal motore; per ognuna tre momenti (la scelta · il cross che parte · l'arrivo in area), nel braccio
   «prima» (rosso __CPM_NO_G364) e «dopo». Un'immagine per scena: riga sopra PRIMA, riga sotto DOPO.
   Uso: node foto-364.mjs → docs/collaudo-po/364-<scena>.png */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const SCENE = [
  { nome: 'cross-secondo-palo', occ: [72, 84, 1.2], seme: 7, k: 1 },
  { nome: 'cross-basso-teso-sinistra', occ: [72, 16, 1.2], seme: 7, k: 0 },
  { nome: 'sterzata-esterna-e-cross', occ: [72, 84, 1.2], seme: 7, k: 2 },
  { nome: 'rientra-e-tira', occ: [72, 16, 1.2], seme: 19, k: 0 },
];
const DIR = path.join(ROOT, 'docs', 'collaudo-po');

async function braccio(b, port, rosso) {
  const out = {};
  for (const sc of SCENE) {/* una pagina nuova per scena: una pagina stanca non e' il gioco */
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 }); const pg = await ctx.newPage(); await installCdnRoutes(pg);
    await pg.addInitScript((r) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC364 = 1; window.__CPM_REC241 = 1; window.__CPM_F364 = []; if (r) window.__CPM_NO_G364 = 1; }, rosso);
    await openMatch(pg, port, { skipLoadAll: true, name: 'Fasce364' }); await sleep(800);
    await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    const st = await pg.evaluate((sc) => { const sit = scenaDalMotoreFascia({ tipo: 'fascia', x: sc.occ[0], y: sc.occ[1], press: sc.occ[2], liberi: 2, cast: { ricevente: { nome: 'Rossi' }, difensore: { nome: 'Langer' } } }, { name: 'Fasce364', stats: { tiro: 70, tecnica: 70, passaggio: 70, dribbling: 70, velocità: 70, fisico: 70 }, ovr: 70 }, sc.seme);
      const idx = SITUATIONS.push(sit) - 1; const z = sit.startZone; window.__CPM_F364.length = 0; window.__CPM_FROZEN = false; window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2200;
      window.__CPM_FORCE_SIT(idx, true, { x: (z.x[0] + z.x[1]) / 2, y: (z.y[0] + z.y[1]) / 2 }); return { az: sit.actions.map(a => a.label), testo: sit.text }; }, sc);
    await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(2600);
    const scatta = async () => { await sleep(250); return pg.screenshot({ type: 'png', timeout: 60000 }); };
    const foto = { az: st.az[sc.k], testo: st.testo };
    await pg.evaluate(() => { window.__CPM_FROZEN = true; }); foto.scelta = await scatta();
    /* il fermo-immagine si arma dentro la pagina, sul fotogramma giusto del testimone: (1) il pallone ha lasciato il piede (arco oltre
       il 25% del volo) · (2) l'arrivo (primo fotogramma dopo il volo) */
    await pg.evaluate((k) => { window.__CPM_FROZEN = false; window.__CPM_FORCE_OUTCOME = 'success'; const n0 = window.__CPM_F364.length; window.__F364_FASE = 0;
      const L = () => { const F = window.__CPM_F364, f = F[F.length - 1];
        if (window.__F364_FASE === 0 && F.length > n0 && f && f.arc && f.arc[3] > 0 && f.arc[2] / f.arc[3] >= 0.25) { window.__CPM_FROZEN = true; window.__F364_FASE = 1; }
        else if (window.__F364_FASE === 2 && f && !f.arc && f.pa) { window.__CPM_FROZEN = true; window.__F364_FASE = 3; return; }
        requestAnimationFrame(L); }; requestAnimationFrame(L); window.__CPM_RESOLVE(k); }, sc.k);
    await pg.waitForFunction(() => window.__F364_FASE === 1, null, { timeout: 40000 }).catch(() => {}); foto.cross = await scatta();
    await pg.evaluate(() => { window.__F364_FASE = 2; window.__CPM_FROZEN = false; });
    await pg.waitForFunction(() => window.__F364_FASE === 3, null, { timeout: 40000 }).catch(() => {}); foto.arrivo = await scatta();
    out[sc.nome] = foto; await ctx.close(); console.log(`  ${rosso ? 'prima' : 'dopo'} · ${sc.nome} «${foto.az}»`);
  }
  return out;
}

const server = await startServer(), port = server.address().port, b = await launchBrowser();
const prima = await braccio(b, port, true), dopo = await braccio(b, port, false);
fs.mkdirSync(DIR, { recursive: true });
for (const sc of SCENE) {
  const p = prima[sc.nome], d = dopo[sc.nome]; const u = (buf) => 'data:image/png;base64,' + buf.toString('base64');
  const cella = (buf, t) => `<figure><img src="${u(buf)}"><figcaption>${t}</figcaption></figure>`;
  const html = `<html><body style="margin:0;background:#111;color:#fff;font:600 15px system-ui"><div style="padding:10px 12px">Giro 364 · ${d.testo} → ${d.az}</div>
    <style>figure{margin:0;display:inline-block;width:412px;vertical-align:top}img{width:412px;display:block}figcaption{padding:6px 8px;background:#222;font-weight:500;font-size:13px}.r{white-space:nowrap}</style>
    <div class="r">${cella(p.scelta, 'PRIMA · la scelta')}${cella(p.cross, 'PRIMA · il cross parte')}${cella(p.arrivo, 'PRIMA · l\'arrivo')}</div>
    <div class="r">${cella(d.scelta, 'DOPO · la scelta')}${cella(d.cross, 'DOPO · il cross parte')}${cella(d.arrivo, 'DOPO · l\'arrivo')}</div></body></html>`;
  const pg = await b.newPage({ viewport: { width: 1236, height: 1950 } }); await pg.setContent(html, { waitUntil: 'load' }); await sleep(300);
  await pg.screenshot({ path: path.join(DIR, `364-${sc.nome}.png`), fullPage: true, type: 'png' }); await pg.close(); console.log('scritta docs/collaudo-po/364-' + sc.nome + '.png');
}
await b.close(); server.close();
