// Réseau du café (chapitres 3 et suivants) : commutateur sur l'étagère du fond, câbles le long des plinthes
// vers les six appareils, et vers le serveur posé contre le mur gauche.
import * as THREE from 'three';
import { C, appareil, cable, colis, chemin, poser, boite, mat, serveur, ligneBrisee, modem, routeur, poteau } from './modeles.js';
import { prog, easeInOut } from './moteur.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const port = (i) => V(2.4 - 0.32 + i * 0.09, 1.09, -3.49);
export const POS_SERVEUR = V(-5.45, 0, -0.9);
const TRAJETS = {
  caisse: [port(0), V(2.08, 0.6, -3.42), V(2.08, 0.05,-3.42), V(1.5, 0.05,-1.3), V(1.5, 0.05,-1.08), V(1.5, 1.0, -1.06), V(1.5, 1.16, -0.86)],
  imprimante: [port(1), V(2.17, 0.6, -3.45), V(2.17, 0.05,-3.45), V(0.35, 0.05,-1.3), V(0.35, 0.05,-1.08), V(0.35, 1.0, -1.06), V(0.35, 1.16, -0.86)],
  tpe: [port(2), V(2.26, 0.6, -3.48), V(2.26, 0.05,-3.48), V(2.75, 0.05,-1.3), V(2.75, 0.05,-1.08), V(2.75, 1.0, -1.06), V(2.75, 1.16, -0.6)],
  ordinateur: [port(3), V(2.35, 0.6, -3.5), V(2.35, 0.05,-3.75), V(-4.0, 0.05,-3.78), V(-4.45, 0.05,-3.6), V(-4.45, 0.75, -3.55), V(-4.6, 0.82, -3.45)],
  imprimanteCuisine: [port(4), V(2.44, 0.6, -3.5), V(2.6, 0.05,-3.78), V(3.5, 0.05,-3.78), V(4.3, 0.05,-3.78), V(4.3, 0.95, -3.72), V(4.55, 1.05, -3.5)],
  // Le câble de l'écran du menu longe le mur à gauche de l'étagère haute (il ne la traverse pas).
  ecranMenu: [port(5), V(2.53, 1.3, -3.6), V(1.5, 1.3, -3.86), V(1.5, 2.12, -3.88)],
  serveur: [port(6), V(2.62, 0.6, -3.52), V(2.62, 0.05,-3.84), V(-5.6, 0.05,-3.84), V(-5.76, 0.05,-3.6), V(-5.76, 0.05,-1.1), V(-5.76, 0.5, -0.95), V(-5.6, 0.9, -0.9)],
};

export function reseauCafe(caf) {
  const etagere = poser(boite(1.3, 0.06, 0.4, mat('#9c6b45', { r: 0.7 })), 2.4, 1.0, -3.72, caf.groupe);
  const sw = poser(appareil('commutateur'), 2.4, 1.03, -3.72, caf.groupe);
  const srv = serveur(['Mila', 'Hugo', 'Inès', 'Commun']); poser(srv, POS_SERVEUR.x, 0, POS_SERVEUR.z, caf.groupe); srv.rotation.y = Math.PI / 2;
  const cables = {};
  for (const [k, pts] of Object.entries(TRAJETS)) {
    const c = cable(ligneBrisee(pts), { rayon: 0.024, seg: 200 });
    caf.groupe.add(c.groupe); cables[k] = c;
  }
  const paquets = Array.from({ length: 6 }, () => { const p = colis(0.12); caf.groupe.add(p); return p; });
  // Chemin d'un colis entre deux appareils, en passant par le commutateur.
  const via = (a, b) => chemin([[cables[a].courbe, true], [cables[b].courbe, false]]);

  function etat(t, { serveurVisible = true, dessinServeur = 1, d0 = 0, fluxAmbiant = true, allume = true } = {}) {
    sw.visible = etagere.visible = true;
    srv.visible = serveurVisible;
    for (const [k, c] of Object.entries(cables)) {
      if (k === 'serveur') { c.regler({ p: serveurVisible ? (dessinServeur >= 1 ? 1 : easeInOut(prog(t, d0, d0 + 1.6))) : 0 }); }
      else c.regler({ p: 1 });
      c.normal();
    }
    sw.userData.ecrans.forEach((e, i) => { e.m.emissiveIntensity = allume ? 1 + 0.6 * Math.sin(t * 9 + i) : 0.05; });
    srv.clignoter(t, serveurVisible ? 1 : 0);
    paquets.forEach((p) => { p.visible = false; });
    if (fluxAmbiant) {
      ['caisse', 'imprimante', 'imprimanteCuisine'].forEach((k, i) => {
        const p = paquets[i]; p.visible = true;
        const u = ((t / 2.4 + i * 0.31) % 1); cables[k].courbe.getPoint(i % 2 ? u : 1 - u, p.position); p.position.y += 0.07;
      });
    }
  }
  return { sw, srv, cables, paquets, via, etat, etagere, caf };
}

