/* ============================================================================
   lib/attese-395.mjs — SI ASPETTA IL SALVATAGGIO, NON UN TEMPO FISSO (giro 395, PO-532)

   Regola 4 di docs/governo/PROCESSO.md («Controlli instabili»): si attende un evento o una condizione, mai un tempo fisso.
   Un controllo che legge localStorage 'cpm-v3' dopo `sleep(N)` legge cio' che c'e' a quell'ora, non cio' che il gioco ha
   deciso: l'autosave di CareerApp (src/18) ha un debounce di 600 ms che riparte a ogni cambio di `player`, e un cambio che arriva
   dopo (la copia delle finestre aperte, giro 201/270) sposta la scrittura a ~1,1 s. A runner lento lo spostamento cresce.

   L'EVENTO VERO, misurato dalla sonda e senza toccare il gioco:
     1. «salvataggio allineato»: il giocatore scritto in 'cpm-v3' e' IDENTICO (JSON) alla copia viva `__CPM_CAREER.snapshot()`.
        storage.save (src/08) scrive `{...d, savedAt, saveVersion}` con d.player = lo stato React: le due stringhe coincidono solo se
        nessun cambio di player aspetta ancora il suo salvataggio;
     2. «dopo l'azione» (opzione `dopo`): almeno una scrittura di 'cpm-v3' DOPO quella contata prima dell'azione. Le scritture si
        contano avvolgendo Storage.prototype.setItem nella pagina (solo la sonda, mai il gioco);
     3. «fermo»: nessuna scrittura negli ultimi `quiete` ms (orologio della pagina; default 700 = debounce 600 del gioco + margine),
        cosi' un cambio partito un istante dopo l'allineamento (la copia delle finestre) non viene perso;
     4. opzionale `quando`: condizione sul giocatore salvato (sorgente di una funzione, valutata nella pagina).

   Il TETTO (default 15 s) serve a non appendersi, non a decidere: se scade, la lettura NON e' giudicata. La funzione lo stampa
   (motivo + ultimo stato visto), lo registra, e all'uscita del processo stampa per ULTIMA la riga «❌ non giudicato» e forza
   il codice 1 (regole 1 e 7: motivo per ultimo, non giudicato = rosso), qualunque cosa il controllo abbia stampato prima.

   Uso:
     import { contaSalvataggi395, attendiSalvataggio395 } from './lib/attese-395.mjs';
     const n0 = await contaSalvataggi395(page);          // prima dell'azione (arma il contatore se manca)
     await page.evaluate(() => window.__CPM_CAREER.step());
     await attendiSalvataggio395(page, { dopo: n0, motivo: 'settimana vissuta' });
     const s = await page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);

   Guardiano statico: npm run attese-395 (rosso CPM_NO_G395=1 = l'elenco delle attese fisse di prima).
   ============================================================================ */

export const CHIAVE_395 = 'cpm-v3';
export const NON_GIUDICATI_395 = [];
let agganciato = false;
function aggancia() {
  if (agganciato) return; agganciato = true;
  process.on('exit', () => {
    if (!NON_GIUDICATI_395.length) return;
    console.log(`❌ non giudicato (attese-395): ${NON_GIUDICATI_395.length} letture del salvataggio senza evento — ${NON_GIUDICATI_395.slice(0, 2).join(' · ')}`);
    process.exitCode = 1;
  });
}

const ARMA = (k) => {
  if (window.__T395) return window.__T395.n;
  const T = window.__T395 = { n: 0, t: 0, k };
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, val) { const r = orig.call(this, key, val); if (key === T.k) { T.n++; T.t = performance.now(); } return r; };
  return 0;
};

/** Numero di scritture di 'cpm-v3' viste finora (arma il contatore nella pagina se manca: vale per le scritture successive). */
export async function contaSalvataggi395(page, chiave = CHIAVE_395) {
  return page.evaluate(ARMA, chiave);
}

/** Arma il contatore prima di ogni caricamento della pagina (per contare anche le scritture del primo avvio). */
export async function armaSalvataggi395(page, chiave = CHIAVE_395) {
  await page.addInitScript(ARMA, chiave);
}

/**
 * Attende il salvataggio allineato e fermo. → { ok, ms, motivo, visto }
 * @param {object} o  dopo: scritture contate prima dell'azione (null = nessun vincolo) · quando: sorgente di una funzione (p)=>bool sul
 *                    giocatore salvato · tetto (ms, default 15000) · quiete (ms, default 700) · motivo: che cosa si aspetta · chiave
 */
