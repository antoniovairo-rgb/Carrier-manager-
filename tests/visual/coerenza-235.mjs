#!/usr/bin/env node
/* [giro 235 · PO-457/458 + decisione PO 17/11 sul testo grande] GUARDIANO coerenza-235. Gioco vero (?cpmtest=1), carriera di prova del
   giro 195 (fixtures/save-c177-s5w20.json), 375 px con tocco e 1366 col mouse. Misure da misura-235.mjs. Giudica, per ogni braccio:
     T  UN SOLO STILE DEL TASTO PRINCIPALE: ogni tasto pieno e forte delle 8 schede e delle finestre della settimana e della partita
        (apriSettimana/apriPartita) e' in carattere TV maiuscolo e ha il fondo della regola unica — il colore del club, o il negativo crema
        quando sta sopra un riquadro gia' nel colore del club. Almeno 3 tasti censiti, se no la prova non vale.
     H  STESSA TESTATA: ogni scheda ha il suo titolo nella testata compatta (decisione 02/11: senza ingrossarla), nello stesso posto e
        con lo stesso corpo in tutte e otto.
     V  la testata non ingrossa: altezza della testata e quota di «Vivi la settimana» in Home, a 375 e 1366, entro 4 px dal braccio
        rosso (che non ha il titolo). Un titolo aggiunto nel contenuto spingeva il tasto sotto la barra a 375x667 (tocco-213 rosso).
     M  STESSO MENU fuori e dentro la carriera: voce di solo testo (una riga), stesso carattere, maiuscolo, corpo e altezza minima
        (l'altezza vera della barra di carriera cresce di qualche px quando una voce porta un segnale: si confronta la misura dichiarata).
     P  PROFILO in 4-5 gruppi (data-gruppo235), nessuna fisarmonica rimasta fuori dai gruppi, nessuna parola inglese nei titoli
        (Milestone, Achievement, Timeline, Status, MVP...).
     C  CONTRATTO per intero (stipendio + durata/scadenza) solo in Agente; in Profilo un rimando (data-rimando235); in Club niente (giro 337 · PO-617, aggiornato al giro 344).
     F  FIDUCIA e POPOLARITA' con la stessa forma in Home e in Club, a gradini (PO-391).
     G  TESTO GRANDE a due gradini: in Opzioni › Lettura un gruppo «Testo grande» con tre scelte (Normale · +15% · +30%); corpo minimo
        della Classifica a 375: +15% fra 13,5 e il +30% (escluso), +30% >= 15,5; il vecchio valore «1» del giro 234 = +30%.
   Bracci: VERDE (gioco) deve passare tutto; ROSSO window.__CPM_NO_G235 deve essere bocciato su T, H, M, P, C, F, G e U; [giro 260] il ROSSO
   window.__CPM_NO_G260 (a 375) deve essere bocciato su U (titolo grande di nuovo nel contenuto).
     U  [giro 260] titolo SOLO in testata: nessun titolo grande nel contenuto di Stagione/Agente/Ufficio; in Classifica vetta e forma
        visibili sotto la testata, nel primo schermo.
   «Non giudicato»
   (misura mancante, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node coerenza-235.mjs   (CPM_PARTE=verde|rosso) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misuraTutto, corpo, SCHEDE } from './misura-235.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const CREMA = '#f4f1ea';

async function braccio(b, port, rosso, flags = rosso ? ['__CPM_NO_G235'] : [], larghezze = [375, 1366]) {
  const ko = {}; const num = {};
  const no = (k, m) => (ko[k] = ko[k] || []).push(m);
  for (const w of larghezze) {
    let R; try { R = await misuraTutto(b, port, w, { flags }); } catch (e) { no('X', `${w}: non giudicato ${String(e.message).slice(0, 120)}`); continue; }
    if (R.errori && R.errori.length) no('X', `${w}: errori di pagina ${R.errori.join(' / ')}`);
    const club = R.club && R.club.c ? R.club.c.toLowerCase() : null; if (!club) no('T', `${w}: club non letto — non giudicato`);
    /* T */
    const tutti = [...SCHEDE.flatMap(t => (R.schede[t] ? R.schede[t].tasti : []).map(x => ({ ...x, dove: t }))), ...Object.entries(R.finestre).flatMap(([k, f]) => f.tasti.map(x => ({ ...x, dove: k })))];
    num['tasti' + w] = tutti.length;
    if (tutti.length < 3) no('T', `${w}: solo ${tutti.length} tasti principali censiti — non giudicato`);
    const fuori = tutti.filter(x => !(x.tv && x.up && (x.suClub ? x.fondo === CREMA : x.fondo === club)));
    const stili = new Set(tutti.map(x => `${x.fondo}${x.tv ? '·TV' : ''}${x.up ? '·MAIUSC' : ''}${x.suClub ? '·suClub' : ''}`));
    num['stili' + w] = stili.size;
    if (fuori.length) no('T', `${w}: ${fuori.length} tasti fuori regola (${fuori.slice(0, 4).map(x => `«${x.testo.slice(0, 24)}» ${x.fondo}${x.tv ? '' : ' non-TV'}${x.up ? '' : ' minusc.'} in ${x.dove}`).join(' · ')})`);
    /* H */
    const ATT = { dashboard: 'Home', standings: 'Classifica', calendar: 'Calendario', coppe: 'Coppe', club: 'Club', profile: 'Profilo', agente: 'Agente', ufficio: 'Ufficio' };
    const senza = SCHEDE.filter(t => { const h = R.schede[t] && R.schede[t].testata; return !h || !h.inTestata || h.inTestata.t.toLowerCase() !== ATT[t].toLowerCase(); });
    if (senza.length) no('H', `${w}: schede senza il loro titolo nella testata: ${senza.join(',')}`);
    const pos = new Set(SCHEDE.map(t => { const h = R.schede[t] && R.schede[t].testata; return h && h.inTestata ? h.inTestata.y + '/' + h.inTestata.x + '/' + h.inTestata.corpo : 'x'; }));
    const alt = new Set(SCHEDE.map(t => R.schede[t] && R.schede[t].testata ? R.schede[t].testata.altTestata : 'x'));
    num['testata' + w] = `posti ${pos.size} · altezze ${[...alt].join('/')}`;
    if (pos.size !== 1) no('H', `${w}: il titolo della testata cambia posto o corpo fra le schede (${[...pos].join(' ')})`);
    /* U [giro 260 · decisione PO 17/11 C] titolo SOLO nella testata: niente titolo grande nel contenuto di Stagione (Classifica,
       Calendario, Coppe), Agente e Ufficio; in Classifica distanza dalla vetta e forma visibili sotto la testata, nel primo schermo */
    for (const t of ['standings', 'calendar', 'coppe', 'agente', 'ufficio']) { const h = R.schede[t] && R.schede[t].testata;
      if (!h || !h.doppi) { no('U', `${w}: ${t} non misurata — non giudicato`); continue; }
      if (h.doppi.length) no('U', `${w}: ${t} ha ancora il titolo nel contenuto (${h.doppi.join(' · ')})`); }
    { const h = R.schede.standings && R.schede.standings.testata; const v = h && h.vetta260, f = h && h.forma260;
      num['vetta' + w] = v ? `«${v.testo}» y${v.top}` : 'assente'; num['forma' + w + 'V'] = f ? `y${f.top}` : 'assente';
      for (const [n, x] of [['distanza dalla vetta', v], ['forma', f]]) if (!x) no('U', `${w}: ${n} assente in Classifica`); else if (!x.sotto || !x.primoSchermo) no('U', `${w}: ${n} non sotto la testata nel primo schermo (y ${x.top})`); }
    /* V: la testata non ingrossa (confronto col braccio rosso, sotto) */
    const vv = R.schede.dashboard.vivi; num['altTestata' + w] = R.schede.dashboard.testata.altTestata; num['viviTop' + w] = vv ? vv.top : null;
    /* M */
    const dentro = (R.schede.dashboard.menu || [])[0], fuoriM = (R.menuFuori || [])[0];
    if (!dentro || !fuoriM) no('M', `${w}: barra non trovata — non giudicato`);
    else { num['menu' + w] = `dentro ${dentro.righe}r ${dentro.famiglia} ${dentro.corpo}px ${dentro.maiuscolo ? 'MAIUSC' : 'min'} min${dentro.minAlt} · fuori ${fuoriM.righe}r ${fuoriM.famiglia} ${fuoriM.corpo}px ${fuoriM.maiuscolo ? 'MAIUSC' : 'min'} min${fuoriM.minAlt}`;
      if (dentro.righe !== fuoriM.righe || dentro.maiuscolo !== fuoriM.maiuscolo || Math.abs(dentro.corpo - fuoriM.corpo) > 0.5 || dentro.famiglia !== fuoriM.famiglia || dentro.minAlt !== fuoriM.minAlt || fuoriM.attiva !== 'page') no('M', `${w}: menu diverso (${num['menu' + w]}, voce attiva fuori ${fuoriM.attiva})`); }
    /* P */
    const P = R.schede.profile && R.schede.profile.profilo;
    if (!P) no('P', `${w}: profilo non misurato — non giudicato`);
    else { num['profilo' + w] = `${P.gruppi} gruppi · ${P.fisarmoniche} fisarmoniche · ${P.sezioni.length} sezioni`;
      if (P.gruppi < 4 || P.gruppi > 5) no('P', `${w}: ${P.gruppi} gruppi (servono 4-5)`);
      if (P.fisarmoniche > 0) no('P', `${w}: ${P.fisarmoniche} fisarmoniche fuori dai gruppi`);
      if (P.inglesi.length) no('P', `${w}: parole inglesi nei titoli: ${P.inglesi.join(', ')}`);
      if (P.sezioni.length < 10) no('P', `${w}: solo ${P.sezioni.length} sezioni nei gruppi — il contenuto e' sparito?`); }
    /* C */
    const pieni = SCHEDE.filter(t => R.schede[t] && R.schede[t].contratto.pieno > 0);
    num['contratto' + w] = pieni.join(',') || 'nessuna';
    if (!pieni.includes('agente')) no('C', `${w}: contratto per intero assente in Agente`);
    const altrove = pieni.filter(t => t !== 'agente'); if (altrove.length) no('C', `${w}: contratto per intero anche in ${altrove.join(',')}`);
    if (!R.schede.profile || !R.schede.profile.contratto.rimando.length) no('C', `${w}: nessun rimando al contratto in profile`);
    /* [giro 344] DECISIONE PO-617 (giro 337, «il contratto e' dell'eroe: vive in Agente, non nella scheda Club»): nella scheda Club non
       c'e' piu' nemmeno il rimando. Il controllo si rovescia, non si allenta: un rimando (o il contratto) rimasto in Club e' un rosso. */
    if (!R.schede.club) no('C', `${w}: scheda club non letta (non giudicato)`);
    else if (R.schede.club.contratto.rimando.length) no('C', `${w}: rimando al contratto ancora in club (PO-617 lo ha tolto)`);
    /* F */
    const fh = R.schede.dashboard.forma || {}, fc = R.schede.club.forma || {};
    num['forma' + w] = `Home ${fh['Fiducia del mister']}/${fh['Popolarit']} · Club ${fc['Fiducia del mister']}/${fc['Popolarit']}`;
    for (const k of ['Fiducia del mister', 'Popolarit']) { if (!fh[k] || !fc[k]) no('F', `${w}: ${k} non trovata — non giudicato`); else if (fh[k] !== fc[k] || fh[k] !== 'gradini') no('F', `${w}: ${k} Home ${fh[k]} · Club ${fc[k]}`); }
    /* G (scelte) */
    const L = R.lettura; if (!L) no('G', `${w}: Opzioni › Lettura non trovata — non giudicato`);
    else if (L.gruppo !== 'Testo grande' || L.scelte.length !== 3 || !/15/.test(L.scelte.map(x => x.t).join(' ')) || !/30/.test(L.scelte.map(x => x.t).join(' '))) no('G', `${w}: in Opzioni niente due gradini (gruppo ${L.gruppo}, scelte ${L.scelte.map(x => x.t).join('/')}, interruttori ${L.interruttori.join('/')})`);
  }
  /* G (corpi) */
  try {
    const c0 = await corpo(b, port, 375, null, flags), c15 = await corpo(b, port, 375, '15', flags), c30 = await corpo(b, port, 375, '30', flags), c1 = await corpo(b, port, 375, '1', flags);
    num.corpi = `normale ${c0.min} · +15% ${c15.min} · +30% ${c30.min} · vecchio «1» ${c1.min}`;
    if (!(c15.min >= 13.5 && c15.min < c30.min)) no('G', `+15%: corpo minimo ${c15.min} (atteso >= 13,5 e < ${c30.min})`);
    if (!(c30.min >= 15.5)) no('G', `+30%: corpo minimo ${c30.min} (atteso >= 15,5)`);
    if (c1.min !== c30.min) no('G', `il vecchio «1» del giro 234 da' ${c1.min}, il +30% ${c30.min}`);
    if (!(c0.min < c15.min)) no('G', `normale ${c0.min} non sotto +15% ${c15.min}`);
  } catch (e) { no('G', 'corpi non misurati: ' + String(e.message).slice(0, 120)); }
  return { ko, num };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let v = null, r = null, r260 = null;
