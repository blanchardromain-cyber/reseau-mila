// Chapitre 6 : se protéger. Passerelle (barrière physique, point de passage unique), pare-feu (analyse le trafic
// selon des règles), antivirus (détecte, neutralise, supprime). Trois menaces : pirate à distance, clé USB, intrus.
// Code couleur : les protections sont rouges (sécurité) ; les menaces sont violettes, à cornes.
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, clamp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import { C, mat, lum, colis, poser, boite, halo, personnage, modem, routeur } from './modeles.js';
import { decor, marcher } from './decor.js';
import { reseauCafe, accesInternet } from './reseaucafe.js';
import { vignetteBaie } from './college.js';

const ctx = lancerChapitre({ numero: 6, titre: 'Se protéger', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const R = reseauCafe(caf);
const A = accesInternet(R);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const pv = new THREE.Vector3();

// ---------- menaces (violet, cornes) ----------
function menace(s = 0.3) {
  const g = new THREE.Group();
  poser(boite(s * 1.2, s, s * 1.2, mat('#5b2a86', { r: 0.4, e: '#5b2a86', ei: 0.5 }), s * 0.18), 0, 0, 0, g);
  for (const k of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(s * 0.14, s * 0.45, 10), mat('#f1e9ff', { r: 0.5 }));
    c.position.set(k * s * 0.35, s * 0.65, 0); c.rotation.z = -k * 0.35; g.add(c);
    const o = new THREE.Mesh(new THREE.SphereGeometry(s * 0.09, 10, 8), lum('#ff3b4e', 2.4)); o.position.set(k * s * 0.22, s * 0.12, s * 0.61); g.add(o);
  }
  const h = halo('#8a3fd1', s * 3); h.material.opacity = 0.55; g.add(h);
  return g;
}
const rodeurs = [0, 1, 2, 3, 4].map(() => { const m = menace(0.45); scene.add(m); return m; });

// ---------- passerelle : clôture rouge autour du réseau, une seule porte (là où arrive la ligne) ----------
const cloture = new THREE.Group(); caf.groupe.add(cloture);
const mCloture = new THREE.MeshStandardMaterial({ color: C.secu, emissive: C.secu, emissiveIntensity: 0.6, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
const HC = 3.8, XG = 3.3, LG = 1.3, ZB = -4.45;
const pan = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, HC), mCloture); m.position.set(x, HC / 2, z); m.rotation.y = ry; cloture.add(m); };
pan(12.9, 0, 4.45, 0); pan(8.9, -6.45, 0, Math.PI / 2); pan(8.9, 6.45, 0, Math.PI / 2);
pan(XG - LG / 2 + 6.45, (-6.45 + XG - LG / 2) / 2, ZB, 0); pan(6.45 - XG - LG / 2, (XG + LG / 2 + 6.45) / 2, ZB, 0);
const porte = new THREE.Group(); poser(porte, XG, 0, ZB, caf.groupe);
const mPorte = mat(C.secu, { r: 0.4, e: C.secu, ei: 0.5 });
poser(boite(0.14, HC, 0.14, mPorte), -LG / 2, HC / 2, 0, porte); poser(boite(0.14, HC, 0.14, mPorte), LG / 2, HC / 2, 0, porte);
poser(boite(LG + 0.14, 0.14, 0.14, mPorte), 0, HC, 0, porte);
const ecranFeu = new THREE.Mesh(new THREE.PlaneGeometry(LG - 0.1, HC - 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.secu).multiplyScalar(1.5), transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
ecranFeu.position.y = HC / 2; porte.add(ecranFeu);
const balayage = new THREE.Mesh(new THREE.PlaneGeometry(LG - 0.1, 0.06), lum('#ffd0d2', 2.2)); porte.add(balayage);
const aPorte = new THREE.Object3D(); aPorte.position.set(0, HC + 0.3, 0); porte.add(aPorte);
const passerelle = poser(boite(0.4, 0.22, 0.2, mat(C.secu, { r: 0.4, e: C.secu, ei: 0.4 }), 0.03), XG, 2.7, -3.82, caf.groupe);

// Position de la porte sur la ligne (fraction de cML, mesurée depuis le modem).
let uPorte = 0;
{ let best = 1e9; for (let i = 0; i <= 400; i++) { const u = i / 400; A.cML.courbe.getPoint(u, pv); const d = Math.abs(pv.z - ZB); if (d < best) { best = d; uPorte = u; } } }
// Chemin entrant : poteau lointain → poteau → porte (u ∈ [0, 1]) ; puis porte → modem.
function entrant(u, cible) { // u ∈ [0, 2] : 0..1 fil blanc, 1..2 ligne jusqu'à la porte
  if (u <= 1) return A.cOp.courbe.getPoint(u, cible);
  return A.cML.courbe.getPoint(lerp(1, uPorte, u - 1), cible);
}
const pirate = menace(0.32); caf.groupe.add(pirate);
const bons = [0, 1].map(() => { const c = colis(0.2); caf.groupe.add(c); return c; });

// ---------- clé USB et disque en coupe (antivirus) ----------
const hugo = personnage({ haut: '#4fa36b', bas: '#2f3e5c', cheveux: '#2a1a10', tablier: '#fff7e8' }); caf.groupe.add(hugo);
const cle = poser(boite(0.07, 0.03, 0.14, mat('#e5484d', { r: 0.4 })), -4.25, 0.81, -3.15, caf.groupe);
const disque = new THREE.Group(); poser(disque, -4.6, 2.05, -2.7, caf.groupe);
const plateauDisque = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 64), mat('#c9d1da', { r: 0.2, m: 0.8 }));
plateauDisque.rotation.x = Math.PI / 2; disque.add(plateauDisque);
const axe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 20), mat('#6b7480', { m: 0.6 })); axe.rotation.x = Math.PI / 2; axe.position.z = 0.02; disque.add(axe);
const tache = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48, 0, Math.PI * 2), new THREE.MeshBasicMaterial({ color: '#7a2fbf', transparent: true, opacity: 0.85 })); tache.position.z = 0.025; disque.add(tache);
const anneauAV = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.025, 8, 64), lum(C.secu, 2)); disque.add(anneauAV);
const bras = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.02), lum(C.secu, 2)); bras.geometry.translate(0.3, 0, 0); bras.position.z = 0.04; disque.add(bras);
const virus = menace(0.16); virus.position.set(0.25, 0.1, 0.1); disque.add(virus);
const aDisque = new THREE.Object3D(); aDisque.position.set(0, 0.75, 0); disque.add(aDisque);

