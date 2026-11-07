// Chapitre 7 : mission maintenance. Deux appels : « rien ne sort » (modem) et « paquets au mauvais endroit » (routeur),
// au café (à gauche) et au collège (à droite, plan schématique : vie scolaire, salle de technologie, CDI).
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, easeInOut, fondu, W, H } from './moteur.js';
import { C, mat, lum, colis, poser, boite, halo, texture, modem, routeur, chemin } from './modeles.js';
import { decor } from './decor.js';
import { reseauCafe, accesInternet } from './reseaucafe.js';

const ctx = lancerChapitre({ numero: 7, titre: 'Mission maintenance', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const A = accesInternet(R);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const GRIS = new THREE.Color(C.eteint);

// ---------- café ----------
const sortants = [0, 1, 2].map(() => { const c = colis(0.14); caf.groupe.add(c); return c; });
const commande = colis(0.16); caf.groupe.add(commande);
const signaux = Array.from({ length: 6 }, () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lum(C.internet, 1.6)); caf.groupe.add(s); return s; });
const panneMd = halo(C.panne, 1.2); caf.groupe.add(panneMd);
const panneRt = halo(C.panne, 1.2); caf.groupe.add(panneRt);
// Page « commande en ligne » : ligne → modem → routeur → commutateur → (mauvais appareil) imprimante de cuisine.
const pageMauvaise = chemin([[A.cML.courbe, true], [A.cRM.courbe, true], [A.cRS.courbe, true], [R.cables.imprimanteCuisine.courbe, false]]);
// Envoi local réussi (ordinateur → caisse) et envoi vers Internet bloqué au modem.
const versModem = chemin([[R.cables.ordinateur.courbe, true], [A.cRS.courbe, false], [A.cRM.courbe, false]]);
function signalLigne(t, actif) {
  signaux.forEach((s, k) => { s.visible = actif; if (actif) { const u = ((t / 2.2 + k / signaux.length) % 1); A.cML.courbe.getPoint(1 - u, s.position); } });
}

