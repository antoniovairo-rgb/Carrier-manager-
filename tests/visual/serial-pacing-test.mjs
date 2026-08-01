#!/usr/bin/env node
/* [7.279.0 collaudo PO «è normale chiudere il capitolo a campionato decisamente in corso» — screenshot:
   «La corsa al capocannoniere · PUNTATA 3 DI 3 · Il duello si chiude qui» alla W.22 di 38]
   GUARDIANO del RITMO delle serie settimanali. Il difetto misurato: le puntate distavano due settimane
   l'una dall'altra e nient'altro, quindi una serie da tre episodi avviata alla 18ª si chiudeva alla 22ª,
   con sedici giornate ancora da giocare e un epilogo che parla al passato.
   Le serie il cui verdetto è di FINE stagione dichiarano `finW`. Asserzioni:
   (1) l'ultima puntata di quelle serie non esce mai prima di `finW` (salvo la chiusura forzata pre-rollover);
   (2) le puntate di mezzo si distribuiscono nell'intervallo invece di ammassarsi (l'arco copre buona parte
       della stagione);
   (3) ogni serie arriva comunque all'epilogo entro il rollover — nessun arco appeso;
   (4) le serie senza `finW` (un caso disciplinare si chiude quando si chiude) restano libere.
   Il motore è puro: lo si estrae dal sorgente e lo si fa girare su una stagione simulata, settimana per
   settimana, senza browser.
   Uso: node serial-pacing-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const issues = [];

// ── estrazione del motore: SERIAL_MAXW + SERIALS + serialView
const i0 = src.indexOf('const SERIAL_MAXW=');
const iEnd = src.indexOf('}catch(_e){return null;}};', src.indexOf('const serialView=(p)=>{try{'));
if (i0 < 0 || iEnd < 0) { console.log('❌ FAIL — motore delle serie non trovato nel sorgente'); process.exit(1); }
const body = src.slice(i0, iEnd + '}catch(_e){return null;}};'.length);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hashStr = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; } return h; };
const staffNames = () => ({ ds: 'Il direttore sportivo' });
const generateLeagueScorers = () => ([{ name: 'Victor Schmidt', goals: 19 }, { name: 'Altro', goals: 15 }]);
const leagueGoalsOf = (p) => p.goals || 0;
const { SERIALS, serialView, SERIAL_MAXW } = new Function('clamp', 'hashStr', 'staffNames', 'generateLeagueScorers', 'leagueGoalsOf',
  body + '\nreturn {SERIALS,serialView,SERIAL_MAXW};')(clamp, hashStr, staffNames, generateLeagueScorers, leagueGoalsOf);

// ── una stagione simulata: ogni settimana si guarda la dashboard e si risolve la puntata offerta
const runSeason = (base, label) => {
  let p = { ...base };
  const seen = [];
  for (let wk = 1; wk <= 38; wk++) {
    p = { ...p, week: wk };
    const sv = serialView(p);
    if (!sv) continue;
    seen.push({ wk, k: sv.k, ep: sv.ep, tot: sv.tot, last: sv.last, t: sv.t });
    // sceglie sempre la prima opzione, come farebbe un giocatore che va avanti
    const ch = [...((p.serial && p.serial.ch) || []), (sv.choices[0] || {}).c];
    p = sv.last
      ? { ...p, serial: null, serialDone: { ...(p.serialDone || {}), [sv.k]: p.season }, serialSeenSeason: p.season }
      : { ...p, serial: { k: sv.k, ep: sv.ep + 1, s: p.season, w: wk, ch, club: (p.club && p.club.id) || '' } };
  }
  if (seen.length) {
    const k = seen[0].k, fin = seen.filter(x => x.last)[0];
    console.log(`  ${label}: «${SERIALS[k].lab}» → puntate alle W.${seen.map(x => x.wk).join(', W.')}${fin ? ` · epilogo W.${fin.wk}` : ' · NESSUN epilogo'}`);
  } else console.log(`  ${label}: nessuna serie attivata`);
  return seen;
};

const CLUB = { id: 'cel', n: 'FC Celeste', p: 70 };
const base = (x) => ({ proStatus: 'pro', season: 4, name: 'Ritmo Probe', club: CLUB, age: 27, ovr: 78, totalMatches: 150,
  teammates: [{ name: 'Luca Bianchi' }], goals: 14, matchHistory: [], morale: 70, form: 70, coachTrust: 70, teamChemistry: 60, ...x });

console.log('stagioni simulate (una settimana alla volta, sul motore VERO):');
const S = {
  bomber: runSeason(base({ goals: 14, age: 22, totalMatches: 40 }), 'bomber'),           // età bassa: esclude «giovane»
  giovane: runSeason(base({ goals: 2, teammates: [{ name: 'Luca Bianchi' }] }), 'giovane'),
  disciplina: runSeason(base({ goals: 2, age: 22, totalMatches: 40, matchHistory: [{ redCard: true, week: 3 }] }), 'disciplina'),
};

// ── (1) l'epilogo delle serie con verdetto di stagione non cade a campionato in corso
for (const [k, seen] of Object.entries(S)) {
  if (!seen.length) { issues.push(`(1) la serie «${k}» non si è mai attivata: lo scenario non misura nulla`); continue; }
  const fw = SERIALS[seen[0].k].finW || 0;
  const fin = seen.filter(x => x.last)[0];
  if (!fin) { issues.push(`(3) «${seen[0].k}» resta appesa: nessun epilogo entro la W.38`); continue; }
  if (fw && fin.wk < fw) issues.push(`(1) «${seen[0].k}»: epilogo alla W.${fin.wk}, prima della volata (attesa ≥ W.${fw})`);
}

// ── (2) l'arco copre la stagione invece di bruciarsi in un mese
for (const k of ['bomber', 'giovane']) {
  const seen = S[k]; if (seen.length < 2) continue;
  const span = seen[seen.length - 1].wk - seen[0].wk;
  console.log(`(2) «${k}» — arco di ${span} settimane (${seen.length} puntate)`);
  if (span < 10) issues.push(`(2) «${k}»: l'arco dura solo ${span} settimane, le puntate si ammassano`);
}

// ── (4) una serie senza verdetto di stagione resta libera di chiudersi quando vuole
{
  const seen = S.disciplina;
  if (seen.length && (SERIALS[seen[0].k].finW || 0) === 0) {
    const fin = seen.filter(x => x.last)[0];
    console.log(`(4) «${seen[0].k}» — nessun vincolo di volata, epilogo W.${fin ? fin.wk : '—'} (corretto: il caso si chiude quando si chiude)`);
  }
}

if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — le serie che raccontano una stagione la chiudono alla fine, non a metà');
