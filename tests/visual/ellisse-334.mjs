#!/usr/bin/env node
/* GUARDIANO giro 334 (PO-610, decisione PO 23/11 «Ellisse d'attesa») — «CHI ASPETTA PRIMA DELL'AZIONE NON PASSA MAI DA FERMO».

   CAUSA (giro 331, movimento-147 a velocita' reale): l'attesa attiva (7.999.144) era un avanti-e-indietro di 1 u a 1,6 rad/s: la
   velocita' 1,6·|cos| passa dallo zero due volte per giro e sta sotto 0,5 u/s per circa il 20% del tempo, per costruzione. Dal giro
   334 il punto fa un piccolo giro (ellisse 1 u × 0,5 u): la velocita' sta fra 0,8 e 1,6 u/s.

   COSA MISURA. Scene forzate, GLB acceso, stacco di scena attivo (__CPM_PRESENT=1), una pagina nuova per scena, un campione per
   FOTOGRAMMA registrato dentro la pagina, nelle fasi prima della scelta (hl_intro / hl_move / hl_choose).
   ⚠️ QUI IL TEMPO E' QUELLO DELL'OROLOGIO DELLA PAGINA (performance.now), NON IL TEMPO DI SCENA: l'attesa attiva si muove su quell'orologio
   (`now` del ciclo di disegno), quindi la sua velocita' vera e' spazio / orologio su qualunque macchina. Il tempo di scena sul banco
   GLB-acceso e' tappato (0,05 s a fotogramma) e gonfierebbe le velocita' (lezione del giro 331).
   · si salta il primo 1,5 s (apertura della scena);
   · contano solo i campioni col corpo fra 3,5 e 33 u dal pallone: oltre 35 u dalla base il gioco fa solo il respiro (fuori dal raggio di
     movimento-147), vicino al pallone vale l'invariante del giro 286 (fermo). MISURATO: in gi31/gi54 a volte il pallone si allontana
     oltre 35 u in hl_move e i corpi lontani passano al respiro: senza questo filtro contavano come «fermi al 60-80%»;
     e un corpo a cui il pallone passa entro 3,5 u esce dalla misura da quel momento (lo ferma il blocco del giro 286, e resta fermo);
   · «corpo in attesa attiva» = corpo che nella finestra occupa un rettangolo con lato maggiore fra 0,9 e 2,6 u (ellisse o segmento di
     1 u di raggio; chi fa solo il respiro, il portiere, chi ha il pallone e chi corre restano fuori) — almeno 4 per scena, o la scena
     e' NON GIUDICATA = rosso;
   · velocita' su base di almeno 0,3 s di orologio; quota dei campioni sotto 0,5 u/s, sommata su tutti i corpi di tutte le scene.
   MISURATO (3 corse complete, 8 scene, 8-9 mila campioni per braccio): VERDE 0,1-0,6% dei campioni sotto 0,5 u/s, velocita' minima dei
   corpi 0,58-0,78 u/s (attesa 0,8 meno l'arrotondamento); ROSSO 20,7-20,8% (attesa teorica 20%), ogni scena fra 18 e 25%.
   Soglie fissate DOPO la misura: VERDE quota <= 5%; ROSSO (__CPM_NO_G334, l'avanti-e-indietro) quota >= 12%.
   ⚠️ gi54 NON e' in lista: li' il pallone viaggia durante la lettura e a scena in corso un avversario diventa il portatore (giro 286:
   fermo di colpo, k286 = 0). Misurato 3 volte su 4 un corpo «fermo al 48-63%» che e' il portatore, non un corpo in attesa.
   In piu', nel verde: nessun corpo in attesa con la velocita' minima sotto 0,5 u/s per piu' del 10% dei suoi campioni.

     CPM_CHROME=… node ellisse-334.mjs      · CPM_SOLO=verde|rosso · CPM_SCENE=6,31,… · CPM_SEC=<secondi di orologio, default 8>
     CPM_FOTO=<cartella>  salva per la prima scena due foto del gioco per braccio e il disegno delle strade dei corpi (collaudo PO) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const SCENE = (process.env.CPM_SCENE || '31,36,44,20,60,80,140,160').split(',').map(Number);
const SEC = +(process.env.CPM_SEC || 8), SALTA = 1.5, BASE = 0.3, FERMO = 0.5, FOTO = process.env.CPM_FOTO || '';
const VERDE_MAX = 5, ROSSO_MIN = 12, CORPO_MAX = 10, MIN_CORPI = 4;
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });

function analizza(R) {
  if (R.length < 2) return { nonGiud: 'nessun fotogramma prima della scelta' };
  const t0 = R[0].t; R = R.filter(f => (f.t - t0) / 1000 >= SALTA);
  const dur = R.length ? (R[R.length - 1].t - R[0].t) / 1000 : 0;
  if (R.length < 20 || dur < SEC * 0.6) return { nonGiud: `solo ${R.length} fotogrammi in ${dur.toFixed(1)} s di orologio dopo l'apertura` };
  const corpi = [];
  for (let i = 0; i < 22; i++) { let P = R.map(f => f.pl[i] ? { t: f.t / 1000, x: f.pl[i][0] - 50, z: (f.pl[i][1] - 50) * 0.68, ph: f.ph, db: f.b ? Math.hypot(f.b[0] - f.pl[i][0], (f.b[1] - f.pl[i][1]) * 0.68) : -1 } : null).filter(Boolean);
    const tocco = P.findIndex(p => p.db >= 0 && p.db <= 3.5); if (tocco >= 0) P = P.slice(0, tocco);/* dal momento in cui il pallone gli passa accanto il corpo e' del giro 286: si ferma e RESTA fermo (blocco lk286), misurato su gi54 corpo 19 */
    P = P.filter(p => p.db < 0 || p.db < 33);/* fra 3,5 e 33 u dal pallone: oltre 35 u il gioco fa solo il respiro, entro 1,8 u vale il giro 286 */
    if (P.length < 20) continue;
    const xs = P.map(p => p.x), zs = P.map(p => p.z), lato = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
    if (!(lato >= 0.9 && lato <= 2.6)) continue;
    let n = 0, f = 0, j = 0, vmin = 1e9;
    for (let k = 0; k < P.length; k++) { if (j <= k) j = k + 1; while (j < P.length && P[j].t - P[k].t < BASE) j++; if (j >= P.length) break;
      const dt = P[j].t - P[k].t; if (dt > 1.2) continue; const v = Math.hypot(P[j].x - P[k].x, P[j].z - P[k].z) / dt; n++; if (v < FERMO) f++; if (v < vmin) vmin = v; }
    if (process.env.CPM_TRACCIA && n >= 10 && f / n > 0.1) console.log(`     corpo ${i}: ` + P.filter((_, k) => k % 6 === 0).map(p => `${(p.t - P[0].t).toFixed(1)}s ${p.ph.slice(3, 5)}(${p.x.toFixed(2)};${p.z.toFixed(2)}) pallone a ${p.db.toFixed(1)}`).join(' '));
    if (n >= 10) corpi.push({ i, n, f, vmin: +vmin.toFixed(2), lato: +lato.toFixed(2), P }); }
  if (corpi.length < MIN_CORPI) return { nonGiud: `solo ${corpi.length} corpi in attesa attiva (minimo ${MIN_CORPI})` };
  return { corpi, fot: R.length, dur: +dur.toFixed(1) };
}

