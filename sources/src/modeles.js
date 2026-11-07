// Modèles 3D communs : palette, matériaux, appareils, colis, câbles, Mila, café, village, plateau schéma.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Code couleur fixe de toute l'animation.
export const C = {
  donnees: '#ff8a1c', local: '#2f7de1', wifi: '#6fc3ff', internet: '#98a3b0', secu: '#e5484d', panne: '#ffcf33',
  eteint: '#3d4a5c', nuit: '#0b1d3a', nuit2: '#16264d', or: '#ffc94a',
};

export const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.6, metalness: o.m ?? 0, flatShading: !!o.flat, transparent: !!o.tr, opacity: o.op ?? 1, emissive: o.e ?? '#000', emissiveIntensity: o.ei ?? 1 });
export const lum = (c, k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });

export function boite(w, h, d, m, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; return o;
}
export function poser(o, x, y, z, parent) { o.position.set(x, y, z); if (parent) parent.add(o); return o; }

// Texture de canevas (écran de menu, panneaux, points d'interrogation).
export function texture(w, h, dessin) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const POLICE = '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';

// Halo (sprite additif) pour étincelles, voyants, points d'interrogation.
let _halo;
export function halo(couleur, taille = 1) {
  _halo ??= texture(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: _halo, color: new THREE.Color(couleur).multiplyScalar(2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
  s.scale.setScalar(taille); return s;
}
export function panneauTexte(txt, { w = 512, h = 512, fond = null, couleur = '#fff', taille = 300 } = {}) {
  const t = texture(w, h, (g) => {
    if (fond) { g.fillStyle = fond; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = couleur; g.font = `800 ${taille}px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + taille * 0.05);
  });
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
}

// ---------- appareils ----------
// Chaque appareil : Group avec userData.ancre (point d'accroche de l'étiquette) et allumer(k) (0 éteint, 1 allumé).
function ecran(w, h, couleur = '#cfe6ff', tex = null) {
  const m = new THREE.MeshStandardMaterial({ color: '#0e1622', emissive: tex ? '#ffffff' : couleur, emissiveIntensity: 1, emissiveMap: tex, roughness: 0.3 });
  const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  return { o, m };
}
let _texMenu;
const texMenu = () => _texMenu ??= texture(512, 288, (g, w, h) => {
  g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffc94a'; g.font = `800 46px ${POLICE}`; g.fillText('MENU', 28, 62);
  const lignes = [['Croissant', '1,20'], ['Pain au chocolat', '1,40'], ['Baguette', '1,10'], ['Café', '1,80'], ['Chocolat chaud', '2,50']];
  g.font = `600 30px ${POLICE}`;
  lignes.forEach(([a, b], i) => { g.fillStyle = '#fff3df'; g.fillText(a, 28, 112 + i * 36); g.fillText(b + ' €', 400, 112 + i * 36); });
});

export function appareil(type, { pied = false } = {}) {
  const g = new THREE.Group();
  const sombre = mat('#2b3240', { r: 0.45 }), clair = mat('#e8ebef', { r: 0.5 }), inox = mat('#b8c0c8', { r: 0.35, m: 0.4 });
  const ecrans = [];
  let ancre = 0.6;
  if (type === 'caisse') {
    poser(boite(0.5, 0.12, 0.4, sombre, 0.03), 0, 0.06, 0, g);
    poser(boite(0.46, 0.08, 0.36, clair, 0.02), 0, 0.15, 0.01, g);
    const s = new THREE.Group(); poser(s, 0, 0.42, -0.08, g); s.rotation.x = -0.35;
    poser(boite(0.44, 0.3, 0.03, sombre, 0.01), 0, 0, 0, s);
    const e = ecran(0.4, 0.26); poser(e.o, 0, 0, 0.017, s); ecrans.push(e);
    poser(boite(0.05, 0.22, 0.05, sombre), 0, 0.27, -0.13, g);
    ancre = 0.72;
  } else if (type === 'ordinateur') {
    poser(boite(0.7, 0.44, 0.04, sombre, 0.015), 0, 0.42, 0, g);
    const e = ecran(0.66, 0.4); poser(e.o, 0, 0.42, 0.021, g); ecrans.push(e);
    poser(boite(0.06, 0.2, 0.06, sombre), 0, 0.12, -0.03, g);
    poser(boite(0.26, 0.02, 0.18, sombre, 0.008), 0, 0.01, -0.03, g);
    poser(boite(0.5, 0.025, 0.16, clair, 0.008), 0, 0.012, 0.25, g);
    ancre = 0.78;
  } else if (type === 'imprimante') {
    poser(boite(0.26, 0.2, 0.3, clair, 0.04), 0, 0.1, 0, g);
    poser(boite(0.2, 0.012, 0.012, sombre), 0, 0.17, 0.152, g);
    const papier = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.16), mat('#ffffff', { r: 0.9 }));
    papier.material.side = THREE.DoubleSide; poser(papier, 0, 0.24, 0.13, g); papier.rotation.x = -0.5;
    const v = ecran(0.03, 0.03, '#7dffb0'); poser(v.o, 0.09, 0.201, 0.08, g); v.o.rotation.x = -Math.PI / 2; ecrans.push(v);
    ancre = 0.42;
  } else if (type === 'imprimanteCuisine') {
    poser(boite(0.36, 0.26, 0.36, inox, 0.03), 0, 0.13, 0, g);
    poser(boite(0.26, 0.014, 0.014, sombre), 0, 0.2, 0.182, g);
    const papier = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), mat('#ffffff', { r: 0.9 }));
    papier.material.side = THREE.DoubleSide; poser(papier, 0, 0.3, 0.16, g); papier.rotation.x = -0.45;
    const v = ecran(0.04, 0.04, '#7dffb0'); poser(v.o, 0.13, 0.261, 0.1, g); v.o.rotation.x = -Math.PI / 2; ecrans.push(v);
    ancre = 0.5;
  } else if (type === 'ecranMenu') {
    poser(boite(1.12, 0.66, 0.05, sombre, 0.015), 0, pied ? 0.75 : 0, 0, g);
    const e = ecran(1.06, 0.6, '#ffffff', texMenu()); poser(e.o, 0, pied ? 0.75 : 0, 0.026, g); ecrans.push(e);
    if (pied) { poser(boite(0.06, 0.42, 0.06, sombre), 0, 0.21, -0.02, g); poser(boite(0.4, 0.03, 0.24, sombre, 0.01), 0, 0.015, 0, g); }
    ancre = pied ? 1.2 : 0.45;
  } else if (type === 'tpe') {
    poser(boite(0.14, 0.05, 0.2, sombre, 0.02), 0, 0.025, 0, g);
    const corps = new THREE.Group(); poser(corps, 0, 0.12, 0, g); corps.rotation.x = -0.6;
    poser(boite(0.11, 0.2, 0.04, mat('#3a4558', { r: 0.4 }), 0.02), 0, 0, 0, corps);
    const e = ecran(0.08, 0.06, '#a8f0c6'); poser(e.o, 0, 0.055, 0.021, corps); ecrans.push(e);
    for (let i = 0; i < 9; i++) poser(boite(0.018, 0.014, 0.008, clair), -0.025 + (i % 3) * 0.025, -0.02 - Math.floor(i / 3) * 0.022, 0.022, corps);
    ancre = 0.32;
  } else if (type === 'commutateur') {
    poser(boite(0.9, 0.12, 0.42, mat(C.local, { r: 0.4 }), 0.03), 0, 0.06, 0, g);
    for (let i = 0; i < 8; i++) {
      poser(boite(0.07, 0.05, 0.02, mat('#0d1830')), -0.32 + i * 0.09, 0.06, 0.212, g);
      const v = ecran(0.025, 0.012, '#7dffb0'); poser(v.o, -0.32 + i * 0.09, 0.1, 0.213, g); ecrans.push(v);
    }
    ancre = 0.32;
  }
  g.userData.type = type;
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = ancre; g.add(g.userData.ancre);
  g.userData.ecrans = ecrans;
  g.allumer = (k) => { for (const e of ecrans) e.m.emissiveIntensity = k; };
  return g;
}

// ---------- Wi-Fi ----------
// Borne Wi-Fi (fixée au plafond ou posée) : galet blanc, anneau de voyant bleu, deux antennes.
export function borneWifi() {
  const g = new THREE.Group();
  const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.1, 40), mat('#f4f6f9', { r: 0.35 }));
  corps.castShadow = true; g.add(corps);
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 48), lum(C.wifi, 2.2));
  anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.052; g.add(anneau);
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.32, 4, 8), mat('#e3e7ec', { r: 0.4 }));
    a.position.set(s * 0.26, 0.2, -0.12); a.rotation.z = s * 0.25; a.castShadow = true; g.add(a);
  }
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 0.55; g.add(g.userData.ancre);
  g.userData.voyant = anneau;
  return g;
}
// Tablette tenue à la main : plaque fine, écran clair.
export function tablette() {
  const g = new THREE.Group();
  poser(boite(0.34, 0.24, 0.02, mat('#222a36', { r: 0.4 }), 0.012), 0, 0, 0, g);
  const e = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshStandardMaterial({ color: '#0e1622', emissive: '#d8ecff', emissiveIntensity: 1 }));
  e.position.z = 0.011; g.add(e);
  g.allumer = (k) => { e.material.emissiveIntensity = k; };
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 0.3; g.add(g.userData.ancre);
  return g;
}
// Matériau « onde » : bord lumineux (effet de contour), centre transparent ; opacité réglable.
export function materiauOnde(couleur = C.wifi) {
  return new THREE.ShaderMaterial({
    uniforms: { couleur: { value: new THREE.Color(couleur).multiplyScalar(1.6) }, opacite: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 p = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-p.xyz); gl_Position = projectionMatrix * p; }`,
    fragmentShader: `uniform vec3 couleur; uniform float opacite; varying vec3 vN; varying vec3 vV;
      void main(){ float r = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = pow(r, 2.2) * opacite; gl_FragColor = vec4(couleur, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

// ---------- accès à Internet (couleur grise) ----------
function plaqueTexte(txt, couleur = '#e9edf2') {
  return texture(256, 64, (c) => { c.fillStyle = '#4b5562'; c.fillRect(0, 0, 256, 64); c.fillStyle = couleur; c.font = `800 38px ${POLICE}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 128, 34); });
}
// Modem (le traducteur) : boîtier gris clair, voyants, plaque « MODEM ».
export function modem() {
  const g = new THREE.Group();
  poser(boite(0.52, 0.14, 0.36, mat(C.internet, { r: 0.4 }), 0.03), 0, 0.07, 0, g);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.085), new THREE.MeshStandardMaterial({ map: plaqueTexte('MODEM'), roughness: 0.5 }));
  pl.rotation.x = -Math.PI / 2; poser(pl, 0, 0.142, 0.02, g);
  const ecrans = [];
  for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.015), new THREE.MeshStandardMaterial({ color: '#0e1622', emissive: i ? '#7dffb0' : '#ffd86b', emissiveIntensity: 1 })); poser(v, -0.15 + i * 0.1, 0.08, 0.181, g); ecrans.push({ m: v.material }); }
  g.userData.ecrans = ecrans; g.allumer = (k) => ecrans.forEach((e) => { e.m.emissiveIntensity = k; });
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 0.35; g.add(g.userData.ancre);
  return g;
}
// Routeur (l'aiguilleur) : boîtier gris foncé, flèches d'aiguillage sur le dessus, plaque « ROUTEUR ».
export function routeur() {
  const g = new THREE.Group();
  poser(boite(0.62, 0.12, 0.4, mat('#6f7a87', { r: 0.4 }), 0.03), 0, 0.06, 0, g);
  const dessus = texture(256, 160, (c) => {
    c.fillStyle = '#6f7a87'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#e9edf2'; c.font = `800 34px ${POLICE}`; c.textAlign = 'center'; c.fillText('ROUTEUR', 128, 40);
    c.strokeStyle = '#ffc94a'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(40, 110); c.lineTo(128, 110); c.lineTo(210, 70); c.moveTo(128, 110); c.lineTo(210, 140); c.stroke();
  });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.36), new THREE.MeshStandardMaterial({ map: dessus, roughness: 0.5 }));
  pl.rotation.x = -Math.PI / 2; poser(pl, 0, 0.122, 0, g);
  const ecrans = [];
  for (let i = 0; i < 5; i++) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.012), new THREE.MeshStandardMaterial({ color: '#0e1622', emissive: '#7dffb0', emissiveIntensity: 1 })); poser(v, -0.2 + i * 0.1, 0.07, 0.201, g); ecrans.push({ m: v.material }); }
  g.userData.ecrans = ecrans; g.allumer = (k) => ecrans.forEach((e) => { e.m.emissiveIntensity = k; });
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 0.35; g.add(g.userData.ancre);
  return g;
}
// Poteau de l'opérateur (bois, traverse) : la ligne arrive par le haut.
export function poteau(h = 4.8) {
  const g = new THREE.Group();
  poser(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, h, 10), mat('#7a5232', { r: 0.9 })), 0, h / 2, 0, g);
  poser(boite(1.1, 0.1, 0.12, mat('#6b4a2e')), 0, h - 0.3, 0, g);
  g.children.forEach((o) => { o.castShadow = true; });
  return g;
}

