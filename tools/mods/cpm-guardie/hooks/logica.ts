/* Regole pure delle guardie di Carrier Manager: nessun accesso all'engine, cosi' i test le provano direttamente. */

export type Passo = { passo: string; ok: boolean; s?: number }
export type Giro = { data: string; versione: string; catena: string; passi: Passo[] }

const CATENE_VALIDE = ['completa', 'grafica', 'carriera']

/** Il comando Bash promuove su main? (git push ... main / ...:main / HEAD:main) */
export function promuoveSuMain(cmd: string): boolean {
  return cmd.split(/&&|\|\||;|\n/).some(p => /\bgit\s+push\b/.test(p) && /(\s|:)(refs\/heads\/)?main(\s|$)/.test(p + ' '))
}

/** Il comando ricompila il gioco? */
export function ricompila(cmd: string): boolean {
  return /tools\/build-src\.mjs/.test(cmd)
}

/** pkill -f e' vietato: lo schema puo' combaciare col proprio comando e uccidere la shell. */
export function usaPkillF(cmd: string): boolean {
  return /\bpkill\b[^;&|\n]*\s-[a-zA-Z]*f/.test(cmd)
}

/** Un commit che porta un identificativo del modello (il trailer «Claude Opus 5.5» e' ammesso, l'id tecnico no). */
export function commitConIdModello(cmd: string): boolean {
  return /\bgit\s+commit\b/.test(cmd) && /claude-(opus|sonnet|haiku|fable)-\d/i.test(cmd)
}

/** Versione del gioco dal sorgente. */
export function versioneDa(src07: string): string | null {
  const m = src07.match(/GAME_VERSION="([0-9.]+)"/)
  return m ? m[1] : null
}

/** L'ultimo giro valido per quella versione (STABILITA.json ha il piu' recente in cima). */
export function giroPerVersione(giri: Giro[], versione: string): Giro | null {
  return giri.find(g => g.versione === versione && CATENE_VALIDE.includes(g.catena)) || null
}

/** Verdetto sulla promozione: ammessa solo se l'ultima catena della versione attuale e' tutta verde. */
export function verdettoPromozione(giri: Giro[], versione: string | null): { ok: boolean; perche: string } {
  if (!versione) return { ok: false, perche: 'GAME_VERSION non leggibile da src/07-versione-save-interviste.jsx' }
  const g = giroPerVersione(giri, versione)
  if (!g) return { ok: false, perche: `nessuna catena completa/grafica/carriera registrata per ${versione} in docs/governo/STABILITA.json` }
  const rossi = g.passi.filter(p => !p.ok).map(p => p.passo)
  if (rossi.length) return { ok: false, perche: `l'ultima catena ${g.catena} su ${versione} (${g.data}) ha passi rossi: ${rossi.join(', ')}` }
  return { ok: true, perche: `catena ${g.catena} su ${versione} (${g.data}) ${g.passi.length}/${g.passi.length} verde` }
}

/** Riassunto di un log di catena (righe ✅/❌ e FINE). */
export function statoLog(testo: string): { verdi: number; rossi: number; finito: boolean; ultimo: string | null; esito: string | null } {
  const righe = testo.split('\n').filter(Boolean)
  const passi = righe.filter(r => /^(✅|❌) /.test(r) && !/ catena /.test(r))
  const esito = righe.find(r => / catena .* su .*: \d+\/\d+ verdi/.test(r)) || null
  const ultimo = passi.length ? passi[passi.length - 1].replace(/^(✅|❌) /, '').replace(/ \(\d+s\).*/, '') : null
  return { verdi: passi.filter(r => r.startsWith('✅')).length, rossi: passi.filter(r => r.startsWith('❌')).length, finito: righe.includes('FINE'), ultimo, esito }
}
