/* [giro 163 · PO-356 F] indicePrimavera e partitaChiave163 sono funzioni PURE: si estraggono dal frammento vero
   (src/08) e si provano in node, senza copia della logica. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../src/08-panchina-derby-meteo-cori.jsx');
const s = fs.readFileSync(SRC, 'utf8');
const i0 = s.indexOf('const IP153_TACCHE='), i1 = s.indexOf('function partitaChiave163(');
const i2 = s.indexOf('}catch(_e){return null;}}', i1) + '}catch(_e){return null;}}'.length;
assert.ok(i0 > 0 && i1 > i0 && i2 > i1, 'funzioni trovate nel sorgente');
const CLUBS = [{ id: 'milan', p: 90 }, { id: 'milan', p: 78, isU18: true }];
const DERBY = { 'milan-inter': { e: '🔥', name: 'Derby della Madonnina' } };
const isDerby = (a, b) => DERBY[a + '-' + b] || DERBY[b + '-' + a] || null;
const { indicePrimavera, partitaChiave163 } = new Function('CLUBS', 'isDerby', s.slice(i0, i2) + '\nreturn {indicePrimavera,partitaChiave163};')(CLUBS, isDerby);
const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({ season: 1, week: i + 2, goals: 0, assists: 0, rating: 6.5, ...o }));
const P = (o = {}) => ({ proStatus: 'u18', season: 1, position: 'Attaccante', form: 70, coachTrust: 60, ovr: 66, club: { id: 'milan', p: 78 }, matchHistory: mk(8), ...o });

test('fuori dalla Primavera: null', () => { assert.equal(indicePrimavera(P({ proStatus: 'pro' })), null); });
test('sotto 6 partite non si giudica', () => { const r = indicePrimavera(P({ matchHistory: mk(5) })); assert.equal(r.pronto, false); assert.equal(r.partite, 5); });
test('estremi 0 e 100', () => {
  assert.equal(indicePrimavera(P({ matchHistory: mk(10, { rating: 9, goals: 1 }), form: 95, coachTrust: 100, ovr: 99 })).valore, 100);
  assert.equal(indicePrimavera(P({ matchHistory: mk(10, { rating: 4 }), form: 30, coachTrust: 0, ovr: 40 })).valore, 0);
});
test('valore atteso dai pesi', () => {
  /* voto 6,5 → 0,5 · contributo 0 · forma 70 → 40/65 · fiducia 0,6 · ovr 66-(90-20)=-4 → 0,3 */
  const atteso = Math.round(100 * (0.35 * 0.5 + 0 + 0.15 * (40 / 65) + 0.15 * 0.6 + 0.10 * 0.3));
  assert.equal(indicePrimavera(P()).valore, atteso);
});
test('il tetto del contributo dipende dal ruolo', () => {
  const h = mk(10, { rating: 6.5, goals: 0, assists: 0 }).map((m, i) => ({ ...m, goals: i < 2 ? 1 : 0 }));/* 0,2 a partita */
  const att = indicePrimavera(P({ matchHistory: h, position: 'Attaccante' })).parti.contributo;
  const dif = indicePrimavera(P({ matchHistory: h, position: 'Difensore centrale' })).parti.contributo;
  assert.ok(dif > att && dif === 1);
});
test('coppa, Nazionale, squalifiche e altre stagioni escluse', () => {
  const r = indicePrimavera(P({ matchHistory: [...mk(5), ...mk(3, { cup: true }), ...mk(3, { national: true }), ...mk(2, { squalificato: true, rating: null }), ...mk(4, { season: 2 })] }));
  assert.equal(r.pronto, false); assert.equal(r.partite, 5);
});
test('pura: non modifica il giocatore', () => { const p = P(); const j = JSON.stringify(p); indicePrimavera(p); assert.equal(JSON.stringify(p), j); });
test('partita chiave: derby, vertice, capolista; nessuna a classifica vuota', () => {
  const st = [{ id: 'a', pts: 30 }, { id: 'milan', pts: 28 }, { id: 'b', pts: 25 }, { id: 'c', pts: 10 }, { id: 'd', pts: 5 }];
  assert.match(partitaChiave163({ club: { id: 'milan' }, standings: st }, { opponentId: 'inter' }), /Derby/);
  assert.match(partitaChiave163({ club: { id: 'milan' }, standings: st }, { opponentId: 'a' }), /vertice/);
  assert.match(partitaChiave163({ club: { id: 'x' }, standings: [...st, { id: 'x', pts: 1 }] }, { opponentId: 'b' }), /capolista/);
  assert.equal(partitaChiave163({ club: { id: 'milan' }, standings: st }, { opponentId: 'd' }), null);
  assert.equal(partitaChiave163({ club: { id: 'milan' }, standings: st.map(t => ({ ...t, pts: 0 })) }, { opponentId: 'a' }), null);
  assert.ok(partitaChiave163({ club: { id: 'milan' }, standings: st }, { type: 'cup', opponentId: 'd' }));
});
