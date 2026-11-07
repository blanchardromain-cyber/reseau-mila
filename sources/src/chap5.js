// Chapitre 5 : vers Internet. Le réseau des réseaux, la ligne de l'opérateur, le modem (traducteur),
// le routeur (aiguilleur), le trajet d'un paquet (3 étapes en local, 5 vers Internet).
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import { C, mat, lum, colis, poser, boite, appareil, modem, routeur, plateau, halo, ligneBrisee } from './modeles.js';
import { decor } from './decor.js';
import { reseauCafe, accesInternet } from './reseaucafe.js';
import { vignetteBaie } from './college.js';

const ctx = lancerChapitre({ numero: 5, titre: 'Vers Internet', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const A = accesInternet(R);
const S = new THREE.Vector3(0, 40, 0);
const pv = new THREE.Vector3();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const GRIS = new THREE.Color(C.internet);

// Points gris (signal de la ligne) et colis orange (données) dans le café
const signaux = Array.from({ length: 6 }, () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lum(C.internet, 1.6)); caf.groupe.add(s); return s; });
const paquetCafe = colis(0.14); caf.groupe.add(paquetCafe);
const interroLigne = halo(C.panne, 0.01); caf.groupe.add(interroLigne);

// ---------- Internet : le réseau des réseaux (studio) ----------
const monde = new THREE.Group(); monde.position.copy(S); scene.add(monde);
const platCafe = plateau(1.6); monde.add(platCafe);
poser(boite(1.2, 0.5, 0.8, mat('#f5ead6')), 0, 0.25, 0, platCafe); poser(boite(1.3, 0.12, 0.9, mat('#b8553d')), 0, 0.56, 0, platCafe);
const hubs = [0, 1, 2, 3, 4].map((k) => { const a = k * Math.PI * 2 / 5 + 0.3; const h = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), lum(C.internet, 1.3)); h.position.set(Math.cos(a) * 4.2, 0.4, Math.sin(a) * 4.2); monde.add(h); return h; });
const autres = [];
const couleursBat = ['#e4ecf2', '#efd9b4', '#d8e6d2', '#f4efe6', '#e9d6c0'];
for (let k = 0; k < 11; k++) {
  const a = k * Math.PI * 2 / 11 + 0.15, r = k % 2 ? 9.5 : 7.4;
  const p = plateau(1.15); p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  p.userData.bord.material.color.set(C.internet).multiplyScalar(1.4);
  poser(boite(0.8, 0.4 + (k % 3) * 0.35, 0.7, mat(couleursBat[k % 5])), 0, 0.2 + (k % 3) * 0.17, 0, p);
  monde.add(p); autres.push(p);
}
const liens = [];
const lien = (a, b) => {
  const c = new THREE.LineCurve3(a.clone().setY(0.35), b.clone().setY(0.35));
  monde.add(new THREE.Mesh(new THREE.TubeGeometry(c, 8, 0.04, 6), mat(C.internet, { e: C.internet, ei: 0.5 }))); liens.push(c);
};
lien(platCafe.position, hubs[0].position);
hubs.forEach((h, k) => lien(h.position, hubs[(k + 1) % 5].position));
hubs.forEach((h, k) => lien(h.position, hubs[(k + 2) % 5].position));
autres.forEach((p) => { let best = hubs[0]; hubs.forEach((h) => { if (h.position.distanceTo(p.position) < best.position.distanceTo(p.position)) best = h; }); lien(best.position, p.position); });
const pointsNet = Array.from({ length: 22 }, () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), lum(C.internet, 2)); monde.add(s); return s; });

