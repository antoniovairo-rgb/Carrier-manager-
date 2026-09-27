// Run the existing visual harness without installing packages or writing in tests/visual.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, isBuiltin, registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..', '..');
const visual = path.join(root, 'tests', 'visual');
const ownModules = path.join(visual, 'node_modules');
const sharedModules = path.resolve(process.env.CPM_CODEX_DEPS || '');
const out = path.join(root, 'reports', 'codex', 'validate-out');
if (!fs.existsSync(path.join(sharedModules, 'playwright', 'package.json'))) {
  throw new Error('CPM_CODEX_DEPS non indica un node_modules con Playwright');
}
const requireFromDeps = createRequire(path.join(sharedModules, 'package.json'));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'playwright') return { url: pathToFileURL(path.join(sharedModules, 'playwright', 'index.mjs')).href, shortCircuit: true };
    if (specifier === 'playwright-core') return { url: pathToFileURL(path.join(sharedModules, 'playwright-core', 'index.mjs')).href, shortCircuit: true };
    if (!specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.startsWith('node:') && !specifier.includes(':') && !isBuiltin(specifier)) {
      try { const resolved = requireFromDeps.resolve(specifier); if (path.isAbsolute(resolved)) return { url: pathToFileURL(resolved).href, shortCircuit: true }; }
      catch { /* Let Node report the original resolution error. */ }
    }
    return nextResolve(specifier, context);
  },
});

const inside = (p, base) => typeof p === 'string' && (path.resolve(p) === base || path.resolve(p).startsWith(base + path.sep));
const toShared = p => inside(p, ownModules) ? path.join(sharedModules, path.relative(ownModules, path.resolve(p))) : p;
const toReport = p => inside(p, path.join(visual, 'out')) ? path.join(out, path.relative(path.join(visual, 'out'), path.resolve(p))) : p;
const permitWrite = p => {
  const q = toReport(p);
  if (inside(q, root) && !inside(q, path.join(root, 'reports', 'codex')) && !inside(q, path.join(root, 'tests', 'codex'))) {
    throw new Error(`Scrittura fuori dai confini AGENTS.md: ${p}`);
  }
  return q;
};
for (const name of ['existsSync', 'readFileSync', 'statSync', 'readdirSync']) {
  const original = fs[name].bind(fs);
  fs[name] = (p, ...args) => original(toShared(toReport(p)), ...args);
}
const readFile = fs.readFile.bind(fs);
fs.readFile = (p, ...args) => readFile(toShared(toReport(p)), ...args);
for (const name of ['mkdirSync', 'writeFileSync', 'appendFileSync']) {
  const original = fs[name].bind(fs);
  fs[name] = (p, ...args) => original(permitWrite(p), ...args);
}
