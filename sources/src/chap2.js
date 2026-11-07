// Chapitre 2 : relier les appareils. Le commutateur et ses câbles (coupe du câble RJ45), puis la borne Wi-Fi
// (cône d'onde qui se rétrécit avec la distance, mur qui atténue le signal).
import * as THREE from 'three';
import { lancerChapitre, camera, prog, lerp, clamp, easeInOut, easeOut, pop, fondu } from './moteur.js';
import {
  C, mat, lum, appareil, colis, cable, halo, poser, boite, texture, borneWifi, tablette, materiauOnde, plateau, ligneBrisee,
} from './modeles.js';
import { decor } from './decor.js';
import { vignetteCollege } from './college.js';

const ctx = lancerChapitre({ numero: 2, titre: 'Relier les appareils', base, vignette: null, plans: [] });
const { scene, cam, etiquette, panneau } = ctx;
const D = decor(scene);
const { caf, laMila } = D;
const pv = new THREE.Vector3(), pw = new THREE.Vector3();

// ---------- le commutateur du café et ses câbles ----------
const etagere = poser(boite(1.3, 0.06, 0.4, mat('#9c6b45', { r: 0.7 })), 2.4, 1.0, -3.72, caf.groupe);
const sw = poser(appareil('commutateur'), 2.4, 1.03, -3.72, caf.groupe);
const port = (i) => new THREE.Vector3(2.4 - 0.32 + i * 0.09, 1.09, -3.49);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TRAJETS = {
  caisse: [port(0), V(2.08, 0.6, -3.42), V(2.08, 0.05,-3.42), V(1.5, 0.05,-1.3), V(1.5, 0.05,-1.08), V(1.5, 1.0, -1.06), V(1.5, 1.16, -0.86)],
  imprimante: [port(1), V(2.17, 0.6, -3.45), V(2.17, 0.05,-3.45), V(0.35, 0.05,-1.3), V(0.35, 0.05,-1.08), V(0.35, 1.0, -1.06), V(0.35, 1.16, -0.86)],
  tpe: [port(2), V(2.26, 0.6, -3.48), V(2.26, 0.05,-3.48), V(2.75, 0.05,-1.3), V(2.75, 0.05,-1.08), V(2.75, 1.0, -1.06), V(2.75, 1.16, -0.6)],
  ordinateur: [port(3), V(2.35, 0.6, -3.5), V(2.35, 0.05,-3.75), V(-4.0, 0.05,-3.78), V(-4.45, 0.05,-3.6), V(-4.45, 0.75, -3.55), V(-4.6, 0.82, -3.45)],
  imprimanteCuisine: [port(4), V(2.44, 0.6, -3.5), V(2.6, 0.05,-3.78), V(3.5, 0.05,-3.78), V(4.3, 0.05,-3.78), V(4.3, 0.95, -3.72), V(4.55, 1.05, -3.5)],
  ecranMenu: [port(5), V(2.53, 1.3, -3.6), V(2.2, 1.7, -3.86), V(1.55, 2.1, -3.86), V(1.25, 2.3, -3.9)],
};
const ORDRE_CAB = ['caisse', 'imprimante', 'tpe', 'ecranMenu', 'imprimanteCuisine', 'ordinateur'];
const cables = ORDRE_CAB.map((k) => {
  const c = cable(ligneBrisee(TRAJETS[k]), { rayon: 0.024, seg: 180 });
  caf.groupe.add(c.groupe); c.cle = k; return c;
});
const paquetsCafe = cables.map(() => { const p = colis(0.11); caf.groupe.add(p); return p; });
const trous = [V(3.5, 0.12, -3.78), V(-4.45, 0.4, -3.8)].map((p) => {
  const g = new THREE.Group(); poser(g, p.x, p.y, p.z, caf.groupe);
  const t = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), mat('#2a1d14')); t.rotation.y = p.x > 0 ? Math.PI / 2 : 0; t.position.z = p.x > 0 ? 0 : 0.11; g.add(t);
  const poussiere = halo('#c9b8a4', 0.9); g.add(poussiere); g.userData.poussiere = poussiere; return g;
});
function cablesCafe(t, { dessin = 1, d0 = 0, flux0 = Infinity, vitesse = 1, eclat = 0 } = {}) {
  sw.visible = true; etagere.visible = true;
  cables.forEach((c, i) => {
    const p = dessin >= 1 ? 1 : easeInOut(prog(t, d0 + i * 0.75, d0 + i * 0.75 + 0.9));
    c.regler({ p }); c.normal();
    if (eclat > 0) c.teinte(new THREE.Color(C.local).lerp(new THREE.Color(C.wifi), eclat), 0.35 + 1.2 * eclat);
    sw.userData.ecrans[i].m.emissiveIntensity = p >= 1 ? 1 + 0.6 * Math.sin(t * 9 + i) : 0.05;
    const dev = caf.appareils[c.cle]; dev.allumer(p >= 1 ? 1 : 0.3);
    const q = paquetsCafe[i]; q.visible = t > flux0 && p >= 1;
    if (q.visible) {
      const u = (((t - flux0) * vitesse / 2.2 + i * 0.17) % 1);
      c.courbe.getPoint(i % 2 ? u : 1 - u, q.position); q.position.y += 0.07;
    }
  });
}

