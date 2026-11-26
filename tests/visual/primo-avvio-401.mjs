#!/usr/bin/env node
/* [giro 401 · PO-672] GUARDIANO primo-avvio-401 — il primo avvio di un giocatore nuovo, dal localStorage vuoto alla prima home di carriera.
   Percorso del giocatore vero (SENZA ?cpmtest=1, cosi' l'intro iniziale c'e'), corpi 3D accesi, telefono 412×915 e PC 1280×900:
     1 Home senza salvataggi → «Nuova carriera»
     2 Creazione del calciatore → nome → tasto principale
     3 Intro (video 3D) → «Salta»
     4 Prima schermata del provino (la partita del provino NON si gioca: i tre risultati si scrivono come li scrive il gioco,
       cpm-trial-prog ph:"offers", e si riapre l'app — dichiarato: i tocchi dentro le tre partite non sono contati)
     5 Offerte dei club → «Scegli»
     6 Prima home di carriera (.cpm-career)
   Per ogni schermata: un titolo, l'azione principale visibile SENZA scorrere, nessun testo tagliato (scrollWidth > clientWidth su un
   elemento con testo che nasconde il superfluo, o testo oltre il bordo destro), e ogni passo numerato «Passo N di 3» dove il giro 401 lo
   promette (creazione, provino, offerte). Si contano i tocchi fuori partita e i secondi fino alla home di carriera.
   VERDE = tutti i controlli passano a 412 e 1280, zero errori di pagina.
   ROSSO window.__CPM_NO_G401 (= percorso di prima) → DEVE essere bocciato (il tasto «Inizia i provini» sta sotto la piega al telefono,
   nessun passo numerato nella creazione). Uscita 0 solo se il verde passa E il rosso e' bocciato.
   CPM_FOTO=prima|dopo salva le foto in docs/collaudo-po/401-<fase>-<passo>-<larghezza>.png (prima = col rosso).
   CPM_SOLO=verde|rosso gira un braccio solo (misura; il guardiano li vuole entrambi).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node primo-avvio-401.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const FOTO = process.env.CPM_FOTO || '';
const DIR = path.join(ROOT, 'docs', 'collaudo-po'); if (FOTO) fs.mkdirSync(DIR, { recursive: true });
const RES = [{ goals: 1, assists: 1, rating: 7.2 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 1, assists: 1, rating: 7.4 }];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

/* esame di una schermata: titolo, azione principale senza scorrere, testi tagliati, passo numerato */
async function esame(page, sel, passo) {
  return page.evaluate(([sel, passo]) => {
    const vw = innerWidth, vh = innerHeight;
    const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
    const az = [...document.querySelectorAll(sel)].filter(vis)[0] || null;
    let azione = null;
    if (az) { const r = az.getBoundingClientRect(); const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2)); const top = document.elementFromPoint(cx, cy);
      azione = { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), dentro: r.top >= 0 && r.bottom <= vh + 0.5 && r.left >= 0 && r.right <= vw + 0.5, coperto: !(top && (top === az || az.contains(top) || top.contains(az))), testo: (az.innerText || '').trim().slice(0, 40) }; }
    const testo = document.body.innerText || '';
    const titolo = [...document.querySelectorAll('h1,h2,[data-cpm*="titolo"],[data-cpm="intro-big"],[role="heading"]')].filter(vis).map(e => (e.innerText || '').trim()).filter(Boolean)[0] || null;
    const tagliati = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!vis(e) || e.closest('canvas,svg,select,option,input,textarea,[aria-hidden="true"],[data-cpm="sogni155"]')) continue;
      const proprio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1); if (!proprio) continue;
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      const nasc = s.overflow !== 'visible' || s.overflowX !== 'visible' || s.textOverflow === 'ellipsis';
      if (nasc && e.scrollWidth > e.clientWidth + 2 && s.whiteSpace !== 'normal') tagliati.push((e.innerText || '').trim().slice(0, 30) + ' [ellissi ' + e.clientWidth + '/' + e.scrollWidth + ']');
      else if (r.right > vw + 2 && r.left < vw) tagliati.push((e.innerText || '').trim().slice(0, 30) + ' [oltre il bordo ' + Math.round(r.right) + '/' + vw + ']');
    }
    const passoOk = passo ? new RegExp('Passo\\s*' + passo + '\\s*di\\s*3', 'i').test(testo) : true;
    return { azione, titolo, tagliati: tagliati.slice(0, 6), nTagliati: tagliati.length, passoOk, scorre: document.querySelector('.cpm-scroll') ? document.querySelector('.cpm-scroll').scrollHeight > document.querySelector('.cpm-scroll').clientHeight + 2 : false };
  }, [sel, passo]);
}
const clicca = async (page, sel) => { const h = await page.$(sel); if (!h) return false; await h.scrollIntoViewIfNeeded().catch(() => {}); await h.click({ timeout: 8000 }); return true; };
const tasto = re => `xpath=//button[re:test(normalize-space(.), "${re}")]`;

