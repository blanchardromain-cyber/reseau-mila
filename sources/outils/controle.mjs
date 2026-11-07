// Captures de contrôle d'un chapitre : chaque plan à plusieurs instants, réseau bloqué et journalisé.
// Usage : node pieces/reseau-mila/outils/controle.mjs 1 [plan] [instants séparés par des virgules]
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const racine = resolve(ici, '..', '..', '..');
const n = process.argv[2] || '1';
const seulPlan = process.argv[3] != null && process.argv[3] !== 'tous' ? parseInt(process.argv[3], 10) : null;
const instants = (process.argv[4] || '').split(',').filter(Boolean);
const fichier = join(racine, 'livrables', 'reseau-mila', `chapitre-${n}.html`);
const dossier = join(racine, 'pieces', 'reseau-mila', 'controle', `ch${n}`);
if (seulPlan == null) rmSync(dossier, { recursive: true, force: true });
mkdirSync(dossier, { recursive: true });

const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await nav.newPage({ viewport: { width: 1920, height: 1080 } });
const reseau = [], erreurs = [];
await page.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:')) return r.continue(); reseau.push(u); return r.abort(); });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erreurs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));

const url = pathToFileURL(fichier).href;
await page.goto(`${url}?plan=0&t=0&capture&muet`);
await page.waitForFunction(() => document.body.dataset.fige === '1', null, { timeout: 60000 });
const info = await page.evaluate(() => window.__lecteur.etat());
const durees = await page.evaluate(() => (window.__dureesPlans || null));
void durees;
const nb = info.plans;
const liste = seulPlan != null ? [seulPlan] : [...Array(nb).keys()];
for (const i of liste) {
  const ts = instants.length ? instants : ['1', 'mi', '-1'];
  for (const ti of ts) {
    await page.goto(`${url}?plan=${i}&t=${ti === 'mi' ? 0 : ti}&capture&muet`);
    await page.waitForFunction(() => document.body.dataset.fige === '1', null, { timeout: 60000 });
    let t = ti;
    if (ti === 'mi') {
      const d = await page.evaluate(() => window.__lecteur.duree());
      t = (d / 2).toFixed(1);
      await page.goto(`${url}?plan=${i}&t=${t}&capture&muet`);
      await page.waitForFunction(() => document.body.dataset.fige === '1', null, { timeout: 60000 });
    }
    await page.waitForTimeout(150);
    const nom = `p${i}_t${String(t).replace('-1', 'fin')}.png`;
    await page.screenshot({ path: join(dossier, nom) });
    console.log(nom);
  }
}
console.log(`Requêtes hors fichier : ${reseau.length ? reseau.join(', ') : 'aucune'}`);
console.log(`Erreurs console : ${erreurs.length ? '\n  ' + [...new Set(erreurs)].join('\n  ') : 'aucune'}`);
await nav.close();
