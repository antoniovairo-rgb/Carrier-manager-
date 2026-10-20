#!/usr/bin/env node
/* [giro 73] SONDA/GUARDIANO DELLE TRE NOTE DEL TACCUINO PO (7.999.173, S.13 W.25), GLB ACCESO (direttiva PO 29/07).
   Le scene si costruiscono coi generatori VERI del motore (scenaDalMotoreDifesa / scenaDalMotoreCross, src/04) con semi fissi, si
   aggiungono in coda a SITUATIONS e si forzano col gancio del gate; l'esito e' forzato a successo/fallimento.
   · PO-282 «tappeto che rotola»: difesa «Anticipa sul primo controllo» → recovery. Campiona __CPM_EROE73 (inclinazione del bacino
     rispetto alla verticale, quota del bacino, clip montata) dalla risoluzione alla fine della finestra d'esito.
   · PO-283: angolo «Stacco in corsa potente» → miss. Registra la variante dedotta (deriveHL) e la clip montata sull'eroe.
   · PO-284: apertura dell'angolo: pallone, battitore (compagno piu' vicino) ed eroe al primo fotogramma utile (__CPM_STATE).
   · 284f (default): la stessa apertura, DETERMINISTICA — il gancio test-only __CPM_MP_PLACE073 fa trovare allo staging un compagno logico
     gia' sulla bandierina (la condizione del flusso vero); 284v la misura su partite in autoplay (lenta, gli angoli escono di rado).
   Uso: node corpi-073.mjs [282,283,284f|284|284v] — CPM_ROSSO073=1 accende gli interruttori rossi (__CPM_NO_TAPPETO073 /
   __CPM_NO_STACCO073 / __CPM_NO_BATT073) SEMI=3,11,29. [giro 79] 284f: almeno 2 aperture misurate per seme
   (CPM_APERTURE073, riprova fino a CPM_TENTATIVI073=5) e misura (non verdetto) del primo scatto del pallone. Uscita 0 verde (o rosso visibile) · 1 rosso · 2 cieco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const QUALI = (process.argv[2] || '282,283,284f').split(',');
const ROSSO = process.env.CPM_ROSSO073 === '1';
const SEMI = (process.env.SEMI || '3,11,29').split(',').map(Number);
const srv = await startServer(); const b = await launchBrowser(); const R = { rosso: ROSSO };

async function pagina(extra) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  if (extra) await page.addInitScript(extra);
  await page.addInitScript((r) => { window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) { window.__CPM_NO_TAPPETO073 = 1; window.__CPM_NO_STACCO073 = 1; window.__CPM_NO_BATT073 = 1; } }, ROSSO);
  await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Corpi073' });
  await page.waitForFunction(() => typeof window.__CPM_CORPI232 === 'function' && (window.__CPM_CORPI232() || {}).pronti, null, { timeout: 120000 }).catch(() => {});
  await sleep(2500); return { ctx, page };
}
async function scena(page, tipo, rx, seme) {
  return page.evaluate(([tipo, rx, seme]) => {
    const cast = { portatore: { nome: 'Joe MARSHALL' }, difensore: { nome: 'Max BAILEY' }, crossatore: { nome: 'Tom HAMMOND' }, portiere: { nome: 'Ian CARR' } };
    for (let s = seme; s < seme + 400; s++) {
      const o = tipo === 'difesa' ? { tipo: 'difesa', zona: 'centro', x: 42, y: 50, press: 1, cast } : tipo === 'linee' ? { tipo: 'fra-le-linee', zona: 'trequarti', x: 70, y: 50, press: 0.8, liberi: 2, cast } : { tipo: 'angolo', zona: 'area', x: 90, y: 52, press: 1, liberi: 0, cast, origine: { kind: 'angolo', chi: cast.crossatore } };
      const sc = tipo === 'difesa' ? scenaDalMotoreDifesa(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0) : tipo === 'linee' ? scenaDalMotoreLinee(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0) : scenaDalMotoreCross(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0);
      if (!sc) continue; const k = sc.actions.findIndex(a => new RegExp(rx).test(a.label || a.l || '')); if (k < 0) continue;
      SITUATIONS.push(sc); const gi = SITUATIONS.length - 1; let hl = null; try { hl = deriveHL(sc, sc.actions[k]); } catch (e) {}
      return { gi, k, seme: s, testo: sc.text, label: sc.actions[k].label, hl: hl ? { type: hl.type, variant: hl.variant } : null, ballAt: sc.ballAt || null };
    } return null; }, [tipo, rx, seme]);
}
const camp = (page) => page.evaluate(() => { const e = window.__CPM_EROE73 && window.__CPM_EROE73(); const ph = window.__CPM_PHASE && window.__CPM_PHASE(); return { e, ph }; });

if (QUALI.includes('282')) {
  const tot = { esecuzioni: [], tiltMax: [], tiltQ: [] };
  /* le due scene del taccuino: 9' difesa «Anticipa sul primo controllo» (recupero) e 30' «Fra le linee / Tiro da fuori» (gol) */
  const CASI = SEMI.map(sd => ['difesa', 'Anticipa sul primo controllo', sd]).concat([['linee', 'Tiro da fuori', SEMI[0]]]);
  for (const [tipo, rx, sd] of CASI) {
    const { ctx, page } = await pagina(); const S = await scena(page, tipo, rx, sd);
    if (!S) { console.log('282: scena non costruita (' + tipo + ')'); await ctx.close(); continue; }
    await page.evaluate(([gi]) => window.__CPM_FORCE_SIT(gi, true), [S.gi]); await sleep(2200);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
    await page.evaluate((k) => window.__CPM_RESOLVE(k), S.k);
    const fr = []; const t0 = Date.now(); while (Date.now() - t0 < 14000) { const c = await camp(page); fr.push(c); if (c.ph && !/^hl_/.test(c.ph) && fr.length > 20) break; await sleep(60); }
    const ins = fr.filter(f => f.e && f.e.tilt != null && f.ph === 'hl_result');
    const tmax = Math.max(0, ...ins.map(f => f.e.tilt)); const q = ins.length ? ins.filter(f => f.e.tilt > 45).length / ins.length : null;
    const clips = [...new Set(ins.map(f => f.e.cn || f.e.g).filter(Boolean))];
    console.log(`282 seme ${S.seme} «${S.label}» hl=${JSON.stringify(S.hl)} fotogrammi esito ${ins.length} · inclinazione max ${tmax.toFixed(0)}° · quota >45° ${q == null ? '-' : (q * 100).toFixed(0) + '%'} · clip ${clips.join(',')}`);
    if (process.env.VERB) console.log(ins.filter((f,i)=>i%4==0).map(f => `${f.e.tilt}/${f.e.hy} rx${f.e.rx} rz${f.e.rz} [${(f.e.act||[]).join(";")}]`).join("\n"));
    tot.esecuzioni.push({ seme: S.seme, n: ins.length, tmax, q, clips }); tot.tiltMax.push(tmax); if (q != null) tot.tiltQ.push(q);
    await ctx.close();
  }
  R['282'] = tot;
}
if (QUALI.includes('283')) {
  const tot = [];
  for (const sd of SEMI) {
    const { ctx, page } = await pagina(); const S = await scena(page, 'angolo', 'Stacco in corsa', sd);
    if (!S) { console.log('283: scena non costruita (opzione assente nel registro)'); await ctx.close(); continue; }
    await page.evaluate(([gi]) => window.__CPM_FORCE_SIT(gi, true), [S.gi]); await sleep(2200);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; });
    await page.evaluate((k) => window.__CPM_RESOLVE(k), S.k);
    /* piede piu' basso (punta, ball_l/ball_r) mentre il disappunto pesa: in piedi sta a ~0; MISURATO prima 0,54-0,58 (corpo sospeso) */
    const cl = new Set(); const t0 = Date.now(); let hlv = null, piede = 0, nDis = 0, ult = null, tMax = 0; while (Date.now() - t0 < 120000) { const c = await page.evaluate(() => { const e = window.__CPM_EROE73 && window.__CPM_EROE73(); let g = null; try { g = window.__CPM_GESTURE(); } catch (x) {} return { e, v: g && g.hlVariant, t: g && g.hlType, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; });
      if (c.e && c.e.gw > 0.3 && (c.e.cn || c.e.g)) cl.add(c.e.cn || c.e.g); if (c.v) hlv = c.t + '/' + c.v;
      const dis = c.e && (c.e.act || []).find(a => /^mx-disappunto:/.test(a)); if (dis && +dis.split(':')[1].split('@')[0] > 0.5 && c.e.fl != null) { nDis++; piede = Math.max(piede, Math.min(c.e.fl, c.e.fr)); tMax = Math.max(tMax, +dis.split('@')[1]); }
      ult = c.e && c.e.act; if (c.ph && !/^hl_/.test(c.ph)) break; if (nDis > 3 && (!dis || tMax >= 1.3)) break; await sleep(40); } if (!nDis) console.log("283 ultimo stato " + JSON.stringify(ult));
    console.log(`283 seme ${S.seme} «${S.label}» deriveHL=${JSON.stringify(S.hl)} 3D=${hlv} clip montate ${[...cl].join(',') || '-'} · disappunto ${nDis} fotogrammi fino a t=${tMax.toFixed(2)} s · piede piu' basso max ${piede.toFixed(2)} m`);
    tot.push({ seme: S.seme, hl: S.hl, hlv, clips: [...cl], nDis, piede, tMax }); await ctx.close();
  }
  R['283'] = tot;
}
if (QUALI.includes('284')) {
  /* stesso metro del taccuino (src/10 ~r.750): finestra 0,75-2,4 s dall'apertura, distanza in unita' di MONDO (y x 0,68) dal pallone al
     compagno di movimento piu' vicino (eroe escluso) e all'eroe. 001 = entrambi > 3,5 u in almeno 3/4 dei campioni. */
  const tot = [];
  for (const sd of SEMI) {
    const { ctx, page } = await pagina(); const S = await scena(page, 'angolo', '.', sd);
    if (!S) { console.log('284: scena non costruita'); await ctx.close(); continue; }
    const t0 = Date.now(); await page.evaluate(([gi]) => window.__CPM_FORCE_SIT(gi, false), [S.gi]);
    const fr = []; while (Date.now() - t0 < 2600) { const s = await page.evaluate(() => { try { const st = window.__CPM_STATE(); return { ball: st.ball, hero: st.hero, pl: (st.players || []).filter(p => p.team === 'home' && !p.gk).map(p => ({ x: p.x, y: p.y })) }; } catch (e) { return null; } }); if (s) fr.push({ t: Date.now() - t0, ...s }); await sleep(60); }
    const W = fr.filter(f => f.t >= 750 && f.t <= 2400); const dw = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.68);
    let n001 = 0, mdMax = 0, mdMin = 1e9, dhMin = 1e9; for (const f of W) { const md = Math.min(...f.pl.filter(p => dw(p, f.hero) > 0.3).map(p => dw(p, f.ball))); const dh = dw(f.hero, f.ball);
      if (md > 3.5 && dh > 3.5) n001++; mdMax = Math.max(mdMax, md); mdMin = Math.min(mdMin, md); dhMin = Math.min(dhMin, dh); }
    const last = W[W.length - 1] || fr[fr.length - 1];
    console.log(`284 seme ${S.seme} campioni ${W.length} · 001 in ${n001}/${W.length} · compagno piu' vicino ${mdMin.toFixed(1)}-${mdMax.toFixed(1)} u · eroe >= ${dhMin.toFixed(1)} u · pallone ${last.ball.x.toFixed(1)},${last.ball.y.toFixed(1)}`);
    tot.push({ seme: S.seme, n: W.length, n001, mdMin, mdMax, dhMin, codice001: W.length >= 4 && n001 >= W.length * 0.75 }); await ctx.close();
  }
  R['284'] = tot;
}
if (QUALI.includes('284f')) {
  /* PO-284 DETERMINISTICO: la condizione del flusso vero (il crossatore del motore gia' entro 3 u dalla bandierina nel LOGICO, la sua
     mesh altrove) ricreata col gancio test-only __CPM_MP_PLACE073 subito prima di forzare la scena d'angolo. */
  const tot = [];
  /* [giro 79, collaudo 7.999.175-3d riga 1] GUARDIANO NON CIECO: ogni seme deve dare almeno APERTURE (2) aperture MISURATE (>= 4 campioni
     nella finestra 0,75-2,4 s); un'apertura senza campioni (macchina carica: seme 29 a 0 campioni in due corse) si rifa' su una pagina
     nuova, fino a TENTATIVI (5). Le soglie non cambiano: una sola apertura col codice 001 e' rosso. */
  const APERTURE = +(process.env.CPM_APERTURE073 || 2), TENTATIVI = +(process.env.CPM_TENTATIVI073 || 5);
  for (const sd of SEMI) { let misurate = 0;
   for (let prova = 0; prova < TENTATIVI && misurate < APERTURE; prova++) {
    /* __CPM_NO554: sull'angolo vero (origine del motore, _ORIG26) la battuta d'apertura e' soppressa (_o98, src/15): la scena forzata non
       ha l'origine, quindi la si spegne qui, altrimenti il pallone in volo dopo ~620 ms entra nella misura come «di nessuno». */
    const { ctx, page } = await pagina(() => { window.__CPM_NO554 = 1; window.__CPM_WS38_REC = 1; }); const S = await scena(page, 'angolo', '.', sd);
    if (!S) { console.log('284f: scena non costruita'); await ctx.close(); break; }
    const t0 = Date.now(); const n0 = await page.evaluate(([gi]) => { const n0 = (window.__CPM_SNAP42 || []).length; const mp = window.__CPM_MP(); let k = -1; mp.forEach((q, i) => { if (k < 0 && i > 0 && q && q.t === 'home' && i !== 0 && !q.gk && q.x < 70) k = i; }); window.__CPM_MP_PLACE073(k, 96.4, 95.8); window.__CPM_FORCE_SIT(gi, false); return n0; }, [S.gi]);
    const fr = []; while (Date.now() - t0 < 2600) { const s = await page.evaluate(() => { try { const st = window.__CPM_STATE(); return { ball: st.ball, hero: st.hero, pl: (st.players || []).filter(p => p.team === 'home' && !p.gk).map(p => ({ x: p.x, y: p.y })) }; } catch (e) { return null; } }); if (s) fr.push({ t: Date.now() - t0, ...s }); await sleep(60); }
    const sp = await page.evaluate(() => window.__CPM_SPOT073 && window.__CPM_SPOT073());
    /* [giro 79] PRIMO SCATTO DEL PALLONE: dove lo mette lo stacco di scena (registro __CPM_SNAP42, mondo → logico) rispetto al punto della scena */
    const sn = await page.evaluate((n0) => { const a = (window.__CPM_SNAP42 || []).slice(n0); let bt = null; try { bt = window.__CPM_STATE().ballTarget; } catch (e) {} return { a, bt }; }, n0);
    const p1 = sn.a.length ? { x: sn.a[0][1] + 50, y: sn.a[0][2] / 0.68 + 50 } : null; const dSnap = (p1 && sn.bt && sn.bt.x != null) ? Math.hypot(p1.x - sn.bt.x, p1.y - sn.bt.y) : null;
    if (process.env.VERB) console.log('  snap ' + JSON.stringify(await page.evaluate(() => ({ snap: (window.__CPM_SNAP42 || []).slice(-4), rsnp: (window.__CPM_RSNP401 || []).slice(-4), bt: (() => { try { return window.__CPM_STATE().ballTarget; } catch (e) { return null; } })() }))));/* [giro 79] dove lo scatto di scena mette il pallone e i ri-tagli */
    const W = fr.filter(f => f.t >= 750 && f.t <= 2400); const dw = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.68);
    let n001 = 0, mdMin = 1e9; for (const f of W) { const md = Math.min(...f.pl.filter(p => dw(p, f.hero) > 0.3).map(p => dw(p, f.ball))); const dh = dw(f.hero, f.ball); if (md > 3.5 && dh > 3.5) n001++; mdMin = Math.min(mdMin, md); }
    if (process.env.VERB) console.log(W.map(f => { const md = Math.min(...f.pl.filter(p => dw(p, f.hero) > 0.3).map(p => dw(p, f.ball))); return f.t + ':' + f.ball.x.toFixed(0) + ',' + f.ball.y.toFixed(0) + '/' + md.toFixed(1); }).join(' '));
    console.log(`284f seme ${S.seme} campioni ${W.length} · 001 in ${n001}/${W.length} · compagno piu' vicino >= ${mdMin.toFixed(1)} u · battitore ${JSON.stringify(sp && sp.spot && sp.spot.taker)} · primo scatto del pallone a ${dSnap == null ? '-' : dSnap.toFixed(1)} u dal punto`);
    tot.push({ seme: S.seme, sd, prova, n: W.length, n001, dSnap, mdMin, taker: sp && sp.spot ? sp.spot.taker : null, codice001: W.length >= 4 && n001 >= W.length * 0.75 }); await ctx.close();
    if (W.length >= 4) misurate++; else console.log(`284f seme ${S.seme}: apertura non misurata (${W.length} campioni) — riprovo la scena`);
   }
  }
  R['284f'] = tot;
}
if (QUALI.includes('284v')) {
  /* PO-284 sul FLUSSO VERO: partite in autoplay (semi di bandierina-60), angoli dichiarati dal motore (_ORIG26). Stesso metro del
     taccuino a ogni apertura di scena d'angolo. */
  const tot = [];
  for (const [nome, seed] of (process.env.PARTITE ? JSON.parse(process.env.PARTITE) : [['Orig A', 7101], ['Orig B', 7202], ['Orig C', 7303]])) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (r) window.__CPM_NO_BATT073 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, ROSSO);
    await openMatch(page, srv.address().port, { skipLoadAll: true, name: nome });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
    const t0 = Date.now(); let prev = null, sc = null;
    while (Date.now() - t0 < 240000) {
      const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); let st = null, cs = null; try { cs = window.__CPM_CURSIT && window.__CPM_CURSIT(); } catch (e) {}
        if (/^hl_/.test(ph || '')) { try { const s = window.__CPM_STATE(); st = { ball: s.ball, hero: s.hero, pl: (s.players || []).filter(p => p.team === 'home' && !p.gk).map(p => ({ x: p.x, y: p.y })) }; } catch (e) {} }
        return { ph, st, t: cs && cs.t }; });
      const now = Date.now();
      if (r.ph === 'hl_intro' && prev !== 'hl_intro' && !(sc && now - sc.t0 < 3000)) sc = { t0: now, testo: r.t, fr: [] };
      if (sc && r.st && now - sc.t0 <= 2400) sc.fr.push({ t: now - sc.t0, ...r.st });
      if (sc && !sc.spot && now - sc.t0 > 1200) sc.spot = await page.evaluate(() => ({ s: window.__CPM_SPOT073 && window.__CPM_SPOT073(), mp: (window.__CPM_MP() || []).map((q, i) => q && q.t === "home" ? [i, q.x, q.y] : null).filter(Boolean) }));
      if (sc && now - sc.t0 > 2400) { if (/angolo/i.test(sc.testo || '')) { const W = sc.fr.filter(f => f.t >= 750); const dw = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.68);
          let n = 0, mdMin = 1e9, dhMin = 1e9; for (const f of W) { const md = Math.min(...f.pl.filter(p => dw(p, f.hero) > 0.3).map(p => dw(p, f.ball))); const dh = dw(f.hero, f.ball); if (md > 3.5 && dh > 3.5) n++; mdMin = Math.min(mdMin, md); dhMin = Math.min(dhMin, dh); }
          const b0 = W[0] && W[0].ball; if (process.env.VERB) console.log(JSON.stringify(sc.spot), JSON.stringify((W[2]||{}).pl)); console.log(`284v ${nome} «${sc.testo}» campioni ${W.length} · 001 in ${n} · compagno piu' vicino >= ${mdMin.toFixed(1)} u · eroe >= ${dhMin.toFixed(1)} u · pallone ${b0 ? b0.x.toFixed(1) + ',' + b0.y.toFixed(1) : '-'}`);
          const tk = sc.spot && sc.spot.s && sc.spot.s.spot ? sc.spot.s.spot.taker : null; console.log(`284v   battitore dichiarato ${tk}`);
          tot.push({ nome, testo: sc.testo, n: W.length, n001: n, mdMin, dhMin, taker: tk, codice001: W.length >= 4 && n >= W.length * 0.75 }); }
        sc = null; }
      prev = r.ph; if (r.ph === 'ended' || r.ph === 'ceremony') break; await sleep(60);
    }
    await ctx.close();
  }
  R['284v'] = tot;
}
await b.close(); srv.close();
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/corpi-073' + (ROSSO ? '-rosso' : '') + '.json', import.meta.url), JSON.stringify(R, null, 1));
/* VERDETTI. Soglie dichiarate prima: 282 corpo sdraiato = asse bacino-testa oltre 45 gradi (in piedi 2-15, gesti 10-25) · 283 corpo sospeso
   = punta del piede piu' bassa oltre 0,25 m durante il disappunto (in piedi ~0; un'accovacciata stacca il tallone, non la punta) ·
   284 = codice 001 col metro del taccuino, oppure nessun battitore dichiarato dallo staging. Uscita 2 = cieco. */
