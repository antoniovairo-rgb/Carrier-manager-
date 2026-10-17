/* [giro 41 PO-218/240/250] classificatori condivisi fra esiti-241-censimento.mjs (strumento) ed esiti-241.mjs (guardiano). */
/* ── classificatori: cosa DICE il testo, cosa MOSTRA il 3D ── */
export function catTesto(t) {
  const x = String(t || '').toLowerCase(); const c = new Set(); if (!x) return c;
  if (/portiere|parat|para |para\.|presa|in tuffo|si distende|polpastrell|guant/.test(x)) c.add('portiere');
  if (/murat|muro|si oppone|si mette in mezzo|difensore respinge|respinge il cross|barriera|ribatt/.test(x)) c.add('difensore');
  if (/intercett|anticipat|palla persa|perde il pallone|ti portano via|legge la giocata|chiude in anticipo|recuperata dagli avversari/.test(x)) c.add('intercetto');
  if (/\bpalo\b|traversa|legno/.test(x)) c.add('palo');
  if (/fuori|sul fondo|specchio|sopra la traversa|troppo lung|non ci arriva/.test(x)) c.add('fuori');
  if (/fallo|punizione|steso|calcio piazzato/.test(x)) c.add('fallo');
  if (/filtrant|imbucat/.test(x)) c.add('filtrante');
  if (/conclusione|tentativo|tiro\b/.test(x) && /respint|murat|respinge/.test(x)) c.add('conclusione_respinta');
  return c;
}
export function contraddizioni(r) {
  const out = []; if (!r || !r.v) return ['3D non osservato'];
  const v = r.v, testi = [r.overlay, r.text].filter(Boolean), cats = new Set(); testi.forEach(t => catTesto(t).forEach(c => cats.add(c)));
  const fx = Object.keys(v.fx || {});
  const gk = Object.keys(v.gk || {}).length > 0 || fx.some(f => f.startsWith('gk-')), def = Object.keys(v.def || {}).length > 0 || fx.some(f => f.startsWith('away:')), pa = Object.keys(v.pa || {});
  const ev = r.ev || [], lab = String(r.label || r.l || '').toLowerCase();
  const evTiro = ev.find(e => e.startsWith('tiro:')); const esTiro = evTiro ? evTiro.split(':')[1].split('(')[0] : null;
  if (r.ok === false && v.inNet) out.push('fallito ma il pallone entra IN RETE nel 3D (PO-240 b)');
  if (cats.has('portiere') && !gk && !cats.has('difensore')) out.push('il testo nomina il portiere ma nel 3D il portiere non fa nessun gesto');
  if (cats.has('difensore') && !cats.has('portiere') && v.v === 'blocked' && !def && !gk && /^(shot|header)$/.test(v.ht || '')) out.push('il testo dice murato ma nel 3D nessun difensore si oppone');
  if (cats.has('difensore') && gk && !def && v.v !== 'blocked') out.push('il testo dice murato ma nel 3D interviene il portiere');
  if (cats.has('intercetto') && (esTiro === 'blocked' || (v.v === 'blocked' && /^(shot|freekick|header)$/.test(v.ht || '')))) out.push('il testo dice intercettato/palla persa ma il tiro parte e viene murato');
  if (cats.has('difensore') && !cats.has('intercetto') && ev.some(e => e.startsWith('intercetto')) && !esTiro) out.push('il testo dice murato ma il motore registra un intercetto');
  if (cats.has('filtrante') && /cross|traverson|pennell|palla in area|parabola|mette in mezzo|scodell/.test(lab)) out.push('«filtrante» su un cross/palla in area (PO-250)');
  if (r.ok && r.outKey === 'chance' && (v.pa || {}).cross_goal && gk) out.push('chance: il portiere si tuffa su una consegna in area (PO-250)');
  if (cats.has('conclusione_respinta') && r.ok && r.outKey === 'chance' && !gk && !def) out.push('chance: il testo racconta una conclusione respinta che il 3D non mostra');
  if (cats.has('fallo') && !ev.some(e => e.startsWith('fallo')) && r.outKind !== 'win_freekick') out.push('il testo dice fallo ma il motore non lo registra');
  if (r.outKind === 'win_freekick' && !cats.has('fallo')) out.push('fallo cercato riuscito raccontato senza fallo');
  if (catTesto(r.overlay).has('portiere') && catTesto(r.text).has('difensore') || catTesto(r.overlay).has('difensore') && catTesto(r.text).has('portiere')) out.push('titolo e riga del riquadro si contraddicono');
  return out;
}

