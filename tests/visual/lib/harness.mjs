/* ============================================================================
   CPM VALIDATION — INFRASTRUTTURA CONDIVISA (riuso, zero duplicazione)
   Server statico + browser WebGL + flusso→match + hook force/freeze + dHash.
   Usata dall'orchestratore validate-situations.mjs e dai check modulari.
   ============================================================================ */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..', '..');           // repo root (tests/visual/lib → repo)
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* [7.190.0 flake-fix del poller di final-state] campiona __CPM_STATE AGGANCIANDOSI A FRAME REALI.
   Il poller «palla ferma» confrontava due letture distanti 130ms di wall-clock: su macchina lenta
   (headless a ~7fps = 143ms/frame) le due letture cadevano nello STESSO frame → spostamento 0 →
   6 campioni «fermi» dichiaravano a regime una palla ancora IN VOLO (falso FAIL, es. gi=144 @gx=40.4,
   riprodotto 2/2 nel gate e 0/8 in isolamento a fps normali). Attendendo 2 rAF veri ogni campione è
   un frame DIVERSO → la quiete misurata è quella del gioco, non quella dello scheduler.
   Fallback: se rAF è throttled (tab nascosta) un timer sblocca comunque la lettura. */
export async function frameState(page, timeoutMs = 1500) {
  try {
    return await page.evaluate((to) => new Promise(res => {
      let done = false; const fin = () => { if (!done) { done = true; res(window.__CPM_STATE ? window.__CPM_STATE() : null); } };
      requestAnimationFrame(() => requestAnimationFrame(fin));
      setTimeout(fin, to);
    }), timeoutMs);
  } catch (_e) { return await page.evaluate(() => (window.__CPM_STATE ? window.__CPM_STATE() : null)); }
}

/* [7.343.0] ATTESA DELL'ASSESTAMENTO DELLA PALLA — a costo basso.
   Il gate deve giudicare lo stato finale a palla ferma, e prima lo faceva con `frameState` (due rAF + stato
   completo dei 22: ~530 ms a lettura) preteso 6 volte di fila: 3,2 s ininterrotti, azzerati da ogni sussulto,
   e 6 item su 10 arrivavano al limite di 9 s. Qui si campiona SOLO la palla (`__CPM_BALL`, hook leggero) a
   cadenza fissa e si chiede quiete per una FINESTRA DI TEMPO, non per un numero di letture lente: il criterio
   e' lo stesso (movimento < 0.3 e pallone a terra) ma diventa raggiungibile.
   Ritorna {ms, settled}: chi chiama cattura poi UNA volta lo stato completo. */

/* [7.495.0 F1] LA FASE DELLA PARTITA SI LEGGE DA QUI, MAI DA `__CPM_STATE().phase`.
   `__CPM_STATE` espone la fase dalle PROPS del componente 3D, e `show3D` non include `ended`: al fischio
   finale `ThreeMatchView` si smonta e quella funzione continua a restituire l'ultimo valore vivo PER
   SEMPRE. Due censimenti ci sono gia' cascati — cercavano `phase==='playing'` su una pagina la cui
   partita era finita, non lo trovavano mai piu', e bruciavano l'intero budget di giri in attese a vuoto:
   `ball-jump-census` ha chiuso con UNA scena su otto richieste e il varco a zero fotogrammi.
   `__CPM_PHASE` legge `phaseRef` dentro LiveMatch: e' il punto in cui il dato nasce. Ritorna null se
   l'hook non c'e' ancora (pagina in caricamento) — chi chiama distingue «non lo so» da «e' finita». */
export async function matchPhase(page) {
  try { return await page.evaluate(() => (window.__CPM_PHASE ? window.__CPM_PHASE() : null)); }
  catch (_e) { return null; }
}

export async function waitBallSettle(page, { maxMs = 9000, quietMs = 700, pollMs = 110, moveEps = 0.3, groundY = 1.2 } = {}) {
  const t0 = Date.now(); let prev = null, quietFrom = null;
  while (Date.now() - t0 < maxMs) {
    let b = null; try { b = await page.evaluate(() => (window.__CPM_BALL ? window.__CPM_BALL() : null)); } catch (_e) {}
    if (!b) { await sleep(pollMs); continue; }
    const mv = prev ? Math.hypot(b.x - prev.x, b.y - prev.y) : Infinity;
    prev = b;
    const quiet = mv < moveEps && (b.worldY == null || b.worldY <= groundY);
    if (quiet) { if (quietFrom == null) quietFrom = Date.now(); else if (Date.now() - quietFrom >= quietMs) return { ms: Date.now() - t0, settled: true }; }
    else quietFrom = null;
    await sleep(pollMs);
  }
  return { ms: Date.now() - t0, settled: false };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png' };

export function startServer(root = ROOT) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/CARRIER-MANAGER-AV.html';
      const fp = path.join(root, p);
      if (!fp.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
    });
    srv.listen(0, () => resolve(srv));
  });
}

