#!/usr/bin/env node
/* [7.232.0 punto 4 — AI VISION senza provider esterno] CONTACT SHEET DELLE COMBINAZIONI DEL WIZARD.
   In questo ambiente nessun provider vision esterno è raggiungibile (Anthropic 401 senza chiave e
   anthropic.com bypassa il proxy; Ollama cloud bloccato dalla policy; un modello locale su CPU non è
   praticabile). Il secondo occhio percettivo è quindi l'AGENTE STESSO: questa probe cattura per ogni
   combinazione un FILMSTRIP in condizioni WIZARD REALI (pagina pulita + __CPM_REVIEW, presentazione
   identica a quella che giudica il PO) e lo compone in un'unica PNG a griglia — un foglio-provini per
   combo — che l'agente legge e giudica con l'occhio critico del wizard, verdetti nel formato export.
   Uso:  VS_COMBOS="7:0:F,18:0:F,21:2:S" node vision-contact-sheets.mjs   (gi:azione:S|F)
         VS_N=8 VS_MS=430 → frame e passo di campionamento. Output: out/vision-sheets/gi<gi>_k<k>_<ok>.png */
import fs from 'fs';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, canvasShot, sleep } from './lib/harness.mjs';

const N = Math.max(4, Math.min(10, +(process.env.VS_N || 8)));
const MS = Math.max(200, +(process.env.VS_MS || 430));
const OUTDIR = new URL('./out/vision-sheets/', import.meta.url).pathname;
fs.mkdirSync(OUTDIR, { recursive: true });
const COMBOS = (process.env.VS_COMBOS || '').split(',').map(s => s.trim()).filter(Boolean).map(s => {
  const m = s.match(/^(\d+):(\d+):(S|F)$/i); if (!m) throw new Error(`combo malformato: ${s} (atteso gi:k:S|F)`);
  return { gi: +m[1], k: +m[2], ok: /s/i.test(m[3]) };
});
if (!COMBOS.length) { console.error('nessun combo: passa VS_COMBOS="gi:k:S|F,..."'); process.exit(2); }

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const pg = await b.newPage({ viewport: { width: 390, height: 700 } });
await installCdnRoutes(pg);
pg.on('pageerror', e => console.log('PE', String(e.message).slice(0, 120)));
const GLB_ON = process.env.VS_GLB === '1';/* [7.245.0] VS_GLB=1 → fogli col CH38 (la vista del PO): le pose procedurali sono nascoste sotto GLB — verificare i gesti SOLO GLB-OFF ha fatto sfuggire un'intera classe di bocciature */
await pg.addInitScript(([g]) => { window.__CPM_GLB = g; window.__CPM_REVIEW = true; try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} }, [GLB_ON]);
await pg.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 });
await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
const click = async rx => { try { await pg.getByText(rx).first().click({ timeout: 5000, noWaitAfter: true }); return true; } catch (e) { return false; } };
await click(/Nuova carriera/i); await sleep(800);
await pg.evaluate(() => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'Probe'); i.dispatchEvent(new Event('input', { bubbles: true })); } });
await click(/INIZIA I PROVINI/i); await sleep(600); await click(/Inizia il provino/i);
await pg.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function', { timeout: 30000 });

const grid = (bufs, cols) => {// compone i frame in una griglia (pngjs, nessuna dipendenza nuova)
  const imgs = bufs.map(bf => PNG.sync.read(bf));
  const w = imgs[0].width, h = imgs[0].height, rows = Math.ceil(imgs.length / cols);
  const out = new PNG({ width: w * cols, height: h * rows });
  imgs.forEach((im, i) => { const gx = (i % cols) * w, gy = Math.floor(i / cols) * h;
    for (let y = 0; y < h; y++) im.data.copy(out.data, ((gy + y) * out.width + gx) * 4, (y * w) * 4, (y * w + w) * 4); });
  return PNG.sync.write(out);
};

for (const c of COMBOS) {
  const meta = await pg.evaluate(([gi, k]) => { const s = window.__CPM_SITS[gi]; const a = s && s.actions[k];
    return { txt: s ? s.text : '?', lbl: a ? a.label : '?' }; }, [c.gi, c.k]);
  await pg.evaluate(([gi]) => { const s = window.__CPM_SITS[gi]; const sz = s.startZone;
    window.__CPM_FORCE_SIT(gi, true, { x: (sz.x[0] + sz.x[1]) / 2, y: (sz.y[0] + sz.y[1]) / 2 }); }, [c.gi]);
  await sleep(900);
  const frames = [await canvasShot(pg)];// f0 = lettura (hl_choose)
  await pg.evaluate(([k, ok]) => { window.__CPM_FORCE_OUTCOME = ok ? 'success' : 'fail'; window.__CPM_RESOLVE(k); }, [c.k, c.ok]);
  for (let i = 1; i < N; i++) { await sleep(MS); frames.push(await canvasShot(pg)); }
  const name = `gi${c.gi}_k${c.k}_${c.ok ? 'ok' : 'fail'}${GLB_ON ? '_glb' : ''}.png`;
  fs.writeFileSync(OUTDIR + name, grid(frames, 4));
  console.log(`${name} · «${meta.txt}» × «${meta.lbl}» × ${c.ok ? 'RIUSCITO' : 'FALLITO'} · ${N} frame`);
}
await b.close(); srv.close();
console.log(`fogli → ${OUTDIR}`);
