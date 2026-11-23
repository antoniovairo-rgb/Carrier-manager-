#!/usr/bin/env node
/* [giro 200 · PO-448, G193-18 «rifiniture viste negli anni lunghi» + giro 198 «da svincolato»] GUARDIANO rifiniture-200.
   Un caso riprodotto per ogni voce corretta (solo testi e numeri mostrati: nessuna regola di gioco, nessuna economia).
   Gioco vero (?cpmtest=1), salvataggio sintetico (misura-199) + __CPM_CAREER.patch / goTab / apriFine302,
   tutte le fisarmoniche aperte (__CPM_FIS_APERTE). Una pagina nuova per caso.
     P1  Nazionale › Coppa delle Nazioni vinta in finale: la scheda dice «Campioni» e i punti del girone (7/9), non «Eliminati · 10/9»
     P2  bilancio di fine stagione, coppa europea uscita agli ottavi: l'intestazione dice dove («agli ottavi»), non un «Eliminato» nudo
     P3  bilancio di fine stagione: anni di contratto dalla scadenza vera (2, non la durata 3); all'addio annunciato nessun «Contratto attivo»
     P4  Agente da svincolato: niente «Stipendio attuale» ne' «Richiedi cessione»
     P5  traguardi di un calciatore spagnolo: «Gol in Nazionale», non «Gol Azzurro»
     P6  La città ti ricorda: il club dove giochi ancora non e' «Rispettato» d'ufficio
     P7  Nazionale › lista del CT: niente «maglia numero 9» (in campo il numero e' un altro)
     P9  annuncio del ritiro: «vorrà», non «vorra'» (statico sul sorgente: il testo vive nel wizard d'apertura e in un avviso)
     P11 fine carriera: «Giovane dell'Anno» una volta sola, con il numero delle volte
     P12 Home e Club da svincolato: la card «Prossima» dice che il club gioca senza di te; la fiducia del mister non si mostra
   Fuori dal guardiano (non sono testi ne' numeri, vedi rapporto del giro 200): P8 sfida «Sempreverde» (regola: quando si valuta la
   sfida) e P10 finestra dell'intervista su PC (impaginazione: il contenuto scorre dentro la finestra).
   Bracci: VERDE (gioco) deve passare ogni punto; ROSSO window.__CPM_NO_G200 deve essere bocciato su ogni punto.
   «Non giudicato» (elemento non trovato, pagina rotta) = rosso. Verde e rosso stampati per ultimi. Uscita 0 solo con verde ok E rosso bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rifiniture-200.mjs   (CPM_SOLO200=P1,P4 per alcuni punti) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SOLO = (process.env.CPM_SOLO200 || '').split(',').filter(Boolean);
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro200'); fs.mkdirSync(FOTO, { recursive: true });
const testo = (page, sel) => page.evaluate((s) => { const e = s ? document.querySelector(s) : document.getElementById('root'); return e ? (e.innerText || '').replace(/[ \t]+/g, ' ') : null; }, sel);
const vai = async (page, t) => { await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); await sleep(900); await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(300); };
const patch = async (page, o) => { await page.evaluate((o) => window.__CPM_CAREER.patch(o), o); await sleep(700); };
const FL = ['__CPM_FIS_APERTE'];
/* [giro 348] il bilancio di fine stagione si raggiunge come lo raggiunge il giocatore. Il salvataggio di prova non porta la classifica:
   la ricostruisce il gioco col motore rapido, e dal giro 343 (PO-611, punizione fuori area) la stessa stagione esce diversa: il club
   dell'eroe e' primo e il fine stagione si apre con la parata «CAMPIONI!» davanti al bilancio (misurato: con __CPM_NO_G343 di nuovo 4°,
   niente parata). Si preme «Continua» finche' il bilancio non e' a schermo (al massimo 8 volte, poi la riga cercata manca = rosso). */
