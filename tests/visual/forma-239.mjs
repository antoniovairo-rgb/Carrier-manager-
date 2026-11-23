#!/usr/bin/env node
/* [giro 239 · PO-498] GUARDIANO forma-239 — LA FORMA E' QUELLA VERA. Prima la grafica TV pre-partita («Forma · ultime 5», src/15
   _tvTeamStat) mostrava per le altre squadre cinque esiti presi dal bilancio V/N/P in un ordine inventato: il gioco non salvava la
   sequenza dei risultati. Ora updateStandings (src/09) scrive in ogni riga di classifica gli ultimi 5 esiti (f239) e forma239 li
   restituisce solo se coprono le ultime min(5, gare). Tre parti:
   L) LOGICA, sulle funzioni vere: 10 giornate di updateStandings seedate su 18 squadre; la sonda ricava DA SOLA l'esito di ogni squadra
      a ogni giornata (differenza di vittorie/pareggi/sconfitte fra prima e dopo) e pretende forma239 = le sue ultime 5, per tutte le 18.
      Salvataggio vecchio (righe a 10 gare senza f239): forma239 null, e ancora null dopo 4 giornate (copertura 4 < 5), vera alla 5ª.
   T) GRAFICA TV pre-partita (fase walkout, data-cpm tv225), partita di campionato dal prompt vero: (a) l'avversario ha f239 "WDLWW" →
      la striscia dell'ospite e' esattamente V N P V V; (b) salvataggio vecchio senza f239 → nessuna casella, solo «—» (il bilancio
      resta nelle righe sopra).
   A) ANTEPRIMA della rassegna (scheda 4, data-cpm anteprima224-forma) dopo una partita a soli highlight: la classifica del banco porta
      f239 → la striscia c'e' ed e' uguale alla forma salvata del prossimo avversario.
   ROSSO window.__CPM_NO_G239 (dall'avvio): L) f239 non si scrive · T) col salvataggio vecchio torna la striscia inventata · A) la
   striscia sparisce → DEVE essere bocciato in tutte e tre le parti. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node forma-239.mjs   (CPM_SOLO239=L|T|A per una parte sola) */
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166, chiudi166 } from './lib/partita-166.mjs';
import { festa } from './misura-202.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SOLO = process.env.CPM_SOLO239 || '';
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const VNP = s => String(s || '').split('').map(x => x === 'W' ? 'V' : x === 'D' ? 'N' : 'P').join(' ');

/* ---------- L) logica ---------- */
async function parteL(page) {
  return page.evaluate(() => {
    const out = { righe: 0, giuste: 0, sbagliate: [], vecchio: {} };
    const clubs = (typeof CLUBS !== 'undefined' ? CLUBS : []).filter(c => !c.isU18).slice(0, 18);
    let st = initStandings(clubs); const io = clubs[0].id, avv = clubs[1].id; const atteso = {};
    for (let g = 0; g < 10; g++) {
      const prima = Object.fromEntries(st.map(r => [r.id, { w: r.wins, d: r.draws, l: r.losses, p: r.played }]));
      const res = { won: g % 3 === 0, drew: g % 3 === 1, homeScore: g % 3 === 0 ? 2 : 1, awayScore: g % 3 === 2 ? 3 : 1 };
      st = updateStandings(st, io, res, {}, { opponentId: avv, seed: 2390 + g });
      for (const r of st) { const a = prima[r.id]; if (!a || r.played <= a.p) continue; const e = r.wins > a.w ? 'W' : r.draws > a.d ? 'D' : 'L'; atteso[r.id] = ((atteso[r.id] || '') + e); }
    }
    for (const r of st) { out.righe++; const f = forma239(r); const att = (atteso[r.id] || '').slice(-5);
      if (f && f.join('') === att) out.giuste++; else if (out.sbagliate.length < 4) out.sbagliate.push(r.n + ': ' + (f ? f.join('') : 'null') + ' atteso ' + att); }
    /* salvataggio vecchio: 10 gare gia' giocate, nessun f239 */
    let v = initStandings(clubs).map((r, i) => ({ ...r, played: 10, wins: 4, draws: 3, losses: 3, pts: 15, gf: 12, ga: 10, gd: 2 }));
    out.vecchio.subito = forma239(v[5]);
    for (let g = 0; g < 4; g++) v = updateStandings(v, io, { won: true, drew: false, homeScore: 1, awayScore: 0 }, {}, { opponentId: avv, seed: 9000 + g });
    out.vecchio.dopo4 = forma239(v.find(r => r.id === clubs[5].id));
    v = updateStandings(v, io, { won: true, drew: false, homeScore: 1, awayScore: 0 }, {}, { opponentId: avv, seed: 9004 });
    const r5 = v.find(r => r.id === clubs[5].id); out.vecchio.dopo5 = forma239(r5); out.vecchio.f239 = r5.f239 || null;
    return out;
  });
}

