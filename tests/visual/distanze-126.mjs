#!/usr/bin/env node
/* [giro 126 PO-328] GUARDIANO DISTANZE — «alcuni highlights sono da distanza troppo importante, in particolare i colpi di testa».
   Sul FLUSSO VERO (salvataggi s1/s5/s12 x semi, autoplay seedato, come distanze-125) misura la distanza eroe<->centro porta al
   CONTATTO (testimone __CPM_CONT121, src/12) di ogni highlight dell'eroe e giudica:
     - nessun TIRO (act shot) oltre 30 m;
     - nessuna scena che promette il LIMITE (titolo /limite/) con tiro oltre 22 m;
     - nessun COLPO DI TESTA oltre 16,5 m (l'area di rigore).
   Metri = hypot(gx, z) x 1,05 m/u (x -50..50 = 105 m, stima dichiarata nel giro 125).
   CAMPIONE MINIMO DICHIARATO: >= 40 tiri, >= 8 tiri «dal limite», >= 6 colpi di testa, >= 2/3 delle partite giocate fino in fondo.
   Sotto il minimo il verdetto e' NON GIUDICATO = ROSSO (PROCESSO.md «Controlli instabili»).
   Prova del rosso: CPM_ROSSO=1 accende __CPM_NO_G126 (i rimedi del giro 126) e il guardiano DEVE diventare rosso (tiri > 30 m).
   CPM_FLAGS=__CPM_NO_G126L,... per bracci di un sotto-punto. CPM_SALVA, CPM_SEMI, CPM_PAR (pagine in parallelo, def. 3), CPM_OUT. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const GLB = process.env.CPM_GLB === '1', ROSSO = process.env.CPM_ROSSO === '1';
const FLAGS = [...(ROSSO ? ['__CPM_NO_G126'] : []), ...(process.env.CPM_FLAGS || '').split(',').filter(Boolean)];
const SEMI = (process.env.CPM_SEMI || '1,2,3,4,5,6,7,8').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || `out/distanze-126-${ROSSO ? 'rosso' : 'verde'}.json`;
const TMAX = +(process.env.CPM_TMAX || 420000);
const M_U = 1.05, S_TIRO = 30, S_LIM = 22, S_TESTA = 16.5, MIN = { tiri: 40, limite: 8, teste: 6 };
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sk, sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm, glb]) => { window.__CPM_GLB = !!glb; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
    for (const f of arm) window[f] = 1;
    for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, FLAGS, GLB]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const sit = {}, cont = []; const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const c = window.__CPM_CURSIT ? window.__CPM_CURSIT() : null;
      const L = (window.__CPM_CONT121 || []).splice(0); const t = window.__CPM_SCOREMIN ? 0 : 0; return { ph, c, L }; }).catch(() => null);
    if (!st) break; ph = st.ph; if (ph === 'ended' || ph === 'ceremony') break;
    if (st.c && (ph === 'hl_choose' || ph === 'hl_result' || ph === 'hl_move' || ph === 'hl_intro') && !sit[st.c.i]) sit[st.c.i] = st.c;
    for (const x of st.L) cont.push(x);
    await sleep(100);
  }
  const R = await page.evaluate(() => window.__CPM_RES218 || []).catch(() => []);
  const mm = await page.evaluate(() => { try { return window.__CPM_SCORE ? window.__CPM_SCORE() : null; } catch (e) { return null; } }).catch(() => null);
  await ctx.close(); return { sk, sd, ph, sit, cont, R, tab: mm };
}
const lavori = []; for (const sk of SAVES) for (const sd of SEMI) lavori.push({ sk, sd });
const fatti = new Array(lavori.length); let p = 0;
await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
  try { fatti[i] = await gioca(lavori[i].sk, lavori[i].sd); } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 100), sit: {}, cont: [], R: [] }; }
  const f = fatti[i]; console.log(`${ROSSO ? 'rosso' : 'verde'} ${f.sk} seme ${f.sd} fine ${f.ph} scene ${Object.keys(f.sit).length} contatti ${f.cont.length}${f.err ? ' ERR ' + f.err : ''}`); } }));
await b.close(); srv.close();
/* una riga per highlight: il contatto dell'eroe (non di cronaca) di quella scena, abbinato al titolo */
const R = [];
for (const f of fatti) { const byS = {}; for (const c of f.cont) { const i = c.sk % 10000; (byS[i] = byS[i] || []).push(c); }
  for (const i of Object.keys(byS)) { const L = byS[i]; const c = L.find(x => !x.bg && x.act) || L.find(x => x.act) || L[0];
    const s = f.sit[i] || {}; const r = (f.R || []).find(x => x.hl === +i) || {};
    R.push({ sk: f.sk, sd: f.sd, i: +i, titolo: String(s.t || ''), label: String(r.label || ''), act: c.act || c.tipo, variante: r.variante || '', gx: c.gx, z: c.z, m: +(Math.hypot(c.gx, c.z) * M_U).toFixed(1) }); } }
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ flags: FLAGS, righe: R, partite: fatti.map(f => ({ sk: f.sk, sd: f.sd, ph: f.ph, err: f.err || null })) }));
const q = (a, k) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(k * s.length))] : '-'; };
const riga = (nome, L, sog) => { const d = L.map(r => r.m); const ov = L.filter(r => r.m > sog);
  console.log(`  ${nome.padEnd(16)} n ${String(d.length).padStart(3)} · mediana ${q(d, .5)} m · p90 ${q(d, .9)} · max ${d.length ? Math.max(...d) : '-'} · oltre ${sog} m: ${ov.length}`); return ov; };
