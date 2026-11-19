/* [giro 256] misure condivise fra la sonda misura-256.mjs e il guardiano presentazione-225 (blocco D) sulla serie per fotogramma del saluto.
   Ogni campione: { t (tempo di scena), w (peso del saluto 0..1), br (misuraBraccio225), or (orient256) }. */
const G = 180 / Math.PI;
const angV = (a, c) => Math.acos(Math.max(-1, Math.min(1, a[0] * c[0] + a[1] * c[1] + a[2] * c[2]))) * G;
const angQ = (a, c) => 2 * Math.acos(Math.max(-1, Math.min(1, Math.abs(a[0] * c[0] + a[1] * c[1] + a[2] * c[2] + a[3] * c[3])))) * G;
/* SCATTI fra un fotogramma e l'altro: per ogni osso (omero e avambraccio, due lati) la velocita' di orientazione del passo k contro i
   quattro passi vicini (k-2, k-1, k+1, k+2). Uno scatto e' un passo ISOLATO: molto piu' veloce di almeno tre dei quattro vicini — vale
   per il salto che resta (un passo solo) e per il salto di un fotogramma che torna indietro (due passi di fila). In un movimento vero, e
   nelle rampe in dissolvenza, la velocita' cambia con continuita': attorno al passo piu' veloce ce ne sono almeno due paragonabili.
   eccesso = v[k] - (secondo piu' veloce dei quattro vicini), in gradi/s; si giudica il massimo.
   Si scartano i passi con un intervallo anomalo: > 0,2 s, oppure < 0,03 s (due letture dentro lo stesso fotogramma di scena: misurato in
   tutti e due i bracci, un passo di 0,011 s dava 1.345 gradi/s per il solo rumore dell'angolo diviso per un tempo quasi nullo).
   I quaternioni si normalizzano qui: letti da una matrice con scala non uniforme non sono unitari (misurato: 19 gradi finti a braccio fermo). */
const nrm = q => { const n = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / n, q[1] / n, q[2] / n, q[3] / n]; };
export function scatti256(S) {
  const A = S.filter(s => s.or && s.w > 0.02); const out = { passi: 0, max: 0, osso: null, t: null, vmax: 0 };
  for (const osso of ['u_l', 'u_r', 'f_l', 'f_r']) { const v = [];
    for (let k = 1; k < A.length; k++) { const dt = A[k].t - A[k - 1].t; v.push(dt >= 0.03 && dt <= 0.2 ? { v: angQ(nrm(A[k].or[osso]), nrm(A[k - 1].or[osso])) / dt, t: A[k].ts != null ? A[k].ts : A[k].t } : null); }
    for (let k = 2; k + 2 < v.length; k++) { if (!v[k] || !v[k - 1] || !v[k + 1] || !v[k - 2] || !v[k + 2]) continue; out.passi++; const vic = [v[k - 2].v, v[k - 1].v, v[k + 1].v, v[k + 2].v].sort((a, c) => c - a);
      const e = v[k].v - vic[1]; if (v[k].v > out.vmax) out.vmax = v[k].v; if (e > out.max) { out.max = e; out.osso = osso; out.t = v[k].t; } } }
  out.max = +out.max.toFixed(0); out.vmax = +out.vmax.toFixed(0); if (out.t != null) out.t = +out.t.toFixed(2); return out; }
/* PROVA DEL METRO: nella serie vera si provoca uno scatto (un fotogramma con l'omero destro ruotato di `gradi`, che al fotogramma dopo torna
   dov'era) e si rimisura. Se il metro non lo vede, il guardiano non sta giudicando. */
export function provaScatti256(S, gradi = 30) {
  const A = S.filter(s => s.or && s.w > 0.02).map(s => ({ ...s, or: { ...s.or } })), ok = k => { const dt = A[k].t - A[k - 1].t; return dt >= 0.03 && dt <= 0.2; };
  /* il fotogramma piu' QUIETO fra quelli a peso pieno con sei passi validi intorno: li' uno scatto si vede meglio, e il metro deve vederlo */
  let k = -1, quiete = Infinity; for (let i = 3; i + 3 < A.length; i++) { if (!(A[i].w >= 0.999)) continue; let buoni = true, somma = 0; for (let d = -2; d <= 3; d++) { if (!ok(i + d)) { buoni = false; break; } somma += angQ(nrm(A[i + d].or.u_r), nrm(A[i + d - 1].or.u_r)); } if (buoni && somma < quiete) { quiete = somma; k = i; } }
  if (k < 0) return null; const q = nrm(A[k].or.u_r), h = gradi / 2 / G, c = Math.cos(h), z = Math.sin(h);
  A[k].or.u_r = [q[0] * c + q[3] * z, q[1] * c + q[2] * z, q[2] * c - q[1] * z, q[3] * c - q[0] * z];/* q · rotazione intorno a x */
  return scatti256(A); }
