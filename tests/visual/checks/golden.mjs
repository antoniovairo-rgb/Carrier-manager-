/* CHECK — GOLDEN REGRESSION (per-situation, su firma di stato deterministica)
   Confronta la firma {htx,hty,poss,cam,ch,ca} con la baseline committata (golden-sigs.json).
   "stesso seed → stesso hash finale": qualunque differenza = regressione logica/posizionale. */
import { sigStr, sigEq } from '../lib/harness.mjs';
export default {
  id: 'golden',
  title: 'Golden regression (firma stato)',
  scope: 'situation',
  run({ sig, goldenBase }) {
    if (goldenBase == null) return { pass: true, issues: [] }; // baseline assente → la genera l'orchestratore
    if (!sigEq(sig, goldenBase)) return { pass: false, issues: [`firma divergente dalla baseline · atteso ${sigStr(goldenBase)} · ottenuto ${sigStr(sig)}`] };
    return { pass: true, issues: [] };
  }
};
