#!/usr/bin/env node
/* [giro 251 · PO-512 «nomi di tutti i club» — scelte definitive del PO, pagina «Nomi dei club 197», conferma 17/11 14:33 Roma]
   GUARDIANO nomi-251. Sul gioco vero (?cpmtest=1), telefono 360 px. Le tabelle qui sotto sono una COPIA indipendente delle scelte
   del PO (DEF) e dei nomi di lavoro/197 col giro 248 (OGGI): il guardiano non legge CLUB_NOMI_251, la confronta.
   A · DATI: i 64 club cambiati hanno nome e sigla definitivi; 0 nomi superati (OGGI dei club cambiati, giro 6, nomi reali di prima del
       giro 6 che non sono scelte del PO, stadi «Goldwald Stadion»/«Gelsenkirchen Arena») in CLUBS / U18 / STADIUM_POOLS /
       CLUB_STADIUMS / LEAGUE_RECORDS / EURO_COMP_WINNERS; stadi bvb «Hörde Stadion», s04 «Emscher Arena».
   B · AUDIT: window._auditCopyright() a 0 hit coi nomi del PO.
   C · SIGLE: 252 sigle di tre lettere, tutte diverse, ognuna sottosequenza del nome mostrato.
   D · MIGRAZIONE (la funzione vera __CPM_MIGRATE): salvataggio COSTRUITO coi nomi di oggi (storico, classifica, diario con suffissi
       Primavera/U18/U19) e i salvataggi fixtures save-c177-s5w20 (giro 6), save-190-s12-ovr93, save-195-primavera-w39: dopo la prima
       applicazione 0 nomi superati, la sigla salvata accanto al nome segue il nome, la seconda applicazione non cambia nulla.
   E · SCHERMO: classifica a 360 px di tre leghe (Lega A, Deutsche Liga, Championship): per ogni club della lega il nome o la sigla
       definitivi a schermo, 0 sigle/nomi superati dei club di quella lega. CPM_FOTO251=<cartella> salva le tre foto.
   ROSSO: CPM_ROSSO251=1 accende __CPM_NO_G251 (nomi di oggi): A, B, D ed E devono VEDERE i nomi di oggi (C vale in entrambi i bracci).
   «Non giudicato» = rosso. Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node nomi-251.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.env.CPM_ROSSO251 === '1';
const FOTO = process.env.CPM_FOTO251 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const fx = f => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const DUMP = fx('save-c177-s5w20.json');
/* id → [nome, sigla] definitivi (scelte del PO; alm2 = proposta del giro 251 per il doppione con alm, dubbio per il PO) */
const DEF = {"bur":["FC Burnley","BNL"],"car":["FC Cardiff","CDF"],"milw":["FC Bermondsey","BMD"],"nor":["FC Norwich","NRW"],"shu":["FC Sheffield South","SHS"],"sto":["FC Stoke","SKE"],"swn":["FC Swansea","SWS"],"wba":["FC West Bromwich","WBR"],"aug":["FC Augusta","AGS"],"bay":["FC Munchen","MUC"],"ber":["FC Berlin Köpenick","BKP"],"boc":["FC Bochum","BCH"],"bvb":["FC Westfalen","WSF"],"dsc":["FC Darmstadt","DMT"],"kol":["FC Koln","KLN"],"kaa":["FC Lautern","LTN"],"mag":["FC Börde","BRD"],"nub":["FC Norimberga","NRB"],"s04":["FC Emscher 04","EMS"],"sar":["FC Saarland","SRL"],"stp":["FC Hamburg Hafen","HHF"],"inter":["FC Nerazzurri","NRZ"],"juve":["FC Zebre","ZBR"],"lazio":["FC Biancocelesti","BNC"],"milan":["FC Rossoneri","RSN"],"napoli":["FC Partenope","PRT"],"sam":["FC Sampierdarena","SPD"],"tor":["FC Granata","GRT"],"cat":["FC Catanzarese","CTN"],"sal":["FC Salernum 1919","SLR"],"bas":["FC Istanbul Ovest","IOV"],"bes":["FC Boğaziçi","BGZ"],"krc":["FC Brugse","BGS"],"std":["FC Liegi","LGI"],"stu2":["FC Sint-Truiden","SNT"],"usj":["FC Bruxelles Sud","BXS"],"alm":["FC Almería","FAL"],"cel":["FC Ría de Vigo","RDV"],"cor2":["FC Cordobés","CDB"],"lev":["FC València Nord","VNR"],"ovi":["FC Ovetense","OVT"],"aroca":["FC Arouquense","ARQ"],"bav":["FC Foz do Douro","FDD"],"bra":["FC Bracarense","BRC"],"fama":["FC Famalicense","FMC"],"por":["FC Portuense","PTN"],"rioave":["FC Vila do Conde","VDC"],"vize":["FC Vizelense","VZL"],"emm":["FC Drenthe","DRT"],"exc":["FC Rotterdam Kralingen","RKL"],"gron":["FC Groninger","GNR"],"spa":["FC Rotterdam Spangen","RSP"],"twe":["FC Enschede","ENS"],"utr":["FC Oudegracht","ODG"],"volen":["FC Waterland","WTL"],"len":["FC Lensois","LSO"],"mtp":["FC Montpellier","MPL"],"psg":["FC Paris Île-de-France","PIF"],"rei":["FC Reims","RMS"],"ann":["FC Annecien","ANC"],"que":["FC Normandia","NMD"],"val2":["FC Valenciennes","VNS"],"cry":["FC Croydon","CYD"],"alm2":["FC Murciano","MRC"]};
/* id → [nome, sigla] di lavoro/197 (giro 248 compreso) dei club che cambiano */
const OGGI = {"bur":["FC Clarets","CLA"],"car":["FC Bluebirds","BLB"],"milw":["FC Dockers","DOC"],"nor":["FC Canaries","CAN"],"shu":["FC Steelers","STE"],"sto":["FC Potters","POT"],"swn":["FC Swans","SWA"],"wba":["FC Albion","ALB"],"aug":["FC Augsburg","AUG"],"bay":["FC Isar","ISR"],"ber":["FC Berlin Nord","BNO"],"boc":["FC Ruhrpott","RUH"],"bvb":["FC Goldwald","GLW"],"dsc":["FC Lilien","LLN"],"kol":["FC Domstadt","DMS"],"kaa":["FC Kaiserslautern","FCK"],"mag":["FC Magdeburg","MGB"],"nub":["FC Nürnberg","FCN"],"s04":["FC Gelsenkirchen","FGK"],"sar":["FC Saarbrücken","FCS"],"stp":["FC Sankt Hafen","SAN"],"inter":["FC Milano Brera","MBR"],"juve":["Torino Athletic","TAT"],"lazio":["FC Flaminio","FLM"],"milan":["FC Milano Sempione","MSE"],"napoli":["FC Napoli Fuorigrotta","NFG"],"sam":["FC Genova Ponente","GPO"],"tor":["FC Torino Santa Rita","TSR"],"cat":["FC Calabro","CLB"],"sal":["FC Salernum","SAL"],"bas":["FC Bosforo","BOS"],"bes":["FC Kartal","KAR"],"krc":["FC Westflandria","WFL"],"std":["FC Vallonia","VLA"],"stu2":["FC Truiden","TRU"],"usj":["FC Union","UNI"],"alm":["FC Indálico","IND"],"cel":["FC Vigués","VGS"],"cor2":["FC Califal","CAL"],"lev":["FC Granota","GRN"],"ovi":["FC Carbayón","CAR"],"aroca":["FC Aroalta","ARO"],"bav":["FC Panteras","PAN"],"bra":["FC Minhoto","MIN"],"fama":["FC Famalar","FAM"],"por":["FC Portomar","POR"],"rioave":["FC Rio Verde","RIO"],"vize":["FC Vizalta","VIZ"],"emm":["FC Emmen","EMM"],"exc":["FC Oostzijde","OOS"],"gron":["FC Groningen","GRO"],"spa":["FC Havenstad","HVN"],"twe":["FC Twente","TWE"],"utr":["FC Utrecht","UTR"],"volen":["FC Volendam","VOL"],"len":["FC Artois","ART"],"mtp":["FC Montpel","MON"],"psg":["FC Parigi Ovest","PGO"],"rei":["FC Remense","REM"],"ann":["FC Annecy","ANN"],"que":["FC Rouen","ROU"],"val2":["FC Valencien","VCN"],"cry":["FC Selhurst","SEL"],"alm2":["FC Almeriense","ALE"]};
const LEGA = {"juve":"Lega A","inter":"Lega A","milan":"Lega A","napoli":"Lega A","roma":"Lega A","lazio":"Lega A","ata":"Lega A","fio":"Lega A","tor":"Lega A","bol":"Lega A","udi":"Lega A","sas":"Lega A","cag":"Lega A","sam":"Lega A","gen":"Lega A","ver":"Lega A","mon2":"Lega A","lec":"Lega A","mcy":"Premier Division","liv":"Premier Division","ars":"Premier Division","che":"Premier Division","mun":"Premier Division","tot":"Premier Division","new":"Premier Division","avl":"Premier Division","whu":"Premier Division","bha":"Premier Division","eve":"Premier Division","lei":"Premier Division","wol":"Premier Division","cry":"Premier Division","ful":"Premier Division","bre":"Premier Division","nfo":"Premier Division","bou":"Premier Division","rma":"Liga Ibérica","bar":"Liga Ibérica","atm":"Liga Ibérica","sev":"Liga Ibérica","vill":"Liga Ibérica","rsoc":"Liga Ibérica","bet":"Liga Ibérica","val":"Liga Ibérica","osa":"Liga Ibérica","cel":"Liga Ibérica","ath":"Liga Ibérica","ray":"Liga Ibérica","gir":"Liga Ibérica","mall":"Liga Ibérica","get":"Liga Ibérica","las":"Liga Ibérica","alm":"Liga Ibérica","esp":"Liga Ibérica","bay":"Deutsche Liga","bvb":"Deutsche Liga","rbl":"Deutsche Liga","b04":"Deutsche Liga","bsc":"Deutsche Liga","fra":"Deutsche Liga","fre":"Deutsche Liga","wob":"Deutsche Liga","mgb":"Deutsche Liga","stu":"Deutsche Liga","aug":"Deutsche Liga","mai":"Deutsche Liga","hof":"Deutsche Liga","kol":"Deutsche Liga","wer":"Deutsche Liga","dsc":"Deutsche Liga","boc":"Deutsche Liga","ber":"Deutsche Liga","psg":"Ligue Nationale","marse":"Ligue Nationale","mon":"Ligue Nationale","lyon":"Ligue Nationale","nice":"Ligue Nationale","lille":"Ligue Nationale","ren":"Ligue Nationale","len":"Ligue Nationale","str":"Ligue Nationale","nan":"Ligue Nationale","mtp":"Ligue Nationale","rei":"Ligue Nationale","tou":"Ligue Nationale","lor":"Ligue Nationale","bre2":"Ligue Nationale","cle":"Ligue Nationale","hac":"Ligue Nationale","metz":"Ligue Nationale","ben":"Liga Lusitana","por":"Liga Lusitana","spo":"Liga Lusitana","bra":"Liga Lusitana","vsc":"Liga Lusitana","rioave":"Liga Lusitana","bav":"Liga Lusitana","estoril":"Liga Lusitana","gviz":"Liga Lusitana","fama":"Liga Lusitana","morei":"Liga Lusitana","vize":"Liga Lusitana","chav":"Liga Lusitana","aroca":"Liga Lusitana","casa":"Liga Lusitana","scar":"Liga Lusitana","aves":"Liga Lusitana","farense":"Liga Lusitana","ajax":"Liga Oranje","psv":"FC Eindhoven","feye":"Liga Oranje","az":"Liga Oranje","utr":"Liga Oranje","twe":"Liga Oranje","vita":"Liga Oranje","gron":"Liga Oranje","heer":"Liga Oranje","wil":"Liga Oranje","nec":"Liga Oranje","her":"Liga Oranje","gor":"Liga Oranje","spa":"Liga Oranje","exc":"Liga Oranje","cam":"Liga Oranje","volen":"Liga Oranje","emm":"Liga Oranje","club":"FC Bruges","and":"FC Anderlecht","genk":"Liga Belga","gent":"Liga Belga","std":"Liga Belga","usj":"Liga Belga","ant":"Liga Belga","krc":"Liga Belga","ohl":"Liga Belga","cha":"Liga Belga","mec":"Liga Belga","kor":"Liga Belga","stu2":"Liga Belga","wes":"Liga Belga","ser":"Liga Belga","zul":"Liga Belga","bch":"Liga Belga","eup":"Liga Belga","gal":"Liga Anatolica","fenk":"Liga Anatolica","bes":"Liga Anatolica","tra":"Liga Anatolica","bas":"Liga Anatolica","ada":"Liga Anatolica","siv":"Liga Anatolica","kas":"Liga Anatolica","ank":"Liga Anatolica","ant2":"Liga Anatolica","kon":"Liga Anatolica","kay":"Liga Anatolica","hat":"Liga Anatolica","riz":"Liga Anatolica","ala":"Liga Anatolica","kag":"Liga Anatolica","pen":"Liga Anatolica","sam2":"Liga Anatolica","par":"Lega B","cre":"Lega B","mod":"Lega B","pal":"Lega B","cat":"Lega B","spe":"Lega B","bar2":"Lega B","ven":"Lega B","pis":"Lega B","fro":"Lega B","ces":"Lega B","samp":"Lega B","sal":"Lega B","cit":"Lega B","sdt":"Lega B","cos":"Lega B","bres":"Lega B","lec2":"Lega B","lut":"Championship","mid":"Championship","cov":"Championship","swn":"Championship","shu":"Championship","ips":"Championship","lee":"Championship","bur":"Championship","nor":"Championship","wba":"Championship","bri":"Championship","milw":"Championship","bla":"Championship","pre":"Championship","car":"Championship","wat":"Championship","sto":"Championship","qpr":"Championship","hbu":"Deutsche Liga 2","han":"Deutsche Liga 2","nub":"Deutsche Liga 2","kar":"Deutsche Liga 2","kil":"Deutsche Liga 2","kaa":"Deutsche Liga 2","duf":"Deutsche Liga 2","fur":"Deutsche Liga 2","s04":"Deutsche Liga 2","mag":"Deutsche Liga 2","pad":"Deutsche Liga 2","ros":"Deutsche Liga 2","brn":"Deutsche Liga 2","sar":"Deutsche Liga 2","dre":"Deutsche Liga 2","stp":"Deutsche Liga 2","osn":"Deutsche Liga 2","arm":"Deutsche Liga 2","gre":"Ligue Nationale 2","nic2":"Ligue Nationale 2","val2":"Ligue Nationale 2","pau":"Ligue Nationale 2","cae":"Ligue Nationale 2","lav":"Ligue Nationale 2","ann":"Ligue Nationale 2","tro":"Ligue Nationale 2","ami":"Ligue Nationale 2","dun":"Ligue Nationale 2","gui":"Ligue Nationale 2","rod":"Ligue Nationale 2","aja2":"Ligue Nationale 2","bas2":"Ligue Nationale 2","soch":"FC Sochaux","aux":"Ligue Nationale 2","que":"Ligue Nationale 2","con2":"Ligue Nationale 2","dep":"Liga Ibérica 2","real2":"Liga Ibérica 2","lev":"Liga Ibérica 2","tene":"Liga Ibérica 2","vld":"Liga Ibérica 2","hue":"Liga Ibérica 2","bur2":"Liga Ibérica 2","zgz":"Liga Ibérica 2","mir":"Liga Ibérica 2","alb":"Liga Ibérica 2","elx":"Liga Ibérica 2","mal":"Liga Ibérica 2","snd":"Liga Ibérica 2","ovi":"Liga Ibérica 2","cad":"Liga Ibérica 2","alm2":"Liga Ibérica 2","cor2":"Liga Ibérica 2","fer":"Liga Ibérica 2"};
/* sigle di oggi che escono e non sono la sigla definitiva di nessun club */
const SIGLE_VECCHIE = {"bur":"CLA","car":"BLB","milw":"DOC","nor":"CAN","shu":"STE","sto":"POT","swn":"SWA","wba":"ALB","aug":"AUG","bay":"ISR","ber":"BNO","boc":"RUH","bvb":"GLW","dsc":"LLN","kol":"DMS","kaa":"FCK","mag":"MGB","nub":"FCN","s04":"FGK","sar":"FCS","stp":"SAN","inter":"MBR","juve":"TAT","lazio":"FLM","milan":"MSE","napoli":"NFG","sam":"GPO","tor":"TSR","cat":"CLB","sal":"SAL","bas":"BOS","bes":"KAR","krc":"WFL","std":"VLA","stu2":"TRU","usj":"UNI","alm":"IND","cel":"VGS","cor2":"CAL","lev":"GRN","ovi":"CAR","aroca":"ARO","bav":"PAN","bra":"MIN","fama":"FAM","por":"POR","rioave":"RIO","vize":"VIZ","emm":"EMM","exc":"OOS","gron":"GRO","spa":"HVN","twe":"TWE","utr":"UTR","volen":"VOL","len":"ART","mtp":"MON","psg":"PGO","rei":"REM","ann":"ANN","que":"ROU","val2":"VCN","cry":"SEL","alm2":"ALE"};
const G6 = ['FC Valmora','AC Dorvelli','FC Vellamare','FC Alcavera','FC Lumeranza','FC Torvelle','FC Brenvar','FC Marnesi','FC Caldoran','FC Ventrana','FC Oriolan','FC Dalvora','FC Pelvanni','FC Valdenau','FC Ravelmund','FC Rendalto'];
const REALI = ['AC Rossoneri','FC Biancoceleste','FC Paris','FC Viola','FC Blucerchiati','FC Neroverde','FC Verdiblanco','FC Celeste','FC Leões','FC Perico','FC Azulón','FC München','FC Köln'];
const STADI_VECCHI = ['Goldwald Stadion','Gelsenkirchen Arena'];
const SUPERATI = [...new Set([...Object.values(OGGI).map(v => v[0]), ...G6, ...REALI, ...STADI_VECCHI])];
const DEFN = Object.values(DEF).map(v => v[0]);
/* occorrenze di un nome superato come parola intera, escluse quelle che sono l'inizio di un nome definitivo piu' lungo
   («FC Paris» dentro «FC Paris Île-de-France», «FC Salernum» dentro «FC Salernum 1919») */
