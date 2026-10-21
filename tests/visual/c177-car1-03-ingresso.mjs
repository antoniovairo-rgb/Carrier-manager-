import { apri, shot, testo, sleep, clickByText, dumpLS, DATI } from './c177-car1-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const save = JSON.parse(fs.readFileSync(path.join(DATI, 'save-01-post-provini.json'), 'utf8')); save['cpm-match-speed'] = '2';
const g = await apri({ save, test: false }); const { page } = g;
const btns = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim().slice(0, 50)));
await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /Scegli/.test(b.textContent))[0].click()); await sleep(1500);
for (let i = 0; i < 14; i++) {
  console.log(`--- ${i}`, (await testo(page)).replace(/\n/g, ' | ').slice(0, 700)); console.log('BTN', await btns());
  await shot(page, `09-ingresso-${String(i).padStart(2, '0')}`);
  const b = await btns();
  const pick = b.find(t => /Firma|Accetta|Continua|Inizia|Avanti|Entra|Vai|Conferma|Capito|OK/i.test(t));
  if (!pick) break;
  await page.evaluate(p => { const e = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim().slice(0, 50) === p); e.click(); }, pick); await sleep(1500);
}
fs.writeFileSync(path.join(DATI, 'save-02-ingresso.json'), JSON.stringify(await dumpLS(page)));
console.log(Object.keys(await dumpLS(page)), g.errs.filter(e => !/BABEL/.test(e)));
await g.close();
