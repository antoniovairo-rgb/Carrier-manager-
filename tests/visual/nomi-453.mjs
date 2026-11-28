/* [giro 453 PO-694] GUARDIANO «nomi dei club di fantasia» — PO 28/11, foto docs/collaudo-po/220-championship-nomi.jpg:
   «Controlla i nomi delle squadre di championship, alcuni sono troppo vicini alla realta'».
   A · i 40 club rinominati hanno nome e sigla nuovi (tabella CLUB_NOMI_453 di src/02), sigla diversa da quella di prima, nome corto
       (nomeCorto296) di 10 caratteri al massimo e unico; stadi e derby rinominati.
   B · AUDIT: window._auditCopyright() a 0 hit (lista _CR_ZONE453 di citta', soprannomi, stadi e nomi veri compresa).
   C · MIGRAZIONE: un salvataggio coi nomi di prima (251 e mkT, anche con Primavera/U19, sigle accanto) esce coi nomi nuovi, in un
       passo solo e idempotente; il salvataggio della fixture c177 non perde nulla.
   D · CLASSIFICA a schermo (360 px) di una lega per paese con club rinominati: nome o sigla nuovi, nessun nome/sigla di prima.
   ROSSO: CPM_ROSSO453=1 accende __CPM_NO_G453 (nomi del 7.999.219): A, B, C e D devono VEDERE i nomi di prima.
   «Non giudicato» = rosso. Foto: CPM_FOTO453=<cartella>. Uso: cd tests/visual && node nomi-453.mjs && CPM_ROSSO453=1 node nomi-453.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.env.CPM_ROSSO453 === '1';
const FOTO = process.env.CPM_FOTO453 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const fx = f => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const DUMP = fx('save-c177-s5w20.json');
/* id → [nome, sigla] nuovi (giro 453) e del 7.999.219, lega */
const NU = {"che": ["FC Kingsreach", "KGR"], "avl": ["FC Heathmoor", "HTM"], "whu": ["FC Eastwharf", "EWF"], "eve": ["FC Northdock", "NDK"], "lei": ["FC Soarvale", "SRV"], "ful": ["FC Millbourne", "MLB"], "bre": ["FC Bransholt", "BHT"], "atm": ["FC Meseta Sur", "MSU"], "vill": ["FC Naranjal", "NRJ"], "rsoc": ["FC Donostiarra", "DNS"], "esp": ["FC Tibidabo", "TBD"], "bay": ["FC Alpenland", "APL"], "kol": ["FC Rheinbogen", "RHB"], "mon": ["FC Rocher", "ROC"], "farense": ["FC Algarvio", "AGV"], "ant": ["FC Schelde", "SCD"], "kas": ["FC Haliç", "HLC"], "sal": ["FC Costiera", "CST"], "bres": ["FC Cidneo", "CDN"], "lut": ["FC Dunmere", "DMR"], "mid": ["FC Ironmouth", "IRM"], "cov": ["FC Spirewell", "SPW"], "swn": ["FC Gowerhaven", "GWH"], "shu": ["FC Forgeham", "FGH"], "ips": ["FC Orwick", "ORK"], "lee": ["FC Wharfholm", "WHM"], "bur": ["FC Pendleby", "PDY"], "nor": ["FC Broadmere", "BMR"], "wba": ["FC Tipworth", "TPW"], "bri": ["FC Brigport", "BGP"], "milw": ["FC Riverlane", "RVL"], "bla": ["FC Cottonford", "CTF"], "pre": ["FC Ribblemead", "RBM"], "car": ["FC Llanmere", "LMR"], "wat": ["FC Colnemead", "CNM"], "sto": ["FC Kilnford", "KLF"], "qpr": ["FC Whitlock", "WTK"], "s04": ["FC Emschertal", "EMT"], "pau": ["FC Béarnais", "BEA"], "vld": ["FC Vallisoletano", "VLS"]};
const PR = {"che": ["FC Stamford", "STA"], "avl": ["FC Aston", "AST"], "whu": ["FC Hammers", "HAM"], "eve": ["FC Goodison", "GDS"], "lei": ["FC Foxshire", "FOX"], "ful": ["FC Craven", "CRA"], "bre": ["FC Griffin", "GRI"], "atm": ["AT Manzanares", "ATM"], "vill": ["FC Submarino", "SUB"], "rsoc": ["FC Sociedad", "SOC"], "esp": ["FC Sarrià", "SRR"], "bay": ["FC Munchen", "MUC"], "kol": ["FC Koln", "KLN"], "mon": ["FC Monaco", "MCO"], "farense": ["FC Farense", "FAR"], "ant": ["FC Antwerp", "ANT"], "kas": ["FC Kasimpasa", "KAS"], "sal": ["FC Salernum 1919", "SLR"], "bres": ["FC Leonessa", "LNS"], "lut": ["FC Luton", "LUT"], "mid": ["FC Teesside", "TES"], "cov": ["FC Coventry", "COV"], "swn": ["FC Swansea", "SWS"], "shu": ["FC Sheffield South", "SHS"], "ips": ["FC Ipswich", "IPS"], "lee": ["FC Leeds", "LEE"], "bur": ["FC Burnley", "BNL"], "nor": ["FC Norwich", "NRW"], "wba": ["FC West Bromwich", "WBR"], "bri": ["FC Bristol", "BRS"], "milw": ["FC Bermondsey", "BMD"], "bla": ["FC Blackburn", "BBR"], "pre": ["FC Preston", "PRE"], "car": ["FC Cardiff", "CDF"], "wat": ["FC Hornets", "HOR"], "sto": ["FC Stoke", "SKE"], "qpr": ["FC Queensway", "QUE"], "s04": ["FC Emscher 04", "EMS"], "pau": ["FC Pau", "PAU"], "vld": ["FC Pucela", "PUC"]};
const LG = {"che": "Premier Division", "avl": "Premier Division", "whu": "Premier Division", "eve": "Premier Division", "lei": "Premier Division", "ful": "Premier Division", "bre": "Premier Division", "atm": "Liga Ibérica", "vill": "Liga Ibérica", "rsoc": "Liga Ibérica", "esp": "Liga Ibérica", "bay": "Deutsche Liga", "kol": "Deutsche Liga", "mon": "Ligue Nationale", "farense": "Liga Lusitana", "ant": "Liga Belga", "kas": "Liga Anatolica", "sal": "Lega B", "bres": "Lega B", "lut": "Championship", "mid": "Championship", "cov": "Championship", "swn": "Championship", "shu": "Championship", "ips": "Championship", "lee": "Championship", "bur": "Championship", "nor": "Championship", "wba": "Championship", "bri": "Championship", "milw": "Championship", "bla": "Championship", "pre": "Championship", "car": "Championship", "wat": "Championship", "sto": "Championship", "qpr": "Championship", "s04": "Deutsche Liga 2", "pau": "Ligue Nationale 2", "vld": "Liga Ibérica 2"};
const DERBY_PRIMA = ['Der Klassiker', 'Derbi Madrileño', 'El Clásico', 'Le Classique', 'De Klassieker'];
const STADI_PRIMA = ['Stadio Salernum', 'Aston Park', 'München Arena'];
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const giudica = (condVerde, mVerde, mRosso) => ROSSO ? ok(!condVerde, '[rosso] ' + mRosso) : ok(condVerde, mVerde);
const flags = ROSSO ? ['__CPM_NO_G453'] : [];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const L = /\p{L}/u;
const NUN = Object.values(NU).map(v => v[0]);
/* occorrenze dei nomi di prima come parola intera (non dentro un nome nuovo piu' lungo) */
function prima(txt) { const t = String(txt), out = [];
  for (const s of [...new Set(Object.values(PR).map(v => v[0]))]) { let i = t.indexOf(s);
    while (i >= 0) { const pre = i > 0 ? t[i - 1] : '', post = t[i + s.length] || '';
      const lungo = NUN.some(d => d.length > s.length && d.startsWith(s) && t.startsWith(d, i));
      if (!L.test(pre) && !L.test(post) && !lungo) out.push(s); i = t.indexOf(s, i + 1); } }
  return out; }

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
try {
  console.log(`nomi-453 ${ROSSO ? '[ROSSO __CPM_NO_G453]' : '[verde]'}`);
  {
    const { page, errs } = await apri(b, port, 360, { h: 780, flags, carriera: false });
    await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function' && typeof window._auditCopyright === 'function' && typeof window.__CPM_CORTI296 === 'function', null, { timeout: 60000 });
    const d = await page.evaluate(() => ({ cl: CLUBS.map(c => [c.id, c.n, c.a]), corti: window.__CPM_CORTI296(),
      stadi: JSON.stringify([STADIUM_POOLS, CLUB_STADIUMS]), derby: Object.values(DERBIES).map(x => x.name),
      hits: window._auditCopyright(), h453: window._auditCopyright().filter(h => /-453: /.test(h)).length }));
    const by = Object.fromEntries(d.cl.map(([i, n, a]) => [i, [n, a]]));
    const ids = Object.keys(NU);
    const diversi = ids.filter(i => !by[i] || by[i][0] !== NU[i][0] || by[i][1] !== NU[i][1]);
    giudica(diversi.length === 0, `A · ${ids.length - diversi.length}/${ids.length} club col nome e la sigla di fantasia`,
      `A · club coi nomi di prima: ${diversi.length}/${ids.length} (es. ${diversi.slice(0, 3).map(i => i + '=' + (by[i] || []).join('/')).join(', ')})`);
    ok(ids.every(i => NU[i][1] !== PR[i][1]), `A · sigla nuova diversa da quella di prima in ${ids.filter(i => NU[i][1] !== PR[i][1]).length}/${ids.length}`);
    const sig = d.cl.map(x => x[2]); const doppie = sig.filter((a, i) => sig.indexOf(a) !== i);
    const nomi = d.cl.map(x => x[1]); const nd = nomi.filter((a, i) => nomi.indexOf(a) !== i);
    ok(d.cl.length === 252 && doppie.length === 0 && nd.length === 0, `A · 252 club, sigle doppie ${doppie.length}, nomi doppi ${nd.length}`);
    const cr = d.corti.filter(c => ids.includes(c.id)); const kk = d.corti.map(c => c.corto); const cd = kk.filter((a, i) => a && kk.indexOf(a) !== i);
    const cattivi = cr.filter(c => !c.corto || c.corto.length > 10 || c.corto === c.a);
    ok(cr.length === ids.length && cattivi.length === 0 && cd.length === 0, `A · nome corto dei rinominati: ${cr.length - cattivi.length}/${ids.length} validi (<= 10, diverso dalla sigla), doppi fra tutti ${cd.length}${cattivi.length ? ' — ' + cattivi.slice(0, 3).map(c => c.n + '=' + c.corto).join(', ') : ''}`);
    const sv = STADI_PRIMA.filter(s => d.stadi.includes('"' + s + '"')), dv = DERBY_PRIMA.filter(x => d.derby.includes(x));
    giudica(sv.length === 0 && dv.length === 0, `A · stadi di prima ${sv.length}, derby di prima ${dv.length}`, `A · stadi di prima ${sv.length}, derby di prima ${dv.length} (> 0)`);
    giudica(d.hits.length === 0, `B · audit copyright: ${d.hits.length} hit`, `B · audit copyright: ${d.hits.length} hit, di cui ${d.h453} della lista 453 (> 0, es. ${d.hits[0] || '—'})`);
    if (ROSSO) ok(d.h453 > 0, `B · il rosso e' giudicato: ${d.h453} hit della lista 453 (se 0 la lista non vede i nomi di prima)`);
    /* C · migrazione */
    const p0 = JSON.parse(DUMP['cpm-v3']).player;
    const costruito = JSON.parse(JSON.stringify(p0));
    /* righe di prova in un campo neutro: in matchHistory (stagione 1 dentro un salvataggio di stagione 5) la migrazione ripara il
       calendario in due passi anche col rosso, cioe' senza il giro 453 (misurato): la prova d'idempotenza giudicherebbe quello */
    costruito.archivio453 = ids.map((id, k) => ({ season: 1, week: 1 + (k % 30), opponent: PR[id][0] + (k % 4 === 1 ? ' Primavera' : k % 4 === 2 ? ' U19' : ''), oppAbbr: PR[id][1], ris: '1-0', _g453: id }));
    costruito.diary = [...(costruito.diary || []), { t: 'Visti: ' + ids.map(i => PR[i][0]).join(' · ') + ' · ' + STADI_PRIMA.join(' · ') }];
    costruito._club453 = { id: 'wat', n: PR.wat[0], a: PR.wat[1] }; /* oggetto club generico (n + sigla accanto): non si cambia il club dell'eroe, la migrazione rigenererebbe rosa e calendario */
    const salvati = { costruito, c177: p0 };
    const m = await page.evaluate(([salvati]) => { const M = window.__CPM_MIGRATE; const un = r => (r && r.player) || r; const out = {};
      const stringhe = o => { const a = []; const w = x => { if (typeof x === 'string') a.push(x); else if (x && typeof x === 'object') for (const k in x) w(x[k]); }; w(o); return a.join('\n'); };
      for (const k in salvati) { const m1 = un(M(JSON.parse(JSON.stringify(salvati[k])))); const m2 = un(M(JSON.parse(JSON.stringify(m1))));
        const _d = []; const _w = (x, y, pth) => { if (JSON.stringify(x) === JSON.stringify(y)) return; if (x && y && typeof x === 'object') { for (const kk in x) _w(x[kk], y[kk], pth + '.' + kk); } else _d.push(pth + ': ' + JSON.stringify(x) + ' -> ' + JSON.stringify(y)); }; _w(m1, m2, k);
        out[k] = { diff2: _d.slice(0, 5), prima: stringhe(salvati[k]), dopo: stringhe(m1), idem: JSON.stringify(m1) === JSON.stringify(m2), club: [m1._club453 && m1._club453.n, m1._club453 && m1._club453.a],
          coppie: (m1.archivio453 || []).filter(h => h._g453).map(h => [h._g453, h.opponent, h.oppAbbr]), nmh: (m1.matchHistory || []).length, nmh0: (salvati[k].matchHistory || []).length }; }
      return out; }, [salvati]);
    const pc = prima(m.costruito.prima).length, dc = prima(m.costruito.dopo);
    ok(pc > 0, `C · costruito: nomi di prima prima della migrazione ${pc} (se 0 la prova non giudica)`);
    giudica(dc.length === 0, `C · costruito: dopo la migrazione 0 nomi di prima (${dc.length})`, `C · costruito: dopo la migrazione restano ${dc.length} nomi di prima (es. ${[...new Set(dc)].slice(0, 3).join(', ')})`);
    const c = m.costruito.coppie; const sb = c.filter(([id, n, a]) => n.replace(/ (Primavera|U18|U19)$/, '') !== NU[id][0] || a !== NU[id][1]);
    if (sb.length) note.push('righe: ' + JSON.stringify(sb.slice(0, 4)));
    giudica(c.length === ids.length && sb.length === 0, `C · costruito: nome e sigla nuovi in ${c.length - sb.length}/${c.length} righe (anche Primavera/U19)`, `C · costruito: ${sb.length}/${c.length} righe con nome o sigla di prima`);
    giudica(m.costruito.club[0] === NU.wat[0] && m.costruito.club[1] === NU.wat[1], `C · oggetto club (nome + sigla): «${m.costruito.club.join(' / ')}»`, `C · oggetto club non migrato: «${m.costruito.club.join(' / ')}»`);
    if (!m.costruito.idem) note.push('seconda passata: ' + m.costruito.diff2.join(' | '));
    ok(m.costruito.idem && m.c177.idem, `C · seconda applicazione senza modifiche: costruito ${m.costruito.idem}, c177 ${m.c177.idem}`);
    ok(m.c177.nmh === m.c177.nmh0 && m.costruito.nmh === m.costruito.nmh0, `C · nessuna riga persa: c177 ${m.c177.nmh}/${m.c177.nmh0}, costruito ${m.costruito.nmh}/${m.costruito.nmh0}`);
    ok(errs.length === 0, `A-C · nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
  /* D · una classifica per paese (lega con club rinominati) a 360 px; Liga Oranje non ha club rinominati */
  for (const [lega, eroe] of [['Championship', 'wat']].concat(process.env.CPM_SOLO453 ? [] : [['Premier Division', 'che'], ['Liga Ibérica', 'vill'], ['Deutsche Liga', 'bay'], ['Lega B', 'sal'], ['Liga Belga', 'ant'], ['Liga Lusitana', 'farense'], ['Liga Anatolica', 'kas'], ['Ligue Nationale', 'mon']])) {
    const { page, errs } = await apri(b, port, 360, { h: 900, flags });
    await page.evaluate(([lega, eroe]) => { const la = CLUBS.filter(c => c.lg === lega); const st = initStandings(la).map(r => { const g = 19, w = Math.round(g * r.p / 140), dr = Math.min(g - w, 5); return { ...r, played: g, wins: w, draws: dr, losses: g - w - dr, gf: w * 2 + dr, ga: (g - w) * 1, gd: w * 2 + dr - (g - w), pts: w * 3 + dr }; });
      const me = la.find(c => c.id === eroe); window.__CPM_CAREER.patch({ club: { ...me, isU18: false }, standings: st }); }, [lega, eroe]);
    await sleep(1000); await vai(page, 'standings', 1600);
    const t = await page.evaluate(() => document.body.innerText);
    const tag = lega.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
    if (FOTO) await page.screenshot({ path: `${FOTO}/453-classifica-${tag}-${ROSSO ? 'prima' : 'dopo'}.png`, fullPage: true });
    const cambiati = Object.keys(NU).filter(i => LG[i] === lega);
    const visti = cambiati.filter(i => new RegExp('\\b' + esc(NU[i][1]) + '\\b').test(t) || t.includes(NU[i][0]));
    const vecchi = cambiati.filter(i => new RegExp('\\b' + esc(PR[i][1]) + '\\b').test(t) || prima(t).includes(PR[i][0]));
    giudica(cambiati.length > 0 && visti.length === cambiati.length && vecchi.length === 0,
      `D · classifica ${lega}: ${visti.length}/${cambiati.length} club rinominati col nome o la sigla nuovi, ${vecchi.length} coi vecchi`,
      `D · classifica ${lega}: ${vecchi.length}/${cambiati.length} club col nome/sigla di prima a schermo (es. ${vecchi.slice(0, 3).map(i => PR[i][1]).join(', ')})`);
    ok(errs.length === 0, `D · ${lega}: nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
    await page.context().close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.stack || e).slice(0, 300)); }
await b.close(); srv.close();
console.log('\nNOTE'); for (const n of note) console.log('  · ' + n);
console.log(`\nnomi-453 ${ROSSO ? '[ROSSO __CPM_NO_G453]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