function disegno(titolo, corpi) {/* strade dei corpi viste dall'alto, 1 u = 60 px, ogni corpo centrato nella sua casella */
  const C = corpi.slice(0, 8), L = 200; let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${L * 4}" height="${L * 2 + 40}" style="background:#12301c;font-family:sans-serif"><text x="10" y="26" fill="#fff" font-size="20">${titolo}</text>`;
  C.forEach((c, k) => { const cx = (k % 4) * L + L / 2, cy = 40 + Math.floor(k / 4) * L + L / 2, mx = c.P.reduce((a, p) => a + p.x, 0) / c.P.length, mz = c.P.reduce((a, p) => a + p.z, 0) / c.P.length;
    s += `<rect x="${(k % 4) * L + 2}" y="${42 + Math.floor(k / 4) * L}" width="${L - 4}" height="${L - 4}" fill="none" stroke="#2c6b3f"/><polyline fill="none" stroke="#ffd84d" stroke-width="2" points="${c.P.map(p => `${(cx + (p.x - mx) * 60).toFixed(1)},${(cy + (p.z - mz) * 60).toFixed(1)}`).join(' ')}"/>`;
    s += c.P.map(p => `<circle cx="${(cx + (p.x - mx) * 60).toFixed(1)}" cy="${(cy + (p.z - mz) * 60).toFixed(1)}" r="2.2" fill="#fff"/>`).join('');
    s += `<text x="${(k % 4) * L + 8}" y="${40 + Math.floor(k / 4) * L + L - 10}" fill="#fff" font-size="13">corpo ${c.i} · fermo ${Math.round(100 * c.f / c.n)}% · min ${c.vmin} u/s</text>`; });
  return s + '</svg>';
}

