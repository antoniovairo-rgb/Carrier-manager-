#!/usr/bin/env node
/* [prompt PO «scene dell'eroe: solo ciò che il 3D sa disegnare» — Passo 1, censimento AUTOMATICO] Per ogni situation e ogni azione:
   famiglia/variante risolte da deriveHL (la funzione del gioco), gesto difensivo dichiarato (defGesto), clip della tabella GESTI (hook
   __CPM_GESTI) e clip FISICA montata sul corpo CGTrader dell'eroe (mappa _mkGestures, copiata qui sotto — da tenere allineata).
   Poi i GESTI PROMESSI dal testo (etichetta dell'azione + testo e intro della situation) contro il REGISTRO dei gesti disegnabili.
   Verdetto: fedele · approssimata · non disegnabile. Scrive ../character-lab/CENSIMENTO_SCENE.md e .json. Sola lettura. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
/* clip fisica per chiave di gesto sul corpo CGTrader (src/12 _mkGestures, r.~1295/1320) + varianti Mixamo (_VAR23) e tiro caricato 7.999.34 */
const CLIP = { kick: 'kick (+ tiro in corsa mx-strike-foward-jog per l\'eroe)', penalty: 'penalty', header: 'header', tackle: 'slide-tackle/tackle', volley: 'volley (+ mx-scissor-kick su «rovesciata/sforbiciata»)', receive: 'receive',
  dribble: 'dribble', pass: 'pass', cross: 'pass', shortPass: 'pass', longPass: 'pass', heel: 'pass', doubleStep: 'dribble', feint: 'change-direction', change: 'change-direction', null: '(nessuna: locomozione)' };
/* REGISTRO dei gesti PROMESSI riconoscibili nel testo → come li rende il 3D oggi. f = fedele (clip dedicata o traiettoria distinta),
   a = approssimata (gesto vicino ma riconoscibilmente diverso), n = non disegnabile. Giudizio mio, dichiarato: da validare col PO. */
