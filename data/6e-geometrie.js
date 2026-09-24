// Renard Malin — Maths, niveau 6e : les 7 étapes de la Clairière de la Géométrie
//
// Les questions sont fabriquées au hasard : on tire les points, les droites et les mesures, le code calcule
// la bonne réponse et dessine la figure (en SVG). Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, decimal, ecrire, mesure, net, arrondir, angle, angleTexte,
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
  // Un point (une petite croix) et son nom, écrit à « distance » pixels dans la direction « degres »
  function nommer(P, nom, degres, distance = 20) {
    const [dx, dy] = vers([0, 0], distance, degres);
    return F.point(P, nom, { dx, dy });
  }
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
          ...points.filter(q => q.P !== P).map(q => Math.hypot(L[0] - q.P[0], L[1] - q.P[1])),
          ...places.map(l => Math.hypot(L[0] - l[0], L[1] - l[1]) - 3),
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
  const r1 = x => Math.round(x * 10) / 10; // arrondir au dixième de pixel
  // Un trait en pointillés (une arête cachée d'un solide) : un trait brun moyen (fig-marque), en pointillés (fig-cache)
  const pointilles = (A, B) => F.segment(A, B, 'fig-marque fig-cache');
  // Des lettres différentes pour nommer les points (O est gardée pour le centre du cercle ;
  // on évite I, J, Q, U, V, W, X, Y, Z, qui se confondent ou servent ailleurs,
  // et E et L, pour ne pas écrire des segments qui se lisent comme des mots : « LE », « SE », « DE », « LA »…)
  const LETTRES = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'K', 'M', 'N', 'P', 'R', 'S', 'T'];
  const lettres = (n, interdites = []) => RM.melanger(LETTRES.filter(l => !interdites.includes(l))).slice(0, n);
  const PRENOMS = ['Léa', 'Tom', 'Zoé', 'Hugo', 'Inès', 'Sami', 'Lina', 'Noé'];
  const FILLES = ['Léa', 'Zoé', 'Inès', 'Lina']; // pour écrire « doit-elle » ou « doit-il »
  // Les lettres qu'on peut coller à O sans écrire un mot (« OK », « ON », « OR », « OH »…)
  const LETTRES_AVEC_O = ['A', 'B', 'C', 'D', 'M', 'P', 'T'];
  // « de Tom », mais « d’Inès »
  const de = prenom => (/^[AEIOUÉÈÂÎ]/.test(prenom) ? `d’${prenom}` : `de ${prenom}`);
  // Un nombre entier ou un nombre avec un demi (2 ; 2,5 ; 3…), entre min et max
  function entierOuDemi(min, max) {
    const possibles = [];
    for (let x = Math.ceil(min * 2); x <= Math.floor(max * 2); x++) possibles.push(x / 2);
    return parmi(possibles);
  }
  // Une longueur en cm pour les questions : un entier ou un nombre à un chiffre après la virgule
  const longueurAuHasard = (min, max) => (Math.random() < 0.5 ? entier(Math.ceil(min), Math.floor(max)) : decimal(min, max, 1));

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

  // Tourner des points autour de (0, 0), puis les placer au milieu d'un dessin de largeur × hauteur
  function tourner(points, degres) {
    const c = Math.cos(degres * RAD);
    const s = Math.sin(degres * RAD);
    return points.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  }
  function centrer(points, largeur, hauteur) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const dx = largeur / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
    const dy = hauteur / 2 - (Math.min(...ys) + Math.max(...ys)) / 2;
    return points.map(([x, y]) => [x + dx, y + dy]);
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
  // 1. Points, droites et segments
  // ======================================================================
  // Les quatre notations, et ce qu'elles désignent
  const NOTATIONS = {
    droite: (X, Y) => `(${X}${Y})`,
    segment: (X, Y) => `[${X}${Y}]`,
    demiDroite: (X, Y) => `[${X}${Y})`,
    longueur: (X, Y) => `${X}${Y}`,
  };
  const SENS = { droite: 'une droite', segment: 'un segment', demiDroite: 'une demi-droite', longueur: 'une longueur' };
  const SENS_EXPLIQUE = {
    droite: 'Des parenthèses : c’est une <b>droite</b>, illimitée des deux côtés.',
    segment: 'Des crochets des deux côtés : c’est un <b>segment</b>, limité par ses deux extrémités.',
    demiDroite: 'Un crochet d’un côté (l’origine) et une parenthèse de l’autre : c’est une <b>demi-droite</b>.',
    longueur: 'Deux lettres sans crochets ni parenthèses : c’est une <b>longueur</b> (la longueur du segment), un nombre.',
  };

  // Une droite, un segment ou une demi-droite, tracé à travers deux points : quelle est la bonne notation ?
  function questionTrace() {
    const [X, Y] = lettres(2);
    const sorte = parmi(['droite', 'segment', 'demiDroite', 'demiDroite']);
    const theta = entier(-15, 15);
    const C = [230, 80];
    const pX = vers(C, 95, theta + 180); // le point X, à gauche
    const pY = vers(C, 95, theta);       // le point Y, à droite
    const bout1 = vers(C, 215, theta + 180);
    const bout2 = vers(C, 215, theta);
    const origineX = Math.random() < 0.5; // l'origine de la demi-droite : X ou Y
    let trait;
    if (sorte === 'droite') trait = F.segment(bout1, bout2);
    else if (sorte === 'segment') trait = F.segment(pX, pY);
    else trait = origineX ? F.segment(pX, bout2) : F.segment(pY, bout1);
    const svg = F.svg(460, 160, trait + nommer(pX, X, theta + 90) + nommer(pY, Y, theta + 90), 'Deux points et un trait');

    // Pour la droite et le segment, l'ordre des lettres ne compte pas : (XY) = (YX)
    const [a, b] = RM.melanger([X, Y]);
    let reponse;
    let pieges;
    let explication;
    if (sorte === 'droite') {
      reponse = `(${a}${b})`;
      pieges = [`[${a}${b}]`, `[${X}${Y})`, `[${Y}${X})`];
      explication = `Le trait dépasse ${X} et ${Y} des deux côtés : c’est une <b>droite</b> (elle ne s’arrête jamais). `
        + `Elle se note avec des parenthèses : <b>(${a}${b})</b>.`;
    } else if (sorte === 'segment') {
      reponse = `[${a}${b}]`;
      pieges = [`(${a}${b})`, `[${X}${Y})`, `[${Y}${X})`];
      explication = `Le trait s’arrête en ${X} et en ${Y} : c’est un <b>segment</b>. Il se note avec des crochets : <b>[${a}${b}]</b>.`;
    } else {
      const [o, p] = origineX ? [X, Y] : [Y, X];
      reponse = `[${o}${p})`;
      pieges = [`[${p}${o})`, `(${o}${p})`, `[${o}${p}]`];
      explication = `Le trait s’arrête en ${o} et continue après ${p} : c’est la <b>demi-droite</b> d’origine ${o}. `
        + `Le crochet se met du côté de l’origine : <b>[${o}${p})</b>.`;
    }
    return choix({ consigne: 'Regarde la figure', enonce: `Comment note-t-on ce qui est tracé ?${svg}`, reponse, pieges, explication });
  }

  // Un point appartient-il à la droite, au segment, à la demi-droite ?
  function questionAppartient() {
    const [X, Y, P1, P2, P3, P4] = lettres(6);
    const theta = entier(-12, 12);
    const A = [150, 110];
    const sur = t => vers(A, 130 * t, theta); // le point de la droite (XY) « à t » : X pour t = 0, Y pour t = 1
    // P1 entre X et Y, P2 après Y, P3 avant X ; P4 n'est pas sur la droite
    const t = { [P1]: entier(40, 60) / 100, [P2]: entier(155, 180) / 100, [P3]: -entier(55, 75) / 100 };
    const cote = parmi([1, -1]); // P4 est d'un côté de la droite, les noms des autres points de l'autre côté
    const pP4 = vers(sur(entier(25, 75) / 100), 52, theta + 90 * cote);
    const autreCote = theta - 90 * cote;
    let dessin = F.segment(sur(-1.05), sur(2.3));
    dessin += nommer(sur(0), X, autreCote) + nommer(sur(1), Y, autreCote);
    [P1, P2, P3].forEach(n => { dessin += nommer(sur(t[n]), n, autreCote); });
    dessin += nommer(pP4, P4, theta + 90 * cote, 18);
    const svg = F.svg(460, 220, dessin, 'Une droite et des points');

    const objet = parmi(['droite', 'segment', 'demiXY', 'demiYX']);
    const nom = parmi([P1, P2, P3, P4]);
    const notation = { droite: `(${X}${Y})`, segment: `[${X}${Y}]`, demiXY: `[${X}${Y})`, demiYX: `[${Y}${X})` }[objet];
    const tt = t[nom];
    const dedans = nom !== P4 && (objet === 'droite' || (objet === 'segment' && tt >= 0 && tt <= 1)
      || (objet === 'demiXY' && tt >= 0) || (objet === 'demiYX' && tt <= 1));
    const symbole = dedans ? '∈' : '∉';
    const conclusion = `Donc <b>${nom} ${symbole} ${notation}</b>.`;
    let explication;
    if (nom === P4) {
      explication = `${nom} n’est pas sur la droite (${X}${Y}) : il n’est sur aucune partie de cette droite. ${conclusion}`;
    } else if (objet === 'droite') {
      explication = `${nom} est sur la droite (${X}${Y}), qui continue des deux côtés. ${conclusion}`;
    } else if (objet === 'segment') {
      explication = dedans
        ? `${nom} est entre ${X} et ${Y} : il est sur le segment. ${conclusion}`
        : `${nom} est sur la droite (${X}${Y}), mais pas entre ${X} et ${Y} : il n’est pas sur le segment. ${conclusion}`;
    } else {
      const [o, p] = objet === 'demiXY' ? [X, Y] : [Y, X];
      explication = dedans
        ? `La demi-droite ${notation} part de ${o} et passe par ${p}, sans s’arrêter : ${nom} est dessus. ${conclusion}`
        : `La demi-droite ${notation} part de ${o} et va du côté de ${p}. ${nom} est de l’autre côté de ${o} : il n’est pas dessus. ${conclusion}`;
    }
    return choix({
      consigne: 'Complète avec ∈ ou ∉',
      enonce: `${nom} ___ ${notation}${svg}`,
      reponse: symbole,
      choix: ['∈', '∉'],
      solution: `${nom} <b>${symbole}</b> ${notation}`,
      explication,
    });
  }

  // Trois points alignés (et un quatrième qui ne l'est pas)
  function questionAlignes() {
    const [n1, n2, n3, n4] = lettres(4);
    const theta = entier(-30, 30);
    const C = [230, 115];
    const P1 = vers(C, 150, theta + 180);
    const P3 = vers(C, 150, theta);
    const entre = t => [P1[0] + (P3[0] - P1[0]) * t, P1[1] + (P3[1] - P1[1]) * t];
    const P2 = entre(entier(35, 65) / 100);
    // Le 4e point, à 60 pixels de la droite, du côté où il reste bien dans le dessin
    const base = entre(entier(15, 85) / 100);
    let cote = parmi([1, -1]);
    const y4 = vers(base, 60, theta + 90 * cote)[1];
    if (y4 < 40 || y4 > 190) cote = -cote;
    const P4 = vers(base, 60, theta + 90 * cote);
    const dessin = nommer(P1, n1, theta - 90 * cote) + nommer(P2, n2, theta - 90 * cote) + nommer(P3, n3, theta - 90 * cote)
      + nommer(P4, n4, theta + 90 * cote);
    const svg = F.svg(460, 230, dessin, 'Quatre points');
    // « A, D et K » (dans l'ordre de l'alphabet)
    const trio = liste => { const [a, b, c] = [...liste].sort(); return `${a}, ${b} et ${c}`; };
    return choix({
      consigne: 'Regarde bien la figure',
      enonce: `Quels sont les trois points alignés ?${svg}`,
      reponse: trio([n1, n2, n3]),
      pieges: [trio([n1, n2, n4]), trio([n1, n3, n4]), trio([n2, n3, n4])],
      explication: `Les points ${trio([n1, n2, n3])} sont sur une même droite : ils sont <b>alignés</b>. ${n4} n’est pas sur cette droite.`,
    });
  }

  const VF_VOCABULAIRE = [
    ['Par deux points différents, il passe une seule droite.', true,
      'Par deux points A et B, on ne peut tracer qu’<b>une seule droite</b> : la droite (AB).'],
    ['(AB) et (BA) désignent la même droite.', true,
      'C’est la même droite, qui passe par A et par B : on peut écrire <b>(AB) ou (BA)</b>. De même, [AB] et [BA] sont le même segment.'],
    ['Si C ∈ [AB], alors les points A, B et C sont alignés.', true,
      'C est sur le segment [AB], donc sur la droite (AB) : les trois points sont sur une même droite. Ils sont <b>alignés</b>.'],
    ['Si I est le milieu de [AB], alors IA = IB.', true,
      'Le milieu est à <b>égale distance</b> des deux extrémités : IA = IB = AB ÷ 2.'],
    ['Les points A et B appartiennent au segment [AB].', true,
      'Les extrémités d’un segment en font partie : <b>A ∈ [AB]</b> et <b>B ∈ [AB]</b>.'],
    ['On peut mesurer la longueur d’une droite.', false,
      'Une droite est <b>illimitée</b> : elle n’a pas de longueur. On mesure la longueur d’un <b>segment</b>.'],
    ['[AB) et [BA) désignent la même demi-droite.', false,
      '[AB) part de A et passe par B ; [BA) part de B et passe par A. Elles n’ont <b>pas la même origine</b> : ce sont deux demi-droites différentes.'],
    ['Si A, B et C sont alignés, alors C est le milieu de [AB].', false,
      'Des points alignés sont sur une même droite, mais C peut être n’importe où sur cette droite. Pour être le milieu, il faut aussi <b>CA = CB</b>.'],
    ['Une demi-droite a deux extrémités.', false,
      'Une demi-droite a <b>une seule</b> extrémité : son origine. De l’autre côté, elle est illimitée.'],
    ['Par un point, il ne passe qu’une seule droite.', false,
      'Par un point, on peut tracer <b>autant de droites qu’on veut</b>. Il faut deux points pour n’avoir qu’une seule droite.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-vocabulaire',
    banque: ['trace', 'trace', 'notation', 'notation', 'sens', 'appartient', 'appartient', 'alignes',
      'milieu', 'milieu', 'longueurs', 'longueurs', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'trace') return questionTrace();
      if (sorte === 'appartient') return questionAppartient();
      if (sorte === 'alignes') return questionAlignes();
      if (sorte === 'vraiFaux') return vraiFauxDans(VF_VOCABULAIRE);
      const [X, Y, C] = lettres(3);

      if (sorte === 'notation') {
        // La phrase → la notation
        const cas = parmi([
          ['droite', `La droite qui passe par ${X} et ${Y} se note ___.`],
          ['segment', `Le segment d’extrémités ${X} et ${Y} se note ___.`],
          ['demiDroite', `La demi-droite d’origine ${X} qui passe par ${Y} se note ___.`],
          ['longueur', `La longueur du segment [${X}${Y}] se note ___.`],
        ]);
        const [objet, enonce] = cas;
        const pieges = Object.keys(NOTATIONS).filter(o => o !== objet).map(o => NOTATIONS[o](X, Y));
        if (objet === 'demiDroite') pieges.push(`[${Y}${X})`);
        return choix({
          consigne: 'Choisis la bonne notation',
          enonce,
          reponse: NOTATIONS[objet](X, Y),
          pieges,
          explication: SENS_EXPLIQUE[objet]
            + (objet === 'demiDroite' ? ` Le crochet se met du côté de l’origine ${X} : [${X}${Y}).` : ''),
        });
      }
      if (sorte === 'sens') {
        // La notation → ce qu'elle désigne
        const objet = parmi(Object.keys(NOTATIONS));
        return choix({
          consigne: 'Choisis la bonne réponse',
          enonce: `Que désigne ${NOTATIONS[objet](X, Y)} ?`,
          reponse: SENS[objet],
          pieges: Object.values(SENS),
          explication: SENS_EXPLIQUE[objet],
        });
      }
      if (sorte === 'milieu') {
        const I = parmi(['I', 'M', 'K'].filter(l => l !== X && l !== Y));
        if (Math.random() < 0.5) {
          // La longueur du segment → la moitié
          const l = Math.random() < 0.6 ? entier(4, 19) : decimal(3.2, 12.8, 1);
          const bout = parmi([X, Y]);
          return nombre({
            consigne: 'Calcule',
            enonce: `${I} est le milieu du segment [${X}${Y}], et ${X}${Y} = ${mesure(l, 'cm')}. Combien mesure ${bout}${I} ?`,
            reponse: net(l / 2),
            unite: 'cm',
            explication: `Le milieu partage le segment en <b>deux longueurs égales</b> :<br>`
              + `${bout}${I} = ${X}${Y} ÷ 2 = ${ecrire(l)} ÷ 2 = <b>${mesure(net(l / 2), 'cm')}</b>.`,
          });
        }
        // La moitié → la longueur du segment
        const d = Math.random() < 0.6 ? entier(2, 9) : decimal(1.2, 8.4, 1);
        return nombre({
          consigne: 'Calcule',
          enonce: `${I} est le milieu du segment [${X}${Y}], et ${X}${I} = ${mesure(d, 'cm')}. Combien mesure ${X}${Y} ?`,
          reponse: net(2 * d),
          unite: 'cm',
          explication: `Le milieu partage le segment en deux longueurs égales : le segment entier est <b>deux fois plus long</b>.<br>`
            + `${X}${Y} = 2 × ${X}${I} = 2 × ${ecrire(d)} = <b>${mesure(net(2 * d), 'cm')}</b>.`,
        });
      }
      // longueurs : un point sur un segment le partage en deux morceaux
      if (Math.random() < 0.5) {
        const a = longueurAuHasard(1.5, 8.5);
        const b = longueurAuHasard(1.5, 8.5);
        return nombre({
          consigne: 'Calcule',
          enonce: `Le point ${C} est sur le segment [${X}${Y}]. ${X}${C} = ${mesure(a, 'cm')} et ${C}${Y} = ${mesure(b, 'cm')}. Combien mesure ${X}${Y} ?`,
          reponse: net(a + b),
          unite: 'cm',
          explication: `${C} est sur [${X}${Y}], entre ${X} et ${Y} : ${X}${Y} = ${X}${C} + ${C}${Y}.<br>`
            + `${ecrire(a)} + ${ecrire(b)} = <b>${mesure(net(a + b), 'cm')}</b>.`,
        });
      }
      const L = entier(6, 15);
      const a = longueurAuHasard(1.5, L - 1.5);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point ${C} est sur le segment [${X}${Y}], qui mesure ${mesure(L, 'cm')}. ${X}${C} = ${mesure(a, 'cm')}. Combien mesure ${C}${Y} ?`,
        reponse: net(L - a),
        unite: 'cm',
        explication: `${C} est sur [${X}${Y}] : ${X}${C} + ${C}${Y} = ${X}${Y}. Donc ${C}${Y} = ${X}${Y} − ${X}${C}.<br>`
          + `${ecrire(L)} − ${ecrire(a)} = <b>${mesure(net(L - a), 'cm')}</b>.`,
      });
    },
    titreLecon: 'Points, droites et segments',
    lecon: `
      <h4>Droite, segment, demi-droite</h4>
      ${F.svg(420, 170,
        F.segment([20, 35], [300, 35]) + nommer([100, 35], 'A', 90, 18) + nommer([220, 35], 'B', 90, 18)
        + F.texte([370, 35], '(AB)', { classe: 'fig-texte fig-petit-gras' })
        + F.segment([100, 90], [220, 90]) + nommer([100, 90], 'C', 90, 18) + nommer([220, 90], 'D', 90, 18)
        + F.texte([370, 90], '[CD]', { classe: 'fig-texte fig-petit-gras' })
        + F.segment([100, 145], [300, 145]) + nommer([100, 145], 'E', 90, 18) + nommer([220, 145], 'F', 90, 18)
        + F.texte([370, 145], '[EF)', { classe: 'fig-texte fig-petit-gras' }),
        'Une droite, un segment et une demi-droite')}
      <table>
        <tr><th>On écrit</th><th>On lit</th><th>C’est…</th></tr>
        <tr><td>(AB)</td><td>la droite (AB)</td><td>illimitée des deux côtés</td></tr>
        <tr><td>[AB]</td><td>le segment [AB]</td><td>limité par ses extrémités A et B</td></tr>
        <tr><td>[AB)</td><td>la demi-droite [AB)</td><td>limitée d’un seul côté, par son origine A</td></tr>
        <tr><td>AB</td><td>la longueur AB</td><td>la longueur du segment [AB] : un nombre</td></tr>
      </table>
      <h4>Appartenir, alignés, milieu</h4>
      <p>C ∈ [AB] se lit « C <b>appartient</b> au segment [AB] » ; D ∉ [AB] se lit « D n’appartient pas au segment [AB] ».</p>
      <p>Des points sont <b>alignés</b> quand ils sont sur une même droite.
        Si C est sur [AB], alors <b>AC + CB = AB</b>. 👉 <i>3&nbsp;cm + 5&nbsp;cm = 8&nbsp;cm</i></p>
      <p>Le <b>milieu</b> I du segment [AB] est sur [AB], à égale distance de A et de B : IA = IB = AB ÷ 2.
        👉 <i>Si AB = 8&nbsp;cm, alors IA = IB = 4&nbsp;cm.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le crochet dit « on s’arrête là », la parenthèse dit « ça continue ».
        [AB) : on s’arrête en A, on continue après B.</div>
      <p>⚠️ [AB) et [BA) ne sont pas la même demi-droite : elles ne partent pas du même point !</p>
    `,
  });

  // ======================================================================
  // 2. Perpendiculaires et parallèles
  // ======================================================================
  const NOMS_DROITES = ['(d₁)', '(d₂)', '(d₃)'];
  const BOUTONS_DROITES = ['parallèles', 'perpendiculaires', 'on ne sait pas'];
  const PROPRIETE_PARALLELES = 'deux droites parallèles à une même droite sont parallèles entre elles';
  const PROPRIETE_PERPENDICULAIRES = 'deux droites perpendiculaires à une même droite sont parallèles entre elles';
  const PROPRIETE_PERPENDICULAIRE_A_L_UNE = 'si deux droites sont parallèles, toute perpendiculaire à l’une est perpendiculaire à l’autre';

  // Les trois propriétés de 6e, sans figure
  function questionProprietes() {
    const [a, b, c] = RM.melanger(NOMS_DROITES);
    const cas = parmi([1, 2, 5, 1, 3, 4, 3, 4, 6, 7]);
    let donnees;
    let paire;
    let reponse;
    let explication;
    if (cas === 1) {
      donnees = `${a} ⊥ ${c} et ${b} ⊥ ${c}.`;
      paire = [a, b];
      reponse = 'parallèles';
      explication = `${a} et ${b} sont perpendiculaires à la même droite ${c}.<br>Or, <b>${PROPRIETE_PERPENDICULAIRES}</b>. Donc ${a} // ${b}.`;
    } else if (cas === 2) {
      donnees = `${a} // ${c} et ${b} // ${c}.`;
      paire = [a, b];
      reponse = 'parallèles';
      explication = `${a} et ${b} sont parallèles à la même droite ${c}.<br>Or, <b>${PROPRIETE_PARALLELES}</b>. Donc ${a} // ${b}.`;
    } else if (cas === 3) {
      donnees = `${a} // ${b} et ${c} ⊥ ${a}.`;
      paire = [c, b];
      reponse = 'perpendiculaires';
      explication = `${a} // ${b}, et ${c} est perpendiculaire à ${a}.<br>Or, <b>${PROPRIETE_PERPENDICULAIRE_A_L_UNE}</b>. Donc ${c} ⊥ ${b}.`;
    } else if (cas === 4) {
      donnees = `${a} ⊥ ${c} et ${b} // ${c}.`;
      paire = [a, b];
      reponse = 'perpendiculaires';
      explication = `${b} // ${c}, et ${a} est perpendiculaire à ${c}.<br>Or, <b>${PROPRIETE_PERPENDICULAIRE_A_L_UNE}</b>. Donc ${a} ⊥ ${b}.`;
    } else if (cas === 5) {
      donnees = `${a} ⊥ ${b} et ${b} ⊥ ${c}.`;
      paire = [a, c];
      reponse = 'parallèles';
      explication = `${a} et ${c} sont toutes les deux perpendiculaires à ${b}.<br>Or, <b>${PROPRIETE_PERPENDICULAIRES}</b>. Donc ${a} // ${c}.`;
    } else if (cas === 6) {
      donnees = `${a} ⊥ ${c}, et ${b} coupe ${c}.`;
      paire = [a, b];
      reponse = 'on ne sait pas';
      explication = `${b} coupe ${c}, mais on ne sait pas si elle forme un angle droit avec ${c}. `
        + `Si oui, ${a} // ${b} ; sinon, elles sont sécantes. <b>On ne peut pas savoir.</b>`;
    } else {
      donnees = `${a} et ${b} coupent toutes les deux ${c}.`;
      paire = [a, b];
      reponse = 'on ne sait pas';
      explication = `Couper la même droite ne suffit pas : ${a} et ${b} peuvent être parallèles ou sécantes. `
        + `Il faudrait savoir si elles sont perpendiculaires à ${c}. <b>On ne peut pas savoir.</b>`;
    }
    return choix({
      consigne: 'Utilise les propriétés',
      enonce: `${donnees} Que peut-on dire de ${paire[0]} et ${paire[1]} ?`,
      reponse,
      choix: BOUTONS_DROITES,
      explication,
    });
  }

  const DEFINITIONS_DROITES = [
    ['Deux droites qui ne se coupent jamais sont ___.', 'parallèles', ['perpendiculaires', 'sécantes'],
      'Des droites <b>parallèles</b> ne se coupent jamais, comme les deux rails d’un train. On note (d) // (d′).'],
    ['Deux droites qui se coupent en un seul point sont ___.', 'sécantes', ['parallèles', 'perpendiculaires'],
      'Des droites qui se coupent sont <b>sécantes</b>. Elles ne sont perpendiculaires que si elles forment un angle droit.'],
    ['Deux droites qui se coupent en formant un angle droit sont ___.', 'perpendiculaires', ['parallèles', 'confondues'],
      'Deux droites qui se coupent en formant un angle droit sont <b>perpendiculaires</b>. On note (d) ⊥ (d′).'],
    ['Quel symbole veut dire « est perpendiculaire à » ?', '⊥', ['//', '=', '∈'],
      'Le symbole <b>⊥</b> ressemble à un angle droit : (d) ⊥ (d′) se lit « (d) est perpendiculaire à (d′) ».'],
    ['Quel symbole veut dire « est parallèle à » ?', '//', ['⊥', '=', '∈'],
      'Le symbole <b>//</b>, ce sont deux traits parallèles : (d) // (d′) se lit « (d) est parallèle à (d′) ».'],
    ['(d) // (d′) se lit : « (d) est ___ à (d′) ».', 'parallèle', ['perpendiculaire', 'sécante'],
      'Le symbole // veut dire « est <b>parallèle</b> à ». Le symbole ⊥ veut dire « est perpendiculaire à ».'],
  ];

  // Trois droites, avec le codage des angles droits : on utilise une propriété
  function questionFigureCodee() {
    const [a, b, c] = RM.melanger(NOMS_DROITES); // a et b : les deux « parallèles » ; c les coupe
    const phi = entier(-20, 20);
    const xc = parmi([-60, -30, 30, 60]); // l'endroit où c coupe a et b
    const [cx, cy] = [230, 135];
    const place = P => tourner([P], phi).map(([x, y]) => [x + cx, y + cy])[0];
    const texte = (P, nom) => F.texte(place(P), nom);
    let dessin = F.segment(place([-170, -50]), place([170, -50])) + F.segment(place([-170, 50]), place([170, 50]))
      + F.segment(place([xc, -90]), place([xc, 90]));
    // Chaque nom est écrit juste après le bout de sa droite
    dessin += texte([196, -50], a) + texte([196, 50], b) + texte([xc, 110], c);
    const codeA = F.angleDroit(place([xc, -50]), place([xc + 20, -50]), place([xc, -30]));
    const codeB = F.angleDroit(place([xc, 50]), place([xc + 20, 50]), place([xc, 30]));
    if (Math.random() < 0.5) {
      // Deux perpendiculaires à une même droite
      const svg = F.svg(460, 270, dessin + codeA + codeB, 'Trois droites et deux angles droits');
      return choix({
        consigne: 'Regarde le codage',
        enonce: `Que peut-on dire des droites ${a} et ${b} ?${svg}`,
        reponse: 'parallèles',
        choix: BOUTONS_DROITES,
        explication: `D’après le codage, ${a} ⊥ ${c} et ${b} ⊥ ${c}.<br>Or, ${PROPRIETE_PERPENDICULAIRES} : <b>${a} // ${b}</b>.`,
      });
    }
    // Deux parallèles et une perpendiculaire à l'une d'elles
    const [code, codee, autre] = Math.random() < 0.5 ? [codeA, a, b] : [codeB, b, a];
    const svg = F.svg(460, 270, dessin + code, 'Trois droites et un angle droit');
    return choix({
      consigne: 'Regarde le codage',
      enonce: `On sait que ${a} // ${b}. Que peut-on dire des droites ${c} et ${autre} ?${svg}`,
      reponse: 'perpendiculaires',
      choix: BOUTONS_DROITES,
      explication: `D’après le codage, ${c} ⊥ ${codee}. Comme ${a} // ${b}, toute perpendiculaire à l’une est perpendiculaire à l’autre : `
        + `<b>${c} ⊥ ${autre}</b>.`,
    });
  }

  // Sur un quadrillage : combien de droites sont perpendiculaires (ou parallèles) à (d) ?
  // Les directions : h (horizontale), v (verticale), d (la diagonale qui descend), m (celle qui monte)
  const PERPENDICULAIRE_A = { h: 'v', v: 'h', d: 'm', m: 'd' };
  // Une droite est repérée par k : sa ligne (h), sa colonne (v), ligne − colonne (d) ou ligne + colonne (m)
  const BORNES_K = { h: [1, 7], v: [1, 11], d: [-7, 3], m: [5, 15] };
  function extremites({ dir, k }) {
    if (dir === 'h') return [[0, k], [12, k]];
    if (dir === 'v') return [[k, 0], [k, 8]];
    if (dir === 'd') {
      const c1 = Math.max(0, -k);
      const c2 = Math.min(12, 8 - k);
      return [[c1, c1 + k], [c2, c2 + k]];
    }
    const c1 = Math.max(0, k - 8);
    const c2 = Math.min(12, k);
    return [[c1, k - c1], [c2, k - c2]];
  }
  // Place les droites (une liste de directions), à 2 carreaux au moins de leurs parallèles ; null si ça ne rentre pas
  function placerDroites(directions) {
    const placees = [];
    for (const dir of directions) {
      const [min, max] = BORNES_K[dir];
      const libres = [];
      for (let k = min; k <= max; k++) if (placees.every(p => p.dir !== dir || Math.abs(p.k - k) >= 2)) libres.push(k);
      if (!libres.length) return null;
      placees.push({ dir, k: parmi(libres) });
    }
    return placees;
  }

  function questionQuadrillage() {
    const refDir = parmi(['h', 'h', 'v', 'v', 'd', 'm']);
    const relation = parmi(['perpendiculaires', 'parallèles']);
    const cible = relation === 'perpendiculaires' ? PERPENDICULAIRE_A[refDir] : refDir;
    const n = entier(1, 3);
    const autres = ['h', 'v', 'd', 'm'].filter(dir => dir !== cible);
    let droites = null;
    while (!droites) droites = placerDroites([refDir, ...Array(n).fill(cible), ...Array.from({ length: 4 - n }, () => parmi(autres))]);

    const g = grille(12, 8);
    const pixel = ([c, l]) => [g.X(c), g.Y(l)];
    let dessin = g.html;
    droites.slice(1).forEach(dr => { const [A, B] = extremites(dr); dessin += F.segment(pixel(A), pixel(B)); });
    const [A, B] = extremites(droites[0]);
    dessin += F.segment(pixel(A), pixel(B), 'fig-accent');
    // Le nom (d), juste après le bout B de la droite orange (hors du quadrillage)
    const sortie = { h: [1, 0], v: [0, 1], d: [1, 1], m: [1, -1] }[refDir];
    const norme = Math.hypot(sortie[0], sortie[1]);
    const P = pixel(B);
    dessin += F.texte([P[0] + sortie[0] / norme * 22, P[1] + sortie[1] / norme * 22], '(d)', { classe: 'fig-texte fig-texte-accent' });
    const svg = F.svg(g.largeur, g.hauteur, dessin, 'Des droites sur un quadrillage');

    let explication;
    if (relation === 'perpendiculaires') {
      if (refDir === 'h') explication = '(d) est horizontale : sur le quadrillage, les droites perpendiculaires à (d) sont les droites <b>verticales</b>.';
      else if (refDir === 'v') explication = '(d) est verticale : sur le quadrillage, les droites perpendiculaires à (d) sont les droites <b>horizontales</b>.';
      else explication = '(d) suit les diagonales des carreaux. Les droites perpendiculaires à (d) suivent les diagonales <b>dans l’autre sens</b> : elles forment un angle droit avec (d).';
    } else if (refDir === 'h' || refDir === 'v') {
      explication = `Les droites parallèles à (d) sont, comme elle, <b>${refDir === 'h' ? 'horizontales' : 'verticales'}</b> : elles ne la coupent jamais.`;
    } else {
      explication = 'Les droites parallèles à (d) suivent les diagonales des carreaux <b>dans le même sens</b> que (d) : elles ne la coupent jamais.';
    }
    return nombre({
      consigne: 'Regarde le quadrillage',
      // « autres » seulement pour les parallèles ((d) est parallèle à elle-même, pas perpendiculaire)
      enonce: `Combien ${relation === 'parallèles' ? 'd’autres droites' : 'de droites'} sont ${relation} à la droite (d) ?${svg}`,
      reponse: n,
      explication: `${explication} Il y en a <b>${n}</b>.`,
    });
  }

  // La distance d'un point à une droite (⭐ 6e)
  function questionDistance() {
    // Le pied de la perpendiculaire s'appelle toujours H, comme dans la leçon (et pas de point D, à côté de la droite (d))
    const [P, K, M] = lettres(3, ['H', 'D']);
    const H = 'H';
    const theta = entier(-8, 8);
    const echelle = 26; // pixels par cm
    const h = parmi([2, 2.5, 3, 3.5, 4]);
    let xk;
    let xm;
    do {
      xk = parmi([2, 2.5, 3, 3.5, 4]);
      xm = -parmi([2, 2.5, 3, 3.5, 4, 4.5]);
    } while (Math.abs(Math.abs(xk) - Math.abs(xm)) < 1);
    if (Math.random() < 0.5) [xk, xm] = [-xk, -xm];
    const O = [230, 175];
    const surD = x => vers(O, x * echelle, theta);
    const pH = surD(0);
    const pK = surD(xk);
    const pM = surD(xm);
    const pP = vers(pH, h * echelle, theta + 90);
    const pk = arrondir(Math.hypot(h, xk), 1);
    const pm = arrondir(Math.hypot(h, xm), 1);
    let dessin = F.segment(surD(-8.3), surD(8.3)) + F.segment(pP, pH) + F.segment(pP, pK) + F.segment(pP, pM)
      + F.angleDroit(pH, pP, pK);
    dessin += nommer(pP, P, theta + 90) + nommer(pH, H, theta - 90) + nommer(pK, K, theta - 90) + nommer(pM, M, theta - 90);
    dessin += F.texte(vers(vers(O, 200, theta), 18, theta + 90), '(d)');
    const svg = F.svg(460, 240, dessin, 'Un point et une droite');
    const longueurs = RM.melanger([`${P}${H} = ${mesure(h, 'cm')}`, `${P}${K} = ${mesure(pk, 'cm')}`, `${P}${M} = ${mesure(pm, 'cm')}`]);
    return nombre({
      consigne: 'Regarde le codage',
      enonce: `Sur la figure, ${longueurs[0]}, ${longueurs[1]} et ${longueurs[2]}. Quelle est la distance du point ${P} à la droite (d) ?${svg}`,
      reponse: h,
      unite: 'cm',
      explication: `La distance d’un point à une droite, c’est la longueur du <b>segment perpendiculaire</b> à la droite : `
        + `ici [${P}${H}], avec l’angle droit. C’est le plus court chemin : ${P}${H} = <b>${mesure(h, 'cm')}</b>.`,
    });
  }

  const VF_DROITES = [
    ['Deux droites perpendiculaires à une même droite sont parallèles entre elles.', true,
      'C’est une propriété de 6e : si (d₁) ⊥ (d₃) et (d₂) ⊥ (d₃), alors <b>(d₁) // (d₂)</b>.'],
    ['Deux droites parallèles à une même droite sont parallèles entre elles.', true,
      'C’est une propriété de 6e : si (d₁) // (d₃) et (d₂) // (d₃), alors <b>(d₁) // (d₂)</b>.'],
    ['Deux droites perpendiculaires sont aussi sécantes.', true,
      'Deux droites perpendiculaires se coupent (en formant un angle droit) : elles sont bien <b>sécantes</b>.'],
    ['Si (d) // (d′), toute perpendiculaire à (d) est perpendiculaire à (d′).', true,
      'C’est une propriété de 6e : une perpendiculaire à l’une de deux parallèles est <b>perpendiculaire à l’autre</b>.'],
    ['Deux droites perpendiculaires forment quatre angles droits.', true,
      'Quand deux droites sont perpendiculaires, les <b>4 angles</b> autour du point où elles se coupent sont droits.'],
    ['Deux droites perpendiculaires à une même droite sont perpendiculaires entre elles.', false,
      'Deux droites perpendiculaires à une même droite sont <b>parallèles</b> entre elles (comme les barreaux d’une échelle).'],
    ['Deux droites parallèles se coupent en un point.', false,
      'Deux droites parallèles ne se coupent <b>jamais</b>.'],
    ['Deux droites sécantes sont toujours perpendiculaires.', false,
      'Des droites sécantes se coupent, mais pas forcément en formant un angle droit : elles ne sont <b>pas toujours</b> perpendiculaires.'],
    ['Si (d) ⊥ (d′), toute perpendiculaire à (d) est perpendiculaire à (d′).', false,
      'Une perpendiculaire à (d) et la droite (d′) sont toutes les deux perpendiculaires à (d) : elles sont donc <b>parallèles</b>.'],
    ['Deux droites parallèles à une même droite sont perpendiculaires entre elles.', false,
      'Deux droites parallèles à une même droite sont <b>parallèles</b> entre elles.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-perpendiculaires',
    banque: ['proprietes', 'proprietes', 'proprietes', 'definitions', 'definitions', 'figureCodee', 'figureCodee',
      'quadrillage', 'quadrillage', 'distance', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'proprietes') return questionProprietes();
      if (sorte === 'definitions') return choixDans('Choisis la bonne réponse', DEFINITIONS_DROITES);
      if (sorte === 'figureCodee') return questionFigureCodee();
      if (sorte === 'quadrillage') return questionQuadrillage();
      if (sorte === 'distance') return questionDistance();
      return vraiFauxDans(VF_DROITES);
    },
    titreLecon: 'Perpendiculaires et parallèles',
    lecon: `
      <h4>Sécantes, perpendiculaires, parallèles</h4>
      ${F.svg(420, 155,
        F.segment([20, 80], [190, 80]) + F.segment([105, 12], [105, 125]) + F.angleDroit([105, 80], [190, 80], [105, 12])
        + F.texte([170, 64], '(d)') + F.texte([132, 22], '(d′)')
        + F.texte([105, 145], '(d) ⊥ (d′)', { classe: 'fig-texte fig-petit-gras' })
        + F.segment([240, 55], [410, 35]) + F.segment([240, 115], [410, 95])
        + F.texte([395, 18], '(d)') + F.texte([395, 78], '(d′)')
        + F.texte([325, 145], '(d) // (d′)', { classe: 'fig-texte fig-petit-gras' }),
        'Deux droites perpendiculaires et deux droites parallèles')}
      <p>Deux droites <b>sécantes</b> se coupent en un point. Si elles se coupent en formant un <b>angle droit</b>,
        elles sont <b>perpendiculaires</b> : on note (d) ⊥ (d′).</p>
      <p>Deux droites <b>parallèles</b> ne se coupent jamais : on note (d) // (d′).</p>
      <h4>⭐ Les trois propriétés de la 6e</h4>
      <p>1. Si deux droites sont <b>parallèles à une même droite</b>, alors elles sont parallèles entre elles.</p>
      <p>2. Si deux droites sont <b>perpendiculaires à une même droite</b>, alors elles sont parallèles entre elles.</p>
      <p>3. Si deux droites sont parallèles, toute droite <b>perpendiculaire à l’une</b> est perpendiculaire à l’autre.</p>
      <p>👉 <i>(d₁) ⊥ (d₃) et (d₂) ⊥ (d₃), donc (d₁) // (d₂).</i></p>
      <p>⭐ La <b>distance</b> d’un point A à une droite (d), c’est la longueur AH, où H est le point de (d) tel que (AH) ⊥ (d).
        C’est le plus court chemin de A jusqu’à la droite.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dessine vite les droites au brouillon ! Deux perpendiculaires
        à une même droite, ce sont les barreaux d’une échelle : ils sont parallèles.</div>
      <p>⚠️ On ne se fie pas à l’œil : un angle droit se voit grâce au <b>codage</b> (le petit carré) ou se vérifie à l’équerre.</p>
    `,
  });

  // ======================================================================
  // 3. Les angles
  // ======================================================================
  const SORTES_ANGLES = ['aigu', 'droit', 'obtus', 'plat'];
  // Une mesure d'angle de cette sorte (quelques angles tout près de 90°, pour réfléchir)
  function mesureDeSorte(sorte) {
    if (sorte === 'droit') return 90;
    if (sorte === 'plat') return 180;
    if (sorte === 'aigu') return Math.random() < 0.2 ? entier(85, 89) : entier(10, 84);
    return Math.random() < 0.2 ? entier(91, 95) : entier(96, 175);
  }
  function expliquerSorte(m) {
    if (m < 90) return `${m}°, c’est moins qu’un angle droit (90°) : c’est un angle <b>aigu</b>.`;
    if (m === 90) return 'Un angle de 90° est un angle <b>droit</b>, comme le coin d’une feuille.';
    if (m < 180) return `${m}°, c’est plus qu’un angle droit (90°) et moins qu’un angle plat (180°) : c’est un angle <b>obtus</b>.`;
    return 'Un angle de 180° est un angle <b>plat</b> : ses deux côtés sont dans le prolongement l’un de l’autre.';
  }

  // Des repères pour estimer un angle, en le comparant à l'angle droit et à l'angle plat
  const REPERES_ANGLES = {
    30: 'le tiers d’un angle droit',
    40: 'un peu moins de la moitié d’un angle droit',
    45: 'la moitié d’un angle droit',
    50: 'un peu plus de la moitié d’un angle droit',
    60: 'les deux tiers d’un angle droit',
    70: 'un peu moins qu’un angle droit',
    110: 'un peu plus qu’un angle droit',
    120: 'un angle droit et un tiers d’angle droit',
    130: 'un peu moins qu’un angle droit et demi',
    135: 'un angle droit et la moitié d’un angle droit',
    140: 'un peu plus qu’un angle droit et demi',
    150: 'presque plat : il manque 30° pour faire 180°',
    160: 'presque plat : il manque 20° pour faire 180°',
  };

  // Un angle dessiné : le sommet S en bas, deux côtés de 140 pixels, le premier dans la direction « depart »
  function dessinAngle(m, marque) {
    const depart = m === 180 ? entier(-15, 15) : entier(-20, 200 - m);
    const S = [230, 165];
    const A = vers(S, 140, depart);
    const B = vers(S, 140, depart + m);
    const code = marque === 'carre' ? F.angleDroit(S, A, B, 18) : F.arc(S, A, B, { rayon: 34 });
    return F.svg(460, 230, F.segment(S, A) + F.segment(S, B) + code, 'Un angle');
  }

  // Nommer l'angle marqué en orange
  function questionNommer() {
    const [X, S, Y] = lettres(3);
    const m = entier(40, 140);
    const depart = entier(-20, 200 - m);
    const pS = [230, 170];
    const pX = vers(pS, 120, depart);
    const pY = vers(pS, 120, depart + m);
    let dessin = F.segment(pS, vers(pS, 150, depart)) + F.segment(pS, vers(pS, 150, depart + m))
      + F.arc(pS, pX, pY, { rayon: 30 });
    // Les noms : à l'extérieur de l'angle ; celui du sommet, à l'opposé de l'ouverture
    dessin += nommer(pX, X, depart - 90) + nommer(pY, Y, depart + m + 90) + nommer(pS, S, depart + m / 2 + 180);
    const svg = F.svg(460, 240, dessin, 'Un angle marqué');
    return choix({
      consigne: 'Regarde la figure',
      enonce: `Comment s’appelle l’angle marqué en orange ?${svg}`,
      reponse: angleTexte(parmi([X + S + Y, Y + S + X])),
      pieges: [angleTexte(parmi([S + X + Y, Y + X + S])), angleTexte(parmi([S + Y + X, X + Y + S]))],
      explication: `Le sommet de l’angle est ${S} : on l’écrit <b>au milieu</b>, entre les lettres des deux côtés. `
        + `C’est l’angle ${angle(X + S + Y)} (ou ${angle(Y + S + X)}).`,
    });
  }

  // Le vocabulaire : sommet, côtés, nom d'un angle (sans figure)
  function questionVocabulaireAngle() {
    const [X, S, Y] = lettres(3);
    const variante = parmi(['sommet', 'cotes', 'nom']);
    if (variante === 'sommet') {
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `Quel est le sommet de l’angle ${angle(X + S + Y)} ?`,
        reponse: S,
        pieges: [X, Y],
        explication: `Le sommet est toujours la lettre <b>du milieu</b> : l’angle ${angle(X + S + Y)} a pour sommet ${S}.`,
      });
    }
    if (variante === 'cotes') {
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `Quels sont les côtés de l’angle ${angle(X + S + Y)} ?`,
        reponse: `[${S}${X}) et [${S}${Y})`,
        pieges: [`[${X}${S}) et [${Y}${S})`, `[${X}${S}) et [${X}${Y})`, `[${Y}${X}) et [${Y}${S})`],
        explication: `Les côtés d’un angle sont deux demi-droites qui partent de son <b>sommet</b> ${S} : `
          + `[${S}${X}) et [${S}${Y}).`,
      });
    }
    return choix({
      consigne: 'Choisis la bonne notation',
      enonce: `L’angle de sommet ${S}, dont les côtés passent par ${X} et par ${Y}, se note ___.`,
      reponse: angleTexte(parmi([X + S + Y, Y + S + X])),
      pieges: [angleTexte(parmi([S + X + Y, Y + X + S])), angleTexte(parmi([S + Y + X, X + Y + S]))],
      explication: `Le sommet ${S} s’écrit <b>au milieu</b> : ${angle(X + S + Y)} (ou ${angle(Y + S + X)}).`,
    });
  }

  // Comparer deux angles : le piège des côtés plus longs
  function questionComparer() {
    const [X1, S1, Y1, X2, S2, Y2] = lettres(6);
    const m1 = entier(6, 30) * 5;
    let m2 = m1;
    const egaux = Math.random() < 0.25;
    if (!egaux) do { m2 = entier(6, 30) * 5; } while (Math.abs(m1 - m2) < 35);
    // Le plus petit angle a les côtés les plus longs (s'ils sont égaux, un seul a des côtés longs)
    const long = m => Math.min(150, 92 / Math.sin(m / 2 * RAD));
    const longAGauche = egaux ? Math.random() < 0.5 : m1 < m2;
    const L1 = longAGauche ? long(m1) : 70;
    const L2 = longAGauche ? 70 : long(m2);
    // Un angle « en V », de sommet S (nommé nomS), ouvert de m degrés, avec des côtés de L pixels
    function unAngle(S, nomS, m, L, X, Y) {
      const pX = vers(S, L, 90 - m / 2);
      const pY = vers(S, L, 90 + m / 2);
      return F.segment(S, pX) + F.segment(S, pY) + F.arc(S, pX, pY, { rayon: 24 })
        + nommer(pX, X, 90 - m / 2, 16) + nommer(pY, Y, 90 + m / 2, 16) + nommer(S, nomS, 270, 20);
    }
    const svg = F.svg(460, 235, unAngle([120, 195], S1, m1, L1, X1, Y1) + unAngle([340, 195], S2, m2, L2, X2, Y2), 'Deux angles');
    const nom1 = X1 + S1 + Y1;
    const nom2 = X2 + S2 + Y2;
    let reponse;
    let explication;
    if (egaux) {
      reponse = 'ils sont égaux';
      explication = `Les deux angles ont la même ouverture (${m1}°) : ils sont <b>égaux</b>.<br>⚠️ La longueur des côtés ne compte pas !`;
    } else {
      const [grand, petit, mg, mp] = m1 > m2 ? [nom1, nom2, m1, m2] : [nom2, nom1, m2, m1];
      reponse = angleTexte(grand);
      explication = `${angle(grand)} est le plus <b>ouvert</b> : c’est le plus grand (${mg}° contre ${mp}° pour ${angle(petit)}).`
        + '<br>⚠️ La longueur des côtés ne compte pas !';
    }
    return choix({
      consigne: 'Regarde bien les deux angles',
      enonce: `Quel angle est le plus grand ?${svg}`,
      reponse,
      choix: [angleTexte(nom1), angleTexte(nom2), 'ils sont égaux'],
      explication,
    });
  }

  // Calculer un angle : un angle droit ou plat partagé en deux, ou deux angles mis côte à côte
  function questionCalculAngle() {
    const [X, S, Y, Z] = lettres(4);
    const variante = parmi(['droit', 'plat', 'somme']);
    // L'angle XSY est partagé par la demi-droite [SZ) en deux angles : XSZ (qui mesure a) et ZSY (qui mesure b)
    let a;
    let b;
    let pS;
    let enonce;
    let reponse;
    let explication;
    let texteA = '?';
    let texteB = '?';
    if (variante === 'droit' || variante === 'plat') {
      const total = variante === 'droit' ? 90 : 180;
      a = variante === 'droit' ? entier(30, 60) : entier(40, 140);
      b = total - a;
      pS = variante === 'droit' ? [140, 205] : [230, 190];
      const donneA = Math.random() < 0.5; // on donne l'angle XSZ (ou l'angle ZSY)
      const donne = donneA ? a : b;
      reponse = total - donne;
      if (donneA) texteA = `${a}°`;
      else texteB = `${b}°`;
      const nomInconnu = donneA ? Z + S + Y : X + S + Z;
      if (variante === 'droit') {
        enonce = `L’angle ${angle(X + S + Y)} est droit. Combien mesure l’angle ${angle(nomInconnu)} ?`;
        explication = `Un angle droit mesure <b>90°</b> : ${angle(nomInconnu)} = 90° − ${donne}° = <b>${reponse}°</b>.`;
      } else {
        // « alignés » ne suffirait pas : l'angle n'est plat que si S est entre X et Y
        enonce = `Le point ${S} est sur le segment [${X}${Y}]. Combien mesure l’angle ${angle(nomInconnu)} ?`;
        explication = `${S} est entre ${X} et ${Y} : ${angle(X + S + Y)} est un angle plat, il mesure <b>180°</b>.<br>`
          + `${angle(nomInconnu)} = 180° − ${donne}° = <b>${reponse}°</b>.`;
      }
    } else {
      a = entier(30, 80);
      b = entier(30, Math.min(80, 160 - a));
      pS = [230, 200];
      reponse = a + b;
      texteA = `${a}°`;
      texteB = `${b}°`;
      enonce = `Combien mesure l’angle ${angle(X + S + Y)} ?`;
      explication = `${angle(X + S + Y)} est fait des deux angles ${angle(X + S + Z)} et ${angle(Z + S + Y)} : `
        + `${a}° + ${b}° = <b>${reponse}°</b>.`;
    }
    // Les longueurs des côtés : [SX) vers la droite, [SZ) et [SY) plus haut
    const longueurs = { droit: [200, 180, 165], plat: [200, 160, 200], somme: [190, 170, 160] }[variante];
    const pX = vers(pS, longueurs[0], 0);
    const pZ = vers(pS, longueurs[1], a);
    const pY = vers(pS, longueurs[2], a + b);
    let dessin = F.segment(pS, pX) + F.segment(pS, pY) + F.segment(pS, pZ)
      + F.arc(pS, pX, pZ, { rayon: 44, texte: texteA, distanceTexte: 26 })
      + F.arc(pS, pZ, pY, { rayon: 58, texte: texteB, distanceTexte: 26 });
    if (variante === 'droit') dessin += F.angleDroit(pS, pX, pY, 16);
    dessin += nommer(pX, X, 0, 18) + nommer(pY, Y, a + b, 18) + nommer(pZ, Z, a, 18)
      + nommer(pS, S, variante === 'droit' ? 225 : 270, 20);
    const svg = F.svg(460, 240, dessin, 'Un angle partagé en deux');
    return nombre({
      consigne: 'Calcule',
      enonce: enonce + svg,
      reponse,
      unite: '°',
      solution: `<b>${reponse}°</b>`,
      explication,
    });
  }

  const VF_ANGLES = [
    ['Un angle obtus mesure plus de 90°.', true,
      'Un angle obtus est plus grand qu’un angle droit : il mesure <b>entre 90° et 180°</b>.'],
    ['Un angle plat mesure 180°.', true,
      'Les deux côtés d’un angle plat sont dans le prolongement l’un de l’autre : il mesure <b>180°</b>, deux angles droits.'],
    ['Un angle de 89° est un angle aigu.', true,
      '89° est plus petit que 90° : c’est un angle <b>aigu</b> (de très peu !).'],
    [`Les angles ${angle('ABC')} et ${angle('CBA')} sont le même angle.`, true,
      'Les deux ont pour sommet B (la lettre du milieu) et pour côtés [BA) et [BC) : c’est <b>le même angle</b>.'],
    ['Deux angles droits mis côte à côte forment un angle plat.', true,
      '90° + 90° = <b>180°</b> : c’est un angle plat.'],
    ['Un angle aigu mesure plus de 90°.', false,
      'Un angle aigu est plus petit qu’un angle droit : il mesure <b>moins de 90°</b>.'],
    ['Un angle droit mesure 100°.', false,
      'Un angle droit mesure <b>90°</b>, comme le coin d’une feuille.'],
    ['Plus les côtés d’un angle sont longs, plus l’angle est grand.', false,
      'La longueur des côtés ne compte pas : c’est <b>l’ouverture</b> entre les deux côtés qui fait la mesure de l’angle.'],
    [`Les angles ${angle('ABC')} et ${angle('BAC')} sont le même angle.`, false,
      `${angle('ABC')} a pour sommet B, mais ${angle('BAC')} a pour sommet A : ce sont <b>deux angles différents</b>.`],
    ['Un angle de 90° est un angle obtus.', false,
      'Un angle de 90° est un angle <b>droit</b>. Un angle obtus mesure plus de 90°.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-angles',
    banque: ['nature', 'natureMesure', 'natureMesure', 'estimer', 'estimer', 'nommer', 'vocabulaire', 'vocabulaire',
      'comparer', 'calcul', 'calcul', 'calcul', 'calcul', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'nommer') return questionNommer();
      if (sorte === 'vocabulaire') return questionVocabulaireAngle();
      if (sorte === 'comparer') return questionComparer();
      if (sorte === 'calcul') return questionCalculAngle();
      if (sorte === 'vraiFaux') return vraiFauxDans(VF_ANGLES);

      if (sorte === 'nature') {
        // Un angle dessiné : aigu, droit, obtus ou plat ?
        const nature = parmi(['aigu', 'aigu', 'obtus', 'obtus', 'droit', 'plat']);
        const m = nature === 'aigu' ? entier(5, 14) * 5 : nature === 'obtus' ? entier(22, 32) * 5 : mesureDeSorte(nature);
        return choix({
          consigne: 'Regarde la figure',
          enonce: `Cet angle est-il aigu, droit, obtus ou plat ?${dessinAngle(m, m === 90 ? 'carre' : 'arc')}`,
          reponse: nature,
          choix: SORTES_ANGLES,
          explication: m === 90
            ? 'Le petit carré code un <b>angle droit</b> : il mesure 90°, comme le coin d’une feuille.'
            : `Cet angle mesure ${m}°. ${expliquerSorte(m)}`,
        });
      }
      if (sorte === 'natureMesure') {
        const nature = parmi(['aigu', 'aigu', 'obtus', 'obtus', 'droit', 'plat']);
        const m = mesureDeSorte(nature);
        return choix({
          consigne: 'Choisis la bonne réponse',
          enonce: `Un angle qui mesure ${m}° est ___.`,
          reponse: nature,
          choix: SORTES_ANGLES,
          explication: expliquerSorte(m),
        });
      }
      // estimer : les boutons sont assez éloignés pour qu'une seule mesure soit possible
      const m = parmi([30, 40, 45, 50, 60, 70, 90, 110, 120, 130, 135, 140, 150, 160]);
      const possible = p => p >= 10 && p <= 175 && Math.abs(p - m) >= 30;
      // L'erreur classique du rapporteur : lire 180 − m sur la mauvaise graduation
      const classique = possible(180 - m) ? [180 - m] : [];
      const autres = RM.melanger([m - 40, m + 40, m - 60, m + 60, m - 80, m + 80, 90]
        .filter(p => possible(p) && !classique.includes(p)).filter((p, i, t) => t.indexOf(p) === i));
      const pieges = [...classique, ...autres].slice(0, 3);
      return choix({
        consigne: 'Estime la mesure',
        enonce: `Environ combien mesure cet angle ?${dessinAngle(m, 'arc')}`,
        reponse: `${m}°`,
        pieges: pieges.map(p => `${p}°`),
        explication: (m === 90 ? 'Cet angle a l’air droit, comme le coin d’une feuille : il mesure <b>environ 90°</b>.'
          : `Compare avec un angle droit (90°) : cet angle est plus ${m < 90 ? 'petit' : 'grand'}. `
            + `Il mesure environ <b>${m}°</b> : ${REPERES_ANGLES[m]}.`)
          + (classique.length ? `<br>⚠️ ${180 - m}°, c’est ce qu’on lit sur la mauvaise graduation du rapporteur !` : ''),
      });
    },
    titreLecon: 'Les angles',
    lecon: `
      <h4>Nommer un angle</h4>
      ${F.svg(280, 160,
        F.segment([50, 125], vers([50, 125], 190, 0)) + F.segment([50, 125], vers([50, 125], 150, 40))
        + F.arc([50, 125], vers([50, 125], 190, 0), vers([50, 125], 150, 40), { rayon: 34 })
        + nommer(vers([50, 125], 150, 40), 'A', 40, 18) + nommer([50, 125], 'B', 200, 20) + nommer(vers([50, 125], 190, 0), 'C', 0, 18),
        'L’angle ABC')}
      <p>Un angle est formé par deux demi-droites qui partent du même point : son <b>sommet</b>.
        On le nomme avec trois lettres, le sommet <b>au milieu</b> : ${angle('ABC')} (ou ${angle('CBA')}).</p>
      <p>👉 <i>L’angle ${angle('ABC')} a pour sommet B et pour côtés [BA) et [BC).</i></p>
      <h4>⭐ Mesurer un angle</h4>
      <p>On mesure un angle en <b>degrés</b> (°) avec un <b>rapporteur</b>.</p>
      <table>
        <tr><th>aigu</th><th>droit</th><th>obtus</th><th>plat</th></tr>
        <tr><td>moins de 90°</td><td>90°</td><td>entre 90° et 180°</td><td>180°</td></tr>
      </table>
      <p>Si une demi-droite partage un angle en deux, les deux mesures <b>s’ajoutent</b>.
        👉 <i>Un angle droit partagé : 90° − 35° = 55°.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> compare avec le coin d’une feuille (un angle droit) :
        plus petit, l’angle est aigu ; plus grand, il est obtus.</div>
      <p>⚠️ La longueur des côtés ne change rien : c’est <b>l’ouverture</b> qui compte.</p>
      <p>⚠️ Avec le rapporteur, lis la graduation qui part de 0 sur un côté de l’angle : sinon, on lit 150° au lieu de 30° !</p>
    `,
  });

  // ======================================================================
  // 4. Triangles et quadrilatères
  // ======================================================================
  // Un triangle codé : quel est son nom le plus précis ?
  function questionTriangle() {
    const nature = parmi(['équilatéral', 'isocèle', 'isocèle', 'rectangle', 'rectangle isocèle']);
    let sommets;
    if (nature === 'équilatéral') sommets = [[0, 0], [170, 0], [85, -147.2]];
    else if (nature === 'isocèle') {
      const alpha = parmi([40, 45, 50, 100, 110, 120]); // l'angle au sommet principal
      const L = alpha < 90 ? 170 : 130;
      sommets = [[0, 0], vers([0, 0], L, -90 - alpha / 2), vers([0, 0], L, -90 + alpha / 2)];
    } else if (nature === 'rectangle') sommets = [[0, 0], [parmi([190, 180]), 0], [0, -parmi([105, 95])]];
    else sommets = [[0, 0], [150, 0], [0, -150]];
    const [A, B, C] = centrer(tourner(sommets, entier(0, 359)), 460, 250);
    let dessin = F.polygone([A, B, C]);
    const traits = parmi([1, 2]);
    if (nature === 'équilatéral') dessin += F.codage(A, B, traits) + F.codage(B, C, traits) + F.codage(C, A, traits);
    if (nature === 'isocèle') dessin += F.codage(A, B, traits) + F.codage(A, C, traits);
    if (nature === 'rectangle' || nature === 'rectangle isocèle') dessin += F.angleDroit(A, B, C);
    if (nature === 'rectangle isocèle') dessin += F.codage(A, B, traits) + F.codage(A, C, traits);
    const EXPLICATIONS = {
      'équilatéral': 'Les trois côtés ont le même codage : ils ont la même longueur. Le triangle est <b>équilatéral</b> (c’est un triangle isocèle particulier).',
      'isocèle': 'Deux côtés ont le même codage : ils ont la même longueur. Le triangle est <b>isocèle</b>.',
      'rectangle': 'Le petit carré code un angle droit : le triangle est <b>rectangle</b>.',
      'rectangle isocèle': 'Un angle droit, et les deux côtés de cet angle ont la même longueur : le triangle est <b>rectangle isocèle</b>.',
    };
    return choix({
      consigne: 'Choisis le nom le plus précis',
      enonce: `D’après le codage, ce triangle est…${F.svg(460, 250, dessin, 'Un triangle codé')}`,
      reponse: nature,
      pieges: ['équilatéral', 'isocèle', 'rectangle', 'rectangle isocèle'],
      explication: EXPLICATIONS[nature],
    });
  }

  // Un quadrilatère codé : carré, rectangle ou losange ?
  function questionQuadrilatere() {
    const nature = parmi(['carré', 'rectangle', 'losange']);
    let sommets;
    let rotation;
    if (nature === 'carré') {
      sommets = [[0, 0], [150, 0], [150, 150], [0, 150]];
      rotation = parmi([0, 0, 20, -20, 45]);
    } else if (nature === 'rectangle') {
      sommets = [[0, 0], [220, 0], [220, 120], [0, 120]];
      rotation = parmi([0, 0, 15, -15, 90]);
    } else {
      sommets = [[-120, 0], [0, -70], [120, 0], [0, 70]];
      rotation = parmi([0, 90, 20, -20]);
    }
    const P = centrer(tourner(sommets, rotation), 460, 260);
    let dessin = F.polygone(P);
    const cotesEgaux = () => P.map((S, i) => F.codage(S, P[(i + 1) % 4], 1)).join('');
    const anglesDroits = () => P.map((S, i) => F.angleDroit(S, P[(i + 3) % 4], P[(i + 1) % 4])).join('');
    if (nature === 'carré') dessin += cotesEgaux() + anglesDroits();
    if (nature === 'rectangle') dessin += anglesDroits();
    if (nature === 'losange') dessin += cotesEgaux();
    const EXPLICATIONS = {
      'carré': '4 côtés de même longueur et 4 angles droits : c’est un <b>carré</b>. (C’est aussi un losange et un rectangle, mais « carré » est le nom le plus précis.)',
      'rectangle': '4 angles droits : c’est un <b>rectangle</b>. Rien n’indique que ses côtés ont la même longueur : on ne peut pas dire que c’est un carré.',
      'losange': '4 côtés de même longueur, et aucun angle droit n’est codé : c’est un <b>losange</b>.',
    };
    return choix({
      consigne: 'Choisis le nom le plus précis',
      enonce: `D’après le codage, ce quadrilatère est un…${F.svg(460, 260, dessin, 'Un quadrilatère codé')}`,
      reponse: nature,
      choix: ['carré', 'rectangle', 'losange'],
      explication: EXPLICATIONS[nature],
    });
  }

  const DEFINITIONS_FIGURES = [
    ['Un triangle qui a deux côtés de même longueur est un triangle ___.', 'isocèle', ['équilatéral', 'rectangle', 'quelconque'],
      'Deux côtés de même longueur : le triangle est <b>isocèle</b>. (Équilatéral, il en faudrait trois.)'],
    ['Un triangle qui a ses trois côtés de même longueur est un triangle ___.', 'équilatéral', ['rectangle', 'quelconque', 'droit'],
      'Trois côtés de même longueur : le triangle est <b>équilatéral</b>.'],
    ['Un triangle qui a un angle droit est un triangle ___.', 'rectangle', ['isocèle', 'équilatéral', 'droit'],
      'Un triangle qui a un angle droit est un triangle <b>rectangle</b> (on ne dit pas « triangle droit »).'],
    ['Un quadrilatère qui a quatre angles droits est un ___.', 'rectangle', ['losange', 'carré'],
      'Quatre angles droits : c’est un <b>rectangle</b>. Ce n’est un carré que si, en plus, ses 4 côtés ont la même longueur.'],
    ['Un quadrilatère qui a quatre côtés de même longueur est un ___.', 'losange', ['rectangle', 'carré'],
      'Quatre côtés de même longueur : c’est un <b>losange</b>. Ce n’est un carré que si, en plus, il a des angles droits.'],
    ['Dans un triangle isocèle, le côté opposé au sommet principal s’appelle ___.', 'la base', ['la hauteur', 'le côté principal', 'le sommet'],
      'Dans un triangle isocèle, les deux côtés égaux partent du sommet principal ; le troisième côté est <b>la base</b>.'],
    ['Un segment qui relie deux sommets opposés d’un quadrilatère s’appelle ___.', 'une diagonale', ['un côté', 'une arête', 'une hauteur'],
      'Un segment qui relie deux sommets opposés est <b>une diagonale</b>. Un quadrilatère en a deux.'],
    ['Quel quadrilatère a toujours 4 côtés de même longueur et 4 angles droits ?', 'le carré', ['le losange', 'le rectangle'],
      'Le losange n’a pas toujours d’angle droit, et le rectangle pas toujours 4 côtés égaux : seul le <b>carré</b> a toujours les deux.'],
    ['Quel quadrilatère a toujours des diagonales perpendiculaires et de même longueur ?', 'le carré', ['le rectangle', 'le losange'],
      'Le rectangle a des diagonales de même longueur ; le losange, des diagonales perpendiculaires. Seul le <b>carré</b> a toujours les deux.'],
  ];

  const COMPTER_FIGURES = [
    ['Combien d’angles droits a un rectangle ?', 4, 'Un rectangle a <b>4 angles droits</b> : c’est sa définition.'],
    ['Combien d’angles droits a un carré ?', 4, 'Un carré est un rectangle particulier : il a <b>4 angles droits</b>.'],
    ['Combien d’angles droits a un triangle rectangle ?', 1, 'Un triangle rectangle a <b>un seul</b> angle droit (un triangle ne peut pas en avoir deux).'],
    ['Combien d’angles droits un triangle peut-il avoir, au plus ?', 1,
      'Un triangle a <b>au plus un</b> angle droit : avec deux angles droits, deux côtés seraient parallèles et ne se rejoindraient jamais.'],
    ['Combien de côtés de même longueur a un triangle équilatéral ?', 3, 'Équilatéral : ses <b>3 côtés</b> ont la même longueur.'],
    ['Combien de côtés de même longueur a un losange ?', 4, 'Un losange a ses <b>4 côtés</b> de la même longueur.'],
    ['Combien de diagonales a un quadrilatère ?', 2, 'Un quadrilatère a <b>2 diagonales</b> : elles relient les sommets opposés.'],
  ];

  // Des noms de quadrilatères (les sommets dans l'ordre du tour)
  const NOMS_QUADRILATERES = ['ABCD', 'EFGH', 'KLMN', 'PRST'];
  // Des rectangles dont les côtés et la diagonale sont des nombres simples
  const RECTANGLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [4.5, 6, 7.5], [8, 15, 17]];

  function questionLongueursFigures() {
    const variante = parmi(['isocele', 'isocele', 'rectangleCote', 'rectangleDiagonale', 'losange', 'equilateral']);
    const [X, Y, Z] = lettres(3);
    const [P1, P2, P3, P4] = parmi(NOMS_QUADRILATERES).split('');
    const nomQ = P1 + P2 + P3 + P4;
    if (variante === 'isocele') {
      const a = longueurAuHasard(3, 9);
      let b;
      do { b = longueurAuHasard(2, 12); } while (b === a || b >= 2 * a);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le triangle ${X}${Y}${Z} est isocèle en ${X}. ${X}${Y} = ${mesure(a, 'cm')} et ${Y}${Z} = ${mesure(b, 'cm')}. Combien mesure ${X}${Z} ?`,
        reponse: a,
        unite: 'cm',
        explication: `« Isocèle en ${X} » : les deux côtés qui partent de ${X} ont la même longueur. `
          + `Donc ${X}${Z} = ${X}${Y} = <b>${mesure(a, 'cm')}</b>. ([${Y}${Z}] est la base.)`,
      });
    }
    if (variante === 'rectangleCote') {
      const L = longueurAuHasard(5, 14);
      let l;
      do { l = longueurAuHasard(2, 9); } while (l >= L);
      const opposeAuPremier = Math.random() < 0.5;
      return nombre({
        consigne: 'Calcule',
        enonce: `${nomQ} est un rectangle : ${P1}${P2} = ${mesure(L, 'cm')} et ${P2}${P3} = ${mesure(l, 'cm')}. `
          + `Combien mesure ${opposeAuPremier ? P3 + P4 : P4 + P1} ?`,
        reponse: opposeAuPremier ? L : l,
        unite: 'cm',
        explication: `Dans un rectangle, les côtés <b>opposés</b> ont la même longueur : `
          + (opposeAuPremier ? `${P3}${P4} = ${P1}${P2} = <b>${mesure(L, 'cm')}</b>.` : `${P4}${P1} = ${P2}${P3} = <b>${mesure(l, 'cm')}</b>.`),
      });
    }
    if (variante === 'rectangleDiagonale') {
      const [c1, c2, d] = parmi(RECTANGLES);
      return nombre({
        consigne: 'Calcule',
        enonce: `${nomQ} est un rectangle : ${P1}${P2} = ${mesure(c2, 'cm')}, ${P2}${P3} = ${mesure(c1, 'cm')} et ${P1}${P3} = ${mesure(d, 'cm')}. `
          + `Combien mesure ${P2}${P4} ?`,
        reponse: d,
        unite: 'cm',
        explication: `[${P1}${P3}] et [${P2}${P4}] sont les deux <b>diagonales</b> du rectangle. `
          + `Les diagonales d’un rectangle ont la même longueur : ${P2}${P4} = ${P1}${P3} = <b>${mesure(d, 'cm')}</b>.`,
      });
    }
    if (variante === 'losange') {
      const c = entierOuDemi(2, 12);
      return nombre({
        consigne: 'Calcule',
        enonce: `${nomQ} est un losange de périmètre ${mesure(4 * c, 'cm')}. Combien mesure le côté [${P1}${P2}] ?`,
        reponse: c,
        unite: 'cm',
        explication: `Les 4 côtés d’un losange ont la même longueur : ${P1}${P2} = ${ecrire(4 * c)} ÷ 4 = <b>${mesure(c, 'cm')}</b>.`,
      });
    }
    const c = entierOuDemi(2, 12);
    return nombre({
      consigne: 'Calcule',
      enonce: `Le triangle ${X}${Y}${Z} est équilatéral, et son périmètre est ${mesure(3 * c, 'cm')}. Combien mesure le côté [${X}${Y}] ?`,
      reponse: c,
      unite: 'cm',
      explication: `Les 3 côtés d’un triangle équilatéral ont la même longueur : ${X}${Y} = ${ecrire(3 * c)} ÷ 3 = <b>${mesure(c, 'cm')}</b>.`,
    });
  }

  const VF_FIGURES = [
    ['Tout carré est un losange.', true,
      'Un carré a 4 côtés de même longueur : c’est donc un <b>losange</b> (un losange particulier, avec des angles droits).'],
    ['Tout carré est un rectangle.', true,
      'Un carré a 4 angles droits : c’est donc un <b>rectangle</b> (un rectangle particulier, avec 4 côtés égaux).'],
    ['Un triangle équilatéral est aussi isocèle.', true,
      'Il a 3 côtés de même longueur, donc il en a bien deux de même longueur : il est <b>isocèle</b> (et même équilatéral).'],
    ['Un triangle rectangle peut être isocèle.', true,
      'Oui : si les deux côtés de l’angle droit ont la même longueur, c’est un triangle <b>rectangle isocèle</b> (la moitié d’un carré).'],
    ['Les diagonales d’un rectangle ont la même longueur.', true,
      'Dans un rectangle, les deux diagonales ont <b>la même longueur</b> (et se coupent en leur milieu).'],
    ['Les diagonales d’un losange sont perpendiculaires.', true,
      'Les diagonales d’un losange se coupent en formant un <b>angle droit</b> (et en leur milieu).'],
    ['Tout losange est un carré.', false,
      'Un losange a 4 côtés égaux, mais <b>pas forcément d’angle droit</b> : ce n’est pas toujours un carré.'],
    ['Tout rectangle est un carré.', false,
      'Un rectangle a 4 angles droits, mais ses côtés n’ont <b>pas forcément la même longueur</b> : ce n’est pas toujours un carré.'],
    ['Un triangle peut avoir deux angles droits.', false,
      'Impossible : avec deux angles droits, deux côtés seraient parallèles et ne se rejoindraient jamais. Un triangle a <b>au plus un</b> angle droit.'],
    ['Un triangle isocèle est toujours équilatéral.', false,
      'Isocèle : <b>deux</b> côtés de même longueur. Le troisième peut être différent.'],
    ['Les diagonales d’un rectangle sont toujours perpendiculaires.', false,
      'Les diagonales d’un rectangle ont la même longueur, mais elles ne sont perpendiculaires <b>que si c’est un carré</b>.'],
    ['Un losange a toujours quatre angles droits.', false,
      'Un losange a 4 côtés égaux, mais ses angles ne sont <b>pas forcément droits</b>.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-triangles',
    banque: ['triangle', 'triangle', 'quadrilatere', 'quadrilatere', 'definition', 'definition', 'definition', 'definition',
      'longueurs', 'longueurs', 'compter', 'compter', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'triangle') return questionTriangle();
      if (sorte === 'quadrilatere') return questionQuadrilatere();
      if (sorte === 'definition') return choixDans('Choisis la bonne réponse', DEFINITIONS_FIGURES);
      if (sorte === 'longueurs') return questionLongueursFigures();
      if (sorte === 'vraiFaux') return vraiFauxDans(VF_FIGURES);
      const [enonce, reponse, explication] = parmi(COMPTER_FIGURES);
      return nombre({ consigne: 'Écris le nombre', enonce, reponse, explication });
    },
    titreLecon: 'Triangles et quadrilatères',
    lecon: `
      <h4>Le codage</h4>
      ${F.svg(420, 160,
        F.polygone([[90, 18], [30, 140], [150, 140]]) + F.codage([90, 18], [30, 140], 1) + F.codage([90, 18], [150, 140], 1)
        + F.polygone([[220, 40], [400, 40], [400, 140], [220, 140]])
        + F.angleDroit([220, 40], [400, 40], [220, 140]) + F.angleDroit([400, 40], [220, 40], [400, 140])
        + F.angleDroit([400, 140], [400, 40], [220, 140]) + F.angleDroit([220, 140], [400, 140], [220, 40]),
        'Un triangle isocèle et un rectangle codés')}
      <p>Des petits traits pareils = des <b>longueurs égales</b>. Un petit carré = un <b>angle droit</b>.</p>
      <h4>Les triangles particuliers</h4>
      <table>
        <tr><th>isocèle</th><td>2 côtés de même longueur (ils partent du sommet principal ; le 3e côté est la base)</td></tr>
        <tr><th>équilatéral</th><td>3 côtés de même longueur</td></tr>
        <tr><th>rectangle</th><td>1 angle droit</td></tr>
      </table>
      <h4>Les quadrilatères particuliers</h4>
      <table>
        <tr><th>rectangle</th><td>4 angles droits ; ses côtés opposés ont la même longueur ; ses diagonales ont la même longueur</td></tr>
        <tr><th>losange</th><td>4 côtés de même longueur ; ses diagonales sont perpendiculaires</td></tr>
        <tr><th>carré</th><td>4 angles droits et 4 côtés de même longueur</td></tr>
      </table>
      <p>Une <b>diagonale</b> relie deux sommets opposés d’un quadrilatère : il en a deux.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un carré est à la fois un rectangle <b>et</b> un losange.
        Mais un rectangle ou un losange n’est pas forcément un carré !</div>
      <p>⚠️ Un triangle ne peut pas avoir deux angles droits.</p>
    `,
  });

  // ======================================================================
  // 5. Le cercle
  // ======================================================================
  // Un cercle de centre O, avec un diamètre [D1D2], un rayon [OR] et une corde [C1C2]
  function figureCercle(noms, phi, sens) {
    const O = [230, 150];
    const r = 110;
    const PLACES = { D1: 200, D2: 20, R: 110, C1: 250, C2: 320 }; // les directions des points, depuis O
    const p = {};
    Object.keys(PLACES).forEach(k => { p[k] = vers(O, r, phi + sens * PLACES[k]); });
    let dessin = F.cercle(O, r) + F.segment(p.D1, p.D2) + F.segment(O, p.R) + F.segment(p.C1, p.C2);
    Object.keys(PLACES).forEach(k => { dessin += nommer(p[k], noms[k], phi + sens * PLACES[k]); });
    // Le nom O, là où il n'y a pas de segment
    dessin += nommer(O, 'O', phi + sens * 290);
    return F.svg(460, 300, dessin, 'Un cercle de centre O');
  }

  // Des noms pour les points de la figure du cercle (R, l'autre bout du rayon [OR], est choisi pour aller avec O)
  function nomsCercle() {
    const R = parmi(LETTRES_AVEC_O);
    const [D1, D2, C1, C2] = lettres(4, [R]);
    return { D1, D2, R, C1, C2 };
  }

  function questionQuelSegment() {
    const { D1, D2, R, C1, C2 } = nomsCercle();
    const svg = figureCercle({ D1, D2, R, C1, C2 }, entier(0, 359), parmi([1, -1]));
    const segments = { rayon: `[O${R}]`, diametre: `[${D1}${D2}]`, corde: `[${C1}${C2}]` };
    const cas = parmi(['rayon', 'diametre', 'corde']);
    const QUESTIONS = {
      rayon: 'Quel segment est un rayon du cercle de centre O ?',
      diametre: 'Quel segment est un diamètre du cercle de centre O ?',
      corde: 'Quel segment est une corde qui ne passe pas par le centre O ?',
    };
    const EXPLICATIONS = {
      rayon: `[O${R}] relie le centre O à un point du cercle : c’est un <b>rayon</b>.`,
      diametre: `[${D1}${D2}] relie deux points du cercle en passant par le centre O : c’est un <b>diamètre</b>.`,
      corde: `[${C1}${C2}] relie deux points du cercle sans passer par O : c’est une <b>corde</b>. `
        + `([${D1}${D2}] est aussi une corde, mais elle passe par O : c’est un diamètre.)`,
    };
    return choix({
      consigne: 'Regarde la figure',
      enonce: QUESTIONS[cas] + svg,
      reponse: segments[cas],
      pieges: Object.values(segments),
      explication: EXPLICATIONS[cas],
    });
  }

  const VOCABULAIRE_CERCLE = [
    ['Un segment qui relie le centre d’un cercle à un point du cercle est ___.', 'un rayon', ['un diamètre', 'une corde', 'un arc'],
      'Du centre jusqu’au cercle : c’est <b>un rayon</b>.'],
    ['Une corde qui passe par le centre du cercle est ___.', 'un diamètre', ['un rayon', 'un arc', 'un demi-cercle'],
      'Une corde qui passe par le centre est <b>un diamètre</b> : c’est la plus longue des cordes.'],
    ['Un segment qui relie deux points d’un cercle est ___.', 'une corde', ['un rayon', 'un diamètre', 'un arc'],
      'Un segment qui relie deux points du cercle est <b>une corde</b>. Si elle passe par le centre, c’est un diamètre.'],
    ['Pour tracer un cercle, on utilise ___.', 'un compas', ['une équerre', 'un rapporteur', 'une règle'],
      'On trace un cercle avec <b>un compas</b>, écarté de la longueur du rayon.'],
    ['Tous les points d’un cercle sont à la même distance ___.', 'du centre', ['du diamètre', 'du rayon', 'de la corde'],
      'Tous les points du cercle sont à la même distance <b>du centre</b> : cette distance, c’est le rayon.'],
    ['Le diamètre d’un cercle est égal à ___.', '2 fois le rayon', ['le rayon ÷ 2', '3 fois le rayon', 'le rayon + 2'],
      'Le diamètre est <b>deux fois</b> plus long que le rayon : diamètre = 2 × rayon.'],
    ['Un morceau de cercle entre deux de ses points s’appelle ___.', 'un arc', ['une corde', 'un rayon', 'un diamètre'],
      'Un morceau du cercle lui-même (qui est courbe) est <b>un arc</b> de cercle. Le segment qui relie ses deux bouts est une corde.'],
  ];

  // Où est le point M : sur le cercle, à l'intérieur, à l'extérieur ?
  function questionSurLeCercle() {
    const r = entierOuDemi(2, 7);
    const donneDiametre = Math.random() < 0.4;
    const cas = parmi(['sur', 'dans', 'dehors']);
    let d;
    if (cas === 'sur') d = r;
    else if (cas === 'dans') d = entierOuDemi(Math.max(1, r - 3), r - 0.5);
    else d = donneDiametre ? entierOuDemi(r + 0.5, 2 * r - 0.5) : entierOuDemi(r + 0.5, r + 4);
    const debut = donneDiametre ? `Le cercle de centre O a un diamètre de ${mesure(2 * r, 'cm')}.` : `Le cercle de centre O a un rayon de ${mesure(r, 'cm')}.`;
    const REPONSES = { sur: 'sur le cercle', dans: 'à l’intérieur', dehors: 'à l’extérieur' };
    let explication = donneDiametre ? `Le rayon est la moitié du diamètre : ${ecrire(2 * r)} ÷ 2 = ${mesure(r, 'cm')}.<br>` : '';
    if (cas === 'sur') explication += `OM = ${mesure(d, 'cm')}, c’est le rayon : M est <b>sur le cercle</b>.`;
    else if (cas === 'dans') explication += `OM = ${mesure(d, 'cm')}, c’est moins que le rayon : M est <b>à l’intérieur</b> du cercle.`;
    else explication += `OM = ${mesure(d, 'cm')}, c’est plus que le rayon : M est <b>à l’extérieur</b> du cercle.`;
    if (donneDiametre && cas === 'dehors') explication += ' ⚠️ On compare OM au rayon, pas au diamètre !';
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `${debut} OM = ${mesure(d, 'cm')}. Où est le point M ?`,
      reponse: REPONSES[cas],
      choix: ['à l’intérieur', 'sur le cercle', 'à l’extérieur'],
      explication,
    });
  }

  // Le rayon et le diamètre, dans la vie de Roxy
  function questionDiametreRayon() {
    const prenom = parmi(PRENOMS);
    const variante = parmi(['roue', 'pizza', 'trampoline', 'bassin', 'compas', 'cercleRayon', 'cercleDiametre']);
    const versRayon = (enonce, d, unite) => nombre({
      consigne: 'Calcule', enonce, reponse: net(d / 2), unite,
      explication: `Le rayon est <b>la moitié</b> du diamètre : ${ecrire(d)} ÷ 2 = <b>${mesure(net(d / 2), unite)}</b>.`,
    });
    const versDiametre = (enonce, r, unite) => nombre({
      consigne: 'Calcule', enonce, reponse: net(2 * r), unite,
      explication: `Le diamètre est <b>deux fois</b> le rayon : 2 × ${ecrire(r)} = <b>${mesure(net(2 * r), unite)}</b>.`,
    });
    if (variante === 'roue') {
      const d = parmi([50, 56, 60, 64, 66, 70]);
      return versRayon(`La roue du vélo ${de(prenom)} a un diamètre de ${mesure(d, 'cm')}. Quel est son rayon ?`, d, 'cm');
    }
    if (variante === 'pizza') {
      const d = parmi([26, 28, 30, 32, 34, 36]);
      return versRayon(`Une pizza ronde a un diamètre de ${mesure(d, 'cm')}. Quel est son rayon ?`, d, 'cm');
    }
    if (variante === 'trampoline') {
      const r = parmi([1.2, 1.5, 1.8, 2, 2.5]);
      return versDiametre(`Le trampoline rond du jardin de Papi a un rayon de ${mesure(r, 'm')}. Quel est son diamètre ?`, r, 'm');
    }
    if (variante === 'bassin') {
      const d = parmi([5, 7, 9, 11, 13]);
      return versRayon(`Le bassin rond du parc a un diamètre de ${mesure(d, 'm')}. Quel est son rayon ?`, d, 'm');
    }
    if (variante === 'compas') {
      const d = entier(5, 16);
      return nombre({
        consigne: 'Calcule',
        enonce: `${prenom} veut tracer au compas un cercle de ${mesure(d, 'cm')} de diamètre. `
          + `De combien doit-${FILLES.includes(prenom) ? 'elle' : 'il'} écarter son compas ?`,
        reponse: net(d / 2),
        unite: 'cm',
        explication: `On écarte le compas de la longueur du <b>rayon</b>, la moitié du diamètre : ${ecrire(d)} ÷ 2 = <b>${mesure(net(d / 2), 'cm')}</b>.`,
      });
    }
    if (variante === 'cercleRayon') {
      const r = longueurAuHasard(1.5, 9.5);
      return versDiametre(`Un cercle a un rayon de ${mesure(r, 'cm')}. Combien mesure son diamètre ?`, r, 'cm');
    }
    const d = longueurAuHasard(3, 19);
    return versRayon(`Un cercle a un diamètre de ${mesure(d, 'cm')}. Combien mesure son rayon ?`, d, 'cm');
  }

  // La distance au centre : tous les points du cercle sont à la même distance du centre
  function questionDistanceCentre() {
    const [M, A] = RM.melanger(LETTRES_AVEC_O);
    const variante = parmi(['rayon', 'diametre', 'figure', 'deuxPoints', 'diametreDeRayon']);
    const r = entierOuDemi(1.5, 8);
    if (variante === 'rayon') {
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point ${M} est sur le cercle de centre O et de rayon ${mesure(r, 'cm')}. Combien mesure O${M} ?`,
        reponse: r,
        unite: 'cm',
        explication: `Tous les points du cercle sont à la même distance du centre : le <b>rayon</b>. Donc O${M} = <b>${mesure(r, 'cm')}</b>.`,
      });
    }
    if (variante === 'diametre') {
      return nombre({
        consigne: 'Calcule',
        enonce: `Le cercle de centre O a un diamètre de ${mesure(2 * r, 'cm')}, et le point ${M} est sur ce cercle. Combien mesure O${M} ?`,
        reponse: r,
        unite: 'cm',
        explication: `${M} est sur le cercle, donc [O${M}] est un <b>rayon</b> : la moitié du diamètre. ${ecrire(2 * r)} ÷ 2 = <b>${mesure(r, 'cm')}</b>.`,
      });
    }
    if (variante === 'figure') {
      const { D1, D2, R, C1, C2 } = nomsCercle();
      const svg = figureCercle({ D1, D2, R, C1, C2 }, entier(0, 359), parmi([1, -1]));
      if (Math.random() < 0.5) {
        return nombre({
          consigne: 'Regarde la figure',
          enonce: `[${D1}${D2}] est un diamètre du cercle de centre O, et ${D1}${D2} = ${mesure(2 * r, 'cm')}. Combien mesure O${R} ?${svg}`,
          reponse: r,
          unite: 'cm',
          explication: `[O${R}] est un <b>rayon</b> : la moitié du diamètre. ${ecrire(2 * r)} ÷ 2 = <b>${mesure(r, 'cm')}</b>.`,
        });
      }
      return nombre({
        consigne: 'Regarde la figure',
        enonce: `Le cercle a pour centre O, et O${R} = ${mesure(r, 'cm')}. Combien mesure le diamètre [${D1}${D2}] ?${svg}`,
        reponse: 2 * r,
        unite: 'cm',
        explication: `[O${R}] est un rayon, et le diamètre est <b>deux fois</b> le rayon : 2 × ${ecrire(r)} = <b>${mesure(2 * r, 'cm')}</b>.`,
      });
    }
    if (variante === 'deuxPoints') {
      return nombre({
        consigne: 'Calcule',
        enonce: `${A} et ${M} sont deux points du cercle de centre O, et O${A} = ${mesure(r, 'cm')}. Combien mesure O${M} ?`,
        reponse: r,
        unite: 'cm',
        explication: `${A} et ${M} sont sur le cercle : ils sont tous les deux à la même distance du centre, le <b>rayon</b>. O${M} = O${A} = <b>${mesure(r, 'cm')}</b>.`,
      });
    }
    return nombre({
      consigne: 'Calcule',
      enonce: `[${A}${M}] est un diamètre du cercle de centre O, et O${A} = ${mesure(r, 'cm')}. Combien mesure ${A}${M} ?`,
      reponse: 2 * r,
      unite: 'cm',
      explication: `[O${A}] est un rayon, et le diamètre [${A}${M}] est <b>deux fois</b> plus long : 2 × ${ecrire(r)} = <b>${mesure(2 * r, 'cm')}</b>.`,
    });
  }

  const VF_CERCLE = [
    ['Le diamètre d’un cercle est deux fois plus long que son rayon.', true,
      'Diamètre = <b>2 × rayon</b> : un diamètre, c’est deux rayons mis bout à bout.'],
    ['Tous les points d’un cercle sont à la même distance du centre.', true,
      'C’est la définition du cercle : tous ses points sont à la même distance du centre, <b>le rayon</b>.'],
    ['Un diamètre est une corde qui passe par le centre.', true,
      'Un diamètre relie deux points du cercle (c’est une corde) en passant par le <b>centre</b>.'],
    ['Si OA = 3&nbsp;cm, alors A est sur le cercle de centre O et de rayon 3&nbsp;cm.', true,
      'A est à 3&nbsp;cm de O : il est bien <b>sur</b> le cercle de centre O et de rayon 3&nbsp;cm.'],
    ['Le diamètre est la plus longue corde du cercle.', true,
      'De toutes les cordes, celle qui passe par le centre est <b>la plus longue</b> : c’est le diamètre.'],
    ['Le rayon d’un cercle est deux fois plus long que son diamètre.', false,
      'C’est l’inverse : le <b>diamètre</b> est deux fois plus long que le rayon.'],
    ['Le centre d’un cercle est un point du cercle.', false,
      'Le centre est <b>à l’intérieur</b>, au milieu : il n’est pas sur le cercle.'],
    ['Un rayon est une corde du cercle.', false,
      'Une corde relie deux points du cercle. Un rayon part du <b>centre</b>, qui n’est pas sur le cercle : ce n’est pas une corde.'],
    ['Toutes les cordes d’un cercle ont la même longueur.', false,
      'Non : une corde peut être très courte ou longue. La plus longue est le <b>diamètre</b>.'],
    ['Un cercle de rayon 4&nbsp;cm a un diamètre de 2&nbsp;cm.', false,
      'Le diamètre est le <b>double</b> du rayon : 2 × 4 = <b>8&nbsp;cm</b>.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-cercle',
    banque: ['quelSegment', 'quelSegment', 'vocabulaire', 'vocabulaire', 'surLeCercle', 'surLeCercle',
      'diametreRayon', 'diametreRayon', 'distanceCentre', 'distanceCentre', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'quelSegment') return questionQuelSegment();
      if (sorte === 'vocabulaire') return choixDans('Choisis la bonne réponse', VOCABULAIRE_CERCLE);
      if (sorte === 'surLeCercle') return questionSurLeCercle();
      if (sorte === 'diametreRayon') return questionDiametreRayon();
      if (sorte === 'distanceCentre') return questionDistanceCentre();
      return vraiFauxDans(VF_CERCLE);
    },
    titreLecon: 'Le cercle',
    lecon: `
      <h4>Le vocabulaire du cercle</h4>
      ${figureCercle({ D1: 'B', D2: 'C', R: 'A', C1: 'D', C2: 'E' }, 0, 1)}
      <p>Le cercle de centre O et de rayon 3&nbsp;cm, ce sont tous les points qui sont <b>à 3&nbsp;cm de O</b>.</p>
      <p>Un <b>rayon</b> relie le centre à un point du cercle : [OA]. (Sa longueur s’appelle aussi le rayon.)</p>
      <p>Une <b>corde</b> relie deux points du cercle : [DE].</p>
      <p>Un <b>diamètre</b> est une corde qui passe par le centre : [BC]. C’est la plus longue des cordes.</p>
      <p>Un <b>arc</b> est un morceau du cercle entre deux de ses points.</p>
      <p><b>diamètre = 2 × rayon</b> et <b>rayon = diamètre ÷ 2</b>.
        👉 <i>rayon 4&nbsp;cm → diamètre 8&nbsp;cm</i> · <i>diamètre 7&nbsp;cm → rayon 3,5&nbsp;cm</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour tracer un cercle, on écarte le compas de la longueur
        du <b>rayon</b> (pas du diamètre !).</div>
      <p>⚠️ Si M est sur le cercle de centre O et de rayon 3&nbsp;cm, alors OM = 3&nbsp;cm.
        Si OM est plus petit que le rayon, M est à l’intérieur du cercle ; s’il est plus grand, M est à l’extérieur.</p>
    `,
  });

  // ======================================================================
  // 6. La symétrie axiale
  // ======================================================================
  // Un quadrillage avec l'axe (d), vertical ou horizontal. Un point est repéré par (p, q) :
  // p = sa distance à l'axe en carreaux (avec un signe pour le côté), q = sa place le long de l'axe.
  function quadrillageAxe() {
    const g = grille(12, 8, 26, 44);
    const vertical = Math.random() < 0.5;
    const axe = vertical ? entier(5, 7) : entier(3, 5);
    const place = (p, q) => (vertical ? [g.X(axe + p), g.Y(q)] : [g.X(q), g.Y(axe + p)]);
    let html = g.html;
    if (vertical) {
      html += F.segment([g.X(axe), g.Y(0) - 10], [g.X(axe), g.Y(8) + 10], 'fig-accent')
        + F.texte([g.X(axe), g.Y(0) - 26], '(d)', { classe: 'fig-texte fig-texte-accent' });
    } else {
      html += F.segment([g.X(0) - 10, g.Y(axe)], [g.X(12) + 10, g.Y(axe)], 'fig-accent')
        + F.texte([g.X(0) - 28, g.Y(axe)], '(d)', { classe: 'fig-texte fig-texte-accent' });
    }
    const distanceAxe = L => (vertical ? Math.abs(L[0] - g.X(axe)) : Math.abs(L[1] - g.Y(axe)));
    return { g, axe, pmin: -axe, pmax: (vertical ? 12 : 8) - axe, qmax: vertical ? 8 : 12, place, html, distanceAxe };
  }
  const carreaux = n => (n > 1 ? `${n}&nbsp;carreaux` : '1&nbsp;carreau');

  // Le symétrique d'un point sur un quadrillage : un seul des points proposés est le bon
  function questionSymetrique() {
    const q = quadrillageAxe();
    const a = entier(1, Math.min(4, q.axe, q.pmax));
    const pA = parmi([1, -1]) * a;
    const qA = entier(2, q.qmax - 2);
    const bon = [-pA, qA];
    const s = Math.sign(-pA); // le côté du symétrique
    // Les erreurs classiques : une mauvaise distance, un point qui a glissé le long de l'axe…
    const vus = new Set([`${pA},${qA}`, `${bon[0]},${bon[1]}`]);
    const erreurs = [];
    [[-pA + s, qA], [-pA - s, qA], [-pA, qA + 1], [-pA, qA - 1], [-pA, qA + 2], [-pA, qA - 2], [-pA + s, qA + 1], [-pA + s, qA - 1], [-2 * pA, qA]]
      .forEach(([p, qq]) => {
        const cle = `${p},${qq}`;
        if (p === 0 || Math.sign(p) !== s || p < q.pmin || p > q.pmax || qq < 1 || qq > q.qmax - 1 || vus.has(cle)) return;
        vus.add(cle);
        erreurs.push([p, qq]);
      });
    const points = RM.melanger([bon, ...RM.melanger(erreurs).slice(0, 3)]);
    const noms = lettres(points.length, ['A', 'D']); // pas de point D, à côté de l'axe (d)
    const dessin = q.html + nommerPointsProches(
      [{ P: q.place(pA, qA), nom: 'A' }, ...points.map((pt, i) => ({ P: q.place(pt[0], pt[1]), nom: noms[i] }))],
      q.distanceAxe,
    );
    const nomBon = noms[points.indexOf(bon)];
    return choix({
      consigne: 'Regarde le quadrillage',
      enonce: `Quel point est le symétrique de A par rapport à la droite (d) ?${F.svg(q.g.largeur, q.g.hauteur, dessin, 'Un quadrillage et un axe de symétrie')}`,
      reponse: nomBon,
      pieges: noms.filter(n => n !== nomBon),
      explication: `A est à ${carreaux(a)} de (d). Son symétrique est <b>de l’autre côté</b> de (d), <b>à la même distance</b> `
        + `(${carreaux(a)}), sur la perpendiculaire à (d) qui passe par A : c’est le point <b>${nomBon}</b>.`,
    });
  }

  // La distance entre un point et son symétrique : deux fois la distance à l'axe
  function questionDistanceAxe() {
    const variante = parmi(['figure', 'figure', 'moitie', 'double']);
    if (variante === 'figure') {
      const q = quadrillageAxe();
      const a = entier(1, Math.min(4, q.axe, q.pmax));
      const pA = parmi([1, -1]) * a;
      const dessin = q.html + F.point(q.place(pA, entier(1, q.qmax - 1)), 'A', { dx: 12, dy: -13 });
      return nombre({
        consigne: 'Regarde le quadrillage',
        enonce: `A′ est le symétrique de A par rapport à la droite (d). Combien de carreaux séparent A et A′ ?`
          + F.svg(q.g.largeur, q.g.hauteur, dessin, 'Un quadrillage et un axe de symétrie'),
        reponse: 2 * a,
        unite: 'carreaux',
        explication: `A est à ${carreaux(a)} de (d), et A′ est de l’autre côté, <b>à la même distance</b> : `
          + `${a} + ${a} = <b>${2 * a}&nbsp;carreaux</b>.`,
      });
    }
    if (variante === 'moitie') {
      const L = longueurAuHasard(3, 16);
      return nombre({
        consigne: 'Calcule',
        enonce: `A′ est le symétrique de A par rapport à la droite (d), et AA′ = ${mesure(L, 'cm')}. À quelle distance de (d) se trouve le point A ?`,
        reponse: net(L / 2),
        unite: 'cm',
        explication: `(d) est la médiatrice de [AA′] : elle passe par le <b>milieu</b> de [AA′]. `
          + `A est donc à ${ecrire(L)} ÷ 2 = <b>${mesure(net(L / 2), 'cm')}</b> de (d).`,
      });
    }
    const x = longueurAuHasard(1.5, 8);
    return nombre({
      consigne: 'Calcule',
      enonce: `Le point A est à ${mesure(x, 'cm')} de la droite (d), et A′ est son symétrique par rapport à (d). Combien mesure AA′ ?`,
      reponse: net(2 * x),
      unite: 'cm',
      explication: `A′ est de l’autre côté de (d), <b>à la même distance</b> : AA′ = ${ecrire(x)} + ${ecrire(x)} = <b>${mesure(net(2 * x), 'cm')}</b>.`,
    });
  }

  // Ce que la symétrie conserve ; la médiatrice
  function questionConserve() {
    const variante = parmi(['segment', 'angle', 'mediatrice', 'milieu', 'perimetre']);
    if (variante === 'segment') {
      const l = longueurAuHasard(2, 12);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le segment [A′B′] est le symétrique du segment [AB] par rapport à la droite (d), et AB = ${mesure(l, 'cm')}. Combien mesure A′B′ ?`,
        reponse: l,
        unite: 'cm',
        explication: `La symétrie axiale <b>conserve les longueurs</b> : A′B′ = AB = <b>${mesure(l, 'cm')}</b>.`,
      });
    }
    if (variante === 'angle') {
      const m = entier(20, 160);
      return nombre({
        consigne: 'Calcule',
        enonce: `L’angle ${angle('A′B′C′')} est le symétrique de l’angle ${angle('ABC')} par rapport à (d), et ${angle('ABC')} mesure ${m}°. `
          + `Combien mesure ${angle('A′B′C′')} ?`,
        reponse: m,
        unite: '°',
        solution: `<b>${m}°</b>`,
        explication: `La symétrie axiale <b>conserve les angles</b> : ${angle('A′B′C′')} = ${angle('ABC')} = <b>${m}°</b>.`,
      });
    }
    if (variante === 'mediatrice') {
      const l = longueurAuHasard(2, 12);
      return nombre({
        consigne: 'Calcule',
        enonce: `Le point M est sur la médiatrice du segment [AB], et MA = ${mesure(l, 'cm')}. Combien mesure MB ?`,
        reponse: l,
        unite: 'cm',
        explication: `Tout point de la médiatrice de [AB] est <b>à égale distance</b> de A et de B : MB = MA = <b>${mesure(l, 'cm')}</b>.`,
      });
    }
    if (variante === 'milieu') {
      const l = longueurAuHasard(3, 16);
      return nombre({
        consigne: 'Calcule',
        enonce: `La médiatrice du segment [AB] coupe [AB] au point I, et AB = ${mesure(l, 'cm')}. Combien mesure AI ?`,
        reponse: net(l / 2),
        unite: 'cm',
        explication: `La médiatrice passe par le <b>milieu</b> de [AB] : AI = ${ecrire(l)} ÷ 2 = <b>${mesure(net(l / 2), 'cm')}</b>.`,
      });
    }
    const p = entier(12, 40);
    return nombre({
      consigne: 'Calcule',
      enonce: `Une figure a un périmètre de ${mesure(p, 'cm')}. Quel est le périmètre de sa symétrique par rapport à une droite ?`,
      reponse: p,
      unite: 'cm',
      explication: `La symétrie conserve les longueurs, donc aussi le <b>périmètre</b> : il reste <b>${mesure(p, 'cm')}</b>.`,
    });
  }

  // Les axes de symétrie des figures : [la figure, le nombre d'axes, l'erreur classique, l'explication]
  const AXES_FIGURES = [
    ['un carré', '4', '2', 'Un carré a <b>4 axes</b> : les 2 droites qui portent ses diagonales, et les 2 droites qui passent par les milieux de ses côtés opposés.'],
    ['un rectangle qui n’est pas un carré', '2', '4',
      'Un rectangle a <b>2 axes</b> : les droites qui passent par les milieux de ses côtés opposés. ⚠️ Les droites de ses diagonales ne sont pas des axes !'],
    ['un losange qui n’est pas un carré', '2', '4', 'Un losange a <b>2 axes</b> : les droites qui portent ses deux diagonales.'],
    ['un triangle équilatéral', '3', '1', 'Un triangle équilatéral a <b>3 axes</b> : chacun passe par un sommet et par le milieu du côté opposé.'],
    ['un triangle isocèle qui n’est pas équilatéral', '1', '2',
      'Un triangle isocèle a <b>1 axe</b> : il passe par le sommet principal et par le milieu de la base.'],
    ['un cercle', 'une infinité', '4', 'Un cercle a <b>une infinité</b> d’axes : toutes les droites qui passent par son centre.'],
    ['un triangle qui a ses 3 côtés de longueurs différentes', '0', '1',
      'Si ses 3 côtés ont des longueurs différentes, aucun pliage ne superpose les deux moitiés : <b>0 axe</b>.'],
  ];
  const ORDRE_AXES = ['0', '1', '2', '3', '4', 'une infinité'];

  // Les lettres majuscules d'imprimerie (choisies pour ne pas dépendre de la police d'écriture)
  const LETTRES_AXE_VERTICAL = ['A', 'M', 'T', 'U', 'V', 'W', 'Y'];
  const LETTRES_AXE_HORIZONTAL = ['C', 'D', 'E'];
  const LETTRES_SANS_AXE = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'];

  function questionLettres() {
    const variante = parmi(['avecAxe', 'sansAxe', 'deuxAxes', 'direction']);
    const avecUnAxe = [...LETTRES_AXE_VERTICAL, ...LETTRES_AXE_HORIZONTAL];
    if (variante === 'avecAxe') {
      const reponse = parmi([...avecUnAxe, 'H']);
      return choix({
        consigne: 'Choisis la bonne lettre',
        enonce: 'Parmi ces lettres majuscules, laquelle a un axe de symétrie ?',
        reponse,
        pieges: LETTRES_SANS_AXE,
        explication: `En pliant la lettre ${reponse} le long d’un axe ${LETTRES_AXE_HORIZONTAL.includes(reponse) ? 'horizontal' : 'vertical'}, `
          + 'les deux moitiés se superposent. Les autres lettres n’ont <b>aucun</b> axe de symétrie.',
      });
    }
    if (variante === 'sansAxe') {
      const reponse = parmi(LETTRES_SANS_AXE);
      return choix({
        consigne: 'Choisis la bonne lettre',
        enonce: 'Parmi ces lettres majuscules, laquelle n’a aucun axe de symétrie ?',
        reponse,
        pieges: [...avecUnAxe, 'H'],
        explication: `Aucun pliage de la lettre ${reponse} ne superpose ses deux moitiés : elle n’a <b>pas d’axe</b> de symétrie. `
          + 'Les autres lettres en ont un (ou deux).',
      });
    }
    if (variante === 'deuxAxes') {
      return choix({
        consigne: 'Choisis la bonne lettre',
        enonce: 'Parmi ces lettres majuscules, laquelle a deux axes de symétrie ?',
        reponse: 'H',
        pieges: avecUnAxe,
        explication: 'La lettre <b>H</b> a deux axes : un vertical et un horizontal. Les autres lettres n’en ont qu’un.',
      });
    }
    const lettre = parmi(avecUnAxe);
    const horizontal = LETTRES_AXE_HORIZONTAL.includes(lettre);
    return choix({
      consigne: 'Choisis la bonne réponse',
      enonce: `L’axe de symétrie de la lettre majuscule ${lettre} est…`,
      reponse: horizontal ? 'horizontal' : 'vertical',
      choix: ['horizontal', 'vertical'],
      explication: horizontal
        ? `Le haut et le bas de la lettre ${lettre} se superposent : son axe est <b>horizontal</b>.`
        : `La gauche et la droite de la lettre ${lettre} se superposent : son axe est <b>vertical</b>.`,
    });
  }

  // Laquelle de ces droites est un axe de symétrie du rectangle (ou du losange) ?
  function questionQuelAxe() {
    const [n1, n2, n3] = RM.melanger(['(d₁)', '(d₂)', '(d₃)']);
    let figure;
    let bonne;
    let fausses;
    let forme;
    let explication;
    // Une droite : ses deux bouts et la place de son nom
    const droite = (A, B, nom) => ({ A, B, nom });
    if (Math.random() < 0.5) {
      forme = 'rectangle';
      figure = F.polygone([[110, 75], [350, 75], [350, 205], [110, 205]]);
      const medianes = [droite([230, 45], [230, 235], [230, 30]), droite([80, 140], [380, 140], [406, 140])];
      const diagonales = [droite([83.6, 60.7], [376.4, 219.3], [392, 228]), droite([83.6, 219.3], [376.4, 60.7], [392, 52])];
      const decalees = [droite([170, 45], [170, 235], [170, 30]), droite([290, 45], [290, 235], [290, 30]),
        droite([80, 105], [380, 105], [406, 105]), droite([80, 175], [380, 175], [406, 175])];
      bonne = parmi(medianes);
      fausses = [parmi(diagonales), parmi(decalees)];
      explication = 'Les axes de symétrie d’un rectangle sont les droites qui passent par les <b>milieux de deux côtés opposés</b>. '
        + '⚠️ Les droites de ses diagonales ne sont pas des axes : en pliant, les coins ne se superposent pas.';
    } else {
      forme = 'losange';
      figure = F.polygone([[100, 135], [230, 55], [360, 135], [230, 215]]);
      bonne = parmi([droite([70, 135], [390, 135], [414, 135]), droite([230, 30], [230, 240], [230, 16])]);
      fausses = [droite([130.9, 74], [329.1, 196], [345, 206]), droite([130.9, 196], [329.1, 74], [345, 64])];
      explication = 'Les axes de symétrie d’un losange sont les droites qui portent ses <b>deux diagonales</b>. '
        + 'Les droites qui passent par les milieux des côtés ne sont pas des axes (sauf pour un carré).';
    }
    const droites = RM.melanger([bonne, ...fausses]);
    const noms = [n1, n2, n3];
    droites.forEach((d, i) => { figure += F.segment(d.A, d.B, 'fig-courbe') + F.texte(d.nom, noms[i]); });
    const nomBonne = noms[droites.indexOf(bonne)];
    return choix({
      consigne: 'Regarde la figure',
      enonce: `Laquelle de ces droites est un axe de symétrie du ${forme} ?${F.svg(460, 260, figure, `Un ${forme} et trois droites`)}`,
      reponse: nomBonne,
      choix: ['(d₁)', '(d₂)', '(d₃)'],
      explication: `${explication} Ici, c’est <b>${nomBonne}</b>.`,
    });
  }

  const MEDIATRICE = [
    ['La droite perpendiculaire à un segment qui passe par son milieu s’appelle ___.', 'la médiatrice', ['la diagonale', 'la médiane', 'la parallèle'],
      'C’est la <b>médiatrice</b> du segment : elle le coupe en son milieu, en formant un angle droit.'],
    ['A′ est le symétrique de A par rapport à (d). Pour le segment [AA′], (d) est ___.', 'la médiatrice', ['la droite (AA′)', 'une parallèle à [AA′]'],
      '(d) coupe [AA′] <b>en son milieu</b>, en formant un angle droit : c’est la <b>médiatrice</b> de [AA′].'],
    ['M est un point de la médiatrice de [AB]. Qu’est-ce qui est toujours vrai ?', 'MA = MB', ['MA = AB', 'MA = 2 × MB', 'MA + MB = AB'],
      'Tout point de la médiatrice de [AB] est <b>à égale distance</b> de A et de B : MA = MB.'],
    ['Le symétrique d’un point situé sur l’axe de symétrie est…', 'lui-même', ['un autre point', 'de l’autre côté'],
      'Quand on plie le long de l’axe, un point de l’axe ne bouge pas : il est <b>son propre symétrique</b>.'],
    // (« la gauche et la droite » : le bouton « le sens (la gauche et la droite) » dépasserait 30 caractères)
    ['La symétrie axiale conserve les longueurs, les angles et ___.', 'l’alignement', ['la position', 'la gauche et la droite'],
      'La symétrie axiale conserve les longueurs, les angles et <b>l’alignement</b>. '
        + 'Mais la figure est retournée, comme dans un miroir : la gauche et la droite sont échangées.'],
  ];

  const VF_SYMETRIE = [
    ['La médiatrice d’un segment le coupe en son milieu.', true,
      'La médiatrice passe par le <b>milieu</b> du segment, et elle lui est perpendiculaire.'],
    ['Le symétrique d’un segment est un segment de même longueur.', true,
      'La symétrie axiale <b>conserve les longueurs</b>.'],
    ['Le symétrique d’un point situé sur l’axe est ce point lui-même.', true,
      'Un point de l’axe ne bouge pas quand on plie : il est <b>son propre symétrique</b>.'],
    ['Les droites qui portent les diagonales d’un losange sont ses axes de symétrie.', true,
      'En pliant un losange le long d’une diagonale, les deux moitiés se superposent : les droites de ses <b>2 diagonales</b> sont ses axes.'],
    ['Les symétriques de trois points alignés sont alignés.', true,
      'La symétrie axiale <b>conserve l’alignement</b>.'],
    ['La médiatrice d’un segment lui est parallèle.', false,
      'La médiatrice est <b>perpendiculaire</b> au segment, et elle passe par son milieu.'],
    ['Le symétrique d’un angle de 50° mesure 130°.', false,
      'La symétrie axiale <b>conserve les angles</b> : le symétrique mesure aussi <b>50°</b>.'],
    ['Un rectangle qui n’est pas un carré a 4 axes de symétrie.', false,
      'Il n’en a que <b>2</b> : les droites qui passent par les milieux des côtés opposés. Les droites de ses diagonales ne sont pas des axes.'],
    ['Un triangle équilatéral a un seul axe de symétrie.', false,
      'Il en a <b>3</b> : chacun passe par un sommet et par le milieu du côté opposé.'],
    ['Le symétrique d’une figure est toujours plus petit qu’elle.', false,
      'La symétrie ne change pas les dimensions : la figure symétrique est <b>superposable</b> à la figure de départ.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-symetrie',
    banque: ['axesFigures', 'axesFigures', 'lettres', 'lettres', 'symetrique', 'symetrique', 'quelAxe', 'mediatrice',
      'distanceAxe', 'distanceAxe', 'conserve', 'conserve', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'lettres') return questionLettres();
      if (sorte === 'symetrique') return questionSymetrique();
      if (sorte === 'quelAxe') return questionQuelAxe();
      if (sorte === 'mediatrice') return choixDans('Choisis la bonne réponse', MEDIATRICE);
      if (sorte === 'distanceAxe') return questionDistanceAxe();
      if (sorte === 'conserve') return questionConserve();
      if (sorte === 'vraiFaux') return vraiFauxDans(VF_SYMETRIE);
      // axesFigures : l'erreur classique fait toujours partie des boutons, rangés dans l'ordre
      const [figure, reponse, classique, explication] = parmi(AXES_FIGURES);
      const autres = RM.melanger(ORDRE_AXES.filter(n => n !== reponse && n !== classique)).slice(0, 2);
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `Combien d’axes de symétrie a ${figure} ?`,
        reponse,
        choix: [reponse, classique, ...autres].sort((a, b) => ORDRE_AXES.indexOf(a) - ORDRE_AXES.indexOf(b)),
        explication,
      });
    },
    titreLecon: 'La symétrie axiale',
    lecon: `
      <h4>Le symétrique d’un point</h4>
      ${F.svg(400, 140,
        F.segment([200, 10], [200, 130], 'fig-accent') + F.texte([222, 20], '(d)', { classe: 'fig-texte fig-texte-accent' })
        + F.segment([110, 75], [290, 75]) + F.angleDroit([200, 75], [290, 75], [200, 10])
        + F.codage([110, 75], [200, 75], 2) + F.codage([200, 75], [290, 75], 2)
        + nommer([110, 75], 'A', 90, 18) + nommer([290, 75], 'A′', 90, 18),
        'Un point A et son symétrique A′')}
      <p>Deux figures sont <b>symétriques par rapport à la droite (d)</b> si elles se superposent quand on plie la feuille le long de (d).</p>
      <p>Le symétrique A′ du point A est <b>de l’autre côté</b> de (d), <b>à la même distance</b>, sur la perpendiculaire à (d) qui passe par A.</p>
      <p>⭐ (d) est la <b>médiatrice</b> du segment [AA′] : la droite perpendiculaire à [AA′] qui passe par son milieu.
        Tout point de la médiatrice est à égale distance de A et de A′.</p>
      <p>La symétrie axiale <b>conserve</b> les longueurs, les angles et l’alignement.</p>
      <h4>Les axes de symétrie</h4>
      <table>
        <tr><th>carré</th><th>rectangle (pas carré)</th><th>losange (pas carré)</th><th>triangle équilatéral</th>
          <th>triangle isocèle (pas équilatéral)</th><th>cercle</th></tr>
        <tr><td>4</td><td>2</td><td>2</td><td>3</td><td>1</td><td>une infinité</td></tr>
      </table>
      <p>Les axes d’un losange sont les droites qui portent ses diagonales ; ceux d’un rectangle passent par les milieux
        de ses côtés opposés ; ceux d’un cercle sont toutes les droites qui passent par son centre.</p>
      <p>👉 <i>Les lettres A, T, V ont un axe vertical ; C, D, E un axe horizontal ; H en a deux ; F, L, N, S n’en ont aucun.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour trouver un axe, imagine que tu plies la figure :
        les deux moitiés doivent se superposer exactement.</div>
      <p>⚠️ Les droites qui portent les diagonales d’un rectangle (qui n’est pas un carré) ne sont pas des axes de symétrie !</p>
    `,
  });

  // ======================================================================
  // 7. Les solides
  // ======================================================================
  const NOMS_SOLIDES = {
    cube: 'un cube', pave: 'un pavé droit', prisme: 'un prisme droit', pyramide: 'une pyramide',
    cylindre: 'un cylindre', cone: 'un cône', boule: 'une boule',
  };
  // Les solides à compter : leur nom complet, et le nombre de faces, d'arêtes et de sommets (avec l'explication)
  const COMPTES = {
    cube: {
      nom: 'un cube',
      faces: [6, 'Un cube a <b>6 faces</b>, toutes carrées : dessus, dessous, devant, derrière, à gauche et à droite.'],
      aretes: [12, 'Un cube a <b>12 arêtes</b> : 4 autour du dessus, 4 autour du dessous et 4 qui les relient.'],
      sommets: [8, 'Un cube a <b>8 sommets</b> : 4 en haut et 4 en bas.'],
    },
    pave: {
      nom: 'un pavé droit',
      faces: [6, 'Un pavé droit a <b>6 faces</b>, toutes rectangulaires : dessus, dessous, devant, derrière, à gauche et à droite.'],
      aretes: [12, 'Un pavé droit a <b>12 arêtes</b> : 4 autour du dessus, 4 autour du dessous et 4 qui les relient.'],
      sommets: [8, 'Un pavé droit a <b>8 sommets</b> : 4 en haut et 4 en bas.'],
    },
    prisme: {
      nom: 'un prisme droit à base triangulaire',
      faces: [5, '2 bases (des triangles) + 3 faces rectangulaires = <b>5 faces</b>.'],
      aretes: [9, '3 arêtes sur chaque base (3 + 3) et 3 qui relient les deux bases : <b>9 arêtes</b>.'],
      sommets: [6, '3 sommets sur chaque base : 3 + 3 = <b>6 sommets</b>.'],
    },
    pyramide: {
      nom: 'une pyramide à base carrée',
      faces: [5, 'La base carrée + 4 faces triangulaires = <b>5 faces</b>.'],
      aretes: [8, '4 arêtes autour de la base + 4 qui montent jusqu’au sommet = <b>8 arêtes</b>.'],
      sommets: [5, 'Les 4 sommets de la base + le sommet du haut = <b>5 sommets</b>.'],
    },
    tetraedre: {
      nom: 'une pyramide à base triangulaire',
      faces: [4, 'La base triangulaire + 3 faces triangulaires = <b>4 faces</b>.'],
      aretes: [6, '3 arêtes autour de la base + 3 qui montent jusqu’au sommet = <b>6 arêtes</b>.'],
      sommets: [4, 'Les 3 sommets de la base + le sommet du haut = <b>4 sommets</b>.'],
    },
  };
  const COMBIEN = { faces: 'Combien de faces', aretes: 'Combien d’arêtes', sommets: 'Combien de sommets' };
  // Les erreurs classiques, pour les boutons : [le nombre faux, pourquoi il est faux]
  const CUBE_OU_PAVE = {
    faces: [[3, 'sur un dessin, on ne voit que 3 faces'], [4, 'il ne faut pas oublier le dessus et le dessous']],
    aretes: [[9, 'sur un dessin, on n’en voit que 9 : il ne faut pas oublier les 3 arêtes cachées'],
      [24, '6 faces × 4 arêtes, mais chaque arête est alors comptée deux fois (elle touche deux faces)']],
    sommets: [[7, 'sur un dessin, on n’en voit que 7 : il ne faut pas oublier le sommet caché'], [4, 'ce sont les sommets du dessus : il y en a aussi 4 en dessous']],
  };
  const ERREURS_CLASSIQUES = {
    cube: CUBE_OU_PAVE,
    pave: CUBE_OU_PAVE,
    prisme: {
      faces: [[3, 'il ne faut pas oublier les 2 bases'], [4, 'les 2 bases comptent, en plus des 3 faces latérales']],
      aretes: [[12, 'c’est le nombre d’arêtes du cube'], [3, 'ce sont les arêtes d’une seule base : il y en a 3 sur chaque base, et 3 qui les relient']],
      sommets: [[3, 'ce sont les sommets d’une seule base : il y en a 3 sur chaque base'], [8, 'c’est le nombre de sommets du cube']],
    },
    pyramide: {
      faces: [[4, 'il ne faut pas oublier la base'], [6, 'c’est le nombre de faces du cube']],
      aretes: [[4, 'il n’y a pas que les 4 arêtes de la base : 4 autres montent au sommet'], [12, 'c’est le nombre d’arêtes du cube']],
      sommets: [[4, 'il ne faut pas oublier le sommet du haut'], [1, 'la pointe est un sommet, mais les coins de la base aussi']],
    },
    tetraedre: {
      faces: [[3, 'il ne faut pas oublier la base'], [5, 'c’est la pyramide à base carrée qui a 5 faces']],
      aretes: [[3, 'il n’y a pas que les 3 arêtes de la base : 3 autres montent au sommet'], [8, 'c’est la pyramide à base carrée qui a 8 arêtes']],
      sommets: [[3, 'il ne faut pas oublier le sommet du haut'], [1, 'la pointe est un sommet, mais les coins de la base aussi']],
    },
  };

  // Une demi-ellipse : celle de devant (en trait plein) ou celle de derrière (en pointillés)
  const demiEllipse = ([cx, cy], rx, ry, devant, classe = 'fig-trait') =>
    `<path d="M ${r1(cx - rx)} ${r1(cy)} A ${rx} ${ry} 0 0 ${devant ? 0 : 1} ${r1(cx + rx)} ${r1(cy)}" `
    + (devant ? `class="${classe}"/>` : 'class="fig-marque fig-cache"/>');

  // Un solide dessiné en perspective cavalière (les arêtes de profondeur en biais, réduites de moitié ;
  // les arêtes cachées en pointillés)
  function dessinSolide(solide) {
    let fond = '';
    let caches = '';
    let traits = '';
    const trait = (A, B) => { traits += F.segment(A, B); };
    const cache = (A, B) => { caches += pointilles(A, B); };
    const decale = (P, k) => [P[0] + k, P[1] - k];
    if (solide === 'cube' || solide === 'pave') {
      const [l, h, p] = solide === 'cube' ? [120, 120, 120] : [180, 100, 110];
      const k = p / 2 * Math.SQRT1_2;
      const x0 = 230 - (l + k) / 2;
      const y0 = 125 + (h + k) / 2;
      const F1 = [x0, y0];
      const F2 = [x0 + l, y0];
      const F3 = [x0 + l, y0 - h];
      const F4 = [x0, y0 - h];
      const [B1, B2, B3, B4] = [F1, F2, F3, F4].map(P => decale(P, k));
      fond = F.polygone([F1, F2, B2, B3, B4, F4], 'fig-plein');
      [[F1, F2], [F2, F3], [F3, F4], [F4, F1], [F4, B4], [F3, B3], [B4, B3], [F2, B2], [B2, B3]].forEach(([A, B]) => trait(A, B));
      [[F1, B1], [B1, B2], [B1, B4]].forEach(([A, B]) => cache(A, B));
    } else if (solide === 'prisme') {
      const [b, h, p] = [130, 100, 200];
      const k = p / 2 * Math.SQRT1_2;
      const x0 = 230 - (b + k) / 2;
      const y0 = 125 + (h + k) / 2;
      const F1 = [x0, y0];
      const F2 = [x0 + b, y0];
      const F3 = [x0 + b / 2, y0 - h];
      const [B1, B2, B3] = [F1, F2, F3].map(P => decale(P, k));
      fond = F.polygone([F1, F2, B2, B3, F3], 'fig-plein');
      [[F1, F2], [F2, F3], [F3, F1], [F3, B3], [F2, B2], [B2, B3]].forEach(([A, B]) => trait(A, B));
      [[F1, B1], [B1, B2], [B1, B3]].forEach(([A, B]) => cache(A, B));
    } else if (solide === 'pyramide') {
      const [s, H] = [170, 150];
      const k = s / 2 * Math.SQRT1_2;
      const x0 = 230 - (s + k) / 2;
      const y0 = 125 + (k / 2 + H) / 2;
      const P1 = [x0, y0];
      const P2 = [x0 + s, y0];
      const P3 = decale(P2, k);
      const P4 = decale(P1, k);
      const S = [x0 + (s + k) / 2, y0 - k / 2 - H];
      fond = F.polygone([P1, P2, P3, S], 'fig-plein');
      [[P1, P2], [P2, P3], [S, P1], [S, P2], [S, P3]].forEach(([A, B]) => trait(A, B));
      [[P3, P4], [P4, P1], [S, P4]].forEach(([A, B]) => cache(A, B));
    } else if (solide === 'cylindre') {
      fond = `<path d="M 145 60 L 145 200 A 85 24 0 0 0 315 200 L 315 60 A 85 24 0 0 0 145 60 Z" class="fig-plein"/>`;
      traits = `<ellipse cx="230" cy="60" rx="85" ry="24" class="fig-trait"/>` + F.segment([145, 60], [145, 200]) + F.segment([315, 60], [315, 200])
        + demiEllipse([230, 200], 85, 24, true);
      caches = demiEllipse([230, 200], 85, 24, false);
    } else if (solide === 'cone') {
      fond = `<path d="M 230 35 L 135 200 A 95 25 0 0 0 325 200 Z" class="fig-plein"/>`;
      traits = F.segment([230, 35], [135, 200]) + F.segment([230, 35], [325, 200]) + demiEllipse([230, 200], 95, 25, true);
      caches = demiEllipse([230, 200], 95, 25, false);
    } else {
      fond = F.cercle([230, 125], 95, 'fig-plein');
      traits = F.cercle([230, 125], 95) + demiEllipse([230, 125], 95, 24, true, 'fig-marque');
      caches = demiEllipse([230, 125], 95, 24, false);
    }
    return F.svg(460, 250, fond + caches + traits, 'Un solide en perspective');
  }

  // Quel est ce solide ? Ou : combien a-t-il de faces, d'arêtes, de sommets ?
  function questionPerspective() {
    const solide = parmi(['cube', 'pave', 'prisme', 'pyramide', 'cylindre', 'cone', 'boule', 'cube', 'prisme', 'pyramide']);
    const svg = dessinSolide(solide);
    if (COMPTES[solide] && Math.random() < 0.5) {
      const quoi = parmi(['faces', 'aretes', 'sommets']);
      const [reponse, explication] = COMPTES[solide][quoi];
      return nombre({
        consigne: 'Regarde le solide',
        enonce: `${COMBIEN[quoi]} a ce solide ? (Ce qui est caché est dessiné en pointillés.)${svg}`,
        reponse,
        explication: explication + (quoi === 'faces' ? '' : ' N’oublie pas ce qui est caché, en pointillés !'),
      });
    }
    const reponse = NOMS_SOLIDES[solide];
    // Un cube est aussi un pavé droit, et le cube et le pavé droit sont des prismes droits (à base carrée ou rectangulaire) :
    // ces noms-là ne sont pas proposés comme pièges
    const aussiJuste = { cube: ['pave', 'prisme'], pave: ['prisme'] }[solide] || [];
    const pieges = Object.keys(NOMS_SOLIDES).filter(s => s !== solide && !aussiJuste.includes(s)).map(s => NOMS_SOLIDES[s]);
    const EXPLICATIONS = {
      cube: 'Six faces carrées : c’est <b>un cube</b>.',
      pave: 'Six faces rectangulaires : c’est <b>un pavé droit</b>.',
      prisme: 'Deux bases triangulaires (devant et derrière) reliées par des rectangles : c’est <b>un prisme droit</b>.',
      pyramide: 'Une base carrée et des faces triangulaires qui se rejoignent en un sommet : c’est <b>une pyramide</b>.',
      cylindre: 'Deux bases rondes (des disques) reliées par une surface courbe : c’est <b>un cylindre</b>.',
      cone: 'Une base ronde (un disque) et un sommet : c’est <b>un cône</b>.',
      boule: 'Toute ronde, sans face plane, sans arête ni sommet : c’est <b>une boule</b>.',
    };
    return choix({ consigne: 'Regarde le solide', enonce: `Quel est ce solide ?${svg}`, reponse, pieges, explication: EXPLICATIONS[solide] });
  }

  const RECONNAITRE_SOLIDES = [
    ['Quel solide a 6 faces, toutes carrées ?', 'un cube', ['un cône', 'une pyramide', 'un cylindre'],
      'Six faces carrées : c’est <b>un cube</b>.'],
    ['Quel solide a une base carrée et 4 faces triangulaires ?', 'une pyramide', ['un cube', 'un prisme droit', 'un cône'],
      'Une base et des triangles qui se rejoignent en un sommet : c’est <b>une pyramide</b> (à base carrée).'],
    ['Quel solide a 2 bases triangulaires et 3 faces rectangulaires ?', 'un prisme droit', ['une pyramide', 'un pavé droit', 'un cube'],
      'Deux bases pareilles reliées par des rectangles : c’est <b>un prisme droit</b> (à base triangulaire).'],
    ['Quel solide a deux bases qui sont des disques ?', 'un cylindre', ['un cône', 'une boule', 'un prisme droit'],
      'Deux bases en forme de disque : c’est <b>un cylindre</b>.'],
    ['Quel solide a une seule base, un disque, et un sommet ?', 'un cône', ['un cylindre', 'une pyramide', 'une boule'],
      'Une base en forme de disque et un sommet : c’est <b>un cône</b>.'],
    ['Quel solide n’a ni face plane, ni arête, ni sommet ?', 'une boule', ['un cylindre', 'un cône', 'un cube'],
      'Toute ronde, sans rien de plat : c’est <b>une boule</b>. (Le cylindre et le cône ont des bases plates.)'],
    ['Quel solide ressemble à une boîte à chaussures ?', 'un pavé droit', ['un cube', 'un cylindre', 'une pyramide'],
      'Une boîte à chaussures a 6 faces rectangulaires : c’est <b>un pavé droit</b>.'],
    ['Quel solide ressemble à un dé à jouer ?', 'un cube', ['une boule', 'une pyramide', 'un cylindre'],
      'Un dé a 6 faces carrées, toutes pareilles : c’est <b>un cube</b>.'],
    ['Quel solide ressemble à une boîte de conserve ?', 'un cylindre', ['un cône', 'un pavé droit', 'une boule'],
      'Une boîte de conserve a deux bases rondes : c’est <b>un cylindre</b>.'],
    ['Quel solide ressemble à un cornet de glace ?', 'un cône', ['un cylindre', 'une pyramide', 'une boule'],
      'Un cornet a une base ronde et une pointe : c’est <b>un cône</b>.'],
    ['Quel solide ressemble à une bille ?', 'une boule', ['un cube', 'un cône', 'un cylindre'],
      'Une bille est toute ronde : c’est <b>une boule</b>.'],
    ['Quelle forme ont les faces d’un cube ?', 'des carrés', ['des triangles', 'des disques', 'des hexagones'],
      'Les 6 faces d’un cube sont <b>des carrés</b>, tous pareils.'],
    ['Quelle forme ont les faces latérales d’une pyramide ?', 'des triangles', ['des carrés', 'des rectangles', 'des disques'],
      'Les faces latérales d’une pyramide sont <b>des triangles</b> qui se rejoignent au sommet.'],
    ['Quelle forme ont les faces latérales d’un prisme droit ?', 'des rectangles', ['des triangles', 'des disques', 'des pentagones'],
      'Les faces latérales d’un prisme droit sont <b>des rectangles</b>, qui relient les deux bases.'],
    ['Quelle forme ont les bases d’un cylindre ?', 'des disques', ['des carrés', 'des triangles', 'des rectangles'],
      'Les deux bases d’un cylindre sont <b>des disques</b>.'],
    ['Quelle forme ont les faces d’un pavé droit ?', 'des rectangles', ['des triangles', 'des disques', 'des hexagones'],
      'Les 6 faces d’un pavé droit sont <b>des rectangles</b>.'],
  ];

  // Les patrons du cube : on range les 216 façons de coller 6 carrés, et on regarde lesquelles se plient en cube
  let FORMES_DE_6 = null;
  // On « fait rouler » un cube sur les 6 carrés : si chaque carré touche une face différente, c'est un patron
  function estUnPatron(cases) {
    const cle = ([c, l]) => `${c},${l}`;
    const ensemble = new Set(cases.map(cle));
    // La position du cube : la face qui est en bas, en haut, au nord (vers le haut du dessin), au sud, à l'est, à l'ouest
    const rouler = (p, dc, dl) => (dc === 1 ? { ...p, bas: p.est, est: p.haut, haut: p.ouest, ouest: p.bas }
      : dc === -1 ? { ...p, bas: p.ouest, ouest: p.haut, haut: p.est, est: p.bas }
        : dl === 1 ? { ...p, bas: p.sud, sud: p.haut, haut: p.nord, nord: p.bas }
          : { ...p, bas: p.nord, nord: p.haut, haut: p.sud, sud: p.bas });
    const vues = new Map([[cle(cases[0]), { bas: 'bas', haut: 'haut', nord: 'nord', sud: 'sud', est: 'est', ouest: 'ouest' }]]);
    const file = [cases[0]];
    while (file.length) {
      const [c, l] = file.shift();
      const p = vues.get(cle([c, l]));
      for (const [dc, dl] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const voisin = [c + dc, l + dl];
        if (ensemble.has(cle(voisin)) && !vues.has(cle(voisin))) {
          vues.set(cle(voisin), rouler(p, dc, dl));
          file.push(voisin);
        }
      }
    }
    return vues.size === 6 && new Set([...vues.values()].map(p => p.bas)).size === 6;
  }
  function formesDe6() {
    if (FORMES_DE_6) return FORMES_DE_6;
    const ranger = cases => {
      const mc = Math.min(...cases.map(c => c[0]));
      const ml = Math.min(...cases.map(c => c[1]));
      return cases.map(([c, l]) => [c - mc, l - ml]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    };
    const cle = cases => cases.map(c => c.join(',')).join(';');
    let formes = new Map([['0,0', [[0, 0]]]]);
    for (let n = 2; n <= 6; n++) {
      const suivantes = new Map();
      formes.forEach(cases => {
        const deja = new Set(cases.map(c => c.join(',')));
        cases.forEach(([c, l]) => {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dl]) => {
            if (deja.has(`${c + dc},${l + dl}`)) return;
            const nouvelle = ranger([...cases, [c + dc, l + dl]]);
            suivantes.set(cle(nouvelle), nouvelle);
          });
        });
      });
      formes = suivantes;
    }
    FORMES_DE_6 = [...formes.values()].map(cases => {
      const largeur = Math.max(...cases.map(c => c[0])) + 1;
      const hauteur = Math.max(...cases.map(c => c[1])) + 1;
      const a = new Set(cases.map(c => c.join(',')));
      // 4 carrés en carré, ou 5 carrés à la suite : les deux raisons les plus simples de ne pas être un patron
      const bloc = cases.some(([c, l]) => a.has(`${c + 1},${l}`) && a.has(`${c},${l + 1}`) && a.has(`${c + 1},${l + 1}`));
      const ligne5 = cases.some(([c, l]) => [1, 2, 3, 4].every(i => a.has(`${c + i},${l}`)) || [1, 2, 3, 4].every(i => a.has(`${c},${l + i}`)));
      return { cases, largeur, hauteur, patron: estUnPatron(cases), bloc, ligne5 };
    }).filter(f => f.largeur <= 5 && f.hauteur <= 4);
    return FORMES_DE_6;
  }

  function questionPatron() {
    const oui = Math.random() < 0.5;
    let candidates = formesDe6().filter(f => f.patron === oui);
    // Pour les « non », le plus souvent une forme qui ressemble à un patron (sans carré de 4 carrés)
    if (!oui && Math.random() < 0.6) candidates = candidates.filter(f => !f.bloc);
    const forme = parmi(candidates);
    const cote = 40;
    let dessin = '';
    forme.cases.forEach(([c, l]) => {
      const x = 20 + c * cote;
      const y = 20 + l * cote;
      dessin += F.polygone([[x, y], [x + cote, y], [x + cote, y + cote], [x, y + cote]]);
    });
    const svg = F.svg(forme.largeur * cote + 40, forme.hauteur * cote + 40, dessin, 'Six carrés');
    let explication;
    if (oui) explication = 'Oui : en pliant, les 6 carrés forment les <b>6 faces</b> du cube, sans se superposer. C’est un <b>patron</b> du cube.';
    else if (forme.bloc) explication = 'Non : 4 carrés collés en carré ne peuvent pas se plier autour d’un cube : <b>deux faces se superposent</b>.';
    else if (forme.ligne5) explication = 'Non : avec 5 carrés à la suite, le 5e revient sur le 1er quand on plie : <b>deux faces se superposent</b>.';
    else explication = 'Non : en pliant, <b>deux carrés arrivent au même endroit</b>, et une face du cube reste ouverte.';
    return choix({
      consigne: 'Imagine que tu plies',
      enonce: `Ce dessin est-il un patron de cube ?${svg}`,
      reponse: oui ? 'Oui' : 'Non',
      choix: ['Oui', 'Non'],
      explication,
    });
  }

  const VF_SOLIDES = [
    ['Un cube a 8 sommets.', true, 'Un cube a <b>8 sommets</b> : 4 en haut et 4 en bas.'],
    ['Toutes les faces d’un cube sont des carrés.', true, 'Les 6 faces d’un cube sont <b>des carrés</b> identiques.'],
    ['Un pavé droit et un cube ont le même nombre d’arêtes.', true, 'Tous les deux ont <b>12 arêtes</b> (et 6 faces, 8 sommets).'],
    ['Un cylindre a deux bases en forme de disque.', true, 'Un cylindre a <b>deux bases</b> : des disques, reliés par une surface courbe.'],
    ['Un prisme droit à base triangulaire a 6 sommets.', true, '3 sommets sur chaque base triangulaire : 3 + 3 = <b>6 sommets</b>.'],
    ['Un cube a 6 arêtes.', false, 'Un cube a <b>6 faces</b>, mais <b>12 arêtes</b> : 4 en haut, 4 en bas et 4 qui les relient.'],
    ['Une pyramide à base carrée a 4 faces.', false, 'La base carrée + 4 triangles = <b>5 faces</b>. Il ne faut pas oublier la base !'],
    ['Une boule a une face plane.', false, 'Une boule est toute ronde : elle n’a <b>aucune</b> face plane.'],
    ['Un cône a deux bases.', false, 'Un cône a <b>une seule</b> base (un disque) et un sommet. C’est le cylindre qui a deux bases.'],
    ['Toutes les faces d’un pavé droit sont des carrés.', false, 'Les faces d’un pavé droit sont des <b>rectangles</b> ; elles ne sont toutes carrées que pour un cube.'],
  ];

  ajouterEtape({
    id: '6e-geometrie-solides',
    banque: ['compter', 'compter', 'compter', 'compterChoix', 'compterChoix', 'reconnaitre', 'reconnaitre', 'reconnaitre',
      'perspective', 'perspective', 'patron', 'patron', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'reconnaitre') return choixDans('Choisis la bonne réponse', RECONNAITRE_SOLIDES);
      if (sorte === 'perspective') return questionPerspective();
      if (sorte === 'patron') return questionPatron();
      if (sorte === 'vraiFaux') return vraiFauxDans(VF_SOLIDES);
      const cle = parmi(Object.keys(COMPTES));
      const solide = COMPTES[cle];
      const quoi = parmi(['faces', 'aretes', 'sommets']);
      const [reponse, explication] = solide[quoi];
      const enonce = `${COMBIEN[quoi]} a ${solide.nom} ?`;
      if (sorte === 'compter') return nombre({ consigne: 'Écris le nombre', enonce, reponse, explication });
      // compterChoix : les pièges sont toujours les autres nombres du même solide (faces, arêtes, sommets),
      // complétés par des erreurs classiques (jusqu'à 3 pièges)
      const pieges = [...new Set(['faces', 'aretes', 'sommets'].filter(q => q !== quoi).map(q => solide[q][0]))].filter(v => v !== reponse);
      const erreurs = [];
      RM.melanger(ERREURS_CLASSIQUES[cle][quoi]).forEach(([v, raison]) => {
        if (pieges.length < 3 && !pieges.includes(v) && v !== reponse) {
          pieges.push(v);
          erreurs.push(`⚠️ ${v} : ${raison}.`);
        }
      });
      return choix({
        consigne: 'Choisis le bon nombre',
        enonce,
        reponse,
        pieges,
        explication: `${explication}<br>${erreurs[0]}`,
      });
    },
    titreLecon: 'Les solides',
    lecon: `
      <h4>Faces, arêtes, sommets</h4>
      ${dessinSolide('cube')}
      <p>Une <b>face</b> est une surface plate ; une <b>arête</b> est un segment où deux faces se touchent ;
        un <b>sommet</b> est un point où des arêtes se rejoignent. En perspective, ce qui est caché est dessiné en <b>pointillés</b>.</p>
      <p>Un <b>prisme droit</b> a 2 <b>bases</b> pareilles, reliées par des <b>faces latérales</b> rectangulaires ;
        une <b>pyramide</b> a 1 base et des faces latérales triangulaires qui se rejoignent au sommet.</p>
      <table>
        <tr><th>Solide</th><th>Faces</th><th>Arêtes</th><th>Sommets</th></tr>
        <tr><td>cube (6 carrés)</td><td>6</td><td>12</td><td>8</td></tr>
        <tr><td>pavé droit (6 rectangles)</td><td>6</td><td>12</td><td>8</td></tr>
        <tr><td>prisme droit à base triangulaire (2 triangles et 3 rectangles)</td><td>5</td><td>9</td><td>6</td></tr>
        <tr><td>pyramide à base carrée (1 carré et 4 triangles)</td><td>5</td><td>8</td><td>5</td></tr>
        <tr><td>pyramide à base triangulaire (4 triangles)</td><td>4</td><td>6</td><td>4</td></tr>
      </table>
      <p>Les solides « ronds » : le <b>cylindre</b> (2 bases en forme de disque), le <b>cône</b> (1 base en forme de disque et un sommet),
        la <b>boule</b> (ni face plane, ni arête, ni sommet).</p>
      <p>Un <b>patron</b> est une figure qu’on découpe et qu’on plie pour fabriquer le solide. Un patron de cube est fait de 6 carrés
        (il en existe 11 différents).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour compter les arêtes d’un prisme, compte celles de la base du dessus,
        celles de la base du dessous, puis celles qui les relient : 3 + 3 + 3 = 9.</div>
      <p>⚠️ N’oublie pas les arêtes et les sommets cachés, dessinés en pointillés !</p>
    `,
  });
})();
