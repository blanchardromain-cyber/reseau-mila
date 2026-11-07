// Vignette « Au collège » : une salle de technologie (salle De Vinci : 16 postes élèves ; salle Pesquet : 12),
// postes reliés en étoile au commutateur.
import * as THREE from 'three';
import { C, mat, boite, poser, colis, borneWifi, materiauOnde } from './modeles.js';

export function vignetteCollege({ rangs = 4, colonnes = 4, wifi = false } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e3edf6');
  const cam = new THREE.PerspectiveCamera(36, 500 / 300, 0.1, 100);
  scene.add(new THREE.HemisphereLight('#ffffff', '#a8b4c2', 1.4));
  const sol = new THREE.DirectionalLight('#ffffff', 1.6); sol.position.set(4, 10, 6); scene.add(sol);
  const plancher = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat('#cfd8e2', { r: 0.9 }));
  plancher.rotation.x = -Math.PI / 2; scene.add(plancher);
  poser(boite(14, 2.6, 0.15, mat('#f4f1ea', { r: 0.9 })), 0, 1.3, -4.6, scene);
  const tableau = poser(boite(3.4, 1.2, 0.05, mat('#2f5b46', { r: 0.8 })), 0, 1.6, -4.5, scene); void tableau;
  const sw = poser(appareilSimple(), 0, 0.85, -3.3, scene);
  const lignes = [], postes = [], traits = [];
  const ecart = colonnes > 4 ? 1.85 : 2.1;
  for (let r = 0; r < rangs; r++) for (let c = 0; c < colonnes; c++) {
    const x = (c - (colonnes - 1) / 2) * ecart, z = -1.6 + r * 1.55;
    poser(boite(1.5, 0.05, 0.6, mat('#d7b98f', { r: 0.7 })), x, 0.72, z, scene);
    const e = poser(boite(0.5, 0.32, 0.04, mat('#1b2433', { e: '#cfe6ff', ei: 0.9 })), x, 0.96, z - 0.12, scene);
    postes.push(e);
    const a = new THREE.Vector3(0, 0.9, -3.3), b = new THREE.Vector3(x, 0.74, z - 0.12);
    const m = a.clone().lerp(b, 0.5); m.y = 0.25;
    const courbe = new THREE.QuadraticBezierCurve3(a, m, b);
    const geo = new THREE.BufferGeometry().setFromPoints(courbe.getPoints(24));
    const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: new THREE.Color(C.local).multiplyScalar(1.4) }));
    scene.add(l); lignes.push(courbe); traits.push(l);
  }
  const paquets = Array.from({ length: 8 }, () => { const p = colis(0.14); scene.add(p); return p; });
  // Appareils sans fil de la salle de technologie, autour de la borne Wi-Fi (premier plan à droite) :
  // smartphones, tablettes des élèves à besoins particuliers, imprimante 3D.
  const ondes = [];
  if (wifi) {
    const b = poser(borneWifi(), 5.6, 2.3, -1.2, scene); b.scale.setScalar(1.4);
    const mT = mat('#222a36', { e: '#d8ecff', ei: 0.8 });
    poser(boite(3.4, 0.05, 2.4, mat('#c7a77c', { r: 0.6 })), 5.45, 0.71, 1.95, scene);
    for (const [x, z, ry] of [[4.3, 1.3, 0.2], [4.9, 1.4, -0.2]]) { const tb = poser(boite(0.46, 0.03, 0.33, mT), x, 0.75, z, scene); tb.rotation.y = ry; }
    for (const [x, z] of [[4.4, 2.5], [4.75, 2.65]]) poser(boite(0.13, 0.025, 0.26, mT), x, 0.75, z, scene);
    // Imprimante 3D à portique ouvert : plateau, montant, bras, tête.
    const i3d = new THREE.Group(); poser(i3d, 6.2, 0.74, 2.0, scene);
    const gris = mat('#3a3f47', { r: 0.4 }), clair = mat('#e6e8eb', { r: 0.4 });
    poser(boite(1.1, 0.12, 0.9, gris), 0, 0.06, 0, i3d);
    poser(boite(0.8, 0.03, 0.8, mat('#1b1f25', { r: 0.3 })), 0.05, 0.15, 0, i3d);
    poser(boite(0.1, 1.1, 0.12, clair), -0.5, 0.65, -0.3, i3d);
    poser(boite(1.0, 0.08, 0.08, clair), -0.02, 1.05, -0.3, i3d);
    poser(boite(0.14, 0.18, 0.14, mat('#1f9d55', { r: 0.4 })), 0.15, 0.96, -0.3, i3d);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), mat('#ff8a1c', { r: 0.5 })), 0.1, 0.25, 0.1, i3d);
    for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), materiauOnde()); o.position.copy(b.position); scene.add(o); ondes.push(o); }
  }
  // etat : { eteint: indice du poste en panne (-1 : aucun), coupe: 0..1 (câble de ce poste débranché),
  //          swOff: commutateur éteint, camLibre: la caméra est réglée par le chapitre }
  const BLEU = new THREE.Color(C.local).multiplyScalar(1.4), GRIS = new THREE.Color('#5b6675');
  function maj(t, etat = {}) {
    const { eteint = -1, coupe = 0, swOff = false, camLibre = false } = etat;
    ondes.forEach((o, k) => { const u = ((t * 0.45 + k / 3) % 1); o.scale.setScalar(0.3 + u * 4.5); o.material.uniforms.opacite.value = (1 - u) * 0.9; });
    const a = 0.5 + Math.sin(t * 0.15) * 0.25;
    if (!camLibre) {
      if (wifi) { cam.position.set(1.5 + Math.sin(t * 0.15) * 1.2, 7.4, 10.5); cam.lookAt(1.4, 0.4, -0.2); }
      else { cam.position.set(Math.sin(a) * 9.5, 6.6, Math.cos(a) * 9.5 - 0.6); cam.lookAt(0, 0.4, -0.6); }
    }
    postes.forEach((e, i) => { e.material.emissiveIntensity = i === eteint ? 0.9 * (1 - coupe) : 0.9; });
    traits.forEach((l, i) => {
      l.material.color.copy(swOff ? GRIS : BLEU);
      l.geometry.setDrawRange(0, i === eteint ? Math.round(25 * (1 - 0.3 * coupe)) : 25);
      if (i === eteint && coupe > 0) l.material.color.copy(GRIS);
    });
    sw.children.slice(1).forEach((v) => { v.material.emissiveIntensity = swOff ? 0 : 1; });
    paquets.forEach((p, k) => {
      let n = (k * 7 + Math.floor((t + k * 0.37) / 2.2) * 5) % lignes.length;
      if (n === eteint && coupe > 0) n = (n + 1) % lignes.length;
      const u = ((t + k * 0.37) / 2.2) % 1;
      p.visible = !swOff;
      lignes[n].getPoint(k % 2 ? u : 1 - u, p.position); p.position.y += 0.1;
    });
  }
  return { scene, cam, maj, postes, sw };
}

