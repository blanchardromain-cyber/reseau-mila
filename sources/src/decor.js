// Décor commun aux chapitres 2 à 8 : lumière, ambiance jour / monde des données, village, café de Mila.
// (Le chapitre 1 a sa propre copie de ces réglages ; ce sont les mêmes valeurs.)
import * as THREE from 'three';
import { C, cafe, village, mila, poser } from './modeles.js';
import { lerp } from './moteur.js';

export function decor(scene) {
  const hemi = new THREE.HemisphereLight('#f4f8ff', '#9b8a70', 1.15);
  const soleil = new THREE.DirectionalLight('#fff1dc', 2.3);
  soleil.position.set(14, 30, 18); soleil.target.position.set(0, 4, 0);
  soleil.castShadow = true; soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.02;
  Object.assign(soleil.shadow.camera, { left: -18, right: 18, top: 18, bottom: -14, near: 1, far: 80 });
  const contre = new THREE.DirectionalLight('#7fb2ff', 0);
  contre.position.set(-10, 18, -12); contre.target.position.set(0, 10, 0);
  scene.add(hemi, soleil, soleil.target, contre, contre.target);
  scene.fog = new THREE.Fog('#cfe8f7', 90, 240);
  const JOUR = new THREE.Color('#cfe8f7'), NUIT = new THREE.Color(C.nuit);
  function ambiance(k) { // 0 : jour ; 1 : monde des données (bleu nuit, sol caché par le brouillard)
    const c = JOUR.clone().lerp(NUIT, k);
    scene.background = c; scene.fog.color.copy(c);
    scene.fog.near = lerp(90, 16, k); scene.fog.far = lerp(240, 34, k);
    hemi.intensity = lerp(1.15, 1.25, k); hemi.color.set(k > 0.5 ? '#d6e4ff' : '#f4f8ff');
    soleil.intensity = lerp(2.3, 2.0, k); contre.intensity = lerp(0, 3.0, k);
  }
  // Studio du monde des données : lumière propre, placée en hauteur (y = 40), loin du village.
  function studio(position) { soleil.target.position.copy(position); contre.target.position.copy(position); soleil.position.copy(position).add(new THREE.Vector3(14, 26, 18)); }
  function soleilVillage() { soleil.position.set(14, 30, 18); soleil.target.position.set(0, 4, 0); contre.target.position.set(0, 10, 0); }

  const vil = village(); scene.add(vil);
  const caf = cafe(); scene.add(caf.groupe);
  const laMila = mila(); poser(laMila, 1.2, 0, -1.55, caf.groupe);

  function ouvrirCafe(k) { // 0 fermé, 1 ouvert (toit levé, façade presque transparente)
    caf.mFac.opacity = lerp(1, 0.06, k); caf.mVitre.opacity = lerp(0.45, 0.03, k);
    caf.av.material.opacity = lerp(1, 0.06, k); caf.ens.material.opacity = lerp(1, 0, k);
    caf.toit.position.y = caf.Hm + 5 * k; caf.mToit.opacity = 1 - k; caf.toit.visible = k < 0.99;
  }
  function reinitialiser() {
    vil.visible = caf.groupe.visible = false;
    ouvrirCafe(0);
    for (const d of Object.values(caf.appareils)) { d.visible = true; d.allumer(1); }
    laMila.visible = true; laMila.position.set(1.2, 0, -1.55); laMila.rotation.set(0, 0, 0);
    ambiance(0); soleilVillage();
  }
  // Nuit sur le village (sans le brouillard du monde des données) : 0 jour, 1 nuit.
  const CIEL_NUIT = new THREE.Color('#1a2440');
  function nuit(k) {
    const c = JOUR.clone().lerp(CIEL_NUIT, k);
    scene.background = c; scene.fog.color.copy(c);
    hemi.intensity = lerp(1.15, 0.35, k); soleil.intensity = lerp(2.3, 0.25, k); hemi.color.set(k > 0.5 ? '#9fb4e8' : '#f4f8ff');
  }
  const orbite = (t) => { const a = -0.45 + t * 0.03; return { p: [Math.sin(a) * 30, 27 + Math.sin(t * 0.2) * 0.5, Math.cos(a) * 30], v: [0, 3, -5] }; };
  return { vil, caf, laMila, ambiance, studio, ouvrirCafe, reinitialiser, orbite, nuit };
}

// Un personnage parcourt une liste de points [x, z] entre t0 et t1, à vitesse constante (départ et arrivée en douceur).
export function marcher(perso, t, t0, t1, pts) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  const u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  let s = e * L, i = 0;
  while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; }
  const f = seg[i] ? Math.min(1, s / seg[i]) : 1;
  const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
  perso.position.set(lerp(ax, bx, f), u > 0 && u < 1 ? Math.abs(Math.sin(t * 7)) * 0.03 : 0, lerp(az, bz, f));
  perso.rotation.y = Math.atan2(bx - ax, bz - az);
}
