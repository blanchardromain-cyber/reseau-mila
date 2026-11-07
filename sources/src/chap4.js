// Chapitre 4 : pannes au café et au collège (écran partagé). Pannes A à D de la fiche, chacune en deux plans :
// le symptôme (« Que se passe-t-il ? », pause pour la classe), puis l'explication.
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, clamp, easeInOut, easeOut, fondu, W, H } from './moteur.js';
import { C, colis, halo, poser, borneWifi, tablette, materiauOnde, personnage, mat } from './modeles.js';
import { decor, marcher } from './decor.js';
import { reseauCafe } from './reseaucafe.js';
import { vignetteCollege } from './college.js';

const ctx = lancerChapitre({ numero: 4, titre: 'Pannes !', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const { srv, sw, cables } = R;
const pv = new THREE.Vector3(), pw = new THREE.Vector3();
const GRIS = new THREE.Color(C.eteint);

// ---------- café : Wi-Fi ----------
const borne = poser(borneWifi(), 0.5, 3.0, 2.0, caf.groupe); borne.scale.setScalar(1.3);
const tab = tablette(); laMila.add(tab); tab.position.set(0, 1.02, 0.33); tab.rotation.x = -0.95;
const ondes = [0, 1, 2].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), materiauOnde()); scene.add(o); return o; });
const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 1, 1, 32, 1, true), materiauOnde()); cone.geometry.translate(0, -0.5, 0); scene.add(cone);
const HAUT = new THREE.Vector3(0, 1, 0);
const portee = (d) => clamp(1 - (d - 5) / 10);
const barres = (q) => (q <= 0 ? 0 : Math.max(1, Math.ceil(q * 4)));
const htmlBarres = (n, txt = '') => `<span class="barres">${[1, 2, 3, 4].map((k) => `<i class="${k <= n ? 'on' : ''}" style="height:${8 + k * 8}px"></i>`).join('')}</span>${txt}`;
function wifiCafe(t) {
  borne.getWorldPosition(pv); tab.getWorldPosition(pw);
  ondes.forEach((o, k) => { o.visible = true; const u = ((t / 2.4 + k / 3) % 1); o.position.copy(pv); o.scale.setScalar(0.3 + u * 9.5); o.material.uniforms.opacite.value = (1 - u) * 0.4; });
  const d = pv.distanceTo(pw), q = portee(d);
  cone.visible = q > 0.01;
  if (cone.visible) {
    cone.position.copy(pv); cone.quaternion.setFromUnitVectors(HAUT, pw.clone().sub(pv).normalize().negate());
    const r = 0.12 + 0.75 * q; cone.scale.set(r, d, r); cone.material.uniforms.opacite.value = 0.25 + 0.75 * q;
  }
  tab.allumer(0.3 + 0.7 * Math.min(1, q * 2));
  return q;
}
const TRAJET_LOIN = [[0.9, 5.8], [1.2, 9.5], [1.6, 13.5], [2.0, 17.6]];
const eclair = halo(C.panne, 1.6); scene.add(eclair);
const fumee = halo('#9aa3ad', 1.4); scene.add(fumee);

// ---------- collège : salle informatique de la fiche (24 postes), cour pour les tablettes ----------
const vig = vignetteCollege({ rangs: 4, colonnes: 6 });
vig.cam.fov = 50;
const cour = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), mat('#7fbf5e', { r: 0.95 })); cour.rotation.x = -Math.PI / 2; cour.position.set(0, -0.02, 16); vig.scene.add(cour);
const borneC = poser(borneWifi(), 4.6, 2.3, -3.9, vig.scene); borneC.scale.setScalar(1.4); borneC.rotation.x = Math.PI / 2;
const ondesC = [0, 1, 2].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), materiauOnde()); o.position.copy(borneC.position); vig.scene.add(o); return o; });
const eleves = [[-1.2, 4.2, '#e86a8a'], [0.6, 4.6, '#3c8dbc'], [2.2, 4.1, '#7a5cc8']].map(([x, z, c]) => {
  const p = personnage({ haut: c, bas: '#3a3a4a', cheveux: '#3b2416' }); p.position.set(x, 0, z); vig.scene.add(p);
  const tb = tablette(); p.add(tb); tb.position.set(0, 1.02, 0.33); tb.rotation.x = -0.95; p.userData.tab = tb; p.userData.depart = [x, z]; return p;
});
let etatCollege = {};
const camCollege = { normal: { p: [0, 10.4, 9.6], v: [0, 0.2, -0.7] }, cour: { p: [14, 11, 18], v: [0, 0.4, 11] } };
let vueCollege = camCollege.normal;

