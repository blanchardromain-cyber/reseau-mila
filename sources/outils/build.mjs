// Assemble un chapitre en un seul fichier HTML autonome (Three.js, voix, logo intégrés), puis la page d'index.
// Usage : node pieces/reseau-mila/outils/build.mjs 1   (la voix doit avoir été produite par voix.mjs)
import { build } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const piece = resolve(ici, '..');
const racine = resolve(piece, '..', '..');
const sortie = join(racine, 'livrables', 'reseau-mila');
const LOGO = 'C:/Users/blanchard.romain/Documents/ClaudeConfig/Site Techno/Logo college/Nouveau logo.png';
mkdirSync(sortie, { recursive: true });

export const CHAPITRES = [
  [1, 'Le besoin', 'Le café de Mila et les trois topologies : anneau, maillé, étoile.'],
  [2, 'Relier les appareils', 'Le commutateur, le câble RJ45 et la borne Wi-Fi.'],
  [3, 'Le serveur', 'Le gardien des identités et l\'armoire à fichiers.'],
  [4, 'Pannes !', 'Diagnostiquer les pannes A à D, au café et au collège.'],
  [5, 'Vers Internet', 'Le modem traducteur et le routeur aiguilleur.'],
  [6, 'Se protéger', 'Passerelle, pare-feu et antivirus face à trois menaces.'],
  [7, 'Mission maintenance', 'Modem ou routeur ? À toi de trouver.'],
  [8, 'Du collège à la maison', 'La box Internet et le réseau numérique.'],
  [9, 'Quiz : as-tu tout compris ?', '25 questions illustrées, corrigées et expliquées à la fin.'],
];

const n = parseInt(process.argv[2], 10);
const logo = `data:image/png;base64,${readFileSync(LOGO).toString('base64')}`;

if (n) {
  const res = await build({
    entryPoints: [join(piece, 'src', `chap${n}.js`)], bundle: true, write: false, format: 'iife', minify: true,
    target: 'es2020', legalComments: 'inline', logLevel: 'warning',
  });
  const code = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const dossierVoix = join(piece, 'voix', `chap${n}`);
  const reperes = JSON.parse(readFileSync(join(dossierVoix, 'reperes.json'), 'utf8'));
  const voix = {};
  for (const id of Object.keys(reperes)) voix[id] = `data:audio/mpeg;base64,${readFileSync(join(dossierVoix, `${id}.mp3`)).toString('base64')}`;
  const suivant = n < 9 && existsSync(join(sortie, `chapitre-${n + 1}.html`)) ? JSON.stringify(`chapitre-${n + 1}.html`) : 'null';
  const titre = CHAPITRES.find((c) => c[0] === n)[1];
  const html = readFileSync(join(piece, 'src', 'gabarit.html'), 'utf8')
    .replace('%%TITRE%%', `Le réseau de Mila · Chapitre ${n} · ${titre}`)
    .replace('%%REPERES%%', () => JSON.stringify(reperes))
    .replace('%%SUIVANT%%', suivant)
    .replace('%%LOGO%%', logo)
    .replace('%%VOIX%%', () => JSON.stringify(voix))
    .replace('%%CODE%%', () => code);
  const f = join(sortie, `chapitre-${n}.html`);
  writeFileSync(f, html);
  console.log(`${f} : ${(html.length / 1e6).toFixed(2)} Mo`);
}

// Quiz (chapitre 9) : page autonome sans 3D, recopiée telle quelle.
writeFileSync(join(sortie, 'chapitre-9.html'), readFileSync(join(piece, 'src', 'quiz.html'), 'utf8'));

// Index : les chapitres déjà produits sont des liens, les autres sont annoncés.
const cartes = CHAPITRES.map(([k, t, d]) => {
  const pret = existsSync(join(sortie, `chapitre-${k}.html`));
  return pret
    ? `<a class="carte" href="chapitre-${k}.html"><span class="num">${k}</span><h2>${t}</h2><p>${d}</p></a>`
    : `<div class="carte attente"><span class="num">${k}</span><h2>${t}</h2><p>${d}</p><em>Bientôt</em></div>`;
}).join('\n    ');
const index = readFileSync(join(piece, 'src', 'index.html'), 'utf8').replace('%%LOGO%%', logo).replace('%%CARTES%%', cartes);
writeFileSync(join(sortie, 'index.html'), index);
console.log(`${join(sortie, 'index.html')} écrit`);
