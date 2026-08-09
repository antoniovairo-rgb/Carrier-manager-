#!/usr/bin/env node
/* [7.371.0] GUARDIANO DEL CELEBRATION SYSTEM — direttiva PO «esultanze dopo i gol».

   Due livelli, perche' il sistema ne ha due:
     A. PURO (in pagina ma senza scena): `goalContext` classifica il PESO del gol e
        `pickCelebration` sceglie l'esultanza. Copre i casi della lista del PO: gol normale,
        pareggio, vantaggio, decisivo, finale di partita, autorete, rigore, punizione, doppietta
        (anti-ripetizione), compagni vicini/lontani, spazio insufficiente vicino alla linea.
     B. VIVO: in una partita REALE (clock vero, nessuna situation forzata) un gol deve produrre un
        piano d'esultanza e l'eroe deve muoversi SENZA TELETRASPORTI durante la celebrazione.

   ⚠️ Il livello B non e' garantito a ogni run: dipende da quali highlight escono e da come vanno.
   Se in una passata non arriva nessun gol la sonda lo DICE e non finge di aver misurato — un
   guardiano che non osserva niente non e' verde, e' cieco (lezione gia' pagata in questo repo).
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node celebration-test.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(800);

/* ---------------------------------------------------------------- A. livello PURO */
const pure = await page.evaluate(() => {
  const gc = window.goalContext, pc = window.pickCelebration;
  if (!gc || !pc) return { missing: true };
  const out = { casi: [], err: [] };
  const T = (nome, o, atteso) => {
    const c = gc(o); out.casi.push(`${nome}: ${c.tier}/heat${c.heat}`);
    if (atteso && c.tier !== atteso) out.err.push(`${nome}: atteso ${atteso}, ottenuto ${c.tier}`);
    return c;
  };
  /* l'esempio ESPLICITO della direttiva PO: 1-1 all'88' che diventa 2-1 deve pesare molto piu'
     di 3-0 al 20' che diventa 4-0 */
  const dec = T('1-1 88\' → 2-1', { by: 'hero', minute: 88, usBefore: 1, themBefore: 1 }, 'MATCH_WINNER');
  const gol = T('3-0 20\' → 4-0', { by: 'hero', minute: 20, usBefore: 3, themBefore: 0 }, 'NORMAL');
  if (!(dec.heat > gol.heat)) out.err.push('il gol che decide la partita non pesa piu\' del gol della goleada');
  T('0-1 70\' pareggio', { by: 'hero', minute: 70, usBefore: 0, themBefore: 1 }, 'EQUALIZER');
  T('0-0 10\' vantaggio', { by: 'hero', minute: 10, usBefore: 0, themBefore: 0 }, 'LEAD');
  T('0-1 92\' pareggio', { by: 'hero', minute: 92, usBefore: 0, themBefore: 1 }, 'DECISIVE');
  T('autorete', { by: 'own', minute: 50, usBefore: 1, themBefore: 0 }, 'OWN_GOAL');
  const rig = gc({ by: 'hero', minute: 30, usBefore: 0, themBefore: 0, setPiece: 'penalty' });
  if (rig.tags.indexOf('penalty') < 0) out.err.push('il rigore non e\' marcato nel contesto');
  const pun = gc({ by: 'hero', minute: 30, usBefore: 0, themBefore: 0, setPiece: 'freekick' });
  if (pun.tags.indexOf('freekick') < 0) out.err.push('la punizione non e\' marcata nel contesto');
  const ult = gc({ by: 'hero', minute: 94, usBefore: 1, themBefore: 1 });
  if (ult.tags.indexOf('last_minute') < 0) out.err.push('il gol all\'ultimo secondo non e\' marcato');

  /* autorete → non si esulta MAI */
  const own = pc(gc({ by: 'own', minute: 50, usBefore: 1, themBefore: 0 }), { clips: { lift: true }, space: { toCrowd: 30, toMates: 5, matesNear: 3 }, seed: 1 });
  if (own.id !== 'no_celebration') out.err.push(`autorete: esulta comunque (${own.id})`);

  /* SPAZIO: attaccato alla linea di fondo nessuna corsa lunga deve essere scelta */
  for (let sd = 0; sd < 30; sd++) {
    const p = pc(dec, { clips: { lift: true }, space: { toCrowd: 1, toCorner: 1, toMates: 40, matesNear: 0 }, seed: sd });
    if (p.run > 1) out.err.push(`spazio 1u: scelta una corsa da ${p.run}u (${p.id})`);
  }
  /* COMPAGNI LONTANI: non si sceglie «corsa verso i compagni» se non c'e' nessuno vicino */
  for (let sd = 0; sd < 30; sd++) {
    const p = pc(dec, { clips: { lift: true }, space: { toCrowd: 30, toCorner: 30, toMates: 60, matesNear: 0 }, seed: sd });
    if (p.toward === 'mates') out.err.push('scelta la corsa verso compagni che non ci sono');
  }
  /* CLIP ASSENTE: se `lift` non fosse montata, niente voce che la richiede */
  for (let sd = 0; sd < 20; sd++) {
    const p = pc(dec, { clips: { lift: false }, space: { toCrowd: 30, toCorner: 30, toMates: 6, matesNear: 2 }, seed: sd });
    if (p.clip === 'lift') out.err.push('scelta una clip non montata');
  }
  /* DOPPIETTA: due gol nella stessa partita non danno la stessa esultanza */
  const rec = []; const ids = [];
  for (let k = 0; k < 2; k++) {
    const p = pc(dec, { clips: { lift: true }, space: { toCrowd: 30, toCorner: 30, toMates: 6, matesNear: 3 }, recent: rec, seed: 5 });
    ids.push(p.id); rec.push(p.id);
  }
  if (ids[0] === ids[1]) out.err.push(`doppietta: stessa esultanza due volte (${ids[0]})`);
  out.dop = ids.join(' → ');
  /* VARIETA': su semi diversi il sistema non deve collassare su una sola voce */
  const set = new Set();
  for (let sd = 0; sd < 24; sd++) set.add(pc(dec, { clips: { lift: true }, space: { toCrowd: 30, toCorner: 30, toMates: 6, matesNear: 3 }, seed: sd }).id);
  out.varieta = set.size;
  if (set.size < 2) out.err.push(`nessuna varieta': ${set.size} esultanza sola su 24 semi`);
  return out;
});