// ---------- collège : plan schématique (vignette en moitié droite) ----------
function plaque(txt, fond = 'rgba(11,29,58,.92)', couleur = '#ffffff', w = 512) {
  const t = texture(w, 112, (g) => {
    g.fillStyle = fond; g.beginPath(); g.roundRect(4, 4, w - 8, 104, 22); g.fill();
    g.fillStyle = couleur; g.font = '800 54px "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, 60);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
  s.scale.set(w / 112 * 0.55, 0.55, 1); s.renderOrder = 10; return s;
}
const sc = new THREE.Scene(); sc.background = new THREE.Color('#e3edf6');
const camC = new THREE.PerspectiveCamera(50, 960 / 1080, 0.1, 100);
sc.add(new THREE.HemisphereLight('#ffffff', '#a8b4c2', 1.3));
const dl = new THREE.DirectionalLight('#ffffff', 1.5); dl.position.set(3, 10, 6); sc.add(dl);
const solC = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat('#cfd8e2', { r: 0.9 })); solC.rotation.x = -Math.PI / 2; sc.add(solC);
const SALLES = [['Vie scolaire', -3.3, '#f6dcc4'], ['Salle de technologie', 0, '#d5ecd9'], ['CDI', 3.3, '#d3e3f7']].map(([nom, x, c]) => {
  const g = new THREE.Group(); g.position.set(x, 0, 2.2); sc.add(g);
  poser(boite(2.8, 0.05, 2.4, mat(c, { r: 0.8 })), 0, 0.025, 0, g);
  for (const [w, d, px, pz] of [[2.8, 0.1, 0, -1.2], [2.8, 0.1, 0, 1.2], [0.1, 2.4, -1.4, 0], [0.1, 2.4, 1.4, 0]]) poser(boite(w, 0.5, d, mat('#f4f1ea')), px, 0.25, pz, g);
  poser(boite(0.5, 0.32, 0.04, mat('#1b2433', { e: '#cfe6ff', ei: 0.9 })), 0, 0.6, -0.2, g);
  const p = plaque(nom, 'rgba(11,29,58,.92)', '#ffffff', nom.length > 12 ? 720 : 512); p.position.set(0, 1.6, 0.4); g.add(p);
  return { nom, g, pos: V(x, 0.35, 2.0) };
});
const mdC = poser(modem(), -0.8, 0.5, -3.4, sc); mdC.scale.setScalar(2.2);
const rtC = poser(routeur(), 0.9, 0.5, -3.4, sc); rtC.scale.setScalar(2.0);
poser(boite(3.4, 0.5, 1.2, mat('#2a2f37')), 0, 0.25, -3.4, sc);
const pB = plaque('Baie technique'); pB.position.set(0, 1.9, -3.4); sc.add(pB);
const ligneC = new THREE.LineCurve3(V(-0.8, 0.85, -3.4), V(-0.8, 0.85, -7.5));
sc.add(new THREE.Mesh(new THREE.TubeGeometry(ligneC, 4, 0.06, 8), mat(C.internet)));
const pL = plaque('Ligne de l\'opérateur', 'rgba(11,29,58,.92)', '#ffffff', 720); pL.position.set(-2.9, 1.0, -5.6); sc.add(pL);
const lienMR = new THREE.LineCurve3(V(-0.3, 0.75, -3.4), V(0.35, 0.75, -3.4));
sc.add(new THREE.Mesh(new THREE.TubeGeometry(lienMR, 2, 0.05, 8), mat(C.internet)));
const liensSalles = SALLES.map((s) => { const c = new THREE.LineCurve3(V(0.9, 0.6, -3.0), s.pos.clone()); sc.add(new THREE.Mesh(new THREE.TubeGeometry(c, 4, 0.05, 8), mat(C.local, { e: C.local, ei: 0.4 }))); return c; });
const paquetsC = [0, 1, 2, 3].map(() => { const p = colis(0.22); sc.add(p); return p; });
const pageC = colis(0.26); sc.add(pageC);
const pageEtiq = plaque('Page : vie scolaire', 'rgba(255,207,51,.95)', '#1b2333', 640); pageEtiq.scale.multiplyScalar(0.8); sc.add(pageEtiq);
const croix = plaque('✗ Mauvaise salle !', 'rgba(46,34,0,.95)', '#ffe48a', 640); sc.add(croix);
const halosC = [halo(C.panne, 2.2), halo(C.panne, 2.2)]; halosC[0].position.copy(mdC.position).setY(1.1); halosC[1].position.copy(rtC.position).setY(1.1); halosC.forEach((h) => sc.add(h));
let etatC = 'normal';
function majCollege(t) {
  camC.position.set(0, 12.5, 11.5); camC.lookAt(0, 0, -0.4);
  const panne = etatC;
  halosC[0].visible = panne === 'modem'; halosC[1].visible = panne === 'routeur';
  halosC.forEach((h) => { h.material.opacity = 0.5 + 0.5 * Math.sin(t * 9); });
  // Réseau local (salles ↔ routeur) : toujours actif.
  paquetsC.forEach((p, k) => {
    p.visible = true;
    const u = ((t / 2.4 + k * 0.29) % 1), l = liensSalles[k % 3];
    l.getPoint(k % 2 ? u : 1 - u, p.position);
    if (panne === 'modem' && k === 3) { const v = Math.min(1, ((t / 3) % 1) * 1.6); p.position.lerpVectors(SALLES[1].pos, V(-0.3, 0.8, -3.0), v); }
  });
  pageC.visible = pageEtiq.visible = panne === 'routeur'; croix.visible = false;
  if (panne === 'routeur') {
    const cyc = Math.floor(t / 4), u = (t / 4) % 1, cible = SALLES[cyc % 2 ? 2 : 1].pos;
    if (u < 0.35) pageC.position.lerpVectors(V(-0.8, 0.85, -7.5), V(-0.8, 0.9, -3.4), u / 0.35);
    else if (u < 0.5) pageC.position.lerpVectors(V(-0.8, 0.9, -3.4), V(0.9, 0.9, -3.2), (u - 0.35) / 0.15);
    else pageC.position.lerpVectors(V(0.9, 0.7, -3.0), cible, Math.min(1, (u - 0.5) / 0.35));
    pageEtiq.position.copy(pageC.position).add(V(0, 0.75, 0));
    croix.visible = u > 0.85; croix.position.copy(cible).add(V(0, 2.3, 0));
  }
}

// ---------- remise à zéro ----------
function base() {
  D.reinitialiser(); cam.clearViewOffset();
  D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(1);
  sortants.forEach((s) => s.visible = false); commande.visible = false; signaux.forEach((s) => s.visible = false);
  panneMd.visible = panneRt.visible = false; etatC = 'normal';
  ctx.renderer.domElement.style.filter = ''; A.md.allumer(1); A.cML.normal();
}
function partage() { cam.setViewOffset(W, H, W / 4, 0, W, H); }
const CAM_G = { p: [-0.4, 13.8, 11.6], v: [-0.6, 0.6, -2.0], fov: 46 };
const CAM_FOND = { p: [2.4, 4.4, 0.6], v: [2.6, 1.6, -3.7], fov: 46 };
function cafeReseau(t) { R.etat(t); A.montrer(true); laMila.animer(t); }
function panneModem(t, k = 1) {
  panneMd.visible = k > 0; A.md.getWorldPosition(panneMd.position); panneMd.position.y += 0.25; panneMd.material.opacity = 0.5 + 0.5 * Math.sin(t * 9);
  A.md.allumer(0.1); A.cML.teinte(GRIS, 0.05);
}
function panneRouteur(t, k = 1) {
  panneRt.visible = k > 0; A.rt.getWorldPosition(panneRt.position); panneRt.position.y += 0.25; panneRt.material.opacity = 0.5 + 0.5 * Math.sin(t * 9);
}
// Trois colis vers Internet qui s'entassent devant le modem.
function bouchon(t) {
  sortants.forEach((s, k) => {
    s.visible = true;
    const u = Math.min(1, ((t / 3 + k * 0.33) % 1.6) / 1);
    versModem(u * 0.97, s.position); s.position.y += 0.08 + (u >= 0.97 ? k * 0.16 : 0);
  });
}

const PARTAGE = new Set(['7.1', '7.2', '7.3', '7.4']);
const plans = [
  { // 7.0 Titre
    id: '7.0', min: 7, fondu: false,
    textes: (P) => [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 7 · Mission maintenance', style: 'soustitre' }, { t: P(1), txt: 'Aujourd\'hui, le technicien, c\'est toi.', ligne: 2 }],
    maj(t) { cafeReseau(t); D.ouvrirCafe(0); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 7.1 Premier appel : rien ne sort
    id: '7.1', min: 12,
    textes: (P) => [
      { t: 0.3, txt: '📞 Appel 1', style: 'etiquettePlan' },
      { t: P(1) + 0.6, txt: 'Le réseau local fonctionne… mais rien ne sort.', ligne: 1 },
      { t: P(3), txt: 'Modem ou routeur ?', ligne: 2 },
    ],
    maj(t, P) {
      partage(); cafeReseau(t); etatC = t > P(2) ? 'modem' : 'normal';
      if (t > P(2)) { bouchon(t); A.cML.teinte(GRIS, 0.05); }
      etiquette('local', '✓ Fichiers échangés dans le café', 'ok').montrer(caf.appareils.caisse.userData.ancre, fondu(t, P(1) + 0.4, 0.4), [0, 0.2, 0]);
      etiquette('bloc', '✗ Rien ne sort vers l\'extérieur', 'panne').montrer(A.md.userData.ancre, fondu(t, P(2) + 0.6, 0.4), [0, 0.3, 0]);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 7.2 C'est le modem
    id: '7.2',
    textes: (P) => [{ t: P(0), txt: 'C\'est le modem :', ligne: 1 }, { t: P(2), txt: 'la traduction ne se fait plus.', ligne: 2 }],
    maj(t, P) {
      partage(); cafeReseau(t); etatC = 'modem'; bouchon(t); panneModem(t);
      etiquette('md', 'Modem en panne', 'panne').montrer(A.md.userData.ancre, fondu(t, P(0) + 0.2, 0.3), [0, 0.15, 0]);
      etiquette('ligne', 'Ligne : plus de signal', '').montrer(A.pt, fondu(t, P(1) + 0.8, 0.3), [0, 5.2, 0]);
      camera(cam, t, [{ t: 0, ...CAM_G }, { t: 3, ...CAM_FOND }]);
    },
  },
  { // 7.3 Deuxième appel : paquets au mauvais endroit
    id: '7.3', min: 16,
    textes: (P) => [
      { t: 0.3, txt: '📞 Appel 2', style: 'etiquettePlan' },
      { t: P(1) + 0.6, txt: 'La ligne fonctionne… mais les pages arrivent au hasard.', ligne: 1 },
      { t: P(4), txt: 'Modem ou routeur ?', ligne: 2 },
    ],
    maj(t, P) {
      partage(); cafeReseau(t); signalLigne(t, true); etatC = t > P(3) ? 'routeur' : 'normal';
      const c0 = P(2), c1 = c0 + 3.6;
      commande.visible = t > c0;
      pageMauvaise(easeInOut(prog(t, c0, c1)), commande.position); commande.position.y += 0.1;
      etiquette('adr', 'Commande : pour la caisse', 'ok').montrer(commande, t > c0 && t < c1 ? 1 : 0, [0, 0.35, 0]);
      etiquette('cuis', '🧾 La commande sort en cuisine !', 'panne').montrer(caf.appareils.imprimanteCuisine.userData.ancre, fondu(t, c1, 0.3), [0, 0.25, 0]);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 7.4 C'est le routeur
    id: '7.4', min: 8,
    textes: (P) => [{ t: P(0), txt: 'C\'est le routeur :', ligne: 1 }, { t: P(1), txt: 'les adresses ne sont plus lues, l\'aiguillage ne se fait plus.', ligne: 2 }],
    maj(t, P) {
      partage(); cafeReseau(t); signalLigne(t, true); etatC = 'routeur'; panneRouteur(t);
      commande.visible = true; pageMauvaise(((t / 4) % 1), commande.position); commande.position.y += 0.1;
      etiquette('rt', 'Routeur en panne', 'panne').montrer(A.rt.userData.ancre, fondu(t, P(0) + 0.2, 0.3), [0, 0.15, 0]);
      etiquette('cuis', 'Mauvais endroit', 'panne').montrer(caf.appareils.imprimanteCuisine.userData.ancre, 1, [0, 0.25, 0]);
      camera(cam, t, [{ t: 0, ...CAM_G }, { t: 3, ...CAM_FOND }]);
    },
  },
  { // 7.5 À retenir
    id: '7.5', min: 8,
    textes: () => [{ t: 0.3, txt: 'À retenir', style: 'etiquettePlan' }],
    maj(t, P) {
      cafeReseau(t);
      ctx.renderer.domElement.style.filter = `blur(${5 * fondu(t, 0, 0.6)}px) brightness(${1 - 0.35 * fondu(t, 0, 0.6)})`;
      const ligne = (sym, panne, mat, role) => `<span class="symptome">${sym}</span><i>→</i><b>${mat}</b><small>${role}</small>`;
      panneau('r1', ligne('📵', '', 'Le modem', 'le traducteur'), 'retenir').montrer(fondu(t, P(0), 0.4), 960, 330, `<span class="symptome">Rien ne sort vers l'extérieur</span><i>→</i><b>Le modem</b><small>(le traducteur)</small>`);
      panneau('r2', '', 'retenir').montrer(fondu(t, P(1), 0.4), 960, 520, `<span class="symptome">Paquets au mauvais endroit</span><i>→</i><b>Le routeur</b><small>(l'aiguilleur)</small>`);
      void ligne;
      camera(cam, t, [{ t: 0, ...CAM_G }, { t: 10, p: [0, 13.5, 11], v: [-0.6, 0.6, -2.0], fov: 46 }]);
    },
  },
  { // 7.6 Question : plus rien ne communique
    id: '7.6', min: 9,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Plus aucun appareil ne communique, même dans le café. Modem, routeur… ou un autre matériel ?', style: 'question' }],
    maj(t, P) {
      cafeReseau(t);
      const k = fondu(t, P(0) + 1, 0.6);
      if (k > 0) {
        R.sw.userData.ecrans.forEach((e) => { e.m.emissiveIntensity = 0.05; });
        Object.values(R.cables).forEach((c) => c.teinte(new THREE.Color(C.local).lerp(GRIS, k), 0.1));
        R.paquets.forEach((p) => { p.visible = false; });
      }
      for (const n of ['caisse', 'ordinateur', 'imprimanteCuisine']) etiquette(`ko${n}`, '✗', 'panne').montrer(caf.appareils[n].userData.ancre, k, [0, 0.2, 0]);
      camera(cam, t, [{ t: 0, p: [0.4, 12.4, 9.6], v: [-0.4, -0.2, -2.0], fov: 46 }, { t: 10, p: [0.0, 12.1, 9.2], v: [-0.4, -0.2, -2.0], fov: 46 }]);
    },
  },
];

ctx.partage.querySelector('.g').textContent = 'Le café de Mila';
ctx.partage.querySelector('.d').textContent = 'Le collège';
ctx.definir(plans, {
  scene: sc, cam: camC, maj: majCollege,
  alpha(i) { return PARTAGE.has(plans[i].id) ? 1 : 0; },
  rect: () => ({ x: W / 2, y: 0, w: W / 2, h: H, cadre: false }),
  partage(i) { return PARTAGE.has(plans[i].id) ? 1 : 0; },
});
void lerp; void V;
