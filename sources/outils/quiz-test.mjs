// Contrôle du quiz : copies de référence (tout faux, réponse unique, hasard, parfaite), rendu à 3 largeurs, réseau bloqué.
import { chromium } from 'playwright';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const url = pathToFileURL(join(racine, 'livrables', 'reseau-mila', 'chapitre-9.html')).href;
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
const reseau = [], erreurs = [];
await page.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:')) return r.continue(); reseau.push(u); return r.abort(); });
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('dialog', (d) => d.accept());
await page.goto(url);
// Remplit selon une stratégie et renvoie la note sur 20 calculée par la page.
async function copie(strategie, graine = 1) {
  await page.goto(url);
  return page.evaluate(([strategie, graine]) => {
    let s = graine; const alea = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const { Q } = window.__quiz;
    Q.forEach((q, i) => {
      const id = 'q' + i;
      if (q.type === 'un' || q.type === 'plusieurs') {
        const n = q.choix.length;
        let ks = [];
        if (strategie === 'parfaite') ks = q.type === 'un' ? [q.bon] : q.bons;
        else if (strategie === 'faux') ks = q.type === 'un' ? [(q.bon + 1) % n] : [...Array(n).keys()].filter((k) => !q.bons.includes(k));
        else if (strategie === 'premier') ks = [0];
        else if (strategie === 'tout') ks = [...Array(n).keys()];
        else ks = q.type === 'un' ? [Math.floor(alea() * n)] : [...Array(n).keys()].filter(() => alea() < 0.5);
        if (q.type === 'un') ks = ks.slice(0, 1);
        ks.forEach((k) => { document.querySelector(`input[name="${id}"][value="${k}"]`).checked = true; });
      } else {
        const sels = [...document.querySelectorAll(`select[name^="${id}_"]`)];
        sels.forEach((sel, k) => {
          const opts = [...sel.options].map((o) => o.value).filter(Boolean);
          let attendu = q.type === 'vf' ? (q.lignes[k][1] ? 'v' : 'f') : q.type === 'ordre' ? String(k) : String(q.lignes[k][1]);
          let v;
          if (strategie === 'parfaite') v = attendu;
          else if (strategie === 'faux') v = opts.find((o) => o !== attendu);
          else if (strategie === 'premier' || strategie === 'tout') v = opts[0];
          else v = opts[Math.floor(alea() * opts.length)];
          sel.value = v;
        });
      }
    });
    document.getElementById('verifier').click();
    return document.querySelector('.note').textContent;
  }, [strategie, graine]);
}
for (const s of ['parfaite', 'faux', 'premier', 'tout']) console.log(`${s.padEnd(9)} : ${await copie(s)}`);
const notes = [];
for (let g = 1; g <= 60; g++) notes.push(parseFloat((await copie('hasard', g * 7919)).replace(',', '.')));
console.log(`hasard    : moyenne ${(notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1)} / 20, max ${Math.max(...notes)}`);
for (const w of [1440, 768, 375]) {
  await page.setViewportSize({ width: w, height: 900 }); await page.goto(url);
  const m = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  console.log(`${w} px : scrollWidth ${m[0]} / clientWidth ${m[1]}`);
  await page.screenshot({ path: join(racine, 'pieces', 'reseau-mila', 'controle', `quiz-${w}.png`), fullPage: false });
}
await page.setViewportSize({ width: 1440, height: 900 });
await copie('hasard', 3);
await page.screenshot({ path: join(racine, 'pieces', 'reseau-mila', 'controle', 'quiz-corrige.png'), fullPage: false });
await page.evaluate(() => document.getElementById('q13').scrollIntoView());
await page.screenshot({ path: join(racine, 'pieces', 'reseau-mila', 'controle', 'quiz-corrige-ordre.png') });
console.log(`Requêtes hors fichier : ${reseau.length ? reseau.join(', ') : 'aucune'} ; erreurs JS : ${erreurs.length ? erreurs.join(' / ') : 'aucune'}`);
await nav.close();