const fineStagione = async (p) => { await p.evaluate(() => window.__CPM_CAREER.apriFine302('stagione')); await sleep(1500);
  for (let k = 0; k < 8; k++) { const t = await testo(p); if (/pt nel girone|Contratto attivo|Ultimo anno di contratto|Contratto scaduto|Ultima stagione/.test(t || '')) break;
    await p.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /Continua/i.test(b.innerText || '')); if (B[0]) B[0].click(); }); await sleep(900); }
  return testo(p); };

/* ogni caso: {id, w, h, pl (salvataggio), fai(page) -> fatti, giudica(fatti) -> [ok, motivo]} */
const CASI = [
  { id: 'P1', pl: { nation: 'Italia', nationalCaps: 12, nationsCupQueue: { done: true, active: false, season: 3, isFinal: true, opponents: ['Francia', 'Olanda', 'Belgio', 'Germania'], matchIdx: 4, pts: 10,
      matches: [{ opp: 'Francia', won: true }, { opp: 'Olanda', won: true }, { opp: 'Belgio', drew: true }, { opp: 'Germania', won: true }] },
      worldMemory: [{ type: 'nations_cup', season: 3, nation: 'Italia', qualified: true, won: true, pts: 10, final: { opp: 'Germania', won: true, pen: false } }] },
    fai: async (p) => { await vai(p, 'nazionale'); const t = await testo(p); const i = t.search(/Coppa delle Nazioni S\.3/i); return { riga: i < 0 ? null : t.slice(i, i + 120).replace(/\n/g, ' | ') }; },
    giudica: (f) => !f.riga ? [false, 'scheda della coppa non trovata'] : (/Campioni/.test(f.riga) && /7\/9/.test(f.riga) && !/Eliminati/.test(f.riga) && !/10\/9/.test(f.riga)) ? [true, f.riga] : [false, f.riga] },
  { id: 'P2', pl: { euro: { active: true, competition: 'UCL', phase: 'eliminated', eliminated: true, champion: false, pts: 12,
      groupResults: [1, 2, 3, 4, 5, 6].map(i => ({ opp: 'Club ' + i, won: i <= 4, drew: false, hs: 2, as: i <= 4 ? 0 : 1 })), koResults: [{ phase: 'r16', won: false }] } },
    fai: async (p) => { const t = await fineStagione(p); const i = t.search(/pt nel girone/); return { riga: i < 0 ? null : t.slice(Math.max(0, i - 60), i + 14).replace(/\n/g, ' | '), schermo: await p.evaluate(() => window.__CPM_CAREER.screen()) }; },
    giudica: (f) => !f.riga ? [false, 'riga della coppa europea non trovata (' + f.schermo + ')'] : /Eliminat[oi] agli ottavi/i.test(f.riga) ? [true, f.riga] : [false, f.riga] },
  { id: 'P3', pl: { contract: { duration: 3, wage: 9000, expiresAtSeason: 5 } },
    fai: async (p) => { const a = await fineStagione(p);
      await p.evaluate(() => { window.__CPM_CAREER.goTab('dashboard'); }); await sleep(500); await patch(p, { retireAnnounced: 3 }); const b = await fineStagione(p);
      const r = (t) => { const m = (t || '').match(/Contratto attivo[^\n]*|Ultimo anno di contratto[^\n]*|Contratto scaduto[^\n]*|Ultima stagione[^\n]*ritiro[^\n]*/); return m ? m[0] : null; };
      return { normale: r(a), addio: r(b) }; },
    giudica: (f) => (f.normale && /2 anni rimanenti/.test(f.normale) && f.addio && !/Contratto attivo/.test(f.addio) && /ritiro/i.test(f.addio)) ? [true, `«${f.normale}» · addio «${f.addio}»`] : [false, `«${f.normale}» · addio «${f.addio}»`] },
  { id: 'P4', pl: { contractExpired: true },
    fai: async (p) => { await vai(p, 'agente'); const t = await testo(p); return { attuale: /STIPENDIO ATTUALE/i.test(t), cessione: /Richiedi cessione/i.test(t), agente: /procuratore|Agente/i.test(t), ultimo: /Ultimo stipendio/i.test(t) }; },
    giudica: (f) => !f.agente ? [false, 'scheda Agente non trovata'] : (!f.attuale && !f.cessione && f.ultimo) ? [true, JSON.stringify(f)] : [false, JSON.stringify(f)] },
  { id: 'P5', pl: { nation: 'Spagna', nationalCaps: 10, nationalGoals: 3 },
    fai: async (p) => { await vai(p, 'profile'); const t = await testo(p); return { azzurro: /Gol Azzurro/.test(t), naz: /Gol in Nazionale/.test(t), traguardi: /Esordio/.test(t) }; },
    giudica: (f) => !f.traguardi ? [false, 'traguardi non trovati'] : (!f.azzurro && f.naz) ? [true, JSON.stringify(f)] : [false, JSON.stringify(f)] },
  { id: 'P6', pl: { fanLegend: [{ clubId: 'liv', clubName: 'FC Merseyside', ultrasName: 'Curva Merseyside', seasons: 11, status: 'regular' }, { clubId: 'xx1', clubName: 'FC Vecchio', ultrasName: 'Ultras Vecchio', seasons: 4, status: 'legend' }] },
    fai: async (p) => { await vai(p, 'profile'); const t = await testo(p); const i = t.indexOf('Curva Merseyside'); return { riga: i < 0 ? null : t.slice(i, i + 90).replace(/\n/g, ' | ') }; },
    giudica: (f) => !f.riga ? [false, 'La città ti ricorda non trovata'] : (!/Rispettato/.test(f.riga.split('Ultras Vecchio')[0]) && /Ci giochi ora/.test(f.riga)) ? [true, f.riga] : [false, f.riga] },
  { id: 'P7', pl: { nationalCaps: 12, jerseyNum: 8, ovr: 92 },
    fai: async (p) => { await vai(p, 'nazionale'); const t = await testo(p); return { nove: /maglia numero 9/i.test(t), lista: /La lista del CT/i.test(t), centravanti: /centravanti/i.test(t) }; },
    giudica: (f) => !f.lista ? [false, 'lista del CT non trovata'] : (!f.nove && f.centravanti) ? [true, JSON.stringify(f)] : [false, JSON.stringify(f)] },
  { id: 'P11', pl: { age: 36, playerAwards: { palloneOros: [], scarpaOros: [], youngYears: [1, 2, 3, 4, 5, 6], seasonRecords: [], leagueMvpYears: [], leagueTopScorerYears: [], teamOfYearYears: [] } },
    fai: async (p) => { await p.evaluate(() => window.__CPM_CAREER.apriFine302('carriera')); await sleep(2500);
      for (let k = 0; k < 8; k++) { const ok = await p.evaluate(() => /Premi e Riconoscimenti/i.test(document.body.innerText || '')); if (ok) break; await p.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /Continua|Avanti|Salta|Chiudi|Rivivi la carriera/i.test(b.innerText || '')); if (B[0]) B[0].click(); }); await sleep(900); }
      const t = await testo(p); return { volte: (t.match(/Giovane dell'Anno/g) || []).length, x6: /Giovane dell'Anno[^\n]*(×|x)\s?6|6\s?(volte|×)/.test(t), premi: /Premi e Riconoscimenti/i.test(t), schermo: await p.evaluate(() => window.__CPM_CAREER.screen()) }; },
    giudica: (f) => !f.premi ? [false, 'pagina dei premi non trovata (' + f.schermo + ')'] : (f.volte === 1 && f.x6) ? [true, JSON.stringify(f)] : [false, JSON.stringify(f)] },
  { id: 'P12', pl: { contractExpired: true },
    fai: async (p) => { await vai(p, 'dashboard'); const card = await testo(p, '[data-cpm="prossima-v2"]'); const home = await testo(p);
      await p.screenshot({ path: path.join(FOTO, (p.__rosso ? 'prima' : 'dopo') + '-home-svincolato-375.png') });
      await vai(p, 'club'); const club = await testo(p);
      return { card: card ? card.replace(/\n/g, ' | ').slice(0, 160) : null, fiduciaHome: /Fiducia del mister/i.test(home), fiduciaClub: /Fiducia del mister/i.test(club), clubOk: /Prestigio|Allenatore/i.test(club) }; },
    giudica: (f) => (!f.card || !f.clubOk) ? [false, 'card o scheda Club non trovata'] : (/senza di te/i.test(f.card) && !f.fiduciaHome && !f.fiduciaClub) ? [true, JSON.stringify(f)] : [false, JSON.stringify(f)] },
];
/* P9 statico: il testo vive nel wizard d'apertura (passo «addio») e in un avviso */
function p9(rosso) {
  const s = fs.readFileSync(path.join(ROOT, 'src', '18-career-app.jsx'), 'utf8');
  const vere = (s.match(/vorrà salutarti/g) || []).length; const apo = (s.match(/vorra' salutarti/g) || []).length;
  const ramo = (s.match(/_g200x\(\)\?[^\n]{0,200}vorrà salutarti[^\n]{0,200}:[^\n]{0,200}vorra' salutarti/g) || []).length;
  return rosso ? [false, `statico: il rosso ripristina «vorra'» in ${ramo} punti su 2 (ramo __CPM_NO_G200)`] : [vere >= 2 && ramo === 2 && apo === ramo, `statico: «vorrà» ${vere} · «vorra'» solo nel ramo rosso ${ramo}/${apo}`];
}
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const esiti = { verde: [], rosso: [] };
try {
  for (const braccio of ['verde', 'rosso']) {
    console.log(`\n== braccio ${braccio} ==`);
    for (const C of CASI) {
      if (SOLO.length && !SOLO.includes(C.id)) continue;
      const fl = braccio === 'rosso' ? [...FL, '__CPM_NO_G200'] : FL;
      let r;
      try {
        const a = await apri(browser, port, salva(C.pl), fl, C.w || 375, C.h || 667); a.page.__rosso = braccio === 'rosso';
        const f = await C.fai(a.page); r = C.giudica(f); if (a.errors.length) r = [false, 'errori di pagina: ' + a.errors.join(' / ')];
        await a.page.close();
      } catch (e) { r = [false, 'non giudicato: ' + String(e.message).slice(0, 140)]; }
      esiti[braccio].push([C.id, r[0], r[1]]); console.log(`  ${r[0] ? '✓' : '✗'} ${C.id} ${r[1]}`);
    }
    if (!SOLO.length || SOLO.includes('P9')) { const r = p9(braccio === 'rosso'); esiti[braccio].push(['P9', r[0], r[1]]); console.log(`  ${r[0] ? '✓' : '✗'} P9 ${r[1]}`); }
  }
} finally { await browser.close(); srv.close(); }
const verdeOk = esiti.verde.length > 0 && esiti.verde.every(x => x[1]);
const rossoBocciato = esiti.rosso.length === esiti.verde.length && esiti.rosso.every(x => !x[1]);
console.log(`\nVERDE: ${esiti.verde.filter(x => x[1]).length}/${esiti.verde.length} punti passano ${verdeOk ? '✓' : '✗ ' + esiti.verde.filter(x => !x[1]).map(x => x[0]).join(',')}`);
console.log(`ROSSO __CPM_NO_G200: ${esiti.rosso.filter(x => !x[1]).length}/${esiti.rosso.length} punti bocciati ${rossoBocciato ? '✓' : '✗ passano: ' + esiti.rosso.filter(x => x[1]).map(x => x[0]).join(',')}`);
console.log(verdeOk && rossoBocciato ? '✓ rifiniture-200 VERDE' : '✗ rifiniture-200 ROSSO');
process.exit(verdeOk && rossoBocciato ? 0 : 1);
