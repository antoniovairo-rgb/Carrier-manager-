#!/usr/bin/env node
/* [7.340.1 collaudo PO su Windows: «'.' non è riconosciuto come comando interno o esterno»]
   Gli script npm invocavano `cd android && ./gradlew …`: `./` è sintassi di shell Unix e `cmd.exe` non la
   capisce (su Windows il wrapper si chiama `gradlew.bat`). Questo lanciatore sceglie il wrapper giusto per il
   sistema operativo, così `npm run android:apk` / `android:aab` funzionano identici su Windows, macOS e Linux.

   [7.341.1 collaudo PO: «ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH»]
   Gradle non gira senza un JDK, e il messaggio che dà è un vicolo cieco: non dice DOVE prenderlo. Quasi
   sempre il JDK è già sul PC — Android Studio ne installa uno suo (JBR) — solo che nessuno ha impostato
   JAVA_HOME. Ora il lanciatore lo CERCA nei posti noti e lo passa a Gradle da solo; se non lo trova dice in
   una riga cosa installare. Stessa cosa per l'SDK Android: se `android/local.properties` manca, lo scrive
   puntando all'SDK trovato (è esattamente ciò che farebbe Android Studio al primo avvio).
   Uso: node tools/gradle.mjs <task> [altri argomenti gradle] */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = join(ROOT, 'android');
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const wrapper = join(ANDROID, isWin ? 'gradlew.bat' : 'gradlew');

/* una cartella è un JDK utilizzabile se contiene l'eseguibile java */
const isJdk = (d) => !!d && existsSync(join(d, 'bin', isWin ? 'java.exe' : 'java'));
/* espande un genitore in tutte le sottocartelle che sembrano un JDK (jdk-17, temurin-21…) */
const under = (parent, rx) => {
  try { return readdirSync(parent).filter(n => rx.test(n)).sort().reverse().map(n => join(parent, n)); }
  catch (e) { return []; }
};

function findJdk() {
  if (isJdk(process.env.JAVA_HOME)) return { dir: process.env.JAVA_HOME, from: 'JAVA_HOME' };
  const PF = process.env.ProgramFiles || 'C:\\Program Files';
  const LA = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  const JDKRX = /^(jdk|temurin|zulu|graalvm|corretto|openjdk|java)/i;
  const cands = isWin
    ? [join(PF, 'Android', 'Android Studio', 'jbr'), join(PF, 'Android', 'Android Studio', 'jre'),
       join(LA, 'Programs', 'Android Studio', 'jbr'), join(LA, 'Programs', 'Android Studio', 'jre'),
       ...under(join(PF, 'Eclipse Adoptium'), JDKRX), ...under(join(PF, 'Java'), JDKRX),
       ...under(join(PF, 'Microsoft'), JDKRX), ...under(join(PF, 'Amazon Corretto'), JDKRX)]
    : isMac
      ? ['/Applications/Android Studio.app/Contents/jbr/Contents/Home',
         ...under('/Library/Java/JavaVirtualMachines', /./).map(d => join(d, 'Contents', 'Home'))]
      : ['/opt/android-studio/jbr', '/usr/lib/jvm/default-java',
         ...under('/usr/lib/jvm', /./), join(homedir(), 'android-studio', 'jbr')];
  for (const d of cands) if (isJdk(d)) return { dir: d, from: 'trovato sul sistema' };
  return null;
}

function findSdk() {
  for (const v of [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT])
    if (v && existsSync(v)) return v;
  const LA = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  const cands = isWin ? [join(LA, 'Android', 'Sdk')]
    : isMac ? [join(homedir(), 'Library', 'Android', 'sdk')]
      : [join(homedir(), 'Android', 'Sdk'), '/usr/lib/android-sdk', '/opt/android-sdk'];
  for (const d of cands) if (existsSync(d)) return d;
  return null;
}

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

/* --- JDK: senza, Gradle muore con «JAVA_HOME is not set» e nessuna indicazione su dove prenderlo --- */
const jdk = findJdk();
if (!jdk) {
  console.error('\n❌ Nessun JDK trovato: Gradle non può compilare senza Java.\n');
  console.error('   Se hai Android Studio, il JDK è già dentro — basta indicarlo:');
  console.error(isWin
    ? '     setx JAVA_HOME "C:\\Program Files\\Android\\Android Studio\\jbr"   (poi riapri il terminale)'
    : isMac
      ? '     export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"'
      : '     export JAVA_HOME=/opt/android-studio/jbr');
  console.error('\n   Altrimenti installa un JDK 17 (Temurin LTS): https://adoptium.net\n');
  process.exit(1);
}
const env = { ...process.env, JAVA_HOME: jdk.dir };
if (jdk.from !== 'JAVA_HOME') console.log(`ℹ JDK: ${jdk.dir}  (${jdk.from})`);

/* --- SDK Android: local.properties è ciò che Android Studio scrive al primo avvio; da riga di comando
       nessuno lo fa, e Gradle si ferma con «SDK location not found» --- */
const localProps = join(ANDROID, 'local.properties');
if (!existsSync(localProps) && !process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  const sdk = findSdk();
  if (sdk) {
    writeFileSync(localProps, `sdk.dir=${sdk.replace(/\\/g, '\\\\')}\n`);
    console.log(`ℹ SDK Android: ${sdk}  (scritto in android/local.properties)`);
  } else {
    console.error('\n⚠️  SDK Android non trovato. Se la build fallisce con «SDK location not found»,');
    console.error('   installa Android Studio (che scarica l\'SDK) oppure imposta ANDROID_HOME.\n');
  }
}

console.log(`▶ ${isWin ? 'gradlew.bat' : './gradlew'} ${args.join(' ')}   (in android/)`);
/* su Windows i .bat non sono eseguibili diretti: si passa da cmd.exe /c — così si evita anche `shell:true`,
   che da Node 22 emette il DeprecationWarning DEP0190 sugli argomenti non quotati */
const cmd = isWin ? process.env.ComSpec || 'cmd.exe' : wrapper;
const argv = isWin ? ['/c', wrapper, ...args] : args;
const p = spawn(cmd, argv, { cwd: ANDROID, stdio: 'inherit', env });
p.on('error', (e) => { console.error('\n❌ Avvio di Gradle fallito: ' + e.message); process.exit(1); });
p.on('exit', (code) => process.exit(code == null ? 1 : code));
