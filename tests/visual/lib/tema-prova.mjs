/* [PO-302 · grafica V2, tappa 4 — tema unico] IL BRACCIO ROSSO DEI GUARDIANI GRAFICI.
   Dalla tappa 4 il gioco ha un solo tema e nessun interruttore che lo spenga (__CPM_NO_V2 e' stato tolto). Il rosso si
   ottiene ALTERANDO I TOKEN DAL BANCO DI PROVA: prima del caricamento si imposta window.__CPM_TEMA_PROVA, che src/01 legge
   SOLO sotto ?cpmtest=1 (mai nella build dello store) e applica a TINTE prima che TH ne derivi.
   Il tema di prova e' una notte «sbiadita»: fondo, superfici, testo, testo secondario e oro spostati su grigi vicini fra
   loro. Deve far cadere sia la PALETTE (colori non piu' quelli delle tavole) sia il CONTRASTO (testo secondario ~1,4:1). */
export const TEMA_ROSSO = {
  tinte: { bg: '#1c2029', sup: '#2a2e38', inc: '#22252d', tasto: '#30343e', bordo: '#30343e', testo: '#5a5f6b', sec: '#3f4552', oro: '#6f6248', anello: '#30343e' },
  th: { faint: '#3f4552' },
};
export function armaTemaRosso(page, tema = TEMA_ROSSO) { return page.addInitScript(t => { window.__CPM_TEMA_PROVA = t; }, tema); }
