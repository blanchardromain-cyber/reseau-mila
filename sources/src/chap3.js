// Chapitre 3 : le serveur. Le gardien (authentification) et l'armoire (stockage centralisé), puis le collège.
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import { C, mat, colis, poser, personnage, serveur, boite, ligneBrisee } from './modeles.js';
import { decor, marcher } from './decor.js';
import { reseauCafe, POS_SERVEUR } from './reseaucafe.js';
import { vignetteCollege } from './college.js';

const ctx = lancerChapitre({ numero: 3, titre: 'Le serveur', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const { srv } = R;
const pv = new THREE.Vector3();

// Personnages fictifs
const hugo = personnage({ haut: '#4fa36b', bas: '#2f3e5c', cheveux: '#2a1a10', tablier: '#fff7e8' }); caf.groupe.add(hugo);
const ines = personnage({ haut: '#8a63d2', bas: '#2f3e5c', cheveux: '#1d1d1d', tablier: '#fff7e8', chignon: true }); caf.groupe.add(ines);
const gardien = personnage({ haut: C.local, bas: '#1d2a44', cheveux: '#2a1a10' }); caf.groupe.add(gardien);
poser(new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.215, 0.1, 24), mat('#14284d')), 0, 1.58, 0, gardien);
poser(boite(0.24, 0.025, 0.16, mat('#14284d')), 0, 1.54, 0.2, gardien);
const badge = colis(0.16); caf.groupe.add(badge);
const fichier = colis(0.16); caf.groupe.add(fichier);
const fichier2 = colis(0.16); caf.groupe.add(fichier2);
// Fils électriques (pour montrer ce que le serveur ne fait PAS)
const elec = ['caisse', 'ordinateur', 'imprimante'].map((k) => {
  const a = POS_SERVEUR.clone().setY(2.1), b = caf.appareils[k].position.clone().setY(caf.appareils[k].position.y + 0.3);
  const m = a.clone().lerp(b, 0.5); m.y = 4.2;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 60, 0.035, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4c2').multiplyScalar(1.6), transparent: true, toneMapped: false }));
  caf.groupe.add(tube); return tube;
});

// Salle De Vinci du collège (mêmes 16 postes que la vignette du chapitre 1), placée en hauteur, et son serveur.
const SALLE = new THREE.Vector3(0, 60, 0);
const salle = vignetteCollege();
const groupeSalle = new THREE.Group(); groupeSalle.position.copy(SALLE); groupeSalle.add(salle.scene); scene.add(groupeSalle);
// Les lumières de la vignette s'ajouteraient à celles du décor : on les éteint, et le sol foncé garde le texte lisible.
salle.scene.traverse((o) => {
  if (o.isLight) o.intensity = 0;
  if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.material.color.set('#8796a8');
});
// Le serveur du collège n'est pas dans la salle : il est dans une pièce centrale, le bureau de la responsable
// informatique, relié à la salle De Vinci par un câble qui traverse la cloison.
const bureau = new THREE.Group(); poser(bureau, -12.2, 0, 0, groupeSalle);
const solB = new THREE.Mesh(new THREE.PlaneGeometry(8.9, 9), mat('#9aa3ae', { r: 0.9 })); solB.rotation.x = -Math.PI / 2; poser(solB, 0.95, 0.004, -0.4, bureau);
poser(boite(7, 2.6, 0.15, mat('#efe6d6', { r: 0.9 })), 0, 1.3, -4.6, bureau);
poser(boite(0.15, 2.6, 9, mat('#efe6d6', { r: 0.9 })), 3.55, 1.3, -0.4, bureau);
poser(boite(1.6, 0.05, 0.8, mat('#c99b6d', { r: 0.7 })), -0.6, 0.76, -1.2, bureau);
for (const [a, b] of [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]]) poser(boite(0.05, 0.74, 0.05, mat('#333a44')), -0.6 + a, 0.37, -1.2 + b, bureau);
const ecranB = poser(boite(0.6, 0.38, 0.04, mat('#1b2433', { e: '#cfe6ff', ei: 0.9 })), -0.6, 1.02, -1.4, bureau); void ecranB;
const srvCollege = serveur(['Léo', 'Sarah', 'Nina', 'Commun']); poser(srvCollege, 1.6, 0, -3.9, bureau);
const aBureau = new THREE.Object3D(); aBureau.position.set(-1.6, 3.2, -1.4); bureau.add(aBureau);
const eleve = personnage({ haut: '#3c8dbc', bas: '#3a3a4a', cheveux: '#5a3a26' }); groupeSalle.add(eleve);
const posePoste = (r, c) => new THREE.Vector3((c - 1.5) * 2.1, 0.96, -1.6 + r * 1.55 - 0.12);
const POSTE_A = posePoste(1, 0), POSTE_B = posePoste(2, 3);
const ancres = [POSTE_A, POSTE_B, posePoste(0, 2), posePoste(3, 1)].map((p) => { const o = new THREE.Object3D(); o.position.copy(p).setY(1.3); groupeSalle.add(o); return o; });
const paquetSalle = colis(0.16); groupeSalle.add(paquetSalle);
const SW_SALLE = new THREE.Vector3(0, 0.9, -3.3);
const CHEMIN_SRV = [new THREE.Vector3(-10.6, 0.9, -3.5), new THREE.Vector3(-10.6, 0.06, -3.4), new THREE.Vector3(-0.3, 0.06, -3.4), new THREE.Vector3(-0.3, 0.8, -3.35), SW_SALLE];
const lienSrv = new THREE.Mesh(new THREE.TubeGeometry(ligneBrisee(CHEMIN_SRV.slice(0, 4)), 80, 0.045, 8), mat(C.local, { e: C.local, ei: 0.4 }));
groupeSalle.add(lienSrv);
const routes = [POSTE_A, POSTE_B].map((v) => ligneBrisee([...CHEMIN_SRV, v.clone()]));
function trajetSalle(u, k, cible) { return routes[k].getPoint(u, cible); } // serveur → commutateur → poste

