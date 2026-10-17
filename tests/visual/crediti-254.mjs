#!/usr/bin/env node
/* [PO-254 guardiano] «Crediti, pulsante/link troppo minimale ed il contenuto non e' stato aggiornato (tutte le fonti sono state
   individuate)». Sostituisce crediti-238 (archiviato) e ne tiene i controlli di struttura.
   Carica il gioco su pagina pulita (home, nessuna carriera), a 360 e 412 px, e prova:
   1) PULSANTE DEL KIT: [data-cpm=crediti254-pulsante] e' un Btn a tutta larghezza (>= 90% della colonna della home), con icona,
      senza sottolineatura, sotto il bottone «Nuova carriera»;
   2) NESSUNA «Fonte da completare»: zero [data-cpm=crediti238-manca] e la scritta non compare nel testo;
      le voci «Non posso confermarlo» sono scritte cosi' e in grigio (colore della descrizione, non rosso);
   3) OGNI VOCE DEL DOCUMENTO E' PRESENTE: la tabella di docs/governo/CREDITI-fonti.md viene letta riga per riga; per ogni riga
      il guardiano pretende nella finestra i testi elencati in ATTESI (giro 25b: +5 righe rimesse con la loro fonte);
   4) [giro 25b] le voci SENZA_LIC non hanno riga Licenza ne' «Non posso confermarlo»; le voci CON_NC lo mostrano in grigio. Se il documento cambia numero di righe, il guardiano
      si dichiara ROSSO finche' ATTESI non viene allineato (una riga nuova non puo' passare inosservata).
   Piu' i controlli di crediti-238: Modal standard (testa/piede/titolo), niente scorrimento orizzontale, «Chiudi» chiude.
   Foto: out/crediti-254/home-<w>.png · crediti-<w>.png · crediti-<w>-fondo.png
   ROSSO: CPM_ROSSO=__CPM_NO_CREDITI254 → torna il link sottile e il contenuto vecchio, il guardiano deve uscire 1. */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO || '';
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out', 'crediti-254' + (process.env.CPM_FOTO_SUFFISSO || '')); fs.mkdirSync(OUT, { recursive: true });
const DOC = fs.readFileSync(path.join(DIR, '..', '..', 'docs', 'governo', 'CREDITI-fonti.md'), 'utf8');
const righe = DOC.split('\n').filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1).map(l => l.split('|').slice(1, -1).map(c => c.trim()));
// Una voce per riga del documento, nello stesso ordine: [testo che identifica la riga nel documento, testi pretesi nella finestra].
const ATTESI = [
  ['Soccer Player - Rigged', ['Soccer Player - Rigged', 'Hisenberg', 'Royalty Free', 'CGTrader']],
  ['Regular Male', ['Regular Male', 'Mixamo (Adobe)']],
  ['Ritratti delle figurine', ['Ritratti delle figurine', 'OpenAI']],
  ['Great Vibes', ['Great Vibes', 'Robert Leuschke', 'SIL Open Font License 1.1']],
  ['Barlow', ['Barlow', 'Barlow Condensed', 'Jeremy Tribby']],
  ['Mixkit 3022', ['Mixkit', '3022', 'Mixkit Sound Effects Free License']],
  ['Brusio di folla', ['Brusio di folla', 'generato per Korward Elite']],
  ['DiceBear (libreria)', ['DiceBear', 'Florian Körner', 'MIT']],
  ['Avataaars', ['Avataaars', 'Pablo Stanley']],
  ['Micah', ['Micah', 'Micah Lanier', 'CC BY 4.0']],
  ['React/ReactDOM', ['React', 'Three.js', 'Babel', 'MIT']],
  // [giro 25b, decisione PO 15/10 «Rimettile con la loro fonte»]
  ['Microsoft Rocketbox', ['Microsoft Rocketbox', 'actor-journalist.glb', 'actor-presenter-f.glb', 'MIT']],
  ['Animazioni Mixamo', ['Animazioni Mixamo', 'cgtrader-clip-mixamo.glb', 'footballer', 'royalty free', 'mixamo-faq']],
  ['GLTFLoader', ['GLTFLoader', 'SkeletonUtils', 'three@0.128.0', 'three.js authors']],
  ['Effetti sonori', ['Web Audio', 'Realizzati per Korward Elite']],
  ['Icone', ["Icone dell'app", 'Realizzate per Korward Elite']],
];
// [giro 25b, decisione PO 15/10 «Senza riga licenza»] voci che NON hanno riga Licenza ne' «Non posso confermarlo»,
// e voci dove il documento dice «Non posso confermarlo» (lo devono mostrare, in grigio).
const SENZA_LIC = ['Regular Male', 'Ritratti delle figurine', 'Web Audio', "Icone dell'app"];
/* [7.999.171 PO-267] «Non posso confermarlo» non si mostra piu' al giocatore: le voci non confermate stanno senza la riga
   (col rosso __CPM_NO_CRED267 tornano, e allora valgono i controlli di prima). */
