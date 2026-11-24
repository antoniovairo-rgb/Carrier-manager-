#!/usr/bin/env node
/* [giro 336 · PO-608 + PO-609] GUARDIANO partita-336 — `npm run partita-336`. Gioca, non legge il sorgente.
   P (PO-608, «non si capisce che per giocare ‹normalmente› bisogna premere su vedi formazioni!») — la pre-partita VERA di una giornata di
     campionato da professionista (prompt vero → «Gioca la partita» → MatchdayCard) al telefono 412x915:
     P1 i primi due tasti della pila delle azioni sono le DUE STRADE: «Gioca la partita» e «Gioca solo i momenti salienti», ciascuno largo
        almeno il 90% della pila e intero nello schermo in larghezza;
     P2 nessun tasto si chiama «Vedi le formazioni» o «Salta e gioca»;
     P3 ogni altro tasto (analisi, salta, home) non e' piu' alto dei due tasti delle strade;
     P4 nessuno scorrimento orizzontale;
     P5 «Gioca la partita» porta alle formazioni (stesso percorso di prima: phase formations).
   F (PO-609, «la classifica deve essere già aggiornata, non quella della settimana prima») — la stessa carriera gioca la giornata a soli
     salienti col pilota seedato; alla rassegna (scheda 4) si leggono la classifica mostrata (posizione, nome, punti di ogni riga), la nota e i
     numeri di stagione; poi si torna alla carriera e si legge la classifica SALVATA (quella della Home, `__CPM_CAREER.snapshot()`), ordinata
     con lo stesso criterio:
     F1 ogni riga mostrata ha la stessa posizione, la stessa squadra e gli stessi punti della classifica della Home;
     F2 la tua squadra: stessa posizione e stessi punti;
     F3 i numeri di stagione mostrati (gol, assist, presenze) sono quelli della Home;
     F4 la nota dice «Dopo la giornata»;
     F5 l'anteprima della prossima partita mostra posizione e punti dell'avversario della classifica della Home.
   ROSSO window.__CPM_NO_G336 (dall'avvio, stessa carriera e stesso seme) = la 7.999.208 → DEVE essere bocciato su P e su F.
   «Non giudicato» (prompt/pre-partita/partita/rassegna non trovati) = rosso. Verde e rosso stampati per ultimi.
   Foto in docs/sviluppo/giro336/. Uso: cd tests/visual && node partita-336.mjs   (CPM_PARTE=verde|rosso) */
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166, chiudi166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto';
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro336'); fs.mkdirSync(FOTO, { recursive: true });
const SEME = 7304, VP = { width: 412, height: 915 };
const J = x => JSON.stringify(x);

async function prepartita(page) {
  /* dal prompt della settimana: «Gioca la partita» → pre-partita (MatchdayCard) */
  const c = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (!b) return false; b.click(); return true; });
  if (!c) return null;
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => typeof window.__CPM_PHASE === 'function' && window.__CPM_PHASE() === 'matchday' && !!document.querySelector('[data-cpm="prepartita23"] .cpm-piena-az button')).catch(() => false);
    if (ok) break;
    await page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Continua|Avanti|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B[0]) B[0].click(); }).catch(() => {});
    await sleep(400);
  }
  await sleep(900);
  return page.evaluate(() => {
    const pila = document.querySelector('[data-cpm="prepartita23"] .cpm-piena-az'); if (!pila) return null;
    document.querySelectorAll('.cpm-scroll').forEach(s => { s.scrollTop = 0; });
    const W = window.innerWidth, pr = pila.getBoundingClientRect();
    const B = [...pila.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const c = b.cloneNode(true); c.querySelectorAll('[data-cpm$="-nota"]').forEach(n => n.remove());
      const r = b.getBoundingClientRect(); return { t: (c.textContent || '').trim(), w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right) }; });
    return { W, pila: Math.round(pr.width), B, hscroll: document.documentElement.scrollWidth > W + 1 };
  });
}
function giudicaP(m) {
  if (!m || !m.B.length) return { passa: false, msg: 'non giudicato: pre-partita o pila dei tasti non trovata' };
  const [a, b] = m.B, resto = m.B.slice(2);
  const strade = !!a && !!b && /^Gioca la partita/.test(a.t) && /^Gioca solo i momenti salienti/.test(b.t) && [a, b].every(x => x.w >= 0.9 * m.pila && x.l >= 0 && x.r <= m.W);
  const vecchi = m.B.filter(x => /^(Vedi le formazioni|Salta e gioca)/.test(x.t)).map(x => x.t);
  const hMin = a && b ? Math.min(a.h, b.h) : 0; const alti = resto.filter(x => x.h > hMin).map(x => x.t + ' ' + x.h);
  const passa = strade && vecchi.length === 0 && alti.length === 0 && !m.hscroll;
  return { passa, msg: `P1 strade ${strade} · P2 tasti vecchi ${J(vecchi)} · P3 secondari piu' alti ${J(alti)} · P4 scorrimento orizzontale ${m.hscroll} · tasti ${m.B.map(x => `«${x.t}» ${x.w}x${x.h}`).join(' | ')} (pila ${m.pila} px)` };
}