const L = /\p{L}/u;
function superati(txt) {
  const t = String(txt), out = [];
  for (const s of SUPERATI) { let i = t.indexOf(s);
    while (i >= 0) { const pre = i > 0 ? t[i - 1] : '', post = t[i + s.length] || '';
      const lungo = DEFN.some(d => d.length > s.length && d.startsWith(s) && t.startsWith(d, i));
      if (!L.test(pre) && !L.test(post) && !lungo) out.push(s);
      i = t.indexOf(s, i + 1); } }
  return out;
}
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const giudica = (condVerde, mVerde, mRosso) => ROSSO ? ok(!condVerde, '[rosso] ' + mRosso) : ok(condVerde, mVerde);
/* [giro 453] questo guardiano giudica il SUO livello di nomi: i nomi di fantasia del giro 453 (sopra) si spengono, li giudica nomi-453 */
const flags = [...(ROSSO ? ['__CPM_NO_G251'] : []), '__CPM_NO_G453'];
const nrm = t => String(t || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const sottoseq = (a, n) => { a = nrm(a); n = nrm(n); let i = 0; for (const ch of a) { i = n.indexOf(ch, i); if (i < 0) return false; i++; } return !!a; };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
try {
  console.log(`nomi-251 ${ROSSO ? '[ROSSO __CPM_NO_G251]' : '[verde]'}`);
  {
    const { page, errs } = await apri(b, port, 360, { h: 780, flags, carriera: false });
    await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function' && typeof window._auditCopyright === 'function', null, { timeout: 60000 });
    const d = await page.evaluate(() => ({ cl: CLUBS.map(c => [c.id, c.n, c.a]), st: { bvb: CLUB_STADIUMS.bvb, s04: CLUB_STADIUMS.s04 },
      testo: JSON.stringify([CLUBS.map(c => c.n), U18_CLUBS.map(c => c.n || c.name), U18_CLUBS_P2.map(c => c.n || c.name), STADIUM_POOLS, CLUB_STADIUMS, LEAGUE_RECORDS, EURO_COMP_WINNERS]),
      hits: window._auditCopyright().filter(h => !/-453: /.test(h)) /* [giro 453] le parole del 453 le giudica nomi-453 */ }));
    const by = Object.fromEntries(d.cl.map(([i, n, a]) => [i, [n, a]]));
    const diversi = Object.keys(DEF).filter(i => !by[i] || by[i][0] !== DEF[i][0] || by[i][1] !== DEF[i][1]);
    giudica(diversi.length === 0, `A · ${Object.keys(DEF).length}/${Object.keys(DEF).length} club col nome e la sigla definitivi`,
      `A · club con nomi di oggi: ${diversi.length}/${Object.keys(DEF).length} diversi (es. ${diversi.slice(0, 3).map(i => i + '=' + (by[i] || []).join('/')).join(', ')})`);
    giudica(d.st.bvb === 'Hörde Stadion' && d.st.s04 === 'Emscher Arena', `A · stadi bvb «${d.st.bvb}», s04 «${d.st.s04}»`, `A · stadi di oggi bvb «${d.st.bvb}», s04 «${d.st.s04}»`);
    const sd = superati(d.testo);
    giudica(sd.length === 0, `A · nomi superati nei dati (club, Primavera, stadi, record, albo): ${sd.length}`, `A · nomi superati nei dati: ${sd.length} (> 0, es. ${[...new Set(sd)].slice(0, 4).join(', ')})`);
    giudica(d.hits.length === 0, `B · audit copyright: ${d.hits.length} hit`, `B · audit copyright: ${d.hits.length} hit (> 0, es. ${d.hits[0] || '—'})`);
    if (!ROSSO && d.hits.length) note.push('hit: ' + d.hits.slice(0, 5).join(' | '));
    const sig = d.cl.map(x => x[2]); const doppie = sig.filter((a, i) => sig.indexOf(a) !== i);
    const malformate = d.cl.filter(([, n, a]) => !/^[A-Z0-9]{3}$/.test(a) || !sottoseq(a, n));
    ok(d.cl.length === 252 && doppie.length === 0 && malformate.length === 0, `C · sigle: ${d.cl.length} club, doppie ${doppie.length}${doppie.length ? ' (' + doppie.join(',') + ')' : ''}, non valide ${malformate.length}${malformate.length ? ' (' + malformate.slice(0, 3).map(x => x.join('/')).join(', ') + ')' : ''}`);

    /* D · migrazione */
    const p0 = JSON.parse(DUMP['cpm-v3']).player;
    const costruito = JSON.parse(JSON.stringify(p0));
    const ids = Object.keys(OGGI);
    costruito.matchHistory = [...(costruito.matchHistory || []), ...ids.map((id, k) => ({ season: 1, week: 1 + (k % 30), opponent: OGGI[id][0] + (k % 4 === 1 ? ' Primavera' : k % 4 === 2 ? ' U19' : ''), oppAbbr: OGGI[id][1], ris: '1-0', _g251: id }))];
    /* la classifica salvata: i club della lega dell'eroe che cambiano col loro nome e sigla di oggi (la migrazione di CareerApp riconcilia la classifica sugli id) */
    costruito.standings = (costruito.standings || []).map(r => OGGI[r.id] ? { ...r, n: OGGI[r.id][0], a: OGGI[r.id][1] } : r);
    costruito.diary = [...(costruito.diary || []), { t: 'Derby: ' + ids.slice(0, 20).map(i => OGGI[i][0] + ' U18').join(', ') + '.' }, { t: 'Visti: ' + [...G6, ...REALI].join(' · ') }];
    costruito.history = [...(costruito.history || []), { season: 0, club: OGGI.psg[0] + ' Primavera', clubId: 'psg', goals: 1 }, { season: 0, club: 'FC Salernum Primavera', clubId: 'sal', goals: 0 }];
    const salvati = { costruito, c177: p0, s190: fx('save-190-s12-ovr93.json').player, s195: fx('save-195-primavera-w39.json').player };
    const m = await page.evaluate(([salvati, dn]) => { const M = window.__CPM_MIGRATE; const un = r => (r && r.player) || r; const out = {};
      const stringhe = o => { const a = []; const w = x => { if (typeof x === 'string') a.push(x); else if (x && typeof x === 'object') for (const k in x) w(x[k]); }; w(o); return a.join('\n'); };
      for (const k in salvati) { const m1 = un(M(JSON.parse(JSON.stringify(salvati[k])))); const m2 = un(M(JSON.parse(JSON.stringify(m1))));
        out[k] = { prima: stringhe(salvati[k]), dopo: stringhe(m1), idem: JSON.stringify(m1) === JSON.stringify(m2),
          coppie: [...(m1.matchHistory || []).filter(h => h._g251).map(h => [h._g251, h.opponent, h.oppAbbr]), ...(m1.standings || []).filter(r => r.n && dn[r.n.replace(/ (Primavera|U18|U19)$/, '')]).map(r => [dn[r.n.replace(/ (Primavera|U18|U19)$/, '')], r.n, r.a])],
          storia: (m1.history || []).filter(h => h.season === 0).map(h => h.club) }; }
      return out; }, [salvati, Object.fromEntries(Object.entries(DEF).map(([i, v]) => [v[0], i]))]);
    for (const k in m) { const pr = superati(m[k].prima).length, dp = superati(m[k].dopo);
      if (k === 'costruito' || k === 'c177') ok(pr > 0, `D · ${k}: nomi superati prima della migrazione ${pr} (se 0 la prova non giudica)`); else note.push(`${k}: nomi superati prima ${pr}`);
      giudica(dp.length === 0, `D · ${k}: dopo la migrazione 0 nomi superati (${dp.length})`, `D · ${k}: dopo la migrazione restano ${dp.length} nomi superati (es. ${[...new Set(dp)].slice(0, 3).join(', ')})`);
      ok(m[k].idem, `D · ${k}: seconda applicazione senza modifiche: ${m[k].idem}`); }
    const c = m.costruito.coppie; const sbagliate = c.filter(([id, n, a]) => n.replace(/ (Primavera|U18|U19)$/, '') !== DEF[id][0] || a !== DEF[id][1]);
    giudica(c.length > 0 && sbagliate.length === 0, `D · costruito: nome e sigla definitivi in ${c.length - sbagliate.length}/${c.length} righe (storico + classifica, anche con Primavera/U19)${sbagliate.length ? " — " + sbagliate.slice(0, 3).map(x => x.join("/")).join(", ") : ""}`,
      `D · costruito: ${sbagliate.length}/${c.length} righe con nome o sigla di oggi (es. ${sbagliate.slice(0, 2).map(x => x.join('/')).join(', ')})`);
    giudica(m.costruito.storia.join('|') === 'FC Paris Île-de-France Primavera|FC Salernum 1919 Primavera', `D · prefissi protetti: «${m.costruito.storia.join('» «')}»`, `D · storia non migrata: «${m.costruito.storia.join('» «')}»`);
    ok(errs.length === 0, `A-D · nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
  /* E · tre classifiche a 360 px */
  for (const [lega, eroe] of [['Lega A', 'juve'], ['Deutsche Liga', 'bvb'], ['Championship', 'nor']]) {
    const { page, errs } = await apri(b, port, 360, { h: 900, flags });
    await page.evaluate(([lega, eroe]) => { const la = CLUBS.filter(c => c.lg === lega); const st = initStandings(la).map(r => { const g = 19, w = Math.round(g * r.p / 140), dr = Math.min(g - w, 5); return { ...r, played: g, wins: w, draws: dr, losses: g - w - dr, gf: w * 2 + dr, ga: (g - w) * 1, gd: w * 2 + dr - (g - w), pts: w * 3 + dr }; });
      const me = la.find(c => c.id === eroe); window.__CPM_CAREER.patch({ club: { ...me, isU18: false }, standings: st }); }, [lega, eroe]);
    await sleep(1000); await vai(page, 'standings', 1600);
    const t = await page.evaluate(() => document.body.innerText);
    const tag = lega.toLowerCase().replace(/\s+/g, '-');
    if (FOTO) await page.screenshot({ path: `${FOTO}/classifica-${tag}-360-${ROSSO ? 'prima' : 'dopo'}.png`, fullPage: true });
    const ids = Object.keys(LEGA).filter(i => LEGA[i] === lega), cambiati = ids.filter(i => DEF[i] && OGGI[i]);
    const visti = cambiati.filter(i => new RegExp('\\b' + esc(DEF[i][1]) + '\\b').test(t) || t.includes(DEF[i][0]));
    const vecchi = cambiati.filter(i => (SIGLE_VECCHIE[i] && new RegExp('\\b' + esc(SIGLE_VECCHIE[i]) + '\\b').test(t)) || superati(t).includes(OGGI[i][0]));
    giudica(cambiati.length > 0 && visti.length === cambiati.length && vecchi.length === 0,
      `E · classifica ${lega}: ${visti.length}/${cambiati.length} club cambiati con nome o sigla definitivi, ${vecchi.length} con nome/sigla di oggi`,
      `E · classifica ${lega}: ${vecchi.length}/${cambiati.length} club con nome/sigla di oggi a schermo (es. ${vecchi.slice(0, 3).map(i => SIGLE_VECCHIE[i] || OGGI[i][0]).join(', ')})`);
    ok(errs.length === 0, `E · ${lega}: nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.stack || e).slice(0, 300)); }
await b.close(); srv.close();
console.log('\nNOTE'); for (const n of note) console.log('  · ' + n);
console.log(`\nnomi-251 ${ROSSO ? '[ROSSO __CPM_NO_G251]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