// Accès à Internet (chapitres 5 et suivants) : étagère haute avec routeur et modem, ligne de l'opérateur
// qui sort par le mur du fond jusqu'au poteau. Couleurs : routeur → commutateur en bleu (réseau local),
// routeur → modem → ligne en gris (Internet).
export function accesInternet(R) {
  const { caf, cables } = R;
  const etagere = poser(boite(1.7, 0.06, 0.4, mat('#9c6b45', { r: 0.7 })), 2.75, 1.92, -3.72, caf.groupe);
  const rt = poser(routeur(), 2.25, 1.95, -3.72, caf.groupe);
  const md = poser(modem(), 3.2, 1.95, -3.72, caf.groupe);
  const pt = poser(poteau(), 3.3, 0, -8.5, caf.groupe);
  // Le réseau de l'opérateur arrive au poteau par l'autre côté (fil blanc depuis un second poteau).
  const pt2 = poser(poteau(), 3.3, 0, -24, caf.groupe);
  const cOp = cable(new THREE.QuadraticBezierCurve3(V(3.3, 4.45, -24), V(3.3, 3.7, -16.2), V(3.3, 4.45, -8.6)), { couleur: '#f4f6f9', rayon: 0.03, seg: 80 });
  cOp.materiau.emissiveIntensity = 0.15;
  // Câble routeur → commutateur : il descend devant l'étagère (il ne la traverse pas).
  const cRS = cable(ligneBrisee([port(7), V(2.71, 1.09, -3.38), V(2.71, 2.0, -3.38), V(2.56, 2.0, -3.5)]), { rayon: 0.024, seg: 60 });
  const cRM = cable(ligneBrisee([V(2.56, 2.0, -3.6), V(2.94, 2.0, -3.6)]), { couleur: C.internet, rayon: 0.024, seg: 20 });
  const cML = cable(ligneBrisee([V(3.3, 2.05, -3.9), V(3.3, 2.7, -3.95), V(3.3, 2.7, -4.3), V(3.3, 4.45, -8.4)]), { couleur: C.internet, rayon: 0.03, seg: 120 });
  [cRS, cRM, cML, cOp].forEach((c) => { caf.groupe.add(c.groupe); c.regler({ p: 1 }); });
  // Chemin d'une page web : ordinateur → commutateur → routeur → modem → ligne.
  const web = chemin([[cables.ordinateur.courbe, true], [cRS.courbe, false], [cRM.courbe, false], [cML.courbe, false]]);
  const local = chemin([[cables.ordinateur.courbe, true], [cables.caisse.courbe, false]]);
  function montrer(v = true, { ligneSeule = false } = {}) {
    etagere.visible = rt.visible = md.visible = !ligneSeule && v; pt.visible = pt2.visible = v;
    cRS.groupe.visible = cRM.groupe.visible = !ligneSeule && v; cML.groupe.visible = cOp.groupe.visible = v;
  }
  return { etagere, rt, md, pt, pt2, cRS, cRM, cML, cOp, web, local, montrer };
}
