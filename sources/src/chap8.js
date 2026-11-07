// Chapitre 8 : du collège à la maison. Trois réseaux, les mêmes éléments ; la box Internet en vue éclatée ;
// le réseau numérique (objets connectés, domotique) ; récapitulatif ; question ; générique de fin.
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import { C, mat, lum, colis, poser, boite, halo, appareil, modem, routeur, borneWifi, tablette, serveur, plateau, materiauOnde } from './modeles.js';
import { decor } from './decor.js';
import { reseauCafe, accesInternet } from './reseaucafe.js';

const ctx = lancerChapitre({ numero: 8, titre: 'Du collège à la maison', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const A = accesInternet(R);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const S = V(0, 40, 0);
const ELEMENTS = [
  ['commutateur', 'Commutateur', C.local], ['wifi', 'Borne Wi-Fi', C.local], ['modem', 'Modem', C.internet],
  ['routeur', 'Routeur', C.internet], ['passerelle', 'Passerelle', C.secu],
];
const passerelleModele = () => { const g = new THREE.Group(); poser(boite(0.5, 0.16, 0.34, mat(C.secu, { r: 0.4, e: C.secu, ei: 0.35 }), 0.03), 0, 0.08, 0, g); return g; };
const tube = (a, b, couleur, parent, r = 0.04) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 4, r, 8), mat(couleur, { e: couleur, ei: 0.4 })); parent.add(m); return m; };

// ---------- trois plateaux : café, collège (éléments séparés), maison (box) ----------
const studio = new THREE.Group(); studio.position.copy(S); scene.add(studio);
const XS = { cafe: -8.6, college: 0, maison: 8.6 };
function reseauSepare(nom) {
  const g = new THREE.Group(); g.position.x = XS[nom]; studio.add(g);
  g.add(plateau(3.3));
  const it = {
    commutateur: poser(appareil('commutateur'), 0, 0, 0.5, g),
    wifi: poser(borneWifi(), -2.0, 1.1, -0.3, g),
    routeur: poser(routeur(), -0.6, 0, -1.6, g),
    passerelle: poser(passerelleModele(), 0.55, 0, -1.6, g),
    modem: poser(modem(), 1.6, 0, -1.6, g),
  };
  poser(boite(0.06, 1.1, 0.06, mat('#d7dde4')), -2.0, 0.55, -0.3, g);
  it.commutateur.scale.setScalar(1.6); it.wifi.scale.setScalar(1.5); it.routeur.scale.setScalar(1.6); it.passerelle.scale.setScalar(1.6); it.modem.scale.setScalar(1.6);
  const srv = serveur(['', '', '']); srv.scale.setScalar(0.65); poser(srv, 2.1, 0, 0.8, g); srv.rotation.y = -Math.PI / 2;
  [-1.3, 1.0].forEach((x) => { const o = appareil('ordinateur'); o.scale.setScalar(1.5); poser(o, x, 0, 2.0, g); });
  tube(V(0, 0.08, 0.5), V(-1.3, 0.05, 1.9), C.local, g); tube(V(0, 0.08, 0.5), V(1.0, 0.05, 1.9), C.local, g);
  tube(V(0, 0.08, 0.5), V(2.0, 0.05, 0.8), C.local, g); tube(V(0, 0.08, 0.5), V(-2.0, 0.05, -0.3), C.local, g);
  tube(V(0, 0.08, 0.3), V(-0.6, 0.08, -1.4), C.local, g);
  tube(V(-0.2, 0.1, -1.6), V(0.3, 0.1, -1.6), C.secu, g); tube(V(0.8, 0.1, -1.6), V(1.2, 0.1, -1.6), C.internet, g);
  tube(V(1.9, 0.1, -1.6), V(3.1, 0.1, -2.2), C.internet, g, 0.05);
  return { g, it };
}
const rCafe = reseauSepare('cafe'), rCollege = reseauSepare('college');
// Maison : une box, un ordinateur câblé, une tablette et un smartphone en Wi-Fi.
const maison = new THREE.Group(); maison.position.x = XS.maison; studio.add(maison);
maison.add(plateau(3.3));
const box = new THREE.Group(); poser(box, 0, 0, -0.8, maison);
const boxCorps = poser(boite(1.5, 0.42, 0.9, mat('#f4f6f9', { r: 0.35 }), 0.08), 0, 0.21, 0, box);
const couvercle = poser(boite(1.5, 0.08, 0.9, mat('#e9edf2', { r: 0.35 }), 0.04), 0, 0.46, 0, box);
for (let i = 0; i < 5; i++) poser(boite(0.06, 0.03, 0.01, mat('#0e1622', { e: ELEMENTS[i][2], ei: 1.2 })), -0.4 + i * 0.2, 0.25, 0.455, box);
void boxCorps;
const oM = appareil('ordinateur'); oM.scale.setScalar(1.5); poser(oM, -1.5, 0, 1.6, maison);
tube(V(0, 0.08, -0.4), V(-1.5, 0.05, 1.5), C.local, maison);
const tabM = tablette(); tabM.scale.setScalar(2); tabM.rotation.x = -0.5; poser(tabM, 1.3, 0.5, 1.4, maison);
const telM = tablette(); telM.scale.set(0.9, 1.6, 1.6); telM.rotation.x = -0.5; poser(telM, 2.2, 0.45, 0.5, maison);
const lignesMaison = tube(V(0.75, 0.15, -0.8), V(3.1, 0.1, -2.2), C.internet, maison, 0.05); void lignesMaison;
// Modules sortis de la box (vue éclatée)
const modules = {
  commutateur: appareil('commutateur'), wifi: borneWifi(), modem: modem(), routeur: routeur(), passerelle: passerelleModele(),
};
Object.values(modules).forEach((m) => { m.scale.setScalar(1.5); maison.add(m); });
const POS_ECLATE = { commutateur: V(-2.2, 2.0, -0.6), wifi: V(-1.1, 2.7, -0.7), modem: V(0, 3.1, -0.8), routeur: V(1.1, 2.7, -0.7), passerelle: V(2.2, 2.0, -0.6) };
const ancresMod = {}; for (const k of Object.keys(modules)) { const o = new THREE.Object3D(); maison.add(o); ancresMod[k] = o; }
// Liens maison (module) → collège (élément séparé)
const liens = Object.keys(modules).map((k) => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: new THREE.Color(ELEMENTS.find((e) => e[0] === k)[2]).multiplyScalar(1.6), dashSize: 0.25, gapSize: 0.15, toneMapped: false }));
  const l = new THREE.Line(new THREE.BufferGeometry(), m.material); studio.add(l); return { k, l };
});
const halos = []; // halos de mise en évidence (un par plateau)
for (let i = 0; i < 3; i++) { const h = halo(C.or, 1.6); studio.add(h); halos.push(h); }

