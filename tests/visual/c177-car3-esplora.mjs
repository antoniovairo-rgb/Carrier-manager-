import { apri, testo, foto, tocca, sleep } from './c177-car3-lib.mjs';
const { page, browser, srv, errori } = await apri();
console.log('click', await tocca(page, 'Nuova carriera'));
await sleep(1200);
console.log((await testo(page)).slice(0, 1800));
await foto(page, '_esplora-crea');
await browser.close(); srv.close();