export async function launchBrowser() {
  const _opts = { headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] };
  if (process.env.CPM_CHROME) _opts.executablePath = process.env.CPM_CHROME;
  return chromium.launch(_opts);
}

/* Route-interception: serve le UMD CDN (React/Three/Babel/Phaser) da node_modules locali.
   Necessario negli ambienti dove la policy di rete blocca i CDN (es. Claude Code web): l'HTML
   spedito resta invariato (usa i CDN). No-op se le lib locali non sono presenti. */
const _NM = path.join(__dirname, '..', 'node_modules');
const _CDN_MAP = [
  [/react-dom\.production\.min\.js/, path.join(_NM, 'react-dom/umd/react-dom.production.min.js')],
  [/react\.production\.min\.js/,     path.join(_NM, 'react/umd/react.production.min.js')],
  [/three\.min\.js/,                 path.join(_NM, 'three/build/three.min.js')],
  [/GLTFLoader\.js/,                 path.join(_NM, 'three/examples/js/loaders/GLTFLoader.js')],
  [/SkeletonUtils\.js/,              path.join(_NM, 'three/examples/js/utils/SkeletonUtils.js')],
  [/babel(\.min)?\.js/,              path.join(_NM, '@babel/standalone/babel.min.js')],
  [/phaser(\.min)?\.js/,             path.join(_NM, 'phaser/dist/phaser.min.js')],
];
export async function installCdnRoutes(page) {
  await page.route(/^https?:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//, route => {
    const url = route.request().url();
    const hit = _CDN_MAP.find(([rx]) => rx.test(url));
    if (hit && fs.existsSync(hit[1])) {
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(hit[1]) });
    }
    return route.continue();
  });
}

async function clickByText(page, src, timeout = 9000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const h = await page.evaluateHandle(s => { const rx = new RegExp(s, 'i'); return [...document.querySelectorAll('button')].find(b => rx.test((b.textContent || '').trim())) || null; }, src);
    /* [7.367.0 misurato sul gate] IL CICLO DI RIPROVA NON POTEVA RIPROVARE. Il bottone lo si cerca in un
       ciclo con un budget di `timeout` ms, ma il click portava dentro il PROPRIO timeout di Playwright (30s
       di default) e, prima di tornare, aspetta «scheduled navigations to finish». Quando quell'attesa si
       impianta — successo sul gate completo, dove la pagina di live-smoke nasce in un browser gia' carico di
       una run da 617s — il singolo click brucia 30s, sfonda la finestra dei 9s del ciclo e ESCE per
       eccezione: il ciclo di riprova non vede mai il secondo tentativo. Il `timeout` del ciclo era una
       promessa che il click poteva disattendere da solo.
       Il primo tentativo di correzione — limitare il click a una fetta del budget — ha fatto FALLIRE TUTTO
       («"Inizia il provino" non trovato», 0 Situations esaminate), e la bocciatura e' stata istruttiva: se
       accorciare l'attesa fa fallire OGNI click, allora quell'attesa non si conclude quasi mai da sola, e i
       30s di prima non erano un margine ma il tempo che ci voleva per arrendersi. Il click va a segno — il
       log Playwright dice «click action done» — e resta appeso DOPO, su «waiting for scheduled navigations
       to finish». Ma qui navigazione non ce n'e': e' una SPA, la pagina non cambia mai.
       Quindi: click vero con un tetto breve, e se quel tetto scatta si RIDISPACCIA il click in pagina, che
       e' lo stesso handler React senza nessuna attesa di navigazione. Misurato: 4 esecuzioni isolate di
       live-smoke su 7.367.0 verdi, 0 pageerror — il rosso non veniva dal gioco. */
    const el = h.asElement();
    if (el) {
      try { await el.click({ timeout: 3000 }); return true; }
      catch (e) {
        /* il click e' andato a segno, ad appendersi e' l'ATTESA DI NAVIGAZIONE: qui non c'e' navigazione da
           aspettare, e' una SPA. Si ridispaccia in pagina — stesso handler React, zero attese di pagina. */
        try { await el.evaluate(b => b.click()); return true; } catch (e2) { if (Date.now() >= end) throw e; }
      }
    }
    await sleep(200);
  }
  return false;
}

