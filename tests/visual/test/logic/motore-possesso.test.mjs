/* TEST LOGIC — IL MOTORE DEL POSSESSO (creaMotorePossesso, src/14-motore-possesso.jsx) — 7.870.
   Il motore e' JavaScript puro e deterministico (seme): si collauda in node senza browser.
   Qui si giudicano gli INVARIANTI strutturali della simulazione ambientale, non il gusto:
   - un pallone, un padrone: in tenuta la palla sta ai piedi dell'uomo nominato (<=3u, sempre);
   - nessun teletrasporto: i ventidue fanno passi umani (in minuti di gioco: <=12u per tick);
   - il gol decretato dal microsim viene SEMPRE costruito e segnato, entro un tetto di tick;
   - determinismo: stesso seme, stessa partita;
   - la scena ferma il motore e la ripresa lo riavvia dove la scena ha lasciato il pallone;
   - l'eroe in panchina non tocca mai il pallone. */
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../../lib/harness.mjs';

function loadMotore() {
  const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const i = src.indexOf('/* CMAV-SRC-HEADER-END */');
  assert.ok(i >= 0, 'sentinella del frammento non trovata');
  const code = src.slice(i + '/* CMAV-SRC-HEADER-END */'.length);
  // eslint-disable-next-line no-new-func
  return Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, undefined);
}
const crea = loadMotore();
const giocatori = () => {
  const h = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));
  const a = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));
  return h.concat(a);
};
const nuovo = (seed, extra) => crea(Object.assign({ seed, giocatori: giocatori(), eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 74 }, forza: { home: 70, away: 66 } }, extra || {}));
const partita = (seed, ticks = 92, onTick) => { const m = nuovo(seed); const evs = []; for (let t = 1; t <= ticks; t++) { if (onTick) onTick(m, t); for (const e of m.tick({ min: t })) evs.push(e); } return { m, evs }; };

test('determinismo: stesso seme, stessa sequenza di fatti', () => {
  const a = partita(4242).evs.map(e => e.t + ':' + (e.chi && e.chi.i) + ':' + (e.a && e.a.i)).join('|');
  const b = partita(4242).evs.map(e => e.t + ':' + (e.chi && e.chi.i) + ':' + (e.a && e.a.i)).join('|');
  assert.strictEqual(a, b);
  const c = partita(4243).evs.map(e => e.t).join('|');
  assert.notStrictEqual(a, c, 'semi diversi devono dare partite diverse');
});

test('un pallone, un padrone: in tenuta la palla sta ai piedi (<=3u) e i passi sono umani', () => {
  let tenuta = 0, vicino = 0, stepMax = 0, ticks = 0, conPadrone = 0;
  for (const seed of [11, 22, 33, 44, 55]) {
    const m = nuovo(seed); let prev = m.stato().gioc;
    for (let t = 1; t <= 92; t++) {
      m.tick({ min: t }); const st = m.stato(); ticks++;
      if (st.poss.stato === 'tenuta') { tenuta++; const q = st.poss.padrone === 21 ? st.eroe : st.gioc[st.poss.padrone]; if (Math.hypot(q.x - st.palla.x, q.y - st.palla.y) <= 3) vicino++; }
      if (st.poss.stato === 'tenuta' || st.poss.stato === 'fermo' || st.poss.stato === 'kickoff' || st.poss.stato === 'rete') conPadrone++;
      st.gioc.forEach((q, i) => { const d = Math.hypot(q.x - prev[i].x, q.y - prev[i].y); if (d > stepMax) stepMax = d; }); prev = st.gioc;
    }
  }
  assert.strictEqual(vicino, tenuta, 'in tenuta il pallone e\' SEMPRE ai piedi del padrone');
  assert.ok(tenuta / ticks >= 0.42, `tenuta ${Math.round(100 * tenuta / ticks)}% (<42)`);
  assert.ok(conPadrone / ticks >= 0.60, `pallone con un padrone o fermo su un punto: ${Math.round(100 * conPadrone / ticks)}% (<60)`);
  assert.ok(stepMax <= 12, `passo massimo dei ventidue ${stepMax.toFixed(1)}u (>12)`);
});