/* VELOCITA' di omero e avambraccio destro (direzioni, finestra di 0,10 s di scena, come nel giro 225), separate:
   rampa = finestre che toccano un fotogramma a peso < 1 (tratto CALCOLATO: dissolvenza dalla posa a riposo e ritorno);
   clip  = finestre tutte a peso pieno (movimento della clip vera). */
export function velocita256(S) {
  const A = S.filter(s => s.br); const o = { rampaOmero: 0, rampaAvambraccio: 0, clipOmero: 0, clipAvambraccio: 0 }; let j = 0;
  for (let k = 1; k < A.length; k++) { while (j + 1 < k && A[k].t - A[j + 1].t >= 0.10) j++; const dw = A[k].t - A[j].t; if (!(dw >= 0.10) || dw > 0.3) continue;
    let pieno = true; for (let q = j; q <= k; q++) if (!(A[q].w >= 0.999)) { pieno = false; break; }
    const a = angV(A[k].br.dU, A[j].br.dU) / dw, c = angV(A[k].br.dF, A[j].br.dF) / dw;
    if (pieno) { o.clipOmero = Math.max(o.clipOmero, a); o.clipAvambraccio = Math.max(o.clipAvambraccio, c); } else { o.rampaOmero = Math.max(o.rampaOmero, a); o.rampaAvambraccio = Math.max(o.rampaAvambraccio, c); } }
  for (const k in o) o[k] = +o[k].toFixed(0); return o; }
/* SALTI al rallentatore (window.__CPM_LENTO256, solo sonde: il tempo del saluto avanza a una frazione del passo di scena). Ogni fotogramma
   copre pochi millesimi di secondo di saluto: un movimento continuo — anche veloce — fa passi piccoli e simili ai vicini; un salto (la posa
   che cambia di colpo) resta della stessa ampiezza per quanto si rallenti. E' la misura che non dipende dai fotogrammi al secondo del banco
   (la stessa a velocita' normale misurava velocita' x intervallo: 117-249 gradi/s di «eccesso» sullo stesso movimento, a seconda della corsa).
   eccesso = passo[k] - (secondo piu' grande dei quattro passi vicini), in GRADI; si giudica il massimo. Si usano solo i passi in cui il
   tempo del saluto e' avanzato (0 < dts <= 0,02 s). */
export function salti256(S) {
  const A = []; for (const s of S) { if (!s.or || !(s.w > 0.02)) continue; if (A.length && !(s.ts > A[A.length - 1].ts)) continue; A.push(s); }
  const out = { passi: 0, max: 0, osso: null, t: null, passoMax: 0, velMax: 0, dts: null }; let sd = 0, nd = 0;
  for (const osso of ['u_l', 'u_r', 'f_l', 'f_r']) { const v = [];
    for (let k = 1; k < A.length; k++) { const dts = A[k].ts - A[k - 1].ts; if (dts > 0 && dts <= 0.02) { sd += dts; nd++; } v.push(dts > 0 && dts <= 0.02 ? { a: angQ(nrm(A[k].or[osso]), nrm(A[k - 1].or[osso])), dts, t: A[k].ts } : null); }
    for (let k = 2; k + 2 < v.length; k++) { if (!v[k] || !v[k - 1] || !v[k + 1] || !v[k - 2] || !v[k + 2]) continue; out.passi++; const vic = [v[k - 2].a, v[k - 1].a, v[k + 1].a, v[k + 2].a].sort((a, c) => c - a);
      const e = v[k].a - vic[1]; if (v[k].a > out.passoMax) out.passoMax = v[k].a; if (v[k].a / v[k].dts > out.velMax) out.velMax = v[k].a / v[k].dts; if (e > out.max) { out.max = e; out.osso = osso; out.t = v[k].t; } } }
  out.max = +out.max.toFixed(2); out.passoMax = +out.passoMax.toFixed(2); out.velMax = +out.velMax.toFixed(0); out.dts = nd ? +(sd / nd).toFixed(4) : null; if (out.t != null) out.t = +out.t.toFixed(2); return out; }
/* PROVA DEL METRO: un fotogramma della serie vera con l'omero destro ruotato di `gradi` (al fotogramma dopo torna dov'era). */
export function provaSalti256(S, gradi = 10) {
  const A = S.filter(s => s.or && s.w > 0.02).map(s => ({ ...s, or: { ...s.or } })); const I = []; A.forEach((s, k) => { if (s.w >= 0.999) I.push(k); }); if (I.length < 20) return null;
  const k = I[I.length >> 1], q = nrm(A[k].or.u_r), h = gradi / 2 / G, c = Math.cos(h), z = Math.sin(h);
  A[k].or.u_r = [q[0] * c + q[3] * z, q[1] * c + q[2] * z, q[2] * c - q[1] * z, q[3] * c - q[0] * z];
  return salti256(A); }
