#!/usr/bin/env node
/* [giro 369 · PO-419] SONDA (non guardiano) misura-369: statura, peso e piede dell'eroe nelle schermate che li mostrano.
   Gioco vero (?cpmtest=1), una pagina nuova per prova. Per ogni coppia (aspetto, nome) misura:
     A) CREAZIONE: la figurina grande (143 px) col suo «NNN cm · NN kg»; se c'e' la scelta del piede e quale e' preselezionata;
     B) CARRIERA: salvataggio sintetico con lo stesso aspetto e nome → figurina ingrandita della testata (stessa riga «cm · kg»),
        Carriera › Profilo (cm/kg/piede se scritti), e il campo salvato (player.altezzaCm/pesoKg/foot).
   Una coppia di schermate «diversa» = stessa carriera, due numeri diversi. Stampa JSON su stdout.
   CPM_FLAG369=<nome> accende un interruttore (es. __CPM_NO_G369). Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node misura-369.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { salva } from './misura-199.mjs';

export const PROVE = [
  { avatarId: 0, name: 'Luca Ferri', nation: 'Italia' }, { avatarId: 3, name: 'Marco Bellini', nation: 'Italia' },
  { avatarId: 5, name: 'Jonas Weber', nation: 'Germania' }, { avatarId: 8, name: 'Diego Ramos', nation: 'Spagna' },
  { avatarId: 9, name: 'Pierre Lafont', nation: 'Francia' },
];
const RE_FIS = /(\d{3})\s*cm\s*·\s*(\d{2,3})\s*kg/;
const testoDi = (page, sel) => page.evaluate((sel) => { const e = document.querySelector(sel); return e ? (e.innerText || '') + ' ' + (e.textContent || '') : null; }, sel);
const fis = (t) => { const m = t && RE_FIS.exec(t); return m ? { cm: +m[1], kg: +m[2] } : null; };

async function nuovaPagina(browser, port, flags, init) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([fl, init]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; for (const f of fl) window[f] = 1;
    try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} if (init) localStorage.setItem('cpm-v3', JSON.stringify(init)); }, [flags, init || null]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  return { page, errors };
}

/* A) creazione: apre «Nuova carriera», sceglie l'aspetto, scrive nome e nazione, legge la figurina e la scelta del piede */
export async function misuraCreazione(browser, port, prova, flags = [], foto = null) {
  const { page, errors } = await nuovaPagina(browser, port, flags, null);
  try {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')); if (b) b.click(); });
    await page.waitForFunction(() => /Crea il tuo calciatore/i.test(document.body.innerText), null, { timeout: 20000 });
    await sleep(500);
    await page.evaluate((id) => { const lbl = (typeof AVATARS !== 'undefined' && AVATARS[id]) ? AVATARS[id].label : null;
      const b = [...document.querySelectorAll('.cpm-create button[title]')].find(x => x.getAttribute('title') === lbl); if (b) b.click(); }, prova.avatarId);
    await sleep(300);
    await page.fill('input[name="cpm-hero-name"]', prova.name);
    await page.selectOption('[data-cpm="crea-nazione"]', prova.nation).catch(() => {});
    await sleep(600);
    const fig = await page.evaluate(() => { const c = document.querySelector('.cpm-create'); if (!c) return null; const f = c.querySelector('[data-cpm="figurina23"], div'); return (c.innerText || '') + ' ' + (c.textContent || ''); });
    const piede = await page.evaluate(() => { const g = document.querySelector('[data-cpm="crea-piede369"]'); if (!g) return null;
      const sel = g.querySelector('[aria-pressed="true"],[aria-checked="true"]'); return { presente: true, scelto: sel ? sel.getAttribute('data-piede') : null }; });
    if (foto) { await page.evaluate(() => { const c = document.querySelector('.cpm-create'); if (c) c.scrollIntoView({ block: 'start' }); }); await sleep(300); await page.screenshot({ path: foto }); }
    return { fisico: fis(fig), piede, errors };
  } finally { await page.close(); }
}