const LOGIN = (mdp, nom = 'ines') => `<div class="login"><b>Connexion</b><span>Identifiant : <code>${nom}</code></span><span>Mot de passe : <code>${mdp}</code></span></div>`;

function base() {
  D.reinitialiser();
  R.sw.visible = R.etagere.visible = false; srv.visible = false;
  Object.values(R.cables).forEach((c) => c.regler({ p: 0 })); R.paquets.forEach((p) => p.visible = false);
  hugo.visible = ines.visible = gardien.visible = false; badge.visible = fichier.visible = fichier2.visible = false;
  elec.forEach((e) => e.visible = false);
  groupeSalle.visible = false; paquetSalle.visible = false;
  srv.userData.porte.rotation.y = 0; Object.values(srv.userData.tiroirs).forEach((t) => t.position.z = 0);
  srv.scale.setScalar(1);
}
function cafeOuvert() { D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(1); }
function placer(p, x, z, ry) { p.visible = true; p.position.set(x, 0, z); p.rotation.y = ry; }
// Un colis suit un chemin entre deux appareils (par le commutateur) entre t0 et t1.
function trajet(obj, t, t0, t1, chemin) {
  obj.visible = t >= t0 && t <= t1 + 0.05;
  if (obj.visible) { chemin(easeInOut(prog(t, t0, t1)), obj.position); obj.position.y += 0.1; }
}
function ouvrirTiroir(s, nom, k) { s.userData.porte.rotation.y = -1.9 * easeInOut(Math.min(1, k * 2)); s.userData.tiroirs[nom].position.z = 0.5 * easeInOut(Math.max(0, k * 2 - 1)); }
const CAM_CAFE = { p: [1.2, 9.2, 8.6], v: [-1.6, 0.6, -2.0], fov: 40 };