// ---------- serveur ----------
// Armoire bleue : porte vitrée qui pivote, voyants toujours allumés, un tiroir par personne (espaces personnels).
export function serveur(noms = ['Mila', 'Hugo', 'Inès']) {
  const g = new THREE.Group();
  const corps = mat('#1f3f73', { r: 0.45 }), fonce = mat('#0f2244', { r: 0.5 });
  poser(boite(0.04, 2.0, 0.8, corps), -0.43, 1.0, 0, g); poser(boite(0.04, 2.0, 0.8, corps), 0.43, 1.0, 0, g);
  poser(boite(0.9, 0.06, 0.8, corps), 0, 1.97, 0, g); poser(boite(0.9, 0.08, 0.8, corps), 0, 0.04, 0, g);
  poser(boite(0.9, 2.0, 0.04, fonce), 0, 1.0, -0.38, g);
  // Bandeau de voyants (en haut)
  poser(boite(0.82, 0.22, 0.7, fonce), 0, 1.78, -0.02, g);
  const voyants = [];
  for (let i = 0; i < 6; i++) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.01), lum(i % 3 ? '#7dffb0' : C.wifi, 2.2));
    poser(v, -0.3 + i * 0.12, 1.8, 0.335, g); voyants.push(v);
  }
  // Tiroirs nominatifs
  const tiroirs = {};
  noms.forEach((nom, k) => {
    const tr = new THREE.Group(); poser(tr, 0, 1.44 - k * 0.36, 0, g);
    poser(boite(0.8, 0.31, 0.7, mat(nom === 'Commun' ? '#cfe9d6' : '#d9e2ec', { r: 0.5 }), 0.02), 0, 0, -0.02, tr);
    const plaque = texture(256, 96, (c) => { c.fillStyle = '#0b1d3a'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#ffc94a'; c.fillRect(0, 0, 10, 96); c.fillStyle = '#fff'; c.font = `800 52px ${POLICE}`; c.textBaseline = 'middle'; c.fillText(nom, 30, 52); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshStandardMaterial({ map: plaque, roughness: 0.5 }));
    poser(pl, -0.12, 0, 0.335, tr);
    poser(boite(0.16, 0.04, 0.04, mat('#8a96a4', { m: 0.6, r: 0.3 })), 0.24, 0, 0.35, tr);
    tiroirs[nom] = tr;
  });
  // Porte vitrée (pivot sur le bord gauche)
  const porte = new THREE.Group(); poser(porte, -0.45, 0, 0.4, g);
  const cadre = mat('#2a4f8a', { r: 0.4 });
  poser(boite(0.05, 2.0, 0.04, cadre), 0.025, 1.0, 0, porte); poser(boite(0.05, 2.0, 0.04, cadre), 0.875, 1.0, 0, porte);
  poser(boite(0.9, 0.05, 0.04, cadre), 0.45, 1.975, 0, porte); poser(boite(0.9, 0.05, 0.04, cadre), 0.45, 0.025, 0, porte);
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.9), new THREE.MeshStandardMaterial({ color: '#bfe0f2', transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false }));
  poser(vitre, 0.45, 1.0, 0.005, porte);
  g.userData.porte = porte; g.userData.tiroirs = tiroirs; g.userData.voyants = voyants;
  g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 2.25; g.add(g.userData.ancre);
  g.clignoter = (t, k = 1) => voyants.forEach((v, i) => { v.visible = k > 0 && (Math.sin(t * (5 + i) + i * 2) > -0.6); });
  return g;
}

