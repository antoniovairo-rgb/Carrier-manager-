#!/usr/bin/env node
/* [giro 447 · PO-661, residuo di PO-212] SONDA: classifica e punti dell'anteprima dell'offerta contro quelli che il giocatore trova
   DOPO la firma, in tutti i casi: lega diversa / stessa lega × trasferimento / prestito × stagione a meta' / inizio stagione.
   Confronta la TABELLA INTERA (id:punti:giocate di ogni riga, nell'ordine), non solo la riga del club. Uso: node misura-447.mjs
   (CPM_ROSSO447=1 arma __CPM_NO_G447; misura(casi, '<bandiera>') arma una bandiera qualsiasi). Stampa una riga JSON per caso. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const leggi = f => { const j = JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url))); let v = j['cpm-v3'] || j; if (typeof v === 'string') v = JSON.parse(v); return v.player ? v : { phase: 'career', player: v }; };
/* inizio stagione: lo stesso salvataggio riportato alla settimana 1 (classifica a zero, calendario non giocato) */
const aInizio = s => { const c = JSON.parse(JSON.stringify(s)); const p = c.player; p.week = 1;
  p.standings = p.standings.map(r => ({ ...r, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
  p.calendar = (p.calendar || []).map(m => { const { result, ...k } = m; return { ...k, played: false }; });
  p.matchHistory = (p.matchHistory || []).filter(h => (h.season || 1) !== p.season); p.goals = 0; p.assists = 0; p.matches = 0; return c; };
const S20 = leggi('save-c177-s5w20.json'), S38 = leggi('save-190-s12-ovr93.json');
export const CASI = [
  { id: 'altra-trasf-meta', save: S20, lega: 'altra', tipo: 'trasferimento' },
  { id: 'altra-prest-meta', save: S20, lega: 'altra', tipo: 'prestito' },
  { id: 'stessa-trasf-meta', save: S20, lega: 'stessa', tipo: 'trasferimento' },
  { id: 'stessa-prest-meta', save: S20, lega: 'stessa', tipo: 'prestito' },
  { id: 'altra-trasf-inizio', save: aInizio(S20), lega: 'altra', tipo: 'trasferimento' },
  { id: 'stessa-trasf-inizio', save: aInizio(S20), lega: 'stessa', tipo: 'trasferimento' },
  { id: 'altra-trasf-fine', save: S38, lega: 'altra', tipo: 'trasferimento' },
  { id: 'stessa-prest-fine', save: S38, lega: 'stessa', tipo: 'prestito' },
];
export async function misura(casi, rosso) {
  const srv = await startServer(); const b = await launchBrowser(); const out = [];
  for (const k of casi) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => console.log('  pageerror ' + k.id + ': ' + String(e).slice(0, 160)));
    await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_REC = true; if (s.r) window[s.r] = 1; localStorage.setItem('cpm-v3', JSON.stringify(s.sv)); }, { sv: k.save, r: rosso === true ? '__CPM_NO_G447' : (rosso || null) });
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    const club = await page.evaluate(({ lega, tipo }) => {
      const g = JSON.parse(localStorage.getItem('cpm-v3')).player; const ov = g.leagueOverrides || {}; const L = c => ov[c.id] || c.lg;
      const mio = (g.standings || []).map(r => r.id); const lgMio = L(g.club);
      const c = lega === 'stessa'
        ? CLUBS.find(x => !x.isU18 && mio.includes(x.id) && x.id !== g.club.id && L(x) === lgMio)
        : CLUBS.find(x => !x.isU18 && x.lg && L(x) !== lgMio && !mio.includes(x.id) && CLUBS.filter(y => L(y) === L(x) && !y.isU18).length >= 10);
      window.__CPM_ANTE212 = null;
      window.__CPM_CAREER.setOffer({ club: c, type: tipo, wage: 900, duration: tipo === 'prestito' ? 1 : 2, fee: 1 });
      return { id: c.id, n: c.n, lg: L(c), week: g.week, season: g.season };
    }, k);
    await sleep(1500);
    const ante = await page.evaluate(() => window.__CPM_ANTE212 || null);
    let cliccato = true;
    try { await page.getByRole('button', { name: 'Accetta', exact: true }).first().click({ timeout: 10000 }); } catch (e) { cliccato = false; }
    await sleep(3000);
    const dopo = await page.evaluate((id) => { const g = JSON.parse(localStorage.getItem('cpm-v3')).player; const st = (g.standings || []); const i = st.findIndex(r => r.id === id);
      const md = (g.calendar || []).filter(m => !m.type && m.played && m.result); const cal = { g: md.length, v: md.filter(m => m.result.won).length, n: md.filter(m => m.result.drew).length };
      const riga = i >= 0 ? { g: st[i].played | 0, v: st[i].wins | 0, n: st[i].draws | 0 } : null;
      return { cal, riga, club: g.club && g.club.id, pos: i + 1, pts: i >= 0 ? st[i].pts : null, n: st.length, tab: st.map(t => (t.id || t.n) + ':' + (t.pts | 0) + ':' + (t.played | 0)).join(',') }; }, club.id);
    const e = { caso: k.id, club: club.id, lega: club.lg, sett: club.week, cliccato, firmato: dopo.club === club.id,
      ante: ante && { pos: ante.pos, pts: ante.pts, fonte: ante.fonte }, dopo: { pos: dopo.pos, pts: dopo.pts },
      tabUguale: !!(ante && ante.tab === dopo.tab), calendario: dopo.cal, riga: dopo.riga, anteTab: ante && ante.tab, dopoTab: dopo.tab };
    e.uguale = !!(ante && e.firmato && ante.pos > 0 && ante.pos === dopo.pos && ante.pts === dopo.pts && e.tabUguale);
    out.push(e); await ctx.close();
  }
  await b.close(); srv.close(); return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await misura(CASI, !!process.env.CPM_ROSSO447);
  for (const e of r) { const { anteTab, dopoTab, ...c } = e; console.log(JSON.stringify(c)); if (!e.tabUguale) { console.log('   ante ' + anteTab); console.log('   dopo ' + dopoTab); } }
}