const plans = [
  { // 3.0 Titre
    id: '3.0', min: 6, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 3 · Le serveur', style: 'soustitre' }],
    maj(t) { D.vil.visible = caf.groupe.visible = true; laMila.animer(t); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 3.1 Les fichiers coincés sur un seul ordinateur
    id: '3.1',
    textes: (P) => [{ t: P(1) + 0.5, txt: 'Les fichiers sont coincés', ligne: 1 }, { t: P(2), txt: 'sur un seul ordinateur.', ligne: 2 }],
    maj(t, P) {
      cafeOuvert(); R.etat(t, { serveurVisible: false });
      placer(laMila, -4.6, -2.45, Math.PI); laMila.animer(t);
      placer(hugo, 1.5, -1.6, 0); hugo.animer(t, { salut: Math.sin(Math.PI * prog(t, P(0) + 0.3, P(0) + 2)) });
      placer(ines, 3.4, -1.5, -0.6); ines.animer(t + 1, { salut: Math.sin(Math.PI * prog(t, P(0) + 0.8, P(0) + 2.4)) });
      etiquette('hugo', 'Hugo').montrer(hugo.userData.ancre, fondu(t, P(0) + 0.2, 0.4) * (1 - fondu(t, P(1), 0.4)));
      etiquette('ines', 'Inès').montrer(ines.userData.ancre, fondu(t, P(0) + 0.7, 0.4) * (1 - fondu(t, P(1), 0.4)));
      etiquette('fichier', '📄 Commandes du jour', '').montrer(caf.appareils.ordinateur.userData.ancre, fondu(t, P(1) + 0.4, 0.4), [0, 0.1, 0]);
      etiquette('vide', '📂 Dossier vide', 'panne').montrer(caf.appareils.caisse.userData.ancre, fondu(t, P(2) + 0.6, 0.4), [0, 0.2, 0]);
      camera(cam, t, [{ t: 0, p: [3.2, 9, 12.5], v: [0.6, 1, -1.5], fov: 36 }, { t: 3, ...CAM_CAFE }]);
    },
  },
  { // 3.2 Le serveur, allumé jour et nuit
    id: '3.2', min: 9,
    textes: (P) => [{ t: P(0) + 0.6, txt: 'Serveur', ligne: 1 }, { t: P(1), txt: 'Un ordinateur allumé en permanence.', ligne: 2 }],
    maj(t, P) {
      cafeOuvert();
      const s = pop(t, P(0) + 0.2, 0.6);
      R.etat(t, { dessinServeur: 0, d0: P(0) + 0.8 });
      srv.scale.setScalar(Math.max(0.001, s));
      placer(laMila, -3.6, -1.6, -1.2); laMila.animer(t);
      // Deux journées en accéléré : le voyant du serveur ne s'éteint jamais.
      const c = prog(t, P(1), P(1) + 7);
      const k = c > 0 && c < 1 ? (1 - Math.cos(c * Math.PI * 4)) / 2 : 0;
      if (k > 0) D.nuit(k);
      panneau('astre', k > 0.5 ? '🌙' : '☀️', 'astre').montrer(fondu(t, P(1), 0.4) * (1 - fondu(t, P(1) + 7, 0.4)), 1700, 110);
      etiquette('srv', 'Serveur', 'local').montrer(srv.userData.ancre, fondu(t, P(0) + 0.8, 0.4));
      camera(cam, t, [{ t: 0, ...CAM_CAFE }, { t: P(0) + 1.4, p: [-1.4, 3.4, 2.8], v: [-5.3, 1.2, -0.9], fov: 40 }]);
    },
  },
  { // 3.3 Le gardien : authentification
    id: '3.3',
    textes: (P) => [
      { t: 0.3, txt: 'Rôle 1 : le gardien', style: 'etiquettePlan' },
      { t: P(2), txt: 'Il vérifie l\'identité :', ligne: 1 },
      { t: P(2) + 1.1, txt: 'identifiant + mot de passe (authentification).', ligne: 2 },
    ],
    maj(t, P, F) {
      cafeOuvert(); R.etat(t, { fluxAmbiant: false });
      placer(ines, 1.5, -1.6, 0); ines.animer(t);
      placer(hugo, 3.6, -1.5, -0.8); hugo.animer(t);
      placer(laMila, -2.6, 1.0, 2.6); laMila.animer(t);
      placer(gardien, -4.75, 0.25, Math.PI / 2); gardien.animer(t);
      etiquette('gardien', 'Le gardien', 'local').montrer(gardien.userData.ancre, fondu(t, P(0) + 0.2, 0.4));
      const essai2 = t >= P(3);
      etiquette('login', '', 'login').montrer(caf.appareils.caisse.userData.ancre, fondu(t, P(1), 0.4), [0, 0.15, 0], LOGIN(essai2 ? '••••' : '••••••'));
      const aller1 = [P(1) + 1.4, P(2) + 0.6], retour1 = [F(2) - 0.6, F(2) + 1.2];
      const aller2 = [P(3) + 0.1, P(4) - 0.1];
      if (t < retour1[0]) trajet(badge, t, aller1[0], aller1[1], R.via('caisse', 'serveur'));
      else if (t < aller2[0]) trajet(badge, t, retour1[0], retour1[1], R.via('serveur', 'caisse'));
      else trajet(badge, t, aller2[0], aller2[1], R.via('caisse', 'serveur'));
      const ok = t > F(2) - 1.0 && t < P(3);
      etiquette('verif', 'Vérification…', '').montrer(srv.userData.ancre, (t > aller1[1] && t < F(2) - 1.0) || (t > aller2[1] && t < P(4)) ? 1 : 0);
      etiquette('ok', '✓ Accès autorisé', 'ok').montrer(srv.userData.ancre, ok ? 1 : 0);
      etiquette('refus', '✗ Accès refusé', 'refus').montrer(srv.userData.ancre, fondu(t, P(4), 0.3));
      caf.appareils.caisse.allumer(ok || (t > retour1[1] && t < P(3)) ? 1.6 : 1);
      camera(cam, t, [{ t: 0, p: [-0.4, 7.6, 7.2], v: [-2.0, 0.8, -1.3], fov: 40 }, { t: 15, p: [-0.8, 7.3, 6.8], v: [-2.0, 0.8, -1.3], fov: 40 }]);
    },
  },
  { // 3.4 L'armoire : stockage centralisé
    id: '3.4',
    textes: (P) => [
      { t: 0.3, txt: 'Rôle 2 : l\'armoire', style: 'etiquettePlan' },
      { t: P(1) + 2.5, txt: 'Il stocke les fichiers', ligne: 1 },
      { t: P(3), txt: 'de façon centralisée.', ligne: 2 },
    ],
    maj(t, P) {
      cafeOuvert(); R.etat(t, { fluxAmbiant: false });
      placer(laMila, -4.6, -2.45, Math.PI); laMila.animer(t);
      etiquette('enreg', '💾 Enregistrer « Commandes du jour »', '').montrer(caf.appareils.ordinateur.userData.ancre, fondu(t, P(1), 0.4) * (1 - fondu(t, P(1) + 2, 0.4)), [0, 0.1, 0]);
      // 1er fichier → espace personnel de Mila ; 2e fichier → espace commun.
      const t0 = P(1) + 0.6, t1 = t0 + 2.6, u0 = P(2) + 0.2, u1 = u0 + 2.6;
      trajet(fichier, t, t0, t1, R.via('ordinateur', 'serveur'));
      trajet(fichier2, t, u0, u1, R.via('ordinateur', 'serveur'));
      const kM = prog(t, t1 - 1.2, t1) * (1 - prog(t, t1 + 1.2, t1 + 2.2));
      const kC = prog(t, u1 - 1.0, u1) * (1 - prog(t, P(3) + 1.6, P(3) + 2.6));
      srv.userData.porte.rotation.y = -1.9 * easeInOut(Math.min(1, Math.max(kM, kC) * 2));
      srv.userData.tiroirs.Mila.position.z = 0.5 * easeInOut(Math.max(0, kM * 2 - 1));
      srv.userData.tiroirs.Commun.position.z = 0.5 * easeInOut(Math.max(0, kC * 2 - 1));
      for (const [obj, ta, nom] of [[fichier, t1, 'Mila'], [fichier2, u1, 'Commun']]) {
        if (t > ta && t < ta + 0.8) {
          obj.visible = true; srv.userData.tiroirs[nom].getWorldPosition(pv);
          obj.position.lerp(caf.groupe.worldToLocal(pv.clone().add(new THREE.Vector3(0, 0.12, 0))), easeInOut(prog(t, ta, ta + 0.8)));
        }
      }
      etiquette('enreg2', '💾 Enregistrer « Recettes » dans l\'espace commun', '').montrer(caf.appareils.ordinateur.userData.ancre, fondu(t, P(2), 0.4) * (1 - fondu(t, P(2) + 2.2, 0.4)), [0, 0.1, 0]);
      etiquette('tiroir', 'Espace personnel de Mila', 'local').montrer(srv.userData.tiroirs.Mila, fondu(t, t1, 0.4), [0.9, 0.12, 0]);
      etiquette('commun', 'Espace commun · Hugo ✓ · Inès ✓ (autorisés)', 'ok').montrer(srv.userData.tiroirs.Commun, fondu(t, u1, 0.4), [0.9, -0.05, 0]);
      camera(cam, t, [{ t: 0, ...CAM_CAFE }, { t: P(1) + 1.6, ...CAM_CAFE }, { t: t1 - 0.6, p: [-2.4, 2.3, 1.2], v: [-5.3, 1.0, -0.9], fov: 42 }]);
    },
  },
  { // 3.5 Le fichier suit Mila jusqu'à la caisse
    id: '3.5', min: 9,
    textes: (P) => [{ t: P(1), txt: 'Mes fichiers me suivent', ligne: 1 }, { t: P(1) + 1, txt: 'sur n\'importe quel poste.', ligne: 2 }],
    maj(t, P) {
      cafeOuvert(); R.etat(t, { fluxAmbiant: false });
      laMila.visible = true;
      marcher(laMila, t, 0.2, P(0) + 2.4, [[-4.6, -2.45], [-3.0, -2.2], [-0.8, -1.75], [1.5, -1.6]]); laMila.animer(t);
      if (t > P(0) + 2.4) laMila.rotation.y = 0;
      const t0 = P(0) + 2.6, t1 = t0 + 2.4;
      etiquette('login', '', 'login').montrer(caf.appareils.caisse.userData.ancre, fondu(t, t0 - 0.4, 0.3) * (1 - fondu(t, t1, 0.3)), [0, 0.15, 0], LOGIN('••••••', 'mila'));
      ouvrirTiroir(srv, 'Mila', prog(t, t0 - 0.6, t0 + 0.4) * (1 - prog(t, t1, t1 + 1)));
      trajet(fichier, t, t0 + 0.3, t1, R.via('serveur', 'caisse'));
      etiquette('trouve', '📄 Commandes du jour ✓', 'ok').montrer(caf.appareils.caisse.userData.ancre, fondu(t, t1, 0.4), [0, 0.15, 0]);
      camera(cam, t, [{ t: 0, p: [-2.6, 2.4, 1.0], v: [-5.3, 1.1, -0.9], fov: 40 }, { t: 2.2, p: [0.2, 8.2, 7.6], v: [-1.6, 0.6, -1.7], fov: 40 }]);
    },
  },
  { // 3.6 Le serveur ne fournit pas l'électricité
    id: '3.6', min: 8,
    textes: (P) => [{ t: P(0) + 0.5, txt: 'Le serveur ne fournit pas l\'électricité.', ligne: 1 }, { t: P(1), txt: 'Il gère les accès et stocke les données.', ligne: 2 }],
    maj(t, P) {
      cafeOuvert(); R.etat(t);
      placer(laMila, 1.5, -1.6, 0); laMila.animer(t);
      const a = fondu(t, P(0) + 0.4, 0.5) * (1 - fondu(t, P(1) - 0.2, 0.6));
      elec.forEach((e) => { e.visible = a > 0.01; e.material.opacity = a * (0.7 + 0.3 * Math.sin(t * 18)); });
      panneau('barre', '<span>⚡</span><b>✕</b>', 'barre').montrer(fondu(t, P(0) + 1.6, 0.3) * (1 - fondu(t, P(1) - 0.2, 0.6)), 960, 300);
      etiquette('roles', '✓ Gère les accès · ✓ Stocke les données', 'local').montrer(srv.userData.ancre, fondu(t, P(1), 0.4));
      camera(cam, t, [{ t: 0, p: [0.2, 8.2, 7.6], v: [-1.6, 0.6, -1.7], fov: 40 }, { t: 8, p: [-0.4, 8.6, 8.0], v: [-1.8, 0.8, -1.7], fov: 40 }]);
    },
  },
  { // 3.7 Au collège
    id: '3.7',
    textes: (P) => [
      { t: 0.3, txt: 'Au collège', style: 'etiquettePlan' },
      { t: P(2), txt: 'Ta session : identifiant + mot de passe.', ligne: 1 },
      { t: P(3), txt: 'Ton espace personnel, sur n\'importe quel poste.', ligne: 2 },
    ],
    maj(t, P, F) {
      D.ambiance(0); groupeSalle.visible = true; salle.maj(t); srvCollege.clignoter(t);
      // L'élève se connecte au poste A, puis au poste B ; le serveur est dans le bureau de la responsable informatique.
      const a = [POSTE_A.x, POSTE_A.z + 0.75], b = [POSTE_B.x, POSTE_B.z + 0.75];
      if (t < P(3)) { eleve.position.set(a[0], 0, a[1]); eleve.rotation.y = Math.PI; }
      else marcher(eleve, t, P(3), P(3) + 2.4, [a, [a[0] + 1.0, a[1] + 0.9], [b[0], b[1] + 0.5], b]);
      if (t > P(3) + 2.4) eleve.rotation.y = Math.PI;
      eleve.animer(t);
      const tA = P(2) + 0.3, tB = P(3) + 2.5;
      etiquette('loginA', '✓ Identifiant + mot de passe', 'ok').montrer(ancres[0], fondu(t, tA, 0.3) * (1 - fondu(t, tA + 2.6, 0.3)));
      paquetSalle.visible = (t > tA + 0.4 && t < tA + 2.6) || (t > tB && t < tB + 2.2);
      if (paquetSalle.visible) {
        const [d, k] = t < tB ? [tA + 0.4, 0] : [tB, 1];
        trajetSalle(easeInOut(prog(t, d, d + 2.2)), k, paquetSalle.position);
      }
      etiquette('espA', '📁 Mon espace personnel', 'local').montrer(ancres[0], fondu(t, tA + 2.6, 0.3));
      etiquette('espB', '📁 Mon espace personnel', 'local').montrer(ancres[1], fondu(t, tB + 2.2, 0.3));
      etiquette('bureau', 'Bureau de la responsable informatique', '').montrer(aBureau, fondu(t, P(1), 0.4));
      etiquette('srvC', 'Serveur du collège', 'local').montrer(srvCollege.userData.ancre, fondu(t, P(1) + 0.6, 0.4), [0, -2.6, 1.2]);
      etiquette('salle', 'Salle De Vinci', '').montrer(ancres[2], fondu(t, P(1) + 1.2, 0.4) * (1 - fondu(t, P(2), 0.4)), [0, 0.9, 0]);
      camera(cam, t, [
        { t: 0, p: [-5.6, 72.5, 14.5], v: [-5.2, 60, -1.2], fov: 44 },
        { t: F(1) + 0.4, p: [-5.6, 72.5, 14.5], v: [-5.2, 60, -1.2], fov: 44 },
        { t: P(2) + 1.6, p: [-2.4, 68.5, 11], v: [-1.6, 60.3, -0.6], fov: 44 },
      ]);
    },
  },
  { // 3.8 Question
    id: '3.8', min: 8,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Au collège, pourquoi retrouves-tu ton dossier sur n\'importe quel ordinateur de la salle ?', style: 'question' }],
    maj(t) {
      D.ambiance(0); groupeSalle.visible = true; salle.maj(t); srvCollege.clignoter(t);
      eleve.position.set(POSTE_B.x, 0, POSTE_B.z + 0.75); eleve.rotation.y = Math.PI; eleve.animer(t);
      ancres.forEach((o, k) => etiquette(`q${k}`, '📁 ?', 'local').montrer(o, fondu(t, 0.6 + k * 0.35, 0.3)));
      camera(cam, t, [{ t: 0, p: [0.6, 68.5, 11.5], v: [-0.4, 59.6, -0.6], fov: 42 }, { t: 10, p: [0.2, 68.2, 11.0], v: [-0.4, 59.6, -0.6], fov: 42 }]);
    },
  },
];

const vigLeg = ctx.vignetteLegende; vigLeg.textContent = '';
ctx.definir(plans, null);
void lerp; void easeOut;