/* Apre il gioco con ?cpmtest=1, raggiunge un match (provino), carica tutte le SITUATIONS.
   Ritorna { total, consoleErrors } e lascia la pagina pronta per forceSituation(). */
export async function openMatch(page, port, opts) {
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  /* [7.213.0] il timeout era 30s: il sorgente è cresciuto (2.9 MB) e Babel in-browser, su software-GL cloud,
     impiega 14-22s a transpilare — sotto carico (più pagine aperte dai check) sforava e faceva abortire l'INTERA
     passata del gate (FATAL su openMatch → 0 Situations e tutti i check verdi a vuoto: un falso «pass» pericoloso).
     La store build precompila il JSX offline, quindi è un costo del solo harness. */
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  if (!await clickByText(page, 'Nuova carriera')) throw new Error('flusso: "Nuova carriera" non trovato');
  await sleep(700);
  /* [7.496.0 F1b] IL NOME E' OPZIONALE, E CAMBIARLO CAMBIA LA PARTITA. Il seed di partita nasce da
     avversario+stagione+settimana+NOME: con «Validator» fisso, N aperture producono N volte LA STESSA
     partita. La prima baseline del libro mastro l'ha mostrato — tre giri con seed di autoplay diversi
     davano 14 eventi, 1 gol e 2 tiri IDENTICI: non erano tre partite, era una ripetuta tre volte.
     Default invariato, quindi nessun chiamante esistente cambia comportamento. */
  const _nome = (opts && opts.name) || 'Validator';
  await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, _nome);
  if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('flusso: "INIZIA I PROVINI" non trovato');
  await sleep(400);
  if (!await clickByText(page, 'Inizia il provino')) throw new Error('flusso: "Inizia il provino" non trovato');
  await page.waitForFunction(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_STATE === 'function' && typeof window.__CPM_PROBE === 'function', { timeout: 20000 });
  // [5.76.0 ARC-1a] skipLoadAll: lascia la partita REALE in `playing` (clock vero, niente force) — per il live-smoke
  if (opts && opts.skipLoadAll) { await sleep(300); return { total: 0 }; }
  const total = await page.evaluate(() => window.__CPM_LOAD_ALL());
  await sleep(500);
  return { total };
}

/* Forza la situation gi, lascia assestare la camera, opzionalmente congela il frame (dt=0).
   Ritorna lo stato completo (__CPM_STATE) dopo l'assestamento. */
export async function forceSituation(page, gi, { settle = 650, freeze = false, choose = false } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, choose]);
  await sleep(settle);
  if (freeze) { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(120); }
  const state = await page.evaluate(() => window.__CPM_STATE());
  return state;
}

export async function freeze(page) { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(120); }
export async function unfreeze(page) { await page.evaluate(() => { window.__CPM_FROZEN = false; }); }

/* Campiona la traiettoria del POST-HIGHLIGHT: forza gi (choose), risolve l'azione k e
   poll camera/palla/giocatori a intervalli per la finestra data. Ritorna { gi, durMs, frames }.
   Usato dai check Fase 3 (durata dinamica, fluidità camera, coerenza animazioni, movimento tattico). */
