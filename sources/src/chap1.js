// Chapitre 1 : le besoin. Le café de Mila, ses six appareils isolés, puis les trois topologies.
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, clamp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import {
  C, mat, appareil, colis, cable, courbePlate, chemin, mila, cafe, village, plateau, posHexa, ORDRE, halo, panneauTexte, poser, boite,
} from './modeles.js';
import { vignetteCollege } from './college.js';

const NOMS = {
  caisse: 'Caisse', ordinateur: 'Ordinateur de gestion', imprimante: 'Imprimante à tickets',
  imprimanteCuisine: 'Imprimante de cuisine', ecranMenu: 'Écran du menu', tpe: 'Terminal de paiement',
};
const SVG_MAISON = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" fill="currentColor"/></svg>';
const SVG_COLLEGE = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2 1 7l11 5 9-4.1V15h2V7zM5 12.2V17l7 4 7-4v-4.8l-7 3.2z" fill="currentColor"/></svg>';

const ctx = lancerChapitre({
  numero: 1, titre: 'Le besoin',
  base, vignette: null, plans: [],
});
const { scene, cam, etiquette } = ctx;

// ---------- lumière et ambiance ----------
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
function ambiance(k) { // 0 jour, 1 monde des données
  const c = JOUR.clone().lerp(NUIT, k);
  scene.background = c; scene.fog.color.copy(c);
  scene.fog.near = lerp(90, 16, k); scene.fog.far = lerp(240, 34, k);
  hemi.intensity = lerp(1.15, 1.25, k); hemi.color.set(k > 0.5 ? '#d6e4ff' : '#f4f8ff');
  soleil.intensity = lerp(2.3, 2.0, k); contre.intensity = lerp(0, 3.0, k);
}

// ---------- décor ----------
const vil = village(); scene.add(vil);
const caf = cafe(); scene.add(caf.groupe);
const laMila = mila(); poser(laMila, 1.2, 0, -1.55, caf.groupe);
const colisCafe = colis(0.17); scene.add(colisCafe);
const interro = panneauTexte('?', { fond: C.panne, couleur: '#1b2333', taille: 330 }); interro.scale.setScalar(0.55); scene.add(interro);

// ---------- topologies ----------
const PLAT = new THREE.Vector3(0, 10, 0);
const ECH = 2.3; // taille des appareils sur le plateau (lisibles au vidéoprojecteur)
function topo() {
  const ext = new THREE.Group(); scene.add(ext);           // ne tourne pas (compteur, étiquettes fixes)
  const rot = new THREE.Group(); ext.add(rot);             // tourne lentement
  const plat = plateau(); rot.add(plat);
  const devs = ORDRE.map((type, i) => {
    const d = appareil(type, { pied: true }); d.scale.setScalar(ECH);
    const p = posHexa(i); d.position.copy(p); d.rotation.y = Math.atan2(p.x, p.z); rot.add(d); return d;
  });
  const compteur = new THREE.Object3D(); compteur.position.set(-6.2, 1.6, 0); ext.add(compteur);
  const paquets = [0, 1, 2, 3].map(() => { const c = colis(0.22); rot.add(c); return c; });
  return { ext, rot, plat, devs, compteur, paquets, cables: [] };
}
const pt = (i, r = 2.75) => posHexa(i, r).setY(0.1);

// Anneau : 6 câbles en boucle
const anneau = topo();
for (let i = 0; i < 6; i++) { const c = cable(courbePlate(pt(i), pt((i + 1) % 6), 0.06)); anneau.rot.add(c.groupe); anneau.cables.push(c); }
const tourAnneau = chemin(anneau.cables.map((c) => [c.courbe, false]));
const COUPE_ANNEAU = 2;