test('il gol decretato viene costruito e segnato entro 16 tick', () => {
  let decreti = 0, segnati = 0, attesaMax = 0;
  for (const seed of [101, 202, 303, 404, 505, 606]) {
    const m = nuovo(seed); let pend = null;
    for (let t = 1; t <= 120; t++) {
      if (!pend && (t === 8 || t === 40 || t === 75)) { const lato = (t + seed) % 2 ? 'home' : 'away'; m.chiedi.gol(lato); pend = { lato, t0: t }; decreti++; }
      const evs = m.tick({ min: t });
      for (const e of evs) { if (e.t === 'gol') { assert.ok(pend && e.lato === pend.lato, 'un gol senza decreto (o del lato sbagliato)'); segnati++; attesaMax = Math.max(attesaMax, t - pend.t0); pend = null; } }
    }
  }
  assert.strictEqual(segnati, decreti, `decreti ${decreti} segnati ${segnati}`);
  assert.ok(attesaMax <= 16, `attesa massima ${attesaMax} tick (>16)`);
});

test('senza decreto non si segna mai: il punteggio e\' del microsim', () => {
  for (const seed of [7, 8, 9, 10]) { const { evs } = partita(seed, 120); assert.strictEqual(evs.filter(e => e.t === 'gol').length, 0); }
});

test('una partita ha passaggi, conduzioni, tiri e palle morte in misura credibile', () => {
  const tot = { passaggio: 0, conduzione: 0, tiro: 0, fermi: 0 };
  const N = 8;
  for (let s = 0; s < N; s++) { const { evs } = partita(900 + s); for (const e of evs) { if (tot[e.t] != null) tot[e.t]++; if (/^(fallo|rigore|rimessa|corner|rinvio)$/.test(e.t)) tot.fermi++; } }
  assert.ok(tot.passaggio / N >= 12, `passaggi a partita ${(tot.passaggio / N).toFixed(1)} (<12)`);
  assert.ok(tot.conduzione / N >= 3, `conduzioni a partita ${(tot.conduzione / N).toFixed(1)} (<3)`);
  assert.ok(tot.tiro / N >= 2.5, `tiri a partita ${(tot.tiro / N).toFixed(1)} (<2,5)`);
  assert.ok(tot.fermi / N >= 1.5, `palle morte a partita ${(tot.fermi / N).toFixed(1)} (<1,5)`);
});

test('i fatti portano nomi veri e luoghi veri', () => {
  const { evs } = partita(77);
  for (const e of evs.filter(x => x.t === 'passaggio')) { assert.ok(e.da && e.a && e.da.nome && e.a.nome, 'passaggio senza nomi'); assert.ok(e.from && e.to && e.to.x >= 0 && e.to.x <= 100, 'passaggio senza luogo'); assert.notStrictEqual(e.da.i, e.a.i); }
  for (const e of evs.filter(x => x.t === 'tiro')) assert.ok(e.chi && e.chi.nome && /^(area|limite|trequarti|centro|dietro)$/.test(e.zona));
});

test('la scena ferma il motore; la ripresa riparte dal punto e dal lato chiesti', () => {
  const m = nuovo(31); for (let t = 1; t <= 10; t++) m.tick({ min: t });
  m.chiedi.scena(); const prima = JSON.stringify(m.stato().gioc);
  assert.deepStrictEqual(m.tick({ min: 11 }), []); assert.strictEqual(JSON.stringify(m.stato().gioc), prima, 'in scena i ventidue non si muovono');
  m.chiedi.riprendi({ x: 70, y: 40, lato: 'away' }); const st = m.stato();
  assert.strictEqual(st.scena, false); assert.strictEqual(st.poss.lato, 'away');
  assert.ok(Math.hypot(st.palla.x - 70, st.palla.y - 40) <= 1, 'la palla riparte dal punto della scena');
  m.chiedi.riprendi({ centro: true, lato: 'home' }); assert.strictEqual(m.stato().poss.stato, 'kickoff');
});

test('l\'eroe in panchina non tocca mai il pallone', () => {
  const m = nuovo(64, { eroe: { name: 'EROE', x: 58, y: 50, attivo: false } });
  for (let t = 1; t <= 92; t++) { for (const e of m.tick({ min: t })) { assert.ok(!(e.chi && e.chi.eroe) && !(e.a && e.a.eroe) && !(e.da && e.da.eroe), 'eroe in panchina nominato: ' + e.t); } const st = m.stato(); assert.notStrictEqual(st.poss.padrone, 21); }
});
