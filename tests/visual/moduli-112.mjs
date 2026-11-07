#!/usr/bin/env node
/* [giro 112b PO-314 guardiano — PO 07/11 «Ma giocano tutti con il 4-3-3??» · «Ma anche nell'anteprima della partita è sempre 433»]
   Ogni club ha UN modulo suo (moduloClub, src/09): la rosa, l'anteprima e il campo 2D lo devono dire allo stesso modo.
   Percorso vero: salvataggio di prova (fixtures/save-190-s12-ovr93.json, carriera pro) col club dell'eroe e l'avversario della
   prossima giornata sostituiti da coppie di club VERI della stessa lega → «Gioca» → pre-partita → formazioni → «Salta l'ingresso».
   Per ognuno dei due club della coppia (casa e ospiti, l'eroe dentro la sua squadra):
     ROSA      linee degli 11 titolari di generateTeamRoster (campo `ln` del ruolo; senza, i reparti dal nome del ruolo)
     ANTEPRIMA linee disegnate nel campetto della schermata formazioni (DOM: maglie per riga)
     CAMPO     linee delle posizioni di base dichiarate dal testimone __CPM_G112 (le stesse con cui nascono i ventidue), raggruppate
               per x; i ventidue misurati in __CPM_MP all'avvio stanno entro 5u dal proprio posto; i preset di movimento
               (DRIFT) e i posti del motore del possesso raggruppati allo stesso modo
     MODULO    = moduloClub(club)
   Verde: per ogni club ROSA = ANTEPRIMA = CAMPO (avvio, preset, motore) = MODULO, e i club coperti toccano tutti e 5 i moduli.
   Rosso (__CPM_NO_G112, comportamento 7.999.181): almeno un club non-4-3-3 deve cadere (rosa/anteprima/campo restano 4-3-3).
   Senza testimone (codice vecchio) il CAMPO si misura raggruppando le x dei ventidue: e' la misura «prima».
   CPM_FOTO_112=<cartella> salva anteprima e campo (prima/dopo) · CPM_SOLO=verde|rosso gira un braccio solo · CPM_PRIMA=1 solo misura.
   Braccio e motivo stampati per ultimi. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FOTO = process.env.CPM_FOTO_112 || '';
const SOLO = process.env.CPM_SOLO || '';
const PRIMA = !!process.env.CPM_PRIMA;
const MODULI = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

/* linee da un elenco di x (posizioni di base, esatte): gruppi per x entro tol, dal fondo verso l'attacco */
const lineeDaX = (xs, verso, tol) => { const v = xs.map(x => verso > 0 ? x : 100 - x).sort((a, c) => a - c); const g = []; let cur = null;
  for (const x of v) { if (cur && x - cur.ult <= tol) { cur.n++; cur.ult = x; } else { cur = { n: 1, ult: x }; g.push(cur); } } return g.map(q => q.n).join('-'); };

async function scegliCoppie(rosso) {
  const page = await b.newPage(); await installCdnRoutes(page);
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G112 = 1; });
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  const r = await page.evaluate(() => {
    const ha = typeof moduloClub === 'function';
    const clubs = CLUBS.map(c => ({ id: c.id, n: c.n, lg: c.lg, p: c.p, m: ha ? moduloClub(c) : null }));
    const dist = {}; clubs.forEach(c => { dist[c.m || '—'] = (dist[c.m || '—'] || 0) + 1; });
    const perLega = {}; clubs.forEach(c => { (perLega[c.lg] = perLega[c.lg] || {}); perLega[c.lg][c.m || '—'] = (perLega[c.lg][c.m || '—'] || 0) + 1; });
    let naz = null; try { naz = {}; Object.keys(NAT_CLUB_DATA).forEach(k => { const m = ha ? moduloClub(NAT_CLUB_DATA[k]) : '—'; naz[m] = (naz[m] || 0) + 1; }); } catch (e) {}
    return { ha, clubs, dist, perLega, naz };
  });
  await page.close(); return r;
}

