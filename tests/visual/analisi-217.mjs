#!/usr/bin/env node
/* [PO-217 · giro 30] GUARDIANO DELL'ANALISI PRE-PARTITA (foto PO 06/10: tre card di testo uguali e mezza schermata vuota
   sotto «Entra in campo»). Percorso vero: carriera U18 → playMatch → pre-partita → «Analisi dell'avversario».
   Misure (a 412x915 e 360x780, la taglia del PO e un telefono piccolo):
     V1 spazio vuoto — il buco verticale piu' grande fra due blocchi consecutivi della schermata (card, piede col
        pulsante) e fra l'ultimo blocco e il fondo dello schermo, quando il contenuto sta in una schermata. Soglia 64 px;
     V2 vuoto dentro una card — altezza della card meno l'ingombro dei figli, soglia 96 px (1,5 x V1);
     O1 sforamento — scrollWidth del documento oltre la larghezza, ed elementi oltre il bordo destro;
     R1 raggi — ogni scatola della schermata ha un raggio della scala RAD (6·8·12·16·20·pill);
     T1 corpi — ogni testo ha un passo FS (11·12·13·15·17·20·24·32·44·64);
     G1 gerarchia — la difficolta' e' il numero piu' grande (>= FS.display 32) e il nome dell'avversario >= FS.title 20,
        piu' grandi del corpo delle card;
     M1 voce del mister — la figurina del mister e' dentro la card del consiglio;
     B1 pulsante — «Entra in campo» e' l'ultimo blocco e sta dentro lo schermo senza scorrere.
   Rosso: CPM_ROSSO=1 accende window.__CPM_NO_PRE217 (la schermata di prima) e il guardiano deve fallire.
   Foto: docs/sviluppo/foto/analisi217/<tag>-<larg>[-scuro].png. CPM_TEMA=scuro forza TH_DARK prima di aprire l'analisi
   (dal 7.947 il gioco ha un solo tema: lo scuro qui e' una prova di robustezza dei token, non una schermata del gioco).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node analisi-217.mjs  [CPM_ROSSO=1] [CPM_TAG=prima] [CPM_TEMA=scuro] */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1', SCURO = process.env.CPM_TEMA === 'scuro', PRO = process.env.CPM_PRO === '1';/* CPM_PRO=1: carriera pro (consiglio piu' lungo, come nella foto del PO) */
