/* [giro 170b PO-367] STRUMENTO DI MISURA DEI GESTI NEGLI HIGHLIGHT — sola lettura, NON guardiano, non tocca src/.

   COSA AGGIUNGE AI BANCHI ESISTENTI (banco-highlight-248, scena-252):
   1) TEMPO VIRTUALE. L'orologio della pagina e' quello finto di Playwright (page.clock): la sonda fa avanzare il tempo a passi e
      ogni fotogramma del gioco vale 1/60 s di SCENA (flag gia' nel gioco: __CPM_DT60). Senza, in headless GLB acceso il passo di
      scena e' tappato a 0,05 s e la risoluzione di ogni misura di sincronia sarebbe ±50 ms. Qui e' ±16,7 ms e ripetibile.
   2) LE OSSA. Il gioco non espone lo scheletro; la sonda aggancia THREE.WebGLRenderer.prototype.render NELLA SUA PAGINA (come
      scena-252 gia' sostituisce Math.random) e a ogni fotogramma legge le posizioni-mondo di 16 articolazioni dell'eroe, del
      portiere avversario e il bacino di tutti i corpi visibili. Nessuna scrittura sullo stato del gioco.

   Per fotogramma: tempo di scena, fase, pallone, 16 articolazioni dell'eroe, gesto GLB (__CPM_GST), numero di archi partiti
   (__CPM_CONT121: il fotogramma in cui il pallone PARTE), bacini degli altri corpi, 6 articolazioni del portiere. */
import { installCdnRoutes, openMatch, sleep } from './harness.mjs';

export const GIUNTI = ['pel', 'chest', 'head', 'shL', 'shR', 'elL', 'elR', 'haL', 'haR', 'hiL', 'hiR', 'knL', 'knR', 'anL', 'anR', 'toL', 'toR'];

export async function pagina170(b, port, { vw = 412, vh = 915, scala = 1, flags = {}, seme = 1 } = {}) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: scala });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 160)));
  await page.clock.install();
  await page.addInitScript(f => {
    window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC229 = 1; window.__CPM_DT60 = 1;
    for (const [k, v] of Object.entries(f.flags)) window[k] = v;
    { let a = f.seme >>> 0; window.__SEME170_RESET = n => { a = n >>> 0; }; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    const RX = { pel: /(Hips|^pelvis)$/i, chest: /(Spine2|^spine_03)$/i, head: /(Head|^head)$/i, shL: /(LeftArm|^upperarm_l)$/i, shR: /(RightArm|^upperarm_r)$/i, elL: /(LeftForeArm|^lowerarm_l)$/i, elR: /(RightForeArm|^lowerarm_r)$/i, haL: /(LeftHand|^hand_l)$/i, haR: /(RightHand|^hand_r)$/i, hiL: /(LeftUpLeg|^thigh_l)$/i, hiR: /(RightUpLeg|^thigh_r)$/i, knL: /(LeftLeg|^calf_l)$/i, knR: /(RightLeg|^calf_r)$/i, anL: /(LeftFoot|^foot_l)$/i, anR: /(RightFoot|^foot_r)$/i, toL: /(LeftToeBase|^ball_l)$/i, toR: /(RightToeBase|^ball_r)$/i };
    const NOMI = Object.keys(RX);
    const G = window.__G170 = { on: false, fr: [], f: 0, chars: [], scan: 0, ossa: null, rend: 0, lastNow: -1 };
    const vis = o => { for (let p = o; p; p = p.parent) if (p.visible === false) return false; return true; };
    const scansiona = scene => {
      const per = new Map();
      scene.traverse(o => { if (!o.isSkinnedMesh || !o.skeleton) return; const bones = o.skeleton.bones || []; const pel = bones.find(x => RX.pel.test(x.name)); if (!pel || per.has(pel.uuid)) return;
        const c = { mesh: o, j: {} }; for (const n of NOMI) c.j[n] = bones.find(x => RX[n].test(x.name)) || null; per.set(pel.uuid, c); });
      G.chars = [...per.values()]; if (!G.ossa && G.chars[0]) G.ossa = (G.chars[0].mesh.skeleton.bones || []).map(x => x.name).slice(0, 90);
    };
    const P = (b, a) => { if (!b) { a.push(null, null, null); return; } const e = b.matrixWorld.elements; a.push(+e[12].toFixed(3), +e[13].toFixed(3), +e[14].toFixed(3)); };
    const campiona = () => {
      G.f++;
      if (!G.on || G.fr.length > 4000) return;
      const p = window.__CPM_PROBE && window.__CPM_PROBE(); if (!p || !p.hero) return;
      const V = G.chars.filter(c => c.j.pel && vis(c.mesh));
      let he = null, hd = 1e9, gk = null, gd = 1e9;
      for (const c of V) { const e = c.j.pel.matrixWorld.elements; const d = Math.hypot(e[12] - p.hero.world.x, e[14] - p.hero.world.z); if (d < hd) { hd = d; he = c; } }
      /* portiere avversario: la sua posizione la dice il gioco (__CPM_GKTL, riga isOpp piu' recente); senza, il corpo piu' vicino alla porta */
      let gp = null; try { const T = window.__CPM_GKTL || []; for (let i = T.length - 1; i >= 0 && i >= T.length - 4; i--) if (T[i].isOpp) { gp = [T[i].gx, T[i].pz]; break; } } catch (e) {}
      for (const c of V) { if (c === he) continue; const e = c.j.pel.matrixWorld.elements; const d = gp ? Math.hypot(e[12] - gp[0], e[14] - gp[1]) : Math.hypot(e[12] - 47, e[14]); if (d < gd) { gd = d; gk = c; } }
      if (gp && gd > 2.5) gk = null;
      const h = []; if (he && hd < 4) for (const n of NOMI) P(he.j[n], h);
      const k = []; if (gk && gd < 14) for (const n of ['pel', 'head', 'haL', 'haR', 'toL', 'toR', 'elL', 'elR', 'chest', 'knL', 'knR']) P(gk.j[n], k);
      const o = []; for (const c of V) { if (c === he) continue; const e = c.j.pel.matrixWorld.elements; o.push(+e[12].toFixed(2), +e[14].toFixed(2)); }
      const g = window.__CPM_GST; const c121 = window.__CPM_CONT121 || [];
      G.fr.push({ f: G.f, ck: typeof window.__CPM_SCENET === 'number' ? +window.__CPM_SCENET.toFixed(4) : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, cut: window.__CPM_CUTLIVE ? (window.__CPM_CUTLIVE() ? 1 : 0) : 0,
        b: p.ball ? [p.ball.world.x, p.ball.world.y, p.ball.world.z] : null, hw: [p.hero.world.x, p.hero.world.z], hd: +hd.toFixed(2), h: h.length ? h : null, k: k.length ? k : null, o,
        g: g ? [g.cur || null, g.w, g.ct, g.cn || null, g.at || null, g.aT, g.ts, g.cdur, g.want || null] : null, na: c121.length, nv: V.length, kg: gp ? 1 : 0 });
    };
    const aggancia = () => { const T = window.THREE; if (!T || !T.Object3D) return false; if (T.Object3D.prototype.__g170) return true;
      /* in Three r128 `render` e' una proprieta' d'istanza: si aggancia Object3D.prototype.updateMatrixWorld, che il renderer chiama sulla scena a ogni fotogramma */
      const orig = T.Object3D.prototype.updateMatrixWorld; T.Object3D.prototype.__g170 = 1;
      T.Object3D.prototype.updateMatrixWorld = function (force) { const r = orig.call(this, force);
        if (this.isScene) { try { const scene = this; if ((G.scan++ % 90) === 0 || !G.chars.length) { let n = 0; scene.traverse(o => { if (o.isSkinnedMesh) n++; }); if (n >= 8) { scansiona(scene); G.main = scene; } }
          if (scene === G.main) { const t = performance.now(); if (t !== G.lastNow) { G.lastNow = t; G.rend++; campiona(); } } } catch (e) { G.err = String(e && e.message).slice(0, 120); } }
        return r; };
      return true; };
    const iv = setInterval(() => { try { if (aggancia()) clearInterval(iv); } catch (e) {} }, 50);
  }, { flags, seme });
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(600);
  for (let i = 0; i < 3; i++) { try { await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1500)); break; } catch (e) { if (i === 2) throw e; } }/* la pagina puo' essere avanti di qualche ms: margine e riprova */
  return page;
}

