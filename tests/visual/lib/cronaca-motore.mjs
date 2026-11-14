/* [giro 167 PO-362] RACCOLTA COMUNE DEI GUARDIANI DELLA CRONACA A MOTORE ACCESO.
   Una partita VERA (provino, autoplay seminato) giocata fino al FISCHIO (evento, non tempo), su pagina nuova e con un nome
   proprio (il seme di partita nasce anche dal nome, 7.496). Raccoglie, tutto alla SORGENTE:
     · ticks  — lo stato del motore dopo OGNI battito (minuto e sotto-tick): si avvolge `tick` dell'oggetto motore
                (`__CPM_MOTORE_OBJ`), quindi il campione e' il passo della simulazione e non lo scheduler della sonda;
     · b2d    — il pallone che il giocatore VEDE in gioco fluido, fotogramma per fotogramma (testimone `__CPM_B2D167`
                nel Campo2D: dal 7.917 in `playing` il 3D e' sospeso e sopra c'e' il campo dall'alto);
     · nar    — ogni riga del narratore `narra870` nell'istante in cui esce, col pallone del motore accanto (`__CPM_NAR167`);
     · ev     — le righe `chronicle` del registro (raccolte a mano a mano: l'anello e' da 400 voci).
   SABOTAGGI DAL BANCO (solo bracci rossi, precedente: il banco di prova dei guardiani grafici, «tema unico»): rompono
   davvero il comportamento che il guardiano sorveglia, dal test e senza toccare il gioco:
     · 'palla-dimenticata' — durante la tenuta il pallone del motore resta dove il portatore l'ha ricevuto (il portatore va
                             avanti, il pallone no): e' la classe «pallone fermo senza ragione» di ball-alive;
     · 'rotta-ballerina'   — a ogni battito di tenuta il portatore (e il pallone ai suoi piedi) riceve uno scarto laterale
                             casuale: e' il random-walk del 7.511 che la trama del 7.524 aveva tolto;
     · 'pallone-visto-fermo' — il pallone che il motore CONSEGNA alla vista (`stato().palla`) resta dove la squadra ha preso il
                             possesso finche' il possesso non cambia lato: la simulazione gira intatta, e' cio' che si vede che
                             si ferma — la classe del 7.510 («il pallone lo muove solo l'evento»);
     · 'fatto-inventato'   — a un battito di minuto su tre il motore consegna al narratore un TIRO dal limite che non e' mai
                             avvenuto (non compare fra i fatti veri registrati): e' «un sistema che inventa cio' che succede». */
import { openMatch, sleep, matchPhase, installCdnRoutes } from './harness.mjs';

