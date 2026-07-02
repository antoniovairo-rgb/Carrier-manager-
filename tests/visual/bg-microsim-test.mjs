/* Test bgMicroTick (5.77.0 · MOT-1): baseline statistica del micro-simulatore di sfondo.
   Verifica che i gol BG per squadra/partita siano in range calcistico, che scalino col divario di
   prestigio e col momentum, e che il sim sia DETERMINISTICO (stesso seed → stessi eventi). */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

const res = await page.evaluate(() => {
  const f = window.bgMicroTick;
  if (typeof f !== 'function') return { err: 'bgMicroTick non esposta' };
  const simMatch = (seed, hp, ap, mom, pos, ovr) => {
    let h = 0, a = 0;
    for (let m = 1; m <= 90; m++) {
      const e = f({ min: m, homePrestige: hp, oppPrestige: ap, heroOvr: ovr ?? 70, momentum: mom ?? 50, possession: pos ?? 50, seed });
      if (e && e.side === 'home') h++; else if (e && e.side === 'away') a++;
    }
    return { h, a };
  };
  const N = 800;
  const agg = (hp, ap, mom) => {
    let th = 0, ta = 0;
    for (let s = 0; s < N; s++) { const r = simMatch(s * 7919 + 13, hp, ap, mom); th += r.h; ta += r.a; }
    return { h: +(th / N).toFixed(3), a: +(ta / N).toFixed(3) };
  };
  const even = agg(70, 70, 50);
  const strong = agg(85, 60, 50);     // eroe in squadra forte vs debole
  const weak = agg(60, 85, 50);       // eroe in squadra debole vs forte
  const domin = agg(70, 70, 90);      // momentum altissimo
  const suff = agg(70, 70, 10);       // momentum bassissimo
  // determinismo: due run identiche
  const d1 = simMatch(12345, 72, 68, 55, 52, 74), d2 = simMatch(12345, 72, 68, 55, 52, 74);
  return { even, strong, weak, domin, suff, det: d1.h === d2.h && d1.a === d2.a, sample: d1 };
});

console.log('=== bgMicroTick — BASELINE STATISTICA (gol BG/squadra/partita, N=800) ===');
if (res.err) { console.log('❌ ' + res.err); process.exit(2); }
console.log(`pari (70v70, mom 50):    home ${res.even.h} · away ${res.even.a}`);
console.log(`forte (85v60):           home ${res.strong.h} · away ${res.strong.a}`);
console.log(`debole (60v85):          home ${res.weak.h} · away ${res.weak.a}`);
console.log(`dominio (mom 90):        home ${res.domin.h} · away ${res.domin.a}`);
console.log(`sofferenza (mom 10):     home ${res.suff.h} · away ${res.suff.a}`);
console.log(`determinismo stesso seed: ${res.det ? '✅' : '❌'}`);

const issues = [];
if (!(res.even.h >= 0.5 && res.even.h <= 1.3)) issues.push(`gol compagni a prestigio pari fuori range: ${res.even.h} (atteso 0.5–1.3)`);
if (!(res.even.a >= 0.6 && res.even.a <= 1.4)) issues.push(`gol avversari a prestigio pari fuori range: ${res.even.a} (atteso 0.6–1.4)`);
if (!(res.strong.h > res.even.h && res.strong.a < res.even.a)) issues.push('il divario di prestigio non scala nel verso giusto (forte)');
if (!(res.weak.h < res.even.h && res.weak.a > res.even.a)) issues.push('il divario di prestigio non scala nel verso giusto (debole)');
if (!(res.domin.h > res.even.h && res.suff.a > res.even.a)) issues.push('il momentum non è un attuatore (dominio/sofferenza non spostano i gol)');
if (!res.det) issues.push('NON deterministico a parità di seed');
for (const i of issues) console.log('  ✗ ' + i);
console.log(issues.length === 0 ? '\n✅ MICROSIM OK' : '\n❌ MICROSIM FAIL');
await browser.close(); srv.close();
process.exit(issues.length === 0 ? 0 : 1);
