#!/usr/bin/env node
/* [giro 381 — PO-663 + PO-660] GUARDIANO «LE SCIVOLATE SI FANNO SUL PRATO; NELLA FILA NESSUNO CORRE DA FERMO». Rossi __CPM_NO_G381A
   (scivolate) e __CPM_NO_G381B (fila), accesi insieme nel braccio rosso.
   PO-663 (dal giro 366): `tackle` e `slide-tackle` hanno il bacino inchiodato mentre il corpo si stende: il punto piu' basso del CORPO
   INTERO stava a 0,35-0,39 altezze-corpo (~0,65 u) sopra la suola della posa ferma. Riparazione in src/12 (_aTerra381): al caricamento
   il bacino della clip scende di quanto il punto piu' basso del corpo intero sta sopra quella suola.
   (A) la clip — testimone __CPM_T381, deterministico (clone fuori scena), in altezze-corpo, per `tackle` e `slide-tackle`:
       VERDE: riparata · corpo intero mediana <= 0,02 e massimo <= 0,16 · piede nel terzo centrale (mediana) entro il RAGGIO del pallone, 0,20 u (= 0,114 altezze-corpo): il
       piede tocca un pallone a terra. ROSSO: anche piede sopra il DIAMETRO (non puo' toccarlo).
       ROSSO: non riparata e corpo intero mediana >= 0,25.
   (S) i corpi disegnati — testimone __CPM_SCIV381 a ogni fotogramma delle fasi hl_*, scene forzate (difesa e dribbling, esito ok e
       fallito), corpi GLB accesi, teatro acceso; righe a meta' clip (tempo 0,3-0,7, peso >= 0,8) di `tackle`/`slide-tackle`:
       VERDE: 90° percentile del punto piu' basso del corpo <= 0,10 u dal prato. ROSSO: mediana >= 0,35 u.
       Servono almeno 12 righe da almeno 2 scivolate: sotto, NON GIUDICATO = rosso. Distanza piede-pallone: stampata (dipende dalla scena).
   PO-660 (residuo di PO-227, decisione PO 25/11 «prima si verifica se sono visibili»): misurato con misura-381-fila su TUTTI i corpi
       animati del walkout (ogni AnimationMixer: 22 giocatori, 3 arbitri, quarto uomo, 19 bambini), nessuno suona `jog`.
   (F) la fila — VERDE: walkout visto, almeno 40 corpi animati, nessuna clip `jog` attiva, nessun corpo con locomozione >= 0,3 da fermo
       (velocita' smussata < 0,3 u/s) per piu' di 1,5 s di fila. ROSSO (__CPM_NO_G381B rimette il difetto di PO-227): almeno 5 corpi
       oltre 3 s. Uso: node scivolate-381.mjs · CPM_SOLO=verde|rosso */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { scene381, riassumi381 } from './misura-381-scene.mjs';
