/* GIRO 241 (PO-506 «Sì, eroe sempre in quadro») — LIBRERIA COMUNE al banco (misura-241.mjs) e al guardiano (camera-241.mjs).
   Una sola sorgente per i due (lezione 7.505: un guardiano scritto accanto a un censimento diverge).
   Testimone letto: window.__CPM_G241W (src/12, acceso da __CPM_REC241 sotto cpmtest): un campione per FOTOGRAMMA in ogni fase, tutto
   dalle mesh, col tempo di SCENA dentro (7.502) e lo stato dello stacco nero (7.504).

   CHE COSA SI GIUDICA. La scena = i fotogrammi di hl_result dell'azione provocata con esito FALLITO, dal clic alla fine della scena
   (uscita da hl_result; tetto SCENA_MAX secondi di scena). Fotogrammi dentro uno stacco nero o con l'eroe invisibile non si contano.
   DUE CAMERE, e vanno tenute distinte (scoperto in questo giro): la camera della REGIA e il fotogramma DISEGNATO. Dal giro 96a il
   fotogramma disegnato viene corretto all'ultimo (ruota e allarga l'ottica) per tenere dentro l'eroe: a schermo l'eroe non sparisce,
   ma quando la regia lo ha perso resta SCHIACCIATO SUL BORDO (fra 0,76 e 0,90 del semiquadro) mentre la scena inquadra altro.
   Il banco 226 (le «13 esecuzioni su 116») misurava la camera della regia. Qui si giudicano tutte e due:
     «eroe in quadro (regia)»   = il CENTRO del corpo (0,9 u dai piedi) dentro il quadro della camera della regia (grandezza del 226);
     «eroe in quadro (schermo)» = sul fotogramma disegnato piedi e testa dentro il quadro E non schiacciati sul bordo (|x| <= BORDO).
   In piu' si scrivono, sul fotogramma disegnato: pallone dentro, eroe e pallone insieme, altezza apparente dell'eroe.            */
export const S = {
  BORDO: 0.80,         // oltre 0,80 del semiquadro orizzontale (piedi o testa) l'eroe e' schiacciato sul bordo dalla correzione del 96a (rampa 0,76-0,90)
  Q_DENTRO: 0.95,      // consegna: eroe in quadro in almeno il 95% dei fotogrammi della scena
  MIN_FOTOGRAMMI: 20,  // sotto, l'esecuzione e' «non giudicata» (= rosso)
  SCENA_MAX: 9,        // s di scena osservati al massimo (l'auto-avanzamento ha un tetto di 6 s, 7.461)
  H_ENORME: 0.60,      // altezza apparente dell'eroe oltre il 60% del quadro = «enorme in primo piano» (piano americano 0,35-0,60, 7.480)
  POST_S: 3.5,         // s di scena di gioco fluido osservati dopo la fine della scena (dubbio 12 del giro 226)
};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const INIT = () => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC241 = 1; };

/* CATALOGO: ogni azione dell'eroe NON difensiva, con la famiglia mostrata (deriveHL). */
export async function catalogo(page) {
  return page.evaluate(() => {
    const out = [];
    SITUATIONS.forEach((s, gi) => (s.actions || []).forEach((a, k) => {
      if (s.type === 'def') return;
      let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {}
      const t = h.type || null;
      const fam = (t === 'shot' || t === 'header' || t === 'penalty' || t === 'freekick') ? 'tiro' : t === 'cross' ? 'cross' : t === 'dribble' ? 'dribbling' : (t === 'pass' || t === 'build') ? 'passaggio' : null;
      if (!fam) return;
      out.push({ gi, k, label: a.label, rew: a.rew || null, tipo: t, variante: h.variant || null, fam, sit: String(s.text || '').slice(0, 60) });
    }));
    return out;
  });
}