// ---------- coupe du câble Ethernet (studio, monde des données) ----------
const S = new THREE.Vector3(0, 40, 0);
const studioCable = new THREE.Group(); studioCable.position.copy(S); scene.add(studioCable);
const PAIRES = [['#ff8a1c', '#f6dcc4'], ['#2fae5a', '#d5ecd9'], ['#2f7de1', '#d3e3f7'], ['#7a4a2a', '#e6d7cb']];
class Fil extends THREE.Curve {
  constructor(paire, brin) { super(); this.paire = paire; this.brin = brin; }
  getPoint(t, cible = new THREE.Vector3()) {
    const x = -3 + 6.9 * t;
    const a = Math.PI / 4 + this.paire * Math.PI / 2;
    const cy = Math.cos(a) * 0.2, cz = Math.sin(a) * 0.2;
    const ph = 2 * Math.PI * 1.8 * (x + 3) + this.brin * Math.PI;
    const hy = cy + Math.cos(ph) * 0.065, hz = cz + Math.sin(ph) * 0.065;
    const rang = this.paire * 2 + this.brin;
    const ry = 0.2, rz = -0.3 + rang * 0.0857;
    const b = THREE.MathUtils.smoothstep(x, 2.3, 3.05);
    return cible.set(x, lerp(hy, ry, b), lerp(hz, rz, b));
  }
}
const fils = [];
PAIRES.forEach((cols, p) => cols.forEach((col, b) => {
  const f = new Fil(p, b);
  const m = new THREE.Mesh(new THREE.TubeGeometry(f, 420, 0.042, 8), mat(col, { r: 0.45 }));
  m.castShadow = true; studioCable.add(m); fils.push(f);
}));
const gaine = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1, 40, 1, true), mat(C.local, { r: 0.5, tr: true, op: 0.97 }));
gaine.material.side = THREE.DoubleSide; gaine.rotation.z = Math.PI / 2; studioCable.add(gaine);
const bout = new THREE.Mesh(new THREE.RingGeometry(0.39, 0.43, 40), mat('#1d5bb3')); bout.rotation.y = Math.PI / 2; studioCable.add(bout);
const prise = new THREE.Group(); poser(prise, 3.45, 0, 0, studioCable);
poser(boite(1.1, 0.72, 0.92, new THREE.MeshStandardMaterial({ color: '#dfeaf5', transparent: true, opacity: 0.32, roughness: 0.1, depthWrite: false }), 0.05), 0, 0.02, 0, prise);
for (let i = 0; i < 8; i++) poser(boite(0.5, 0.05, 0.035, mat('#e8b84a', { r: 0.25, m: 0.8, e: '#6b4e10', ei: 0.4 })), 0.25, 0.33, -0.3 + i * 0.0857, prise);
const loquet = poser(boite(0.7, 0.05, 0.36, new THREE.MeshStandardMaterial({ color: '#dfeaf5', transparent: true, opacity: 0.5 })), -0.15, -0.42, 0, prise); loquet.rotation.z = -0.25;
const paquetsFils = [0, 2, 4, 6].map(() => { const p = colis(0.09); studioCable.add(p); return p; });
const aGaine = new THREE.Object3D(); aGaine.position.set(-2.1, 0.45, 0); studioCable.add(aGaine);
const aFils = new THREE.Object3D(); aFils.position.set(1.2, 0.3, 0); studioCable.add(aFils);
const aPrise = new THREE.Object3D(); aPrise.position.set(3.45, 0.42, 0); studioCable.add(aPrise);

