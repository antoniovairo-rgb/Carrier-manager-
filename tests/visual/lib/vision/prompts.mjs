/* AI VISION REVIEW — PROMPT (AI_VISION_REVIEW.md §ANALISI AI)
   Prompt NON hardcodato nel Core: di default qui, override via file (VISION_PROMPT_FILE).
   Chiede al modello un JSON STRETTO con tutte le dimensioni → l'Engine fa scoring. */
import fs from 'node:fs';
import { DIMENSIONS } from './scoring.mjs';

const DEFAULT_TEMPLATE = `Sei il revisore QA percettivo di un motore di Live Match calcistico 3D (secondo livello, non blocchi la CI).
Ti vengono mostrati SCREENSHOT STATICI in sequenza di UNO stesso highlight. I frame sono in quest'ordine: begin · preparation · main (impatto) · outcome · post. L'ULTIMO frame È il post-highlight.
Situation attesa: "{{SITUATION}}" (intent: {{INTENT}}).
Valuta quanto l'highlight rappresenta in modo CREDIBILE, LEGGIBILE e CALCISTICAMENTE corretto l'azione attesa.

CONTESTO DEL MEDIUM (leggi prima di assegnare i punteggi):
- È un gioco browser a FILE SINGOLO con un motore 3D LEGGERO: la grafica è VOLUTAMENTE stilizzata/low-poly. NON penalizzare la fedeltà grafica come se fosse un titolo AAA: valuta LEGGIBILITÀ e CORRETTEZZA CALCISTICA dell'azione rispetto a questo medium. Modelli semplici e ombre basilari sono NORMALI, non difetti.
- Il gioco NON ha audio. "commentaryConsistency" valuta la COERENZA del TESTO a schermo (cronaca/HUD: es. "DOMINIO!", "+1 rating", il punteggio) con l'azione mostrata — NON l'assenza di commento audio. Se non c'è testo rilevante, dai un valore NEUTRO (~50), mai 0 per "manca l'audio".
- Stai giudicando FOTOGRAMMI STATICI: non puoi misurare davvero fluidità/animazione fotogramma-per-fotogramma. Stima fluidity/animationQuality dalla plausibilità delle pose, senza penalizzare l'assenza di movimento percepibile tra due still.
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

export function buildPrompt(context, opts = {}) {
  let tpl = DEFAULT_TEMPLATE;
  const file = opts.promptFile;
  if (file) { try { tpl = fs.readFileSync(file, 'utf8'); } catch (_e) { /* fallback al default */ } }
  const dims = DIMENSIONS.map(d => `"${d}": 0`).join(', ');
  return tpl
    .replace('{{SITUATION}}', (context && context.text) || '?')
    .replace('{{INTENT}}', (context && context.intent) || '?')
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