const G = [], CIECO = [];
if (R['282']) { const m = Math.max(0, ...R['282'].tiltMax); if (!R['282'].esecuzioni.length || R['282'].esecuzioni.some(e => !e.n)) CIECO.push('282 senza fotogrammi d\'esito');
  else if (!ROSSO && m > 45) G.push(`282 corpo sdraiato: inclinazione ${m.toFixed(0)}°`); else if (ROSSO && m < 70) G.push(`282 rosso non visibile: inclinazione max ${m.toFixed(0)}°`); }
if (R['283']) { const T = R['283']; const m = Math.max(0, ...T.map(t => t.piede)); if (!T.length || T.some(t => !t.nDis || t.tMax < 1.0)) CIECO.push('283 disappunto mai montato o visto solo fino a ' + Math.min(...T.map(t => t.tMax || 0)).toFixed(2) + ' s (il picco sta a ~1,0-1,1 s)');
  else if (T.some(t => !t.hl || t.hl.type !== 'header' || !t.clips.includes('header'))) G.push('283 la manovra non e\' un colpo di testa con la clip header');
  else if (!ROSSO && m > 0.25) G.push(`283 corpo sospeso nel disappunto: piede a ${m.toFixed(2)} m`); else if (ROSSO && m < 0.40) G.push(`283 rosso non visibile: piede a ${m.toFixed(2)} m`); }