// ---------- borne Wi-Fi du café, tablette, ondes ----------
const borne = poser(borneWifi(), 0.5, 3.0, 2.0, caf.groupe);
const tab = tablette(); laMila.add(tab); tab.position.set(0, 1.02, 0.33); tab.rotation.x = -0.95;
const ondes = [0, 1, 2, 3].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), materiauOnde()); scene.add(o); return o; });
const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 1, 1, 32, 1, true), materiauOnde());
cone.geometry.translate(0, -0.5, 0); scene.add(cone);
const paquetsOnde = [0, 1, 2].map(() => { const p = colis(0.12); scene.add(p); return p; });
const eclairT = halo(C.panne, 1.6); scene.add(eclairT);
const HAUT = new THREE.Vector3(0, 1, 0);
const portee = (d) => clamp(1 - (d - 5) / 10); // qualité du signal selon la distance à la borne (0 au-delà de 15 m)
const barres = (q) => (q <= 0 ? 0 : Math.max(1, Math.ceil(q * 4)));
const htmlBarres = (n, txt = '') => `<span class="barres">${[1, 2, 3, 4].map((k) => `<i class="${k <= n ? 'on' : ''}" style="height:${8 + k * 8}px"></i>`).join('')}</span>${txt}`;
function ondesWifi(t, t0, { rayon = 10, alpha = 1 } = {}) {
  borne.getWorldPosition(pv);
  ondes.forEach((o, k) => {
    o.visible = t > t0;
    const u = (((t - t0) / 2.4 + k / 4) % 1);
    o.position.copy(pv); o.scale.setScalar(0.3 + u * rayon);
    o.material.uniforms.opacite.value = (1 - u) * 0.42 * alpha * fondu(t, t0, 0.6);
  });
}
// Cône borne → tablette, colis qui voyagent dedans ; renvoie la qualité du signal.
function liaisonWifi(t, t0, { qualite = null } = {}) {
  borne.getWorldPosition(pv); tab.getWorldPosition(pw);
  const d = pv.distanceTo(pw), q = qualite ?? portee(d);
  const dir = pw.clone().sub(pv);
  cone.visible = t > t0 && q > 0.01;
  if (cone.visible) {
    cone.position.copy(pv);
    cone.quaternion.setFromUnitVectors(HAUT, dir.clone().normalize().negate());
    const r = 0.12 + 0.75 * q;
    cone.scale.set(r, d, r);
    cone.material.uniforms.opacite.value = (0.25 + 0.75 * q) * fondu(t, t0, 0.6);
  }
  paquetsOnde.forEach((p, k) => {
    p.visible = t > t0 + 0.3 && q > 0.05 && k < Math.ceil(q * 3);
    if (!p.visible) return;
    const u = (((t - t0) / (1.2 + 2.5 * (1 - q)) + k / 3) % 1);
    p.position.copy(pv).lerp(pw, u); p.position.y += Math.sin(Math.PI * u) * 0.15;
  });
  tab.allumer(0.3 + 0.7 * Math.min(1, q * 2));
  return q;
}
// Trajet de Mila : liste de points [x, z] (repère du café) parcourue entre t0 et t1 à vitesse constante.
function marcher(t, t0, t1, pts) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let s = easeInOut(prog(t, t0, t1)) * L, i = 0;
  while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; }
  const f = seg[i] ? Math.min(1, s / seg[i]) : 1;
  const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
  laMila.position.set(lerp(ax, bx, f), Math.abs(Math.sin(t * 7)) * 0.03 * (t > t0 && t < t1 ? 1 : 0), lerp(az, bz, f));
  laMila.rotation.y = Math.atan2(bx - ax, bz - az);
}
const TRAJET_TERRASSE = [[1.2, -1.55], [3.6, -1.45], [3.7, 1.2], [1.8, 3.2], [0.9, 5.8]];
const TRAJET_LOIN = [[0.9, 5.8], [1.2, 9.5], [1.6, 13.5], [2.0, 17.6]];

