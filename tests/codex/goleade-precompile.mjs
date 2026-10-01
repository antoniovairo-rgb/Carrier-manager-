#!/usr/bin/env node
// Precompila solo il JSX per ridurre il carico di Chrome nei test numerici.
// Il file del gioco rimane invariato; l'HTML derivato è una fixture locale temporanea.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = process.cwd();
const require = createRequire(import.meta.url);
const Babel = require(path.join(root, 'tests/visual/node_modules/@babel/standalone'));
const source = fs.readFileSync(path.join(root, 'CARRIER-MANAGER-AV.html'), 'utf8');
const tag = '<script type="text/babel" data-presets="react">';
const start = source.indexOf(tag);
const close = source.lastIndexOf('</script>');
if (start < 0 || close < start) throw Error('Blocco JSX non trovato');
const jsx = source.slice(start + tag.length, close);
const compiled = Babel.transform(jsx, { presets: ['react'], compact: false, comments: false, sourceMaps: false }).code;
let html = source.slice(0, start) + '<script>\n' + compiled + '\n</script>' + source.slice(close + '</script>'.length);
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/7\.23\.6\/babel\.min\.js"><\/script>\s*/, '');
html = html.replace(/<script>window\.Babel\|\|document\.write\('<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@babel\/standalone@7\.23\.6\/babel\.min\.js"><\\\/script>'\)<\/script>\s*/, '');
if (html.includes('type="text/babel"')) throw Error('Il JSX non è stato sostituito');
const target = path.join(root, 'tests/codex/goleade-precompiled.html');
fs.writeFileSync(target, html);
console.log(JSON.stringify({ sourceBytes: Buffer.byteLength(source), compiledBytes: Buffer.byteLength(html), removedRuntimeBabel: !html.includes('babel-standalone/7.23.6/babel.min.js'), target }));