/* ---------- T) grafica TV pre-partita ---------- */
async function leggiTV(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
  for (let i = 0; i < 200; i++) {
    const s = await page.evaluate(() => {
      const f = typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null; const tv = document.querySelector('[data-cpm="tv225"]');
      if (tv && /Forma · ultime 5/i.test(tv.innerText || '')) { const riga = [...tv.querySelectorAll('div')].find(d => /^Forma · ultime 5$/i.test((d.textContent || '').trim()));
        const r = riga ? riga.parentElement : null; const lati = r ? [...r.children] : [];
        return { f, fatto: true, casa: lati[0] ? [...lati[0].querySelectorAll('span')].map(x => x.textContent.trim()).join(' ') : null, ospite: lati[2] ? [...lati[2].querySelectorAll('span')].map(x => x.textContent.trim()).join(' ') : null }; }
      if (f === 'matchday') { const b = [...document.querySelectorAll('[data-cpm="prepartita23"] button')].find(x => /^(?:Vedi le formazioni|Gioca la partita)/.test((x.textContent || '').trim())); if (b) b.click(); }
      else if (f) {
        const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && /^(Ingresso in campo|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B[0] && f !== 'walkout') B[0].click(); }
      return { f, fatto: false, bb: [...document.querySelectorAll("button")].filter(x => x.offsetParent).map(x => x.textContent.trim().slice(0, 30)).slice(0, 8) };
    }).catch(() => null);
    if (process.env.CPM_DBG239) console.log(JSON.stringify(s)); if (s && s.fatto) return s; await sleep(150);
  }
  return null;
}
async function parteT(init, conF239) {
  const A = await apriCarriera166({ vp: { width: 412, height: 915 }, init, nome: 'Collaudo Forma' });
  let r = null, avv = null;
  try {
    avv = await A.page.evaluate((conF239) => { const C = window.__CPM_CAREER; const p = C.snapshot(); const md = (p.calendar || []).find(m => m && m.week === p.week && !m.type && !m.played) || null;
      const st = (p.standings || []).map((x, i) => { const w = 4, d = 3, l = 3; const y = { ...x }; delete y.f239;
        /* solo la riga dell'avversario porta 5 gare (3V 1N 1P): cambiare tutte le righe chiudeva il prompt (misurato: la partita non si monta) */
        if (md && x.id === md.opponentId) { Object.assign(y, { played: 5, wins: 3, draws: 1, losses: 1, pts: 10, gf: 8, ga: 5, gd: 3 }); if (conF239) y.f239 = 'WDLWW'; } return y; });
      C.patch({ standings: st }); return md ? { id: md.opponentId, n: md.opponentName, casa: md.isHome } : null; }, conF239);
    await sleep(500); const pr = await apriPrompt166(A.page); if (process.env.CPM_DBG239) console.log(JSON.stringify(pr)); r = await leggiTV(A.page);
  } catch (e) { r = { err: String(e.message).slice(0, 160) }; }
  await A.b.close(); A.srv.close();
  /* l'avversario e' l'ospite se giochiamo in casa */
  const lato = r && avv ? (avv.casa ? r.ospite : r.casa) : null;
  return { r, avv, lato, errs: A.errs };
}

/* ---------- A) anteprima della rassegna ---------- */
async function parteA(init) {
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init, nome: 'Collaudo Salienti' });
  let m = null, g = null;
  try {
    await apriPrompt166(A.page); g = await gioca166(A.page, 'solo', { seme: 7304 }); await sleep(1200);
    if (g.finita) {
      await A.page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); const F = ['WWDLW', 'LDWWL', 'DDWLW', 'WLLDW', 'LWDWD'];
        const st = (p.standings || []).map((r, i) => { const f = F[i % F.length]; const w = 3 + (i % 3), d = 2, l = 5 - (i % 3); return { ...r, wins: w, draws: d, losses: l, played: w + d + l, pts: w * 3 + d, gf: 14 - i % 5, ga: 10, gd: 4 - i % 5, f239: f }; });
        C.patch({ standings: st }); });
      await sleep(600); await festa(A.page); await A.page.setViewportSize({ width: 375, height: 667 }); await sleep(600);
      await A.page.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[3]) d[3].click(); }); await sleep(600);
      m = await A.page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const wk = p.week || 1;
        const nx = [...(p.calendar || [])].filter(x => x && !x.played && (x.week | 0) > wk).sort((a, b) => (a.week | 0) - (b.week | 0))[0] || null;
        const r = nx ? (p.standings || []).find(x => x.id === nx.opponentId) : null; const q = document.querySelector('[data-cpm="anteprima224-forma"]');
        return { scheda: !!document.querySelector('[data-cpm="prossima200"]'), avv: nx ? nx.opponentName : null, avvId: nx ? nx.opponentId : null, f239: r ? r.f239 : null, played: r ? r.played : null,
          forma: q ? [...q.querySelectorAll('span span')].map(x => x.textContent.trim()).join(' ') : null }; });
      /* [giro 344] DECISIONE PO-609 (giro 336): la rassegna mostra la classifica DOPO la giornata, quindi la forma dell'avversario
         include il suo risultato di questa giornata. Il riferimento e' la forma che il gioco SALVA tornando alla carriera (come
         partita-336 F5), non quella del banco prima della giornata. Confronto esatto, soglie invariate. */
      if (m && m.avvId) { await chiudi166(A.page); await sleep(1500);
        const d = await A.page.evaluate((id) => { const r = (window.__CPM_CAREER.snapshot().standings || []).find(x => x.id === id); return r ? { f239: r.f239 || null, played: r.played } : null; }, m.avvId);
        m.f239Banco = m.f239; m.f239 = d ? d.f239 : null; m.played = d ? d.played : null; }
    }
  } catch (e) { m = { err: String(e.message).slice(0, 160) }; }
  await A.b.close(); A.srv.close();
  return { g, m, errs: A.errs };
}

