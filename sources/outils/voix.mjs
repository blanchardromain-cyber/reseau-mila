// Voix off d'un chapitre : une synthèse Piper par phrase (cache par texte), puis un MP3 par plan
// et les repères de chaque phrase (début, fin, en secondes depuis le début du plan).
// Usage : node pieces/reseau-mila/outils/voix.mjs 1
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const piece = resolve(ici, '..');
const racine = resolve(piece, '..', '..');
const python = join(racine, '.venv', 'Scripts', 'python.exe');
const modele = join(racine, 'models', 'fr_FR-siwis-medium.onnx');
const ENV = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

const DEBUT = 0.4;      // silence avant la première phrase : le décor apparaît d'abord
const ENTRE = 0.45;     // silence entre deux phrases
const VITESSE = 1.08;   // > 1 : plus lent (élèves de 12 ans, salle qui résonne)

const n = process.argv[2];
if (!n) { console.error('Usage : node voix.mjs <numéro de chapitre>'); process.exit(1); }
const source = JSON.parse(readFileSync(join(piece, 'voix', `chap${n}.json`), 'utf8'));
const cache = join(piece, 'voix', 'cache');
const sortie = join(piece, 'voix', `chap${n}`);
mkdirSync(cache, { recursive: true });
mkdirSync(sortie, { recursive: true });

function duree(wav) {
  // En-tête WAV : octets/s à l'offset 28, taille des données dans le bloc « data ».
  const b = readFileSync(wav);
  const debit = b.readUInt32LE(28);
  let i = 12;
  while (i < b.length - 8) {
    const id = b.toString('ascii', i, i + 4), taille = b.readUInt32LE(i + 4);
    if (id === 'data') return taille / debit;
    i += 8 + taille;
  }
  throw new Error(`pas de bloc data dans ${wav}`);
}

function phrase(texte) {
  const h = createHash('sha1').update(`${VITESSE}|${texte}`).digest('hex').slice(0, 16);
  const wav = join(cache, `${h}.wav`);
  if (!existsSync(wav)) {
    const r = spawnSync(python, ['-m', 'piper', '--model', modele, '--length-scale', String(VITESSE), '--output_file', wav],
      { input: texte, encoding: 'utf8', env: ENV });
    if (r.status !== 0 || !existsSync(wav)) { console.error(`Piper a échoué : « ${texte} »\n${r.stderr}`); process.exit(1); }
  }
  return wav;
}

const reperes = {};
for (const plan of source.plans) {
  const wavs = plan.phrases.map(phrase);
  const d = wavs.map(duree);
  let t = DEBUT;
  const ph = d.map((x) => { const s = [+t.toFixed(3), +(t + x).toFixed(3)]; t += x + ENTRE; return s; });
  const total = ph.at(-1)[1];
  // Montage : silence initial, phrases séparées par des silences, normalisation du volume.
  const entrees = [], filtres = [];
  wavs.forEach((w, i) => { entrees.push('-i', w); filtres.push(`[${i}]apad=pad_dur=${i < wavs.length - 1 ? ENTRE : 0.2}[p${i}]`); });
  const chaine = `${filtres.join(';')};${wavs.map((_, i) => `[p${i}]`).join('')}concat=n=${wavs.length}:v=0:a=1,adelay=${DEBUT * 1000}:all=1,loudnorm=I=-16:TP=-1.5,aresample=44100`;
  const mp3 = join(sortie, `${plan.id}.mp3`);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...entrees, '-filter_complex', chaine, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', mp3], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
  reperes[plan.id] = { fin: +total.toFixed(3), phrases: ph };
  console.log(`${plan.id} : ${total.toFixed(1)} s, ${ph.length} phrase(s)`);
}
writeFileSync(join(sortie, 'reperes.json'), JSON.stringify(reperes, null, 1));
const somme = Object.values(reperes).reduce((s, p) => s + p.fin, 0);
console.log(`Total voix : ${somme.toFixed(1)} s`);
