// Sonde de débogage : ouvre un état figé et liste les objets visibles qui couvrent le centre de l'image.
import { chromium } from 'playwright';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ici = dirname(fileURLToPath(import.meta.url));
const racine = resolve(ici, '..', '..', '..');
const [n, plan, t, x = '0', y = '0'] = process.argv.slice(2);
const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await nav.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${pathToFileURL(join(racine, 'livrables', 'reseau-mila', `chapitre-${n}.html`)).href}?plan=${plan}&t=${t}&capture&muet`);
await page.waitForFunction(() => document.body.dataset.fige === '1');
const r = await page.evaluate(([x, y]) => {
  const { scene, cam } = window.__debug;
  const THREE = scene.constructor; void THREE;
  const ray = new (Object.getPrototypeOf(cam.position).constructor)(); void ray;
  // Raycaster disponible via la classe d'un objet : on passe par la scène
  const rc = new window.__debug.scene.children[0].constructor.prototype.constructor(); void rc;
  return null;
}, [parseFloat(x), parseFloat(y)]).catch((e) => e.message);
void r;
const liste = await page.evaluate(() => {
  const { scene, cam } = window.__debug;
  const out = [];
  scene.traverseVisible((o) => {
    if (!o.isMesh && !o.isSprite) return;
    const p = o.getWorldPosition(o.position.clone());
    const s = o.getWorldScale(o.scale.clone());
    const d = p.distanceTo(cam.position);
    if (d < 6 || Math.max(s.x, s.y, s.z) > 20) out.push(`${o.type} ${o.geometry?.type} d=${d.toFixed(1)} échelle=${s.x.toFixed(2)} pos=${p.toArray().map((v) => v.toFixed(1))}`);
  });
  return { cam: cam.position.toArray(), out };
});
console.log(JSON.stringify(liste, null, 1));
await nav.close();
