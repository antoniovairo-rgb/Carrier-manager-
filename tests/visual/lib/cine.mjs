/* Estrae i motori CINEMATICI puri (deriveHL · buildHLTimeline · validateHLTimeline) dal sorgente,
   per validare node-side il BACKBONE narrativo di TUTTE le situations (non solo le 23 live del gate).
   deriveHL legge sit.ballState/sit.cine (congelati in S()) → forniamo hlBallState/deriveSitCine minimali;
   buildHLTimeline usa clamp. Stessa tecnica di situations.mjs/decision.mjs (zero re-implementazione). */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';

export function loadCine() {
  const html = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8');
  const lines = html.split(/\r?\n/);
  const grab = (re) => {
    const s = lines.findIndex(l => re.test(l));
    if (s < 0) throw new Error('cine: funzione non trovata ' + re);
    let e = -1; for (let i = s + 1; i < lines.length; i++) { if (/^\}/.test(lines[i])) { e = i; break; } }
    return lines.slice(s, e + 1).join('\n');
  };
  const code =
    'const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\n' +
    'const hlBallState=(sit)=>(sit&&sit.ballState!=null)?sit.ballState:"feet";\n' +
    'const deriveSitCine=(sit)=>(sit&&sit.cine)||{};\n' +
    grab(/^function deriveHL\(sit,act\)\{/) + '\n' +
    grab(/^function buildHLTimeline\(hl,o\)\{/) + '\n' +
    grab(/^function validateHLTimeline\(tl,hl\)\{/) + '\n' +
    'return { deriveHL, buildHLTimeline, validateHLTimeline };';
  // eslint-disable-next-line no-new-func
  return Function(code)();
}
