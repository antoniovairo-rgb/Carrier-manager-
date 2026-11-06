#!/usr/bin/env node
/* [giro 106 · foto PO 179 «Si vede malissimo», FC Merseyside su Android ~360x800] GUARDIANO DELLA HOME COI COLORI VERI.
   grafica-v2 e momenti-v2 erano verdi a 360 px perche' misurano col club del banco (FC Salernum, granata scuro #6c1f2e) e un nome
   corto: il rosso vivo, i gialli e i bianchi e i nomi da 16+ caratteri non li ha mai visti nessuno. Qui la stessa carriera del banco
   (banco-g0) cambia maglia: otto club VERI del database, uno per famiglia di colore sociale, piu' i nomi piu' lunghi.
   Per ogni club, a 360x800 (tocco), Home con la partita della settimana servita, giudica:
   A  testata e riquadro: il nome del club (e delle due squadre del riquadro) non va a capo DENTRO una parola (ogni parola su una riga sola, nessun trabocco orizzontale),
      al massimo 2 righe; la riga di meta (lega · stagione · settimana · posto · salvato) al massimo 2 righe.
   B  riquadro della prossima partita: contrasto WCAG di ogni testo >= 4,5:1 (>= 3:1 da 24 px o 18,66 px grassetto), misurato sul
      fondo PIU' CHIARO del riquadro (il colore pieno, prima della sfumatura); ABBAGLIO: luminanza del fondo <= 0,070 e canale
      massimo <= 148 (la misura della tavola V2Home, disegnata su #8e1f33: 0,070 e 142).
   C  in fondo alla Home, a scorrimento finito, l'ultimo contenuto sta sopra la fascia Sostieni/Idee (nessun pixel coperto);
      la fascia + barra non superano il 14% dell'altezza a 360x800.
   D  la frase «zona retrocessione» (avversario 18°, giocatore 7°) dice di CHI parla e sta su una riga sua, centrata sul
      riquadro (non sotto la colonna di una delle due squadre).
   ROSSO: CPM_ROSSO=A|B|D (anche insieme, es. ABD) arma __CPM_NO_G106<lettera> e pretende che quella misura cada (su almeno un club per A/C/D, su tutti
   i colori vivi per B). Uso: CPM_CHROME=/opt/pw-browsers/chromium node home-colori-106.mjs  ·  CPM_FOTO=<dir> salva le foto. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = (process.env.CPM_ROSSO || '').toUpperCase();
const FOTO = process.env.CPM_FOTO || '';
const W = 360, H = 800;
/* id del database (src/02): rosso vivo, oro/giallo, bianco, azzurro chiaro, celeste, verde, granata scuro, nome lunghissimo */
const CLUB = (process.env.CPM_CLUB || 'liv,wol,juve,mcy,napoli,krc,tor,kaa').split(',');
const VIVI = ['liv', 'wol', 'juve', 'mcy', 'napoli'];