async function rassegna(page) {
  await page.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[3]) d[3].click(); }); await sleep(600);
  return page.evaluate(() => {
    const righe = [...document.querySelectorAll('[data-cpm="classifica224"] > div[data-cpm]')].map(e => { const s = e.querySelectorAll('span'); return { pos: parseInt(s[0].textContent, 10), n: s[1].textContent.trim(), pts: parseInt(s[2].textContent, 10), io: e.getAttribute('data-cpm') === 'classifica200-io' }; });
    const nota = ((document.querySelector('[data-cpm="classifica336-nota"]') || document.querySelector('[data-cpm="classifica224"]')?.previousElementSibling) || {}).textContent || '';
    const st = document.querySelector('[data-cpm="stagione224"]'); const num = {};
    if (st) st.querySelectorAll('div[style*="grid"] > div').forEach(c => { const d = c.querySelectorAll('div'); if (d.length >= 2) num[d[1].textContent.trim()] = d[0].textContent.trim(); });
    const pr = (document.querySelector('[data-cpm="prossima200"]') || {}).textContent || ''; const avv = (pr.match(/contro (.+?) ·/) || [])[1] || null;
    const ap = ((document.querySelector('[data-cpm="anteprima224-pos"]') || {}).textContent || '').match(/(\d+)° · (\d+) pt/);
    return { righe, nota: nota.trim(), num, stNota: st ? (st.firstElementChild || {}).textContent : null, avv, avvPos: ap ? +ap[1] : null, avvPts: ap ? +ap[2] : null };
  });
}
async function home(page) {
  return page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); const cl = p.club || {};
    const gd = r => (r.gd != null ? r.gd : ((r.gf | 0) - (r.ga | 0)));
    const st = ordinaClassifica259(p.standings || [], (a, b) => (b.pts | 0) - (a.pts | 0) || gd(b) - gd(a) || (b.gf | 0) - (a.gf | 0));
    return { st: st.map((r, i) => ({ pos: i + 1, n: r.fullName || r.n || r.name || r.id, pts: r.pts | 0, io: r.id === cl.id || r.clubId === cl.id })), goals: p.goals | 0, assists: p.assists | 0, matches: p.matches | 0, week: p.week, hist: (p.matchHistory || []).length };
  });
}
function giudicaF(R, H) {
  if (!R || !R.righe.length || !H || !H.st.length) return { passa: false, msg: 'non giudicato: rassegna o classifica della Home non trovate' };
  const diff = R.righe.filter(r => { const h = H.st[r.pos - 1]; return !h || h.n !== r.n || h.pts !== r.pts; }).map(r => { const h = H.st[r.pos - 1] || {}; return `${r.pos}° ${r.n} ${r.pts}pt ≠ Home ${h.n} ${h.pts}pt`; });
  const io = R.righe.find(r => r.io), ioH = H.st.find(r => r.io);
  const f2 = !!io && !!ioH && io.pos === ioH.pos && io.pts === ioH.pts;
  const f3 = +R.num['Gol'] === H.goals && +R.num['Assist'] === H.assists && +R.num['Presenze'] === H.matches;
  const f4 = /^Dopo la giornata/.test(R.nota);
  const aH = R.avv ? H.st.find(r => r.n === R.avv) : null; const f5 = !!aH && R.avvPos === aH.pos && R.avvPts === aH.pts;
  const passa = diff.length === 0 && f2 && f3 && f4 && f5;
  return { passa, msg: `F1 righe diverse ${diff.length}/${R.righe.length}${diff.length ? ' ' + diff.slice(0, 3).join(' · ') : ''} · F2 tu ${io ? io.pos + '° ' + io.pts + 'pt' : '?'} vs Home ${ioH ? ioH.pos + '° ' + ioH.pts + 'pt' : '?'} · F3 numeri ${J(R.num)} vs Home gol ${H.goals} assist ${H.assists} presenze ${H.matches} · F4 nota «${R.nota}» · stagione «${R.stNota}» · F5 prossimo avversario ${R.avv} ${R.avvPos}° ${R.avvPts}pt vs Home ${aH ? aH.pos + '° ' + aH.pts + 'pt' : '?'}` };
}

