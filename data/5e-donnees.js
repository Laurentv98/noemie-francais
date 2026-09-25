// Renard Malin — Maths, niveau 5e : les 6 étapes du Marché des Données
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, entierSauf, net, ecrire, mesure, francs, frac, fracTexte, simplifier, pgcd, tableau,
    choix, nombre, fraction, vraiFaux, ajouterEtape, figures, MOINS, ESPACE,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes (« il » ou « elle », pour les accords) : des prénoms de toutes les communautés du pays
  const ENFANTS = [
    { nom: 'Kalia', il: 'elle' }, { nom: 'Teva', il: 'il' }, { nom: 'Maëva', il: 'elle' }, { nom: 'Sione', il: 'il' },
    { nom: 'Wakana', il: 'elle' }, { nom: 'Minh', il: 'il' }, { nom: 'Hinano', il: 'elle' }, { nom: 'Wanir', il: 'il' },
    { nom: 'Mei', il: 'elle' }, { nom: 'Kylian', il: 'il' }, { nom: 'Léa', il: 'elle' }, { nom: 'Tom', il: 'il' },
    { nom: 'Inès', il: 'elle' }, { nom: 'Noa', il: 'il' },
  ];
  // n enfants différents
  const enfants = n => RM.melanger(ENFANTS).slice(0, n).map(e => ({ ...e }));
  // « de » et « que » devant une voyelle : d’eau, qu’Inès, d’Hugo
  const VOYELLE = /^([aeiouéèêàâîôœ]|hu)/i;
  const de = mot => (VOYELLE.test(mot) ? `d’${mot}` : `de ${mot}`);
  const que = mot => (VOYELLE.test(mot) ? `qu’${mot}` : `que ${mot}`);
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Un nombre et son nom, au pluriel à partir de 2 : « 1 part », « 3 parts »
  const combien = (n, singulier, pluriel = `${singulier}s`) => `${ecrire(n)}${ESPACE}${n >= 2 ? pluriel : singulier}`;
  const croissant = liste => [...liste].sort((a, b) => a - b);
  const additionner = liste => liste.reduce((s, v) => s + v, 0);
  // Une somme écrite en entier : « 12 + 8 + 15 »
  const somme = liste => liste.map(v => ecrire(v)).join(' + ');
  // Une liste de nombres séparés par des points-virgules : « 12 ; 8,5 ; 10 »
  const liste = valeurs => valeurs.map(v => ecrire(v)).join(`${ESPACE}; `);
  // Deux nombres : « 17 et 13 » ; plus : « 12 ; 15 ; 9 »
  const listeEt = valeurs => (valeurs.length === 2 ? `${ecrire(valeurs[0])} et ${ecrire(valeurs[1])}` : liste(valeurs));
  // Les pièges : des nombres positifs, sans les erreurs de calcul de l'ordinateur
  const positifs = valeurs => valeurs.map(net).filter(v => v > 0);
  // Des prix en francs (XPF) : des nombres entiers, sans centimes
  const enFrancs = valeurs => positifs(valeurs).filter(Number.isInteger).map(francs);
  // Au plus 2 (ou 3) chiffres après la virgule : pas de 3,333… sur un bouton
  const auCentieme = v => Number.isInteger(net(v * 100));
  const auMillieme = v => Number.isInteger(net(v * 1000));
  const OUI_NON = ['Oui', 'Non'];
  // Un ratio : ratio(2, 3) → « 2 : 3 » (des espaces insécables : il ne se coupe jamais en fin de ligne)
  const ratio = (...nombres) => nombres.map(v => ecrire(v)).join(`${ESPACE}:${ESPACE}`);
  // Deux fractions égales ? a/b = c/d
  const egales = ([a, b], [c, d]) => a * d === b * c;
  // Des fractions pour les boutons : jamais deux boutons de même valeur, jamais un piège égal à la réponse,
  // et (sauf si plusQueUn) jamais plus grandes que 1
  function piegesFractions(bonne, candidats, plusQueUn = false) {
    const vues = [bonne];
    const pieges = [];
    candidats.forEach(([n, d]) => {
      if (n > 0 && d > 0 && (plusQueUn || n < d) && !vues.some(f => egales(f, [n, d]))) {
        vues.push([n, d]);
        pieges.push(fracTexte(n, d));
      }
    });
    return pieges;
  }
  // Une durée en minutes, écrite en heures et minutes : 50 → « 50 min » ; 90 → « 1 h 30 min »
  function duree(minutes) {
    if (minutes < 60) return mesure(minutes, 'min');
    const h = Math.floor(minutes / 60);
    return minutes % 60 ? `${mesure(h, 'h')}${ESPACE}${mesure(minutes % 60, 'min')}` : mesure(h, 'h');
  }

  // ======================================================================
  // 1. La proportionnalité
  // ======================================================================
  // Les tableaux : les titres des deux lignes, les nombres du haut possibles et les coefficients possibles
  // (en 5e, le coefficient peut être un nombre décimal : 1,5 ; 0,75 ; 2,5… Les prix en francs sont entiers :
  // les décimaux sont dans les masses, les bouteilles et les paquets)
  const GRANDEURS = [
    { x: 'Letchis (kg)', y: 'Prix (F)', xs: [1, 2, 3, 4, 5, 6, 8, 10], coefs: [400, 500, 600, 800, 1000] },
    { x: 'Crevettes (kg)', y: 'Prix (F)', xs: [0.5, 1.5, 2, 2.5, 3, 4, 5], coefs: [1600, 2000, 2400, 3000] },
    { x: 'Nombre de bouteilles', y: 'Volume (L)', xs: [2, 3, 4, 5, 6, 8, 10], coefs: [1.5, 0.5, 0.75, 1.25] },
    { x: 'Nombre de paquets', y: 'Masse (kg)', xs: [2, 3, 4, 5, 6, 8, 10], coefs: [0.25, 0.5, 1.5, 2.5, 1.2] },
    { x: 'Durée (h)', y: 'Distance (km)', xs: [1, 2, 3, 4, 5, 6], coefs: [4, 5, 12, 15, 18, 60, 80, 90] },
    { x: 'Nombre de personnes', y: 'Farine (g)', xs: [2, 3, 4, 5, 6, 8, 10], coefs: [40, 50, 60, 75, 80] },
    { x: 'Nombre de tours', y: 'Distance (m)', xs: [2, 3, 4, 5, 6, 8, 10], coefs: [200, 250, 400] },
  ];
  // Les nombres du tableau (les prix en francs sont des entiers : ils s'écrivent comme les autres nombres)
  const ecritureDe = () => ecrire;
  const tableauDe = (G, xs, ys) => tableau([[G.x, ...xs], [G.y, ...ys.map(y => (typeof y === 'number' ? ecritureDe(G)(y) : y))]]);
  // Les quotients « bas ÷ haut » : « 5 ÷ 2 = 2,5 ; 7,50 ÷ 3 = 2,5 »
  const quotients = (xs, ys, e) => xs.map((x, i) => `${e(ys[i])} ÷ ${ecrire(x)} = ${ecrire(net(ys[i] / x))}`).join(' ; ');
  // Les produits « haut × k » : « 2 × 2,5 = 5 ; 3 × 2,5 = 7,50 »
  const produits = (xs, k, e = ecrire) => xs.map(x => `${ecrire(x)} × ${ecrire(k)} = ${e(net(k * x))}`).join(' ; ');
  // n nombres du haut, pris dans la liste de la grandeur, rangés
  const hauts = (G, n) => croissant(RM.melanger(G.xs).slice(0, n));
  // La colonne la plus simple pour trouver le coefficient : la première dont le nombre du haut est entier
  const colonneSimple = xs => Math.max(0, xs.findIndex(Number.isInteger));

  // Une case « presque juste », écrite comme les autres (pour un tableau qui n'est pas proportionnel)
  function presqueJuste(y, interdits) {
    let pas;
    if (!Number.isInteger(y)) pas = Number.isInteger(y * 2) ? 0.5 : 0.2;
    else if (y >= 1000 && y % 100 === 0) pas = 100;
    else if (y % 10 === 0) pas = y >= 200 ? 20 : (y >= 100 ? 10 : 5);
    else pas = y >= 50 ? 2 : 1;
    const libres = ecarts => ecarts.map(d => net(y + d)).filter(v => v > 0 && !interdits.includes(v));
    const proches = libres([pas, -pas, 2 * pas, -2 * pas]);
    return parmi(proches.length ? proches : libres(Number.isInteger(y) ? [1, -1, 2, -2, 3] : [0.1, -0.1, 0.3]));
  }

  function questionReconnaitre() {
    const G = parmi(GRANDEURS);
    const e = ecritureDe(G);
    const xs = hauts(G, 4);
    const proportionnel = Math.random() < 0.5;
    let k = parmi(G.coefs);
    let ys = xs.map(x => net(k * x));
    let remarque = '';
    if (!proportionnel) {
      const sorte = parmi(['uneCase', 'uneCase', 'ajout', 'depart']);
      if (sorte === 'uneCase') {
        const j = entier(1, 3);
        ys[j] = presqueJuste(ys[j], ys);
      } else {
        // y = a × x + c : c est choisi pour que la 1re colonne marche avec « × k », mais pas les autres
        // (« ajout » : on ajoute toujours c ; « depart » : un prix de départ, par exemple)
        k = parmi(G.coefs.filter(c => c > 1));
        // (avec un coefficient entier, a reste entier : pas de « 187,5 g » de farine)
        let moitie = net(k / 2);
        if (Number.isInteger(k) && !Number.isInteger(moitie)) moitie = k >= 20 ? 5 * Math.floor(k / 10) : Math.floor(k / 2);
        // (et au plus 2 chiffres après la virgule : pour 1,25, on prend 0,6 et pas 0,625)
        if (!auCentieme(moitie)) moitie = net(Math.floor(moitie * 10) / 10);
        const a = sorte === 'ajout' && k <= 6 ? 1 : moitie;
        const c = net((k - a) * xs[0]);
        ys = xs.map(x => net(a * x + c));
        if (a === 1) remarque = `<br>⚠️ Ici, on <b>ajoute</b> toujours ${ecrire(c)} : ce n’est pas une multiplication !`;
      }
    }
    let explication;
    if (proportionnel) {
      explication = `<b>Oui</b> : les quotients « bas ÷ haut » sont tous égaux à ${ecrire(k)}.<br>${quotients(xs, ys, e)}.`;
    } else {
      const j = ys.findIndex((y, i) => y !== net(k * xs[i]));
      explication = `<b>Non</b> : ${e(ys[0])} ÷ ${ecrire(xs[0])} = ${ecrire(k)}, mais ${ecrire(xs[j])} × ${ecrire(k)} = ${e(net(k * xs[j]))}, `
        + `et pas ${e(ys[j])}.<br>Les quotients ne sont pas tous égaux.${remarque}`;
    }
    return choix({
      consigne: 'Est-ce un tableau de proportionnalité ?',
      enonce: tableauDe(G, xs, ys),
      reponse: proportionnel ? 'Oui' : 'Non',
      choix: OUI_NON,
      explication,
    });
  }

  function questionCoefficient(avecBoutons) {
    const G = parmi(GRANDEURS);
    const k = parmi(G.coefs);
    const xs = hauts(G, 3);
    const ys = xs.map(x => net(k * x));
    const e = ecritureDe(G);
    const i = colonneSimple(xs);
    const explication = `On divise un nombre du bas par le nombre du haut : ${e(ys[i])} ÷ ${ecrire(xs[i])} = <b>${ecrire(k)}</b>.<br>`
      + `On vérifie : ${produits(xs.filter((x, n) => n !== i), k, e)}.`;
    const consigne = 'Trouve le coefficient de proportionnalité';
    if (!avecBoutons) {
      return nombre({
        consigne,
        enonce: `${tableauDe(G, xs, ys)}C’est un tableau de proportionnalité. On passe de la 1re ligne à la 2e en multipliant par ___.`,
        reponse: k,
        explication,
      });
    }
    // Les erreurs : la différence au lieu du quotient, la virgule, le quotient à l'envers (haut ÷ bas)…
    // (avec un grand coefficient, la différence donnerait un bouton absurde : 2 394 pour 400)
    const candidats = [k * 10, k / 10];
    if (k < 10) candidats.push(ys[i] - xs[i], k + 1, k - 1, 1 / k);
    else candidats.push(k / 2, k * 2);
    if (!Number.isInteger(k)) candidats.push(k + 0.5, k - 0.5);
    const rapport = net(xs[1] / xs[0]);
    if (Number.isInteger(rapport) && rapport > 1) candidats.push(rapport);
    return choix({
      consigne,
      enonce: `${tableauDe(G, xs, ys)}Pour passer de la 1re ligne à la 2e, on multiplie par ___.`,
      reponse: k,
      pieges: positifs(candidats).filter(auMillieme),
      explication,
    });
  }

  // Un tableau de proportionnalité de 4 colonnes avec une case cachée, fabriqué pour qu'une méthode soit naturelle :
  // additionner deux colonnes, multiplier (ou diviser) une colonne, ou utiliser le coefficient.
  // enHaut : la case cachée est dans la ligne du haut
  function tableauATrou(enHaut) {
    const G = parmi(GRANDEURS);
    const k = parmi(G.coefs);
    const X = G.xs;
    const sommes = [];
    const multiples = [];
    X.forEach(a => X.forEach(b => {
      if (a < b && X.includes(net(a + b))) sommes.push([a, b]);
      if (a !== b && (Number.isInteger(net(b / a)) || Number.isInteger(net(a / b)))) multiples.push([a, b]);
    }));
    // (du bas vers le haut avec le coefficient, on divise par k : seulement s'il est entier)
    const methode = parmi(['addition', 'multiple', ...(!enHaut || Number.isInteger(k) ? ['coefficient'] : [])]);
    const autres = (...exclus) => RM.melanger(X.filter(x => !exclus.includes(x)));
    let xs;
    let cache;
    let a;
    let b;
    let m;
    if (methode === 'addition') {
      [a, b] = parmi(sommes);
      cache = net(a + b);
      xs = [a, b, cache, autres(a, b, cache)[0]];
    } else if (methode === 'multiple') {
      [a, cache] = parmi(multiples);
      m = cache > a ? net(cache / a) : net(a / cache);
      xs = [a, cache, ...autres(a, cache).slice(0, 2)];
    } else {
      xs = RM.melanger(X).slice(0, 4);
      cache = parmi(xs);
      a = croissant(xs.filter(x => x !== cache)).find(Number.isInteger) ?? xs.find(x => x !== cache);
    }
    xs = croissant(xs);
    const y = x => net(k * x);
    const ys = xs.map(y);
    const e = ecritureDe(G);
    const j = xs.indexOf(cache);
    let explication;
    if (!enHaut) {
      if (methode === 'addition') {
        explication = `${ecrire(cache)} = ${ecrire(a)} + ${ecrire(b)}, donc on additionne les nombres du bas de ces deux colonnes :<br>`
          + `${e(y(a))} + ${e(y(b))} = <b>${e(y(cache))}</b>.`;
      } else if (methode === 'multiple') {
        explication = cache > a
          ? `${ecrire(cache)} = ${ecrire(a)} × ${ecrire(m)}, donc on multiplie aussi en bas :<br>${e(y(a))} × ${ecrire(m)} = <b>${e(y(cache))}</b>.`
          : `${ecrire(cache)} = ${ecrire(a)} ÷ ${ecrire(m)}, donc on divise aussi en bas :<br>${e(y(a))} ÷ ${ecrire(m)} = <b>${e(y(cache))}</b>.`;
      } else {
        explication = `Le coefficient : ${e(y(a))} ÷ ${ecrire(a)} = ${ecrire(k)}.<br>Donc ${ecrire(cache)} × ${ecrire(k)} = <b>${e(y(cache))}</b>.`;
      }
    } else if (methode === 'addition') {
      explication = `${e(y(cache))} = ${e(y(a))} + ${e(y(b))}, donc en haut aussi on additionne :<br>${ecrire(a)} + ${ecrire(b)} = <b>${ecrire(cache)}</b>.`;
    } else if (methode === 'multiple') {
      explication = cache > a
        ? `${e(y(cache))} = ${e(y(a))} × ${ecrire(m)}, donc en haut aussi :<br>${ecrire(a)} × ${ecrire(m)} = <b>${ecrire(cache)}</b>.`
        : `${e(y(cache))} = ${e(y(a))} ÷ ${ecrire(m)}, donc en haut aussi :<br>${ecrire(a)} ÷ ${ecrire(m)} = <b>${ecrire(cache)}</b>.`;
    } else {
      explication = `Le coefficient : ${e(y(a))} ÷ ${ecrire(a)} = ${ecrire(k)}. Du bas vers le haut, on divise :<br>`
        + `${e(y(cache))} ÷ ${ecrire(k)} = <b>${ecrire(cache)}</b>.`;
    }
    // L'erreur de l'addition, avec une colonne voisine : « de 4 à 9, c'est + 5, mais 16 + 5 = 21 est faux »
    const voisin = xs.filter(x => x < cache).pop() ?? xs.find(x => x !== cache);
    const ecart = net(cache - voisin);
    const faux = net(y(voisin) + ecart);
    const signe = ecart > 0 ? '+' : MOINS;
    // (seulement avec un petit coefficient : avec 400 m par tour, « 1 200 + 1 » ne tromperait personne)
    const erreur = faux > 0 && k < 10
      ? `<br>⚠️ On n’ajoute pas le même nombre en haut et en bas : de ${ecrire(voisin)} à ${ecrire(cache)}, c’est ${signe} ${ecrire(Math.abs(ecart))}, `
        + `mais ${e(y(voisin))} ${signe} ${ecrire(Math.abs(ecart))} = ${e(faux)} est faux.`
      : '';
    const avec = contenu => tableau([
      [G.x, ...xs.map((x, i) => (enHaut && i === j ? contenu : x))],
      [G.y, ...ys.map((v, i) => (!enHaut && i === j ? contenu : e(v)))],
    ]);
    const reponse = enHaut ? cache : y(cache);
    return { G, k, xs, ys, j, e, reponse, html: avec('___'), solution: avec(`<b>${enHaut ? ecrire(cache) : e(reponse)}</b>`), explication, erreur };
  }

  function questionCompleter(avecBoutons) {
    const enHaut = !avecBoutons && Math.random() < 0.3;
    const T = tableauATrou(enHaut);
    const consigne = 'Complète le tableau de proportionnalité';
    if (!avecBoutons) {
      return nombre({
        consigne, enonce: T.html, reponse: T.reponse, enFrancs: !enHaut && T.G.y === 'Prix (F)', solution: T.solution, explication: T.explication,
      });
    }
    const x = T.xs[T.j];
    const bon = T.reponse;
    // Le tableau monte : la bonne réponse est entre les deux cases voisines. Les pièges aussi, autant que possible,
    // et jamais un nombre déjà écrit dans la ligne.
    const bas = T.j > 0 ? T.ys[T.j - 1] : 0;
    const haut = T.j < T.xs.length - 1 ? T.ys[T.j + 1] : Infinity;
    const visibles = T.ys.filter((v, i) => i !== T.j);
    const valable = v => v > 0 && v !== bon && !visibles.includes(v) && auCentieme(v);
    // une demi-colonne ou un quart de colonne de trop ou de moins, et (avec un petit coefficient) l'erreur de l'addition :
    // ajouter en bas ce qu'on ajoute en haut
    // (dans une ligne de prix en francs, des prix ronds : ± 100 F, ± 200 F, et pas ± un quart du prix au kilo)
    const ecarts = T.G.y === 'Prix (F)' ? [100, -100, 200, -200] : [T.k / 4, -T.k / 4];
    const proches = [T.k * (x + 0.5), T.k * (x - 0.5), ...ecarts.map(d => bon + d)];
    if (T.k < 10) proches.push(...T.xs.map((xi, i) => T.ys[i] + x - xi).filter((v, i) => i !== T.j), x + T.k);
    const dedans = [...new Set(proches.map(net))].filter(v => valable(v) && v > bas && v < haut);
    // (s'il n'y en a pas 3 de chaque côté de la réponse, on complète avec des colonnes de trop ou de moins :
    // sinon la bonne réponse serait toujours au milieu des boutons)
    const loin = [1, 1.5, 2, 3].flatMap(d => [T.k * (x - d), T.k * (x + d)]).map(net).filter(v => valable(v) && !dedans.includes(v));
    const cote = (liste, dessous) => liste.filter(v => (dessous ? v < bon : v > bon));
    const pieges = [...dedans, ...cote(loin, true).slice(0, Math.max(0, 3 - cote(dedans, true).length)),
      ...cote(loin, false).slice(0, Math.max(0, 3 - cote(dedans, false).length))];
    return choix({
      consigne,
      enonce: T.html,
      reponse: T.e(bon),
      pieges: pieges.map(T.e),
      solution: T.solution,
      explication: T.explication + T.erreur,
    });
  }

  // Les problèmes : des objets à la pièce, des recettes, des trajets à vitesse constante, un robinet
  // (des prix en francs, entiers et arrondis)
  const PIECES = [
    { un: 'croissant', des: 'croissants', prix: [120, 150, 180] },
    { un: 'cahier', des: 'cahiers', prix: [180, 250, 350] },
    { un: 'yaourt', des: 'yaourts', prix: [90, 110, 120] },
    { un: 'ticket de bus', des: 'tickets de bus', prix: [150, 200, 250] },
    { un: 'pot de miel', des: 'pots de miel', prix: [1200, 1500, 1800] },
    { un: 'ananas', des: 'ananas', prix: [300, 350, 400] },
    { un: 'régime de bananes', des: 'régimes de bananes', prix: [600, 800, 900] },
  ];
  const INGREDIENTS = [
    { nom: 'farine', unite: 'g', parPersonne: [25, 40, 50, 60, 75] },
    { nom: 'sucre', unite: 'g', parPersonne: [15, 20, 25, 30] },
    { nom: 'beurre', unite: 'g', parPersonne: [10, 15, 20, 25] },
    { nom: 'lait', unite: 'cL', parPersonne: [5, 8, 10, 15] },
    { nom: 'chocolat', unite: 'g', parPersonne: [20, 25, 30, 40] },
  ];
  // À vitesse constante : la distance parcourue pendant « pas » minutes
  const TRAJETS = [
    { phrase: p => `${p.nom} roule à vélo à vitesse constante : ${p.il} parcourt`, il: p => p.il, pas: 10, distances: [2, 2.5, 3, 4] },
    { phrase: () => 'Mamie marche à vitesse constante : elle parcourt', il: () => 'elle', pas: 30, distances: [2, 2.5] },
    { phrase: () => 'Un car roule à vitesse constante : il parcourt', il: () => 'il', pas: 10, distances: [10, 12, 15] },
    { phrase: p => `${p.nom} pagaie en va’a à vitesse constante : ${p.il} parcourt`, il: p => p.il, pas: 15, distances: [1.5, 2] },
  ];

  // Un problème de proportionnalité : l'énoncé, la réponse (u l'écrit avec son unité), l'explication, les pièges
  function problemeProportion() {
    const p = parmi(ENFANTS);
    const sorte = parmi(['prix', 'prix', 'recette', 'trajet', 'robinet']);
    if (sorte === 'prix') {
      const P = parmi(PIECES);
      const u = parmi(P.prix);
      let a;
      let c;
      do { a = entier(3, 9); c = entier(2, 12); } while (a === c);
      const [ya, yc] = [net(u * a), net(u * c)];
      let explication;
      if (c % a === 0) explication = `${ecrire(c)} ${P.des}, c’est ${ecrire(c / a)} fois plus que ${ecrire(a)} : ${francs(ya)} × ${ecrire(c / a)} = <b>${francs(yc)}</b>.`;
      else if (a % c === 0) explication = `${ecrire(c)} ${P.des}, c’est ${ecrire(a / c)} fois moins que ${ecrire(a)} : ${francs(ya)} ÷ ${ecrire(a / c)} = <b>${francs(yc)}</b>.`;
      else {
        explication = `On passe par l’unité : un ${P.un} coûte ${francs(ya)} ÷ ${ecrire(a)} = ${francs(u)}.<br>`
          + `${majuscule(combien(c, P.un, P.des))} : ${ecrire(c)} × ${francs(u)} = <b>${francs(yc)}</b>.`;
      }
      return {
        enonce: `${ecrire(a)} ${P.des} coûtent ${francs(ya)}. Combien coûtent ${ecrire(c)} ${P.des} ?`,
        reponse: yc, u: francs, enFrancs: true, explication,
        // un ou deux objets de trop ou de moins, le prix d'un seul, le prix donné dans l'énoncé
        pieges: [u * (c + 1), u * (c - 1), u * (c + 2), u * (c - 2), u, ya],
      };
    }
    if (sorte === 'recette') {
      const I = parmi(INGREDIENTS);
      const up = parmi(I.parPersonne);
      const x1 = parmi([2, 3, 4, 6, 8]);
      const x2 = entierSauf(3, 12, [x1]);
      const [y1, y2] = [up * x1, up * x2];
      const q = v => mesure(v, I.unite);
      let explication;
      if (x2 % x1 === 0) explication = `${combien(x2, 'personne')}, c’est ${ecrire(x2 / x1)} fois plus que ${ecrire(x1)} : ${q(y1)} × ${ecrire(x2 / x1)} = <b>${q(y2)}</b>.`;
      else if (x1 % x2 === 0) explication = `${combien(x2, 'personne')}, c’est ${ecrire(x1 / x2)} fois moins que ${ecrire(x1)} : ${q(y1)} ÷ ${ecrire(x1 / x2)} = <b>${q(y2)}</b>.`;
      else explication = `Pour 1 personne : ${ecrire(y1)} ÷ ${ecrire(x1)} = ${q(up)}.<br>Pour ${combien(x2, 'personne')} : ${ecrire(x2)} × ${q(up)} = <b>${q(y2)}</b>.`;
      return {
        enonce: `Pour ${combien(x1, 'personne')}, il faut ${q(y1)} ${de(I.nom)}. Combien en faut-il pour ${combien(x2, 'personne')} ?`,
        reponse: y2, u: q, unite: I.unite, explication,
        // une personne de trop ou de moins, la quantité pour une personne, la quantité donnée, doubler
        pieges: [up * (x2 + 1), up * (x2 - 1), up * (x2 + 2), up, y1, 2 * y1],
      };
    }
    if (sorte === 'trajet') {
      const T = parmi(TRAJETS);
      const d = parmi(T.distances);
      let n1;
      let n2;
      do { n1 = entier(2, 4); n2 = entier(1, 9); } while (n1 === n2 || n2 * T.pas > 180);
      const [t1, t2, d1, d2] = [n1 * T.pas, n2 * T.pas, net(n1 * d), net(n2 * d)];
      const km = v => mesure(v, 'km');
      const explication = `${majuscule(duree(t1))}, c’est ${ecrire(n1)} fois ${duree(T.pas)}. En ${duree(T.pas)} : ${ecrire(d1)} ÷ ${ecrire(n1)} = ${km(d)}.<br>`
        + (n2 === 1 ? `La réponse est donc <b>${km(d2)}</b>.` : `En ${duree(t2)}, c’est ${ecrire(n2)} fois ${duree(T.pas)} : ${ecrire(n2)} × ${ecrire(d)} = <b>${km(d2)}</b>.`);
      return {
        enonce: `${T.phrase(p)} ${km(d1)} en ${duree(t1)}. Quelle distance parcourt-${T.il(p)} en ${duree(t2)} ?`,
        reponse: d2, u: km, unite: 'km', explication,
        // la distance pour un seul « pas », un pas de trop ou de moins, oublier de diviser
        pieges: [d, d * (n2 + 1), d * (n2 - 1), d1 * n2, d1, d1 - d, d1 + d, 2 * d],
      };
    }
    const l = entier(2, 6);
    const t1 = entier(2, 4);
    const t2 = entierSauf(2, 10, [t1]);
    const L = v => mesure(v, 'L');
    return {
      enonce: `Un robinet verse ${L(l * t1)} d’eau en ${combien(t1, 'minute')}. Au même rythme, combien de litres verse-t-il en ${combien(t2, 'minute')} ?`,
      reponse: l * t2, u: L, unite: 'L',
      explication: `En 1 minute : ${ecrire(l * t1)} ÷ ${ecrire(t1)} = ${L(l)}.<br>En ${combien(t2, 'minute')} : ${ecrire(t2)} × ${ecrire(l)} = <b>${L(l * t2)}</b>.`,
      pieges: [l * t1 + t2 - t1, l * (t2 + 1), l * (t2 - 1), l, l * t1],
    };
  }

  function questionProbleme(avecBoutons) {
    const P = problemeProportion();
    if (!avecBoutons) {
      return nombre({
        consigne: 'Résous le problème', enonce: P.enonce, reponse: P.reponse, unite: P.unite, enFrancs: P.enFrancs, explication: P.explication,
      });
    }
    return choix({
      consigne: 'Résous le problème',
      enonce: P.enonce,
      reponse: P.u(P.reponse),
      pieges: positifs(P.pieges).filter(auCentieme).map(P.u),
      explication: P.explication,
    });
  }

  function vraiFauxProportion() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['calcul', 'calcul', 'regle', 'situation']);
    if (forme === 'calcul') {
      // La linéarité
      const P = parmi(PIECES);
      const u = parmi(P.prix);
      let a;
      let c;
      do { a = entier(2, 6); c = entier(3, 10); } while (a === c);
      const [ya, yc] = [u * a, u * c];
      // les erreurs : un objet de trop ou de moins, un prix à l'unité faux de 10 F (jamais le prix donné : trop facile)
      const faux = parmi([u * (c + 1), u * (c - 1), (u + 10) * c, (u - 10) * c].filter(v => v > 0 && v !== yc && v !== ya));
      return vraiFaux({
        enonce: `Si ${ecrire(a)} ${P.des} coûtent ${francs(ya)}, alors ${ecrire(c)} ${P.des} coûtent ${francs(vrai ? yc : faux)}.`,
        vrai,
        explication: `Un ${P.un} coûte ${francs(ya)} ÷ ${ecrire(a)} = ${francs(u)}, donc ${ecrire(c)} ${P.des} coûtent ${ecrire(c)} × ${francs(u)} = <b>${francs(yc)}</b>.`,
      });
    }
    if (forme === 'regle') {
      const m = entier(2, 5);
      const REGLES = [
        [true, 'Dans un tableau de proportionnalité, on peut additionner deux colonnes pour obtenir une autre colonne.',
          `Par exemple, si 2 kg de letchis coûtent ${francs(1200)} et 3 kg coûtent ${francs(1800)}, alors 5 kg (2 + 3) coûtent ${ecrire(1200)} + ${ecrire(1800)} = ${francs(3000)}.`],
        [false, 'Dans un tableau de proportionnalité, on peut ajouter le même nombre en haut et en bas pour obtenir une autre colonne.',
          'Par exemple, si 2 bouteilles contiennent 3 L, alors 3 bouteilles (2 + 1) ne contiennent pas 3 + 1 = 4 L, mais 4,5 L.'],
        [true, `Dans un tableau de proportionnalité, si un nombre du haut est multiplié par ${ecrire(m)}, le nombre du bas est aussi multiplié par ${ecrire(m)}.`,
          `Par exemple, si 1 kg de letchis coûte ${francs(500)}, alors ${ecrire(m)} kg coûtent ${ecrire(m)} × 500 = ${francs(500 * m)}.`],
        [false, `Dans un tableau de proportionnalité, si on ajoute ${ecrire(m)} à un nombre du haut, on ajoute aussi ${ecrire(m)} au nombre du bas.`,
          `Par exemple, si 1 paquet pèse 3 kg, alors ${ecrire(1 + m)} paquets pèsent ${ecrire(1 + m)} × 3 = ${ecrire(3 * (1 + m))} kg, et pas 3 + ${ecrire(m)} = ${ecrire(3 + m)} kg.`],
      ];
      const [, enonce, exemple] = parmi(REGLES.filter(([v]) => v === vrai));
      return vraiFaux({
        enonce,
        vrai,
        explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : on peut multiplier une colonne, ou additionner deux colonnes, mais pas ajouter le même nombre en haut et en bas.<br>`
          + exemple.replace(/ (kg|L)\b/g, `${ESPACE}$1`),
      });
    }
    const k = 100 * entier(4, 9);
    const c = 100 * entier(3, 5);
    const SITUATIONS = [
      [true, `Au marché, les mangues coûtent ${francs(k)} le kilo. Le prix payé est proportionnel à la masse de mangues.`,
        `${mesure(1, 'kg')} coûte ${francs(k)}, ${mesure(2, 'kg')} coûtent ${francs(2 * k)} : on multiplie toujours par ${ecrire(k)}.`],
      [true, `Un car roule à vitesse constante. La distance parcourue est proportionnelle à la durée du trajet.`,
        'À vitesse constante, en 2 fois plus de temps, on parcourt 2 fois plus de distance.'],
      [false, `Un taxi coûte ${francs(c)} au départ, puis ${francs(200)} par kilomètre. Le prix payé est proportionnel à la distance.`,
        `${mesure(1, 'km')} coûte ${francs(c + 200)}, mais ${mesure(2, 'km')} coûtent ${francs(c + 400)}, et pas le double (${francs(2 * (c + 200))}), à cause des ${francs(c)} du départ.`],
      [false, 'La taille d’un enfant est proportionnelle à son âge.',
        'À 5 ans, on mesure environ 1,10&nbsp;m. À 10 ans, on ne mesure pas le double (2,20&nbsp;m) !'],
    ];
    const [, enonce, pourquoi] = parmi(SITUATIONS.filter(([v]) => v === vrai));
    return vraiFaux({
      enonce,
      vrai,
      explication: `${vrai ? '<b>Vrai</b>, c’est proportionnel.' : '<b>Faux</b>, ce n’est pas proportionnel.'}<br>${pourquoi}`,
    });
  }

  ajouterEtape({
    id: '5e-donnees-proportionnalite',
    banque: ['reconnaitre', 'coefficient', 'coefficientChoix', 'coefficientChoix', 'completer', 'completer', 'completerChoix',
      'completerChoix', 'probleme', 'problemeChoix', 'problemeChoix', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'reconnaitre') return questionReconnaitre();
      if (sorte === 'coefficient') return questionCoefficient(false);
      if (sorte === 'coefficientChoix') return questionCoefficient(true);
      if (sorte === 'completer') return questionCompleter(false);
      if (sorte === 'completerChoix') return questionCompleter(true);
      if (sorte === 'probleme') return questionProbleme(false);
      if (sorte === 'problemeChoix') return questionProbleme(true);
      return vraiFauxProportion();
    },
    titreLecon: 'La proportionnalité',
    lecon: `
      <h4>Le coefficient de proportionnalité</h4>
      <p>Deux grandeurs sont <b>proportionnelles</b> quand on passe de l’une à l’autre en <b>multipliant toujours par le même nombre</b> :
        le <b>coefficient de proportionnalité</b>. Il peut être décimal.</p>
      ${tableau([['Nombre de bouteilles', 2, 3, 5, 8], ['Volume (L)', 3, '4,5', '7,5', 12]])}
      <p>👉 Les quotients « bas ÷ haut » sont tous égaux : <i>3 ÷ 2 = 1,5 ; 4,5 ÷ 3 = 1,5 ; 7,5 ÷ 5 = 1,5 ; 12 ÷ 8 = 1,5</i>.
        C’est un tableau de proportionnalité, de coefficient <b>1,5</b> (des bouteilles de 1,5&nbsp;L). Si un seul quotient est différent, ce n’en est pas un.</p>
      <h4>Compléter un tableau</h4>
      <p>• <b>Avec le coefficient</b> : 7 bouteilles contiennent 7 × 1,5 = 10,5&nbsp;L.<br>
        • <b>En multipliant (ou en divisant) une colonne</b> : 6 bouteilles, c’est 2 fois 3 bouteilles, donc 2 × 4,5 = 9&nbsp;L.<br>
        • <b>En additionnant deux colonnes</b> : 5 bouteilles = 2 bouteilles + 3 bouteilles, donc 3 + 4,5 = 7,5&nbsp;L.<br>
        • <b>En passant par l’unité</b> : 1 bouteille contient 3 ÷ 2 = 1,5&nbsp;L.</p>
      <p>Au marché, le prix est proportionnel à la masse : si 1&nbsp;kg de letchis coûte 600&nbsp;F, 3&nbsp;kg coûtent 3 × 600 = 1&nbsp;800&nbsp;F.
        Les prix en francs et en euros sont proportionnels aussi : 1&nbsp;000&nbsp;F ≈ 8,38&nbsp;€, donc 3&nbsp;000&nbsp;F ≈ 3 × 8,38 = 25,14&nbsp;€.</p>
      <h4>La vitesse constante</h4>
      <p>À vitesse constante, la distance est proportionnelle à la durée :
        <i>6&nbsp;km en 20&nbsp;min, c’est 3&nbsp;km en 10&nbsp;min, donc 5 × 3 = 15&nbsp;km en 50&nbsp;min.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde d’abord les nombres du haut. L’un est le double d’un autre ?
        La somme de deux autres ? Sinon, passe par le coefficient ou par l’unité !</div>
      <p>⚠️ Ajouter le <b>même nombre</b> en haut et en bas, c’est faux : si 2 bouteilles contiennent 3&nbsp;L, 3 bouteilles ne contiennent pas 4&nbsp;L.
        Un taxi qui coûte déjà quelque chose au départ n’est pas proportionnel à la distance.</p>
    `,
  });

  // ======================================================================
  // 2. Les pourcentages
  // ======================================================================
  // Le calcul de t % de n, expliqué pas à pas (e : ecrire pour un nombre, francs pour un prix)
  function calculPourcent(t, n, e = ecrire) {
    const r = net(t * n / 100);
    const dix = net(n / 10);
    const cinq = net(n / 20);
    if (t === 50) return `${mesure(50, '%')}, c’est la moitié : ${e(n)} ÷ 2 = <b>${e(r)}</b>.`;
    if (t === 25) return `${mesure(25, '%')}, c’est le quart : ${e(n)} ÷ 4 = <b>${e(r)}</b>.`;
    if (t === 75) return `${mesure(75, '%')}, ce sont les trois quarts : ${e(n)} ÷ 4 = ${e(net(n / 4))}, puis ${e(net(n / 4))} × 3 = <b>${e(r)}</b>.`;
    if (t === 10) return `${mesure(10, '%')}, c’est le dixième : ${e(n)} ÷ 10 = <b>${e(r)}</b>.`;
    if (t % 10 === 0) {
      return `${mesure(10, '%')} de ${e(n)} = ${e(n)} ÷ 10 = ${e(dix)}.<br>`
        + `${mesure(t, '%')}, c’est ${ecrire(t / 10)} fois plus : ${ecrire(t / 10)} × ${e(dix)} = <b>${e(r)}</b>.`;
    }
    if (t === 5) return `${mesure(10, '%')} de ${e(n)} = ${e(dix)}, et ${mesure(5, '%')}, c’est la moitié : ${e(dix)} ÷ 2 = <b>${e(r)}</b>.`;
    if (t % 5 === 0) {
      const dizaines = Math.floor(t / 10);
      const partDix = net(dix * dizaines);
      return `${mesure(10, '%')} de ${e(n)} = ${e(dix)}, et ${mesure(5, '%')} (la moitié) = ${e(cinq)}.<br>`
        + `${mesure(t, '%')} = ${dizaines > 1 ? `${ecrire(dizaines)} × ${mesure(10, '%')}` : mesure(10, '%')} + ${mesure(5, '%')} : `
        + `${dizaines > 1 ? `${ecrire(dizaines)} × ${e(dix)}` : e(dix)} + ${e(cinq)} = <b>${e(r)}</b>.`;
    }
    const fin = e === ecrire ? `<b>${ecrire(r)}</b>` : `${ecrire(r)}, soit <b>${e(r)}</b>`;
    return `${mesure(t, '%')} de ${e(n)}, c’est ${frac(t, 100)} × ${ecrire(n)} : ${ecrire(n)} × ${ecrire(t)} ÷ 100 = ${ecrire(n * t)} ÷ 100 = ${fin}.`;
  }

  // Un nombre n entre min et max dont on calcule t % de tête : le résultat est entier (ou au dixième si auDixieme)
  function nombrePour(t, min, max, auDixieme = false, pas = 1) {
    const possibles = [];
    for (let n = Math.ceil(min / pas) * pas; n <= max; n += pas) {
      const r = t * n / 100;
      if (n !== 100 && (Number.isInteger(net(r)) || (auDixieme && Number.isInteger(net(r * 10))))) possibles.push(n);
    }
    return parmi(possibles);
  }

  // Appliquer un pourcentage, dans une situation (le résultat est entier : ce sont des élèves, des pages…)
  const QUANTITES = [
    { min: 200, max: 400, pas: 10, texte: (t, n) => `Dans un collège de brousse de ${ecrire(n)} élèves, ${mesure(t, '%')} viennent en car. Combien d’élèves viennent en car ?`, unite: 'élèves' },
    { min: 80, max: 400, pas: 10, texte: (t, n, p) => `Un livre a ${ecrire(n)} pages. ${p.nom} en a lu ${mesure(t, '%')}. Combien de pages a-t-${p.il} lues ?`, unite: 'pages' },
    { min: 20, max: 120, pas: 5, texte: (t, n) => `Un sac contient ${ecrire(n)} billes, dont ${mesure(t, '%')} sont rouges. Combien y a-t-il de billes rouges ?`, unite: 'billes' },
    { min: 20, max: 120, pas: 5, texte: (t, n, p) => `Dans le jardin de Papi, ${p.nom} cueille ${ecrire(n)} letchis, dont ${mesure(t, '%')} sont encore un peu verts. Combien de letchis sont verts ?`, unite: 'letchis' },
    { min: 200, max: 800, pas: 50, taux: [5, 12, 15, 20, 30, 35, 40], texte: (t, n) => `Un gâteau de ${mesure(n, 'g')} contient ${mesure(t, '%')} de beurre. Quelle masse de beurre contient-il ?`, unite: 'g' },
  ];
  const TAUX = [5, 15, 20, 30, 35, 40, 60, 70, 75, 80, 12];

  function questionAppliquer() {
    const t = parmi(TAUX);
    if (Math.random() < 0.45) {
      const n = nombrePour(t, 20, 250, true);
      return nombre({ consigne: 'Calcule', enonce: `${mesure(t, '%')} de ${ecrire(n)} = ___`, reponse: net(t * n / 100), explication: calculPourcent(t, n) });
    }
    const Q = parmi(QUANTITES.filter(x => !x.taux || x.taux.includes(t)));
    const n = nombrePour(t, Q.min, Q.max, false, Q.pas);
    return nombre({
      consigne: 'Résous le problème',
      enonce: Q.texte(t, n, parmi(ENFANTS)),
      reponse: net(t * n / 100),
      unite: Q.unite,
      explication: `On calcule ${mesure(t, '%')} de ${ecrire(n)}.<br>${calculPourcent(t, n)}`,
    });
  }

  function questionAppliquerChoix() {
    const t = parmi(TAUX);
    const n = nombrePour(t, 20, 300);
    const r = net(t * n / 100);
    // Les erreurs : soustraire (80 − 35), diviser par le pourcentage (5 % → ÷ 5), la virgule, donner le reste,
    // se tromper de 5 % ou de 10 % (seulement si le résultat est entier : sinon la bonne réponse se devinerait)
    const entiers = [n - t, r * 10, n - r, (t - 5) * n / 100, (t + 5) * n / 100, (t - 10) * n / 100, (t + 10) * n / 100]
      .map(net).filter(Number.isInteger);
    const candidats = [...entiers, r / 10, ...(t <= 10 && Number.isInteger(n / t) ? [n / t] : [])];
    const q = choix({
      consigne: 'Choisis le bon résultat',
      enonce: `${mesure(t, '%')} de ${ecrire(n)} = ___`,
      reponse: r,
      pieges: positifs(candidats).filter(v => v < n && auCentieme(v)),
      explication: calculPourcent(t, n),
    });
    if (q.choix.includes(ecrire(n - t))) q.explication += `<br>⚠️ Ce n’est pas ${ecrire(n)} − ${ecrire(t)} : on ne soustrait pas ${ecrire(t)} !`;
    return q;
  }

  // Calculer un pourcentage : une part d'un total
  const PROPORTIONS = [
    { totaux: [20, 25, 40, 50, 60], texte: (a, b) => `Sur les ${ecrire(b)} élèves du club de sport, ${ecrire(a)} font du va’a. Quel pourcentage des élèves du club font du va’a ?` },
    { totaux: [20, 25, 40, 50, 200], texte: (a, b) => `Roxy a semé ${ecrire(b)} graines, et ${ecrire(a)} ont germé. Quel pourcentage des graines a germé ?` },
    { totaux: [10, 20, 25, 40, 50], texte: (a, b, p) => `${p.nom} a réussi ${ecrire(a)} tirs au but sur ${ecrire(b)}. Quel est son pourcentage de réussite ?` },
    { totaux: [20, 25, 40, 50, 80], texte: (a, b) => `Mamie a fait ${ecrire(b)} pots de confiture, dont ${ecrire(a)} à la mangue. Quel pourcentage des pots sont à la mangue ?` },
    { totaux: [20, 25], texte: (a, b) => `Dans une classe de ${ecrire(b)} élèves, ${ecrire(a)} portent des lunettes. Quelle est la fréquence des élèves à lunettes, en pourcentage ?` },
  ];

  // Une part a d'un total b qui fait un pourcentage entier (ni 0 %, ni 100 %, et au moins 2)
  function partDe(b) {
    const possibles = [];
    for (let a = 2; a < b; a++) if (Number.isInteger(net(100 * a / b))) possibles.push(a);
    return parmi(possibles);
  }
  // 14 sur 40 = 7/20 = 35/100 = 35 %
  function versPourcent(a, b) {
    const p = net(100 * a / b);
    const [c, d] = simplifier(a, b);
    return `${frac(a, b)}${d !== b ? ` = ${frac(c, d)}` : ''}${d !== 100 ? ` = ${frac(p, 100)}` : ''} = <b>${mesure(p, '%')}</b>`;
  }

  function questionCalculer(avecBoutons) {
    const P = parmi(PROPORTIONS);
    const b = parmi(P.totaux);
    const a = partDe(b);
    const p = net(100 * a / b);
    const explication = `On écrit la proportion ${ecrire(a)} sur ${ecrire(b)}, puis on la transforme en fraction sur 100 :<br>${versPourcent(a, b)}.`;
    const enonce = P.texte(a, b, parmi(ENFANTS));
    if (!avecBoutons) {
      return nombre({ consigne: 'Calcule le pourcentage', enonce, reponse: p, unite: '%', explication });
    }
    // Les erreurs : la part prise pour le pourcentage, le reste, un mauvais multiplicateur, un voisin
    const candidats = [a, 100 - p, b - a, 2 * a, p + 5, p - 5, p + 10, p - 10];
    return choix({
      consigne: 'Choisis le bon pourcentage',
      enonce,
      reponse: mesure(p, '%'),
      pieges: candidats.filter(v => Number.isInteger(v) && v > 0 && v < 100 && v !== p).map(v => mesure(v, '%')),
      explication: explication + (a !== p ? `<br>⚠️ ${ecrire(a)} sur ${ecrire(b)}, ce n’est pas ${mesure(a, '%')} : il faut ramener à 100.` : ''),
    });
  }

  // Les soldes et les augmentations : des prix en francs, ronds (pas : l'écart entre deux prix possibles)
  const ARTICLES = [
    { nom: 'un t-shirt', min: 1500, max: 3500, pas: 100 }, { nom: 'un jeu de société', min: 2000, max: 6000, pas: 500 },
    { nom: 'des chaussures de sport', min: 5000, max: 12000, pas: 500, pluriel: true }, { nom: 'un sac à dos', min: 2000, max: 6000, pas: 500 },
    { nom: 'une trousse', min: 800, max: 2000, pas: 100, f: true }, { nom: 'un livre', min: 1500, max: 3000, pas: 100 },
    { nom: 'un vélo', min: 20000, max: 60000, pas: 5000 }, { nom: 'un masque de plongée', min: 2000, max: 5000, pas: 500 },
    { nom: 'une planche de bodyboard', min: 6000, max: 15000, pas: 1000, f: true },
  ];
  const HAUSSES = [
    { nom: 'L’abonnement au club de va’a', min: 10000, max: 20000, pas: 1000 },
    { nom: 'Le prix de la place de cinéma', min: 1000, max: 1500, pas: 100 },
    { nom: 'Le prix du kilo de crevettes', min: 1500, max: 4000, pas: 100 },
    { nom: 'Le prix du ticket de bus', min: 150, max: 300, pas: 50 },
  ];

  function soldes() {
    // (t % d'un prix en centaines de francs : le résultat est toujours un nombre entier de francs)
    const cinqDeMoins = (t, P) => (t > 5 ? [net((t - 5) * P / 100)] : []);
    const cinqDePlus = (t, P) => net((t + 5) * P / 100);
    if (Math.random() < 0.25) {
      const H = parmi(HAUSSES);
      const t = parmi([5, 10, 15, 20]);
      const P = nombrePour(t, H.min, H.max, false, H.pas);
      const r = net(t * P / 100);
      return {
        enonce: `${H.nom}, ${francs(P)}, augmente de ${mesure(t, '%')}. Quel est le nouveau prix ?`,
        reponse: net(P + r),
        explication: `L’augmentation : ${mesure(t, '%')} de ${francs(P)}. ${calculPourcent(t, P, francs).replace(/<\/?b>/g, '')}<br>`
          + `Le nouveau prix : ${francs(P)} + ${francs(r)} = <b>${francs(net(P + r))}</b>.`,
        // ajouter t francs, donner l'augmentation, enlever au lieu d'ajouter, deux fois l'augmentation, la moitié, 5 % de trop ou de moins
        pieges: [P + t, r, P - r, P + 2 * r, P + r / 2, P + cinqDePlus(t, P), ...cinqDeMoins(t, P).map(v => P + v)],
      };
    }
    const A = parmi(ARTICLES);
    const t = parmi([10, 20, 30, 40, 15, 25, 50]);
    const P = nombrePour(t, A.min, A.max, false, A.pas);
    const r = net(t * P / 100);
    const debut = `Pendant les soldes, ${A.nom} à ${francs(P)} ${A.pluriel ? 'sont' : 'est'} à ${MOINS}${mesure(t, '%')}.`;
    if (Math.random() < 0.35) {
      return {
        enonce: `${debut} Quel est le montant de la réduction ?`,
        reponse: r,
        explication: `La réduction, c’est ${mesure(t, '%')} du prix.<br>${calculPourcent(t, P, francs)}`,
        // enlever t francs, donner le nouveau prix, le double, la moitié, 10 % au lieu de t %, 5 % de trop ou de moins
        // (le piège « t F » seulement s'il a l'ordre de grandeur de la réduction : « 25 F » pour un vélo ne tromperait personne)
        pieges: [...(t * 10 >= r ? [t] : []), P - r, r * 2, r / 2, ...(t !== 10 ? [P / 10] : []), cinqDePlus(t, P), ...cinqDeMoins(t, P)].filter(v => v < P),
      };
    }
    return {
      enonce: `${debut} Quel est ${A.pluriel ? 'leur' : 'son'} nouveau prix ?`,
      reponse: net(P - r),
      explication: `La réduction : ${mesure(t, '%')} de ${francs(P)}. ${calculPourcent(t, P, francs).replace(/<\/?b>/g, '')}<br>`
        + `Le nouveau prix : ${francs(P)} − ${francs(r)} = <b>${francs(net(P - r))}</b>.`
        + `<br>⚠️ On n’enlève pas ${francs(t)}, mais ${mesure(t, '%')} du prix !`,
      // enlever t francs, donner la réduction, ajouter au lieu d'enlever, enlever deux fois ou à moitié, enlever 10 % au lieu de t %,
      // enlever 5 % de trop ou de moins
      pieges: [P - t, r, P + r, P - 2 * r, P - r / 2, ...(t > 10 ? [P - P / 10] : []), P - cinqDePlus(t, P), ...cinqDeMoins(t, P).map(v => P - v)],
    };
  }

  function questionSoldes(avecBoutons) {
    const S = soldes();
    if (!avecBoutons) return nombre({ consigne: 'Résous le problème', enonce: S.enonce, reponse: S.reponse, enFrancs: true, explication: S.explication });
    return choix({
      consigne: 'Résous le problème',
      enonce: S.enonce,
      reponse: francs(S.reponse),
      pieges: enFrancs(S.pieges).filter(v => v !== francs(S.reponse)),
      explication: S.explication,
    });
  }

  function vraiFauxPourcent() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['calcul', 'diviser', 'soldes']);
    if (forme === 'calcul') {
      const t = parmi(TAUX);
      const n = nombrePour(t, 20, 200);
      const r = net(t * n / 100);
      const faux = parmi(positifs([n - t, r * 10, n - r, (t + 10) * n / 100]).filter(v => v !== r && v < n && auCentieme(v)));
      return vraiFaux({ enonce: `${mesure(t, '%')} de ${ecrire(n)} = ${ecrire(vrai ? r : faux)}`, vrai, explication: calculPourcent(t, n) });
    }
    if (forme === 'diviser') {
      // Prendre t %, c'est diviser par 100 ÷ t (10 % → ÷ 10 ; 5 % → ÷ 20 ; 20 % → ÷ 5…)
      const [t, d] = vrai
        ? parmi([[10, 10], [20, 5], [25, 4], [50, 2], [5, 20], [1, 100]])
        : parmi([[20, 20], [25, 25], [5, 5], [50, 50], [20, 2], [4, 40]]);
      const bon = 100 / t;
      return vraiFaux({
        enonce: `Prendre ${mesure(t, '%')} d’un nombre, c’est le diviser par ${ecrire(d)}.`,
        vrai,
        explication: `${mesure(t, '%')} = ${frac(t, 100)}${t !== 1 ? ` = ${frac(1, bon)}` : ''} : prendre ${mesure(t, '%')}, c’est prendre ${t === 1 ? 'un centième' : `1 part sur ${ecrire(bon)}`}, `
          + `donc diviser par <b>${ecrire(bon)}</b>.<br>👉 ${mesure(t, '%')} de 200 = 200 ÷ ${ecrire(bon)} = ${ecrire(200 / bon)}.`,
      });
    }
    const A = parmi(ARTICLES.filter(x => !x.pluriel));
    const t = parmi([10, 20, 25, 50]);
    const P = nombrePour(t, A.min, A.max, false, A.pas);
    const r = net(t * P / 100);
    const bon = net(P - r);
    // les erreurs : enlever t francs, donner la réduction, enlever deux fois la réduction, enlever 10 % au lieu de t %,
    // enlever 5 % de trop ou de moins (jamais un prix soldé plus cher qu'avant : ce serait trop facile)
    const faux = parmi(positifs([P - t, r, P - 2 * r, ...(t !== 10 ? [P - P / 10] : []), bon + P / 20, bon - P / 20])
      .filter(v => Number.isInteger(v) && v !== bon && v < P));
    return vraiFaux({
      enonce: `${majuscule(A.nom)} à ${francs(P)}, soldé${A.f ? 'e' : ''} à ${MOINS}${mesure(t, '%')}, coûte ${francs(vrai ? bon : faux)}.`,
      vrai,
      explication: `La réduction : ${mesure(t, '%')} de ${francs(P)} = ${francs(r)}.<br>Le nouveau prix : ${francs(P)} − ${francs(r)} = <b>${francs(bon)}</b>.`,
    });
  }

  ajouterEtape({
    id: '5e-donnees-pourcentages',
    banque: ['appliquer', 'appliquer', 'appliquerChoix', 'appliquerChoix', 'calculer', 'calculerChoix', 'calculerChoix',
      'soldes', 'soldesChoix', 'soldesChoix', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'appliquer') return questionAppliquer();
      if (sorte === 'appliquerChoix') return questionAppliquerChoix();
      if (sorte === 'calculer') return questionCalculer(false);
      if (sorte === 'calculerChoix') return questionCalculer(true);
      if (sorte === 'soldes') return questionSoldes(false);
      if (sorte === 'soldesChoix') return questionSoldes(true);
      return vraiFauxPourcent();
    },
    titreLecon: 'Les pourcentages',
    lecon: `
      <p>« 35&nbsp;% » se lit « 35 pour cent » : c’est ${frac(35, 100)}. Prendre <b>t&nbsp;%</b> d’un nombre, c’est le multiplier par ${frac('t', 100)} :</p>
      <p>👉 <i>12&nbsp;% de 75 = 75 × 12 ÷ 100 = 900 ÷ 100 = 9</i></p>
      <h4>De tête, avec 10&nbsp;% et 5&nbsp;%</h4>
      <p>10&nbsp;%, c’est ÷ 10 ; 5&nbsp;%, c’est la moitié de 10&nbsp;% ; 50&nbsp;% = ÷ 2 ; 25&nbsp;% = ÷ 4.<br>
        👉 <i>35&nbsp;% de 80 : 10&nbsp;% = 8 et 5&nbsp;% = 4, donc 35&nbsp;% = 3 × 8 + 4 = 28.</i></p>
      <h4>Calculer un pourcentage</h4>
      <p>On écrit la proportion, puis on la transforme en fraction sur 100 :
        <i>14 élèves sur 40 : ${frac(14, 40)} = ${frac(7, 20)} = ${frac(35, 100)} = 35&nbsp;%.</i> C’est aussi une <b>fréquence</b>, écrite en pourcentage.</p>
      <h4>Soldes et augmentations</h4>
      <p><i>Un t-shirt à 2&nbsp;500&nbsp;F est à −20&nbsp;%. La réduction : 20&nbsp;% de 2&nbsp;500&nbsp;F = 500&nbsp;F. Le nouveau prix : 2&nbsp;500 − 500 = 2&nbsp;000&nbsp;F.</i><br>
        Pour une augmentation, on <b>ajoute</b> : <i>une place de cinéma à 1&nbsp;200&nbsp;F augmente de 10&nbsp;% ; 10&nbsp;% de 1&nbsp;200&nbsp;F = 120&nbsp;F, donc le nouveau prix est 1&nbsp;200 + 120 = 1&nbsp;320&nbsp;F.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> prendre t&nbsp;%, c’est diviser par 100 ÷ t : 20&nbsp;% → ÷ 5 ; 5&nbsp;% → ÷ 20.</div>
      <p>⚠️ 20&nbsp;% de 2&nbsp;500&nbsp;F, ce n’est pas 2&nbsp;500 − 20 ! Et 5&nbsp;%, ce n’est pas ÷ 5.</p>
    `,
  });

  // ======================================================================
  // 3. Les ratios
  // ======================================================================
  // Des ratios « les plus simples » (les deux nombres n'ont pas de diviseur commun), dans un ordre ou dans l'autre
  const PAIRES = [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7]];
  function paire(maxParts = 9) {
    const [a, b] = parmi(PAIRES.filter(([x, y]) => x + y <= maxParts));
    return Math.random() < 0.5 ? [a, b] : [b, a];
  }
  const TRIPLES = [[1, 2, 3], [1, 1, 2], [2, 3, 5], [1, 2, 2], [1, 3, 4], [2, 2, 1], [3, 2, 1]];
  // Ce qu'on partage (francs : de l'argent, en centaines de francs : une part vaut « max » centaines au plus)
  const A_PARTAGER = [
    { un: 'bonbon', des: 'bonbons', max: 60 }, { un: 'bille', des: 'billes', max: 80 },
    { un: 'letchi', des: 'letchis', max: 60 }, { un: 'coquillage', des: 'coquillages', max: 60 },
    { francs: true, max: 100 }, { francs: true, max: 100 },
  ];
  // Écrire une quantité partagée : « 21 bonbons » ou « 2 100 F »
  const quantite = (O, v) => (O.francs ? francs(v) : combien(v, O.un, O.des));
  // En francs, on partage des centaines de francs
  const centaines = O => (O.francs ? 100 : 1);

  function questionPartager() {
    const O = parmi(A_PARTAGER);
    const trois = Math.random() < 0.3;
    const gens = enfants(3);
    const parts = trois ? RM.melanger(TRIPLES)[0] : paire();
    const n = additionner(parts);
    const k = centaines(O) * entier(2, Math.floor(O.max / n));
    const T = n * k;
    const i = entier(0, parts.length - 1);
    const qui = gens[i];
    const noms = gens.slice(0, parts.length).map(g => g.nom);
    const pourQui = parts.map((p, j) => `${combien(p, 'part')} pour ${noms[j]}`).join(', ');
    const donneur = parmi(['Mamie', 'Papi']);
    const debut = O.francs
      ? `${donneur} partage ${francs(T)} entre ${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`
      : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]} se partagent ${quantite(O, T)}`;
    const question = O.francs ? `Combien ${qui.nom} reçoit-${qui.il} ?` : `Combien ${de(O.des)} ${qui.nom} reçoit-${qui.il} ?`;
    return nombre({
      consigne: 'Partage dans le ratio',
      enonce: `${debut} dans le ratio ${ratio(...parts)} (${pourQui}). ${question}`,
      reponse: parts[i] * k,
      unite: O.francs ? '' : O.des,
      enFrancs: Boolean(O.francs),
      explication: `On compte les parts : ${somme(parts)} = ${combien(n, 'part')}.<br>Une part : ${ecrire(T)} ÷ ${ecrire(n)} = ${quantite(O, k)}.<br>`
        + `${qui.nom} a ${combien(parts[i], 'part')} : ${ecrire(parts[i])} × ${ecrire(k)} = <b>${quantite(O, parts[i] * k)}</b>.`,
    });
  }

  function questionPartagerChoix() {
    const O = parmi(A_PARTAGER);
    const [a, b] = paire();
    const n = a + b;
    const k = centaines(O) * entier(Math.max(2, Math.ceil(12 / n)), Math.floor(O.max / n));
    const T = n * k;
    const grande = Math.random() < 0.5;
    const m = grande ? Math.max(a, b) : Math.min(a, b);
    const autre = n - m;
    const e = O.francs ? francs : ecrire;
    // Les erreurs : l'autre part, une seule part, partager en deux moitiés, une part de trop ou de moins,
    // prendre les m/autre du total (au lieu des m/n), et (hors des francs) une erreur de comptage
    const candidats = [autre * k, k, T / 2, (m + 1) * k, (m - 1) * k, T - k, T * m / autre, ...(O.francs ? [] : [m * k + 1, m * k - 1])];
    return choix({
      consigne: 'Partage dans le ratio',
      enonce: `On partage ${quantite(O, T)} dans le ratio ${ratio(a, b)}. Quelle est la plus ${grande ? 'grande' : 'petite'} part ?`,
      reponse: e(m * k),
      pieges: positifs(candidats).filter(v => Number.isInteger(v) && v < T).map(e),
      explication: `On compte les parts : ${ecrire(a)} + ${ecrire(b)} = ${combien(n, 'part')}. Une part : ${ecrire(T)} ÷ ${ecrire(n)} = ${e(k)}.<br>`
        + `La plus ${grande ? 'grande' : 'petite'} part, c’est ${combien(m, 'part')} : ${ecrire(m)} × ${ecrire(k)} = <b>${e(m * k)}</b>.`,
    });
  }

  // Trouver le ratio de deux quantités : [la phrase, le nom des deux quantités, un multiplicateur « rond »]
  const GROUPES = [
    { texte: (x, y) => `Au club de théâtre, il y a ${ecrire(x)} filles et ${ecrire(y)} garçons.`, noms: ['filles', 'garçons'], les: ['les filles', 'les garçons'], fois: [2, 3, 4, 5, 6] },
    { texte: (x, y) => `Dans le panier, il y a ${ecrire(x)} mangues et ${ecrire(y)} papayes.`, noms: ['mangues', 'papayes'], les: ['les mangues', 'les papayes'], fois: [2, 3, 4, 6] },
    { texte: (x, y) => `En snorkeling dans le lagon, Roxy a vu ${ecrire(x)} poissons-clowns et ${ecrire(y)} poissons-perroquets.`,
      noms: ['poissons-clowns', 'poissons-perroquets'], les: ['les poissons-clowns', 'les poissons-perroquets'], fois: [2, 3, 4, 5] },
    { texte: (x, y) => `Dans la trousse de Roxy, il y a ${ecrire(x)} crayons et ${ecrire(y)} feutres.`, noms: ['crayons', 'feutres'], les: ['les crayons', 'les feutres'], fois: [2, 3, 4] },
    { texte: (x, y) => `Mamie vend ${ecrire(x)} pots de miel et ${ecrire(y)} pots de confiture.`, noms: ['miel', 'confiture'], les: ['le miel', 'la confiture'], fois: [2, 3, 4, 5, 6] },
  ];

  function questionTrouverRatio() {
    const G = parmi(GROUPES);
    const [a, b] = paire();
    const g = parmi(G.fois);
    const [x, y] = [a * g, b * g];
    const alEnvers = Math.random() < 0.35;
    const [p, q] = alEnvers ? [b, a] : [a, b];
    const [n1, n2] = alEnvers ? [G.noms[1], G.noms[0]] : G.noms;
    const [l1, l2] = alEnvers ? [G.les[1], G.les[0]] : G.les;
    // la simplification pas finie (12 : 18 → 6 : 9), quand on peut diviser par 2 puis encore
    const pasFini = g === 4 || g === 6 ? ratio(p * g / 2, q * g / 2) : null;
    const q2 = choix({
      consigne: 'Trouve le ratio le plus simple',
      enonce: `${G.texte(x, y)} Quel est le ratio ${n1} : ${n2} ?`,
      reponse: ratio(p, q),
      // l'ordre inversé, une quantité comparée au total, la simplification pas finie
      pieges: [ratio(q, p), ratio(p, p + q), ratio(q, p + q), ...(pasFini ? [pasFini] : [])],
      explication: `${ecrire(x)} et ${ecrire(y)} se divisent tous les deux par ${ecrire(g)} : ${ratio(x, y)} = ${ratio(a, b)}.<br>`
        + `L’ordre compte : d’abord ${l1}, puis ${l2}. Le ratio ${n1} : ${n2} est <b>${ratio(p, q)}</b>.`,
    });
    if (pasFini && q2.choix.includes(pasFini)) q2.explication += `<br>⚠️ ${pasFini} se simplifie encore : ce n’est pas le ratio le plus simple.`;
    return q2;
  }

  // Des ratios égaux : multiplier (ou diviser) les deux nombres par le même nombre
  function questionRatioEgal() {
    const [a, b] = paire(8);
    const m = entier(2, 6);
    const [x, y] = [a * m, b * m];
    const d = entier(1, 4);
    // les pièges ne doivent jamais être égaux au ratio a : b
    const pasEgal = ([u, v]) => u > 0 && v > 0 && u * b !== v * a;
    if (Math.random() < 0.5) {
      const candidats = [[a + d, b + d], [y, x], [x, b * (m + 1)], [a * (m + 1), y], [a + m, b + m]].filter(pasEgal);
      return choix({
        consigne: 'Trouve le ratio égal',
        enonce: `Quel ratio est égal à ${ratio(a, b)} ?`,
        reponse: ratio(x, y),
        pieges: candidats.map(([u, v]) => ratio(u, v)),
        explication: `On multiplie les deux nombres par ${ecrire(m)} : ${ecrire(a)} × ${ecrire(m)} = ${ecrire(x)} et ${ecrire(b)} × ${ecrire(m)} = ${ecrire(y)}.<br>`
          + `Donc ${ratio(a, b)} = <b>${ratio(x, y)}</b>.<br>⚠️ Ajouter le même nombre aux deux ne donne pas un ratio égal.`,
      });
    }
    // Dans l'autre sens : simplifier (les pièges : enlever le même nombre aux deux, l'ordre inversé…)
    const candidats = [[b, a], [x - d, y - d], [a + 1, b + 1], [a, y], [x, b]].filter(pasEgal);
    return choix({
      consigne: 'Trouve le ratio égal',
      enonce: `Quel ratio est égal à ${ratio(x, y)} ?`,
      reponse: ratio(a, b),
      pieges: candidats.map(([u, v]) => ratio(u, v)),
      explication: `On divise les deux nombres par ${ecrire(m)} : ${ecrire(x)} ÷ ${ecrire(m)} = ${ecrire(a)} et ${ecrire(y)} ÷ ${ecrire(m)} = ${ecrire(b)}.<br>`
        + `Donc ${ratio(x, y)} = <b>${ratio(a, b)}</b>.`,
    });
  }

  function questionRatioTrou() {
    const [a, b] = paire(8);
    const m = entier(2, 8);
    const [x, y] = [a * m, b * m];
    const sorte = parmi(['multiplier', 'multiplier', 'diviser']);
    if (sorte === 'multiplier') {
      const enPremier = Math.random() < 0.5;
      return nombre({
        consigne: 'Complète l’égalité des ratios',
        enonce: enPremier ? `${ratio(a, b)} = ${ecrire(x)} : ___` : `${ratio(a, b)} = ___ : ${ecrire(y)}`,
        reponse: enPremier ? y : x,
        explication: enPremier
          ? `On passe de ${ecrire(a)} à ${ecrire(x)} en multipliant par ${ecrire(m)}, donc ${ecrire(b)} × ${ecrire(m)} = <b>${ecrire(y)}</b>.`
          : `On passe de ${ecrire(b)} à ${ecrire(y)} en multipliant par ${ecrire(m)}, donc ${ecrire(a)} × ${ecrire(m)} = <b>${ecrire(x)}</b>.`,
      });
    }
    return nombre({
      consigne: 'Complète l’égalité des ratios',
      enonce: `${ratio(x, y)} = ${ecrire(a)} : ___`,
      reponse: b,
      explication: `On passe de ${ecrire(x)} à ${ecrire(a)} en divisant par ${ecrire(m)}, donc ${ecrire(y)} ÷ ${ecrire(m)} = <b>${ecrire(b)}</b>.`,
    });
  }

  // Les mélanges : [ratios possibles], la valeur d'une part (dans l'unité), « du sirop » (pour les phrases)
  const MELANGES = [
    { a: 'sirop', b: 'eau', duA: 'du sirop', duB: 'de l’eau', court: ['Sirop', 'eau'], unite: 'cL', ratios: [[1, 4], [1, 5], [1, 6], [1, 7]],
      parts: [2, 3, 4, 5, 10, 15, 20], intro: 'Pour préparer une boisson, on mélange du sirop et de l’eau', produit: 'de boisson' },
    { a: 'jus d’ananas', b: 'jus de mangue', duA: 'du jus d’ananas', duB: 'du jus de mangue', court: ['Jus d’ananas', 'jus de mangue'], unite: 'cL',
      ratios: [[2, 3], [3, 2], [1, 2], [3, 1]], parts: [5, 10, 15, 20], intro: 'Pour un jus de fruits, on mélange du jus d’ananas et du jus de mangue', produit: 'de jus de fruits' },
    { a: 'peinture bleue', b: 'peinture jaune', duA: 'du bleu', duB: 'du jaune', court: ['Bleu', 'jaune'], unite: 'L',
      ratios: [[2, 3], [3, 2], [1, 3], [3, 4]], parts: [1, 2, 3], intro: 'Pour obtenir du vert, on mélange de la peinture bleue et de la peinture jaune', produit: 'de peinture verte' },
    { a: 'farine', b: 'sucre', duA: 'de la farine', duB: 'du sucre', court: ['Farine', 'sucre'], unite: 'g',
      ratios: [[3, 2], [2, 1], [5, 2], [5, 3]], parts: [20, 25, 50, 100], intro: 'Pour une pâte à gâteau, on mélange de la farine et du sucre', produit: 'de mélange' },
    { a: 'ciment', b: 'sable', duA: 'du ciment', duB: 'du sable', court: ['Ciment', 'sable'], unite: 'kg',
      ratios: [[1, 3], [1, 4], [2, 5]], parts: [2, 5, 10], intro: 'Pour faire du mortier, on mélange du ciment et du sable', produit: 'de mortier' },
  ];

  function questionRecette(avecBoutons) {
    const M = parmi(MELANGES);
    const [ra, rb] = parmi(M.ratios);
    const s = parmi(M.parts);
    const [A, B, T] = [ra * s, rb * s, (ra + rb) * s];
    const q = v => mesure(v, M.unite);
    const p = parmi(ENFANTS);
    const sorte = parmi(['autre', 'autre', 'total']);
    let enonce;
    let reponse;
    let explication;
    let pieges;
    // (on cherche la 2e quantité à partir de la 1re, ou l'inverse)
    const versB = Math.random() < 0.6;
    if (sorte === 'autre') {
      const [donne, rDonne, cherche, rCherche, nomDonne, nomCherche] = versB ? [A, ra, B, rb, M.a, M.b] : [B, rb, A, ra, M.b, M.a];
      enonce = `${M.intro} dans le ratio ${ratio(ra, rb)}. ${p.nom} met ${q(donne)} ${de(nomDonne)}. Combien ${de(nomCherche)} doit-${p.il} mettre ?`;
      reponse = cherche;
      explication = rDonne === 1
        ? `Dans le ratio ${ratio(ra, rb)}, pour 1 part ${de(nomDonne)}, il y a ${combien(rCherche, 'part')} ${de(nomCherche)}.<br>`
          + `Il en faut ${ecrire(rCherche)} fois plus : ${ecrire(rCherche)} × ${ecrire(donne)} = <b>${q(cherche)}</b>.`
        : `${majuscule(nomDonne)} : ${combien(rDonne, 'part')}, donc une part = ${ecrire(donne)} ÷ ${ecrire(rDonne)} = ${q(s)}.<br>`
          + `${majuscule(nomCherche)} : ${combien(rCherche, 'part')}, donc ${ecrire(rCherche)} × ${ecrire(s)} = <b>${q(cherche)}</b>.`;
      // une part seule, une part de trop ou de moins, oublier de diviser, le total, le ratio à l'envers, autant que la quantité donnée,
      // diviser par toutes les parts, et l'erreur de l'addition (seulement si une part est petite : sinon, elle serait absurde)
      pieges = [s, (rCherche + 1) * s, (rCherche - 1) * s, T, donne * rDonne / rCherche, donne, cherche / 2, donne / (rDonne + rCherche)];
      if (rDonne > 1) pieges.push(donne * rCherche);
      if (s <= 5) pieges.push(donne + rCherche - rDonne);
    } else {
      const [cherche, rCherche, nomCherche] = versB ? [B, rb, M.b] : [A, ra, M.a];
      enonce = `${M.intro} dans le ratio ${ratio(ra, rb)}. ${p.nom} veut préparer ${q(T)} ${M.produit}. Combien ${de(nomCherche)} lui faut-il ?`;
      reponse = cherche;
      explication = `On compte les parts : ${ecrire(ra)} + ${ecrire(rb)} = ${combien(ra + rb, 'part')}. Une part : ${ecrire(T)} ÷ ${ecrire(ra + rb)} = ${q(s)}.<br>`
        + `${majuscule(nomCherche)} : ${combien(rCherche, 'part')}, donc ${ecrire(rCherche)} × ${ecrire(s)} = <b>${q(cherche)}</b>.`;
      // l'autre quantité, une part, diviser par la mauvaise chose, une part de trop ou de moins dans le compte des parts
      pieges = [T - cherche, s, T / rCherche, (rCherche + 1) * s, T / 2, rCherche * T / (ra + rb + 1), rCherche * T / (ra + rb - 1)];
    }
    if (!avecBoutons) return nombre({ consigne: 'Résous le problème', enonce, reponse, unite: M.unite, explication });
    return choix({
      consigne: 'Résous le problème',
      enonce,
      reponse: q(reponse),
      pieges: positifs(pieges).filter(v => Number.isInteger(v) && v !== reponse).map(q),
      explication,
    });
  }

  // Quelle fraction du total ? Dans le ratio 2 : 3, la 1re quantité fait 2/5 du total (et pas 2/3)
  function questionFractionTotal() {
    let ra;
    let rb;
    let enonce;
    let explicationNoms;
    const premiere = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      const M = parmi(MELANGES);
      [ra, rb] = parmi(M.ratios);
      enonce = `${M.court[0]} et ${M.court[1]} sont mélangés dans le ratio ${ratio(ra, rb)}. Quelle fraction du mélange est ${premiere ? M.duA : M.duB} ?`;
      explicationNoms = de(premiere ? M.a : M.b);
    } else {
      const [p, q] = enfants(2);
      [ra, rb] = paire();
      const qui = premiere ? p : q;
      enonce = `${p.nom} et ${q.nom} se partagent des billes dans le ratio ${ratio(ra, rb)}. Quelle fraction des billes ${qui.nom} reçoit-${qui.il} ?`;
      explicationNoms = `pour ${qui.nom}`;
    }
    const n = ra + rb;
    const [r, autre] = premiere ? [ra, rb] : [rb, ra];
    return choix({
      consigne: 'Choisis la bonne fraction',
      enonce,
      reponse: fracTexte(r, n),
      pieges: piegesFractions([r, n], [[r, autre], [autre, n], [1, 2], [1, n], [r, n + 1]]),
      explication: `Il y a ${ecrire(ra)} + ${ecrire(rb)} = ${combien(n, 'part')} en tout, dont ${combien(r, 'part')} ${explicationNoms} : c’est <b>${frac(r, n)}</b> du total.`
        + (r < autre ? `<br>⚠️ Ce n’est pas ${frac(r, autre)} : on compare au <b>total</b>, pas à l’autre quantité.` : ''),
    });
  }

  function vraiFauxRatio() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['egaux', 'fraction', 'partage']);
    if (forme === 'egaux') {
      const [a, b] = paire(8);
      const m = entier(2, 5);
      const d = entier(1, 3);
      const [u, v] = vrai ? [a * m, b * m] : parmi([[a + d, b + d], [b * m, a * m]]);
      return vraiFaux({
        enonce: `Les ratios ${ratio(u, v)} et ${ratio(a, b)} sont égaux.`,
        vrai,
        explication: vrai
          ? `On multiplie les deux nombres par ${ecrire(m)} : ${ratio(a, b)} = ${ratio(u, v)}. <b>Vrai</b>.`
          : `Pour avoir un ratio égal, il faut multiplier les deux nombres par le même nombre : ${ratio(a, b)} = ${ratio(a * m, b * m)}.<br>`
            + `${ratio(u, v)} n’est pas égal à ${ratio(a, b)}. <b>Faux</b>.`,
      });
    }
    if (forme === 'fraction') {
      const [a, b] = croissant(paire());
      return vraiFaux({
        enonce: `Dans le ratio ${ratio(a, b)}, la première quantité représente ${vrai ? frac(a, a + b) : frac(a, b)} du total.`,
        vrai,
        explication: `Il y a ${ecrire(a)} + ${ecrire(b)} = ${combien(a + b, 'part')} en tout, dont ${combien(a, 'part')} pour la première quantité : `
          + `c’est <b>${frac(a, a + b)}</b> du total${vrai ? '' : `, et pas ${frac(a, b)}`}.`,
      });
    }
    const [a, b] = croissant(paire());
    const k = 100 * entier(2, Math.floor(60 / (a + b)));
    const T = (a + b) * k;
    const bon = a * k;
    const faux = parmi([b * k, T * a / b, T / 2].filter(v => Number.isInteger(v) && v !== bon));
    return vraiFaux({
      enonce: `Si on partage ${francs(T)} dans le ratio ${ratio(a, b)}, la plus petite part est ${francs(vrai ? bon : faux)}.`,
      vrai,
      explication: `${ecrire(a)} + ${ecrire(b)} = ${combien(a + b, 'part')}. Une part : ${ecrire(T)} ÷ ${ecrire(a + b)} = ${francs(k)}.<br>`
        + `La plus petite part : ${ecrire(a)} × ${ecrire(k)} = <b>${francs(bon)}</b>.`,
    });
  }

  ajouterEtape({
    id: '5e-donnees-ratios',
    banque: ['partager', 'partager', 'partagerChoix', 'partagerChoix', 'trouver', 'trouver', 'egal', 'trou', 'recette', 'recetteChoix',
      'fraction', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'partager') return questionPartager();
      if (sorte === 'partagerChoix') return questionPartagerChoix();
      if (sorte === 'trouver') return questionTrouverRatio();
      if (sorte === 'egal') return questionRatioEgal();
      if (sorte === 'trou') return questionRatioTrou();
      if (sorte === 'recette') return questionRecette(false);
      if (sorte === 'recetteChoix') return questionRecette(true);
      if (sorte === 'fraction') return questionFractionTotal();
      return vraiFauxRatio();
    },
    titreLecon: 'Les ratios',
    lecon: `
      <p>Deux quantités sont dans le <b>ratio 2&nbsp;:&nbsp;3</b> quand, pour <b>2 parts</b> de la première, il y a <b>3 parts</b> de la seconde
        (toutes les parts sont égales). L’ordre compte : si le ratio filles&nbsp;:&nbsp;garçons est 2&nbsp;:&nbsp;3, le ratio garçons&nbsp;:&nbsp;filles est 3&nbsp;:&nbsp;2.</p>
      <h4>Partager dans un ratio</h4>
      <p>👉 <i>Kalia et Teva se partagent 35 letchis dans le ratio 2&nbsp;:&nbsp;3.</i><br>
        On compte les parts : 2 + 3 = 5 parts. Une part : 35 ÷ 5 = 7 letchis.<br>
        Kalia : 2 × 7 = <b>14</b> letchis ; Teva : 3 × 7 = <b>21</b> letchis. On vérifie : 14 + 21 = 35 ✔<br>
        Kalia a donc ${frac(2, 5)} des letchis (2 parts sur 5), et pas ${frac(2, 3)} ! Avec trois nombres (1&nbsp;:&nbsp;2&nbsp;:&nbsp;3), on compte 1 + 2 + 3 = 6 parts.</p>
      <h4>Des ratios égaux</h4>
      <p>Comme pour les fractions, on multiplie ou on divise les deux nombres par le <b>même nombre</b> :
        <i>12&nbsp;:&nbsp;18 = 2&nbsp;:&nbsp;3 (÷ 6) ; 2&nbsp;:&nbsp;3 = 10&nbsp;:&nbsp;15 (× 5).</i>
        Le ratio <b>le plus simple</b> s’écrit avec les plus petits nombres entiers possibles : 12 filles et 18 garçons → 2&nbsp;:&nbsp;3.</p>
      <h4>Les mélanges</h4>
      <p><i>Sirop et eau dans le ratio 1&nbsp;:&nbsp;4 : il faut 4 fois plus d’eau que de sirop. Pour 5&nbsp;cL de sirop : 4 × 5 = 20&nbsp;cL d’eau.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> commence toujours par trouver la valeur d’<b>une part</b>.</div>
      <p>⚠️ Ajouter le même nombre aux deux ne donne pas un ratio égal : 2&nbsp;:&nbsp;3 n’est pas égal à 3&nbsp;:&nbsp;4.</p>
    `,
  });

  // ======================================================================
  // 4. Effectifs et fréquences
  // ======================================================================
  // Les enquêtes : les valeurs possibles, le titre de la ligne, et des phrases
  const ENQUETES = [
    { intro: 'On a demandé aux élèves d’une classe combien ils ont de frères et sœurs.', titre: 'Frères et sœurs', valeurs: [0, 1, 2, 3, 4],
      voici: 'Voici leurs réponses', qui: ['élève', 'élèves'], auMoins: v => `Combien d’élèves ont au moins ${v >= 2 ? `${ecrire(v)} frères et sœurs` : '1 frère ou sœur'} ?` },
    { intro: 'Sione a noté le nombre de buts marqués par son équipe à chaque match.', titre: 'Buts marqués', valeurs: [0, 1, 2, 3, 4, 5],
      voici: 'Voici ce qu’il a noté', qui: ['match', 'matchs'], auMoins: v => `Lors de combien de matchs l’équipe a-t-elle marqué au moins ${combien(v, 'but')} ?` },
    { intro: 'On a demandé à des élèves combien de livres ils ont lus pendant les vacances.', titre: 'Livres lus', valeurs: [0, 1, 2, 3, 4, 5],
      voici: 'Voici leurs réponses', qui: ['élève', 'élèves'], auMoins: v => `Combien d’élèves ont lu au moins ${combien(v, 'livre')} ?` },
    { intro: 'Le club de basket a relevé la pointure de ses joueurs.', titre: 'Pointure', valeurs: [35, 36, 37, 38, 39, 40],
      voici: 'Voici les pointures', qui: ['joueur', 'joueurs'], auMoins: v => `Combien de joueurs chaussent du ${ecrire(v)} ou plus ?` },
    { intro: 'Mamie a compté les œufs pondus chaque jour par ses poules.', titre: 'Œufs pondus', valeurs: [2, 3, 4, 5, 6],
      voici: 'Voici ses relevés', qui: ['jour', 'jours'], auMoins: v => `Combien de jours les poules ont-elles pondu au moins ${combien(v, 'œuf')} ?` },
  ];

  // k nombres entiers d'au moins « min », dont la somme fait N (au hasard)
  function partition(N, k, min = 1) {
    const parts = Array(k).fill(min);
    for (let reste = N - k * min; reste > 0; reste--) parts[entier(0, k - 1)]++;
    return parts;
  }
  // Une enquête et ses effectifs (4 ou 5 valeurs qui se suivent, total N, un seul effectif le plus grand)
  function enquete(N) {
    const E = parmi(ENQUETES);
    const k = Math.min(E.valeurs.length, parmi([4, 5]));
    const debut = entier(0, E.valeurs.length - k);
    const valeurs = E.valeurs.slice(debut, debut + k);
    let effectifs;
    do { effectifs = partition(N, k); } while (effectifs.filter(x => x === Math.max(...effectifs)).length > 1);
    const html = tableau([[E.titre, ...valeurs], ['Effectif', ...effectifs]]);
    return { E, valeurs, effectifs, N, html };
  }

  // Une série « en vrac » : on compte les effectifs
  function questionSerie() {
    const E = parmi(ENQUETES);
    const valeurs = E.valeurs.slice(0, 5);
    const n = entier(12, 18);
    let serie;
    let v;
    do {
      serie = Array.from({ length: n }, () => parmi(valeurs.flatMap((x, i) => Array(i === 0 || i === 4 ? 1 : 3).fill(x))));
      v = parmi(valeurs);
    } while (serie.filter(x => x === v).length < 2);
    const effectif = serie.filter(x => x === v).length;
    const enonce = q => `${E.intro} ${E.voici} :<br>${liste(serie)}.<br>${q}`;
    if (Math.random() < 0.3) {
      return nombre({
        consigne: 'Lis la série',
        enonce: enonce('Quel est l’effectif total de cette série ?'),
        reponse: n,
        explication: `L’effectif total, c’est le nombre de données de la série : on les compte, il y en a <b>${ecrire(n)}</b>.`,
      });
    }
    const rangee = croissant(serie).map(x => (x === v ? `<b>${ecrire(x)}</b>` : ecrire(x))).join(`${ESPACE}; `);
    return nombre({
      consigne: 'Lis la série',
      enonce: enonce(`Quel est l’effectif de la valeur ${ecrire(v)} ?`),
      reponse: effectif,
      explication: `L’effectif d’une valeur, c’est le nombre de fois où elle apparaît. En rangeant la série :<br>${rangee}.<br>`
        + `La valeur ${ecrire(v)} apparaît <b>${ecrire(effectif)} fois</b>.`,
    });
  }

  // Une série courte (pour la course) : l'effectif d'une valeur, ou l'effectif total
  function questionSerieCourte() {
    // la valeur demandée apparaît de 2 à 5 fois, parmi 7 à 10 données
    const v = entier(0, 5);
    const effectif = parmi([2, 3, 3, 4, 4, 5]);
    const n = entier(Math.max(7, effectif + 3), 10);
    let serie;
    do {
      serie = RM.melanger([...Array(effectif).fill(v), ...Array.from({ length: n - effectif }, () => entierSauf(0, 5, [v]))]);
    } while (new Set(serie).size < 3);
    if (Math.random() < 0.3) {
      return choix({
        consigne: 'Lis la série',
        enonce: `Voici une série : ${liste(serie)}. Quel est son effectif total ?`,
        reponse: n,
        // le nombre de valeurs différentes, la somme des valeurs, une donnée oubliée ou en trop
        pieges: positifs([new Set(serie).size, additionner(serie), n - 1, n + 1, n - 2]).filter(x => x !== n),
        explication: `L’effectif total, c’est le nombre de données : on les compte, il y en a <b>${ecrire(n)}</b>.`,
      });
    }
    const q = choix({
      consigne: 'Lis la série',
      enonce: `Voici une série : ${liste(serie)}. Quel est l’effectif de la valeur ${ecrire(v)} ?`,
      reponse: effectif,
      // la valeur elle-même, une ou deux de trop ou de moins (on a mal compté), l'effectif d'une autre valeur, toutes les autres données
      pieges: positifs([v, effectif + 1, effectif - 1, effectif + 2, effectif - 2, serie.filter(x => x === parmi(serie.filter(y => y !== v))).length,
        n - effectif]).filter(x => x !== effectif && x < n),
      explication: `L’effectif de ${ecrire(v)}, c’est le nombre de fois où ${ecrire(v)} apparaît dans la série : <b>${ecrire(effectif)} fois</b>.`,
    });
    if (q.choix.includes(ecrire(v))) q.explication += `<br>⚠️ Ce n’est pas la valeur (${ecrire(v)}), mais le nombre de fois où elle apparaît.`;
    return q;
  }

  // Le vocabulaire : série statistique, valeur, effectif, effectif total, fréquence
  // [l'énoncé, la bonne réponse, les pièges, l'explication]
  const LES_MOTS = ['l’effectif', 'l’effectif total', 'la fréquence', 'la valeur', 'la moyenne'];
  const DES_MOTS = ['une série statistique', 'une valeur', 'un effectif', 'une fréquence', 'un effectif total'];
  const MOTS_STAT = [
    ['Le nombre de fois où une valeur apparaît dans une série, c’est…', 'l’effectif', LES_MOTS,
      'Dans la série 2 ; 5 ; 2 ; 3, la valeur 2 apparaît 2 fois : son <b>effectif</b> est 2.'],
    ['Le nombre de toutes les données d’une série, c’est…', 'l’effectif total', LES_MOTS,
      'La série 2 ; 5 ; 2 ; 3 a 4 données : son <b>effectif total</b> est 4.'],
    ['La somme de tous les effectifs d’une série, c’est…', 'l’effectif total', LES_MOTS,
      'Avec les effectifs 4, 9, 5 et 2, l’<b>effectif total</b> est 4 + 9 + 5 + 2 = 20 : c’est le nombre de données.'],
    ['L’effectif d’une valeur divisé par l’effectif total, c’est…', 'la fréquence', LES_MOTS,
      `Dans la série 2 ; 5 ; 2 ; 3, la valeur 2 apparaît 2 fois sur 4 : sa <b>fréquence</b> est ${frac(2, 4)}.`],
    ['On demande leur pointure à des élèves. Une réponse, comme « 37 », c’est…', 'une valeur', DES_MOTS,
      'Chaque réponse possible (35, 36, 37…) est une <b>valeur</b>. Le nombre d’élèves qui ont répondu 37, c’est son effectif.'],
    ['Toutes les réponses d’une enquête, mises ensemble, forment…', 'une série statistique', DES_MOTS,
      'Toutes les données d’une enquête forment une <b>série statistique</b>. Chaque réponse possible en est une valeur.'],
    ['Dans la série 4 ; 7 ; 4 ; 4 ; 9, la valeur 4 apparaît 3 fois. Ce nombre 3, c’est…', 'un effectif', DES_MOTS,
      'La valeur 4 apparaît 3 fois : 3 est l’<b>effectif</b> de la valeur 4. L’effectif total, lui, est 5.'],
  ];
  function questionVocabulaireStat() {
    const [enonce, mot, mots, explication] = parmi(MOTS_STAT);
    return choix({ consigne: 'Choisis le bon mot', enonce, reponse: mot, pieges: mots, explication });
  }

  function questionTableauEffectifs() {
    const { E, valeurs, effectifs, N, html } = enquete(entier(18, 32));
    const sorte = parmi(['total', 'mode', 'auMoins']);
    const consigne = 'Lis le tableau';
    if (sorte === 'total') {
      return choix({
        consigne,
        enonce: `${E.intro}${html}Quel est l’effectif total ?`,
        reponse: N,
        // le nombre de valeurs, la somme des valeurs, une retenue, un effectif oublié ou compté deux fois, un de trop ou de moins
        pieges: positifs([valeurs.length, ...(additionner(valeurs) < 2 * N ? [additionner(valeurs)] : []), N + 10, N - 10,
          N - parmi(effectifs), N + parmi(effectifs), N + 1, N - 1, Math.max(...effectifs)]).filter(v => v !== N),
        explication: `L’effectif total, c’est la somme des effectifs :<br>${somme(effectifs)} = <b>${ecrire(N)}</b>.`,
      });
    }
    if (sorte === 'mode') {
      const max = Math.max(...effectifs);
      const v = valeurs[effectifs.indexOf(max)];
      return choix({
        consigne,
        enonce: `${E.intro}${html}Quelle est la valeur qui a le plus grand effectif ?`,
        reponse: v,
        pieges: [max, ...valeurs].filter(x => x !== v),
        explication: `Le plus grand effectif est ${ecrire(max)} : il est sous la valeur <b>${ecrire(v)}</b>.<br>`
          + `⚠️ La réponse est la valeur (${ecrire(v)}), pas l’effectif (${ecrire(max)}).`,
      });
    }
    const i = entier(1, valeurs.length - 2);
    const v = valeurs[i];
    const retenus = effectifs.slice(i);
    const reponse = additionner(retenus);
    return choix({
      consigne,
      enonce: `${E.intro}${html}${E.auMoins(v)}`,
      reponse,
      // la valeur seule, sans elle, le reste, le nombre de valeurs, une valeur de trop, tout le monde, une erreur de calcul
      pieges: positifs([effectifs[i], reponse - effectifs[i], N - reponse, retenus.length, reponse + effectifs[i - 1], N, reponse + 1])
        .filter(x => x !== reponse),
      explication: `« Au moins ${ecrire(v)} », c’est ${valeurs.slice(i).map(x => ecrire(x)).join(', ')} : on additionne leurs effectifs.<br>`
        + `${somme(retenus)} = <b>${ecrire(reponse)}</b>.`,
    });
  }

  // La fréquence, écrite en fraction (on accepte aussi la fraction simplifiée)
  function questionFrequenceFraction() {
    const { E, valeurs, effectifs, N, html } = enquete(entier(15, 30));
    const i = entier(0, valeurs.length - 1);
    const e = effectifs[i];
    const [a, b] = simplifier(e, N);
    return fraction({
      consigne: 'Écris la fréquence sous forme de fraction',
      enonce: `${E.intro}${html}Quelle est la fréquence de la valeur ${ecrire(valeurs[i])} ?`,
      n: e,
      d: N,
      irreductible: false,
      explication: `Fréquence = effectif ÷ effectif total.<br>L’effectif total : ${somme(effectifs)} = ${ecrire(N)}.<br>`
        + `La valeur ${ecrire(valeurs[i])} a pour effectif ${ecrire(e)} : sa fréquence est <b>${frac(e, N)}</b>${b !== N ? ` = ${frac(a, b)}` : ''}.`,
    });
  }

  // La fréquence en pourcentage ou en nombre décimal (un effectif total de 20, 25 ou 50)
  function questionFrequenceNombre() {
    const { E, valeurs, effectifs, N, html } = enquete(parmi([20, 25, 50]));
    const i = entier(0, valeurs.length - 1);
    const e = effectifs[i];
    const p = net(100 * e / N);
    const enPourcent = Math.random() < 0.55;
    const calcul = `Fréquence = effectif ÷ effectif total = ${frac(e, N)}${N !== 100 ? ` = ${frac(p, 100)}` : ''}`;
    return nombre({
      consigne: enPourcent ? 'Écris la fréquence en pourcentage' : 'Écris la fréquence sous forme décimale',
      enonce: `${E.intro}${html}Quelle est la fréquence de la valeur ${ecrire(valeurs[i])} ?`,
      reponse: enPourcent ? p : net(e / N),
      unite: enPourcent ? '%' : '',
      explication: `L’effectif total : ${somme(effectifs)} = ${ecrire(N)}.<br>${calcul} = <b>${enPourcent ? mesure(p, '%') : ecrire(net(e / N))}</b>.`,
    });
  }

  const ACTIVITES = ['ont un chat', 'ont un chien', 'font du judo', 'font du foot', 'ont un vélo', 'font du va’a', 'savent nager le crawl'];

  function questionFrequenceChoix() {
    const N = parmi([10, 20, 25, 50]);
    let e;
    do { e = entier(2, N - 2); } while (N === 50 && e % 2 === 1 && Math.random() < 0.5);
    const activite = parmi(ACTIVITES);
    const enonce = `Sur ${ecrire(N)} élèves, ${ecrire(e)} ${activite}. Quelle est la fréquence des élèves qui ${activite} ?`;
    const f = net(e / N);
    const p = net(100 * e / N);
    if (Math.random() < 0.5) {
      return choix({
        consigne: 'Choisis la fréquence (en nombre décimal)',
        enonce,
        reponse: f,
        // l'effectif sur 100, le reste, le quotient à l'envers, sur 10…
        // l'effectif sur 100, le reste, sur 10, favorables sur défavorables, un de trop ou de moins
        pieges: positifs([e / 100, (N - e) / N, e / 10, e / (N - e), f + 0.1, (e + 1) / N, (e - 1) / N]).filter(v => v !== f && v < 1 && auCentieme(v)),
        explication: `Fréquence = effectif ÷ effectif total = ${ecrire(e)} ÷ ${ecrire(N)} = <b>${ecrire(f)}</b>.<br>Une fréquence est toujours entre 0 et 1.`,
      });
    }
    return choix({
      consigne: 'Choisis la fréquence (en pourcentage)',
      enonce,
      reponse: mesure(p, '%'),
      pieges: [e, 100 - p, N, p + 10, p - 10, 2 * e, p + 5, 100 * (e + 1) / N].filter(v => Number.isInteger(v) && v > 0 && v < 100 && v !== p).map(v => mesure(v, '%')),
      explication: `Fréquence = ${frac(e, N)}${N !== 100 ? ` = ${frac(p, 100)}` : ''} = <b>${mesure(p, '%')}</b>.`
        + (e !== p ? `<br>⚠️ ${ecrire(e)} élèves sur ${ecrire(N)}, ce n’est pas ${mesure(e, '%')} : il faut ramener à 100.` : ''),
    });
  }

  // Les diagrammes en barres : des réponses à une question (les noms sous les barres, et « qui viennent à vélo »…)
  const SONDAGES = [
    { intro: 'Les élèves de 5e B ont dit comment ils viennent au collège.', unite: 'élèves',
      reponses: [['bus', 'en bus'], ['vélo', 'à vélo'], ['à pied', 'à pied'], ['voiture', 'en voiture']],
      question: c => `Quel pourcentage des élèves viennent ${c} ?`, fraction: c => `Quelle fraction des élèves viennent ${c} ?` },
    { intro: 'Les élèves du club ont choisi leur fruit préféré.', unite: 'élèves',
      reponses: [['mangue', 'la mangue'], ['letchi', 'le letchi'], ['papaye', 'la papaye'], ['ananas', 'l’ananas']],
      question: c => `Quel pourcentage des élèves préfèrent ${c} ?`, fraction: c => `Quelle fraction des élèves préfèrent ${c} ?` },
    { intro: 'Les membres du club de sport ont choisi une activité.', unite: 'membres',
      reponses: [['foot', 'le foot'], ['judo', 'le judo'], ['danse', 'la danse'], ['va’a', 'le va’a'], ['natation', 'la natation']],
      question: c => `Quel pourcentage des membres ont choisi ${c} ?`, fraction: c => `Quelle fraction des membres ont choisi ${c} ?` },
  ];

  // Où s'arrête la barre ? Pile sur une ligne, ou au milieu entre deux lignes (une ligne tous les 2)
  const lireBarre = (nom, v) => (v % 2 === 0
    ? `La barre « ${nom} » s’arrête pile sur la ligne ${ecrire(v)}`
    : `La barre « ${nom} » s’arrête au milieu, entre les lignes ${ecrire(v - 1)} et ${ecrire(v + 1)}`);

  function questionBarres() {
    const S = parmi(SONDAGES);
    const sorte = parmi(['total', 'pourcent', 'pourcent', 'fraction']);
    const N = sorte === 'pourcent' ? parmi([20, 25, 50]) : entier(20, 36);
    const k = S.reponses.length;
    let effectifs;
    do { effectifs = partition(N, k, 2); } while (Math.max(...effectifs) > 20);
    const max = Math.ceil((Math.max(...effectifs) + 1) / 2) * 2;
    const figure = figures.barres({ donnees: S.reponses.map(([nom], i) => [nom, effectifs[i]]), max, pas: 2, unite: S.unite });
    const i = entier(0, k - 1);
    const [nom, dans] = S.reponses[i];
    const e = effectifs[i];
    if (sorte === 'total') {
      return nombre({
        consigne: 'Lis le diagramme, puis calcule',
        enonce: `${S.intro}${figure}Quel est l’effectif total ?`,
        reponse: N,
        unite: S.unite,
        explication: `L’effectif total, c’est la somme des hauteurs des barres :<br>${somme(effectifs)} = <b>${ecrire(N)}</b>.`,
      });
    }
    const lecture = `${lireBarre(nom, e)} : l’effectif est ${ecrire(e)}. L’effectif total : ${somme(effectifs)} = ${ecrire(N)}.<br>`;
    if (sorte === 'pourcent') {
      const p = net(100 * e / N);
      return nombre({
        consigne: 'Lis le diagramme, puis calcule',
        enonce: `${S.intro}${figure}${S.question(dans)}`,
        reponse: p,
        unite: '%',
        explication: `${lecture}Fréquence : ${frac(e, N)}${N !== 100 ? ` = ${frac(p, 100)}` : ''} = <b>${mesure(p, '%')}</b>.`,
      });
    }
    return choix({
      consigne: 'Lis le diagramme',
      enonce: `${S.intro}${figure}${S.fraction(dans)}`,
      reponse: fracTexte(e, N),
      pieges: piegesFractions([e, N], [[e, N - e], [N - e, N], [1, k], [e, 100], [e + 1, N], [e - 1, N]]),
      explication: `${lecture}La fraction : <b>${frac(e, N)}</b> (l’effectif sur l’effectif total).`,
    });
  }

  function vraiFauxEffectifs() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['tableau', 'tableau', 'somme', 'entre']);
    if (forme === 'tableau') {
      const { E, valeurs, effectifs, N, html } = enquete(entier(15, 30));
      const i = entier(0, valeurs.length - 1);
      const e = effectifs[i];
      const faux = parmi([[e, valeurs.length], [e + 1, N], [e, N + 1], [N - e, N], [e, N - e]].filter(f => f[0] < f[1] && !egales(f, [e, N])));
      const [n, d] = vrai ? [e, N] : faux;
      return vraiFaux({
        enonce: `${E.intro}${html}La fréquence de la valeur ${ecrire(valeurs[i])} est ${frac(n, d)}.`,
        vrai,
        explication: `Fréquence = effectif ÷ effectif total. L’effectif total : ${somme(effectifs)} = ${ecrire(N)}.<br>`
          + `La fréquence de ${ecrire(valeurs[i])} est <b>${frac(e, N)}</b>.`,
      });
    }
    if (forme === 'somme') {
      return vraiFaux({
        enonce: `La somme des fréquences de toutes les valeurs d’une série est égale à ${vrai ? '1' : 'l’effectif total'}.`,
        vrai,
        explication: 'La somme des <b>effectifs</b> est l’effectif total, et la somme des <b>fréquences</b> est égale à <b>1</b> (100&nbsp;%).<br>'
          + `👉 ${frac(9, 20)} + ${frac(7, 20)} + ${frac(4, 20)} = ${frac(20, 20)} = 1.`,
      });
    }
    const f = vrai ? parmi([0.25, 0.6, 0.05, 0.8, 0.45]) : parmi([1.2, 1.5, 2, 1.25, 3]);
    return vraiFaux({
      enonce: `Une fréquence peut être égale à ${ecrire(f)}.`,
      vrai,
      explication: `Une fréquence, c’est l’effectif d’une valeur divisé par l’effectif total : elle est toujours <b>entre 0 et 1</b>.<br>`
        + `${ecrire(f)} est ${vrai ? 'bien entre 0 et 1' : 'plus grand que 1'} : <b>${vrai ? 'Vrai' : 'Faux'}</b>.`,
    });
  }

  ajouterEtape({
    id: '5e-donnees-effectifs',
    banque: ['serie', 'serieCourte', 'serieCourte', 'tableau', 'tableau', 'frequenceFraction', 'frequenceNombre', 'frequenceChoix', 'frequenceChoix',
      'vocabulaire', 'barres', 'barres', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'serie') return questionSerie();
      if (sorte === 'serieCourte') return questionSerieCourte();
      if (sorte === 'vocabulaire') return questionVocabulaireStat();
      if (sorte === 'tableau') return questionTableauEffectifs();
      if (sorte === 'frequenceFraction') return questionFrequenceFraction();
      if (sorte === 'frequenceNombre') return questionFrequenceNombre();
      if (sorte === 'frequenceChoix') return questionFrequenceChoix();
      if (sorte === 'barres') return questionBarres();
      return vraiFauxEffectifs();
    },
    titreLecon: 'Effectifs et fréquences',
    lecon: `
      <h4>Le vocabulaire</h4>
      <p>On a demandé à des élèves leur nombre de frères et sœurs : toutes les réponses forment une <b>série statistique</b>.
        Chaque réponse possible (0, 1, 2…) est une <b>valeur</b>.<br>
        L’<b>effectif</b> d’une valeur, c’est le nombre de fois où elle apparaît. L’<b>effectif total</b>, c’est le nombre de données :
        la somme de tous les effectifs.</p>
      ${tableau([['Frères et sœurs', 0, 1, 2, 3], ['Effectif', 4, 9, 5, 2]])}
      <p>👉 9 élèves ont 1 frère ou sœur : la valeur 1 a pour effectif 9. L’effectif total : 4 + 9 + 5 + 2 = 20 élèves.</p>
      <h4>La fréquence</h4>
      <p><b>fréquence = effectif ÷ effectif total</b>. Elle s’écrit en fraction, en nombre décimal ou en pourcentage :<br>
        👉 fréquence de la valeur 1 : ${frac(9, 20)} = 0,45 = 45&nbsp;%.</p>
      <p>Dans un <b>diagramme en barres</b>, la hauteur de chaque barre est l’effectif : si elle s’arrête au milieu, entre les lignes 6 et 8, l’effectif est 7.</p>
      <p>Une fréquence est toujours <b>entre 0 et 1</b> (entre 0&nbsp;% et 100&nbsp;%), et la somme de toutes les fréquences fait <b>1</b> (100&nbsp;%).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour écrire une fréquence en pourcentage, écris-la avec 100 en bas :
        ${frac(9, 20)} = ${frac(45, 100)} = 45&nbsp;%.</div>
      <p>⚠️ Ne confonds pas la <b>valeur</b> (1 frère ou sœur) et son <b>effectif</b> (9 élèves) !</p>
    `,
  });

  // ======================================================================
  // 5. La moyenne
  // ======================================================================
  // Les séries : la phrase, les valeurs possibles, le nombre de valeurs, l'unité et la question
  // (sommeCredible : oublier de diviser donne un nombre qui n'est pas absurde, on peut le mettre sur un bouton)
  const SERIES = [
    { texte: p => `Voici les notes ${de(p.nom)} ce trimestre, sur 20 :`, min: 6, max: 19, n: [3, 4, 5], unite: '',
      question: p => `Quelle est la moyenne ${de(p.nom)} ?` },
    { texte: p => `${p.nom} a noté le nombre de pages lues chaque jour :`, min: 8, max: 40, n: [4, 5, 6], unite: 'pages', sommeCredible: true,
      question: p => `Combien de pages ${p.nom} a-t-${p.il} lues en moyenne par jour ?` },
    // (une seule saison par série : l'été, en février, ou l'hiver, en juillet)
    { texte: () => 'Voici les températures relevées à midi à Nouméa pendant plusieurs jours de février, en °C :', min: 27, max: 31, n: [4, 5, 6], unite: '°C',
      question: () => 'Quelle est la température moyenne ?' },
    { texte: () => 'Voici les températures relevées à midi à Nouméa pendant plusieurs jours de juillet, en °C :', min: 20, max: 24, n: [4, 5, 6], unite: '°C',
      question: () => 'Quelle est la température moyenne ?' },
    { texte: p => `${p.nom} a compté ses points à chaque partie de fléchettes :`, min: 10, max: 60, n: [3, 4, 5], unite: 'points', sommeCredible: true,
      question: p => `Combien de points ${p.nom} a-t-${p.il} marqués en moyenne par partie ?` },
    { texte: p => `${p.nom} a chronométré ses tours de piste, en secondes :`, min: 50, max: 75, n: [3, 4], unite: 's',
      question: () => 'Quel est son temps moyen pour un tour ?' },
  ];
  // n valeurs entre min et max (pas toutes égales), dont la moyenne a au plus un chiffre après la virgule
  function serieAvecMoyenne(n, min, max) {
    let valeurs;
    do { valeurs = Array.from({ length: n }, () => entier(min, max)); }
    while (new Set(valeurs).size < 2 || !Number.isInteger(net(additionner(valeurs) / n * 10)));
    return valeurs;
  }
  const expliquerMoyenne = (valeurs, e = ecrire) => `La somme : ${somme(valeurs)} = ${ecrire(additionner(valeurs))}.<br>`
    + `Il y a ${ecrire(valeurs.length)} valeurs : ${ecrire(additionner(valeurs))} ÷ ${ecrire(valeurs.length)} = <b>${e(net(additionner(valeurs) / valeurs.length))}</b>.`;

  function questionMoyenne(avecBoutons) {
    const S = parmi(SERIES);
    const p = parmi(ENFANTS);
    const n = parmi(S.n);
    const valeurs = serieAvecMoyenne(n, S.min, S.max);
    const total = additionner(valeurs);
    const m = net(total / n);
    const u = v => (S.unite ? mesure(v, S.unite) : ecrire(v));
    if (!avecBoutons) {
      return nombre({
        consigne: 'Calcule la moyenne',
        enonce: `${S.texte(p)} ${liste(valeurs)}.<br>${S.question(p)}`,
        reponse: m,
        unite: S.unite,
        explication: expliquerMoyenne(valeurs, u),
      });
    }
    // Sans situation (une série de nombres, pour la course) ou avec
    const court = Math.random() < 0.7;
    const ranges = croissant(valeurs);
    // Les erreurs : diviser par le mauvais nombre, oublier une valeur, la valeur du milieu, la moyenne des deux extrêmes, oublier de diviser
    const candidats = [total / (n - 1), total / (n + 1), (total - ranges[n - 1]) / n, (ranges[0] + ranges[n - 1]) / 2, m + 1, m - 1];
    if (n % 2 === 1) candidats.push(ranges[(n - 1) / 2]);
    if (court || S.sommeCredible) candidats.push(total);
    const q = choix({
      consigne: 'Calcule la moyenne',
      enonce: court ? `Quelle est la moyenne de la série ${liste(valeurs)} ?` : `${S.texte(p)} ${liste(valeurs)}.<br>${S.question(p)}`,
      reponse: court ? ecrire(m) : u(m),
      pieges: positifs(candidats).filter(v => v !== m && auCentieme(v)).map(court ? ecrire : u),
      explication: expliquerMoyenne(valeurs, court ? ecrire : u),
    });
    if (q.choix.includes(court ? ecrire(total) : u(total))) q.explication += '<br>⚠️ N’oublie pas de diviser la somme par le nombre de valeurs !';
    return q;
  }

  // La moyenne avec des effectifs
  const PONDEREES = [
    { intro: 'Sione a noté le nombre de buts marqués par son équipe.', titre: 'Buts marqués', effectif: 'Nombre de matchs',
      valeurs: [0, 1, 2, 3, 4], question: 'Combien de buts l’équipe a-t-elle marqués en moyenne par match ?', unite: '' },
    { intro: 'Voici les notes d’un groupe d’élèves au contrôle.', titre: 'Note', effectif: 'Nombre d’élèves',
      valeurs: [8, 10, 12, 14, 16, 18], question: 'Quelle est la note moyenne du groupe ?', unite: '' },
    { intro: 'Sur le parking de la plage, on a compté les personnes dans chaque voiture.', titre: 'Personnes', effectif: 'Nombre de voitures',
      valeurs: [1, 2, 3, 4, 5], question: 'Combien y a-t-il de personnes en moyenne par voiture ?', unite: '' },
    { intro: 'Mamie a compté les œufs pondus chaque jour par ses poules.', titre: 'Œufs pondus', effectif: 'Nombre de jours',
      valeurs: [3, 4, 5, 6, 7], question: 'Combien d’œufs les poules ont-elles pondus en moyenne par jour ?', unite: 'œufs' },
  ];

  function questionMoyenneEffectifs(avecBoutons) {
    const P = parmi(PONDEREES);
    const k = 4;
    const debut = entier(0, P.valeurs.length - k);
    const valeurs = P.valeurs.slice(debut, debut + k);
    const N = parmi([10, 10, 20]);
    let effectifs;
    let total;
    do {
      effectifs = partition(N, k);
      total = additionner(valeurs.map((v, i) => v * effectifs[i]));
    } while (!Number.isInteger(net(total / N * 10)) || effectifs.includes(N - k + 1));
    const m = net(total / N);
    const html = tableau([[P.titre, ...valeurs], [P.effectif, ...effectifs]]);
    const explication = `On multiplie chaque valeur par son effectif, puis on additionne :<br>`
      + `${valeurs.map((v, i) => `${ecrire(v)} × ${ecrire(effectifs[i])}`).join(' + ')} = ${ecrire(total)}.<br>`
      + `On divise par l’effectif total, ${ecrire(N)} : ${ecrire(total)} ÷ ${ecrire(N)} = <b>${ecrire(m)}</b>.`;
    const enonce = `${P.intro}${html}${P.question}`;
    if (!avecBoutons) return nombre({ consigne: 'Calcule la moyenne', enonce, reponse: m, unite: P.unite, explication });
    const simple = net(additionner(valeurs) / k);
    const q = choix({
      consigne: 'Calcule la moyenne',
      enonce,
      reponse: m,
      // les erreurs : oublier les effectifs, diviser par le nombre de colonnes (toujours là), et un seul voisin
      // (plutôt en dessous : « ÷ nombre de colonnes » est toujours au-dessus)
      pieges: [...positifs([simple, total / k]).filter(v => v !== m && auCentieme(v)),
        ...positifs(Math.random() < 0.65 ? [m - 0.5, m - 1] : [m + 0.5, m + 1])].slice(0, 3),
      explication,
    });
    if (q.choix.includes(ecrire(net(total / k)))) q.explication += `<br>⚠️ On ne divise pas par ${ecrire(k)} (le nombre de colonnes), mais par ${ecrire(N)}.`;
    return q;
  }

  // La note qu'il faut pour avoir une moyenne donnée
  function noteManquante() {
    const p = parmi(ENFANTS);
    if (Math.random() < 0.7) {
      let n;
      let t;
      let notes;
      let x;
      do {
        n = parmi([3, 4]);
        t = entier(10, 16);
        notes = Array.from({ length: n - 1 }, () => entier(7, 19));
        x = n * t - additionner(notes);
      } while (x < 4 || x > 20 || x === t);
      const deja = additionner(notes);
      return {
        enonce: `${p.nom} a eu ${listeEt(notes)} à ses ${ecrire(n - 1)} premiers contrôles. Quelle note doit-${p.il} avoir au ${ecrire(n)}e contrôle pour avoir exactement ${ecrire(t)} de moyenne ?`,
        reponse: x,
        unite: '',
        u: ecrire,
        explication: `Pour avoir ${ecrire(t)} de moyenne avec ${ecrire(n)} notes, il faut ${ecrire(n)} × ${ecrire(t)} = ${ecrire(n * t)} points en tout.<br>`
          + `${p.nom} a déjà ${somme(notes)} = ${ecrire(deja)} points. Il manque ${ecrire(n * t)} − ${ecrire(deja)} = <b>${ecrire(x)}</b>.`,
        // la moyenne visée, la moyenne actuelle, un mauvais nombre de notes, la moyenne de l'ancienne moyenne et de la nouvelle note,
        // une erreur de 1
        pieges: [t, deja / (n - 1), (n - 1) * t - deja, 2 * t - deja / (n - 1), x + 1, x - 1].filter(v => Number.isInteger(v) && v >= 0 && v <= 20),
      };
    }
    const n = 4;
    let t;
    let pages;
    let x;
    do {
      t = 5 * entier(3, 6);
      pages = Array.from({ length: n - 1 }, () => entier(8, 35));
      x = n * t - additionner(pages);
    } while (x < 5 || x > 45 || x === t);
    const deja = additionner(pages);
    return {
      enonce: `${p.nom} veut lire en moyenne ${ecrire(t)} pages par jour pendant ${ecrire(n)} jours. ${majuscule(p.il)} a lu ${liste(pages)} pages les 3 premiers jours. `
        + 'Combien de pages doit-' + p.il + ' lire le 4e jour ?',
      reponse: x,
      unite: 'pages',
      u: v => mesure(v, 'pages'),
      explication: `En ${ecrire(n)} jours, il faut ${ecrire(n)} × ${ecrire(t)} = ${ecrire(n * t)} pages en tout.<br>`
        + `${majuscule(p.il)} en a déjà lu ${somme(pages)} = ${ecrire(deja)}. Il reste ${ecrire(n * t)} − ${ecrire(deja)} = <b>${mesure(x, 'pages')}</b>.`,
      pieges: [t, deja / 3, 3 * t - deja, 2 * t - deja / 3, x + 1, x - 1].filter(v => Number.isInteger(v) && v > 0),
    };
  }

  function questionNoteManquante(avecBoutons) {
    const N = noteManquante();
    if (!avecBoutons) return nombre({ consigne: 'Résous le problème', enonce: N.enonce, reponse: N.reponse, unite: N.unite, explication: N.explication });
    return choix({
      consigne: 'Résous le problème',
      enonce: N.enonce,
      reponse: N.u(N.reponse),
      pieges: N.pieges.filter(v => v !== N.reponse).map(N.u),
      explication: N.explication,
    });
  }

  // Qui a la meilleure moyenne ? (le piège : plus de points en tout, mais aussi plus de notes)
  function serieDeMoyenne(n, m) {
    let notes;
    do {
      notes = Array.from({ length: n - 1 }, () => entier(Math.max(5, m - 5), Math.min(20, m + 5)));
      notes.push(n * m - additionner(notes));
    } while (notes[n - 1] < 5 || notes[n - 1] > 20 || new Set(notes).size < 2);
    return notes;
  }

  function questionComparer() {
    const [p, q] = enfants(2);
    const issue = parmi(['p', 'q', 'egal']);
    const [n1, n2] = RM.melanger([3, 4, 5]).slice(0, 2);
    const m1 = entier(10, 15);
    const m2 = issue === 'egal' ? m1 : m1 + (issue === 'q' ? 1 : -1) * entier(1, 2);
    const a = serieDeMoyenne(n1, m1);
    const b = serieDeMoyenne(n2, m2);
    const reponse = issue === 'p' ? p.nom : (issue === 'q' ? q.nom : 'Même moyenne');
    const ligne = (g, notes, m) => `${g.nom} : ${somme(notes)} = ${ecrire(additionner(notes))}, et ${ecrire(additionner(notes))} ÷ ${ecrire(notes.length)} = ${ecrire(m)}.`;
    // Le piège : celui qui a le plus de points en tout n'a pas la meilleure moyenne
    const [sa, sb] = [additionner(a), additionner(b)];
    let piege = '';
    if (issue === 'p' && sb > sa) piege = `<br>⚠️ ${q.nom} a plus de points en tout, mais aussi plus de notes !`;
    if (issue === 'q' && sa > sb) piege = `<br>⚠️ ${p.nom} a plus de points en tout, mais aussi plus de notes !`;
    return choix({
      consigne: 'Compare les moyennes',
      enonce: `Notes ${de(p.nom)} : ${liste(a)}. Notes ${de(q.nom)} : ${liste(b)}. Qui a la meilleure moyenne ?`,
      reponse,
      choix: [p.nom, q.nom, 'Même moyenne'],
      explication: `${ligne(p, a, m1)}<br>${ligne(q, b, m2)}<br>`
        + (issue === 'egal' ? 'Les deux ont la <b>même moyenne</b>.' : `La meilleure moyenne est celle ${VOYELLE.test(reponse) ? 'd’' : 'de '}<b>${reponse}</b>.`) + piege,
    });
  }

  function vraiFauxMoyenne() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.55) {
      const n = parmi([3, 4, 5]);
      let valeurs;
      do { valeurs = serieAvecMoyenne(n, 6, 19); } while (!Number.isInteger(additionner(valeurs) / n));
      const total = additionner(valeurs);
      const m = total / n;
      const ranges = croissant(valeurs);
      const faux = parmi([total / (n - 1), total / (n + 1), n % 2 ? ranges[(n - 1) / 2] : m + 1, m + 1, m - 1]
        .filter(v => Number.isInteger(v) && v !== m));
      return vraiFaux({ enonce: `La moyenne de ${liste(valeurs)} est ${ecrire(vrai ? m : faux)}.`, vrai, explication: expliquerMoyenne(valeurs) });
    }
    const REGLES = [
      [true, 'La moyenne d’une série est toujours comprise entre la plus petite et la plus grande valeur.',
        'On partage le total équitablement : la moyenne ne peut pas dépasser la plus grande valeur, ni être sous la plus petite.'],
      [false, 'La moyenne d’une série est toujours égale à l’une des valeurs de la série.',
        'La moyenne de 12 et 15 est 13,5 : ce n’est pas une des valeurs.'],
      [true, 'Si on ajoute à une série une valeur plus grande que la moyenne, la moyenne augmente.',
        'Une valeur au-dessus de la moyenne la fait monter. 👉 La moyenne de 10 et 12 est 11 ; avec 17 en plus : (10 + 12 + 17) ÷ 3 = 13.'],
      [false, 'Si on ajoute à une série une valeur plus grande que la moyenne, la moyenne baisse.',
        'Une valeur au-dessus de la moyenne la fait monter. 👉 La moyenne de 10 et 12 est 11 ; avec 17 en plus : (10 + 12 + 17) ÷ 3 = 13.'],
    ];
    const [, enonce, pourquoi] = parmi(REGLES.filter(([v]) => v === vrai));
    return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b>. ${pourquoi}` });
  }

  ajouterEtape({
    id: '5e-donnees-moyenne',
    banque: ['moyenne', 'moyenne', 'moyenneChoix', 'moyenneChoix', 'moyenneChoix', 'moyenneChoix', 'effectifs', 'effectifsChoix',
      'note', 'noteChoix', 'comparer', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'moyenne') return questionMoyenne(false);
      if (sorte === 'moyenneChoix') return questionMoyenne(true);
      if (sorte === 'effectifs') return questionMoyenneEffectifs(false);
      if (sorte === 'effectifsChoix') return questionMoyenneEffectifs(true);
      if (sorte === 'note') return questionNoteManquante(false);
      if (sorte === 'noteChoix') return questionNoteManquante(true);
      if (sorte === 'comparer') return questionComparer();
      return vraiFauxMoyenne();
    },
    titreLecon: 'La moyenne',
    lecon: `
      <h4>Calculer une moyenne</h4>
      <p><b>moyenne = somme des valeurs ÷ nombre de valeurs</b></p>
      <p>👉 <i>Notes 12 ; 15 ; 9 ; 14 : la somme est 50, il y a 4 notes. Moyenne : 50 ÷ 4 = 12,5.</i></p>
      <h4>Avec des effectifs</h4>
      ${tableau([['Buts marqués', 0, 1, 2, 3], ['Nombre de matchs', 2, 4, 3, 1]])}
      <p>On multiplie chaque valeur par son effectif : <i>0 × 2 + 1 × 4 + 2 × 3 + 3 × 1 = 13 buts</i>, en 2 + 4 + 3 + 1 = 10 matchs
        (l’effectif total). Moyenne : <i>13 ÷ 10 = 1,3 but par match.</i></p>
      <h4>La note qu’il faut</h4>
      <p><i>Pour avoir 14 de moyenne avec 3 notes, il faut 3 × 14 = 42 points en tout. Avec 12 et 15 (27 points), il faut encore 42 − 27 = 15.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie ton résultat ! La moyenne est toujours entre la plus petite et la plus grande valeur.
        Une valeur au-dessus de la moyenne la fait monter, une valeur en dessous la fait baisser.</div>
      <p>⚠️ N’oublie pas de <b>diviser</b>, et divise par le <b>bon nombre</b> : le nombre de valeurs
        (avec des effectifs : l’effectif total, pas le nombre de colonnes).</p>
    `,
  });

  // ======================================================================
  // 6. Le hasard : les probabilités
  // ======================================================================
  // Des événements avec un dé équilibré à 6 faces : [le texte, les issues qui le réalisent, un nombre de l'énoncé qui piège]
  const EVENEMENTS_DE = [
    ['obtenir un nombre pair', [2, 4, 6]], ['obtenir un nombre impair', [1, 3, 5]], ['obtenir 6', [6]], ['obtenir 1', [1]],
    ['obtenir au moins 5', [5, 6], 5], ['obtenir au moins 2', [2, 3, 4, 5, 6], 2], ['obtenir au plus 4', [1, 2, 3, 4]],
    ['obtenir au moins 4', [4, 5, 6], 4], ['obtenir un multiple de 3', [3, 6], 3], ['obtenir un diviseur de 6', [1, 2, 3, 6]],
    ['obtenir au plus 2', [1, 2], 2],
  ];
  const IMPOSSIBLES_DE = ['obtenir 7', 'obtenir 0', 'obtenir un nombre plus grand que 6'];
  const CERTAINS_DE = ['obtenir un nombre de 1 à 6', 'obtenir un nombre plus petit que 10', 'obtenir un nombre entier'];
  const DE = 'On lance un dé équilibré à 6 faces.';
  const COULEURS = [['rouge', 'rouges'], ['bleue', 'bleues'], ['verte', 'vertes'], ['jaune', 'jaunes']];
  // « 3 billes rouges, 5 billes bleues et 2 billes vertes »
  const billes = (nombres, couleurs) => {
    const morceaux = nombres.map((n, i) => `${combien(n, 'bille')} ${n >= 2 ? couleurs[i][1] : couleurs[i][0]}`);
    return `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}`;
  };
  const liste2 = nombres => nombres.map(v => ecrire(v)).join(', ');

  // L'échelle des chances, dans l'ordre (les boutons)
  const ECHELLE = ['impossible', 'peu probable', '1 chance sur 2', 'probable', 'certain'];
  function categorie(n, d) {
    if (n === 0) return 0;
    if (n === d) return 4;
    if (2 * n === d) return 2;
    return 2 * n < d ? 1 : 3;
  }
  const POURQUOI = [
    'aucune issue ne le réalise, il est <b>impossible</b> (probabilité 0)',
    'c’est moins d’une chance sur deux : il est <b>peu probable</b>',
    'c’est exactement <b>une chance sur deux</b>',
    'c’est plus d’une chance sur deux : il est <b>probable</b>',
    'toutes les issues le réalisent : il est <b>certain</b> (probabilité 1)',
  ];

  // Les mots du hasard : [l'énoncé, la bonne réponse, l'explication]
  const MOTS_HASARD = [
    ['Lancer un dé et regarder le nombre obtenu, c’est…', 'une expérience aléatoire',
      'On connaît les résultats possibles, mais on ne peut pas prévoir lequel on aura : c’est une <b>expérience aléatoire</b>.'],
    ['Quand on lance un dé, chaque résultat possible (1, 2, 3, 4, 5 ou 6) est…', 'une issue',
      'Un résultat possible d’une expérience aléatoire s’appelle une <b>issue</b>. Un dé a 6 issues.'],
    ['Quand on lance un dé, « obtenir un nombre pair », c’est…', 'un événement',
      '« Obtenir un nombre pair » est réalisé par plusieurs issues (2, 4 et 6) : c’est un <b>événement</b>.'],
    [`Quand on lance un dé, le nombre ${frac(3, 6)}, qui mesure les chances d’obtenir un nombre pair, c’est…`, 'une probabilité',
      `Un nombre entre 0 et 1 qui mesure les chances d’un événement est une <b>probabilité</b> : 3 issues favorables sur 6, c’est ${frac(3, 6)}.`],
  ];

  function questionVocabulaire() {
    if (Math.random() < 0.25) {
      const [enonce, mot, explication] = parmi(MOTS_HASARD);
      return choix({ consigne: 'Choisis le bon mot', enonce, reponse: mot, pieges: MOTS_HASARD.map(([, m]) => m), explication });
    }
    const c = entier(0, 4);
    let enonce;
    let explication;
    if (Math.random() < 0.5) {
      // Avec un dé (peu probable : 1/3 au plus ; probable : 2/3 au moins)
      let texte;
      let issues;
      if (c === 0) [texte, issues] = [parmi(IMPOSSIBLES_DE), []];
      else if (c === 4) [texte, issues] = [parmi(CERTAINS_DE), [1, 2, 3, 4, 5, 6]];
      else [texte, issues] = parmi(EVENEMENTS_DE.filter(([, x]) => categorie(x.length, 6) === c));
      enonce = `${DE} L’événement « ${texte} » est…`;
      explication = c === 0
        ? `Un dé à 6 faces donne 1, 2, 3, 4, 5 ou 6 : ${POURQUOI[0]}.`
        : `${combien(issues.length, 'issue')} sur 6 (${liste2(issues)}) : la probabilité est ${frac(issues.length, 6)}, ${POURQUOI[c]}.`;
    } else {
      // Avec un sac de billes rouges et bleues
      const t = parmi([6, 8, 10, 12]);
      let r;
      if (c === 0 || c === 4) r = entier(2, t - 2);
      else if (c === 2) r = t / 2;
      else if (c === 1) r = entier(1, Math.floor(t / 3));
      else r = entier(Math.ceil(2 * t / 3), t - 1);
      const tirer = c === 0 ? 'tirer une verte' : (c === 4 ? 'tirer une rouge ou une bleue' : 'tirer une rouge');
      enonce = `On tire au hasard une bille parmi ${combien(r, 'rouge')} et ${combien(t - r, 'bleue')}. « ${majuscule(tirer)} » est…`;
      const favorables = c === 0 ? 0 : (c === 4 ? t : r);
      explication = c === 0
        ? `Il n’y a pas de bille verte : ${POURQUOI[0]}.`
        : `${c === 4 ? combien(t, 'bille') : combien(favorables, 'bille rouge', 'billes rouges')} sur ${ecrire(t)} : la probabilité est ${frac(favorables, t)}, ${POURQUOI[c]}.`;
    }
    // 4 boutons de l'échelle, dans l'ordre, dont la bonne réponse
    const enleve = parmi([0, 1, 2, 3, 4].filter(i => i !== c));
    return choix({
      consigne: 'Choisis le bon mot',
      enonce,
      reponse: ECHELLE[c],
      choix: ECHELLE.filter((mot, i) => i !== enleve),
      explication,
    });
  }

  // Compter les issues qui réalisent un événement (des cartes numérotées)
  function cartes() {
    const N = parmi([10, 12, 15, 20]);
    const k = entier(2, 6);
    const numeros = Array.from({ length: N }, (x, i) => i + 1);
    const EVENEMENTS = [
      [`obtenir un multiple de ${ecrire(k)}`, numeros.filter(v => v % k === 0)],
      ['obtenir un nombre pair', numeros.filter(v => v % 2 === 0)],
      ['obtenir un nombre à deux chiffres', numeros.filter(v => v >= 10)],
      [`obtenir au plus ${ecrire(k + 1)}`, numeros.filter(v => v <= k + 1)],
      ['obtenir un nombre qui se termine par 5', numeros.filter(v => v % 10 === 5)],
    ].filter(([, issues]) => issues.length >= 2);
    const [texte, issues] = parmi(EVENEMENTS);
    return { N, texte, issues, intro: `On tire une carte au hasard parmi ${ecrire(N)} cartes numérotées de 1 à ${ecrire(N)}.` };
  }

  function questionIssues() {
    const C = cartes();
    return nombre({
      consigne: 'Compte les issues',
      enonce: `${C.intro} Combien d’issues réalisent l’événement « ${C.texte} » ?`,
      reponse: C.issues.length,
      explication: `Les issues qui réalisent l’événement : ${liste2(C.issues)}.<br>Il y en a <b>${ecrire(C.issues.length)}</b>.`,
    });
  }

  // Une situation où les issues ont toutes les mêmes chances : [l'énoncé, favorables, total, l'explication, des pièges]
  function situationProba(avecBoutons) {
    const sorte = parmi(avecBoutons ? ['de', 'de', 'de', 'sac', 'cartes'] : ['de', 'sac', 'sac', 'cartes']);
    if (sorte === 'de') {
      const [texte, issues, nombreQuiPiege] = parmi(EVENEMENTS_DE);
      const f = issues.length;
      return {
        intro: DE, question: `Quelle est la probabilité ${texte.replace(/^obtenir/, 'd’obtenir')} ?`, f, t: 6,
        detail: `${combien(f, 'issue')} sur 6 (${liste2(issues)})`,
        // une seule issue, le contraire, le nombre de l'énoncé, favorables sur défavorables
        // une seule issue, le contraire, le nombre de l'énoncé, favorables sur défavorables, une issue de trop ou de moins, une face oubliée
        pieges: [[1, 6], [6 - f, 6], [nombreQuiPiege || 0, 6], [f, 6 - f], [1, 2], [f + 1, 6], [f - 1, 6], [f, 5]],
      };
    }
    if (sorte === 'sac') {
      const trois = Math.random() < 0.5;
      const nombres = trois ? [entier(1, 6), entier(1, 6), entier(1, 6)] : [entier(1, 8), entier(1, 8)];
      const couleurs = RM.melanger(COULEURS).slice(0, nombres.length);
      if (!trois && nombres[0] === nombres[1]) nombres[1]++;
      const i = entier(0, nombres.length - 1);
      const t = additionner(nombres);
      const f = nombres[i];
      return {
        intro: `Un sac contient ${billes(nombres, couleurs)}. On tire une bille au hasard.`,
        question: `Quelle est la probabilité qu’elle soit ${couleurs[i][0]} ?`, f, t,
        detail: `${combien(f, 'bille')} ${f >= 2 ? couleurs[i][1] : couleurs[i][0]} sur ${somme(nombres)} = ${combien(t, 'bille')}`,
        // autant de chances pour chaque couleur, favorables sur défavorables, les autres couleurs, une seule bille
        pieges: [[1, nombres.length], [f, t - f], [t - f, t], [1, t], [f, t + 1]],
      };
    }
    const C = cartes();
    const f = C.issues.length;
    return {
      intro: C.intro, question: `Quelle est la probabilité ${C.texte.replace(/^obtenir/, 'd’obtenir')} ?`, f, t: C.N,
      detail: `${combien(f, 'issue')} sur ${ecrire(C.N)} (${liste2(C.issues)})`,
      pieges: [[1, C.N], [C.N - f, C.N], [f, C.N - f], [1, f], [1, 2]],
    };
  }

  function questionProba(avecBoutons) {
    const S = situationProba(avecBoutons);
    const [a, b] = simplifier(S.f, S.t);
    const explication = `Toutes les issues ont les mêmes chances : ${S.detail}.<br>`
      + `La probabilité est <b>${frac(S.f, S.t)}</b>${b !== S.t ? ` = ${frac(a, b)}` : ''}.`;
    if (!avecBoutons) {
      return fraction({
        consigne: 'Écris la probabilité sous forme de fraction', enonce: `${S.intro} ${S.question}`, n: S.f, d: S.t, irreductible: false, explication,
      });
    }
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `${S.intro} ${S.question}`,
      reponse: fracTexte(S.f, S.t),
      pieges: piegesFractions([S.f, S.t], S.pieges),
      explication,
    });
  }

  // La roue : des secteurs égaux, coloriés, et une flèche en haut
  const TEINTES = { orange: 'var(--orange)', bleu: 'var(--riviere)', blanc: '#fff' };
  const NOMS_TEINTES = { orange: ['orange', 'orange'], bleu: ['bleu', 'bleus'], blanc: ['blanc', 'blancs'] };
  function roue(couleurs) {
    const n = couleurs.length;
    const [cx, cy, r] = [130, 140, 100];
    const arrondi = x => Math.round(x * 10) / 10;
    const bord = a => `${arrondi(cx + r * Math.cos(a))} ${arrondi(cy + r * Math.sin(a))}`;
    let html = '';
    couleurs.forEach((c, i) => {
      // (le 1er secteur est centré sous la flèche)
      const a1 = -Math.PI / 2 - Math.PI / n + i * 2 * Math.PI / n;
      html += `<path d="M ${cx} ${cy} L ${bord(a1)} A ${r} ${r} 0 0 1 ${bord(a1 + 2 * Math.PI / n)} Z" class="fig-trait" style="fill: ${TEINTES[c]}"/>`;
    });
    html += `<polygon points="${cx - 12},${cy - r - 28} ${cx + 12},${cy - r - 28} ${cx},${cy - r + 8}" class="fig-trait" style="fill: var(--brun)"/>`;
    html += figures.cercle([cx, cy], 5, 'fig-trait');
    return figures.svg(260, 250, html, 'Une roue partagée en secteurs égaux');
  }

  function questionRoue() {
    const n = parmi([6, 8, 10, 12]);
    const deux = Math.random() < 0.4;
    const noms = deux ? RM.melanger(['orange', 'bleu', 'blanc']).slice(0, 2) : RM.melanger(['orange', 'bleu', 'blanc']);
    let effectifs;
    // (jamais toutes les couleurs à égalité : « une chance sur 3 » serait juste)
    do { effectifs = partition(n, noms.length); } while (new Set(effectifs).size === 1);
    const secteurs = RM.melanger(noms.flatMap((c, i) => Array(effectifs[i]).fill(c)));
    const i = entier(0, noms.length - 1);
    const f = effectifs[i];
    const [sing, plur] = NOMS_TEINTES[noms[i]];
    const [a, b] = simplifier(f, n);
    const enonce = `La roue est partagée en ${ecrire(n)} secteurs égaux. On la fait tourner : la flèche s’arrête au hasard sur un secteur.${roue(secteurs)}`
      + `Quelle est la probabilité que la flèche s’arrête sur un secteur ${sing} ?`;
    const explication = `Les ${ecrire(n)} secteurs ont les mêmes chances. Il y a ${combien(f, 'secteur')} ${f >= 2 ? plur : sing} :<br>`
      + `la probabilité est <b>${frac(f, n)}</b>${b !== n ? ` = ${frac(a, b)}` : ''}.`
      + (noms.length === 3 && 3 * f !== n ? '<br>⚠️ Ce n’est pas une chance sur 3 : les couleurs n’ont pas toutes le même nombre de secteurs.' : '');
    if (Math.random() < 0.5) {
      return fraction({ consigne: 'Écris la probabilité sous forme de fraction', enonce, n: f, d: n, irreductible: false, explication });
    }
    return choix({
      consigne: 'Choisis la probabilité',
      enonce,
      reponse: fracTexte(f, n),
      pieges: piegesFractions([f, n], [[1, noms.length], [f, n - f], [n - f, n], [1, n], [f + 1, n], [f - 1, n]]),
      explication,
    });
  }

  // Comparer ses chances : deux sacs
  function questionComparerSacs() {
    const issue = parmi(['A', 'B', 'egal']);
    const piege = Math.random() < 0.6;
    let rA;
    let tA;
    let rB;
    let tB;
    let essais = 0;
    for (;;) {
      [tA, tB] = [parmi([4, 5, 10, 20]), parmi([4, 5, 10, 20])];
      rA = entier(1, tA - 1);
      rB = entier(1, tB - 1);
      const [pA, pB] = [rA / tA, rB / tB];
      const bonneIssue = pA > pB ? 'A' : (pB > pA ? 'B' : 'egal');
      // le piège : le sac qui a le plus de billes rouges n'est pas le meilleur (ou pas meilleur que l'autre)
      const trompeur = issue === 'A' ? rB > rA : (issue === 'B' ? rA > rB : rA !== rB);
      if (bonneIssue === issue && tA !== tB && (!piege || trompeur || essais++ > 200)) break;
    }
    const [pA, pB] = [net(rA / tA), net(rB / tB)];
    const html = tableau([['', 'Sac A', 'Sac B'], ['Billes rouges', rA, rB], ['Billes bleues', tA - rA, tB - rB]]);
    const reponse = issue === 'A' ? 'Le sac A' : (issue === 'B' ? 'Le sac B' : 'Autant dans les deux');
    let attention = '';
    if (issue === 'A' && rB > rA) attention = '<br>⚠️ Le sac B a plus de billes rouges, mais aussi plus de billes en tout !';
    if (issue === 'B' && rA > rB) attention = '<br>⚠️ Le sac A a plus de billes rouges, mais aussi plus de billes en tout !';
    return choix({
      consigne: 'Compare les chances',
      enonce: `${html}On tire une bille au hasard. Dans quel sac a-t-on le plus de chances de tirer une bille rouge ?`,
      reponse,
      choix: ['Le sac A', 'Le sac B', 'Autant dans les deux'],
      explication: `Sac A : ${combien(rA, 'bille rouge', 'billes rouges')} sur ${ecrire(rA)} + ${ecrire(tA - rA)} = ${ecrire(tA)}, ${frac(rA, tA)} = ${ecrire(pA)}.<br>`
        + `Sac B : ${combien(rB, 'bille rouge', 'billes rouges')} sur ${ecrire(rB)} + ${ecrire(tB - rB)} = ${ecrire(tB)}, ${frac(rB, tB)} = ${ecrire(pB)}.<br>`
        + (issue === 'egal' ? '<b>Autant de chances dans les deux sacs.</b>' : `${ecrire(Math.max(pA, pB))} > ${ecrire(Math.min(pA, pB))} : c’est <b>le sac ${issue}</b>.`)
        + attention,
    });
  }

  // L'événement contraire
  function questionContraire() {
    const p = parmi(ENFANTS);
    if (Math.random() < 0.55) {
      let n;
      let d;
      do { d = entier(3, 12); n = entier(1, d - 1); } while (2 * n === d || pgcd(n, d) !== 1);
      const SITUATIONS = [
        [`Dans un jeu, la probabilité ${que(p.nom)} gagne est ${frac(n, d)}.`, `Quelle est la probabilité ${que(p.nom)} ne gagne pas ?`,
          `« ${p.nom} ne gagne pas » est l’événement contraire de « ${p.nom} gagne »`],
        [`La probabilité que la flèche d’une roue s’arrête sur le rouge est ${frac(n, d)}.`, 'Quelle est la probabilité qu’elle ne s’arrête pas sur le rouge ?',
          '« Ne pas s’arrêter sur le rouge » est l’événement contraire de « s’arrêter sur le rouge »'],
      ];
      const [debut, question, contraire] = parmi(SITUATIONS);
      return fraction({
        consigne: 'Écris la probabilité sous forme de fraction',
        enonce: `${debut} ${question}`,
        n: d - n,
        d,
        irreductible: false,
        explication: `${contraire} : les deux probabilités font 1 ensemble.<br>1 − ${frac(n, d)} = ${frac(d, d)} − ${frac(n, d)} = <b>${frac(d - n, d)}</b>.`,
      });
    }
    const pluie = Math.random() < 0.6;
    // (un bus en retard, c'est rare : 0,4 au plus)
    const pr = net(entier(1, pluie ? 19 : 8) * 0.05);
    const [debut, question] = pluie
      ? [`La météo annonce que la probabilité qu’il pleuve demain est ${ecrire(pr)}.`, 'Quelle est la probabilité qu’il ne pleuve pas ?']
      : [`La probabilité que le car ${de(p.nom)} soit en retard est ${ecrire(pr)}.`, 'Quelle est la probabilité qu’il ne soit pas en retard ?'];
    return nombre({
      consigne: 'Calcule la probabilité',
      enonce: `${debut} ${question}`,
      reponse: net(1 - pr),
      explication: `C’est l’événement contraire : les deux probabilités font 1 ensemble.<br>1 − ${ecrire(pr)} = <b>${ecrire(net(1 - pr))}</b>.`,
    });
  }

  function vraiFauxProba() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['valeur', 'de', 'de', 'couleurs']);
    if (forme === 'valeur') {
      const [texte, valeur] = vrai
        ? parmi([[ecrire(0.4), 0.4], [frac(3, 4), 0.75], ['1', 1], ['0', 0], [ecrire(0.05), 0.05]])
        : parmi([[ecrire(1.5), 1.5], [frac(4, 3), 4 / 3], ['2', 2], [ecrire(1.2), 1.2], [frac(5, 2), 2.5]]);
      return vraiFaux({
        enonce: `Une probabilité peut être égale à ${texte}.`,
        vrai,
        explication: `Une probabilité est toujours <b>entre 0 et 1</b> (0 : impossible ; 1 : certain).<br>${texte} est `
          + `${valeur <= 1 ? 'bien entre 0 et 1' : 'plus grand que 1'} : <b>${vrai ? 'Vrai' : 'Faux'}</b>.`,
      });
    }
    if (forme === 'de') {
      const [texte, issues, nombreQuiPiege] = parmi(EVENEMENTS_DE);
      const f = issues.length;
      const faux = parmi([[1, 6], [6 - f, 6], [nombreQuiPiege || 0, 6], [f, 6 - f]].filter(([a, b]) => a > 0 && a < b && !egales([a, b], [f, 6])));
      const [a, b] = vrai ? [f, 6] : faux;
      return vraiFaux({
        enonce: `${DE} La probabilité ${texte.replace(/^obtenir/, 'd’obtenir')} est ${frac(a, b)}.`,
        vrai,
        explication: `${combien(f, 'issue')} sur 6 (${liste2(issues)}) : la probabilité est <b>${frac(f, 6)}</b>.`,
      });
    }
    const r = entier(2, 6);
    const b = vrai ? r : entierSauf(2, 8, [r]);
    return vraiFaux({
      enonce: `Avec ${combien(r, 'bille rouge', 'billes rouges')} et ${combien(b, 'bleue')}, on a autant de chances de tirer une rouge qu’une bleue.`,
      vrai,
      explication: `Rouge : ${frac(r, r + b)} ; bleue : ${frac(b, r + b)}. `
        + (vrai ? 'Il y a autant de billes de chaque couleur : <b>Vrai</b>.' : 'Deux couleurs, ce n’est pas forcément une chance sur deux : <b>Faux</b>.'),
    });
  }

  ajouterEtape({
    id: '5e-donnees-probabilites',
    banque: ['vocabulaire', 'vocabulaire', 'issues', 'proba', 'proba', 'probaChoix', 'probaChoix', 'roue', 'comparer',
      'contraire', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'vocabulaire') return questionVocabulaire();
      if (sorte === 'issues') return questionIssues();
      if (sorte === 'proba') return questionProba(false);
      if (sorte === 'probaChoix') return questionProba(true);
      if (sorte === 'roue') return questionRoue();
      if (sorte === 'comparer') return questionComparerSacs();
      if (sorte === 'contraire') return questionContraire();
      return vraiFauxProba();
    },
    titreLecon: 'Le hasard',
    lecon: `
      <h4>Le vocabulaire</h4>
      <p>Lancer un dé est une <b>expérience aléatoire</b> : on connaît les résultats possibles, mais on ne peut pas prévoir lequel on aura.
        Chaque résultat possible est une <b>issue</b> (1, 2, 3, 4, 5 ou 6). Un <b>événement</b>, comme « obtenir un nombre pair »,
        est réalisé par certaines issues (2, 4 et 6). <i>« Au moins 5 »</i>, c’est 5 ou plus (5 et 6) ; <i>« au plus 2 »</i>, c’est 2 ou moins (1 et 2).</p>
      <h4>La probabilité</h4>
      <p>C’est un nombre <b>entre 0 et 1</b> qui mesure les chances d’un événement. Quand toutes les issues ont les mêmes chances
        (un dé équilibré, un tirage au hasard) : <b>probabilité = nombre d’issues favorables ÷ nombre d’issues possibles</b>.</p>
      <p>👉 <i>Obtenir un nombre pair avec un dé : ${frac(3, 6)}. Tirer une bille rouge dans un sac de 3 rouges et 5 bleues : ${frac(3, 8)}.</i></p>
      <table>
        <tr><th>impossible</th><th>peu probable</th><th>une chance sur deux</th><th>probable</th><th>certain</th></tr>
        <tr><td>0</td><td>moins de ${frac(1, 2)}</td><td>${frac(1, 2)}</td><td>plus de ${frac(1, 2)}</td><td>1</td></tr>
      </table>
      <p><b>L’événement contraire</b> (« ne pas obtenir 6 ») : les deux probabilités font 1 ensemble, 1 − ${frac(1, 6)} = ${frac(5, 6)}.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour comparer des chances, compare les probabilités, pas le nombre de billes :
        3 rouges sur 5 (0,6) valent mieux que 5 rouges sur 10 (0,5).</div>
      <p>⚠️ Deux couleurs, ce n’est pas forcément une chance sur deux : avec 2 billes rouges et 6 bleues, la probabilité de tirer une rouge est ${frac(2, 8)}.</p>
    `,
  });
})();
