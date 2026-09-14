/* [SONDA] SALTI DEI 22 ALL'APERTURA/CHIUSURA DI SCENA.
   Durante la partita i 22 giocatori hanno una posizione LOGICA (scritta dal motore del possesso,
   __CPM_PLPOS(i).lx/ly) e una posizione RESA (mesh 3D che insegue la logica, .mx/.my). Quando si
   apre una scena (highlight dell'eroe: playing -> hl_intro/hl_move/hl_choose/hl_result) e quando si
   chiude (torna a playing) alcuni giocatori vengono TELETRASPORTATI: la loro posizione cambia di
   decine di unita' di campo in una manciata di fotogrammi, invece di percorrerle camminando/correndo.
   Questa sonda NON deduce la causa (non e' un guardiano, non fallisce sul merito): mette un metro
   RIPETIBILE che conta, per ogni transizione di fase, quanti giocatori saltano piu' di 8 unita' e
   quanto vale il salto massimo — separatamente sul dato LOGICO e sul dato RESO, cosi' si puo'
   confrontare un braccio "verde" (comportamento attuale) contro un braccio "rosso" (comportamento
   precedente alla 7.890, via CPM_ROSSO=__CPM_NO890) con lo stesso identico righello.
   Metodo: campiona ogni 100 ms con UNA sola page.evaluate (fase + minuto + posizioni dei 21 giocatori,
   l'eroe e' escluso perche' non e' fra questi indici). Rileva le transizioni playing->hl_* (apertura)
   e hl_*->playing (chiusura) confrontando due campioni consecutivi. Per ogni transizione, per ogni
   giocatore con dati validi PRIMA e in almeno un campione ENTRO 1,5s DOPO, calcola il salto come il
   massimo spostamento assoluto (|dx|,|dy| preso come massimo delle due componenti, non la norma —
   cosi' un salto lungo un solo asse non si annacqua nella media) fra il campione-prima e ciascun
   campione-dopo nella finestra. Conta chi supera 8 unita' e registra il massimo, sia sul logico sia
   sul reso. Uscita: SEMPRE 0 (e' un censimento), tranne se non e' stato registrato NESSUN campione
   valido (pagina mai pronta, hook assenti): in quel caso NON GIUDICABILE ed esce 1. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const DUR_S = Number(process.env.CPM_DUR_S || 150);
const SOGLIA = 8;
const FINESTRA_MS = 1500;
const PASSO_MS = 100;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = process.env.CPM_ROSSO || '';
await page.addInitScript((o) => { window.__CPM_GLB = false; if (o.rosso) window[o.rosso] = true; }, { rosso: ROSSO });
await openMatch(page, port, { skipLoadAll: true, name: 'Ch' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));

console.log(`\n=== SALTI DI SCENA (soglia ${SOGLIA}u, finestra ${FINESTRA_MS}ms, durata ${DUR_S}s${ROSSO ? `, ROSSO=${ROSSO}` : ''}) ===\n`);

const campioni = [];
const t0 = Date.now();
while (Date.now() - t0 < DUR_S * 1000) {
  let c = null;
  try {
    c = await page.evaluate(() => {
      try {
        const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null;
        const ms = window.__CPM_MS ? window.__CPM_MS() : null;
        const min = ms ? ms.min : null;
        if (ph == null) return null;
        const pos = [];
        for (let i = 0; i < 21; i++) {
          try {
            const p = window.__CPM_PLPOS ? window.__CPM_PLPOS(i) : null;
            pos.push(p ? [p.lx, p.ly, p.mx, p.my] : null);
          } catch (_e) { pos.push(null); }
        }
        return { t: Date.now(), ph, min, pos };
      } catch (_e) { return null; }
    });
  } catch (_e) { c = null; }
  if (c) campioni.push(c);
  await page.waitForTimeout(PASSO_MS);
}
await b.close(); srv.close();

if (!campioni.length) {
  console.log('NON GIUDICABILE: nessun campione valido registrato.\n');
  process.exit(1);
}

/* rilevamento transizioni: guardando coppie di campioni CONSECUTIVI (nell'array, non nel tempo reale
   — sono la stessa cosa qui perche' il campionamento e' un ciclo stretto senza salti) */
