#!/usr/bin/env node
/* VISION DOCTOR — «il livello percettivo e' cablato, oppure no?», in quattro anelli separati.

   PERCHE' ESISTE. Oggi il gate stampa una riga sola quando l'AI Vision non gira:
   `ai-vision: skip (Ollama non raggiungibile su http://localhost:11434 (fetch failed))`. Quella riga
   non distingue quattro situazioni molto diverse — provider configurato male, server non avviato,
   server avviato ma modello mancante, tutto in piedi ma il modello non sa leggere immagini — e chi la
   legge non sa quale dei quattro sistemare. Peggio: uno SKIP passa la CI, quindi il livello percettivo
   puo' restare spento per settimane senza che nessuno se ne accorga. Questa sonda rende visibile la
   catena e dice, a ogni anello, la mossa successiva.

   I QUATTRO ANELLI, in ordine, ognuno col proprio verdetto:
     1. CONFIGURAZIONE — quale provider, quale modello, quale URL, se c'e' una chiave (la chiave non
        viene MAI stampata: solo presente/assente e la lunghezza), e se `.env` e' stato letto davvero.
     2. HOST — una richiesta grezza all'URL, indipendente dalla logica del provider, per separare tre
        cose che si somigliano e non lo sono: nessuno in ascolto (server spento), connessione negata
        dalla rete (policy/proxy), server che risponde (anche 401/404: quello e' un host vivo).
     3. PROVIDER — l'`healthCheck` del provider vero, quello che il gate usa per decidere lo skip.
     4. RISPOSTA VERA — si manda un'immagine minima generata al volo e si chiede una parola. E' l'unico
        anello che prova che il modello VEDE: un healthCheck verde su un modello senza vista passa
        tutti gli altri controlli e fallisce alla prima review. Questo e' il «verde per inerzia» che
        questo repo insegue da sempre, e senza questo anello sarebbe qui dentro.

   ⚠️ NON RIPARA NIENTE, e non installa niente: dichiara lo stato e la mossa. Uscita 0 = catena
   completa; 1 = un anello rotto (il messaggio dice quale e cosa fare); 2 = la sonda stessa non ha
   potuto misurare.

   ✅ COLLAUDATA SUL CAMPO (2026-08-15, Ollama Cloud + gemma4:31b): catena completa, quarto anello
   risposto in 825 ms. Scritta in una sessione cloud dove ogni sorgente di modelli e' bloccata dalla
   network policy (huggingface.co e registry.ollama.ai non si connettono, github.com/releases 403), e
   quindi partita coi soli rami rossi provati. Il collaudo vero ha trovato TRE difetti di questa sonda,
   uno per giro, e vale la pena averli in fila perche' sono tre modi diversi di sbagliare una diagnosi:
     · dava «il modello non sa leggere immagini» su un HTTP 410 «modello ritirato» — generalizzava
       l'ultimo sospetto a ogni sintomo;
     · dava per buono un health verde che NON aveva visto il modello (cloud, «verificato in analyze»);
     · mandava al modello un PNG di 2x2 pixel, e il server rispondeva 500. Un encoder di vista lavora
       a patch di 14-16 px: sotto quella soglia non c'e' niente da leggere. Era la sonda a essere rotta,
       non il modello — e per due giri ho accusato il modello.
   Chi la esegue su una configurazione diversa aggiorni questa riga.

     node vision-doctor.mjs                                                                          */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, getConfig } from './lib/vision/config.mjs';
import './lib/vision/providers/index.mjs';
import { createProvider, listProviders } from './lib/vision/registry.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ok = (t) => console.log(`  ✅ ${t}`);
const ko = (t, mossa) => { console.log(`  ❌ ${t}`); if (mossa) console.log(`     → ${mossa}`); };

console.log('\n=== VISION DOCTOR ===');