// ---------- mur de pierre en coupe (studio) ----------
const studioMur = new THREE.Group(); studioMur.position.copy(S); scene.add(studioMur);
const pierre = texture(512, 512, (g) => {
  g.fillStyle = '#8b8378'; g.fillRect(0, 0, 512, 512);
  const cols = ['#a39a8d', '#9a9184', '#b0a698', '#8f877b'];
  for (let y = 0; y < 512; y += 64) for (let x = -((y / 64) % 2) * 48; x < 512; x += 96) {
    g.fillStyle = cols[(x * 7 + y * 3) % 4 & 3]; g.fillRect(x + 4, y + 4, 88, 56);
  }
});
pierre.wrapS = pierre.wrapT = THREE.RepeatWrapping; pierre.repeat.set(1, 2);
const mur = poser(boite(1.1, 3.6, 3, new THREE.MeshStandardMaterial({ map: pierre, roughness: 0.95 })), 0, 0.6, 0, studioMur);
void mur;
const sol2 = poser(boite(13, 0.12, 4, mat('#1a3360', { r: 0.8 })), 0, -1.2, 0, studioMur); void sol2;
const borne2 = borneWifi(); borne2.rotation.z = -Math.PI / 2; poser(borne2, -5.4, 0.8, 0, studioMur); borne2.scale.setScalar(1.6);
const tab2 = tablette(); tab2.rotation.y = -Math.PI / 2; tab2.scale.setScalar(2.2); poser(tab2, 5.3, 0.8, 0, studioMur);
const N_POINTS = 150;
const points = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), lum(C.wifi, 2.2), N_POINTS);
studioMur.add(points);
const paquetsMur = [0, 1, 2, 3].map(() => { const p = colis(0.16); studioMur.add(p); return p; });
const aMur = new THREE.Object3D(); aMur.position.set(0, 2.5, 0); studioMur.add(aMur);
const aAvant = new THREE.Object3D(); aAvant.position.set(-2.6, 1.75, 0); studioMur.add(aAvant);
const aApres = new THREE.Object3D(); aApres.position.set(4.0, 1.75, 0); studioMur.add(aApres);
const mtx = new THREE.Matrix4();
function amplitude(x) { return x < -0.55 ? 0.55 : x > 0.55 ? 0.19 : lerp(0.55, 0.19, (x + 0.55) / 1.1); }
function onde(t, alpha) {
  for (let i = 0; i < N_POINTS; i++) {
    const x = -4.6 + 9.4 * (i / (N_POINTS - 1));
    const y = 0.8 + amplitude(x) * Math.sin(3.2 * x - 5 * t) * alpha;
    const visible = Math.abs(x) > 0.56;
    mtx.makeScale(visible ? 1 : 0.001, visible ? 1 : 0.001, visible ? 1 : 0.001).setPosition(x, y, 0.2);
    points.setMatrixAt(i, mtx);
  }
  points.instanceMatrix.needsUpdate = true;
}