const transizioni = [];
for (let i = 1; i < campioni.length; i++) {
  const prev = campioni[i - 1], cur = campioni[i];
  const prevHL = prev.ph && prev.ph.startsWith('hl_');
  const curHL = cur.ph && cur.ph.startsWith('hl_');
  if (!prevHL && curHL) transizioni.push({ tipo: 'apertura', idx: i, min: cur.min });
  else if (prevHL && !curHL) transizioni.push({ tipo: 'chiusura', idx: i, min: cur.min });
}

const risultati = [];
for (const tr of transizioni) {
  const prima = campioni[tr.idx - 1];
  const dopo = campioni.filter(c => c.t > prima.t && c.t <= prima.t + FINESTRA_MS && c.t >= campioni[tr.idx].t);
  if (!dopo.length) continue;
  let nLog = 0, nRes = 0, maxLog = 0, maxRes = 0;
  /* [v2] IL SALTO E' FRA DUE CAMPIONI CONSECUTIVI (≤ 250 ms), non fra il «prima» e tutta la finestra:
     con l'autoplay a tickMs 300 il motore fa cinque minuti in un secondo e mezzo e i corpi si spostano
     legittimamente di 30-60u nella finestra — la v1 li contava come salti (verde 53 / rosso 55, uguali).
     Un teletrasporto e' un altro oggetto: > 8u in un solo passo di campionamento (≥ 32 u/s). Per il dato
     LOGICO la soglia e' 12u: un tick del motore sposta al massimo 8-10u, sopra i 12 e' una riscrittura. */
  const SOGLIA_LOG = 12, DT_MAX = 250;
  const serie = [prima, ...dopo];
  for (let i = 0; i < 21; i++) {
    let sLog = 0, sRes = 0;
    for (let k = 1; k < serie.length; k++) {
      const a = serie[k - 1], d = serie[k];
      if (d.t - a.t > DT_MAX) continue;
      const p0 = a.pos[i], p1 = d.pos[i];
      if (!p0 || !p1) continue;
      if (p1[0] != null && p1[1] != null && p0[0] != null && p0[1] != null) {
        sLog = Math.max(sLog, Math.abs(p1[0] - p0[0]), Math.abs(p1[1] - p0[1]));
      }
      if (p1[2] != null && p1[3] != null && p0[2] != null && p0[3] != null) {
        sRes = Math.max(sRes, Math.abs(p1[2] - p0[2]), Math.abs(p1[3] - p0[3]));
      }
    }
    if (sLog > SOGLIA_LOG) nLog++;
    if (sRes > SOGLIA) nRes++;
    maxLog = Math.max(maxLog, sLog);
    maxRes = Math.max(maxRes, sRes);
  }
  risultati.push({ min: tr.min, tipo: tr.tipo, nLog, maxLog, nRes, maxRes });
}

console.log('  minuto  tipo        gioc>8u(log)  max(log)  gioc>8u(res)  max(res)');
for (const r of risultati) {
  console.log(`  ${String(r.min).padStart(5)}'  ${r.tipo.padEnd(10)}  ${String(r.nLog).padStart(11)}  ${r.maxLog.toFixed(1).padStart(8)}  ${String(r.nRes).padStart(12)}  ${r.maxRes.toFixed(1).padStart(8)}`);
}

const aperture = risultati.filter(r => r.tipo === 'apertura').length;
const chiusure = risultati.filter(r => r.tipo === 'chiusura').length;
const giocSaltoLogico = risultati.reduce((a, r) => a + r.nLog, 0);
const giocSaltoReso = risultati.reduce((a, r) => a + r.nRes, 0);
const maxLogico = risultati.reduce((a, r) => Math.max(a, r.maxLog), 0);
const maxReso = risultati.reduce((a, r) => Math.max(a, r.maxRes), 0);

console.log(`\nSALTI: ${JSON.stringify({ scene: risultati.length, aperture, chiusure, giocSaltoLogico, maxLogico: +maxLogico.toFixed(1), giocSaltoReso, maxReso: +maxReso.toFixed(1), campioni: campioni.length })}\n`);
process.exit(0);
