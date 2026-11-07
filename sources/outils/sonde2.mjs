// Sonde : position et visibilité des maillages d'un type de géométrie donné, à un état figé.
import { chromium } from 'playwright';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const [n, plan, t, geo] = process.argv.slice(2);
const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await nav.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${pathToFileURL(join(racine, 'livrables', 'reseau-mila', `chapitre-${n}.html`)).href}?plan=${plan}&t=${t}&capture&muet`);
await page.waitForFunction(() => document.body.dataset.fige === '1');
console.log(await page.evaluate((geo) => {
  const out = [];
  window.__debug.scene.traverse((o) => {
    if (o.isMesh && o.geometry.type === geo) {
      let v = true; o.traverseAncestors((a) => { if (!a.visible) v = false; });
      const p = o.getWorldPosition(o.position.clone()); const s = o.getWorldScale(o.scale.clone());
      out.push(`${v && o.visible ? 'V' : '-'} ${p.toArray().map((x) => x.toFixed(2))} s=${s.x.toFixed(2)} col=${o.material.color?.getHexString()}`);
    }
  });
  return out.join('\n');
}, geo));
await nav.close();
