/* esito-282.mjs — [giro 282] GUARDIANO: la rete «la scena non si chiude senza il suo esito» (giro 95 D4) conta il tempo di lettura
   da quando l'esito E' A SCHERMO, non da quando lo chiede.
   Causa misurata (highlight-95 rosso nella 197): a fotogrammi lenti React porta l'esito a schermo 0,7-1,2 s dopo la richiesta della
   rete, che chiudeva 1,6 s dopo la RICHIESTA -> esito leggibile per 0,77-1,19 s (pavimento della sonda 1,2 s, invariato).
   Come provoca: ogni scena non dichiara mai l'esito (__CPM_G95_SENZAESITO, gia' usato da highlight-95) -> lo chiede la rete; la
   comparsa e' ritardata di 900 ms (__CPM_G282RIT, solo sonde) -> il caso «macchina lenta» si ripete uguale a ogni corsa.
   Verde: ogni scena chiusa dalla rete ha l'esito a schermo per almeno 1200 ms. Rosso (__CPM_NO_G282): almeno una sotto.
   «Non giudicato» (meno di 3 scene passate dalla rete) = rosso. Uso: node esito-282.mjs   (CPM_ARMI=verde,rosso · CPM_SEME=1234) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SEME = +(process.env.CPM_SEME || 1234), RIT = +(process.env.CPM_RIT || 900), PAV = 1200, MIN_SCENE = 3;
const raw = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const guasti = [];
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  let ls; if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + SEME; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + SEME; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, r, rit]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_G95_SENZAESITO = 1; window.__CPM_G282RIT = rit; if (r) window.__CPM_NO_G282 = 1;
    if (!sessionStorage.getItem('__g282')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__g282', '1'); } }, [ls, rosso, RIT]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 're', re: 'Filtrante|Uno-due|Lancio smarcante|Servi .* libero|Sponda|scarica su|Appoggio|Cross', tickMs: 150 }), SEME);
  /* si attende un evento (scene chiuse dalla rete, o fine partita), mai un tempo fisso; il tetto serve solo a non restare appesi */
  await page.waitForFunction((n) => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const D = window.__CPM_D495 || [], V = window.__CPM_VIS95 || []; const chiuse = D.filter(d => V.some(v => v.out > d.t)).length; return ph === 'ended' || ph === 'ceremony' || chiuse >= n + 1; }, MIN_SCENE, { timeout: 540000, polling: 500 }).catch(() => {});
  const M = await page.evaluate(() => ({ d: window.__CPM_D495 || [], v: window.__CPM_VIS95 || [], ph: window.__CPM_PHASE && window.__CPM_PHASE() })).catch(() => null);
  await ctx.close(); if (!M) return { scene: [], tot: 0, ph: 'errore' };
  const scene = M.d.map(d => { const v = M.v.filter(x => x.out > d.t)[0]; return v ? { rit: v.rev ? v.rev - d.t : null, letto: v.rev ? v.out - v.rev : 0 } : null; }).filter(Boolean);
  return { scene, tot: M.v.length, ph: M.ph };
}
const R = {};
for (const arm of ARMI) { const r = R[arm] = await braccio(arm === 'rosso'); const corte = r.scene.filter(x => x.letto < PAV);
  console.log(`${arm.toUpperCase()} scene ${r.tot} · chiuse dalla rete ${r.scene.length} · esito a schermo prima della chiusura (ms) ${JSON.stringify(r.scene.map(x => x.letto))} · ritardo richiesta→schermo (ms) ${JSON.stringify(r.scene.map(x => x.rit))} · sotto ${PAV} ms: ${corte.length} · fase finale ${r.ph}`);
  if (r.scene.length < MIN_SCENE) guasti.push(`${arm}: non giudicato, solo ${r.scene.length} scene chiuse dalla rete (pavimento ${MIN_SCENE})`);
  else if (arm === 'verde' && corte.length) guasti.push(`verde: ${corte.length} scene con l'esito a schermo meno di ${PAV} ms prima della chiusura (minimo ${Math.min(...corte.map(x => x.letto))})`);
  else if (arm === 'rosso' && !corte.length) guasti.push('rosso: il difetto non si vede (nessuna scena sotto il pavimento con __CPM_NO_G282)'); }
await b.close(); srv.close();
/* braccio e motivo stampati per ultimi */
if (guasti.length) { console.log('❌ esito-282'); guasti.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ esito-282 verde' + (R.rosso ? ' (e il rosso si vede)' : '')); process.exit(0);
