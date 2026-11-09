#!/usr/bin/env node
/* [giro 124b · PO «Perche' le maglie dei bambini sono salvate?» (foto 184, rosso contro rosso)] guardiano NON-gate, GLB acceso.
   REGOLA (decisa dal PO): ogni bambino porta la divisa AVVERSARIA del calciatore che accompagna; SOLO il colore va giusto.
   CAUSA MISURATA: i bambini non hanno numero e il kit e' tinta unita → _applyHyperKit non entrava ne' nel ramo texture della maglia ne'
   in quello dei pantaloncini: il colore finiva NUDO su un materiale senza mappa; il renderer ha outputEncoding sRGB e legge il colore
   nudo come lineare → lo codifica di nuovo → rosso #c8102e mostrato come salmone. I giocatori usano la texture sRGB (nessun problema).
   FIX: i bambini passano dal ramo texture come i giocatori (5° argomento di _applyHyperKit). Interruttore rosso __CPM_NO_G124.
   MISURA (in pagina, durante il walkout): per ogni bambino, kit atteso = quello della squadra AVVERSARIA del suo calciatore
   (casa=true → __CPM_KIT124.away, altrimenti home); colore MOSTRATO della maglia e dei pantaloncini = pixel centrale della mappa (sRGB)
   oppure, se nuda, il colore lineare ricodificato sRGB. Errore = distanza massima fra i canali (0-255) dal colore del kit.
   SOGLIA (fissata dopo la misura): errore <= 6 per maglia e pantaloncini (texture: 0; nuda: fino a ~90 sui rossi). Coppie: rosso contro
   rosso (la foto), chiaro contro scuro, eroe in trasferta (maglia away forzata). Rosso: __CPM_NO_G124 deve fare errore > 30. Uso: node bambini-124.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const COPPIE = [['rosso-rosso', '#c8102e', '#d6203a'], ['chiaro-scuro', '#f5f5f0', '#14233c'], ['trasferta-eroe', '#1d4ed8', '#e8b800']];
const SHOT = process.env.CPM_SHOT_DIR;
async function braccio(rosso, hero, opp, vw, vh, nome) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r, h, o]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; window.__CPM_FORCE_HEROKIT = h; window.__CPM_FORCE_OPPKIT = o; if (r) window.__CPM_NO_G124 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso, hero, opp]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT());
  await sleep(7000);
  const r = await page.evaluate(() => {
    const hx = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); return m ? [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)) : null; };
    const t = v => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
    const eff = (mat) => { if (mat.map && mat.map.image && mat.map.image.getContext) { const c = mat.map.image, d = c.getContext('2d').getImageData(c.width >> 1, c.height >> 1, 1, 1).data; return [d[0], d[1], d[2]]; } return [t(mat.color.r), t(mat.color.g), t(mat.color.b)]; };
    const K = window.__CPM_KIT124; const out = { kit: !!K, n: 0, errMax: 0, dett: [] };
    (window.__CPM_HYPER_MASCOT_LIST || []).forEach((m, i) => { const a = m.glb911; if (!a || !K) return; const kit = m.casa ? K.away : K.home;
      a.visualRoot.traverse(o => { if (!o.isMesh || !o.material) return; const n = o.material.name; if (n !== 'HyperShirt' && n !== 'HyperShorts') return;
        const exp = hx(n === 'HyperShirt' ? kit.shirt : kit.shorts), got = eff(o.material); if (!exp) return;
        const e = Math.max(...exp.map((v, k) => Math.abs(v - got[k]))); out.n++; out.errMax = Math.max(out.errMax, e); if (out.dett.length < 6) out.dett.push({ i, casa: m.casa, n, exp, got }); }); });
    return out; });
  if (SHOT) { try { await page.screenshot({ path: `${SHOT}/${nome}.png` }); } catch (e) {} }
  await ctx.close(); return r;
}
const FORMATI = [[360, 800], [1440, 900]]; const ko = []; let rossoMax = 0;
for (const [nome, h, o] of COPPIE) {
  for (const [vw, vh] of FORMATI) {
    const v = await braccio(false, h, o, vw, vh, `${nome}-${vw}`);
    console.log(`VERDE ${nome} ${vw}x${vh}:`, JSON.stringify({ n: v.n, errMax: v.errMax, es: v.dett.slice(0, 2) }));
    if (!v.kit || v.n < 4) ko.push(`${nome} ${vw}: non giudicato (kit ${v.kit}, misure ${v.n})`); else if (v.errMax > 6) ko.push(`${nome} ${vw}: errore colore ${v.errMax} > 6`);
  }
}
const rr = await braccio(true, COPPIE[0][1], COPPIE[0][2], 412, 915, 'rosso-rosso-NO');
console.log('ROSSO (__CPM_NO_G124) rosso-rosso:', JSON.stringify({ n: rr.n, errMax: rr.errMax, es: rr.dett.slice(0, 2) }));
const okR = rr.n >= 4 && rr.errMax > 30; if (!okR) ko.push(`il rosso non si vede (n ${rr.n}, errMax ${rr.errMax})`);
await b.close(); srv.close();
if (ko.length) { console.log('❌ bambini-124 ROSSO:\n  ' + ko.join('\n  ')); process.exit(1); }
console.log('✅ bambini-124 verde (e il rosso si vede)');
