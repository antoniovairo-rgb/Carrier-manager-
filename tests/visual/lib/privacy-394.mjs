/* [giro 394 PO-529] IL BROWSER DEL BANCO NON PARLA CON NESSUNO FUORI DAL GIOCO.
   Decisione PO (18/11, dubbi dei giri 237 e 271): «Spegnerlo».
   Misurato (misura-394.mjs, NetLog del browser): il Chromium «come distribuito» — quello che gira su
   GitHub Actions e in ogni sessione senza il wrapper dell'immagine cloud — apre da solo connessioni a
   servizi di Google che nessuna pagina del gioco ha chiesto (riempimento automatico dei moduli,
   notifiche push GCM/mtalk, aggiornamento dei componenti). Playwright mette gia'
   --disable-background-networking, che NON li copre.
   Qui le opzioni che li spengono ALLA SORGENTE: ogni servizio e' mandato a un indirizzo locale chiuso
   (127.0.0.1:9), lo stesso schema del wrapper dell'immagine cloud. Niente --disable-features: Chromium
   obbedisce solo all'ULTIMO e ne cancellerebbe la lista che Playwright mette per conto suo.
   Le opzioni non toccano pagina, disegno o tempi: solo servizi del browser.
   Rosso: CPM_NO_G394=1 = opzioni di prima (nessuna aggiunta). */
const CHIUSO = 'https://127.0.0.1:9';

export const ARGS_PRIVACY_394 = [
  `--autofill-server-url=${CHIUSO}/`,              // content-autofill.googleapis.com (misurato)
  `--gcm-mcs-endpoint=${CHIUSO}`,                  // mtalk.google.com:5228 (notifiche push, giri 187/237)
  `--gcm-checkin-url=${CHIUSO}/checkin`,           // android.clients.google.com (registrazione GCM)
  `--gcm-registration-url=${CHIUSO}/register`,
  `--component-updater=url-source=${CHIUSO}/`,     // aggiornamento componenti
  '--disable-component-update',
  '--disable-background-networking',
  '--disable-domain-reliability',
  '--disable-client-side-phishing-detection',
  '--safebrowsing-disable-auto-update',
  '--no-pings',
  '--disable-sync',
  '--no-first-run',
  '--metrics-recording-only',
];

export const privacySpenta394 = () => process.env.CPM_NO_G394 === '1';

/* Aggiunge le opzioni a un oggetto di lancio di Playwright (lo modifica e lo restituisce). */
export function conPrivacy394(opts = {}) {
  if (privacySpenta394()) return opts;
  const a = Array.isArray(opts.args) ? opts.args.slice() : [];
  for (const x of ARGS_PRIVACY_394) if (!a.includes(x)) a.push(x);
  opts.args = a;
  return opts;
}