async function percorso(w, h, rosso) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 600, isMobile: false });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([r]) => { if (r) window.__CPM_NO_G401 = 1; window.__CPM_GLB = true;
    if (!sessionStorage.getItem('p401')) { localStorage.clear(); sessionStorage.setItem('p401', '1'); } }, [rosso]);
  const ko = []; const passi = []; let tocchi = 0; const t0 = Date.now();
  const foto = async nome => { if (FOTO) await page.screenshot({ path: path.join(DIR, `401-${FOTO}-${nome}-${w}.png`) }); };
  const giudica = (nome, e, { passo = false } = {}) => {
    passi.push({ nome, s: Math.round((Date.now() - t0) / 100) / 10, ...e });
    if (!e.titolo) ko.push(`${w}px ${nome}: nessun titolo`);
    if (!e.azione) ko.push(`${w}px ${nome}: azione principale assente`);
    else if (!e.azione.dentro || e.azione.coperto) ko.push(`${w}px ${nome}: azione principale «${e.azione.testo}» non visibile senza scorrere (${e.azione.top}-${e.azione.bottom} su ${h}${e.azione.coperto ? ', coperta' : ''})`);
    else if (e.azione.h < 44) ko.push(`${w}px ${nome}: azione principale alta ${e.azione.h} px (< 44)`);
    if (e.nTagliati) ko.push(`${w}px ${nome}: ${e.nTagliati} testi tagliati (${e.tagliati.join(' · ')})`);
    if (passo && !e.passoOk) ko.push(`${w}px ${nome}: manca «Passo N di 3»`);
  };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 });
    /* 1 Home */
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')), null, { timeout: 90000 });
    await sleep(700); await foto('1-home');
    const eHome = await esame(page, 'button'); const az1 = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')); if (!b) return null; b.setAttribute('data-p401', 'home'); return 1; });
    giudica('home', { ...eHome, ...(await esame(page, '[data-p401="home"]')) });
    const spiega = await page.evaluate(() => /provin/i.test(document.body.innerText) && /club/i.test(document.body.innerText));
    if (!spiega) ko.push(`${w}px home: non spiega in poche parole cosa si fa (provini, club)`);
    await clicca(page, '[data-p401="home"]'); tocchi++;
    /* 2 Creazione */
    await page.waitForSelector('[data-cpm="crea-avanti-v2"]', { timeout: 30000 }); await sleep(900); await foto('2-crea');
    giudica('creazione', await esame(page, '[data-cpm="crea-avanti-v2"]', 1), { passo: true });
    await page.fill('input[name="cpm-hero-name"]', 'Luca Sereni'); tocchi++; await sleep(300);
    await clicca(page, '[data-cpm="crea-avanti-v2"]'); tocchi++;
    /* 3 Intro */
    const salta = await page.waitForSelector('[data-cpm="intro-salta"]', { timeout: 30000 }).then(() => true).catch(() => false);
    if (!salta) ko.push(`${w}px intro: nessun tasto «Salta»`);
    else {
      await sleep(1500); await foto('3-intro');
      const eI = await esame(page, '[data-cpm="intro-salta"]');
      passi.push({ nome: 'intro', s: Math.round((Date.now() - t0) / 100) / 10, azione: eI.azione });
      if (!eI.azione || !eI.azione.dentro || eI.azione.h < 44) ko.push(`${w}px intro: «Salta» non visibile o piccolo (${JSON.stringify(eI.azione)})`);
      await clicca(page, '[data-cpm="intro-salta"]'); tocchi++;
    }
    /* 4 Provino */
    await page.waitForSelector('[data-cpm="provino-pre"]', { timeout: 60000 }); await sleep(900); await foto('4-provino');
    await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="provino-pre"] button')].find(x => /Inizia il provino/.test(x.textContent || '')); if (b) b.setAttribute('data-p401', 'provino'); });
    giudica('provino', await esame(page, '[data-p401="provino"]', 2), { passo: true });
    /* i tre provini: risultati scritti come li scrive il gioco, poi si riapre l'app (ripresa dei provini) */
    await page.evaluate(res => { const env = JSON.parse(localStorage.getItem('cpm-trial-prog') || 'null'); localStorage.setItem('cpm-trial-prog', JSON.stringify({ ph: 'offers', p: env.p, res, slot: env.slot || 0 })); }, RES);
    tocchi += 3; /* «Inizia il provino» ×3 (le due «Vai al provino» e «Vedi le offerte» sono contate qui sotto) */ tocchi += 3;
    await page.reload({ waitUntil: 'load', timeout: 90000 });
    /* 5 Offerte */
    await page.waitForFunction(() => !!document.querySelector('.cpm-offers'), null, { timeout: 90000 }); await sleep(900); await foto('5-offerte');
    await page.evaluate(() => { const b = [...document.querySelectorAll('.cpm-offers button')].find(x => /Scegli/.test(x.textContent || '')); if (b) b.setAttribute('data-p401', 'scegli'); });
    giudica('offerte', await esame(page, '[data-p401="scegli"]', 3), { passo: true });
    await clicca(page, '[data-p401="scegli"]'); tocchi++;
    await sleep(800);
    for (let i = 0; i < 3 && !(await page.$('.cpm-career')); i++) { const c = await page.$(tasto('^(Conferma|Firma|Firma il contratto|Sì, firmo).*')); if (c) { await c.click(); tocchi++; await sleep(800); } }
    /* 6 Home di carriera */
    await page.waitForSelector('.cpm-career', { timeout: 60000 }); await sleep(1500); await foto('6-carriera');
    passi.push({ nome: 'carriera', s: Math.round((Date.now() - t0) / 100) / 10 });
  } catch (e) { ko.push(`${w}px: percorso interrotto (${String(e.message).split('\n')[0].slice(0, 160)})`); }
  if (errs.length) ko.push(`${w}px: errori di pagina: ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close();
  return { w, ko, passi, tocchi, secondi: passi.length ? passi[passi.length - 1].s : null };
}

let ok = true; const fails = [];
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const esiti = {};
try {
  for (const b of bracci) {
    esiti[b] = [];
    for (const [w, h] of [[412, 915], [1280, 900]]) {
      const r = await percorso(w, h, b === 'rosso'); esiti[b].push(r);
      console.log(`  ${b} ${w}px: ${r.tocchi} tocchi fuori partita · ${r.secondi} s fino alla home di carriera`);
      for (const p of r.passi) console.log(`     ${p.nome} @${p.s}s · titolo «${(p.titolo || '').slice(0, 40)}» · azione ${p.azione ? `«${p.azione.testo}» ${p.azione.top}-${p.azione.bottom} h${p.azione.h}${p.azione.dentro ? '' : ' FUORI'}` : '-'}${p.nTagliati ? ' · tagliati ' + p.nTagliati : ''}${p.passoOk === false ? ' · senza passo' : ''}`);
      r.ko.forEach(k => console.log('     ✗ ' + k));
    }
  }
} finally { await browser.close(); srv.close(); }
if (esiti.verde) { const kv = esiti.verde.flatMap(r => r.ko); if (kv.length) { ok = false; fails.push('verde: ' + kv.length + ' controlli falliti'); } else console.log('  ✓ verde: ogni schermata ha titolo, azione principale visibile senza scorrere, nessun testo tagliato, passi numerati, «Salta»'); }
if (esiti.rosso) { const kr = esiti.rosso.flatMap(r => r.ko); if (!kr.length) { ok = false; fails.push('il rosso __CPM_NO_G401 non si distingue'); } else console.log(`  ✓ rosso bocciato (${kr.length} controlli: ${kr[0]})`); }
if (!esiti.verde || !esiti.rosso) { ok = false; fails.push('braccio mancante: non giudicato'); }
if (fails.length) { console.log('\n❌ primo-avvio-401: ' + fails.join(' · ')); process.exit(1); }
console.log('\n✅ primo-avvio-401 verde'); process.exit(0);