// ---------- objets connectés (réseau numérique) ----------
const objets = new THREE.Group(); maison.add(objets);
const ampoule = new THREE.Group(); poser(ampoule, -2.2, 0, -0.9, objets);
poser(new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), lum('#fff1c4', 1.5)), 0, 1.2, 0, ampoule); poser(boite(0.04, 1.0, 0.04, mat('#555')), 0, 0.5, 0, ampoule);
const thermostat = poser(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32), mat('#f4f6f9', { e: '#7dd3a0', ei: 0.3 })), 2.3, 0.9, -1.3, objets); thermostat.rotation.x = Math.PI / 2;
poser(boite(0.06, 0.9, 0.06, mat('#888')), 2.3, 0.45, -1.35, objets);
const fenetre = new THREE.Group(); poser(fenetre, -0.2, 0, -2.6, objets);
poser(boite(1.4, 1.1, 0.06, mat('#9cc7e6', { e: '#2a4a66', ei: 0.3 })), 0, 0.9, 0, fenetre);
const volet = poser(boite(1.45, 1.15, 0.05, mat('#7a5232', { r: 0.8 })), 0, 0.9, 0.06, fenetre);
const enceinte = poser(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.6, 24), mat('#30353d', { r: 0.6 })), 0.3, 0.3, 2.3, objets);
const montre = new THREE.Group(); poser(montre, -0.5, 0.25, 2.4, objets);
poser(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 24), mat('#222')), 0, 0, 0, montre); poser(new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), lum('#7ec8ff', 1.4)), 0, 0, 0.01, montre);
const ondesM = [0, 1, 2].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), materiauOnde()); o.position.set(0, 0.5, -0.8); maison.add(o); return o; });
const paquetsM = [0, 1, 2, 3].map(() => { const p = colis(0.18); maison.add(p); return p; });
const CIBLES_OBJ = [ampoule, thermostat, fenetre, enceinte, montre];
// Café : vitrine réfrigérée et four programmable connectés
const vitrineC = poser(boite(1.2, 0.8, 0.6, mat('#d8f0ff', { r: 0.1, tr: true, op: 0.5, e: '#9fd7ff', ei: 0.3 }), 0.04), -2.3, 0.4, 1.0, rCafe.g);
const four = poser(boite(0.9, 0.7, 0.7, mat('#5b6370', { r: 0.4 }), 0.04), 2.4, 0.35, -0.4, rCafe.g);
poser(boite(0.5, 0.35, 0.02, lum('#ff9a3c', 0.9)), 2.4, 0.4, -0.04, rCafe.g);

