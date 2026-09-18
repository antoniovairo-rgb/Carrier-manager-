/*
 * Imports the FBX files downloaded from Mixamo into the naming convention used
 * by retarget.cjs.  The converter only writes a GLB; retarget.cjs remains the
 * authority that accepts or rejects a clip for the rebuilt character rig.
 *
 * Usage: npm run import:mixamo -- "C:\\path\\to\\Mixamo downloads"
 */
const fs = require('fs');
const path = require('path');
const convert = require('fbx2gltf');

const ROOT = __dirname;
const INPUT = path.resolve(process.argv[2] || path.join(process.env.USERPROFILE || '', 'Downloads'));
const REQUESTS = require('./assets/mixamo/requested-motion-set.json');
const OUTPUT = path.resolve(ROOT, '..', '..', 'assets');
const REPORT = path.join(ROOT, 'assets', 'mixamo', 'import-report.json');

const normal = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const requested = Object.entries(REQUESTS)
  .filter(([, value]) => Array.isArray(value))
  .flatMap(([area, value]) => value.filter(item => item && typeof item === 'object' && item.asset && item.search).map(item => ({ ...item, area })));

if (!fs.existsSync(INPUT)) throw new Error(`Input folder does not exist: ${INPUT}`);
const sourceFiles = fs.readdirSync(INPUT)
  .filter(name => path.extname(name).toLowerCase() === '.fbx')
  .map(name => ({ name, path: path.join(INPUT, name), normalized: normal(path.basename(name, '.fbx')) }));
const used = new Set();
const imported = [], missing = [], ambiguous = [];

function matches(request, file) {
  if (file.normalized.includes('goalkeeper') && !String(request.asset).startsWith('gk-')) return false;
  return [request.search, ...(request.aliases || [])].map(normal).some(target =>
    file.normalized === target || file.normalized.includes(target)
  );
}
function candidatesFor(request) {
  const available = sourceFiles.filter(file => !used.has(file.path));
  const exactNames = [request.asset, ...(request.aliases || [])].map(normal);
  const exact = available.filter(file => exactNames.includes(file.normalized));
  return exact.length ? exact : available.filter(file => matches(request, file));
}

(async () => {
  for (const request of requested) {
    const candidates = candidatesFor(request);
    if (candidates.length === 0) {
      missing.push({ asset: request.asset, search: request.search, area: request.area });
      continue;
    }
    if (candidates.length > 1) {
      ambiguous.push({ asset: request.asset, search: request.search, candidates: candidates.map(file => file.name) });
      continue;
    }
    const source = candidates[0];
    const destination = path.join(OUTPUT, `anim-${request.asset}.glb`);
    await convert(source.path, destination);
    const bytes = fs.statSync(destination).size;
    const magic = fs.readFileSync(destination).subarray(0, 4).toString('ascii');
    if (magic !== 'glTF' || bytes < 64) throw new Error(`Converter did not create a valid GLB: ${destination}`);
    used.add(source.path);
    imported.push({ asset: request.asset, area: request.area, source: source.name, output: path.basename(destination), bytes });
  }
  const report = { input: INPUT, format: REQUESTS.format, imported, missing, ambiguous, unrecognized: sourceFiles.filter(file => !used.has(file.path)).map(file => file.name) };
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (ambiguous.length) process.exitCode = 2;
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });