/* [giro 189] passo 1: primo avvio su telefono — home, opzioni, creazione. */
import { apri, sleep } from './lib193.mjs';
const H = await apri({ fmt: process.argv[2] || 'tel' });
const log = async (e) => console.log('\n== ' + e + '\nTASTI:', JSON.stringify(await H.btns()), '\nTESTO:', (await H.txt(900)));
await H.foto('01-home'); await log('home');
for (const passo of (process.argv[3] || '').split('|').filter(Boolean)) { const r = await H.tap(new RegExp(passo, 'i')); await sleep(900); await log('dopo «' + passo + '» → ' + r); }
await H.foto('02-dopo');
console.log('errori', H.errori);
await H.salva('p01'); await H.chiudi();