// Maillé : chaque appareil relié à tous les autres (15 câbles) ; les diagonales passent en arche.
const maille = topo();
const paires = [];
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) paires.push([i, j]);
const ordreDessin = [...paires].sort((a, b) => ((a[1] - a[0]) % 5 === 1 ? 0 : 1) - ((b[1] - b[0]) % 5 === 1 ? 0 : 1));
for (const [i, j] of ordreDessin) {
  const ecart = Math.min(j - i, 6 - (j - i));
  const h = ecart === 1 ? 0.06 : ecart === 2 ? 0.35 : 0.9 + i * 0.35;
  const c = cable(courbePlate(pt(i), pt(j), h)); c.paire = [i, j]; maille.rot.add(c.groupe); maille.cables.push(c);
}
const cableM = (i, j) => maille.cables.find((c) => (c.paire[0] === i && c.paire[1] === j) || (c.paire[0] === j && c.paire[1] === i));
const direct = cableM(0, 3), secours = [cableM(0, 4), cableM(3, 4)];
const cheminDirect = chemin([[direct.courbe, direct.paire[0] !== 0]]);
const cheminSecours = chemin([[secours[0].courbe, secours[0].paire[0] !== 0], [secours[1].courbe, secours[1].paire[0] !== 4]]);

// Étoile : un commutateur au centre, 6 câbles
const etoile = topo();
const centre = appareil('commutateur'); centre.scale.setScalar(1.7); etoile.rot.add(centre);
for (let i = 0; i < 6; i++) { const c = cable(courbePlate(posHexa(i, 0.85).setY(0.1), pt(i), 0.08)); etoile.rot.add(c.groupe); etoile.cables.push(c); }
const PANNE = 3; // imprimante de cuisine
const viaCentre = (a, b) => chemin([[etoile.cables[a].courbe, true], [etoile.cables[b].courbe, false]]);
const fluxEtoile = [[0, 1], [4, 2], [5, PANNE], [PANNE, 0]].map(([a, b]) => ({ a, b, f: viaCentre(a, b) }));
const fiche = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.22), mat('#d9dee5', { r: 0.4 })); etoile.rot.add(fiche);
const eclair = halo(C.panne, 2.2); etoile.rot.add(eclair);
const etincelle = halo(C.panne, 2.4); scene.add(etincelle);
const interroCentre = panneauTexte('?', { fond: null, couleur: C.or, taille: 380 }); interroCentre.scale.setScalar(1.6); etoile.rot.add(interroCentre);
const milaPlateau = mila(); milaPlateau.scale.setScalar(1.25); etoile.ext.add(milaPlateau);

const TOPOS = [anneau, maille, etoile];
const pv = new THREE.Vector3();
const GRIS = new THREE.Color(C.eteint), ORANGE = new THREE.Color(C.donnees);

