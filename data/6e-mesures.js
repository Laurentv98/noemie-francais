// Renard Malin — Maths, niveau 6e : les 6 étapes du Moulin des Mesures
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.

(function () {
  const {
    ESPACE, MOINS, entier, parmi, decimal, net, ecrire, mesure, decimalesDe, lireNombre, egaux,
    choix, nombre, vraiFaux, ajouterEtape, figures,
  } = RM.maths;

  // ======================================================================
  // Les petits outils communs à toutes les étapes
  // ======================================================================
  // Des prénoms, avec le pronom qui va avec (pour écrire « a-t-elle » ou « a-t-il »)
  const PRENOMS = [['Léa', 'elle'], ['Tom', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Inès', 'elle'],
    ['Sami', 'il'], ['Lina', 'elle'], ['Noé', 'il'], ['Mamie', 'elle'], ['Papi', 'il']];
  // Vrai une fois sur deux (ou avec la probabilité donnée)
  const auHasard = (probabilite = 0.5) => Math.random() < probabilite;
  // Des guillemets français, avec des espaces qui ne se coupent pas
  const guillemets = texte => `«${ESPACE}${texte}${ESPACE}»`;
  // Une majuscule au début d’une phrase
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);
  // Les signes pour comparer (en HTML, < et > s’écrivent &lt; et &gt;)
  const SIGNES = { '<': '&lt;', '>': '&gt;', '=': '=' };
  const signe = (a, b) => (net(a) < net(b) ? '<' : net(a) > net(b) ? '>' : '=');

  // Les pièges valables : sans doublons, sans les valeurs vides, et sans ceux qui valent autant que la réponse
  // (« 3,50 » vaut autant que « 3,5 »). Quand les boutons sont des nombres, le moteur choisit ensuite lui-même
  // parmi eux, pour que la bonne réponse ne soit pas toujours à la même place : on lui en donne 5 ou 6,
  // des plus petits et des plus grands que la réponse.
  function meilleursPieges(reponse, pieges) {
    const ecrit = v => (typeof v === 'number' ? ecrire(v) : String(v));
    const valeurReponse = lireNombre(ecrit(reponse));
    const vus = new Set([ecrit(reponse)]);
    const gardes = [];
    pieges.forEach(p => {
      if (p === null || p === undefined || (typeof p === 'number' && !(p > 0)) || vus.has(ecrit(p))) return;
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

  // Écrire une longueur le long d’un côté [AB], à l’extérieur de la figure (G : un point à l’intérieur)
  function longueurDehors(A, B, texte, G) {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u = [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
    const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    // figures.longueur écrit du côté (−u[1], u[0]) ; si ce côté va vers G, on prend l’autre
    const versG = (G[0] - M[0]) * -u[1] + (G[1] - M[1]) * u[0];
    // Plus loin d’un côté presque vertical : le texte est plus large que haut
    return figures.longueur(A, B, texte, { cote: versG > 0 ? -1 : 1, distance: 18 + 26 * Math.abs(u[1]) });
  }

  // ======================================================================
  // Les conversions (pour les longueurs, les masses et les contenances)
  // ======================================================================
  // Chaque unité avec sa place dans le tableau de conversion, par rapport à l’unité de base
  // (km : 3, car 1 km = 10 × 10 × 10 m ; mm : −3, car 1 m = 1 000 mm)
  const LONGUEURS = { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 };
  const MASSES = { t: 6, kg: 3, g: 0, mg: -3 };
  const CONTENANCES = { hL: 2, L: 0, dL: -1, cL: -2, mL: -3 };
  // Les conversions qu’on rencontre le plus souvent : [la grande unité, la petite]
  const PAIRES_LONGUEURS = [['km', 'm'], ['km', 'm'], ['m', 'cm'], ['m', 'cm'], ['m', 'mm'], ['cm', 'mm'], ['cm', 'mm'],
    ['m', 'dm'], ['dm', 'cm'], ['dm', 'mm'], ['hm', 'm'], ['dam', 'm']];
  const PAIRES_MASSES = [['kg', 'g'], ['kg', 'g'], ['kg', 'g'], ['g', 'mg'], ['g', 'mg'], ['t', 'kg']];
  const PAIRES_CONTENANCES = [['L', 'cL'], ['L', 'cL'], ['L', 'mL'], ['L', 'mL'], ['L', 'dL'], ['cL', 'mL'], ['dL', 'cL'],
    ['dL', 'mL'], ['hL', 'L']];
  const RANGS = { 1: 'd’un rang', 2: 'de 2 rangs', 3: 'de 3 rangs' };

  // Multiplier par 10, 100 ou 1 000 (k rangs) ; si k est négatif, on divise
  const decaler = (x, k) => net(k >= 0 ? x * 10 ** k : x / 10 ** -k);

  // Un nombre à convertir de k rangs, et le résultat : au plus 3 chiffres après la virgule, et pas plus de 100 000
  function nombresAConvertir(k) {
    const departs = k > 0
      ? [() => entier(2, 99), () => entier(101, 999), () => decimal(0.1, 9.9, 1), () => decimal(10, 99, 1), () => decimal(1, 9.99, 2)]
      : [() => entier(2, 99), () => entier(101, 999), () => entier(1001, 9999), () => decimal(10, 99, 1)];
    for (;;) {
      const a = parmi(departs)();
      const b = decaler(a, k);
      if (decimalesDe(b) <= 3 && b <= 100000) return [a, b];
    }
  }

  // Une conversion au hasard, dans un sens ou dans l’autre
  function tirerConversion(paires, unites) {
    const [grande, petite] = parmi(paires);
    const [de, vers] = auHasard() ? [grande, petite] : [petite, grande];
    const k = unites[de] - unites[vers];
    const [a, b] = nombresAConvertir(k);
    return { a, b, de, vers, k };
  }

  // Les erreurs classiques : se tromper de sens, un rang de trop ou de moins (ou pas de conversion du tout),
  // ajouter des zéros après la virgule (3,5 → 3,500), oublier la virgule (86,5 → 865).
  // Le moteur choisit parmi elles (des pièges plus petits et plus grands que la réponse).
  function piegesConversion(a, k) {
    const s = Math.sign(k);
    // (un piège peut avoir 4 chiffres après la virgule : c’est justement l’erreur d’un rang, 0,045 → 0,0045)
    const possible = p => typeof p === 'string' || (p >= 0.0001 && p < 1e7 && decimalesDe(p) <= 4);
    const zeros = k > 0 && !Number.isInteger(a) ? [ecrire(a) + '0'.repeat(k)] : [];
    // j = 0 : le nombre n’est pas converti du tout
    // (pas les deux à la fois : « 3,5 » et « 3,500 » seraient deux boutons égaux)
    const decalages = [-k, k + s, k - s, k + 2 * s, k + 3 * s, k - 2 * s].filter(j => j !== k && !(j === 0 && zeros.length));
    const sansVirgule = Number.isInteger(a) ? [] : [Number(ecrire(a).replace(/\D/g, ''))];
    return meilleursPieges(decaler(a, k), [...decalages.map(j => decaler(a, j)), ...zeros, ...sansVirgule].filter(possible));
  }

  // Pourquoi on multiplie ou on divise : « 1 m = 100 cm : l’unité est plus petite, il en faut plus »
  function expliquerConversion(a, de, vers, unites) {
    const k = unites[de] - unites[vers];
    const f = 10 ** Math.abs(k);
    const fin = `<br>${mesure(a, de)} = <b>${mesure(decaler(a, k), vers)}</b>`;
    if (k > 0) {
      return `${mesure(1, de)} = ${mesure(f, vers)} : l’unité d’arrivée est plus petite, il en faut <b>plus</b>. `
        + `On multiplie par ${ecrire(f)} : la virgule se décale ${RANGS[k]} vers la droite.${fin}`;
    }
    return `${mesure(1, vers)} = ${mesure(f, de)} : l’unité d’arrivée est plus grande, il en faut <b>moins</b>. `
      + `On divise par ${ecrire(f)} : la virgule se décale ${RANGS[-k]} vers la gauche.${fin}`;
  }

  // Convertir : le nombre à taper
  function questionConvertir(paires, unites) {
    const { a, b, de, vers } = tirerConversion(paires, unites);
    return nombre({
      consigne: 'Convertis',
      enonce: `${mesure(a, de)} = ___${ESPACE}${vers}`,
      reponse: b,
      explication: expliquerConversion(a, de, vers, unites),
    });
  }

  // Convertir : la bonne réponse parmi des boutons
  function questionConvertirChoix(paires, unites) {
    const { a, b, de, vers, k } = tirerConversion(paires, unites);
    const pieges = piegesConversion(a, k);
    const zeros = pieges.find(p => typeof p === 'string');
    const q = sansIndiceDeForme(() => choix({
      consigne: 'Choisis la bonne conversion',
      enonce: `${mesure(a, de)} = ___${ESPACE}${vers}`,
      reponse: b,
      pieges,
      explication: expliquerConversion(a, de, vers, unites),
    }));
    // Si le piège « 3,500 » est affiché, Roxy explique pourquoi il est faux
    if (zeros && q.choix.includes(zeros)) q.explication += `<br>⚠️ Ajouter des zéros après la virgule ne change rien : ${zeros} = ${ecrire(a)}.`;
    return q;
  }

  // Vrai ou faux : une conversion juste, ou avec une erreur classique
  function vraiFauxConversion(paires, unites, vrai) {
    const { a, b, de, vers, k } = tirerConversion(paires, unites);
    const nombres = piegesConversion(a, k).filter(p => typeof p === 'number');
    const faux = nombres.length ? parmi(nombres) : decaler(a, k + Math.sign(k));
    return vraiFaux({
      enonce: `${mesure(a, de)} = ${mesure(vrai ? b : faux, vers)}`,
      vrai,
      explication: expliquerConversion(a, de, vers, unites),
    });
  }

  // Comparer deux mesures écrites dans deux unités différentes : 2,5 km ___ 2 005 m
  function questionComparer(paires, unites) {
    const [grande, petite] = parmi(paires);
    const k = unites[grande] - unites[petite];
    const a = parmi([() => decimal(1, 9.9, 1), () => decimal(1, 9.99, 2), () => entier(2, 9)])();
    const converti = decaler(a, k);
    const [entiere, apresVirgule] = ecrire(a).split(',');
    // Des mesures proches, qui piègent : « 2,5 km = 2 km 5 m », les mêmes chiffres (25 m), un rang de moins (250 m)…
    const proches = [
      converti + parmi([1, 2, 5]) * 10 ** (k - 1),
      converti - parmi([1, 2, 5]) * 10 ** (k - 1),
      decaler(a, k - 1),
    ];
    if (apresVirgule) {
      proches.push(decaler(Number(entiere), k) + Number(apresVirgule), Number(entiere + apresVirgule));
    }
    const possibles = proches.map(net).filter(v => v > 0 && decimalesDe(v) <= 3 && !egaux(v, converti));
    const b = auHasard(0.2) ? converti : parmi(possibles);
    const grandeAGauche = auHasard();
    const [gauche, droite] = grandeAGauche ? [mesure(a, grande), mesure(b, petite)] : [mesure(b, petite), mesure(a, grande)];
    const [vG, vD] = grandeAGauche ? [converti, b] : [b, converti];
    const reponse = signe(vG, vD);
    return choix({
      consigne: 'Compare avec <, > ou =',
      enonce: `${gauche} ___ ${droite}`,
      reponse,
      choix: ['<', '=', '>'],
      explication: `On écrit les deux mesures dans la même unité : ${mesure(a, grande)} = ${mesure(converti, petite)}.<br>`
        + `${mesure(vG, petite)} ${SIGNES[reponse]} ${mesure(vD, petite)}, donc <b>${gauche} ${SIGNES[reponse]} ${droite}</b>.`,
    });
  }

  // Choisir l’unité qui convient : [le début de la phrase, la mesure, l’unité, la fin de la phrase]
  function questionUnite(liste, boutons, reperes) {
    const [debut, valeur, unite, fin] = parmi(liste);
    const phrase = `${debut} ${ecrire(valeur)}${ESPACE}___${fin ? ' ' + fin : ''}.`;
    return choix({
      consigne: 'Choisis l’unité qui convient',
      enonce: phrase,
      reponse: unite,
      choix: boutons,
      explication: `${debut} <b>${mesure(valeur, unite)}</b>${fin ? ' ' + fin : ''}.<br>${reperes}`,
    });
  }

  // ======================================================================
  // 1. Les longueurs
  // ======================================================================
  const PAIRES_COMPARER_LONGUEURS = [['km', 'm'], ['km', 'm'], ['m', 'cm'], ['m', 'cm'], ['m', 'mm'], ['cm', 'mm']];

  const TAILLES = [
    ['Une fourmi mesure environ', 5, 'mm', ''],
    ['Une coccinelle mesure environ', 7, 'mm', ''],
    [`Une pièce de 1${ESPACE}€ a une épaisseur d’environ`, 2, 'mm', ''],
    ['Une gomme mesure environ', 4, 'cm', 'de long'],
    ['Un crayon neuf mesure environ', 18, 'cm', ''],
    ['Un escargot mesure environ', 3, 'cm', ''],
    ['Un ongle mesure environ', 1, 'cm', 'de large'],
    [`À 10${ESPACE}ans, on mesure environ`, 140, 'cm', ''],
    ['Une porte mesure environ', 2, 'm', 'de haut'],
    ['Un lit mesure environ', 2, 'm', 'de long'],
    ['Une girafe mesure environ', 5, 'm', 'de haut'],
    ['Un bus mesure environ', 12, 'm', 'de long'],
    ['Une salle de classe mesure environ', 8, 'm', 'de long'],
    ['Un terrain de football mesure environ', 100, 'm', 'de long'],
    ['La tour Eiffel mesure environ', 300, 'm', 'de haut'],
    ['Une randonnée d’une journée fait environ', 15, 'km', ''],
    ['Un marathon mesure environ', 42, 'km', ''],
    ['Le tour de la Terre mesure environ', 40000, 'km', ''],
  ];
  const REPERES_LONGUEURS = `Des repères : 1${ESPACE}mm, c’est tout petit (un grain de sable) ; 1${ESPACE}cm, la largeur d’un ongle ; `
    + `1${ESPACE}m, un grand pas ; 1${ESPACE}km, environ 15${ESPACE}min de marche.`;

  // Quatre longueurs écrites avec les mêmes chiffres, dans des unités différentes : laquelle est la plus grande ?
  function questionPlusGrande() {
    for (;;) {
      const [x, y, z] = RM.melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      const permutations = RM.melanger([[x, y, z], [x, z, y], [y, x, z], [y, z, x], [z, x, y], [z, y, x]]).slice(0, 4);
      const enMm = permutations.map(([c, d, u]) => (100 * c + 10 * d + u) * parmi([1, 10]));
      const unites = enMm.map(() => parmi(['mm', 'cm', 'dm', 'm']));
      const valeurs = enMm.map((v, i) => decaler(v, LONGUEURS.mm - LONGUEURS[unites[i]]));
      // Deux boutons avec le même nombre (235 mm et 235 cm) : on recommence
      if (new Set(valeurs.map(ecrire)).size < 4 || new Set(unites).size < 3) continue;
      const plusGrande = auHasard();
      const mot = plusGrande ? 'grande' : 'petite';
      const cible = plusGrande ? Math.max(...enMm) : Math.min(...enMm);
      const i = enMm.indexOf(cible);
      // L’erreur à éviter : regarder le nombre sans l’unité. Le plus souvent, ce « raccourci » doit donner une mauvaise réponse
      const naif = valeurs.indexOf(plusGrande ? Math.max(...valeurs) : Math.min(...valeurs));
      if (naif === i && auHasard(0.85)) continue;
      const boutons = valeurs.map((v, j) => mesure(v, unites[j]));
      // La réponse ne doit pas être le seul bouton avec (ou sans) virgule
      const virgules = boutons.filter(b => b.includes(','));
      if (boutons[i].includes(',') ? virgules.length === 1 : virgules.length === 3) continue;
      const enMillimetres = enMm.map((v, j) => (unites[j] === 'mm' ? boutons[j] : `${boutons[j]} = ${mesure(v, 'mm')}`));
      return choix({
        consigne: `Trouve la longueur la plus ${mot}`,
        enonce: `Laquelle de ces longueurs est la plus ${mot} ?`,
        reponse: boutons[i],
        pieges: boutons.filter((b, j) => j !== i),
        ordre: 'melange',
        explication: `On écrit tout dans la même unité, en mm : ${enMillimetres.join(' ; ')}.<br>`
          + `La plus ${mot} est <b>${boutons[i]}</b>.`,
      });
    }
  }

  function problemeLongueurs() {
    const [prenom, pronom] = parmi(PRENOMS);
    const cas = parmi(['course', 'ruban', 'tours', 'pile']);
    if (cas === 'course') {
      const km = decimal(1, 3.9, 1);
      const m = 50 * entier(3, 19);
      const enM = net(km * 1000);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${prenom} court ${mesure(km, 'km')}, puis encore ${mesure(m, 'm')}. `
          + `Quelle distance a-t-${pronom} parcourue en tout, en mètres ?`,
        reponse: enM + m,
        unite: 'm',
        explication: `On écrit tout en mètres : ${mesure(km, 'km')} = ${mesure(enM, 'm')}.<br>`
          + `${ecrire(enM)} + ${ecrire(m)} = <b>${mesure(enM + m, 'm')}</b>.<br>`
          + `⚠️ On n’additionne pas des km et des m : il faut d’abord convertir !`,
      });
    }
    if (cas === 'ruban') {
      const total = parmi([1, 1.5, 2, 2.5, 3]);
      const coupe = 5 * entier(3, 19);
      const enCm = net(total * 100);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${prenom} a un ruban de ${mesure(total, 'm')}. ${majuscule(pronom)} en coupe un morceau de ${mesure(coupe, 'cm')}. `
          + 'Quelle longueur de ruban reste-t-il, en centimètres ?',
        reponse: enCm - coupe,
        unite: 'cm',
        explication: `On écrit tout en centimètres : ${mesure(total, 'm')} = ${mesure(enCm, 'cm')}.<br>`
          + `${ecrire(enCm)} ${MOINS} ${ecrire(coupe)} = <b>${mesure(enCm - coupe, 'cm')}</b>.`,
      });
    }
    if (cas === 'tours') {
      const tour = parmi([250, 300, 400, 500, 600, 750, 800]);
      const n = entier(2, 6);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `Le tour du parc mesure ${mesure(tour, 'm')}. ${prenom} en fait ${n} fois le tour. `
          + `Quelle distance parcourt-${pronom}, en kilomètres ?`,
        reponse: net(tour * n / 1000),
        unite: 'km',
        explication: `${n} × ${ecrire(tour)} = ${mesure(tour * n, 'm')}.<br>`
          + `Et ${mesure(1, 'km')} = ${mesure(1000, 'm')}, donc ${mesure(tour * n, 'm')} = <b>${mesure(net(tour * n / 1000), 'km')}</b>.`,
      });
    }
    const livres = entier(5, 12);
    const epaisseur = entier(2, 5);
    const hauteur = livres * epaisseur;
    return nombre({
      consigne: 'Résous le problème',
      enonce: `${prenom} empile ${livres} livres de ${mesure(epaisseur, 'cm')} d’épaisseur. `
        + 'Quelle est la hauteur de la pile, en mètres ?',
      reponse: net(hauteur / 100),
      unite: 'm',
      explication: `${livres} × ${epaisseur} = ${mesure(hauteur, 'cm')}.<br>`
        + `Et ${mesure(1, 'm')} = ${mesure(100, 'cm')}, donc ${mesure(hauteur, 'cm')} = <b>${mesure(net(hauteur / 100), 'm')}</b>.`,
    });
  }

  ajouterEtape({
    id: '6e-mesures-longueurs',
    banque: ['convertir', 'convertir', 'convertirChoix', 'convertirChoix', 'comparer', 'plusGrande', 'unite', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'convertir') return questionConvertir(PAIRES_LONGUEURS, LONGUEURS);
      if (sorte === 'convertirChoix') return questionConvertirChoix(PAIRES_LONGUEURS, LONGUEURS);
      if (sorte === 'comparer') return questionComparer(PAIRES_COMPARER_LONGUEURS, LONGUEURS);
      if (sorte === 'plusGrande') return questionPlusGrande();
      if (sorte === 'unite') return questionUnite(TAILLES, ['mm', 'cm', 'm', 'km'], REPERES_LONGUEURS);
      if (sorte === 'probleme') return problemeLongueurs();
      return vraiFauxConversion(PAIRES_LONGUEURS, LONGUEURS, auHasard());
    },
    titreLecon: 'Les longueurs',
    lecon: `
      <p>L’unité de base est le <b>mètre (m)</b>. Dans le tableau, chaque unité vaut <b>10 fois</b> celle qui est à sa droite.</p>
      <table>
        <tr><th></th><th>km</th><th>hm</th><th>dam</th><th>m</th><th>dm</th><th>cm</th><th>mm</th></tr>
        <tr><td><i>3,5&nbsp;m = 350&nbsp;cm</i></td><td></td><td></td><td></td><td><b>3</b></td><td>5</td><td>0</td><td></td></tr>
        <tr><td><i>1&nbsp;250&nbsp;m = 1,25&nbsp;km</i></td><td>1</td><td>2</td><td>5</td><td><b>0</b></td><td></td><td></td><td></td></tr>
      </table>
      <p>On écrit le nombre dans le tableau (son chiffre des unités, en gras, dans la colonne de son unité), puis on le lit
        dans la nouvelle unité, en ajoutant des zéros si besoin.</p>
      <p>👉 <i>1&nbsp;km = 1&nbsp;000&nbsp;m</i> · <i>1&nbsp;m = 100&nbsp;cm</i> · <i>1&nbsp;m = 1&nbsp;000&nbsp;mm</i> · <i>1&nbsp;cm = 10&nbsp;mm</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vers une unité <b>plus petite</b>, le nombre devient <b>plus grand</b>
        (m → cm : × 100). Vers une unité <b>plus grande</b>, il devient <b>plus petit</b> (m → km : ÷ 1&nbsp;000).</div>
      <p>⚠️ Pour comparer <i>2,5&nbsp;km</i> et <i>2&nbsp;050&nbsp;m</i>, on écrit tout dans la même unité :
        2&nbsp;500&nbsp;m &gt; 2&nbsp;050&nbsp;m, donc 2,5&nbsp;km &gt; 2&nbsp;050&nbsp;m.</p>
      <p>📏 Des repères : une fourmi ≈ 5&nbsp;mm · un crayon ≈ 18&nbsp;cm · une porte ≈ 2&nbsp;m · un marathon ≈ 42&nbsp;km.</p>
    `,
  });

  // ======================================================================
  // 2. Masses et contenances
  // ======================================================================
  const PAIRES_COMPARER_MASSES = [['kg', 'g'], ['kg', 'g'], ['g', 'mg'], ['t', 'kg']];
  const PAIRES_COMPARER_CONTENANCES = [['L', 'cL'], ['L', 'cL'], ['L', 'mL'], ['cL', 'mL']];
  const masseOuContenance = () => (auHasard()
    ? { paires: PAIRES_MASSES, unites: MASSES, comparer: PAIRES_COMPARER_MASSES }
    : { paires: PAIRES_CONTENANCES, unites: CONTENANCES, comparer: PAIRES_COMPARER_CONTENANCES });

  const POIDS = [
    ['Une pomme pèse environ', 150, 'g', ''],
    ['Un œuf pèse environ', 60, 'g', ''],
    ['Une tablette de chocolat pèse environ', 100, 'g', ''],
    ['Un morceau de sucre pèse environ', 5, 'g', ''],
    [`Une pièce de 1${ESPACE}€ pèse environ`, 7, 'g', ''],
    ['Un chat pèse environ', 4, 'kg', ''],
    ['À la naissance, un bébé pèse environ', 3, 'kg', ''],
    ['Un sac de pommes de terre pèse environ', 5, 'kg', ''],
    ['Une vache pèse environ', 700, 'kg', ''],
    ['Un éléphant pèse environ', 5, 't', ''],
    ['Une baleine bleue pèse environ', 150, 't', ''],
    ['Une voiture pèse environ', 1, 't', ''],
    ['Une fourmi pèse environ', 3, 'mg', ''],
    ['Un grain de riz pèse environ', 20, 'mg', ''],
    ['Un moustique pèse environ', 2, 'mg', ''],
  ];
  const LIQUIDES = [
    ['Une grande bouteille d’eau contient', 1.5, 'L', ''],
    ['Une brique de lait contient', 1, 'L', ''],
    ['Une baignoire contient environ', 150, 'L', ''],
    ['Le réservoir d’une voiture contient environ', 50, 'L', ''],
    ['Une canette de jus contient', 33, 'cL', ''],
    ['Un verre d’eau contient environ', 20, 'cL', ''],
    ['Un bol de chocolat chaud contient environ', 30, 'cL', ''],
    ['Une petite bouteille d’eau contient', 50, 'cL', ''],
    ['Une cuillère à café contient environ', 5, 'mL', ''],
    ['Une cuillère à soupe contient environ', 15, 'mL', ''],
    ['Un tube de dentifrice contient environ', 75, 'mL', ''],
  ];
  const REPERES_MASSES = `Des repères : 1${ESPACE}g, c’est un trombone ; 1${ESPACE}kg, un paquet de farine ; `
    + `1${ESPACE}t = 1${ESPACE}000${ESPACE}kg, une petite voiture ; 1${ESPACE}mg, un grain de sable.`;
  const REPERES_CONTENANCES = `Des repères : 1${ESPACE}L, une brique de lait ; 1${ESPACE}cL, une petite gorgée ; `
    + `1${ESPACE}mL, quelques gouttes. Et 1${ESPACE}L = 100${ESPACE}cL = 1${ESPACE}000${ESPACE}mL.`;

  // Que mesure-t-on avec cette unité ?
  const NOMS_UNITES = [
    ['le gramme (g)', 'une masse'], ['le kilogramme (kg)', 'une masse'], ['le milligramme (mg)', 'une masse'],
    ['la tonne (t)', 'une masse'], ['le litre (L)', 'une contenance'], ['le centilitre (cL)', 'une contenance'],
    ['le millilitre (mL)', 'une contenance'], ['le décilitre (dL)', 'une contenance'], ['le centimètre (cm)', 'une longueur'],
    ['le millimètre (mm)', 'une longueur'], ['le kilomètre (km)', 'une longueur'], ['la minute (min)', 'une durée'],
  ];
  const ETIQUETTES = [
    ['Sur le paquet de farine, on lit', mesure(1, 'kg'), 'une masse'],
    ['Sur le pot de confiture, on lit', mesure(370, 'g'), 'une masse'],
    ['Sur la tablette de chocolat, on lit', mesure(100, 'g'), 'une masse'],
    ['Sur la boîte de sucre, on lit', mesure(1, 'kg'), 'une masse'],
    ['Sur la canette, on lit', mesure(33, 'cL'), 'une contenance'],
    ['Sur la bouteille de lait, on lit', mesure(1, 'L'), 'une contenance'],
    ['Sur la brique de jus, on lit', mesure(20, 'cL'), 'une contenance'],
    ['Sur le flacon de shampooing, on lit', mesure(250, 'mL'), 'une contenance'],
    ['Sur le panneau du chemin, on lit', mesure(3, 'km'), 'une longueur'],
    ['Sur le minuteur de la cuisine, on lit', mesure(8, 'min'), 'une durée'],
  ];
  const GRANDEURS = ['une masse', 'une contenance', 'une longueur', 'une durée'];
  const SENS_GRANDEURS = {
    'une masse': 'une masse, c’est ce que ça pèse (g, kg, t…)',
    'une contenance': 'une contenance, c’est la quantité de liquide qu’un récipient peut contenir (L, cL, mL…)',
    'une longueur': 'une longueur, c’est une distance (m, cm, km…)',
    'une durée': 'une durée, c’est un temps (h, min, s…)',
  };

  function problemeMasses() {
    const [prenom, pronom] = parmi(PRENOMS);
    const cas = parmi(['recette', 'pots', 'verres', 'reste', 'sacs']);
    if (cas === 'recette') {
      const kg = decimal(1.1, 2.4, 1);
      const deja = 50 * entier(2, Math.floor(kg * 20) - 2);
      const enG = net(kg * 1000);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `Pour les crêpes de la fête de l’école, il faut ${mesure(kg, 'kg')} de farine. ${prenom} en a déjà ${mesure(deja, 'g')}. `
          + 'Combien de grammes de farine manque-t-il ?',
        reponse: enG - deja,
        unite: 'g',
        explication: `On écrit tout en grammes : ${mesure(kg, 'kg')} = ${mesure(enG, 'g')}.<br>`
          + `${ecrire(enG)} ${MOINS} ${ecrire(deja)} = <b>${mesure(enG - deja, 'g')}</b>.`,
      });
    }
    if (cas === 'pots') {
      const n = entier(2, 8);
      const g = parmi([125, 250, 300, 400, 450, 500, 750]);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `${prenom} achète ${n} pots de confiture de ${mesure(g, 'g')}. Quelle est la masse des ${n} pots, en kilogrammes ?`,
        reponse: net(n * g / 1000),
        unite: 'kg',
        explication: `${n} × ${ecrire(g)} = ${mesure(n * g, 'g')}.<br>`
          + `Et ${mesure(1, 'kg')} = ${mesure(1000, 'g')}, donc ${mesure(n * g, 'g')} = <b>${mesure(net(n * g / 1000), 'kg')}</b>.`,
      });
    }
    if (cas === 'verres') {
      let litres;
      let verre;
      do {
        litres = parmi([1, 1.5, 2, 3]);
        verre = parmi([10, 15, 20, 25, 30]);
      } while ((litres * 100) % verre !== 0 || litres * 100 / verre < 3 || litres * 100 / verre > 15);
      const enCl = net(litres * 100);
      return nombre({
        consigne: 'Résous le problème',
        enonce: `Une bouteille contient ${mesure(litres, 'L')} de jus. ${prenom} remplit des verres de ${mesure(verre, 'cL')}. `
          + 'Combien de verres peut-on remplir ?',
        reponse: enCl / verre,
        unite: 'verres',
        explication: `On écrit tout en cL : ${mesure(litres, 'L')} = ${mesure(enCl, 'cL')}.<br>`
          + `${ecrire(enCl)} ÷ ${verre} = <b>${enCl / verre}${ESPACE}verres</b>.`,
      });
    }
    if (cas === 'reste') {
      // (une bouteille de lait fait 1 L ; on en boit un verre, 30 cL au plus)
      const litres = decimal(0.4, 0.9, 1);
      const enCl = net(litres * 100);
      const bu = 5 * entier(2, Math.min(6, enCl / 5 - 2));
      return nombre({
        consigne: 'Résous le problème',
        enonce: `Il reste ${mesure(litres, 'L')} de lait dans la bouteille. ${prenom} en boit ${mesure(bu, 'cL')}. `
          + 'Combien de centilitres de lait reste-t-il ?',
        reponse: enCl - bu,
        unite: 'cL',
        explication: `On écrit tout en cL : ${mesure(litres, 'L')} = ${mesure(enCl, 'cL')}.<br>`
          + `${ecrire(enCl)} ${MOINS} ${bu} = <b>${mesure(enCl - bu, 'cL')}</b>.`,
      });
    }
    const kg = entier(2, 5);
    const g = 50 * entier(3, 19);
    return nombre({
      consigne: 'Résous le problème',
      enonce: `${prenom} porte un sac de ${mesure(kg, 'kg')} de pommes et un sac de ${mesure(g, 'g')} de noix. `
        + `Quelle masse porte-t-${pronom} en tout, en grammes ?`,
      reponse: kg * 1000 + g,
      unite: 'g',
      explication: `On écrit tout en grammes : ${mesure(kg, 'kg')} = ${mesure(kg * 1000, 'g')}.<br>`
        + `${ecrire(kg * 1000)} + ${ecrire(g)} = <b>${mesure(kg * 1000 + g, 'g')}</b>.`,
    });
  }

  ajouterEtape({
    id: '6e-mesures-masses-contenances',
    banque: ['convertir', 'convertir', 'convertirChoix', 'convertirChoix', 'grandeur', 'grandeur', 'quelleGrandeur',
      'comparer', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      const { paires, unites, comparer } = masseOuContenance();
      if (sorte === 'convertir') return questionConvertir(paires, unites);
      if (sorte === 'convertirChoix') return questionConvertirChoix(paires, unites);
      if (sorte === 'comparer') return questionComparer(comparer, unites);
      if (sorte === 'grandeur') {
        return unites === MASSES
          ? questionUnite(POIDS, ['mg', 'g', 'kg', 't'], REPERES_MASSES)
          : questionUnite(LIQUIDES, ['mL', 'cL', 'dL', 'L'], REPERES_CONTENANCES);
      }
      if (sorte === 'quelleGrandeur') {
        if (auHasard()) {
          const [unite, grandeur] = parmi(NOMS_UNITES);
          return choix({
            consigne: 'Que mesure cette unité ?',
            enonce: `${majuscule(unite)} sert à mesurer ___.`,
            reponse: grandeur,
            choix: GRANDEURS,
            explication: `${majuscule(unite)} sert à mesurer <b>${grandeur}</b> : ${SENS_GRANDEURS[grandeur]}.`,
          });
        }
        const [debut, quantite, grandeur] = parmi(ETIQUETTES);
        return choix({
          consigne: 'Que mesure-t-on ?',
          enonce: `${debut} ${guillemets(quantite)}. C’est ___.`,
          reponse: grandeur,
          choix: GRANDEURS,
          explication: `${guillemets(quantite)}, c’est <b>${grandeur}</b> : ${SENS_GRANDEURS[grandeur]}.`,
        });
      }
      if (sorte === 'probleme') return problemeMasses();
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['conversion', 'conversion', 'unite', 'melange']);
      if (famille === 'unite') {
        const [unite, grandeur] = parmi(NOMS_UNITES.filter(([, g]) => g === 'une masse' || g === 'une contenance'));
        const autre = grandeur === 'une masse' ? 'une contenance' : 'une masse';
        return vraiFaux({
          enonce: `${majuscule(unite)} sert à mesurer ${vrai ? grandeur : autre}.`,
          vrai,
          explication: `${majuscule(unite)} sert à mesurer <b>${grandeur}</b> : ${SENS_GRANDEURS[grandeur]}.`,
        });
      }
      if (famille === 'melange' && !vrai) {
        const [de, vers] = parmi([['kilogrammes', 'litres'], ['grammes', 'millilitres'], ['litres', 'kilogrammes'],
          ['centilitres', 'grammes']]);
        return vraiFaux({
          enonce: `On peut convertir des ${de} en ${vers}.`,
          vrai: false,
          explication: 'Les g et les kg mesurent une <b>masse</b>, les L et les mL une <b>contenance</b> : '
            + 'ce ne sont pas les mêmes grandeurs, on ne peut <b>pas</b> convertir l’une en l’autre.',
        });
      }
      return vraiFauxConversion(paires, unites, vrai);
    },
    titreLecon: 'Masses et contenances',
    lecon: `
      <h4>Les masses</h4>
      <p>L’unité de base est le <b>gramme (g)</b>. 1&nbsp;kg = 1&nbsp;000&nbsp;g · 1&nbsp;g = 1&nbsp;000&nbsp;mg · 1&nbsp;t = 1&nbsp;000&nbsp;kg</p>
      <table>
        <tr><th>kg</th><th>hg</th><th>dag</th><th>g</th><th>dg</th><th>cg</th><th>mg</th></tr>
        <tr><td>1</td><td>5</td><td>0</td><td>0</td><td></td><td></td><td></td></tr>
      </table>
      <p>👉 <i>1,5&nbsp;kg = 1&nbsp;500&nbsp;g</i> · <i>250&nbsp;g = 0,25&nbsp;kg</i> · <i>2&nbsp;t = 2&nbsp;000&nbsp;kg</i></p>
      <h4>Les contenances</h4>
      <p>L’unité de base est le <b>litre (L)</b>. 1&nbsp;L = 10&nbsp;dL = 100&nbsp;cL = 1&nbsp;000&nbsp;mL</p>
      <table>
        <tr><th>hL</th><th>daL</th><th>L</th><th>dL</th><th>cL</th><th>mL</th></tr>
        <tr><td></td><td></td><td>0</td><td>7</td><td>5</td><td></td></tr>
      </table>
      <p>👉 <i>0,75&nbsp;L = 75&nbsp;cL</i> · <i>1,5&nbsp;L = 150&nbsp;cL</i> · <i>250&nbsp;mL = 25&nbsp;cL</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> on convertit comme les longueurs, chaque colonne vaut 10 fois la suivante.
        Des repères : une pomme ≈ 150&nbsp;g · un chat ≈ 4&nbsp;kg · une grande bouteille d’eau : 1,5&nbsp;L ·
        une cuillère à café ≈ 5&nbsp;mL.</div>
      <p>⚠️ Une <b>masse</b> (g, kg) et une <b>contenance</b> (L, mL) ne mesurent pas la même chose :
        on ne convertit <b>jamais</b> des kg en L !</p>
    `,
  });

  // ======================================================================
  // 3. Les durées
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
  // Un horaire au hasard (les minutes ne tombent jamais pile sur l’heure)
  const horaireAuHasard = (de, a) => 60 * entier(de, a) + 5 * entier(1, 11);
  // Un nombre de minutes (ou de secondes) : souvent un multiple de 5
  const minutesAuHasard = () => (auHasard(0.7) ? 5 * entier(1, 11) : entier(1, 59));

  // Le calcul d’une durée par étapes : jusqu’à l’heure pile, les heures entières, puis les minutes qui restent
  function etapesDuree(t1, t2) {
    const etapes = [];
    let t = t1;
    const heurePile = Math.ceil(t1 / 60) * 60;
    if (heurePile > t1 && heurePile <= t2) { etapes.push([t1, heurePile]); t = heurePile; }
    const derniereHeure = Math.floor(t2 / 60) * 60;
    if (derniereHeure > t) { etapes.push([t, derniereHeure]); t = derniereHeure; }
    if (t2 > t) etapes.push([t, t2]);
    return etapes;
  }
  // enMinutes : la réponse est un nombre de minutes (on additionne tout en minutes : 10 + 60 + 15 = 85 min)
  function expliquerDuree(t1, t2, enMinutes = false) {
    const etapes = etapesDuree(t1, t2);
    const texteEtapes = etapes.map(([a, b]) => `${horaire(a)} → ${horaire(b)} : ${duree(b - a)}`).join(' ; ');
    const D = t2 - t1;
    const resultat = enMinutes ? mesure(D, 'min') : duree(D);
    if (etapes.length === 1) return `${texteEtapes}.<br>La durée est <b>${resultat}</b>.`;
    const debut = `On avance par étapes : ${texteEtapes}.<br>`;
    if (enMinutes) return `${debut}En tout : ${etapes.map(([a, b]) => b - a).join(' + ')} = <b>${resultat}</b>.`;
    // Les heures entières d’un côté, les minutes de l’autre
    const estHeurePleine = ([a, b]) => (b - a) % 60 === 0 && a % 60 === 0;
    const heures = etapes.filter(estHeurePleine).reduce((s, [a, b]) => s + b - a, 0);
    const minutes = etapes.filter(e => !estHeurePleine(e)).map(([a, b]) => b - a);
    const totalMinutes = D - heures;
    if (totalMinutes < 60) return `${debut}En tout : ${etapes.map(([a, b]) => duree(b - a)).join(' + ')} = <b>${resultat}</b>.`;
    // 60 min ou plus : ça fait une heure de plus
    if (!heures) return `${debut}En tout : ${minutes.join(' + ')} = ${mesure(totalMinutes, 'min')} = <b>${resultat}</b>.`;
    const lesMinutes = `Les minutes : ${minutes.join(' + ')} = ${mesure(totalMinutes, 'min')} = ${duree(totalMinutes)}`;
    return `${debut}${lesMinutes}.<br>En tout : ${duree(heures)} + ${duree(totalMinutes)} = <b>${resultat}</b>.`;
  }

  // [la phrase, la durée la plus courte qui convient]
  const DUREES_ENTRE = [
    [(t1, t2) => `Le film commence à ${horaire(t1)} et finit à ${horaire(t2)}. Il dure ___.`, 75],
    [(t1, t2) => `Le train part à ${horaire(t1)} et arrive à ${horaire(t2)}. Le trajet dure ___.`, 25],
    [(t1, t2) => `La balade de Roxy commence à ${horaire(t1)} et finit à ${horaire(t2)}. Elle dure ___.`, 25],
    [(t1, t2) => `Le match commence à ${horaire(t1)} et se termine à ${horaire(t2)}. Il dure ___.`, 60],
  ];
  // [la phrase, la durée la plus courte, la plus longue, les heures de départ possibles]
  const DUREES_EN_MINUTES = [
    [(t1, t2) => `Le cours de piano commence à ${horaire(t1)} et finit à ${horaire(t2)}. Combien de minutes dure-t-il ?`,
      30, 60, [16, 18]],
    [(t1, t2) => `Le gâteau entre dans le four à ${horaire(t1)} et en sort à ${horaire(t2)}. Combien de minutes a-t-il cuit ?`,
      20, 55, [14, 17]],
    [(t1, t2, prenom) => `${prenom} part de la maison à ${horaire(t1)} et arrive à l’école à ${horaire(t2)}. `
      + 'Combien de minutes dure le trajet ?', 10, 40, [7, 8]],
    [(t1, t2) => `La séance de piscine commence à ${horaire(t1)} et finit à ${horaire(t2)}. Combien de minutes dure-t-elle ?`,
      40, 95, [9, 16]],
  ];
  const ARRIVEES = [
    [(t, d) => `Le bus part à ${horaire(t)}. Le trajet dure ${duree(d)}. Il arrive à ___.`, 25, 150],
    [(t, d) => `Le film commence à ${horaire(t)} et dure ${duree(d)}. Il finit à ___.`, 80, 165],
    [(t, d) => `Roxy part se promener à ${horaire(t)}. Elle marche ${duree(d)}. Elle rentre à ___.`, 30, 150],
    [(t, d) => `Le gâteau entre dans le four à ${horaire(t)}. Il cuit ${duree(d)}. Il sort à ___.`, 25, 70],
  ];
  const DEPARTS = [
    [(t, d) => `Le train arrive à ${horaire(t)}, après ${duree(d)} de trajet. Il est parti à ___.`, 25, 170],
    [(t, d) => `Le spectacle finit à ${horaire(t)}. Il a duré ${duree(d)}. Il a commencé à ___.`, 45, 150],
  ];

  // Les égalités à connaître par cœur : [l’énoncé, la réponse, les pièges, l’explication]
  const FAITS_DUREES = [
    [`1${ESPACE}h = ___${ESPACE}min`, 60, [100, 120, 90, 30, 24, 10], 'Une heure, c’est le tour complet de la grande aiguille : <b>60&nbsp;minutes</b>.'],
    [`1${ESPACE}min = ___${ESPACE}s`, 60, [100, 1000, 120, 30, 10, 24], 'Une minute, c’est le tour complet de la trotteuse : <b>60&nbsp;secondes</b>.'],
    [`1${ESPACE}h = ___${ESPACE}s`, 3600, [100, 60, 360, 6000, 36000, 10000],
      `1${ESPACE}h = 60${ESPACE}min et 1${ESPACE}min = 60${ESPACE}s, donc 1${ESPACE}h = 60 × 60 = <b>3${ESPACE}600${ESPACE}s</b>.`],
    [`1${ESPACE}jour = ___${ESPACE}h`, 24, [12, 7, 10, 60, 100, 48], 'Un jour entier (le jour et la nuit), c’est <b>24&nbsp;heures</b>.'],
    [`1${ESPACE}semaine = ___${ESPACE}jours`, 7, [4, 5, 6, 10, 12, 30], 'Du lundi au dimanche : <b>7&nbsp;jours</b>.'],
    [`1${ESPACE}an = ___${ESPACE}mois`, 12, [4, 6, 10, 52, 365, 100], 'De janvier à décembre : <b>12&nbsp;mois</b>.'],
    [`Une année non bissextile dure ___${ESPACE}jours.`, 365, [100, 300, 360, 400, 500, 1000],
      'Une année compte <b>365&nbsp;jours</b> (et 366&nbsp;jours les années bissextiles, qui ont un 29&nbsp;février).'],
    [`1${ESPACE}an ≈ ___${ESPACE}semaines`, 52, [12, 30, 48, 60, 100, 365], '365&nbsp;jours, c’est à peu près 52 × 7 = 364&nbsp;jours : environ <b>52&nbsp;semaines</b>.'],
    [`1${ESPACE}siècle = ___${ESPACE}ans`, 100, [10, 50, 60, 200, 500, 1000], 'Un siècle, c’est <b>100&nbsp;ans</b> (et un millénaire, 1&nbsp;000&nbsp;ans).'],
    [`Une demi-heure = ___${ESPACE}min`, 30, [15, 20, 25, 45, 50, 60], 'Une demi-heure, c’est la moitié de 60&nbsp;min : 60 ÷ 2 = <b>30&nbsp;min</b>.'],
    [`Un quart d’heure = ___${ESPACE}min`, 15, [4, 10, 12, 20, 25, 30], 'Un quart d’heure, c’est 60&nbsp;min partagées en 4 : 60 ÷ 4 = <b>15&nbsp;min</b>.'],
    [`Trois quarts d’heure = ___${ESPACE}min`, 45, [30, 35, 40, 50, 60, 75], 'Un quart d’heure = 15&nbsp;min, donc trois quarts d’heure = 3 × 15 = <b>45&nbsp;min</b>.'],
  ];
  // Pour les calculs : [la grande unité (singulier, pluriel), la petite (singulier, pluriel), combien de petites dans une grande]
  const CALENDRIER = [
    [['semaine', 'semaines'], ['jour', 'jours'], 7, 8],
    [['jour', 'jours'], ['h', 'h'], 24, 5],
    [['an', 'ans'], ['mois', 'mois'], 12, 8],
    [['min', 'min'], ['s', 's'], 60, 8],
  ];
  const avecUnite = (n, [singulier, pluriel]) => `${ecrire(n)}${ESPACE}${n > 1 ? pluriel : singulier}`;

  ajouterEtape({
    id: '6e-mesures-durees',
    banque: ['convertir', 'convertir', 'enHeuresMinutes', 'enHeuresMinutes', 'dureeEntre', 'dureeEntre', 'dureeMinutes',
      'horaireArrivee', 'horaireArrivee', 'calendrier', 'calendrierCalcul', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'convertir') {
        // 2 h 15 min = ___ min, ou 3 min 20 s = ___ s
        const enSecondes = auHasard(0.35);
        const grande = enSecondes ? 'min' : 'h';
        const petite = enSecondes ? 's' : 'min';
        let q = entier(1, enSecondes ? 5 : 4);
        const r = auHasard(0.2) ? 0 : minutesAuHasard();
        if (r === 0) q = entier(2, 6);
        const total = 60 * q + r;
        const ecrit = enSecondes ? dureeS(total) : duree(total);
        const regle = `${mesure(1, grande)} = ${mesure(60, petite)}`;
        let explication;
        if (r === 0) explication = `${regle}, donc ${mesure(q, grande)} = ${q} × 60 = <b>${mesure(total, petite)}</b>.`;
        else if (q === 1) explication = `${regle}.<br>${ecrit} = 60 + ${r} = <b>${mesure(total, petite)}</b>.`;
        else {
          explication = `${regle}, donc ${mesure(q, grande)} = ${q} × 60 = ${mesure(60 * q, petite)}.<br>`
            + `${ecrit} = ${60 * q} + ${r} = <b>${mesure(total, petite)}</b>.`;
        }
        return nombre({
          consigne: 'Convertis',
          enonce: `${ecrit} = ___${ESPACE}${petite}`,
          reponse: total,
          explication,
        });
      }
      if (sorte === 'enHeuresMinutes') {
        // 150 min = 2 h 30 min ; 150 s = 2 min 30 s
        const enSecondes = auHasard(0.35);
        const ecrireDuree = enSecondes ? dureeS : duree;
        const [grande, petite] = enSecondes ? ['min', 's'] : ['h', 'min'];
        const q = entier(1, enSecondes ? 5 : 4);
        const r = minutesAuHasard();
        const n = 60 * q + r;
        // L’erreur des centaines : 150 min = 1 h 50 min
        const centaines = n >= 100 && n % 100 < 60 ? 60 * Math.floor(n / 100) + n % 100 : null;
        // L’erreur de la virgule : 150 min = 2,5 h, lu « 2 h 50 min »
        const virgule = (r * 100) % 60 === 0 && r * 100 / 60 < 60 ? 60 * q + r * 100 / 60 : null;
        const autres = RM.melanger([n + 60, n - 60, r + 10 < 60 ? n + 10 : n - 10]);
        const pieges = meilleursPieges(n, [centaines, virgule, ...autres].filter(v => v !== null && v > 0)).map(ecrireDuree);
        return choix({
          consigne: enSecondes ? 'Convertis en minutes et secondes' : 'Convertis en heures et minutes',
          enonce: `${mesure(n, petite)} = ___`,
          reponse: ecrireDuree(n),
          pieges,
          explication: `${mesure(1, grande)} = ${mesure(60, petite)}. Dans ${mesure(n, petite)}, il y a ${q} fois 60${ESPACE}${petite} `
            + `(${q} × 60 = ${60 * q}) et il reste ${mesure(r, petite)}.<br>${mesure(n, petite)} = <b>${ecrireDuree(n)}</b>.`
            + (centaines !== null || virgule !== null ? '<br>⚠️ On compte par 60, pas par 100 !' : ''),
        });
      }
      if (sorte === 'dureeEntre') {
        // Le plus souvent, les minutes de l’arrivée sont plus petites que celles du départ (c’est là qu’on se trompe)
        let t1;
        let D;
        do {
          t1 = horaireAuHasard(8, 17);
          D = 5 * entier(5, 34);
        } while ((t1 % 60) + (D % 60) <= 60 && auHasard(0.8));
        const t2 = t1 + D;
        // L’erreur classique : soustraire les heures d’un côté, les minutes de l’autre (dans le « bon » sens)
        const naif = 60 * (Math.floor(t2 / 60) - Math.floor(t1 / 60)) + Math.abs(t2 % 60 - t1 % 60);
        const pieges = meilleursPieges(D, [naif, ...RM.melanger([D + 60, D - 60, D + 10, D - 10])].filter(v => v > 0));
        const phrases = DUREES_ENTRE.filter(([, dureeMin]) => D >= dureeMin).map(([phrase]) => phrase);
        return choix({
          consigne: 'Calcule la durée',
          enonce: parmi(phrases)(t1, t2),
          reponse: duree(D),
          pieges: pieges.map(duree),
          explication: expliquerDuree(t1, t2),
        });
      }
      if (sorte === 'dureeMinutes') {
        const [phrase, dMin, dMax, [hMin, hMax]] = parmi(DUREES_EN_MINUTES);
        let t1;
        let D;
        do {
          t1 = horaireAuHasard(hMin, hMax);
          D = 5 * entier(dMin / 5, dMax / 5);
        } while ((t1 % 60) + D <= 60); // on passe toujours par une heure pile
        return nombre({
          consigne: 'Calcule la durée',
          enonce: phrase(t1, t1 + D, parmi(PRENOMS)[0]),
          reponse: D,
          unite: 'min',
          explication: expliquerDuree(t1, t1 + D, true),
        });
      }
      if (sorte === 'horaireArrivee') {
        const aller = auHasard(0.65);
        const [phrase, dMin, dMax] = parmi(aller ? ARRIVEES : DEPARTS);
        let t1;
        let D;
        do {
          t1 = horaireAuHasard(8, 17);
          D = 5 * entier(dMin / 5, dMax / 5);
        } while ((t1 % 60) + (D % 60) < 60 && auHasard(0.8));
        const t2 = t1 + D;
        const [h, m] = [Math.floor(D / 60), D % 60];
        const passeUneHeure = (t1 % 60) + m >= 60;
        // Les étapes du calcul : d’abord les heures, puis les minutes (la dernière étape donne la réponse, en gras)
        const etapes = (depart, sens) => {
          const pas = [];
          if (h) pas.push([mesure(h, 'h'), depart + sens * 60 * h]);
          if (m) pas.push([mesure(m, 'min'), depart + sens * D]);
          return pas.map(([ajout, t], i) => `${sens > 0 ? '+' : MOINS} ${ajout} → ${i === pas.length - 1 ? `<b>${horaire(t)}</b>` : horaire(t)}`)
            .join(' ; ');
        };
        if (aller) {
          // L’erreur classique : oublier l’heure de plus quand les minutes dépassent 60
          const pieges = meilleursPieges(t2, [passeUneHeure ? t2 - 60 : null, ...RM.melanger([t2 + 60, t2 + 10, t2 - 10, t2 - 60])]
            .filter(v => v !== null));
          return choix({
            consigne: 'Trouve l’horaire',
            enonce: phrase(t1, D),
            reponse: horaire(t2),
            pieges: pieges.map(horaire),
            explication: `On part de ${horaire(t1)} : ${etapes(t1, 1)}.`
              + (passeUneHeure ? `<br>⚠️ ${t1 % 60} + ${m} = ${(t1 % 60) + m}${ESPACE}min, c’est 60${ESPACE}min ou plus : `
                + `ça fait ${duree((t1 % 60) + m)}, donc une heure de plus !` : ''),
          });
        }
        // On remonte le temps : l’erreur classique est de soustraire les minutes « dans le bon sens »
        const naif = 60 * (Math.floor(t2 / 60) - h) + Math.abs(t2 % 60 - m);
        const pieges = meilleursPieges(t1, [naif, ...RM.melanger([t1 + 60, t1 - 60, t1 + 10, t1 - 10])]);
        return choix({
          consigne: 'Trouve l’horaire',
          enonce: phrase(t2, D),
          reponse: horaire(t1),
          pieges: pieges.map(horaire),
          explication: `On part de ${horaire(t2)} et on remonte le temps : ${etapes(t2, -1)}.<br>`
            + `Pour vérifier : ${horaire(t1)} + ${duree(D)} = ${horaire(t2)}.`,
        });
      }
      if (sorte === 'calendrier') {
        const [enonce, reponse, pieges, explication] = parmi(FAITS_DUREES);
        return choix({ consigne: 'Complète', enonce, reponse, pieges, explication });
      }
      if (sorte === 'calendrierCalcul') {
        const [grande, petite, f, max] = parmi(CALENDRIER);
        const cas = parmi(['multiplier', 'multiplier', 'diviser', 'mixte']);
        const regle = `1${ESPACE}${grande[0]} = ${avecUnite(f, petite)}`;
        if (cas === 'multiplier') {
          const n = entier(2, max);
          return nombre({
            consigne: 'Convertis',
            enonce: `${avecUnite(n, grande)} = ___${ESPACE}${petite[1]}`,
            reponse: n * f,
            explication: `${regle}, donc ${avecUnite(n, grande)} = ${n} × ${f} = <b>${avecUnite(n * f, petite)}</b>.`,
          });
        }
        if (cas === 'diviser') {
          const n = entier(2, max);
          return nombre({
            consigne: 'Convertis',
            enonce: `${avecUnite(n * f, petite)} = ___${ESPACE}${grande[1]}`,
            reponse: n,
            explication: `${regle}, donc on divise par ${f} : ${ecrire(n * f)} ÷ ${f} = <b>${avecUnite(n, grande)}</b>.`,
          });
        }
        const n = entier(1, max - 1);
        const reste = entier(1, f - 1);
        return nombre({
          consigne: 'Convertis',
          enonce: `${avecUnite(n, grande)} et ${avecUnite(reste, petite)} = ___${ESPACE}${petite[1]}`,
          reponse: n * f + reste,
          explication: `${regle}, donc ${avecUnite(n, grande)} = ${n} × ${f} = ${avecUnite(n * f, petite)}.<br>`
            + `${ecrire(n * f)} + ${reste} = <b>${avecUnite(n * f + reste, petite)}</b>.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['virgule', 'quarts', 'minutes', 'secondes']);
      if (famille === 'virgule') {
        const q = entier(0, 3);
        const juste = duree(60 * q + 30);
        const fausse = q ? `${q}${ESPACE}h${ESPACE}50${ESPACE}min` : `50${ESPACE}min`;
        return vraiFaux({
          enonce: `${mesure(q + 0.5, 'h')} = ${vrai ? juste : fausse}`,
          vrai,
          explication: `${mesure(0.5, 'h')}, c’est une demi-heure : 30${ESPACE}min.<br>${mesure(q + 0.5, 'h')} = <b>${juste}</b>`
            + `${vrai ? '' : `, et pas ${fausse}`} : on compte par 60, pas par 100 !`,
        });
      }
      if (famille === 'quarts') {
        const [nom, juste, fausse] = parmi([['Une demi-heure', 30, 50], ['Un quart d’heure', 15, 25], ['Trois quarts d’heure', 45, 75]]);
        return vraiFaux({
          enonce: `${nom} = ${mesure(vrai ? juste : fausse, 'min')}`,
          vrai,
          explication: `1${ESPACE}h = 60${ESPACE}min. La moitié de 60, c’est 30 ; le quart, 15 ; les trois quarts, 45.<br>`
            + `${nom} = <b>${mesure(juste, 'min')}</b>.`,
        });
      }
      const enSecondes = famille === 'secondes';
      const ecrireDuree = enSecondes ? dureeS : duree;
      const petite = enSecondes ? 's' : 'min';
      let n;
      do { n = 60 * entier(1, 2) + 5 * entier(1, 11); } while (n % 100 >= 60 || n < 100);
      const fausse = 60 * Math.floor(n / 100) + n % 100; // 150 min → « 1 h 50 min »
      return vraiFaux({
        enonce: `${mesure(n, petite)} = ${ecrireDuree(vrai ? n : fausse)}`,
        vrai,
        explication: `${mesure(n, petite)} = ${Math.floor(n / 60)} × 60 + ${n % 60}, donc ${mesure(n, petite)} = <b>${ecrireDuree(n)}</b>.`
          + `<br>⚠️ On compte par 60, pas par 100 !`,
      });
    },
    titreLecon: 'Les durées',
    lecon: `
      <h4>Les unités de durée</h4>
      <p>1&nbsp;h = 60&nbsp;min · 1&nbsp;min = 60&nbsp;s · 1&nbsp;jour = 24&nbsp;h · 1&nbsp;semaine = 7&nbsp;jours ·
        1&nbsp;an = 12&nbsp;mois = 365&nbsp;jours (366 les années bissextiles)</p>
      <p>1&nbsp;h = 60 × 60 = 3&nbsp;600&nbsp;s · 1&nbsp;siècle = 100&nbsp;ans · 1&nbsp;an ≈ 52&nbsp;semaines</p>
      <p>Une demi-heure = 30&nbsp;min · un quart d’heure = 15&nbsp;min · trois quarts d’heure = 45&nbsp;min</p>
      <p>⚠️ On compte par <b>60</b>, pas par 100 : <i>1,5&nbsp;h = 1&nbsp;h&nbsp;30&nbsp;min</i>, et pas 1&nbsp;h&nbsp;50&nbsp;min !</p>
      <h4>Convertir</h4>
      <p>👉 <i>2&nbsp;h&nbsp;15&nbsp;min = 2 × 60 + 15 = 135&nbsp;min</i> ·
        <i>150&nbsp;s = 2&nbsp;min&nbsp;30&nbsp;s</i> (2 × 60 = 120, il reste 30)</p>
      <h4>Calculer une durée</h4>
      <p>On avance par étapes, en passant par l’heure pile. De 9&nbsp;h&nbsp;45 à 11&nbsp;h&nbsp;20 :
        15&nbsp;min jusqu’à 10&nbsp;h, 1&nbsp;h jusqu’à 11&nbsp;h, puis 20&nbsp;min. En tout : <b>1&nbsp;h&nbsp;35&nbsp;min</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour trouver l’heure d’arrivée, ajoute les heures, puis les minutes.
        60&nbsp;min ou plus ? Ça fait une heure de plus :
        8&nbsp;h&nbsp;50 + 1&nbsp;h&nbsp;25&nbsp;min → 9&nbsp;h&nbsp;75&nbsp;min = <b>10&nbsp;h&nbsp;15</b>.</div>
    `,
  });

  // ======================================================================
  // 4. Le périmètre
  // ======================================================================
  // Un rectangle dessiné, avec sa longueur (en bas) et sa largeur (à droite)
  function figureRectangle(L, l, unite) {
    const echelle = Math.min(240 / L, 140 / l);
    const w = L * echelle;
    const h = Math.max(l * echelle, 36);
    const x = (420 - w) / 2;
    const y = (230 - h) / 2;
    const [A, B, C, D] = [[x, y + h], [x + w, y + h], [x + w, y], [x, y]];
    const G = [x + w / 2, y + h / 2];
    const html = figures.polygone([A, B, C, D])
      + figures.angleDroit(A, B, D) + figures.angleDroit(B, C, A) + figures.angleDroit(C, D, B) + figures.angleDroit(D, A, C)
      + longueurDehors(A, B, mesure(L, unite), G) + longueurDehors(B, C, mesure(l, unite), G);
    return figures.svg(420, 230, html, 'Un rectangle');
  }

  // Des polygones dessinés (en pixels) ; leurs longueurs sont proportionnelles aux côtés du dessin
  const POLYGONES = [
    [[100, 205], [340, 205], [255, 45]],
    [[100, 195], [330, 212], [305, 60], [150, 40]],
    [[110, 210], [320, 210], [320, 115], [215, 40], [110, 115]],
    [[120, 210], [300, 200], [345, 110], [225, 40], [100, 110]],
    [[150, 210], [290, 210], [350, 128], [290, 45], [150, 45], [95, 128]],
  ];
  function figurePolygone(sommets, longueurs) {
    const G = [0, 1].map(i => sommets.reduce((s, p) => s + p[i], 0) / sommets.length);
    let html = figures.polygone(sommets);
    sommets.forEach((A, i) => { html += longueurDehors(A, sommets[(i + 1) % sommets.length], mesure(longueurs[i], 'cm'), G); });
    return figures.svg(440, 250, html, 'Un polygone');
  }

  // [la phrase, l’unité, la plus petite et la plus grande longueur, le pas]
  const RECTANGLES_PERIMETRE = [
    [(L, l) => `Un rectangle mesure ${mesure(L, 'cm')} de long et ${mesure(l, 'cm')} de large. Son périmètre est ___${ESPACE}cm.`,
      'cm', 3, 15, 1],
    [(L, l) => `Papi entoure d’un grillage son potager rectangulaire de ${mesure(L, 'm')} sur ${mesure(l, 'm')}. `
      + `Il lui faut ___${ESPACE}m de grillage.`, 'm', 4, 20, 1],
    [(L, l) => `Roxy fait le tour d’un champ de ${mesure(L, 'm')} sur ${mesure(l, 'm')}. Elle parcourt ___${ESPACE}m.`,
      'm', 20, 90, 5],
    [(L, l) => `Léa colle un ruban autour d’une photo de ${mesure(L, 'cm')} sur ${mesure(l, 'cm')}. Il faut ___${ESPACE}cm de ruban.`,
      'cm', 8, 20, 1],
  ];

  ajouterEtape({
    id: '6e-mesures-perimetre',
    banque: ['rectangle', 'rectangleChoix', 'rectangleChoix', 'carre', 'retrouver', 'polygone', 'unitesDifferentes',
      'cercle', 'cercle', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'rectangle') {
        const L = auHasard(0.3) ? entier(4, 11) + 0.5 : entier(4, 15);
        const l = entier(2, Math.ceil(L) - 1);
        const P = net(2 * (L + l));
        return nombre({
          consigne: 'Calcule le périmètre',
          enonce: `Quel est le périmètre de ce rectangle ?${figureRectangle(L, l, 'cm')}`,
          reponse: P,
          unite: 'cm',
          explication: `Périmètre du rectangle = 2 × (Longueur + largeur).<br>`
            + `2 × (${ecrire(L)} + ${l}) = 2 × ${ecrire(net(L + l))} = <b>${mesure(P, 'cm')}</b>.<br>`
            + `⚠️ ${ecrire(L)} + ${l} = ${mesure(net(L + l), 'cm')}, c’est seulement la moitié du tour !`,
        });
      }
      if (sorte === 'rectangleChoix') {
        const [phrase, unite, min, max, pas] = parmi(RECTANGLES_PERIMETRE);
        let L;
        let l;
        do {
          L = pas * entier(min / pas + 1, max / pas);
          l = pas * entier(min / pas, L / pas - 1);
        } while (L * l === 2 * (L + l)); // (6 sur 3 : l’aire et le périmètre donnent le même nombre)
        const P = 2 * (L + l);
        return choix({
          consigne: 'Calcule le périmètre',
          enonce: phrase(L, l),
          reponse: P,
          // plus petits : la moitié du tour, un côté oublié ; plus grands : 4 longueurs, le tour compté deux fois, l’aire
          pieges: meilleursPieges(P, [L + l, 2 * L + l, L + 2 * l, 4 * L, 2 * P, L * l]),
          explication: `Périmètre du rectangle = 2 × (Longueur + largeur).<br>`
            + `2 × (${L} + ${l}) = 2 × ${L + l} = <b>${mesure(P, unite)}</b>.<br>`
            + `⚠️ ${L} + ${l}, c’est la moitié du tour ; ${L} × ${l}, c’est l’aire.`,
        });
      }
      if (sorte === 'carre') {
        const [phrase, unite, tirerCote] = parmi([
          [c => `Un carré a des côtés de ${mesure(c, 'cm')}. Son périmètre est ___${ESPACE}cm.`, 'cm',
            () => (auHasard(0.25) ? entier(2, 9) + 0.5 : entier(3, 15))],
          [c => `Un bac à sable carré a des côtés de ${mesure(c, 'm')}. Son tour mesure ___${ESPACE}m.`, 'm',
            () => parmi([1.5, 2.5, 3, 3.5])],
          [c => `Une nappe carrée a des côtés de ${mesure(c, 'dm')}. Son périmètre est ___${ESPACE}dm.`, 'dm',
            () => entier(8, 15)],
        ]);
        const c = tirerCote();
        const P = net(4 * c);
        const aire = net(c * c);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule le périmètre',
          enonce: phrase(c),
          reponse: P,
          pieges: meilleursPieges(P, [aire, net(2 * c), net(c + 4), net(3 * c), net(5 * c), net(8 * c), net(10 * c)]),
          explication: `Le carré a 4 côtés de même longueur : 4 × ${ecrire(c)} = <b>${mesure(P, unite)}</b>.`
            + (aire !== P ? `<br>⚠️ ${ecrire(c)} × ${ecrire(c)} = ${ecrire(aire)}, c’est son aire, pas son périmètre.` : ''),
        }));
      }
      if (sorte === 'retrouver') {
        if (auHasard()) {
          // Le côté d’un carré dont on connaît le périmètre
          const c = entier(3, 15);
          const P = 4 * c;
          return choix({
            consigne: 'Retrouve le côté',
            enonce: `Un carré a un périmètre de ${mesure(P, 'cm')}. Son côté mesure ___${ESPACE}cm.`,
            reponse: c,
            // une erreur de table (c − 1, c − 2, c + 1), ÷ 2 au lieu de ÷ 4, − 4 au lieu de ÷ 4, × 4 au lieu de ÷ 4
            pieges: meilleursPieges(c, [c - 1, c - 2, net(c / 2), c + 1, P / 2, P - 4, P * 4]),
            explication: `Le périmètre du carré, c’est 4 fois le côté. Donc le côté = périmètre ÷ 4.<br>`
              + `${P} ÷ 4 = <b>${mesure(c, 'cm')}</b> (car 4 × ${c} = ${P}).`,
          });
        }
        // La largeur d’un rectangle dont on connaît le périmètre et la longueur
        const L = entier(5, 15);
        const l = entier(2, L - 1);
        const P = 2 * (L + l);
        return sansIndiceDeForme(() => choix({
          consigne: 'Retrouve la largeur',
          enonce: `Un rectangle de périmètre ${mesure(P, 'cm')} a une longueur de ${mesure(L, 'cm')}. Sa largeur est ___${ESPACE}cm.`,
          reponse: l,
          pieges: meilleursPieges(l, [l - 1, l - 2, net(l / 2), l + 1, P - 2 * L, P - L, net((P - L) / 2), P / 2]),
          explication: `Longueur + largeur, c’est la moitié du périmètre : ${P} ÷ 2 = ${mesure(P / 2, 'cm')}.<br>`
            + `Largeur = ${P / 2} ${MOINS} ${L} = <b>${mesure(l, 'cm')}</b>.`,
        }));
      }
      if (sorte === 'polygone') {
        const sommets = parmi(POLYGONES);
        const echelle = parmi([0.02, 0.025, 0.03, 0.035, 0.04]);
        const longueurs = sommets.map((A, i) => {
          const B = sommets[(i + 1) % sommets.length];
          return Math.max(1, Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) * echelle * 2) / 2);
        });
        const P = net(longueurs.reduce((s, x) => s + x, 0));
        return nombre({
          consigne: 'Calcule le périmètre',
          enonce: `Quel est le périmètre de ce polygone ?${figurePolygone(sommets, longueurs)}`,
          reponse: P,
          unite: 'cm',
          explication: `Le périmètre, c’est la somme des longueurs de tous les côtés :<br>`
            + `${longueurs.map(x => ecrire(x)).join(' + ')} = <b>${mesure(P, 'cm')}</b>.`,
        });
      }
      if (sorte === 'unitesDifferentes') {
        if (auHasard()) {
          // Un triangle dont les côtés sont écrits en cm, en mm et en dm
          let a;
          let b;
          let c;
          do {
            [a, b, c] = [entier(5, 15), entier(5, 15), entier(5, 15)];
          } while (a >= b + c || b >= a + c || c >= a + b || new Set([a, b, c]).size < 3);
          const unites = RM.melanger(['cm', 'mm', 'dm']);
          const ecrits = [a, b, c].map((x, i) => mesure(decaler(x, LONGUEURS.cm - LONGUEURS[unites[i]]), unites[i]));
          const conversions = [a, b, c].map((x, i) => (unites[i] === 'cm' ? '' : `${ecrits[i]} = ${mesure(x, 'cm')}`)).filter(Boolean);
          return nombre({
            consigne: 'Calcule le périmètre',
            enonce: `Un triangle a des côtés de ${ecrits[0]}, ${ecrits[1]} et ${ecrits[2]}. Quel est son périmètre, en cm ?`,
            reponse: a + b + c,
            unite: 'cm',
            explication: `On écrit tout en cm : ${conversions.join(' et ')}.<br>`
              + `${a} + ${b} + ${c} = <b>${mesure(a + b + c, 'cm')}</b>.`,
          });
        }
        // Un tapis rectangulaire : la longueur en m, la largeur en cm
        const Lm = parmi([1, 1.2, 1.5, 2, 2.5]);
        const L = net(Lm * 100);
        const l = 5 * entier(6, L / 5 - 2);
        return nombre({
          consigne: 'Calcule le périmètre',
          enonce: `Un tapis rectangulaire mesure ${mesure(Lm, 'm')} de long et ${mesure(l, 'cm')} de large. `
            + 'Quel est son périmètre, en cm ?',
          reponse: 2 * (L + l),
          unite: 'cm',
          explication: `On écrit tout en cm : ${mesure(Lm, 'm')} = ${mesure(L, 'cm')}.<br>`
            + `2 × (${L} + ${l}) = 2 × ${L + l} = <b>${mesure(2 * (L + l), 'cm')}</b>.`,
        });
      }
      if (sorte === 'cercle') {
        const variante = parmi(['diametre', 'rayon', 'exact']);
        if (variante === 'diametre') {
          const d = entier(2, 20);
          const L = net(3.14 * d);
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule la longueur du cercle',
            enonce: `Un cercle a un diamètre de ${mesure(d, 'cm')}. Avec π ≈ 3,14, sa longueur est d’environ ___${ESPACE}cm.`,
            reponse: L,
            // le diamètre pris pour un rayon (× 2), le rayon au lieu du diamètre (÷ 2), + au lieu de ×,
            // le diamètre multiplié par lui-même, la virgule mal placée
            pieges: meilleursPieges(L, [net(3.14 * 2 * d), net(3.14 * d / 2), net(3.14 + d), net(3.14 * d * d),
              net(31.4 * d), net(0.314 * d)]),
            explication: `Longueur du cercle = π × diamètre.<br>3,14 × ${d} = <b>${ecrire(L)}</b> : le cercle mesure environ ${mesure(L, 'cm')}.`
              + '<br>⚠️ On connaît déjà le diamètre : pas besoin de le doubler.',
          }));
        }
        if (variante === 'rayon') {
          const r = entier(2, 10);
          const L = net(3.14 * 2 * r);
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule la longueur du cercle',
            enonce: `Un cercle a un rayon de ${mesure(r, 'cm')}. Avec π ≈ 3,14, sa longueur est d’environ ___${ESPACE}cm.`,
            reponse: L,
            pieges: meilleursPieges(L, [net(3.14 * r), net(3.14 * 4 * r), net(3.14 * r * r), net(3.14 + 2 * r),
              net(62.8 * r), net(0.628 * r)]),
            explication: `Le diamètre est le double du rayon : 2 × ${r} = ${mesure(2 * r, 'cm')}.<br>`
              + `Longueur = π × diamètre ≈ 3,14 × ${2 * r} = <b>${ecrire(L)}</b> : environ ${mesure(L, 'cm')}.`,
          }));
        }
        const r = entier(3, 12);
        const avecPi = n => `${ecrire(n)}${ESPACE}×${ESPACE}π`;
        const donneRayon = auHasard();
        const d = 2 * r;
        return choix({
          consigne: 'Trouve la longueur exacte',
          enonce: donneRayon
            ? `Un cercle a un rayon de ${mesure(r, 'cm')}. Sa longueur exacte est ___${ESPACE}cm.`
            : `Un cercle a un diamètre de ${mesure(d, 'cm')}. Sa longueur exacte est ___${ESPACE}cm.`,
          reponse: avecPi(d),
          pieges: meilleursPieges(avecPi(d), [r, 4 * r, r * r, d * d].map(avecPi)),
          explication: 'Longueur du cercle = π × diamètre.<br>'
            + (donneRayon ? `Le diamètre est le double du rayon : 2 × ${r} = ${mesure(d, 'cm')}.<br>` : '')
            + `La longueur exacte est <b>${avecPi(d)}${ESPACE}cm</b> (environ 3,14 × ${d} = ${mesure(net(3.14 * d), 'cm')}).`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['rectangle', 'carre', 'cercle']);
      if (famille === 'rectangle') {
        let L;
        let l;
        let faux;
        do {
          L = entier(4, 12);
          l = entier(2, L - 1);
          faux = parmi([L + l, L * l]);
        } while (faux === 2 * (L + l));
        const P = 2 * (L + l);
        return vraiFaux({
          enonce: `Le périmètre d’un rectangle de ${mesure(L, 'cm')} sur ${mesure(l, 'cm')} est ${mesure(vrai ? P : faux, 'cm')}.`,
          vrai,
          explication: `Périmètre = 2 × (${L} + ${l}) = 2 × ${L + l} = <b>${mesure(P, 'cm')}</b>.`
            + (vrai ? '' : faux === L * l ? `<br>⚠️ ${L} × ${l} = ${L * l}, c’est l’aire (en cm²).`
              : `<br>⚠️ ${L} + ${l} = ${L + l}, c’est seulement la moitié du tour.`),
        });
      }
      if (famille === 'carre') {
        let c;
        let faux;
        do {
          c = entier(3, 12);
          faux = parmi([c * c, 2 * c]);
        } while (faux === 4 * c);
        return vraiFaux({
          enonce: `Un carré de ${mesure(c, 'cm')} de côté a un périmètre de ${mesure(vrai ? 4 * c : faux, 'cm')}.`,
          vrai,
          explication: `Le carré a 4 côtés de même longueur : 4 × ${c} = <b>${mesure(4 * c, 'cm')}</b>.`,
        });
      }
      const d = entier(2, 12);
      const juste = net(3.14 * d);
      return vraiFaux({
        enonce: `Avec π ≈ 3,14, un cercle de diamètre ${mesure(d, 'cm')} a une longueur d’environ ${mesure(vrai ? juste : net(2 * juste), 'cm')}.`,
        vrai,
        explication: `Longueur du cercle = π × diamètre ≈ 3,14 × ${d} = <b>${mesure(juste, 'cm')}</b>.`
          + (vrai ? '' : `<br>⚠️ ${ecrire(net(2 * juste))}${ESPACE}cm, ce serait pour un <b>rayon</b> de ${mesure(d, 'cm')}.`),
      });
    },
    titreLecon: 'Le périmètre',
    lecon: `
      <p>Le <b>périmètre</b> d’une figure, c’est la <b>longueur de son tour</b>. C’est une longueur : il s’écrit en cm, en m…</p>
      <table>
        <tr><th>Polygone</th><td>la somme des longueurs de tous ses côtés</td></tr>
        <tr><th>Carré</th><td>4 × côté</td></tr>
        <tr><th>Rectangle</th><td>2 × (Longueur + largeur)</td></tr>
        <tr><th>⭐ Cercle</th><td>π × diamètre, ou 2 × π × rayon (π ≈ 3,14)</td></tr>
      </table>
      <p>👉 <i>Rectangle de 8&nbsp;cm sur 5&nbsp;cm : 2 × (8 + 5) = 26&nbsp;cm</i> ·
        <i>Carré de 7&nbsp;cm de côté : 4 × 7 = 28&nbsp;cm</i></p>
      <p>👉 ⭐ <i>Cercle de rayon 5&nbsp;cm : son diamètre mesure 10&nbsp;cm, sa longueur exacte est 10 × π&nbsp;cm,
        environ 3,14 × 10 = 31,4&nbsp;cm.</i></p>
      <p><b>À l’envers :</b> côté du carré = périmètre ÷ 4 ; largeur du rectangle = périmètre ÷ 2 − Longueur.<br>
        👉 <i>Rectangle de périmètre 30&nbsp;cm et de longueur 9&nbsp;cm : 30 ÷ 2 = 15, et 15 − 9 = 6&nbsp;cm de largeur.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> imagine une fourmi qui fait le tour de la figure : le périmètre, c’est le chemin
        qu’elle parcourt. Autour d’un rectangle, elle longe <b>2 longueurs et 2 largeurs</b> !</div>
      <p>⚠️ Avant d’additionner, écris toutes les longueurs dans la <b>même unité</b> :
        1&nbsp;m + 50&nbsp;cm = 100&nbsp;cm + 50&nbsp;cm = 150&nbsp;cm.</p>
      <p>⚠️ Ne confonds pas avec l’<b>aire</b> (la surface à l’intérieur), qui s’écrit en cm².</p>
    `,
  });

  // ======================================================================
  // 5. L’aire
  // ======================================================================
  // Une figure sur un quadrillage : les sommets sont comptés en carreaux (y vers le bas)
  function formeSurQuadrillage() {
    const famille = parmi(['rectangle', 'L', 'creux', 'escalier', 'demi', 'maison']);
    let sommets;
    let calcul;
    if (famille === 'rectangle') {
      const W = entier(3, 6);
      const H = entier(2, 4);
      sommets = [[0, 0], [W, 0], [W, H], [0, H]];
      calcul = `${H} rangées de ${W}${ESPACE}carreaux : ${W} × ${H} = <b>${W * H}</b>`;
    } else if (famille === 'L') {
      const W = entier(4, 7);
      const H = entier(3, 5);
      const w = entier(1, W - 2);
      const h = entier(1, H - 1);
      sommets = [[0, 0], [W - w, 0], [W - w, h], [W, h], [W, H], [0, H]];
      calcul = `Le grand rectangle fait ${W} × ${H} = ${W * H}${ESPACE}carreaux ; on enlève le coin de ${w} × ${h} = ${w * h}${ESPACE}carreaux.<br>`
        + `${W * H} ${MOINS} ${w * h} = <b>${W * H - w * h}</b>`;
    } else if (famille === 'creux') {
      const W = entier(5, 7);
      const H = entier(3, 4);
      const a = entier(1, W - 3);
      const b = entier(a + 1, W - 1);
      const d = entier(1, H - 1);
      sommets = [[0, 0], [a, 0], [a, d], [b, d], [b, 0], [W, 0], [W, H], [0, H]];
      calcul = `Le grand rectangle fait ${W} × ${H} = ${W * H}${ESPACE}carreaux ; on enlève le creux de ${b - a} × ${d} = ${(b - a) * d}${ESPACE}carreaux.<br>`
        + `${W * H} ${MOINS} ${(b - a) * d} = <b>${W * H - (b - a) * d}</b>`;
    } else if (famille === 'escalier') {
      const s = entier(1, 2);
      const t = entier(1, 2);
      sommets = [[0, 3 * t], [0, 2 * t], [s, 2 * t], [s, t], [2 * s, t], [2 * s, 0], [3 * s, 0], [3 * s, 3 * t]];
      calcul = `Marche par marche : ${s * t} + ${2 * s * t} + ${3 * s * t} = <b>${6 * s * t}</b>`;
    } else if (famille === 'demi') {
      // Un rectangle, et un triangle coupé en biais : des demi-carreaux
      const W = entier(4, 7);
      const H = entier(2, Math.min(4, W - 1));
      sommets = [[0, 0], [W - H, 0], [W, H], [0, H]];
      calcul = `Un rectangle de ${W - H} × ${H} = ${(W - H) * H}${ESPACE}carreaux, et un triangle, la moitié d’un carré de ${H} × ${H}, `
        + `donc ${H * H} ÷ 2 = ${ecrire(H * H / 2)}${ESPACE}carreaux.<br>${(W - H) * H} + ${ecrire(H * H / 2)} = <b>${ecrire((W - H) * H + H * H / 2)}</b>`;
    } else {
      // Une maison : un rectangle et un toit en triangle
      const W = parmi([4, 6]);
      const H = entier(2, 3);
      const t = W / 2;
      sommets = [[0, t], [t, 0], [W, t], [W, t + H], [0, t + H]];
      calcul = `Le bas fait ${W} × ${H} = ${W * H}${ESPACE}carreaux ; le toit est la moitié d’un rectangle de ${W} × ${t}, `
        + `donc ${W * t} ÷ 2 = ${W * t / 2}${ESPACE}carreaux.<br>${W * H} + ${W * t / 2} = <b>${W * H + W * t / 2}</b>`;
    }
    // Une fois sur deux, la figure est retournée, comme dans un miroir
    if (auHasard()) {
      const maxX = Math.max(...sommets.map(p => p[0]));
      sommets = sommets.map(([x, y]) => [maxX - x, y]);
    }
    // L’aire, calculée à partir des sommets (la formule du lacet) : elle doit être égale au calcul expliqué
    const aire = Math.abs(sommets.reduce((s, [x, y], i) => {
      const [x2, y2] = sommets[(i + 1) % sommets.length];
      return s + x * y2 - x2 * y;
    }, 0)) / 2;
    return { sommets, calcul, aire, demi: famille === 'demi' || famille === 'maison' };
  }

  // Le dessin : la figure coloriée, puis le quadrillage bien visible par-dessus, puis le contour
  function figureSurQuadrillage(sommets) {
    const colonnes = Math.max(...sommets.map(p => p[0])) + 2;
    const lignes = Math.max(...sommets.map(p => p[1])) + 2;
    const q = figures.quadrillage(colonnes, lignes, 30, 'fig-fin');
    const P = sommets.map(([c, l]) => q.coin(c + 1, l + 1));
    const html = figures.polygone(P, 'fig-plein') + q.html + figures.polygone(P, 'fig-trait');
    return figures.svg(q.largeur, q.hauteur, html, 'Une figure coloriée sur un quadrillage');
  }

  // Un triangle rectangle dessiné, dans le rectangle qu’il partage en deux (en pointillés)
  function figureTriangleRectangle(a, b, unite) {
    const echelle = Math.min(230 / a, 150 / b);
    const w = a * echelle;
    const h = Math.max(b * echelle, 40);
    const x = (420 - w) / 2;
    const y = (230 - h) / 2;
    const aGauche = auHasard();
    const S = aGauche ? [x, y + h] : [x + w, y + h]; // le sommet de l’angle droit
    const P = aGauche ? [x + w, y + h] : [x, y + h]; // au bout du côté horizontal
    const Q = aGauche ? [x, y] : [x + w, y];         // au bout du côté vertical
    const R = aGauche ? [x + w, y] : [x, y];         // le 4e coin du rectangle
    const G = [(S[0] + P[0] + Q[0]) / 3, (S[1] + P[1] + Q[1]) / 3];
    const html = figures.ligne([P, R, Q], 'fig-fin fig-cache') + figures.polygone([S, P, Q]) + figures.angleDroit(S, P, Q)
      + longueurDehors(S, P, mesure(a, unite), G) + longueurDehors(S, Q, mesure(b, unite), G);
    return figures.svg(420, 230, html, 'Un triangle rectangle');
  }

  // Pour la leçon : le triangle rectangle est la moitié d’un rectangle
  function figureMoitieRectangle() {
    const q = figures.quadrillage(6, 4, 26);
    const [A, B, C, D] = [q.coin(1, 3), q.coin(5, 3), q.coin(5, 1), q.coin(1, 1)];
    return figures.svg(q.largeur, q.hauteur,
      figures.polygone([A, B, D], 'fig-plein') + q.html + figures.ligne([B, C, D], 'fig-fin fig-cache')
      + figures.polygone([A, B, D], 'fig-trait') + figures.angleDroit(A, B, D),
      'Un triangle rectangle, moitié d’un rectangle');
  }

  // [la phrase, l’unité, la plus petite et la plus grande longueur, le pas]
  const RECTANGLES_AIRE = [
    [(L, l) => `Un rectangle mesure ${mesure(L, 'cm')} de long et ${mesure(l, 'cm')} de large. Son aire est ___${ESPACE}cm².`, 'cm', 3, 12, 1],
    [(L, l) => `Une feuille de dessin mesure ${mesure(L, 'cm')} sur ${mesure(l, 'cm')}. Son aire est ___${ESPACE}cm².`, 'cm', 10, 40, 5],
    [(L, l, prenom) => `La chambre de ${prenom} est un rectangle de ${mesure(L, 'm')} sur ${mesure(l, 'm')}. Son aire est ___${ESPACE}m².`,
      'm', 3, 6, 1],
    [(L, l) => `Le potager de Papi est un rectangle de ${mesure(L, 'm')} sur ${mesure(l, 'm')}. Son aire est ___${ESPACE}m².`, 'm', 4, 12, 1],
  ];
  // Des prénoms qui commencent par une consonne (pour écrire « de Léa », sans élision)
  const PRENOMS_CONSONNE = ['Léa', 'Tom', 'Zoé', 'Sami', 'Lina', 'Noé'];
  const SURFACES = [
    ['l’aire d’un timbre', 'cm²'], ['l’aire d’une page de cahier', 'cm²'], ['l’aire d’une carte postale', 'cm²'],
    ['l’aire de l’écran d’une tablette', 'cm²'], ['l’aire d’une chambre', 'm²'], ['l’aire de la cour de récréation', 'm²'],
    ['l’aire d’un terrain de football', 'm²'], ['l’aire d’un appartement', 'm²'], ['l’aire de la France', 'km²'],
    ['l’aire d’une grande forêt', 'km²'], ['l’aire d’une ville', 'km²'], ['l’aire d’un grand lac', 'km²'],
  ];
  // Les conversions d’aires : [de, vers, rangs (un m² = 100 dm² : 2 rangs par unité)]
  const CONVERSIONS_AIRES = [['m²', 'dm²', 2], ['dm²', 'cm²', 2], ['m²', 'cm²', 4]];
  const RELATIONS_AIRES = {
    'm²-dm²': `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = 100${ESPACE}dm²`,
    'dm²-cm²': `1${ESPACE}dm = 10${ESPACE}cm, donc 1${ESPACE}dm² = 10 × 10 = 100${ESPACE}cm²`,
    'm²-cm²': `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = 10${ESPACE}000${ESPACE}cm²`,
  };
  const decrireRectangle = ([a, b]) => (a === b
    ? `carré de ${mesure(a, 'cm')} de côté`
    : `rectangle de ${mesure(a, 'cm')} sur ${mesure(b, 'cm')}`);

  ajouterEtape({
    id: '6e-mesures-aire',
    banque: ['carreaux', 'carreaux', 'rectangle', 'rectangle', 'carre', 'triangle', 'triangleChoix', 'unites', 'comparer', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'carreaux') {
        const { sommets, calcul, aire, demi } = formeSurQuadrillage();
        const enCm2 = auHasard(0.4);
        return nombre({
          consigne: 'Compte les carreaux',
          enonce: (enCm2
            ? 'Chaque carreau mesure 1&nbsp;cm de côté. Quelle est l’aire de la figure coloriée ?'
            : 'Quelle est l’aire de la figure coloriée, en carreaux ?') + figureSurQuadrillage(sommets),
          reponse: aire,
          unite: enCm2 ? 'cm²' : 'carreaux',
          explication: `On compte les carreaux${demi ? ' (deux demi-carreaux font un carreau)' : ''}. ${calcul}${ESPACE}carreaux.`
            + (enCm2 ? ` Un carreau = 1${ESPACE}cm², donc l’aire est <b>${mesure(aire, 'cm²')}</b>.` : ''),
        });
      }
      if (sorte === 'rectangle') {
        const [phrase, unite, min, max, pas] = parmi(RECTANGLES_AIRE);
        let L;
        let l;
        do {
          L = pas * entier(min / pas + 1, max / pas);
          l = pas * entier(min / pas, L / pas - 1);
        } while (L * l === 2 * (L + l)); // (6 sur 3 : l’aire et le périmètre donnent le même nombre)
        const A = L * l;
        return choix({
          consigne: 'Calcule l’aire',
          enonce: phrase(L, l, parmi(PRENOMS_CONSONNE)),
          reponse: A,
          // le périmètre, la moitié du tour, l’aire doublée ou partagée en deux, L × L, une rangée de trop
          pieges: meilleursPieges(A, [2 * (L + l), L + l, 2 * A, L * L, net(A / 2), (L + 1) * l]),
          explication: `Aire du rectangle = Longueur × largeur.<br>${L} × ${l} = <b>${mesure(A, unite + '²')}</b>.<br>`
            + `⚠️ 2 × (${L} + ${l}) = ${mesure(2 * (L + l), unite)}, c’est le périmètre (le tour), pas l’aire.`,
        });
      }
      if (sorte === 'carre') {
        if (auHasard(0.6)) {
          // (pas 4 : l’aire et le périmètre donneraient le même nombre)
          const c = parmi([3, 5, 6, 7, 8, 9, 10, 11, 12]);
          const A = c * c;
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule l’aire',
            enonce: `Un carré a des côtés de ${mesure(c, 'cm')}. Son aire est ___${ESPACE}cm².`,
            reponse: A,
            // le périmètre, c × 2 au lieu de c × c, la moitié, un côté de trop, le double
            pieges: meilleursPieges(A, [4 * c, 2 * c, net(A / 2), c * (c + 1), (c + 1) * (c + 1), 2 * A]),
            explication: `Aire du carré = côté × côté.<br>${c} × ${c} = <b>${mesure(A, 'cm²')}</b>.<br>`
              + `⚠️ 4 × ${c} = ${mesure(4 * c, 'cm')}, c’est le périmètre ; et ${c} × 2 = ${2 * c}, ce n’est pas ${c} × ${c} !`,
          }));
        }
        // Retrouver la largeur d’un rectangle dont on connaît l’aire
        const L = entier(4, 12);
        const l = entier(3, Math.min(9, L - 1));
        const A = L * l;
        return choix({
          consigne: 'Retrouve la largeur',
          enonce: `Un rectangle a une aire de ${mesure(A, 'cm²')} et une longueur de ${mesure(L, 'cm')}. Sa largeur est ___${ESPACE}cm.`,
          reponse: l,
          // une erreur de table (l − 1, l − 2, l + 1), − au lieu de ÷, la formule du périmètre, ÷ 2, × au lieu de ÷
          pieges: meilleursPieges(l, [l - 1, l - 2, net(l / 2), l + 1, A - L, net(A / 2 - L), net(A / 2), A * L]),
          explication: `Aire = Longueur × largeur, donc la largeur = aire ÷ Longueur.<br>`
            + `${A} ÷ ${L} = <b>${mesure(l, 'cm')}</b> (car ${L} × ${l} = ${A}).`,
        });
      }
      if (sorte === 'triangle') {
        const a = entier(3, 12);
        const b = entier(2, 9);
        const A = net(a * b / 2);
        return nombre({
          consigne: 'Calcule l’aire',
          enonce: `Quelle est l’aire de ce triangle rectangle ?${figureTriangleRectangle(a, b, 'cm')}`,
          reponse: A,
          unite: 'cm²',
          explication: `Le triangle rectangle est la moitié d’un rectangle de ${mesure(a, 'cm')} sur ${mesure(b, 'cm')}.<br>`
            + `${a} × ${b} ÷ 2 = ${a * b} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>⚠️ Sans le ÷ 2, on trouve l’aire du rectangle entier !`,
        });
      }
      if (sorte === 'triangleChoix') {
        const a = entier(3, 12);
        const b = entier(2, 10);
        const A = net(a * b / 2);
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’aire',
          enonce: `Un triangle rectangle a des côtés de l’angle droit de ${mesure(a, 'cm')} et ${mesure(b, 'cm')}. `
            + `Son aire est ___${ESPACE}cm².`,
          reponse: A,
          // l’oubli du ÷ 2, + au lieu de ×, le double, ÷ 4 au lieu de ÷ 2, une erreur de calcul (± 1)
          pieges: meilleursPieges(A, [a * b, a + b, 2 * (a + b), 2 * a * b, net(a * b / 4), net(A + 1), net(A - 1)]),
          explication: `Le triangle rectangle est la moitié d’un rectangle de ${mesure(a, 'cm')} sur ${mesure(b, 'cm')}.<br>`
            + `${a} × ${b} ÷ 2 = ${a * b} ÷ 2 = <b>${mesure(A, 'cm²')}</b>.<br>⚠️ Sans le ÷ 2, on trouve l’aire du rectangle entier !`,
        }));
      }
      if (sorte === 'unites') {
        if (auHasard()) {
          const [objet, unite] = parmi(SURFACES);
          return choix({
            consigne: 'Choisis l’unité qui convient',
            enonce: `On mesure ${objet} en ___.`,
            reponse: unite,
            pieges: ['cm', 'cm²', 'm²', 'km²'].filter(u => u !== unite),
            explication: `Une aire s’écrit avec le petit ² : cm², m², km² (le cm est une unité de longueur).<br>`
              + `Pour ${objet}, on choisit les <b>${unite}</b>.`,
          });
        }
        // ⭐ Les conversions d’aires : 1 m² = 100 dm² = 10 000 cm²
        const [grande, petite, k] = parmi(CONVERSIONS_AIRES);
        const n = entier(1, k === 4 ? 5 : 9);
        const versPetite = auHasard(0.7);
        const [de, vers, depart, reponse] = versPetite
          ? [grande, petite, n, decaler(n, k)]
          : [petite, grande, decaler(n, k), n];
        const sens = versPetite ? 1 : -1;
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce: `${mesure(depart, de)} = ___${ESPACE}${vers}`,
          reponse,
          // pas converti, 1 rang par unité (comme pour les longueurs), un rang de trop ou de moins, le mauvais sens
          pieges: meilleursPieges(reponse, [0, k / 2, k - 1, k + 1, k + 2, k + 3, -k].map(j => decaler(depart, sens * j))
            .filter(p => p >= 0.001 && p < 1e7 && decimalesDe(p) <= 3)),
          explication: `${RELATIONS_AIRES[`${grande}-${petite}`]}.<br>`
            + `${mesure(depart, de)} = <b>${mesure(reponse, vers)}</b>. ⚠️ Pour les aires, on décale de 2 rangs par unité !`,
        }));
      }
      if (sorte === 'comparer') {
        // Deux rectangles : même aire, même périmètre… ou rien du tout ?
        const cas = parmi(['aire', 'aire', 'aire', 'perimetre', 'perimetre', 'perimetre', 'rien', 'rien', 'deux']);
        let A;
        let B;
        if (cas === 'aire') {
          const aire = parmi([12, 16, 18, 20, 24, 30, 36]);
          const paires = [];
          for (let b = 1; b * b <= aire; b++) if (aire % b === 0 && aire / b <= 12) paires.push([aire / b, b]);
          [A, B] = RM.melanger(paires).slice(0, 2);
        } else if (cas === 'perimetre') {
          const demi = entier(6, 12);
          const paires = [];
          for (let b = 1; 2 * b <= demi; b++) paires.push([demi - b, b]);
          [A, B] = RM.melanger(paires).slice(0, 2);
        } else if (cas === 'deux') {
          // Le même rectangle, écrit dans l’autre sens (tourné d’un quart de tour)
          A = [entier(4, 9), entier(2, 3)];
          B = [A[1], A[0]];
        } else {
          do {
            A = [entier(3, 9), entier(2, 6)].sort((x, y) => y - x);
            B = [entier(3, 9), entier(2, 6)].sort((x, y) => y - x);
          } while (A[0] * A[1] === B[0] * B[1] || A[0] + A[1] === B[0] + B[1]);
        }
        const reponse = { aire: 'leur aire', perimetre: 'leur périmètre', rien: 'aucun des deux', deux: 'les deux' }[cas];
        const conclusion = {
          aire: 'Même aire, mais pas le même périmètre !',
          perimetre: 'Même périmètre, mais pas la même aire !',
          rien: 'Ni la même aire, ni le même périmètre.',
          deux: 'C’est le même rectangle, tourné : même aire et même périmètre !',
        }[cas];
        const decrire = (nom, [a, b]) => `${nom} : aire ${a} × ${b} = ${mesure(a * b, 'cm²')}, `
          + `périmètre 2 × (${a} + ${b}) = ${mesure(2 * (a + b), 'cm')}.`;
        return choix({
          consigne: 'Compare l’aire et le périmètre',
          enonce: `A : ${decrireRectangle(A)}. B : ${decrireRectangle(B)}. Qu’ont-ils en commun ?`,
          reponse,
          choix: ['leur aire', 'leur périmètre', 'les deux', 'aucun des deux'],
          explication: `${decrire('A', A)}<br>${decrire('B', B)}<br><b>${conclusion}</b>`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['carre', 'rectangle', 'triangle', 'regle']);
      if (famille === 'carre') {
        const c = parmi([3, 5, 6, 7, 8, 9]);
        const perimetre = auHasard(); // l’erreur : 4 × c (le périmètre) ou c × 2
        const fausse = perimetre ? 4 * c : 2 * c;
        return vraiFaux({
          enonce: `Un carré de ${mesure(c, 'cm')} de côté a une aire de ${mesure(vrai ? c * c : fausse, 'cm²')}.`,
          vrai,
          explication: `Aire du carré = côté × côté : ${c} × ${c} = <b>${mesure(c * c, 'cm²')}</b>.`
            + (vrai ? '' : perimetre ? `<br>⚠️ 4 × ${c} = ${4 * c}, c’est le périmètre (en cm).`
              : `<br>⚠️ ${c} × 2 = ${2 * c}, ce n’est pas ${c} × ${c}.`),
        });
      }
      if (famille === 'rectangle') {
        let L;
        let l;
        do {
          L = entier(4, 12);
          l = entier(2, L - 1);
        } while (L * l === 2 * (L + l));
        return vraiFaux({
          enonce: `L’aire d’un rectangle de ${mesure(L, 'cm')} sur ${mesure(l, 'cm')} est ${mesure(vrai ? L * l : 2 * (L + l), 'cm²')}.`,
          vrai,
          explication: `Aire = Longueur × largeur = ${L} × ${l} = <b>${mesure(L * l, 'cm²')}</b>.`
            + (vrai ? '' : `<br>⚠️ 2 × (${L} + ${l}) = ${2 * (L + l)}, c’est le périmètre (en cm).`),
        });
      }
      if (famille === 'triangle') {
        const a = entier(3, 10);
        const b = entier(2, 8);
        return vraiFaux({
          enonce: `Un triangle rectangle dont les côtés de l’angle droit mesurent ${mesure(a, 'cm')} et ${mesure(b, 'cm')} `
            + `a une aire de ${mesure(vrai ? net(a * b / 2) : a * b, 'cm²')}.`,
          vrai,
          explication: `C’est la moitié d’un rectangle : ${a} × ${b} ÷ 2 = <b>${mesure(net(a * b / 2), 'cm²')}</b>.`
            + (vrai ? '' : '<br>⚠️ Il ne faut pas oublier le ÷ 2 !'),
        });
      }
      const [phrase, explication] = parmi(vrai
        ? [[`1${ESPACE}m² = 10${ESPACE}000${ESPACE}cm²`, `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = <b>10${ESPACE}000${ESPACE}cm²</b>.`],
          [`1${ESPACE}m² = 100${ESPACE}dm²`, `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = <b>100${ESPACE}dm²</b>.`],
          ['Deux figures qui ont le même périmètre peuvent avoir des aires différentes.',
            `Un rectangle de 5${ESPACE}cm sur 1${ESPACE}cm et un carré de 3${ESPACE}cm de côté ont le même périmètre (12${ESPACE}cm), `
            + `mais leurs aires sont <b>5${ESPACE}cm² et 9${ESPACE}cm²</b>.`]]
        : [[`1${ESPACE}m² = 100${ESPACE}cm²`, `1${ESPACE}m = 100${ESPACE}cm, donc 1${ESPACE}m² = 100 × 100 = <b>10${ESPACE}000${ESPACE}cm²</b>.`],
          [`1${ESPACE}m² = 10${ESPACE}dm²`, `1${ESPACE}m = 10${ESPACE}dm, donc 1${ESPACE}m² = 10 × 10 = <b>100${ESPACE}dm²</b>.`],
          ['Deux figures qui ont la même aire ont toujours le même périmètre.',
            `Un rectangle de 4${ESPACE}cm sur 1${ESPACE}cm et un carré de 2${ESPACE}cm de côté ont la même aire (4${ESPACE}cm²), `
            + `mais leurs périmètres sont <b>10${ESPACE}cm et 8${ESPACE}cm</b>.`]]);
      return vraiFaux({ enonce: phrase, vrai, explication });
    },
    titreLecon: 'L’aire',
    lecon: `
      <p>L’<b>aire</b> d’une figure mesure la <b>surface à l’intérieur</b>. On peut la trouver en <b>comptant les carreaux</b>.</p>
      <p>1&nbsp;cm² est l’aire d’un carré de 1&nbsp;cm de côté. On utilise aussi le m² (une chambre) et le km² (une ville).</p>
      <table>
        <tr><th>Rectangle</th><td>Longueur × largeur</td></tr>
        <tr><th>Carré</th><td>côté × côté</td></tr>
        <tr><th>⭐ Triangle rectangle</th><td>la moitié d’un rectangle : on multiplie les deux côtés de l’angle droit, puis ÷ 2</td></tr>
      </table>
      ${figureMoitieRectangle()}
      <p>Le triangle colorié est la moitié du rectangle de 4 × 2 = 8&nbsp;carreaux : son aire est 8 ÷ 2 = 4&nbsp;carreaux.</p>
      <p>👉 <i>Rectangle de 8&nbsp;cm sur 5&nbsp;cm : 8 × 5 = 40&nbsp;cm²</i> ·
        <i>Triangle rectangle de 6&nbsp;cm et 4&nbsp;cm : 6 × 4 ÷ 2 = 12&nbsp;cm²</i></p>
      <p><b>À l’envers :</b> largeur = aire ÷ Longueur. 👉 <i>Aire 24&nbsp;cm² et longueur 6&nbsp;cm : 24 ÷ 6 = 4&nbsp;cm de largeur.</i></p>
      <p>⭐ 1&nbsp;m² = 100&nbsp;dm² = 10&nbsp;000&nbsp;cm² (car 1&nbsp;m = 100&nbsp;cm, et 100 × 100 = 10&nbsp;000).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le périmètre, c’est la <b>clôture</b> du pré ; l’aire, c’est l’<b>herbe</b>
        à l’intérieur ! Deux figures peuvent avoir la même aire sans avoir le même périmètre.</div>
      <p>⚠️ Une aire s’écrit avec le petit ² : 40&nbsp;cm², et pas 40&nbsp;cm.</p>
    `,
  });

  // ======================================================================
  // 6. Le volume
  // ======================================================================
  // Un pavé droit en perspective : la profondeur est dessinée plus courte, en biais
  function figurePave(L, l, h, unite) {
    const p = 0.3;
    const echelle = Math.min(26, 240 / (L + p * l), 150 / (h + p * l));
    const W = L * echelle;
    const H = h * echelle;
    const d = p * l * echelle;
    const x = (400 - W - d) / 2 + 10;
    const y = 125 + (H + d) / 2;
    const [A, B, C, D] = [[x, y], [x + W, y], [x + W, y - H], [x, y - H]];
    const [A2, B2, C2, D2] = [A, B, C, D].map(P => [P[0] + d, P[1] - d]);
    const G = [x + (W + d) / 2, y - (H + d) / 2];
    const html = figures.polygone([A, B, C, D], 'fig-plein') + figures.polygone([D, C, C2, D2], 'fig-plein')
      + figures.polygone([B, B2, C2, C], 'fig-plein')
      // les arêtes cachées, en pointillés
      + figures.ligne([A, A2, B2], 'fig-fin fig-cache') + figures.segment(A2, D2, 'fig-fin fig-cache')
      // les arêtes qu’on voit
      + figures.polygone([A, B, C, D], 'fig-trait') + figures.ligne([B, B2, C2, D2, D]) + figures.segment(C, C2)
      + longueurDehors(A, B, mesure(L, unite), G) + longueurDehors(A, D, mesure(h, unite), G)
      + longueurDehors(B, B2, mesure(l, unite), G);
    return figures.svg(400, 250, html, 'Un pavé droit');
  }

  // [la phrase, les dimensions possibles : [de, à, pas] pour chacune des trois]
  const PAVES = [
    [(a, b, c) => `Un pavé droit a pour dimensions ${mesure(a, 'cm')}, ${mesure(b, 'cm')} et ${mesure(c, 'cm')}. `
      + `Son volume est ___${ESPACE}cm³.`, [[2, 9, 1], [2, 9, 1], [2, 9, 1]]],
    [(a, b, c) => `Une boîte à chaussures mesure ${mesure(a, 'cm')} de long, ${mesure(b, 'cm')} de large et ${mesure(c, 'cm')} de haut. `
      + `Son volume est ___${ESPACE}cm³.`, [[25, 35, 5], [15, 20, 5], [10, 15, 5]]],
    [(a, b, c) => `Une brique de jus mesure ${mesure(a, 'cm')}, ${mesure(b, 'cm')} et ${mesure(c, 'cm')}. `
      + `Son volume est ___${ESPACE}cm³.`, [[5, 7, 1], [3, 5, 1], [8, 12, 1]]],
  ];
  const TAS = [
    [(c, r, n) => `Roxy construit un pavé avec des petits cubes : ${c} couches, et dans chaque couche ${r} rangées de ${n}${ESPACE}cubes. `
      + 'Combien de petits cubes utilise-t-elle ?', 'cubes', 'cubes'],
    [(c, r, n) => `Un pavé est fait de petits cubes de 1${ESPACE}cm³ : ${c} couches de ${r} rangées de ${n}${ESPACE}cubes. `
      + 'Quel est son volume ?', 'cm³', 'cm³'],
    [(c, r, n) => `Dans une boîte, les morceaux de sucre sont rangés en ${c} couches de ${r} rangées de ${n}${ESPACE}sucres. `
      + 'Combien y a-t-il de sucres ?', 'sucres', 'sucres'],
  ];
  const BACS = [
    [(a, b, c, prenom) => `L’aquarium de ${prenom} est un pavé droit de ${mesure(a, 'cm')} de long, ${mesure(b, 'cm')} de large `
      + `et ${mesure(c, 'cm')} de haut. Combien de litres d’eau peut-il contenir ?`],
    [(a, b, c) => `Un bac à eau de pluie est un pavé droit de ${mesure(a, 'cm')} sur ${mesure(b, 'cm')} sur ${mesure(c, 'cm')}. `
      + 'Combien de litres peut-il contenir ?'],
  ];
  // [la grandeur à mesurer, sa sorte, la taille de l’objet (cm ou m)]
  const GRANDEURS_ESPACE = [
    ['la longueur d’un crayon', 1, 'cm'], ['la hauteur d’une tasse', 1, 'cm'], ['le tour de ta tête', 1, 'cm'],
    ['l’aire d’une page de cahier', 2, 'cm'], ['l’aire d’un timbre', 2, 'cm'], ['l’aire d’une carte à jouer', 2, 'cm'],
    ['le volume d’un dé à jouer', 3, 'cm'], ['le volume d’une boîte d’allumettes', 3, 'cm'], ['le volume d’une gomme', 3, 'cm'],
    ['la hauteur d’un arbre', 1, 'm'], ['la longueur d’une piscine', 1, 'm'], ['le tour d’un jardin', 1, 'm'],
    ['l’aire du sol d’une chambre', 2, 'm'], ['l’aire d’un terrain de tennis', 2, 'm'], ['l’aire d’un jardin', 2, 'm'],
    ['le volume d’une piscine', 3, 'm'], ['le volume d’une pièce de la maison', 3, 'm'], ['le volume d’un camion de déménagement', 3, 'm'],
  ];
  const EXPOSANT = { 1: '', 2: '²', 3: '³' };
  const SORTES_GRANDEURS = {
    1: 'Une longueur n’a qu’une dimension',
    2: 'Une aire (une surface) a 2 dimensions',
    3: 'Un volume a 3 dimensions',
  };

  ajouterEtape({
    id: '6e-mesures-volume',
    banque: ['pave', 'paveChoix', 'paveChoix', 'cube', 'cubes', 'litres', 'litres', 'aquarium', 'unites', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'pave') {
        const L = entier(4, 12);
        const l = entier(2, Math.min(8, L - 1));
        const h = entier(2, 9);
        const V = L * l * h;
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `Quel est le volume de ce pavé droit ?${figurePave(L, l, h, 'cm')}`,
          reponse: V,
          unite: 'cm³',
          explication: `Volume du pavé droit = Longueur × largeur × hauteur.<br>`
            + `${L} × ${l} × ${h} = ${L * l} × ${h} = <b>${mesure(V, 'cm³')}</b>.`,
        });
      }
      if (sorte === 'paveChoix') {
        const [phrase, dimensions] = parmi(PAVES);
        const [a, b, c] = dimensions.map(([de, jusqua, pas]) => pas * entier(de / pas, jusqua / pas));
        const V = a * b * c;
        return choix({
          consigne: 'Calcule le volume',
          enonce: phrase(a, b, c),
          reponse: V,
          // plus petits : additionner, oublier une dimension, a × b + c ; plus grands : une couche de trop, la virgule (× 10)
          pieges: meilleursPieges(V, [a + b + c, a * b, b * c, a * b + c, a * b * (c + 1), (a + 1) * b * c, V * 10]),
          explication: `Volume du pavé droit = Longueur × largeur × hauteur.<br>`
            + `${ecrire(a)} × ${ecrire(b)} × ${ecrire(c)} = ${ecrire(a * b)} × ${ecrire(c)} = <b>${mesure(V, 'cm³')}</b>.<br>`
            + `⚠️ On multiplie les trois dimensions : on ne les additionne pas !`,
        });
      }
      if (sorte === 'cube') {
        const c = entier(2, 10);
        const V = c * c * c;
        return choix({
          consigne: 'Calcule le volume',
          enonce: `Un cube a des arêtes de ${mesure(c, 'cm')}. Son volume est ___${ESPACE}cm³.`,
          reponse: V,
          // c × 3 au lieu de c × c × c, l’aire d’une face, des 6 faces, les 12 arêtes, une couche ou une arête de trop
          pieges: meilleursPieges(V, [3 * c, c * c, 6 * c * c, 12 * c, c * c * (c + 1), c * (c + 1) * (c + 1)]),
          explication: `Volume du cube = arête × arête × arête.<br>${c} × ${c} × ${c} = ${c * c} × ${c} = <b>${mesure(V, 'cm³')}</b>.<br>`
            + (c === 3 ? '⚠️ 3 × 3 = 9, c’est l’aire d’une seule face, pas le volume.'
              : `⚠️ ${c} × 3 = ${3 * c}, ce n’est pas ${c} × ${c} × ${c} ; et ${c} × ${c} = ${c * c}, c’est l’aire d’une seule face.`),
        });
      }
      if (sorte === 'cubes') {
        const [phrase, unite, mot] = parmi(TAS);
        const couches = entier(2, 5);
        const rangees = entier(2, 6);
        const parRangee = entier(3, 8);
        const couche = rangees * parRangee;
        return nombre({
          consigne: 'Compte les cubes',
          enonce: phrase(couches, rangees, parRangee),
          reponse: couches * couche,
          unite,
          explication: `Une couche : ${rangees} × ${parRangee} = ${couche}${ESPACE}${mot}.<br>`
            + `${couches} couches : ${couches} × ${couche} = <b>${ecrire(couches * couche)}${ESPACE}${mot}</b>.<br>`
            + `⚠️ On multiplie, on n’additionne pas : ${couches} + ${rangees} + ${parRangee} = ${couches + rangees + parRangee} n’est pas le bon compte.`,
        });
      }
      if (sorte === 'litres') {
        const cas = parmi(['L-cm3', 'cm3-L', 'dm3-L', 'mL-cm3', 'm3-L', 'L-dm3']);
        const regle = `1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³, et 1${ESPACE}mL = 1${ESPACE}cm³`;
        let enonce;
        let reponse;
        let pieges;
        let calcul;
        if (cas === 'L-cm3') {
          const n = parmi([2, 3, 4, 5, 6, 8, 0.5, 1.5, 2.5, 0.25]);
          reponse = decaler(n, 3);
          enonce = `${mesure(n, 'L')} = ___${ESPACE}cm³`;
          pieges = [n, decaler(n, 1), decaler(n, 2), decaler(n, 4), decaler(n, 5)];
          calcul = `On multiplie par 1${ESPACE}000 : ${ecrire(n)} × 1${ESPACE}000 = ${ecrire(reponse)}, `
            + `donc ${mesure(n, 'L')} = <b>${mesure(reponse, 'cm³')}</b>`;
        } else if (cas === 'cm3-L') {
          const n = parmi([200, 250, 500, 750, 1500, 2000, 2500, 3000, 330]);
          reponse = decaler(n, -3);
          enonce = `${mesure(n, 'cm³')} = ___${ESPACE}L`;
          pieges = [decaler(n, -6), decaler(n, -5), decaler(n, -4), decaler(n, -2), decaler(n, -1), n, decaler(n, 3)];
          calcul = `On divise par 1${ESPACE}000 : ${ecrire(n)} ÷ 1${ESPACE}000 = ${ecrire(reponse)}, `
            + `donc ${mesure(n, 'cm³')} = <b>${mesure(reponse, 'L')}</b>`;
        } else if (cas === 'dm3-L' || cas === 'L-dm3') {
          const n = auHasard() ? entier(2, 60) : decimal(1, 9.9, 1);
          const [de, vers] = cas === 'dm3-L' ? ['dm³', 'L'] : ['L', 'dm³'];
          reponse = n;
          enonce = `${mesure(n, de)} = ___${ESPACE}${vers}`;
          pieges = [decaler(n, -3), decaler(n, -2), decaler(n, -1), decaler(n, 1), decaler(n, 2), decaler(n, 3)];
          calcul = `C’est le même nombre : ${mesure(n, de)} = <b>${mesure(n, vers)}</b>`;
        } else if (cas === 'mL-cm3') {
          const n = parmi([5, 15, 20, 50, 75, 125, 150, 250, 330, 500]);
          reponse = n;
          enonce = `${mesure(n, 'mL')} = ___${ESPACE}cm³`;
          pieges = [decaler(n, -3), decaler(n, -2), decaler(n, -1), n * 10, n * 100, n * 1000];
          calcul = `C’est le même nombre : ${mesure(n, 'mL')} = <b>${mesure(n, 'cm³')}</b>`;
        } else {
          const n = entier(1, 5);
          reponse = n * 1000;
          enonce = `${mesure(n, 'm³')} = ___${ESPACE}L`;
          pieges = [n, n * 10, n * 100, n * 10000, n * 100000, n * 1000000];
          calcul = n === 1
            ? `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = <b>1${ESPACE}000${ESPACE}L</b>`
            : `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = 1${ESPACE}000${ESPACE}L, `
              + `donc ${mesure(n, 'm³')} = ${n} × 1${ESPACE}000${ESPACE}L = <b>${mesure(reponse, 'L')}</b>`;
        }
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce,
          reponse,
          pieges: meilleursPieges(reponse, pieges.filter(p => p >= 0.0001 && p < 1e7 && decimalesDe(p) <= 4)),
          explication: `${regle}.<br>${calcul}.`,
        }));
      }
      if (sorte === 'aquarium') {
        const [phrase] = parmi(BACS);
        const [a, b, c] = [parmi([40, 50, 60, 80, 100]), parmi([20, 30, 40]), parmi([20, 30, 40, 50])];
        const [da, db, dc] = [a / 10, b / 10, c / 10];
        const litres = da * db * dc;
        return nombre({
          consigne: 'Résous le problème',
          enonce: phrase(a, b, c, parmi(PRENOMS_CONSONNE)),
          reponse: litres,
          unite: 'L',
          explication: `On convertit en dm : ${mesure(a, 'cm')} = ${mesure(da, 'dm')} ; ${mesure(b, 'cm')} = ${mesure(db, 'dm')} ; `
            + `${mesure(c, 'cm')} = ${mesure(dc, 'dm')}.<br>Volume : ${da} × ${db} × ${dc} = ${mesure(litres, 'dm³')}, `
            + `et 1${ESPACE}dm³ = 1${ESPACE}L.<br>Il peut contenir <b>${mesure(litres, 'L')}</b>.`,
        });
      }
      if (sorte === 'unites') {
        const [grandeur, dimensions, base] = parmi(GRANDEURS_ESPACE);
        const reponse = base + EXPOSANT[dimensions];
        return choix({
          consigne: 'Choisis l’unité qui convient',
          enonce: `On mesure ${grandeur} en ___.`,
          reponse,
          choix: [base, base + '²', base + '³'],
          explication: `${SORTES_GRANDEURS[dimensions]} : pour ${grandeur}, on choisit les <b>${reponse}</b>.<br>`
            + `(cm ou m : une longueur ; cm² ou m² : une aire ; cm³ ou m³ : un volume.)`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['relation', 'cube', 'pave']);
      if (famille === 'relation') {
        const phrase = parmi(vrai
          ? [`1${ESPACE}L = 1${ESPACE}dm³`, `1${ESPACE}mL = 1${ESPACE}cm³`, `1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³`,
            `1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³`, `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L`]
          : [`1${ESPACE}L = 100${ESPACE}cm³`, `1${ESPACE}L = 1${ESPACE}cm³`, `1${ESPACE}dm³ = 100${ESPACE}cm³`,
            `1${ESPACE}mL = 1${ESPACE}dm³`, `1${ESPACE}m³ = 100${ESPACE}L`]);
        return vraiFaux({
          enonce: `${phrase}`,
          vrai,
          explication: `À savoir : <b>1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³</b>, et <b>1${ESPACE}mL = 1${ESPACE}cm³</b>. `
            + `Et 1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = 1${ESPACE}000${ESPACE}L.`,
        });
      }
      if (famille === 'cube') {
        const c = entier(2, 6);
        const faux = parmi([3 * c, c * c, 6 * c * c].filter(v => v !== c * c * c));
        return vraiFaux({
          enonce: `Un cube de ${mesure(c, 'cm')} d’arête a un volume de ${mesure(vrai ? c * c * c : faux, 'cm³')}.`,
          vrai,
          explication: `Volume du cube = arête × arête × arête : ${c} × ${c} × ${c} = <b>${mesure(c * c * c, 'cm³')}</b>.`,
        });
      }
      const [a, b, c] = [entier(3, 8), entier(2, 6), entier(2, 5)];
      const faux = parmi([a + b + c, a * b]);
      return vraiFaux({
        enonce: `Un pavé droit de ${mesure(a, 'cm')} sur ${mesure(b, 'cm')} sur ${mesure(c, 'cm')} a un volume de `
          + `${mesure(vrai ? a * b * c : faux, 'cm³')}.`,
        vrai,
        explication: `Volume = ${a} × ${b} × ${c} = ${a * b} × ${c} = <b>${mesure(a * b * c, 'cm³')}</b>.`
          + (vrai ? '' : faux === a + b + c ? '<br>⚠️ On multiplie les dimensions, on ne les additionne pas !'
            : '<br>⚠️ Il faut multiplier les trois dimensions, pas seulement deux.'),
      });
    },
    titreLecon: 'Le volume',
    lecon: `
      <p>Le <b>volume</b> d’un solide, c’est la <b>place qu’il occupe</b>. On peut le mesurer en comptant des petits cubes.</p>
      <p>1&nbsp;cm³ est le volume d’un cube de 1&nbsp;cm d’arête. On utilise aussi le dm³ et le m³.</p>
      <table>
        <tr><th>⭐ Pavé droit</th><td>Longueur × largeur × hauteur</td></tr>
        <tr><th>⭐ Cube</th><td>arête × arête × arête</td></tr>
      </table>
      ${figurePave(5, 4, 3, 'cm')}
      <p>👉 <i>5 × 4 × 3 = 60&nbsp;cm³</i> : 3 couches de 5 × 4 = 20 petits cubes de 1&nbsp;cm³.</p>
      <h4>⭐ Volume et contenance</h4>
      <p><b>1&nbsp;L = 1&nbsp;dm³ = 1&nbsp;000&nbsp;cm³</b> · <b>1&nbsp;mL = 1&nbsp;cm³</b> · 1&nbsp;m³ = 1&nbsp;000&nbsp;L</p>
      <p>👉 Un aquarium de 50&nbsp;cm sur 30&nbsp;cm sur 40&nbsp;cm : en dm, 5 × 3 × 4 = 60&nbsp;dm³. Il contient 60&nbsp;L.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le petit chiffre compte les dimensions ! Une longueur en cm (1 dimension),
        une aire en cm² (2 dimensions), un volume en cm³ (3 dimensions).</div>
      <p>⚠️ Pour un volume, on <b>multiplie</b> les trois dimensions : on ne les additionne pas !</p>
    `,
  });
})();