const TAG = (process.env.CPM_TAG || (ROSSO ? 'rosso' : 'verde')) + (PRO ? '-pro' : '');
const OUT = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'analisi217'); fs.mkdirSync(OUT, { recursive: true });
const TAGLIE = [[412, 915], [360, 780]];
const SOGLIA_VUOTO = +(process.env.CPM_VUOTO_MAX || 64);
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const R = { rosso: ROSSO, tema: SCURO ? 'scuro' : 'chiaro', misure: [], errori: [] };
for (const [w, h] of TAGLIE) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => R.errori.push(String(e.message || e).slice(0, 160)));
  await page.addInitScript(([rosso, pro]) => { window.__CPM_CAMT767ON = true; window.__CPM_GLB = false; if (rosso) window.__CPM_NO_PRE217 = true;
    const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: pro ? 'pro' : 'u18', season: 1, week: 1, age: pro ? 22 : 17, ovr: 66, jerseyNum: 77,
      club: pro ? { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' } : { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
      teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
      stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
      form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, [ROSSO, PRO]);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriSettimana), { timeout: 25000 }).catch(() => {});
  try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); await sleep(500); } catch (_e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(500);
  for (let k = 0; k < 6; k++) { const ok = await page.evaluate(() => window.__CPM_CAREER.playMatch()); if (ok === true) break; try { await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); } catch (_e) {} await sleep(400); }
  await page.waitForFunction(() => !!document.querySelector('[data-cpm=prepartita23]'), null, { timeout: 40000 }).catch(() => {});
  await sleep(800);
  if (SCURO) await page.evaluate(() => { try { Object.assign(TH, TH_DARK); document.body.style.background = TH.bg; } catch (_e) {} });
  try { await page.getByText(/Analisi completa|Analisi dell'avversario/).first().click({ timeout: 6000 }); await sleep(1200); } catch (_e) { R.errori.push(`apertura analisi ${w}px non riuscita`); }
  const m = await page.evaluate(() => {
    const FS = [11, 12, 13, 15, 17, 20, 24, 32, 44, 64], RADS = [0, 6, 8, 12, 16, 20];
    const c = document.querySelector('[data-cpm=analisi217]') || document.querySelector('[data-cpm=scout23]'); if (!c) return null;
    const vh = window.innerHeight, W = document.documentElement.clientWidth;
    let sc = c.parentElement; while (sc && sc !== document.body && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (sc === document.body) sc = null;
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
    /* blocchi = figli diretti del contenitore, scendendo nel «corpo» se c'e' */
    let blocchi = []; for (const k of c.children) { if (k.getAttribute('data-cpm') === 'analisi217-corpo') blocchi.push(...k.children); else blocchi.push(k); }
    blocchi = blocchi.filter(vis).map(e => { const r = e.getBoundingClientRect(); return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, t: (e.innerText || '').trim().slice(0, 24).replace(/\n/g, ' ') }; }).sort((a, b) => a.top - b.top);
    let vuoto = 0, dove = '';
    for (let i = 1; i < blocchi.length; i++) { const g = blocchi[i].top - blocchi[i - 1].bottom; if (g > vuoto) { vuoto = g; dove = `fra «${blocchi[i - 1].t}» e «${blocchi[i].t}»`; } }
    const ultimo = blocchi[blocchi.length - 1]; const docH = document.documentElement.scrollHeight;
    const sta = sc ? sc.scrollHeight <= sc.clientHeight + 1 : docH <= vh + 1, fondo = sc ? Math.min(vh, sc.getBoundingClientRect().bottom) : vh;
    if (sta && ultimo) { const g = fondo - (ultimo.bottom - window.scrollY); if (g > vuoto) { vuoto = g; dove = 'sotto l\'ultimo blocco'; } }
    /* V2: il vuoto DENTRO una card (altezza della card meno l'ingombro dei suoi figli): spostare il buco dentro la testata
       non deve bastare a passare V1 */
    let vuotoDentro = 0, doveDentro = '';
    for (const k of (c.querySelector('[data-cpm=analisi217-corpo]') || c).children) { if (!vis(k)) continue; const kr = k.getBoundingClientRect(), z = getComputedStyle(k);
      const figli = [...k.children].filter(vis); if (!figli.length) continue;
      const t0 = Math.min(...figli.map(f => f.getBoundingClientRect().top)), b0 = Math.max(...figli.map(f => f.getBoundingClientRect().bottom));
      const g = (t0 - kr.top - parseFloat(z.paddingTop)) + (kr.bottom - parseFloat(z.paddingBottom) - b0);
      if (g > vuotoDentro) { vuotoDentro = g; doveDentro = (k.innerText || '').trim().slice(0, 24).replace(/\n/g, ' '); } }
    const btn = [...c.querySelectorAll('button')].find(b => /Entra in campo/.test(b.innerText || ''));
    const br = btn ? btn.getBoundingClientRect() : null;
    const raggi = new Set(), corpi = new Set(), oltre = [];
    let maxDiff = 0, corpoMax = 0;
    for (const e of c.querySelectorAll('*')) {
      if (!vis(e) || e.closest('svg') || (e.closest('[data-cpm-figurina]') && e.getAttribute('data-cpm-figurina') == null)) continue;
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      const bg = s.backgroundColor, box = (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) || (s.borderTopStyle !== 'none' && parseFloat(s.borderTopWidth) > 0);
      const rv = parseFloat(s.borderTopLeftRadius) || 0;
      if (box && !/%/.test(s.borderTopLeftRadius) && rv < Math.min(r.width, r.height) / 2 - 1 && !RADS.includes(Math.round(rv)) && e.tagName !== 'BUTTON') raggi.add(Math.round(rv) + 'px');
      const testo = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (testo) { const f = Math.round(parseFloat(s.fontSize) * 10) / 10; if (!FS.includes(f)) corpi.add(f + 'px «' + e.textContent.trim().slice(0, 16) + '»');
        const t = e.textContent.trim();
        if (/^\d+$/.test(t) && e.closest('.cpm-num, [class*=cpm-num]') && f > maxDiff && !e.closest('button')) maxDiff = f;
        if (t.length > 40 && f > corpoMax) corpoMax = f; }
      if (r.right > W + 0.5) oltre.push(Math.round(r.right - W));
    }
    const fig = c.querySelector('[data-cpm=analisi217-mister] [data-cpm-figurina=mister]') || [...c.querySelectorAll('[data-cpm-figurina=mister]')].find(f => /consiglio del mister/i.test((f.closest('[style]') && f.parentElement.parentElement.innerText) || ''));
    /* il nome dell'avversario: nella prima card, il testo NON numerico piu' grande che non sia l'occhiello */
    const primaCard = c.querySelector('[data-cpm=analisi217-corpo] > *') || c.firstElementChild;
    const nomeEl = [...primaCard.querySelectorAll('div,span')].filter(d => d.childElementCount === 0 && !d.closest('svg') && /[a-z]/.test(d.textContent || '') && !/analisi|difficolt/i.test(d.textContent || '')).sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize))[0];
    const cr = c.getBoundingClientRect();
    const catena = []; for (let a = c; a && a !== document.documentElement; a = a.parentElement) { const z = getComputedStyle(a); const rr = a.getBoundingClientRect(); catena.push(`${a.tagName}${a.className ? '.' + String(a.className).slice(0, 20) : ''} h${Math.round(rr.height)} top${Math.round(rr.top)} ov${z.overflowY} sh${a.scrollHeight} pad${z.paddingTop}/${z.paddingBottom}`); }
    const scroller = sc ? { sh: sc.scrollHeight, ch: sc.clientHeight, top: Math.round(sc.getBoundingClientRect().top) } : null;
    return { versione: c.getAttribute('data-cpm'), vh, W, scroller, catena, contenitore: { top: Math.round(cr.top), bottom: Math.round(cr.bottom) }, scrollW: document.documentElement.scrollWidth, docH, vuoto: Math.round(vuoto), dove, vuotoDentro: Math.round(vuotoDentro), doveDentro,
      pulsante: br ? { top: Math.round(br.top), bottom: Math.round(br.bottom), ultimo: !!ultimo && Math.abs((br.bottom + window.scrollY) - ultimo.bottom) < 40 } : null,
      raggi: [...raggi], corpi: [...corpi].slice(0, 6), oltre: oltre.slice(0, 5), difficoltaFs: maxDiff, nomeFs: nomeEl ? parseFloat(getComputedStyle(nomeEl).fontSize) : 0, nome: nomeEl ? nomeEl.textContent.trim() : null, corpoMax, figurinaMister: !!fig };
  });
  if (!m) { R.errori.push(`analisi non aperta a ${w}px`); await ctx.close(); continue; }
  const viol = [];
  if (m.vuoto > SOGLIA_VUOTO) viol.push(`V1 spazio vuoto ${m.vuoto}px ${m.dove} (soglia ${SOGLIA_VUOTO})`);
  if (m.vuotoDentro > SOGLIA_VUOTO * 1.5) viol.push(`V2 vuoto dentro la card «${m.doveDentro}» ${m.vuotoDentro}px (soglia ${SOGLIA_VUOTO * 1.5})`);
  if (m.scrollW > m.W || m.oltre.length) viol.push(`O1 sforamento ${m.scrollW}/${m.W} ${m.oltre.join(',')}`);
  if (m.raggi.length) viol.push('R1 raggi fuori scala ' + m.raggi.join(','));
  if (m.corpi.length) viol.push('T1 corpi fuori scala ' + m.corpi.join(' · '));
  if (m.difficoltaFs < 32) viol.push(`G1 difficolta' a ${m.difficoltaFs}px (< FS.display)`);
  if (m.nomeFs < 20) viol.push(`G1 nome avversario a ${m.nomeFs}px (< FS.title)`);
  if (!m.figurinaMister) viol.push('M1 il consiglio del mister non ha la figurina del mister');
  if (!m.pulsante || m.pulsante.bottom > m.vh + 0.5 || !m.pulsante.ultimo) viol.push('B1 pulsante non in fondo o fuori schermo ' + JSON.stringify(m.pulsante));
  R.misure.push({ w, h, ...m, viol });
  await page.screenshot({ path: path.join(OUT, `${TAG}-${w}${SCURO ? '-scuro' : ''}.png`), fullPage: false });
  await ctx.close();
}
await browser.close(); await new Promise(r => server.close(r));
for (const m of R.misure) console.log(`${m.w}x${m.h} [${m.versione}] vuoto ${m.vuoto}px · dentro ${m.vuotoDentro}px · diff ${m.difficoltaFs}px · nome ${m.nomeFs}px «${m.nome}» · fig.mister ${m.figurinaMister} · pulsante ${JSON.stringify(m.pulsante)}\n   ${m.viol.length ? '❌ ' + m.viol.join('\n   ❌ ') : '✅ nessuna violazione'}`);
if (R.errori.length) console.log('errori: ' + R.errori.join(' | '));
R.esito = (R.misure.length === TAGLIE.length && !R.errori.length && R.misure.every(m => !m.viol.length)) ? 'VERDE' : 'ROSSO';
fs.writeFileSync(path.join(OUT, `misure-${TAG}${SCURO ? '-scuro' : ''}.json`), JSON.stringify(R, null, 1));
console.log(`PO-217 analisi pre-partita → ${R.esito}${ROSSO ? ' (braccio ROSSO __CPM_NO_PRE217)' : ''}`);
process.exit(R.esito === 'VERDE' ? 0 : 1);
