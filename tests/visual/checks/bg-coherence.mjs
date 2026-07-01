/* CHECK — BG CHRONICLE COHERENCE (global, statico)
   Estende l'idea di M3 (coerenza overlay↔3D degli highlight) alla CRONACA DI SFONDO (BG_MATCH):
   la SCRITTA a schermo (⚽ TIRO · ↗ CROSS · 🧤 PARATA · 💥 CONTRASTO · → PASSAGGIO) deve essere
   coerente con l'AZIONE PRIMARIA descritta dal testo della riga.

   Il tipo d'azione risolto = ev.at (se presente) altrimenti BG_ARC_MAP[ev.pd]. 'at' decide label+arco
   indipendentemente da 'pd' (che resta per la FORMA della squadra) → si può correggere la label senza
   sballare il posizionamento.

   FAIL (bloccante): (1) strutturale — at/pd/arc fuori dominio, label mancante; (2) contraddizioni
   UNIVOCHE ad alta precisione (passaggio con label TIRO, tackle con label PASSAGGIO, cross con label TIRO).
   WARNING (non bloccante): euristica soft che segnala righe sospette da rivedere a mano.
   Legge window.__CPM_BG (esposto dal gioco). */

const BG_ARC_MAP = { attack_goal: 'shot', attack: 'shot', wide_right: 'cross', opp_goal: 'save', defend_goal: 'save', retreat: 'tackle', midfield: 'pass' };
const ARC_SET = new Set(['shot', 'cross', 'save', 'tackle', 'pass']);
const PD_SET = new Set(Object.keys(BG_ARC_MAP).concat(['none'])); // pd validi (+ nessuno)
const LABEL = { shot: '⚽ TIRO', cross: '↗ CROSS', save: '🧤 PARATA', tackle: '💥 CONTRASTO', pass: '→ PASSAGGIO' };

export default {
  id: 'bg-coherence',
  title: 'BG chronicle coherence (testo↔azione)',
  scope: 'global',
  run({ bg }) {
    const issues = [], warnings = [];
    if (!Array.isArray(bg) || bg.length === 0) {
      return { pass: true, issues: [], warnings: ['BG_MATCH non disponibile (window.__CPM_BG) — skip'], info: { entries: 0 } };
    }
    let withPd = 0, withAt = 0; const byArc = {};
    // esclusioni: righe il cui "verbo" NON è un'azione di gioco (recupero=tempo, infortuni, ordini, possesso sterile)
    const EXCL = /recupero concesso|si tocca|polpaccio|crampo|chiede più pressing|possesso steril|si chiude in difesa/i;
    for (const ev of bg) {
      const txt = ev.txt || '';
      const pd = ev.pd || null, at = ev.at || null;
      if (pd) { withPd++; if (!PD_SET.has(pd)) issues.push(`pd fuori dominio: "${pd}" :: ${txt.slice(0, 50)}`); }
      if (at) { withAt++; if (!ARC_SET.has(at)) issues.push(`at fuori dominio: "${at}" :: ${txt.slice(0, 50)}`); }
      const arc = at || (pd ? BG_ARC_MAP[pd] : null);
      if (!arc) continue; // riga di solo testo (nessun arco) → niente label da validare
      byArc[arc] = (byArc[arc] || 0) + 1;
      if (!LABEL[arc]) { issues.push(`nessuna label per arco "${arc}" :: ${txt.slice(0, 50)}`); continue; }
      if (EXCL.test(txt)) continue;

      // ── FAIL ad alta precisione: contraddizioni UNIVOCHE testo↔label ──
      const hasShotWord = /\b(tir[oa]|conclus|destr[oi]|sinistr[oi]|botta|stoccat|bordata|zampata|piattone)\b/i.test(txt);
      // R1 — azione di PASSAGGIO con label TIRO
      if (arc === 'shot' && /(imbucat|filtrant|triangol|verticalizz|pesca \{|\bassist\b)/i.test(txt) && !hasShotWord)
        issues.push(`INCOERENZA: azione di passaggio con label "${LABEL.shot}" → usa at:"pass" :: ${txt.slice(0, 60)}`);
      // R2 — azione di CONTRASTO/RECUPERO con label PASSAGGIO
      if (arc === 'pass' && /(tackle|contrast[oi]|intercett|ruba palla|recupera palla|murat|legge e anticipa|chiude in anticipo|vince il contrasto)/i.test(txt))
        issues.push(`INCOERENZA: azione di contrasto/recupero con label "${LABEL.pass}" → usa at:"tackle" :: ${txt.slice(0, 60)}`);
      // R3 — CROSS con label TIRO
      if (arc === 'shot' && /(^|[\s—-])(cross|traverson|va al traversone)/i.test(txt) && !hasShotWord)
        issues.push(`INCOERENZA: cross con label "${LABEL.shot}" → usa at:"cross" :: ${txt.slice(0, 60)}`);

      // ── WARNING soft: possibili sospetti (non bloccanti) ──
      if (arc !== 'save' && /portiere (salva|respinge|vola|blocca|dice di no)/i.test(txt) && !hasShotWord && !/murat/i.test(txt))
        warnings.push(`possibile PARATA con label "${LABEL[arc]}" :: ${txt.slice(0, 55)}`);
      if (arc !== 'cross' && /\bcross\b|traverson/i.test(txt) && !hasShotWord)
        warnings.push(`possibile CROSS con label "${LABEL[arc]}" :: ${txt.slice(0, 55)}`);
    }
    return { pass: issues.length === 0, issues, warnings, info: { entries: bg.length, withPd, withAt, byArc } };
  },
};
