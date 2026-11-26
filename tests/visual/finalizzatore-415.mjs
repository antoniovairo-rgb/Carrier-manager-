#!/usr/bin/env node
/* [giro 415, PO-679 — taccuino PO 7.999.216 «il compagno ha segnato calciando come se fosse spalla alla porta» (Cross a rientrare dalla
   fascia, assist riuscito, codice 000) + bozza «codice 007 la camera salta di 7,2 u fra due fotogrammi a 4,0 s»] — rosso __CPM_NO_G415.
   GUARDIANO «IL FINALIZZATORE DEL CROSS A RIENTRARE CALCIA GUARDANDO LA PORTA, E LA CAMERA NON SALTA».
   Scene costruite dal motore (scenaDalMotoreFascia) che offrono «Cross a rientrare», due lati, due pressioni, 12 semi (misura-415.mjs);
   GLB ACCESO, teatro acceso, pagina nuova ogni 5 scene. Il davanti del corpo e' quello DISEGNATO (perpendicolare a spalle e anche,
   testimone __CPM_FIN415), non la rotazione della mesh logica (che guardava la porta gia' prima: e' li' che il difetto si nascondeva).
   SOGLIE DICHIARATE PRIMA DELLA CORREZIONE (misura prima: contatto 100-178°, mediana 167°, 12/12 oltre 90°):
   VERDE, ogni scena: 1. corpo a non piu' di 35° dalla porta al contatto; 2. mai oltre 60° durante il gesto di conclusione;
          3. nessun salto della camera fuori dallo stacco (regola di misura-364/fasce-364: passo > 40·dt + 2 u di scena);
          4. esito gol col pallone in rete.
   ROSSO: almeno il 75% delle scene col corpo oltre 90° dalla porta al contatto.
   Una scena senza gesto di calcio del compagno, senza fotogrammi o con errore = NON GIUDICATA = rosso. Almeno 8 scene giudicate per braccio.
   Uso: node finalizzatore-415.mjs · CPM_SOLO=verde|rosso */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apri, metriche } from './misura-364.mjs';
import { SCENE415, orient, giocaCutback } from './misura-415.mjs';

async function braccio(b, port, rosso) {
  const rossi = rosso ? ['__CPM_NO_G415'] : []; let pg = await apri(b, port, rossi); const R = []; let n = 0;
  for (const [p, seme] of SCENE415) {
    if (n && n % 5 === 0) { await pg.close(); pg = await apri(b, port, rossi); } n++;
    let run; try { run = await giocaCutback(pg, { occ: p, seme }); } catch (e) { run = { err: String(e && e.message).slice(0, 100) }; try { await pg.close(); } catch (_e) { } pg = await apri(b, port, rossi); }
    const nome = `(${p.join(',')}) s${seme}`;
    if (run.err) { R.push({ nome, ng: run.err }); continue; }
    if (run.errori && run.errori.length) { R.push({ nome, ng: 'errore di pagina: ' + run.errori[0] }); continue; }
    const m = metriche(run), o = orient(run.W);
    if (m.cieco) { R.push({ nome, ng: m.cieco }); continue; }
    if (!o || o.nonKick || o.n < 3) { R.push({ nome, ng: 'nessun gesto di calcio del compagno' + (o && o.g ? ' (' + o.g + ')' : '') }); continue; }
    R.push({ nome, o, m });
  }
  await pg.close(); return R;
}

function giudica(nome, R) {
  const rosso = nome === 'rosso', motivi = []; const V = R.filter(r => !r.ng);
  for (const r of R) { if (r.ng) { console.log(`  ${r.nome}: NON GIUDICATA — ${r.ng}`); motivi.push(`${r.nome} non giudicata (${r.ng})`); continue; }
    const q = [];
    if (r.o.contatto > 35) q.push(`corpo a ${r.o.contatto}° dalla porta al contatto`);
    if (r.o.max > 60) q.push(`corpo fino a ${r.o.max}° nel gesto`);
    if (r.m.saltoCam) q.push(`salto della camera ${r.m.saltoCam.d} u in ${Math.round(r.m.saltoCam.dt * 1000)} ms`);
    if (r.m.kd !== 'goal' || !r.m.inRete) q.push(`esito ${r.m.kd} rete ${r.m.inRete}`);
    r.q = q;
    console.log(`  ${r.nome}: finalizzatore a x ${r.o.x} z ${r.o.z} — contatto ${r.o.contatto}° · max ${r.o.max}° · mesh ${r.o.contattoRy}° · camera ${r.m.saltoCam ? 'SALTO ' + r.m.saltoCam.d + ' u' : 'ok'} · ${r.m.kd}${q.length ? ' → ' + q.join(' · ') : ''}`); }
  if (V.length < 8) motivi.push(`cieco: solo ${V.length} scene giudicate (minimo 8)`);
  const oltre90 = V.filter(r => r.o.contatto > 90).length, med = (() => { const s = V.map(r => r.o.contatto).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; })();
  console.log(`[${nome}] ${V.length} giudicate · corpo oltre 90° al contatto ${oltre90}/${V.length} · mediana al contatto ${med}° · salti di camera ${V.filter(r => r.m.saltoCam).length}`);
  if (!rosso) { const bocc = V.filter(r => r.q.length); if (bocc.length) motivi.push(`${bocc.length} scene bocciate (${bocc.slice(0, 3).map(r => r.nome + ': ' + r.q[0]).join(' · ')})`); }
  else if (oltre90 < 0.75 * V.length) motivi.push(`nel rosso solo ${oltre90}/${V.length} scene oltre 90° (atteso almeno il 75%)`);
  return motivi;
}

async function main() {
  const solo = process.env.CPM_SOLO || ''; let esito = 0;
  const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
  for (const nome of ['verde', 'rosso']) { if (solo && solo !== nome) continue;
    console.log(`\n[${nome}]${nome === 'rosso' ? ' __CPM_NO_G415' : ''}`);
    const motivi = giudica(nome, await braccio(b, port, nome === 'rosso'));
    if (motivi.length) { esito = 1; console.log(`\n❌ finalizzatore-415 [${nome}] ${nome === 'rosso' ? 'NON dimostra il difetto' : 'ROSSO'}: ${motivi.join(' · ')}`); }
    else console.log(nome === 'rosso' ? '\n✅ finalizzatore-415 [rosso __CPM_NO_G415]: senza la correzione il finalizzatore calcia con le spalle alla porta (difetto visto)' : '\n✅ finalizzatore-415 [verde]: il finalizzatore del cross a rientrare calcia guardando la porta e la camera non salta');
  }
  await b.close(); server.close(); process.exit(esito);
}
main().catch(e => { console.error(e); process.exit(1); });
