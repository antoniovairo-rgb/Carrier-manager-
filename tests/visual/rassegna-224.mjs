#!/usr/bin/env node
/* [giro 224 · PO-488 + PO-490] GUARDIANO rassegna-224 — la rassegna di fine partita (fase ended di LiveMatch, src/15).
   PO-488 (foto PO 195, «Statistiche non si vedono bene, hanno bisogno di più spazio!»): nella SCHEDA 1 il tabellino della gara
     ha UNA VOCE PER RIGA a tutta larghezza (nessuna riga condivisa da due voci, ogni voce larga almeno il 90% del tabellino), nessun
     testo che si sovrappone a un altro, almeno 8 px fra un numero e la sua voce, testo di almeno 12 px; pagella, commento del mister e
     momenti chiave stanno nella SCHEDA 2; la scheda 1 resta entro 1,3 schermi (vincolo del giro 202) a 360x640 · 375x667 · 390x844 e
     PC 1366x768; quattro puntini, Avanti/Salta sulle schede 1-3, piede in fondo alla finestra.
   PO-490 (foto PO 195, scheda 4 semivuota): la SCHEDA 4 ha la classifica lunga (almeno 8 righe su un campionato da 18, con la tua,
     zone colorate e legenda), i tuoi numeri di stagione (gol, assist, presenze, voto medio) e l'anteprima della prossima partita
     (posizione e forma dell'avversario); il contenuto occupa almeno il 75% dello spazio sopra il piede a 375x667 e resta entro 1,3
     schermi; nessun testo sovrapposto, testo di almeno 12 px.
   ACCORDI dei momenti chiave: nessun testo di pushMatchEvent in src/15 con «Tuo» davanti a un nome femminile o «Tua» davanti a un
     maschile, e il momento del gol su palla ferma (momentoPiazzato224) dice «Tuo gol su rigore/punizione».
   Partita: campionato da professionista dal prompt vero (lib partita-166), soli highlight, pilota seedato 7304 (la partita con piu'
   eventi del giro 202), festa forzata; classifica e storico di stagione riempiti dal banco (18 squadre con punti, 5 partite con voto).
   ROSSO window.__CPM_NO_G224 (dall'avvio, stessa partita): la rassegna del giro 202 → DEVE essere bocciato.
   «Non giudicato» (partita non finita, rassegna/tabellino/scheda non trovati) = rosso. Verde e rosso stampati per ultimi.
   Foto in docs/sviluppo/giro224/. Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rassegna-224.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
import { festa } from './misura-202.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro224'); fs.mkdirSync(FOTO, { recursive: true });
const TETTO = 1.3, PIENA = 0.75, GAP = 8, FMIN = 12, MOBILI = [[360, 640], [375, 667], [390, 844]], PC = [1366, 768], SEME = 7304;
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const vai = (page, k) => page.evaluate((k) => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (!d[k]) return false; d[k].click(); return true; }, k);

/* ---------- accordi (statico + funzione del gioco) ---------- */
const FEM = 'punizione|rete|ammonizione|espulsione|traversa|parata|occasione|rimessa|sostituzione|doppietta|tripletta|giocata|conclusione|rovesciata|incornata|testata';
const MAS = 'gol|rigore|assist|cartellino|palo|tiro|colpo|calcio|corner|cross|pallonetto|dribbling';
const MALE = new RegExp(`\\bTuo (${FEM})\\b|\\bTua (${MAS})\\b`, 'i');
function accordiStatici() {
  const src = fs.readFileSync(path.join(ROOT, 'src', '15-live-match.jsx'), 'utf8');
  const chiamate = src.match(/pushMatchEvent\([^;]*/g) || [];
  const stringhe = chiamate.flatMap(c => (c.match(/"[^"]*"|'[^']*'|`[^`]*`/g) || []));
  const male = stringhe.filter(x => MALE.test(x));
  return { chiamate: chiamate.length, stringhe: stringhe.length, male };
}

/* ---------- banco: classifica a 18 con punti, cinque partite con voto ---------- */
async function riempi(page) {
  return page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const p = s.player || {}; const st = (p.standings || []).map(r => ({ ...r }));
    st.forEach((r, i) => { const w = Math.max(0, 6 - Math.floor(i / 3)), l = Math.min(8, Math.floor(i / 2)), d = 2; r.wins = w; r.draws = d; r.losses = l; r.played = w + d + l; r.gf = 10 + w * 2 - i % 3; r.ga = 6 + l * 2; r.gd = r.gf - r.ga; r.pts = w * 3 + d; });
    const mh = [6.4, 7.1, 6.8, 7.5, 6.2].map((v, i) => ({ season: p.season || 2, week: 1, opponent: 'Banco ' + i, homeScore: 1, awayScore: 1, goals: i === 3 ? 1 : 0, assists: 0, rating: v, won: false, drew: true, friendly: true }));
    window.__CPM_CAREER.patch({ standings: st, matchHistory: mh, goals: 3, assists: 2, matches: 8 }); return st.length;
  });
}

/* ---------- misura di una scheda ---------- */
async function leggi(page, k) {
  return page.evaluate(({ k, FMIN }) => {
    const H = window.innerHeight, root = document.querySelector('[data-cpm="rassegna200"]'); if (!root) return null;
    const sc = root.firstElementChild, piede = document.querySelector('[data-cpm="piede202"]'); if (!sc || !piede) return null;
    const vis = (e) => !!(e && e.offsetParent);
    const testi = (box) => { const out = []; const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { if (!(n.textContent || '').trim() || !vis(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n);
        /* il rettangolo del glifo si ritaglia sulla scatola del suo elemento: con lineHeight 1 il glifo sporge di 2-3 px sopra e sotto
           la riga senza toccare niente (misurato sul «Il tuo tabellino» della scheda 2, uguale nel rosso e nella foto pulita) */
        const pb = n.parentElement.getBoundingClientRect();
        const rs = [...rg.getClientRects()].map(r => ({ left: r.left, right: r.right, top: Math.max(r.top, pb.top), bottom: Math.min(r.bottom, pb.bottom) })).filter(r => r.right - r.left > 0 && r.bottom - r.top > 0); if (!rs.length) continue;
        out.push({ t: n.textContent.trim().slice(0, 24), fs: parseFloat(getComputedStyle(n.parentElement).fontSize), rs }); } return out; };
    const sovrapposti = (T) => { let n = 0, es = []; for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) for (const a of T[i].rs) for (const b of T[j].rs) {
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 1 && oy > 1) { n++; if (es.length < 3) es.push(T[i].t + '×' + T[j].t); } } return { n, es }; };
    const pr = piede.getBoundingClientRect();
    const out = { k, H, schermi: +((sc.scrollHeight + pr.height) / H).toFixed(2), piedeFondo: Math.round(pr.bottom),
      puntini: document.querySelectorAll('[data-cpm="puntino200"]').length, avanti: !!document.querySelector('[data-cpm="avanti200"]'), salta: !!document.querySelector('[data-cpm="salta200"]'),
      titolo: (document.querySelector('[data-cpm="titolo200"]') || {}).innerText || null };
    const scheda = [...sc.querySelectorAll('[data-scheda200]')].filter(vis);
    /* pienezza: fondo VERO del contenuto visibile (non scrollHeight, che non scende mai sotto l'altezza della colonna) */
    sc.scrollTop = 0; const fondo = scheda.length ? Math.max(...scheda.map(e => e.getBoundingClientRect().bottom)) : 0;
    out.piena = +((fondo - sc.getBoundingClientRect().top) / (H - pr.height)).toFixed(2);
    const Tall = scheda.flatMap(testi); out.sovrScheda = sovrapposti(Tall); out.fsMin = Tall.length ? Math.min(...Tall.map(x => x.fs)) : 0;
    const pag = [...sc.querySelectorAll('[data-scheda200]')].find(e => /PAGELLA/.test(e.textContent || '') && /MOMENTI CHIAVE|PAGELLA/.test(e.textContent || ''));
    out.pagellaScheda = pag ? pag.getAttribute('data-scheda200') : null;
    if (k === 0) {
      const tab = document.querySelector('[data-cpm="tabellino202"]'); const V = tab ? [...tab.querySelectorAll('[data-cpm="tab202-voce"]')].filter(vis) : [];
      out.tabVisibile = vis(tab); out.voci = V.length;
      const cont = V.length ? V[0].parentElement.getBoundingClientRect().width : 0;
      const R = V.map(v => v.getBoundingClientRect());
      out.vociPerRiga = R.length ? Math.max(...R.map(a => R.filter(b => { const c = (b.top + b.bottom) / 2; return c >= a.top && c <= a.bottom; }).length)) : 0;
      out.largMin = R.length && cont ? +(Math.min(...R.map(a => a.width)) / cont).toFixed(2) : 0;
      let gmin = 1e9; for (const v of V) { const t = testi(v).filter(x => x.rs.length); const xs = t.map(x => ({ l: Math.min(...x.rs.map(r => r.left)), r: Math.max(...x.rs.map(r => r.right)), y: x.rs[0].top })).sort((a, b) => a.l - b.l);
        for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i].y - xs[i - 1].y) < 6) gmin = Math.min(gmin, xs[i].l - xs[i - 1].r); }
      out.gapMin = gmin === 1e9 ? null : Math.round(gmin);
      const T = tab ? testi(tab) : []; out.sovrTab = sovrapposti(T); out.fsTab = T.length ? Math.min(...T.map(x => x.fs)) : 0;
    }
    if (k === 3) {
      out.righe = document.querySelectorAll('[data-cpm="classifica200-io"],[data-cpm="classifica224-riga"]').length;
      out.io = !!document.querySelector('[data-cpm="classifica200-io"]'); out.zone = !!document.querySelector('[data-cpm="zone224"]');
      out.colorate = [...document.querySelectorAll('[data-cpm="classifica224"] > div')].filter(e => /inset/.test(e.style.boxShadow || '')).length;
      out.stagione = (document.querySelector('[data-cpm="stagione224"]') || {}).innerText || '';
      out.prossima = !!document.querySelector('[data-cpm="prossima200"]'); out.pos = !!document.querySelector('[data-cpm="anteprima224-pos"]'); out.forma = !!document.querySelector('[data-cpm="anteprima224-forma"]');
      out.occhio = (document.querySelector('[data-cpm="anteprima224-occhio"]') || {}).innerText || '';
    }
    return out;
  }, { k, FMIN });
}
async function giudica(page, w, h, braccio, foto) {
  await page.setViewportSize({ width: w, height: h }); await sleep(600);
  const S = [];
  for (let k = 0; k < 4; k++) { await vai(page, k); await sleep(450); S.push(await leggi(page, k)); if (foto && k !== 2) await page.screenshot({ path: path.join(FOTO, `${foto}-${w}x${h}-scheda${k + 1}.png`) }); }
  await vai(page, 0); await sleep(300);
  if (S.some(x => !x)) return { passa: false, msg: `${w}x${h}: non giudicato (rassegna o piede non trovati)` };
  const [a, , , d] = S;
  const s1 = a.tabVisibile && a.voci > 0 && a.vociPerRiga === 1 && a.largMin >= 0.9 && a.gapMin != null && a.gapMin >= GAP && a.sovrTab.n === 0 && a.fsTab >= FMIN && a.schermi <= TETTO && a.pagellaScheda === '2';
  const nav = S.every((x, i) => x.puntini === 4 && Math.abs(x.piedeFondo - x.H) <= 2 && (i < 3 ? (x.avanti && x.salta) : true));
  const pulite = S.every(x => x.sovrScheda.n === 0 && x.fsMin >= FMIN);
  const s4 = d.righe >= 8 && d.io && d.zone && d.colorate >= 3 && /Gol/.test(d.stagione) && /Assist/.test(d.stagione) && /Presenze/.test(d.stagione) && /Voto medio/.test(d.stagione) && d.prossima && d.pos && d.forma && d.schermi <= TETTO && (w !== 375 || d.piena >= PIENA);
  const passa = s1 && nav && pulite && s4;
  const msg = `${w}x${h} [${braccio}]: scheda1 ${a.schermi} schermi · tabellino ${a.voci} voci, voci per riga ${a.vociPerRiga}, larghezza min ${a.largMin}, spazio numero↔voce min ${a.gapMin} px, sovrapposti ${a.sovrTab.n}${a.sovrTab.es.length ? ' ' + a.sovrTab.es.join(',') : ''}, testo min ${a.fsTab} px · pagella nella scheda ${a.pagellaScheda} · ` +
    `scheda4 ${d.schermi} schermi, piena ${d.piena}, righe ${d.righe} (colorate ${d.colorate}, legenda ${d.zone}), stagione «${d.stagione.replace(/\s+/g, ' ').slice(0, 70)}», anteprima pos ${d.pos} forma ${d.forma} occhio «${d.occhio.replace(/\s+/g, ' ')}» · ` +
    `sovrapposti per scheda ${S.map(x => x.sovrScheda.n + (x.sovrScheda.es.length ? '(' + x.sovrScheda.es.join(',') + ')' : '')).join('/')} · testo min ${S.map(x => x.fsMin).join('/')} px · nav ${nav} · titoli ${S.map(x => x.titolo).join(' | ')}`;
  return { passa, msg, S };
}
async function prepara(pc, init) {
  const A = await apriCarriera166({ vp: pc ? { width: PC[0], height: PC[1] } : { width: 375, height: 667 }, mobile: !pc, init, nome: 'Collaudo Salienti' });
  await apriPrompt166(A.page); const g = await gioca166(A.page, 'solo', { seme: SEME }); await sleep(1200);
  let n = 0; if (g.finita) { n = await riempi(A.page); await sleep(600); await festa(A.page); }
  return { A, g, n };
}

