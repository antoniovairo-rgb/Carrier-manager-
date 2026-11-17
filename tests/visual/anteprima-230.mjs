#!/usr/bin/env node
/* [giro 230 · PO-490, decisione PO 16/11 15:00 «Solo bilancio V/N/P»] GUARDIANO anteprima-230 — la rassegna di fine partita
   (fase ended di LiveMatch, src/15), SCHEDA 4, «Prossima partita»: la striscia «Forma» dell'AVVERSARIO (data-cpm
   "anteprima224-forma") NON compare piu' (il gioco non salva la sequenza dei risultati delle altre squadre: le cinque caselle
   erano il bilancio rimescolato da _tvTeamStat, non le ultime cinque vere); il BILANCIO V/N/P (data-cpm "anteprima224-pos")
   c'e' ed e' UGUALE alla riga dell'avversario nella classifica salvata (vittorie, pareggi, sconfitte; anche punti e posizione,
   con lo stesso ordinamento punti → differenza reti → gol fatti della classifica).
   Partita: campionato da professionista dal prompt vero (lib partita-166), soli highlight, pilota seedato 7304, festa forzata;
   classifica riempita dal banco (18 squadre con punti, come rassegna-224). Viewport 375x667.
   ROSSO window.__CPM_NO_G230 (dall'avvio, stessa partita): torna la striscia → DEVE essere bocciato.
   [giro 239 · PO-498] dal giro 239 la striscia torna, ma SOLO con la forma vera salvata in classifica (f239, guardiano forma-239); la
   classifica del banco qui non la porta (come un salvataggio vecchio) → in verde la striscia resta assente. La striscia INVENTATA torna
   solo spegnendo anche il giro 239: il braccio rosso accende __CPM_NO_G230 + __CPM_NO_G239.
   «Non giudicato» (partita non finita, scheda 4 o anteprima non trovate, avversario non in classifica) = rosso.
   Verde e rosso stampati per ultimi. Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node anteprima-230.mjs */
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
import { festa } from './misura-202.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SEME = 7304;
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };

async function riempi(page) {
  return page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const p = s.player || {}; const st = (p.standings || []).map(r => ({ ...r }));
    st.forEach((r, i) => { const w = Math.max(0, 6 - Math.floor(i / 3)), l = Math.min(8, Math.floor(i / 2)), d = 2 + (i % 2); r.wins = w; r.draws = d; r.losses = l; r.played = w + d + l; r.gf = 10 + w * 2 - i % 3; r.ga = 6 + l * 2; r.gd = r.gf - r.ga; r.pts = w * 3 + d; });
    window.__CPM_CAREER.patch({ standings: st }); return st.length;
  });
}
async function misura(page) {
  await page.setViewportSize({ width: 375, height: 667 }); await sleep(600);
  await page.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[3]) d[3].click(); }); await sleep(600);
  return page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const p = s.player || {};
    const wk = p.week || 1; const nx = [...(p.calendar || [])].filter(m => m && !m.played && (m.week | 0) > wk).sort((a, b) => (a.week | 0) - (b.week | 0))[0] || null;
    const ord = [...(p.standings || [])].sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf));
    const i = nx ? ord.findIndex(r => r.id === nx.opponentId) : -1; const r = i >= 0 ? ord[i] : null;
    const q = (k) => document.querySelector(`[data-cpm="${k}"]`);
    return { scheda: !!q('prossima200'), avv: nx ? nx.opponentName : null, attesa: r ? `${i + 1}° · ${r.pts | 0} pt · ${r.wins}V ${r.draws}N ${r.losses}P` : null,
      pos: (q('anteprima224-pos') || {}).innerText || '', forma: !!q('anteprima224-forma'), formaTesto: (q('anteprima224-forma') || {}).innerText || '' };
  });
}
async function braccio(init) {
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init, nome: 'Collaudo Salienti' });
  await apriPrompt166(A.page); const g = await gioca166(A.page, 'solo', { seme: SEME }); await sleep(1200);
  let n = 0, m = null; if (g.finita) { n = await riempi(A.page); await sleep(600); await festa(A.page); m = await misura(A.page); }
  return { A, g, n, m };
}
const pulito = (t) => String(t || '').replace(/\s+/g, ' ').trim();
const giudica = (m) => {
  const bil = pulito(m.pos).match(/(\d+)V (\d+)N (\d+)P/);
  const giudicato = !!(m.scheda && m.attesa && bil);
  return { giudicato, passa: giudicato && !m.forma && pulito(m.pos).includes(m.attesa),
    msg: `avversario «${m.avv}» · bilancio mostrato «${pulito(m.pos)}» · atteso dalla classifica «${m.attesa}» · striscia forma ${m.forma ? 'PRESENTE «' + pulito(m.formaTesto) + '»' : 'assente'}` };
};

console.log('A) verde');
{
  const { A, g, n, m } = await braccio({});
  try {
    ok(verde, g.finita && n >= 16, `partita finita ${JSON.stringify(g.score)} · classifica del banco ${n} squadre`);
    const r = m ? giudica(m) : { giudicato: false, passa: false, msg: 'scheda 4 non misurata' };
    ok(verde, r.passa, (r.giudicato ? '' : 'non giudicato · ') + r.msg);
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
console.log('R) rosso __CPM_NO_G230 + __CPM_NO_G239');
{
  const { A, g, m } = await braccio({ __CPM_NO_G230: true, __CPM_NO_G239: true });
  try {
    const r = m ? giudica(m) : { giudicato: false, passa: false, msg: 'scheda 4 non misurata' };
    console.log('    ' + r.msg);
    ok(rosso, g.finita && r.giudicato && !r.passa && m.forma, `rosso bocciato: ${g.finita && r.giudicato && !r.passa} · striscia tornata ${!!(m && m.forma)} (giudicato ${!!(g.finita && r.giudicato)})`);
  } catch (e) { ok(rosso, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G230 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ anteprima-230 VERDE' : '✗ anteprima-230 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
