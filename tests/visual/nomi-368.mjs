#!/usr/bin/env node
/* [giro 368 · PO-417 «Nomi senza equivoci: mai lo stesso cognome nelle due squadre in campo, mai frasi come "TESTA addosso",
   stadi con un nome solo»] GUARDIANO nomi-368. Sul gioco vero (?cpmtest=1).
   MISURA DI PARTENZA (misura-368.mjs, base 7.999.215): 13.770 incontri di lega in 3 stagioni, 9.100 (66%) con almeno un cognome
   uguale fra i due undici, 13.425 (97%) fra le rose intere; cognomi del pool che sono parole della cronaca: Testa (15 giocatori),
   Cross (12), Mediano, Franco, Quaranta; in partita la scheda della giornata e l'insegna davano due nomi dello stesso stadio
   (Primavera e provino: pick(STADIUMS) casuale contro il nome dell'impianto; finale: «Stadio Internazionale» contro «Stadio Nazionale»).
   A · COPPIE (puro, funzioni vere): ogni coppia di club della stessa lega (CLUBS e Primavera, stagioni 1..3), 120 coppie di coppa fra
       leghe diverse e ogni coppia di nazionali: dopo contro368 zero cognomi uguali negli undici e nelle rose, eroe compreso; cambia solo
       chi collideva, col nome di battesimo intatto; due chiamate danno lo stesso risultato.
   B · PAROLE: nessun cognome generato (tutte le rose, stagioni 1..6) e' una parola dei testi della partita (BG_MATCH, SITUATIONS,
       CHAIN_SITS, COACH_SHOUTS: vocabolario letto dal gioco) ne' del lessico del racconto qui sotto (copia indipendente).
   C · PARTITE VERE: provino (eroe «Luca Testa») e partita di carriera da salvataggio (pro S12 e Primavera), scheda della giornata
       e ingresso in campo: testimone __CPM_ROSE368 = zero cognomi in comune fra i due undici; __CPM_STADIO368 = un solo nome di
       stadio fra scheda e insegna. Testimone assente = NON GIUDICATO = rosso.
   Rosso: CPM_PROVA_ROSSO=1 (accende __CPM_NO_G368) deve uscire ROSSO su A, B e sullo stadio della Primavera. Uscita 0 solo a verde pieno (e rosso visto rosso). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const LESSICO = ['testa', 'cross', 'palla', 'pallone', 'porta', 'rete', 'tiro', 'gol', 'palo', 'traversa', 'angolo', 'fallo', 'area', 'campo', 'punta', 'ala', 'mediano', 'terzino', 'mezzala', 'regista', 'libero', 'portiere', 'rigore', 'corner', 'tacco', 'petto', 'piede', 'mischia', 'rimessa', 'barriera'];
async function pagina(b, port, rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_TEST368 = 1; if (r) window.__CPM_NO_G368 = 1; }, rosso);
  return { ctx, page, errs };
}
async function giro(b, port, rosso) {
  const fails = [], info = {};
  { const { ctx, page } = await pagina(b, port, rosso);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => typeof generateTeamRoster === 'function' && typeof contro368 === 'function', null, { timeout: 90000 });
    const r = await page.evaluate(({ LESSICO }) => {
      const cog = n => String(((typeof _surnBG === 'function') ? _surnBG(n || '') : '') || '').toLowerCase();
      const eroe = 'Luca Testa'; const out = { coppie: 0, xi: 0, rosa: 0, nonMinimo: 0, battesimo: 0, nonDet: 0, es: [] };
      const prova = (a, o, s, lg) => { out.coppie++;
        const own = generateTeamRoster(a, s).concat([{ name: eroe }]); const opp0 = generateTeamRoster(o, s);
        const d = contro368(opp0, own, o, s), d2 = contro368(generateTeamRoster(o, s), own, o, s);
        if (JSON.stringify(d) !== JSON.stringify(d2)) out.nonDet++;
        const so = new Set(own.map(x => cog(x.name))), sx = new Set(own.slice(0, 11).map(x => cog(x.name)).concat([cog(eroe)]));
        const hx = d.slice(0, 11).filter(x => sx.has(cog(x.name))), hr = d.filter(x => so.has(cog(x.name)));
        if (hx.length) { out.xi++; if (out.es.length < 5) out.es.push(lg + ' S' + s + ' ' + a.n + ' / ' + o.n + ': ' + hx.map(x => x.name).join(', ')); }
        if (hr.length) out.rosa++;
        opp0.forEach((x, i) => { const y = d[i]; const coll = so.has(cog(x.name));
          if (!coll && y.name !== x.name) out.nonMinimo++;
          if (y.name !== x.name && y.name.split(' ')[0] !== x.name.split(' ')[0]) out.battesimo++; });
      };
      const ligas = {}; for (const c of CLUBS) (ligas[c.lg] = ligas[c.lg] || []).push(c);
      try { for (const c of U18_CLUBS) (ligas['U18 ' + c.lg] = ligas['U18 ' + c.lg] || []).push(c); } catch (e) {}
      for (const lg in ligas) for (let s = 1; s <= 3; s++) for (const a of ligas[lg]) for (const o of ligas[lg]) if (a !== o) prova(a, o, s, lg);
      let h = 7; for (let k = 0; k < 120; k++) { h = (h * 1103515245 + 12345) >>> 0; const a = CLUBS[h % CLUBS.length]; h = (h * 1103515245 + 12345) >>> 0; const o = CLUBS[h % CLUBS.length]; if (a.lg !== o.lg) prova(a, o, 1 + (k % 3), 'coppa'); }
      const naz = Object.keys(NAT_CLUB_DATA).map(k => NAT_CLUB_DATA[k]).filter(Boolean);
      for (const a of naz) for (const o of naz) if (a !== o) prova(a, o, 1, 'nazionali');
      const voc = new Set(LESSICO); const add = t => { for (const w of (String(t).match(/\p{L}+/gu) || [])) if (w === w.toLowerCase() && w.length > 1) voc.add(w); };
      const walk = o => { if (typeof o === 'string') { if (o.indexOf(' ') > 0) add(o); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
      walk(BG_MATCH); walk(SITUATIONS); try { walk(CHAIN_SITS); } catch (e) {} try { walk(COACH_SHOUTS); } catch (e) {}
      const eq = {}; let tot = 0;
      for (const c of CLUBS.concat(typeof U18_CLUBS !== 'undefined' ? U18_CLUBS : []).concat(naz)) for (let s = 1; s <= 6; s++) for (const x of generateTeamRoster(c, s)) { tot++; const w = cog(x.name); if (voc.has(w)) eq[w] = (eq[w] || 0) + 1; }
      out.equivoci = eq; out.giocatori = tot; out.voc = voc.size; return out;
    }, { LESSICO });
    Object.assign(info, { coppie: r.coppie, xi: r.xi, rosa: r.rosa, equivoci: r.equivoci, giocatori: r.giocatori });
    if (r.coppie < 10000) fails.push('A non giudicato: solo ' + r.coppie + ' coppie');
    if (r.xi) fails.push(`A: ${r.xi} incontri su ${r.coppie} con lo stesso cognome negli undici (es. ${r.es.join(' | ')})`);
    if (r.rosa) fails.push(`A: ${r.rosa} incontri con lo stesso cognome nelle rose intere`);
    if (r.nonMinimo) fails.push(`A: ${r.nonMinimo} giocatori cambiati senza collisione`);
    if (r.battesimo) fails.push(`A: ${r.battesimo} nomi di battesimo cambiati`);
    if (r.nonDet) fails.push(`A: ${r.nonDet} coppie non deterministiche`);
    if (Object.keys(r.equivoci).length) fails.push('B: cognomi che sono parole della cronaca: ' + JSON.stringify(r.equivoci));
    await ctx.close(); }
  { const { ctx, page, errs } = await pagina(b, port, rosso);
    try { await openMatch(page, port, { skipLoadAll: true, name: 'Luca Testa' }); } catch (e) { fails.push('C non giudicato: ' + e.message); }
    await sleep(4000);
    const t = await page.evaluate(() => ({ rose: window.__CPM_ROSE368 || null, st: Object.keys(window.__CPM_STADIO368 || {}) }));
    if (!t.rose) fails.push('C non giudicato: testimone __CPM_ROSE368 assente');
    else { const c = n => String(n || '').trim().split(/\s+/).pop().toLowerCase(); const H = new Set(t.rose.h.map(c)); const com = t.rose.a.filter(n => H.has(c(n)));
      info.partita = { h: t.rose.h.length, a: t.rose.a.length, comuni: com };
      if (t.rose.h.length < 11 || t.rose.a.length < 11) fails.push('C non giudicato: rose corte');
      if (com.length) fails.push('C: cognomi in comune nei due undici: ' + com.join(', ')); }
    if (errs.length) fails.push('C: errori di pagina: ' + errs.slice(0, 2).join(' · '));
    await ctx.close(); }
  for (const [nome, file] of [['pro', 'save-190-s12-ovr93.json'], ['primavera', 'save-194-primavera-w38.json']]) {
    const { ctx, page, errs } = await pagina(b, port, rosso);
    const sv = fs.readFileSync(new URL('./fixtures/' + file, import.meta.url), 'utf8');
    await page.addInitScript(x => { try { localStorage.setItem('cpm-v3', x); } catch (e) {} }, sv);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {}); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    try { await page.evaluate(() => window.__CPM_CAREER.playMatch()); } catch (e) {}
    const fasi = new Set(); const t0 = Date.now();
    while (Date.now() - t0 < 60000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph) fasi.add(ph); if (ph === 'playing') break; await sleep(300); }
    await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT()).catch(() => {});
    const t1 = Date.now(); while (Date.now() - t1 < 15000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph) fasi.add(ph); if (ph === 'walkout') { await sleep(2500); break; } await sleep(300); }
    const t = await page.evaluate(() => ({ st: Object.keys(window.__CPM_STADIO368 || {}), rose: window.__CPM_ROSE368 || null }));
    info['stadi_' + nome] = t.st; info['fasi_' + nome] = [...fasi];
    if (!fasi.has('matchday') || !fasi.has('walkout')) fails.push(`C ${nome} non giudicato: fasi viste ${[...fasi].join(',')}`);
    if (!t.st.length) fails.push(`C ${nome} non giudicato: testimone __CPM_STADIO368 vuoto`); else if (t.st.length > 1) fails.push(`C ${nome}: piu' nomi dello stesso stadio: ${t.st.join(' | ')}`);
    if (t.rose) { const c = n => String(n || '').trim().split(/\s+/).pop().toLowerCase(); const H = new Set(t.rose.h.map(c)); const com = t.rose.a.filter(n => H.has(c(n))); info['comuni_' + nome] = com; if (com.length) fails.push(`C ${nome}: cognomi in comune nei due undici: ${com.join(', ')}`); }
    else fails.push(`C ${nome} non giudicato: testimone __CPM_ROSE368 assente`);
    if (errs.length) fails.push(`C ${nome}: errori di pagina: ` + errs.slice(0, 2).join(' · '));
    await ctx.close();
  }
  return { fails, info };
}
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const v = await giro(b, port, false);
console.log('VERDE', JSON.stringify(v.info)); v.fails.forEach(f => console.log('  ✗ ' + f));
let ok = !v.fails.length;
if (process.env.CPM_PROVA_ROSSO) {
  const r = await giro(b, port, true);
  console.log('ROSSO', JSON.stringify(r.info)); r.fails.forEach(f => console.log('  · ' + f.slice(0, 300)));
  const vistoA = r.fails.some(f => /^A: \d+ incontri/.test(f)), vistoB = r.fails.some(f => /^B:/.test(f)), vistoC = r.fails.some(f => /^C primavera: piu/.test(f));
  console.log(`braccio rosso: A ${vistoA ? 'ROSSO' : 'NON ROSSO'} · B ${vistoB ? 'ROSSO' : 'NON ROSSO'} · C stadio ${vistoC ? 'ROSSO' : 'NON ROSSO'}`);
  if (!vistoA || !vistoB || !vistoC) ok = false;
}
await b.close(); srv.close();
console.log(ok ? '✅ nomi-368 VERDE' : '❌ nomi-368 ROSSO');
process.exit(ok ? 0 : 1);