async function caso(gi, rosso, nome, foto) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: foto ? 2 : 1 }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G334 = 1;
    window.__R334 = []; const giro = () => { try { if (window.__R334_ON && window.__CPM_PHASE && window.__CPM_PLPOS) { const ph = window.__CPM_PHASE(); if (/^hl_(intro|move|choose)$/.test(ph || '')) { const pl = []; for (let i = 0; i < 22; i++) { const q = window.__CPM_PLPOS(i); pl.push(q ? [q.mx, q.my] : null); } let o = null; try { o = window.__CPM_OWN && window.__CPM_OWN(); } catch (_e) {} window.__R334.push({ t: performance.now(), ph, pl, b: o ? [o.x, o.y] : null }); } } } catch (_e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); }, rosso);
  try {
    await openMatch(page, port, { name: nome }); await sleep(600);
    const t9 = Date.now(); let glb = false; while (Date.now() - t9 < 60000) { if (await page.evaluate(() => window.__CPM_GLB_READY === true)) { glb = true; break; } await sleep(400); }
    if (!glb) { await page.close(); return { nonGiud: 'modelli GLB non pronti: la misura va fatta coi corpi veri' }; }
    if (!await page.evaluate(g => { window.__CPM_FROZEN = false; window.__R334 = []; window.__R334_ON = 1; return window.__CPM_FORCE_SIT(g, false); }, gi)) { await page.close(); return { nonGiud: 'force fallito' }; }
    /* si aspetta un EVENTO: SEC secondi di orologio della pagina dal primo fotogramma prima della scelta (tetto 120 s) */
    const t0 = Date.now(); let nf = 0;
    while (Date.now() - t0 < 120000) { await sleep(400);
      const s = await page.evaluate(() => { const R = window.__R334; return R.length ? (R[R.length - 1].t - R[0].t) / 1000 : 0; });
      if (foto && nf < 2 && s >= SALTA + 2 + nf * 1.0) { await page.screenshot({ path: `${foto}/${rosso ? 'prima' : 'dopo'}-gi${gi}-${nf + 1}.png` }); nf++; }
      if (s >= SALTA + SEC) break; }
    const R = await page.evaluate(() => { window.__R334_ON = 0; return window.__R334; }); await page.close();
    return analizza(R);
  } catch (e) { try { await page.close(); } catch (_e) {} return { nonGiud: 'errore: ' + String(e.message || e).slice(0, 100) }; }
}

async function braccio(rosso) {
  const dif = []; let N = 0, F = 0, k = 0;
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G334, avanti-e-indietro)' : 'VERDE (ellisse)'} —`);
  for (const gi of SCENE) { k++; const nome = 'Attesa' + 'ABCDEFGHIJKLMNOP'[k % 16];/* stesso nome nei due bracci: stessa scena, stesso seme */
    const o = await caso(gi, rosso, nome, FOTO && k === 1 ? FOTO : '');
    if (o.nonGiud) { console.log(`  ⚠ gi${gi}: NON GIUDICATO (${o.nonGiud})`); dif.push(`gi${gi}: non giudicato (${o.nonGiud})`); continue; }
    const n = o.corpi.reduce((a, c) => a + c.n, 0), f = o.corpi.reduce((a, c) => a + c.f, 0); N += n; F += f;
    const peggio = o.corpi.filter(c => 100 * c.f / c.n > CORPO_MAX);
    console.log(`  · gi${gi}: ${o.corpi.length} corpi in attesa · ${o.fot} fotogrammi in ${o.dur} s · sotto ${FERMO} u/s ${(100 * f / n).toFixed(1)}% dei campioni · velocita' minima fra i corpi ${Math.min(...o.corpi.map(c => c.vmin))} u/s · corpi oltre il ${CORPO_MAX}% di fermo: ${peggio.length}`);
    if (!rosso && peggio.length) dif.push(`gi${gi}: ${peggio.length} corpi fermi oltre il ${CORPO_MAX}% (${peggio.map(c => `corpo ${c.i} ${Math.round(100 * c.f / c.n)}%`).join(', ')})`);
    if (FOTO && k === 1) { const pg = await b.newPage({ viewport: { width: 800, height: 440 } }); await pg.setContent(`<body style="margin:0">${disegno(rosso ? 'PRIMA — avanti e indietro (strade dei corpi dall\'alto)' : 'DOPO — ellisse (strade dei corpi dall\'alto)', o.corpi)}</body>`); await pg.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-strade-gi${gi}.png` }); await pg.close(); } }
  return { dif, quota: N ? +(100 * F / N).toFixed(1) : null, N };
}
const SOLO = process.env.CPM_SOLO || '';
let ok = true; const fine = [];
if (SOLO !== 'rosso') { const r = await braccio(false);
  if (r.dif.length) { ok = false; fine.push(`braccio VERDE: ${r.dif.join(' | ')}`); }
  if (r.quota == null || r.quota > VERDE_MAX) { ok = false; fine.push(`braccio VERDE: sotto ${FERMO} u/s il ${r.quota}% dei campioni (tetto ${VERDE_MAX})`); } else fine.push(`braccio VERDE: sotto ${FERMO} u/s il ${r.quota}% di ${r.N} campioni (tetto ${VERDE_MAX})`); }
if (SOLO !== 'verde') { const r = await braccio(true);
  if (r.dif.length) { ok = false; fine.push(`braccio ROSSO: ${r.dif.join(' | ')}`); }
  if (r.quota == null || r.quota < ROSSO_MIN) { ok = false; fine.push(`braccio ROSSO: sotto ${FERMO} u/s solo il ${r.quota}% dei campioni (atteso almeno ${ROSSO_MIN}): il guardiano non separa`); } else fine.push(`braccio ROSSO: sotto ${FERMO} u/s il ${r.quota}% di ${r.N} campioni (atteso almeno ${ROSSO_MIN})`); }
await b.close(); srv.close();
for (const r of fine) console.log(r);
console.log(ok ? `\n✅ ellisse-334 VERDE (verde col verde, rosso col rosso): chi aspetta prima dell'azione non passa mai da fermo.` : `\n❌ ellisse-334 ROSSO — ${fine.join(' · ')}`);
process.exit(ok ? 0 : 1);
