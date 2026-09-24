// Renard Malin — Maths, niveau 4e : les 6 étapes de la Clairière de la Géométrie
//
// Les questions sont fabriquées au hasard : on tire les longueurs, les triangles et les points, le code calcule
// la bonne réponse et dessine la figure (en SVG), avec ses vraies proportions. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, ecrire, mesure, net, arrondir, frac, fracTexte, simplifier, angle, ESPACE,
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
  // Le point du segment [AB] « à t » : A pour t = 0, B pour t = 1
  const entre = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  // Un point (une petite croix) et son nom, écrit à « distance » pixels dans la direction « degres »
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
  // La distance du point L au segment [AB] (pour ne pas écrire un nom sur un trait)
  function distanceAuSegment(L, A, B) {
    const d2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((L[0] - A[0]) * (B[0] - A[0]) + (L[1] - A[1]) * (B[1] - A[1])) / d2));
    return distance(L, entre(A, B, t));
  }

  // Des noms de triangles sans lettres qui se lisent comme un mot (on évite E, L, I, O, U…)
  const TRIANGLES = ['ABC', 'MNP', 'RST', 'FGH', 'KMN', 'PRS', 'BCD', 'GHK', 'NPR', 'CDF'];
  const PRENOMS = ['Léa', 'Tom', 'Zoé', 'Hugo', 'Inès', 'Sami', 'Lina', 'Noé'];
  const FILLES = ['Léa', 'Zoé', 'Inès', 'Lina']; // pour écrire « doit-elle » ou « doit-il »
  const pronom = prenom => (FILLES.includes(prenom) ? 'elle' : 'il');
  // Un segment du triangle « nom », ses deux lettres dans l'ordre du nom : dans le triangle RST, on écrit RT (et pas TR)
  const seg = (nom, X, Y) => (nom.indexOf(X) < nom.indexOf(Y) ? X + Y : Y + X);
  // Un triangle rectangle au hasard : son nom, le sommet R de l'angle droit, et les deux autres sommets P et Q
  function unTriangle(noms = TRIANGLES) {
    const nom = parmi(noms);
    const [R, P, Q] = RM.melanger(nom.split(''));
    return { nom, R, P, Q, RP: seg(nom, R, P), RQ: seg(nom, R, Q), PQ: seg(nom, P, Q) };
  }
  const cm = x => mesure(x, 'cm');
  const carre = x => `${ecrire(x)}²`; // 6² ; 1,5²
  const estCarre = n => Number.isInteger(Math.sqrt(n));
  // La racine carrée d'une longueur au carré, pour un bouton : « 10 cm » si elle tombe juste, sinon « √74 cm »
  const racineCm = n => (estCarre(n) ? cm(Math.sqrt(n)) : `√${ecrire(n)}${ESPACE}cm`);
  // Un nombre entier ou un nombre avec un demi (2 ; 2,5 ; 3…), entre min et max
  function entierOuDemi(min, max) {
    const possibles = [];
    for (let x = Math.ceil(min * 2); x <= Math.floor(max * 2); x++) possibles.push(x / 2);
    return parmi(possibles);
  }

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
      const adjacent = distance(sommet, R); // le côté de l'angle marqué qui va jusqu'à l'angle droit (en pixels)
      const ouverture = Math.acos(((R[0] - sommet[0]) * (autre[0] - sommet[0]) + (R[1] - sommet[1]) * (autre[1] - sommet[1]))
        / (adjacent * distance(sommet, autre))) / RAD;
      // Le texte s'éloigne du sommet quand l'angle est petit, pour tenir entre ses deux côtés, et l'arc le suit.
      // S'il arrivait à mi-chemin de l'angle droit (on le croirait écrit dans l'angle droit), on ne l'écrit pas :
      // la mesure est déjà dans l'énoncé. L'arc reste petit devant le côté (sinon il entourerait l'angle droit).
      const loin = Math.max(44, 18 / Math.tan(ouverture / 2 * RAD) + 8);
      const avecTexte = Boolean(texteArc) && loin <= 0.5 * adjacent;
      const rayon = avecTexte ? loin - 22 : Math.min(30, 0.45 * adjacent);
      dessin += F.arc(sommet, R, autre, { rayon, texte: avecTexte ? texteArc : '', distanceTexte: 22 });
    }
    Object.entries(textes).forEach(([cote, texte]) => { if (texte) dessin += longueurDehors(S[cote[0]], S[cote[1]], texte, G); });
    dessin += nommerSommet(R, noms.R, G) + nommerSommet(P, noms.P, G) + nommerSommet(Q, noms.Q, G);
    return F.svg(460, 260, dessin, 'Un triangle rectangle');
  }

  // ======================================================================
  // 1. Le théorème de Pythagore
  // ======================================================================
  // Des triangles rectangles dont les trois côtés tombent juste : [a, b, c] avec a² + b² = c² (c : l'hypoténuse)
  const TRIPLETS_ENTIERS = [
    [3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [5, 12, 13], [10, 24, 26], [8, 15, 17], [7, 24, 25], [20, 21, 29],
  ];
  const TRIPLETS = [...TRIPLETS_ENTIERS, [30, 40, 50], [1.5, 2, 2.5], [0.6, 0.8, 1], [0.9, 1.2, 1.5]];
  // a² écrit à la française, sans erreur de calcul de l'ordinateur (1,5² = 2,25)
  const auCarre = x => net(x * x);
  // La preuve d'une racine carrée qui n'est pas dans les tables (un entier jusqu'à 12) : « (car 29² = 841) »
  const carDe = r => (Number.isInteger(r) && r <= 12 ? '' : ` (car ${carre(r)} = ${ecrire(auCarre(r))})`);

  // Quelle est l'hypoténuse ? (le côté opposé à l'angle droit, le plus long)
  function questionHypotenuse() {
    const t = unTriangle();
    const variante = parmi(['texte', 'texte', 'plusLong', 'figure']);
    let enonce = `Le triangle ${t.nom} est rectangle en ${t.R}. Quelle est son hypoténuse ?`;
    if (variante === 'plusLong') enonce = `Le triangle ${t.nom} est rectangle en ${t.R}. Quel est son plus long côté ?`;
    if (variante === 'figure') {
      enonce = `Quelle est l’hypoténuse de ce triangle rectangle ?${figureRectangle(entier(4, 9), entier(4, 9), t)}`;
    }
    return choix({
      consigne: variante === 'figure' ? 'Regarde le codage' : 'Choisis le bon côté',
      enonce,
      reponse: `[${t.PQ}]`,
      pieges: [`[${t.RP}]`, `[${t.RQ}]`],
      explication: `L’angle droit est en ${t.R}. L’hypoténuse est le côté <b>opposé à l’angle droit</b> : c’est <b>[${t.PQ}]</b>. `
        + 'C’est toujours le plus long côté du triangle rectangle.',
    });
  }

  // Écrire la bonne égalité de Pythagore (pour l'hypoténuse, ou pour un côté de l'angle droit)
  function questionEgalite() {
    const t = unTriangle();
    const h = t.PQ;
    const [u, v] = RM.melanger([t.RP, t.RQ]);
    const avecFigure = Math.random() < 0.25;
    const enonce = avecFigure
      ? `Quelle égalité est vraie pour ce triangle rectangle ?${figureRectangle(entier(4, 9), entier(4, 9), t)}`
      : `Le triangle ${t.nom} est rectangle en ${t.R}. Quelle égalité est vraie ?`;
    if (Math.random() < 0.6) {
      return choix({
        consigne: avecFigure ? 'Regarde le codage' : 'Choisis la bonne égalité',
        enonce,
        reponse: `${h}² = ${u}² + ${v}²`,
        pieges: [`${u}² = ${h}² + ${v}²`, `${v}² = ${u}² + ${h}²`, `${h} = ${u} + ${v}`, `${h}² = ${u}² − ${v}²`],
        explication: `L’hypoténuse est [${h}], en face de l’angle droit en ${t.R}. D’après le théorème de Pythagore, `
          + `<b>${h}² = ${u}² + ${v}²</b> : le carré de l’hypoténuse est la somme des carrés des deux autres côtés.`,
      });
    }
    return choix({
      consigne: avecFigure ? 'Regarde le codage' : 'Choisis la bonne égalité',
      enonce,
      reponse: `${u}² = ${h}² − ${v}²`,
      pieges: [`${u}² = ${h}² + ${v}²`, `${u}² = ${v}² − ${h}²`, `${u} = ${h} − ${v}`, `${h}² = ${u}² − ${v}²`],
      explication: `L’hypoténuse est [${h}]. D’après le théorème de Pythagore, ${h}² = ${u}² + ${v}², `
        + `donc <b>${u}² = ${h}² − ${v}²</b>. Pour un côté de l’angle droit, on <b>soustrait</b>.`,
    });
  }

  // Calculer l'hypoténuse, ou un côté de l'angle droit, avec des longueurs qui tombent juste (réponse à taper)
  function questionCalcul(inconnue) {
    const t = unTriangle();
    let [a, b, c] = parmi(TRIPLETS);
    if (Math.random() < 0.5) [a, b] = [b, a];
    // a : la longueur RP ; b : la longueur RQ ; c : l'hypoténuse PQ
    const avecFigure = Math.random() < 0.5;
    if (inconnue === 'hypotenuse') {
      const figure = avecFigure ? figureRectangle(a, b, t, { textes: { RP: cm(a), RQ: cm(b), PQ: '?' } }) : '';
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.RP} = ${cm(a)} et ${t.RQ} = ${cm(b)}. Calcule ${t.PQ}.${figure}`,
        reponse: c,
        unite: 'cm',
        solution: `${t.PQ} = <b>${cm(c)}</b>`,
        explication: `[${t.PQ}] est l’hypoténuse. D’après le théorème de Pythagore :<br>`
          + `${t.PQ}² = ${t.RP}² + ${t.RQ}² = ${carre(a)} + ${carre(b)} = ${ecrire(auCarre(a))} + ${ecrire(auCarre(b))} = ${ecrire(auCarre(c))}.<br>`
          + `Donc ${t.PQ} = √${ecrire(auCarre(c))} = <b>${cm(c)}</b>${carDe(c)}.`,
      });
    }
    const figure = avecFigure ? figureRectangle(a, b, t, { textes: { RP: cm(a), PQ: cm(c), RQ: '?' } }) : '';
    return nombre({
      consigne: 'Calcule',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.PQ} = ${cm(c)} et ${t.RP} = ${cm(a)}. Calcule ${t.RQ}.${figure}`,
      reponse: b,
      unite: 'cm',
      solution: `${t.RQ} = <b>${cm(b)}</b>`,
      explication: `D’après le théorème de Pythagore, ${t.PQ}² = ${t.RP}² + ${t.RQ}², donc `
        + `${t.RQ}² = ${t.PQ}² − ${t.RP}² = ${ecrire(auCarre(c))} − ${ecrire(auCarre(a))} = ${ecrire(auCarre(b))}.<br>`
        + `Donc ${t.RQ} = √${ecrire(auCarre(b))} = <b>${cm(b)}</b>${carDe(b)}. ⚠️ On soustrait, car [${t.PQ}] est l’hypoténuse.`,
    });
  }

  // Calculer seulement le carré d'une longueur (la racine ne tombe pas juste)
  function questionCarre() {
    const t = unTriangle();
    const avecFigure = Math.random() < 0.35;
    if (Math.random() < 0.5) {
      let a;
      let b;
      do { a = entier(2, 11); b = entier(2, 11); } while (a === b || estCarre(a * a + b * b));
      const s = a * a + b * b;
      const figure = avecFigure ? figureRectangle(a, b, t, { textes: { RP: cm(a), RQ: cm(b) } }) : '';
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.RP} = ${cm(a)} et ${t.RQ} = ${cm(b)}. Calcule ${t.PQ}².${figure}`,
        reponse: s,
        solution: `${t.PQ}² = <b>${s}</b>`,
        explication: `[${t.PQ}] est l’hypoténuse. D’après le théorème de Pythagore :<br>`
          + `${t.PQ}² = ${t.RP}² + ${t.RQ}² = ${a}² + ${b}² = ${a * a} + ${b * b} = <b>${s}</b>.<br>(Donc ${t.PQ} = ${racineCm(s)}.)`,
      });
    }
    const c = entier(6, 15);
    const a = entier(2, c - 2);
    const d = c * c - a * a;
    const figure = avecFigure ? figureRectangle(a, Math.sqrt(d), t, { textes: { RP: cm(a), PQ: cm(c) } }) : '';
    return nombre({
      consigne: 'Calcule',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.PQ} = ${cm(c)} et ${t.RP} = ${cm(a)}. Calcule ${t.RQ}².${figure}`,
      reponse: d,
      solution: `${t.RQ}² = <b>${d}</b>`,
      explication: `[${t.PQ}] est l’hypoténuse : ${t.PQ}² = ${t.RP}² + ${t.RQ}², donc `
        + `${t.RQ}² = ${t.PQ}² − ${t.RP}² = ${c}² − ${a}² = ${c * c} − ${a * a} = <b>${d}</b>.<br>(Donc ${t.RQ} = ${racineCm(d)}${estCarre(d) ? carDe(Math.sqrt(d)) : ''}.)`,
    });
  }

  // La bonne longueur parmi des boutons : les erreurs classiques (additionner les longueurs, oublier la racine,
  // additionner au lieu de soustraire, croire que 5² = 10)
  function questionCalculChoix() {
    const t = unTriangle();
    const triplet = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      // On cherche l'hypoténuse
      let a;
      let b;
      if (triplet) [a, b] = RM.melanger(parmi(TRIPLETS_ENTIERS).slice(0, 2));
      else do { a = entier(2, 9); b = entier(2, 9); } while (a === b || estCarre(a * a + b * b));
      const s = a * a + b * b;
      const reponse = racineCm(s);
      return choix({
        consigne: 'Choisis la bonne longueur',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, ${t.RP} = ${cm(a)} et ${t.RQ} = ${cm(b)}. Combien mesure ${t.PQ} ?`,
        reponse,
        pieges: [racineCm(Math.abs(b * b - a * a)), racineCm(2 * a + 2 * b)],
        garder: [cm(a + b), cm(s)],
        ordre: 'melange',
        explication: `${t.PQ}² = ${t.RP}² + ${t.RQ}² = ${a * a} + ${b * b} = ${s}, donc ${t.PQ} = <b>${reponse}</b>${estCarre(s) ? carDe(Math.sqrt(s)) : ''}.<br>`
          + '⚠️ On n’additionne pas les longueurs, et on n’oublie pas la racine carrée.',
      });
    }
    // On cherche un côté de l'angle droit
    let a;
    let c;
    let d;
    if (triplet) {
      const [x, y, z] = parmi(TRIPLETS_ENTIERS);
      [a, c] = [parmi([x, y]), z];
      d = c * c - a * a;
    } else {
      do { c = entier(5, 12); a = entier(2, c - 2); d = c * c - a * a; } while (estCarre(d));
    }
    const reponse = racineCm(d);
    return choix({
      consigne: 'Choisis la bonne longueur',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, ${t.PQ} = ${cm(c)} et ${t.RP} = ${cm(a)}. Combien mesure ${t.RQ} ?`,
      reponse,
      // (« 1 cm » ou « √2 cm » pour un côté d'un triangle de 12 et 13 cm : personne ne les choisirait)
      pieges: [cm(d), c - a > 2 ? cm(c - a) : cm(c + a), ...(2 * c - 2 * a >= 8 ? [racineCm(2 * c - 2 * a)] : [])],
      garder: [racineCm(c * c + a * a)],
      ordre: 'melange',
      explication: `[${t.PQ}] est l’hypoténuse : ${t.RQ}² = ${t.PQ}² − ${t.RP}² = ${c * c} − ${a * a} = ${d}, donc ${t.RQ} = <b>${reponse}</b>${estCarre(d) ? carDe(Math.sqrt(d)) : ''}.<br>`
        + '⚠️ Pour un côté de l’angle droit, on soustrait les carrés.',
    });
  }

  // Des problèmes de la vie de Roxy
  const PROBLEMES_PYTHAGORE = [
    () => {
      // L'échelle contre le mur (une échelle bien droite fait environ 70° avec le sol)
      const [pied, haut, echelle] = parmi([[0.7, 2.4, 2.5], [1.4, 4.8, 5], [1, 2.4, 2.6], [1.6, 3, 3.4]]);
      return {
        enonce: `L’échelle de Papi mesure ${mesure(echelle, 'm')}. Il la pose contre un mur vertical, son pied à ${mesure(pied, 'm')} du mur `
          + 'sur un sol horizontal. À quelle hauteur arrive le haut de l’échelle ?'
          + (Number.isInteger(haut) ? '' : ` (Aide : ${carre(haut)} = ${ecrire(auCarre(haut))}.)`),
        reponse: haut,
        unite: 'm',
        explication: 'Le mur, le sol et l’échelle forment un triangle rectangle ; l’échelle est l’hypoténuse.<br>'
          + `hauteur² = ${carre(echelle)} − ${carre(pied)} = ${ecrire(auCarre(echelle))} − ${ecrire(auCarre(pied))} = ${ecrire(auCarre(haut))}, `
          + `donc hauteur = <b>${mesure(haut, 'm')}</b>${carDe(haut)}.`,
      };
    },
    () => {
      // Roxy se promène : vers le nord, puis vers l'est (deux directions perpendiculaires)
      let [a, b, c] = parmi([[300, 400, 500], [90, 120, 150], [50, 120, 130], [80, 150, 170], [240, 100, 260]]);
      if (Math.random() < 0.5) [a, b] = [b, a];
      return {
        enonce: `Roxy sort de son terrier. Elle marche ${mesure(a, 'm')} tout droit vers le nord, puis ${mesure(b, 'm')} vers l’est. `
          + 'À quelle distance de son terrier est-elle, à vol d’oiseau ?',
        reponse: c,
        unite: 'm',
        explication: 'Le nord et l’est forment un angle droit : le trajet à vol d’oiseau est l’hypoténuse.<br>'
          + `distance² = ${carre(a)} + ${carre(b)} = ${ecrire(a * a)} + ${ecrire(b * b)} = ${ecrire(c * c)}, donc distance = <b>${mesure(c, 'm')}</b>${carDe(c)}.`,
      };
    },
    () => {
      // La diagonale d'un rectangle : elle le partage en deux triangles rectangles
      const [objet, unite, dimensions] = parmi([
        ['Le potager de Mamie', 'm', [[12, 5, 13], [8, 6, 10], [15, 8, 17], [16, 12, 20]]],
        ['L’écran de la tablette de Lina', 'cm', [[24, 18, 30], [20, 15, 25], [16, 12, 20]]],
        ['La porte de la grange de Papi', 'm', [[2.4, 1.8, 3], [2, 1.5, 2.5]]],
      ]);
      const [L, l, d] = parmi(dimensions);
      return {
        enonce: `${objet} est un rectangle de ${mesure(L, unite)} sur ${mesure(l, unite)}. Combien mesure sa diagonale ?`,
        reponse: d,
        unite,
        explication: 'La diagonale partage le rectangle en deux triangles rectangles : elle est leur hypoténuse.<br>'
          + `diagonale² = ${carre(L)} + ${carre(l)} = ${ecrire(auCarre(L))} + ${ecrire(auCarre(l))} = ${ecrire(auCarre(d))}, `
          + `donc diagonale = <b>${mesure(d, unite)}</b>${carDe(d)}.`,
      };
    },
    () => {
      // Le cerf-volant
      const [sol, haut, fil] = parmi([[30, 40, 50], [40, 30, 50], [60, 80, 100], [50, 120, 130], [90, 120, 150]]);
      return {
        enonce: `Le fil tendu du cerf-volant de Tom mesure ${mesure(fil, 'm')}. Le cerf-volant est juste au-dessus d’un arbre `
          + `qui est à ${mesure(sol, 'm')} de Tom. À quelle hauteur vole-t-il ? (Tom tient le fil au ras du sol.)`,
        reponse: haut,
        unite: 'm',
        explication: 'Le sol, la verticale de l’arbre et le fil forment un triangle rectangle ; le fil est l’hypoténuse.<br>'
          + `hauteur² = ${carre(fil)} − ${carre(sol)} = ${ecrire(fil * fil)} − ${ecrire(sol * sol)} = ${ecrire(haut * haut)}, `
          + `donc hauteur = <b>${mesure(haut, 'm')}</b>${carDe(haut)}.`,
      };
    },
  ];

  const VF_PYTHAGORE = [
    ['Dans un triangle rectangle, l’hypoténuse est le plus long côté.', true,
      'L’hypoténuse, en face de l’angle droit, est toujours <b>le plus long</b> des trois côtés.'],
    ['L’hypoténuse est le côté opposé à l’angle droit.', true,
      'C’est sa définition : l’hypoténuse est le côté <b>en face de l’angle droit</b>.'],
    ['Si le triangle ABC est rectangle en A, alors BC² = AB² + AC².', true,
      'L’angle droit est en A : l’hypoténuse est [BC]. D’après le théorème de Pythagore, <b>BC² = AB² + AC²</b>.'],
    ['Si le triangle ABC est rectangle en B, alors [AC] est son hypoténuse.', true,
      'L’angle droit est en B, et le côté en face de B est <b>[AC]</b> : c’est l’hypoténuse.'],
    ['Si le triangle RST est rectangle en S, alors RS² = RT² − ST².', true,
      'L’hypoténuse est [RT] : RT² = RS² + ST², donc <b>RS² = RT² − ST²</b>.'],
    ['Si le triangle ABC est rectangle en A, alors BC = AB + AC.', false,
      'Ce sont les <b>carrés</b> qui s’additionnent : BC² = AB² + AC². (La longueur BC est même toujours plus petite que la somme AB + AC.)'],
    ['Si le triangle ABC est rectangle en B, alors BC² = AB² + AC².', false,
      'L’angle droit est en B : l’hypoténuse est [AC]. Il faut écrire <b>AC² = AB² + BC²</b>.'],
    ['L’hypoténuse est l’un des deux côtés de l’angle droit.', false,
      'L’hypoténuse est le troisième côté, celui qui est <b>en face</b> de l’angle droit.'],
    ['Le théorème de Pythagore s’utilise dans tous les triangles.', false,
      'Il ne s’utilise que dans un triangle <b>rectangle</b>.'],
    ['Si le triangle ABC est rectangle en A, alors AB² = AC² + BC².', false,
      'L’hypoténuse est [BC] (en face de A) : c’est <b>BC² = AB² + AC²</b>.'],
  ];

  ajouterEtape({
    id: '4e-geometrie-pythagore',
    banque: ['hypotenuse', 'hypotenuse', 'egalite', 'egalite', 'calculChoix', 'calculChoix', 'calculHypotenuse', 'calculHypotenuse',
      'calculCote', 'carre', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'hypotenuse') return questionHypotenuse();
      if (sorte === 'egalite') return questionEgalite();
      if (sorte === 'calculChoix') return questionCalculChoix();
      if (sorte === 'calculHypotenuse') return questionCalcul('hypotenuse');
      if (sorte === 'calculCote') return questionCalcul('cote');
      if (sorte === 'carre') return questionCarre();
      if (sorte === 'probleme') return nombre({ consigne: 'Résous le problème', ...parmi(PROBLEMES_PYTHAGORE)() });
      return vraiFauxDans(VF_PYTHAGORE);
    },
    titreLecon: 'Le théorème de Pythagore',
    lecon: `
      <h4>L’hypoténuse</h4>
      ${F.svg(420, 170,
        F.polygone([[70, 140], [310, 140], [70, 30]]) + F.segment([310, 140], [70, 30], 'fig-accent')
        + F.angleDroit([70, 140], [310, 140], [70, 30], 16)
        + nommer([70, 140], 'A', 225) + nommer([310, 140], 'B', 0) + nommer([70, 30], 'C', 135)
        + F.texte([250, 70], 'hypoténuse', { classe: 'fig-texte fig-texte-accent' }),
        'Le triangle ABC rectangle en A et son hypoténuse [BC]')}
      <p>Dans un triangle rectangle, l’<b>hypoténuse</b> est le côté opposé à l’angle droit. C’est le plus long côté.</p>
      <h4>Le théorème de Pythagore</h4>
      <p>Si le triangle ABC est rectangle en A, alors <b>BC² = AB² + AC²</b>.
        Le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés.</p>
      <p>La <b>racine carrée</b> d’un nombre positif est le nombre positif qui, au carré, lui est égal : √100 = 10, car 10² = 100.</p>
      <p>👉 <i>Calculer l’hypoténuse : AB = 6&nbsp;cm et AC = 8&nbsp;cm. BC² = 36 + 64 = 100, donc BC = √100 = 10&nbsp;cm.</i></p>
      <p>👉 <i>Calculer un autre côté : BC = 13&nbsp;cm et AC = 5&nbsp;cm. AB² = BC² − AC² = 169 − 25 = 144, donc AB = 12&nbsp;cm.</i></p>
      <p>Quand la racine ne tombe pas juste, on l’écrit avec √ : BC² = 74, donc BC = √74&nbsp;cm (environ 8,6&nbsp;cm).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dans l’égalité, l’hypoténuse est toujours <b>seule</b> d’un côté du signe « = ».
        On <b>additionne</b> pour trouver l’hypoténuse, on <b>soustrait</b> pour trouver un autre côté.
        Des triangles qui tombent juste : 3-4-5, 5-12-13, 8-15-17, et leurs multiples (6-8-10…).</div>
      <p>⚠️ BC n’est pas égal à AB + AC : ce sont les carrés qui s’ajoutent. Et n’oublie pas la racine carrée à la fin !</p>
    `,
  });

  // ======================================================================
  // 2. Rectangle ou pas ? La réciproque de Pythagore
  // ======================================================================
  // Trois côtés [a, b, c], du plus petit au plus grand : des triangles rectangles (a² + b² = c²)…
  const TRIPLETS_RECIPROQUE = [...TRIPLETS_ENTIERS, [1.5, 2, 2.5], [4.5, 6, 7.5], [3.5, 12, 12.5]];
  // … et des triangles qui ne le sont pas, souvent de très peu (8² + 9² = 145 et 12² = 144)
  const PRESQUE_RECTANGLES = [
    [6, 8, 11], [5, 12, 14], [8, 15, 16], [4, 7, 8], [8, 9, 12], [4, 8, 9], [5, 11, 12], [6, 7, 9], [7, 9, 11],
    [9, 12, 16], [10, 11, 15], [3, 5, 6], [2, 3, 4], [6, 8, 9], [12, 16, 21], [7, 24, 26], [5, 6, 8], [1.5, 2, 2.4], [4.5, 6, 7],
  ].filter(([a, b, c]) => net(a * a + b * b) !== net(c * c) && c < a + b);

  // Un triangle au hasard, avec ses trois côtés écrits dans le désordre (le plus grand n'est pas toujours le dernier)
  function triangleReciproque(rectangle) {
    const nom = parmi(TRIANGLES);
    const [a, b, c] = parmi(rectangle ? TRIPLETS_RECIPROQUE : PRESQUE_RECTANGLES);
    const oppose = parmi(nom.split('')); // le sommet en face du plus grand côté
    const [U, V] = nom.split('').filter(s => s !== oppose);
    const [p1, p2] = RM.melanger([a, b]);
    const T = {
      nom, oppose, U, V, c, p1, p2,
      grand: seg(nom, U, V), c1: seg(nom, oppose, U), c2: seg(nom, oppose, V),
      carreGrand: auCarre(c), somme: net(a * a + b * b),
    };
    T.rectangle = T.somme === T.carreGrand;
    const cotes = RM.melanger([[T.grand, c], [T.c1, p1], [T.c2, p2]]).map(([s, l]) => `${s} = ${cm(l)}`);
    T.liste = `${cotes[0]}, ${cotes[1]} et ${cotes[2]}`;
    return T;
  }
  const boutonsRectangle = nom => [...nom.split('').map(s => `rectangle en ${s}`), 'pas rectangle'];
  function expliquerReciproque(T) {
    return `Le plus grand côté est [${T.grand}] : ${T.grand}² = ${carre(T.c)} = ${ecrire(T.carreGrand)}.<br>`
      + `${T.c1}² + ${T.c2}² = ${carre(T.p1)} + ${carre(T.p2)} = ${ecrire(auCarre(T.p1))} + ${ecrire(auCarre(T.p2))} = ${ecrire(T.somme)}.<br>`
      + (T.rectangle
        ? `C’est égal : d’après la réciproque du théorème de Pythagore, le triangle est <b>rectangle en ${T.oppose}</b>.`
        : `${ecrire(T.somme)} ≠ ${ecrire(T.carreGrand)} : ce n’est pas égal, donc, d’après le théorème de Pythagore, le triangle <b>n’est pas rectangle</b>.`);
  }

  // Les trois côtés sont donnés : rectangle (et en quel sommet) ou pas ?
  function questionRectangleOuPas() {
    const T = triangleReciproque(Math.random() < 0.65);
    return choix({
      consigne: 'Rectangle ou pas ?',
      enonce: `Le triangle ${T.nom} a pour côtés ${T.liste}. Il est…`,
      reponse: T.rectangle ? `rectangle en ${T.oppose}` : 'pas rectangle',
      choix: boutonsRectangle(T.nom),
      explication: expliquerReciproque(T),
    });
  }

  // Les carrés sont déjà calculés : que conclure ?
  function questionConclusion() {
    const T = triangleReciproque(Math.random() < 0.65);
    return choix({
      consigne: 'Que peut-on conclure ?',
      enonce: `[${T.grand}] est le plus grand côté du triangle ${T.nom} ; ${T.grand}² = ${ecrire(T.carreGrand)} et ${T.c1}² + ${T.c2}² = ${ecrire(T.somme)}. ${T.nom} est…`,
      reponse: T.rectangle ? `rectangle en ${T.oppose}` : 'pas rectangle',
      choix: boutonsRectangle(T.nom),
      explication: T.rectangle
        ? `${T.grand}² = ${T.c1}² + ${T.c2}² : d’après la réciproque du théorème de Pythagore, le triangle est rectangle, `
          + `et l’angle droit est <b>en ${T.oppose}</b>, en face du plus grand côté [${T.grand}].`
        : `${ecrire(T.somme)} ≠ ${ecrire(T.carreGrand)} : l’égalité de Pythagore n’est pas vraie, donc, d’après le théorème de Pythagore, le triangle <b>n’est pas rectangle</b>`
          + `${Math.abs(T.somme - T.carreGrand) <= 2 ? ' (même si c’est presque égal !)' : ''}.`,
    });
  }

  // Ce qu'il faut comparer
  function questionComparer() {
    const T = triangleReciproque(true);
    return choix({
      consigne: 'Choisis la bonne méthode',
      enonce: `Le plus grand côté du triangle ${T.nom} est [${T.grand}]. Pour savoir s’il est rectangle, on compare…`,
      reponse: `${T.grand}² et ${T.c1}² + ${T.c2}²`,
      pieges: [`${T.c1}² et ${T.grand}² + ${T.c2}²`, `${T.c2}² et ${T.grand}² + ${T.c1}²`, `${T.grand} et ${T.c1} + ${T.c2}`],
      explication: `On compare le carré du <b>plus grand côté</b> avec la somme des carrés des deux autres : `
        + `<b>${T.grand}² et ${T.c1}² + ${T.c2}²</b>. S’ils sont égaux, le triangle est rectangle en ${T.oppose}.`,
    });
  }

  // En quel sommet est l'angle droit ? (en face du plus grand côté)
  function questionSommet() {
    const T = triangleReciproque(true);
    const avecLongueurs = Math.random() < 0.5;
    return choix({
      consigne: 'Où est l’angle droit ?',
      enonce: avecLongueurs
        ? `Le triangle ${T.nom}, avec ${T.liste}, est rectangle. En quel sommet ?`
        : `Le triangle ${T.nom} est rectangle, et son plus grand côté est [${T.grand}]. En quel sommet est l’angle droit ?`,
      reponse: `en ${T.oppose}`,
      pieges: [`en ${T.U}`, `en ${T.V}`],
      explication: `Le plus grand côté, [${T.grand}], est l’hypoténuse. L’angle droit est <b>en face</b> de l’hypoténuse : `
        + `il est <b>en ${T.oppose}</b>.`,
    });
  }

  // Calculer les carrés (réponse à taper)
  function questionCarres() {
    const T = triangleReciproque(Math.random() < 0.5);
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${T.nom} a pour côtés ${T.liste}. Calcule le carré de son plus grand côté.`,
        reponse: T.carreGrand,
        solution: `${T.grand}² = <b>${ecrire(T.carreGrand)}</b>`,
        explication: `Le plus grand côté est [${T.grand}] (${cm(T.c)}) : ${T.grand}² = ${carre(T.c)} = ${ecrire(T.c)} × ${ecrire(T.c)} = <b>${ecrire(T.carreGrand)}</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `Le triangle ${T.nom} a pour côtés ${T.liste}. Calcule ${T.c1}² + ${T.c2}².`,
      reponse: T.somme,
      solution: `${T.c1}² + ${T.c2}² = <b>${ecrire(T.somme)}</b>`,
      explication: `${T.c1}² + ${T.c2}² = ${carre(T.p1)} + ${carre(T.p2)} = ${ecrire(auCarre(T.p1))} + ${ecrire(auCarre(T.p2))} = <b>${ecrire(T.somme)}</b>.`,
    });
  }

  // Le coin est-il droit ? (la méthode des maçons : 3-4-5) : la distance à trouver, ou décider avec la distance mesurée
  function questionProblemeReciproque() {
    const t = parmi([[30, 40, 50], [60, 80, 100], [90, 120, 150], [45, 60, 75], [36, 48, 60], [50, 120, 130]]);
    const [a, b, c] = Math.random() < 0.5 ? t : [t[1], t[0], t[2]];
    const prenom = parmi(PRENOMS);
    const debut = `Pour vérifier que le coin de sa cabane est droit, ${prenom} fait une marque sur un mur à ${cm(a)} du coin, `
      + `et une autre sur l’autre mur à ${cm(b)} du coin.`;
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${debut} Quelle distance doit-${pronom(prenom)} trouver entre les deux marques ?`,
        reponse: c,
        unite: 'cm',
        explication: `Le coin est droit si ${ecrire(a)}² + ${ecrire(b)}² = distance², c’est-à-dire si distance² = ${ecrire(a * a)} + ${ecrire(b * b)} = ${ecrire(c * c)}.<br>`
          + `Il faut trouver <b>${cm(c)}</b> (car ${ecrire(c)}² = ${ecrire(c * c)}) : alors, d’après la réciproque du théorème de Pythagore, le coin est droit.`,
      });
    }
    // La distance mesurée : la bonne, ou presque (1 ou 2 cm de trop ou de moins)
    const d = parmi([c, c, c + 1, c - 1, c + 2, c - 2]);
    const droit = d === c;
    return choix({
      consigne: 'Le coin est-il droit ?',
      enonce: `${debut} Entre les deux marques, ${pronom(prenom)} trouve ${cm(d)}. Le coin est-il droit ?`,
      reponse: droit ? 'Oui' : 'Non',
      choix: ['Oui', 'Non'],
      explication: `${ecrire(a)}² + ${ecrire(b)}² = ${ecrire(a * a)} + ${ecrire(b * b)} = ${ecrire(a * a + b * b)} et ${ecrire(d)}² = ${ecrire(d * d)}.<br>`
        + (droit
          ? 'C’est égal : d’après la réciproque du théorème de Pythagore, le coin est <b>droit</b>.'
          : 'Ce n’est pas égal : d’après le théorème de Pythagore, le coin <b>n’est pas droit</b> (même s’il en est tout près).'),
    });
  }

  const VF_RECIPROQUE = [
    ['Si BC² = AB² + AC², alors le triangle ABC est rectangle en A.', true,
      'C’est la réciproque du théorème de Pythagore. L’angle droit est <b>en A</b>, en face du plus grand côté [BC].'],
    ['Un triangle dont les côtés mesurent 3&nbsp;cm, 4&nbsp;cm et 5&nbsp;cm est rectangle.', true,
      '5² = 25 et 3² + 4² = 9 + 16 = 25 : c’est égal, donc le triangle est <b>rectangle</b>.'],
    ['Un triangle dont les côtés mesurent 5&nbsp;cm, 13&nbsp;cm et 12&nbsp;cm est rectangle.', true,
      'Le plus grand côté mesure 13&nbsp;cm : 13² = 169 et 5² + 12² = 25 + 144 = 169. C’est égal : il est <b>rectangle</b>.'],
    ['Dans un triangle rectangle, l’angle droit est en face du plus grand côté.', true,
      'Le plus grand côté est l’hypoténuse, et l’hypoténuse est <b>en face de l’angle droit</b>.'],
    ['Si le carré du plus grand côté n’est pas égal à la somme des carrés des deux autres, le triangle n’est pas rectangle.', true,
      'S’il était rectangle, l’égalité de Pythagore serait vraie. Elle est fausse : d’après le théorème de Pythagore, il <b>n’est pas rectangle</b>.'],
    ['Un triangle dont les côtés mesurent 6&nbsp;cm, 8&nbsp;cm et 11&nbsp;cm est rectangle.', false,
      '11² = 121, mais 6² + 8² = 36 + 64 = 100. Ce n’est pas égal : d’après le théorème de Pythagore, il <b>n’est pas rectangle</b>.'],
    ['Si BC² = AB² + AC², alors le triangle ABC est rectangle en B.', false,
      'Le plus grand côté est [BC] : l’angle droit est en face, <b>en A</b>.'],
    ['Pour savoir si un triangle est rectangle, on compare toujours le carré du côté écrit en dernier avec la somme des deux autres carrés.', false,
      'On prend le carré du <b>plus grand côté</b>, qui n’est pas forcément écrit en dernier.'],
    ['Un triangle dont les côtés mesurent 2&nbsp;cm, 3&nbsp;cm et 4&nbsp;cm est rectangle.', false,
      '4² = 16, mais 2² + 3² = 4 + 9 = 13. Ce n’est pas égal : d’après le théorème de Pythagore, il <b>n’est pas rectangle</b>.'],
    ['Si AB² + AC² = 145 et BC² = 144, alors le triangle ABC est rectangle.', false,
      '145 ≠ 144 : c’est presque égal, mais pas égal. Le triangle <b>n’est pas rectangle</b>.'],
  ];

  ajouterEtape({
    id: '4e-geometrie-reciproque-pythagore',
    banque: ['rectangleOuPas', 'rectangleOuPas', 'rectangleOuPas', 'conclusion', 'comparer', 'sommet',
      'carres', 'carres', 'carres', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'rectangleOuPas') return questionRectangleOuPas();
      if (sorte === 'conclusion') return questionConclusion();
      if (sorte === 'comparer') return questionComparer();
      if (sorte === 'sommet') return questionSommet();
      if (sorte === 'carres') return questionCarres();
      if (sorte === 'probleme') return questionProblemeReciproque();
      return vraiFauxDans(VF_RECIPROQUE);
    },
    titreLecon: 'Rectangle ou pas ?',
    lecon: `
      <h4>La réciproque du théorème de Pythagore</h4>
      <p>Dans un triangle ABC dont le plus grand côté est [BC] :</p>
      <p>• si <b>BC² = AB² + AC²</b>, alors le triangle ABC est <b>rectangle en A</b> (en face du plus grand côté) ;</p>
      <p>• si BC² ≠ AB² + AC², alors, d’après le théorème de Pythagore, le triangle ABC <b>n’est pas rectangle</b>
        (s’il l’était, on aurait l’égalité).</p>
      <h4>La méthode</h4>
      <p>1. Je repère le <b>plus grand côté</b>. 2. Je calcule son carré. 3. Je calcule la somme des carrés des deux autres côtés.
        4. Je compare et je conclus.</p>
      <p>👉 <i>AB = 5&nbsp;cm, BC = 13&nbsp;cm, AC = 12&nbsp;cm. Le plus grand côté est [BC] : BC² = 169 ;
        AB² + AC² = 25 + 144 = 169. C’est égal : ABC est rectangle en A.</i></p>
      <p>👉 <i>RS = 6&nbsp;cm, ST = 8&nbsp;cm, RT = 11&nbsp;cm : RT² = 121 et RS² + ST² = 36 + 64 = 100. 121 ≠ 100 : RST n’est pas rectangle.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> l’angle droit est toujours <b>en face du plus grand côté</b> : c’est le sommet
        qui n’est pas dans le nom de ce côté.</div>
      <p>⚠️ Le plus grand côté n’est pas toujours écrit en dernier ! Et « presque égal » ne suffit pas : 145 ≠ 144.</p>
    `,
  });

  // ======================================================================
  // 3. Le cosinus
  // ======================================================================
  // Les angles aigus dont l'énoncé donne le cosinus (arrondi au centième, calculé ici : cos 40° ≈ 0,77)
  const ANGLES_COS = [20, 25, 30, 35, 40, 45, 50, 55, 65, 70, 75, 80];
  const cosArrondi = a => arrondir(Math.cos(a * RAD), 2);

  // Un triangle rectangle en R et l'un de ses angles aigus, au sommet S : son côté adjacent, l'hypoténuse, le côté opposé
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
  // La figure d'un triangle rectangle quand on connaît son côté adjacent et son côté opposé à l'angle en S
  // (figureRectangle veut les longueurs RP et RQ ; textes : pour 'adj', 'opp' et 'hyp')
  function figureAngle(t, adjacent, oppose, { texteArc = '', textes = {} } = {}) {
    const [RP, RQ] = t.S === t.P ? [adjacent, oppose] : [oppose, adjacent];
    const cotes = t.S === t.P ? { adj: 'RP', opp: 'RQ' } : { adj: 'RQ', opp: 'RP' };
    const ecrits = {};
    if (textes.adj) ecrits[cotes.adj] = textes.adj;
    if (textes.opp) ecrits[cotes.opp] = textes.opp;
    if (textes.hyp) ecrits.PQ = textes.hyp;
    return figureRectangle(RP, RQ, t, { arc: t.arc, texteArc, textes: ecrits });
  }

  // Quel est le côté adjacent à l'angle ?
  function questionAdjacent() {
    const t = angleAigu();
    const avecFigure = Math.random() < 0.4;
    return choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis le bon côté',
      enonce: avecFigure
        ? `Quel est le côté adjacent à l’angle ${angle(t.nomAngle)}, marqué en orange ?${figureAngle(t, entier(4, 9), entier(4, 9))}`
        : `Le triangle ${t.nom} est rectangle en ${t.R}. Quel est le côté adjacent à l’angle ${angle(t.nomAngle)} ?`,
      reponse: `[${t.adj}]`,
      pieges: [`[${t.hyp}]`, `[${t.opp}]`],
      explication: `Les deux côtés du triangle qui forment l’angle ${angle(t.nomAngle)} sont [${t.adj}] et [${t.hyp}]. `
        + `[${t.hyp}] est l’hypoténuse : le côté adjacent est donc <b>[${t.adj}]</b>. ([${t.opp}] est en face de l’angle.)`,
    });
  }

  // Écrire le bon quotient
  function questionQuotient() {
    const t = angleAigu();
    const avecFigure = Math.random() < 0.3;
    const q = choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis le bon quotient',
      enonce: avecFigure
        ? `Sur la figure, l’angle marqué est ${angle(t.nomAngle)}. cos ${angle(t.nomAngle)} = ___${figureAngle(t, entier(4, 9), entier(4, 9))}`
        : `Le triangle ${t.nom} est rectangle en ${t.R}. cos ${angle(t.nomAngle)} = ___`,
      reponse: `${t.adj}/${t.hyp}`,
      pieges: [`${t.opp}/${t.hyp}`, `${t.hyp}/${t.adj}`, `${t.adj}/${t.opp}`, `${t.opp}/${t.adj}`],
      solution: `cos ${angle(t.nomAngle)} = <b>${frac(t.adj, t.hyp)}</b>`,
      explication: `cos = côté adjacent ÷ hypoténuse. Le côté adjacent à ${angle(t.nomAngle)} est [${t.adj}], `
        + `l’hypoténuse est [${t.hyp}] : cos ${angle(t.nomAngle)} = <b>${frac(t.adj, t.hyp)}</b>.`,
    });
    return fractionsSurLesBoutons(q);
  }

  // Calculer une longueur avec le cosinus (réponse à taper)
  function questionLongueurCos() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const variante = parmi(['cos60', 'valeur', 'valeur', 'hypotenuse', 'echelle']);
    const avecFigure = Math.random() < 0.4;
    if (variante === 'echelle') {
      const a = parmi([60, 65, 70, 75]);
      const L = parmi([2, 3, 4, 5]);
      const c = a === 60 ? 0.5 : cosArrondi(a);
      const d = net(L * c);
      const egal = a === 60 ? '=' : '≈';
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${a === 60 ? 'On rappelle que cos 60° = 0,5.' : `On donne cos ${a}° ≈ ${ecrire(c)} (utilise cette valeur, sans arrondir le résultat).`} `
          + `Une échelle de ${mesure(L, 'm')} est posée contre un mur vertical ; elle fait un angle de ${a}° avec le sol horizontal. `
          + 'À quelle distance du mur est son pied ?',
        reponse: d,
        unite: 'm',
        explication: 'Le sol, le mur et l’échelle forment un triangle rectangle : l’échelle est l’hypoténuse, '
          + `et la distance au mur est le côté adjacent à l’angle de ${a}°.<br>distance = ${ecrire(L)} × cos ${a}° ${egal} ${ecrire(L)} × ${ecrire(c)} = <b>${mesure(d, 'm')}</b>.`,
      });
    }
    if (variante === 'hypotenuse') {
      // On connaît le côté adjacent et le cosinus (0,5 ; 0,6 ou 0,8) : on divise pour trouver l'hypoténuse
      const [c, fa, fh] = parmi([[0.5, 1, 2], [0.6, 3, 5], [0.8, 4, 5]]);
      const k = c === 0.5 ? entier(2, 12) : entier(1, 5);
      const [a, h] = [fa * k, fh * k];
      const figure = avecFigure ? figureAngle(t, a, Math.sqrt(h * h - a * a), { textes: { adj: cm(a), hyp: '?' } }) : '';
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec cos ${ang} = ${ecrire(c)} et ${t.adj} = ${cm(a)}. Calcule ${t.hyp}.${figure}`,
        reponse: h,
        unite: 'cm',
        solution: `${t.hyp} = <b>${cm(h)}</b>`,
        explication: `cos ${ang} = ${frac(t.adj, t.hyp)}, donc ${t.adj} = ${t.hyp} × cos ${ang} et ${t.hyp} = ${t.adj} ÷ cos ${ang}.<br>`
          + `${t.hyp} = ${ecrire(a)} ÷ ${ecrire(c)} = <b>${cm(h)}</b>. (On vérifie : l’hypoténuse est plus longue que [${t.adj}].)`,
      });
    }
    // On connaît l'hypoténuse et l'angle : côté adjacent = hypoténuse × cos
    const a = variante === 'cos60' ? 60 : parmi(ANGLES_COS);
    const c = a === 60 ? 0.5 : cosArrondi(a);
    const h = variante === 'cos60' ? entier(3, 15) : parmi([10, 20]);
    const adj = net(h * c);
    const egal = a === 60 ? '=' : '≈';
    // (pour 70° à 80°, le côté adjacent serait trop petit sur le dessin : pas de figure)
    const figure = avecFigure && a < 70
      ? figureAngle(t, h * Math.cos(a * RAD), h * Math.sin(a * RAD), { texteArc: `${a}°`, textes: { hyp: cm(h), adj: '?' } })
      : '';
    return nombre({
      consigne: 'Calcule',
      enonce: `${a === 60 ? 'On rappelle que cos 60° = 0,5.' : `On donne cos ${a}° ≈ ${ecrire(c)}.`} Le triangle ${t.nom} est rectangle en ${t.R}, `
        + `${ang} = ${a}° et ${t.hyp} = ${cm(h)}. Calcule ${t.adj}.${figure}`,
      reponse: adj,
      unite: 'cm',
      solution: `${t.adj} ${egal} <b>${cm(adj)}</b>`,
      explication: `[${t.adj}] est le côté adjacent à ${ang}, [${t.hyp}] l’hypoténuse : cos ${ang} = ${frac(t.adj, t.hyp)}.<br>`
        + `Donc ${t.adj} = ${t.hyp} × cos ${a}° ${egal} ${ecrire(h)} × ${ecrire(c)} = <b>${cm(adj)}</b>.`,
    });
  }

  // Calculer le cosinus quand on connaît les trois côtés (le côté opposé ne sert à rien)
  function questionValeurCos() {
    const t = angleAigu();
    const decimal = Math.random() < 0.5;
    const famille = decimal ? [3, 4, 5] : parmi([[5, 12, 13], [8, 15, 17], [7, 24, 25]]);
    const k = decimal ? parmi([1, 2, 3, 4]) : parmi([1, 1, 2]);
    const [x, y] = RM.melanger(famille.slice(0, 2));
    const [a, o, h] = [x * k, y * k, famille[2] * k];
    const cotes = RM.melanger([`${t.adj} = ${cm(a)}`, `${t.opp} = ${cm(o)}`, `${t.hyp} = ${cm(h)}`]);
    const figure = Math.random() < 0.3 ? figureAngle(t, a, o, { textes: { adj: cm(a), opp: cm(o), hyp: cm(h) } }) : '';
    const debut = `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${cotes[0]}, ${cotes[1]} et ${cotes[2]}.`;
    const calcul = `cos ${angle(t.nomAngle)} = ${frac(t.adj, t.hyp)} = ${frac(a, h)}`;
    const attention = `<br>⚠️ [${t.opp}] ne sert pas : il est en face de l’angle.`;
    if (decimal) {
      return nombre({
        consigne: 'Calcule',
        enonce: `${debut} Calcule cos ${angle(t.nomAngle)} (c’est un nombre décimal).${figure}`,
        reponse: a / h,
        solution: `cos ${angle(t.nomAngle)} = <b>${ecrire(a / h)}</b>`,
        explication: `${calcul} = <b>${ecrire(a / h)}</b>.${attention}`,
      });
    }
    const [n, d] = simplifier(a, h);
    return fraction({
      consigne: 'Écris une fraction irréductible',
      enonce: `${debut} Calcule cos ${angle(t.nomAngle)}.${figure}`,
      n,
      d,
      solution: `cos ${angle(t.nomAngle)} = <b>${frac(n, d)}</b>`,
      explication: `${calcul}${n === a ? '' : ` = ${frac(n, d)}`}.${attention}`,
    });
  }

  // Trouver un angle : cos 60° = 0,5, l'autre angle aigu (90° − 60°), ou une petite table de cosinus donnée dans l'énoncé
  function questionAngleCos() {
    const t = angleAigu();
    const ang = angle(t.nomAngle);
    const variante = parmi(['moitie', 'table', 'table', 'autre']);
    if (variante === 'table') {
      const TABLE = [30, 40, 50, 60].map(x => [x, x === 60 ? 0.5 : cosArrondi(x)]);
      const donnees = RM.melanger(TABLE).slice(0, 3).sort((u, v) => u[0] - v[0]);
      const [a, c] = parmi(donnees);
      const h = parmi([10, 20]);
      const adj = net(h * c);
      const table = donnees.map(([x, v]) => `cos ${x}° ${x === 60 ? '=' : '≈'} ${ecrire(v)}`).join(' ; ');
      return nombre({
        consigne: 'Trouve l’angle',
        enonce: `On donne : ${table}. Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.adj} = ${cm(adj)} et ${t.hyp} = ${cm(h)}. `
          + `Combien mesure l’angle ${ang} ?`,
        reponse: a,
        unite: '°',
        solution: `${ang} ${a === 60 ? '=' : '≈'} <b>${a}°</b>`,
        explication: `[${t.adj}] est le côté adjacent à ${ang} : cos ${ang} = ${frac(t.adj, t.hyp)} = ${frac(ecrire(adj), h)} = ${ecrire(c)}.<br>`
          + `D’après les valeurs données, l’angle ${ang} mesure ${a === 60 ? '' : 'environ '}<b>${a}°</b>.`,
      });
    }
    const a = entier(2, 12);
    if (variante === 'autre') {
      // L'autre angle aigu, au sommet « autre »
      const autre = angle(parmi([t.R + t.autre + t.S, t.S + t.autre + t.R]));
      return nombre({
        consigne: 'Trouve l’angle',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.adj} = ${cm(a)} et ${t.hyp} = ${cm(2 * a)}. Combien mesure l’angle ${autre} ?`,
        reponse: 30,
        unite: '°',
        solution: `${autre} = <b>30°</b>`,
        explication: `cos ${ang} = ${frac(t.adj, t.hyp)} = ${frac(a, 2 * a)} = 0,5, donc ${ang} = 60°.<br>`
          + `Les deux angles aigus d’un triangle rectangle font 90° ensemble : ${autre} = 90° − 60° = <b>30°</b>.`,
      });
    }
    return nombre({
      consigne: 'Trouve l’angle',
      enonce: Math.random() < 0.5
        ? `Le triangle ${t.nom} est rectangle en ${t.R}, avec ${t.adj} = ${cm(a)} et ${t.hyp} = ${cm(2 * a)}. Combien mesure l’angle ${ang} ?`
        : `Le triangle ${t.nom} est rectangle en ${t.R}, et l’hypoténuse [${t.hyp}] est deux fois plus longue que [${t.adj}]. Combien mesure l’angle ${ang} ?`,
      reponse: 60,
      unite: '°',
      solution: `${ang} = <b>60°</b>`,
      explication: `[${t.adj}] est le côté adjacent à ${ang} : cos ${ang} = ${frac(t.adj, t.hyp)} = ${frac(1, 2)} = 0,5.<br>`
        + `Or cos 60° = 0,5 : l’angle ${ang} mesure <b>60°</b>.`,
    });
  }

  // Un cosinus est toujours entre 0 et 1
  function questionPossible() {
    const POSSIBLES = [0.2, 0.35, 0.45, 0.5, 0.6, 0.75, 0.8, 0.9];
    const IMPOSSIBLES = [1.2, 1.25, 1.5, 1.8, 2, 3];
    if (Math.random() < 0.5) {
      const reponse = parmi(POSSIBLES);
      return choix({
        consigne: 'Choisis la bonne valeur',
        enonce: 'Laquelle de ces valeurs peut être le cosinus d’un angle aigu ?',
        reponse,
        pieges: RM.melanger(IMPOSSIBLES).slice(0, 3),
        ordre: 'melange',
        explication: 'L’hypoténuse est le plus long côté : côté adjacent ÷ hypoténuse est donc <b>entre 0 et 1</b>. '
          + `Seul <b>${ecrire(reponse)}</b> est plus petit que 1.`,
      });
    }
    const reponse = parmi(IMPOSSIBLES);
    return choix({
      consigne: 'Choisis la bonne valeur',
      enonce: 'Laquelle de ces valeurs ne peut pas être le cosinus d’un angle aigu ?',
      reponse,
      pieges: RM.melanger(POSSIBLES).slice(0, 3),
      ordre: 'melange',
      explication: 'Un cosinus est toujours <b>entre 0 et 1</b>, car le côté adjacent est plus court que l’hypoténuse. '
        + `<b>${ecrire(reponse)}</b> est plus grand que 1 : c’est impossible.`,
    });
  }

  const VF_COSINUS = [
    [`Si le triangle ABC est rectangle en A, alors cos ${angle('ABC')} = ${frac('AB', 'BC')}.`, true,
      `[AB] est le côté adjacent à ${angle('ABC')} et [BC] l’hypoténuse : <b>cos ${angle('ABC')} = ${frac('AB', 'BC')}</b>.`],
    ['cos 60° = 0,5.', true,
      'C’est une valeur à retenir : <b>cos 60° = 0,5</b>. L’hypoténuse est alors le double du côté adjacent.'],
    ['Le cosinus d’un angle aigu est toujours compris entre 0 et 1.', true,
      'Le côté adjacent est plus court que l’hypoténuse : leur quotient est <b>entre 0 et 1</b>.'],
    [`Si le triangle ABC est rectangle en A, alors AB = BC × cos ${angle('ABC')}.`, true,
      `cos ${angle('ABC')} = ${frac('AB', 'BC')}, donc <b>AB = BC × cos ${angle('ABC')}</b>.`],
    ['Plus un angle aigu est grand, plus son cosinus est petit.', true,
      'cos 20° ≈ 0,94 ; cos 60° = 0,5 ; cos 80° ≈ 0,17 : quand l’angle grandit, son cosinus <b>diminue</b>.'],
    [`Si le triangle ABC est rectangle en A, alors cos ${angle('ABC')} = ${frac('AC', 'BC')}.`, false,
      `[AC] est en face de l’angle ${angle('ABC')} : ce n’est pas son côté adjacent. <b>cos ${angle('ABC')} = ${frac('AB', 'BC')}</b>.`],
    [`Si le triangle ABC est rectangle en A, alors cos ${angle('ABC')} = ${frac('BC', 'AB')}.`, false,
      `C’est l’inverse : cos = côté adjacent ÷ hypoténuse, donc <b>cos ${angle('ABC')} = ${frac('AB', 'BC')}</b>.`],
    ['Le cosinus d’un angle aigu peut être égal à 1,5.', false,
      'Un cosinus est toujours <b>entre 0 et 1</b>, car l’hypoténuse est le plus long côté.'],
    ['cos 30° = 0,5.', false,
      'C’est <b>cos 60°</b> qui est égal à 0,5. (cos 30° ≈ 0,87.)'],
    ['Le côté adjacent à un angle est le côté qui est en face de cet angle.', false,
      'Le côté adjacent <b>forme l’angle</b> (avec l’hypoténuse). Le côté en face de l’angle, c’est le côté opposé.'],
  ];

  ajouterEtape({
    id: '4e-geometrie-cosinus',
    banque: ['adjacent', 'adjacent', 'quotient', 'quotient', 'quotient', 'possible', 'longueur', 'longueur', 'longueur',
      'valeurCos', 'angle', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'adjacent') return questionAdjacent();
      if (sorte === 'quotient') return questionQuotient();
      if (sorte === 'possible') return questionPossible();
      if (sorte === 'longueur') return questionLongueurCos();
      if (sorte === 'valeurCos') return questionValeurCos();
      if (sorte === 'angle') return questionAngleCos();
      return vraiFauxDans(VF_COSINUS);
    },
    titreLecon: 'Le cosinus',
    lecon: `
      <h4>Le côté adjacent et l’hypoténuse</h4>
      ${F.svg(440, 190,
        F.polygone([[170, 150], [400, 150], [170, 40]]) + F.segment([170, 150], [400, 150], 'fig-accent')
        + F.angleDroit([170, 150], [400, 150], [170, 40], 16) + F.arc([400, 150], [170, 150], [170, 40], { rayon: 44 })
        + nommer([170, 150], 'A', 225) + nommer([400, 150], 'B', 315) + nommer([170, 40], 'C', 135)
        + F.texte([285, 174], 'côté adjacent à l’angle B', { classe: 'fig-petit-gras fig-texte-accent' })
        + F.texte([318, 78], 'hypoténuse', { classe: 'fig-petit-gras' })
        + F.texte([158, 95], 'côté opposé', { classe: 'fig-petit', ancre: 'end' }),
        'Le triangle ABC rectangle en A, l’angle en B marqué')}
      <p>Dans un triangle rectangle, le <b>côté adjacent</b> à un angle aigu est le côté qui forme cet angle avec l’hypoténuse.
        Le troisième côté, en face de l’angle, est le <b>côté opposé</b> : il ne sert pas pour le cosinus.</p>
      <h4>Le cosinus d’un angle aigu</h4>
      <p><b>cos = côté adjacent ÷ hypoténuse</b>. Si ABC est rectangle en A : cos ${angle('ABC')} = ${frac('AB', 'BC')}.</p>
      <p>Pour calculer une longueur : AB = BC × cos ${angle('ABC')} et BC = AB ÷ cos ${angle('ABC')}.</p>
      <p>👉 <i>${angle('ABC')} = 40°, BC = 10&nbsp;cm, et on donne cos 40° ≈ 0,77 : AB ≈ 10 × 0,77 = 7,7&nbsp;cm.</i></p>
      <p>👉 <i>AB = 3&nbsp;cm et BC = 5&nbsp;cm : cos ${angle('ABC')} = ${frac(3, 5)} = 0,6.</i></p>
      <p>À retenir : <b>cos 60° = 0,5</b> (l’hypoténuse est le double du côté adjacent).
        Un cosinus est toujours <b>entre 0 et 1</b>, et plus l’angle est grand, plus son cosinus est petit.
        Pour trouver un angle, on calcule son cosinus et on le cherche parmi les valeurs données.
        (Et les deux angles aigus d’un triangle rectangle font 90° ensemble.)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> « CAH » : <b>C</b>osinus = <b>A</b>djacent ÷ <b>H</b>ypoténuse.</div>
      <p>⚠️ Le côté adjacent dépend de l’angle : pour l’angle en B c’est [AB], mais pour l’angle en C c’est [AC].</p>
    `,
  });

  // ======================================================================
  // 4. Le théorème de Thalès (des triangles emboîtés)
  // ======================================================================
  // Les noms des points « S, B, C, M, N » : le sommet commun S, M sur [SB], N sur [SC], et (MN) // (BC)
  // (des noms choisis pour qu'aucun segment ne se lise comme un mot)
  const CONFIGS_THALES = ['ABCMP', 'RSTMN', 'KFGMN', 'PRSMN', 'SBCMN', 'TFGKH'];
  // Le coefficient de réduction p/q du petit triangle SMN par rapport au grand triangle SBC
  const RAPPORTS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5]];
  // Une fraction pour un bouton : « 1/3 », ou « 2 » si elle vaut un entier
  const fractionTexte = (n, d) => { const [a, b] = simplifier(n, d); return b === 1 ? ecrire(a) : fracTexte(a, b); };

  // Une configuration de Thalès : les noms, et toutes les longueurs (en cm), qui tombent juste.
  // Le grand triangle a trois côtés différents, multiples de q (pour que ceux du petit triangle soient entiers).
  function configThales(rapports = RAPPORTS) {
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
      bon = x < y && y < z && z < 0.85 * (x + y) && x >= 0.4 * z;
    }
    const k = p / q;
    const L = { [S + M]: sb * k, [S + B]: sb, [S + N]: sc * k, [S + C]: sc, [M + N]: bc * k, [B + C]: bc, [M + B]: sb - sb * k };
    return { S, B, C, M, N, p, q, k, sb, sc, bc, L, petit: S + M + N, grand: S + B + C };
  }
  const hypothesesThales = c => `${c.M} ∈ [${c.S}${c.B}], ${c.N} ∈ [${c.S}${c.C}] et (${c.M}${c.N}) // (${c.B}${c.C})`;
  const egalitesThales = c => enFractions(`${c.S}${c.M}/${c.S}${c.B} = ${c.S}${c.N}/${c.S}${c.C} = ${c.M}${c.N}/${c.B}${c.C}`);

  // La direction (en degrés) perpendiculaire à la droite (AB), du côté opposé au point I
  function directionDehors(A, B, I) {
    const d = direction(A, B);
    const m = milieu(A, B);
    const essai = vers(m, 10, d + 90);
    return distance(essai, I) > distance(m, I) ? d + 90 : d - 90;
  }
  // Le dessin : le grand triangle SBC avec ses vraies longueurs, le sommet S le plus souvent en haut
  function figureThales(c) {
    const angleS = Math.acos((c.sb ** 2 + c.sc ** 2 - c.bc ** 2) / (2 * c.sb * c.sc));
    let pts = [[0, 0], [c.sb, 0], [c.sc * Math.cos(angleS), -c.sc * Math.sin(angleS)]];
    // On tourne la figure pour que le milieu de l'angle en S pointe vers le bas (S en haut), vers la droite ou vers la gauche
    const cible = parmi([90, 90, 90, 0, 180]) + entier(-15, 15);
    pts = tourner(pts, cible + angleS / 2 / RAD);
    if (Math.random() < 0.5) pts = pts.map(([x, y]) => [-x, y]);
    const [S, B, C] = ajuster(pts, 300, 200, 460, 270);
    const M = entre(S, B, c.k);
    const N = entre(S, C, c.k);
    const G = centreDe([S, B, C]);
    return F.svg(460, 270, F.polygone([S, B, C]) + F.segment(M, N, 'fig-accent')
      + nommerSommet(S, c.S, G) + nommerSommet(B, c.B, G) + nommerSommet(C, c.C, G)
      + nommer(M, c.M, directionDehors(S, B, C), 18) + nommer(N, c.N, directionDehors(S, C, B), 18),
    'Deux triangles emboîtés');
  }

  // Quelle égalité est vraie ?
  function questionEgaliteThales() {
    const c = configThales();
    const { S, B, C, M, N } = c;
    const avecFigure = Math.random() < 0.3;
    const reponse = parmi([`${S}${M}/${S}${B} = ${S}${N}/${S}${C}`, `${S}${M}/${S}${B} = ${M}${N}/${B}${C}`, `${S}${N}/${S}${C} = ${M}${N}/${B}${C}`]);
    const q = choix({
      consigne: avecFigure ? 'Regarde la figure' : 'Choisis la bonne égalité',
      enonce: avecFigure
        ? `Sur la figure, (${M}${N}) // (${B}${C}). Quelle égalité est vraie ?${figureThales(c)}`
        : `${hypothesesThales(c)}. Quelle égalité est vraie ?`,
      reponse,
      pieges: [`${S}${M}/${S}${B} = ${S}${C}/${S}${N}`, `${S}${M}/${S}${B} = ${S}${N}/${N}${C}`, `${S}${B}/${S}${M} = ${S}${N}/${S}${C}`,
        `${S}${M}/${M}${B} = ${S}${N}/${S}${C}`, `${M}${N}/${B}${C} = ${S}${B}/${S}${M}`],
      solution: `<b>${enFractions(reponse)}</b>`,
      explication: `D’après le théorème de Thalès : ${egalitesThales(c)}.<br>`
        + `Dans chaque fraction, une longueur du petit triangle ${c.petit} en haut, la longueur qui lui correspond dans le grand triangle ${c.grand} en bas.`,
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
    ]);
    return choix({
      consigne: 'Complète l’égalité de Thalès',
      enonce: `${hypothesesThales(c)}. ${expression}`,
      reponse,
      pieges,
      explication: `D’après le théorème de Thalès : ${egalitesThales(c)}. Il manque <b>${reponse}</b>.`,
    });
  }

  // Calculer une longueur (réponse à taper). avecMB : on donne MB au lieu de SB (le piège classique)
  function questionCalculThales(avecMB = false) {
    const c = configThales();
    const { S, B, C, M, N } = c;
    const L = c.L;
    const PAIRES = [[S + M, S + B], [S + N, S + C], [M + N, B + C]];
    // La paire connue (ses deux longueurs sont données) et la paire où il manque une longueur
    const [connue, cible] = avecMB ? [PAIRES[0], parmi(PAIRES.slice(1))] : RM.melanger(PAIRES).slice(0, 2);
    const petiteInconnue = Math.random() < 0.5;
    const [inconnue, donnee] = petiteInconnue ? [cible[0], cible[1]] : [cible[1], cible[0]];
    const x = L[inconnue];
    const donnees = avecMB
      ? [`${S}${M} = ${cm(L[S + M])}`, `${M}${B} = ${cm(L[M + B])}`, `${donnee} = ${cm(L[donnee])}`]
      : RM.melanger([`${connue[0]} = ${cm(L[connue[0]])}`, `${connue[1]} = ${cm(L[connue[1]])}`, `${donnee} = ${cm(L[donnee])}`]);
    const figure = Math.random() < 0.5 ? figureThales(c) : '';
    // L'égalité avec les nombres, et le calcul (produit en croix)
    const ecritVal = s => (s === inconnue ? s : ecrire(L[s]));
    const calcul = petiteInconnue
      ? `${inconnue} = ${ecrire(L[donnee])} × ${ecrire(L[connue[0]])} ÷ ${ecrire(L[connue[1]])}`
      : `${inconnue} = ${ecrire(L[donnee])} × ${ecrire(L[connue[1]])} ÷ ${ecrire(L[connue[0]])}`;
    return nombre({
      consigne: 'Calcule',
      enonce: `${hypothesesThales(c)}, avec ${donnees[0]}, ${donnees[1]} et ${donnees[2]}. Calcule ${inconnue}.${figure}`,
      reponse: x,
      unite: 'cm',
      solution: `${inconnue} = <b>${cm(x)}</b>`,
      explication: (avecMB ? `⚠️ D’abord ${S}${B} = ${S}${M} + ${M}${B} = ${ecrire(L[S + M])} + ${ecrire(L[M + B])} = ${cm(L[S + B])}.<br>` : '')
        + `D’après le théorème de Thalès, ${frac(connue[0], connue[1])} = ${frac(cible[0], cible[1])}, `
        + `donc ${frac(ecrire(L[connue[0]]), ecrire(L[connue[1]]))} = ${frac(ecritVal(cible[0]), ecritVal(cible[1]))}.<br>`
        + `${calcul} = <b>${cm(x)}</b>.`,
    });
  }

  // Le coefficient de réduction, en fraction (des boutons)
  function questionCoefficientChoix() {
    const c = configThales(RAPPORTS.filter(([p, q]) => 2 * p !== q)); // (avec 1/2, les pièges deviendraient « 1 » et « 2 »)
    const { S, B, M } = c;
    const sm = c.L[S + M];
    return choix({
      consigne: 'Choisis le coefficient',
      enonce: `${hypothesesThales(c)}. ${S}${M} = ${cm(sm)} et ${S}${B} = ${cm(c.sb)}. Le triangle ${c.petit} est une réduction du triangle ${c.grand} de coefficient…`,
      reponse: fractionTexte(c.p, c.q),
      pieges: [fractionTexte(c.q, c.p), fractionTexte(c.p, c.q - c.p), fractionTexte(c.q - c.p, c.q)],
      explication: `Le coefficient de réduction est ${frac(S + M, S + B)} = ${frac(sm, c.sb)} = <b>${frac(c.p, c.q)}</b> : `
        + `les longueurs du petit triangle sont celles du grand, multipliées par ${frac(c.p, c.q)}. ⚠️ On divise par ${S}${B}, pas par ${M}${B}.`,
    });
  }

  // Agrandir et réduire (réponse à taper)
  function questionCoefficient() {
    const variante = parmi(['reduction', 'agrandissement', 'longueur', 'longueur', 'trouverK', 'angle']);
    if (variante === 'reduction' || variante === 'agrandissement') {
      // Le coefficient s'écrit en fraction (2/3 n'a pas d'écriture décimale) : la réponse se tape « 2/3 »
      const reduction = variante === 'reduction';
      const c = configThales();
      const [petite, grande] = parmi([[c.S + c.M, c.S + c.B], [c.S + c.N, c.S + c.C], [c.M + c.N, c.B + c.C]]);
      const [n, d] = reduction ? [c.p, c.q] : [c.q, c.p];
      const [haut, bas] = reduction ? [petite, grande] : [grande, petite];
      const resultat = d === 1 ? ecrire(n) : frac(n, d);
      return fraction({
        consigne: 'Écris une fraction irréductible',
        enonce: `${hypothesesThales(c)}. `
          + (reduction ? `Le triangle ${c.petit} est une réduction du triangle ${c.grand}. ` : `Le triangle ${c.grand} est un agrandissement du triangle ${c.petit}. `)
          + `${petite} = ${cm(c.L[petite])} et ${grande} = ${cm(c.L[grande])}. Quel est le coefficient ${reduction ? 'de réduction' : 'd’agrandissement'} ?`,
        n,
        d,
        solution: `coefficient = <b>${resultat}</b>`,
        explication: `coefficient = ${haut} ÷ ${bas} = ${frac(c.L[haut], c.L[bas])} = <b>${resultat}</b>. `
          + (reduction ? '(Une réduction a un coefficient plus petit que 1.)' : '(Un agrandissement a un coefficient plus grand que 1.)'),
      });
    }
    const k = parmi([0.5, 0.25, 0.75, 0.2, 0.4, 1.5, 2, 2.5, 3]);
    const x = parmi([4, 6, 8, 10, 12, 16, 20]);
    const sorte = k < 1 ? 'une réduction' : 'un agrandissement';
    if (variante === 'trouverK') {
      return nombre({
        consigne: 'Calcule le coefficient',
        enonce: `Dans ${sorte}, un segment de ${cm(x)} devient un segment de ${cm(net(x * k))}. Quel est le coefficient ? (Écris-le en nombre décimal.)`,
        reponse: k,
        explication: `coefficient = nouvelle longueur ÷ ancienne longueur = ${ecrire(net(x * k))} ÷ ${ecrire(x)} = <b>${ecrire(k)}</b>.`,
      });
    }
    if (variante === 'angle') {
      const a = entier(25, 75);
      return nombre({
        consigne: 'Réfléchis bien',
        enonce: `Un triangle a un angle de ${a}°. On fait ${sorte} de ce triangle, de coefficient ${ecrire(k)}. Combien mesure cet angle dans le nouveau triangle ?`,
        reponse: a,
        unite: '°',
        solution: `<b>${a}°</b>`,
        explication: `Un agrandissement ou une réduction change les longueurs, mais <b>pas les angles</b> : l’angle mesure toujours <b>${a}°</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `On fait ${sorte} d’un triangle, de coefficient ${ecrire(k)}. Un côté mesure ${cm(x)}. Combien mesure ce côté dans le nouveau triangle ?`,
      reponse: net(x * k),
      unite: 'cm',
      explication: `Toutes les longueurs sont multipliées par le coefficient : ${ecrire(x)} × ${ecrire(k)} = <b>${cm(net(x * k))}</b>.`,
    });
  }

  // Ce qu'il faut savoir pour utiliser le théorème
  function questionConditions() {
    const c = configThales();
    const { S, B, C, M, N } = c;
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `${M} ∈ [${S}${B}] et ${N} ∈ [${S}${C}]. Pour utiliser le théorème de Thalès, il faut aussi savoir que…`,
      reponse: `(${M}${N}) // (${B}${C})`,
      pieges: [`(${M}${N}) ⊥ (${B}${C})`, `${S}${M} = ${M}${B}`, `(${S}${B}) ⊥ (${S}${C})`, `(${S}${N}) // (${B}${C})`],
      garder: [parmi([`(${S}${M}) // (${N}${C})`, `(${M}${N}) // (${S}${B})`])],
      explication: `Le théorème de Thalès s’utilise quand les droites (${M}${N}) et (${B}${C}) sont <b>parallèles</b> : `
        + `alors ${egalitesThales(c)}.`,
    });
  }

  const VF_THALES = [
    [`Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors ${frac('RM', 'RS')} = ${frac('RN', 'RT')}.`, true,
      `C’est le théorème de Thalès : ${frac('RM', 'RS')} = ${frac('RN', 'RT')} = ${frac('MN', 'ST')}.`],
    ['Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors le triangle RMN est une réduction du triangle RST.', true,
      'Les longueurs de RMN sont proportionnelles à celles de RST : c’est une <b>réduction</b>, de coefficient RM ÷ RS.'],
    ['Un agrandissement de coefficient 2 double toutes les longueurs.', true,
      'Toutes les longueurs sont <b>multipliées par 2</b>.'],
    ['Une réduction a un coefficient compris entre 0 et 1.', true,
      'Les longueurs deviennent plus petites : on les multiplie par un nombre <b>entre 0 et 1</b>.'],
    ['Un agrandissement ne change pas les angles.', true,
      'Les longueurs changent, mais les angles <b>restent les mêmes</b>.'],
    [`Si M ∈ [RS] et N ∈ [RT], alors on a toujours ${frac('RM', 'RS')} = ${frac('RN', 'RT')}.`, false,
      'Il faut aussi que <b>(MN) // (ST)</b> : sans droites parallèles, on ne peut pas utiliser le théorème de Thalès.'],
    [`Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors ${frac('RM', 'RS')} = ${frac('RN', 'NT')}.`, false,
      `On compare avec les côtés <b>entiers</b> du grand triangle : ${frac('RM', 'RS')} = ${frac('RN', 'RT')}. [NT] n’est pas un côté du grand triangle.`],
    ['Un agrandissement de coefficient 2 multiplie les angles par 2.', false,
      'Un agrandissement multiplie les longueurs, mais il <b>ne change pas les angles</b>.'],
    ['Un agrandissement a un coefficient plus petit que 1.', false,
      'Pour agrandir, on multiplie par un nombre <b>plus grand que 1</b>. Plus petit que 1, c’est une réduction.'],
    [`Si M ∈ [RS], N ∈ [RT] et (MN) // (ST), alors ${frac('MN', 'ST')} = ${frac('RS', 'RM')}.`, false,
      `La fraction de droite est renversée : il faut ${frac('MN', 'ST')} = <b>${frac('RM', 'RS')}</b> (le petit triangle en haut).`],
  ];

  ajouterEtape({
    id: '4e-geometrie-thales',
    banque: ['egalite', 'egalite', 'completer', 'completer', 'conditions', 'coefficientChoix',
      'calcul', 'calcul', 'calcul', 'calculMB', 'coefficient', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'egalite') return questionEgaliteThales();
      if (sorte === 'completer') return questionCompleter();
      if (sorte === 'conditions') return questionConditions();
      if (sorte === 'coefficientChoix') return questionCoefficientChoix();
      if (sorte === 'calcul') return questionCalculThales();
      if (sorte === 'calculMB') return questionCalculThales(true);
      if (sorte === 'coefficient') return questionCoefficient();
      return vraiFauxDans(VF_THALES);
    },
    titreLecon: 'Le théorème de Thalès',
    lecon: `
      <h4>Deux triangles emboîtés</h4>
      ${F.svg(420, 200,
        F.polygone([[210, 25], [60, 175], [370, 175]]) + F.segment([150, 85], [274, 85], 'fig-accent')
        + nommer([210, 25], 'R', 90, 18) + nommer([60, 175], 'S', 225) + nommer([370, 175], 'T', 315)
        + nommer([150, 85], 'M', 150, 18) + nommer([274, 85], 'N', 30, 18),
        'Le triangle RST et le segment [MN] parallèle à [ST]')}
      <p>Si M ∈ [RS], N ∈ [RT] et <b>(MN) // (ST)</b>, alors :
        <b>${frac('RM', 'RS')} = ${frac('RN', 'RT')} = ${frac('MN', 'ST')}</b>.</p>
      <p>En haut, les côtés du petit triangle RMN ; en bas, les côtés du grand triangle RST qui leur correspondent.</p>
      <p>👉 <i>RM = 3&nbsp;cm, RS = 9&nbsp;cm et RT = 12&nbsp;cm : ${frac(3, 9)} = ${frac('RN', 12)}, donc RN = 12 × 3 ÷ 9 = 4&nbsp;cm.</i></p>
      <h4>Agrandir, réduire</h4>
      <p>Le triangle RMN est une <b>réduction</b> du triangle RST : toutes ses longueurs sont celles de RST multipliées par
        le même nombre k = RM ÷ RS, le <b>coefficient</b> (👉 <i>RM = 3&nbsp;cm et RS = 9&nbsp;cm : k = ${frac(3, 9)} = ${frac(1, 3)}</i>).
        Une réduction a un coefficient entre 0 et 1 ; un agrandissement,
        un coefficient plus grand que 1. Les angles, eux, ne changent pas.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour calculer la longueur qui manque, écris l’égalité avec les nombres,
        puis fais un <b>produit en croix</b>.</div>
      <p>⚠️ Sans droites parallèles, pas de Thalès ! Et on divise par le côté entier RS, pas par le morceau MS.</p>
    `,
  });

  // ======================================================================
  // 5. La translation
  // ======================================================================
  const carreaux = n => (n > 1 ? `${n}&nbsp;carreaux` : '1&nbsp;carreau');
  // Le trajet d'une translation sur le quadrillage, en mots : « 3 carreaux vers la droite et 2 carreaux vers le haut »
  // (dc : de combien de colonnes vers la droite ; dl : de combien de lignes vers le bas)
  function trajet(dc, dl) {
    const morceaux = [];
    if (dc) morceaux.push(`${carreaux(Math.abs(dc))} vers la ${dc > 0 ? 'droite' : 'gauche'}`);
    if (dl) morceaux.push(`${carreaux(Math.abs(dl))} vers le ${dl > 0 ? 'bas' : 'haut'}`);
    return morceaux.join(' et ');
  }
  // Une flèche de P vers Q (le trajet de la translation)
  function fleche(P, Q, classe = 'fig-accent') {
    const d = direction(P, Q);
    return F.segment(P, Q, classe) + F.ligne([vers(Q, 12, d + 150), Q, vers(Q, 12, d - 150)], classe);
  }
  const memePoint = (P, Q) => P[0] === Q[0] && P[1] === Q[1];

  // L'image d'un point sur un quadrillage : un seul des points proposés est le bon
  function questionImage() {
    const g = grille(12, 8, 26, 30);
    const pixel = ([c, l]) => [g.X(c), g.Y(l)];
    const dans = ([c, l]) => c >= 0 && c <= 12 && l >= 0 && l <= 8;
    let dc;
    let dl;
    do { dc = entier(-4, 4); dl = entier(-3, 3); } while (Math.abs(dc) + Math.abs(dl) < 2);
    let A;
    let B;
    let M;
    let image;
    do {
      A = [entier(0, 12), entier(0, 8)];
      B = [A[0] + dc, A[1] + dl];
      M = [entier(0, 12), entier(0, 8)];
      image = [M[0] + dc, M[1] + dl];
    } while (!dans(B) || !dans(image) || [A, B].some(P => distance(P, M) < 3 || distance(P, image) < 2));
    // Les erreurs classiques : le trajet dans le mauvais sens, les colonnes et les lignes échangées, un carreau de trop…
    const sens = [M[0] - dc, M[1] - dl];
    const erreurs = [[M[0] + dl, M[1] + dc], [M[0] + dc, M[1] - dl], [M[0] - dc, M[1] + dl],
      [M[0] + dc + 1, M[1] + dl], [M[0] + dc - 1, M[1] + dl], [M[0] + dc, M[1] + dl + 1], [M[0] + dc, M[1] + dl - 1]];
    const pris = [A, B, M, image];
    const faux = [];
    [sens, ...RM.melanger(erreurs)].forEach(P => {
      if (faux.length < 3 && dans(P) && !pris.some(Q => memePoint(P, Q))) {
        faux.push(P);
        pris.push(P);
      }
    });
    const candidats = RM.melanger([image, ...faux]);
    const noms = RM.melanger(['C', 'F', 'G', 'H', 'K', 'N', 'P', 'R', 'S', 'T']).slice(0, candidats.length);
    const nomImage = noms[candidats.indexOf(image)];
    const nomSens = faux.includes(sens) ? noms[candidats.indexOf(sens)] : '';
    const points = [{ P: pixel(A), nom: 'A' }, { P: pixel(B), nom: 'B' }, { P: pixel(M), nom: 'M' },
      ...candidats.map((P, i) => ({ P: pixel(P), nom: noms[i] }))];
    const dessin = g.html + fleche(pixel(A), pixel(B))
      + nommerPointsProches(points, L => distanceAuSegment(L, pixel(A), pixel(B)));
    return choix({
      consigne: 'Regarde le quadrillage',
      enonce: `Quel point est l’image de M par la translation qui transforme A en B ?${F.svg(g.largeur, g.hauteur, dessin, 'Un quadrillage et une translation')}`,
      reponse: nomImage,
      pieges: noms.filter(n => n !== nomImage),
      explication: `Pour aller de A à B, on se déplace de ${trajet(dc, dl)}. On fait <b>le même trajet</b> en partant de M : `
        + `on arrive au point <b>${nomImage}</b>.`
        + (nomSens ? `<br>⚠️ ${nomSens}, c’est le trajet dans le mauvais sens (de B vers A).` : ''),
    });
  }

  // Translation, symétrie axiale ou symétrie centrale ? Des figures sans axe ni centre de symétrie
  // (sinon, deux réponses seraient possibles), avec un point à l'intérieur pour écrire leur numéro
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
  const BOUTONS_TRANSFORMATIONS = ['une translation', 'une symétrie axiale', 'une symétrie centrale'];
  const EXPLICATIONS_TRANSFORMATIONS = {
    'une translation': 'La figure 2 a seulement <b>glissé</b> : elle n’est ni retournée ni tournée. C’est une <b>translation</b>.',
    'une symétrie axiale': 'La figure 2 est <b>retournée</b>, comme dans un miroir : c’est une <b>symétrie axiale</b>.',
    'une symétrie centrale': 'La figure 2 a fait un <b>demi-tour</b> : elle est « tête en bas », sans être retournée comme dans un miroir. '
      + 'C’est une <b>symétrie centrale</b>.',
  };

  function questionReconnaitre() {
    const reponse = parmi(BOUTONS_TRANSFORMATIONS);
    const [COLONNES, LIGNES] = [14, 8];
    let f;
    let image;
    let tous;
    do {
      f = orienter(parmi(FORMES));
      const w = Math.max(...f.points.map(p => p[0]));
      const h = Math.max(...f.points.map(p => p[1]));
      const e = entier(1, 3); // l'écart entre les deux figures
      if (reponse === 'une translation') {
        const [dx, dy] = [w + e, entier(-2, 2)];
        image = ([x, y]) => [x + dx, y + dy];
      } else if (reponse === 'une symétrie axiale' && Math.random() < 0.6) {
        image = ([x, y]) => [2 * w + e - x, y]; // l'axe : la verticale x = w + e/2
      } else if (reponse === 'une symétrie axiale') {
        image = ([x, y]) => [x, 2 * h + e - y]; // l'axe : l'horizontale y = h + e/2
      } else {
        const j = entier(-1, 1);
        image = ([x, y]) => [2 * w + e - x, h + j - y]; // le centre : (w + e/2 ; (h + j)/2)
      }
      tous = [...f.points, ...f.points.map(image)];
    } while (Math.max(...tous.map(p => p[0])) - Math.min(...tous.map(p => p[0])) > COLONNES
      || Math.max(...tous.map(p => p[1])) - Math.min(...tous.map(p => p[1])) > LIGNES);
    // On place le tout au milieu du quadrillage
    const ox = Math.floor((COLONNES - (Math.max(...tous.map(p => p[0])) - Math.min(...tous.map(p => p[0])))) / 2) - Math.min(...tous.map(p => p[0]));
    const oy = Math.floor((LIGNES - (Math.max(...tous.map(p => p[1])) - Math.min(...tous.map(p => p[1])))) / 2) - Math.min(...tous.map(p => p[1]));
    const g = grille(COLONNES, LIGNES, 24, 20);
    const pixel = ([x, y]) => [g.X(x + ox), g.Y(y + oy)];
    const dessin = g.html
      + F.polygone(f.points.map(pixel)) + F.polygone(f.points.map(image).map(pixel))
      + F.texte(pixel(f.dedans), '1') + F.texte(pixel(image(f.dedans)), '2');
    return choix({
      consigne: 'Regarde les deux figures',
      enonce: `Par quelle transformation passe-t-on de la figure 1 à la figure 2 ?${F.svg(g.largeur, g.hauteur, dessin, 'Deux figures sur un quadrillage')}`,
      reponse,
      choix: BOUTONS_TRANSFORMATIONS,
      explication: EXPLICATIONS_TRANSFORMATIONS[reponse],
    });
  }

  // Une translation transforme A en B et C en D : quel est le parallélogramme ?
  function questionParallelogramme() {
    const [A, B, C, D] = parmi([['A', 'B', 'C', 'D'], ['M', 'N', 'P', 'R'], ['F', 'G', 'H', 'K'], ['R', 'S', 'T', 'K']]);
    const reponse = parmi([A + B + D + C, A + C + D + B]);
    return choix({
      consigne: 'Choisis le bon nom',
      enonce: `Une translation transforme ${A} en ${B} et ${C} en ${D}. Quel quadrilatère est un parallélogramme ?`,
      reponse,
      pieges: [A + B + C + D, A + C + B + D],
      explication: `[${A}${B}] et [${C}${D}] sont parallèles, de même longueur et dans le même sens. `
        + `On fait le tour ${reponse.split('').join(' → ')} : <b>${reponse}</b> est un parallélogramme. (Attention à l’ordre des lettres !)`,
    });
  }

  // Les segments : une translation transforme A en B et C en D
  function questionSegments() {
    const [A, B, C, D] = parmi([['A', 'B', 'C', 'D'], ['M', 'N', 'P', 'R'], ['F', 'G', 'H', 'K'], ['R', 'S', 'T', 'K']]);
    const debut = `Une translation transforme ${A} en ${B} et ${C} en ${D}.`;
    const [question, reponse, pieges, explication] = parmi([
      [`Quelle est l’image du segment [${A}${C}] ?`, `[${B}${D}]`, [`[${C}${D}]`, `[${A}${B}]`, `[${A}${D}]`],
        `L’image de [${A}${C}] relie les images de ${A} et de ${C}, c’est-à-dire ${B} et ${D} : c’est <b>[${B}${D}]</b>.`],
      [`Quel segment a toujours la même longueur que [${A}${B}] ?`, `[${C}${D}]`, [`[${A}${C}]`, `[${A}${D}]`, `[${B}${C}]`],
        `${A} et ${C} glissent de la même longueur : ${A}${B} = <b>${C}${D}</b>. (${A}${B}${D}${C} est un parallélogramme.)`],
      [`Quel segment est toujours parallèle à [${A}${C}] ?`, `[${B}${D}]`, [`[${C}${D}]`, `[${A}${D}]`, `[${B}${C}]`],
        `[${B}${D}] est l’image de [${A}${C}], et l’image d’un segment lui est <b>parallèle</b>. (${A}${B}${D}${C} est un parallélogramme.)`],
    ]);
    return choix({ consigne: 'Choisis le bon segment', enonce: `${debut} ${question}`, reponse, pieges, explication });
  }

  // L'image d'une figure entière : la bonne, celle du trajet à l'envers, et celle d'un trajet qui monte au lieu de descendre
  // (ou l'inverse)
  function questionImageFigure() {
    const [COLONNES, LIGNES] = [18, 9];
    const g = grille(COLONNES, LIGNES, 20, 24);
    // (des formes de 3 carreaux au plus de côté, pour que les quatre figures tiennent sans se toucher)
    const petites = FORMES.filter(fo => Math.max(...fo.points.flat()) <= 3);
    const f = orienter(parmi(petites));
    const w = Math.max(...f.points.map(p => p[0]));
    const h = Math.max(...f.points.map(p => p[1]));
    const dc = parmi([1, -1]) * entier(w + 1, 4);
    const dl = parmi([1, -1]) * (h === 3 ? 3 : entier(2, 3));
    // Les figures : F (au départ), puis les trois candidates, décalées de (dc ; dl) carreaux
    const decalages = { F: [0, 0], bonne: [dc, dl], envers: [-dc, -dl], haut: [dc, -dl] };
    // Le tout à droite du quadrillage (colonnes 7 à 18) ; la flèche de A vers B à gauche (colonnes 0 à 5)
    const x0 = 7 + Math.abs(dc) + Math.floor((COLONNES - 7 - (2 * Math.abs(dc) + w)) / 2);
    const y0 = Math.abs(dl) + Math.floor((LIGNES - (2 * Math.abs(dl) + h)) / 2);
    const pixel = ([x, y], [ex, ey]) => [g.X(x0 + x + ex), g.Y(y0 + y + ey)];
    const numeros = RM.melanger(['1', '2', '3']);
    const noms = { F: 'F', bonne: numeros[0], envers: numeros[1], haut: numeros[2] };
    let dessin = g.html;
    Object.entries(decalages).forEach(([cle, e]) => {
      dessin += F.polygone(f.points.map(P => pixel(P, e))) + F.texte(pixel(f.dedans, e), noms[cle]);
    });
    const A = [dc > 0 ? entier(0, 5 - dc) : entier(-dc, 5), dl > 0 ? entier(0, LIGNES - dl) : entier(-dl, LIGNES)];
    const [pA, pB] = [[g.X(A[0]), g.Y(A[1])], [g.X(A[0] + dc), g.Y(A[1] + dl)]];
    dessin += fleche(pA, pB) + nommer(pA, 'A', direction(pB, pA), 16) + nommer(pB, 'B', direction(pA, pB), 18);
    return choix({
      consigne: 'Regarde le quadrillage',
      enonce: `Quelle figure est l’image de la figure F par la translation qui transforme A en B ?${F.svg(g.largeur, g.hauteur, dessin, 'Une figure et trois images possibles')}`,
      reponse: `figure ${noms.bonne}`,
      choix: ['figure 1', 'figure 2', 'figure 3'],
      explication: `Pour aller de A à B, on se déplace de ${trajet(dc, dl)}. On fait glisser la figure F du même trajet : `
        + `c’est la <b>figure ${noms.bonne}</b>.<br>⚠️ La figure ${noms.envers} a fait le trajet dans le mauvais sens.`,
    });
  }

  // Des calculs avec ce que la translation conserve (et pas seulement recopier le nombre de l'énoncé)
  function questionCalculTranslation() {
    const variante = parmi(['perimetre', 'triangle', 'carreaux']);
    if (variante === 'perimetre') {
      const [x, y] = [entierOuDemi(2, 9), entierOuDemi(2, 9)];
      return nombre({
        consigne: 'Calcule',
        enonce: `Une translation transforme A en B et C en D (C n’est pas sur la droite (AB)). AB = ${cm(x)} et AC = ${cm(y)}. `
          + 'Quel est le périmètre du parallélogramme ABDC ?',
        reponse: net(2 * (x + y)),
        unite: 'cm',
        explication: `ABDC est un parallélogramme : CD = AB = ${cm(x)} et BD = AC = ${cm(y)}.<br>`
          + `Périmètre = ${ecrire(x)} + ${ecrire(y)} + ${ecrire(x)} + ${ecrire(y)} = <b>${cm(net(2 * (x + y)))}</b>.`,
      });
    }
    if (variante === 'triangle') {
      let cotes;
      do { cotes = [entier(3, 12), entier(3, 12), entier(3, 12)].sort((u, v) => u - v); } while (cotes[2] >= cotes[0] + cotes[1]);
      const [a, b, c] = RM.melanger(cotes);
      return nombre({
        consigne: 'Calcule',
        enonce: `Un triangle a des côtés de ${cm(a)}, ${cm(b)} et ${cm(c)}. Quel est le périmètre de son image par une translation ?`,
        reponse: a + b + c,
        unite: 'cm',
        explication: `La translation conserve les longueurs : l’image a aussi des côtés de ${a}, ${b} et ${cm(c)}.<br>`
          + `Périmètre = ${a} + ${b} + ${c} = <b>${cm(a + b + c)}</b>.`,
      });
    }
    // Lire le trajet sur le quadrillage
    const g = grille(12, 7, 26, 30);
    let dc;
    let dl;
    do { dc = entier(-5, 5); dl = entier(-4, 4); } while (dc === 0 || dl === 0 || (Math.abs(dc) < 2 && Math.abs(dl) < 2));
    const A = [dc > 0 ? entier(0, 12 - dc) : entier(-dc, 12), dl > 0 ? entier(0, 7 - dl) : entier(-dl, 7)];
    const [pA, pB] = [[g.X(A[0]), g.Y(A[1])], [g.X(A[0] + dc), g.Y(A[1] + dl)]];
    // (on demande un déplacement d'au moins 2 carreaux : l'unité « carreaux » ne doit pas trahir la réponse)
    const horizontal = Math.abs(dl) < 2 || (Math.abs(dc) >= 2 && Math.random() < 0.5);
    const sens = horizontal ? (dc > 0 ? 'vers la droite' : 'vers la gauche') : (dl > 0 ? 'vers le bas' : 'vers le haut');
    const n = horizontal ? Math.abs(dc) : Math.abs(dl);
    return nombre({
      consigne: 'Regarde le quadrillage',
      enonce: `La translation qui transforme A en B fait glisser chaque point de combien de carreaux ${sens} ?`
        + F.svg(g.largeur, g.hauteur, g.html + fleche(pA, pB) + nommer(pA, 'A', direction(pB, pA), 16) + nommer(pB, 'B', direction(pA, pB), 18),
          'Une translation sur un quadrillage'),
      reponse: n,
      unite: 'carreaux',
      explication: `Pour aller de A à B, on se déplace de ${trajet(dc, dl)}. Chaque point glisse donc de <b>${carreaux(n)}</b> ${sens}.`,
    });
  }

  const PROPRIETES_TRANSLATION = [
    ['Par une translation, qu’est-ce qui change ?', 'la position', ['les longueurs', 'les angles', 'les aires'],
      'Une translation fait seulement glisser la figure : ses longueurs, ses angles et son aire ne changent pas. Seule sa <b>position</b> change.'],
    ['Par une translation, l’image d’une droite (d) est une droite ___ à (d).', 'parallèle', ['perpendiculaire', 'sécante'],
      'La translation fait glisser la droite sans la tourner : son image est <b>parallèle</b> à (d).'],
    [`Par une translation, l’image d’un cercle de rayon ${cm(3)} est un cercle de rayon…`, cm(3), [cm(6), cm(1.5), cm(9)],
      'Une translation conserve les longueurs : le rayon reste <b>3&nbsp;cm</b>.'],
    ['Quelle transformation fait glisser une figure, sans la tourner ni la retourner ?', 'une translation',
      ['une symétrie axiale', 'une symétrie centrale', 'un agrandissement'],
      'Faire glisser une figure, c’est une <b>translation</b>.'],
    ['Quelle transformation retourne une figure, comme un miroir ?', 'une symétrie axiale',
      ['une translation', 'une symétrie centrale', 'un agrandissement'],
      'La <b>symétrie axiale</b> retourne la figure, comme un pliage ou un miroir.'],
    ['Quelle transformation fait faire un demi-tour à une figure ?', 'une symétrie centrale',
      ['une translation', 'une symétrie axiale', 'un agrandissement'],
      'La <b>symétrie centrale</b> fait tourner la figure d’un demi-tour autour du centre.'],
    ['Si une translation transforme A en B et C en D, alors ABDC est toujours…', 'un parallélogramme',
      ['un rectangle', 'un losange', 'un carré'],
      'ABDC est toujours un <b>parallélogramme</b> (peut-être aplati). Ce n’est un rectangle, un losange ou un carré que dans des cas particuliers.'],
    ['Par une translation, l’image d’un segment est…', 'un segment de même longueur',
      ['un segment deux fois plus long', 'un segment perpendiculaire', 'un segment plus court'],
      'Une translation conserve les longueurs : l’image d’un segment est <b>un segment de même longueur</b>, parallèle au premier.'],
  ];

  // Ce que la translation conserve (réponse à taper)
  function questionConservation() {
    const variante = parmi(['trajet', 'parallelogramme', 'segment', 'angle', 'aire', 'perimetre']);
    const l = entierOuDemi(2, 12);
    if (variante === 'trajet') {
      return nombre({
        consigne: 'Calcule',
        enonce: `La translation qui transforme A en B transforme M en M′, et AB = ${cm(l)}. Combien mesure MM′ ?`,
        reponse: l,
        unite: 'cm',
        explication: `Chaque point glisse de <b>la même longueur</b> que de A à B : MM′ = AB = <b>${cm(l)}</b>.`,
      });
    }
    if (variante === 'parallelogramme') {
      const [donne, cherche, egal] = parmi([['AC', 'BD', '[AC] et [BD]'], ['AB', 'CD', '[AB] et [CD]']]);
      return nombre({
        consigne: 'Calcule',
        enonce: `Une translation transforme A en B et C en D, et ${donne} = ${cm(l)}. Combien mesure ${cherche} ?`,
        reponse: l,
        unite: 'cm',
        explication: `ABDC est un parallélogramme : ses côtés opposés ${egal} ont la même longueur. ${cherche} = ${donne} = <b>${cm(l)}</b>.`,
      });
    }
    if (variante === 'segment') {
      return nombre({
        consigne: 'Calcule',
        enonce: `Par une translation, le segment [GH] a pour image le segment [G′H′], et GH = ${cm(l)}. Combien mesure G′H′ ?`,
        reponse: l,
        unite: 'cm',
        explication: `Une translation <b>conserve les longueurs</b> : G′H′ = GH = <b>${cm(l)}</b>.`,
      });
    }
    if (variante === 'angle') {
      const a = entier(20, 160);
      return nombre({
        consigne: 'Calcule',
        enonce: `Par une translation, l’angle ${angle('RST')} a pour image l’angle ${angle('R′S′T′')}, et ${angle('RST')} = ${a}°. Combien mesure ${angle('R′S′T′')} ?`,
        reponse: a,
        unite: '°',
        solution: `${angle('R′S′T′')} = <b>${a}°</b>`,
        explication: `Une translation <b>conserve les angles</b> : ${angle('R′S′T′')} = ${angle('RST')} = <b>${a}°</b>.`,
      });
    }
    const valeur = entier(8, 60);
    const [mot, unite] = variante === 'aire' ? ['une aire', 'cm²'] : ['un périmètre', 'cm'];
    return nombre({
      consigne: 'Calcule',
      enonce: `Un triangle a ${mot} de ${mesure(valeur, unite)}. ${variante === 'aire' ? 'Quelle est l’aire' : 'Quel est le périmètre'} de son image par une translation ?`,
      reponse: valeur,
      unite,
      explication: `L’image est la même figure, qui a seulement glissé : ${variante === 'aire' ? 'l’aire' : 'le périmètre'} `
        + `ne change pas. Il reste <b>${mesure(valeur, unite)}</b>.`,
    });
  }

  const VF_TRANSLATION = [
    ['Une translation conserve les longueurs.', true, 'Une translation fait glisser la figure : les longueurs <b>ne changent pas</b>.'],
    ['Une translation conserve les angles.', true, 'La figure glisse sans se déformer : les angles <b>ne changent pas</b>.'],
    ['Par une translation, l’image d’une droite est une droite parallèle.', true,
      'La droite glisse sans tourner : son image lui est <b>parallèle</b>.'],
    ['Une translation transforme A en B et C en D. Alors AC = BD.', true,
      'ABDC est un parallélogramme : ses côtés opposés [AC] et [BD] ont <b>la même longueur</b>.'],
    ['Par une translation, une figure glisse sans tourner.', true,
      'C’est bien ça : une translation fait <b>glisser</b> la figure, sans la tourner ni la retourner.'],
    ['Une translation retourne la figure, comme un miroir.', false,
      'C’est la <b>symétrie axiale</b> qui retourne la figure. La translation la fait seulement glisser.'],
    ['La translation qui transforme A en B transforme aussi B en A.', false,
      'Elle fait glisser B encore plus loin, dans le même sens. Pour revenir de B à A, il faut le trajet <b>dans l’autre sens</b>.'],
    ['Par une translation, l’aire d’une figure est multipliée par 2.', false,
      'Une translation ne change pas les dimensions : l’aire <b>reste la même</b>.'],
    ['Une translation transforme A en B et C en D. Alors ABCD est un parallélogramme.', false,
      'Attention à l’ordre des lettres : c’est <b>ABDC</b> qui est un parallélogramme (A → B → D → C).'],
    ['Une translation fait faire un demi-tour à la figure.', false,
      'C’est la <b>symétrie centrale</b> qui fait faire un demi-tour. La translation fait seulement glisser la figure.'],
  ];

  ajouterEtape({
    id: '4e-geometrie-translation',
    banque: ['image', 'image', 'imageFigure', 'reconnaitre', 'parallelogramme', 'segments', 'segments', 'segments', 'proprietes', 'proprietes',
      'conservation', 'calculs', 'calculs', 'calculs', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'image') return questionImage();
      if (sorte === 'reconnaitre') return questionReconnaitre();
      if (sorte === 'parallelogramme') return questionParallelogramme();
      if (sorte === 'segments') return questionSegments();
      if (sorte === 'imageFigure') return questionImageFigure();
      if (sorte === 'calculs') return questionCalculTranslation();
      if (sorte === 'proprietes') return choixDans('Choisis la bonne réponse', PROPRIETES_TRANSLATION);
      if (sorte === 'conservation') return questionConservation();
      return vraiFauxDans(VF_TRANSLATION);
    },
    titreLecon: 'La translation',
    lecon: (() => {
      const g = grille(11, 6, 24, 24);
      const p = ([c, l]) => [g.X(c), g.Y(l)];
      // A est le sommet de droite : la flèche de A vers A′ ne traverse pas le triangle
      const [A, B, C] = [[4, 5], [1, 5], [1, 2]];
      const image = ([c, l]) => [c + 5, l - 2];
      const figure = F.svg(g.largeur, g.hauteur, g.html
        + F.polygone([A, B, C].map(p)) + F.polygone([A, B, C].map(image).map(p)) + fleche(p(A), p(image(A)))
        + nommer(p(A), 'A', 315) + nommer(p(B), 'B', 225) + nommer(p(C), 'C', 135)
        + nommer(p(image(A)), 'A′', 0, 22) + nommer(p(image(B)), 'B′', 225) + nommer(p(image(C)), 'C′', 135),
      'Un triangle et son image par une translation');
      return `
      <h4>Faire glisser une figure</h4>
      ${figure}
      <p>La <b>translation qui transforme A en A′</b> fait glisser chaque point dans la même direction, dans le même sens
        et de la même longueur que de A à A′. 👉 <i>Ici : 5 carreaux vers la droite et 2 carreaux vers le haut.</i></p>
      <p>Si la translation qui transforme A en B transforme C en D, alors <b>ABDC est un parallélogramme</b>
        (aplati si C est sur la droite (AB)).</p>
      <p>Une translation <b>conserve</b> les longueurs, les angles, les aires et le parallélisme.
        L’image d’une droite est une droite parallèle ; l’image d’un segment est un segment de même longueur.</p>
      <table>
        <tr><th>translation</th><td>la figure <b>glisse</b></td></tr>
        <tr><th>symétrie axiale</th><td>la figure est <b>retournée</b>, comme dans un miroir</td></tr>
        <tr><th>symétrie centrale</th><td>la figure fait un <b>demi-tour</b></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> sur un quadrillage, compte les carreaux pour aller de A à B
        (vers la droite ou la gauche, puis vers le haut ou le bas), et refais le même trajet à partir de chaque point.</div>
      <p>⚠️ Attention au sens : la translation qui transforme A en B va de A vers B, pas de B vers A !</p>
    `;
    })(),
  });

  // ======================================================================
  // 6. Les droites du triangle
  // ======================================================================
  // H, le pied de la perpendiculaire à la droite (BC) qui passe par A
  function projete(A, B, C) {
    const [ux, uy] = [C[0] - B[0], C[1] - B[1]];
    return entre(B, C, ((A[0] - B[0]) * ux + (A[1] - B[1]) * uy) / (ux * ux + uy * uy));
  }
  // Le point où la demi-droite qui part de P dans la direction d coupe le segment [AB] (ou null)
  function coupe(P, d, A, B) {
    const vect = (u, v) => u[0] * v[1] - u[1] * v[0];
    const e = [B[0] - A[0], B[1] - A[1]];
    const w = [A[0] - P[0], A[1] - P[1]];
    const den = vect(d, e);
    if (Math.abs(den) < 1e-9) return null;
    const t = vect(w, e) / den;
    const s = vect(w, d) / den;
    return t > 0 && s >= 0 && s <= 1 ? [P[0] + t * d[0], P[1] + t * d[1]] : null;
  }
  // Le milieu de deux directions (en degrés), du côté du plus petit angle
  function milieuAngles(a, b) {
    let e = b - a;
    while (e > 180) e -= 360;
    while (e < -180) e += 360;
    return a + e / 2;
  }

  // Un triangle aux trois angles aigus, avec AB ≠ AC (sinon la médiatrice de [BC] passerait par A, et les droites se confondraient).
  // Le sommet A est à 1,5 unité au moins de la médiatrice de [BC] (BC mesure 10 unités), pour qu'on voie bien la différence.
  function triangleRemarquable() {
    const xA = parmi([entier(25, 35), entier(65, 75)]) / 10;
    const yA = entier(55, 75) / 10;
    const P = tourner([[xA, -yA], [0, 0], [10, 0]], parmi([0, 0, 0, 180, 90, -90]) + entier(-12, 12));
    return ajuster(P, 290, 180, 460, 270);
  }

  const DROITES = ['une médiatrice', 'une hauteur', 'une médiane', 'une bissectrice'];
  // Le triangle, et en orange : la médiatrice de [BC], ou la hauteur, la médiane ou la bissectrice issue de A, avec leur codage
  function figureRemarquable(sorte, [nA, nB, nC]) {
    const [A, B, C] = triangleRemarquable();
    const G = centreDe([A, B, C]);
    const I = milieu(B, C);
    const traits = parmi([1, 2]);
    let dessin = F.polygone([A, B, C]);
    if (sorte === 'une médiatrice') {
      const L = distance(B, C);
      let n = [(B[1] - C[1]) / L, (C[0] - B[0]) / L];
      if ((A[0] - I[0]) * n[0] + (A[1] - I[1]) * n[1] < 0) n = [-n[0], -n[1]]; // vers l'intérieur du triangle
      const X = coupe(I, n, A, B) || coupe(I, n, A, C);
      dessin += F.segment([I[0] - 30 * n[0], I[1] - 30 * n[1]], [X[0] + 30 * n[0], X[1] + 30 * n[1]], 'fig-accent')
        + F.angleDroit(I, C, [I[0] + n[0], I[1] + n[1]], 12) + F.codage(B, I, traits) + F.codage(I, C, traits);
    } else if (sorte === 'une hauteur') {
      const H = projete(A, B, C);
      dessin += F.segment(A, H, 'fig-accent') + F.angleDroit(H, distance(H, B) > distance(H, C) ? B : C, A, 12);
    } else if (sorte === 'une médiane') {
      dessin += F.segment(A, I, 'fig-accent') + F.codage(B, I, traits) + F.codage(I, C, traits);
    } else {
      // La bissectrice coupe [BC] en K, avec BK ÷ KC = AB ÷ AC ; les deux moitiés de l'angle ont le même codage
      const K = entre(B, C, distance(A, B) / (distance(A, B) + distance(A, C)));
      dessin += F.segment(A, K, 'fig-accent');
      [[B, K], [K, C]].forEach(([U, V]) => {
        const m = milieuAngles(direction(A, U), direction(A, V));
        dessin += F.arc(A, U, V, { rayon: 40, classe: 'fig-marque' }) + F.segment(vers(A, 33, m), vers(A, 47, m), 'fig-marque');
      });
    }
    dessin += nommerSommet(A, nA, G) + nommerSommet(B, nB, G) + nommerSommet(C, nC, G);
    return F.svg(460, 270, dessin, 'Un triangle et une droite remarquable');
  }

  function questionReconnaitreDroite() {
    const sorte = parmi(DROITES);
    const nom = parmi(TRIANGLES);
    const [A, B, C] = RM.melanger(nom.split(''));
    const cote = `[${seg(nom, B, C)}]`;
    const EXPLICATIONS = {
      'une médiatrice': `Le trait orange est perpendiculaire au côté ${cote} (angle droit) et passe par son milieu (même codage) : `
        + `c’est <b>la médiatrice</b> de ${cote}.`,
      'une hauteur': `Le trait orange part du sommet ${A} et arrive sur le côté opposé ${cote} en formant un angle droit : `
        + `c’est <b>la hauteur</b> issue de ${A}.`,
      'une médiane': `Le trait orange part du sommet ${A} et arrive au milieu du côté opposé ${cote} (même codage) : `
        + `c’est <b>la médiane</b> issue de ${A}.`,
      'une bissectrice': `Le trait orange partage l’angle ${angle(B + A + C)} en deux angles de même mesure (même codage) : `
        + `c’est <b>la bissectrice</b> de cet angle.`,
    };
    return choix({
      consigne: 'Regarde le codage',
      enonce: `Qu’a-t-on tracé en orange dans le triangle ${nom} ?${figureRemarquable(sorte, [A, B, C])}`,
      reponse: sorte,
      choix: DROITES,
      explication: EXPLICATIONS[sorte],
    });
  }

  const DEFINITIONS_REMARQUABLES = [
    ['La droite perpendiculaire à un segment en son milieu est…', 'la médiatrice', ['la hauteur', 'la médiane', 'la bissectrice'],
      'Perpendiculaire au segment et passant par son milieu : c’est <b>la médiatrice</b> du segment.'],
    ['Dans un triangle, la droite qui passe par un sommet et par le milieu du côté opposé est…', 'une médiane',
      ['une hauteur', 'une médiatrice', 'une bissectrice'],
      'Un sommet et le milieu du côté opposé : c’est <b>une médiane</b>. (Elle n’est pas forcément perpendiculaire à ce côté.)'],
    ['Dans un triangle, la droite issue d’un sommet et perpendiculaire au côté opposé est…', 'une hauteur',
      ['une médiane', 'une médiatrice', 'une bissectrice'],
      'Elle part d’un sommet et forme un angle droit avec le côté opposé : c’est <b>une hauteur</b>.'],
    ['La demi-droite qui partage un angle en deux angles de même mesure est…', 'la bissectrice',
      ['la médiatrice', 'la médiane', 'la hauteur'],
      'Elle coupe l’angle en deux angles égaux : c’est <b>la bissectrice</b> de l’angle.'],
    ['Le centre du cercle circonscrit à un triangle est le point où se coupent ses trois…', 'médiatrices',
      ['hauteurs', 'médianes', 'bissectrices'],
      'Le centre du cercle circonscrit est à égale distance des trois sommets : il est sur les trois <b>médiatrices</b>.'],
    ['Le cercle circonscrit à un triangle passe par…', 'ses trois sommets',
      ['les milieux des côtés', 'les pieds des hauteurs', 'son centre'],
      'Le cercle circonscrit au triangle est le cercle qui passe par <b>ses trois sommets</b>.'],
    ['Le triangle RST est rectangle en R. Le centre de son cercle circonscrit est…', 'le milieu de [ST]',
      ['le milieu de [RS]', 'le milieu de [RT]', 'le point R'],
      'Dans un triangle rectangle, le centre du cercle circonscrit est <b>le milieu de l’hypoténuse</b>, ici [ST].'],
    ['Tous les points de la médiatrice de [AB] sont…', 'à égale distance de A et de B',
      ['sur le segment [AB]', 'plus près de A que de B', 'sur la droite (AB)'],
      'C’est la propriété de la médiatrice : chacun de ses points est <b>à égale distance de A et de B</b>.'],
  ];

  // La hauteur, la médiane, la bissectrice issue d'un sommet (avec des lettres au hasard)
  function questionRelative() {
    const nom = parmi(TRIANGLES);
    const [X, Y, Z] = RM.melanger(nom.split(''));
    const oppose = seg(nom, Y, Z);
    const [c1, c2] = [seg(nom, X, Y), seg(nom, X, Z)];
    const variante = parmi(['hauteur', 'hauteur', 'relative', 'mediane', 'bissectrice']);
    if (variante === 'hauteur') {
      return choix({
        consigne: 'Choisis la bonne droite',
        enonce: `Dans le triangle ${nom}, la hauteur issue de ${X} est perpendiculaire à…`,
        reponse: `(${oppose})`,
        pieges: [`(${c1})`, `(${c2})`],
        explication: `La hauteur issue de ${X} passe par ${X} et elle est perpendiculaire au côté opposé : la droite <b>(${oppose})</b>.`,
      });
    }
    if (variante === 'relative') {
      return choix({
        consigne: 'Choisis le bon sommet',
        enonce: `Dans le triangle ${nom}, la hauteur relative au côté [${oppose}] passe par le sommet…`,
        reponse: X,
        pieges: [Y, Z],
        explication: `La hauteur relative à [${oppose}] est perpendiculaire à (${oppose}) et passe par le sommet opposé : <b>${X}</b>.`,
      });
    }
    if (variante === 'mediane') {
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `Dans le triangle ${nom}, la médiane issue de ${X} passe par…`,
        reponse: `le milieu de [${oppose}]`,
        pieges: [`le milieu de [${c1}]`, `le milieu de [${c2}]`],
        explication: `La médiane issue de ${X} relie ${X} au milieu du côté opposé : <b>le milieu de [${oppose}]</b>.`,
      });
    }
    // La bissectrice : un petit calcul (la moitié de l'angle, ou l'angle entier)
    const moitie = entier(12, 70);
    const ang = angle(Y + X + Z);
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Calcule',
        enonce: `Dans le triangle ${nom}, l’angle ${ang} mesure ${2 * moitie}°. Sa bissectrice le partage en deux angles. Combien mesure chacun d’eux ?`,
        reponse: moitie,
        unite: '°',
        solution: `<b>${moitie}°</b>`,
        explication: `La bissectrice partage l’angle en deux angles <b>de même mesure</b> : ${2 * moitie}° ÷ 2 = <b>${moitie}°</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `Dans le triangle ${nom}, la bissectrice de l’angle ${ang} forme avec le côté [${c1}] un angle de ${moitie}°. Combien mesure l’angle ${ang} ?`,
      reponse: 2 * moitie,
      unite: '°',
      solution: `${ang} = <b>${2 * moitie}°</b>`,
      explication: `La bissectrice partage l’angle ${ang} en deux angles de même mesure, ${moitie}° chacun : `
        + `${ang} = 2 × ${moitie}° = <b>${2 * moitie}°</b>.`,
    });
  }

  // Des longueurs : médiatrice, cercle circonscrit, triangle rectangle (réponse à taper)
  function questionDistanceDroites() {
    const variante = parmi(['mediatrice', 'perimetre', 'circonscrit', 'diametre', 'rayon', 'rayon', 'milieu', 'hypotenuse']);
    const l = entierOuDemi(2, 12);
    if (variante === 'mediatrice') {
      const [X, Y] = RM.melanger(['B', 'C', 'D', 'F', 'G', 'H', 'K', 'N', 'P', 'R', 'S', 'T']).slice(0, 2);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point M est sur la médiatrice du segment [${X}${Y}], et M${X} = ${cm(l)}. Combien mesure M${Y} ?`,
        reponse: l,
        unite: 'cm',
        explication: `Tout point de la médiatrice de [${X}${Y}] est <b>à égale distance</b> de ${X} et de ${Y} : M${Y} = M${X} = <b>${cm(l)}</b>.`,
      });
    }
    if (variante === 'perimetre') {
      // M est sur la médiatrice de [XY] : le triangle MXY est isocèle en M (et il faut MX > XY ÷ 2 pour qu'il existe)
      const [X, Y] = RM.melanger(['B', 'C', 'D', 'F', 'G', 'H', 'K', 'N', 'P', 'R', 'S', 'T']).slice(0, 2);
      const base = entier(3, 10);
      const cote = entier(Math.floor(base / 2) + 1, 12);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point M est sur la médiatrice du segment [${X}${Y}], avec M${X} = ${cm(cote)} et ${X}${Y} = ${cm(base)}. `
          + `Quel est le périmètre du triangle M${X}${Y} ?`,
        reponse: 2 * cote + base,
        unite: 'cm',
        explication: `M est sur la médiatrice de [${X}${Y}], donc M${Y} = M${X} = ${cm(cote)}.<br>`
          + `Périmètre = ${cote} + ${cote} + ${base} = <b>${cm(2 * cote + base)}</b>.`,
      });
    }
    if (variante === 'diametre') {
      const nom = parmi(['ABC', 'BCD', 'MPT', 'ACD']);
      const X = parmi(nom.split(''));
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point O est le centre du cercle circonscrit au triangle ${nom}, et O${X} = ${cm(l)}. Quel est le diamètre de ce cercle ?`,
        reponse: 2 * l,
        unite: 'cm',
        explication: `Le cercle circonscrit passe par ${X} : son rayon est O${X} = ${cm(l)}. Son diamètre est le double : `
          + `2 × ${ecrire(l)} = <b>${cm(2 * l)}</b>.`,
      });
    }
    if (variante === 'circonscrit') {
      const nom = parmi(['ABC', 'BCD', 'MPT', 'ACD']);
      const [X, Y] = RM.melanger(nom.split(''));
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point O est le centre du cercle circonscrit au triangle ${nom}, et O${X} = ${cm(l)}. Combien mesure O${Y} ?`,
        reponse: l,
        unite: 'cm',
        explication: `Le cercle circonscrit passe par les trois sommets : ils sont tous à la même distance de O, le rayon. `
          + `O${Y} = O${X} = <b>${cm(l)}</b>.`,
      });
    }
    const t = unTriangle(TRIANGLES.filter(n => !n.includes('K')));
    const h = entier(4, 24);
    if (variante === 'hypotenuse') {
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, et son cercle circonscrit a un rayon de ${cm(l)}. Combien mesure ${t.PQ} ?`,
        reponse: 2 * l,
        unite: 'cm',
        explication: `[${t.PQ}] est l’hypoténuse : c’est un <b>diamètre</b> du cercle circonscrit, dont le centre est son milieu. `
          + `${t.PQ} = 2 × ${ecrire(l)} = <b>${cm(2 * l)}</b>.`,
      });
    }
    if (variante === 'milieu') {
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, ${t.PQ} = ${cm(h)} et K est le milieu de [${t.PQ}]. Combien mesure ${t.R}K ?`,
        reponse: h / 2,
        unite: 'cm',
        explication: `K, le milieu de l’hypoténuse, est le centre du cercle circonscrit : K${t.R} = K${t.P} = K${t.Q}. `
          + `Donc ${t.R}K = ${ecrire(h)} ÷ 2 = <b>${cm(h / 2)}</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `Le triangle ${t.nom} est rectangle en ${t.R}, et ${t.PQ} = ${cm(h)}. Quel est le rayon de son cercle circonscrit ?`,
      reponse: h / 2,
      unite: 'cm',
      explication: `Le centre du cercle circonscrit est le milieu de l’hypoténuse [${t.PQ}] : le rayon est la moitié de l’hypoténuse. `
        + `${ecrire(h)} ÷ 2 = <b>${cm(h / 2)}</b>.`,
    });
  }

  const VF_REMARQUABLES = [
    ['Tout point de la médiatrice de [AB] est à égale distance de A et de B.', true,
      'C’est la propriété de la médiatrice : si M est sur la médiatrice de [AB], alors <b>MA = MB</b>.'],
    ['Les trois médiatrices d’un triangle se coupent en un même point.', true,
      'Elles se coupent en un même point : le <b>centre du cercle circonscrit</b> au triangle.'],
    ['Le centre du cercle circonscrit à un triangle rectangle est le milieu de son hypoténuse.', true,
      'Oui : l’hypoténuse est un <b>diamètre</b> du cercle circonscrit.'],
    ['Une hauteur d’un triangle passe par un sommet.', true,
      'La hauteur issue d’un sommet passe par <b>ce sommet</b> et elle est perpendiculaire au côté opposé.'],
    ['La bissectrice d’un angle le partage en deux angles de même mesure.', true,
      'C’est sa définition : elle coupe l’angle <b>en deux angles égaux</b>.'],
    ['La médiane issue d’un sommet est toujours perpendiculaire au côté opposé.', false,
      'La médiane passe par le <b>milieu</b> du côté opposé, mais elle n’est pas forcément perpendiculaire à ce côté.'],
    ['La médiatrice d’un côté d’un triangle passe toujours par le sommet opposé.', false,
      'Elle passe par le milieu du côté, perpendiculairement, mais <b>pas forcément</b> par le sommet opposé.'],
    ['Le centre du cercle circonscrit est le point où se coupent les trois hauteurs.', false,
      'Le centre du cercle circonscrit est le point où se coupent les trois <b>médiatrices</b>.'],
    ['Une médiane passe par les milieux de deux côtés du triangle.', false,
      'Une médiane passe par <b>un sommet</b> et par le milieu du côté opposé.'],
    ['Un triangle n’a qu’une seule hauteur.', false,
      'Un triangle a <b>trois hauteurs</b> : une issue de chaque sommet.'],
  ];

  ajouterEtape({
    id: '4e-geometrie-droites-remarquables',
    banque: ['reconnaitre', 'reconnaitre', 'reconnaitre', 'definition', 'definition', 'definition', 'relative', 'relative',
      'distance', 'distance', 'distance', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'reconnaitre') return questionReconnaitreDroite();
      if (sorte === 'definition') return choixDans('Choisis la bonne réponse', DEFINITIONS_REMARQUABLES);
      if (sorte === 'relative') return questionRelative();
      if (sorte === 'distance') return questionDistanceDroites();
      return vraiFauxDans(VF_REMARQUABLES);
    },
    titreLecon: 'Les droites du triangle',
    lecon: (() => {
      // Le triangle ABC, ses trois médiatrices et son cercle circonscrit (de centre O)
      const O = [210, 128];
      const [A, B, C] = [100, 215, 330].map(d => vers(O, 100, d));
      let dessin = F.cercle(O, 100, 'fig-fin') + F.polygone([A, B, C]);
      [[A, B], [B, C], [C, A]].forEach(([U, V], i) => {
        const I = milieu(U, V);
        const d = direction(O, I);
        dessin += F.segment(vers(O, -28, d), vers(I, 26, d), 'fig-accent') + F.angleDroit(I, V, O, 10)
          + F.codage(U, I, i + 1) + F.codage(I, V, i + 1);
      });
      dessin += nommer(A, 'A', 100) + nommer(B, 'B', 215) + nommer(C, 'C', 330) + nommer(O, 'O', 125, 24);
      return `
      <h4>Les quatre droites remarquables</h4>
      <table>
        <tr><th>la médiatrice d’un côté</th><td>perpendiculaire à ce côté, en son milieu</td></tr>
        <tr><th>la hauteur issue d’un sommet (on dit aussi : relative au côté opposé)</th><td>passe par ce sommet, perpendiculaire au côté opposé</td></tr>
        <tr><th>la médiane issue d’un sommet</th><td>passe par ce sommet et par le milieu du côté opposé</td></tr>
        <tr><th>la bissectrice d’un angle</th><td>partage cet angle en deux angles de même mesure</td></tr>
      </table>
      <p>Tout point de la médiatrice de [AB] est <b>à égale distance</b> de A et de B. La bissectrice partage l’angle en deux angles
        de même mesure : si l’angle mesure 64°, chacun des deux mesure 32°.</p>
      <h4>Le cercle circonscrit</h4>
      ${F.svg(420, 256, dessin, 'Le triangle ABC, ses médiatrices et son cercle circonscrit')}
      <p>Les trois médiatrices d’un triangle se coupent en un même point O : le <b>centre du cercle circonscrit</b>,
        le cercle qui passe par les trois sommets (OA = OB = OC). Les trois hauteurs, de même, se coupent en un même point.</p>
      <p>Dans un <b>triangle rectangle</b>, le centre du cercle circonscrit est le <b>milieu de l’hypoténuse</b> :
        le rayon est la moitié de l’hypoténuse. 👉 <i>Si l’hypoténuse [BC] mesure 10&nbsp;cm et que K est son milieu,
        alors KA = KB = KC = 5&nbsp;cm.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde le codage ! Médiane = un milieu ; hauteur = un angle droit ;
        médiatrice = un milieu <b>et</b> un angle droit ; bissectrice = deux angles égaux.</div>
      <p>⚠️ Une hauteur ne passe pas forcément par le milieu du côté opposé, et une médiane n’est pas forcément perpendiculaire à ce côté.</p>
    `;
    })(),
  });
})();