// ---------- bilan (studio) : commutateur câblé / borne Wi-Fi ----------
const studioBilan = new THREE.Group(); studioBilan.position.copy(S); scene.add(studioBilan);
const platG = plateau(2.6); poser(platG, -3.4, 0, 0, studioBilan);
const platD = plateau(2.6); poser(platD, 3.4, 0, 0, studioBilan);
const swB = appareil('commutateur'); swB.scale.setScalar(1.8); poser(swB, -3.4, 0, 0, studioBilan);
const postesB = [-1, 0, 1].map((k) => { const o = appareil('ordinateur'); o.scale.setScalar(1.4); const a = -Math.PI / 2 + k * 0.9; poser(o, -3.4 + Math.cos(a) * 1.9, 0, Math.sin(a) * -1.9 + 0.2, studioBilan); o.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a)); return o; });
const cablesB = postesB.map((o) => { const c = cable(new THREE.QuadraticBezierCurve3(V(-3.4, 0.12, 0), V((o.position.x - 3.4) / 2, 0.05, o.position.z / 2), V(o.position.x, 0.08, o.position.z)), { rayon: 0.05 }); studioBilan.add(c.groupe); return c; });
const borneB = borneWifi(); borneB.scale.setScalar(1.8); poser(borneB, 3.4, 1.4, 0, studioBilan);
const pied = poser(boite(0.12, 1.4, 0.12, mat('#d7dde4')), 3.4, 0.7, 0, studioBilan); void pied;
const tabsB = [-1, 1].map((k) => { const tb = tablette(); tb.scale.setScalar(2.4); poser(tb, 3.4 + k * 1.6, 1.1, 0.6, studioBilan); tb.rotation.y = -k * 0.5; return tb; });
const ondesB = [0, 1, 2].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), materiauOnde()); studioBilan.add(o); o.position.set(3.4, 1.4, 0); return o; });
const paquetsB = [0, 1, 2, 3].map(() => { const p = colis(0.14); studioBilan.add(p); return p; });

// ---------- remise à zéro à chaque image ----------
function base() {
  D.reinitialiser();
  sw.visible = etagere.visible = false; borne.visible = false; tab.visible = false;
  sw.position.z = -3.72; sw.scale.setScalar(1); borne.scale.setScalar(1.3);
  cables.forEach((c) => c.regler({ p: 0 })); paquetsCafe.forEach((p) => p.visible = false);
  trous.forEach((g) => g.visible = false);
  studioCable.visible = studioMur.visible = studioBilan.visible = false;
  ondes.forEach((o) => o.visible = false); cone.visible = false; paquetsOnde.forEach((p) => p.visible = false); eclairT.visible = false;
  ctx.renderer.domElement.style.filter = '';
}
function cafeVisible(ouvert = 1) { D.vil.visible = caf.groupe.visible = true; D.ouvrirCafe(ouvert); }

