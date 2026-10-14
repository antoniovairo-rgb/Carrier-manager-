#!/usr/bin/env node
/* [collaudo release 7.999.164] Lettura dei dati della sonda collaudo-164-partite.mjs. Sola lettura, nessun browser.
   Uso: node collaudo-164-analisi.mjs [cartella dati]   (default docs/collaudi/release-164/dati)
   Stampa per partita: contesto, panchina, ingresso, scene (apertura/esito/3D/portiere), tabellone contro tabellino, statistiche,
   finestre, intervista, fluidita'; e per settimana: classifica e calendario. I criteri di giudizio sono scritti accanto a ogni riga. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = process.argv[2] || path.join(REPO, 'docs', 'collaudi', 'release-164', 'dati');
const rd = f => { try { return fs.readFileSync(path.join(DIR, f), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { return []; } };
const P = rd('partite.jsonl'), S = rd('settimane.jsonl'), I = rd('interviste.jsonl'), F = rd('finestre.jsonl'), NC = rd('non-convocato.jsonl'), B = rd('blocchi.jsonl');
const LINEA = 98.6, PALO = 3.35 / 0.68; /* coordinate logiche di __CPM_BALL: linea di porta a x 98,6, pali a |y-50| <= 4,93 */
const out = [];
const coerenza3D = s => { const e = s.esito, b = s.ballFine; if (!e || !b) return 'n.d.';
  if (s.g164) { const g = s.g164; const gol = (e.ev || []).some(x => /^gol\(/.test(x)) || e.fam === 'goal';
    if (!g.n) return 'n.d. (nessun campione in pagina)';
    if (gol) return g.inRete ? `ok (in rete, ${g.campioniInRete} campioni)` : `GOL SENZA PALLONE IN RETE (x max ${g.maxX}, ${g.n} campioni)`;
    if (g.inRete) return `PALLONE IN RETE con esito ${e.fam || e.key} (${g.campioniInRete} campioni su ${g.n}, x max ${g.maxX})`;
    if (e.fam === 'saved') return s.gk && s.gk.gest ? `ok (gesto ${s.gk.gest}, x max ${g.maxX})` : `parata senza gesto del portiere registrato (x max ${g.maxX})`;
    return `ok (x max ${g.maxX})`; }
  return 'NON GIUDICATO (giro senza interruttori del telefono: scena chiusa prima della fine dell arco)';
  const inRete = b.x >= LINEA && Math.abs(b.y - 50) <= PALO;
  const golMotore = (e.ev || []).some(x => /^gol\(/.test(x));
  if (e.fam === 'goal' || /^goal/.test(e.key || '') || golMotore) return (inRete || s.ballMaxX >= LINEA) ? `ok (x massima ${s.ballMaxX})` : `DUBBIO: gol, pallone mai oltre x ${s.ballMaxX} (fine a x ${b.x} y ${b.y})`;
  if (inRete) return `DUBBIO: pallone in rete (x ${b.x} y ${b.y}) con esito ${e.fam || e.key}`;
  if (e.fam === 'wide') return (b.x >= LINEA - 1 || s.ballMaxX >= LINEA - 1) ? 'ok (oltre la linea)' : `DUBBIO: «fuori» ma pallone fermo a x ${b.x}`;
  if (e.fam === 'saved') return s.gk && s.gk.gest ? `ok (gesto ${s.gk.gest})` : 'DUBBIO: parata senza gesto del portiere registrato';
  return 'ok';
};
const contrMotore = s => { const e = s.esito; if (!e) return null; const ev = e.ev || []; const fam = e.fam;
  const t = ev.find(x => x.startsWith('tiro:')); const es = t ? t.split(':')[1].split('(')[0] : null;
  if (ev.some(x => x.startsWith('intercetto')) && /^(blocked|wide|saved|post)$/.test(fam || '')) return 'intercetto del motore raccontato come ' + fam;
  if (fam === 'foul' && !ev.some(x => x.startsWith('fallo'))) return 'fallo nel riquadro senza fallo nel motore';
  if (es && fam) { const m = { fuori: 'wide', saved: 'saved', blocked: 'blocked', post: 'post', gol: 'goal' }[es]; if (m && /^(wide|saved|blocked|post|goal)$/.test(fam) && m !== fam) return 'motore ' + es + ' / riquadro ' + fam; }
  return null; };
for (const m of P) {
  out.push(`\n=== PARTITA ${m.n} · S${m.season} W${m.week} · ${m.md ? (m.md.type || 'lega') + ' g.' + m.md.matchday + ' vs ' + m.md.opp : '?'} · ${m.durS}s · panchina ${m.panchina}`);
  out.push(`  fasi: ${m.fasi.filter(f => !/^hl_/.test(f[0])).map(f => f.join('@')).join(' ')}`);
  const wf = (m.walkFoto || []).filter(Boolean); out.push(`  ingresso: bambini ${JSON.stringify(m.walkHyMax || null)} · fila ${JSON.stringify(m.fila || null)} · foto ${wf.join(', ')}`);
  out.push(`  attese a schermo: ${JSON.stringify(m.caricamenti)}`);
  /* il testimone __CPM_RES218 non scrive sui rigori (handleRigore): la scena eredita allora l'ultima riga della precedente.
     Esito uguale (etichetta+fatti) a quello della scena prima = NON REGISTRATO, non si giudica. */
  m.scene.forEach((s, i) => { const p = m.scene[i - 1]; if (p && s.esito && p.esito && JSON.stringify([s.esito.label, s.esito.ev, s.esito.ovl]) === JSON.stringify([p.esito.label, p.esito.ev, p.esito.ovl])) s.stantio = true; });
  m.scene.forEach((s, i) => { const a = s.apertura || {}; const st = a.st || {}; const dh = st.ball && st.hero ? Math.hypot(st.ball.x - st.hero.x, st.ball.y - st.hero.y).toFixed(1) : '?';
    const w = a.w232 || {}; const e = s.esito || {};
    if (e.nonRegistrato) { out.push(`  scena ${i + 1} (${a.clock}') ESITO NON REGISTRATO dal testimone (giocata «${e.giocata}»): non giudicata${s.foto ? ' · foto ' + s.foto + ', ' + s.fotoEsito : ''}`); return; }
    if (s.stantio) { out.push(`  scena ${i + 1} (${a.clock}') ESITO NON REGISTRATO dal testimone (rigore o percorso senza __CPM_RES218): non giudicata${s.foto ? ' · foto ' + s.foto + ', ' + s.fotoEsito : ''}`); return; }
    if (!m.corpi) out.push(`  scena ${i + 1} (${a.clock}') corpi ${a.corpi ? a.corpi.motivo + (a.corpi.pronti ? '' : ' NON PRONTI') : '?'} cg-mancanti ${w.noCg} tpose ${w.tpose} senzaTesta ${w.senzaTesta} proc ${w.proc} | palla piu' vicina a ${st.held ? st.held.team + '/' + (st.held.role || '-') + ' a ' + st.held.dist : '?'}, dall'eroe ${dh}`);
    out.push(`     «${e.label}» → riquadro «${e.ovl}» (${e.fam}) · motore ${JSON.stringify(e.ev)} · ${contrMotore(s) || 'concordi'} · 3D ${coerenza3D(s)} · portiere ${s.gk ? (s.gk.gest || '-') + ' dz ' + s.gk.dzMax : '?'}${s.foto ? ' · foto ' + s.foto + ', ' + s.fotoEsito : ''}`); });
  if (m.corpi) { const np = m.corpi.filter(c => !c.pronti || c.noCg || c.tpose || c.senzaTesta || c.proc > 0 || !c.n); out.push(`  corpi al primo fotogramma: ${m.corpi.length} scene, non pronte ${np.length} ${np.length ? JSON.stringify(np) : ''}`); }
  const f = m.fine || {}; const sc = f.score || {}; const tb = f.tab || {}; const h = tb.home || {}, a = tb.away || {};
  out.push(`  tabellone ${sc.home}-${sc.away} · tabellino motore ${h.gol}-${a.gol} ${(sc.home === h.gol && sc.away === a.gol) || (sc.home === a.gol && sc.away === h.gol) ? '(uguali)' : 'DIVERSI'} · nota auto216 ${f.t216 ? 'SI: ' + f.t216.txt : 'no'}`);
  out.push(`  stat: tiri ${h.tiri}-${a.tiri} inPorta ${h.inPorta}-${a.inPorta} possesso ${h.possesso}+${a.possesso}=${(h.possesso | 0) + (a.possesso | 0)} passaggi ${h.passaggi}+${a.passaggi}=${(h.passaggi | 0) + (a.passaggi | 0)} cross ${h.cross}+${a.cross}=${(h.cross | 0) + (a.cross | 0)} corner ${h.corner}-${a.corner} falli ${h.falli}-${a.falli} parate ${h.parate}-${a.parate} xg ${h.xg}-${a.xg}`
    + ((h.inPorta | 0) > (h.tiri | 0) || (a.inPorta | 0) > (a.tiri | 0) ? ' · INCOERENTE: in porta > tiri' : '') + ((h.gol | 0) > (h.inPorta | 0) || (a.gol | 0) > (a.inPorta | 0) ? ' · INCOERENTE: gol > tiri in porta' : ''));
  const i226 = f.int226 || {}; out.push(`  interazioni: schede ${JSON.stringify((i226.schede || []).map(x => x.min + "' " + x.fatto))} scelte ${JSON.stringify((i226.scelte || []).map(x => x.min + "' " + x.id + '#' + x.idx))}`);
  out.push(`  finestre in partita: ${JSON.stringify(m.finestre.filter(x => x.dc).map(x => x.min + "' " + x.dc + ' ' + x.cornice + (x.fuori ? ' FUORI' : '') + (x.trunc ? ' tagliato' : '')))}`);
  const iv = I.find(x => x.partita === m.n); out.push(`  dopo il fischio: ${JSON.stringify(m.dopo)} · intervista ${iv ? (iv.intervista === null ? 'NO (' + iv.nota + ')' : 'si, ctx ' + (iv.ctx && iv.ctx.ctx) + ', dopo ' + JSON.stringify(iv.dopo)) : 'n.d.'}`);
  out.push(`  fluidita: ${JSON.stringify(m.fluidita)} · errori pagina ${JSON.stringify(m.errori)}`);
}
out.push('\n=== SETTIMANE');
for (const s of S) out.push(`  S${s.season} W${s.week}: squadre ${s.squadre} gf ${s.gf} ga ${s.ga} ${s.golPari ? 'pari' : 'DIVERSI'} · giocate ${JSON.stringify(s.giocate)} · wdl ${JSON.stringify(s.wdl)} ptsBad ${JSON.stringify(s.ptsBad)} · giornate lega ${JSON.stringify(s.giornateLega)} · settimane con piu' gare ${JSON.stringify(s.settimaneConPiuGare)} · prossime ${JSON.stringify(s.prossime)} · testi ${JSON.stringify(s.testiGiornata)}`);
out.push('\n=== FINESTRE (prima apparizione)');
for (const f of F) out.push(`  [${f.dove}] ${f.dc} «${f.titolo.slice(0, 45)}» cornice ${f.cornice} raggio ${f.raggio} ${f.fuori ? 'FUORI SCHERMO ' : ''}${f.trunc.length ? 'TESTO TAGLIATO ' + JSON.stringify(f.trunc) : ''} pulsanti ${f.pulsanti} ${JSON.stringify(f.etichette.slice(0, 3))} · ${f.foto}`);
if (NC.length) out.push('\n=== NON CONVOCATO\n' + NC.map(x => JSON.stringify(x)).join('\n'));
if (B.length) out.push('\n=== BLOCCHI\n' + B.map(x => JSON.stringify(x).slice(0, 400)).join('\n'));
console.log(out.join('\n'));