// Vignette « baie technique » du collège : la ligne de l'opérateur entre par le mur, puis modem → routeur → commutateur.
export function vignetteBaie({ modem, routeur, protection = false }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e3edf6');
  const cam = new THREE.PerspectiveCamera(36, 500 / 300, 0.1, 100);
  scene.add(new THREE.HemisphereLight('#ffffff', '#a8b4c2', 1.4));
  const sol = new THREE.DirectionalLight('#ffffff', 1.6); sol.position.set(4, 10, 6); scene.add(sol);
  const plancher = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), mat('#c3ccd6', { r: 0.9 })); plancher.rotation.x = -Math.PI / 2; scene.add(plancher);
  poser(boite(10, 3, 0.15, mat('#f4f1ea', { r: 0.9 })), 0, 1.5, -1.2, scene);
  const noir = mat('#1d222a', { r: 0.5 });
  for (const x of [-0.55, 0.55]) poser(boite(0.08, 2.2, 0.8, noir), x, 1.1, -0.6, scene);
  poser(boite(1.18, 0.08, 0.8, noir), 0, 2.2, -0.6, scene); poser(boite(1.18, 0.08, 0.8, noir), 0, 0.04, -0.6, scene);
  const m = poser(modem(), 0, 1.75, -0.6, scene); m.scale.setScalar(1.6);
  const r = poser(routeur(), 0, 1.35, -0.6, scene); r.scale.setScalar(1.5);
  const s = poser(appareilSimple(), 0, 0.98, -0.5, scene); void s;
  if (protection) { // passerelle et pare-feu (rouge) en tête de baie, là où la ligne entre
    poser(boite(0.95, 0.16, 0.6, mat(C.secu, { r: 0.4, e: C.secu, ei: 0.35 }), 0.03), 0, 2.08, -0.55, scene);
    for (let i = 0; i < 4; i++) poser(boite(0.05, 0.02, 0.01, mat('#0e1622', { e: '#ffd0d2', ei: 1.2 })), -0.3 + i * 0.2, 2.08, -0.245, scene);
  }
  const ligne = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.5, 2.6, -1.1), new THREE.Vector3(-1.2, 2.5, -1.0), new THREE.Vector3(-0.3, 2.05, -0.5), new THREE.Vector3(0, 1.85, -0.35)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(ligne, 60, 0.045, 8), mat(C.internet, { e: C.internet, ei: 0.3 })));
  const liens = [[new THREE.Vector3(0.45, 1.8, -0.3), new THREE.Vector3(0.7, 1.55, -0.2), new THREE.Vector3(0.45, 1.4, -0.3)], [new THREE.Vector3(-0.45, 1.4, -0.3), new THREE.Vector3(-0.7, 1.2, -0.2), new THREE.Vector3(-0.45, 1.0, -0.25)]]
    .map((pts, k) => { const c = new THREE.CatmullRomCurve3(pts); scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.035, 8), mat(k ? C.local : C.internet, { e: k ? C.local : C.internet, ei: 0.4 }))); return c; });
  const sorties = [-0.4, -0.1, 0.2, 0.5].map((x) => { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.95, -0.25), new THREE.Vector3(x, 0.4, 0.1), new THREE.Vector3(x * 4, 0.04, 3)]); scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.03, 8), mat(C.local, { e: C.local, ei: 0.4 }))); return c; });
  const chemins = [ligne, ...liens, sorties[1]];
  const paquets = [0, 1, 2].map(() => { const p = colis(0.12); scene.add(p); return p; });
  function maj(t) {
    cam.position.set(2.6 + Math.sin(t * 0.2) * 0.6, 2.6, 4.6); cam.lookAt(-0.3, 1.35, -0.6);
    paquets.forEach((p, k) => {
      const u = ((t / 4 + k / 3) % 1) * chemins.length, i = Math.floor(u);
      chemins[i].getPoint(u - i, p.position);
    });
  }
  return { scene, cam, maj };
}

function appareilSimple() {
  const g = new THREE.Group();
  poser(boite(1.1, 0.16, 0.5, mat(C.local, { r: 0.4 }), 0.03), 0, 0, 0, g);
  for (let i = 0; i < 8; i++) poser(boite(0.06, 0.03, 0.02, mat('#0d1830', { e: '#7dffb0', ei: 1 })), -0.4 + i * 0.115, 0.04, 0.26, g);
  return g;
}
