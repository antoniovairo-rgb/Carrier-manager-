#!/usr/bin/env node
/* [giro 408 · PO-674, foto PO 26/11 «La cornice dell'agente e' sballata» (docs/collaudo-po/216-cornice-agente.jpg)]
   GUARDIANO cornice-408 — ogni RITRATTO (figurina con volto e senza testo: procuratore, mister, giornalisti, dirigenti,
   compagni in miniatura) ha UNA cornice standard:
     - un solo bordo: nel sottoalbero della figurina un solo elemento disegna un filo (border visibile o box-shadow ad anello);
     - la foto copre il riquadro: area dell'immagine dentro la figurina >= 98% dell'area della figurina;
     - raggi uguali: il raggio dell'elemento che ritaglia la foto (antenato con overflow nascosto) e' quello della cornice.
   Dove si misura: «Il confronto» (agentCheckin.due), «Il primo incontro» (apriIntro253), e le schede dashboard · agente ·
   ufficio · profile, a 412x915 e 1280x900. Salvataggio S12 con procuratore (agentHirePatch), come procuratore-253.
   «Non giudicato» = ROSSO: se il confronto non mostra il ritratto o un'immagine non si carica, il guardiano fallisce.
   VERDE: tutte le regole su tutti i ritratti misurati. ROSSO window.__CPM_NO_G408 (cornice di prima): almeno una regola
   deve cadere sul ritratto del confronto, altrimenti il guardiano e' cieco.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node cornice-408.mjs
        CPM_SOLO=verde|rosso un braccio · CPM_FOTO=<prefisso> salva le foto · CPM_MISURA=1 stampa e non giudica (solo per la misura prima) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const VISTE = [[412, 915], [1280, 900]];
const BRACCI = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const CASI = ['confronto', 'incontro', 'dashboard', 'agente', 'ufficio', 'profile'];
const COPRE_MIN = 0.98;
const srv = await startServer(); const b = await launchBrowser();

/* misura di ogni ritratto in pagina (eseguita nel browser) */
const misura = async () => {
  const figs = [...document.querySelectorAll('[data-cpm-volto="1"]')].filter(f => !f.textContent.trim());
  const visibile = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
  const out = [];
  for (const f of figs.filter(visibile)) {
    const img = f.querySelector('img'); const R = f.getBoundingClientRect();
    if (img && !img.complete) await new Promise(res => { img.onload = img.onerror = res; setTimeout(res, 4000); });
    let bordi = 0; const chi = [];
    for (const e of [f, ...f.querySelectorAll('*')]) {
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const bw = parseFloat(cs.borderTopWidth) || 0, bc = cs.borderTopColor;
      const conBordo = bw > 0 && cs.borderTopStyle !== 'none' && !/rgba\([^)]*,\s*0\)$/.test(bc) && bc !== 'transparent';
      /* anello = box-shadow con spostamento 0 0 e sfocatura 0 (filo), o inset */
      const sh = cs.boxShadow || 'none';
      const anello = sh !== 'none' && sh.split(/,(?![^(]*\))/).some(s => /inset/.test(s) || /\s0px\s+0px\s+0px\s+[1-9]/.test(' ' + s.replace(/rgba?\([^)]*\)/, '').trim()));
      if (conBordo || anello) { bordi++; chi.push((e === f ? 'cornice' : e.tagName.toLowerCase()) + (conBordo ? ':border' : ':anello')); }
    }
    let copre = 0, rClip = null, rImg = null, caricata = false;
    /* cornice «di fondo»: il fondo della figurina (tinta o sfumatura) che resta visibile attorno alla foto e' anch'esso un bordo */
    if (img) { const I = img.getBoundingClientRect(), cs = getComputedStyle(f);
      const margine = Math.max(I.left - R.left, I.top - R.top, R.right - I.right, R.bottom - I.bottom);
      const fondo = cs.backgroundImage !== 'none' || !/rgba\([^)]*,\s*0\)$|transparent/.test(cs.backgroundColor);
      if (margine > 0.5 && fondo) { bordi++; chi.push(`cornice:fondo ${margine.toFixed(1)}px`); } }
    if (img) {
      caricata = img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility !== 'hidden';
      const I = img.getBoundingClientRect();
      const ix = Math.max(0, Math.min(I.right, R.right) - Math.max(I.left, R.left)), iy = Math.max(0, Math.min(I.bottom, R.bottom) - Math.max(I.top, R.top));
      const fit = getComputedStyle(img).objectFit;
      copre = (fit === 'cover' || fit === 'fill') ? (ix * iy) / (R.width * R.height) : 0;
      let a = img.parentElement; while (a && a !== f && getComputedStyle(a).overflow === 'visible') a = a.parentElement;
      rClip = parseFloat(getComputedStyle(a || f).borderTopLeftRadius) || 0; rImg = parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0;
    }
    out.push({ tipo: f.getAttribute('data-cpm-figurina'), w: Math.round(R.width), h: Math.round(R.height), x: Math.round(R.left), y: Math.round(R.top),
      bordi, chi, copre: Math.round(copre * 1000) / 1000, rCornice: parseFloat(getComputedStyle(f).borderTopLeftRadius) || 0, rClip, rImg, caricata,
      nelConfronto: !!f.closest('[data-cpm="confronto23"]') });
  }
  return out;
};

