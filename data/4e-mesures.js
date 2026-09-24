// Renard Malin — Maths, niveau 4e : les 6 étapes du Moulin des Mesures
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Les figures sont dessinées avec des longueurs qui « tombent juste ».
// Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. pyramides et cônes · 2. les aires (révision) · 3. la vitesse moyenne · 4. convertir des vitesses ·
// 5. débits et prix · 6. du nano au giga

(function () {
  const {
    ESPACE, MOINS, entier, parmi, decimal, net, ecrire, mesure, euros, decimalesDe, lireNombre, egaux,
    puissance, puissanceTexte, choix, nombre, vraiFaux, ajouterEtape, figures,
  } = RM.maths;
  const F = figures; // les dessins : F.segment, F.polygone, F.angleDroit…

  // ======================================================================
  // Les petits outils communs à toutes les étapes
  // ======================================================================
  // Des prénoms, avec le pronom qui va avec (pour écrire « parcourt-elle » ou « parcourt-il »)
  const PRENOMS = [['Léa', 'elle'], ['Tom', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Inès', 'elle'],
    ['Sami', 'il'], ['Lina', 'elle'], ['Noé', 'il'], ['Mamie', 'elle'], ['Papi', 'il']];
  // Vrai une fois sur deux (ou avec la probabilité donnée)
  const auHasard = (probabilite = 0.5) => Math.random() < probabilite;
  // Une majuscule au début d’une phrase
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Des guillemets français, avec des espaces qui ne se coupent pas
  const guillemets = texte => `«${ESPACE}${texte}${ESPACE}»`;
  // Les signes pour comparer (en HTML, < et > s’écrivent &lt; et &gt;)
  const SIGNES = { '<': '&lt;', '>': '&gt;', '=': '=' };
  const signe = (a, b) => (net(a) < net(b) ? '<' : net(a) > net(b) ? '>' : '=');
  // Un nombre « qui tombe juste » : positif, avec au plus max chiffres après la virgule (pas 6,666…)
  const propre = (x, max = 2) => Number.isFinite(x) && net(x) > 0 && decimalesDe(x) <= max;
  // Des longueurs, pour écrire plus court
  const cm = x => mesure(x, 'cm');

  // Les pièges valables : sans doublons, sans les valeurs vides ou négatives, sans ceux qui valent autant que la réponse,
  // et sans les nombres qui ont trop de chiffres après la virgule. Quand les boutons sont des nombres, le moteur choisit
  // ensuite lui-même parmi eux, pour que la bonne réponse ne soit pas toujours à la même place : on lui en donne 5 ou 6,
  // des plus petits et des plus grands que la réponse.
  function meilleursPieges(reponse, pieges, maxDecimales = 3) {
    const ecrit = v => (typeof v === 'number' ? ecrire(v) : String(v));
    const valeurReponse = lireNombre(ecrit(reponse));
    const vus = new Set([ecrit(reponse)]);
    const gardes = [];
    pieges.forEach(p => {
      if (p === null || p === undefined || vus.has(ecrit(p))) return;
      if (typeof p === 'number' && (!(p > 0) || decimalesDe(p) > maxDecimales)) return;
      if (egaux(lireNombre(ecrit(p)), valeurReponse) && ecrit(p).replace(/[\d\s,]/g, '') === ecrit(reponse).replace(/[\d\s,]/g, '')) return;
      vus.add(ecrit(p));
      gardes.push(p);
    });
    return gardes;
  }

  // Refaire une question tant que la bonne réponse se devine à sa forme : le seul bouton avec une virgule,
  // ou le seul sans virgule (on essaie 30 fois, puis on garde la dernière)
  function sansIndiceDeForme(fabriquer) {
    let q;
    for (let essai = 0; essai < 30; essai++) {
      q = fabriquer();
      if (!q.choix || q.choix.length < 3) return q;
      const aUneVirgule = c => /\d,\d/.test(c);
      const avec = q.choix.filter(aUneVirgule).length;
      const seul = aUneVirgule(q.reponse) ? avec === 1 : q.choix.length - avec === 1;
      if (!seul) return q;
    }
    return q;
  }

  // Une question à boutons (des nombres) où l’erreur classique dont parle l’explication est proposée à coup sûr
  // (l’option garder du moteur), trois fois sur quatre. Cette erreur est toujours du même côté de la réponse : la 4e fois,
  // on prend trois pièges de l’autre côté (s’il y en a), pour que la réponse puisse aussi être au bout où l’erreur
  // l’empêcherait d’être (sinon, on devinerait par exemple que le plus petit bouton n’est jamais le bon).
  function choixAvecErreur(options, erreur, autres) {
    const valeur = v => lireNombre(typeof v === 'number' ? ecrire(v) : String(v));
    const [r, e] = [valeur(options.reponse), valeur(erreur)];
    const valables = meilleursPieges(options.reponse, autres).filter(p => !egaux(valeur(p), e));
    const opposes = valables.filter(p => (valeur(p) - r) * (e - r) < 0);
    return sansIndiceDeForme(() => (auHasard(0.25) && opposes.length >= 3
      ? choix({ ...options, pieges: RM.melanger(opposes).slice(0, 3) })
      : choix({ ...options, garder: [erreur], pieges: valables })));
  }

  // Un vrai ou faux pris dans une liste de [énoncé, vrai ?, explication] : on choisit d’abord la réponse,
  // pour avoir autant de « Vrai » que de « Faux »
  function vraiFauxDans(liste, vrai) {
    const [enonce, , explication] = parmi(liste.filter(([, v]) => v === vrai));
    return vraiFaux({ enonce, vrai, explication });
  }

  // Multiplier par 10, 100, 1 000… (k rangs) ; si k est négatif, on divise
  const decaler = (x, k) => net(k >= 0 ? x * 10 ** k : x / 10 ** -k);

  // π, comme dans les exercices : π ≈ 3,14 ; et une valeur exacte : avecPi(12) → « 12π »
  const PI = 3.14;
  const foisPi = x => net(PI * x);
  const avecPi = n => (net(n) === 1 ? 'π' : `${ecrire(n)}π`);

  // Une durée en minutes, écrite en heures et minutes : duree(135) → « 2 h 15 min »
  function duree(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h ? `${h}${ESPACE}h` : '', m ? `${m}${ESPACE}min` : ''].filter(Boolean).join(ESPACE);
  }
  // La même durée en heures, avec une virgule : enHeures(135) → 2,25
  const enHeures = minutes => net(minutes / 60);

  // ======================================================================
  // Les outils pour dessiner les figures
  // ======================================================================
  const unitaire = (A, B) => {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
    return [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
  };
  const milieu = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const centre = points => [0, 1].map(i => points.reduce((s, p) => s + p[i], 0) / points.length);
  const r1 = x => Math.round(x * 10) / 10;
  const xy = P => `${r1(P[0])} ${r1(P[1])}`;
  // Une hauteur : en pointillés épais. Une arête cachée, un trait de découpe : en pointillés fins.
  const pointilles = (A, B) => F.segment(A, B, 'fig-trait fig-cache');
  const traitFin = (A, B) => F.segment(A, B, 'fig-fin fig-cache');
  const traitCache = (A, B) => F.segment(A, B, 'fig-marque fig-cache');
  // Une longueur écrite à un endroit précis (ancre : 'start', 'middle' ou 'end')
  const texteLongueur = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-texte fig-petit-gras', ancre });

  // Des points donnés en cm (y vers le HAUT, comme en maths), placés dans un dessin de largeur × hauteur pixels
  // (y vers le bas) : à l’échelle, au milieu, avec des marges pour écrire les longueurs
  function cadrer(points, largeur, hauteur, { margeX = 80, margeY = 45, echelleMax = 45 } = {}) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const [xmin, xmax, ymin, ymax] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const s = Math.min(echelleMax, (largeur - 2 * margeX) / Math.max(xmax - xmin, 0.1), (hauteur - 2 * margeY) / Math.max(ymax - ymin, 0.1));
    const ox = largeur / 2 - s * (xmin + xmax) / 2;
    const oy = hauteur / 2 + s * (ymin + ymax) / 2;
    return points.map(([x, y]) => [ox + s * x, oy - s * y]);
  }

  // Écrire une longueur le long d’un côté [AB], à l’extérieur de la figure (G : un point à l’intérieur)
  function longueurDehors(A, B, texte, G) {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u = [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
    const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    // F.longueur écrit du côté (−u[1], u[0]) ; si ce côté va vers G, on prend l’autre
    const versG = (G[0] - M[0]) * -u[1] + (G[1] - M[1]) * u[0];
    // Plus loin d’un côté presque vertical : le texte est plus large que haut
    return F.longueur(A, B, texte, { cote: versG > 0 ? -1 : 1, distance: 18 + 26 * Math.abs(u[1]) });
  }

  // La boîte [x0, y0, x1, y1] qu’occupe un texte écrit par F.longueur au point P, écarté du trait dans la direction n
  // (environ 10 pixels par caractère)
  function boiteTexte(P, n, texte) {
    const l = texte.length * 10;
    const ancre = n[0] > 0.35 ? 'start' : (n[0] < -0.35 ? 'end' : 'middle');
    const y = P[1] + (n[1] > 0.35 ? 7 : (n[1] < -0.35 ? -7 : 0));
    const x0 = ancre === 'start' ? P[0] : (ancre === 'end' ? P[0] - l : P[0] - l / 2);
    return [x0, y - 10, x0 + l, y + 10];
  }
  // La plus petite distance entre des segments et une boîte (0 s’ils la traversent)
  function distanceAuxTraits(boite, traits) {
    let d = Infinity;
    traits.forEach(([A, B]) => {
      for (let i = 0; i <= 24; i++) {
        const x = A[0] + (B[0] - A[0]) * i / 24;
        const y = A[1] + (B[1] - A[1]) * i / 24;
        d = Math.min(d, Math.hypot(Math.max(boite[0] - x, 0, x - boite[2]), Math.max(boite[1] - y, 0, y - boite[3])));
      }
    });
    return d;
  }
  // Écrire la longueur d’une hauteur [MH] (M : le sommet, H : le pied) à côté des pointillés, là où il y a le plus
  // de place (le plus loin des traits de la figure). eviter : un point ; on n’écrit pas de son côté.
  // Renvoie le texte, et un point du côté opposé (pour y dessiner le petit carré de l’angle droit).
  function longueurHauteur(M, H, texte, traits, eviter = null) {
    const u = unitaire(H, M);
    const l = Math.hypot(M[0] - H[0], M[1] - H[1]);
    let meilleure = null;
    let meilleurScore = -Infinity;
    [0.5, 0.4, 0.6, 0.3, 0.7].forEach(t => [1, -1].forEach(cote => {
      const n = [-u[1] * cote, u[0] * cote];
      if (eviter && n[0] * (eviter[0] - H[0]) + n[1] * (eviter[1] - H[1]) > 0) return;
      // (pas trop près du pied, où est dessiné l’angle droit)
      if (t * l < 30 && meilleure) return;
      const C = [H[0] + u[0] * l * t, H[1] + u[1] * l * t];
      const score = distanceAuxTraits(boiteTexte([C[0] + n[0] * 10, C[1] + n[1] * 10], n, texte), traits);
      if (score > meilleurScore + 3) {
        meilleurScore = score;
        meilleure = { t, cote, n };
      }
    }));
    const { t, cote, n } = meilleure;
    const B = [H[0] + u[0] * l * 2 * t, H[1] + u[1] * l * 2 * t];
    return { html: F.longueur(H, B, texte, { cote, distance: 10 }), oppose: [H[0] - n[0] * 20, H[1] - n[1] * 20] };
  }

  // Des triangles rectangles « qui tombent juste » : [côté, côté, plus grand côté] (5 × 5 = 3 × 3 + 4 × 4…) ;
  // avec eux, toutes les longueurs écrites sur les figures sont exactes
  const TRIPLETS = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];

  // ======================================================================
  // 1. Pyramides et cônes
  // ======================================================================
  // La perspective : la profondeur est dessinée en biais (à 45°) et réduite de moitié
  const FUYANTE = 0.5 * Math.SQRT1_2;

  // Une pyramide à base rectangulaire : la base ABCD ([AB] devant, [DC] derrière), H le centre de la base
  // (là où se coupent ses diagonales) et S le sommet, juste au-dessus de H.
  // L : la longueur de [AB], l : la profondeur de la base, h : la hauteur (le dessin garde les proportions)
  function pointsPyramide(L, l, h) {
    const e = Math.min(280 / (L + FUYANTE * l), 190 / (h + FUYANTE * l / 2));
    const [W, k, Hp] = [L * e, FUYANTE * l * e, h * e];
    const x0 = (440 - W - k) / 2;
    const y0 = 236 - (190 - Hp - k / 2) / 2;
    const H = [x0 + (W + k) / 2, y0 - k / 2];
    return { A: [x0, y0], B: [x0 + W, y0], C: [x0 + W + k, y0 - k], D: [x0 + k, y0 - k], H, S: [H[0], H[1] - Hp] };
  }
  // Les segments qu’on ne voit pas (derrière la pyramide ou à l’intérieur) : en pointillés
  const CACHES_PYRAMIDE = ['CD', 'DA', 'SD', 'AC', 'BD', 'SH'];
  // orange : un segment à montrer en couleur (« SH », « SB »…)
  function tracePyramide(p, orange = '') {
    const { A, B, C, D, H, S } = p;
    let html = F.polygone([A, B, C, S], 'fig-plein')
      + ['CD', 'DA', 'SD', 'AC', 'BD'].map(s => traitFin(p[s[0]], p[s[1]])).join('')
      + traitCache(S, H) + F.angleDroit(H, S, [H[0] - 20, H[1]], 10)
      + ['AB', 'BC', 'SA', 'SB', 'SC'].map(s => F.segment(p[s[0]], p[s[1]])).join('');
    if (orange) {
      const cache = CACHES_PYRAMIDE.some(s => s === orange || s === orange[1] + orange[0]);
      html += F.segment(p[orange[0]], p[orange[1]], cache ? 'fig-accent fig-cache' : 'fig-accent');
    }
    return html;
  }
  const nomsPyramide = ({ A, B, C, D, H, S }) => F.texte([S[0], S[1] - 17], 'S')
    + F.texte([A[0] - 13, A[1] + 12], 'A') + F.texte([B[0] + 13, B[1] + 12], 'B')
    + F.texte([C[0] + 15, C[1] - 6], 'C') + F.texte([D[0] + 20, D[1] - 14], 'D')
    + F.texte([H[0] + 15, H[1] - 12], 'H');

  // longueurs : les textes à écrire sur [AB] et sur [BC] (la hauteur SH est donnée dans l’énoncé : à l’intérieur
  // de la pyramide, son texte se mélangerait aux arêtes) ; arete : le texte à écrire sur l’arête latérale [SC] (un piège)
  function figurePyramide(L, l, h, { longueurs = null, noms = false, orange = '', arete = '' } = {}) {
    const p = pointsPyramide(L, l, h);
    let html = tracePyramide(p, orange);
    if (noms) html += nomsPyramide(p);
    if (longueurs) html += longueurDehors(p.A, p.B, longueurs[0], p.H) + longueurDehors(p.B, p.C, longueurs[1], p.H);
    if (arete) html += longueurDehors(p.S, p.C, arete, p.H);
    return F.svg(460, 270, html, 'Une pyramide à base rectangulaire');
  }

  // Un cône : le sommet S, la base (un disque de centre O, dessiné aplati), M et N au bord de la base
  function pointsCone(r, h) {
    const e = Math.min(140 / r, 185 / h);
    const [rx, Hp] = [r * e, h * e];
    const ry = Math.max(14, 0.28 * rx);
    const y0 = 36 + Hp + (230 - Hp - ry) / 2;
    return { O: [230, y0], S: [230, y0 - Hp], M: [230 + rx, y0], N: [230 - rx, y0], rx, ry };
  }
  const CACHES_CONE = ['SO', 'OM', 'MN'];
  // angleVers : le petit carré de l’angle droit, du côté de M (à droite) ou de N (à gauche)
  // diametre : dessiner aussi le rayon [ON] (le diamètre [MN] en entier)
  function traceCone(p, { orange = '', angleVers = 'M', diametre = false } = {}) {
    const { O, S, M, N, rx, ry } = p;
    const arc = (devant, classe) => `<path d="M ${xy(N)} A ${r1(rx)} ${r1(ry)} 0 0 ${devant ? 0 : 1} ${xy(M)}" class="${classe}"/>`;
    let html = `<path d="M ${xy(S)} L ${xy(N)} A ${r1(rx)} ${r1(ry)} 0 0 0 ${xy(M)} Z" class="fig-plein"/>`
      + arc(false, 'fig-marque fig-cache') + traitCache(S, O) + traitCache(O, M) + (diametre ? traitCache(N, O) : '')
      + F.angleDroit(O, S, angleVers === 'M' ? M : N, 10)
      + F.segment(S, N) + F.segment(S, M) + arc(true, 'fig-trait');
    if (orange) {
      const cache = CACHES_CONE.some(s => s === orange || s === orange[1] + orange[0]);
      html += F.segment(p[orange[0]], p[orange[1]], cache ? 'fig-accent fig-cache' : 'fig-accent');
    }
    return html;
  }
  // longueurs : les textes à écrire sur le rayon [OM], à côté de la hauteur [SO] et sur la génératrice [SM]
  function figureCone(r, h, { longueurs = null, noms = false, orange = '' } = {}) {
    const p = pointsCone(r, h);
    const { O, S, M, N } = p;
    let html = traceCone(p, { orange, angleVers: longueurs ? 'N' : 'M', diametre: noms });
    if (noms) {
      html += F.texte([S[0], S[1] - 17], 'S') + F.texte([O[0] - 13, O[1] - 13], 'O')
        + F.texte([M[0] + 15, M[1]], 'M') + F.texte([N[0] - 15, N[1]], 'N');
    }
    if (longueurs) {
      const [tr, th, tg] = longueurs;
      // le rayon au-dessus de [OM] ; la hauteur à droite de [SO], juste au-dessus du fond de la base (en pointillés)
      html += texteLongueur([(O[0] + M[0]) / 2, O[1] - 13], tr)
        + texteLongueur([O[0] + 8, O[1] - p.ry - 16], th, 'start')
        + longueurDehors(S, M, tg, O);
    }
    return F.svg(460, 275, html, 'Un cône');
  }

  // Pour la leçon : une pyramide et un cône, avec leur hauteur
  function figureLeconSolides() {
    const p = { A: [40, 200], B: [170, 200], C: [215, 158], D: [85, 158] };
    p.H = milieu(p.A, p.C);
    p.S = [p.H[0], 42];
    const c = { O: [350, 190], S: [350, 42], M: [430, 190], N: [270, 190], rx: 80, ry: 22 };
    const t = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-petit', ancre });
    return F.svg(460, 245, tracePyramide(p) + nomsPyramide(p) + traceCone(c)
      + F.texte([350, 25], 'S') + F.texte([337, 177], 'O') + F.texte([445, 190], 'M')
      + t([128, 232], 'une pyramide') + t([350, 232], 'un cône'), 'Une pyramide et un cône, avec leur hauteur');
  }

  // Une pyramide dont le volume tombe juste. carree : une base carrée (L = l) ; u : l’unité
  function tirerPyramide(carree, [cMin, cMax], [hMin, hMax], vMax = 400) {
    for (;;) {
      const L = entier(cMin, cMax);
      const l = carree ? L : entier(Math.max(2, cMin - 2), L - 1);
      const h = entier(hMin, hMax);
      const B = L * l;
      if ((B * h) % 3 === 0 && B * h / 3 <= vMax) return { L, l, h, B, V: B * h / 3 };
    }
  }
  // Le calcul du volume d’une pyramide, expliqué
  function expliquerPyramide({ L, l, h, B, V }, u, carree) {
    return `V = aire de la base × hauteur ÷ 3.<br>Aire de la base : ${L} × ${l} = ${mesure(B, u + '²')}${carree ? ' (un carré)' : ''}.<br>`
      + `${B} × ${h} ÷ 3 = ${ecrire(B * h)} ÷ 3 = <b>${mesure(V, u + '³')}</b>.<br>`
      + `⚠️ Sans le ÷ 3, on trouverait ${ecrire(B * h)} : le volume du pavé droit de même base et de même hauteur.`;
  }

  // Un cône dont le volume exact tombe juste : r² × h est un multiple de 3.
  // On tire d’abord le rayon, puis une hauteur qui convient pour ce rayon (sinon, r = 3 et r = 6 reviendraient trop souvent)
  function tirerCone(rMin, rMax, [hMin, hMax], kMax) {
    for (;;) {
      const r = entier(rMin, rMax);
      const hauteurs = [];
      for (let h = hMin; h <= hMax; h++) if ((r * r * h) % 3 === 0 && r * r * h / 3 >= 4 && r * r * h / 3 <= kMax) hauteurs.push(h);
      if (!hauteurs.length) continue;
      const h = parmi(hauteurs);
      return { r, h, k: r * r * h / 3 };
    }
  }

  // Des pyramides dont on connaît aussi une longueur penchée, qui n’est pas la hauteur (des triangles rectangles
  // « qui tombent juste » : 3-4-5, 5-12-13…) :
  // - l’apothème, la hauteur d’une face latérale (de S au milieu d’un côté de la base carrée) : a² = h² + (côté ÷ 2)² ;
  // - une arête latérale (de S à un sommet de la base rectangulaire) : arête² = h² + (diagonale ÷ 2)².
  // (aire de la base × longueur penchée ÷ 3 tombe juste aussi : c’est le piège)
  const PYRAMIDES_PENCHEES = [
    { L: 6, l: 6, h: 4, pente: 5, sorte: 'apotheme' }, { L: 12, l: 12, h: 8, pente: 10, sorte: 'apotheme' },
    { L: 8, l: 6, h: 12, pente: 13, sorte: 'arete' }, { L: 6, l: 8, h: 12, pente: 13, sorte: 'arete' },
    { L: 4, l: 3, h: 6, pente: 6.5, sorte: 'arete' }, { L: 12, l: 9, h: 10, pente: 12.5, sorte: 'arete' },
  ];
  function questionPyramidePenchee() {
    const { L, l, h, pente, sorte } = parmi(PYRAMIDES_PENCHEES);
    const [B, V, faux] = [L * l, L * l * h / 3, net(L * l * pente / 3)];
    const apotheme = sorte === 'apotheme';
    return choixAvecErreur({
      consigne: 'Calcule le volume',
      enonce: apotheme
        ? `Une pyramide a une base carrée de ${cm(L)} de côté et une hauteur de ${cm(h)}. Ses faces latérales ont une hauteur de ${cm(pente)}. `
          + `Volume : ___${ESPACE}cm³.`
        : `Une pyramide a pour base un rectangle de ${cm(L)} sur ${cm(l)}, une hauteur de ${cm(h)} et des arêtes latérales de ${cm(pente)}. `
          + `Volume : ___${ESPACE}cm³.`,
      reponse: V,
      explication: `On prend la hauteur de la pyramide, perpendiculaire à la base : ${cm(h)}. `
        + `${apotheme ? 'La hauteur d’une face latérale' : 'Une arête latérale'} (${cm(pente)}) est penchée : ce n’est pas la hauteur.<br>`
        + `Aire de la base : ${L} × ${l} = ${mesure(B, 'cm²')}. V = ${B} × ${h} ÷ 3 = <b>${mesure(V, 'cm³')}</b>.`,
    }, faux, [B * h, net(B * pente), B * h / 2, B].filter(x => propre(x, 1)));
  }
  // Des cônes dont on connaît aussi la génératrice (r, h, génératrice : 3-4-5…), avec des volumes exacts qui tombent juste
  const CONES_GENERATRICE = [[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 9, 15], [12, 5, 13]];

  // Le vocabulaire : [le segment, son nom, pourquoi]
  const VOCABULAIRE_PYRAMIDE = [
    ['SH', 'la hauteur', 'part du sommet S et il est perpendiculaire à la base (regarde l’angle droit) : c’est <b>la hauteur</b> de la pyramide.'],
    ['SB', 'une arête latérale', 'relie le sommet S à un sommet de la base : c’est <b>une arête latérale</b>.'],
    ['SC', 'une arête latérale', 'relie le sommet S à un sommet de la base : c’est <b>une arête latérale</b>.'],
    ['SD', 'une arête latérale', 'relie le sommet S à un sommet de la base : c’est <b>une arête latérale</b> (cachée, en pointillés).'],
    ['AB', 'une arête de la base', 'est un côté du rectangle ABCD, la base : c’est <b>une arête de la base</b>.'],
    ['BC', 'une arête de la base', 'est un côté du rectangle ABCD, la base : c’est <b>une arête de la base</b>.'],
    ['AC', 'une diagonale de la base', 'relie deux sommets opposés du rectangle ABCD : c’est <b>une diagonale de la base</b>.'],
    ['BD', 'une diagonale de la base', 'relie deux sommets opposés du rectangle ABCD : c’est <b>une diagonale de la base</b>.'],
  ];
  const VOCABULAIRE_CONE = [
    ['SO', 'la hauteur', 'va du sommet S au centre O de la base, perpendiculairement à la base : c’est <b>la hauteur</b> du cône.'],
    ['SM', 'une génératrice', 'relie le sommet S à un point du cercle de la base : c’est <b>une génératrice</b> du cône.'],
    ['SN', 'une génératrice', 'relie le sommet S à un point du cercle de la base : c’est <b>une génératrice</b> du cône.'],
    ['OM', 'un rayon de la base', 'relie le centre O de la base à un point de son cercle : c’est <b>un rayon</b> de la base.'],
    ['MN', 'un diamètre de la base', 'passe par le centre O et relie deux points du cercle de la base : c’est <b>un diamètre</b> de la base.'],
  ];

  const PROPRIETES_PYRAMIDE_CONE = [
    ['Le volume d’une pyramide est égal à aire de la base × hauteur ÷ 3.', true,
      'Oui : V = <b>aire de la base × hauteur ÷ 3</b>. C’est le tiers du volume du pavé droit de même base et de même hauteur.'],
    ['Le volume d’une pyramide est égal à aire de la base × hauteur.', false,
      'Non : il manque le <b>÷ 3</b>. Aire de la base × hauteur, c’est le volume du pavé droit (ou du prisme droit).'],
    ['Le volume d’une pyramide est égal à aire de la base × hauteur ÷ 2.', false,
      'Non : on divise par <b>3</b>, pas par 2. V = aire de la base × hauteur ÷ 3.'],
    ['Le volume d’un cône de rayon r et de hauteur h est π × r² × h ÷ 3.', true,
      'Oui : l’aire de la base est π × r², donc V = <b>π × r² × h ÷ 3</b>.'],
    ['Le volume d’un cône de rayon r et de hauteur h est π × r² × h.', false,
      'Non : π × r² × h, c’est le volume du cylindre. Pour le cône, on divise par 3 : V = <b>π × r² × h ÷ 3</b>.'],
    ['Le volume d’un cône de rayon r et de hauteur h est 2 × π × r × h ÷ 3.', false,
      'Non : l’aire de la base est π × r² (r × r, pas 2 × r). V = <b>π × r² × h ÷ 3</b>.'],
    ['Une pyramide a le tiers du volume du pavé droit de même base et de même hauteur.', true,
      'Oui : il faut <b>3</b> pyramides pleines de sable pour remplir le pavé droit.'],
    ['Un cône a la moitié du volume du cylindre de même base et de même hauteur.', false,
      'Non : il en a le <b>tiers</b>. Il faut 3 cônes pleins d’eau pour remplir le cylindre.'],
    ['Les faces latérales d’une pyramide sont des triangles.', true,
      'Oui : les faces latérales sont des <b>triangles</b> qui se rejoignent au sommet.'],
    ['Les faces latérales d’une pyramide sont des rectangles.', false,
      'Non : ce sont des <b>triangles</b>, qui se rejoignent au sommet. (Ce sont les faces latérales du prisme droit qui sont des rectangles.)'],
    ['La hauteur d’un cône est plus courte que ses génératrices.', true,
      'Oui : la hauteur, une génératrice et un rayon forment un triangle rectangle dont la génératrice est le <b>plus long côté</b>.'],
    ['La hauteur d’une pyramide est la longueur d’une arête latérale.', false,
      'Non : la hauteur part du sommet et est <b>perpendiculaire à la base</b>. Une arête latérale est penchée, et plus longue.'],
    ['La base d’un cône est un disque.', true, 'Oui : un cône a <b>une</b> base, un disque, et un sommet.'],
    ['Un cône a deux bases.', false, 'Non : un cône a <b>une seule</b> base (un disque) et un sommet. C’est le cylindre qui a deux bases.'],
  ];

  ajouterEtape({
    id: '4e-mesures-pyramide-cone',
    banque: ['pyramide', 'pyramide', 'pyramide', 'pyramideFigure', 'cone', 'cone', 'cone', 'coneFigure', 'tiers', 'vocabulaire',
      'vocabulaire', 'hauteur', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'pyramide') {
        // (une fois sur quatre : une longueur penchée est donnée en plus, et il ne faut pas la prendre pour la hauteur)
        if (auHasard(0.25)) return questionPyramidePenchee();
        const cas = parmi(['carree', 'carree', 'rectangle', 'bougie', 'tente']);
        const carree = cas !== 'rectangle';
        const u = cas === 'tente' ? 'm' : 'cm';
        const p = cas === 'tente' ? tirerPyramide(true, [2, 4], [2, 3]) : tirerPyramide(carree, [3, 10], [3, 12]);
        const { L, l, h, B, V } = p;
        const [cL, cl, ch] = [L, l, h].map(x => mesure(x, u));
        const enonce = {
          carree: `Une pyramide de ${ch} de haut a une base carrée de ${cL} de côté. Volume : ___${ESPACE}cm³.`,
          rectangle: `Une pyramide de ${ch} de haut a pour base un rectangle de ${cL} sur ${cl}. Volume : ___${ESPACE}cm³.`,
          bougie: `Une bougie est une pyramide à base carrée de ${cL} de côté et de ${ch} de haut. Volume : ___${ESPACE}cm³.`,
          tente: `Une tente est une pyramide à base carrée de ${cL} de côté et de ${ch} de haut. Volume : ___${ESPACE}m³.`,
        }[cas];
        // ÷ 2 au lieu de ÷ 3, les erreurs sur l’aire de la base (côté × 2, le périmètre, une somme, un seul côté),
        // l’aire de la base seule (la hauteur oubliée), une dimension oubliée ; et l’oubli du ÷ 3, toujours proposé
        const autres = carree
          ? [B * h / 2, 2 * L * h / 3, 4 * L * h / 3, L * h / 3, B, L * h]
          : [B * h / 2, (L + l) * h / 3, 2 * (L + l) * h / 3, L * h / 3, B, L * h, l * h];
        return choixAvecErreur({
          consigne: 'Calcule le volume',
          enonce,
          reponse: V,
          explication: expliquerPyramide(p, u, carree),
        }, B * h, autres.filter(x => propre(x, 1)));
      }
      if (sorte === 'pyramideFigure') {
        if (auHasard(0.4)) {
          // Une arête latérale écrite sur la figure : ce n’est pas la hauteur !
          // (une base plus large que profonde : sinon, les noms D et H se touchent sur le dessin)
          const { L, l, h, pente } = parmi(PYRAMIDES_PENCHEES.filter(p => p.sorte === 'arete' && p.L > p.l));
          const [B, V] = [L * l, L * l * h / 3];
          return nombre({
            consigne: 'Calcule le volume',
            enonce: `La base ABCD de cette pyramide est un rectangle, et sa hauteur [SH] mesure ${cm(h)}. Quel est son volume ?`
              + figurePyramide(L, l, h, { noms: true, longueurs: [cm(L), cm(l)], arete: cm(pente) }),
            reponse: V,
            unite: 'cm³',
            explication: `La hauteur [SH] est perpendiculaire à la base : ${cm(h)} (${cm(pente)}, c’est l’arête latérale [SC], penchée).<br>`
              + `Aire de la base : ${L} × ${l} = ${mesure(B, 'cm²')}. V = ${B} × ${h} ÷ 3 = <b>${mesure(V, 'cm³')}</b>.`,
          });
        }
        let p;
        do { p = tirerPyramide(false, [4, 10], [4, 12], 500); } while (p.h > 1.4 * p.L || p.h < p.L / 2 || p.l < Math.max(3, p.L / 2));
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `La base ABCD de cette pyramide est un rectangle, et sa hauteur [SH] mesure ${cm(p.h)}. Quel est son volume ?`
            + figurePyramide(p.L, p.l, p.h, { noms: true, longueurs: [cm(p.L), cm(p.l)] }),
          reponse: p.V,
          unite: 'cm³',
          explication: `La hauteur [SH], en pointillés, est perpendiculaire à la base : ${cm(p.h)}.<br>`
            + `Aire de la base : ${p.L} × ${p.l} = ${mesure(p.B, 'cm²')}.<br>`
            + `V = ${p.B} × ${p.h} ÷ 3 = ${ecrire(p.B * p.h)} ÷ 3 = <b>${mesure(p.V, 'cm³')}</b>.`,
        });
      }
      if (sorte === 'cone') {
        const cas = parmi(['rayon', 'rayon', 'diametre', 'cornet', 'generatrice']);
        if (cas === 'generatrice') {
          // La génératrice est donnée en plus : ce n’est pas la hauteur !
          const [r, h, g] = parmi(CONES_GENERATRICE);
          const [k, faux] = [r * r * h / 3, r * r * g / 3];
          return choix({
            consigne: 'Trouve le volume exact',
            enonce: `Un cône a un rayon de ${cm(r)}, une hauteur de ${cm(h)} et une génératrice de ${cm(g)}. Volume exact : ___${ESPACE}cm³.`,
            reponse: avecPi(k),
            garder: [avecPi(faux)],
            pieges: [r * r * h, r * r * g, 2 * r * h / 3].filter(n => Number.isInteger(n) && n !== k).map(avecPi),
            explication: `La hauteur est ${cm(h)} ; la génératrice (${cm(g)}) est penchée : ce n’est pas la hauteur.<br>`
              + `V = π × ${r}² × ${h} ÷ 3 = π × ${ecrire(r * r * h)} ÷ 3 = <b>${avecPi(k)}${ESPACE}cm³</b>.`,
          });
        }
        const exact = auHasard();
        // (r = 2 seulement pour le cornet : avec r = 2, on a r² = 2 × r, et l’erreur « 2 × r » ne se verrait pas)
        const { r, h, k } = cas === 'cornet' ? tirerCone(2, 4, [8, 12], exact ? 60 : 50) : tirerCone(3, 9, [3, 15], exact ? 250 : 100);
        const d = 2 * r;
        const debut = {
          rayon: `Un cône a un rayon de ${cm(r)} et une hauteur de ${cm(h)}.`,
          diametre: `Un cône a une base de ${cm(d)} de diamètre et une hauteur de ${cm(h)}.`,
          cornet: `Un cornet de glace est un cône de rayon ${cm(r)} et de hauteur ${cm(h)}.`,
        }[cas];
        // Les erreurs : l’oubli du ÷ 3, ÷ 2 au lieu de ÷ 3, 2 × r au lieu de r², le diamètre pris pour le rayon (ou r × h)
        const erreurs = [r * r * h, r * r * h / 2, 2 * r * h / 3, cas === 'diametre' ? d * d * h / 3 : r * h / 3]
          .filter(n => propre(n, 1));
        const calcul = (cas === 'diametre' ? `Le rayon est la moitié du diamètre : ${d} ÷ 2 = ${cm(r)}.<br>` : '')
          + `V = π × r² × h ÷ 3 = π × ${r}² × ${h} ÷ 3 = π × ${ecrire(r * r * h)} ÷ 3 = `;
        const attention = '<br>⚠️ Sans le ÷ 3, on trouverait le volume du cylindre.' + (r !== 2 ? ' Et r² = r × r (pas 2 × r).' : '');
        if (exact) {
          return choix({
            consigne: 'Trouve le volume exact',
            enonce: `${debut} Volume exact : ___${ESPACE}cm³.`,
            reponse: avecPi(k),
            // (des multiples entiers de π seulement : un bouton « 220,5π » se repérerait à sa forme)
            pieges: meilleursPieges(avecPi(k), erreurs.filter(n => Number.isInteger(n)).map(avecPi)),
            explication: `${calcul}<b>${avecPi(k)}${ESPACE}cm³</b>.${attention}`,
          });
        }
        const V = foisPi(k);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule le volume',
          enonce: `${debut} Avec π ≈ 3,14 : V ≈ ___${ESPACE}cm³.`,
          reponse: V,
          // (et l’oubli de π : ${k})
          pieges: meilleursPieges(V, [...erreurs.map(foisPi), k]),
          explication: `${calcul}${avecPi(k)}.<br>${avecPi(k)} ≈ 3,14 × ${k} = <b>${mesure(V, 'cm³')}</b>.${attention}`,
        }));
      }
      if (sorte === 'coneFigure') {
        // (des cônes assez larges pour que les longueurs s’écrivent bien ; le volume exact tombe juste avec ces triangles)
        const exact = auHasard();
        const [r, h, g] = parmi(exact ? [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [9, 12, 15], [12, 9, 15]]
          : [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10]]);
        const k = r * r * h / 3;
        const dessin = figureCone(r, h, { longueurs: [cm(r), cm(h), cm(g)] });
        const hauteur = `La hauteur est en pointillés : ${cm(h)} (${cm(g)}, c’est une génératrice, pas la hauteur).<br>`;
        if (exact) {
          return nombre({
            consigne: 'Trouve le volume exact',
            enonce: `Le volume exact de ce cône est ___π${ESPACE}cm³.${dessin}`,
            reponse: k,
            explication: `${hauteur}V = π × ${r}² × ${h} ÷ 3 = π × ${ecrire(r * r * h)} ÷ 3 = <b>${avecPi(k)}${ESPACE}cm³</b>.`,
          });
        }
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `Avec π ≈ 3,14, quel est le volume de ce cône ?${dessin}`,
          reponse: foisPi(k),
          unite: 'cm³',
          explication: `${hauteur}V = π × ${r}² × ${h} ÷ 3 = π × ${ecrire(r * r * h)} ÷ 3 = ${avecPi(k)} ≈ 3,14 × ${k} = <b>${mesure(foisPi(k), 'cm³')}</b>.`,
        });
      }
      if (sorte === 'tiers') {
        const cas = parmi(['triple', 'triple', 'pyramide', 'cone']);
        if (cas === 'triple') {
          // À l’envers : le pavé droit a le triple du volume de la pyramide. (Une question à écrire : en boutons, les erreurs
          // classiques — ÷ 3 au lieu de × 3, le même volume, le double — sont toutes plus petites que la réponse, et on la devinerait.)
          const x = 3 * entier(2, 13);
          return nombre({
            consigne: 'Compare les volumes',
            enonce: `Une pyramide a un volume de ${mesure(x, 'cm³')}. Quel est le volume du pavé droit de même base et de même hauteur ?`,
            reponse: 3 * x,
            unite: 'cm³',
            explication: `La pyramide a le tiers du volume du pavé droit de même base et de même hauteur. `
              + `Le pavé a donc 3 fois plus de volume :<br>3 × ${x} = <b>${mesure(3 * x, 'cm³')}</b>.<br>`
              + `⚠️ ${x} ÷ 3 = ${x / 3}, ce serait plus petit que la pyramide : or le pavé est plus grand !`,
          });
        }
        const cone = cas === 'cone';
        // (un verre de 12 à 24 cL)
        const x = cone ? entier(4, 8) : entier(5, 40);
        const [u, grand] = cone ? ['cL', 'le cylindre'] : ['cm³', 'le pavé droit'];
        return nombre({
          consigne: 'Compare les volumes',
          enonce: cone
            ? `Un cornet en forme de cône et un verre cylindrique ont la même base et la même hauteur. Le verre contient ${mesure(3 * x, 'cL')}. `
              + 'Combien de centilitres contient le cornet ?'
            : `Un pavé droit et une pyramide ont la même base et la même hauteur. Le pavé a un volume de ${mesure(3 * x, 'cm³')}. `
              + 'Quel est le volume de la pyramide ?',
          reponse: x,
          unite: u,
          explication: `${cone ? 'Le cône' : 'La pyramide'} a le <b>tiers</b> du volume ${cone ? 'du cylindre' : 'du pavé droit'} `
            + `de même base et de même hauteur (${grand} : aire de la base × hauteur ; ${cone ? 'le cône' : 'la pyramide'} : `
            + `aire de la base × hauteur ÷ 3).<br>${3 * x} ÷ 3 = <b>${mesure(x, u)}</b>.`,
        });
      }
      if (sorte === 'vocabulaire') {
        const cone = auHasard(0.45);
        const liste = cone ? VOCABULAIRE_CONE : VOCABULAIRE_PYRAMIDE;
        const [seg, nom, pourquoi] = parmi(liste);
        const noms = [...new Set(liste.map(([, n]) => n))];
        const dessin = orange => (cone ? figureCone(4, 5, { noms: true, orange }) : figurePyramide(7, 6, 6.5, { noms: true, orange }));
        if (auHasard(0.55)) {
          return choix({
            consigne: 'Le vocabulaire des solides',
            enonce: `Comment s’appelle le segment [${seg}], en orange, ${cone ? 'sur ce cône' : 'sur cette pyramide'} ?${dessin(seg)}`,
            reponse: nom,
            pieges: noms.filter(n => n !== nom),
            explication: `[${seg}] ${pourquoi}`,
          });
        }
        // À l’envers : quel segment ? (un seul bouton de chaque sorte, pour n’avoir qu’une bonne réponse)
        const autres = noms.filter(n => n !== nom).map(n => `[${parmi(liste.filter(([, m]) => m === n))[0]}]`);
        return choix({
          consigne: 'Le vocabulaire des solides',
          enonce: `Lequel de ces segments est ${nom} ${cone ? 'du cône' : 'de la pyramide'} ?${dessin('')}`,
          reponse: `[${seg}]`,
          pieges: autres,
          explication: `[${seg}] ${pourquoi}`,
        });
      }
      if (sorte === 'hauteur') {
        if (auHasard()) {
          // La hauteur d’une pyramide à base carrée, dont on connaît le volume
          const { L, h, B, V } = tirerPyramide(true, [3, 9], [2, 12]);
          return nombre({
            consigne: 'Retrouve la hauteur',
            enonce: `Une pyramide à base carrée de ${cm(L)} de côté a un volume de ${mesure(V, 'cm³')}. Quelle est sa hauteur ?`,
            reponse: h,
            unite: 'cm',
            explication: `V = aire de la base × h ÷ 3, donc aire de la base × h = 3 × ${V} = ${ecrire(3 * V)}.<br>`
              + `Aire de la base : ${L} × ${L} = ${mesure(B, 'cm²')}. h = ${ecrire(3 * V)} ÷ ${B} = <b>${cm(h)}</b>.`,
          });
        }
        const { r, h, k } = tirerCone(2, 6, [2, 12], 150);
        return nombre({
          consigne: 'Retrouve la hauteur',
          enonce: `Un cône de rayon ${cm(r)} a un volume exact de ${avecPi(k)}${ESPACE}cm³. Quelle est sa hauteur ?`,
          reponse: h,
          unite: 'cm',
          explication: `π × ${r}² × h ÷ 3 = ${avecPi(k)}, donc ${r * r} × h ÷ 3 = ${k}, et ${r * r} × h = 3 × ${k} = ${3 * k}.<br>`
            + `h = ${3 * k} ÷ ${r * r} = <b>${cm(h)}</b>.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['proprietes', 'proprietes', 'pyramide', 'cone']);
      if (famille === 'pyramide') {
        const { h, B, V } = tirerPyramide(false, [4, 10], [3, 12]);
        const faux = parmi([B * h, B * h / 2].filter(x => propre(x, 1)));
        return vraiFaux({
          enonce: `Une pyramide dont la base a une aire de ${mesure(B, 'cm²')} et dont la hauteur mesure ${cm(h)} `
            + `a un volume de ${mesure(vrai ? V : faux, 'cm³')}.`,
          vrai,
          explication: `V = aire de la base × hauteur ÷ 3 = ${B} × ${h} ÷ 3 = <b>${mesure(V, 'cm³')}</b>.`
            + (vrai ? '' : (faux === B * h ? '<br>⚠️ Il ne faut pas oublier le ÷ 3 !' : '<br>⚠️ On divise par 3, pas par 2 !')),
        });
      }
      if (famille === 'cone') {
        const { r, h, k } = tirerCone(3, 6, [3, 12], 150);
        const faux = parmi([r * r * h, 2 * r * h / 3].filter(x => propre(x, 1) && !egaux(x, k)));
        return vraiFaux({
          enonce: `Un cône de rayon ${cm(r)} et de hauteur ${cm(h)} a un volume exact de ${avecPi(vrai ? k : faux)}${ESPACE}cm³.`,
          vrai,
          explication: `V = π × ${r}² × ${h} ÷ 3 = π × ${ecrire(r * r * h)} ÷ 3 = <b>${avecPi(k)}${ESPACE}cm³</b>.`
            + (vrai ? '' : (faux === r * r * h ? '<br>⚠️ Il ne faut pas oublier le ÷ 3 !' : `<br>⚠️ r² = ${r} × ${r}, pas 2 × ${r}.`)),
        });
      }
      return vraiFauxDans(PROPRIETES_PYRAMIDE_CONE, vrai);
    },
    titreLecon: 'Pyramides et cônes',
    lecon: `
      <h4>Le vocabulaire</h4>
      <p>Une <b>pyramide</b> a une <b>base</b> (un polygone) et des <b>faces latérales</b> triangulaires qui se rejoignent en un point :
        le <b>sommet</b>. Les <b>arêtes latérales</b> relient le sommet aux sommets de la base.</p>
      <p>Un <b>cône</b> a une base en forme de disque et un sommet. Une <b>génératrice</b> relie le sommet à un point du cercle de la base.</p>
      <p>La <b>hauteur</b> part du sommet et est <b>perpendiculaire à la base</b> (on appelle aussi hauteur sa longueur).
        Pour le cône, elle arrive au centre O de la base. Elle est plus courte qu’une arête latérale, qu’une génératrice
        ou que la hauteur d’une face latérale (l’apothème) : ces longueurs-là sont penchées, on ne s’en sert pas pour le volume.</p>
      ${figureLeconSolides()}
      <h4>Le volume</h4>
      <table>
        <tr><th>Pyramide</th><td>V = aire de la base × hauteur ÷ 3</td></tr>
        <tr><th>Cône</th><td>V = π × r² × h ÷ 3 (r : le rayon de la base, h : la hauteur)</td></tr>
      </table>
      <p>👉 <i>Pyramide de 5&nbsp;cm de haut, à base carrée de 6&nbsp;cm de côté : 6 × 6 × 5 ÷ 3 = 180 ÷ 3 = 60&nbsp;cm³</i></p>
      <p>👉 <i>Cône de rayon 3&nbsp;cm et de hauteur 4&nbsp;cm : π × 3² × 4 ÷ 3 = 12π&nbsp;cm³ (valeur exacte) ≈ 3,14 × 12 = 37,68&nbsp;cm³</i></p>
      <p><b>À l’envers :</b> aire de la base × hauteur = 3 × V, donc hauteur = 3 × V ÷ aire de la base.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> une pyramide a le <b>tiers</b> du volume du pavé droit (ou du prisme droit)
        de même base et de même hauteur : il faut 3 pyramides pleines de sable pour le remplir ! Pareil pour le cône et le cylindre.</div>
      <p>⚠️ N’oublie pas le ÷ 3. r² = r × r (et pas 2 × r). Si on te donne le diamètre, prends-en la moitié pour avoir le rayon.</p>
    `,
  });

  // ======================================================================
  // 2. Les aires : révision
  // ======================================================================
  // Un triangle PQR : la base [PQ] est sur l’axe des abscisses, la hauteur [RH] sur l’axe des ordonnées
  // (H en (0 ; 0), R en (0 ; h)). xp et xq : les abscisses de P et de Q.
  // rp et rq : les longueurs des côtés [RP] et [RQ] écrites sur la figure (ou null) : un piège, ce n’est pas la hauteur !
  function tirerTriangleHauteur() {
    for (;;) {
      const [h, d, c] = parmi(TRIPLETS);
      if (auHasard(0.35)) {
        // La hauteur tombe à l’extérieur (angle obtus en P) : on écrit le côté [RQ], le plus loin de la hauteur
        const o = parmi([1, 2, 3, 4].filter(x => d - x >= 3));
        if (!o || (h * (d - o)) % 2) continue;
        return { xp: o, xq: d, h, rp: null, rq: c };
      }
      const e = entier(2, 9);
      if (Math.max(d, e) < 4 || d + e > 18 || (h * (d + e)) % 2) continue;
      // (la longueur de la hauteur s’écrit à l’intérieur : il faut assez de place entre les pointillés et le côté)
      const echelle = Math.min(45, 300 / (d + e), 190 / h);
      if (0.7 * Math.max(d, e) * echelle < 90) continue;
      return { xp: -d, xq: e, h, rp: c, rq: null };
    }
  }
  // Le triangle, sa base, sa hauteur en pointillés (avec l’angle droit) et un côté penché
  function figureTriangleHauteur({ xp, xq, h, rp, rq }) {
    const sx = auHasard() ? 1 : -1;
    const [P, Q, R, H] = cadrer([[xp, 0], [xq, 0], [0, h], [0, 0]].map(([x, y]) => [sx * x, y]), 460, 280);
    const G = centre([P, Q, R]);
    const dehors = xp > 0;
    const traits = [[P, Q], [Q, R], [R, P]];
    let html = F.polygone([P, Q, R]);
    if (dehors) {
      html += traitCache(H, P);
      traits.push([H, P]);
    }
    const hauteur = longueurHauteur(R, H, cm(h), traits, dehors ? P : null);
    html += pointilles(R, H) + hauteur.html + F.angleDroit(H, R, hauteur.oppose) + longueurDehors(P, Q, cm(net(xq - xp)), G);
    if (rp) html += longueurDehors(R, P, cm(rp), G);
    if (rq) html += longueurDehors(R, Q, cm(rq), G);
    return F.svg(460, 280, html, 'Un triangle et une de ses hauteurs');
  }

  // Un parallélogramme ABCD : base [AB] de longueur b, hauteur h, côté [AD] (de longueur c) penché de d
  function tirerParallelogramme() {
    for (;;) {
      const [h, d, c] = parmi(TRIPLETS);
      const b = d + entier(2, 9);
      if (b <= 18 && b !== c) return { b, h, d, c };
    }
  }
  function figureParallelogramme({ b, h, d, c }) {
    const sx = auHasard() ? 1 : -1;
    const [A, B, C, D, H] = cadrer([[0, 0], [b, 0], [b + d, h], [d, h], [d, 0]].map(([x, y]) => [sx * x, y]), 460, 260);
    const G = milieu(A, C);
    const hauteur = longueurHauteur(D, H, cm(h), [[A, B], [B, C], [C, D], [D, A]]);
    return F.svg(460, 260, F.polygone([A, B, C, D]) + pointilles(D, H) + hauteur.html + F.angleDroit(H, D, hauteur.oppose)
      + longueurDehors(A, B, cm(b), G) + longueurDehors(A, D, cm(c), G), 'Un parallélogramme et une de ses hauteurs');
  }

  // Une figure à découper : une maison (rectangle + triangle), un rectangle et un demi-disque, un rectangle creusé (rectangle − rectangle)
  function tirerFigureComposee() {
    const famille = parmi(['maison', 'demiDisque', 'demiDisque', 'creux']);
    if (famille === 'maison') {
      const enMetres = auHasard();
      const u = enMetres ? 'm' : 'cm';
      let W;
      let Hr;
      let t;
      // (une maison assez large : la hauteur du toit s’écrit dans le toit)
      do {
        W = enMetres ? parmi([4, 5, 6, 8]) : 2 * entier(3, 7);
        Hr = enMetres ? parmi([2.5, 3, 4]) : entier(3, 7);
        t = enMetres ? parmi([1.5, 2, 3]) : entier(2, 5);
      } while (0.3 * W * Math.min(45, 270 / W, 190 / (Hr + t)) < 70 || !propre(W * t / 2, 1));
      const [A, B, C, S, D, T] = cadrer([[0, 0], [W, 0], [W, Hr], [W / 2, Hr + t], [0, Hr], [W / 2, Hr]], 460, 280, { margeX: 95 });
      const G = milieu(A, C);
      const hauteur = longueurHauteur(S, T, mesure(t, u), [[D, S], [S, C], [D, C]]);
      const R = net(W * Hr);
      const Tr = net(W * t / 2);
      return {
        enonce: enMetres ? 'Voici la façade de la cabane de Roxy : un rectangle et un triangle. Quelle est son aire ?'
          : 'Cette figure est formée d’un rectangle et d’un triangle. Quelle est son aire ?',
        svg: F.svg(460, 280, F.polygone([A, B, C, S, D]) + traitFin(D, C) + pointilles(S, T) + hauteur.html
          + F.angleDroit(T, S, hauteur.oppose) + F.angleDroit(A, B, D) + F.angleDroit(B, A, C) + F.angleDroit(D, A, C)
          + longueurDehors(A, B, mesure(W, u), G) + longueurDehors(B, C, mesure(Hr, u), G), 'Un rectangle surmonté d’un triangle'),
        aire: net(R + Tr),
        unite: u + '²',
        explication: `On découpe : un rectangle de ${ecrire(W)} × ${ecrire(Hr)} = ${mesure(R, u + '²')}, et un triangle de base `
          + `${mesure(W, u)} et de hauteur ${mesure(t, u)} : ${ecrire(W)} × ${ecrire(t)} ÷ 2 = ${mesure(Tr, u + '²')}.<br>`
          + `Aire totale : ${ecrire(R)} + ${ecrire(Tr)} = <b>${mesure(net(R + Tr), u + '²')}</b>.`,
      };
    }
    if (famille === 'demiDisque') {
      // Un rectangle, et un demi-disque collé contre sa largeur (qui est le diamètre du demi-disque)
      const r = entier(2, 5);
      const l = 2 * r;
      const L = entier(Math.max(5, l), 12);
      const [A, B, C, D, O] = cadrer([[0, 0], [L, 0], [L, l], [0, l], [L, r], [L + r, r]], 460, 250, { margeX: 95 });
      const R = Math.hypot(B[0] - O[0], B[1] - O[1]);
      const G = milieu(A, C);
      const [rect, demi] = [L * l, net(PI * r * r / 2)];
      return {
        enonce: 'Cette figure est formée d’un rectangle et d’un demi-disque. Avec π ≈ 3,14, quelle est son aire ?',
        svg: F.svg(460, 250, `<path d="M ${xy(D)} L ${xy(C)} A ${r1(R)} ${r1(R)} 0 0 1 ${xy(B)} L ${xy(A)} Z" class="fig-trait fig-plein"/>`
          + traitFin(B, C) + F.angleDroit(A, B, D) + F.angleDroit(D, A, C)
          + longueurDehors(A, B, cm(L), G) + longueurDehors(A, D, cm(l), G), 'Un rectangle et un demi-disque'),
        aire: net(rect + demi),
        unite: 'cm²',
        explication: `Rectangle : ${L} × ${l} = ${mesure(rect, 'cm²')}. Le demi-disque a pour diamètre ${cm(l)}, donc pour rayon ${cm(r)} : `
          + `3,14 × ${r} × ${r} ÷ 2 = ${mesure(demi, 'cm²')}.<br>Aire totale : ${rect} + ${ecrire(demi)} = <b>${mesure(net(rect + demi), 'cm²')}</b>.`,
      };
    }
    // Un rectangle creusé d’un petit rectangle, dans un coin (on enlève le morceau en pointillés)
    const L = entier(6, 14);
    const l = entier(5, Math.min(10, L));
    const a = entier(2, L - 3);
    const c = entier(2, l - 2);
    const R = L * l;
    const [A, B, E, P, Q, D, C] = cadrer([[0, 0], [L, 0], [L, l - c], [L - a, l - c], [L - a, l], [0, l], [L, l]], 460, 270, { margeX: 95 });
    const G = milieu(A, C);
    return {
      enonce: 'Cette figure est un rectangle dont on a enlevé un petit rectangle. Quelle est son aire ?',
      svg: F.svg(460, 270, F.polygone([A, B, E, P, Q, D]) + traitFin(Q, C) + traitFin(C, E) + F.angleDroit(A, B, D)
        + F.angleDroit(B, A, E) + F.angleDroit(D, A, Q) + F.angleDroit(C, Q, E)
        + longueurDehors(A, B, cm(L), G) + longueurDehors(A, D, cm(l), G)
        + longueurDehors(Q, C, cm(a), G) + longueurDehors(C, E, cm(c), G), 'Un rectangle creusé d’un petit rectangle'),
      aire: R - a * c,
      unite: 'cm²',
      explication: 'On part du grand rectangle et on enlève le petit rectangle en pointillés.<br>'
        + `${L} × ${l} = ${mesure(R, 'cm²')} ; ${a} × ${c} = ${mesure(a * c, 'cm²')}.<br>${R} ${MOINS} ${a * c} = <b>${mesure(R - a * c, 'cm²')}</b>.`,
    };
  }

  // Pour la leçon : un parallélogramme, sa base, sa hauteur et un côté
  function figureLeconParallelogramme() {
    const [A, B, C, D, H] = [[60, 170], [270, 170], [360, 50], [150, 50], [150, 170]];
    const t = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-petit', ancre });
    return F.svg(420, 200, F.polygone([A, B, C, D]) + pointilles(D, H) + F.angleDroit(H, D, B)
      + t([165, 190], 'base') + t([160, 115], 'hauteur', 'start') + t([88, 105], 'côté', 'end'),
    'Un parallélogramme, sa base et sa hauteur');
  }

  // Aire ou périmètre ? [la situation, la réponse, pourquoi]
  const SITUATIONS = [
    ['savoir combien de peinture acheter pour repeindre un mur', 'l’aire', 'La peinture recouvre toute la surface du mur'],
    ['savoir combien de dalles il faut pour carreler une cuisine', 'l’aire', 'Les dalles recouvrent tout le sol'],
    ['savoir combien de graines de gazon semer sur une pelouse', 'l’aire', 'Le gazon pousse sur toute la surface'],
    ['savoir quel morceau de tissu il faut pour une nappe', 'l’aire', 'Le tissu recouvre toute la table'],
    ['savoir combien de rouleaux de papier peint il faut pour une chambre', 'l’aire', 'Le papier peint recouvre toute la surface des murs'],
    ['savoir quelle longueur de grillage il faut autour d’un pré', 'le périmètre', 'Le grillage fait le tour du pré'],
    ['savoir quelle longueur de guirlande il faut pour faire le tour d’une fenêtre', 'le périmètre', 'La guirlande fait le tour de la fenêtre'],
    ['savoir quelle longueur de ruban coudre au bord d’une nappe', 'le périmètre', 'Le ruban fait le tour de la nappe'],
    ['savoir quelle distance on court en faisant le tour d’un stade', 'le périmètre', 'On fait le tour du stade'],
    ['savoir quelle longueur de frise coller en haut des murs d’une chambre', 'le périmètre', 'La frise fait le tour de la chambre'],
    ['savoir combien d’eau il faut pour remplir un aquarium', 'le volume', 'L’eau remplit tout l’intérieur de l’aquarium'],
    ['savoir combien de sable il faut pour remplir un bac à sable', 'le volume', 'Le sable remplit tout le bac'],
    ['savoir combien de terre il faut pour remplir une jardinière', 'le volume', 'La terre remplit toute la jardinière'],
  ];
  const UNITES_SITUATIONS = { 'l’aire': 'en m² ou en cm²', 'le périmètre': 'en m ou en cm', 'le volume': 'en m³, en L…' };

  // Les conversions d’aires : [de, vers, rangs (1 m² = 100 dm² : 2 rangs par unité)]
  const CONVERSIONS_AIRES = [['m²', 'dm²', 2], ['m²', 'dm²', 2], ['dm²', 'cm²', 2], ['cm²', 'mm²', 2], ['m²', 'cm²', 4], ['m²', 'cm²', 4]];
  const RELATIONS_AIRES = {
    'm²-dm²': `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = 100${ESPACE}dm²`,
    'dm²-cm²': `1${ESPACE}dm = 10${ESPACE}cm, donc 1${ESPACE}dm² = 10 × 10 = 100${ESPACE}cm²`,
    'cm²-mm²': `1${ESPACE}cm = 10${ESPACE}mm, donc 1${ESPACE}cm² = 10 × 10 = 100${ESPACE}mm²`,
    'm²-cm²': `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = 10${ESPACE}000${ESPACE}cm²`,
  };

  const PROPRIETES_AIRES = [
    ['L’aire d’un triangle est égale à base × hauteur ÷ 2.', true, 'Oui : aire du triangle = <b>base × hauteur ÷ 2</b>.'],
    ['L’aire d’un triangle est égale à base × hauteur.', false,
      'Non : il manque le <b>÷ 2</b>. Base × hauteur, c’est l’aire du parallélogramme (le double du triangle).'],
    ['L’aire d’un parallélogramme est égale à base × hauteur.', true, 'Oui : aire du parallélogramme = <b>base × hauteur</b>, sans ÷ 2.'],
    ['L’aire d’un parallélogramme est égale à base × hauteur ÷ 2.', false, 'Non, ça, c’est le triangle ! Aire du parallélogramme = <b>base × hauteur</b>.'],
    ['L’aire d’un disque de rayon r est égale à π × r².', true, 'Oui : aire du disque = <b>π × r²</b> (π × r × r).'],
    ['L’aire d’un disque de rayon r est égale à 2 × π × r.', false,
      'Non : 2 × π × r, c’est le <b>périmètre</b> (la longueur du cercle). L’aire du disque, c’est π × r².'],
    ['Deux triangles qui ont la même base et la même hauteur ont la même aire.', true,
      'Oui : l’aire ne dépend que de la base et de la hauteur (base × hauteur ÷ 2).'],
    ['Deux rectangles qui ont le même périmètre ont toujours la même aire.', false,
      `Non : 5${ESPACE}cm sur 1${ESPACE}cm et 3${ESPACE}cm sur 3${ESPACE}cm ont le même périmètre (12${ESPACE}cm), `
      + `mais leurs aires sont <b>5${ESPACE}cm² et 9${ESPACE}cm²</b>.`],
    [`1${ESPACE}m² = 100${ESPACE}dm²`, true, `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = <b>100${ESPACE}dm²</b>.`],
    [`1${ESPACE}m² = 10${ESPACE}dm²`, false, `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = <b>100${ESPACE}dm²</b>. Pour les aires, 2 rangs par unité !`],
    [`1${ESPACE}m² = 10${ESPACE}000${ESPACE}cm²`, true, `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = <b>10${ESPACE}000${ESPACE}cm²</b>.`],
    [`1${ESPACE}m² = 1${ESPACE}000${ESPACE}cm²`, false, `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = <b>10${ESPACE}000${ESPACE}cm²</b>.`],
  ];

  ajouterEtape({
    id: '4e-mesures-aires',
    banque: ['triangle', 'triangle', 'parallelogramme', 'disque', 'disque', 'composee', 'composee', 'aireOuPerimetre',
      'aireOuPerimetre', 'unites', 'retrouver', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'triangle') {
        const t = tirerTriangleHauteur();
        const { xp, xq, h } = t;
        const b = net(xq - xp);
        const cote = t.rp || t.rq;
        const A = net(b * h / 2);
        // l’oubli du ÷ 2, le côté penché à la place de la hauteur, et un morceau de la base (ou [HQ] en entier) comme base
        const morceaux = xp < 0 ? [-xp * h / 2, xq * h / 2] : [xp * h / 2, xq * h / 2];
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire',
          enonce: `L’aire de ce triangle est ___${ESPACE}cm².${figureTriangleHauteur(t)}`,
          reponse: A,
          pieges: meilleursPieges(A, [b * h, b * cote / 2, b * cote, ...morceaux], 1),
          explication: `Aire du triangle = base × hauteur ÷ 2. La hauteur est en pointillés, perpendiculaire à la base : ${cm(h)}.<br>`
            + `${ecrire(b)} × ${h} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>⚠️ Le côté de ${cm(cote)} est penché : ce n’est pas la hauteur !`,
        }));
      }
      if (sorte === 'parallelogramme') {
        const p = tirerParallelogramme();
        const A = p.b * p.h;
        return choix({
          consigne: 'Calcule l’aire',
          enonce: `L’aire de ce parallélogramme est ___${ESPACE}cm².${figureParallelogramme(p)}`,
          reponse: A,
          // le côté à la place de la hauteur, la formule du triangle, le périmètre, une somme
          pieges: meilleursPieges(A, [p.b * p.c, A / 2, 2 * (p.b + p.c), p.b + p.h, p.b * p.c / 2, 2 * A], 1),
          explication: `Aire du parallélogramme = base × hauteur. La hauteur est en pointillés : ${cm(p.h)}.<br>`
            + `${p.b} × ${p.h} = <b>${mesure(A, 'cm²')}</b>.<br>⚠️ Le côté de ${cm(p.c)} est penché : ce n’est pas la hauteur. Et pas de ÷ 2 !`,
        });
      }
      if (sorte === 'disque') {
        const r = entier(3, 10);
        const d = 2 * r;
        const parDiametre = auHasard(0.35);
        const debut = parDiametre ? `Un disque a un diamètre de ${cm(d)}.` : `Un disque a un rayon de ${cm(r)}.`;
        const rayon = parDiametre ? `Le rayon est la moitié du diamètre : ${d} ÷ 2 = ${cm(r)}.<br>` : '';
        // le périmètre (2 × r), le diamètre pris pour le rayon (ou 2 × r²), l’oubli du carré
        const erreurs = [2 * r, parDiametre ? d * d : 2 * r * r, r];
        if (auHasard(0.45)) {
          const perimetre = `<br>⚠️ 2 × π × ${r} = ${avecPi(2 * r)}, c’est le périmètre du cercle, pas l’aire.`;
          return choix({
            consigne: 'Trouve l’aire exacte',
            enonce: `${debut} Son aire exacte est ___${ESPACE}cm².`,
            reponse: avecPi(r * r),
            pieges: meilleursPieges(avecPi(r * r), erreurs.map(avecPi)),
            explication: `${rayon}Aire du disque = π × r² = π × ${r} × ${r} = <b>${avecPi(r * r)}${ESPACE}cm²</b>.${perimetre}`,
          });
        }
        const A = foisPi(r * r);
        const perimetre = `<br>⚠️ 2 × 3,14 × ${r} = ${ecrire(foisPi(2 * r))}${ESPACE}cm, c’est le périmètre du cercle, pas l’aire.`;
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire',
          enonce: `${debut} Avec π ≈ 3,14, son aire est d’environ ___${ESPACE}cm².`,
          reponse: A,
          // (et l’oubli de π : r × r)
          pieges: meilleursPieges(A, [...erreurs.map(foisPi), r * r, foisPi(r * r / 2)]),
          explication: `${rayon}Aire du disque = π × r² ≈ 3,14 × ${r} × ${r} = 3,14 × ${r * r} = <b>${mesure(A, 'cm²')}</b>.${perimetre}`,
        }));
      }
      if (sorte === 'composee') {
        const f = tirerFigureComposee();
        return nombre({
          consigne: 'Découpe pour calculer',
          enonce: f.enonce + f.svg,
          reponse: f.aire,
          unite: f.unite,
          explication: f.explication,
        });
      }
      if (sorte === 'aireOuPerimetre') {
        const [situation, reponse, raison] = parmi(SITUATIONS);
        return choix({
          consigne: 'Aire, périmètre ou volume ?',
          enonce: `Pour ${situation}, on calcule ___.`,
          reponse,
          pieges: ['l’aire', 'le périmètre', 'le volume'],
          explication: `${raison} : on calcule <b>${reponse}</b> (${UNITES_SITUATIONS[reponse]}).`,
        });
      }
      if (sorte === 'unites') {
        if (auHasard(0.4)) {
          // Un tapis : la longueur en m, la largeur en cm
          // (pas 1 m : × 1, c’est trop facile)
          const Lm = parmi([1.5, 2, 2.5, 3]);
          const lc = parmi([40, 50, 60, 80, 120].filter(x => x < Lm * 100));
          const enM2 = auHasard();
          const [L, l] = enM2 ? [Lm, lc / 100] : [net(Lm * 100), lc];
          const A = net(L * l);
          return nombre({
            consigne: 'Attention aux unités',
            enonce: `Un tapis rectangulaire mesure ${mesure(Lm, 'm')} de long et ${cm(lc)} de large. Quelle est son aire, en ${enM2 ? 'm²' : 'cm²'} ?`,
            reponse: A,
            unite: enM2 ? 'm²' : 'cm²',
            explication: `On écrit tout dans la même unité : ${enM2 ? `${cm(lc)} = ${mesure(l, 'm')}` : `${mesure(Lm, 'm')} = ${cm(L)}`}.<br>`
              + `${ecrire(L)} × ${ecrire(l)} = <b>${mesure(A, enM2 ? 'm²' : 'cm²')}</b>.`,
          });
        }
        const [grande, petite, k] = parmi(CONVERSIONS_AIRES);
        const n = parmi([() => entier(2, 9), () => decimal(1, 9.9, 1), () => decimal(0.1, 0.9, 1)])();
        const versPetite = auHasard(0.65);
        const [de, vers, depart, reponse] = versPetite ? [grande, petite, n, decaler(n, k)] : [petite, grande, decaler(n, k), n];
        const sens = versPetite ? 1 : -1;
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce: `${mesure(depart, de)} = ___${ESPACE}${vers}`,
          reponse,
          // pas converti, 1 rang par unité (comme les longueurs), un rang de trop ou de moins, le mauvais sens
          pieges: meilleursPieges(reponse, [0, k / 2, k - 1, k + 1, k + 2, k + 3, -k].map(j => decaler(depart, sens * j))
            .filter(p => p >= 0.001 && p < 1e7)),
          explication: `${RELATIONS_AIRES[`${grande}-${petite}`]}.<br>${mesure(depart, de)} = <b>${mesure(reponse, vers)}</b>. `
            + '⚠️ Pour les aires, on décale de 2 rangs par unité !',
        }));
      }
      if (sorte === 'retrouver') {
        const cas = parmi(['triangle', 'parallelogramme', 'disque', 'carre']);
        if (cas === 'disque') {
          const r = entier(2, 10);
          return nombre({
            consigne: 'Retrouve la longueur',
            enonce: `Un disque a une aire exacte de ${avecPi(r * r)}${ESPACE}cm². Quel est son rayon ?`,
            reponse: r,
            unite: 'cm',
            explication: `π × r² = ${avecPi(r * r)}, donc r × r = ${r * r}.<br>Or ${r} × ${r} = ${r * r} : le rayon mesure <b>${cm(r)}</b>.`,
          });
        }
        if (cas === 'carre') {
          const c = entier(4, 12);
          return nombre({
            consigne: 'Retrouve la longueur',
            enonce: `Un carré a une aire de ${mesure(c * c, 'cm²')}. Quelle est la longueur de son côté ?`,
            reponse: c,
            unite: 'cm',
            explication: `Aire = côté × côté, et ${c} × ${c} = ${c * c} : le côté mesure <b>${cm(c)}</b>.`,
          });
        }
        const triangle = cas === 'triangle';
        let b;
        let h;
        do { [b, h] = [entier(3, 12), entier(2, 12)]; } while (triangle && (b * h) % 2);
        const A = triangle ? b * h / 2 : b * h;
        return nombre({
          consigne: 'Retrouve la hauteur',
          enonce: `Un ${triangle ? 'triangle' : 'parallélogramme'} a une aire de ${mesure(A, 'cm²')} et une base de ${cm(b)}. `
            + 'Quelle est la hauteur relative à cette base ?',
          reponse: h,
          unite: 'cm',
          explication: triangle
            ? `Aire = base × hauteur ÷ 2, donc base × hauteur = 2 × ${A} = ${2 * A}.<br>Hauteur = ${2 * A} ÷ ${b} = <b>${cm(h)}</b>.`
            : `Aire = base × hauteur, donc hauteur = aire ÷ base.<br>${A} ÷ ${b} = <b>${cm(h)}</b> (car ${b} × ${h} = ${A}).`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard(0.4)) {
        const r = entier(3, 9);
        return vraiFaux({
          enonce: `Un disque de rayon ${cm(r)} a une aire de ${avecPi(vrai ? r * r : 2 * r)}${ESPACE}cm².`,
          vrai,
          explication: `Aire = π × r² = π × ${r} × ${r} = <b>${avecPi(r * r)}${ESPACE}cm²</b>.`
            + (vrai ? '' : `<br>⚠️ ${avecPi(2 * r)} (2 × π × ${r}), c’est le périmètre du cercle, en cm.`),
        });
      }
      return vraiFauxDans(PROPRIETES_AIRES, vrai);
    },
    titreLecon: 'Les aires : révision',
    lecon: `
      <table>
        <tr><th>Rectangle</th><td>longueur × largeur</td></tr>
        <tr><th>Carré</th><td>côté × côté</td></tr>
        <tr><th>Triangle</th><td>base × hauteur ÷ 2</td></tr>
        <tr><th>Parallélogramme</th><td>base × hauteur</td></tr>
        <tr><th>Disque</th><td>π × rayon × rayon = π × r²</td></tr>
      </table>
      <p>La <b>hauteur</b> relative à une base est perpendiculaire à cette base (en pointillés, avec l’angle droit) : ce n’est pas
        un côté penché ! Dans un triangle, elle peut tomber à l’extérieur.</p>
      ${figureLeconParallelogramme()}
      <p>👉 <i>Triangle de base 8&nbsp;cm et de hauteur 5&nbsp;cm : 8 × 5 ÷ 2 = 20&nbsp;cm²</i> ·
        <i>Disque de rayon 3&nbsp;cm : π × 3 × 3 = 9π&nbsp;cm² ≈ 3,14 × 9 = 28,26&nbsp;cm²</i></p>
      <p><b>Figures composées :</b> on découpe en figures simples et on additionne leurs aires (ou on enlève l’aire du morceau en trop).
        Un demi-disque a la moitié de l’aire du disque.</p>
      <p><b>À l’envers :</b> hauteur du parallélogramme = aire ÷ base ; hauteur du triangle = 2 × aire ÷ base ;
        un disque d’aire 49π&nbsp;cm² a un rayon de 7&nbsp;cm (7 × 7 = 49).</p>
      <p><b>Aire, périmètre ou volume ?</b> L’aire mesure une surface (cm², m²) ; le périmètre, la longueur du tour (cm, m) :
        pour un cercle, 2 × π × r ; le volume, la place à l’intérieur d’un solide (cm³, m³, L).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> écris toutes les longueurs dans la même unité avant de calculer.
        1&nbsp;m² = 100&nbsp;dm² = 10&nbsp;000&nbsp;cm² et 1&nbsp;cm² = 100&nbsp;mm² : pour les aires, on décale de 2 rangs par unité !</div>
      <p>⚠️ Si on te donne le diamètre d’un disque, divise-le d’abord par 2 pour avoir le rayon.</p>
    `,
  });

  // ======================================================================
  // 3. La vitesse moyenne
  // ======================================================================
  // Les trajets : qui, comment, et des vitesses moyennes (en km/h) et des durées (en min) réalistes
  // verbe : « Léa parcourt 6 km à pied », « Roxy court 3 km » ; roule : « Léa marche à 4 km/h », « Tom roule à vélo à 15 km/h » ;
  // enAllant : « En marchant pendant 2 h… »
  const MOYENS = [
    { sujet: '', verbe: 'parcourt', facon: 'à pied', roule: 'marche', enAllant: 'En marchant', vitesses: [3, 4, 5],
      durees: [30, 45, 60, 90, 120, 150, 180] },
    { sujet: '', verbe: 'parcourt', facon: 'à vélo', roule: 'roule à vélo', enAllant: 'En roulant à vélo', vitesses: [12, 14, 15, 16, 18, 20],
      durees: [30, 45, 60, 75, 90, 105, 120, 150] },
    { sujet: 'Une voiture', pronom: 'elle', verbe: 'parcourt', facon: '', roule: 'roule', enAllant: 'En roulant',
      vitesses: [50, 60, 70, 80, 90, 100, 110, 120], durees: [30, 45, 60, 90, 105, 120, 135, 150, 180] },
    { sujet: 'Un TGV', pronom: 'il', verbe: 'parcourt', facon: '', roule: 'roule', enAllant: 'En roulant', vitesses: [200, 220, 240, 260, 280],
      durees: [30, 45, 60, 75, 90, 120, 150, 180] },
    // (un renard ne garde pas longtemps une grande vitesse : de 24 à 36 km/h, pendant un quart d’heure au plus)
    { sujet: 'Roxy', pronom: 'elle', verbe: 'court', facon: '', roule: 'court', enAllant: 'En courant', vitesses: [24, 30, 36],
      durees: [5, 6, 10, 12, 15] },
  ];
  // Un trajet au hasard, dont la distance tombe juste (au plus un chiffre après la virgule).
  // garder : pour ne prendre que certaines durées
  function tirerTrajet(garder = () => true) {
    for (;;) {
      const m = parmi(MOYENS);
      const [nom, pronom] = m.sujet ? [m.sujet, m.pronom] : parmi(PRENOMS);
      const durees = m.durees.filter(garder);
      if (!durees.length) continue;
      const v = parmi(m.vitesses);
      const t = parmi(durees);
      const d = net(v * t / 60);
      if (propre(d, 1)) return { ...m, nom, pronom, v, t, d };
    }
  }
  // « Léa parcourt 6 km à pied », « Roxy court 3 km », « Une voiture parcourt 150 km »
  const trajetFait = ({ nom, verbe, facon, d }) => `${nom} ${verbe} ${mesure(d, 'km')}${facon ? ` ${facon}` : ''}`;
  // … et avec la vitesse : « Tom parcourt 36 km à vélo, à 16 km/h de moyenne »
  const trajetAVitesse = tr => `${trajetFait(tr)}${tr.facon ? ',' : ''} à ${mesure(tr.v, 'km/h')} de moyenne`;

  // Une durée en heures, avec l’explication : « 1 h 30 min = 1,5 h (30 ÷ 60 = 0,5). » ; « 45 min = 45 ÷ 60 = 0,75 h. »
  function dureeEnHeures(t) {
    if (t % 60 === 0) return '';
    if (t < 60) return `${mesure(t, 'min')} = ${t} ÷ 60 = ${mesure(enHeures(t), 'h')}.<br>`;
    return `${duree(t)} = ${mesure(enHeures(t), 'h')} (${t % 60} ÷ 60 = ${ecrire(enHeures(t % 60))}).<br>`;
  }
  // Une durée « bien écrite » en heures : 6 min = 0,1 h, 45 min = 0,75 h… (pas 10 min = 0,1666… h)
  const bonneDuree = t => decimalesDe(enHeures(t)) <= 2;
  // Les durées avec lesquelles on divise de tête : un diviseur de 60 (5, 6, 10, 12, 15, 20, 30 min), 45 min, 1 h 15 min,
  // 1 h 30 min, 2 h 30 min et des heures entières (pas 1 h tout rond : la vitesse serait la distance, c’est trop facile).
  // Pas 1 h 45 min ni 2 h 15 min : 157,5 ÷ 1,75 ou 247,5 ÷ 2,25, c’est trop dur sans calculatrice.
  const dureeFacile = t => t !== 60 && ((t < 60 && 60 % t === 0) || [45, 75, 90, 120, 150, 180].includes(t));

  // Pour calculer de tête, on découpe la durée en heures, en demi-heures ou en quarts d’heure
  const morceau = t => [60, 30, 15].find(u => t % u === 0);
  const unMorceau = u => ({ 60: 'une heure', 30: 'une demi-heure', 15: 'un quart d’heure' })[u];
  const morceaux = (q, u) => `${q}${ESPACE}${({ 60: 'heures', 30: 'demi-heures', 15: 'quarts d’heure' })[u]}`;

  // v = d ÷ t, expliqué selon la durée (t : une « durée facile »)
  function expliquerVitesse({ v, t, d }) {
    if (t < 60 && 60 % t === 0) {
      return `En ${mesure(t, 'min')}, ${mesure(d, 'km')}. En 1${ESPACE}h = 60${ESPACE}min, c’est ${60 / t} fois plus long : `
        + `${ecrire(d)} × ${60 / t} = <b>${mesure(v, 'km/h')}</b>.`;
    }
    const u = morceau(t);
    if (u === 60) return `v = d ÷ t = ${ecrire(d)} ÷ ${t / 60} = <b>${mesure(v, 'km/h')}</b>.`;
    const part = net(v * u / 60);
    return `${duree(t)}, c’est ${morceaux(t / u, u)}. En ${unMorceau(u)} : ${ecrire(d)} ÷ ${t / u} = ${mesure(part, 'km')}.<br>`
      + `En 1${ESPACE}h (${morceaux(60 / u, u)}) : ${ecrire(part)} × ${60 / u} = <b>${mesure(v, 'km/h')}</b>.`;
  }
  // t = d ÷ v, expliqué de la même façon ; enMinutes : la réponse est un nombre de minutes
  function expliquerTemps({ v, t, d }, enMinutes = false) {
    const resultat = enMinutes ? mesure(t, 'min') : duree(t);
    if (t < 60 && 60 % t === 0) {
      return `En 1${ESPACE}h (60${ESPACE}min), on parcourrait ${mesure(v, 'km')}. ${mesure(d, 'km')}, c’est ${v / d} fois moins : `
        + `60 ÷ ${v / d} = <b>${resultat}</b>.`;
    }
    const u = morceau(t);
    if (u === 60) return `t = d ÷ v = ${ecrire(d)} ÷ ${v} = ${mesure(t / 60, 'h')}${enMinutes ? ` = ${t / 60} × 60 = <b>${resultat}</b>` : ''}.`;
    const part = net(v * u / 60);
    return `En ${unMorceau(u)}, on parcourt ${v} ÷ ${60 / u} = ${mesure(part, 'km')}. ${mesure(d, 'km')}, c’est ${t / u} fois ${mesure(part, 'km')} :<br>`
      + `${t / u} × ${u}${ESPACE}min = ${mesure(t, 'min')}${enMinutes ? '' : ` = <b>${duree(t)}</b>`}`
      + `${enMinutes ? `, soit <b>${resultat}</b>` : ''}.`;
  }

  // L’erreur classique : lire les chiffres après la virgule comme des minutes (2,25 h → « 2 h 25 min » ; 1,5 h → « 1 h 50 min »)
  function minutesNaives(t) {
    const [ent, dec] = ecrire(enHeures(t)).split(',');
    if (!dec || dec.length > 2) return null;
    const m = Number(dec.length === 1 ? dec + '0' : dec);
    return m < 60 && m !== t % 60 ? 60 * Number(ent) + m : null;
  }
  // Des durées fausses (en minutes), qui viennent d’erreurs classiques :
  // - les chiffres après la virgule lus comme des minutes : 1,5 h → « 1 h 50 min » ; 1,9 h → « 1 h 90 min », c’est-à-dire 2 h 30 min ;
  // - v ÷ d au lieu de d ÷ v (6 km à 3 km/h : 3 ÷ 6 = 0,5 h, soit 30 min), ou ce nombre lu comme des minutes ;
  // - un seul chiffre lu tel quel : 1,5 h → « 1 h 5 min » ; 0,4 h → « 4 min » ;
  // - × 100 au lieu de × 60 : 1,4 h → 140 min ;
  // - et seulement s’il manque des pièges : une heure de trop ou de moins.
  function dureesFausses(t, v = null, d = null) {
    const x = enHeures(t);
    const [ent, dec = ''] = ecrire(x).split(',');
    const h = Number(ent);
    const erreurs = [];
    if (dec.length === 1 || dec.length === 2) erreurs.push(60 * h + Number(dec.length === 1 ? dec + '0' : dec));
    if (v && d) {
      const inverse = net(v / d);
      if (propre(inverse * 60, 0)) erreurs.push(net(inverse * 60));
      if (Number.isInteger(inverse)) erreurs.push(inverse);
    }
    if (dec.length === 1) erreurs.push(60 * h + Number(dec));
    if (dec.length === 1 || dec.length === 2) erreurs.push(Math.round(x * 100));
    erreurs.push(t + 60, t - 60, t + 30, t - 30);
    return [...new Set(erreurs)].filter(e => Number.isInteger(e) && e > 0 && e !== t && e <= 4 * t + 60).slice(0, 3);
  }

  // Un horaire (en minutes depuis minuit) : horaire(870) → « 14 h 30 » ; horaire(840) → « 14 h »
  const horaire = minutes => (minutes % 60 ? `${Math.floor(minutes / 60)}${ESPACE}h${ESPACE}${String(minutes % 60).padStart(2, '0')}`
    : `${minutes / 60}${ESPACE}h`);

  const FORMULES_VITESSE = [
    ['d = v × t', true], ['t = d ÷ v', true], ['v = d ÷ t', true], ['d = v ÷ t', false], ['t = v ÷ d', false], ['v = d × t', false],
  ];

  ajouterEtape({
    id: '4e-mesures-vitesse',
    banque: ['vitesse', 'vitesse', 'distance', 'distance', 'duree', 'heuresDecimales', 'heuresDecimales', 'comparer',
      'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'vitesse') {
        const trajet = tirerTrajet(dureeFacile);
        return nombre({
          consigne: 'Calcule la vitesse moyenne',
          enonce: `${trajetFait(trajet)} en ${duree(trajet.t)}. Quelle est sa vitesse moyenne ?`,
          reponse: trajet.v,
          unite: 'km/h',
          explication: expliquerVitesse(trajet),
        });
      }
      if (sorte === 'distance') {
        // Une durée avec des heures et des minutes, c’est là qu’on se trompe (ici, on multiplie : 80 × 1,75 se pose bien)
        const { nom, pronom, roule, v, t, d } = tirerTrajet(x => x > 60 && x % 60 !== 0 && bonneDuree(x));
        const [h, m] = [Math.floor(t / 60), t % 60];
        const virgule = net(v * (h + m / 100));
        // l’oubli des minutes, l’oubli des heures, l’heure commencée comptée en entier, un quart d’heure, une demi-heure
        // ou une heure de trop ou de moins ; et « 1 h 30 min = 1,30 h », toujours proposé (3 fois sur 4)
        return choixAvecErreur({
          consigne: 'Calcule la distance',
          enonce: `${nom} ${roule} à ${mesure(v, 'km/h')} pendant ${duree(t)}. ${majuscule(pronom)} parcourt ___${ESPACE}km.`,
          reponse: d,
          explication: `${dureeEnHeures(t)}d = v × t = ${v} × ${ecrire(enHeures(t))} = <b>${mesure(d, 'km')}</b>.<br>`
            + `⚠️ ${duree(t)}, ce n’est pas ${ecrire(net(h + m / 100))}${ESPACE}h : une heure fait 60${ESPACE}min, pas 100 !`,
        }, virgule, [v * h, net(v * m / 60), v * (h + 1), net(d + v / 4), net(d - v / 4), net(d + v / 2), net(d + v)]
          .filter(x => propre(x, 2)));
      }
      if (sorte === 'duree') {
        const trajet = tirerTrajet(dureeFacile);
        const { t } = trajet;
        const naive = minutesNaives(t);
        return choix({
          consigne: 'Calcule la durée',
          enonce: `${trajetAVitesse(trajet)}. Le trajet dure ___.`,
          reponse: duree(t),
          pieges: dureesFausses(t, trajet.v, trajet.d).map(duree),
          explication: expliquerTemps(trajet)
            + (naive ? `<br>⚠️ t = ${mesure(enHeures(t), 'h')}, et ce n’est pas ${duree(naive)} : une heure fait 60${ESPACE}min, pas 100 !` : ''),
        });
      }
      if (sorte === 'heuresDecimales') {
        const h = entier(0, 3);
        const m = parmi([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54, 30, 15, 45]);
        const t = 60 * h + m;
        const x = enHeures(t);
        const virgule = net(h + m / 100);
        const versHeures = {
          consigne: 'Écris la durée en heures',
          enonce: `${duree(t)} = ___${ESPACE}h`,
          reponse: x,
          explication: (h ? `${m}${ESPACE}min = ${m} ÷ 60 = ${mesure(enHeures(m), 'h')}, donc ${duree(t)} = ${h} + ${ecrire(enHeures(m))} = <b>${mesure(x, 'h')}</b>`
            : `${m}${ESPACE}min = ${m} ÷ 60 = <b>${mesure(x, 'h')}</b>`) + `.<br>⚠️ ${duree(t)}, ce n’est pas ${ecrire(virgule)}${ESPACE}h !`,
        };
        if (auHasard()) {
          // Sans heures entières (45 min), il y a trop peu d’erreurs classiques pour 3 pièges : la réponse est à écrire
          if (!h || auHasard(0.3)) return nombre(versHeures);
          // « 1 h 30 min = 1,30 h » (toujours proposé, 3 fois sur 4) ; les minutes « en centièmes » (90 min → 0,9 h) ;
          // l’oubli des heures ; 60 ÷ 30 au lieu de 30 ÷ 60 ; l’heure commencée comptée en entier ; une heure de trop ou de moins
          return choixAvecErreur(versHeures, virgule, [net(t / 100), enHeures(m), [15, 30].includes(m) ? h + 60 / m : null, h + 1, x + 1, x - 1]
            .filter(p => p !== null && propre(p, 2)));
        }
        return choix({
          consigne: 'Écris la durée en heures et minutes',
          enonce: `${mesure(x, 'h')} = ___`,
          reponse: duree(t),
          pieges: dureesFausses(t).map(duree),
          explication: (h ? `${ecrire(enHeures(m))}${ESPACE}h = ${ecrire(enHeures(m))} × 60 = ${mesure(m, 'min')}, donc ${mesure(x, 'h')} = <b>${duree(t)}</b>.`
            : `${mesure(x, 'h')} = ${ecrire(x)} × 60 = <b>${mesure(m, 'min')}</b>.`) + '<br>⚠️ Une heure fait 60 minutes, pas 100 !',
        });
      }
      if (sorte === 'comparer') {
        for (;;) {
          const enfants = RM.melanger(PRENOMS.slice(0, 8)).slice(0, 3).map(([nom]) => nom);
          const vitesses = RM.melanger([10, 12, 14, 15, 16, 18, 20]).slice(0, 3);
          // (des durées avec lesquelles on divise de tête : ÷ 0,5 ; ÷ 1 ; ÷ 1,5 ; ÷ 2)
          const durees = vitesses.map(() => parmi([30, 60, 90, 120]));
          const d = vitesses.map((v, i) => net(v * durees[i] / 60));
          if (d.some(x => !propre(x, 1)) || new Set(durees).size < 2) continue;
          const plusVite = auHasard(0.65);
          const cible = plusVite ? Math.max(...vitesses) : Math.min(...vitesses);
          const i = vitesses.indexOf(cible);
          // Le « raccourci » à éviter : celui qui va le plus loin n’est pas forcément le plus rapide
          const naif = d.indexOf(plusVite ? Math.max(...d) : Math.min(...d));
          if (naif === i && auHasard(0.8)) continue;
          const details = enfants.map((nom, j) => `${nom} : ${ecrire(d[j])} ÷ ${ecrire(enHeures(durees[j]))} = ${mesure(vitesses[j], 'km/h')}`);
          return choix({
            consigne: 'Compare les vitesses',
            enonce: `À vélo, ${enfants[0]} fait ${mesure(d[0], 'km')} en ${duree(durees[0])}, ${enfants[1]} ${mesure(d[1], 'km')} `
              + `en ${duree(durees[1])} et ${enfants[2]} ${mesure(d[2], 'km')} en ${duree(durees[2])}. Qui roule le ${plusVite ? 'plus' : 'moins'} vite ?`,
            reponse: enfants[i],
            pieges: enfants.filter((n, j) => j !== i),
            explication: `On calcule les vitesses moyennes (v = d ÷ t, avec t en heures) :<br>${details.join(' ; ')}.<br>`
              + `Le ${plusVite ? 'plus' : 'moins'} rapide : <b>${enfants[i]}</b>.`,
          });
        }
      }
      if (sorte === 'probleme') {
        if (auHasard()) {
          // Une durée en minutes
          const trajet = tirerTrajet(dureeFacile);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `${trajetAVitesse(trajet)}. Combien de minutes dure le trajet ?`,
            reponse: trajet.t,
            unite: 'min',
            explication: expliquerTemps(trajet, true),
          });
        }
        // Un départ et une arrivée : on calcule d’abord la durée
        const { nom, facon, v, t, d } = tirerTrajet(x => x >= 30 && dureeFacile(x));
        const depart = 60 * entier(8, 15) + parmi([0, 15, 30, 45]);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `${nom} part à ${horaire(depart)} et arrive à ${horaire(depart + t)}, après ${mesure(d, 'km')}${facon ? ` ${facon}` : ''}. `
            + 'Quelle est sa vitesse moyenne ?',
          reponse: v,
          unite: 'km/h',
          explication: `De ${horaire(depart)} à ${horaire(depart + t)}, il s’écoule ${duree(t)}.<br>${expliquerVitesse({ v, t, d })}`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['formule', 'heures', 'calcul', 'minutes']);
      if (famille === 'formule') {
        const [formule] = parmi(FORMULES_VITESSE.filter(([, v]) => v === vrai));
        return vraiFaux({
          enonce: `Avec v la vitesse moyenne, d la distance et t la durée : ${formule}.`,
          vrai,
          explication: 'La vitesse, c’est la distance divisée par la durée : <b>v = d ÷ t</b> (des km divisés par des h : des km/h).<br>'
            + 'Donc <b>d = v × t</b> et <b>t = d ÷ v</b>.',
        });
      }
      if (famille === 'heures') {
        const t = parmi([90, 150, 75, 135, 72, 84, 30, 15, 36, 48, 102, 138]);
        const faux = minutesNaives(t);
        const [h, m] = [Math.floor(t / 60), t % 60];
        if (faux && auHasard()) {
          return vraiFaux({
            enonce: `${mesure(enHeures(t), 'h')} = ${duree(vrai ? t : faux)}`,
            vrai,
            explication: (h ? `${ecrire(enHeures(m))}${ESPACE}h = ${ecrire(enHeures(m))} × 60 = ${mesure(m, 'min')}, donc ${mesure(enHeures(t), 'h')} = <b>${duree(t)}</b>.`
              : `${mesure(enHeures(t), 'h')} = ${ecrire(enHeures(t))} × 60 = <b>${mesure(m, 'min')}</b>.`) + '<br>⚠️ Une heure fait 60 minutes, pas 100 !',
          });
        }
        return vraiFaux({
          enonce: `${duree(t)} = ${mesure(vrai ? enHeures(t) : net(h + m / 100), 'h')}`,
          vrai,
          explication: (h ? `${m}${ESPACE}min = ${m} ÷ 60 = ${mesure(enHeures(m), 'h')}, donc ${duree(t)} = <b>${mesure(enHeures(t), 'h')}</b>.`
            : `${m}${ESPACE}min = ${m} ÷ 60 = <b>${mesure(enHeures(t), 'h')}</b>.`) + `<br>⚠️ ${duree(t)}, ce n’est pas ${ecrire(net(h + m / 100))}${ESPACE}h !`,
        });
      }
      if (famille === 'calcul') {
        const { v, t, d, enAllant } = tirerTrajet(x => x > 60 && x % 60 !== 0 && bonneDuree(x));
        const [h, m] = [Math.floor(t / 60), t % 60];
        const virgule = net(v * (h + m / 100));
        const faux = parmi([virgule, v * h].filter(x => propre(x, 2) && !egaux(x, d)));
        let attention = '';
        if (!vrai && faux === virgule) attention = `<br>⚠️ ${duree(t)}, ce n’est pas ${ecrire(net(h + m / 100))}${ESPACE}h : une heure fait 60${ESPACE}min, pas 100 !`;
        else if (!vrai) attention = `<br>⚠️ ${v} × ${h} = ${ecrire(faux)} : il ne faut pas oublier les ${m}${ESPACE}min !`;
        return vraiFaux({
          enonce: `${enAllant} pendant ${duree(t)} à ${mesure(v, 'km/h')}, on parcourt ${mesure(vrai ? d : faux, 'km')}.`,
          vrai,
          explication: `${dureeEnHeures(t)}d = v × t = ${v} × ${ecrire(enHeures(t))} = <b>${mesure(d, 'km')}</b>.${attention}`,
        });
      }
      const t = parmi([10, 12, 15, 20, 30]);
      const d = parmi([2, 3, 4, 5, 6, 8, 10]);
      const v = d * 60 / t;
      // Les erreurs : la distance prise pour la vitesse, d × t, ou 100 minutes dans une heure
      const faux = parmi([d, d * t, net(d * 100 / t)].filter(x => propre(x, 1) && !egaux(x, v)));
      let attention = '';
      if (!vrai && faux === d) attention = `<br>⚠️ ${mesure(d, 'km/h')}, ce serait ${mesure(d, 'km')} en une heure entière.`;
      else if (!vrai && faux === d * t) attention = `<br>⚠️ ${d} × ${t} = ${faux} : on ne multiplie pas des km par des minutes !`;
      else if (!vrai) attention = '<br>⚠️ Une heure fait 60 minutes, pas 100 !';
      return vraiFaux({
        enonce: `Parcourir ${mesure(d, 'km')} en ${mesure(t, 'min')}, c’est aller à ${mesure(vrai ? v : faux, 'km/h')} de moyenne.`,
        vrai,
        explication: `En 1${ESPACE}h = 60${ESPACE}min, c’est ${60 / t} fois plus long : ${d} × ${60 / t} = <b>${mesure(v, 'km/h')}</b>.${attention}`,
      });
    },
    titreLecon: 'La vitesse moyenne',
    lecon: `
      <p>La <b>vitesse moyenne</b>, c’est la distance parcourue divisée par la durée du trajet.
        En km/h (« kilomètres par heure ») : le nombre de kilomètres parcourus en une heure.</p>
      <table>
        <tr><th>Vitesse</th><td>v = d ÷ t</td><td><i>45&nbsp;km en 3&nbsp;h : 45 ÷ 3 = 15&nbsp;km/h</i></td></tr>
        <tr><th>Distance</th><td>d = v × t</td><td><i>2&nbsp;h à 80&nbsp;km/h : 80 × 2 = 160&nbsp;km</i></td></tr>
        <tr><th>Durée</th><td>t = d ÷ v</td><td><i>150&nbsp;km à 100&nbsp;km/h : 150 ÷ 100 = 1,5&nbsp;h</i></td></tr>
      </table>
      <h4>Les durées en heures</h4>
      <p>Pour calculer avec des km/h, on écrit la durée en heures (minutes ÷ 60) : 30&nbsp;min = 0,5&nbsp;h ·
        15&nbsp;min = 0,25&nbsp;h · 45&nbsp;min = 0,75&nbsp;h · 6&nbsp;min = 0,1&nbsp;h.</p>
      <p>👉 <i>1&nbsp;h&nbsp;30&nbsp;min = 1,5&nbsp;h</i> · et dans l’autre sens : <i>2,25&nbsp;h = 2&nbsp;h + 0,25 × 60&nbsp;min
        = 2&nbsp;h&nbsp;15&nbsp;min</i>.</p>
      <p>⚠️ 1&nbsp;h&nbsp;30&nbsp;min, ce n’est pas 1,3&nbsp;h ; et 1,5&nbsp;h, ce n’est pas 1&nbsp;h&nbsp;50&nbsp;min :
        une heure fait 60 minutes, pas 100 !</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour calculer de tête, découpe la durée. 3&nbsp;km en 10&nbsp;min → 60&nbsp;min,
        c’est 6 fois plus : 3 × 6 = 18&nbsp;km/h. 45&nbsp;km en 1&nbsp;h&nbsp;30&nbsp;min, c’est 3 demi-heures : 45 ÷ 3 = 15&nbsp;km par
        demi-heure, donc 15 × 2 = 30&nbsp;km/h.</div>
      <p>Pour comparer des trajets, on compare les <b>vitesses</b> : aller le plus loin, ce n’est pas forcément aller le plus vite !</p>
      <p>Des repères : à pied ≈ 5&nbsp;km/h · à vélo ≈ 15&nbsp;km/h · en voiture sur l’autoroute 130&nbsp;km/h · en TGV ≈ 300&nbsp;km/h.</p>
    `,
  });

  // ======================================================================
  // 4. Convertir des vitesses
  // ======================================================================
  // [qui, le verbe, des vitesses réalistes en m/s]
  const MOBILES = [
    ['Un joggeur', 'court', [2, 2.5, 3, 3.5, 4]], ['Une cycliste', 'roule', [4, 5, 6, 7, 7.5, 8, 10]], ['Roxy', 'court', [10, 12]],
    ['Un cheval', 'galope', [12, 15]], ['Une voiture', 'roule', [15, 20, 22.5, 25, 30, 32.5, 35]], ['Un TGV', 'roule', [60, 70, 75, 80]],
    ['Un guépard', 'court', [25, 30]],
  ];
  // Pour comparer : [le nom, des vitesses réalistes en m/s]
  // (des vitesses qui se chevauchent : chacun peut être le plus rapide)
  const COUREURS = [['le guépard', [20, 25, 30]], ['le lièvre', [12, 15, 18, 20]], ['le cheval', [10, 12, 15, 18]],
    ['Roxy', [8, 10, 12]], ['le cycliste', [5, 6, 8, 10]], ['la voiture', [10, 15, 20, 25]], ['le coureur', [4, 5, 6, 8]]];
  // Pour passer d’une unité à l’autre : [de, vers, l’opération, pourquoi]
  const OPERATIONS = [
    ['km/h', 'm/s', '÷ 3,6', `1${ESPACE}km/h, c’est 1${ESPACE}000${ESPACE}m en 3${ESPACE}600${ESPACE}s : on <b>divise par 3,6</b> (36${ESPACE}km/h = 10${ESPACE}m/s).`],
    ['m/s', 'km/h', '× 3,6', `1${ESPACE}m/s, c’est 3${ESPACE}600${ESPACE}m en une heure, soit 3,6${ESPACE}km/h : on <b>multiplie par 3,6</b> (10${ESPACE}m/s = 36${ESPACE}km/h).`],
    ['m/s', 'm/min', '× 60', `En 1${ESPACE}min = 60${ESPACE}s, on va 60 fois plus loin qu’en 1${ESPACE}s : on <b>multiplie par 60</b> (2${ESPACE}m/s = 120${ESPACE}m/min).`],
    ['m/min', 'm/s', '÷ 60', `En 1${ESPACE}s, on va 60 fois moins loin qu’en 1${ESPACE}min : on <b>divise par 60</b> (120${ESPACE}m/min = 2${ESPACE}m/s).`],
    ['km/min', 'km/h', '× 60', `En 1${ESPACE}h = 60${ESPACE}min, on va 60 fois plus loin qu’en 1${ESPACE}min : on <b>multiplie par 60</b> (2${ESPACE}km/min = 120${ESPACE}km/h).`],
    ['km/h', 'km/min', '÷ 60', `En 1${ESPACE}min, on va 60 fois moins loin qu’en 1${ESPACE}h : on <b>divise par 60</b> (90${ESPACE}km/h = 1,5${ESPACE}km/min).`],
  ];

  ajouterEtape({
    id: '4e-mesures-conversions-vitesses',
    banque: ['versMs', 'versMs', 'versKmh', 'versKmh', 'minutes', 'comparer', 'comparer', 'plusRapide', 'operation', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'versMs') {
        const [qui, verbe, vitesses] = parmi(MOBILES);
        const ms = parmi(vitesses);
        const kmh = net(3.6 * ms);
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis en m/s',
          enonce: `${qui} ${verbe} à ${mesure(kmh, 'km/h')}, soit ___${ESPACE}m/s.`,
          reponse: ms,
          // le mauvais sens (× 3,6), pas de conversion, la virgule (÷ 36 ou ÷ 0,36), ÷ 60, les m/min, les km oubliés (÷ 3 600 sans × 1 000)
          pieges: meilleursPieges(ms, [net(kmh * 3.6), kmh, net(kmh / 36), net(kmh * 1000 / 360), net(kmh / 60), net(kmh * 1000 / 60),
            net(kmh / 3600)], 3),
          explication: `${mesure(kmh, 'km/h')}, c’est ${ecrire(kmh * 1000)}${ESPACE}m en 3${ESPACE}600${ESPACE}s. On divise par 3,6 :<br>`
            + `${ecrire(kmh)} ÷ 3,6 = <b>${mesure(ms, 'm/s')}</b> (et ${ecrire(ms)} × 3,6 = ${ecrire(kmh)}).`,
        }));
      }
      if (sorte === 'versKmh') {
        const [qui, verbe, vitesses] = parmi(MOBILES);
        const ms = parmi(vitesses);
        return nombre({
          consigne: 'Convertis en km/h',
          enonce: `${qui} ${verbe} à ${mesure(ms, 'm/s')}. Quelle est sa vitesse en km/h ?`,
          reponse: net(3.6 * ms),
          unite: 'km/h',
          explication: `1${ESPACE}m/s, c’est 3${ESPACE}600${ESPACE}m en une heure, soit 3,6${ESPACE}km/h. On multiplie par 3,6 :<br>`
            + `${ecrire(ms)} × 3,6 = <b>${mesure(net(3.6 * ms), 'km/h')}</b>.`,
        });
      }
      if (sorte === 'minutes') {
        const cas = parmi(['ms-mmin', 'mmin-ms', 'kmh-mmin', 'mmin-kmh']);
        if (cas === 'ms-mmin') {
          const v = parmi([0.5, 1.5, 2, 2.5, 3, 4, 5]);
          return nombre({
            consigne: 'Convertis',
            enonce: `${mesure(v, 'm/s')} = ___${ESPACE}m/min`,
            reponse: net(v * 60),
            explication: `En 1${ESPACE}min = 60${ESPACE}s, on va 60 fois plus loin qu’en 1${ESPACE}s :<br>${ecrire(v)} × 60 = <b>${mesure(net(v * 60), 'm/min')}</b>.`,
          });
        }
        if (cas === 'mmin-ms') {
          const v = parmi([30, 90, 120, 150, 180, 240, 300, 600]);
          return nombre({
            consigne: 'Convertis',
            enonce: `${mesure(v, 'm/min')} = ___${ESPACE}m/s`,
            reponse: net(v / 60),
            explication: `En 1${ESPACE}s, on va 60 fois moins loin qu’en 1${ESPACE}min :<br>${v} ÷ 60 = <b>${mesure(net(v / 60), 'm/s')}</b>.`,
          });
        }
        if (cas === 'kmh-mmin') {
          const v = parmi([3, 6, 12, 18, 24, 30, 36, 48, 60, 90]);
          return nombre({
            consigne: 'Convertis',
            enonce: `${mesure(v, 'km/h')} = ___${ESPACE}m/min`,
            reponse: net(v * 1000 / 60),
            explication: `${mesure(v, 'km/h')}, c’est ${mesure(v * 1000, 'm')} en 60${ESPACE}min.<br>`
              + `${ecrire(v * 1000)} ÷ 60 = <b>${mesure(net(v * 1000 / 60), 'm/min')}</b>.`,
          });
        }
        const v = parmi([50, 100, 200, 250, 500, 1000, 1500]);
        return nombre({
          consigne: 'Convertis',
          enonce: `${mesure(v, 'm/min')} = ___${ESPACE}km/h`,
          reponse: net(v * 60 / 1000),
          explication: `En 1${ESPACE}h = 60${ESPACE}min, on parcourt ${ecrire(v)} × 60 = ${mesure(v * 60, 'm')}, `
            + `soit <b>${mesure(net(v * 60 / 1000), 'km')}</b> : ${mesure(v, 'm/min')} = <b>${mesure(net(v * 60 / 1000), 'km/h')}</b>.`,
        });
      }
      if (sorte === 'comparer') {
        const ms = parmi([5, 10, 15, 20, 25, 30]);
        const kmh = net(3.6 * ms);
        const autre = auHasard(0.2) ? kmh : net(kmh + parmi([-10, -6, -4, -2, 2, 4, 6, 10]));
        const msAGauche = auHasard();
        const [gauche, droite] = msAGauche ? [mesure(ms, 'm/s'), mesure(autre, 'km/h')] : [mesure(autre, 'km/h'), mesure(ms, 'm/s')];
        const [vG, vD] = msAGauche ? [kmh, autre] : [autre, kmh];
        const reponse = signe(vG, vD);
        return choix({
          consigne: 'Compare avec <, > ou =',
          enonce: `${gauche} ___ ${droite}`,
          reponse,
          choix: ['<', '=', '>'],
          explication: `On écrit les deux vitesses dans la même unité : ${mesure(ms, 'm/s')} = ${ms} × 3,6 = ${mesure(kmh, 'km/h')}.<br>`
            + `${mesure(vG, 'km/h')} ${SIGNES[reponse]} ${mesure(vD, 'km/h')}, donc <b>${gauche} ${SIGNES[reponse]} ${droite}</b>.`,
        });
      }
      if (sorte === 'plusRapide') {
        for (;;) {
          const trois = RM.melanger(COUREURS).slice(0, 3).map(([nom, vitesses]) => ({ nom, ms: parmi(vitesses), enKmh: auHasard() }));
          const vitesses = trois.map(c => c.ms);
          // Des vitesses assez proches, toutes différentes, et pas toutes dans la même unité
          if (new Set(vitesses).size < 3 || Math.max(...vitesses) - Math.min(...vitesses) > 10
            || trois.every(c => c.enKmh) || trois.every(c => !c.enKmh)) continue;
          const plusVite = auHasard(0.65);
          const cible = plusVite ? Math.max(...vitesses) : Math.min(...vitesses);
          const i = vitesses.indexOf(cible);
          // Le piège : comparer les nombres sans regarder les unités
          const ecrits = trois.map(c => (c.enKmh ? net(3.6 * c.ms) : c.ms));
          const naif = ecrits.indexOf(plusVite ? Math.max(...ecrits) : Math.min(...ecrits));
          if (naif === i && auHasard(0.8)) continue;
          const texte = c => (c.enKmh ? mesure(net(3.6 * c.ms), 'km/h') : mesure(c.ms, 'm/s'));
          const enKmh = trois.map(c => (c.enKmh ? `${c.nom} : ${texte(c)}` : `${c.nom} : ${c.ms} × 3,6 = ${mesure(net(3.6 * c.ms), 'km/h')}`));
          return choix({
            consigne: 'Compare les vitesses',
            enonce: `${majuscule(trois[0].nom)} : ${texte(trois[0])} ; ${trois[1].nom} : ${texte(trois[1])} ; ${trois[2].nom} : ${texte(trois[2])}. `
              + `Qui va le ${plusVite ? 'plus' : 'moins'} vite ?`,
            reponse: trois[i].nom,
            pieges: trois.filter((c, j) => j !== i).map(c => c.nom),
            explication: `On écrit tout en km/h : ${enKmh.join(' ; ')}.<br>Le ${plusVite ? 'plus' : 'moins'} rapide : <b>${trois[i].nom}</b>.`,
          });
        }
      }
      if (sorte === 'operation') {
        const [de, vers, operation, pourquoi] = parmi(OPERATIONS);
        return choix({
          consigne: 'Choisis le bon calcul',
          enonce: `Pour passer d’une vitesse en ${de} à une vitesse en ${vers}, on fait ___.`,
          reponse: operation,
          pieges: ['× 3,6', '÷ 3,6', '× 60', '÷ 60'],
          explication: pourquoi,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const ms = parmi([5, 10, 15, 20, 25, 30]);
      const kmh = net(3.6 * ms);
      if (auHasard()) {
        // Une égalité juste, ou avec une erreur (les unités inversées, la virgule mal placée, × 0,36 au lieu de × 3,6),
        // écrite dans un sens ou dans l’autre : on ne reconnaît pas les fausses à l’ordre des unités
        const [a, b] = vrai ? [mesure(ms, 'm/s'), mesure(kmh, 'km/h')]
          : parmi([[mesure(ms, 'km/h'), mesure(kmh, 'm/s')], [mesure(ms, 'm/s'), mesure(net(kmh * 10), 'km/h')],
            [mesure(ms, 'm/s'), mesure(net(ms * 0.36), 'km/h')]]);
        return vraiFaux({
          enonce: auHasard() ? `${a} = ${b}` : `${b} = ${a}`,
          vrai,
          explication: `On multiplie par 3,6 pour passer des m/s aux km/h : ${ms} × 3,6 = ${ecrire(kmh)}, donc <b>${mesure(ms, 'm/s')} = ${mesure(kmh, 'km/h')}</b>.`,
        });
      }
      // Une comparaison : la vitesse en m/s est-elle plus grande ?
      const autre = net(kmh + (vrai ? -1 : 1) * parmi([2, 4, 6, 10]));
      return vraiFaux({
        enonce: `Une vitesse de ${mesure(ms, 'm/s')} est plus grande qu’une vitesse de ${mesure(autre, 'km/h')}.`,
        vrai,
        explication: `${mesure(ms, 'm/s')} = ${ms} × 3,6 = ${mesure(kmh, 'km/h')}, et ${ecrire(kmh)} ${vrai ? '&gt;' : '&lt;'} ${ecrire(autre)}.<br>`
          + `Donc ${mesure(ms, 'm/s')} est <b>${vrai ? 'plus grande' : 'plus petite'}</b> que ${mesure(autre, 'km/h')}.`,
      });
    },
    titreLecon: 'Convertir des vitesses',
    lecon: `
      <p>1&nbsp;h = 3&nbsp;600&nbsp;s et 1&nbsp;km = 1&nbsp;000&nbsp;m. Donc 36&nbsp;km/h, c’est 36&nbsp;000&nbsp;m en 3&nbsp;600&nbsp;s :
        10&nbsp;m chaque seconde. <b>36&nbsp;km/h = 10&nbsp;m/s</b>.</p>
      <table>
        <tr><th>km/h → m/s</th><td>on divise par 3,6</td><td><i>72&nbsp;km/h = 72 ÷ 3,6 = 20&nbsp;m/s</i></td></tr>
        <tr><th>m/s → km/h</th><td>on multiplie par 3,6</td><td><i>5&nbsp;m/s = 5 × 3,6 = 18&nbsp;km/h</i></td></tr>
        <tr><th>m/s → m/min</th><td>on multiplie par 60</td><td><i>3&nbsp;m/s = 3 × 60 = 180&nbsp;m/min</i></td></tr>
        <tr><th>km/h → m/min</th><td>× 1&nbsp;000, puis ÷ 60</td><td><i>12&nbsp;km/h = 12&nbsp;000&nbsp;m en 60&nbsp;min = 200&nbsp;m/min</i></td></tr>
        <tr><th>m/min → km/h</th><td>× 60, puis ÷ 1&nbsp;000</td><td><i>250&nbsp;m/min = 15&nbsp;000&nbsp;m en 1&nbsp;h = 15&nbsp;km/h</i></td></tr>
        <tr><th>km/min → km/h</th><td>on multiplie par 60</td><td><i>2&nbsp;km/min = 2 × 60 = 120&nbsp;km/h</i></td></tr>
      </table>
      <p>Pourquoi 3,6 ? 1&nbsp;m/s, c’est 3&nbsp;600&nbsp;m en une heure, soit 3,6&nbsp;km/h.
        Et dans l’autre sens (m/min → m/s, km/h → km/min), on divise par 60.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> la même vitesse s’écrit avec un nombre <b>plus petit</b> en m/s qu’en km/h
        (3,6 fois plus petit). Si tu trouves plus de m/s que de km/h, tu t’es trompé de sens !</div>
      <p>⚠️ Pour comparer deux vitesses, on les écrit d’abord dans la <b>même unité</b> :
        20&nbsp;m/s = 72&nbsp;km/h, donc 20&nbsp;m/s &gt; 70&nbsp;km/h.</p>
      <p>Des repères : un marcheur ≈ 1,4&nbsp;m/s (5&nbsp;km/h) · un sprinteur ≈ 10&nbsp;m/s · sur l’autoroute, 130&nbsp;km/h ≈ 36&nbsp;m/s.</p>
    `,
  });

  // ======================================================================
  // 5. Débits et prix : les grandeurs quotients
  // ======================================================================
  // Des aliments et des prix au kilo réalistes (€/kg), avec les masses qu’on achète (g)
  const ALIMENTS = [
    ['le comté', [14, 16, 18, 20, 24], [150, 200, 250, 300, 400, 500]],
    ['le jambon', [16, 20, 24, 30], [100, 150, 200, 250, 300]],
    ['les cerises', [6, 8, 10, 12], [250, 500, 750, 1500]],
    ['les noix', [10, 12, 14, 16], [200, 250, 400, 500]],
    ['le café', [12, 16, 20], [250, 500]],
    ['les champignons', [8, 10, 12], [250, 300, 400, 500, 750]],
    ['les bonbons', [10, 12, 15], [100, 200, 250, 400]],
  ];
  // Pour comparer deux paquets : [le produit, des prix au kilo réalistes (€/kg), les masses des paquets (g)]
  const PAQUETS = [
    ['de riz', [2, 2.4, 2.8, 3, 3.2, 3.6, 4], [500, 1000, 2000]],
    ['de pâtes', [1.6, 2, 2.4, 2.8, 3], [500, 1000, 1500]],
    ['de café', [12, 14, 16, 18, 20], [250, 500, 1000]],
    ['de chocolat', [8, 10, 12, 14], [100, 200, 250, 400]],
    ['de farine', [1.2, 1.4, 1.6, 2], [500, 1000, 1500, 2000]],
  ];
  // Un aliment, son prix au kilo et une masse (g), avec un prix qui tombe juste (en centimes). garder : les masses possibles
  function tirerAliment(garder) {
    for (;;) {
      const [aliment, prixKilo, masses] = parmi(ALIMENTS);
      const u = parmi(prixKilo);
      const g = parmi(masses.filter(garder));
      if (g && propre(u * g / 1000, 2)) return { aliment, u, g };
    }
  }
  // Un prix sans le signe € (pour les calculs) : 2,40
  const sansEuro = x => euros(x).replace(ESPACE + '€', '');
  // Une masse en g ou en kg : 500 g, 1 kg, 1,5 kg
  const masse = g => (g >= 1000 ? mesure(net(g / 1000), 'kg') : mesure(g, 'g'));

  // Ce que mesure une grandeur : [le début de la phrase, la valeur, la grandeur]
  const GRANDEURS_QUOTIENTS = ['une vitesse', 'un débit', 'un prix au kilo', 'une consommation', 'une densité de population'];
  const ETIQUETTES = [
    ['Sur le robinet de la baignoire, on lit', mesure(12, 'L/min'), 'un débit'],
    ['Sur la pompe de la piscine, on lit', mesure(5, 'm³/h'), 'un débit'],
    ['Au parc, la fontaine donne', mesure(3, 'L/min'), 'un débit'],
    ['Sur l’étiquette du fromage, on lit', mesure(18, '€/kg'), 'un prix au kilo'],
    ['Sur l’étiquette des pommes, on lit', `2,50${ESPACE}€/kg`, 'un prix au kilo'],
    ['Sur l’étiquette des tomates, on lit', `3,20${ESPACE}€/kg`, 'un prix au kilo'],
    ['Au bord de la route, un panneau indique', mesure(80, 'km/h'), 'une vitesse'],
    ['La météo annonce un vent de', mesure(10, 'm/s'), 'une vitesse'],
    ['Sur le compteur du scooter, on lit', mesure(45, 'km/h'), 'une vitesse'],
    ['Pour la voiture de Papi, on lit', `6${ESPACE}L/100${ESPACE}km`, 'une consommation'],
    ['Pour la voiture de Mamie, on lit', `5${ESPACE}L/100${ESPACE}km`, 'une consommation'],
    ['Pour le camping-car de la famille de Léa, on lit', `7,5${ESPACE}L/100${ESPACE}km`, 'une consommation'],
    ['Pour la région de Roxy, on lit', mesure(120, 'hab/km²'), 'une densité de population'],
    ['Pour la ville de Tom, on lit', mesure(4000, 'hab/km²'), 'une densité de population'],
    ['Pour la montagne où Papi fait du ski, on lit', mesure(30, 'hab/km²'), 'une densité de population'],
  ];
  const SENS_QUOTIENTS = {
    'une vitesse': 'une distance divisée par une durée (km/h, m/s)',
    'un débit': 'un volume divisé par une durée (L/min, m³/h)',
    'un prix au kilo': 'un prix divisé par une masse (€/kg)',
    'une consommation': `le nombre de litres de carburant utilisés pour 100${ESPACE}km (L/100${ESPACE}km)`,
    'une densité de population': 'un nombre d’habitants divisé par une aire (hab/km²)',
  };
  // Les unités qu’on peut utiliser pour chaque grandeur
  const UNITES_QUOTIENTS = {
    'une vitesse': ['km/h', 'm/s'], 'un débit': ['L/min', 'm³/h', 'L/h'], 'un prix au kilo': ['€/kg'],
    'une consommation': [`L/100${ESPACE}km`], 'une densité de population': ['hab/km²'],
  };

  ajouterEtape({
    id: '4e-mesures-grandeurs-quotients',
    banque: ['debit', 'debit', 'debitConversion', 'debitConversion', 'prixKilo', 'prixKilo', 'meilleurPrix', 'consommation',
      'densite', 'grandeur', 'grandeur', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'debit') {
        const cas = parmi(['debit', 'volume', 'duree', 'piscine']);
        if (cas === 'debit') {
          // (une baignoire contient de 100 à 250 L environ)
          const q = parmi([12, 15, 20]);
          const t = parmi([8, 10, 12]);
          return nombre({
            consigne: 'Calcule le débit',
            enonce: `Un robinet remplit une baignoire de ${mesure(q * t, 'L')} en ${mesure(t, 'min')}. Quel est son débit ?`,
            reponse: q,
            unite: 'L/min',
            explication: `Débit = volume ÷ durée = ${q * t} ÷ ${t} = <b>${mesure(q, 'L/min')}</b> : ${q}${ESPACE}litres chaque minute.`,
          });
        }
        if (cas === 'volume') {
          const q = parmi([8, 9, 10, 12, 15]);
          const t = parmi([3, 4, 5, 6, 7, 8, 10]);
          return nombre({
            consigne: 'Calcule le volume',
            enonce: `Sous la douche, l’eau coule à ${mesure(q, 'L/min')}. Combien de litres d’eau coulent en ${mesure(t, 'min')} ?`,
            reponse: q * t,
            unite: 'L',
            explication: `Volume = débit × durée = ${q} × ${t} = <b>${mesure(q * t, 'L')}</b>.`,
          });
        }
        if (cas === 'duree') {
          const q = parmi([10, 12, 15, 20, 25]);
          const t = parmi([10, 12, 15, 20, 30]);
          return nombre({
            consigne: 'Calcule la durée',
            enonce: `Un tuyau d’arrosage débite ${mesure(q, 'L/min')}. Combien de minutes faut-il pour remplir une piscine gonflable de ${mesure(q * t, 'L')} ?`,
            reponse: t,
            unite: 'min',
            explication: `Durée = volume ÷ débit = ${q * t} ÷ ${q} = <b>${mesure(t, 'min')}</b>.`,
          });
        }
        const q = parmi([4, 5, 6, 8, 10]);
        const t = parmi([3, 4, 5, 6, 8]);
        return nombre({
          consigne: 'Calcule la durée',
          enonce: `Une pompe vide une piscine de ${mesure(q * t, 'm³')} avec un débit de ${mesure(q, 'm³/h')}. Combien d’heures faut-il ?`,
          reponse: t,
          unite: 'h',
          explication: `Durée = volume ÷ débit = ${q * t} ÷ ${q} = <b>${mesure(t, 'h')}</b>.`,
        });
      }
      if (sorte === 'debitConversion') {
        const cas = parmi(['min-h', 'h-min', 'm3-L', 's-min']);
        let enonce;
        let reponse;
        let pieges;
        let explication;
        if (cas === 'min-h') {
          const q = parmi([5, 8, 10, 12, 15, 20, 25]);
          reponse = q * 60;
          enonce = `${mesure(q, 'L/min')} = ___${ESPACE}L/h`;
          // × 100 (« 1 h = 100 min »), × 6, × 600, ÷ 60, sans conversion
          pieges = [q * 100, q * 6, q * 600, net(q / 60), q];
          explication = `En 1${ESPACE}h = 60${ESPACE}min, il coule 60 fois plus d’eau qu’en 1${ESPACE}min :<br>${q} × 60 = <b>${mesure(reponse, 'L/h')}</b>.`;
        } else if (cas === 'h-min') {
          const Q = parmi([60, 120, 180, 240, 300, 360, 600, 900, 1200, 1800]);
          reponse = Q / 60;
          enonce = `${mesure(Q, 'L/h')} = ___${ESPACE}L/min`;
          pieges = [Q * 60, net(Q / 100), net(Q / 6), net(Q / 600), Q, net(Q / 30)];
          explication = `En 1${ESPACE}min, il coule 60 fois moins d’eau qu’en 1${ESPACE}h :<br>${ecrire(Q)} ÷ 60 = <b>${mesure(reponse, 'L/min')}</b>.`;
        } else if (cas === 'm3-L') {
          const q = parmi([0.5, 1.5, 2, 2.5, 3, 4, 5]);
          reponse = net(q * 1000);
          enonce = `${mesure(q, 'm³/h')} = ___${ESPACE}L/h`;
          // × 100 ou × 10 000 (un rang de moins ou de plus), × 10, pas de conversion, le mauvais sens (÷ 1 000)
          pieges = [net(q * 100), net(q * 10), net(q * 10000), q, net(q / 1000)];
          explication = `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L, donc ${mesure(q, 'm³')} = ${mesure(reponse, 'L')}.<br>`
            + `${mesure(q, 'm³/h')} = <b>${mesure(reponse, 'L/h')}</b>.`;
        } else {
          const q = parmi([0.5, 1, 1.5, 2, 2.5, 3]);
          reponse = net(q * 60);
          enonce = `${mesure(q, 'L/s')} = ___${ESPACE}L/min`;
          pieges = [net(q * 100), net(q * 6), net(q * 600), net(q * 3600), net(q / 60)];
          explication = `En 1${ESPACE}min = 60${ESPACE}s, il coule 60 fois plus d’eau qu’en 1${ESPACE}s :<br>${ecrire(q)} × 60 = <b>${mesure(reponse, 'L/min')}</b>.`;
        }
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis le débit',
          enonce,
          reponse,
          pieges: meilleursPieges(reponse, pieges, 4),
          explication,
        }));
      }
      if (sorte === 'prixKilo') {
        if (auHasard()) {
          // Le prix d’une masse en grammes, à partir du prix au kilo
          const { aliment, u, g } = tirerAliment(() => true);
          const prix = net(u * g / 1000);
          const kg = net(g / 1000);
          const [nom, pronom] = parmi(PRENOMS);
          // L’erreur classique : la masse mal convertie (250 g → 2,5 kg, soit × 10) ; et aussi 25 kg (× 100), 0,025 kg (÷ 10),
          // 0,0025 kg (÷ 100), et diviser au lieu de multiplier (prix au kilo ÷ masse, en kg ou en g)
          const enEuros = x => (propre(x, 2) && x >= 0.01 && x < 1000 ? euros(x) : null);
          return choixAvecErreur({
            consigne: 'Calcule le prix',
            enonce: `Au marché, ${aliment} ${aliment.startsWith('les') ? 'coûtent' : 'coûte'} ${mesure(u, '€/kg')}. `
              + `${nom} en achète ${masse(g)}. ${majuscule(pronom)} paie ___.`,
            reponse: euros(prix),
            explication: (g < 1000 ? `On écrit la masse en kg : ${masse(g)} = ${mesure(kg, 'kg')} (et pas ${mesure(net(kg * 10), 'kg')}).<br>`
              : 'Prix = prix au kilo × masse (en kg) :<br>') + `${ecrire(u)} × ${ecrire(kg)} = <b>${euros(prix)}</b>.`,
          }, euros(net(prix * 10)), [prix / 10, prix / 100, prix * 100, u / kg, u / g].map(enEuros).filter(Boolean));
        }
        // Le prix au kilo, à partir du prix d’un sachet
        // (une masse qui partage le kilo : 250 g, 500 g… ou plus d’un kilo)
        const { aliment, u, g } = tirerAliment(x => 1000 % x === 0 || x >= 1000);
        const prix = net(u * g / 1000);
        const q = nombre({
          consigne: 'Calcule le prix au kilo',
          enonce: `Au marché, ${parmi(PRENOMS)[0]} paie ${euros(prix)} pour ${masse(g)} de ${aliment.replace(/^(le|les) /, '')}. `
            + 'Quel est le prix au kilo ?',
          reponse: u,
          prix: true,
          explication: g < 1000
            ? `1${ESPACE}kg = 1${ESPACE}000${ESPACE}g, c’est ${1000 / g} fois ${masse(g)} :<br>${sansEuro(prix)} × ${1000 / g} = <b>${euros(u)} le kilo</b>.`
            : `Prix au kilo = prix ÷ masse (en kg) = ${sansEuro(prix)} ÷ ${ecrire(g / 1000)} = <b>${euros(u)} le kilo</b>.`,
          solution: `<b>${euros(u)}/kg</b>`,
        });
        q.unite = '€/kg';
        return q;
      }
      if (sorte === 'meilleurPrix') {
        // Le même prix au kilo, de temps en temps
        const pareil = auHasard(0.15);
        for (;;) {
          const [produit, prix, masses] = parmi(PAQUETS);
          const [gA, gB] = RM.melanger(masses).slice(0, 2);
          const uA = parmi(prix);
          const uB = pareil ? uA : parmi(prix.filter(p => p !== uA));
          const [pA, pB] = [net(uA * gA / 1000), net(uB * gB / 1000)];
          if (!propre(pA, 2) || !propre(pB, 2)) continue;
          // Le piège, le plus souvent : le paquet qui coûte le moins cher n’est pas le moins cher au kilo
          if (!pareil && (pA < pB) === (uA < uB) && auHasard(0.7)) continue;
          const reponse = pareil ? 'c’est pareil' : (uA < uB ? 'le paquet A' : 'le paquet B');
          const auKilo = (p, g, u) => (g === 1000 ? `${euros(p)} pour 1${ESPACE}kg`
            : `${sansEuro(p)} ÷ ${ecrire(g / 1000)} = ${euros(u)}/kg`);
          return choix({
            consigne: 'Compare les prix au kilo',
            enonce: `Paquet A : ${masse(gA)} ${produit} pour ${euros(pA)}. Paquet B : ${masse(gB)} pour ${euros(pB)}. `
              + 'Lequel est le moins cher au kilo ?',
            reponse,
            choix: ['le paquet A', 'le paquet B', 'c’est pareil'],
            explication: `Prix au kilo : A : ${auKilo(pA, gA, uA)} ; B : ${auKilo(pB, gB, uB)}.<br>`
              + (uA === uB ? '<b>C’est le même prix au kilo !</b>' : `Le moins cher au kilo : <b>${reponse}</b>.`),
          });
        }
      }
      if (sorte === 'consommation') {
        const c = parmi([4, 5, 6, 7, 8]);
        const d = parmi([150, 200, 250, 300, 350, 400, 450, 500, 600, 800]);
        const L = net(c * d / 100);
        if (auHasard()) {
          return nombre({
            consigne: 'Calcule le carburant',
            enonce: `La voiture de Papi consomme ${c}${ESPACE}L aux 100${ESPACE}km. Combien de litres d’essence faut-il pour ${mesure(d, 'km')} ?`,
            reponse: L,
            unite: 'L',
            explication: `${mesure(d, 'km')}, c’est ${ecrire(d / 100)} fois 100${ESPACE}km :<br>${c} × ${ecrire(d / 100)} = <b>${mesure(L, 'L')}</b>.`,
          });
        }
        return nombre({
          consigne: 'Calcule la consommation',
          enonce: `Pour un trajet de ${mesure(d, 'km')}, la voiture de Mamie a utilisé ${mesure(L, 'L')} d’essence. Quelle est sa consommation, en L/100${ESPACE}km ?`,
          reponse: c,
          unite: `L/100${ESPACE}km`,
          explication: `${mesure(d, 'km')}, c’est ${ecrire(d / 100)} fois 100${ESPACE}km. Pour 100${ESPACE}km :<br>`
            + `${ecrire(L)} ÷ ${ecrire(d / 100)} = <b>${c}${ESPACE}L/100${ESPACE}km</b>.`,
        });
      }
      if (sorte === 'densite') {
        const D = parmi([20, 25, 40, 50, 60, 75, 80, 120, 150, 200, 250]);
        const A = parmi([4, 5, 8, 10, 12, 15, 20, 25, 40]);
        const N = D * A;
        const cas = parmi(['habitants', 'calcul', 'calcul', 'choix', 'choix']);
        if (cas === 'habitants') {
          return nombre({
            consigne: 'Calcule le nombre d’habitants',
            enonce: `Une île a une aire de ${mesure(A, 'km²')} et une densité de population de ${mesure(D, 'hab/km²')}. Combien a-t-elle d’habitants ?`,
            reponse: N,
            unite: 'habitants',
            explication: `${D}${ESPACE}habitants par km², pour ${mesure(A, 'km²')} :<br>${D} × ${A} = <b>${ecrire(N)}${ESPACE}habitants</b>.`,
          });
        }
        const explication = `Densité de population = nombre d’habitants ÷ aire = ${ecrire(N)} ÷ ${A} = <b>${mesure(D, 'hab/km²')}</b> : `
          + `${D}${ESPACE}habitants par km², en moyenne.`;
        const phrase = `Une commune compte ${ecrire(N)}${ESPACE}habitants pour une aire de ${mesure(A, 'km²')}.`;
        if (cas === 'calcul') {
          return nombre({
            consigne: 'Calcule la densité de population',
            enonce: `${phrase} Quelle est sa densité de population ?`,
            reponse: D,
            unite: 'hab/km²',
            explication,
          });
        }
        return choix({
          consigne: 'Calcule la densité de population',
          enonce: `${phrase} Sa densité de population est ___${ESPACE}hab/km².`,
          reponse: D,
          // multiplier au lieu de diviser, la virgule mal placée, ne pas diviser du tout
          pieges: meilleursPieges(D, [N * A, D * 10, net(D / 10), N].filter(x => x < 1e6)),
          explication,
        });
      }
      if (sorte === 'grandeur') {
        if (auHasard(0.6)) {
          const [debut, valeur, grandeur] = parmi(ETIQUETTES);
          return choix({
            consigne: 'Quelle grandeur ?',
            enonce: `${debut} ${guillemets(valeur)}. C’est ___.`,
            reponse: grandeur,
            pieges: GRANDEURS_QUOTIENTS.filter(g => g !== grandeur),
            explication: `${guillemets(valeur)}, c’est <b>${grandeur}</b> : ${SENS_QUOTIENTS[grandeur]}.`,
          });
        }
        // Dans quelle unité ? (une des unités de cette grandeur, et une unité de chacune des autres)
        const grandeur = parmi(GRANDEURS_QUOTIENTS);
        const phrase = parmi([`${majuscule(grandeur)} peut s’écrire en ___.`, `On peut exprimer ${grandeur} en ___.`]);
        return choix({
          consigne: 'Quelle unité ?',
          enonce: phrase,
          reponse: parmi(UNITES_QUOTIENTS[grandeur]),
          pieges: GRANDEURS_QUOTIENTS.filter(g => g !== grandeur).map(g => parmi(UNITES_QUOTIENTS[g])),
          explication: `${majuscule(grandeur)}, c’est ${SENS_QUOTIENTS[grandeur]}.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      // (les « Faux » sont tantôt trop grands, tantôt trop petits : on ne les reconnaît pas sans calculer)
      const vrai = auHasard();
      const famille = parmi(['debit', 'prix', 'consommation']);
      if (famille === 'debit') {
        const q = parmi([5, 8, 10, 12, 15, 20]);
        const faux = parmi([q * 100, q * 6]);
        return vraiFaux({
          enonce: `${mesure(q, 'L/min')} = ${mesure(vrai ? q * 60 : faux, 'L/h')}`,
          vrai,
          explication: `En 1${ESPACE}h = 60${ESPACE}min, il coule 60 fois plus d’eau : ${q} × 60 = <b>${mesure(q * 60, 'L/h')}</b>.`
            + (vrai || faux === q * 6 ? '' : '<br>⚠️ Une heure fait 60 minutes, pas 100 !'),
        });
      }
      if (famille === 'prix') {
        const u = parmi([12, 16, 18, 20, 24]);
        const g = parmi([250, 500]);
        const prix = u * g / 1000;
        // ÷ au lieu de ×, 250 g lu 2,5 kg, 250 g lu 0,025 kg
        const faux = parmi([u * 1000 / g, net(u * g / 100), net(u * g / 10000)]);
        return vraiFaux({
          enonce: `À ${mesure(u, '€/kg')}, ${mesure(g, 'g')} de fromage coûtent ${euros(vrai ? prix : faux)}.`,
          vrai,
          explication: `${mesure(g, 'g')} = ${mesure(g / 1000, 'kg')}, donc ${u} × ${ecrire(g / 1000)} = <b>${euros(prix)}</b>.`,
        });
      }
      const c = parmi([4, 5, 6, 8]);
      const d = parmi([200, 300, 400, 500]);
      const faux = parmi([c * d / 10, net(c * d / 1000)]);
      return vraiFaux({
        enonce: `Une voiture qui consomme ${c}${ESPACE}L/100${ESPACE}km utilise ${mesure(vrai ? c * d / 100 : faux, 'L')} d’essence pour ${mesure(d, 'km')}.`,
        vrai,
        explication: `${mesure(d, 'km')}, c’est ${d / 100} fois 100${ESPACE}km : ${c} × ${d / 100} = <b>${mesure(c * d / 100, 'L')}</b>.`,
      });
    },
    titreLecon: 'Débits et prix',
    lecon: `
      <p>Une <b>grandeur quotient</b> est le quotient de deux grandeurs. Son unité le dit : « L/min » se lit
        « litres par minute » ; « €/kg », « euros par kilo ».</p>
      <table>
        <tr><th>Vitesse</th><td>distance ÷ durée</td><td>km/h, m/s</td></tr>
        <tr><th>Débit</th><td>volume ÷ durée</td><td>L/min, m³/h</td></tr>
        <tr><th>Prix au kilo</th><td>prix ÷ masse (en kg)</td><td>€/kg</td></tr>
        <tr><th>Consommation</th><td>litres de carburant pour 100&nbsp;km</td><td>L/100&nbsp;km</td></tr>
        <tr><th>Densité de population</th><td>nombre d’habitants ÷ aire</td><td>hab/km²</td></tr>
      </table>
      <p>👉 <i>60&nbsp;L en 5&nbsp;min : 60 ÷ 5 = 12&nbsp;L/min</i> · <i>12&nbsp;L/min pendant 3&nbsp;min : 12 × 3 = 36&nbsp;L</i> ·
        <i>150&nbsp;L à 10&nbsp;L/min : 150 ÷ 10 = 15&nbsp;min</i></p>
      <p>👉 <i>Le comté à 18&nbsp;€/kg : 250&nbsp;g = 0,25&nbsp;kg coûtent 18 × 0,25 = 4,50&nbsp;€</i> ·
        <i>6&nbsp;L/100&nbsp;km, pour 300&nbsp;km : 6 × 3 = 18&nbsp;L</i> · <i>21&nbsp;L pour 350&nbsp;km, c’est 21 ÷ 3,5 = 6&nbsp;L pour 100&nbsp;km</i> ·
        <i>1&nbsp;200 habitants sur 15&nbsp;km² : 1&nbsp;200 ÷ 15 = 80&nbsp;hab/km²</i></p>
      <p><b>Convertir :</b> 12&nbsp;L/min = 12 × 60 = 720&nbsp;L/h (1&nbsp;h = 60&nbsp;min) · 1&nbsp;L/s = 60&nbsp;L/min ·
        1&nbsp;m³ = 1&nbsp;000&nbsp;L, donc 3&nbsp;m³/h = 3&nbsp;000&nbsp;L/h.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour comparer deux paquets, calcule le prix d’un kilo de chacun.
        Le paquet le moins cher n’est pas toujours le moins cher au kilo !</div>
      <p>⚠️ Écris la masse en kg avant de multiplier par un prix en €/kg : 250&nbsp;g = 0,25&nbsp;kg (et pas 2,5&nbsp;kg).</p>
    `,
  });

  // ======================================================================
  // 6. Du nano au giga : les préfixes
  // ======================================================================
  // Les préfixes : symbole → [nom, puissance de 10, en mots]
  const PREFIXES = {
    G: ['giga', 9, 'un milliard'], M: ['méga', 6, 'un million'], k: ['kilo', 3, 'mille'], '': ['', 0, 'un'],
    c: ['centi', -2, 'un centième'], m: ['milli', -3, 'un millième'], µ: ['micro', -6, 'un millionième'], n: ['nano', -9, 'un milliardième'],
  };
  const LISTE_PREFIXES = ['G', 'M', 'k', 'c', 'm', 'µ', 'n'];
  const nomPrefixe = p => `${PREFIXES[p][0]} (${p})`;
  // Les conversions : [le grand préfixe, le petit, l’unité] (m : mètre, o : octet, W : watt, g : gramme)
  const PAIRES_PREFIXES = [
    ['G', 'M', 'o'], ['G', 'M', 'o'], ['M', 'k', 'o'], ['M', 'k', 'o'], ['G', 'k', 'o'],
    ['m', 'µ', 'm'], ['m', 'µ', 'm'], ['µ', 'n', 'm'], ['µ', 'n', 'm'], ['', 'µ', 'm'], ['c', 'µ', 'm'], ['m', 'n', 'm'],
    ['M', 'k', 'W'], ['G', 'M', 'W'], ['k', '', 'W'], ['M', '', 'W'],
    ['m', 'µ', 'g'], ['', 'm', 'g'],
  ];

  // Un nombre à convertir de k rangs, et le résultat : au plus 3 chiffres après la virgule, et moins de 10 millions.
  // On tire d’abord la mesure dans la plus grande unité (un « petit » nombre), puis on la convertit.
  function nombresAConvertir(k) {
    const petits = [() => entier(2, 9), () => entier(11, 99), () => entier(101, 999), () => decimal(1, 9.9, 1), () => decimal(0.1, 0.9, 1),
      () => decimal(1, 9.99, 2), () => 50 * entier(1, 19)];
    for (;;) {
      const x = parmi(petits)();
      const [a, b] = k >= 0 ? [x, decaler(x, k)] : [decaler(x, -k), x];
      if (decimalesDe(a) <= 2 && decimalesDe(b) <= 3 && Math.max(a, b) < 1e7 && Math.min(a, b) >= 0.001) return [a, b];
    }
  }
  function tirerConversionPrefixes() {
    const [grand, petit, u] = parmi(PAIRES_PREFIXES);
    const [de, vers] = auHasard() ? [grand, petit] : [petit, grand];
    const k = PREFIXES[de][1] - PREFIXES[vers][1];
    const [a, b] = nombresAConvertir(k);
    return { a, b, de: de + u, vers: vers + u, pDe: de, pVers: vers, u, k };
  }
  // Pourquoi on multiplie ou on divise : « 1 Go = 1 000 Mo »
  function expliquerPrefixes({ a, b, de, vers, pDe, pVers, k }) {
    const f = 10 ** Math.abs(k);
    // (l’unité sans préfixe n’a pas besoin d’être expliquée : « milli = 10⁻³, donc 1 g = 1 000 mg »)
    const valeurs = [pDe, pVers].filter(Boolean).map(p => `${PREFIXES[p][0]} = ${puissance(10, PREFIXES[p][1])}`).join(' et ');
    const regle = k > 0 ? `1${ESPACE}${de} = ${ecrire(f)}${ESPACE}${vers}` : `1${ESPACE}${vers} = ${ecrire(f)}${ESPACE}${de}`;
    return `${valeurs}, donc ${regle}.<br>`
      + `On ${k > 0 ? 'multiplie' : 'divise'} par ${ecrire(f)} : ${mesure(a, de)} = <b>${mesure(b, vers)}</b>.`;
  }

  // Les ordres de grandeur : [le début de la phrase, la valeur, l’unité, les boutons]
  const LONGUEURS_PETITES = ['nm', 'µm', 'mm', 'cm'];
  const OCTETS = ['o', 'ko', 'Mo', 'Go'];
  const WATTS = ['W', 'kW', 'MW', 'GW'];
  const ORDRES = [
    ['Un virus mesure environ', 100, 'nm', LONGUEURS_PETITES], ['Une bactérie mesure environ', 2, 'µm', LONGUEURS_PETITES],
    ['Un globule rouge mesure environ', 7, 'µm', LONGUEURS_PETITES], ['Un cheveu a une épaisseur d’environ', 80, 'µm', LONGUEURS_PETITES],
    ['Une feuille de papier a une épaisseur d’environ', 100, 'µm', LONGUEURS_PETITES], ['Une fourmi mesure environ', 5, 'mm', LONGUEURS_PETITES],
    ['Un court message texte occupe environ', 100, 'o', OCTETS], ['Une page de texte, sans image, occupe environ', 3, 'ko', OCTETS],
    ['Une photo prise avec un téléphone occupe environ', 3, 'Mo', OCTETS], ['Une chanson en MP3 occupe environ', 4, 'Mo', OCTETS],
    ['Un film en haute définition occupe environ', 4, 'Go', OCTETS],
    ['Une ampoule LED a une puissance d’environ', 8, 'W', WATTS], ['Un chargeur de téléphone a une puissance d’environ', 20, 'W', WATTS],
    ['Un four électrique a une puissance d’environ', 3, 'kW', WATTS], ['Une grande éolienne a une puissance d’environ', 3, 'MW', WATTS],
    ['Un réacteur de centrale nucléaire a une puissance d’environ', 1, 'GW', WATTS],
  ];
  const REPERES_ORDRES = {
    nm: `Des repères : 1${ESPACE}mm = 1${ESPACE}000${ESPACE}µm et 1${ESPACE}µm = 1${ESPACE}000${ESPACE}nm. Un cheveu fait environ 80${ESPACE}µm d’épaisseur.`,
    o: `Des repères : 1${ESPACE}ko = 1${ESPACE}000${ESPACE}o, 1${ESPACE}Mo = 1${ESPACE}000${ESPACE}ko, 1${ESPACE}Go = 1${ESPACE}000${ESPACE}Mo.`,
    W: `Des repères : 1${ESPACE}kW = 1${ESPACE}000${ESPACE}W, 1${ESPACE}MW = 1${ESPACE}000${ESPACE}kW, 1${ESPACE}GW = 1${ESPACE}000${ESPACE}MW.`,
  };

  // Les égalités à connaître : [l’énoncé, vrai ?, l’explication]
  const EGALITES_PREFIXES = [
    [`1${ESPACE}µm = 1${ESPACE}000${ESPACE}nm`, true, 'micro = 10<sup>−6</sup> et nano = 10<sup>−9</sup> : il y a <b>1&nbsp;000&nbsp;nm</b> dans 1&nbsp;µm.'],
    [`1${ESPACE}mm = 1${ESPACE}000${ESPACE}µm`, true, 'milli = 10<sup>−3</sup> et micro = 10<sup>−6</sup> : il y a <b>1&nbsp;000&nbsp;µm</b> dans 1&nbsp;mm.'],
    [`1${ESPACE}Go = 1${ESPACE}000${ESPACE}Mo`, true, 'giga = 10<sup>9</sup> et méga = 10<sup>6</sup> : il y a <b>1&nbsp;000&nbsp;Mo</b> dans 1&nbsp;Go.'],
    [`1${ESPACE}m = 1${ESPACE}000${ESPACE}000${ESPACE}µm`, true, 'micro = 10<sup>−6</sup> : il y a un million (<b>1&nbsp;000&nbsp;000</b>) de µm dans 1&nbsp;m.'],
    [`1${ESPACE}MW = 1${ESPACE}000${ESPACE}kW`, true, 'méga = 10<sup>6</sup> et kilo = 10<sup>3</sup> : il y a <b>1&nbsp;000&nbsp;kW</b> dans 1&nbsp;MW.'],
    [`1${ESPACE}mm = 100${ESPACE}µm`, false, 'milli = 10<sup>−3</sup> et micro = 10<sup>−6</sup> : 1&nbsp;mm = <b>1&nbsp;000&nbsp;µm</b>.'],
    [`1${ESPACE}Go = 1${ESPACE}000${ESPACE}ko`, false, 'giga = 10<sup>9</sup> et kilo = 10<sup>3</sup> : 1&nbsp;Go = <b>1&nbsp;000&nbsp;000&nbsp;ko</b> (et 1&nbsp;Go = 1&nbsp;000&nbsp;Mo).'],
    [`1${ESPACE}nm = 1${ESPACE}000${ESPACE}µm`, false, 'C’est le contraire : le nanomètre est plus petit. <b>1&nbsp;µm = 1&nbsp;000&nbsp;nm</b>.'],
    [`1${ESPACE}km = 1${ESPACE}000${ESPACE}000${ESPACE}m`, false, 'kilo = 10<sup>3</sup> : <b>1&nbsp;km = 1&nbsp;000&nbsp;m</b>. C’est le mégamètre qui vaudrait un million de mètres.'],
    [`1${ESPACE}MW = 1${ESPACE}000${ESPACE}W`, false, 'méga = 10<sup>6</sup> : <b>1&nbsp;MW = 1&nbsp;000&nbsp;000&nbsp;W</b> (et 1&nbsp;kW = 1&nbsp;000&nbsp;W).'],
    ['Le préfixe méga signifie « un million ».', true, 'Oui : méga (M) = 10<sup>6</sup> = <b>un million</b>.'],
    ['Le préfixe nano signifie « un milliardième ».', true, 'Oui : nano (n) = 10<sup>−9</sup> = <b>un milliardième</b>.'],
    ['Le préfixe micro signifie « un millième ».', false, 'Non : micro (µ) = 10<sup>−6</sup> = <b>un millionième</b>. Un millième, c’est milli (m).'],
    ['Le préfixe giga signifie « un million ».', false, 'Non : giga (G) = 10<sup>9</sup> = <b>un milliard</b>. Un million, c’est méga (M).'],
  ];

  ajouterEtape({
    id: '4e-mesures-prefixes',
    banque: ['prefixe', 'prefixe', 'convertir', 'convertir', 'convertirChoix', 'convertirChoix', 'exposant', 'ordreGrandeur',
      'comparer', 'vraiFaux'],
    creerQuestion(sorte) {
      // (le bouton « − » sert pour les exposants négatifs : il est là pour toutes les questions à écrire de l’étape)
      const touches = [',', MOINS];
      if (sorte === 'prefixe') {
        const p = parmi(LISTE_PREFIXES);
        const [nom, n, mots] = PREFIXES[p];
        const voisins = LISTE_PREFIXES.filter(q => q !== p && Math.abs(PREFIXES[q][1] - n) <= 3);
        const autres = RM.melanger(LISTE_PREFIXES.filter(q => q !== p && !voisins.includes(q)));
        const pieges = [...RM.melanger(voisins).slice(0, 2), ...autres].slice(0, 3);
        const cas = parmi(['puissance', 'puissance', 'nom', 'mots', 'symbole']);
        const explication = `${majuscule(nom)} (${p}) signifie × ${puissance(10, n)} : c’est <b>${mots}</b>.`;
        if (cas === 'puissance') {
          // L’erreur de signe (10⁶ au lieu de 10⁻⁶) est toujours proposée ; les deux autres pièges : des préfixes voisins
          const faux = [...new Set(pieges.map(q => PREFIXES[q][1]))].filter(x => x !== n && x !== -n);
          return choix({
            consigne: 'Les préfixes',
            enonce: `Le préfixe ${nom} (${p}) signifie × ___.`,
            reponse: puissanceTexte(10, n),
            garder: [puissanceTexte(10, -n)],
            pieges: faux.map(x => puissanceTexte(10, x)),
            explication: explication + `<br>⚠️ Attention au signe de l’exposant : ${puissance(10, -Math.abs(n))} est plus petit que 1, `
              + `${puissance(10, Math.abs(n))} est plus grand que 1.`,
          });
        }
        if (cas === 'symbole') {
          const symboles = { G: ['M', 'g', 'k'], M: ['m', 'G', 'µ'], k: ['K', 'M', 'c'], c: ['C', 'm', 'k'], m: ['M', 'µ', 'c'],
            µ: ['m', 'M', 'n'], n: ['N', 'µ', 'm'] }[p];
          return choix({
            consigne: 'Les préfixes',
            enonce: `Quel est le symbole du préfixe ${nom} ?`,
            reponse: p,
            pieges: symboles,
            explication: `Le symbole de ${nom} est <b>${p}</b>. ⚠️ Attention aux majuscules : m (milli) et M (méga), c’est très différent !`,
          });
        }
        return choix({
          consigne: 'Les préfixes',
          enonce: cas === 'nom' ? `Le préfixe qui signifie × ${puissance(10, n)} est ___.` : `Le préfixe qui signifie ${guillemets(mots)} est ___.`,
          reponse: nomPrefixe(p),
          pieges: pieges.map(nomPrefixe),
          explication,
        });
      }
      if (sorte === 'convertir') {
        const c = tirerConversionPrefixes();
        return nombre({
          consigne: 'Convertis',
          enonce: `${mesure(c.a, c.de)} = ___${ESPACE}${c.vers}`,
          reponse: c.b,
          touches,
          explication: expliquerPrefixes(c),
        });
      }
      if (sorte === 'convertirChoix') {
        const c = tirerConversionPrefixes();
        const s = Math.sign(c.k);
        // le mauvais sens, pas de conversion, × 1 000 000 au lieu de × 1 000 (ou l’inverse), un rang de trop ou de moins
        const decalages = [-c.k, 0, c.k + 3 * s, c.k - 3 * s, c.k + 2 * s, c.k + s, c.k - s].filter(j => j !== c.k);
        return sansIndiceDeForme(() => choix({
          consigne: 'Choisis la bonne conversion',
          enonce: `${mesure(c.a, c.de)} = ___${ESPACE}${c.vers}`,
          reponse: c.b,
          pieges: meilleursPieges(c.b, decalages.map(j => decaler(c.a, j)).filter(p => p >= 0.0001 && p < 1e8), 4),
          explication: expliquerPrefixes(c),
        }));
      }
      if (sorte === 'exposant') {
        const [u, prefixes] = parmi([['m', ['k', 'c', 'm', 'µ', 'n']], ['m', ['m', 'µ', 'n']], ['o', ['k', 'M', 'G']], ['W', ['k', 'M', 'G']],
          ['g', ['k', 'm', 'µ']]]);
        const p = parmi(prefixes);
        const [nom, n] = PREFIXES[p];
        const a = parmi([2, 3, 4, 5, 6, 7, 8, 9, 1.5, 2.5]);
        return nombre({
          consigne: 'Trouve la puissance de 10',
          enonce: `${mesure(a, p + u)} = ${ecrire(a)} × 10<sup><i>n</i></sup>${ESPACE}${u}. Quelle est la valeur de <i>n</i> ?`,
          reponse: n,
          touches,
          solution: `<i>n</i> = <b>${ecrire(n)}</b> : ${mesure(a, p + u)} = ${ecrire(a)} × ${puissance(10, n)}${ESPACE}${u}`,
          explication: `Le préfixe ${nom} (${p}) signifie × ${puissance(10, n)} : ${mesure(a, p + u)} = <b>${ecrire(a)} × ${puissance(10, n)}${ESPACE}${u}</b>.`,
        });
      }
      if (sorte === 'ordreGrandeur') {
        const [debut, valeur, unite, boutons] = parmi(ORDRES);
        return choix({
          consigne: 'Choisis l’unité qui convient',
          enonce: `${debut} ${ecrire(valeur)}${ESPACE}___.`,
          reponse: unite,
          pieges: boutons.filter(b => b !== unite),
          explication: `${debut} <b>${mesure(valeur, unite)}</b>.<br>${REPERES_ORDRES[boutons[0]]}`,
        });
      }
      if (sorte === 'comparer') {
        const [grand, petit, u] = parmi(PAIRES_PREFIXES.filter(([g, p]) => PREFIXES[g][1] - PREFIXES[p][1] === 3));
        const [de, vers] = [grand + u, petit + u];
        const a = parmi([() => decimal(1, 9.9, 1), () => decimal(0.1, 0.9, 1), () => entier(2, 9)])();
        const converti = decaler(a, 3);
        // Des mesures proches, qui piègent : un rang de moins (« 1 Go = 100 Mo »), les mêmes chiffres, un peu plus, un peu moins
        // (les mêmes chiffres seulement pour un nombre à virgule : 3,4 µm et 34 nm)
        const proches = [decaler(a, 2), converti + parmi([10, 50, 100]), converti - parmi([10, 50, 100]),
          Number.isInteger(a) ? null : Number(ecrire(a).replace(',', ''))]
          .filter(v => v !== null).map(net).filter(v => v > 0 && !egaux(v, converti));
        const b = auHasard(0.2) ? converti : parmi(proches);
        const grandAGauche = auHasard();
        const [gauche, droite] = grandAGauche ? [mesure(a, de), mesure(b, vers)] : [mesure(b, vers), mesure(a, de)];
        const [vG, vD] = grandAGauche ? [converti, b] : [b, converti];
        const reponse = signe(vG, vD);
        return choix({
          consigne: 'Compare avec <, > ou =',
          enonce: `${gauche} ___ ${droite}`,
          reponse,
          choix: ['<', '=', '>'],
          explication: `On écrit les deux mesures dans la même unité : 1${ESPACE}${de} = 1${ESPACE}000${ESPACE}${vers}, `
            + `donc ${mesure(a, de)} = ${mesure(converti, vers)}.<br>`
            + `${mesure(vG, vers)} ${SIGNES[reponse]} ${mesure(vD, vers)}, donc <b>${gauche} ${SIGNES[reponse]} ${droite}</b>.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(EGALITES_PREFIXES, auHasard());
    },
    titreLecon: 'Du nano au giga',
    lecon: `
      <p>Un <b>préfixe</b> devant une unité la multiplie par une puissance de 10 : 1&nbsp;km = 10<sup>3</sup>&nbsp;m ;
        1&nbsp;µm = 10<sup>−6</sup>&nbsp;m (µ se lit « mu »).</p>
      <table>
        <tr><th>giga (G)</th><td>× 10<sup>9</sup></td><td>un milliard</td></tr>
        <tr><th>méga (M)</th><td>× 10<sup>6</sup></td><td>un million</td></tr>
        <tr><th>kilo (k)</th><td>× 10<sup>3</sup></td><td>mille</td></tr>
        <tr><th>centi (c)</th><td>× 10<sup>−2</sup></td><td>un centième</td></tr>
        <tr><th>milli (m)</th><td>× 10<sup>−3</sup></td><td>un millième</td></tr>
        <tr><th>micro (µ)</th><td>× 10<sup>−6</sup></td><td>un millionième</td></tr>
        <tr><th>nano (n)</th><td>× 10<sup>−9</sup></td><td>un milliardième</td></tr>
      </table>
      <p>Entre deux préfixes qui se suivent parmi giga, méga, kilo, (l’unité), milli, micro, nano : <b>× 1&nbsp;000</b> à chaque fois.</p>
      <p>👉 <i>3&nbsp;Go = 3&nbsp;000&nbsp;Mo</i> · <i>5&nbsp;µm = 0,005&nbsp;mm</i> · <i>1&nbsp;mm = 1&nbsp;000&nbsp;µm</i> ·
        <i>2&nbsp;MW = 2&nbsp;000&nbsp;kW = 2 × 10<sup>6</sup>&nbsp;W</i> (o : octet ; W : watt, pour la puissance)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vers un préfixe plus petit, le nombre devient plus grand
        (Go → Mo : × 1&nbsp;000) ; vers un préfixe plus grand, il devient plus petit (µm → mm : ÷ 1&nbsp;000).</div>
      <p>⚠️ Attention aux majuscules : m (milli) et M (méga), c’est très différent !</p>
      <p>Des ordres de grandeur : un virus ≈ 100&nbsp;nm · une bactérie ≈ 2&nbsp;µm · un cheveu ≈ 80&nbsp;µm d’épaisseur ·
        une photo ≈ 3&nbsp;Mo · un film ≈ 4&nbsp;Go · une grande éolienne ≈ 3&nbsp;MW.</p>
    `,
  });
})();