// États des topologies, réutilisés par les plans 1.4 à 1.8. Toutes les valeurs dépendent de t.
function etatAnneau(t, { dessin = 1, flux0 = Infinity, coupe = Infinity, gris = 0 } = {}) {
  anneau.cables.forEach((c, i) => {
    c.regler({ p: clamp(dessin * 6 - i), trou: i === COUPE_ANNEAU ? 0.28 * easeOut(prog(t, coupe, coupe + 0.3)) : 0 });
    c.teinte(new THREE.Color(C.local).lerp(GRIS, gris), lerp(0.35, 0.05, gris));
  });
  anneau.devs.forEach((d) => d.allumer(1 - 0.85 * gris));
  anneau.paquets.forEach((p, k) => {
    p.visible = t > flux0 && k < 3;
    if (!p.visible) return;
    const u = (((Math.min(t, coupe) - flux0) / 9 + k / 3) % 1 + 1) % 1;
    tourAnneau(u, p.position); p.position.y += 0.22;
    p.userData.corps.material.color.copy(ORANGE).lerp(GRIS, gris); p.userData.halo.material.opacity = 0.55 * (1 - gris);
  });
  const ki = Math.round(clamp(dessin) * 6);
  return ki;
}
function etatMaille(t, { dessin = 1, direct0 = Infinity, coupe = Infinity, secours0 = Infinity } = {}) {
  maille.cables.forEach((c, k) => { c.regler({ p: clamp(dessin * 15 - k), trou: c === direct ? 0.22 * easeOut(prog(t, coupe, coupe + 0.3)) : 0 }); c.normal(); });
  const surbr = easeOut(prog(t, secours0 - 0.4, secours0 + 0.2));
  for (const c of secours) c.teinte(new THREE.Color(C.local).lerp(new THREE.Color(C.wifi), surbr), lerp(0.35, 1.4, surbr));
  maille.devs.forEach((d) => d.allumer(1));
  maille.paquets.forEach((p) => { p.visible = false; });
  const p = maille.paquets[0];
  if (t > direct0 && t < coupe) { p.visible = true; cheminDirect(((t - direct0) / 2.4) % 1, p.position); p.position.y += 0.22; }
  if (t > secours0) {
    for (let k = 0; k < 2; k++) {
      const q = maille.paquets[k]; q.visible = true; cheminSecours((((t - secours0) / 3.2) + k / 2) % 1, q.position); q.position.y += 0.22;
    }
  }
  maille.paquets.forEach((q) => { q.userData.corps.material.color.copy(ORANGE); q.userData.halo.material.opacity = 0.55; });
  return Math.round(clamp(dessin) * 15);
}
function etatEtoile(t, { centre0 = -1, dessin = 1, flux0 = Infinity, panne = Infinity } = {}) {
  const s = pop(t, centre0);
  centre.visible = s > 0.001; centre.scale.setScalar(1.7 * s);
  const debranche = easeOut(prog(t, panne, panne + 0.6));
  etoile.cables.forEach((c, i) => { c.regler({ p: clamp(dessin * 6 - i) * (i === PANNE ? 1 - 0.22 * debranche : 1) }); c.normal(); });
  if (debranche > 0) etoile.cables[PANNE].teinte(new THREE.Color(C.local).lerp(GRIS, debranche), 0.2);
  etoile.devs.forEach((d, i) => d.allumer(i === PANNE ? 1 - 0.9 * debranche : 1));
  fiche.visible = debranche > 0;
  if (fiche.visible) { etoile.cables[PANNE].courbe.getPoint(1 - 0.22 * debranche, fiche.position); fiche.position.y += 0.02; }
  const fl = clamp((t - panne) / 0.5);
  eclair.visible = t > panne && t < panne + 1.6;
  if (eclair.visible) { eclair.position.copy(etoile.devs[PANNE].position).setY(1.3); eclair.material.opacity = Math.sin(fl * Math.PI) * 0.9 + 0.1 * Math.sin(t * 30); }
  etoile.paquets.forEach((p, k) => {
    const fx = fluxEtoile[k];
    const touche = fx.a === PANNE || fx.b === PANNE;
    p.visible = t > flux0 && !(touche && t > panne);
    if (!p.visible) return;
    fx.f(((t - flux0) / 3 + k * 0.27) % 1, p.position); p.position.y += 0.22;
    p.userData.corps.material.color.copy(ORANGE); p.userData.halo.material.opacity = 0.55;
  });
  return Math.round(clamp(dessin) * 6);
}

function montrerTopo(tp, { pos = PLAT, echelle = 1, rotation = 0 } = {}) {
  tp.ext.visible = true; tp.ext.position.copy(pos); tp.ext.scale.setScalar(echelle); tp.rot.rotation.y = rotation;
  tp.plat.userData.bord.material.color.set(C.local).multiplyScalar(2.2);
  tp.devs.forEach((d, i) => { d.position.copy(posHexa(i)); d.rotation.y = Math.atan2(d.position.x, d.position.z); d.scale.setScalar(ECH); d.visible = true; });
}
function compteur(tp, n, alpha = 1, accent = false) {
  etiquette(`cpt${TOPOS.indexOf(tp)}`, '', 'compteur').montrer(tp.compteur, alpha, [0, 0, 0],
    `<b>${n}</b> câble${n > 1 ? 's' : ''}${accent ? ' !' : ''}`);
}