try { if (PARTE !== 'rosso') v = await braccio(b, port, false); if (PARTE !== 'verde') r = await braccio(b, port, true);
  if (PARTE !== 'verde') r260 = await braccio(b, port, true, ['__CPM_NO_G260'], [375]); }
finally { await b.close(); srv.close(); }
const PARTI = ['T', 'H', 'M', 'P', 'C', 'F', 'G', 'U'];
let ok = true;
if (v && r) for (const w of [375, 1366]) for (const k of ['altTestata', 'viviTop']) { const a = v.num[k + w], c = r.num[k + w];
  if (a == null || c == null) { (v.ko.V = v.ko.V || []).push(`${k}${w} non misurato — non giudicato`); continue; }
  if (a - c > 4) (v.ko.V = v.ko.V || []).push(`${w}: ${k} ${a} contro ${c} senza il giro 235 (+${a - c} px)`); }
if (v) { const vk = Object.keys(v.ko); const vOk = vk.length === 0; ok = ok && vOk;
  console.log(`VERDE: ${vOk ? '✓' : '✗'} ${JSON.stringify(v.num)}${vOk ? '' : '\n   ' + vk.map(k => k + ': ' + v.ko[k].join(' | ')).join('\n   ')}`); }
if (r) { const presi = PARTI.filter(k => r.ko[k] && !r.ko[k].every(m => /non giudicato/.test(m))); const mancano = PARTI.filter(k => !presi.includes(k)); const rOk = mancano.length === 0 && !r.ko.X; ok = ok && rOk;
  console.log(`ROSSO __CPM_NO_G235: ${rOk ? '✓ bocciato su ' + presi.join(',') : '✗ non bocciato su ' + mancano.join(',') + (r.ko.X ? ' · errori ' + r.ko.X.join(' | ') : '')} ${JSON.stringify(r.num)}`);
  for (const k of presi) console.log(`   ${k}: ${r.ko[k][0]}`); }
if (r260) { const preso = !!(r260.ko.U && !r260.ko.U.every(m => /non giudicato/.test(m))); ok = ok && preso && !r260.ko.X;
  console.log(`ROSSO __CPM_NO_G260: ${preso ? '✓ bocciato su U' : '✗ non bocciato su U'}${r260.ko.X ? ' · errori ' + r260.ko.X.join(' | ') : ''} ${JSON.stringify({ vetta375: r260.num.vetta375 })}`);
  if (preso) console.log(`   U: ${r260.ko.U[0]}`); }
console.log(ok ? '✓ coerenza-235 VERDE' : '✗ coerenza-235 ROSSO');
process.exit(ok ? 0 : 1);
