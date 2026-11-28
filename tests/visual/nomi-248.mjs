#!/usr/bin/env node
/* [giro 248 · PO-511 «Valmora che squadra è?» · «Un minimo devono essere associabili alle squadre reali!»]
   GUARDIANO nomi-248. Sul gioco vero (?cpmtest=1), telefono 360 px.
   A · DATI: i 16 club del giro 6 hanno nome e sigla scelti dal PO il 17/11 (tabella NUOVI qui sotto), gli stadi nuovi in CLUB_STADIUMS,
       nessun nome del giro 6 (club o stadio) in CLUBS / U18 / STADIUM_POOLS / CLUB_STADIUMS / LEAGUE_RECORDS / EURO_COMP_WINNERS.
   B · AUDIT: window._auditCopyright() a 0 hit (i nomi nuovi non sono segnalati; «AC Milan»/«SSC Napoli» sono in lista).
   C · MIGRAZIONE (la funzione vera __CPM_MIGRATE) sul salvataggio fixtures/save-c177-s5w20.json, fatto coi nomi del giro 6:
       dopo la prima applicazione 0 nomi del giro 6 e 0 nomi reali di prima del giro 6 in TUTTE le stringhe del giocatore, la sigla
       accanto ai club rinominati (standings[].a, matchHistory[].oppAbbr) e' quella nuova; la seconda applicazione non cambia niente.
       Piu' tre stringhe costruite: «AC Dorvelli Primavera», «FC Nerazzurri U18», «FC Valmora U19» → nome nuovo col suffisso.
   D · SCHERMO (carriera del salvataggio, Deutsche Liga): home, classifica, calendario, partita (anteprima della giornata contro il
       club `bay` e barra/tabellone in `playing`): i nomi o le sigle nuove ci sono (FC Munchen/MUC, FC Koln/KLN), quelli del giro 6 mai.
   E · FOTO (CPM_FOTO248=<cartella>): classifica di Lega A a 360 px (club dell'eroe `juve`, classifica di Lega A iniettata), e il testo
       della classifica deve contenere i nomi nuovi italiani (o la loro forma corta / sigla).
   ROSSO: CPM_ROSSO248=1 accende __CPM_NO_G248 (nomi, sigle e stadi del giro 6, nessuna migrazione 248): A, B, C e D devono VEDERE i
   nomi del giro 6 (il guardiano esce 0 se li vede, 1 se il rosso non si vede). «Non giudicato» = rosso.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node nomi-248.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.env.CPM_ROSSO248 === '1';
const FOTO = process.env.CPM_FOTO248 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const DUMP = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
/* [giro 251 PO-512] i 16 club del giro 6 hanno ora il nome DEFINITIVO scelto dal PO (pagina «Nomi dei club 197», 17/11 14:33): la
   tabella sta in CLUB_NOMI_251 (src/02); il guardiano dei nomi definitivi di tutti i club e' nomi-251. */
const NUOVI = { inter: ['FC Nerazzurri', 'NRZ'], milan: ['FC Rossoneri', 'RSN'], napoli: ['FC Partenope', 'PRT'], lazio: ['FC Biancocelesti', 'BNC'],
  psg: ['FC Paris Île-de-France', 'PIF'], tor: ['FC Granata', 'GRT'], fio: ['FC Firenze', 'FRZ'], sam: ['FC Sampierdarena', 'SPD'], sas: ['FC Sassolese', 'SSL'],
  bet: ['FC Heliópolis', 'HEL'], cel: ['FC Ría de Vigo', 'RDV'], get: ['FC Getafense', 'GTF'], esp: ['FC Sarrià', 'SRR'], bay: ['FC Munchen', 'MUC'], kol: ['FC Koln', 'KLN'], spo: ['FC Lisboa Norte', 'LNO'] };
const STADI = { inter: 'Stadio Milano Ovest', milan: 'Stadio Milano Ovest', napoli: 'Stadio di Fuorigrotta', lazio: 'Stadio del Foro', roma: 'Stadio del Foro',
  psg: 'Parc Royal', tor: 'Stadio Santa Rita', fio: 'Stadio Toscano', sam: 'Stadio Ligure', sas: 'Emilia Stadium', bet: 'Estadio de Heliópolis', cel: 'Estadio de la Ría',
  bay: 'München Arena', spo: 'Estádio Lisboa Norte' };
