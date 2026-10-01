#!/usr/bin/env node
/* [7.999.97 PO-178] dalla 7.999.49 la card «Deadline Day» si intitola «Mercato invernale aperto»: il guardiano cerca il titolo nuovo. */
/* [7.999.30 guardiano — RIQUADRI DELLA HOME: CARD NEUTRA. Collaudo PO «box fuori standard» (Deadline Day giallo, «La tua storia» viola
   scuro), scelta PO 27/09 «Card neutra»] Carriera alla settimana 19 (Deadline Day, capitolo della storia): sulla home ogni riquadro
   ha il fondo standard della card, nessun fondo scuro o sfumato, e il testo dei riquadri ha contrasto >= 4,5 sul suo fondo.
   Rosso: CPM_RED=1 accende __CPM_NO_HOME30 e il guardiano deve fallire. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const SAVE = { phase: 'career', player: { name: 'Probe Home', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 19, age: 25, ovr: 80,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4, tutorialDone: true, weekLived: false, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 74, morale: 74, fatigue: 10, popularity: 50, value: 25, bankBalance: 90000, goals: 9, assists: 4, matches: 18, transferListed: true, /* una finale di coppa questa settimana accende il capitolo «La tua storia» (la vigilia della finale) */ calendar: [{ week: 19, type: 'cup', cupRound: 4, cupRoundName: 'Finale', opponentName: 'Atletico Norte', opponentId: 'atn', played: false, isHome: true }], contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } };
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(c => { window.__CPM_GLB = false; if (c.red) window.__CPM_NO_HOME30 = true; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); }, { red: RED, sv: SAVE });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await sleep(3000);
/* apre le fisarmoniche dei momenti, cosi' il testo dentro i riquadri e' visibile e misurabile */
await page.evaluate(() => { for (const el of Array.from(document.querySelectorAll('[aria-expanded="false"]'))) try { el.click(); } catch (e) {} }); await sleep(800);
const R = await page.evaluate(() => {
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rgb = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const fondo = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage)) return { grad: cs.backgroundImage.slice(0, 80), el: e }; const c = rgb(cs.backgroundColor); if (c && c.a > 0.5) return { c, el: e }; } return { c: { r: 245, g: 243, b: 239, a: 1 }, el: document.body }; };
  const trova = t => Array.from(document.querySelectorAll('div,span')).find(e => e.childElementCount === 0 && (e.textContent || '').trim().toLowerCase().startsWith(t.toLowerCase()));
  const out = { voci: {}, scuri: [], bassi: [] };
  for (const t of ['Mercato invernale', 'La tua storia']) { const e = trova(t); if (!e) { out.voci[t] = null; continue; } const f = fondo(e); out.voci[t] = f.grad ? { grad: f.grad } : { bg: f.c, L: +lum(f.c.r, f.c.g, f.c.b).toFixed(3) }; }
  /* tutti i testi visibili della pagina principale: fondo scuro o sfumato, e contrasto */
  const main = document.getElementById('root');
  for (const e of Array.from(main.querySelectorAll('div,span,strong,b'))) {
    if (e.childElementCount) continue; const t = (e.textContent || '').trim(); if (t.length < 3) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.top > 20000) continue;
    if (e.closest('nav,button,[role="button"],header')) continue;
    if (/^(KE \d|TEST$)/.test(t)) continue; /* badge di versione e di modalita' test: esistono solo con ?cpmtest=1 */
    const f = fondo(e); if (f.el === document.body) continue;
    if (f.grad) { out.scuri.push(t.slice(0, 40) + ' | ' + f.grad); continue; }
    const Lb = lum(f.c.r, f.c.g, f.c.b); if (Lb < 0.2) { out.scuri.push(t.slice(0, 40) + ' | fondo L=' + Lb.toFixed(2)); continue; }
    const c = rgb(getComputedStyle(e).color); if (!c) continue; const Lt = lum(c.r, c.g, c.b); const ratio = (Math.max(Lt, Lb) + 0.05) / (Math.min(Lt, Lb) + 0.05);
    if (ratio < 4.5) out.bassi.push(t.slice(0, 40) + ' | ' + ratio.toFixed(2));
  }
  return out;
});
await page.screenshot({ path: '../character-lab/home-riquadri-30' + (RED ? '-rosso' : '') + '.png', fullPage: true });
await b.close(); srv.close();
console.log(JSON.stringify(R.voci));
console.log('testi su fondo scuro o sfumato:', R.scuri.length, JSON.stringify(R.scuri.slice(0, 12)));
console.log('testi sotto 4,5:1:', R.bassi.length, JSON.stringify(R.bassi.slice(0, 12)));
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(!errs.length, 'nessun errore di pagina ' + errs.join(' · '));
for (const t of ['Mercato invernale', 'La tua storia']) { const v = R.voci[t]; ok(!!v, `«${t}» presente sulla home`); if (v) ok(!v.grad && v.L > 0.97, `«${t}» su fondo card neutro (${v.grad || ('L=' + v.L)})`); }
ok(R.scuri.length === 0, `nessun testo della home su fondo scuro o sfumato (${R.scuri.length})`);
ok(R.bassi.length === 0, `nessun testo della home sotto 4,5:1 (${R.bassi.length})`);
if (err.length) { console.log('\nRIQUADRI HOME: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nRIQUADRI HOME: PASS'); process.exit(0);
