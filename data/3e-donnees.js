// Renard Malin — Maths, niveau 3e : les 6 étapes du Marché des Données
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. les fonctions · 2. les fonctions linéaires · 3. les fonctions affines · 4. les statistiques ·
// 5. les probabilités (deux épreuves) · 6. les évolutions en pourcentage

(function () {
  const {
    entier, parmi, entierSauf, net, ecrire, mesure, euros, parentheses, frac, fracTexte, simplifier, tableau, egaux,
    choix, nombre, fraction, vraiFaux, ajouterEtape, figures, MOINS, ESPACE,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes (« il » ou « elle », pour les accords)
  const ENFANTS = [
    { nom: 'Léa', il: 'elle' }, { nom: 'Tom', il: 'il' }, { nom: 'Zoé', il: 'elle' }, { nom: 'Hugo', il: 'il' },
    { nom: 'Inès', il: 'elle' }, { nom: 'Sami', il: 'il' }, { nom: 'Lina', il: 'elle' }, { nom: 'Noé', il: 'il' },
    { nom: 'Jade', il: 'elle' }, { nom: 'Malo', il: 'il' },
  ];
  // « de » devant une voyelle : d’Inès, d’Hugo
  const VOYELLE = /^([aeiouéèêàâîôœ]|hu)/i;
  const de = mot => (VOYELLE.test(mot) ? `d’${mot}` : `de ${mot}`);
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Un nombre et son nom, au pluriel à partir de 2 : « 1 issue », « 4 issues »
  const combien = (n, singulier, pluriel = `${singulier}s`) => `${ecrire(n)}${ESPACE}${n >= 2 ? pluriel : singulier}`;
  const croissant = valeurs => [...valeurs].sort((a, b) => a - b);
  const additionner = valeurs => valeurs.reduce((s, v) => s + v, 0);
  // Les nombres de min à max, de « pas » en « pas »
  function intervalle(min, max, pas = 1) {
    const valeurs = [];
    for (let v = min; v <= max + 1e-9; v += pas) valeurs.push(net(v));
    return valeurs;
  }
  // n nombres différents, pris entre min et max
  const differents = (n, min, max, pas = 1) => RM.melanger(intervalle(min, max, pas)).slice(0, n);
  // Une somme écrite en entier : « 12 + 8 + 15 »
  const somme = valeurs => valeurs.map(v => ecrire(v)).join(' + ');
  // Une liste de nombres séparés par des points-virgules : « 12 ; 8,5 ; 10 »
  const liste = valeurs => valeurs.map(v => ecrire(v)).join(`${ESPACE}; `);
  // Les pièges : des nombres positifs, sans les erreurs de calcul de l'ordinateur
  const positifs = valeurs => valeurs.map(net).filter(v => v > 0);
  // Au plus un (ou deux) chiffres après la virgule
  const auDixieme = v => Number.isFinite(v) && Number.isInteger(net(v * 10));
  const auCentieme = v => Number.isFinite(v) && Number.isInteger(net(v * 100));
  const pc = t => mesure(t, '%');
  // Des nombres relatifs dans les étapes des fonctions : le bouton « − » est toujours là
  const TOUCHES = [',', '−'];
  // « + 5 » ou « − 5 », pour écrire ax + b
  const avecSigne = v => `${v < 0 ? MOINS : '+'} ${ecrire(Math.abs(v))}`;
  // « 3x », « x », « −x », « 0,5x » (ou « 3x² »)
  const devant = (a, lettre = 'x') => (a === 1 ? lettre : a === -1 ? `${MOINS}${lettre}` : `${ecrire(a)}${lettre}`);
  // ax + b bien écrit : « 3x − 5 », « −x + 2 », « 4x » (b = 0), « 7 » (a = 0)
  function affineEcrite(a, b) {
    if (a === 0) return ecrire(b);
    return b === 0 ? devant(a) : `${devant(a)} ${avecSigne(b)}`;
  }
  // Des entiers rangés : « 3 », « −2 et 3 », « −2 ; 1 et 4 » (pour les boutons : l'espace avant « ; » est insécable)
  function enumerer(valeurs) {
    const v = croissant(valeurs).map(x => ecrire(x));
    return v.length === 1 ? v[0] : `${v.slice(0, -1).join(`${ESPACE}; `)} et ${v[v.length - 1]}`;
  }
  // « A(2 ; −3) »
  const point = (nom, x, y) => `${nom}(${ecrire(x)}${ESPACE}; ${ecrire(y)})`;
  // Les nombres des axes d'un repère, écrits par-dessus les courbes avec un contour blanc : on les lit même quand
  // une courbe ou une droite passe dessus
  function nombresLisibles(svg) {
    const nombres = [];
    const sans = svg.replace(/<text [^>]*class="fig-petit"[^>]*>[^<]*<\/text>/g, t => {
      nombres.push(t.replace('class="fig-petit"', 'class="fig-petit" style="paint-order: stroke; stroke: #fff; stroke-width: 4px; stroke-linejoin: round"'));
      return '';
    });
    return sans.replace('</svg>', `${nombres.join('')}</svg>`);
  }
  // Pour une question « quel(s) antécédent(s) » à boutons : la bonne réponse ne doit pas se reconnaître à sa forme.
  // On garde toujours un piège qui a plusieurs nombres (« 1 et 4 ») et un piège qui n'en a qu'un (« 4 »).
  const plusieurs = t => / et /.test(t);
  function piegesDeForme(reponse, pieges) {
    const autres = [...new Set(pieges)].filter(t => t && t !== reponse);
    const multiples = RM.melanger(autres.filter(plusieurs));
    const seuls = RM.melanger(autres.filter(t => !plusieurs(t)));
    return [multiples[0], seuls[0]].filter(Boolean);
  }

  // ======================================================================
  // 1. Les fonctions
  // ======================================================================
  // Des fonctions données par une formule. Pour chacune : l'écriture, la valeur f(x), les nombres x qui vont bien,
  // le calcul détaillé, l'erreur classique principale (expliquée par Roxy, toujours sur un bouton) et d'autres erreurs
  function formule(sorte = parmi(['affine', 'carre', 'carre', 'moinsCarre', 'trinome'])) {
    if (sorte === 'affine') {
      const a = parmi([2, 3, 4, 5, -2, -3, -4]);
      const b = entierSauf(-9, 9, [0]);
      const f = x => a * x + b;
      return {
        sorte, f, ecrite: affineEcrite(a, b),
        // (un x négatif, ou un coefficient négatif : il y a un signe à gérer)
        xs: intervalle(-6, 6).filter(x => Math.abs(x) >= 2 && (x < 0 || a < 0)),
        calcul: x => `${ecrire(a)} × ${parentheses(x)} ${avecSigne(b)} = ${ecrire(a * x)} ${avecSigne(b)} = <b>${ecrire(f(x))}</b>`,
        principal: x => ({
          valeur: -a * x + b,
          texte: `${ecrire(a)} × ${parentheses(x)} = ${ecrire(a * x)}, et pas ${ecrire(-a * x)} : attention à la règle des signes.`,
        }),
        // 3x lu comme 3 + x, le signe de b oublié, 3x + 5 calculé comme 3 × (x + 5)
        autres: x => [a + x + b, a * x - b, a * (x + b)],
      };
    }
    if (sorte === 'carre') {
      const a = parmi([1, 1, 2, 3]);
      const b = entierSauf(-9, 9, [0]);
      const f = x => a * x * x + b;
      return {
        sorte, f, ecrite: `${devant(a, 'x²')} ${avecSigne(b)}`,
        // (pas x = 2 : 2² = 2 × 2, l'erreur « x² = 2x » donnerait la bonne réponse)
        // (ni 2 ni −2 : 2 × 2 = 2², et 2 × (−2) = −(−2)², deux erreurs donneraient le même nombre)
        xs: [-5, -4, -3, 3, 4, 5].filter(x => a * x * x <= 50),
        calcul: x => `${a === 1 ? '' : `${ecrire(a)} × `}${parentheses(x)}² ${avecSigne(b)} = `
          + `${a === 1 ? '' : `${ecrire(a)} × ${ecrire(x * x)} ${avecSigne(b)} = `}${ecrire(a * x * x)} ${avecSigne(b)} = <b>${ecrire(f(x))}</b>`,
        principal: x => (x < 0
          ? { valeur: -a * x * x + b, texte: `${parentheses(x)}² = ${ecrire(x * x)}, et pas ${ecrire(-x * x)} : un carré n’est jamais négatif.` }
          : { valeur: 2 * a * x + b, texte: `${ecrire(x)}² = ${ecrire(x)} × ${ecrire(x)} = ${ecrire(x * x)}, et pas 2 × ${ecrire(x)}.` }),
        // (a × x)² au lieu de a × x², le signe de b oublié, x² lu comme 2x
        autres: x => [a * a * x * x + b, a * x * x - b, 2 * a * x + b, -a * x * x + b],
      };
    }
    if (sorte === 'moinsCarre') {
      const b = entier(5, 20);
      const f = x => b - x * x;
      return {
        sorte, f, ecrite: `${ecrire(b)} − x²`,
        xs: [-5, -4, -3],
        calcul: x => `${ecrire(b)} − ${parentheses(x)}² = ${ecrire(b)} − ${ecrire(x * x)} = <b>${ecrire(f(x))}</b>`,
        principal: x => ({
          valeur: b + x * x,
          texte: `${parentheses(x)}² = ${ecrire(x * x)}, et on l’enlève : pas ${ecrire(b)} + ${ecrire(x * x)} = ${ecrire(b + x * x)}.`,
        }),
        // x² lu comme 2x, l'ordre inversé
        autres: x => [b - 2 * x, x * x - b],
      };
    }
    const c = parmi([2, 3, 4, 5, -2, -3, -4, -5]);
    const d = entierSauf(-6, 6, [0]);
    const f = x => x * x + c * x + d;
    const cx = `${c < 0 ? MOINS : '+'} ${ecrire(Math.abs(c))}`;
    return {
      sorte: 'trinome', f, ecrite: `x² ${cx}x ${avecSigne(d)}`,
      xs: [-4, -3, -2, -1, 3, 4],
      calcul: x => `${parentheses(x)}² ${cx} × ${parentheses(x)} ${avecSigne(d)} = ${ecrire(x * x)} ${avecSigne(c * x)} ${avecSigne(d)} = <b>${ecrire(f(x))}</b>`,
      principal: x => (x < 0
        ? { valeur: -x * x + c * x + d, texte: `${parentheses(x)}² = ${ecrire(x * x)}, et pas ${ecrire(-x * x)} : un carré n’est jamais négatif.` }
        : { valeur: 2 * x + c * x + d, texte: `${ecrire(x)}² = ${ecrire(x)} × ${ecrire(x)} = ${ecrire(x * x)}, et pas 2 × ${ecrire(x)}.` }),
      // le signe du produit c × x, cx lu comme c + x, le signe de d
      autres: x => [x * x - c * x + d, x * x + c + x + d, x * x + c * x - d],
    };
  }

  // « Soit f la fonction définie par f(x) = … » ou « On considère la fonction f : x ↦ … »
  const introFonction = ecrite => parmi([`Soit f la fonction définie par f(x) = ${ecrite}.`, `On considère la fonction f : x ↦ ${ecrite}.`]);

  function questionImage(avecBoutons) {
    const F = formule();
    const x = parmi(F.xs);
    const r = F.f(x);
    const enonce = `${introFonction(F.ecrite)} ${parmi([`Calcule f(${ecrire(x)}).`, `Calcule l’image de ${ecrire(x)} par f.`])}`;
    const explication = `On remplace x par ${ecrire(x)} :<br>f(${ecrire(x)}) = ${F.calcul(x)}.`;
    if (!avecBoutons) return nombre({ consigne: 'Calcule l’image', enonce, reponse: r, touches: TOUCHES, explication });
    const P = F.principal(x);
    return choix({
      consigne: 'Calcule l’image',
      enonce,
      reponse: r,
      pieges: F.autres(x),
      garder: [P.valeur],
      explication: `${explication}<br>⚠️ ${P.texte}`,
    });
  }

  // Un antécédent avec une fonction affine : on résout une équation
  function questionAntecedent(avecBoutons) {
    const a = parmi([2, 3, 4, -2, -3, -4]);
    const b = entierSauf(-7, 7, [0]);
    const f = x => a * x + b;
    let x0;
    // (x0 n'est pas sa propre image, et l'image de m n'est pas x0 : l'image et l'antécédent sont bien différents)
    do { x0 = entierSauf(-5, 5, [0]); } while (f(x0) === x0 || f(f(x0)) === x0);
    const m = f(x0);
    const ecrite = affineEcrite(a, b);
    const enonce = `Soit f(x) = ${ecrite}. Quel est l’antécédent de ${ecrire(m)} par f ?`;
    const explication = `On cherche x tel que ${ecrite} = ${ecrire(m)}.<br>${devant(a)} = ${ecrire(m)} ${avecSigne(-b)} = ${ecrire(m - b)}, `
      + `donc x = ${ecrire(m - b)} ÷ ${parentheses(a)} = <b>${ecrire(x0)}</b>.`;
    if (!avecBoutons) return nombre({ consigne: 'Trouve l’antécédent', enonce, reponse: x0, touches: TOUCHES, explication });
    // Les erreurs : calculer l'image de m (le piège !), se tromper de signe en passant b de l'autre côté, oublier de diviser
    const image = f(m);
    const autres = [(m + b) / a, m - b, (m - b) * a, -x0].filter(v => Number.isInteger(v));
    const garder = Math.abs(image) <= 120 ? image : m - b;
    // (les erreurs sont presque toujours loin de la réponse : on mélange les boutons, sinon elle serait toujours au milieu)
    const q = choix({ consigne: 'Trouve l’antécédent', enonce, reponse: x0, pieges: autres, garder: [garder], ordre: 'melange', explication });
    q.explication += garder === image
      ? `<br>⚠️ f(${ecrire(m)}) = ${ecrire(image)} : c’est l’<b>image</b> de ${ecrire(m)}, pas son antécédent.`
      : `<br>⚠️ N’oublie pas de diviser par ${parentheses(a)} : x = ${ecrire(m - b)} ÷ ${parentheses(a)}.`;
    return q;
  }

  // Les antécédents avec f(x) = x² + b : deux, un seul ou aucun
  function questionAntecedentsCarre() {
    const b = entierSauf(-9, 9, [0]);
    const ecrite = `x² ${avecSigne(b)}`;
    const cas = parmi(['deux', 'deux', 'deux', 'aucun', 'zero']);
    const image = m => m * m + b;
    const AUCUN = 'aucun antécédent';
    // l'image de m (le piège de la confusion), seulement si elle est petite et ne ressemble pas à une autre réponse
    const imagePiege = (interdits, sinon) => (Math.abs(m) <= 10 && !interdits.includes(image(m)) ? ecrire(image(m)) : sinon);
    let m;
    let reponse;
    let pieges;
    let explication;
    if (cas === 'deux') {
      const k = entier(2, 6);
      m = k * k + b;
      reponse = `${ecrire(-k)} et ${ecrire(k)}`;
      // (avec k = 2, « 4 ÷ 2 = 2 » donnerait la bonne réponse : on ne propose alors que « −4 et 4 »)
      const paires = [`${ecrire(-k * k)} et ${ecrire(k * k)}`, ...(k * k % 2 === 0 && k * k / 2 !== k ? [`${ecrire(-k * k / 2)} et ${ecrire(k * k / 2)}`] : [])];
      pieges = [`${ecrire(k)} seulement`, imagePiege([k, -k], AUCUN), AUCUN, parmi(paires)];
      explication = `On résout x² ${avecSigne(b)} = ${ecrire(m)}, donc x² = ${ecrire(k * k)}.<br>`
        + `Deux nombres ont pour carré ${ecrire(k * k)} : <b>${ecrire(-k)} et ${ecrire(k)}</b>. N’oublie pas le nombre négatif !`;
    } else if (cas === 'aucun') {
      const k = entier(1, 4);
      m = b - k * k;
      reponse = AUCUN;
      pieges = [`${ecrire(-k)} et ${ecrire(k)}`, `${ecrire(k)} seulement`, imagePiege([k, -k], `${ecrire(-k * k)} et ${ecrire(k * k)}`)];
      explication = `On résout x² ${avecSigne(b)} = ${ecrire(m)}, donc x² = ${ecrire(-k * k)}.<br>`
        + `Un carré n’est jamais négatif : ${ecrire(m)} n’a <b>aucun antécédent</b> par f.`;
    } else {
      m = b;
      reponse = '0 seulement';
      // (lire x = b dans x² + b = b, confondre avec l'image)
      pieges = [AUCUN, `${ecrire(b)} seulement`, imagePiege([0, b], AUCUN)];
      explication = `On résout x² ${avecSigne(b)} = ${ecrire(m)}, donc x² = 0.<br>Seul 0 a pour carré 0 : <b>0 seulement</b>.`;
    }
    return choix({
      consigne: 'Trouve les antécédents',
      enonce: `Soit f(x) = ${ecrite}. Quels sont les antécédents de ${ecrire(m)} par f ?`,
      reponse,
      pieges,
      // (la réponse « −4 et 4 » n'est jamais le seul bouton à deux nombres)
      garder: cas === 'deux' ? [pieges[3]] : [],
      explication,
    });
  }

  // Un tableau de valeurs : l'image d'un nombre, ou les antécédents d'un nombre qui apparaît deux fois
  function questionTableauValeurs() {
    const html = (xs, fs) => tableau([['x', ...xs], ['f(x)', ...fs]]);
    const depart = entier(-3, 0);
    const xs = intervalle(depart, depart + 5);
    const consigne = 'Lis le tableau de valeurs';
    if (Math.random() < 0.5) {
      // L'image : le nombre demandé est aussi dans la ligne f(x), à une autre place (le piège de la mauvaise ligne)
      const c = entier(1, 4);
      const autre = parmi([0, 1, 2, 3, 4, 5].filter(i => i !== c));
      let fs;
      do {
        fs = differents(6, -6, 9);
        fs[autre] = xs[c];
      } while (new Set(fs).size < 6 || fs[c] === xs[c] || fs[c] === xs[autre]);
      return choix({
        consigne,
        enonce: `${html(xs, fs)}D’après le tableau, quelle est l’image de ${ecrire(xs[c])} par f ?`,
        reponse: fs[c],
        // la mauvaise ligne (l'antécédent), la mauvaise colonne
        pieges: [fs[c - 1], fs[c + 1]],
        garder: [xs[autre]],
        explication: `Sous ${ecrire(xs[c])}, dans la ligne f(x), on lit ${ecrire(fs[c])} : f(${ecrire(xs[c])}) = <b>${ecrire(fs[c])}</b>.`
          + `<br>⚠️ f(${ecrire(xs[autre])}) = ${ecrire(xs[c])} : ${ecrire(xs[autre])} est un antécédent de ${ecrire(xs[c])}, pas son image.`,
      });
    }
    // Les antécédents : le nombre m est une ou deux fois dans la ligne f(x) ; il est aussi dans la ligne x (le piège de l'image).
    // La question ne dit pas combien il y en a, et les boutons mélangent des nombres seuls et des paires.
    const deux = Math.random() < 0.65;
    let fs;
    let cs;
    let cm;
    for (;;) {
      cs = croissant(differents(deux ? 2 : 1, 0, 5));
      cm = parmi([0, 1, 2, 3, 4, 5].filter(i => !cs.includes(i)));
      const m = xs[cm];
      fs = differents(6, -6, 9).map(v => (v === m ? 10 : v));
      cs.forEach(c => { fs[c] = m; });
      const autres = fs.filter((v, i) => !cs.includes(i));
      // (l'image de m n'est ni m, ni un de ses antécédents : sinon le piège serait aussi une bonne réponse)
      if (new Set(autres).size === autres.length && fs[cm] !== m && !cs.some(c => xs[c] === fs[cm])) break;
    }
    const m = xs[cm];
    const bons = cs.map(c => xs[c]);
    const image = fs[cm];
    const reponse = enumerer(bons);
    // Les erreurs : lire la colonne voisine, prendre l'image, n'en trouver qu'un (ou en ajouter un)
    const voisins = cs.flatMap(c => [c - 1, c + 1]).filter(c => c >= 0 && c <= 5 && !cs.includes(c) && c !== cm).map(c => xs[c]);
    const pieges = deux
      ? [...voisins.map(v => enumerer([bons[0], v])), ...voisins.map(v => enumerer([v, bons[1]])), enumerer([bons[0], image]), ...bons.map(v => ecrire(v))]
      : [...voisins.map(v => enumerer([bons[0], v])), enumerer([bons[0], image]), ...voisins.map(v => ecrire(v))];
    const q = choix({
      consigne,
      enonce: `${html(xs, fs)}D’après le tableau, quel(s) est (sont) le(s) antécédent(s) de ${ecrire(m)} par f ?`,
      reponse,
      pieges: [...pieges, ecrire(image)],
      garder: [ecrire(image), ...piegesDeForme(reponse, pieges).filter(plusieurs)],
      explication: (deux
        ? `${ecrire(m)} est deux fois dans la ligne f(x) : sous ${ecrire(bons[0])} et sous ${ecrire(bons[1])}.<br>Les antécédents de ${ecrire(m)} sont <b>${reponse}</b>.`
        : `${ecrire(m)} n’est qu’une fois dans la ligne f(x), sous ${ecrire(bons[0])} : d’après le tableau, ${ecrire(m)} a un seul antécédent, <b>${reponse}</b>.`)
        + `<br>⚠️ f(${ecrire(m)}) = ${ecrire(image)} : c’est l’image de ${ecrire(m)}, pas un antécédent.`,
    });
    return q;
  }

  // La courbe d'une fonction : elle passe par un point de coordonnées entières pour chaque x entier de −4 à 4.
  // Entre deux de ces points, elle monte ou descend sans faire de bosse (elle ne dépasse jamais ses deux points),
  // donc on sait exactement où elle coupe chaque ligne horizontale du quadrillage.
  const REPERE_COURBE = { xmin: -4, xmax: 4, ymin: -2, ymax: 5, unite: 34 };
  function courbeAuHasard() {
    for (;;) {
      // où la courbe change de sens : une ou deux fois
      const tours = parmi([[entier(-2, 2)], [entier(-3, -1), entier(1, 3)]]);
      let monte = Math.random() < 0.5;
      const ys = [0];
      for (let x = -3; x <= 4; x++) {
        if (tours.includes(x - 1)) monte = !monte;
        ys.push(ys[ys.length - 1] + (monte ? 1 : -1) * parmi([1, 1, 2]));
      }
      const [bas, haut] = [Math.min(...ys), Math.max(...ys)];
      // (les points restent entre −1 et 4 : la courbe ne touche pas le bord du repère)
      if (haut - bas < 3 || haut - bas > 5) continue;
      const decalage = entier(-1 - bas, 4 - haut);
      return ys.map(y => y + decalage);
    }
  }
  // La courbe « lisse » qui passe par les points (xDepart ; ys[0]), (xDepart + 1 ; ys[1])… (des morceaux de courbe
  // qui ne font jamais de bosse entre deux points : une interpolation monotone)
  function courbeLisse(ys, xDepart) {
    const n = ys.length;
    const d = ys.slice(1).map((y, i) => y - ys[i]);
    const pentes = ys.map((y, k) => {
      if (k === 0) return d[0];
      if (k === n - 1) return d[n - 2];
      if (d[k - 1] * d[k] <= 0) return 0;
      return 2 * d[k - 1] * d[k] / (d[k - 1] + d[k]);
    });
    return x => {
      const t0 = Math.min(Math.max(x - xDepart, 0), n - 1);
      const k = Math.min(Math.floor(t0), n - 2);
      const t = t0 - k;
      return (2 * t ** 3 - 3 * t ** 2 + 1) * ys[k] + (t ** 3 - 2 * t ** 2 + t) * pentes[k]
        + (-2 * t ** 3 + 3 * t ** 2) * ys[k + 1] + (t ** 3 - t ** 2) * pentes[k + 1];
    };
  }

  function questionCourbe() {
    const ys = courbeAuHasard();
    const xs = intervalle(-4, 4);
    const f = x => ys[x + 4];
    const figure = nombresLisibles(figures.repere({ ...REPERE_COURBE, traces: [{ f: courbeLisse(ys, -4) }] }));
    const intro = `La courbe représente une fonction f, pour x allant de ${ecrire(-4)} à 4.${figure}`;
    // La courbe traverse-t-elle la hauteur m entre deux points ? (on ne choisit que des hauteurs où ce n'est pas le cas)
    const traverse = m => ys.some((y, i) => i < 8 && Math.min(y, ys[i + 1]) < m && m < Math.max(y, ys[i + 1]));
    const antecedents = m => xs.filter(x => f(x) === m);
    const hauteurs = intervalle(REPERE_COURBE.ymin, REPERE_COURBE.ymax).filter(m => !traverse(m));
    const consigne = 'Lis le graphique';
    const sorte = parmi(['image', 'image', 'antecedents', 'antecedents', 'combien']);

    if (sorte === 'image') {
      const x0 = entier(-3, 3);
      const y0 = f(x0);
      // le piège : un antécédent de x0 (lire dans le mauvais sens)
      const confusion = traverse(x0) ? [] : antecedents(x0).filter(v => v !== y0);
      const q = choix({
        consigne,
        enonce: `${intro}Quelle est l’image de ${ecrire(x0)} par f ?`,
        reponse: y0,
        // lire à côté (la colonne voisine), se tromper de signe sur un axe (seulement une valeur que la courbe atteint)
        pieges: [f(x0 - 1), f(x0 + 1), ...(-y0 >= Math.min(...ys) && -y0 <= Math.max(...ys) ? [-y0] : []), ...(x0 !== 0 ? [f(-x0)] : [])],
        garder: confusion.slice(0, 1),
        explication: `On part de ${ecrire(x0)} sur l’axe des abscisses, on va jusqu’à la courbe, puis on lit l’ordonnée : `
          + `f(${ecrire(x0)}) = <b>${ecrire(y0)}</b>.`,
      });
      if (confusion.length) {
        q.explication += `<br>⚠️ f(${ecrire(confusion[0])}) = ${ecrire(x0)} : ${ecrire(confusion[0])} est un antécédent de ${ecrire(x0)}, pas son image.`;
      }
      return q;
    }

    if (sorte === 'antecedents') {
      const m = parmi(hauteurs.filter(v => antecedents(v).length >= 1));
      const A = antecedents(m);
      const coupe = `On trace la droite horizontale à la hauteur ${ecrire(m)} : elle rencontre la courbe `
        + (A.length === 1 ? `en un seul point, d’abscisse ${ecrire(A[0])}.` : `en ${ecrire(A.length)} points, d’abscisses ${enumerer(A)}.`);
      const image = m >= -4 && m <= 4 ? f(m) : null;
      const attention = image !== null && !A.includes(image)
        ? `<br>⚠️ f(${ecrire(m)}) = ${ecrire(image)} : c’est l’image de ${ecrire(m)}, pas un antécédent.` : '';
      // Les erreurs : en oublier un, lire la ligne voisine du quadrillage (m − 1 ou m + 1) ou la hauteur −m,
      // donner l'image, ou mélanger un bon antécédent et l'image
      const reponse = enumerer(A);
      const oublis = A.length > 1 ? A.map(a => enumerer(A.filter(v => v !== a))) : [];
      const autresLignes = [m - 1, m + 1, -m].filter(v => v !== m && !traverse(v) && antecedents(v).length).map(v => enumerer(antecedents(v)));
      const avecImage = image !== null && !A.includes(image) ? [enumerer([A[0], image]), ecrire(image)] : [];
      // lire une abscisse à côté (une colonne du quadrillage de trop ou de moins) ; croire, comme avec x², qu'il y a
      // toujours deux antécédents opposés
      const dansLeRepere = v => v >= -4 && v <= 4 && !A.includes(v);
      const aCote = A.flatMap((a, i) => [a - 1, a + 1].filter(dansLeRepere).map(v => enumerer(A.map((b, j) => (j === i ? v : b)))));
      const opposes = A.length === 1 && A[0] !== 0 ? [enumerer([A[0], -A[0]])] : [];
      const pieges = [...oublis, ...autresLignes, ...avecImage, ...aCote, ...opposes].filter(t => t !== reponse);
      if (A.length === 1 && (Math.random() < 0.5 || new Set(pieges).size < 2)) {
        return nombre({
          consigne,
          enonce: `${intro}Le nombre ${ecrire(m)} a un seul antécédent par f. Lequel ?`,
          reponse: A[0],
          touches: TOUCHES,
          explication: `${coupe}<br>L’antécédent de ${ecrire(m)} est <b>${ecrire(A[0])}</b>.${attention}`,
        });
      }
      const q = choix({
        consigne,
        enonce: `${intro}Quel(s) est (sont) le(s) antécédent(s) de ${ecrire(m)} par f ?`,
        reponse,
        pieges,
        // (toujours un piège à plusieurs nombres et un piège à un seul nombre, si possible)
        garder: piegesDeForme(reponse, pieges),
        explication: `${coupe}<br>${A.length === 1 ? `L’antécédent de ${ecrire(m)} est` : `Les antécédents de ${ecrire(m)} sont`} <b>${reponse}</b>.`,
      });
      if (attention && q.choix.includes(ecrire(image))) q.explication += attention;
      return q;
    }

    // Combien d'antécédents ? (de 0 à 3 : on choisit d'abord le nombre, pour que chaque bouton soit la bonne réponse aussi souvent)
    const possibles = [0, 1, 2, 3].filter(t => hauteurs.some(m => antecedents(m).length === t));
    const t = parmi(possibles);
    const m = parmi(hauteurs.filter(v => antecedents(v).length === t));
    const A = antecedents(m);
    return choix({
      consigne,
      enonce: `${intro}Combien le nombre ${ecrire(m)} a-t-il d’antécédents par f ?`,
      reponse: t,
      choix: [0, 1, 2, 3],
      explication: `On trace la droite horizontale à la hauteur ${ecrire(m)} : `
        + (t === 0 ? 'elle ne rencontre pas la courbe : <b>aucun</b> antécédent (0).'
          : `elle rencontre la courbe en <b>${t === 1 ? 'un seul point' : `${ecrire(t)} points`}</b>, d’abscisse${t > 1 ? 's' : ''} ${enumerer(A)}.`)
        + '<br>Un nombre a une seule image, mais il peut avoir 0, 1 ou plusieurs antécédents.',
    });
  }

  // Les programmes de calcul : chaque instruction a son texte et son calcul (v : le nombre en cours, x : le nombre choisi)
  const ajouter = p => ({ texte: premier => `${premier ? 'Lui ajouter' : 'Ajouter'} ${ecrire(p)}.`, f: v => v + p,
    calcul: v => `${ecrire(v)} + ${ecrire(p)} = ${ecrire(v + p)}` });
  const soustraire = p => ({ texte: premier => `${premier ? 'Lui soustraire' : 'Soustraire'} ${ecrire(p)}.`, f: v => v - p,
    calcul: v => `${ecrire(v)} − ${ecrire(p)} = ${ecrire(v - p)}` });
  const multiplier = k => ({ texte: premier => `${premier ? 'Le multiplier' : 'Multiplier le résultat'} par ${ecrire(k)}.`, f: v => v * k,
    calcul: v => `${ecrire(v)} × ${ecrire(k)} = ${ecrire(v * k)}` });
  const auCarre = () => ({ texte: () => 'Élever le résultat au carré.', f: v => v * v, calcul: v => `${parentheses(v)}² = ${ecrire(v * v)}` });
  const parLeDepart = () => ({ texte: () => 'Multiplier le résultat par le nombre choisi au départ.', f: (v, x) => v * x,
    calcul: (v, x) => `${ecrire(v)} × ${parentheses(x)} = ${ecrire(v * x)}` });

  // Les programmes : les instructions, l'expression de f(x), et des expressions fausses [texte, fonction] (les erreurs classiques)
  const PROGRAMMES = [
    () => {
      const [p, k, q] = [entier(2, 6), entier(2, 5), entier(1, 9)];
      return { ops: [ajouter(p), multiplier(k), soustraire(q)], expression: `${k}(x + ${p}) − ${q}`, f: x => k * (x + p) - q,
        avec: x => `${k} × (${ecrire(x)} + ${p}) − ${q}`,
        faux: [[`${k}x + ${p} − ${q}`, x => k * x + p - q], [`x + ${p} × ${k} − ${q}`, x => x + p * k - q],
          [`${k}(x + ${p} − ${q})`, x => k * (x + p - q)], [`${k}(x − ${q}) + ${p}`, x => k * (x - q) + p]] };
    },
    () => {
      const k = entier(2, 5);
      const p = entier(1, 7);
      // (m ≠ k : sinon le piège k(mx + p) serait égal à la réponse)
      const m = entierSauf(2, 4, [k]);
      return { ops: [multiplier(k), ajouter(p), multiplier(m)], expression: `${m}(${k}x + ${p})`, f: x => m * (k * x + p),
        avec: x => `${m} × (${k} × ${ecrire(x)} + ${p})`,
        faux: [[`${k}x + ${p} × ${m}`, x => k * x + p * m], [`${m} × ${k}x + ${p}`, x => m * k * x + p], [`${k}(${m}x + ${p})`, x => k * (m * x + p)]] };
    },
    () => {
      const p = entier(2, 6);
      return { ops: [ajouter(p), auCarre()], expression: `(x + ${p})²`, f: x => (x + p) ** 2, avec: x => `(${ecrire(x)} + ${p})²`,
        faux: [[`x² + ${p}`, x => x * x + p], [`x + ${p}²`, x => x + p * p], [`2(x + ${p})`, x => 2 * (x + p)], [`x² + ${p * p}`, x => x * x + p * p]] };
    },
    () => {
      const q = entier(2, 6);
      return { ops: [soustraire(q), auCarre()], expression: `(x − ${q})²`, f: x => (x - q) ** 2, avec: x => `(${ecrire(x)} − ${q})²`,
        faux: [[`x² − ${q}`, x => x * x - q], [`x − ${q}²`, x => x - q * q], [`2(x − ${q})`, x => 2 * (x - q)], [`x² − ${q * q}`, x => x * x - q * q]] };
    },
    () => {
      const p = entier(2, 7);
      return { ops: [ajouter(p), parLeDepart()], expression: `x(x + ${p})`, f: x => x * (x + p), avec: x => `${ecrire(x)} × (${ecrire(x)} + ${p})`,
        faux: [[`x × x + ${p}`, x => x * x + p], [`2(x + ${p})`, x => 2 * (x + p)], [`${p}(x + ${p})`, x => p * (x + p)]] };
    },
  ];

  function questionProgramme() {
    const P = parmi(PROGRAMMES)();
    const lignes = ['Choisir un nombre.', ...P.ops.map((op, i) => op.texte(i === 0))];
    const programme = `Voici un programme de calcul :<br>${lignes.map(l => `• ${l}`).join('<br>')}<br>On note f(x) le résultat quand on choisit le nombre x.`;
    if (Math.random() < 0.5) {
      const x = parmi([-6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6]);
      let v = x;
      const etapes = P.ops.map(op => {
        const texte = op.calcul(v, x);
        v = op.f(v, x);
        return texte;
      });
      return nombre({
        consigne: 'Utilise le programme',
        enonce: `${programme} Calcule f(${ecrire(x)}).`,
        reponse: P.f(x),
        touches: TOUCHES,
        explication: `On part de ${ecrire(x)} : ${etapes.join(`${ESPACE}; `)}.<br>Donc f(${ecrire(x)}) = <b>${ecrire(P.f(x))}</b>.`,
      });
    }
    // Les expressions fausses qui ne sont pas, par hasard, égales à f(x) (on les compare pour plusieurs valeurs de x)
    const tests = [-3, -1, 0.5, 2, 7];
    const faux = P.faux.filter(([, g]) => tests.some(x => !egaux(g(x), P.f(x)))).map(([texte]) => `f(x) = ${texte}`);
    return choix({
      consigne: 'Traduis le programme',
      enonce: `${programme} Quelle expression donne f(x) ?`,
      reponse: `f(x) = ${P.expression}`,
      pieges: faux,
      explication: `On suit les instructions dans l’ordre, avec des parenthèses pour garder le résultat en entier : <b>f(x) = ${P.expression}</b>.`
        + `<br>Vérifie avec x = 3 : ${P.avec(3)} = ${ecrire(P.f(3))}, comme le programme.`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_FONCTIONS = [
    ['Par une fonction, un nombre a une seule image.', 'Par une fonction, un nombre peut avoir deux images.',
      'Une fonction associe à chaque nombre <b>une seule image</b>. Mais un nombre peut avoir plusieurs antécédents.'],
    ['Par une fonction, un nombre peut avoir plusieurs antécédents.', 'Par une fonction, un nombre a toujours un seul antécédent.',
      `Avec f(x) = x², 9 a <b>deux</b> antécédents (${MOINS}3 et 3), et ${MOINS}1 n’en a <b>aucun</b>.`],
    ['Si f(4) = 7, alors 7 est l’image de 4 par f.', 'Si f(4) = 7, alors 4 est l’image de 7 par f.',
      'f(4) = 7 : 7 est l’<b>image</b> de 4, et 4 est un <b>antécédent</b> de 7.'],
  ];

  function vraiFauxFonctions() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['regle', 'image', 'antecedent', 'symetrie']);
    if (forme === 'regle') {
      const [juste, faux, pourquoi] = parmi(REGLES_FONCTIONS);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    if (forme === 'symetrie') {
      // −k et k ont la même image avec x² + b, jamais avec une fonction affine ou x² + cx + d
      const F = formule(vrai ? parmi(['carre', 'moinsCarre']) : parmi(['affine', 'trinome']));
      const k = entier(2, 4);
      return vraiFaux({
        enonce: `Avec la fonction f(x) = ${F.ecrite}, les nombres ${ecrire(-k)} et ${ecrire(k)} ont la même image.`,
        vrai,
        explication: `f(${ecrire(-k)}) = ${ecrire(F.f(-k))} et f(${ecrire(k)}) = ${ecrire(F.f(k))} : `
          + (vrai ? `c’est la <b>même image</b>, car (${ecrire(-k)})² = ${ecrire(k)}² = ${ecrire(k * k)}.` : 'ce ne sont <b>pas</b> les mêmes images.'),
      });
    }
    const F = formule();
    let x;
    let r;
    // (x et son image sont différents, et x n'est pas l'image de son image)
    do { x = parmi(F.xs); r = F.f(x); } while (r === x || F.f(r) === x);
    if (forme === 'image') {
      const P = F.principal(x);
      return vraiFaux({
        enonce: `Soit f(x) = ${F.ecrite}. L’image de ${ecrire(x)} par f est ${ecrire(vrai ? r : P.valeur)}.`,
        vrai,
        explication: `f(${ecrire(x)}) = ${F.calcul(x)}.${vrai ? '' : `<br>⚠️ ${P.texte}`}`,
      });
    }
    return vraiFaux({
      enonce: `Soit f(x) = ${F.ecrite}. ${vrai ? `${ecrire(x)} est un antécédent de ${ecrire(r)}` : `${ecrire(r)} est un antécédent de ${ecrire(x)}`} par f.`,
      vrai,
      explication: `f(${ecrire(x)}) = ${F.calcul(x)} : ${ecrire(x)} est un <b>antécédent</b> de ${ecrire(r)}, et ${ecrire(r)} est son <b>image</b>.`,
    });
  }

  ajouterEtape({
    id: '3e-donnees-fonctions',
    banque: ['image', 'image', 'image', 'imageChoix', 'imageChoix', 'imageChoix', 'antecedent', 'antecedentsCarre',
      'tableau', 'tableau', 'courbe', 'courbe', 'courbe', 'programme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'image') return questionImage(false);
      if (sorte === 'imageChoix') return questionImage(true);
      if (sorte === 'antecedent') return questionAntecedent(Math.random() < 0.5);
      if (sorte === 'antecedentsCarre') return questionAntecedentsCarre();
      if (sorte === 'tableau') return questionTableauValeurs();
      if (sorte === 'courbe') return questionCourbe();
      if (sorte === 'programme') return questionProgramme();
      return vraiFauxFonctions();
    },
    titreLecon: 'Les fonctions',
    lecon: `
      <h4>Image et antécédent</h4>
      <p>Une <b>fonction</b> f associe à chaque nombre x <b>un seul</b> nombre, noté <b>f(x)</b>. On écrit aussi f : x ↦ f(x).</p>
      <p>👉 <i>f(x) = x² − 3 : f(4) = 4² − 3 = 13.</i> 13 est l’<b>image</b> de 4 par f&nbsp;; 4 est <b>un antécédent</b> de 13.
        Un nombre a une seule image, mais il peut avoir <b>0, 1 ou plusieurs antécédents</b> : ici, 13 a deux antécédents, ${MOINS}4 et 4.</p>
      <h4>Avec une formule</h4>
      <p>On remplace x par le nombre, en respectant les priorités : <i>f(${MOINS}3) = (${MOINS}3)² − 3 = 9 − 3 = 6.</i>
        Pour trouver un antécédent, on résout une équation : <i>g(x) = 2x + 1&nbsp;; 2x + 1 = 7 donne x = 3.</i></p>
      <h4>Avec un tableau de valeurs ou une courbe</h4>
      ${tableau([['x', -2, -1, 0, 1, 2], ['f(x)', 1, -2, -3, -2, 1]])}
      <p><i>Dans ce tableau, f(${MOINS}1) = ${MOINS}2 : l’image de ${MOINS}1 est ${MOINS}2. On cherche 1 dans la ligne f(x) :
        les antécédents de 1 sont ${MOINS}2 et 2.</i></p>
      <p>La <b>courbe</b> de f est formée des points de coordonnées (x&nbsp;; f(x)). L’image de x se lit sur l’axe des <b>ordonnées</b>
        (on part de x, on va jusqu’à la courbe). Les antécédents de k se lisent sur l’axe des <b>abscisses</b> : on trace la droite
        horizontale à la hauteur k, et on regarde où elle rencontre la courbe.</p>
      <h4>Un programme de calcul</h4>
      <p><i>Choisir x, lui ajouter 3, multiplier le résultat par 2 : f(x) = 2(x + 3).</i> Les parenthèses sont indispensables !</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dans f(4) = 13, le nombre entre les parenthèses (4) est <b>un</b> antécédent de 13 ;
        l’image (13) est après le signe =.</div>
      <p>⚠️ (${MOINS}3)² = 9 : un carré n’est jamais négatif. Et 10 − (${MOINS}3)² = 10 − 9 = 1.</p>
    `,
  });

  // ======================================================================
  // 2. Les fonctions linéaires
  // ======================================================================
  const REPERE_DROITES = { xmin: -4, xmax: 4, ymin: -4, ymax: 4, unite: 30 };
  // Le point de la figure (en pixels) qui correspond au point (x ; y) du repère (comme dans figures.repere)
  const enPixels = (R, x, y) => [26 + (x - R.xmin) * R.unite, 26 + (R.ymax - y) * R.unite];

  // Des droites dans un repère, avec leur nom : [{ a, b, nom }]. Chaque droite s'arrête un peu avant le bord du quadrillage,
  // et son nom est écrit juste après un de ses bouts, dans son prolongement (on choisit les bouts pour que les noms soient loin
  // les uns des autres). Renvoie null si c'est impossible (on tire alors d'autres droites).
  function figureDroites(droites, R = REPERE_DROITES) {
    const L = R.xmax - 0.7;
    // les deux bouts de chaque droite dans le carré [−L ; L] × [−L ; L]
    const bouts = droites.map(d => {
      const candidats = [[-L, d.a * -L + d.b], [L, d.a * L + d.b], [(-L - d.b) / d.a, -L], [(L - d.b) / d.a, L]]
        .filter(([x, y]) => Math.abs(x) <= L + 1e-9 && Math.abs(y) <= L + 1e-9)
        .sort((p, q) => p[0] - q[0]);
      return [candidats[0], candidats[candidats.length - 1]];
    });
    // la place du nom : 20 pixels après le bout choisi (i = 0 ou 1)
    const place = ([P, Q], i) => {
      const [A, B] = (i ? [P, Q] : [Q, P]).map(([x, y]) => enPixels(R, x, y));
      const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
      return [B[0] + (B[0] - A[0]) / l * 20, B[1] + (B[1] - A[1]) / l * 20];
    };
    // la distance (en pixels) d'un point à un segment de droite du repère
    const distance = (M, [P, Q]) => {
      const [A, B] = [P, Q].map(([x, y]) => enPixels(R, x, y));
      const [ux, uy] = [B[0] - A[0], B[1] - A[1]];
      const t = Math.max(0, Math.min(1, ((M[0] - A[0]) * ux + (M[1] - A[1]) * uy) / (ux * ux + uy * uy)));
      return Math.hypot(M[0] - A[0] - t * ux, M[1] - A[1] - t * uy);
    };
    for (const combinaison of RM.melanger(intervalle(0, 7))) {
      const places = droites.map((d, k) => place(bouts[k], (combinaison >> k) & 1));
      // (les noms loin les uns des autres, et chaque nom loin des autres droites : on ne peut pas se tromper de droite)
      const loin = places.every((p, i) => places.every((q, j) => j <= i || Math.abs(p[0] - q[0]) >= 46 || Math.abs(p[1] - q[1]) >= 26)
        && bouts.every((segment, j) => j === i || distance(p, segment) >= 36)
        // (et pas sur les nombres des axes)
        && Math.abs(p[1] - enPixels(R, 0, 0)[1]) >= 24 && Math.abs(p[0] - enPixels(R, 0, 0)[0]) >= 46);
      if (!loin) continue;
      const svg = nombresLisibles(figures.repere({ ...R, traces: bouts.map(segment => ({ segment })) }));
      const noms = droites.map((d, i) => figures.texte(places[i], d.nom, { classe: 'fig-texte fig-texte-accent' }));
      return svg.replace('</svg>', `${noms.join('')}</svg>`);
    }
    return null;
  }
  const NOMS_DROITES = ['(d₁)', '(d₂)', '(d₃)'];

  function questionImageLineaire() {
    const consigne = 'Calcule l’image';
    if (Math.random() < 0.3) {
      // Un coefficient en fraction : on divise, puis on multiplie
      const [p, q] = parmi([[2, 3], [3, 4], [1, 3], [3, 5], [2, 5], [5, 4], [4, 3]]);
      const signe = parmi([1, 1, -1]);
      const x = q * entierSauf(-4, 4, [0, 1]);
      const r = signe * p * x / q;
      const coef = `${signe < 0 ? MOINS : ''}${frac(p, q)}`;
      const negatifs = (signe < 0 ? 1 : 0) + (x < 0 ? 1 : 0);
      return nombre({
        consigne,
        enonce: `Soit f la fonction linéaire définie par f(x) = ${coef}x. Calcule f(${ecrire(x)}).`,
        reponse: r,
        touches: TOUCHES,
        explication: `f(${ecrire(x)}) = ${coef} × ${parentheses(x)} : on divise par ${ecrire(q)}${p === 1 ? '' : `, puis on multiplie par ${ecrire(p)}`}.<br>`
          + (p === 1 ? `${ecrire(Math.abs(x))} ÷ ${ecrire(q)} = ${ecrire(Math.abs(r))}`
            : `${ecrire(Math.abs(x))} ÷ ${ecrire(q)} = ${ecrire(Math.abs(x) / q)}, puis ${ecrire(Math.abs(x) / q)} × ${ecrire(p)} = ${ecrire(Math.abs(r))}`)
          + `${negatifs === 1 ? '&nbsp;; un seul facteur est négatif, donc le résultat est négatif'
            : negatifs === 2 ? '&nbsp;; les deux facteurs sont négatifs, donc le résultat est positif' : ''} : f(${ecrire(x)}) = <b>${ecrire(r)}</b>.`,
      });
    }
    let a;
    let x;
    do {
      a = parmi([2, 3, 4, 5, -2, -3, -4, 0.5, -0.5, 1.5, 2.5, -1.5, 1.2, 0.8]);
      x = Math.random() < 0.8 ? entierSauf(-12, 12, [-1, 0, 1]) : parmi([1.5, 2.5, 3.5, -0.5, -1.5, -2.5]);
    } while (!auDixieme(a * x) || Math.abs(a * x) > 60 || (!Number.isInteger(a) && !Number.isInteger(x)));
    const r = net(a * x);
    return nombre({
      consigne,
      enonce: `Soit f la fonction linéaire définie par f(x) = ${devant(a)}. Calcule f(${ecrire(x)}).`,
      reponse: r,
      touches: TOUCHES,
      explication: `On multiplie par le coefficient : f(${ecrire(x)}) = ${ecrire(a)} × ${parentheses(x)} = <b>${ecrire(r)}</b>.`
        + (Math.abs(a) === 0.5 ? '<br>Multiplier par 0,5, c’est prendre la moitié.' : ''),
    });
  }

  // Le coefficient, à partir d'une image : a = f(x) ÷ x
  function questionCoefficientLineaire(avecBoutons) {
    let a;
    let x;
    let y;
    do {
      a = parmi([2, 3, 4, 5, -2, -3, -4, 0.5, -0.5, 1.5, -1.5, 2.5, -2.5, 0.25, 0.75, 1.2]);
      x = entierSauf(-8, 8, [-1, 0, 1]);
      y = net(a * x);
    } while (!auDixieme(y));
    const consigne = 'Trouve le coefficient';
    const enonce = `f est une fonction linéaire telle que f(${ecrire(x)}) = ${ecrire(y)}. Quel est son coefficient ?`;
    const explication = `f(x) = ax, donc a × ${parentheses(x)} = ${ecrire(y)}.<br>a = ${ecrire(y)} ÷ ${parentheses(x)} = <b>${ecrire(a)}</b>.`;
    if (!avecBoutons) return nombre({ consigne, enonce, reponse: a, touches: TOUCHES, explication });
    // Les erreurs : diviser dans le mauvais sens, le signe, prendre l'image pour le coefficient, l'écart (comme si on ajoutait)
    const inverse = net(x / y);
    const inverseOk = auCentieme(inverse) && inverse !== a;
    return choix({
      consigne,
      enonce,
      reponse: a,
      pieges: [-a, y, net(y - x)],
      garder: [inverseOk ? inverse : -a],
      explication: explication + (inverseOk
        ? `<br>⚠️ On divise l’image par le nombre de départ, pas l’inverse : ${ecrire(x)} ÷ ${parentheses(y)} = ${ecrire(inverse)} est faux.`
        : `<br>⚠️ Attention au signe : ${ecrire(y)} ÷ ${parentheses(x)} est ${a < 0 ? 'négatif' : 'positif'}.`),
    });
  }

  // La linéarité : f(k × x) = k × f(x), et f(x + x′) = f(x) + f(x′)
  function questionProprietesLineaire(avecBoutons) {
    const consigne = 'Utilise la linéarité';
    if (avecBoutons) {
      let a;
      let x1;
      let x2;
      let m;
      do {
        a = parmi([1.5, 2.5, 3, 4, 0.5, 1.2, -2, -3, 2, 6]);
        const base = entier(2, 5);
        m = entier(2, 4);
        [x1, x2] = Math.random() < 0.65 ? [base, base * m] : [base * m, base];
      } while (!auDixieme(a * x1) || !auDixieme(a * x2) || Math.abs(a * x2) > 80);
      const [y1, y2] = [net(a * x1), net(a * x2)];
      const additif = net(y1 + x2 - x1);
      return choix({
        consigne,
        enonce: `f est une fonction linéaire et f(${ecrire(x1)}) = ${ecrire(y1)}. Combien vaut f(${ecrire(x2)}) ?`,
        reponse: y2,
        // le rapport à l'envers (diviser au lieu de multiplier, ou l'inverse), multiplier par le nouveau nombre,
        // utiliser le coefficient à l'envers, oublier le signe
        pieges: [x2 > x1 ? net(y1 / m) : net(y1 * m), net(y1 * x2), net(x2 * x1 / y1), ...(a < 0 ? [-y2] : [])]
          .filter(v => auDixieme(v) && Math.abs(v) <= 400),
        garder: [additif],
        ordre: 'melange',
        explication: (x2 > x1
          ? `${ecrire(x2)} = ${ecrire(m)} × ${ecrire(x1)}, donc f(${ecrire(x2)}) = ${ecrire(m)} × f(${ecrire(x1)}) = ${ecrire(m)} × ${parentheses(y1)} = <b>${ecrire(y2)}</b>.`
          : `${ecrire(x2)} = ${ecrire(x1)} ÷ ${ecrire(m)}, donc f(${ecrire(x2)}) = f(${ecrire(x1)}) ÷ ${ecrire(m)} = ${ecrire(y1)} ÷ ${ecrire(m)} = <b>${ecrire(y2)}</b>.`)
          + `<br>⚠️ Pas ${ecrire(y1)} ${x2 > x1 ? '+' : '−'} ${ecrire(Math.abs(x2 - x1))} = ${ecrire(additif)} : une fonction linéaire multiplie, elle n’ajoute pas.`,
      });
    }
    let a;
    let x1;
    let x2;
    do {
      a = parmi([1.5, 2.5, 0.8, 1.2, 3.5, -1.5, 4.5, -2.5]);
      [x1, x2] = differents(2, 2, 9);
    } while (x1 % x2 === 0 || x2 % x1 === 0 || x1 + x2 > 12);
    const [y1, y2] = [net(a * x1), net(a * x2)];
    const s = net(y1 + y2);
    return nombre({
      consigne,
      enonce: `f est une fonction linéaire, f(${ecrire(x1)}) = ${ecrire(y1)} et f(${ecrire(x2)}) = ${ecrire(y2)}. Calcule f(${ecrire(x1 + x2)}).`,
      reponse: s,
      touches: TOUCHES,
      explication: `${ecrire(x1 + x2)} = ${ecrire(x1)} + ${ecrire(x2)}, donc f(${ecrire(x1 + x2)}) = f(${ecrire(x1)}) + f(${ecrire(x2)}) = `
        + `${ecrire(y1)} + ${parentheses(y2)} = <b>${ecrire(s)}</b>.<br>(Ou avec le coefficient : a = ${ecrire(y1)} ÷ ${ecrire(x1)} = ${ecrire(a)}, `
        + `et ${ecrire(a)} × ${ecrire(x1 + x2)} = ${ecrire(s)}.)`,
    });
  }

  function questionGraphiqueLineaire() {
    const R = REPERE_DROITES;
    const consigne = 'Lis le graphique';
    if (Math.random() < 0.5) {
      // Lire le coefficient avec un point A de la droite
      const a = parmi([0.5, 1.5, 2, 3, 0.25, 0.75, -0.5, -1.5, -2, -3, -0.75]);
      // (un point A loin de l'axe des abscisses, si possible : son nom ne tombe pas sur les nombres de l'axe)
      const possibles = intervalle(1, 4).map(x => [x, net(a * x)]).filter(([, y]) => Number.isInteger(y) && Math.abs(y) <= 4);
      const loinDeLAxe = possibles.filter(([, y]) => Math.abs(y) >= 2);
      const [xA, yA] = parmi(loinDeLAxe.length ? loinDeLAxe : possibles);
      const figure = nombresLisibles(figures.repere({ ...R, traces: [{ f: x => a * x }], points: [{ x: xA, y: yA, nom: 'A', dx: 14, dy: a > 0 ? 14 : -14 }] }));
      // l'inverse xA ÷ yA : un nombre décimal, ou une fraction (1/3, −2/3…) ; et son opposé
      const [n, d] = simplifier(xA, yA);
      const decimalOk = auCentieme(xA / yA);
      const inverse = decimalOk ? net(xA / yA) : fracTexte(n, d);
      const oppose = decimalOk ? net(-xA / yA) : fracTexte(-n, d);
      const q = choix({
        consigne,
        enonce: `La droite représente une fonction linéaire f.${figure}Quel est le coefficient de f ?`,
        reponse: a,
        // le signe, l'inverse avec l'autre signe, l'ordonnée ou l'abscisse de A prise pour le coefficient
        pieges: [-a, oppose, ...(xA !== 1 ? [yA, xA] : [])],
        garder: Math.abs(a) !== 1 ? [inverse] : [],
        explication: `La droite passe par l’origine et par ${point('A', xA, yA)} : f(${ecrire(xA)}) = ${ecrire(yA)}.<br>`
          + `a = ${ecrire(yA)} ÷ ${ecrire(xA)} = <b>${ecrire(a)}</b>.`,
      });
      if (Math.abs(a) !== 1) q.explication += `<br>⚠️ On divise l’ordonnée par l’abscisse, pas l’inverse (${ecrire(xA)} ÷ ${parentheses(yA)}).`;
      return q;
    }
    // Trois droites : laquelle représente f(x) = ax ? ou : laquelle représente une fonction linéaire ?
    const PENTES = [0.5, 1.5, 2, 3, -0.5, -1.5, -2, -3, 1, -1];
    for (;;) {
      const a = parmi(PENTES);
      const quelle = Math.random() < 0.5;
      const noms = RM.melanger(NOMS_DROITES);
      let droites;
      if (quelle) {
        const inverse = net(1 / a);
        const autre = Number.isInteger(inverse * 2) && inverse !== a && Math.random() < 0.5 ? inverse : -a;
        droites = [{ a, b: 0 }, { a: autre, b: 0 }, { a, b: entierSauf(-3, 3, [0]) }];
      } else {
        droites = [{ a, b: 0 }, { a: parmi(PENTES), b: entierSauf(-3, 3, [0]) }, { a: parmi(PENTES), b: entierSauf(-3, 3, [0]) }];
      }
      droites.forEach((d, i) => { d.nom = noms[i]; });
      // (des droites bien différentes)
      if (new Set(droites.map(d => `${d.a}|${d.b}`)).size < 3) continue;
      const figure = figureDroites(droites);
      if (!figure) continue;
      const bonne = droites[0].nom;
      if (quelle) {
        const [xP, yP] = [1, 2, 3, 4].map(x => [x, net(a * x)]).find(([, y]) => Number.isInteger(y));
        return choix({
          consigne,
          enonce: `${figure}Laquelle de ces droites représente la fonction linéaire f(x) = ${devant(a)} ?`,
          reponse: bonne,
          choix: NOMS_DROITES,
          explication: `La droite passe par l’origine, et par le point (${ecrire(xP)}${ESPACE}; ${ecrire(yP)}) car f(${ecrire(xP)}) = ${ecrire(yP)} : c’est <b>${bonne}</b>.`
            + `<br>${droites[2].nom} ne passe pas par l’origine, et ${droites[1].nom} ne passe pas par (${ecrire(xP)}${ESPACE}; ${ecrire(yP)}).`,
        });
      }
      return choix({
        consigne,
        enonce: `${figure}Une seule de ces droites représente une fonction linéaire. Laquelle ?`,
        reponse: bonne,
        choix: NOMS_DROITES,
        explication: `Une fonction linéaire est représentée par une droite qui passe par l’<b>origine</b> du repère : c’est <b>${bonne}</b>.`
          + '<br>Les deux autres coupent l’axe des ordonnées ailleurs qu’en 0.',
      });
    }
  }

  // Reconnaître une fonction linéaire : [l'écriture, pourquoi]
  function questionReconnaitreLineaire() {
    const k = entier(2, 5);
    const b = entier(1, 6);
    const d = parmi([0.5, 1.5, 0.2, 2.5]);
    const LINEAIRES = [[`${k}x`, `c’est ax avec a = ${k}`], [`${MOINS}${k}x`, `c’est ax avec a = ${MOINS}${k}`],
      [`x ÷ ${k}`, `x ÷ ${k} = ${frac(1, k)}x`], [`${ecrire(d)}x`, `c’est ax avec a = ${ecrire(d)}`], [`${MOINS}x`, `${MOINS}x = ${MOINS}1 × x`]];
    const NON = [[`${k}x + ${b}`, `on ajoute ${b}`], [`${k}x²`, 'il y a un x²'], [`x + ${k}`, `on ajoute ${k}`], [`${k} − x`, 'il y a un nombre ajouté'],
      [`x² + ${k}x`, 'il y a un x²'], [`${k}(x + ${b})`, `${k}(x + ${b}) = ${k}x + ${k * b}`]];
    const bouton = ([e]) => `f(x) = ${e}`;
    if (Math.random() < 0.6) {
      const [bonne, ...autres] = [parmi(LINEAIRES), ...RM.melanger(NON).slice(0, 3)];
      return choix({
        consigne: 'Reconnais la fonction linéaire',
        enonce: 'Laquelle de ces fonctions est linéaire ?',
        reponse: bouton(bonne),
        pieges: autres.map(bouton),
        explication: `Une fonction linéaire s’écrit f(x) = ax. <b>${bouton(bonne)}</b> : ${bonne[1]}.<br>`
          + 'Les autres ne s’écrivent pas ax : un nombre est ajouté, ou il y a un x².',
      });
    }
    const [bonne, ...autres] = [parmi(NON), ...RM.melanger(LINEAIRES).slice(0, 3)];
    return choix({
      consigne: 'Reconnais la fonction linéaire',
      enonce: 'Laquelle de ces fonctions n’est pas linéaire ?',
      reponse: bouton(bonne),
      pieges: autres.map(bouton),
      explication: `<b>${bouton(bonne)}</b> ne s’écrit pas ax : ${bonne[1]}.<br>Les trois autres sont linéaires (${bouton(autres[0])} : ${autres[0][1]}).`,
    });
  }

  // Pourcentages et fonctions linéaires : + 20 %, c'est f(x) = 1,2x
  function questionPourcentageLineaire() {
    const hausse = Math.random() < 0.5;
    const t = parmi(hausse ? [10, 20, 30, 5, 15, 25, 40, 3] : [10, 20, 30, 5, 15, 25, 40, 12]);
    const c = net(hausse ? 1 + t / 100 : 1 - t / 100);
    const regle = `${hausse ? 'Augmenter' : 'Baisser'} de ${pc(t)}, c’est multiplier par 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} = ${ecrire(c)}`;
    const sorte = parmi(['fonction', 'fonction', 'sens', 'calcul']);
    if (sorte === 'fonction') {
      // Les erreurs : le pourcentage seul, l'autre sens, une virgule mal placée (5 % → 1,5 ; 20 % → 1,02)
      const candidats = hausse ? [1 - t / 100, t < 10 ? 1 + t / 10 : 1 + t / 1000] : [1 + t / 100, t < 10 ? 1 - t / 10 : 1 - t / 1000];
      return choix({
        consigne: 'Choisis la fonction',
        enonce: `${hausse ? 'Augmenter' : 'Baisser'} un prix de ${pc(t)}, c’est lui appliquer la fonction linéaire f(x) = ___.`,
        reponse: `${ecrire(c)}x`,
        pieges: candidats.map(v => `${ecrire(net(v))}x`),
        garder: [`${ecrire(t / 100)}x`],
        explication: `${regle} : <b>f(x) = ${ecrire(c)}x</b>.<br>⚠️ f(x) = ${ecrire(t / 100)}x donne seulement `
          + `${hausse ? 'l’augmentation' : 'la baisse'} (${pc(t)} du prix), pas le nouveau prix.`,
      });
    }
    if (sorte === 'sens') {
      const evolution = (h, x) => `${h ? 'hausse' : 'baisse'} de ${pc(x)}`;
      // Les erreurs : l'autre sens, lire le coefficient comme un pourcentage (× 0,85 → 85 % ; × 1,2 → 120 % ou 1,2 %)
      return choix({
        consigne: 'Interprète la fonction',
        enonce: `Un prix est transformé par la fonction f(x) = ${ecrire(c)}x. C’est une…`,
        reponse: evolution(hausse, t),
        pieges: hausse ? [evolution(false, t), evolution(true, 100 + t), evolution(true, c)] : [evolution(true, t), evolution(false, 100 - t), evolution(false, c)],
        explication: `${ecrire(c)} = 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} : c’est une <b>${evolution(hausse, t)}</b>.<br>`
          + (hausse ? 'Un coefficient plus grand que 1 fait augmenter.' : 'Un coefficient plus petit que 1 fait diminuer.'),
      });
    }
    const prix = parmi([20, 30, 40, 50, 60, 80, 120, 150].filter(p => auCentieme(p * c)));
    return nombre({
      consigne: 'Calcule le nouveau prix',
      enonce: `${hausse ? 'Les prix augmentent' : 'Pendant les soldes, les prix baissent'} de ${pc(t)}. La fonction f(x) = ${ecrire(c)}x donne le nouveau prix. `
        + `Un article coûtait ${euros(prix)}. Combien coûte-t-il maintenant ?`,
      reponse: net(prix * c),
      prix: true,
      touches: TOUCHES,
      explication: `${regle}.<br>f(${ecrire(prix)}) = ${ecrire(c)} × ${ecrire(prix)} = <b>${euros(net(prix * c))}</b>.`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_LINEAIRES = [
    ['La droite qui représente une fonction linéaire passe par l’origine du repère.',
      'La droite qui représente une fonction linéaire passe par le point (0&nbsp;; 1).',
      'f(0) = a × 0 = 0 : la droite passe toujours par l’<b>origine</b> (0&nbsp;; 0).'],
    ['Si f est une fonction linéaire, alors f(0) = 0.', 'Si f est une fonction linéaire, alors f(1) = 0.',
      'f(0) = a × 0 = <b>0</b>. Et f(1) = a × 1 = a : c’est le coefficient.'],
    ['Une fonction linéaire traduit une situation de proportionnalité.', 'Une fonction linéaire ajoute toujours le même nombre.',
      'f(x) = ax : on <b>multiplie</b> toujours par a, le coefficient de proportionnalité.'],
  ];

  function vraiFauxLineaires() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['regle', 'regle', 'formule', 'calcul']);
    if (forme === 'regle') {
      const [juste, faux, pourquoi] = parmi(REGLES_LINEAIRES);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    if (forme === 'formule') {
      const k = entier(2, 6);
      const b = entier(1, 5);
      const [e, pourquoi] = vrai
        ? parmi([[`${k}x`, `c’est ax avec a = ${k}`], [`${MOINS}${k}x`, `c’est ax avec a = ${MOINS}${k}`], [`x ÷ ${k}`, `x ÷ ${k} = ${frac(1, k)}x`]])
        : parmi([[`${k}x + ${b}`, `on ajoute ${b}`], [`${k}x²`, 'il y a un x²'], [`x + ${k}`, `on ajoute ${k}`], [`${k}(x + ${b})`, `${k}(x + ${b}) = ${k}x + ${k * b}`]]);
      return vraiFaux({
        enonce: `La fonction f(x) = ${e} est linéaire.`,
        vrai,
        explication: `Une fonction linéaire s’écrit f(x) = ax. f(x) = ${e} : ${pourquoi}, ${vrai ? 'elle est donc <b>linéaire</b>' : 'elle n’est donc <b>pas</b> linéaire'}.`,
      });
    }
    const a = parmi([2, 3, 4, 1.5, 2.5]);
    const x1 = entier(2, 4);
    const x2 = x1 * entier(2, 3);
    const [y1, y2] = [net(a * x1), net(a * x2)];
    return vraiFaux({
      enonce: `Si f est linéaire et f(${ecrire(x1)}) = ${ecrire(y1)}, alors f(${ecrire(x2)}) = ${ecrire(vrai ? y2 : net(y1 + x2 - x1))}.`,
      vrai,
      explication: `${ecrire(x2)} = ${ecrire(x2 / x1)} × ${ecrire(x1)}, donc f(${ecrire(x2)}) = ${ecrire(x2 / x1)} × ${ecrire(y1)} = <b>${ecrire(y2)}</b>.`
        + (vrai ? '' : `<br>⚠️ On n’ajoute pas ${ecrire(x2 - x1)} : on multiplie.`),
    });
  }

  ajouterEtape({
    id: '3e-donnees-fonctions-lineaires',
    banque: ['image', 'image', 'image', 'coefficient', 'coefficient', 'coefficientNombre', 'proprietes', 'proprietesNombre',
      'graphique', 'graphique', 'reconnaitre', 'reconnaitre', 'pourcentage', 'pourcentage', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'image') return questionImageLineaire();
      if (sorte === 'coefficient') return questionCoefficientLineaire(true);
      if (sorte === 'coefficientNombre') return questionCoefficientLineaire(false);
      if (sorte === 'proprietes') return questionProprietesLineaire(true);
      if (sorte === 'proprietesNombre') return questionProprietesLineaire(false);
      if (sorte === 'graphique') return questionGraphiqueLineaire();
      if (sorte === 'reconnaitre') return questionReconnaitreLineaire();
      if (sorte === 'pourcentage') return questionPourcentageLineaire();
      return vraiFauxLineaires();
    },
    titreLecon: 'Les fonctions linéaires',
    lecon: `
      <h4>Définition</h4>
      <p>Une fonction <b>linéaire</b> s’écrit <b>f(x) = ax</b> : on multiplie toujours par le même nombre a, son <b>coefficient</b>.
        <i>f(x) = 3x, g(x) = ${MOINS}0,5x, h(x) = x ÷ 4 = 0,25x.</i> Mais f(x) = 3x + 1 ou f(x) = x² ne sont pas linéaires.
        Avec un coefficient en fraction : <i>k(x) = ${frac(2, 3)}x, donc k(9) = 9 ÷ 3 × 2 = 6.</i></p>
      <p>👉 Une fonction linéaire traduit une situation de <b>proportionnalité</b> : a est le coefficient de proportionnalité.</p>
      <h4>Trouver le coefficient</h4>
      <p>Si f(4) = 10, alors a × 4 = 10, donc <b>a = 10 ÷ 4 = 2,5</b> : on divise l’image par le nombre de départ.</p>
      <h4>Sa représentation graphique</h4>
      <p>C’est une <b>droite qui passe par l’origine</b> du repère. Ici, elle passe par A(2&nbsp;; 3) : f(2) = 3, donc a = 3 ÷ 2 = 1,5.</p>
      ${nombresLisibles(figures.repere({ xmin: -1, xmax: 4, ymin: -1, ymax: 5, unite: 30, traces: [{ f: x => 1.5 * x }], points: [{ x: 2, y: 3, nom: 'A', dx: 14, dy: 14 }] }))}
      <h4>Deux propriétés</h4>
      <p><i>Si f(3) = 12, alors f(6) = 2 × 12 = 24</i> (6 = 2 × 3, donc l’image est aussi multipliée par 2). <i>Et f(2 + 3) = f(2) + f(3).</i></p>
      <h4>Pourcentages</h4>
      <p>Augmenter de 20&nbsp;%, c’est appliquer f(x) = 1,2x&nbsp;; baisser de 15&nbsp;%, c’est appliquer f(x) = 0,85x.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> sur le graphique, lis un point dont les coordonnées tombent sur le quadrillage,
        puis divise son ordonnée par son abscisse.</div>
      <p>⚠️ Si f(3) = 12, f(5) n’est pas 12 + 2 = 14 : a = 12 ÷ 3 = 4, donc f(5) = 4 × 5 = 20.</p>
    `,
  });

  // ======================================================================
  // 3. Les fonctions affines
  // ======================================================================
  // Une fonction affine écrite de plusieurs façons : « 3x − 5 », « 5 − 2x », « x + 4 », « 7 − x », « 3x » (b = 0)
  function formeAffine() {
    const a = parmi([2, 3, 4, 5, -2, -3, -4, 0.5, 1.5, -1.5]);
    // (|b| ≠ |a| et |b| ≠ 1 : sinon deux boutons auraient le même nombre)
    const b = entierSauf(-9, 9, [0, 1, -1, a, -a]);
    const forme = parmi(['ab', 'ab', 'ba', 'ba', 'un', 'moinsUn', 'lineaire']);
    if (forme === 'ab') return { ecrite: affineEcrite(a, b), a, b };
    if (forme === 'ba') return { ecrite: `${ecrire(b)} ${a < 0 ? MOINS : '+'} ${ecrire(Math.abs(a))}x`, a, b, retournee: true };
    if (forme === 'un') return { ecrite: `x ${avecSigne(b)}`, a: 1, b };
    if (forme === 'moinsUn') return { ecrite: `${ecrire(b)} − x`, a: -1, b, retournee: true };
    return { ecrite: devant(a), a, b: 0 };
  }

  function questionVocabulaireAffine() {
    const F = formeAffine();
    const surA = Math.random() < 0.5;
    const reponse = surA ? F.a : F.b;
    const rangee = affineEcrite(F.a, F.b);
    let explication = F.b === 0
      ? `f(x) = ${F.ecrite} = ${F.ecrite} + 0 : le coefficient directeur (le nombre qui multiplie x) est a = ${ecrire(F.a)}, `
        + 'et il n’y a pas de nombre seul, donc <b>b = 0</b> (c’est une fonction linéaire).'
      : `${F.retournee ? `f(x) = ${F.ecrite} = ${rangee}.<br>` : ''}Le coefficient directeur est le nombre qui multiplie x : a = ${ecrire(F.a)}. `
        + `L’ordonnée à l’origine est le nombre seul : b = ${ecrire(F.b)}.`;
    // L'erreur expliquée : le signe perdu dans « 5 − 2x », le 1 caché dans « x », confondre a et b
    let garder;
    if (surA && Math.abs(F.a) === 1) {
      garder = 0;
      explication += `<br>⚠️ ${F.a === 1 ? 'x' : `${MOINS}x`} = ${ecrire(F.a)} × x : a = ${ecrire(F.a)}, pas 0.`;
    } else if (surA && F.retournee && F.a < 0) {
      garder = -F.a;
      explication += `<br>⚠️ Le signe − devant ${devant(-F.a)} fait partie du coefficient : a = ${ecrire(F.a)}.`;
    } else if (!surA && F.b === 0) {
      garder = F.a;
    } else {
      garder = surA ? F.b : F.a;
    }
    return choix({
      consigne: 'Reconnais a et b',
      enonce: `Soit f(x) = ${F.ecrite}. ${surA ? 'Quel est le coefficient directeur' : 'Quelle est l’ordonnée à l’origine'} de f ?`,
      reponse,
      pieges: [F.a, F.b, -F.a, -F.b],
      garder: [garder],
      explication,
    });
  }

  // Calculer une image, ou un antécédent (avec un nombre décimal)
  function questionImageAffine() {
    const a = parmi([2, 3, 4, 5, 6, -2, -3, -4, -5]);
    const b = entierSauf(-9, 9, [0]);
    const ecrite = affineEcrite(a, b);
    if (Math.random() < 0.65) {
      const x = parmi([0.5, 1.5, 2.5, 3.5, -0.5, -1.5, -2.5, -3.5]);
      const r = net(a * x + b);
      return nombre({
        consigne: 'Calcule l’image',
        enonce: `Soit f la fonction affine définie par f(x) = ${ecrite}. Calcule f(${ecrire(x)}).`,
        reponse: r,
        touches: TOUCHES,
        explication: `f(${ecrire(x)}) = ${ecrire(a)} × ${parentheses(x)} ${avecSigne(b)} = ${ecrire(net(a * x))} ${avecSigne(b)} = <b>${ecrire(r)}</b>.`,
      });
    }
    const x0 = entierSauf(-6, 8, [0, 1]);
    const m = a * x0 + b;
    return nombre({
      consigne: 'Trouve l’antécédent',
      enonce: `Soit f la fonction affine définie par f(x) = ${ecrite}. Quel nombre a pour image ${ecrire(m)} ?`,
      reponse: x0,
      touches: TOUCHES,
      explication: `On résout ${ecrite} = ${ecrire(m)} : ${devant(a)} = ${ecrire(m)} ${avecSigne(-b)} = ${ecrire(m - b)}, `
        + `donc x = ${ecrire(m - b)} ÷ ${parentheses(a)} = <b>${ecrire(x0)}</b>.`,
    });
  }

  // Le coefficient directeur à partir de deux images : a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁)
  function deuxPoints() {
    for (;;) {
      const a = parmi([2, 3, 4, -2, -3, 0.5, -0.5, 1.5, 2.5, -1.5]);
      const b = entier(-8, 8);
      const [x1, x2] = croissant(differents(2, -3, 6));
      const [y1, y2] = [net(a * x1 + b), net(a * x2 + b)];
      if (x2 - x1 >= 2 && Number.isInteger(y1) && Number.isInteger(y2) && Math.abs(y1) <= 25 && Math.abs(y2) <= 25) return { a, b, x1, x2, y1, y2 };
    }
  }

  function questionDeuxPoints(avecBoutons) {
    const { a, x1, x2, y1, y2 } = deuxPoints();
    const [dy, dx] = [net(y2 - y1), x2 - x1];
    const consigne = 'Trouve le coefficient directeur';
    const enonce = `f est affine, f(${ecrire(x1)}) = ${ecrire(y1)} et f(${ecrire(x2)}) = ${ecrire(y2)}. Quel est son coefficient directeur ?`;
    const explication = `a = ${frac(`${ecrire(y2)} − ${parentheses(y1)}`, `${ecrire(x2)} − ${parentheses(x1)}`)} = ${frac(dy, dx)} = <b>${ecrire(a)}</b>.`
      + '<br>On divise l’écart des images par l’écart des nombres de départ.';
    if (!avecBoutons) return nombre({ consigne, enonce, reponse: a, touches: TOUCHES, explication });
    // Les erreurs : diviser dans l'autre sens, oublier de diviser, un signe, faire comme si f était linéaire (f(x₂) ÷ x₂)
    const inverse = net(dx / dy);
    const inverseOk = auCentieme(inverse) && inverse !== a;
    const lineaire = x2 !== 0 ? net(y2 / x2) : null;
    const q = choix({
      consigne,
      enonce,
      reponse: a,
      pieges: [-a, dy, ...(lineaire !== null && auCentieme(lineaire) ? [lineaire] : [])],
      garder: [inverseOk ? inverse : dy],
      ordre: 'melange',
      explication,
    });
    q.explication += inverseOk
      ? `<br>⚠️ Pas ${ecrire(dx)} ÷ ${parentheses(dy)} : l’écart des images est en haut.`
      : `<br>⚠️ ${ecrire(dy)} est l’écart des images : il faut encore le diviser par ${ecrire(dx)}.`;
    return q;
  }

  // L'ordonnée à l'origine, quand on connaît a et une image
  function questionOrdonnee(avecBoutons) {
    let a;
    let x;
    let b;
    let y;
    // (avec des boutons : les trois erreurs donnent trois nombres différents de la réponse)
    do {
      a = parmi([2, 3, 4, 5, -2, -3, -4]);
      x = entierSauf(-5, 6, [0, 1]);
      b = entierSauf(-9, 9, [0]);
      y = a * x + b;
    } while (avecBoutons && new Set([b, y + a * x, y - a, -b]).size < 4);
    const consigne = 'Trouve l’ordonnée à l’origine';
    const enonce = `f est une fonction affine de coefficient directeur ${ecrire(a)}, et f(${ecrire(x)}) = ${ecrire(y)}. Quelle est son ordonnée à l’origine ?`;
    const explication = `f(x) = ${devant(a)} + b, donc ${ecrire(a)} × ${parentheses(x)} + b = ${ecrire(y)}, c’est-à-dire ${ecrire(a * x)} + b = ${ecrire(y)}.<br>`
      + `b = ${ecrire(y)} − ${parentheses(a * x)} = <b>${ecrire(b)}</b>.`;
    if (!avecBoutons) return nombre({ consigne, enonce, reponse: b, touches: TOUCHES, explication });
    // Les erreurs : ajouter au lieu de soustraire, oublier de multiplier par x, le signe du résultat
    return choix({
      consigne,
      enonce,
      reponse: b,
      pieges: [y - a, -b],
      garder: [y + a * x],
      explication: `${explication}<br>⚠️ On enlève ${parentheses(a * x)} : pas ${ecrire(y)} + ${parentheses(a * x)} = ${ecrire(y + a * x)}.`,
    });
  }

  // Lire une fonction affine sur sa droite
  function questionGraphiqueAffine() {
    const a = parmi([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
    const b = entierSauf(-3, 3, [0, a, -a]);
    const figure = nombresLisibles(figures.repere({ ...REPERE_DROITES, traces: [{ f: x => a * x + b }] }));
    const pas = Number.isInteger(a) ? 1 : 2;
    const lireA = `Quand x augmente de ${pas}, f(x) ${a > 0 ? 'augmente' : 'diminue'} de ${ecrire(Math.abs(a * pas))} : a = `
      + (pas === 1 ? `${ecrire(a)}.` : `${a < 0 ? MOINS : ''}1 ÷ 2 = ${ecrire(a)}.`);
    const lireB = `La droite coupe l’axe des ordonnées au point (0${ESPACE}; ${ecrire(b)}) : b = ${ecrire(b)}.`;
    const intro = `La droite représente une fonction affine f.${figure}`;
    const consigne = 'Lis le graphique';
    const sorte = parmi(['ordonnee', 'coefficient', 'fonction', 'fonction']);
    if (sorte === 'ordonnee') {
      // le piège : le point où la droite coupe l'axe des abscisses
      const z = net(-b / a);
      const zOk = auDixieme(z) && Math.abs(z) <= 4 && z !== b;
      const q = choix({
        consigne,
        enonce: `${intro}Quelle est l’ordonnée à l’origine de f ?`,
        reponse: b,
        pieges: [a, -b],
        garder: zOk ? [z] : [],
        explication: lireB,
      });
      if (zOk) q.explication += `<br>⚠️ En ${ecrire(z)}, la droite coupe l’axe des <b>abscisses</b> : ce n’est pas l’ordonnée à l’origine.`;
      return q;
    }
    const inverse = net(1 / a);
    const inverseOk = auCentieme(inverse) && inverse !== a;
    if (sorte === 'coefficient') {
      const z = net(-b / a);
      const q = choix({
        consigne,
        enonce: `${intro}Quel est le coefficient directeur de f ?`,
        reponse: a,
        // le signe, l'ordonnée à l'origine, le point où la droite coupe l'axe des abscisses
        pieges: [-a, b, ...(auDixieme(z) && Math.abs(z) <= 4 ? [z] : [])],
        garder: [inverseOk ? inverse : -a],
        explication: lireA,
      });
      q.explication += inverseOk ? '<br>⚠️ On divise l’écart des ordonnées par l’écart des abscisses, pas l’inverse.'
        : `<br>⚠️ La droite ${a > 0 ? 'monte' : 'descend'} : a est ${a > 0 ? 'positif' : 'négatif'}.`;
      return q;
    }
    const f = (p, o) => `f(x) = ${affineEcrite(p, o)}`;
    return choix({
      consigne,
      enonce: `${intro}Quelle est l’expression de f(x) ?`,
      reponse: f(a, b),
      // a et b échangés, un signe faux, la pente à l'envers
      pieges: [f(-a, b), f(a, -b), ...(inverseOk ? [f(inverse, b)] : [])],
      garder: a !== b ? [f(b, a)] : [],
      explication: `${lireB}<br>${lireA}<br>Donc <b>${f(a, b)}</b>.`,
    });
  }

  // Reconnaître une fonction affine : [l'écriture, pourquoi]
  function questionReconnaitreAffine() {
    const k = entier(2, 5);
    const b = entier(1, 7);
    const AFFINES = [[`${k}x − ${b}`, `a = ${k} et b = ${MOINS}${b}`], [`${b} − ${k}x`, `a = ${MOINS}${k} et b = ${b}`],
      [`${k}x`, `a = ${k} et b = 0 (une fonction linéaire est affine)`], [`${k}(x + ${b})`, `${k}(x + ${b}) = ${k}x + ${k * b}`],
      [`x ÷ ${k} + ${b}`, `a = ${frac(1, k)} et b = ${b}`],
      [`(x + ${k})² − x²`, `(x + ${k})² − x² = x² + ${2 * k}x + ${k * k} − x² = ${2 * k}x + ${k * k}`]];
    // les carrés visibles, et les carrés cachés (on les voit en développant)
    const NON_VISIBLES = [[`x² + ${b}`, 'il y a un x²'], [`${k}x²`, 'il y a un x²'], [`(x + ${b})²`, 'il y a un carré'], [`${k}x² − x`, 'il y a un x²']];
    const NON_CACHES = [[`x(x + ${b})`, `x(x + ${b}) = x² + ${b}x`], [`x × x − ${b}`, 'x × x = x²'], [`${k}x × x`, `${k}x × x = ${k}x²`],
      [`x(${k}x − 1)`, `x(${k}x − 1) = ${k}x² − x`], [`(x + 1)(x − ${b})`, 'en développant, on trouve un x²']];
    const bouton = ([e]) => `f(x) = ${e}`;
    if (Math.random() < 0.5) {
      // (au moins un piège dont le carré est caché : on ne trouve pas la réponse en cherchant le seul bouton sans « ² »)
      const caches = RM.melanger(NON_CACHES).slice(0, entier(1, 2));
      const [bonne, ...autres] = [parmi(AFFINES), ...caches, ...RM.melanger(NON_VISIBLES).slice(0, 3 - caches.length)];
      return choix({
        consigne: 'Reconnais la fonction affine',
        enonce: 'Laquelle de ces fonctions est affine ?',
        reponse: bouton(bonne),
        pieges: autres.map(bouton),
        explication: `Une fonction affine s’écrit f(x) = ax + b. <b>${bouton(bonne)}</b> : ${bonne[1]}.<br>`
          + 'Les autres ont un x², parfois caché (x × x = x²) : elles ne sont pas affines.',
      });
    }
    // (la réponse a souvent un carré caché, et un piège affine peut avoir l'air d'avoir un carré)
    const [bonne, ...autres] = [parmi(Math.random() < 0.6 ? NON_CACHES : NON_VISIBLES), ...RM.melanger(AFFINES).slice(0, 3)];
    return choix({
      consigne: 'Reconnais la fonction affine',
      enonce: 'Laquelle de ces fonctions n’est pas affine ?',
      reponse: bouton(bonne),
      pieges: autres.map(bouton),
      explication: `<b>${bouton(bonne)}</b> ne s’écrit pas ax + b : ${bonne[1]}.<br>Les trois autres sont affines (${bouton(autres[0])} : ${autres[0][1]}).`,
    });
  }

  // Des problèmes : un tarif avec une part fixe, une bougie qui raccourcit
  function questionProblemeAffine() {
    const consigne = 'Résous le problème';
    const p = parmi(ENFANTS);
    const sorte = parmi(['taxi', 'seances', 'egalite', 'bougie']);
    if (sorte === 'taxi') {
      const c = parmi([2, 2.5, 3, 4]);
      const k = parmi([1.2, 1.5, 2]);
      const d = entier(4, 20);
      const prix = net(c + k * d);
      return nombre({
        consigne,
        enonce: `Un taxi coûte ${euros(c)} de prise en charge, plus ${euros(k)} par kilomètre. Le prix, en euros, pour x km est `
          + `f(x) = ${ecrire(k)}x + ${ecrire(c)}. Combien coûte une course de ${mesure(d, 'km')} ?`,
        reponse: prix,
        prix: true,
        touches: TOUCHES,
        explication: `f(${ecrire(d)}) = ${ecrire(k)} × ${ecrire(d)} + ${ecrire(c)} = ${ecrire(net(k * d))} + ${ecrire(c)} = <b>${euros(prix)}</b>.`,
      });
    }
    if (sorte === 'seances') {
      const A = parmi([10, 15, 20, 25, 30]);
      const s = parmi([2, 3, 4, 5]);
      const n = entier(4, 15);
      const total = A + s * n;
      return nombre({
        consigne,
        enonce: `À la piscine, ${p.nom} a acheté une carte à ${euros(A)}, puis ${p.il} paie ${euros(s)} par séance. `
          + `En tout, ${p.il} a payé ${euros(total)}. Combien de séances a-t-${p.il} faites ?`,
        reponse: n,
        unite: 'séances',
        touches: TOUCHES,
        explication: `Le prix pour x séances est f(x) = ${ecrire(s)}x + ${ecrire(A)}. On résout ${ecrire(s)}x + ${ecrire(A)} = ${ecrire(total)} :<br>`
          + `${ecrire(s)}x = ${ecrire(total)} − ${ecrire(A)} = ${ecrire(total - A)}, donc x = ${ecrire(total - A)} ÷ ${ecrire(s)} = <b>${ecrire(n)}</b>.`,
      });
    }
    if (sorte === 'egalite') {
      let k;
      let kp;
      let n;
      do { k = entier(4, 9); kp = entier(2, k - 2); n = entier(5, 15); } while ((k - kp) * n > 60);
      const c = (k - kp) * n;
      return nombre({
        consigne,
        enonce: `Au cinéma, tarif A : ${euros(k)} la séance. Tarif B : un abonnement de ${euros(c)}, puis ${euros(kp)} la séance. `
          + 'Pour combien de séances les deux tarifs coûtent-ils le même prix ?',
        reponse: n,
        unite: 'séances',
        touches: TOUCHES,
        explication: `Tarif A : f(x) = ${ecrire(k)}x. Tarif B : g(x) = ${ecrire(kp)}x + ${ecrire(c)}.<br>`
          + `${ecrire(k)}x = ${ecrire(kp)}x + ${ecrire(c)} donne ${ecrire(k - kp)}x = ${ecrire(c)}, donc x = ${ecrire(c)} ÷ ${ecrire(k - kp)} = <b>${ecrire(n)}</b>.`,
      });
    }
    const h0 = parmi([15, 20, 24, 30]);
    const v = parmi([1.5, 2, 2.5]);
    const t = entier(2, Math.floor(h0 / v) - 2);
    const h = net(h0 - v * t);
    return nombre({
      consigne,
      enonce: `Une bougie mesure ${mesure(h0, 'cm')}. Quand elle brûle, elle perd ${mesure(v, 'cm')} par heure : `
        + `sa hauteur après x heures est f(x) = ${ecrire(h0)} − ${ecrire(v)}x. Quelle est sa hauteur après ${combien(t, 'heure')} ?`,
      reponse: h,
      unite: 'cm',
      touches: TOUCHES,
      explication: `f(${ecrire(t)}) = ${ecrire(h0)} − ${ecrire(v)} × ${ecrire(t)} = ${ecrire(h0)} − ${ecrire(net(v * t))} = <b>${mesure(h, 'cm')}</b>.`
        + `<br>Le coefficient directeur, ${ecrire(-v)}, est négatif : la hauteur diminue.`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_AFFINES = [
    ['Une fonction linéaire est une fonction affine particulière.', 'Une fonction affine est toujours une fonction linéaire.',
      'Avec b = 0, f(x) = ax + b devient f(x) = ax : toute fonction linéaire est <b>affine</b>. Mais f(x) = 2x + 1 est affine sans être linéaire.'],
    ['La représentation graphique d’une fonction affine est une droite.', 'La représentation graphique d’une fonction affine passe toujours par l’origine.',
      'C’est toujours une <b>droite</b>, qui coupe l’axe des ordonnées au point (0&nbsp;; b). Elle ne passe par l’origine que si b = 0.'],
    ['Si le coefficient directeur est négatif, la droite descend.', 'Si l’ordonnée à l’origine est négative, la droite descend.',
      'C’est le signe de <b>a</b> qui dit si la droite monte ou descend&nbsp;; b dit seulement où elle coupe l’axe des ordonnées.'],
  ];

  function vraiFauxAffines() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['regle', 'regle', 'formule', 'point']);
    if (forme === 'regle') {
      const [juste, faux, pourquoi] = parmi(REGLES_AFFINES);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    if (forme === 'formule') {
      const k = entier(2, 6);
      const b = entier(1, 5);
      const [e, pourquoi] = vrai
        ? parmi([[`${k}x − ${b}`, `a = ${k} et b = ${MOINS}${b}, elle est donc <b>affine</b>`],
          [`${k}x`, 'b = 0 : elle est linéaire, et une fonction linéaire est <b>affine</b>'], [`${b} − ${k}x`, `a = ${MOINS}${k} et b = ${b}, elle est donc <b>affine</b>`]])
        : parmi([[`${k}x² + ${b}`, 'il y a un x², elle n’est donc <b>pas</b> affine'], [`x(x − ${b})`, `x(x − ${b}) = x² − ${b}x, elle n’est donc <b>pas</b> affine`],
          [`(x + ${b})²`, 'il y a un carré, elle n’est donc <b>pas</b> affine']]);
      return vraiFaux({
        enonce: `La fonction f(x) = ${e} est affine.`,
        vrai,
        explication: `Une fonction affine s’écrit f(x) = ax + b. f(x) = ${e} : ${pourquoi}.`,
      });
    }
    const a = parmi([2, 3, 4, -2, -3]);
    const b = entierSauf(-6, 6, [0]);
    const x = entierSauf(-3, 4, [0, 1]);
    const y = a * x + b;
    const faux = parmi([a * x - b, -a * x + b, a + x + b].filter(v => v !== y));
    const annonce = vrai ? y : faux;
    return vraiFaux({
      enonce: `Le point ${point('A', x, annonce)} est sur la droite qui représente la fonction f(x) = ${affineEcrite(a, b)}.`,
      vrai,
      explication: `f(${ecrire(x)}) = ${ecrire(a)} × ${parentheses(x)} ${avecSigne(b)} = <b>${ecrire(y)}</b> : `
        + (vrai ? `le point ${point('A', x, y)} est bien sur la droite.` : `c’est ${point('B', x, y)} qui est sur la droite, pas A.`),
    });
  }

  ajouterEtape({
    id: '3e-donnees-fonctions-affines',
    banque: ['vocabulaire', 'vocabulaire', 'vocabulaire', 'image', 'image', 'deuxPoints', 'deuxPointsNombre', 'ordonnee',
      'graphique', 'graphique', 'reconnaitre', 'reconnaitre', 'probleme', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'vocabulaire') return questionVocabulaireAffine();
      if (sorte === 'image') return questionImageAffine();
      if (sorte === 'deuxPoints') return questionDeuxPoints(true);
      if (sorte === 'deuxPointsNombre') return questionDeuxPoints(false);
      if (sorte === 'ordonnee') return questionOrdonnee(Math.random() < 0.5);
      if (sorte === 'graphique') return questionGraphiqueAffine();
      if (sorte === 'reconnaitre') return questionReconnaitreAffine();
      if (sorte === 'probleme') return questionProblemeAffine();
      return vraiFauxAffines();
    },
    titreLecon: 'Les fonctions affines',
    lecon: `
      <h4>Définition</h4>
      <p>Une fonction <b>affine</b> s’écrit <b>f(x) = ax + b</b>. Le nombre a est le <b>coefficient directeur</b>,
        le nombre b est l’<b>ordonnée à l’origine</b>. <i>f(x) = 5 − 2x = ${MOINS}2x + 5 : a = ${MOINS}2 et b = 5.</i></p>
      <p>👉 Si b = 0, f(x) = ax est <b>linéaire</b> : une fonction linéaire est une fonction affine. Si a = 0, f(x) = b est constante (affine aussi).
        Mais f(x) = x² + 1 ou f(x) = x(x + 1) ne sont pas affines : il y a un x². Pour savoir, on développe :
        <i>x(x + 1) = x² + x n’est pas affine, mais (x + 1)² − x² = x² + 2x + 1 − x² = 2x + 1 l’est.</i></p>
      <h4>Sa représentation graphique : une droite</h4>
      ${nombresLisibles(figures.repere({ xmin: -2, xmax: 3, ymin: -3, ymax: 5, unite: 28, traces: [{ f: x => 2 * x - 1 }] }))}
      <p><i>f(x) = 2x − 1 :</i> la droite coupe l’axe des ordonnées au point (0&nbsp;; ${MOINS}1), car f(0) = b = ${MOINS}1.
        Quand x augmente de 1, f(x) augmente de a = 2. Si a est positif, la droite monte&nbsp;; s’il est négatif, elle descend.</p>
      <h4>Trouver a avec deux images</h4>
      <p>a = ${frac('f(x₂) − f(x₁)', 'x₂ − x₁')} : <i>f(1) = 5 et f(4) = 11 donnent a = (11 − 5) ÷ (4 − 1) = 6 ÷ 3 = 2.</i>
        Puis b : <i>f(1) = 2 × 1 + b = 5, donc b = 3.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un tarif avec une carte (la part fixe b) et un prix par séance (a) est une fonction affine :
        prix = a × séances + b.</div>
      <p>⚠️ Dans 5 − 2x, le coefficient directeur est ${MOINS}2 : le signe fait partie du nombre.</p>
    `,
  });

  // ======================================================================
  // 4. Les statistiques
  // ======================================================================
  // « 4e », avec le petit e en exposant
  const rang = k => `${ecrire(k)}<sup>e</sup>`;
  function mediane(valeurs) {
    const tri = croissant(valeurs);
    const n = tri.length;
    return n % 2 ? tri[(n - 1) / 2] : net((tri[n / 2 - 1] + tri[n / 2]) / 2);
  }
  const moyenne = valeurs => net(additionner(valeurs) / valeurs.length);
  // Le « milieu » de la liste pas rangée (l'erreur classique)
  const milieuSansRanger = valeurs => (valeurs.length % 2 ? valeurs[(valeurs.length - 1) / 2]
    : net((valeurs[valeurs.length / 2 - 1] + valeurs[valeurs.length / 2]) / 2));
  // Une série pas rangée, dont le milieu (sans ranger) n'est pas la médiane : le piège est bien là
  // (moyenneJuste : la moyenne a au plus un chiffre après la virgule)
  function serie(n, min, max, moyenneJuste = false) {
    for (let essai = 0; ; essai++) {
      const valeurs = Array.from({ length: n }, () => entier(min, max));
      if (new Set(valeurs).size < n - 2) continue;
      if (moyenneJuste && !auDixieme(moyenne(valeurs))) continue;
      if (milieuSansRanger(valeurs) === mediane(valeurs) && essai < 50) continue;
      return valeurs;
    }
  }
  function expliquerMediane(valeurs, e = ecrire) {
    const tri = croissant(valeurs);
    const n = tri.length;
    const debut = `On range d’abord la série : ${liste(tri)}.<br>`;
    if (n % 2) return `${debut}Il y a ${ecrire(n)} valeurs : la médiane est celle du milieu, la ${rang((n + 1) / 2)} : <b>${e(mediane(tri))}</b>.`;
    const [a, b] = [tri[n / 2 - 1], tri[n / 2]];
    return `${debut}Il y a ${ecrire(n)} valeurs : la médiane est la moyenne de la ${rang(n / 2)} et de la ${rang(n / 2 + 1)} valeur, `
      + (a === b ? `qui valent toutes les deux ${ecrire(a)} : <b>${e(a)}</b>.` : `(${ecrire(a)} + ${ecrire(b)}) ÷ 2 = <b>${e(mediane(tri))}</b>.`);
  }

  // L'étendue : une série simple, ou des températures (avec des nombres négatifs)
  function questionEtendue() {
    const temperatures = Math.random() < 0.5;
    let valeurs;
    if (temperatures) {
      do {
        valeurs = Array.from({ length: parmi([5, 6, 7]) }, () => entier(-6, 9));
      } while (Math.min(...valeurs) >= 0 || Math.max(...valeurs) <= 0 || new Set(valeurs).size < valeurs.length - 1);
    } else {
      valeurs = serie(parmi([5, 6, 7]), 3, 20);
    }
    const tri = croissant(valeurs);
    const [min, max] = [tri[0], tri[tri.length - 1]];
    const e = max - min;
    const u = temperatures ? v => mesure(v, '°C') : v => ecrire(v);
    const dernierMoinsPremier = valeurs[valeurs.length - 1] - valeurs[0];
    // L'erreur expliquée : le signe de la plus petite valeur, la dernière moins la première, ou la plus grande valeur
    let garder;
    let attention;
    if (temperatures && max + min > 0) {
      garder = max + min;
      attention = `⚠️ Soustraire ${parentheses(min)}, c’est ajouter ${ecrire(-min)} : pas ${ecrire(max)} − ${ecrire(-min)} = ${ecrire(max + min)}.`;
    } else if (!temperatures && dernierMoinsPremier > 0 && dernierMoinsPremier !== e && Math.random() < 0.5) {
      garder = dernierMoinsPremier;
      attention = `⚠️ Ce n’est pas la dernière valeur moins la première (${ecrire(valeurs[valeurs.length - 1])} − ${ecrire(valeurs[0])}) : `
        + 'on prend la plus grande et la plus petite.';
    } else if (!temperatures && Math.random() < 0.5) {
      garder = max + min;
      attention = `⚠️ On soustrait la plus petite valeur, on ne l’ajoute pas : pas ${ecrire(max)} + ${ecrire(min)} = ${ecrire(max + min)}.`;
    } else {
      garder = max;
      attention = '⚠️ L’étendue n’est pas la plus grande valeur : c’est l’écart entre la plus grande et la plus petite.';
    }
    // Les autres erreurs : confondre avec la médiane ou la moyenne, oublier de ranger, se tromper de signe,
    // compter les degrés « comme des piquets » (de −4 à 8, il y a 13 nombres entiers, mais l'écart est 12)
    // (seulement des nombres entiers : une étendue de nombres entiers est entière)
    const candidats = [max, mediane(valeurs), moyenne(valeurs), dernierMoinsPremier, temperatures ? Math.abs(max + min) : max + min,
      ...(temperatures ? [e + 1] : [])].filter(Number.isInteger);
    // (au moins deux pièges, sinon on tire une autre série)
    if (new Set(positifs([garder, ...candidats]).filter(v => v !== e)).size < 2) return questionEtendue();
    if (temperatures && Math.random() < 0.4) {
      // À l'envers : on connaît la plus haute température et l'étendue, on cherche la plus basse
      const u2 = v => mesure(v, '°C');
      return choix({
        consigne: 'Utilise l’étendue',
        enonce: `Pendant une semaine d’hiver, la température la plus haute a été ${u2(max)}, et l’étendue des températures est ${u2(e)}. `
          + 'Quelle a été la température la plus basse ?',
        reponse: u2(min),
        // le signe oublié, un degré de trop (compter « comme des piquets »), ajouter au lieu d'enlever, l'étendue prise pour la température
        // (deux boutons négatifs et deux positifs : le signe ne suffit pas pour trouver la réponse)
        pieges: [u2(-min), u2(min - 1), u2(max + e), u2(e)],
        garder: [u2(-min), u2(min - 1)],
        ordre: 'melange',
        explication: `La plus haute − la plus basse = l’étendue, donc la plus basse = ${ecrire(max)} − ${ecrire(e)} = <b>${u2(min)}</b>.<br>`
          + `⚠️ ${ecrire(max)} − ${ecrire(e)} est négatif : il a fait ${u2(min)}, et pas ${u2(-min)}.`,
      });
    }
    return choix({
      consigne: 'Calcule l’étendue',
      enonce: temperatures ? `Températures relevées (en °C) : ${liste(valeurs)}. Quelle est l’étendue de cette série ?`
        : `Quelle est l’étendue de la série ${liste(valeurs)} ?`,
      reponse: u(e),
      pieges: positifs(candidats).map(u),
      garder: [u(garder)],
      // (l'étendue est presque toujours au milieu des pièges, ou au-dessus de tous pour les températures : on mélange les boutons)
      ordre: 'melange',
      explication: `L’étendue = la plus grande valeur − la plus petite : ${ecrire(max)} − ${parentheses(min)} = <b>${u(e)}</b>.<br>${attention}`,
    });
  }

  // Des séries : la phrase, les valeurs possibles, les nombres de valeurs, l'unité
  const SERIES = [
    { texte: p => `Voici les notes ${de(p.nom)} ce trimestre, sur 20 :`, min: 4, max: 19, n: [7, 8, 9, 10], unite: '' },
    { texte: p => `${p.nom} a noté ses temps au 400 m, en secondes :`, min: 62, max: 85, n: [6, 7, 8], unite: 's' },
    { texte: () => 'Voici les tailles des joueurs d’une équipe de basket, en cm :', min: 168, max: 198, n: [8, 9, 10, 11], unite: 'cm' },
    { texte: () => 'Voici le nombre de visiteurs du musée de la forêt, chaque jour d’une semaine :', min: 35, max: 120, n: [7], unite: 'visiteurs' },
    { texte: () => 'Voici les températures relevées à midi pendant quelques jours de juin, en °C :', min: 18, max: 31, n: [7, 8, 9], unite: '°C' },
  ];

  function questionMediane() {
    const S = parmi(SERIES);
    const p = parmi(ENFANTS);
    const valeurs = serie(parmi(S.n), S.min, S.max);
    const e = v => (S.unite ? mesure(v, S.unite) : ecrire(v));
    return nombre({
      consigne: 'Trouve la médiane',
      enonce: `${S.texte(p)} ${liste(valeurs)}.<br>Quelle est la médiane de cette série ?`,
      reponse: mediane(valeurs),
      unite: S.unite,
      explication: expliquerMediane(valeurs, e),
    });
  }

  // Une série courte, sans situation : les erreurs sont oublier de ranger, se tromper de rang, prendre la moyenne
  function questionMedianeCourte() {
    const n = parmi([5, 6, 7]);
    const valeurs = serie(n, 2, 20);
    const med = mediane(valeurs);
    const tri = croissant(valeurs);
    const i = Math.floor((n - 1) / 2);
    const voisins = n % 2 ? [tri[i - 1], tri[i + 1]] : [tri[i], tri[i + 1], tri[i - 1], tri[i + 2]];
    const sansRanger = milieuSansRanger(valeurs);
    const q = choix({
      consigne: 'Trouve la médiane',
      enonce: `Quelle est la médiane de la série ${liste(valeurs)} ?`,
      reponse: med,
      // (et deux confusions : le milieu entre la plus petite et la plus grande valeur, l'étendue)
      pieges: [...voisins, ...(Number.isInteger(2 * moyenne(valeurs)) ? [moyenne(valeurs)] : []), net((tri[0] + tri[n - 1]) / 2), tri[n - 1] - tri[0]],
      garder: sansRanger !== med ? [sansRanger] : [],
      explication: expliquerMediane(valeurs),
    });
    if (sansRanger !== med) q.explication += `<br>⚠️ ${ecrire(sansRanger)} est au milieu de la série <b>pas rangée</b> : ce n’est pas la médiane.`;
    return q;
  }

  // Une série donnée par ses effectifs (un tableau) : la moyenne pondérée
  const PONDEREES = [
    { titre: 'Note sur 20', valeurs: [[8, 10, 12, 14, 16], [6, 9, 12, 15, 18], [7, 10, 13, 16]], ligne: 'Nombre d’élèves',
      intro: 'Voici les notes d’un contrôle dans une classe de 3e.' },
    { titre: 'Buts marqués', valeurs: [[0, 1, 2, 3, 4]], ligne: 'Nombre de matchs',
      intro: 'Voici le nombre de buts marqués par l’équipe de Malo à chaque match de la saison.' },
    { titre: 'Pointure', valeurs: [[36, 37, 38, 39, 40], [37, 38, 39, 40, 41, 42]], ligne: 'Nombre d’élèves',
      intro: 'On a relevé la pointure des élèves d’une classe.' },
    { titre: 'Nombre d’enfants', valeurs: [[0, 1, 2, 3, 4]], ligne: 'Nombre de familles',
      intro: 'On a demandé à des familles de la forêt combien elles ont d’enfants.' },
  ];
  function seriePonderee() {
    for (;;) {
      const T = parmi(PONDEREES);
      const valeurs = parmi(T.valeurs);
      const effectifs = valeurs.map(() => entier(1, 8));
      const N = additionner(effectifs);
      const total = additionner(valeurs.map((v, i) => v * effectifs[i]));
      const moy = net(total / N);
      if (N >= 10 && N <= 30 && auDixieme(moy)) return { T, valeurs, effectifs, N, total, moy };
    }
  }

  function questionMoyennePonderee(avecBoutons) {
    // (avec des boutons : au moins deux pièges différents de la réponse)
    let S;
    let detaillee;
    do {
      S = seriePonderee();
      detaillee = S.valeurs.flatMap((v, i) => Array(S.effectifs[i]).fill(v));
    } while (avecBoutons
      && new Set([S.moy, moyenne(S.valeurs), mediane(detaillee), S.valeurs[S.effectifs.indexOf(Math.max(...S.effectifs))]]).size < 3);
    const html = tableau([[S.T.titre, ...S.valeurs], [S.T.ligne, ...S.effectifs]]);
    const produits = S.valeurs.map((v, i) => `${ecrire(v)} × ${ecrire(S.effectifs[i])}`).join(' + ');
    const explication = `On multiplie chaque valeur par son effectif : ${produits} = ${ecrire(S.total)}.<br>`
      + `L’effectif total est ${somme(S.effectifs)} = ${ecrire(S.N)}. Moyenne : ${ecrire(S.total)} ÷ ${ecrire(S.N)} = <b>${ecrire(S.moy)}</b>.`;
    const enonce = `${S.T.intro}${html}Quelle est la moyenne de cette série ?`;
    if (!avecBoutons) return nombre({ consigne: 'Calcule la moyenne', enonce, reponse: S.moy, explication });
    // Les erreurs : oublier les effectifs, donner la médiane ou la valeur la plus fréquente
    const simple = moyenne(S.valeurs);
    const plusFrequente = S.valeurs[S.effectifs.indexOf(Math.max(...S.effectifs))];
    const simpleOk = auDixieme(simple) && simple !== S.moy;
    const q = choix({
      consigne: 'Calcule la moyenne',
      enonce,
      reponse: S.moy,
      pieges: [mediane(detaillee), plusFrequente, ...(simpleOk ? [simple] : [])],
      garder: simpleOk ? [simple] : [],
      // (la moyenne est souvent entre les pièges : on mélange les boutons)
      ordre: 'melange',
      explication,
    });
    if (simpleOk) q.explication += `<br>⚠️ Pas ${ecrire(simple)} : chaque valeur compte autant de fois que son effectif.`;
    return q;
  }

  // La médiane d'une série donnée par ses effectifs (un tableau ou un diagramme en barres)
  const EFFECTIFS = [
    { titre: 'Pointure', valeurs: [36, 37, 38, 39, 40, 41], qui: 'élèves', intro: 'On a relevé la pointure des élèves de la classe.',
      diagramme: 'Le diagramme donne le nombre d’élèves pour chaque pointure.' },
    { titre: 'Frères et sœurs', valeurs: [0, 1, 2, 3, 4], qui: 'élèves', intro: 'Chaque élève de la classe a dit combien il a de frères et sœurs.',
      diagramme: 'Le diagramme donne le nombre d’élèves qui ont 0, 1, 2, 3 ou 4 frères et sœurs.' },
    { titre: 'Note sur 10', valeurs: [5, 6, 7, 8, 9, 10], qui: 'élèves', intro: 'Voici les notes d’un contrôle, sur 10.',
      diagramme: 'Le diagramme donne le nombre d’élèves pour chaque note d’un contrôle, sur 10.' },
  ];

  function questionMedianeEffectifs() {
    const T = parmi(EFFECTIFS);
    let effectifs;
    let N;
    let rangs;
    const valeurDuRang = k => T.valeurs[effectifs.findIndex((x, i) => additionner(effectifs.slice(0, i + 1)) >= k)];
    // (si l'effectif total est pair, les deux valeurs du milieu sont égales : la médiane est une des valeurs du tableau)
    do {
      effectifs = T.valeurs.map(() => entier(1, 8));
      N = additionner(effectifs);
      rangs = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1];
    } while (N < 15 || valeurDuRang(rangs[0]) !== valeurDuRang(rangs[rangs.length - 1]));
    const med = valeurDuRang(rangs[0]);
    const avecDiagramme = Math.random() < 0.5;
    const enonce = avecDiagramme
      ? `${T.diagramme}${figures.barres({ donnees: T.valeurs.map((v, i) => [ecrire(v), effectifs[i]]), max: 8, pas: 1, largeurBarre: 36, unite: T.qui })}`
      : `${T.intro}${tableau([[T.titre, ...T.valeurs], [`Nombre ${de(T.qui)}`, ...effectifs]])}`;
    // Les effectifs cumulés, jusqu'à la médiane
    const cumuls = [];
    for (let i = 0; T.valeurs[i - 1] !== med; i++) cumuls.push(`jusqu’à ${ecrire(T.valeurs[i])} : ${ecrire(additionner(effectifs.slice(0, i + 1)))}`);
    const position = N % 2 ? `la ${rang(rangs[0])}` : `entre la ${rang(rangs[0])} et la ${rang(rangs[1])}`;
    // Le piège : la valeur du milieu du tableau, sans tenir compte des effectifs
    const milieu = T.valeurs[Math.floor((T.valeurs.length - 1) / 2)];
    const q = choix({
      consigne: 'Trouve la médiane',
      enonce: `${enonce}Quelle est la médiane de cette série ?`,
      reponse: med,
      pieges: T.valeurs,
      garder: milieu !== med ? [milieu] : [],
      // (la médiane est souvent une valeur du milieu : on mélange les boutons)
      ordre: 'melange',
      explication: `Il y a ${somme(effectifs)} = ${ecrire(N)} valeurs : la médiane est ${position}.<br>`
        + `On cumule les effectifs : ${cumuls.join(`${ESPACE}; `)}. La médiane est <b>${ecrire(med)}</b>.`,
    });
    if (milieu !== med) q.explication += `<br>⚠️ Ce n’est pas la valeur du milieu du ${avecDiagramme ? 'diagramme' : 'tableau'} : il faut compter les effectifs.`;
    return q;
  }

  // Comparer deux séries avec leurs indicateurs (les boutons sont toujours les mêmes)
  const CLASSES = ['Classe A', 'Classe B', 'On ne peut pas savoir'];
  function questionComparer() {
    const cas = parmi(['etendue', 'mediane', 'inconnu']);
    const consigne = 'Compare les deux classes';
    if (cas === 'etendue') {
      const m = entier(9, 13);
      let e1;
      let e2;
      do { [e1, e2] = differents(2, 4, 15); } while (Math.abs(e1 - e2) < 3);
      const bonne = e1 < e2 ? CLASSES[0] : CLASSES[1];
      return choix({
        consigne,
        enonce: `Deux classes ont eu le même contrôle. Classe A : moyenne ${ecrire(m)}, étendue ${ecrire(e1)}. Classe B : moyenne ${ecrire(m)}, `
          + `étendue ${ecrire(e2)}. D’après l’étendue, dans quelle classe les notes sont-elles les moins dispersées ?`,
        reponse: bonne,
        choix: CLASSES,
        explication: `Les moyennes sont égales. L’étendue mesure la dispersion : plus elle est petite, plus les notes sont regroupées.<br>`
          + `${ecrire(Math.min(e1, e2))} &lt; ${ecrire(Math.max(e1, e2))} : c’est la <b>${bonne.replace('Classe', 'classe')}</b>.`,
      });
    }
    if (cas === 'mediane') {
      const [mA, mB] = differents(2, 8, 14);
      const s = Math.max(mA, mB);
      const bonne = mA > mB ? CLASSES[0] : CLASSES[1];
      return choix({
        consigne,
        enonce: `Classe A : médiane des notes ${ecrire(mA)}. Classe B : médiane des notes ${ecrire(mB)}. `
          + `Dans quelle classe est-on sûr qu’au moins la moitié des élèves ont eu ${ecrire(s)} ou plus ?`,
        reponse: bonne,
        choix: CLASSES,
        explication: `Au moins la moitié des notes sont supérieures ou égales à la médiane. Dans la <b>${bonne.replace('Classe', 'classe')}</b>, la médiane est ${ecrire(s)} : c’est sûr.`
          + `<br>Dans l’autre classe, la médiane (${ecrire(Math.min(mA, mB))}) est plus petite : on ne peut pas en être sûr.`,
      });
    }
    const [mA, mB] = differents(2, 9, 14);
    const [question, pourquoi] = parmi([
      ['Dans quelle classe se trouve la meilleure note ?', 'La moyenne ne dit pas quelle est la plus grande note : une classe peut avoir une moyenne plus basse et quand même la meilleure note.'],
      ['Dans quelle classe l’étendue des notes est-elle la plus grande ?', 'La moyenne ne dit rien sur la plus grande et la plus petite note : elle ne permet pas de connaître l’étendue.'],
    ]);
    return choix({
      consigne,
      enonce: `Classe A : moyenne ${ecrire(mA)}. Classe B : moyenne ${ecrire(mB)}. ${question}`,
      reponse: CLASSES[2],
      choix: CLASSES,
      explication: `${pourquoi}<br><b>On ne peut pas savoir.</b>`,
    });
  }

  // La note qu'il faut pour avoir une moyenne donnée
  function questionRetrouverNote() {
    const p = parmi(ENFANTS);
    for (;;) {
      const n = parmi([3, 4]);
      const notes = Array.from({ length: n }, () => entier(7, 18));
      const M = entier(10, 15);
      const x = M * (n + 1) - additionner(notes);
      if (x < 5 || x > 20) continue;
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${p.nom} a eu les notes ${liste(notes)} à ses ${ecrire(n)} premiers contrôles. `
          + `Quelle note doit-${p.il} avoir au ${rang(n + 1)} contrôle pour avoir exactement ${ecrire(M)} de moyenne ?`,
        reponse: x,
        explication: `Pour ${ecrire(M)} de moyenne sur ${ecrire(n + 1)} contrôles, il faut ${ecrire(M)} × ${ecrire(n + 1)} = ${ecrire(M * (n + 1))} points en tout.<br>`
          + `${p.nom} a déjà ${somme(notes)} = ${ecrire(additionner(notes))} points : il lui faut ${ecrire(M * (n + 1))} − ${ecrire(additionner(notes))} = <b>${ecrire(x)}</b>.`,
      });
    }
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_STATS = [
    ['Si on ajoute 2 points à toutes les notes, la moyenne augmente de 2 points.',
      'Si on ajoute 2 points à toutes les notes, l’étendue augmente de 2 points.',
      'Toutes les notes montent de 2 : la moyenne et la médiane aussi. Mais l’écart entre la plus grande et la plus petite ne change pas : <b>l’étendue reste la même</b>.'],
    ['L’étendue est la différence entre la plus grande et la plus petite valeur.',
      'L’étendue est la différence entre la dernière et la première valeur de la liste.',
      'On prend la <b>plus grande</b> et la <b>plus petite</b> valeur, où qu’elles soient dans la liste.'],
    ['Dans toute série, au moins la moitié des valeurs sont inférieures ou égales à la médiane.',
      'Dans toute série, au moins la moitié des valeurs sont inférieures ou égales à la moyenne.',
      `C’est vrai pour la <b>médiane</b> (elle partage la série en deux). Pas pour la moyenne : dans 1&nbsp;; 10&nbsp;; 10&nbsp;; 10&nbsp;; 10, la moyenne est ${ecrire(8.2)} et une seule valeur est en dessous.`],
  ];

  function vraiFauxStatistiques() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['regle', 'regle', 'etendue', 'mediane']);
    if (forme === 'regle') {
      const [juste, faux, pourquoi] = parmi(REGLES_STATS);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    const valeurs = serie(parmi([5, 6, 7]), 2, 20);
    const tri = croissant(valeurs);
    if (forme === 'etendue') {
      const e = tri[tri.length - 1] - tri[0];
      const faux = parmi([valeurs[valeurs.length - 1] - valeurs[0], tri[tri.length - 1]].filter(v => v > 0 && v !== e));
      return vraiFaux({
        enonce: `L’étendue de la série ${liste(valeurs)} est ${ecrire(vrai || faux === undefined ? e : faux)}.`,
        vrai: vrai || faux === undefined,
        explication: `La plus grande valeur moins la plus petite : ${ecrire(tri[tri.length - 1])} − ${ecrire(tri[0])} = <b>${ecrire(e)}</b>.`,
      });
    }
    const med = mediane(valeurs);
    const faux = milieuSansRanger(valeurs);
    const juste = vrai || faux === med;
    return vraiFaux({
      enonce: `La médiane de la série ${liste(valeurs)} est ${ecrire(juste ? med : faux)}.`,
      vrai: juste,
      explication: expliquerMediane(valeurs),
    });
  }

  ajouterEtape({
    id: '3e-donnees-statistiques',
    banque: ['etendue', 'etendue', 'etendue', 'mediane', 'mediane', 'medianeCourte', 'medianeCourte', 'moyenne', 'moyenneChoix',
      'effectifs', 'comparer', 'retrouver', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'etendue') return questionEtendue();
      if (sorte === 'mediane') return questionMediane();
      if (sorte === 'medianeCourte') return questionMedianeCourte();
      if (sorte === 'moyenne') return questionMoyennePonderee(false);
      if (sorte === 'moyenneChoix') return questionMoyennePonderee(true);
      if (sorte === 'effectifs') return questionMedianeEffectifs();
      if (sorte === 'comparer') return questionComparer();
      if (sorte === 'retrouver') return questionRetrouverNote();
      return vraiFauxStatistiques();
    },
    titreLecon: 'Les statistiques',
    lecon: `
      <h4>La moyenne</h4>
      <p><b>Moyenne = somme des valeurs ÷ effectif total.</b> Avec un tableau d’effectifs, on multiplie chaque valeur par son effectif :</p>
      ${tableau([['Note', 8, 12, 15], ['Effectif', 2, 5, 3]])}
      <p><i>(8 × 2 + 12 × 5 + 15 × 3) ÷ (2 + 5 + 3) = 121 ÷ 10 = 12,1.</i></p>
      <h4>La médiane</h4>
      <p>On <b>range</b> la série. La médiane la partage en deux groupes de même effectif : au moins la moitié des valeurs
        sont inférieures ou égales à la médiane, et au moins la moitié supérieures ou égales.
        Effectif impair : c’est la valeur du milieu. Effectif pair : la moyenne des deux valeurs du milieu.
        <i>3&nbsp;; 7&nbsp;; 8&nbsp;; 11&nbsp;; 12&nbsp;; 15 → (8 + 11) ÷ 2 = 9,5.</i> Avec des effectifs, on les cumule : <i>25 valeurs → la 13<sup>e</sup>.</i></p>
      <h4>L’étendue</h4>
      <p><b>Étendue = la plus grande valeur − la plus petite.</b> Elle mesure la <b>dispersion</b> : plus elle est petite,
        plus les valeurs sont regroupées. <i>Températures ${MOINS}3&nbsp;; 2&nbsp;; 5&nbsp;°C : 5 − (${MOINS}3) = 8&nbsp;°C.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> si on ajoute 2 points à chaque note, la moyenne et la médiane augmentent de 2,
        mais l’étendue ne change pas.</div>
      <p>⚠️ Range toujours la série avant de chercher la médiane ou l’étendue !</p>
    `,
  });

  // ======================================================================
  // 5. Les probabilités : deux épreuves
  // ======================================================================
  // Une fraction simplifiée, pour les boutons : « 3/10 »
  const fractionSimple = (n, d) => fracTexte(...simplifier(n, d));
  // « 6/36 = 1/6 » : la fraction, et sa forme simplifiée si elle existe
  function fractionEtSimplifiee(n, d) {
    const [a, b] = simplifier(n, d);
    return `${frac(n, d)}${b !== d ? ` = ${frac(a, b)}` : ''}`;
  }
  // Des fractions pour les boutons : simplifiées, entre 0 et 1, jamais deux de même valeur, jamais égales à la réponse
  function piegesFractions([n, d], candidats) {
    const vues = [n / d];
    const pieges = [];
    candidats.forEach(([a, b]) => {
      if (!(a > 0 && b > 0 && a < b) || vues.some(v => egaux(v, a / b))) return;
      vues.push(a / b);
      pieges.push(fractionSimple(a, b));
    });
    return pieges;
  }
  // Une probabilité écrite en fraction, pour le texte d'un arbre (« 3/5 »)
  const surBranche = (n, d) => `${n}/${d}`;

  // Un arbre à deux niveaux, couché : la racine à gauche, les issues à droite.
  // branches : [{ nom, p, suite: [{ nom, p }] }] (p : la probabilité écrite sur la branche, ou '')
  function arbre(branches, { issues = true } = {}) {
    const feuilles = additionner(branches.map(b => b.suite.length));
    const pas = feuilles <= 4 ? 52 : feuilles <= 6 ? 42 : 30;
    const hauteur = feuilles * pas + 12;
    const [xRacine, x1, x2, x3] = [16, 140, 270, 300];
    const yRacine = hauteur / 2;
    // la probabilité : au milieu de la branche, au-dessus si elle monte, en dessous si elle descend
    // (pour qu'on ne puisse pas la lire sur la branche voisine)
    const proba = (A, B, texte) => {
      const [dx, dy] = [B[0] - A[0], B[1] - A[1]];
      const l = Math.hypot(dx, dy);
      const sens = dy > 0 ? -1 : 1;
      const m = [(A[0] + B[0]) / 2 + sens * dy / l * 13, (A[1] + B[1]) / 2 - sens * dx / l * 13];
      return figures.texte(m, texte, { classe: 'fig-petit' });
    };
    const branche = (A, B, p) => figures.segment(A, B, 'fig-marque') + (p ? proba(A, B, p) : '');
    let html = '';
    let k = 0;
    branches.forEach(b => {
      const ys = b.suite.map(() => 6 + pas * (k++ + 0.5));
      const y1 = (ys[0] + ys[ys.length - 1]) / 2;
      html += branche([xRacine, yRacine], [x1 - 14, y1], b.p) + figures.texte([x1, y1], b.nom);
      b.suite.forEach((s, i) => {
        html += branche([x1 + 14, y1], [x2 - 14, ys[i]], s.p) + figures.texte([x2, ys[i]], s.nom);
        if (issues) html += figures.texte([x3, ys[i]], `(${b.nom} ; ${s.nom})`, { classe: 'fig-petit', ancre: 'start' });
      });
    });
    return figures.svg(390, hauteur, html, 'Un arbre de probabilités');
  }

  // Compter les issues d'une expérience à deux épreuves
  function questionNombreIssues(avecBoutons) {
    const n = entier(4, 7);
    const [e, d] = [entier(2, 4), entier(3, 5)];
    const S = parmi([
      { texte: 'On lance deux pièces de monnaie, l’une après l’autre.', issues: 4, calcul: '2 × 2 = 4 (PP, PF, FP et FF)', faux: [3, 2],
        attention: 'PF et FP sont deux issues différentes : la première pièce n’est pas la deuxième.' },
      { texte: 'On lance deux dés à 6 faces, un rouge et un bleu.', issues: 36, calcul: '6 × 6 = 36', faux: [12, 21, 11],
        attention: 'Ce n’est pas 6 + 6 = 12 : chacun des 6 résultats du dé rouge va avec les 6 résultats du dé bleu.' },
      { texte: 'On lance une pièce, puis un dé à 6 faces.', issues: 12, calcul: '2 × 6 = 12', faux: [8, 6],
        attention: 'Ce n’est pas 2 + 6 = 8 : chaque côté de la pièce va avec les 6 faces du dé.' },
      { texte: `Une urne contient ${ecrire(n)} boules numérotées de 1 à ${ecrire(n)}. On tire une boule, on la remet, puis on en tire une deuxième.`,
        issues: n * n, calcul: `${ecrire(n)} × ${ecrire(n)} = ${ecrire(n * n)}`, faux: [2 * n, n * (n - 1)],
        attention: `La boule est remise : au 2<sup>e</sup> tirage, il y a encore ${ecrire(n)} boules.` },
      { texte: `Une urne contient ${ecrire(n)} boules numérotées de 1 à ${ecrire(n)}. On tire une boule, on la garde, puis on en tire une deuxième.`,
        issues: n * (n - 1), calcul: `${ecrire(n)} × ${ecrire(n - 1)} = ${ecrire(n * (n - 1))}`, faux: [n * n, 2 * n - 1, n * (n - 1) / 2],
        attention: `La boule n’est pas remise : au 2<sup>e</sup> tirage, il ne reste que ${ecrire(n - 1)} boules.` },
      { texte: 'On fait tourner deux fois une roue partagée en 3 secteurs : rouge, bleu et vert.', issues: 9, calcul: '3 × 3 = 9', faux: [6, 3],
        attention: 'Ce n’est pas 3 + 3 = 6 : chaque couleur du 1<sup>er</sup> tour va avec les 3 couleurs du 2<sup>e</sup>.' },
      { texte: `À la cantine, on choisit une entrée parmi ${ecrire(e)} et un dessert parmi ${ecrire(d)}.`, question: 'Combien de menus différents peut-on composer ?',
        issues: e * d, calcul: `${ecrire(e)} × ${ecrire(d)} = ${ecrire(e * d)}`, mot: 'menus', faux: [e + d],
        attention: `Ce n’est pas ${ecrire(e)} + ${ecrire(d)} = ${ecrire(e + d)} : chaque entrée va avec les ${ecrire(d)} desserts.` },
    ]);
    const q = {
      consigne: 'Compte les issues',
      enonce: `${S.texte} ${S.question || 'Combien y a-t-il d’issues possibles ?'}`,
      reponse: S.issues,
      explication: `Avec un arbre : ${S.calcul}. Il y a <b>${ecrire(S.issues)} ${S.mot || 'issues'}</b>.<br>⚠️ ${S.attention}`,
    };
    // (les erreurs, additionner ou oublier l'ordre, donnent presque toujours moins : on mélange les boutons)
    // (avec une seule erreur possible, on écrit le nombre : pas de question à deux boutons)
    return avecBoutons && S.faux.length >= 2 ? choix({ ...q, pieges: S.faux, ordre: 'melange' }) : nombre(q);
  }

  // Deux pièces : les 4 issues PP, PF, FP, FF ont la même chance
  const TROIS_ISSUES = 'Il n’y a pas 3 issues (deux « pile », deux « face », une de chaque) : PF et FP sont deux issues différentes.';
  const EVENEMENTS_PIECES = [
    { texte: 'd’obtenir deux fois « pile »', issues: ['PP'], faux: [[1, 3], [1, 2], [3, 4]], piege: [1, 3], attention: TROIS_ISSUES },
    { texte: 'd’obtenir deux fois « face »', issues: ['FF'], faux: [[1, 3], [1, 2], [3, 4]], piege: [1, 3], attention: TROIS_ISSUES },
    { texte: 'd’obtenir deux fois la même face', issues: ['PP', 'FF'], faux: [[1, 4], [2, 3], [3, 4]], piege: [2, 3], attention: TROIS_ISSUES },
    { texte: 'd’avoir un « pile » et un « face »', issues: ['PF', 'FP'], faux: [[1, 4], [1, 3], [3, 4]], piege: [1, 4],
      attention: 'Il y a deux façons d’avoir un « pile » et un « face » : PF et FP.' },
    { texte: 'd’obtenir au moins un « pile »', issues: ['PP', 'PF', 'FP'], faux: [[1, 2], [2, 3], [1, 4]], piege: [2, 3], attention: TROIS_ISSUES },
    { texte: 'de n’obtenir aucun « pile »', issues: ['FF'], faux: [[1, 3], [1, 2], [3, 4]], piege: [1, 3], attention: TROIS_ISSUES },
  ];

  function questionDeuxPieces() {
    const E = parmi(EVENEMENTS_PIECES);
    const k = E.issues.length;
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `On lance deux pièces. Quelle est la probabilité ${E.texte} ?`,
      reponse: fractionSimple(k, 4),
      pieges: piegesFractions([k, 4], E.faux),
      garder: [fractionSimple(...E.piege)],
      explication: `Les 4 issues PP, PF, FP et FF ont la même chance. ${k > 1 ? `Les issues ${E.issues.join(', ')} conviennent` : `Seule l’issue ${E.issues[0]} convient`} : `
        + `${k} sur 4.<br>La probabilité est <b>${fractionEtSimplifiee(k, 4)}</b>. ⚠️ ${E.attention}`,
    });
  }

  // Deux dés à 6 faces : 36 issues qui ont la même chance
  // Les couples (a ; b) de deux dés qui vérifient une condition
  function couplesDes(condition) {
    const couples = [];
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (condition(a, b)) couples.push([a, b]);
    return couples;
  }
  const ecrireCouples = couples => couples.map(([a, b]) => `(${a}${ESPACE}; ${b})`).join(', ');

  function questionDeuxDes() {
    const sorte = parmi(['somme', 'somme', 'double', 'doubleSix']);
    const consigne = 'Choisis la probabilité';
    const intro = 'On lance deux dés à 6 faces.';
    if (sorte === 'somme') {
      const s = parmi([3, 4, 5, 6, 7, 7, 8, 9, 10, 11]);
      const couples = couplesDes((a, b) => a + b === s);
      const k = couples.length;
      // (sans tenir compte de l'ordre : les paires a ≤ b)
      const sansOrdre = couples.filter(([a, b]) => a <= b).length;
      return choix({
        consigne,
        enonce: `${intro} Quelle est la probabilité que la somme soit égale à ${s} ?`,
        reponse: fractionSimple(k, 36),
        pieges: piegesFractions([k, 36], [[1, 11], [1, 36], [sansOrdre, 21], [1, 12]]),
        garder: [fracTexte(1, 11)],
        explication: `Il y a 6 × 6 = 36 issues de même chance. La somme ${s} : ${ecrireCouples(couples)}, soit ${combien(k, 'issue')}.<br>`
          + `P = <b>${fractionEtSimplifiee(k, 36)}</b>. ⚠️ Les 11 sommes de 2 à 12 n’ont pas la même chance : pas ${frac(1, 11)}.`,
      });
    }
    if (sorte === 'double') {
      return choix({
        consigne,
        enonce: `${intro} Quelle est la probabilité d’obtenir un double ?`,
        reponse: fracTexte(1, 6),
        pieges: piegesFractions([1, 6], [[1, 36], [6, 21], [1, 2], [1, 12]]),
        garder: [fracTexte(1, 36)],
        explication: 'Il y a 36 issues de même chance, dont 6 doubles (deux fois le même nombre) : (1&nbsp;; 1), (2&nbsp;; 2)… (6&nbsp;; 6).<br>'
          + `P = <b>${fractionEtSimplifiee(6, 36)}</b>. ⚠️ ${frac(1, 36)}, c’est la probabilité d’un seul double, par exemple (6&nbsp;; 6).`,
      });
    }
    return choix({
      consigne,
      enonce: `${intro} Quelle est la probabilité d’obtenir deux 6 ?`,
      reponse: fracTexte(1, 36),
      pieges: piegesFractions([1, 36], [[1, 6], [1, 3], [1, 12], [1, 21]]),
      garder: [fracTexte(1, 3)],
      explication: `Le long du chemin « 6 puis 6 », on multiplie : ${frac(1, 6)} × ${frac(1, 6)} = <b>${frac(1, 36)}</b> (une issue sur 36).`
        + `<br>⚠️ Pas ${frac(1, 6)} + ${frac(1, 6)} = ${frac(1, 3)} : ce serait plus que la chance d’avoir un 6 avec un seul dé, impossible !`,
    });
  }

  // Une pièce puis un dé : 2 × 6 = 12 issues
  function questionPieceDe() {
    const [texte, k, faces] = parmi([['« pile » et 6', 1, '6'], ['« face » et un nombre pair', 3, '2, 4 ou 6'],
      ['« pile » et un nombre plus grand que 4', 2, '5 ou 6'], ['« face » et 1', 1, '1']]);
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `On lance une pièce puis un dé à 6 faces. Quelle est la probabilité d’avoir ${texte} ?`,
      reponse: fractionSimple(k, 12),
      // 2 + 6 issues au lieu de 2 × 6, la pièce seule, le dé seul, additionner au lieu de multiplier
      pieges: piegesFractions([k, 12], [[k, 8], [1, 2], [k, 6], [3 + k, 6]]),
      garder: [fractionSimple(k, 8)],
      explication: `Avec un arbre : 2 × 6 = 12 issues de même chance, dont ${combien(k, 'issue')} (${texte.replace(/ et .*/, '')} puis ${faces}).<br>`
        + `P = ${fractionEtSimplifiee(k, 12)}. Ou : ${frac(1, 2)} × ${frac(k, 6)} = <b>${frac(...simplifier(k, 12))}</b>. ⚠️ Il y a 2 × 6 = 12 issues, pas 2 + 6 = 8.`,
    });
  }

  // Deux dés : une probabilité à écrire en fraction
  function questionEvenementDes() {
    const [texte, condition, detail] = parmi([
      ['la somme soit égale à 8', (a, b) => a + b === 8, null],
      ['la somme soit égale à 5', (a, b) => a + b === 5, null],
      ['la somme soit supérieure ou égale à 10', (a, b) => a + b >= 10, null],
      ['le produit des deux nombres soit 12', (a, b) => a * b === 12, null],
      ['les deux nombres soient plus grands que 4', (a, b) => a > 4 && b > 4, null],
      ['la somme soit paire', (a, b) => (a + b) % 2 === 0,
        'les deux nombres sont pairs (3 × 3 = 9 issues) ou tous les deux impairs (3 × 3 = 9 issues) : 18 issues'],
    ]);
    const couples = couplesDes(condition);
    const k = couples.length;
    // (toute fraction égale est acceptée ; la solution affichée est la plus simple)
    // (detail : l'explication quand il y a trop d'issues pour les écrire toutes)
    const [n, d] = simplifier(k, 36);
    return fraction({
      consigne: 'Écris la probabilité sous forme de fraction',
      enonce: `On lance deux dés à 6 faces. Quelle est la probabilité que ${texte} ?`,
      n,
      d,
      irreductible: false,
      explication: `Il y a 6 × 6 = 36 issues de même chance. ${detail ? `La somme est paire si ${detail}.`
        : `Les issues qui conviennent : ${ecrireCouples(couples)}, soit ${ecrire(k)}.`}<br>P = <b>${fractionEtSimplifiee(k, 36)}</b>.`,
    });
  }

  // Deux tirages dans un sac, avec ou sans remise (un arbre avec les probabilités)
  const COULEURS = [['rouge', 'rouges', 'R'], ['bleue', 'bleues', 'B'], ['verte', 'vertes', 'V'], ['jaune', 'jaunes', 'J']];
  function tirages(remise, r, b) {
    const n = r + b;
    const d2 = remise ? n : n - 1;
    return {
      n, d2, den: n * d2,
      // les deux tirages de la même couleur, et un chemin « une de chaque » (C1 puis C2, ou C2 puis C1)
      C1C1: r * (remise ? r : r - 1), C2C2: b * (remise ? b : b - 1), C1C2: r * b,
      r2: remise ? r : r - 1, b2: remise ? b : b - 1,
    };
  }

  function questionUrne(avecBoutons) {
    const [C1, C2] = RM.melanger(COULEURS).slice(0, 2);
    let r;
    let b;
    do { r = entier(2, 5); b = entier(2, 4); } while (r === b);
    const remise = Math.random() < 0.5;
    const T = tirages(remise, r, b);
    const A = tirages(!remise, r, b);  // l'autre façon de tirer (le piège avec/sans remise)
    const sorte = parmi(['deux1', 'deux2', 'mixte', 'auMoins']);
    let texte;
    let fav;
    let calcul;
    let candidats;
    let garder = null;
    let attention = '';
    if (sorte === 'deux1' || sorte === 'deux2') {
      const [C, c, c2, favC, favA] = sorte === 'deux1' ? [C1, r, T.r2, T.C1C1, A.C1C1] : [C2, b, T.b2, T.C2C2, A.C2C2];
      texte = `deux boules ${C[1]}`;
      fav = favC;
      calcul = `On multiplie le long du chemin ${C[2]}${C[2]} : ${frac(c, T.n)} × ${frac(c2, T.d2)} = <b>${fractionEtSimplifiee(fav, T.den)}</b>.`;
      // additionner au lieu de multiplier, un seul tirage, multiplier en haut et additionner en bas, l'autre sorte de tirage
      const addition = [c * T.d2 + c2 * T.n, T.den];
      candidats = [addition, [c, T.n], [c * c2, T.n + T.d2], [favA, A.den]];
      if (addition[0] < addition[1]) {
        garder = addition;
        attention = `⚠️ Le long d’un chemin, on multiplie : pas ${frac(c, T.n)} + ${frac(c2, T.d2)}.`;
      }
    } else if (sorte === 'mixte') {
      texte = 'une boule de chaque couleur';
      fav = 2 * T.C1C2;
      calcul = `Deux chemins : ${C1[2]}${C2[2]} donne ${frac(r, T.n)} × ${frac(b, T.d2)} = ${frac(T.C1C2, T.den)} et ${C2[2]}${C1[2]} donne `
        + `${frac(b, T.n)} × ${frac(r, T.d2)} = ${frac(T.C1C2, T.den)}.<br>On additionne : <b>${fractionEtSimplifiee(fav, T.den)}</b>.`;
      candidats = [[T.C1C2, T.den], [1, 2], [2 * A.C1C2, A.den]];
      garder = [T.C1C2, T.den];
      attention = `⚠️ N’oublie pas le chemin ${C2[2]}${C1[2]} : l’ordre des couleurs peut changer.`;
    } else {
      texte = `au moins une boule ${C1[0]}`;
      fav = T.den - T.C2C2;
      calcul = `C’est le contraire de « deux boules ${C2[1]} » : ${frac(b, T.n)} × ${frac(T.b2, T.d2)} = ${frac(T.C2C2, T.den)}.<br>`
        + `1 − ${frac(T.C2C2, T.den)} = <b>${fractionEtSimplifiee(fav, T.den)}</b>.`;
      // un seul tirage, deux boules de cette couleur, exactement une, l'autre sorte de tirage
      candidats = [[r, T.n], [T.C1C1, T.den], [2 * T.C1C2, T.den], [A.den - A.C2C2, A.den]];
    }
    const avecArbre = !avecBoutons || Math.random() < 0.7;
    const figure = avecArbre ? arbre([
      { nom: C1[2], p: surBranche(r, T.n), suite: [{ nom: C1[2], p: surBranche(T.r2, T.d2) }, { nom: C2[2], p: surBranche(b, T.d2) }] },
      { nom: C2[2], p: surBranche(b, T.n), suite: [{ nom: C1[2], p: surBranche(r, T.d2) }, { nom: C2[2], p: surBranche(T.b2, T.d2) }] },
    ], { issues: false }) : '';
    const enonce = `Un sac contient ${ecrire(r)} boules ${C1[1]} (${C1[2]}) et ${ecrire(b)} boules ${C2[1]} (${C2[2]}). On tire une boule au hasard, `
      + `on ${remise ? 'la remet dans le sac' : 'la garde'}, puis on en tire une deuxième.${avecArbre ? ` Voici l’arbre de l’expérience.${figure}` : ' '}`
      + `Quelle est la probabilité d’obtenir ${texte} ?`;
    if (!avecBoutons) {
      const [n, d] = simplifier(fav, T.den);
      return fraction({ consigne: 'Écris la probabilité sous forme de fraction', enonce, n, d, irreductible: false, explication: calcul });
    }
    return choix({
      consigne: 'Choisis la probabilité',
      enonce,
      reponse: fractionSimple(fav, T.den),
      pieges: piegesFractions([fav, T.den], candidats),
      garder: garder ? [fractionSimple(...garder)] : [],
      explication: `${calcul}${attention ? `<br>${attention}` : ''}`,
    });
  }

  // Un arbre sans probabilités : deux tirages dans une urne de 3 boules numérotées, on compte les issues
  function questionArbreNumeros() {
    const remise = Math.random() < 0.5;
    const nums = [1, 2, 3];
    const toutes = [];
    nums.forEach(a => nums.forEach(b => { if (remise || a !== b) toutes.push([a, b]); }));
    const N = toutes.length;
    const EVENEMENTS = [
      ['la somme des deux numéros soit égale à 4', ([a, b]) => a + b === 4],
      ['la somme des deux numéros soit égale à 5', ([a, b]) => a + b === 5],
      ['le premier numéro soit plus grand que le second', ([a, b]) => a > b],
      ['l’on obtienne au moins un 3', ([a, b]) => a === 3 || b === 3],
      ['la somme des deux numéros soit paire', ([a, b]) => (a + b) % 2 === 0],
      ['les deux numéros soient égaux', ([a, b]) => a === b],
    ].filter(([, c]) => toutes.some(c) && !toutes.every(c));
    const [texte, condition] = parmi(EVENEMENTS);
    const bonnes = toutes.filter(condition);
    const k = bonnes.length;
    const figure = arbre(nums.map(a => ({ nom: String(a), p: '', suite: nums.filter(b => remise || b !== a).map(b => ({ nom: String(b), p: '' })) })));
    // oublier une issue, compter le contraire, l'autre sorte de tirage (9 issues ou 6)
    const autreN = remise ? 6 : 9;
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `Une urne contient trois boules numérotées 1, 2 et 3. On tire une boule, on ${remise ? 'la remet' : 'la garde'}, `
        + `puis on en tire une deuxième. Voici l’arbre.${figure}Quelle est la probabilité que ${texte} ?`,
      reponse: fractionSimple(k, N),
      pieges: piegesFractions([k, N], [[k - 1, N], [N - k, N], [k, autreN], [1, N]]),
      explication: `L’arbre donne ${ecrire(N)} issues de même chance. Celles qui conviennent : ${bonnes.map(([a, b]) => `(${a}${ESPACE}; ${b})`).join(', ')}, `
        + `soit ${ecrire(k)}.<br>P = <b>${fractionEtSimplifiee(k, N)}</b>.${remise ? '' : ' (La boule n’est pas remise : pas de (1&nbsp;; 1), (2&nbsp;; 2) ni (3&nbsp;; 3).)'}`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_PROBAS = [
    ['Sur un arbre, on multiplie les probabilités le long d’un chemin.', 'Sur un arbre, on additionne les probabilités le long d’un chemin.',
      `Le long d’un chemin, on <b>multiplie</b> : ${frac(1, 2)} × ${frac(1, 2)} = ${frac(1, 4)} pour « deux fois pile ». On additionne les probabilités de chemins différents.`],
    ['Sur un arbre, les probabilités des branches qui partent d’un même point ont pour somme 1.',
      'Sur un arbre, les probabilités des branches qui partent d’un même point ont pour produit 1.',
      'Les branches qui partent d’un même point donnent toutes les possibilités : leurs probabilités ont pour <b>somme 1</b>.'],
    ['Avec deux dés, la somme 7 est plus probable que la somme 12.', 'Avec deux dés, toutes les sommes de 2 à 12 ont la même probabilité.',
      'La somme 7 s’obtient de 6 façons sur 36, la somme 12 d’une seule façon, (6&nbsp;; 6) : les sommes n’ont <b>pas</b> la même chance.'],
    [`Quand on lance deux pièces, la probabilité d’obtenir deux fois « face » est ${frac(1, 4)}.`,
      `Quand on lance deux pièces, la probabilité d’obtenir deux fois « face » est ${frac(1, 3)}.`,
      `Il y a 4 issues de même chance : PP, PF, FP et FF. Une seule donne deux « face » : <b>${frac(1, 4)}</b>.`],
  ];

  function vraiFauxProbas() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.6) {
      const [juste, faux, pourquoi] = parmi(REGLES_PROBAS);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    // Avec ou sans remise : la bonne probabilité, ou celle de l'autre sorte de tirage
    const [C] = RM.melanger(COULEURS);
    let r;
    let b;
    do { r = entier(2, 5); b = entier(2, 4); } while (r === b);
    const remise = Math.random() < 0.5;
    const T = tirages(remise, r, b);
    const A = tirages(!remise, r, b);
    const [n, d] = vrai ? simplifier(T.C1C1, T.den) : simplifier(A.C1C1, A.den);
    return vraiFaux({
      enonce: `Un sac contient ${ecrire(r)} boules ${C[1]} et ${ecrire(b)} autres boules. On tire deux boules, ${remise ? 'avec' : 'sans'} remise. `
        + `La probabilité d’obtenir deux boules ${C[1]} est ${frac(n, d)}.`,
      vrai,
      explication: `${remise ? 'Avec' : 'Sans'} remise, il y a ${combien(T.d2, 'boule')} au 2<sup>e</sup> tirage : `
        + `${frac(r, T.n)} × ${frac(T.r2, T.d2)} = <b>${fractionEtSimplifiee(T.C1C1, T.den)}</b>.`,
    });
  }

  ajouterEtape({
    id: '3e-donnees-probabilites',
    banque: ['issues', 'issues', 'pieces', 'pieces', 'des', 'des', 'pieceDe', 'evenementDes', 'evenementDes', 'urne', 'urne',
      'urneFraction', 'numeros', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'issues') return questionNombreIssues(Math.random() < 0.5);
      if (sorte === 'pieces') return questionDeuxPieces();
      if (sorte === 'des') return questionDeuxDes();
      if (sorte === 'pieceDe') return questionPieceDe();
      if (sorte === 'evenementDes') return questionEvenementDes();
      if (sorte === 'urne') return questionUrne(true);
      if (sorte === 'urneFraction') return questionUrne(false);
      if (sorte === 'numeros') return questionArbreNumeros();
      return vraiFauxProbas();
    },
    titreLecon: 'Les probabilités',
    lecon: `
      <p>Dans cette étape, les pièces et les dés sont <b>équilibrés</b> : chaque face a la même chance de sortir.</p>
      <h4>Deux épreuves : un arbre</h4>
      <p>On lance deux pièces. L’arbre donne les <b>2 × 2 = 4 issues</b>, qui ont la même chance :</p>
      ${arbre([{ nom: 'P', p: '1/2', suite: [{ nom: 'P', p: '1/2' }, { nom: 'F', p: '1/2' }] }, { nom: 'F', p: '1/2', suite: [{ nom: 'P', p: '1/2' }, { nom: 'F', p: '1/2' }] }])}
      <p>👉 Deux fois « pile » : 1 issue sur 4, ${frac(1, 4)}. Une fois « pile » et une fois « face » : PF et FP, ${frac(2, 4)} = ${frac(1, 2)}.</p>
      <h4>Des issues de même chance</h4>
      <p><b>P = nombre d’issues favorables ÷ nombre d’issues.</b> <i>Deux dés : 6 × 6 = 36 issues. La somme 7 :
        (1&nbsp;; 6), (2&nbsp;; 5), (3&nbsp;; 4), (4&nbsp;; 3), (5&nbsp;; 2), (6&nbsp;; 1) → ${frac(6, 36)} = ${frac(1, 6)}.</i>
        Un <b>double</b>, c’est deux fois le même nombre.</p>
      <h4>Un arbre avec des probabilités</h4>
      <p>On <b>multiplie</b> les probabilités le long d’un chemin, et on <b>additionne</b> les chemins qui conviennent.
        <i>Un sac de 3 boules rouges et 2 bleues, deux tirages avec remise : P(deux rouges) = ${frac(3, 5)} × ${frac(3, 5)} = ${frac(9, 25)}.</i>
        Sans remise, il reste une boule de moins au 2<sup>e</sup> tirage : ${frac(3, 5)} × ${frac(2, 4)} = ${frac(6, 20)} = ${frac(3, 10)}.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour « au moins une rouge », calcule le contraire : 1 − P(aucune rouge).</div>
      <p>⚠️ PF et FP sont deux issues différentes, et les sommes de deux dés n’ont pas toutes la même chance !</p>
    `,
  });

  // ======================================================================
  // 6. Les évolutions en pourcentage
  // ======================================================================
  // Le coefficient multiplicateur : + t % → × (1 + t/100) ; − t % → × (1 − t/100)
  const coefficientDe = (t, hausse) => net(hausse ? 1 + t / 100 : 1 - t / 100);
  const fois = c => `×${ESPACE}${ecrire(c)}`;
  const evolution = (hausse, t) => `${hausse ? 'hausse' : 'baisse'} de ${pc(t)}`;
  // Une évolution globale en % (positive : une hausse, négative : une baisse)
  const evolutionGlobale = g => (g === 0 ? 'aucun changement' : evolution(g > 0, Math.abs(g)));
  const regle = (t, hausse) => `${hausse ? 'Augmenter' : 'Baisser'} de ${pc(t)}, c’est multiplier par `
    + `1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} = ${ecrire(coefficientDe(t, hausse))}`;
  const verbe = hausse => (hausse ? 'augmente' : 'baisse');
  // Des articles et leurs prix possibles
  const ARTICLES = [
    ['un vélo', [150, 200, 250, 300]], ['un sac à dos', [30, 40, 50, 60]], ['un jeu de société', [20, 30, 40, 50]],
    ['une paire de baskets', [60, 80, 90, 100]], ['un casque audio', [40, 50, 80, 100]],
  ];

  function questionCoefficient() {
    const hausse = Math.random() < 0.5;
    // (pas de baisse de 50 % : × 0,5 serait à la fois la baisse et le nouveau prix, l'erreur expliquée n'en serait pas une)
    const t = parmi(hausse ? [5, 8, 10, 15, 20, 25, 30, 40, 50, 12, 3] : [5, 8, 10, 15, 20, 25, 30, 40, 12, 60, 75]);
    const c = coefficientDe(t, hausse);
    if (Math.random() < 0.55) {
      // Les erreurs : le pourcentage seul, l'autre sens, une virgule mal placée (5 % → × 1,5 ; 20 % → × 1,02)
      const candidats = hausse ? [1 - t / 100, t < 10 ? 1 + t / 10 : 1 + t / 1000] : [1 + t / 100, t < 10 ? 1 - t / 10 : 1 - t / 1000];
      return choix({
        consigne: 'Choisis le coefficient multiplicateur',
        enonce: `${hausse ? 'Augmenter' : 'Baisser'} un prix de ${pc(t)}, c’est le multiplier par…`,
        reponse: fois(c),
        pieges: positifs(candidats).map(fois),
        garder: [fois(t / 100)],
        explication: `${regle(t, hausse)}.<br>⚠️ ${fois(t / 100)} donne seulement ${hausse ? 'l’augmentation' : 'la baisse'} (${pc(t)} du prix), pas le nouveau prix.`,
      });
    }
    // Dans l'autre sens. Les erreurs : l'autre sens, lire le coefficient comme un pourcentage (× 0,85 → 85 % ; × 1,2 → 120 % ou 1,2 %)
    return choix({
      consigne: 'Traduis le coefficient',
      enonce: `Multiplier un prix par ${ecrire(c)}, c’est lui appliquer une…`,
      reponse: evolution(hausse, t),
      pieges: hausse ? [evolution(false, t), evolution(true, 100 + t), evolution(true, c)] : [evolution(true, t), evolution(false, 100 - t), evolution(false, c)],
      explication: `${ecrire(c)} = 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} : c’est une <b>${evolution(hausse, t)}</b>.<br>`
        + (hausse ? 'Un coefficient plus grand que 1 fait augmenter.' : 'Un coefficient plus petit que 1 fait diminuer.'),
    });
  }

  // Deux évolutions de suite : on multiplie les coefficients
  function deuxEvolutions() {
    for (;;) {
      const e1 = { hausse: Math.random() < 0.6, t: parmi([10, 20, 25, 30, 40, 50]) };
      const e2 = { hausse: Math.random() < 0.5, t: parmi([5, 10, 20, 25, 30, 40, 50]) };
      const [c1, c2] = [coefficientDe(e1.t, e1.hausse), coefficientDe(e2.t, e2.hausse)];
      const C = net(c1 * c2);
      const g = net((C - 1) * 100);
      // (l'erreur classique : ajouter les pourcentages)
      const additif = (e1.hausse ? e1.t : -e1.t) + (e2.hausse ? e2.t : -e2.t);
      if (auDixieme(g) && g !== additif && additif > -100) return { e1, e2, c1, c2, C, g, additif };
    }
  }
  const phraseDeux = E => `${verbe(E.e1.hausse)} de ${pc(E.e1.t)}, puis ${verbe(E.e2.hausse)} de ${pc(E.e2.t)}`;
  const calculDeux = E => `${ecrire(E.c1)} × ${ecrire(E.c2)} = ${ecrire(E.C)}`;

  function questionSuccessives() {
    const E = deuxEvolutions();
    const faux = net(1 + E.additif / 100);
    const memeSens = E.e1.hausse === E.e2.hausse;
    if (Math.random() < 0.35) {
      return choix({
        consigne: 'Trouve le coefficient global',
        enonce: `Un prix ${phraseDeux(E)}. Par combien est-il multiplié en tout ?`,
        reponse: fois(E.C),
        // oublier une des deux évolutions ; et, si elles vont en sens contraires, se tromper de sens
        pieges: positifs([E.c1, E.c2, ...(memeSens ? [] : [2 - E.C])]).map(fois),
        garder: [fois(faux)],
        explication: `On multiplie les coefficients : ${calculDeux(E)}. Le prix est multiplié par <b>${ecrire(E.C)}</b>.`
          + `<br>⚠️ Les pourcentages ne s’ajoutent pas : pas ${fois(faux)}.`,
      });
    }
    // le coefficient lu comme un pourcentage (1,08 → 108 %) ; s'il vaut 1, les deux pourcentages ajoutés sans leur signe
    const lu = E.C === 1 ? evolution(E.e1.hausse, E.e1.t + E.e2.t) : evolution(E.C > 1, net(E.C * 100));
    return choix({
      consigne: 'Trouve l’évolution globale',
      enonce: `Un prix ${phraseDeux(E)}. Quelle est l’évolution globale ?`,
      reponse: evolutionGlobale(E.g),
      // deux évolutions dans le même sens : oublier l'une des deux (jamais « baisse » après deux hausses) ;
      // sinon, l'autre sens (ou, s'il n'y a aucun changement, l'autre sens de l'erreur classique)
      pieges: memeSens ? [evolution(E.e1.hausse, E.e1.t), evolution(E.e2.hausse, E.e2.t), lu]
        : [evolutionGlobale(E.g === 0 ? -E.additif : -E.g), lu],
      garder: [evolutionGlobale(E.additif)],
      explication: `On multiplie les coefficients : ${calculDeux(E)}.<br>`
        + (E.g === 0 ? 'Le prix est multiplié par 1 : il revient à sa valeur de départ, <b>aucun changement</b>.'
          : `${ecrire(E.C)} = 1 ${E.g > 0 ? '+' : '−'} ${ecrire(Math.abs(E.g) / 100)} : c’est une <b>${evolutionGlobale(E.g)}</b>.`)
        + (E.additif === 0 ? '<br>⚠️ Le prix ne revient pas à sa valeur de départ' : `<br>⚠️ Ce n’est pas une ${evolutionGlobale(E.additif)}`)
        + ' : la 2<sup>e</sup> évolution se calcule sur le prix déjà modifié.',
    });
  }

  function questionPrixSuccessif() {
    for (;;) {
      const E = deuxEvolutions();
      const [article, prix] = parmi(ARTICLES);
      const p = parmi(prix);
      const m = net(p * E.c1);
      const r = net(m * E.c2);
      if (!auCentieme(m) || !auCentieme(r)) continue;
      return nombre({
        consigne: 'Calcule le prix final',
        enonce: `${majuscule(article)} coûte ${euros(p)}. Son prix ${phraseDeux(E)}. Quel est son prix final ?`,
        reponse: r,
        prix: true,
        touches: TOUCHES,
        explication: `Après la 1<sup>re</sup> évolution : ${ecrire(p)} × ${ecrire(E.c1)} = ${euros(m)}.<br>`
          + `Après la 2<sup>e</sup> : ${ecrire(m)} × ${ecrire(E.c2)} = <b>${euros(r)}</b>. (Ou d’un coup : ${ecrire(p)} × ${ecrire(E.C)} = ${euros(r)}`
          + `${E.C === 1 ? ' : le prix revient au prix de départ' : ''}.)`,
      });
    }
  }

  // Retrouver le prix de départ : on divise par le coefficient
  function questionDepart(avecBoutons) {
    for (;;) {
      const hausse = Math.random() < 0.5;
      const t = parmi(hausse ? [10, 20, 25, 50] : [10, 20, 25, 30, 40, 50]);
      const c = coefficientDe(t, hausse);
      const [article, prix] = parmi(ARTICLES);
      const p = parmi(prix);
      const F = net(p * c);
      // (un prix final rond, au moins à 50 centimes près)
      if (!Number.isInteger(F * 2)) continue;
      const consigne = 'Retrouve le prix de départ';
      const enonce = hausse
        ? `Après une hausse de ${pc(t)}, ${article} coûte ${euros(F)}. Quel était son prix avant la hausse ?`
        : `Pendant les soldes, les prix baissent de ${pc(t)} : ${article} coûte maintenant ${euros(F)}. Quel était son prix avant les soldes ?`;
      const explication = `Avant → après : on multiplie par ${ecrire(c)}. Donc après → avant : on divise par ${ecrire(c)}.<br>`
        + `${ecrire(F)} ÷ ${ecrire(c)} = <b>${euros(p)}</b> (on vérifie : ${ecrire(p)} × ${ecrire(c)} = ${ecrire(F)}).`;
      if (!avecBoutons) return nombre({ consigne, enonce, reponse: p, prix: true, touches: TOUCHES, explication });
      // L'erreur classique : appliquer le pourcentage au nouveau prix, dans l'autre sens
      const faux = net(hausse ? F * (1 - t / 100) : F * (1 + t / 100));
      if (!auCentieme(faux)) continue;
      return choix({
        consigne,
        enonce,
        reponse: euros(p),
        // multiplier au lieu de diviser, enlever (ou ajouter) t euros
        pieges: positifs([F * c, hausse ? F - t : F + t]).filter(auCentieme).map(euros),
        garder: [euros(faux)],
        // (les pièges sont surtout du même côté de la réponse : on mélange les boutons)
        ordre: 'melange',
        explication: `${explication}<br>⚠️ Pas ${ecrire(F)} ${hausse ? '−' : '+'} ${pc(t)} de ${ecrire(F)} = ${euros(faux)} : `
          + `les ${pc(t)} se calculaient sur le prix de départ.`,
      });
    }
  }

  // Le coefficient ou le pourcentage d'évolution, à partir de deux valeurs
  function questionTauxEvolution() {
    for (;;) {
      const hausse = Math.random() < 0.5;
      const t = parmi([5, 10, 15, 20, 25, 30, 12, 8, 35, 40]);
      const c = coefficientDe(t, hausse);
      const S = parmi([
        { p: parmi([40, 50, 80, 120, 150, 200]), debut: (a, b) => `Le prix d’un abonnement passe de ${euros(a)} à ${euros(b)}.`, auCentime: true },
        { p: parmi([80, 120, 160, 200, 240]), debut: (a, b) => `Le nombre de membres d’un club de judo passe de ${ecrire(a)} à ${ecrire(b)}.` },
        { p: parmi([400, 800, 1200, 2000]), debut: (a, b) => `Le nombre de visiteurs mensuels d’un musée passe de ${ecrire(a)} à ${ecrire(b)}.` },
      ]);
      const F = net(S.p * c);
      if (S.auCentime ? !auCentieme(F) : !Number.isInteger(F)) continue;
      const signe = hausse ? t : -t;
      if (Math.random() < 0.5) {
        return nombre({
          consigne: 'Trouve le coefficient multiplicateur',
          enonce: `${S.debut(S.p, F)} Par quel nombre a-t-il été multiplié ?`,
          reponse: c,
          touches: TOUCHES,
          explication: `Coefficient = nouvelle valeur ÷ ancienne valeur : ${ecrire(F)} ÷ ${ecrire(S.p)} = <b>${ecrire(c)}</b>.<br>`
            + `C’est une ${evolution(hausse, t)}.`,
        });
      }
      return nombre({
        consigne: 'Trouve le pourcentage d’évolution',
        enonce: `${S.debut(S.p, F)} Quel est le pourcentage d’évolution ? (Pour une baisse, écris un nombre négatif.)`,
        reponse: signe,
        unite: '%',
        touches: TOUCHES,
        explication: `Le coefficient : ${ecrire(F)} ÷ ${ecrire(S.p)} = ${ecrire(c)} = 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)}.<br>`
          + `C’est une ${evolution(hausse, t)} : <b>${ecrire(signe, { signe: true })}${ESPACE}%</b>.`,
      });
    }
  }

  // La même évolution deux fois : × c, puis encore × c
  function questionDeuxFois() {
    const nom = parmi(ENFANTS).nom;
    const S = parmi([
      { t: 5, hausse: true, p: parmi([800, 1200, 1600, 2000, 2400]), unite: 'habitants',
        texte: (p, t) => `Un village compte ${ecrire(p)} habitants. Sa population augmente de ${pc(t)} chaque année. Combien d’habitants aura-t-il dans 2 ans ?` },
      { t: 10, hausse: true, p: parmi([500, 800, 1200, 2000, 3000]), unite: 'abonnés',
        texte: (p, t) => `La chaîne vidéo ${de(nom)} a ${ecrire(p)} abonnés. Leur nombre augmente de ${pc(t)} chaque mois. Combien en aura-t-elle dans 2 mois ?` },
      { t: 20, hausse: true, p: parmi([200, 300, 500, 1000, 1500]), unite: 'abonnés',
        texte: (p, t) => `La chaîne vidéo ${de(nom)} a ${ecrire(p)} abonnés. Leur nombre augmente de ${pc(t)} chaque mois. Combien en aura-t-elle dans 2 mois ?` },
      { t: 10, hausse: false, p: parmi([1000, 2000, 3000, 5000]), unite: 'visiteurs',
        texte: (p, t) => `Un musée reçoit ${ecrire(p)} visiteurs par an. Si ce nombre baisse de ${pc(t)} chaque année, combien de visiteurs recevra-t-il dans 2 ans ?` },
      { t: 20, hausse: false, p: parmi([10000, 15000, 20000, 25000]), unite: '€', prix: true,
        texte: (p, t) => `Une voiture vaut ${euros(p)}. Sa valeur baisse de ${pc(t)} chaque année. Combien vaudra-t-elle dans 2 ans ?` },
    ]);
    const c = coefficientDe(S.t, S.hausse);
    const [un, deux] = [net(S.p * c), net(S.p * c * c)];
    const e = v => (S.prix ? euros(v) : ecrire(v));
    const c2 = coefficientDe(2 * S.t, S.hausse);
    return nombre({
      consigne: 'Résous le problème',
      enonce: S.texte(S.p, S.t),
      reponse: deux,
      unite: S.prix ? '' : S.unite,
      prix: Boolean(S.prix),
      touches: TOUCHES,
      explication: `Chaque fois, on multiplie par ${ecrire(c)} : ${ecrire(S.p)} × ${ecrire(c)} = ${e(un)}, puis ${ecrire(un)} × ${ecrire(c)} = <b>${e(deux)}</b>.<br>`
        + `⚠️ Ce n’est pas ${S.hausse ? '+' : '−'} ${pc(2 * S.t)} (${ecrire(S.p)} × ${ecrire(c2)} = ${e(net(S.p * c2))}) : `
        + `la 2<sup>e</sup> fois, le pourcentage se calcule sur ${e(un)}.`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_EVOLUTIONS = [
    [`Augmenter un prix de ${pc(10)}, puis encore de ${pc(10)}, revient à l’augmenter de ${pc(21)}.`,
      `Augmenter un prix de ${pc(10)}, puis encore de ${pc(10)}, revient à l’augmenter de ${pc(20)}.`,
      `1,1 × 1,1 = 1,21 : c’est une hausse de <b>${pc(21)}</b>. La 2<sup>e</sup> hausse se calcule sur le prix déjà augmenté.`],
    [`Pour retrouver le prix avant une hausse de ${pc(20)}, on divise le nouveau prix par 1,2.`,
      `Pour retrouver le prix avant une hausse de ${pc(20)}, on multiplie le nouveau prix par 0,8.`,
      `Avant → après : × 1,2. Après → avant : <b>÷ 1,2</b>. Multiplier par 0,8 ne marche pas : 100 × 1,2 = 120, mais 120 × 0,8 = 96.`],
    [`Baisser un prix de ${pc(50)}, puis l’augmenter de ${pc(50)}, le fait baisser de ${pc(25)} en tout.`,
      `Baisser un prix de ${pc(50)}, puis l’augmenter de ${pc(50)}, le ramène au prix de départ.`,
      `0,5 × 1,5 = 0,75 : en tout, le prix baisse de <b>${pc(25)}</b>.`],
  ];

  function vraiFauxEvolutions() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      const [juste, faux, pourquoi] = parmi(REGLES_EVOLUTIONS);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    const hausse = Math.random() < 0.5;
    const t = parmi([5, 10, 15, 20, 25, 30, 40, 12, 8]);
    const c = coefficientDe(t, hausse);
    // Les phrases fausses : l'autre sens, ou le coefficient lu comme un pourcentage (0,85 → 85 %)
    const [h, x] = vrai ? [hausse, t] : parmi([[!hausse, t], [hausse, hausse ? 100 + t : 100 - t]]);
    return vraiFaux({
      enonce: `Multiplier un prix par ${ecrire(c)}, c’est ${h ? 'l’augmenter' : 'le baisser'} de ${pc(x)}.`,
      vrai,
      explication: `${ecrire(c)} = 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} : c’est une <b>${evolution(hausse, t)}</b>.`,
    });
  }

  ajouterEtape({
    id: '3e-donnees-evolutions',
    banque: ['coefficient', 'coefficient', 'coefficient', 'successives', 'successives', 'successives', 'prixSuccessif', 'prixSuccessif',
      'depart', 'departChoix', 'taux', 'deuxFois', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'coefficient') return questionCoefficient();
      if (sorte === 'successives') return questionSuccessives();
      if (sorte === 'prixSuccessif') return questionPrixSuccessif();
      if (sorte === 'depart') return questionDepart(false);
      if (sorte === 'departChoix') return questionDepart(true);
      if (sorte === 'taux') return questionTauxEvolution();
      if (sorte === 'deuxFois') return questionDeuxFois();
      return vraiFauxEvolutions();
    },
    titreLecon: 'Les évolutions en pourcentage',
    lecon: `
      <h4>Le coefficient multiplicateur</h4>
      <p><b>Augmenter</b> de t&nbsp;%, c’est multiplier par <b>1 + ${frac('t', 100)}</b>. <b>Baisser</b> de t&nbsp;%, c’est multiplier par <b>1 − ${frac('t', 100)}</b>.</p>
      <table>
        <tr><th>Évolution</th><th>+30&nbsp;%</th><th>+5&nbsp;%</th><th>${MOINS}25&nbsp;%</th><th>${MOINS}8&nbsp;%</th></tr>
        <tr><td>On multiplie par</td><td>1,3</td><td>1,05</td><td>0,75</td><td>0,92</td></tr>
      </table>
      <h4>Des évolutions successives</h4>
      <p>On <b>multiplie les coefficients</b> : <i>+20&nbsp;% puis ${MOINS}10&nbsp;% : 1,2 × 0,9 = 1,08, c’est une hausse de 8&nbsp;%</i> (et pas de 10&nbsp;%).
        <i>+10&nbsp;% puis encore +10&nbsp;% : 1,1 × 1,1 = 1,21, soit +21&nbsp;%.</i></p>
      <h4>Retrouver la valeur de départ</h4>
      <p>On <b>divise</b> par le coefficient : <i>après une hausse de 20&nbsp;%, un jeu coûte 60&nbsp;€&nbsp;; avant, il coûtait 60 ÷ 1,2 = 50&nbsp;€.</i></p>
      <h4>Le pourcentage d’évolution</h4>
      <p>Coefficient = nouvelle valeur ÷ ancienne valeur. <i>De 80&nbsp;€ à 92&nbsp;€ : 92 ÷ 80 = 1,15, soit +15&nbsp;%.
        De 80&nbsp;€ à 68&nbsp;€ : 68 ÷ 80 = 0,85, soit ${MOINS}15&nbsp;% (une baisse).</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> les pourcentages ne s’ajoutent pas, les coefficients se multiplient !</div>
      <p>⚠️ Pour retrouver le prix avant une hausse de 20&nbsp;%, on ne fait pas 60 × 0,8 = 48 : les 20&nbsp;% portaient sur l’ancien prix.</p>
    `,
  });
})();
