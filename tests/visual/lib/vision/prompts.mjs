/* AI VISION REVIEW — PROMPT (AI_VISION_REVIEW.md §ANALISI AI)
   Prompt NON hardcodato nel Core: di default qui, override via file (VISION_PROMPT_FILE).
   Chiede al modello un JSON STRETTO con tutte le dimensioni → l'Engine fa scoring. */
import fs from 'node:fs';
import { DIMENSIONS } from './scoring.mjs';

const DEFAULT_TEMPLATE = `Sei il revisore QA percettivo di un motore di Live Match calcistico 3D (secondo livello, non blocchi la CI).
Ti vengono mostrati SCREENSHOT STATICI in sequenza di UNO stesso highlight. I frame sono in quest'ordine: begin · preparation · main (impatto) · outcome · post. L'ULTIMO frame È il post-highlight.
Situation attesa: "{{SITUATION}}" (intent: {{INTENT}}).
ESITO DICHIARATO DAL GIOCO: {{ESITO}}.
Valuta quanto l'highlight rappresenta in modo CREDIBILE, LEGGIBILE e CALCISTICAMENTE corretto l'azione attesa.

CONTESTO DEL MEDIUM (leggi prima di assegnare i punteggi):
- È un gioco browser a FILE SINGOLO con un motore 3D LEGGERO: la grafica è VOLUTAMENTE stilizzata/low-poly. NON penalizzare la fedeltà grafica come se fosse un titolo AAA: valuta LEGGIBILITÀ e CORRETTEZZA CALCISTICA dell'azione rispetto a questo medium. Modelli semplici e ombre basilari sono NORMALI, non difetti.
- Il gioco NON ha audio. "commentaryConsistency" valuta la COERENZA del TESTO a schermo (cronaca/HUD: es. "DOMINIO!", "+1 rating", il punteggio) con l'azione mostrata — NON l'assenza di commento audio. Se non c'è testo rilevante, dai un valore NEUTRO (~50), mai 0 per "manca l'audio".
- Stai giudicando FOTOGRAMMI STATICI: non puoi misurare davvero fluidità/animazione fotogramma-per-fotogramma. Stima fluidity/animationQuality dalla plausibilità delle pose, senza penalizzare l'assenza di movimento percepibile tra due still.
- L'ESITO DICHIARATO E' IL METRO, NON L'INTENT. La domanda a cui rispondi e': la scena mostra CIO' CHE IL GIOCO HA DICHIARATO? Se l'esito dichiarato e' un FALLIMENTO (palla persa, contrasto subito, tiro parato, intercetto), allora un'azione che finisce con la palla persa e' CORRETTA e va valutata bene: e' calcio, non un difetto. Non scrivere mai «l'intent non e' soddisfatto» quando l'esito dichiarato e' un fallimento — l'intent descrive cio' che l'azione TENTAVA, non cio' che doveva riuscire. Segnala un errore solo se la scena contraddice l'esito dichiarato (gol dichiarato e palla che non arriva in porta, o viceversa).
- ARTEFATTI DI CATTURA: se un frame è NERO/vuoto, oppure mostra una schermata di RIEPILOGO partita (statistiche, "FISCHIO FINALE", valutazione, "Risultati") invece dell'azione 3D, è un ARTEFATTO DELLA PIPELINE DI CATTURA, non un difetto del gioco. Segnalalo in "warnings" e basa il giudizio dell'azione sui SOLI frame 3D validi; non azzerare l'intera valutazione solo per questo.

Rispondi con SOLO un JSON valido (nessun testo fuori dal JSON), schema ESATTO:
{
  "situationRecognition": { "recognized": "<cosa accade, breve>", "matchesExpected": true|false },
  "scores": { {{DIMS}} },
  "confidence": 0-100,
  "errors": ["..."], "warnings": ["..."], "suggestions": ["..."],
  "rootCause": "<causa principale di eventuali problemi, o vuoto>",
  "verdict": "PASS"|"WARNING"|"FAIL"
}
Ogni punteggio in scores è 0-100 (0=pessimo, 100=perfetto). Sii severo e specifico, ma calibrato sul medium descritto sopra.`;

/* [BL-19 · VIDEO CONTINUO] template MOVIMENTO: i frame sono un FILMSTRIP ORDINATO (video) dello stesso
   highlight, non 5 fasi discrete. Qui l'AI PUÒ e DEVE giudicare la dinamica temporale — ciò che la modalità
   a fotogrammi non poteva. Schema JSON identico (lo scoring resta lo stesso), ma la lente è il MOVIMENTO. */
