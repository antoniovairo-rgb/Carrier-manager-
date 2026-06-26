/* CPM — METRICHE COMPORTAMENTALI (Fondazione F0 della direttiva simulation-first).
 *
 * Scopo: dare una MISURA OGGETTIVA della qualità della simulazione (forma squadra,
 * occupazione spazi, compattezza, linee di passaggio, spaziatura) a partire dalle
 * posizioni dei 22 giocatori. Il gate visivo cattura frame congelati e NON valida il
 * movimento; queste metriche danno numeri verificabili su quei frame, senza vedere il 3D.
 *
 * FUNZIONI PURE — nessuna dipendenza, node-testabili (vedi self-test in coda: `node football-metrics.mjs`).
 * Input atteso: array di giocatori {x,y,team,role?,gk?} in coordinate di gioco 0..100
 *   (x = lunghezza campo, casa attacca verso x=100; y = larghezza).
 */

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mean = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
const span = vals => vals.length ? Math.max(...vals) - Math.min(...vals) : 0;

/* Forma di un reparto/squadra: ampiezza (y), profondità (x), baricentro, compattezza. */
export function teamShape(players, team) {
  const out = players.filter(p => p.team === team && !p.gk);
  if (out.length < 2) return null;
  const cx = mean(out.map(p => p.x)), cy = mean(out.map(p => p.y));
  // compattezza = distanza media dal baricentro (più bassa = squadra più stretta)
  const compact = mean(out.map(p => Math.hypot(p.x - cx, p.y - cy)));
  return {
    n: out.length,
    width: +span(out.map(p => p.y)).toFixed(1),   // ampiezza (occupazione larghezza)
    depth: +span(out.map(p => p.x)).toFixed(1),    // profondità (lunghezza occupata)
    centroidX: +cx.toFixed(1),
    centroidY: +cy.toFixed(1),
    compactness: +compact.toFixed(1),
  };
}

/* Spaziatura: distanza minima tra qualunque coppia (stacking se molto bassa) e densità
 * (n. di coppie entro 6u). Su TUTTI i 22 di default, o su una squadra se `team` dato. */
export function spacing(players, team) {
  const ps = team ? players.filter(p => p.team === team) : players;
  let min = Infinity, clusters = 0, pairs = 0;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const d = dist(ps[i], ps[j]); pairs++;
    if (d < min) min = d;
    if (d < 6) clusters++;
  }
  return { minDist: isFinite(min) ? +min.toFixed(2) : null, closePairs: clusters, pairs };
}

/* Pressione sul portatore: distanza dal più vicino avversario. */
export function nearestOpponent(carrier, players, carrierTeam) {
  const opp = players.filter(p => p.team && p.team !== carrierTeam);
  if (!opp.length) return null;
  return +Math.min(...opp.map(p => dist(carrier, p))).toFixed(2);
}

/* Linee di passaggio dal portatore: compagni "serviti" da un corridoio libero — nessun
 * avversario entro `corridor` (default 4u) dalla retta portatore→compagno, e compagno
 * più avanti del portatore (verso x=100 per la casa). Misura semplice e deterministica. */
export function passingLanes(carrier, players, team, corridor = 4) {
  const mates = players.filter(p => p.team === team && p !== carrier && !p.gk);
  const opp = players.filter(p => p.team && p.team !== team);
  let open = 0;
  for (const m of mates) {
    if (m.x <= carrier.x + 1) continue; // solo opzioni in avanti
    const vx = m.x - carrier.x, vy = m.y - carrier.y, len = Math.hypot(vx, vy) || 1;
    const blocked = opp.some(o => {
      const t = ((o.x - carrier.x) * vx + (o.y - carrier.y) * vy) / (len * len);
      if (t <= 0 || t >= 1) return false; // proiezione fuori dal segmento
      const px = carrier.x + t * vx, py = carrier.y + t * vy;
      return Math.hypot(o.x - px, o.y - py) < corridor;
    });
    if (!blocked) open++;
  }
  return open;
}

/* Snapshot completo da uno stato __CPM_STATE-like {players:[...], hero, ball}. */
export function snapshotMetrics(state) {
  const everyone = (state.players || []).concat(state.hero ? [Object.assign({ team: 'home' }, state.hero)] : []);
  const heroTeam = 'home';
  const carrier = state.hero || null;
  return {
    home: teamShape(everyone, 'home'),
    away: teamShape(everyone, 'away'),
    spacingAll: spacing(everyone),
    heroPressure: carrier ? nearestOpponent(carrier, everyone, heroTeam) : null,
    heroLanes: carrier ? passingLanes(carrier, everyone, heroTeam) : null,
  };
}

/* Euristiche di "config degenere" — segnalazioni (non FAIL): la simulazione è povera se
 * la squadra è troppo schiacciata, troppo larga, o impilata. Soglie larghe (solo casi netti). */
export function flagDegenerate(m) {
  const warns = [];
  for (const side of ['home', 'away']) {
    const t = m[side]; if (!t) continue;
    if (t.width < 8) warns.push(`${side}: ampiezza ${t.width}u troppo bassa (squadra a imbuto)`);
    if (t.width > 75) warns.push(`${side}: ampiezza ${t.width}u eccessiva (squadra slabbrata)`);
    if (t.compactness < 6) warns.push(`${side}: compattezza ${t.compactness}u (giocatori ammucchiati)`);
  }
  if (m.spacingAll && m.spacingAll.minDist != null && m.spacingAll.minDist < 0.5)
    warns.push(`stacking: coppia a ${m.spacingAll.minDist}u`);
  return warns;
}

/* ---------------- SELF-TEST (node football-metrics.mjs) ---------------- */
if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('football-metrics.mjs'))) {
  // formazione 4-4-2 plausibile (casa) + speculare (away) — sanity check numerico
  const mk = (team, xs) => xs.map(([x, y, role, gk]) => ({ x, y, team, role: role || 'out', gk: !!gk }));
  const home = mk('home', [[5, 50, 'gk', true], [20, 20], [20, 40], [20, 60], [20, 80], [45, 20], [45, 40], [45, 60], [45, 80], [70, 38], [70, 62]]);
  const away = mk('away', [[95, 50, 'gk', true], [80, 20], [80, 40], [80, 60], [80, 80], [55, 20], [55, 40], [55, 60], [55, 80], [30, 38], [30, 62]]);
  const state = { players: home.concat(away), hero: { x: 60, y: 50 }, ball: { x: 60, y: 50 } };
  const m = snapshotMetrics(state);
  console.log('home shape :', JSON.stringify(m.home));
  console.log('away shape :', JSON.stringify(m.away));
  console.log('spacing    :', JSON.stringify(m.spacingAll));
  console.log('hero press :', m.heroPressure, ' lanes:', m.heroLanes);
  console.log('degenere   :', JSON.stringify(flagDegenerate(m)));
  // asserzioni minime
  const ok = m.home.width > 50 && m.home.depth > 40 && m.spacingAll.minDist > 5 && m.heroLanes >= 0;
  console.log(ok ? '\nSELF-TEST OK' : '\nSELF-TEST FALLITO');
  process.exit(ok ? 0 : 1);
}
