#!/usr/bin/env node
/* [giro 211 · PO-472] GUARDIANO nomi-211 — «nella scala dei nomi delle squadre aggiungere il gradino del NOME CORTO del club fra
   il nome con la categoria e la sigla, quando entra» (decisione PO 15/11). Esempio del PO: «Torino Athletic Primavera» →
   «Torino Athletic U19» → «Torino Athletic» → sigla.
   Sul gioco vero (?cpmtest=1):
   1. SCALA PURA (funzione unica candidatiSquadra182) su TUTTI i club: ogni club con la categoria nel nome («Primavera») ha almeno
      un gradino SENZA categoria prima della sigla; il caso del PO e' esattamente la sua scala; la scala resta dal piu' lungo al
      piu' corto e la sigla e' l'ultima.
   2. BARRA DELLA PARTITA (provino vero, varco __CPM_BARRA203) a 360×640 · 375×667 · 390×844 col TOUCH e 1366×768 PC: ogni club
      sulla barra; per ogni nome si misura lo spazio vero e la larghezza vera dei testi (stesso carattere) e si conta il SALTO:
      sulla barra c'e' la sigla mentre il nome corto (nome senza categoria, anche abbreviato col dizionario o senza FC/AC in
      testa) ci starebbe. Verde: 0 salti in ogni vista; il nome mostrato e' il primo gradino che ci sta.
   3. SCANSIONE: alle quattro viste il nome corto del caso del PO non entra mai (misurato), quindi lo si provoca scorrendo le
      larghezze touch 360→640: deve comparire almeno una volta, con 0 salti (altrimenti «non giudicato» = rosso).
   Rosso: CPM_ROSSO211=1 accende window.__CPM_NO_G211 (scala di prima) → DEVE uscire 1.
   Foto: CPM_FOTO211=<cartella> (barra a 375 col caso del PO). Uso: cd tests/visual && node nomi-211.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO211 === '1';
const FOTO = process.env.CPM_FOTO211 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const VISTE = [{ width: 360, height: 640 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1366, height: 768 }]
  .filter(v => !process.env.CPM_VISTE || process.env.CPM_VISTE.split(',').includes(String(v.width)));
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errors = [];
async function apri(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G211 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Collaudo Nomi' });
  await page.waitForFunction(() => typeof window.__CPM_BARRA203 === 'function' && !!document.querySelector('[data-cpm="barra-nome-182"]'), null, { timeout: 60000 });
  await page.evaluate(() => { window.__CPM_FROZEN = true; });
  return page;
}
/* misura sul DOM: spazio disponibile del nome (contenitore meno stemma e spazi, se in riga) e larghezza vera di ogni testo */
const MISURA = () => {
  const out = [];
  const pr = document.createElement('span'); document.body.appendChild(pr);
  const CAT = /\s+(?:Primavera|U19)$/, PREF = /^(?:FC|AC|CF|AT|SC|SS|US|AS|U\.S\.|A\.C\.|A\.S\.)\s+(?=\S)/;
  for (const el of document.querySelectorAll('[data-cpm="barra-nome-182"]')) {
    const cs = getComputedStyle(el), pe = el.parentElement, pcs = getComputedStyle(pe);
    let w = pe.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
    if (pcs.display.includes('flex') && !pcs.flexDirection.startsWith('column')) {
      const k = [...pe.children].filter(c => c !== el && getComputedStyle(c).position !== 'absolute' && getComputedStyle(c).display !== 'none');
      for (const c of k) { const rr = c.getBoundingClientRect(); const cc = getComputedStyle(c); w -= rr.width + parseFloat(cc.marginLeft) + parseFloat(cc.marginRight); }
      w -= (parseFloat(pcs.columnGap) || 0) * k.length;
    }
    pr.style.cssText = `position:absolute;left:-9999px;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`;
    /* la sonda misura la larghezza frazionaria, il componente scrollWidth (intero) contro clientWidth + 0,5: al confine (±1 px)
       i due criteri possono dissentire per arrotondamento. Si giudica solo FUORI dalla fascia di confine, dichiarandola:
       «ci sta netto» = almeno 1 px di margine; «non ci sta netto» = oltre 1,5 px fuori. */
    const larg = (t) => { pr.textContent = t; return pr.getBoundingClientRect().width; };
    const netto = (t) => larg(t) <= w - 1, fuoriNetto = (t) => larg(t) > w + 1.5;
    const cand = (el.getAttribute('data-cand182') || '').split('|'); const intero = cand[0];
    /* il NOME CORTO, indipendente dalla scala: il nome senza categoria, e le sue forme brevi (dizionario, senza FC/AC in testa) */
    const corto = intero.replace(CAT, '');
    const forme = corto !== intero ? [corto, window.__CPM_NOMI182.abbrevia(corto)] : [];
    for (const f of [...forme]) { const s = f.replace(PREF, ''); if (s !== f && s.length >= 3) forme.push(s); }
    const fitCorto = forme.find(f => netto(f)) || null;
    const li = cand.findIndex(t => t.toUpperCase() === el.textContent.toUpperCase());
    const primoNetto = cand.findIndex(t => netto(t));
    /* sbagliato: un gradino PRIMA di quello mostrato ci sta netto (si e' scesi troppo), o quello mostrato non ci sta netto e non e' l'ultimo */
    const troppoGiu = primoNetto >= 0 && li > primoNetto, troppoSu = li >= 0 && li < cand.length - 1 && fuoriNetto(cand[li]);
    const primo = (li < 0 || troppoGiu || troppoSu) ? (cand[primoNetto] || cand[cand.length - 1]) : el.textContent;
    out.push({ intero, cand, testo: el.textContent, w: Math.floor(w), primo, fitCorto, conCat: corto !== intero, pref: PREF.test(corto) });
  }
  pr.remove();
  return out;
};
const sintesi = {};
let page = null, touchAperto = null;
try {
  console.log('1) scala dei nomi (funzione unica)');
  page = await apri(VISTE[0], VISTE[0].width < 1000); touchAperto = VISTE[0].width < 1000;
  const pura = await page.evaluate(() => {
    const club = [...new Map([...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS].map(c => [c.id || c.n, c])).values()];
    const C = window.__CPM_NOMI182.candidati;
    let conCat = 0, senzaCorto = [], storti = [], cortiNuovi = 0;
    for (const c of club) {
      const k = C(c); const sg = c.a || c.abbr;
      for (let i = 1; i < k.length; i++) if (k[i].length > k[i - 1].length) storti.push(c.n + ': ' + k.join('→'));
      if (k[k.length - 1] !== sg) storti.push(c.n + ': sigla non ultima');
      if (/\sPrimavera$/.test(c.n)) { conCat++; const g = k.slice(1, -1).filter(t => !/(Primavera|U19)/.test(t));
        if (!g.length) senzaCorto.push(c.n); else if (k.includes(c.n.replace(/\s+Primavera$/, ''))) cortiNuovi++; }
    }
    const po = C({ n: 'Torino Athletic Primavera', a: 'TAT' });
    const fc = C({ n: 'FC Valmora Primavera', a: 'VAL' });
    return { n: club.length, conCat, senzaCorto: senzaCorto.length, esempi: senzaCorto.slice(0, 4), storti: storti.slice(0, 3), nStorti: storti.length, cortiNuovi, po, fc };
  });
  console.log(`    club ${pura.n} · con la categoria nel nome ${pura.conCat} · senza un gradino senza categoria prima della sigla ${pura.senzaCorto} (${pura.esempi.join('; ')})`);
  ok(pura.n >= 250, `censimento: ${pura.n} club (attesi almeno 250)`);
  ok(pura.conCat > 0 && pura.senzaCorto === 0, `ogni club con la categoria ha il nome corto prima della sigla: mancano ${pura.senzaCorto} su ${pura.conCat}`);
  ok(JSON.stringify(pura.po) === JSON.stringify(['Torino Athletic Primavera', 'Torino Athletic U19', 'Torino Athletic', 'TAT']), `caso del PO: ${pura.po.join(' → ')}`);
  ok(JSON.stringify(pura.fc) === JSON.stringify(['FC Valmora Primavera', 'FC Valmora U19', 'Valmora U19', 'Valmora', 'VAL']), `club con FC in testa invariato: ${pura.fc.join(' → ')}`);
  ok(pura.nStorti === 0, `scala dal piu' lungo al piu' corto, sigla ultima (${pura.nStorti} storti ${pura.storti.join('; ')})`);
  const club = await page.evaluate(() => [...new Map([...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS].map(c => [c.id || c.n, c])).values()].map(c => ({ ...c })));
  for (const vp of VISTE) {
    const touch = vp.width < 1000;
    console.log(`2) barra a ${vp.width}×${vp.height} ${touch ? 'touch' : 'PC'}`);
    if (touch !== touchAperto) { await page.context().close(); page = await apri(vp, touch); touchAperto = touch; }
    await page.setViewportSize(vp); await sleep(400);
    const tutti = [];
    for (let i = 0; i < club.length; i += 2) {
      const h = club[i], a = club[(i + 1) % club.length];
      await page.evaluate(([h, a]) => window.__CPM_BARRA203(h, a), [h, a]);
      await page.waitForFunction(([hn, an]) => { const e = [...document.querySelectorAll('[data-cpm="barra-nome-182"]')].map(x => x.getAttribute('data-intero182')); return e[0] === hn && e[1] === an; }, [h.n, a.n], { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
      const m = await page.evaluate(MISURA);
      m.forEach((x, k) => tutti.push({ ...x, sigla: (k ? a : h).a }));
    }
    const salti = tutti.filter(x => x.testo === x.sigla && x.fitCorto);
    const sbagliati = tutti.filter(x => x.testo.toUpperCase() !== x.primo.toUpperCase());
    const cortoMostrato = tutti.filter(x => x.conCat && !x.pref && x.testo === x.intero.replace(/\s+Primavera$/, ''));
    const sig = tutti.filter(x => x.testo === x.sigla);
    sintesi[vp.width] = { nomi: tutti.length, sigla: sig.length, salti: salti.length, cortoMostrato: cortoMostrato.length, sbagliati: sbagliati.length, esempi: salti.slice(0, 3).map(x => `${x.intero} «${x.testo}» (ci stava «${x.fitCorto}», ${x.w}px)`) };
    console.log(`    ${tutti.length} nomi · in sigla ${sig.length} · SALTI del nome corto ${salti.length} · nome corto Primavera mostrato ${cortoMostrato.length} · non primo gradino ${sbagliati.length}`);
    ok(tutti.length >= club.length * 0.95, `${vp.width}px: misurati ${tutti.length} nomi su ${club.length}`);
    ok(salti.length === 0, `${vp.width}px: nessuna sigla dove il nome corto ci sta (${salti.length}${salti.length ? ': ' + sintesi[vp.width].esempi.join('; ') : ''})`);
    ok(sbagliati.length === 0, `${vp.width}px: il nome mostrato e' il primo gradino che ci sta (${sbagliati.length}${sbagliati.length ? ': ' + sbagliati.slice(0, 2).map(x => x.intero + ' «' + x.testo + '» atteso «' + x.primo + '»').join('; ') : ''})`);
    if (FOTO && vp.width === 375) {
      const el = await page.$('[data-cpm="barra"]');
      const t = club.find(c => /Primavera$/.test(c.n) && !/^(FC|AC|CF|AT|SC|SS|US|AS)\s/.test(c.n));
      if (el && t) { await page.evaluate(([h, a]) => window.__CPM_BARRA203(h, a), [t, club.find(c => c.a === 'FFT') || t]); await sleep(500);
        await el.screenshot({ path: `${FOTO}/barra-375-nome-corto-${ROSSO ? 'prima' : 'dopo'}.png` }); console.log(`    foto: ${t.n}`); }
    }
  }
  /* 3. il caso del PO non entra mai sulla barra alle quattro viste (misurato: «Torino Athletic» non ci sta), quindi lo si PROVOCA:
     si scorrono le larghezze del telefono col touch finche' il nome corto entra e il nome con la categoria no */
  if (!process.env.CPM_VISTE || process.env.CPM_SCANSIONE === '1') {
    console.log('3) scansione delle larghezze col touch (club Primavera senza sigla societaria in testa)');
    if (!touchAperto) { await page.context().close(); page = await apri({ width: 360, height: 740 }, true); touchAperto = true; }
    const pr = club.filter(c => /\sPrimavera$/.test(c.n) && !/^(?:FC|AC|CF|AT|SC|SS|US|AS)\s/.test(c.n));
    let larghezze = 0, corti = 0, saltiS = [], sbagliS = [];
    for (let w = 360; w <= 640; w += 4) {
      await page.setViewportSize({ width: w, height: 740 }); await sleep(120);
      for (const t of pr) {
        await page.evaluate(([h]) => window.__CPM_BARRA203(h, h), [t]);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
        const m = await page.evaluate(MISURA); larghezze++;
        for (const x of m) { if (x.testo === x.intero.replace(/\s+Primavera$/, '')) corti++;
          if (x.testo === t.a && x.fitCorto) saltiS.push(`${w}px ${x.intero} «${x.testo}» (ci stava «${x.fitCorto}»)`);
          if (x.testo.toUpperCase() !== x.primo.toUpperCase()) sbagliS.push(`${w}px «${x.testo}» atteso «${x.primo}»`); }
      }
      if (FOTO && w === 520) {   /* stessa larghezza nei due bracci: a 520 px touch il nome corto entra */ const el = await page.$('[data-cpm="barra"]'); if (el) { await el.screenshot({ path: `${FOTO}/barra-scansione-${w}-${ROSSO ? 'prima' : 'dopo'}.png` }); sintesi.fotoScan = w; } }
    }
    sintesi.scansione = { club: pr.map(c => c.n), larghezze, cortiMostrati: corti, salti: saltiS.length, sbagliati: sbagliS.length };
    console.log(`    ${pr.length} club · ${larghezze} misure · nome corto mostrato ${corti} volte · salti ${saltiS.length} · non primo gradino ${sbagliS.length}`);
    ok(pr.length > 0 && corti > 0, `scansione: il nome corto entra e si vede (${corti} nomi su ${larghezze * 2})`);
    ok(saltiS.length === 0, `scansione: nessuna sigla dove il nome corto ci sta (${saltiS.length}${saltiS.length ? ': ' + saltiS.slice(0, 3).join('; ') : ''})`);
    ok(sbagliS.length === 0, `scansione: il nome mostrato e' il primo gradino che ci sta (${sbagliS.length}${sbagliS.length ? ': ' + sbagliS.slice(0, 2).join('; ') : ''})`);
  }
  ok(errors.length === 0, `nessun errore di pagina (${errors.length}${errors.length ? ': ' + errors[0] : ''})`);
} catch (e) { ok(false, 'non giudicato, eccezione: ' + String(e.message).slice(0, 300)); }
try { await page.context().close(); } catch (e) {}
await browser.close(); srv.close();
ok(Object.keys(sintesi).filter(k => /^\d+$/.test(k)).length === VISTE.length && VISTE.length > 0, `viste giudicate ${Object.keys(sintesi).filter(k => /^\d+$/.test(k)).length} su ${VISTE.length}`);
const telefoni = Object.entries(sintesi).filter(([w]) => +w < 1000);
console.log(`    nome corto Primavera mostrato alle viste telefono: ${telefoni.map(([w, s]) => w + ':' + s.cortoMostrato).join(' · ')} (il caso si giudica nella scansione)`);
console.log('sintesi ' + JSON.stringify(sintesi));
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G211] ' : ''}nomi-211: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
