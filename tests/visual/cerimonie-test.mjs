#!/usr/bin/env node
/* [7.425.0] GUARDIANO — OGNI COPPA HA LA SUA CERIMONIA
   (evolutiva PO «una Coppa deve sembrare una Coppa, uno Scudetto uno Scudetto, una promozione una
    promozione — NON usare la stessa cerimonia per tutto»)
   COSA MISURA: per ogni kind (league/cup/promo/int/bigwin) forza la premiazione col gancio
   __CPM_FORCE_CEREMONY e legge lo SCRIPT vero (__CPM_CER425): (1) gli script devono essere DIVERSI
   fra loro (la prova del rosso e' incorporata: se tornasse una cerimonia unica per tutto, l'assert
   di diversita' fallisce); (2) la promozione NON ha podio ne' sollevamento (festeggia senza coppa:
   il premio e' la categoria) ma HA il mister e la curva; (3) la coppa HA la consegna e il
   sollevamento; (4) il MISTER esiste in ogni cerimonia; (5) zero pageerror sul giro completo.

   [7.429.0] +LA SCENA REGGE AL COLLAUDO (batch PO da dispositivo: «mister che e' un burattino, palla
   che va appresso all'eroe, scudetto non bene impugnato, eroe che sprofonda nel palco»). Sezione
   warp (__CPM_CERT_SET) sulla cerimonia league: (6) alla CONSEGNA l'eroe sta ACCANTO al podio, non
   dentro (PRE-FIX MISURATO: bersaglio (0,0) col podio visibile — piantato nel cilindro); (7) al
   SOLLEVAMENTO lo scudetto e' IMPUGNATO: gruppo alle mani E fregio a quota di presa (pre-fix: targa
   a y=1,0 locale — un metro sopra la testa); (8) il MISTER non sta nel corridoio di ripresa (pre-fix
   misurato: dCam 5-7u costanti in ogni beat — il gigante in primo piano degli screenshot); (9) la
   PALLA e' spenta durante la cerimonia (pre-fix: seguiva l'eroe in campo); (10) i TELEFONINI della
   curva esistono. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = [];
page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(1200);
const scripts = {};
for (const kind of ['league', 'cup', 'promo', 'int', 'bigwin']) {
  const ok = await page.evaluate(k => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'T ' + k, kind: k }), kind);
  if (!ok) { console.log('❌ FAIL — force cerimonia non disponibile'); process.exit(2); }
  await sleep(2200);
  scripts[kind] = await page.evaluate(() => window.__CPM_CER425 || null);
  await page.evaluate(() => { try { window.__CPM_RESOLVE ? null : null; } catch (e) {} });
  await page.keyboard.press('Enter'); await sleep(900);
}
/* — sezione WARP sulla league: la scena regge al collaudo — */
const wg = [];
{
  const ok = await page.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'W league', kind: 'league' }));
  if (ok) {
    await page.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beatsD, { timeout: 10000 }).catch(() => {});
    const sc = await page.evaluate(() => window.__CPM_CER425 || null);
    if (sc && sc.beatsD) {
      const mid = (name) => { let a = 0; for (let i = 0; i < sc.beats.length; i++) { if (sc.beats[i] === name) return a + sc.beatsD[i] / 2; a += sc.beatsD[i]; } return null; };
      const probe = () => page.evaluate(() => {
        const T = window.__CPM3D; if (!T) return null;
        const o = { heroD0: +Math.hypot(T.hero.position.x, T.hero.position.z).toFixed(2), heroY: +T.hero.position.y.toFixed(2), ballVis: T.ball.visible };
        let tro = null; T.scene.traverse(x => { if (x._extra425 !== undefined && !tro) tro = x; });
        if (tro) { o.troY = +tro.position.y.toFixed(2); o.troDXZ = +Math.hypot(tro.position.x - T.hero.position.x, tro.position.z - T.hero.position.z).toFixed(2);
          try { const fx = tro._extra425 && tro._extra425.children[0]; o.plateLocalY = fx ? +fx.position.y.toFixed(2) : null; } catch (e) {} }
        let cg = null; T.scene.traverse(x => { if (!cg && x.isMesh && x.material && x.material.color && x.material.color.getHex() === 0x2b3442 && x.geometry && x.geometry.type === 'BoxGeometry') cg = x.parent; });
        if (cg && cg.visible) o.dCamCoach = +Math.hypot(cg.position.x - T.camera.position.x, cg.position.z - T.camera.position.z).toFixed(1);
        let ph = null; T.scene.traverse(x => { if (!ph && x.isPoints && x.material && x.material.color && x.material.color.getHex() === 0xcfe8ff) ph = x; });
        o.phones = !!(ph && ph.visible);
        return o;
      });
      const tPres = mid('present'), tLift = mid('lift');
      await page.evaluate(t => { window.__CPM_CERT_SET = t; }, tPres); await sleep(2600);
      const mPres = await probe();
      await page.evaluate(t => { window.__CPM_CERT_SET = t; }, tLift); await sleep(2600);
      const mLift = await probe();
      if (!mPres || !mLift) wg.push('warp: probe cieca');
      else {
        /* l'invariante e' «mai DENTRO il cilindro»: in headless la mesh puo' essere in transito
           vicino al centro (4fps, lerp lento), ma se ci sta deve stare SOPRA il piano del palco */
        for (const [nm, m] of [['present', mPres], ['lift', mLift]])
          if (m.heroD0 < 1.4 && m.heroY < 0.9) wg.push(`(6) l'eroe SPROFONDA nel palco al beat ${nm} (dist centro ${m.heroD0}u, quota ${m.heroY})`);
        if (!(mLift.troDXZ <= 1.8 && mLift.troY > 1.4 && mLift.troY < 4.5)) wg.push(`(7a) al sollevamento il trofeo non e' addosso all'eroe (dXZ ${mLift.troDXZ}, y ${mLift.troY})`);
        if (mLift.plateLocalY == null || mLift.plateLocalY > 0.4) wg.push(`(7b) il fregio scudetto non e' a quota di presa (y locale ${mLift.plateLocalY})`);
        for (const [nm, m] of [['present', mPres], ['lift', mLift]]) {
          if (m.dCamCoach != null && m.dCamCoach < 3.5) wg.push(`(8) il mister e' nel corridoio di ripresa al beat ${nm} (dCam ${m.dCamCoach}u)`);
          if (m.ballVis) wg.push(`(9) la palla e' accesa durante la cerimonia (beat ${nm})`);
        }
        if (!mLift.phones) wg.push('(10) i telefonini della curva non ci sono');
        console.log(`warp league: present heroD0 ${mPres.heroD0} y ${mPres.heroY} · lift tro dXZ ${mLift.troDXZ} y ${mLift.troY} plateY ${mLift.plateLocalY} · dCamCoach ${mPres.dCamCoach}/${mLift.dCamCoach} · ball ${mPres.ballVis}/${mLift.ballVis} · phones ${mLift.phones}`);
      }
    } else wg.push('warp: beatsD assente nella probe');
  } else wg.push('warp: force cerimonia league fallita');
}
await b.close(); srv.close();
const guasti = [];
for (const [k, sc] of Object.entries(scripts)) {
  if (!sc || !sc.beats || !sc.beats.length) { guasti.push(`${k}: script assente`); continue; }
  if (!sc.coach) guasti.push(`${k}: il MISTER non c'e'`);
}
const sigs = Object.entries(scripts).filter(([k, s]) => s && s.beats).map(([k, s]) => [k, s.beats.join('>')]);
for (let i = 0; i < sigs.length; i++) for (let j = i + 1; j < sigs.length; j++) if (sigs[i][1] === sigs[j][1]) guasti.push(`${sigs[i][0]} e ${sigs[j][0]} hanno la STESSA cerimonia: ${sigs[i][1]}`);
const pr = scripts.promo && scripts.promo.beats || [];
if (pr.includes('present') || pr.includes('lift')) guasti.push('la PROMOZIONE ha podio/sollevamento: deve festeggiare senza coppa');
if (!(pr.includes('coach') && pr.includes('curva'))) guasti.push('la PROMOZIONE non ha mister+curva: ' + pr.join('>'));
const cu = scripts.cup && scripts.cup.beats || [];
if (!(cu.includes('present') && cu.includes('lift'))) guasti.push('la COPPA non ha consegna+sollevamento: ' + cu.join('>'));
wg.forEach(g => guasti.push(g));
if (errs.length) guasti.push('pageerror: ' + errs[0]);
console.log(Object.entries(scripts).map(([k, s]) => `${k}: ${s && s.beats ? s.beats.join('>') : '—'}`).join('\n'));
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — ogni coppa ha la sua cerimonia, il mister c\'e\' sempre, la promozione festeggia a modo suo');