export async function giocaPartita(b, port, { nome, seed = 424, sabotaggio = null, flags = [], speed = '2', tetto = 1800000, stallo = 240000, viewport = { width: 412, height: 915 } } = {}) {
  const page = await b.newPage({ viewport });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(([fl, sab, sp]) => {
    window.__CPM_GLB = false; window.__CPM_B2D167 = []; window.__CPM_NAR167 = []; window.__T167 = []; window.__F167 = [];
    for (const f of fl) window[f] = 1;
    try { localStorage.setItem('cpm-match-speed', sp); } catch (e) {}
    const rnd = (() => { let s = 167167; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    setInterval(() => { try {
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || M.__w167) return; M.__w167 = 1;
      const orig = M.tick, origSt = M.stato; let fermo = null, pad = null, vf = null, vfL = null, nb = 0;
      if (sab === 'pallone-visto-fermo') M.stato = function () { const st = origSt.apply(this, arguments); try { const L = st.poss && st.poss.lato; if (!vf || L !== vfL) { vfL = L; vf = { x: st.palla.x, y: st.palla.y }; } return { ...st, palla: { x: vf.x, y: vf.y } }; } catch (e) { return st; } };
      M.tick = function (ctx) {
        let out = orig.apply(this, arguments);
        try {
          const S = M._S, g = M._g;
          const F = window.__F167; if (F && F.length < 30000) for (const e of (out || [])) { if (!e) continue; const nm = (c) => (c && c.nome) ? String(c.nome) : (c && c.eroe ? '{P}' : null); F.push({ t: Math.round(performance.now()), min: ctx && ctx.min, k: e.t, n: [nm(e.chi), nm(e.da), nm(e.a), nm(e.su), nm(e.gk), nm(e.assist)].filter(Boolean) }); }
          if (sab === 'fatto-inventato' && ctx && ctx.dec && (++nb % 3 === 0)) { const P = g.find(p => p && !p.gk && p.team === S.poss.lato) || g[1]; out = (out || []).concat([{ t: 'tiro', chi: { nome: 'Inventato', team: P.team, i: P.i }, zona: 'limite', intent: 'shot', from: { x: S.palla.x, y: S.palla.y }, to: { x: P.team === 'home' ? 100 : 0, y: 50 }, esito: 'wide', lato: P.team }]); }
          if (sab === 'palla-dimenticata') {
            if (S.poss.stato === 'tenuta' && S.poss.padrone != null) { if (pad !== S.poss.padrone || !fermo) { pad = S.poss.padrone; fermo = { x: S.palla.x, y: S.palla.y }; } S.palla.x = fermo.x; S.palla.y = fermo.y; }
            else { pad = null; fermo = null; }
          } else if (sab === 'rotta-ballerina') {
            if (S.poss.stato === 'tenuta' && S.poss.padrone != null && g[S.poss.padrone]) { const P = g[S.poss.padrone]; const j = (rnd() - 0.5) * 6;
              P.y = Math.max(4, Math.min(96, P.y + j)); P.x = Math.max(3, Math.min(97, P.x + (rnd() - 0.5) * 3)); S.palla.y = P.y; S.palla.x = Math.max(0, Math.min(100, P.x + (P.team === 'home' ? 0.5 : -0.5))); }
          }
          const T = window.__T167; if (T.length < 20000) T.push({ t: Math.round(performance.now()), min: ctx && ctx.min, dec: !!(ctx && ctx.dec), ph: window.__CPM_PHASE && window.__CPM_PHASE(),
            x: +S.palla.x.toFixed(2), y: +S.palla.y.toFixed(2), st: S.poss.stato, pad: S.poss.padrone, lato: S.poss.lato, sc: S.scena ? 1 : 0, cond: S.cond ? 1 : 0 });
        } catch (e) {}
        return out;
      };
    } catch (e) {} }, 50);
  }, [flags, sabotaggio, speed]);
  let fine = 'tetto', ev = [], ultimo = -1, minMax = 0;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: nome });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), seed);
    const t0 = Date.now(); let prog = '', tProg = t0;
    while (Date.now() - t0 < tetto) {
      await sleep(700);
      const ph = await matchPhase(page);
      const nuove = await page.evaluate(u => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle' && e.ts > u), ultimo).catch(() => []);
      for (const e of nuove) { ev.push(e); ultimo = Math.max(ultimo, e.ts); }
      const m = await page.evaluate(() => window.__CPM_CLOCK ? window.__CPM_CLOCK() : null).catch(() => null);
      if (m > minMax) minMax = m;
      if (ph === 'ended' || ph === 'ceremony') { fine = 'fischio'; break; }
      const k = ph + '|' + m; if (k !== prog) { prog = k; tProg = Date.now(); } else if (Date.now() - tProg > stallo) { fine = 'stallo'; break; }
    }
  } catch (e) { errs.push('eccezione: ' + String(e && e.message || e).slice(0, 120)); }
  const raw = await page.evaluate(() => ({ ticks: window.__T167 || [], b2d: window.__CPM_B2D167 || [], nar: window.__CPM_NAR167 || [], fatti: window.__F167 || [] })).catch(() => ({ ticks: [], b2d: [], nar: [], fatti: [] }));
  await page.close().catch(() => {});
  return { nome, fine, minMax, errs, ev, ...raw };
}

/* distanza in METRI fra un punto e un segmento (campo 105x68, unita' 0-100), come partita2d-151 */
export function distM(p, a, c) {
  const ax = a.x * 1.05, ay = a.y * 0.68, px = p.x * 1.05, py = p.y * 0.68;
  if (!c) return Math.hypot(px - ax, py - ay);
  const cx = c.x * 1.05, cy = c.y * 0.68, dx = cx - ax, dy = cy - ay, L = dx * dx + dy * dy;
  let u = L > 0 ? ((px - ax) * dx + (py - ay) * dy) / L : 0; u = Math.max(0, Math.min(1, u));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
}
