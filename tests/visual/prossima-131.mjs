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
   Uso: P131_FORMATI=s360,pc  P131_BRACCI=verde,rosso  P131_FOTO=<cartella>. Esce !=0 se il verde e' rosso o il rosso non cade. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { preparaCalendario, FORMATI } from './c180-lib.mjs';
const BRACCI = (process.env.P131_BRACCI || 'verde,rosso').split(',');
const SCELTI = (process.env.P131_FORMATI || 's360,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const FOTO = process.env.P131_FOTO || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const NAZ = SAVE.player.nation || 'Italia';
const CASI = [
  { id: 'nc-finale', opp: 'Inghilterra', turno: /Finale/i, patch: { nationsCupQueue: { active: true, done: false, opponents: ['Francia', 'Germania', 'Olanda', 'Inghilterra'], matchIdx: 3, pts: 6, isFinal: true, matches: [], season: SAVE.player.season } } },
  { id: 'nc-girone', opp: 'Germania', turno: /Partita 2\/3/i, patch: { nationsCupQueue: { active: true, done: false, opponents: ['Francia', 'Germania', 'Olanda'], matchIdx: 1, pts: 3, matches: [], season: SAVE.player.season } } },
  { id: 'euro-girone', opp: 'Spagna', turno: /Girone · Giornata 1\/3/i, patch: { nationsCupQueue: null, euroMondiale: { active: true, done: false, type: 'Europeo', phase: 'group', qualDone: true, groupOpponents: ['Spagna', 'Croazia', 'Svezia'], groupMatchIdx: 0, groupPts: 0, season: SAVE.player.season } } },
  { id: 'nessuna', opp: null, patch: { nationsCupQueue: null, euroMondiale: null } },
];
const LEGGI = () => {
  const sec = document.querySelector('section[data-cpm="prossima-v2"]'); const bt = document.querySelector('button[data-cpm="avanza23"]');
  const nomi = sec ? [...sec.querySelectorAll('[data-cpm="squadra-nome106"]')].map(e => (e.textContent || '').trim()) : null;
  const testa = sec ? ((sec.querySelector('span') || {}).textContent || '').trim() : null;
  const poi = sec ? ((sec.querySelector('[data-cpm="poi131"]') || {}).textContent || '').trim() : null;
  const pos = sec ? /ª in classifica/.test(sec.textContent || '') : null;
  return { nomi, testa, poi, pos, cmd: bt ? (bt.textContent || '').trim() : null };
};
/* le finestre «momento» coprono la card nelle foto: si chiudono (la lettura e' sul DOM, non sui pixel) */
const CHIUDI_OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width * r.height >= 0.4 * W * H && (parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (!o) return false; const bt = [...o.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); if (!bt.length) return false; (bt.find(x => /chiudi|continua|ok|✕/i.test(x.textContent || '')) || bt[0]).click(); return true; };
const norm = s => String(s || '').toLowerCase().trim();
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = [];
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso'; const righe = []; let primoRosso = null;
  for (const f of SCELTI) {
    const errs = [];
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: rosso ? ['__CPM_NO_G131'] : [], save: SAVE });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    const dentro = await entraInCarriera(page, errs);
    const cal = dentro ? await preparaCalendario(page, SAVE) : { md: null };
    const club = SAVE.player.club.n;
    for (const c of CASI) {
      let r = { nomi: null }, md = cal.md, motivo = [];
      if (dentro && md) {
        await page.evaluate(pt => { const C = window.__CPM_CAREER; C.dismiss(); C.patch({ ...pt, weekLived: true }); C.goTab('dashboard'); }, c.patch); await sleep(900);
        await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
        for (let i = 0; i < 4; i++) { const chiuso = await page.evaluate(CHIUDI_OVL).catch(() => false); if (!chiuso) break; await sleep(700); }
        md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd()).catch(() => null);
        r = await page.evaluate(LEGGI);
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
          if (!c.turno.test(r.testa || '') || !c.turno.test(r.cmd)) motivo.push(`turno: testata «${r.testa}» / comando non concordi su ${c.turno}`);
          if (r.pos) motivo.push('posizione in classifica di campionato su una gara della Nazionale');
          if (md && md.opp && !norm(r.poi).includes(norm(md.opp))) motivo.push(`riga «Poi» «${r.poi}» non porta ${md.opp}`);
        } else if (r.poi) motivo.push(`riga «Poi» presente senza Nazionale: «${r.poi}»`);
      }
      if (errs.length) motivo.push('errori pagina: ' + errs.slice(0, 2).join(' | '));
      const ok = !motivo.length; if (!ok && !primoRosso) primoRosso = c.id;
      righe.push({ f: f.k, caso: c.id, ok, motivo, card: r.nomi, testa: r.testa, poi: r.poi, cmd: r.cmd && r.cmd.slice(0, 90) });
      console.log(`  ${ok ? '✓' : '✗'} ${braccio} · ${f.nome} · ${c.id}: card [${(r.nomi || []).join(' - ')}] · «${r.testa}» · poi «${r.poi || ''}» · comando «${(r.cmd || '').slice(0, 80)}»${ok ? '' : ' → ' + motivo.join('; ')}`);
    }
    await ctx.close();
  }
  esito.push({ braccio, n: righe.length, rossi: righe.filter(x => !x.ok).length, primoRosso });
}
await b.close(); srv.close();
let fallito = false; console.log('\n=== prossima-131: esito per braccio');
for (const e of esito) {
  if (e.braccio === 'verde') { const ok = e.rossi === 0 && e.n === CASI.length * SCELTI.length; if (!ok) fallito = true; console.log(`  VERDE: ${e.n} controlli, ${e.rossi} rossi → ${ok ? 'PASSA' : 'FALLISCE'}`); }
  else { const ok = e.rossi > 0 && e.primoRosso === CASI[0].id; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G131): ${e.rossi}/${e.n} rossi, primo caso caduto: ${e.primoRosso || 'nessuno'} → ${ok ? 'CADE COME DEVE' : 'NON CADE: il guardiano e\' cieco'}`); }
}
process.exit(fallito ? 1 : 0);