// ---------- l'intrus ----------
const intrus = personnage({ haut: '#2b2b33', bas: '#1c1c22', cheveux: '#111111' }); caf.groupe.add(intrus);
poser(new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), mat('#2b2b33', { r: 0.8 })), 0, 1.44, -0.02, intrus);
const portable = poser(boite(0.36, 0.025, 0.25, mat('#9aa3ad', { r: 0.4 })), 0, 1.02, 0.32, intrus); portable.rotation.x = -0.4;
const fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(2.8, 1.0, -2.95), V(2.75, 0.4, -3.2), V(2.62, 0.9, -3.42), V(2.62, 1.06, -3.47)]), 30, 0.02, 6), lum(C.secu, 1.6)); caf.groupe.add(fil);
const alarme = halo(C.secu, 3); caf.groupe.add(alarme);

// ---------- vignette : collège ----------
const baie = vignetteBaie({ modem, routeur, protection: true });

function base() {
  D.reinitialiser();
  R.sw.visible = R.etagere.visible = false; R.srv.visible = false;
  Object.values(R.cables).forEach((c) => c.regler({ p: 0 })); R.paquets.forEach((p) => p.visible = false);
  A.montrer(false);
  rodeurs.forEach((m) => m.visible = false);
  cloture.visible = porte.visible = passerelle.visible = false;
  pirate.visible = false; bons.forEach((b) => b.visible = false);
  hugo.visible = false; cle.visible = false; disque.visible = false;
  intrus.visible = false; fil.visible = false; alarme.visible = false;
  ecranFeu.material.color.set(C.secu).multiplyScalar(1.5);
}
function cafe(t, ouvert = 1) { D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(ouvert); R.etat(t); A.montrer(true); }
function protections(t, { clot = 1, feu = 1 } = {}) {
  cloture.visible = clot > 0.01; mCloture.opacity = 0.16 * clot;
  porte.visible = passerelle.visible = true;
  ecranFeu.visible = balayage.visible = feu > 0.01;
  ecranFeu.material.opacity = 0.18 + 0.1 * Math.sin(t * 5);
  balayage.position.y = 0.1 + ((t * 0.9) % 1) * (HC - 0.2);
}
const CAM_PORTE = { p: [9.5, 6.4, -13.5], v: [2.8, 2.2, -5.2], fov: 42 };
const CAM_HAUT = { p: [9, 14, 12], v: [0.5, 0.8, -1.5], fov: 44 };

