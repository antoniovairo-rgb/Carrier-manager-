/* [7.187.0] PROBE identità dei gruppi ultras (nomi di FANTASIA in stile):
   (A) IDENTITÀ STABILE: lo striscione principale della curva dipende solo dal club → uguale con seed/stagioni diverse;
   (B) NESSUNA COLLISIONE: i 5 striscioni dello stesso lato sono tutti diversi;
   (C) LINGUA coerente con la nazione del club (tedesco→lessico tedesco, turco→turco…);
   (D) COPYRIGHT: nessun nome di gruppo ultras realmente esistente (blocklist) su un ampio campione di club;
   (E) LEGGIBILITÀ: nessuna scritta oltre 26 caratteri, nessun segnaposto non risolto;
   (F) [7.191.0] GRAMMATICA: un token che NON è nome proprio (aggettivo/plurale: GRANATA, SCALIGERO, NERAZZURRI,
       CLARETS…) non può comparire dopo una preposizione (DI/DE/OF/VON/VAN/POR/ZU) né dopo un nome che richiede
       accordo; in francese «DE» davanti a vocale deve elidersi (D'AJACCIO). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const REAL = ['fossa dei leoni','brigate rossonere','commando ultra','cucs','boys san','irriducibili','fedayn',
  'drughi','ultras sur','boixos','biris','frente atletico','bukaneros','boulogne boys','magic fans','green angels',
  'ultramarines','schickeria','sektion','south winners','yellow wall','holmesdale','spion kop','the kop','1312',
  'gate 7','juventude leonina','no name boys','vak410','f-side','carsi','genc fener','ultraslan','tek yumruk'];

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewportSize({ width: 640, height: 800 });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await page.waitForFunction(() => typeof window.__CPM_ULTRAS === 'function', null, { timeout: 20000 });

const out = await page.evaluate(() => {
  const U = window.__CPM_ULTRAS;
  const clubs = (window.__CPM_CLUBS || window.CLUBS || []).slice();
  const sample = clubs.length ? clubs : [{ id: 'sal', n: 'FC Salernum', nat: '🇮🇹' }];
  const rows = [];
  for (const c of sample) {
    const main1 = U(c.n, 12345, 4, c.nat, c.id);
    const main2 = U(c.n, 998877, 4, c.nat, c.id);   // altro seed/stagione
    const banners = [0, 1, 2, 3].map(sl => U(c.n, 12345, sl, c.nat, c.id));
    const k = U.cls ? U.cls(c.n) : { t: '', c: 'P' };
    rows.push({ id: c.id, n: c.n, nat: c.nat, main1, main2, banners, tok: k.t, cls: k.c });
  }
  return rows;
});

const de = out.filter(r => /🇩🇪|🇦🇹|🇨🇭/.test(r.nat)), tr = out.filter(r => /🇹🇷/.test(r.nat));
let unstable = 0, collide = 0, tooLong = 0, ph = 0, real = 0;
const realHits = [], longHits = [];
for (const r of out) {
  if (r.main1 !== r.main2) unstable++;
  const all = [r.main1, ...r.banners];
  if (new Set(r.banners).size !== r.banners.length) collide++;
  for (const v of all) {
    if (v.length > 26) { tooLong++; if (longHits.length < 5) longHits.push(r.id + ':' + v); }
    if (/\{[TYC]\}/.test(v)) ph++;
    const lv = v.toLowerCase();
    if (REAL.some(x => lv.includes(x))) { real++; if (realHits.length < 5) realHits.push(r.id + ':' + v); }
  }
}
/* (F) GRAMMATICA — un token non-proprio non può seguire una preposizione NUDA (senza articolo);
   in francese «DE» davanti a vocale deve elidersi. Regressione esplicita sulle frasi segnalate dal PO. */
const PREP = /\b(?:DI|DE|DEL|DELLA|OF|VON|VAN|POR|ZU|D')\s+$/;
let badPrep = 0, badElis = 0; const gramHits = [];
for (const r of out) {
  const all = [r.main1, ...r.banners];
  for (const v of all) {
    if (r.cls !== 'P' && r.tok) {
      const i = v.indexOf(r.tok);
      if (i > 0 && PREP.test(v.slice(0, i))) { badPrep++; if (gramHits.length < 6) gramHits.push(r.id + ':' + v + ' [' + r.cls + ']'); }
    }
    if (/🇫🇷|🇲🇨/.test(r.nat) && /\bDE [AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜ]/.test(v)) { badElis++; if (gramHits.length < 6) gramHits.push(r.id + ':' + v + ' [élision]'); }
  }
}
const REGR = ['FIGLI DI GRANATA', 'FIGLI DI SCALIGERO', 'FIGLI DI VIOLA', 'CUORE NERAZZURRI', 'GRADINATA SPEZZINO', 'SONS OF SWANS', 'GRADA VALENCIANO'];
const regrHit = out.flatMap(r => [r.main1, ...r.banners]).filter(v => REGR.includes(v));

const deOk = de.length ? de.filter(r => /SZENE|KURVE|TRIBÜNE|GENERATION|HERZBLUT|TREU|STOLZ|FARBEN|SEIT|LIEBE|IMMER|BLOCK|ENDE|VEREIN|FREUNDE|HERZ/.test(r.main1)).length : 0;
const trOk = tr.length ? tr.filter(r => /TRİBÜN|TARAFTARI|ÇOCUKLARI|KUŞAĞI|YÜREĞİ|SEVDASI|AŞK|YÜREK|GURURU|BERİ|RENKLER|SES|AŞKIMIZ|BİRLİKTE|KADAR|HAYDİ/.test(r.main1)).length : 0;

console.log(`club testati: ${out.length} · esempi: ${out.slice(0, 6).map(r => r.n + ' → «' + r.main1 + '»').join(' · ')}`);
console.log(`tedeschi ${de.length} (lessico ok ${deOk}) · turchi ${tr.length} (lessico ok ${trOk})`);
if (unstable) issues.push(`(A) identità NON stabile su ${unstable} club (il nome cambia col seed)`);
if (collide) issues.push(`(B) striscioni duplicati nello stesso lato su ${collide} club`);
if (de.length && deOk < de.length) issues.push(`(C) lessico tedesco mancante su ${de.length - deOk} club`);
if (tr.length && trOk < tr.length) issues.push(`(C) lessico turco mancante su ${tr.length - trOk} club`);
if (real) issues.push(`(D) nomi di gruppi REALI generati: ${real} → ${realHits.join(' | ')}`);
if (tooLong) issues.push(`(E) scritte troppo lunghe: ${tooLong} → ${longHits.join(' | ')}`);
if (ph) issues.push(`(E) segnaposto non risolti: ${ph}`);
if (badPrep) issues.push(`(F) token non-proprio dopo preposizione nuda: ${badPrep} → ${gramHits.join(' | ')}`);
if (badElis) issues.push(`(F) élision mancante in francese: ${badElis} → ${gramHits.join(' | ')}`);
if (regrHit.length) issues.push(`(F) regressione sulle frasi segnalate dal PO: ${regrHit.join(' | ')}`);
console.log(`token non-proprî: ${out.filter(r => r.cls !== 'P').length}/${out.length} (aggettivi/plurali) · grammatica ${badPrep + badElis + regrHit.length === 0 ? 'OK' : 'KO'}`);
await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ IDENTITÀ ULTRAS OK (stabile per club · nessuna collisione · lingua coerente · grammatica corretta · zero nomi reali · leggibile)');
process.exit(issues.length ? 1 : 0);
