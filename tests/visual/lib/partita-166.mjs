/* [giro 166 · PO-364 opzione C] Libreria della sonda «partita a soli highlight»: apre una partita di CAMPIONATO della carriera da
   professionista dal prompt vero (apriPartita → bottone), la gioca col pilota automatico seedato e restituisce libro mastro,
   risultato, schermata finale, voce di matchHistory e i tempi REALI per fase. La usano il guardiano solo-highlight-166 e le foto. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './harness.mjs';

export const CLUB166 = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
export function save166(nome) {
  return { phase: 'career', player: { name: nome || 'Collaudo Salienti', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 22, ovr: 72,
    tutorialDone: true, club: CLUB166, coachTrust: 80, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
    position: 'ATT', foot: 'R', matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } };
}

/* Apre la carriera sul salvataggio sintetico e porta alla prima settimana con una giornata di lega. Ritorna {page, ctx, b, srv, W, errs}. */
/* [giro 175] vel = velocita' della partita ('1' · '1.5' · '2') · glb = corpi 3D accesi · reseed = seme del flusso di prova di rng()/pick()
   (in produzione e' Math.random: cambiarlo fra due giri prova che nessun sorteggio senza seme entra nella partita). */
export async function apriCarriera166({ vp = { width: 412, height: 915 }, init = {}, nome, patch = null, mobile = false, vel = '1', glb = false, reseed = null } = {}) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext(mobile ? { viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, init, vel, glb, reseed }) => { window.__CPM_GLB = !!glb; if (reseed != null) window.__CPM_RESEED_PENDING = reseed; for (const k of Object.keys(init)) window[k] = init[k];
    if (!sessionStorage.getItem('g166')) { sessionStorage.setItem('g166', '1'); localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', String(vel)); } }, { s: save166(nome), init, vel, glb, reseed });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  let W = null; const passi = [];
  /* [giro 253 · regola 4 di PROCESSO.md] si legge la gara della settimana quando lo STATO dice settimana w (prima: 220 ms fissi). La
     passeggiata si registra (passi): misurato nel giro 253, in 2 corse su ~10 di salienti-229 la classifica aveva una giornata di lega in
     piu' (noi a 6 punti, +2) — compatibile con una settimana saltata e la giornata recuperata dal gioco (recupero 7.999.103). */
  for (let w = 2; w <= 20 && !W; w++) { await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w);
    let t = null, wk = null;
    for (let i = 0; i < 40; i++) { await sleep(100); const r = await page.evaluate(() => { const C = window.__CPM_CAREER; return { wk: C.snapshot().week, t: C.thisWeekMd() }; }).catch(() => null);
      if (r && r.wk === w) { wk = r.wk; t = r.t; break; } }
    await sleep(300); const r2 = await page.evaluate(() => { const C = window.__CPM_CAREER; return { wk: C.snapshot().week, t: C.thisWeekMd() }; }).catch(() => null);
    if (r2 && r2.wk === w) t = r2.t;
    passi.push({ w, wk, t: t ? (t.matchday + (t.type ? ':' + t.type : '')) : null });
    if (t && !t.type && t.week === w) W = w; }
  if (patch) { await page.evaluate((p) => window.__CPM_CAREER.patch(p), patch); await sleep(300); }
  return { page, ctx, b, srv, W, errs, passi };
}

/* Apre il prompt della partita della settimana e dice quali bottoni ci sono. */
export async function apriPrompt166(page, tipo, stato) {
  await page.evaluate(({ t, st }) => window.__CPM_CAREER.apriPartita(st || 'starter', t || undefined), { t: tipo || null, st: stato || null });
  await sleep(600);
  return page.evaluate(() => { const q = [...document.querySelectorAll('[data-cpm="partita23"] button')]; return { bottoni: q.map(x => (c => (c.querySelectorAll('[data-cpm$="-nota"]').forEach(n => n.remove()), (c.textContent || '').trim()))(x.cloneNode(true))), solo: !!document.querySelector('[data-cpm="solo-166"]'),
    nota: ((document.querySelector('[data-cpm="solo-166-nota"]') || {}).textContent || '').trim() }; });
}