import { fila381 } from './misura-381-fila.mjs';
const SOLO = process.env.CPM_SOLO || '';
const SCENE = (process.env.CPM_SCENE || '18,19,31,168').split(',').map(Number);
const RAGGIO = 0.20;/* raggio del pallone (src/12, SphereGeometry 0,20): sotto, il piede tocca un pallone a terra; sopra il diametro, non puo' */
const f = (x, n = 3) => x == null ? '—' : (+x).toFixed(n);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); let esito = 0; const righe = [];
for (const nome of ['verde', 'rosso']) { if (SOLO && SOLO !== nome) continue; const rosso = nome === 'rosso'; const motivi = [];
  /* A + S: scene forzate, fino a due giri dell'elenco per avere abbastanza scivolate */
  let S = await scene381(b, port, { flags: rosso ? '__CPM_NO_G381A' : '', scene: SCENE }); let r = riassumi381(S);
  if (r.mid < 12 || r.corpi < 2) { const S2 = await scene381(b, port, { flags: rosso ? '__CPM_NO_G381A' : '', scene: SCENE, nome: 'Scivola381b' }); S = { ...S, righe: S.righe.concat(S2.righe.map(x => ['b' + x[0], ...x.slice(1)])), errori: S.errori.concat(S2.errori), giri: S.giri.concat(S2.giri) }; r = riassumi381(S); }
  const T = S.t381 || {};
  console.log(`\n[${nome}] scene: ${S.giri.join(' ')}`);
  for (const k of ['tackle', 'slide-tackle']) { const c = T[k]; console.log(`[${nome}] (A) clip ${k}: ${c ? `corpo intero sopra la posa ferma — prima mediana ${f(c.primaCorpoMed)} massimo ${f(c.primaCorpoMax)} · piede a meta' ${f(c.primaPiedeMez)}${c.riparata ? ` · dopo mediana ${f(c.dopoCorpoMed)} massimo ${f(c.dopoCorpoMax)} piede a meta' ${f(c.dopoPiedeMez)}` : ' · NON riparata'} (altezze-corpo, ${c.chiavi} chiavi)` : 'testimone assente'}`);
    if (!c) { motivi.push(`A non giudicato: testimone __CPM_T381 assente per ${k}`); continue; }
    if (!rosso) { if (!c.riparata) motivi.push(`A: ${k} non riparata`); else { if (c.dopoCorpoMed > 0.02) motivi.push(`A: ${k} corpo mediana ${f(c.dopoCorpoMed)} > 0,02`); if (c.dopoCorpoMax > 0.16) motivi.push(`A: ${k} corpo massimo ${f(c.dopoCorpoMax)} > 0,16`); const rp = RAGGIO / c.alt; if (c.dopoPiedeMez > rp) motivi.push(`A: ${k} piede a meta' ${f(c.dopoPiedeMez)} sopra il raggio del pallone (${f(rp)})`); } }
    else if (c.riparata || c.primaCorpoMed < 0.25 || c.primaPiedeMez <= 2 * RAGGIO / c.alt) motivi.push(`A: il rosso non riproduce su ${k} (riparata ${c.riparata}, mediana ${f(c.primaCorpoMed)})`); }
  console.log(`[${nome}] (S) corpi disegnati in scivolata: ${r.mid} righe a meta' clip da ${r.corpi} scivolate (eroe ${r.eroe}, altri ${r.altri}) · punto piu' basso del corpo: mediana ${f(r.corpoMed)} u · p90 ${f(r.corpoP90)} · massimo ${f(r.corpoMax)} · suola mediana ${f(r.suolaMed)} · piede-pallone piu' vicino per scivolata: mediana ${f(r.contattoMed)} minimo ${f(r.contattoMin)} (${r.contatti})`);
  if (!S.glb) motivi.push('corpi GLB non accesi: non giudicato');
  if (S.errori.length) motivi.push('errori di pagina (scene): ' + S.errori[0]);
  if (T.errore) motivi.push('errore nella riparazione: ' + T.errore);
  if (r.mid < 12 || r.corpi < 2) motivi.push(`S non giudicato: ${r.mid} righe da ${r.corpi} scivolate (servono 12 · 2)`);
  else if (!rosso && r.corpoP90 > 0.10) motivi.push(`S: p90 del corpo ${f(r.corpoP90)} u > 0,10`);
  else if (rosso && r.corpoMed < 0.35) motivi.push(`S: il rosso non riproduce (mediana ${f(r.corpoMed)} u, attesa >= 0,35)`);
  /* F: la fila */
  const F = await fila381(b, port, rosso ? '__CPM_NO_G381B' : '');
  const anim = F.corpi.filter(c => c.n > 0), jog = anim.filter(c => /(^|,)jog(,|$)/.test(c.clips)), lunghi = anim.filter(c => c.maxSt > 1.5), moltoLunghi = anim.filter(c => c.maxSt >= 3);
  const peggiore = anim.reduce((m, c) => (!m || c.maxSt > m.maxSt) ? c : m, null);
  console.log(`[${nome}] (F) walkout ${F.visto ? 'visto' : 'NON visto'} · corpi animati ${anim.length} · con clip jog ${jog.length} · locomozione da fermo oltre 1,5 s: ${lunghi.length} corpi (oltre 3 s: ${moltoLunghi.length}) · striscia piu' lunga ${peggiore ? f(peggiore.maxSt, 2) + ' s (#' + peggiore.id + (peggiore.maxStSch ? ', a schermo' : '') + ')' : '—'}`);
  if (F.errori.length) motivi.push('errori di pagina (fila): ' + F.errori[0]);
  if (!F.visto || anim.length < 40) motivi.push(`F non giudicato: walkout ${F.visto}, ${anim.length} corpi animati (servono 40)`);
  else if (!rosso) { if (jog.length) motivi.push(`F: ${jog.length} corpi con la clip jog`); if (lunghi.length) motivi.push(`F: ${lunghi.length} corpi con locomozione da fermo oltre 1,5 s`); }
  else if (moltoLunghi.length < 5) motivi.push(`F: il rosso non riproduce (${moltoLunghi.length} corpi oltre 3 s, attesi >= 5)`);
  /* braccio e motivo stampati per ultimi */
  righe.push(motivi.length ? `✗ braccio ${nome}: ${motivi.join(' · ')}` : `✓ braccio ${nome}: ${rosso ? 'scivolate a mezz\'aria e corsa da fermi si riproducono senza le riparazioni' : 'scivolate sul prato, nessuno corre da fermo nella fila'}`);
  if (motivi.length) esito = 1; }
console.log('\n' + righe.join('\n')); console.log(esito ? '\n❌ scivolate-381 ROSSO' : '\n✅ scivolate-381 VERDE (verde + rosso)');
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(esito), 200);