/* avanza il tempo finto a blocchi (ogni 16,7 ms finti = un fotogramma del gioco) */
export async function avanti(page, ms, blocco = 400) { let r = ms; while (r > 0) { const s = Math.min(blocco, r); await page.clock.runFor(s); r -= s; } }

/* Una scena forzata, esito scelto, seme scelto. Restituisce i fotogrammi dalla risoluzione in poi + i testimoni del gioco. */
export async function scena170(page, { gi, k = 0, out = 'success', kind = null, seme = 1, secondi = 4.5, prima = null, fermaA = null }) {
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; window.__G170.on = false; });
  const tot = await page.evaluate(() => SITUATIONS.length);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (gi + 61) % tot).catch(() => false);
  await avanti(page, 700);
  await page.evaluate(s => window.__SEME170_RESET(s), seme);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { errore: 'forzatura fallita' };
  await avanti(page, 1200);
  await page.evaluate(([o, kd]) => { window.__CPM_FORCE_OUTCOME = o; if (kd) window.__CPM_FORCE_KIND = kd; else delete window.__CPM_FORCE_KIND; }, [out, kind]);
  if (prima) await page.evaluate(prima);
  await page.evaluate(() => { const G = window.__G170; G.fr = []; G.on = true; G.f = 0; window.__CPM_P1B2 = []; window.__CPM_GKTL = []; window.__CPM_CONT121 = []; window.__CPM_PIEDI_REC = 1; window.__CPM_PIEDI_EROE = 1; window.__CPM_PIEDI = null; window.__CPM_GK229 = window.__CPM_GK229 && Array.isArray(window.__CPM_GK229) ? [] : window.__CPM_GK229; });
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { errore: 'risoluzione fallita' };
  if (fermaA != null) { await fermaA(page); }
  else await avanti(page, secondi * 1000);
  const r = await page.evaluate(() => { const G = window.__G170; G.on = false; const P = window.__CPM_P1B2 || []; const cl = {}; for (const x of P) { const kk = x[0] + '/' + x[1]; cl[kk] = (cl[kk] | 0) + 1; }
    const pd = window.__CPM_PIEDI; return { fr: G.fr, clip: cl, c121: (window.__CPM_CONT121 || []).slice(), piedi: pd ? { fr: pd.fr, cont: pd.cont, sk: pd.sk, hl: pd.hl, eroe: pd.eroe || null } : null, gktl: (window.__CPM_GKTL || []).filter(x => x.isOpp).map(x => [x.opp, x.oppT, x.want, x.cur, x.w, x.gx, x.pz, x.py, x.tz, x.bx, x.by, x.bz, x.arcT, x.arcD, x.dvD, x.ct, x.cdur]), err: G.err || null, nchar: G.chars.length, ossa: G.ossa }; });
  return r;
}

export const mediana = a => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
export const pct = (a, q) => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : null; };