const tiri = R.filter(r => r.act === 'shot'), lim = tiri.filter(r => /limite/i.test(r.titolo)), teste = R.filter(r => r.act === 'header');
const linee = tiri.filter(r => /fra le linee/i.test(r.titolo));
console.log(`\ndistanze-126 · braccio ${ROSSO ? 'ROSSO' : 'verde'}${FLAGS.length ? ' (' + FLAGS.join(',') + ')' : ''} · highlight con contatto ${R.length}`);
const oT = riga('tiri', tiri, S_TIRO), oL = riga('tiri dal limite', lim, S_LIM), oH = riga('colpi di testa', teste, S_TESTA); riga('  di cui fra-linee', linee, S_TIRO);
for (const r of [...oT, ...oL, ...oH].slice(0, 12)) console.log(`    ✗ ${r.m} m · ${r.act}/${r.variante} · ${r.sk} seme ${r.sd} hl ${r.i} · ${r.titolo.slice(0, 50)} | ${r.label.slice(0, 32)}`);
const finite = fatti.filter(f => f.ph === 'ended' || f.ph === 'ceremony').length;
const scarso = []; if (tiri.length < MIN.tiri) scarso.push(`tiri ${tiri.length}<${MIN.tiri}`); if (lim.length < MIN.limite) scarso.push(`tiri dal limite ${lim.length}<${MIN.limite}`);
if (teste.length < MIN.teste) scarso.push(`teste ${teste.length}<${MIN.teste}`); if (finite < Math.ceil(lavori.length * 2 / 3)) scarso.push(`partite finite ${finite}/${lavori.length}`);
const difetti = oT.length + oL.length + oH.length;
console.log(`  partite finite ${finite}/${lavori.length} · campione minimo: tiri ${MIN.tiri}, dal limite ${MIN.limite}, teste ${MIN.teste}`);
if (scarso.length) { console.log(`NON GIUDICATO (= ROSSO): campione sotto il minimo — ${scarso.join(' · ')}`); process.exit(1); }
if (difetti) { console.log(`ROSSO: ${oT.length} tiri > ${S_TIRO} m · ${oL.length} tiri «dal limite» > ${S_LIM} m · ${oH.length} teste > ${S_TESTA} m`); process.exit(1); }
console.log(`VERDE: nessun tiro > ${S_TIRO} m, nessun «dal limite» > ${S_LIM} m, nessuna testa > ${S_TESTA} m`);