function MISURA() {
  const P = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const sopra = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3]));
  const fondo = e => { const st = []; for (let x = e; x; x = x.parentElement) { const c = P(getComputedStyle(x).backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } }
    let b = [13, 15, 20]; for (let i = st.length - 1; i >= 0; i--) b = st[i][3] >= 1 ? st[i].slice(0, 3) : sopra(st[i], b); return b; };
  const out = { A: [], B: [], C: [], D: [], num: {} };
  /* A — testata */
  const nome = document.querySelector('[data-cpm="testata-nome106"]') || [...document.querySelectorAll('[data-cpm="testata-v2"] span')].find(s => s.children.length === 0 && /[A-Z]/i.test(s.textContent));
  const meta = document.querySelector('[data-cpm="testata-meta106"]') || [...document.querySelectorAll('[data-cpm="testata-v2"] span.cpm-num')][0];
  const righe = (el) => { const tn = [...el.childNodes].find(n => n.nodeType === 3); if (!tn) return { righe: 0, spezzate: [] }; const t = tn.textContent; const r = document.createRange(); const top = [];
    for (let i = 0; i < t.length; i++) { r.setStart(tn, i); r.setEnd(tn, i + 1); const q = r.getClientRects()[0]; top.push(q ? Math.round(q.top) : null); }
    const linee = new Set(top.filter((x, i) => x != null && t[i].trim())); const spezzate = []; let ini = 0;
    for (let i = 0; i <= t.length; i++) { if (i === t.length || /\s/.test(t[i]) && t[i] !== ' ') { const tt = top.slice(ini, i).filter(x => x != null); if (new Set(tt).size > 1 && !/·/.test(t.slice(ini, i))) spezzate.push(t.slice(ini, i)); ini = i + 1; } }
    return { righe: linee.size, spezzate }; };
  if (!nome) out.A.push('nome del club non trovato'); else { const rn = righe(nome); out.num.nomeRighe = rn.righe; out.num.nome = nome.textContent;
    if (rn.spezzate.length) out.A.push('nome spezzato dentro la parola: ' + rn.spezzate.join(' | '));
    if (nome.scrollWidth > nome.clientWidth + 1) out.A.push(`nome che trabocca (${nome.scrollWidth} > ${nome.clientWidth})`);
    if (rn.righe > 2) out.A.push('nome su ' + rn.righe + ' righe'); }
  if (!meta) out.A.push('riga di meta non trovata'); else { const rm = righe(meta); out.num.metaRighe = rm.righe; if (rm.righe > 2) out.A.push('meta su ' + rm.righe + ' righe'); }
  /* A anche nel riquadro: il nome delle due squadre (foto: «FC WOLVERHAMPTO / N») */
  const sq = [...document.querySelectorAll('[data-cpm="squadra-nome106"]')];
  if (!sq.length) { const pr0 = document.querySelector('[data-cpm="prossima-v2"]'); if (pr0) sq.push(...[...pr0.querySelectorAll('span')].filter(x => x.children.length === 0 && getComputedStyle(x).textTransform === 'uppercase' && /^(FC|AT|[A-Z])/i.test(x.textContent.trim()) && x.textContent.trim().length > 4 && !/Prossima|SETT\./i.test(x.textContent))); }
  out.num.squadre = sq.length;
  for (const x of sq) { const rs = righe(x); if (rs.spezzate.length) out.A.push('squadra spezzata dentro la parola: ' + rs.spezzate.join(' | ')); if (x.scrollWidth > x.clientWidth + 1) out.A.push(`squadra che trabocca: ${x.textContent} (${x.scrollWidth} > ${x.clientWidth})`); if (rs.righe > 2) out.A.push(`squadra su ${rs.righe} righe: ${x.textContent}`); }
  if (sq.length < 2) out.A.push('nomi delle squadre nel riquadro non trovati (' + sq.length + ')');
  const te = document.querySelector('[data-cpm="testata-v2"]'); out.num.testataH = te ? Math.round(te.getBoundingClientRect().height) : null;
  /* B — riquadro */
  const pr = document.querySelector('[data-cpm="prossima-v2"]');
  if (!pr) out.B.push('manca il riquadro della prossima partita'); else {
    const bg = P(getComputedStyle(pr).backgroundColor); const L = lum(bg), can = Math.max(...bg.slice(0, 3)); out.num.fondo = bg.slice(0, 3).join(','); out.num.lum = +L.toFixed(3); out.num.can = can;
    if (L > 0.070 + 1e-4 || can > 148) out.B.push(`abbaglia: fondo rgb(${out.num.fondo}) luminanza ${L.toFixed(3)} canale ${can}`);
    let min = 99, n = 0;
    for (const e of [pr, ...pr.querySelectorAll('*')]) {
      if (e instanceof SVGElement) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      if (![...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) continue;
      if (/^[\p{Extended_Pictographic}\s›·]+$/u.test(e.textContent.trim())) continue;
      const b = fondo(e), c = P(cs.color); const t = c[3] < 1 ? sopra(c, b) : c.slice(0, 3);
      const k = (Math.max(lum(t), lum(b)) + 0.05) / (Math.min(lum(t), lum(b)) + 0.05); const fs = parseFloat(cs.fontSize);
      const soglia = (fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700)) ? 3 : 4.5; n++; if (k < min) min = k;
      if (k < soglia) out.B.push(`«${e.textContent.trim().slice(0, 22)}» ${k.toFixed(2)}:1 (${fs}px, soglia ${soglia})`);
    }
    out.num.conMin = +min.toFixed(2); out.num.testi = n;
    /* D */
    const pe = pr.querySelector('[data-cpm="peso106"]') || [...pr.querySelectorAll('span')].find(s => /retrocessione/i.test(s.textContent));
    if (!pe) out.D.push('frase di peso non mostrata (banco: avversario ultimo)'); else {
      out.num.peso = pe.textContent.trim(); const q = pe.getBoundingClientRect(), c = pr.getBoundingClientRect();
      if (/retrocessione/i.test(pe.textContent) && !/avversari|loro|\b[A-Z]{3}\b/i.test(pe.textContent.replace(/zona retrocessione/i, ''))) out.D.push('«' + out.num.peso + '» non dice di chi parla');
      const dx = Math.abs((q.left + q.right) / 2 - (c.left + c.right) / 2); out.num.pesoDx = Math.round(dx);
      if (dx > 20) out.D.push(`frase spostata di ${Math.round(dx)} px dal centro del riquadro (sotto la colonna di una squadra)`); }
  }
  return out;
}
async function FONDO(page) {
  return page.evaluate(async () => {
    const sc = document.querySelector('.cpm-scroll'); sc.scrollTop = 0; await new Promise(r => setTimeout(r, 300));
    const st0 = document.querySelector('.cpm-nav-strisce'), nb0 = document.querySelector('.cpm-nav-bar');
    const fasciaAlto = Math.round(innerHeight - (st0 || nb0).getBoundingClientRect().top), strisceAlto = st0 ? Math.round(st0.getBoundingClientRect().height) : 0;
    sc.scrollTop = sc.scrollHeight; await new Promise(r => setTimeout(r, 400)); sc.scrollTop = sc.scrollHeight; await new Promise(r => setTimeout(r, 300));
    const st = document.querySelector('.cpm-nav-strisce'), nb = document.querySelector('.cpm-nav-bar');
    const coperta = (st || nb).getBoundingClientRect().top;
    /* l'ultimo elemento di contenuto visibile (testo/pulsante) nella colonna */
    let ultimo = 0, chi = '';
    for (const e of sc.querySelectorAll('*')) { if (e.closest('.cpm-nav-bar')) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (!([...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()) || /^(BUTTON|svg|IMG)$/.test(e.tagName))) continue;
      const r = e.getBoundingClientRect(); if (r.height < 1) continue; if (r.bottom > ultimo) { ultimo = r.bottom; chi = (e.textContent || e.tagName).trim().slice(0, 30); } }
    const nbr = nb.getBoundingClientRect();
    return { coperta: Math.round(coperta), ultimo: Math.round(ultimo), chi, fascia: fasciaAlto, strisce: strisceAlto, strisceFine: !!st, barra: Math.round(nbr.height), H: innerHeight };
  });
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [], esiti = [];
const LETTERE = [...ROSSO].filter(k => 'ABD'.includes(k)); const rossi = LETTERE.map(k => '__CPM_NO_G106' + k);/* C: misura senza correzione, nessun braccio */
for (const id of CLUB) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: FOTO ? 2 : 1, isMobile: true, hasTouch: true }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${id} · ${String(e.message).slice(0, 120)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi, save: SAVE });
  await page.addInitScript(() => { try { const v = sessionStorage.getItem('h106'); if (v) localStorage.setItem('cpm-v3', v); } catch (e) {} });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  const pronta = () => page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 }); await pronta(); await sleep(800);
  /* il club cambia maglia: calendario della sua lega, giornata servita, classifica col giocatore 7° e l'avversario ultimo */
  const info = await page.evaluate((id) => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; const c = CLUBS.find(x => x.id === id); if (!c) return null;
    p.club = { ...c }; const lc = CLUBS.filter(x => x.lg === c.lg);
    p.calendar = generateSeasonCalendar(p.club, lc, p.season * 777 + hashStr(p.club.id)); const m = p.calendar.find(x => x.week > p.week && x.opponentId); p.week = m.week;
    p.calendar.forEach(x => { if (x.week < m.week) { x.played = true; x.result = x.result || { homeScore: 1, awayScore: 0, won: true, drew: false }; } });
    const altri = lc.filter(x => x.id !== c.id && x.id !== m.opponentId); const ord = [...altri.slice(0, 6), c, ...altri.slice(6), lc.find(x => x.id === m.opponentId)];
    const g = m.matchday - 1; p.standings = ord.map((t, i) => ({ id: t.id, n: t.n, a: t.a, p: t.p, lg: c.lg, played: g, wins: 0, draws: 0, losses: 0, gf: 10, ga: 10, gd: 0, pts: (ord.length - i) * 3 }));
    p.matchHistory = p.matchHistory.map(x => ({ ...x, opponent: lc[(x.week) % lc.length].n }));
    sessionStorage.setItem('h106', JSON.stringify(s)); return { n: c.n, c: c.c, opp: m.opponentName, lg: c.lg }; }, id);
  if (!info) { errs.push(id + ' club non trovato'); await ctx.close(); continue; }
  await page.reload({ waitUntil: 'load' }); await pronta(); await sleep(1000);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { errs.push(id + ' carriera non raggiunta'); await ctx.close(); continue; }
  await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(300);
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
  const m = await page.evaluate(MISURA);
  if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: path.join(FOTO, `${id}-alto.png`) }); }
  const f = await FONDO(page);
  if (FOTO) await page.screenshot({ path: path.join(FOTO, `${id}-fondo.png`) });
  if (f.ultimo > f.coperta + 0.5) m.C.push(`a fine scorrimento «${f.chi}» finisce a ${f.ultimo} px, la fascia comincia a ${f.coperta}`);
  if (f.fascia > 0.14 * f.H) m.C.push(`fascia + barra alte ${f.fascia} px (${(100 * f.fascia / f.H).toFixed(1)}% di ${f.H})`);
  m.num.fondoPagina = f;
  esiti.push({ id, info, m });
  console.log(`  ${id.padEnd(6)} ${info.n.padEnd(18)} ${info.c} → fondo ${m.num.fondo} (lum ${m.num.lum}, can ${m.num.can}) · contrasto min ${m.num.conMin} su ${m.num.testi} · nome ${m.num.nomeRighe} righe, meta ${m.num.metaRighe}, testata ${m.num.testataH} px · peso «${m.num.peso || '-'}» dx ${m.num.pesoDx} · fondo: ultimo ${f.ultimo}/${f.coperta}, fascia ${f.fascia} px (strisce ${f.strisce}, a fine pagina ${f.strisceFine ? 'visibili' : 'nascoste'})`);
  for (const k of ['A', 'B', 'C', 'D']) m[k].forEach(x => console.log(`     ✗ ${k} ${x}`));
  await ctx.close();
}
await b.close(); srv.close();
if (errs.length) console.log('errori: ' + errs.slice(0, 5).join(' | '));
let ok;
if (ROSSO) {
  ok = LETTERE.length > 0 && !errs.length;
  for (const k of LETTERE) { const cadute = esiti.filter(e => e.m[k].length).map(e => e.id);
    const qui = k === 'B' ? VIVI.filter(v => CLUB.includes(v)).every(v => cadute.includes(v)) : cadute.length > 0; ok = ok && qui;
    console.log(qui ? `ROSSO ATTESO OK (${k}): cade su ${cadute.join(', ')}` : `ROSSO NON RIUSCITO (${k}): cade su ${cadute.join(', ') || 'nessuno'}`); }
} else {
  ok = esiti.length === CLUB.length && !errs.length && esiti.every(e => ['A', 'B', 'C', 'D'].every(k => !e.m[k].length));
  console.log(ok ? `home-colori-106 VERDE: ${esiti.length} club a ${W}x${H}` : 'home-colori-106 ROSSO');
}
process.exit(ok ? 0 : 1);
