#!/usr/bin/env node
/* [giro 185 · PO-384, decisione PO «Solo le partite decisive»] GUARDIANO momento-185 — «Vai al prossimo momento» nella corsa
   al titolo e nella lotta salvezza. Segnalazione: FC Merseyside 3° a W29-30, il tasto si fermava a OGNI partita («⚽ Partita
   chiave · 🏆 Corsa al titolo — 0 settimane · 0 partite»). Sul gioco vero (?cpmtest=1) giudica:
   1. LA REGOLA (posta165 sul calendario vero, classifica tenuta ferma, W28-38) su tre classifiche: foto (3° a 6 punti), capolista
      (+4 sul secondo), salvezza (penultimo). Conta le partite con posta nei due bracci; nel verde nessuna partita del periodo
      porta l'etichetta generica «🏆 Corsa al titolo» / «🆘 Lotta salvezza» e ogni fermata del periodo e' decisiva (scontro
      diretto, ultime 3 giornate, titolo/retrocessione decidibili) o un'altra regola invariata. Casi costruiti: scontro diretto,
      ultime giornate, titolo vincibile, titolo perdibile, retrocessione possibile, partita qualunque del periodo senza posta.
   2. LA CORSA VERA del tasto da W28 a fine stagione sulla classifica della foto e su quella della salvezza: fermate per motivo,
      corse, partite simulate dal tasto; nessuna fermata «partita chiave» con l'etichetta generica; stagione in fondo.
   Braccio rosso: CPM_ROSSO185=1 accende __CPM_NO_G185 (regola del giro 165) → il guardiano DEVE uscire 1.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node momento-185.mjs   (CPM_SOLO185=1|2) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO185 === '1';
const SOLO = (process.env.CPM_SOLO185 || '').split(',').filter(Boolean);
const fai = (n) => !SOLO.length || SOLO.includes(String(n));
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const MER = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const GENERICHE = ['🏆 Corsa al titolo', '🆘 Lotta salvezza'];
function savePro(over = {}) {
  const s = 80;
  return { name: 'Guardiano Corsa', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 24, ovr: s, tutorialDone: true, position: 'ATT',
    club: MER, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, ...AP, ...over };
}
/* classifica sintetica: noi all'indice `io`, punti decrescenti a passo `passo` dalla vetta `top`, gap esplicito per la capolista */
const CLASSIFICHE = {
  foto: { io: 2, top: 60, passo: 3 },           /* 3°, 6 punti dalla vetta: la situazione della foto */
  capolista: { io: 0, top: 60, passo: 4 },      /* in testa, +4 sul secondo */
  salvezza: { io: -2, top: 60, passo: 2 },      /* penultimo */
};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(player, rosso) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, r]) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (r) window.__CPM_NO_G185 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1200);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; });
  await sleep(800);
  return { page, errors };
}
/* nel browser: la classifica sintetica dalle squadre vere della lega */
const COSTRUISCI = `(function(cfg){const P=window.__CPM_CAREER.snapshot();const all=(P.standings||[]);const noi=all.find(t=>t.id==='liv');const altri=all.filter(t=>t.id!=='liv');
  const n=all.length;const io=cfg.io<0?n+cfg.io:cfg.io;const ord=[...altri.slice(0,io),noi,...altri.slice(io)];
  return ord.map((t,i)=>({...t,pts:Math.max(0,cfg.top-i*cfg.passo),gd:0,gf:0,ga:0}));})`;

const clicca = async (page, sel, prova = 0) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { if (prova < 2) { await sleep(400); return clicca(page, sel, prova + 1); } return false; } };
async function aspettaFine(page, maxMs) { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const st = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; }); if (st !== 'corsa') return st; await sleep(400); } return 'scaduto'; }
const ultima = (page) => page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return L[L.length - 1] || null; });
const chiudiRiepilogo = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); });
async function corsa(page, maxMs) { if (!(await clicca(page, '[data-cpm="salta163-tasto"]'))) return { avviata: false }; await sleep(450); if (!(await clicca(page, '[data-cpm="salta163-vai"]'))) return { avviata: false };
  const e = await aspettaFine(page, maxMs); await sleep(500); return { avviata: true, esito: e, fine: await ultima(page) }; }