// ---------- colis (données) ----------
export function colis(taille = 0.22) {
  const g = new THREE.Group();
  const b = boite(taille * 1.25, taille, taille * 1.25, mat(C.donnees, { r: 0.45, e: C.donnees, ei: 0.55 }), taille * 0.18);
  g.add(b);
  poser(boite(taille * 1.27, taille * 0.18, taille * 0.3, mat('#ffe2b8', { r: 0.6 })), 0, 0, 0, g);
  const h = halo(C.donnees, taille * 3.2); h.material.opacity = 0.55; g.add(h);
  g.userData.corps = b; g.userData.halo = h;
  return g;
}

// ---------- câbles ----------
// Câble posé le long d'une courbe ; régler({p, trou, depart}) montre la portion [depart, p] privée d'un trou centré.
export function cable(courbe, { couleur = C.local, rayon = 0.05, seg = 48 } = {}) {
  const groupe = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: couleur, emissive: couleur, emissiveIntensity: 0.35, roughness: 0.45 });
  const geo = new THREE.TubeGeometry(courbe, seg, rayon, 8, false);
  const a = new THREE.Mesh(geo, m), b = new THREE.Mesh(geo.clone(), m);
  a.castShadow = b.castShadow = true;
  groupe.add(a, b);
  const parSeg = 8 * 6;
  const plage = (o, u0, u1) => {
    const s = Math.round(clamp01(u0) * seg), e = Math.round(clamp01(u1) * seg);
    o.visible = e > s; o.geometry.setDrawRange(s * parSeg, Math.max(0, e - s) * parSeg);
  };
  const base = new THREE.Color(couleur);
  return {
    groupe, courbe, materiau: m,
    regler({ p = 1, trou = 0, depart = 0 } = {}) {
      const g0 = 0.5 - trou / 2, g1 = 0.5 + trou / 2;
      plage(a, depart, Math.min(p, g0)); plage(b, Math.max(depart, g1), p);
    },
    teinte(c, k = 0.35) { m.color.set(c); m.emissive.set(c); m.emissiveIntensity = k; },
    normal() { m.color.copy(base); m.emissive.copy(base); m.emissiveIntensity = 0.35; },
  };
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Câble qui suit des segments droits (le long des plinthes, posé sur le sol) : pas de dépassement sous le sol,
// contrairement à une courbe lissée qui « plonge » aux angles.
export function ligneBrisee(pts) {
  const c = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) c.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  return c;
}

