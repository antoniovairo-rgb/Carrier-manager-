#!/usr/bin/env node
/* [PO-302 · grafica V2 «Notte da stadio», tappa 1] GUARDIANO DELLA GRAFICA V2.
   Quattro formati: telefono 412x915 e tablet 820x1180 (tocco, barra in basso), tablet 1180x820 (tocco) e PC 1440x900 (barra laterale).
   Su un salvataggio del banco (banco-g0) con la partita della settimana servita, giudica:
   PAL  palette: fondo della pagina #0d0f14, superfici V2 (#1a1e27) sui riquadri nuovi;
   FONT caratteri: Barlow Condensed caricato (document.fonts) e usato dai numeri grandi della home (>= 30 px);
   NAV  barra: classe V2; sotto i 900 px fascia a tutta larghezza (giro 97 D1), pillola chiara #f4f1ea sulla scheda attiva, voci >= 40x40;
        da 900 px barra laterale (alta quanto lo schermo, < 320 px) con Sostieni/Idee in fondo e larghe almeno il 90% della barra (giro 97 D17);
   HOME riquadro della prossima partita nel colore del club (con stemmi, forma V/N/P e comando), figurina piccola con due anelli,
        spazio fra i riquadri V2 della home fra 5 e 12 px a schermo (giro 91: ~8 px);
   CARR Carriera › Profilo: figurina grande con cornice d'oro (l'eroe del banco ha OVR 86), sei attributi, grafico dei gol con il record in oro;
   TXT  nessun testo tagliato nei riquadri V2 e nella barra, nessuno scorrimento orizzontale;
   CON  contrasto WCAG del testo nei riquadri V2 e nella barra: >= 4,5:1 (>= 3:1 da 24 px, o 18,66 px in grassetto). Stampa il minimo.
   [tappa 2] TEST testata compatta (stemma, Salva e Opzioni come icone >= 44 px con aria-label), barra a 6 voci senza Opzioni,
        Simula accanto a Gioca nel riquadro della prossima partita, tre anelli (Forma, Morale, Fatica) nella card dell'eroe;
   SCH  schede: Stagione (titolo V2 con distanza dalla vetta e forma, riga tua nel colore del club), Club (fascia del club, due anelli,
        OVR su piastrella), Agente (titolo, barra del contratto), Ufficio (titolo, tacche del trainer); contrasto, tagli, scorrimento.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_V2 (la grafica della 178) e pretende che PAL, NAV, HOME, TEST e SCH cadano in ogni formato.
   CPM_FORMATI=tel,tabv,tabo,pc per un sottoinsieme. Chromium headless: nessun dispositivo vero. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const FORMATI = {
  tel: { k: 'tel', w: 412, h: 915, touch: true }, tabv: { k: 'tabv', w: 820, h: 1180, touch: true },
  tabo: { k: 'tabo', w: 1180, h: 820, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false },
};
const SCELTI = (process.env.CPM_FORMATI || 'tel,tabv,tabo,pc').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);

/* --- dentro la pagina: contrasto WCAG con i fondi composti (alfa) risalendo gli antenati --- */
function MISURA(sel) {
  const P = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const sopra = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3]));
  const fondo = e => { const st = []; for (let x = e; x; x = x.parentElement) { const c = P(getComputedStyle(x).backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } }
    let b = [13, 15, 20]; for (let i = st.length - 1; i >= 0; i--) b = st[i][3] >= 1 ? st[i].slice(0, 3) : sopra(st[i], b); return b; };
  const out = { n: 0, min: 99, peggiori: [], tagliati: [] };
  for (const root of document.querySelectorAll(sel)) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e instanceof SVGElement) continue;/* testo disegnato dentro uno stemma SVG: il suo fondo e' la forma dello stemma, non un colore CSS */
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    if (e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.overflowX !== 'visible') out.tagliati.push((e.textContent || '').trim().slice(0, 30));
    if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) out.tagliati.push((e.textContent || '').trim().slice(0, 30));
    const proprio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0); if (!proprio) continue;
    if (/^[\p{Extended_Pictographic}\s›·]+$/u.test(e.textContent.trim())) continue;/* solo icone/emoji: non e' testo */
    const b = fondo(e), c = P(cs.color); const t = c[3] < 1 ? sopra(c, b) : c.slice(0, 3);
    const L1 = lum(t), L2 = lum(b), k = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const fs = parseFloat(cs.fontSize), grande = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700), soglia = grande ? 3 : 4.5;
    out.n++; if (k < out.min) out.min = k;
    if (k < soglia) out.peggiori.push(`${(e.textContent || '').trim().slice(0, 24)} ${k.toFixed(2)}:1 (${fs}px)`);
  }
  out.min = +out.min.toFixed(2); return out;
}
function STATO() {
  const r = x => { if (!x) return null; const b = x.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const P = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); return m ? m[1].split(/[ ,/]+/).filter(Boolean).map(Number).slice(0, 3).join(',') : ''; };
  const nb = document.querySelector('.cpm-nav-bar'), sc = document.querySelector('.cpm-scroll');
  const tabs = [...document.querySelectorAll('.cpm-nav-tabs button')].map(b => ({ t: (b.textContent || '').trim(), act: b.classList.contains('cpm-tab-act'), bg: P(getComputedStyle(b).backgroundColor), r: r(b) }));
  const strisce = [...document.querySelectorAll('.cpm-nav-strisce button')].map(b => ({ t: (b.textContent || '').trim().slice(0, 20), r: r(b) }));
  const pros = document.querySelector('[data-cpm="prossima-v2"]'), eroe = document.querySelector('[data-cpm="eroe-v2"]');
  const num = [...document.querySelectorAll('.cpm-scroll .cpm-num')].map(e => getComputedStyle(e)).filter(cs => parseFloat(cs.fontSize) >= 30);
  /* lo spazio fra un riquadro V2 e il successivo, a schermo */
  const gap = x => { if (!x) return null; let n = x.nextElementSibling; while (n && n.getBoundingClientRect().height < 1) n = n.nextElementSibling; return n ? Math.round((n.getBoundingClientRect().top - x.getBoundingClientRect().bottom) * 10) / 10 : null; };
  return {
    W: innerWidth, H: innerHeight, v2nav: !!document.querySelector('.cpm-v2nav'), bodyBg: P(getComputedStyle(document.body).backgroundColor),
    nav: r(nb), cont: r(sc && sc.firstElementChild), tabs, strisce,
    font: document.fonts.check('700 20px "Barlow Condensed"'), numTV: num.filter(cs => /Barlow Condensed/.test(cs.fontFamily)).length, numTot: num.length,
    pros: pros ? { bg: P(getComputedStyle(pros).backgroundColor), stemmi: pros.querySelectorAll('svg,img').length, forma: !!pros.querySelector('[data-cpm="forma-v2"]'), cmd: !!pros.querySelector('[data-cpm="avanza23"]') } : null,
    eroe: eroe ? { bg: P(getComputedStyle(eroe).backgroundColor), fig: !!eroe.querySelector('[data-cpm="figurina-v2"]'), anelli: eroe.querySelectorAll('[data-cpm="anello-v2"]').length } : null,
    gaps: [gap(pros), gap(eroe)].filter(x => x != null),
    ox: Math.max((sc ? sc.scrollWidth - sc.clientWidth : 0), document.documentElement.scrollWidth - innerWidth),
  };
}
function CARRIERA() {
  const f = document.querySelector('[data-cpm="figurina-v2-grande"]'), g = document.querySelector('[data-cpm="gol-stagioni-v2"]');
  const barre = g ? [...g.children].map(b => getComputedStyle(b).backgroundColor) : [];
  return { fig: !!f, cornice: f ? getComputedStyle(f).backgroundImage : '', attr: f ? (f.textContent.match(/(TIR|PAS|DRI|VEL|FIS|TEC)/g) || []).length : 0,
    barre: barre.length, oro: barre.filter(c => /232, 180, 74/.test(c)).length };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [], mancanti = [], fail = { PAL: [], FONT: [], NAV: [], HOME: [], CARR: [], TXT: [], CON: [], TEST: [], SCH: [] }, visti = { PAL: 0, FONT: 0, NAV: 0, HOME: 0, CARR: 0, TXT: 0, CON: 0, TEST: 0, SCH: 0 };
const KO = (k, f, m) => fail[k].push(`${f.k}: ${m}`);
let conMin = 99;
for (const f of SCELTI) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 120)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSO ? ['__CPM_NO_V2'] : [], save: SAVE });
  await page.addInitScript(() => { try { const v = sessionStorage.getItem('v2s'); if (v) localStorage.setItem('cpm-v3', v); } catch (e) {} });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const pronta = () => page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await page.goto(url, { waitUntil: 'load', timeout: 120000 }); await pronta(); await sleep(800);
  /* il banco e' a meta' stagione senza calendario: lo si genera con la funzione del gioco e si serve la giornata successiva
     (le precedenti segnate giocate, altrimenti il recupero automatico le risolve e gonfia la classifica); uno storico coi gol
     per stagione da' qualcosa da disegnare al grafico della Carriera. */
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; const lc = CLUBS.filter(c => c.lg === p.club.lg);
    p.calendar = generateSeasonCalendar(p.club, lc, p.season * 777 + hashStr(p.club.id)); const m = p.calendar.find(x => x.week > p.week); p.week = m.week;
    p.calendar.forEach(x => { if (x.week < m.week) { x.played = true; x.result = x.result || { homeScore: 1, awayScore: 0, won: true, drew: false }; } });
    p.standings = p.standings.map(t => ({ ...t, played: Math.min(t.played, m.matchday - 1) }));
    p.history = []; for (let k = 1; k < p.season; k++) p.history.push({ season: k, club: p.club.n, clubId: p.club.id, goals: [2, 5, 7, 9, 4, 12, 15, 19, 11, 13, 16][k - 1] || 8, assists: 3, matches: 30 });
    sessionStorage.setItem('v2s', JSON.stringify(s)); });
  await page.reload({ waitUntil: 'load' }); await pronta(); await sleep(1000);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(f.k + ' Continua'); }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { mancanti.push(f.k + ' carriera'); await ctx.close(); continue; }
  await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(300);
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
  const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  if (!md) mancanti.push(f.k + ' partita della settimana');
  const s = await page.evaluate(STATO);
  const laterale = s.nav && s.nav.h > 0.8 * s.H && s.nav.w < 320;
  /* PAL */ visti.PAL++; if (s.bodyBg !== '13,15,20') KO('PAL', f, 'fondo pagina ' + s.bodyBg); if (!s.eroe || s.eroe.bg !== '26,30,39') KO('PAL', f, 'superficie del riquadro eroe ' + (s.eroe && s.eroe.bg));
  /* FONT */ visti.FONT++; if (!s.font) KO('FONT', f, 'Barlow Condensed non caricato'); if (!s.numTV || s.numTV < s.numTot) KO('FONT', f, `numeri grandi in Barlow Condensed ${s.numTV}/${s.numTot}`);
  /* NAV */ visti.NAV++;
  if (!s.v2nav) KO('NAV', f, 'barra senza classe V2');
  const att = s.tabs.find(t => t.act);
  if (!att || att.bg !== '244,241,234') KO('NAV', f, 'scheda attiva senza pillola chiara (' + (att && att.bg) + ')');
  if (f.touch) { const pic = s.tabs.filter(t => t.r.h < 40 || t.r.w < 40); if (pic.length) KO('NAV', f, 'voci sotto 40 px: ' + pic.map(t => `${t.t} ${Math.round(t.r.w)}x${Math.round(t.r.h)}`).join(', ')); }
  if (!laterale) { if (s.nav && s.cont && !(s.nav.l <= s.cont.l + 1 && s.nav.r >= s.cont.r - 1)) KO('NAV', f, `la fascia della barra non copre il contenuto (${Math.round(s.nav.l)}..${Math.round(s.nav.r)} contro ${Math.round(s.cont.l)}..${Math.round(s.cont.r)})`); }
  else { const ultima = Math.max(...s.tabs.map(t => t.r.b)); const sotto = s.strisce.filter(x => x.r.t >= ultima); const strette = s.strisce.filter(x => x.r.w < 0.9 * s.nav.w);
    if (s.strisce.length < 2 || sotto.length < s.strisce.length) KO('NAV', f, 'Sostieni/Idee non in fondo alla barra laterale'); if (strette.length) KO('NAV', f, `strisce strette ${strette.map(x => Math.round(x.r.w)).join(', ')} su ${Math.round(s.nav.w)}`); }
  /* HOME */ visti.HOME++;
  if (!s.pros) KO('HOME', f, 'manca il riquadro della prossima partita V2');
  else { if (['26,30,39', '13,15,20', '255,255,255'].includes(s.pros.bg)) KO('HOME', f, 'prossima partita non nel colore del club (' + s.pros.bg + ')'); if (s.pros.stemmi < 2 || !s.pros.forma || !s.pros.cmd) KO('HOME', f, `prossima partita incompleta (stemmi ${s.pros.stemmi}, forma ${s.pros.forma}, comando ${s.pros.cmd})`); }
  if (!s.eroe || !s.eroe.fig || s.eroe.anelli !== 3) KO('HOME', f, 'figurina piccola o anelli (Forma, Morale, Fatica) mancanti: ' + (s.eroe && s.eroe.anelli));/* [tappa 2] la Fatica e' scesa dalla testata */
  /* TEST [tappa 2] */ visti.TEST++;
  const te = await page.evaluate(() => { const h = document.querySelector('[data-cpm="testata-v2"]'); if (!h) return null; const r = x => { const b = x.getBoundingClientRect(); return { w: b.width, h: b.height }; };
    const bt = [...h.querySelectorAll('button')].map(b => ({ l: b.getAttribute('aria-label') || '', ...r(b) }));
    return { stemma: h.querySelectorAll('svg,img').length, bt, voci: [...document.querySelectorAll('.cpm-nav-tabs button')].map(b => (b.textContent || '').trim()),
      sim: !!document.querySelector('[data-cpm="prossima-v2"] [data-cpm="simula-v2"]') }; });
  if (!te) KO('TEST', f, 'manca la testata compatta');
  else { const sal = te.bt.find(b => /Salva/.test(b.l)), opz = te.bt.find(b => /Opzioni/.test(b.l));
    if (!sal || !opz) KO('TEST', f, 'Salva/Opzioni senza aria-label nella testata');
    const pic = te.bt.filter(b => b.w < 44 || b.h < 44); if (pic.length) KO('TEST', f, 'icone sotto 44 px: ' + pic.map(b => `${b.l} ${Math.round(b.w)}x${Math.round(b.h)}`).join(', '));
    if (te.voci.length !== 6 || te.voci.some(v => /Opzioni/.test(v))) KO('TEST', f, 'barra: ' + te.voci.length + ' voci (' + te.voci.join('|') + ')');
    if (!te.sim) KO('TEST', f, 'manca Simula nel riquadro della prossima partita'); }
  const gl = s.gaps.filter(g => g < 5 || g > 12); if (s.gaps.length < 2 || gl.length) KO('HOME', f, 'spazio fra i riquadri ' + s.gaps.join(', ') + ' px');
  /* TXT + CON home e barra */
  const mh = await page.evaluate(MISURA, '[data-cpm="prossima-v2"],[data-cpm="eroe-v2"],[data-cpm="testata-v2"],.cpm-v2nav');
  visti.TXT++; if (s.ox > 1) KO('TXT', f, 'scorrimento orizzontale ' + s.ox + ' px'); if (mh.tagliati.length) KO('TXT', f, 'testi tagliati: ' + mh.tagliati.slice(0, 4).join(' | '));
  if (mh.n) { visti.CON++; conMin = Math.min(conMin, mh.min); if (mh.peggiori.length) KO('CON', f, 'home/barra: ' + mh.peggiori.slice(0, 4).join(' | ')); }
  /* CARR */
  await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(900);
  const c = await page.evaluate(CARRIERA); visti.CARR++;
  if (!c.fig) KO('CARR', f, 'manca la figurina grande'); else { if (!/232, 180, 74/.test(c.cornice)) KO('CARR', f, 'cornice non d\'oro con OVR 86'); if (c.attr !== 6) KO('CARR', f, 'attributi sulla carta ' + c.attr); }
  if (!c.barre || c.oro !== 1) KO('CARR', f, `grafico dei gol: barre ${c.barre}, record in oro ${c.oro}`);
  /* SCH [tappa 2]: Stagione, Club, Agente, Ufficio */
  const SCHEDE = [
    ['standings', '[data-cpm="stagione-v2"]', () => { const v = document.querySelector('[data-cpm="vetta-v2"]'), r = document.querySelector('[data-cpm="riga-mia-v2"]');
      return [!v ? 'manca la distanza dalla vetta' : !/vetta|seconda/i.test(v.textContent) ? 'vetta: ' + v.textContent : null, !document.querySelector('[data-cpm="stagione-v2"] [data-cpm="forma-v2"]') ? 'manca la forma V/N/P' : null,
        !r ? 'manca la riga tua' : /26, 30, 39|13, 15, 20/.test(getComputedStyle(r).backgroundColor) ? 'riga tua non nel colore del club' : null]; }],
    ['club', '[data-cpm="club-v2"],[data-cpm="club-anelli-v2"]', () => { const c = document.querySelector('[data-cpm="club-v2"]');
      return [!c ? 'manca la fascia del club' : /26, 30, 39|13, 15, 20/.test(getComputedStyle(c).backgroundColor) ? 'fascia non nel colore del club' : null,
        document.querySelectorAll('[data-cpm="club-anelli-v2"] [data-cpm="anello-v2"]').length !== 2 ? 'anelli fiducia/popolarita\' mancanti' : null]; }],
    ['agente', '[data-cpm="agente-v2"],[data-cpm="contratto-v2"]', () => [!document.querySelector('[data-cpm="agente-v2"]') ? 'manca il titolo Agente' : null, !document.querySelector('[data-cpm="contratto-v2"]') ? 'manca la barra del contratto' : null]],
    ['ufficio', '[data-cpm="ufficio-v2"]', () => [!document.querySelector('[data-cpm="ufficio-v2"]') ? 'manca il titolo Ufficio' : null, document.querySelectorAll('[data-cpm="tacca-v2"]').length < 3 ? 'mancano le tacche dello staff' : null]],
  ];
  for (const [tb, sel, giudica] of SCHEDE) {
    await page.evaluate(t => window.__CPM_CAREER.goTab(t), tb); await sleep(900); visti.SCH++;
    (await page.evaluate(giudica)).filter(Boolean).forEach(m => KO('SCH', f, tb + ': ' + m));
    const ms = await page.evaluate(MISURA, sel + ',[data-cpm="testata-v2"]');
    const oxs = await page.evaluate(() => { const sc = document.querySelector('.cpm-scroll'); return Math.max(sc ? sc.scrollWidth - sc.clientWidth : 0, document.documentElement.scrollWidth - innerWidth); });
    if (oxs > 1) KO('TXT', f, tb + ': scorrimento orizzontale ' + oxs + ' px'); if (ms.tagliati.length) KO('TXT', f, tb + ': testi tagliati: ' + ms.tagliati.slice(0, 4).join(' | '));
    if (ms.n) { conMin = Math.min(conMin, ms.min); if (ms.peggiori.length) KO('CON', f, tb + ': ' + ms.peggiori.slice(0, 4).join(' | ')); }
  }
  const mc = await page.evaluate(MISURA, '[data-cpm="carriera-v2"]');
  const ox2 = await page.evaluate(() => { const sc = document.querySelector('.cpm-scroll'); return Math.max(sc.scrollWidth - sc.clientWidth, document.documentElement.scrollWidth - innerWidth); });
  if (ox2 > 1) KO('TXT', f, 'carriera: scorrimento orizzontale ' + ox2 + ' px'); if (mc.tagliati.length) KO('TXT', f, 'carriera: testi tagliati: ' + mc.tagliati.slice(0, 4).join(' | '));
  if (mc.n) { conMin = Math.min(conMin, mc.min); if (mc.peggiori.length) KO('CON', f, 'carriera: ' + mc.peggiori.slice(0, 4).join(' | ')); }
  console.log(`  ${f.k.padEnd(4)} fondo ${s.bodyBg} · barra ${laterale ? 'laterale' : 'in basso'} (${s.tabs.length} voci, attiva ${att ? att.t : '-'}) · numeri TV ${s.numTV}/${s.numTot} · spazi ${s.gaps.join('/')} px · contrasto min home ${mh.min} (${mh.n} testi) carriera ${mc.min} (${mc.n}) · grafico ${c.barre} barre, oro ${c.oro}`);
  await ctx.close();
}
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
if (mancanti.length) console.log('non raggiunte: ' + mancanti.join(', '));
for (const [k, v] of Object.entries(fail)) v.forEach(x => console.log(`  ✗ ${k} ${x}`));
let esito;
if (ROSSO) {
  const cade = k => SCELTI.every(f => fail[k].some(x => x.startsWith(f.k + ':')));
  const K = ['PAL', 'NAV', 'HOME', 'TEST', 'SCH'];
  esito = K.every(cade) && !errs.length;
  console.log(esito ? 'ROSSO ATTESO OK: con __CPM_NO_V2 cadono PAL, NAV, HOME, TEST e SCH in ogni formato' : `ROSSO NON RIUSCITO: cadono ${K.filter(cade).join(', ') || 'nessuno'}`);
} else {
  const ciechi = Object.entries(visti).filter(([, n]) => n === 0).map(([k]) => k);
  esito = Object.values(fail).every(v => !v.length) && !ciechi.length && !mancanti.length && !errs.length;
  console.log(esito ? `grafica-v2 VERDE: ${SCELTI.length} formati · contrasto minimo ${conMin.toFixed(2)}:1` : `grafica-v2 ROSSO${ciechi.length ? ' (ciechi: ' + ciechi.join(', ') + ')' : ''}`);
}
await b.close(); srv.close(); process.exit(esito ? 0 : 1);