/* una esecuzione: scena-esca → scena → scelta → conclusione FALLITA, osservata fino alla fine della scena (+ POST secondi di gioco) */
export async function esegui(page, ex, { totale = 191, post = 0, kind = null, foto = null } = {}) {
  const { gi, k } = ex; const out = ex.out || 'fail';
  const scena = () => page.evaluate(() => { const W = window.__CPM_G241W; return W && W.length ? W[W.length - 1].ck : 0; }).catch(() => 0);
  const attendiScena = async (ds, capMs) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena()) - s0 >= ds) break; await sleep(80); } };
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const esca = (gi + 61) % totale;
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), esca).catch(() => false);
  await attendiScena(1.0, 10000);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { ...ex, out, nonGiud: 'forzatura fallita' };
  await attendiScena(2.0, 16000); /* la camera deve aver finito l'apertura (misurato al giro 226 su gi30) */
  const nPre = await page.evaluate(([o, kd]) => { window.__CPM_FINE241 = null; window.__CPM_FORCE_OUTCOME = o; if (kd) window.__CPM_FORCE_KIND = kd; return (window.__CPM_G241W || []).length; }, [out, kind]);
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { ...ex, out, nonGiud: 'risoluzione fallita' };
  const tR = Date.now(); let ck0 = null, ckU = 0, fine = null, nF = 0, visto = false;
  while (Date.now() - tR < 90000) {
    await sleep(foto ? 100 : 300);
    const c = await page.evaluate(() => { const W = window.__CPM_G241W; return { s: W && W.length ? W[W.length - 1].ck : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, fine: window.__CPM_FINE241 }; }).catch(() => null);
    if (!c || c.s == null) continue;
    if (ck0 == null) ck0 = c.s; ckU = c.s - ck0;
    if (c.ph === 'hl_result') visto = true;
    if (foto && nF < foto.max && ckU >= nF * foto.passo) { try { const cv = await page.$('canvas'); await (cv || page).screenshot({ path: `${foto.base}-${String(nF).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 }); } catch (e) {} nF++; }
    if (fine == null && ((visto && c.ph !== 'hl_result' && ckU > 1.0) || c.fine != null || ckU >= S.SCENA_MAX)) fine = c.s;
    if (fine != null && c.s - fine >= post) break;
  }
  const dati = await page.evaluate(n => ({
    W: (window.__CPM_G241W || []).slice(n), fine: window.__CPM_FINE241 == null ? null : window.__CPM_FINE241 - n,
    out: (function () { const o = window.__CPM_OUTCOME; return o ? { text: o.text || null, ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null } : null; })(),
  }), nPre);
  await page.evaluate(() => { window.__CPM_G241W = (window.__CPM_G241W || []).slice(-1); delete window.__CPM_FORCE_KIND; });
  const r = analizza({ ...ex, out, dati, ckOss: +ckU.toFixed(2), foto: nF });
  if (process.env.CPM_GREZZO) r.grezzo = dati.W;
  return r;
}

const dentroN = n => Math.abs(n[0]) <= 1 && Math.abs(n[1]) <= 1 && !!n[2];
export function analizza({ dati, ...ex }) {
  const W = dati.W || [];
  const i0 = W.findIndex(f => f.ph === 'hl_result'); let i1 = i0;
  if (i0 >= 0) { while (i1 < W.length && W[i1].ph === 'hl_result') i1++; }
  /* FINE DELLA SCENA: sotto forzatura la scena non avanza da sola (handleContinue esce alla prima riga); il gioco segna in
     __CPM_FINE241 il fotogramma in cui l'avrebbe chiusa (finestra d'esito + attesa della scena, 7.461). Si giudica fino a li'. */
  const chiusa = dati.fine != null && dati.fine > i0; if (chiusa) i1 = Math.min(i1, dati.fine);
  const R = i0 >= 0 ? W.slice(i0, i1) : [];
  const base = { ...ex, testo: dati.out ? dati.out.text : null, okMotore: dati.out ? dati.out.ok : null, outKey: dati.out ? dati.out.outKey : null, outKind: dati.out ? dati.out.outKind : null };
  const F = R.filter(f => !f.cut && f.hv);
  if (F.length < S.MIN_FOTOGRAMMI) return { ...base, nFot: F.length, nonGiud: `solo ${F.length} fotogrammi di hl_result nel testimone` };
  if (ex.out === 'fail' && F[F.length - 1].ok !== false) return { ...base, nFot: F.length, nonGiud: 'l\'esito in scena non e\' fallito' };
  const durata = +(F[F.length - 1].ck - F[0].ck).toFixed(2);
  /* camera della REGIA (rn); fotogramma DISEGNATO: piedi e testa dentro e non sul bordo */
  const okR = f => f.rn ? dentroN(f.rn) : dentroN(f.hn), okS = f => !!(f.fi && f.ti && f.ex <= S.BORDO);
  const fu = F.filter(f => !okR(f)), fuS = F.filter(f => !okS(f));
  let striscia = 0, sMax = 0, tPrimo = null; for (const f of F) { if (!okR(f)) { striscia++; if (tPrimo == null) tPrimo = +(f.ck - F[0].ck).toFixed(2); if (striscia > sMax) sMax = striscia; } else striscia = 0; }
  const fuB = F.filter(f => !f.bv || !dentroN(f.bn));
  const tutti = F.filter(f => dentroN(f.hn) && f.bv && dentroN(f.bn));
  const hh = F.map(f => f.hh).sort((a, b) => a - b);
  /* gioco fluido dopo la scena */
  const P = W.slice(i1).filter(f => !f.cut && f.hv); /* dopo la chiusura: sotto forzatura la scena resta appesa in hl_result (il giocatore non la vede: dichiarato) */
  const P0 = P.length ? P[0].ck : 0;
  const enorme = P.filter(f => f.hh > S.H_ENORME && f.hn[2]);
  const dopo = P.length ? { n: P.length, durata: +(P[P.length - 1].ck - P0).toFixed(2), hhMax: +Math.max(...P.map(f => f.hn[2] ? f.hh : 0)).toFixed(3), dcMin: +Math.min(...P.map(f => f.dc)).toFixed(1), nEnorme: enorme.length, tEnorme: enorme.length ? +(enorme[0].ck - P0).toFixed(2) : null, qFuori: +(P.filter(f => !dentroN(f.hn)).length / P.length).toFixed(3) } : null;
  /* anche l'ultimo tratto della scena (l'eroe puo' diventare enorme gia' in hl_result) */
  const enormeR = F.filter(f => f.hh > S.H_ENORME && f.hn[2]);
  return { ...base, giudicata: true, chiusa, nFot: F.length, nCut: R.length - F.length, durata, kd: F[F.length - 1].kd, pa: [...new Set(F.map(f => f.pa).filter(Boolean))].join('+') || null,
    qDentro: +(1 - fu.length / F.length).toFixed(3), qSchermo: +(1 - fuS.length / F.length).toFixed(3), strisciaMax: sMax, tPrimoFuori: tPrimo, qPallaFuori: +(fuB.length / F.length).toFixed(3), qInsieme: +(tutti.length / F.length).toFixed(3),
    qPiediTesta: +(F.filter(f => f.fi && f.ti).length / F.length).toFixed(3), hhMed: +hh[hh.length >> 1].toFixed(3), hhMax: +hh[hh.length - 1].toFixed(3), nEnormeScena: enormeR.length,
    qSoggPalla: +(F.filter(f => f.sb).length / F.length).toFixed(3), qG241: +(F.filter(f => f.g241).length / F.length).toFixed(3), dBHmax: +Math.max(...F.map(f => Math.hypot(f.b[0] - f.h[0], f.b[2] - f.h[1]))).toFixed(1), dopo };
}
export function violazioni(r) {
  if (r.errore) return ['errore: ' + r.errore];
  if (!r.giudicata) return ['non giudicata: ' + (r.nonGiud || '?')];
  const v = [];
  if (r.qDentro < S.Q_DENTRO) v.push(`eroe in quadro (regia) nel ${(r.qDentro * 100).toFixed(1)}% dei fotogrammi (< 95%) — striscia piu' lunga ${r.strisciaMax}, primo fuori a ${r.tPrimoFuori} s`);
  if (r.qSchermo < S.Q_DENTRO) v.push(`eroe in quadro (schermo, intero e non sul bordo) nel ${(r.qSchermo * 100).toFixed(1)}% dei fotogrammi (< 95%)`);
  return v;
}
export const rigaBreve = r => `gi${r.gi}k${r.k} ${r.fam}/${r.tipo} «${String(r.label || '').slice(0, 34)}» ${r.out}${r.kd ? '/' + r.kd : ''}` + (r.giudicata ? ` · ${r.nFot} fot ${r.durata}s · eroe dentro: regia ${(r.qDentro * 100).toFixed(1)}% schermo ${(r.qSchermo * 100).toFixed(1)}% · insieme ${(r.qInsieme * 100).toFixed(0)}% · palla fuori ${(r.qPallaFuori * 100).toFixed(0)}% · taglia med ${r.hhMed} max ${r.hhMax}` + (r.dopo ? ` · dopo: taglia max ${r.dopo.hhMax} (enorme ${r.dopo.nEnorme}/${r.dopo.n})` : '') : ` · ${r.nonGiud || r.errore}`);
