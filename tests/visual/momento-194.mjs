#!/usr/bin/env node
/* [giro 194 · PO-405 / PO-410 / PO-411] GUARDIANO momento-194 — il tasto «Vai al prossimo momento» sul gioco vero (?cpmtest=1).
   A. PO-405 «Perche' il vai al prossimo momento e' interrotto da un'intervista?»: un'intervista SETTIMANALE aperta durante la corsa
      non la ferma; risponde da sola col tono abituale (storico ivToni194 / diario; nessuna storia = Diplomatico), gli effetti
      arrivano nel diario come per una scelta, lo storico del giocatore NON cresce, e il riepilogo la elenca fra le «Scelte fatte
      da solo». Tre casi: pro con storia «umile», pro senza storia, Primavera senza storia. Rosso __CPM_NO_G194A: la corsa si ferma
      con motivo «intervista».
   B. PO-410: il riepilogo della corsa non ha piu' il tasto «Ok», resta a schermo finche' il giocatore non fa niente (2,5 s) e
      sparisce alla prossima azione (step del banco = il tasto principale: vive la settimana / simula / avanza).
      Rosso __CPM_NO_G194B: c'e' l'«Ok» e il riepilogo resta dopo l'azione.
   C. PO-411: il tasto e' pieno nel colore del club, titolo in grassetto, sotto «fino a…»; contrasto >= 4,5:1 di titolo e riga
      piccola sul colore (misurato su un club chiaro #f5f5f5, uno scuro #0f0f0f e FC Merseyside #dc2626), a 375 px senza
      scorrimento orizzontale. Rosso __CPM_NO_G194C: il tasto secondario di prima (fondo non del club, nessuna riga «fino a»).
   Foto 375 px (dpr 2) in docs/sviluppo/giro194/. Uscita 0 solo se il verde passa E ogni rosso viene bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node momento-194.mjs   (CPM_SOLO194=A,B,C) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SOLO = (process.env.CPM_SOLO194 || '').split(',').filter(Boolean);
const fai = (n) => !SOLO.length || SOLO.includes(n);
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro194'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const CLUB = {
  mer: { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' },
  chiaro: { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' },
  scuro: { id: 'new', n: 'FC Tyneside', a: 'TYN', p: 84, c: '#0f0f0f', c2: '#ffffff', nat: '🏴', lg: 'Premier Division' },
};
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function salva(over = {}) {
  const s = 80;
  return { name: 'Guardiano Momento', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 5, weekLived: false, age: 24, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB.mer, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over };
}
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(player, flag, w = 412) {
  const page = await browser.newPage({ viewport: { width: w, height: 860 }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, f]) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; for (const x of [].concat(f || [])) window[x] = 1;/* [giro 335] uno o piu' interruttori */
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, flag]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1000);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; window.__CPM_IV194 = []; });
  await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} });
  await sleep(500);
  return { page, errors };
}
const clicca = async (page, sel) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { return false; } };
const statoSalta = (page) => page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; });
async function aspettaFine(page, maxMs) { const t0 = Date.now(); await sleep(400); while (Date.now() - t0 < maxMs) { if ((await statoSalta(page)) !== 'corsa') return true; await sleep(300); } return false; }

