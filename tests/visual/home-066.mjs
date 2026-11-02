#!/usr/bin/env node
/* [PO-066 · giro 30] GUARDIANO DEI RIQUADRI DELLA HOME — «box fuori standard».
   Censisce i riquadri della home (figli diretti della colonna della dashboard) in SEI situazioni:
   U18 inizio stagione · pro inizio · pro meta' (mercato invernale, finale di coppa) · pro fine stagione ·
   pro infortunato · pro con contratto in scadenza. Le fisarmoniche dei «momenti» sono aperte, cosi' si misura
   anche il contenuto che il giocatore vede quando apre.
   Per ogni riquadro misura, sul DOM vero (stili calcolati):
     R1 raggio esterno — un riquadro con fondo o bordo deve avere un raggio della scala RAD (6·8·12·16·20 o pill);
        un riquadro-card (fondo pieno chiaro) deve avere RAD.md (12) come la Card del kit;
     R2 raggi interni fuori scala — elementi con fondo/bordo e raggio che non e' un token (es. 5, 7, 10, 14 px);
     T1 corpi fuori scala — testo con font-size che non e' un passo FS (11·12·13·15·17·20·24·32·44·64);
     T2 corpi sotto il pavimento (11 px);
     C1 fondi scuri o sfumati dentro un riquadro chiaro (la regola «card neutra» del 7.999.30);
     O1 sforamento — elementi che escono a destra dello schermo (non dentro uno scorritore orizzontale);
     F1 fondo del riquadro non neutro — la card della home ha il fondo della card (TH.card): il colore sta
        nell'occhiello e nelle icone, mai nel fondo (scelta PO 27/09 «Card neutra», 7.999.30);
     A1 fisarmonica fuori standard — sulla home la fisarmonica e' la Card col «momento» (titolo in chiaro e
        freccia), non il cappello maiuscolo della `Fisarmonica` delle schede Stagione/Club (raggio 6);
     P1 persona senza figurina — un riquadro del procuratore mostra la sua figurina, come gli altri.
   Esclusi dalla misura: l'interno degli stemmi (SVG) e delle figurine, le barre di progresso (alte <= 8 px).
   Esito: VERDE se nessun riquadro ha violazioni; ROSSO altrimenti (elenco a schermo).
   Rosso: CPM_ROSSO=1 accende window.__CPM_NO_HOME066 (i riquadri tornano com'erano) e il guardiano deve fallire.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node home-066.mjs   [CPM_LARG=412] [CPM_FOTO=1] [CPM_TEMA=scuro]
   Uscita: docs/sviluppo/foto/home066/censimento-<verde|rosso>-<larg>.json (+ foto se CPM_FOTO=1). */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const LARG = +(process.env.CPM_LARG || 412);
const FOTO = process.env.CPM_FOTO === '1';
const SCURO = process.env.CPM_TEMA === 'scuro';
const OUT = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'home066'); fs.mkdirSync(OUT, { recursive: true });
const TAG = (process.env.CPM_TAG || (ROSSO ? 'rosso' : 'verde')) + '-' + LARG + (SCURO ? '-scuro' : '');
const base = (o) => ({ name: 'Probe Home', nation: 'Italia', avatarId: 0, age: 25, ovr: 80, tutorialDone: true, weekLived: false,
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 74, morale: 74, fatigue: 10, popularity: 50, value: 25, bankBalance: 90000, goals: 9, assists: 4, matches: 18, ...o });
const pro = (s, w, extra) => base({ proStatus: 'pro', season: s, week: w, campDone: true, presidentModalSeason: s, jerseyNumSeason: s, drawSeen: s, mercatoSeen: s, presentSeason: s,
  seasonPledge: { season: s, tone: 'equilibrato' }, club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  contract: { duration: 3, wage: 30000, expiresAtSeason: s + 3 }, ...extra });
