/* [giro 177 PO-367] MISURA DEL CONTATTO PIEDE-PALLONE NEI GESTI CHE CALCIANO — usata dal guardiano gesto-177 e dal banco prima/dopo.
   Lavora sui fotogrammi del banco 170b (lib/gesti-170b.mjs: tempo virtuale, un fotogramma = 1/60 s di scena, ossa lette a ogni
   fotogramma). Nessun browser qui dentro: solo conti. Le definizioni stanno PRIMA dei numeri:

   SCALA        1 u-mondo = 1,80 m / (quota testa − quota punta piu' bassa, mediana a corpo eretto). Stessa convenzione del 170b.
   PARTENZA     fotogramma in cui il gioco arma il primo arco dell'esito (__CPM_CONT121 passa da 0 a 1): da li' il pallone si muove.
   PIEDE        quello dichiarato dalla clip (tabella PIEDE qui sotto, copia di CONTATTO_CLIP del gioco); se la clip non e' in tabella,
                il piede con il picco di velocita' piu' alto.
   dtPicco      fotogramma del PICCO di velocita' della punta che calcia (rispetto al bacino, come il 170b) in ±0,5 s, meno la
                partenza. In fotogrammi (1 = 16,7 ms). Negativo = il piede ha gia' colpito quando il pallone parte.
   dtVicino     fotogramma della distanza MINIMA punta-centro pallone in ±0,5 s, meno la partenza.
   dContatto    distanza fra la punta che calcia NEL FOTOGRAMMA DI PARTENZA e il punto di battuta (centro del pallone nel fotogramma
                prima, quando e' ancora fermo), in cm. Il pallone del gioco ha raggio 0,20 u (≈ 22 cm). A 16 m/s il piede fa 27 cm
                per fotogramma: sotto i 15 cm vuol dire che il piede e' sul pallone nel fotogramma in cui parte.
   dMin         la stessa distanza, minima in ±0,10 s dalla partenza (definizione del 170b §6).
   APPOGGIO     l'altro piede, da 6 fotogrammi prima a 3 dopo la partenza: quota della punta sul prato (cm, mediana) e scorrimento
                in pianta (cm per fotogramma, mediana).
   CAVIGLIA     (solo se la registrazione comprende l'attesa) quota della caviglia del piede d'appoggio attorno alla partenza (±3
                fotogrammi, mediana) meno la sua quota in attesa, a corpo fermo (cm): quanto il piede d'appoggio e' staccato da terra.
   PALLONE      spostamento del pallone nei 30 fotogrammi prima della partenza (cm): deve restare sul dischetto.
   SCATTO       massimo giro del busto (linea delle spalle) fra due fotogrammi consecutivi, e massimo salto del bacino in pianta fra
                due fotogrammi (cm), da 45 fotogrammi prima a 20 dopo la partenza (rincorsa, calcio, accompagnamento). Il giro massimo
                DOPO (da 20 fotogrammi dopo la partenza a fine registrazione: rilascio del gesto, esultanza) e' riportato a parte. */
const N = ['pel', 'chest', 'head', 'shL', 'shR', 'elL', 'elR', 'haL', 'haR', 'hiL', 'hiR', 'knL', 'knR', 'anL', 'anR', 'toL', 'toR'];
const J = (h, n) => { const i = N.indexOf(n) * 3; return h && h[i] != null ? [h[i], h[i + 1], h[i + 2]] : null; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const med = a => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const pc = (a, q) => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : null; };
const r1 = x => x == null ? null : +x.toFixed(1);
export const PIEDE = { 'penalty': 'R', 'penalty~m': 'L', 'kick': 'L', 'kick~m': 'R', 'pass': 'L', 'pass~m': 'R', 'mx-strike-foward-jog': 'R', 'mx-strike-foward-jog~m': 'L', 'mx-kick-soccerball': 'L', 'mx-kick-soccerball-2': 'R' };