async function braccio(nome, init) {
  const A = await apriCarriera166({ vp: VP, mobile: true, init, nome: 'Collaudo Partita 336' });
  const out = { nome };
  try {
    if (!A.W) throw new Error('nessuna giornata di lega trovata ' + J(A.passi));
    await apriPrompt166(A.page);
    const m = await prepartita(A.page);
    await A.page.screenshot({ path: path.join(FOTO, `${nome}-prepartita-412.png`), fullPage: false }).catch(() => {});
    out.P = giudicaP(m);
    /* P5: «Gioca la partita» (verde) / «Vedi le formazioni» (rosso) porta alle formazioni; poi si torna indietro? no: si gioca da li' */
    const k = await A.page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="prepartita23"] button')].find(x => /^(Gioca la partita|Vedi le formazioni)/.test((x.textContent || '').trim())); if (!b) return null; b.click(); return (b.textContent || '').trim().slice(0, 20); });
    let f = null; for (let i = 0; i < 30; i++) { await sleep(250); f = await A.page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f && f !== 'matchday') break; }
    out.P5 = { k, f, ok: !!k && f === 'formations' };
    /* F: la partita (a soli salienti forzati dal gancio di sonda, stesso seme nei due bracci) dalle formazioni gia' aperte */
    await A.page.evaluate(() => { window.__CPM_SOLO166 = true; });
    await A.page.evaluate((s) => { if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); }, SEME);
    for (let i = 0; i < 60; i++) { const ph = await A.page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (/playing|hl_/.test(ph || '')) break;
      await A.page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Ingresso in campo|Avanti|Continua|Entra in campo|Siamo pronti|Salta)/i.test((x.textContent || '').trim())); if (B[0]) B[0].click(); }).catch(() => {}); await sleep(500); }
    await A.page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME);
    let fin = false; const t0 = Date.now();
    while (Date.now() - t0 < 420000) { const ph = await A.page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph === 'ended') { fin = true; break; } await sleep(400); }
    out.finita = fin; if (!fin) throw new Error('partita non arrivata al fischio');
    await sleep(2000);
    out.score = await A.page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; });
    const R = await rassegna(A.page);
    await A.page.screenshot({ path: path.join(FOTO, `${nome}-classifica-412.png`), fullPage: false }).catch(() => {});
    const v = await chiudi166(A.page); await sleep(1500);
    const H = await home(A.page);
    out.F = giudicaF(R, H); out.voce = !!v.voce; out.R = R; out.H = { ...H, st: H.st.slice(0, 3) };
    out.errs = A.errs.slice(0, 2);
  } catch (e) { out.err = String(e.message).slice(0, 200); }
  await A.b.close(); A.srv.close();
  return out;
}

const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
if (PARTE !== 'rosso') {
  console.log('V) verde');
  const o = await braccio('dopo', {});
  if (o.err) ok(verde, false, 'non giudicato: ' + o.err);
  else {
    ok(verde, o.P.passa, 'pre-partita 412: ' + o.P.msg);
    ok(verde, o.P5.ok, `P5 «${o.P5.k}» → fase ${o.P5.f}`);
    ok(verde, o.finita && o.voce && o.F.passa, `fine partita ${J(o.score)}: ` + o.F.msg);
    ok(verde, o.errs.length === 0, `zero errori di pagina ${o.errs.length ? J(o.errs) : ''}`);
  }
}
if (PARTE !== 'verde') {
  console.log('R) rosso __CPM_NO_G336');
  const o = await braccio('prima', { __CPM_NO_G336: true });
  if (o.err) ok(rosso, false, 'non giudicato: ' + o.err);
  else {
    console.log('    pre-partita: ' + o.P.msg); console.log(`    fine partita ${J(o.score)}: ` + o.F.msg);
    const giudicato = o.finita && o.voce && !/non giudicato/.test(o.P.msg) && !/non giudicato/.test(o.F.msg);
    ok(rosso, giudicato && !o.P.passa && !o.F.passa, `rosso bocciato: pre-partita ${!o.P.passa} · fine partita ${!o.F.passa} (giudicato ${giudicato})`);
  }
}
const vOk = PARTE === 'rosso' || (verde.length > 0 && verde.every(x => x[0])); const rOk = PARTE === 'verde' || (rosso.length > 0 && rosso.every(x => x[0]));
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G336 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ partita-336 VERDE' : '✗ partita-336 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
