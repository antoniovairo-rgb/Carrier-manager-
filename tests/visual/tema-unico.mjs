#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 4 — decisione PO 03/11 «La grafica deve essere unica, meno manutenzione»] GUARDIANO DEL TEMA UNICO.
   S  statico (senza browser): nel codice dei frammenti src/*.jsx (commenti esclusi) non esiste piu' nessun tema alternativo ne' un suo
      interruttore — TH_DARK, TH_LIGHT, TH_LIGHT_ORIG, TH_V2, temaAttivo, v2On(), TH.v2, TH.dk, thPastel, __CPM_NO_V2, la tavolozza V2.
      e lo stato darkMode/onTheme del vecchio selettore. Un ramo «nuovo : vecchio» rientrato riaccende la doppia manutenzione.
   P  preferenza vecchia: un salvataggio con la preferenza «cpm-dark»=1 rimasta in localStorage (il selettore della 7.946) apre la carriera
      senza errori, sul fondo notte #0d0f14; le Opzioni non offrono nessuna scelta di tema (chiaro/scuro/tema).
   B  banco di prova chiuso: __CPM_TEMA_PROVA (il braccio rosso dei guardiani grafici) e' IGNORATO senza ?cpmtest=1 — un token alterato
      non arriva mai al gioco vero.
   ROSSO (CPM_PROVA_ROSSO=1): il tema di prova a basso contrasto (lib/tema-prova.mjs) armato sul passo P → cade P (fondo non notte). */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
import { armaTemaRosso, TEMA_ROSSO } from './lib/tema-prova.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const KO = { S: [], P: [], B: [] };
/* --- S: statico --- */
const SRC = new URL('../../src/', import.meta.url).pathname;
const VIETATI = [/\bTH_DARK\b/, /\bTH_LIGHT(_ORIG)?\b/, /\bTH_V2\b/, /\btemaAttivo\b/, /\bv2On\s*\(/, /\bTH\.v2\b/, /\bTH\.dk\b/, /\bthPastel\b/, /__CPM_NO_V2\b/, /(^|[^.\w])V2\.[a-z]/, /\bdarkMode\b/, /\bonTheme\b/];
for (const f of fs.readdirSync(SRC).filter(x => x.endsWith('.jsx')).sort()) {
  const t = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  t.split('\n').forEach((r, i) => { const c = r.replace(/(^|[^:])\/\/.*$/, '$1'); for (const re of VIETATI) if (re.test(c)) KO.S.push(`${f}:${i + 1} ${re.source}`); });
}
console.log(`  S statico: ${KO.S.length} residui di temi alternativi` + (KO.S.length ? ' — ' + KO.S.slice(0, 5).join(' | ') : ''));
/* --- P e B: nel browser --- */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];
const RGB = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); return m ? m[1].split(/[ ,/]+/).slice(0, 3).join(',') : s; };
{ const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push('P · ' + String(e.message).slice(0, 120)));
  await page.addInitScript(INIT, { seme: 4242, tema: 'scuro'/* cpm-dark=1: la preferenza del vecchio selettore */, rossi: [], save: SAVE });
  if (ROSSO) await armaTemaRosso(page);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1000);
  const pref = await page.evaluate(() => localStorage.getItem('cpm-dark'));
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { KO.P.push('manca Continua sul salvataggio'); }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) KO.P.push('la carriera non si apre con la preferenza cpm-dark=1');
  else {
    await sleep(1200); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor), root = await page.evaluate(() => { const r = document.querySelector('.cpm-root'); return r ? getComputedStyle(r).backgroundColor : ''; });
    if (RGB(bg) !== '13,15,20') KO.P.push('fondo della pagina ' + RGB(bg) + ' (atteso 13,15,20)');
    if (root && RGB(root) !== '13,15,20') KO.P.push('fondo della radice ' + RGB(root));
    const op = page.locator('[aria-label="Opzioni"]').first();
    if (await op.count()) { await op.click(); await sleep(900);
      const t = await page.evaluate(() => { const x = [...document.querySelectorAll('div')].find(d => getComputedStyle(d).position === 'fixed' && /Opzioni/.test(d.textContent || '') && +getComputedStyle(d).zIndex >= 9000); return x ? x.innerText : null; });
      if (t == null) KO.P.push('le Opzioni non si aprono');
      else if (/\b(tema|scuro|chiaro|dark|light)\b/i.test(t)) KO.P.push('le Opzioni offrono ancora una scelta di tema: ' + (t.match(/.{0,30}\b(tema|scuro|chiaro|dark|light)\b.{0,30}/i) || [''])[0]);
      console.log(`  P preferenza cpm-dark=${pref}: carriera aperta · fondo ${RGB(bg)} · Opzioni ${t == null ? 'non aperte' : 'aperte, ' + t.split('\n').length + ' righe'}`);
    } else KO.P.push('manca il tasto Opzioni nella testata');
  }
  await ctx.close(); }
{ const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push('B · ' + String(e.message).slice(0, 120)));
  await page.addInitScript(t => { window.__CPM_TEMA_PROVA = t; window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); } catch (_e) {} }, TEMA_ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1500);
  const v = await page.evaluate(() => { try { return { bg: TINTE.bg, sec: TINTE.sec, th: TH.muted }; } catch (e) { return { err: String(e.message) }; } });
  if (v.err || v.bg !== '#0d0f14' || v.sec !== '#9aa3b2' || v.th !== '#9aa3b2') KO.B.push('senza ?cpmtest=1 il tema di prova arriva al gioco: ' + JSON.stringify(v));
  console.log('  B senza ?cpmtest=1 col tema di prova armato: ' + JSON.stringify(v));
  await ctx.close(); }
await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
for (const [k, v] of Object.entries(KO)) v.slice(0, 8).forEach(x => console.log(`  ✗ ${k} ${x}`));
let ok;
if (ROSSO) { ok = KO.P.some(x => /fondo/.test(x)) && !KO.S.length && !KO.B.length; console.log(ok ? 'ROSSO ATTESO OK: col tema di prova armato cade P (fondo non notte)' : 'ROSSO NON RIUSCITO'); }
else { ok = !KO.S.length && !KO.P.length && !KO.B.length && !errs.length; console.log(ok ? 'tema-unico VERDE: nessun tema alternativo nel codice, preferenza vecchia innocua, banco di prova chiuso fuori da ?cpmtest=1' : 'tema-unico ROSSO'); }
process.exit(ok ? 0 : 1);