const SCENARI = [
  ['u18-inizio', base({ proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66, goals: 0, assists: 0, matches: 0, value: 1, bankBalance: 1000,
    club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' }, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } })],
  ['pro-inizio', pro(4, 2, { goals: 0, assists: 0, matches: 1 })],
  ['pro-meta', pro(4, 19, { transferListed: true, calendar: [{ week: 19, type: 'cup', cupRound: 4, cupRoundName: 'Finale', opponentName: 'Atletico Norte', opponentId: 'atn', played: false, isHome: true }] })],
  ['pro-fine', pro(4, 36, { goals: 17, assists: 8, matches: 33 })],
  ['pro-infortunato', pro(4, 12, { injured: true, injuryType: 'stiramento', injurySeverity: 'medio', injuryWeeks: 3, originalInjuryWeeks: 4, fitnessCoachRel: 70 })],
  ['pro-svincolato', pro(4, 23, { contractExpired: true })],
  ['pro-record', pro(4, 30, { goals: 34, matches: 26, matchHistory: Array.from({ length: 26 }, (_, i) => ({ opponent: 'Avv ' + i, goals: i < 8 ? 2 : 1, assists: 0, rating: 7.2, won: true, homeScore: 2, awayScore: 0 })) })],
];
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const R = { rosso: ROSSO, larg: LARG, tema: SCURO ? 'scuro' : 'chiaro', scenari: [], errori: [] };
for (const [nome, pl] of SCENARI) {
  const ctx = await browser.newContext({ viewport: { width: LARG, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => R.errori.push(nome + ': ' + String(e.message || e).slice(0, 140)));
  await page.addInitScript(c => { window.__CPM_GLB = false; window.__CPM_FIS_APERTE = true; if (c.rosso) window.__CPM_NO_HOME066 = true; if (c.rosso068) window.__CPM_NO_DUP068 = true;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: c.pl })); }, { rosso: ROSSO, rosso068: process.env.CPM_ROSSO068 === '1', pl });
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await sleep(2500);
  /* le finestre in primo piano (PO-224) coprono la home: si chiudono, non fanno parte dei riquadri */
  for (let k = 0; k < 4; k++) { const chiusa = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(Chiudi|Più tardi|Ho capito|Continua|OK|Ok)$/.test((x.innerText || '').trim()) && x.closest('[role=dialog],[aria-modal=true]')); if (b) { b.click(); return true; } return false; }); if (!chiusa) break; await sleep(500); }
  /* tema scuro: dal 7.947 il gioco ha UN solo tema e CareerApp riassegna TH_LIGHT_ORIG a ogni render, quindi un
     Object.assign(TH, TH_DARK) viene cancellato al render successivo. Solo per il collaudo: si devia quella riassegnazione
     verso TH_DARK. E' una prova di robustezza dei token, non una schermata che il giocatore puo' vedere. */
  if (SCURO) { await page.evaluate(() => { try { const oa = Object.assign; Object.assign = function (t, ...src) { if (t === TH && src[0] === TH_LIGHT_ORIG) return oa(t, TH_DARK); return oa(t, ...src); }; Object.assign(TH, TH_DARK); document.body.style.background = TH.bg; } catch (_e) {} try { window.__CPM_CAREER.goTab('profile'); } catch (_e) {} }); await sleep(400); await page.evaluate(() => { try { window.__CPM_CAREER.goTab('dashboard'); } catch (_e) {} }); await sleep(600); }
  /* [giro 96b] la home e' la scheda «dashboard». Da svincolato il gioco PORTA DI PROPOSITO alla scheda Procuratore 900 ms dopo
     l'avvio (giro 94, D3: «rinnova o cerca una squadra»): il censimento misurava quella scheda con la regola della home (A1) e
     la trovava «fuori standard» — la fisarmonica delle schede e' giusta li'. Si torna alla dashboard e si misura la home. */
  try { const ok = await page.evaluate(() => window.__CPM_CAREER && window.__CPM_CAREER.goTab ? window.__CPM_CAREER.goTab('dashboard') : false); if (ok) await sleep(700); } catch (_e) {}
  /* apre i «momenti» chiusi (Card con momento) — sono button aria-expanded=false DENTRO la colonna */
  await page.evaluate(() => { const sc = document.querySelector('.cpm-scroll'); if (!sc) return; for (const el of sc.querySelectorAll('button[aria-expanded="false"]')) try { el.click(); } catch (_e) {} });
  await sleep(900);
  const m = await page.evaluate(() => {
    const FS = [11, 12, 13, 15, 17, 20, 24, 32, 44, 64], RADS = [0, 6, 8, 12, 16, 20];
    const sc = document.querySelector('.cpm-scroll'); if (!sc) return null;
    let col = sc; while (col.children.length === 1) col = col.children[0];
    const W = document.documentElement.clientWidth;
    const rgb = s => { const x = String(s).match(/rgba?\(([^)]+)\)/); if (!x) return null; const p = x[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const radOk = (cs, el) => { const v = parseFloat(cs.borderTopLeftRadius) || 0; if (/%/.test(cs.borderTopLeftRadius)) return true; const r = el.getBoundingClientRect(); if (v >= Math.min(r.width, r.height) / 2 - 1) return true; /* pill/cerchio */ return RADS.includes(Math.round(v)); };
    const visibile = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
    const haScatola = cs => { const c = rgb(cs.backgroundColor); return (c && c.a > 0.05) || (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) || /gradient/.test(cs.backgroundImage); };
    const ESCLUDI = /^(K⚽rward|⚡ Vivi|🏁 Avvia Stagione|🏥 Sessione Riabilitazione|✅ Settimana vissuta|⏭️ Avanza Settimana|☕ Sostieni)/;
    const fondoCard = (() => { const c = document.createElement('div'); c.style.background = (typeof TH !== 'undefined' && TH.card) || '#ffffff'; document.body.appendChild(c); const v = getComputedStyle(c).backgroundColor; c.remove(); return v; })();
    const out = [];
    [...col.children].forEach((box, i) => {
      if (!visibile(box)) return;
      const testo = (box.innerText || '').trim().replace(/\s+/g, ' ');
      if (ESCLUDI.test(testo)) return; /* testata dell'eroe, CTA della settimana e piede con la nav: non sono riquadri */
      let cs = getComputedStyle(box); const rb = box.getBoundingClientRect();
      /* un involucro senza scatola (margine, colonna) si giudica sulla sua prima scatola */
      let sc0 = box; if (!haScatola(cs)) { const k = [...box.children].find(x => visibile(x) && haScatola(getComputedStyle(x)) && x.getBoundingClientRect().width > rb.width * 0.8); if (k) { sc0 = k; cs = getComputedStyle(k); } }
      const v = { i, titolo: testo.slice(0, 48), h: Math.round(rb.height), raggio: cs.borderTopLeftRadius, fondo: cs.backgroundColor, viol: [] };
      if (haScatola(cs) && !radOk(cs, sc0)) v.viol.push('R1 raggio esterno ' + cs.borderTopLeftRadius);
      const fb = rgb(cs.backgroundColor); const chiaro = fb && fb.a > 0.5 && lum(fb) > 0.6;
      if (chiaro && sc0.tagName !== 'BUTTON' && Math.round(parseFloat(cs.borderTopLeftRadius)) !== 12) v.viol.push('R1 card con raggio ' + cs.borderTopLeftRadius + ' invece di RAD.md');
      if (fb && fb.a > 0.5 && cs.backgroundColor !== fondoCard && !/gradient/.test(cs.backgroundImage)) v.viol.push('F1 fondo non neutro ' + cs.backgroundColor);
      if (/gradient/.test(cs.backgroundImage)) v.viol.push('F1 fondo sfumato');
      const fisK = [...box.querySelectorAll('button[aria-expanded]')].find(bt => Math.round(parseFloat(getComputedStyle(bt).borderTopLeftRadius)) === 6);
      if (fisK) v.viol.push('A1 fisarmonica col cappello delle schede (raggio 6), non la Card col momento');
      const r2 = new Set(), t1 = new Set(), t2 = new Set(), c1 = new Set(), o1 = new Set();
      for (const e of box.querySelectorAll('*')) {
        if (!visibile(e)) continue; const s = getComputedStyle(e);
        if (s.visibility === 'hidden' || +s.opacity < 0.1) continue;
        if (e.closest('[data-cpm-figurina]') && e.getAttribute('data-cpm-figurina') == null) continue; /* l'interno della figurina ha le sue regole (FigurinaKorward23) */
        if (e.closest('svg')) continue; /* stemmi: la sigla e' parte del disegno, non tipografia */
        if (e === fisK) continue; /* gia' contato in A1 */
        if (haScatola(s) && !radOk(s, e)) r2.add(s.borderTopLeftRadius);
        const haTesto = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
        if (haTesto) { const f = Math.round(parseFloat(s.fontSize) * 10) / 10; if (!FS.includes(f)) t1.add(f + 'px «' + e.textContent.trim().slice(0, 18) + '»'); if (f < 11) t2.add(f + 'px'); }
        if (chiaro) { const c = rgb(s.backgroundColor); if (/gradient/.test(s.backgroundImage) && !e.closest('[data-cpm-figurina]')) c1.add('sfumato'); else if (c && c.a > 0.6 && lum(c) < 0.18 && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().height > 8) c1.add('scuro ' + s.backgroundColor); }
        const r = e.getBoundingClientRect(); if (r.right > W + 0.5) { let clip = false; for (let a = e.parentElement; a && a !== box.parentElement; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') { clip = true; break; } } if (!clip) o1.add(Math.round(r.right - W) + 'px'); }
      }
      if (r2.size) v.viol.push('R2 raggi interni fuori scala: ' + [...r2].join(', '));
      if (t1.size) v.viol.push('T1 corpi fuori scala: ' + [...t1].slice(0, 4).join(' · '));
      if (t2.size) v.viol.push('T2 sotto il pavimento: ' + [...t2].join(', '));
      if (c1.size) v.viol.push('C1 fondi non neutri: ' + [...c1].join(', '));
      if (o1.size) v.viol.push('O1 sforamento: ' + [...o1].join(', '));
      v.figurine = box.querySelectorAll('[data-cpm-figurina]').length;
      if (/procuratore/i.test(testo.slice(0, 60)) && !v.figurine) v.viol.push('P1 riquadro del procuratore senza la sua figurina');
      v.fisarmonica = !!box.querySelector('button[aria-expanded]');
      /* [7.999.173 PO-066, giro 68] D1 titolo ripetuto: dentro la fisarmonica aperta un testo identico al suo titolo (occhiello doppione).
         Rosso CPM_ROSSO068=1 (__CPM_NO_DUP068). */
      { const bt = box.querySelector('button[aria-expanded]'); const sp = bt && bt.querySelector('span'); const tt = sp ? (sp.textContent || '').trim().toLowerCase() : '';
        if (tt) { const dup = [...box.querySelectorAll('div,span')].find(e => !bt.contains(e) && visibile(e) && e.children.length === 0 && (e.textContent || '').trim().replace(/\s+/g, ' ').toLowerCase() === tt);
          if (dup) v.viol.push('D1 titolo ripetuto dentro la fisarmonica: «' + tt + '»'); } }
      out.push(v);
    });
    return { riquadri: out, scrollW: document.documentElement.scrollWidth, W };
  });
  if (!m) { R.errori.push(nome + ': colonna della home non trovata'); await ctx.close(); continue; }
  R.scenari.push({ nome, ...m });
  if (FOTO) {
    const hTot = await page.evaluate(() => { const sc = document.querySelector('.cpm-scroll'); return sc ? sc.scrollHeight : 915; });
    await page.setViewportSize({ width: LARG, height: Math.min(Math.max(915, hTot + 40), 9000) }); await sleep(500);
    await page.screenshot({ path: path.join(OUT, `${nome}-${TAG}.png`), fullPage: false });
  }
  await ctx.close();
}
await browser.close(); await new Promise(r => server.close(r));
let nViol = 0, nRiq = 0;
for (const s of R.scenari) { console.log(`\n== ${s.nome} (${s.riquadri.length} riquadri, scrollWidth ${s.scrollW}/${s.W}) ==`);
  for (const v of s.riquadri) { nRiq++; const ok = !v.viol.length; if (!ok) nViol++;
    console.log(`  ${ok ? '✅' : '❌'} #${v.i} «${v.titolo}» r=${v.raggio} fig=${v.figurine}${v.fisarmonica ? ' fis' : ''}${ok ? '' : '\n       ' + v.viol.join('\n       ')}`); } }
const sfora = R.scenari.filter(s => s.scrollW > s.W);
R.esito = (R.scenari.length === SCENARI.length && !R.errori.length && nViol === 0 && !sfora.length) ? 'VERDE' : 'ROSSO';
R.totali = { riquadri: nRiq, fuoriStandard: nViol, scenari: R.scenari.length, sforamentoPagina: sfora.map(s => s.nome) };
fs.writeFileSync(path.join(OUT, `censimento-${TAG}.json`), JSON.stringify(R, null, 1));
console.log(`\nerrori: ${R.errori.length ? R.errori.join(' | ') : 'nessuno'}`);
console.log(`PO-066 home: ${nRiq} riquadri censiti in ${R.scenari.length} situazioni, ${nViol} fuori standard → ${R.esito}${ROSSO ? ' (braccio ROSSO __CPM_NO_HOME066)' : ''}`);
process.exit(R.esito === 'VERDE' ? 0 : 1);