if (R['284f']) { const T0 = R['284f'], T = T0.filter(t => t.n >= 4); const pochi = SEMI.filter(sd => T.filter(t => t.sd === sd).length < +(process.env.CPM_APERTURE073 || 2));
  if (!T0.length || pochi.length) CIECO.push('284f meno di ' + (process.env.CPM_APERTURE073 || 2) + ' aperture misurate per i semi ' + (pochi.join(',') || SEMI.join(',')));/* [giro 79] per seme, non nel totale */
  else { const sen = T.filter(t => t.taker == null).length, c001 = T.filter(t => t.codice001).length;
    if (!ROSSO && (sen || c001)) G.push(`284 apertura d'angolo: battitore assente in ${sen}/${T.length}, codice 001 in ${c001}/${T.length}`);
    /* [giro 79] PRIMO SCATTO DEL PALLONE: solo misura, NON verdetto. In ~1 apertura su 8 lo scatto di scena mette il pallone sul punto di gioco
       (66; 50,5) invece che sul punto della scena (corsa fra il battito «playing» e il commit della forzatura; RAPPORTO-giro79, punto aperto):
       come verdetto renderebbe il guardiano rosso a intermittenza. Si stampa per tenerlo d'occhio. */
    const lont = T.filter(t => t.dSnap != null && t.dSnap > 1.5).length; console.log(`284f primo scatto del pallone lontano dal punto (> 1,5 u) in ${lont}/${T.length} aperture (misura, non verdetto)`);
    if (ROSSO && !(sen >= 1 && c001 >= 1)) G.push(`284 rosso non visibile: battitore assente in ${sen}/${T.length}, codice 001 in ${c001}/${T.length}`); } }
if (R['284v']) { const T = R['284v']; if (!T.length) CIECO.push('284v nessun angolo nelle partite');
  else { const bad = T.filter(t => t.codice001 || t.taker == null); if (!ROSSO && bad.length) G.push(`284 apertura d'angolo senza battitore in ${bad.length}/${T.length}`); else if (ROSSO && !bad.length) console.log(`⚠️ 284 rosso non riprodotto in ${T.length} angoli (la corsa dipende dal tempo: dichiarato)`); } }
if (G.length) { console.log('❌ corpi-073' + (ROSSO ? ' (rosso)' : '')); G.forEach(x => console.log('  · ' + x)); process.exit(1); }
if (CIECO.length) { console.log('⚠️ corpi-073 cieco: ' + CIECO.join(' · ')); process.exit(2); }
console.log('✅ corpi-073 ' + (ROSSO ? 'rosso visibile' : 'verde') + ' (' + QUALI.join(',') + ')');