/* il piede che il gioco assegna oggi (F8): stessa formula di CreateScreen, calcolata nella pagina con hashStr vero */
export async function piedeAtteso(browser, port, prova) {
  const { page } = await nuovaPagina(browser, port, [], null);
  try { return await page.evaluate(([n, nat]) => (Math.abs(hashStr(n + nat)) % 100) < 22 ? 'L' : 'R', [prova.name, prova.nation]); } finally { await page.close(); }
}

/* B) carriera: salvataggio con lo stesso aspetto/nome (senza i campi nuovi = salvataggio vecchio, oppure con extra) */
export async function misuraCarriera(browser, port, prova, flags = [], extra = {}, foto = null) {
  const pl = salva({ name: prova.name, nation: prova.nation, avatarId: prova.avatarId, ...extra });
  if (!('foot' in extra)) delete pl.foot;
  const { page, errors } = await nuovaPagina(browser, port, flags, { phase: 'career', player: pl });
  try {
    try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
    await sleep(900);
    await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
    await sleep(500);
    const snap = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { altezzaCm: p.altezzaCm, pesoKg: p.pesoKg, foot: p.foot }; });
    /* testata: figurina ingrandita */
    await page.evaluate(() => { const b = document.querySelector('[data-cpm="figurina-testata"]'); if (b) b.click(); });
    await sleep(700);
    const testata = fis(await testoDi(page, '[data-cpm="figurina-completa"]'));
    if (foto) await page.screenshot({ path: foto.replace('.png', '-testata.png') });
    await page.evaluate(() => { const c = document.querySelector('[data-cpm="figurina-completa"]'); if (c) c.click(); });
    await sleep(300);
    /* Carriera › Profilo */
    await page.evaluate(() => { try { window.__CPM_CAREER.goTab('profile'); } catch (e) {} });
    await sleep(900);
    const tp = await testoDi(page, '[data-cpm="carriera-v2"]');
    const profilo = { fisico: fis(tp), piede: tp ? (/piede\s+(destro|sinistro|mancino)/i.exec(tp) || [])[1] || null : null, trovato: tp != null };
    if (foto) { await page.evaluate(() => { const c = document.querySelector('[data-cpm="carriera-v2"]'); if (c) c.scrollIntoView({ block: 'start' }); }); await sleep(300); await page.screenshot({ path: foto.replace('.png', '-profilo.png') }); }
    return { snap, testata, profilo, errors };
  } finally { await page.close(); }
}

export function confronta(prova, crea, car, atteso) {
  const schermi = [['creazione', crea.fisico], ['testata', car.testata], ['profilo', car.profilo.fisico]].filter(([, f]) => f);
  let coppie = 0, diverse = 0; const elenco = [];
  for (let i = 0; i < schermi.length; i++) for (let j = i + 1; j < schermi.length; j++) { coppie++;
    const [a, fa] = schermi[i], [b, fb] = schermi[j]; if (fa.cm !== fb.cm || fa.kg !== fb.kg) { diverse++; elenco.push(`${a} ${fa.cm}/${fa.kg} ≠ ${b} ${fb.cm}/${fb.kg}`); } }
  return { prova: `${prova.avatarId}·${prova.name}`, schermi: Object.fromEntries(schermi.map(([k, f]) => [k, `${f.cm}/${f.kg}`])), coppie, diverse, elenco,
    piedeAtteso: atteso, piedeCreazione: crea.piede, piedeProfilo: car.profilo.piede, salvato: car.snap };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const flags = process.env.CPM_FLAG369 ? [process.env.CPM_FLAG369] : [];
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const out = [];
  try {
    for (const p of PROVE) {
      const crea = await misuraCreazione(browser, port, p, flags); const car = await misuraCarriera(browser, port, p, flags); const at = await piedeAtteso(browser, port, p);
      const r = confronta(p, crea, car, at); out.push(r); console.error(JSON.stringify(r));
    }
  } finally { await browser.close(); srv.close(); }
  const tot = out.reduce((a, r) => ({ coppie: a.coppie + r.coppie, diverse: a.diverse + r.diverse }), { coppie: 0, diverse: 0 });
  console.log(JSON.stringify({ flags, tot, out }, null, 1));
}