// ---------- le modem en coupe (studio) ----------
const studioModem = new THREE.Group(); studioModem.position.copy(S); scene.add(studioModem);
const grosModem = modem(); grosModem.scale.setScalar(6); poser(grosModem, 0, -0.4, 0, studioModem);
const coeur = halo('#ffd86b', 1.6); coeur.position.set(0, 0.5, 1.2); studioModem.add(coeur);
const N_ONDE = 70;
const onde = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), lum(C.internet, 1.8), N_ONDE); studioModem.add(onde);
const tubeDonnees = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(1.6, 0.05, 0), V(7.5, 0.05, 0)), 4, 0.05, 8), mat(C.local, { e: C.local, ei: 0.5 })); studioModem.add(tubeDonnees);
const paquetsModem = [0, 1, 2, 3].map(() => { const p = colis(0.28); studioModem.add(p); return p; });
const aLigne = new THREE.Object3D(); aLigne.position.set(-4.6, 1.3, 0); studioModem.add(aLigne);
const aDonnees = new THREE.Object3D(); aDonnees.position.set(4.6, 0.8, 0); studioModem.add(aDonnees);
const aModem = new THREE.Object3D(); aModem.position.set(0, 1.2, 0); studioModem.add(aModem);
const mtx = new THREE.Matrix4();
function ondeModem(t, sens) { // sens 1 : la ligne entre dans le modem ; -1 : elle en sort
  for (let i = 0; i < N_ONDE; i++) {
    const x = -7.5 + 5.9 * (i / (N_ONDE - 1));
    mtx.makeTranslation(x, 0.05 + 0.4 * Math.sin(3.1 * x - 6 * t * sens), 0); onde.setMatrixAt(i, mtx);
  }
  onde.instanceMatrix.needsUpdate = true;
}

// ---------- le routeur aiguilleur (studio) ----------
const studioRouteur = new THREE.Group(); studioRouteur.position.copy(S); scene.add(studioRouteur);
const grosRouteur = routeur(); grosRouteur.scale.setScalar(4.5); poser(grosRouteur, 0, -0.3, 0, studioRouteur);
const BRANCHES = {
  internet: { fin: V(-7, 0.2, 0), couleur: C.internet, nom: 'Internet' },
  caisse: { fin: V(6.5, 0.2, -3.2), couleur: C.local, nom: 'Caisse' },
  ordinateur: { fin: V(7, 0.2, 0.2), couleur: C.local, nom: 'Ordinateur' },
  imprimanteCuisine: { fin: V(6.5, 0.2, 3.6), couleur: C.local, nom: 'Imprimante de cuisine' },
};
for (const [k, b] of Object.entries(BRANCHES)) {
  b.courbe = new THREE.LineCurve3(V(0, 0.25, 0), b.fin);
  studioRouteur.add(new THREE.Mesh(new THREE.TubeGeometry(b.courbe, 6, 0.07, 8), mat(b.couleur, { e: b.couleur, ei: 0.5 })));
  if (k === 'internet') { const g = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshStandardMaterial({ color: C.internet, wireframe: true })); g.position.copy(b.fin).setY(0.9); studioRouteur.add(g); b.objet = g; }
  else { const d = appareil(k, { pied: true }); d.scale.setScalar(2.2); d.position.copy(b.fin).setY(0); d.rotation.y = -Math.PI / 2; studioRouteur.add(d); b.objet = d; }
}
const aiguille = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 16), lum(C.or, 1.6)); aiguille.geometry.rotateZ(-Math.PI / 2); aiguille.geometry.translate(0.75, 0, 0);
aiguille.position.set(0, 0.95, 0); studioRouteur.add(aiguille);
const paquetRouteur = colis(0.3); studioRouteur.add(paquetRouteur);
const ENVOIS = [['internet', 'caisse'], ['internet', 'imprimanteCuisine'], ['ordinateur', 'internet']];

// ---------- vignette : la baie technique du collège ----------
const baie = vignetteBaie({ modem, routeur });

function base() {
  D.reinitialiser();
  R.sw.visible = R.etagere.visible = false; R.srv.visible = false;
  Object.values(R.cables).forEach((c) => c.regler({ p: 0 })); R.paquets.forEach((p) => p.visible = false);
  A.montrer(false);
  signaux.forEach((s) => s.visible = false); paquetCafe.visible = false; interroLigne.visible = false;
  monde.visible = studioModem.visible = studioRouteur.visible = false;
}
function cafe(t, { internet = true, ligneSeule = false } = {}) {
  D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(1);
  R.etat(t); A.montrer(internet, { ligneSeule });
}
// Signal gris qui circule sur la ligne (du poteau vers le café, ou l'inverse).
function signalLigne(t, sens = 1, jusque = 1) {
  signaux.forEach((s, k) => {
    s.visible = true;
    const u = ((t / 2.2 + k / signaux.length) % 1);
    A.cML.courbe.getPoint(sens > 0 ? 1 - u * jusque : u, s.position);
  });
}
const CAM_FOND = { p: [2.6, 4.0, -0.6], v: [2.75, 2.0, -3.75], fov: 42 };
const CAM_DEHORS = { p: [8.5, 7.5, -13.5], v: [2.6, 2.0, -5.5], fov: 42 };

