#!/usr/bin/env node
/* [7.428.0] GUARDIANO — IL MISTER HA LA FACCIA DEL MISTER
   (collaudo PO, screenshot «IL MISTER TI CERCA — Mister Bellandi»: «ma ha il volto di una donna?»)

   IL DIFETTO: il ritratto del mister era un DiceBear `micah` a briglia sciolta sul seed del nome —
   e micah, libero, pesca anche acconciature lunghe, colori fantasia (lilla, turchese) e orecchini:
   «Mister Bellandi» usciva con capelli viola e volto femminile. Misurato sulla griglia dei 16
   COACH_NAMES: 6 su 16 incoerenti con la persona «mister».

   COSA MISURA: apre la partita VERA (salvataggio carriera con «Mister Bellandi» — il nome del
   collaudo), naviga al tab CLUB (scheda «Allenatore», sempre renderizzata) e confronta i ritratti
   in pagina con due riferimenti calcolati in pagina dallo STESSO bundle: il micah a briglia
   sciolta (il difetto) e il micah con la palette maschile COACH_NPC_FACES + opzioni vincolate
   (il fix). In pagina deve esserci il secondo e NON il primo. PROVA DEL ROSSO: eseguito sul
   build pre-fix, in pagina c'era il micah libero (fallimento atteso e osservato).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node coach-face-test.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: {
    name: 'Collaudo Volti', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 5, age: 21, ovr: 74,
    club: { id: 'mil', n: 'AC Milanello', a: 'ACM', p: 82, c: '#dc2626', c2: '#111111', nat: '🇮🇹', lg: 'Serie Alfa' },
    coach: { name: 'Mister Bellandi', style: 'Bilanciato', trustMod: 0 },
    stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 74, passaggio: 73, dribbling: 74, posizionamento: 73 },
    form: 70, morale: 70, fatigue: 10, popularity: 40, value: 10, bankBalance: 50000,
    contract: { duration: 3, wage: 15000, expiresAtSeason: 5 },
  } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 20000 });
await page.evaluate(() => window.__CPM_CAREER.goTab('club'));
await sleep(1200);

const R = await page.evaluate(() => {
  /* tutti i ritratti in pagina (la scheda «Allenatore» del tab club rende NpcFaceCoach a 42px) */
  const svgs = [...document.querySelectorAll('svg')].map(s => s.outerHTML);
  if (!svgs.length) return { err: 'nessun ritratto in pagina' };
  const seed = 'coach-Mister Bellandi', size = 42;
  const libero = window.DiceBear.makeAvatar(seed, { size, style: 'micah' });
  /* le STESSE opzioni del fix (palette COACH_NPC_FACES via npcFaceIdx, qui replicate) */
  const FACES = [
    { skin: '#f5c5a3', hair: '#2d1800', hairStyle: 'short', beard: false },
    { skin: '#e8b898', hair: '#909090', hairStyle: 'short', beard: true },
    { skin: '#c8956a', hair: '#1a0800', hairStyle: 'medium', beard: false },
    { skin: '#f0c090', hair: '#909090', hairStyle: 'bald', beard: false },
    { skin: '#7c4a1e', hair: '#0f0500', hairStyle: 'short', beard: false },
    { skin: '#fad5c0', hair: '#e8d840', hairStyle: 'short', beard: false },
  ];
  const nm = 'Mister Bellandi'; let n = 0; for (let i = 0; i < nm.length; i++) n += nm.charCodeAt(i);
  const f = FACES[Math.abs(n) % FACES.length];
  const HM = { short: 'fonze', medium: 'dannyPhantom', bald: 'mrClean' };
  const atteso = window.DiceBear.makeAvatar(seed, { size, style: 'micah',
    skinColor: [f.skin.replace('#', '')], hairColor: [f.hair.replace('#', '')],
    micah: { hair: [HM[f.hairStyle] || 'fonze'], hairProbability: f.hairStyle === 'bald' ? 0 : 100,
      earringsProbability: 0, facialHairProbability: f.beard ? 100 : 0, facialHair: ['beard'],
      facialHairColor: [f.hair.replace('#', '')], eyeShadowColor: ['transparent'],
      mouth: ['smile', 'smirk'], glassesProbability: 20, glassesColor: ['2d3748'] } });
  /* i riferimenti si NORMALIZZANO passando dal DOM, cosi' il confronto e' DOM-contro-DOM */
  const norm = (h) => { const d = document.createElement('div'); d.innerHTML = h; const s = d.querySelector('svg'); return s ? s.outerHTML : h; };
  const liberoN = norm(libero), attesoN = norm(atteso);
  const comeLibero = svgs.some(s => s === liberoN), comeAtteso = svgs.some(s => s === attesoN);
  return { comeLibero, comeAtteso, n: svgs.length, lenAtteso: atteso.length, lenLibero: libero.length, uguali: atteso === libero };
});
await b.close(); srv.close();

if (R.err) { console.log('❌ FAIL — ' + R.err); process.exit(2); }
console.log(`ritratti in pagina: ${R.n} · atteso(palette maschile): ${R.lenAtteso}b · micah libero: ${R.lenLibero}b · comeAtteso=${R.comeAtteso} · comeLibero=${R.comeLibero}`);
if (R.comeLibero) { console.log('\n❌ FAIL — il ritratto del mister e\' ancora il micah a briglia sciolta (il volto femminile del collaudo)'); process.exit(2); }
if (!R.comeAtteso) { console.log('\n❌ FAIL — in pagina non c\'e\' il ritratto con la palette maschile attesa: opzioni cambiate senza aggiornare il guardiano?'); process.exit(2); }
console.log('\n✅ PASS — il mister ha la faccia del mister (palette COACH_NPC_FACES, niente acconciature/colori fantasia)');
