// Renard Malin — Maths, niveau 4e : les 6 étapes du Marché des Données
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, entierSauf, net, ecrire, mesure, euros, parentheses, frac, fracTexte, simplifier, tableau,
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
  // « de » et « que » devant une voyelle : d’abricots, qu’Inès, d’Hugo
  const VOYELLE = /^([aeiouéèêàâîôœ]|hu)/i;
  const de = mot => (VOYELLE.test(mot) ? `d’${mot}` : `de ${mot}`);
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Un nombre et son nom, au pluriel à partir de 2 : « 1 bille », « 3 billes »
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
  // Deux nombres différents d'une liste, et aucun n'est un multiple de l'autre (7 et 4 oui ; 3 et 6 non)
  function paire(valeurs) {
    for (;;) {
      const [a, b] = RM.melanger(valeurs).slice(0, 2);
      if (a % b !== 0 && b % a !== 0) return [a, b];
    }
  }
  // Une somme écrite en entier : « 12 + 8 + 15 »
  const somme = valeurs => valeurs.map(v => ecrire(v)).join(' + ');
  // Une liste de nombres séparés par des points-virgules : « 12 ; 8,5 ; 10 »
  const liste = valeurs => valeurs.map(v => ecrire(v)).join(`${ESPACE}; `);
  // Les pièges : des nombres positifs, sans les erreurs de calcul de l'ordinateur
  const positifs = valeurs => valeurs.map(net).filter(v => v > 0);
  // Un prix sans le signe €, pour les cases d'un tableau « Prix (€) » : 22,50 (et pas 22,5)
  const ecrirePrix = v => euros(v).replace(`${ESPACE}€`, '');
  // Au plus 2 chiffres après la virgule : pas de 3,333… sur un bouton
  const auCentieme = v => Number.isInteger(net(v * 100));
  const OUI_NON = ['Oui', 'Non'];
  // Deux fractions égales ? a/b = c/d
  const egales = ([a, b], [c, d]) => a * d === b * c;
  // Des fractions pour les boutons : jamais deux boutons de même valeur, jamais un piège égal à la réponse,
  // jamais plus grandes que 1 (une probabilité)
  function piegesFractions(bonne, candidats) {
    const vues = [bonne];
    const pieges = [];
    candidats.forEach(([n, d]) => {
      if (n > 0 && d > 0 && n < d && !vues.some(f => egales(f, [n, d]))) {
        vues.push([n, d]);
        pieges.push(fracTexte(n, d));
      }
    });
    return pieges;
  }

  // ======================================================================
  // 1. La quatrième proportionnelle
  // ======================================================================
  // Les tableaux : les titres des deux lignes, les nombres du haut possibles, les coefficients (la valeur du bas pour 1 en haut),
  // et les décalages d'une case pour fabriquer un tableau qui n'est pas proportionnel
  const TABLEAUX = [
    { x: 'Masse (kg)', y: 'Prix (€)', xs: intervalle(2, 9), coefs: [1.2, 1.5, 1.8, 2.4, 2.5, 3.5, 4.5], ecarts: [0.1, -0.1, 0.2, -0.2] },
    { x: 'Nombre de cahiers', y: 'Prix (€)', xs: intervalle(2, 12), coefs: [0.8, 1.2, 1.5, 2.5, 3.5], ecarts: [0.1, -0.1, 0.2, -0.2] },
    { x: 'Nombre de personnes', y: 'Farine (g)', xs: intervalle(2, 10), coefs: [30, 40, 45, 60, 75], ecarts: [5, -5, 10, -10] },
    { x: 'Distance (km)', y: 'Essence (L)', xs: [50, 150, 200, 250, 300, 350, 400, 450], coefs: [0.05, 0.06, 0.07, 0.08], ecarts: [0.5, -0.5, 1, -1] },
    { x: 'Sur la carte (cm)', y: 'En vrai (km)', xs: intervalle(2, 12), coefs: [0.5, 1.5, 2.5, 4, 5], ecarts: [0.5, -0.5, 1, -1] },
    { x: 'Durée (min)', y: 'Eau (L)', xs: intervalle(3, 15), coefs: [1.5, 2.5, 6, 8, 12], ecarts: [0.5, -0.5, 1, -1] },
  ];
  // Les nombres du bas s'écrivent comme des prix dans une ligne « Prix (€) » (10,50)
  const ecritureBas = T => (T.y === 'Prix (€)' ? ecrirePrix : ecrire);

  // Deux colonnes proportionnelles : 4 nombres tous différents, et x2 n'est pas un multiple de x1
  // (sinon, on n'a pas besoin du produit en croix)
  // (basEntiers : les nombres du bas sont entiers, quand on doit diviser par l'un d'eux)
  function colonnes(T, basEntiers = false) {
    for (;;) {
      const k = parmi(T.coefs);
      const [x1, x2] = croissant(paire(T.xs));
      const [y1, y2] = [net(k * x1), net(k * x2)];
      if (basEntiers && !(Number.isInteger(y1) && Number.isInteger(y2))) continue;
      if (new Set([x1, x2, y1, y2]).size === 4) return { k, grille: [[x1, x2], [y1, y2]] };
    }
  }
  // La case (i : la ligne, j : la colonne) se calcule avec le produit en croix : ? = p × q ÷ r
  // (p et q : la diagonale complète ; r : le nombre en face de la case, sur la même diagonale)
  function produitEnCroix(grille, i, j) {
    const [p, q, r] = [grille[i][1 - j], grille[1 - i][j], grille[1 - i][1 - j]];
    return { p, q, r, valeur: net(p * q / r), ajout: net(p + q - r) };
  }
  // Le tableau, avec une case remplacée par « contenu » (le trou, un « ? », ou la réponse en gras)
  function tableauAvec(T, grille, i, j, contenu) {
    const ecrit = (l, v) => (l === 1 ? ecritureBas(T)(v) : ecrire(v));
    return tableau([0, 1].map(l => [l === 0 ? T.x : T.y, ...grille[l].map((v, c) => (l === i && c === j ? contenu : ecrit(l, v)))]));
  }

  function questionCroix() {
    const T = parmi(TABLEAUX);
    const i = entier(0, 1);
    // (la case « ? » en haut : on divise par un nombre du bas, qui doit être entier pour calculer sans calculatrice)
    const { grille } = colonnes(T, i === 0);
    const j = entier(0, 1);
    const { p, q, r, valeur } = produitEnCroix(grille, i, j);
    const ecrit = (l, v) => (l === 1 ? ecritureBas(T)(v) : ecrire(v));
    return nombre({
      consigne: 'Complète le tableau de proportionnalité',
      enonce: tableauAvec(T, grille, i, j, '___'),
      reponse: valeur,
      prix: i === 1 && T.y === 'Prix (€)',
      solution: tableauAvec(T, grille, i, j, `<b>${ecrit(i, valeur)}</b>`),
      explication: `Les produits en croix sont égaux : ${ecrit(1 - i, r)} × ? = ${ecrit(i, p)} × ${ecrit(1 - i, q)}.<br>`
        + `Donc ? = ${ecrit(i, p)} × ${ecrit(1 - i, q)} ÷ ${ecrit(1 - i, r)} = ${ecrire(net(p * q))} ÷ ${ecrit(1 - i, r)} = <b>${ecrit(i, valeur)}</b>.`,
    });
  }

  // Quel calcul donne la case « ? » ? (les pièges : l'autre diagonale, et l'addition)
  function questionCalculCroix() {
    const T = parmi(TABLEAUX);
    const i = entier(0, 1);
    // (la case « ? » en haut : on divise par un nombre du bas, qui doit être entier pour calculer sans calculatrice)
    const { grille } = colonnes(T, i === 0);
    const j = entier(0, 1);
    const { p, q, r, valeur } = produitEnCroix(grille, i, j);
    const ecrit = (l, v) => (l === 1 ? ecritureBas(T)(v) : ecrire(v));
    const [P, Q, R] = [ecrit(i, p), ecrit(1 - i, q), ecrit(1 - i, r)];
    const bon = `${P} × ${Q} ÷ ${R}`;
    return choix({
      consigne: 'Choisis le bon calcul',
      enonce: `${tableauAvec(T, grille, i, j, '?')}Quel calcul donne la case « ? » ?`,
      reponse: bon,
      pieges: [`${P} × ${R} ÷ ${Q}`, `${Q} × ${R} ÷ ${P}`, `${P} + ${Q} − ${R}`],
      solution: `<b>${bon}</b> = ${ecrit(i, valeur)}`,
      explication: `« ? » est en face de ${R}, sur la même diagonale. On multiplie les deux nombres de l’autre diagonale, `
        + `puis on divise par ${R} :<br>${bon} = <b>${ecrit(i, valeur)}</b>.`,
    });
  }

  // Les problèmes : chaque situation donne les titres du tableau (tx, ty), les nombres (x1, x2 en haut ; y1, y2 en bas ;
  // la case cherchée vaut null), comment écrire les valeurs (ex, ey), l'énoncé, et l'unité (ou prix) de la réponse.
  // pas : l'écart entre deux réponses voisines (pour les pièges) ; pieges : des pièges en plus
  const OBJETS = [
    { des: 'cahiers', lieu: 'À la papeterie', prix: [1.2, 1.5, 2.5] },
    { des: 'croissants', lieu: 'À la boulangerie', prix: [0.9, 1.1, 1.2] },
    { des: 'yaourts', lieu: 'Au marché', prix: [0.4, 0.45, 0.6] },
    { des: 'stylos', lieu: 'À la papeterie', prix: [0.8, 1.5, 2.5] },
  ];
  const FRUITS = [['pommes', [1.8, 2.4, 2.5]], ['poires', [2.4, 2.8, 3.5]], ['tomates', [2.5, 3.2, 3.5]],
    ['abricots', [3.5, 4.5, 5.5]], ['carottes', [1.2, 1.5, 1.8]]];
  const INGREDIENTS = [['farine', [30, 40, 45, 60, 75]], ['sucre', [15, 20, 25, 30, 35]], ['beurre', [15, 20, 25, 30]],
    ['chocolat', [25, 30, 40, 50]]];
  const kg = v => mesure(v, 'kg');
  const SITUATIONS = [
    () => {
      const [fruit, prix] = parmi(FRUITS);
      const k = parmi(prix);
      const [x1, x2] = paire(intervalle(2, 7));
      return {
        tx: 'Masse (kg)', ty: 'Prix (€)', x1, x2, y1: net(k * x1), y2: null, ex: kg, ey: euros, prix: true,
        enonce: `Au marché, ${kg(x1)} ${de(fruit)} coûtent ${euros(k * x1)}. Combien coûtent ${kg(x2)} ${de(fruit)} ?`,
      };
    },
    () => {
      const [fruit, prix] = parmi(FRUITS);
      const k = parmi(prix);
      let x1;
      let x2;
      // (on divise par le prix payé : il doit être entier)
      do { [x1, x2] = paire(intervalle(2, 7)); } while (!Number.isInteger(net(k * x1)));
      const p = parmi(ENFANTS);
      return {
        tx: 'Masse (kg)', ty: 'Prix (€)', x1, x2: null, y1: net(k * x1), y2: net(k * x2), ex: kg, ey: euros, unite: 'kg',
        enonce: `Au marché, ${kg(x1)} ${de(fruit)} coûtent ${euros(k * x1)}. Combien de kilos ${de(fruit)} ${p.nom} `
          + `peut-${p.il} acheter avec ${euros(k * x2)} ?`,
      };
    },
    () => {
      const O = parmi(OBJETS);
      const k = parmi(O.prix);
      const [x1, x2] = paire(intervalle(2, 12));
      return {
        tx: `Nombre de ${O.des}`, ty: 'Prix (€)', x1, x2, y1: net(k * x1), y2: null, ex: v => `${ecrire(v)} ${O.des}`, ey: euros, prix: true,
        enonce: `${O.lieu}, ${ecrire(x1)} ${O.des} coûtent ${euros(k * x1)}. Combien coûtent ${ecrire(x2)} ${O.des} ?`,
      };
    },
    () => {
      const [ingredient, doses] = parmi(INGREDIENTS);
      const k = parmi(doses);
      const [x1, x2] = paire(intervalle(2, 10));
      const g = v => mesure(v, 'g');
      if (Math.random() < 0.7) {
        return {
          tx: 'Personnes', ty: `${majuscule(ingredient)} (g)`, x1, x2, y1: k * x1, y2: null, ex: v => combien(v, 'personne'), ey: g, unite: 'g',
          enonce: `Pour ${combien(x1, 'personne')}, la recette demande ${g(k * x1)} ${de(ingredient)}. Combien en faut-il pour ${combien(x2, 'personne')} ?`,
        };
      }
      return {
        tx: 'Personnes', ty: `${majuscule(ingredient)} (g)`, x1, x2: null, y1: k * x1, y2: k * x2, ex: v => combien(v, 'personne'), ey: g,
        unite: 'personnes',
        enonce: `Pour ${combien(x1, 'personne')}, la recette demande ${g(k * x1)} ${de(ingredient)}. Mamie a ${g(k * x2)} ${de(ingredient)} : `
          + 'pour combien de personnes peut-elle faire la recette ?',
      };
    },
    () => {
      const k = parmi([0.05, 0.06, 0.07, 0.08]);
      const [x1, x2] = paire([150, 200, 250, 300, 350, 400, 450]);
      const L = v => mesure(v, 'L');
      return {
        tx: 'Distance (km)', ty: 'Essence (L)', x1, x2, y1: net(k * x1), y2: null, ex: v => mesure(v, 'km'), ey: L, unite: 'L', pas: 50,
        enonce: `La voiture de Papi consomme ${L(k * x1)} d’essence pour ${mesure(x1, 'km')}. Combien de litres consomme-t-elle pour ${mesure(x2, 'km')} ?`,
      };
    },
    () => {
      const k = parmi([0.5, 1.5, 2.5, 4, 5]);
      const [x1, x2] = paire(intervalle(2, 12));
      const km = v => mesure(v, 'km');
      return {
        tx: 'Sur la carte (cm)', ty: 'En vrai (km)', x1, x2, y1: net(k * x1), y2: null, ex: v => mesure(v, 'cm'), ey: km, unite: 'km',
        enonce: `Sur une carte, ${mesure(x1, 'cm')} représentent ${km(k * x1)} en vrai. Combien de kilomètres représentent ${mesure(x2, 'cm')} ?`,
      };
    },
    () => {
      const k = parmi([1.5, 2.5, 6, 8]);
      const [x1, x2] = paire(intervalle(3, 15));
      const L = v => mesure(v, 'L');
      return {
        tx: 'Durée (min)', ty: 'Eau (L)', x1, x2, y1: net(k * x1), y2: null, ex: v => mesure(v, 'min'), ey: L, unite: 'L',
        enonce: `Un robinet laisse couler ${L(k * x1)} d’eau en ${mesure(x1, 'min')}. Au même débit, combien de litres coulent en ${mesure(x2, 'min')} ?`,
      };
    },
    () => {
      // À vitesse constante : un vélo (15 km/h) ou un train
      const velo = Math.random() < 0.5;
      const k = velo ? 0.25 : parmi([1.5, 2, 2.5]);
      const [x1, x2] = paire(velo ? intervalle(8, 44, 4) : intervalle(10, 50, 5));
      const km = v => mesure(v, 'km');
      const p = velo ? parmi(ENFANTS) : { nom: 'Un train', il: 'il' };
      const qui = velo ? `À vélo, ${p.nom} roule` : 'Un train roule';
      return {
        tx: 'Durée (min)', ty: 'Distance (km)', x1, x2, y1: net(k * x1), y2: null, ex: v => mesure(v, 'min'), ey: km, unite: 'km',
        pas: velo ? 4 : 5,
        enonce: `${qui} à vitesse constante : ${km(k * x1)} en ${mesure(x1, 'min')}. Quelle distance parcourt-${p.il} en ${mesure(x2, 'min')} ?`,
      };
    },
    () => {
      // Un pourcentage : 216 élèves sur 600, c'est ? %
      const N = parmi([200, 250, 400, 500, 600, 800]);
      const t = parmi([12, 15, 18, 24, 26, 32, 35, 36, 42, 45, 48, 55, 64, 68, 72, 85].filter(v => Number.isInteger(N * v / 100)));
      const n = N * t / 100;
      const activite = parmi(['font du sport en club', 'viennent à vélo', 'mangent à la cantine', 'jouent d’un instrument', 'ont un animal']);
      const pc = v => mesure(v, '%');
      return {
        tx: 'Élèves', ty: 'Pourcentage (%)', x1: N, x2: n, y1: 100, y2: null, ex: v => combien(v, 'élève'), ey: pc, unite: '%',
        pourcentage: true, pieges: [n, 100 - t, t / 100, t / 10],
        enonce: `Dans un collège de ${ecrire(N)} élèves, ${ecrire(n)} ${activite}. Quel pourcentage des élèves cela représente-t-il ?`,
      };
    },
  ];

  // La situation, la réponse et l'explication (le tableau, puis le produit en croix)
  function problemeCroix() {
    const S = parmi(SITUATIONS)();
    const enBas = S.y2 === null;
    const nb = S.ty === 'Prix (€)' ? ecrirePrix : ecrire; // les nombres du bas
    const [P, Q, R] = enBas ? [S.x2, S.y1, S.x1] : [S.y2, S.x1, S.y1];
    const calcul = enBas ? `${ecrire(P)} × ${nb(Q)} ÷ ${ecrire(R)}` : `${nb(P)} × ${ecrire(Q)} ÷ ${nb(R)}`;
    const V = net(P * Q / R);
    const e = enBas ? S.ey : S.ex;
    const grille = tableau([[S.tx, S.x1, enBas ? S.x2 : '?'], [S.ty, nb(S.y1), enBas ? '?' : nb(S.y2)]]);
    return { S, enBas, P, Q, R, V, e, explication: `C’est une situation de proportionnalité :${grille}? = ${calcul} = <b>${e(V)}</b>.` };
  }

  function questionProbleme(avecBoutons) {
    const C = problemeCroix();
    const { S, enBas, P, Q, R, V } = C;
    if (!avecBoutons) {
      return nombre({
        consigne: 'Résous le problème', enonce: S.enonce, reponse: V, unite: S.unite || '', prix: Boolean(S.prix), explication: C.explication,
      });
    }
    // Les erreurs : l'addition (ajouter en bas ce qu'on ajoute en haut), le rapport à l'envers (y1 × x1 ÷ x2),
    // la mauvaise diagonale, s'arrêter à la valeur pour 1, oublier de diviser (toujours du même ordre de grandeur que la réponse)
    const ajout = net(enBas ? S.y1 + S.x2 - S.x1 : S.x1 + S.y2 - S.y1);
    // (un pourcentage : entre 0 et 100, sans autre condition de taille : 0,15 % est l’erreur « oublier × 100 »)
    const vraisemblable = v => v > 0 && auCentieme(v) && v !== V && (S.pourcentage ? v < 100
      : v >= V / 5 && v <= 5 * V && (enBas || Number.isInteger(v)));
    const erreurs = S.pourcentage ? S.pieges
      : [ajout, Q * R / P, P * R / Q, enBas ? S.y1 / S.x1 : S.x1 / S.y1, P * Q];
    let pieges = [...new Set(erreurs.map(net).filter(vraisemblable))];
    // (en dernier secours, une unité de plus ou de moins en haut : une personne, un kilo, une minute…)
    const k = S.y1 / S.x1;
    const pas = S.pas || 1;
    const voisins = [...RM.melanger(enBas ? [k * (S.x2 + pas), k * (S.x2 - pas)] : [V + pas, V - pas]),
      ...RM.melanger(enBas ? [k * (S.x2 + 2 * pas), k * (S.x2 - 2 * pas)] : [V + 2 * pas, V - 2 * pas])];
    if (pieges.length < 3) pieges = [...new Set([...pieges, ...voisins.map(net).filter(vraisemblable)])].slice(0, 3);
    const aGarder = !S.pourcentage && pieges.includes(ajout) ? [ajout] : [];
    const q = choix({
      consigne: 'Résous le problème',
      // (selon la situation, les erreurs sont presque toutes plus grandes, ou plus petites : on mélange les boutons)
      ordre: 'melange',
      enonce: S.enonce,
      reponse: C.e(V),
      pieges: pieges.map(C.e),
      garder: aGarder.map(C.e),
      explication: C.explication,
    });
    if (aGarder.length) {
      q.explication += `<br>⚠️ On n’ajoute pas ${enBas ? 'en bas ce qu’on ajoute en haut' : 'en haut ce qu’on ajoute en bas'} : ce n’est pas ${C.e(ajout)}.`;
    }
    return q;
  }

  // Est-ce proportionnel ? On compare les produits en croix
  function questionProportionnel() {
    const T = parmi(TABLEAUX);
    const { grille } = colonnes(T);
    const oui = Math.random() < 0.5;
    if (!oui) {
      // une case du bas un peu décalée
      const c = entier(0, 1);
      const v = parmi(T.ecarts.map(e => net(grille[1][c] + e)).filter(x => x > 0 && !grille.flat().includes(x)));
      grille[1][c] = v;
    }
    const [[x1, x2], [y1, y2]] = grille;
    const nb = ecritureBas(T);
    const [p1, p2] = [net(x1 * y2), net(x2 * y1)];
    return choix({
      consigne: 'Est-ce un tableau de proportionnalité ?',
      enonce: `${tableau([[T.x, x1, x2], [T.y, nb(y1), nb(y2)]])}Compare les produits en croix.`,
      reponse: oui ? 'Oui' : 'Non',
      choix: OUI_NON,
      explication: `${ecrire(x1)} × ${nb(y2)} = ${ecrire(p1)} ${oui ? 'et' : 'mais'} ${ecrire(x2)} × ${nb(y1)} = ${ecrire(p2)}.<br>`
        + (oui ? '<b>Oui</b> : les produits en croix sont égaux.' : '<b>Non</b> : les produits en croix ne sont pas égaux.'),
    });
  }

  function vraiFauxCroix() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.4) {
      // Si a/b = c/d, alors a × d = b × c (et pas a × c = b × d)
      const [p, q] = parmi([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7], [5, 8], [7, 9]]);
      const [m1, m2] = differents(2, 2, 9);
      const [a, b, c, d] = [p * m1, q * m1, p * m2, q * m2];
      const egalite = vrai ? `${ecrire(a)} × ${ecrire(d)} = ${ecrire(b)} × ${ecrire(c)}` : `${ecrire(a)} × ${ecrire(c)} = ${ecrire(b)} × ${ecrire(d)}`;
      return vraiFaux({
        enonce: `Si ${frac(a, b)} = ${frac(c, d)}, alors ${egalite}.`,
        vrai,
        explication: `Les produits en croix sont égaux : ${ecrire(a)} × ${ecrire(d)} = ${ecrire(a * d)} et ${ecrire(b)} × ${ecrire(c)} = ${ecrire(b * c)}.`
          + (vrai ? '' : `<br>Mais ${ecrire(a)} × ${ecrire(c)} = ${ecrire(a * c)} et ${ecrire(b)} × ${ecrire(d)} = ${ecrire(b * d)}.`),
      });
    }
    // La case « ? » vaut… (le faux : l'addition, ou la mauvaise diagonale)
    const T = parmi(TABLEAUX);
    const i = entier(0, 1);
    // (la case « ? » en haut : on divise par un nombre du bas, qui doit être entier pour calculer sans calculatrice)
    const { grille } = colonnes(T, i === 0);
    const j = entier(0, 1);
    const { p, q, r, valeur, ajout } = produitEnCroix(grille, i, j);
    const ecrit = (l, v) => (l === 1 ? ecritureBas(T)(v) : ecrire(v));
    // (une erreur du même ordre de grandeur que la réponse)
    const faux = parmi(positifs([ajout, p * r / q, q * r / p])
      .filter(v => v !== valeur && auCentieme(v) && (i === 1 || Number.isInteger(v)) && v >= valeur / 5 && v <= 5 * valeur));
    const annonce = vrai || faux === undefined ? valeur : faux;
    return vraiFaux({
      enonce: `${tableauAvec(T, grille, i, j, '?')}Dans ce tableau de proportionnalité, la case « ? » vaut ${ecrit(i, annonce)}.`,
      vrai: annonce === valeur,
      explication: `Produit en croix : ? = ${ecrit(i, p)} × ${ecrit(1 - i, q)} ÷ ${ecrit(1 - i, r)} = <b>${ecrit(i, valeur)}</b>.`
        + (annonce === valeur ? '' : `<br>⚠️ Et pas ${ecrit(i, annonce)} !`),
    });
  }

  ajouterEtape({
    id: '4e-donnees-quatrieme-proportionnelle',
    banque: ['croix', 'croix', 'calcul', 'calcul', 'probleme', 'probleme', 'problemeChoix', 'problemeChoix', 'problemeChoix',
      'proportionnel', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'croix') return questionCroix();
      if (sorte === 'calcul') return questionCalculCroix();
      if (sorte === 'probleme') return questionProbleme(false);
      if (sorte === 'problemeChoix') return questionProbleme(true);
      if (sorte === 'proportionnel') return questionProportionnel();
      return vraiFauxCroix();
    },
    titreLecon: 'La quatrième proportionnelle',
    lecon: `
      <p>Dans un tableau de proportionnalité, on connaît trois nombres et on cherche le quatrième :
        c’est la <b>quatrième proportionnelle</b>.</p>
      ${tableau([['Masse (kg)', 6, 7], ['Prix (€)', 9, '?']])}
      <h4>Le produit en croix</h4>
      <p>Dans un tableau de proportionnalité, les <b>produits en croix</b> sont égaux : <i>6 × ? = 7 × 9</i>.
        Autrement dit : si ${frac('a', 'b')} = ${frac('c', 'd')}, alors <b>a × d = b × c</b>.</p>
      <p>Pour trouver « ? », on multiplie les deux nombres de la <b>diagonale complète</b>, puis on divise par le <b>troisième</b> :
        <i>? = 7 × 9 ÷ 6 = 63 ÷ 6 = 10,5</i>. Donc 7&nbsp;kg coûtent 10,50&nbsp;€.</p>
      <p>👉 Ça marche aussi pour un pourcentage : <i>45 élèves sur 250, c’est ? % : 250 → 100 % et 45 → ? %,
        donc ? = 45 × 100 ÷ 250 = 18&nbsp;%.</i></p>
      <h4>Reconnaître un tableau de proportionnalité</h4>
      <p>On calcule les deux produits en croix : <i>4 × 15 = 60 et 6 × 10 = 60</i>. Ils sont égaux : c’est proportionnel.
        S’ils sont différents, ce n’est pas proportionnel.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le nombre par lequel on divise est toujours celui qui est <b>en face</b>
        de la case « ? », sur la même diagonale.</div>
      <p>⚠️ On n’ajoute pas : 7&nbsp;kg, c’est 1&nbsp;kg de plus que 6&nbsp;kg, mais le prix n’augmente pas de 1&nbsp;€ !</p>
    `,
  });

  // ======================================================================
  // 2. Proportionnalité et graphiques
  // ======================================================================
  // Un graphique avec une échelle différente sur chaque axe (le repère du moteur a la même unité sur les deux axes) :
  // x de 0 à xmax (une ligne tous les pasX, un nombre tous les etiqX), y de 0 à ymax (pareil).
  // traces : [{ f, a }] (une fonction, de 0 à a) ; points : [{ x, y, nom }]
  function graphique({ xmax, ymax, pasX, pasY, etiqX = pasX, etiqY = pasY, nomAxes = ['', ''], traces = [], points = [] }) {
    const [largeur, hauteur] = [420, 290];
    const [gauche, droite, haut, bas] = [46, 22, 30, 46];
    const X = v => gauche + v / xmax * (largeur - gauche - droite);
    const Y = v => haut + (ymax - v) / ymax * (hauteur - haut - bas);
    let html = '';
    intervalle(0, xmax, pasX).forEach(v => { html += figures.segment([X(v), Y(0)], [X(v), Y(ymax)], 'fig-grille'); });
    intervalle(0, ymax, pasY).forEach(v => { html += figures.segment([X(0), Y(v)], [X(xmax), Y(v)], 'fig-grille'); });
    html += figures.segment([X(0), Y(0)], [X(xmax) + 12, Y(0)], 'fig-axe') + figures.segment([X(0), Y(0)], [X(0), Y(ymax) - 12], 'fig-axe');
    intervalle(etiqX, xmax, etiqX).forEach(v => { html += figures.texte([X(v), Y(0) + 15], ecrire(v), { classe: 'fig-petit' }); });
    intervalle(etiqY, ymax, etiqY).forEach(v => { html += figures.texte([X(0) - 8, Y(v)], ecrire(v), { classe: 'fig-petit', ancre: 'end' }); });
    html += figures.texte([X(0) - 8, Y(0) + 15], '0', { classe: 'fig-petit', ancre: 'end' });
    // Les noms des axes : sous les nombres de l'axe horizontal, au-dessus de l'axe vertical
    if (nomAxes[0]) html += figures.texte([X(xmax) + 12, Y(0) + 34], nomAxes[0], { classe: 'fig-petit', ancre: 'end' });
    if (nomAxes[1]) html += figures.texte([X(0) - 6, Y(ymax) - 20], nomAxes[1], { classe: 'fig-petit', ancre: 'start' });
    traces.forEach(t => {
      const pts = intervalle(0, 80).map(i => [t.a * i / 80, t.f(t.a * i / 80)]).filter(([, y]) => y >= -1e-9 && y <= ymax + 1e-9);
      html += figures.ligne(pts.map(([x, y]) => [X(x), Y(y)]), 'fig-courbe');
    });
    points.forEach(p => { html += figures.point([X(p.x), Y(p.y)], p.nom, { dx: -14, dy: -14 }); });
    return figures.svg(largeur, hauteur, html, 'Un graphique');
  }

  // Les situations : l'introduction, les noms des axes, comment écrire les valeurs, les échelles possibles
  // (k : le coefficient ; xs : les abscisses où la droite passe pile sur un croisement du quadrillage)
  const GRAPHIQUES = [
    {
      intro: fruit => `Le graphique donne le prix des ${fruit} en fonction de leur masse.`,
      choses: ['pommes', 'poires', 'tomates', 'carottes'],
      axes: ['masse (kg)', 'prix (€)'], ex: kg, ey: euros, uniteX: 'kg', prixY: true,
      configs: [
        { k: 1.5, xmax: 8, pasX: 1, ymax: 12, pasY: 1, etiqY: 2, xs: [2, 4, 6] },
        { k: 2, xmax: 8, pasX: 1, ymax: 16, pasY: 1, etiqY: 2, xs: [2, 3, 4, 5, 6, 7] },
        { k: 2.5, xmax: 8, pasX: 1, ymax: 20, pasY: 2.5, etiqY: 5, xs: [2, 3, 4, 5, 6] },
        { k: 3, xmax: 8, pasX: 1, ymax: 24, pasY: 2, etiqY: 4, xs: [2, 4, 6] },
      ],
      lireY: (x, fruit) => `Combien coûtent ${kg(x)} ${de(fruit)} ?`,
      lireX: (y, fruit) => `Quelle masse ${de(fruit)} peut-on acheter avec ${euros(y)} ?`,
      coefficient: fruit => `Quel est le prix d’un kilo ${de(fruit)} ?`,
      // hors du graphique : une grande masse (un multiple d'une masse qu'on sait lire)
      loin: (C, fruit) => {
        const x = parmi([10, 12, 15, 20].filter(v => C.xs.some(r => v % r === 0)));
        return { x, lu: parmi(C.xs.filter(r => x % r === 0)), question: `Combien coûtent ${kg(x)} ${de(fruit)} ?` };
      },
    },
    {
      intro: p => `${p.nom} roule à vélo, à vitesse constante. Le graphique donne la distance parcourue en fonction de la durée.`,
      choses: [{ nom: 'Papi', il: 'il' }, { nom: 'Mamie', il: 'elle' }, { nom: 'Hugo', il: 'il' }, { nom: 'Léa', il: 'elle' }],
      axes: ['durée (h)', 'distance (km)'], ex: v => mesure(v, 'h'), ey: v => mesure(v, 'km'), uniteX: 'h', uniteY: 'km',
      configs: [
        { k: 10, xmax: 6, pasX: 1, ymax: 60, pasY: 5, etiqY: 10, xs: [2, 3, 4, 5] },
        { k: 15, xmax: 6, pasX: 1, ymax: 90, pasY: 5, etiqY: 10, xs: [2, 3, 4, 5] },
        { k: 20, xmax: 6, pasX: 1, ymax: 120, pasY: 10, etiqY: 20, xs: [2, 3, 4, 5] },
      ],
      lireY: (x, p) => `Quelle distance ${p.nom} a-t-${p.il} parcourue en ${mesure(x, 'h')} ?`,
      lireX: (y, p) => `Combien de temps faut-il à ${p.nom} pour parcourir ${mesure(y, 'km')} ?`,
      coefficient: p => `Quelle est la vitesse ${de(p.nom)}, en km/h ?`, uniteK: 'km/h',
      // une demi-heure : la moitié de la distance en une heure
      loin: (C, p) => ({ x: 0.5, lu: 1, question: `Quelle distance ${p.nom} parcourt-${p.il} en une demi-heure ?` }),
    },
    {
      intro: () => 'Un tuyau d’arrosage remplit une piscine gonflable. Le graphique donne le volume d’eau en fonction de la durée.',
      choses: [''],
      axes: ['durée (min)', 'volume (L)'], ex: v => mesure(v, 'min'), ey: v => mesure(v, 'L'), uniteX: 'min', uniteY: 'L',
      configs: [
        { k: 3, xmax: 10, pasX: 1, ymax: 30, pasY: 3, etiqY: 6, xs: [2, 3, 4, 5, 6, 7, 8] },
        { k: 4, xmax: 10, pasX: 1, ymax: 40, pasY: 4, etiqY: 8, xs: [2, 3, 4, 5, 6, 7, 8] },
        { k: 5, xmax: 10, pasX: 1, ymax: 50, pasY: 5, etiqY: 10, xs: [2, 3, 4, 5, 6, 7, 8] },
      ],
      lireY: x => `Combien de litres d’eau coulent en ${mesure(x, 'min')} ?`,
      lireX: y => `Combien de temps faut-il pour avoir ${mesure(y, 'L')} d’eau ?`,
      coefficient: () => 'Quel est le débit du tuyau, en litres par minute ?', uniteK: 'L/min',
      loin: C => {
        const x = parmi([15, 20, 30, 45, 60]);
        return { x, lu: parmi(C.xs.filter(r => x % r === 0 && x / r <= 10)), question: `Combien de litres coulent en ${mesure(x, 'min')} ?` };
      },
    },
  ];

  // Une situation, une échelle, et le graphique (avec un point A, si on le demande)
  function situationGraphique(avecPoint) {
    const G = parmi(GRAPHIQUES);
    const C = parmi(G.configs);
    const A = avecPoint ? parmi(C.xs) : null;
    const figure = graphique({
      xmax: C.xmax, ymax: C.ymax, pasX: C.pasX, pasY: C.pasY, etiqY: C.etiqY, nomAxes: G.axes,
      traces: [{ f: x => C.k * x, a: C.xmax }],
      points: A ? [{ x: A, y: C.k * A, nom: 'A' }] : [],
    });
    const qui = parmi(G.choses);
    return { G, C, A, qui, figure, intro: G.intro(qui) };
  }

  function questionLire(avecBoutons) {
    const { G, C, qui, figure, intro } = situationGraphique(false);
    const x = parmi(C.xs);
    const y = net(C.k * x);
    const surY = Math.random() < 0.6;
    const [question, V, e] = surY ? [G.lireY(x, qui), y, G.ey] : [G.lireX(y, qui), x, G.ex];
    const explication = surY
      ? `On part de ${G.ex(x)} sur l’axe horizontal, on monte jusqu’à la droite, puis on lit sur l’axe vertical : <b>${G.ey(y)}</b>.`
      : `On part de ${G.ey(y)} sur l’axe vertical, on va jusqu’à la droite, puis on descend sur l’axe horizontal : <b>${G.ex(x)}</b>.`;
    if (!avecBoutons) {
      return nombre({
        consigne: 'Lis le graphique', enonce: `${intro}${figure}${question}`, reponse: V,
        unite: surY ? (G.uniteY || '') : G.uniteX, prix: surY && Boolean(G.prixY), explication,
      });
    }
    // Les erreurs : une ligne de trop ou de moins, une colonne de trop ou de moins, lire sur le mauvais axe
    const candidats = surY
      ? [y + C.pasY, y - C.pasY, y + 2 * C.pasY, y - 2 * C.pasY, C.k * (x + 1), C.k * (x - 1), x]
      : [x + 0.5, x - 0.5, x + 1, x - 1, x + 2, x - 2];
    return choix({
      consigne: 'Lis le graphique',
      enonce: `${intro}${figure}${question}`,
      reponse: e(V),
      pieges: positifs(candidats).filter(v => v >= V / 3 && v <= 3 * V).map(e),
      explication,
    });
  }

  // Le coefficient : on lit un point de la droite, puis on divise
  function questionCoefficientGraphique() {
    const { G, C, A, qui, figure, intro } = situationGraphique(true);
    const yA = net(C.k * A);
    return nombre({
      consigne: 'Trouve le coefficient de proportionnalité',
      enonce: `${intro}${figure}Le point A est sur la droite. ${G.coefficient(qui)}`,
      reponse: C.k,
      unite: G.uniteK || '',
      prix: Boolean(G.prixY),
      explication: `Le point A a pour coordonnées (${ecrire(A)}${ESPACE}; ${ecrire(yA)}) : ${G.ex(A)} pour ${G.ey(yA)}.<br>`
        + `Le coefficient : ${ecrire(yA)} ÷ ${ecrire(A)} = <b>${G.prixY ? euros(C.k) : mesure(C.k, G.uniteK)}</b>.`,
    });
  }

  // Au-delà du graphique : on lit une valeur, puis on utilise la proportionnalité
  function questionLoin() {
    const { G, C, qui, figure, intro } = situationGraphique(false);
    const L = G.loin(C, qui);
    const yLu = net(C.k * L.lu);
    const V = net(C.k * L.x);
    const fois = L.x / L.lu;
    return nombre({
      consigne: 'Lis le graphique, puis calcule',
      enonce: `${intro}${figure}${L.question}`,
      reponse: V,
      unite: G.uniteY || '',
      prix: Boolean(G.prixY),
      explication: `On lit : ${G.ex(L.lu)} pour ${G.ey(yLu)}. C’est proportionnel :<br>`
        + (fois > 1
          ? `${G.ex(L.x)}, c’est ${ecrire(fois)} fois plus, donc ${ecrire(yLu)} × ${ecrire(fois)} = <b>${G.ey(V)}</b>.`
          : `${L.x === 0.5 ? 'une demi-heure' : G.ex(L.x)}, c’est 2 fois moins, donc ${ecrire(yLu)} ÷ 2 = <b>${G.ey(V)}</b>.`),
    });
  }

  // Quatre petits graphiques : un seul représente une situation de proportionnalité
  const ALLURES = {
    // [la courbe (u de 0 à 80, v de 0 à 95), ce qu'on en dit]
    proportionnelle: [s => [[0, 0], [80, 80 * s]], ''],
    affine: [s => [[0, 22], [80, 22 + 70 * s]], 'une droite qui ne passe pas par l’origine'],
    decroissante: [() => [[0, 82], [80, 18]], 'une droite qui ne passe pas par l’origine'],
    decalee: [() => [[22, 0], [80, 82]], 'une droite qui ne passe pas par l’origine'],
    courbe: [() => intervalle(0, 80, 5).map(u => [u, 88 * (u / 80) ** 2]), 'elle passe par l’origine, mais ce n’est pas une droite'],
    brisee: [() => [[0, 0], [28, 48], [52, 48], [80, 86]], 'elle passe par l’origine, mais ce n’est pas une droite'],
  };
  function quatreGraphiques(allures) {
    let html = '';
    allures.forEach((nom, i) => {
      const O = [26 + i * 112, 130];
      const P = ([u, v]) => [O[0] + u, O[1] - v];
      html += figures.segment(O, [O[0] + 88, O[1]], 'fig-axe') + figures.segment(O, [O[0], O[1] - 100], 'fig-axe');
      html += figures.texte([O[0] - 9, O[1] + 9], '0', { classe: 'fig-petit' });
      html += figures.ligne(ALLURES[nom][0](0.6 + Math.random() * 0.45).map(P), 'fig-courbe');
      html += figures.texte([O[0] + 44, O[1] + 20], ecrire(i + 1), { classe: 'fig-texte' });
    });
    return figures.svg(460, 160, html, 'Quatre graphiques');
  }

  function questionReconnaitre() {
    const autres = RM.melanger(Object.keys(ALLURES).filter(a => a !== 'proportionnelle')).slice(0, 3);
    const allures = RM.melanger(['proportionnelle', ...autres]);
    const bon = allures.indexOf('proportionnelle') + 1;
    const boutons = allures.map((a, i) => `Graphique ${i + 1}`);
    const details = allures.map((a, i) => (i + 1 === bon ? '' : `le ${i + 1} : ${ALLURES[a][1]}`)).filter(Boolean);
    return choix({
      consigne: 'Choisis le bon graphique',
      enonce: `${quatreGraphiques(allures)}Lequel de ces graphiques peut représenter une situation de proportionnalité ?`,
      reponse: boutons[bon - 1],
      choix: boutons,
      explication: `Le graphique ${bon} est une <b>droite qui passe par l’origine</b>.<br>${majuscule(details.join(' ; '))}.`,
    });
  }

  // Un point (a ; b) de la droite, écrit pour un bouton : « (6 ; 9) »
  const point = (x, y) => `(${ecrire(x)}${ESPACE}; ${ecrire(y)})`;
  // Une droite qui passe par l'origine et par (a ; b), avec a ≠ b
  function pointDeDepart() {
    const [a, b] = differents(2, 1, 6);
    return [a, b];
  }

  function questionPointDroite() {
    const [a, b] = pointDeDepart();
    const m = entier(2, 5);
    const [x, y] = [m * a, m * b];
    // Les erreurs (aucune n'est sur la droite, puisque a ≠ b) : ajouter le même nombre aux deux coordonnées,
    // les échanger, ajouter le même nombre à a et à b ; chacune avec un autre multiple que la réponse
    let ajout;
    let pieges;
    let m1;
    do {
      const [n1, n2] = RM.melanger([2, 3, 4, 5].filter(v => v !== m)).slice(0, 2);
      m1 = n1;
      ajout = point(n1 * a, b + (n1 - 1) * a);
      pieges = [ajout, point(n2 * b, n2 * a), point(a + n2 + 1, b + n2 + 1)];
    } while (new Set([...pieges, point(x, y)]).size < 4);
    return choix({
      consigne: 'Choisis le bon point',
      enonce: `Une droite passe par l’origine et par ${point(a, b)}. Quel point est aussi sur cette droite ?`,
      reponse: point(x, y),
      pieges,
      garder: [ajout],
      explication: `La droite passe par l’origine : les coordonnées de ses points sont proportionnelles.<br>`
        + `${ecrire(a)} × ${ecrire(m)} = ${ecrire(x)} et ${ecrire(b)} × ${ecrire(m)} = ${ecrire(y)} : c’est <b>${point(x, y)}</b>.`
        + `<br>⚠️ ${ajout} : on a ajouté ${ecrire((m1 - 1) * a)} aux deux coordonnées. Il faut les multiplier par le même nombre.`,
    });
  }

  function questionCoefficientPoint() {
    const k = parmi([0.5, 1.5, 2, 2.5, 3, 4, 6]);
    const a = parmi([2, 4, 6, 8, 10].filter(v => v * k !== v && v * k <= 30));
    const b = net(k * a);
    // Les erreurs : l'inverse (a ÷ b), la différence, l'ordonnée seule, le double ou la moitié du coefficient
    const inverse = net(a / b);
    const candidats = [inverse, b - a, b, 2 * k, k / 2].map(net).filter(v => auCentieme(v) && v > 0 && v !== k);
    const q = choix({
      consigne: 'Trouve le coefficient de proportionnalité',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce: `Une droite passe par l’origine et par ${point(a, b)}. Quel est le coefficient ?`,
      reponse: k,
      pieges: candidats,
      garder: candidats.includes(inverse) ? [inverse] : [],
      explication: `Sur la droite, l’ordonnée = coefficient × abscisse. On divise : ${ecrire(b)} ÷ ${ecrire(a)} = <b>${ecrire(k)}</b>.<br>`
        + `On vérifie : ${ecrire(a)} × ${ecrire(k)} = ${ecrire(b)}.`,
    });
    if (candidats.includes(inverse)) q.explication += `<br>⚠️ ${ecrire(a)} ÷ ${ecrire(b)} = ${ecrire(inverse)}, c’est le calcul à l’envers.`;
    return q;
  }

  // Des règles, écrites deux fois : juste et fausse, avec la même forme
  const REGLES_GRAPHIQUES = [
    ['Une situation de proportionnalité est représentée par une droite qui passe par l’origine.',
      'Une situation de proportionnalité est représentée par une droite qui ne passe pas par l’origine.',
      'Le graphique d’une situation de proportionnalité est une <b>droite qui passe par l’origine</b>.'],
    ['Si le prix est proportionnel à la masse, le graphique passe par l’origine : 0 kg coûte 0 €.',
      'Si le prix est proportionnel à la masse, le graphique ne passe pas par l’origine.',
      'Si c’est proportionnel, 0&nbsp;kg coûte 0&nbsp;€ : le graphique passe par l’<b>origine</b>.'],
    ['Un taxi coûte 3 € au départ, puis 2 € par km. Son graphique ne passe pas par l’origine.',
      'Un taxi coûte 3 € au départ, puis 2 € par km. Son graphique passe par l’origine.',
      'Pour 0&nbsp;km, on paie déjà 3&nbsp;€ : le graphique part de 3, il ne passe <b>pas</b> par l’origine. Ce n’est pas proportionnel.'],
    ['Un graphique qui passe par l’origine, mais qui n’est pas une droite, ne représente pas une situation de proportionnalité.',
      'Tout graphique qui passe par l’origine représente une situation de proportionnalité.',
      'Il faut les deux : une <b>droite</b>, et qui passe par l’<b>origine</b>.'],
  ];

  function vraiFauxGraphique() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      const [juste, faux, pourquoi] = parmi(REGLES_GRAPHIQUES);
      return vraiFaux({ enonce: (vrai ? juste : faux).replace(/(\d) (€|km)/g, `$1${ESPACE}$2`), vrai, explication: pourquoi });
    }
    const [a, b] = pointDeDepart();
    const m = entier(2, 5);
    const [x, y] = [m * a, m * b];
    const annonce = vrai ? y : b + x - a;
    return vraiFaux({
      enonce: `Une droite passe par l’origine et par ${point(a, b)}. Le point ${point(x, annonce)} est aussi sur cette droite.`,
      vrai: annonce === y,
      explication: `${ecrire(x)} = ${ecrire(a)} × ${ecrire(m)}, donc l’ordonnée doit être ${ecrire(b)} × ${ecrire(m)} = ${ecrire(y)} : `
        + `c’est le point <b>${point(x, y)}</b>.`,
    });
  }

  ajouterEtape({
    id: '4e-donnees-graphiques',
    banque: ['lire', 'lireChoix', 'lireChoix', 'coefficient', 'loin', 'loin', 'reconnaitre', 'reconnaitre',
      'point', 'point', 'point', 'coefficientPoint', 'coefficientPoint', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'lire') return questionLire(false);
      if (sorte === 'lireChoix') return questionLire(true);
      if (sorte === 'coefficient') return questionCoefficientGraphique();
      if (sorte === 'loin') return questionLoin();
      if (sorte === 'reconnaitre') return questionReconnaitre();
      if (sorte === 'point') return questionPointDroite();
      if (sorte === 'coefficientPoint') return questionCoefficientPoint();
      return vraiFauxGraphique();
    },
    titreLecon: 'Proportionnalité et graphiques',
    lecon: `
      <h4>La règle</h4>
      <p>Une situation de proportionnalité est représentée par une <b>droite qui passe par l’origine</b> du repère (le point (0 ; 0)).
        Et une droite qui passe par l’origine représente toujours une situation de proportionnalité.</p>
      ${graphique({ xmax: 6, ymax: 15, pasX: 1, pasY: 1, etiqY: 5, nomAxes: ['masse (kg)', 'prix (€)'], traces: [{ f: x => 2.5 * x, a: 6 }], points: [{ x: 4, y: 10, nom: 'A' }] })}
      <h4>Lire le graphique</h4>
      <p>On part de 4&nbsp;kg sur l’axe horizontal, on monte jusqu’à la droite, puis on lit sur l’axe vertical : <i>4&nbsp;kg coûtent 10&nbsp;€</i>.
        Le point A a pour coordonnées (4 ; 10).</p>
      <p><b>Le coefficient</b> : on divise l’ordonnée d’un point par son abscisse : <i>10 ÷ 4 = 2,5</i>. Un kilo coûte 2,50&nbsp;€.
        Les coordonnées de tous les points de la droite sont proportionnelles : <i>(2 ; 5), (4 ; 10), (6 ; 15)…</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour une valeur qui sort du graphique, lis une valeur facile, puis calcule :
        20&nbsp;kg, c’est 5 fois 4&nbsp;kg, donc 5 × 10 = 50&nbsp;€.</div>
      <p>⚠️ Pas proportionnel : une droite qui ne passe pas par l’origine (un taxi qui coûte déjà 3&nbsp;€ au départ),
        ou une courbe, même si elle passe par l’origine.</p>
    `,
  });

  // ======================================================================
  // 3. Augmenter et diminuer d'un pourcentage
  // ======================================================================
  const pc = t => mesure(t, '%');
  // Le coefficient multiplicateur : + t % → × (1 + t/100) ; − t % → × (1 − t/100)
  const coefficientDe = (t, hausse) => net(hausse ? 1 + t / 100 : 1 - t / 100);
  const fois = c => `×${ESPACE}${ecrire(c)}`;
  // La phrase de la règle : « Augmenter de 20 %, c’est multiplier par 1 + 0,2 = 1,2. »
  const regle = (t, hausse) => `${hausse ? 'Augmenter' : 'Diminuer'} de ${pc(t)}, c’est multiplier par `
    + `1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} = ${ecrire(coefficientDe(t, hausse))}`;

  // Ce qui augmente ou diminue : l'énoncé, les valeurs de départ possibles, comment écrire le résultat
  // [l'article, « le prix du… », les prix possibles]
  const ARTICLES = [
    ['un jeu de société', 'du jeu de société', [20, 30, 40, 50]], ['un sac à dos', 'du sac à dos', [30, 40, 50, 60]],
    ['un vélo', 'du vélo', [150, 200, 250, 300]], ['un casque audio', 'du casque audio', [40, 50, 60, 80]],
    ['une paire de baskets', 'de la paire de baskets', [50, 60, 80, 90]],
    ['un abonnement au cinéma', 'de l’abonnement au cinéma', [100, 120, 150, 200]],
  ];
  const EVOLUTIONS = [
    // un prix qui augmente ou qui baisse
    (t, hausse) => {
      if (t > (hausse ? 30 : 40)) return null;
      const [article, , prix] = parmi(ARTICLES);
      const p = parmi(prix);
      return { p, e: euros, prix: true,
        enonce: `${majuscule(article)} coûte ${euros(p)}. Son prix ${hausse ? 'augmente' : 'baisse'} de ${pc(t)}. Quel est son nouveau prix ?` };
    },
    // les soldes (seulement une baisse)
    (t, hausse) => {
      if (hausse) return null;
      const [article, , prix] = parmi(ARTICLES);
      const p = parmi(prix);
      return { p, e: euros, prix: true, enonce: `Pendant les soldes, ${article} à ${euros(p)} est à ${MOINS}${pc(t)}. Quel est son prix soldé ?` };
    },
    // la population d'un village
    (t, hausse) => {
      if (t > 20) return null;
      const p = parmi([800, 1200, 1500, 2000, 2400, 3000]);
      return { p, e: v => combien(v, 'habitant'), unite: 'habitants',
        enonce: `Un village comptait ${ecrire(p)} habitants. En dix ans, sa population a ${hausse ? 'augmenté' : 'baissé'} de ${pc(t)}. `
          + 'Combien d’habitants compte-t-il maintenant ?' };
    },
    // les membres d'un club
    (t, hausse) => {
      if (t > 40) return null;
      const p = parmi([40, 60, 80, 120, 160, 200].filter(v => Number.isInteger(v * t / 100)));
      if (!p) return null;
      const club = parmi(['de judo', 'de théâtre', 'de foot', 'd’échecs']);
      return { p, e: v => combien(v, 'membre'), unite: 'membres',
        enonce: `Le club ${club} avait ${ecrire(p)} membres. Cette année, le nombre de membres a ${hausse ? 'augmenté' : 'baissé'} de ${pc(t)}. `
          + 'Combien de membres a-t-il maintenant ?' };
    },
  ];
  // Une évolution (le taux, hausse ou baisse, la situation) dont le résultat tombe juste
  function evolution() {
    for (;;) {
      const hausse = Math.random() < 0.5;
      const t = parmi(hausse ? [5, 10, 15, 20, 25, 30, 40, 50, 12, 8, 35] : [5, 10, 15, 20, 25, 30, 40, 50, 12, 35, 60, 75]);
      const S = parmi(EVOLUTIONS)(t, hausse);
      if (S && Number.isInteger(net(S.p * t)) && (S.prix || Number.isInteger(net(S.p * t / 100)))) {
        const variation = net(S.p * t / 100);
        return { ...S, t, hausse, variation, r: net(hausse ? S.p + variation : S.p - variation), c: coefficientDe(t, hausse) };
      }
    }
  }
  const expliquerEvolution = E => `${regle(E.t, E.hausse)}.<br>${ecrire(E.p)} × ${ecrire(E.c)} = <b>${E.e(E.r)}</b>.`
    + `<br>Ou : ${pc(E.t)} de ${ecrire(E.p)} = ${ecrire(E.variation)}, et ${ecrire(E.p)} ${E.hausse ? '+' : '−'} ${ecrire(E.variation)} = ${ecrire(E.r)}.`;

  // Le coefficient multiplicateur (des boutons « × 1,2 »), ou le pourcentage qui va avec un coefficient
  function questionCoefficientMultiplicateur() {
    const hausse = Math.random() < 0.5;
    const t = parmi([5, 8, 10, 15, 20, 25, 30, 40, 50, 12, 3]);
    const c = coefficientDe(t, hausse);
    if (Math.random() < 0.55) {
      // Les erreurs : prendre t/100 (le pourcentage seul), l'autre sens, une virgule mal placée (5 % → 1,5 ; 20 % → 1,02 ; 0,02)
      const candidats = hausse
        ? [t / 100, t / 1000, 1 - t / 100, 1 + t / 1000, ...(t < 10 ? [1 + t / 10] : [])]
        : [t / 100, t / 1000, 1 + t / 100, 1 - t / 1000, ...(t < 10 ? [1 - t / 10] : [])];
      const q = choix({
        consigne: 'Choisis le coefficient multiplicateur',
        enonce: `${hausse ? 'Augmenter' : 'Diminuer'} un nombre de ${pc(t)}, c’est le multiplier par…`,
        reponse: fois(c),
        pieges: positifs(candidats).map(fois),
        explication: `${regle(t, hausse)}.`,
      });
      if (net(t / 100) !== c && q.choix.includes(fois(t / 100))) q.explication += `<br>⚠️ ${fois(t / 100)} donne seulement les ${pc(t)}, pas le nouveau nombre.`;
      return q;
    }
    // Dans l'autre sens : × 0,85, c'est une baisse de 15 %
    const phrase = (h, x) => `${h ? 'hausse' : 'baisse'} de ${pc(x)}`;
    // Les erreurs : l'autre sens, lire le coefficient comme un pourcentage (× 0,85 → 85 % ; × 1,15 → 115 % ou 1,15 %)
    const candidats = hausse
      ? [phrase(false, t), phrase(true, 100 + t), phrase(true, c)]
      : [phrase(true, t), phrase(true, 100 - t), phrase(false, 100 - t), phrase(false, c), phrase(false, t / 10)];
    if (hausse && t < 10) candidats.push(phrase(true, 10 * t));
    const explication = `${ecrire(c)} = 1 ${hausse ? '+' : '−'} ${ecrire(t / 100)} : c’est une <b>${phrase(hausse, t)}</b>.`
      + `<br>${hausse ? 'Un coefficient plus grand que 1 fait augmenter.' : 'Un coefficient plus petit que 1 fait diminuer.'}`;
    if (Math.random() < 0.5) {
      return nombre({
        consigne: 'Trouve le pourcentage',
        enonce: `Un prix est multiplié par ${ecrire(c)}. De quel pourcentage a-t-il ${hausse ? 'augmenté' : 'baissé'} ?`,
        reponse: t,
        unite: '%',
        explication,
      });
    }
    return choix({
      consigne: 'Choisis la bonne évolution',
      enonce: `Multiplier un prix par ${ecrire(c)}, c’est appliquer une…`,
      reponse: phrase(hausse, t),
      pieges: candidats,
      explication,
    });
  }

  function questionNouvelleValeur(avecBoutons) {
    const E = evolution();
    if (!avecBoutons) {
      return nombre({
        consigne: 'Calcule la nouvelle valeur', enonce: E.enonce, reponse: E.r, unite: E.unite || '', prix: Boolean(E.prix),
        explication: expliquerEvolution(E),
      });
    }
    const { p, t, r, variation } = E;
    // Les erreurs : ajouter (ou enlever) t unités, donner la variation seule, se tromper de sens,
    // une virgule mal placée (20 % → × 1,02), compter la variation deux fois
    const ajoutT = net(E.hausse ? p + t : p - t);
    const candidats = E.hausse
      ? [ajoutT, variation, p - variation, p * (1 + t / 1000), p + 2 * variation]
      : [ajoutT, variation, p + variation, p * (1 - t / 1000), p - 2 * variation];
    const pieges = positifs(candidats).filter(v => (E.prix ? auCentieme(v) : Number.isInteger(v)) && v >= r / 10 && v !== r);
    const q = choix({
      consigne: 'Calcule la nouvelle valeur',
      enonce: E.enonce,
      reponse: E.e(r),
      pieges: pieges.map(E.e),
      garder: pieges.includes(ajoutT) ? [E.e(ajoutT)] : [],
      explication: expliquerEvolution(E),
    });
    const ajout = E.e(ajoutT);
    // (avec 100 au départ, ajouter t donne la bonne réponse : pas de mise en garde)
    if (ajoutT !== r && q.choix.includes(ajout)) q.explication += `<br>⚠️ On n’${E.hausse ? 'ajoute' : 'enlève'} pas ${ecrire(t)} : on calcule ${pc(t)} de ${ecrire(p)}.`;
    return q;
  }

  // Retrouver le pourcentage d'évolution : la variation, divisée par la valeur de départ
  function questionRetrouverPourcentage(avecBoutons) {
    const hausse = Math.random() < 0.5;
    const [, du, prix] = parmi(ARTICLES);
    let p;
    let t;
    do { p = parmi(prix); t = parmi([5, 10, 15, 20, 25, 30, 40, 12, 35]); } while (!Number.isInteger(p * t / 100));
    const variation = p * t / 100;
    const r = hausse ? p + variation : p - variation;
    const enonce = `Le prix ${du} passe de ${euros(p)} à ${euros(r)}. De quel pourcentage a-t-il ${hausse ? 'augmenté' : 'baissé'} ?`;
    const explication = `${hausse ? 'L’augmentation' : 'La baisse'} : ${ecrire(Math.max(p, r))} − ${ecrire(Math.min(p, r))} = ${euros(variation)}.<br>`
      + `On la compare au prix de <b>départ</b> : ${ecrire(variation)} ÷ ${ecrire(p)} = ${ecrire(t / 100)} = <b>${pc(t)}</b>.`;
    if (!avecBoutons) {
      return nombre({ consigne: 'Trouve le pourcentage d’évolution', enonce, reponse: t, unite: '%', explication });
    }
    // Les erreurs : la variation en euros prise pour un pourcentage, le nouveau prix ÷ l'ancien (115 % ou 85 %),
    // comparer au nouveau prix au lieu du prix de départ, doubler ou partager le taux
    const candidats = [variation, r / p * 100, variation / r * 100, 2 * t, t / 2].map(net)
      .filter(v => Number.isInteger(v) && v > 0 && v <= 200 && v !== t);
    const q = choix({
      consigne: 'Trouve le pourcentage d’évolution',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce,
      reponse: pc(t),
      pieges: candidats.map(pc),
      garder: candidats.includes(variation) ? [pc(variation)] : [],
      explication,
    });
    // (avec 100 € au départ, la variation en euros est bien le pourcentage : pas de mise en garde)
    if (variation !== t && q.choix.includes(pc(variation))) q.explication += `<br>⚠️ ${euros(variation)} de plus ou de moins, ce n’est pas ${pc(variation)} !`;
    return q;
  }

  // Le piège : + t % puis − t %, on ne revient pas au prix de départ
  // (prix : les prix possibles ; avec 25 %, un multiple de 4, pour tomber au centime près)
  function allerRetour(prix = [20, 40, 50, 60, 80, 100]) {
    const t = parmi([10, 20, 25, 50]);
    const p = parmi(t === 25 ? prix.filter(v => v % 4 === 0) : prix);
    const hausseDabord = Math.random() < 0.6;
    const [c1, c2] = hausseDabord ? [1 + t / 100, 1 - t / 100] : [1 - t / 100, 1 + t / 100];
    const m = net(p * c1);
    const r = net(m * c2);
    return { t, p, hausseDabord, c1: net(c1), c2: net(c2), m, r };
  }
  const phraseAllerRetour = A => (A.hausseDabord ? `augmente de ${pc(A.t)}, puis baisse de ${pc(A.t)}` : `baisse de ${pc(A.t)}, puis augmente de ${pc(A.t)}`);
  const expliquerAllerRetour = A => `Après ${A.hausseDabord ? 'la hausse' : 'la baisse'} : ${ecrire(A.p)} × ${ecrire(A.c1)} = ${euros(A.m)}.<br>`
    + `Après ${A.hausseDabord ? 'la baisse' : 'la hausse'} : ${ecrire(A.m)} × ${ecrire(A.c2)} = <b>${euros(A.r)}</b>.`;

  function questionAllerRetour() {
    const [article, , prix] = parmi(ARTICLES);
    const A = allerRetour(prix);
    return choix({
      consigne: 'Calcule le prix final',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce: `${majuscule(article)} coûte ${euros(A.p)}. Son prix ${phraseAllerRetour(A)}. Quel est son prix final ?`,
      reponse: euros(A.r),
      // le piège : revenir au prix de départ
      pieges: positifs([A.p, A.m, A.p * (1 - A.t / 100), A.p * (1 + A.t / 100), A.r - (A.p - A.r), A.p + (A.p - A.r)]).map(euros),
      explication: `${expliquerAllerRetour(A)}<br>⚠️ On ne revient pas à ${euros(A.p)} : les ${pc(A.t)} de la 2<sup>e</sup> évolution se calculent sur ${euros(A.m)}.`,
    });
  }

  function vraiFauxPourcentages() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.35) {
      const A = allerRetour();
      // (les faux : revenir au prix de départ, oublier la 2e évolution, compter deux fois la perte, ne faire que la baisse)
      const annonce = vrai ? A.r : parmi(positifs([A.p, A.m, 2 * A.r - A.p, A.p * (1 - A.t / 100)]).filter(v => v !== A.r));
      return vraiFaux({
        enonce: `Un prix de ${euros(A.p)} ${phraseAllerRetour(A)}. Il vaut alors ${euros(annonce)}.`,
        vrai: annonce === A.r,
        explication: expliquerAllerRetour(A),
      });
    }
    const hausse = Math.random() < 0.5;
    const t = parmi([5, 10, 15, 20, 25, 30, 40, 12, 35, 60]);
    const bon = coefficientDe(t, hausse);
    const faux = parmi(positifs(hausse ? [t / 100, 1 - t / 100, t < 10 ? 1 + t / 10 : 1 + t / 1000] : [t / 100, 1 + t / 100, 1 - t / 1000])
      .filter(v => v !== bon));
    return vraiFaux({
      enonce: `${hausse ? 'Augmenter' : 'Diminuer'} un nombre de ${pc(t)}, c’est le multiplier par ${ecrire(vrai ? bon : faux)}.`,
      vrai,
      explication: `${regle(t, hausse)}.`,
    });
  }

  ajouterEtape({
    id: '4e-donnees-pourcentages',
    banque: ['coefficient', 'coefficient', 'coefficient', 'nouvelle', 'nouvelle', 'nouvelleChoix', 'nouvelleChoix', 'retrouver',
      'retrouverChoix', 'allerRetour', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'coefficient') return questionCoefficientMultiplicateur();
      if (sorte === 'nouvelle') return questionNouvelleValeur(false);
      if (sorte === 'nouvelleChoix') return questionNouvelleValeur(true);
      if (sorte === 'retrouver') return questionRetrouverPourcentage(false);
      if (sorte === 'retrouverChoix') return questionRetrouverPourcentage(true);
      if (sorte === 'allerRetour') return questionAllerRetour();
      return vraiFauxPourcentages();
    },
    titreLecon: 'Augmenter et diminuer',
    lecon: `
      <h4>Le coefficient multiplicateur</h4>
      <p><b>Augmenter</b> de t&nbsp;%, c’est multiplier par <b>1 + ${frac('t', 100)}</b>. <b>Diminuer</b> de t&nbsp;%, c’est multiplier par <b>1 − ${frac('t', 100)}</b>.</p>
      <table>
        <tr><th>Évolution</th><th>+ 20&nbsp;%</th><th>+ 5&nbsp;%</th><th>− 15&nbsp;%</th><th>− 40&nbsp;%</th></tr>
        <tr><td>On multiplie par</td><td>1,2</td><td>1,05</td><td>0,85</td><td>0,6</td></tr>
      </table>
      <p>👉 <i>Un jeu à 40&nbsp;€ augmente de 15&nbsp;% : 40 × 1,15 = 46&nbsp;€.</i>
        On peut aussi calculer 15&nbsp;% de 40 = 6, puis 40 + 6 = 46.</p>
      <p>Un coefficient plus grand que 1 fait augmenter ; plus petit que 1, il fait diminuer : <i>× 0,7, c’est une baisse de 30&nbsp;%.</i></p>
      <h4>Retrouver le pourcentage d’évolution</h4>
      <p>On divise la variation par la valeur de <b>départ</b> : <i>de 80&nbsp;€ à 68&nbsp;€, la baisse est de 12&nbsp;€ ;
        12 ÷ 80 = 0,15 = 15&nbsp;%.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> + 5&nbsp;%, c’est × 1,05 (et pas × 1,5, qui fait + 50&nbsp;%) !</div>
      <p>⚠️ + 20&nbsp;% puis − 20&nbsp;% ne ramène <b>pas</b> au prix de départ : <i>50 × 1,2 = 60, puis 60 × 0,8 = 48&nbsp;€.</i>
        La baisse se calcule sur 60, pas sur 50.</p>
    `,
  });

  // ======================================================================
  // 4. Moyenne et médiane
  // ======================================================================
  // Au plus un chiffre après la virgule
  const auDixieme = v => Number.isInteger(net(v * 10));
  // « 4e », avec le petit e en exposant
  const rang = k => `${ecrire(k)}<sup>e</sup>`;
  // Les séries : la phrase, les valeurs possibles, les nombres de valeurs, l'unité
  const SERIES = [
    { texte: p => `Voici les notes ${de(p.nom)} ce trimestre, sur 20 :`, min: 5, max: 19, n: [5, 6, 7, 8], unite: '' },
    { texte: p => `${p.nom} a chronométré ses tours de piste, en secondes :`, min: 48, max: 75, n: [5, 6, 7], unite: 's' },
    { texte: () => 'Voici les températures relevées à midi pendant plusieurs jours, en °C :', min: 8, max: 24, n: [5, 6, 7, 8, 9], unite: '°C' },
    { texte: () => 'Voici les tailles de quelques élèves de la classe, en cm :', min: 138, max: 168, n: [5, 6, 7, 9], unite: 'cm' },
    { texte: p => `${p.nom} a noté le nombre de pages lues chaque jour de la semaine :`, min: 5, max: 40, n: [7], unite: 'pages', ecrit: v => combien(v, 'page') },
    { texte: () => 'Voici le nombre de buts marqués par l’équipe à chaque match :', min: 0, max: 6, n: [7, 8, 9], unite: 'buts', ecrit: v => combien(v, 'but') },
  ];
  // La médiane d'une liste de nombres
  function mediane(valeurs) {
    const tri = croissant(valeurs);
    const n = tri.length;
    return n % 2 ? tri[(n - 1) / 2] : net((tri[n / 2 - 1] + tri[n / 2]) / 2);
  }
  // Le « milieu » de la liste pas rangée (l'erreur classique)
  const milieuSansRanger = valeurs => (valeurs.length % 2 ? valeurs[(valeurs.length - 1) / 2]
    : net((valeurs[valeurs.length / 2 - 1] + valeurs[valeurs.length / 2]) / 2));
  // Une série pas rangée, dont le milieu (sans ranger) n'est pas la médiane (le piège est bien là)
  // (moyenneJuste : la moyenne a au plus un chiffre après la virgule)
  function serie(n, min, max, moyenneJuste = false) {
    for (let essai = 0; ; essai++) {
      const valeurs = Array.from({ length: n }, () => entier(min, max));
      if (new Set(valeurs).size < n - 2) continue;
      if (moyenneJuste && !auDixieme(additionner(valeurs) / n)) continue;
      if (milieuSansRanger(valeurs) === mediane(valeurs) && essai < 50) continue;
      return valeurs;
    }
  }
  function expliquerMediane(valeurs, e = ecrire) {
    const tri = croissant(valeurs);
    const n = tri.length;
    const debut = `On range d’abord la série : ${liste(tri)}.<br>`;
    if (n % 2) return `${debut}Il y a ${ecrire(n)} valeurs : la médiane est celle du milieu, la ${rang((n + 1) / 2)}, <b>${e(mediane(tri))}</b>.`;
    const [a, b] = [tri[n / 2 - 1], tri[n / 2]];
    return `${debut}Il y a ${ecrire(n)} valeurs : la médiane est entre la ${rang(n / 2)} et la ${rang(n / 2 + 1)}, `
      + (a === b ? `qui valent toutes les deux ${ecrire(a)} : <b>${e(a)}</b>.` : `(${ecrire(a)} + ${ecrire(b)}) ÷ 2 = <b>${e(mediane(tri))}</b>.`);
  }
  const expliquerMoyenne = (valeurs, e = ecrire) => `La somme : ${somme(valeurs)} = ${ecrire(additionner(valeurs))}.<br>`
    + `Il y a ${ecrire(valeurs.length)} valeurs : ${ecrire(additionner(valeurs))} ÷ ${ecrire(valeurs.length)} = <b>${e(net(additionner(valeurs) / valeurs.length))}</b>.`;

  function questionMediane() {
    const S = parmi(SERIES);
    const p = parmi(ENFANTS);
    const valeurs = serie(parmi(S.n), S.min, S.max);
    const e = S.ecrit || (v => (S.unite ? mesure(v, S.unite) : ecrire(v)));
    return nombre({
      consigne: 'Trouve la médiane',
      enonce: `${S.texte(p)} ${liste(valeurs)}.<br>Quelle est la médiane de cette série ?`,
      reponse: mediane(valeurs),
      unite: S.unite,
      explication: expliquerMediane(valeurs, e),
    });
  }

  // Une série sans situation (pour la course) : les erreurs sont oublier de ranger, prendre une valeur voisine, la moyenne…
  function questionMedianeCourte() {
    const n = parmi([5, 6, 7]);
    const valeurs = serie(n, 2, 20);
    const med = mediane(valeurs);
    const tri = croissant(valeurs);
    const m = (n - (n % 2 ? 1 : 2)) / 2;
    const candidats = [milieuSansRanger(valeurs), tri[m - 1], tri[m + (n % 2 ? 1 : 2)], additionner(valeurs) / n,
      (tri[0] + tri[n - 1]) / 2];
    if (n % 2 === 0) candidats.push(tri[n / 2 - 1], tri[n / 2]);
    if (new Set(positifs(candidats).filter(v => auDixieme(v) && v !== med)).size < 3) candidats.push(...tri);
    const milieu = milieuSansRanger(valeurs);
    const q = choix({
      consigne: 'Trouve la médiane',
      enonce: `Quelle est la médiane de la série ${liste(valeurs)} ?`,
      reponse: med,
      pieges: positifs(candidats).filter(auDixieme),
      garder: milieu !== med ? [milieu] : [],
      explication: expliquerMediane(valeurs),
    });
    if (q.choix.includes(ecrire(milieuSansRanger(valeurs)))) {
      q.explication += `<br>⚠️ ${ecrire(milieuSansRanger(valeurs))} est au milieu de la série <b>pas rangée</b> : ce n’est pas la médiane.`;
    }
    return q;
  }

  function questionMoyenne(avecBoutons) {
    if (!avecBoutons) {
      const S = parmi(SERIES);
      const p = parmi(ENFANTS);
      const valeurs = serie(parmi(S.n), S.min, S.max, true);
      const e = S.ecrit || (v => (S.unite ? mesure(v, S.unite) : ecrire(v)));
      return nombre({
        consigne: 'Calcule la moyenne',
        enonce: `${S.texte(p)} ${liste(valeurs)}.<br>Quelle est la moyenne de cette série ?`,
        reponse: net(additionner(valeurs) / valeurs.length),
        unite: S.unite,
        explication: expliquerMoyenne(valeurs, e),
      });
    }
    // Les erreurs : diviser par le mauvais nombre, donner la médiane, la moyenne des deux extrêmes, oublier de diviser
    // (on tire une autre série tant qu'il n'y en a pas au moins 3 différentes de la moyenne)
    let n;
    let valeurs;
    let total;
    let moy;
    let med;
    let candidats;
    do {
      n = parmi([4, 5, 6]);
      valeurs = serie(n, 2, 20, true);
      total = additionner(valeurs);
      moy = net(total / n);
      med = mediane(valeurs);
      const tri = croissant(valeurs);
      candidats = [...new Set([total / (n - 1), total / (n + 1), med, (tri[0] + tri[n - 1]) / 2, total].map(net))].filter(v => auDixieme(v) && v !== moy);
    } while (candidats.length < 3);
    const cle = candidats.includes(net(total / (n - 1))) ? net(total / (n - 1)) : (candidats.includes(med) ? med : null);
    const q = choix({
      consigne: 'Calcule la moyenne',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce: `Quelle est la moyenne de la série ${liste(valeurs)} ?`,
      reponse: moy,
      pieges: candidats,
      garder: cle === null ? [] : [cle],
      explication: expliquerMoyenne(valeurs),
    });
    if (cle === net(total / (n - 1))) q.explication += `<br>⚠️ ${ecrire(total)} ÷ ${ecrire(n - 1)} = ${ecrire(cle)} : il y a ${ecrire(n)} valeurs, pas ${ecrire(n - 1)}.`;
    else if (cle === med) q.explication += `<br>⚠️ ${ecrire(med)} est la médiane, pas la moyenne.`;
    return q;
  }

  // La médiane d'une série donnée par ses effectifs (un tableau ou un diagramme en barres)
  const EFFECTIFS = [
    { titre: 'Pointure', valeurs: [35, 36, 37, 38, 39, 40], qui: 'élèves', intro: 'On a relevé la pointure des élèves de la classe.',
      diagramme: 'Le diagramme donne le nombre d’élèves pour chaque pointure.' },
    { titre: 'Frères et sœurs', valeurs: [0, 1, 2, 3, 4], qui: 'élèves', intro: 'Chaque élève de la classe a dit combien il a de frères et sœurs.',
      diagramme: 'Le diagramme donne le nombre d’élèves qui ont 0, 1, 2, 3 ou 4 frères et sœurs.' },
    { titre: 'Note sur 10', valeurs: [5, 6, 7, 8, 9, 10], qui: 'élèves', intro: 'Voici les notes d’un contrôle, sur 10.',
      diagramme: 'Le diagramme donne le nombre d’élèves pour chaque note d’un contrôle, sur 10.' },
    { titre: 'Buts marqués', valeurs: [0, 1, 2, 3, 4], qui: 'matchs', intro: 'Voici les buts marqués par l’équipe de Hugo pendant la saison.',
      diagramme: 'Le diagramme donne le nombre de matchs où l’équipe de Hugo a marqué 0, 1, 2, 3 ou 4 buts.' },
  ];

  function questionMedianeEffectifs() {
    const T = parmi(EFFECTIFS);
    let effectifs;
    let N;
    let rangs;
    // (si l'effectif total est pair, les deux valeurs du milieu sont égales : la médiane est une des valeurs du tableau)
    const valeurDuRang = k => T.valeurs[effectifs.findIndex((x, i) => additionner(effectifs.slice(0, i + 1)) >= k)];
    do {
      effectifs = T.valeurs.map(() => entier(1, 8));
      N = additionner(effectifs);
      rangs = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1];
    } while (N < 15 || (T.qui === 'élèves' && N > 30) || valeurDuRang(rangs[0]) !== valeurDuRang(rangs[rangs.length - 1]));
    const med = valeurDuRang(rangs[0]);
    const avecDiagramme = Math.random() < 0.5;
    const enonce = avecDiagramme
      ? `${T.diagramme}${figures.barres({ donnees: T.valeurs.map((v, i) => [ecrire(v), effectifs[i]]), max: 8, pas: 1, largeurBarre: 36, unite: T.qui })}`
      : `${T.intro}${tableau([[T.titre, ...T.valeurs], [`Nombre ${de(T.qui)}`, ...effectifs]])}`;
    // Les effectifs cumulés, jusqu'à la médiane
    const cumuls = [];
    for (let i = 0; T.valeurs[i - 1] !== med; i++) cumuls.push(`jusqu’à ${ecrire(T.valeurs[i])} : ${ecrire(additionner(effectifs.slice(0, i + 1)))}`);
    const position = N % 2 ? `la ${rang(rangs[0])}` : `entre la ${rang(rangs[0])} et la ${rang(rangs[1])}`;
    // la valeur la plus fréquente (la première, s'il y en a plusieurs)
    const mode = T.valeurs[effectifs.indexOf(Math.max(...effectifs))];
    return choix({
      consigne: 'Trouve la médiane',
      enonce: `${enonce}Quelle est la médiane de cette série ?`,
      reponse: med,
      // les autres valeurs, dont la plus fréquente à coup sûr (l'erreur classique)
      pieges: T.valeurs,
      garder: mode !== med ? [mode] : [],
      explication: `Il y a ${somme(effectifs)} = ${ecrire(N)} valeurs : la médiane est ${position}.<br>`
        + `On cumule les effectifs : ${cumuls.join(' ; ')}. `
        + (N % 2 ? 'La médiane' : `La ${rang(rangs[0])} et la ${rang(rangs[1])} valent toutes les deux ${ecrire(med)} : la médiane`)
        + ` est <b>${ecrire(med)}</b>.`
        + (mode !== med ? `<br>⚠️ ${ecrire(mode)} est la valeur la plus fréquente, pas la médiane.` : ''),
    });
  }

  // Ce que dit la médiane : au moins la moitié des valeurs sont plus grandes (ou égales)
  function questionInterpreter() {
    const N = parmi([21, 23, 24, 25, 26, 27, 28, 29, 30]);
    const [quoi, med, unite] = parmi([['notes', entier(9, 14), ''], ['tailles', entier(148, 158), 'cm'], ['temps au 50 m', entier(8, 11), 's']]);
    const e = v => (unite ? mesure(v, unite) : ecrire(v));
    const [compare, quiDe] = quoi === 'notes'
      ? [`une note de ${e(med)} ou plus`, 'des notes']
      : quoi === 'tailles' ? [`${e(med)} ou plus`, 'des tailles'] : [`un temps de ${e(med)} ou plus`, 'des temps au 50 m'];
    const bon = Math.ceil(N / 2);
    const verbe = quoi === 'tailles' ? 'mesurent' : 'ont';
    return choix({
      consigne: 'Interprète la médiane',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce: `Dans une classe de ${ecrire(N)} élèves, la médiane ${quiDe} est ${e(med)}. Au moins combien d’élèves ${verbe} ${compare} ?`,
      reponse: bon,
      // les erreurs : la médiane elle-même, la moitié mal arrondie, toute la classe, le quart
      pieges: positifs([med, N % 2 ? (N - 1) / 2 : N / 2 + 1, N, Math.round(N / 4)]).filter(v => v <= N),
      explication: `La médiane partage la série rangée en deux groupes de même effectif.<br>`
        + (N % 2
          ? `Avec ${ecrire(N)} élèves, la médiane est la ${rang(bon)} valeur : de la ${rang(bon)} à la ${rang(N)}, <b>${ecrire(bon)} élèves</b> ${verbe} ${compare}.`
          : `Avec ${ecrire(N)} élèves, la médiane est entre la ${rang(N / 2)} et la ${rang(N / 2 + 1)} valeur : de la ${rang(N / 2 + 1)} à la ${rang(N)}, `
            + `<b>${ecrire(bon)} élèves</b> ${verbe} ${compare}.`),
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_MEDIANE = [
    ['La médiane partage la série rangée en deux groupes de même effectif.',
      'La médiane partage la série rangée en deux groupes de même somme.',
      'La médiane coupe la série <b>rangée</b> en deux groupes qui ont le <b>même nombre</b> de valeurs.'],
    ['Si on remplace la plus grande valeur par une valeur encore plus grande, la médiane ne change pas.',
      'Si on remplace la plus grande valeur par une valeur encore plus grande, la moyenne ne change pas.',
      'La plus grande valeur n’est pas au milieu : la médiane ne change pas. Mais la somme augmente, donc la <b>moyenne augmente</b>.'],
    ['La médiane et la moyenne d’une série peuvent être différentes.',
      'La médiane et la moyenne d’une série sont toujours égales.',
      '12 ; 13 ; 14 ; 15 ; 46 : la médiane est 14, la moyenne est 100 ÷ 5 = 20. Elles peuvent être <b>différentes</b>.'],
  ];

  function vraiFauxMediane() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.4) {
      const [juste, faux, pourquoi] = parmi(REGLES_MEDIANE);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    const valeurs = serie(parmi([5, 6, 7]), 2, 20);
    const med = mediane(valeurs);
    const faux = parmi(positifs([milieuSansRanger(valeurs), med + 1, med - 1]).filter(v => v !== med));
    return vraiFaux({
      enonce: `La médiane de la série ${liste(valeurs)} est ${ecrire(vrai ? med : faux)}.`,
      vrai,
      explication: expliquerMediane(valeurs),
    });
  }

  ajouterEtape({
    id: '4e-donnees-mediane',
    banque: ['mediane', 'mediane', 'mediane', 'medianeCourte', 'medianeCourte', 'medianeCourte', 'medianeCourte', 'moyenne',
      'moyenneCourte', 'effectifs', 'effectifs', 'interpreter', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'mediane') return questionMediane();
      if (sorte === 'medianeCourte') return questionMedianeCourte();
      if (sorte === 'moyenne') return questionMoyenne(false);
      if (sorte === 'moyenneCourte') return questionMoyenne(true);
      if (sorte === 'effectifs') return questionMedianeEffectifs();
      if (sorte === 'interpreter') return questionInterpreter();
      return vraiFauxMediane();
    },
    titreLecon: 'Moyenne et médiane',
    lecon: `
      <h4>La moyenne</h4>
      <p><b>moyenne = somme des valeurs ÷ nombre de valeurs</b>. <i>Notes 12 ; 15 ; 9 ; 14 : 50 ÷ 4 = 12,5.</i></p>
      <h4>La médiane</h4>
      <p>On <b>range</b> d’abord la série dans l’ordre croissant. La <b>médiane</b> est la valeur qui la partage en deux groupes
        de même effectif : autant de valeurs en dessous qu’au-dessus.</p>
      <p>👉 <b>Un nombre impair de valeurs</b> : c’est la valeur du milieu.
        <i>8 ; 3 ; 12 ; 7 ; 10 → rangée : 3 ; 7 ; <b>8</b> ; 10 ; 12. La médiane est 8 (la 3<sup>e</sup> sur 5).</i></p>
      <p>👉 <b>Un nombre pair de valeurs</b> : c’est la moyenne des deux valeurs du milieu.
        <i>3 ; 7 ; <b>8</b> ; <b>11</b> ; 12 ; 15 → (8 + 11) ÷ 2 = 9,5.</i></p>
      <p><b>Avec des effectifs</b>, on cumule les effectifs pour trouver la valeur du milieu :
        <i>25 élèves, la médiane est la 13<sup>e</sup> valeur.</i></p>
      <h4>Ce que dit la médiane</h4>
      <p>Si la médiane des notes de 25 élèves est 12, au moins 13 élèves ont 12 ou plus (et au moins 13 ont 12 ou moins).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> une valeur très grande fait monter la moyenne, mais pas la médiane :
        <i>12 ; 13 ; 14 ; 15 ; 46 → moyenne 20, médiane 14.</i></div>
      <p>⚠️ Ne prends jamais la valeur du milieu d’une série <b>pas rangée</b> !</p>
    `,
  });

  // ======================================================================
  // 5. Les probabilités
  // ======================================================================
  const COULEURS = [['rouge', 'rouges'], ['bleue', 'bleues'], ['verte', 'vertes'], ['jaune', 'jaunes']];
  // « 3 billes rouges, 5 billes bleues et 2 billes vertes »
  const billes = (nombres, couleurs) => {
    const morceaux = nombres.map((n, i) => `${combien(n, 'bille')} ${n >= 2 ? couleurs[i][1] : couleurs[i][0]}`);
    return `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}`;
  };
  // Les issues, séparées par des virgules : « 2, 4, 6 »
  const issues = valeurs => valeurs.map(v => ecrire(v)).join(', ');
  // Les nombres de 1 à n
  const deUnA = n => intervalle(1, n);
  // Une fraction, et sa forme simplifiée si elle existe : « 6/32 = 3/16 »
  // Les pièges : les vraies erreurs d'abord ; s'il en reste moins de 3 (des fractions égales à la réponse ont été enlevées),
  // on complète avec des erreurs de comptage (une issue de plus ou de moins, deux fois trop d'issues possibles)
  function piegesAvecSecours([f, t], erreurs, secours = [[f - 1, t], [f + 1, t], [f, 2 * t], [t - f - 1, t]]) {
    const vraies = piegesFractions([f, t], erreurs);
    return vraies.length >= 3 ? vraies : piegesFractions([f, t], [...erreurs, ...secours]).slice(0, 3);
  }
  function fractionEtSimplifiee(f, t) {
    const [a, b] = simplifier(f, t);
    return `${frac(f, t)}${b !== t ? ` = ${frac(a, b)}` : ''}`;
  }

  // Des situations où toutes les issues ont la même chance : l'introduction, la question, favorables f sur t, et des pièges
  const JEU_32 = 'Un jeu de 32 cartes a 4 couleurs (cœur, carreau, trèfle, pique) de 8 cartes : 7, 8, 9, 10, valet, dame, roi, as.';
  const CARTES_32 = [
    ['un cœur', 8, 'il y a 8 cœurs'], ['un roi', 4, 'il y a 4 rois, un par couleur'],
    ['une figure (valet, dame ou roi)', 12, 'il y a 3 figures par couleur, donc 3 × 4 = 12 figures'],
    ['une carte rouge (cœur ou carreau)', 16, 'il y a 8 cœurs et 8 carreaux, donc 16 cartes rouges'],
    ['le roi de cœur', 1, 'il n’y a qu’un roi de cœur'], ['un as ou un roi', 8, 'il y a 4 as et 4 rois, donc 8 cartes'],
  ];
  function situationProba() {
    const sorte = parmi(['sac', 'sac', 'de', 'cartes', 'boules']);
    if (sorte === 'sac') {
      const nombres = [entier(1, 8), entier(1, 8), entier(1, 8)];
      const couleurs = RM.melanger(COULEURS).slice(0, 3);
      const i = entier(0, 2);
      const t = additionner(nombres);
      const f = nombres[i];
      return {
        intro: `Un sac contient ${billes(nombres, couleurs)}. On tire une bille au hasard.`,
        question: `Quelle est la probabilité qu’elle soit ${couleurs[i][0]} ?`, f, t,
        detail: `${combien(f, 'bille')} ${f >= 2 ? couleurs[i][1] : couleurs[i][0]} sur ${somme(nombres)} = ${combien(t, 'bille')}`,
        // une chance par couleur, favorables sur défavorables, le contraire, une seule bille
        pieges: [[1, 3], [f, t - f], [t - f, t], [1, t]],
      };
    }
    if (sorte === 'de') {
      const n = parmi([8, 12]);
      const EVENEMENTS = [
        ['un nombre pair', deUnA(n).filter(v => v % 2 === 0)], ['un multiple de 3', deUnA(n).filter(v => v % 3 === 0)],
        [`un nombre plus grand que ${ecrire(n - 3)}`, deUnA(n).filter(v => v > n - 3)], ['un multiple de 4', deUnA(n).filter(v => v % 4 === 0)],
        ['un diviseur de 12', deUnA(n).filter(v => 12 % v === 0)], ['un nombre à deux chiffres', deUnA(n).filter(v => v >= 10)],
      ].filter(([, x]) => x.length >= 2);
      const [texte, liste2] = parmi(EVENEMENTS);
      const f = liste2.length;
      return {
        intro: `On lance un dé équilibré à ${ecrire(n)} faces, numérotées de 1 à ${ecrire(n)}.`,
        question: `Quelle est la probabilité d’obtenir ${texte} ?`, f, t: n,
        detail: `${combien(f, 'issue')} sur ${ecrire(n)} (${issues(liste2)})`,
        // le piège du dé à 6 faces, une seule issue, le contraire, favorables sur défavorables
        pieges: [[f, 6], [1, n], [n - f, n], [f, n - f], [1, 2]],
      };
    }
    if (sorte === 'cartes') {
      const [texte, f, pourquoi] = parmi(CARTES_32);
      return {
        intro: `${JEU_32} On tire une carte au hasard.`,
        question: `Quelle est la probabilité de tirer ${texte} ?`, f, t: 32,
        detail: `${pourquoi}, sur 32 cartes`,
        pieges: [[1, 4], [1, 8], [f, 32 - f], [32 - f, 32], [1, 32], [f, 8]],
      };
    }
    const N = parmi([10, 15, 20, 25]);
    const EVENEMENTS = [
      ['un multiple de 4', deUnA(N).filter(v => v % 4 === 0)], ['un multiple de 5', deUnA(N).filter(v => v % 5 === 0)],
      ['un nombre pair', deUnA(N).filter(v => v % 2 === 0)], ['un nombre qui contient le chiffre 1', deUnA(N).filter(v => String(v).includes('1'))],
      [`un nombre plus grand que ${ecrire(N - 4)}`, deUnA(N).filter(v => v > N - 4)],
    ];
    const [texte, liste2] = parmi(EVENEMENTS);
    const f = liste2.length;
    return {
      intro: `Une urne contient ${ecrire(N)} boules numérotées de 1 à ${ecrire(N)}. On en tire une au hasard.`,
      question: `Quelle est la probabilité que son numéro soit ${texte} ?`, f, t: N,
      detail: `${combien(f, 'boule')} sur ${ecrire(N)} (${issues(liste2)})`,
      pieges: [[1, N], [N - f, N], [f, N - f], [1, f]],
    };
  }

  function questionProba(avecBoutons) {
    const S = situationProba();
    const explication = `Toutes les issues ont la même chance : ${S.detail}.<br>La probabilité est <b>${fractionEtSimplifiee(S.f, S.t)}</b>.`;
    if (!avecBoutons) {
      return fraction({
        consigne: 'Écris la probabilité sous forme de fraction', enonce: `${S.intro} ${S.question}`, n: S.f, d: S.t, irreductible: false, explication,
      });
    }
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `${S.intro} ${S.question}`,
      reponse: fracTexte(S.f, S.t),
      pieges: piegesAvecSecours([S.f, S.t], S.pieges),
      explication,
    });
  }

  // L'événement contraire : 1 − p (en fraction, en décimal ou en pourcentage)
  function questionContraire() {
    const forme = parmi(['fraction', 'fraction', 'decimal', 'pourcent']);
    if (forme === 'decimal') {
      const p = entier(11, 89) / 100;
      const [evenement, contraire] = parmi([['La probabilité qu’il pleuve demain', 'qu’il ne pleuve pas'],
        ['La probabilité que Sami gagne la partie', 'qu’il ne la gagne pas'], ['La probabilité que le bus soit en retard', 'qu’il ne soit pas en retard'],
        ['Sur une roue de loterie, la probabilité que la flèche s’arrête sur le rouge', 'qu’elle ne s’arrête pas sur le rouge']]);
      return nombre({
        consigne: 'Calcule la probabilité',
        enonce: `${evenement} est ${ecrire(p)}. Quelle est la probabilité ${contraire} ?`,
        reponse: net(1 - p),
        explication: `Ce sont deux événements contraires : leurs probabilités font 1 ensemble.<br>1 − ${ecrire(p)} = <b>${ecrire(net(1 - p))}</b>.`,
      });
    }
    if (forme === 'pourcent') {
      const t = 5 * entier(2, 18);
      return nombre({
        consigne: 'Calcule la probabilité',
        enonce: `La météo annonce ${pc(t)} de risque de pluie pour demain. Quelle est la probabilité qu’il ne pleuve pas, en pourcentage ?`,
        reponse: 100 - t,
        unite: '%',
        explication: `« Il pleut » et « il ne pleut pas » sont contraires : les deux font ${pc(100)}.<br>100 − ${ecrire(t)} = <b>${pc(100 - t)}</b>.`,
      });
    }
    const d = entier(5, 12);
    const n = entierSauf(1, d - 1, [d / 2]);
    const calcul = `1 − ${frac(n, d)} = ${frac(d, d)} − ${frac(n, d)} = <b>${frac(d - n, d)}</b>.`;
    if (Math.random() < 0.4) {
      return fraction({
        consigne: 'Calcule la probabilité',
        enonce: `La probabilité que Roxy gagne une partie est ${frac(n, d)}. Quelle est la probabilité qu’elle ne la gagne pas ?`,
        n: d - n, d, irreductible: false,
        explication: `« Gagner » et « ne pas gagner » sont des événements contraires : leurs probabilités font 1 ensemble.<br>${calcul}`,
      });
    }
    return choix({
      consigne: 'Calcule la probabilité',
      enonce: `La probabilité d’un événement A est ${frac(n, d)}. Quelle est la probabilité de son contraire ?`,
      reponse: fracTexte(d - n, d),
      // les erreurs : garder la même, 1 − 3/8 = 2/8 (enlever 1 au numérateur), le rapport à l'envers (5/3 : plus grand que 1, jamais proposé)
      pieges: piegesAvecSecours([d - n, d], [[n, d], [n - 1, d], [d - n, n]], [[d - n - 1, d], [d - n + 1, d]]),
      garder: 2 * n !== d ? [fracTexte(n, d)] : [],
      explication: `Le contraire de A se réalise quand A ne se réalise pas : leurs probabilités font 1 ensemble.<br>${calcul}`
        + (2 * n !== d ? `<br>⚠️ ${frac(n, d)}, c’est la probabilité de A elle-même.` : ''),
    });
  }

  // Des événements avec un dé à 6 faces : [le texte, les issues]
  const EVENEMENTS_DE = [
    ['obtenir un nombre pair', [2, 4, 6]], ['obtenir un nombre impair', [1, 3, 5]], ['obtenir 6', [6]], ['obtenir 5', [5]],
    ['obtenir au moins 5', [5, 6]], ['obtenir au plus 2', [1, 2]], ['obtenir un multiple de 3', [3, 6]],
    ['obtenir moins de 4', [1, 2, 3]], ['obtenir 1', [1]],
  ];

  function questionIncompatibles() {
    const oui = Math.random() < 0.5;
    let A;
    let B;
    do { [A, B] = RM.melanger(EVENEMENTS_DE).slice(0, 2); } while (A[1].some(v => B[1].includes(v)) === oui);
    const communes = A[1].filter(v => B[1].includes(v));
    return choix({
      consigne: 'Réponds par oui ou par non',
      enonce: `On lance un dé à 6 faces. A : « ${A[0]} » et B : « ${B[0]} ». Les événements A et B sont-ils incompatibles ?`,
      reponse: oui ? 'Oui' : 'Non',
      choix: OUI_NON,
      explication: `A est réalisé par ${issues(A[1])} ; B par ${issues(B[1])}.<br>`
        + (oui ? '<b>Oui</b> : aucune issue ne réalise les deux, ils ne peuvent pas se réaliser en même temps.'
          : `<b>Non</b> : ${communes.length > 1 ? `les issues ${issues(communes)} réalisent` : `l’issue ${issues(communes)} réalise`} A et B en même temps.`),
    });
  }

  function questionProbaDe() {
    const [texte, liste2] = parmi(EVENEMENTS_DE);
    const f = liste2.length;
    return choix({
      consigne: 'Choisis la probabilité',
      enonce: `Quelle est la probabilité ${texte.replace(/^obtenir/, 'd’obtenir')} avec un dé équilibré à 6 faces ?`,
      reponse: fracTexte(f, 6),
      // une seule issue, le contraire, favorables sur défavorables, une chance sur deux, une issue de trop ou de moins
      pieges: piegesFractions([f, 6], [[1, 6], [6 - f, 6], [f, 6 - f], [1, 2], [f + 1, 6], [f - 1, 6]]),
      explication: `Il y a 6 issues qui ont la même chance. ${f > 1 ? `Les issues ${issues(liste2)} réalisent` : `L’issue ${issues(liste2)} réalise`} l’événement.<br>`
        + `La probabilité est <b>${fractionEtSimplifiee(f, 6)}</b>.`,
    });
  }

  // A ou B, quand A et B sont incompatibles : on additionne les probabilités
  function questionOu() {
    let nombres;
    do { nombres = [entier(1, 7), entier(1, 7), entier(1, 7)]; } while (additionner(nombres) < 6);
    const couleurs = RM.melanger(COULEURS).slice(0, 3);
    const [i, j] = RM.melanger([0, 1, 2]).slice(0, 2);
    const t = additionner(nombres);
    const f = nombres[i] + nombres[j];
    const enonce = `Un sac contient ${billes(nombres, couleurs)}. On tire une bille au hasard. `
      + `Quelle est la probabilité qu’elle soit ${couleurs[i][0]} ou ${couleurs[j][0]} ?`;
    const explication = `« ${majuscule(couleurs[i][0])} » et « ${couleurs[j][0]} » sont incompatibles : on additionne les probabilités.<br>`
      + `${frac(nombres[i], t)} + ${frac(nombres[j], t)} = <b>${fractionEtSimplifiee(f, t)}</b>.`;
    if (Math.random() < 0.5) return fraction({ consigne: 'Écris la probabilité sous forme de fraction', enonce, n: f, d: t, irreductible: false, explication });
    return choix({
      consigne: 'Choisis la probabilité',
      enonce,
      reponse: fracTexte(f, t),
      // une seule des deux couleurs, le produit, deux couleurs sur trois, le contraire
      pieges: piegesAvecSecours([f, t], [[nombres[i], t], [nombres[j], t], [2, 3], [t - f, t], [nombres[i] * nombres[j], t], [f, t - f]]),
      explication,
    });
  }

  // La somme des probabilités de toutes les issues fait 1
  function questionSomme() {
    const [a, b] = [entier(1, 8) * 5, entier(1, 8) * 5].map(v => v / 100);
    const c = net(1 - a - b);
    const [c1, c2, c3] = RM.melanger(['rouge', 'bleu', 'vert', 'jaune']).slice(0, 3);
    const enonce = `Une roue a trois couleurs. La probabilité d’obtenir le ${c1} est ${ecrire(a)} et celle d’obtenir le ${c2} est ${ecrire(b)}. `
      + `Quelle est la probabilité d’obtenir le ${c3} ?`;
    const explication = `Les probabilités de toutes les issues font 1 ensemble.<br>1 − ${ecrire(a)} − ${ecrire(b)} = <b>${ecrire(c)}</b>.`;
    if (Math.random() < 0.6) return nombre({ consigne: 'Calcule la probabilité', enonce, reponse: c, explication });
    return choix({
      consigne: 'Calcule la probabilité',
      enonce,
      reponse: c,
      // les erreurs : oublier une couleur, additionner, se tromper de dizaine, prendre 1 − (a − b)
      pieges: positifs([1 - a, 1 - b, a + b, c + 0.1, c - 0.1, 1 - Math.abs(a - b)]).filter(v => v < 1),
      explication,
    });
  }

  // Fréquence et probabilité
  function questionFrequence() {
    const sorte = parmi(['frequence', 'attendu', 'attendu']);
    if (sorte === 'frequence') {
      const p = parmi(ENFANTS);
      const N = parmi([20, 50, 100, 200]);
      const k = Math.round(N * (0.4 + Math.random() * 0.2));
      return nombre({
        consigne: 'Calcule la fréquence',
        enonce: `${p.nom} a lancé une pièce équilibrée ${ecrire(N)} fois et a obtenu ${ecrire(k)} fois « pile ». `
          + 'Quelle est la fréquence de « pile » ? Donne-la en écriture décimale.',
        reponse: net(k / N),
        explication: `La fréquence, c’est l’effectif divisé par le nombre de lancers : ${ecrire(k)} ÷ ${ecrire(N)} = <b>${ecrire(net(k / N))}</b>.<br>`
          + `Elle est proche de la probabilité, ${ecrire(0.5)}, mais pas forcément égale.`,
      });
    }
    // Combien de fois peut-on s'attendre à obtenir un 6 ? (des dés à 4, 6 ou 8 faces)
    const [objet, resultat, d] = parmi([['un dé équilibré à 6 faces', 'un 6', 6], ['un dé équilibré à 6 faces', 'un 1', 6],
      ['un dé équilibré à 4 faces', 'un 4', 4], ['un dé équilibré à 8 faces', 'un 8', 8]]);
    const N = d * parmi([10, 20, 50, 100, 200]);
    const attendu = N / d;
    return choix({
      consigne: 'Choisis le bon nombre',
      // (les erreurs sont presque toutes du même côté : on mélange les boutons au lieu de les ranger)
      ordre: 'melange',
      enonce: `On lance ${ecrire(N)} fois ${objet}. Environ combien de fois peut-on obtenir ${resultat} ?`,
      reponse: attendu,
      // les erreurs : le nombre de faces, diviser par un autre nombre, le contraire
      pieges: positifs([d, N / 10, N / 12, N / 2, N / 3, N / 4, N / 5, attendu * 2, N - attendu])
        .filter(v => Number.isInteger(v) && v !== N && v >= attendu / 4),
      explication: `La probabilité est ${frac(1, d)} : sur ${ecrire(N)} essais, on peut s’attendre à environ ${ecrire(N)} ÷ ${ecrire(d)} = <b>${ecrire(attendu)}</b> fois.<br>`
        + 'Pas exactement : c’est le hasard ! Mais plus on lance, plus la fréquence se rapproche de la probabilité.',
    });
  }

  // Retrouver le nombre de billes à partir de la probabilité
  function questionNombreBilles() {
    const [a, b] = parmi([[1, 4], [3, 4], [1, 3], [2, 3], [2, 5], [3, 5], [1, 6], [5, 6], [3, 8], [5, 8], [3, 10], [7, 10]]);
    const m = entier(2, 5);
    const t = b * m;
    const [couleur] = parmi(COULEURS);
    return nombre({
      consigne: 'Résous le problème',
      enonce: `Un sac contient ${ecrire(t)} billes. La probabilité de tirer une bille ${couleur} est ${frac(a, b)}. Combien y a-t-il de billes ${couleur}s ?`,
      reponse: a * m,
      unite: 'billes',
      explication: `Les billes ${couleur}s sont les ${frac(a, b)} des ${ecrire(t)} billes : ${ecrire(t)} ÷ ${ecrire(b)} = ${a === 1 ? `<b>${combien(m, 'bille')}</b>` : `${ecrire(m)}, puis ${ecrire(m)} × ${ecrire(a)} = <b>${combien(a * m, 'bille')}</b>`}.`
        + `<br>On vérifie : ${frac(a * m, t)} = ${frac(a, b)}.`,
    });
  }

  // Des phrases, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_PROBA = [
    ['Léa lance une pièce équilibrée 10 fois et obtient 7 fois « pile ». La fréquence de « pile » est 0,7.',
      'Léa lance une pièce équilibrée 10 fois et obtient 7 fois « pile ». La probabilité d’obtenir « pile » est 0,7.',
      '7 ÷ 10 = 0,7, c’est la <b>fréquence</b> observée. La probabilité d’obtenir « pile » avec une pièce équilibrée est 0,5.'],
    ['Quand on répète une expérience un très grand nombre de fois, la fréquence d’un événement se rapproche de sa probabilité.',
      'Quand on répète une expérience un très grand nombre de fois, la fréquence d’un événement devient égale à 0,5.',
      'Plus on répète l’expérience, plus la fréquence se rapproche de la <b>probabilité</b> (pas forcément 0,5 !).'],
    ['Deux événements incompatibles ne peuvent pas se réaliser en même temps.',
      'Deux événements incompatibles peuvent se réaliser en même temps.',
      'Incompatibles veut dire qu’aucune issue ne les réalise tous les deux : ils ne peuvent <b>pas</b> se réaliser en même temps.'],
  ];
  // Une probabilité est toujours entre 0 et 1 : [la valeur, possible ?]
  const VALEURS_PROBA = [[ecrire(0.8), true], [ecrire(1), true], [ecrire(0), true], [frac(2, 3), true], [pc(45), true],
    [ecrire(1.2), false], [ecrire(-0.3), false], [frac(3, 2), false], [pc(150), false]];

  function vraiFauxProba() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['regle', 'regle', 'valeur', 'contraire']);
    if (forme === 'regle') {
      const [juste, faux, pourquoi] = parmi(REGLES_PROBA);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    if (forme === 'valeur') {
      const [valeur] = parmi(VALEURS_PROBA.filter(([, possible]) => possible === vrai));
      return vraiFaux({
        enonce: `Une probabilité peut être égale à ${valeur}.`,
        vrai,
        explication: `Une probabilité est toujours <b>entre 0 et 1</b> (entre 0 % et 100 %) : ${valeur} ${vrai ? 'est possible' : 'est impossible'}.`,
      });
    }
    const p = entier(1, 9) / 10;
    const bon = net(1 - p);
    const annonce = vrai ? bon : parmi([p, net(bon + 0.1), net(bon - 0.1)].filter(v => v !== bon && v > 0 && v < 1));
    return vraiFaux({
      enonce: `Si la probabilité d’un événement est ${ecrire(p)}, celle de son contraire est ${ecrire(annonce)}.`,
      vrai: annonce === bon,
      explication: `Un événement et son contraire ont des probabilités qui font 1 ensemble : 1 − ${ecrire(p)} = <b>${ecrire(bon)}</b>.`,
    });
  }

  ajouterEtape({
    id: '4e-donnees-probabilites',
    banque: ['proba', 'proba', 'probaChoix', 'probaChoix', 'de', 'de', 'de', 'de', 'contraire', 'contraire', 'incompatibles', 'ou', 'somme',
      'frequence', 'frequence', 'billes', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'proba') return questionProba(false);
      if (sorte === 'probaChoix') return questionProba(true);
      if (sorte === 'de') return questionProbaDe();
      if (sorte === 'contraire') return questionContraire();
      if (sorte === 'incompatibles') return questionIncompatibles();
      if (sorte === 'ou') return questionOu();
      if (sorte === 'somme') return questionSomme();
      if (sorte === 'frequence') return questionFrequence();
      if (sorte === 'billes') return questionNombreBilles();
      return vraiFauxProba();
    },
    titreLecon: 'Les probabilités',
    lecon: `
      <h4>Calculer une probabilité</h4>
      <p>Quand toutes les issues ont la même chance (un dé équilibré, un tirage au hasard) :
        <b>probabilité = nombre d’issues favorables ÷ nombre d’issues possibles</b>. C’est un nombre <b>entre 0 et 1</b>,
        qu’on écrit en fraction, en décimal ou en pourcentage : ${frac(3, 10)} = 0,3 = 30&nbsp;%.</p>
      <p>👉 <i>Un sac de 3 billes rouges, 5 bleues et 2 vertes : la probabilité de tirer une bleue est ${frac(5, 10)} = ${frac(1, 2)}.</i></p>
      <h4>L’événement contraire</h4>
      <p>« Non A » se réalise quand A ne se réalise pas. <b>p(non A) = 1 − p(A)</b> :
        <i>s’il y a 0,3 de chances de pluie, il y a 1 − 0,3 = 0,7 de chances qu’il ne pleuve pas.</i></p>
      <h4>Des événements incompatibles</h4>
      <p>Ils ne peuvent pas se réaliser en même temps (aucune issue commune) : « obtenir 5 » et « obtenir un nombre pair ».
        Alors <b>p(A ou B) = p(A) + p(B)</b> : <i>rouge ou verte : ${frac(3, 10)} + ${frac(2, 10)} = ${frac(5, 10)}.</i>
        Les probabilités de toutes les issues font 1 ensemble.</p>
      <h4>Fréquence et probabilité</h4>
      <p>La <b>fréquence</b> se mesure après l’expérience : <i>7 « pile » sur 10 lancers → 0,7.</i> Quand on répète l’expérience
        un très grand nombre de fois, la fréquence se rapproche de la <b>probabilité</b> (0,5 pour « pile »).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> sur 600 lancers d’un dé, on peut s’attendre à environ 600 ÷ 6 = 100 fois « 6 »…
        pas exactement, c’est le hasard !</div>
      <p>⚠️ Un dé à 12 faces n’est pas un dé à 6 faces : compte bien toutes les issues possibles.</p>
    `,
  });

  // ======================================================================
  // 6. La notion de fonction
  // ======================================================================
  // Des nombres relatifs dans toute l'étape : le bouton « − » est toujours là
  const TOUCHES = [',', '−'];
  // Les fonctions : f(x) = a × x + b (affine), a × x² + b (carre), x² + c × x (mixte)
  // ecrite : « 3x − 5 » ; calcul(x) : « 3 × (−2) − 5 = −6 − 5 = −11 » ; f(x) : la valeur ; pieges(x) : les erreurs classiques
  const avecSigne = v => `${v < 0 ? MOINS : '+'} ${ecrire(Math.abs(v))}`;
  const devant = (a, lettre) => (a === 1 ? lettre : a === -1 ? `${MOINS}${lettre}` : `${ecrire(a)}${lettre}`);
  function fonction(sorte = parmi(['affine', 'affine', 'carre', 'mixte'])) {
    if (sorte === 'affine') {
      const a = parmi([2, 3, 4, 5, -2, -3, -4]);
      const b = entier(-9, 9) || 4;
      const f = x => a * x + b;
      return {
        sorte, a, b, f, ecrite: `${devant(a, 'x')} ${avecSigne(b)}`,
        calcul: x => `${ecrire(a)} × ${parentheses(x)} ${avecSigne(b)} = ${ecrire(a * x)} ${avecSigne(b)} = ${ecrire(f(x))}`,
        // le signe de b oublié, le signe du produit oublié, a × (x + b)
        pieges: x => [a * x - b, -a * x + b, a * (x + b), a + x + b, a * x],
      };
    }
    if (sorte === 'carre') {
      const a = parmi([1, 1, 2, 3]);
      const b = entier(-9, 9) || -3;
      const f = x => a * x * x + b;
      return {
        sorte, a, b, f, ecrite: `${devant(a, 'x²')} ${avecSigne(b)}`,
        calcul: x => `${a === 1 ? '' : `${ecrire(a)} × `}${parentheses(x)}² ${avecSigne(b)} = `
          + `${a === 1 ? '' : `${ecrire(a)} × ${ecrire(x * x)} ${avecSigne(b)} = `}${ecrire(a * x * x)} ${avecSigne(b)} = ${ecrire(f(x))}`,
        // (−3)² = −9, x² = 2 × x, (a × x)²
        pieges: x => [...(x < 0 ? [-a * x * x + b] : []), a * 2 * x + b, a * a * x * x + b, a * x * x - b, a * x * x],
      };
    }
    const c = parmi([1, 2, 3, 4, -1, -2, -3, -4]);
    const f = x => x * x + c * x;
    return {
      sorte, c, f, ecrite: `x² ${c < 0 ? MOINS : '+'} ${Math.abs(c) === 1 ? '' : ecrire(Math.abs(c))}x`,
      calcul: x => `${parentheses(x)}² ${c < 0 ? MOINS : '+'} ${Math.abs(c) === 1 ? '' : `${ecrire(Math.abs(c))} × `}${parentheses(x)} = `
        + `${ecrire(x * x)} ${avecSigne(c * x)} = ${ecrire(f(x))}`,
      pieges: x => [...(x < 0 ? [-x * x + c * x] : []), 2 * x + c * x, x * x - c * x, x * x + c + x, x * x + c, c * x],
    };
  }

  function questionImage(avecBoutons) {
    const F = fonction();
    const x = entierSauf(-5, 6, [0, 1]);
    const r = F.f(x);
    const demande = parmi([`Calcule f(${ecrire(x)}).`, `Calcule l’image de ${ecrire(x)} par f.`]);
    const enonce = `Soit f(x) = ${F.ecrite}. ${demande}`;
    const explication = `On remplace x par ${ecrire(x)} : f(${ecrire(x)}) = ${F.calcul(x).replace(/= ([^=]+)$/, '= <b>$1</b>')}.`;
    if (!avecBoutons) return nombre({ consigne: 'Calcule l’image', enonce, reponse: r, touches: TOUCHES, explication });
    return choix({
      consigne: 'Calcule l’image',
      enonce,
      reponse: r,
      pieges: F.pieges(x).map(net),
      // (le carré d'un nombre négatif compté négatif : l'erreur dont parle Roxy, toujours sur un bouton)
      garder: x < 0 && F.sorte !== 'affine' ? [net(F.pieges(x)[0])] : [],
      explication: explication + (x < 0 && F.sorte !== 'affine' ? `<br>⚠️ ${parentheses(x)}² = ${ecrire(x * x)} : un carré n’est jamais négatif.` : ''),
    });
  }

  // Un antécédent avec une formule : on résout une équation
  function questionAntecedent(avecBoutons) {
    const F = fonction('affine');
    // (x0 n'est pas sa propre image : sinon l'image et l'antécédent de m seraient le même nombre)
    let x0;
    do { x0 = entierSauf(-5, 6, [0, 1]); } while (F.f(x0) === x0);
    const m = F.f(x0);
    const image = F.f(m);
    const enonce = `Soit f(x) = ${F.ecrite}. Quel est l’antécédent de ${ecrire(m)} par f ?`;
    const explication = `On cherche x tel que ${F.ecrite} = ${ecrire(m)}.<br>${devant(F.a, 'x')} = ${ecrire(m)} ${avecSigne(-F.b)} = ${ecrire(m - F.b)}, `
      + `donc x = ${ecrire(m - F.b)} ÷ ${parentheses(F.a)} = <b>${ecrire(x0)}</b>.`;
    if (!avecBoutons) return nombre({ consigne: 'Trouve l’antécédent', enonce, reponse: x0, touches: TOUCHES, explication });
    // Les erreurs : calculer l'image de m (le piège !), se tromper de signe, oublier de diviser
    const q = choix({
      consigne: 'Trouve l’antécédent',
      enonce,
      reponse: x0,
      pieges: [image, (m + F.b) / F.a, m - F.b, (m - F.b) * F.a, -x0].filter(v => Number.isInteger(v) && Math.abs(v) <= 200),
      garder: Math.abs(image) <= 200 ? [image] : [],
      explication,
    });
    if (q.choix.includes(ecrire(image))) q.explication += `<br>⚠️ f(${ecrire(m)}) = ${ecrire(image)} : c’est l’<b>image</b> de ${ecrire(m)}, pas son antécédent.`;
    return q;
  }

  // Un tableau de valeurs : lire une image ou un antécédent (le piège : lire la mauvaise ligne)
  function questionTableauValeurs() {
    const depart = entier(-3, 0);
    const xs = intervalle(depart, depart + 5);
    const c = entier(0, 5);
    const autre = parmi([0, 1, 2, 3, 4, 5].filter(i => i !== c));
    const image = Math.random() < 0.5;
    // Des images toutes différentes, et le nombre demandé est aussi dans l'autre ligne (à une autre place)
    let fs;
    do {
      fs = RM.melanger(intervalle(-6, 9)).slice(0, 6);
      if (image) fs[autre] = xs[c];
      else fs[c] = xs[autre];
    } while (new Set(fs).size < 6 || (image ? fs[c] === xs[c] || fs[c] === xs[autre] : fs[autre] === xs[c]));
    const html = tableau([['x', ...xs], ['f(x)', ...fs]]);
    if (image) {
      return choix({
        consigne: 'Lis le tableau de valeurs',
        enonce: `${html}Quelle est l’image de ${ecrire(xs[c])} par la fonction f ?`,
        reponse: fs[c],
        pieges: [xs[autre], ...fs],
        garder: [xs[autre]],
        explication: `Sous ${ecrire(xs[c])}, dans la ligne f(x), on lit ${ecrire(fs[c])} : f(${ecrire(xs[c])}) = <b>${ecrire(fs[c])}</b>.`
          + `<br>⚠️ f(${ecrire(xs[autre])}) = ${ecrire(xs[c])} : ${ecrire(xs[autre])} est un antécédent de ${ecrire(xs[c])}, pas son image.`,
      });
    }
    const m = fs[c];
    return choix({
      consigne: 'Lis le tableau de valeurs',
      enonce: `${html}Lis dans le tableau un antécédent de ${ecrire(m)} par la fonction f.`,
      reponse: xs[c],
      pieges: [fs[autre], ...xs],
      garder: [fs[autre]],
      explication: `On cherche ${ecrire(m)} dans la ligne f(x) : il est sous ${ecrire(xs[c])}. f(${ecrire(xs[c])}) = ${ecrire(m)}, `
        + `donc <b>${ecrire(xs[c])}</b> est un antécédent de ${ecrire(m)}.<br>⚠️ f(${ecrire(m)}) = ${ecrire(fs[autre])} : c’est l’image de ${ecrire(m)}, pas son antécédent.`,
    });
  }

  // La courbe d'une fonction dans un repère : lire une image, un antécédent, compter les antécédents
  // (36 pixels par unité : avec moins, le « −1 » de l'axe et le « 0 » de l'origine se collent et on lit « −10 »)
  const REPERE = { xmin: -3, xmax: 4, ymin: -2, ymax: 4, unite: 36 };
  function questionGraphiqueFonction() {
    const dansLeRepere = (x, y) => x >= REPERE.xmin && x <= REPERE.xmax && y >= REPERE.ymin && y <= REPERE.ymax;
    const entiers = intervalle(REPERE.xmin + 1, REPERE.xmax - 1);
    if (Math.random() < 0.3) {
      // Une parabole : combien d'antécédents ?
      const c = parmi([-2, -1]);
      const m = parmi([c - 1, c, c + 1, c + 4].filter(v => v >= REPERE.ymin && v <= REPERE.ymax));
      const nombreAnt = m < c ? 0 : m === c ? 1 : 2;
      const bord = Math.sqrt(REPERE.ymax - c);
      const figure = figures.repere({ ...REPERE, traces: [{ f: x => x * x + c, de: -bord, a: bord }] });
      return choix({
        consigne: 'Lis le graphique',
        enonce: `La courbe représente une fonction f.${figure}Combien le nombre ${ecrire(m)} a-t-il d’antécédents par f ?`,
        reponse: nombreAnt,
        choix: [0, 1, 2, 3],
        explication: `On trace la droite horizontale à la hauteur ${ecrire(m)} : ${[
          'elle ne coupe <b>pas</b> la courbe : <b>0</b> antécédent',
          'elle touche la courbe en un seul point, d’abscisse 0 : <b>1</b> antécédent',
          `elle coupe la courbe en 2 points, d’abscisses ${ecrire(-Math.sqrt(m - c))} et ${ecrire(Math.sqrt(m - c))} : ce sont les <b>2</b> antécédents`,
        ][nombreAnt]}.`
          + '<br>Un nombre peut avoir 0, 1 ou plusieurs antécédents (mais une seule image).',
      });
    }
    // Une droite : lire une image, ou un antécédent
    let a;
    let b;
    let points;
    do {
      a = parmi([1, 2, -2, 0.5, -0.5]);
      b = entier(-2, 3);
      points = entiers.filter(x => Number.isInteger(a * x + b) && dansLeRepere(x, a * x + b) && a * x + b !== x);
    } while (points.length < 2);
    const f = x => net(a * x + b);
    const x0 = parmi(points);
    const y0 = f(x0);
    // (la droite s'arrête au bord du quadrillage)
    const [xa, xb] = [(REPERE.ymin - b) / a, (REPERE.ymax - b) / a];
    const [debut, fin] = [Math.max(REPERE.xmin, Math.min(xa, xb)), Math.min(REPERE.xmax, Math.max(xa, xb))];
    const figure = figures.repere({ ...REPERE, traces: [{ segment: [[debut, f(debut)], [fin, f(fin)]] }] });
    const dansX = v => v >= REPERE.xmin && v <= REPERE.xmax;
    const dansY = v => v >= REPERE.ymin && v <= REPERE.ymax;
    const enonce = question => `La droite représente une fonction f.${figure}${question}`;
    if (Math.random() < 0.5) {
      // l'image de x0 ; le piège : l'antécédent de x0 (s'il se lit sur le graphique)
      const antecedent = (x0 - b) / a;
      const q = choix({
        consigne: 'Lis le graphique',
        enonce: enonce(`Quelle est l’image de ${ecrire(x0)} par f ?`),
        reponse: y0,
        pieges: [antecedent, y0 + 1, y0 - 1, -y0, x0, y0 + 2, y0 - 2].filter(v => Number.isInteger(v) && (v === antecedent ? dansX(v) : dansY(v)))
          .filter((v, i, liste) => i < 5 || new Set(liste.slice(0, 5).filter(w => w !== y0)).size < 3),
        garder: Number.isInteger(antecedent) && dansX(antecedent) ? [antecedent] : [],
        explication: `On part de ${ecrire(x0)} sur l’axe des abscisses, on va jusqu’à la droite, puis on lit l’ordonnée : f(${ecrire(x0)}) = <b>${ecrire(y0)}</b>.`,
      });
      if (antecedent !== y0 && q.choix.includes(ecrire(antecedent))) q.explication += `<br>⚠️ ${ecrire(antecedent)} est l’antécédent de ${ecrire(x0)}, pas son image.`;
      return q;
    }
    // l'antécédent de y0 ; le piège : l'image de y0
    const q = choix({
      consigne: 'Lis le graphique',
      enonce: enonce(`Quel est l’antécédent de ${ecrire(y0)} par f ?`),
      reponse: x0,
      pieges: [f(y0), x0 + 1, x0 - 1, -x0, y0, x0 + 2, x0 - 2].filter(v => Number.isInteger(v) && (v === f(y0) ? dansY(v) : dansX(v)))
        .filter((v, i, liste) => i < 5 || new Set(liste.slice(0, 5).filter(w => w !== x0)).size < 3),
      garder: Number.isInteger(f(y0)) && dansY(f(y0)) ? [f(y0)] : [],
      explication: `On part de ${ecrire(y0)} sur l’axe des ordonnées, on va jusqu’à la droite, puis on lit l’abscisse : f(${ecrire(x0)}) = ${ecrire(y0)}, `
        + `donc l’antécédent est <b>${ecrire(x0)}</b>.`,
    });
    if (f(y0) !== x0 && q.choix.includes(ecrire(f(y0)))) q.explication += `<br>⚠️ ${ecrire(f(y0))} est l’image de ${ecrire(y0)}, pas son antécédent.`;
    return q;
  }

  // Le vocabulaire et la notation : f(3) = 7, c'est « 7 est l'image de 3 » et « 3 est un antécédent de 7 »
  function questionVocabulaireFonction() {
    const [a, b] = differents(2, -5, 9).map(v => (v === 0 ? 10 : v));
    if (Math.random() < 0.5) {
      const [A, B] = [ecrire(a), ecrire(b)];
      const bonne = parmi([`${B} est l’image de ${A}`, `${A} est un antécédent de ${B}`, `${A} a pour image ${B}`, `${B} a pour antécédent ${A}`]);
      return choix({
        consigne: 'Que peut-on affirmer ?',
        enonce: `On sait que f(${ecrire(a)}) = ${ecrire(b)}.`,
        reponse: bonne,
        pieges: [`${A} est l’image de ${B}`, `${B} est un antécédent de ${A}`, `${B} a pour image ${A}`, `${A} a pour antécédent ${B}`],
        explication: `f(${ecrire(a)}) = ${ecrire(b)} : l’<b>image</b> de ${ecrire(a)} est ${ecrire(b)}, et ${ecrire(a)} est un <b>antécédent</b> de ${ecrire(b)}.`
          + ` On dit aussi : ${A} a pour image ${B}, ${B} a pour antécédent ${A}.<br>On part de l’antécédent (entre les parenthèses) et on arrive à l’image.`,
      });
    }
    const phrase = parmi([`« ${ecrire(b)} est l’image de ${ecrire(a)} par f »`, `« ${ecrire(a)} est un antécédent de ${ecrire(b)} par f »`]);
    return choix({
      consigne: 'Choisis la bonne écriture',
      enonce: `${phrase} s’écrit…`,
      reponse: `f(${ecrire(a)}) = ${ecrire(b)}`,
      pieges: [`f(${ecrire(b)}) = ${ecrire(a)}`, `f × ${parentheses(a)} = ${ecrire(b)}`, `${ecrire(a)} = f(${ecrire(b)})`],
      explication: `L’antécédent se met entre les parenthèses, l’image après le signe = : <b>f(${ecrire(a)}) = ${ecrire(b)}</b>.`,
    });
  }

  // Des règles, écrites deux fois (juste et fausse), avec la même forme
  const REGLES_FONCTIONS = [
    ['Par une fonction, un nombre peut avoir plusieurs antécédents.', 'Par une fonction, un nombre peut avoir plusieurs images.',
      'Une fonction donne <b>une seule image</b> à chaque nombre. Mais plusieurs nombres peuvent avoir la même image : un nombre peut avoir plusieurs antécédents.'],
    ['Si f(2) = 5, alors 2 est un antécédent de 5.', 'Si f(2) = 5, alors 2 est l’image de 5.',
      'f(2) = 5 : 5 est l’<b>image</b> de 2, et 2 est un <b>antécédent</b> de 5.'],
  ];

  function vraiFauxFonction() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.3) {
      const [juste, faux, pourquoi] = parmi(REGLES_FONCTIONS);
      return vraiFaux({ enonce: vrai ? juste : faux, vrai, explication: pourquoi });
    }
    const F = fonction();
    let x;
    let r;
    // (x et son image sont différents, et x n'est pas aussi l'image de son image)
    do { x = entierSauf(-4, 5, [0, 1]); r = F.f(x); } while (r === x || F.f(r) === x);
    if (Math.random() < 0.5) {
      const faux = parmi(F.pieges(x).filter(v => v !== r));
      return vraiFaux({
        enonce: `Soit f(x) = ${F.ecrite}. L’image de ${ecrire(x)} par f est ${ecrire(vrai ? r : faux)}.`,
        vrai,
        explication: `f(${ecrire(x)}) = ${F.calcul(x).replace(/= ([^=]+)$/, '= <b>$1</b>')}.`,
      });
    }
    return vraiFaux({
      enonce: `Soit f(x) = ${F.ecrite}. ${vrai ? `${ecrire(x)} est un antécédent de ${ecrire(r)}` : `${ecrire(r)} est un antécédent de ${ecrire(x)}`} par f.`,
      vrai,
      explication: `f(${ecrire(x)}) = ${F.calcul(x)} : <b>${ecrire(x)} est un antécédent de ${ecrire(r)}</b> (et ${ecrire(r)} est son image).`,
    });
  }

  ajouterEtape({
    id: '4e-donnees-fonctions',
    banque: ['image', 'image', 'image', 'imageChoix', 'imageChoix', 'antecedent', 'antecedent', 'antecedentChoix', 'tableau', 'tableau', 'graphique',
      'graphique', 'vocabulaire', 'vocabulaire', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'image') return questionImage(false);
      if (sorte === 'imageChoix') return questionImage(true);
      if (sorte === 'antecedent') return questionAntecedent(false);
      if (sorte === 'antecedentChoix') return questionAntecedent(true);
      if (sorte === 'tableau') return questionTableauValeurs();
      if (sorte === 'graphique') return questionGraphiqueFonction();
      if (sorte === 'vocabulaire') return questionVocabulaireFonction();
      return vraiFauxFonction();
    },
    titreLecon: 'La notion de fonction',
    lecon: `
      <h4>Une fonction</h4>
      <p>Une <b>fonction</b> f associe à chaque nombre x <b>un seul</b> nombre, noté <b>f(x)</b>.
        <i>f(x) = 3x − 5 : à 4, f associe 3 × 4 − 5 = 7. On écrit f(4) = 7.</i></p>
      <p>👉 7 est l’<b>image</b> de 4 par f. 4 est <b>un antécédent</b> de 7 par f.
        Un nombre a une seule image, mais il peut avoir plusieurs antécédents (ou aucun).</p>
      <h4>Avec une formule</h4>
      <p>On remplace x par le nombre : <i>f(${MOINS}2) = 3 × (${MOINS}2) − 5 = ${MOINS}6 − 5 = ${MOINS}11.</i>
        Attention aux carrés : <i>(${MOINS}3)² = 9</i>. Pour un antécédent, on résout une équation :
        <i>3x − 5 = 10, donc 3x = 15 et x = 5.</i></p>
      <h4>Avec un tableau de valeurs</h4>
      ${tableau([['x', -1, 0, 1, 2, 3], ['f(x)', 4, 1, 6, 3, 2]])}
      <p><i>L’image de 2 se lit sous 2 : f(2) = 3. Un antécédent de 6 se lit au-dessus de 6 : c’est 1.</i></p>
      <h4>Avec un graphique</h4>
      <p>L’image se lit sur l’axe des <b>ordonnées</b> (on part de l’abscisse x, on va jusqu’à la courbe).
        Un antécédent se lit sur l’axe des <b>abscisses</b> (on part de l’ordonnée).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dans f(4) = 7, l’antécédent est « dans » la fonction, entre les parenthèses ;
        l’image est ce qui « sort » de la fonction.</div>
      <p>⚠️ Ne confonds pas l’image et l’antécédent : dans le tableau, f(0) = 1, mais l’image de 1 n’est pas 0 : c’est 6 !</p>
    `,
  });
})();
