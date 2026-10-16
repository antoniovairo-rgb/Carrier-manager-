#!/usr/bin/env node
/* [giro 46 PO-071 fase 3 — guardiano delle NUOVE TIPOLOGIE di stadio: borgo · catino · mattoni · arena]
   Tre domande, tre misure.
   (1) ASSEGNAZIONE: per ogni club (prima squadra + Primavera) stadiumConfigFor da' la stessa tipologia due volte e su due
       caricamenti diversi (deterministica, nessun campo nel salvataggio); ogni nuova tipologia compare almeno una volta ed
       e' coerente con la piazza (borgo: capienza < 13.000 o Primavera · catino/mattoni: 14.000-38.000 · arena: >= 48.000 e
       prestigio >= 80).
   (2) COSTRUZIONE: ogni tipologia forzata si costruisce senza errori (__CPM_STADFAIL nullo, zero pageerror), con la sua
       firma (borgo: 3 terrapieni · catino/arena: corona di 8 segmenti · mattoni: frontone · tunnel d'ingresso) e un costo
       entro il tetto: mesh dell'impianto (= tetto dei draw call, indipendente dalla camera) <= CPM_MESH_MAX (300); draw call,
       triangoli e numero di luci della vista TV entro gli STADI DI OGGI (rosso, stesso giro: provincia/storico/moderno/
       tedesco) — draw call e triangoli al massimo +CPM_MARGINE (8%) sul piu' caro di oggi, luci mai di piu'.
   (3) ROSSO (__CPM_NO_STADI246): nessun club riceve una nuova tipologia, il forzato non porta firma ne' tunnel.
   Uso: node stadi-071.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MESH_MAX = +(process.env.CPM_MESH_MAX || 300), MARG = +(process.env.CPM_MARGINE || 0.08);
const NUOVE = ['borgo', 'catino', 'mattoni', 'arena'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const TV = { x: 0, y: 16, z: 34, lx: 0, ly: 4, lz: -30 };
async function apri(o) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; if (o.tpl) window.__CPM_STADIUM_TPL_FORCE = o.tpl; if (o.cap) window.__CPM_STADIUM_CAP_FORCE = o.cap; if (o.r) window.__CPM_NO_STADI246 = 1; }, o);
  await openMatch(page, port, { skipLoadAll: true, name: 'Stadi071' }); await sleep(800);
  return { page, errs };
}
async function assegna(page) {
  return page.evaluate(() => {
    const out = {}; const cl = (window.__CPM_CLUBS || []).filter(c => c.lg !== 'Nazionale');
    const tutti = [...cl, ...cl.filter(c => /^Lega [AB]$/.test(c.lg)).map(c => ({ ...c, isU18: true, n: c.n + ' Primavera', lg: c.lg === 'Lega A' ? 'Primavera 1' : 'Primavera 2', p: Math.max(25, c.p - 12) }))];
    for (const c of tutti) { const a = window.stadiumConfigFor(c), a2 = window.stadiumConfigFor(c);
      out[(c.isU18 ? 'u18:' : '') + c.id] = { t: a.template, t2: a2.template, cap: a.capacity, p: a.prestige, u18: !!c.isU18 }; }
    return out;
  });
}
async function costruisci(tpl, cap, rosso) {
  const { page, errs } = await apri({ tpl, cap, r: rosso });
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true));
  await page.waitForFunction(() => !!window.__CPM_PALI69, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(c => { window.__CPM_CAM904 = c; }, TV); await sleep(1800);
  const w = await page.evaluate(() => ({ s: window.__CPM_STADI246 || null, fail: window.__CPM_STADFAIL || null, ri: (window.__CPM_RINFO769 && window.__CPM_RINFO769()) || null }));
  await page.close(); return { ...w, errs };
}
const g = [];
// (1) assegnazione — due caricamenti verdi + un rosso
const v1p = await apri({}); const A1 = await assegna(v1p.page); await v1p.page.close();
const v2p = await apri({}); const A2 = await assegna(v2p.page); await v2p.page.close();
const rp = await apri({ r: true }); const AR = await assegna(rp.page); await rp.page.close();
const conta = {}; let nonDet = 0, incoerenti = [];
for (const [k, a] of Object.entries(A1)) {
  if (a.t !== a.t2 || !A2[k] || A2[k].t !== a.t) nonDet++;
  conta[a.t] = (conta[a.t] || 0) + 1;
  if (a.t === 'borgo' && !(a.u18 || a.cap < 13000)) incoerenti.push(k + ' borgo ' + a.cap);
  if ((a.t === 'catino' || a.t === 'mattoni') && !(a.cap >= 14000 && a.cap < 38000)) incoerenti.push(k + ' ' + a.t + ' ' + a.cap);
  if (a.t === 'arena' && !(a.cap >= 48000 && a.p >= 80)) incoerenti.push(k + ' arena ' + a.cap + ' p' + a.p);
}
const rossoNuove = Object.values(AR).filter(a => NUOVE.includes(a.t)).length;
console.log(`assegnazione: ${Object.keys(A1).length} club · ${NUOVE.map(t => t + ' ' + (conta[t] || 0)).join(' · ')} · non deterministici ${nonDet} · incoerenti ${incoerenti.length} | rosso: nuove tipologie ${rossoNuove}`);
if (nonDet) g.push(`${nonDet} club cambiano tipologia fra due letture`);
for (const t of NUOVE) if (!conta[t]) g.push(`nessun club riceve la tipologia ${t}`);
if (incoerenti.length) g.push('tipologie incoerenti con la piazza: ' + incoerenti.slice(0, 5).join(', '));
if (rossoNuove) g.push(`rosso: ${rossoNuove} club ricevono ancora una nuova tipologia`);
// (2) costruzione + costo — prima il riferimento: gli stadi di oggi (rosso), stessa camera
const rif = [];
for (const [t, cap] of [['provincia', 3000], ['storico_it', 18000], ['moderno_it', 30000], ['tedesco', 50000]]) {
  const r = await costruisci(t, cap, true); const ri = r.ri || {};
  rif.push({ t, calls: ri.calls, tri: ri.tri, lights: ri.lights, mesh: (r.s || {}).meshes });
  console.log(`riferimento oggi ${t}:${cap} — draw call ${ri.calls} · triangoli ${ri.tri} · luci ${ri.lights} · mesh ${(r.s || {}).meshes}`);
}
const CALLS_MAX = Math.round(Math.max(...rif.map(x => x.calls || 0)) * (1 + MARG)), TRI_MAX = Math.round(Math.max(...rif.map(x => x.tri || 0)) * (1 + MARG)), LUCI_MAX = Math.max(...rif.map(x => x.lights || 0));
console.log(`tetti: draw call ${CALLS_MAX} · triangoli ${TRI_MAX} · luci ${LUCI_MAX} · mesh ${MESH_MAX}`);
if (!rif.every(x => x.calls > 0)) g.push('riferimento cieco: draw call non lette');
const firma = { borgo: s => s.bank === 3, catino: s => s.crown === 8, mattoni: s => s.gable === true, arena: s => s.crown === 8 };
for (const [t, cap] of [['borgo', 3000], ['catino', 24000], ['mattoni', 22000], ['arena', 60000]]) {
  const v = await costruisci(t, cap, false);
  const s = v.s || {}, calls = v.ri ? v.ri.calls : null;
  const tri = v.ri ? v.ri.tri : null, luci = v.ri ? v.ri.lights : null;
  console.log(`${t}:${cap} verde — tipo ${s.kind} · firma ${firma[t](s)} · tunnel ${s.tunnel ? s.tunnel.stile + ' L' + s.tunnel.L : 'NO'} · mesh ${s.meshes} · draw call TV ${calls} · triangoli TV ${tri} · luci ${luci} · errori ${v.errs.length}${v.fail ? ' · STADFAIL ' + v.fail.msg : ''}`);
  if (tri != null && tri > TRI_MAX) g.push(`${t}: ${tri} triangoli oltre il tetto ${TRI_MAX}`);
  if (luci != null && luci > LUCI_MAX) g.push(`${t}: ${luci} luci, oggi al massimo ${LUCI_MAX}`);
  if (s.kind !== t) g.push(`${t}: la tipologia costruita e' ${s.kind}`);
  if (!firma[t](s)) g.push(`${t}: manca la firma architettonica ${JSON.stringify(s)}`);
  if (!s.tunnel) g.push(`${t}: manca il tunnel d'ingresso`);
  if (!(s.meshes <= MESH_MAX)) g.push(`${t}: ${s.meshes} mesh oltre il tetto ${MESH_MAX}`);
  if (calls != null && calls > CALLS_MAX) g.push(`${t}: ${calls} draw call oltre il tetto ${CALLS_MAX}`);
  if (calls == null) g.push(`${t}: draw call non lette (cieco)`);
  if (v.errs.length || v.fail) g.push(`${t}: errori ${JSON.stringify(v.errs.slice(0, 2))} ${v.fail ? v.fail.msg : ''}`);
}
for (const [t, cap] of [['borgo', 3000], ['arena', 60000]]) {
  const r = await costruisci(t, cap, true); const s = r.s || {};
  console.log(`${t}:${cap} rosso — tipo ${s.kind} · tunnel ${s.tunnel ? 'SI' : 'no'} · terrapieni ${s.bank | 0} · corona ${s.crown | 0} · mesh ${s.meshes}`);
  if (s.kind || s.tunnel || s.bank || s.crown) g.push(`rosso ${t}: la nuova architettura resta accesa`);
}
await b.close(); srv.close();
if (g.length) { console.log('❌ stadi-071'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ stadi-071 verde (tipologie deterministiche e coerenti, costruite senza errori entro il tetto) e il rosso si vede'); process.exit(0);
