import { chromium } from 'playwright';

const started = Date.now();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CPM_CHROME,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
try {
  const page = await browser.newPage();
  const result = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { webgl: false };
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return { webgl: true, version: gl.getParameter(gl.VERSION), renderer: gl.getParameter(gl.RENDERER), unmaskedRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null };
  });
  console.log(JSON.stringify({ ...result, durataMs: Date.now() - started }));
} finally {
  await browser.close();
}