// ---------- remise à zéro ----------
function base() {
  D.reinitialiser(); cam.clearViewOffset();
  D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(1);
  tab.visible = false; ondes.forEach((o) => o.visible = false); cone.visible = false; eclair.visible = false; fumee.visible = false;
  etatCollege = {}; vueCollege = camCollege.normal;
  eleves.forEach((e) => { e.visible = false; e.position.set(e.userData.depart[0], 0, e.userData.depart[1]); e.rotation.y = 0; });
  ondesC.forEach((o) => o.visible = false);
}
function partage(k = 1) { // café à gauche (décalage de la vue), collège à droite
  cam.setViewOffset(W, H, W / 4, 0, W, H);
  return k;
}
const CAM_G = { p: [-1.8, 15.2, 13.2], v: [-2.0, 0.2, -1.2], fov: 46 };
function reseau(t, opts = {}) { R.etat(t, opts); }
// Câble de l'imprimante de cuisine qui se débranche (portion côté appareil retirée) ; appareil éteint.
function panneA(t, t0) {
  const u = easeOut(prog(t, t0, t0 + 0.6));
  cables.imprimanteCuisine.regler({ p: 1 - 0.14 * u });
  if (u > 0) cables.imprimanteCuisine.teinte(new THREE.Color(C.local).lerp(GRIS, u), 0.2);
  caf.appareils.imprimanteCuisine.allumer(1 - 0.9 * u);
  eclair.visible = t > t0 && t < t0 + 1.6;
  if (eclair.visible) { caf.appareils.imprimanteCuisine.getWorldPosition(eclair.position); eclair.position.y += 0.6; eclair.material.opacity = 0.6 + 0.4 * Math.sin(t * 25); }
  return u;
}
function panneB(t, t0) {
  const u = easeOut(prog(t, t0, t0 + 0.5));
  if (u > 0) {
    sw.userData.ecrans.forEach((e) => { e.m.emissiveIntensity = 0.05; });
    Object.values(cables).forEach((c) => c.teinte(new THREE.Color(C.local).lerp(GRIS, u), 0.15));
    R.paquets.forEach((p) => { p.visible = false; });
  }
  eclair.visible = t > t0 && t < t0 + 1.6;
  if (eclair.visible) { sw.getWorldPosition(eclair.position); eclair.position.y += 0.4; eclair.material.opacity = 0.6 + 0.4 * Math.sin(t * 25); }
  return u;
}
function panneD(t, t0) {
  const u = easeOut(prog(t, t0, t0 + 0.6));
  if (u > 0) srv.clignoter(t, 0);
  fumee.visible = u > 0;
  if (fumee.visible) { srv.getWorldPosition(fumee.position); fumee.position.y += 2.3 + ((t - t0) * 0.4) % 0.8; fumee.material.opacity = 0.5; }
  return u;
}
// Élèves du collège qui partent dans la cour avec leurs tablettes.
function elevesCour(t, t0, t1) {
  vueCollege = camCollege.cour;
  borneC.getWorldPosition(pv);
  ondesC.forEach((o, k) => { o.visible = true; const u = ((t / 2.4 + k / 3) % 1); o.scale.setScalar(0.3 + u * 10); o.material.uniforms.opacite.value = (1 - u) * 0.5; });
  let qmin = 1;
  eleves.forEach((e, k) => {
    e.visible = true;
    const [x, z] = e.userData.depart;
    marcher(e, t, t0 + k * 0.3, t1, [[x, z], [x + (k - 1) * 1.5, z + 6], [x + (k - 1) * 3, z + 13]]); e.animer(t);
    e.userData.tab.getWorldPosition(pw);
    const q = clamp(1 - (pv.distanceTo(pw) - 8) / 12); qmin = Math.min(qmin, q);
    e.userData.tab.allumer(0.3 + 0.7 * q);
  });
  return qmin;
}

const ETIQ_PANNE = (txt) => [{ t: 0.3, txt, style: 'etiquettePlan' }];
const plans = [
  { // 4.0 Titre puis écran partagé
    id: '4.0', min: 8, fondu: false,
    textes: (P) => [
      { t: -1, txt: 'Le réseau de Mila', style: 'titre', fin: P(1) },
      { t: -1, txt: 'Chapitre 4 · Pannes !', style: 'soustitre', fin: P(1) },
    ],
    maj(t, P) {
      reseau(t); laMila.animer(t);
      if (t < P(1)) { D.ouvrirCafe(0); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); }
      else { partage(); camera(cam, 0, [CAM_G]); }
    },
  },
  { // 4.A1
    id: '4.A1',
    textes: (P) => [...ETIQ_PANNE('Panne A : un câble débranché'), { t: P(2), txt: 'Que se passe-t-il ?', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      const u = panneA(t, P(0) + 1.6);
      etatCollege = { eteint: 0, coupe: easeOut(prog(t, P(1) + 1.2, P(1) + 1.8)) };
      etiquette('cuisine', 'Imprimante de cuisine', 'panne').montrer(caf.appareils.imprimanteCuisine.userData.ancre, u, [0, 0.2, 0]);
      panneau('rangA', 'Rangée A : un poste débranché', 'etat ko').montrer(fondu(t, P(1) + 1.4, 0.4), 1440, 250);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.A2
    id: '4.A2',
    textes: (P) => [{ t: P(0), txt: 'Seul cet appareil ne fonctionne plus.', ligne: 1 }, { t: P(2), txt: 'En étoile, chacun a son propre câble.', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      panneA(t, -10);
      etatCollege = { eteint: 0, coupe: 1 };
      etiquette('cuisine', 'Imprimante de cuisine isolée', 'panne').montrer(caf.appareils.imprimanteCuisine.userData.ancre, 1, [0, 0.2, 0]);
      etiquette('autres', '✓ Les autres appareils fonctionnent', 'ok').montrer(caf.appareils.caisse.userData.ancre, fondu(t, P(0) + 0.6, 0.4), [0, 0.3, 0]);
      panneau('compte', '✓ 23 postes sur 24 fonctionnent', 'etat ok').montrer(fondu(t, P(1), 0.4), 1440, 250);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.B1
    id: '4.B1',
    textes: (P) => [...ETIQ_PANNE('Panne B : le commutateur débranché'), { t: P(1), txt: 'Que se passe-t-il ?', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      const u = panneB(t, P(0) + 1.8);
      etatCollege = { swOff: u > 0.5 };
      etiquette('sw', 'Commutateur débranché', 'panne').montrer(sw.userData.ancre, u, [0, 0.1, 0]);
      panneau('swC', 'Commutateur de la salle débranché', 'etat ko').montrer(u, 1440, 250);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.B2
    id: '4.B2',
    textes: (P) => [{ t: P(0), txt: 'Tous les ordinateurs fixes perdent le réseau.', ligne: 1 }, { t: P(1), txt: 'Le commutateur est le point central.', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      panneB(t, -10);
      etatCollege = { swOff: true };
      etiquette('sw', 'Commutateur débranché', 'panne').montrer(sw.userData.ancre, 1, [0, 0.1, 0]);
      for (const k of ['caisse', 'ordinateur']) etiquette(`ko${k}`, '✗ Plus de réseau', 'panne').montrer(caf.appareils[k].userData.ancre, fondu(t, P(0) + 0.5, 0.4), [0, 0.2, 0]);
      panneau('compte', '✗ 0 poste fixe connecté sur 24', 'etat ko').montrer(fondu(t, P(0) + 0.5, 0.4), 1440, 250);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.C1
    id: '4.C1', min: 10,
    textes: (P) => [...ETIQ_PANNE('Panne C : les tablettes décrochent'), { t: P(2), txt: 'Pourquoi ?', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t);
      laMila.visible = true; tab.visible = true;
      marcher(laMila, t, 0.3, P(1) + 1.2, TRAJET_LOIN); laMila.animer(t);
      const q = wifiCafe(t);
      etiquette('signal', '', 'signal').montrer(tab.userData.ancre, 1, [0, 0.15, 0], htmlBarres(barres(q), q <= 0 ? ' Connexion perdue' : ''));
      const qc = elevesCour(t, 0.3, P(1) + 1.2);
      panneau('cour', htmlBarres(barres(qc), qc <= 0 ? ' Tablettes déconnectées' : ' Les tablettes rament…'), `etat ${qc <= 0 ? 'ko' : ''}`).montrer(1, 1440, 250);
      const m = laMila.position;
      camera(cam, 0, [{ t: 0, p: [m.x - 4.5, 5.2, m.z + 6], v: [m.x + 0.5, 1.3, m.z - 4], fov: 46 }]);
    },
  },
  { // 4.C2
    id: '4.C2', min: 8,
    textes: (P) => [{ t: P(0), txt: 'La portée de la borne Wi-Fi est limitée,', ligne: 1 }, { t: P(1), txt: 'et les obstacles atténuent le signal.', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t);
      laMila.visible = true; tab.visible = true;
      marcher(laMila, 1, 0, 1, TRAJET_LOIN); laMila.animer(t);
      const q = wifiCafe(t);
      etiquette('signal', '', 'signal').montrer(tab.userData.ancre, 1, [0, 0.15, 0], htmlBarres(barres(q), ' Connexion perdue'));
      etiquette('portee', 'Portée de la borne', 'local').montrer(borne.userData.ancre, fondu(t, P(0) + 0.5, 0.4), [0, 0.3, 0]);
      etiquette('murs', 'Obstacles : murs, arbres…', '').montrer(caf.groupe, fondu(t, P(1), 0.4), [0, 3.6, 4]);
      elevesCour(t, -20, -10);
      panneau('cour', htmlBarres(0, ' Trop loin de la borne'), 'etat ko').montrer(1, 1440, 250);
      const m = laMila.position;
      camera(cam, t, [{ t: 0, p: [m.x - 4.5, 5.2, m.z + 6], v: [m.x + 0.5, 1.3, m.z - 4], fov: 46 }, { t: 3, p: [-6, 12, 22], v: [0.5, 0.5, 6], fov: 46 }]);
    },
  },
  { // 4.D1
    id: '4.D1',
    textes: (P) => [...ETIQ_PANNE('Panne D : le serveur en panne'), { t: P(1), txt: 'Que se passe-t-il ?', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      const u = panneD(t, P(0) + 1.6);
      etiquette('srv', 'Serveur en panne', 'panne').montrer(srv.userData.ancre, u);
      panneau('srvC', 'Serveur du collège en panne', 'etat ko').montrer(u, 1440, 250);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.D2
    id: '4.D2',
    textes: (P) => [{ t: P(0), txt: 'On peut encore naviguer…', ligne: 1 }, { t: P(1), txt: 'mais plus de session ni d\'espace personnel.', ligne: 2 }],
    maj(t, P) {
      partage(); reseau(t); laMila.animer(t);
      panneD(t, -10);
      etiquette('srv', 'Serveur en panne', 'panne').montrer(srv.userData.ancre, 1);
      etiquette('nav', '🌐 Navigation ✓', 'ok').montrer(caf.appareils.ordinateur.userData.ancre, fondu(t, P(0) + 0.6, 0.4), [0, 0.15, 0]);
      etiquette('sess', '🔒 Session ✗ · 📁 Espace personnel ✗', 'panne').montrer(caf.appareils.caisse.userData.ancre, fondu(t, P(1), 0.4), [0, 0.25, 0]);
      panneau('allume', '💡 Les postes restent allumés', 'etat ok').montrer(fondu(t, P(0) + 0.3, 0.4), 1440, 250);
      panneau('navC', '🌐 Navigation ✓', 'etat ok').montrer(fondu(t, P(0) + 1.2, 0.4), 1440, 330);
      panneau('sessC', '🔒 Session ✗ · 📁 Espace personnel ✗', 'etat ko').montrer(fondu(t, P(1), 0.4), 1440, 410);
      panneau('roles', 'Le serveur : authentification + stockage, pas l\'électricité', 'etat').montrer(fondu(t, P(2), 0.4), 480, 240);
      camera(cam, 0, [CAM_G]);
    },
  },
  { // 4.9 Question
    id: '4.9', min: 9,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Dans un réseau en étoile, quelle panne est la plus grave ? Pourquoi ?', style: 'question' }],
    maj(t) {
      reseau(t); laMila.animer(t);
      const cartes = ['A · un câble débranché', 'B · le commutateur débranché', 'C · le Wi-Fi trop loin', 'D · le serveur en panne'];
      cartes.forEach((c, k) => panneau(`carte${k}`, c, 'etat').montrer(fondu(t, 1 + k * 0.4, 0.4), 330 + k * 420, 860));
      camera(cam, t, [{ t: 0, p: [0.6, 12.5, 9.5], v: [-0.6, -0.4, -1.8], fov: 44 }, { t: 10, p: [0.2, 12.2, 9.1], v: [-0.6, -0.4, -1.8], fov: 44 }]);
    },
  },
];

const PARTAGE = new Set(['4.A1', '4.A2', '4.B1', '4.B2', '4.C1', '4.C2', '4.D1', '4.D2']);
ctx.partage.querySelector('.g').textContent = 'Le café de Mila';
ctx.partage.querySelector('.d').textContent = 'Le collège · salle informatique';
ctx.definir(plans, {
  scene: vig.scene, cam: vig.cam,
  maj(t) {
    vig.maj(t, { ...etatCollege, camLibre: true });
    vig.cam.position.set(...vueCollege.p); vig.cam.lookAt(...vueCollege.v);
  },
  alpha(i, t) { const p = plans[i]; return PARTAGE.has(p.id) || (p.id === '4.0' && t >= p.P(1)) ? 1 : 0; },
  rect: () => ({ x: W / 2, y: 0, w: W / 2, h: H, cadre: false }),
  partage(i, t) { const p = plans[i]; return PARTAGE.has(p.id) || (p.id === '4.0' && t >= p.P(1)) ? 1 : 0; },
});
void lerp; void easeInOut;
