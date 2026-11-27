#!/usr/bin/env node
/* [giro 419, PO-682 «avevo scelto calcio potente ma ha fatto un colpo di testa», codice 003 + «corpo↔porta al contatto 72°»]
   GUARDIANO, due parti, ciascuna con verde e rosso (window.__CPM_NO_G419). GLB ACCESO.
   T · TESTO (una pagina): l'elenco di tutte le azioni del catalogo (SITUATIONS, CHAIN_SITS) e delle scene del motore (scenaDalMotoreCross
       angolo/cross e scenaSecondoTempo, 40 semi ciascuna), con l'etichetta MOSTRATA (intentLabelDedup) e il tipo del gesto 3D (deriveHL).
       Verde: nessuna azione di testa (deriveHL header) mostrata con le parole di un tiro di piede («Conclusione potente/precisa/di
       prima», «Cerca l'angolo», «Scavetto», «Giocata acrobatica»), e ogni colpo di testa verso la porta (rew goal) mostrato con «di testa».
       Anche i riquadri DOPO la scelta (giocataMostrata419) dicono per un colpo di testa lo stesso nome del tasto.
       Rosso: il difetto del PO deve ricomparire («✈️ Testa di potenza» mostrata «💥 Conclusione potente»).
   C · CORPO (pagina nuova per caso, lezione 7.483): i casi di misura-419 sul PERCORSO VERO (origine _ORIG26: il pallone vola dalla
       bandierina o dal crossatore sul corpo dell'eroe); angolo corpo↔porta al contatto dal testimone __CPM_CONT121 (fotogramma in cui
       l'arco del colpo parte). Verde: tutti ≤ 35° (la soglia del testimone 53 che scrive la bozza del PO). Rosso: almeno 5 casi su 8
       oltre 35° (misurato prima della correzione: 7 su 8, 8-84°). Caso senza contatto di testa = non giudicato = rosso.
   Uso: node testa-419.mjs · CPM_SOLO=T|C · CPM_BRACCIO=verde|rosso */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const { CASI419, caso419 } = await import(path.join(DIR, 'misura-419.mjs'));