async function apri([W, H], braccio, caso) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message || e)));
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.r === 'rosso') window.__CPM_NO_G408 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: braccio, save });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const r = await page.evaluate(caso => {
    const C = window.__CPM_CAREER; const p = C.get();
    const ag = window.agentHirePatch({ ...p, bankBalance: 1e7 }, 0, null);
    const base = { hasAgent: true, agent: ag.agent, agentInit: { open: false }, agentHint: null, coachPact: null, coachPactSeason: p.season || 1 };
    if (caso === 'confronto') { C.patch({ ...base, agentCheckin: { due: true, s: p.season || 1, w: p.week || 1 } }); C.goTab('dashboard'); return true; }
    if (caso === 'incontro') { C.patch({ ...base, hasAgent: false, agent: null, agentCheckin: { due: false }, bankBalance: 1e7 }); return C.apriIntro253(); }
    C.patch({ ...base, agentCheckin: { due: false } }); return C.goTab(caso);
  }, caso);
  await sleep(2500);
  return { ctx, page, r, errori };
}

const esito = []; const g = [];
for (const V of VISTE) for (const braccio of BRACCI) for (const caso of CASI) {
  const { ctx, page, r, errori } = await apri(V, braccio, caso);
  const m = await page.evaluate(misura);
  if (process.env.CPM_FOTO) await page.screenshot({ path: `${process.env.CPM_FOTO}-${V[0]}-${caso}-${braccio}.png` });
  esito.push({ W: V[0], braccio, caso, aperta: r, m, errori }); await ctx.close();
}
await b.close(); srv.close();

const giudica = x => {
  const d = [];
  if (!x.caricata) d.push('immagine non caricata (non giudicato)');
  if (x.bordi !== 1) d.push(`${x.bordi} bordi ${JSON.stringify(x.chi)}`);
  if (x.copre < COPRE_MIN) d.push(`foto copre ${(x.copre * 100).toFixed(1)}% < ${COPRE_MIN * 100}%`);
  if (x.rClip !== x.rCornice) d.push(`raggio della foto ${x.rClip} ≠ cornice ${x.rCornice}`);
  return d;
};
for (const e of esito) {
  console.log(`[${e.W}px ${e.braccio} ${e.caso}] aperta=${e.aperta} ritratti=${e.m.length}`);
  for (const x of e.m) { const d = giudica(x); console.log(`   ${d.length ? '✗' : '✓'} ${x.tipo} ${x.w}×${x.h} @${x.x},${x.y} bordi=${x.bordi} copre=${x.copre} r=${x.rCornice}/${x.rClip}${x.nelConfronto ? ' [confronto]' : ''}${d.length ? ' — ' + d.join(' · ') : ''}`); }
  if (e.errori.length) console.log('   errori di pagina:', e.errori.slice(0, 3));
}
if (process.env.CPM_MISURA) process.exit(0);
for (const W of VISTE.map(v => v[0])) {
  const v = esito.filter(e => e.W === W && e.braccio === 'verde');
  for (const e of v) {
    if (e.errori.length) g.push(`${W}px ${e.caso}: errori di pagina ${JSON.stringify(e.errori.slice(0, 2))}`);
    for (const x of e.m) { const d = giudica(x); if (d.length) g.push(`${W}px ${e.caso} ${x.tipo} ${x.w}×${x.h}: ${d.join(' · ')}`); }
  }
  const cv = v.find(e => e.caso === 'confronto');
  if (cv && !cv.m.some(x => x.nelConfronto)) g.push(`${W}px verde: il ritratto del confronto non c'e' (non giudicato)`);
  const iv = v.find(e => e.caso === 'incontro');
  if (iv && !iv.m.length) g.push(`${W}px verde: nessun ritratto nel primo incontro (non giudicato)`);
  if (BRACCI.includes('rosso')) {
    const cr = esito.find(e => e.W === W && e.braccio === 'rosso' && e.caso === 'confronto');
    const rc = cr && cr.m.find(x => x.nelConfronto);
    if (!rc) g.push(`${W}px rosso: il ritratto del confronto non c'e' (non giudicato)`);
    else if (!giudica(rc).length) g.push(`${W}px rosso: con __CPM_NO_G408 la cornice di prima passa (guardiano cieco) ${JSON.stringify(rc)}`);
  }
}
if (g.length) { console.log('❌ cornice-408'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
const n = esito.filter(e => e.braccio === 'verde').reduce((s, e) => s + e.m.length, 0);
console.log(`✅ cornice-408 verde: ${n} ritratti in ${CASI.length} schermate a ${VISTE.map(v => v[0]).join(' e ')} px — un bordo, foto >= 98% del riquadro, raggi uguali${BRACCI.includes('rosso') ? '; il rosso __CPM_NO_G408 cade sul confronto' : ''}`);