const plans = [
  { // 6.0 Titre
    id: '6.0', min: 6, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 6 · Se protéger', style: 'soustitre' }],
    maj(t) { cafe(t, 0); laMila.animer(t); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 6.1 Les menaces rôdent
    id: '6.1', min: 8,
    textes: (P) => [{ t: P(0) + 0.5, txt: 'Ouvert sur Internet…', ligne: 1 }, { t: P(1), txt: '…le réseau doit être protégé.', ligne: 2 }],
    maj(t) {
      cafe(t); laMila.animer(t);
      D.nuit(0.45 * fondu(t, 0.3, 1.5));
      rodeurs.forEach((m, k) => {
        m.visible = true;
        const a = t * 0.35 + k * Math.PI * 2 / 5, r = 8.5 + Math.sin(t + k) * 0.8;
        m.position.set(Math.cos(a) * r, 2.2 + Math.sin(t * 2 + k) * 0.4, Math.sin(a) * r - 1); m.rotation.y = -a;
      });
      etiquette('menace', 'Menaces', 'refus').montrer(rodeurs[0], fondu(t, 1.5, 0.4), [0, 0.8, 0]);
      camera(cam, t, [{ t: 0, ...CAM_HAUT }, { t: 10, p: [8, 13, 11], v: [0.5, 0.8, -1.5], fov: 44 }]);
    },
  },
  { // 6.2 La passerelle
    id: '6.2', min: 9,
    textes: (P) => [{ t: P(0), txt: 'Passerelle (protection physique)', ligne: 1 }, { t: P(1), txt: 'Le point de passage unique entre l\'intérieur et l\'extérieur.', ligne: 2 }],
    maj(t, P) {
      cafe(t); laMila.animer(t);
      protections(t, { clot: easeOut(prog(t, P(0) + 0.3, P(0) + 1.6)), feu: 0 });
      porte.scale.setScalar(Math.max(0.001, pop(t, P(0) + 0.6, 0.6)));
      bons.forEach((b, k) => { b.visible = t > P(1); const u = ((t / 3 + k / 2) % 1); A.cML.courbe.getPoint(k ? u : 1 - u, b.position); });
      etiquette('porte', 'Passerelle : seule porte du réseau', 'refus').montrer(aPorte, fondu(t, P(1), 0.4));
      camera(cam, t, [{ t: 0, ...CAM_HAUT }, { t: P(1), ...CAM_PORTE }]);
    },
  },
  { // 6.3 Le pirate et le pare-feu
    id: '6.3', min: 14,
    textes: (P) => [
      { t: 0.3, txt: 'Menace 1 : le pirate à distance', style: 'etiquettePlan' },
      { t: P(1), txt: 'Pare-feu (logiciel) : il analyse le trafic', ligne: 1 },
      { t: P(1) + 1.3, txt: 'et bloque les intrusions selon des règles.', ligne: 2 },
    ],
    maj(t, P, F) {
      cafe(t); laMila.animer(t); protections(t);
      // Un colis normal passe, le pirate est rejeté.
      const b0 = 0.6, b1 = b0 + 3.2;
      bons[0].visible = t > b0 && t < b1 + 1.6;
      if (bons[0].visible) { const u = prog(t, b0, b1) * 2 + prog(t, b1, b1 + 1.6) * 0; if (t < b1) entrant(u, bons[0].position); else A.cML.courbe.getPoint(lerp(uPorte, 0, prog(t, b1, b1 + 1.6)), bons[0].position); }
      const p0 = P(0) + 1.5, p1 = p0 + 3.4, retour = Math.max(P(1) + 1.6, p1 + 0.8);
      pirate.visible = t > p0;
      if (t < p1) entrant(prog(t, p0, p1) * 2, pirate.position);
      else if (t < retour) entrant(2, pirate.position);
      else entrant(2 - prog(t, retour, retour + 2.5) * 1.6, pirate.position);
      pirate.rotation.y = t * 2;
      const verif = t > p1 && t < retour;
      const ok = t > b1 - 0.4 && t < b1 + 0.6;
      if (verif) ecranFeu.material.color.set(C.secu).multiplyScalar(2.4 + Math.sin(t * 20));
      if (ok) ecranFeu.material.color.set('#2fae5a').multiplyScalar(1.6);
      etiquette('ok', '✓ Page demandée : autorisée', 'ok').montrer(aPorte, ok ? 1 : 0, [0, 0.5, 0]);
      etiquette('bloque', '✗ Intrusion bloquée', 'refus').montrer(aPorte, verif || t > retour ? fondu(t, p1, 0.2) : 0, [0, 0.5, 0]);
      etiquette('port', 'Port de connexion ouvert', '').montrer(pirate, fondu(t, p0 + 1, 0.4) * (1 - fondu(t, p1, 0.4)), [0, 0.6, 0]);
      panneau('regles', '<b>Règles du pare-feu</b><span>✓ Pages web demandées</span><span>✓ Commandes en ligne</span><span>✗ Connexion entrante par un port ouvert</span>', 'regles').montrer(fondu(t, P(1) + 0.6, 0.4), 1560, 150);
      camera(cam, t, [{ t: 0, ...CAM_PORTE }, { t: F(1) + 2, p: [8.8, 6.2, -12.8], v: [2.8, 2.2, -5.2], fov: 42 }]);
    },
  },
  { // 6.4 La clé USB et l'antivirus
    id: '6.4', min: 16,
    textes: (P) => [
      { t: 0.3, txt: 'Menace 2 : la clé USB infectée', style: 'etiquettePlan' },
      { t: P(1) + 0.4, txt: 'Le pare-feu ne voit pas la clé USB.', ligne: 1 },
      { t: P(3), txt: 'L\'antivirus détecte, neutralise et supprime.', ligne: 2 },
    ],
    maj(t, P, F) {
      cafe(t); protections(t, { clot: 0.5 });
      hugo.visible = true; hugo.position.set(-4.6, 0, -2.45); hugo.rotation.y = Math.PI; hugo.animer(t);
      cle.visible = t > P(0) + 1; cle.position.y = 0.81 + 0.3 * (1 - easeOut(prog(t, P(0) + 1, P(0) + 1.8)));
      disque.visible = t > P(2) - 0.6;
      disque.scale.setScalar(Math.max(0.001, easeOut(prog(t, P(2) - 0.6, P(2)))));
      plateauDisque.rotation.y = t * 3;
      // La tache s'étend, puis l'antivirus la fait disparaître.
      const ext = easeOut(prog(t, P(2), P(2) + 2.2)), sup = easeInOut(prog(t, P(3) + 1.8, F(3) + 0.4));
      tache.scale.setScalar(Math.max(0.001, ext * (1 - sup)));
      tache.material.opacity = 0.85 * (1 - sup);
      virus.visible = sup < 0.98; virus.scale.setScalar(1 - sup); virus.rotation.z = Math.sin(t * 8) * 0.3;
      const av = t > P(3);
      anneauAV.visible = bras.visible = av; bras.rotation.z = -t * 5;
      etiquette('feuRien', 'Pare-feu : rien vu passer', '').montrer(aPorte, fondu(t, P(1), 0.4) * (1 - fondu(t, P(2) + 1, 0.4)), [0, 0.4, 0]);
      etiquette('cle', 'Clé USB', 'refus').montrer(cle, fondu(t, P(0) + 1.2, 0.3) * (1 - fondu(t, P(2), 0.3)), [0, 0.25, 0]);
      const etapes = ['🔍 Détecte', '🛡 Neutralise', '🗑 Supprime'];
      const k = av ? Math.min(2, Math.floor((t - P(3)) / 1.2)) : -1;
      etiquette('av', `<b>Antivirus</b> ${etapes.map((e, i) => `<span class="${i <= k ? 'on' : ''}">${e}</span>`).join(' ')}`, 'antivirus').montrer(aDisque, av ? 1 : 0, [0, 0.1, 0], `<b>Antivirus</b> ${etapes.map((e, i) => `<span class="${i <= k ? 'on' : ''}">${e}</span>`).join(' ')}`);
      etiquette('mal', 'Logiciel malveillant', 'refus').montrer(virus, fondu(t, P(2) + 0.4, 0.3) * (av ? 0 : 1), [0, 0.3, 0]);
      camera(cam, t, [{ t: 0, p: [-1.8, 3.4, 1.4], v: [-4.5, 1.2, -3.0], fov: 42 }, { t: P(2) - 0.6, p: [-2.6, 3.0, 0.6], v: [-4.6, 1.7, -2.8], fov: 40 }]);
    },
  },
  { // 6.5 L'intrus branché sur le commutateur
    id: '6.5', min: 13,
    textes: (P) => [
      { t: 0.3, txt: 'Menace 3 : l\'intrus sur place', style: 'etiquettePlan' },
      { t: P(0) + 3, txt: 'Branché directement sur le commutateur…', ligne: 1 },
      { t: P(1), txt: '…il contourne la passerelle.', ligne: 2 },
    ],
    maj(t, P) {
      cafe(t); laMila.animer(t); protections(t, { clot: 0.6 });
      intrus.visible = true;
      // Il passe à droite du comptoir puis devant le bout de la cloison de la cuisine (sans la traverser).
      marcher(intrus, t, 0.3, P(0) + 3, [[0.2, 6], [0.2, 3.2], [3.85, 1.6], [3.85, -1.15], [2.95, -1.3], [2.85, -2.75]]);
      if (t > P(0) + 3) intrus.rotation.y = Math.PI; intrus.animer(t);
      fil.visible = t > P(0) + 3.4;
      const al = t > P(1);
      alarme.visible = al; alarme.position.set(2.4, 3.0, -2); alarme.material.opacity = al ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
      etiquette('intrus', 'Inconnu', 'refus').montrer(intrus.userData.ancre, fondu(t, 0.6, 0.4) * (1 - fondu(t, P(0) + 3.2, 0.4)));
      etiquette('contourne', 'Passerelle contournée', 'refus').montrer(aPorte, fondu(t, P(1), 0.4));
      etiquette('swI', 'Branché sur le commutateur', 'refus').montrer(R.sw.userData.ancre, fondu(t, P(0) + 3.6, 0.4), [0, 0.3, 0]);
      camera(cam, t, [{ t: 0, ...CAM_HAUT }, { t: P(0) + 3, p: [-0.6, 6.8, 3.2], v: [2.6, 1.2, -3.0], fov: 42 }, { t: P(1) + 1, p: [-1.4, 8.6, 3.6], v: [2.6, 1.5, -3.4], fov: 44 }]);
    },
  },
  { // 6.6 Mises à jour
    id: '6.6', min: 7,
    textes: (P) => [{ t: P(0) + 0.4, txt: 'Pare-feu et antivirus', ligne: 1 }, { t: P(0) + 1.4, txt: 'doivent être mis à jour.', ligne: 2 }],
    maj(t, P) {
      cafe(t); laMila.animer(t); protections(t);
      const barre = (nom, u) => `<b>${nom}</b><span class="barre"><i style="width:${Math.round(u * 100)}%"></i></span><em>${u >= 1 ? '✓ À jour' : 'Mise à jour…'}</em>`;
      panneau('majF', barre('Pare-feu : nouvelles règles', easeInOut(prog(t, P(0) + 0.6, P(0) + 3))), 'majcarte').montrer(fondu(t, P(0) + 0.3, 0.3), 640, 300);
      panneau('majA', barre('Antivirus : nouvelles signatures', easeInOut(prog(t, P(0) + 1.4, P(0) + 3.8))), 'majcarte').montrer(fondu(t, P(0) + 1, 0.3), 1280, 300);
      camera(cam, t, [{ t: 0, ...CAM_HAUT }, { t: 8, p: [8.5, 13.5, 11.5], v: [0.5, 0.8, -1.5], fov: 44 }]);
    },
  },
  { // 6.7 Au collège
    id: '6.7', min: 9,
    textes: (P) => [{ t: P(0) + 0.4, txt: 'Au collège : passerelle et pare-feu à l\'entrée,', ligne: 1 }, { t: P(0) + 2.6, txt: 'un antivirus sur chaque poste.', ligne: 2 }],
    maj(t) {
      cafe(t); laMila.animer(t); protections(t);
      camera(cam, t, [{ t: 0, ...CAM_HAUT }, { t: 10, p: [8.5, 13.5, 11.5], v: [0.5, 0.8, -1.5], fov: 44 }]);
    },
  },
  { // 6.8 Question
    id: '6.8', min: 9,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'Un élève branche une clé USB inconnue. Quelle protection agit ? Pourquoi pas le pare-feu ?', style: 'question' }],
    maj(t) {
      cafe(t); protections(t, { clot: 0.5 });
      hugo.visible = true; hugo.position.set(-4.6, 0, -2.45); hugo.rotation.y = Math.PI; hugo.animer(t);
      cle.visible = true; cle.position.y = 0.81;
      etiquette('cleQ', 'Clé USB ?', 'refus').montrer(cle, fondu(t, 0.8, 0.4), [0, 0.25, 0]);
      camera(cam, t, [{ t: 0, p: [-1.4, 3.0, 1.6], v: [-4.5, 1.5, -3.0], fov: 42 }, { t: 10, p: [-1.7, 2.9, 1.3], v: [-4.5, 1.5, -3.0], fov: 42 }]);
    },
  },
];

ctx.vignetteLegende.textContent = 'Collège : passerelle et pare-feu (en rouge) en tête de baie';
ctx.definir(plans, {
  scene: baie.scene, cam: baie.cam, maj: baie.maj,
  alpha(i, t) { const p = plans[i]; return p.id === '6.7' ? fondu(t, p.P(0), 0.6) : 0; },
});
void clamp;