console.log('S) accordi dei momenti chiave (statico)');
const st = accordiStatici();
ok(verde, st.chiamate >= 10 && st.male.length === 0, `testi di pushMatchEvent in src/15: ${st.chiamate} chiamate, ${st.stringhe} stringhe, accordi sbagliati ${st.male.length}${st.male.length ? ' ' + st.male.slice(0, 3).join(' | ') : ''}`);

console.log('A) verde — mobile 360x640 · 375x667 · 390x844');
{
  const { A, g, n } = await prepara(false, {});
  try {
    ok(verde, g.finita && n >= 16, `partita finita ${JSON.stringify(g.score)} · classifica del banco ${n} squadre`);
    const acc = await A.page.evaluate(() => typeof momentoPiazzato224 === 'function' ? [momentoPiazzato224('rigore', 9), momentoPiazzato224('punizione', 18)] : null);
    ok(verde, acc && acc.every(x => !MALE_T(x)) && /Tuo gol su punizione al 18'/.test(acc[1]), `momento del gol su palla ferma: ${JSON.stringify(acc)}`);
    for (const [w, h] of MOBILI) { const r = await giudica(A.page, w, h, 'verde', 'dopo'); ok(verde, r.passa, r.msg); }
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
function MALE_T(x) { return MALE.test(x); }
console.log('B) verde — PC 1366x768');
{
  const { A, g } = await prepara(true, {});
  try {
    ok(verde, g.finita, `partita finita ${JSON.stringify(g.score)}`);
    const r = await giudica(A.page, PC[0], PC[1], 'verde', 'dopo'); ok(verde, r.passa, r.msg);
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
console.log('R) rosso __CPM_NO_G224');
{
  const { A, g } = await prepara(false, { __CPM_NO_G224: true });
  try {
    const esiti = [];
    for (const [w, h] of [[360, 640], [375, 667], [390, 844]]) { const r = await giudica(A.page, w, h, 'rosso', 'prima'); esiti.push(r); console.log('    ' + r.msg); }
    const acc = await A.page.evaluate(() => typeof momentoPiazzato224 === 'function' ? momentoPiazzato224('punizione', 18) : null);
    console.log(`    momento del gol su punizione: ${JSON.stringify(acc)}`);
    const giudicato = g.finita && esiti.every(r => r.S) && acc != null;
    ok(rosso, giudicato && esiti.every(r => !r.passa) && MALE_T(acc), `rosso bocciato su ${esiti.filter(r => !r.passa).length}/${esiti.length} viewport · accordo sbagliato ${MALE_T(acc || '')} (giudicato ${giudicato})`);
  } catch (e) { ok(rosso, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G224 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ rassegna-224 VERDE' : '✗ rassegna-224 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
