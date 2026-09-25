// Renard Malin — Maths, niveau 5e : les 6 étapes du Moulin des Mesures
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Les figures sont dessinées à l’échelle, avec des longueurs qui « tombent juste ».
// Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    ESPACE, MOINS, entier, parmi, decimal, net, ecrire, mesure, decimalesDe, lireNombre, egaux, frac,
    choix, nombre, vraiFaux, ajouterEtape, figures,
  } = RM.maths;
  const F = figures; // les dessins : F.segment, F.polygone, F.angleDroit…

  // ======================================================================
  // Les petits outils communs à toutes les étapes
  // ======================================================================
  // Des prénoms de toutes les communautés du pays, avec le pronom qui va avec (pour écrire « a-t-elle » ou « a-t-il »)
  const PRENOMS = [['Kalia', 'elle'], ['Teva', 'il'], ['Maëva', 'elle'], ['Sione', 'il'], ['Wakana', 'elle'], ['Minh', 'il'],
    ['Hinano', 'elle'], ['Wanir', 'il'], ['Léa', 'elle'], ['Tom', 'il'], ['Inès', 'elle'], ['Noa', 'il'], ['Mamie', 'elle'], ['Papi', 'il']];
  // Vrai une fois sur deux (ou avec la probabilité donnée)
  const auHasard = (probabilite = 0.5) => Math.random() < probabilite;
  // Une majuscule au début d’une phrase
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // « de Tom », mais « d’Inès »
  const de = prenom => (/^[AEIOUÉÈÂÎ]/.test(prenom) ? `d’${prenom}` : `de ${prenom}`);

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

  // Un vrai ou faux pris dans une liste de [énoncé, vrai ?, explication] : on choisit d’abord la réponse,
  // pour avoir autant de « Vrai » que de « Faux »
  function vraiFauxDans(liste, vrai) {
    const [enonce, , explication] = parmi(liste.filter(([, v]) => v === vrai));
    return vraiFaux({ enonce, vrai, explication });
  }

  // π, comme dans les exercices : π ≈ 3,14
  const PI = 3.14;
  const foisPi = x => net(PI * x);
  // Une valeur exacte avec π : « 25π cm² »
  const avecPi = (n, unite) => `${ecrire(n)}π${ESPACE}${unite}`;

  // ======================================================================
  // Les outils pour dessiner les figures
  // ======================================================================
  const RAD = Math.PI / 180;
  const unitaire = (A, B) => {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
    return [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
  };
  const milieu = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const centre = points => [0, 1].map(i => points.reduce((s, p) => s + p[i], 0) / points.length);
  const r1 = x => Math.round(x * 10) / 10;
  // Une hauteur : en pointillés épais. Un trait de découpe ou un prolongement : en pointillés fins.
  const pointilles = (A, B) => F.segment(A, B, 'fig-trait fig-cache');
  const traitFin = (A, B) => F.segment(A, B, 'fig-fin fig-cache');
  // Le prolongement d’un côté (pour une hauteur qui tombe à l’extérieur) : en pointillés, bien visibles
  const prolongement = (A, B) => F.segment(A, B, 'fig-marque fig-cache');
  // Tourner des points autour de (0 ; 0)
  function tourner(points, degres) {
    const c = Math.cos(degres * RAD);
    const s = Math.sin(degres * RAD);
    return points.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  }
  // L’angle en S (en degrés) entre les directions de A et de B
  function angleEn(S, A, B) {
    const u = unitaire(S, A);
    const v = unitaire(S, B);
    return Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / RAD;
  }

  // Des points donnés en cm (y vers le HAUT, comme en maths), placés dans un dessin de largeur × hauteur pixels
  // (y vers le bas) : à l’échelle (autant de pixels par cm en largeur et en hauteur), au milieu,
  // avec des marges pour écrire les longueurs
  function cadrer(points, largeur, hauteur, { margeX = 80, margeY = 45, echelleMax = 45 } = {}) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const [xmin, xmax, ymin, ymax] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const s = Math.min(echelleMax, (largeur - 2 * margeX) / Math.max(xmax - xmin, 0.1), (hauteur - 2 * margeY) / Math.max(ymax - ymin, 0.1));
    const ox = largeur / 2 - s * (xmin + xmax) / 2;
    const oy = hauteur / 2 + s * (ymin + ymax) / 2;
    return points.map(([x, y]) => [ox + s * x, oy - s * y]);
  }

  // Le pied de la perpendiculaire à la droite (AB) qui passe par M, et sa place t sur (AB) (0 en A, 1 en B)
  function pied(M, A, B) {
    const u = [B[0] - A[0], B[1] - A[1]];
    const t = ((M[0] - A[0]) * u[0] + (M[1] - A[1]) * u[1]) / (u[0] * u[0] + u[1] * u[1]);
    return { H: [A[0] + t * u[0], A[1] + t * u[1]], t };
  }

  // Écrire une longueur le long d’un côté [AB], à l’extérieur de la figure (G : un point à l’intérieur)
  function longueurDehors(A, B, texte, G) {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u = [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
    const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    // figures.longueur écrit du côté (−u[1], u[0]) ; si ce côté va vers G, on prend l’autre
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
  // Le nom d’un point, écrit à côté de lui, dans la direction qui s’éloigne du point O
  function nomLoin(P, nom, O, d = 18) {
    const u = unitaire(O, P);
    return F.texte([P[0] + u[0] * d, P[1] + u[1] * d], nom);
  }

  // ======================================================================
  // 1. L’aire du triangle
  // ======================================================================
  // Des triangles rectangles « qui tombent juste » : [côté, côté, plus grand côté] (5 × 5 = 3 × 3 + 4 × 4…) ;
  // avec eux, toutes les longueurs écrites sur les figures sont exactes
  const TRIPLETS = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15],
    [4.5, 6, 7.5], [6, 4.5, 7.5]];
  // Une longueur qui s’écrit avec au plus un chiffre après la virgule
  const tombeJuste = x => Math.abs(x * 10 - Math.round(x * 10)) < 1e-6;

  // Un triangle PQR : la base [PQ] est sur l’axe des abscisses, la hauteur [RH] sur l’axe des ordonnées
  // (H en (0 ; 0), R en (0 ; h)). xp et xq : les abscisses de P et de Q.
  // rp et rq : les longueurs des côtés [RP] et [RQ] à écrire sur la figure (ou null)
  function tirerTriangleHauteur() {
    for (;;) {
      const [h, d, c] = parmi(TRIPLETS);
      if (auHasard(0.35)) {
        // La hauteur tombe à l’extérieur (angle obtus en P) : on écrit le côté [RQ], le plus loin de la hauteur
        const debords = [1, 1.5, 2, 3, 4].filter(o => d - o >= 3 && (Number.isInteger(h) || Number.isInteger(o)));
        if (!debords.length) continue;
        const o = parmi(debords);
        if (egaux(d - o, c)) continue;
        return { xp: o, xq: d, h, rp: null, rq: c };
      }
      const e = auHasard(0.25) ? entier(5, 17) / 2 : entier(2, 9);
      if (Math.max(d, e) < 4 || Math.min(d, e) < 2 || d + e > 18 || (!Number.isInteger(e) && !Number.isInteger(h))) continue;
      // (la longueur de la hauteur s’écrit à l’intérieur : il faut assez de place entre les pointillés et le côté)
      const echelle = Math.min(45, 300 / (d + e), 190 / h);
      if (0.7 * Math.max(d, e) * echelle < 90) continue;
      const cote = Math.hypot(h, e);
      const rq = tombeJuste(cote) && auHasard(0.6) ? Math.round(cote * 10) / 10 : null;
      if (egaux(d + e, c) || (rq && egaux(d + e, rq))) continue;
      return { xp: -d, xq: e, h, rp: c, rq };
    }
  }

  // Le triangle, sa base, sa hauteur en pointillés (avec l’angle droit) et un ou deux côtés penchés
  function figureTriangleHauteur({ xp, xq, h, rp, rq }, unite) {
    const sx = auHasard() ? 1 : -1;
    const sy = auHasard(0.8) ? 1 : -1; // (parfois, la base est en haut)
    const [P, Q, R, H] = cadrer([[xp, 0], [xq, 0], [0, h], [0, 0]].map(([x, y]) => [sx * x, sy * y]), 460, 280);
    const G = centre([P, Q, R]);
    const dehors = xp > 0;
    const traits = [[P, Q], [Q, R], [R, P]];
    let html = F.polygone([P, Q, R]);
    if (dehors) {
      html += prolongement(H, P);
      traits.push([H, P]);
    }
    const hauteur = longueurHauteur(R, H, mesure(h, unite), traits, dehors ? P : null);
    html += pointilles(R, H) + hauteur.html + F.angleDroit(H, R, hauteur.oppose)
      + longueurDehors(P, Q, mesure(net(xq - xp), unite), G);
    if (rp) html += longueurDehors(R, P, mesure(rp, unite), G);
    if (rq) html += longueurDehors(R, Q, mesure(rq, unite), G);
    return F.svg(460, 280, html, 'Un triangle et une de ses hauteurs');
  }

  // Des triangles dont on connaît la hauteur relative à un côté penché :
  // [la base [PQ] (en bas), le côté [QR], le côté [RP], la hauteur issue de P, relative au côté [QR]]
  const TRIANGLES_AUTRE_BASE = [[6, 5, 5, 4.8], [8, 5, 5, 4.8], [12, 10, 10, 9.6], [16, 10, 10, 9.6], [9, 7.5, 7.5, 7.2],
    [12, 7.5, 7.5, 7.2], [18, 15, 15, 14.4], [24, 15, 15, 14.4], [14, 15, 13, 11.2], [7, 7.5, 6.5, 5.6]];

  function figureAutreBase([b, c, a, hp], unite) {
    // P en (0 ; 0), Q en (b ; 0), et R au-dessus, avec RP = a et QR = c
    const xR = (a * a - c * c + b * b) / (2 * b);
    const R0 = [xR, Math.sqrt(a * a - xR * xR)];
    const { H: K0, t } = pied([0, 0], [b, 0], R0);
    const sx = auHasard() ? 1 : -1;
    const [P, Q, R, K] = cadrer([[0, 0], [b, 0], R0, K0].map(([x, y]) => [sx * x, y]), 460, 280);
    const G = centre([P, Q, R]);
    const traits = [[P, Q], [Q, R], [R, P]];
    let html = F.polygone([P, Q, R]);
    // Le pied K est au-delà de R : on prolonge le côté [QR]
    if (t > 1) {
      html += prolongement(R, K);
      traits.push([R, K]);
    }
    const hauteur = longueurHauteur(P, K, mesure(hp, unite), traits, t > 1 ? R : null);
    html += pointilles(P, K) + hauteur.html + F.angleDroit(K, P, hauteur.oppose)
      + longueurDehors(P, Q, mesure(b, unite), G) + longueurDehors(Q, R, mesure(c, unite), G);
    return F.svg(460, 280, html, 'Un triangle et la hauteur relative à un de ses côtés');
  }

  // Pour nommer les triangles : des lettres qui ne forment pas de mot avec H et K (les pieds des hauteurs)
  const LETTRES = ['B', 'C', 'D', 'F', 'G', 'M', 'N', 'P', 'R', 'S', 'T'];

  // Un triangle PQR (tourné au hasard) et deux de ses hauteurs : [RH], relative à [PQ], et [PK], relative à [QR].
  // Quatre fois sur dix, le triangle a un angle obtus (en P ou en Q) : une hauteur au moins tombe à l’extérieur.
  function figureDeuxHauteurs([p, q, r]) {
    const obtus = auHasard(0.4);
    let T;
    for (;;) {
      const xR = obtus ? parmi([entier(-6, -3), entier(13, 16)]) : entier(-2, 12);
      const [P, Q, R] = [[0, 0], [10, 0], [xR, entier(5, 9)]];
      const h1 = pied(R, P, Q);
      const h2 = pied(P, Q, R);
      // Les pieds ne sont pas trop près des sommets, et aucun angle n’est trop petit (sinon, les noms se chevauchent)
      const loin = t => Math.abs(t) > 0.2 && Math.abs(t - 1) > 0.2;
      if (!loin(h1.t) || !loin(h2.t) || Math.min(angleEn(P, Q, R), angleEn(Q, R, P), angleEn(R, P, Q)) < 28) continue;
      T = { points: [P, Q, R, h1.H, h2.H], tH: h1.t, tK: h2.t };
      break;
    }
    const [P, Q, R, H, K] = cadrer(tourner(T.points, entier(0, 359)), 440, 290, { margeX: 40, margeY: 40, echelleMax: 30 });
    const G = centre([P, Q, R]);
    const plusLoin = (X, A, B) => (Math.hypot(A[0] - X[0], A[1] - X[1]) > Math.hypot(B[0] - X[0], B[1] - X[1]) ? A : B);
    let html = F.polygone([P, Q, R]);
    if (T.tH < 0) html += prolongement(H, P);
    if (T.tH > 1) html += prolongement(H, Q);
    if (T.tK < 0) html += prolongement(K, Q);
    if (T.tK > 1) html += prolongement(K, R);
    html += pointilles(R, H) + pointilles(P, K) + F.angleDroit(H, R, plusLoin(H, P, Q)) + F.angleDroit(K, P, plusLoin(K, Q, R))
      + nomLoin(P, p, G) + nomLoin(Q, q, G) + nomLoin(R, r, G) + nomLoin(H, 'H', R) + nomLoin(K, 'K', P);
    return {
      svg: F.svg(440, 290, html, 'Un triangle et deux de ses hauteurs'),
      dehorsH: T.tH < 0 || T.tH > 1,
      dehorsK: T.tK < 0 || T.tK > 1,
    };
  }

  // [la phrase, le tirage de la base et de la hauteur, l’unité]
  const TRIANGLES_TEXTE = [
    [(b, h) => `L’aire d’un triangle de base ${mesure(b, 'cm')} et de hauteur ${mesure(h, 'cm')} est ___${ESPACE}cm².`,
      () => [auHasard(0.25) ? entier(3, 13) + 0.5 : entier(3, 14), entier(2, 12)], 'cm'],
    [(b, h) => `Un fanion triangulaire a une base de ${mesure(b, 'cm')} et une hauteur de ${mesure(h, 'cm')}. Aire : ___${ESPACE}cm².`,
      () => [parmi([10, 12, 15, 16, 18, 20]), parmi([15, 20, 24, 25, 30])], 'cm'],
    [(b, h) => `Papi fait de la voile dans le lagon. Sa voile est un triangle de base ${mesure(b, 'm')} et de hauteur ${mesure(h, 'm')}. Aire : ___${ESPACE}m².`,
      () => [parmi([2, 2.5, 3, 3.5, 4]), parmi([4, 5, 6, 7, 8])], 'm'],
    [(b, h) => `Le toit de la cabane de Roxy est un triangle de base ${mesure(b, 'm')} et de hauteur ${mesure(h, 'm')}. Aire : ___${ESPACE}m².`,
      () => [parmi([2, 3, 4, 5]), parmi([1.5, 2, 2.5, 3])], 'm'],
  ];
  // Des triangles rectangles dont on connaît les trois côtés : [côté de l’angle droit, autre côté de l’angle droit, le troisième côté]
  const TRIANGLES_RECTANGLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25],
    [1.5, 2, 2.5], [4.5, 6, 7.5], [2.5, 6, 6.5]];
  const NOMS_TRIANGLES = [['R', 'S', 'T'], ['M', 'N', 'P'], ['D', 'F', 'G'], ['B', 'C', 'D'], ['K', 'M', 'N']];

  const PROPRIETES_TRIANGLE = [
    ['Un triangle a trois hauteurs.', true, 'Il y a une hauteur relative à chaque côté : un triangle a <b>trois hauteurs</b>.'],
    ['La hauteur relative à un côté est perpendiculaire à ce côté.', true,
      'Oui : elle part du sommet opposé et arrive <b>perpendiculairement</b> sur la droite qui porte ce côté.'],
    ['Une hauteur d’un triangle peut être à l’extérieur du triangle.', true,
      'Dans un triangle qui a un angle obtus, deux hauteurs tombent <b>à l’extérieur</b>, sur le prolongement d’un côté.'],
    ['Deux triangles de même base et de même hauteur ont la même aire.', true,
      'Aire = base × hauteur ÷ 2 : même base et même hauteur donnent <b>la même aire</b>, même si les triangles n’ont pas la même forme.'],
    ['Un triangle a la moitié de l’aire d’un rectangle de même base et de même hauteur.', true,
      'Rectangle : base × hauteur. Triangle : base × hauteur ÷ 2. C’est bien <b>la moitié</b>.'],
    ['Un triangle n’a qu’une seule hauteur.', false, 'Il y a une hauteur relative à chaque côté : un triangle a <b>trois hauteurs</b>.'],
    ['Une hauteur d’un triangle est toujours à l’intérieur du triangle.', false,
      'Dans un triangle qui a un angle obtus, deux hauteurs tombent <b>à l’extérieur</b> : on prolonge le côté en pointillés.'],
    ['L’aire d’un triangle est égale à base × hauteur.', false, 'Il manque le ÷ 2 : aire du triangle = <b>base × hauteur ÷ 2</b>.'],
    ['Si on double la base d’un triangle sans changer sa hauteur, son aire est multipliée par 4.', false,
      'Aire = base × hauteur ÷ 2 : si la base double, l’aire <b>double</b> aussi (× 2, pas × 4).'],
    ['Pour l’aire d’un triangle, on peut prendre n’importe quel côté comme hauteur.', false,
      'Non : la hauteur doit être <b>perpendiculaire</b> à la base. Un côté penché n’est pas une hauteur.'],
  ];

  // Pour la leçon : un triangle dont la hauteur est à l’intérieur, un autre (avec un angle obtus) où elle est à l’extérieur
  function figureLeconTriangle() {
    const [P1, Q1, R1, H1] = [[20, 165], [210, 165], [90, 35], [90, 165]];
    const [P2, Q2, R2, H2] = [[300, 165], [420, 165], [250, 50], [250, 165]];
    const t = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-petit', ancre });
    return F.svg(440, 200,
      F.polygone([P1, Q1, R1]) + pointilles(R1, H1) + F.angleDroit(H1, R1, P1) + t([98, 128], 'hauteur', 'start') + t([115, 186], 'base')
      + F.polygone([P2, Q2, R2]) + prolongement(H2, P2) + pointilles(R2, H2) + F.angleDroit(H2, R2, P2) + t([242, 110], 'hauteur', 'end')
      + t([360, 186], 'base'),
      'Deux triangles et leur hauteur');
  }

  ajouterEtape({
    id: '5e-mesures-aire-triangle',
    banque: ['figure', 'figure', 'autreBase', 'hauteur', 'calcul', 'calcul', 'retrouver', 'rectangle', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'figure') {
        const t = tirerTriangleHauteur();
        const b = net(t.xq - t.xp);
        const A = net(b * t.h / 2);
        const cotes = [t.rp, t.rq].filter(Boolean).map(c => mesure(c, 'cm'));
        return nombre({
          consigne: 'Calcule l’aire',
          enonce: `Quelle est l’aire de ce triangle ?${figureTriangleHauteur(t, 'cm')}`,
          reponse: A,
          unite: 'cm²',
          explication: `Aire du triangle = base × hauteur ÷ 2. La hauteur relative à la base de ${mesure(b, 'cm')} est en pointillés`
            + `${t.xp > 0 ? ' (elle tombe sur le prolongement de la base)' : ''} : ${mesure(t.h, 'cm')}.<br>`
            + `${ecrire(b)} × ${ecrire(t.h)} ÷ 2 = ${ecrire(net(b * t.h))} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>`
            + (cotes.length > 1
              ? `⚠️ Les côtés de ${cotes.join(' et ')} ne sont pas perpendiculaires à la base : ce ne sont pas des hauteurs.`
              : `⚠️ Le côté de ${cotes[0]} n’est pas perpendiculaire à la base : ce n’est pas la hauteur.`),
        });
      }
      if (sorte === 'autreBase') {
        // La hauteur dessinée est relative au côté penché : il faut la multiplier par CE côté
        const config = parmi(TRIANGLES_AUTRE_BASE);
        const [b, c, , hp] = config;
        const A = net(c * hp / 2);
        const figure = figureAutreBase(config, 'cm');
        const mauvaiseBase = auHasard(0.6);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire',
          enonce: `L’aire de ce triangle est ___${ESPACE}cm².${figure}`,
          reponse: A,
          // l’erreur dont parle l’explication (toujours proposée) : la mauvaise base, ou le ÷ 2 fait deux fois ;
          // les autres : l’oubli du ÷ 2, les deux côtés, une addition
          garder: meilleursPieges(A, [mauvaiseBase ? net(b * hp / 2) : net(A / 2)]),
          pieges: meilleursPieges(A, [net(b * hp / 2), net(c * hp), net(b * hp), net(b * c / 2), net(A / 2), net(c + hp), net(b + hp)]),
          explication: `La hauteur en pointillés est perpendiculaire au côté de ${mesure(c, 'cm')} : c’est la hauteur relative à ce côté.<br>`
            + `Aire = ${ecrire(c)} × ${ecrire(hp)} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>`
            + `⚠️ Elle ne va pas avec la base de ${mesure(b, 'cm')} : ${ecrire(b)} × ${ecrire(hp)} ÷ 2 ne donne pas l’aire.`
            + (mauvaiseBase ? '' : ` Et on ne divise par 2 qu’une fois (${ecrire(net(A / 2))}, c’est deux fois trop petit).`),
        }));
      }
      if (sorte === 'hauteur') {
        const [p, q, r] = RM.melanger(LETTRES).slice(0, 3);
        const { svg, dehorsH, dehorsK } = figureDeuxHauteurs([p, q, r]);
        const [RH, PK, PQ, QR, RP] = [`[${r}H]`, `[${p}K]`, `[${p}${q}]`, `[${q}${r}]`, `[${r}${p}]`];
        const surPQ = `part du sommet ${r} et arrive perpendiculairement sur la droite (${p}${q})`
          + `${dehorsH ? ', ici sur le prolongement du côté' : ''} : l’angle droit est codé en H`;
        const surQR = `part du sommet ${p} et arrive perpendiculairement sur la droite (${q}${r})`
          + `${dehorsK ? ', ici sur le prolongement du côté' : ''} : l’angle droit est codé en K`;
        const cas = parmi(['hauteurPQ', 'hauteurQR', 'coteRH', 'cotePK']);
        if (cas === 'hauteurPQ' || cas === 'hauteurQR') {
          const dePQ = cas === 'hauteurPQ';
          return choix({
            consigne: 'Regarde la figure',
            enonce: `Quel segment est la hauteur relative au côté ${dePQ ? PQ : QR} ?${svg}`,
            reponse: dePQ ? RH : PK,
            pieges: dePQ ? [PK, RP, QR] : [RH, RP, PQ],
            explication: dePQ
              ? `La hauteur relative au côté ${PQ} ${surPQ}. C’est <b>${RH}</b>.`
              : `La hauteur relative au côté ${QR} ${surQR}. C’est <b>${PK}</b>.`,
          });
        }
        const deRH = cas === 'coteRH';
        return choix({
          consigne: 'Regarde la figure',
          enonce: `${deRH ? RH : PK} est la hauteur relative à quel côté ?${svg}`,
          reponse: deRH ? PQ : QR,
          pieges: deRH ? [QR, RP] : [PQ, RP],
          explication: deRH
            ? `${RH} ${surPQ}. C’est la hauteur relative au côté <b>${PQ}</b>.`
            : `${PK} ${surQR}. C’est la hauteur relative au côté <b>${QR}</b>.`,
        });
      }
      if (sorte === 'calcul') {
        const [phrase, tirer, u] = parmi(TRIANGLES_TEXTE);
        const [b, h] = tirer();
        const A = net(b * h / 2);
        // L’erreur classique dont parle l’explication (toujours proposée) : l’oubli du ÷ 2 (plus grand que la réponse)
        // ou le ÷ 2 fait deux fois (plus petit) ; les autres pièges : une addition (avec ou sans le ÷ 2),
        // × 2 au lieu de ÷ 2, le périmètre d’un rectangle
        const oubli = auHasard(0.6);
        const classique = oubli ? net(b * h) : net(b * h / 4);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire',
          enonce: phrase(b, h),
          reponse: A,
          garder: meilleursPieges(A, [classique]),
          // (et, quand l’aire dépasse 30, une erreur de retenue : 10 de trop ou de moins)
          pieges: meilleursPieges(A, [net(b * h), net(b * h / 4), net(b + h), net((b + h) / 2), net(2 * b * h), net(2 * (b + h)),
            ...(A >= 30 ? [net(A + 10), net(A - 10)] : [])]),
          explication: `Aire du triangle = base × hauteur ÷ 2.<br>`
            + `${ecrire(b)} × ${ecrire(h)} ÷ 2 = ${ecrire(net(b * h))} ÷ 2 = <b>${mesure(A, u + '²')}</b>.<br>`
            + (oubli
              ? `⚠️ Sans le ÷ 2, on trouve ${mesure(net(b * h), u + '²')} : c’est l’aire du rectangle de même base et de même hauteur.`
              : `⚠️ On divise par 2 une seule fois : ${ecrire(net(b * h))} ÷ 2 ÷ 2 = ${ecrire(classique)}, c’est deux fois trop petit.`),
        }));
      }
      if (sorte === 'retrouver') {
        const b = entier(3, 12);
        let h;
        do { h = entier(2, 12); } while ((b * h) % 2 !== 0);
        const A = b * h / 2;
        // L’erreur classique dont parle l’explication (toujours proposée) : l’aire pas doublée (A ÷ b, plus petit)
        // ou la division oubliée (A × 2, plus grand) ; les autres : l’aire doublée deux fois (4 × A ÷ b),
        // l’aire divisée par 2 au lieu d’être doublée (A ÷ 2 ÷ b), une soustraction (A − b), une moitié (A ÷ 2)
        const pasDoublee = auHasard();
        const classique = pasDoublee ? net(A / b) : 2 * A;
        return sansIndiceDeForme(() => choix({
          consigne: 'Retrouve la hauteur',
          enonce: `Un triangle d’aire ${mesure(A, 'cm²')} a une base de ${mesure(b, 'cm')}. La hauteur associée mesure ___${ESPACE}cm.`,
          reponse: h,
          garder: meilleursPieges(h, [classique]),
          pieges: meilleursPieges(h, [net(A / b), 2 * A, 2 * h, net(A / 2 / b), A - b, net(A / 2)]),
          explication: `Aire = base × hauteur ÷ 2, donc base × hauteur = aire × 2 = ${ecrire(A)} × 2 = ${ecrire(2 * A)}.<br>`
            + `Hauteur = ${ecrire(2 * A)} ÷ ${b} = <b>${mesure(h, 'cm')}</b> (car ${b} × ${h} ÷ 2 = ${ecrire(A)}).<br>`
            + (pasDoublee
              ? `⚠️ ${ecrire(A)} ÷ ${b} = ${ecrire(net(A / b))} : il ne faut pas oublier de doubler l’aire.`
              : `⚠️ ${ecrire(2 * A)}, c’est base × hauteur : il faut encore diviser par la base.`),
        }));
      }
      if (sorte === 'rectangle') {
        const [a, b, c] = parmi(TRIANGLES_RECTANGLES);
        const [S, X, Y] = RM.melanger(parmi(NOMS_TRIANGLES));
        const cotes = RM.melanger([[`${S}${X}`, a], [`${S}${Y}`, b], [`${X}${Y}`, c]]).map(([n, v]) => `${n} = ${mesure(v, 'cm')}`);
        const A = net(a * b / 2);
        return nombre({
          consigne: 'Calcule l’aire',
          enonce: `Le triangle ${S}${X}${Y} est rectangle en ${S}, avec ${cotes[0]}, ${cotes[1]} et ${cotes[2]}. Quelle est son aire ?`,
          reponse: A,
          unite: 'cm²',
          explication: `Les deux côtés de l’angle droit, [${S}${X}] et [${S}${Y}], sont perpendiculaires : l’un est la hauteur relative à l’autre.<br>`
            + `Aire = ${ecrire(a)} × ${ecrire(b)} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>`
            + `⚠️ [${X}${Y}], le plus grand côté, est en face de l’angle droit : on ne s’en sert pas.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard()) {
        const b = entier(3, 12);
        const h = entier(2, 10);
        const A = net(b * h / 2);
        const oubli = auHasard(0.7);
        const faux = oubli ? b * h : net(b * h / 4);
        return vraiFaux({
          enonce: `Un triangle de base ${mesure(b, 'cm')} et de hauteur ${mesure(h, 'cm')} a une aire de ${mesure(vrai ? A : faux, 'cm²')}.`,
          vrai,
          explication: `Aire = base × hauteur ÷ 2 = ${b} × ${h} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.`
            + (vrai ? '' : (oubli ? '<br>⚠️ Il ne faut pas oublier le ÷ 2 !' : '<br>⚠️ On divise par 2 une seule fois.')),
        });
      }
      return vraiFauxDans(PROPRIETES_TRIANGLE, vrai);
    },
    titreLecon: 'L’aire du triangle',
    lecon: `
      <p>Aire du triangle = <b>base × hauteur ÷ 2</b></p>
      <p>La <b>hauteur relative à une base</b> (on dit aussi la hauteur <i>associée</i>) part du sommet opposé à cette base
        et arrive <b>perpendiculairement</b> sur la droite qui porte la base. Sur les figures, elle est en pointillés,
        avec l’angle droit codé. Un triangle a <b>3 hauteurs</b> : une pour chaque côté.</p>
      ${figureLeconTriangle()}
      <p>Si le triangle a un angle obtus, la hauteur peut tomber <b>à l’extérieur</b> : on prolonge la base en pointillés.
        La formule ne change pas.</p>
      <p>👉 <i>Base 8&nbsp;cm, hauteur 5&nbsp;cm : 8 × 5 ÷ 2 = 40 ÷ 2 = 20&nbsp;cm².</i></p>
      <p>👉 <i>Triangle rectangle : les deux côtés de l’angle droit sont perpendiculaires, l’un est la hauteur relative à l’autre.
        Avec 6&nbsp;cm et 8&nbsp;cm : 6 × 8 ÷ 2 = 24&nbsp;cm² (le troisième côté, en face de l’angle droit, ne sert pas).</i></p>
      <p><b>À l’envers :</b> hauteur = aire × 2 ÷ base. 👉 <i>Aire 24&nbsp;cm², base 8&nbsp;cm : 24 × 2 = 48 et 48 ÷ 8 = 6&nbsp;cm.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un triangle, c’est la <b>moitié</b> d’un rectangle de même base et de même hauteur :
        voilà pourquoi on divise par 2 !</div>
      <p>⚠️ Chaque base va avec <b>sa</b> hauteur, perpendiculaire à elle. Un côté penché n’est pas une hauteur !</p>
    `,
  });

  // ======================================================================
  // 2. Aires : parallélogramme et figures composées
  // ======================================================================
  // Un parallélogramme ABCD : base [AB] de longueur b, hauteur h, côté [AD] (de longueur c) penché de d
  function tirerParallelogramme() {
    for (;;) {
      const [h, d, c] = parmi(TRIPLETS);
      const b = d + entier(2, 9) + (auHasard(0.2) && Number.isInteger(h) && Number.isInteger(d) ? 0.5 : 0);
      if (b <= 18 && !egaux(b, c)) return { b, h, d, c };
    }
  }
  function figureParallelogramme({ b, h, d, c }, unite) {
    const sx = auHasard() ? 1 : -1;
    const sy = auHasard(0.75) ? 1 : -1;
    const [A, B, C, D, H] = cadrer([[0, 0], [b, 0], [b + d, h], [d, h], [d, 0]].map(([x, y]) => [sx * x, sy * y]), 460, 260);
    const G = milieu(A, C);
    const hauteur = longueurHauteur(D, H, mesure(h, unite), [[A, B], [B, C], [C, D], [D, A]]);
    return F.svg(460, 260, F.polygone([A, B, C, D]) + pointilles(D, H) + hauteur.html + F.angleDroit(H, D, hauteur.oppose)
      + longueurDehors(A, B, mesure(b, unite), G) + longueurDehors(A, D, mesure(c, unite), G),
    'Un parallélogramme et une de ses hauteurs');
  }

  // Une figure à découper : une maison (rectangle + triangle), un trapèze rectangle (rectangle + triangle),
  // un rectangle dont on a coupé un coin (rectangle − triangle), un rectangle creusé (rectangle − rectangle)
  function tirerFigureComposee() {
    const famille = parmi(['maison', 'trapeze', 'coin', 'creux']);
    if (famille === 'maison') {
      const enMetres = auHasard();
      const u = enMetres ? 'm' : 'cm';
      let W;
      let Hr;
      let t;
      // (une maison assez large : la hauteur du toit s’écrit dans le toit)
      do {
        W = enMetres ? parmi([3, 4, 5, 6]) : 2 * entier(2, 6);
        Hr = enMetres ? parmi([2, 2.5, 3]) : entier(3, 7);
        t = enMetres ? parmi([1, 1.5, 2]) : entier(2, 5);
      } while (0.3 * W * Math.min(45, 300 / W, 190 / (Hr + t)) < 70);
      const [A, B, C, S, D, T] = cadrer([[0, 0], [W, 0], [W, Hr], [W / 2, Hr + t], [0, Hr], [W / 2, Hr]], 460, 280);
      const G = milieu(A, C);
      const hauteur = longueurHauteur(S, T, mesure(t, u), [[D, S], [S, C], [D, C]]);
      const R = net(W * Hr);
      const Tr = net(W * t / 2);
      return {
        enonce: enMetres ? 'Voici la façade de la cabane de Roxy. Quelle est son aire ?' : 'Quelle est l’aire de cette figure ?',
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
    if (famille === 'trapeze') {
      const h = entier(3, 8);
      const b = entier(3, 9);
      const e = entier(2, 6);
      const [A, B, C, D, T] = cadrer([[0, 0], [b + e, 0], [b, h], [0, h], [b, 0]], 460, 260);
      const G = centre([A, B, C, D]);
      const R = b * h;
      const Tr = net(e * h / 2);
      return {
        enonce: 'Quelle est l’aire de cette figure ?',
        svg: F.svg(460, 260, F.polygone([A, B, C, D]) + traitFin(C, T) + F.angleDroit(T, C, A) + F.angleDroit(A, B, D)
          + F.angleDroit(D, A, C) + longueurDehors(A, B, mesure(b + e, 'cm'), G) + longueurDehors(D, C, mesure(b, 'cm'), G)
          + longueurDehors(A, D, mesure(h, 'cm'), G), 'Un trapèze rectangle'),
        aire: net(R + Tr),
        unite: 'cm²',
        explication: `On découpe : un rectangle de ${b} × ${h} = ${mesure(R, 'cm²')}, et un triangle rectangle de base `
          + `${b + e} ${MOINS} ${b} = ${mesure(e, 'cm')} et de hauteur ${mesure(h, 'cm')} : ${e} × ${h} ÷ 2 = ${mesure(Tr, 'cm²')}.<br>`
          + `Aire totale : ${R} + ${ecrire(Tr)} = <b>${mesure(net(R + Tr), 'cm²')}</b>.`,
      };
    }
    const L = entier(6, 14);
    const l = entier(5, Math.min(10, L));
    const a = entier(2, L - 3);
    const c = entier(2, l - 2);
    const R = L * l;
    if (famille === 'coin') {
      const [A, B, E, P, D, C] = cadrer([[0, 0], [L, 0], [L, l - c], [L - a, l], [0, l], [L, l]], 460, 270);
      const G = milieu(A, C);
      const Tr = net(a * c / 2);
      return {
        enonce: 'Quelle est l’aire de cette figure ?',
        svg: F.svg(460, 270, F.polygone([A, B, E, P, D]) + traitFin(P, C) + traitFin(C, E) + F.angleDroit(A, B, D)
          + F.angleDroit(B, A, E) + F.angleDroit(D, A, P) + F.angleDroit(C, P, E)
          + longueurDehors(A, B, mesure(L, 'cm'), G) + longueurDehors(A, D, mesure(l, 'cm'), G)
          + longueurDehors(P, C, mesure(a, 'cm'), G) + longueurDehors(C, E, mesure(c, 'cm'), G), 'Un rectangle dont un coin est coupé'),
        aire: net(R - Tr),
        unite: 'cm²',
        explication: `On part du rectangle entier et on enlève le coin en pointillés.<br>Rectangle : ${L} × ${l} = ${mesure(R, 'cm²')}. `
          + `Coin (un triangle rectangle) : ${a} × ${c} ÷ 2 = ${mesure(Tr, 'cm²')}.<br>${R} ${MOINS} ${ecrire(Tr)} = <b>${mesure(net(R - Tr), 'cm²')}</b>.`,
      };
    }
    const [A, B, E, P, Q, D, C] = cadrer([[0, 0], [L, 0], [L, l - c], [L - a, l - c], [L - a, l], [0, l], [L, l]], 460, 270);
    const G = milieu(A, C);
    return {
      enonce: 'Quelle est l’aire de cette figure ?',
      svg: F.svg(460, 270, F.polygone([A, B, E, P, Q, D]) + traitFin(Q, C) + traitFin(C, E) + F.angleDroit(A, B, D)
        + F.angleDroit(B, A, E) + F.angleDroit(D, A, Q) + F.angleDroit(C, Q, E) + F.angleDroit(P, Q, E) + F.angleDroit(Q, P, C)
        + longueurDehors(A, B, mesure(L, 'cm'), G) + longueurDehors(A, D, mesure(l, 'cm'), G)
        + longueurDehors(Q, C, mesure(a, 'cm'), G) + longueurDehors(C, E, mesure(c, 'cm'), G), 'Un rectangle creusé d’un petit rectangle'),
      aire: R - a * c,
      unite: 'cm²',
      explication: `On part du rectangle entier et on enlève le petit rectangle en pointillés.<br>`
        + `${L} × ${l} = ${mesure(R, 'cm²')} ; ${a} × ${c} = ${mesure(a * c, 'cm²')}.<br>${R} ${MOINS} ${a * c} = <b>${mesure(R - a * c, 'cm²')}</b>.`,
    };
  }

  // Des problèmes de la vie de Roxy : on ajoute ou on enlève des morceaux
  function problemeDecoupe() {
    const cas = parmi(['mur', 'jardin', 'champ', 'tapis']);
    if (cas === 'mur') {
      const [L, H, a, b] = [parmi([4, 5, 6]), parmi([2.5, 3]), parmi([1, 1.5, 2]), parmi([1, 1.5])];
      const [R, f] = [net(L * H), net(a * b)];
      return {
        enonce: `Un mur de ${mesure(L, 'm')} sur ${mesure(H, 'm')} a une fenêtre de ${mesure(a, 'm')} sur ${mesure(b, 'm')}. `
          + `Aire à peindre : ___${ESPACE}m².`,
        reponse: net(R - f),
        pieges: [net(R + f), R, net(R - a - b), net(R - 2 * (a + b)), net(R - 2 * f), 2 * (L + H), net(2 * (L + H) - f)],
        explication: `On ne peint pas la fenêtre : on l’enlève.<br>Mur : ${ecrire(L)} × ${ecrire(H)} = ${mesure(R, 'm²')} ; `
          + `fenêtre : ${ecrire(a)} × ${ecrire(b)} = ${mesure(f, 'm²')}.<br>${ecrire(R)} ${MOINS} ${ecrire(f)} = <b>${mesure(net(R - f), 'm²')}</b>.`,
      };
    }
    if (cas === 'champ') {
      const [L, l, t] = [parmi([20, 25, 30, 40]), parmi([10, 12, 15, 20]), parmi([6, 8, 10])];
      const [R, T] = [L * l, l * t / 2];
      return {
        enonce: `Un champ est formé d’un rectangle de ${mesure(L, 'm')} sur ${mesure(l, 'm')} et d’un triangle de base ${mesure(l, 'm')} `
          + `et de hauteur ${mesure(t, 'm')}. Son aire est ___${ESPACE}m².`,
        reponse: R + T,
        // (et le triangle calculé avec la mauvaise base, le grand côté du rectangle)
        pieges: [R + l * t, L * (l + t), R + L * t / 2, R, R - T, R + l + t],
        explication: `On ajoute les aires des deux morceaux.<br>Rectangle : ${L} × ${l} = ${mesure(R, 'm²')} ; `
          + `triangle : ${l} × ${t} ÷ 2 = ${mesure(T, 'm²')}.<br>${ecrire(R)} + ${ecrire(T)} = <b>${mesure(R + T, 'm²')}</b>.`,
      };
    }
    // Un rectangle (jardin, chambre) dont une partie carrée (mare, tapis) ne compte pas
    const jardin = cas === 'jardin';
    const [L, l] = jardin ? [entier(8, 15), entier(5, 9)] : [parmi([3, 4, 5]), parmi([3, 3.5, 4])];
    const c = jardin ? entier(2, 4) : parmi([1.5, 2, 2.5]);
    const [R, C] = [net(L * l), net(c * c)];
    return {
      enonce: jardin
        ? `Le jardin de Papi, à ${parmi(['Bourail', 'Koné', 'La Foa', 'Poindimié'])}, est un rectangle de ${mesure(L, 'm')} sur ${mesure(l, 'm')}, `
          + `avec une mare carrée de ${mesure(c, 'm')} de côté. `
          + `Aire de la pelouse : ___${ESPACE}m².`
        : `Une chambre mesure ${mesure(L, 'm')} sur ${mesure(l, 'm')}. On y pose un tapis carré de ${mesure(c, 'm')} de côté. `
          + `Aire du sol qu’on voit encore : ___${ESPACE}m².`,
      reponse: net(R - C),
      garder: c * c !== 2 * c ? [net(R - 2 * c)] : [],
      pieges: [net(R + C), R, net(R - 2 * c), net(R - 4 * c), net(2 * (L + l)), net(2 * (L + l) - C)],
      explication: `On enlève ${jardin ? 'la mare' : 'le tapis'} : ${ecrire(L)} × ${ecrire(l)} = ${mesure(R, 'm²')} et `
        + `${ecrire(c)} × ${ecrire(c)} = ${mesure(C, 'm²')}.<br>${ecrire(R)} ${MOINS} ${ecrire(C)} = <b>${mesure(net(R - C), 'm²')}</b>.`
        + (c * c !== 2 * c ? `<br>⚠️ L’aire d’un carré, c’est côté × côté (${ecrire(c)} × ${ecrire(c)}), pas côté × 2.` : ''),
    };
  }

  const PROPRIETES_PARALLELOGRAMME = [
    ['L’aire d’un parallélogramme est base × hauteur.', true, 'Oui : aire du parallélogramme = <b>base × hauteur</b>, sans ÷ 2.'],
    ['Un parallélogramme et un rectangle de même base et de même hauteur ont la même aire.', true,
      'On découpe un triangle du parallélogramme et on le recolle de l’autre côté : on obtient le rectangle. <b>Même aire</b> !'],
    ['Pour calculer l’aire d’une figure, on peut la découper en rectangles et en triangles.', true,
      'Oui : on calcule l’aire de chaque morceau, puis on les <b>additionne</b>.'],
    ['Un parallélogramme a une aire double de celle d’un triangle de même base et de même hauteur.', true,
      'base × hauteur, c’est <b>deux fois</b> base × hauteur ÷ 2.'],
    ['L’aire d’un parallélogramme est base × côté.', false,
      'Non : on multiplie la base par la <b>hauteur</b>, perpendiculaire à la base, et pas par le côté penché.'],
    ['L’aire d’un parallélogramme est base × hauteur ÷ 2.', false, 'Non, ça, c’est le triangle ! Aire du parallélogramme = <b>base × hauteur</b>.'],
    ['Si on découpe une figure et qu’on recolle les morceaux autrement, son aire change.', false,
      'Non : chaque morceau garde son aire, donc la figure aussi. C’est pour ça que le parallélogramme a <b>la même aire</b> que le rectangle.'],
    [`Un parallélogramme de base 5${ESPACE}cm et de côté 3${ESPACE}cm a toujours une aire de 15${ESPACE}cm².`, false,
      'Non : l’aire dépend de la <b>hauteur</b>, pas du côté. Plus le parallélogramme est penché, plus sa hauteur et son aire sont petites.'],
  ];

  // Pour la leçon : on découpe le triangle de gauche et on le recolle à droite, ça fait un rectangle
  function figureLeconParallelogramme() {
    const [A, B, C, D, H, E] = [[40, 150], [250, 150], [330, 45], [120, 45], [120, 150], [330, 150]];
    const t = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-petit', ancre });
    return F.svg(380, 180, F.polygone([A, B, C, D]) + F.polygone([B, E, C], 'fig-plein') + traitFin(B, E) + traitFin(E, C)
      + pointilles(D, H) + F.angleDroit(H, D, B) + t([145, 170], 'base') + t([128, 100], 'hauteur', 'start'),
    'Un parallélogramme transformé en rectangle');
  }

  ajouterEtape({
    id: '5e-mesures-aires',
    banque: ['parallelogramme', 'parallelogramme', 'parallelogrammeChoix', 'parallelogrammeChoix', 'composee', 'composee',
      'decoupe', 'retrouver', 'unites', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'parallelogramme') {
        const p = tirerParallelogramme();
        const A = net(p.b * p.h);
        return nombre({
          consigne: 'Calcule l’aire',
          enonce: `Quelle est l’aire de ce parallélogramme ?${figureParallelogramme(p, 'cm')}`,
          reponse: A,
          unite: 'cm²',
          explication: `Aire du parallélogramme = base × hauteur. La hauteur relative à la base de ${mesure(p.b, 'cm')} est en pointillés : `
            + `${mesure(p.h, 'cm')}.<br>${ecrire(p.b)} × ${ecrire(p.h)} = <b>${mesure(A, 'cm²')}</b>.<br>`
            + `⚠️ Le côté de ${mesure(p.c, 'cm')} est penché : ce n’est pas la hauteur. Et pas de ÷ 2 : ce n’est pas un triangle !`,
        });
      }
      if (sorte === 'parallelogrammeChoix') {
        const b = entier(4, 12);
        const h = entier(2, 9);
        let c;
        do { c = h + entier(1, 4); } while (c === b);
        const A = b * h;
        // L’erreur dont parle l’explication (toujours proposée) : le côté à la place de la hauteur (plus grand)
        // ou la formule du triangle (plus petit) ; les autres : le périmètre, une addition, le côté × la hauteur
        const leCote = auHasard();
        return choix({
          consigne: 'Calcule l’aire',
          enonce: `L’aire d’un parallélogramme de base ${mesure(b, 'cm')}, de côté ${mesure(c, 'cm')} et de hauteur ${mesure(h, 'cm')} `
            + `est ___${ESPACE}cm².`,
          reponse: A,
          garder: meilleursPieges(A, [leCote ? b * c : net(b * h / 2)]),
          pieges: meilleursPieges(A, [net(b * h / 2), b * c, net(b * c / 2), 2 * (b + c), b + h, c * h, 2 * b * h]),
          explication: `Aire du parallélogramme = base × hauteur = ${b} × ${h} = <b>${mesure(A, 'cm²')}</b>.<br>`
            + (leCote
              ? `⚠️ Le côté de ${mesure(c, 'cm')} ne sert pas : il n’est pas perpendiculaire à la base (${b} × ${c} = ${b * c}, c’est faux).`
              : `⚠️ Pas de ÷ 2 : ${b} × ${h} ÷ 2 = ${ecrire(net(b * h / 2))}, c’est l’aire d’un triangle.`),
        });
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
      if (sorte === 'decoupe') {
        const p = problemeDecoupe();
        return sansIndiceDeForme(() => choix({
          consigne: 'Découpe pour calculer',
          enonce: p.enonce,
          reponse: p.reponse,
          garder: meilleursPieges(p.reponse, p.garder || []),
          pieges: meilleursPieges(p.reponse, p.pieges),
          explication: p.explication,
        }));
      }
      if (sorte === 'retrouver') {
        const b = entier(3, 12);
        const h = entier(3, 9);
        const A = b * h;
        const chercheHauteur = auHasard();
        const [connu, cherche] = chercheHauteur ? [b, h] : [h, b];
        const triangle = auHasard();
        return choix({
          consigne: chercheHauteur ? 'Retrouve la hauteur' : 'Retrouve la base',
          enonce: chercheHauteur
            ? `Un parallélogramme de base ${mesure(b, 'cm')} a une aire de ${mesure(A, 'cm²')}. Sa hauteur associée mesure ___${ESPACE}cm.`
            : `Un parallélogramme d’aire ${mesure(A, 'cm²')} a une hauteur de ${mesure(h, 'cm')}. La base associée mesure ___${ESPACE}cm.`,
          reponse: cherche,
          // L’erreur dont parle l’explication (toujours proposée) : la formule du triangle à l’envers (A × 2 ÷ b, plus grand)
          // ou un ÷ 2 en trop (plus petit) ; les autres : une soustraction, une moitié de l’aire, une erreur de table
          garder: meilleursPieges(cherche, [triangle ? net(2 * A / connu) : net(cherche / 2)]),
          pieges: meilleursPieges(cherche, [net(2 * A / connu), A - connu, net(A / 2), net(cherche / 2), parmi([cherche + 1, cherche - 1])]),
          explication: `Aire = base × hauteur, donc ${chercheHauteur ? 'hauteur = aire ÷ base' : 'base = aire ÷ hauteur'}.<br>`
            + `${A} ÷ ${connu} = <b>${mesure(cherche, 'cm')}</b> (car ${b} × ${h} = ${A}).<br>`
            + (triangle
              ? `⚠️ ${A} × 2 ÷ ${connu} = ${ecrire(net(2 * A / connu))} : ça, c’est pour un triangle !`
              : `⚠️ Pas de ÷ 2 à la fin : ce n’est pas un triangle.`),
        });
      }
      if (sorte === 'unites') {
        if (auHasard()) {
          const Bm = parmi([0.8, 1.2, 1.5, 2, 2.5]);
          const hc = parmi([30, 40, 50, 60, 80]);
          const Bc = net(Bm * 100);
          const A = Bc * hc;
          return choix({
            consigne: 'Attention aux unités',
            enonce: `Un parallélogramme a une base de ${mesure(Bm, 'm')} et une hauteur de ${mesure(hc, 'cm')}. Son aire est ___${ESPACE}cm².`,
            reponse: A,
            garder: meilleursPieges(A, [net(Bm * hc)]),
            pieges: meilleursPieges(A, [A / 10, A * 10, A / 2, A * 100]),
            explication: `On écrit tout dans la même unité : ${mesure(Bm, 'm')} = ${mesure(Bc, 'cm')}.<br>`
              + `${ecrire(Bc)} × ${hc} = <b>${mesure(A, 'cm²')}</b>.<br>`
              + `⚠️ ${ecrire(Bm)} × ${hc} = ${ecrire(net(Bm * hc))} : on ne multiplie pas des m par des cm !`,
          });
        }
        const bc = parmi([40, 50, 60, 80]);
        const Hm = parmi([1.2, 1.5, 2, 2.5]);
        const bm = bc / 100;
        const A = net(bm * Hm / 2);
        return sansIndiceDeForme(() => choix({
          consigne: 'Attention aux unités',
          enonce: `Un triangle a une base de ${mesure(bc, 'cm')} et une hauteur de ${mesure(Hm, 'm')}. Son aire est ___${ESPACE}m².`,
          reponse: A,
          garder: meilleursPieges(A, [net(bc * Hm / 2)]),
          pieges: meilleursPieges(A, [net(A * 2), net(A * 10), net(A / 10), net(A / 100), net(A / 2), net(bc * Hm)]),
          explication: `On écrit tout dans la même unité : ${mesure(bc, 'cm')} = ${mesure(bm, 'm')}.<br>`
            + `${ecrire(bm)} × ${ecrire(Hm)} ÷ 2 = <b>${mesure(A, 'm²')}</b>.<br>`
            + `⚠️ ${bc} × ${ecrire(Hm)} ÷ 2 = ${ecrire(net(bc * Hm / 2))} : on ne multiplie pas des cm par des m !`,
        }));
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard(0.4)) {
        const b = entier(3, 12);
        const h = entier(2, 9);
        const faux = parmi([net(b * h / 2), 2 * (b + h)].filter(x => x !== b * h));
        return vraiFaux({
          enonce: `Un parallélogramme de base ${mesure(b, 'cm')} et de hauteur ${mesure(h, 'cm')} a une aire de ${mesure(vrai ? b * h : faux, 'cm²')}.`,
          vrai,
          explication: `Aire = base × hauteur = ${b} × ${h} = <b>${mesure(b * h, 'cm²')}</b>.`
            + (vrai ? '' : (faux === 2 * (b + h) ? `<br>⚠️ 2 × (${b} + ${h}) = ${2 * (b + h)} : on n’additionne pas, on multiplie !`
              : '<br>⚠️ Pas de ÷ 2 : ce n’est pas un triangle !')),
        });
      }
      return vraiFauxDans(PROPRIETES_PARALLELOGRAMME, vrai);
    },
    titreLecon: 'Aires : parallélogramme et figures',
    lecon: `
      <h4>Le parallélogramme</h4>
      <p>Aire du parallélogramme = <b>base × hauteur</b></p>
      <p>La hauteur relative à une base est perpendiculaire à cette base (en pointillés, avec l’angle droit). Ce n’est pas le côté penché !</p>
      ${figureLeconParallelogramme()}
      <p>On découpe le triangle de gauche et on le recolle à droite : on obtient un <b>rectangle</b> de même base et de même hauteur,
        qui a la même aire. Pas de ÷ 2 : ce n’est pas un triangle !</p>
      <p>👉 <i>Base 7&nbsp;cm, hauteur 4&nbsp;cm : 7 × 4 = 28&nbsp;cm².</i> <b>À l’envers :</b> hauteur = aire ÷ base
        (<i>36&nbsp;cm² et base 9&nbsp;cm : 36 ÷ 9 = 4&nbsp;cm</i>).</p>
      <h4>Découper pour calculer</h4>
      <p>On découpe la figure en morceaux simples (rectangles, triangles), puis :<br>
        • on <b>additionne</b> les aires des morceaux ;<br>
        • ou on part d’un grand rectangle et on <b>enlève</b> les morceaux en trop.</p>
      <p>👉 <i>Un rectangle de 8 × 5 = 40&nbsp;cm² surmonté d’un triangle de 8 × 3 ÷ 2 = 12&nbsp;cm² : 40 + 12 = 52&nbsp;cm².</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> repasse en couleur chaque morceau sur ton brouillon, calcule son aire,
        et n’oublie personne !</div>
      <p>⚠️ Toutes les longueurs doivent être dans la <b>même unité</b> : 1,2&nbsp;m × 40&nbsp;cm → 120&nbsp;cm × 40&nbsp;cm = 4&nbsp;800&nbsp;cm².
        Des cm × des cm donnent des cm² ; des m × des m, des m².</p>
    `,
  });

  // ======================================================================
  // 3. Le cercle et le disque
  // ======================================================================
  // Un rayon en cm : un entier de 2 à 10, ou parfois un nombre décimal (1,5 ; 2,5 ; 3,5 ; 4,5)
  const rayonAuHasard = () => (auHasard(0.25) ? parmi([1.5, 2.5, 3.5, 4.5]) : entier(2, 10));

  // Un disque de centre O, avec son rayon ou son diamètre dessiné (et sa longueur écrite au-dessus)
  function figureDisque(longueur, avecDiametre, unite) {
    const O = [230, 125];
    const R = 95;
    const a = parmi([0, 15, 30, -20, 160, 200, 35]) * RAD;
    const u = [Math.cos(a), -Math.sin(a)];
    const A = [O[0] + R * u[0], O[1] + R * u[1]];
    const A2 = [O[0] - R * u[0], O[1] - R * u[1]];
    // Le texte au-dessus du trait (n vers le haut), le nom du centre en dessous
    const cote = u[0] >= 0 ? -1 : 1;
    const n = [-u[1] * cote, u[0] * cote];
    const html = F.cercle(O, R, 'fig-trait fig-plein') + F.segment(avecDiametre ? A2 : O, A)
      + F.longueur(avecDiametre ? A2 : O, A, mesure(longueur, unite), { cote, distance: 10 + 30 * Math.abs(u[1]) })
      + F.point(O, 'O', { dx: -n[0] * 20, dy: -n[1] * 20 });
    return F.svg(460, 250, html, avecDiametre ? 'Un disque et un de ses diamètres' : 'Un disque et un de ses rayons');
  }

  // Un demi-disque de centre O, avec son diamètre (en bas) ou un rayon
  function figureDemiDisque(r, avecRayon, unite) {
    const O = [230, 190];
    const R = 140;
    let html = `<path d="M ${O[0] - R} ${O[1]} A ${R} ${R} 0 0 1 ${O[0] + R} ${O[1]} Z" class="fig-trait fig-plein"/>`;
    if (avecRayon) {
      const S = [O[0] + R * Math.cos(60 * RAD), O[1] - R * Math.sin(60 * RAD)];
      html += F.segment(O, S) + F.longueur(O, S, mesure(r, unite), { cote: -1, distance: 10 }) + F.point(O, 'O', { dx: 0, dy: 18 });
    } else {
      html += F.longueur([O[0] - R, O[1]], [O[0] + R, O[1]], mesure(2 * r, unite), { cote: 1, distance: 10 }) + F.point(O, 'O', { dx: 0, dy: -18 });
    }
    return F.svg(460, 235, html, 'Un demi-disque');
  }

  // Pour la leçon : un disque, un rayon et un diamètre
  function figureLeconCercle() {
    const O = [150, 110];
    const M = [150 + 85 * Math.cos(60 * RAD), 110 - 85 * Math.sin(60 * RAD)];
    const t = (P, texte, ancre = 'middle') => F.texte(P, texte, { classe: 'fig-petit', ancre });
    return F.svg(300, 220, F.cercle(O, 85, 'fig-trait fig-plein') + F.segment([65, 110], [235, 110]) + F.segment(O, M)
      + F.point(O, 'O', { dx: -14, dy: -14 }) + t([150, 130], 'diamètre d') + t([200, 34], 'rayon r', 'start'),
    'Un disque, son rayon et son diamètre');
  }

  const FORMULES = [
    ['L’aire d’un disque de rayon r est ___.', 'π × r²', ['2 × π × r', 'π × d²', 'π × r'],
      'Aire du disque = <b>π × r²</b> (π × r × r). 2 × π × r, c’est la longueur du cercle.'],
    ['La longueur d’un cercle de rayon r est ___.', '2 × π × r', ['π × r²', 'π × r', '2 × π × r²'],
      'Longueur du cercle = <b>2 × π × r</b> (ou π × d). π × r², c’est l’aire du disque.'],
    ['La longueur d’un cercle de diamètre d est ___.', 'π × d', ['2 × π × d', 'π × d²', 'π × d ÷ 2'],
      'Longueur du cercle = <b>π × d</b> : le diamètre, c’est déjà deux rayons.'],
    ['L’aire d’un demi-disque de rayon r est ___.', 'π × r² ÷ 2', ['π × r²', 'π × r ÷ 2', '2 × π × r²'],
      'Un demi-disque, c’est la moitié du disque : <b>π × r² ÷ 2</b>.'],
  ];

  const PROPRIETES_CERCLE = [
    ['Si on double le rayon d’un cercle, sa longueur double aussi.', true,
      'Longueur = 2 × π × r : si r est multiplié par 2, la longueur <b>aussi</b>.'],
    ['La longueur d’un cercle de diamètre d est π × d.', true, 'Oui : <b>π × d</b>, ou 2 × π × r (c’est pareil, car d = 2 × r).'],
    ['π vaut environ 3,14.', true, 'Oui : π ≈ <b>3,14</b>. Sa valeur exacte a une infinité de chiffres après la virgule.'],
    ['Le périmètre d’un demi-disque, c’est la moitié du cercle plus le diamètre.', true,
      'Oui : pour faire le tour du demi-disque, on suit le demi-cercle <b>et</b> le diamètre.'],
    ['Si on double le rayon d’un disque, son aire double aussi.', false,
      'Aire = π × r × r : si r double, l’aire est multipliée par 2 × 2 = <b>4</b>.'],
    ['π est exactement égal à 3,14.', false, '3,14 est seulement une <b>valeur approchée</b> de π (π = 3,14159…).'],
    ['L’aire d’un disque de rayon r est 2 × π × r.', false,
      'Non : 2 × π × r, c’est la longueur du cercle. L’aire du disque est <b>π × r²</b>.'],
    ['Le périmètre d’un demi-disque est la moitié de la longueur du cercle.', false,
      'Il ne faut pas oublier le <b>diamètre</b> : périmètre = demi-cercle + diamètre.'],
  ];

  ajouterEtape({
    id: '5e-mesures-cercle',
    banque: ['perimetre', 'aire', 'aire', 'exact', 'figure', 'figure', 'demiDisque', 'probleme', 'probleme', 'formule',
      'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'perimetre') {
        const r = rayonAuHasard();
        const d = net(2 * r);
        const L = foisPi(d);
        if (auHasard()) {
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule la longueur du cercle',
            enonce: `Avec π ≈ 3,14, la longueur d’un cercle de rayon ${mesure(r, 'cm')} est d’environ ___${ESPACE}cm.`,
            reponse: L,
            // l’oubli du 2 × (toujours proposé : l’explication en parle), le rayon pris pour… la moitié du rayon,
            // + au lieu de ×, le diamètre doublé, la formule de l’aire
            garder: meilleursPieges(L, [foisPi(r)]),
            pieges: meilleursPieges(L, [foisPi(r / 2), net(2 * r + PI), foisPi(4 * r), foisPi(r * r)]),
            explication: `Longueur du cercle = 2 × π × r ≈ 2 × 3,14 × ${ecrire(r)} = 6,28 × ${ecrire(r)} = <b>${mesure(L, 'cm')}</b>.<br>`
              + `⚠️ Sans le « 2 × », 3,14 × ${ecrire(r)} = ${ecrire(foisPi(r))} : ce n’est que la moitié du tour.`,
          }));
        }
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule la longueur du cercle',
          enonce: `Avec π ≈ 3,14, la longueur d’un cercle de diamètre ${mesure(d, 'cm')} est d’environ ___${ESPACE}cm.`,
          reponse: L,
          // le diamètre doublé (toujours proposé), le rayon au lieu du diamètre, + au lieu de ×, la formule de l’aire
          garder: meilleursPieges(L, [foisPi(2 * d)]),
          pieges: meilleursPieges(L, [foisPi(r), net(d + PI), foisPi(r * r), net(PI * d + d)]),
          explication: `Longueur du cercle = π × d ≈ 3,14 × ${ecrire(d)} = <b>${mesure(L, 'cm')}</b>.<br>`
            + `⚠️ On connaît déjà le diamètre : pas besoin de le doubler (3,14 × ${ecrire(2 * d)} = ${ecrire(foisPi(2 * d))}, c’est deux fois trop).`,
        }));
      }
      if (sorte === 'aire') {
        if (auHasard()) {
          const r = rayonAuHasard();
          const A = foisPi(r * r);
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule l’aire du disque',
            enonce: `Avec π ≈ 3,14, l’aire d’un disque de rayon ${mesure(r, 'cm')} est d’environ ___${ESPACE}cm².`,
            reponse: A,
            // la longueur du cercle (toujours proposée), π × r, + au lieu de ×, le diamètre au lieu du rayon,
            // 2 × π × r², la virgule de 3,14 mal placée
            garder: meilleursPieges(A, [foisPi(2 * r)]),
            pieges: meilleursPieges(A, [foisPi(r), net(r * r + PI), foisPi(4 * r * r), foisPi(2 * r * r), foisPi(10 * r * r)]),
            explication: `Aire du disque = π × r × r ≈ 3,14 × ${ecrire(r)} × ${ecrire(r)} = 3,14 × ${ecrire(net(r * r))} = <b>${mesure(A, 'cm²')}</b>.<br>`
              + `⚠️ 2 × π × r = ${ecrire(foisPi(2 * r))}, c’est la longueur du cercle, pas l’aire du disque.`,
          }));
        }
        const r = rayonAuHasard();
        const d = net(2 * r);
        const A = foisPi(r * r);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire du disque',
          enonce: `Avec π ≈ 3,14, l’aire d’un disque de diamètre ${mesure(d, 'cm')} est d’environ ___${ESPACE}cm².`,
          reponse: A,
          // le diamètre au lieu du rayon (toujours proposé), la longueur du cercle, π × r, + au lieu de ×, la virgule mal placée
          garder: meilleursPieges(A, [foisPi(d * d)]),
          pieges: meilleursPieges(A, [foisPi(d), foisPi(r), foisPi(d * d / 2), net(r * r + PI), foisPi(10 * r * r)]),
          explication: `Le rayon est la moitié du diamètre : ${ecrire(d)} ÷ 2 = ${mesure(r, 'cm')}.<br>`
            + `Aire = π × r × r ≈ 3,14 × ${ecrire(r)} × ${ecrire(r)} = 3,14 × ${ecrire(net(r * r))} = <b>${mesure(A, 'cm²')}</b>.<br>`
            + `⚠️ Avec le diamètre (${ecrire(d)} × ${ecrire(d)}), on trouverait 4 fois trop !`,
        }));
      }
      if (sorte === 'exact') {
        const donneRayon = auHasard();
        const r = entier(2, 10);
        const d = 2 * r;
        const donne = donneRayon ? `de rayon ${mesure(r, 'cm')}` : `de diamètre ${mesure(d, 'cm')}`;
        if (auHasard(0.6)) {
          return choix({
            consigne: 'Trouve la valeur exacte',
            enonce: `L’aire exacte d’un disque ${donne} est ___.`,
            reponse: avecPi(r * r, 'cm²'),
            pieges: [d, r, d * d, 2 * r * r].map(n => avecPi(n, 'cm²')).filter(p => p !== avecPi(r * r, 'cm²')),
            explication: `Aire = π × r × r${donneRayon ? '' : `, avec r = ${d} ÷ 2 = ${mesure(r, 'cm')}`} : ${r} × ${r} = ${r * r}.<br>`
              + `L’aire exacte est <b>${avecPi(r * r, 'cm²')}</b> (${r * r} × π, environ ${mesure(foisPi(r * r), 'cm²')}).`,
          });
        }
        return choix({
          consigne: 'Trouve la valeur exacte',
          enonce: `La longueur exacte d’un cercle ${donne} est ___.`,
          reponse: avecPi(d, 'cm'),
          pieges: [r, r * r, 2 * d, d * d].map(n => avecPi(n, 'cm')).filter(p => p !== avecPi(d, 'cm')),
          explication: `Longueur = π × d${donneRayon ? `, avec d = 2 × ${r} = ${mesure(d, 'cm')}` : ''}.<br>`
            + `La longueur exacte est <b>${avecPi(d, 'cm')}</b> (${d} × π, environ ${mesure(foisPi(d), 'cm')}).`,
        });
      }
      if (sorte === 'figure') {
        const r = auHasard(0.25) ? parmi([1.5, 2.5, 3.5, 4.5]) : entier(2, 9);
        const d = net(2 * r);
        const avecDiametre = auHasard(0.4);
        const svg = figureDisque(avecDiametre ? d : r, avecDiametre, 'cm');
        const leRayon = avecDiametre ? `Le rayon est la moitié du diamètre : ${ecrire(d)} ÷ 2 = ${mesure(r, 'cm')}.<br>` : '';
        if (auHasard()) {
          const A = foisPi(r * r);
          return nombre({
            consigne: 'Calcule l’aire du disque',
            enonce: `Avec π ≈ 3,14, calcule l’aire de ce disque.${svg}`,
            reponse: A,
            unite: 'cm²',
            explication: `${leRayon}Aire = π × r × r ≈ 3,14 × ${ecrire(r)} × ${ecrire(r)} = 3,14 × ${ecrire(net(r * r))} = <b>${mesure(A, 'cm²')}</b>.`
              + (avecDiametre ? '' : '<br>⚠️ Pas 2 × π × r : ça, c’est la longueur du cercle.'),
          });
        }
        const L = foisPi(d);
        return nombre({
          consigne: 'Calcule la longueur du cercle',
          enonce: `Avec π ≈ 3,14, calcule la longueur de ce cercle.${svg}`,
          reponse: L,
          unite: 'cm',
          explication: avecDiametre
            ? `Longueur du cercle = π × d ≈ 3,14 × ${ecrire(d)} = <b>${mesure(L, 'cm')}</b>.<br>⚠️ On connaît déjà le diamètre : pas besoin de le doubler.`
            : `Longueur du cercle = 2 × π × r ≈ 2 × 3,14 × ${ecrire(r)} = 6,28 × ${ecrire(r)} = <b>${mesure(L, 'cm')}</b>.`,
        });
      }
      if (sorte === 'demiDisque') {
        const aire = auHasard();
        // (pour l’aire, un rayon entier : sinon, le résultat aurait 4 chiffres après la virgule)
        const r = aire ? entier(2, 10) : rayonAuHasard();
        const d = net(2 * r);
        const avecRayon = auHasard(0.35);
        const svg = figureDemiDisque(r, avecRayon, 'cm');
        const leRayon = avecRayon ? `Le diamètre est le double du rayon : 2 × ${ecrire(r)} = ${mesure(d, 'cm')}.<br>` : '';
        if (aire) {
          const A = foisPi(r * r / 2);
          const disqueEntier = auHasard(0.6);
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule l’aire du demi-disque',
            enonce: `Avec π ≈ 3,14, l’aire de ce demi-disque est d’environ ___${ESPACE}cm².${svg}`,
            reponse: A,
            // le disque entier (toujours proposé), le diamètre pris pour le rayon, le demi-cercle, le périmètre, un quart de disque
            garder: meilleursPieges(A, [disqueEntier ? foisPi(r * r) : foisPi(r * r / 4)]),
            pieges: meilleursPieges(A, [foisPi(r * r), foisPi(d * d / 2), foisPi(r), net(PI * r + d), foisPi(r * r / 4)]),
            explication: `${avecRayon ? '' : `Le rayon est la moitié du diamètre : ${d} ÷ 2 = ${mesure(r, 'cm')}.<br>`}`
              + `C’est la moitié d’un disque : 3,14 × ${r} × ${r} ÷ 2 = 3,14 × ${r * r} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>`
              + (disqueEntier ? `⚠️ Sans le ÷ 2, ${ecrire(foisPi(r * r))}, c’est l’aire du disque entier.`
                : `⚠️ On divise par 2, pas par 4 : ${ecrire(foisPi(r * r / 4))}, ce serait un quart de disque.`),
          }));
        }
        const P = net(PI * r + d);
        const oubli = auHasard(0.6);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule le périmètre du demi-disque',
          enonce: `Avec π ≈ 3,14, le périmètre de ce demi-disque (tout son tour) est d’environ ___${ESPACE}cm.${svg}`,
          reponse: P,
          // l’oubli du diamètre (toujours proposé), le cercle entier (avec ou sans le diamètre), le rayon au lieu du diamètre,
          // + au lieu de ×, l’aire
          garder: meilleursPieges(P, [oubli ? foisPi(r) : net(PI * d + d)]),
          pieges: meilleursPieges(P, [foisPi(d), net(PI * d + d), net(PI * r + r), net(PI + d), foisPi(r * r / 2)]),
          explication: `${leRayon}Le demi-cercle : 3,14 × ${ecrire(d)} ÷ 2 = ${ecrire(foisPi(r))} ; on ajoute le diamètre : `
            + `${ecrire(foisPi(r))} + ${ecrire(d)} = <b>${mesure(P, 'cm')}</b>.<br>`
            + (oubli ? '⚠️ N’oublie pas le diamètre, c’est aussi un bord !'
              : `⚠️ C’est un demi-cercle : 3,14 × ${ecrire(d)} ÷ 2, et pas 3,14 × ${ecrire(d)} (le cercle entier).`),
        }));
      }
      if (sorte === 'probleme') {
        const [prenom] = parmi(PRENOMS);
        const cas = parmi(['pizza', 'roue', 'piste', 'bassin', 'horloge', 'fare']);
        if (cas === 'fare') {
          // Une guirlande autour du toit d'un faré rond (un abri de plage, au toit de paille) : un cercle
          const d = parmi([4, 5, 6, 8]);
          const L = foisPi(d);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Pour la fête, ${prenom} pose une guirlande tout autour du toit d’un faré rond de ${mesure(d, 'm')} de diamètre. `
              + 'Avec π ≈ 3,14, quelle longueur de guirlande faut-il ?',
            reponse: L,
            unite: 'm',
            explication: `La guirlande fait le tour du toit : un cercle de diamètre ${mesure(d, 'm')}. π × d ≈ 3,14 × ${d} = <b>${mesure(L, 'm')}</b>.`,
          });
        }
        if (cas === 'pizza' || cas === 'bassin') {
          const pizza = cas === 'pizza';
          const d = pizza ? parmi([20, 24, 30]) : null;
          const r = pizza ? d / 2 : parmi([1.5, 2, 2.5, 3]);
          const u = pizza ? 'cm' : 'm';
          const A = foisPi(r * r);
          return nombre({
            consigne: 'Résous le problème',
            enonce: pizza
              ? `Une pizza ronde a un diamètre de ${mesure(d, 'cm')}. Avec π ≈ 3,14, quelle est son aire ?`
              : `Le bassin rond du jardin a un rayon de ${mesure(r, 'm')}. Avec π ≈ 3,14, quelle est l’aire de l’eau ?`,
            reponse: A,
            unite: u + '²',
            explication: `${pizza ? `Le rayon est la moitié du diamètre : ${d} ÷ 2 = ${mesure(r, 'cm')}.<br>` : ''}`
              + `Aire du disque = π × r × r ≈ 3,14 × ${ecrire(r)} × ${ecrire(r)} = 3,14 × ${ecrire(net(r * r))} = <b>${mesure(A, u + '²')}</b>.`,
          });
        }
        if (cas === 'roue') {
          const d = parmi([40, 50, 60, 70]);
          const L = foisPi(d);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `La roue du vélo ${de(prenom)} a un diamètre de ${mesure(d, 'cm')}. Avec π ≈ 3,14, quelle distance parcourt-elle en un tour ?`,
            reponse: L,
            unite: 'cm',
            explication: `En un tour, la roue avance de la longueur de son cercle : π × d ≈ 3,14 × ${d} = <b>${mesure(L, 'cm')}</b>.`,
          });
        }
        if (cas === 'piste') {
          const r = parmi([10, 15, 20, 25]);
          const n = entier(2, 5);
          const tour = foisPi(2 * r);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Roxy fait ${n} tours d’une piste ronde de ${mesure(r, 'm')} de rayon. Avec π ≈ 3,14, quelle distance parcourt-elle ?`,
            reponse: net(n * tour),
            unite: 'm',
            explication: `Un tour : 2 × π × r ≈ 2 × 3,14 × ${r} = ${mesure(tour, 'm')}.<br>`
              + `${n} tours : ${n} × ${ecrire(tour)} = <b>${mesure(net(n * tour), 'm')}</b>.`,
          });
        }
        const l = parmi([5, 8, 10, 12, 15]);
        const L = foisPi(2 * l);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `La grande aiguille de l’horloge mesure ${mesure(l, 'cm')}. Avec π ≈ 3,14, quelle distance parcourt sa pointe en une heure ?`,
          reponse: L,
          unite: 'cm',
          explication: `En une heure, la pointe fait un tour complet : un cercle de rayon ${mesure(l, 'cm')}.<br>`
            + `2 × π × r ≈ 2 × 3,14 × ${l} = <b>${mesure(L, 'cm')}</b>.`,
        });
      }
      if (sorte === 'formule') {
        const [enonce, reponse, pieges, explication] = parmi(FORMULES);
        return choix({ consigne: 'Choisis la bonne formule', enonce, reponse, pieges, explication });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard(0.4)) {
        const r = entierSaufDeux(3, 9);
        if (auHasard()) {
          return vraiFaux({
            enonce: `Un disque de rayon ${mesure(r, 'cm')} a une aire de ${avecPi(vrai ? r * r : 2 * r, 'cm²')}.`,
            vrai,
            explication: `Aire = π × r × r : ${r} × ${r} = ${r * r}, donc l’aire est <b>${avecPi(r * r, 'cm²')}</b>.`
              + (vrai ? '' : `<br>⚠️ ${avecPi(2 * r, 'cm')}, c’est la longueur du cercle.`),
          });
        }
        return vraiFaux({
          enonce: `Un cercle de rayon ${mesure(r, 'cm')} a une longueur de ${avecPi(vrai ? 2 * r : r * r, 'cm')}.`,
          vrai,
          explication: `Longueur = 2 × π × r : 2 × ${r} = ${2 * r}, donc la longueur est <b>${avecPi(2 * r, 'cm')}</b>.`
            + (vrai ? '' : `<br>⚠️ ${r} × ${r} × π, c’est l’aire du disque (en cm²).`),
        });
      }
      return vraiFauxDans(PROPRIETES_CERCLE, vrai);
    },
    titreLecon: 'Le cercle et le disque',
    lecon: `
      <table>
        <tr><th>Longueur du cercle (son périmètre)</th><td>2 × π × r, ou π × d</td></tr>
        <tr><th>Aire du disque</th><td>π × r × r = π × r²</td></tr>
      </table>
      ${figureLeconCercle()}
      <p>r est le <b>rayon</b>, d le <b>diamètre</b> : d = 2 × r et r = d ÷ 2.</p>
      <p>π (« pi ») est un nombre un peu plus grand que 3 : π ≈ <b>3,14</b>. Avec 3,14, on trouve une valeur approchée.
        On peut aussi garder π dans le résultat : c’est la <b>valeur exacte</b> (<i>25π</i> veut dire 25 × π).</p>
      <p>👉 <i>Rayon 5&nbsp;cm : longueur = 2 × π × 5 = 10π&nbsp;cm ≈ 31,4&nbsp;cm ; aire = π × 5 × 5 = 25π&nbsp;cm² ≈ 78,5&nbsp;cm².</i></p>
      <p><b>Le demi-disque :</b> son aire est la moitié de celle du disque (π × r² ÷ 2) ; son périmètre, c’est le demi-cercle
        <b>plus le diamètre</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> l’aire a un « carré » (r²) et s’écrit en cm² ; la longueur n’en a pas et s’écrit
        en cm. Si on te donne le diamètre, divise-le par 2 pour avoir le rayon !</div>
      <p>⚠️ Si le rayon double, la longueur du cercle double, mais l’aire du disque est multipliée par 4.</p>
    `,
  });
  // Un entier entre min et max, mais pas 2 (avec r = 2, 2 × r et r × r donnent le même nombre)
  function entierSaufDeux(min, max) {
    let n;
    do { n = entier(min, max); } while (n === 2);
    return n;
  }

  // ======================================================================
  // 4. Prismes et cylindres
  // ======================================================================
  // Un prisme droit en perspective : la base (un triangle rectangle de côtés a et b) est devant,
  // la hauteur L part en biais vers le fond (dessinée plus courte) ; les arêtes cachées sont en pointillés
  function figurePrisme(a, b, L, unite, lecon = false) {
    const s = Math.min(24, 220 / (a + 0.36 * L), 160 / (b + 0.36 * L));
    const k = L * s * 0.5 * Math.SQRT1_2;
    const [w, h] = [a * s, b * s];
    const x0 = (440 - w - k) / 2;
    const y0 = 130 + (h + k) / 2;
    const [F1, F2, F3] = [[x0, y0], [x0 + w, y0], [x0, y0 - h]];
    const [B1, B2, B3] = [F1, F2, F3].map(P => [P[0] + k, P[1] - k]);
    const G = centre([F1, F2, B2, B3, F3]);
    const Gf = centre([F1, F2, F3]);
    let html = F.polygone([F1, F2, B2, B3, F3], 'fig-plein')
      + [[F1, B1], [B1, B2], [B1, B3]].map(([P, Q]) => F.segment(P, Q, 'fig-marque fig-cache')).join('')
      + F.polygone([F1, F2, F3], 'fig-trait') + F.segment(F2, B2) + F.segment(F3, B3) + F.segment(B2, B3) + F.angleDroit(F1, F2, F3)
      + longueurDehors(F1, F2, mesure(a, unite), Gf) + longueurDehors(F1, F3, mesure(b, unite), Gf);
    html += lecon
      ? longueurDehors(F2, B2, `hauteur ${mesure(L, unite)}`, G)
      : longueurDehors(F2, B2, mesure(L, unite), G);
    return F.svg(440, 260, html, 'Un prisme droit à base triangulaire');
  }

  // Un cylindre en perspective, avec son rayon (ou son diamètre) sur la base du haut et sa hauteur à droite
  function figureCylindre(r, h, avecDiametre, unite) {
    const s = Math.min(85 / r, 160 / h);
    const [rx, H] = [r * s, h * s];
    const ry = Math.max(12, rx * 0.28);
    const cx = 220;
    const [yh, yb] = [130 - H / 2, 130 + H / 2];
    const demiEllipse = (y, devant) => `<path d="M ${r1(cx - rx)} ${r1(y)} A ${r1(rx)} ${r1(ry)} 0 0 ${devant ? 0 : 1} ${r1(cx + rx)} ${r1(y)}" `
      + `class="${devant ? 'fig-trait' : 'fig-marque fig-cache'}"/>`;
    const fond = `<path d="M ${r1(cx - rx)} ${r1(yh)} L ${r1(cx - rx)} ${r1(yb)} A ${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx + rx)} ${r1(yb)} `
      + `L ${r1(cx + rx)} ${r1(yh)} A ${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx - rx)} ${r1(yh)} Z" class="fig-plein"/>`;
    const [gauche, droite] = [[cx - rx, yh], [cx + rx, yh]];
    const html = fond + demiEllipse(yb, false) + `<ellipse cx="${cx}" cy="${r1(yh)}" rx="${r1(rx)}" ry="${r1(ry)}" class="fig-trait"/>`
      + F.segment([cx - rx, yh], [cx - rx, yb]) + F.segment([cx + rx, yh], [cx + rx, yb]) + demiEllipse(yb, true)
      + F.segment(avecDiametre ? gauche : [cx, yh], droite, 'fig-marque') + F.point([cx, yh], '')
      + F.longueur(avecDiametre ? gauche : [cx, yh], droite, mesure(avecDiametre ? 2 * r : r, unite), { cote: -1, distance: ry + 6 })
      + longueurDehors([cx + rx, yb], [cx + rx, yh], mesure(h, unite), [cx, 130]);
    return F.svg(440, 260, html, 'Un cylindre');
  }

  // Les prismes droits : [le nombre de côtés de la base, les bases]
  const PRISMES = [[3, 'deux triangles'], [4, 'deux rectangles'], [5, 'deux pentagones (5 côtés)'], [6, 'deux hexagones (6 côtés)'],
    [8, 'deux octogones (8 côtés)']];
  // Ce qu’on compte : [le mot, la réponse, les erreurs classiques, l’explication]
  const COMPTAGES = {
    faces: ['de faces', n => n + 2, n => [n, n + 1, 2 * n, 3 * n, 2 * n + 2],
      n => `2 bases + ${n} faces latérales (une par côté de la base) = <b>${n + 2} faces</b>.`],
    aretes: ['d’arêtes', n => 3 * n, n => [2 * n, n, n + 2, 4 * n, 2 * n + 2],
      n => `${n} arêtes sur chaque base (${n} + ${n} = ${2 * n}), et ${n} arêtes latérales qui relient les bases : <b>${3 * n} arêtes</b>.`],
    sommets: ['de sommets', n => 2 * n, n => [n, n + 2, 3 * n, 4 * n],
      n => `${n} sommets sur chaque base : ${n} + ${n} = <b>${2 * n} sommets</b>.`],
    laterales: ['de faces latérales', n => n, n => [n + 2, 2 * n, 3 * n, n + 1],
      n => `Il y a une face latérale (un rectangle) par côté de la base : <b>${n} faces latérales</b>.`],
  };

  const VOCABULAIRE_SOLIDES = [
    ['Les faces latérales d’un prisme droit sont des ___.', 'rectangles', ['triangles', 'carrés', 'pentagones'],
      'Les faces latérales d’un prisme droit sont des <b>rectangles</b> : elles relient les deux bases.'],
    ['Les deux bases d’un cylindre sont des ___.', 'disques', ['rectangles', 'triangles', 'carrés'],
      'Un cylindre a deux bases superposables : des <b>disques</b>.'],
    ['Un prisme droit dont les bases sont des rectangles (pas forcément des carrés) est ___.', 'un pavé droit',
      ['un cube', 'un rectangle', 'un parallélogramme'],
      'Deux bases rectangulaires reliées par des faces rectangulaires : c’est <b>un pavé droit</b>. (Un rectangle, c’est une figure plane, '
      + 'pas un solide ; et ce n’est un cube que si toutes les faces sont des carrés.)'],
    ['Les deux bases d’un prisme droit sont ___.', 'superposables', ['perpendiculaires', 'sécantes', 'de tailles différentes'],
      'Les deux bases d’un prisme droit sont <b>superposables</b> : ce sont deux polygones identiques, dans des plans parallèles.'],
    ['Déroulée à plat, la face latérale d’un cylindre est un ___.', 'rectangle', ['disque', 'triangle', 'losange'],
      'Dans le patron d’un cylindre, la face latérale est un <b>rectangle</b> (comme l’étiquette d’une boîte de conserve).'],
    ['La hauteur d’un prisme droit est la longueur d’une ___.', 'arête latérale', ['arête de la base', 'diagonale d’une base', 'diagonale d’une face'],
      'La hauteur d’un prisme droit est la longueur d’une <b>arête latérale</b>, qui relie les deux bases.'],
  ];

  const PROPRIETES_SOLIDES = [
    ['Un pavé droit est un prisme droit.', true,
      'Oui : ses bases sont des rectangles, reliées par des faces rectangulaires. C’est un <b>prisme droit</b> particulier.'],
    ['Les faces latérales d’un prisme droit sont des rectangles.', true, 'Oui : les faces latérales sont des <b>rectangles</b>.'],
    ['Si on double la hauteur d’un cylindre, son volume double.', true,
      'Volume = aire de la base × hauteur : si la hauteur double, le volume <b>double</b>.'],
    ['Un prisme droit à base triangulaire a 5 faces.', true, '2 bases + 3 faces latérales = <b>5 faces</b>.'],
    ['Le volume d’un cylindre de rayon r et de hauteur h est π × r² × h.', true, 'Oui : l’aire de la base (π × r²) × la hauteur.'],
    ['Un prisme droit à base triangulaire a 6 faces.', false, '2 bases + 3 faces latérales = <b>5 faces</b>, pas 6.'],
    ['Les faces latérales d’un prisme droit sont des triangles.', false,
      'Non : ce sont des <b>rectangles</b>. Les triangles, ce sont les faces latérales d’une pyramide.'],
    ['Si on double le rayon d’un cylindre, son volume double.', false,
      'Volume = π × r × r × h : si r double, le volume est multiplié par 2 × 2 = <b>4</b>.'],
    ['Le volume d’un prisme droit est aire de la base × hauteur ÷ 2.', false, 'Pas de ÷ 2 : volume = <b>aire de la base × hauteur</b>.'],
    ['Le volume d’un cylindre de rayon r et de hauteur h est 2 × π × r × h.', false,
      'Non : 2 × π × r × h, c’est l’aire de la face latérale. Volume = <b>π × r² × h</b>.'],
  ];

  ajouterEtape({
    id: '5e-mesures-prismes',
    banque: ['volumePrisme', 'volumePrisme', 'volumeChoix', 'cylindre', 'cylindreExact', 'cylindreFigure', 'litres', 'compter',
      'vocabulaire', 'patron', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'volumePrisme') {
        const a = entier(3, 8);
        const b = entier(2, 6);
        const L = entier(4, 12);
        const B = net(a * b / 2);
        const V = net(B * L);
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `La base de ce prisme droit est un triangle rectangle. Quel est son volume ?${figurePrisme(a, b, L, 'cm')}`,
          reponse: V,
          unite: 'cm³',
          explication: `Aire de la base (un triangle rectangle) : ${a} × ${b} ÷ 2 = ${mesure(B, 'cm²')}.<br>`
            + `Volume = aire de la base × hauteur = ${ecrire(B)} × ${L} = <b>${mesure(V, 'cm³')}</b>.<br>`
            + `⚠️ La hauteur du prisme, c’est la longueur des arêtes qui relient les deux bases : ${mesure(L, 'cm')}.`,
        });
      }
      if (sorte === 'volumeChoix') {
        const cylindre = auHasard(0.35);
        const B = cylindre ? parmi([12, 15, 20, 25, 30, 50]) : entier(6, 30);
        const h = entier(3, 12);
        const V = B * h;
        const demi = auHasard();
        return choix({
          consigne: 'Calcule le volume',
          enonce: `Un ${cylindre ? 'cylindre' : 'prisme droit'} a une base d’aire ${mesure(B, 'cm²')} et une hauteur de ${mesure(h, 'cm')}. `
            + `Son volume est ___${ESPACE}cm³.`,
          reponse: V,
          // l’erreur dont parle l’explication (toujours proposée) : un ÷ 2 en trop (plus petit) ou la base comptée deux fois
          // (plus grand) ; les autres : une addition, l’aire des deux bases ajoutée, une addition doublée
          garder: meilleursPieges(V, [demi ? net(B * h / 2) : 2 * B * h]),
          pieges: meilleursPieges(V, [B + h, net(B * h / 2), 2 * B * h, B * h + 2 * B, 2 * (B + h)]),
          explication: `Volume = aire de la base × hauteur.<br>${B} × ${h} = <b>${mesure(V, 'cm³')}</b>.<br>`
            + (demi ? `⚠️ On ne divise pas par 2 : ${ecrire(net(B * h / 2))}, c’est deux fois trop petit.`
              : `⚠️ On compte la base une seule fois : 2 × ${B} × ${h} = ${2 * B * h}, c’est deux fois trop.`),
        });
      }
      if (sorte === 'cylindre') {
        const r = entier(3, 6);
        const h = entier(2, 10);
        const V = foisPi(r * r * h);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule le volume',
          enonce: `Avec π ≈ 3,14, le volume d’un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')} `
            + `est d’environ ___${ESPACE}cm³.`,
          reponse: V,
          // 2 × π × r pour l’aire de la base (toujours proposé : l’explication en parle), la base seule, π × r × h,
          // le diamètre au lieu du rayon, les deux bases, la virgule de 3,14 mal placée
          garder: meilleursPieges(V, [foisPi(2 * r * h)]),
          pieges: meilleursPieges(V, [foisPi(r * r), foisPi(r * h), foisPi(4 * r * r * h), foisPi(2 * r * r * h), foisPi(10 * r * r * h)]),
          explication: `Volume du cylindre = aire de la base × hauteur = π × r × r × h.<br>`
            + `V ≈ 3,14 × ${r} × ${r} × ${h} = 3,14 × ${r * r * h} = <b>${mesure(V, 'cm³')}</b>.<br>`
            + `⚠️ La base est un disque : son aire est π × r × r, pas 2 × π × r (3,14 × 2 × ${r} × ${h} = ${ecrire(foisPi(2 * r * h))}).`,
        }));
      }
      if (sorte === 'cylindreExact') {
        const r = entier(2, 6);
        const h = entier(2, 10);
        const V = r * r * h;
        return choix({
          consigne: 'Trouve la valeur exacte',
          enonce: `Le volume exact d’un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')} est ___.`,
          reponse: avecPi(V, 'cm³'),
          pieges: [2 * r * h, r * h, 4 * V, r * r, 2 * V].filter(n => n !== V).map(n => avecPi(n, 'cm³')),
          explication: `Volume = π × r × r × h = π × ${r} × ${r} × ${h}.<br>${r} × ${r} × ${h} = ${V}, donc le volume exact est `
            + `<b>${avecPi(V, 'cm³')}</b> (environ ${mesure(foisPi(V), 'cm³')}).`,
        });
      }
      if (sorte === 'cylindreFigure') {
        const r = entier(2, 6);
        const h = entier(3, 12);
        const avecDiametre = auHasard(0.4);
        const V = foisPi(r * r * h);
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `Avec π ≈ 3,14, calcule le volume de ce cylindre.${figureCylindre(r, h, avecDiametre, 'cm')}`,
          reponse: V,
          unite: 'cm³',
          explication: (avecDiametre ? `Le rayon est la moitié du diamètre : ${2 * r} ÷ 2 = ${mesure(r, 'cm')}.<br>` : '')
            + `Volume = π × r × r × h ≈ 3,14 × ${r} × ${r} × ${h} = 3,14 × ${r * r * h} = <b>${mesure(V, 'cm³')}</b>.`,
        });
      }
      if (sorte === 'litres') {
        const cas = parmi(['casserole', 'seau', 'citerne', 'boite']);
        if (cas === 'citerne') {
          const h = parmi([1, 2, 3]);
          const V = foisPi(h);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Une citerne d’eau de pluie est un cylindre de rayon ${mesure(1, 'm')} et de hauteur ${mesure(h, 'm')}. `
              + 'Avec π ≈ 3,14, combien de litres peut-elle contenir ?',
            reponse: net(V * 1000),
            unite: 'L',
            explication: `Volume ≈ 3,14 × 1 × 1 × ${h} = ${mesure(V, 'm³')}.<br>`
              + `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L, donc ${mesure(V, 'm³')} = <b>${mesure(net(V * 1000), 'L')}</b>.`,
          });
        }
        if (cas === 'boite') {
          const B = parmi([100, 150, 200, 250, 400]);
          const h = parmi([10, 12, 20]);
          const V = B * h;
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Une boîte en forme de prisme droit a une base d’aire ${mesure(B, 'cm²')} et une hauteur de ${mesure(h, 'cm')}. `
              + 'Combien de litres peut-elle contenir ?',
            reponse: net(V / 1000),
            unite: 'L',
            explication: `Volume = ${B} × ${h} = ${mesure(V, 'cm³')}.<br>`
              + `1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³, donc ${mesure(V, 'cm³')} = <b>${mesure(net(V / 1000), 'L')}</b>.`,
          });
        }
        const h = cas === 'casserole' ? parmi([8, 10, 12, 15]) : parmi([20, 25, 30]);
        const V = foisPi(100 * h);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `${cas === 'casserole' ? 'Une casserole' : 'Un seau'} en forme de cylindre a un rayon de ${mesure(10, 'cm')} `
            + `et une hauteur de ${mesure(h, 'cm')}. Avec π ≈ 3,14, combien de litres peut-${cas === 'casserole' ? 'elle' : 'il'} contenir ?`,
          reponse: net(V / 1000),
          unite: 'L',
          explication: `Volume ≈ 3,14 × 10 × 10 × ${h} = ${mesure(V, 'cm³')}.<br>`
            + `1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³, donc ${mesure(V, 'cm³')} = <b>${mesure(net(V / 1000), 'L')}</b>.`,
        });
      }
      if (sorte === 'compter') {
        const [n, bases] = parmi(PRISMES);
        const [mot, reponse, erreurs, explication] = COMPTAGES[parmi(Object.keys(COMPTAGES))];
        const enonce = `Un prisme droit a pour bases ${bases}. Combien a-t-il ${mot} ?`;
        if (auHasard(0.4)) return nombre({ consigne: 'Compte', enonce, reponse: reponse(n), explication: explication(n) });
        return choix({
          consigne: 'Compte',
          enonce,
          reponse: reponse(n),
          pieges: meilleursPieges(reponse(n), erreurs(n)),
          explication: explication(n),
        });
      }
      if (sorte === 'vocabulaire') {
        const [enonce, reponse, pieges, explication] = parmi(VOCABULAIRE_SOLIDES);
        return choix({ consigne: 'Complète', enonce, reponse, pieges, explication });
      }
      if (sorte === 'patron') {
        const r = entier(2, 8);
        const h = entier(3, 12);
        const L = foisPi(2 * r);
        return sansIndiceDeForme(() => choix({
          consigne: 'Pense au patron',
          enonce: `Dans le patron d’un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')}, la face latérale est `
            + `un rectangle de ${mesure(h, 'cm')} sur environ ___${ESPACE}cm. (Prends π ≈ 3,14.)`,
          reponse: L,
          // π × r, l’aire du disque, le diamètre, + au lieu de ×, le diamètre doublé, π × r × h
          pieges: meilleursPieges(L, [foisPi(r), foisPi(r * r), 2 * r, net(2 * r + PI), foisPi(4 * r), foisPi(r * h)]),
          explication: 'Déroulée, la face latérale fait tout le tour de la base : sa longueur est celle du cercle de la base.<br>'
            + `2 × π × r ≈ 2 × 3,14 × ${r} = <b>${mesure(L, 'cm')}</b>.`,
        }));
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard(0.35)) {
        const r = entierSaufDeux(3, 6);
        const h = entier(2, 9);
        const V = r * r * h;
        return vraiFaux({
          enonce: `Un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')} a un volume de ${avecPi(vrai ? V : 2 * r * h, 'cm³')}.`,
          vrai,
          explication: `Volume = π × r × r × h : ${r} × ${r} × ${h} = ${V}, donc le volume est <b>${avecPi(V, 'cm³')}</b>.`
            + (vrai ? '' : `<br>⚠️ 2 × π × r × h, c’est l’aire de la face latérale.`),
        });
      }
      return vraiFauxDans(PROPRIETES_SOLIDES, vrai);
    },
    titreLecon: 'Prismes et cylindres',
    lecon: `
      <p>Un <b>prisme droit</b> a deux <b>bases</b> superposables (des triangles, des rectangles…), reliées par des
        <b>faces latérales</b> qui sont des <b>rectangles</b>. Sa <b>hauteur</b> est la longueur d’une arête latérale.</p>
      ${figurePrisme(4, 3, 8, 'cm', true)}
      <p>Si la base a n côtés : n + 2 faces, 3 × n arêtes et 2 × n sommets. 👉 <i>Base triangulaire : 5 faces, 9 arêtes, 6 sommets.</i></p>
      <p>Un <b>cylindre</b> a deux bases qui sont des <b>disques</b>. Déroulée, sa face latérale est un rectangle dont la longueur
        est le tour de la base : 2 × π × r.</p>
      <table>
        <tr><th>Prisme droit ou cylindre</th><td>Volume = <b>aire de la base × hauteur</b></td></tr>
        <tr><th>Cylindre</th><td>Volume = π × r × r × h = π × r² × h</td></tr>
      </table>
      <p>👉 <i>Le prisme dessiné : sa base est le triangle rectangle de devant, d’aire 4 × 3 ÷ 2 = 6&nbsp;cm² ;
        son volume est 6 × 8 = 48&nbsp;cm³.</i></p>
      <p>👉 <i>Cylindre de rayon 3&nbsp;cm et de hauteur 10&nbsp;cm : π × 3 × 3 × 10 = 90π&nbsp;cm³ ≈ 282,6&nbsp;cm³.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un prisme, c’est une pile de tranches toutes pareilles à la base :
        on multiplie l’aire d’une tranche par la hauteur de la pile !</div>
      <p>⚠️ Pas de ÷ 2 : volume = aire de la base × hauteur. Pour les litres : 1&nbsp;L = 1&nbsp;000&nbsp;cm³ et 1&nbsp;m³ = 1&nbsp;000&nbsp;L.</p>
    `,
  });

  // ======================================================================
  // 5. Convertir des aires et des volumes
  // ======================================================================
  // Chaque unité, en puissance de 10 du m² (pour les aires) ou du m³ (pour les volumes) :
  // 1 cm² = 0,0001 m² (−4), 1 L = 1 dm³ = 0,001 m³ (−3)…
  const PUISSANCES = {
    'km²': 6, ha: 4, 'hm²': 4, a: 2, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6,
    'm³': 0, 'dm³': -3, L: -3, cL: -5, 'cm³': -6, mL: -6, 'mm³': -9,
  };
  const estCube = u => u.endsWith('³');
  const estAire = u => u.endsWith('²') || u === 'ha' || u === 'a';
  // Multiplier par 10, 100, 1 000… (k rangs) ; si k est négatif, on divise
  const decaler = (x, k) => net(k >= 0 ? x * 10 ** k : x / 10 ** -k);
  const rangs = k => (k === 1 ? 'd’un rang' : `de ${k} rangs`);

  // Pourquoi : « 1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm² »
  const RELATIONS = {
    'ha>m²': `1${ESPACE}ha = 1${ESPACE}hm², l’aire d’un carré de 100${ESPACE}m de côté : 1${ESPACE}ha = 100 × 100 = 10${ESPACE}000${ESPACE}m²`,
    'a>m²': `1${ESPACE}a = 1${ESPACE}dam², l’aire d’un carré de 10${ESPACE}m de côté : 1${ESPACE}a = 10 × 10 = 100${ESPACE}m²`,
    'ha>a': `1${ESPACE}ha = 1${ESPACE}hm² et 1${ESPACE}a = 1${ESPACE}dam². Comme 1${ESPACE}hm = 10${ESPACE}dam, 1${ESPACE}ha = 10 × 10 = 100${ESPACE}a`,
    'km²>ha': `1${ESPACE}km = 10${ESPACE}hm, donc 1${ESPACE}km² = 10 × 10 = 100${ESPACE}hm² = 100${ESPACE}ha`,
    'L>cm³': `1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³`,
    'dm³>L': `1${ESPACE}dm³ = 1${ESPACE}L`,
    'cm³>mL': `1${ESPACE}cm³ = 1${ESPACE}mL`,
    'm³>L': `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = 1${ESPACE}000${ESPACE}L`,
    'cL>cm³': `1${ESPACE}cL = 10${ESPACE}mL = 10${ESPACE}cm³`,
    'dm³>mL': `1${ESPACE}dm³ = 1${ESPACE}L = 1${ESPACE}000${ESPACE}mL`,
  };
  function relation(grande, petite) {
    if (RELATIONS[`${grande}>${petite}`]) return RELATIONS[`${grande}>${petite}`];
    const n = estCube(grande) ? 3 : 2;
    const f = 10 ** ((PUISSANCES[grande] - PUISSANCES[petite]) / n);
    return `1${ESPACE}${grande.slice(0, -1)} = ${mesure(f, petite.slice(0, -1))}, donc 1${ESPACE}${grande} = `
      + `${Array(n).fill(ecrire(f)).join(' × ')} = ${mesure(f ** n, petite)}`;
  }
  // [la grande unité, la petite] d’une paire, dans le bon ordre
  const grandePetite = (u, v) => (PUISSANCES[u] >= PUISSANCES[v] ? [u, v] : [v, u]);

  function expliquerConversion(a, de, vers, [grande, petite]) {
    const p = PUISSANCES[de] - PUISSANCES[vers];
    const fin = `<br>${mesure(a, de)} = <b>${mesure(decaler(a, p), vers)}</b>.`;
    if (p === 0) return `${relation(grande, petite)} : c’est le même nombre.${fin}`;
    const f = ecrire(10 ** Math.abs(p));
    return `${relation(grande, petite)}.<br>`
      + (p > 0 ? `On multiplie par ${f} : la virgule se décale ${rangs(p)} vers la droite.`
        : `On divise par ${f} : la virgule se décale ${rangs(-p)} vers la gauche.`) + fin;
  }

  // Un nombre à convertir (décalage de p rangs) et le résultat : au plus 3 chiffres après la virgule, et moins de 10 millions
  function nombresAConvertir(p) {
    const departs = p > 0
      ? [() => entier(2, 9), () => entier(11, 99), () => entier(101, 999), () => decimal(0.1, 9.9, 1), () => decimal(1, 9.99, 2),
        () => decimal(10, 99, 1)]
      : [() => entier(2, 9), () => entier(11, 99), () => entier(101, 999), () => entier(2, 99) * 10 ** entier(1, 4), () => decimal(10, 99, 1)];
    for (;;) {
      const a = parmi(departs)();
      const b = decaler(a, p);
      // (quand on divise, un résultat avec peu de chiffres après la virgule : les pièges « un zéro de trop » restent lisibles)
      // (quand on multiplie, un résultat pas trop grand, pour que les pièges « un ou deux zéros de trop » restent possibles ;
      // mais une conversion de 6 rangs, comme 2 km² = 2 000 000 m², donne toujours un grand nombre)
      if (decimalesDe(b) <= (p < 0 ? 1 : 3) && b < (p > 0 ? Math.max(1e5, 10 ** (p + 1)) : 1e7)) return [a, b];
    }
  }

  // Les erreurs classiques : convertir comme des longueurs (× 10 par rang) ou comme des volumes, se tromper de sens,
  // un zéro de trop ou de moins, ne pas convertir du tout
  function piegesConversion(a, de, vers) {
    const p = PUISSANCES[de] - PUISSANCES[vers];
    let decalages = [-3, -2, -1, 1, 2, 3];
    if (p !== 0) {
      const s = Math.sign(p);
      const autres = estCube(de) && estCube(vers) ? [p / 3, 2 * p / 3] : (estAire(de) ? [p / 2, 3 * p / 2] : []);
      decalages = [...autres, -p, -p - s, p + s, p - s, p + 2 * s, p + 3 * s, 0];
    }
    const valeurs = decalages.filter(j => j !== p).map(j => decaler(a, j)).filter(v => v >= 0.0001 && v < 1e7);
    return meilleursPieges(decaler(a, p), valeurs, 4);
  }

  // Les conversions qu’on rencontre le plus souvent : [une unité, une autre]
  const PAIRES_AIRES = [['m²', 'dm²'], ['m²', 'dm²'], ['m²', 'cm²'], ['m²', 'cm²'], ['dm²', 'cm²'], ['dm²', 'cm²'], ['cm²', 'mm²'],
    ['cm²', 'mm²'], ['dm²', 'mm²'], ['km²', 'm²']];
  const PAIRES_AGRAIRES = [['ha', 'm²'], ['ha', 'm²'], ['a', 'm²'], ['a', 'm²'], ['ha', 'a'], ['km²', 'ha']];
  const PAIRES_VOLUMES = [['m³', 'dm³'], ['m³', 'dm³'], ['dm³', 'cm³'], ['dm³', 'cm³'], ['cm³', 'mm³'], ['m³', 'cm³']];
  // (en boutons, pas les conversions de 6 rangs : leurs pièges auraient trop de chiffres)
  const sansSixRangs = paires => paires.filter(([u, v]) => Math.abs(PUISSANCES[u] - PUISSANCES[v]) < 6);
  const PAIRES_LITRES = [['L', 'cm³'], ['L', 'cm³'], ['dm³', 'L'], ['cm³', 'mL'], ['m³', 'L'], ['m³', 'L'], ['cL', 'cm³'], ['dm³', 'mL']];

  // Une conversion au hasard, dans un sens ou dans l’autre
  function tirerConversion(paires) {
    const paire = parmi(paires);
    const [de, vers] = auHasard() ? paire : [paire[1], paire[0]];
    const [a, b] = nombresAConvertir(PUISSANCES[de] - PUISSANCES[vers]);
    return { a, b, de, vers, paire: grandePetite(...paire) };
  }
  // La mise en garde qui va avec
  const attention = u => (estCube(u) ? '<br>⚠️ Pour les volumes : 3 rangs par unité (× 1&nbsp;000).'
    : (estAire(u) ? '<br>⚠️ Pour les aires : 2 rangs par unité (× 100), pas un seul !' : ''));

  function questionConvertir(paires) {
    const { a, b, de, vers, paire } = tirerConversion(paires);
    return nombre({
      consigne: 'Convertis',
      enonce: `${mesure(a, de)} = ___${ESPACE}${vers}`,
      reponse: b,
      explication: expliquerConversion(a, de, vers, paire),
    });
  }
  function questionConvertirChoix(paires, miseEnGarde = true) {
    const { a, b, de, vers, paire } = tirerConversion(paires);
    // L’erreur gardée : convertir comme des longueurs (pour les aires et les volumes), ou se tromper de sens
    const commeLongueurs = miseEnGarde && auHasard();
    return sansIndiceDeForme(() => choix({
      consigne: 'Choisis la bonne conversion',
      enonce: `${mesure(a, de)} = ___${ESPACE}${vers}`,
      reponse: b,
      garder: meilleursPieges(b, [commeLongueurs
        ? decaler(a, (PUISSANCES[de] - PUISSANCES[vers]) / (estCube(de) ? 3 : 2)) : decaler(a, PUISSANCES[vers] - PUISSANCES[de])]
        .filter(v => v >= 0.0001 && v < 1e7), 4),
      pieges: piegesConversion(a, de, vers),
      // (1 L = 1 dm³, 1 mL = 1 cm³ : c’est le même nombre, il n’y a pas de sens à respecter)
      explication: expliquerConversion(a, de, vers, paire) + (commeLongueurs ? attention(de) : (egaux(a, b) ? ''
        : `<br>⚠️ Vers une unité plus ${b > a ? 'petite, le nombre devient plus grand' : 'grande, le nombre devient plus petit'} : `
          + `${b > a ? 'on multiplie' : 'on divise'}, et pas l’inverse !`)),
    }));
  }

  // Des terrains : [le début de la phrase, l’unité de départ, l’unité d’arrivée, les mesures possibles]
  const TERRAINS = [
    ['Le champ de Papi, en brousse, mesure', 'ha', 'm²', [1.5, 2, 2.5, 3, 0.8, 1.2]],
    ['Le jardin de Mamie mesure', 'a', 'm²', [2, 3, 4, 5, 2.5, 3.5]],
    ['La forêt de Roxy mesure', 'ha', 'a', [3, 5, 12, 2.5, 40, 7.5]],
    ['Le parc de la ville mesure', 'm²', 'ha', [15000, 25000, 8000, 32000, 45000]],
    ['Le terrain de football de la tribu mesure', 'm²', 'ha', [7000, 6400, 7500]],
    ['Le lac de la forêt mesure', 'km²', 'ha', [2, 3.5, 1.2, 0.8]],
    ['Le potager de l’école mesure', 'm²', 'a', [150, 250, 300, 80]],
  ];

  // Comparer deux mesures écrites dans deux unités différentes : 2 m² ___ 150 dm²
  const PAIRES_COMPARER = [['m²', 'dm²'], ['m²', 'cm²'], ['dm²', 'cm²'], ['cm²', 'mm²'], ['ha', 'm²'], ['a', 'm²'],
    ['m³', 'dm³'], ['dm³', 'cm³'], ['L', 'cm³'], ['m³', 'L']];
  const SIGNES = { '<': '&lt;', '>': '&gt;', '=': '=' };
  function questionComparer() {
    const [grande, petite] = parmi(PAIRES_COMPARER);
    const p = PUISSANCES[grande] - PUISSANCES[petite];
    const a = parmi([() => entier(2, 9), () => decimal(1, 9.9, 1), () => decimal(0.1, 0.9, 1)])();
    const converti = decaler(a, p);
    // Des mesures proches qui piègent : la conversion des longueurs (× 10 par rang), un rang de trop, un peu plus, un peu moins
    const k = estCube(grande) && estCube(petite) ? p / 3 : (estAire(grande) ? p / 2 : p - 1);
    const pas = 10 ** (p - 1);
    const proches = [decaler(a, k), decaler(a, p + 1), converti + parmi([1, 2, 5]) * pas, converti - parmi([1, 2, 5]) * pas]
      .map(net).filter(v => v > 0 && decimalesDe(v) <= 3 && !egaux(v, converti));
    const b = auHasard(0.25) ? converti : parmi(proches);
    const grandeAGauche = auHasard();
    const [gauche, droite] = grandeAGauche ? [mesure(a, grande), mesure(b, petite)] : [mesure(b, petite), mesure(a, grande)];
    const [vG, vD] = grandeAGauche ? [converti, b] : [b, converti];
    const reponse = vG < vD ? '<' : (vG > vD ? '>' : '=');
    return choix({
      consigne: 'Compare avec <, > ou =',
      enonce: `${gauche} ___ ${droite}`,
      reponse,
      choix: ['<', '=', '>'],
      explication: `${relation(grande, petite)}.<br>On écrit tout en ${petite} : ${mesure(a, grande)} = ${mesure(converti, petite)}, et `
        + `${mesure(vG, petite)} ${SIGNES[reponse]} ${mesure(vD, petite)}.<br>Donc <b>${gauche} ${SIGNES[reponse]} ${droite}</b>.`,
    });
  }

  function problemeConversion() {
    const [prenom] = parmi(PRENOMS);
    const cas = parmi(['piscine', 'aquarium', 'verres', 'carrelage']);
    if (cas === 'piscine') {
      const v = parmi([40, 45, 60, 75, 80, 120]);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${parmi(['La piscine du camping', 'La piscine de l’hôtel', 'La piscine du collège'])} contient ${mesure(v, 'm³')} d’eau. Combien de litres est-ce ?`,
        reponse: v * 1000,
        unite: 'L',
        explication: `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = 1${ESPACE}000${ESPACE}L.<br>${v} × 1${ESPACE}000 = <b>${mesure(v * 1000, 'L')}</b>.`,
      });
    }
    if (cas === 'aquarium') {
      const v = parmi([24000, 36000, 54000, 60000, 72000, 96000]);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `L’aquarium ${de(prenom)} a un volume de ${mesure(v, 'cm³')}. Combien de litres d’eau peut-il contenir ?`,
        reponse: v / 1000,
        unite: 'L',
        explication: `1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³.<br>${ecrire(v)} ÷ 1${ESPACE}000 = <b>${mesure(v / 1000, 'L')}</b>.`,
      });
    }
    if (cas === 'verres') {
      let litres;
      let verre;
      do {
        litres = parmi([1, 1.5, 2]);
        verre = parmi([100, 125, 150, 200, 250]);
      } while ((litres * 1000) % verre !== 0 || litres * 1000 / verre > 15);
      const enCm3 = litres * 1000;
      return nombre({
        consigne: 'Résous le problème',
        enonce: `Une bouteille de ${mesure(litres, 'L')} de jus de mangue remplit des verres de ${mesure(verre, 'cm³')}. Combien de verres peut-on remplir ?`,
        reponse: enCm3 / verre,
        unite: 'verres',
        explication: (litres === 1 ? `1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³.<br>`
          : `${mesure(litres, 'L')} = ${mesure(enCm3, 'cm³')} (1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³).<br>`)
          + `${ecrire(enCm3)} ÷ ${verre} = <b>${enCm3 / verre}${ESPACE}verres</b>.`,
      });
    }
    const c = parmi([20, 25, 50]);
    const S = parmi([3, 4, 5, 6, 8]);
    const carreau = c * c;
    return nombre({
      consigne: 'Résous le problème',
      enonce: `Le sol de la salle de bains mesure ${mesure(S, 'm²')}. Combien faut-il de carreaux carrés de ${mesure(c, 'cm')} de côté `
        + 'pour le couvrir ?',
      reponse: S * 10000 / carreau,
      unite: 'carreaux',
      explication: `Un carreau : ${c} × ${c} = ${mesure(carreau, 'cm²')}. Le sol : ${mesure(S, 'm²')} = ${mesure(S * 10000, 'cm²')}.<br>`
        + `${ecrire(S * 10000)} ÷ ${ecrire(carreau)} = <b>${ecrire(S * 10000 / carreau)}${ESPACE}carreaux</b>.`,
    });
  }

  // Les égalités à connaître par cœur
  const A_SAVOIR = [['m²', 'dm²'], ['m²', 'cm²'], ['cm²', 'mm²'], ['m³', 'dm³'], ['dm³', 'cm³'], ['L', 'cm³'], ['m³', 'L'],
    ['ha', 'm²'], ['a', 'm²'], ['cm³', 'mL'], ['dm³', 'L']];

  ajouterEtape({
    id: '5e-mesures-conversions',
    banque: ['aireNombre', 'aireNombre', 'aireChoix', 'aireChoix', 'agraire', 'volumeNombre', 'volumeChoix', 'volumeChoix',
      'litres', 'litres', 'comparer', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'aireNombre') return questionConvertir(PAIRES_AIRES);
      if (sorte === 'aireChoix') return questionConvertirChoix(sansSixRangs(PAIRES_AIRES));
      if (sorte === 'volumeNombre') return questionConvertir(PAIRES_VOLUMES);
      if (sorte === 'volumeChoix') return questionConvertirChoix(sansSixRangs(PAIRES_VOLUMES));
      if (sorte === 'litres') return questionConvertirChoix(PAIRES_LITRES, false);
      if (sorte === 'agraire') {
        if (auHasard()) return questionConvertirChoix(PAIRES_AGRAIRES, false);
        const [debut, de, vers, valeurs] = parmi(TERRAINS);
        const a = parmi(valeurs);
        const b = decaler(a, PUISSANCES[de] - PUISSANCES[vers]);
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce: `${debut} ${mesure(a, de)}, soit ___${ESPACE}${vers}.`,
          reponse: b,
          pieges: piegesConversion(a, de, vers),
          explication: expliquerConversion(a, de, vers, grandePetite(de, vers)),
        }));
      }
      if (sorte === 'comparer') return questionComparer();
      if (sorte === 'probleme') return problemeConversion();
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      if (auHasard()) {
        const [grande, petite] = parmi(A_SAVOIR);
        const p = PUISSANCES[grande] - PUISSANCES[petite];
        const faux = p === 0 ? 1000 : 10 ** (estCube(grande) && estCube(petite) ? 2 * p / 3 : (estAire(grande) ? p / 2 : p - 1));
        return vraiFaux({
          enonce: `1${ESPACE}${grande} = ${mesure(vrai ? 10 ** p : faux, petite)}`,
          vrai,
          explication: `${relation(grande, petite)}.`,
        });
      }
      const { a, b, de, vers, paire } = tirerConversion(parmi([PAIRES_AIRES, PAIRES_VOLUMES, PAIRES_LITRES, PAIRES_AGRAIRES]));
      const pieges = piegesConversion(a, de, vers).filter(x => decimalesDe(x) <= 3 && !egaux(x, a));
      return vraiFaux({
        enonce: `${mesure(a, de)} = ${mesure(vrai || !pieges.length ? b : parmi(pieges), vers)}`,
        vrai: vrai || !pieges.length,
        explication: expliquerConversion(a, de, vers, paire),
      });
    },
    titreLecon: 'Convertir des aires et des volumes',
    lecon: `
      <h4>Les aires : × 100 à chaque rang</h4>
      <p>1&nbsp;m = 10&nbsp;dm, donc 1&nbsp;m² = 10 × 10 = <b>100&nbsp;dm²</b>. Dans le tableau, chaque unité d’aire a <b>2 chiffres</b>.</p>
      <table>
        <tr><th>km²</th><th>hm² (ha)</th><th>dam² (a)</th><th>m²</th><th>dm²</th><th>cm²</th><th>mm²</th></tr>
        <tr><td></td><td></td><td></td><td>3</td><td>50</td><td>00</td><td></td></tr>
      </table>
      <p>👉 <i>3,5&nbsp;m² = 350&nbsp;dm² = 35&nbsp;000&nbsp;cm²</i> · 1&nbsp;cm² = 100&nbsp;mm² ·
        1&nbsp;<b>ha</b> (hectare) = 10&nbsp;000&nbsp;m² · 1&nbsp;<b>a</b> (are) = 100&nbsp;m²</p>
      <h4>Les volumes : × 1&nbsp;000 à chaque rang</h4>
      <p>1&nbsp;m = 10&nbsp;dm, donc 1&nbsp;m³ = 10 × 10 × 10 = <b>1&nbsp;000&nbsp;dm³</b>. Chaque unité de volume a <b>3 chiffres</b> :
        1&nbsp;dm³ = 1&nbsp;000&nbsp;cm³ · 1&nbsp;cm³ = 1&nbsp;000&nbsp;mm³.</p>
      <p><b>Volumes et contenances :</b> 1&nbsp;L = 1&nbsp;dm³ · 1&nbsp;mL = 1&nbsp;cm³ · 1&nbsp;cL = 10&nbsp;cm³ · 1&nbsp;m³ = 1&nbsp;000&nbsp;L</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le petit chiffre te dit combien de rangs sauter à chaque unité :
        cm² → 2 rangs, cm³ → 3 rangs. Vers une unité plus petite, le nombre devient plus grand (on multiplie).</div>
      <p>⚠️ 1&nbsp;m² n’est pas 10&nbsp;dm² (ça, c’est pour les longueurs) ! Et 1&nbsp;m³ = 1&nbsp;000&nbsp;dm³, pas 100.</p>
    `,
  });

  // ======================================================================
  // 6. Calculer avec les durées
  // ======================================================================
  // Les horaires sont comptés en minutes depuis minuit : 9 h 45 → 585
  const deuxChiffres = n => String(n).padStart(2, '0');
  // Un horaire : « 9 h 45 », « 10 h 05 », « 11 h »
  function horaire(t) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    return m ? `${h}${ESPACE}h${ESPACE}${deuxChiffres(m)}` : `${h}${ESPACE}h`;
  }
  // Une durée en minutes : « 1 h 35 min », « 2 h », « 45 min »
  function duree(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h ? `${h}${ESPACE}h` : '', m ? `${m}${ESPACE}min` : ''].filter(Boolean).join(ESPACE);
  }
  // Une durée en secondes : « 2 min 30 s »
  function dureeS(secondes) {
    const m = Math.floor(secondes / 60);
    const s = secondes % 60;
    return [m ? `${m}${ESPACE}min` : '', s ? `${s}${ESPACE}s` : ''].filter(Boolean).join(ESPACE);
  }

  // Les parties d’heure qui tombent juste : [en heure décimale, en minutes]
  const PARTIES_D_HEURE = [[0.1, 6], [0.2, 12], [0.25, 15], [0.3, 18], [0.4, 24], [0.5, 30], [0.6, 36], [0.7, 42], [0.75, 45],
    [0.8, 48], [0.9, 54]];
  // Pourquoi : « 0,2 h = 0,2 × 60 min = 12 min »
  const enMinutesTexte = (f, m) => `${mesure(f, 'h')} = ${ecrire(f)} × 60${ESPACE}min = ${mesure(m, 'min')}`;
  // Pourquoi 12 min = 0,2 h
  function pourquoiDecimal(m) {
    if (m === 30) return 'une demi-heure';
    if (m === 15) return 'un quart d’heure';
    if (m === 45) return 'trois quarts d’heure';
    if (m === 6) return `un dixième d’heure : 60 ÷ 10 = 6`;
    return `car 6${ESPACE}min = 0,1${ESPACE}h, et ${m} = ${m / 6} × 6`;
  }
  // Une durée à un nombre entier de minutes qui s’écrit bien en heure décimale (multiple de 6 min ou de 15 min)
  const tombeJusteEnHeures = minutes => minutes % 6 === 0 || minutes % 15 === 0;

  // [la fraction d’heure, en minutes]
  const FRACTIONS_D_HEURE = [[1, 2, 30], [1, 4, 15], [3, 4, 45], [1, 3, 20], [2, 3, 40], [1, 5, 12], [1, 6, 10], [1, 10, 6],
    [3, 10, 18], [2, 5, 24]];

  ajouterEtape({
    id: '5e-mesures-durees',
    banque: ['decimalVersHMin', 'decimalVersHMin', 'hMinVersDecimal', 'enMinutes', 'enMinutes', 'minutesEnHeures', 'addition',
      'soustraction', 'horaire', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'decimalVersHMin') {
        const [f, m] = parmi(PARTIES_D_HEURE);
        const q = entier(0, 4);
        const x = net(q + f);
        const D = 60 * q + m;
        // Les erreurs classiques : lire les chiffres après la virgule comme des minutes (1,5 h → 1 h 50 min ;
        // 1,2 h → 1 h 20 min ou 1 h 2 min), une heure de trop ou de moins, une erreur dans la table de 6
        const cent = Math.round(f * 100);
        const unChiffre = Number.isInteger(Math.round(f * 100) / 10) ? 60 * q + cent / 10 : null;
        const table = unChiffre !== null ? [D + 6, D - 6] : [D + 15, D - 15];
        const pieges = meilleursPieges(D, [60 * q + cent, unChiffre, D + 60, D - 60, ...table]).map(duree);
        return choix({
          consigne: 'Convertis en heures et minutes',
          enonce: `${mesure(x, 'h')} = ___`,
          reponse: duree(D),
          garder: [duree(60 * q + cent)],
          pieges,
          explication: `${enMinutesTexte(f, m)}.<br>`
            + (q ? `${mesure(x, 'h')} = ${q}${ESPACE}h + ${mesure(f, 'h')} = <b>${duree(D)}</b>.<br>` : `Donc <b>${mesure(x, 'h')} = ${duree(D)}</b>.<br>`)
            + `⚠️ On compte par 60, pas par 100 : ${mesure(f, 'h')}, ce n’est pas ${mesure(cent, 'min')}.`,
        });
      }
      if (sorte === 'hMinVersDecimal') {
        const [f, m] = parmi(PARTIES_D_HEURE);
        const q = entier(0, 3);
        const x = net(q + f);
        return nombre({
          consigne: 'Écris en heures',
          enonce: `${duree(60 * q + m)} = ___${ESPACE}h`,
          reponse: x,
          explication: `${mesure(m, 'min')} = ${frac(m, 60)}${ESPACE}h = ${mesure(f, 'h')} (${pourquoiDecimal(m)}).<br>`
            + (q ? `${duree(60 * q + m)} = <b>${mesure(x, 'h')}</b>.<br>` : '')
            + `⚠️ Ce n’est pas ${mesure(net(q + m / 100), 'h')} : on compte par 60, pas par 100 !`,
        });
      }
      if (sorte === 'enMinutes') {
        if (auHasard(0.65)) {
          const [f, m] = parmi(PARTIES_D_HEURE);
          const q = entier(0, 3);
          const x = net(q + f);
          const D = 60 * q + m;
          return nombre({
            consigne: 'Convertis en minutes',
            enonce: `${mesure(x, 'h')} = ___${ESPACE}min`,
            reponse: D,
            explication: `1${ESPACE}h = 60${ESPACE}min, donc ${mesure(x, 'h')} = ${ecrire(x)} × 60 = <b>${mesure(D, 'min')}</b>.`
              + (q ? `<br>(${q} × 60 = ${60 * q} et ${ecrire(f)} × 60 = ${m} : ${60 * q} + ${m} = ${D}.)` : ''),
          });
        }
        const [n, d, m] = parmi(FRACTIONS_D_HEURE);
        return nombre({
          consigne: 'Convertis en minutes',
          enonce: `${frac(n, d)}${ESPACE}h = ___${ESPACE}min`,
          reponse: m,
          explication: `1${ESPACE}h = 60${ESPACE}min. ${frac(n, d)} de 60${ESPACE}min, c’est `
            + (n === 1 ? `60 ÷ ${d} = <b>${mesure(m, 'min')}</b>.` : `60 ÷ ${d} × ${n} = ${60 / d} × ${n} = <b>${mesure(m, 'min')}</b>.`),
        });
      }
      if (sorte === 'minutesEnHeures') {
        const [f, m] = parmi(PARTIES_D_HEURE);
        const q = entier(1, 4);
        const n = 60 * q + m;
        const x = net(q + f);
        return sansIndiceDeForme(() => choix({
          consigne: 'Écris en heures',
          enonce: `${mesure(n, 'min')} = ___${ESPACE}h`,
          reponse: x,
          // ÷ 100 au lieu de ÷ 60, « 2 h 15 min » lu 2,15 h, un quart d’heure, une demi-heure ou une heure de trop ou de moins
          garder: meilleursPieges(x, [net(q + m / 100)]),
          pieges: meilleursPieges(x, [net(n / 100), net(x + 0.25), net(x + 0.5), net(x - 0.5), net(x + 1), net(x - 1)]),
          explication: `${mesure(n, 'min')} = ${q} × 60 + ${m} = ${duree(n)}.<br>Et ${mesure(m, 'min')} = ${mesure(f, 'h')} `
            + `(${pourquoiDecimal(m)}), donc ${mesure(n, 'min')} = <b>${mesure(x, 'h')}</b>.<br>`
            + `⚠️ ${duree(n)}, ce n’est pas ${mesure(net(q + m / 100), 'h')} !`,
        }));
      }
      if (sorte === 'addition') {
        const enSecondes = auHasard(0.3);
        const ecrireDuree = enSecondes ? dureeS : duree;
        const [grande, petite] = enSecondes ? ['min', 's'] : ['h', 'min'];
        let D1;
        let D2;
        do {
          D1 = 60 * entier(1, 3) + 5 * entier(1, 11);
          D2 = 60 * entier(enSecondes ? 1 : 0, 3) + 5 * entier(1, 11);
        } while ((D1 % 60) + (D2 % 60) < 60 && auHasard(0.8)); // le plus souvent, les minutes dépassent 60
        const D = D1 + D2;
        const [h1, m1, h2, m2] = [Math.floor(D1 / 60), D1 % 60, Math.floor(D2 / 60), D2 % 60];
        const retenue = m1 + m2 >= 60;
        return choix({
          consigne: 'Additionne les durées',
          enonce: `${ecrireDuree(D1)} + ${ecrireDuree(D2)} = ___`,
          reponse: ecrireDuree(D),
          // l’oubli de la retenue, une heure de trop, une erreur de 10
          garder: retenue ? [ecrireDuree(D - 60)] : [],
          pieges: meilleursPieges(D, [retenue ? D - 60 : null, D + 60, D - 10, D + 10]).map(ecrireDuree),
          explication: `On additionne les ${grande} (${h1} + ${h2} = ${h1 + h2}), puis les ${petite} (${m1} + ${m2} = ${m1 + m2}).`
            + (retenue ? `<br>${m1 + m2}${ESPACE}${petite} = ${ecrireDuree(m1 + m2)} : ça fait 1${ESPACE}${grande} de plus !` : '')
            + `<br>${ecrireDuree(D1)} + ${ecrireDuree(D2)} = <b>${ecrireDuree(D)}</b>.`,
        });
      }
      if (sorte === 'soustraction') {
        const enSecondes = auHasard(0.25);
        const ecrireDuree = enSecondes ? dureeS : duree;
        const [grande, petite] = enSecondes ? ['min', 's'] : ['h', 'min'];
        let D1;
        let D2;
        do {
          D1 = 60 * entier(2, 5) + 5 * entier(0, 11);
          D2 = 60 * entier(enSecondes ? 1 : 0, 2) + 5 * entier(1, 11);
        } while (D2 >= D1 || ((D1 % 60) >= (D2 % 60) && auHasard(0.8))); // le plus souvent, il faut « casser » une heure
        const D = D1 - D2;
        const [h1, m1, h2, m2] = [Math.floor(D1 / 60), D1 % 60, Math.floor(D2 / 60), D2 % 60];
        const emprunt = m1 < m2;
        // Les erreurs classiques : soustraire les minutes « dans l’autre sens », casser l’heure en 100 minutes
        const naif = 60 * (h1 - h2) + Math.abs(m1 - m2);
        const [prenom] = parmi(PRENOMS);
        const phrase = enSecondes || auHasard(0.6)
          ? `${ecrireDuree(D1)} ${MOINS} ${ecrireDuree(D2)} = ___`
          : (D1 >= 90 && D1 <= 175 && auHasard()
            ? `Le film dure ${duree(D1)}. ${prenom} en a déjà vu ${duree(D2)}. Il reste ___.`
            : `La randonnée dure ${duree(D1)}. Roxy a déjà marché ${duree(D2)}. Il lui reste ___.`);
        return choix({
          consigne: 'Soustrais les durées',
          enonce: phrase,
          reponse: ecrireDuree(D),
          // l’erreur classique (toujours proposée quand il faut casser une heure) : soustraire les minutes « dans l’autre sens »
          garder: emprunt ? meilleursPieges(D, [naif]).map(ecrireDuree) : [],
          pieges: meilleursPieges(D, [emprunt ? naif : null, emprunt ? D + 40 : null, D + 60, D - 60, D + 10, D - 10]).map(ecrireDuree),
          explication: (emprunt
            ? `On ne peut pas enlever ${m2}${ESPACE}${petite} à ${m1}${ESPACE}${petite} : on casse 1${ESPACE}${grande} en 60${ESPACE}${petite}. `
              + `${ecrireDuree(D1)} = ${h1 - 1}${ESPACE}${grande}${ESPACE}${m1 + 60}${ESPACE}${petite}.<br>`
              + `${h1 - 1} ${MOINS} ${h2} = ${h1 - 1 - h2} et ${m1 + 60} ${MOINS} ${m2} = ${m1 + 60 - m2}.`
            : `${h1} ${MOINS} ${h2} = ${h1 - h2} et ${m1} ${MOINS} ${m2} = ${m1 - m2}.`)
            + `<br>${ecrireDuree(D1)} ${MOINS} ${ecrireDuree(D2)} = <b>${ecrireDuree(D)}</b>.`,
        });
      }
      if (sorte === 'horaire') {
        const [f, m] = parmi(PARTIES_D_HEURE);
        const q = entier(1, 3);
        const x = net(q + f);
        const D = 60 * q + m;
        const [prenom, pronom] = parmi(PRENOMS);
        // (la sortie en va’a part entre 6 h et 13 h : on ne rentre pas de nuit en pirogue)
        const enVaa = auHasard(0.25);
        let t1;
        do { t1 = 60 * (enVaa ? entier(6, 12) : entier(7, 17)) + 5 * entier(1, 11); } while ((t1 % 60) + m < 60 && auHasard(0.7));
        const t2 = t1 + D;
        const phrase = enVaa
          ? `${prenom} part en va’a à ${horaire(t1)}. La sortie dure ${mesure(x, 'h')}. ${majuscule(pronom)} revient à ___.`
          : parmi([
            `Le car part de Nouméa à ${horaire(t1)} et roule pendant ${mesure(x, 'h')}. Il arrive à ___.`,
            `Roxy part en randonnée à ${horaire(t1)}. Elle marche ${mesure(x, 'h')}. Elle arrive à ___.`,
            `${prenom} part faire une balade à vélo à ${horaire(t1)}. La balade dure ${mesure(x, 'h')}. ${majuscule(pronom)} rentre à ___.`,
          ]);
        const etapes = [q ? `+ ${q}${ESPACE}h → ${horaire(t1 + 60 * q)}` : '', `+ ${mesure(m, 'min')} → <b>${horaire(t2)}</b>`].filter(Boolean);
        return choix({
          consigne: 'Trouve l’horaire',
          enonce: phrase,
          reponse: horaire(t2),
          // la durée lue « q h (100 × f) min » (toujours proposée), l’heure de plus oubliée, une heure de trop, 10 min d’écart
          garder: meilleursPieges(t2, [t1 + 60 * q + Math.round(f * 100)]).map(horaire),
          pieges: meilleursPieges(t2, [t1 + 60 * q + Math.round(f * 100), (t1 % 60) + m >= 60 ? t2 - 60 : null, t2 + 60, t2 + 10, t2 - 10])
            .map(horaire),
          explication: `D’abord la durée : ${enMinutesTexte(f, m)}, donc ${mesure(x, 'h')} = ${duree(D)}.<br>`
            + `On part de ${horaire(t1)} : ${etapes.join(' ; ')}.`,
        });
      }
      if (sorte === 'probleme') {
        const [prenom, pronom] = parmi(PRENOMS);
        let n;
        let d;
        let T;
        const lecture = auHasard();
        do {
          n = lecture ? entier(3, 10) : entier(2, 5);
          d = lecture ? parmi([15, 20, 25, 30, 45]) : parmi([45, 50, 75, 80, 90, 105]);
          T = n * d;
        } while (!tombeJusteEnHeures(T));
        const enHeures = auHasard(0.6);
        const enonce = lecture
          ? `${prenom} lit ${mesure(d, 'min')} par jour pendant ${n}${ESPACE}jours. Combien de temps a-t-${pronom} lu en tout, `
          : `${prenom} fait ${n} séances ${auHasard() ? `de natation de ${duree(d)} cette semaine. Combien de temps nage-t-${pronom}`
            : `de va’a de ${duree(d)} cette semaine. Combien de temps pagaie-t-${pronom}`} en tout, `;
        return nombre({
          consigne: 'Résous le problème',
          enonce: enonce + (enHeures ? 'en heures ?' : 'en minutes ?'),
          reponse: enHeures ? net(T / 60) : T,
          unite: enHeures ? 'h' : 'min',
          explication: (d >= 60 ? `${duree(d)} = ${mesure(d, 'min')}.<br>` : '')
            + (enHeures
              ? `${n} × ${d} = ${mesure(T, 'min')} = ${duree(T)}.<br>En heures : ${ecrire(T)} ÷ 60 = <b>${mesure(net(T / 60), 'h')}</b>.`
              : `${n} × ${d} = <b>${mesure(T, 'min')}</b> (soit ${duree(T)}).`),
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['decimal', 'decimal', 'hmin', 'somme']);
      if (famille === 'somme') {
        let D1;
        let D2;
        do {
          D1 = 60 * entier(1, 2) + 5 * entier(3, 11);
          D2 = 5 * entier(3, 11);
        } while ((D1 % 60) + D2 < 60);
        const D = D1 + D2;
        return vraiFaux({
          enonce: `${duree(D1)} + ${duree(D2)} = ${duree(vrai ? D : parmi([D - 60, D + 60, D + 10, D - 10]))}`,
          vrai,
          explication: `${D1 % 60} + ${D2} = ${(D1 % 60) + D2}${ESPACE}min = ${duree((D1 % 60) + D2)} : ça fait une heure de plus !<br>`
            + `${duree(D1)} + ${duree(D2)} = <b>${duree(D)}</b>.`,
        });
      }
      const [f, m] = parmi(PARTIES_D_HEURE);
      const q = entier(0, 3);
      const x = net(q + f);
      const D = 60 * q + m;
      if (famille === 'hmin') {
        return vraiFaux({
          enonce: `${duree(D)} = ${mesure(vrai ? x : net(q + m / 100), 'h')}`,
          vrai,
          explication: `${mesure(m, 'min')} = <b>${mesure(f, 'h')}</b> (${pourquoiDecimal(m)})`
            + (q ? `, donc ${duree(D)} = <b>${mesure(x, 'h')}</b>.` : '.') + '<br>⚠️ On compte par 60, pas par 100 !',
        });
      }
      return vraiFaux({
        enonce: `${mesure(x, 'h')} = ${duree(vrai ? D : 60 * q + Math.round(f * 100))}`,
        vrai,
        explication: (q ? `${enMinutesTexte(f, m)}, donc ${mesure(x, 'h')} = <b>${duree(D)}</b>.`
          : `${mesure(f, 'h')} = ${ecrire(f)} × 60${ESPACE}min = <b>${mesure(m, 'min')}</b>.`) + '<br>⚠️ On compte par 60, pas par 100 !',
      });
    },
    titreLecon: 'Calculer avec les durées',
    lecon: `
      <h4>Les heures décimales</h4>
      <p>1&nbsp;h = 60&nbsp;min. Pour passer des heures aux minutes, on <b>multiplie par 60</b> :
        <i>2,4&nbsp;h = 2&nbsp;h + 0,4 × 60&nbsp;min = 2&nbsp;h&nbsp;24&nbsp;min</i>.</p>
      <table>
        <tr><th>heures</th><td>0,1&nbsp;h</td><td>0,25&nbsp;h</td><td>0,5&nbsp;h</td><td>0,75&nbsp;h</td><td>1,2&nbsp;h</td><td>1,5&nbsp;h</td></tr>
        <tr><th>minutes</th><td>6&nbsp;min</td><td>15&nbsp;min</td><td>30&nbsp;min</td><td>45&nbsp;min</td><td>1&nbsp;h&nbsp;12&nbsp;min</td><td>1&nbsp;h&nbsp;30&nbsp;min</td></tr>
      </table>
      <p>À l’envers, on divise par 60 : <i>1&nbsp;h&nbsp;12&nbsp;min = 1&nbsp;h + ${frac(12, 60)}&nbsp;h = 1,2&nbsp;h</i> (6&nbsp;min = 0,1&nbsp;h) ·
        <i>195&nbsp;min = 3&nbsp;h&nbsp;15&nbsp;min = 3,25&nbsp;h</i> · <i>¾&nbsp;h = 60 ÷ 4 × 3 = 45&nbsp;min</i></p>
      <p>⚠️ On compte par <b>60</b>, pas par 100 : <i>1,5&nbsp;h = 1&nbsp;h&nbsp;30&nbsp;min</i>, et pas 1&nbsp;h&nbsp;50&nbsp;min !</p>
      <h4>Additionner et soustraire des durées</h4>
      <p>1&nbsp;h = 60&nbsp;min et 1&nbsp;min = 60&nbsp;s : les secondes se calculent comme les minutes.</p>
      <p>On calcule les heures avec les heures, les minutes avec les minutes. 60&nbsp;min ou plus ? Ça fait une heure de plus :
        <i>2&nbsp;h&nbsp;45&nbsp;min + 1&nbsp;h&nbsp;30&nbsp;min = 3&nbsp;h&nbsp;75&nbsp;min = 4&nbsp;h&nbsp;15&nbsp;min</i>.</p>
      <p>Pas assez de minutes pour soustraire ? On casse une heure en 60&nbsp;min :
        <i>3&nbsp;h&nbsp;20&nbsp;min − 1&nbsp;h&nbsp;45&nbsp;min = 2&nbsp;h&nbsp;80&nbsp;min − 1&nbsp;h&nbsp;45&nbsp;min = 1&nbsp;h&nbsp;35&nbsp;min</i>.</p>
      <p><b>Un horaire :</b> départ à 9&nbsp;h&nbsp;40, trajet de 2,5&nbsp;h = 2&nbsp;h&nbsp;30&nbsp;min. 9&nbsp;h&nbsp;40 + 2&nbsp;h → 11&nbsp;h&nbsp;40 ;
        + 30&nbsp;min → <b>12&nbsp;h&nbsp;10</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> 0,1&nbsp;h = 6&nbsp;min. Donc 0,3&nbsp;h = 3 × 6 = 18&nbsp;min,
        et 0,7&nbsp;h = 7 × 6 = 42&nbsp;min !</div>
    `,
  });
})();