const PROMESSE = [
  ['roulette', /roulette|ruleta|veronica|marsiglia/i, 'n', 'nessuna giravolta sul pallone: finta generica (change-direction)'],
  ['hocus_pocus', /hocus|pocus/i, 'n', 'nessun colpo dietro la gamba d\'appoggio'],
  ['elastico', /elastic|flip.?flap/i, 'n', 'nessun elastico: finta generica'],
  ['tunnel', /tunnel|in mezzo alle gambe|fra le gambe|tra le gambe/i, 'n', 'il pallone non passa fra le gambe del difensore'],
  ['sombrero', /sombrero|scavalc\w* (il|l')?(difensor|avversari|marcat)|sopra la testa/i, 'n', 'nessun pallonetto sopra l\'avversario in dribbling'],
  ['step_over', /step.?over|doppio passo|pedalat|bicicletta/i, 'a', 'clip dribble (tocchi, non le pedalate)'],
  ['rabona', /rabona/i, 'n', 'nessuna rabona: cross normale'],
  ['tacco', /\btacc(o|hetto)\b|colpo di tacco/i, 'n', 'clip pass: nessun colpo di tacco'],
  ['petto', /di petto|stop di petto|controllo di petto|col petto/i, 'n', 'ricezione normale, nessun controllo di petto'],
  ['coscia', /di coscia/i, 'n', 'nessun controllo di coscia (clip in prova, non collegata)'],
  ['velo', /\bvelo\b|lascia scorrere|finta di (ricevere|calciare) e lascia/i, 'n', 'nessun gesto: locomozione'],
  ['rovesciata', /rovesciat|sforbiciat/i, 'f', 'mx-scissor-kick sulle etichette «rovesciata/sforbiciata» (7.999.19)'],
  ['acrobatico', /acrobatic/i, 'a', '«acrobatico» senza rovesciata/sforbiciata nell\'etichetta: clip volley, non un gesto acrobatico'],
  ['volee', /vol[eé]e|al volo|di controbalzo|mezza vol/i, 'f', 'clip volley'],
  ['testa', /di testa|incornat|stacco|colpo di testa|tuffo di testa|testa/i, 'f', 'clip header + stacco sincronizzato (7.999.33)'],
  ['cucchiaio', /cucchiaio|scavetto|pallonett|panenka|chip/i, 'f', 'traiettoria a campana'],
  ['giro', /a giro|esterno|trivela|effetto|a rientrare/i, 'f', 'traiettoria curva + clip del tiro'],
  ['tiro', /\btir|conclu|botta|bomba|stoccata|sassata|piattone|collo pieno|di potenza/i, 'f', 'tiro caricato (7.999.34)'],
  ['passaggio', /passagg|filtrant|imbucat|lancio|appoggi|sponda|scarico|sventagl|triangol|uno.?due|dai e vai|assist/i, 'f', 'clip pass'],
  ['cross', /cross|traversone|mette in mezzo|palla in mezzo|dal fondo/i, 'f', 'clip pass con parabola'],
  ['controllo', /\bstop\b|controll|addomestic|riceve|ricezione|aggancio|protegg/i, 'a', 'clip receive (controllo generico)'],
  ['dribbling', /dribbl|finta|salta l'uomo|supera|serpentina|slalom|spunto|accelerazion|scatt|progress|conduc|avanza|porta palla/i, 'a', 'clip dribble / change-direction (gesto generico)'],
  ['contrasto', /contrast|tackle|scivolat|intercett|recuper|anticip|chiud|ferma|blocc|mura/i, 'f', 'clip tackle/slide-tackle'],
  ['pressing', /press|raddopp|aggred|accorc|marcat|tallon/i, 'a', 'locomozione verso il portatore (nessun gesto di pressione)'],
  ['comando', /organizza la difesa|guida i compagni|chiama il compagno|chiamo il compagno|urla|comunic|comand|dirig|sistema la difesa|copri la linea|linea alta|tieni la linea|allineati/i, 'n', 'nessun gesto di comando: l\'eroe corre'],
  ['fallo_cercato', /simul|cerca il fallo|guadagna.*(fallo|punizione|rigore)|provocat|si lascia cadere|tuffo in area/i, 'f', 'caduta (7.999.8)'],
  ['rigore', /rigore|dal dischetto/i, 'f', 'clip penalty'],
  ['punizione', /punizion|calcio piazzato/i, 'f', 'clip del tiro/penalty sul piazzato'],
  ['rimessa', /rimessa/i, 'f', 'clip throwin'],
  ['spazzata', /spazz|rinvi|allontan/i, 'f', 'clip kick'],
  ['temporeggia', /temporeggi|tieni palla|gestisci|conserva|rallenta|attendi/i, 'a', 'locomozione / dribble lento'],
];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Censimento' }); await sleep(1500);
const D = await page.evaluate(() => { const out = [];
  for (let gi = 0; gi < SITUATIONS.length; gi++) { const s = SITUATIONS[gi]; const acts = [];
    for (let ai = 0; ai < (s.actions || []).length; ai++) { const a = s.actions[ai]; let hl = null; try { hl = deriveHL(s, a); } catch (e) { hl = { err: String(e.message).slice(0, 60) }; }
      const g = hl && hl.type ? window.__CPM_GESTI(hl.type, hl.variant) : null;
      acts.push({ ai, label: a.label, stat: a.stat, rew: a.rew, fail: a.fail, defGesto: a.defGesto || null, gkCall: !!a.gkCall, fam: hl && hl.type, variante: hl && hl.variant, clipKey: g ? g.clip : null, prof: g ? g.prof : null }); }
    out.push({ gi, text: s.text, intro: s.intro || '', type: s.type, zone: (s.zones || [])[0], acts }); }
  const G = window.__CPM_GESTI(); return { sit: out, gesti: G }; });
await b.close(); srv.close();
/* varianti dichiarate in GESTI e quelle effettivamente raggiunte */
const dichiarate = []; for (const f in D.gesti) for (const v in D.gesti[f]) dichiarate.push(f + '/' + v);
const raggiunte = new Set(); const freq = {}; for (const s of D.sit) for (const a of s.acts) { const vv = (a.fam === 'tackle' && a.defGesto) ? a.defGesto : a.variante; const k = a.fam + '/' + (vv && D.gesti[a.fam] && D.gesti[a.fam][vv] ? vv : 'base'); raggiunte.add(k); freq[k] = (freq[k] | 0) + 1; }
const promesse = t => PROMESSE.filter(p => p[1].test(t)).map(p => ({ k: p[0], v: p[2], come: p[3] }));
const righe = []; const tot = { f: 0, a: 0, n: 0 }; const sitTesto = { n: [], a: [] };
for (const s of D.sit) {
  const pS = promesse(s.text + ' ' + s.intro).filter(p => p.v !== 'f');
  if (pS.some(p => p.v === 'n')) sitTesto.n.push({ gi: s.gi, text: s.text, promesse: pS.filter(p => p.v === 'n').map(p => p.k) });
  for (const a of s.acts) {
    let pA = promesse(a.label);
    if (a.gkCall) pA = pA.filter(p => p.k !== 'comando'); /* «Chiama/Avvisa il portiere»: il gesto c'e' (uscita e presa del portiere, gkCall 7.238) */
    /* il gesto difensivo dichiarato pesa come la parola: call/press senza clip */
    if (a.defGesto === 'call' && !a.gkCall) pA.push({ k: 'comando', v: 'n', come: 'defGesto call: nessuna clip' });
    if (a.defGesto === 'press') pA.push({ k: 'pressing', v: 'a', come: 'defGesto press: locomozione' });
    const v = pA.some(p => p.v === 'n') ? 'n' : pA.some(p => p.v === 'a') || !pA.length ? 'a' : 'f';
    tot[v]++;
    righe.push({ gi: s.gi, ai: a.ai, sit: s.text, label: a.label, fam: a.fam, variante: a.variante, defGesto: a.defGesto, clip: CLIP[a.clipKey] || a.clipKey, promesse: pA.map(p => p.k + ':' + p.v).join(', '), verdetto: v, nota: pA.filter(p => p.v !== 'f').map(p => p.come).join('; ') });
  }
}
const morte = dichiarate.filter(x => !raggiunte.has(x) && !/\/base$/.test(x));
fs.writeFileSync('../character-lab/CENSIMENTO_SCENE.json', JSON.stringify({ totali: tot, situations: D.sit.length, azioni: righe.length, varianti_mai_raggiunte: morte, situations_testo_non_disegnabile: sitTesto.n, righe }, null, 1));
const V = { f: 'fedele', a: 'approssimata', n: 'NON DISEGNABILE' };
let md = `# Censimento delle scene dell'eroe (automatico)\n\nGenerato da \`tests/visual/censimento-scene.mjs\` sulla build corrente. Situations: **${D.sit.length}** · azioni: **${righe.length}**.\n\n` +
  `| Verdetto | Azioni |\n|---|---|\n| fedele | ${tot.f} |\n| approssimata | ${tot.a} |\n| non disegnabile | ${tot.n} |\n\n` +
  `Il verdetto viene da un registro di parole-gesto scritto da me (in testa allo script), con giudizio dichiarato per ogni gesto: da validare.\n\n` +
  `## Varianti di GESTI mai raggiunte da deriveHL (${morte.length} su ${dichiarate.length})\n\n${morte.map(x => '- `' + x + '`').join('\n')}\n\n` +
  `## Situations il cui TESTO promette un gesto non disegnabile (${sitTesto.n.length})\n\n| gi | testo | promette |\n|---|---|---|\n${sitTesto.n.map(x => `| ${x.gi} | ${x.text.replace(/\|/g, '/')} | ${x.promesse.join(', ')} |`).join('\n')}\n\n` +
  `## Azioni non disegnabili (${tot.n})\n\n| gi | ai | situation | azione | famiglia/variante | clip montata | promette | perché |\n|---|---|---|---|---|---|---|---|\n` +
  righe.filter(r => r.verdetto === 'n').map(r => `| ${r.gi} | ${r.ai} | ${r.sit.slice(0, 40).replace(/\|/g, '/')} | ${r.label.replace(/\|/g, '/')} | ${r.fam}/${r.variante || 'base'}${r.defGesto ? ' · def ' + r.defGesto : ''} | ${r.clip} | ${r.promesse} | ${r.nota} |`).join('\n') +
  `\n\n## Tutte le azioni\n\n| gi | ai | azione | famiglia/variante | clip | verdetto | promette |\n|---|---|---|---|---|---|---|\n` +
  righe.map(r => `| ${r.gi} | ${r.ai} | ${r.label.replace(/\|/g, '/')} | ${r.fam}/${r.variante || 'base'}${r.defGesto ? ' · def ' + r.defGesto : ''} | ${r.clip} | ${V[r.verdetto]} | ${r.promesse} |`).join('\n') + '\n';
fs.writeFileSync('../character-lab/CENSIMENTO_SCENE.md', md);
console.log(JSON.stringify({ situations: D.sit.length, azioni: righe.length, totali: tot, varianti_mai_raggiunte: morte.length + '/' + dichiarate.length, sit_testo_non_disegnabile: sitTesto.n.length }));
console.log('mai raggiunte:', morte.join(', '));
console.log('raggiunte:', JSON.stringify(freq));
console.log('varianti prodotte da deriveHL fuori tabella:', JSON.stringify([...new Set(D.sit.flatMap(s => s.acts.filter(a => a.variante && !(D.gesti[a.fam] && D.gesti[a.fam][a.variante])).map(a => a.fam + '/' + a.variante)))]));
