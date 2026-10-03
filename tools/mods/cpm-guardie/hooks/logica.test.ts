import { test, expect } from 'claude-code/testing'
import { promuoveSuMain, ricompila, usaPkillF, commitConIdModello, verdettoPromozione, statoLog } from './logica'

test('riconosce la promozione su main', () => {
  expect(promuoveSuMain('git push -q origin poc/marioprada-character-system:main 2>/dev/null')).toBe(true)
  expect(promuoveSuMain('git push origin main')).toBe(true)
  expect(promuoveSuMain('git push -q origin poc/marioprada-character-system 2>/dev/null')).toBe(false)
  expect(promuoveSuMain('git ls-remote origin main')).toBe(false)
})

test('divieti tecnici', () => {
  expect(ricompila('CPM_FORZA_BUILD=1 node tools/build-src.mjs')).toBe(true)
  expect(usaPkillF('pkill -f gol190d')).toBe(true)
  expect(usaPkillF('pgrep -f ci-runner.mjs')).toBe(false)
  expect(commitConIdModello('git commit -m "x\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"')).toBe(false)
  expect(commitConIdModello('git commit -m "fatto con claude-opus-5-5"')).toBe(true)
})

test('verdetto sulla promozione', () => {
  const giri = [{ data: 'd2', versione: '7.999.120', catena: 'completa', passi: [{ passo: 'a', ok: true }, { passo: 'b', ok: false }] },
    { data: 'd1', versione: '7.999.119', catena: 'completa', passi: [{ passo: 'a', ok: true }] }]
  expect(verdettoPromozione(giri, '7.999.119').ok).toBe(true)
  expect(verdettoPromozione(giri, '7.999.120').ok).toBe(false)
  expect(verdettoPromozione(giri, '7.999.121').ok).toBe(false)
})

test('stato del log', () => {
  const s = statoLog('✅ test:vision (2s)\n✅ test:logic (5s)\n❌ replay (60s) — boom\n')
  expect(s.verdi).toBe(2); expect(s.rossi).toBe(1); expect(s.finito).toBe(false); expect(s.ultimo).toBe('replay')
  const f = statoLog('✅ a (1s)\n✅ catena completa su 7.999.119: 9/9 verdi\nFINE\n')
  expect(f.finito).toBe(true); expect(f.verdi).toBe(1)
})
