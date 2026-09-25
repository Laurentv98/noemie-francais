// Renard Malin — le dressing de Roxy
// Les accessoires se gagnent en jouant (jamais en payant) : avec les étoiles, la flamme, les défis du jour,
// les étoiles d'or et la course. Roxy les porte partout : sur l'accueil, la carte, pendant les questions et dans la course.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // Le cagou, l'oiseau de Nouvelle-Calédonie (il ne vole pas, il court… comme Roxy !)
  const CAGOU = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M47 30 C58 13 76 9 92 15 C80 16 69 22 61 32 Z" fill="#B9C0C7"/>
    <path d="M50 34 C62 22 79 21 93 28 C81 29 70 32 63 38 Z" fill="#9DA5AD"/>
    <path d="M52 77 L50 93 M63 77 L65 93" stroke="#E0522B" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M43 94 L55 94 M60 94 L72 94" stroke="#E0522B" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="61" cy="63" rx="27" ry="19" fill="#DADEE2"/>
    <path d="M49 56 C62 45 83 49 90 64 C77 73 60 73 49 56 Z" fill="#AEB5BC"/>
    <path d="M61 58 L67 68 M69 56 L75 67 M77 57 L81 66" stroke="#868E96" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="40" cy="41" r="17" fill="#E6E9EC"/>
    <path d="M25 41 L7 46 L26 49 Z" fill="#E0522B"/>
    <circle cx="37" cy="39" r="6" fill="#B5472F"/>
    <circle cx="37" cy="39" r="3.3" fill="#2B1B12"/>
    <circle cx="35.3" cy="37.3" r="1.4" fill="#fff"/>
    <ellipse cx="45" cy="48" rx="3.6" ry="2.1" fill="#F7A0A6" opacity=".75"/>
  </svg>`;
  const CAGOU_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CAGOU);

  // Les conditions pour gagner un accessoire
  //   etoiles : le total des étoiles · flamme : la plus longue série de jours · defis : les défis du jour faits
  //   or : les étapes parfaites (étoile d'or) · course : les courses de Roxy terminées
  const ACCESSOIRES = [
    { id: 'noeud', place: 'tete', nom: 'Le nœud rose', emoji: '🎀', gagner: { etoiles: 5 } },
    { id: 'hibiscus', place: 'tete', nom: 'La fleur d’hibiscus', emoji: '🌺', gagner: { etoiles: 15 } },
    { id: 'lunettes-soleil', place: 'yeux', nom: 'Les lunettes de soleil', emoji: '🕶️', gagner: { etoiles: 30 } },
    { id: 'casquette', place: 'tete', nom: 'La casquette', emoji: '🧢', gagner: { etoiles: 50 } },
    { id: 'paille', place: 'tete', nom: 'Le chapeau de paille', emoji: '👒', gagner: { etoiles: 80 } },
    { id: 'masque', place: 'yeux', nom: 'Le masque de plongée', emoji: '🥽', gagner: { etoiles: 120 } },
    { id: 'magique', place: 'tete', nom: 'Le chapeau magique', emoji: '🎩', gagner: { etoiles: 170 } },
    { id: 'savante', place: 'yeux', nom: 'Les lunettes de savante', emoji: '👓', gagner: { etoiles: 230 } },
    { id: 'toque', place: 'tete', nom: 'La toque de diplômée', emoji: '🎓', gagner: { etoiles: 300 } },
    { id: 'couronne', place: 'tete', nom: 'La couronne', emoji: '👑', gagner: { etoiles: 400 } },
    { id: 'poisson', place: 'ami', nom: 'Le poisson du lagon', emoji: '🐠', gagner: { flamme: 3 } },
    { id: 'tortue', place: 'ami', nom: 'La tortue', emoji: '🐢', gagner: { defis: 3 } },
    { id: 'cagou', place: 'ami', nom: 'Le cagou', image: CAGOU_URL, gagner: { course: 1 } },
    { id: 'papillon', place: 'ami', nom: 'Le papillon', emoji: '🦋', gagner: { or: 5 } },
    { id: 'perruche', place: 'ami', nom: 'La perruche', emoji: '🦜', gagner: { flamme: 7 } },
    { id: 'dauphin', place: 'ami', nom: 'Le dauphin', emoji: '🐬', gagner: { defis: 10 } },
    { id: 'roussette', place: 'ami', nom: 'La roussette', emoji: '🦇', gagner: { or: 20 } },
  ];
  const PLACES = [
    { id: 'tete', nom: 'Chapeaux', icone: '🎩' },
    { id: 'yeux', nom: 'Lunettes', icone: '🕶️' },
    { id: 'ami', nom: 'Amis', icone: '🐢' },
  ];

  // Où poser les accessoires sur chaque dessin de Roxy (en % de l'image ; t : la taille en % de la largeur)
  const POSES = {
    ouais: { tete: { x: 53, y: 25, t: 30, r: -6 }, yeux: { x: 53.5, y: 44, t: 29, r: 0 }, ami: { x: 82, y: 82, t: 32, r: 0 } },
    reflechit: { tete: { x: 50, y: 23, t: 30, r: 6 }, yeux: { x: 52, y: 44, t: 29, r: 3 }, ami: { x: 85, y: 84, t: 32, r: 0 } },
  };
  // Les petits réglages de chaque accessoire (décalage en %, taille, rotation)
  const REGLAGES = {
    noeud: { dx: -12, dy: 3, t: 0.62, r: -22 },
    hibiscus: { dx: -13, dy: 4, t: 0.62, r: -12 },
    paille: { dy: -1, t: 1.2 },
    couronne: { dy: -1, t: 0.8 },
    magique: { dy: -4, t: 0.95 },
    toque: { dy: -2 },
    casquette: { dy: -1 },
    masque: { t: 1.05 },
  };

  const trouver = id => ACCESSOIRES.find(a => a.id === id);
  const SAIT_CQW = window.CSS?.supports?.('width', '1cqw') ?? false;

  // Les compteurs du joueur, pour savoir ce qu'il a gagné
  function compteurs(profil) {
    return {
      etoiles: P.totalEtoiles(profil),
      flamme: Math.max(P.flamme(profil).record || 0, P.flamme(profil).jours),
      defis: (profil.defis || []).length,
      or: Object.values(profil.etapes).filter(e => e.etoiles === 5).length,
      course: Object.values(profil.courses || {}).reduce((s, c) => s + (c.parties || 0), 0),
    };
  }

  function progresAccessoire(accessoire, c) {
    const [cle, besoin] = Object.entries(accessoire.gagner)[0];
    return { cle, besoin, fait: Math.min(c[cle], besoin), gagne: c[cle] >= besoin };
  }

  const estGagne = (profil, accessoire, c = compteurs(profil)) => progresAccessoire(accessoire, c).gagne;
  const gagnes = profil => { const c = compteurs(profil); return ACCESSOIRES.filter(a => estGagne(profil, a, c)).map(a => a.id); };

  function condition(accessoire, c) {
    const { cle, besoin, fait, gagne } = progresAccessoire(accessoire, c);
    const reste = besoin - fait;
    const textes = {
      etoiles: `Gagne ${besoin} ★` + (gagne ? '' : ` (encore ${reste})`),
      flamme: `Une flamme de ${besoin} jours de suite (${fait}/${besoin})`,
      defis: `Fais ${besoin} défis du jour (${fait}/${besoin})`,
      or: `Gagne ${besoin} étoiles d’or 🌟 (${fait}/${besoin})`,
      course: 'Termine une course de Roxy 🏁',
    };
    return { texte: textes[cle], part: fait / besoin, gagne };
  }

  // Le dessin d'un accessoire (un emoji, ou une image comme le cagou)
  const htmlDessin = a => (a.image ? `<img src="${a.image}" alt="">` : a.emoji);

  // ---------- Habiller Roxy ----------
  // Chaque dessin de Roxy est un cadre <div class="roxy" data-pose="ouais"> avec son image dedans
  // (sans profil, on montre la tenue telle quelle : pour la présentation de Roxy)
  function habiller(cadre, profil = P.profilActif(), tenue = profil?.tenue) {
    cadre.querySelectorAll('.accessoire').forEach(a => a.remove());
    if (!tenue) return;
    const pose = POSES[cadre.dataset.pose] || POSES.ouais;
    const c = profil ? compteurs(profil) : null;
    PLACES.forEach(({ id: place }) => {
      const a = trouver(tenue[place]);
      if (!a || a.place !== place || (profil && !estGagne(profil, a, c))) return;
      const base = pose[place];
      const reglage = place === 'ami' ? {} : (REGLAGES[a.id] || {});
      const span = document.createElement('span');
      span.className = `accessoire accessoire-${place}`;
      span.setAttribute('aria-hidden', 'true');
      span.style.cssText = `left:${base.x + (reglage.dx || 0)}%;top:${base.y + (reglage.dy || 0)}%;`
        + `--taille:${base.t * (reglage.t || 1)};--rotation:${base.r + (reglage.r || 0)}deg`;
      span.innerHTML = htmlDessin(a);
      // Les vieux iPad (avant iOS 16) ne connaissent pas l'unité « cqw » : on calcule la taille en pixels
      if (!SAIT_CQW && cadre.clientWidth) {
        const px = (base.t * (reglage.t || 1) / 100) * cadre.clientWidth;
        span.style.fontSize = px + 'px';
        span.querySelector('img')?.style.setProperty('width', px + 'px');
      }
      cadre.appendChild(span);
    });
  }

  // Change le dessin de Roxy (« ouais » ou « reflechit ») et remet ses accessoires
  RM.poserRoxy = function (cadre, pose) {
    if (typeof cadre === 'string') cadre = $(cadre);
    if (!cadre) return;
    cadre.dataset.pose = pose;
    cadre.querySelector('.roxy-image').src = `img/roxy-${pose}.png`;
    habiller(cadre);
  };

  RM.habillerToutesLesRoxy = function () {
    document.querySelectorAll('.ecran.actif .roxy[data-pose]:not([data-tenue-fixe])')
      .forEach(cadre => habiller(cadre, P.profilActif() || undefined));
  };

  // ---------- L'écran du dressing ----------
  let placeChoisie = 'tete';

  RM.ecrans.dressing = function () {
    const profil = P.profilActif();
    P.marquerVus(profil, gagnes(profil));
    dessinerDressing();
  };

  function dessinerDressing() {
    const profil = P.profilActif();
    const c = compteurs(profil);
    const tenue = profil.tenue || {};
    $('dressing-etoiles').innerHTML = `<span class="etoile gagnee">★</span> ${c.etoiles}`;
    habiller($('dressing-roxy'), profil);
    $('dressing-onglets').innerHTML = PLACES.map(p => {
      const nombre = ACCESSOIRES.filter(a => a.place === p.id && estGagne(profil, a, c)).length;
      const total = ACCESSOIRES.filter(a => a.place === p.id).length;
      return `<button class="onglet-dressing${p.id === placeChoisie ? ' actif' : ''}" data-place="${p.id}" aria-pressed="${p.id === placeChoisie}">
        ${p.icone} ${p.nom} <small>${nombre}/${total}</small></button>`;
    }).join('');

    const porte = tenue[placeChoisie];
    $('dressing-grille').innerHTML = `
      <button class="accessoire-choix${!porte ? ' porte' : ''}" data-enlever="${placeChoisie}">
        <span class="accessoire-dessin">🚫</span><span class="accessoire-nom">Rien</span>
      </button>`
      + ACCESSOIRES.filter(a => a.place === placeChoisie).map(a => {
        const cond = condition(a, c);
        if (!cond.gagne) {
          return `<button class="accessoire-choix verrouille" data-verrouille="${a.id}">
            <span class="accessoire-dessin">${htmlDessin(a)}<span class="cadenas">🔒</span></span>
            <span class="accessoire-nom">${a.nom}</span>
            <span class="accessoire-condition">${cond.texte}</span>
            <span class="accessoire-barre"><span style="width:${Math.round(cond.part * 100)}%"></span></span>
          </button>`;
        }
        return `<button class="accessoire-choix${porte === a.id ? ' porte' : ''}" data-accessoire="${a.id}" aria-pressed="${porte === a.id}">
          <span class="accessoire-dessin">${htmlDessin(a)}</span>
          <span class="accessoire-nom">${a.nom}</span>
          ${porte === a.id ? '<span class="accessoire-porte">✔ Roxy le porte</span>' : ''}
        </button>`;
      }).join('');
  }

  $('dressing-onglets').addEventListener('click', e => {
    const bouton = e.target.closest('[data-place]');
    if (!bouton) return;
    placeChoisie = bouton.dataset.place;
    RM.sons.jouer('clic');
    dessinerDressing();
  });

  $('dressing-grille').addEventListener('click', e => {
    const profil = P.profilActif();
    const bouton = e.target.closest('.accessoire-choix');
    if (!bouton) return;
    if (bouton.dataset.verrouille) {
      const a = trouver(bouton.dataset.verrouille);
      RM.bulleInfo(`🔒 ${a.nom}&nbsp;: ${condition(a, compteurs(profil)).texte}.`);
      return;
    }
    const id = bouton.dataset.accessoire || null;
    const place = id ? trouver(id).place : bouton.dataset.enlever;
    P.habillerRoxy(profil, place, (profil.tenue || {})[place] === id ? null : id);
    RM.sons.jouer(id ? 'cadeau' : 'clic');
    dessinerDressing();
    const roxy = $('dressing-roxy');
    roxy.classList.remove('essayage');
    roxy.getBoundingClientRect();
    roxy.classList.add('essayage');
  });

  // ---------- Pour les autres écrans ----------
  RM.dressing = {
    ACCESSOIRES,
    CAGOU,
    CAGOU_URL,
    trouver,
    gagnes,
    // Montrer une tenue sans vérifier qu'elle est gagnée (la présentation de Roxy)
    montrer: (cadre, tenue) => habiller(cadre, null, tenue),
    compteurs,
    // Les accessoires que le joueur a gagnés mais pas encore vus dans le dressing
    nouveaux: profil => gagnes(profil).filter(id => !(profil.vus || []).includes(id)),
    // Le message de fin de partie quand une partie fait gagner un accessoire
    htmlCadeaux(ids) {
      if (!ids.length) return '';
      const liste = ids.map(trouver);
      const noms = liste.map(a => `${a.image ? '' : a.emoji + ' '}${a.nom.replace(/^(Le|La|Les) /, m => m.toLowerCase())}`).join(', ');
      return `<span class="deblocage cadeau">🎁 ${liste.length > 1 ? 'Nouveaux accessoires' : 'Nouvel accessoire'}&nbsp;: ${noms}&nbsp;!
        <button class="bouton-lien" data-aller="dressing">Va habiller Roxy 🎩</button></span>`;
    },
    // La tenue de Roxy pour la course en 3D : un dessin (canvas) par accessoire porté
    async imagesPourLaCourse(profil) {
      const tenue = profil?.tenue || {};
      const c = profil ? compteurs(profil) : null;
      const resultat = {};
      for (const place of ['tete', 'yeux', 'ami']) {
        const a = trouver(tenue[place]);
        if (!a || a.place !== place || !estGagne(profil, a, c)) continue;
        resultat[place] = { accessoire: a, reglage: REGLAGES[a.id] || {}, canvas: await dessinCanvas(a) };
      }
      return resultat;
    },
  };

  // Un accessoire dessiné sur un petit canvas (pour en faire une image dans la scène 3D)
  function dessinCanvas(a) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!a.image) {
      ctx.font = '104px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.emoji, 64, 70);
      return Promise.resolve(canvas);
    }
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 4, 4, 120, 120); resolve(canvas); };
      img.onerror = () => resolve(canvas);
      img.src = a.image;
    });
  }
})();