// ---------- remise à zéro à chaque image ----------
function base() {
  vil.visible = false; caf.groupe.visible = false; colisCafe.visible = false; interro.visible = false; etincelle.visible = false;
  for (const tp of TOPOS) { tp.ext.visible = false; tp.paquets.forEach((p) => p.visible = false); }
  interroCentre.visible = false; milaPlateau.visible = false; centre.visible = true; fiche.visible = false; eclair.visible = false;
  ctx.renderer.domElement.style.filter = '';
  caf.mFac.opacity = 1; caf.mVitre.opacity = 0.45; caf.mToit.opacity = 1; caf.toit.position.y = caf.Hm; caf.toit.visible = true;
  caf.av.material.opacity = 1; caf.ens.material.opacity = 1;
  for (const d of Object.values(caf.appareils)) { d.visible = true; d.allumer(1); }
  ambiance(0);
}
function vueCafeOuverte(k) { // 0 fermé, 1 ouvert (toit levé, façade presque transparente)
  caf.mFac.opacity = lerp(1, 0.06, k); caf.mVitre.opacity = lerp(0.45, 0.03, k);
  caf.av.material.opacity = lerp(1, 0.06, k); caf.ens.material.opacity = lerp(1, 0, k);
  caf.toit.position.y = caf.Hm + 5 * k; caf.mToit.opacity = 1 - k; caf.toit.visible = k < 0.99;
}
const orbite = (t) => { const a = -0.45 + t * 0.03; return { p: [Math.sin(a) * 30, 27 + Math.sin(t * 0.2) * 0.5, Math.cos(a) * 30], v: [0, 3, -5] }; };
const CAM_PLAT = { p: [0, 15.4, 10.2], v: [0, 9.9, 0.4], fov: 40 };
const CAM_P2 = { p: [0.9, 15.0, 9.6], v: [0, 9.9, 0.3], fov: 40 };
const CAM_P3 = { p: [-0.9, 15.6, 10.2], v: [0, 10.0, 0.3], fov: 41 };

