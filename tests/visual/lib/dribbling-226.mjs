/* GIRO 226 (PO-491 «Migliora anche i dribbling, alcuni sono davvero confusionari») — LIBRERIA COMUNE al banco di misura
   (misura-dribbling-226.mjs) e al guardiano (dribbling-226.mjs): catalogo, esecuzione di una azione, analisi.

   Una sola sorgente per le due: il guardiano giudica con lo STESSO strumento che ha preso la decisione (lezione 7.505: un guardiano
   scritto accanto a un censimento diverge). Testimone letto: window.__CPM_G226W (src/12, acceso da __CPM_REC226 sotto cpmtest): un
   campione per fotogramma negli highlight, tutto dalle mesh, col tempo di SCENA dentro.

   SOGLIE — dichiarate PRIMA di misurare, con il perche'. Unita': 1u ≈ 1 m (campo 100u ≈ 105 m). Tempi in secondi di SCENA.      */
export const S = {
  D_PIEDE: 2.0,     // u: pallone «controllato» (a terra, in conduzione dell'eroe) oltre 2,0u dal piede piu' vicino = staccato.
                    //    In corsa un tocco lungo sta a 1,5-2 m; oltre non e' piu' conduzione, e' un pallone da solo.
  Q_STACCATO: 0.10, // quota dei fotogrammi «controllati» oltre D_PIEDE sopra la quale il difetto si VEDE (non un fotogramma isolato)
  D_COMP: 0.50,     // u: centri di eroe e avversario sotto 0,5u = busti compenetrati (un busto e' largo ~0,45 m)
  T_COMP: 0.15,     // s di scena sotto D_COMP oltre i quali la compenetrazione si vede (3 fotogrammi a 20 fps)
  V_EROE: 20,       // u/s: cap del modello di movimento 15 u/s (5.47.9) + margine affondi (stessa soglia del banco-248)
  A_EROE: 80,       // u/s²: accelerazione su finestre di ≥0,10 s. Uno scattista vero sta a ~8-10 m/s²; il gioco e' stilizzato,
                    //    ma 8 volte l'umano e' un cambio di passo impossibile
  GIRO_DEG: 120,    // gradi: inversione di marcia fra due finestre consecutive…
  GIRO_V: 5,        // …con entrambe le velocita' sopra 5 u/s (una corsa vera) = «rimbalzo», cambio di direzione impossibile
  D_SALTO_E: 1.0,   // u: passo ISOLATO dell'eroe (oltre V_EROE e oltre 2,5 volte i vicini) = teletrasporto
  D_SALTO_P: 3.0, V_PALLA: 60, // pallone: passo isolato oltre 3u e 60 u/s a terra (in controllo) = teletrasporto
  D_CAM: 2.5, V_CAM: 60,       // camera: passo isolato oltre 2,5u e 60 u/s FUORI da uno stacco nero = salto di camera
  Q_FUORI: 0.15,    // quota di fotogrammi dell'azione con l'eroe fuori quadro oltre la quale «la camera perde l'azione»
  Q_PALLA_FUORI: 0.25, // idem per il pallone (piu' largo: un tiro che esce dal quadro in alto e' legittimo)
  DW: 0.5,          // peso clip che cambia di oltre meta' in un passo di scena ≤ 0,05 s = scatto fra pose
  D_FINE: 3.0,      // u: a fine scena il pallone «e' di» chi sta entro 3u (eroe o avversario); oltre, e' di nessuno
  CAMBI_POSS: 3,    // cambi del corpo piu' vicino al pallone (eroe↔avversario, con isteresi 0,6u) oltre i quali non si capisce chi ce l'ha
  Q_SENZA_GESTO: 0.40, // quota dei fotogrammi della FINTA (tratto «feint», o primi 0,5 s del dribbling puro) senza NESSUN gesto montato (peso < 0,3)
  D_DUELLO: 3.5,    // u: una finta si legge come DUELLO solo se l'avversario e' entro ~3,5 m; oltre, e' una finta nel vuoto
  MIN_FOTOGRAMMI: 20,  // sotto, l'esecuzione e' «non giudicata» (= rosso)
};
export const GLX = 48.6, PALO = 3.35;