export function misura177(R) {
  const F = (R.fr || []).filter(x => x.h && x.b); if (F.length < 30) return { errore: 'pochi fotogrammi (' + F.length + ')' };
  const alt = med(F.map(x => { const hd = J(x.h, 'head'), l = J(x.h, 'toL'), r = J(x.h, 'toR'); return hd && l && r ? hd[1] - Math.min(l[1], r[1]) : null; }).filter(a => a > 1.2));
  const m = alt ? 1.8 / alt : 1; const suolo = pc(F.flatMap(x => [J(x.h, 'toL')[1], J(x.h, 'toR')[1]]), 0.03);
  let d = -1; for (let i = 1; i < F.length; i++) if (F[i].na > 0 && F[i - 1].na === 0) { d = i; break; }
  if (d < 0) return { errore: 'il pallone non parte (nessun arco)' };
  if (d < 6 || d > F.length - 8) return { errore: 'partenza al bordo della registrazione (' + d + '/' + F.length + ')' };
  const clip = F[d].g ? F[d].g[3] : null, gesto = F[d].g ? F[d].g[0] : null, peso = F[d].g ? F[d].g[1] : 0;
  const vRel = (i, n) => { const p = J(F[i].h, n), q = J(F[i - 1].h, n), a = J(F[i].h, 'pel'), b = J(F[i - 1].h, 'pel'); return Math.hypot(p[0] - a[0] - q[0] + b[0], p[1] - a[1] - q[1] + b[1], p[2] - a[2] - q[2] + b[2]) * m * 60; };
  const lo = Math.max(1, d - 30), hi = Math.min(F.length - 1, d + 30);
  const picco = n => { let v = 0, k = d; for (let i = lo; i <= hi; i++) { const s = vRel(i, n); if (s > v) { v = s; k = i; } } return [v, k]; };
  let piede = PIEDE[clip] || null; if (!piede) piede = picco('toL')[0] >= picco('toR')[0] ? 'L' : 'R';
  const K = 'to' + piede, S = 'to' + (piede === 'L' ? 'R' : 'L');
  const [vPk, iPk] = picco(K);
  let dMin = 1e9, iMin = d; for (let i = lo; i <= hi; i++) { const dd = dist(J(F[i].h, K), F[i].b); if (dd < dMin) { dMin = dd; iMin = i; } }
  const punto = F[d - 1].b; const dCont = dist(J(F[d].h, K), punto);
  let dMin170 = 1e9; for (let i = Math.max(0, d - 6); i <= Math.min(F.length - 1, d + 6); i++) dMin170 = Math.min(dMin170, dist(J(F[i].h, K), F[i].b));
  const kd = J(F[d].h, K), bd = F[d].b;
  const sc = [], hq = []; for (let i = Math.max(1, d - 6); i <= Math.min(F.length - 1, d + 3); i++) { const p = J(F[i].h, S), q = J(F[i - 1].h, S); sc.push(Math.hypot(p[0] - q[0], p[2] - q[2]) * m * 100); hq.push((p[1] - suolo) * m * 100); }
  let cavSu = null; if (R.pre) { const A = 'an' + (piede === 'L' ? 'R' : 'L'); const base = med(F.filter(x => x.f <= R.pre && x.ph === 'hl_choose').map(x => J(x.h, A)[1])); const ora = med(F.slice(Math.max(0, d - 3), d + 4).map(x => J(x.h, A)[1])); if (base != null && ora != null) cavSu = (ora - base) * m * 100; }
  const b0 = F[Math.max(0, d - 30)].b, b1 = F[d - 1].b; const fermo = dist(b0, b1) * m * 100;
  const b3 = F[Math.min(F.length - 1, d + 3)].b; const vPalla = dist(bd, b3) * m * 60 / 3;
  let giro = 0, salto = 0, giroRil = 0; const fwd = k => { const L = J(F[k].h, 'shL'), R2 = J(F[k].h, 'shR'); return Math.atan2(-(R2[0] - L[0]), R2[2] - L[2]); };
  for (let i = Math.max(1, d - 45); i < F.length; i++) { if (F[i].f - F[i - 1].f !== 1) continue; let dy = Math.abs(fwd(i) - fwd(i - 1)) * 180 / Math.PI; if (dy > 180) dy = 360 - dy; if (i > d + 20) { giroRil = Math.max(giroRil, dy); continue; } giro = Math.max(giro, dy);
    const p = J(F[i].h, 'pel'), q = J(F[i - 1].h, 'pel'); salto = Math.max(salto, Math.hypot(p[0] - q[0], p[2] - q[2]) * m * 100); }
  return { n: F.length, scala: +m.toFixed(3), partenza: d, tScena: F[d].ck, gesto, clip, pesoGesto: peso, piede: piede === 'R' ? 'dx' : 'sx',
    dtPiccoF: iPk - d, dtPiccoMs: Math.round((iPk - d) * 1000 / 60), dtVicinoF: iMin - d, vPiedeMs: r1(vPk), vPallaMs: r1(vPalla),
    dContattoCm: r1(dCont * m * 100), dMinCm: r1(dMin170 * m * 100), dMinAssolutoCm: r1(dMin * m * 100),
    puntaQuotaCm: r1((kd[1] - suolo) * m * 100), pallaQuotaCm: r1((bd[1] - suolo) * m * 100), dPiantaCm: r1(Math.hypot(kd[0] - bd[0], kd[2] - bd[2]) * m * 100),
    appoggioQuotaCm: r1(med(hq)), appoggioScorreCmF: r1(med(sc)), appoggioScorreMaxCmF: r1(Math.max(...sc, 0)), appoggioCavigliaSuCm: r1(cavSu), palloneFermoCm: r1(fermo), giroMaxGradiF: r1(giro), giroDopoGradiF: r1(giroRil), saltoBacinoMaxCmF: r1(salto) };
}