const stato = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const m = document.querySelector('[data-cpm="salta163-motivo"]');
  return { s: p.season || 1, w: p.week || 1, motivo: m ? m.innerText.trim() : null, screen: window.__CPM_CAREER.screen() }; });

try {
  /* ---------- 1. la regola ---------- */
  if (fai(1)) {
    console.log('1) la regola (posta165 sul calendario vero, classifica ferma, W28-38)');
    const { page, errors } = await apri(savePro({ week: 28 }), ROSSO);
    const r = await page.evaluate(([cs, src, RO]) => {
      const C = window.__CPM_CAREER, P0 = C.snapshot(), J0 = JSON.stringify(P0); const costruisci = eval(src);
      const lega = (P0.calendar || []).filter(m => m && (!m.type || m.type === 'league')).sort((a, b) => (a.week || 0) - (b.week || 0));
      const out = {};
      for (const [nome, cfg] of Object.entries(cs)) {
        const st = costruisci(cfg); const da = nome === 'salvezza' ? 25 : 28;
        const per = lega.filter(m => (m.week || 0) >= 28 && (m.week || 0) <= 38).map(m => ({ ...m, played: false }));
        const cal = lega.map(m => ({ ...m, played: (m.week || 0) < 28 }));
        const riga = (rosso) => { if (rosso || RO) window.__CPM_NO_G185 = 1; else delete window.__CPM_NO_G185;
          const L = per.map(m => ({ w: m.week, opp: m.opponentName, k: C.posta165({ ...P0, week: m.week, standings: st, calendar: cal }, m) }));
          if (RO) window.__CPM_NO_G185 = 1; else delete window.__CPM_NO_G185; return L; };
        out[nome] = { verde: riga(false), rosso: riga(true), partite: per.length, da };
      }
      /* casi costruiti sulla classifica della foto */
      const st = costruisci(cs.foto); const n = st.length;
      const cal = lega.map(m => ({ ...m, played: (m.week || 0) < 28 }));
      const q = (over, m) => C.posta165({ ...P0, standings: st, calendar: cal, ...over }, m);
      const md = (t, w) => ({ type: 'league', week: w, opponentId: t.id, opponentName: t.n || t.name });
      const neutro = st.find((t, i) => i >= 8 && i <= n - 6 && !isDerby('liv', t.id));
      const ultime = lega.filter(m => (m.week || 0) >= 28).slice(-3)[0];
      const stLead = st.map((t, i) => ({ ...t, pts: t.id === 'liv' ? 90 : 70 - i }));
      const stLeadSort = [...stLead].sort((a, b) => b.pts - a.pts);
      const stFar = st.map((t, i) => ({ ...t, pts: i === 0 ? 90 : (t.id === 'liv' ? 82 : 70 - i) }));
      const late4 = lega.filter(m => (m.week || 0) >= 28).slice(-4)[0]; /* 4 gare alla fine: 3(R-1)=9 */
      const calLate4 = lega.map(m => ({ ...m, played: (m.week || 0) < late4.week }));
      const late = lega.filter(m => (m.week || 0) >= 28).slice(-6)[0]; /* 6 gare alla fine: 3(R-1)=15 */
      const calLate = lega.map(m => ({ ...m, played: (m.week || 0) < late.week }));
      const stSalv = costruisci(cs.salvezza); const nS = stSalv.length; const ioS = stSalv.findIndex(t => t.id === 'liv');
      const stSalvFar = stSalv.map((t, i) => ({ ...t, pts: t.id === 'liv' ? 10 : (i >= nS - 4 ? 30 : t.pts) }));
      const midS = stSalv.find((t, i) => i >= 6 && i <= nS - 6 && !isDerby('liv', t.id));
      out.casi = {
        diretto: q({ week: 30 }, md(st.slice(0, 4).find(t => t.id !== 'liv' && !isDerby('liv', t.id)), 30)),
        neutro: q({ week: 30 }, md(neutro, 30)), neutroId: neutro && neutro.id,
        ultime: q({ week: ultime.week }, { ...ultime, played: false }),
        vincere: q({ week: late.week, standings: stLeadSort, calendar: calLate }, md(stLeadSort.find((t, i) => i >= 8 && !isDerby('liv', t.id)), late.week)),
        perdere: q({ week: late4.week, standings: stFar, calendar: calLate4 }, md(stFar.find((t, i) => i >= 8 && t.id !== 'liv' && !isDerby('liv', t.id)), late4.week)),
        perdereLontano: q({ week: late.week, standings: stFar, calendar: calLate }, md(stFar.find((t, i) => i >= 8 && t.id !== 'liv' && !isDerby('liv', t.id)), late.week)),
        salvDiretto: q({ week: 30, standings: stSalv }, md(stSalv[nS - 4 === ioS ? nS - 3 : nS - 4], 30)),
        salvNeutro: q({ week: 30, standings: stSalv }, md(midS, 30)),
        retrocedere: q({ week: late.week, standings: stSalvFar, calendar: calLate }, md(stSalvFar.find((t, i) => i >= 6 && i <= nS - 6 && !isDerby('liv', t.id)), late.week)),
        lateW: late.week,
      };
      out.puro = JSON.stringify(C.snapshot()) === J0;
      return out;
    }, [CLASSIFICHE, COSTRUISCI, ROSSO]);
    for (const nome of Object.keys(CLASSIFICHE)) {
      const x = r[nome]; const v = x.verde.filter(e => e.k).length, ro = x.rosso.filter(e => e.k).length;
      const gen = x.verde.filter(e => GENERICHE.includes(e.k));
      ok(gen.length === 0, `${nome}: nessuna partita W28-38 con l'etichetta generica (${gen.length}${gen.length ? ': ' + gen.slice(0, 3).map(e => 'W' + e.w + ' ' + e.k).join(' · ') : ''})`);
      ok(v < ro, `${nome}: partite con posta W28-38 ${ro} → ${v} su ${x.partite}`);
      note.push(`${nome} [verde] ` + x.verde.map(e => `W${e.w}:${e.k || '—'}`).join(' | '));
      note.push(`${nome} [rosso] ${ro}/${x.partite} con posta · ${[...new Set(x.rosso.map(e => e.k))].join(' / ')}`);
    }
    const c = r.casi;
    ok(/scontro diretto|vertice|capolista/i.test(c.diretto || ''), `corsa al titolo contro la capolista → «${c.diretto}»`);
    ok(c.neutro === null, `corsa al titolo contro una di metà classifica (${c.neutroId}), W30 → ${c.neutro} (niente posta)`);
    ok(/ultime giornate|Finale di stagione/.test(c.ultime || ''), `terzultima giornata → «${c.ultime}»`);
    ok(/si può vincere/.test(c.vincere || ''), `capolista a +20 con 6 gare da giocare (W${c.lateW}) → «${c.vincere}»`);
    ok(/si può perdere/.test(c.perdere || '') && c.perdereLontano === null, `seconda a -8 dalla vetta con 4 gare da giocare → «${c.perdere}»; con 6 gare → ${c.perdereLontano}`);
    ok(/salvezza — scontro diretto/.test(c.salvDiretto || ''), `salvezza contro una delle ultime 4 → «${c.salvDiretto}»`);
    ok(c.salvNeutro === null, `salvezza contro una di metà classifica, W30 → ${c.salvNeutro} (niente posta)`);
    ok(/retrocedere/.test(c.retrocedere || ''), `penultima a -20 dalla salvezza con 6 gare → «${c.retrocedere}»`);
    ok(r.puro, 'la regola è pura: il salvataggio non cambia');
    ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
    await page.close();
  }

  /* ---------- 2. la corsa vera ---------- */
  if (fai(2)) {
    console.log('2) la corsa vera del tasto da W28 a fine stagione');
    for (const nome of ['foto', 'salvezza']) {
      const t0 = Date.now();
      const { page, errors } = await apri(savePro({ week: 28 }), ROSSO);
      await page.evaluate(([cfg, src]) => { const st = eval(src)(cfg); window.__CPM_CAREER.patch({ standings: st }); }, [CLASSIFICHE[nome], COSTRUISCI]);
      await sleep(800);
      const inizio = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const s = [...(p.standings || [])].sort((a, b) => b.pts - a.pts); return { w: p.week, pos: s.findIndex(t => t.id === 'liv') + 1, n: s.length, mh: (p.matchHistory || []).length }; });
      let corse = 0, tocchi = 0; const fermate = {}, perche = [];
      while (corse < 40) {
        const st = await stato(page);
        if (st.s !== 3 || st.w > 38 || st.screen !== 'dashboard') break;
        if (st.motivo && /finestra/.test(st.motivo)) { tocchi++; await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); }); await sleep(700); }
        const c = await corsa(page, 200000);
        if (!c.avviata) { const s2 = await stato(page); note.push(`${nome}: tasto non cliccabile a W${s2.w}: ${s2.motivo}`); break; }
        corse++; tocchi += 2;
        if (c.esito === 'scaduto') { ok(false, `${nome}: la corsa non si è fermata entro 200 s`); break; }
        const motivo = c.fine ? c.fine.motivo : '?'; fermate[motivo] = (fermate[motivo] || 0) + 1;
        if (motivo === 'partita chiave') { perche.push(`W${c.fine.w} ${c.fine.perche}`); tocchi++;
          if (!(await clicca(page, '[data-cpm="simula-conferma"]'))) await page.getByText('Simula partita', { exact: false }).first().click({ timeout: 5000 }).catch(() => {});
          await sleep(1500); }
        else if (motivo === 'fine stagione') break;
        else { tocchi++; await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });
          if (motivo === 'mercato') await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); if (p.transferSaga && !p.transferSaga.delivered) window.__CPM_CAREER.patch({ transferSaga: null }); });
          await sleep(900); }
        await chiudiRiepilogo(page); await sleep(300);
        for (let k = 0; k < 5; k++) { await sleep(400); const f = await page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return null; const b = [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); return 1; }); if (!f) break; tocchi++; }
      }
      const fin = await page.evaluate((mh0) => { const p = window.__CPM_CAREER.snapshot(); const L = window.__CPM_SALTA153 || []; const s = [...(p.standings || [])].sort((a, b) => b.pts - a.pts);
        const lega = (p.matchHistory || []).slice(mh0).filter(m => !m.cup && !m.euro && !m.national);
        return { s: p.season, w: p.week, lega: lega.length, sim: L.reduce((a, f) => a + (f.partite || 0), 0), pos: s.findIndex(t => t.id === 'liv') + 1 }; }, inizio.mh);
      const pk = fermate['partita chiave'] || 0;
      const gen = perche.filter(x => GENERICHE.some(g => x.endsWith(' ' + g)));
      ok(gen.length === 0, `${nome}: nessuna fermata «partita chiave» con l'etichetta generica (${gen.length}${gen.length ? ': ' + gen.slice(0, 3).join(' · ') : ''})`);
      ok(fin.w > 38 || fin.s > 3, `${nome}: stagione arrivata in fondo (S${fin.s} W${fin.w})`);
      ok(errors.length === 0, `${nome}: nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
      note.push(`${nome} corsa vera (${ROSSO ? 'rosso' : 'verde'}): da W${inizio.w} ${inizio.pos}°/${inizio.n} a ${fin.pos}° · corse ${corse} · tocchi ${tocchi} · fermate ${JSON.stringify(fermate)} · partite chiave ${pk} · gare di lega giocate ${fin.lega} · partite fatte dal tasto ${fin.sim} · ${Math.round((Date.now() - t0) / 1000)} s`);
      note.push(`${nome} perché: ${perche.join(' | ') || '—'}`);
      await page.close();
    }
  }
} catch (e) { ok(false, 'eccezione: ' + (e && e.stack || e).toString().slice(0, 300)); }
await browser.close(); srv.close();
console.log('\nNOTE'); for (const n of note) console.log('  · ' + n);
console.log(`\nmomento-185 ${ROSSO ? '[ROSSO __CPM_NO_G185]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