/* ---------- anello 1: configurazione ---------- */
console.log('\n1. CONFIGURAZIONE');
const env = loadEnv(HERE);
const cfg = getConfig();
const pcfg = cfg[cfg.provider] || {};
console.log(`  .env: ${env.loaded ? `letto (${env.count} variabili) — ${env.file}` : `ASSENTE (${env.file}) — valgono i default`}`);
console.log(`  provider: ${cfg.provider}   ·   registrati: [${listProviders().join(', ')}]`);
console.log(`  modello:  ${pcfg.model || '(non definito)'}`);
console.log(`  baseUrl:  ${pcfg.baseUrl || '(non definito)'}`);
console.log(`  chiave:   ${pcfg.apiKey ? `presente (${String(pcfg.apiKey).length} caratteri)` : 'assente'}`);
console.log(`  modalita' di cattura: ${process.env.VISION_MODE || 'frames (default)'}`);

let provider = null;
try { provider = createProvider(cfg.provider, cfg, { info() {}, warn() {}, error() {}, debug() {} }); ok(`provider "${cfg.provider}" istanziabile`); }
catch (e) { ko(`provider non istanziabile: ${e.message}`, `VISION_PROVIDER deve essere uno fra [${listProviders().join(', ')}]`); process.exit(1); }

/* la chiave fittizia obbligatoria e' una trappola vera: il provider openai rifiuta PRIMA di chiamare
   se la chiave e' vuota, e un server locale (llama.cpp, vLLM, LocalAI) non ne vuole nessuna */
if (cfg.provider === 'openai' && !pcfg.apiKey)
  ko('OPENAI_API_KEY vuota', "con un server locale metti un valore fittizio (OPENAI_API_KEY=local): il provider rifiuta la chiave vuota prima ancora di chiamare");