function base() {
  D.reinitialiser();
  R.sw.visible = R.etagere.visible = false; R.srv.visible = false;
  Object.values(R.cables).forEach((c) => c.regler({ p: 0 })); R.paquets.forEach((p) => p.visible = false);
  A.montrer(false);
  studio.visible = false; objets.visible = false; vitrineC.visible = four.visible = false;
  Object.values(modules).forEach((m) => m.visible = false); liens.forEach((l) => l.l.visible = false); halos.forEach((h) => h.visible = false);
  couvercle.position.y = 0.46; ondesM.forEach((o) => o.visible = false); paquetsM.forEach((p) => p.visible = false);
  ctx.renderer.domElement.style.filter = '';
}
function monde(t) { D.ambiance(1); D.studio(S); studio.visible = true; }
const pw = new THREE.Vector3();
function eclater(k) { // 0 : modules dans la box ; 1 : vue éclatée
  couvercle.position.y = 0.46 + 1.4 * easeOut(Math.min(1, k * 2));
  Object.entries(modules).forEach(([n, m], i) => {
    const u = easeInOut(prog(k, 0.15 + i * 0.12, 0.55 + i * 0.12));
    m.visible = u > 0.01;
    m.position.lerpVectors(V(0, 0.3, -0.8), POS_ECLATE[n], u);
    ancresMod[n].position.copy(m.position).add(V(0, 0.55, 0));
  });
}
function objetsConnectes(t, a = 1) {
  objets.visible = true;
  volet.position.y = 0.9 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.9));
  enceinte.scale.y = 1 + 0.04 * Math.sin(t * 14);
  ondesM.forEach((o, k) => { o.visible = true; const u = ((t / 2.4 + k / 3) % 1); o.scale.setScalar(0.3 + u * 3.0); o.material.uniforms.opacite.value = (1 - u) * 0.28 * a; });
  paquetsM.forEach((p, k) => {
    p.visible = a > 0.5; const cible = CIBLES_OBJ[(k + Math.floor(t / 1.8)) % CIBLES_OBJ.length];
    cible.getWorldPosition(pw); maison.worldToLocal(pw);
    p.position.lerpVectors(V(0, 0.6, -0.8), pw, ((t / 1.8 + k * 0.25) % 1));
  });
}
const CAM_TROIS = { p: [0, 49.5, 15], v: [0, 39.0, 0.6], fov: 46 };
const CAM_MAISON = { p: [8.6, 47.5, 9.2], v: [8.6, 40.8, -0.4], fov: 42 };

