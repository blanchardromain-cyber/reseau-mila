// Moteur commun des chapitres : rendu Three.js, lecteur de plans (clic, clavier), voix off,
// textes à l'écran, étiquettes accrochées aux objets 3D, vignette « Au collège ».
// Tout ce qui s'affiche dépend seulement du plan courant et de son temps t : un état (?plan=4&t=8)
// se reproduit à l'identique, ce qui permet les captures de contrôle.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const W = 1920, H = 1080;

// ---------- outils d'animation ----------
// Un NaN dans une intensité lumineuse noircit des blocs entiers de l'image (halo) : clamp le refuse.
export const clamp = (x, a = 0, b = 1) => (Number.isNaN(x) ? a : Math.max(a, Math.min(b, x)));
export const lerp = (a, b, u) => a + (b - a) * u;
// Instant « jamais » (Infinity) accepté : avant t0 → 0, après t1 → 1.
export const prog = (t, t0, t1) => (!(t1 - t0 > 0) || !Number.isFinite(t1 - t0) ? (t >= t1 ? 1 : 0) : clamp((t - t0) / (t1 - t0)));
export const doux = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
export const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
export const easeInOut = (u) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const rebond = (u) => { u = clamp(u); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
export const pop = (t, t0, d = 0.45) => (t <= t0 ? 0 : rebond((t - t0) / d));
export const fondu = (t, t0, d = 0.5) => prog(t, t0, t0 + d);

// Caméra : clés {t, p:[x,y,z], v:[x,y,z] (point visé), fov}, interpolation douce entre deux clés.
export function camera(cam, t, cles) {
  let i = 0;
  while (i < cles.length - 2 && t > cles[i + 1].t) i++;
  const a = cles[i], b = cles[Math.min(i + 1, cles.length - 1)];
  const u = a === b ? 0 : easeInOut(prog(t, a.t, b.t));
  cam.position.set(lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u));
  const fa = a.fov ?? 38, fb = b.fov ?? fa;
  cam.fov = lerp(fa, fb, u); cam.updateProjectionMatrix();
  cam.lookAt(lerp(a.v[0], b.v[0], u), lerp(a.v[1], b.v[1], u), lerp(a.v[2], b.v[2], u));
}

const el = (tag, cls, parent, html) => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e); return e;
};