/* ---------- anello 2: host raggiungibile ---------- */
console.log('\n2. HOST');
let hostVivo = false;
if (!pcfg.baseUrl) { ko('nessun baseUrl per questo provider'); }
else {
  const t0 = Date.now();
  try {
    const res = await fetch(pcfg.baseUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
    hostVivo = true;
    ok(`${pcfg.baseUrl} risponde (HTTP ${res.status}, ${Date.now() - t0}ms) — l'host e' vivo${res.status === 401 || res.status === 403 ? ': il codice dice solo che manca o non vale la chiave' : ''}`);
  } catch (e) {
    /* ⚠️ TRAPPOLA PAGATA ALLA PRIMA PASSATA: `fetch` di Node dice soltanto «fetch failed», e su quella
       stringa la prima stesura ha diagnosticato «host bloccato dalla rete» dove la causa era «nessuno in
       ascolto» — cioe' ha mandato chi legge a controllare il proxy invece di avviare il server. Il codice
       vero (ECONNREFUSED, ENOTFOUND, …) sta in `e.cause`, e un dottore che sbaglia diagnosi e' peggio di
       nessun dottore. */
    const code = (e && e.cause && (e.cause.code || e.cause.errno)) || '';
    const m = `${e.message || e}${code ? ` [${code}]` : ''}`;
    if (/ECONNREFUSED|refused/i.test(`${m} ${code}`)) ko(`${pcfg.baseUrl}: connessione rifiutata — nessuno in ascolto su quella porta`, cfg.provider === 'ollama' ? "avvia il server: `ollama serve`" : "avvia il tuo server locale (es. `llama-server --host 127.0.0.1 --port 8080 ...`)");
    else if (/timeout|abort/i.test(m)) ko(`${pcfg.baseUrl}: nessuna risposta entro 8s`, 'host lento o filtrato: verifica di poterlo raggiungere dal terminale con curl');
    else if (/ENOTFOUND|EAI_AGAIN/i.test(`${m} ${code}`)) ko(`${pcfg.baseUrl}: nome non risolto (${code})`, 'host inesistente o DNS non raggiungibile: controlla il valore di baseUrl');
    else ko(`${pcfg.baseUrl} irraggiungibile (${m})`, "connessione negata dalla rete — in una sessione cloud con network policy restrittiva questo e' il caso normale, e il livello percettivo va eseguito in locale");
  }
}

/* ---------- anello 3: healthCheck del provider (quello che il gate usa) ---------- */
console.log('\n3. PROVIDER (lo stesso healthCheck su cui il gate decide lo skip)');
let health = null;
try { health = await provider.healthCheck(); }
catch (e) { health = { ok: false, detail: `healthCheck esploso: ${e.message || e}` }; }
if (health.ok) {
  ok(health.detail || 'health ok');
  /* ⚠️ VERDE MORBIDO. Sul cloud, se il modello configurato non compare fra i tag il provider passa lo
     stesso («verificato in analyze»): e' una scelta ragionevole — alcuni deployment non elencano tutto —
     ma chi legge deve sapere che quel verde NON ha visto il modello. Misurato sul campo alla prima
     esecuzione vera: health verde su `gemma3:27b`, e l'anello dopo ha risposto HTTP 410 «retired». */
  if (/non in \/api\/tags|verificato in analyze/i.test(health.detail || ''))
    console.log(`     ⚠️  verde MORBIDO: il modello "${pcfg.model}" non compare fra quelli elencati dal server — questo anello non l'ha visto, lo prova solo il prossimo`);
}
else ko(health.detail || 'health ko', cfg.provider === 'ollama' && /non installato/.test(health.detail || '') ? `scarica il modello: \`ollama pull ${pcfg.model}\`` : null);

/* ---------- anello 4: il modello VEDE? ---------- */
console.log('\n4. RISPOSTA VERA (l\'unico anello che prova che il modello guarda l\'immagine)');
if (!hostVivo || !health.ok) {
  console.log('  ⏭️  non eseguito: gli anelli precedenti non reggono — un verde qui sarebbe inventato');
  console.log('\nCATENA INCOMPLETA: il livello percettivo NON e\' operativo.');
  process.exit(1);
}
/* ⚠️ L'IMMAGINE DI PROVA NON PUO' ESSERE DEGENERE. La prima stesura mandava un PNG di 2x2 pixel —
   «minimo», e quindi comodo da tenere inline. Sul campo il server ha risposto HTTP 500 su un modello
   che l'anello 3 dava per disponibile, e un encoder di vista lavora a patch di 14-16 pixel: su un
   fotogramma piu' piccolo di una patch non ha niente da leggere. Al di la' della causa esatta, il
   principio e' quello di tutte le sonde di questo repo: si prova il percorso VERO, e il percorso vero
   manda screenshot di gioco, non francobolli. Ora l'immagine e' 64x64 con due tinte e una diagonale
   (qualcosa da vedere), generata al volo con la stessa pngjs che l'harness ha gia'. */
const PNG_2x2 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAACZgbYnAAAAGUlEQVQIW2P8z8Dwn4EIwDiqkL4hNaoQAGxHB/2s0iRaAAAAAElFTkSuQmCC';
let IMG = PNG_2x2, IMGDESC = '2x2 di ripiego';
try {
  const { PNG } = await import('pngjs');
  const L = 64, png = new PNG({ width: L, height: L });
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const i = (y * L + x) << 2, dentro = Math.abs(x - y) < 8;
    png.data[i] = dentro ? 240 : 20; png.data[i + 1] = dentro ? 60 : 120; png.data[i + 2] = dentro ? 60 : 30; png.data[i + 3] = 255;
  }
  IMG = PNG.sync.write(png).toString('base64'); IMGDESC = '64x64 generata';
} catch (e) { /* senza pngjs si prova lo stesso, col francobollo */ }
try {
  const t0 = Date.now();
  const r = await provider.analyze({
    images: [{ base64: IMG, name: 'probe.png' }],
    prompt: 'Rispondi SOLO con questo JSON, senza altro testo: {"visto": true}',
    signal: AbortSignal.timeout(cfg.timeout || 60000),
  });
  const testo = String((r && r.text) || '').trim();
  if (!testo) ko('il modello ha risposto VUOTO', 'il modello risponde ma non produce testo: probabile modello senza supporto immagini');
  else {
    ok(`risposta in ${Date.now() - t0}ms da "${r.model || pcfg.model}": ${testo.slice(0, 80).replace(/\s+/g, ' ')}`);
    console.log('\nCATENA COMPLETA: il livello percettivo e\' operativo — `npm run ai-vision` produrra\' una review vera.');
    process.exit(0);
  }
} catch (e) {
  const kind = (e && e.kind) || '';
  const msg = String(e.message || e);
  /* ⚠️ DIAGNOSI SBAGLIATA ALLA PRIMA ESECUZIONE VERA, e corretta qui. Il ramo di ripiego diceva «il
     modello non sa leggere immagini» a QUALUNQUE errore senza categoria: sul campo e' arrivato un
     HTTP 410 «gemma3:27b was retired», cioe' un modello ritirato dal cloud, e il consiglio mandava a
     cercare un modello di vista invece che a cambiare una riga di configurazione. Un dottore che
     generalizza l'ultimo sospetto a ogni sintomo e' il difetto che questa sonda doveva togliere. */
  const ritirato = /\b410\b|retired|deprecat/i.test(msg);
  /* ⚠️ ATTRIBUZIONE, non deduzione. Un errore qui puo' venire dall'IMMAGINE (modello che non la
     accetta, encoder che si rompe) oppure dal MODELLO/endpoint in se'. Sono due mosse diverse — cambiare
     modello contro cambiare configurazione — e finora la sonda tirava a indovinare fra le due. Si prova
     la stessa chiamata SENZA immagine: se quella passa, il modello e' vivo e a rompersi e' la vista. */
  let soloTesto = null;
  try { const rt = await provider.analyze({ images: [], prompt: 'Rispondi solo: {"ok":true}', signal: AbortSignal.timeout(cfg.timeout || 60000) });
    soloTesto = rt && rt.text ? 'passa' : 'vuota'; }
  catch (e2) { soloTesto = `fallisce (${String(e2.message || e2).slice(0, 60)})`; }
  ko(`analyze fallita${kind ? ` (${kind})` : ''}: ${msg}`,
    ritirato ? `il modello "${pcfg.model}" e' stato RITIRATO dal server: scegline uno dall'elenco stampato nell'anello 3 e mettilo in .env come OLLAMA_MODEL — deve essere un modello con la VISTA (la famiglia gemma4 lo e' su tutte le taglie)` :
    kind === 'model_missing' ? `il modello "${pcfg.model}" non esiste sul server: controlla il nome, oppure scaricalo con \`ollama pull ${pcfg.model}\`` :
    kind === 'timeout' ? 'il modello ha superato il timeout: su CPU un modello di vista puo\' volerci minuti — alza VISION_TIMEOUT o usa una taglia piu\' piccola' :
    /image|vision|multimodal|not support/i.test(msg) ? 'il modello risponde ma non accetta immagini: serve un modello di VISTA (es. qwen2.5vl, gemma4)' :
    soloTesto === 'passa' ? `la stessa chiamata SENZA immagine PASSA: il modello "${pcfg.model}" e' vivo ma su questo server non regge l'immagine — scegli un modello con la VISTA fra quelli elencati nell'anello 3` :
    `la stessa chiamata senza immagine ${soloTesto}: non e' l'immagine, e' il modello o l'endpoint — il messaggio qui sopra e' del server, non una deduzione di questa sonda`);
  console.log(`     (prova di controllo — stessa chiamata senza immagine: ${soloTesto} · immagine usata: ${IMGDESC})`);
}
console.log('\nCATENA INCOMPLETA: il livello percettivo NON e\' operativo.');
process.exit(1);