export const sleep = ms => new Promise(r => setTimeout(r, ms));
const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const quant = (a, q) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

/* CATALOGO: ogni azione dell'eroe che e' un dribbling (deriveHL type 'dribble') o lo PROMETTE prima della giocata (hlPreDribble
   sull'etichetta: roulette, doppio passo, rientro, sterzata, finta/dribbling generico). `var` = la variante mostrata. */
export async function catalogo(page) {
  return page.evaluate(() => {
    const out = [];
    SITUATIONS.forEach((s, gi) => (s.actions || []).forEach((a, k) => {
      let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {}
      let pre = null; try { pre = hlPreDribble(a.label); } catch (e) {}
      if (h.type !== 'dribble' && !pre) return;
      if (s.type === 'def') return; // «Finta e recupera palla» e' un contrasto difensivo, non un dribbling dell'eroe
      const v = h.type === 'dribble' ? ('puro:' + (pre || h.variant || 'base')) : pre;
      out.push({ gi, k, label: a.label, rew: a.rew || null, tipo: h.type || null, variante: h.variant || null, pattern: h.pattern || null, pre, v, fam: h.type === 'dribble' ? 'dribbling' : (h.type === 'shot' ? 'drib+tiro' : h.type === 'cross' ? 'drib+cross' : 'drib+assist') });
    }));
    return out;
  });
}

export const INIT = () => {
  window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC226 = 1;
};

/* una esecuzione: scena-esca → scena → scelta → conclusione, osservata per SCENA_S secondi di scena */
export async function esegui(page, ex, { SCENA_S = (ex.fam === 'drib+cross' ? 7 : 5) /* il cross dopo il dribbling ha un copione lungo (scambio, ritorno, cross): 5 s non arrivano all'esito */, foto = null, totale = 191 } = {}) {
  const { gi, k, out } = ex;
  const scena = () => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
  const attendiScena = async (ds, capMs) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena()) - s0 >= ds) break; await sleep(80); } };
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const esca = (gi + 61) % totale;
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), esca).catch(() => false);
  await attendiScena(1.0, 10000);
  await page.evaluate(() => { window.__CPM_G226W = []; });
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { ...ex, nonGiud: 'forzatura fallita' };
  await attendiScena(2.0, 16000); /* la camera deve aver finito l'apertura: su pagina nuova, a 1,0 s era ancora in viaggio dalla scena-esca e l'eroe risultava fuori quadro nel tratto di dribbling (misurato su gi30 fallito: 19-20% a pagina nuova, 0-3% a pagina calda) */
  const nPre = await page.evaluate(([o]) => { window.__CPM_FORCE_OUTCOME = o; return (window.__CPM_G226W || []).length; }, [out]);
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { ...ex, nonGiud: 'risoluzione fallita' };
  const tR = Date.now(); let ck0 = null, ckU = 0, nF = 0;
  while (Date.now() - tR < 60000) {
    await sleep(foto ? 120 : 350);
    const c = await page.evaluate(() => ({ s: typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null })).catch(() => null);
    if (!c || c.s == null) continue;
    if (ck0 == null) ck0 = c.s; ckU = c.s - ck0;
    if (foto && nF < foto.max && ckU >= nF * foto.passo) { try { const cv = await page.$('canvas'); await (cv || page).screenshot({ path: `${foto.base}-${String(nF).padStart(2, '0')}.png` }); } catch (e) {} nF++; }
    if (ckU >= SCENA_S) break;
    if (c.ph && String(c.ph).indexOf('hl_') !== 0 && ckU > 1.5) break;
  }
  const dati = await page.evaluate(() => ({
    W: (window.__CPM_G226W || []).slice(),
    out: (function () { const o = window.__CPM_OUTCOME; return o ? { text: o.text || null, ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null, label: o.actionLabel || null } : null; })(),
  }));
  const r = analizza({ ...ex, nPre, dati, ckOss: +ckU.toFixed(2), foto: nF });
  if (process.env.CPM_GREZZO) r.grezzo = dati.W.slice(nPre);
  return r;
}