// ---------- chapitre ----------
// opts : { numero, titre, plans:[{id, min?, fondu?, textes?, maj(t, P, F)}], base(), vignette? }
export function lancerChapitre(opts) {
  const params = new URLSearchParams(location.search);
  const REPERES = window.__REPERES || {};
  const VOIX = window.__VOIX || {};
  let plans = [];

  // Scène (1920×1080 mis à l'échelle de la fenêtre, bandes noires si le format diffère)
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('gl');
  const ui = document.getElementById('ui');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: params.has('capture') });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 600);

  let qualite = params.has('basse') ? 0 : 2; // 2 : halo ; 1 : sans halo ; 0 : sans halo, définition réduite
  let pr = 1;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.65, 0.5, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let echelle = 1;
  function redimensionner() {
    echelle = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${echelle})`;
    pr = Math.min(window.devicePixelRatio || 1, 1.5) * echelle * (qualite === 0 ? 0.7 : 1);
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    composer.setPixelRatio(pr);
    composer.setSize(W, H);
  }
  addEventListener('resize', redimensionner);
  redimensionner();

  // ---------- interface ----------
  const calqueEtiq = el('div', 'etiquettes', ui);
  const calqueTexte = el('div', 'textes', ui);
  const bandeau = el('div', 'bandeau', ui, `<b>Chapitre ${opts.numero}</b> · ${opts.titre}`);
  const points = el('div', 'points', ui);
  const titreDeco = el('div', 'titre-deco', ui,
    `${window.__LOGO ? `<div class="logo"><img src="${window.__LOGO}" alt="Collège Saint-Pierre"></div>` : ''}<div class="auteur">Romain Blanchard, professeur de Technologie</div>`);
  const voile = el('div', 'voile', ui);
  const aide = el('div', 'aide', ui, '<kbd>→</kbd> ou clic : suivant · <kbd>←</kbd> retour · <kbd>R</kbd> rejouer · <kbd>M</kbd> voix · <kbd>L</kbd> légende · <kbd>F</kbd> plein écran');
  const legende = el('div', 'legende', ui);
  const LEG = [
    ['donnees', 'Données', 'colis qui circulent'],
    ['local', 'Réseau local', 'câbles, commutateur, Wi-Fi, serveur'],
    ['internet', 'Internet', 'ligne, modem, routeur'],
    ['securite', 'Sécurité', 'passerelle, pare-feu, antivirus'],
    ['panne', 'Panne', 'appareil éteint, câble coupé'],
  ];
  el('h3', '', legende, 'Le code couleur');
  const lignesLeg = LEG.map(([c, nom, ex]) => el('div', 'ligne', legende, `<span class="pastille ${c}"></span><b>${nom}</b><small>${ex}</small>`));
  const voixIcone = el('div', 'muet', ui, 'Voix coupée (M)');
  const vignetteCadre = el('div', 'vignette', ui, '<span>Au collège</span><em></em>');
  const vignetteLegende = vignetteCadre.querySelector('em');
  const partage = el('div', 'partage', ui, '<i></i><span class="g"></span><span class="d"></span>');
  const fin = el('div', 'fin', ui);

  // Étiquettes : remises à zéro à chaque image ; le plan montre celles dont il a besoin.
  const etiquettes = new Map();
  const v3 = new THREE.Vector3();
  function etiquette(cle, html, style = '') {
    let e = etiquettes.get(cle);
    if (!e) { e = { div: el('div', `etiq ${style}`, calqueEtiq, html), alpha: 0, objet: null, decal: [0, 0, 0], html }; etiquettes.set(cle, e); }
    return {
      montrer(objet, alpha = 1, decal = [0, 0, 0], htmlNouveau) {
        e.objet = objet; e.alpha = alpha; e.decal = decal;
        if (htmlNouveau != null && htmlNouveau !== e.html) { e.div.innerHTML = htmlNouveau; e.html = htmlNouveau; }
      },
    };
  }
  // Panneaux fixes (coordonnées de l'écran 1920×1080), remis à zéro à chaque image comme les étiquettes.
  const panneaux = new Map();
  function panneau(cle, html, style = '') {
    let p = panneaux.get(cle);
    if (!p) { p = { div: el('div', `panneau ${style}`, calqueEtiq, html), alpha: 0, html }; panneaux.set(cle, p); }
    return {
      montrer(alpha = 1, x = W / 2, y = H / 2, htmlNouveau) {
        p.alpha = alpha;
        if (htmlNouveau != null && htmlNouveau !== p.html) { p.div.innerHTML = htmlNouveau; p.html = htmlNouveau; }
        p.div.style.transform = `translate(${x}px, ${y}px) translate(-50%, 0) translateY(${(1 - alpha) * 24}px)`;
      },
    };
  }
  function placerPanneaux() {
    for (const p of panneaux.values()) { p.div.style.opacity = p.alpha; p.div.style.visibility = p.alpha > 0.001 ? 'visible' : 'hidden'; }
  }
  function placerEtiquettes() {
    placerPanneaux();
    for (const e of etiquettes.values()) {
      if (e.alpha <= 0.001 || !e.objet) { e.div.style.opacity = 0; e.div.style.visibility = 'hidden'; continue; }
      e.objet.getWorldPosition(v3); v3.x += e.decal[0]; v3.y += e.decal[1]; v3.z += e.decal[2];
      v3.project(cam);
      const x = (v3.x + 1) / 2 * W, y = (1 - v3.y) / 2 * H;
      e.div.style.visibility = v3.z < 1 ? 'visible' : 'hidden';
      e.div.style.opacity = e.alpha;
      e.div.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%) scale(${0.85 + 0.15 * e.alpha})`;
    }
  }

  // Textes : [{t, txt, ligne: 1|2, style}] ; les mots arrivent un par un, calculés depuis t.
  const blocs = new Map();
  function afficherTextes(plan, t) {
    const liste = plan.textesCalcules || [];
    const actifs = new Set();
    for (const [i, tx] of liste.entries()) {
      const cle = `${plan.id}#${i}`;
      actifs.add(cle);
      let b = blocs.get(cle);
      if (!b) {
        const div = el('div', `texte ${tx.style || 'bas'} l${tx.ligne || 1}`, calqueTexte);
        const mots = tx.txt.split(' ').map((m) => el('span', 'mot', div, m + ' '));
        b = { div, mots }; blocs.set(cle, b);
      }
      const fin = tx.fin ?? Infinity;
      b.div.style.display = t >= tx.t - 0.01 && t < fin ? '' : 'none';
      b.mots.forEach((m, k) => {
        const u = easeOut(prog(t, tx.t + k * 0.07, tx.t + k * 0.07 + 0.4));
        m.style.opacity = u; m.style.transform = `translateY(${(1 - u) * 18}px)`; m.style.filter = `blur(${(1 - u) * 6}px)`;
      });
    }
    for (const [cle, b] of blocs) if (!actifs.has(cle)) b.div.style.display = 'none';
  }

  // ---------- voix ----------
  let muet = params.has('muet');
  let audio = null;
  function jouerVoix(id) {
    if (audio) { audio.pause(); audio = null; }
    if (muet || !VOIX[id] || params.has('t')) return;
    audio = new Audio(VOIX[id]);
    audio.play().catch(() => {});
  }

  // ---------- lecteur ----------
  let indice = 0;
  const tFige = params.has('t') ? parseFloat(params.get('t')) : null;
  let debut = performance.now();
  let pause = false, tPause = 0;
  let demarre = params.has('t') || params.has('auto') || params.has('plan');
  let enFin = false;

  const ctx = { THREE, scene, cam, renderer, etiquette, panneau, lignesLeg, legende, vignetteCadre, vignetteLegende, partage, W, H, params, definir };

  function tempsPlan() {
    if (tFige != null) return tFige === -1 ? plans[indice].duree : tFige;
    if (!demarre) return 0;
    const t = ((pause ? tPause : performance.now()) - debut) / 1000;
    return Math.min(t, plans[indice].duree);
  }
  // « cible » est le plan demandé, même si le fondu ne l'a pas encore affiché : deux appuis rapides
  // (double-clic, poste lent) avancent bien de deux plans, dans l'ordre, sans changement en retard.
  let cible = 0, minuteur = null;
  function aller(n, { transition = true } = {}) {
    if (n < 0) return;
    clearTimeout(minuteur); minuteur = null;
    if (n >= plans.length) { cible = plans.length; montrerFin(); return; }
    cible = n;
    enFin = false; fin.classList.remove('visible');
    const change = () => {
      minuteur = null;
      indice = n; debut = performance.now(); pause = false;
      jouerVoix(plans[n].id);
      [...points.children].forEach((p, k) => p.className = k < n ? 'vu' : k === n ? 'actif' : '');
    };
    if (transition && plans[n].fondu !== false) {
      voile.style.transition = 'opacity .25s'; voile.style.opacity = 1;
      minuteur = setTimeout(() => { change(); voile.style.transition = 'opacity .45s'; voile.style.opacity = 0; }, 260);
    } else { voile.style.opacity = 0; change(); }
  }
  function montrerFin() {
    if (audio) { audio.pause(); audio = null; }
    enFin = true;
    const suiv = window.__SUIVANT;
    fin.innerHTML = `<h2>Fin du chapitre ${opts.numero}</h2>
      <div class="boutons">
        <button data-a="rejouer">↺ Rejouer le chapitre</button>
        <a class="bouton" href="index.html">☰ Tous les chapitres</a>
        ${suiv ? `<a class="bouton principal" href="${suiv}">Chapitre suivant ▶</a>` : ''}
      </div>`;
    fin.classList.add('visible');
    fin.querySelector('[data-a=rejouer]').onclick = (e) => { e.stopPropagation(); aller(0); };
  }
  function suivant() {
    if (enFin) return;
    if (!demarre) { demarre = true; aide.classList.add('cache'); debut = performance.now(); jouerVoix(plans[indice].id); return; }
    aller(cible + 1);
  }
  function precedent() {
    if (enFin) { enFin = false; fin.classList.remove('visible'); aller(plans.length - 1); return; }
    // ← revient toujours au plan précédent (R rejoue le plan courant).
    if (cible > 0) aller(cible - 1); else aller(0, { transition: false });
  }

  const demarrer = el('button', 'demarrer', ui, '▶ Commencer');
  demarrer.onclick = (e) => { e.stopPropagation(); demarrer.remove(); suivant(); };
  if (demarre) demarrer.remove();

  stage.parentElement.addEventListener('click', (e) => {
    if (e.target.closest('button, a')) return;
    if (!demarre) { demarrer.remove(); }
    suivant();
  });
  addEventListener('keydown', (e) => {
    const k = e.key;
    if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(k)) { e.preventDefault(); if (!demarre) demarrer.remove(); suivant(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); precedent(); }
    else if (k === 'r' || k === 'R') aller(cible, { transition: false });
    else if (k === 'm' || k === 'M') {
      muet = !muet; voixIcone.classList.toggle('visible', muet);
      if (muet && audio) { audio.pause(); audio = null; }
    } else if (k === 'l' || k === 'L') legende.classList.toggle('force');
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
    } else if (k === 'p' || k === 'P') {
      if (!pause) { pause = true; tPause = performance.now(); audio?.pause(); }
      else { pause = false; debut += performance.now() - tPause; audio?.play().catch(() => {}); }
    } else if (k === 'Home') aller(0);
  });

  // ---------- vignette « Au collège » (deuxième scène, en coin) ----------
  const VG = { x: 1372, y: 150, w: 500, h: 300 };
  // Une vignette peut aussi occuper la moitié droite de l'écran (écran partagé) : rect() renvoie alors
  // {x, y, w, h, cadre: false} et partage() l'opacité du séparateur et des deux titres.
  function rendreVignette(t) {
    const v = opts.vignette;
    const a = v ? v.alpha(indice, t) : 0;
    const R = (v && v.rect && v.rect(indice, t)) || VG;
    vignetteCadre.style.opacity = R.cadre === false ? 0 : a;
    partage.style.opacity = v && v.partage ? v.partage(indice, t) : 0;
    if (!v || a <= 0.01) return;
    v.maj(t, indice);
    if (v.cam.aspect !== R.w / R.h) { v.cam.aspect = R.w / R.h; v.cam.updateProjectionMatrix(); }
    // Unités logiques (1920×1080) : le renderer applique lui-même le pixelRatio.
    const y = H - R.y - R.h;
    renderer.setRenderTarget(null);
    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setScissor(R.x, y, R.w, R.h);
    renderer.setViewport(R.x, y, R.w, R.h);
    renderer.clear(true, true, true);
    renderer.render(v.scene, v.cam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.autoClear = true;
  }

  // ---------- qualité adaptative ----------
  const mesures = [];
  let derniere = performance.now();
  function surveiller() {
    const now = performance.now(), dt = now - derniere; derniere = now;
    if (tFige != null || document.hidden || qualite === 0) return;
    mesures.push(dt);
    if (mesures.length < 90) return;
    const moy = mesures.slice(10).reduce((s, x) => s + x, 0) / (mesures.length - 10);
    mesures.length = 0;
    if (moy > 30) { qualite -= 1; if (qualite === 0) redimensionner(); }
  }

  // ---------- boucle ----------
  let pret = false;
  function image() {
    const plan = plans[indice];
    const t = tempsPlan();
    for (const e of etiquettes.values()) e.alpha = 0;
    for (const p of panneaux.values()) p.alpha = 0;
    legende.classList.remove('plan');
    opts.base(ctx);
    plan.maj(t, plan.P, plan.F, ctx);
    if (qualite === 2) composer.render(); else renderer.render(scene, cam);
    rendreVignette(t);
    placerEtiquettes();
    afficherTextes(plan, t);
    aide.style.opacity = demarre ? 0 : 1;
    bandeau.style.opacity = indice === 0 ? 0 : 1;
    titreDeco.style.opacity = indice === 0 ? 1 : 0;
    if (params.has('auto') && tFige == null && t >= plan.duree && !enFin) aller(indice + 1, { transition: false });
    if (!pret) { pret = true; document.body.dataset.pret = '1'; }
  }
  function boucle() { surveiller(); image(); requestAnimationFrame(boucle); }

  // Les plans sont donnés après la construction de la scène (ils utilisent ses objets).
  function definir(liste, vignette) {
    plans = liste; opts.vignette = vignette;
    for (const p of plans) {
      const r = REPERES[p.id] || { fin: 4, phrases: [[0.4, 4]] };
      p.reperes = r;
      p.P = (k) => (r.phrases[Math.min(k, r.phrases.length - 1)] || [0, 0])[0];
      p.F = (k) => (r.phrases[Math.min(k, r.phrases.length - 1)] || [0, 0])[1];
      p.duree = Math.max(p.min ?? 0, r.fin + 1.2);
      p.textesCalcules = typeof p.textes === 'function' ? p.textes(p.P, p.F) : p.textes || [];
      el('i', '', points);
    }
    indice = Math.max(0, Math.min(plans.length - 1, (parseInt(params.get('plan'), 10) || 0)));
    cible = indice;
    [...points.children].forEach((p, k) => p.className = k < indice ? 'vu' : k === indice ? 'actif' : '');
    if (demarre && tFige == null) jouerVoix(plans[indice].id);
    if (tFige != null) { image(); requestAnimationFrame(() => { image(); document.body.dataset.fige = '1'; }); }
    else requestAnimationFrame(boucle);
    if (params.has('capture')) window.__debug = { scene, cam, image };
    window.__lecteur = { aller, suivant, precedent, duree: () => plans[indice].duree, etat: () => ({ indice, t: tempsPlan(), plans: plans.length, enFin, qualite }) };
  }
  return ctx;
}