const plans = [
  { // 2.0 Titre
    id: '2.0', min: 6, fondu: false,
    textes: [{ t: -1, txt: 'Le réseau de Mila', style: 'titre' }, { t: -1, txt: 'Chapitre 2 · Relier les appareils', style: 'soustitre' }],
    maj(t) { cafeVisible(0); laMila.animer(t); camera(cam, 0, [{ t: 0, ...D.orbite(t), fov: 34 }]); },
  },
  { // 2.1 Le commutateur
    id: '2.1',
    textes: (P) => [{ t: P(0) + 1.2, txt: 'Commutateur (switch)', ligne: 1 }, { t: P(1), txt: 'Il relie les appareils par des câbles Ethernet.', ligne: 2 }],
    maj(t, P, F) {
      cafeVisible(easeInOut(prog(t, 0, 1.6))); laMila.animer(t);
      const arrivee = easeOut(prog(t, P(0) + 0.6, P(0) + 1.6));
      cablesCafe(t, { dessin: 0, d0: P(1) - 0.2, flux0: F(1) - 0.6 });
      sw.position.z = -3.72 + (1 - arrivee) * 1.2; sw.scale.setScalar(Math.max(0.001, arrivee));
      etiquette('sw', 'Commutateur', 'local').montrer(sw.userData.ancre, easeOut(prog(t, P(0) + 1.4, P(0) + 1.9)), [0, 0.1, 0]);
      camera(cam, t, [
        { t: 0, p: [3.2, 9, 12.5], v: [0.6, 1, -1.5], fov: 36 },
        { t: P(0) + 1.8, p: [0.1, 2.7, -2.1], v: [2.4, 1.05, -3.7], fov: 40 },
        { t: P(1) + 0.6, p: [0.0, 2.8, -1.9], v: [2.3, 1.0, -3.7], fov: 40 },
        { t: F(1), p: [0.4, 7.6, 7.8], v: [0, 0.8, -2], fov: 40 },
      ]);
    },
  },
  { // 2.2 Le câble en coupe
    id: '2.2',
    textes: (P) => [
      { t: 0.3, txt: 'Le câble Ethernet en coupe', style: 'etiquettePlan' },
      { t: P(3), txt: 'Liaison filaire par câble RJ45.', ligne: 1 },
      { t: P(3) + 1.3, txt: 'Rapide, stable et sécurisée.', ligne: 2 },
    ],
    maj(t, P) {
      D.ambiance(1); D.studio(S); studioCable.visible = true;
      // La gaine recule pour montrer les fils.
      const ouv = easeInOut(prog(t, P(1) - 0.2, P(1) + 1.8));
      const xg = lerp(2.95, -0.6, ouv);
      gaine.scale.y = xg + 3; gaine.position.x = (xg - 3) / 2; bout.position.x = xg;
      const vite = t > P(3) ? 1.8 : 0.8;
      paquetsFils.forEach((p, k) => {
        p.visible = t > P(1) + 1;
        const u = ((t * vite * 0.32 + k * 0.25) % 1);
        fils[k * 2].getPoint(u, p.position); p.position.y += 0.08;
      });
      etiquette('gaine', 'Gaine', 'local').montrer(aGaine, easeOut(prog(t, P(1), P(1) + 0.5)) * (1 - fondu(t, P(3), 0.5)));
      etiquette('fils', '8 fils torsadés par paires', '').montrer(aFils, easeOut(prog(t, P(1) + 1.6, P(1) + 2.1)) * (1 - fondu(t, P(3), 0.5)));
      etiquette('prise', 'Prise RJ45', '').montrer(aPrise, easeOut(prog(t, P(2), P(2) + 0.5)) * (1 - fondu(t, P(3), 0.5)), [0, 0.15, 0]);
      camera(cam, t, [
        { t: 0, p: [-3.2, 41.9, 6.4], v: [-0.6, 40, 0], fov: 36 },
        { t: P(1) + 0.4, p: [-1.2, 41.6, 5.2], v: [0.4, 40, 0], fov: 36 },
        { t: P(2), p: [3.0, 41.5, 4.4], v: [2.4, 40.05, 0], fov: 36 },
        { t: P(2) + 2.4, p: [4.6, 41.2, 3.8], v: [3.0, 40.05, 0], fov: 36 },
        { t: P(3) + 1, p: [0.6, 42.6, 8.4], v: [0.6, 39.6, 0], fov: 38 },
      ]);
    },
  },
  { // 2.3 Inconvénient : installer les câbles
    id: '2.3', min: 8,
    textes: (P) => [{ t: P(0), txt: 'Inconvénient :', ligne: 1 }, { t: P(0) + 0.9, txt: 'il faut installer des câbles.', ligne: 2 }],
    maj(t, P) {
      cafeVisible(1); laMila.animer(t);
      cablesCafe(t, { flux0: 0, eclat: 0.5 + 0.5 * Math.sin(t * 4) * fondu(t, P(0), 0.4) });
      trous.forEach((g, k) => {
        const t0 = P(1) + 0.2 + k * 1.1;
        g.visible = t > t0;
        g.userData.poussiere.material.opacity = Math.max(0, 1 - (t - t0) / 1.2);
        g.userData.poussiere.scale.setScalar(0.6 + (t - t0) * 0.8);
        etiquette(`trou${k}`, 'Perçage', 'panne').montrer(g, easeOut(prog(t, t0, t0 + 0.4)), [0, 0.35, 0]);
      });
      camera(cam, t, [{ t: 0, p: [0.4, 7.6, 7.8], v: [0, 0.8, -2], fov: 40 }, { t: 3, p: [0, 12.5, 5.4], v: [0, 0, -1.9], fov: 42 }]);
    },
  },
  { // 2.4 La borne Wi-Fi
    id: '2.4',
    textes: (P) => [{ t: P(1), txt: 'Borne Wi-Fi : liaison sans fil par ondes radio.', ligne: 1 }, { t: P(3), txt: 'Grande liberté de déplacement !', ligne: 2 }],
    maj(t, P) {
      cafeVisible(1);
      cablesCafe(t, { flux0: 0 });
      tab.visible = true;
      marcher(t, P(0) + 0.4, P(2) + 2.6, TRAJET_TERRASSE); laMila.animer(t);
      const b = pop(t, P(1));
      borne.visible = b > 0.001; borne.scale.setScalar(Math.max(0.001, b) * 1.3);
      etiquette('borne', 'Borne Wi-Fi', 'local').montrer(borne.userData.ancre, easeOut(prog(t, P(1) + 0.3, P(1) + 0.8)), [0, 0.1, 0]);
      ondesWifi(t, P(1) + 0.4);
      const q = liaisonWifi(t, P(2));
      etiquette('signal', '', 'signal').montrer(tab.userData.ancre, fondu(t, P(2), 0.5), [0, 0.15, 0], htmlBarres(barres(q)));
      camera(cam, t, [
        { t: 0, p: [0.4, 7.6, 7.8], v: [0, 0.8, -2], fov: 40 },
        { t: P(1), p: [6.5, 6.4, 11.5], v: [1.2, 1.5, 1.5], fov: 40 },
        { t: P(3) + 2, p: [7.5, 6.8, 14.5], v: [1, 1.2, 3.2], fov: 40 },
      ]);
    },
  },
  { // 2.5 La distance
    id: '2.5', min: 11,
    textes: (P) => [{ t: P(0) + 1.5, txt: 'Plus on s\'éloigne…', ligne: 1 }, { t: P(1), txt: 'plus le débit baisse.', ligne: 2 }],
    maj(t, P) {
      cafeVisible(1); cablesCafe(t, { flux0: 0 }); tab.visible = true; borne.visible = true; borne.scale.setScalar(1.3);
      marcher(t, 0.3, P(2) + 1.3, TRAJET_LOIN); laMila.animer(t);
      ondesWifi(t, -10, { rayon: 9.5 });
      const q = liaisonWifi(t, -10);
      const perdu = q <= 0;
      etiquette('signal', '', 'signal').montrer(tab.userData.ancre, 1, [0, 0.15, 0], htmlBarres(barres(q), perdu ? ' Connexion perdue' : ''));
      eclairT.visible = perdu;
      if (perdu) { tab.getWorldPosition(eclairT.position); eclairT.position.y += 0.3; eclairT.material.opacity = 0.6 + 0.4 * Math.sin(t * 20); }
      // Caméra qui suit Mila de dos : la tablette au premier plan, le café et sa borne derrière.
      const m = laMila.position, k = easeInOut(prog(t, 0, 1.5));
      camera(cam, 0, [{ t: 0, p: [lerp(7.5, m.x - 5.0, k), lerp(6.8, 4.6, k), lerp(14.5, m.z + 5.2, k)], v: [lerp(1, m.x + 0.8, k), lerp(1.2, 1.3, k), lerp(3.2, m.z - 4, k)], fov: 40 }]);
    },
  },
  { // 2.6 Le mur de pierre (coupe)
    id: '2.6', min: 9,
    textes: (P) => [
      { t: 0.3, txt: 'Vue en coupe', style: 'etiquettePlan' },
      { t: P(0) + 1.6, txt: 'Les obstacles atténuent le signal.', ligne: 1 },
      { t: P(1), txt: 'Le débit du Wi-Fi est variable.', ligne: 2 },
    ],
    maj(t) {
      D.ambiance(1); D.studio(S); studioMur.visible = true;
      onde(t, fondu(t, 0.3, 0.8));
      paquetsMur.forEach((p, k) => {
        const u = ((t / 3.2 + k / 4) % 1), x = -4.6 + 9.4 * u;
        const absorbe = k % 2 === 1 && x > -0.2;
        p.visible = t > 0.6 && !absorbe;
        p.position.set(x, 0.8 + amplitude(x) * Math.sin(3.2 * x - 5 * t), 0.35);
      });
      etiquette('mur', 'Mur de pierre', '').montrer(aMur, fondu(t, 0.6, 0.4));
      etiquette('avant', '', 'signal').montrer(aAvant, fondu(t, 1.2, 0.4), [0, 0, 0], htmlBarres(4, ' Avant le mur'));
      etiquette('apres', '', 'signal').montrer(aApres, fondu(t, 1.8, 0.4), [0, 0, 0], htmlBarres(2, ' Derrière le mur'));
      camera(cam, t, [{ t: 0, p: [-1.2, 41.6, 11.5], v: [0, 40.5, 0], fov: 38 }, { t: 10, p: [1.0, 41.4, 10.8], v: [0, 40.5, 0], fov: 38 }]);
    },
  },
  { // 2.7 Résumons
    id: '2.7',
    textes: () => [{ t: 0.3, txt: 'Résumons', style: 'etiquettePlan' }],
    maj(t, P) {
      D.ambiance(1); D.studio(S); studioBilan.visible = true;
      [platG, platD].forEach((p, k) => { p.rotation.y = t * 0.1 * (k ? -1 : 1); });
      cablesB.forEach((c) => { c.regler({ p: 1 }); c.normal(); });
      paquetsB.forEach((p, k) => {
        if (k < 3) { const u = ((t / 1.6 + k / 3) % 1); cablesB[k].courbe.getPoint(k % 2 ? u : 1 - u, p.position); p.position.y += 0.1; p.position.add(studioBilan.position).sub(studioBilan.position); }
        else { const u = ((t / 1.8) % 1); p.position.lerpVectors(borneB.position, tabsB[Math.floor(t / 1.8) % 2].position, u); }
      });
      ondesB.forEach((o, k) => { const u = ((t / 2.2 + k / 3) % 1); o.scale.setScalar(0.3 + u * 3.6); o.material.uniforms.opacite.value = (1 - u) * 0.8; });
      const cg = `<h4>Commutateur (switch)</h4><p class="type">Liaison filaire : câble RJ45</p><p class="plus">Connexion très rapide, stable et sécurisée</p><p class="moins">Il faut installer des câbles</p>`;
      const cd = `<h4>Borne Wi-Fi</h4><p class="type">Liaison sans fil : ondes radio</p><p class="plus">Grande liberté de déplacement</p><p class="moins">Débit variable, sensible aux obstacles et à la distance</p>`;
      panneau('bilanG', cg, 'bilan').montrer(easeOut(prog(t, P(1) - 0.2, P(1) + 0.4)), 560, 560);
      panneau('bilanD', cd, 'bilan').montrer(easeOut(prog(t, P(2) - 0.2, P(2) + 0.4)), 1250, 560);
      camera(cam, t, [{ t: 0, p: [0, 44.6, 9.6], v: [0, 38.7, 0], fov: 40 }, { t: 25, p: [0, 44.3, 9.1], v: [0, 38.7, 0], fov: 40 }]);
    },
  },
  { // 2.8 Question
    id: '2.8', min: 8,
    textes: (P) => [{ t: P(0) - 0.2, txt: 'L\'ordinateur de gestion ne bouge jamais de son bureau. Câble ou Wi-Fi ? Pourquoi ?', style: 'question' }],
    maj(t) {
      cafeVisible(1); cablesCafe(t, { flux0: 0 }); borne.visible = true; borne.scale.setScalar(1.3);
      laMila.position.set(-3.25, 0, -3.1); laMila.rotation.y = -Math.PI / 2; laMila.animer(t);
      etiquette('ordi', 'Ordinateur de gestion', '').montrer(caf.appareils.ordinateur.userData.ancre, fondu(t, 0.6, 0.5), [0, 0.1, 0]);
      camera(cam, t, [{ t: 0, p: [-1.2, 3.5, 2.2], v: [-4.3, 1.7, -3.2], fov: 40 }, { t: 10, p: [-1.5, 3.4, 1.9], v: [-4.3, 1.7, -3.2], fov: 40 }]);
    },
  },
];

const vig = vignetteCollege({ wifi: true });
ctx.vignetteLegende.textContent = 'Câble : salles De Vinci et Pesquet · Wi-Fi : smartphones, tablettes, imprimante 3D';
ctx.definir(plans, {
  scene: vig.scene, cam: vig.cam, maj: vig.maj,
  alpha(i, t) { const p = plans[i]; return p.id === '2.7' ? fondu(t, p.P(3), 0.6) : 0; },
});
void lum; void clamp;