if (pure.missing) issues.push('goalContext/pickCelebration non esposti: il livello puro non e\' raggiungibile');
else {
  console.log('— livello PURO —');
  pure.casi.forEach(c => console.log('  ' + c));
  console.log(`  doppietta: ${pure.dop} · varieta' su 24 semi: ${pure.varieta} esultanze distinte`);
  pure.err.forEach(e => issues.push(e));
}

/* ---------------------------------------------------------------- B. livello VIVO
   Aspettare che un gol capiti da solo NON funziona: in una passata da tre minuti di partita reale
   ne sono usciti ZERO, e un guardiano che non osserva niente e' cieco, non verde. Qui i gol si
   PRODUCONO: si forzano le situation che premiano `goal` e si risolve con esito riuscito, che e'
   la strada vera fino a `fireGoalCeleb` (l'unica porta del sistema). */
console.log('\n— livello VIVO — gol forzati —');
const GOAL_GIS = await page.evaluate(() => {
  const out = []; const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length && out.length < 8; i++) {
    const s = S[i]; if (!s || !s.actions || !s.actions[0]) continue;
    if (s.actions[0].rew === 'goal' && !s.def) out.push(i);
  }
  return out;
});
let visti = 0, teleport = 0; const piani = [];
for (const gi of GOAL_GIS) {
  await page.evaluate(g => {
    window.__CPM_CELEB = null;
    /* campionatore a FREQUENZA DI FOTOGRAMMA dentro la pagina: il poll da node perde gli estremi
       (lezione __CPM_O2MIN, gia' pagata tre volte in questo repo) */
    window.__CELWATCH = []; window.__CELT0 = 0;
    if (!window.__CELTICK) {
      window.__CELTICK = () => {
        try {
          /* SOLO la finestra dell'esultanza. Campionare tutto il periodo includeva il
             riposizionamento d'avvio della scena forzata — un salto legittimo da 16-40u che non
             ha niente a che vedere con la celebrazione e che avrebbe fatto condannare il sistema
             per un difetto di un altro. La finestra si apre quando il gol e' CONFERMATO. */
          const c = window.__CPM_CELEB;
          if (c && !window.__CELT0) window.__CELT0 = performance.now();
          if (window.__CELT0 && window.__CELWATCH) {
            const el = performance.now() - window.__CELT0;
            if (el <= ((c && c.dur ? c.dur : 3) * 1000 + 400)) {
              const st = window.__CPM_STATE && window.__CPM_STATE();
              if (st && st.hero) window.__CELWATCH.push({ t: performance.now(), x: st.hero.x, y: st.hero.y });
            }
          }
        } catch (e) {}
        requestAnimationFrame(window.__CELTICK);
      };
      requestAnimationFrame(window.__CELTICK);
    }
    window.__CPM_FORCE_SIT(g, true);
  }, gi);
  await sleep(600);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  await sleep(6200);   // l'arco + la conferma in rete + tutta l'esultanza
  const r = await page.evaluate(() => ({ c: window.__CPM_CELEB || null, w: (window.__CELWATCH || []).slice() }));
  if (!r.c) continue;
  visti++;
  piani.push(`gi${gi}: ${r.c.ctx.tier}/heat${r.c.ctx.heat} → ${r.c.pick} (${r.c.dur}s)`);
  /* NESSUN TELETRASPORTO durante la celebrazione (direttiva §9/§11): l'eroe si muove con animOne,
     quindi non deve mai coprire piu' di quanto un uomo copra in un fotogramma. */
  let maxStep = 0;
  for (let i = 1; i < r.w.length; i++) {
    const dt = (r.w[i].t - r.w[i - 1].t) / 1000; if (dt <= 0 || dt > 0.3) continue;
    const d = Math.hypot(r.w[i].x - r.w[i - 1].x, r.w[i].y - r.w[i - 1].y);
    if (d / dt > 60 && d > maxStep) maxStep = d;   // >60 u/s di gioco = non e' una corsa
  }
  if (maxStep > 0) { teleport++; issues.push(`gi${gi}: l'eroe fa un salto di ${maxStep.toFixed(1)}u durante l'esultanza (teletrasporto)`); }
}
console.log(`  gol prodotti: ${visti}/${GOAL_GIS.length} · con teletrasporto: ${teleport}`);
piani.forEach(p => console.log('    ' + p));
if (visti < 3) issues.push(`solo ${visti} gol osservati: il livello vivo non e' stato misurato davvero`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ CELEBRATION SYSTEM OK' + (visti ? '' : ' (livello puro; nessun gol capitato per il livello vivo)'));
