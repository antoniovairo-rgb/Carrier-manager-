#!/usr/bin/env node
/* [7.340.1 collaudo PO su Windows: «'.' non è riconosciuto come comando interno o esterno»]
   Gli script npm invocavano `cd android && ./gradlew …`: `./` è sintassi di shell Unix e `cmd.exe` non la
   capisce (su Windows il wrapper si chiama `gradlew.bat`). Questo lanciatore sceglie il wrapper giusto per il
   sistema operativo, così `npm run android:apk` / `android:aab` funzionano identici su Windows, macOS e Linux.
   Uso: node tools/gradle.mjs <task> [altri argomenti gradle] */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = join(ROOT, 'android');
const isWin = process.platform === 'win32';
const wrapper = join(ANDROID, isWin ? 'gradlew.bat' : 'gradlew');

if (!existsSync(ANDROID)) {
  console.error('\n❌ Manca la cartella android/ — genera prima il progetto nativo:\n   npx cap add android\n');
  process.exit(1);
}
if (!existsSync(wrapper)) {
  console.error(`\n❌ Wrapper Gradle non trovato: ${wrapper}\n   Rigenera il progetto nativo con:  npx cap sync android\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.length) { console.error('Uso: node tools/gradle.mjs <task gradle>'); process.exit(1); }

console.log(`▶ ${isWin ? 'gradlew.bat' : './gradlew'} ${args.join(' ')}   (in android/)`);
/* shell:true su Windows serve a eseguire il .bat; il cwd è android/ come faceva il vecchio `cd android &&` */
const p = spawn(wrapper, args, { cwd: ANDROID, stdio: 'inherit', shell: isWin });
p.on('error', (e) => { console.error('\n❌ Avvio di Gradle fallito: ' + e.message); process.exit(1); });
p.on('exit', (code) => process.exit(code == null ? 1 : code));
