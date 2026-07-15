/* [BL-19 · VIDEO CONTINUO] AI Vision — modalità VIDEO: cattura un filmstrip ordinato dei fotogrammi
   della conclusione e usa un prompt che giudica il MOVIMENTO (non 5 fasi statiche). Test in isolamento
   di config (VISION_MODE/frames/interval) + selezione del prompt per context.mode (nessun browser/provider). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getConfig } from '../../lib/vision/config.mjs';
import { buildPrompt } from '../../lib/vision/prompts.mjs';

test('config: default = modalità frames (retro-compat)', () => {
  const c = getConfig({});
  assert.equal(c.visionMode, 'frames');
});

test('config: VISION_MODE=video attiva la modalità video + default frames/interval', () => {
  const c = getConfig({ VISION_MODE: 'video' });
  assert.equal(c.visionMode, 'video');
  assert.equal(c.videoFrames, 10);
  assert.equal(c.videoIntervalMs, 110);
});

test('config: videoFrames clampato in [3,16], intervalMs floor 40', () => {
  assert.equal(getConfig({ VISION_MODE: 'video', VISION_VIDEO_FRAMES: '99' }).videoFrames, 16);
  assert.equal(getConfig({ VISION_MODE: 'video', VISION_VIDEO_FRAMES: '1' }).videoFrames, 3);
  assert.equal(getConfig({ VISION_MODE: 'video', VISION_VIDEO_INTERVAL: '5' }).videoIntervalMs, 40);
  assert.equal(getConfig({ VISION_MODE: 'video', VISION_VIDEO_FRAMES: '8' }).videoFrames, 8);
});

test('config: VISION_MODE non-video → resta frames', () => {
  assert.equal(getConfig({ VISION_MODE: 'foto' }).visionMode, 'frames');
  assert.equal(getConfig({ VISION_MODE: '' }).visionMode, 'frames');
});

test('prompt: context.mode=video seleziona il template MOVIMENTO (filmstrip)', () => {
  const p = buildPrompt({ text: 'Tiro dal limite', intent: 'shot', mode: 'video' });
  assert.match(p, /FILMSTRIP|SEQUENZA ORDINATA DI FOTOGRAMMI/);
  assert.match(p, /MOVIMENTO/);
  assert.match(p, /TELEPORT/);          // giudica gli scatti/teleport tra frame
  assert.match(p, /TRAIETTORIA DELLA PALLA/);
  assert.match(p, /Tiro dal limite/);   // situation interpolata
  assert.match(p, /"scores"/);          // schema JSON invariato → scoring uguale
});

test('prompt: senza mode → template a fotogrammi statici (default invariato)', () => {
  const p = buildPrompt({ text: 'Cross in area', intent: 'cross' });
  assert.match(p, /SCREENSHOT STATICI in sequenza/);
  assert.doesNotMatch(p, /FILMSTRIP/);
  assert.match(p, /Cross in area/);
});

test('prompt: entrambi i template interpolano le DIMS (nessun {{DIMS}} residuo)', () => {
  for (const ctx of [{ text: 'x', intent: 'shot', mode: 'video' }, { text: 'x', intent: 'shot' }]) {
    const p = buildPrompt(ctx);
    assert.doesNotMatch(p, /\{\{DIMS\}\}/);
    assert.doesNotMatch(p, /\{\{SITUATION\}\}/);
  }
});
