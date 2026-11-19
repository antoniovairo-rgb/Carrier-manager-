#!/usr/bin/env node
/* [giro 287 · PO-546, decisione PO 19/11 «Dentro il pulsante»] GUARDIANO prepartita-287 — `npm run prepartita-287`.
   Gioca, non legge il sorgente: la pre-partita VERA del provino (creazione vera, gancio __CPM_PREP246) a cinque misure di schermo
   (PC 1366x768 · 1457x672 · 1920x1080 · telefono 360x800 · 412x915), e misura i rettangoli del DOM.
   N  ogni nota di pulsante (data-cpm che finisce in «-nota») sta DENTRO il rettangolo del suo pulsante (solo-243-nota → solo-243);
   S  nessuna nota staccata: fra i figli della pila dei pulsanti (.cpm-piena-az) nessun elemento che non e' un pulsante ha testo;
   V  da PC (>= 900 px) il riquadro della partita (la testata) non ha un vuoto verticale > VUOTO_MAX px fra due righe di contenuto
      (ne' fra il bordo interno e la prima/ultima riga); la soglia e' misurata (vedi RAPPORTO-giro287.md);
   P  da PC tutti i pulsanti della pre-partita sono interi nella finestra SENZA scorrere (scroll a 0) — a 1366x768 e a 1457x672;
   T  al telefono ogni pulsante e' alto >= 44 px, la nota non e' tagliata (nessun trabocco orizzontale/verticale) e il tasto e' intero.
   Rosso window.__CPM_NO_G287 (la schermata di prima): nota staccata sotto la pila e riquadro con i vuoti → DEVE cadere su N, S e V.
   «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node prepartita-287.mjs   (CPM_PARTE=verde|rosso · CPM_FOTO=<cartella>) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, clickByText, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const FOTO = process.env.CPM_FOTO || null; const NOME = 'Collaudo Prepartita 287';
const VUOTO_MAX = 40; /* px: misurato nel giro 287 — vedi il rapporto */
const MISURE = [[1366, 768, 'pc'], [1457, 672, 'pc'], [1920, 1080, 'pc'], [360, 800, 'tel'], [412, 915, 'tel']];
const J = x => JSON.stringify(x);

async function misura(W, H, rosso, srv) {
  const port = srv.address().port; const b = await launchBrowser(); const out = { W, H };
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  try {
    await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PREP246 = true; if (r) window.__CPM_NO_G287 = true; }, rosso);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(800);
    if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato');
    await sleep(700);
    await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME);
    if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato');
    await sleep(500); await clickByText(page, 'Inizia il provino');
    let ok = false; for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!document.querySelector('[data-cpm="prepartita23"] [data-cpm="solo-243"]')).catch(() => false)) { ok = true; break; } await sleep(400); }
    if (!ok) throw new Error('pre-partita col tasto dei salienti mai raggiunta');
    await sleep(900);
    Object.assign(out, await page.evaluate(() => {
      document.querySelectorAll('.cpm-scroll').forEach(s => { s.scrollTop = 0; }); window.scrollTo(0, 0);
      const R = el => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), h: Math.round(r.height) }; };
      const pp = document.querySelector('[data-cpm="prepartita23"]');
      const vis = el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
      const bottoni = [...pp.querySelectorAll('button')].filter(vis).map(x => { const c = x.cloneNode(true); c.querySelectorAll('[data-cpm$="-nota"]').forEach(n => n.remove());
        return { testo: (c.textContent || '').trim(), cpm: x.getAttribute('data-cpm'), ...R(x) }; });
      /* N: ogni nota di pulsante dentro il suo pulsante */
      const note = [...pp.querySelectorAll('[data-cpm$="-nota"]')].filter(vis).map(n => { const id = n.getAttribute('data-cpm'); const tid = id.replace(/-nota$/, '');
        const t = pp.querySelector(`[data-cpm="${tid}"]`); const rn = R(n), rt = t ? R(t) : null;
        const dentro = !!rt && rn.l >= rt.l - 0.5 && rn.r <= rt.r + 0.5 && rn.t >= rt.t - 0.5 && rn.b <= rt.b + 0.5 && !!(t && t.contains(n));
        const tagliata = n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1 || getComputedStyle(n).textOverflow === 'ellipsis' && n.scrollWidth > n.clientWidth;
        return { id, testo: (n.textContent || '').trim(), dentro, tagliata, nota: rn, tasto: rt }; });
      /* S: figli della pila dei pulsanti che non sono pulsanti e hanno testo */
      const pila = pp.querySelector('.cpm-piena-az') || pp;
      const staccate = [...pila.querySelectorAll(':scope > *, :scope > div > *')].filter(el => vis(el) && el.tagName !== 'BUTTON' && !el.querySelector('button') && !el.closest('button') && (el.textContent || '').trim().length > 0 && !el.closest('.cpm-card,[data-cpm="testata287"]'))
        .map(el => ({ cpm: el.getAttribute('data-cpm'), testo: (el.textContent || '').trim().slice(0, 60), ...R(el) }));
      /* V: vuoti verticali nella testata (primo figlio della pre-partita) */
      const card = pp.firstElementChild; const rc = R(card); const cs = getComputedStyle(card);
      const pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0, bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0;
      const righe = [...card.children].filter(vis).map(R).sort((a, b) => a.t - b.t);
      const vuoti = []; let y = rc.t + bt + pt;
      for (const r of righe) { vuoti.push(Math.round(r.t - y)); y = Math.max(y, r.b); }
      vuoti.push(Math.round(rc.b - bb - pb - y));
      const info = card.querySelector('[data-cpm="pp-info287"]') || [...card.children].find(c => /Stadio/.test(c.textContent || '') && /Orario/.test(c.textContent || ''));
      return { bottoni, note, staccate, testata: { ...rc, righe: righe.length, vuoti, vuotoMax: Math.max(...vuoti) }, info: info ? R(info) : null,
        sfora: Math.round(Math.max(...bottoni.map(x => x.b)) - innerHeight), innerH: innerHeight, scrollH: (document.querySelector('.cpm-scroll') || document.documentElement).scrollHeight };
    }));
    if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: path.join(FOTO, `prepartita-${W}x${H}${rosso ? '-rosso' : ''}.png`) }); }
  } catch (e) { out.err = String(e.message).slice(0, 160); }
  out.errs = errs.slice(0, 3); await b.close(); return out;
}