/* una corsa con l'intervista settimanale aperta subito dopo «Vai» */
async function corsaConIntervista(player, flag) {
  const { page, errors } = await apri(player, flag);
  const premuto = (await clicca(page, '[data-cpm="salta163-tasto"]')) && (await sleep(450), await clicca(page, '[data-cpm="salta163-vai"]'));
  if (!premuto) { const mot = await page.evaluate(() => { const m = document.querySelector('[data-cpm="salta163-motivo"]'); return m ? m.innerText : '?'; }); await page.close(); return { premuto: false, mot }; }
  await page.evaluate(() => window.__CPM_CAREER.forceInterview('weekly'));
  const finita = await aspettaFine(page, 90000); await sleep(600);
  const r = await page.evaluate(() => { const L = window.__CPM_SALTA153 || [], p = window.__CPM_CAREER.snapshot(); const rp = document.querySelector('[data-cpm="salta163-riepilogo"]');
    return { fine: L[L.length - 1] || null, iv: window.__CPM_IV194 || [], log: (p.log || []).filter(l => /^🎙️ \[/.test(l)).slice(0, 4), toni: p.ivToni194 || null,
      riep: rp ? rp.innerText : null, ivAperta: !!document.querySelector('[data-cpm="eroe-intervista23"],[data-cpm="risposta24"]') }; });
  return { premuto: true, finita, page, errors, ...r };
}

try {
  if (fai('A')) {
    console.log('A) PO-405 · l\'intervista settimanale non ferma la corsa');
    const casi = [
      { nome: 'pro con storia umile', pl: salva({ ivToni194: { umile: 3, diplomatico: 1, diretto: 0 } }), atteso: 'umile', lab: 'Umile' },
      { nome: 'pro senza storia', pl: salva(), atteso: 'diplomatico', lab: 'Diplomatico' },
      { nome: 'pro, storia solo nel diario (ambizioso)', pl: salva({ log: ['🎙️ [diretto] "Voglio vincere tutto…"', '🎙️ [diretto] "Sono qui per…"', '🎙️ [umile] "Lavoro…"'] }), atteso: 'diretto', lab: 'Ambizioso' },
      { nome: 'Primavera senza storia', pl: salva({ proStatus: 'u18', club: { ...CLUB.chiaro, id: 'juve', isU18: true, name: 'Torino Athletic U18' }, age: 17, contract: null }), atteso: 'diplomatico', lab: 'Diplomatico' },
    ];
    for (const c of casi) {
      const v = await corsaConIntervista(c.pl, null);
      if (!v.premuto) { ok(false, `${c.nome}: tasto non premibile («${v.mot}») — non giudicato`); continue; }
      const motivo = v.fine && v.fine.motivo;
      const iv = v.iv[0];
      console.log(`    ${c.nome}: fermata «${motivo}» · risposte da sola ${v.iv.length} (${v.iv.map(x => x.tono + '/' + x.risposta).join(', ')}) · diario ${JSON.stringify(v.log.slice(0, 2))} · storico ${JSON.stringify(v.toni)}`);
      ok(v.finita && motivo && motivo !== 'intervista', `${c.nome}: la corsa non si ferma sull'intervista (motivo «${motivo}»)`);
      ok(!!iv && iv.tono === c.atteso && v.iv.every(x => x.tono === c.atteso), `${c.nome}: tono ${c.atteso} (${iv ? iv.tono : 'nessuna risposta'})`);
      ok(v.log.length >= 1 && v.log.every(l => l.startsWith('🎙️ [' + c.atteso + ']')), `${c.nome}: effetti applicati come una scelta (diario «🎙️ [${c.atteso}]» ×${v.log.length})`);
      ok(JSON.stringify(v.toni) === JSON.stringify(c.pl.ivToni194 || null), `${c.nome}: lo storico del giocatore non cresce con le risposte automatiche`);
      ok(!!v.riep && v.riep.includes('Intervista settimanale: tono ' + c.lab), `${c.nome}: riepilogo «Scelte fatte da solo» la elenca`);
      ok(!v.ivAperta, `${c.nome}: nessuna intervista lasciata aperta`);
      ok(!v.errors.length, `${c.nome}: nessun errore di pagina${v.errors.length ? ' (' + v.errors[0] + ')' : ''}`);
      await v.page.close();
    }
    const r = await corsaConIntervista(salva(), '__CPM_NO_G194A');
    const mr = r.premuto && r.fine && r.fine.motivo;
    console.log(`    rosso __CPM_NO_G194A: fermata «${mr}» · risposte da sola ${r.iv ? r.iv.length : '-'}`);
    ok(mr === 'intervista' && r.iv.length === 0, 'rosso A bocciato: la corsa si ferma con motivo «intervista»');
    if (r.page) await r.page.close();
  }

  if (fai('B')) {
    console.log('B) PO-410 · il riepilogo senza «Ok» sparisce alla prossima azione');
    for (const [flag, rosso] of [[null, false], ['__CPM_NO_G194B', true]]) {
      const { page, errors } = await apri(salva(), flag, 375);
      const premuto = (await clicca(page, '[data-cpm="salta163-tasto"]')) && (await sleep(450), await clicca(page, '[data-cpm="salta163-vai"]'));
      const finita = premuto && await aspettaFine(page, 90000);
      await sleep(600);
      const leggi = () => page.evaluate(() => { const rp = document.querySelector('[data-cpm="salta163-riepilogo"]'); return rp ? { c: true, ok: [...rp.querySelectorAll('button')].some(b => /^ok$/i.test(b.innerText.trim())), t: rp.innerText.split('\n')[0] } : { c: false }; });
      const a = await leggi(); await sleep(2500); const b = await leggi();
      if (!rosso && b.c) await page.screenshot({ path: path.join(FOTO, 'dopo-riepilogo-senza-ok-375.png') });
      if (rosso && b.c) await page.screenshot({ path: path.join(FOTO, 'prima-riepilogo-con-ok-375.png') });
      const passo = await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(1500);
      const c = await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return !!document.querySelector('[data-cpm="salta163-riepilogo"]'); });
      console.log(`    ${rosso ? 'rosso' : 'verde'}: corsa ${finita ? 'finita' : 'NON finita'} · riepilogo «${a.t || '-'}» presente ${a.c} · Ok ${a.ok} · dopo 2,5 s ${b.c} · azione «${passo}» → presente ${c}`);
      const verde = finita && a.c && !a.ok && b.c && !c && !errors.length;
      if (!rosso) ok(verde, 'verde B: riepilogo senza Ok, resta senza azioni, sparisce alla prossima azione');
      else ok(!verde && a.ok, 'rosso B bocciato (Ok presente / riepilogo che resta)');
      await page.close();
    }
  }

  if (fai('C')) {
    console.log('C) PO-411 · tasto pieno nel colore del club, contrasto misurato (375 px)');
    for (const [nome, club] of [['chiaro', CLUB.chiaro], ['scuro', CLUB.scuro], ['merseyside', CLUB.mer]]) {
      /* [giro 335 · PO-623, decisione PO] il tasto del momento non e' piu' pieno nel colore del club (un solo tasto primario nella
         Home, guardiano home-335): il C del giro 194 giudica il tasto pieno sul ramo che lo disegna ancora, cioe' col rosso __CPM_NO_G335. */
      for (const [flag, rosso] of [['__CPM_NO_G335', false], [['__CPM_NO_G335', '__CPM_NO_G194C'], true]]) {
        const { page, errors } = await apri(salva({ club }), flag, 375);
        const m = await page.evaluate(() => {
          const rgb = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => +x); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }; };
          const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
          const contr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
          const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
          const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (!t) return null;
          const club = window.__CPM_CAREER.snapshot().club.c; const bg = rgb(getComputedStyle(t).backgroundColor), cc = hex(club);
          const span = (sel) => { const e = t.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); return { txt: e.innerText.trim(), k: +contr(rgb(cs.color), bg).toFixed(2), fw: +cs.fontWeight, fs: parseFloat(cs.fontSize) }; };
          const tit = span('[data-cpm="salta163-titolo"]') || { txt: t.innerText.trim(), k: +contr(rgb(getComputedStyle(t).color), bg).toFixed(2), fw: +getComputedStyle(t).fontWeight, fs: parseFloat(getComputedStyle(t).fontSize) };
          const r = t.getBoundingClientRect();
          return { club, pieno: !!bg && bg.a > 0.9 && Math.abs(bg.r - cc.r) + Math.abs(bg.g - cc.g) + Math.abs(bg.b - cc.b) < 6, tit, dove: span('[data-cpm="salta163-dove"]'), h: Math.round(r.height), disabled: t.disabled,
            scroll: document.documentElement.scrollWidth > window.innerWidth + 1 };
        });
        await page.evaluate(() => { const c = document.querySelector('[data-cpm="corsa163"]'); if (c) c.scrollIntoView({ block: 'center' }); }); await sleep(300);
        const card = await page.$('[data-cpm="corsa163"]');
        if (card) await card.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-tasto-${nome}-375.png`) });
        if (!m) { ok(false, `${nome} ${rosso ? 'rosso' : 'verde'}: tasto assente — non giudicato`); await page.close(); continue; }
        console.log(`    ${rosso ? 'rosso' : 'verde'} ${nome} ${m.club}: pieno ${m.pieno} · titolo «${m.tit.txt}» ${m.tit.k}:1 peso ${m.tit.fw} · riga ${m.dove ? '«' + m.dove.txt + '» ' + m.dove.k + ':1 ' + m.dove.fs + 'px' : 'assente'} · h${m.h} · spento ${m.disabled} · scorrimento ${m.scroll}`);
        const verde = m.pieno && !m.disabled && m.tit.k >= 4.5 && m.tit.fw >= 700 && !!m.dove && /^fino a/.test(m.dove.txt) && m.dove.k >= 4.5 && m.h >= 48 && !m.scroll && !errors.length;
        if (!rosso) ok(verde, `verde C ${nome}: pieno nel colore del club, grassetto, «fino a…», contrasto ≥ 4,5`);
        else ok(!verde, `rosso C ${nome} bocciato`);
        await page.close();
      }
    }
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `❌ ROSSO — ${fails.length} controlli: ${fails.join(' · ')}` : '✅ VERDE — momento-194 (A intervista da sola · B riepilogo senza Ok · C tasto del club), rossi bocciati');
process.exit(fails.length ? 1 : 0);