/* Gioca la partita aperta dal prompt. modo: 'intera' = bottone «Gioca la partita» · 'solo' = bottone dei soli highlight.
   Ritorna tempi per fase (ms reali), libro mastro normalizzato, risultato, testo della schermata finale, voce di matchHistory. */
export async function gioca166(page, modo, { seme = 7300, tetto = 420000, foto = null, fermaAlMinuto = 0, pilota = null, forzaSolo = false, rigoriAllaScena = false } = {}) {
  const out = { modo, finita: false, fasi: {}, ev: [], score: null, note: [], velo: false };
  /* [giro 175] il libro mastro si azzera PRIMA di premere il bottone: azzerato dopo il montaggio, la prima voce della partita
     (il turno del calcio d'inizio, minuto 0) cadeva prima o dopo l'azzeramento secondo l'orologio — era la «voce in piu' al minuto 0
     in 2 giri su 6» del rapporto 166 §4.3: una differenza dello STRUMENTO, non del gioco. */
  await page.evaluate(() => { if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); });
  if (forzaSolo) await page.evaluate(() => { window.__CPM_SOLO166 = true; });
  /* [giro 246 · decisione PO 17/11] il tasto dei momenti salienti vive SOLO nella schermata pre-partita (data-cpm="solo-243"): se il prompt
     non lo ha (build col giro 246), si preme «Gioca la partita» e alla pre-partita si sceglie. Perche' i due modi restino confrontabili
     (il tasto apre formazioni e ingresso, che caricano la tattica avversaria), anche la partita intera passa da «Vedi le formazioni». */
  const via243 = await page.evaluate(() => !!document.querySelector('[data-cpm="partita23"]') && !document.querySelector('[data-cpm="solo-166"]')).catch(() => false);
  out.via243 = via243;
  const clic = await page.evaluate((modo) => { const B = [...document.querySelectorAll('[data-cpm="partita23"] button')];
    const b = modo === 'solo' ? document.querySelector('[data-cpm="solo-166"]') : B.find(x => /^Gioca la partita/.test((x.textContent || '').trim()));
    if (!b) return null; b.click(); return (b.textContent || '').trim(); }, (forzaSolo || via243) ? 'intera' : modo);
  /* [giro 229] forzaSolo: la modalita' si accende dal gancio di sonda (__CPM_SOLO166) e si preme «Gioca» — serve a misurare la partita a soli
     salienti dove il bottone ancora non c'e' (misura prima della correzione) e nel braccio rosso */
  out.bottone = clic; if (!clic) { out.note.push('bottone non trovato'); return out; }
  const t0 = Date.now();
  /* fra il prompt e il campo possono esserci finestre (presentazione al club, discorso): si chiudono dalla sonda */
  let montata = false;
  for (let i = 0; i < 60 && !montata; i++) {
    montata = await page.evaluate((v) => typeof window.__CPM_PHASE === 'function' && !!window.__CPM_PHASE() && typeof window.__CPM_AUTOPLAY === 'function' && (v ? /formations|walkout|playing/ : /matchday|formations|walkout|playing/).test(String(window.__CPM_PHASE())), via243).catch(() => false);
    if (montata) break;
    if (via243) {/* [giro 246] alla pre-partita: «Gioca solo i momenti salienti» (solo) o «Vedi le formazioni» (intera) */
      const pp = await page.evaluate((solo) => { if (!(typeof window.__CPM_PHASE === 'function' && window.__CPM_PHASE() === 'matchday' && document.querySelector('[data-cpm="prepartita23"]'))) return 'no';
        const b = solo ? document.querySelector('[data-cpm="solo-243"]') : [...document.querySelectorAll('[data-cpm="prepartita23"] button')].find(x => /^Vedi le formazioni/.test((x.textContent || '').trim()));
        if (!b) return 'manca'; b.click(); return 'ok'; }, modo === 'solo' && !forzaSolo).catch(() => 'no');
      if (pp === 'manca') { out.note.push(modo === 'solo' && !forzaSolo ? 'bottone dei momenti salienti assente nella pre-partita' : 'pre-partita senza «Vedi le formazioni»'); out.bottone = null; return out; }
      if (pp === 'ok') { if (modo === 'solo' && !forzaSolo) out.bottone = 'Gioca solo i momenti salienti'; await sleep(400); continue; }
    }
    await page.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim()) || (!document.querySelector('[data-cpm="partita23"]') && /^Gioca la partita$/.test((x.textContent || '').trim()))/* [giro 229] la convocazione della Nazionale ha il suo «Gioca la partita» */); if (B.length) B[B.length - 1].click(); }).catch(() => {});
    await sleep(500);
  }
  out.tPre = Date.now() - t0;
  if (!montata) { out.note.push('la partita non si e\' montata'); return out; }
  /* [giro 253 · salienti-229 instabile, misurato] il forzamento dei rigori si fa DENTRO la pagina: un osservatore conta le scene e, nello
     STESSO turno in cui legge la fase `hl_intro` della n-esima, chiama __CPM_SO_FORCE. Prima la sonda leggeva la fase da Node (60 ms +
     latenza di una pagina occupata): un'introduzione di ~0,5 s sfuggiva, il forzamento arrivava a scena gia' partita (hl_move), la scena
     proseguiva fino a `playing` e la guardia di unicita' della fine (fine977) impediva il fischio dei 90' — partita appesa per 400 s,
     «non arrivata al fischio» (2 corse su 9 in misura-253b). Ora o si forza in hl_intro (minuto congelato, stesso nei due modi) o non si
     forza affatto, e il controllo lo dichiara (rigoriForzati null → non giudicato). */
  if (rigoriAllaScena) await page.evaluate((n) => { let f0 = null, k = 0; window.__G253F = null;
    const iv = setInterval(() => { try { const f = window.__CPM_PHASE ? window.__CPM_PHASE() : null; if (f !== f0) { if (f === 'hl_intro') k++; f0 = f; }
      if (f === 'hl_intro' && k >= n && !window.__G253F) { const m = window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : null; let ok = null; const F = () => { ok = window.__CPM_SO_FORCE ? window.__CPM_SO_FORCE(90) : null; };
        /* flushSync: il fischio si applica ADESSO (e la pulizia dell'effetto dell'intro annulla il suo timer di 2,5 s); senza, se la pagina era
           occupata, il timer dell'intro gia' scaduto scriveva hl_move DOPO lo shootout e vinceva (misurato: intro di 32 ms, scena proseguita) */
        if (window.ReactDOM && window.ReactDOM.flushSync) window.ReactDOM.flushSync(F); else F();
        window.__G253F = { ok, min: m, scena: k, dopo: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; clearInterval(iv); }
      if (f === 'ended' || f === 'shootout') clearInterval(iv); } catch (e) {} }, 5); }, rigoriAllaScena);
  await page.evaluate(({ s, pilota }) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300, ...(pilota ? { pilota } : {}) }), { s: seme, pilota });
  const tG = Date.now(); let ult = Date.now(), fase = null, minMax = 0, scene = 0, faseP = null; const fotoFatte = {}; let rigoriFatti = false;
  while (Date.now() - tG < tetto) {
    const s = await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (e.length > 200 && window.__CPM_EV_RESET) { window.__CPM_EV_RESET(); } else e.length = 0;
      return { f: window.__CPM_PHASE ? window.__CPM_PHASE() : null, e, v: !!document.querySelector('[data-cpm="solo-166-velo"]'), m: (window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : null) }; }).catch(() => null);
    const ora = Date.now();
    if (s) { if (fase) out.fasi[fase] = (out.fasi[fase] || 0) + (ora - ult); if (s.f !== faseP) { if (s.f === 'hl_intro') scene++; faseP = s.f;
        /* [giro 229] rigoriAllaScena = n: alla n-esima scena la partita si chiude 1-1 dal gancio di collaudo (__CPM_SO_FORCE, lo stesso del
           giro 58/191): un pareggio a eliminazione diretta riproducibile nei due modi, allo stesso minuto della stessa scena */
      }
        if (rigoriAllaScena && !rigoriFatti) { const F = await page.evaluate(() => window.__G253F || null).catch(() => null); if (F) { rigoriFatti = true; out.rigoriForzati = { ok: F.ok, min: F.min }; out.forzamento = F; } }
      if (s.f === 'shootout') out.rigori = true; fase = s.f; if (s.e.length) out.ev.push(...s.e); if (s.v) out.velo = true; if (s.m != null) minMax = Math.max(minMax, s.m);
      if (foto) for (const f of foto) { if (!fotoFatte[f.nome] && f.quando(s)) { fotoFatte[f.nome] = 1; await page.screenshot({ path: f.file }).catch(() => {}); } }
      if (s.f === 'ended') { out.finita = true; break; } if (fermaAlMinuto && minMax >= fermaAlMinuto) { out.note.push('fermata al ' + minMax + '\''); break; } }
    ult = ora; await sleep(60);
  }
  out.ev.push(...await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; }).catch(() => []));
  out.tPartita = Date.now() - tG; out.minMax = minMax; out.scene = scene;
  out.score = await page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; }).catch(() => null);
  out.g166 = await page.evaluate(() => window.__CPM_G166 || null).catch(() => null);
  out.lm = await page.evaluate(() => window.__CPM_LM166 || null).catch(() => null);
  await sleep(1500);
  /* [giro 200 · PO-385] la rassegna e' a quattro schede: il testo della schermata finale e' quello di TUTTE le schede (si sfogliano con
     Avanti e si torna alla prima coi puntini), cosi' il confronto del controllo 11 resta sull'intera rassegna come prima. */
  const parti = [];
  for (let k = 0; k < 4; k++) {
    parti.push(await page.evaluate(() => (document.body.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim()).catch(() => ''));
    const av = await page.evaluate(() => { const b = document.querySelector('[data-cpm="avanti200"]'); if (!b) return false; b.click(); return true; }).catch(() => false);
    if (!av) break; await sleep(350);
  }
  await page.evaluate(() => { const d = document.querySelector('[data-cpm="puntino200"]'); if (d) d.click(); }).catch(() => {}); await sleep(300);
  out.finale = parti.join('\n');
  /* [giro 253] l'ordine in memoria della classifica (per gli spareggi a pari punti: salienti-229 instabile su «N° ora») */
  out.classifica = await page.evaluate(() => { try { return (window.__CPM_CAREER.snapshot().standings || []).map(r => [r.id, r.pts | 0, (r.gf | 0) - (r.ga | 0), r.gf | 0].join(':')); } catch (e) { return null; } }).catch(() => null);
  return out;
}