/* riassunto di piu' esecuzioni: mediana (minimo…massimo) per grandezza */
export function riassunto177(L) {
  const V = L.filter(x => x && !x.errore); const g = k => { const a = V.map(x => x[k]).filter(x => x != null && Number.isFinite(x)); return a.length ? { med: med(a), min: Math.min(...a), max: Math.max(...a) } : null; };
  const o = { esecuzioni: L.length, valide: V.length, clip: [...new Set(V.map(x => x.clip))] };
  for (const k of ['dtPiccoF', 'dtPiccoMs', 'dtVicinoF', 'dContattoCm', 'dMinCm', 'puntaQuotaCm', 'dPiantaCm', 'appoggioQuotaCm', 'appoggioScorreCmF', 'appoggioCavigliaSuCm', 'palloneFermoCm', 'giroMaxGradiF', 'giroDopoGradiF', 'saltoBacinoMaxCmF', 'vPiedeMs', 'vPallaMs']) o[k] = g(k);
  return o;
}
export const fmt = x => x ? `${x.med} (${x.min}…${x.max})` : '—';

/* Una scena forzata col banco 170b, ma con la registrazione accesa gia' in ATTESA (0,6 s prima della scelta): serve a vedere se
   l'eroe salta di posto quando parte la battuta. Restituisce i fotogrammi, il testimone del gioco __CPM_G177 e gli errori di pagina. */
export async function scena177(page, { gi, k = 0, out = 'success', kind = null, seme = 1, secondi = 4.5 }) {
  const { avanti } = await import('./gesti-170b.mjs');
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; window.__G170.on = false; });
  const tot = await page.evaluate(() => SITUATIONS.length);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (gi + 61) % tot).catch(() => false);
  await avanti(page, 700);
  await page.evaluate(s => window.__SEME170_RESET(s), seme);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { errore: 'forzatura fallita' };
  await avanti(page, 1400);
  await page.evaluate(([o, kd]) => { window.__CPM_FORCE_OUTCOME = o; if (kd) window.__CPM_FORCE_KIND = kd; else delete window.__CPM_FORCE_KIND; }, [out, kind]);
  await page.evaluate(() => { const G = window.__G170; G.fr = []; G.on = true; G.f = 0; window.__CPM_CONT121 = []; window.__CPM_G177 = null; });
  await avanti(page, 600);
  const pre = await page.evaluate(() => window.__G170.fr.length);
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { errore: 'risoluzione fallita' };
  await avanti(page, secondi * 1000);
  return await page.evaluate(pre => { const G = window.__G170; G.on = false; return { fr: G.fr, pre, c121: (window.__CPM_CONT121 || []).slice(), g177: window.__CPM_G177 || null, err: G.err || null }; }, pre);
}

/* salto dell'eroe al via della battuta: massimo spostamento del bacino in pianta fra due fotogrammi, dall'attesa fino a 20 fotogrammi
   dopo la scelta (cm), e massimo giro del busto nello stesso tratto */
export function via177(R) {
  const F = (R.fr || []).filter(x => x.h && x.b); if (F.length < 30 || !R.pre) return null;
  const alt = med(F.map(x => { const hd = J(x.h, 'head'), l = J(x.h, 'toL'), r = J(x.h, 'toR'); return hd && l && r ? hd[1] - Math.min(l[1], r[1]) : null; }).filter(a => a > 1.2)); const m = alt ? 1.8 / alt : 1;
  let s = 0, g = 0, n = 0; const fwd = k => { const L = J(F[k].h, 'shL'), R2 = J(F[k].h, 'shR'); return Math.atan2(-(R2[0] - L[0]), R2[2] - L[2]); };
  for (let i = 1; i < F.length; i++) { if (F[i].f > R.pre + 20 || F[i].f - F[i - 1].f !== 1) continue; n++; const p = J(F[i].h, 'pel'), q = J(F[i - 1].h, 'pel'); s = Math.max(s, Math.hypot(p[0] - q[0], p[2] - q[2]) * m * 100);
    let dy = Math.abs(fwd(i) - fwd(i - 1)) * 180 / Math.PI; if (dy > 180) dy = 360 - dy; g = Math.max(g, dy); }
  return { fotogrammi: n, saltoViaCmF: r1(s), giroViaGradiF: r1(g) };
}