export async function samplePostHighlight(page, gi, { settle = 600, k = 0, pollMs = 110, windowMs = 1100 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
  const frames = []; const end = Date.now() + windowMs; let durMs = null;
  while (Date.now() < end) {
    const d = await page.evaluate(() => ({
      dur: window.__CPM_RESULT_DUR || null,
      cut: (typeof window.__CPM_CUTLIVE === 'function') ? window.__CPM_CUTLIVE() : false,
      probe: typeof window.__CPM_PROBE === 'function' ? window.__CPM_PROBE() : null,
      st: typeof window.__CPM_STATE === 'function' ? window.__CPM_STATE() : null,
    }));
    if (d.dur) durMs = d.dur;
    if (d.probe && d.probe.ok) frames.push({
      /* [7.502.0] QUANDO e' stato preso il campione. Senza, chi confronta due fotogrammi misura una
         DISTANZA e la chiama salto — ma fra due poll possono passare 110 ms o 400, e la stessa camera
         che scorre liscia produce numeri diversi: e' velocita' x intervallo, la trappola gia' pagata due
         volte su questo repo (7.360 sul pallone, 7.478 sul varco). Il tempo va portato dietro. */
      t: Date.now(),
      cut: d.cut||false,
      cam: d.probe.camera,
      ball: d.probe.ball ? d.probe.ball.world : null,
      players: (d.st && d.st.players) ? d.st.players.map(p => ({ x: p.x, y: p.y })) : null,
      phase: d.st ? d.st.phase : null,
    });
    await sleep(pollMs);
  }
  return { gi, durMs, frames };
}

/* MOTION sampler (B2): forza gi al framing interattivo (choose), SBLOCCA il render (dt>0) e campiona le
   posizioni MESH reali (__CPM_STATE().players, derivate da mesh.position) durante la fase ATTIVA off-ball,
   SENZA risolvere l'azione. Ritorna metriche di vivacità: quanti giocatori si muovono davvero + salto max.
   Usato dal check `motion` (No Dead Players / liveness off-ball). */
export async function sampleMotion(page, gi, { settle = 500, pollMs = 100, windowMs = 9000 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); // off-ball AI gira solo con dt>0
  /* [7.536.0] LA FINESTRA SEGUE LA SCENA, NON L'OROLOGIO DEL TEST. La misura di reattività (#24: «un
     difensore arriva a impegnare il portatore?») campionava un secondo d'OROLOGIO — ma headless, sotto
     la contesa di CPU di una passata piena, in quel secondo il gioco avanza molto meno, e il difensore
     semplicemente non fa in tempo ad arrivare: la stessa build misurata due volte a macchina scarica dà
     minDist 21,0 e 22,5 (verde) e due volte sotto carico 25,4 e 26,9 (rosso). Non peggiorava la scena,
     peggiorava la misura — ed e' la trappola gia' pagata piu' volte in questa serie («lo strumento
     sbaglia prima del codice»). Ora si campiona finche' il difensore piu' vicino SMETTE di avvicinarsi
     (assestamento: 6 campioni senza progresso) con un tetto di 4s: a macchina scarica finisce presto
     come prima, sotto carico aspetta che la scena viva. La domanda del check e' «arriva o non arriva»,
     non «arriva entro un secondo del test». */
  const frames = []; const end = Date.now() + windowMs;
  /* la finestra si chiude sui SECONDI DI SCENA (window.__CPM_SCENET, somma dei dt del render-loop), non
     sull'orologio: sotto carico serve piu' tempo reale per la stessa quantita' di gioco. Tetto d'orologio
     come rete di sicurezza. Prima stesura di questo rimedio — «fermati quando il difensore smette di
     avvicinarsi» — e' stata BUTTATA con la sua misura: sotto carico il difensore si muove meno di 0,05u
     per campione e il criterio scattava subito, misurando di nuovo il carico (26,3 contro 21 isolato). */
  const sceneT0 = await page.evaluate(() => window.__CPM_SCENET || 0);
  const TARGET_SCENE = 1.2;
  let sceneNow = sceneT0;
  while (Date.now() < end) {
    const st = await page.evaluate(() => (typeof window.__CPM_STATE === 'function' ? window.__CPM_STATE() : null));
    const players = ((st && st.players) || []).map(p => ({ x: p.x, y: p.y, team: p.team, gk: p.gk }));
    const ball = (st && st.ball) ? { x: st.ball.x, y: st.ball.y } : null;
    frames.push({ players, ball });
    sceneNow = await page.evaluate(() => window.__CPM_SCENET || 0);
    if (sceneNow - sceneT0 >= TARGET_SCENE && frames.length >= 8) break;
    await sleep(pollMs);
  }
  const n = frames.length ? frames[0].players.length : 0;
  const disp = new Array(n).fill(0); let maxD = 0;
  for (let f = 1; f < frames.length; f++) for (let p = 0; p < n; p++) {
    const a = frames[f - 1].players[p], c = frames[f].players[p]; if (!a || !c) continue;
    const d = Math.hypot(c.x - a.x, c.y - a.y); disp[p] += d; if (d > maxD) maxD = d;
  }
  // soglia "alive" ricalibrata 1.0→0.7u dopo il rallentamento dei movimenti (5.47.9): col gioco più lento un giocatore che si
  // sposta >0.7u nella finestra è chiaramente VIVO (morto = ~0); evita falsi "dead players" sulle situation quasi-statiche in software-GL.
  let alive = 0; for (let p = 0; p < n; p++) if (disp[p] > 0.7) alive++;
  // REACTIVITY (#24, Every Player Reacts): il portatore è home → gli away PRESSANO. Distanza minima
  // away(non-gk)→palla sull'intera finestra + n. difensori entro 15u (impegno sul portatore).
  let defMinEver = 99, defNear = 0, bxSum = 0, bxN = 0;
  for (const fr of frames) {
    if (!fr.ball) continue;
    bxSum += fr.ball.x; bxN++;
    let near = 0;
    for (const p of fr.players) { if (p.team !== 'away' || p.gk) continue; const d = Math.hypot(p.x - fr.ball.x, p.y - fr.ball.y); if (d < defMinEver) defMinEver = d; if (d < 15) near++; }
    if (near > defNear) defNear = near;
  }
  return { gi, players: n, alive, maxFrameDelta: +maxD.toFixed(1), avgDisp: +(disp.reduce((a, b) => a + b, 0) / (n || 1)).toFixed(1), defMinEver: +defMinEver.toFixed(1), defNear, ballX: bxN ? +(bxSum / bxN).toFixed(1) : null };
}

/* BALL-PATH sampler (#41): forza gi (choose), risolve l'azione e campiona la x della palla (coord gioco
   0..100, x=100 = porta attaccata) durante la conclusione. Ritorna {intent, startX, net, maxBackStep, minX}.
   Usato dal check `ball-motion` (no-boomerang / progressione coerente sulle azioni offensive). */
export async function sampleBallPath(page, gi, { settle = 450, pollMs = 90, windowMs = 1100 } = {}) {
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const intent = await page.evaluate(g => (window.__CPM_SITS && window.__CPM_SITS[g] && window.__CPM_SITS[g].intent) || null, gi);
  const bx = () => page.evaluate(() => { const s = (typeof window.__CPM_STATE === 'function') && window.__CPM_STATE(); return s && s.ball ? s.ball.x : null; });
  const start = await bx();
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
  const xs = []; if (start != null) xs.push(start);
  const end = Date.now() + windowMs;
  while (Date.now() < end) { const x = await bx(); if (x != null) xs.push(x); await sleep(pollMs); }
  let maxBack = 0; for (let i = 1; i < xs.length; i++) { const d = xs[i] - xs[i - 1]; if (d < maxBack) maxBack = d; }
  return { gi, intent, startX: xs.length ? +xs[0].toFixed(1) : null, net: xs.length ? +(xs[xs.length - 1] - xs[0]).toFixed(1) : null,
    maxBackStep: +maxBack.toFixed(1), minX: xs.length ? +Math.min(...xs).toFixed(1) : null, n: xs.length };
}

/* Risolve l'azione k della Situation corrente, attende l'esito, ritorna {outcome, finalState}.
   Lo stato finale è catturato quando la PALLA SI FERMA (l'arco di conclusione — es. gol dopo
   dribbling/build-up — può durare oltre `wait` su HW lento → cattura prematura = falso positivo
   final-state, il flake storico gi=40). Polling fino a settle, cap a settleMax. */
export async function resolveAction(page, k = 0, { wait = 850, settleMax = 2800 } = {}) {
  await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
  await sleep(wait);
  const outcome = await page.evaluate(() => window.__CPM_OUTCOME);
  let finalState = await page.evaluate(() => window.__CPM_STATE());
  const t0 = Date.now();
  while (Date.now() - t0 < settleMax) {
    await sleep(120);
    const s = await page.evaluate(() => window.__CPM_STATE());
    if (!s || !s.ok || !s.ball || !finalState || !finalState.ball) { if (s) finalState = s; continue; }
    const moved = Math.hypot((s.ball.x || 0) - (finalState.ball.x || 0), (s.ball.y || 0) - (finalState.ball.y || 0));
    finalState = s;
    if (moved < 0.4) break; // palla ferma → stato finale stabile
  }
  return { outcome, finalState };
}

/* Screenshot del SOLO canvas 3D (ignora la sidebar testuale che cambia per situation).
   [7.480.0 collaudo PO sulla SUA macchina] Tre difetti, tutti visti alla prima esecuzione vera fuori da
   questo repo: (a) la clip era ritagliata su un viewport CABLATO a 900 px — giusto per la review, sbagliato
   per chiunque apra una pagina di dimensione diversa, e una clip fuori viewport manda Playwright su un
   percorso di cattura piu' lento; (b) `page.screenshot` girava senza timeout esplicito, quindi ereditava i
   30 s di default e quando la pagina era occupata moriva li'; (c) non ritentava. Ora: clip clampata al
   viewport reale, timeout dichiarato e regolabile (`CPM_SHOT_TIMEOUT`), e un secondo tentativo senza clip
   dopo una pausa — perche' la causa piu' probabile e' un istante di saturazione del render-loop, e un
   istante passa. */
export async function canvasShot(page, opts = {}) {
  const vp = (typeof page.viewportSize === 'function' && page.viewportSize()) || { width: 900, height: 900 };
  const box = await page.evaluate(v => {
    const c = document.querySelector('canvas'); if (!c) return null;
    const r = c.getBoundingClientRect();
    const x = Math.max(0, r.x), y = Math.max(0, r.y);
    return { x, y, width: Math.min(r.width, v.w - x), height: Math.min(r.height, v.h - y) };
  }, { w: vp.width, h: vp.height });
  const timeout = +(process.env.CPM_SHOT_TIMEOUT || opts.timeout || 20000);
  const clip = box && box.width > 10 && box.height > 10 ? { clip: box } : {};
  try { return await page.screenshot({ ...clip, timeout }); }
  catch (e) {
    await sleep(500);
    /* ritentativo SENZA clip: se il primo e' morto sul ritaglio, questo lo aggira; se muore anche lui,
       l'errore sale a chi chiama, che ora sa saltare l'highlight invece di morire (vedi ai-vision-review) */
    return await page.screenshot({ timeout: Math.max(10000, timeout) });
  }
}

/* dHash percettivo 64-bit (16 hex) — robusto al jitter sub-pixel. */
export function dHash(buf) {
  const png = PNG.sync.read(buf); const { width: W, height: H, data } = png; const w = 9, h = 8;
  const gray = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const x0 = Math.floor(x * W / w), x1 = Math.max(x0 + 1, Math.floor((x + 1) * W / w));
    const y0 = Math.floor(y * H / h), y1 = Math.max(y0 + 1, Math.floor((y + 1) * H / h));
    let s = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * W + xx) * 4; s += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; n++; }
    gray[y * w + x] = s / n;
  }
  let bits = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w - 1; x++) bits += (gray[y * w + x] < gray[y * w + x + 1]) ? '1' : '0';
  let hex = ''; for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}