const SOGLIA = { ang: 35, rossoMin: 5 };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const solo = process.env.CPM_SOLO || '', bracci = process.env.CPM_BRACCIO ? [process.env.CPM_BRACCIO] : ['verde', 'rosso'];
const g = [];
async function testo(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; if (r) window.__CPM_NO_G419 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Testa 419' });
  const R = await page.evaluate(() => {
    const scene = []; for (const s of SITUATIONS) scene.push(['catalogo', s]); for (const k in CHAIN_SITS) scene.push(['seguito:' + k, CHAIN_SITS[k]]);
    const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom GUNTHER' } }, P = { stats: {}, foot: 'R' };
    for (let sd = 1; sd <= 40; sd++) { for (const tipo of ['angolo', 'cross']) { const s = scenaDalMotoreCross({ tipo, zona: 'area', x: 90, y: 40 + sd % 20, press: 0.8, liberi: 0, cast: C, origine: { kind: tipo } }, P, sd); if (s) scene.push(['motore:' + tipo, s]); }
      for (const k in CHAIN_SITS) { const s = scenaSecondoTempo({ ...CHAIN_SITS[k], _chainDepth: 1 }, C, P, sd); if (s) scene.push(['motore:seguito', s]); } }
    const PIEDE = /conclusione potente|conclusione precisa|conclusione di prima|cerca l'angolo|scavetto|giocata acrobatica/i;
    const righe = new Map(); let n = 0;
    for (const [fonte, s] of scene) { const A = s.actions || []; A.forEach((a, i) => { n++; let t = null; try { t = (deriveHL(s, a) || {}).type; } catch (e) { }
      const mostrata = intentLabelDedup(a.label, i, A); const k = fonte.split(':')[0] + '|' + a.label + '|' + mostrata + '|' + t;
      if (!righe.has(k)) righe.set(k, { fonte, label: a.label, mostrata, tipo: t, rew: a.rew }); }); }
    const L = [...righe.values()]; const teste = L.filter(r => r.tipo === 'header');
    const bugie = teste.filter(r => PIEDE.test(r.mostrata)); const mute = teste.filter(r => r.rew === 'goal' && !/di testa/i.test(r.mostrata));
    /* i riquadri DOPO la scelta («La giocata», esito, in corso) leggono giocataMostrata419(chosenAct.label): per ogni colpo di testa verso la
       porta devono dire lo stesso nome del tasto */
    const dopo = teste.filter(r => r.rew === 'goal').filter(r => giocataMostrata419(r.label) !== intentLabel(r.label) || !/di testa/i.test(giocataMostrata419(r.label))).map(r => ({ ...r, mostrata: 'riquadro: ' + giocataMostrata419(r.label) }));
    return { n, distinte: L.length, teste: teste.length, bugie, mute, dopo, potenza: L.filter(r => /Testa di potenza/.test(r.label)).map(r => r.mostrata) };
  });
  await page.close(); return R;
}
for (const braccio of bracci) {
  const rosso = braccio === 'rosso';
  if (!solo || solo === 'T') {
    const R = await testo(rosso);
    console.log(`T ${braccio}: ${R.n} azioni, ${R.distinte} distinte, ${R.teste} di testa · mostrate come tiro di piede ${R.bugie.length} · colpi verso la porta senza «di testa» ${R.mute.length} · riquadri dopo la scelta diversi dal tasto ${R.dopo.length} · «Testa di potenza» → ${[...new Set(R.potenza)].join(' / ')}`);
    for (const r of [...R.bugie, ...R.mute, ...R.dopo].slice(0, 12)) console.log(`    ${r.fonte}: «${r.label}» → «${r.mostrata}» (${r.tipo}, ${r.rew})`);
    if (R.teste < 10) g.push(`T ${braccio}: non giudicato, solo ${R.teste} azioni di testa nell'elenco`);
    else if (!rosso && (R.bugie.length || R.mute.length || R.dopo.length)) g.push(`T verde: ${R.bugie.length} azioni di testa mostrate come tiro di piede, ${R.mute.length} senza «di testa», ${R.dopo.length} riquadri diversi dal tasto`);
    else if (rosso && !R.potenza.some(m => /Conclusione potente/.test(m))) g.push('T rosso: il difetto del PO («Testa di potenza» → «Conclusione potente») non ricompare');
  }
  if (!solo || solo === 'C') {
    const R = []; for (let i = 0; i < CASI419.length; i += 2) R.push(...await Promise.all(CASI419.slice(i, i + 2).map(c => caso419(b, port, c, { rosso: rosso ? ['__CPM_NO_G419'] : [] }))));
    for (const r of R) console.log(`C ${braccio} ${r.k}: ${r.err || `corpo↔porta ${r.ang}° (bozza ${r.a53}°) · eroe x ${r.x} z ${r.z} · porta ${r.porta} u · pallone ${r.palla} u · origine ${r.o26}`}`);
    const giud = R.filter(r => !r.err && r.ang != null && r.o26 > 0 && /header/.test(r.archi || ''));
    if (giud.length !== CASI419.length) g.push(`C ${braccio}: non giudicati ${CASI419.length - giud.length} casi (${R.filter(r => !giud.includes(r)).map(r => r.k + ':' + (r.err || 'senza contatto di testa o senza origine')).join(', ')})`);
    const gir = giud.filter(r => r.ang > SOGLIA.ang);
    console.log(`C ${braccio}: ${giud.length} giudicati · oltre ${SOGLIA.ang}° ${gir.length} · massimo ${Math.max(...giud.map(r => r.ang))}°`);
    if (!rosso && gir.length) g.push(`C verde: ${gir.length} colpi di testa col corpo girato oltre ${SOGLIA.ang}° (${gir.map(r => r.k + ' ' + r.ang + '°').join(', ')})`);
    if (rosso && gir.length < SOGLIA.rossoMin) g.push(`C rosso: solo ${gir.length} casi oltre ${SOGLIA.ang}° (servono ${SOGLIA.rossoMin})`);
  }
}
await b.close(); srv.close();
if (g.length) { console.log('❌ testa-419'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-419 verde (e il rosso si vede)');