const ROSSO = { __CPM_NO_G239: true };
if (!SOLO || SOLO === 'L') {
  for (const [arr, init, nome] of [[verde, {}, 'L) verde'], [rosso, ROSSO, 'L) rosso __CPM_NO_G239']]) {
    console.log(nome);
    const A = await apriCarriera166({ init, nome: 'Collaudo Forma' });
    let L = null; try { L = await parteL(A.page); } catch (e) { L = { err: String(e.message).slice(0, 160) }; }
    await A.b.close(); A.srv.close();
    const giud = !!L && !L.err && L.righe === 18;
    const passa = giud && L.giuste === 18 && L.vecchio.subito === null && L.vecchio.dopo4 === null && !!L.vecchio.dopo5 && L.vecchio.dopo5.join('') === L.vecchio.f239;
    const msg = L && !L.err ? `forma vera ${L.giuste}/${L.righe}${L.sbagliate.length ? ' · ' + L.sbagliate.join(' · ') : ''} · salvataggio vecchio: subito ${JSON.stringify(L.vecchio.subito)} · dopo 4 ${JSON.stringify(L.vecchio.dopo4)} · dopo 5 ${JSON.stringify(L.vecchio.dopo5)}` : 'non giudicato ' + (L && L.err);
    if (arr === verde) ok(verde, passa, msg); else { console.log('    ' + msg); ok(rosso, giud && !passa, `rosso bocciato: ${giud && !passa} (giudicato ${giud})`); }
  }
}
if (!SOLO || SOLO === 'T') {
  console.log('T) verde · grafica TV pre-partita');
  { const a = await parteT({}, true); const b = await parteT({}, false);
    ok(verde, a.lato === 'V N P V V', `(a) avversario «${a.avv && a.avv.n}» con forma salvata WDLWW → striscia «${a.lato}» (atteso «V N P V V»)${a.r && a.r.err ? ' · ' + a.r.err : ''}`);
    ok(verde, b.lato === '—', `(b) salvataggio vecchio senza forma → «${b.lato}» (atteso «—», solo bilancio)`);
    ok(verde, a.errs.length + b.errs.length === 0, `zero errori di pagina ${JSON.stringify([...a.errs, ...b.errs].slice(0, 2))}`); }
  console.log('T) rosso __CPM_NO_G239');
  { const b = await parteT(ROSSO, false); console.log(`    (b) salvataggio vecchio → «${b.lato}»`);
    ok(rosso, b.lato != null && b.lato !== '—' && /^[VNP]( [VNP]){4}$/.test(b.lato), `rosso bocciato: torna la striscia inventata «${b.lato}» (giudicato ${b.lato != null})`); }
}
if (!SOLO || SOLO === 'A') {
  console.log('A) verde · anteprima della rassegna');
  { const { g, m, errs } = await parteA({}); const att = m && m.f239 ? VNP(m.f239.slice(-Math.min(5, m.played | 0))) : null;
    ok(verde, !!(g && g.finita && m && m.scheda && att && m.forma === att), `partita finita ${!!(g && g.finita)} · avversario «${m && m.avv}» · striscia «${m && m.forma}» · forma salvata «${att}»${m && m.err ? ' · ' + m.err : ''}`);
    ok(verde, errs.length === 0, `zero errori di pagina ${JSON.stringify(errs.slice(0, 2))}`); }
  console.log('A) rosso __CPM_NO_G239');
  { const { g, m } = await parteA(ROSSO); const att = m && m.f239Banco ? VNP(m.f239Banco) : null;/* [giro 344] il rosso giudica la striscia sparita contro la forma che il banco ha messo */ const giud = !!(g && g.finita && m && m.scheda && att);
    console.log(`    striscia «${m && m.forma}» · forma salvata «${att}»`);
    ok(rosso, giud && m.forma !== att, `rosso bocciato: ${giud && m.forma !== att} (giudicato ${giud})`); }
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G239 bocciato: ${rosso.filter(x => x[0]).length}/${rosso.length} ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ forma-239 VERDE' : '✗ forma-239 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
