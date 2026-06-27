/* AI VISION REVIEW — PROMPT (AI_VISION_REVIEW.md §ANALISI AI)
   Prompt NON hardcodato nel Core: di default qui, override via file (VISION_PROMPT_FILE).
   Chiede al modello un JSON STRETTO con tutte le dimensioni → l'Engine fa scoring. */
import fs from 'node:fs';
import { DIMENSIONS } from './scoring.mjs';

const DEFAULT_TEMPLATE = `Sei il revisore QA percettivo di un motore di Live Match calcistico 3D (secondo livello, non blocchi la CI).
Ti vengono mostrati alcuni FRAME in sequenza di UNO stesso highlight (fasi: inizio · preparazione · evento principale · esito · post-highlight).
Situation attesa: "{{SITUATION}}" (intent: {{INTENT}}).
Valuta quanto l'highlight rappresenta in modo CREDIBILE, LEGGIBILE e CALCISTICAMENTE corretto l'azione attesa.
Rispondi con SOLO un JSON valido (nessun testo fuori dal JSON), schema ESATTO:
{
  "situationRecognition": { "recognized": "<cosa accade, breve>", "matchesExpected": true|false },
  "scores": { {{DIMS}} },
  "confidence": 0-100,
  "errors": ["..."], "warnings": ["..."], "suggestions": ["..."],
  "rootCause": "<causa principale di eventuali problemi, o vuoto>",
  "verdict": "PASS"|"WARNING"|"FAIL"
}
Ogni punteggio in scores è 0-100 (0=pessimo, 100=perfetto). Sii severo e specifico.`;

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
