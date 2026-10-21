/* Affianca N fotogrammi (png/jpg) in un foglio unico ridotto: RID=0.55 node c177-car1-foglio.mjs out.png in1 in2 ...  (richiede jpeg-js in JPJS) */
import { PNG } from 'pngjs'; import fs from 'node:fs'; import { createRequire } from 'node:module';
const req = createRequire(process.env.JPJS || '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/jp/');
const jpeg = req('jpeg-js');
const [out, ...ins] = process.argv.slice(2);
const K = +(process.env.RID || 0.55);
const imgs = ins.map(f => { const b = fs.readFileSync(f); if (/\.png$/i.test(f)) { const p = PNG.sync.read(b); return { data: p.data, width: p.width, height: p.height }; } const j = jpeg.decode(b, { useTArray: true }); return { data: j.data, width: j.width, height: j.height }; });
const W = imgs[0].width, H = imgs[0].height; const w = Math.round(W * K), h = Math.round(H * K);
const o = new PNG({ width: w * imgs.length, height: h });
imgs.forEach((im, k) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sx = Math.min(im.width - 1, Math.floor(x / K)), sy = Math.min(im.height - 1, Math.floor(y / K)); const si = (sy * im.width + sx) * 4, di = (y * o.width + k * w + x) * 4; o.data[di] = im.data[si]; o.data[di + 1] = im.data[si + 1]; o.data[di + 2] = im.data[si + 2]; o.data[di + 3] = 255; } });
fs.writeFileSync(out, PNG.sync.write(o));
