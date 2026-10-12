#!/usr/bin/env node
/* [collaudatrice, giro 8 — PO-227 residuo su 7.999.160] SOLA OSSERVAZIONE: nessuna modifica al gioco.
   Legge la scena con due aggiunte di sola lettura nel browser:
   - THREE.AnimationMixer: sottoclasse che registra, per ogni corpo, lo stack di creazione (chi lo ha costruito),
     le clip, la scala e, a ogni update, posizione del root, velocita' (spostamento / dt di scena), pesi jog/idle;
   - THREE.WebGLRenderer.render: memorizza scena e camera per il test di inquadratura.
   Per corpo: "visibile" = visible di root e di TUTTI gli antenati; "in inquadratura" = punto del root dentro il frustum.
   "Fermo" = velocita' < 0,5 u/s su dt > 0 (stessa soglia di fila-227). Il corpo conta come «corsa da fermo» se
   jog > 0,3 mentre e' fermo, visibile e in inquadratura.
   Uso (da repo root, con il browser di sistema): CPM_CHROME=/opt/pw-browsers/chromium node docs/collaudi/sonde/po227-residuo-160.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../../../tests/visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const save = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures/save-194-primavera-w38.json'), 'utf8'));

const INIT = () => {
  const P = (window.__P227 = { mixers: [], cam: null, scene: null, sceneCount: 0 });
  const tick = setInterval(() => {
    const T = window.THREE;
    if (!T || !T.AnimationMixer || !T.WebGLRenderer || T.__p227) return;
    T.__p227 = 1; clearInterval(tick);
    const Orig = T.AnimationMixer;
    T.AnimationMixer = class extends Orig {
      constructor(root) {
        super(root);
        const st = (new Error().stack || '').split('\n').slice(2, 16).map(s => s.trim().replace(/^at /, '').split(' ')[0]);
        this.__p = { stack: st, n: 0, visN: 0, visFr: 0, dtS: 0, fermi: 0, fermiVis: 0, fermiVisFr: 0, jogFermiVisFr: 0, jogFermiAny: 0, jogAnyVis: 0, last: null };
        P.mixers.push(this);
      }
      update(dt) {
        try {
          const k = this.__p, r = this._root;
          if (k && r) {
            const v = new T.Vector3(); r.getWorldPosition(v);
            let vis = true; for (let o = r; o; o = o.parent) { if (!o.visible) { vis = false; break; } }
            let inF = false;
            if (P.cam) { const m = new T.Matrix4().multiplyMatrices(P.cam.projectionMatrix, P.cam.matrixWorldInverse); inF = new T.Frustum().setFromProjectionMatrix(m).containsPoint(v); }
            let jw = 0; for (const a of this._actions || []) { const nm = a._clip && a._clip.name; if (nm === 'jog') jw = Math.max(jw, a.getEffectiveWeight()); }
            /* nomi clip e antenati SUBITO al primo update: a fine walkout _actions puo' essere svuotato dalla dispose */
            if (!k.names) {
              k.names = (this._actions || []).map(a => a._clip && a._clip.name).filter(Boolean);
              k.anc = []; for (let o = r; o && k.anc.length < 6; o = o.parent) k.anc.push(`${o.type}${o.name ? ':' + o.name : ''}${o.visible ? '' : '(HIDDEN)'}`);
              k.scaleX = +r.scale.x.toFixed(3);
            }
            /* AGGANCIO ALLA SCENA: la radice risale fino a P.scene? Un oggetto staccato non viene disegnato
               anche se visible e in frustum (es. il clone di misura di _passoNaturale7). */
            let top = r; while (top.parent) top = top.parent;
            const agganciato = !!P.scene && top === P.scene;
            k.topTipo = `${top.type}${top.name ? ':' + top.name : ''}`;
            k.n++; if (agganciato) k.aggN = (k.aggN || 0) + 1; if (vis) k.visN++; if (vis && inF) k.visFr++; if (dt > 0) k.dtS += dt;
            if (dt > 0 && k.last) {
              const sp = v.distanceTo(k.last) / dt;
              if (sp < 0.5) { k.fermi++; if (vis) k.fermiVis++; if (vis && inF) { k.fermiVisFr++; if (jw > 0.3) k.jogFermiVisFr++; } if (jw > 0.3) k.jogFermiAny++; }
              if (vis && jw > 0.3) k.jogAnyVis++;
            }
            k.last = v;
          }
        } catch (e) { /* sola osservazione: un errore del probe non tocca il gioco */ }
        return super.update(dt);
      }
    };
    /* three r128: WebGLRenderer.render e' assegnato nel COSTRUTTORE (this.render = ...), non sul prototipo:
       serve una sottoclasse che avvolga l'istanza. (Primo tentativo sul prototipo: scene=0, camera mai letta.) */
    const OR = T.WebGLRenderer;
    T.WebGLRenderer = class extends OR {
      constructor(...a) { super(...a); const oR = this.render; this.render = (scene, cam) => { P.scene = scene; P.cam = cam; P.sceneCount++; return oR.call(this, scene, cam); }; }
    };
  }, 0);
};

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript(INIT);
await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
let visto = false; const t0 = Date.now();
while (Date.now() - t0 < 120000) { await sleep(500); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph !== 'walkout') { if (visto) break; continue; } visto = true; }

