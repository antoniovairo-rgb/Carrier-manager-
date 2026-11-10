#!/usr/bin/env node
/* [giro 134 · PO-334 «Dentro l'app»] GUARDIANO privacy-134 (non-gate, catena grafica/store).
   Prima: Opzioni → «Informativa sulla privacy» apriva privacy.html FUORI dall'app (window.open; nell'app Android TWA usciva nel browser).
   Ora: si apre una finestra standard del gioco col testo generato da privacy.html (fonte unica, tools/privacy-testo.mjs).
   Formati 360x800 (tocco) e 1440x900 (mouse), A RETE BLOCCATA (ogni richiesta che non e' localhost o un CDN servito dai node_modules
   locali viene interrotta; la sonda prova che il blocco e' attivo con una fetch esterna che deve fallire).
   Per formato: Opzioni si apre · la voce c'e' e si tocca (>= 44 px) · al tocco NESSUNA nuova finestra/scheda e nessun window.open ·
   il testo compare DENTRO la pagina · contiene korward.devteam@gmail.com · NON contiene l'indirizzo personale (cercato per prefisso,
   scritto qui in codici di carattere) · coincide col testo di privacy.html (estratto qui in modo indipendente dal generatore: tag
   tolti, entita' decodificate, spazi compattati) · «Chiudi» (a 1440 anche Esc) chiude la finestra e si resta in Opzioni.
   BRACCIO ROSSO: __CPM_NO_G134P (la privacy di prima, fuori dall'app) — deve cadere. «Non giudicato» = rosso.
   Uso: PRIV134_BRACCI=verde,rosso  PRIV134_FOTO=<cartella>. Esce !=0 se il verde e' rosso o il rosso non cade. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BRACCI = (process.env.PRIV134_BRACCI || 'verde,rosso').split(',');
const FOTO = process.env.PRIV134_FOTO || ''; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const F = [{ k: 's360', w: 360, h: 800, t: 1 }, { k: 'pc', w: 1440, h: 900, t: 0 }];
const MAIL = 'korward.devteam@gmail.com';
const VIETATO = String.fromCharCode(97, 110, 116, 111, 110, 105, 111, 118, 97, 105, 114, 111, 64);/* prefisso dell'indirizzo personale: mai in chiaro nei file */
const spazi = s => String(s || '').replace(/\s+/g, ' ').trim();
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const dec = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));
const html = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8');
const card = html.slice(html.indexOf('<div class="card">'), html.indexOf('</main>'));
const piede = (/<footer>([\s\S]*?)<\/footer>/.exec(html) || [])[1] || '';
const ATTESO = spazi(dec((card + ' ' + piede).replace(/<[^>]+>/g, ' ')));
const ATTESO_STRETTO = ATTESO.replace(/\s+/g, '');/* confronto senza spazi: i bordi dei tag (strong, a) mettono spazi che innerText non ha */
if (!ATTESO.includes(MAIL) || ATTESO.length < 1500) { console.log('privacy-134: privacy.html non leggibile o senza il contatto atteso — NON GIUDICATO'); console.log('BRACCIO: nessuno'); process.exit(1); }

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = [];
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso'; const ko = []; const righe = [];
  for (const f of F) {
    const motivo = []; const errs = []; let bloccate = 0; const nuove = [];
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.t) { opt.isMobile = true; opt.hasTouch = true; }
    const ctx = await b.newContext(opt);
    await ctx.route(u => { try { const h = new URL(u).hostname; return h !== 'localhost' && h !== '127.0.0.1'; } catch (e) { return true; } }, r => { bloccate++; return r.abort('internetdisconnected'); });
    ctx.on('page', p => nuove.push(p.url()));
    const page = await ctx.newPage(); nuove.length = 0; await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(r => { try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} window.__APERTE134 = []; const o = window.open; window.open = function (...a) { window.__APERTE134.push(String(a[0])); return o.apply(this, a); }; if (r) window.__CPM_NO_G134P = true; }, rosso);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(2000);
    const reteBloccata = await page.evaluate(() => fetch('https://example.com/', { mode: 'no-cors' }).then(() => false, () => true));
    if (!reteBloccata) motivo.push('non giudicato (la rete non risulta bloccata)');
    const bt = await page.$('button[title="Impostazioni"]');
    if (!bt) motivo.push('non giudicato (tasto Opzioni non trovato)'); else {
      await bt.click(); await sleep(700);
      const v = await page.evaluate(() => { const a = document.querySelector('[data-cpm="privacy118"]'); if (!a) return null; const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
      const inOpzioni = () => page.evaluate(() => [...document.querySelectorAll('div')].some(d => (d.textContent || '').trim() === '⚙️ Opzioni' && d.getBoundingClientRect().width > 0));
      if (!v) motivo.push('non giudicato (voce «Informativa sulla privacy» assente in Opzioni)'); else {
        if (v.w < 44 || v.h < 44) motivo.push(`tocco ${v.w}x${v.h} < 44`);
        for (const modo of (f.t ? ['chiudi'] : ['chiudi', 'esc'])) {
          await page.click('[data-cpm="privacy118"]'); await sleep(900);
          const aperte = await page.evaluate(() => window.__APERTE134.slice());
          if (nuove.length || aperte.length) motivo.push(`si apre FUORI dall'app (nuove schede ${nuove.length}, window.open ${aperte.length}: ${(aperte[0] || nuove[0] || '').slice(0, 70)})`);
          const p = await page.evaluate(() => { const m = document.querySelector('[data-cpm="privacy134-pannello"]'); if (!m) return null; const t = m.querySelector('[data-cpm="finestra-titolo"]'); const c = m.querySelector('[data-cpm="privacy134-testo"]'); const r = m.getBoundingClientRect();
            return { testo: ((t && t.innerText) || '') + ' ' + ((c && c.innerText) || ''), tutto: m.innerText, w: Math.round(r.width), h: Math.round(r.height), dentro: r.left >= 0 && r.right <= innerWidth + 1 && r.width > 0, sx: document.documentElement.scrollWidth > innerWidth + 1 }; });
          if (!p && FOTO) await page.screenshot({ path: path.join(FOTO, `privacy134-${f.k}-${braccio}.png`) }).catch(() => {});
          if (!p) { motivo.push(`nessuna finestra della privacy dentro la pagina (${modo})`); break; }
          if (modo === 'chiudi' && FOTO) await page.screenshot({ path: path.join(FOTO, `privacy134-${f.k}-${braccio}.png`) }).catch(() => {});
          if (!p.dentro || p.sx) motivo.push(`finestra fuori dallo schermo o scroll orizzontale (${p.w}x${p.h})`);
          if (!p.tutto.includes(MAIL)) motivo.push('il testo non contiene ' + MAIL);
          if (p.tutto.toLowerCase().includes(VIETATO)) motivo.push("il testo contiene l'indirizzo personale del PO");
          const visto = spazi(p.testo).replace(/\s+/g, '');
          if (visto !== ATTESO_STRETTO) { let i = 0; while (i < visto.length && visto[i] === ATTESO_STRETTO[i]) i++; motivo.push(`testo ≠ privacy.html (${visto.length} contro ${ATTESO_STRETTO.length} caratteri senza spazi, primo scarto al ${i}: «${visto.slice(i, i + 30)}» / «${ATTESO_STRETTO.slice(i, i + 30)}»)`); }
          if (modo === 'chiudi') await page.click('[data-cpm="privacy134-chiudi"]'); else await page.keyboard.press('Escape');
          await sleep(600);
          const ancora = await page.$('[data-cpm="privacy134-pannello"]');
          if (ancora) motivo.push(`la finestra non si chiude (${modo})`);
          else if (!(await inOpzioni())) motivo.push(`chiusa la privacy (${modo}) non si torna a Opzioni`);
          righe.push(`${f.k} ${modo}: finestra ${p.w}x${p.h}, ${visto.length} caratteri`);
        }
      }
    }
    if (errs.length) motivo.push('errori pagina: ' + errs.slice(0, 2).join(' | '));
    console.log(`  ${motivo.length ? '✗' : '✓'} ${braccio} · ${f.w}x${f.h} · rete bloccata ${reteBloccata ? 'si' : 'NO'} (${bloccate} richieste interrotte)${motivo.length ? ' → ' + motivo.join('; ') : ''}`);
    ko.push(...motivo.map(m => f.k + ': ' + m));
    await ctx.close();
  }
  esito.push({ braccio, ko, righe });
}
await b.close(); srv.close();
let fallito = false; console.log('\n=== privacy-134: esito per braccio');
for (const e of esito) {
  e.righe.forEach(r => console.log('  · ' + e.braccio + ' ' + r));
  if (e.braccio === 'verde') { const ok = e.ko.length === 0 && e.righe.length === 3; if (!ok) fallito = true; console.log(`  VERDE: ${e.ko.length} difetti → ${ok ? 'PASSA' : 'FALLISCE'}`); e.ko.forEach(k => console.log('    MOTIVO: ' + k)); }
  else { const ok = e.ko.some(k => /FUORI dall'app|nessuna finestra/.test(k)); if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G134P): ${e.ko.length} difetti → ${ok ? 'CADE COME DEVE' : 'NON CADE: il guardiano e\' cieco'}`); e.ko.forEach(k => console.log('    MOTIVO: ' + k)); }
}
process.exit(fallito ? 1 : 0);