// Courbe de câble posée sur un plateau : légère bosse au milieu.
export function courbePlate(a, b, h = 0.12) {
  const m = a.clone().lerp(b, 0.5); m.y += h;
  return new THREE.QuadraticBezierCurve3(a.clone(), m, b.clone());
}

// Chemin pour un colis : liste de [courbe, sens] ; point(u) avec u ∈ [0, 1] sur tout le chemin.
export function chemin(segments) {
  const n = segments.length;
  return (u, cible) => {
    u = clamp01(u) * n; const k = Math.min(n - 1, Math.floor(u)); const f = u - k;
    const [c, inverse] = segments[k];
    return c.getPoint(inverse ? 1 - f : f, cible);
  };
}

// ---------- personnages (silhouettes sans visage, style de la vidéo de référence) ----------
export function personnage({ haut = '#e86a8a', bas = '#3b4a6b', peau = '#f2c3a0', cheveux = '#5a3a26', tablier = null, chignon = false, taille = 1 } = {}) {
  const g = new THREE.Group();
  const mHaut = mat(haut, { r: 0.7 }), mBas = mat(bas, { r: 0.7 }), mPeau = mat(peau, { r: 0.55 }), mCh = mat(cheveux, { r: 0.8 });
  for (const s of [-1, 1]) {
    const j = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 10), mBas); poser(j, s * 0.1, 0.28, 0, g); j.castShadow = true;
  }
  const corps = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 6, 16), mHaut); poser(corps, 0, 0.86, 0, g); corps.castShadow = true;
  if (tablier) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.235, 0.5, 20, 1, true, -1.1, 2.2), mat(tablier, { r: 0.8 }));
    t.material.side = THREE.DoubleSide; poser(t, 0, 0.74, 0.012, g);
  }
  const bras = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(); poser(pivot, s * 0.26, 1.08, 0, g);
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 4, 10), mHaut); poser(b, 0, -0.2, 0, pivot); b.castShadow = true;
    poser(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), mPeau), 0, -0.42, 0, pivot);
    pivot.rotation.z = s * 0.12; bras.push(pivot);
  }
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 18), mPeau); poser(tete, 0, 1.42, 0, g); tete.castShadow = true;
  const cal = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), mCh); poser(cal, 0, 1.44, -0.015, g); cal.rotation.x = -0.25;
  if (chignon) poser(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mCh), 0, 1.6, -0.12, g);
  g.scale.setScalar(taille);
  g.userData.bras = bras; g.userData.ancre = new THREE.Object3D(); g.userData.ancre.position.y = 1.85; g.add(g.userData.ancre);
  g.animer = (t, { salut = 0 } = {}) => {
    corps.position.y = 0.86 + Math.sin(t * 2.2) * 0.008;
    bras[1].rotation.z = 0.12 + salut * (2.4 + Math.sin(t * 9) * 0.25);
    bras[0].rotation.z = -0.12 - Math.sin(t * 1.3) * 0.03;
  };
  return g;
}
export const mila = () => personnage({ haut: '#f08a5d', bas: '#2f3e5c', cheveux: '#3b2416', tablier: '#fff7e8', chignon: true });

