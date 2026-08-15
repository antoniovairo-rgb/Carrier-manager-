#!/usr/bin/env node
/* PROVINI DELLA PREMIAZIONE — «l'eroe saltella come se si stesse riscaldando, il mister vola, entrano
   nel palco, la coppa e' troppo grande».

   PERCHE' UNA SONDA DEDICATA. La cerimonia vive in fondo a una finale vinta: per guardarla servirebbe
   giocare una stagione. Il gioco ha gia' due agganci di prova — `__CPM_FORCE_CEREMONY({name,kind})`
   che la fa partire e `__CPM_CERT_SET` che PORTA IL TEMPO DI CERIMONIA a un valore preciso — quindi i
   beat si possono fotografare a comando invece che aspettarli.

   ⚠️ GLB-ON OBBLIGATORIO (direttiva PO 2026-07-29): le pose procedurali sono INVISIBILI sotto il CH38,
   e queste quattro note parlano tutte di come si muovono degli ATTORI. Una verifica GLB-OFF qui
   guarderebbe un altro gioco.

   OLTRE ALLE IMMAGINI stampa i NUMERI che le note chiedono: quanto e' alto il trofeo rispetto
   all'eroe (la nota «troppo grande» e' un rapporto, non un'impressione), quanto dista il mister dal
   suo bersaglio e se sta attraversando il podio, e se l'eroe sta suonando una clip di locomozione
   mentre dovrebbe essere fermo a farsi premiare.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node ceremony-shot.mjs [--kind=euro|int|league]        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const OUT = 'out/ceremony';
fs.mkdirSync(OUT, { recursive: true });
const KIND = (process.argv.find(a => a.startsWith('--kind=')) || '--kind=euro').split('=')[1];
const TS = (process.env.CPM_CT || '0.5,3,7,11,15,19').split(',').map(Number);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_CINE = 1; });
await openMatch(page, port);
await sleep(2500);   /* i GLB devono caricare: sotto CH38 la scena e' vuota finche' non arrivano */

const ok = await page.evaluate(k => window.__CPM_FORCE_CEREMONY({ name: 'KORWARD EUROPA CUP', kind: k }), KIND);
if (!ok) { console.log('❌ la cerimonia non e\' partita'); await b.close(); srv.close(); process.exit(2); }
await sleep(1800);
const beats = await page.evaluate(() => window.__CPM_CER425 || null);
console.log('beat della cerimonia:', JSON.stringify(beats));

/* ⚠️ NON si lascia «scorrere» la cerimonia aspettando ventiquattro secondi VERI: il clock di scena e'
   tappato e in headless avanza a una frazione del reale — misurato, ventiquattro secondi di attesa
   producevano campioni del SOLO primo beat. Si porta il tempo di cerimonia su ciascun beat con
   `__CPM_CERT_SET`, che e' l'aggancio fatto apposta, e si campiona li'. */
const CUM = []; { let acc = 0; for (const d of (beats && beats.beatsD) || []) { CUM.push(acc + d * 0.5); acc += d; } }
await page.evaluate(() => { window.__CPM_CER476 = []; });
/* ⚠️ LA CLIP DELL'EROE NON STA SULLA MESH `hero`: quella e' la figura procedurale, che sotto CH38 e'
   nascosta ma continua a guidare posizione e logica. La clip la suona l'ATTORE, e il gioco la espone
   gia' in `__CPM_GST`. E' la trappola delle DUE SORGENTI, la stessa del 7.322 e del 7.370: si legge
   dove la cosa accade, non dove sarebbe comodo. */
const CLIP = [];
for (const ct of CUM) { await page.evaluate(v => { window.__CPM_CERT_SET = v; }, ct); await sleep(900);
  CLIP.push(await page.evaluate(() => { const g = window.__CPM_GST; return g ? { cur: g.cur, want: g.want, w: g.w } : null; })); }