async function misuraCoppia(casa, ospite, rosso, w, h, sigla, forza) {
  const page = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(page);
  const s = JSON.parse(JSON.stringify(SAVE)); const p = s.player;
  p.club = { ...casa.obj }; const md = (p.calendar || []).find(x => !x.played);
  md.opponentId = ospite.obj.id; md.opponentName = ospite.obj.n; md.isHome = true;
  await page.addInitScript(([sv, r, fz]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G112 = 1; if (fz) window.__CPM_FORCE_FORM538 = fz; try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (e) {} }, [s, rosso, forza || null]);
  const out = { casa: casa.id, ospite: ospite.id };
  try {
    await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1800);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    out.play = await page.evaluate(() => { try { return String(window.__CPM_CAREER.playMatch()); } catch (e) { return 'ERR ' + e.message; } });
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    for (let i = 0; i < 12 && !(await page.evaluate(() => !!document.querySelector('[data-cpm="formazioni23"]'))); i++) {
      try { await page.getByRole('button', { name: /Vedi le formazioni/i }).first().click({ timeout: 1500 }); } catch (e) { await page.keyboard.press('Enter'); }
      await sleep(1200); }
    await sleep(1500);
    const _rosa = async (ci, oi) => page.evaluate(([ci, oi]) => {
      const cl = id => CLUBS.find(c => c.id === id); const lin = ro => { const r11 = ro.slice(0, 11);
        if (r11.every(x => x.ln != null)) { const c = {}; r11.slice(1).forEach(x => { c[x.ln] = (c[x.ln] || 0) + 1; }); return Object.keys(c).sort((a, z) => a - z).map(k => c[k]).join('-'); }
        let d = 0, m = 0, a = 0; r11.slice(1).forEach(x => { const r = (x.role || '').toUpperCase(); if (/DIFENSORE|TERZINO/.test(r)) d++; else if (/CENTROCAMPISTA|MEDIANO|TREQUARTISTA|MEZZALA|ESTERNO/.test(r)) m++; else a++; }); return d + '-' + m + '-' + a; };
      const sn = (window.__CPM_CAREER && window.__CPM_CAREER.state && window.__CPM_CAREER.state().season) || 12;
      return { casa: lin(generateTeamRoster(cl(ci), 12)), ospite: lin(generateTeamRoster(cl(oi), 12)),
        mCasa: typeof moduloClub === 'function' ? moduloClub(cl(ci), true) : null, mOspite: typeof moduloClub === 'function' ? moduloClub(cl(oi), true) : null };
    }, [ci, oi]);
    out.rosa = await _rosa(casa.id, ospite.id);
    out.anteprima = await page.evaluate(() => { const f = document.querySelector('[data-cpm="formazioni23"]'); if (!f) return null;
      const campi = [...f.querySelectorAll('div')].filter(d => /repeating-linear-gradient\(0deg/.test(d.getAttribute('style') || ''));
      /* una riga che va a capo e' una linea spezzata: si contano le quote diverse delle maglie nella stessa riga */
      let aCapo = 0; campi.forEach(c => [...c.children].forEach(r => { const t = [...r.querySelectorAll('svg')].map(v => v.getBoundingClientRect().top); if (t.length && Math.max(...t) - Math.min(...t) > 14) aCapo++;/* oltre mezza maglia: e' un'altra riga (il riquadro dell'eroe sposta di 1-2 px) */ }));
      window.__ACAPO112 = aCapo;
      return campi.map(c => [...c.children].map(r => r.querySelectorAll('svg').length).filter(n => n > 0).reverse().slice(1).join('-')); });
    out.aCapo = await page.evaluate(() => window.__ACAPO112 | 0);
    const mpNascita = await page.evaluate(() => window.__CPM_MP && window.__CPM_MP());/* i ventidue come nascono: prima del fischio il motore non li ha ancora toccati */
    if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${(rosso || PRIMA) ? 'prima' : 'dopo'}-${sigla}-anteprima.png` }).catch(() => {}); }
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta l.ingresso/.test(q.textContent || '')); if (x) x.click(); });
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing', null, { timeout: 60000 });
    const mp0 = await page.evaluate(() => window.__CPM_MP && window.__CPM_MP());
    const g = await page.evaluate(() => window.__CPM_G112 ? JSON.parse(JSON.stringify(window.__CPM_G112)) : null);
    await sleep(2500);
    out.motore = await page.evaluate(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return M && M._slot ? JSON.parse(JSON.stringify(M._slot)) : null; } catch (e) { return null; } });
    if (FOTO) await page.screenshot({ path: `${FOTO}/${(rosso || PRIMA) ? 'prima' : 'dopo'}-${sigla}-campo.png` }).catch(() => {});
    const H = (mp0 || []).filter(q => q.t === 'home' && !q.gk), A = (mp0 || []).filter(q => q.t === 'away' && !q.gk);
    /* l'eroe e' fuori dai ventuno di sfondo: e' nell'ultima linea della sua squadra (slot 10) */
    const piuEroe = s => { const v = s.split('-').map(Number); v[v.length - 1]++; return v.join('-'); };
    out.campoGrezzo = { casa: piuEroe(lineeDaX(H.map(q => q.x), 1, 6)), ospite: lineeDaX(A.map(q => q.x), -1, 6) };
    if (g && g.casa.club && g.ospite.club && g.casa.club.id && g.ospite.club.id) {/* i club VERI della gara (il calendario sceglie l'avversario: puo' non essere quello chiesto) */
      out.casa = g.casa.club.id; out.ospite = g.ospite.club.id; out.rosa = await _rosa(g.casa.club.id, g.ospite.club.id); }
    if (g) {
      out.campo = { casa: lineeDaX(g.casa.base.slice(1).map(q => q.x), 1, 5), ospite: lineeDaX(g.ospite.base.slice(1).map(q => q.x), -1, 5) };
      out.moduloCampo = { casa: g.casa.modulo, ospite: g.ospite.modulo };
      const rle = xs => { const g2 = []; xs.forEach(x => { const u = g2[g2.length - 1]; if (u && Math.abs(u.x - x) < 0.01) u.n++; else g2.push({ x, n: 1 }); }); return g2.map(q => q.n).join('-'); };
      if (g.casa.modulo !== '4-3-3') { out.preset = {}; Object.keys(g.casa.preset || {}).forEach(k => { out.preset[k] = (g.casa.modulo === '4-2-3-1') ? rle(g.casa.preset[k].slice(1).map(q => q.x)) + '-1' : piuEroe(rle(g.casa.preset[k].slice(1).map(q => q.x)));/* l'eroe e' la punta: sola nel 4-2-3-1, in coppia/tridente altrove */ }); }
      if (g.ospite.modulo !== '4-3-3') out.presetOsp = rle((g.ospite.preset || []).slice(1).map(q => q.x));
      /* i ventidue misurati stanno sul loro posto (jitter di nascita ±4) */
      let fuori = 0; (mpNascita || []).forEach((q, i) => { const bs = i < 10 ? g.casa.base[i] : g.ospite.base[i - 10]; if (!bs) return; const ax = (i > 10 ? (g.ospite.aOff || 0) : 0); if (Math.abs(q.x - bs.x - ax) > 4.6 || Math.abs(q.y - bs.y) > 4.6) fuori++; });
      out.nascita = (mpNascita || []).length;
      out.fuoriPosto = fuori;
    }
    if (out.motore) out.campoMotore = { casa: lineeDaX(out.motore.h.slice(1).map(q => q.x).concat([60]), 1, 5), ospite: lineeDaX(out.motore.a.slice(1).map(q => q.x), -1, 5) };
    out.trama = await page.evaluate(() => window.__CPM_G112_TRAMA || null);
  } catch (e) { out.errore = String(e && e.message || e).slice(0, 200); }
  await page.close(); return out;
}

const giudica = (r) => { const err = [];
  for (const lato of ['casa', 'ospite']) { const m = lato === 'casa' ? r.rosa?.mCasa : r.rosa?.mOspite; const att = (m || '4-3-3').replace(/^(\d)-(\d)-(\d)-(\d)$/, '$1-$2-$3-$4');
    const ant = r.anteprima ? r.anteprima[lato === 'casa' ? 0 : 1] : null;
    const voci = { rosa: r.rosa?.[lato], anteprima: ant, campo: r.campo?.[lato], motore: r.campoMotore?.[lato], moduloCampo: r.moduloCampo?.[lato] };
    if (lato === 'casa' && r.preset) Object.entries(r.preset).forEach(([k, v]) => { voci['preset.' + k] = v; });
    if (lato === 'ospite' && r.presetOsp) voci['preset'] = r.presetOsp;
    for (const [k, v] of Object.entries(voci)) if (v !== att) err.push(`${r[lato]} (${lato}) ${k}=${v} ≠ modulo ${att}`);
  }
  if (r.aCapo) err.push(`${r.casa}-${r.ospite} (${r.formato}): ${r.aCapo} righe dell'anteprima vanno a capo`);
  if (r.fuoriPosto) err.push(`${r.casa}-${r.ospite}: ${r.fuoriPosto} dei ventuno lontani dal loro posto (>5u)`);
  if (r.errore) err.push(`${r.casa}-${r.ospite}: errore ${r.errore}`);
  return err; };

const sceltaV = await scegliCoppie(false);
console.log('moduloClub presente:', sceltaV.ha, '· distribuzione su', sceltaV.clubs.length, 'club:', JSON.stringify(sceltaV.dist), '· nazionali:', JSON.stringify(sceltaV.naz));
/* coppie della stessa lega: si coprono i 5 moduli fra casa e ospiti */
let coppie = [];
if (sceltaV.ha) {
  const perLega = {}; sceltaV.clubs.filter(c => /^Lega [AB]$/.test(c.lg)).forEach(c => { (perLega[c.lg] = perLega[c.lg] || []).push(c); });/* le leghe dove il percorso del provino e della carriera di prova entra sempre in partita */
  const coperti = new Set(); const usati = new Set();
  for (const lg of Object.keys(perLega)) { const L = perLega[lg];
    for (const m1 of MODULI) { if (coppie.length >= 5) break; const a = L.find(c => c.m === m1 && !usati.has(c.id) && !coperti.has(m1)); if (!a) continue;
      const bb = L.find(c => c.id !== a.id && !usati.has(c.id) && !coperti.has(c.m) && c.m !== a.m) || L.find(c => c.id !== a.id && !usati.has(c.id));
      if (!bb) continue; coppie.push([a, bb]); usati.add(a.id); usati.add(bb.id); coperti.add(a.m); coperti.add(bb.m); }
    if (coppie.length >= 5) break; }
  /* fino a 5 coppie (10 club): si riempie con club non usati della stessa lega, moduli diversi fra loro quando si puo' */
  for (const lg of Object.keys(perLega)) { const L = perLega[lg].filter(c => !usati.has(c.id));
    while (coppie.length < 5 && L.length >= 2) { const a = L.shift(); let k = L.findIndex(c => c.m !== a.m); if (k < 0) k = 0; const [bb] = L.splice(k, 1); coppie.push([a, bb]); usati.add(a.id); usati.add(bb.id); } }
} else {
  const L = sceltaV.clubs.filter(c => c.lg === sceltaV.clubs[0].lg); for (let i = 0; i + 1 < L.length && coppie.length < 5; i += 2) coppie.push([L[i], L[i + 1]]);
}
const bracci = SOLO ? [SOLO] : (PRIMA ? ['prima'] : ['verde', 'rosso']);
const esiti = {};
for (const br of bracci) { const rosso = br === 'rosso'; esiti[br] = [];
  for (let i = 0; i < coppie.length; i++) { const [a, c] = coppie[i];
    const fmt = (i === 0) ? [[360, 800, 'tel'], [1440, 900, 'pc']] : [[360, 800, 'tel']];
    for (const [w, h, f] of fmt) {
      const pg = await b.newPage(); await installCdnRoutes(pg); await pg.goto(URL0, { waitUntil: 'load', timeout: 90000 });
      await pg.waitForFunction(() => typeof CLUBS !== 'undefined', null, { timeout: 60000 }).catch(() => {});
      const objs = await pg.evaluate(([x, y]) => [CLUBS.find(q => q.id === x), CLUBS.find(q => q.id === y)], [a.id, c.id]); await pg.close();
      const r = await misuraCoppia({ id: a.id, obj: objs[0] }, { id: c.id, obj: objs[1] }, rosso, w, h, `${f}-${a.m || 'x'}-${c.m || 'x'}`, br === 'prima' ? { home: MODULI[i % 5], away: MODULI[(i + 1) % 5] } : null);
      if (br === 'prima') r.forzato = { home: MODULI[i % 5], away: MODULI[(i + 1) % 5] };
      r.formato = f; esiti[br].push(r);
      console.log(`[${br}] ${f} ${r.casa}(${r.rosa?.mCasa}) vs ${r.ospite}(${r.rosa?.mOspite}) a capo ${r.aCapo} · rosa ${JSON.stringify(r.rosa && [r.rosa.casa, r.rosa.ospite])} · anteprima ${JSON.stringify(r.anteprima)} · campo ${JSON.stringify(r.campo || r.campoGrezzo)} · motore ${JSON.stringify(r.campoMotore)} · preset ${JSON.stringify(r.preset)} / ${r.presetOsp} · fuori posto ${r.fuoriPosto} · trama ${JSON.stringify(r.trama)}${r.errore ? ' · ERRORE ' + r.errore : ''}`);
    }
  }
}
await b.close(); srv.close();
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/moduli-112.json', import.meta.url), JSON.stringify({ distribuzione: sceltaV.dist, perLega: sceltaV.perLega, nazionali: sceltaV.naz, esiti }, null, 1));
if (PRIMA) { console.log('misura «prima» registrata in out/moduli-112.json'); process.exit(0); }
const g = [];
if (esiti.verde) { const errV = esiti.verde.flatMap(giudica); if (errV.length) g.push('verde: ' + errV.join(' | '));
  const cop = new Set(); esiti.verde.forEach(r => { if (r.rosa) { cop.add(r.rosa.mCasa); cop.add(r.rosa.mOspite); } });
  const club = new Set(); esiti.verde.forEach(r => { club.add(r.casa); club.add(r.ospite); });
  if (MODULI.some(m => !cop.has(m))) g.push('verde: moduli coperti ' + [...cop].join(',') + ' (servono tutti e 5)');
  if (club.size < 10) g.push('verde: club veri coperti ' + club.size + ' (ne servono 10)'); }
if (esiti.rosso) { const errR = esiti.rosso.flatMap(giudica); if (!errR.length) g.push('rosso: con __CPM_NO_G112 nessun club cade — il guardiano non vede il difetto'); }
if (g.length) { console.log('❌ moduli-112 — braccio ' + (g[0].split(':')[0]) + ' · motivo:'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ moduli-112 · braccio verde: rosa = anteprima = campo = modulo su ' + (esiti.verde ? esiti.verde.length : 0) + ' misure · braccio rosso: il difetto si vede (__CPM_NO_G112 riporta tutti a 4-3-3)');
