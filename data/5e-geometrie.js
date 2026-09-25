// Renard Malin — Maths, niveau 5e : les 6 étapes de la Clairière de la Géométrie
//
// Les questions sont fabriquées au hasard : on tire les longueurs, les angles et les points, le code calcule
// la bonne réponse et dessine la figure (en SVG), avec ses vraies mesures. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, entierSauf, ecrire, mesure, net, angle, angleTexte, ESPACE,
    choix, nombre, vraiFaux, ajouterEtape, figures,
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
  // Un point (une petite croix) et son nom, écrit à « distance » pixels dans la direction « degres »
  function nommer(P, nom, degres, distance = 20) {
    const [dx, dy] = vers([0, 0], distance, degres);
    return F.point(P, nom, { dx, dy });
  }
  // Des points proches les uns des autres ({ P, nom }) : chaque nom est écrit du côté libre de son point
  // (on essaie 8 places autour de la croix, et on garde celle qui est la plus loin des autres croix et des noms déjà écrits)
  function nommerPointsProches(points) {
    const places = [];
    return points.map(({ P, nom }) => {
      let meilleure = null;
      let meilleurScore = -Infinity;
      [45, 135, 315, 225, 0, 180, 90, 270].forEach(degres => {
        const L = vers(P, 17, degres);
        const score = Math.min(
          ...points.filter(q => q.P !== P).map(q => Math.hypot(L[0] - q.P[0], L[1] - q.P[1])),
          ...places.map(l => Math.hypot(L[0] - l[0], L[1] - l[1]) - 3),
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
  // Des lettres différentes pour nommer les points (O est gardée pour les centres ;
  // on évite I, J, Q, U, V, W, X, Y, Z, qui se confondent ou servent ailleurs,
  // et les voyelles A et E, ainsi que L, pour ne pas écrire des mots : « CAR », « SAC », « MA », « LE », « SE »…)
  const LETTRES = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'M', 'N', 'P', 'R', 'S', 'T'];
  const lettres = (n, interdites = []) => RM.melanger(LETTRES.filter(l => !interdites.includes(l))).slice(0, n);
  // Des prénoms de toutes les communautés du pays
  const PRENOMS = ['Kalia', 'Teva', 'Maëva', 'Sione', 'Wakana', 'Minh', 'Léa', 'Tom', 'Hinano', 'Noa'];
  const FILLES = ['Kalia', 'Maëva', 'Wakana', 'Léa', 'Hinano']; // pour écrire « peut-elle » ou « peut-il »
  const pronom = prenom => (FILLES.includes(prenom) ? 'elle' : 'il');
  // Un nombre entier ou un nombre avec un demi (2 ; 2,5 ; 3…), entre min et max
  function entierOuDemi(min, max) {
    const possibles = [];
    for (let x = Math.ceil(min * 2); x <= Math.floor(max * 2); x++) possibles.push(x / 2);
    return parmi(possibles);
  }
  // Une longueur en cm : un entier ou un nombre avec un demi
  const longueurAuHasard = (min, max) => (Math.random() < 0.6 ? entier(Math.ceil(min), Math.floor(max)) : entierOuDemi(min, max));
  const cm = x => mesure(x, 'cm');
  const deg = m => `${m}°`;

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
  // Un nombre de degrés à taper (la solution s'écrit « 65° », collé)
  const nombreDegres = ({ consigne = 'Calcule', enonce, reponse, explication }) =>
    nombre({ consigne, enonce, reponse, unite: '°', solution: `<b>${reponse}°</b>`, explication });

  // Trois pièges pour des boutons rangés du plus petit au plus grand : on choisit d'abord, au hasard, la place
  // de la bonne réponse (1re, 2e, 3e ou 4e), puis des pièges en dessous et au-dessus d'elle.
  // On prend d'abord les erreurs classiques, puis des erreurs de calcul (réponse ± écart) pour compléter.
  function troisPieges(reponse, classiques, { ecarts = [10, 20, 5], min = 1, max = Infinity } = {}) {
    const possible = v => v >= min && v <= max && v !== reponse;
    const cl = [...new Set(classiques.map(net))].filter(possible);
    const secours = [...new Set(ecarts.flatMap(e => [net(reponse - e), net(reponse + e)]))].filter(v => possible(v) && !cl.includes(v));
    const dessous = [...RM.melanger(cl.filter(v => v < reponse)), ...secours.filter(v => v < reponse)];
    const dessus = [...RM.melanger(cl.filter(v => v > reponse)), ...secours.filter(v => v > reponse)];
    const places = [0, 1, 2, 3].filter(k => dessous.length >= k && dessus.length >= 3 - k);
    const k = parmi(places);
    return [...dessous.slice(0, k), ...dessus.slice(0, 3 - k)];
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
  // La direction libre autour du point S : le milieu du plus grand écart entre les directions déjà prises
  function directionLibre(directions) {
    const d = directions.map(x => ((x % 360) + 360) % 360).sort((a, b) => a - b);
    let meilleure = 0;
    let plusGrandEcart = -1;
    d.forEach((x, i) => {
      const suivante = i + 1 < d.length ? d[i + 1] : d[0] + 360;
      if (suivante - x > plusGrandEcart) {
        plusGrandEcart = suivante - x;
        meilleure = x + (suivante - x) / 2;
      }
    });
    return meilleure;
  }
  // Marquer l'angle ASB d'un arc orange et d'un texte (« 48° », « ? », « 1 »). Le texte est posé sur la bissectrice,
  // le plus près possible du sommet, sans toucher les traits à éviter (traits : [[U, V], …]) ni les textes déjà posés
  // (boites : la liste des cases des textes déjà écrits, complétée ici) ; l'arc est tracé juste avant le texte.
  // (La case d'un texte : 11,4 pixels par caractère sur 14 pixels de haut, pour des caractères de 19 pixels.)
  const caseTexte = (P, texte) => {
    const w = [...texte].length * 5.7 + 1;
    return [P[0] - w, P[1] - 8, P[0] + w, P[1] + 8];
  };
  const distanceCase = ([x, y], [x0, y0, x1, y1]) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));
  function distanceTraitCase(U, V, c) {
    let d = Infinity;
    for (let i = 0; i <= 40; i++) d = Math.min(d, distanceCase([U[0] + (V[0] - U[0]) * i / 40, U[1] + (V[1] - U[1]) * i / 40], c));
    return d;
  }
  const casesSeTouchent = (a, b) => a[0] < b[2] + 2 && b[0] < a[2] + 2 && a[1] < b[3] + 2 && b[1] < a[3] + 2;
  function arcAvecTexte(S, A, B, texte, traits = [], boites = []) {
    const a1 = direction(S, A);
    let ecart = direction(S, B) - a1;
    while (ecart <= -180) ecart += 360;
    while (ecart > 180) ecart -= 360;
    const bissectrice = a1 + ecart / 2;
    // Pour chaque place essayée, la marge qui reste (négative si le texte touche quelque chose) ;
    // on prend la première place sans rien toucher, ou sinon celle qui a la plus grande marge
    const marge = c => Math.min(distanceCase(S, c) - 27, ...traits.map(([U, V]) => distanceTraitCase(U, V, c) - 3),
      ...boites.map(b => (casesSeTouchent(b, c) ? -10 : 10)));
    let P;
    let c;
    let meilleure = null;
    for (let d = 30; d <= 110; d += 2) {
      P = vers(S, d, bissectrice);
      c = caseTexte(P, texte);
      const m = marge(c);
      if (!meilleure || m > meilleure.m) meilleure = { m, P, c };
      if (m >= 0) break;
    }
    ({ P, c } = meilleure);
    // L'arc : le plus grand rayon possible avant le texte, sans traverser les textes déjà posés
    const pointsArc = r => Array.from({ length: 17 }, (x, k) => vers(S, r, a1 + ecart * k / 16));
    let rayon = Math.min(60, Math.max(20, distanceCase(S, c) - 6));
    while (rayon > 16 && boites.some(b => pointsArc(rayon).some(Q => distanceCase(Q, b) < 3))) rayon -= 2;
    boites.push(c);
    // Les textes posés ensuite éviteront cet arc
    const arc = pointsArc(rayon);
    arc.slice(1).forEach((Q, k) => traits.push([arc[k], Q]));
    return F.arc(S, A, B, { rayon }) + F.texte(P, texte, { classe: 'fig-texte fig-texte-accent' });
  }
  // Les petits traits du codage d'un segment (pour que les textes les évitent)
  function traitsCodage(A, B) {
    const m = milieu(A, B);
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const n = [(A[1] - B[1]) / L * 9, (B[0] - A[0]) / L * 9];
    return [[[m[0] - n[0], m[1] - n[1]], [m[0] + n[0], m[1] + n[1]]]];
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

  // ======================================================================
  // 1. Construire un triangle : l'inégalité triangulaire
  // ======================================================================
  // Trois longueurs (en cm) : les deux petites p1 ≤ p2, puis la plus grande, selon le cas :
  // 'oui' (la plus grande est plus courte que la somme des deux autres), 'aplati' (égale) ou 'non' (plus longue)
  function troisLongueurs(cas) {
    const demis = Math.random() < 0.3;
    const tirer = (min, max) => (demis ? entierOuDemi(min, max) : entier(min, max));
    const [p1, p2] = [tirer(2, 8), tirer(2, 10)].sort((a, b) => a - b);
    const somme = net(p1 + p2);
    const ecarts = (demis ? [0.5, 1, 1.5, 2] : [1, 2, 3]).filter(e => e < p1);
    let grande = somme;
    if (cas === 'oui') grande = net(somme - parmi(ecarts));
    if (cas === 'non') grande = net(somme + parmi(demis ? [0.5, 1, 1.5, 2] : [1, 2, 3, 4]));
    return { p1, p2, grande, somme };
  }

  // Les trois côtés du triangle XYZ, avec les trois longueurs dans le désordre
  function triangleAuHasard(cas) {
    const L = troisLongueurs(cas);
    const [X, Y, Z] = lettres(3);
    const cotes = [X + Y, Y + Z, X + Z];
    const valeurs = RM.melanger([L.p1, L.p2, L.grande]);
    const iGrand = valeurs.indexOf(L.grande);
    // Le sommet opposé au plus grand côté (celui qui n'est pas dans son nom)
    const oppose = [X, Y, Z].find(s => !cotes[iGrand].includes(s));
    return { ...L, cotes, valeurs, grandCote: cotes[iGrand], oppose, nom: X + Y + Z };
  }

  const BOUTONS_CONSTRUIRE = ['oui', 'non', 'il sera aplati'];

  function questionConstruire() {
    const cas = parmi(['oui', 'oui', 'non', 'non', 'aplati']);
    const T = triangleAuHasard(cas);
    const baguettes = Math.random() < 0.3;
    const prenom = parmi(PRENOMS);
    const enonce = baguettes
      ? `${prenom} a trois baguettes de ${cm(T.valeurs[0])}, ${cm(T.valeurs[1])} et ${cm(T.valeurs[2])}. `
        + `Peut-${pronom(prenom)} former un triangle avec ces trois baguettes ?`
      : `Peut-on tracer un triangle ${T.nom} avec ${T.cotes[0]} = ${cm(T.valeurs[0])}, ${T.cotes[1]} = ${cm(T.valeurs[1])} `
        + `et ${T.cotes[2]} = ${cm(T.valeurs[2])} ?`;
    const debut = `On compare la plus grande longueur, ${cm(T.grande)}, à la somme des deux autres : `
      + `${ecrire(T.p1)} + ${ecrire(T.p2)} = ${cm(T.somme)}.<br>`;
    const fin = {
      oui: `${ecrire(T.grande)} &lt; ${ecrire(T.somme)} : <b>oui</b>, on peut tracer le triangle.`,
      non: `${ecrire(T.grande)} > ${ecrire(T.somme)} : <b>non</b>, les deux petits côtés sont trop courts pour se rejoindre.`,
      aplati: baguettes
        ? `${ecrire(T.grande)} = ${ecrire(T.somme)} : le triangle est <b>aplati</b>, ses trois sommets sont alignés.`
        : `${ecrire(T.grande)} = ${ecrire(T.somme)} : ${T.oppose} est sur le segment [${T.grandCote}], le triangle est <b>aplati</b>.`,
    }[cas];
    return choix({
      consigne: 'Choisis la réponse la plus précise',
      enonce,
      reponse: { oui: 'oui', non: 'non', aplati: 'il sera aplati' }[cas],
      choix: BOUTONS_CONSTRUIRE,
      explication: debut + fin,
    });
  }

  // Quelle longueur est possible pour le 3e côté ? (entre la différence et la somme des deux autres)
  function questionTroisiemeCote() {
    const a = entier(3, 7);
    const b = a + entier(3, 6);
    const d = b - a;
    const s = a + b;
    const reponse = entier(d + 1, s - 1);
    const pieges = troisPieges(reponse, [d, s, d - 1, s + 1, d - 2, s + 2], { ecarts: [] }).map(cm);
    const [X, Y, Z] = lettres(3);
    const prenom = parmi(PRENOMS);
    const enonce = Math.random() < 0.6
      ? `Dans le triangle ${X}${Y}${Z}, ${X}${Y} = ${cm(a)} et ${Y}${Z} = ${cm(b)}. Quelle longueur peut avoir ${X}${Z} ?`
      : `${prenom} a deux baguettes de ${cm(a)} et ${cm(b)}. Quelle 3e baguette peut-${pronom(prenom)} prendre pour former un triangle ?`;
    return choix({
      consigne: 'Choisis la seule longueur possible',
      enonce,
      reponse: cm(reponse),
      pieges,
      explication: `Le 3e côté doit être plus court que ${ecrire(a)} + ${ecrire(b)} = ${cm(s)}, et plus long que `
        + `${ecrire(b)} − ${ecrire(a)} = ${cm(d)} (sinon, le côté de ${cm(b)} serait trop long).<br>`
        + `Seul <b>${cm(reponse)}</b> convient. (Avec ${cm(d)} ou ${cm(s)}, le triangle serait aplati.)`,
    });
  }

  // La plus grande (ou la plus petite) longueur entière possible pour le 3e côté
  function questionBornes() {
    const [X, Y, Z] = lettres(3);
    const a = entier(3, 9);
    const b = entierSauf(3, 12, [a]);
    const s = a + b;
    const d = Math.abs(a - b);
    const debut = `Dans le triangle ${X}${Y}${Z}, ${X}${Y} = ${cm(a)} et ${Y}${Z} = ${cm(b)}. `
      + `La longueur ${X}${Z} est un nombre entier de centimètres.`;
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Calcule',
        enonce: `${debut} Quelle est sa plus grande valeur possible ?`,
        reponse: s - 1,
        unite: 'cm',
        explication: `${X}${Z} doit être plus court que la somme ${X}${Y} + ${Y}${Z} = ${cm(s)} (avec ${cm(s)}, le triangle serait aplati).<br>`
          + `Le plus grand nombre entier plus petit que ${ecrire(s)} est <b>${ecrire(s - 1)}</b>.`,
      });
    }
    const [grand, petit] = [Math.max(a, b), Math.min(a, b)];
    return nombre({
      consigne: 'Calcule',
      enonce: `${debut} Quelle est sa plus petite valeur possible ?`,
      reponse: d + 1,
      unite: 'cm',
      explication: `Le côté de ${cm(grand)} doit être plus court que ${ecrire(petit)} + ${X}${Z}. `
        + `Donc ${X}${Z} doit dépasser ${ecrire(grand)} − ${ecrire(petit)} = ${cm(d)} (avec ${cm(d)}, le triangle serait aplati).<br>`
        + `La plus petite valeur entière est <b>${ecrire(d + 1)}</b>.`,
    });
  }

  // Un triangle aplati : le sommet opposé au plus grand côté est sur ce côté
  function questionAplati() {
    const [X, Y, Z] = lettres(3);
    const a = longueurAuHasard(2, 8);
    const b = longueurAuHasard(2, 8);
    const s = net(a + b);
    const debut = `Le triangle ${X}${Y}${Z} est aplati, et [${X}${Z}] est son plus grand côté.`;
    const pourquoi = `Le triangle est aplati : ${Y} est sur le segment [${X}${Z}]. Donc ${X}${Y} + ${Y}${Z} = ${X}${Z}.<br>`;
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Calcule',
        enonce: `${debut} ${X}${Y} = ${cm(a)} et ${Y}${Z} = ${cm(b)}. Combien mesure ${X}${Z} ?`,
        reponse: s,
        unite: 'cm',
        explication: `${pourquoi}${X}${Z} = ${ecrire(a)} + ${ecrire(b)} = <b>${cm(s)}</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `${debut} ${X}${Z} = ${cm(s)} et ${X}${Y} = ${cm(a)}. Combien mesure ${Y}${Z} ?`,
      reponse: b,
      unite: 'cm',
      explication: `${pourquoi}${Y}${Z} = ${ecrire(s)} − ${ecrire(a)} = <b>${cm(b)}</b>.`,
    });
  }

  // Quelle inégalité suffit-il de vérifier ? (la plus grande longueur < la somme des deux autres)
  function questionInegalite() {
    let L;
    do { L = troisLongueurs(parmi(['oui', 'non', 'aplati'])); } while (L.p1 === L.p2); // deux petits côtés égaux : deux boutons pareils
    const valeurs = RM.melanger([L.p1, L.p2, L.grande]);
    // « a < b + c », avec les deux autres longueurs rangées (b ≤ c)
    const autres = i => valeurs.filter((v, j) => j !== i).sort((x, y) => x - y);
    const ecrit = i => `${ecrire(valeurs[i])} < ${ecrire(autres(i)[0])} + ${ecrire(autres(i)[1])}`;
    const iGrand = valeurs.indexOf(L.grande);
    const reponse = ecrit(iGrand);
    // Les pièges sont toujours vrais, mais ne prouvent rien : un petit côté comparé à une somme,
    // et la plus grande longueur comparée à la différence des deux autres
    const [b, c] = autres(iGrand);
    const pieges = [`${ecrire(L.grande)} > ${ecrire(c)} − ${ecrire(b)}`, ...valeurs.map((v, i) => (i === iGrand ? null : ecrit(i))).filter(Boolean)];
    const conclusion = { oui: 'c’est vrai, on peut tracer le triangle', non: 'c’est faux, on ne peut pas le tracer' };
    const ici = L.grande === L.somme ? 'ici, les deux sont égaux : le triangle serait aplati' : conclusion[L.grande < L.somme ? 'oui' : 'non'];
    return choix({
      consigne: 'Choisis la bonne inégalité',
      enonce: `Pour savoir si on peut tracer un triangle de côtés ${cm(valeurs[0])}, ${cm(valeurs[1])} et ${cm(valeurs[2])}, `
        + 'quelle inégalité suffit-il de vérifier ?',
      reponse,
      pieges,
      explication: `Il suffit de comparer la <b>plus grande</b> longueur à la somme des deux autres : <b>${reponse.replace('<', '&lt;')}</b> `
        + `(${ici}).<br>Les autres inégalités proposées sont toujours vraies : elles ne prouvent rien.`,
    });
  }

  const VF_INEGALITE = [
    ['Dans un triangle, chaque côté est plus court que la somme des deux autres.', true,
      'C’est l’<b>inégalité triangulaire</b> : dans le triangle ABC, par exemple, AC &lt; AB + BC.'],
    ['Si AB + BC = AC, alors le point B est sur le segment [AC].', true,
      'Le chemin qui passe par B est aussi court que le chemin direct : B est <b>sur le segment [AC]</b>. Le triangle ABC est aplati.'],
    ['Pour aller de A à C, le chemin le plus court est le segment [AC].', true,
      'Passer par un autre point B rallonge le chemin (ou le laisse pareil si B est sur [AC]) : AC ≤ AB + BC.'],
    ['Les trois sommets d’un triangle aplati sont alignés.', true,
      'Un triangle aplati a ses trois sommets <b>alignés</b> : la plus grande longueur est égale à la somme des deux autres.'],
    ['Si AB + BC = AC, alors B est le milieu de [AC].', false,
      'B est <b>sur</b> le segment [AC], mais pas forcément au milieu : il faudrait aussi AB = BC.'],
    ['Dans un triangle, le plus grand côté est plus long que la somme des deux autres.', false,
      'C’est l’inverse : le plus grand côté est <b>plus court</b> que la somme des deux autres. Sinon, les deux petits côtés ne se rejoindraient pas.'],
    ['Avec trois longueurs, on peut toujours tracer un triangle.', false,
      'Non : avec 2&nbsp;cm, 3&nbsp;cm et 8&nbsp;cm, par exemple, c’est impossible, car 8 > 2 + 3.'],
    ['Pour savoir si un triangle existe, il suffit de comparer le plus petit côté à la somme des deux autres.', false,
      'Le plus petit côté est toujours plus court que la somme des deux autres : cela ne prouve rien. Il faut regarder le <b>plus grand</b> côté.'],
  ];

  // Un vrai ou faux avec des longueurs tirées au hasard (jamais le cas aplati, qui se discute)
  function vraiFauxLongueurs() {
    const cas = parmi(['oui', 'non']);
    const L = troisLongueurs(cas);
    const v = RM.melanger([L.p1, L.p2, L.grande]);
    return vraiFaux({
      enonce: `On peut tracer un triangle de côtés ${cm(v[0])}, ${cm(v[1])} et ${cm(v[2])}.`,
      vrai: cas === 'oui',
      explication: `La plus grande longueur est ${cm(L.grande)}, et ${ecrire(L.p1)} + ${ecrire(L.p2)} = ${cm(L.somme)}.<br>`
        + (cas === 'oui' ? `${ecrire(L.grande)} &lt; ${ecrire(L.somme)} : on <b>peut</b> tracer ce triangle.`
          : `${ecrire(L.grande)} > ${ecrire(L.somme)} : on <b>ne peut pas</b> tracer ce triangle.`),
    });
  }

  // La figure de la leçon : un vrai triangle (4, 5, 7) et un triangle aplati (3, 4, 7)
  function figureLeconInegalite() {
    const u = 22; // pixels par cm
    const A = [20, 118];
    const C = [20 + 7 * u, 118];
    const xB = (16 - 25 + 49) / 14; // AB = 4, BC = 5, AC = 7 : la place de B (en cm)
    const B = [20 + xB * u, 118 - Math.sqrt(16 - xB * xB) * u];
    const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    let html = F.polygone([A, B, C]) + longueurDehors(A, B, '4', G) + longueurDehors(B, C, '5', G) + longueurDehors(A, C, '7', G)
      + nommer(A, 'A', 200) + nommer(B, 'B', 90) + nommer(C, 'C', -20)
      + F.texte([97, 170], '7 &lt; 4 + 5', { classe: 'fig-texte fig-petit-gras' });
    const A2 = [244, 118];
    const B2 = [244 + 3 * u, 118];
    const C2 = [244 + 7 * u, 118];
    html += F.segment(A2, C2) + nommer(A2, 'A', 90, 18) + nommer(B2, 'B', 90, 18) + nommer(C2, 'C', 90, 18)
      + F.texte(milieu(A2, B2).map((v, i) => v + 20 * i), '3') + F.texte(milieu(B2, C2).map((v, i) => v + 20 * i), '4')
      + F.texte([A2[0] + 3.5 * u, 170], '7 = 3 + 4 : aplati', { classe: 'fig-texte fig-petit-gras' });
    return F.svg(420, 185, html, 'Un triangle et un triangle aplati');
  }

  ajouterEtape({
    id: '5e-geometrie-inegalite-triangulaire',
    banque: ['construire', 'construire', 'construire', 'construire', 'troisiemeCote', 'troisiemeCote', 'inegalite', 'inegalite',
      'bornes', 'bornes', 'aplati', 'aplati', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'construire') return questionConstruire();
      if (sorte === 'troisiemeCote') return questionTroisiemeCote();
      if (sorte === 'inegalite') return questionInegalite();
      if (sorte === 'bornes') return questionBornes();
      if (sorte === 'aplati') return questionAplati();
      return Math.random() < 0.5 ? vraiFauxDans(VF_INEGALITE) : vraiFauxLongueurs();
    },
    titreLecon: 'Construire un triangle',
    lecon: `
      <h4>L’inégalité triangulaire</h4>
      ${figureLeconInegalite()}
      <p>Dans un triangle, <b>chaque côté est plus court que la somme des deux autres</b> : AC &lt; AB + BC.
        C’est l’<b>inégalité triangulaire</b> (le chemin direct est le plus court).</p>
      <h4>Peut-on tracer le triangle ?</h4>
      <p>On compare <b>la plus grande longueur</b> à la <b>somme des deux autres</b> :</p>
      <table>
        <tr><th>plus grande &lt; somme</th><td>on peut tracer le triangle 👉 <i>4, 5 et 7&nbsp;cm : 7 &lt; 4 + 5</i></td></tr>
        <tr><th>plus grande = somme</th><td>le triangle est <b>aplati</b> : ses trois sommets sont alignés 👉 <i>3, 4 et 7&nbsp;cm</i></td></tr>
        <tr><th>plus grande > somme</th><td>impossible : les deux petits côtés ne se rejoignent pas 👉 <i>2, 4 et 7&nbsp;cm</i></td></tr>
      </table>
      <p>Si AB + BC = AC, alors le point B est <b>sur le segment [AC]</b>.</p>
      <h4>La longueur du 3e côté</h4>
      <p>Si deux côtés mesurent 5&nbsp;cm et 8&nbsp;cm, le 3e côté est plus long que <b>8 − 5 = 3&nbsp;cm</b>
        et plus court que <b>8 + 5 = 13&nbsp;cm</b> (avec 3&nbsp;cm ou 13&nbsp;cm, le triangle serait aplati).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> une seule inégalité suffit, celle du <b>plus grand</b> côté.
        Si elle est vraie, les deux autres le sont forcément.</div>
      <p>⚠️ 3 &lt; 4 + 8 est vrai, et pourtant on ne peut pas tracer un triangle de côtés 3, 4 et 8&nbsp;cm, car 8 > 3 + 4 !</p>
    `,
  });

  // ======================================================================
  // 2. Les angles du triangle
  // ======================================================================
  // Un triangle dessiné avec ses vrais angles : angles[i] est l'angle au sommet noms[i] (leur somme fait 180°).
  // textes[i] : ce qui est écrit dans l'angle (« 48° », « ? »), ou '' pour ne pas le marquer.
  // codage : l'indice du sommet principal d'un triangle isocèle (on code ses deux côtés) ; droit : l'indice de l'angle droit
  function figureTriangle(noms, angles, textes, { codage = -1, droit = -1, fixe = false } = {}) {
    const [a0, a1, a2] = angles;
    // Le sommet 0 en bas à gauche, le sommet 1 en bas à droite (la base mesure 1), le sommet 2 au-dessus
    const cote02 = Math.sin(a1 * RAD) / Math.sin(a2 * RAD);
    let P = [[0, 0], [1, 0], [cote02 * Math.cos(a0 * RAD), -cote02 * Math.sin(a0 * RAD)]];
    if (!fixe) {
      if (Math.random() < 0.5) P = P.map(([x, y]) => [-x, y]); // retourné : le sommet 0 à droite
      P = tourner(P, entier(-15, 15));
    }
    P = ajuster(P, 330, 190, 460, 250);
    const G = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    let dessin = F.polygone(P);
    const traits = [[P[0], P[1]], [P[1], P[2]], [P[2], P[0]]];
    if (codage >= 0) {
      dessin += F.codage(P[codage], P[(codage + 1) % 3], 1) + F.codage(P[codage], P[(codage + 2) % 3], 1);
      traits.push(...traitsCodage(P[codage], P[(codage + 1) % 3]), ...traitsCodage(P[codage], P[(codage + 2) % 3]));
    }
    const boites = [];
    P.forEach((S, i) => {
      const A = P[(i + 1) % 3];
      const B = P[(i + 2) % 3];
      if (i === droit) dessin += F.angleDroit(S, A, B, 16);
      else if (textes[i]) dessin += arcAvecTexte(S, A, B, textes[i], traits, boites);
      dessin += nommer(S, noms[i], direction(G, S), 20);
    });
    return F.svg(460, 250, dessin, 'Un triangle et ses angles');
  }

  // Le nom de l'angle au sommet i du triangle noms (ex. : ['A', 'B', 'C'], 0 → BAC)
  const angleEn = (noms, i) => noms[(i + 1) % 3] + noms[i] + noms[(i + 2) % 3];

  // Deux angles donnés, le troisième à calculer
  function questionTroisiemeAngle() {
    const noms = lettres(3);
    let a;
    let b;
    do {
      a = entier(30, 100);
      b = entier(30, 110);
    } while (180 - a - b < 30);
    const angles = RM.melanger([a, b, 180 - a - b]);
    const k = entier(0, 2); // l'angle à trouver
    const [i, j] = [0, 1, 2].filter(n => n !== k);
    const reponse = angles[k];
    const explication = `La somme des angles d’un triangle est <b>180°</b> :<br>`
      + `${angle(angleEn(noms, k))} = 180° − ${angles[i]}° − ${angles[j]}° = <b>${reponse}°</b>.`;
    if (Math.random() < 0.5) {
      const textes = angles.map((m, n) => (n === k ? '?' : deg(m)));
      return nombreDegres({
        consigne: 'Regarde la figure',
        enonce: `Combien mesure l’angle ${angle(angleEn(noms, k))} du triangle ${noms.join('')} ?${figureTriangle(noms, angles, textes)}`,
        reponse,
        explication,
      });
    }
    return nombreDegres({
      enonce: `Dans le triangle ${noms.join('')}, ${angle(angleEn(noms, i))} = ${angles[i]}° et ${angle(angleEn(noms, j))} = ${angles[j]}°. `
        + `Combien mesure ${angle(angleEn(noms, k))} ?`,
      reponse,
      explication,
    });
  }

  // Le triangle isocèle : les deux angles à la base sont égaux
  function questionIsocele() {
    const [S, B1, B2] = lettres(3); // S : le sommet principal ; [B1B2] : la base
    const sommet = B1 + S + B2;     // l'angle au sommet principal
    const base1 = S + B1 + B2;      // les angles à la base
    const base2 = S + B2 + B1;
    const variante = parmi(['sommetDonne', 'sommetDonne', 'baseDonnee', 'baseDonnee', 'autreBase']);
    let a;
    let b;
    if (variante === 'sommetDonne') {
      a = 2 * entier(15, 60);
      b = (180 - a) / 2;
    } else {
      b = entierSauf(30, 75, [60]);
      a = 180 - 2 * b;
    }
    const debut = `Le triangle ${S}${B1}${B2} est isocèle en ${S}`;
    let enonce;
    let reponse;
    let explication;
    let textes;
    if (variante === 'sommetDonne') {
      enonce = `${debut}, et ${angle(sommet)} = ${a}°. Combien mesure ${angle(base1)} ?`;
      reponse = b;
      textes = ['?', '', deg(a)];
      explication = `Isocèle en ${S} : les angles à la base ${angle(base1)} et ${angle(base2)} sont égaux. `
        + `Ensemble, ils font 180° − ${a}° = ${180 - a}°.<br>Chacun mesure ${180 - a}° ÷ 2 = <b>${b}°</b>.`;
    } else if (variante === 'baseDonnee') {
      enonce = `${debut}, et ${angle(base1)} = ${b}°. Combien mesure ${angle(sommet)} ?`;
      reponse = a;
      textes = [deg(b), '', '?'];
      explication = `Isocèle en ${S} : les angles à la base sont égaux, ${angle(base2)} = ${angle(base1)} = ${b}°.<br>`
        + `${angle(sommet)} = 180° − ${b}° − ${b}° = <b>${a}°</b>.`;
    } else {
      enonce = `${debut}, et ${angle(base1)} = ${b}°. Combien mesure ${angle(base2)} ?`;
      reponse = b;
      textes = [deg(b), '?', ''];
      explication = `Dans un triangle isocèle en ${S}, les deux angles à la base sont <b>égaux</b> : `
        + `${angle(base2)} = ${angle(base1)} = <b>${b}°</b>. (Pas besoin de calculer !)`;
    }
    if (Math.random() < 0.5) {
      const svg = figureTriangle([B1, B2, S], [b, b, a], textes, { codage: 2 });
      return nombreDegres({ consigne: 'Regarde la figure', enonce: enonce + svg, reponse, explication });
    }
    return nombreDegres({ enonce, reponse, explication });
  }

  // Le triangle rectangle : les deux angles aigus font 90° ensemble
  function questionRectangle() {
    const [S, B1, B2] = lettres(3); // l'angle droit est en S
    const b = entierSauf(25, 65, [45]);
    const enonce = `Le triangle ${S}${B1}${B2} est rectangle en ${S}, et ${angle(S + B1 + B2)} = ${b}°. Combien mesure ${angle(S + B2 + B1)} ?`;
    const explication = `Rectangle en ${S} : ${angle(B1 + S + B2)} = 90°. Les deux autres angles font ensemble 180° − 90° = 90°.<br>`
      + `${angle(S + B2 + B1)} = 90° − ${b}° = <b>${90 - b}°</b>.`;
    if (Math.random() < 0.5) {
      const svg = figureTriangle([B1, B2, S], [b, 90 - b, 90], [deg(b), '?', ''], { droit: 2 });
      return nombreDegres({ consigne: 'Regarde la figure', enonce: enonce + svg, reponse: 90 - b, explication });
    }
    return nombreDegres({ enonce, reponse: 90 - b, explication });
  }

  // Le même calcul pour le triangle isocèle, en boutons (avec les erreurs classiques)
  function questionIsoceleChoix() {
    const [S, B1, B2] = lettres(3);
    const debut = `Le triangle ${S}${B1}${B2} est isocèle en ${S}`;
    if (Math.random() < 0.5) {
      const a = 2 * entier(15, 60);
      const b = (180 - a) / 2;
      return choix({
        consigne: 'Choisis la bonne mesure',
        enonce: `${debut}, et ${angle(B1 + S + B2)} = ${a}°. Combien mesure ${angle(S + B1 + B2)} ?`,
        reponse: deg(b),
        pieges: troisPieges(b, [180 - a, a, 180 - 2 * a], { max: 179 }).map(deg),
        explication: `Les deux angles à la base sont égaux. Ensemble, ils font 180° − ${a}° = ${180 - a}° : `
          + `chacun mesure ${180 - a}° ÷ 2 = <b>${b}°</b>.<br>⚠️ Il ne faut pas oublier de diviser par 2 !`,
      });
    }
    const b = entierSauf(25, 80, [60]);
    const a = 180 - 2 * b;
    return choix({
      consigne: 'Choisis la bonne mesure',
      enonce: `${debut}, et ${angle(S + B1 + B2)} = ${b}°. Combien mesure ${angle(B1 + S + B2)} ?`,
      reponse: deg(a),
      pieges: troisPieges(a, [180 - b, b, (180 - b) / 2].filter(Number.isInteger), { max: 179 }).map(deg),
      explication: `Les deux angles à la base mesurent ${b}° chacun : ${angle(B1 + S + B2)} = 180° − ${b}° − ${b}° = <b>${a}°</b>.`
        + `<br>⚠️ Il y a <b>deux</b> angles de ${b}° à enlever.`,
    });
  }

  // Le nom le plus précis d'un triangle dont on connaît deux angles
  const NATURES = ['équilatéral', 'isocèle', 'rectangle', 'rectangle isocèle', 'quelconque'];
  function questionNature() {
    const nature = parmi(NATURES);
    let a;
    let b;
    if (nature === 'équilatéral') [a, b] = [60, 60];
    else if (nature === 'rectangle isocèle') [a, b] = parmi([[45, 45], [90, 45], [45, 90]]);
    else if (nature === 'rectangle') {
      const x = entierSauf(20, 70, [45]);
      [a, b] = parmi([[x, 90 - x], [90, x], [x, 90]]);
    } else if (nature === 'isocèle') {
      const x = entierSauf(25, 80, [45, 60]);
      [a, b] = parmi([[x, x], [x, 180 - 2 * x], [180 - 2 * x, x]]);
    } else {
      do {
        a = entier(20, 110);
        b = entier(20, 110);
      } while (180 - a - b < 20 || new Set([a, b, 180 - a - b]).size < 3 || [a, b, 180 - a - b].includes(90));
    }
    const c = 180 - a - b;
    const EXPLICATIONS = {
      'équilatéral': 'Trois angles de 60° : le triangle est <b>équilatéral</b> (c’est un triangle isocèle particulier).',
      'rectangle isocèle': 'Un angle droit et deux angles de 45° égaux : il est <b>rectangle isocèle</b>.',
      'rectangle': 'Un angle de 90° : il est <b>rectangle</b>. Ses deux autres angles sont différents : il n’est pas isocèle.',
      'isocèle': 'Deux angles égaux, et aucun angle droit : il est <b>isocèle</b>.',
      'quelconque': 'Trois angles différents, et aucun angle droit : il est <b>quelconque</b>.',
    };
    return choix({
      consigne: 'Choisis le nom le plus précis',
      enonce: `Un triangle a deux angles qui mesurent ${a}° et ${b}°. Ce triangle est…`,
      reponse: nature,
      pieges: NATURES,
      explication: `Le 3e angle mesure 180° − ${a}° − ${b}° = ${c}°.<br>${EXPLICATIONS[nature]}`,
    });
  }

  // Le 3e angle est-il aigu, droit ou obtus ?
  function questionNatureAngle() {
    const noms = lettres(3);
    const nature = parmi(['aigu', 'droit', 'obtus']);
    let c;
    if (nature === 'droit') c = 90;
    else if (nature === 'aigu') c = entier(30, 85);
    else c = entier(95, 140);
    const a = entier(15, 165 - c);
    const b = 180 - c - a;
    const fin = { aigu: 'moins de 90°, il est <b>aigu</b>', droit: 'c’est un angle <b>droit</b>', obtus: 'plus de 90°, il est <b>obtus</b>' }[nature];
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `Dans le triangle ${noms.join('')}, ${angle(angleEn(noms, 0))} = ${a}° et ${angle(angleEn(noms, 1))} = ${b}°. `
        + `L’angle ${angle(angleEn(noms, 2))} est…`,
      reponse: nature,
      choix: ['aigu', 'droit', 'obtus'],
      explication: `${angle(angleEn(noms, 2))} = 180° − ${a}° − ${b}° = ${c}° : ${fin}.`,
    });
  }

  const DEFINITIONS_ANGLES = [
    ['Dans un triangle, la somme des trois angles est égale à ___.', '180°', ['90°', '100°', '120°', '240°', '270°', '360°'],
      'Dans <b>tout</b> triangle, grand ou petit, la somme des trois angles est égale à <b>180°</b>.'],
    ['Chaque angle d’un triangle équilatéral mesure ___.', '60°', ['30°', '45°', '50°', '90°', '120°', '180°'],
      'Les trois angles sont égaux, et leur somme fait 180° : chacun mesure 180° ÷ 3 = <b>60°</b>.'],
    ['Dans un triangle rectangle, les deux angles aigus ont pour somme ___.', '90°', ['45°', '60°', '80°', '100°', '120°', '180°'],
      'L’angle droit mesure 90°. Il reste 180° − 90° = <b>90°</b> pour les deux autres angles.'],
    ['Dans un triangle isocèle, les deux angles à la base sont ___.', 'égaux', ['droits', 'obtus', 'de somme 90°'],
      'Dans un triangle isocèle, les deux angles à la base sont <b>égaux</b>.'],
    ['Un triangle qui a deux angles égaux est ___.', 'isocèle', ['rectangle', 'quelconque', 'aplati'],
      'Deux angles égaux : le triangle est <b>isocèle</b> (les deux côtés qui partent du 3e sommet ont la même longueur).'],
    ['Dans un triangle rectangle, les deux autres angles sont ___.', 'aigus', ['obtus', 'droits', 'plats'],
      'Il reste 90° pour les deux autres angles : chacun mesure moins de 90°, ils sont <b>aigus</b>.'],
  ];

  const VF_ANGLES_TRIANGLE = [
    ['La somme des angles d’un triangle est égale à 180°.', true,
      'Dans tout triangle, la somme des trois angles est égale à <b>180°</b>.'],
    ['Dans un triangle équilatéral, chaque angle mesure 60°.', true,
      'Trois angles égaux qui font 180° en tout : 180° ÷ 3 = <b>60°</b>.'],
    ['Un triangle qui a deux angles égaux est isocèle.', true,
      'Deux angles égaux : le triangle est <b>isocèle</b>.'],
    ['Dans un triangle rectangle, les deux angles aigus ont pour somme 90°.', true,
      '180° − 90° = <b>90°</b> pour les deux angles aigus.'],
    ['Un triangle peut avoir deux angles obtus.', false,
      'Deux angles obtus feraient déjà <b>plus de 180°</b> à eux deux : c’est impossible.'],
    ['Un triangle peut avoir deux angles droits.', false,
      'Deux angles droits feraient déjà 180° : il ne resterait rien pour le 3e angle. C’est <b>impossible</b>.'],
    ['Dans un triangle isocèle, les trois angles sont égaux.', false,
      'Seuls les deux angles <b>à la base</b> sont égaux. Les trois ne sont égaux que si le triangle est équilatéral.'],
    ['Plus un triangle est grand, plus la somme de ses angles est grande.', false,
      'La somme des angles fait <b>toujours 180°</b>, que le triangle soit petit ou grand.'],
  ];

  // Un vrai ou faux avec trois angles tirés au hasard : leur somme fait-elle 180° ?
  function vraiFauxSomme() {
    const vrai = Math.random() < 0.5;
    let a;
    let b;
    do {
      a = entier(3, 16) * 5;
      b = entier(3, 16) * 5;
    } while (180 - a - b < 40);
    const c = vrai ? 180 - a - b : 180 - a - b + parmi([-20, -10, 10, 20]);
    const [x, y, z] = RM.melanger([a, b, c]);
    const somme = x + y + z;
    return vraiFaux({
      enonce: `Un triangle peut avoir des angles de ${x}°, ${y}° et ${z}°.`,
      vrai,
      explication: `${x}° + ${y}° + ${z}° = ${somme}°. `
        + (vrai ? 'La somme fait bien <b>180°</b> : c’est possible.' : `La somme devrait faire <b>180°</b>, pas ${somme}° : c’est impossible.`),
    });
  }

  ajouterEtape({
    id: '5e-geometrie-angles-triangle',
    banque: ['troisieme', 'troisieme', 'troisieme', 'isocele', 'isocele', 'rectangle', 'isoceleChoix', 'isoceleChoix',
      'nature', 'nature', 'natureAngle', 'natureAngle', 'definition', 'definition', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'troisieme') return questionTroisiemeAngle();
      if (sorte === 'isocele') return questionIsocele();
      if (sorte === 'rectangle') return questionRectangle();
      if (sorte === 'isoceleChoix') return questionIsoceleChoix();
      if (sorte === 'nature') return questionNature();
      if (sorte === 'natureAngle') return questionNatureAngle();
      if (sorte === 'definition') return choixDans('Choisis la bonne réponse', DEFINITIONS_ANGLES);
      return Math.random() < 0.5 ? vraiFauxDans(VF_ANGLES_TRIANGLE) : vraiFauxSomme();
    },
    titreLecon: 'Les angles du triangle',
    lecon: `
      <h4>La somme des angles d’un triangle</h4>
      ${figureTriangle(['A', 'B', 'C'], [50, 60, 70], ['50°', '60°', '70°'], { fixe: true })}
      <p>Dans tout triangle, la somme des trois angles est égale à <b>180°</b> : 50° + 60° + 70° = 180°.</p>
      <p>👉 <i>Si ${angle('BAC')} = 50° et ${angle('ABC')} = 60°, alors ${angle('ACB')} = 180° − 50° − 60° = 70°.</i></p>
      <h4>Les triangles particuliers</h4>
      <table>
        <tr><th>isocèle en A</th><td>A est le <b>sommet principal</b> et [BC] la <b>base</b>. Les deux <b>angles à la base</b>,
          ${angle('ABC')} et ${angle('ACB')}, sont égaux ; ${angle('BAC')} est l’<b>angle au sommet</b></td></tr>
        <tr><th>équilatéral</th><td>ses trois angles mesurent 60° (c’est un triangle isocèle particulier)</td></tr>
        <tr><th>rectangle en A</th><td>${angle('BAC')} = 90°, et les deux angles aigus font 90° ensemble</td></tr>
        <tr><th>rectangle isocèle</th><td>ses angles mesurent 90°, 45° et 45°</td></tr>
      </table>
      <p>Inversement, un triangle qui a <b>deux angles égaux</b> est isocèle. Un triangle <b>quelconque</b> n’a rien
        de particulier : trois angles différents et aucun angle droit.</p>
      <p>👉 <i>Isocèle en A avec ${angle('BAC')} = 40° : ${angle('ABC')} = ${angle('ACB')} = (180° − 40°) ÷ 2 = 70°.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un triangle ne peut pas avoir deux angles droits, ni deux angles obtus :
        à eux deux, ils feraient déjà 180° ou plus !</div>
      <p>⚠️ Dans un triangle isocèle, ce qui reste après l’angle au sommet se partage entre <b>deux</b> angles : on divise par 2.</p>
    `,
  });

  // ======================================================================
  // 3. Angles et parallèles
  // ======================================================================
  // Deux droites (d₁) et (d₂) coupées par une sécante (d₃).
  // theta : l'angle (en degrés) entre (d₁) et la sécante, au-dessus de (d₁) et à droite de la sécante ;
  // ecart : de combien (d₂) est tournée par rapport à (d₁) (0 : elles sont parallèles).
  // marques : les angles marqués d'un arc, [{ sommet: 1 ou 2, place, texte }] ; le sommet 1 est sur (d₁), le 2 sur (d₂) ;
  // les places : HD (en haut à droite de la sécante), HG (en haut à gauche), BG (en bas à gauche), BD (en bas à droite)
  function figureSecante(theta, ecart, marques, { penteD1 = entier(-8, 8) } = {}) {
    const C = [215, 135];
    const sigma = penteD1 + theta; // la direction de la sécante
    const k = 56 / Math.sin(theta * RAD);
    const P = { 1: vers(C, k, sigma), 2: vers(C, k, sigma + 180) };
    const pente = { 1: penteD1, 2: penteD1 + ecart };
    let dessin = '';
    const traits = [];
    // Chaque droite va de x = 20 à x = 400, et son nom est écrit juste après
    [1, 2].forEach(n => {
      const S = P[n];
      const c = Math.cos(pente[n] * RAD);
      const G = vers(S, (20 - S[0]) / c, pente[n]);
      const D = vers(S, (400 - S[0]) / c, pente[n]);
      traits.push([G, D]);
      dessin += F.segment(G, D) + F.texte([D[0] + 8, D[1]], n === 1 ? '(d₁)' : '(d₂)', { ancre: 'start' });
    });
    // La sécante, du haut (y = 14) au bas (y = 256) du dessin, sans sortir des x de 75 à 350 ;
    // son nom est à côté de son bout du haut, du côté où elle penche (pour ne pas être écrit sur le trait)
    const s = Math.sin(sigma * RAD);
    const c = Math.cos(sigma * RAD);
    const limiteX = (versLaDroite) => (versLaDroite ? (350 - C[0]) / Math.abs(c) : (C[0] - 75) / Math.abs(c));
    const tHaut = Math.min((C[1] - 14) / s, Math.abs(c) > 0.01 ? limiteX(c > 0) : Infinity);
    const tBas = Math.min((256 - C[1]) / s, Math.abs(c) > 0.01 ? limiteX(c < 0) : Infinity);
    const haut = vers(C, tHaut, sigma);
    const bas = vers(C, -tBas, sigma);
    dessin += F.segment(haut, bas) + F.texte([haut[0] + (c >= 0 ? 30 : -30), haut[1] + 6], '(d₃)');
    traits.push([haut, bas]);
    const boites = [];
    marques.forEach(({ sommet, place, texte }) => {
      const S = P[sommet];
      const psi = pente[sommet];
      const [debut, fin] = { HD: [psi, sigma], HG: [sigma, psi + 180], BG: [psi + 180, sigma + 180], BD: [sigma + 180, psi + 360] }[place];
      dessin += arcAvecTexte(S, vers(S, 40, debut), vers(S, 40, fin), texte, traits, boites);
    });
    return F.svg(460, 270, dessin, 'Deux droites coupées par une sécante');
  }

  const PLACES = ['HD', 'HG', 'BG', 'BD'];
  const OPPOSEE = { HD: 'BG', BG: 'HD', HG: 'BD', BD: 'HG' };
  const VOISINES = { HD: ['HG', 'BD'], HG: ['HD', 'BG'], BG: ['HG', 'BD'], BD: ['HD', 'BG'] };
  // La mesure de l'angle à cette place, quand la sécante fait l'angle theta avec la droite
  const mesureA = (place, theta) => (place === 'HD' || place === 'BG' ? theta : 180 - theta);
  // Deux angles de cette sorte : [{ sommet, place }, { sommet, place }]
  function deuxAngles(sorte) {
    const sommet = parmi([1, 2]);
    const place = parmi(PLACES);
    if (sorte === 'opposés') return [{ sommet, place }, { sommet, place: OPPOSEE[place] }];
    if (sorte === 'adjacents') return [{ sommet, place }, { sommet, place: parmi(VOISINES[place]) }];
    if (sorte === 'correspondants') return RM.melanger([{ sommet: 1, place }, { sommet: 2, place }]);
    return RM.melanger(parmi([[{ sommet: 1, place: 'BG' }, { sommet: 2, place: 'HD' }], [{ sommet: 1, place: 'BD' }, { sommet: 2, place: 'HG' }]]));
  }
  const NOMS_PAIRES = {
    'opposés': 'opposés par le sommet', 'adjacents': 'adjacents supplémentaires',
    'alternes': 'alternes-internes', 'correspondants': 'correspondants',
  };
  // Une mesure d'angle pas trop près de 90° (sinon, on ne voit pas bien quel angle est aigu)
  const mesureNonDroite = () => parmi([entier(40, 75), entier(105, 140)]);

  // Comment s'appellent ces deux angles ?
  function questionNomPaire() {
    const sorte = parmi(['opposés', 'adjacents', 'correspondants', 'alternes']);
    const [m1, m2] = deuxAngles(sorte);
    // Parfois, les droites ne sont pas parallèles : les noms des angles ne dépendent que de leur place
    const ecart = Math.random() < 0.25 ? parmi([-1, 1]) * entier(6, 10) : 0;
    const svg = figureSecante(mesureNonDroite(), ecart, [{ ...m1, texte: '1' }, { ...m2, texte: '2' }]);
    const EXPLICATIONS = {
      'opposés': 'Les angles 1 et 2 ont le même sommet, et leurs côtés sont dans le prolongement l’un de l’autre : '
        + 'ils sont <b>opposés par le sommet</b>.',
      'adjacents': 'Les angles 1 et 2 ont le même sommet et un côté commun, et ensemble ils forment un angle plat : '
        + 'ils sont <b>adjacents supplémentaires</b>.',
      'correspondants': 'Les angles 1 et 2 sont à la même place à chacun des deux points : du même côté de la sécante, '
        + 'et chacun au-dessus (ou au-dessous) de sa droite. Ils sont <b>correspondants</b>.',
      'alternes': 'Les angles 1 et 2 sont entre les droites (d₁) et (d₂) (internes), et de part et d’autre de la sécante (alternes) : '
        + 'ils sont <b>alternes-internes</b>.',
    };
    return choix({
      consigne: 'Regarde la figure',
      enonce: `Comment appelle-t-on les angles 1 et 2 ?${svg}`,
      reponse: NOMS_PAIRES[sorte],
      choix: ['opposés par le sommet', 'adjacents supplémentaires', 'alternes-internes', 'correspondants'],
      explication: EXPLICATIONS[sorte],
    });
  }

  // (d₁) // (d₂) : calculer un angle à partir d'un autre
  function questionMesure() {
    const sorte = parmi(['correspondants', 'correspondants', 'alternes', 'alternes', 'opposés', 'adjacents']);
    const [donne, cherche] = deuxAngles(sorte);
    const m = mesureNonDroite();
    const theta = mesureA(donne.place, m) === m ? m : 180 - m;
    const reponse = sorte === 'adjacents' ? 180 - m : m;
    const svg = figureSecante(theta, 0, [{ ...donne, texte: deg(m) }, { ...cherche, texte: '?' }]);
    const EXPLICATIONS = {
      'correspondants': `Les deux angles sont <b>correspondants</b>, et (d₁) // (d₂) : ils sont égaux. L’angle « ? » mesure <b>${m}°</b>.`,
      'alternes': `Les deux angles sont <b>alternes-internes</b>, et (d₁) // (d₂) : ils sont égaux. L’angle « ? » mesure <b>${m}°</b>.`,
      'opposés': `Les deux angles sont <b>opposés par le sommet</b> : ils sont égaux. L’angle « ? » mesure <b>${m}°</b>.`,
      'adjacents': `Les deux angles sont adjacents et forment un angle plat : ils sont <b>supplémentaires</b>.<br>`
        + `180° − ${m}° = <b>${180 - m}°</b>.`,
    };
    return nombreDegres({
      consigne: 'Regarde la figure',
      enonce: `Les droites (d₁) et (d₂) sont parallèles. Combien mesure l’angle marqué «&nbsp;?&nbsp;» ?${svg}`,
      reponse,
      explication: EXPLICATIONS[sorte],
    });
  }

  // Les droites sont-elles parallèles ? (la réciproque, et la contraposée)
  function questionParalleles() {
    const cas = parmi(['oui', 'oui', 'non', 'non', 'nsp']);
    const m1 = mesureNonDroite();
    let marques;
    let ecart;
    let explication;
    if (cas === 'nsp') {
      // Deux angles au même point : ils ne disent rien de l'autre droite
      const sorte = parmi(['opposés', 'adjacents']);
      const [a1, a2] = deuxAngles(sorte);
      const theta = mesureA(a1.place, m1) === m1 ? m1 : 180 - m1;
      marques = [{ ...a1, texte: deg(m1) }, { ...a2, texte: deg(mesureA(a2.place, theta)) }];
      ecart = entier(-4, 4);
      explication = 'Les deux angles marqués ont le <b>même sommet</b> : ils ne disent rien de l’autre droite. '
        + 'On <b>ne peut pas savoir</b> si (d₁) et (d₂) sont parallèles.';
      return choix({
        consigne: 'Regarde les mesures',
        enonce: `Les droites (d₁) et (d₂) sont-elles parallèles ?${figureSecante(theta, ecart, marques)}`,
        reponse: 'on ne peut pas savoir',
        choix: ['oui', 'non', 'on ne peut pas savoir'],
        explication,
      });
    }
    const sorte = parmi(['correspondants', 'alternes']);
    const [a1, a2] = deuxAngles(sorte);
    const [g, h] = a1.sommet === 1 ? [a1, a2] : [a2, a1]; // g sur (d₁), h sur (d₂)
    const theta = mesureA(g.place, m1) === m1 ? m1 : 180 - m1;
    const m2 = cas === 'oui' ? m1 : m1 + parmi([-1, 1]) * entier(1, 5);
    // (d₂) est tournée pour que l'angle en h mesure vraiment m2
    ecart = mesureA(h.place, 0) === 0 ? theta - m2 : m2 - 180 + theta;
    marques = RM.melanger([{ ...g, texte: deg(m1) }, { ...h, texte: deg(m2) }]);
    const nomSorte = NOMS_PAIRES[sorte];
    explication = cas === 'oui'
      ? `Les deux angles sont <b>${nomSorte}</b>, et ils sont égaux (${m1}°) : les droites (d₁) et (d₂) sont <b>parallèles</b>.`
      : `Les deux angles sont ${nomSorte}, mais ${m1}° ≠ ${m2}°. Si les droites étaient parallèles, ils seraient égaux : `
        + '(d₁) et (d₂) <b>ne sont pas parallèles</b>, même si elles en ont l’air !';
    return choix({
      consigne: 'Regarde les mesures',
      enonce: `Les droites (d₁) et (d₂) sont-elles parallèles ?${figureSecante(theta, ecart, marques)}`,
      reponse: cas,
      choix: ['oui', 'non', 'on ne peut pas savoir'],
      explication,
    });
  }

  // Angles supplémentaires, complémentaires, opposés : des calculs sans figure
  function questionCalculAngles() {
    const variante = parmi(['supplementaires', 'complementaires', 'plat', 'droit', 'alternes']);
    if (variante === 'supplementaires' || variante === 'plat') {
      const m = entierSauf(20, 160, [90]);
      return nombreDegres({
        enonce: variante === 'plat'
          ? `Deux angles adjacents forment un angle plat. L’un mesure ${m}°. Combien mesure l’autre ?`
          : `Deux angles sont supplémentaires. L’un mesure ${m}°. Combien mesure l’autre ?`,
        reponse: 180 - m,
        explication: `${variante === 'plat' ? 'Un angle plat mesure 180° : les deux angles sont supplémentaires.' : 'Supplémentaires : leur somme fait <b>180°</b>.'}`
          + `<br>180° − ${m}° = <b>${180 - m}°</b>.`,
      });
    }
    if (variante === 'complementaires' || variante === 'droit') {
      const m = entierSauf(10, 80, [45]);
      return nombreDegres({
        enonce: variante === 'droit'
          ? `Deux angles adjacents forment un angle droit. L’un mesure ${m}°. Combien mesure l’autre ?`
          : `Deux angles sont complémentaires. L’un mesure ${m}°. Combien mesure l’autre ?`,
        reponse: 90 - m,
        explication: `${variante === 'droit' ? 'Un angle droit mesure 90° : les deux angles sont complémentaires.' : 'Complémentaires : leur somme fait <b>90°</b>.'}`
          + `<br>90° − ${m}° = <b>${90 - m}°</b>.`,
      });
    }
    // Deux parallèles et une sécante : les 8 angles ne prennent que deux mesures, un angle aigu et son supplémentaire
    const m = entier(35, 80);
    const aiguDonne = Math.random() < 0.5;
    const [donne, cherche] = aiguDonne ? [m, 180 - m] : [180 - m, m];
    return nombreDegres({
      enonce: `Deux droites parallèles sont coupées par une sécante. L’un des angles ${aiguDonne ? 'aigus' : 'obtus'} formés mesure ${donne}°. `
        + `Combien mesure chacun des angles ${aiguDonne ? 'obtus' : 'aigus'} ?`,
      reponse: cherche,
      explication: `Les angles ${aiguDonne ? 'aigus' : 'obtus'} sont tous égaux (opposés par le sommet, correspondants ou alternes-internes). `
        + `Chaque angle ${aiguDonne ? 'obtus' : 'aigu'} forme un angle plat avec l’un d’eux :<br>180° − ${donne}° = <b>${cherche}°</b>.`,
    });
  }

  // Le même genre de calcul, en boutons (avec les confusions entre 90° et 180°)
  function questionCalculChoix() {
    if (Math.random() < 0.5) {
      const m = entierSauf(25, 155, [90]);
      return choix({
        consigne: 'Choisis la bonne mesure',
        enonce: `Deux angles sont supplémentaires. L’un mesure ${m}°. Combien mesure l’autre ?`,
        reponse: deg(180 - m),
        pieges: troisPieges(180 - m, [90 - m, m], { max: 179 }).map(deg),
        explication: `Deux angles supplémentaires font <b>180°</b> ensemble : 180° − ${m}° = <b>${180 - m}°</b>.`
          + '<br>(Complémentaires, ce serait 90° en tout.)',
      });
    }
    const m = entierSauf(10, 80, [45]);
    return choix({
      consigne: 'Choisis la bonne mesure',
      enonce: `Deux angles sont complémentaires. L’un mesure ${m}°. Combien mesure l’autre ?`,
      reponse: deg(90 - m),
      pieges: troisPieges(90 - m, [180 - m, m], { max: 179 }).map(deg),
      explication: `Deux angles complémentaires font <b>90°</b> ensemble : 90° − ${m}° = <b>${90 - m}°</b>.`
        + '<br>(Supplémentaires, ce serait 180° en tout.)',
    });
  }

  const VOCABULAIRE_ANGLES = [
    ['Deux angles dont la somme fait 180° sont ___.', 'supplémentaires', ['complémentaires', 'opposés', 'égaux'],
      'Somme de 180° : ils sont <b>supplémentaires</b>. (Somme de 90° : complémentaires.)'],
    ['Deux angles dont la somme fait 90° sont ___.', 'complémentaires', ['supplémentaires', 'opposés', 'égaux'],
      'Somme de 90° : ils sont <b>complémentaires</b>. (Somme de 180° : supplémentaires.)'],
    ['Deux angles opposés par le sommet sont toujours ___.', 'égaux', ['supplémentaires', 'complémentaires', 'droits'],
      'Deux angles opposés par le sommet ont <b>la même mesure</b> : ils sont égaux.'],
    ['Deux parallèles coupées par une sécante : leurs angles alternes-internes sont ___.', 'égaux',
      ['supplémentaires', 'complémentaires', 'droits'],
      'Quand les droites sont <b>parallèles</b>, deux angles alternes-internes sont <b>égaux</b>.'],
    ['Des angles correspondants égaux : les deux droites coupées par la sécante sont ___.', 'parallèles',
      ['perpendiculaires', 'sécantes'],
      'Si deux angles correspondants sont égaux, alors les droites sont <b>parallèles</b>.'],
    ['Deux angles adjacents ont le même sommet et ___.', 'un côté commun', ['la même mesure', 'une somme de 90°', 'un angle droit'],
      'Deux angles <b>adjacents</b> ont le même sommet, un <b>côté commun</b>, et sont de part et d’autre de ce côté.'],
  ];

  const VF_PARALLELES = [
    ['Deux angles opposés par le sommet ont la même mesure.', true,
      'Deux angles opposés par le sommet sont toujours <b>égaux</b>.'],
    ['Si deux droites parallèles sont coupées par une sécante, deux angles correspondants sont égaux.', true,
      'Avec des droites <b>parallèles</b>, les angles correspondants sont égaux (et les alternes-internes aussi).'],
    ['Si deux angles alternes-internes sont égaux, alors les deux droites sont parallèles.', true,
      'C’est la propriété qui sert à <b>prouver</b> que deux droites sont parallèles.'],
    ['Un angle de 35° et un angle de 55° sont complémentaires.', true,
      '35° + 55° = <b>90°</b> : ils sont complémentaires.'],
    ['Deux angles adjacents qui forment un angle plat sont supplémentaires.', true,
      'Un angle plat mesure 180° : les deux angles font 180° ensemble, ils sont <b>supplémentaires</b>.'],
    ['Deux angles alternes-internes sont toujours égaux.', false,
      'Ils ne sont égaux que si les deux droites sont <b>parallèles</b>.'],
    ['Deux angles supplémentaires ont pour somme 90°.', false,
      'Deux angles supplémentaires ont pour somme <b>180°</b>. Ceux qui font 90° sont complémentaires.'],
    ['Un angle de 70° et un angle de 120° sont supplémentaires.', false,
      '70° + 120° = 190°, et pas 180° : ils ne sont <b>pas</b> supplémentaires.'],
    ['Deux angles correspondants sont toujours supplémentaires.', false,
      'Si les droites sont parallèles, deux angles correspondants sont <b>égaux</b> (pas supplémentaires).'],
    ['Si deux angles correspondants ne sont pas égaux, les droites peuvent quand même être parallèles.', false,
      'Si les droites étaient parallèles, ces angles seraient égaux. Ils ne le sont pas : les droites ne sont <b>pas</b> parallèles.'],
  ];

  ajouterEtape({
    id: '5e-geometrie-angles-paralleles',
    banque: ['nomPaire', 'nomPaire', 'nomPaire', 'mesure', 'mesure', 'mesure', 'paralleles', 'paralleles',
      'calcul', 'calculChoix', 'calculChoix', 'vocabulaire', 'vocabulaire', 'vocabulaire', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'nomPaire') return questionNomPaire();
      if (sorte === 'mesure') return questionMesure();
      if (sorte === 'paralleles') return questionParalleles();
      if (sorte === 'calcul') return questionCalculAngles();
      if (sorte === 'calculChoix') return questionCalculChoix();
      if (sorte === 'vocabulaire') return choixDans('Choisis la bonne réponse', VOCABULAIRE_ANGLES);
      return vraiFauxDans(VF_PARALLELES);
    },
    titreLecon: 'Angles et parallèles',
    lecon: `
      <h4>Des angles qui vont par deux</h4>
      <p>Deux angles sont <b>complémentaires</b> si leur somme fait 90°, <b>supplémentaires</b> si leur somme fait 180°.</p>
      <p>Deux angles <b>adjacents</b> ont le même sommet et un côté commun, et sont de part et d’autre de ce côté.</p>
      <p>Deux angles <b>opposés par le sommet</b> ont le même sommet et des côtés dans le prolongement l’un de l’autre :
        ils sont toujours <b>égaux</b>.</p>
      <h4>Deux droites et une sécante</h4>
      <p>La droite (d₃) coupe les droites (d₁) et (d₂) : c’est une <b>sécante</b>.</p>
      ${figureSecante(55, 0, [{ sommet: 1, place: 'BG', texte: '1' }, { sommet: 2, place: 'HD', texte: '2' },
        { sommet: 2, place: 'BG', texte: '3' }], { penteD1: 0 })}
      <p>Les angles 1 et 2 sont <b>alternes-internes</b> : entre les deux droites (internes), de part et d’autre de la sécante (alternes).</p>
      <p>Les angles 1 et 3 sont <b>correspondants</b> : à la même place à chacun des deux points.</p>
      <p>Si les droites sont <b>parallèles</b>, alors deux angles alternes-internes sont égaux, et deux angles correspondants aussi.</p>
      <p>Avec deux parallèles, les angles aigus de la figure sont donc tous égaux, et les angles obtus aussi.</p>
      <p>Inversement, si deux angles alternes-internes (ou correspondants) sont égaux, alors les droites sont parallèles.
        S’ils ne sont pas égaux, elles ne sont pas parallèles.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> les angles alternes-internes dessinent un « Z »,
        les angles correspondants un « F ».</div>
      <p>⚠️ Ces noms existent même si les droites ne sont pas parallèles ; mais les angles ne sont égaux que si elles le sont.</p>
    `,
  });

  // ======================================================================
  // 4. Le parallélogramme
  // ======================================================================
  // Des noms de parallélogrammes (les sommets dans l'ordre du tour) et le nom du point où se coupent les diagonales
  // (sans former de mots : pas de « OH », « OK », « ON », « OS »…)
  const PARALLELOGRAMMES = [['ABCD', 'O'], ['EFGH', 'K'], ['MNPR', 'K'], ['PRST', 'K']];
  // Le nom de l'angle au sommet i : ABCD, 0 → DAB
  const angleQuad = (S, i) => S[(i + 3) % 4] + S[i] + S[(i + 1) % 4];

  // Les sommets d'un parallélogramme de côtés a (le premier) et b, avec l'angle alpha au premier sommet
  function sommetsParallelogramme(a, b, alpha, rotation = entier(-12, 12)) {
    const c = Math.cos(alpha * RAD);
    const s = Math.sin(alpha * RAD);
    return ajuster(tourner([[0, 0], [a, 0], [a + b * c, -b * s], [b * c, -b * s]], rotation), 290, 165, 460, 240);
  }
  // Le parallélogramme dessiné : arcs [{ i, texte }], longueurs [{ i, texte }] (le côté du sommet i au sommet i + 1)
  function figureParallelogramme(noms, P, { arcs = [], longueurs = [], diagonales = false, centre = '' } = {}) {
    const O = milieu(P[0], P[2]);
    let dessin = F.polygone(P);
    const traits = P.map((S, i) => [S, P[(i + 1) % 4]]);
    if (diagonales) dessin += F.segment(P[0], P[2], 'fig-marque') + F.segment(P[1], P[3], 'fig-marque');
    const boites = [];
    arcs.forEach(({ i, texte }) => { dessin += arcAvecTexte(P[i], P[(i + 1) % 4], P[(i + 3) % 4], texte, traits, boites); });
    longueurs.forEach(({ i, texte }) => { dessin += longueurDehors(P[i], P[(i + 1) % 4], texte, O); });
    P.forEach((S, i) => { dessin += nommer(S, noms[i], direction(O, S), 20); });
    if (centre) dessin += nommer(O, centre, directionLibre(P.map(S => direction(O, S))), 18);
    return F.svg(460, 240, dessin, 'Un parallélogramme');
  }

  // Un quadrilatère tracé à partir de ses diagonales, avec le codage : parallélogramme, rectangle, losange ou carré
  function figureDiagonales(noms, sorte) {
    const egales = sorte === 'rectangle' || sorte === 'carré';
    const perpendiculaires = sorte === 'losange' || sorte === 'carré';
    const q = egales ? 1 : parmi([0.5, 0.55, 0.6]);
    const omega = perpendiculaires ? 90 : parmi([entier(52, 66), entier(114, 128)]);
    const t = entier(-30, 30);
    const P = ajuster([vers([0, 0], 1, t), vers([0, 0], q, t + omega), vers([0, 0], 1, t + 180), vers([0, 0], q, t + omega + 180)],
      300, 190, 460, 250);
    const O = milieu(P[0], P[2]);
    let dessin = F.polygone(P) + F.segment(P[0], P[2], 'fig-marque') + F.segment(P[1], P[3], 'fig-marque')
      + F.codage(O, P[0], 1) + F.codage(O, P[2], 1) + F.codage(O, P[1], egales ? 1 : 2) + F.codage(O, P[3], egales ? 1 : 2);
    if (perpendiculaires) dessin += F.angleDroit(O, P[0], P[1], 14);
    P.forEach((S, i) => { dessin += nommer(S, noms[i], direction(O, S), 20); });
    return F.svg(460, 250, dessin, 'Un quadrilatère et ses diagonales codées');
  }

  // Quelle droite est parallèle à… ? Quel segment a la même longueur que… ? Quel angle est égal à… ?
  function questionDefinition() {
    const [nom] = parmi(PARALLELOGRAMMES);
    const S = nom.split('');
    const i = entier(0, 3);
    const cote = S[i] + S[(i + 1) % 4];
    const oppose = parmi([S[(i + 2) % 4] + S[(i + 3) % 4], S[(i + 3) % 4] + S[(i + 2) % 4]]);
    const voisins = [S[(i + 1) % 4] + S[(i + 2) % 4], S[(i + 3) % 4] + S[i]];
    const diagonales = [S[0] + S[2], S[1] + S[3]];
    const variante = parmi(['parallele', 'parallele', 'longueur', 'longueur', 'angle']);
    if (variante === 'parallele') {
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `${nom} est un parallélogramme. Quelle droite est parallèle à (${cote}) ?`,
        reponse: `(${oppose})`,
        pieges: [...voisins, ...diagonales].map(d => `(${d})`),
        explication: `Dans un parallélogramme, les côtés <b>opposés</b> sont parallèles : <b>(${cote}) // (${oppose})</b>.`,
      });
    }
    if (variante === 'longueur') {
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `${nom} est un parallélogramme. Quel segment a toujours la même longueur que [${cote}] ?`,
        reponse: `[${oppose}]`,
        pieges: [...voisins, ...diagonales].map(d => `[${d}]`),
        explication: `Dans un parallélogramme, les côtés <b>opposés</b> ont la même longueur : <b>${cote} = ${oppose}</b>.`,
      });
    }
    const nomAngle = angleQuad(S, i);
    const opposeAngle = parmi([angleQuad(S, (i + 2) % 4), angleQuad(S, (i + 2) % 4).split('').reverse().join('')]);
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `${nom} est un parallélogramme. Quel angle est toujours égal à ${angle(nomAngle)} ?`,
      reponse: angleTexte(opposeAngle),
      // (et un angle fait d'un côté et d'une diagonale, au même sommet)
      pieges: [angleTexte(angleQuad(S, (i + 1) % 4)), angleTexte(angleQuad(S, (i + 3) % 4)), angleTexte(S[(i + 3) % 4] + S[i] + S[(i + 2) % 4])],
      explication: `Dans un parallélogramme, les angles <b>opposés</b> sont égaux : ${angle(nomAngle)} = <b>${angle(opposeAngle)}</b>. `
        + 'Deux angles consécutifs, eux, sont supplémentaires.',
    });
  }

  // Les longueurs : côtés opposés, périmètre, diagonales qui se coupent en leur milieu
  function questionLongueursParallelogramme() {
    const [nom, centre] = parmi(PARALLELOGRAMMES);
    const S = nom.split('');
    const avecFigure = Math.random() < 0.5;
    const a = longueurAuHasard(5, 12);
    let b;
    do { b = longueurAuHasard(2.5, 9); } while (b >= a - 1);
    const P = sommetsParallelogramme(a, b, entier(55, 75));
    const variante = parmi(['cote', 'cote', 'perimetre', 'perimetreInverse', 'diagonale', 'diagonale']);
    if (variante === 'cote') {
      const demande = parmi([2, 3]); // [S2S3], opposé à [S0S1], ou [S3S0], opposé à [S1S2]
      const reponse = demande === 2 ? a : b;
      const [c1, c2] = demande === 2 ? [S[0] + S[1], S[2] + S[3]] : [S[1] + S[2], S[3] + S[0]];
      const svg = avecFigure ? figureParallelogramme(S, P, { longueurs: [{ i: 0, texte: cm(a) }, { i: 1, texte: cm(b) }, { i: demande, texte: '?' }] }) : '';
      return nombre({
        consigne: avecFigure ? 'Regarde la figure' : 'Calcule',
        enonce: `${nom} est un parallélogramme${avecFigure ? '' : ` : ${S[0]}${S[1]} = ${cm(a)} et ${S[1]}${S[2]} = ${cm(b)}`}. `
          + `Combien mesure ${c2} ?${svg}`,
        reponse,
        unite: 'cm',
        explication: `Dans un parallélogramme, les côtés <b>opposés</b> ont la même longueur : ${c2} = ${c1} = <b>${cm(reponse)}</b>.`,
      });
    }
    if (variante === 'perimetre') {
      const potager = Math.random() < 0.4;
      const [x, y] = potager ? [entier(8, 15), entierOuDemi(4, 7)] : [a, b];
      const unite = potager ? 'm' : 'cm';
      const svg = avecFigure && !potager
        ? figureParallelogramme(S, P, { longueurs: [{ i: 0, texte: cm(a) }, { i: 1, texte: cm(b) }] }) : '';
      return nombre({
        consigne: 'Calcule',
        enonce: potager
          ? `${parmi(['Le potager de Mamie, à la tribu,', 'Le potager de l’école', 'Le jardin de Papi, à Lifou,'])} a la forme `
            + `d’un parallélogramme de côtés ${mesure(x, 'm')} et ${mesure(y, 'm')}. Quel est son périmètre ?`
          : `${nom} est un parallélogramme${svg ? '' : ` : ${S[0]}${S[1]} = ${cm(a)} et ${S[1]}${S[2]} = ${cm(b)}`}. Quel est son périmètre ?${svg}`,
        reponse: net(2 * (x + y)),
        unite,
        explication: `Les côtés opposés ont la même longueur : il y a deux côtés de ${mesure(x, unite)} et deux côtés de ${mesure(y, unite)}.<br>`
          + `2 × (${ecrire(x)} + ${ecrire(y)}) = 2 × ${ecrire(net(x + y))} = <b>${mesure(net(2 * (x + y)), unite)}</b>.`,
      });
    }
    if (variante === 'perimetreInverse') {
      const p = net(2 * (a + b));
      return nombre({
        consigne: 'Calcule',
        enonce: `${nom} est un parallélogramme de périmètre ${cm(p)}, et ${S[0]}${S[1]} = ${cm(a)}. Combien mesure ${S[1]}${S[2]} ?`,
        reponse: b,
        unite: 'cm',
        explication: `Le périmètre, c’est 2 × (${S[0]}${S[1]} + ${S[1]}${S[2]}). Donc ${S[0]}${S[1]} + ${S[1]}${S[2]} = ${ecrire(p)} ÷ 2 = ${cm(net(a + b))}.<br>`
          + `${S[1]}${S[2]} = ${ecrire(net(a + b))} − ${ecrire(a)} = <b>${cm(b)}</b>.`,
      });
    }
    // Les diagonales se coupent en leur milieu (la figure n'a pas besoin des longueurs des côtés : un parallélogramme bien ouvert)
    const svg = avecFigure ? figureParallelogramme(S, sommetsParallelogramme(1.7, 1, entier(55, 70)), { diagonales: true, centre }) : '';
    const debut = `Les diagonales du parallélogramme ${nom} se coupent en ${centre}.`;
    if (Math.random() < 0.5) {
      const d = entier(6, 18);
      return nombre({
        consigne: avecFigure ? 'Regarde la figure' : 'Calcule',
        enonce: `${debut} ${S[0]}${S[2]} = ${cm(d)}. Combien mesure ${centre}${S[0]} ?${svg}`,
        reponse: net(d / 2),
        unite: 'cm',
        explication: `Les diagonales d’un parallélogramme se coupent en leur <b>milieu</b> : ${centre} est le milieu de [${S[0]}${S[2]}].<br>`
          + `${centre}${S[0]} = ${ecrire(d)} ÷ 2 = <b>${cm(net(d / 2))}</b>.`,
      });
    }
    const h = longueurAuHasard(2, 8);
    return nombre({
      consigne: avecFigure ? 'Regarde la figure' : 'Calcule',
      enonce: `${debut} ${centre}${S[1]} = ${cm(h)}. Combien mesure ${S[1]}${S[3]} ?${svg}`,
      reponse: net(2 * h),
      unite: 'cm',
      explication: `Les diagonales d’un parallélogramme se coupent en leur <b>milieu</b> : ${centre} est le milieu de [${S[1]}${S[3]}].<br>`
        + `${S[1]}${S[3]} = 2 × ${ecrire(h)} = <b>${cm(net(2 * h))}</b>.`,
    });
  }

  // Les angles : opposés égaux, consécutifs supplémentaires
  function questionAnglesParallelogramme() {
    const [nom] = parmi(PARALLELOGRAMMES);
    const S = nom.split('');
    const alpha = mesureNonDroite();
    const j = parmi([1, 2, 2, 3]);
    const reponse = j === 2 ? alpha : 180 - alpha;
    const enonce = `${nom} est un parallélogramme et ${angle(angleQuad(S, 0))} = ${alpha}°. Combien mesure ${angle(angleQuad(S, j))} ?`;
    const explication = j === 2
      ? `${angle(angleQuad(S, j))} et ${angle(angleQuad(S, 0))} sont <b>opposés</b> : dans un parallélogramme, ils sont égaux. `
        + `${angle(angleQuad(S, j))} = <b>${alpha}°</b>.`
      : `${angle(angleQuad(S, j))} et ${angle(angleQuad(S, 0))} sont <b>consécutifs</b> : dans un parallélogramme, ils sont supplémentaires.<br>`
        + `${angle(angleQuad(S, j))} = 180° − ${alpha}° = <b>${reponse}°</b>.`;
    if (Math.random() < 0.6) {
      const P = sommetsParallelogramme(parmi([1.5, 1.7, 1.9]), 1, alpha);
      const svg = figureParallelogramme(S, P, { arcs: [{ i: 0, texte: deg(alpha) }, { i: j, texte: '?' }] });
      return nombreDegres({ consigne: 'Regarde la figure', enonce: enonce + svg, reponse, explication });
    }
    return nombreDegres({ enonce, reponse, explication });
  }

  // Les parallélogrammes particuliers, d'après une propriété
  const PARTICULIERS = [
    ['Un parallélogramme qui a un angle droit est un…', 'rectangle',
      'Un parallélogramme qui a un angle droit est un <b>rectangle</b> (ses 4 angles sont alors droits).'],
    ['Un parallélogramme dont les diagonales ont la même longueur est un…', 'rectangle',
      'Des diagonales de même longueur : c’est un <b>rectangle</b>.'],
    ['Un parallélogramme dont les diagonales sont perpendiculaires est un…', 'losange',
      'Des diagonales perpendiculaires : c’est un <b>losange</b>.'],
    ['Un parallélogramme qui a deux côtés consécutifs de même longueur est un…', 'losange',
      'Deux côtés consécutifs de même longueur : ses 4 côtés sont égaux, c’est un <b>losange</b>.'],
    ['Un parallélogramme qui a un angle droit et deux côtés consécutifs égaux est un…', 'carré',
      'Un angle droit : c’est un rectangle ; deux côtés consécutifs égaux : c’est un losange. Les deux à la fois : un <b>carré</b>.'],
    ['Un parallélogramme dont les diagonales sont perpendiculaires et de même longueur est un…', 'carré',
      'Diagonales de même longueur : rectangle ; perpendiculaires : losange. Les deux à la fois : un <b>carré</b>.'],
  ];

  // Un quadrilatère avec ses diagonales codées : quel est son nom le plus précis ?
  function questionCodage() {
    const sorte = parmi(['parallélogramme', 'rectangle', 'losange', 'carré']);
    const [nom] = parmi(PARALLELOGRAMMES);
    const svg = figureDiagonales(nom.split(''), sorte);
    const EXPLICATIONS = {
      'parallélogramme': 'Les diagonales se coupent en leur milieu : c’est un <b>parallélogramme</b>. '
        + 'Le codage ne dit pas qu’elles ont la même longueur, et aucun angle droit n’est codé.',
      'rectangle': 'Les diagonales se coupent en leur milieu et ont la même longueur (les 4 moitiés ont le même codage) : '
        + 'c’est un <b>rectangle</b>. Aucun angle droit n’est codé entre elles.',
      'losange': 'Les diagonales se coupent en leur milieu et sont perpendiculaires : c’est un <b>losange</b>. '
        + 'Le codage ne dit pas qu’elles ont la même longueur.',
      'carré': 'Les diagonales se coupent en leur milieu, ont la même longueur et sont perpendiculaires : c’est un <b>carré</b> '
        + '(c’est aussi un rectangle et un losange, mais « carré » est plus précis).',
    };
    return choix({
      consigne: 'Choisis le nom le plus précis',
      enonce: `D’après le codage, le quadrilatère ${nom} est un…${svg}`,
      reponse: sorte,
      choix: ['parallélogramme', 'rectangle', 'losange', 'carré'],
      explication: EXPLICATIONS[sorte],
    });
  }

  const PROPRIETES_PARALLELOGRAMME = [
    ['Dans un parallélogramme, les diagonales…', 'se coupent en leur milieu', ['sont perpendiculaires', 'ont la même longueur', 'sont parallèles'],
      'Les diagonales d’un parallélogramme se coupent <b>en leur milieu</b>. Elles ne sont perpendiculaires que pour un losange, '
        + 'et de même longueur que pour un rectangle.'],
    ['Dans un parallélogramme, deux angles opposés sont…', 'égaux', ['supplémentaires', 'complémentaires', 'droits'],
      'Deux angles opposés d’un parallélogramme sont <b>égaux</b>.'],
    ['Dans un parallélogramme, deux angles consécutifs sont…', 'supplémentaires', ['égaux', 'complémentaires', 'droits'],
      'Deux angles consécutifs d’un parallélogramme sont <b>supplémentaires</b> : leur somme fait 180°.'],
    ['Dans un losange, les diagonales sont toujours…', 'perpendiculaires', ['de même longueur', 'parallèles'],
      'Les diagonales d’un losange sont <b>perpendiculaires</b> (et se coupent en leur milieu).'],
    ['Dans un rectangle, les diagonales…', 'ont la même longueur', ['sont perpendiculaires', 'sont parallèles', 'ne se coupent pas'],
      'Les diagonales d’un rectangle <b>ont la même longueur</b> (et se coupent en leur milieu).'],
    ['Un parallélogramme est un quadrilatère dont les côtés opposés sont…', 'parallèles', ['perpendiculaires', 'sécants'],
      'C’est la définition : un parallélogramme a ses côtés opposés <b>parallèles</b>.'],
  ];

  const VF_PARALLELOGRAMME = [
    ['Un rectangle est un parallélogramme particulier.', true,
      'Un rectangle a ses côtés opposés parallèles : c’est un <b>parallélogramme</b> (avec des angles droits).'],
    ['Les diagonales d’un parallélogramme se coupent en leur milieu.', true,
      'C’est une propriété de <b>tous</b> les parallélogrammes.'],
    ['Dans un parallélogramme, deux angles consécutifs sont supplémentaires.', true,
      'Deux angles consécutifs font <b>180°</b> ensemble.'],
    ['Un carré est à la fois un rectangle et un losange.', true,
      'Un carré a des angles droits (rectangle) et quatre côtés égaux (losange) : il est <b>les deux</b> à la fois.'],
    ['Un parallélogramme qui a un angle droit est un rectangle.', true,
      'Un angle droit suffit : les angles consécutifs étant supplémentaires, les 4 angles sont droits. C’est un <b>rectangle</b>.'],
    ['Les diagonales d’un parallélogramme ont toujours la même longueur.', false,
      'Non : c’est vrai seulement pour un <b>rectangle</b> (ou un carré).'],
    ['Les diagonales d’un parallélogramme sont toujours perpendiculaires.', false,
      'Non : c’est vrai seulement pour un <b>losange</b> (ou un carré).'],
    ['Tout parallélogramme est un rectangle.', false,
      'Un parallélogramme n’a <b>pas forcément</b> d’angle droit.'],
    ['Dans un parallélogramme, deux angles consécutifs sont toujours égaux.', false,
      'Deux angles consécutifs sont <b>supplémentaires</b> ; ce sont les angles opposés qui sont égaux.'],
    ['Un losange a toujours des diagonales de même longueur.', false,
      'Les diagonales d’un losange sont perpendiculaires, mais pas forcément de même longueur (seulement pour un carré).'],
  ];

  ajouterEtape({
    id: '5e-geometrie-parallelogramme',
    banque: ['definition', 'definition', 'definition', 'longueurs', 'longueurs', 'longueurs', 'angles', 'angles',
      'particulier', 'particulier', 'codage', 'codage', 'propriete', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'definition') return questionDefinition();
      if (sorte === 'longueurs') return questionLongueursParallelogramme();
      if (sorte === 'angles') return questionAnglesParallelogramme();
      if (sorte === 'codage') return questionCodage();
      if (sorte === 'propriete') return choixDans('Choisis la bonne réponse', PROPRIETES_PARALLELOGRAMME);
      if (sorte === 'particulier') {
        const [enonce, reponse, explication] = parmi(PARTICULIERS);
        return choix({ consigne: 'Choisis le nom le plus précis', enonce, reponse, choix: ['rectangle', 'losange', 'carré'], explication });
      }
      return vraiFauxDans(VF_PARALLELOGRAMME);
    },
    titreLecon: 'Le parallélogramme',
    lecon: `
      <h4>Le parallélogramme et ses propriétés</h4>
      ${(() => {
        const P = sommetsParallelogramme(1.7, 1, 62, 0);
        const O = milieu(P[0], P[2]);
        return figureParallelogramme(['A', 'B', 'C', 'D'], P, { diagonales: true, centre: 'O' }).replace('</svg>',
          `${F.codage(O, P[0], 1) + F.codage(O, P[2], 1) + F.codage(O, P[1], 2) + F.codage(O, P[3], 2)}</svg>`);
      })()}
      <p>Un <b>parallélogramme</b> est un quadrilatère dont les côtés opposés sont <b>parallèles</b> : (AB) // (CD) et (AD) // (BC).</p>
      <p>Deux côtés (ou deux angles) <b>consécutifs</b> se suivent : [AB] et [BC] ; ${angle('DAB')} et ${angle('ABC')}.</p>
      <table>
        <tr><th>côtés opposés</th><td>parallèles et de même longueur : AB = CD et AD = BC</td></tr>
        <tr><th>diagonales</th><td>elles se coupent en leur milieu O : OA = OC et OB = OD</td></tr>
        <tr><th>angles opposés</th><td>égaux : ${angle('DAB')} = ${angle('BCD')}</td></tr>
        <tr><th>angles consécutifs</th><td>supplémentaires : ${angle('DAB')} + ${angle('ABC')} = 180°</td></tr>
      </table>
      <p>Inversement, un quadrilatère dont les diagonales se coupent en leur milieu est un parallélogramme.</p>
      <p>👉 <i>Périmètre : 2 × (AB + BC). Si AB = 7&nbsp;cm et BC = 4&nbsp;cm, il fait 2 × 11 = 22&nbsp;cm.</i></p>
      <h4>Les parallélogrammes particuliers</h4>
      <p>Un parallélogramme est un…</p>
      <table>
        <tr><th>rectangle</th><td>s’il a un angle droit, ou des diagonales de même longueur</td></tr>
        <tr><th>losange</th><td>s’il a deux côtés consécutifs de même longueur, ou des diagonales perpendiculaires</td></tr>
        <tr><th>carré</th><td>s’il est à la fois rectangle et losange</td></tr>
      </table>
      <p>Et dans l’autre sens : les diagonales d’un <b>rectangle</b> ont la même longueur ; celles d’un <b>losange</b> sont perpendiculaires
        (et ses 4 côtés ont la même longueur) ; celles d’un <b>carré</b> sont les deux à la fois.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde les diagonales ! Elles se coupent en leur milieu : parallélogramme ;
        en plus de même longueur : rectangle ; en plus perpendiculaires : losange ; les deux : carré.</div>
      <p>⚠️ On ne se fie pas à l’œil : seul le <b>codage</b> (ou l’énoncé) dit que des longueurs sont égales ou qu’un angle est droit.</p>
    `,
  });

  // ======================================================================
  // 5. La symétrie centrale
  // ======================================================================
  const carreaux = n => (n > 1 ? `${n}&nbsp;carreaux` : '1&nbsp;carreau');
  // Le chemin sur le quadrillage : dc colonnes (vers la droite si positif) et dl lignes (vers le bas si positif)
  function trajet(dc, dl) {
    const morceaux = [];
    if (dc) morceaux.push(`${carreaux(Math.abs(dc))} vers la ${dc > 0 ? 'droite' : 'gauche'}`);
    if (dl) morceaux.push(`${carreaux(Math.abs(dl))} vers le ${dl > 0 ? 'bas' : 'haut'}`);
    return morceaux.join(' et ');
  }

  // Le symétrique d'un point sur un quadrillage : un seul des points proposés est le bon
  function questionSymetriquePoint() {
    const g = grille(12, 8);
    const O = [entier(5, 7), entier(3, 5)];
    let d;
    do { d = [entier(-4, 4), entier(-3, 3)]; } while (Math.abs(d[0]) + Math.abs(d[1]) < 2);
    const A = [O[0] + d[0], O[1] + d[1]];
    const bon = [O[0] - d[0], O[1] - d[1]];
    const dedans = ([c, l]) => c >= 0 && c <= 12 && l >= 0 && l <= 8;
    const vus = new Set([A, O, bon].map(p => p.join(',')));
    const garder = liste => liste.filter(p => {
      if (!dedans(p) || vus.has(p.join(','))) return false;
      vus.add(p.join(','));
      return true;
    });
    // Les erreurs classiques : un retournement (comme la symétrie axiale), s'arrêter à mi-chemin, aller deux fois trop loin…
    const pairs = d[0] % 2 === 0 && d[1] % 2 === 0;
    const classiques = garder(RM.melanger([
      [O[0] - d[0], O[1] + d[1]],
      [O[0] + d[0], O[1] - d[1]],
      [O[0] - 2 * d[0], O[1] - 2 * d[1]],
      ...(pairs ? [[O[0] - d[0] / 2, O[1] - d[1] / 2], [O[0] + d[0] / 2, O[1] + d[1] / 2]] : []),
    ])).slice(0, 2);
    const decales = garder(RM.melanger([[bon[0] + 1, bon[1]], [bon[0] - 1, bon[1]], [bon[0], bon[1] + 1], [bon[0], bon[1] - 1]]));
    const faux = [...classiques, ...decales].slice(0, 3);
    const points = RM.melanger([bon, ...faux]);
    const noms = lettres(points.length, ['A']);
    const pixel = ([c, l]) => [g.X(c), g.Y(l)];
    const dessin = g.html + nommerPointsProches([{ P: pixel(A), nom: 'A' }, { P: pixel(O), nom: 'O' },
      ...points.map((p, i) => ({ P: pixel(p), nom: noms[i] }))]);
    const nomBon = noms[points.indexOf(bon)];
    return choix({
      consigne: 'Regarde le quadrillage',
      enonce: `Quel point est le symétrique de A par rapport au point O ?${F.svg(g.largeur, g.hauteur, dessin, 'Un quadrillage et des points')}`,
      reponse: nomBon,
      pieges: noms.filter(n => n !== nomBon),
      explication: `O doit être le <b>milieu</b> de [AA′]. De A jusqu’à O : ${trajet(-d[0], -d[1])}. `
        + `On continue autant après O, dans le même sens : on arrive au point <b>${nomBon}</b>.`,
    });
  }

  // Les distances : O est le milieu de [AA′]
  function questionDistanceCentre() {
    const debut = 'A′ est le symétrique de A par rapport au point O';
    const variante = parmi(['double', 'doublePrime', 'moitie']);
    if (variante === 'double' || variante === 'doublePrime') {
      const x = longueurAuHasard(1.5, 8);
      const donne = variante === 'double' ? 'OA' : 'OA′';
      const autre = variante === 'double' ? 'OA′' : 'OA';
      return nombre({
        consigne: 'Calcule',
        enonce: `${debut}, et ${donne} = ${cm(x)}. Combien mesure AA′ ?`,
        reponse: net(2 * x),
        unite: 'cm',
        explication: `O est le <b>milieu</b> de [AA′] : ${autre} = ${donne} = ${cm(x)}.<br>AA′ = ${ecrire(x)} + ${ecrire(x)} = <b>${cm(net(2 * x))}</b>.`,
      });
    }
    const L = longueurAuHasard(3, 16);
    return nombre({
      consigne: 'Calcule',
      enonce: `${debut}, et AA′ = ${cm(L)}. Combien mesure OA′ ?`,
      reponse: net(L / 2),
      unite: 'cm',
      explication: `O est le <b>milieu</b> de [AA′] : OA′ = ${ecrire(L)} ÷ 2 = <b>${cm(net(L / 2))}</b>.`,
    });
  }

  // Ce que la symétrie centrale conserve : les longueurs, les angles, les aires (avec toujours un petit calcul à faire)
  function questionConserveCentrale() {
    const variante = parmi(['cote', 'perimetre', 'angle', 'aire']);
    const debut = 'par rapport au point O';
    if (variante === 'aire') {
      const L = entier(4, 12);
      const l = entier(2, L - 1);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le rectangle A′B′C′D′ est le symétrique du rectangle ABCD ${debut}, avec AB = ${cm(L)} et BC = ${cm(l)}. `
          + 'Quelle est l’aire du rectangle A′B′C′D′ ?',
        reponse: L * l,
        unite: 'cm²',
        explication: `La symétrie centrale conserve les longueurs : A′B′ = ${cm(L)} et B′C′ = ${cm(l)}. Elle conserve donc aussi l’<b>aire</b> :<br>`
          + `${ecrire(L)} × ${ecrire(l)} = <b>${mesure(L * l, 'cm²')}</b>.`,
      });
    }
    if (variante === 'angle') {
      let a;
      let b;
      do {
        a = entier(30, 100);
        b = entier(30, 100);
      } while (180 - a - b < 25);
      return nombreDegres({
        enonce: `Le triangle A′B′C′ est le symétrique du triangle ABC ${debut}. ${angle('ABC')} = ${a}° et ${angle('BCA')} = ${b}°. `
          + `Combien mesure ${angle('B′A′C′')} ?`,
        reponse: 180 - a - b,
        explication: `Dans le triangle ABC, ${angle('BAC')} = 180° − ${a}° − ${b}° = ${180 - a - b}°. `
          + `La symétrie centrale <b>conserve les angles</b> : ${angle('B′A′C′')} = <b>${180 - a - b}°</b>.`,
      });
    }
    let l;
    do { l = [entier(3, 9), entier(3, 9), entier(3, 9)]; } while (new Set(l).size < 3 || Math.max(...l) * 2 >= l[0] + l[1] + l[2]);
    const donnees = `Le triangle A′B′C′ est le symétrique du triangle ABC ${debut}. AB = ${cm(l[0])}, BC = ${cm(l[1])} et AC = ${cm(l[2])}.`;
    if (variante === 'perimetre') {
      const p = l[0] + l[1] + l[2];
      return nombre({
        consigne: 'Calcule',
        enonce: `${donnees} Quel est le périmètre du triangle A′B′C′ ?`,
        reponse: p,
        unite: 'cm',
        explication: `La symétrie centrale <b>conserve les longueurs</b> : A′B′C′ a les mêmes côtés que le triangle ABC.<br>`
          + `${ecrire(l[0])} + ${ecrire(l[1])} + ${ecrire(l[2])} = <b>${cm(p)}</b>.`,
      });
    }
    const cotes = ['AB', 'BC', 'AC'];
    const i = entier(0, 2);
    const image = cotes[i].split('').map(x => `${x}′`).join('');
    return nombre({
      consigne: 'Calcule',
      enonce: `${donnees} Combien mesure ${image} ?`,
      reponse: l[i],
      unite: 'cm',
      explication: `[${image}] est le symétrique de [${cotes[i]}], et la symétrie centrale <b>conserve les longueurs</b> : `
        + `${image} = ${cotes[i]} = <b>${cm(l[i])}</b>.`,
    });
  }

  // Les figures qui ont un centre de symétrie (ou pas), et pourquoi
  const AVEC_CENTRE = {
    'parallélogramme': 'Le <b>parallélogramme</b> a un centre de symétrie : le point où se coupent ses diagonales.',
    'rectangle': 'Le <b>rectangle</b> est un parallélogramme : son centre de symétrie est le point où se coupent ses diagonales.',
    'losange': 'Le <b>losange</b> est un parallélogramme : son centre de symétrie est le point où se coupent ses diagonales.',
    'carré': 'Le <b>carré</b> est un parallélogramme : son centre de symétrie est le point où se coupent ses diagonales.',
    'cercle': 'Le <b>cercle</b> a un centre de symétrie : son centre.',
    'segment': 'Le <b>segment</b> a un centre de symétrie : son milieu.',
    'hexagone régulier': 'L’<b>hexagone régulier</b> ne change pas après un demi-tour autour de son centre : il a un centre de symétrie.',
  };
  const SANS_CENTRE = {
    'triangle isocèle': 'Un triangle n’a jamais de centre de symétrie : après un demi-tour, il a la pointe de l’autre côté.',
    'triangle rectangle': 'Un triangle n’a jamais de centre de symétrie : après un demi-tour, il a la pointe de l’autre côté.',
    'triangle équilatéral': 'Même équilatéral, un triangle n’a pas de centre de symétrie : après un demi-tour, il a la pointe en bas.',
    'demi-cercle': 'Après un demi-tour, le <b>demi-cercle</b> est retourné : il n’a pas de centre de symétrie.',
    'pentagone régulier': 'Après un demi-tour, le <b>pentagone régulier</b> a la pointe en bas : il n’a pas de centre de symétrie.',
  };
  function questionCentreFigure() {
    const avec = Math.random() < 0.5;
    const [bons, mauvais] = avec ? [AVEC_CENTRE, SANS_CENTRE] : [SANS_CENTRE, AVEC_CENTRE];
    const reponse = parmi(Object.keys(bons));
    return choix({
      consigne: 'Choisis la bonne figure',
      enonce: avec ? 'Laquelle de ces figures a un centre de symétrie ?' : 'Laquelle de ces figures n’a pas de centre de symétrie ?',
      reponse,
      pieges: Object.keys(mauvais),
      explication: `${bons[reponse]}<br>`
        + (avec ? 'Les triangles, le demi-cercle et le pentagone régulier n’en ont pas.'
          : 'Les parallélogrammes (rectangle, losange, carré), le cercle, le segment et l’hexagone régulier en ont un.'),
    });
  }

  // Les lettres majuscules d'imprimerie (choisies pour ne pas dépendre de la police d'écriture)
  const LETTRES_CENTRE_SEUL = ['N', 'Z'];               // un centre de symétrie, mais aucun axe
  const LETTRES_CENTRE_ET_AXES = ['H', 'O', 'X'];      // un centre et des axes
  const LETTRES_AXE_SEUL = ['A', 'C', 'D', 'E', 'M', 'T', 'U', 'V', 'Y'];  // un axe, pas de centre
  const LETTRES_RIEN = ['F', 'L', 'P', 'R'];           // ni centre, ni axe
  function questionLettresCentre() {
    const variante = parmi(['centre', 'centre', 'centreSansAxe', 'axeSansCentre']);
    if (variante === 'centre') {
      const reponse = parmi([...LETTRES_CENTRE_SEUL, ...LETTRES_CENTRE_ET_AXES]);
      return choix({
        consigne: 'Choisis la bonne lettre',
        enonce: 'Parmi ces lettres majuscules, laquelle a un centre de symétrie ?',
        reponse,
        pieges: [...LETTRES_AXE_SEUL, ...LETTRES_RIEN],
        explication: `Si on fait faire un <b>demi-tour</b> à la lettre ${reponse}, elle ne change pas : elle a un centre de symétrie. `
          + 'Les autres lettres, tournées d’un demi-tour, sont à l’envers.',
      });
    }
    // Trois pièges choisis ici (un de chaque autre famille), pour que l'explication parle des lettres affichées
    const [centreEtAxes, axeSeul, rien, centreSeul] = [LETTRES_CENTRE_ET_AXES, LETTRES_AXE_SEUL, LETTRES_RIEN, LETTRES_CENTRE_SEUL].map(l => parmi(l));
    if (variante === 'centreSansAxe') {
      const reponse = parmi(LETTRES_CENTRE_SEUL);
      return choix({
        consigne: 'Choisis la bonne lettre',
        enonce: 'Quelle lettre majuscule a un centre de symétrie, mais aucun axe de symétrie ?',
        reponse,
        pieges: [centreEtAxes, axeSeul, rien],
        explication: `La lettre <b>${reponse}</b> ne change pas après un demi-tour (centre de symétrie), mais aucun pliage ne superpose ses deux moitiés. `
          + `${centreEtAxes} a un centre, mais aussi des axes ; ${axeSeul} n’a qu’un axe ; ${rien} n’a ni centre ni axe.`,
      });
    }
    const reponse = parmi(LETTRES_AXE_SEUL);
    return choix({
      consigne: 'Choisis la bonne lettre',
      enonce: 'Quelle lettre majuscule a un axe de symétrie, mais pas de centre de symétrie ?',
      reponse,
      pieges: [centreSeul, centreEtAxes, rien],
      explication: `La lettre <b>${reponse}</b> se plie en deux moitiés qui se superposent (un axe), mais après un demi-tour, elle est à l’envers. `
        + `${centreSeul} a un centre (sans axe) ; ${centreEtAxes} a un centre et des axes ; ${rien} n’a ni centre ni axe.`,
    });
  }

  // Symétrie axiale ou symétrie centrale ? Une figure et son image sur un quadrillage
  const FORMES = [
    [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [2, 2], [2, 3], [1, 3], [1, 4], [0, 4]], // un F
    [[0, 0], [3, 0], [2, 1], [3, 2], [1, 2], [1, 4], [0, 4]],                          // un drapeau
    [[0, 0], [1, 0], [1, 3], [3, 3], [3, 4], [0, 4]],                                  // un L
    [[1, 0], [2, 0], [2, 2], [3, 2], [3, 4], [0, 4], [0, 3], [1, 3]],                  // une botte
  ];
  function questionAxialeOuCentrale() {
    const g = grille(13, 6, 24, 30);
    const centrale = Math.random() < 0.5;
    // La figure 1 occupe les colonnes 1 à 4 et les lignes 1 à 5 ; l'axe (ou le centre) est au milieu, à la colonne 6,5
    const forme = parmi(FORMES).map(([c, l]) => [c + 1, l + 1]);
    const image = forme.map(([c, l]) => (centrale ? [13 - c, 6 - l] : [13 - c, l]));
    const aGauche = Math.random() < 0.5; // la figure 1 est à gauche (ou à droite)
    const [f1, f2] = aGauche ? [forme, image] : [image, forme];
    const pixels = liste => liste.map(([c, l]) => [g.X(c), g.Y(l)]);
    const centreX = liste => g.X((Math.min(...liste.map(p => p[0])) + Math.max(...liste.map(p => p[0]))) / 2);
    const dessin = g.html + F.polygone(pixels(f1)) + F.polygone(pixels(f2))
      + F.texte([centreX(f1), g.Y(0) - 14], 'figure 1', { classe: 'fig-texte fig-petit-gras' })
      + F.texte([centreX(f2), g.Y(0) - 14], 'figure 2', { classe: 'fig-texte fig-petit-gras' });
    return choix({
      consigne: 'Regarde les deux figures',
      enonce: `La figure 2 est l’image de la figure 1 par…${F.svg(g.largeur, g.hauteur, dessin, 'Une figure et son image')}`,
      reponse: centrale ? 'une symétrie centrale' : 'une symétrie axiale',
      choix: ['une symétrie axiale', 'une symétrie centrale'],
      explication: centrale
        ? 'La figure 2 est <b>la tête en bas</b> : on a fait un demi-tour. C’est une <b>symétrie centrale</b>.'
        : 'La figure 2 est retournée comme dans un miroir, mais pas la tête en bas : on a plié le long d’une droite. '
          + 'C’est une <b>symétrie axiale</b>.',
    });
  }

  const PROPRIETES_CENTRALE = [
    ['Une symétrie centrale, c’est ___ autour du centre.', 'un demi-tour', ['un quart de tour', 'un tour complet', 'un pliage'],
      'La symétrie centrale fait faire <b>un demi-tour</b> à la figure autour du centre. (Le pliage, c’est la symétrie axiale.)'],
    ['A′ est le symétrique de A par rapport au point O. Le point O est ___ de [AA′].', 'le milieu', ['une extrémité', 'à l’extérieur'],
      'A et A′ sont de part et d’autre de O, à la même distance : O est <b>le milieu</b> de [AA′].'],
    ['Par une symétrie centrale, l’image d’une droite est une droite ___.', 'parallèle', ['perpendiculaire', 'sécante'],
      'L’image d’une droite par une symétrie centrale est une droite qui lui est <b>parallèle</b>.'],
    ['Le symétrique du point O par rapport au point O est ___.', 'O lui-même', ['un autre point', 'introuvable'],
      'Le centre ne bouge pas quand on fait un demi-tour autour de lui : son symétrique est <b>O lui-même</b>.'],
    ['Le centre de symétrie du parallélogramme ABCD est ___.', 'le milieu de [AC]', ['le point A', 'le milieu de [AB]', 'le milieu de [BC]'],
      'Le centre de symétrie d’un parallélogramme est le point où se coupent ses diagonales : <b>le milieu de [AC]</b> (et de [BD]).'],
    ['Le centre de symétrie d’un cercle est ___.', 'son centre', ['un point du cercle', 'le milieu d’un rayon'],
      'Un demi-tour autour du centre du cercle ne le change pas : son centre de symétrie est <b>son centre</b>.'],
  ];

  const VF_CENTRALE = [
    ['Si A′ est le symétrique de A par rapport à O, alors OA = OA′.', true,
      'O est le milieu de [AA′] : A et A′ sont <b>à la même distance</b> de O.'],
    ['La symétrie centrale conserve les longueurs.', true,
      'La figure symétrique est superposable à la figure de départ : les <b>longueurs</b> ne changent pas.'],
    ['Un parallélogramme a un centre de symétrie.', true,
      'Son centre de symétrie est le <b>point où se coupent ses diagonales</b>.'],
    ['Le symétrique d’une droite par rapport à un point est une droite parallèle à la première.', true,
      'Par une symétrie centrale, l’image d’une droite est une droite <b>parallèle</b>.'],
    ['La lettre N a un centre de symétrie.', true,
      'Après un demi-tour, la lettre N est toujours un N : elle a un <b>centre</b> de symétrie (mais pas d’axe).'],
    ['Un triangle équilatéral a un centre de symétrie.', false,
      'Il a 3 axes de symétrie, mais <b>pas de centre</b> : après un demi-tour, il a la pointe en bas.'],
    ['Le symétrique d’un segment par rapport à un point est deux fois plus long.', false,
      'La symétrie centrale <b>conserve les longueurs</b> : le segment symétrique a la même longueur.'],
    ['Pour obtenir le symétrique par rapport à un point, on plie la feuille.', false,
      'Plier, c’est la symétrie <b>axiale</b>. Pour la symétrie centrale, on fait un <b>demi-tour</b>.'],
    ['Si A′ est le symétrique de A par rapport à O, alors A′ est le milieu de [AO].', false,
      'C’est <b>O</b> qui est le milieu de [AA′] : A′ est de l’autre côté de O.'],
    ['La lettre A a un centre de symétrie.', false,
      'Après un demi-tour, le A est la tête en bas : il n’a <b>pas de centre</b> de symétrie (mais il a un axe vertical).'],
  ];

  // La figure de la leçon : A, O et A′, avec O au milieu
  function figureLeconCentrale() {
    const A = [70, 110];
    const O = [210, 70];
    const A2 = [350, 30];
    return F.svg(420, 140, F.segment(A, A2, 'fig-fin') + F.codage(A, O, 2) + F.codage(O, A2, 2)
      + nommer(A, 'A', 225, 18) + nommer(O, 'O', 290, 20) + nommer(A2, 'A′', 45, 18), 'Un point A et son symétrique A′');
  }

  ajouterEtape({
    id: '5e-geometrie-symetrie-centrale',
    banque: ['symetrique', 'symetrique', 'symetrique', 'distance', 'distance', 'conserve', 'conserve', 'conserve',
      'centreFigure', 'centreFigure', 'lettres', 'lettres', 'lettres', 'axialeOuCentrale', 'propriete', 'propriete', 'propriete', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'symetrique') return questionSymetriquePoint();
      if (sorte === 'distance') return questionDistanceCentre();
      if (sorte === 'conserve') return questionConserveCentrale();
      if (sorte === 'centreFigure') return questionCentreFigure();
      if (sorte === 'lettres') return questionLettresCentre();
      if (sorte === 'axialeOuCentrale') return questionAxialeOuCentrale();
      if (sorte === 'propriete') return choixDans('Choisis la bonne réponse', PROPRIETES_CENTRALE);
      return vraiFauxDans(VF_CENTRALE);
    },
    titreLecon: 'La symétrie centrale',
    lecon: `
      <h4>Le symétrique d’un point</h4>
      ${figureLeconCentrale()}
      <p>A′ est le <b>symétrique</b> de A par rapport au point O si O est le <b>milieu</b> du segment [AA′].
        Le symétrique de O est O lui-même.</p>
      <p>La symétrie centrale, c’est un <b>demi-tour</b> autour de O : la figure se retrouve la tête en bas.</p>
      <p>👉 <i>Sur un quadrillage : de A jusqu’à O, compte les carreaux (par exemple 3 vers la droite et 1 vers le haut),
        puis continue autant après O.</i></p>
      <p>Elle <b>conserve</b> les longueurs, les angles, les aires et l’alignement. L’image d’une droite est une droite <b>parallèle</b>.</p>
      <h4>Le centre de symétrie d’une figure</h4>
      <p>Une figure a un <b>centre de symétrie</b> O si elle ne change pas quand on lui fait faire un demi-tour autour de O.</p>
      <p>👉 <i>Le parallélogramme (et donc le rectangle, le losange, le carré) : le point où se coupent ses diagonales.
        Le cercle : son centre. Le segment : son milieu. L’hexagone régulier en a un aussi.
        Un triangle, le demi-cercle et le pentagone régulier : non.</i></p>
      <p>👉 <i>Les lettres H, N, O, X, Z ont un centre de symétrie ; N et Z n’ont aucun axe.</i></p>
      <table>
        <tr><th></th><th>symétrie axiale</th><th>symétrie centrale</th></tr>
        <tr><th>on…</th><td>plie le long d’une droite (d)</td><td>fait un demi-tour autour d’un point O</td></tr>
        <tr><th>A et A′</th><td>(d) est la médiatrice de [AA′]</td><td>O est le milieu de [AA′]</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour vérifier, tourne ta feuille d’un demi-tour :
        la figure symétrique doit ressembler exactement à la figure de départ.</div>
      <p>⚠️ Un triangle équilatéral a 3 axes de symétrie, mais pas de centre de symétrie !</p>
    `,
  });

  // ======================================================================
  // 6. Se repérer dans le plan
  // ======================================================================
  // Les coordonnées écrites entre parenthèses : (3 ; −2)
  const coord = (x, y) => `(${ecrire(x)}${ESPACE};${ESPACE}${ecrire(y)})`;
  const TOUCHES_RELATIFS = [',', '−']; // pour toute l'étape (les coordonnées peuvent être négatives)
  // Le repère des questions : de −6 à 6 en abscisse, de −3 à 4 en ordonnée
  // Le nom de chaque point est écrit dans un des 4 coins autour de sa croix : celui qui est le plus loin des autres croix,
  // des noms déjà écrits et des nombres écrits le long des axes (en haut à droite si rien ne gêne).
  // Les distances sont en pixels, avec 34 pixels par unité, comme dans le repère.
  function placerNoms(points, unite = 34) {
    const genes = [];
    for (let v = -6; v <= 6; v++) {
      if (v !== 0) genes.push([v * unite, 14]);            // les nombres sous l'axe des abscisses
      if (v !== 0) genes.push([-14, -v * unite]);          // les nombres à gauche de l'axe des ordonnées
    }
    genes.push([-12, 14]);                                 // le 0 de l'origine
    const croix = points.map(q => [q.x * unite, -q.y * unite]);
    const places = [];
    return points.map((q, i) => {
      let meilleure = null;
      let meilleurScore = -Infinity;
      [[12, -14], [-12, -14], [12, 14], [-12, 14]].forEach(([dx, dy], rang) => {
        const L = [croix[i][0] + dx, croix[i][1] + dy];
        const score = Math.min(
          40,
          ...croix.filter((c, j) => j !== i).map(c => Math.hypot(L[0] - c[0], L[1] - c[1])),
          ...places.map(l => Math.hypot(L[0] - l[0], L[1] - l[1]) - 4),
          ...genes.map(g => Math.hypot(L[0] - g[0], L[1] - g[1]) + 2),
        ) - rang * 0.01;
        if (score > meilleurScore) {
          meilleurScore = score;
          meilleure = { dx, dy, L };
        }
      });
      places.push(meilleure.L);
      return { ...q, dx: meilleure.dx, dy: meilleure.dy };
    });
  }
  const repere = points => F.repere({ xmin: -6, xmax: 6, ymin: -3, ymax: 4, unite: 34, points: placerNoms(points) });
  const nonNul = (min, max) => entierSauf(min, max, [0]);

  // Lire les coordonnées d'un point
  function questionLire() {
    const [P] = lettres(1);
    let x;
    let y;
    do {
      x = Math.random() < 0.15 ? 0 : nonNul(-5, 5);
      y = x === 0 ? nonNul(-3, 3) : (Math.random() < 0.15 ? 0 : nonNul(-3, 3));
    } while (Math.abs(x) === Math.abs(y));
    const bon = coord(x, y);
    const signes = RM.melanger([coord(-x, y), coord(x, -y), coord(-x, -y)]);
    const pieges = [...new Set([coord(y, x), ...signes, coord(-y, -x)])].filter(c => c !== bon).slice(0, 3);
    return choix({
      consigne: 'Lis le repère',
      enonce: `Quelles sont les coordonnées du point ${P} ?${repere([{ x, y, nom: P }])}`,
      reponse: bon,
      pieges,
      explication: `D’abord l’<b>abscisse</b>, sur l’axe horizontal : ${ecrire(x)}. Puis l’<b>ordonnée</b>, sur l’axe vertical : ${ecrire(y)}.<br>`
        + `Le point ${P} a pour coordonnées <b>${bon}</b>.`,
    });
  }

  // Trouver le point qui a ces coordonnées
  function questionPlacer() {
    let x;
    let y;
    do {
      x = nonNul(-5, 5);
      y = nonNul(-3, 3);
    } while (Math.abs(x) === Math.abs(y));
    const dansLeRepere = ([a, b]) => a >= -5 && a <= 5 && b >= -3 && b <= 3;
    const inverse = [y, x];
    const autres = RM.melanger([[-x, y], [x, -y], [-x, -y]]);
    const faux = (dansLeRepere(inverse) ? [inverse, ...autres] : autres).slice(0, 3);
    const points = RM.melanger([[x, y], ...faux]);
    const noms = lettres(4);
    const nomBon = noms[points.findIndex(p => p[0] === x && p[1] === y)];
    const svg = repere(points.map(([a, b], i) => ({ x: a, y: b, nom: noms[i] })));
    return choix({
      consigne: 'Lis le repère',
      enonce: `Quel point a pour coordonnées ${coord(x, y)} ?${svg}`,
      reponse: nomBon,
      pieges: noms.filter(n => n !== nomBon),
      explication: `L’abscisse ${ecrire(x)} : on va ${x > 0 ? 'à droite' : 'à gauche'} de l’origine, jusqu’à ${ecrire(x)}. `
        + `L’ordonnée ${ecrire(y)} : on ${y > 0 ? 'monte' : 'descend'} jusqu’à ${ecrire(y)}. C’est le point <b>${nomBon}</b>.`,
    });
  }

  // L'abscisse ou l'ordonnée d'un point (à taper)
  function questionCoordonnee() {
    const quoi = parmi(['abscisse', 'ordonnée']);
    const [P] = lettres(1);
    if (Math.random() < 0.5) {
      const x = nonNul(-5, 5);
      const y = entierSauf(-3, 3, [0, x, -x]);
      const v = quoi === 'abscisse' ? x : y;
      return nombre({
        consigne: 'Lis le repère',
        enonce: `Quelle est l’${quoi} du point ${P} ?${repere([{ x, y, nom: P }])}`,
        reponse: v,
        touches: TOUCHES_RELATIFS,
        explication: quoi === 'abscisse'
          ? `L’abscisse se lit sur l’axe <b>horizontal</b>, juste au-dessus ou au-dessous du point : <b>${ecrire(v)}</b>.`
          : `L’ordonnée se lit sur l’axe <b>vertical</b>, à la hauteur du point : <b>${ecrire(v)}</b>.`,
      });
    }
    const tirer = max => (Math.random() < 0.3 ? parmi([-1, 1]) * (entier(0, max - 1) + 0.5) : nonNul(-max, max));
    const x = tirer(9);
    let y;
    do { y = tirer(9); } while (y === x);
    const v = quoi === 'abscisse' ? x : y;
    const tresor = Math.random() < 0.3;
    const nom = tresor ? 'T' : P;
    return nombre({
      consigne: 'Écris le nombre',
      enonce: tresor
        ? `Sur la carte au trésor de Roxy, le trésor est caché sur un îlot du lagon, au point T${coord(x, y)}. Quelle est l’${quoi} de ce point ?`
        : `Quelle est l’${quoi} du point ${P}${coord(x, y)} ?`,
      reponse: v,
      touches: TOUCHES_RELATIFS,
      explication: `Dans ${nom}${coord(x, y)}, le premier nombre est l’abscisse, le second est l’ordonnée : `
        + `l’${quoi} est <b>${ecrire(v)}</b>.`,
    });
  }

  // Un point est-il sur un axe ?
  const BOUTONS_AXES = ['sur l’axe des abscisses', 'sur l’axe des ordonnées', 'sur aucun des deux axes'];
  function questionAxes() {
    const [P] = lettres(1);
    const cas = parmi(['abscisses', 'abscisses', 'ordonnées', 'ordonnées', 'aucun']);
    let x = 0;
    let y = 0;
    if (cas === 'abscisses') x = nonNul(-9, 9);
    if (cas === 'ordonnées') y = nonNul(-9, 9);
    if (cas === 'aucun') [x, y] = [nonNul(-9, 9), nonNul(-9, 9)];
    const EXPLICATIONS = {
      abscisses: `L’ordonnée de ${P} est 0 : ${P} est à la hauteur de l’origine, <b>sur l’axe des abscisses</b> (l’axe horizontal).`,
      ordonnées: `L’abscisse de ${P} est 0 : ${P} n’est ni à droite ni à gauche de l’origine, il est <b>sur l’axe des ordonnées</b> (l’axe vertical).`,
      aucun: `Ni l’abscisse ni l’ordonnée de ${P} n’est égale à 0 : ${P} n’est <b>sur aucun des deux axes</b>.`,
    };
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `Où se trouve le point ${P}${coord(x, y)} ?`,
      reponse: { abscisses: BOUTONS_AXES[0], ordonnées: BOUTONS_AXES[1], aucun: BOUTONS_AXES[2] }[cas],
      choix: BOUTONS_AXES,
      explication: EXPLICATIONS[cas],
    });
  }

  // Où est le point par rapport à l'origine ? (les signes des coordonnées)
  const BOUTONS_POSITION = ['en haut à gauche', 'en haut à droite', 'en bas à gauche', 'en bas à droite'];
  function questionPosition() {
    const [P] = lettres(1);
    const x = nonNul(-9, 9);
    const y = nonNul(-9, 9);
    const reponse = `en ${y > 0 ? 'haut' : 'bas'} à ${x > 0 ? 'droite' : 'gauche'}`;
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `Où se trouve le point ${P}${coord(x, y)} par rapport à l’origine du repère ?`,
      reponse,
      choix: BOUTONS_POSITION,
      explication: `L’abscisse ${ecrire(x)} est ${x > 0 ? 'positive : à droite' : 'négative : à gauche'}. `
        + `L’ordonnée ${ecrire(y)} est ${y > 0 ? 'positive : en haut' : 'négative : en bas'}. ${P} est <b>${reponse}</b>.`,
    });
  }

  // Le symétrique d'un point par rapport à l'origine : on change les signes des deux coordonnées
  function questionSymetriqueOrigine() {
    const [P] = lettres(1);
    let x;
    let y;
    do {
      x = nonNul(-8, 8);
      y = nonNul(-8, 8);
    } while (Math.abs(x) === Math.abs(y));
    return choix({
      consigne: 'Choisis les bonnes coordonnées',
      enonce: `Quelles sont les coordonnées du symétrique de ${P}${coord(x, y)} par rapport à l’origine ?`,
      reponse: coord(-x, -y),
      pieges: [coord(x, -y), coord(-x, y), coord(-y, -x), coord(y, x)],
      explication: `Le symétrique par rapport à l’origine O est de l’autre côté de O, à la même distance : `
        + `on prend l’<b>opposé</b> des deux coordonnées. ${P}′<b>${coord(-x, -y)}</b>.`,
    });
  }

  const VOCABULAIRE_REPERE = [
    ['L’axe horizontal d’un repère s’appelle l’axe des ___.', 'abscisses', ['ordonnées', 'coordonnées'],
      'L’axe horizontal est l’axe des <b>abscisses</b> ; l’axe vertical est l’axe des ordonnées.'],
    ['L’axe vertical d’un repère s’appelle l’axe des ___.', 'ordonnées', ['abscisses', 'coordonnées'],
      'L’axe vertical est l’axe des <b>ordonnées</b> ; l’axe horizontal est l’axe des abscisses.'],
    ['Le point de coordonnées (0&nbsp;;&nbsp;0) s’appelle ___ du repère.', 'l’origine', ['l’abscisse', 'l’ordonnée', 'le milieu'],
      'Le point où se coupent les deux axes, de coordonnées (0&nbsp;;&nbsp;0), est <b>l’origine</b> du repère.'],
  ];
  // Dans A(5 ; −2), que représente ce nombre ?
  function questionVocabulaireRepere() {
    if (Math.random() < 0.4) return choixDans('Choisis la bonne réponse', VOCABULAIRE_REPERE);
    const [P] = lettres(1);
    let x;
    let y;
    do {
      x = nonNul(-9, 9);
      y = nonNul(-9, 9);
    } while (x === y);
    const premier = Math.random() < 0.5;
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `Dans ${P}${coord(x, y)}, le nombre ${ecrire(premier ? x : y)} est ___ du point ${P}.`,
      reponse: premier ? 'l’abscisse' : 'l’ordonnée',
      choix: ['l’abscisse', 'l’ordonnée', 'la distance à l’origine'],
      explication: `On écrit toujours l’<b>abscisse</b> en premier, puis l’<b>ordonnée</b> : ${ecrire(x)} est l’abscisse et ${ecrire(y)} l’ordonnée.`,
    });
  }

  const VF_REPERE = [
    ['Tous les points de l’axe des abscisses ont une ordonnée égale à 0.', true,
      'Sur l’axe des abscisses, on est à la hauteur de l’origine : l’<b>ordonnée</b> vaut 0. Exemple : (4&nbsp;;&nbsp;0).'],
    ['Dans un repère, on écrit toujours l’abscisse avant l’ordonnée.', true,
      'L’ordre est toujours le même : (<b>abscisse</b>&nbsp;;&nbsp;<b>ordonnée</b>).'],
    ['Le point (0&nbsp;;&nbsp;5) est sur l’axe des ordonnées.', true,
      'Son abscisse est 0 : il est <b>sur l’axe des ordonnées</b>, 5 unités au-dessus de l’origine.'],
    ['L’origine du repère a pour coordonnées (0&nbsp;;&nbsp;0).', true,
      'L’origine est le point où se coupent les axes : ses coordonnées sont <b>(0&nbsp;;&nbsp;0)</b>.'],
    ['Les points (2&nbsp;;&nbsp;5) et (5&nbsp;;&nbsp;2) sont le même point.', false,
      'L’ordre compte ! (2&nbsp;;&nbsp;5) a pour abscisse 2, et (5&nbsp;;&nbsp;2) a pour abscisse 5 : ce sont <b>deux points différents</b>.'],
    ['Le point (0&nbsp;;&nbsp;5) est sur l’axe des abscisses.', false,
      'Son <b>abscisse</b> est 0 : il est sur l’axe des <b>ordonnées</b>.'],
    ['L’abscisse d’un point se lit sur l’axe vertical.', false,
      'L’abscisse se lit sur l’axe <b>horizontal</b> ; l’ordonnée, sur l’axe vertical.'],
    ['Un point d’ordonnée négative est au-dessus de l’axe des abscisses.', false,
      'Une ordonnée négative : le point est <b>en dessous</b> de l’axe des abscisses.'],
  ];
  // Un vrai ou faux sur la place d'un point (à gauche, à droite, au-dessus, en dessous)
  function vraiFauxPlace() {
    const [P] = lettres(1);
    const x = nonNul(-9, 9);
    const y = nonNul(-9, 9);
    const [phrase, vrai, pourquoi] = parmi([
      ['à droite de l’axe des ordonnées', x > 0, `son abscisse ${ecrire(x)} est ${x > 0 ? 'positive' : 'négative'}`],
      ['à gauche de l’axe des ordonnées', x < 0, `son abscisse ${ecrire(x)} est ${x > 0 ? 'positive' : 'négative'}`],
      ['au-dessus de l’axe des abscisses', y > 0, `son ordonnée ${ecrire(y)} est ${y > 0 ? 'positive' : 'négative'}`],
      ['en dessous de l’axe des abscisses', y < 0, `son ordonnée ${ecrire(y)} est ${y > 0 ? 'positive' : 'négative'}`],
    ]);
    return vraiFaux({
      enonce: `Le point ${P}${coord(x, y)} est ${phrase}.`,
      vrai,
      explication: `${pourquoi[0].toUpperCase()}${pourquoi.slice(1)} : ${P} est <b>${x > 0 ? 'à droite' : 'à gauche'}</b> de l’axe des ordonnées `
        + `et <b>${y > 0 ? 'au-dessus' : 'en dessous'}</b> de l’axe des abscisses.`,
    });
  }

  ajouterEtape({
    id: '5e-geometrie-reperage',
    banque: ['lire', 'lire', 'placer', 'placer', 'coordonnee', 'coordonnee', 'coordonnee', 'coordonnee', 'coordonnee', 'axes', 'axes',
      'position', 'position', 'symetrique', 'symetrique', 'vocabulaire', 'vocabulaire', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'lire') return questionLire();
      if (sorte === 'placer') return questionPlacer();
      if (sorte === 'coordonnee') return questionCoordonnee();
      if (sorte === 'axes') return questionAxes();
      if (sorte === 'position') return questionPosition();
      if (sorte === 'symetrique') return questionSymetriqueOrigine();
      if (sorte === 'vocabulaire') return questionVocabulaireRepere();
      return Math.random() < 0.5 ? vraiFauxDans(VF_REPERE) : vraiFauxPlace();
    },
    titreLecon: 'Se repérer dans le plan',
    lecon: `
      <h4>Le repère et les coordonnées</h4>
      ${F.repere({
        xmin: -4, xmax: 4, ymin: -3, ymax: 3, unite: 34,
        points: [{ x: 3, y: 2, nom: 'A' }, { x: -2, y: -1, nom: 'B', dx: -12, dy: 14 }],
        traces: [[[3, 0], [3, 2]], [[0, 2], [3, 2]], [[-0.7, -1], [-2, -1]], [[-2, -0.6], [-2, -1]]]
          .map(segment => ({ segment, classe: 'fig-marque fig-cache' })),
      })}
      <p>Un <b>repère</b> est formé de deux axes gradués qui se coupent en un point O, l’<b>origine</b>.
        L’axe horizontal est l’<b>axe des abscisses</b> ; l’axe vertical est l’<b>axe des ordonnées</b>.</p>
      <p>Un point a deux <b>coordonnées</b>, entre parenthèses et séparées par un point-virgule :
        d’abord l’<b>abscisse</b> (lue sur l’axe horizontal), puis l’<b>ordonnée</b> (lue sur l’axe vertical).</p>
      <p>👉 <i>A(3&nbsp;;&nbsp;2) : abscisse 3, ordonnée 2.</i> · <i>B(−2&nbsp;;&nbsp;−1) : abscisse −2, ordonnée −1.</i></p>
      <p>Abscisse positive : à droite de l’axe des ordonnées ; négative : à gauche. Ordonnée positive : au-dessus de l’axe
        des abscisses ; négative : en dessous.</p>
      <p>Un point de l’axe des abscisses a une ordonnée égale à 0 : (4&nbsp;;&nbsp;0). Un point de l’axe des ordonnées a une abscisse
        égale à 0 : (0&nbsp;;&nbsp;−3). L’origine O a pour coordonnées (0&nbsp;;&nbsp;0).</p>
      <p>Le symétrique de A(3&nbsp;;&nbsp;2) par rapport à l’origine est A′(−3&nbsp;;&nbsp;−2) : on prend l’opposé des deux coordonnées.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> d’abord on marche dans le couloir (l’abscisse, à l’horizontale),
        puis on prend l’ascenseur (l’ordonnée, à la verticale).</div>
      <p>⚠️ (2&nbsp;;&nbsp;5) et (5&nbsp;;&nbsp;2) ne sont pas le même point : l’ordre compte !</p>
    `,
  });
})();
