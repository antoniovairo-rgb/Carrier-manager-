#!/usr/bin/env node
/* CENSIMENTO — LA RIGA DI CRONACA AFFERMA UN FATTO: IL FATTO E' ACCADUTO?

   DA DOVE VIENE. Collaudo PO: «la telecronaca non e' sincronizzata, inventa eventi mai accaduti».
   CAUSA LETTA NEL CODICE: `BG_MATCH` e' una pesca pesata di 188 righe pre-scritte; ognuna porta un `bpos`
   e DOPO l'estrazione il pallone viene spostato li'. Il verso e' rovesciato — non «succede un tiro, la riga
   lo racconta», ma «esce la riga tiro, la palla si teletrasporta in zona tiro».

   COSA GIUDICA — E COSA NO. Questo NON e' ancora un guardiano: e' la BASELINE. Nessun numero di partenza
   esiste per questo difetto (`bg-decision` misura solo l'accordo di FAMIGLIA; `event-ledger` e' una
   baseline di divergenza fra le quattro versioni). Senza il numero di partenza il rimedio non e'
   ri-misurabile, ed e' il motivo per cui questa passata viene prima di toccare qualsiasi cosa.

   I FATTI VERIFICABILI, e come si verificano SENZA credere alla riga:
     PORTATORE  la riga nomina un uomo che gioca il pallone  -> al minuto della riga qualcuno ce l'ha
                davvero (distanza uomo-palla <= SOGLIA_PIEDI)
     TIRO       `shots`/`oppShots` a 1                       -> la palla si avvicina alla porta di almeno
                AVV_MIN unita' entro FINESTRA tick
     PARATA     la riga dice «para»/«parata»                 -> un portiere arriva entro SOGLIA_GK dalla
                palla entro FINESTRA tick
     POSSESSO   la riga dichiara un recupero/contropiede     -> il lato di chi ha il pallone CAMBIA
     FERMO      la riga apre una giocata piazzata (`sp`)     -> la palla si ferma (spostamento < FERMO_U)

   ⚠️ LA TRACCIA TIENE GLI ESTREMI DEL MINUTO, non primo-e-ultimo campione: una prima stesura teneva
   solo `x` finale e dava gol_in_rete 2/6 e tiro 8/11 — ma se la palla entra e torna a centrocampo DENTRO
   lo stesso minuto, quella stesura vede solo il ritorno. Lo strumento sbagliava prima del codice.

   La traccia dello stato reale si campiona da `__CPM_OWN` (SORGENTE UNICA: palla, ventidue ed eroe tutti
   dalle mesh — invariante «una misura su due sorgenti non e' una misura»). Il minuto si legge dalla stessa
   chiamata (`c`), mai dall'orologio di parete. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const PARTITE   = +(process.env.CPM_PARTITE || 2);
const SOGLIA_PIEDI = 3.0;   // unita' campo: la palla e' AI PIEDI di qualcuno
const SOGLIA_GK    = 3.5;   // il portiere la tocca
const AVV_MIN      = 8;     // avvicinamento minimo alla porta perche' sia un tiro
const FINESTRA     = 3;     // minuti di gioco entro cui il fatto deve accadere
const FERMO_U      = 1.2;   // spostamento sotto il quale la palla e' ferma

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];

for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false;
    /* traccia dello stato reale, campionata dalle MESH e indicizzata per MINUTO DI GIOCO */
    window.__CPM_TRACCIA = [];
    const _p = setInterval(() => {
      try {
        const o = window.__CPM_OWN && window.__CPM_OWN();
        if (!o || o.ph !== 'playing') return;
        const T = window.__CPM_TRACCIA;
        const u = T[T.length - 1];
        if (u && u.c === o.c) { u.n++; u.x = o.x; u.y = o.y; if (o.x > u.xmax) u.xmax = o.x; if (o.x < u.xmin) u.xmin = o.x; if (o.d < u.dmin) { u.dmin = o.d; u.imin = o.i; } return; }
        T.push({ c: o.c, x0: o.x, y0: o.y, x: o.x, y: o.y, xmax: o.x, xmin: o.x, dmin: o.d, imin: o.i, i0: o.i, n: 1 });
      } catch (_e) {}
    }, 60);
    window.__CPM_STOPTRACCIA = () => clearInterval(_p);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Ft' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    tr: window.__CPM_TRACCIA || []
  })));
  await page.close();
}
srv.close(); await b.close();

