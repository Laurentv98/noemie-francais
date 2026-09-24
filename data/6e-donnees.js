// Renard Malin — Maths, niveau 6e : les 6 étapes du Marché des Données
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    entier, parmi, entierSauf, net, ecrire, mesure, euros, lireNombre, frac, fracTexte, tableau,
    choix, nombre, vraiFaux, ajouterEtape, figures, MOINS, ESPACE,
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
  // n enfants différents (des copies : on peut leur ajouter des nombres)
  const enfants = n => RM.melanger(ENFANTS).slice(0, n).map(e => ({ ...e }));
  const ilsOuElles = gens => (gens.every(g => g.il === 'elle') ? 'elles' : 'ils');
  // « de » et « que » devant une voyelle : d’abricot, qu’Inès, d’Hugo
  const VOYELLE = /^([aeiouéèêàâîôœ]|hu)/i;
  const de = mot => (VOYELLE.test(mot) ? `d’${mot}` : `de ${mot}`);
  const que = mot => (VOYELLE.test(mot) ? `qu’${mot}` : `que ${mot}`);
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Un nombre et son nom, au pluriel à partir de 2 : « 1 œuf », « 25 œufs »
  const combien = (n, singulier, pluriel = `${singulier}s`) => `${ecrire(n)}${ESPACE}${n >= 2 ? pluriel : singulier}`;
  // n nombres entiers différents, pris entre min et max, de « pas » en « pas »
  function differents(n, min, max, pas = 1) {
    const possibles = [];
    for (let v = min; v <= max; v += pas) possibles.push(v);
    return RM.melanger(possibles).slice(0, n);
  }
  const croissant = liste => [...liste].sort((a, b) => a - b);
  // Pareil, mais les nombres sont écartés d'au moins « ecartMin » (jamais un écart de 1 : « 1 billes »)
  function espaces(n, min, max, pas = 1, ecartMin = 2) {
    for (let essai = 0; essai < 500; essai++) {
      const liste = differents(n, min, max, pas);
      const tries = croissant(liste);
      if (tries.every((v, i) => i === 0 || v - tries[i - 1] >= ecartMin)) return liste;
    }
    throw new Error(`pas assez de place pour ${n} nombres entre ${min} et ${max}`);
  }
  // Une somme écrite en entier : « 12 + 8 + 15 »
  const somme = liste => liste.map(v => ecrire(v)).join(' + ');
  // Les pièges : des nombres positifs seulement, sans les erreurs de calcul de l'ordinateur
  const positifs = liste => liste.map(net).filter(v => v > 0);
  // Les pièges écrits en euros (3,50 €)
  const enEuros = liste => positifs(liste).map(euros);
  // Un prix sans le signe €, pour les cases d'un tableau « Prix (€) » : 22,50 (et pas 22,5)
  const ecrirePrix = v => euros(v).replace(`${ESPACE}€`, '');
  // Les boutons Oui / Non, toujours dans le même ordre
  const OUI_NON = ['Oui', 'Non'];
  // Les produits « 2 × 3 = 6 ; 4 × 3 = 12 » d'une ligne de tableau (ecrit : pour écrire les résultats)
  const produits = (xs, k, ecrit = ecrire) => xs.map(x => `${ecrire(x)} × ${ecrire(k)} = ${ecrit(net(k * x))}`).join(' ; ');

  // Au marché : les fruits et légumes au kilo, et les produits à la pièce [nom, prix mini, prix maxi]
  const AU_KILO = [
    ['pommes', 1.5, 3.5], ['tomates', 2, 4.5], ['cerises', 5, 9], ['carottes', 1.2, 2.5],
    ['poires', 2, 3.8], ['abricots', 3, 6], ['pommes de terre', 1, 2],
  ];
  const A_LA_PIECE = [
    ['une baguette', 0.9, 1.4], ['un fromage de chèvre', 3, 5.5], ['un pot de miel', 5, 9],
    ['une salade', 1, 1.8], ['un melon', 2, 3.5], ['un bouquet de fleurs', 4, 8],
  ];
  // Des objets qu'on achète par lots, avec leurs prix possibles
  const PIECES = [
    { un: 'cahier', des: 'cahiers', lieu: 'À la papeterie', prix: [0.8, 1.2, 1.5, 2.5] },
    { un: 'croissant', des: 'croissants', lieu: 'À la boulangerie', prix: [0.9, 1.1, 1.2, 1.3] },
    { un: 'yaourt', des: 'yaourts', lieu: 'Au marché', prix: [0.4, 0.5, 0.6, 0.8] },
    { un: 'stylo', des: 'stylos', lieu: 'À la papeterie', prix: [0.7, 1.5, 2.5] },
  ];
  // Un prix au hasard, au dixième d'euro près (2,40 €)
  const prixEntre = (min, max) => entier(Math.round(min * 10), Math.round(max * 10)) / 10;
  // Un prix au kilo facile pour le calcul mental (de 50 centimes en 50 centimes, jamais 1 €)
  function prixAuDemi(min, max) {
    const possibles = [];
    for (let v = Math.ceil(min * 2) / 2; v <= max; v += 0.5) if (v > 1) possibles.push(v);
    return parmi(possibles);
  }

  // ======================================================================
  // 1. Tableaux et graphiques
  // ======================================================================
  // Le tableau à double entrée, en petit (2 lignes, 2 colonnes, sans les totaux : c'est à l'élève de les calculer)
  const DOUBLES_COURTS = [
    {
      lignes: ['Filles', 'Garçons'], colonnes: ['CM1', 'CM2'],
      ligne: i => `Combien de ${['filles', 'garçons'][i]} y a-t-il ?`,
      colonne: j => `Combien d’élèves sont en ${['CM1', 'CM2'][j]} ?`,
      total: 'Combien d’élèves y a-t-il ?',
      cellule: (i, j) => `Combien de ${['filles', 'garçons'][i]} sont en ${['CM1', 'CM2'][j]} ?`,
      // les phrases du vrai ou faux
      vfLigne: (i, x) => `Il y a ${ecrire(x)} ${['filles', 'garçons'][i]}.`,
      vfColonne: (j, x) => `Il y a ${ecrire(x)} élèves en ${['CM1', 'CM2'][j]}.`,
      vfPlus: i => ['Il y a plus de filles.', 'Il y a plus de garçons.'][i],
    },
    {
      lignes: ['CM1', 'CM2'], colonnes: ['Vélo', 'Bus'],
      ligne: i => `Combien d’élèves sont en ${['CM1', 'CM2'][i]} ?`,
      colonne: j => `Combien d’élèves viennent ${['à vélo', 'en bus'][j]} ?`,
      total: 'Combien d’élèves y a-t-il ?',
      cellule: (i, j) => `En ${['CM1', 'CM2'][i]}, combien viennent ${['à vélo', 'en bus'][j]} ?`,
      vfLigne: (i, x) => `Il y a ${ecrire(x)} élèves en ${['CM1', 'CM2'][i]}.`,
      vfColonne: (j, x) => `Il y a ${ecrire(x)} élèves qui viennent ${['à vélo', 'en bus'][j]}.`,
      vfPlus: i => ['Il y a plus d’élèves en CM1 qu’en CM2.', 'Il y a plus d’élèves en CM2 qu’en CM1.'][i],
    },
  ];

  function doubleCourt() {
    const T = parmi(DOUBLES_COURTS);
    const [a, b, c, d] = differents(4, 4, 19);
    const cases = [[a, b], [c, d]];
    const lignes = [a + b, c + d];
    const colonnes = [a + c, b + d];
    const total = a + b + c + d;
    const html = tableau([['', ...T.colonnes], [T.lignes[0], a, b], [T.lignes[1], c, d]]);
    return { T, cases, lignes, colonnes, total, html, tout: [a, b, c, d, ...lignes, ...colonnes, total] };
  }

  function questionDoubleCourt() {
    const D = doubleCourt();
    const { T, cases } = D;
    const sorte = parmi(['ligne', 'ligne', 'colonne', 'colonne', 'total', 'cellule']);
    const i = entier(0, 1);
    const j = entier(0, 1);
    let question;
    let reponse;
    let explication;
    // Les pièges : les autres cases et les autres totaux (lire la mauvaise ligne ou la mauvaise colonne)
    let pieges = D.tout;
    if (sorte === 'ligne') {
      question = T.ligne(i);
      reponse = D.lignes[i];
      explication = `On additionne la ligne « ${T.lignes[i]} » : ${somme(cases[i])} = <b>${ecrire(reponse)}</b>.`;
    } else if (sorte === 'colonne') {
      question = T.colonne(j);
      reponse = D.colonnes[j];
      explication = `On additionne la colonne « ${T.colonnes[j]} » : ${somme([cases[0][j], cases[1][j]])} = <b>${ecrire(reponse)}</b>.`;
    } else if (sorte === 'total') {
      question = T.total;
      reponse = D.total;
      // (en plus : une retenue oubliée ou en trop, une case comptée deux fois)
      pieges = [...D.lignes, ...D.colonnes, reponse - 10, reponse + 10, D.lignes[0] + D.colonnes[0], D.lignes[1] + D.colonnes[1]];
      explication = `On additionne les 4 cases : ${somme(cases.flat())} = <b>${ecrire(reponse)}</b>.`;
    } else {
      question = T.cellule(i, j);
      reponse = cases[i][j];
      // (une case à lire : les pièges sont les 3 autres cases)
      pieges = cases.flat();
      explication = `Ligne « ${T.lignes[i]} », colonne « ${T.colonnes[j]} » : la case où elles se croisent contient <b>${ecrire(reponse)}</b>.`;
    }
    return choix({ consigne: 'Lis le tableau', enonce: `${D.html}${question}`, reponse, pieges, explication });
  }

  function vraiFauxTableau() {
    const D = doubleCourt();
    const { T, cases } = D;
    const vrai = Math.random() < 0.5;
    const forme = D.lignes[0] === D.lignes[1] ? parmi(['ligne', 'colonne']) : parmi(['ligne', 'colonne', 'plus']);
    const i = entier(0, 1);
    const detailLigne = k => `« ${T.lignes[k]} » : ${somme(cases[k])} = ${ecrire(D.lignes[k])}`;
    if (forme === 'plus') {
      const grand = D.lignes[0] > D.lignes[1] ? 0 : 1;
      return vraiFaux({
        enonce: `${D.html}${T.vfPlus(vrai ? grand : 1 - grand)}`,
        vrai,
        explication: `On additionne chaque ligne. ${detailLigne(0)} ; ${detailLigne(1)}.<br>`
          + `C’est la ligne <b>« ${T.lignes[grand]} »</b> qui a le plus grand total.`,
      });
    }
    if (forme === 'ligne') {
      const bon = D.lignes[i];
      // les erreurs : prendre l'autre ligne, la colonne, oublier une retenue
      const faux = parmi([D.lignes[1 - i], D.colonnes[i], bon + 10, bon - 10].filter(v => v > 0 && v !== bon));
      return vraiFaux({
        enonce: `${D.html}${T.vfLigne(i, vrai ? bon : faux)}`,
        vrai,
        explication: `On additionne la ligne « ${T.lignes[i]} » : ${somme(cases[i])} = <b>${ecrire(bon)}</b>.`,
      });
    }
    const bon = D.colonnes[i];
    const faux = parmi([D.colonnes[1 - i], D.lignes[i], bon + 10, bon - 10].filter(v => v > 0 && v !== bon));
    return vraiFaux({
      enonce: `${D.html}${T.vfColonne(i, vrai ? bon : faux)}`,
      vrai,
      explication: `On additionne la colonne « ${T.colonnes[i]} » : ${somme([cases[0][i], cases[1][i]])} = <b>${ecrire(bon)}</b>.`,
    });
  }

  // Le petit tableau : quatre enfants et leurs collections
  const COLLECTIONS = [
    { titre: 'Billes', mot: 'billes', un: 'bille', min: 8, max: 60 },
    { titre: 'Cartes', mot: 'cartes', un: 'carte', min: 10, max: 80 },
    { titre: 'Points', mot: 'points', un: 'point', min: 20, max: 99 },
    { titre: 'Timbres', mot: 'timbres', un: 'timbre', min: 10, max: 90 },
    { titre: 'Noisettes', mot: 'noisettes', un: 'noisette', min: 12, max: 70 },
  ];

  function questionPetitTableau() {
    const C = parmi(COLLECTIONS);
    const valeurs = espaces(4, C.min, C.max);
    const gens = enfants(4).map((g, i) => ({ ...g, valeur: valeurs[i] }));
    const html = tableau([['Enfant', ...gens.map(g => g.nom)], [C.titre, ...valeurs]]);
    const ranges = [...gens].sort((a, b) => b.valeur - a.valeur); // du plus grand au plus petit
    const sorte = parmi(['ecart', 'ecart', 'total', 'plus', 'moins']);
    const consigne = 'Lis le tableau';
    if (sorte === 'plus' || sorte === 'moins') {
      const bon = sorte === 'plus' ? ranges[0] : ranges[3];
      return choix({
        consigne,
        enonce: `${html}Qui a le ${sorte} de ${C.mot} ?`,
        reponse: bon.nom,
        pieges: gens.filter(g => g !== bon).map(g => g.nom),
        explication: `Le plus ${sorte === 'plus' ? 'grand' : 'petit'} nombre de la ligne « ${C.titre} » est ${ecrire(bon.valeur)} : `
          + `c’est <b>${bon.nom}</b> qui a le ${sorte} de ${C.mot}.`,
      });
    }
    if (sorte === 'ecart') {
      const [a, b] = RM.melanger(gens).slice(0, 2).sort((x, y) => y.valeur - x.valeur);
      const d = a.valeur - b.valeur;
      return nombre({
        consigne: 'Lis le tableau, puis calcule',
        enonce: `${html}Combien de ${C.mot} ${a.nom} a-t-${a.il} de plus ${que(b.nom)} ?`,
        reponse: d,
        unite: C.mot,
        explication: `${a.nom} a ${ecrire(a.valeur)} ${C.mot}, ${b.nom} en a ${ecrire(b.valeur)}. L’écart, c’est une soustraction :<br>`
          + `${ecrire(a.valeur)} − ${ecrire(b.valeur)} = <b>${combien(d, C.un, C.mot)}</b>.`,
      });
    }
    const total = valeurs.reduce((s, v) => s + v, 0);
    return choix({
      consigne,
      enonce: `${html}Combien de ${C.mot} ont-${ilsOuElles(gens)} en tout ?`,
      reponse: total,
      // une retenue oubliée ou en trop, un nombre oublié
      pieges: [total - 10, total + 10, total - 20, total + 20, total - ranges[3].valeur],
      explication: `En tout : on additionne les quatre nombres.<br>${somme(valeurs)} = <b>${ecrire(total)}</b>.`,
    });
  }

  // Les diagrammes en barres. Pour chaque barre : l'étiquette sous la barre, le nom dans la phrase, et « la barre de … »
  const JOURS = [['lun.', 'lundi'], ['mar.', 'mardi'], ['mer.', 'mercredi'], ['jeu.', 'jeudi'], ['ven.', 'vendredi']]
    .map(([etiquette, nom]) => ({ etiquette, nom, barre: `la barre de ${nom}` }));
  // echelles : [l'écart entre deux lignes, le haut du diagramme, les valeurs vont de « grain » en « grain »]
  // unite : écrite en haut du diagramme, et à côté de la case des réponses à écrire
  const DIAGRAMMES = [
    {
      intro: 'Le diagramme montre les kilos de pommes vendus au marché chaque jour.',
      cases: JOURS, unite: 'kg',
      echelles: [[10, 60, 5], [20, 100, 10], [5, 40, 5]],
      valeur: v => mesure(v, 'kg'),
      lire: c => `Combien de kilos de pommes a-t-on vendus ${c.nom} ?`,
      plus: 'Quel jour a-t-on vendu le plus de pommes ?',
      moins: 'Quel jour a-t-on vendu le moins de pommes ?',
      ecart: (a, b) => `${majuscule(a.nom)}, combien de kilos de pommes a-t-on vendus de plus ${que(b.nom)} ?`,
      total: 'Combien de kilos de pommes a-t-on vendus en tout, du lundi au vendredi ?',
    },
    {
      intro: 'Le diagramme montre les baguettes vendues par la boulangerie de la forêt.',
      cases: JOURS, unite: 'baguettes',
      echelles: [[20, 120, 10], [10, 80, 5]],
      valeur: v => combien(v, 'baguette'),
      lire: c => `Combien de baguettes a-t-on vendues ${c.nom} ?`,
      plus: 'Quel jour a-t-on vendu le plus de baguettes ?',
      moins: 'Quel jour a-t-on vendu le moins de baguettes ?',
      ecart: (a, b) => `${majuscule(a.nom)}, combien de baguettes a-t-on vendues de plus ${que(b.nom)} ?`,
      total: 'Combien de baguettes a-t-on vendues en tout, du lundi au vendredi ?',
    },
    {
      intro: 'Les élèves de l’école ont voté pour leur fruit préféré.',
      cases: [['pomme', 'la pomme', 'de la pomme'], ['fraise', 'la fraise', 'de la fraise'], ['banane', 'la banane', 'de la banane'],
        ['cerise', 'la cerise', 'de la cerise'], ['kiwi', 'le kiwi', 'du kiwi']]
        .map(([etiquette, nom, duFruit]) => ({ etiquette, nom, barre: `la barre ${duFruit}` })),
      unite: 'voix',
      echelles: [[2, 12, 1], [2, 16, 1], [5, 30, 5]],
      valeur: v => combien(v, 'voix', 'voix'),
      lire: c => `Combien d’élèves ont choisi ${c.nom} ?`,
      plus: 'Quel fruit a eu le plus de voix ?',
      moins: 'Quel fruit a eu le moins de voix ?',
      ecart: (a, b) => `${majuscule(a.nom)} a eu combien de voix de plus que ${b.nom} ?`,
      total: 'Combien de voix y a-t-il eu en tout ?',
    },
    {
      intro: 'Le diagramme montre les pots de confiture vendus par Mamie au marché.',
      cases: ['fraise', 'abricot', 'prune', 'cerise', 'figue'].map(f => ({ etiquette: f, nom: f, barre: `la barre « ${f} »` })),
      unite: 'pots',
      echelles: [[10, 60, 5], [5, 40, 5], [10, 50, 5]],
      valeur: v => combien(v, 'pot'),
      lire: c => `Combien de pots de confiture ${de(c.nom)} Mamie a-t-elle vendus ?`,
      plus: 'Quelle confiture Mamie a-t-elle le plus vendue ?',
      moins: 'Quelle confiture Mamie a-t-elle le moins vendue ?',
      ecart: (a, b) => `Combien de pots ${de(a.nom)} Mamie a-t-elle vendus de plus que de pots ${de(b.nom)} ?`,
      total: 'Combien de pots de confiture Mamie a-t-elle vendus en tout ?',
    },
  ];

  // Un diagramme au hasard : 5 barres de hauteurs toutes différentes (et jamais un écart de 1)
  function diagramme() {
    const D = parmi(DIAGRAMMES);
    const [pas, max, grain] = parmi(D.echelles);
    const valeurs = espaces(5, grain, max, grain, Math.max(2, grain));
    const cases = D.cases.map((c, i) => ({ ...c, valeur: valeurs[i] }));
    const figure = figures.barres({ donnees: cases.map(c => [c.etiquette, c.valeur]), max, pas, unite: D.unite });
    return { D, pas, grain, cases, enonce: question => `${D.intro}${figure}${question}` };
  }

  // Où s'arrête la barre ? Pile sur une ligne, ou au milieu entre deux lignes
  const lireBarre = (c, pas) => (c.valeur % pas === 0
    ? `${majuscule(c.barre)} s’arrête pile sur la ligne ${ecrire(c.valeur)}`
    : `${majuscule(c.barre)} s’arrête au milieu, entre les lignes ${ecrire(c.valeur - pas / 2)} et ${ecrire(c.valeur + pas / 2)}`);

  function questionBarres(sorte) {
    const { D, pas, grain, cases, enonce } = diagramme();
    const consigne = 'Lis le diagramme';
    if (sorte === 'barresLire') {
      const c = parmi(cases);
      const v = c.valeur;
      return choix({
        consigne,
        enonce: enonce(D.lire(c)),
        reponse: v,
        // les erreurs de lecture (une demi-ligne, une ligne de trop) et les autres barres
        pieges: positifs([v - grain, v + grain, v + pas, v - pas, ...cases.filter(x => x !== c).map(x => x.valeur)]),
        explication: `${lireBarre(c, pas)} : elle vaut <b>${ecrire(v)}</b>.`,
      });
    }
    if (sorte === 'barresRang') {
      const plus = Math.random() < 0.5;
      const ranges = [...cases].sort((a, b) => b.valeur - a.valeur);
      const c = plus ? ranges[0] : ranges[4];
      return choix({
        consigne,
        enonce: enonce(plus ? D.plus : D.moins),
        reponse: c.nom,
        pieges: cases.filter(x => x !== c).map(x => x.nom),
        explication: `${majuscule(c.barre)} est la plus ${plus ? 'haute' : 'basse'} (${D.valeur(c.valeur)}) : la réponse est <b>${c.nom}</b>.`,
      });
    }
    // barresCalcul : un écart entre deux barres, ou le total
    if (Math.random() < 0.5) {
      const [a, b] = RM.melanger(cases).slice(0, 2).sort((x, y) => y.valeur - x.valeur);
      const d = a.valeur - b.valeur;
      return nombre({
        consigne: 'Lis le diagramme, puis calcule',
        enonce: enonce(D.ecart(a, b)),
        reponse: d,
        unite: D.unite,
        explication: `${majuscule(a.nom)} : ${D.valeur(a.valeur)} ; ${b.nom} : ${D.valeur(b.valeur)}.<br>`
          + `L’écart : ${ecrire(a.valeur)} − ${ecrire(b.valeur)} = <b>${D.valeur(d)}</b>.`,
      });
    }
    const total = cases.reduce((s, c) => s + c.valeur, 0);
    return nombre({
      consigne: 'Lis le diagramme, puis calcule',
      enonce: enonce(D.total),
      reponse: total,
      unite: D.unite,
      explication: `On additionne les 5 barres :<br>${somme(cases.map(c => c.valeur))} = <b>${D.valeur(total)}</b>.`,
    });
  }

  // Un graphique (une ligne brisée) : la température relevée toutes les 3 heures, un jour de printemps
  const HEURES = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  function journee() {
    const tmin = entier(2, 6);
    const tmax = entier(tmin + 6, 18);
    const hMin = parmi([3, 6]);
    const hMax = parmi([12, 15]);
    // La forme de la journée : un peu frais à minuit, le plus froid au petit matin, le plus chaud l'après-midi
    const reperes = [[0, 0.15 + Math.random() * 0.2], [hMin, 0], [hMax, 1], [24, 0.3 + Math.random() * 0.2]];
    const forme = h => {
      const i = reperes.findIndex(([x]) => x >= h);
      if (reperes[i][0] === h) return reperes[i][1];
      const [x0, y0] = reperes[i - 1];
      const [x1, y1] = reperes[i];
      return y0 + (y1 - y0) * (h - x0) / (x1 - x0);
    };
    // Les autres relevés restent entre tmin + 1 et tmax − 1 : le plus froid et le plus chaud sont uniques
    const temps = HEURES.map(h => {
      if (h === hMin) return tmin;
      if (h === hMax) return tmax;
      const t = Math.round(tmin + forme(h) * (tmax - tmin)) + entier(-1, 1);
      return Math.min(tmax - 1, Math.max(tmin + 1, t));
    });
    const points = HEURES.map((h, i) => [h, temps[i]]);
    const figure = figures.repere({
      xmin: 0, xmax: 24, ymin: 0, ymax: 20, unite: 12, pasX: 3, pasY: 2,
      nomAxes: ['heure (h)', 'température (°C)'],
      traces: points.slice(1).map((p, i) => ({ segment: [points[i], p] })),
      points: points.map(([x, y]) => ({ x, y, nom: '' })),
    });
    const t = h => temps[HEURES.indexOf(h)];
    return { temps, t, tmin, tmax, hMin, hMax, figure };
  }

  function questionGraphique() {
    const J = journee();
    const enonce = q => `Le graphique montre la température relevée toutes les 3 heures, un jour de printemps.${J.figure}${q}`;
    const degres = v => mesure(v, '°C');
    const heure = h => mesure(h, 'h');
    const sorte = parmi(['lire', 'lire', 'rang', 'rang', 'ecart', 'ecart']);
    if (sorte === 'lire') {
      const h = parmi([3, 6, 9, 12, 15, 18, 21]);
      const v = J.t(h);
      const lecture = v % 2 === 0 ? `pile sur la ligne ${ecrire(v)}` : `au milieu, entre les lignes ${ecrire(v - 1)} et ${ecrire(v + 1)}`;
      return choix({
        consigne: 'Lis le graphique',
        enonce: enonce(`Quelle température faisait-il à ${heure(h)} ?`),
        reponse: degres(v),
        pieges: positifs([v - 1, v + 1, v - 2, v + 2, ...J.temps]).map(degres),
        explication: `On part de ${heure(h)} sur l’axe du bas et on monte jusqu’au point : il est ${lecture}.<br>Il faisait <b>${degres(v)}</b>.`,
      });
    }
    if (sorte === 'rang') {
      const chaud = Math.random() < 0.5;
      const h = chaud ? J.hMax : J.hMin;
      return choix({
        consigne: 'Lis le graphique',
        enonce: enonce(`À quelle heure a-t-il fait le plus ${chaud ? 'chaud' : 'froid'} ?`),
        reponse: heure(h),
        pieges: HEURES.map(heure),
        explication: `Le point le plus ${chaud ? 'haut' : 'bas'} du graphique est au-dessus de <b>${heure(h)}</b> : il faisait ${degres(J.t(h))}.`,
      });
    }
    // De combien la température a-t-elle monté (ou baissé) ?
    const monte = Math.random() < 0.6;
    const [h1, h2] = monte ? [J.hMin, J.hMax] : [J.hMax, 21];
    const [v1, v2] = [J.t(h1), J.t(h2)];
    return nombre({
      consigne: 'Lis le graphique, puis calcule',
      enonce: enonce(`De combien de degrés la température a-t-elle ${monte ? 'monté' : 'baissé'} entre ${heure(h1)} et ${heure(h2)} ?`),
      reponse: Math.abs(v2 - v1),
      unite: '°C',
      explication: `À ${heure(h1)} : ${degres(v1)} ; à ${heure(h2)} : ${degres(v2)}.<br>`
        + `L’écart : ${ecrire(Math.max(v1, v2))} − ${ecrire(Math.min(v1, v2))} = <b>${degres(Math.abs(v2 - v1))}</b>.`,
    });
  }

  // Les grands tableaux à double entrée, avec les totaux : une case à compléter
  const DOUBLES = [
    {
      intro: 'Le tableau indique où déjeunent les élèves de CM1 et de CM2.',
      lignes: ['Cantine', 'Maison'], colonnes: ['CM1', 'CM2'], min: 4, max: 29,
    },
    {
      intro: 'Le tableau donne les kilos de fruits vendus par Roxy.',
      lignes: ['Pommes', 'Poires'], colonnes: ['Matin', 'Après-midi'], min: 8, max: 45,
    },
    {
      intro: 'Pour la sortie, chaque élève a choisi la piscine ou le musée.',
      lignes: ['Filles', 'Garçons'], colonnes: ['Piscine', 'Musée'], min: 5, max: 30,
    },
  ];

  function questionDoubleTrou() {
    const T = parmi(DOUBLES);
    const [a, b, c, d] = differents(4, T.min, T.max);
    const grille = [[a, b, a + b], [c, d, c + d], [a + c, b + d, a + b + c + d]];
    const titresLignes = [...T.lignes, 'Total'];
    const titresColonnes = [...T.colonnes, 'Total'];
    const i = entier(0, 2);
    const j = entier(0, 2);
    const v = grille[i][j];
    const html = tableau([
      ['', ...titresColonnes],
      ...grille.map((ligne, l) => [titresLignes[l], ...ligne.map((x, k) => (l === i && k === j ? '___' : x))]),
    ]);
    let explication;
    if (i < 2 && j < 2) {
      // une case du milieu : le total de la ligne, moins l'autre case
      explication = `Sur la ligne « ${titresLignes[i]} », le total est ${ecrire(grille[i][2])} :<br>`
        + `${ecrire(grille[i][2])} − ${ecrire(grille[i][1 - j])} = <b>${ecrire(v)}</b>.`;
    } else if (i < 2) {
      explication = `Le total de la ligne « ${titresLignes[i]} » : ${ecrire(grille[i][0])} + ${ecrire(grille[i][1])} = <b>${ecrire(v)}</b>.`;
    } else if (j < 2) {
      explication = `Le total de la colonne « ${titresColonnes[j]} » : ${ecrire(grille[0][j])} + ${ecrire(grille[1][j])} = <b>${ecrire(v)}</b>.`;
    } else {
      explication = `Le total général : ${ecrire(grille[2][0])} + ${ecrire(grille[2][1])} = <b>${ecrire(v)}</b>.<br>`
        + `On le retrouve avec la colonne « Total » : ${ecrire(grille[0][2])} + ${ecrire(grille[1][2])} = ${ecrire(v)}.`;
    }
    return nombre({ consigne: 'Complète le tableau', enonce: `${T.intro}${html}`, reponse: v, explication });
  }

  ajouterEtape({
    id: '6e-donnees-tableaux',
    banque: ['doubleCourt', 'doubleCourt', 'doubleCourt', 'doubleCourt', 'vraiFaux', 'vraiFaux', 'petitTableau',
      'barresLire', 'barresRang', 'barresCalcul', 'barresCalcul', 'graphique', 'graphique', 'doubleTrou'],
    creerQuestion(sorte) {
      if (sorte === 'doubleCourt') return questionDoubleCourt();
      if (sorte === 'vraiFaux') return vraiFauxTableau();
      if (sorte === 'petitTableau') return questionPetitTableau();
      if (sorte === 'graphique') return questionGraphique();
      if (sorte === 'doubleTrou') return questionDoubleTrou();
      return questionBarres(sorte);
    },
    titreLecon: 'Tableaux et graphiques',
    lecon: `
      <h4>Lire un tableau à double entrée</h4>
      <p>On choisit la <b>ligne</b> et la <b>colonne</b> : la réponse est dans la case où elles se croisent.</p>
      ${tableau([['', 'CM1', 'CM2', 'Total'], ['Cantine', 18, 21, 39], ['Maison', 7, 5, 12], ['Total', 25, 26, 51]])}
      <p>👉 <i>21 élèves de CM2 déjeunent à la cantine.</i> La case « Total » additionne la ligne ou la colonne : <i>18 + 21 = 39</i>.</p>
      <h4>Lire un diagramme en barres</h4>
      ${figures.barres({ donnees: [['lun.', 20], ['mar.', 35], ['mer.', 15], ['jeu.', 40]], max: 50, pas: 10, unite: 'kg' })}
      <p>On lit la hauteur de chaque barre sur l’axe de gauche. Mardi, la barre s’arrête au milieu, entre 30 et 40 :
        on a vendu <b>35&nbsp;kg</b>. La barre la plus haute montre la plus grande valeur : jeudi, 40&nbsp;kg.</p>
      <h4>Lire un graphique</h4>
      <p>Une ligne brisée montre comment une grandeur change : on part de l’heure sur l’axe du bas, on monte jusqu’au point,
        puis on lit la valeur sur l’axe de gauche. Le point le plus haut, c’est le moment le plus chaud.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> suis la ligne avec ta règle jusqu’à l’axe, pour ne pas te tromper de graduation !</div>
      <p>⚠️ « Combien de plus ? », c’est une <b>soustraction</b> (l’écart) : <i>40 − 15 = 25</i>.
        « Combien en tout ? », c’est une <b>addition</b>.</p>
    `,
  });

  // ======================================================================
  // 2. Résoudre des problèmes
  // ======================================================================
  // Les quatre opérations, sur les boutons (toujours dans cet ordre)
  const operations = (a, b) => [`${ecrire(a)} + ${ecrire(b)}`, `${ecrire(a)} − ${ecrire(b)}`, `${ecrire(a)} × ${ecrire(b)}`, `${ecrire(a)} ÷ ${ecrire(b)}`];
  const NOMS_OPERATIONS = ['une addition', 'une soustraction', 'une multiplication', 'une division'];
  const CALCULS = [(a, b) => a + b, (a, b) => a - b, (a, b) => a * b, (a, b) => a / b];

  // Des petits problèmes : { a, b, op (0 : +, 1 : −, 2 : ×, 3 : ÷), texte, pourquoi, prix (le résultat est un prix) }
  const PROBLEMES_OPERATION = [
    () => {
      const p = parmi(ENFANTS); const a = entier(20, 80); const b = entier(5, 30);
      return { a, b, op: 0, texte: `${p.nom} a ${ecrire(a)} billes. ${majuscule(p.il)} en gagne ${ecrire(b)} à la récré. Combien en a-t-${p.il} maintenant ?`,
        pourquoi: `${p.nom} gagne des billes : ${p.il} en a <b>plus</b> qu’avant.` };
    },
    () => {
      const [p, q] = enfants(2); const a = entier(20, 80); const b = entier(5, 30);
      return { a, b, op: 0, texte: `${q.nom} a ${ecrire(a)} cartes. ${p.nom} en a ${ecrire(b)} de plus. Combien de cartes ${p.nom} a-t-${p.il} ?`,
        pourquoi: `${p.nom} a <b>plus</b> de cartes ${que(q.nom)} : on ajoute.` };
    },
    () => {
      const p = parmi(ENFANTS); const a = entier(30, 90); const b = entier(5, a - 10);
      return { a, b, op: 1, texte: `${p.nom} a ${ecrire(a)} billes. ${majuscule(p.il)} en perd ${ecrire(b)}. Combien lui en reste-t-il ?`,
        pourquoi: `${p.nom} perd des billes : il lui en reste <b>moins</b>.` };
    },
    () => {
      // Le piège : le mot « plus », mais une soustraction
      const [p, q] = enfants(2); const a = entier(25, 90); const b = entier(5, a - 10);
      return { a, b, op: 1, texte: `${p.nom} a ${ecrire(a)} cartes. C’est ${ecrire(b)} de plus ${que(q.nom)}. Combien de cartes ${q.nom} a-t-${q.il} ?`,
        pourquoi: `⚠️ ${p.nom} a <b>plus</b> de cartes ${que(q.nom)}, donc ${q.nom} en a <b>moins</b> : on soustrait, malgré le mot « plus ».` };
    },
    () => {
      const p = parmi(ENFANTS); const a = entier(80, 240); const b = entier(20, a - 15);
      return { a, b, op: 1, texte: `Un livre a ${ecrire(a)} pages. ${p.nom} en a lu ${ecrire(b)}. Combien de pages lui reste-t-il à lire ?`,
        pourquoi: 'On enlève les pages déjà lues.' };
    },
    () => {
      const a = parmi([6, 12]); const b = entier(2, 5);
      return { a, b, op: 2, texte: `Roxy achète ${ecrire(b)} boîtes de ${ecrire(a)} œufs. Combien d’œufs a-t-elle en tout ?`,
        pourquoi: `${ecrire(b)} boîtes de ${ecrire(a)} œufs, c’est ${ecrire(b)} fois ${ecrire(a)} œufs.` };
    },
    () => {
      const a = entier(10, 24); const b = entier(2, 9);
      return { a, b, op: 2, texte: `Un paquet contient ${ecrire(a)} biscuits. Combien de biscuits y a-t-il dans ${ecrire(b)} paquets ?`,
        pourquoi: `${ecrire(b)} paquets, c’est ${ecrire(b)} fois ${ecrire(a)} biscuits.` };
    },
    () => {
      const a = entier(6, 9); const b = entier(2, 5);
      return { a, b, op: 2, prix: true, texte: `Une place de cinéma coûte ${euros(a)}. Combien coûtent ${ecrire(b)} places ?`,
        pourquoi: `${ecrire(b)} places, c’est ${ecrire(b)} fois ${euros(a)}.` };
    },
    () => {
      const b = entier(3, 8); const a = b * entier(4, 15);
      return { a, b, op: 3, texte: `Mamie partage ${ecrire(a)} fraises entre ${ecrire(b)} enfants. Combien de fraises chaque enfant reçoit-il ?`,
        pourquoi: `On partage en ${ecrire(b)} parts égales.` };
    },
    () => {
      const b = parmi([6, 12]); const a = b * entier(2, 9);
      return { a, b, op: 3, texte: `On range ${ecrire(a)} œufs dans des boîtes de ${ecrire(b)}. Combien de boîtes remplit-on ?`,
        pourquoi: `On cherche combien de fois il y a ${ecrire(b)} dans ${ecrire(a)}.` };
    },
    () => {
      // (un gâteau à 30 € au plus)
      let a;
      let b;
      do { b = entier(2, 6); a = b * entier(3, 8); } while (a > 30);
      return { a, b, op: 3, prix: true, texte: `Un gâteau coûte ${euros(a)}. On partage le prix entre ${ecrire(b)} amis. Combien paie chacun ?`,
        pourquoi: `On partage le prix en ${ecrire(b)} parts égales.` };
    },
  ];

  function questionOperation() {
    const { a, b, op, texte, pourquoi, prix } = parmi(PROBLEMES_OPERATION)();
    const boutons = operations(a, b);
    const resultat = CALCULS[op](a, b);
    return choix({
      consigne: 'Quelle opération faut-il faire ?',
      enonce: texte,
      reponse: boutons[op],
      choix: boutons,
      explication: `${pourquoi} C’est <b>${NOMS_OPERATIONS[op]}</b> :<br>${boutons[op]} = <b>${prix ? euros(resultat) : ecrire(resultat)}</b>.`,
    });
  }

  function questionPrixTotal() {
    const p = parmi(ENFANTS);
    const [objet, pmin, pmax] = parmi(A_LA_PIECE);
    const prixObjet = prixEntre(pmin, pmax);
    let achat;
    let calcul;
    let sousTotal;
    if (Math.random() < 0.6) {
      const [fruit, kmin, kmax] = parmi(AU_KILO);
      const q = entier(2, 4);
      const prixKilo = prixEntre(kmin, kmax);
      sousTotal = net(q * prixKilo);
      achat = `${mesure(q, 'kg')} ${de(fruit)} à ${euros(prixKilo)} le kilo`;
      calcul = `${mesure(q, 'kg')} ${de(fruit)} : ${ecrire(q)} × ${euros(prixKilo)} = ${euros(sousTotal)}.`;
    } else {
      const P = parmi(PIECES.filter(x => x.lieu !== 'À la papeterie'));
      const n = entier(3, 6);
      const u = parmi(P.prix);
      sousTotal = net(n * u);
      achat = `${ecrire(n)} ${P.des} à ${euros(u)} pièce`;
      calcul = `${ecrire(n)} ${P.des} : ${ecrire(n)} × ${euros(u)} = ${euros(sousTotal)}.`;
    }
    const total = net(sousTotal + prixObjet);
    return nombre({
      consigne: 'Résous le problème',
      enonce: `Au marché, ${p.nom} achète ${achat} et ${objet} à ${euros(prixObjet)}. Combien paie-t-${p.il} en tout ?`,
      reponse: total,
      prix: true,
      explication: `${calcul}<br>Puis on ajoute ${objet} : ${euros(sousTotal)} + ${euros(prixObjet)} = <b>${euros(total)}</b>.`,
    });
  }

  function questionMonnaie() {
    const p = parmi(ENFANTS);
    if (Math.random() < 0.55) {
      const billet = parmi([5, 10, 20, 50]);
      // un prix avec des centimes (multiple de 5 centimes), entre 30 % du billet et le billet
      let prix;
      do { prix = entier(billet * 6, billet * 20 - 3) / 20; } while (Number.isInteger(prix));
      const rendu = net(billet - prix);
      const centimes = net(prix - Math.floor(prix));
      return choix({
        consigne: 'Résous le problème',
        enonce: `${p.nom} paie ${euros(prix)} avec un billet de ${euros(billet)}. Combien lui rend-on ?`,
        reponse: euros(rendu),
        // les erreurs : garder les centimes (10 − 7,35 → 3,35), la retenue oubliée, les centimes oubliés…
        pieges: enEuros([billet - Math.floor(prix) + centimes, rendu + 1, rendu - 1, rendu + 0.1, rendu - 0.1,
          Math.floor(rendu), Math.ceil(rendu)]),
        explication: `On rend ce qui manque pour aller jusqu’à ${euros(billet)} :<br>${euros(billet)} − ${euros(prix)} = <b>${euros(rendu)}</b>.`
          + `<br>💡 Vérifie : ${euros(prix)} + ${euros(rendu)} = ${euros(billet)}.`,
      });
    }
    const [o1, o2] = RM.melanger(A_LA_PIECE).slice(0, 2);
    const p1 = prixEntre(o1[1], o1[2]);
    const p2 = prixEntre(o2[1], o2[2]);
    const total = net(p1 + p2);
    const billet = total < 10 ? parmi([10, 20]) : 20;
    const rendu = net(billet - total);
    return choix({
      consigne: 'Résous le problème',
      enonce: `${p.nom} achète ${o1[0]} à ${euros(p1)} et ${o2[0]} à ${euros(p2)}. ${majuscule(p.il)} paie avec un billet de ${euros(billet)}. Combien lui rend-on ?`,
      reponse: euros(rendu),
      pieges: enEuros([billet - p1, billet - p2, total, rendu + 1, rendu - 1, rendu - 0.1, Math.floor(rendu), Math.ceil(rendu)]),
      explication: `D’abord le prix total : ${euros(p1)} + ${euros(p2)} = ${euros(total)}.<br>`
        + `Puis la monnaie : ${euros(billet)} − ${euros(total)} = <b>${euros(rendu)}</b>.`,
    });
  }

  function questionPartage() {
    if (Math.random() < 0.55) {
      const qui = parmi(['Mamie', 'Papi', 'Roxy']);
      const [objets, un] = parmi([['fraises', 'fraise'], ['noisettes', 'noisette'], ['billes', 'bille'], ['images', 'image'], ['bonbons', 'bonbon']]);
      const b = entier(3, 8);
      const q = entier(6, 25);
      const a = b * q;
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${qui} partage ${ecrire(a)} ${objets} entre ${ecrire(b)} enfants, à parts égales. Combien ${de(objets)} chaque enfant reçoit-il ?`,
        reponse: q,
        unite: objets,
        explication: `Partager en ${ecrire(b)} parts égales, c’est diviser par ${ecrire(b)} :<br>${ecrire(a)} ÷ ${ecrire(b)} = <b>${combien(q, un, objets)}</b>.`
          + `<br>💡 Vérifie : ${ecrire(b)} × ${ecrire(q)} = ${ecrire(a)}.`,
      });
    }
    // Un prix à partager (un gâteau à 30 € au plus) : attention, il faut compter l'enfant avec ses amis !
    const p = parmi(ENFANTS);
    let amis;
    let part;
    let prix;
    do {
      amis = entier(2, 5);
      part = entier(5, 12) / 2;
      prix = net(part * (amis + 1));
    } while (prix > 30);
    const personnes = amis + 1;
    return nombre({
      consigne: 'Résous le problème',
      enonce: `${p.nom} et ses ${ecrire(amis)} amis partagent le prix d’un gâteau à ${euros(prix)}, à parts égales. Combien paie chacun ?`,
      reponse: part,
      prix: true,
      explication: `${p.nom} et ses ${ecrire(amis)} amis, cela fait <b>${ecrire(personnes)} personnes</b>.<br>`
        + `${euros(prix)} ÷ ${ecrire(personnes)} = <b>${euros(part)}</b>.<br>💡 Vérifie : ${ecrire(personnes)} × ${euros(part)} = ${euros(prix)}.`,
    });
  }

  // Ranger dans des boîtes : combien en faut-il ? (on arrondit au-dessus) ou combien de pleines ? (on arrondit au-dessous)
  const RANGEMENTS = [
    { objet: ['œuf', 'œufs'], boite: ['boîte', 'boîtes'], une: 'une', tailles: [6, 12], pleines: true, rien: 'rien',
      texte: (n, t) => `Il faut ranger ${ecrire(n)} œufs dans des boîtes de ${ecrire(t)}.` },
    { objet: ['gâteau', 'gâteaux'], boite: ['boîte', 'boîtes'], une: 'une', tailles: [4, 6, 8], pleines: true, rien: 'rien',
      texte: (n, t) => `Mamie range ${ecrire(n)} gâteaux dans des boîtes de ${ecrire(t)}.` },
    { objet: ['élève', 'élèves'], boite: ['minibus', 'minibus'], une: 'un', tailles: [8, 9], rien: 'personne',
      texte: (n, t) => `Pour la sortie, ${ecrire(n)} élèves montent dans des minibus de ${ecrire(t)} places.` },
    { objet: ['invité', 'invités'], boite: ['table', 'tables'], une: 'une', tailles: [6, 8, 10], rien: 'personne',
      texte: (n, t) => `Pour la fête, ${ecrire(n)} invités s’assoient à des tables de ${ecrire(t)} places.` },
  ];

  function questionPaquets() {
    const R = parmi(RANGEMENTS);
    const t = parmi(R.tailles);
    const q = entier(2, R.pleines ? 8 : 5);
    const r = Math.random() < 0.2 ? 0 : entier(1, t - 1);
    const n = t * q + r;
    const pleines = R.pleines && Math.random() < 0.35;
    const [boite, boites] = R.boite;
    const [objet, objets] = R.objet;
    const reponse = pleines || r === 0 ? q : q + 1;
    const division = r ? `${ecrire(n)} = ${ecrire(t)} × ${ecrire(q)} + ${ecrire(r)}` : `${ecrire(n)} = ${ecrire(t)} × ${ecrire(q)}`;
    let explication;
    if (r === 0) {
      explication = `${division} : on remplit exactement <b>${combien(q, boite, boites)}</b>, et il ne reste ${R.rien}.`;
    } else if (pleines) {
      explication = `${division} : on remplit entièrement <b>${combien(q, boite, boites)}</b>.<br>`
        + `Il reste ${combien(r, objet, objets)} : pas assez pour remplir ${R.une} ${boite} de plus.`;
    } else {
      explication = `${division} : on remplit ${combien(q, boite, boites)}, et il reste ${combien(r, objet, objets)}.<br>`
        + `Il faut encore ${R.une} ${boite} : <b>${combien(q + 1, boite, boites)}</b>.`;
    }
    return choix({
      consigne: 'Résous le problème',
      enonce: `${R.texte(n, t)} ${pleines ? `Combien de ${boites} peut-on remplir entièrement ?` : `Combien de ${boites} faut-il ?`}`,
      reponse,
      pieges: positifs([q, q + 1, q + 2, q + 3, q - 1, q - 2, r, t]),
      explication,
    });
  }

  function questionDifference() {
    const sorte = parmi(['age', 'taille', 'arbre']);
    if (sorte === 'age') {
      const gp = parmi(['Mamie', 'Papi']);
      const p = parmi(ENFANTS);
      const A = entier(58, 84);
      const a = entier(8, 12);
      if (Math.random() < 0.5) {
        const ne = p.il === 'elle' ? 'née' : 'né';
        return nombre({
          consigne: 'Résous le problème',
          enonce: `${gp} a ${mesure(A, 'ans')} et ${p.nom} a ${mesure(a, 'ans')}. Quel âge avait ${gp} quand ${p.nom} est ${ne} ?`,
          reponse: A - a,
          unite: 'ans',
          explication: `${p.nom} est ${ne} il y a ${mesure(a, 'ans')}. ${gp} avait donc ${mesure(a, 'ans')} de moins qu’aujourd’hui :<br>`
            + `${ecrire(A)} − ${ecrire(a)} = <b>${mesure(A - a, 'ans')}</b>.`,
        });
      }
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${gp} a ${mesure(A, 'ans')} et ${p.nom} a ${mesure(a, 'ans')}. Quelle est leur différence d’âge ?`,
        reponse: A - a,
        unite: 'ans',
        explication: `La différence d’âge, c’est l’écart entre les deux âges : une soustraction.<br>${ecrire(A)} − ${ecrire(a)} = <b>${mesure(A - a, 'ans')}</b>.`,
      });
    }
    if (sorte === 'taille') {
      const [p, q] = enfants(2);
      // des tailles en cm, qui ne tombent pas sur une dizaine (1,43 m plutôt que 1,4 m)
      let h1;
      let h2;
      do { h2 = entier(128, 150); h1 = h2 + entier(2, 15); } while (h1 % 10 === 0 || h2 % 10 === 0);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${p.nom} mesure ${mesure(h1 / 100, 'm')} et ${q.nom} mesure ${mesure(h2 / 100, 'm')}. `
          + `Combien de centimètres ${p.nom} mesure-t-${p.il} de plus ${que(q.nom)} ?`,
        reponse: h1 - h2,
        unite: 'cm',
        explication: `En centimètres : ${mesure(h1 / 100, 'm')} = ${mesure(h1, 'cm')} et ${mesure(h2 / 100, 'm')} = ${mesure(h2, 'cm')}.<br>`
          + `${ecrire(h1)} − ${ecrire(h2)} = <b>${mesure(h1 - h2, 'cm')}</b>.`,
      });
    }
    const [arbre1, arbre2] = RM.melanger(['le chêne', 'le sapin', 'le bouleau', 'le hêtre', 'le peuplier']).slice(0, 2);
    const a = entier(8, 25);
    const b = entier(3, 13) / 2;
    const plus = Math.random() < 0.5;
    const hauteur = net(plus ? a + b : a - b);
    return nombre({
      consigne: 'Résous le problème',
      enonce: `Dans la forêt, ${arbre1} mesure ${mesure(a, 'm')}. ${majuscule(arbre2)} mesure ${mesure(b, 'm')} de ${plus ? 'plus' : 'moins'}. Combien mesure ${arbre2} ?`,
      reponse: hauteur,
      unite: 'm',
      explication: plus
        ? `${majuscule(arbre2)} est plus grand : on <b>ajoute</b>.<br>${ecrire(a)} + ${ecrire(b)} = <b>${mesure(hauteur, 'm')}</b>.`
        : `${majuscule(arbre2)} est plus petit : on <b>enlève</b>.<br>${ecrire(a)} − ${ecrire(b)} = <b>${mesure(hauteur, 'm')}</b>.`,
    });
  }

  function questionDeuxEtapes() {
    const sorte = parmi(['oeufs', 'argent', 'cagettes']);
    const consigne = 'Résous le problème';
    if (sorte === 'oeufs') {
      const b = parmi([6, 12]);
      const k = entier(2, 5);
      const vendus = k * b;
      const n = vendus + entier(12, 35);
      const reste = n - vendus;
      return choix({
        consigne,
        enonce: `Roxy a ${ecrire(n)} œufs. Elle vend ${ecrire(k)} boîtes de ${ecrire(b)} œufs. Combien d’œufs lui reste-t-il ?`,
        reponse: reste,
        // l'étape 1 seulement, une boîte de trop ou de moins, une retenue oubliée…
        pieges: positifs([vendus, n - k - b, n - b, reste + b, reste - b, reste + 10, reste - 10, reste - 1]),
        explication: `D’abord, les œufs vendus : ${ecrire(k)} × ${ecrire(b)} = ${ecrire(vendus)}.<br>`
          + `Puis ce qui reste : ${ecrire(n)} − ${ecrire(vendus)} = <b>${ecrire(reste)}</b>.`,
      });
    }
    if (sorte === 'argent') {
      const p = parmi(ENFANTS);
      const [objets, prixPossibles] = parmi([['livres', [4, 5, 6, 7.5]], ['cahiers', [1.5, 2, 2.5, 3]], ['stylos', [1.5, 2, 2.5]], ['jeux de cartes', [3, 3.5, 4, 5]]]);
      const k = entier(2, 4);
      const u = parmi(prixPossibles);
      const depense = net(k * u);
      const S = parmi([10, 20, 30, 50].filter(s => s > depense + 1));
      const reste = net(S - depense);
      return choix({
        consigne,
        enonce: `${p.nom} a ${euros(S)}. ${majuscule(p.il)} achète ${ecrire(k)} ${objets} à ${euros(u)} l’un. Combien d’argent lui reste-t-il ?`,
        reponse: euros(reste),
        pieges: enEuros([depense, S - u, S - k, reste + u, reste - u, S - u - k, reste + 1]),
        explication: `D’abord la dépense : ${ecrire(k)} × ${euros(u)} = ${euros(depense)}.<br>`
          + `Puis ce qui reste : ${euros(S)} − ${euros(depense)} = <b>${euros(reste)}</b>.`,
      });
    }
    const t = parmi([6, 8, 10, 12]);
    const q = entier(4, 12);
    const g = entier(5, 30);
    const n = t * q + g;
    return choix({
      consigne,
      enonce: `Papi récolte ${ecrire(n)} pommes. Il en garde ${ecrire(g)} et range les autres dans des cagettes de ${ecrire(t)}. Combien de cagettes remplit-il ?`,
      reponse: q,
      pieges: positifs([n - g, Math.ceil(n / t), q + 1, q + 2, q - 1, q - 2, q - 3]),
      explication: `D’abord, les pommes à ranger : ${ecrire(n)} − ${ecrire(g)} = ${ecrire(n - g)}.<br>`
        + `Puis les cagettes : ${ecrire(n - g)} ÷ ${ecrire(t)} = <b>${ecrire(q)}</b>.`,
    });
  }

  ajouterEtape({
    id: '6e-donnees-problemes',
    banque: ['operation', 'operation', 'prixTotal', 'monnaie', 'partage', 'paquets', 'difference', 'deuxEtapes'],
    creerQuestion(sorte) {
      if (sorte === 'operation') return questionOperation();
      if (sorte === 'prixTotal') return questionPrixTotal();
      if (sorte === 'monnaie') return questionMonnaie();
      if (sorte === 'partage') return questionPartage();
      if (sorte === 'paquets') return questionPaquets();
      if (sorte === 'difference') return questionDifference();
      return questionDeuxEtapes();
    },
    titreLecon: 'Résoudre des problèmes',
    lecon: `
      <h4>Quelle opération choisir ?</h4>
      <table>
        <tr><th>Je cherche…</th><th>J’utilise…</th></tr>
        <tr><td>un total, ce qu’on ajoute</td><td>l’addition +</td></tr>
        <tr><td>ce qui reste, un écart, « combien de plus »</td><td>la soustraction −</td></tr>
        <tr><td>plusieurs fois la même quantité</td><td>la multiplication ×</td></tr>
        <tr><td>un partage en parts égales, « combien de fois »</td><td>la division ÷</td></tr>
      </table>
      <p>👉 <i>4 boîtes de 6 œufs : 4 × 6 = 24 œufs.</i> · <i>Payer 7,35&nbsp;€ avec un billet de 10&nbsp;€ : on rend 10 − 7,35 = 2,65&nbsp;€.</i></p>
      <h4>Les problèmes en deux étapes</h4>
      <p>On cherche d’abord un résultat intermédiaire. <i>Roxy a 45 œufs et vend 3 boîtes de 12 œufs.
        Œufs vendus : 3 × 12 = 36. Il en reste : 45 − 36 = 9.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour ranger 25 œufs dans des boîtes de 6, on écrit 25 = 6 × 4 + 1.
        Il reste 1 œuf : il faut donc <b>5 boîtes</b>… mais on ne remplit entièrement que <b>4 boîtes</b> !</div>
      <p>⚠️ « Léa a 12 billes, c’est 5 de plus que Tom » : Tom en a <b>moins</b>, 12 − 5 = 7.
        Le mot « plus » ne veut pas toujours dire « + ».</p>
    `,
  });

  // ======================================================================
  // 3. La proportionnalité
  // ======================================================================
  // Les grandeurs des tableaux : les titres des deux lignes, les coefficients possibles, et le plus grand nombre du haut
  const GRANDEURS = [
    { x: 'Masse (kg)', y: 'Prix (€)', coefs: [2, 3, 4, 5, 6, 1.5, 2.5] },
    { x: 'Nombre de cahiers', y: 'Prix (€)', coefs: [2, 3, 4, 1.5, 2.5] },
    { x: 'Nombre de gâteaux', y: 'Nombre d’œufs', coefs: [2, 3, 4] },
    { x: 'Nombre de paquets', y: 'Nombre de biscuits', coefs: [6, 8, 10, 12] },
    { x: 'Nombre de tables', y: 'Nombre de chaises', coefs: [4, 6, 8] },
    { x: 'Durée (h)', y: 'Distance (km)', coefs: [4, 5, 12, 15], xmax: 10 },
  ];
  // Les nombres du bas s'écrivent comme des prix dans une ligne « Prix (€) » (22,50)
  const ecritureDe = G => (G.y === 'Prix (€)' ? ecrirePrix : ecrire);
  const tableauDe = (G, xs, ys) => tableau([[G.x, ...xs], [G.y, ...ys.map(y => (typeof y === 'number' ? ecritureDe(G)(y) : y))]]);

  function questionTableauOuiNon() {
    const G = parmi(GRANDEURS);
    const proportionnel = Math.random() < 0.5;
    const colonnes = parmi([3, 4]);
    const xs = croissant(differents(colonnes, 1, G.xmax || 10));
    let ys;
    let k;
    let remarque = '';
    const decimaux = G.coefs.filter(c => !Number.isInteger(c));
    if (proportionnel) {
      k = parmi(G.coefs);
      ys = xs.map(x => net(k * x));
    } else if (decimaux.length && Math.random() < 0.4) {
      // Un tableau avec des nombres décimaux, dont une case est décalée
      k = parmi(decimaux);
      ys = xs.map(x => net(k * x));
      const j = entier(1, colonnes - 1);
      ys[j] = parmi([0.5, -0.5, 1, -1].map(e => net(ys[j] + e)).filter(v => v > 0 && !ys.includes(v)));
    } else {
      // Un tableau qui piège : la 1re colonne marche avec « × k », mais pas les autres
      k = parmi(G.coefs.filter(Number.isInteger));
      const sorte = parmi(['ajout', 'ajout', 'frais', 'uneCase']);
      if (sorte === 'uneCase') {
        ys = xs.map(x => net(k * x));
        const j = entier(1, colonnes - 1);
        ys[j] = parmi([1, 2, -1, -2].map(e => ys[j] + e).filter(v => v > 0 && !ys.includes(v)));
      } else {
        // y = a × x + c : on ajoute toujours c (a = 1), ou il y a un prix de départ (a > 1)
        const a = sorte === 'ajout' || k < 3 ? 1 : entier(2, k - 1);
        const x1 = entier(1, 3);
        const c = (k - a) * x1;
        xs.splice(0, xs.length, x1, ...croissant(differents(colonnes - 1, x1 + 1, G.xmax || 10)));
        ys = xs.map(x => a * x + c);
        if (a === 1) remarque = `<br>⚠️ Ici, on <b>ajoute</b> toujours ${ecrire(c)} : ce n’est pas une multiplication !`;
      }
    }
    const ecrit = ecritureDe(G);
    let explication;
    if (proportionnel) {
      explication = `<b>Oui</b> : on multiplie toujours par ${ecrire(k)}.<br>${produits(xs, k, ecrit)}.`;
    } else {
      const j = ys.findIndex((y, i) => y !== net(k * xs[i]));
      explication = `<b>Non</b> : ${ecrire(xs[0])} × ${ecrire(k)} = ${ecrit(ys[0])}, mais ${ecrire(xs[j])} × ${ecrire(k)} = ${ecrit(net(k * xs[j]))}, `
        + `et pas ${ecrit(ys[j])}. On ne multiplie pas toujours par le même nombre.${remarque}`;
    }
    return choix({
      consigne: 'Est-ce un tableau de proportionnalité ?',
      enonce: tableauDe(G, xs, ys),
      reponse: proportionnel ? 'Oui' : 'Non',
      choix: OUI_NON,
      explication,
    });
  }

  // Une case du bas est fausse : laquelle ? (les boutons sont les nombres du bas, dans l'ordre du tableau)
  function questionCaseFausse() {
    const G = parmi(GRANDEURS);
    const k = parmi(G.coefs);
    const xs = croissant(differents(4, 1, G.xmax || 10));
    const ys = xs.map(x => net(k * x));
    const j = entier(0, 3);
    const decalages = Number.isInteger(k) ? [1, 2, -1, -2] : [0.5, -0.5, 1, -1];
    const faux = parmi(decalages.map(e => net(ys[j] + e)).filter(v => v > 0 && !ys.includes(v)));
    const lignes = ys.map((y, i) => (i === j ? faux : y));
    const ecrit = ecritureDe(G);
    return choix({
      consigne: 'Une case du bas est fausse : laquelle ?',
      enonce: tableauDe(G, xs, lignes),
      reponse: ecrit(faux),
      choix: lignes.map(ecrit),
      explication: `Les autres colonnes multiplient par ${ecrire(k)} : ${produits(xs.filter((x, i) => i !== j), k, ecrit)}.<br>`
        + `Mais ${ecrire(xs[j])} × ${ecrire(k)} = ${ecrit(ys[j])}, et pas ${ecrit(faux)} : c’est la case fausse.`,
    });
  }

  // Des situations : [l'énoncé, l'explication]
  const SITUATIONS_OUI = [
    () => {
      const k = entier(4, 9);
      return [`Les cerises coûtent ${euros(k)} le kilo. Le prix payé est-il proportionnel à la masse de cerises ?`,
        `${mesure(1, 'kg')} coûte ${euros(k)}, ${mesure(2, 'kg')} coûtent ${euros(2 * k)}, ${mesure(3, 'kg')} coûtent ${euros(3 * k)} : on multiplie toujours par ${ecrire(k)}.`];
    },
    () => {
      const k = entier(6, 9);
      return [`Une place de cinéma coûte ${euros(k)}. Le prix payé est-il proportionnel au nombre de places ?`,
        `1 place : ${euros(k)} ; 2 places : ${euros(2 * k)} ; 3 places : ${euros(3 * k)}. On multiplie toujours par ${ecrire(k)}.`];
    },
    () => {
      const d = parmi([200, 250, 400]);
      return [`Un tour de piste mesure ${mesure(d, 'm')}. La distance parcourue est-elle proportionnelle au nombre de tours ?`,
        `1 tour : ${mesure(d, 'm')} ; 2 tours : ${mesure(2 * d, 'm')} ; 3 tours : ${mesure(3 * d, 'm')}. On multiplie toujours par ${ecrire(d)}.`];
    },
    () => {
      const k = entier(2, 4);
      return [`Pour faire un gâteau, il faut ${ecrire(k)} œufs. Le nombre d’œufs est-il proportionnel au nombre de gâteaux ?`,
        `1 gâteau : ${ecrire(k)} œufs ; 2 gâteaux : ${ecrire(2 * k)} œufs ; 3 gâteaux : ${ecrire(3 * k)} œufs. On multiplie toujours par ${ecrire(k)}.`];
    },
    () => ['Le périmètre d’un carré est-il proportionnel à la longueur de son côté ?',
      'Le périmètre d’un carré, c’est 4 fois son côté : côté 1&nbsp;cm → 4&nbsp;cm ; côté 2&nbsp;cm → 8&nbsp;cm. On multiplie toujours par 4.'],
    () => {
      const k = parmi([6, 8, 10, 12]);
      return [`Un paquet contient ${ecrire(k)} biscuits. Le nombre de biscuits est-il proportionnel au nombre de paquets ?`,
        `1 paquet : ${ecrire(k)} biscuits ; 2 paquets : ${ecrire(2 * k)} biscuits ; 3 paquets : ${ecrire(3 * k)} biscuits. On multiplie toujours par ${ecrire(k)}.`];
    },
    () => ['Un vélo a 2 roues. Le nombre de roues est-il proportionnel au nombre de vélos ?',
      '1 vélo : 2 roues ; 3 vélos : 6 roues ; 10 vélos : 20 roues. On multiplie toujours par 2.'],
  ];
  const SITUATIONS_NON = [
    () => ['La taille d’un enfant est-elle proportionnelle à son âge ?',
      'À 5 ans, on mesure environ 1,10&nbsp;m. À 10 ans, on ne mesure pas le double (2,20&nbsp;m) ! L’âge double, mais pas la taille.'],
    () => {
      const c = entier(2, 4); const k = entier(1, 3);
      return [`Un taxi coûte ${euros(c)} au départ, puis ${euros(k)} par kilomètre. Le prix est-il proportionnel à la distance ?`,
        `${mesure(1, 'km')} coûte ${euros(c + k)}, mais ${mesure(2, 'km')} coûtent ${euros(c + 2 * k)}, et pas le double (${euros(2 * (c + k))}), `
        + `à cause des ${euros(c)} du départ.`];
    },
    () => {
      const c = entier(3, 6); const k = entier(2, 4);
      return [`La livraison coûte ${euros(c)}, et les pommes ${euros(k)} le kilo. Le prix total est-il proportionnel à la masse de pommes ?`,
        `${mesure(1, 'kg')} : ${euros(c + k)} ; ${mesure(2, 'kg')} : ${euros(c + 2 * k)}, et pas le double (${euros(2 * (c + k))}), à cause des ${euros(c)} de la livraison.`];
    },
    () => ['L’aire d’un carré est-elle proportionnelle à la longueur de son côté ?',
      'Côté 1&nbsp;cm : aire 1&nbsp;cm² ; côté 2&nbsp;cm : aire 4&nbsp;cm², et pas 2&nbsp;cm². Le côté double, mais l’aire est multipliée par 4.'],
    () => {
      const c = parmi([10, 15, 20]); const k = entier(2, 4);
      return [`À la piscine, la carte coûte ${euros(c)}, puis chaque entrée ${euros(k)}. Le prix payé est-il proportionnel au nombre d’entrées ?`,
        `1 entrée : ${euros(c + k)} ; 2 entrées : ${euros(c + 2 * k)}, et pas le double (${euros(2 * (c + k))}), à cause des ${euros(c)} de la carte.`];
    },
    () => ['La pointure des chaussures est-elle proportionnelle à l’âge ?',
      'À 10 ans, on chausse environ du 34. À 20 ans, on ne chausse pas du 68 : l’âge double, mais pas la pointure.'],
  ];

  function questionSituation() {
    const proportionnel = Math.random() < 0.5;
    const [enonce, pourquoi] = parmi(proportionnel ? SITUATIONS_OUI : SITUATIONS_NON)();
    return choix({
      consigne: 'Réponds par oui ou par non',
      enonce,
      reponse: proportionnel ? 'Oui' : 'Non',
      choix: OUI_NON,
      explication: `${proportionnel ? '<b>Oui</b>, c’est proportionnel.' : '<b>Non</b>, ce n’est pas proportionnel.'}<br>${pourquoi}`,
    });
  }

  // Le coefficient, avec des boutons « × 3 », « + 4 » (le piège, toujours présent : ajouter au lieu de multiplier)
  function questionFleche() {
    const G = parmi(GRANDEURS);
    const k = parmi(G.coefs);
    const xs = croissant(differents(3, 1, G.xmax || 10));
    const ys = xs.map(x => net(k * x));
    const reponse = `× ${ecrire(k)}`;
    const ajout = `+ ${ecrire(net(ys[0] - xs[0]))}`;
    const autres = [`× ${ecrire(k + 1)}`, `+ ${ecrire(k)}`, `+ ${ecrire(net(ys[1] - xs[1]))}`];
    if (Number.isInteger(xs[1] / xs[0])) autres.push(`× ${ecrire(xs[1] / xs[0])}`);
    if (Number.isInteger(k) && k > 2) autres.push(`× ${ecrire(k - 1)}`);
    const deuxAutres = RM.melanger([...new Set(autres)].filter(p => p !== ajout && p !== reponse)).slice(0, 2);
    return choix({
      consigne: 'Trouve le coefficient de proportionnalité',
      enonce: `${tableauDe(G, xs, ys)}Pour passer d’un nombre du haut au nombre du bas, on fait toujours ___.`,
      reponse,
      pieges: [ajout, ...deuxAutres],
      explication: `On multiplie toujours par <b>${ecrire(k)}</b> :<br>${produits(xs, k, ecritureDe(G))}.<br>`
        + `⚠️ « ${ajout} » marche pour ${ecrire(xs[0])} → ${ecritureDe(G)(ys[0])}, mais pas pour les autres cases.`,
    });
  }

  function questionCoefficient() {
    const sorte = parmi(['tableau', 'tableau', 'prix', 'oeufs']);
    if (sorte === 'tableau') {
      const G = parmi(GRANDEURS);
      const k = parmi(G.coefs);
      const xs = croissant(differents(3, 2, G.xmax || 10));
      const ys = xs.map(x => net(k * x));
      const ecrit = ecritureDe(G);
      return nombre({
        consigne: 'Trouve le coefficient de proportionnalité',
        enonce: `${tableauDe(G, xs, ys)}On passe de la ligne du haut à celle du bas en multipliant par ___.`,
        reponse: k,
        explication: `On divise un nombre du bas par le nombre du haut : ${ecrit(ys[0])} ÷ ${ecrire(xs[0])} = <b>${ecrire(k)}</b>.<br>`
          + `On vérifie : ${produits(xs.slice(1), k, ecrit)}.`,
      });
    }
    if (sorte === 'prix') {
      const [fruit, kmin, kmax] = parmi(AU_KILO);
      const k = prixEntre(kmin, kmax);
      const n = entier(2, 5);
      const total = net(n * k);
      return nombre({
        consigne: 'Trouve le prix d’un kilo',
        enonce: `Au marché, ${mesure(n, 'kg')} ${de(fruit)} coûtent ${euros(total)}. Combien coûte ${mesure(1, 'kg')} ?`,
        reponse: k,
        prix: true,
        explication: `Le prix d’un kilo, c’est le coefficient de proportionnalité : on divise par ${ecrire(n)}.<br>`
          + `${euros(total)} ÷ ${ecrire(n)} = <b>${euros(k)}</b>.`,
      });
    }
    const k = entier(2, 4);
    const n = entier(3, 8);
    return nombre({
      consigne: 'Trouve le coefficient de proportionnalité',
      enonce: `Pour faire ${ecrire(n)} gâteaux, il faut ${ecrire(n * k)} œufs. Combien d’œufs faut-il pour un seul gâteau ?`,
      reponse: k,
      unite: 'œufs',
      explication: `On partage les œufs entre les ${ecrire(n)} gâteaux : ${ecrire(n * k)} ÷ ${ecrire(n)} = <b>${combien(k, 'œuf')}</b> par gâteau.<br>`
        + `C’est le coefficient : le nombre d’œufs, c’est toujours ${ecrire(k)} fois le nombre de gâteaux.`,
    });
  }

  function vraiFauxProportion() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.35) {
      return vraiFaux({
        enonce: `Dans un tableau de proportionnalité, on passe d’une ligne à l’autre en ${vrai ? 'multipliant toujours par' : 'ajoutant toujours'} le même nombre.`,
        vrai,
        explication: 'On <b>multiplie</b> toujours par le même nombre : le coefficient de proportionnalité.<br>'
          + 'Ajouter toujours le même nombre (2 → 5, 4 → 7), ce n’est pas proportionnel !',
      });
    }
    // Le prix double, triple… mais ne s'ajoute pas (un prix au kilo qui va bien avec le fruit)
    const [fruit, kmin, kmax] = parmi(AU_KILO);
    const k = prixAuDemi(kmin, kmax);
    const x1 = entier(2, 4);
    const x2 = parmi([x1 * 2, x1 * 3, x1 + entier(1, 3)]);
    const y1 = net(k * x1);
    const bon = net(k * x2);
    const additif = net(y1 + x2 - x1);
    return vraiFaux({
      enonce: `Si ${mesure(x1, 'kg')} ${de(fruit)} coûtent ${euros(y1)}, alors ${mesure(x2, 'kg')} coûtent ${euros(vrai ? bon : additif)}.`,
      vrai,
      explication: `${mesure(1, 'kg')} coûte ${euros(y1)} ÷ ${ecrire(x1)} = ${euros(k)}, donc ${mesure(x2, 'kg')} coûtent ${ecrire(x2)} × ${euros(k)} = <b>${euros(bon)}</b>.`
        + (vrai ? '' : `<br>⚠️ ${mesure(x2 - x1, 'kg')} de plus, ce n’est pas ${euros(x2 - x1)} de plus !`),
    });
  }

  ajouterEtape({
    id: '6e-donnees-proportionnalite',
    banque: ['tableau', 'caseFausse', 'caseFausse', 'situation', 'fleche', 'fleche', 'coefficient', 'coefficient', 'coefficient',
      'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'tableau') return questionTableauOuiNon();
      if (sorte === 'caseFausse') return questionCaseFausse();
      if (sorte === 'situation') return questionSituation();
      if (sorte === 'fleche') return questionFleche();
      if (sorte === 'coefficient') return questionCoefficient();
      return vraiFauxProportion();
    },
    titreLecon: 'La proportionnalité',
    lecon: `
      <h4>Deux grandeurs proportionnelles</h4>
      <p>Deux grandeurs sont <b>proportionnelles</b> quand on passe de l’une à l’autre en <b>multipliant toujours par le même nombre</b> :
        c’est le <b>coefficient de proportionnalité</b>.</p>
      ${tableau([['Masse (kg)', 1, 2, 3, 5], ['Prix (€)', 4, 8, 12, 20]])}
      <p>👉 Ici, on multiplie toujours par <b>4</b> : 1&nbsp;kg coûte 4&nbsp;€. Si la masse double, le prix double aussi.</p>
      <h4>Comment le vérifier ?</h4>
      <p>On divise chaque nombre du bas par celui du haut. Si on trouve <b>toujours le même quotient</b>, c’est un tableau de proportionnalité :
        <i>8 ÷ 2 = 4 ; 12 ÷ 3 = 4 ; 20 ÷ 5 = 4</i> ✔</p>
      <p>👉 <b>Pas proportionnels</b> : l’âge et la taille (à 10 ans, on ne mesure pas deux fois plus qu’à 5 ans !),
        le prix d’un taxi qui coûte déjà quelque chose au départ.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour trouver le coefficient, divise un nombre du bas par le nombre du haut :
        <i>12 ÷ 3 = 4</i>. Puis vérifie avec toutes les autres cases !</div>
      <p>⚠️ Si on <b>ajoute</b> toujours le même nombre (2 → 5, 4 → 7, 6 → 9 : on ajoute 3), ce n’est <b>pas</b> un tableau de proportionnalité.</p>
    `,
  });

  // ======================================================================
  // 4. Calculer avec la proportionnalité
  // ======================================================================
  // Un tableau de proportionnalité de 4 colonnes, avec une case cachée. On le fabrique pour qu'une méthode soit naturelle :
  // additionner deux colonnes, multiplier (ou diviser) une colonne, ou passer par le coefficient.
  // enHaut : la case cachée est dans la ligne du haut (on divise alors par le coefficient : il doit être entier)
  function tableauProportionnel(enHaut) {
    const G = parmi(GRANDEURS);
    const xmax = G.xmax || 12;
    const k = parmi(enHaut ? G.coefs.filter(Number.isInteger) : G.coefs);
    const methode = parmi(['addition', 'multiple', 'coefficient']);
    let xs;
    let cache;
    let a;
    let b;
    let m;
    if (methode === 'addition') {
      do { [a, b] = croissant(differents(2, 1, 6)); } while (a + b > xmax);
      cache = a + b;
      xs = [a, b, cache, parmi(differents(xmax, 1, xmax).filter(x => ![a, b, cache].includes(x)))];
    } else if (methode === 'multiple') {
      let base;
      do { base = entier(2, 5); m = entier(2, 4); } while (base * m > xmax);
      // on connaît a, on cherche cache = a × m (ou a ÷ m)
      [a, cache] = Math.random() < 0.7 ? [base, base * m] : [base * m, base];
      xs = [a, cache, ...differents(xmax, 1, xmax).filter(x => x !== a && x !== cache).slice(0, 2)];
    } else {
      xs = differents(4, 2, xmax);
      cache = parmi(xs);
      a = parmi(xs.filter(x => x !== cache));
    }
    xs = croissant(xs);
    const ys = xs.map(x => net(k * x));
    const y = x => net(k * x);
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
      explication = `${e(y(cache))} = ${e(y(a))} + ${e(y(b))}, donc en haut aussi on additionne :<br>`
        + `${ecrire(a)} + ${ecrire(b)} = <b>${ecrire(cache)}</b>.`;
    } else if (methode === 'multiple') {
      explication = cache > a
        ? `${e(y(cache))} = ${e(y(a))} × ${ecrire(m)}, donc en haut aussi :<br>${ecrire(a)} × ${ecrire(m)} = <b>${ecrire(cache)}</b>.`
        : `${e(y(cache))} = ${e(y(a))} ÷ ${ecrire(m)}, donc en haut aussi :<br>${ecrire(a)} ÷ ${ecrire(m)} = <b>${ecrire(cache)}</b>.`;
    } else {
      explication = `Le coefficient : ${e(y(a))} ÷ ${ecrire(a)} = ${ecrire(k)}. Du bas vers le haut, on divise :<br>`
        + `${e(y(cache))} ÷ ${ecrire(k)} = <b>${ecrire(cache)}</b>.`;
    }
    // L'erreur de l'addition, avec une colonne voisine : « de 4 à 9, c'est + 5, mais 16 + 5 = 21 est faux »
    const autres = xs.filter(x => x !== cache);
    const voisin = autres.filter(x => x < cache).pop() ?? autres[0];
    const pas = cache - voisin;
    const erreur = `<br>⚠️ On n’ajoute pas le même nombre en haut et en bas : de ${ecrire(voisin)} à ${ecrire(cache)}, `
      + `c’est ${pas > 0 ? '+' : '−'} ${ecrire(Math.abs(pas))}, mais ${e(y(voisin))} ${pas > 0 ? '+' : '−'} ${ecrire(Math.abs(pas))} = ${e(net(y(voisin) + pas))} est faux.`;
    // Le tableau avec le trou, et le même avec la réponse en gras (pour la solution)
    const avec = contenu => tableau([
      [G.x, ...xs.map((x, i) => (enHaut && i === j ? contenu : x))],
      [G.y, ...ys.map((v, i) => (!enHaut && i === j ? contenu : e(v)))],
    ]);
    const reponse = enHaut ? cache : y(cache);
    return { G, k, xs, ys, j, e, reponse, html: avec('___'), solution: avec(`<b>${enHaut ? ecrire(cache) : e(reponse)}</b>`), explication, erreur };
  }

  function questionTableauTrou(avecBoutons) {
    const enHaut = !avecBoutons && Math.random() < 0.3;
    const T = tableauProportionnel(enHaut);
    const consigne = 'Complète le tableau de proportionnalité';
    if (!avecBoutons) {
      return nombre({
        consigne, enonce: T.html, reponse: T.reponse, prix: !enHaut && T.e === ecrirePrix, solution: T.solution, explication: T.explication,
      });
    }
    const x = T.xs[T.j];
    // Les pièges : l'erreur de l'addition (ajouter en bas ce qu'on ajoute en haut), et les colonnes voisines
    const additifs = T.xs.map((xi, i) => T.ys[i] + x - xi).filter((v, i) => i !== T.j);
    return choix({
      consigne,
      enonce: T.html,
      reponse: T.e(T.reponse),
      pieges: positifs([...additifs, T.k * (x + 1), T.k * (x - 1), T.k * (x - 2), x + T.k]).map(T.e),
      explication: T.explication + T.erreur,
    });
  }

  // Les recettes : la quantité d'un ingrédient pour une personne
  const INGREDIENTS = [
    { nom: 'farine', unite: 'g', parPersonne: [25, 40, 50, 60, 75, 100] },
    { nom: 'sucre', unite: 'g', parPersonne: [10, 15, 20, 25, 30] },
    { nom: 'beurre', unite: 'g', parPersonne: [10, 15, 20, 25] },
    { nom: 'lait', unite: 'cL', parPersonne: [5, 8, 10, 15, 20] },
    { nom: 'chocolat', unite: 'g', parPersonne: [20, 25, 30, 40, 50] },
  ];

  function questionRecette() {
    const I = parmi(INGREDIENTS);
    const u = parmi(I.parPersonne);
    const x1 = parmi([2, 3, 4, 6, 8]);
    const x2 = entierSauf(2, 12, [x1]);
    const y1 = u * x1;
    const y2 = u * x2;
    const q = v => mesure(v, I.unite);
    let calcul;
    if (x2 % x1 === 0) {
      calcul = `${combien(x2, 'personne')}, c’est ${ecrire(x2 / x1)} fois plus que ${ecrire(x1)} :<br>${q(y1)} × ${ecrire(x2 / x1)} = <b>${q(y2)}</b>.`;
    } else if (x1 % x2 === 0) {
      calcul = `${combien(x2, 'personne')}, c’est ${ecrire(x1 / x2)} fois moins que ${ecrire(x1)} :<br>${q(y1)} ÷ ${ecrire(x1 / x2)} = <b>${q(y2)}</b>.`;
    } else {
      calcul = `Pour 1 personne : ${q(y1)} ÷ ${ecrire(x1)} = ${q(u)}.<br>Pour ${combien(x2, 'personne')} : ${ecrire(x2)} × ${q(u)} = <b>${q(y2)}</b>.`;
    }
    const attention = x2 > x1 ? `<br>⚠️ ${combien(x2 - x1, 'personne')} de plus, ce n’est pas ${q(x2 - x1)} de plus !` : '';
    return choix({
      consigne: 'Adapte la recette',
      enonce: `Pour ${combien(x1, 'personne')}, il faut ${q(y1)} ${de(I.nom)}. Combien en faut-il pour ${combien(x2, 'personne')} ?`,
      reponse: q(y2),
      // l'erreur de l'addition, une ou deux personnes de trop ou de moins, la quantité de départ, une retenue
      pieges: positifs([y1 + x2 - x1, u * (x2 + 1), u * (x2 - 1), u * (x2 + 2), u * (x2 - 2), y1, y2 + 10, y2 - 10]).map(q),
      explication: calcul + attention,
    });
  }

  // La linéarité : additionner (ou soustraire) deux colonnes, multiplier (ou diviser) une colonne
  function questionLinearite() {
    const consigne = 'Choisis le bon prix';
    if (Math.random() < 0.5) {
      const [fruit, kmin, kmax] = parmi(AU_KILO);
      const k = prixAuDemi(kmin, kmax);
      let a;
      let b;
      let additionner;
      // (pas plus de 8 kg en tout, et pas de 6 kg − 3 kg : on demanderait le prix de 3 kg, déjà donné)
      do {
        [b, a] = croissant(differents(2, 2, 6));
        additionner = Math.random() < 0.65;
      } while (additionner ? a + b > 8 : a === 2 * b);
      const c = additionner ? a + b : a - b;
      const [ya, yb, yc] = [a, b, c].map(x => net(k * x));
      const coute = c >= 2 ? 'coûtent' : 'coûte';
      return choix({
        consigne,
        enonce: `Au marché, ${mesure(a, 'kg')} ${de(fruit)} coûtent ${euros(ya)} et ${mesure(b, 'kg')} coûtent ${euros(yb)}. Combien ${coute} ${mesure(c, 'kg')} ?`,
        reponse: euros(yc),
        // l'erreur de l'addition (1 kg de plus → 1 € de plus), un kilo de trop ou de moins, un des prix donnés…
        pieges: enEuros(additionner
          ? [ya + b, k * (c + 1), k * (c - 1), ya, yb, 2 * ya]
          : [ya - b, k * (c + 1), k * (c - 1), ya, ya + yb, yb]),
        explication: additionner
          ? `${mesure(c, 'kg')} = ${mesure(a, 'kg')} + ${mesure(b, 'kg')}, donc on additionne les prix :<br>${euros(ya)} + ${euros(yb)} = <b>${euros(yc)}</b>.`
          : `${mesure(c, 'kg')} = ${mesure(a, 'kg')} − ${mesure(b, 'kg')}, donc on soustrait les prix :<br>${euros(ya)} − ${euros(yb)} = <b>${euros(yc)}</b>.`,
      });
    }
    const P = parmi(PIECES);
    const u = parmi(P.prix);
    const base = entier(2, 5);
    const m = entier(2, 4);
    const [a, c] = Math.random() < 0.7 ? [base, base * m] : [base * m, base];
    const ya = net(u * a);
    const yc = net(u * c);
    return choix({
      consigne,
      enonce: `${P.lieu}, ${ecrire(a)} ${P.des} coûtent ${euros(ya)}. Combien coûtent ${ecrire(c)} ${P.des} ?`,
      reponse: euros(yc),
      pieges: enEuros(c > a
        ? [ya + c - a, u * (c + 1), u * (c - 1), ya + m, ya * (m + 1), ya]
        : [ya - (a - c), u * (c + 1), u * (c - 1), ya - m, ya, yc * 2]),
      explication: c > a
        ? `${ecrire(c)} ${P.des}, c’est ${ecrire(m)} fois plus que ${ecrire(a)} : ${euros(ya)} × ${ecrire(m)} = <b>${euros(yc)}</b>.<br>`
          + `⚠️ ${ecrire(c - a)} ${P.des} de plus, ce n’est pas ${euros(c - a)} de plus !`
        : `${ecrire(c)} ${P.des}, c’est ${ecrire(m)} fois moins que ${ecrire(a)} : ${euros(ya)} ÷ ${ecrire(m)} = <b>${euros(yc)}</b>.`,
    });
  }

  // Passer par l'unité : les nombres ne sont ni doubles, ni triples l'un de l'autre
  function questionPrixUnite() {
    const P = parmi(PIECES);
    const u = parmi(P.prix);
    let a;
    let c;
    do { a = entier(3, 9); c = entier(2, 9); } while (a === c || a % c === 0 || c % a === 0);
    const ya = net(u * a);
    const yc = net(u * c);
    return nombre({
      consigne: 'Résous le problème',
      enonce: `${P.lieu}, ${ecrire(a)} ${P.des} coûtent ${euros(ya)}. Combien coûtent ${ecrire(c)} ${P.des} ?`,
      reponse: yc,
      prix: true,
      explication: `On passe par l’unité. Le prix d’un ${P.un} : ${euros(ya)} ÷ ${ecrire(a)} = ${euros(u)}.<br>`
        + `Le prix de ${ecrire(c)} ${P.des} : ${ecrire(c)} × ${euros(u)} = <b>${euros(yc)}</b>.`,
    });
  }

  function questionConsommation() {
    const sorte = parmi(['voiture', 'robinet', 'lecture', 'velo']);
    const consigne = 'Résous le problème';
    if (sorte === 'voiture') {
      const c = entier(4, 8);
      const d = parmi([50, 150, 200, 250, 300, 400, 500]);
      const r = net(c * d / 100);
      return nombre({
        consigne,
        enonce: `La voiture de Papi consomme ${mesure(c, 'L')} d’essence pour ${mesure(100, 'km')}. Combien de litres consomme-t-elle pour ${mesure(d, 'km')} ?`,
        reponse: r,
        unite: 'L',
        explication: d === 50
          ? `${mesure(50, 'km')}, c’est la moitié de ${mesure(100, 'km')} : ${ecrire(c)} ÷ 2 = <b>${mesure(r, 'L')}</b>.`
          : `${mesure(d, 'km')}, c’est ${ecrire(d / 100)} fois ${mesure(100, 'km')} : ${ecrire(c)} × ${ecrire(d / 100)} = <b>${mesure(r, 'L')}</b>.`,
      });
    }
    if (sorte === 'robinet') {
      // un seau de 12 L au plus
      const litres = entier(2, 4);
      const t = entier(2, 3);
      const t2 = entierSauf(2, 10, [t]);
      return nombre({
        consigne,
        enonce: `Un robinet remplit un seau de ${mesure(litres * t, 'L')} en ${combien(t, 'minute')}. Au même rythme, combien de litres coulent en ${combien(t2, 'minute')} ?`,
        reponse: litres * t2,
        unite: 'L',
        explication: `En 1 minute : ${ecrire(litres * t)} ÷ ${ecrire(t)} = ${mesure(litres, 'L')}.<br>`
          + `En ${combien(t2, 'minute')} : ${ecrire(t2)} × ${mesure(litres, 'L')} = <b>${mesure(litres * t2, 'L')}</b>.`,
      });
    }
    const p = parmi(ENFANTS);
    if (sorte === 'lecture') {
      const t = parmi([10, 15, 20, 30]);
      const n = entier(3, 12);
      const fois = 60 / t;
      return nombre({
        consigne,
        enonce: `${p.nom} lit ${combien(n, 'page')} en ${combien(t, 'minute')}. Au même rythme, combien de pages lit-${p.il} en une heure ?`,
        reponse: n * fois,
        unite: 'pages',
        explication: `Une heure, c’est ${mesure(60, 'minutes')} = ${ecrire(fois)} × ${mesure(t, 'minutes')}.<br>`
          + `${majuscule(p.il)} lit donc ${ecrire(fois)} fois plus de pages : ${ecrire(n)} × ${ecrire(fois)} = <b>${combien(n * fois, 'page')}</b>.`,
      });
    }
    const t = parmi([15, 20, 30]);
    const d = t === 15 ? entier(3, 5) : t === 20 ? entier(3, 6) : entier(4, 8);
    const fois = 60 / t;
    return nombre({
      consigne,
      enonce: `À vélo, ${p.nom} parcourt ${mesure(d, 'km')} en ${mesure(t, 'minutes')}. À la même vitesse, combien de kilomètres parcourt-${p.il} en une heure ?`,
      reponse: d * fois,
      unite: 'km',
      explication: `Une heure, c’est ${mesure(60, 'minutes')} = ${ecrire(fois)} × ${mesure(t, 'minutes')}.<br>`
        + `${majuscule(p.il)} parcourt donc ${ecrire(fois)} fois plus : ${ecrire(d)} × ${ecrire(fois)} = <b>${mesure(d * fois, 'km')}</b>.`,
    });
  }

  function vraiFauxCalcul() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.5) {
      // La linéarité additive (et l'erreur : 2 kg de plus → 2 € de plus)
      const [fruit, kmin, kmax] = parmi(AU_KILO);
      const k = prixAuDemi(kmin, kmax);
      let a;
      let b;
      do { [a, b] = differents(2, 2, 5); } while (a + b > 8);
      const [ya, yb] = [net(k * a), net(k * b)];
      const bon = net(ya + yb);
      return vraiFaux({
        enonce: `Si ${mesure(a, 'kg')} ${de(fruit)} coûtent ${euros(ya)} et ${mesure(b, 'kg')} coûtent ${euros(yb)}, alors ${mesure(a + b, 'kg')} coûtent ${euros(vrai ? bon : ya + b)}.`,
        vrai,
        explication: `${mesure(a + b, 'kg')} = ${mesure(a, 'kg')} + ${mesure(b, 'kg')}, donc le prix est ${euros(ya)} + ${euros(yb)} = <b>${euros(bon)}</b>.`,
      });
    }
    const P = parmi(PIECES);
    const u = parmi(P.prix);
    const a = entier(2, 5);
    const m = entier(2, 4);
    const c = a * m;
    const ya = net(u * a);
    const yc = net(u * c);
    return vraiFaux({
      enonce: `Si ${ecrire(a)} ${P.des} coûtent ${euros(ya)}, alors ${ecrire(c)} ${P.des} coûtent ${euros(vrai ? yc : ya + c - a)}.`,
      vrai,
      explication: `${ecrire(c)} ${P.des}, c’est ${ecrire(m)} fois plus : ${euros(ya)} × ${ecrire(m)} = <b>${euros(yc)}</b>.`
        + (vrai ? '' : `<br>⚠️ On ne peut pas ajouter ${euros(c - a)} parce qu’il y a ${ecrire(c - a)} ${P.des} de plus.`),
    });
  }

  ajouterEtape({
    id: '6e-donnees-calculer',
    banque: ['tableauTrou', 'tableauTrou', 'tableauChoix', 'tableauChoix', 'recette', 'recette', 'linearite', 'linearite',
      'prix', 'consommation', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'tableauTrou') return questionTableauTrou(false);
      if (sorte === 'tableauChoix') return questionTableauTrou(true);
      if (sorte === 'recette') return questionRecette();
      if (sorte === 'linearite') return questionLinearite();
      if (sorte === 'prix') return questionPrixUnite();
      if (sorte === 'consommation') return questionConsommation();
      return vraiFauxCalcul();
    },
    titreLecon: 'Calculer avec la proportionnalité',
    lecon: `
      <p>Dans une situation de proportionnalité, on trouve une valeur qui manque de plusieurs façons. Choisis la plus facile !</p>
      <h4>Passer par l’unité</h4>
      <p><i>5 cahiers coûtent 7,50&nbsp;€. 1 cahier coûte 7,50 ÷ 5 = 1,50&nbsp;€. Donc 3 cahiers coûtent 3 × 1,50 = 4,50&nbsp;€.</i></p>
      <h4>Multiplier ou additionner les colonnes</h4>
      <p><i>Pour 3 gâteaux, il faut 6 œufs. Pour 9 gâteaux (3 fois plus), il faut 3 fois plus d’œufs : 6 × 3 = 18 œufs.</i></p>
      <p><i>3&nbsp;kg coûtent 6&nbsp;€ et 2&nbsp;kg coûtent 4&nbsp;€. Alors 5&nbsp;kg (3 + 2) coûtent 6 + 4 = 10&nbsp;€.</i></p>
      <h4>Utiliser le coefficient</h4>
      ${tableau([['Masse (kg)', 2, 4, 7], ['Prix (€)', 5, 10, '?']])}
      <p><i>On multiplie toujours par 2,5 (car 5 ÷ 2 = 2,5) : 7 × 2,5 = 17,5. Donc 7&nbsp;kg coûtent 17,50&nbsp;€.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde d’abord les nombres du haut. L’un est le double d’un autre ?
        La somme de deux autres ? Sinon, passe par 1 !</div>
      <p>⚠️ Additionner deux colonnes, oui ; ajouter le <b>même nombre</b> en haut et en bas, non !
        Pour 2 personnes de plus, il ne faut pas 2&nbsp;g de farine de plus.</p>
    `,
  });

  // ======================================================================
  // 5. Les pourcentages ⭐
  // ======================================================================
  // Les pourcentages simples : ce qu'ils représentent
  const POURCENTS = {
    100: { nom: 'le tout', fraction: [1, 1] },
    50: { nom: 'la moitié', fraction: [1, 2] },
    25: { nom: 'le quart', fraction: [1, 4] },
    75: { nom: 'les trois quarts', fraction: [3, 4] },
    20: { nom: 'le cinquième', fraction: [1, 5] },
    10: { nom: 'le dixième', fraction: [1, 10] },
  };
  // Le calcul de p % de n, expliqué (e : ecrire pour un nombre, euros pour un prix)
  const COMMENT = {
    50: (n, e) => `${e(n)} ÷ 2`,
    25: (n, e) => `${e(n)} ÷ 4`,
    10: (n, e) => `${e(n)} ÷ 10`,
    20: (n, e) => `(${e(n)} ÷ 10) × 2`,
  };
  function calculPourcent(p, n, e = ecrire) {
    const r = net(p * n / 100);
    if (p === 50) return `Prendre ${mesure(50, '%')}, c’est prendre la moitié : ${e(n)} ÷ 2 = <b>${e(r)}</b>.`;
    if (p === 25) return `Prendre ${mesure(25, '%')}, c’est prendre le quart : ${e(n)} ÷ 4 = <b>${e(r)}</b>.`;
    if (p === 75) return `Prendre ${mesure(75, '%')}, c’est prendre les trois quarts : ${e(n)} ÷ 4 = ${e(net(n / 4))}, puis ${e(net(n / 4))} × 3 = <b>${e(r)}</b>.`;
    if (p === 10) return `Prendre ${mesure(10, '%')}, c’est prendre le dixième : ${e(n)} ÷ 10 = <b>${e(r)}</b>.`;
    return `D’abord ${mesure(10, '%')} : ${e(n)} ÷ 10 = ${e(net(n / 10))}.<br>${mesure(p, '%')}, c’est ${ecrire(p / 10)} fois plus : `
      + `${e(net(n / 10))} × ${ecrire(p / 10)} = <b>${e(r)}</b>.`;
  }
  // Un nombre dont on sait prendre p % de tête (entre min et max)
  function baseDe(p, min, max) {
    const pas = { 50: 2, 25: 4, 75: 4, 20: 5, 10: 1 }[p];
    return pas * entier(Math.ceil(min / pas), Math.floor(max / pas));
  }
  // Au plus 2 chiffres après la virgule (pour les pièges)
  const auCentieme = v => Number.isInteger(net(v * 100));

  function questionPourcentFraction() {
    const sorte = parmi(['nom', 'pourcent', 'fraction']);
    if (sorte === 'nom') {
      const p = parmi([50, 25, 75, 20, 10, 100]);
      const [n, d] = POURCENTS[p].fraction;
      return choix({
        consigne: 'Choisis la bonne réponse',
        enonce: `Prendre ${mesure(p, '%')} d’une quantité, c’est en prendre…`,
        reponse: POURCENTS[p].nom,
        pieges: Object.values(POURCENTS).map(x => x.nom),
        explication: `${mesure(p, '%')} = ${frac(p, 100)} = ${p === 100 ? '1' : frac(n, d)}, c’est-à-dire <b>${POURCENTS[p].nom}</b>.`,
      });
    }
    if (sorte === 'pourcent') {
      // Les pièges : « le quart » → 4 %, « les trois quarts » → 34 %, « le cinquième » → 5 %…
      const PIEGES = { 50: [2, 20, 25, 75, 100, 200], 25: [4, 50, 75, 40, 20], 75: [3, 25, 34, 80, 100], 20: [5, 15, 25, 50, 2], 10: [1, 100, 90, 20, 5] };
      const p = parmi([50, 25, 75, 20, 10]);
      const [n, d] = POURCENTS[p].fraction;
      // (la mise en garde n'est écrite que si ce piège est sur un bouton)
      const attention = { 25: [4, 'Le quart'], 75: [34, frac(3, 4)], 20: [5, 'Le cinquième'] }[p];
      const q = choix({
        consigne: 'Choisis le bon pourcentage',
        enonce: `Prendre ${POURCENTS[p].nom} d’une quantité, c’est en prendre…`,
        reponse: mesure(p, '%'),
        pieges: PIEGES[p].map(v => mesure(v, '%')),
        explication: `${majuscule(POURCENTS[p].nom)} = ${frac(n, d)} = ${frac(p, 100)} = <b>${mesure(p, '%')}</b>.`,
      });
      if (attention && q.choix.includes(mesure(attention[0], '%'))) {
        q.explication += `<br>⚠️ ${attention[1]}, ce n’est pas ${mesure(attention[0], '%')} !`;
      }
      return q;
    }
    const p = parmi([50, 25, 75, 20, 10]);
    const [n, d] = POURCENTS[p].fraction;
    const q = choix({
      consigne: 'Choisis la fraction égale',
      enonce: `${mesure(p, '%')} = ___`,
      reponse: fracTexte(n, d),
      // Le piège : 25 % = 1/25
      pieges: [[1, 2], [1, 4], [3, 4], [1, 5], [1, 10], [1, p]].map(([a, b]) => fracTexte(a, b)),
      explication: `${mesure(p, '%')} = ${frac(p, 100)} = <b>${frac(n, d)}</b> (${POURCENTS[p].nom}).`,
    });
    if (p !== 10 && q.choix.includes(fracTexte(1, p))) q.explication += `<br>⚠️ ${mesure(p, '%')}, ce n’est pas ${frac(1, p)} !`;
    return q;
  }

  function questionAppliquer() {
    if (Math.random() < 0.6) {
      const p = parmi([50, 25, 75, 10, 20]);
      const n = baseDe(p, p === 10 ? 20 : 8, p === 75 ? 120 : 400);
      return nombre({
        consigne: 'Calcule',
        enonce: `${mesure(p, '%')} de ${ecrire(n)} = ___`,
        reponse: net(p * n / 100),
        explication: calculPourcent(p, n),
      });
    }
    const p = parmi([10, 20, 25, 50]);
    const n = p === 25 ? 2 * entier(6, 45) : p === 20 ? 5 * entier(3, 18) : entier(12, 95);
    return nombre({
      consigne: 'Calcule',
      enonce: `Combien font ${mesure(p, '%')} de ${euros(n)} ?`,
      reponse: net(p * n / 100),
      prix: true,
      explication: calculPourcent(p, n, euros),
    });
  }

  function questionAppliquerChoix() {
    const p = parmi([50, 25, 75, 10, 20]);
    const prix = p !== 75 && Math.random() < 0.4;
    const n = prix ? baseDe(p, 12, 90) : baseDe(p, 12, 200);
    const r = net(p * n / 100);
    const e = prix ? euros : ecrire;
    // Les erreurs : enlever le nombre (80 − 25), donner ce qui reste, se tromper de virgule, prendre 10 % (ou 1 %) à la place…
    const candidats = [n - p, p, r * 10, r / 10, p === 10 ? n / 100 : n / 10,
      ...(p === 50 ? [n / 4, n / 5, r + 5, r - 5] : [n - r, n / 2])];
    return choix({
      consigne: 'Choisis le bon résultat',
      enonce: `${mesure(p, '%')} de ${e(n)} = ___`,
      reponse: e(r),
      pieges: positifs(candidats).filter(auCentieme).map(e),
      explication: calculPourcent(p, n, e)
        // (pas d'avertissement quand la soustraction tombe par hasard sur la bonne réponse : 50 % de 100)
        + (n > p && net(n - p) !== net(r) ? `<br>⚠️ Ce n’est pas ${ecrire(n)} − ${ecrire(p)} : on ne soustrait pas ${ecrire(p)}, on prend ${POURCENTS[p].nom}.` : ''),
    });
  }

  // Les soldes
  const ARTICLES = [
    { nom: 'un pull', min: 20, max: 60 }, { nom: 'un jeu de société', min: 16, max: 48 },
    { nom: 'des baskets', min: 40, max: 90, pluriel: true }, { nom: 'un sac à dos', min: 20, max: 50 },
    { nom: 'une trousse', min: 8, max: 20 }, { nom: 'un livre', min: 10, max: 24 },
    { nom: 'un vélo', min: 120, max: 300 }, { nom: 'une lampe', min: 12, max: 40 },
  ];

  function questionSoldes() {
    const A = parmi(ARTICLES);
    const p = parmi([10, 20, 25, 50]);
    const prix = baseDe(p, A.min, A.max);
    const reduction = net(p * prix / 100);
    const nouveau = net(prix - reduction);
    const debut = `Pendant les soldes, ${A.nom} à ${euros(prix)} ${A.pluriel ? 'sont' : 'est'} à ${MOINS}${mesure(p, '%')}.`;
    if (Math.random() < 0.45) {
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${debut} Quel est le montant de la réduction ?`,
        reponse: reduction,
        prix: true,
        explication: `La réduction, c’est ${mesure(p, '%')} du prix.<br>${calculPourcent(p, prix, euros)}`,
      });
    }
    return nombre({
      consigne: 'Résous le problème',
      enonce: `${debut} Quel est ${A.pluriel ? 'leur' : 'son'} nouveau prix ?`,
      reponse: nouveau,
      prix: true,
      explication: `La réduction : ${mesure(p, '%')} de ${euros(prix)} = ${COMMENT[p](prix, euros)} = ${euros(reduction)}.<br>`
        + `Le nouveau prix : ${euros(prix)} − ${euros(reduction)} = <b>${euros(nouveau)}</b>.`
        + (euros(p) !== euros(reduction) ? `<br>⚠️ On n’enlève pas ${euros(p)}, mais ${mesure(p, '%')} du prix !` : ''),
    });
  }

  const ACTIVITES = ['font du judo', 'mangent à la cantine', 'ont un chat', 'jouent d’un instrument', 'portent des lunettes', 'viennent à vélo'];

  function questionEleves() {
    const p = parmi([10, 20, 25, 50, 75]);
    // (pour 10 % et 20 %, une classe de 20 ou 30 élèves : jamais « 2,5 élèves » dans le calcul)
    const total = parmi(p === 10 || p === 20 ? [20, 30] : [20, 24, 28, 30, 32].filter(t => t * p % 100 === 0));
    const r = total * p / 100;
    const activite = parmi(ACTIVITES);
    return choix({
      consigne: 'Résous le problème',
      enonce: `Dans une classe de ${ecrire(total)} élèves, ${mesure(p, '%')} ${activite}. Combien d’élèves cela fait-il ?`,
      reponse: r,
      // des pièges qui ne dépassent pas le nombre d'élèves de la classe
      pieges: positifs([p, total - r, total - p, total / 2, r * 2, p / 10, total / 4, r + 2, r - 2])
        .filter(v => Number.isInteger(v) && v <= total),
      explication: `${calculPourcent(p, total)}<br>Donc ${combien(r, 'élève')} ${activite}.`,
    });
  }

  // Retrouver le pourcentage : 3 parts sur 12, c'est le quart, donc 25 %
  function questionRetrouver() {
    const p = parmi([50, 25, 75, 10]);
    const [n, d] = POURCENTS[p].fraction;
    const fois = d === 10 ? entier(2, 5) : d === 2 ? entier(2, 10) : entier(2, 6);
    const total = d * fois;
    const part = n * fois;
    const e = parmi(ENFANTS);
    const textes = [`Sur les ${ecrire(total)} billes du sac, ${ecrire(part)} sont bleues. Quel est le pourcentage de billes bleues ?`];
    // Un bon score au quiz (50 % ou 75 %), une tarte de 12 parts au plus
    if (p === 50 || p === 75) textes.push(`${e.nom} a réussi ${ecrire(part)} des ${ecrire(total)} questions du quiz. Quel est son pourcentage de bonnes réponses ?`);
    if (total <= 12) textes.push(`Sur les ${ecrire(total)} parts de la tarte, ${ecrire(part)} ont été mangées. Quel pourcentage de la tarte a été mangé ?`);
    // Les pièges : la part ou le total pris pour le pourcentage, le reste, le dénominateur, part × 10, une autre fraction simple
    const voisins = { 50: [25, 75], 75: [25, 100], 25: [50, 20], 10: [1, 20] };
    return choix({
      consigne: 'Trouve le pourcentage',
      enonce: parmi(textes),
      reponse: mesure(p, '%'),
      pieges: [part, total, 100 - p, d, part * 10, ...voisins[p]].filter(v => v > 0 && v <= 100).map(v => mesure(v, '%')),
      explication: `${ecrire(part)} sur ${ecrire(total)} : ${frac(part, total)} = ${frac(n, d)} = ${frac(p, 100)} = <b>${mesure(p, '%')}</b> (${POURCENTS[p].nom}).`,
    });
  }

  function vraiFauxPourcent() {
    const vrai = Math.random() < 0.5;
    if (Math.random() < 0.6) {
      const p = parmi([50, 25, 75, 10, 20]);
      const n = baseDe(p, 12, 200);
      const r = net(p * n / 100);
      const faux = parmi(positifs([n - p, n - r, r * 10]).filter(v => v !== r));
      return vraiFaux({
        enonce: `${mesure(p, '%')} de ${ecrire(n)} = ${ecrire(vrai ? r : faux)}`,
        vrai,
        explication: calculPourcent(p, n),
      });
    }
    const p = parmi([50, 25, 75, 20, 10]);
    const [n, d] = POURCENTS[p].fraction;
    const nom = vrai ? POURCENTS[p].nom : parmi(Object.values(POURCENTS).map(x => x.nom).filter(x => x !== POURCENTS[p].nom));
    return vraiFaux({
      enonce: `Prendre ${mesure(p, '%')} d’une quantité, c’est en prendre ${nom}.`,
      vrai,
      explication: `${mesure(p, '%')} = ${frac(p, 100)} = ${frac(n, d)}, c’est-à-dire <b>${POURCENTS[p].nom}</b>.`,
    });
  }

  ajouterEtape({
    id: '6e-donnees-pourcentages',
    banque: ['fraction', 'appliquer', 'appliquer', 'appliquerChoix', 'appliquerChoix', 'soldes', 'soldes',
      'eleves', 'retrouver', 'retrouver', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'fraction') return questionPourcentFraction();
      if (sorte === 'appliquer') return questionAppliquer();
      if (sorte === 'appliquerChoix') return questionAppliquerChoix();
      if (sorte === 'soldes') return questionSoldes();
      if (sorte === 'eleves') return questionEleves();
      if (sorte === 'retrouver') return questionRetrouver();
      return vraiFauxPourcent();
    },
    titreLecon: 'Les pourcentages',
    lecon: `
      <p>« 25&nbsp;% » se lit « 25 pour cent » : c’est <b>25 sur 100</b>, c’est-à-dire ${frac(25, 100)}.</p>
      <table>
        <tr><th>Pourcentage</th><th>C’est…</th><th>Pour le calculer</th></tr>
        <tr><td>100&nbsp;%</td><td>le tout</td><td>on garde tout</td></tr>
        <tr><td>50&nbsp;%</td><td>la moitié</td><td>÷ 2</td></tr>
        <tr><td>25&nbsp;%</td><td>le quart</td><td>÷ 4</td></tr>
        <tr><td>75&nbsp;%</td><td>les trois quarts</td><td>÷ 4, puis × 3</td></tr>
        <tr><td>20&nbsp;%</td><td>le cinquième</td><td>÷ 10, puis × 2</td></tr>
        <tr><td>10&nbsp;%</td><td>le dixième</td><td>÷ 10</td></tr>
      </table>
      <h4>⭐ Nouveau en 6e : appliquer un pourcentage</h4>
      <p>👉 <i>25&nbsp;% de 80 = 80 ÷ 4 = 20</i> · <i>10&nbsp;% de 35&nbsp;€ = 3,50&nbsp;€</i> ·
        <i>20&nbsp;% des 30 élèves : 10&nbsp;% de 30 = 3, donc 20&nbsp;% = 2 × 3 = 6 élèves</i></p>
      <p>⭐ <b>Les soldes :</b> <i>un pull à 40&nbsp;€ est à −25&nbsp;%. La réduction : 25&nbsp;% de 40&nbsp;€ = 10&nbsp;€.
        Le nouveau prix : 40 − 10 = 30&nbsp;€.</i></p>
      <h4>Retrouver un pourcentage</h4>
      <p>👉 <i>3 billes bleues sur 12 : ${frac(3, 12)} = ${frac(1, 4)} = 25&nbsp;%.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour 20&nbsp;%, 30&nbsp;%…, calcule d’abord 10&nbsp;% (÷ 10), puis multiplie :
        20&nbsp;%, c’est 2 fois 10&nbsp;%.</div>
      <p>⚠️ 25&nbsp;% de 80, ce n’est pas 80 − 25 : c’est le quart de 80 !</p>
    `,
  });

  // ======================================================================
  // 6. Les échelles ⭐
  // ======================================================================
  // Une longueur donnée en cm, écrite dans l'unité la plus simple : 250 cm → 2,5 m ; 250 000 cm → 2,5 km
  function longueur(cm) {
    if (cm < 100) return mesure(net(cm), 'cm');
    if (cm < 100000) return mesure(net(cm / 100), 'm');
    return mesure(net(cm / 100000), 'km');
  }
  // À partir de 1/10 000, c'est une carte
  const support = n => (n >= 10000 ? { un: 'une carte', le: 'la carte' } : { un: 'un plan', le: 'le plan' });
  // Les plans et les cartes : ce qu'on y mesure, les échelles qui leur vont, et les longueurs réelles vraisemblables (en m)
  // textes : « 1 cm représente … » ([nombre, unité]) ; fractions : 1/100, 1/1 000…
  const PLANS = [
    { support: 'le plan de la maison', court: 'le plan', choses: ['la chambre', 'le salon', 'la cuisine', 'le couloir'],
      textes: [[1, 'm'], [2, 'm']], fractions: [100, 200], reel: [2, 7] },
    { support: 'le plan du parc', court: 'le plan', choses: ['l’allée', 'la pelouse', 'le bassin', 'le terrain de jeux'],
      textes: [[10, 'm'], [20, 'm'], [50, 'm']], fractions: [500, 1000], reel: [15, 400] },
    { support: 'la carte de la forêt', court: 'la carte', choses: ['le chemin', 'le sentier', 'la piste cyclable'],
      textes: [[100, 'm'], [200, 'm'], [500, 'm'], [1, 'km']], fractions: [10000, 25000], reel: [200, 6000] },
    { support: 'la carte de la région', court: 'la carte', choses: ['la route', 'la rivière', 'le canal'],
      textes: [[2, 'km'], [5, 'km'], [10, 'km']], fractions: [100000], reel: [4000, 80000] },
  ];
  const CM_PAR = { m: 100, km: 100000 };

  // Une échelle pour ce plan : { cm (1 cm du plan = combien de cm en vrai), unite (m ou km), valeur, n (1/n), fraction }
  function echelleDe(P, fraction) {
    if (fraction) {
      const n = parmi(P.fractions);
      return { n, cm: n, unite: n >= 100000 ? 'km' : 'm', valeur: n / (n >= 100000 ? 100000 : 100), fraction };
    }
    const [valeur, unite] = parmi(P.textes);
    return { cm: valeur * CM_PAR[unite], unite, valeur, fraction };
  }
  // Une longueur sur le plan (en cm), pour que la longueur réelle soit vraisemblable
  // (des demi-centimètres, sauf à l'échelle 1/25 000 : 3,5 × 250, c'est trop dur de tête)
  function distancePlan(E, [min, max]) {
    const possibles = [];
    const pas = E.cm === 25000 ? 1 : 0.5;
    for (let d = 2 - pas; d <= 15; d += pas) {
      const m = d * E.cm / 100;
      if (m >= min && m <= max) possibles.push(d);
    }
    return parmi(possibles);
  }
  // « Sur le plan de la maison, 1 cm représente 2 m. » ou « Le plan de la maison est à l’échelle 1/100. »
  const phraseEchelle = (P, E) => (E.fraction
    ? `${majuscule(P.support)} est à l’échelle ${frac(1, E.n)}.`
    : `Sur ${P.support}, 1${ESPACE}cm représente ${mesure(E.valeur, E.unite)}.`);
  const unCentimetre = (P, E) => (E.fraction
    ? `À l’échelle ${frac(1, E.n)}, 1${ESPACE}cm sur ${P.court} représente ${mesure(E.n, 'cm')} en vrai, soit ${longueur(E.n)}.`
    : `1${ESPACE}cm représente ${mesure(E.valeur, E.unite)}.`);

  function questionReelle() {
    const P = parmi(PLANS);
    const E = echelleDe(P, Math.random() < 0.5);
    const d = distancePlan(E, P.reel);
    const reel = net(d * E.valeur);
    return nombre({
      consigne: 'Calcule la longueur réelle',
      enonce: `${phraseEchelle(P, E)} Sur ${P.court}, ${parmi(P.choses)} mesure ${mesure(d, 'cm')} de long. Quelle est sa longueur réelle ?`,
      reponse: reel,
      unite: E.unite,
      explication: `${unCentimetre(P, E)}<br>Du plan vers la réalité, on multiplie : ${ecrire(d)} × ${mesure(E.valeur, E.unite)} = <b>${mesure(reel, E.unite)}</b>.`,
    });
  }

  function questionPlan() {
    const P = parmi(PLANS);
    const E = echelleDe(P, Math.random() < 0.5);
    const d = distancePlan(E, P.reel);
    const reel = net(d * E.valeur);
    return nombre({
      consigne: 'Calcule la longueur sur le plan',
      enonce: `${phraseEchelle(P, E)} En vrai, ${parmi(P.choses)} mesure ${mesure(reel, E.unite)} de long. Quelle est sa longueur sur ${P.court} ?`,
      reponse: d,
      unite: 'cm',
      explication: `${unCentimetre(P, E)}<br>`
        + (E.valeur === 1
          ? `Il faut 1${ESPACE}cm pour chaque ${E.unite === 'km' ? 'kilomètre' : 'mètre'} : <b>${mesure(d, 'cm')}</b> sur ${P.court}.`
          : `De la réalité vers le plan, on divise : ${ecrire(reel)} ÷ ${ecrire(E.valeur)} = ${ecrire(d)}, donc <b>${mesure(d, 'cm')}</b> sur ${P.court}.`),
    });
  }

  // Une échelle en fraction : le piège, c'est d'oublier de convertir les centimètres (il est toujours sur un bouton)
  function questionConversion() {
    const P = parmi(PLANS);
    const E = echelleDe(P, true);
    const d = entier(2, 9);
    const reel = net(d * E.valeur);
    const q = v => mesure(v, E.unite);
    // On choisit soi-même les deux autres pièges, pour que la réponse soit tantôt 1re, tantôt 2e, tantôt 3e
    const dessous = RM.melanger(positifs([reel / 10, reel / 100, (d - 1) * E.valeur]));
    const dessus = RM.melanger([reel * 10, (d + 1) * E.valeur]);
    const combienDessous = entier(0, 2);
    const autres = [...dessous.slice(0, combienDessous), ...dessus.slice(0, 2 - combienDessous)];
    return choix({
      consigne: 'Choisis la bonne longueur',
      enonce: `${majuscule(P.court)} est à l’échelle ${frac(1, E.n)}. Que représentent ${mesure(d, 'cm')} sur ${P.court} ?`,
      reponse: q(reel),
      pieges: [reel * 100, ...autres].map(q),
      explication: `1${ESPACE}cm sur ${P.court} = ${mesure(E.n, 'cm')} en vrai = ${longueur(E.n)}.<br>${ecrire(d)} × ${longueur(E.n)} = <b>${q(reel)}</b>.`
        + `<br>⚠️ ${ecrire(d)} × ${ecrire(E.n)} = ${ecrire(d * E.n)} : ce sont des <b>centimètres</b>, il faut convertir !`,
    });
  }

  // Le sens : du plan vers la réalité on multiplie, de la réalité vers le plan on divise
  function questionSens() {
    const P = parmi(PLANS);
    const [v, u] = parmi(P.textes.filter(([x]) => x > 1));
    const d = entier(3, 9);
    const reel = net(d * v);
    const consigne = 'Choisis la bonne longueur';
    if (Math.random() < 0.5) {
      return choix({
        consigne,
        enonce: `Sur ${P.court}, 1${ESPACE}cm représente ${mesure(v, u)}. Quelle longueur sur ${P.court} représente ${mesure(reel, u)} ?`,
        reponse: mesure(d, 'cm'),
        // oublier de diviser (160 m → 160 cm), une erreur de virgule, un centimètre de trop ou de moins
        pieges: positifs([reel, d * 10, d + 1, d - 1, d + 2, d - 2]).map(x => mesure(x, 'cm')),
        explication: `On cherche combien de fois ${mesure(v, u)} il y a dans ${mesure(reel, u)} : c’est une <b>division</b>.<br>`
          + `${ecrire(reel)} ÷ ${ecrire(v)} = ${ecrire(d)}, donc <b>${mesure(d, 'cm')}</b>.`,
      });
    }
    return choix({
      consigne,
      enonce: `Sur ${P.court}, 1${ESPACE}cm représente ${mesure(v, u)}. Que représentent ${mesure(d, 'cm')} ?`,
      reponse: mesure(reel, u),
      pieges: positifs([d + v, reel * 10, reel / 10, v, (d + 1) * v, (d - 1) * v]).map(x => mesure(x, u)),
      explication: `Du plan vers la réalité, on <b>multiplie</b> : ${ecrire(d)} × ${mesure(v, u)} = <b>${mesure(reel, u)}</b>.`,
    });
  }

  function questionTrouverEchelle() {
    const P = parmi(PLANS);
    const [v, u] = parmi(P.textes.filter(([x]) => x > 1));
    const d = entier(2, 8);
    const reel = net(d * v);
    return choix({
      consigne: 'Trouve l’échelle',
      enonce: `Sur ${P.court}, ${mesure(d, 'cm')} représentent ${mesure(reel, u)}. Que représente 1${ESPACE}cm ?`,
      reponse: mesure(v, u),
      // oublier de diviser, multiplier au lieu de diviser, diviser par 10 ou par 2 au lieu de diviser par le nombre de cm…
      pieges: positifs([reel, reel * d, v * 10, v / 10, reel / 10, v / 2]).map(x => mesure(x, u)),
      explication: `Pour 1${ESPACE}cm, c’est ${ecrire(d)} fois moins : on divise par ${ecrire(d)}.<br>${ecrire(reel)} ÷ ${ecrire(d)} = <b>${mesure(v, u)}</b>.`,
    });
  }

  // Ce que veut dire 1/n : 1 cm représente n cm (les pièges : un zéro de trop ou de moins, une mauvaise conversion)
  function questionFractionSens() {
    const n = parmi([100, 200, 500, 1000, 10000, 25000, 100000]);
    const S = support(n);
    const bonne = longueur(n);
    return choix({
      consigne: 'Choisis la bonne longueur',
      enonce: `Sur ${S.un} à l’échelle ${frac(1, n)}, que représente 1${ESPACE}cm ?`,
      reponse: bonne,
      // (on écarte « 1 km » quand la réponse est « 1 m » : même nombre, on pourrait la choisir sans lire l'unité)
      pieges: [n * 10, n * 100, n / 10, n * 1000, n / 100].map(longueur).filter(t => lireNombre(t) !== lireNombre(bonne)),
      ordre: 'melange',
      explication: `${frac(1, n)} veut dire : 1${ESPACE}cm sur ${S.le} représente ${mesure(n, 'cm')} en vrai.<br>Et ${mesure(n, 'cm')} = <b>${bonne}</b>.`,
    });
  }

  function vraiFauxEchelle() {
    const vrai = Math.random() < 0.5;
    const forme = parmi(['fraction', 'texte', 'sens']);
    if (forme === 'fraction') {
      const n = parmi([100, 1000, 10000, 25000, 100000]);
      const S = support(n);
      const faux = parmi([n * 10, n / 10, n * 100].map(longueur).filter(t => lireNombre(t) !== lireNombre(longueur(n))));
      return vraiFaux({
        enonce: `Sur ${S.un} à l’échelle ${frac(1, n)}, 1${ESPACE}cm représente ${vrai ? longueur(n) : faux}.`,
        vrai,
        explication: `${frac(1, n)} : 1${ESPACE}cm sur ${S.le} représente ${mesure(n, 'cm')} en vrai, c’est-à-dire <b>${longueur(n)}</b>.`,
      });
    }
    if (forme === 'texte') {
      const P = parmi(PLANS);
      const [v, u] = parmi(P.textes.filter(([x]) => x > 1));
      const d = entier(2, 9);
      const bon = d * v;
      const faux = parmi(positifs([d + v, bon + v, bon - v]).filter(x => x !== bon));
      return vraiFaux({
        enonce: `Sur ${P.court}, 1${ESPACE}cm représente ${mesure(v, u)}. Donc ${mesure(d, 'cm')} représentent ${mesure(vrai ? bon : faux, u)}.`,
        vrai,
        explication: `Du plan vers la réalité, on multiplie : ${ecrire(d)} × ${mesure(v, u)} = <b>${mesure(bon, u)}</b>.`,
      });
    }
    const n = parmi([100, 200, 1000, 25000]);
    const S = support(n);
    return vraiFaux({
      enonce: `À l’échelle ${frac(1, n)}, les longueurs sur ${S.le} sont ${ecrire(n)} fois plus ${vrai ? 'petites' : 'grandes'} qu’en vrai.`,
      vrai,
      explication: `Sur ${S.un}, tout est plus <b>petit</b> qu’en vrai : à l’échelle ${frac(1, n)}, 1${ESPACE}cm sur ${S.le} représente ${mesure(n, 'cm')} en vrai.`,
    });
  }

  ajouterEtape({
    id: '6e-donnees-echelles',
    banque: ['reelle', 'reelle', 'plan', 'conversion', 'conversion', 'sens', 'trouver', 'fractionSens', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'reelle') return questionReelle();
      if (sorte === 'plan') return questionPlan();
      if (sorte === 'conversion') return questionConversion();
      if (sorte === 'sens') return questionSens();
      if (sorte === 'trouver') return questionTrouverEchelle();
      if (sorte === 'fractionSens') return questionFractionSens();
      return vraiFauxEchelle();
    },
    titreLecon: 'Les échelles',
    lecon: `
      <p>⭐ <b>Nouveau en 6e :</b> sur un plan ou une carte, les longueurs sont <b>proportionnelles</b> aux longueurs réelles.
        L’<b>échelle</b> dit ce que représente 1&nbsp;cm.</p>
      <h4>« 1&nbsp;cm représente 50&nbsp;m »</h4>
      <p>Du plan vers la réalité, on <b>multiplie</b> : <i>4&nbsp;cm → 4 × 50 = 200&nbsp;m.</i><br>
        De la réalité vers le plan, on <b>divise</b> : <i>300&nbsp;m → 300 ÷ 50 = 6&nbsp;cm.</i></p>
      <h4>⭐ L’échelle en fraction</h4>
      <p>À l’échelle ${frac(1, 1000)}, 1&nbsp;cm sur le plan représente <b>1&nbsp;000&nbsp;cm</b> en vrai, c’est-à-dire 10&nbsp;m :
        les longueurs du plan sont <b>1&nbsp;000 fois plus petites</b> que les vraies (dans la même unité).</p>
      ${tableau([['Échelle', frac(1, 100), frac(1, 1000), frac(1, 25000), frac(1, 100000)], ['1&nbsp;cm représente', '1&nbsp;m', '10&nbsp;m', '250&nbsp;m', '1&nbsp;km']])}
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> avec une échelle en fraction, calcule d’abord en <b>centimètres</b>, puis convertis :
        <i>7 × 1&nbsp;000 = 7&nbsp;000&nbsp;cm = 70&nbsp;m</i>.</div>
      <p>⚠️ Deux pièges : oublier de <b>convertir</b> (7&nbsp;000&nbsp;cm, ce n’est pas 7&nbsp;000&nbsp;m !)
        et se tromper de <b>sens</b> (sur le plan, les longueurs sont plus <b>petites</b> qu’en vrai).</p>
    `,
  });
})();
