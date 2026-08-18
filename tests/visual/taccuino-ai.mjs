#!/usr/bin/env node
/* TACCUINO AI — il taccuino scritto in automatico da un modello visivo locale (Ollama) o remoto.
   Domanda del PO: «il taccuino può essere scritto automaticamente da ollama?» — SI', come SETACCIO:
   gioca N scene, cattura una strip per ciascuna, la mostra al modello con la LEGENDA DEI CODICI del
   PO e chiede una nota nel formato esatto del taccuino. Il file out/taccuino-ai.md e' pronto da
   incollare in sessione.

   ⚠️ COSA PUO' E COSA NO (dichiarato): vede le classi COMPOSIZIONALI (001 palla lontana · 002 eroe
   fuori posizione · 000/004 corpo scoordinato o di spalle · 006 reparto fermo). E' CIECO ai fenomeni
   temporali da 60fps (007 traballa/sguardo, 011 freeze): per quelli lo strumento resta la bozza
   automatica sul dispositivo (anello del testimone, 7.524/7.526). E' un PRE-FILTRO: il giudice resta
   il PO — regola incisa.

   USO (sulla macchina del PO, con Ollama attivo su localhost:11434 e un modello visivo tirato giu',
   es. `ollama pull llama3.2-vision` o qwen2.5vl):
     cd tests/visual && npm run taccuino-ai                     # default: 8 scene campione
     CPM_TAC_GI=47,163,114 npm run taccuino-ai                  # scene scelte
     VISION_PROVIDER=ollama OLLAMA_MODEL=qwen2.5vl:7b ...       # provider/modello via .env o env
   Riusa il framework provider di ai-vision-review: nessuna logica di rete duplicata. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, waitBallSettle, canvasShot, sleep, __dirname as HARNESS_DIR } from './lib/harness.mjs';
import { getConfig, loadEnv } from './lib/vision/config.mjs';
import { createProvider } from './lib/vision/registry.mjs';
import './lib/vision/providers/index.mjs';
import { createLogger } from './lib/vision/logger.mjs';

const GI = (process.env.CPM_TAC_GI || '47,163,114,152,75,44,12,86').split(',').map(s => +s.trim()).filter(n => !isNaN(n));
const OUTDIR = path.join(HARNESS_DIR, '..', 'out');
const OUTFILE = path.join(OUTDIR, 'taccuino-ai.md');

const LEGENDA = `Sei il collaudatore di un gioco di calcio 3D. Guarda i fotogrammi della scena (in ordine
temporale) e scrivi UNA nota di taccuino nel formato ESATTO qui sotto, oppure la sola parola OK se la
scena e' sana. Codici della legenda (usa SOLO questi):
000 gesto scoordinato (corpo incoerente col gesto, es. tira di spalle rispetto alla porta)
001 apertura scena: il pallone non e' ai piedi di nessuno dei nostri (solo scene offensive)
002 eroe fuori posizione rispetto all'azione
004 gesto senza preparazione (calcia da fermo senza caricamento/rincorsa)
005 palla da biliardo (traiettoria innaturale, rasoterra teleguidata)
006 reparto fermo (i compagni/avversari non reagiscono all'azione)
009 direzione sbagliata (gesto specchiato, es. sforbiciata al contrario)
010 pattinata (scivola senza muovere le gambe)
012 verticalizzazione all'indietro (consegna dichiarata in avanti che va verso la propria porta)
NON usare 007/011 (fenomeni ad alta frequenza: da fotogrammi statici non si giudicano).
Rispondi in JSON puro (il runtime lo esige): {"codice":"NNN oppure OK","nota":"cosa hai visto, concreto, con posizioni (vuota se OK)"}`;

fs.mkdirSync(OUTDIR, { recursive: true });
loadEnv(path.join(HARNESS_DIR,'..'));const config = getConfig(process.env);
const logger = createLogger(process.env.CPM_TAC_LOG || 'warn', { provider: config.provider });
let provider;
try { provider = createProvider(config.provider, config, logger); }
catch (e) { console.log(`❌ provider '${config.provider}' non disponibile: ${e.message}`); process.exit(2); }
const health = await provider.healthCheck();
if (!health.ok) { console.log(`❌ ${config.provider} non raggiungibile: ${health.detail}\n   (su questa macchina serve Ollama attivo con un modello visivo — sul cloud CI l'egress e' chiuso: lo strumento e' pensato per la macchina del PO)`); process.exit(2); }
console.log(`provider ${config.provider} ok — ${health.detail || ''}`);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; });/* teatro attivo: senza, i 22 vanno a piedi e ogni scena sembra rotta (lezione 7.526) */
await openMatch(page, port);
await sleep(600);

const note = [];
for (const gi of GI) {
  try {
    const st = await forceSituation(page, gi, { settle: 700, choose: true });
    const sit = (st && st.sitSig) || {};
    const frames = [];
    frames.push(await canvasShot(page));                       /* apertura */
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
    await sleep(900); frames.push(await canvasShot(page));     /* esecuzione */
    await sleep(900); frames.push(await canvasShot(page));     /* esito */
    await waitBallSettle(page, { maxMs: 8000, quietMs: 700 });
    frames.push(await canvasShot(page));                       /* assestamento */
    const images = frames.map(buf => ({ base64: buf.toString('base64') }));/* contratto provider: {base64} */
    const r = await provider.analyze({ images, prompt: `Scena gi${gi} (intent ${sit.it || '?'}) — 4 fotogrammi in ordine: apertura, esecuzione, esito, assestamento.\n\n${LEGENDA}` });
    let txt = (r.text || '').trim();
    try { const j = JSON.parse(txt); txt = (String(j.codice || '').toUpperCase() === 'OK') ? 'OK' : `codice ${j.codice} — ${j.nota || ''}`.trim(); } catch (_e) { /* testo grezzo: si tiene */ }
    note.push({ gi, intent: sit.it || null, txt });
    console.log(`gi${gi}: ${txt.split('\n')[0].slice(0, 90)}`);
  } catch (e) { note.push({ gi, txt: `(cattura fallita: ${String(e.message).slice(0, 80)})` }); }
}
await b.close(); srv.close();

const md = ['# Taccuino AI — note automatiche (setaccio, non giudice)', `provider: ${config.provider} · scene: ${GI.join(',')}`, ''];
let sospette = 0;
for (const n of note) {
  if (/^OK$/i.test(n.txt)) continue;
  sospette++;
  md.push(`———`, ``, `[TACCUINO-AI] SIT #${n.gi}${n.intent ? ` [${n.intent}]` : ''}`, `NOTA: ${n.txt}`, ``);
}
if (!sospette) md.push('Nessuna scena sospetta: tutte OK.');
fs.writeFileSync(OUTFILE, md.join('\n'));
console.log(`\nscene sospette: ${sospette}/${note.length} → ${OUTFILE}`);
