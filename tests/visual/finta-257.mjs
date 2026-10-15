#!/usr/bin/env node
/* [giro 27 PO-257 — taccuino PO 15/10, 7.999.169 S.13 W.21 38' vs FC Foxshire: «🧠 Ricevi fra le linee: hai spazio!» →
   «🌀 Finta e cambio di passo», esito intercept: «codice 000 — gesto scoordinato»] GUARDIANO, GLB acceso, pagina nuova per giro.
   Scena costruita dal motore come la costruisce il gioco (scenaDalMotoreLinee), azione «Finta e cambio di passo», esito forzato
   fail/intercepted. A ogni fotogramma si legge il gesto GLB dell'eroe (__CPM_GST: clip corrente, peso, scala, tempo-clip) e il gesto
   logico (actType). MISURATO prima della correzione: la finta del build-up (clip «change») veniva RIMONTATA DA CAPO dopo il
   passaggio — giro 0 vista solo dopo, giro 1 prima e di nuovo dopo.
   VERDE: nessuna clip di finta (change/feint/ruleta) montata dopo l'inizio del gesto conclusivo, in nessun giro.
   ROSSO (__CPM_NO_FINTA257): almeno un giro con la finta rimontata dopo.
   Riporta anche, senza giudicarle: durata della clip contro la finestra GESTURE_WIN (tramite scala), peso massimo e mira al rilascio
   (__CPM_AIM517). Uso: node finta-257.mjs  (CPM_GIRI=2 · CPM_SOLO=verde|rosso · CPM_KIND=intercepted) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GIRI = +(process.env.CPM_GIRI || 2), KIND = process.env.CPM_KIND || 'intercepted';
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const FINTE = new Set(['change', 'feint', 'ruleta']);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso, t) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_AIM517 = []; if (r) window.__CPM_NO_FINTA257 = 1; }, rosso);
  try {
    await openMatch(page, port, { name: 'Finta257 ' + t }); await sleep(800);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    const r = await page.evaluate(t => { for (let seed = 1 + t * 50; seed < 900; seed++) {
      const s = scenaDalMotoreLinee({ tipo: 'fra-le-linee', zona: 'trequarti', x: 70, y: 48, press: 1.2, liberi: 1, cast: {} }, { stats: {} }, seed);
      if (!s) continue; const i = s.actions.findIndex(a => /finta e cambio di passo/i.test(a.label)); if (i < 0) continue;
      SITUATIONS.push(s); const c = deriveHL(s, s.actions[i]) || {}; return { gi: SITUATIONS.length - 1, ai: i, tipo: c.type };
    } return null; }, t);
    if (!r) return { skip: 'scena non costruibile' };
    if (!(await page.evaluate(g => window.__CPM_FORCE_SIT(+g, true), r.gi))) return { skip: 'force fallito' };
    await sleep(1500);
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__F257 = [];
      const loop = () => { try { const g = window.__CPM_GST; window.__F257.push(g ? { cur: g.cur, at: g.at, w: g.w, ts: g.ts, cdur: g.cdur } : null); } catch (e) {} if (window.__F257.length < 5000) requestAnimationFrame(loop); };
      requestAnimationFrame(loop); window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = k; }, KIND);
    await page.evaluate(a => window.__CPM_RESOLVE(a), r.ai);
    await sleep(9000);
    const F = await page.evaluate(() => window.__F257.slice());
    const aim = await page.evaluate(() => (window.__CPM_AIM517 || []).filter(a => a.ai === 0).map(a => a.err));
    const kind = await page.evaluate(() => window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind : null);
    /* sequenza delle clip montate e quante finte DOPO il primo fotogramma con il gesto conclusivo armato */
    const seq = []; let prev = null, iAct = F.findIndex(f => f && f.at), dopo = 0, prima = 0; const clip = {};
    F.forEach((f, i) => { const c = f && f.cur; if (c && c !== prev) { seq.push(c); if (FINTE.has(c)) { if (iAct >= 0 && i > iAct) dopo++; else prima++; } }
      if (c) { const k = clip[c] || (clip[c] = { wMax: 0, ts: f.ts, cdur: f.cdur }); k.wMax = Math.max(k.wMax, f.w || 0); } prev = c; });
    return { tipo: r.tipo, kind, n: F.length, seq: seq.join('>'), fintePrima: prima, finteDopo: dopo, clip, aim, errs };
  } catch (e) { return { skip: 'errore ' + String(e.message || e).slice(0, 120) }; } finally { try { await page.close(); } catch (_e) {} }
}
const E = {};
for (const br of bracci) { E[br] = [];
  for (let t = 0; t < GIRI; t++) { const o = await giro(br === 'rosso', t); E[br].push(o); console.log(`${br} giro ${t}: ${JSON.stringify(o)}`); } }
await b.close(); srv.close();
const g = [];
if (E.verde) { const V = E.verde.filter(o => !o.skip);
  if (V.length < GIRI) g.push(`verde: ${GIRI - V.length} giri non giudicati`);
  if (V.some(o => !o.n || o.n < 10)) g.push('verde: fotogrammi insufficienti (cieco)');
  if (V.some(o => o.finteDopo > 0)) g.push('verde: finta rimontata dopo il gesto conclusivo ' + V.map(o => o.seq).join(' | '));
  if (V.some(o => o.errs && o.errs.length)) g.push('verde: errori di pagina'); }
if (E.rosso) { const R = E.rosso.filter(o => !o.skip); if (!R.some(o => o.finteDopo > 0)) g.push('rosso: il difetto non si vede ' + R.map(o => o.seq).join(' | ')); }
if (g.length) { console.log('❌ finta-257'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ finta-257 verde (la finta non riparte dopo il passaggio) e il rosso si vede');
