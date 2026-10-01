/* [22/09 · caccia al determinismo rotto della cronaca — TERZA SONDA]
   CHE COSA DIVERGE PER PRIMO: LE POSIZIONI, IL CONTEGGIO DEI SORTEGGI, O LA CRONACA.

   `match-sequence` dice CHE due giri identici divergono e da dove (26-29% di prefisso comune).
   `rndm-conteggio` dice se il numero di estrazioni di `_rndM` cambia. Manca il terzo termine, che e'
   quello che ha gia' mandato in bianco due rimedi: le POSIZIONI dei ventidue, da cui nasce il pool dei
   nomi. Questa sonda gioca DUE giri identici a 1x e stampa, per ciascuno dei tre testimoni, il PRIMO
   minuto che diverge. L'ordine dei tre minuti e' la diagnosi:
     - posizioni PRIMA della cronaca  → il rumore e' nello schieramento, e il resto e' conseguenza;
     - conteggio PRIMA delle posizioni → e' un ramo condizionale a spostare le estrazioni;
     - cronaca senza gli altri due     → il rumore e' dentro la riga, non a monte.
   Non giudica: misura.  Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node prima-divergenza.mjs         */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const TETTO_MS = +(process.env.CPM_TETTO || 200000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

const VB = +(process.env.CPM_VB || 1);/* [22/09] il secondo giro puo' girare a un'altra VELOCITA': serve per l'ultima meta' di A14, l'invarianza fra 1x e 2x */
async function giro(sp) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript((v) => {
    window.__CPM_GLB = false; window.__CPM_TXT487 = null;
    window.__CPM_RNDM959 = {}; window.__CPM_POS959 = {}; window.__CPM_PRESS959 = {}; window.__CPM_WHO959 = {}; window.__CPM_PASSI959 = {}; window.__CPM_RND14 = {};
    try { localStorage.setItem('cpm-match-speed', String(v)); } catch (e) {}
  }, sp);
  try {
    await openMatch(page, port, { skipLoadAll: true });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 12345, policy: 'seeded', tickMs: 350 }));
    const t0 = Date.now();
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } });
      if (ph === 'ended' || ph === 'ceremony') break;
    }
    return await page.evaluate(() => ({
      txt: (window.__CPM_TXT487 || []).map(x => `${x.m}|${(x.txt || '').slice(0, 30)}`),
      rnd: JSON.parse(JSON.stringify(window.__CPM_RNDM959 || {})),
      pos: JSON.parse(JSON.stringify(window.__CPM_POS959 || {})),
      press: JSON.parse(JSON.stringify(window.__CPM_PRESS959 || {})),
      who: JSON.parse(JSON.stringify(window.__CPM_WHO959 || {})),
      passi: JSON.parse(JSON.stringify(window.__CPM_PASSI959 || {})),
      r14: JSON.parse(JSON.stringify(window.__CPM_RND14 || {})),
      scene: (()=>{try{const e=(typeof window.__CPM_EV==='function')?window.__CPM_EV():(window.__CPM_EV||[]);
        return (e||[]).filter(x=>x&&(x.ev==='scena')).length;}catch(_e){return -1;}})(),
    }));
  } catch (e) { return { txt: [], rnd: {}, pos: {}, press: {}, who: {}, passi: {}, r14: {}, scene: -1 }; }
  finally { await page.close().catch(() => {}); }
}

const A = await giro(1), B = await giro(VB);
await b.close(); srv.close();

const primoMin = (a, b2) => {
  const ks = [...new Set([...Object.keys(a), ...Object.keys(b2)])].map(Number).sort((x, y) => x - y);
  for (const k of ks) if ((a[k] ?? null) !== (b2[k] ?? null)) return k;
  return null;
};
const primoTxt = () => {
  const n = Math.min(A.txt.length, B.txt.length);
  for (let i = 0; i < n; i++) if (A.txt[i] !== B.txt[i]) return { i, m: +String(A.txt[i]).split('|')[0], a: A.txt[i], b: B.txt[i] };
  return null;
};