// ---------- plans ----------
const plans = [
  { // 1.0 Titre
    id: '1.0', min: 7, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 1 · Le besoin', style: 'soustitre' }],
    maj(t) {
      vil.visible = caf.groupe.visible = true; laMila.animer(t);
      const o = orbite(t); camera(cam, 0, [{ t: 0, ...o, fov: 34 }]);
    },
  },
  { // 1.1 Légende
    id: '1.1', fondu: false,
    maj(t, P) {
      vil.visible = caf.groupe.visible = true; laMila.animer(t);
      const o = orbite(t + 7); camera(cam, 0, [{ t: 0, ...o, fov: 34 }]);
      ctx.renderer.domElement.style.filter = `blur(${6 * fondu(t, 0, 0.6)}px) brightness(${1 - 0.35 * fondu(t, 0, 0.6)})`;
      ctx.legende.classList.add('plan');
      ctx.legende.style.opacity = fondu(t, 0.1, 0.5);
      ctx.lignesLeg.forEach((l, k) => { const u = easeOut(prog(t, P(k + 1) - 0.1, P(k + 1) + 0.4)); l.style.opacity = u; l.style.transform = `translateX(${(1 - u) * -30}px)`; });
    },
  },
  { // 1.2 Le café de Mila
    id: '1.2',
    textes: (P) => [{ t: P(1), txt: '6 appareils…', ligne: 1 }, { t: P(2) + 1.6, txt: 'qui ne se parlent pas.', ligne: 2 }],
    maj(t, P, F) {
      vil.visible = caf.groupe.visible = true;
      laMila.animer(t, { salut: Math.sin(Math.PI * prog(t, 1.6, 4.4)) });
      vueCafeOuverte(easeInOut(prog(t, 0.8, 2.8)));
      camera(cam, t, [
        { t: 0, p: [-9, 15, 30], v: [0, 1.5, 0], fov: 34 },
        { t: 2.6, p: [2.6, 7.2, 10.4], v: [0.9, 1.1, -1.4], fov: 36 },
        { t: P(2), p: [1.9, 6.4, 8.6], v: [0.9, 1.0, -1.4], fov: 38 },
        { t: P(2) + 7, p: [1.6, 6.0, 7.9], v: [1.0, 1.1, -1.4], fov: 38 },
      ]);
      // Étiquettes dans l'ordre de la voix ; celles du comptoir sont posées devant lui, pour ne pas cacher Mila.
      const d = F(1) - P(1);
      const quand = { caisse: 0.24, ordinateur: 0.36, imprimante: 0.5, imprimanteCuisine: 0.56, ecranMenu: 0.7, tpe: 0.86 };
      const decal = { caisse: [0, -0.75, 1.15], imprimante: [-0.35, -0.45, 1.15], tpe: [0.35, -0.45, 1.15], ecranMenu: [0, 0.05, 0], ordinateur: [0, 0, 0], imprimanteCuisine: [0, 0, 0] };
      for (const [k, q] of Object.entries(quand)) {
        const a = easeOut(prog(t, P(1) + q * d - 0.1, P(1) + q * d + 0.35));
        const dev = caf.appareils[k];
        dev.allumer(0.25 + 0.75 * a);
        etiquette(`cafe-${k}`, NOMS[k]).montrer(dev.userData.ancre, a, decal[k]);
      }
      // Le colis part de la caisse vers l'imprimante… et tombe sur le comptoir : aucun chemin.
      const t0 = P(2) + 0.6;
      if (t > t0) {
        colisCafe.visible = true;
        const a = caf.appareils.caisse.position, b = caf.appareils.imprimante.position;
        const u = prog(t, t0, t0 + 1.0), chute = prog(t, t0 + 1.0, t0 + 1.5);
        const x = lerp(a.x, lerp(a.x, b.x, 0.5), easeOut(u)), z = lerp(a.z, b.z, 0.5 * easeOut(u)) + 0.25 * u;
        let y = 1.75 + Math.sin(Math.PI * u * 0.8) * 0.6;
        if (chute > 0) y = lerp(y, 1.22, chute * chute) + Math.abs(Math.sin(chute * Math.PI * 2)) * 0.18 * (1 - chute);
        colisCafe.position.set(x, y, z); colisCafe.rotation.z = chute * 1.2;
        const q = pop(t, t0 + 1.6);
        interro.visible = q > 0.01; interro.scale.setScalar(0.5 * q); interro.position.set(x, 1.85 + Math.sin(t * 3) * 0.04, z);
      }
    },
  },
  { // 1.3 Comment relier ? Les appareils montent sur le plateau.
    id: '1.3', fondu: false, min: 8,
    textes: (P) => [{ t: P(0), txt: 'Comment relier les appareils de Mila ?', style: 'centre' }, { t: P(1) + 1.2, txt: 'Trois façons : les topologies.', style: 'centre l2' }],
    maj(t) {
      const nuit = easeInOut(prog(t, 2.6, 4.6));
      ambiance(nuit);
      vil.visible = caf.groupe.visible = nuit < 0.999;
      vueCafeOuverte(1); laMila.animer(t);
      montrerTopo(anneau);
      const sp = easeOut(prog(t, 0.2, 1.0));
      anneau.plat.scale.setScalar(Math.max(0.001, sp));
      etatAnneau(t, { dessin: 0 });
      anneau.devs.forEach((d, i) => {
        const k = ORDRE[i];
        const u = easeInOut(prog(t, 0.5 + i * 0.16, 2.7 + i * 0.16));
        const src = caf.appareils[k];
        src.visible = u <= 0;
        src.getWorldPosition(pv);
        const cible = posHexa(i);
        const loc = pv.clone().sub(anneau.ext.position);
        d.position.set(lerp(loc.x, cible.x, u), lerp(loc.y, cible.y, u) + Math.sin(Math.PI * u) * 1.5, lerp(loc.z, cible.z, u));
        d.scale.setScalar(lerp(1, ECH, u));
        d.rotation.y = lerp(0, Math.atan2(cible.x, cible.z), u);
      });
      camera(cam, t, [
        { t: 0, p: [1.6, 6.0, 7.9], v: [1.0, 1.1, -1.4], fov: 38 },
        { t: 3.2, ...CAM_PLAT },
      ]);
    },
  },
  { // 1.4 Anneau
    id: '1.4',
    textes: (P) => [
      { t: 0.3, txt: 'Réseau en anneau', style: 'etiquettePlan' },
      { t: P(2), txt: 'En anneau : une seule coupure…', ligne: 1 },
      { t: P(3), txt: 'et TOUT le réseau est bloqué.', ligne: 2 },
    ],
    maj(t, P, F) {
      ambiance(1); montrerTopo(anneau, { rotation: t * 0.06 });
      const n = etatAnneau(t, { dessin: prog(t, 0.6, F(0)), flux0: P(1) - 0.3, coupe: P(2) + 0.9, gris: easeOut(prog(t, P(3), P(3) + 0.8)) });
      compteur(anneau, n, fondu(t, 0.6, 0.3));
      const tc = P(2) + 0.9;
      etincelle.visible = t > tc && t < tc + 1.4;
      if (etincelle.visible) {
        anneau.cables[COUPE_ANNEAU].courbe.getPoint(0.5, pv); anneau.rot.localToWorld(pv);
        etincelle.position.copy(pv).setY(pv.y + 0.2);
        etincelle.material.opacity = (1 - prog(t, tc, tc + 1.4)) * (0.7 + 0.3 * Math.sin(t * 40));
        etincelle.scale.setScalar(2.4 * (0.6 + prog(t, tc, tc + 0.3)));
      }
      etiquette('bloque', 'Réseau bloqué', 'panne').montrer(anneau.compteur, easeOut(prog(t, P(3) + 0.4, P(3) + 0.9)), [0, -1.4, 0]);
      camera(cam, t, [{ t: 0, ...CAM_PLAT }, { t: 14, ...CAM_P2 }]);
    },
  },
  { // 1.5 Maillé
    id: '1.5',
    textes: (P) => [
      { t: 0.3, txt: 'Réseau maillé', style: 'etiquettePlan' },
      { t: P(1), txt: 'Maillé : toujours un chemin de secours.', ligne: 1 },
      { t: P(2), txt: 'Mais 15 câbles pour 6 appareils !', ligne: 2 },
    ],
    maj(t, P, F) {
      ambiance(1); montrerTopo(maille, { rotation: t * 0.06 });
      const tc = P(1) + 0.9;
      const n = etatMaille(t, { dessin: prog(t, 0.5, F(0) + 0.3), direct0: F(0), coupe: tc, secours0: tc + 0.7 });
      const accent = t > P(2);
      compteur(maille, n, 1, accent);
      etincelle.visible = t > tc && t < tc + 1.4;
      if (etincelle.visible) {
        direct.courbe.getPoint(0.5, pv); maille.rot.localToWorld(pv);
        etincelle.position.copy(pv); etincelle.material.opacity = (1 - prog(t, tc, tc + 1.4)) * (0.7 + 0.3 * Math.sin(t * 40));
        etincelle.scale.setScalar(1.5 * (0.6 + prog(t, tc, tc + 0.3)));
      }
      etiquette('secours', 'Chemin de secours', 'secours').montrer(maille.devs[4].userData.ancre, easeOut(prog(t, tc + 0.8, tc + 1.3)), [0, 0.4, 0]);
      camera(cam, t, [{ t: 0, ...CAM_P2 }, { t: 14, ...CAM_P3 }]);
    },
  },
  { // 1.6 Étoile
    id: '1.6',
    textes: (P) => [
      { t: 0.3, txt: 'Réseau en étoile', style: 'etiquettePlan' },
      { t: P(1), txt: 'En étoile : chaque appareil a son propre câble.', ligne: 1 },
      { t: P(3), txt: 'Un appareil en panne n\'arrête pas les autres.', ligne: 2 },
    ],
    maj(t, P, F) {
      ambiance(1); montrerTopo(etoile, { rotation: t * 0.05 });
      const panne = P(2) + 1.6;
      const n = etatEtoile(t, { centre0: P(0) + 2.2, dessin: prog(t, P(1), F(1) + 0.2), flux0: F(1), panne });
      compteur(etoile, n, fondu(t, P(1), 0.3));
      etiquette('centre', 'Commutateur', 'local').montrer(centre, easeOut(prog(t, P(0) + 2.5, P(0) + 3)) * (1 - fondu(t, P(1) + 1.5, 0.5)), [0, 0.9, 0]);
      etiquette('enpanne', 'Imprimante de cuisine : en panne', 'panne').montrer(etoile.devs[PANNE].userData.ancre, easeOut(prog(t, panne + 0.3, panne + 0.8)), [0, 0.5, 0]);
      camera(cam, t, [{ t: 0, ...CAM_P3 }, { t: 16, ...CAM_PLAT }]);
    },
  },
  { // 1.7 Comparaison
    id: '1.7',
    textes: (P) => [
      { t: 0.3, txt: 'Comparons', style: 'etiquettePlan' },
      { t: P(4), txt: 'L\'étoile : la plus utilisée', ligne: 1 },
      { t: P(4) + 0.9, txt: 'au collège et à la maison.', ligne: 2 },
    ],
    maj(t, P) {
      ambiance(1);
      const xs = [-8.4, 0, 8.4];
      const choix = easeOut(prog(t, P(4), P(4) + 0.8));
      TOPOS.forEach((tp, k) => {
        montrerTopo(tp, { pos: new THREE.Vector3(xs[k], 10, 0), echelle: 0.74 * (k === 2 ? 1 + 0.05 * choix : 1 - 0.06 * choix), rotation: t * 0.12 + k });
        tp.plat.userData.bord.material.color.set(k === 2 ? C.or : C.local).multiplyScalar(k === 2 ? 2.2 + 2 * choix : 2.2);
      });
      // États finaux, toujours animés : anneau coupé et gris, maillé en secours, étoile avec une panne.
      etatAnneau(t + 30, { flux0: 0, coupe: 1, gris: 1 });
      etatMaille(t + 30, { coupe: 0, secours0: 1 });
      etatEtoile(t + 30, { flux0: 0, panne: 1 });
      const cartes = [
        ['Anneau', '6 câbles', 'Une coupure : tout est bloqué', 'mauvais'],
        ['Maillé', '15 câbles', 'Toujours un chemin de secours', 'moyen'],
        ['Étoile', '6 câbles', 'Seul l\'appareil en panne est isolé', 'bon'],
      ];
      cartes.forEach(([nom, cab, eff, cl], k) => {
        const a = easeOut(prog(t, P(k + 1) - 0.1, P(k + 1) + 0.4));
        const extra = k === 2 ? `<div class="pictos" style="opacity:${choix}">${SVG_COLLEGE}<span>collège</span>${SVG_MAISON}<span>maison</span></div>` : '';
        etiquette(`carte${k}`, '', `carte ${cl}`).montrer(TOPOS[k].ext, a * (k === 2 ? 1 : 1 - 0.45 * choix), [0, -2.6, 4.4],
          `<h4>${nom}</h4><p class="cab">${cab}</p><p>${eff}</p>${extra}`);
      });
      camera(cam, t, [{ t: 0, p: [0, 19.4, 19.6], v: [0, 8.1, 0.6], fov: 44 }, { t: 20, p: [0, 19.0, 19.0], v: [0, 8.1, 0.6], fov: 44 }]);
    },
  },
  { // 1.8 Question
    id: '1.8', min: 8,
    textes: (P) => [{ t: P(1) - 0.2, txt: 'Mila choisit l\'étoile. Quel matériel doit-elle placer au centre ?', style: 'question' }],
    maj(t) {
      ambiance(1); montrerTopo(etoile, { rotation: 0.35 + t * 0.03 });
      etatEtoile(t, { centre0: Infinity, dessin: 0 });
      centre.visible = false;
      interroCentre.visible = true; interroCentre.position.set(0, 1.7 + Math.sin(t * 2) * 0.12, 0); interroCentre.scale.setScalar(2.6);
      interroCentre.material.opacity = 0.75 + 0.25 * Math.sin(t * 4);
      milaPlateau.visible = true; milaPlateau.position.set(-4.0, 0, 2.6); milaPlateau.rotation.y = 2.1; milaPlateau.animer(t);
      camera(cam, t, [{ t: 0, p: [4.5, 14.4, 12.5], v: [0, 10.6, 0.4], fov: 40 }, { t: 10, p: [3.6, 14.0, 11.8], v: [0, 10.6, 0.4], fov: 40 }]);
    },
  },
];

// La vignette « Au collège » (plans 1.6 et 1.7)
const vig = vignetteCollege();
ctx.vignetteLegende.textContent = 'Salle De Vinci : 16 postes en étoile';
const vignette = {
  scene: vig.scene, cam: vig.cam, maj: vig.maj,
  alpha(i, t) {
    const p = plans[i];
    if (p.id === '1.6') return fondu(t, p.P(1), 0.6);
    return 0;
  },
};

// Le moteur est lancé avant la définition des plans : on lui passe les plans maintenant.
ctx.definir(plans, vignette);
void boite; void lerp;