console.log('clip dell\'ATTORE eroe per beat: ' + CLIP.map((c, i) => `${(beats.beats[i] || '?')}=${c ? c.cur + '(w' + c.w + ')' : '—'}`).join(' · '));
const W = await page.evaluate(() => (window.__CPM_CER476 || []).slice());
const glb = await page.evaluate(() => ({ flag: !!window.__CPM_GLB, gst: window.__CPM_GST || null }));
console.log(`CH38 attivo: ${glb.flag} · stato gesto eroe: ${JSON.stringify(glb.gst)}`);
if (W.length) {
  const perBeat = {};
  for (const r of W) { const k = r.beat || '?'; (perBeat[k] = perBeat[k] || []).push(r); }
  console.log(`\n=== ${W.length} campioni di cerimonia ===`);
  console.log('beat      | clip eroe        | mister v (u/s)      | trofeo/eroe | dist. podio (eroe/mister)');
  for (const k of Object.keys(perBeat)) {
    const A = perBeat[k];
    const clips = [...new Set(A.map(r => r.hero.clip).filter(Boolean))].join(',') || '—';
    const vs = A.map(r => (r.coach ? r.coach.v : 0));
    const rap = A.map(r => r.trofeo.rap).filter(v => v != null);
    const dH = A.map(r => r.podio && r.podio.dHero).filter(v => v != null);
    const dC = A.map(r => r.podio && r.podio.dCoach).filter(v => v != null);
    console.log(`${k.padEnd(9)} | ${clips.padEnd(16)} | med ${med(vs).toFixed(1)} max ${Math.max(...vs).toFixed(1)}`.padEnd(70)
      + `| ${rap.length ? med(rap).toFixed(2) : '—'}`.padEnd(14) + `| ${dH.length ? Math.min(...dH).toFixed(1) : '—'} / ${dC.length ? Math.min(...dC).toFixed(1) : '—'}`);
  }
  /* il PODIO ha corpo di raggio 1,7 (e gradino 2,5): chi sta piu' vicino di cosi' col piede a terra
     non e' «sul palco», e' DENTRO al palco — che e' la nota «entrano nel palco». */
  const dentro = W.filter(r => r.podio && r.podio.dHero < 1.7 && r.hero.y < 1.0);
  const dentroC = W.filter(r => r.podio && r.podio.dCoach != null && r.podio.dCoach < 1.7);
  console.log(`\nEROE dentro il corpo del podio (dist<1,7 e piede sotto la quota 1,0): ${dentro.length}/${W.filter(r => r.podio).length} campioni` +
    (dentro.length ? ` — piu' dentro: dist ${Math.min(...dentro.map(r => r.podio.dHero)).toFixed(2)} a quota y=${dentro[0].hero.y}` : ''));
  console.log(`MISTER dentro il corpo del podio: ${dentroC.length}/${W.filter(r => r.podio).length}`);
  console.log('quota (y) dell\'eroe per beat: ' + W.map(r => `${r.beat}=${r.hero.y}`).join(' · '));
  const clipTutte = [...new Set(W.map(r => r.hero.clip).filter(Boolean))];
  console.log(`\nclip suonate dall'eroe durante TUTTA la premiazione: ${clipTutte.join(', ') || 'nessuna'}`);
  const vmax = Math.max(...W.map(r => (r.coach ? r.coach.v : 0)));
  console.log(`velocita' massima del mister: ${vmax.toFixed(1)} u/s   (un uomo cammina a ~3, corre a ~7)`);
  const rapMax = Math.max(...W.map(r => r.trofeo.rap || 0));
  console.log(`trofeo piu' alto rispetto all'eroe: ${rapMax.toFixed(2)}x   (una coppa vera sta intorno a 0,35-0,45x un uomo)`);
}
function med(a) { const x = a.slice().sort((m, n) => m - n); return x.length ? x[x.length >> 1] : 0; }

const righe = [];
for (const t of TS) {
  await page.evaluate(v => { window.__CPM_CERT_SET = v; }, t);
  await sleep(700);
  const m = await page.evaluate(() => {
    const o = { t: null };
    try {
      const S = window.__CPM_SCENE3D || null;      /* se esposto */
      o.gesto = window.__CPM_GST ? window.__CPM_GST() : null;
    } catch (e) {}
    return o;
  });
  const f = `${OUT}/cer-${KIND}-t${String(t).replace('.', 'p')}.png`;
  await page.screenshot({ path: f });
  righe.push({ t, f, ...m });
  console.log(`  t=${t}s → ${f}${m.gesto ? ' · gesto eroe: ' + JSON.stringify(m.gesto) : ''}`);
}
for (const e of errs.slice(0, 4)) console.log('⚠ pageerror: ' + e);
await b.close(); srv.close();
console.log(`\n${righe.length} provini in ${OUT}/ (kind «${KIND}»).`);
