/* CHECK 1 — DETERMINISMO (global)
   Stessa seed → stesso risultato. Confronta la FIRMA DI STATO di un campione di Situations
   tra la passata principale (pass1) e una ri-cattura indipendente. Con __CPM_RESEED(gi) la
   firma {htx,hty,poss,cam,ch,ca} è esattamente riproducibile: qualunque divergenza = bug. */
import { sigStr, sigEq } from '../lib/harness.mjs';
export default {
  id: 'determinism',
  title: 'Determinismo (seed → firma stabile)',
  scope: 'global',
  // recapture(gi) → Promise<sig>; pass1[gi] = firma della passata principale
  async run({ pass1, recapture, sampleIndices }) {
    const issues = []; let diverged = 0;
    for (const gi of sampleIndices) {
      const s2 = await recapture(gi);
      if (!sigEq(pass1[gi], s2)) { diverged++; issues.push(`Situation ${gi}: firma divergente tra due run · run1 ${sigStr(pass1[gi])} · run2 ${sigStr(s2)} — NON deterministico`); }
    }
    return { pass: issues.length === 0, issues, info: { sampled: sampleIndices.length, diverged } };
  }
};
