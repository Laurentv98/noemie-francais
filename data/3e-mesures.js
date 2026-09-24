// Renard Malin — Maths, niveau 3e : les 6 étapes du Moulin des Mesures
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Les nombres « tombent juste » : des valeurs exactes avec π (36π cm³),
// ou des valeurs approchées avec π ≈ 3,14. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. la sphère et la boule · 2. agrandir et réduire · 3. les sections de solides ·
// 4. les grandeurs composées · 5. les volumes (révision) · 6. se repérer dans l’espace

(function () {
  const {
    ESPACE, entier, parmi, net, arrondir, ecrire, mesure, euros, decimalesDe, lireNombre, egaux,
    frac, pgcd, choix, nombre, vraiFaux, ajouterEtape, figures,
  } = RM.maths;
  const F = figures; // les dessins : F.segment, F.polygone, F.angleDroit…

  // ======================================================================
  // Les petits outils communs à toutes les étapes
  // ======================================================================
  // Vrai une fois sur deux (ou avec la probabilité donnée)
  const auHasard = (probabilite = 0.5) => Math.random() < probabilite;
  // Une majuscule au début d’une phrase
  const majuscule = texte => texte.charAt(0).toUpperCase() + texte.slice(1);

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

  // Une question à boutons (des mots) prise dans une liste de [énoncé, réponse, pièges, explication]
  function questionMots(consigne, liste) {
    const [enonce, reponse, pieges, explication] = parmi(liste);
    return choix({ consigne, enonce, reponse, pieges, explication });
  }

  // Multiplier par 10, 100, 1 000… (k rangs) ; si k est négatif, on divise
  const decaler = (x, k) => net(k >= 0 ? x * 10 ** k : x / 10 ** -k);

  // π, comme dans les exercices : π ≈ 3,14 ; et une valeur exacte : avecPi(36, 'cm³') → « 36π cm³ »
  const PI = 3.14;
  const foisPi = x => net(PI * x);
  const avecPi = (n, unite) => `${net(n) === 1 ? '' : ecrire(n)}π${ESPACE}${unite}`;
  // Le carré et le cube d’une unité : cm → cm², cm³
  const carre = u => u + '²';
  const cube = u => u + '³';

  // ======================================================================
  // Les outils pour dessiner les figures
  // ======================================================================
  const r1 = x => Math.round(x * 10) / 10;
  const xy = P => `${r1(P[0])} ${r1(P[1])}`;
  const milieu = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  // Une arête cachée : en pointillés fins
  const traitCache = (A, B) => F.segment(A, B, 'fig-marque fig-cache');
  // La perspective cavalière : la profondeur est dessinée en biais (à 45°) et réduite de moitié
  const FUYANTE = 0.5 * Math.SQRT1_2;

  // Écrire une longueur le long d’un côté [AB], à l’extérieur de la figure (G : un point à l’intérieur)
  function longueurDehors(A, B, texte, G) {
    const n = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u = [(B[0] - A[0]) / n, (B[1] - A[1]) / n];
    const M = milieu(A, B);
    // F.longueur écrit du côté (−u[1], u[0]) ; si ce côté va vers G, on prend l’autre
    const versG = (G[0] - M[0]) * -u[1] + (G[1] - M[1]) * u[0];
    // Plus loin d’un côté presque vertical : le texte est plus large que haut
    return F.longueur(A, B, texte, { cote: versG > 0 ? -1 : 1, distance: 16 + 22 * Math.abs(u[1]) });
  }

  // Une ellipse (un cercle vu en perspective) : la moitié de derrière en pointillés, celle de devant en trait plein.
  // classe : la classe du trait de devant (celui de derrière est le même, en pointillés)
  function ellipse(C, rx, ry, classe = 'fig-marque') {
    const demi = devant => `<path d="M ${xy([C[0] - rx, C[1]])} A ${r1(rx)} ${r1(ry)} 0 0 ${devant ? 0 : 1} ${xy([C[0] + rx, C[1]])}" `
      + `class="${classe}${devant ? '' : ' fig-cache'}"/>`;
    return demi(false) + demi(true);
  }

  // Une boule (ou une sphère) de centre O, avec son équateur (un grand cercle) et un rayon [OM] (ou un diamètre).
  // texte : la longueur écrite à côté du rayon (ou, précédée de « d = », à côté du diamètre)
  function figureBoule({ texte = '', diametre = false, lecon = false } = {}) {
    const O = [230, 128];
    const R = 100;
    const a = 38 * Math.PI / 180;
    const M = [O[0] + R * Math.cos(a), O[1] - R * Math.sin(a)];
    const N = [2 * O[0] - M[0], 2 * O[1] - M[1]];
    let html = F.cercle(O, R, 'fig-plein') + ellipse(O, R, 26) + F.cercle(O, R)
      + F.segment(diametre ? N : O, M, 'fig-accent') + F.point(O, 'O', { dx: -14, dy: -12 });
    // Le texte au-dessus de [OM] ; pour le diamètre, « d = 12 cm », pour qu’on ne le prenne pas pour un rayon
    if (texte) html += F.longueur(O, M, diametre ? `d = ${texte}` : texte, { cote: -1, distance: 12 });
    if (lecon) {
      html += F.point(M, 'M', { dx: 14, dy: -8 })
        + F.texte([O[0] + R + 6, O[1] + 18], 'un grand cercle', { classe: 'fig-petit', ancre: 'start' });
    }
    return F.svg(460, 250, html, diametre ? 'Une boule et son diamètre' : 'Une boule et son rayon');
  }

  // ======================================================================
  // 1. La sphère et la boule
  // ======================================================================
  // L’aire exacte de la sphère : 4 × π × r² (on écrit le nombre qui est devant π)
  const aireSphere = r => net(4 * r * r);
  // Le volume exact de la boule : 4/3 × π × r³
  const volumeBoule = r => net(4 * r ** 3 / 3);
  // Des rayons pour lesquels 4/3 × r³ tombe juste
  const RAYONS_BOULE = [1.5, 3, 4.5, 6, 9, 12];

  // Le rayon est donné directement (le plus souvent), ou le diamètre (qu’il faut diviser par 2)
  function donnerRayon(r, unite, sujet) {
    if (auHasard(0.7)) return { phrase: `${sujet} a un rayon de ${mesure(r, unite)}.`, rappel: '', diametre: false };
    return {
      phrase: `${sujet} a un diamètre de ${mesure(2 * r, unite)}.`,
      rappel: `Le rayon est la moitié du diamètre : ${ecrire(2 * r)} ÷ 2 = ${mesure(r, unite)}.<br>`,
      diametre: true,
    };
  }
  // Le calcul de r³ : « 3 × 3 × 3 = 27 »
  const calculCube = r => `${ecrire(r)} × ${ecrire(r)} × ${ecrire(r)} = ${ecrire(net(r ** 3))}`;

  const VOCABULAIRE_SPHERE = [
    ['Dans l’espace, l’ensemble des points situés à 4&nbsp;cm d’un point O est ___.', 'une sphère',
      ['une boule', 'un cercle', 'un disque'],
      'Tous les points de l’espace à la même distance de O : c’est <b>une sphère</b> de centre O et de rayon 4&nbsp;cm (la « peau »).'],
    ['Dans l’espace, l’ensemble des points situés à 4&nbsp;cm ou moins d’un point O est ___.', 'une boule',
      ['une sphère', 'un cercle', 'un disque'],
      'La sphère et tout son intérieur : c’est <b>une boule</b>, un solide plein.'],
    ['Dans un plan, l’ensemble des points situés à 4&nbsp;cm d’un point O est ___.', 'un cercle',
      ['une sphère', 'une boule', 'un disque'],
      'Dans un <b>plan</b>, c’est <b>un cercle</b>. Dans l’espace, ce serait une sphère.'],
    ['Une bille pleine, c’est ___.', 'une boule', ['une sphère', 'un cercle', 'un disque'],
      'Une bille est pleine : c’est <b>une boule</b>. La sphère n’est que sa surface.'],
    ['La surface d’un ballon, c’est ___.', 'une sphère', ['une boule', 'un cercle', 'un disque'],
      'On parle de la <b>surface</b>, la « peau » du ballon : c’est <b>une sphère</b>.'],
    ['Un segment qui relie le centre d’une sphère à un point de la sphère est ___.', 'un rayon',
      ['un diamètre', 'un grand cercle', 'une arête'],
      'Du centre à un point de la sphère : c’est <b>un rayon</b>. Tous les rayons ont la même longueur.'],
    ['Un segment qui relie deux points d’une sphère en passant par son centre est ___.', 'un diamètre',
      ['un rayon', 'un grand cercle', 'une arête'],
      'Il passe par le centre : c’est <b>un diamètre</b>. Il mesure deux fois le rayon.'],
    ['Un cercle tracé sur une sphère, qui a le même centre et le même rayon qu’elle, est ___.', 'un grand cercle',
      ['une sphère', 'un disque', 'une boule'],
      'C’est <b>un grand cercle</b> de la sphère, comme l’équateur sur la Terre.'],
  ];

  // [l’énoncé, la réponse, les pièges, l’explication]
  const FORMULES_SPHERE = [
    ['L’aire d’une sphère de rayon r est ___.', '4 × π × r²', ['π × r²', '4/3 × π × r³', '2 × π × r', '4 × π × r³'],
      'Aire de la sphère = <b>4 × π × r²</b> : 4 fois l’aire d’un grand disque (π × r²). Une aire a un « ² ».'],
    ['Le volume d’une boule de rayon r est ___.', '4/3 × π × r³', ['4 × π × r²', '4 × π × r³', '4/3 × π × r²', 'π × r³'],
      `Volume de la boule = <b>${frac(4, 3)} × π × r³</b>. Un volume a un « ³ » ; 4 × π × r², c’est l’aire de la sphère.`],
    ['Le volume d’une demi-boule de rayon r est ___.', '2/3 × π × r³', ['4/3 × π × r³', '2 × π × r²', '2/3 × π × r²', '2 × π × r³'],
      `La moitié du volume de la boule : ${frac(4, 3)} ÷ 2 = ${frac(2, 3)}, donc V = <b>${frac(2, 3)} × π × r³</b>.`],
  ];

  const REGLES_SPHERE = [
    ['L’aire d’une sphère de rayon r est 4 × π × r².', true, 'Oui : aire de la sphère = <b>4 × π × r²</b>.'],
    ['L’aire d’une sphère de rayon r est π × r².', false,
      'Non : π × r², c’est l’aire d’un grand disque. L’aire de la sphère est 4 fois plus grande : <b>4 × π × r²</b>.'],
    [`Le volume d’une boule de rayon r est ${frac(4, 3)} × π × r³.`, true, `Oui : volume de la boule = <b>${frac(4, 3)} × π × r³</b>.`],
    ['Le volume d’une boule de rayon r est 4 × π × r³.', false,
      `Non : il faut diviser par 3. Volume de la boule = <b>${frac(4, 3)} × π × r³</b>.`],
    ['Tous les points d’une sphère sont à la même distance de son centre.', true,
      'Oui : cette distance est le <b>rayon</b> de la sphère.'],
    ['Une sphère et une boule, c’est la même chose.', false,
      'Non : la <b>sphère</b> est la surface (la « peau ») ; la <b>boule</b> est le solide plein, la sphère et son intérieur.'],
    ['Le volume d’une boule s’exprime en cm².', false, 'Non : un volume s’exprime en <b>cm³</b> (ou m³, dm³…). Les cm² sont pour les aires.'],
    ['Un grand cercle d’une sphère a le même rayon que la sphère.', true,
      'Oui : un grand cercle a <b>le même centre et le même rayon</b> que la sphère (comme l’équateur sur la Terre).'],
  ];

  ajouterEtape({
    id: '3e-mesures-sphere',
    banque: ['aireExacte', 'aireExacte', 'volumeExact', 'volumeExact', 'approche', 'approche', 'approche', 'demiBoule',
      'vocabulaire', 'vocabulaire', 'formule', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'aireExacte') {
        const r = parmi([1.5, 2.5, 3, 4, 5, 6, 7, 8, 9, 10]);
        const u = parmi(['cm', 'cm', 'dm', 'm']);
        const { phrase, rappel, diametre } = donnerRayon(r, u, 'Une sphère');
        const A = aireSphere(r);
        const petit = auHasard();
        // π × r² (l’aire d’un grand disque), 4 × π × r (le carré oublié), 2 × π × r (la longueur d’un grand cercle),
        // 2 × π × r², 4 × π × r³ (le cube au lieu du carré), et le diamètre pris pour le rayon ;
        // la formule du volume quand elle tombe juste
        const pieges = [r * r, 4 * r, 2 * r, 2 * r * r, net(4 * r ** 3)];
        if (diametre) pieges.push(16 * r * r);
        if (Number.isInteger(volumeBoule(r))) pieges.push(volumeBoule(r));
        return choix({
          consigne: 'Calcule l’aire exacte',
          enonce: `${phrase} Son aire exacte est ___.`,
          reponse: avecPi(A, carre(u)),
          pieges: meilleursPieges(A, pieges).map(n => avecPi(n, carre(u))),
          // l’erreur dont parle l’explication : tantôt plus petite (π × r²), tantôt plus grande (4 × π × r³) que la réponse
          garder: [petit ? avecPi(r * r, carre(u)) : avecPi(net(4 * r ** 3), carre(u))],
          explication: `${rappel}Aire de la sphère = 4 × π × r².<br>4 × π × ${ecrire(r)}² = 4 × ${ecrire(r * r)} × π = <b>${avecPi(A, carre(u))}</b>.<br>`
            + (petit ? `⚠️ π × r² = ${avecPi(r * r, carre(u))}, c’est l’aire d’un grand disque : la sphère en a 4 fois plus.`
              : `⚠️ C’est r² (r × r), pas r³ : une aire s’écrit avec un ² (${carre(u)}).`),
        });
      }
      if (sorte === 'volumeExact') {
        const r = parmi(RAYONS_BOULE);
        const u = parmi(['cm', 'cm', 'dm', 'm']);
        const V = volumeBoule(r);
        const sansDiviser = auHasard();
        const avecFigure = auHasard(0.3);
        const { phrase, rappel, diametre } = avecFigure ? { phrase: '', rappel: '', diametre: auHasard(0.3) }
          : donnerRayon(r, u, 'Une boule');
        // 4 × r³ (le ÷ 3 oublié), r³ (le 4/3 oublié), l’aire de la sphère, r² au lieu de r³, et le diamètre pris pour le rayon
        const pieges = [4 * r ** 3, r ** 3, 4 * r * r, 4 * r * r / 3];
        if (diametre) pieges.push(volumeBoule(2 * r));
        const texteRayon = diametre ? mesure(2 * r, u) : mesure(r, u);
        return choix({
          consigne: 'Calcule le volume exact',
          enonce: avecFigure ? `Quel est le volume exact de cette boule ?${diametre ? ' Le segment orange est un diamètre.' : ''}`
            + figureBoule({ texte: texteRayon, diametre })
            : `${phrase} Son volume exact est ___.`,
          reponse: avecPi(V, cube(u)),
          pieges: meilleursPieges(V, pieges.map(net)).map(n => avecPi(n, cube(u))),
          // l’erreur dont parle l’explication : le ÷ 3 oublié (plus grand) ou le 4/3 oublié (plus petit)
          garder: [sansDiviser ? avecPi(net(4 * r ** 3), cube(u)) : avecPi(net(r ** 3), cube(u))],
          explication: `${avecFigure && diametre ? `Le rayon est la moitié du diamètre : ${ecrire(2 * r)} ÷ 2 = ${mesure(r, u)}.<br>` : rappel}`
            + `Volume de la boule = ${frac(4, 3)} × π × r³, et r³ = ${calculCube(r)}.<br>`
            + `${ecrire(net(r ** 3))} × 4 ÷ 3 = ${ecrire(net(4 * r ** 3))} ÷ 3 = ${ecrire(V)} : V = <b>${avecPi(V, cube(u))}</b>.<br>`
            + (sansDiviser ? `⚠️ Sans le ÷ 3, on trouverait ${avecPi(net(4 * r ** 3), cube(u))}.`
              : `⚠️ Sans le ${frac(4, 3)}, on trouverait ${avecPi(net(r ** 3), cube(u))}.`),
        });
      }
      if (sorte === 'approche') {
        if (auHasard()) {
          // L’aire de la sphère, avec π ≈ 3,14
          const r = parmi([2, 3, 4, 5, 10]);
          const u = parmi(['cm', 'dm', 'm']);
          const A = foisPi(4 * r * r);
          const avecFigure = auHasard(0.4);
          return nombre({
            consigne: 'Calcule une valeur approchée',
            enonce: avecFigure ? `Quelle est l’aire de cette sphère ? Prends π ≈ 3,14.${figureBoule({ texte: mesure(r, u) })}`
              : `Quelle est l’aire d’une sphère de rayon ${mesure(r, u)} ? Prends π ≈ 3,14.`,
            reponse: A,
            unite: carre(u),
            explication: `Aire = 4 × π × r² ≈ 4 × 3,14 × ${ecrire(r * r)} = 12,56 × ${ecrire(r * r)} = <b>${mesure(A, carre(u))}</b>.`,
          });
        }
        // Le volume de la boule, avec π ≈ 3,14
        const [r, debut] = parmi([
          [3, 'Une boule de glace a un rayon de'],
          [parmi([3, 6, 9]), 'Une boule a un rayon de'],
          [6, 'Un pamplemousse a la forme d’une boule de rayon'],
          [1.5, 'Une bille a un rayon de'],
          [4.5, 'Une orange a la forme d’une boule de rayon'],
        ]);
        const exact = volumeBoule(r);
        const V = foisPi(exact);
        return nombre({
          consigne: 'Calcule une valeur approchée',
          enonce: `${debut} ${mesure(r, 'cm')}. Quel est son volume ? Prends π ≈ 3,14.`,
          reponse: V,
          unite: 'cm³',
          explication: `V = ${frac(4, 3)} × π × r³, et r³ = ${calculCube(r)}.<br>`
            + `${ecrire(net(r ** 3))} × 4 ÷ 3 = ${ecrire(exact)}, puis ${ecrire(exact)} × 3,14 = <b>${mesure(V, 'cm³')}</b>.`,
        });
      }
      if (sorte === 'demiBoule') {
        if (auHasard()) {
          // Le volume exact d’une demi-boule : la moitié de 4/3 × π × r³
          const [rayons, u, debut, fin] = parmi([
            [[1.5, 3], 'm', 'L’intérieur d’un igloo est une demi-boule de rayon', 'Son volume exact est ___.'],
            [[4.5, 6], 'cm', 'Un bol a la forme d’une demi-boule de rayon intérieur', 'Sa contenance exacte est ___.'],
            [[9, 12], 'cm', 'Un saladier a la forme d’une demi-boule de rayon intérieur', 'Sa contenance exacte est ___.'],
            [[3, 4.5], 'cm', 'Une coupelle a la forme d’une demi-boule de rayon intérieur', 'Sa contenance exacte est ___.'],
          ]);
          const r = parmi(rayons);
          const phrase = `${debut} ${mesure(r, u)}. ${fin}`;
          const V = net(volumeBoule(r) / 2);
          // la boule entière, le ÷ 3 oublié, l’aire de la demi-sphère (2 × π × r²), r² au lieu de r³, divisé par 2 deux fois
          const pieges = [volumeBoule(r), 2 * r ** 3, 2 * r * r, 2 * r * r / 3, volumeBoule(r) / 4].map(net);
          return choix({
            consigne: 'Calcule le volume exact',
            enonce: phrase,
            reponse: avecPi(V, cube(u)),
            pieges: meilleursPieges(V, pieges).map(n => avecPi(n, cube(u))),
            garder: [avecPi(volumeBoule(r), cube(u))],
            explication: `Boule entière : ${frac(4, 3)} × π × r³, avec r³ = ${calculCube(r)} ; ${ecrire(net(r ** 3))} × 4 ÷ 3 = `
              + `${ecrire(volumeBoule(r))}, soit ${avecPi(volumeBoule(r), cube(u))}.<br>`
              + `La demi-boule, c’est la moitié : ${ecrire(volumeBoule(r))} ÷ 2 = ${ecrire(V)}, donc <b>${avecPi(V, cube(u))}</b>.`,
          });
        }
        // L’aire d’un dôme en demi-sphère (sans le fond) : la moitié de 4 × π × r²
        const r = parmi([3, 4, 5, 6, 8, 10]);
        const A = foisPi(2 * r * r);
        return nombre({
          consigne: 'Calcule une valeur approchée',
          enonce: `Le toit d’un observatoire est un dôme en forme de demi-sphère de rayon ${mesure(r, 'm')}. `
            + 'Quelle est l’aire de ce dôme ? Prends π ≈ 3,14.',
          reponse: A,
          unite: 'm²',
          explication: `La demi-sphère, c’est la moitié de la sphère : 4 × π × r² ÷ 2 = 2 × π × r².<br>`
            + `2 × 3,14 × ${r * r} = 6,28 × ${r * r} = <b>${mesure(A, 'm²')}</b> (le dôme n’a pas de fond : on ne compte pas le disque).`,
        });
      }
      if (sorte === 'vocabulaire') return questionMots('Choisis le bon mot', VOCABULAIRE_SPHERE);
      if (sorte === 'formule') return questionMots('Choisis la bonne formule', FORMULES_SPHERE);
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      const vrai = auHasard();
      const famille = parmi(['aire', 'volume', 'regle', 'regle']);
      if (famille === 'aire') {
        const r = entier(2, 6);
        const faux = parmi([r * r, 4 * r, 2 * r * r].filter(x => x !== 4 * r * r));
        return vraiFaux({
          enonce: `Une sphère de rayon ${mesure(r, 'cm')} a une aire de ${avecPi(vrai ? 4 * r * r : faux, 'cm²')}.`,
          vrai,
          explication: `Aire = 4 × π × r² = 4 × π × ${r}² = 4 × ${r * r} × π = <b>${avecPi(4 * r * r, 'cm²')}</b>.`,
        });
      }
      if (famille === 'volume') {
        const r = parmi([3, 6]);
        const V = volumeBoule(r);
        const faux = parmi([4 * r ** 3, r ** 3, 4 * r * r].filter(x => x !== V));
        return vraiFaux({
          enonce: `Une boule de rayon ${mesure(r, 'cm')} a un volume de ${avecPi(vrai ? V : faux, 'cm³')}.`,
          vrai,
          explication: `V = ${frac(4, 3)} × π × r³, avec r³ = ${calculCube(r)} ; ${r ** 3} × 4 ÷ 3 = ${V}, donc V = <b>${avecPi(V, 'cm³')}</b>.`,
        });
      }
      return vraiFauxDans(REGLES_SPHERE, vrai);
    },
    titreLecon: 'La sphère et la boule',
    lecon: `
      <p>La <b>sphère</b> de centre O et de rayon r, ce sont tous les points de l’espace situés <b>à la distance r</b> de O :
        c’est une surface, la « peau ». La <b>boule</b> est le solide plein : les points situés à une distance
        <b>inférieure ou égale</b> à r de O.</p>
      ${figureBoule({ texte: 'r', lecon: true })}
      <p>[OM] est un <b>rayon</b>. Un <b>diamètre</b> relie deux points de la sphère en passant par O : il mesure d = 2 × r.
        Un <b>grand cercle</b> a le même centre et le même rayon que la sphère (comme l’équateur sur la Terre).</p>
      <table>
        <tr><th>Aire de la sphère</th><td>4 × π × r²</td><td>en cm², m²…</td></tr>
        <tr><th>Volume de la boule</th><td>${frac(4, 3)} × π × r³</td><td>en cm³, m³…</td></tr>
      </table>
      <p>👉 <i>r = 6&nbsp;cm : aire = 4 × π × 36 = 144π&nbsp;cm² ≈ 452,16&nbsp;cm² ;
        volume = ${frac(4, 3)} × π × 216 = 288π&nbsp;cm³ (216 × 4 ÷ 3 = 288) ≈ 904,32&nbsp;cm³.</i></p>
      <p>La <b>valeur exacte</b> garde π (288π&nbsp;cm³) ; avec π ≈ 3,14, on obtient une <b>valeur approchée</b>.</p>
      <p>👉 Une <b>demi-boule</b> a pour volume la moitié : ${frac(2, 3)} × π × r³. Une demi-sphère (sans le fond) a pour aire 2 × π × r².</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le petit ² de r² rappelle les cm² de l’aire, le petit ³ de r³ les cm³ du volume.
        Pour ${frac(4, 3)} × r³ : calcule r³, multiplie par 4, puis divise par 3.</div>
      <p>⚠️ Si on te donne le <b>diamètre</b>, divise-le d’abord par 2. Et π × r², c’est l’aire d’un grand disque :
        la sphère a 4 fois plus d’aire !</p>
    `,
  });

  // ======================================================================
  // 2. Agrandir et réduire
  // ======================================================================
  // Un rapport k = n/d : [n, d]. Les agrandissements (k > 1) et les réductions (0 < k < 1)
  const AGRANDISSEMENTS = [[2, 1], [3, 1], [4, 1], [5, 1], [3, 2]];
  const REDUCTIONS = [[1, 2], [1, 3], [2, 3], [1, 4]];
  const EXPOSANT = { 1: '', 2: '²', 3: '³' };
  // Le rapport écrit : « 3 », « 1,5 » ou la fraction 2/3
  const texteRapport = ([n, d]) => (d === 1 || d === 2 && n === 3 ? ecrire(n / d) : frac(n, d));
  // k², k³ : le calcul écrit (« 3² = 9 », « 1,5² = 2,25 », « (2/3)² = 4/9 »)
  function calculPuissance([n, d], p) {
    if (d === 1 || (d === 2 && n === 3)) return `${ecrire(n / d)}${EXPOSANT[p]} = ${ecrire(net((n / d) ** p))}`;
    return `(${frac(n, d)})${EXPOSANT[p]} = ${frac(n ** p, d ** p)}`;
  }
  // Multiplier une mesure par k² ou k³ : le calcul écrit (« 12 × 9 = 108 », « 45 × 4/9 = 45 ÷ 9 × 4 = 20 »)
  function calculMultiplier(x, [n, d], p) {
    const resultat = net(x * n ** p / d ** p);
    if (d === 1 || (d === 2 && n === 3)) return `${ecrire(x)} × ${ecrire(net((n / d) ** p))} = ${ecrire(resultat)}`;
    if (n === 1) return `${ecrire(x)} × ${frac(1, d ** p)} = ${ecrire(x)} ÷ ${ecrire(d ** p)} = ${ecrire(resultat)}`;
    return `${ecrire(x)} × ${frac(n ** p, d ** p)} = ${ecrire(x)} ÷ ${ecrire(d ** p)} × ${n ** p} = ${ecrire(resultat)}`;
  }
  const nomTransformation = ([n, d]) => (n > d ? 'un agrandissement' : 'une réduction');
  const LA_REGLE = 'les longueurs sont multipliées par k, les aires par k² et les volumes par k³';

  // Pour « coefficient » et « effet » : des rapports simples (des entiers, ou des décimaux pour réduire)
  const RAPPORTS_SIMPLES = [2, 3, 4, 5, 10, 0.5, 0.1, 0.2];
  // Les nombres possibles pour « × k² » : k, 2 × k (k² confondu avec 2 × k), 3 × k (k³ confondu avec 3 × k), k², k³ ;
  // pour les volumes, des erreurs plus grandes que k³ (ou plus petites, si k < 1) : 9 pour 2³ (confondu avec 3²),
  // un zéro de trop (10 000 pour 10³, 0,0001 pour 0,1³), la virgule mal placée (0,0125 pour 0,5³)
  function multiplicateurs(k, volume = false) {
    const liste = [k, 2 * k, 3 * k, k * k, k ** 3];
    if (volume && k === 2) liste.push(9);
    if (volume && (k === 10 || k === 0.1)) liste.push(k ** 4);
    if (volume && k === 0.5) liste.push(k ** 3 / 10);
    return liste.map(net);
  }
  // L’erreur « k³ = 3 × k », expliquée (avec k = 3, 3 × 3 est aussi 3², le nombre des aires)
  const pasTroisFois = k => (k === 3 ? '⚠️ 3³ = 3 × 3 × 3 = 27, et pas 3² = 9 (ça, c’est pour les aires).'
    : `⚠️ ${ecrire(k)}³ = ${ecrire(k)} × ${ecrire(k)} × ${ecrire(k)} : on multiplie ${ecrire(k)} par lui-même, pas par 3 (3 × ${ecrire(k)} = ${ecrire(net(3 * k))}).`);

  // [ce qu’on change, ce qu’on regarde (volume), (aire)]
  const SOLIDES_EFFET = [
    ['le rayon d’une boule', 'son volume', 'l’aire de la sphère'],
    ['l’arête d’un cube', 'son volume', 'l’aire de chaque face'],
    ['toutes les longueurs d’un pavé droit', 'son volume', 'l’aire de chaque face'],
    ['toutes les dimensions d’un cône', 'son volume', 'l’aire de sa base'],
    ['toutes les longueurs d’une pyramide', 'son volume', 'l’aire de sa base'],
  ];
  // [comment on change les longueurs, le facteur, on multiplie (true) ou on divise (false)]
  const ACTIONS_EFFET = [['double', 2, true], ['triple', 3, true], ['multiplie par 10', 10, true],
    ['divise par 2', 2, false], ['divise par 3', 3, false]];

  // Les maquettes : les aires (la réponse en m²) et les volumes (la réponse en litres)
  // [la phrase, l’échelle (1/n), la mesure sur la maquette]
  const MAQUETTES_AIRES = [
    [(s, n) => `Sur la maquette d’une maison à l’échelle 1/${n}, le sol du salon a une aire de ${mesure(s, 'cm²')}. `
      + 'Quelle est l’aire du vrai salon, en m² ?', 50, [80, 100, 120, 144, 160]],
    [(s, n) => `Sur la maquette d’un immeuble à l’échelle 1/${n}, une terrasse a une aire de ${mesure(s, 'cm²')}. `
      + 'Quelle est l’aire de la vraie terrasse, en m² ?', 100, [20, 36, 50, 80]],
    [(s, n) => `Dans la maquette d’une chambre à l’échelle 1/${n}, le tapis a une aire de ${mesure(s, 'cm²')}. `
      + 'Quelle est l’aire du vrai tapis, en m² ?', 20, [50, 75, 100]],
  ];
  const MAQUETTES_VOLUMES = [
    [v => `Le coffre de la maquette d’une voiture, à l’échelle 1/20, a un volume de ${mesure(v, 'cm³')}. Le vrai coffre a un volume de ___.`,
      20, [40, 50, 60]],
    [v => `Le réservoir de la maquette d’une voiture, à l’échelle 1/20, a un volume de ${mesure(v, 'cm³')}. Le vrai réservoir contient ___.`,
      20, [5, 6, 7]],
    [v => `La maquette d’un aquarium, à l’échelle 1/10, contient ${mesure(v, 'cm³')} d’eau. Le vrai aquarium contient ___.`,
      10, [40, 60, 80, 100, 120]],
    [v => `La baignoire d’une maison de poupée, à l’échelle 1/10, contient ${mesure(v, 'cm³')}. Une vraie baignoire de même forme contient ___.`,
      10, [120, 150, 180]],
  ];

  const REGLES_AGRANDISSEMENT = [
    ['Dans un agrandissement, les angles ne changent pas.', true,
      'Oui : un agrandissement ou une réduction garde la <b>forme</b> et les <b>angles</b> ; seules les longueurs changent.'],
    ['Une réduction a un rapport k compris entre 0 et 1.', true,
      'Oui : si 0 &lt; k &lt; 1, les longueurs sont multipliées par k, donc elles <b>diminuent</b> : c’est une réduction.'],
    ['Dans un agrandissement de rapport 3, les volumes sont multipliés par 27.', true,
      'Oui : les volumes sont multipliés par k³ = 3 × 3 × 3 = <b>27</b>.'],
    ['Dans un agrandissement de rapport 5, les aires sont multipliées par 25.', true,
      'Oui : les aires sont multipliées par k² = 5 × 5 = <b>25</b>.'],
    ['Dans une réduction de rapport 0,5, les aires sont divisées par 2.', false,
      'Non : les aires sont multipliées par k² = 0,5 × 0,5 = 0,25 : elles sont <b>divisées par 4</b>.'],
    ['Dans un agrandissement de rapport 2, les aires sont multipliées par 2.', false,
      'Non : les aires sont multipliées par k² = 2 × 2 = <b>4</b>.'],
    ['Dans un agrandissement de rapport 3, les volumes sont multipliés par 9.', false,
      'Non : 9 = 3², c’est pour les aires. Les volumes sont multipliés par k³ = <b>27</b>.'],
    ['Un agrandissement ne change pas les longueurs.', false,
      'Non : toutes les longueurs sont multipliées par k (k &gt; 1) : elles <b>augmentent</b>. Ce sont les angles qui ne changent pas.'],
  ];

  // Pour la leçon : trois carrés de côté 1, 2 et 3 carreaux (aires 1, 4 et 9 carreaux)
  function figureLeconCarres() {
    const q = F.quadrillage(12, 3, 30, 'fig-fin');
    const carreQuadrille = (c, l, cote) => F.polygone([q.coin(c, l), q.coin(c + cote, l), q.coin(c + cote, l + cote), q.coin(c, l + cote)], 'fig-plein');
    const contour = (c, l, cote) => F.polygone([q.coin(c, l), q.coin(c + cote, l), q.coin(c + cote, l + cote), q.coin(c, l + cote)], 'fig-trait');
    const legende = (c, texte) => F.texte([q.coin(c, 3)[0], q.hauteur + 12], texte, { classe: 'fig-petit' });
    return F.svg(q.largeur, q.hauteur + 26,
      carreQuadrille(1, 2, 1) + carreQuadrille(4, 1, 2) + carreQuadrille(8, 0, 3) + q.html
      + contour(1, 2, 1) + contour(4, 1, 2) + contour(8, 0, 3)
      + legende(1.5, 'aire 1') + legende(5, 'k = 2 : aire × 4') + legende(9.5, 'k = 3 : aire × 9'),
      'Trois carrés : côtés 1, 2 et 3 ; aires 1, 4 et 9 carreaux');
  }

  ajouterEtape({
    id: '3e-mesures-agrandissement',
    banque: ['coefficient', 'coefficient', 'effet', 'effet', 'relation', 'relation', 'aire', 'volume', 'maquette', 'maquette',
      'trouverK', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'coefficient') {
        const k = parmi(RAPPORTS_SIMPLES);
        const volume = auHasard();
        const p = volume ? 3 : 2;
        const f = net(k ** p);
        const quoi = volume ? 'les volumes sont multipliés' : 'les aires sont multipliées';
        return choix({
          consigne: 'Trouve le bon nombre',
          enonce: `Dans ${k > 1 ? 'un agrandissement' : 'une réduction'} de rapport ${ecrire(k)}, ${quoi} par ___.`,
          reponse: f,
          pieges: multiplicateurs(k, volume),
          garder: [volume ? net(3 * k) : k],
          // (les boutons sont mélangés : rangés, la réponse serait presque toujours au même bout)
          ordre: 'melange',
          explication: `Avec le rapport k = ${ecrire(k)}, ${LA_REGLE}.<br>${volume ? 'k³' : 'k²'} = ${calculPuissance([k, 1], p)} : `
            + `${quoi} par <b>${ecrire(f)}</b>.<br>`
            + (volume ? pasTroisFois(k) : `⚠️ Pas par ${ecrire(k)} : ça, c’est pour les longueurs.`),
        });
      }
      if (sorte === 'effet') {
        const [sujet, leVolume, lAire] = parmi(SOLIDES_EFFET);
        const [action, n, multiplier] = parmi(ACTIONS_EFFET);
        const volume = auHasard();
        const p = volume ? 3 : 2;
        const grandeur = volume ? leVolume : lAire;
        const accord = volume ? '' : 'e';
        const f = n ** p;
        return choix({
          consigne: 'Trouve le bon nombre',
          enonce: `Si on ${action} ${sujet}, ${grandeur} est ${multiplier ? 'multiplié' : 'divisé'}${accord} par ___.`,
          reponse: f,
          pieges: multiplicateurs(n, volume && multiplier),
          garder: [volume ? 3 * n : n],
          ordre: 'melange',
          explication: `C’est ${multiplier ? 'un agrandissement' : 'une réduction'} de rapport k = ${multiplier ? n : frac(1, n)} : ${LA_REGLE}.<br>`
            + `${majuscule(grandeur)} est donc ${multiplier ? 'multiplié' : 'divisé'}${accord} par ${n}${EXPOSANT[p]} = <b>${ecrire(f)}</b>.`
            + `<br>${volume ? pasTroisFois(n) : `⚠️ Pas par ${n} : on regarde une aire, pas une longueur.`}`,
        });
      }
      if (sorte === 'relation') {
        // On connaît le nombre qui multiplie les aires (ou les volumes) : que devient une autre grandeur ?
        const k = parmi([2, 3, 4, 5, 10]);
        const [k2, k3] = [k * k, k ** 3];
        const [donne, demande, reponse, pieges, calcul] = parmi([
          [`les aires sont multipliées par ${ecrire(k2)}`, 'les longueurs sont multipliées', k, [k2 / 2, k2, k3, k2 * k2],
            `k² = ${ecrire(k2)}, donc k = ${k} (car ${k} × ${k} = ${ecrire(k2)}) : les longueurs sont multipliées par <b>${k}</b>.`],
          [`les volumes sont multipliés par ${ecrire(k3)}`, 'les longueurs sont multipliées', k, [Math.round(k3 / 3 * 10) / 10, k3 / 2, k3, k2],
            `k³ = ${ecrire(k3)}, donc k = ${k} (car ${k} × ${k} × ${k} = ${ecrire(k3)}) : les longueurs sont multipliées par <b>${k}</b>.`],
          [`les aires sont multipliées par ${ecrire(k2)}`, 'les volumes sont multipliés', k3, [k2, 2 * k2, 3 * k2, k2 * k2],
            `k² = ${ecrire(k2)}, donc k = ${k}. Les volumes sont multipliés par k³ = ${k} × ${k} × ${k} = <b>${ecrire(k3)}</b>.`],
          [`les volumes sont multipliés par ${ecrire(k3)}`, 'les aires sont multipliées', k2, [k, k3, k3 / 2, k2 * k2],
            `k³ = ${ecrire(k3)}, donc k = ${k}. Les aires sont multipliées par k² = ${k} × ${k} = <b>${ecrire(k2)}</b>.`],
        ]);
        return choix({
          consigne: 'Trouve le bon nombre',
          enonce: `Agrandissement : ${donne}. Alors ${demande} par ___.`,
          reponse,
          pieges: meilleursPieges(reponse, pieges.map(net), 1),
          ordre: 'melange',
          explication: `On cherche d’abord le rapport k : ${LA_REGLE}.<br>${calcul}`,
        });
      }
      if (sorte === 'aire' || sorte === 'volume') {
        const p = sorte === 'aire' ? 2 : 3;
        const r = parmi(auHasard(0.6) ? AGRANDISSEMENTS : REDUCTIONS);
        const [n, d] = r;
        // Une mesure qui donne un résultat entier
        let x;
        if (d === 1) x = p === 2 ? entier(3, 30) : entier(2, 20);
        else x = d ** p * entier(2, p === 2 ? 10 : 5);
        const resultat = net(x * n ** p / d ** p);
        const u = parmi(p === 2 ? ['cm²', 'm²'] : ['cm³', 'dm³', 'm³']);
        const participe = n > d ? 'agrandi' : 'réduit';
        // « On l’agrandit », mais « on la réduit » ou « on le réduit »
        const on = feminin => `On ${n > d ? 'l’agrandit' : `${feminin ? 'la' : 'le'} réduit`} avec le rapport ${texteRapport(r)}.`;
        const [debut, question] = p === 2
          ? parmi([
            [`Une figure a une aire de ${mesure(x, u)}. ${on(true)}`, 'Quelle est l’aire de la nouvelle figure ?'],
            [`Un triangle a une aire de ${mesure(x, u)}. ${on(false)}`, `Quelle est l’aire du triangle ${participe} ?`],
          ])
          : parmi([
            [`Une pyramide a un volume de ${mesure(x, u)}. ${on(true)}`, `Quel est le volume de la pyramide ${participe}e ?`],
            [`Un cône a un volume de ${mesure(x, u)}. ${on(false)}`, `Quel est le volume du cône ${participe} ?`],
          ]);
        return nombre({
          consigne: p === 2 ? 'Calcule la nouvelle aire' : 'Calcule le nouveau volume',
          enonce: `${debut} ${question}`,
          reponse: resultat,
          unite: u,
          explication: `C’est ${nomTransformation(r)} de rapport k = ${texteRapport(r)} : ${p === 2 ? 'les aires sont multipliées' : 'les volumes sont multipliés'} par `
            + `${p === 2 ? 'k²' : 'k³'}, et ${calculPuissance(r, p)}.<br>${calculMultiplier(x, r, p)} : <b>${mesure(resultat, u)}</b>.<br>`
            + `⚠️ Multiplier par k seulement, c’est bon pour les longueurs, pas pour les ${p === 2 ? 'aires' : 'volumes'} !`,
        });
      }
      if (sorte === 'maquette') {
        if (auHasard()) {
          const [phrase, n, surfaces] = parmi(MAQUETTES_AIRES);
          const s = parmi(surfaces);
          const enCm2 = s * n * n;
          return nombre({
            consigne: 'Résous le problème',
            enonce: phrase(s, n),
            reponse: net(enCm2 / 10000),
            unite: 'm²',
            explication: `De la maquette à la réalité, les longueurs sont multipliées par ${n}, donc les aires par ${n}² = ${ecrire(n * n)}.<br>`
              + `${ecrire(s)} × ${ecrire(n * n)} = ${mesure(enCm2, 'cm²')} = <b>${mesure(net(enCm2 / 10000), 'm²')}</b> `
              + `(car 1${ESPACE}m² = 10${ESPACE}000${ESPACE}cm²).`,
          });
        }
        const [phrase, n, volumes] = parmi(MAQUETTES_VOLUMES);
        const v = parmi(volumes);
        const enonce = phrase(v);
        const enCm3 = v * n ** 3;
        const L = net(enCm3 / 1000);
        // × k ou × k² au lieu de × k³, et les erreurs de conversion (cm³ → L : on divise par 1 000)
        const pieges = [v * n / 1000, v * n * n / 1000, L * 10, L * 100, L / 10, enCm3].map(net);
        return sansIndiceDeForme(() => choix({
          consigne: 'Résous le problème',
          enonce,
          reponse: mesure(L, 'L'),
          pieges: meilleursPieges(L, pieges).map(x => mesure(x, 'L')),
          garder: auHasard() ? [mesure(net(v * n * n / 1000), 'L')] : [],
          explication: `De la maquette à la réalité, les longueurs sont multipliées par ${n}, donc les volumes par ${n}³ = ${ecrire(n ** 3)}.<br>`
            + `${ecrire(v)} × ${ecrire(n ** 3)} = ${mesure(enCm3, 'cm³')} = <b>${mesure(L, 'L')}</b> (1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³).<br>`
            + `⚠️ Avec × ${n}² = ${ecrire(n * n)}, on trouverait ${mesure(net(v * n * n / 1000), 'L')} : c’est pour les aires.`,
        }));
      }
      if (sorte === 'trouverK') {
        const volume = auHasard();
        const p = volume ? 3 : 2;
        const u = volume ? 'cm³' : 'cm²';
        const k = parmi(volume ? [2, 3, 4, 5, 0.5, 0.1] : [2, 3, 4, 5, 6, 7, 10, 0.5, 0.2, 0.1]);
        const f = net(k ** p);
        // Une mesure de départ qui donne un résultat simple
        const x = k > 1 ? entier(2, volume ? 8 : 12) : parmi(volume ? [1000, 2000, 5000] : [100, 200, 300, 400, 500]);
        const y = net(x * f);
        const nom = volume ? 'le volume d’un solide' : 'l’aire d’une figure';
        return nombre({
          consigne: 'Trouve le rapport k',
          enonce: `Après ${k > 1 ? 'un agrandissement' : 'une réduction'} de rapport k, ${nom} passe de ${mesure(x, u)} à ${mesure(y, u)}. `
            + `Quelle est la valeur de k${k < 1 ? ' (en nombre décimal)' : ''} ?`,
          reponse: k,
          explication: `${volume ? 'Les volumes sont multipliés par k³' : 'Les aires sont multipliées par k²'} : ${ecrire(y)} ÷ ${ecrire(x)} = ${ecrire(f)}, `
            + `donc ${volume ? 'k³' : 'k²'} = ${ecrire(f)}.<br>`
            + `Or ${volume ? `${ecrire(k)} × ${ecrire(k)} × ${ecrire(k)}` : `${ecrire(k)} × ${ecrire(k)}`} = ${ecrire(f)} : <b>k = ${ecrire(k)}</b>`
            + ` (et pas ${ecrire(f)}).`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(REGLES_AGRANDISSEMENT, auHasard());
    },
    titreLecon: 'Agrandir et réduire',
    lecon: `
      <p>Dans un <b>agrandissement</b> ou une <b>réduction</b> de rapport k, toutes les longueurs sont multipliées par k.
        Si k &gt; 1, c’est un agrandissement ; si 0 &lt; k &lt; 1, c’est une réduction. La forme et les angles ne changent pas.</p>
      <table>
        <tr><th>Les longueurs</th><td>× k</td></tr>
        <tr><th>Les aires</th><td>× k²</td></tr>
        <tr><th>Les volumes</th><td>× k³</td></tr>
      </table>
      ${figureLeconCarres()}
      <p>👉 <i>Rapport 3 : un triangle de 12&nbsp;cm² devient un triangle de 12 × 9 = 108&nbsp;cm² (3² = 9).</i></p>
      <p>👉 <i>Rapport ${frac(1, 2)} : une pyramide de 96&nbsp;cm³ devient une pyramide de 96 × ${frac(1, 8)} = 96 ÷ 8 = 12&nbsp;cm³
        ((${frac(1, 2)})³ = ${frac(1, 8)}).</i></p>
      <p><b>Trouver k :</b> si les aires sont multipliées par 25, alors k² = 25, donc k = 5 (car 5 × 5 = 25).</p>
      <p><b>Maquettes :</b> une maquette à l’échelle 1/20 est une réduction de rapport ${frac(1, 20)}. De la maquette à la réalité,
        on multiplie les longueurs par 20, les aires par 20² = 400 et les volumes par 20³ = 8&nbsp;000.
        Pour finir, on convertit : 1&nbsp;m² = 10&nbsp;000&nbsp;cm² ; 1&nbsp;L = 1&nbsp;000&nbsp;cm³.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> l’exposant suit l’unité ! Des cm → × k ; des cm² → × k² ; des cm³ → × k³.</div>
      <p>⚠️ Doubler les longueurs ne double pas l’aire : elle est multipliée par 4, et le volume par 8 !</p>
    `,
  });

  // ======================================================================
  // 3. Les sections de solides
  // ======================================================================
  // Un pavé droit ABCDEFGH en perspective cavalière : ABCD en bas (A devant à gauche, B devant à droite, D caché),
  // EFGH en haut (E au-dessus de A, F au-dessus de B…). L = AB (vers la droite), P = AD (la profondeur, en biais),
  // H = AE (la hauteur). Le dessin garde les proportions.
  function pointsPave(L, P, H, { largeur = 460, hauteur = 260, decalage = 0 } = {}) {
    const e = Math.min(34, 240 / (L + FUYANTE * P), 165 / (H + FUYANTE * P));
    const [w, k, h] = [L * e, FUYANTE * P * e, H * e];
    const x0 = (largeur - w - k) / 2 + decalage;
    const y0 = hauteur / 2 + (h + k) / 2;
    const [A, B, C, D] = [[x0, y0], [x0 + w, y0], [x0 + w + k, y0 - k], [x0 + k, y0 - k]];
    const enHaut = Q => [Q[0], Q[1] - h];
    return { A, B, C, D, E: enHaut(A), F: enHaut(B), G: enHaut(C), H: enHaut(D) };
  }
  // Le pavé : les faces qu’on voit coloriées, les arêtes cachées (autour de D) en pointillés
  function tracePave(p) {
    const vues = ['AB', 'BC', 'CG', 'AE', 'BF', 'EF', 'FG', 'GH', 'HE'];
    return F.polygone([p.A, p.B, p.C, p.G, p.H, p.E], 'fig-plein')
      + ['AD', 'DC', 'DH'].map(s => traitCache(p[s[0]], p[s[1]])).join('')
      + vues.map(s => F.segment(p[s[0]], p[s[1]])).join('');
  }
  // Les noms des 8 sommets, placés à la main pour ne pas toucher les arêtes (D est derrière la face avant)
  const DECALAGES_PAVE = { A: [-14, 14], B: [14, 14], C: [16, 4], D: [12, -12], E: [-16, 0], F: [-14, 14], G: [14, -10], H: [-10, -14] };
  const nomsPave = p => Object.entries(DECALAGES_PAVE).map(([nom, [dx, dy]]) => F.texte([p[nom][0] + dx, p[nom][1] + dy], nom)).join('');
  const centrePave = p => milieu(p.A, p.G);
  // Une hauteur (de 3 à 9) pour un pavé de profondeur P : pas trop proche de la profondeur dessinée en biais,
  // sinon le point D tomberait sur l’arête [EF] ; et différente des autres dimensions (interdits)
  const hauteurPave = (P, interdits = []) => parmi([3, 4, 5, 6, 7, 8, 9].filter(h => !interdits.includes(h) && Math.abs(h - FUYANTE * P) >= 1.2));

  // La section BDHF du pavé (le plan qui passe par B, D et F), en orange ; les longueurs AB, BC et AE
  function figureSectionPave(L, P, H) {
    const p = pointsPave(L, P, H);
    const G = centrePave(p);
    return F.svg(460, 260, tracePave(p)
      + F.segment(p.B, p.D, 'fig-accent fig-cache') + F.segment(p.D, p.H, 'fig-accent fig-cache')
      + F.segment(p.H, p.F, 'fig-accent') + F.segment(p.F, p.B, 'fig-accent') + nomsPave(p)
      + longueurDehors(p.A, p.B, mesure(L, 'cm'), G) + longueurDehors(p.B, p.C, mesure(P, 'cm'), G)
      + longueurDehors(p.A, p.E, mesure(H, 'cm'), G), 'Un pavé droit coupé par le plan BDF');
  }

  // Une boule de centre O et de rayon R coupée par un plan à la distance d de O : la section est un disque de centre H.
  // M est sur le bord de la section ; le triangle OHM est rectangle en H. textes : [OM, OH] (rien pour HM, en orange)
  function figureSectionBoule(R, d, textes = null) {
    const s = 100 / R;
    const O = [230, 150];
    const H = [O[0], O[1] - d * s];
    const rx = Math.sqrt(R * R - d * d) * s;
    const M = [H[0] + rx, H[1]];
    let html = F.cercle(O, 100, 'fig-plein') + F.cercle(O, 100) + ellipse(H, rx, Math.max(12, 0.28 * rx), 'fig-accent')
      + F.segment(O, H, 'fig-marque') + F.segment(O, M, 'fig-marque') + F.segment(H, M, 'fig-accent')
      + F.angleDroit(H, O, M, 10) + F.point(O, '') + F.texte([O[0], O[1] + 17], 'O')
      + F.texte([H[0] - 16, H[1]], 'H') + F.texte([M[0] + 16, M[1] - 4], 'M');
    if (textes) {
      html += F.longueur(O, M, textes[0], { cote: 1, distance: 12 }) + F.longueur(O, H, textes[1], { cote: -1, distance: 10 });
    }
    return F.svg(460, 265, html, 'Une boule coupée par un plan');
  }

  // Des triangles rectangles qui tombent juste : [OM (le rayon de la boule), OH, HM] ; OH est assez long pour écrire sa longueur
  // (et HM assez long pour que la section se voie bien)
  const TRIPLETS_BOULE = [[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [15, 9, 12], [15, 12, 9], [20, 12, 16], [20, 16, 12],
    [25, 15, 20], [25, 20, 15]];
  // Des pavés dont la diagonale de la base tombe juste : [AB, AD, BD]
  const BASES_PAVE = [[8, 6, 10], [6, 8, 10], [12, 5, 13], [4, 3, 5], [12, 9, 15], [9, 12, 15], [8, 15, 17]];

  // [le solide et le plan, la réponse, les pièges, l’explication]
  const SECTIONS = [
    ['On coupe un cylindre par un plan parallèle à sa base. La section est ___.', 'un disque',
      ['un rectangle', 'un triangle', 'un carré'],
      'Parallèlement à la base, on retrouve la forme de la base : <b>un disque</b>, de même rayon que la base.'],
    ['On coupe un cylindre par un plan parallèle à son axe. La section est ___.', 'un rectangle',
      ['un disque', 'un triangle', 'un cercle'],
      'Un plan parallèle à l’axe du cylindre le coupe selon <b>un rectangle</b> : un de ses côtés est la hauteur du cylindre.'],
    ['On coupe un cône par un plan parallèle à sa base. La section est ___.', 'un disque',
      ['un triangle', 'un rectangle', 'un carré'],
      'On obtient <b>un disque</b>, plus petit que la base : c’est une réduction de la base.'],
    ['On coupe une pyramide à base carrée par un plan parallèle à sa base. La section est ___.', 'un carré',
      ['un triangle', 'un disque', 'un pentagone'],
      'On obtient <b>un carré</b>, plus petit que la base : c’est une réduction de la base.'],
    ['On coupe une pyramide à base triangulaire par un plan parallèle à sa base. La section est ___.', 'un triangle',
      ['un carré', 'un disque', 'un rectangle'],
      'On obtient <b>un triangle</b>, plus petit que la base : c’est une réduction de la base.'],
    ['On coupe un cube par un plan parallèle à une face. La section est ___.', 'un carré',
      ['un triangle', 'un disque', 'un pentagone'],
      'On retrouve la forme de la face : <b>un carré</b>, de même côté que le cube.'],
    ['On coupe une sphère par un plan qui la traverse. La section est ___.', 'un cercle',
      ['un disque', 'un carré', 'un rectangle'],
      'La sphère est une surface, creuse comme une bulle : sa section est <b>un cercle</b>, pas un disque plein.'],
    ['On coupe une boule par un plan qui la traverse. La section est ___.', 'un disque',
      ['un cercle', 'un carré', 'un triangle'],
      'La boule est un solide plein : sa section est <b>un disque</b> (le cercle et tout son intérieur).'],
    ['On coupe un pavé droit par un plan parallèle à une face. La section est ___.', 'un rectangle',
      ['un triangle', 'un disque', 'un pentagone'],
      'On retrouve la forme de cette face : <b>un rectangle</b>, identique à la face.'],
    ['On coupe un pavé droit par un plan parallèle à une arête. La section est ___.', 'un rectangle',
      ['un triangle', 'un disque', 'un pentagone'],
      'Un plan parallèle à une arête coupe le pavé selon <b>un rectangle</b> ; un de ses côtés a la longueur de cette arête.'],
  ];

  const REGLES_SECTIONS = [
    ['La section d’un cylindre par un plan parallèle à sa base est un disque de même rayon que la base.', true,
      'Oui : c’est <b>un disque</b> identique à la base, quelle que soit la hauteur du plan.'],
    ['La section d’un cône par un plan parallèle à sa base est un disque de même rayon que la base.', false,
      'Non : c’est un disque <b>plus petit</b>, une réduction de la base (le cône se resserre vers le sommet).'],
    ['La section d’une pyramide par un plan parallèle à sa base est une réduction de la base.', true,
      'Oui : on obtient la <b>même forme</b> que la base, en plus petit.'],
    ['La section d’une sphère par un plan est toujours un cercle de même rayon que la sphère.', false,
      'Non : c’est bien un cercle (si le plan coupe la sphère), mais il n’a le même rayon que la sphère que si le plan passe par le <b>centre</b> (un grand cercle).'],
    ['La section d’un cube par un plan parallèle à une face est un carré de même côté que le cube.', true,
      'Oui : on retrouve <b>la face</b>, un carré de même côté.'],
    ['La section d’un pavé droit par un plan parallèle à une face est un triangle.', false,
      'Non : c’est <b>un rectangle</b>, identique à cette face.'],
    ['Si un plan passe par le centre d’une sphère, la section est un grand cercle.', true,
      'Oui : la section a alors le même centre et le même rayon que la sphère : c’est <b>un grand cercle</b>.'],
    ['La section d’un cylindre par un plan parallèle à sa base est un rectangle.', false,
      'Non : parallèlement à la base, on obtient <b>un disque</b>. C’est parallèlement à l’axe qu’on obtient un rectangle.'],
  ];

  // Une pyramide (ou un cône) coupée parallèlement à la base : [la hauteur, la distance du plan au sommet]
  // (le rapport de la réduction, distance ÷ hauteur, est une fraction simple)
  const COUPES = [[12, 4], [12, 6], [12, 8], [12, 3], [12, 9], [9, 3], [9, 6], [8, 4], [8, 2], [8, 6], [10, 5], [15, 5], [15, 10], [6, 2], [6, 4]];

  ajouterEtape({
    id: '3e-mesures-sections',
    banque: ['nature', 'nature', 'nature', 'nature', 'cylindre', 'pave', 'sphere', 'reduction', 'aireSection', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'nature') return questionMots('Quelle est la section ?', SECTIONS);
      if (sorte === 'cylindre') {
        const r = entier(2, 9);
        const h = parmi([4, 5, 6, 7, 8, 9, 10, 12, 15].filter(x => x !== r && x !== 2 * r && 2 * x !== r));
        return choix({
          consigne: 'Trouve le rayon de la section',
          enonce: `Un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')} est coupé par un plan parallèle à sa base. `
            + 'La section est un disque de rayon ___.',
          reponse: mesure(r, 'cm'),
          // le diamètre, la moitié (comme si le cylindre se resserrait), la hauteur
          pieges: meilleursPieges(r, [2 * r, net(r / 2), h, net(h / 2)]).map(x => mesure(x, 'cm')),
          explication: `Parallèlement à la base, la section est <b>identique à la base</b> : un disque de rayon <b>${mesure(r, 'cm')}</b>, `
            + 'à n’importe quelle hauteur.<br>⚠️ C’est le cône qui se resserre, pas le cylindre.',
        });
      }
      if (sorte === 'pave') {
        const [a, b, diagonale] = parmi(BASES_PAVE);
        const h = hauteurPave(b, [a, b]);
        return nombre({
          consigne: 'Calcule l’aire de la section',
          enonce: `ABCDEFGH est un pavé droit. On le coupe par le plan qui passe par B, D et F : la section BDHF est un rectangle. `
            + `Quelle est son aire ?${figureSectionPave(a, b, h)}`,
          reponse: diagonale * h,
          unite: 'cm²',
          explication: `Le triangle ABD est rectangle en A : BD² = AB² + AD² = ${a * a} + ${b * b} = ${diagonale * diagonale}, donc BD = ${mesure(diagonale, 'cm')}.<br>`
            + `(AD = BC = ${mesure(b, 'cm')}.) BDHF est un rectangle de ${mesure(diagonale, 'cm')} sur BF = AE = ${mesure(h, 'cm')} : `
            + `${diagonale} × ${h} = <b>${mesure(diagonale * h, 'cm²')}</b>.`,
        });
      }
      if (sorte === 'sphere') {
        const [R, d, r] = parmi(TRIPLETS_BOULE);
        const u = parmi(['cm', 'cm', 'dm', 'm']);
        const debut = `Une boule de centre O et de rayon ${mesure(R, u)} est coupée par un plan à ${mesure(d, u)} de O. `
          + 'La section est un disque de centre H.';
        const figure = figureSectionBoule(R, d, [mesure(R, u), mesure(d, u)]);
        const pythagore = `(OH) est perpendiculaire au plan, donc le triangle OHM est rectangle en H, et OM = ${mesure(R, u)} (un rayon de la boule).<br>`
          + `Pythagore : HM² = OM² − OH² = ${R * R} − ${d * d} = ${r * r}, donc HM = ${mesure(r, u)}`;
        if (auHasard(0.65)) {
          return nombre({
            consigne: 'Calcule le rayon de la section',
            enonce: `${debut} Quel est son rayon HM ?${figure}`,
            reponse: r,
            unite: u,
            explication: `${pythagore.replace(`HM = ${mesure(r, u)}`, `HM = <b>${mesure(r, u)}</b>`)}.`,
          });
        }
        // L’aire exacte de la section : π × HM²
        return choix({
          consigne: 'Calcule l’aire de la section',
          enonce: `${debut} Quelle est l’aire exacte de cette section ?${figure}`,
          reponse: avecPi(r * r, carre(u)),
          // le rayon de la boule au lieu de celui de la section, OH au lieu de HM, 2 × π × HM (la longueur du cercle)
          // (et π × HM : le carré oublié)
          pieges: meilleursPieges(r * r, [R * R, d * d, 2 * r, r]).map(x => avecPi(x, carre(u))),
          explication: `${pythagore}.<br>Aire du disque = π × HM² = π × ${r * r} = <b>${avecPi(r * r, carre(u))}</b>.`,
        });
      }
      if (sorte === 'reduction' || sorte === 'aireSection') {
        const [h, a] = parmi(COUPES);
        // k = a ÷ h, écrit en fraction simplifiée
        const [n, dk] = [a / pgcd(a, h), h / pgcd(a, h)];
        const k = a / h;
        if (sorte === 'reduction') {
          const cone = auHasard();
          // un côté (ou un rayon) qui se divise par le dénominateur de k
          const c = dk * entier(Math.max(1, Math.ceil(3 / dk)), Math.floor(12 / dk));
          const resultat = net(c * k);
          return nombre({
            consigne: 'Calcule la longueur',
            enonce: cone
              ? `Un cône a une hauteur de ${mesure(h, 'cm')} et une base de rayon ${mesure(c, 'cm')}. On le coupe par un plan parallèle `
                + `à la base, à ${mesure(a, 'cm')} du sommet. Quel est le rayon de la section ?`
              : `Une pyramide de hauteur ${mesure(h, 'cm')} a pour base un carré de ${mesure(c, 'cm')} de côté. On la coupe par un plan `
                + `parallèle à la base, à ${mesure(a, 'cm')} du sommet. Quel est le côté du carré obtenu ?`,
            reponse: resultat,
            unite: 'cm',
            explication: `La section est une réduction de la base, de rapport k = ${a} ÷ ${h} = ${frac(n, dk)} `
              + '(la distance au sommet ÷ la hauteur).<br>'
              + `${cone ? 'Rayon' : 'Côté'} : ${c} × ${frac(n, dk)} = ${c} ÷ ${dk}${n > 1 ? ` × ${n}` : ''} = <b>${mesure(resultat, 'cm')}</b>.`,
          });
        }
        // L’aire de la section : l’aire de la base × k²
        const c = dk * entier(Math.max(1, Math.ceil(4 / dk)), Math.floor(12 / dk));
        const B = c * c;
        const S = net(B * k * k);
        // × k au lieu de × k², le rapport pris depuis la base (1 − k), × k³, l’aire de la base elle-même,
        // et le côté de la section (on a oublié de le mettre au carré)
        const pieges = [B * k, B * (1 - k) ** 2, B * k ** 3, B, c * k].map(net);
        return choix({
          consigne: 'Calcule l’aire de la section',
          enonce: `Une pyramide de hauteur ${mesure(h, 'cm')} a pour base un carré de ${mesure(c, 'cm')} de côté. On la coupe par un plan `
            + `parallèle à la base, à ${mesure(a, 'cm')} du sommet. L’aire de la section est ___.`,
          reponse: mesure(S, 'cm²'),
          pieges: meilleursPieges(S, pieges, 2).map(x => mesure(x, 'cm²')),
          garder: auHasard() ? [mesure(net(B * k), 'cm²')] : [],
          // (les erreurs sont surtout plus grandes que la réponse : les boutons sont mélangés)
          ordre: 'melange',
          explication: `La section est une réduction de la base de rapport k = ${a} ÷ ${h} = ${frac(n, dk)} : son côté mesure `
            + `${c} × ${frac(n, dk)} = ${mesure(net(c * k), 'cm')}.<br>Son aire : ${ecrire(net(c * k))} × ${ecrire(net(c * k))} = <b>${mesure(S, 'cm²')}</b> `
            + `(l’aire de la base, ${B}${ESPACE}cm², multipliée par k²).<br>⚠️ Pas ${B} × ${frac(n, dk)} = ${ecrire(net(B * k))} : les aires sont multipliées par k².`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(REGLES_SECTIONS, auHasard());
    },
    titreLecon: 'Les sections de solides',
    lecon: `
      <p>Quand on coupe un solide par un plan, la surface obtenue s’appelle la <b>section</b>.</p>
      <table>
        <tr><th>Cube, pavé droit</th><td>plan parallèle à une face : un carré ou un rectangle <b>identique à cette face</b> ;
          plan parallèle à une arête : un rectangle</td></tr>
        <tr><th>Cylindre</th><td>parallèle à la base : un disque <b>de même rayon</b> ; parallèle à l’axe (la droite qui passe
          par les centres des bases) : un rectangle</td></tr>
        <tr><th>Pyramide, cône</th><td>parallèle à la base : une <b>réduction de la base</b> (un carré plus petit, un disque plus petit…)</td></tr>
        <tr><th>Sphère, boule</th><td>quand le plan les coupe : un <b>cercle</b> pour la sphère (creuse), un <b>disque</b> pour la boule (pleine)</td></tr>
      </table>
      <p><b>Pavé droit :</b> le plan qui passe par B, D et F est parallèle à l’arête [AE] : la section BDHF est un rectangle
        de côtés BD (à calculer avec Pythagore dans le triangle ABD, rectangle en A) et BF = AE.</p>
      <p><b>Pyramide et cône :</b> si le plan est à la distance a du sommet et que la hauteur est h, la section est une réduction
        de rapport k = a ÷ h. 👉 <i>Hauteur 12&nbsp;cm, plan à 4&nbsp;cm du sommet : k = ${frac(1, 3)} ; une base de 9&nbsp;cm de côté donne
        un carré de 3&nbsp;cm de côté, d’aire 9&nbsp;cm² (81 × ${frac(1, 9)}).</i></p>
      ${figureSectionBoule(5, 3, ['5&nbsp;cm', '3&nbsp;cm'])}
      <p><b>Sphère :</b> le triangle OHM est rectangle en H. 👉 <i>HM² = 5² − 3² = 25 − 9 = 16, donc HM = 4&nbsp;cm.</i>
        Si le plan passe par O, la section est un grand cercle.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> imagine que tu coupes le solide avec un grand couteau bien droit, comme une tranche
        de pain : la forme de la tranche, c’est la section !</div>
      <p>⚠️ Le cylindre garde toujours le même rayon ; le cône et la pyramide se resserrent vers le sommet.</p>
    `,
  });

  // ======================================================================
  // 4. Les grandeurs composées
  // ======================================================================
  // Une durée en minutes, écrite en heures et minutes : duree(90) → « 1 h 30 min »
  function duree(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h ? `${h}${ESPACE}h` : '', m ? `${m}${ESPACE}min` : ''].filter(Boolean).join(ESPACE);
  }
  // La même durée en heures (avec une virgule), et l’erreur classique : 1 h 30 min lu « 1,30 h »
  const enHeures = minutes => net(minutes / 60);
  function conversionDuree(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!m) return '';
    if (!h) return `${m}${ESPACE}min = ${m} ÷ 60${ESPACE}h = ${mesure(enHeures(m), 'h')} (et pas ${ecrire(net(m / 100))}${ESPACE}h).<br>`;
    return `${duree(minutes)} = ${mesure(enHeures(minutes), 'h')} (${m}${ESPACE}min = ${m} ÷ 60 = ${ecrire(enHeures(m))}${ESPACE}h, `
      + `et pas ${ecrire(net(h + m / 100))}${ESPACE}h).<br>`;
  }
  // Des durées (en minutes) qui s’écrivent en heures avec au plus 2 chiffres après la virgule
  const DUREES_TRAJET = [12, 15, 18, 24, 27, 30, 36, 42, 45, 48, 54, 60, 75, 90, 105, 120, 135, 150];
  // Pour calculer une vitesse sans calculatrice : des durées qui divisent 60 min, ou faites de quarts ou de moitiés d’heure
  const DUREES_VITESSE = [3, 6, 12, 15, 30, 45, 60, 90, 120, 150];

  // Les voyageurs : le trajet (« Léa court 3 km »), la façon d’avancer, des vitesses réalistes (km/h), des durées (min)
  const VOYAGEURS = [
    { trajet: d => `Hugo fait ${mesure(d, 'km')} à vélo`, avance: 'Hugo roule à vélo', pronom: 'il',
      vitesses: [12, 15, 16, 18, 20, 24], durees: DUREES_TRAJET.filter(t => t <= 150) },
    { trajet: d => `Léa court ${mesure(d, 'km')}`, avance: 'Léa court', pronom: 'elle',
      vitesses: [8, 9, 10, 12], durees: DUREES_TRAJET.filter(t => t <= 60) },
    { trajet: d => `Roxy fait un sprint de ${mesure(d, 'km')}`, avance: 'Roxy fait un sprint', pronom: 'elle',
      vitesses: [20, 30, 40], durees: [3, 6] },
    { trajet: d => `La voiture de Papi parcourt ${mesure(d, 'km')}`, avance: 'La voiture de Papi roule', pronom: 'elle',
      vitesses: [40, 50, 60, 80, 90, 100, 110], durees: DUREES_TRAJET },
    { trajet: d => `Le train parcourt ${mesure(d, 'km')}`, avance: 'Le train roule', pronom: 'il',
      vitesses: [120, 140, 160, 200, 240, 280, 300], durees: DUREES_TRAJET },
  ];
  function tirerVoyage(pourLaVitesse) {
    for (;;) {
      const voyageur = parmi(VOYAGEURS);
      const v = parmi(voyageur.vitesses);
      const durees = voyageur.durees.filter(x => !pourLaVitesse || DUREES_VITESSE.includes(x));
      const t = parmi(durees);
      const d = net(v * t / 60);
      if (decimalesDe(d) <= 1 && d >= 1) return { ...voyageur, v, t, d };
    }
  }
  // La vitesse, sans diviser par un nombre décimal : on passe par l’heure entière (60 min)
  function expliquerVitesse(d, t, v) {
    const fin = `<b>${mesure(v, 'km/h')}</b>`;
    if (t === 60) return `En 1${ESPACE}h, on parcourt ${mesure(d, 'km')} : la vitesse moyenne est ${fin}.`;
    if (60 % t === 0) {
      return `Dans 1${ESPACE}h = 60${ESPACE}min, il y a ${60 / t} fois ${t}${ESPACE}min : on va ${60 / t} fois plus loin.<br>`
        + `v = ${ecrire(d)} × ${60 / t} = ${fin}.`;
    }
    if (t % 60 === 0) return `En ${duree(t)}, on parcourt ${mesure(d, 'km')}. En 1${ESPACE}h : v = ${ecrire(d)} ÷ ${t / 60} = ${fin}.`;
    // 45 min, 1 h 30 min, 2 h 30 min : on passe par 15 min ou par 30 min
    const pas = t % 30 === 0 ? 30 : 15;
    const n = t / pas;
    const parPas = net(d / n);
    return `${duree(t)}, c’est ${n} fois ${pas}${ESPACE}min. En ${pas}${ESPACE}min : ${ecrire(d)} ÷ ${n} = ${mesure(parPas, 'km')}.<br>`
      + `En 1${ESPACE}h = 60${ESPACE}min, ${60 / pas} fois plus : ${ecrire(parPas)} × ${60 / pas} = ${fin}.`;
  }

  // Les appareils électriques : [le nom, la puissance en W, des durées d’utilisation en minutes]
  const APPAREILS = [
    ['Un radiateur électrique de 2&nbsp;000&nbsp;W', 2000, [120, 180, 240, 300]],
    ['Un four de 2&nbsp;500&nbsp;W', 2500, [30, 60, 90]],
    ['Une bouilloire de 2&nbsp;000&nbsp;W', 2000, [3, 6]],
    ['Un sèche-cheveux de 1&nbsp;500&nbsp;W', 1500, [6, 12]],
    ['Un aspirateur de 800&nbsp;W', 800, [15, 30, 45]],
    ['Une télévision de 100&nbsp;W', 100, [120, 180, 240]],
    ['Une plaque de cuisson de 1&nbsp;500&nbsp;W', 1500, [30, 60]],
    ['Un ordinateur portable de 50&nbsp;W', 50, [120, 240, 360]],
  ];
  function expliquerEnergie(P, t) {
    const E = net(P / 1000 * t / 60);
    return `E = P × t, avec P en kW et t en h : ${ecrire(P)}${ESPACE}W = ${mesure(P / 1000, 'kW')}`
      + `${t % 60 ? ` et ${duree(t)} = ${mesure(enHeures(t), 'h')}` : ''}.<br>`
      + `E = ${ecrire(P / 1000)} × ${ecrire(enHeures(t))} = <b>${mesure(E, 'kWh')}</b>.`;
  }

  // Les matériaux : [« la masse volumique … », l’objet, la masse volumique en g/cm³]
  const MATERIAUX = [['de l’aluminium', 'Un objet en aluminium', 2.7], ['du fer', 'Un objet en fer', 7.8], ['de l’or', 'Un petit lingot d’or', 19.3],
    ['du chêne', 'Un morceau de chêne', 0.7], ['de la glace', 'Un bloc de glace', 0.9], ['du cuivre', 'Un objet en cuivre', 8.9]];

  // [l’énoncé, la réponse, les pièges, l’explication]
  const UNITES_COMPOSEES = [
    ['Une vitesse peut s’exprimer en ___.', 'km/h', ['km', 'h/km', 'kWh'],
      'Une vitesse, c’est une distance ÷ une durée : des <b>km/h</b>, des m/s…'],
    ['Un débit peut s’exprimer en ___.', 'L/min', ['L', 'min/L', 'km/h'],
      'Un débit, c’est un volume ÷ une durée : des <b>L/min</b>, des m³/h…'],
    ['Une énergie électrique s’exprime souvent en ___.', 'kWh', ['kW', 'kW/h', 'km/h'],
      'Une énergie, c’est une puissance × une durée : des <b>kWh</b> (kilowattheures). Le kW est une unité de puissance.'],
    ['Une puissance électrique s’exprime en ___.', 'W', ['Wh', 'kWh', 'W/h'],
      'Une puissance s’exprime en <b>watts (W)</b> ou en kW. Les Wh et les kWh mesurent une énergie.'],
    ['Une masse volumique peut s’exprimer en ___.', 'g/cm³', ['g', 'cm³/g', 'L/min'],
      'Une masse volumique, c’est une masse ÷ un volume : des <b>g/cm³</b>, des kg/m³…'],
    ['Si P est en kW et t en h, l’énergie E = P × t est en ___.', 'kWh', ['kW/h', 'h/kW', 'kW'],
      'Une grandeur produit : kW × h = <b>kWh</b>. ⚠️ Pas « kW/h » : on multiplie, on ne divise pas.'],
    ['Si d est en m et t en s, la vitesse v = d ÷ t est en ___.', 'm/s', ['s/m', 'm', 'km/h'],
      'Une grandeur quotient : m ÷ s = <b>m/s</b> (mètres par seconde).'],
    ['Si V est en L et t en min, le débit V ÷ t est en ___.', 'L/min', ['min/L', 'L', 'L/h'],
      'Une grandeur quotient : L ÷ min = <b>L/min</b> (litres par minute).'],
  ];

  const REGLES_COMPOSEES = [
    [`36${ESPACE}km/h = 10${ESPACE}m/s`, true, `Oui : 36${ESPACE}km/h, c’est 36${ESPACE}000${ESPACE}m en 3${ESPACE}600${ESPACE}s, soit <b>10${ESPACE}m/s</b> (36 ÷ 3,6 = 10).`],
    [`1${ESPACE}m/s = 3,6${ESPACE}km/h`, true, `Oui : 1${ESPACE}m/s, c’est 3${ESPACE}600${ESPACE}m en une heure, soit <b>3,6${ESPACE}km/h</b>.`],
    [`1${ESPACE}km/h = 3,6${ESPACE}m/s`, false, `Non, c’est l’inverse : 1${ESPACE}m/s = 3,6${ESPACE}km/h. Et 1${ESPACE}km/h ≈ 0,28${ESPACE}m/s.`],
    [`Une ampoule de 100${ESPACE}W allumée pendant 10${ESPACE}h consomme 1${ESPACE}kWh.`, true,
      `Oui : E = 0,1${ESPACE}kW × 10${ESPACE}h = <b>1${ESPACE}kWh</b>.`],
    ['Le kWh est une unité de puissance.', false, 'Non : le kWh est une unité d’<b>énergie</b> (une puissance × une durée). La puissance s’exprime en W ou en kW.'],
    [`1${ESPACE}kWh = 1${ESPACE}000${ESPACE}Wh`, true, `Oui : « kilo » veut dire 1${ESPACE}000.`],
    [`Un débit de 1${ESPACE}L/s, c’est 60${ESPACE}L/h.`, false,
      `Non : en 1${ESPACE}h = 3${ESPACE}600${ESPACE}s, il coule 3${ESPACE}600${ESPACE}L. 1${ESPACE}L/s = <b>3${ESPACE}600${ESPACE}L/h</b> (et 60${ESPACE}L/min).`],
    [`Une vitesse de 20${ESPACE}m/s est plus petite que 50${ESPACE}km/h.`, false,
      `Non : 20${ESPACE}m/s = 20 × 3,6 = <b>72${ESPACE}km/h</b>, c’est plus que 50${ESPACE}km/h.`],
  ];

  ajouterEtape({
    id: '3e-mesures-grandeurs-composees',
    banque: ['vitesse', 'vitesse', 'conversion', 'conversion', 'energie', 'energie', 'debit', 'unite', 'masseVolumique', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'vitesse') {
        const cas = parmi(['v', 'v', 'd', 't']);
        const { trajet, avance, pronom, v, t, d } = tirerVoyage(cas === 'v');
        if (cas === 'v') {
          return nombre({
            consigne: 'Calcule la vitesse moyenne',
            enonce: `${trajet(d)} en ${duree(t)}. Quelle est sa vitesse moyenne, en km/h ?`,
            reponse: v,
            unite: 'km/h',
            explication: expliquerVitesse(d, t, v),
          });
        }
        if (cas === 'd') {
          return nombre({
            consigne: 'Calcule la distance',
            enonce: `${avance} à ${mesure(v, 'km/h')} de moyenne pendant ${duree(t)}. Quelle distance parcourt-${pronom} ?`,
            reponse: d,
            unite: 'km',
            explication: `${conversionDuree(t)}d = v × t = ${ecrire(v)} × ${ecrire(enHeures(t))} = <b>${mesure(d, 'km')}</b>.`,
          });
        }
        return nombre({
          consigne: 'Calcule la durée',
          enonce: `${trajet(d)}, à ${mesure(v, 'km/h')} de moyenne. Combien de minutes dure le trajet ?`,
          reponse: t,
          unite: 'min',
          explication: `t = d ÷ v = ${ecrire(d)} ÷ ${ecrire(v)} = ${mesure(enHeures(t), 'h')}.<br>`
            + `En minutes : ${ecrire(enHeures(t))} × 60 = <b>${mesure(t, 'min')}</b>${t >= 60 ? ` (${duree(t)})` : ''}.`,
        });
      }
      if (sorte === 'conversion') {
        const ms = parmi([2, 5, 10, 15, 20, 25, 30]);
        const kmh = net(3.6 * ms);
        if (auHasard()) {
          return sansIndiceDeForme(() => choix({
            consigne: 'Convertis',
            enonce: `${mesure(kmh, 'km/h')} = ___${ESPACE}m/s`,
            reponse: ms,
            // le mauvais sens (× 3,6), la virgule (÷ 36), ÷ 60, ÷ 3 600 (des km par seconde), les m/min (× 1 000 ÷ 60),
            // pas de conversion
            pieges: meilleursPieges(ms, [net(kmh * 3.6), net(kmh / 36), net(kmh / 60), net(kmh / 3600), net(kmh * 1000 / 60), kmh], 2),
            garder: auHasard() ? [net(kmh * 3.6)] : [],
            explication: `${mesure(kmh, 'km/h')}, c’est ${mesure(kmh * 1000, 'm')} en 3${ESPACE}600${ESPACE}s : on divise par 3,6.<br>`
              + `${ecrire(kmh)} ÷ 3,6 = <b>${mesure(ms, 'm/s')}</b>. ⚠️ En m/s, le nombre est plus petit qu’en km/h.`,
          }));
        }
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce: `${mesure(ms, 'm/s')} = ___${ESPACE}km/h`,
          reponse: kmh,
          // le mauvais sens (÷ 3,6), la virgule (× 36 ou × 0,36), × 60, × 3 600 (des m par heure), pas de conversion
          pieges: meilleursPieges(kmh, [net(ms / 3.6), net(ms * 36), net(ms * 0.36), ms * 60, ms * 3600, ms], 2),
          garder: auHasard() ? [ms * 3600] : [],
          explication: `1${ESPACE}m/s, c’est 3${ESPACE}600${ESPACE}m en une heure, soit 3,6${ESPACE}km/h : on multiplie par 3,6.<br>`
            + `${ms} × 3,6 = <b>${mesure(kmh, 'km/h')}</b>. ⚠️ ${ms} × 3${ESPACE}600 = ${ecrire(ms * 3600)}, ce sont des <b>mètres</b> par heure.`,
        }));
      }
      if (sorte === 'energie') {
        const [appareil, P, durees] = parmi(APPAREILS);
        const t = parmi(durees);
        const E = net(P / 1000 * t / 60);
        const enonce = `${appareil} fonctionne pendant ${duree(t)}.`;
        const cas = parmi(['nombre', 'choix', 'choix', 'prix']);
        const prixKwh = parmi([0.2, 0.25]);
        if (cas === 'prix' && decimalesDe(net(E * prixKwh)) <= 2 && E * prixKwh >= 0.1) {
          const prix = net(E * prixKwh);
          return nombre({
            consigne: 'Calcule le prix',
            enonce: `${enonce} Le kWh coûte ${euros(prixKwh)}. Combien coûte l’énergie consommée ?`,
            reponse: prix,
            prix: true,
            explication: `${expliquerEnergie(P, t)}<br>Prix : ${ecrire(E)} × ${ecrire(prixKwh)} = <b>${euros(prix)}</b>.`,
          });
        }
        if (cas !== 'choix') {
          return nombre({
            consigne: 'Calcule l’énergie',
            enonce: `${enonce} Quelle énergie consomme-t-${appareil.startsWith('Une') ? 'elle' : 'il'}, en kWh ?`,
            reponse: E,
            unite: 'kWh',
            explication: expliquerEnergie(P, t),
          });
        }
        // Les erreurs : les W pas convertis en kW, la durée laissée en minutes, la virgule, P ÷ t au lieu de P × t,
        // et 1 h 30 min lu « 1,30 h »
        const pieges = [net(P * t / 60), net(P / 1000 * t), net(E * 10), net(E / 10), net(P / 1000 / enHeures(t))];
        if (t % 60) pieges.push(net(P / 1000 * (Math.floor(t / 60) + (t % 60) / 100)));
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule l’énergie',
          enonce: `${enonce} L’énergie consommée est ___.`,
          reponse: mesure(E, 'kWh'),
          pieges: meilleursPieges(E, pieges).map(x => mesure(x, 'kWh')),
          garder: auHasard() ? [mesure(net(P * t / 60), 'kWh')] : [],
          // (les erreurs sont surtout plus grandes que la réponse : rangés, la réponse serait souvent en premier)
          ordre: 'melange',
          explication: `${expliquerEnergie(P, t)}<br>⚠️ Sans convertir les W en kW, on trouverait ${mesure(net(P * t / 60), 'kWh')} : c’étaient des Wh !`,
        }));
      }
      if (sorte === 'debit') {
        if (auHasard()) {
          const cas = parmi(['remplir', 'remplir', 'douche']);
          if (cas === 'douche') {
            const debit = parmi([8, 10, 12, 15]);
            const t = parmi([4, 5, 6, 8, 10]);
            return nombre({
              consigne: 'Calcule le débit',
              enonce: `Inès prend une douche de ${mesure(t, 'min')}. Elle utilise ${mesure(debit * t, 'L')} d’eau. `
                + 'Quel est le débit de la douche, en L/min ?',
              reponse: debit,
              unite: 'L/min',
              explication: `Débit = volume ÷ durée = ${debit * t} ÷ ${t} = <b>${mesure(debit, 'L/min')}</b>.`,
            });
          }
          const [recipient, volumes, debits] = parmi([
            ['une baignoire de', [120, 150, 180, 200], [10, 12, 15, 20]],
            ['un arrosoir de', [10, 12], [2, 3, 4, 6]],
            ['une piscine gonflable de', [1200, 1500, 1800], [20, 25, 30]],
            ['un aquarium de', [60, 80, 120], [4, 5, 6, 8]],
          ]);
          let V;
          let debit;
          do { V = parmi(volumes); debit = parmi(debits); } while (V % debit !== 0);
          return nombre({
            consigne: 'Calcule la durée',
            enonce: `Un robinet a un débit de ${mesure(debit, 'L/min')}. Combien de minutes faut-il pour remplir ${recipient} ${mesure(V, 'L')} ?`,
            reponse: V / debit,
            unite: 'min',
            explication: `Chaque minute, il coule ${mesure(debit, 'L')}. Durée = volume ÷ débit = ${ecrire(V)} ÷ ${debit} = <b>${mesure(V / debit, 'min')}</b>.`,
          });
        }
        if (auHasard()) {
          const d = parmi([2, 5, 6, 8, 12, 15, 20, 25]);
          if (auHasard()) {
            return sansIndiceDeForme(() => choix({
              consigne: 'Convertis',
              enonce: `${mesure(d, 'L/min')} = ___${ESPACE}L/h`,
              reponse: d * 60,
              // × 100 au lieu de × 60, le mauvais sens (÷ 60), × 3 600 (comme pour des secondes)
              pieges: [d * 100, arrondir(d / 60, 2), d * 3600],
              ordre: 'melange',
              explication: `En 1${ESPACE}h = 60${ESPACE}min, il coule 60 fois plus qu’en une minute : ${d} × 60 = <b>${mesure(d * 60, 'L/h')}</b>.<br>`
                + '⚠️ Une heure, c’est 60 minutes, pas 100 !',
            }));
          }
          const h = d * 60;
          return sansIndiceDeForme(() => choix({
            consigne: 'Convertis',
            enonce: `${mesure(h, 'L/h')} = ___${ESPACE}L/min`,
            reponse: d,
            // ÷ 100 au lieu de ÷ 60, le mauvais sens (× 60), ÷ 3 600 (comme pour des secondes)
            pieges: [net(h / 100), h * 60, arrondir(h / 3600, 2)].filter(x => x > 0),
            ordre: 'melange',
            explication: `En une minute, il coule 60 fois moins qu’en une heure : ${ecrire(h)} ÷ 60 = <b>${mesure(d, 'L/min')}</b>.<br>`
              + '⚠️ Une heure, c’est 60 minutes, pas 100 !',
          }));
        }
        const m3 = parmi([0.6, 1.2, 1.8, 2.4, 3, 6, 12]);
        const reponse = net(m3 * 1000 / 60);
        return sansIndiceDeForme(() => choix({
          consigne: 'Convertis',
          enonce: `${mesure(m3, 'm³/h')} = ___${ESPACE}L/min`,
          reponse,
          // oublier ÷ 60, oublier × 1 000, × 60 au lieu de ÷ 60, 1 m³ = 100 L
          pieges: meilleursPieges(reponse, [net(m3 * 1000), net(m3 * 60), net(m3 * 1000 * 60), net(m3 * 100 / 60), net(m3 / 60)], 2),
          explication: `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L, donc ${mesure(m3, 'm³/h')} = ${mesure(net(m3 * 1000), 'L/h')}.<br>`
            + `En une minute, 60 fois moins : ${ecrire(net(m3 * 1000))} ÷ 60 = <b>${mesure(reponse, 'L/min')}</b>.`,
        }));
      }
      if (sorte === 'unite') return questionMots('Choisis l’unité', UNITES_COMPOSEES);
      if (sorte === 'masseVolumique') {
        const [matiere, objet, rho] = parmi(MATERIAUX);
        const V = parmi(objet.includes('lingot') ? [5, 10, 20] : [5, 10, 20, 50, 100]);
        const m = net(rho * V);
        if (auHasard()) {
          return sansIndiceDeForme(() => choix({
            consigne: 'Calcule la masse',
            enonce: `La masse volumique ${matiere} est ${mesure(rho, 'g/cm³')}. ${objet} de ${mesure(V, 'cm³')} a une masse de ___.`,
            reponse: mesure(m, 'g'),
            // V ÷ ρ au lieu de ρ × V, la virgule, et « 1 cm³ pèse 1 g » (c’est vrai pour l’eau seulement)
            pieges: meilleursPieges(m, [arrondir(V / rho, 1), net(m * 10), net(m / 10), V], 2).map(x => mesure(x, 'g')),
            ordre: 'melange',
            explication: `Chaque cm³ pèse ${mesure(rho, 'g')}. Masse = masse volumique × volume = ${ecrire(rho)} × ${V} = <b>${mesure(m, 'g')}</b>.`,
          }));
        }
        return sansIndiceDeForme(() => choix({
          consigne: 'Calcule la masse volumique',
          enonce: `${objet} a un volume de ${mesure(V, 'cm³')} et une masse de ${mesure(m, 'g')}. Sa masse volumique est ___.`,
          reponse: mesure(rho, 'g/cm³'),
          // V ÷ m au lieu de m ÷ V, m × V, la virgule
          pieges: meilleursPieges(rho, [arrondir(V / m, 2), net(m * V), net(rho * 10), net(rho / 10), m], 2).map(x => mesure(x, 'g/cm³')),
          // (V ÷ m est arrondi au centième, comme le ferait l’élève)
          ordre: 'melange',
          explication: `Masse volumique = masse ÷ volume = ${ecrire(m)} ÷ ${V} = <b>${mesure(rho, 'g/cm³')}</b> : chaque cm³ pèse ${mesure(rho, 'g')}.`,
        }));
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(REGLES_COMPOSEES, auHasard());
    },
    titreLecon: 'Les grandeurs composées',
    lecon: `
      <p>Une <b>grandeur quotient</b> est le quotient de deux grandeurs ; une <b>grandeur produit</b>, leur produit.</p>
      <table>
        <tr><th>Vitesse</th><td>v = d ÷ t</td><td>km/h, m/s</td></tr>
        <tr><th>Débit</th><td>volume ÷ durée</td><td>L/min, m³/h</td></tr>
        <tr><th>Masse volumique</th><td>masse ÷ volume</td><td>g/cm³, kg/m³</td></tr>
        <tr><th>Énergie (produit)</th><td>E = P × t</td><td>kWh (P en kW, t en h)</td></tr>
      </table>
      <p>👉 <i>36&nbsp;km en 1&nbsp;h&nbsp;30&nbsp;min : en 30&nbsp;min, 36 ÷ 3 = 12&nbsp;km ; en 1&nbsp;h, 2 × 12 = 24&nbsp;km. Donc v = 24&nbsp;km/h
        (c’est aussi 36 ÷ 1,5, car 1&nbsp;h&nbsp;30&nbsp;min = 1,5&nbsp;h).</i>
        Et d = v × t, t = d ÷ v.</p>
      <p>👉 <i>Un radiateur de 2&nbsp;000&nbsp;W = 2&nbsp;kW allumé 3&nbsp;h : E = 2 × 3 = 6&nbsp;kWh.</i></p>
      <p>👉 <i>Le fer : 7,8&nbsp;g/cm³, chaque cm³ pèse 7,8&nbsp;g : masse = 7,8 × volume.</i> De même, volume = débit × durée,
        et durée = volume ÷ débit (180&nbsp;L à 12&nbsp;L/min : 180 ÷ 12 = 15&nbsp;min).</p>
      <h4>Convertir</h4>
      <p>km/h → m/s : on <b>divise par 3,6</b> (72&nbsp;km/h = 20&nbsp;m/s) ; m/s → km/h : on <b>multiplie par 3,6</b>
        (car 1&nbsp;m/s = 3&nbsp;600&nbsp;m en une heure = 3,6&nbsp;km/h).</p>
      <p>12&nbsp;L/min = 12 × 60 = 720&nbsp;L/h · 3&nbsp;m³/h = 3&nbsp;000&nbsp;L/h = 3&nbsp;000 ÷ 60 = 50&nbsp;L/min</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> l’unité dit le calcul ! Des km/h, ce sont des km ÷ des h ; des kWh, des kW × des h.</div>
      <p><b>Minutes → heures :</b> on divise par 60 (45&nbsp;min = 45 ÷ 60 = 0,75&nbsp;h) ; <b>heures → minutes :</b> on multiplie
        par 60 (0,9&nbsp;h = 54&nbsp;min). Pour une vitesse, on peut aussi passer par l’heure : 4&nbsp;km en 12&nbsp;min,
        c’est 5 × 4 = 20&nbsp;km en 60&nbsp;min, donc 20&nbsp;km/h.</p>
      <p><b>Prix de l’énergie</b> = énergie (en kWh) × prix d’un kWh : 6&nbsp;kWh à 0,20&nbsp;€ coûtent 6 × 0,20 = 1,20&nbsp;€.</p>
      <p>⚠️ 1&nbsp;h&nbsp;30&nbsp;min = 1,5&nbsp;h, et pas 1,30&nbsp;h. Et une énergie s’écrit en kWh, pas en « kW/h ».</p>
    `,
  });

  // ======================================================================
  // 5. Les volumes : révision
  // ======================================================================
  // [l’énoncé, la réponse, les pièges, l’explication]
  const FORMULES_VOLUMES = [
    ['Le volume d’un cône de rayon r et de hauteur h est ___.', 'π × r² × h ÷ 3',
      ['π × r² × h', '2 × π × r × h', 'π × r × h ÷ 3', '4/3 × π × r³'],
      'Cône : V = aire de la base × hauteur ÷ 3 = <b>π × r² × h ÷ 3</b>. Sans le ÷ 3, c’est le cylindre.'],
    ['Le volume d’un cylindre de rayon r et de hauteur h est ___.', 'π × r² × h',
      ['π × r² × h ÷ 3', '2 × π × r × h', 'π × r × h', '2 × π × r² × h'],
      'Cylindre : V = aire de la base × hauteur = <b>π × r² × h</b>. (2 × π × r × h, c’est l’aire de la surface latérale.)'],
    ['Le volume d’une pyramide de hauteur h, dont la base a pour aire B, est ___.', 'B × h ÷ 3',
      ['B × h', 'B × h ÷ 2', 'B + h', 'B × h × 3'],
      'Pyramide : V = <b>B × h ÷ 3</b>, le tiers du prisme de même base et de même hauteur.'],
    ['Le volume d’un prisme droit de hauteur h, dont la base a pour aire B, est ___.', 'B × h',
      ['B × h ÷ 3', 'B × h ÷ 2', 'B + h', 'B × h × 3'],
      'Prisme droit : V = aire de la base × hauteur = <b>B × h</b>.'],
    ['Le volume d’une boule de rayon r est ___.', '4/3 × π × r³',
      ['4 × π × r²', 'π × r² × h ÷ 3', '4 × π × r³', '4/3 × π × r²'],
      `Boule : V = <b>${frac(4, 3)} × π × r³</b>. (4 × π × r², c’est l’aire de la sphère.)`],
    ['Le volume d’un cube d’arête c est ___.', 'c × c × c', ['c × c', '6 × c × c', '3 × c', '12 × c'],
      'Cube : V = <b>c × c × c</b> = c³. (c × c, c’est l’aire d’une face ; 6 × c × c, l’aire des 6 faces.)'],
  ];

  // [l’énoncé, la réponse, les pièges, l’explication]
  const COMPARAISONS_VOLUMES = [
    ['Un cône et un cylindre ont la même base et la même hauteur. Le volume du cylindre est ___ celui du cône.', 'le triple de',
      ['le double de', 'égal à', 'le tiers de'],
      'V(cône) = π × r² × h ÷ 3 et V(cylindre) = π × r² × h : le cylindre a un volume <b>3 fois plus grand</b>.'],
    ['Une pyramide et un prisme droit ont la même base et la même hauteur. Le volume de la pyramide est ___ celui du prisme.', 'le tiers de',
      ['la moitié de', 'égal à', 'le triple de'],
      'V(pyramide) = B × h ÷ 3 et V(prisme) = B × h : la pyramide a un volume <b>3 fois plus petit</b>.'],
    ['Une boule de rayon r est dans un cylindre de rayon r et de hauteur 2r. Le volume de la boule est ___ celui du cylindre.',
      'les deux tiers de', ['la moitié de', 'le tiers de', 'égal à'],
      `V(boule) = ${frac(4, 3)} × π × r³ ; V(cylindre) = π × r² × 2r = 2 × π × r³. Et ${frac(4, 3)} ÷ 2 = ${frac(2, 3)} : <b>les deux tiers</b>.`],
    ['Si on double la hauteur d’un cylindre sans changer son rayon, son volume est ___.', 'multiplié par 2',
      ['multiplié par 4', 'multiplié par 8', 'inchangé'],
      'V = π × r² × h : seule la hauteur est doublée, donc le volume est <b>multiplié par 2</b>.'],
    ['Si on double le rayon d’un cylindre sans changer sa hauteur, son volume est ___.', 'multiplié par 4',
      ['multiplié par 2', 'multiplié par 8', 'inchangé'],
      'V = π × r² × h : le rayon est au carré, donc le volume est multiplié par 2² = <b>4</b>. (Ce n’est pas un agrandissement : la hauteur ne change pas.)'],
  ];

  const REGLES_VOLUMES = [
    [`1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L`, true, `Oui : 1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ et 1${ESPACE}dm³ = 1${ESPACE}L, donc <b>1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L</b>.`],
    [`1${ESPACE}m³ = 100${ESPACE}L`, false, `Non : 1${ESPACE}m³ = 1${ESPACE}000${ESPACE}dm³ = <b>1${ESPACE}000${ESPACE}L</b>. Pour les volumes, on décale de 3 rangs.`],
    [`1${ESPACE}L = 1${ESPACE}dm³`, true, `Oui : <b>1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³</b>.`],
    [`1${ESPACE}cm³ = 1${ESPACE}L`, false, `Non : 1${ESPACE}cm³ = <b>1${ESPACE}mL</b>, et 1${ESPACE}L = 1${ESPACE}000${ESPACE}cm³.`],
    ['Le volume d’un cône est le tiers du volume du cylindre de même base et de même hauteur.', true,
      'Oui : π × r² × h ÷ 3, c’est <b>le tiers</b> de π × r² × h.'],
    ['Le volume d’une pyramide est la moitié du volume du prisme de même base et de même hauteur.', false,
      'Non : c’est <b>le tiers</b> : V = B × h ÷ 3.'],
    [`1${ESPACE}mL = 1${ESPACE}cm³`, true, `Oui : 1${ESPACE}L = 1${ESPACE}000${ESPACE}mL = 1${ESPACE}000${ESPACE}cm³, donc <b>1${ESPACE}mL = 1${ESPACE}cm³</b>.`],
    ['Le volume d’un cylindre de rayon r et de hauteur h est 2 × π × r × h.', false,
      'Non : 2 × π × r × h, c’est l’aire de la surface latérale. Le volume est <b>π × r² × h</b>.'],
  ];

  // Les conversions en litres : [de, vers, rangs (1 m³ = 1 000 L : 3 rangs), des nombres de départ]
  const CONVERSIONS_LITRES = [
    ['m³', 'L', 3, [1.5, 2, 2.5, 0.8, 0.25, 12]],
    ['cm³', 'L', -3, [250, 330, 500, 750, 1500, 2000]],
    ['L', 'cm³', 3, [0.5, 1.5, 2, 0.25, 0.75, 3]],
    ['dm³', 'L', 0, [3, 4.5, 12, 60, 0.5]],
    ['L', 'm³', -3, [500, 1200, 2500, 800]],
    ['cL', 'cm³', 1, [25, 33, 50, 75]],
  ];

  ajouterEtape({
    id: '3e-mesures-volumes',
    banque: ['formule', 'formule', 'calcul', 'calcul', 'exact', 'exact', 'litres', 'litres', 'compose', 'comparer', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'formule') return questionMots('Choisis la bonne formule', FORMULES_VOLUMES);
      if (sorte === 'comparer') return questionMots('Compare les volumes', COMPARAISONS_VOLUMES);
      if (sorte === 'calcul') {
        const solide = parmi(['prisme', 'pyramide', 'cylindre', 'cone', 'pave']);
        if (solide === 'prisme') {
          const [a, b] = parmi([[3, 4], [6, 8], [5, 12], [4, 6], [2, 5], [6, 5]]);
          const L = parmi([5, 8, 10, 12, 15]);
          const B = a * b / 2;
          return nombre({
            consigne: 'Calcule le volume',
            enonce: `Un prisme droit de hauteur ${mesure(L, 'cm')} a pour base un triangle rectangle dont les côtés de l’angle droit `
              + `mesurent ${mesure(a, 'cm')} et ${mesure(b, 'cm')}. Quel est son volume ?`,
            reponse: B * L,
            unite: 'cm³',
            explication: `Aire de la base : ${a} × ${b} ÷ 2 = ${mesure(B, 'cm²')}.<br>V = aire de la base × hauteur = ${B} × ${L} = <b>${mesure(B * L, 'cm³')}</b>.`,
          });
        }
        if (solide === 'pyramide') {
          let L;
          let l;
          let h;
          do { L = entier(3, 10); l = entier(2, L); h = entier(3, 12); } while ((L * l * h) % 3 !== 0 || L * l * h / 3 > 300);
          const base = L === l ? `un carré de ${mesure(L, 'cm')} de côté` : `un rectangle de ${mesure(L, 'cm')} sur ${mesure(l, 'cm')}`;
          return nombre({
            consigne: 'Calcule le volume',
            enonce: `Une pyramide de hauteur ${mesure(h, 'cm')} a pour base ${base}. Quel est son volume ?`,
            reponse: L * l * h / 3,
            unite: 'cm³',
            explication: `Aire de la base : ${L} × ${l} = ${mesure(L * l, 'cm²')}.<br>V = aire de la base × hauteur ÷ 3 = ${L * l} × ${h} ÷ 3 = `
              + `${L * l * h} ÷ 3 = <b>${mesure(L * l * h / 3, 'cm³')}</b>.`,
          });
        }
        if (solide === 'cylindre') {
          const r = parmi([1, 2, 3, 5, 10]);
          const h = parmi([2, 4, 5, 10, 20].filter(x => x !== r));
          const V = foisPi(r * r * h);
          return nombre({
            consigne: 'Calcule une valeur approchée',
            enonce: `Un cylindre a un rayon de ${mesure(r, 'cm')} et une hauteur de ${mesure(h, 'cm')}. Quel est son volume ? Prends π ≈ 3,14.`,
            reponse: V,
            unite: 'cm³',
            explication: `V = π × r² × h ≈ 3,14 × ${r * r} × ${h} = 3,14 × ${ecrire(r * r * h)} = <b>${mesure(V, 'cm³')}</b>.`,
          });
        }
        if (solide === 'cone') {
          const [r, h] = parmi([[3, 4], [3, 10], [6, 5], [2, 6], [5, 6], [3, 5], [6, 10], [2, 3]]);
          const exact = r * r * h / 3;
          const V = foisPi(exact);
          return nombre({
            consigne: 'Calcule une valeur approchée',
            enonce: `Un cône a une base de rayon ${mesure(r, 'cm')} et une hauteur de ${mesure(h, 'cm')}. Quel est son volume ? Prends π ≈ 3,14.`,
            reponse: V,
            unite: 'cm³',
            explication: `V = π × r² × h ÷ 3 : ${r * r} × ${h} ÷ 3 = ${exact}, puis ${exact} × 3,14 = <b>${mesure(V, 'cm³')}</b>.<br>`
              + '⚠️ Sans le ÷ 3, on trouverait le volume du cylindre.',
          });
        }
        const a = entier(4, 12);
        const [b, c] = [entier(3, Math.min(9, a)), entier(2, 8)];
        return nombre({
          consigne: 'Calcule le volume',
          enonce: `Un pavé droit mesure ${mesure(a, 'cm')} de long, ${mesure(b, 'cm')} de large et ${mesure(c, 'cm')} de haut. Quel est son volume ?`,
          reponse: a * b * c,
          unite: 'cm³',
          explication: `V = longueur × largeur × hauteur = ${a} × ${b} × ${c} = ${a * b} × ${c} = <b>${mesure(a * b * c, 'cm³')}</b>.`,
        });
      }
      if (sorte === 'exact') {
        if (auHasard()) {
          // Le cylindre : π × r² × h (pas r = 2 : l’aire latérale 2 × π × r × h aurait le même nombre)
          const r = entier(3, 6);
          const h = parmi([3, 4, 5, 6, 8, 10].filter(x => x !== r && x !== 2 * r));
          const V = r * r * h;
          return choix({
            consigne: 'Calcule le volume exact',
            enonce: `Un cylindre a un rayon de ${mesure(r, 'cm')} et une hauteur de ${mesure(h, 'cm')}. Son volume exact est ___.`,
            reponse: avecPi(V, 'cm³'),
            // π × r × h (le carré oublié), 2 × π × r × h (l’aire latérale), le ÷ 3 du cône, le diamètre pris pour le rayon
            pieges: meilleursPieges(V, [r * h, 2 * r * h, net(V / 3), 4 * V]).map(x => avecPi(x, 'cm³')),
            garder: [avecPi(2 * r * h, 'cm³')],
            explication: `V = π × r² × h = π × ${r}² × ${h} = π × ${r * r} × ${h} = <b>${avecPi(V, 'cm³')}</b>.<br>`
              + `⚠️ 2 × π × r × h = ${avecPi(2 * r * h, 'cm²')}, c’est l’aire de la surface latérale.`,
          });
        }
        // Le cône : π × r² × h ÷ 3 (r² × h est un multiple de 3)
        const [r, h] = parmi([[3, 4], [3, 5], [3, 8], [3, 10], [6, 2], [6, 5], [2, 6], [4, 3], [5, 3], [5, 6], [2, 9], [4, 6]]);
        const V = r * r * h / 3;
        return choix({
          consigne: 'Calcule le volume exact',
          enonce: `Un cône a une base de rayon ${mesure(r, 'cm')} et une hauteur de ${mesure(h, 'cm')}. Son volume exact est ___.`,
          reponse: avecPi(V, 'cm³'),
          // le ÷ 3 oublié (le cylindre), ÷ 2 au lieu de ÷ 3, le carré oublié
          pieges: meilleursPieges(V, [r * r * h, net(r * r * h / 2), net(r * h / 3), r * h]).map(x => avecPi(x, 'cm³')),
          garder: [avecPi(r * r * h, 'cm³')],
          explication: `V = π × r² × h ÷ 3 = π × ${r * r} × ${h} ÷ 3 = π × ${r * r * h} ÷ 3 = <b>${avecPi(V, 'cm³')}</b>.<br>`
            + `⚠️ Sans le ÷ 3, on trouve ${avecPi(r * r * h, 'cm³')} : c’est le volume du cylindre.`,
        });
      }
      if (sorte === 'litres') {
        if (auHasard()) {
          const [de, vers, k, departs] = parmi(CONVERSIONS_LITRES);
          const a = parmi(departs);
          const b = decaler(a, k);
          const decalages = [k - 1, k + 1, k - 2, k + 2, k + 3, k - 3].filter(j => j !== k);
          return sansIndiceDeForme(() => choix({
            consigne: 'Convertis',
            enonce: `${mesure(a, de)} = ___${ESPACE}${vers}`,
            reponse: b,
            pieges: meilleursPieges(b, decalages.map(j => decaler(a, j)).filter(x => x >= 0.001 && x < 1e7), 3),
            explication: `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L ; 1${ESPACE}L = 1${ESPACE}dm³ = 1${ESPACE}000${ESPACE}cm³ ; 1${ESPACE}cL = 10${ESPACE}cm³.<br>`
              + `${k === 0 ? 'C’est le même nombre' : `On ${k > 0 ? 'multiplie' : 'divise'} par ${ecrire(10 ** Math.abs(k))}`} : `
              + `${mesure(a, de)} = <b>${mesure(b, vers)}</b>.`,
          }));
        }
        const cas = parmi(['aquarium', 'piscine', 'verre']);
        if (cas === 'aquarium') {
          const [a, b, c] = [parmi([40, 50, 60, 80, 100]), parmi([20, 30, 40]), parmi([30, 40, 50])];
          const L = a * b * c / 1000;
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Un aquarium est un pavé droit de ${mesure(a, 'cm')} de long, ${mesure(b, 'cm')} de large et ${mesure(c, 'cm')} de haut. `
              + 'Combien de litres contient-il quand il est plein ?',
            reponse: L,
            unite: 'L',
            explication: `En dm : ${a / 10} × ${b / 10} × ${c / 10} = ${mesure(L, 'dm³')}, et 1${ESPACE}dm³ = 1${ESPACE}L : <b>${mesure(L, 'L')}</b>.<br>`
              + `(Ou en cm : ${ecrire(a * b * c)}${ESPACE}cm³ ÷ 1${ESPACE}000.)`,
          });
        }
        if (cas === 'piscine') {
          const [r, h] = parmi([[2, 1], [1.5, 1], [3, 1], [2, 1.5]]);
          const m3 = foisPi(r * r * h);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Une piscine a la forme d’un cylindre de rayon ${mesure(r, 'm')} et de profondeur ${mesure(h, 'm')}. `
              + 'Combien de litres d’eau contient-elle quand elle est pleine ? Prends π ≈ 3,14.',
            reponse: net(m3 * 1000),
            unite: 'L',
            explication: `V = π × r² × h ≈ 3,14 × ${ecrire(r * r)} × ${ecrire(h)} = ${mesure(m3, 'm³')}.<br>`
              + `1${ESPACE}m³ = 1${ESPACE}000${ESPACE}L, donc ${ecrire(m3)} × 1${ESPACE}000 = <b>${mesure(net(m3 * 1000), 'L')}</b>.`,
          });
        }
        // Un verre (moins de 35 cL), ou une carafe (environ 1 L)
        const [objet, r, h] = parmi([['Un verre', 3, 10], ['Un verre', 3, 12], ['Un verre', 2, 10], ['Une carafe', 4, 20], ['Une carafe', 5, 12]]);
        const cm3 = foisPi(r * r * h);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `${objet} a la forme d’un cylindre de rayon ${mesure(r, 'cm')} et de hauteur ${mesure(h, 'cm')}. `
            + `Combien de millilitres contient-${objet === 'Un verre' ? 'il' : 'elle'} quand ${objet === 'Un verre' ? 'il' : 'elle'} est plein${objet === 'Un verre' ? '' : 'e'} ? Prends π ≈ 3,14.`,
          reponse: cm3,
          unite: 'mL',
          explication: `V = π × r² × h ≈ 3,14 × ${r * r} × ${h} = ${mesure(cm3, 'cm³')}, et 1${ESPACE}cm³ = 1${ESPACE}mL : <b>${mesure(cm3, 'mL')}</b>.`,
        });
      }
      if (sorte === 'compose') {
        if (auHasard()) {
          // Un hangar : un pavé droit et un toit en prisme droit (la base du prisme est un triangle)
          const [L, l] = [parmi([8, 10, 12]), parmi([6, 8])];
          const [h1, h2] = [parmi([3, 4]), parmi([2, 3])];
          const pave = L * l * h1;
          const toit = l * h2 / 2 * L;
          return nombre({
            consigne: 'Calcule le volume',
            enonce: `Un hangar est formé d’un pavé droit de ${mesure(L, 'm')} sur ${mesure(l, 'm')} et de ${mesure(h1, 'm')} de haut, `
              + `surmonté d’un toit : un prisme droit de ${mesure(L, 'm')} de long dont la base est un triangle de base ${mesure(l, 'm')} `
              + `et de hauteur ${mesure(h2, 'm')}. Quel est son volume ?`,
            reponse: pave + toit,
            unite: 'm³',
            explication: `Pavé : ${L} × ${l} × ${h1} = ${mesure(pave, 'm³')}. Toit : aire du triangle ${l} × ${h2} ÷ 2 = ${mesure(l * h2 / 2, 'm²')}, `
              + `× ${L} = ${mesure(toit, 'm³')}.<br>En tout : ${pave} + ${toit} = <b>${mesure(pave + toit, 'm³')}</b>.`,
          });
        }
        // Un cornet de glace : un cône surmonté d’une demi-boule de même rayon (r = 3 cm)
        const h = parmi([6, 8, 9, 10, 12]);
        const cone = 3 * h;
        const demi = 18;
        return choix({
          consigne: 'Calcule le volume exact',
          enonce: `Une glace est formée d’un cône de rayon 3${ESPACE}cm et de hauteur ${mesure(h, 'cm')}, surmonté d’une demi-boule `
            + 'de rayon 3&nbsp;cm. Son volume exact est ___.',
          reponse: avecPi(cone + demi, 'cm³'),
          // une boule entière, le ÷ 3 du cône oublié, la demi-boule oubliée
          pieges: meilleursPieges(cone + demi, [cone + 36, 9 * h + demi, cone, 9 * h + 36]).map(x => avecPi(x, 'cm³')),
          explication: `Cône : π × 9 × ${h} ÷ 3 = ${avecPi(cone, 'cm³')}. Demi-boule : ${frac(4, 3)} × π × 27 ÷ 2 = ${avecPi(demi, 'cm³')}.<br>`
            + `En tout : ${cone}π + 18π = <b>${avecPi(cone + demi, 'cm³')}</b>.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(REGLES_VOLUMES, auHasard());
    },
    titreLecon: 'Les volumes : révision',
    lecon: `
      <table>
        <tr><th>Pavé droit</th><td>L × l × h</td><th>Cube</th><td>c × c × c</td></tr>
        <tr><th>Prisme droit</th><td>B × h</td><th>Cylindre</th><td>π × r² × h</td></tr>
        <tr><th>Pyramide</th><td>B × h ÷ 3</td><th>Cône</th><td>π × r² × h ÷ 3</td></tr>
        <tr><th>Boule</th><td colspan="3">${frac(4, 3)} × π × r³</td></tr>
      </table>
      <p>B est l’<b>aire de la base</b>, h la <b>hauteur</b>, r le <b>rayon</b>. Les solides « pointus » (pyramide, cône) ont un
        <b>÷ 3</b> : leur volume est le tiers de celui du prisme ou du cylindre de même base et de même hauteur.</p>
      <p>👉 <i>Cylindre de rayon 3&nbsp;cm et de hauteur 5&nbsp;cm : V = π × 9 × 5 = 45π&nbsp;cm³ ≈ 141,3&nbsp;cm³.</i></p>
      <p>👉 <i>Cône de même base et de même hauteur : 45π ÷ 3 = 15π&nbsp;cm³.</i></p>
      <p><b>Solide composé :</b> on le découpe en solides connus et on additionne leurs volumes (un cône + une demi-boule…).</p>
      <p><b>Volumes et contenances :</b> 1&nbsp;m³ = 1&nbsp;000&nbsp;L · 1&nbsp;dm³ = 1&nbsp;L · 1&nbsp;cm³ = 1&nbsp;mL · 1&nbsp;cL = 10&nbsp;cm³</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour convertir des volumes, chaque unité compte <b>3 rangs</b> (m³ → dm³ : × 1&nbsp;000).
        Pour avoir des litres, passe par les dm³ !</div>
      <p>⚠️ Toutes les longueurs dans la même unité avant de calculer, et le résultat en unité « cube » (cm³, m³).</p>
    `,
  });

  // ======================================================================
  // 6. Se repérer dans l’espace
  // ======================================================================
  // Une petite flèche de O vers P (pour les axes)
  function fleche(O, P) {
    const n = Math.hypot(P[0] - O[0], P[1] - O[1]);
    const u = [(P[0] - O[0]) / n, (P[1] - O[1]) / n];
    const Q = [P[0] - 8 * u[0], P[1] - 8 * u[1]];
    return F.segment(O, P, 'fig-axe') + F.ligne([[Q[0] - 5 * u[1], Q[1] + 5 * u[0]], P, [Q[0] + 5 * u[1], Q[1] - 5 * u[0]]], 'fig-axe');
  }
  // Le pavé ABCDEFGH dans le repère d’origine A : l’axe des abscisses (x) suit [AB), celui des ordonnées (y) suit [AD),
  // celui des altitudes (z) suit [AE). En bas à gauche, trois flèches rappellent les directions des axes.
  function figureRepere(a, b, c) {
    const p = pointsPave(a, b, c, { decalage: 30 });
    const G = centrePave(p);
    const O = [24, 246];
    const legende = fleche(O, [64, 246]) + fleche(O, [50, 220]) + fleche(O, [24, 206])
      + F.texte([73, 246], 'x', { classe: 'fig-petit' }) + F.texte([58, 212], 'y', { classe: 'fig-petit' })
      + F.texte([24, 195], 'z', { classe: 'fig-petit' });
    return F.svg(460, 260, tracePave(p) + nomsPave(p) + longueurDehors(p.A, p.B, ecrire(a), G)
      + longueurDehors(p.B, p.C, ecrire(b), G) + longueurDehors(p.A, p.E, ecrire(c), G) + legende,
    'Un pavé droit dans un repère de l’espace');
  }
  // Les coordonnées des sommets : A est l’origine
  const COORDONNEES_PAVE = (a, b, c) => ({
    A: [0, 0, 0], B: [a, 0, 0], C: [a, b, 0], D: [0, b, 0], E: [0, 0, c], F: [a, 0, c], G: [a, b, c], H: [0, b, c],
  });
  const triplet = ([x, y, z]) => `(${ecrire(x)}${ESPACE}; ${ecrire(y)}${ESPACE}; ${ecrire(z)})`;
  // Trois dimensions différentes (pour que les pièges « dans le désordre » soient bien différents)
  function tirerDimensions() {
    for (;;) {
      const [a, b] = [entier(3, 8), entier(2, 6)];
      const c = hauteurPave(b, [a, b]);
      if (a !== b) return [a, b, c];
    }
  }
  function expliquerSommet(nom, [x, y, z]) {
    return `Depuis l’origine A, l’abscisse se lit le long de [AB], l’ordonnée le long de [AD] et l’altitude le long de [AE] : `
      + `pour ${nom}, x = ${ecrire(x)}, y = ${ecrire(y)} et z = ${ecrire(z)}.<br>Donc <b>${nom}${triplet([x, y, z])}</b>.`;
  }

  // Une carte du monde : les longitudes de 180° O à 180° E en largeur, les latitudes de 90° S à 90° N en hauteur.
  // Les méridiens et les parallèles sont tracés tous les 30°. points : [{ lat, lon, nom }] (lat > 0 au nord, lon > 0 à l’est)
  function figureCarte(points) {
    const s = 400 / 360;
    const X = lon => 55 + (lon + 180) * s;
    const Y = lat => 22 + (90 - lat) * s;
    const coins = [[X(-180), Y(90)], [X(180), Y(90)], [X(180), Y(-90)], [X(-180), Y(-90)]];
    let html = F.polygone(coins, 'fig-plein');
    for (let lon = -150; lon <= 150; lon += 30) if (lon) html += F.segment([X(lon), Y(90)], [X(lon), Y(-90)], 'fig-fin');
    for (let lat = -60; lat <= 60; lat += 30) if (lat) html += F.segment([X(-180), Y(lat)], [X(180), Y(lat)], 'fig-fin');
    html += F.segment([X(-180), Y(0)], [X(180), Y(0)], 'fig-axe') + F.segment([X(0), Y(90)], [X(0), Y(-90)], 'fig-axe')
      + F.polygone(coins, 'fig-trait');
    [-120, -60, 0, 60, 120].forEach(lon => {
      html += F.texte([X(lon), Y(-90) + 14], lon ? `${Math.abs(lon)}° ${lon < 0 ? 'O' : 'E'}` : '0°', { classe: 'fig-petit' });
    });
    [60, 30, 0, -30, -60].forEach(lat => {
      html += F.texte([X(-180) - 6, Y(lat)], lat ? `${Math.abs(lat)}° ${lat < 0 ? 'S' : 'N'}` : '0°', { classe: 'fig-petit', ancre: 'end' });
    });
    html += F.texte([X(0), Y(90) - 11], 'méridien de Greenwich', { classe: 'fig-petit' })
      + F.texte([X(180) - 4, Y(0) - 10], 'équateur', { classe: 'fig-petit', ancre: 'end' });
    points.forEach(({ lat, lon, nom }) => { html += F.point([X(lon), Y(lat)], nom, { dx: 12, dy: -12 }); });
    return F.svg(460, 245, html, 'Une carte du monde avec les méridiens et les parallèles');
  }
  // Des coordonnées géographiques : « 30° N ; 60° E » (d’abord la latitude, puis la longitude)
  const geo = (lat, lon) => `${Math.abs(lat)}°${ESPACE}${lat > 0 ? 'N' : 'S'}${ESPACE}; ${Math.abs(lon)}°${ESPACE}${lon > 0 ? 'E' : 'O'}`;

  // [l’énoncé, la réponse, les pièges, l’explication]
  const VOCABULAIRE_TERRE = [
    ['Le cercle de latitude 0° s’appelle ___.', 'l’équateur', ['un méridien', 'le méridien de Greenwich'],
      'La latitude 0°, c’est <b>l’équateur</b> : il partage la Terre en hémisphère Nord et hémisphère Sud.'],
    ['Le méridien de Greenwich a pour longitude ___.', '0°', ['90°', '180°', '90° N'],
      'Le méridien de Greenwich (il passe près de Londres) est la référence des longitudes : sa longitude est <b>0°</b>.'],
    ['Les demi-cercles qui vont du pôle Nord au pôle Sud s’appellent ___.', 'les méridiens', ['les parallèles', 'les pôles', 'les diamètres'],
      'D’un pôle à l’autre : <b>les méridiens</b>. Tous les points d’un même méridien ont la même longitude.'],
    ['Les cercles parallèles à l’équateur s’appellent ___.', 'les parallèles', ['les méridiens', 'les pôles', 'les diamètres'],
      'Ce sont <b>les parallèles</b>. Tous les points d’un même parallèle ont la même latitude.'],
    ['La latitude du pôle Nord est ___.', '90° N', ['0°', '180° N', '90° E'],
      'Le pôle Nord est le point le plus au nord : sa latitude est <b>90° N</b>. La latitude va de 0° à 90°.'],
    ['La latitude d’un point de l’équateur est ___.', '0°', ['90° N', '180°', '90° E'],
      'L’équateur est la référence des latitudes : sa latitude est <b>0°</b>.'],
    ['La longitude d’un point se mesure à partir ___.', 'du méridien de Greenwich', ['de l’équateur', 'du pôle Nord', 'du pôle Sud'],
      'La longitude dit de combien de degrés on est à l’est ou à l’ouest <b>du méridien de Greenwich</b>.'],
    ['La latitude d’un point se mesure à partir ___.', 'de l’équateur', ['du méridien de Greenwich', 'du pôle Nord', 'du pôle Sud'],
      'La latitude dit de combien de degrés on est au nord ou au sud <b>de l’équateur</b>.'],
    ['Un point de longitude 20° O est ___ du méridien de Greenwich.', 'à l’ouest', ['à l’est', 'au nord', 'au sud'],
      'O veut dire <b>ouest</b> : le point est à 20° <b>à l’ouest</b> du méridien de Greenwich.'],
    ['Un point de latitude 40° S est ___ de l’équateur.', 'au sud', ['au nord', 'à l’est', 'à l’ouest'],
      'S veut dire <b>sud</b> : le point est à 40° <b>au sud</b> de l’équateur, dans l’hémisphère Sud.'],
  ];

  const REGLES_REPERAGE = [
    ['Tous les méridiens passent par les deux pôles.', true, 'Oui : un méridien est un demi-cercle qui va <b>du pôle Nord au pôle Sud</b>.'],
    ['Tous les parallèles ont la même longueur.', false,
      'Non : l’équateur est le plus grand ; les parallèles sont <b>de plus en plus petits</b> vers les pôles.'],
    ['L’équateur est le plus grand des parallèles.', true, 'Oui : c’est un <b>grand cercle</b> de la Terre (il a le même centre qu’elle).'],
    ['La longitude d’un point se mesure à partir de l’équateur.', false,
      'Non : la longitude se mesure à partir du <b>méridien de Greenwich</b> ; c’est la latitude qui se mesure à partir de l’équateur.'],
    ['Un point de latitude 0° est sur l’équateur.', true, 'Oui : l’équateur est le parallèle de latitude <b>0°</b>.'],
    [`Un point de coordonnées (4${ESPACE}; 3${ESPACE}; 0) a une abscisse égale à 0.`, false,
      'Non : c’est son <b>altitude</b> (le 3<sup>e</sup> nombre) qui vaut 0 ; son abscisse est 4.'],
    [`Le point de coordonnées (0${ESPACE}; 0${ESPACE}; 0) est l’origine du repère.`, true, 'Oui : les trois coordonnées de l’<b>origine</b> valent 0.'],
    ['Une latitude peut valoir 150° N.', false, 'Non : la latitude va de 0° (l’équateur) à <b>90°</b> (un pôle).'],
  ];

  const NOMS_COORDONNEES = ['l’abscisse', 'l’ordonnée', 'l’altitude'];
  // Des milieux dans le pavé : [la description, les deux extrémités]
  const MILIEUX_PAVE = [['le milieu de [EF]', 'E', 'F'], ['le milieu de [FG]', 'F', 'G'], ['le milieu de [BF]', 'B', 'F'],
    ['le milieu de [DC]', 'D', 'C'], ['le centre du pavé, le milieu de [AG]', 'A', 'G']];

  ajouterEtape({
    id: '3e-mesures-reperage',
    banque: ['pave', 'pave', 'paveNombre', 'paveNombre', 'coordonnee', 'coordonnee', 'carte', 'carte', 'terre', 'terre', 'terre',
      'ecart', 'ecart', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'pave') {
        const [a, b, c] = tirerDimensions();
        const sommets = COORDONNEES_PAVE(a, b, c);
        const debut = `ABCDEFGH est un pavé droit, dans le repère d’origine A (les axes x, y, z sont dessinés en bas à gauche).`;
        if (auHasard(0.6)) {
          const nom = parmi(['C', 'F', 'G', 'H', 'C', 'F', 'G', 'H', 'B', 'D', 'E']);
          const [x, y, z] = sommets[nom];
          // les coordonnées dans le désordre, et celles des sommets voisins
          const desordres = [[x, z, y], [y, x, z], [z, y, x], [y, z, x]];
          const autres = Object.entries(sommets).filter(([n]) => n !== nom && n !== 'A').map(([, t]) => t);
          const pieges = meilleursPieges(triplet([x, y, z]), [...RM.melanger(desordres).slice(0, 3), ...RM.melanger(autres).slice(0, 2)].map(triplet));
          return choix({
            consigne: 'Lis les coordonnées',
            enonce: `${debut} Quelles sont les coordonnées du point ${nom} ?${figureRepere(a, b, c)}`,
            reponse: triplet([x, y, z]),
            pieges,
            explication: expliquerSommet(nom, [x, y, z]),
          });
        }
        const nom = parmi(['B', 'C', 'D', 'E', 'F', 'G', 'H']);
        return choix({
          consigne: 'Trouve le point',
          enonce: `${debut} Quel point a pour coordonnées ${triplet(sommets[nom])} ?${figureRepere(a, b, c)}`,
          reponse: nom,
          pieges: RM.melanger(['B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(n => n !== nom)).slice(0, 3),
          explication: expliquerSommet(nom, sommets[nom]),
        });
      }
      if (sorte === 'paveNombre') {
        const [a, b, c] = tirerDimensions();
        const i = entier(0, 2);
        const debut = `ABCDEFGH est un pavé droit, dans le repère d’origine A (les axes x, y, z sont dessinés en bas à gauche).`;
        if (auHasard()) {
          const nom = parmi(['C', 'F', 'G', 'H']);
          const coordonnees = COORDONNEES_PAVE(a, b, c)[nom];
          return nombre({
            consigne: 'Lis la coordonnée',
            enonce: `${debut} Quelle est ${NOMS_COORDONNEES[i]} du point ${nom} ?${figureRepere(a, b, c)}`,
            reponse: coordonnees[i],
            explication: `${expliquerSommet(nom, coordonnees)}<br>${majuscule(NOMS_COORDONNEES[i])} est le ${['1er', '2e', '3e'][i]} nombre : `
              + `<b>${ecrire(coordonnees[i])}</b>.`,
          });
        }
        const [description, P, Q] = parmi(MILIEUX_PAVE);
        const sommets = COORDONNEES_PAVE(a, b, c);
        const coordonnees = [0, 1, 2].map(j => net((sommets[P][j] + sommets[Q][j]) / 2));
        return nombre({
          consigne: 'Calcule la coordonnée',
          enonce: `${debut} M est ${description}. Quelle est ${NOMS_COORDONNEES[i]} de M ?${figureRepere(a, b, c)}`,
          reponse: coordonnees[i],
          explication: `${P}${triplet(sommets[P])} et ${Q}${triplet(sommets[Q])}. Au milieu, on est à mi-chemin : `
            + `M${triplet(coordonnees)}.<br>${majuscule(NOMS_COORDONNEES[i])} de M : `
            + (sommets[P][i] === sommets[Q][i] ? `elle ne change pas, <b>${ecrire(coordonnees[i])}</b>.`
              : `la moitié de ${ecrire(sommets[P][i] + sommets[Q][i])}, soit ${ecrire(sommets[P][i] + sommets[Q][i])} ÷ 2 = <b>${ecrire(coordonnees[i])}</b>.`),
        });
      }
      if (sorte === 'coordonnee') {
        let x;
        let y;
        let z;
        do { [x, y, z] = [entier(1, 9), entier(1, 9), entier(1, 9)]; } while (new Set([x, y, z]).size < 3);
        if (auHasard()) {
          const i = entier(0, 2);
          const valeur = [x, y, z][i];
          return choix({
            consigne: 'Choisis le bon mot',
            enonce: `Le point M a pour coordonnées ${triplet([x, y, z])}. Le nombre ${valeur} est ___ de M.`,
            reponse: NOMS_COORDONNEES[i],
            pieges: NOMS_COORDONNEES.filter((n, j) => j !== i),
            explication: 'Dans l’ordre : (abscisse ; ordonnée ; altitude).<br>'
              + `${valeur} est le ${['1er', '2e', '3e'][i]} nombre : c’est <b>${NOMS_COORDONNEES[i]}</b> de M.`,
          });
        }
        return choix({
          consigne: 'Écris les coordonnées',
          enonce: `Le point M a pour ${RM.melanger([`altitude ${z}`, `abscisse ${x}`, `ordonnée ${y}`]).join(', pour ').replace(/, pour ([^,]*)$/, ' et pour $1')}. `
            + 'Ses coordonnées sont ___.',
          reponse: triplet([x, y, z]),
          pieges: [[z, x, y], [x, z, y], [y, x, z], [z, y, x]].map(triplet),
          explication: `On écrit toujours dans l’ordre (abscisse ; ordonnée ; altitude) : <b>M${triplet([x, y, z])}</b>.`,
        });
      }
      if (sorte === 'carte') {
        // Le point cherché, ses deux « miroirs » (l’autre hémisphère : N ↔ S, E ↔ O), et un autre point, pris ailleurs
        const lat = parmi([30, 60]) * parmi([1, -1]);
        const lon = parmi([30, 60, 90, 120, 150]) * parmi([1, -1]);
        let autre;
        do {
          autre = [parmi([30, 60]) * parmi([1, -1]), parmi([30, 60, 90, 120, 150]) * parmi([1, -1])];
        } while (Math.abs(autre[0]) === Math.abs(lat) || Math.abs(autre[1]) === Math.abs(lon));
        const lettres = RM.melanger(['A', 'B', 'C', 'D']);
        const points = [[lat, lon], [-lat, lon], [lat, -lon], autre].map(([la, lo], i) => ({ lat: la, lon: lo, nom: lettres[i] }));
        const cible = points[0];
        const expliquer = `${cible.nom} est à ${Math.abs(lat)}° ${lat > 0 ? 'au nord' : 'au sud'} de l’équateur (la latitude, en premier), `
          + `et à ${Math.abs(lon)}° ${lon > 0 ? 'à l’est' : 'à l’ouest'} du méridien de Greenwich (la longitude).<br>`
          + `Donc <b>${cible.nom}(${geo(lat, lon)})</b>.`;
        const debut = 'Sur cette carte, les méridiens et les parallèles sont tracés tous les 30°.';
        if (auHasard()) {
          const autres = [geo(-lat, lon), geo(lat, -lon), geo(-lat, -lon), geo(autre[0], autre[1])];
          // latitude et longitude échangées (seulement si ça reste une latitude possible : 90° au plus)
          if (Math.abs(lon) <= 90 && Math.abs(lon) !== Math.abs(lat)) {
            autres.unshift(geo(Math.sign(lat) * Math.abs(lon), Math.sign(lon) * Math.abs(lat)));
          }
          return choix({
            consigne: 'Lis les coordonnées',
            enonce: `${debut} Quelles sont les coordonnées (latitude ; longitude) du point ${cible.nom} ?${figureCarte(points)}`,
            reponse: geo(cible.lat, cible.lon),
            pieges: autres,
            garder: autres.slice(0, 1),
            explication: expliquer,
          });
        }
        return choix({
          consigne: 'Trouve le point',
          enonce: `${debut} Quel point a pour coordonnées (${geo(cible.lat, cible.lon)}) ?${figureCarte(points)}`,
          reponse: cible.nom,
          pieges: points.filter(p => p !== cible).map(p => p.nom),
          explication: expliquer,
        });
      }
      if (sorte === 'terre') return questionMots('Choisis la bonne réponse', VOCABULAIRE_TERRE);
      if (sorte === 'ecart') {
        const memeCote = auHasard();
        let l1;
        let l2;
        do {
          l1 = 5 * entier(1, 14);
          l2 = 5 * entier(1, 14);
        } while (l1 === l2 || (!memeCote && l1 + l2 > 120));
        const ecartDegres = memeCote ? Math.abs(l1 - l2) : l1 + l2;
        const [h1, h2] = memeCote ? parmi([['N', 'N'], ['S', 'S']]) : parmi([['N', 'S'], ['S', 'N']]);
        const calcul = memeCote
          ? `Les deux stations sont du même côté de l’équateur : on soustrait, ${Math.max(l1, l2)} − ${Math.min(l1, l2)} = ${ecartDegres}°`
          : `Les deux stations sont de part et d’autre de l’équateur : on additionne, ${l1} + ${l2} = ${ecartDegres}°`;
        const debut = `Deux stations météo sont sur le même méridien, l’une à la latitude ${l1}°${ESPACE}${h1}, l’autre à ${l2}°${ESPACE}${h2}.`;
        if (auHasard() && ecartDegres <= 60) {
          return nombre({
            consigne: 'Calcule la distance',
            enonce: `${debut} Le long d’un méridien, 1° correspond à environ 111${ESPACE}km. `
              + 'Quelle distance parcourt-on le long du méridien pour aller de l’une à l’autre ?',
            reponse: ecartDegres * 111,
            unite: 'km',
            explication: `${calcul}.<br>Distance : ${ecartDegres} × 111 = <b>${mesure(ecartDegres * 111, 'km')}</b> environ.`,
          });
        }
        return nombre({
          consigne: 'Calcule l’écart',
          enonce: `${debut} Quel est l’écart entre leurs latitudes, en degrés ?`,
          reponse: ecartDegres,
          unite: '°',
          solution: `<b>${ecartDegres}°</b>`,
          explication: `${calcul}.<br>L’écart est de <b>${ecartDegres}°</b>.`,
        });
      }
      // Vrai ou faux : on choisit d’abord la réponse, pour avoir autant de « Vrai » que de « Faux »
      return vraiFauxDans(REGLES_REPERAGE, auHasard());
    },
    titreLecon: 'Se repérer dans l’espace',
    lecon: `
      <h4>Dans un pavé droit</h4>
      <p>On choisit un sommet comme <b>origine</b> (ici A) et trois axes le long des arêtes [AB), [AD) et [AE).
        Un point est repéré par trois nombres (x&nbsp;; y&nbsp;; z) : son <b>abscisse</b>, son <b>ordonnée</b> et son <b>altitude</b> (la hauteur).</p>
      ${figureRepere(5, 3, 2)}
      <p>👉 <i>B(5&nbsp;; 0&nbsp;; 0) · C(5&nbsp;; 3&nbsp;; 0) · E(0&nbsp;; 0&nbsp;; 2) · G(5&nbsp;; 3&nbsp;; 2).
        Le milieu de [EF] a pour coordonnées (2,5&nbsp;; 0&nbsp;; 2).</i></p>
      <p>Au <b>milieu</b> d’une arête, on est à mi-chemin : on prend la moitié de la longueur (milieu de [EF] : x = 5 ÷ 2 = 2,5) ;
        les autres coordonnées ne changent pas.</p>
      <h4>Sur la Terre</h4>
      <p>Les <b>méridiens</b> sont des demi-cercles qui vont d’un pôle à l’autre ; le <b>méridien de Greenwich</b> (0°) sert de référence.
        Les <b>parallèles</b> sont des cercles parallèles à l’<b>équateur</b> (0°).</p>
      <p>Un point est repéré par sa <b>latitude</b> (de 0° à 90°, au nord N ou au sud S de l’équateur), puis sa <b>longitude</b>
        (de 0° à 180°, à l’est E ou à l’ouest O du méridien de Greenwich).</p>
      ${figureCarte([{ lat: 30, lon: 60, nom: 'P' }])}
      <p>👉 <i>P(30° N&nbsp;; 60° E).</i> Sur un même méridien, l’écart de latitude entre 40° N et 10° S est 40 + 10 = 50°.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> la <b>lat</b>itude se lit sur les lignes « à <b>plat</b> » (les parallèles) ;
        la longitude, sur les méridiens, qui vont d’un pôle à l’autre.</div>
      <p>⚠️ L’ordre compte : (abscisse&nbsp;; ordonnée&nbsp;; altitude) dans le pavé, et d’abord la latitude, puis la longitude.</p>
    `,
  });
})();
