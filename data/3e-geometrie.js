// Renard Malin — Maths, niveau 3e : les 6 étapes de la Clairière de la Géométrie
//
// Les questions sont fabriquées au hasard : on tire les longueurs, les angles, les triangles et les points, le code calcule
// la bonne réponse et dessine la figure (en SVG), avec ses vraies proportions. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, ecrire, mesure, net, arrondir, frac, simplifier, angle, angleTexte, decimalesDe,
    choix, nombre, fraction, vraiFaux, ajouterEtape, figures,
  } = RM.maths;
  const F = figures; // les dessins : F.segment, F.point, F.arc…

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  const RAD = Math.PI / 180;
  // Le point à la distance r du point S, dans la direction « degres » (comme en maths : 0° vers la droite,
  // 90° vers le haut ; sur l'écran, y va vers le bas, d'où le signe moins)
  const vers = (S, r, degres) => [S[0] + r * Math.cos(degres * RAD), S[1] - r * Math.sin(degres * RAD)];
  // La direction (en degrés, comme en maths) pour aller du point A vers le point B
  const direction = (A, B) => Math.atan2(A[1] - B[1], B[0] - A[0]) / RAD;
  const milieu = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const centreDe = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  const distance = (A, B) => Math.hypot(B[0] - A[0], B[1] - A[1]);
  // Le point de la droite (AB) « à t » : A pour t = 0, B pour t = 1 (t négatif : de l'autre côté de A)
  const entre = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  // Un point (une petite croix) et son nom, écrit à « loin » pixels dans la direction « degres »
  function nommer(P, nom, degres, loin = 20) {
    const [dx, dy] = vers([0, 0], loin, degres);
    return F.point(P, nom, { dx, dy });
  }
  // Le nom d'un sommet, écrit vers l'extérieur de la figure (à l'opposé de son centre G)
  const nommerSommet = (P, nom, G, loin = 20) => nommer(P, nom, direction(G, P), loin);
  // Des points proches les uns des autres ({ P, nom }) : chaque nom est écrit du côté libre de son point
  // (on essaie 8 places autour de la croix, et on garde celle qui est la plus loin des autres croix,
  // des noms déjà écrits et du trait à éviter : distanceAuTrait(L) donne la distance d'une place L à ce trait)
  function nommerPointsProches(points, distanceAuTrait = () => Infinity) {
    const places = [];
    return points.map(({ P, nom }) => {
      let meilleure = null;
      let meilleurScore = -Infinity;
      [45, 135, 315, 225, 0, 180, 90, 270].forEach(degres => {
        const L = vers(P, 17, degres);
        const score = Math.min(
          ...points.filter(q => q.P !== P).map(q => distance(L, q.P)),
          ...places.map(l => distance(L, l) - 3),
          distanceAuTrait(L) + 4,
        );
        if (score > meilleurScore + 0.5) {
          meilleurScore = score;
          meilleure = L;
        }
      });
      places.push(meilleure);
      return F.point(P, nom, { dx: meilleure[0] - P[0], dy: meilleure[1] - P[1] });
    }).join('');
  }

  // Des noms de triangles sans lettres qui se lisent comme un mot (on évite E, L, I, O, U…)
  const TRIANGLES = ['ABC', 'MNP', 'RST', 'FGH', 'KMN', 'PRS', 'BCD', 'GHK', 'NPR', 'CDF'];
  const PRENOMS = ['Léa', 'Tom', 'Zoé', 'Hugo', 'Inès', 'Sami', 'Lina', 'Noé'];
  // Un segment du triangle « nom », ses deux lettres dans l'ordre du nom : dans le triangle RST, on écrit RT (et pas TR)
  const seg = (nom, X, Y) => (nom.indexOf(X) < nom.indexOf(Y) ? X + Y : Y + X);
  // Un triangle rectangle au hasard : son nom, le sommet R de l'angle droit, et les deux autres sommets P et Q
  function unTriangle(noms = TRIANGLES) {
    const nom = parmi(noms);
    const [R, P, Q] = RM.melanger(nom.split(''));
    return { nom, R, P, Q, RP: seg(nom, R, P), RQ: seg(nom, R, Q), PQ: seg(nom, P, Q) };
  }
  const cm = x => mesure(x, 'cm');
  // Un nombre entier ou un nombre avec un demi (2 ; 2,5 ; 3…), entre min et max
  function entierOuDemi(min, max) {
    const possibles = [];
    for (let x = Math.ceil(min * 2); x <= Math.floor(max * 2); x++) possibles.push(x / 2);
    return parmi(possibles);
  }
  // Une valeur utilisable comme bouton : positive, avec 2 chiffres après la virgule au plus
  const valable = v => Number.isFinite(v) && v > 0 && decimalesDe(net(v)) <= 2;
  // Ranger les boutons (ce que fait le moteur) seulement s'il y a au moins 2 pièges de chaque côté de la réponse x :
  // sinon, la réponse ne pourrait être qu'à certaines places, et on la devinerait. On mélange alors les boutons.
  const ordreEquilibre = (x, pieges) => (pieges.filter(v => v < x).length >= 2 && pieges.filter(v => v > x).length >= 2 ? undefined : 'melange');

  // Une question « vrai ou faux » prise dans une liste de [énoncé, vrai ?, explication]
  function vraiFauxDans(liste) {
    const [enonce, vrai, explication] = parmi(liste);
    return vraiFaux({ enonce, vrai, explication });
  }
  // Une question à boutons prise dans une liste de [énoncé, réponse, pièges, explication]
  function choixDans(consigne, liste) {
    const [enonce, reponse, pieges, explication] = parmi(liste);
    return choix({ consigne, enonce, reponse, pieges, explication });
  }

  // Les quotients de longueurs (« AB/BC », « SM/SB = SN/SC ») s'écrivent en vraies fractions, dans les textes et sur les boutons
  const enFractions = texte => texte.replace(/([A-Z]{2})\/([A-Z]{2})/g, (tout, n, d) => frac(n, d));
  function fractionsSurLesBoutons(q) {
    q.choix.filter(b => /[A-Z]{2}\/[A-Z]{2}/.test(b)).forEach(b => {
      q.etiquettes = q.etiquettes || {};
      q.etiquettes[b] = enFractions(b);
    });
    return q;
  }

  // Tourner des points autour de (0, 0) ; les agrandir pour remplir largeurMax × hauteurMax, et les centrer dans le dessin
  function tourner(points, degres) {
    const c = Math.cos(degres * RAD);
    const s = Math.sin(degres * RAD);
    return points.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  }
  function ajuster(points, largeurMax, hauteurMax, largeur, hauteur) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const k = Math.min(largeurMax / (Math.max(...xs) - Math.min(...xs) || 1), hauteurMax / (Math.max(...ys) - Math.min(...ys) || 1));
    const dx = largeur / 2 - k * (Math.min(...xs) + Math.max(...xs)) / 2;
    const dy = hauteur / 2 - k * (Math.min(...ys) + Math.max(...ys)) / 2;
    return points.map(([x, y]) => [x * k + dx, y * k + dy]);
  }
  // Écrire une longueur à côté du segment [AB], du côté opposé au point « dedans » (le centre de la figure)
  function longueurDehors(A, B, texte, dedans) {
    const m = milieu(A, B);
    const n = [A[1] - B[1], B[0] - A[0]]; // la direction où F.longueur écrit le texte quand cote = 1
    const cote = n[0] * (m[0] - dedans[0]) + n[1] * (m[1] - dedans[1]) > 0 ? 1 : -1;
    return F.longueur(A, B, texte, { cote, distance: 12 });
  }
  // Un quadrillage de colonnes × lignes carreaux, avec une marge autour pour écrire les noms.
  // X(c) et Y(l) donnent la position (en pixels) de la colonne c et de la ligne l.
  function grille(colonnes, lignes, cote = 26, marge = 40) {
    const X = c => marge + c * cote;
    const Y = l => marge + l * cote;
    let html = '';
    for (let c = 0; c <= colonnes; c++) html += F.segment([X(c), Y(0)], [X(c), Y(lignes)], 'fig-grille');
    for (let l = 0; l <= lignes; l++) html += F.segment([X(0), Y(l)], [X(colonnes), Y(l)], 'fig-grille');
    return { html, X, Y, largeur: colonnes * cote + 2 * marge, hauteur: lignes * cote + 2 * marge };
  }

  // Un triangle rectangle dessiné avec ses vraies proportions : l'angle droit en R, les côtés de l'angle droit
  // mesurent a (de R à P) et b (de R à Q), dans n'importe quelle unité.
  // noms = { R, P, Q } ; textes = { RP, RQ, PQ } : ce qu'on écrit à côté de chaque côté (rien si absent) ;
  // arc : le sommet (P ou Q) dont on marque l'angle, avec texteArc écrit dedans ; accent : les côtés tracés en orange
  function figureRectangle(a, b, noms, { textes = {}, arc = '', texteArc = '', accent = [] } = {}) {
    let pts = [[0, 0], [a, 0], [0, -b]];
    if (Math.random() < 0.5) pts = pts.map(([x, y]) => [-x, y]); // retourné, comme dans un miroir
    const [R, P, Q] = ajuster(tourner(pts, entier(0, 359)), 290, 165, 460, 260);
    const S = { R, P, Q };
    const G = centreDe([R, P, Q]);
    let dessin = F.polygone([R, P, Q]);
    accent.forEach(c => { dessin += F.segment(S[c[0]], S[c[1]], 'fig-accent'); });
    dessin += F.angleDroit(R, P, Q, 16);
    if (arc) {
      const [sommet, autre] = arc === 'P' ? [P, Q] : [Q, P];
      // Le texte s'éloigne du sommet quand l'angle est petit, pour tenir entre ses deux côtés
      const ouverture = Math.acos(((R[0] - sommet[0]) * (autre[0] - sommet[0]) + (R[1] - sommet[1]) * (autre[1] - sommet[1]))
        / (distance(sommet, R) * distance(sommet, autre))) / RAD;
      // (mais pas trop loin : il resterait près de l’autre bout du côté, et on croirait qu’il marque un autre angle)
      const loin = Math.min(Math.max(46, 26 / Math.tan(ouverture / 2 * RAD)), 0.6 * distance(sommet, R));
      dessin += F.arc(sommet, R, autre, { rayon: 30, texte: texteArc, distanceTexte: loin - 30 });
    }
    Object.entries(textes).forEach(([cote, texte]) => { if (texte) dessin += longueurDehors(S[cote[0]], S[cote[1]], texte, G); });
    dessin += nommerSommet(R, noms.R, G) + nommerSommet(P, noms.P, G) + nommerSommet(Q, noms.Q, G);
    return F.svg(460, 260, dessin, 'Un triangle rectangle');
  }

  // ======================================================================
  // 1. Le théorème de Thalès (triangles emboîtés ou papillon)
  // ======================================================================
  // Les noms des points « S, B, C, M, N » : le point commun S ; (MN) // (BC).
  // Emboîtés : M ∈ [SB] et N ∈ [SC]. Papillon : S ∈ [MB] et S ∈ [NC] (S est entre les deux triangles).
  // (des noms choisis pour qu'aucun segment ne se lise comme un mot)
  const CONFIGS_THALES = ['ABCMP', 'RSTMN', 'KFGMN', 'PRSMN', 'SBCMN', 'TFGKH'];
  // Le coefficient p/q du petit triangle SMN par rapport au triangle SBC
  const RAPPORTS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5]];
  const RAPPORTS_FIGURE = RAPPORTS.filter(([p, q]) => p / q >= 1 / 3); // (avec 1/4, le petit triangle serait trop serré sur la figure)

  // Une configuration de Thalès : les noms, et toutes les longueurs (en cm), qui tombent juste.
  // Le triangle SBC a trois côtés différents, multiples de q (pour que ceux du petit triangle soient entiers).
  function configThales(papillon = Math.random() < 0.5, rapports = RAPPORTS) {
    const [S, B, C, M, N] = parmi(CONFIGS_THALES).split('');
    const [p, q] = parmi(rapports);
    const multiples = [];
    for (let m = 2; q * m <= 30; m++) multiples.push(q * m);
    let sb;
    let sc;
    let bc;
    let bon = false;
    while (!bon) {
      [sb, sc, bc] = [parmi(multiples), parmi(multiples), parmi(multiples)];
      const [x, y, z] = [sb, sc, bc].sort((u, v) => u - v);
      // (et un angle en S ni trop fermé ni trop ouvert, pour que la figure soit lisible)
      const cosS = (sb ** 2 + sc ** 2 - bc ** 2) / (2 * sb * sc);
      bon = x < y && y < z && z < 0.85 * (x + y) && x >= 0.4 * z && cosS < Math.cos(35 * RAD) && cosS > Math.cos(110 * RAD);
    }
    const k = p / q;
    const petit = v => net(v * p / q);
    const L = {
      [S + M]: petit(sb), [S + B]: sb, [S + N]: petit(sc), [S + C]: sc, [M + N]: petit(bc), [B + C]: bc,
      // Le segment [MB] (et [NC]) : un morceau de [SB] (emboîtés), ou [SM] et [SB] mis bout à bout (papillon)
      [M + B]: papillon ? sb + petit(sb) : sb - petit(sb), [N + C]: papillon ? sc + petit(sc) : sc - petit(sc),
    };
    const angleS = Math.acos((sb ** 2 + sc ** 2 - bc ** 2) / (2 * sb * sc));
    return { S, B, C, M, N, p, q, k, sb, sc, bc, L, angleS, papillon, petit: S + M + N, grand: S + B + C };
  }
  const hypothesesThales = c => (c.papillon
    ? `${c.S} ∈ [${c.M}${c.B}], ${c.S} ∈ [${c.N}${c.C}] et (${c.M}${c.N}) // (${c.B}${c.C})`
    : `${c.M} ∈ [${c.S}${c.B}], ${c.N} ∈ [${c.S}${c.C}] et (${c.M}${c.N}) // (${c.B}${c.C})`);
  const egalitesThales = c => enFractions(`${c.S}${c.M}/${c.S}${c.B} = ${c.S}${c.N}/${c.S}${c.C} = ${c.M}${c.N}/${c.B}${c.C}`);

  // La direction (en degrés) perpendiculaire à la droite (AB), du côté opposé au point I
  function directionDehors(A, B, I) {
    const d = direction(A, B);
    const m = milieu(A, B);
    const essai = vers(m, 10, d + 90);
    return distance(essai, I) > distance(m, I) ? d + 90 : d - 90;
  }
  // Le dessin, avec les vraies longueurs : le triangle SBC (côtés sb et sc, angle angleS en S),
  // M sur la droite (SB) « à kM » et N sur la droite (SC) « à kN » (de l'autre côté de S pour le papillon).
  // Pour la réciproque, kM et kN peuvent être différents : (MN) n'est alors pas parallèle à (BC).
  function figureThales({ S, B, C, M, N }, { sb, sc, angleS, kM, kN, papillon }) {
    let pts = [[0, 0], [sb, 0], [sc * Math.cos(angleS), -sc * Math.sin(angleS)]];
    // On tourne la figure : le milieu de l'angle en S vers le bas (S en haut), vers la droite ou vers la gauche ;
    // le papillon est couché (un triangle à gauche, l'autre à droite)
    const cible = (papillon ? parmi([0, 180]) : parmi([90, 90, 90, 0, 180])) + entier(-15, 15);
    pts = tourner(pts, cible + angleS / 2 / RAD);
    if (Math.random() < 0.5) pts = pts.map(([x, y]) => [-x, y]);
    const s = papillon ? -1 : 1;
    const tous = [...pts, entre(pts[0], pts[1], s * kM), entre(pts[0], pts[2], s * kN)];
    const [pS, pB, pC, pM, pN] = ajuster(tous, papillon ? 360 : 300, papillon ? 185 : 200, 460, 260);
    const G = centreDe([pS, pB, pC]);
    let dessin = F.polygone([pS, pB, pC]);
    if (papillon) {
      const g = centreDe([pS, pM, pN]);
      // Le nom de S, entre les deux triangles (dans l'angle entre [SB) et [SN), où il n'y a pas de trait)
      const u = (A, P) => { const d = distance(A, P); return [(P[0] - A[0]) / d, (P[1] - A[1]) / d]; };
      const [ub, un] = [u(pS, pB), u(pS, pN)];
      dessin += F.polygone([pS, pM, pN]) + F.segment(pM, pN, 'fig-accent')
        + nommer(pS, S, direction([0, 0], [ub[0] + un[0], ub[1] + un[1]]), 20)
        + nommerSommet(pM, M, g) + nommerSommet(pN, N, g);
    } else {
      dessin += F.segment(pM, pN, 'fig-accent') + nommerSommet(pS, S, G)
        + nommer(pM, M, directionDehors(pS, pB, pC), 18) + nommer(pN, N, directionDehors(pS, pC, pB), 18);
    }
    dessin += nommerSommet(pB, B, G) + nommerSommet(pC, C, G);
    return F.svg(460, 260, dessin, papillon ? 'Deux triangles en papillon' : 'Deux triangles emboîtés');
  }
  const figureDe = c => figureThales(c, { ...c, kM: c.k, kN: c.k });

  // Quelle égalité est vraie ?
  function questionEgaliteThales() {
    const avecFigure = Math.random() < 0.35;
    const c = configThales(undefined, avecFigure ? RAPPORTS_FIGURE : RAPPORTS);
    const { S, B, C, M, N } = c;
    const reponse = parmi([`${S}${M}/${S}${B} = ${S}${N}/${S}${C}`, `${S}${M}/${S}${B} = ${M}${N}/${B}${C}`,
      `${S}${N}/${S}${C} = ${M}${N}/${B}${C}`]);
    // L'erreur classique : mélanger les deux droites (papillon), ou prendre le morceau [NC] (emboîtés)
    const classique = c.papillon ? `${S}${M}/${S}${C} = ${S}${N}/${S}${B}` : `${S}${M}/${S}${B} = ${S}${N}/${N}${C}`;
    const q = choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis la bonne égalité',
      enonce: avecFigure
        ? `Sur la figure, (${M}${N}) // (${B}${C}). Quelle égalité est vraie ?${figureDe(c)}`
        : `${hypothesesThales(c)}. Quelle égalité est vraie ?`,
      reponse,
      pieges: [`${S}${M}/${S}${B} = ${S}${C}/${S}${N}`, `${S}${B}/${S}${M} = ${S}${N}/${S}${C}`, `${M}${N}/${B}${C} = ${S}${B}/${S}${M}`,
        `${S}${M}/${M}${B} = ${S}${N}/${S}${C}`],
      garder: [classique],
      solution: `<b>${enFractions(reponse)}</b>`,
      explication: `D’après le théorème de Thalès : ${egalitesThales(c)}.<br>`
        + `En haut, les côtés du petit triangle ${c.petit} ; en bas, ceux du triangle ${c.grand} qui leur correspondent.<br>`
        + (c.papillon
          ? `⚠️ ${S}${M} et ${S}${B} sont sur la même droite : on ne les mélange pas avec ${S}${N} et ${S}${C}.`
          : `⚠️ [${N}${C}] n’est pas un côté du triangle ${c.grand} : on prend [${S}${C}] en entier.`),
    });
    return fractionsSurLesBoutons(q);
  }

  // Compléter l'égalité
  function questionCompleter() {
    const c = configThales();
    const { S, B, C, M, N } = c;
    const [expression, reponse, pieges] = parmi([
      [`${frac(S + M, S + B)} = ${frac(M + N, '___')}`, B + C, [S + C, N + C, S + B]],
      [`${frac(S + M, S + B)} = ${frac(S + N, '___')}`, S + C, [N + C, B + C, S + B]],
      [`${frac(S + N, S + C)} = ${frac('___', B + C)}`, M + N, [S + M, S + B, N + C]],
      [`${frac('___', S + B)} = ${frac(S + N, S + C)}`, S + M, [M + B, M + N, S + C]],
      [`${frac(S + N, S + C)} = ${frac(S + M, '___')}`, S + B, [M + B, S + C, B + C]],
    ]);
    return choix({
      consigne: 'Complète l’égalité de Thalès',
      enonce: `${hypothesesThales(c)}. ${expression}`,
      reponse,
      pieges,
      explication: `D’après le théorème de Thalès : ${egalitesThales(c)}. Il manque <b>${reponse}</b>.`,
    });
  }

  // Ce qu'il faut savoir pour utiliser le théorème
  function questionConditions() {
    const c = configThales();
    const { S, B, C, M, N } = c;
    const debut = c.papillon ? `${S} ∈ [${M}${B}] et ${S} ∈ [${N}${C}]` : `${M} ∈ [${S}${B}] et ${N} ∈ [${S}${C}]`;
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `${debut}. Pour utiliser le théorème de Thalès, il faut aussi savoir que…`,
      reponse: `(${M}${N}) // (${B}${C})`,
      pieges: [`(${M}${N}) ⊥ (${B}${C})`, `${S}${M} = ${S}${N}`,
        ...(c.papillon ? [`${S}${B} = ${S}${C}`, `(${M}${B}) ⊥ (${N}${C})`] : [`${S}${M} = ${M}${B}`, `(${S}${B}) ⊥ (${S}${C})`])],
      explication: `Le théorème de Thalès s’utilise quand les droites (${M}${N}) et (${B}${C}) sont <b>parallèles</b> : `
        + `alors ${egalitesThales(c)}.`,
    });
  }

  // L'égalité avec les nombres et le produit en croix, quand on connaît la paire « connue » et une longueur de la paire « cible »
  function calculThales(c, connue, cible, petiteInconnue) {
    const L = c.L;
    const [inconnue, donnee] = petiteInconnue ? [cible[0], cible[1]] : [cible[1], cible[0]];
    const ecritVal = s => (s === inconnue ? s : ecrire(L[s]));
    const calcul = petiteInconnue
      ? `${inconnue} = ${ecrire(L[donnee])} × ${ecrire(L[connue[0]])} ÷ ${ecrire(L[connue[1]])}`
      : `${inconnue} = ${ecrire(L[donnee])} × ${ecrire(L[connue[1]])} ÷ ${ecrire(L[connue[0]])}`;
    const [d1, d2, d3] = RM.melanger([connue[0], connue[1], donnee]).map(s => `${s} = ${cm(L[s])}`);
    return {
      inconnue,
      donnee,
      donnees: `${d1}, ${d2} et ${d3}`, // les trois longueurs données, dans le désordre
      x: L[inconnue],
      texte: `D’après le théorème de Thalès, ${frac(connue[0], connue[1])} = ${frac(cible[0], cible[1])}, `
        + `donc ${frac(ecrire(L[connue[0]]), ecrire(L[connue[1]]))} = ${frac(ecritVal(cible[0]), ecritVal(cible[1]))}.<br>`
        + `${calcul} = <b>${cm(L[inconnue])}</b>.`,
    };
  }
  const PAIRES = c => [[c.S + c.M, c.S + c.B], [c.S + c.N, c.S + c.C], [c.M + c.N, c.B + c.C]];

  // Calculer une longueur (réponse à taper)
  function questionCalculThales() {
    const avecFigure = Math.random() < 0.5;
    const c = configThales(undefined, avecFigure ? RAPPORTS_FIGURE : RAPPORTS);
    const [connue, cible] = RM.melanger(PAIRES(c)).slice(0, 2);
    const t = calculThales(c, connue, cible, Math.random() < 0.5);
    const figure = avecFigure ? figureDe(c) : '';
    return nombre({
      consigne: 'Calcule',
      enonce: `${hypothesesThales(c)}, avec ${t.donnees}. Calcule ${t.inconnue}.${figure}`,
      reponse: t.x,
      unite: 'cm',
      solution: `${t.inconnue} = <b>${cm(t.x)}</b>`,
      explication: t.texte,
    });
  }

  // Le piège du morceau : on donne [MB] au lieu de [SB] ou de [SM], ou on demande [NC]
  function questionCalculMorceau() {
    const avecFigure = Math.random() < 0.5;
    const c = configThales(undefined, avecFigure ? RAPPORTS_FIGURE : RAPPORTS);
    const { S, B, C, M, N, L } = c;
    const figure = avecFigure ? figureDe(c) : '';
    if (Math.random() < 0.5) {
      const cible = parmi(PAIRES(c).slice(1));
      const t = calculThales(c, [S + M, S + B], cible, Math.random() < 0.5);
      // Emboîtés : on donne SM et MB (SB = SM + MB). Papillon : on donne SB et MB (SM = MB − SB).
      const [d1, d2] = c.papillon ? [S + B, M + B] : [S + M, M + B];
      const debut = c.papillon
        ? `⚠️ ${S} est entre ${M} et ${B} : ${S}${M} = ${M}${B} − ${S}${B} = ${ecrire(L[M + B])} − ${ecrire(L[S + B])} = ${cm(L[S + M])}.<br>`
        : `⚠️ ${M} est entre ${S} et ${B} : ${S}${B} = ${S}${M} + ${M}${B} = ${ecrire(L[S + M])} + ${ecrire(L[M + B])} = ${cm(L[S + B])}.<br>`;
      return nombre({
        consigne: 'Calcule',
        enonce: `${hypothesesThales(c)}, avec ${d1} = ${cm(L[d1])}, ${d2} = ${cm(L[d2])} et ${t.donnee} = ${cm(L[t.donnee])}. `
          + `Calcule ${t.inconnue}.${figure}`,
        reponse: t.x,
        unite: 'cm',
        solution: `${t.inconnue} = <b>${cm(t.x)}</b>`,
        explication: debut + t.texte,
      });
    }
    // On cherche NC : d'abord SN avec Thalès, puis NC
    const sn = L[S + N];
    const nc = L[N + C];
    return nombre({
      consigne: 'Calcule',
      enonce: `${hypothesesThales(c)}, avec ${S}${M} = ${cm(L[S + M])}, ${S}${B} = ${cm(L[S + B])} et ${S}${C} = ${cm(L[S + C])}. `
        + `Calcule ${N}${C}.${figure}`,
      reponse: nc,
      unite: 'cm',
      solution: `${N}${C} = <b>${cm(nc)}</b>`,
      explication: `D’après Thalès, ${frac(S + N, S + C)} = ${frac(S + M, S + B)}, donc ${S}${N} = `
        + `${ecrire(L[S + C])} × ${ecrire(L[S + M])} ÷ ${ecrire(L[S + B])} = ${cm(sn)}.<br>`
        + (c.papillon
          ? `${S} est entre ${N} et ${C} : ${N}${C} = ${S}${N} + ${S}${C} = ${ecrire(sn)} + ${ecrire(L[S + C])} = <b>${cm(nc)}</b>.`
          : `${N} est entre ${S} et ${C} : ${N}${C} = ${S}${C} − ${S}${N} = ${ecrire(L[S + C])} − ${ecrire(sn)} = <b>${cm(nc)}</b>.`),
    });
  }

  // Calculer une longueur, avec des boutons : les erreurs classiques
  function questionCalculChoix() {
    let c;
    let t;
    let candidats;
    let inverse;
    do {
      c = configThales();
      const [connue, cible] = RM.melanger(PAIRES(c)).slice(0, 2);
      const petiteInconnue = Math.random() < 0.5;
      t = calculThales(c, connue, cible, petiteInconnue);
      const L = c.L;
      const [p, g, d] = [L[connue[0]], L[connue[1]], L[t.donnee]];
      // La fraction à l'envers ; « le grand côté a 6 cm de plus, donc l'autre aussi » ; le morceau [MB] ou [NC] au lieu du côté entier
      inverse = net(petiteInconnue ? d * g / p : d * p / g);
      const additif = net(petiteInconnue ? d - (g - p) : d + (g - p));
      const autreSens = net(petiteInconnue ? d + (g - p) : d - (g - p)); // (l'écart ajouté au lieu d'être enlevé, ou l'inverse)
      // Le morceau de la droite : [MB] ou [NC] à la place de [SB] ou [SC] (dans les données, ou comme résultat)
      const morceauDe = paire => (paire[0] === c.S + c.M ? c.M + c.B : (paire[0] === c.S + c.N ? c.N + c.C : ''));
      const morceau = morceauDe(connue);
      candidats = [inverse, additif, autreSens, net(p * g / d)];
      if (morceau) candidats.push(net(petiteInconnue ? d * p / L[morceau] : d * L[morceau] / p));
      if (morceauDe(cible)) candidats.push(L[morceauDe(cible)]);
      candidats = [...new Set(candidats)].filter(v => valable(v) && Math.abs(v - t.x) > 1e-9 && v <= 60);
    } while (candidats.length < 3);
    return choix({
      consigne: 'Choisis le bon résultat',
      enonce: `${hypothesesThales(c)}, avec ${t.donnees}. Combien mesure ${t.inconnue} ?`,
      reponse: cm(t.x),
      pieges: candidats.map(cm),
      ordre: ordreEquilibre(t.x, candidats),
      garder: valable(inverse) && Math.abs(inverse - t.x) > 1e-9 && inverse <= 60 ? [cm(inverse)] : [],
      explication: t.texte + (valable(inverse) && inverse <= 60
        ? `<br>⚠️ Pas ${cm(inverse)} : ce serait prendre la fraction à l’envers.` : ''),
    });
  }

  const VF_THALES = [
    [`Si R ∈ [MS], R ∈ [NT] et (MN) // (ST), alors ${frac('RM', 'RS')} = ${frac('RN', 'RT')}.`, true,
      `C’est le théorème de Thalès, dans la configuration « papillon » : ${frac('RM', 'RS')} = ${frac('RN', 'RT')} = ${frac('MN', 'ST')}.`],
    [`Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors ${frac('RM', 'RS')} = ${frac('MN', 'ST')}.`, true,
      `C’est le théorème de Thalès (triangles emboîtés) : ${frac('RM', 'RS')} = ${frac('RN', 'RT')} = ${frac('MN', 'ST')}.`],
    ['Si R ∈ [MS], R ∈ [NT] et (MN) // (ST), alors le triangle RMN est un agrandissement ou une réduction du triangle RST.', true,
      'Les longueurs de RMN sont proportionnelles à celles de RST : c’est un <b>agrandissement ou une réduction</b>, même en papillon.'],
    ['Dans la configuration « papillon », les deux triangles ont un sommet commun.', true,
      'Les droites (MS) et (NT) se coupent en R : R est un <b>sommet des deux triangles</b> RMN et RST.'],
    [`Si M ∈ [RS], N ∈ [RT], (MN) // (ST), RM = ${cm(3)} et RS = ${cm(6)}, alors MN = ST ÷ 2.`, true,
      `${frac('MN', 'ST')} = ${frac('RM', 'RS')} = ${frac(3, 6)} = ${frac(1, 2)} : <b>MN est la moitié de ST</b>.`],
    [`Si M ∈ [RS] et N ∈ [RT], alors on a toujours ${frac('RM', 'RS')} = ${frac('RN', 'RT')}.`, false,
      'Il faut aussi que <b>(MN) // (ST)</b> : sans droites parallèles, on ne peut pas utiliser le théorème de Thalès.'],
    [`Si R ∈ [MS], R ∈ [NT] et (MN) // (ST), alors ${frac('RM', 'RT')} = ${frac('RN', 'RS')}.`, false,
      `On a mélangé les deux droites. RM et RS sont sur la même droite (MS) : <b>${frac('RM', 'RS')} = ${frac('RN', 'RT')}</b>.`],
    [`Si R ∈ [MS], R ∈ [NT] et (MN) // (ST), alors ${frac('RM', 'MS')} = ${frac('RN', 'RT')}.`, false,
      `[MS] n’est pas un côté du triangle RST : il faut <b>${frac('RM', 'RS')} = ${frac('RN', 'RT')}</b>.`],
    [`Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors ${frac('RM', 'RS')} = ${frac('RN', 'NT')}.`, false,
      `On compare avec les côtés <b>entiers</b> du triangle RST : ${frac('RM', 'RS')} = ${frac('RN', 'RT')}. [NT] n’est pas un côté du triangle.`],
    ['Le théorème de Thalès ne s’utilise que si les triangles sont emboîtés.', false,
      'Il marche aussi dans la configuration <b>« papillon »</b>, quand le point commun est entre les deux triangles.'],
  ];

  ajouterEtape({
    id: '3e-geometrie-thales',
    banque: ['egalite', 'egalite', 'completer', 'completer', 'conditions', 'calcul', 'calcul', 'calcul', 'morceau',
      'calculChoix', 'calculChoix', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'egalite') return questionEgaliteThales();
      if (sorte === 'completer') return questionCompleter();
      if (sorte === 'conditions') return questionConditions();
      if (sorte === 'calcul') return questionCalculThales();
      if (sorte === 'morceau') return questionCalculMorceau();
      if (sorte === 'calculChoix') return questionCalculChoix();
      return vraiFauxDans(VF_THALES);
    },
    titreLecon: 'Le théorème de Thalès',
    lecon: `
      <h4>Les deux configurations</h4>
      ${F.svg(440, 190,
        F.polygone([[105, 22], [20, 165], [195, 165]]) + F.segment([67, 86], [146, 86], 'fig-accent')
        + nommer([105, 22], 'R', 90, 18) + nommer([20, 165], 'S', 225) + nommer([195, 165], 'T', 315)
        + nommer([67, 86], 'M', 155, 18) + nommer([146, 86], 'N', 25, 18)
        + F.polygone([[320, 95], [405, 35], [405, 160]]) + F.polygone([[320, 95], [277.5, 125], [277.5, 62.5]])
        + F.segment([277.5, 125], [277.5, 62.5], 'fig-accent')
        + nommer([320, 95], 'R', 90, 20) + nommer([405, 35], 'S', 35) + nommer([405, 160], 'T', 325)
        + nommer([277.5, 125], 'M', 215) + nommer([277.5, 62.5], 'N', 145)
        + F.texte([105, 184], 'emboîtés', { classe: 'fig-petit' }) + F.texte([340, 184], 'papillon', { classe: 'fig-petit' }),
        'Deux triangles emboîtés, et deux triangles en papillon')}
      <p><b>Emboîtés</b> : M ∈ [RS] et N ∈ [RT]. <b>Papillon</b> : R ∈ [MS] et R ∈ [NT] (R est entre les deux triangles).</p>
      <p>Dans les deux cas, si <b>(MN) // (ST)</b>, alors : <b>${frac('RM', 'RS')} = ${frac('RN', 'RT')} = ${frac('MN', 'ST')}</b>.</p>
      <p>En haut, les côtés du triangle RMN ; en bas, les côtés du triangle RST qui leur correspondent.
        Dans chaque fraction, deux longueurs <b>sur la même droite</b> (ou les deux côtés parallèles).</p>
      <p>👉 <i>RM = 3&nbsp;cm, RS = 9&nbsp;cm et RT = 12&nbsp;cm : ${frac(3, 9)} = ${frac('RN', 12)}, donc RN = 12 × 3 ÷ 9 = 4&nbsp;cm.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> écris l’égalité avec les nombres, puis fais un <b>produit en croix</b>.</div>
      <p>⚠️ Sans droites parallèles, pas de Thalès ! Et on prend les côtés <b>entiers</b> des triangles : RS, pas MS.
        Si on te donne MS, calcule d’abord RS (ou RM).</p>
    `,
  });

  // ======================================================================
  // 2. Parallèles ou pas ? La réciproque de Thalès
  // ======================================================================
  // Des quotients qui s'écrivent avec un nombre décimal simple ; les « proches » servent quand les droites ne sont pas parallèles
  const QUOTIENTS = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8];
  const QUOTIENTS_PROCHES = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
  // Deux longueurs [petite, grande] telles que petite ÷ grande = k : la grande entre 4 et 20 cm (mais pas « interdite »),
  // la petite entière ou avec un demi
  // (si on donne « autre », la grande longueur reste entre la moitié et le double de autre, pour une figure vraisemblable)
  function paireDeQuotient(k, autre = 0) {
    const possibles = [];
    for (let g = 4; g <= 20; g++) {
      const p = net(g * k);
      const proche = !autre || (g !== autre && g >= autre / 2 && g <= 2 * autre);
      if (proche && Number.isInteger(p * 2) && p >= 1) possibles.push([p, g]);
    }
    return possibles.length ? parmi(possibles) : null;
  }
  // Une figure de réciproque : les points S, B, C, M, N, et SM ÷ SB = k1, SN ÷ SC = k2 (égaux si les droites sont parallèles)
  // pourFigure : pas de quotient trop petit (M et N seraient collés à S sur le dessin)
  function configReciproque(paralleles = Math.random() < 0.5, pourFigure = false) {
    const [S, B, C, M, N] = parmi(CONFIGS_THALES).split('');
    const k1 = parmi(QUOTIENTS.filter(k => !pourFigure || k >= 0.3));
    const k2 = paralleles ? k1 : parmi(QUOTIENTS_PROCHES.filter(k => Math.abs(k - k1) > 0.04 && Math.abs(k - k1) < 0.11));
    let sm;
    let sb;
    let paire = null;
    while (!paire) {
      [sm, sb] = paireDeQuotient(k1);
      paire = paireDeQuotient(k2, sb); // (null si aucune longueur ne va avec sb : on recommence)
    }
    const [sn, sc] = paire;
    const papillon = Math.random() < 0.5;
    return {
      S, B, C, M, N, papillon, paralleles, k1, k2, sm, sb, sn, sc,
      mb: papillon ? net(sb + sm) : net(sb - sm), angleS: entier(40, 75) * RAD,
    };
  }
  const positionReciproque = c => (c.papillon
    ? `${c.S} ∈ [${c.M}${c.B}] et ${c.S} ∈ [${c.N}${c.C}]` : `${c.M} ∈ [${c.S}${c.B}] et ${c.N} ∈ [${c.S}${c.C}]`);
  const ordreReciproque = c => (c.papillon
    ? `${c.M}, ${c.S}, ${c.B} et ${c.N}, ${c.S}, ${c.C}` : `${c.S}, ${c.M}, ${c.B} et ${c.S}, ${c.N}, ${c.C}`);
  const figureReciproque = c => figureThales(c, { sb: c.sb, sc: c.sc, angleS: c.angleS, kM: c.k1, kN: c.k2, papillon: c.papillon });
  // Les deux quotients, calculés : SM/SB = 3/4 = 0,75
  // (sans les longueurs quand l’énoncé donne directement les quotients)
  const quotient1 = (c, longueurs = true) => `${frac(c.S + c.M, c.S + c.B)} = ${longueurs ? `${frac(ecrire(c.sm), ecrire(c.sb))} = ` : ''}${ecrire(c.k1)}`;
  const quotient2 = (c, longueurs = true) => `${frac(c.S + c.N, c.S + c.C)} = ${longueurs ? `${frac(ecrire(c.sn), ecrire(c.sc))} = ` : ''}${ecrire(c.k2)}`;
  function conclusionReciproque(c, longueurs = true) {
    const { B, C, M, N } = c;
    return c.paralleles
      ? `${quotient1(c, longueurs)} et ${quotient2(c, longueurs)} : les quotients sont <b>égaux</b>, et les points ${ordreReciproque(c)} sont alignés `
        + `dans le même ordre. D’après la réciproque du théorème de Thalès, <b>(${M}${N}) // (${B}${C})</b>.`
      : `${quotient1(c, longueurs)} et ${quotient2(c, longueurs)} : les quotients sont <b>différents</b>. `
        + `D’après la contraposée du théorème de Thalès, <b>(${M}${N}) et (${B}${C}) ne sont pas parallèles</b>.`;
  }

  // Les droites sont-elles parallèles ?
  function questionConclure() {
    // (quotients : on donne directement les deux quotients, déjà calculés)
    // (droites : on sait seulement que M ∈ (SB) et N ∈ (SC) ; si les quotients sont égaux, on ne connaît pas l'ordre des points)
    const variante = parmi(['longueurs', 'longueurs', 'figure', 'quotients', 'quotients', 'droites', 'droites']);
    const c = configReciproque(variante === 'droites' ? Math.random() < 0.7 : undefined, variante === 'figure');
    const { S, B, C, M, N } = c;
    const donnees = variante === 'quotients'
      ? `${frac(S + M, S + B)} = ${ecrire(c.k1)} et ${frac(S + N, S + C)} = ${ecrire(c.k2)}`
      : `${S}${M} = ${cm(c.sm)}, ${S}${B} = ${cm(c.sb)}, ${S}${N} = ${cm(c.sn)} et ${S}${C} = ${cm(c.sc)}`;
    const position = variante === 'droites' ? `${M} ∈ (${S}${B}), ${N} ∈ (${S}${C})` : positionReciproque(c).replace(' et ', ', ');
    if (variante === 'droites' && c.paralleles) {
      return choix({
        consigne: 'Choisis la bonne réponse', // (la même consigne que les autres : elle ne doit pas trahir la réponse)
        enonce: `${position}, ${donnees}. (${M}${N}) et (${B}${C}) sont-elles parallèles ?`,
        reponse: 'on ne sait pas',
        choix: ['oui', 'non', 'on ne sait pas'],
        explication: `${quotient1(c)} et ${quotient2(c)} : les quotients sont égaux. Mais ${M} et ${N} sont seulement sur les <b>droites</b> `
          + `(${S}${B}) et (${S}${C}) : on ne sait pas si ${S}, ${M}, ${B} et ${S}, ${N}, ${C} sont dans le même ordre. `
          + 'On ne peut pas utiliser la réciproque : <b>on ne sait pas</b>.',
      });
    }
    return choix({
      consigne: variante === 'figure' ? 'Regarde la figure' : 'Choisis la bonne réponse',
      enonce: `${position}, ${donnees}. `
        + `(${M}${N}) et (${B}${C}) sont-elles parallèles ?${variante === 'figure' ? figureReciproque(c) : ''}`,
      reponse: c.paralleles ? 'oui' : 'non',
      choix: ['oui', 'non', 'on ne sait pas'],
      // (avec des droites et des quotients différents, la contraposée marche quel que soit l'ordre des points)
      explication: conclusionReciproque(c, variante !== 'quotients')
        + (c.paralleles ? '' : (variante === 'figure' ? '<br>⚠️ On peut conclure : la figure peut tromper, pas le calcul !'
          : '<br>⚠️ On peut conclure (ce n’est pas « on ne sait pas ») : c’est la contraposée.')),
    });
  }

  // Calculer le quotient SM/SB (avec le piège du morceau [MB])
  function questionRapport() {
    const c = configReciproque();
    const { S, B, M } = c;
    const morceau = Math.random() < 0.5;
    let donnees = `${S}${M} = ${cm(c.sm)} et ${S}${B} = ${cm(c.sb)}`;
    let debut = '';
    if (morceau && c.papillon) {
      donnees = `${M}${B} = ${cm(c.mb)} et ${S}${B} = ${cm(c.sb)}`;
      debut = `⚠️ ${S} est entre ${M} et ${B} : ${S}${M} = ${ecrire(c.mb)} − ${ecrire(c.sb)} = ${cm(c.sm)}.<br>`;
    } else if (morceau) {
      donnees = `${S}${M} = ${cm(c.sm)} et ${M}${B} = ${cm(c.mb)}`;
      debut = `⚠️ ${M} est entre ${S} et ${B} : ${S}${B} = ${ecrire(c.sm)} + ${ecrire(c.mb)} = ${cm(c.sb)}.<br>`;
    }
    return nombre({
      consigne: 'Calcule le quotient',
      enonce: `${c.papillon ? `${S} ∈ [${M}${B}]` : `${M} ∈ [${S}${B}]`}, avec ${donnees}. Calcule ${frac(S + M, S + B)} (c’est un nombre décimal).`,
      reponse: c.k1,
      solution: `${frac(S + M, S + B)} = <b>${ecrire(c.k1)}</b>`,
      explication: `${debut}${quotient1(c).replace(` = ${ecrire(c.k1)}`, '')} = ${ecrire(c.sm)} ÷ ${ecrire(c.sb)} = <b>${ecrire(c.k1)}</b>.`,
    });
  }

  // Quels quotients faut-il comparer ?
  function questionQuotients() {
    const c = configReciproque();
    const { S, B, C, M, N } = c;
    const reponse = parmi([`${S}${M}/${S}${B} et ${S}${N}/${S}${C}`, `${S}${B}/${S}${M} et ${S}${C}/${S}${N}`]);
    const croises = `${S}${M}/${S}${C} et ${S}${N}/${S}${B}`;
    const avecMN = `${S}${M}/${S}${B} et ${M}${N}/${B}${C}`;
    const q = choix({
      consigne: 'Choisis les bons quotients',
      enonce: `${positionReciproque(c)}. Pour savoir si (${M}${N}) // (${B}${C}), on compare…`,
      reponse,
      pieges: [`${S}${M}/${S}${B} et ${S}${C}/${S}${N}`, avecMN, `${S}${M}/${M}${B} et ${S}${N}/${S}${C}`, croises],
      garder: [c.papillon ? croises : avecMN],
      solution: `<b>${enFractions(reponse)}</b>`,
      explication: `On compare deux quotients de longueurs prises sur les droites (${c.papillon ? M : S}${B}) et (${c.papillon ? N : S}${C}), `
        + `dans le même sens : ${enFractions(reponse)}.<br>`
        + (c.papillon ? `⚠️ Pas ${enFractions(croises)} : chaque quotient reste sur une seule droite.`
          : `⚠️ ${frac(M + N, B + C)} ne sert pas : on ne sait pas encore si les droites sont parallèles.`),
    });
    return fractionsSurLesBoutons(q);
  }

  // Quelle propriété utiliser ?
  const PROPRIETES = ['le théorème de Thalès', 'la réciproque de Thalès', 'la contraposée de Thalès',
    'le théorème de Pythagore', 'la réciproque de Pythagore'];
  function questionTheoreme() {
    const { S, B, C, M, N } = configThales();
    const [X, Y, Z] = parmi(TRIANGLES).split('');
    const [situation, reponse, jumelle] = parmi([
      [`On sait que (${M}${N}) // (${B}${C}), et on veut calculer ${M}${N}.`, PROPRIETES[0], PROPRIETES[1]],
      [`On a ${frac(S + M, S + B)} = ${frac(S + N, S + C)}, et on veut démontrer que (${M}${N}) // (${B}${C}).`, PROPRIETES[1], PROPRIETES[0]],
      [`On a ${frac(S + M, S + B)} ≠ ${frac(S + N, S + C)}, et on veut démontrer que (${M}${N}) et (${B}${C}) ne sont pas parallèles.`,
        PROPRIETES[2], PROPRIETES[1]],
      [`Le triangle ${X}${Y}${Z} est rectangle en ${X} ; on connaît ${X}${Y} et ${X}${Z}, et on veut calculer ${Y}${Z}.`, PROPRIETES[3], PROPRIETES[4]],
      [`On connaît les trois côtés du triangle ${X}${Y}${Z}, et on veut démontrer qu’il est rectangle.`, PROPRIETES[4], PROPRIETES[3]],
    ]);
    const EXPLICATIONS = {
      [PROPRIETES[0]]: 'Les droites sont parallèles, et on cherche une longueur : c’est le <b>théorème de Thalès</b>.',
      [PROPRIETES[1]]: 'On veut <b>prouver</b> que des droites sont parallèles, à partir de quotients égaux : c’est la <b>réciproque</b> du théorème de Thalès.',
      [PROPRIETES[2]]: 'Les quotients sont différents : la <b>contraposée</b> du théorème de Thalès dit que les droites ne sont pas parallèles.',
      [PROPRIETES[3]]: 'Le triangle est rectangle, et on cherche une longueur : c’est le <b>théorème de Pythagore</b>.',
      [PROPRIETES[4]]: 'On veut <b>prouver</b> qu’un triangle est rectangle : c’est la <b>réciproque</b> du théorème de Pythagore.',
    };
    return choix({
      consigne: 'Choisis la bonne propriété',
      enonce: `${situation} Quelle propriété utilise-t-on ?`,
      reponse,
      pieges: PROPRIETES,
      garder: [jumelle],
      explication: EXPLICATIONS[reponse],
    });
  }

  // Quelle longueur faut-il pour que les droites soient parallèles ?
  function questionLongueurParallele() {
    const c = configReciproque(true);
    const { S, B, C, M, N } = c;
    return nombre({
      consigne: 'Calcule',
      enonce: `${positionReciproque(c)}, avec ${S}${M} = ${cm(c.sm)}, ${S}${B} = ${cm(c.sb)} et ${S}${C} = ${cm(c.sc)}. `
        + `Combien doit mesurer ${S}${N} pour que (${M}${N}) // (${B}${C}) ?`,
      reponse: c.sn,
      unite: 'cm',
      solution: `${S}${N} = <b>${cm(c.sn)}</b>`,
      explication: `Il faut ${frac(S + N, S + C)} = ${quotient1(c)} (les points sont déjà dans le même ordre).<br>`
        + `Donc ${S}${N} = ${ecrire(c.sc)} × ${ecrire(c.k1)} = <b>${cm(c.sn)}</b>.`,
    });
  }

  // Dans quel ordre doivent être les points ?
  function questionOrdre() {
    const { S, B, C, M, N } = configThales();
    const papillon = Math.random() < 0.5;
    // Les trois alignements possibles, repérés par le point du milieu ; chacun écrit dans un sens ou dans l'autre
    const ecrit = (a, m, b) => (Math.random() < 0.5 ? `${a}, ${m}, ${b}` : `${b}, ${m}, ${a}`);
    const [avecS, avecN, avecC] = [ecrit(N, S, C), ecrit(S, N, C), ecrit(S, C, N)];
    const reponse = papillon ? avecS : avecN;
    return choix({
      consigne: 'Pour utiliser la réciproque de Thalès',
      enonce: `${papillon ? `${M}, ${S}, ${B}` : `${S}, ${M}, ${B}`} sont alignés dans cet ordre. `
        + `Pour montrer que (${M}${N}) // (${B}${C}), dans quel ordre doivent être alignés ${N}, ${S} et ${C} ?`,
      reponse,
      pieges: [avecS, avecN, avecC],
      explication: `${M} correspond à ${N}, et ${B} à ${C} : ${N}, ${S}, ${C} doivent être dans <b>le même ordre</b> que `
        + `${M}, ${S}, ${B}, ${papillon ? `avec ${S} au milieu` : `avec ${N} entre ${S} et ${C}`} : <b>${reponse}</b>.`,
    });
  }

  const VF_RECIPROQUE = [
    [`Si M ∈ [RS], N ∈ [RT] et ${frac('RM', 'RS')} = ${frac('RN', 'RT')}, alors (MN) // (ST).`, true,
      'C’est la <b>réciproque</b> du théorème de Thalès : les quotients sont égaux et les points sont dans le même ordre.'],
    [`Si R ∈ [MS], R ∈ [NT] et ${frac('RM', 'RS')} = ${frac('RN', 'RT')}, alors (MN) // (ST).`, true,
      'C’est la <b>réciproque</b> du théorème de Thalès, en papillon : M, R, S et N, R, T sont dans le même ordre.'],
    [`Si M ∈ [RS], N ∈ [RT] et ${frac('RM', 'RS')} ≠ ${frac('RN', 'RT')}, alors (MN) et (ST) ne sont pas parallèles.`, true,
      'C’est la <b>contraposée</b> du théorème de Thalès : si elles étaient parallèles, les quotients seraient égaux.'],
    ['Pour démontrer que deux droites sont parallèles, on peut utiliser la réciproque de Thalès.', true,
      'La réciproque de Thalès sert justement à <b>prouver un parallélisme</b>.'],
    [`Si M ∈ [RS], N ∈ [RT], RM = ${cm(3)}, RS = ${cm(5)}, RN = ${cm(6)} et RT = ${cm(10)}, alors (MN) // (ST).`, true,
      `${frac(3, 5)} = 0,6 et ${frac(6, 10)} = 0,6 : les quotients sont égaux, dans le même ordre. <b>(MN) // (ST)</b>.`],
    [`Si ${frac('RM', 'RS')} = ${frac('RN', 'RT')}, alors (MN) // (ST), quel que soit l’ordre des points.`, false,
      'Il faut aussi que R, M, S et R, N, T (ou M, R, S et N, R, T) soient alignés <b>dans le même ordre</b>.'],
    [`Si M ∈ [RS], N ∈ [RT] et ${frac('RM', 'RS')} ≠ ${frac('RN', 'RT')}, on ne peut rien dire des droites (MN) et (ST).`, false,
      'On peut conclure : d’après la <b>contraposée</b> du théorème de Thalès, elles ne sont <b>pas parallèles</b>.'],
    [`Pour savoir si (MN) // (ST), on compare ${frac('RM', 'RS')} et ${frac('MN', 'ST')}.`, false,
      `On compare ${frac('RM', 'RS')} et <b>${frac('RN', 'RT')}</b> : des longueurs prises sur les deux droites qui se coupent en R.`],
    ['La réciproque de Thalès sert à calculer une longueur.', false,
      'Elle sert à <b>prouver que deux droites sont parallèles</b>. Pour calculer une longueur, on utilise le théorème de Thalès.'],
    ['Si M ∈ [RS], N ∈ [RT] et RM = RN, alors (MN) // (ST).', false,
      `Il ne suffit pas que RM = RN : il faut que les <b>quotients</b> ${frac('RM', 'RS')} et ${frac('RN', 'RT')} soient égaux.`],
  ];

  ajouterEtape({
    id: '3e-geometrie-reciproque-thales',
    banque: ['conclure', 'conclure', 'conclure', 'rapport', 'rapport', 'quotients', 'quotients', 'quotients', 'theoreme', 'theoreme',
      'longueur', 'longueur', 'ordre', 'ordre', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'conclure') return questionConclure();
      if (sorte === 'rapport') return questionRapport();
      if (sorte === 'quotients') return questionQuotients();
      if (sorte === 'theoreme') return questionTheoreme();
      if (sorte === 'longueur') return questionLongueurParallele();
      if (sorte === 'ordre') return questionOrdre();
      return vraiFauxDans(VF_RECIPROQUE);
    },
    titreLecon: 'La réciproque de Thalès',
    lecon: `
      <h4>Prouver que deux droites sont parallèles</h4>
      <p>Les points R, M, S sont alignés, ainsi que R, N, T, <b>dans le même ordre</b>
        (M ∈ [RS] et N ∈ [RT] ; ou, en papillon, R ∈ [MS] et R ∈ [NT]).</p>
      <p><b>Réciproque du théorème de Thalès</b> : si ${frac('RM', 'RS')} = ${frac('RN', 'RT')}, alors <b>(MN) // (ST)</b>.</p>
      <p><b>Contraposée du théorème de Thalès</b> : si ${frac('RM', 'RS')} ≠ ${frac('RN', 'RT')}, alors (MN) et (ST) <b>ne sont pas parallèles</b>.</p>
      <p>👉 <i>RM = 3&nbsp;cm, RS = 5&nbsp;cm, RN = 4,5&nbsp;cm, RT = 7,5&nbsp;cm : ${frac(3, 5)} = 0,6 et ${frac('4,5', '7,5')} = 0,6.
        Les quotients sont égaux : (MN) // (ST).</i></p>
      <p>👉 <i>RM = 6&nbsp;cm, RS = 8&nbsp;cm, RN = 7&nbsp;cm, RT = 10&nbsp;cm : ${frac(6, 8)} = 0,75 et ${frac(7, 10)} = 0,7.
        Les quotients sont différents : (MN) et (ST) ne sont pas parallèles.</i></p>
      <p>On compare seulement des longueurs prises sur les deux droites qui se coupent en R : ${frac('MN', 'ST')} ne sert pas.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> calcule les deux quotients <b>séparément</b> (en nombres décimaux),
        puis compare-les. Si on te donne MS, calcule d’abord RS (ou RM).</div>
      <p>⚠️ On ne se fie pas à la figure : deux droites peuvent avoir l’air parallèles sans l’être !</p>
      <p>⚠️ Si on sait seulement que M ∈ (RS) et N ∈ (RT) (sur les <b>droites</b>), sans connaître l’ordre des points,
        des quotients égaux ne suffisent pas : on ne peut pas conclure. (Des quotients différents prouvent toujours que les droites ne sont pas parallèles.)</p>
    `,
  });

  // ======================================================================
  // 3. Cosinus, sinus, tangente
  // ======================================================================
  // Un triangle rectangle en R et l'un de ses angles aigus, au sommet S : son côté adjacent, son côté opposé, l'hypoténuse
  function angleAigu() {
    const t = unTriangle();
    const [S, autre] = RM.melanger([t.P, t.Q]);
    return {
      ...t, S, autre,
      nomAngle: parmi([t.R + S + autre, autre + S + t.R]),
      adj: seg(t.nom, S, t.R), hyp: t.PQ, opp: seg(t.nom, t.R, autre),
      arc: S === t.P ? 'P' : 'Q',
    };
  }
  // Le quotient de chaque rapport : cos = adjacent ÷ hypoténuse, sin = opposé ÷ hypoténuse, tan = opposé ÷ adjacent
  const quotientDe = (t, f) => ({ cos: `${t.adj}/${t.hyp}`, sin: `${t.opp}/${t.hyp}`, tan: `${t.opp}/${t.adj}` }[f]);
  const RAPPELS = {
    cos: 'cos = côté adjacent ÷ hypoténuse (CAH).',
    sin: 'sin = côté opposé ÷ hypoténuse (SOH).',
    tan: 'tan = côté opposé ÷ côté adjacent (TOA).',
  };
  const NOMS_RAPPORTS = { cos: 'le cosinus', sin: 'le sinus', tan: 'la tangente' };
  // La figure d'un triangle rectangle quand on connaît le côté adjacent et le côté opposé à l'angle en S
  // (figureRectangle veut les longueurs RP et RQ) ; textes et accent : pour 'adj', 'opp' et 'hyp'
  function figureAngle(t, adjacent, oppose, { texteArc = '', textes = {}, accent = [] } = {}) {
    const [RP, RQ] = t.S === t.P ? [adjacent, oppose] : [oppose, adjacent];
    const cotes = t.S === t.P ? { adj: 'RP', opp: 'RQ', hyp: 'PQ' } : { adj: 'RQ', opp: 'RP', hyp: 'PQ' };
    const ecrits = {};
    Object.entries(textes).forEach(([c, texte]) => { ecrits[cotes[c]] = texte; });
    return figureRectangle(RP, RQ, t, { arc: t.arc, texteArc, textes: ecrits, accent: accent.map(c => cotes[c]) });
  }
  // Le rôle des trois côtés, avec en gras celui qu'on cherche
  function expliquerCotes(t, cote) {
    const b = (c, texte) => (c === cote ? `<b>${texte}</b>` : texte);
    return `${b('hyp', `L’hypoténuse [${t.hyp}]`)} est en face de l’angle droit. Pour l’angle ${angle(t.nomAngle)}, `
      + `${b('opp', `le côté opposé [${t.opp}]`)} est en face de l’angle, et ${b('adj', `le côté adjacent [${t.adj}]`)} `
      + 'forme l’angle avec l’hypoténuse.';
  }

  // Hypoténuse, côté opposé, côté adjacent
  const NOMS_COTES = { opp: 'le côté opposé', adj: 'le côté adjacent', hyp: 'l’hypoténuse' };
  function questionCote() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    if (Math.random() < 0.3) {
      // Le côté tracé en orange
      const cote = parmi(['adj', 'opp', 'hyp']);
      return choix({
        consigne: 'Regarde la figure',
        enonce: `Pour l’angle ${ang}, marqué d’un arc, le côté tracé en orange est…${figureAngle(t, entier(4, 9), entier(4, 9), { accent: [cote] })}`,
        reponse: NOMS_COTES[cote],
        choix: Object.values(NOMS_COTES),
        explication: expliquerCotes(t, cote),
      });
    }
    const cote = parmi(['adj', 'adj', 'opp', 'opp', 'hyp']);
    const question = {
      adj: `Quel est le côté adjacent à l’angle ${ang} ?`, opp: `Quel est le côté opposé à l’angle ${ang} ?`, hyp: 'Quelle est l’hypoténuse ?',
    }[cote];
    const avecFigure = Math.random() < 0.4;
    return choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis le bon côté',
      enonce: avecFigure
        ? `L’angle ${ang} est marqué d’un arc. ${question}${figureAngle(t, entier(4, 9), entier(4, 9))}`
        : `Le triangle ${t.nom} est rectangle en ${t.R}. ${question}`,
      reponse: `[${t[cote]}]`,
      pieges: [`[${t.adj}]`, `[${t.opp}]`, `[${t.hyp}]`],
      explication: cote === 'hyp' && !avecFigure
        ? `L’hypoténuse est le côté <b>en face de l’angle droit</b> ${t.R} : c’est <b>[${t.hyp}]</b> (le plus long côté).`
        : expliquerCotes(t, cote),
    });
  }

  // Écrire le bon quotient
  function questionQuotientTrigo() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const f = parmi(['cos', 'sin', 'tan']);
    const avecFigure = Math.random() < 0.3;
    const reponse = quotientDe(t, f);
    // L'erreur classique : le cosinus et le sinus confondus, la tangente à l'envers
    const classique = { cos: quotientDe(t, 'sin'), sin: quotientDe(t, 'cos'), tan: `${t.adj}/${t.opp}` }[f];
    const q = choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis le bon quotient',
      enonce: avecFigure
        ? `L’angle marqué est ${ang}. ${f} ${ang} = ___${figureAngle(t, entier(4, 9), entier(4, 9))}`
        : `Le triangle ${t.nom} est rectangle en ${t.R}. ${f} ${ang} = ___`,
      reponse,
      pieges: [`${t.adj}/${t.hyp}`, `${t.opp}/${t.hyp}`, `${t.opp}/${t.adj}`, `${t.hyp}/${t.adj}`, `${t.hyp}/${t.opp}`, `${t.adj}/${t.opp}`],
      garder: [classique],
      solution: `${f} ${ang} = <b>${enFractions(reponse)}</b>`,
      explication: `${RAPPELS[f]}<br>Pour l’angle ${ang} : côté opposé [${t.opp}], côté adjacent [${t.adj}], hypoténuse [${t.hyp}].<br>`
        + `Donc ${f} ${ang} = <b>${enFractions(reponse)}</b>.`,
    });
    return fractionsSurLesBoutons(q);
  }

  // Ce quotient, c'est le cosinus, le sinus ou la tangente ?
  function questionQuelRapport() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const f = parmi(['cos', 'sin', 'tan']);
    const [n, d] = quotientDe(t, f).split('/');
    const role = s => ({ [t.adj]: 'le côté adjacent', [t.opp]: 'le côté opposé', [t.hyp]: 'l’hypoténuse' }[s]);
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}. ${frac(n, d)} est ___ de l’angle ${ang}.`,
      reponse: NOMS_RAPPORTS[f],
      choix: Object.values(NOMS_RAPPORTS),
      solution: `${frac(n, d)} est <b>${NOMS_RAPPORTS[f]}</b> de l’angle ${ang}.`,
      explication: `Pour l’angle ${ang}, [${n}] est ${role(n)} et [${d}] est ${role(d)}.<br>`
        + `${RAPPELS[f].replace(/^(\w+) =/, '<b>$1</b> =')} ⚠️ Pour l’autre angle aigu, ce serait un autre rapport !`,
    });
  }

  // SOH CAH TOA
  const SOH_CAH_TOA = [
    ['sin = ___ ÷ hypoténuse', 'côté opposé', 'SOH : <b>S</b>inus = <b>O</b>pposé ÷ <b>H</b>ypoténuse.'],
    ['cos = ___ ÷ hypoténuse', 'côté adjacent', 'CAH : <b>C</b>osinus = <b>A</b>djacent ÷ <b>H</b>ypoténuse.'],
    ['tan = ___ ÷ côté adjacent', 'côté opposé', 'TOA : <b>T</b>angente = <b>O</b>pposé ÷ <b>A</b>djacent.'],
    ['tan = côté opposé ÷ ___', 'côté adjacent', 'TOA : <b>T</b>angente = <b>O</b>pposé ÷ <b>A</b>djacent.'],
    ['cos = côté adjacent ÷ ___', 'hypoténuse', 'CAH : <b>C</b>osinus = <b>A</b>djacent ÷ <b>H</b>ypoténuse.'],
    ['sin = côté opposé ÷ ___', 'hypoténuse', 'SOH : <b>S</b>inus = <b>O</b>pposé ÷ <b>H</b>ypoténuse.'],
    ['Dans « SOH CAH TOA », que veut dire le O ?', 'côté opposé', 'O, c’est le côté <b>opposé</b> (en face de l’angle) : SOH et TOA.'],
    ['Dans « SOH CAH TOA », que veut dire le A ?', 'côté adjacent', 'A, c’est le côté <b>adjacent</b> (il forme l’angle) : CAH et TOA.'],
    ['Dans « SOH CAH TOA », que veut dire le H ?', 'hypoténuse', 'H, c’est l’<b>hypoténuse</b> (en face de l’angle droit) : SOH et CAH.'],
  ];
  function questionSohCahToa() {
    const [enonce, reponse, explication] = parmi(SOH_CAH_TOA);
    return choix({
      consigne: 'Pense à SOH CAH TOA',
      enonce,
      reponse,
      choix: ['côté opposé', 'côté adjacent', 'hypoténuse'],
      explication,
    });
  }

  // Calculer un cosinus, un sinus ou une tangente, quand on connaît les trois côtés
  const FAMILLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  // Une fraction qui s'écrit avec un nombre décimal : son dénominateur n'a que des 2 et des 5
  function tombeJuste(d) {
    let x = d;
    while (x % 2 === 0) x /= 2;
    while (x % 5 === 0) x /= 5;
    return x === 1;
  }
  function questionValeurTrigo() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const f = parmi(['cos', 'sin', 'tan']);
    const famille = parmi(FAMILLES);
    const k = { 5: parmi([1, 2, 3, 4]), 13: parmi([1, 2]), 17: 1, 25: 1 }[famille[2]];
    const [x, y] = RM.melanger(famille.slice(0, 2));
    const [a, o, h] = [x * k, y * k, famille[2] * k];
    const [n, d] = { cos: [a, h], sin: [o, h], tan: [o, a] }[f];
    const [ns, ds] = simplifier(n, d);
    const cotes = RM.melanger([`${t.adj} = ${cm(a)}`, `${t.opp} = ${cm(o)}`, `${t.hyp} = ${cm(h)}`]);
    const figure = Math.random() < 0.3 ? figureAngle(t, a, o, { textes: { adj: cm(a), opp: cm(o), hyp: cm(h) } }) : '';
    const debut = `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${cotes[0]}, ${cotes[1]} et ${cotes[2]}.`;
    const [nomN, nomD] = quotientDe(t, f).split('/');
    const inutile = { cos: t.opp, sin: t.adj, tan: t.hyp }[f];
    const calcul = `${f} ${ang} = ${frac(nomN, nomD)} = ${frac(n, d)}`;
    const attention = `<br>⚠️ [${inutile}] ne sert pas ici.`;
    if (tombeJuste(ds) && Math.random() < 0.6) {
      return nombre({
        consigne: 'Calcule',
        enonce: `${debut} Calcule ${f} ${ang} (c’est un nombre décimal).${figure}`,
        reponse: n / d,
        solution: `${f} ${ang} = <b>${ecrire(n / d)}</b>`,
        explication: `${RAPPELS[f]}<br>${calcul} = <b>${ecrire(n / d)}</b>.${attention}`,
      });
    }
    return fraction({
      consigne: 'Écris une fraction irréductible',
      enonce: `${debut} Calcule ${f} ${ang}.${figure}`,
      n: ns,
      d: ds,
      solution: `${f} ${ang} = <b>${frac(ns, ds)}</b>`,
      explication: `${RAPPELS[f]}<br>${calcul}${ns === n ? '' : ` = ${frac(ns, ds)}`}.${attention}`,
    });
  }

  // Entre 0 et 1, ou pas ?
  function questionPossibleTrigo() {
    const variante = parmi(['plusGrand', 'sinus', 'cosinus']);
    if (variante === 'plusGrand') {
      const a = parmi([20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 75, 80]);
      const reponse = a > 45 ? `tan ${a}°` : 'aucun';
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: 'Lequel de ces nombres est plus grand que 1 ?',
        reponse,
        pieges: [`sin ${a}°`, `cos ${a}°`, `tan ${a}°`, 'aucun'],
        explication: 'L’hypoténuse est le plus long côté : le sinus et le cosinus sont toujours <b>entre 0 et 1</b>. '
          + (a > 45 ? `La tangente (opposé ÷ adjacent) dépasse 1 quand l’angle dépasse 45° : <b>tan ${a}°</b> est plus grand que 1.`
            : `La tangente ne dépasse 1 que si l’angle dépasse 45° : ici, tan ${a}° est plus petit que 1. Réponse : <b>aucun</b>.`),
      });
    }
    const POSSIBLES = [0.2, 0.35, 0.45, 0.5, 0.6, 0.75, 0.8, 0.9];
    // (un ou deux pièges « tout près » : négatif, égal à 1 ou à peine plus grand ; les autres nettement plus grands que 1)
    const PRESQUE = [-0.5, -0.2, 1, 1.05, 1.1];
    const GRANDS = [1.2, 1.5, 1.8, 2];
    const nombrePres = parmi([1, 2]);
    const IMPOSSIBLES = [...RM.melanger(PRESQUE).slice(0, nombrePres), ...RM.melanger(GRANDS).slice(0, 3 - nombrePres)];
    const reponse = parmi(POSSIBLES);
    return choix({
      consigne: 'Choisis la bonne valeur',
      enonce: `Laquelle de ces valeurs peut être le ${variante} d’un angle aigu ?`,
      reponse,
      pieges: IMPOSSIBLES,
      ordre: 'melange',
      explication: `Le ${variante} d’un angle aigu est un quotient de deux longueurs, et l’hypoténuse est le plus long côté : `
        + 'il est toujours <b>entre 0 et 1</b>, sans jamais valoir 0 ni 1 (et jamais négatif). '
        + `Seul <b>${ecrire(reponse)}</b> convient.`,
    });
  }

  const VF_TRIGO = [
    [`Si ABC est rectangle en A, alors sin ${angle('ABC')} = ${frac('AC', 'BC')}.`, true,
      `[AC] est le côté opposé à ${angle('ABC')} et [BC] l’hypoténuse : <b>sin ${angle('ABC')} = ${frac('AC', 'BC')}</b>.`],
    [`Si ABC est rectangle en A, alors tan ${angle('ABC')} = ${frac('AC', 'AB')}.`, true,
      `tan = opposé ÷ adjacent : [AC] est opposé à ${angle('ABC')}, [AB] adjacent. <b>tan ${angle('ABC')} = ${frac('AC', 'AB')}</b>.`],
    [`Si ABC est rectangle en A, alors cos ${angle('ABC')} = sin ${angle('ACB')}.`, true,
      `Les deux valent ${frac('AB', 'BC')} : [AB] est adjacent à ${angle('ABC')}, mais <b>opposé</b> à ${angle('ACB')}.`],
    ['La tangente d’un angle aigu peut être plus grande que 1.', true,
      'tan = opposé ÷ adjacent, et le côté opposé peut être le plus long des deux : par exemple, <b>tan 60° ≈ 1,73</b>.'],
    ['Le sinus d’un angle aigu est toujours compris entre 0 et 1.', true,
      'Le côté opposé est plus court que l’hypoténuse : leur quotient est <b>entre 0 et 1</b>.'],
    [`Si ABC est rectangle en A, alors sin ${angle('ABC')} = ${frac('AB', 'BC')}.`, false,
      `[AB] forme l’angle ${angle('ABC')} : c’est le côté adjacent. ${frac('AB', 'BC')}, c’est <b>cos ${angle('ABC')}</b>.`],
    [`Si ABC est rectangle en A, alors tan ${angle('ABC')} = ${frac('AB', 'AC')}.`, false,
      `C’est l’inverse : tan = opposé ÷ adjacent, donc <b>tan ${angle('ABC')} = ${frac('AC', 'AB')}</b>.`],
    ['Le sinus d’un angle aigu peut être égal à 1,2.', false,
      'Le sinus est toujours <b>entre 0 et 1</b>, car l’hypoténuse est le plus long côté.'],
    ['Dans « TOA », le A veut dire « angle ».', false,
      'TOA : <b>T</b>angente = <b>O</b>pposé ÷ <b>A</b>djacent. Le A, c’est le côté <b>adjacent</b>.'],
    ['Pour un angle aigu d’un triangle rectangle, le côté opposé est l’hypoténuse.', false,
      'L’hypoténuse est en face de l’<b>angle droit</b>. Le côté opposé est en face de l’angle aigu.'],
  ];

  ajouterEtape({
    id: '3e-geometrie-trigonometrie',
    banque: ['cote', 'cote', 'quotient', 'quotient', 'quotient', 'quelRapport', 'quelRapport', 'soh', 'soh',
      'valeur', 'valeur', 'valeur', 'valeur', 'valeur', 'possible', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'cote') return questionCote();
      if (sorte === 'quotient') return questionQuotientTrigo();
      if (sorte === 'quelRapport') return questionQuelRapport();
      if (sorte === 'soh') return questionSohCahToa();
      if (sorte === 'valeur') return questionValeurTrigo();
      if (sorte === 'possible') return questionPossibleTrigo();
      return vraiFauxDans(VF_TRIGO);
    },
    titreLecon: 'Cosinus, sinus, tangente',
    lecon: `
      <h4>Les trois côtés, vus depuis l’angle B</h4>
      ${F.svg(440, 185,
        F.polygone([[150, 145], [390, 145], [150, 40]]) + F.segment([150, 145], [390, 145], 'fig-accent')
        + F.angleDroit([150, 145], [390, 145], [150, 40], 16) + F.arc([390, 145], [150, 145], [150, 40], { rayon: 44 })
        + nommer([150, 145], 'A', 225) + nommer([390, 145], 'B', 315) + nommer([150, 40], 'C', 135)
        + F.texte([270, 168], 'côté adjacent à l’angle B', { classe: 'fig-petit-gras fig-texte-accent' })
        + F.texte([140, 92], 'côté opposé', { classe: 'fig-petit-gras', ancre: 'end' })
        + F.texte([285, 76], 'hypoténuse', { classe: 'fig-petit-gras', ancre: 'start' }),
        'Le triangle ABC rectangle en A, l’angle en B marqué')}
      <p>Dans un triangle rectangle, pour un angle aigu : l’<b>hypoténuse</b> est en face de l’angle droit,
        le <b>côté opposé</b> est en face de l’angle, le <b>côté adjacent</b> forme l’angle avec l’hypoténuse.</p>
      <table>
        <tr><th>cosinus</th><td>cos ${angle('ABC')} = côté adjacent ÷ hypoténuse = ${frac('AB', 'BC')}</td></tr>
        <tr><th>sinus</th><td>sin ${angle('ABC')} = côté opposé ÷ hypoténuse = ${frac('AC', 'BC')}</td></tr>
        <tr><th>tangente</th><td>tan ${angle('ABC')} = côté opposé ÷ côté adjacent = ${frac('AC', 'AB')}</td></tr>
      </table>
      <p>👉 <i>AB = 4&nbsp;cm, AC = 3&nbsp;cm, BC = 5&nbsp;cm : cos ${angle('ABC')} = ${frac(4, 5)} = 0,8 ;
        sin ${angle('ABC')} = ${frac(3, 5)} = 0,6 ; tan ${angle('ABC')} = ${frac(3, 4)} = 0,75.</i></p>
      <p>Le cosinus et le sinus d’un angle aigu sont toujours <b>entre 0 et 1</b>, sans jamais valoir 0 ni 1 (l’hypoténuse est le plus long côté) ;
        la tangente peut être plus grande que 1.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> « <b>SOH CAH TOA</b> » : Sinus = Opposé ÷ Hypoténuse ;
        Cosinus = Adjacent ÷ Hypoténuse ; Tangente = Opposé ÷ Adjacent.</div>
      <p>⚠️ Le côté opposé et le côté adjacent dépendent de l’angle : pour l’angle en C, [AC] est adjacent et [AB] opposé.</p>
    `,
  });

  // ======================================================================
  // 4. Calculer avec la trigonométrie
  // ======================================================================
  // La valeur (arrondie au centième) que l'énoncé donne : sin 35° ≈ 0,57
  const valeurTrigo = (f, a) => arrondir(Math[f](a * RAD), 2);
  const ANGLES_CALCUL = [20, 25, 35, 40, 50, 55, 65, 70];
  // Les valeurs exactes à connaître
  const EXACTES = { sin: [30, 0.5], cos: [60, 0.5], tan: [45, 1] };
  // « On donne sin 35° ≈ 0,57. » ou « On rappelle que sin 30° = 0,5. »
  const onDonne = (f, a, v, exact) => (exact ? `On rappelle que ${f} ${a}° = ${ecrire(v)}.` : `On donne ${f} ${a}° ≈ ${ecrire(v)}.`);
  // Dans le triangle t, les deux côtés du rapport f : [numérateur, dénominateur] (adj, opp ou hyp)
  const COTES_RAPPORT = { cos: ['adj', 'hyp'], sin: ['opp', 'hyp'], tan: ['opp', 'adj'] };
  const NOMS_COURTS = { adj: 'le côté adjacent', opp: 'le côté opposé', hyp: 'l’hypoténuse' };
  // La figure avec les vraies proportions, quand on connaît un côté de longueur L et l'angle a
  function figureCalcul(t, connu, cherche, L, a) {
    const [adj, opp] = connu === 'hyp' ? [L * Math.cos(a * RAD), L * Math.sin(a * RAD)]
      : connu === 'adj' ? [L, L * Math.tan(a * RAD)] : [L / Math.tan(a * RAD), L];
    return figureAngle(t, adj, opp, { texteArc: `${a}°`, textes: { [connu]: cm(L), [cherche]: '?' } });
  }

  // Quel rapport utiliser ?
  function questionFormule() {
    const t = angleAigu();
    const [f, connu, cherche] = parmi([['cos', 'hyp', 'adj'], ['cos', 'adj', 'hyp'], ['sin', 'hyp', 'opp'], ['sin', 'opp', 'hyp'],
      ['tan', 'adj', 'opp'], ['tan', 'opp', 'adj']]);
    return choix({
      consigne: 'Choisis le bon rapport',
      enonce: `${t.nom} est rectangle en ${t.R}. On connaît ${angle(t.nomAngle)} et ${t[connu]} ; on cherche ${t[cherche]}. On utilise…`,
      reponse: NOMS_RAPPORTS[f],
      choix: Object.values(NOMS_RAPPORTS),
      explication: `Pour l’angle ${angle(t.nomAngle)}, [${t[connu]}] est ${NOMS_COURTS[connu]} et [${t[cherche]}] ${NOMS_COURTS[cherche]}. `
        + `Le rapport qui relie ces deux côtés : <b>${RAPPELS[f]}</b>`,
    });
  }

  // Quelle égalité permet de calculer la longueur ?
  function questionEgaliteTrigo() {
    const t = angleAigu();
    const [f, connu, cherche] = parmi([['cos', 'hyp', 'adj'], ['cos', 'adj', 'hyp'], ['sin', 'hyp', 'opp'], ['sin', 'opp', 'hyp'],
      ['tan', 'adj', 'opp'], ['tan', 'opp', 'adj']]);
    const [haut, bas] = COTES_RAPPORT[f];
    const multiplier = cherche === haut; // on cherche le numérateur : on multiplie ; le dénominateur : on divise
    const [X, Y] = [t[cherche], t[connu]];
    const a = angleTexte(t.nomAngle);
    const g = f === 'cos' ? 'sin' : (f === 'sin' ? 'cos' : parmi(['cos', 'sin'])); // l'erreur classique : le mauvais rapport
    const reponse = `${X} = ${Y} ${multiplier ? '×' : '÷'} ${f} ${a}`;
    const envers = `${X} = ${Y} ${multiplier ? '÷' : '×'} ${f} ${a}`;
    return choix({
      consigne: 'Choisis la bonne égalité',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}. On connaît ${Y} et l’angle ${angle(t.nomAngle)}. Quelle égalité permet de calculer ${X} ?`,
      reponse,
      pieges: [envers, `${X} = ${Y} × ${g} ${a}`, `${X} = ${Y} ÷ ${g} ${a}`, `${X} = ${f} ${a} ÷ ${Y}`],
      garder: [envers],
      solution: `<b>${reponse.replace(a, angle(t.nomAngle))}</b>`,
      explication: `${f} ${angle(t.nomAngle)} = ${frac(t[haut], t[bas])}, donc ${t[haut]} = ${t[bas]} × ${f} ${angle(t.nomAngle)}`
        + (multiplier ? '.' : ` et ${t[bas]} = ${t[haut]} ÷ ${f} ${angle(t.nomAngle)}.`)
        + `<br>On cherche ${X} : <b>${reponse.replace(a, angle(t.nomAngle))}</b>.`,
    });
  }

  // Calculer une longueur en multipliant : côté = hypoténuse × cos (ou × sin), ou opposé = adjacent × tan
  function questionLongueurTrigo() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const [f, connu, cherche] = parmi([['cos', 'hyp', 'adj'], ['sin', 'hyp', 'opp'], ['tan', 'adj', 'opp']]);
    const exact = f !== 'tan' && Math.random() < 0.25; // (tan 45° = 1 : trop facile)
    const [a, v] = exact ? EXACTES[f] : (a0 => [a0, valeurTrigo(f, a0)])(parmi(ANGLES_CALCUL));
    const L = parmi(exact ? [4, 6, 8, 10, 12, 14] : [4, 5, 8, 10, 20]);
    const x = net(L * v);
    const egal = exact ? '=' : '≈';
    const figure = a >= 30 && Math.random() < 0.4 ? figureCalcul(t, connu, cherche, L, a) : ''; // (20° ou 25° : l’angle est trop fermé pour y écrire sa mesure)
    return nombre({
      consigne: 'Calcule',
      enonce: `${onDonne(f, a, v, exact)} Le triangle ${t.nom} est rectangle en ${t.R}, avec ${ang} = ${a}° et ${t[connu]} = ${cm(L)}. `
        + `Calcule ${t[cherche]}${exact ? '' : ' avec cette valeur'}.${figure}`,
      reponse: x,
      unite: 'cm',
      solution: `${t[cherche]} ${egal} <b>${cm(x)}</b>`,
      explication: `[${t[cherche]}] est ${NOMS_COURTS[cherche]} et [${t[connu]}] ${NOMS_COURTS[connu]} : `
        + `${f} ${ang} = ${frac(t[cherche], t[connu])}.<br>`
        + `Donc ${t[cherche]} = ${t[connu]} × ${f} ${a}° ${egal} ${ecrire(L)} × ${ecrire(v)} = <b>${cm(x)}</b>.`,
    });
  }

  // Calculer une longueur en divisant : hypoténuse = côté ÷ sin (ou ÷ cos), adjacent = opposé ÷ tan
  // (des angles dont la valeur arrondie tombe juste : sin 37° ≈ 0,6 ; cos 37° ≈ 0,8 ; tan 37° ≈ 0,75…)
  const DIVISIONS = [['sin', 30, 'opp', 'hyp'], ['cos', 60, 'adj', 'hyp'], ['sin', 37, 'opp', 'hyp'], ['cos', 37, 'adj', 'hyp'],
    ['sin', 53, 'opp', 'hyp'], ['cos', 53, 'adj', 'hyp'], ['tan', 37, 'opp', 'adj']];
  function questionLongueurDivision() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const [f, a, connu, cherche] = parmi(DIVISIONS);
    const exact = (f === 'sin' && a === 30) || (f === 'cos' && a === 60);
    const v = exact ? 0.5 : valeurTrigo(f, a);
    // Le côté connu : un multiple du numérateur de v (0,6 = 3/5 : 3, 6, 9 ou 12 cm)
    const [n] = simplifier(Math.round(v * 100), 100);
    const L = exact ? entier(2, 12) : n * entier(1, 4);
    const x = net(L / v);
    const egal = exact ? '=' : '≈';
    const figure = Math.random() < 0.4 ? figureCalcul(t, connu, cherche, L, a) : '';
    return nombre({
      consigne: 'Calcule',
      enonce: `${onDonne(f, a, v, exact)} Le triangle ${t.nom} est rectangle en ${t.R}, avec ${ang} = ${a}° et ${t[connu]} = ${cm(L)}. `
        + `Calcule ${t[cherche]}${exact ? '' : ' avec cette valeur'}.${figure}`,
      reponse: x,
      unite: 'cm',
      solution: `${t[cherche]} ${egal} <b>${cm(x)}</b>`,
      explication: `${f} ${ang} = ${frac(t[connu], t[cherche])}, donc ${t[connu]} = ${t[cherche]} × ${f} ${ang} `
        + `et ${t[cherche]} = ${t[connu]} ÷ ${f} ${ang}.<br>${t[cherche]} ${egal} ${ecrire(L)} ÷ ${ecrire(v)} = <b>${cm(x)}</b>.`
        + ` ⚠️ Ici, on <b>divise</b> : [${t[cherche]}] est plus long que [${t[connu]}].`,
    });
  }

  // Calculer une longueur, avec des boutons : l'énoncé donne les trois valeurs, il faut choisir la bonne
  function questionCalculChoixTrigo() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    let f;
    let connu;
    let cherche;
    let a;
    let L;
    let multiplier;
    let v;
    let x;
    let autres;
    do {
      multiplier = Math.random() < 0.5;
      a = multiplier ? parmi([...ANGLES_CALCUL, 37, 53]) : parmi([37, 53]);
      [f, connu, cherche] = parmi(multiplier ? [['cos', 'hyp', 'adj'], ['sin', 'hyp', 'opp'], ['tan', 'adj', 'opp']]
        : [['cos', 'adj', 'hyp'], ['sin', 'opp', 'hyp'], ['tan', 'opp', 'adj']]);
      v = valeurTrigo(f, a);
      L = multiplier ? parmi([5, 8, 10, 20]) : parmi([6, 12, 24]);
      x = net(multiplier ? L * v : L / v);
      // Les erreurs : le mauvais rapport, multiplier au lieu de diviser (ou l'inverse)
      autres = ['cos', 'sin', 'tan'].filter(g => g !== f);
    } while (!valable(x));
    const valeurs = { cos: valeurTrigo('cos', a), sin: valeurTrigo('sin', a), tan: valeurTrigo('tan', a) };
    const envers = net(multiplier ? L / v : L * v);
    const mauvais = autres.map(g => net(multiplier ? L * valeurs[g] : L / valeurs[g]));
    const classique = multiplier ? mauvais[0 + (f === 'tan' ? 1 : 0)] : envers; // (cos ↔ sin, le plus souvent confondus)
    const candidats = [envers, ...mauvais, ...autres.map(g => net(multiplier ? L / valeurs[g] : L * valeurs[g]))]
      .filter(c => valable(c) && Math.abs(c - x) > 1e-9);
    return choix({
      consigne: 'Choisis le bon résultat',
      enonce: `On donne sin ${a}° ≈ ${ecrire(valeurs.sin)} ; cos ${a}° ≈ ${ecrire(valeurs.cos)} et tan ${a}° ≈ ${ecrire(valeurs.tan)}. `
        + `Le triangle ${t.nom} est rectangle en ${t.R}, ${ang} = ${a}° et ${t[connu]} = ${cm(L)}. Combien mesure ${t[cherche]} ?`,
      reponse: cm(x),
      pieges: candidats.map(cm),
      ordre: ordreEquilibre(x, candidats),
      garder: valable(classique) && Math.abs(classique - x) > 1e-9 ? [cm(classique)] : [],
      explication: `${RAPPELS[f]} Ici : ${f} ${ang} = ${enFractions(quotientDe(t, f))}.<br>`
        + `${t[cherche]} ≈ ${ecrire(L)} ${multiplier ? '×' : '÷'} ${ecrire(v)} = <b>${cm(x)}</b>.`
        + (valable(classique) && Math.abs(classique - x) > 1e-9
          ? `<br>⚠️ Pas ${cm(classique)} : ${multiplier ? 'ce n’est pas le bon rapport.' : 'il faut diviser, pas multiplier.'}` : ''),
    });
  }

  // Trouver un angle : sin 30° = 0,5 ; cos 60° = 0,5 ; tan 45° = 1
  function questionAngleTrigo() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const reponse = parmi([30, 45, 60]);
    const m = entier(2, 12);
    let enonce;
    let explication;
    if (Math.random() < 0.4) {
      const f = { 30: 'sin', 45: 'tan', 60: 'cos' }[reponse];
      enonce = `${f} ${ang} = ${ecrire(reponse === 45 ? 1 : 0.5)}. Combien mesure l’angle ${ang} ?`;
      explication = `C’est une valeur à connaître : <b>${f} ${reponse}° = ${ecrire(reponse === 45 ? 1 : 0.5)}</b>. `
        + '(sin 30° = 0,5 ; cos 60° = 0,5 ; tan 45° = 1.)';
    } else if (reponse === 30) {
      enonce = `${t.nom} est rectangle en ${t.R}, ${t.opp} = ${cm(m)} et ${t.hyp} = ${cm(2 * m)}. Combien mesure l’angle ${ang} ?`;
      explication = `[${t.opp}] est opposé à ${ang} : sin ${ang} = ${frac(t.opp, t.hyp)} = ${frac(m, 2 * m)} = 0,5. `
        + `Or <b>sin 30° = 0,5</b> : ${ang} = <b>30°</b>.`;
    } else if (reponse === 60) {
      enonce = `${t.nom} est rectangle en ${t.R}, ${t.adj} = ${cm(m)} et ${t.hyp} = ${cm(2 * m)}. Combien mesure l’angle ${ang} ?`;
      explication = `[${t.adj}] est adjacent à ${ang} : cos ${ang} = ${frac(t.adj, t.hyp)} = ${frac(m, 2 * m)} = 0,5. `
        + `Or <b>cos 60° = 0,5</b> : ${ang} = <b>60°</b>.`;
    } else {
      enonce = `${t.nom} est rectangle en ${t.R}, et ${t.opp} = ${t.adj} = ${cm(m)}. Combien mesure l’angle ${ang} ?`;
      explication = `tan ${ang} = ${frac(t.opp, t.adj)} = ${frac(m, m)} = 1. Or <b>tan 45° = 1</b> : ${ang} = <b>45°</b>. `
        + '(Le triangle est rectangle isocèle.)';
    }
    return choix({
      consigne: 'Trouve l’angle',
      enonce,
      reponse: `${reponse}°`,
      choix: ['30°', '45°', '60°'],
      explication,
    });
  }

  // Des problèmes de la vie de Roxy (réponse en mètres)
  function questionProblemeTrigo() {
    const prenom = parmi(PRENOMS);
    const variante = parmi(['cerfVolant', 'sapin', 'toboggan', 'echelle', 'fil']);
    const probleme = (enonce, reponse, explication) => nombre({ consigne: 'Résous le problème', enonce, reponse, unite: 'm', explication });
    if (variante === 'cerfVolant' || variante === 'toboggan' || variante === 'echelle') {
      const [a, v, exact] = (() => {
        if (variante === 'echelle') { const a0 = parmi([60, 65, 70, 75]); return [a0, valeurTrigo('sin', a0), false]; }
        if (Math.random() < 0.3) return [30, 0.5, true];
        const a0 = parmi(variante === 'toboggan' ? [35, 40] : [35, 40, 50]); // (un toboggan ne dépasse pas 40°)
        return [a0, valeurTrigo('sin', a0), false];
      })();
      const L = variante === 'cerfVolant' ? parmi([10, 20, 30]) : parmi([3, 4, 5]);
      const h = net(L * v);
      const egal = exact ? '=' : '≈';
      const debut = onDonne('sin', a, v, exact);
      const textes = {
        cerfVolant: [`${debut} Le fil tendu du cerf-volant ${/^[AEIOUÉ]/.test(prenom) ? 'd’' : 'de '}${prenom} mesure ${mesure(L, 'm')} `
          + `et fait un angle de ${a}° avec le sol. À quelle hauteur vole le cerf-volant ? (Le fil part du sol.)`,
        'le fil est l’hypoténuse, la hauteur est le côté opposé à l’angle de'],
        toboggan: [`${debut} La glissière droite d’un toboggan mesure ${mesure(L, 'm')} et fait un angle de ${a}° avec le sol. `
          + 'À quelle hauteur est le haut de la glissière ?', 'la glissière est l’hypoténuse, la hauteur est le côté opposé à l’angle de'],
        echelle: [`${debut} Une échelle de ${mesure(L, 'm')} est posée contre un mur vertical ; elle fait un angle de ${a}° avec le sol. `
          + 'À quelle hauteur touche-t-elle le mur ?', 'l’échelle est l’hypoténuse, la hauteur est le côté opposé à l’angle de'],
      }[variante];
      return probleme(textes[0], h,
        `On a un triangle rectangle : ${textes[1]} ${a}°.<br>hauteur = ${ecrire(L)} × sin ${a}° ${egal} ${ecrire(L)} × ${ecrire(v)} = <b>${mesure(h, 'm')}</b>.`);
    }
    if (variante === 'sapin') {
      const a = parmi([35, 40, 50, 55]);
      const v = valeurTrigo('tan', a);
      const ombre = parmi([6, 8, 10, 12]);
      const h = net(ombre * v);
      return probleme(`On donne tan ${a}° ≈ ${ecrire(v)}. L’ombre d’un sapin mesure ${mesure(ombre, 'm')} sur le sol horizontal, `
        + `et les rayons du soleil font un angle de ${a}° avec le sol. Quelle est la hauteur du sapin ?`, h,
      `Le sapin, son ombre et le rayon forment un triangle rectangle : l’ombre est le côté adjacent à l’angle de ${a}°, le sapin le côté opposé.<br>`
        + `hauteur = ${ecrire(ombre)} × tan ${a}° ≈ ${ecrire(ombre)} × ${ecrire(v)} = <b>${mesure(h, 'm')}</b>.`);
    }
    // Le fil : on connaît la hauteur, on divise par sin 30°
    const h = parmi([8, 10, 12, 15, 20]);
    return probleme(`On rappelle que sin 30° = 0,5. Le cerf-volant ${/^[AEIOUÉ]/.test(prenom) ? 'd’' : 'de '}${prenom} vole à ${mesure(h, 'm')} `
      + 'du sol, et son fil tendu fait un angle de 30° avec le sol. Quelle est la longueur du fil ? (Le fil part du sol.)', 2 * h,
    `Le fil est l’hypoténuse, la hauteur est le côté opposé à l’angle de 30° : hauteur = fil × sin 30°.<br>`
      + `Donc fil = ${ecrire(h)} ÷ 0,5 = <b>${mesure(2 * h, 'm')}</b>. ⚠️ On divise : le fil est plus long que la hauteur.`);
  }

  const VF_TRIGO_CALCULS = [
    ['Si on connaît l’hypoténuse et un angle aigu d’un triangle rectangle, on peut calculer ses deux autres côtés.', true,
      'Avec le cosinus, on trouve le côté <b>adjacent</b> ; avec le sinus, le côté <b>opposé</b>.'],
    ['sin 30° = 0,5.', true, 'C’est une valeur à retenir : <b>sin 30° = 0,5</b> (et cos 60° = 0,5).'],
    ['tan 45° = 1.', true, 'Dans un triangle rectangle isocèle, le côté opposé et le côté adjacent sont égaux : <b>tan 45° = 1</b>.'],
    ['cos 30° = 0,5.', false, 'C’est <b>cos 60°</b> (ou sin 30°) qui est égal à 0,5. (cos 30° ≈ 0,87.)'],
    ['Pour calculer l’hypoténuse avec le cosinus, on multiplie le côté adjacent par le cosinus.', false,
      'cos = adjacent ÷ hypoténuse, donc <b>hypoténuse = adjacent ÷ cos</b> : on divise.'],
    ['tan 45° = 0,5.', false, 'Un angle de 45° donne un triangle rectangle isocèle : <b>tan 45° = 1</b>.'],
    ['Si un angle aigu a un cosinus égal à 0,5, alors il mesure 60°.', true,
      'C’est une valeur à connaître : <b>cos 60° = 0,5</b>. L’hypoténuse est alors le double du côté adjacent.'],
    ['Pour calculer le côté opposé avec la tangente, on divise le côté adjacent par la tangente.', false,
      'tan = opposé ÷ adjacent, donc <b>opposé = adjacent × tan</b> : on multiplie.'],
  ];

  ajouterEtape({
    id: '3e-geometrie-trigonometrie-calculs',
    banque: ['formule', 'formule', 'egalite', 'egalite', 'longueur', 'longueur', 'division', 'division', 'calculChoix', 'calculChoix',
      'angle', 'angle', 'probleme', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'formule') return questionFormule();
      if (sorte === 'egalite') return questionEgaliteTrigo();
      if (sorte === 'longueur') return questionLongueurTrigo();
      if (sorte === 'division') return questionLongueurDivision();
      if (sorte === 'calculChoix') return questionCalculChoixTrigo();
      if (sorte === 'angle') return questionAngleTrigo();
      if (sorte === 'probleme') return questionProblemeTrigo();
      return vraiFauxDans(VF_TRIGO_CALCULS);
    },
    titreLecon: 'Calculer avec la trigonométrie',
    lecon: `
      <h4>1. Choisir le bon rapport</h4>
      <p>Repère, pour l’angle connu, le côté <b>connu</b> et le côté <b>cherché</b> (adjacent, opposé ou hypoténuse),
        puis prends le rapport qui les relie : SOH CAH TOA.</p>
      <h4>2. Écrire l’égalité, puis calculer</h4>
      <p>ABC est rectangle en A, ${angle('ABC')} = 40° et BC = 10&nbsp;cm (l’hypoténuse). On cherche AB, le côté adjacent :
        cos ${angle('ABC')} = ${frac('AB', 'BC')}, donc <b>AB = BC × cos ${angle('ABC')}</b>.
        👉 <i>On donne cos 40° ≈ 0,77 : AB ≈ 10 × 0,77 = 7,7&nbsp;cm.</i></p>
      <p>Si le côté cherché est <b>en bas</b> du quotient (l’hypoténuse pour cos et sin, le côté adjacent pour tan), on <b>divise</b> :
        BC = AB ÷ cos ${angle('ABC')} ; AB = AC ÷ tan ${angle('ABC')}.
        👉 <i>AB = 6&nbsp;cm et cos ${angle('ABC')} ≈ 0,8 : BC ≈ 6 ÷ 0,8 = 7,5&nbsp;cm.</i></p>
      <h4>3. Les valeurs à connaître</h4>
      <table>
        <tr><th>sin 30° = 0,5</th><th>cos 60° = 0,5</th><th>tan 45° = 1</th></tr>
        <tr><td>l’hypoténuse est le double du côté opposé</td><td>l’hypoténuse est le double du côté adjacent</td>
          <td>le côté opposé et le côté adjacent sont égaux</td></tr>
      </table>
      <p>👉 <i>Si sin ${angle('ABC')} = 0,5, alors ${angle('ABC')} = 30°.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie ton résultat : l’hypoténuse est toujours le plus long côté !</div>
      <p>⚠️ Ne confonds pas le sinus et le cosinus : sin 30° = 0,5 mais cos 30° ≈ 0,87.</p>
    `,
  });

  // ======================================================================
  // 5. Les transformations
  // ======================================================================
  const TOUCHES_RELATIFS = [',', '−']; // pour toute l'étape (un rapport d'homothétie peut être négatif)
  const TRANSFORMATIONS = ['une translation', 'une symétrie axiale', 'une symétrie centrale', 'une rotation', 'une homothétie'];
  // k sans son signe, écrit à la française : absolu(−1,5) → « 1,5 »
  const absolu = k => ecrire(Math.abs(k));

  // Des figures sans axe ni centre de symétrie (sinon, deux réponses seraient possibles),
  // avec un point à l'intérieur pour écrire leur numéro
  const FORMES = [
    { points: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]], dedans: [0.5, 0.5] },
    { points: [[0, 0], [4, 0], [0, 3]], dedans: [1, 0.9] },
    { points: [[0, 0], [2, 0], [3, 2], [0, 2]], dedans: [1, 1] },
    { points: [[0, 0], [2, 0], [2, 2], [1, 2], [1, 3], [0, 3]], dedans: [1, 1] },
  ];
  // La forme tournée d'un quart de tour (0 à 3 fois), peut-être retournée, et collée contre le coin (0, 0)
  function orienter(forme) {
    const quarts = entier(0, 3);
    const miroir = Math.random() < 0.5;
    const t = ([x, y]) => {
      let [u, v] = miroir ? [-x, y] : [x, y];
      for (let i = 0; i < quarts; i++) [u, v] = [-v, u];
      return [u, v];
    };
    const pts = forme.points.map(t);
    const d = t(forme.dedans);
    const mx = Math.min(...pts.map(p => p[0]));
    const my = Math.min(...pts.map(p => p[1]));
    return { points: pts.map(([x, y]) => [x - mx, y - my]), dedans: [d[0] - mx, d[1] - my] };
  }
  const boite = pts => [Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])),
    Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))];
  // Deux figures bien séparées (au moins un carreau entre leurs boîtes), et qui tiennent ensemble dans colonnes × lignes
  function separees(p1, p2, colonnes, lignes) {
    const [a, b] = [boite(p1), boite(p2)];
    const tout = boite([...p1, ...p2]);
    const ecart = a[2] + 1 <= b[0] || b[2] + 1 <= a[0] || a[3] + 1 <= b[1] || b[3] + 1 <= a[1];
    return ecart && tout[2] - tout[0] <= colonnes && tout[3] - tout[1] <= lignes;
  }

  // Par quelle transformation passe-t-on de la figure 1 à la figure 2 ?
  function questionReconnaitre() {
    const reponse = parmi(TRANSFORMATIONS);
    const [COLONNES, LIGNES] = [14, 8];
    let f;
    let fig1;
    let fig2;
    let d1;
    let d2;
    let k = 1;
    do {
      f = orienter(parmi(FORMES));
      const w = Math.max(...f.points.map(p => p[0]));
      const h = Math.max(...f.points.map(p => p[1]));
      const e = entier(1, 3);
      let image;
      if (reponse === 'une translation') {
        const [dx, dy] = [w + e, entier(-2, 2)];
        image = ([x, y]) => [x + dx, y + dy];
      } else if (reponse === 'une symétrie axiale') {
        image = Math.random() < 0.6 ? ([x, y]) => [2 * w + e - x, y] : ([x, y]) => [x, 2 * h + e - y];
      } else if (reponse === 'une symétrie centrale') {
        const j = entier(-1, 1);
        image = ([x, y]) => [2 * w + e - x, h + j - y];
      } else if (reponse === 'une rotation') {
        // Un quart de tour autour du point (cx ; cy), dans un sens ou dans l'autre (y vers le bas)
        const [cx, cy] = [entier(0, w + 3), entier(-2, h + 2)];
        image = Math.random() < 0.5 ? ([x, y]) => [cx - (y - cy), cy + (x - cx)] : ([x, y]) => [cx + (y - cy), cy - (x - cx)];
      } else {
        // Une homothétie de rapport 2 ou −2 (ou, en échangeant les deux figures, 1/2 ou −1/2), de centre (cx ; cy)
        const [cx, cy] = [entier(-4, w + 4), entier(-3, h + 3)];
        k = parmi([2, -2]);
        image = ([x, y]) => [cx + k * (x - cx), cy + k * (y - cy)];
      }
      [fig1, fig2] = [f.points, f.points.map(image)];
      [d1, d2] = [f.dedans, image(f.dedans)];
      if (reponse === 'une homothétie' && Math.random() < 0.4) {
        [fig1, fig2, d1, d2] = [fig2, fig1, d2, d1];
        k = 1 / k;
      }
    } while (!separees(fig1, fig2, COLONNES, LIGNES));
    // On place le tout au milieu du quadrillage
    const tout = boite([...fig1, ...fig2]);
    const ox = Math.floor((COLONNES - (tout[2] - tout[0])) / 2) - tout[0];
    const oy = Math.floor((LIGNES - (tout[3] - tout[1])) / 2) - tout[1];
    const g = grille(COLONNES, LIGNES, 24, 20);
    const pixel = ([x, y]) => [g.X(x + ox), g.Y(y + oy)];
    const dessin = g.html + F.polygone(fig1.map(pixel)) + F.polygone(fig2.map(pixel))
      + F.texte(pixel(d1), '1') + F.texte(pixel(d2), '2');
    // Un demi-tour est aussi une rotation (de 180°) et une homothétie (de rapport −1) : ces boutons-là ne sont pas proposés
    const exclus = reponse === 'une symétrie centrale' ? ['une rotation', 'une homothétie'] : [];
    const facteur = Math.abs(k) === 2 ? 'multipliées par 2' : 'divisées par 2';
    const EXPLICATIONS = {
      'une translation': 'La figure 2 a seulement <b>glissé</b> : même taille, ni tournée ni retournée. C’est une <b>translation</b>.',
      'une symétrie axiale': 'La figure 2 est <b>retournée</b>, comme dans un miroir : c’est une <b>symétrie axiale</b>.',
      'une symétrie centrale': 'La figure 2 a fait un <b>demi-tour</b> : elle est « tête en bas », sans être retournée comme dans un miroir. '
        + 'C’est une <b>symétrie centrale</b> (une rotation de 180°).',
      'une rotation': 'La figure 2 a tourné d’un <b>quart de tour</b> (90°), sans changer de taille ni être retournée : '
        + 'c’est une <b>rotation</b>. ⚠️ Une symétrie centrale ferait un demi-tour.',
      'une homothétie': `La figure 2 a la même forme, mais ses longueurs sont ${facteur} : c’est une <b>homothétie</b>`
        + (k < 0 ? ' de rapport négatif (la figure 2 est « tête en bas », de l’autre côté du centre).' : '.'),
    };
    return choix({
      consigne: 'Regarde les deux figures',
      enonce: `Par quelle transformation passe-t-on de la figure 1 à la figure 2 ?${F.svg(g.largeur, g.hauteur, dessin, 'Deux figures sur un quadrillage')}`,
      reponse,
      pieges: TRANSFORMATIONS.filter(t => !exclus.includes(t)),
      garder: reponse === 'une rotation' ? ['une symétrie centrale'] : [],
      explication: EXPLICATIONS[reponse],
    });
  }

  // L'image d'un point sur un quadrillage : rotation d'un quart de tour, homothétie ou symétrie centrale de centre O
  const memePoint = (P, Q) => P[0] === Q[0] && P[1] === Q[1];
  function questionImagePoint() {
    const [COLONNES, LIGNES] = [12, 8];
    const dans = ([c, l]) => c >= 0 && c <= COLONNES && l >= 0 && l <= LIGNES;
    let sorte;
    let O;
    let M;
    let image;
    let erreurs;
    let k = 0;
    let horaire = true;
    let faux = [];
    do {
      image = null;
      sorte = parmi(['rotation', 'rotation', 'homothetie', 'homothetie', 'symetrie']);
      O = [entier(3, 9), entier(2, 6)];
      let v;
      do { v = [entier(-3, 3), entier(-3, 3)]; } while (Math.abs(v[0]) + Math.abs(v[1]) < 2 || (v[0] === 0 && v[1] === 0));
      M = [O[0] + v[0], O[1] + v[1]];
      const en = w => [O[0] + w[0], O[1] + w[1]];
      if (sorte === 'rotation') {
        horaire = Math.random() < 0.5;
        // Sur l'écran (y vers le bas), un quart de tour dans le sens des aiguilles d'une montre : (x ; y) → (−y ; x)
        const [bon, autreSens] = horaire ? [[-v[1], v[0]], [v[1], -v[0]]] : [[v[1], -v[0]], [-v[1], v[0]]];
        image = en(bon);
        erreurs = [en(autreSens), en([-v[0], -v[1]]), en([v[1], v[0]]), en([-v[1], -v[0]])];
      } else if (sorte === 'homothetie') {
        k = parmi([2, -2, 3, -1.5, 0.5]);
        if (!Number.isInteger(k * v[0]) || !Number.isInteger(k * v[1])) { faux = []; continue; }
        image = en([k * v[0], k * v[1]]);
        // Les erreurs : le mauvais côté de O, la longueur reportée depuis M (M′M = k × OM), un point sur la mauvaise droite
        erreurs = [en([-k * v[0], -k * v[1]]), en([(k + Math.sign(k)) * v[0], (k + Math.sign(k)) * v[1]]),
          en([k * v[0], -k * v[1]]), en([-k * v[0], k * v[1]])]
          .filter(P => Number.isInteger(P[0]) && Number.isInteger(P[1]));
      } else {
        image = en([-v[0], -v[1]]);
        erreurs = [en([-v[0], v[1]]), en([v[0], -v[1]]), en([-v[1], v[0]]), en([v[1], -v[0]])];
      }
      // Les erreurs qui tombent dans le quadrillage, sur un point libre (il en faut au moins deux)
      faux = [];
      if (image && dans(M) && dans(image) && !memePoint(image, M)) {
        const pris = [O, M, image];
        erreurs.forEach(P => {
          if (faux.length < 3 && dans(P) && !pris.some(Q => memePoint(P, Q))) {
            faux.push(P);
            pris.push(P);
          }
        });
      }
    } while (faux.length < 2);
    const candidats = RM.melanger([image, ...faux]);
    const noms = RM.melanger(['A', 'B', 'C', 'F', 'G', 'H', 'K', 'N', 'P', 'R', 'S', 'T']).slice(0, candidats.length);
    const nomImage = noms[candidats.indexOf(image)];
    const g = grille(COLONNES, LIGNES, 26, 30);
    const pixel = ([c, l]) => [g.X(c), g.Y(l)];
    const dessin = g.html + nommerPointsProches([{ P: pixel(O), nom: 'O' }, { P: pixel(M), nom: 'M' },
      ...candidats.map((P, i) => ({ P: pixel(P), nom: noms[i] }))]);
    let transformation;
    let explication;
    if (sorte === 'rotation') {
      const sens = horaire ? 'dans le sens des aiguilles d’une montre' : 'dans le sens contraire des aiguilles d’une montre';
      transformation = `la rotation de centre O, d’angle 90°, ${sens}`;
      explication = `On fait tourner le segment [OM] d’un <b>quart de tour</b> autour de O, ${sens} : OM′ = OM et l’angle ${angle('MOM′')} est droit. `
        + `C’est le point <b>${nomImage}</b>.`;
    } else if (sorte === 'homothetie') {
      transformation = `l’homothétie de centre O et de rapport ${ecrire(k)}`;
      explication = (k > 0
        ? `Le rapport est positif : M′ est sur la demi-droite [OM), <b>du même côté</b> que M, et OM′ = ${ecrire(k)} × OM.`
        : `Le rapport est négatif : M′ est sur la droite (OM), <b>de l’autre côté de O</b>, et OM′ = ${absolu(k)} × OM.`)
        + ` C’est le point <b>${nomImage}</b>.`;
    } else {
      transformation = 'la symétrie de centre O';
      explication = `O est le <b>milieu</b> de [MM′] : M′ est de l’autre côté de O, à la même distance. C’est le point <b>${nomImage}</b>.`;
    }
    return choix({
      consigne: 'Regarde le quadrillage',
      enonce: `Quel point est l’image M′ de M par ${transformation} ?${F.svg(g.largeur, g.hauteur, dessin, 'Un quadrillage et des points')}`,
      reponse: nomImage,
      pieges: noms.filter(n => n !== nomImage),
      explication,
    });
  }

  // Reconnaître une transformation d'après sa description : [énoncé, réponse, boutons à ne pas proposer (justes aussi), explication]
  const DESCRIPTIONS = [
    ['Quelle transformation fait tourner une figure autour d’un point ?', 'une rotation', ['une symétrie centrale'],
      'Tourner autour d’un point (le centre), d’un certain angle : c’est une <b>rotation</b>.'],
    ['Quelle transformation agrandit ou réduit une figure, à partir d’un point ?', 'une homothétie', [],
      'Une <b>homothétie</b> de centre O et de rapport k agrandit la figure si k &gt; 1 ou k &lt; −1, et la réduit si k est entre −1 et 1 (sans être 0).'],
    ['Quelle transformation fait glisser une figure, sans la tourner ?', 'une translation', [],
      'Faire glisser une figure, sans la tourner ni la retourner, c’est une <b>translation</b>.'],
    ['Quelle transformation retourne une figure, comme un miroir ?', 'une symétrie axiale', [],
      'La <b>symétrie axiale</b> retourne la figure, comme un pliage le long de l’axe.'],
    ['Une rotation d’angle 180° est aussi…', 'une symétrie centrale', ['une rotation', 'une homothétie'],
      'Un demi-tour autour d’un point, c’est une <b>symétrie centrale</b>.'],
    ['Laquelle de ces transformations peut changer les longueurs ?', 'une homothétie', [],
      'Une <b>homothétie</b> de rapport k multiplie les longueurs par |k| (k sans son signe). Les autres conservent les longueurs.'],
    ['Une homothétie de rapport −1 est aussi…', 'une symétrie centrale', ['une rotation', 'une homothétie'],
      'Rapport −1 : l’image est de l’autre côté du centre, à la même distance. C’est une <b>symétrie centrale</b>.'],
    ['Quelle transformation est définie par un centre et un rapport ?', 'une homothétie', ['une symétrie centrale'],
      'Une <b>homothétie</b> a un centre O et un rapport k : OM′ = |k| × OM, et M′ est de l’autre côté de O si k est négatif.'],
    ['Quelle transformation est définie par un centre, un angle et un sens ?', 'une rotation', ['une symétrie centrale'],
      'Une <b>rotation</b> a un centre, un angle (90°, 60°…) et un sens (celui des aiguilles d’une montre, ou l’autre).'],
    ['Quelle transformation est définie par un axe ?', 'une symétrie axiale', [],
      'La <b>symétrie axiale</b> est définie par une droite : son axe.'],
  ];
  function questionDescription() {
    const [enonce, reponse, exclus, explication] = parmi(DESCRIPTIONS);
    return choix({
      consigne: 'Choisis la bonne transformation',
      enonce,
      reponse,
      pieges: TRANSFORMATIONS.filter(t => !exclus.includes(t)),
      explication,
    });
  }

  // L'effet d'une homothétie ou d'une rotation (des boutons courts)
  function questionEffet() {
    const variante = parmi(['segment', 'segment', 'angleHomothetie', 'angleRotation']);
    if (variante === 'segment') {
      const k = parmi([2, 3, -2, -3, 0.5]);
      const a = Math.abs(k);
      const x = a === 0.5 ? entier(3, 12) : a * entier(2, 5);
      const bon = net(a * x);
      return choix({
        consigne: 'Choisis la bonne longueur',
        enonce: `Par une homothétie de rapport ${ecrire(k)}, un segment de ${cm(x)} a pour image un segment de…`,
        reponse: cm(bon),
        pieges: [cm(net(x + k)), cm(x), cm(net(x / a)), cm(net(a * a * x)), ...(k < 0 ? [`${ecrire(-bon)} cm`] : [])],
        ordre: ordreEquilibre(bon, [net(x + k), x, net(x / a), net(a * a * x), ...(k < 0 ? [-bon] : [])]),
        explication: `Une homothétie de rapport ${ecrire(k)} multiplie les longueurs par <b>${absolu(k)}</b>`
          + `${k < 0 ? ' (le signe − dit seulement que l’image est de l’autre côté du centre)' : ''} : `
          + `${ecrire(x)} × ${absolu(k)} = <b>${cm(bon)}</b>.`,
      });
    }
    const a = entier(3, 8) * 10;
    if (variante === 'angleHomothetie') {
      const k = parmi([2, 3, -2, 0.5]);
      return choix({
        consigne: 'Choisis la bonne mesure',
        enonce: `Par une homothétie de rapport ${ecrire(k)}, un angle de ${a}° a pour image un angle de…`,
        reponse: `${a}°`,
        // (les erreurs : l'angle multiplié ou divisé par le rapport, ou son supplémentaire)
        pieges: [`${ecrire(Math.abs(k) * a)}°`, `${180 - a}°`, ...(Number.isInteger(a / Math.abs(k)) ? [`${ecrire(a / Math.abs(k))}°`] : [])],
        ordre: 'melange',
        explication: `Une homothétie change les longueurs, mais elle <b>conserve les angles</b> : l’image mesure toujours <b>${a}°</b>.`,
      });
    }
    return choix({
      consigne: 'Choisis la bonne mesure',
      enonce: `Par une rotation d’angle 90°, un angle de ${a}° a pour image un angle de…`,
      reponse: `${a}°`,
      pieges: [`${a + 90}°`, `${180 - a}°`, '90°', `${2 * a}°`],
      ordre: 'melange', // (tous les pièges sont plus grands que la réponse : rangés, elle serait toujours à gauche)
      explication: `La rotation fait tourner la figure sans la déformer : elle <b>conserve les angles</b>. L’image mesure <b>${a}°</b>. `
        + '(Le 90° dit de combien la figure tourne.)',
    });
  }

  // L'homothétie : longueurs et rapport (réponse à taper)
  function questionHomothetie() {
    const variante = parmi(['longueur', 'distance', 'rapport', 'rapport']);
    if (variante === 'rapport') {
      const a = parmi([2, 3, 4, 5, 6]);
      const r = parmi([2, 3, 0.5, 1.5, 2.5]);
      const b = net(a * r);
      const negatif = Math.random() < 0.5;
      const k = negatif ? -r : r;
      return nombre({
        consigne: 'Trouve le rapport',
        enonce: `M′ est l’image de M par une homothétie de centre O. OM = ${cm(a)}, OM′ = ${cm(b)}, et `
          + (negatif ? 'O est entre M et M′.' : 'M′ est sur la demi-droite [OM).') + ' Quel est le rapport de l’homothétie ?',
        reponse: k,
        touches: TOUCHES_RELATIFS,
        explication: `OM′ ÷ OM = ${ecrire(b)} ÷ ${ecrire(a)} = ${ecrire(r)}. `
          + (negatif ? 'M et M′ sont <b>de part et d’autre</b> de O : le rapport est <b>négatif</b>, '
            : 'M et M′ sont <b>du même côté</b> de O : le rapport est <b>positif</b>, ')
          + `k = <b>${ecrire(k)}</b>.`,
      });
    }
    const k = parmi([2, 3, 0.5, 1.5, 2.5, -2, -3, -0.5, -1.5]);
    const x = entierOuDemi(2, 9);
    const y = net(Math.abs(k) * x);
    const [enonce, nomImage] = variante === 'longueur'
      ? [`L’homothétie de centre O et de rapport ${ecrire(k)} transforme le segment [AB] en [A′B′], et AB = ${cm(x)}. Combien mesure A′B′ ?`, 'A′B′']
      : [`M′ est l’image de M par l’homothétie de centre O et de rapport ${ecrire(k)}, et OM = ${cm(x)}. Combien mesure OM′ ?`, 'OM′'];
    return nombre({
      consigne: 'Calcule',
      enonce,
      reponse: y,
      unite: 'cm',
      touches: TOUCHES_RELATIFS,
      solution: `${nomImage} = <b>${cm(y)}</b>`,
      explication: `Une homothétie de rapport ${ecrire(k)} multiplie les longueurs par <b>${absolu(k)}</b>`
        + (k < 0 ? ' (une longueur n’est jamais négative : le signe − dit que l’image est de l’autre côté de O)' : '')
        + ` : ${nomImage} = ${absolu(k)} × ${ecrire(x)} = <b>${cm(y)}</b>.`,
    });
  }

  // L'angle d'une rotation (réponse à taper)
  const POLYGONES = [[3, 'd’un triangle équilatéral'], [4, 'd’un carré'], [5, 'd’un pentagone régulier'], [6, 'd’un hexagone régulier'],
    [8, 'd’un octogone régulier'], [10, 'd’un décagone régulier']];
  function questionAngleRotation() {
    const variante = parmi(['horloge', 'polygone', 'manege']);
    const reponseAngle = (enonce, reponse, explication) => nombre({
      consigne: 'Trouve l’angle de la rotation', enonce, reponse, unite: '°', touches: TOUCHES_RELATIFS, solution: `<b>${reponse}°</b>`, explication,
    });
    if (variante === 'horloge') {
      const n = parmi([5, 10, 15, 20, 25, 30]);
      return reponseAngle(`En ${n} minutes, la grande aiguille d’une horloge tourne autour du centre du cadran. `
        + 'Quel est l’angle de cette rotation ?', 6 * n,
      `En 60 minutes, la grande aiguille fait un tour complet : 360°. En 1 minute, elle tourne de 360° ÷ 60 = 6°.<br>`
        + `En ${n} minutes : ${n} × 6° = <b>${6 * n}°</b>.`);
    }
    if (variante === 'polygone') {
      const [n, nom] = parmi(POLYGONES);
      return reponseAngle(`O est le centre ${nom}. La rotation de centre O qui envoie chaque sommet sur le sommet suivant `
        + 'a un angle de combien de degrés ?', 360 / n,
      `En ${n} rotations comme celle-ci, on fait un tour complet (360°) : chacune fait 360° ÷ ${n} = <b>${360 / n}°</b>.`);
    }
    const n = parmi([4, 5, 6, 8, 9, 10, 12]);
    return reponseAngle(`Un manège a ${n} chevaux de bois, régulièrement espacés autour de son centre. Il tourne jusqu’à ce que `
      + 'chaque cheval prenne la place du suivant. De quel angle a-t-il tourné ?', 360 / n,
    `Les ${n} chevaux se partagent le tour complet (360°) : 360° ÷ ${n} = <b>${360 / n}°</b>.`);
  }

  const VF_TRANSFORMATIONS = [
    ['Une rotation conserve les longueurs.', true, 'Une rotation fait tourner la figure sans la déformer : les longueurs <b>ne changent pas</b>.'],
    ['Une homothétie conserve les angles.', true, 'Une homothétie change les longueurs, mais <b>pas les angles</b> : la figure garde sa forme.'],
    ['Une symétrie centrale est une rotation d’angle 180°.', true, 'Une symétrie centrale fait faire un <b>demi-tour</b> (180°) autour du centre.'],
    ['Par une homothétie de rapport négatif, l’image est de l’autre côté du centre.', true,
      'Rapport négatif : M′ est sur la droite (OM), <b>de l’autre côté de O</b>.'],
    ['Une homothétie de rapport 0,5 réduit la figure.', true, 'Les longueurs sont multipliées par 0,5 : elles sont <b>divisées par 2</b>.'],
    ['Une homothétie de rapport 3 conserve les longueurs.', false, 'Elle multiplie les longueurs par <b>3</b> : la figure est agrandie.'],
    ['Une homothétie de rapport −2 multiplie les longueurs par −2.', false,
      'Une longueur n’est jamais négative : les longueurs sont multipliées par <b>2</b>. Le signe − dit que l’image est de l’autre côté du centre.'],
    ['Une translation fait tourner la figure.', false, 'Une translation fait <b>glisser</b> la figure, sans la tourner. C’est la rotation qui fait tourner.'],
    ['Une symétrie axiale est une rotation.', false, 'Une symétrie axiale <b>retourne</b> la figure, comme un miroir : une rotation ne peut pas faire ça.'],
    ['Par une rotation, une figure change de taille.', false, 'Une rotation <b>conserve les longueurs</b> : la figure garde la même taille.'],
  ];

  ajouterEtape({
    id: '3e-geometrie-transformations',
    banque: ['reconnaitre', 'reconnaitre', 'image', 'image', 'description', 'description', 'effet', 'effet', 'effet', 'effet',
      'homothetie', 'homothetie', 'angleRotation', 'angleRotation', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'reconnaitre') return questionReconnaitre();
      if (sorte === 'image') return questionImagePoint();
      if (sorte === 'description') return questionDescription();
      if (sorte === 'effet') return questionEffet();
      if (sorte === 'homothetie') return questionHomothetie();
      if (sorte === 'angleRotation') return questionAngleRotation();
      return vraiFauxDans(VF_TRANSFORMATIONS);
    },
    titreLecon: 'Les transformations',
    lecon: `
      <h4>Les cinq transformations</h4>
      <table>
        <tr><th>symétrie axiale</th><td>un axe</td><td>retourne la figure, comme un miroir</td></tr>
        <tr><th>symétrie centrale</th><td>un centre O</td><td>fait faire un demi-tour autour de O (O est le milieu de [MM′])</td></tr>
        <tr><th>translation</th><td>A → B</td><td>fait glisser la figure (même trajet que de A à B)</td></tr>
        <tr><th>rotation</th><td>un centre, un angle, un sens</td><td>fait tourner la figure autour du centre (OM′ = OM)</td></tr>
        <tr><th>homothétie</th><td>un centre O, un rapport k</td><td>agrandit ou réduit la figure à partir de O</td></tr>
      </table>
      <p>Les symétries, la translation et la rotation <b>conservent</b> les longueurs, les angles et les aires :
        la figure change seulement de place.</p>
      <h4>L’homothétie de centre O et de rapport k</h4>
      ${F.svg(300, 170,
        F.segment([30, 150], [130, 110], 'fig-fin') + F.segment([30, 150], [210, 130], 'fig-fin') + F.segment([30, 150], [160, 50], 'fig-fin')
        + F.polygone([[80, 130], [120, 140], [95, 100]]) + F.polygone([[130, 110], [210, 130], [160, 50]])
        + nommer([30, 150], 'O', 225) + nommer([95, 100], 'M', 150, 18) + nommer([160, 50], 'M′', 150, 18),
        'Un triangle et son image par une homothétie de centre O et de rapport 2')}
      <p>Si k &gt; 0, M′ est sur [OM), du même côté que M ; si k &lt; 0, M′ est <b>de l’autre côté de O</b>.
        Dans les deux cas, OM′ = |k| × OM (|k| : k sans son signe).</p>
      <p>Les longueurs sont multipliées par |k| ; les angles ne changent pas.
        👉 <i>Rapport 2 : AB = 3&nbsp;cm donne A′B′ = 6&nbsp;cm. Rapport −3 : A′B′ = 9&nbsp;cm.</i></p>
      <p>Une rotation d’angle 180° et une homothétie de rapport −1, c’est la symétrie centrale.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> l’angle d’une rotation qui fait passer d’un sommet au suivant d’un polygone
        régulier à n côtés, c’est 360° ÷ n. 👉 <i>Hexagone régulier : 360° ÷ 6 = 60°.</i></div>
      <p>⚠️ Une symétrie axiale retourne la figure ; une rotation ou une symétrie centrale la fait seulement tourner.</p>
    `,
  });

  // ======================================================================
  // 6. Les triangles semblables
  // ======================================================================
  // Deux noms de triangles sans lettre commune, et des longueurs de côtés (en cm) qui font de « vrais » triangles
  const PAIRES_TRIANGLES = [['ABC', 'RST'], ['ABC', 'MNP'], ['FGH', 'RST'], ['FGH', 'KMN'], ['MNP', 'RST'], ['ABC', 'KMN'], ['FGH', 'MNP']];
  const COTES_TRIANGLES = [[4, 5, 6], [4, 6, 7], [5, 6, 8], [4, 7, 8], [5, 7, 8], [3, 5, 6], [6, 8, 9], [5, 8, 9], [6, 7, 8], [4, 5, 7]];
  // Deux triangles semblables : le sommet i du premier (X[i]) a pour homologue le sommet Y[sigma[i]] du second.
  // L1(i, j) : la longueur du côté [X[i]X[j]] ; L2(i, j) : celle de son homologue, k fois plus grande.
  function configSemblables(coefficients = [1.5, 2, 2.5, 3, 0.5]) {
    const [n1, n2] = RM.melanger(parmi(PAIRES_TRIANGLES));
    const X = n1.split('');
    const Y = n2.split('');
    // Le plus souvent, les sommets homologues ne sont pas dans l'ordre des noms (le piège classique)
    let sigma;
    do { sigma = RM.melanger([0, 1, 2]); } while (sigma.every((v, i) => v === i) && Math.random() < 0.7);
    const cotes = RM.melanger(parmi(COTES_TRIANGLES)); // cotes[v] : le côté opposé au sommet v
    const k = parmi(coefficients);
    const L1 = (i, j) => cotes[3 - i - j];
    return {
      n1, n2, X, Y, sigma, k, cotes, L1,
      L2: (i, j) => net(k * L1(i, j)),
      nom1: (i, j) => seg(n1, X[i], X[j]),
      nom2: (i, j) => seg(n2, Y[sigma[i]], Y[sigma[j]]),
      hom: i => Y[sigma[i]],
    };
  }
  // « Â = Ŝ, B̂ = T̂ et Ĉ = R̂ » (dans le désordre)
  function anglesEgaux(c) {
    const [a, b, d] = RM.melanger([0, 1, 2]).map(i => `${angle(c.X[i])} = ${angle(c.hom(i))}`);
    return `${a}, ${b} et ${d}`;
  }
  // Les sommets d'un triangle dont les côtés opposés aux sommets 0, 1, 2 mesurent a, b, c
  function sommetsDe(a, b, c) {
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    return [[0, 0], [c, 0], [b * cosA, -b * Math.sqrt(1 - cosA * cosA)]];
  }
  // Placer des points : leur boîte centrée sur « centre », agrandie « echelle » fois
  function placer(points, centre, echelle) {
    const [xmin, ymin, xmax, ymax] = boite(points);
    return points.map(([x, y]) => [centre[0] + (x - (xmin + xmax) / 2) * echelle, centre[1] + (y - (ymin + ymax) / 2) * echelle]);
  }
  // Le dessin des deux triangles, avec leurs vraies proportions : les angles homologues des sommets 0 et 1 sont marqués
  // d'un arc et de deux arcs ; textes1 et textes2 : { '01': '4 cm', … } ce qu'on écrit sur les côtés (repérés dans le triangle 1)
  function figureSemblables(c, textes1 = {}, textes2 = {}) {
    const base = sommetsDe(...c.cotes);
    const t1 = tourner(base, entier(0, 359));
    let t2 = tourner(base.map(([x, y]) => [x * c.k, y * c.k]), entier(0, 359));
    if (Math.random() < 0.5) t2 = t2.map(([x, y]) => [-x, y]); // retourné, comme dans un miroir
    // Les sommets placés à l'échelle e (centrés en (0 ; 135)), et la place prise en largeur avec les noms et les longueurs écrites
    // (un texte fait au plus 10 pixels par caractère ; il est écrit comme le fait longueurDehors)
    function mesurer(t, textes, e) {
      const P = placer(t, [0, 135], e);
      const G = centreDe(P);
      let [gauche, droite] = [Math.min(...P.map(p => p[0])) - 27, Math.max(...P.map(p => p[0])) + 27]; // (les noms des sommets)
      Object.entries(textes).forEach(([cle, texte]) => {
        const [A, B] = [P[cle[0]], P[cle[1]]];
        const m = milieu(A, B);
        const n = [(A[1] - B[1]) / distance(A, B), (B[0] - A[0]) / distance(A, B)];
        const s = n[0] * (m[0] - G[0]) + n[1] * (m[1] - G[1]) > 0 ? 1 : -1;
        const x = m[0] + s * n[0] * 12;
        const w = texte.length * 10;
        const [g, d] = s * n[0] > 0.35 ? [x, x + w] : (s * n[0] < -0.35 ? [x - w, x] : [x - w / 2, x + w / 2]);
        [gauche, droite] = [Math.min(gauche, g), Math.max(droite, d)];
      });
      return { P, gauche, droite };
    }
    const [b1, b2] = [boite(t1), boite(t2)];
    let e = Math.min(170 / Math.max(b1[2] - b1[0], b2[2] - b2[0]), 175 / Math.max(b1[3] - b1[1], b2[3] - b2[1]));
    let m1;
    let m2;
    // On rapetisse les deux triangles (à la même échelle) jusqu'à ce que tout tienne dans les 456 pixels du dessin
    do {
      [m1, m2] = [mesurer(t1, textes1, e), mesurer(t2, textes2, e)];
      e *= 0.95;
    } while ((m1.droite - m1.gauche) + (m2.droite - m2.gauche) + 20 > 456);
    const libre = 456 - (m1.droite - m1.gauche) - (m2.droite - m2.gauche);
    const dx1 = 2 + libre / 3 - m1.gauche;
    const dx2 = 2 + libre / 3 + (m1.droite - m1.gauche) + libre / 3 - m2.gauche;
    // Chaque triangle : ses sommets (le sommet i du second est l’homologue du sommet i du premier), ses textes, ses noms
    const dessin = [[m1.P, dx1, textes1, c.X], [m2.P, dx2, textes2, [0, 1, 2].map(i => c.hom(i))]]
      .map(([P0, dx, textes, noms]) => {
        const P = P0.map(([x, y]) => [x + dx, y]);
        const G = centreDe(P);
        const plusPetit = Math.min(distance(P[0], P[1]), distance(P[1], P[2]), distance(P[0], P[2]));
        const r = Math.max(11, Math.min(18, plusPetit * 0.25));
        let html = F.polygone(P);
        html += F.arc(P[0], P[1], P[2], { rayon: r });
        html += F.arc(P[1], P[0], P[2], { rayon: r }) + F.arc(P[1], P[0], P[2], { rayon: r + 5 });
        Object.entries(textes).forEach(([cle, texte]) => { html += longueurDehors(P[cle[0]], P[cle[1]], texte, G); });
        return html + P.map((S, i) => nommerSommet(S, noms[i], G)).join('');
      }).join('');
    return F.svg(460, 270, dessin, 'Deux triangles semblables');
  }

  // Quel côté est homologue ?
  function questionHomologue() {
    const c = configSemblables();
    const [i, j] = parmi([[0, 1], [1, 2], [0, 2]]);
    const reponse = `[${c.nom2(i, j)}]`;
    const ordreDesNoms = `[${seg(c.n2, c.Y[i], c.Y[j])}]`; // l'erreur : suivre l'ordre des lettres des noms
    return choix({
      consigne: 'Les triangles sont semblables',
      enonce: `Dans les triangles ${c.n1} et ${c.n2}, ${anglesEgaux(c)}. Quel côté est homologue de [${c.nom1(i, j)}] ?`,
      reponse,
      pieges: [[0, 1], [1, 2], [0, 2]].map(([p, q]) => `[${c.nom2(p, q)}]`),
      explication: `Les sommets homologues sont ${c.X[0]} et ${c.hom(0)}, ${c.X[1]} et ${c.hom(1)}, ${c.X[2]} et ${c.hom(2)}. `
        + `L’homologue de [${c.nom1(i, j)}] relie ${c.hom(i)} et ${c.hom(j)} : <b>${reponse}</b>.`
        + (ordreDesNoms !== reponse ? '<br>⚠️ On suit les angles égaux, pas l’ordre des lettres dans les noms.' : ''),
    });
  }

  // Quel angle est égal ?
  function questionAngleEgal() {
    const c = configSemblables();
    const [v, a, b] = RM.melanger([0, 1, 2]);
    const nomAngle = (noms, [p, s, q]) => `${noms[p]}${noms[s]}${noms[q]}`;
    const auHasard = (noms, [p, s, q]) => nomAngle(noms, parmi([[p, s, q], [q, s, p]]));
    const Z = [0, 1, 2].map(i => c.hom(i)); // Z[i] : l'homologue du sommet i
    const reponse = angleTexte(auHasard(Z, [a, v, b]));
    return choix({
      consigne: 'Choisis le bon angle',
      enonce: `Les triangles ${c.n1} et ${c.n2} sont semblables : [${c.nom1(v, a)}] a pour homologue [${c.nom2(v, a)}], `
        + `et [${c.nom1(v, b)}] a pour homologue [${c.nom2(v, b)}]. Quel angle est égal à ${angle(nomAngle(c.X, [a, v, b]))} ?`,
      reponse,
      pieges: [auHasard(Z, [v, a, b]), auHasard(Z, [v, b, a])].map(angleTexte),
      explication: `${c.X[v]} est le sommet commun à [${c.nom1(v, a)}] et [${c.nom1(v, b)}]. Son homologue est le sommet commun à `
        + `[${c.nom2(v, a)}] et [${c.nom2(v, b)}] : ${Z[v]}.<br>Donc ${angle(nomAngle(c.X, [a, v, b]))} = <b>${angle(nomAngle(Z, [a, v, b]))}</b>.`,
    });
  }

  // Calculer une longueur (réponse à taper), avec ou sans figure
  function questionCalculSemblables() {
    const avecFigure = Math.random() < 0.5;
    const c = configSemblables(avecFigure ? [1.5, 2, 2.5, 0.5] : [1.5, 2, 2.5, 3, 0.5]);
    const [[i, j], [p, q]] = RM.melanger([[0, 1], [1, 2], [0, 2]]).slice(0, 2);
    const versLeSecond = Math.random() < 0.6; // on cherche dans le second triangle (sinon dans le premier)
    const [connu, cherche] = versLeSecond ? [c.nom1(p, q), c.nom2(p, q)] : [c.nom2(p, q), c.nom1(p, q)];
    const [vConnu, x] = versLeSecond ? [c.L1(p, q), c.L2(p, q)] : [c.L2(p, q), c.L1(p, q)];
    let enonce;
    let parAngles = false; // (les côtés homologues se trouvent grâce aux angles égaux)
    if (avecFigure) {
      const cle = (m, n) => `${m}${n}`;
      const textes1 = { [cle(i, j)]: cm(c.L1(i, j)), [cle(p, q)]: versLeSecond ? cm(c.L1(p, q)) : '?' };
      const textes2 = { [cle(i, j)]: cm(c.L2(i, j)), [cle(p, q)]: versLeSecond ? '?' : cm(c.L2(p, q)) };
      enonce = `Ces deux triangles sont semblables (les angles marqués de la même façon sont égaux). Calcule ${cherche}.`
        + figureSemblables(c, textes1, textes2);
    } else {
      parAngles = Math.random() < 0.5;
      const lien = parAngles ? `et ${anglesEgaux(c)}`
        : `[${c.nom1(i, j)}] et [${c.nom2(i, j)}] sont homologues, ainsi que [${c.nom1(p, q)}] et [${c.nom2(p, q)}]`;
      const donnees = RM.melanger([`${c.nom1(i, j)} = ${cm(c.L1(i, j))}`, `${c.nom2(i, j)} = ${cm(c.L2(i, j))}`, `${connu} = ${cm(vConnu)}`]);
      enonce = `Les triangles ${c.n1} et ${c.n2} sont semblables, ${lien}. ${donnees[0]}, ${donnees[1]} et ${donnees[2]}. Calcule ${cherche}.`;
    }
    return nombre({
      consigne: 'Calcule',
      enonce,
      reponse: x,
      unite: 'cm',
      solution: `${cherche} = <b>${cm(x)}</b>`,
      explication: (avecFigure ? 'D’après les angles marqués, ' : '')
        + (parAngles ? `${c.X[i]} et ${c.hom(i)}, ${c.X[j]} et ${c.hom(j)} sont des sommets homologues, donc ` : '')
        + `[${c.nom1(i, j)}] et [${c.nom2(i, j)}] sont homologues : ${c.nom2(i, j)} ÷ ${c.nom1(i, j)} = `
        + `${ecrire(c.L2(i, j))} ÷ ${ecrire(c.L1(i, j))} = ${ecrire(c.k)}. Les longueurs du triangle ${c.n2} sont celles du triangle ${c.n1} × ${ecrire(c.k)}.<br>`
        + `[${cherche}] est l’homologue de [${connu}] : ${cherche} = ${ecrire(vConnu)} ${versLeSecond ? '×' : '÷'} ${ecrire(c.k)} = <b>${cm(x)}</b>.`,
    });
  }

  // Le coefficient d'agrandissement ou de réduction (réponse à taper)
  function questionCoefficientSemblables() {
    const c = configSemblables();
    const [i, j] = parmi([[0, 1], [1, 2], [0, 2]]);
    const agrandissement = c.k > 1;
    return nombre({
      consigne: 'Calcule le coefficient',
      enonce: `Les triangles ${c.n1} et ${c.n2} sont semblables, et [${c.nom1(i, j)}] et [${c.nom2(i, j)}] sont homologues : `
        + `${c.nom1(i, j)} = ${cm(c.L1(i, j))} et ${c.nom2(i, j)} = ${cm(c.L2(i, j))}. `
        + `Le triangle ${c.n2} est ${agrandissement ? 'un agrandissement' : 'une réduction'} du triangle ${c.n1} : quel est le coefficient ?`,
      reponse: c.k,
      explication: `coefficient = ${c.nom2(i, j)} ÷ ${c.nom1(i, j)} = ${ecrire(c.L2(i, j))} ÷ ${ecrire(c.L1(i, j))} = <b>${ecrire(c.k)}</b>. `
        + (agrandissement ? '(Un agrandissement a un coefficient plus grand que 1.)' : '(Une réduction a un coefficient entre 0 et 1.)'),
    });
  }

  // Semblables ou pas ? Avec les angles, ou avec les longueurs
  function questionSemblablesOuPas() {
    const [n1, n2] = RM.melanger(parmi(PAIRES_TRIANGLES));
    const oui = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      // Les angles : il faut calculer le troisième
      let a;
      let b;
      do { a = entier(6, 16) * 5; b = entier(6, 16) * 5; } while (a === b || a + b > 150 || 180 - a - b === a || 180 - a - b === b);
      const d = 180 - a - b;
      let b2 = d;
      if (!oui) do { b2 = entier(6, 24) * 5; } while ([b, d].includes(b2) || a + b2 > 160);
      const d2 = 180 - a - b2;
      const liste = (x, y, z) => `${x}°, ${y}° et ${z}°`;
      return choix({
        consigne: 'Réfléchis bien',
        enonce: `Le triangle ${n1} a deux angles de ${a}° et ${b}° ; le triangle ${n2}, deux angles de ${a}° et ${b2}°. Sont-ils semblables ?`,
        reponse: oui ? 'oui' : 'non',
        choix: ['oui', 'non'],
        explication: `Le 3e angle : 180° − ${a}° − ${b}° = ${d}° pour ${n1}, et 180° − ${a}° − ${b2}° = ${d2}° pour ${n2}.<br>`
          + `${n1} : ${liste(a, b, d)} ; ${n2} : ${liste(a, b2, d2)}. `
          + (oui ? 'Mêmes angles : ils sont <b>semblables</b>.' : 'Pas les mêmes angles : ils ne sont <b>pas semblables</b>.'),
      });
    }
    // Les longueurs : on range les côtés, puis on compare les quotients
    const cotes = [...parmi(COTES_TRIANGLES)].sort((u, v) => u - v);
    const k = parmi([2, 3, 1.5]);
    const grands = cotes.map(x => net(k * x));
    if (!oui) grands[2] = net(grands[2] + parmi([1, -1])); // le plus grand côté n'est plus proportionnel
    const ecrits = RM.melanger(grands).map(ecrire);
    const quotients = cotes.map((x, i) => `${ecrire(grands[i])} ÷ ${ecrire(x)}${i === 2 && !oui ? ` ≠ ${ecrire(k)}` : ` = ${ecrire(k)}`}`);
    return choix({
      consigne: 'Réfléchis bien',
      enonce: `Côtés du triangle ${n1} (en cm) : ${cotes.map(ecrire).join(' ; ')}. Côtés du triangle ${n2} : ${ecrits.join(' ; ')}. `
        + 'Sont-ils semblables ?',
      reponse: oui ? 'oui' : 'non',
      choix: ['oui', 'non'],
      explication: `On range les côtés du plus petit au plus grand, puis on divise : ${quotients.join(' ; ')}.<br>`
        + (oui ? 'Les longueurs sont proportionnelles : ils sont <b>semblables</b>.'
          : `Les longueurs ne sont pas proportionnelles (${ecrire(k)} × ${ecrire(cotes[2])} = ${ecrire(net(k * cotes[2]))}) : ils ne sont <b>pas semblables</b>.`),
    });
  }

  const DEFINITIONS_SEMBLABLES = [
    ['Deux triangles qui ont leurs angles égaux deux à deux sont ___.', 'semblables', ['égaux', 'isocèles', 'rectangles'],
      'Mêmes angles : les triangles ont la même forme, ils sont <b>semblables</b> (pas forcément de la même taille).'],
    ['Deux triangles dont les longueurs des côtés sont proportionnelles sont ___.', 'semblables', ['égaux', 'isocèles', 'équilatéraux'],
      'Longueurs proportionnelles : l’un est un agrandissement ou une réduction de l’autre. Ils sont <b>semblables</b>.'],
    ['Dans deux triangles semblables, deux côtés qui se correspondent sont dits…', 'homologues', ['opposés', 'adjacents', 'parallèles'],
      'Des côtés qui se correspondent sont <b>homologues</b> (et des sommets aussi).'],
    ['Si deux triangles sont semblables, les longueurs de leurs côtés sont…', 'proportionnelles', ['égales', 'multipliées par 2', 'parallèles'],
      'Les longueurs de l’un sont celles de l’autre multipliées par un même nombre : elles sont <b>proportionnelles</b>.'],
    ['Un triangle et son agrandissement de coefficient 3 sont…', 'semblables', ['égaux', 'rectangles', 'isocèles'],
      'Un agrandissement garde les angles et rend les longueurs proportionnelles : les triangles sont <b>semblables</b>.'],
    ['Pour être sûr que deux triangles sont semblables, il suffit qu’ils aient…', 'deux angles égaux deux à deux',
      ['un angle égal', 'un côté de même longueur', 'le même périmètre'],
      'Si deux angles sont égaux deux à deux, le troisième aussi (la somme fait 180°) : <b>deux angles</b> suffisent.'],
    ['Deux triangles semblables ont toujours…', 'les mêmes angles', ['les mêmes longueurs', 'la même aire', 'le même périmètre'],
      'Des triangles semblables ont la même forme : <b>les mêmes angles</b>. Leurs longueurs sont proportionnelles, pas égales.'],
    ['Pour trouver le coefficient de deux triangles semblables, on divise les longueurs de…', 'deux côtés homologues',
      ['deux côtés du même triangle', 'deux angles homologues', 'deux côtés quelconques'],
      'Le coefficient, c’est le quotient des longueurs de <b>deux côtés homologues</b> (qui se correspondent).'],
    ['Deux triangles qui ont chacun un angle de 90° et un angle de 35° sont…', 'semblables', ['égaux', 'isocèles', 'équilatéraux'],
      'Deux angles égaux deux à deux (90° et 35°) : le troisième aussi (55°). Ils sont <b>semblables</b>.'],
    ['Deux triangles semblables, de coefficient 1, sont…', 'égaux', ['rectangles', 'isocèles', 'équilatéraux'],
      'Coefficient 1 : les longueurs sont les mêmes, les triangles sont superposables. Ils sont <b>égaux</b>.'],
  ];

  const VF_SEMBLABLES = [
    ['Deux triangles équilatéraux sont toujours semblables.', true, 'Leurs angles mesurent tous <b>60°</b> : ils ont les mêmes angles.'],
    ['Deux triangles rectangles isocèles sont toujours semblables.', true, 'Leurs angles mesurent tous <b>90°, 45° et 45°</b>.'],
    ['Si deux triangles ont deux angles égaux deux à deux, ils sont semblables.', true,
      'Le troisième angle est alors égal aussi (180° moins les deux autres) : ils sont <b>semblables</b>.'],
    [`Un triangle de côtés 3, 4 et ${cm(5)} et un triangle de côtés 6, 8 et ${cm(10)} sont semblables.`, true,
      '6 ÷ 3 = 8 ÷ 4 = 10 ÷ 5 = 2 : les longueurs sont <b>proportionnelles</b>.'],
    ['Si deux triangles sont semblables, leurs angles sont égaux deux à deux.', true,
      'Des triangles semblables ont <b>les mêmes angles</b> : ils ont la même forme.'],
    ['Deux triangles rectangles sont toujours semblables.', false,
      'Ils ont un angle droit en commun, mais leurs autres angles peuvent être différents (30° et 60°, ou 40° et 50°…).'],
    ['Deux triangles isocèles sont toujours semblables.', false,
      'Un triangle isocèle peut avoir des angles de 70°, 70° et 40°, un autre 30°, 30° et 120° : <b>pas les mêmes angles</b>.'],
    ['Deux triangles semblables ont toujours la même aire.', false,
      'L’un peut être un agrandissement de l’autre : ils ont la même forme, mais <b>pas la même taille</b>.'],
    [`Un triangle de côtés 3, 4 et ${cm(5)} et un triangle de côtés 4, 5 et ${cm(6)} sont semblables.`, false,
      '4 ÷ 3, 5 ÷ 4 et 6 ÷ 5 ne sont pas égaux : ajouter 1 ne donne <b>pas</b> des longueurs proportionnelles.'],
    ['Deux triangles semblables ont toujours des côtés de mêmes longueurs.', false,
      'Leurs longueurs sont <b>proportionnelles</b>, pas forcément égales.'],
  ];

  ajouterEtape({
    id: '3e-geometrie-triangles-semblables',
    banque: ['definition', 'definition', 'ouiNon', 'ouiNon', 'homologue', 'homologue', 'homologue', 'angle',
      'coefficient', 'calcul', 'calcul', 'calcul', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'definition') return choixDans('Choisis la bonne réponse', DEFINITIONS_SEMBLABLES);
      if (sorte === 'ouiNon') return questionSemblablesOuPas();
      if (sorte === 'homologue') return questionHomologue();
      if (sorte === 'angle') return questionAngleEgal();
      if (sorte === 'coefficient') return questionCoefficientSemblables();
      if (sorte === 'calcul') return questionCalculSemblables();
      return vraiFauxDans(VF_SEMBLABLES);
    },
    titreLecon: 'Les triangles semblables',
    lecon: `
      <h4>Même forme, pas forcément même taille</h4>
      ${F.svg(440, 185,
        F.polygone([[40, 150], [150, 150], [70, 80]]) + F.polygone([[240, 160], [416, 160], [288, 48]])
        + F.arc([40, 150], [150, 150], [70, 80], { rayon: 16 }) + F.arc([240, 160], [416, 160], [288, 48], { rayon: 18 })
        + F.arc([150, 150], [40, 150], [70, 80], { rayon: 16 }) + F.arc([150, 150], [40, 150], [70, 80], { rayon: 21 })
        + F.arc([416, 160], [240, 160], [288, 48], { rayon: 18 }) + F.arc([416, 160], [240, 160], [288, 48], { rayon: 23 })
        + nommer([40, 150], 'A', 225) + nommer([150, 150], 'B', 315) + nommer([70, 80], 'C', 110)
        + nommer([240, 160], 'R', 225) + nommer([416, 160], 'S', 315) + nommer([288, 48], 'T', 110),
        'Deux triangles semblables ABC et RST')}
      <p>Deux triangles sont <b>semblables</b> s’ils ont leurs angles égaux deux à deux.
        Il suffit de <b>deux</b> angles égaux : le troisième l’est aussi (la somme fait 180°).</p>
      <p>Deux triangles sont aussi semblables si les longueurs de leurs côtés sont <b>proportionnelles</b>
        (on range les côtés du plus petit au plus grand, et on compare les quotients).</p>
      <p>Les sommets de deux angles égaux sont <b>homologues</b> ; les côtés qui se correspondent aussi.
        Ici, ${angle('A')} = ${angle('R')} et ${angle('B')} = ${angle('S')} : [AB] et [RS] sont homologues, [BC] et [ST] aussi.</p>
      <p>Les longueurs du triangle RST sont celles du triangle ABC multipliées par le même nombre k, le <b>coefficient</b>
        (un agrandissement si k &gt; 1, une réduction si k &lt; 1).
        👉 <i>AB = 4&nbsp;cm, RS = 6&nbsp;cm : k = 6 ÷ 4 = 1,5. Si BC = 5&nbsp;cm, alors ST = 5 × 1,5 = 7,5&nbsp;cm.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour trouver les côtés homologues, suis les angles égaux (les arcs pareils),
        pas l’ordre des lettres des noms !</div>
      <p>⚠️ Deux triangles rectangles, ou deux triangles isocèles, ne sont pas toujours semblables.</p>
    `,
  });
})();