const plans = [
  { // 8.0 Titre
    id: '8.0', min: 6, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 8 · Du collège à la maison', style: 'soustitre' }],
    maj(t) { D.vil.visible = caf.groupe.visible = true; R.etat(t); A.montrer(true); laMila.animer(t); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 8.1 Trois réseaux, les mêmes éléments
    id: '8.1', min: 13,
    textes: (P) => [{ t: P(0) + 0.3, txt: 'Trois réseaux,', ligne: 1 }, { t: P(1), txt: 'les mêmes éléments.', ligne: 2 }],
    maj(t, P) {
      monde(t);
      [['Le café de Mila', rCafe.g], ['Le collège', rCollege.g], ['Ta maison', maison]].forEach(([n, g], k) => etiquette(`nom${k}`, n, k === 2 ? 'ok' : 'local').montrer(g, fondu(t, 0.4 + k * 0.4, 0.4), [0, -1.4, 3.8]));
      const t0 = P(1) + 0.8, i = Math.floor((t - t0) / 1.3);
      if (t > t0 && i < ELEMENTS.length) {
        const [k, nom, coul] = ELEMENTS[i];
        [rCafe.it[k], rCollege.it[k], box].forEach((o, j) => { const h = halos[j]; h.visible = true; o.getWorldPosition(h.position); h.position.y += 0.5; h.material.color.set(coul).multiplyScalar(2); h.material.opacity = 0.6 + 0.4 * Math.sin(t * 8); });
        panneau('elt', `<span class="pastille" style="background:${coul};color:${coul}"></span> ${nom}`, 'element').montrer(1, 960, 110, `<span class="pastille" style="background:${coul};color:${coul}"></span> ${nom}`);
      }
      camera(cam, t, [{ t: 0, ...CAM_TROIS }, { t: 14, p: [0, 49, 14.4], v: [0, 39.0, 0.6], fov: 46 }]);
    },
  },
  { // 8.2 La box en vue éclatée
    id: '8.2', min: 12,
    textes: (P) => [{ t: P(0) + 1.5, txt: 'Box Internet =', ligne: 1 }, { t: P(2), txt: 'commutateur + borne Wi-Fi + modem + routeur + passerelle', ligne: 2 }],
    maj(t, P, F) {
      monde(t);
      etiquette('box', 'Box Internet', 'ok').montrer(box, fondu(t, P(0) + 0.6, 0.4) * (1 - fondu(t, P(1), 0.3)), [0, 1.1, 0]);
      eclater(prog(t, P(1), P(1) + 2.2));
      const d = F(2) - P(2);
      ELEMENTS.forEach(([k, nom], i) => etiquette(`m${k}`, nom, k === 'passerelle' ? 'refus' : k === 'modem' || k === 'routeur' ? '' : 'local').montrer(ancresMod[k], fondu(t, P(2) + (0.08 + i * 0.18) * d, 0.3)));
      camera(cam, t, [{ t: 0, ...CAM_TROIS }, { t: P(0) + 1.4, ...CAM_MAISON }]);
    },
  },
  { // 8.3 Séparés au collège, réunis dans la box
    id: '8.3', min: 10,
    textes: (P) => [{ t: P(0), txt: 'Au collège : séparés dans la baie.', ligne: 1 }, { t: P(1), txt: 'À la maison : réunis dans la box.', ligne: 2 }],
    maj(t, P) {
      monde(t); eclater(1);
      ELEMENTS.forEach(([k, nom], i) => {
        etiquette(`m${k}`, nom, k === 'passerelle' ? 'refus' : k === 'modem' || k === 'routeur' ? '' : 'local').montrer(ancresMod[k], 1);
        const L = liens[i].l; const u = easeInOut(prog(t, P(0) + 0.3 + i * 0.35, P(0) + 1.3 + i * 0.35));
        L.visible = u > 0.01;
        if (L.visible) {
          const a = modules[k].getWorldPosition(new THREE.Vector3()).sub(S), b = rCollege.it[k].getWorldPosition(new THREE.Vector3()).sub(S);
          const pts = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).setY(4.5), b).getPoints(40).slice(0, Math.max(2, Math.round(41 * u)));
          L.geometry.dispose(); L.geometry = new THREE.BufferGeometry().setFromPoints(pts); L.computeLineDistances();
        }
      });
      camera(cam, t, [{ t: 0, ...CAM_MAISON }, { t: 1.6, p: [4.3, 50.5, 15.5], v: [4.3, 39.6, 0], fov: 44 }]);
    },
  },
  { // 8.4 Le réseau numérique
    id: '8.4', min: 12,
    textes: (P) => [{ t: P(2), txt: 'Réseau numérique :', ligne: 1 }, { t: P(2) + 1.2, txt: 'il relie aussi les objets connectés et la domotique.', ligne: 2 }],
    maj(t, P, F) {
      monde(t); objetsConnectes(t, fondu(t, 0.3, 0.6));
      vitrineC.visible = four.visible = true;
      const d = F(1) - P(1);
      [['Ampoule', ampoule, [0, 1.6, 0]], ['Thermostat', thermostat, [0, 0.5, 0]], ['Volets', fenetre, [0, 1.8, 0]], ['Enceinte', enceinte, [0.9, 0.6, 0]], ['Montre', montre, [-0.9, 0.3, 0]]]
        .forEach(([n, o, dec], i) => etiquette(`o${i}`, n, '').montrer(o, fondu(t, P(1) + (0.05 + i * 0.18) * d, 0.3), dec));
      etiquette('vit', 'Vitrine réfrigérée connectée', '').montrer(vitrineC, fondu(t, P(2) + 0.8, 0.4), [1.6, -0.2, 1.2]);
      etiquette('four', 'Four programmable', '').montrer(four, fondu(t, P(2) + 1.4, 0.4), [0, 0.8, 0]);
      camera(cam, t, [{ t: 0, ...CAM_MAISON }, { t: P(2), ...CAM_MAISON }, { t: P(2) + 3, p: [0, 52, 15], v: [0, 39.2, 0], fov: 44 }]);
    },
  },
  { // 8.5 Récapitulatif
    id: '8.5', min: 16,
    textes: () => [{ t: 0.3, txt: 'Comment créer un réseau de données ?', style: 'etiquettePlan' }],
    maj(t, P) {
      monde(t); objetsConnectes(t, 0.6); vitrineC.visible = four.visible = true;
      ctx.renderer.domElement.style.filter = `blur(${4 * fondu(t, 0, 0.6)}px) brightness(${1 - 0.4 * fondu(t, 0, 0.6)})`;
      const chip = (txt, c) => `<span class="chip" style="border-color:${c}"><i style="background:${c}"></i>${txt}</span>`;
      const lignes = [
        ['Relier les appareils', chip('Commutateur', C.local) + chip('Borne Wi-Fi', C.local)],
        ['Gérer données et utilisateurs', chip('Serveur', C.local)],
        ['S\'ouvrir sur Internet', chip('Modem', C.internet) + chip('Routeur', C.internet)],
        ['Se protéger', chip('Passerelle', C.secu) + chip('Pare-feu', C.secu) + chip('Antivirus', C.secu)],
      ];
      lignes.forEach(([titre, chips], k) => panneau(`rec${k}`, '', 'recap').montrer(fondu(t, P(k + 1), 0.4), 960, 240 + k * 160, `<b>${k + 1}. ${titre}</b><div>${chips}</div>`));
      camera(cam, t, [{ t: 0, ...CAM_TROIS }, { t: 20, p: [0, 53, 18], v: [0, 38.6, 0.4], fov: 44 }]);
    },
  },
  { // 8.6 Question
    id: '8.6', min: 9,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Chez toi, quels appareils sont reliés à la box ? Lesquels par câble, lesquels en Wi-Fi ?', style: 'question' }],
    maj(t) {
      monde(t); objetsConnectes(t, 1);
      camera(cam, t, [{ t: 0, p: [8.6, 46.5, 8.4], v: [8.6, 40.2, -0.6], fov: 44 }, { t: 10, p: [8.2, 46.2, 8.0], v: [8.6, 40.2, -0.6], fov: 44 }]);
    },
  },
  { // 8.7 Générique
    id: '8.7', min: 10,
    maj(t) {
      D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(0); R.etat(t); A.montrer(true);
      D.nuit(0.55 + 0.25 * fondu(t, 0, 6));
      laMila.visible = true; laMila.position.set(0.2, 0, 4.9 + Math.min(1.2, t * 0.25)); laMila.rotation.y = 0; laMila.animer(t, { salut: Math.sin(Math.PI * prog(t, 2, 5)) });
      panneau('gen', `${window.__LOGO ? `<div class="logo"><img src="${window.__LOGO}" alt="Collège Saint-Pierre"></div>` : ''}<h2>Le réseau de Mila</h2><p>Technologie · 5<sup>e</sup> · Organiser un réseau numérique</p><p class="cr">Voix : SIWIS (CC BY 4.0)</p><p class="auteur">Romain Blanchard, professeur de Technologie</p>`, 'generique').montrer(fondu(t, 1, 0.8), 960, 180);
      camera(cam, t, [{ t: 0, p: [-4, 6, 22], v: [0, 2, 3], fov: 38 }, { t: 12, p: [-1.5, 7.5, 26], v: [0, 2.2, 3], fov: 38 }]);
    },
  },
];

ctx.definir(plans, null);
void lerp; void pop; void halo;