export function analizza({ dati, nPre, ...ex }) {
  const W = dati.W || []; const post = W.slice(nPre).filter(f => f.ph === 'hl_result');
  const base = { ...ex, testo: dati.out ? dati.out.text : null, okMotore: dati.out ? dati.out.ok : null, outKey: dati.out ? dati.out.outKey : null, outKind: dati.out ? dati.out.outKind : null, nFot: post.length };
  if (post.length < S.MIN_FOTOGRAMMI) return { ...base, nonGiud: `solo ${post.length} fotogrammi di hl_result nel testimone` };
  const F = post; const durata = F[F.length - 1].ck - F[0].ck;
  const dxz = (a, b) => Math.hypot(a[0] - b[0], a[a.length === 3 && b.length === 3 ? 2 : 1] - b[b.length === 3 ? 2 : 1]);
  const hb = f => Math.hypot(f.b[0] - f.h[0], f.b[2] - f.h[1]);
  const piede = f => { let d = hb(f); for (const q of [f.fl, f.fr]) if (q) d = Math.min(d, Math.hypot(f.b[0] - q[0], f.b[2] - q[2])); return d; };
  /* ── tratto di DRIBBLING: beat della timeline di tipo dribble/carry condotto dall'eroe, finta armata, oppure actType dribble ── */
  const inDrib = f => (f.tl && (f.tl[2] === 'dribble' || f.tl[2] === 'carry') && (f.tl[3] === 'HERO' || f.tl[4] === 'HERO' || (!f.tl[3] && !f.tl[4]))) || (f.fn && f.fn[0] < f.fn[1]) || f.at === 'dribble';
  /* «controllato»: tratto di dribbling, pallone a terra, nessun arco in volo, nessun post-arco, e l'esito non e' ancora la perdita
     (sul dribbling perso il pallone DEVE staccarsi: actType dribble con ok=false non e' «controllato») */
  const controllato = f => inDrib(f) && f.b[1] < 0.6 && !f.arc && !f.pa && !(f.at === 'dribble' && f.ok === false);
  const D = F.filter(inDrib), C = F.filter(controllato);
  const dP = C.map(piede);
  const stacc = dP.filter(d => d > S.D_PIEDE).length;
  const palla = { nDrib: D.length, nCtrl: C.length, dMed: C.length ? +median(dP).toFixed(2) : null, dP95: C.length ? +quant(dP, 0.95).toFixed(2) : null, dMax: C.length ? +Math.max(...dP).toFixed(2) : null, qStacc: C.length ? +(stacc / C.length).toFixed(3) : null };
  /* ── il duello: a che distanza dall'avversario piu' vicino si gioca la finta (mediana sul tratto «feint» della timeline; sul
     dribbling puro riuscito, la distanza minima mentre il gesto e' in corso) ── */
  /* nelle azioni che promettono di saltare il PORTIERE («Dribbling portiere e tiro», «Scarta il portiere») l'uomo del duello e' lui */
  const colPortiere = /portiere|\bgk\b/i.test(String(ex.label || ''));
  const dn1 = f => Math.min(f.n1 ? Math.hypot(f.n1[0] - f.h[0], f.n1[1] - f.h[1]) : 99, (colPortiere && f.gk) ? Math.hypot(f.gk[0] - f.h[0], f.gk[1] - f.h[1]) : 99);
  const FE = F.filter(f => f.tl && f.tl[1] === 'feint' && !f.cut && !f.hold) /* l'attesa dell'uomo (hold) non e' ancora la finta */, PU = F.filter(f => f.at === 'dribble' && !f.cut); /* dribbling puro, riuscito o perso: anche chi lo ferma deve essergli addosso */
  const dDuello = FE.length >= 3 ? +median(FE.map(dn1)).toFixed(2) : (PU.length >= 3 ? +Math.min(...PU.map(dn1)).toFixed(2) : null);
  /* ── passi consecutivi (tempo di scena dentro; stacchi neri scartati) ── */
  const passi = []; let tComp = 0, dMinDef = 9e9, pesoSalti = 0, clipSecche = 0, clipIndietro = 0;
  for (let i = 1; i < F.length; i++) {
    const a = F[i - 1], c = F[i]; const ds = c.ck - a.ck; if (!(ds > 0)) { passi.push(null); continue; }
    if (a.cut || c.cut) { passi.push(null); continue; }
    passi.push({ ds, h: Math.hypot(c.h[0] - a.h[0], c.h[1] - a.h[1]), b: Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1], c.b[2] - a.b[2]), c: Math.hypot(c.c[0] - a.c[0], c.c[1] - a.c[1], c.c[2] - a.c[2]), ctrl: controllato(a) && controllato(c), i });
    if (c.n1) { const d = Math.hypot(c.n1[0] - c.h[0], c.n1[1] - c.h[1]); if (d < dMinDef) dMinDef = d; if (d < S.D_COMP) tComp += ds; }
    if (a.g && c.g && ds <= 0.051) {
      if (a.g[0] === c.g[0] && a.g[1] != null && c.g[1] != null && Math.abs(c.g[1] - a.g[1]) > S.DW) pesoSalti++;
      if (a.g[0] && c.g[0] && a.g[0] !== c.g[0] && (a.g[1] || 0) > 0.5 && (c.g[1] || 0) > 0.5) clipSecche++;
      if (a.g[0] && a.g[0] === c.g[0] && (c.g[1] || 0) > 0.5 && a.g[2] != null && c.g[2] != null && c.g[2] < a.g[2] - 0.15) clipIndietro++;
    }
  }
  const salti = { h: 0, b: 0, c: 0 }; const vMax = { h: 0, b: 0, c: 0 }; const esempi = [];
  const SOG = { h: [S.D_SALTO_E, S.V_EROE, 'eroe'], b: [S.D_SALTO_P, S.V_PALLA, 'palla'], c: [S.D_CAM, S.V_CAM, 'camera'] };
  for (let i = 0; i < passi.length; i++) {
    const p = passi[i]; if (!p) continue;
    for (const key of ['h', 'b', 'c']) {
      if (key === 'b' && !p.ctrl) continue; // il pallone si giudica solo quando e' «controllato»: un tiro e' veloce di diritto
      const d = p[key]; const v = d / p.ds; if (v > vMax[key]) vMax[key] = v;
      const [DD, V, nome] = SOG[key];
      const vic = Math.max(passi[i - 1] ? passi[i - 1][key] : 0, passi[i + 1] ? passi[i + 1][key] : 0);
      if (d > DD && v > V && d > 2.5 * vic) { salti[key]++; if (esempi.length < 6) esempi.push(`${nome} ${d.toFixed(1)}u in ${p.ds.toFixed(3)}s a ck ${(F[p.i].ck - F[0].ck).toFixed(2)} (vicini ≤ ${vic.toFixed(1)}u)`); }
    }
  }
  /* ── cambi di direzione: velocita' dell'eroe su finestre di ≥ 0,10 s di scena, poi accelerazione e angolo fra finestre vicine ── */
  const fin = []; { let i0 = 0; for (let i = 1; i < F.length; i++) { if (F[i].cut || F[i - 1].cut) { i0 = i; continue; } const ds = F[i].ck - F[i0].ck; if (ds >= 0.10) { fin.push({ t: F[i].ck - F[0].ck, ds, vx: (F[i].h[0] - F[i0].h[0]) / ds, vz: (F[i].h[1] - F[i0].h[1]) / ds, cont: i0 > 0 && !F[i0].cut, drib: inDrib(F[i]) }); i0 = i; } } }
  let aMax = 0, vFinMax = 0, giri = 0, accOltre = 0; const esDir = [];
  for (let i = 0; i < fin.length; i++) { const w = fin[i]; const v = Math.hypot(w.vx, w.vz); if (v > vFinMax) vFinMax = v; if (i === 0) continue; const p = fin[i - 1]; if (Math.abs((w.t - w.ds) - p.t) > 0.02) continue;
    const a = Math.hypot(w.vx - p.vx, w.vz - p.vz) / ((w.ds + p.ds) / 2); if (a > aMax) aMax = a; if (a > S.A_EROE) { accOltre++; if (esDir.length < 5) esDir.push(`accelerazione ${a.toFixed(0)} u/s² a ck ${w.t.toFixed(2)} (${Math.hypot(p.vx, p.vz).toFixed(1)}→${v.toFixed(1)} u/s)`); }
    const vp = Math.hypot(p.vx, p.vz); if (v > S.GIRO_V && vp > S.GIRO_V) { const cos = (w.vx * p.vx + w.vz * p.vz) / (v * vp); const ang = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI; if (ang > S.GIRO_DEG) { giri++; if (esDir.length < 5) esDir.push(`inversione ${ang.toFixed(0)}° a ck ${w.t.toFixed(2)} (${vp.toFixed(1)} e ${v.toFixed(1)} u/s)`); } } }
  /* ── chi ha il pallone: corpo piu' vicino fra eroe e avversario n1, con isteresi ── */
  let chi = null, cambi = 0; const seq = [];
  for (const f of F) { if (f.b[1] > 1.2 || f.arc) continue; const dh = hb(f); const dn = f.n1 ? Math.hypot(f.b[0] - f.n1[0], f.b[2] - f.n1[1]) : 99; let now = chi;
    if (dh < dn - 0.6 && dh < S.D_FINE) now = 'E'; else if (dn < dh - 0.6 && dn < S.D_FINE) now = 'A'; else if (dh > S.D_FINE && dn > S.D_FINE) now = chi;
    if (now !== chi) { if (chi != null) cambi++; chi = now; seq.push(`${now}@${(f.ck - F[0].ck).toFixed(1)}`); } }
  /* ── camera ── */
  const fuoriE = F.filter(f => !f.cut && (Math.abs(f.hn[0]) > 1 || Math.abs(f.hn[1]) > 1 || !f.hn[2])).length, nNoCut = F.filter(f => !f.cut).length || 1;
  const fuoriP = F.filter(f => !f.cut && (Math.abs(f.bn[0]) > 1 || Math.abs(f.bn[1]) > 1 || !f.bn[2])).length;
  const fuoriED = D.filter(f => !f.cut && (Math.abs(f.hn[0]) > 1 || Math.abs(f.hn[1]) > 1 || !f.hn[2])).length;
  /* ── gesti ── */
  const clipSeq = []; for (const f of F) { const n = f.g && (f.g[1] || 0) > 0.5 ? f.g[0] : null; if (n && clipSeq[clipSeq.length - 1] !== n) clipSeq.push(n); }
  /* il gesto si pretende dove il dribbling SI GIOCA: tratto «feint» della timeline, o gesto del dribbling puro (i primi 0,5 s). La
     conduzione prima e dopo e' corsa col pallone: li' la locomozione e' il gesto giusto. */
  const GE = FE.length >= 3 ? FE : PU.filter(f => f.ck - PU[0].ck <= 0.5);
  const senzaGesto = GE.length >= 3 ? GE.filter(f => !(f.g && f.g[0] && (f.g[1] || 0) >= 0.3)).length / GE.length : null;
  /* ── fine scena: di chi e' il pallone, e' entrato in rete? ── */
  const U = F.slice(-Math.max(3, Math.floor(F.length * 0.08))); const uf = U[U.length - 1];
  const inRete = F.some(f => f.b[0] > GLX && Math.abs(f.b[2]) <= PALO && f.b[1] < 2.6);
  const dhF = median(U.map(hb)), dnF = median(U.map(f => f.n1 ? Math.hypot(f.b[0] - f.n1[0], f.b[2] - f.n1[1]) : 99));
  /* un uomo a terra non ha il pallone: se a fine scena l'eroe e' caduto (clip trip/fallen), il pallone vicino a lui non e' «suo» */
  const aTerra = U.every(f => f.g && /^(trip|fallen)$/.test(String(f.g[0])) && (f.g[1] || 0) > 0.5) || (F.some(f => f.g && f.g[0] === 'fallen' && (f.g[1] || 0) > 0.8) && !F.slice(-3).some(f => f.at));
  const fineChi = inRete ? 'rete' : (dhF <= S.D_FINE && dhF <= dnF && !aTerra) ? 'eroe' : (dnF <= S.D_FINE) ? 'avversario' : 'nessuno';
  const n1Inizio = F[0].n1; const superato = n1Inizio ? (uf.h[0] > (uf.n1 && uf.n1[2] === n1Inizio[2] ? uf.n1[0] : n1Inizio[0]) + 0.5) : null;
  /* ── coerenza testo ↔ cio' che si vede. Si giudica cio' che il testo/motore DICHIARA: ok + chiave d'esito. ── */
  const key = String(base.outKey || ''), kd = String(base.outKind || (F.find(f => f.kd) || {}).kd || '');
  const perso = /dispos|tackl|intercept|beaten|lost|stolen|foul_against|block/i.test(kd + ' ' + key);
  let incoerenza = null;
  if (base.okMotore === true) {
    if (key === 'goal' && !/chance/.test(kd) && !inRete) incoerenza = 'il testo dichiara GOL ma il pallone non entra in rete nella scena osservata';
    else if (key !== 'goal' && ex.tipo === 'dribble' && !/freekick|foul|penalt/i.test(kd) && fineChi === 'avversario') incoerenza = 'dribbling RIUSCITO ma a fine scena il pallone e\' dell\'avversario';
    else if (key !== 'goal' && inRete && !/goal|chance|assist/i.test(kd + key)) incoerenza = 'nessun gol dichiarato ma il pallone entra in rete';
  } else if (base.okMotore === false) {
    if (inRete) incoerenza = 'azione FALLITA ma il pallone entra in rete';
    else if (perso && fineChi === 'eroe') incoerenza = `il testo dichiara palla persa (${kd || key}) ma a fine scena il pallone e' ancora dell'eroe`;
  } else incoerenza = 'nessun esito leggibile (__CPM_OUTCOME vuoto)';
  const m = {
    durata: +durata.toFixed(2), palla, duello: dDuello, comp: { dMin: dMinDef > 1e8 ? null : +dMinDef.toFixed(2), t: +tComp.toFixed(2) },
    moto: { vMax: +vFinMax.toFixed(1), aMax: +aMax.toFixed(0), accOltre, giri, saltiEroe: salti.h, saltiPalla: salti.b, es: esDir },
    camera: { salti: salti.c, vMax: +vMax.c.toFixed(0), qFuoriEroe: +(fuoriE / nNoCut).toFixed(3), qFuoriEroeDrib: D.length ? +(fuoriED / D.length).toFixed(3) : null, qFuoriPalla: +(fuoriP / nNoCut).toFixed(3) },
    possesso: { cambi, seq: seq.slice(0, 10).join(' '), fineChi, superato, inRete },
    gesti: { clip: clipSeq.join('→') || '—', pesoSalti, clipSecche, clipIndietro, qSenzaGesto: senzaGesto == null ? null : +senzaGesto.toFixed(2) },
    coerenza: incoerenza, esempi,
  };
  /* ── difetti sopra soglia e punteggio di confusione (somma degli sforamenti normalizzati sulla soglia, tetto 3 per voce) ── */
  const dif = []; let p = 0; const voce = (nome, val, sog, testo) => { if (val > sog) { dif.push(testo); p += Math.min(3, sog > 0 ? val / sog : 1 + val); } };
  if (palla.nCtrl >= 5) voce('stacc', palla.qStacc, S.Q_STACCATO, `pallone staccato dal piede nel ${(palla.qStacc * 100).toFixed(0)}% dei fotogrammi controllati (max ${palla.dMax}u, soglia ${S.D_PIEDE}u)`);
  if (dDuello != null) voce('duello', dDuello, S.D_DUELLO, `finta nel vuoto: l'avversario piu' vicino e' a ${dDuello}u (soglia ${S.D_DUELLO}u)`);
  voce('comp', m.comp.t, S.T_COMP, `corpi compenetrati per ${m.comp.t}s (distanza minima ${m.comp.dMin}u)`);
  voce('acc', accOltre, 0, `${accOltre} accelerazioni oltre ${S.A_EROE} u/s² (max ${m.moto.aMax})`);
  voce('giri', giri, 0, `${giri} inversioni di marcia oltre ${S.GIRO_DEG}° in corsa`);
  voce('saltiE', salti.h, 0, `${salti.h} teletrasporti dell'eroe`);
  voce('saltiP', salti.b, 0, `${salti.b} teletrasporti del pallone in controllo`);
  voce('cam', salti.c, 0, `${salti.c} salti di camera fuori dagli stacchi`);
  voce('fuoriE', m.camera.qFuoriEroe, S.Q_FUORI, `eroe fuori quadro nel ${(m.camera.qFuoriEroe * 100).toFixed(0)}% dei fotogrammi`);
  voce('fuoriP', m.camera.qFuoriPalla, S.Q_PALLA_FUORI, `pallone fuori quadro nel ${(m.camera.qFuoriPalla * 100).toFixed(0)}% dei fotogrammi`);
  voce('poss', cambi, S.CAMBI_POSS, `${cambi} cambi di padrone del pallone (${m.possesso.seq})`);
  /* cambi di clip: si CONTANO ma non fanno punteggio. Il testimone legge nome e peso della clip corrente; il gioco sfuma la precedente
     a parte (_gPrev, 7.49): un cambio di nome a peso pieno non e' per forza uno scatto di posa. Solo la clip RIPARTITA e' un difetto certo. */
  voce('clip', clipIndietro, 0, `${clipIndietro} clip ripartite a meta'`);
  if (senzaGesto != null) voce('nogesto', senzaGesto, S.Q_SENZA_GESTO, `finta senza gesto montato nel ${(senzaGesto * 100).toFixed(0)}% dei fotogrammi`);
  if (D.length < 5) { dif.push(`nessun tratto di dribbling visibile (${D.length} fotogrammi): l'azione promette «${ex.v}» e non la mostra`); p += 2; }
  if (incoerenza) { dif.push('INCOERENZA: ' + incoerenza); p += 3; }
  return { ...base, giudicata: true, m, difetti: dif, punti: +p.toFixed(2) };
}

export function rigaBreve(r) {
  if (!r.giudicata) return `gi${r.gi} k${r.k} ${r.out.padEnd(7)} NON GIUDICATA: ${r.nonGiud || r.errore}`;
  const m = r.m;
  return `gi${r.gi} k${r.k} ${r.out.padEnd(7)} ${String(r.v).padEnd(22)} punti ${String(r.punti).padStart(5)} · piede ${m.palla.dMed ?? '—'}/${m.palla.dMax ?? '—'}u (${m.palla.nCtrl}f) · duello ${m.duello ?? '—'}u · comp ${m.comp.dMin}u/${m.comp.t}s · a ${m.moto.aMax} giri ${m.moto.giri} · cam ${m.camera.salti} fuori ${(m.camera.qFuoriEroe * 100).toFixed(0)}% · poss ${m.possesso.cambi} fine ${m.possesso.fineChi} · ${m.gesti.clip} · ${r.outKey}/${r.outKind || '—'}${m.coerenza ? ' · ✗ ' + m.coerenza : ''}`;
}
