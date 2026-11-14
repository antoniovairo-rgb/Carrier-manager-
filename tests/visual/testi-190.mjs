#!/usr/bin/env node
/* [giro 190 · PO-380a · G181-01 «i testi che rompono l'incanto»] GUARDIANO testi-190. Sul gioco vero (?cpmtest=1):
   1. APERTURA DI STAGIONE (salvataggio con maglia/presentazione/presidente pendenti, «Vivi la Settimana» → wizard, si avanza
      passo per passo): nessun testo visibile contiene «wizard» o «dashboard»; il passo della maglia deve essere visto.
   2. HOME, CARRIERA, AGENTE: nessun «wizard»/«dashboard» visibile; la scheda del contratto (data-cpm contratto-v2) non dice
      «Contratto trascorso».
   3. CATALOGO: il tutorial non cita schede che non esistono («Opzioni») ne' la «Dashboard»; i testi di ritorno (LOCALE it/en)
      non dicono «dashboard»; l'evento «Il ragazzo della Primavera ti chiede…» non esce a un giocatore della Primavera ed esce a
      un professionista.
   4. FACCINA: una scelta d'impulso che abbassa il morale mostra 😟 accanto al numero negativo, mai 😄.
   5. CONSIGLIO DELLA SCENA a 375 px: su tutte le scene del catalogo che hanno un consiglio (44), forzate nel provino, il sottotitolo del pannello «La tua giocata» non e' mai
      tagliato (niente testo nascosto oltre le righe, niente puntini) e mostra frasi intere.
   Braccio rosso: CPM_ROSSO190A=1 accende __CPM_NO_G190A → deve uscire 1. «Non giudicato» = rosso.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node testi-190.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO190A === '1';
const FOTO = process.env.CPM_FOTO190 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const VIETATE = /\bwizard\b|dashboard/i;
const save = { phase: 'career', player: { name: 'Probe Uno', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 6, week: 1, weekLived: false, age: 24, ovr: 78, tutorialDone: true,
  campDone: false, mercatoSeen: 4, presidentModalSeason: 4, jerseyNumSeason: 4, presentSeason: 4, drawSeen: 6, jerseyNum: 9,
  squadRole: 'titolare', coachTrust: 80, value: 30, popularity: 55, goals: 0, assists: 0, matches: 0, matchHistory: [],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 75, morale: 70, fatigue: 5, contract: { duration: 3, wage: 20000, expiresAtSeason: 9 } } };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function nuovaPagina(vp, conSave) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_G190A = 1; if (o.s && !sessionStorage.getItem('t190')) { sessionStorage.setItem('t190', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } }, { r: ROSSO, s: conSave || null });
  return { page, errors };
}
const clicca = (page, re) => page.evaluate((src) => { const re = new RegExp(src, 'i');
  const cand = [...document.querySelectorAll('button,[role=button]')].filter(x => re.test((x.textContent || '').trim()) && x.getBoundingClientRect().width > 0);
  const t = cand.length ? cand[cand.length - 1] : null; if (!t) return false; t.click(); return true; }, re.source);
try {
  console.log('1-2) apertura di stagione, home, carriera, agente');
  {
    const { page, errors } = await nuovaPagina({ width: 412, height: 915 }, save);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(2500);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
    await sleep(1200);
    const visti = []; let maglia = false, passi = 0;
    const leggi = async (dove) => { const t = await page.evaluate(() => document.body.innerText || ''); const m = t.match(new RegExp('.{0,50}(\\bwizard\\b|dashboard).{0,30}', 'i')); if (m) visti.push(dove + ': «' + m[0].replace(/\s+/g, ' ') + '»'); return t; };
    await leggi('home');
    let cv = false; try { await page.getByText(/Avvia Stagione|Vivi la Settimana/i).first().click({ timeout: 5000 }); cv = true; } catch (e) {} await sleep(1800);
    if (process.env.CPM_DEBUG) console.log('    [debug] clic apertura', cv, (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400));
    for (let i = 0; i < 14; i++) {
      const t = await leggi('apertura passo ' + i); passi++;
      if (process.env.CPM_DEBUG) console.log('    [debug] passo', i, (t.match(/Passo \d di \d[^\n]{0,40}/) || [''])[0]);
      if (/numero di maglia|Tieni #/i.test(t)) { maglia = true; if (FOTO && !fs.existsSync(`${FOTO}/maglia-${ROSSO ? 'prima' : 'dopo'}.png`)) await page.screenshot({ path: `${FOTO}/maglia-${ROSSO ? 'prima' : 'dopo'}.png` }); }
      let av = false;
      for (const re of [/^\W*Avanza/i, /Salta il racconto/i, /^\W*Tieni #/i, /^\W*Capito/i, /^\W*(Avanti|Prosegui|Continua)/i]) {
        try { const L = page.getByRole('button', { name: re }); if (await L.count()) { await L.last().click({ timeout: 2000 }); av = true; break; } } catch (e) {} }
      if (!av) av = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0);
        const fine = bs.findIndex(b => /Vai al prossimo momento|Chiudi — riprendi/i.test(b.textContent)); const c = bs.slice(0, fine < 0 ? bs.length : fine).find(b => (b.textContent || '').trim() && !/Chiudi|Parti per/i.test(b.textContent));
        if (!c) return false; c.click(); return true; });
      if (!av && process.env.CPM_DEBUG) console.log('    [debug] bottoni:', (await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim().slice(0, 30)))).join(' | '));
      if (!av) { if (process.env.CPM_DEBUG) console.log('    [debug] nessun avanza:', t.replace(/\s+/g, ' ').slice(0, 300)); break; } await sleep(900);
    }
    ok(maglia, `apertura: passo della maglia visto (${passi} passi letti)`);
    let contratto = null;
    for (const t of ['dashboard', 'carriera', 'profile', 'agente', 'ufficio', 'club']) {
      try { await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); } catch (e) {}
      await sleep(900); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(300);
      await leggi('scheda ' + t);
      const c = await page.evaluate(() => { const el = document.querySelector('[data-cpm="contratto-v2"]'); return el ? el.innerText : null; });
      if (c && contratto == null) { contratto = c; if (FOTO) { const el = await page.$('[data-cpm="contratto-v2"]'); if (el) await el.screenshot({ path: `${FOTO}/contratto-${ROSSO ? 'prima' : 'dopo'}.png` }); } }
    }
    for (const v of visti) console.log('    ✗ ' + v);
    ok(visti.length === 0, `parole tecniche visibili («wizard», «dashboard»): ${visti.length}`);
    ok(contratto != null, `scheda del contratto vista: «${(contratto || '').replace(/\s+/g, ' ').slice(0, 60)}»`);
    ok(contratto != null && !/trascorso/i.test(contratto), 'il contratto non dice «trascorso»');

    console.log('3) catalogo');
    const k = await page.evaluate(() => {
      const tut = JSON.stringify(typeof TUTORIAL_STEPS !== 'undefined' ? TUTORIAL_STEPS : null);
      const loc = JSON.stringify(typeof LOCALE !== 'undefined' ? LOCALE : null);
      const ev = (VITA_EVENTS || []).find(e => e.id === 'vita_aiuto_compagno');
      const u18 = ev ? (!ev.cond || ev.cond({ proStatus: 'u18' })) : null, pro = ev ? (!ev.cond || ev.cond({ proStatus: 'pro', popularity: 50 })) : null;
      const vals = []; const giro = (o) => { if (typeof o === 'string') vals.push(o); else if (o && typeof o === 'object') for (const kk in o) giro(o[kk]); }; try { giro(LOCALE.IT); giro(LOCALE.EN); } catch (e) {}
      const locDash = [];/* solo i testi mostrati che portano parole (un valore d'una parola sola e' un identificativo, es. la scheda «dashboard») */
      for (const kk of ['IT', 'EN']) for (const key of ['backToDashboard', 'cancelStay']) { const v = LOCALE[kk] && LOCALE[kk][key]; if (typeof v === 'string' && /dashboard/i.test(v)) locDash.push(v); }
      return { tutOk: !!tut && tut !== 'null', tutOpz: /Opzioni/.test(tut), tutDash: /dashboard/i.test(tut), locOk: !!loc && loc !== 'null' && vals.length > 20, locDash, ev: !!ev, u18, pro };
    });
    ok(k.tutOk && !k.tutOpz && !k.tutDash, `tutorial: cita «Opzioni» ${k.tutOpz} · «Dashboard» ${k.tutDash}`);
    ok(k.locOk && k.locDash.length === 0, `testi di ritorno senza «dashboard»: ${k.locDash.join(', ') || 'nessuno'}`);
    ok(k.ev && k.u18 === false && k.pro === true, `«Il ragazzo della Primavera…»: a un giocatore della Primavera ${k.u18}, a un professionista ${k.pro}`);

    console.log('4) faccina sul morale che scende');
    const imp = await page.evaluate(() => { for (const im of (WEEKLY_IMPULSES || [])) for (const c of (im.choices || [])) { const ef = c.ef || {}; if ((ef.morale | 0) < 0 && Object.keys(ef).length <= 3) return { id: im.id, txt: c.txt, m: ef.morale }; } return null; });
    if (!imp) ok(false, 'nessun impulso con morale negativo: non giudicato');
    else {
      await page.evaluate(() => { window.__T190 = []; const o = new MutationObserver(() => { const t = document.body.innerText; const m = t.match(/(😄|😟)\s*(Morale\s*)?-\d+/g); if (m) window.__T190.push(...m); }); o.observe(document.body, { childList: true, subtree: true, characterData: true }); });
      const ap = await page.evaluate((id) => window.__CPM_CAREER.apriImpulso(id), imp.id); await sleep(900);
      const cl = await page.evaluate((txt) => { const b = [...document.querySelectorAll('button,[role=button]')].filter(x => (x.textContent || '').includes(txt.slice(0, 18))); const t = b[b.length - 1]; if (!t) return false; t.click(); return true; }, imp.txt);
      for (let i = 0; i < 20; i++) { await sleep(200); const t = await page.evaluate(() => document.body.innerText); const m = t.match(/(😄|😟)\s*(Morale\s*)?-\d+/g); if (m) await page.evaluate((m) => window.__T190.push(...m), m); }
      const T = await page.evaluate(() => window.__T190 || []);
      const conM = T.filter(x => /😄|😟/.test(x));
      if (process.env.CPM_DEBUG) console.log('    [debug] T190', JSON.stringify(T).slice(0, 200), (await page.evaluate(() => (document.body.innerText.match(/.{0,40}(Morale|-\d).{0,40}/g) || []).slice(0, 6))).join(' || '));
      ok(ap === true && cl, `impulso «${imp.id}» aperto (${ap}) e scelta «${imp.txt.slice(0, 30)}» (morale ${imp.m}) cliccata (${cl})`);
      ok(conM.length > 0 && conM.every(x => x.includes('😟')), `accanto al morale negativo: ${[...new Set(conM)].join(' ') || 'nessuna faccina vista (non giudicato)'}`);
    }
    ok(errors.length === 0, `errori di pagina ${errors.length} ${errors.slice(0, 1).join('')}`);
    await page.close();
  }
  console.log('5) consiglio della scena a 375 px');
  {
    const { page, errors } = await nuovaPagina({ width: 375, height: 812 });
    await openMatch(page, port, { name: 'Testi Consiglio' });
    const N = await page.evaluate(() => (typeof SITUATIONS !== 'undefined' ? SITUATIONS.length : 0));
    let viste = 0, tagliate = [], spezzate = [], mancanti = [];
    const conIntro = await page.evaluate(() => SITUATIONS.map((x, i) => x.intro ? i : -1).filter(i => i >= 0));
    const coda = [...conIntro], riprova = new Set();
    while (coda.length) { const gi = coda.shift();
      try { await page.evaluate((g) => window.__CPM_FORCE_SIT(g), gi); } catch (e) { continue; }
      try { await page.waitForFunction(() => !!document.querySelector('[data-cpm="titolo-hl-v2"]'), null, { timeout: 4500 }); } catch (e) {}
      await sleep(300);
      const r = await page.evaluate(() => { const t = document.querySelector('[data-cpm="titolo-hl-v2"]'); if (!t) return null; const s = t.nextElementSibling; if (!s) return { vuoto: true };
        const cs = getComputedStyle(s); const lh = parseFloat(cs.lineHeight) || 16; const pr = document.createElement('div'); pr.style.cssText = `position:absolute;left:-9999px;width:${s.clientWidth}px;font:${cs.font};line-height:${cs.lineHeight};white-space:normal`; pr.textContent = s.textContent; document.body.appendChild(pr); const pieno = pr.scrollHeight; pr.remove();
        return { txt: s.textContent, nasc: s.scrollHeight > s.clientHeight + 1 || pieno > s.clientHeight + 1 && cs.overflow === 'hidden', righe: Math.round(s.clientHeight / lh), fine: /[.!?»]$/.test(s.textContent.trim()) }; });
      if (!r || r.vuoto) { if (!riprova.has(gi)) { riprova.add(gi); coda.push(gi); } else mancanti.push(gi + (r ? ':vuoto' : ':senza titolo')); continue; } viste++;
      if (r.nasc || /…|\.\.\.$/.test(r.txt)) tagliate.push(gi + ': ' + r.txt.slice(0, 70));
      else if (!r.fine) spezzate.push(gi + ': ' + r.txt.slice(-40));
      if (FOTO && r.txt.length > 70 && !fs.existsSync(`${FOTO}/consiglio-${ROSSO ? 'prima' : 'dopo'}.png`)) await page.screenshot({ path: `${FOTO}/consiglio-${ROSSO ? 'prima' : 'dopo'}.png` });
    }
    for (const t of tagliate.slice(0, 4)) console.log('    ✗ tagliato ' + t);
    if (mancanti.length) console.log('    · non letti: ' + mancanti.join(' '));
    ok(conIntro.length >= 40 && viste >= conIntro.length - 7, `sottotitoli del pannello letti: ${viste} su ${conIntro.length} scene con un consiglio (al piu' 7 mancanti: misurato giro 190, sei scene senza pannello di scelta)`);
    ok(tagliate.length === 0, `consigli tagliati: ${tagliate.length}`);
    ok(spezzate.length === 0, `consigli che non finiscono con una frase intera: ${spezzate.length} ${spezzate.slice(0, 2).join(' | ')}`);
    ok(errors.length === 0, `errori di pagina ${errors.length} ${errors.slice(0, 1).join('')}`);
    await page.close();
  }
} catch (e) { ok(false, 'eccezione (non giudicato): ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G190A] ' : ''}testi-190: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