// Compteur d'étapes d'un trajet : pastilles allumées au fur et à mesure.
function etapes(noms, u) {
  const n = noms.length - 1, k = Math.min(n, Math.floor(u * n + 0.02));
  return `<div class="etapes">${noms.map((m, i) => `<span class="${i <= k ? 'on' : ''}">${i + 1}. ${m}</span>`).join('<i>→</i>')}</div><b>${k + 1} / ${noms.length} étapes</b>`;
}

const plans = [
  { // 5.0 Titre
    id: '5.0', min: 6, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 5 · Vers Internet', style: 'soustitre' }],
    maj(t) { D.vil.visible = caf.groupe.visible = true; R.etat(t); A.montrer(true); laMila.animer(t); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 5.1 Internet, le réseau des réseaux
    id: '5.1', min: 9,
    textes: (P) => [{ t: P(0) + 0.6, txt: 'Recevoir des commandes en ligne…', ligne: 1 }, { t: P(1), txt: 'Internet : le réseau des réseaux.', ligne: 2 }],
    maj(t, P) {
      D.ambiance(1); D.studio(S); monde.visible = true;
      monde.rotation.y = t * 0.03;
      pointsNet.forEach((s, k) => { const c = liens[(k * 5) % liens.length]; c.getPoint(((t / 2.6 + k * 0.13) % 1), s.position); });
      etiquette('cafeNet', 'Le réseau de Mila', 'local').montrer(platCafe, fondu(t, 0.6, 0.4), [0, 1.2, 0]);
      etiquette('net', 'Internet', '').montrer(hubs[2], fondu(t, P(1) + 0.8, 0.4), [0, 0.8, 0]);
      camera(cam, t, [{ t: 0, p: [0.5, 43.2, 4.2], v: [0, 40.2, 0], fov: 40 }, { t: P(1), p: [0.5, 46, 9], v: [0, 39.8, 0], fov: 42 }, { t: P(1) + 5, p: [0, 56, 20], v: [0, 38, 0], fov: 44 }]);
    },
  },
  { // 5.2 La ligne de l'opérateur
    id: '5.2', min: 8,
    textes: (P) => [{ t: P(0) + 0.6, txt: 'La ligne de l\'opérateur', ligne: 1 }, { t: P(1) + 0.4, txt: 'Le signal n\'a pas la même forme que les données.', ligne: 2 }],
    maj(t, P) {
      cafe(t, { ligneSeule: true }); laMila.animer(t);
      A.cML.regler({ p: easeInOut(prog(t, 0.3, P(0) + 2)) });
      if (t > P(0) + 1.6) signalLigne(t, 1);
      etiquette('poteau', 'Ligne de l\'opérateur', '').montrer(A.pt, fondu(t, P(0) + 0.6, 0.4), [0, 5.3, 0]);
      etiquette('signal', '〰 Signal', '').montrer(A.cML.groupe, fondu(t, P(1), 0.4), [3.3, 3.2, -6.0]);
      etiquette('donnees', '📦 Données du réseau', 'local').montrer(R.sw.userData.ancre, fondu(t, P(1) + 1.2, 0.4), [0, 0.2, 0]);
      camera(cam, t, [{ t: 0, ...CAM_DEHORS }, { t: 8, p: [7.8, 7.2, -12.6], v: [2.6, 2.0, -5.5], fov: 42 }]);
    },
  },
  { // 5.3 Le modem, traducteur
    id: '5.3',
    textes: (P) => [
      { t: 0.3, txt: 'Le modem, vu de près', style: 'etiquettePlan' },
      { t: P(0) + 0.3, txt: 'Modem : le traducteur', ligne: 1 },
      { t: P(1), txt: 'Il convertit le signal de la ligne en données numériques.', ligne: 2 },
    ],
    maj(t, P) {
      D.ambiance(1); D.studio(S); studioModem.visible = true;
      const sens = t < P(2) ? 1 : -1;
      ondeModem(t, sens);
      coeur.material.opacity = 0.6 + 0.4 * Math.sin(t * 6);
      paquetsModem.forEach((p, k) => {
        p.visible = t > P(1) - 0.4;
        const u = ((t / 2.4 + k / 4) % 1);
        p.position.set(sens > 0 ? lerp(1.7, 7.4, u) : lerp(7.4, 1.7, u), 0.25, 0);
      });
      etiquette('ligneS', 'Ligne : signal', '').montrer(aLigne, fondu(t, P(1), 0.4));
      etiquette('donneesS', 'Données numériques', 'local').montrer(aDonnees, fondu(t, P(1) + 0.8, 0.4));
      etiquette('sens', sens > 0 ? 'Ligne → données' : 'Données → ligne', 'ok').montrer(aModem, fondu(t, P(1) + 1.6, 0.4), [0, 0.6, 0]);
      camera(cam, t, [{ t: 0, p: [0, 43.4, 10.5], v: [0, 40, 0], fov: 40 }, { t: 16, p: [0.6, 43, 10], v: [0, 40, 0], fov: 40 }]);
    },
  },
  { // 5.4 Le routeur, aiguilleur
    id: '5.4', min: 13,
    textes: (P) => [
      { t: 0.3, txt: 'Le routeur, vu de près', style: 'etiquettePlan' },
      { t: P(0) + 0.3, txt: 'Routeur : l\'aiguilleur', ligne: 1 },
      { t: P(2), txt: 'Il oriente les paquets entre le réseau local et Internet.', ligne: 2 },
    ],
    maj(t, P) {
      D.ambiance(1); D.studio(S); studioRouteur.visible = true;
      for (const [k, b] of Object.entries(BRANCHES)) etiquette(`br${k}`, b.nom, k === 'internet' ? '' : 'local').montrer(b.objet, fondu(t, 0.5, 0.4), [0, k === 'internet' ? 1.3 : 0.4, 0]);
      // Trois envois successifs : arrivée → lecture de l'adresse → aiguillage → départ.
      const t0 = P(1), D_ENVOI = 3.2;
      const i = Math.floor((t - t0) / D_ENVOI), f = ((t - t0) / D_ENVOI) - i;
      paquetRouteur.visible = t > t0 && i < ENVOIS.length;
      const angle = (k) => (k < 0 ? 0 : Math.atan2(-BRANCHES[ENVOIS[Math.min(k, ENVOIS.length - 1)][1]].fin.z, BRANCHES[ENVOIS[Math.min(k, ENVOIS.length - 1)][1]].fin.x));
      aiguille.rotation.y = t < t0 ? 0 : i >= ENVOIS.length ? angle(ENVOIS.length - 1) : lerp(angle(i - 1), angle(i), easeInOut(prog(f, 0.42, 0.56)));
      if (paquetRouteur.visible) {
        const [de, vers] = ENVOIS[i];
        if (f < 0.4) BRANCHES[de].courbe.getPoint(1 - f / 0.4, paquetRouteur.position);
        else if (f < 0.6) paquetRouteur.position.set(0, 1.3, 0);
        else BRANCHES[vers].courbe.getPoint((f - 0.6) / 0.4, paquetRouteur.position);
        paquetRouteur.position.y += 0.35;
        etiquette('adresse', `Adresse : ${BRANCHES[vers].nom}`, f > 0.38 && f < 0.62 ? 'ok' : '').montrer(paquetRouteur, 1, [0, 0.55, 0]);
        etiquette('lecture', 'Lecture de l\'adresse…', '').montrer(grosRouteur.userData.ancre, f > 0.38 && f < 0.6 ? 1 : 0, [0, 1.2, 0]);
      }
      camera(cam, t, [{ t: 0, p: [0.4, 51, 11], v: [0.4, 39.4, 0.5], fov: 46 }, { t: 16, p: [0.8, 50.6, 10.6], v: [0.4, 39.4, 0.5], fov: 46 }]);
    },
  },
  { // 5.5 Le trajet d'un paquet
    id: '5.5', min: 16,
    textes: (P) => [{ t: P(1) + 1, txt: 'Un fichier local reste dans le café.', ligne: 1 }, { t: P(2) + 2, txt: 'Une page web traverse le routeur et le modem.', ligne: 2 }],
    maj(t, P, F) {
      cafe(t);
      placerMila();
      const l0 = P(1) + 0.2, l1 = l0 + 3.2, w0 = P(2) + 0.2, w1 = Math.max(w0 + 5, F(2));
      paquetCafe.visible = (t > l0 && t < l1 + 0.6) || t > w0;
      if (t < w0) {
        A.local(easeInOut(prog(t, l0, l1)), paquetCafe.position);
        panneau('etapes', etapes(['Ordinateur', 'Commutateur', 'Caisse'], prog(t, l0, l1)), 'etapes').montrer(fondu(t, l0, 0.3), 960, 96);
      } else {
        A.web(easeInOut(prog(t, w0, w1)), paquetCafe.position);
        panneau('etapes2', etapes(['Ordinateur', 'Commutateur', 'Routeur', 'Modem', 'Ligne'], prog(t, w0, w1)), 'etapes').montrer(fondu(t, w0, 0.3), 960, 96);
      }
      paquetCafe.position.y += 0.08;
      etiquette('rt', 'Routeur', '').montrer(A.rt.userData.ancre, fondu(t, w0 + 1, 0.3), [-0.5, 0, 0]);
      etiquette('md', 'Modem', '').montrer(A.md.userData.ancre, fondu(t, w0 + 2, 0.3), [0.5, 0, 0]);
      camera(cam, t, [{ t: 0, p: [0.4, 9.6, 8.4], v: [-0.2, 0.8, -2.8], fov: 44 }, { t: w0, p: [0.4, 9.6, 8.4], v: [-0.2, 0.8, -2.8], fov: 44 }, { t: w0 + 3, p: [1.2, 9.8, 6.5], v: [1.0, 1.4, -4.8], fov: 46 }]);
    },
  },
  { // 5.6 Les pièges
    id: '5.6', min: 8,
    textes: (P) => [{ t: P(0) + 0.5, txt: 'Ils ne stockent pas les sites web…', ligne: 1 }, { t: P(1), txt: '…et ne produisent pas d\'électricité.', ligne: 2 }],
    maj(t, P) {
      cafe(t); placerMila(); signalLigne(t, 1);
      etiquette('rt', 'Routeur', '').montrer(A.rt.userData.ancre, 1);
      etiquette('md', 'Modem', '').montrer(A.md.userData.ancre, 1);
      panneau('p1', '<span>🌐</span><b>✕</b>', 'barre').montrer(fondu(t, P(0) + 1.2, 0.3), 1320, 560);
      panneau('p2', '<span>⚡</span><b>✕</b>', 'barre').montrer(fondu(t, P(1) + 0.3, 0.3), 1620, 560);
      camera(cam, t, [{ t: 0, ...CAM_FOND }, { t: 9, p: [2.4, 3.9, -0.4], v: [2.75, 2.0, -3.75], fov: 42 }]);
    },
  },
  { // 5.7 Au collège : la baie technique
    id: '5.7', min: 9,
    textes: (P) => [{ t: P(0) + 0.4, txt: 'Au collège : le même chemin.', ligne: 1 }, { t: P(0) + 1.8, txt: 'Ligne → modem → routeur → commutateur.', ligne: 2 }],
    maj(t) {
      cafe(t); placerMila(); signalLigne(t, 1);
      paquetCafe.visible = true; A.web(1 - ((t / 4) % 1), paquetCafe.position); paquetCafe.position.y += 0.08;
      camera(cam, t, [{ t: 0, p: [0.4, 9.6, 8.4], v: [0.4, 0.8, -3.2], fov: 44 }, { t: 10, p: [0.0, 9.4, 8.0], v: [0.4, 0.8, -3.2], fov: 44 }]);
    },
  },
  { // 5.8 Question
    id: '5.8', min: 8,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Le modem ou le routeur : lequel lit l\'adresse d\'un paquet ?', style: 'question' }],
    maj(t) {
      cafe(t); placerMila();
      etiquette('rt', 'Routeur ?', '').montrer(A.rt.userData.ancre, fondu(t, 0.8, 0.4));
      etiquette('md', 'Modem ?', '').montrer(A.md.userData.ancre, fondu(t, 1.2, 0.4));
      camera(cam, t, [{ t: 0, p: [2.8, 2.9, -0.6], v: [2.75, 2.3, -3.75], fov: 42 }, { t: 10, p: [2.6, 2.85, -0.8], v: [2.75, 2.3, -3.75], fov: 42 }]);
    },
  },
];
function placerMila() { laMila.visible = true; laMila.position.set(1.2, 0, -1.55); laMila.animer(0); }

ctx.vignetteLegende.textContent = 'Baie technique : modem, routeur, commutateur';
ctx.definir(plans, {
  scene: baie.scene, cam: baie.cam, maj: baie.maj,
  alpha(i, t) { const p = plans[i]; return p.id === '5.7' ? fondu(t, p.P(0), 0.6) : 0; },
});
void easeOut; void pop; void pv; void GRIS; void ligneBrisee;