export async function attendiSalvataggio395(page, o = {}) {
  aggancia();
  const { dopo = null, quando = null, tetto = 15000, quiete = 700, motivo = 'salvataggio', chiave = CHIAVE_395 } = o;
  const t0 = Date.now(); let visto = null;
  await page.evaluate(ARMA, chiave);
  while (Date.now() - t0 < tetto) {
    visto = await page.evaluate(({ k, quando }) => {
      const T = window.__T395; let snap = null, sp = null;
      try { snap = window.__CPM_CAREER && window.__CPM_CAREER.snapshot(); } catch (e) {}
      try { sp = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {}
      const p = sp && sp.player;
      const allineato = !!(snap && typeof snap === 'object' && p && JSON.stringify(snap) === JSON.stringify(p));
      let cond = true; if (quando) { try { cond = !!(0, eval)('(' + quando + ')')(p || {}); } catch (e) { cond = false; } }
      return { n: T.n, fermo_ms: T.n ? Math.round(performance.now() - T.t) : 1e9, allineato, cond, carriera: !!snap };
    }, { k: chiave, quando: quando ? String(quando) : null });
    if (visto.allineato && visto.cond && (dopo == null || visto.n > dopo) && visto.fermo_ms >= quiete) return { ok: true, ms: Date.now() - t0, motivo, visto };
    await new Promise(r => setTimeout(r, 100));
  }
  const m = `${motivo}: tetto ${tetto} ms scaduto (allineato ${visto && visto.allineato} · scritture ${visto && visto.n}${dopo != null ? ' > ' + dopo + '?' : ''} · fermo ${visto && visto.fermo_ms} ms · condizione ${visto && visto.cond} · carriera ${visto && visto.carriera})`;
  NON_GIUDICATI_395.push(m); console.log('⚠️ non giudicato: ' + m);
  return { ok: false, ms: Date.now() - t0, motivo: m, visto };
}

/* ---------------------------------------------------------------------------------------------------------------------------
   RILEVATORE STATICO (censimento e guardiano attese-395). Una «attesa fissa prima di una lettura del salvataggio» e':
     - una riga che legge 'cpm-v3' (localStorage.getItem) o chiama un aiutante del file che lo legge (definito con const/let/function
       e con la lettura nelle sue prime 4 righe);
     - e, sulla stessa riga prima della lettura o nelle 2 righe di codice precedenti, un `sleep(N)` / `waitForTimeout(N)` con N
       scritto in cifre, che NON sia il passo di un ciclo d'attesa (riga con break/continue/for/while) e senza un ciclo, un
       waitForFunction o un attendiSalvataggio395 in mezzo.
   I commenti si tolgono prima (la storia «era sleep(900)» non e' un'attesa). E' un'euristica a righe: trova i casi scritti come
   nei controlli del repo, non dimostra l'assenza di ogni attesa (dubbio dichiarato nel rapporto del giro 395).
   --------------------------------------------------------------------------------------------------------------------------- */
const LETTURA_395 = /localStorage\.getItem\(\s*['"`]cpm-v3['"`]/;
const ATTESA_395 = /\b(?:sleep|waitForTimeout)\(\s*(\d+)\s*\)/;
export function senzaCommenti395(testo) {
  let dentro = false;
  return String(testo).split('\n').map(r => {
    let o = '';
    for (let i = 0; i < r.length; i++) {
      if (dentro) { if (r[i] === '*' && r[i + 1] === '/') { dentro = false; i++; } continue; }
      if (r[i] === '/' && r[i + 1] === '*') { dentro = true; i++; continue; }
      if (r[i] === '/' && r[i + 1] === '/' && r[i - 1] !== ':' && r[i - 1] !== '\\') break;
      o += r[i];
    }
    return o;
  });
}
/** → [{ riga_attesa, riga_lettura, attesa, testo }] (righe 1-based) */
export function censisciAttese395(testo) {
  const L = senzaCommenti395(testo);
  const aiutanti = new Set();
  L.forEach((r, i) => { const m = r.match(/(?:const|let|async function|function)\s+([A-Za-z_$][\w$]*)\s*(?:=|\()/);
    if (m && LETTURA_395.test(L.slice(i, i + 4).join('\n'))) aiutanti.add(m[1]); });
  const reA = aiutanti.size ? new RegExp('\\b(?:' + [...aiutanti].join('|') + ')\\s*\\(') : null;
  const defA = aiutanti.size ? new RegExp('(?:const|let|function)\\s+(?:' + [...aiutanti].join('|') + ')\\b') : null;
  const out = [];
  L.forEach((r, i) => {
    const legge = LETTURA_395.test(r) || (reA && reA.test(r) && !defA.test(r));
    if (!legge) return;
    const pos = LETTURA_395.test(r) ? r.search(LETTURA_395) : r.search(reA);
    for (let k = 0; k <= 2; k++) {
      const s = k ? L[i - k] : r.slice(0, pos);
      if (s == null) break;
      if (k && /waitForFunction|attendiSalvataggio395\(|\b(?:for|while)\s*\(/.test(s)) break;/* un'attesa dell'evento in mezzo chiude la ricerca */
      const m = s.match(ATTESA_395);
      if (m && (/\b(?:break|continue)\b/.test(s) || /\b(?:for|while)\s*\(/.test(s))) break;
      if (m) { out.push({ riga_attesa: i + 1 - k, riga_lettura: i + 1, attesa: m[0], testo: r.trim().slice(0, 160) }); break; }
    }
  });
  return out;
}
