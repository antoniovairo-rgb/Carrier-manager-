#!/usr/bin/env node
/* [giro 131 · PO-331 «Finale in primo piano»] GUARDIANO prossima-131 (non-gate, catena carriera/home).
   Foto del PO (7.999.186, stagione 14 sett. 21): la card «Prossima» della home annunciava la gara del CLUB (FC Merseyside-FC Dorset)
   mentre il comando principale nella stessa card diceva «Gioca vs Inghilterra — Coppa Nazioni · Finale». Card e comando leggevano
   due fonti diverse. Ora leggono la stessa (prossimaNazionale131 in src/18).
   Casi: finale Coppa Nazioni pendente · partita di girone Coppa Nazioni · Europeo girone · nessuna Nazionale. Formati 360x800 e 1440x900.
   Per ogni caso: le due squadre della card coincidono con quelle attese (Nazionale + avversario vero, oppure club + avversario di
   calendario), il comando principale nomina lo stesso avversario, il turno della testata e' quello del comando, la riga «Poi:» porta
   la gara del club; nei casi Nazionale nessuna posizione in classifica.
   BRACCIO ROSSO: __CPM_NO_G131 (com'era) — deve fallire, e sul PRIMO caso. «Non giudicato» (card o comando assenti) = rosso.
   [giro 133 · PO-333 «Sì, nella 188»] + caso «amichevole»: amichevole della Nazionale nel calendario del club, in una settimana
   senza gara di club: Nazionale contro l'avversario, nessuna forma del club sotto la Nazionale, riga «Poi:» con la prima gara di
   club non giocata dopo l'amichevole, fondo nel colore della Nazionale. Nei casi Nazionale si controllano anche forma e fondo.
   BRACCIO ROSSO 133: __CPM_NO_G133 (com'era al giro 131) — deve cadere SOLO sul caso amichevole, i casi del giro 131 restano verdi.
   [giro 134 · PO-335 «Sì»] caso amichevole: il COMANDO principale deve dire «poi: <club> W.N» con la STESSA gara (avversario e
   settimana) della riga «Poi:» della card, come gia' fanno Coppa Nazioni ed Euro (una sola fonte: prossimaClubDopo133).
   BRACCIO ROSSO 134: __CPM_NO_G134A (pulsante di prima) — deve cadere SOLO sul caso amichevole.
   [giro 137 · PO-340 «Tieni insieme club e W.N»] a 360 px «W.20» finiva da solo sull'ultima riga del pulsante. Nei casi Nazionale
   (Coppa Nazioni finale e girone, Europeo, amichevole) a 360x800 e 412x915 il gruppo «<club> W.N» del sottotitolo del comando deve
   stare su UNA riga: si misurano i rettangoli del testo (Range.getClientRects) dal nome del club alla cifra della settimana.
   Sottotitolo senza «poi: <club> W.N» = non giudicato = rosso. BRACCIO ROSSO 137: __CPM_NO_G137W (spazi normali) — deve cadere
   SOLO su questo controllo.
   Uso: P131_FORMATI=s360,s412,pc  P131_BRACCI=verde,rosso  P131_FOTO=<cartella>. Esce !=0 se il verde e' rosso o il rosso non cade. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { preparaCalendario, FORMATI } from './c180-lib.mjs';
const BRACCI = (process.env.P131_BRACCI || 'verde,rosso,rosso133,rosso134,rosso137w').split(',');
const SCELTI = (process.env.P131_FORMATI || 's360,s412,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const FOTO = process.env.P131_FOTO || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const NAZ = SAVE.player.nation || 'Italia';
const CASI = [
  { id: 'nc-finale', opp: 'Inghilterra', turno: /Finale/i, patch: { nationsCupQueue: { active: true, done: false, opponents: ['Francia', 'Germania', 'Olanda', 'Inghilterra'], matchIdx: 3, pts: 6, isFinal: true, matches: [], season: SAVE.player.season } } },
  { id: 'nc-girone', opp: 'Germania', turno: /Partita 2\/3/i, patch: { nationsCupQueue: { active: true, done: false, opponents: ['Francia', 'Germania', 'Olanda'], matchIdx: 1, pts: 3, matches: [], season: SAVE.player.season } } },
  { id: 'euro-girone', opp: 'Spagna', turno: /Girone · Giornata 1\/3/i, patch: { nationsCupQueue: null, euroMondiale: { active: true, done: false, type: 'Europeo', phase: 'group', qualDone: true, groupOpponents: ['Spagna', 'Croazia', 'Svezia'], groupMatchIdx: 0, groupPts: 0, season: SAVE.player.season } } },
  { id: 'nessuna', opp: null, patch: { nationsCupQueue: null, euroMondiale: null } },
  { id: 'amichevole', opp: 'Portogallo', amich: true, turno: /Amichevole Internazionale/i, patch: { nationsCupQueue: null, euroMondiale: null } },
];
const ROSSI = { verde: [], rosso: ['__CPM_NO_G131'], rosso133: ['__CPM_NO_G133'], rosso134: ['__CPM_NO_G134A'], rosso137w: ['__CPM_NO_G137W'] };
const RIGA137 = ['s360', 's412']; /* formati su cui si giudica «<club> W.N» su una riga */
/* [giro 137] righe occupate dal gruppo «<club> W.N» nel sottotitolo del comando: righe distinte dei rettangoli del testo */
const RIGHE_WN = () => { const bt = document.querySelector('button[data-cpm="avanza23"]'); if (!bt) return { motivo: 'comando assente' };
  const w = document.createTreeWalker(bt, NodeFilter.SHOW_TEXT); let n, hit = null;
  while ((n = w.nextNode())) { const m = /poi:[\s\u00a0]*(.+?)[\s\u00a0]+W\.(\d+)/i.exec(n.nodeValue || ''); if (m) { hit = { n, m }; break; } }
  if (!hit) return { motivo: 'sottotitolo senza «poi: <club> W.N»' };
  const i0 = hit.m.index + hit.m[0].indexOf(hit.m[1]), i1 = hit.m.index + hit.m[0].length; const r = document.createRange(); r.setStart(hit.n, i0); r.setEnd(hit.n, i1);
  const tops = []; for (const q of r.getClientRects()) { if (q.width < 0.5) continue; if (!tops.some(t => Math.abs(t - q.top) < 3)) tops.push(q.top); }
  const tutto = document.createRange(); tutto.selectNodeContents(hit.n); const tt = []; for (const q of tutto.getClientRects()) { if (q.width < 0.5) continue; if (!tt.some(t => Math.abs(t - q.top) < 3)) tt.push(q.top); }
  return { gruppo: hit.n.nodeValue.slice(i0, i1).replace(/\u00a0/g, '·').replace(/\u2011/g, '-'), righe: tops.length, righeSub: tt.length }; };
