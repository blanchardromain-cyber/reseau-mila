// Test de lecture réelle d'un chapitre : démarrage, →, ←, R, clic, écran de fin, voix décodables.
import { chromium } from 'playwright';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const n = process.argv[2] || '1';
const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await nav.newPage({ viewport: { width: 1280, height: 720 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
await page.goto(pathToFileURL(join(racine, 'livrables', 'reseau-mila', `chapitre-${n}.html`)).href);
await page.waitForFunction(() => document.body.dataset.pret === '1');
const etat = () => page.evaluate(() => window.__lecteur.etat());
// Attend (5 s au plus) que le lecteur ait atteint le plan visé : le rendu logiciel du test peut retarder le fondu.
const attendre = (n) => page.waitForFunction((n) => window.__lecteur.etat().indice === n, n, { timeout: 5000 }).catch(() => {});
const ok = (c, m) => console.log(`${c ? 'OK ' : 'ÉCHEC'} ${m}`);
let e = await etat(); ok(e.indice === 0 && e.t === 0, `avant « Commencer » : plan 0 figé (t=${e.t})`);
await page.click('.demarrer'); await page.waitForTimeout(800);
e = await etat(); ok(e.indice === 0 && e.t > 0.3, `après « Commencer » : le plan 0 se joue (t=${e.t.toFixed(2)})`);
await page.keyboard.press('ArrowRight'); await attendre(1);
e = await etat(); ok(e.indice === 1, `→ : plan ${e.indice}`);
await page.mouse.click(640, 360); await attendre(2);
e = await etat(); ok(e.indice === 2, `clic : plan ${e.indice}`);
await page.keyboard.press('ArrowLeft'); await attendre(1);
e = await etat(); ok(e.indice === 1, `← : plan ${e.indice}`);
// Double appui rapide pendant le fondu : on doit avancer de deux plans, dans l'ordre.
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await attendre(3);
e = await etat(); ok(e.indice === 3, `→ → rapide : plan ${e.indice}`);
await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await attendre(1);
e = await etat(); ok(e.indice === 1, `← ← rapide : plan ${e.indice}`);
await page.waitForTimeout(2000); await page.keyboard.press('KeyR'); await page.waitForTimeout(300);
e = await etat(); ok(e.indice === 1 && e.t < 0.6, `R : plan ${e.indice} rejoué (t=${e.t.toFixed(2)})`);
for (let i = 0; i < 12; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(450); }
e = await etat(); ok(e.enFin, `après le dernier plan : écran de fin (${e.enFin})`);
const fin = await page.evaluate(() => [...document.querySelectorAll('.fin a, .fin button')].map((b) => b.textContent.trim()));
console.log('   boutons de fin :', fin.join(' | '));
await page.keyboard.press('ArrowLeft'); await attendre(e.plans - 1);
e = await etat(); ok(!e.enFin && e.indice === e.plans - 1, `← depuis la fin : dernier plan (${e.indice})`);
const durees = await page.evaluate(async () => {
  const out = {};
  for (const [id, uri] of Object.entries(window.__VOIX)) {
    out[id] = await new Promise((r) => { const a = new Audio(uri); a.onloadedmetadata = () => r(+a.duration.toFixed(1)); a.onerror = () => r('ERREUR'); });
  }
  return out;
});
console.log('   voix décodées (s) :', JSON.stringify(durees));
const total = await page.evaluate(() => window.__lecteur.etat().plans);
console.log(`   plans : ${total} ; qualité finale : ${(await etat()).qualite}`);
ok(erreurs.length === 0, `erreurs JS : ${erreurs.length ? erreurs.join(' / ') : 'aucune'}`);
await nav.close();