// ---------- village et café ----------
export function arbre(s = 1) {
  const g = new THREE.Group();
  poser(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1, 8), mat('#7a5232', { r: 0.9 })), 0, 0.5, 0, g);
  const f = mat('#4f9d4a', { r: 0.8, flat: true });
  poser(new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), f), 0, 1.45, 0, g);
  poser(new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), f), 0.35, 1.85, 0.1, g);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.scale.setScalar(s); return g;
}
export function maison(w = 4, d = 3.5, h = 2.6, mur = '#f1e4cc', toit = '#b8553d') {
  const g = new THREE.Group();
  const mMur = mat(mur, { r: 0.85 });
  poser(boite(w, h, d, mMur), 0, h / 2, 0, g);
  // Toit à deux pans posé exactement sur les murs, pignons triangulaires aux deux bouts.
  const a = 0.6, montee = Math.tan(a) * d / 2, pan = (d / 2) / Math.cos(a) + 0.28;
  const mToit = mat(toit, { r: 0.8, flat: true });
  for (const s of [-1, 1]) {
    const p = boite(w + 0.3, 0.12, pan, mToit);
    p.rotation.x = s * a; poser(p, 0, h + montee / 2 + 0.05, s * d / 4, g);
  }
  const tri = new THREE.Shape(); tri.moveTo(-d / 2, 0); tri.lineTo(d / 2, 0); tri.lineTo(0, montee); tri.closePath();
  for (const s of [-1, 1]) {
    const pg = new THREE.Mesh(new THREE.ShapeGeometry(tri), mMur); pg.material.side = THREE.DoubleSide;
    pg.rotation.y = Math.PI / 2; poser(pg, s * w / 2, h, 0, g);
  }
  const vitre = mat('#9cc7e6', { r: 0.2, e: '#2a4a66', ei: 0.3 });
  for (const x of [-w / 4, w / 4]) poser(boite(0.7, 0.7, 0.05, vitre), x, h * 0.6, d / 2 + 0.01, g);
  poser(boite(0.7, 1.3, 0.05, mat('#6b4a33')), 0, 0.65, d / 2 + 0.01, g);
  return g;
}

