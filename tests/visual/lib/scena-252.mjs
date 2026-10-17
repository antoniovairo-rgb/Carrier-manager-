/* [PO-252 giro 22] Esecuzione di UNA scena forzata con esito scelto, su una pagina gia' aperta, GLB acceso (direttiva PO 29/07).
   Stesso percorso del banco PO-248 (banco-highlight-248.mjs): scena-esca diversa → scena → risoluzione → N secondi di TEMPO DI
   SCENA osservati (mai un tempo reale fisso: lezione 7.460). Restituisce cio' che la funzione `raccogli` legge dalla pagina.
   Le pagine si aprono con `pagina252` (init comune + flag della prova): una pagina nuova per ogni gruppo di scene (7.483). */
import { installCdnRoutes, openMatch, sleep } from './harness.mjs';

export async function pagina252(b, port, flags = {}) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(f => {
    window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC229 = 1;
    for (const [k, v] of Object.entries(f)) window[k] = v;
    /* campionatore per fotogramma (come __B248 del banco): tempo di SCENA, fase, stacco nero vivo, eroe/pallone dalle mesh */
    window.__S252 = { on: false, fr: [] };
    const loop = () => { try { const S = window.__S252; if (S.on && S.fr.length < 6000) { const p = window.__CPM_PROBE && window.__CPM_PROBE();
      S.fr.push({ ck: typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, cut: window.__CPM_CUTLIVE ? !!window.__CPM_CUTLIVE() : false,
        h: p && p.hero ? [p.hero.world.x, p.hero.world.y, p.hero.world.z] : null, b: p && p.ball ? [p.ball.world.x, p.ball.world.y, p.ball.world.z] : null, g: window.__CPM_GST ? [window.__CPM_GST.cur || null, window.__CPM_GST.w, window.__CPM_GST.at || null, window.__CPM_GST.want || null, window.__CPM_GST.g || null] : null }); } } catch (e) {} requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }, flags);
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(500);
  return page;
}

export async function scena252(page, { gi, k = 0, out = 'success', kind = null, secondi = 4, prima = null, raccogli }) {
  const scena = () => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
  const attendi = async (ds, capMs) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena()) - s0 >= ds) break; await sleep(80); } };
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const tot = await page.evaluate(() => SITUATIONS.length);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (gi + 61) % tot).catch(() => false);
  await attendi(0.6, 8000);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { errore: 'forzatura fallita' };
  await attendi(1.0, 12000);
  await page.evaluate(([o, kd]) => { window.__CPM_FORCE_OUTCOME = o; if (kd) window.__CPM_FORCE_KIND = kd; else delete window.__CPM_FORCE_KIND; }, [out, kind]);
  if (prima) await page.evaluate(prima);
  await page.evaluate(() => { window.__S252.fr = []; window.__S252.on = true; });
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { errore: 'risoluzione fallita' };
  const tR = Date.now(); let c0 = null;
  while (Date.now() - tR < 45000) { await sleep(300); const c = await scena(); if (c0 == null) c0 = c; if (c - c0 >= secondi) break; }
  const r = await page.evaluate(raccogli);
  await page.evaluate(() => { window.__S252.on = false; });
  return r;
}

export const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

/* indice dell'azione con premio `rew` (o la prima) di una scena */
export async function kDi(page, gi, rew) { return page.evaluate(([g, r]) => { const a = (SITUATIONS[g].actions || []); const i = r ? a.findIndex(x => x.rew === r) : 0; return i; }, [gi, rew]); }
/* passi del pallone fra fotogrammi consecutivi con avanzamento di scena, fuori dagli stacchi neri: [{d, ds, x, z, ph}] */
export function passiPalla(fr) { const out = []; let a = null; for (const c of fr) { if (c.ck == null || !c.b) continue; if (a && c.ck > a.ck && !a.cut && !c.cut) out.push({ d: Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1], c.b[2] - a.b[2]), ds: c.ck - a.ck, x: c.b[0], z: c.b[2], x0: a.b[0], z0: a.b[2], ph: c.ph }); a = c; } return out; }