export function hamming(a, b) { if (!a || !b || a.length !== b.length) return 64; let d = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } } return d; }

/* FIRMA DI STATO DETERMINISTICA — il "risultato/hash finale" per seed fissa.
   Usa i target LOGICI (heroTarget, deterministici con __CPM_RESEED) + possessore + camera + conteggi.
   NON include la posa mesh (lerp) né i compagni in drift (validati dai check tolleranti). */
export function stateSig(s) {
  if (!s || !s.ok) return null;
  const ht = s.heroTarget || {}, cn = s.counts || {};
  // solo campi PIENAMENTE deterministici (reseed): target logico eroe + camera + conteggi.
  // NB: il possessore (geometria sul nearest player in drift) NON è deterministico → escluso dalla firma,
  // la sua correttezza è verificata dal check initial-state (palla agganciata all'eroe).
  const base = { htx: ht.x ?? null, hty: ht.y ?? null, cam: !!(s.camera && s.camera.abovePitch), ch: cn.home ?? null, ca: cn.away ?? null };
  // [5.94.0 ARC-1c] campi PURI della Situation (intent/ballState/movesCap dalla probe sitSig):
  // ampliano l'oracolo golden; le posizioni off-ball restano ESCLUSE di proposito (drift wall-clock → flaky).
  if (s.sitSig) { base.it = s.sitSig.it ?? null; base.bs = s.sitSig.bs ?? null; base.mm = s.sitSig.mm ?? null; }
  return base;
}
export const sigStr = sig => (sig ? JSON.stringify(sig) : 'null');
export const sigEq = (a, b) => sigStr(a) === sigStr(b);