const G6 = 'Valmora|Dorvelli|Vellamare|Alcavera|Lumeranza|Torvelle|Brenvar|Marnesi|Caldoran|Ventrana|Oriolan|Dalvora|Pelvanni|Valdenau|Ravelmund|Rendalto';
/* a schermo, a 360 px, la classifica e la barra mostrano spesso la SOLA sigla: le sigle del giro 6 contano come i nomi (parole intere; «DAL» escluso: e' la preposizione maiuscola dei titoli, misurato in home) */
const G6S = G6 + '|\\b(?:VAL|ACR|VEL|ALC|LUM|TRV|BRN|MAR|CAL|ORI|PEL|VLD|RVM|RDL)\\b';
const NUOVI_RE = 'Nerazzurri|NRZ|Rossoneri|RSN|Partenope|PRT|Biancocelesti|BNC|Île-de-France|PIF|Granata|GRT|Firenze|FRZ|Sampierdarena|SPD|Sassolese|SSL|Heliópolis|HEL|Ría de Vigo|RDV|Getafense|GTF|Sarrià|SRR|\\bMUC\\b|Munchen|MUNCHEN|Koln|KOLN|KLN|Lisboa Norte|LNO';
/* [giro 251] FC Nerazzurri, FC Partenope e FC Granata erano nomi reali di prima del giro 6 e ora sono le scelte del PO: escono da qui */
const REALI = 'AC Rossoneri|FC Biancoceleste|FC Paris(?![a-zà-ÿ]| Île)|FC Viola|FC Blucerchiati|FC Neroverde|FC Verdiblanco|FC Celeste|FC Leões|FC Perico|FC Azulón|FC München|FC Köln';
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
/* giudizio per braccio: verde = cond, rosso = il difetto si vede (cond falsa) */
const giudica = (condVerde, mVerde, mRosso) => ROSSO ? ok(!condVerde, '[rosso] ' + mRosso) : ok(condVerde, mVerde);
/* [giro 453] questo guardiano giudica il SUO livello di nomi: i nomi di fantasia del giro 453 (sopra) si spengono, li giudica nomi-453 */
const flags = [...(ROSSO ? ['__CPM_NO_G248'] : []), '__CPM_NO_G453'];
const conta = (txt, re) => (String(txt).match(new RegExp(re, 'g')) || []).length;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
try {
  console.log(`nomi-248 ${ROSSO ? '[ROSSO __CPM_NO_G248]' : '[verde]'}`);
  /* A · B · C su pagina senza carriera */
  {
    const { page, errs } = await apri(b, port, 360, { h: 780, flags, carriera: false });
    await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function' && typeof window._auditCopyright === 'function', null, { timeout: 60000 });
    const d = await page.evaluate(([NUOVI, STADI]) => {
      const cl = {}; for (const id in NUOVI) { const c = CLUBS.find(x => x.id === id); cl[id] = c ? [c.n, c.a] : null; }
      const st = {}; for (const id in STADI) st[id] = CLUB_STADIUMS[id] || null;
      const testo = JSON.stringify([CLUBS.map(c => c.n), U18_CLUBS.map(c => c.n || c.name), U18_CLUBS_P2.map(c => c.n || c.name), STADIUM_POOLS, CLUB_STADIUMS, LEAGUE_RECORDS, EURO_COMP_WINNERS]);
      return { cl, st, testo, hits: window._auditCopyright().filter(h => !/-453: /.test(h)) /* [giro 453] le parole del 453 le giudica nomi-453 */ };
    }, [NUOVI, STADI]);
    const sbagliati = Object.keys(NUOVI).filter(id => !d.cl[id] || d.cl[id][0] !== NUOVI[id][0] || d.cl[id][1] !== NUOVI[id][1]);
    giudica(sbagliati.length === 0, `A · 16/16 club col nome e la sigla del PO`, `A · i club NON hanno i nomi del PO (${sbagliati.length}/16 diversi, es. ${sbagliati.slice(0, 2).map(i => i + '=' + (d.cl[i] || []).join('/')).join(', ')})`);
    const stSbagliati = Object.keys(STADI).filter(id => d.st[id] !== STADI[id]);
    giudica(stSbagliati.length === 0, `A · stadi: ${Object.keys(STADI).length}/${Object.keys(STADI).length} come da scelta PO (inter/milan «Stadio Milano Ovest», lazio/roma «Stadio del Foro»)`, `A · stadi del giro 6 (${stSbagliati.length} diversi, es. ${stSbagliati.slice(0, 2).map(i => i + '=' + d.st[i]).join(', ')})`);
    const g6dati = conta(d.testo, G6);
    giudica(g6dati === 0, `A · nomi del giro 6 nei dati (club, U18, stadi, record, albo): ${g6dati}`, `A · nomi del giro 6 nei dati: ${g6dati} (> 0)`);
    giudica(d.hits.length === 0, `B · audit copyright: ${d.hits.length} hit`, `B · audit copyright: ${d.hits.length} hit (> 0, es. ${d.hits[0] || '—'})`);
    if (!ROSSO && d.hits.length) note.push('hit: ' + d.hits.slice(0, 5).join(' | '));

    const m = await page.evaluate((dump) => {
      const p0 = JSON.parse(dump['cpm-v3']).player; const M = window.__CPM_MIGRATE;
      const un = r => (r && r.player) || r;
      const m1 = un(M(JSON.parse(JSON.stringify(p0)))); const m2 = un(M(JSON.parse(JSON.stringify(m1))));
      const stringhe = o => { const out = []; const w = x => { if (typeof x === 'string') out.push(x); else if (x && typeof x === 'object') for (const k in x) w(x[k]); }; w(o); return out.join('\n'); };
      const sig = {}; for (const r of (m1.standings || [])) sig[r.id] = r.a;
      const oa = (m1.matchHistory || []).filter(h => /Munchen|Koln|Valdenau|Ravelmund/.test(h.opponent || '')).map(h => h.opponent + '/' + h.oppAbbr);
      const mh = JSON.parse(JSON.stringify(m1.matchHistory || [])); mh.push({ season: 1, week: 1, opponent: 'AC Dorvelli Primavera', oppAbbr: 'ACR' });
      const sint = un(M({ ...JSON.parse(JSON.stringify(m1)), matchHistory: mh, diary: [{ t: 'Gol contro FC Nerazzurri U18 e poi FC Valmora U19.' }] }));
      const ult = (sint.matchHistory || []).slice(-1)[0] || {};
      return { prima: stringhe(p0), dopo: stringhe(m1), idem: JSON.stringify(m1) === JSON.stringify(m2), sig, oa, sintClub: ult.opponent + '/' + ult.oppAbbr, sintDiario: (sint.diary || [])[0] ? sint.diary[0].t : '' };
    }, DUMP);
    const g6prima = conta(m.prima, G6), g6dopo = conta(m.dopo, G6), realiDopo = conta(m.dopo, REALI);
    ok(g6prima > 0, `C · il salvataggio di prova contiene nomi del giro 6 prima della migrazione: ${g6prima} (se 0 la prova non giudica)`);
    giudica(g6dopo === 0 && realiDopo === 0, `C · dopo la migrazione: nomi del giro 6 ${g6dopo}, nomi reali ${realiDopo}`, `C · dopo la migrazione restano ${g6dopo} nomi del giro 6`);
    ok(m.idem, `C · seconda applicazione della migrazione senza modifiche: ${m.idem}`);
    giudica(m.sig.bay === 'MUC' && m.sig.kol === 'KLN' && m.oa.length > 0 && m.oa.every(x => /\/(MUC|KLN)$/.test(x)),
      `C · le sigle seguono il nome: classifica bay=${m.sig.bay} kol=${m.sig.kol} · storico ${m.oa.join(', ')}`,
      `C · sigle del giro 6: classifica bay=${m.sig.bay} kol=${m.sig.kol} · storico ${m.oa.join(', ')}`);
    giudica(m.sintClub === 'FC Rossoneri Primavera/RSN' && m.sintDiario === 'Gol contro FC Nerazzurri U18 e poi FC Nerazzurri U19.',
      `C · suffissi: «${m.sintClub}» · «${m.sintDiario}»`, `C · suffissi non migrati ai nomi nuovi: «${m.sintClub}» · «${m.sintDiario}»`);
    ok(errs.length === 0, `A-C · nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
  /* D · schermo sulla carriera del salvataggio */
  {
    const { page, errs } = await apri(b, port, 360, { h: 780, flags });
    const testo = () => page.evaluate(() => document.body.innerText);
    const giudicaSchermo = (dove, t) => { const g6 = conta(t, G6S), nuovi = conta(t, NUOVI_RE);
      if (ROSSO) ok(g6 > 0, `[rosso] D · ${dove}: nomi/sigle del giro 6 a schermo ${g6} (> 0), nuovi ${nuovi}`);
      else ok(g6 === 0 && nuovi > 0, `D · ${dove}: nomi/sigle nuovi ${nuovi} (> 0), nomi/sigle del giro 6 ${g6}${g6 ? ' — ' + (String(t).match(new RegExp('.{0,30}(?:' + G6S + ').{0,30}', 'g')) || []).slice(0, 3).join(' ¦ ') : ''}`); };
    await vai(page, 'dashboard', 1200);
    /* la home nomina la squadra dell'eroe e le prossime: si inietta la prossima giornata contro `bay` (nome del giro 6 nel braccio rosso) */
    await page.evaluate((rosso) => { const p = window.__CPM_CAREER.snapshot(); const bay = CLUBS.find(c => c.id === 'bay');
      const cal = p.calendar.map(c => c.week === 20 && !c.played && !c.type ? { ...c, opponentId: 'bay', opponentName: bay.n } : c); window.__CPM_CAREER.patch({ calendar: cal }); }, ROSSO);
    await sleep(1200);
    giudicaSchermo('home', await testo());
    await vai(page, 'standings', 1400); giudicaSchermo('classifica', await testo());
    if (FOTO) await page.screenshot({ path: `${FOTO}/classifica-dl-360${ROSSO ? '-prima' : ''}.png` });
    await vai(page, 'calendar', 1400); giudicaSchermo('calendario', await testo());
    await vai(page, 'dashboard', 900);
    const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    let fase = null, anteprima = '', gioco = '', barra = '';
    for (let i = 0; i < 40; i++) {
      await sleep(1000);
      fase = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } });
      if (fase === 'matchday' && !anteprima) { anteprima = await testo(); if (FOTO) await page.screenshot({ path: `${FOTO}/partita-anteprima-360${ROSSO ? '-prima' : ''}.png` }); }
      if (fase === 'playing') { await sleep(1500); gioco = await testo();
        barra = await page.evaluate(() => [...document.querySelectorAll('[data-cpm="barra"],[data-cpm^="tabellone"],[data-cpm^="barra286"]')].map(e => e.innerText).join(' ¦ '));
        if (FOTO) await page.screenshot({ path: `${FOTO}/partita-tabellone-360${ROSSO ? '-prima' : ''}.png` }); break; }
      /* [giro 344] dal giro 336 (PO-608) il primo tasto «Gioca la partita» porta alle formazioni; il vecchio «Salta e gioca» (che
         questa sonda premeva col /Gioca/i) si chiama «Salta formazioni e ingresso» (data-cpm salta-336): stessa strada di prima. */
      await page.evaluate(() => { const s336 = document.querySelector('[data-cpm="salta-336"]'); if (s336 && s336.offsetParent) { s336.click(); return; }
        const x = [...document.querySelectorAll('button')].filter(e => e.offsetParent && /Avanti|Continua|Inizia|Entra|Scendi|Calcio d|GIOCA|Gioca|Pronti|Vai/i.test(e.textContent)); if (x[0]) x[0].click(); });
    }
    note.push(`playMatch=${pm} · fase finale ${fase}`);
    ok(!!anteprima && fase === 'playing', `D · partita aperta: anteprima ${anteprima ? 'letta' : 'NON letta'}, fase ${fase} (altrimenti non giudicato)`);
    giudicaSchermo('anteprima della partita', anteprima);
    giudicaSchermo('partita in corso', gioco);
    giudicaSchermo('barra/tabellone', barra);
    note.push('barra: ' + barra.replace(/\s+/g, ' ').slice(0, 160));
    ok(errs.length === 0, `D · nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
  /* E · classifica di Lega A a 360 px */
  {
    const { page, errs } = await apri(b, port, 360, { h: 900, flags });
    await page.evaluate(() => { const la = CLUBS.filter(c => c.lg === 'Lega A'); const st = initStandings(la).map(r => { const g = 19, w = Math.round(g * r.p / 140), dr = Math.min(g - w, 5); return { ...r, played: g, wins: w, draws: dr, losses: g - w - dr, gf: w * 2 + dr, ga: (g - w) * 1, gd: w * 2 + dr - (g - w), pts: w * 3 + dr }; });
      const juve = la.find(c => c.id === 'juve'); window.__CPM_CAREER.patch({ club: { ...juve, isU18: false }, standings: st }); });
    await sleep(1000); await vai(page, 'standings', 1600);
    const t = await page.evaluate(() => document.body.innerText);
    if (FOTO) await page.screenshot({ path: `${FOTO}/classifica-lega-a-360${ROSSO ? '-prima' : '-dopo'}.png`, fullPage: true });
    const g6 = conta(t, G6S), nuovi = conta(t, NUOVI_RE);
    if (ROSSO) ok(g6 >= 8, `[rosso] E · classifica di Lega A coi nomi/sigle del giro 6: ${g6} (≥ 8)`);
    else ok(g6 === 0 && nuovi >= 8, `E · classifica di Lega A: nomi/sigle nuovi ${nuovi} (≥ 8), nomi/sigle del giro 6 ${g6}`);
    /* nomi tagliati (dubbio per il PO): elementi col nome nuovo che non ci stanno */
    const tagli = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.childElementCount === 0 && /Nerazzurri|Rossoneri|Partenope|Biancocelesti|Granata|Zebre|Sampierdarena|Firenze|Sassolese/.test(e.textContent) && e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()).slice(0, 10));
    note.push(`Lega A 360: elementi col nome tagliato (ellissi): ${tagli.length ? tagli.join(' | ') : 'nessuno'}`);
    ok(errs.length === 0, `E · nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.stack || e).slice(0, 300)); }
await b.close(); srv.close();
console.log('\nNOTE'); for (const n of note) console.log('  · ' + n);
console.log(`\nnomi-248 ${ROSSO ? '[ROSSO __CPM_NO_G248]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