/* ---- verifica: per ogni riga, il fatto che afferma e' accaduto? ---- */
const esiti = [];
for (const { righe, tr } of tutte) {
  const byMin = new Map(); tr.forEach(s => byMin.set(s.c, s));
  const fin = (m) => { const o = []; for (let k = 0; k <= FINESTRA; k++) { const s = byMin.get(m + k); if (s) o.push(s); } return o; };
  for (const r of righe) {
    const w = fin(r.min | 0); if (!w.length) continue;            // riga fuori dalla traccia: non giudicabile
    const qui = w[0];
    const push = (fatto, ok, nota) => esiti.push({ min: r.min, fatto, ok, nota, pd: r.pd || null });

    /* PORTATORE — la palla e' ai piedi di qualcuno al minuto della riga */
    push('portatore', qui.dmin <= SOGLIA_PIEDI, `d=${qui.dmin.toFixed(1)}u`);

    /* TIRO — la palla si avvicina davvero alla porta nominata */
    if (r.shots || r.oppShots) {
      const gx = r.shots ? 100 : 0;
      const d0 = Math.abs(gx - qui.x0);
      const dmin = Math.min(...w.map(s => Math.min(Math.abs(gx - s.xmax), Math.abs(gx - s.xmin))));
      push('tiro', (d0 - dmin) >= AVV_MIN, `si avvicina di ${(d0 - dmin).toFixed(1)}u`);
    }
    /* GOL — la rete e' un tiro che finisce dentro */
    if (/goal/.test(String(r.ef || ''))) {
      const gx = /opp/.test(String(r.ef)) ? 0 : 100;
      const dmin = Math.min(...w.map(s => Math.min(Math.abs(gx - s.xmax), Math.abs(gx - s.xmin))));
      push('gol_in_rete', dmin <= 6, `palla a ${dmin.toFixed(1)}u dalla linea`);
    }
    /* PARATA — un portiere tocca la palla */
    if (r.parata) {
      const tocca = w.some(s => s.dmin <= SOGLIA_GK && (s.xmin <= 12 || s.xmax >= 88));
      push('parata', tocca, tocca ? 'il portiere la tocca' : 'nessun portiere sulla palla');
    }
    /* POSSESSO — la riga dichiara un recupero: chi ha la palla cambia lato */
    if (r.recupero) {
      const a = qui.imin, cam = w.some(s => s.dmin <= SOGLIA_PIEDI && s.imin !== a);
      push('cambio_possesso', cam, cam ? 'il portatore cambia' : 'stesso portatore');
    }
    /* FERMO — la riga apre una giocata piazzata: la palla si ferma */
    if (r.sp) {
      const fermo = w.some(s => Math.hypot(s.x - s.x0, s.y - s.y0) < FERMO_U && s.n >= 3);
      push('palla_ferma', fermo, fermo ? 'la palla si ferma' : 'la palla non si ferma mai');
    }
  }
}

if (!esiti.length) { console.log('nessuna riga giudicabile'); process.exit(1); }
console.log(`\n=== LA RIGA AFFERMA UN FATTO: E' ACCADUTO? (baseline, ${tutte.length} partite) ===\n`);
const fam = {};
esiti.forEach(e => { (fam[e.fatto] ||= { ok: 0, no: 0, es: [] }); e.ok ? fam[e.fatto].ok++ : (fam[e.fatto].no++, fam[e.fatto].es.length < 3 && fam[e.fatto].es.push(`${e.min}' ${e.nota}`)); });
let tot = 0, tok = 0;
for (const [k, v] of Object.entries(fam)) {
  const n = v.ok + v.no; tot += n; tok += v.ok;
  console.log(`  ${k.padEnd(16)} ${String(v.ok).padStart(3)}/${String(n).padEnd(3)} = ${((v.ok / n) * 100).toFixed(0).padStart(3)}%${v.es.length ? '   controesempi: ' + v.es.join(' · ') : ''}`);
}
console.log(`\n  ${'TOTALE'.padEnd(16)} ${tok}/${tot} = ${((tok / tot) * 100).toFixed(0)}%   (soglia del pezzo 6: >=90%)`);
console.log('\nBASELINE registrata. Non e\' un guardiano: non fallisce, misura.');