function giudica(o, tipo) {
  const ng = o.err ? 'NON GIUDICATO: ' + o.err : null;
  const g = !ng && Array.isArray(o.bottoni) && o.bottoni.length > 0;
  const righe = [];
  const solo = g && o.bottoni.find(x => x.cpm === 'solo-243');
  righe.push({ k: 'N note dentro il loro pulsante', ok: g && o.note.length > 0 && o.note.every(n => n.dentro), info: ng || J(o.note.map(n => ({ id: n.id, dentro: n.dentro, nota: n.nota, tasto: n.tasto }))) });
  righe.push({ k: 'S nessuna nota staccata sotto la pila', ok: g && o.staccate.length === 0, info: ng || J(o.staccate) });
  righe.push({ k: 'L il tasto dice «Gioca solo i momenti salienti» e la nota «solo le tue azioni»', ok: !!solo && solo.testo === 'Gioca solo i momenti salienti' && o.note.some(n => /solo le tue azioni/.test(n.testo)), info: ng || J(o.bottoni.map(x => x.testo)) });
  if (tipo === 'pc') {
    righe.push({ k: `V testata senza vuoti verticali > ${VUOTO_MAX} px`, ok: g && o.testata.vuotoMax <= VUOTO_MAX, info: ng || `vuoti ${J(o.testata.vuoti)} · alta ${o.testata.h}` });
    if (o.W <= 1457) righe.push({ k: 'P tutti i pulsanti visibili senza scorrere', ok: g && o.sfora <= 0, info: ng || `ultimo tasto sfora di ${o.sfora} px (finestra ${o.innerH})` });
  } else {
    righe.push({ k: 'T tasti >= 44 px, nota non tagliata', ok: g && o.bottoni.every(x => x.h >= 44) && o.note.every(n => !n.tagliata) && !!solo && solo.l >= 0 && solo.r <= o.W, info: ng || `altezze ${J(o.bottoni.map(x => x.h))} · tagliata ${J(o.note.map(n => n.tagliata))}` });
  }
  righe.push({ k: 'E nessun errore di pagina', ok: !(o.errs || []).length && !o.err, info: J([o.errs, o.err || null]) });
  return righe;
}

async function braccio(rosso, srv) {
  const tag = rosso ? 'rosso' : 'verde'; const tutte = [];
  for (const [W, H, tipo] of MISURE) {
    const o = await misura(W, H, rosso, srv); const righe = giudica(o, tipo); tutte.push({ W, H, righe });
    console.log(`  [${tag}] ${W}x${H}: ${righe.map(x => (x.ok ? '✓' : '✗') + x.k.split(' ')[0]).join(' ')} · testata ${o.testata ? J(o.testata.vuoti) + ' h' + o.testata.h : '—'} · sfora ${o.sfora ?? '—'}`);
    for (const r of righe) if (!r.ok) console.log(`      ✗ ${r.k}: ${String(r.info).slice(0, 400)}`);
    if (process.env.CPM_DUMP) console.log(J(o).slice(0, 3000));
  }
  return tutte;
}

const srv = await startServer();
const esiti = {};
if (PARTE !== 'rosso') esiti.verde = await braccio(false, srv);
if (PARTE !== 'verde') esiti.rosso = await braccio(true, srv);
srv.close();
let okV = true, okR = true;
if (esiti.verde) okV = esiti.verde.every(m => m.righe.every(r => r.ok));
if (esiti.rosso) { /* il rosso deve cadere su N, S e (da PC) V in OGNI misura giudicata */
  okR = esiti.rosso.every(m => { const f = k => m.righe.find(r => r.k.startsWith(k)); const ng = m.righe.some(r => /NON GIUDICATO/.test(String(r.info)));
    if (ng) return false; const pc = m.W >= 900; return !f('N').ok && !f('S').ok && (!pc || !f('V').ok); }); }
console.log('');
if (esiti.verde) console.log(`VERDE (gioco di oggi): ${okV ? '✅ tutte le misure verdi' : '❌ rosso'}`);
if (esiti.rosso) console.log(`ROSSO (__CPM_NO_G287, la schermata di prima): ${okR ? '✅ cade su N, S e V come deve' : '❌ il guardiano non vede il difetto (o non giudicato)'}`);
process.exit(okV && okR ? 0 : 1);