console.log(`\n=== CHE COSA DIVERGE PER PRIMO (giro A a 1x · giro B a ${VB}x) ===`);
const mPos = primoMin(A.pos, B.pos), mRnd = primoMin(A.rnd, B.rnd), t = primoTxt();
console.log(`  minuti con testimone   posizioni ${Object.keys(A.pos).length}/${Object.keys(B.pos).length} · sorteggi ${Object.keys(A.rnd).length}/${Object.keys(B.rnd).length} · righe ${A.txt.length}/${B.txt.length}`);
console.log(`  posizioni  primo minuto che diverge: ${mPos === null ? 'NESSUNO — identiche' : mPos + "'"}`);
const m14 = primoMin(A.r14 || {}, B.r14 || {});
console.log(`  motore     primo minuto in cui il conteggio dei suoi sorteggi diverge: ${m14 === null ? 'NESSUNO — stessi sorteggi' : m14 + "'"}`);
if (m14 !== null) { const ks=[...new Set([...Object.keys(A.r14),...Object.keys(B.r14)])].map(Number).sort((x,y)=>x-y).filter(k=>k>=m14-2&&k<=m14+2); console.log('  sorteggi motore per minuto: ' + ks.map(k=>`${k}'=${A.r14[k]??0}/${B.r14[k]??0}`).join(' · ')); }
/* [22/09 · A14 passo 2] QUANTO TEMPO DI GIOCO SI MANGIANO LE SCENE, e quanto varia da un giro all'altro.
   Un minuto «pieno» riceve 22 passi di fisica: i passi che mancano, divisi per 22, sono i MINUTI di
   partita passati con la fisica ferma. Se questo numero balla fra due giri identici, il costo di una
   scena lo decide l'orologio da polso — ed e' esattamente cio' che rompe il determinismo. */
const costo = (g) => { const k=Object.keys(g.passi||{}).map(Number).filter(m=>m>0&&m<90);
  let manc=0,vuoti=0; for(const m of k){const p=g.passi[m]||0;if(p<22){manc+=(22-p);if(p<=2)vuoti++;}}
  return { min:k.length, manc, minuti:+(manc/22).toFixed(1), vuoti, scene:g.scene }; };
const cA=costo(A), cB=costo(B);
console.log(`  costo delle scene  A: ${cA.minuti}' di gioco con la fisica ferma (${cA.vuoti} minuti vuoti, ${cA.scene} scene) · B: ${cB.minuti}' (${cB.vuoti} vuoti, ${cB.scene} scene)`);
if(cA.scene>0&&cB.scene>0)console.log(`                     costo medio per scena  A ${(cA.minuti/cA.scene).toFixed(2)}'  ·  B ${(cB.minuti/cB.scene).toFixed(2)}'`);
const mPa = primoMin(A.passi || {}, B.passi || {});
console.log(`  passi fisica primo minuto che diverge: ${mPa === null ? 'NESSUNO — stessi passi' : mPa + "'"} (passi totali ${Object.values(A.passi||{}).reduce((x,y)=>x+y,0)} vs ${Object.values(B.passi||{}).reduce((x,y)=>x+y,0)})`);
if (mPa !== null) { const ks=[...new Set([...Object.keys(A.passi),...Object.keys(B.passi)])].map(Number).sort((x,y)=>x-y).filter(k=>k>=mPa-2&&k<=mPa+3); console.log('  passi per minuto: ' + ks.map(k=>`${k}'=${A.passi[k]??0}/${B.passi[k]??0}`).join(' · ')); }
const mPr = primoMin(A.press || {}, B.press || {});
console.log(`  pressing   primo minuto che diverge: ${mPr === null ? 'NESSUNO — stesse scritture' : mPr + "'"} (scritture totali ${Object.values(A.press||{}).reduce((x,y)=>x+y,0)} vs ${Object.values(B.press||{}).reduce((x,y)=>x+y,0)})`);
console.log(`  sorteggi   primo minuto che diverge: ${mRnd === null ? 'NESSUNO — stesso numero' : mRnd + "'"}`);
console.log(`  cronaca    prima riga che diverge:   ${t === null ? 'NESSUNA — identica' : `posizione ${t.i}, minuto ${t.m}'`}`);
if (t) { console.log(`             A: ${t.a}`); console.log(`             B: ${t.b}`); }
if (mPos !== null) {
  console.log('\n  intorno delle posizioni (minuto: A vs B):');
  const ks = [...new Set([...Object.keys(A.pos), ...Object.keys(B.pos)])].map(Number).sort((x, y) => x - y).filter(k => k >= mPos - 2 && k <= mPos + 3);
  for (const k of ks) console.log(`    ${String(k).padStart(3)}'  ${String(A.pos[k] ?? '-').padStart(11)} vs ${String(B.pos[k] ?? '-').padStart(11)}  ${(A.pos[k] ?? null) !== (B.pos[k] ?? null) ? '≠' : ''}`);
}
if (mPos !== null) {
  const wa = (A.who || {}), wb = (B.who || {});
  console.log('\n  scrittori delle posizioni attorno al minuto che diverge (impronta:uomini mossi):');
  for (let k = mPos - 1; k <= mPos + 1; k++) {
    console.log(`    ${String(k).padStart(3)}' A  ${(wa[k] || []).join(' ')}`);
    console.log(`    ${String(k).padStart(3)}' B  ${(wb[k] || []).join(' ')}`);
  }
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (!Object.keys(A.pos).length || !Object.keys(A.rnd).length) { console.log('\n❌ SONDA CIECA: un testimone non si e\' acceso'); process.exit(2); }