const VIDEO_TEMPLATE = `Sei il revisore QA percettivo di un motore di Live Match calcistico 3D (secondo livello, non blocchi la CI).
Ti viene mostrata una SEQUENZA ORDINATA DI FOTOGRAMMI (un FILMSTRIP / mini-video) di UNO stesso highlight, dal primo (f00) all'ultimo, campionati a passo costante nel tempo. Leggendoli IN ORDINE ricostruisci il MOVIMENTO.
Situation attesa: "{{SITUATION}}" (intent: {{INTENT}}).
ESITO DICHIARATO DAL GIOCO: {{ESITO}}.
Valuta la DINAMICA TEMPORALE dell'azione: quanto il movimento è fluido, continuo e calcisticamente credibile.

COSA GIUDICARE (è un video, non foto statiche — QUI la fluidità si misura DAVVERO):
- FLUIDITÀ (fluidity/animationQuality): il movimento di giocatori e palla tra frame consecutivi è CONTINUO e progressivo? Cerca SCATTI, salti bruschi, TELEPORT (un oggetto che sparisce e riappare lontano tra due frame adiacenti), pose che si "resettano".
- TRAIETTORIA DELLA PALLA: l'arco della palla è coerente e continuo frame-per-frame (accelera/decelera in modo naturale), oppure fa balzi/inversioni innaturali?
- TEMPI (timing): l'ESITO (testo/HUD: gol, parata, punteggio) compare COERENTE col 3D — non PRIMA che l'azione 3D si concluda, non molto DOPO. Un esito che anticipa il movimento è un difetto di sincronia.
- POSE INTERMEDIE: i fotogrammi intermedi mostrano una progressione plausibile (rincorsa→impatto→follow-through), non due pose slegate.

CONTESTO DEL MEDIUM (leggi prima dei punteggi):
- Gioco browser a file singolo, motore 3D LEGGERO: grafica VOLUTAMENTE stilizzata/low-poly. Valuta LEGGIBILITÀ e CORRETTEZZA del MOVIMENTO, non la fedeltà AAA. Modelli semplici e ombre basilari sono NORMALI.
- Nessun audio: "commentaryConsistency" = coerenza del TESTO a schermo con l'azione, valore NEUTRO (~50) se non c'è testo rilevante, mai 0 per "manca l'audio".
- L'ESITO DICHIARATO E' IL METRO, NON L'INTENT. La domanda a cui rispondi e': la scena mostra CIO' CHE IL GIOCO HA DICHIARATO? Se l'esito dichiarato e' un FALLIMENTO (palla persa, contrasto subito, tiro parato, intercetto), allora un'azione che finisce con la palla persa e' CORRETTA e va valutata bene: e' calcio, non un difetto. Non scrivere mai «l'intent non e' soddisfatto» quando l'esito dichiarato e' un fallimento — l'intent descrive cio' che l'azione TENTAVA, non cio' che doveva riuscire. Segnala un errore solo se la scena contraddice l'esito dichiarato (gol dichiarato e palla che non arriva in porta, o viceversa).
- ARTEFATTI DI CATTURA: un frame NERO/vuoto o una schermata di RIEPILOGO (statistiche/"FISCHIO FINALE") in mezzo alla sequenza è un artefatto della cattura (a volte un frame è ripetuto per coprire un buco): segnalalo in "warnings", NON contarlo come uno "scatto" del gioco né azzerare la valutazione.
- STACCHI DI REGIA (leggi PRIMA di dichiarare un teleport): il gioco usa STACCHI NERI deliberati (340-560 ms) per mascherare i riposizionamenti — gol, ripartenza dal centro, cambio scena, montaggio dell'esito. Misurato sul motore: i riposizionamenti secchi del pallone avvengono DENTRO questi stacchi (4 su 4 nell'ultimo censimento). Quindi: un cambio di posizione di giocatori/palla/camera A CAVALLO di un frame scuro o subito dopo è un TAGLIO DI MONTAGGIO VOLUTO, non un teleport — è la stessa grammatica di una regia TV. Chiama "teleport" SOLO un salto fra due frame adiacenti ENTRAMBI luminosi e della stessa inquadratura. Il campionamento è ~110 ms per frame: un oggetto veloce percorre distanza reale fra due frame — velocità per intervallo non è un teletrasporto.

Rispondi con SOLO un JSON valido (nessun testo fuori dal JSON), schema ESATTO:
{
  "situationRecognition": { "recognized": "<cosa accade nel movimento, breve>", "matchesExpected": true|false },
  "scores": { {{DIMS}} },
  "confidence": 0-100,
  "errors": ["..."], "warnings": ["..."], "suggestions": ["..."],
  "rootCause": "<causa principale di eventuali problemi di movimento, o vuoto>",
  "verdict": "PASS"|"WARNING"|"FAIL"
}
Ogni punteggio in scores è 0-100 (0=pessimo, 100=perfetto). Sii severo e specifico sul MOVIMENTO, calibrato sul medium.`;

export function buildPrompt(context, opts = {}) {
  let tpl = (context && context.mode === 'video') ? VIDEO_TEMPLATE : DEFAULT_TEMPLATE;
  const file = opts.promptFile;
  if (file) { try { tpl = fs.readFileSync(file, 'utf8'); } catch (_e) { /* fallback al default/video */ } }
  const dims = DIMENSIONS.map(d => `"${d}": 0`).join(', ');
  return tpl
    .replace('{{SITUATION}}', (context && context.text) || '?')
    .replace('{{INTENT}}', (context && context.intent) || '?')
    .replace('{{ESITO}}', (context && context.esito)
      ? `${context.esito.ok ? 'RIUSCITA' : 'FALLITA'} — chiave "${context.esito.key || '?'}"${context.esito.testo ? ` («${context.esito.testo}»)` : ''}`
      : 'non disponibile (giudica solo la coerenza interna della scena)')
    .replace('{{DIMS}}', dims);
}

// estrae il primo oggetto JSON dal testo del modello (robusto a testo extra)
export function parseModelJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_e) { /* prova a isolare */ }
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (_e) { return null; }
}
