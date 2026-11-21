/* [giro 309 PO-584] SOLA MISURA, node puro. Effetto atteso di una regola d'infortunio proposta contro quella attuale
   (simInjuryRoll, src/18 ~2238, copiata qui alla lettera), su 10.000 stagioni da 38 partite, con la fatica a inizio partita
   presa dalle carriere misurate (gestita ~38, trascurata 78). Le settimane d'assenza seguono le durate attuali. */
let s = 0x309; const R = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const durata = (mf) => { const sev = R(); return (mf > 82 && sev < 0.07) ? 6 + Math.round(R() * 6) : sev < 0.40 ? 3 + Math.round(R() * 2) : 1 + Math.round(R()); };
const attuale = f => { const mf = Math.min(100, f + 12 + Math.round(R() * 10)), r = R(); return ((mf > 82 && r < 0.07) || (mf > 68 && r < 0.03)) ? durata(mf) : 0; };
// proposta: rischio di base per partita giocata + crescita lineare con la fatica sopra 40; la soglia alta resta
const proposta = (base, k) => f => { const mf = Math.min(100, f + 12 + Math.round(R() * 10)), r = R(); const p = base + k * Math.max(0, mf - 40) + (mf > 82 ? 0.03 : 0); return r < p ? durata(mf) : 0; };
const stagione = (regola, f) => { let inj = 0, assenti = 0; for (let m = 0; m < 38; m++) { if (assenti > 0) { assenti--; continue; } const w = regola(f); if (w) { inj++; assenti = w; } } return inj; };
const out = {};
for (const [nome, regola] of [['attuale', attuale], ['base 1,0% + 0,04%/punto', proposta(0.010, 0.0004)], ['base 1,5% + 0,05%/punto', proposta(0.015, 0.0005)]])
  for (const f of [30, 38, 55, 70, 78]) { let t = 0, z = 0; for (let i = 0; i < 10000; i++) { const n = stagione(regola, f); t += n; if (!n) z++; } out[`${nome} · fatica ${f}`] = { infortuniStagione: +(t / 10000).toFixed(2), stagioniSenza: +(z / 10000).toFixed(3) }; }
console.table(out);
