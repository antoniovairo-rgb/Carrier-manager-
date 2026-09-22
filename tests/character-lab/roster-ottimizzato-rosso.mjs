/* [23/09] IL ROSSO DI PARTENZA DEL ROSTER OTTIMIZZATO.
   La consegna dichiara «corpi pieni e 1-2 FPS» con `cgtrader-highlight-optimized`. Quel numero non e' mio:
   prima di ricostruire qualcosa bisogna misurarlo qui, altrimenti il rimedio non e' promuovibile.
   Questa sonda apre la situazione 33 («Muro in area») con la review ottimizzata e legge, senza toccare
   il gioco: quanti corpi sono in scena e con quale LOD, se i testimoni del roster cinematografico e del
   budget renderer rispondono, e quanti fotogrammi al secondo produce la pagina.
   Con CPM_BASE=1 la stessa misura viene ripetuta SENZA il parametro, per avere il confronto appaiato:
   serve a dimostrare che il rimedio non cambia la partita normale. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const MODO = process.env.CPM_BASE === '1' ? null : 'cgtrader-highlight-optimized';
const SIT = Number(process.env.CPM_SIT || 33);

const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errori = [];
page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));

console.log('=== ROSTER OTTIMIZZATO · ROSSO DI PARTENZA ===');
console.log(`  modo: ${MODO || 'NESSUN parametro (partita normale)'} · situazione ${SIT}\n`);

try {
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, {
    skipLoadAll: true,
    name: 'Rosso Roster',
    query: MODO ? { hyperCharacter: MODO, cpmForce: 'keeper' } : { cpmForce: 'keeper' },
  });
  const pronto = await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup' || window.__CPM_HYPER_CASUAL_STATUS === 'off', null, { timeout: 180000 })
    .then(() => true).catch(() => false);
  console.log(`  stato del pacchetto: ${await page.evaluate(() => window.__CPM_HYPER_CASUAL_STATUS ?? '(assente)')}${pronto ? '' : '  ← NON pronto entro 180 s'}`);

  await page.evaluate(i => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(i, true), SIT);
  await sleep(1200);

  const foto = await page.evaluate(() => {
    const lod = (() => { try { return window.__CPM_CGTRADER_LOD_AUDIT ? window.__CPM_CGTRADER_LOD_AUDIT() : null; } catch (e) { return 'errore:' + e.message; } })();
    return {
      lod,
      roster: typeof window.__CPM_CGTRADER_CINEMA_ROSTER,
      budget: typeof window.__CPM_CGTRADER_RENDER_BUDGET,
      ottimizzato: window.__CPM_CGTRADER_HIGHLIGHT_OPTIMIZED ?? null,
      /* [23/09 — IL METRO CORRETTO, e la correzione vale piu' del numero]
         Prima misura appaiata: con la review ottimizzata 1,9 FPS, SENZA alcun parametro (niente CGTrader
         in scena) 1,2 FPS. La partita normale rende PEGGIO. Quindi gli «1-2 FPS» non misurano il roster:
         misurano il BANCO — Chromium headless su GPU software rende 1-2 FPS qualunque cosa ci sia.
         Inseguire quel numero sarebbe lavorare su un metro cieco. I TRIANGOLI RENDERIZZATI e le CHIAMATE
         DI DISEGNO invece non dipendono dalla GPU: sono il costo vero della scena, e sono il metro con cui
         si promuove o si revoca il roster ottimizzato. Gli FPS restano, ma solo come contesto, e il loro
         gate e' e resta il TELEFONO. */
      triangoli: (() => { try { return window.__CPM_TRI907 ? window.__CPM_TRI907() : null; } catch (e) { return null; } })(),
      disegni: (() => { try { const r = window.__CPM_RENDER_INFO?.(); return r ? r.calls : null; } catch (e) { return null; } })(),
      /* [23/09] diagnosi del trio LOD: se l'audit non risponde bisogna sapere SE i pacchetti sono
         arrivati e SE gli avatar hanno le varianti, altrimenti si tira a indovinare. */
      auditDefinito: typeof window.__CPM_CGTRADER_LOD_AUDIT,
      avatarConVarianti: (() => { try { const l = window.__CPM_CGTRADER_LOD_MIX?.(); return l ?? null; } catch (e) { return null; } })(),
      animazioni: (window.__CPM_HYPER_ANIMATIONS || []).length,
      assistenti: window.__CPM_HYPER_ASSISTANTS ?? null,
      fase: window.__CPM_PHASE?.() ?? null,
      situazione: (window.__CPM_CURSIT?.() || {}).text ?? null,
    };
  });

  /* i fotogrammi: si contano sul posto, per tre secondi */
  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    const giro = () => { n++; (performance.now() - t0 < 3000) ? requestAnimationFrame(giro) : res(+(n / ((performance.now() - t0) / 1000)).toFixed(1)); };
    requestAnimationFrame(giro);
  }));

  console.log(`  situazione aperta : ${foto.situazione ?? '(nessuna)'}  · fase ${foto.fase}`);
  console.log(`  flag ottimizzato  : ${foto.ottimizzato}`);
  console.log(`  corpi per LOD     : ${JSON.stringify(foto.lod)}`);
  console.log(`  LOD_AUDIT definito: ${foto.auditDefinito}   · clip caricate: ${foto.animazioni} · assistenti: ${JSON.stringify(foto.assistenti)}`);
  console.log(`  __CPM_CGTRADER_CINEMA_ROSTER  : ${foto.roster}${foto.roster === 'undefined' ? '   ← ASSENTE' : ''}`);
  console.log(`  __CPM_CGTRADER_RENDER_BUDGET  : ${foto.budget}${foto.budget === 'undefined' ? '   ← ASSENTE' : ''}`);
  console.log(`  TRIANGOLI RENDERIZZATI        : ${foto.triangoli}   ← il metro vero: non dipende dalla GPU`);
  console.log(`  chiamate di disegno           : ${foto.disegni ?? '(nessun testimone)'}`);
  console.log(`  fotogrammi al secondo (3 s)   : ${fps}   ← contesto, NON un gate: il banco e' a GPU software`);
  if (errori.length) console.log(`  errori di pagina: ${errori.slice(0, 3).join(' · ')}`);

  const f = path.join(here, MODO ? 'roster-rosso.json' : 'roster-base.json');
  fs.writeFileSync(f, JSON.stringify({ modo: MODO, sit: SIT, ...foto, fps, errori }, null, 1));
  console.log(`\n→ ${f}`);
} finally {
  await page.close().catch(() => {});
  await browser.close().catch(() => {});
  server.close();
}