// Le café de Mila : murs, auvent rayé, toit qui se soulève, intérieur meublé, appareils.
export function cafe() {
  const g = new THREE.Group();
  const L = 12, P = 8, Hm = 3.2;
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(L, P), mat('#d9b98f', { r: 0.8 }));
  sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; poser(sol, 0, 0.01, 0, g);
  // carrelage en damier discret
  const dam = texture(256, 256, (c) => { c.fillStyle = '#d9b98f'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#cfab7d'; c.fillRect(0, 0, 128, 128); c.fillRect(128, 128, 128, 128); });
  dam.wrapS = dam.wrapT = THREE.RepeatWrapping; dam.repeat.set(8, 5.3); sol.material.map = dam; sol.material.color.set('#ffffff');
  const mMur = mat('#f5ead6', { r: 0.9 });
  const fond = poser(boite(L, Hm, 0.2, mMur), 0, Hm / 2, -P / 2, g);
  const gauche = poser(boite(0.2, Hm, P, mMur), -L / 2, Hm / 2, 0, g);
  const droite = poser(boite(0.2, Hm, P, mMur), L / 2, Hm / 2, 0, g);
  void fond; void gauche; void droite;
  // Façade (s'efface pour la vue intérieure)
  const facade = new THREE.Group(); g.add(facade);
  const mFac = mat('#f5ead6', { r: 0.9, tr: true });
  const mVitre = mat('#bfe0f2', { r: 0.1, tr: true, op: 0.45 });
  poser(boite(L, 0.9, 0.2, mFac), 0, Hm - 0.45, P / 2, facade);
  poser(boite(1.6, Hm - 0.9, 0.2, mFac), -L / 2 + 0.8, (Hm - 0.9) / 2, P / 2, facade);
  poser(boite(1.6, Hm - 0.9, 0.2, mFac), L / 2 - 0.8, (Hm - 0.9) / 2, P / 2, facade);
  poser(boite(L - 3.2, 0.7, 0.2, mFac), 0, 0.35, P / 2, facade);
  poser(boite(L - 3.2, Hm - 1.6, 0.06, mVitre), 0, 0.7 + (Hm - 1.6) / 2, P / 2, facade);
  // Auvent rayé vert et blanc
  const auvent = texture(256, 64, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#2e8b6a'; c.fillRect(i * 16, 0, 16, 64); } });
  const av = new THREE.Mesh(new THREE.PlaneGeometry(L - 1, 1.4), new THREE.MeshStandardMaterial({ map: auvent, side: THREE.DoubleSide, roughness: 0.8, transparent: true }));
  av.rotation.x = -Math.PI / 2 + 0.55; poser(av, 0, Hm - 0.55, P / 2 + 0.6, facade); av.castShadow = true;
  const enseigne = texture(1024, 160, (c) => { c.fillStyle = '#2e2116'; c.fillRect(0, 0, 1024, 160); c.fillStyle = '#ffc94a'; c.font = `800 100px ${POLICE}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Chez Mila', 512, 84); });
  const ens = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.62), new THREE.MeshStandardMaterial({ map: enseigne, roughness: 0.6, transparent: true }));
  poser(ens, 0, Hm - 0.4, P / 2 + 0.115, facade);
  // Toit (se soulève et s'efface)
  const toit = new THREE.Group(); poser(toit, 0, Hm, 0, g);
  const mToit = mat('#b8553d', { r: 0.8, flat: true, tr: true });
  for (const s of [-1, 1]) {
    const pan = boite(L + 0.6, 0.15, P / 2 / Math.cos(0.42) + 0.3, mToit);
    pan.rotation.x = s * 0.42; poser(pan, 0, Math.tan(0.42) * P / 4, s * P / 4, toit);
  }
  // Mobilier
  const bois = mat('#9c6b45', { r: 0.7 }), boisClair = mat('#c99b6d', { r: 0.7 });
  poser(boite(4.4, 1.05, 0.8, bois, 0.04), 1, 0.525, -0.6, g);           // comptoir
  poser(boite(4.6, 0.06, 0.95, boisClair, 0.02), 1, 1.08, -0.6, g);      // plateau du comptoir
  const vitrine = poser(boite(1.3, 0.45, 0.7, mat('#d8f0ff', { r: 0.1, tr: true, op: 0.35 }), 0.02), -0.6, 1.34, -0.6, g); void vitrine;
  const pain = mat('#c98a3f', { r: 0.75 });
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.3, 4, 8), pain); p.rotation.z = Math.PI / 2; poser(p, -0.95 + i * 0.24, 1.18, -0.6, g); }
  for (let i = 0; i < 3; i++) poser(new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), mat('#d99a4e', { r: 0.7 })), -0.9 + i * 0.3, 1.28, -0.45, g);
  // Étagères à pain au mur du fond
  for (let k = 0; k < 2; k++) {
    poser(boite(2.6, 0.06, 0.4, bois), -1.6, 1.4 + k * 0.6, -3.75, g);
    for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.34, 4, 8), pain); p.rotation.z = Math.PI / 2; p.rotation.y = 0.3; poser(p, -2.6 + i * 0.5, 1.5 + k * 0.6, -3.72, g); }
  }
  // Tables et chaises
  for (const [x, z] of [[-3.8, 1.6], [-1.2, 2.5], [1.6, 2.5], [4.2, 1.6]]) {
    poser(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24), boisClair), x, 0.75, z, g);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 8), mat('#333a44')), x, 0.37, z, g);
    for (const s of [-1, 1]) {
      const ch = new THREE.Group(); poser(ch, x + s * 0.75, 0, z, g);
      poser(boite(0.4, 0.05, 0.4, mat('#2e8b6a', { r: 0.6 }), 0.02), 0, 0.46, 0, ch);
      poser(boite(0.05, 0.45, 0.4, mat('#2e8b6a', { r: 0.6 }), 0.02), s * 0.18, 0.7, 0, ch);
      for (const [a, b] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) poser(boite(0.03, 0.45, 0.03, mat('#333a44')), a, 0.22, b, ch);
    }
  }
  // Bureau de gestion (coin gauche) et passe de la cuisine (coin droit)
  poser(boite(1.6, 0.05, 0.8, boisClair, 0.02), -4.6, 0.76, -3.2, g);
  for (const [a, b] of [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]]) poser(boite(0.05, 0.74, 0.05, mat('#333a44')), -4.6 + a, 0.37, -3.2 + b, g);
  poser(boite(1.8, 1.0, 0.7, mat('#c7ccd2', { r: 0.4, m: 0.3 }), 0.03), 4.6, 0.5, -3.35, g);
  poser(boite(0.2, Hm, 2.4, mMur), 3.5, Hm / 2, -2.8, g); // cloison de la cuisine

  // Appareils dans le café (positions dans le repère du café)
  const app = {
    caisse: poser(appareil('caisse'), 1.5, 1.11, -0.65, g),
    ordinateur: poser(appareil('ordinateur'), -4.6, 0.785, -3.35, g),
    imprimante: poser(appareil('imprimante'), 0.35, 1.11, -0.7, g),
    imprimanteCuisine: poser(appareil('imprimanteCuisine'), 4.6, 1.0, -3.35, g),
    ecranMenu: poser(appareil('ecranMenu'), 1.2, 2.45, -3.88, g),
    tpe: poser(appareil('tpe'), 2.75, 1.11, -0.45, g),
  };
  return { groupe: g, facade, mFac, mVitre, toit, mToit, appareils: app, L, P, Hm, av, ens };
}

export function village() {
  const g = new THREE.Group();
  const sol = new THREE.Mesh(new THREE.CircleGeometry(140, 64), mat('#7fbf5e', { r: 0.95 }));
  sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; g.add(sol);
  const route = new THREE.Mesh(new THREE.PlaneGeometry(200, 5), mat('#6b6f76', { r: 0.95 }));
  route.rotation.x = -Math.PI / 2; poser(route, 0, 0.02, 9.5, g); route.receiveShadow = true;
  const place = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), mat('#d8cdb8', { r: 0.95 }));
  place.rotation.x = -Math.PI / 2; poser(place, 0, 0.025, 5.6, g); place.receiveShadow = true;
  const couleurs = [['#f1e4cc', '#b8553d'], ['#e9d6c0', '#8a4b3a'], ['#f4efe6', '#5c6b7a'], ['#efd9b4', '#a0573f'], ['#e4ecf2', '#6e5a4a']];
  const lieux = [[-14, -2], [14, -1], [-24, 1], [24, -3], [-12, 18], [10, 19], [-30, 16], [28, 17], [0, -16], [-18, -16], [18, -15]];
  lieux.forEach(([x, z], i) => {
    const [m, t] = couleurs[i % couleurs.length];
    const h = maison(4 + (i % 3) * 0.8, 3.6, 2.6 + (i % 2) * 0.6, m, t); poser(h, x, 0, z, g);
    h.rotation.y = z > 9.5 ? Math.PI : 0; h.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  });
  const arbres = [[-8, -6], [8, -7], [-19, 7], [19, 6], [-5, 15], [6, 15], [-34, -6], [33, 5], [-26, -12], [26, -10], [-9, 26], [12, 28], [-40, 10], [40, -12]];
  arbres.forEach(([x, z], i) => poser(arbre(0.9 + (i % 3) * 0.25), x, 0, z, g));
  return g;
}

// Plateau schéma (monde des données, bleu nuit) : disque et anneau lumineux ; positions des 6 appareils en hexagone.
export function plateau(r = 4.6) {
  const g = new THREE.Group();
  const disque = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.22, 72), mat('#12284f', { r: 0.55, e: '#0b1d3a', ei: 0.6 }));
  disque.receiveShadow = true; poser(disque, 0, -0.11, 0, g);
  const bord = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 120), lum(C.local, 2.2));
  bord.rotation.x = Math.PI / 2; g.add(bord);
  const grille = new THREE.PolarGridHelper(r * 0.96, 6, 4, 64, '#2b4f8a', '#1f3d6e');
  grille.position.y = 0.005; grille.material.transparent = true; grille.material.opacity = 0.35; g.add(grille);
  g.userData.bord = bord; g.userData.disque = disque;
  return g;
}
export const ORDRE = ['caisse', 'imprimante', 'tpe', 'imprimanteCuisine', 'ordinateur', 'ecranMenu'];
export function posHexa(i, r = 3.2) { const a = Math.PI / 2 + i * Math.PI / 3; return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r); }