const R267 = !!process.env.CPM_NO_CRED267;
/* [7.999.172 PO-268] al giocatore niente numero d'ordine ne' data dell'acquisto CGTrader (restano modello, autore e CGTrader come
   fonte). Col rosso __CPM_NO_CRED268 (CPM_ROSSO=__CPM_NO_CRED268) tornano, e il guardiano DEVE uscire 1. */
const ORDINE268 = ['17876008', '20/09/2026', 'Ordine CGTrader'];
const CON_NC = R267 ? ['Mixkit 3022', 'Avataaars'] : [];
const NONCONF_MIN = R267 ? (DOC.match(/Non posso confermarlo/g) || []).length - 1 : 0; // la riga d'intestazione del documento ne nomina uno
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let ko = [];
if (righe.length !== ATTESI.length) ko.push(`il documento ha ${righe.length} righe, il guardiano ne conosce ${ATTESI.length}: allineare ATTESI`);
ATTESI.forEach(([k], i) => { if (!righe[i] || !righe[i][0].includes(k.replace(' (libreria)', '')) && !righe[i][0].includes(k)) ko.push(`riga ${i + 1} del documento non e' «${k}»: ${righe[i] ? righe[i][0] : '-'}`); });
for (const w of [360, 412]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  if (ROSSO) await page.addInitScript(r => { String(r).split(',').forEach(k => { window[k.trim()] = 1; }); }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 60000 }).catch(() => {});
  await sleep(600);
  await page.screenshot({ path: path.join(OUT, `home-${w}.png`), fullPage: true });
  // 1) il pulsante del kit
  const p = await page.evaluate(() => {
    const el = document.querySelector('[data-cpm="crediti254-pulsante"]');
    const nc = [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || ''));
    if (!el) return null;
    const r = el.getBoundingClientRect(), col = el.parentElement.getBoundingClientRect(), cs = getComputedStyle(el);
    return { tag: el.tagName, w: r.width, col: col.width, sotto: nc ? r.top >= nc.getBoundingClientRect().bottom : false,
      icona: !!el.querySelector('[data-cpm="crediti254-icona"]'), sott: cs.textDecorationLine, testo: (el.textContent || '').trim() };
  });
  if (!p) ko.push(`${w}px: pulsante «Crediti» del kit assente`);
  else {
    if (p.tag !== 'BUTTON') ko.push(`${w}px: il pulsante non e' un <button>`);
    if (p.w < p.col * 0.9) ko.push(`${w}px: pulsante non a tutta larghezza (${p.w.toFixed(0)} su ${p.col.toFixed(0)} px)`);
    if (!p.icona) ko.push(`${w}px: pulsante senza icona`);
    if (/underline/.test(p.sott)) ko.push(`${w}px: pulsante sottolineato come un link`);
    if (!p.sotto) ko.push(`${w}px: pulsante non sotto «Nuova carriera»`);
    if (!/Crediti/.test(p.testo)) ko.push(`${w}px: il pulsante non dice «Crediti»`);
  }
  const apri = await page.$('[data-cpm="crediti254-pulsante"]') || await page.$('[data-cpm="crediti238-voce-home"]');
  if (!apri) { ko.push(`${w}px: nessun accesso ai Crediti nella home`); await ctx.close(); continue; }
  await apri.scrollIntoViewIfNeeded(); await apri.click(); await sleep(500);
  const r = await page.evaluate(() => {
    const m = document.querySelector('[data-cpm="crediti238"]'), pn = document.querySelector('[data-cpm="crediti238-pannello"]');
    const nc = [...document.querySelectorAll('[data-cpm="crediti254-nonconf"]')].map(e => getComputedStyle(e).color);
    const d = document.querySelector('[data-cpm="crediti254-desc"]');
    return { modal: !!m, testa: !!(pn && pn.querySelector('[data-cpm="finestra-testa"]')), piede: !!(pn && pn.querySelector('[data-cpm="finestra-piede"]')),
      titolo: (pn && pn.querySelector('[data-cpm="finestra-titolo"]') || {}).textContent || '', testo: m ? m.textContent : '',
      manca: document.querySelectorAll('[data-cpm="crediti238-manca"]').length, nc, grigio: d ? getComputedStyle(d).color : '',
      voci: document.querySelectorAll('[data-cpm="crediti238-voce"]').length,
      vt: [...document.querySelectorAll('[data-cpm="crediti238-voce"]')].map(e => ({ t: e.textContent || '', nc: !!e.querySelector('[data-cpm="crediti254-nonconf"]') })),
      oriz: document.documentElement.scrollWidth - window.innerWidth, pOriz: pn ? pn.scrollWidth - pn.clientWidth : 0 };
  });
  await page.screenshot({ path: path.join(OUT, `crediti-${w}.png`) });
  await page.evaluate(() => { const pn = document.querySelector('[data-cpm="crediti238-pannello"]'); if (pn) pn.scrollTop = pn.scrollHeight; }); await sleep(200);
  await page.screenshot({ path: path.join(OUT, `crediti-${w}-fondo.png`) });
  if (!r.modal || !r.testa || !r.piede || r.titolo !== 'Crediti') ko.push(`${w}px: la finestra non e' il Modal standard (${JSON.stringify({ modal: r.modal, testa: r.testa, piede: r.piede, titolo: r.titolo })})`);
  // 2) niente «Fonte da completare», «Non posso confermarlo» in grigio
  if (r.manca || /Fonte da completare|fonte da completare/.test(r.testo)) ko.push(`${w}px: ${r.manca} voci portano ancora «Fonte da completare»`);
  if (!R267 && r.nc.length) ko.push(`${w}px: «Non posso confermarlo» mostrato ${r.nc.length} volte al giocatore (PO-267: la riga non va mostrata)`);
  if (r.nc.length < NONCONF_MIN) ko.push(`${w}px: «Non posso confermarlo» scritto ${r.nc.length} volte, il documento lo dice ${NONCONF_MIN}`);
  if (r.nc.some(c => c !== r.grigio)) ko.push(`${w}px: «Non posso confermarlo» non e' in grigio (${r.nc.join(' ')} contro ${r.grigio})`);
  // 3) ogni voce del documento
  for (const [k, testi] of ATTESI) { const assenti = testi.filter(t => !r.testo.includes(t)); if (assenti.length) ko.push(`${w}px: voce «${k}» del documento: manca ${assenti.join(', ')}`); }
  { const o = ORDINE268.filter(t => r.testo.includes(t)); if (o.length) ko.push(`${w}px: i Crediti mostrano ancora l'ordine d'acquisto (${o.join(', ')}) — PO-268`); }
  for (const k of SENZA_LIC) { const v = r.vt.find(x => x.t.includes(k)); if (!v) ko.push(`${w}px: voce «${k}» assente`); else if (/Licenza:|Non posso confermarlo/.test(v.t)) ko.push(`${w}px: voce «${k}» mostra una riga Licenza o «Non posso confermarlo» (decisione PO: senza riga licenza)`); }
  for (const k of CON_NC) { const v = r.vt.find(x => x.t.includes(k)); if (!v || !v.nc) ko.push(`${w}px: voce «${k}» senza «Non posso confermarlo» in grigio`); }
  if (r.oriz > 1 || r.pOriz > 1) ko.push(`${w}px: scorrimento orizzontale (${r.oriz}/${r.pOriz} px)`);
  const chiudi = await page.$('[data-cpm="crediti238-pannello"] [data-cpm="finestra-piede"] button'); if (chiudi) { await chiudi.click(); await sleep(300); }
  if (await page.$('[data-cpm="crediti238"]')) ko.push(`${w}px: «Chiudi» non chiude`);
  if (errs.length) ko.push(`${w}px: pageerror ${errs[0]}`);
  console.log(`  ${w}px: pulsante ${p ? `${p.w.toFixed(0)}/${p.col.toFixed(0)} px, icona ${p.icona}, sotto ${p.sotto}` : 'assente'} · voci ${r.voci} · da completare ${r.manca} · non confermabili ${r.nc.length} · orizz ${r.oriz}/${r.pOriz}`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(`PO-254 crediti · ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'} · righe del documento ${righe.length}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — pulsante del kit, nessuna «Fonte da completare», ogni voce di CREDITI-fonti.md presente'); process.exit(0);