/* La sequenza del libro mastro senza i campi di strumentazione (come il giro 161: ts/t = orologio da polso, npd = distanza letta
   da matchPlayers, non seedata). */
export function seq166(ev) { return ev.map(e => { const o = {}; for (const k of Object.keys(e).sort()) if (k !== 'ts' && k !== 't' && k !== 'npd') o[k] = e[k]; return o; }); }

/* Dalla schermata finale alla carriera: chiude giornale/intervista e legge la voce di matchHistory. */
export async function chiudi166(page, { tetto = 60000 } = {}) {
  const t0 = Date.now(); const visti = { intervista: false, testi: [] };
  while (Date.now() - t0 < tetto) {
    const s = await page.evaluate(() => { const t = document.body.innerText || ''; const iv = !!document.querySelector('[data-cpm="intervista231"]');
      const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {}; const live = typeof window.__CPM_PHASE === 'function' && !!document.querySelector('[data-cpm="fine-partita"],[data-cpm="ended"]');
      return { iv, iv231: window.__CPM_IV231 | 0, iv183: window.__CPM_IV183 || null, n: (p.matchHistory || []).length, h: (p.matchHistory || []).slice(-1)[0] || null, live, bott: [...document.querySelectorAll('button')].map(x => (x.textContent || '').trim()).filter(Boolean).slice(-12) }; }).catch(() => null);
    if (s) { if (s.iv) visti.intervista = true; visti.iv231 = s.iv231; visti.iv183 = s.iv183; if (s.n > 0) { visti.voce = s.h; break; } visti.ultimiBottoni = s.bott; }
    await page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const pri = B.filter(x => /Continua|Avanti|Torna|Prosegui|Vai|Chiudi|Fine|Rispondi|Salta/i.test((x.textContent || ''))); const b = pri[pri.length - 1]; if (b) b.click(); }).catch(() => {});
    await sleep(700);
  }
  return visti;
}
export { sleep };