const corpi = await page.evaluate(() => {
  const P = window.__P227; const out = [];
  for (const m of P.mixers) {
    const k = m.__p; if (!k || !k.n) continue;
    const nomi = k.names || [];
    const clips = [`idle:${nomi.includes('idle') ? 1 : 0}`, `jog:${nomi.includes('jog') ? 1 : 0}`];
    const scale = k.scaleX != null ? +k.scaleX.toFixed(2) : null;
    const creatori = k.stack.filter(n => /^_[a-zA-Z]|ascot|yper|lod|Lod|ineup|alk|intro|Variant/.test(n)).slice(0, 4);
    out.push({ clips, nomiClip: nomi, scale, creatori, anc: k.anc, topTipo: k.topTipo, agganciatoN: k.aggN || 0, n: k.n, visN: k.visN, visFr: k.visFr, dtS: +k.dtS.toFixed(2), fermi: k.fermi, fermiVis: k.fermiVis, fermiVisFr: k.fermiVisFr, jogFermiVisFr: k.jogFermiVisFr, jogFermiAny: k.jogFermiAny, jogAnyVis: k.jogAnyVis, stackTop: k.stack.slice(0, 8) });
  }
  return { visto: true, corpi: out, scene: P.sceneCount, mixers: P.mixers.length };
});
const rec = { visto, ...corpi, versione: await page.evaluate(() => window.GAME_VERSION || (typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null)) };
fs.mkdirSync(path.join(HERE, '..', 'PO227-dati'), { recursive: true });
fs.writeFileSync(path.join(HERE, '..', 'PO227-dati', 'po227-residuo-160.json'), JSON.stringify(rec, null, 1));

/* riepilogo per gruppo (clip + scala + creatore) */
const gruppi = new Map();
for (const c of rec.corpi) {
  const key = `${c.creatori.slice(0, 2).join('>') || '(creatore non riconosciuto)'} | scala ${c.scale} | ${c.clips.join(' ')}`;
  const g = gruppi.get(key) || { key, corpi: 0, visN: 0, visFr: 0, n: 0, fermiVis: 0, fermiVisFr: 0, jogFermiVisFr: 0, jogAnyVis: 0 };
  g.corpi++; g.visN += c.visN; g.visFr += c.visFr; g.n += c.n; g.fermiVis += c.fermiVis; g.fermiVisFr += c.fermiVisFr; g.jogFermiVisFr += c.jogFermiVisFr; g.jogAnyVis += c.jogAnyVis; gruppi.set(key, g);
}
console.log(`mixer registrati: ${rec.mixers} · render intercettati: ${rec.scene} · versione: ${rec.versione}`);
console.log('corpi | update visibili / in quadro / totali | fermi visibili / fermi visibili in quadro | fermi visibili in quadro con jog>0,3 | gruppo');
for (const g of gruppi.values()) console.log(`${g.corpi} | ${g.visN} / ${g.visFr} / ${g.n} | ${g.fermiVis} / ${g.fermiVisFr} | ${g.jogFermiVisFr} | ${g.key}`);
await b.close(); srv.close();
