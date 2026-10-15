#!/usr/bin/env node
/* Tabelle e quote del RAPPORTO-difesa-220 dai dati grezzi del collaudo (collaudo-difesa-220-3d.mjs). Solo lettura/formattazione.
   Uso: node collaudo-difesa-220-rapporto.mjs flow.jsonl[,flow2.jsonl..] forced.jsonl > tabelle.md */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [flowArg, forcedArg, cappedArg] = process.argv.slice(2);
const carica = (lista) => (lista || '').split(',').filter(Boolean).flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(r => JSON.parse(r)));
const analizza = (f) => { const tmp = f + '.ana'; const out = execFileSync('node', ['collaudo-difesa-220-3d.mjs'], { env: { ...process.env, ANALIZZA: f }, maxBuffer: 1 << 28 }).toString(); return out.split('\n').filter(Boolean).map(r => JSON.parse(r)); };
const unisci = (lista) => { const tmp = `/tmp/claude-0/unione-${Math.random().toString(36).slice(2)}.jsonl`; fs.mkdirSync('/tmp/claude-0', { recursive: true }); fs.writeFileSync(tmp, carica(lista).map(r => JSON.stringify(r)).join('\n') + '\n'); const a = analizza(tmp); fs.unlinkSync(tmp); return a; };
const V = flowArg ? unisci(flowArg) : [], F = forcedArg ? unisci(forcedArg) : [], C = cappedArg ? unisci(cappedArg) : [];
const n1 = (x) => (x == null || Number.isNaN(x)) ? '—' : String(x).replace('.', ',');
const med = (a) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : null; };
const q = (a, p) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : null; };
const pc = (a, b) => b ? `${a}/${b} (${Math.round(100 * a / b)}%)` : '—';
const riga = (a) => {
  if (a.errore) return `| ${a.id} | ${a.lbl || '—'} | — | — | — | — | — | — | non giudicabile |`;
  
  const comp = (a.compBody ? 'CORPO ' : '') + (a.compPalla ? 'PALLA ' : '') || '';
  const dich = (typeof a.ok === 'boolean' ? (a.ok ? 'recuperata' : 'fallita') : '?') + (a.kind ? ` (${a.kind})` : '');
  const d3 = `+1 s ${a.p1.chi}${a.p1.chi === 'nessuno' ? ` (${n1(a.p1.dNostri)}/${n1(a.p1.dLoro)})` : ''} · +2 s ${a.p2.chi}${a.p2.chi === 'nessuno' ? ` (${n1(a.p2.dNostri)}/${n1(a.p2.dLoro)})` : ''}${a.esitoCompleto ? '' : ' †'}`;
  return `| ${a.id} | ${(a.lbl || '—').replace(/\|/g, '/')} (${a.gEff || a.defGesto || '—'}) | ${a.fam === 'forzata' ? 'n/d' : n1(a.dHeroPortC)} / ${n1(a.dHeroPalC)} | ${a.ritardoPalla == null ? (a.esitoCompleto ? 'mai' : '>scena') : n1(a.ritardoPalla)} | ${n1(a.minHeroAvv)} / ${n1(a.minHeroPal)}${comp ? ' ⚠ ' + comp.trim() : ''} | ${dich} | ${d3} | ${a.Bforte ? '**NO**' : (a.Bindet ? 'indet.' : 'sì')} | ${a.gravita} |`;
};
const intest = '| Scena | Etichetta (gesto) | d eroe–portatore / eroe–palla al contatto (u) | Ritardo palla (s) | Distanza minima eroe–avversario / eroe–palla (u) | Esito dichiarato | Chi ha il pallone nel 3D | Esito = 3D? | Gravità |\n|---|---|---|---|---|---|---|---|---|';
const stat = (T, etich) => {
  const code = T.filter(a => a.coda), mai0 = T.filter(a => a.errore && !a.coda); T = T.filter(a => !a.coda); const ok = T.filter(a => !a.errore); const n = ok.length;
  const dP = ok.map(a => a.dHeroPortC), dB = ok.map(a => a.dHeroPalC), dG0 = ok.map(a => a.dHeroPortG0);
  const rit = ok.filter(a => a.ritardoPalla != null).map(a => a.ritardoPalla);
  const A = ok.filter(a => a.A.some(x => !/^senza-gesto/.test(x))); const Bf = ok.filter(a => a.Bforte), Bi = ok.filter(a => a.Bindet);
  const lont = ok.filter(a => a.fam === 'portatore' && a.dHeroPortC > 3), pal3 = ok.filter(a => a.dHeroPalC > 3), mai = ok.filter(a => a.ritardoPalla == null && a.esitoCompleto), tardi = ok.filter(a => a.ritardoPalla != null && a.ritardoPalla > 0.6);
  const comp = ok.filter(a => a.compBody || a.compPalla), minHP2 = ok.filter(a => a.minHeroAvv > 2);
  const AeB = ok.filter(a => a.A.some(x => !/^senza-gesto/.test(x)) && a.Bforte);
  const complete = ok.filter(a => a.esitoCompleto);
  const righe = [`**${etich}** — ${n} scene giudicabili + ${mai0.length} con il gesto mai arrivato a piena estensione nella scena (${code.length} code duplicate dello strumento scartate).`, '',
    ...(ok.some(a => a.fam === 'portatore') ? [`- eroe–portatore al contatto: mediana ${n1(med(dP))} u · p75 ${n1(q(dP, 0.75))} u · max ${n1(Math.max(...dP))} u · oltre 3 u: ${pc(lont.length, ok.filter(a => a.fam === 'portatore').length)} (scene col portatore come bersaglio)`] : ['- eroe–portatore: non misurabile nelle forzate (il motore non dichiara il portatore)']),
    `- eroe–palla al contatto: mediana ${n1(med(dB))} u · p75 ${n1(q(dB, 0.75))} u · oltre 3 u: ${pc(pal3.length, n)}`,
    ...(ok.some(a => a.fam === 'portatore') ? [`- eroe–portatore a inizio gesto: mediana ${n1(med(dG0))} u`] : []),
    `- ritardo contatto→pallone entro 2 u: mediana ${n1(med(rit))} s fra le ${rit.length} scene in cui arriva · oltre 0,6 s: ${pc(tardi.length, n)} · **mai entro 2 s** (scene con ≥2 s dopo il contatto): ${pc(mai.length, complete.length)}`,
    `- distanza minima eroe–avversario mai sotto 2 u: ${pc(minHP2.length, n)} · compenetrazione (corpi <0,5 u o pallone <0,25 u dal centro eroe): ${pc(comp.length, n)}`,
    `- **Casi (A)** (almeno un indicatore di non-arrivo: lontano/palla>3u/mai/tardi/compenetra): ${pc(A.length, n)}`,
    `- **Casi (B) forti** (esito dichiarato smentito dal possesso a +2 s entro 3 u): ${pc(Bf.length, n)} · indeterminati (nessuno entro 3 u a +2 s): ${pc(Bi.length, n)}`,
    `- (A) e (B) insieme: ${pc(AeB.length, n)}`,
    `- per esito dichiarato — recuperate: ${ok.filter(a => a.ok === true).length} scene, eroe–palla >3 u al contatto ${ok.filter(a => a.ok === true && a.dHeroPalC > 3).length}, scena ≥2 s dopo il contatto ${ok.filter(a => a.ok === true && a.esitoCompleto).length}; fallite: ${ok.filter(a => a.ok === false).length} scene, eroe–palla >3 u ${ok.filter(a => a.ok === false && a.dHeroPalC > 3).length}, scena ≥2 s ${ok.filter(a => a.ok === false && a.esitoCompleto).length}`,
    `- (B) sulle sole scene con esito completo (≥2 s dopo il contatto): forti ${ok.filter(a => a.esitoCompleto && a.Bforte).length}/${ok.filter(a => a.esitoCompleto).length}, indeterminati ${ok.filter(a => a.esitoCompleto && a.Bindet).length}/${ok.filter(a => a.esitoCompleto).length}`];
  return righe.join('\n');
};
console.log('## Tabella A — scene difensive del FLUSSO VERO (partite S12, autoplay seedato, GLB acceso, tempo di scena = tempo reale `__CPM_DTREAL`)\n');
console.log(intest); V.filter(a => !a.coda).forEach(a => console.log(riga(a))); console.log('\n† scena chiusa prima di +2 s dal contatto: «+2 s» è l\'ultimo fotogramma disponibile.\n');
console.log(stat(V, 'Flusso vero')); console.log('');
console.log('## Tabella B — scene SITUATIONS di tipo `def` FORZATE (pagina nuova per scena)\n');
console.log(intest); F.forEach(a => console.log(riga(a))); console.log('');
console.log(stat(F, 'Forzate')); console.log('');
const per = {}; for (const a of F.filter(x => !x.errore)) { (per[a.famSit || '?'] = per[a.famSit || '?'] || []).push(a); }
console.log('**Forzate per famiglia** (bersaglio dell\'eroe): ' + Object.entries(per).map(([f, L]) => `${f}: ${L.length} scene, eroe–palla al contatto mediana ${n1(med(L.map(a => a.dHeroPalC)))} u, (A) ${L.filter(a => a.A.some(x => !/^senza-gesto/.test(x))).length}, (B) ${L.filter(a => a.Bforte).length}`).join(' · '));

if (C.length) { console.log('\n## Tabella C — flusso vero a clock di scena tappato (dt ≤ 0,05 s, ~7 fps headless): campione di controllo\n'); console.log('<details><summary>Righe per scena (' + C.length + ' record)</summary>\n'); console.log(intest); C.filter(a => !a.coda).forEach(a => console.log(riga(a))); console.log('\n</details>\n'); console.log(stat(C, 'Flusso vero, clock tappato')); }