/* amichevole: una settimana >= quella corrente senza gare di club, con una gara di club non giocata dopo; si aggiunge la voce
   del calendario come la scrive il gioco (src/18, convocazione CT: matchday 1470+W, type "national"). Torna la gara attesa per «Poi». */
const PREP_AMICH = (opp) => { const C = window.__CPM_CAREER; const p = C.snapshot(); const cal = p.calendar || []; const club = cal.filter(m => m.type !== 'national');
  for (let w = p.week || 1; w <= 45; w++) { if (club.some(m => m.week === w)) continue; const dopo = club.filter(m => !m.played && m.week > w).sort((a, b) => a.week - b.week)[0]; if (!dopo) continue;
    C.patch({ calendar: [...cal, { matchday: 1470 + w, week: w, opponentId: 'nt-' + opp.toLowerCase().slice(0, 3), opponentName: opp, isHome: true, played: false, result: null, type: 'national', competition: 'Amichevole Internazionale' }], week: w, weekLived: true });
    return { w, poi: dopo.opponentName, poiW: dopo.week }; }
  return null; };
const LEGGI = (naz) => {
  const sec = document.querySelector('section[data-cpm="prossima-v2"]'); const bt = document.querySelector('button[data-cpm="avanza23"]');
  const nomi = sec ? [...sec.querySelectorAll('[data-cpm="squadra-nome106"]')].map(e => (e.textContent || '').trim()) : null;
  const testa = sec ? ((sec.querySelector('span') || {}).textContent || '').trim() : null;
  const poi = sec ? ((sec.querySelector('[data-cpm="poi131"]') || {}).textContent || '').trim() : null;
  const pos = sec ? /ª in classifica/.test(sec.textContent || '') : null;
  const forma = sec ? !!sec.querySelector('[data-cpm="forma-v2"]') : null;
  const fondo = sec ? sec.getAttribute('data-club106') : null; let fondoNaz = null; try { fondoNaz = (NAT_CLUB_DATA[naz] || {}).c || null; } catch (e) {}
  return { nomi, testa, poi, pos, forma, fondo, fondoNaz, cmd: bt ? (bt.textContent || '').trim() : null };
};
/* le finestre «momento» coprono la card nelle foto: si chiudono (la lettura e' sul DOM, non sui pixel) */
const CHIUDI_OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width * r.height >= 0.4 * W * H && (parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (!o) return false; const bt = [...o.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); if (!bt.length) return false; (bt.find(x => /chiudi|continua|ok|✕/i.test(x.textContent || '')) || bt[0]).click(); return true; };
const norm = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\u2011/g, '-').toLowerCase().trim(); /* [giro 137] spazi non separabili e trattino non separabile valgono come i normali */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = [];
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso'; const righe = []; let primoRosso = null;
  for (const f of SCELTI) {
    const errs = [];
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSI[braccio] || [], save: SAVE });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    const dentro = await entraInCarriera(page, errs);
    const cal = dentro ? await preparaCalendario(page, SAVE) : { md: null };
    const club = SAVE.player.club.n;
    for (const c of CASI) {
      let r = { nomi: null }, md = cal.md, motivo = [], am = null;
      if (dentro && md) {
        await page.evaluate(pt => { const C = window.__CPM_CAREER; C.dismiss(); C.patch({ ...pt, weekLived: true }); }, c.patch); await sleep(400);
        if (c.amich) { am = await page.evaluate(PREP_AMICH, c.opp).catch(() => null); await sleep(500); if (!am) motivo.push('non giudicato (nessuna settimana libera per l\'amichevole)'); }
        await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
        await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
        for (let i = 0; i < 4; i++) { const chiuso = await page.evaluate(CHIUDI_OVL).catch(() => false); if (!chiuso) break; await sleep(700); }
        md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd()).catch(() => null);
        r = await page.evaluate(LEGGI, NAZ);
        if (c.opp && RIGA137.includes(f.k)) r.wn = await page.evaluate(RIGHE_WN).catch(e => ({ motivo: 'misura fallita ' + String(e).slice(0, 60) }));
        if (FOTO) await page.screenshot({ path: path.join(FOTO, `prossima131-${c.id}-${f.k}-${braccio}.png`) }).catch(() => {});
      }
      if (!r.nomi || r.nomi.length !== 2 || !r.cmd) motivo.push('non giudicato (card o comando assenti)');
      else {
        const attesi = c.opp ? [NAZ, c.opp] : [club, md && md.opp];
        const visti = r.nomi.map(norm).sort(), att = attesi.map(norm).sort();
        if (visti.join('|') !== att.join('|')) motivo.push(`card ${r.nomi.join(' - ')} ≠ attese ${attesi.join(' - ')}`);
        const oppCmd = c.opp || (md && md.opp);
        if (!norm(r.cmd).includes(norm(oppCmd))) motivo.push(`comando «${r.cmd.slice(0, 60)}» non nomina ${oppCmd}`);
        if (!r.nomi.map(norm).includes(norm(oppCmd))) motivo.push(`avversario del comando (${oppCmd}) assente dalla card`);
        if (c.opp) {
          if (!c.turno.test(r.testa || '') || (!c.amich && !c.turno.test(r.cmd))) motivo.push(`turno: testata «${r.testa}» / comando non concordi su ${c.turno}`);
          if (r.pos) motivo.push('posizione in classifica di campionato su una gara della Nazionale');
          const poiAtt = c.amich ? (am && am.poi) : (md && md.opp);
          if (!poiAtt) motivo.push('non giudicato (gara del club attesa per «Poi» sconosciuta)');
          else if (!norm(r.poi).includes(norm(poiAtt))) motivo.push(`riga «Poi» «${r.poi}» non porta ${poiAtt}`);
          else if (c.amich && !(r.poi || '').includes('sett. ' + am.poiW)) motivo.push(`riga «Poi» «${r.poi}» non porta la settimana ${am.poiW}`);
          if (c.amich && am) { const mc = /poi:\s*(.+?)\s+W\.(\d+)/i.exec(r.cmd || ''); const mp = /(\d+)/.exec((r.poi || '').replace(/^.*sett\.\s*/i, ''));
            if (!mc) motivo.push(`comando «${(r.cmd || '').slice(0, 90)}» senza «poi: <club> W.N»`);
            else if (norm(mc[1]) !== norm(am.poi) || +mc[2] !== am.poiW || !norm(r.poi).includes(norm(mc[1])) || !mp || +mp[1] !== +mc[2]) motivo.push(`comando «poi: ${mc[1]} W.${mc[2]}» ≠ riga «Poi» «${r.poi}» (attesa ${am.poi} W.${am.poiW})`); }
          if (r.forma) motivo.push('forma del club sotto la Nazionale');
          if (RIGA137.includes(f.k)) { if (!r.wn || r.wn.righe == null) motivo.push(`riga137: non giudicato (${r.wn && r.wn.motivo})`); else if (r.wn.righe !== 1) motivo.push(`riga137: «${r.wn.gruppo}» spezzato su ${r.wn.righe} righe`); }
          if (!r.fondoNaz || r.fondo !== r.fondoNaz) motivo.push(`fondo ${r.fondo} ≠ colore della Nazionale ${r.fondoNaz}`);
        } else if (r.poi) motivo.push(`riga «Poi» presente senza Nazionale: «${r.poi}»`);
      }
      if (errs.length) motivo.push('errori pagina: ' + errs.slice(0, 2).join(' | '));
      const ok = !motivo.length; if (!ok && !primoRosso) primoRosso = c.id;
      const soloRiga = motivo.length > 0 && motivo.every(x => x.startsWith('riga137:'));
      righe.push({ f: f.k, caso: c.id, ok, soloRiga, motivo, card: r.nomi, testa: r.testa, poi: r.poi, cmd: r.cmd && r.cmd.slice(0, 90) });
      console.log(`  ${ok ? '✓' : '✗'} ${braccio} · ${f.nome} · ${c.id}: card [${(r.nomi || []).join(' - ')}] · «${r.testa}» · poi «${r.poi || ''}» · comando «${(r.cmd || '').slice(0, 80)}»${r.wn ? ` · gruppo «${r.wn.gruppo || ''}» ${r.wn.righe ?? '?'} riga/e (sottotitolo ${r.wn.righeSub ?? '?'})` : ''}${ok ? '' : ' → ' + motivo.join('; ')}`);
    }
    await ctx.close();
  }
  esito.push({ braccio, n: righe.length, rossi: righe.filter(x => !x.ok).length, primoRosso, casiRossi: [...new Set(righe.filter(x => !x.ok).map(x => x.caso))], tuttiRiga: righe.filter(x => !x.ok).every(x => x.soloRiga) });
}
await b.close(); srv.close();
let fallito = false; console.log('\n=== prossima-131: esito per braccio');
for (const e of esito) {
  if (e.braccio === 'verde') { const ok = e.rossi === 0 && e.n === CASI.length * SCELTI.length; if (!ok) fallito = true; console.log(`  VERDE: ${e.n} controlli, ${e.rossi} rossi → ${ok ? 'PASSA' : 'FALLISCE'}`); }
  else if (e.braccio === 'rosso134') { const ok = e.n === CASI.length * SCELTI.length && e.casiRossi.length === 1 && e.casiRossi[0] === 'amichevole' && e.rossi === SCELTI.length; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G134A): ${e.rossi}/${e.n} rossi, casi caduti: ${e.casiRossi.join(',') || 'nessuno'} → ${ok ? 'CADE COME DEVE (solo il pulsante dell\'amichevole)' : 'NON CADE COME DEVE'}`); }
  else if (e.braccio === 'rosso137w') { const ok = e.n === CASI.length * SCELTI.length && e.rossi > 0 && e.tuttiRiga; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G137W): ${e.rossi}/${e.n} rossi, casi caduti: ${e.casiRossi.join(',') || 'nessuno'} → ${ok ? 'CADE COME DEVE (solo «<club> W.N» spezzato)' : 'NON CADE COME DEVE'}`); }
  else if (e.braccio === 'rosso133') { const ok = e.n === CASI.length * SCELTI.length && e.casiRossi.length === 1 && e.casiRossi[0] === 'amichevole' && e.rossi === SCELTI.length; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G133): ${e.rossi}/${e.n} rossi, casi caduti: ${e.casiRossi.join(',') || 'nessuno'} → ${ok ? 'CADE COME DEVE (solo l\'amichevole, casi del giro 131 verdi)' : 'NON CADE COME DEVE'}`); }
  else { const ok = e.rossi > 0 && e.primoRosso === CASI[0].id; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G131): ${e.rossi}/${e.n} rossi, primo caso caduto: ${e.primoRosso || 'nessuno'} → ${ok ? 'CADE COME DEVE' : 'NON CADE: il guardiano e\' cieco'}`); }
}
process.exit(fallito ? 1 : 0);
