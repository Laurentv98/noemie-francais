// Renard Malin — le moteur des maths (commun à tous les niveaux)
//
// En maths, les questions sont surtout fabriquées au hasard : le moteur tire des nombres,
// calcule la bonne réponse et écrit l'explication. On a ainsi des questions toujours nouvelles,
// et la réponse est toujours juste puisqu'elle est calculée.
// Il fournit :
// - des nombres au hasard, et les nombres écrits à la française (3,5 · 12 500 · −4) ;
// - les fractions et les puissances, bien écrites ;
// - trois sortes de questions : choisir la réponse (choix), l'écrire au clavier (nombre, fraction), vrai ou faux ;
// - de petites figures (des dessins en SVG) : segments, angles, droite graduée, repère, diagramme en barres…

(function () {
  // ======================================================================
  // Le hasard
  // ======================================================================
  // Un nombre entier entre min et max (compris)
  const entier = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  // Un élément d'une liste, au hasard
  const parmi = liste => RM.hasard(liste);
  // Un entier entre min et max, mais pas dans la liste des interdits
  function entierSauf(min, max, interdits = []) {
    const possibles = [];
    for (let n = min; n <= max; n++) if (!interdits.includes(n)) possibles.push(n);
    return parmi(possibles);
  }
  // Un nombre décimal entre min et max, avec exactement ce nombre de chiffres après la virgule
  // (le dernier chiffre n'est jamais 0 : 3,40 s'écrirait 3,4)
  function decimal(min, max, decimales = 1) {
    const p = 10 ** decimales;
    let n;
    do { n = entier(Math.ceil(min * p), Math.floor(max * p)); } while (decimales > 0 && n % 10 === 0);
    return n / p;
  }

  // ======================================================================
  // Les nombres, écrits à la française
  // ======================================================================
  // Enlève les petites erreurs de calcul de l'ordinateur : 0,1 + 0,2 = 0,30000000000000004 → 0,3
  const net = x => Number(Number(x).toPrecision(12));

  // Arrondir à « decimales » chiffres après la virgule (0 = à l'unité)
  function arrondir(x, decimales = 0) {
    const signe = x < 0 ? -1 : 1;
    return signe * Number(Math.round(Number(`${Math.abs(net(x))}e${decimales}`)) + `e-${decimales}`);
  }

  const MOINS = '−'; // le vrai signe moins (plus long que le tiret)
  const ESPACE = ' '; // une espace insécable, entre les classes : 12 500

  // 3.5 → « 3,5 » ; 12500 → « 12 500 » ; −4 → « −4 »
  // signe : true pour écrire aussi le + des nombres positifs (+3)
  function ecrire(x, { signe = false } = {}) {
    let valeur = net(x);
    if (Object.is(valeur, -0)) valeur = 0;
    const [entiere, decimale] = Math.abs(valeur).toFixed(10).replace(/\.?0+$/, '').split('.');
    const avecEspaces = entiere.length > 3 ? entiere.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE) : entiere;
    const devant = valeur < 0 ? MOINS : (signe && valeur > 0 ? '+' : '');
    return devant + avecEspaces + (decimale ? ',' + decimale : '');
  }

  // Un nombre et son unité, avec une espace insécable : mesure(12, 'cm') → « 12 cm » ; mesure(25, '%') → « 25 % »
  const mesure = (x, unite) => ecrire(x) + ESPACE + unite;
  // Un prix : euros(3.5) → « 3,50 € » ; euros(12) → « 12 € »
  const euros = x => (Number.isInteger(net(x)) ? ecrire(x) : ecrire(arrondir(x, 2)).replace(/,(\d)$/, ',$10')) + ESPACE + '€';
  // Un prix en francs Pacifique (XPF), la monnaie de la Nouvelle-Calédonie : francs(1500) → « 1 500 F ».
  // Il n'y a pas de centimes : le prix est arrondi au franc.
  const francs = x => ecrire(arrondir(x)) + ESPACE + 'F';

  // Des prénoms qu'on entend en Nouvelle-Calédonie (il : « il » ou « elle », pour accorder les phrases)
  const PRENOMS = [
    { nom: 'Kalia', il: 'elle' }, { nom: 'Wakana', il: 'elle' }, { nom: 'Maëva', il: 'elle' }, { nom: 'Hinano', il: 'elle' },
    { nom: 'Léa', il: 'elle' }, { nom: 'Lina', il: 'elle' }, { nom: 'Mei', il: 'elle' }, { nom: 'Sélène', il: 'elle' },
    { nom: 'Teva', il: 'il' }, { nom: 'Noa', il: 'il' }, { nom: 'Kylian', il: 'il' }, { nom: 'Sione', il: 'il' },
    { nom: 'Wanir', il: 'il' }, { nom: 'Tom', il: 'il' }, { nom: 'Hugo', il: 'il' }, { nom: 'Minh', il: 'il' },
  ];
  // Des lieux de Nouvelle-Calédonie, pour les petits problèmes
  const LIEUX = ['Nouméa', 'Lifou', 'Maré', 'Ouvéa', 'l’île des Pins', 'Bourail', 'Koné', 'Hienghène', 'Poindimié',
    'La Foa', 'Thio', 'Dumbéa', 'Païta', 'Mont-Dore', 'Koumac', 'Pouébo'];

  // Le nombre de chiffres après la virgule : decimalesDe(3.25) → 2
  const decimalesDe = x => (ecrire(x).split(',')[1] || '').length;

  // Un nombre relatif entre parenthèses, comme en 5e : (+3), (−5)
  const relatif = x => `(${ecrire(x, { signe: true })})`;
  // Un nombre, avec des parenthèses s'il est négatif : pour écrire 3 × (−2)
  const parentheses = x => (net(x) < 0 ? `(${ecrire(x)})` : ecrire(x));

  // Lire un nombre tapé par l'élève : « 3,5 », « 3.5 », « 12 500 », « -4 », « x = 3 », « 12 cm »…
  // Renvoie NaN si ce n'est pas un nombre.
  function lireNombre(texte) {
    const t = String(texte).trim().toLowerCase()
      .replace(/[−‒–—]/g, '-')
      .replace(/\s/g, '')        // les espaces (même insécables) : « 12 500 » → « 12500 »
      .replace(/^[a-z]=/, '')        // « x = 3 » → « 3 »
      .replace(/[^0-9]+$/, '')       // l'unité tapée en plus : « 12 cm » → « 12 »
      .replace(',', '.');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
    return Number(t);
  }

  // Deux nombres égaux (à une toute petite erreur de calcul près)
  const egaux = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

  // ======================================================================
  // Les fractions et les puissances
  // ======================================================================
  const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
  const ppcm = (a, b) => Math.abs(a * b) / pgcd(a, b);

  // Simplifier au maximum : simplifier(6, 8) → [3, 4] (le dénominateur est toujours positif)
  function simplifier(n, d) {
    const k = pgcd(n, d) * (d < 0 ? -1 : 1);
    return [n / k, d / k];
  }

  // Une fraction en HTML, écrite l'un au-dessus de l'autre : frac(3, 4) ; frac('x', 2) marche aussi
  function frac(n, d) {
    const ecrit = v => (typeof v === 'number' ? ecrire(v) : v);
    const negative = typeof n === 'number' && typeof d === 'number' && n * d < 0;
    const haut = typeof n === 'number' && negative ? ecrire(Math.abs(n)) : ecrit(n);
    const bas = typeof d === 'number' && negative ? ecrire(Math.abs(d)) : ecrit(d);
    return `${negative ? MOINS : ''}<span class="frac"><span>${haut}</span><span>${bas}</span></span>`;
  }
  // Une fraction en texte, pour les boutons : « 3/4 », « −2/5 »
  function fracTexte(n, d) {
    const [a, b] = d < 0 ? [-n, -d] : [n, d];
    return `${ecrire(a)}/${ecrire(b)}`;
  }

  // Dans un texte, les fractions « 3/4 » deviennent des vraies fractions (« km/h » ne bouge pas ; « 568/1 000 » marche aussi)
  const FRACTION = /(\d[\d ]*)\/(\d(?:[\d ]*\d)?)/g;
  const avecFractions = texte => String(texte).replace(FRACTION, (tout, n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`);

  // Lire une fraction tapée : « 3/4 », « -2/5 », « 3 » (= 3/1). Renvoie { n, d } ou null.
  function lireFraction(texte) {
    const t = String(texte).replace(/[−‒–—]/g, '-').replace(/\s/g, '');
    const m = t.match(/^([-+]?\d+)(?:\/([-+]?\d+))?$/);
    if (!m) return null;
    const n = Number(m[1]);
    const d = m[2] === undefined ? 1 : Number(m[2]);
    if (d === 0) return null;
    return d < 0 ? { n: -n, d: -d } : { n, d };
  }

  // Les puissances : puissance(10, 3) → « 10<sup>3</sup> » (HTML) ; puissanceTexte(10, -3) → « 10⁻³ » (boutons)
  const puissance = (base, exposant) => `${base}<sup>${String(exposant).replace('-', MOINS)}</sup>`;
  const EXPOSANTS = { '-': '⁻', '−': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const puissanceTexte = (base, exposant) => `${base}${[...String(exposant)].map(c => EXPOSANTS[c]).join('')}`;

  // Un angle : angle('ABC') → l'angle ABC avec son petit chapeau (HTML) ; angleTexte('ABC') → « AB̂C » (boutons)
  const angle = nom => `<span class="angle">${nom}</span>`;
  const angleTexte = nom => (nom.length === 3 ? `${nom[0]}${nom[1]}̂${nom[2]}` : `${nom}̂`);

  // Un tableau (pour la proportionnalité, les statistiques…) : une liste de lignes, chaque ligne une liste de cases.
  // Les nombres sont écrits à la française ; une case '___' devient le trou de la question (un seul par énoncé).
  // La première case de chaque ligne est un titre (écrit en gras).
  function tableau(lignes) {
    const cases = ligne => ligne.map((c, i) => (i === 0 ? `<th>${c}</th>` : `<td>${typeof c === 'number' ? ecrire(c) : c}</td>`)).join('');
    return `<table class="tableau-maths">${lignes.map(l => `<tr>${cases(l)}</tr>`).join('')}</table>`;
  }

  // ======================================================================
  // Les questions
  // ======================================================================
  const echapper = texte => String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const texteDe = valeur => (typeof valeur === 'number' ? ecrire(valeur) : String(valeur));
  const aUneFraction = texte => /\d\/\d/.test(texte);

  // L'énoncé : ___ devient un trou (la réponse s'y affiche ensuite), [[…]] est souligné
  const preparer = enonce => RM.phrases.souligner(RM.phrases.avecTrou(enonce));
  // La solution par défaut : l'énoncé avec la réponse dans le trou, ou la réponse en gras
  function solutionPar(enonce, reponseHtml) {
    if (enonce.includes('___')) return RM.phrases.souligner(RM.phrases.avecMot(enonce, reponseHtml));
    return `<b>${reponseHtml}</b>`;
  }

  // Un bouton qui est un nombre, avec son unité si besoin (« 12 », « 3,5 cm² », « 25 % », « 4,50 € »),
  // mais pas une expression (« 8 × π », « 2 h 30 min ») : ceux-là sont rangés, les autres mélangés
  // (l'unité est toujours séparée par une espace, sauf le degré : « 5x » est une expression, pas « 5 » et une unité)
  const estUnNombre = texte => /^[−+-]?\d[\d\s]*(,\d+)?(°|\s[a-zA-Zµ²³%€]+(\/[a-zA-Z]+)?[²³]?)?$/.test(String(texte).trim());

  // Parmi des nombres qui seront rangés, on choisit les pièges pour que la bonne réponse soit
  // tantôt en premier, tantôt au milieu, tantôt en dernier (sinon, on la devinerait à sa place)
  // (les pièges « à garder » sont toujours pris ; on choisit les autres autour d'eux)
  function piegesAuHasard(bonne, autres, combien, aGarder = []) {
    const valeur = lireNombre(bonne);
    const fixes = aGarder.filter(p => autres.includes(p)).slice(0, combien);
    const libres = autres.filter(p => !fixes.includes(p));
    const dessous = RM.melanger(libres.filter(p => lireNombre(p) < valeur));
    const dessus = RM.melanger(libres.filter(p => lireNombre(p) > valeur));
    const k = Math.min(combien - fixes.length, dessous.length + dessus.length);
    const combienDessous = entier(Math.max(0, k - dessus.length), Math.min(k, dessous.length));
    return [...fixes, ...dessous.slice(0, combienDessous), ...dessus.slice(0, k - combienDessous)];
  }

  // Choisir la bonne réponse parmi des boutons.
  // reponse et pieges : des nombres (écrits à la française par le moteur) ou des textes.
  // Les pièges en double ou égaux à la réponse sont enlevés ; on en garde (nombreChoix − 1) au hasard.
  // Si tous les boutons sont des nombres, ils sont rangés du plus petit au plus grand ; sinon, mélangés.
  // ordre : 'croissant', 'melange' ou 'fixe' (garder l'ordre des pièges, la réponse en premier)
  // choix : pour donner tous les boutons dans un ordre fixe (la réponse doit en faire partie)
  // garder : les pièges à proposer à coup sûr (l'erreur classique dont parle l'explication) ;
  //          ils font aussi partie des pièges, et le moteur choisit les autres autour d'eux
  function choix({
    consigne, enonce, reponse, pieges = [], choix: fixes, explication, solution, nombreChoix = 4, ordre, garder = [],
  }) {
    const bonne = texteDe(reponse);
    let boutons;
    if (fixes) {
      boutons = fixes.map(texteDe);
    } else {
      const aGarder = garder.map(texteDe).filter(p => p && p !== bonne);
      const autres = [...new Set([...aGarder, ...pieges.map(texteDe)])].filter(p => p && p !== bonne);
      const tousDesNombres = [bonne, ...autres].every(estUnNombre);
      const ranges = ordre === 'croissant' || (!ordre && tousDesNombres);
      const melanges = () => {
        const reste = RM.melanger(autres.filter(p => !aGarder.includes(p)));
        return [...aGarder.filter(p => autres.includes(p)), ...reste];
      };
      boutons = [bonne, ...(ordre === 'fixe' ? autres : (ranges ? piegesAuHasard(bonne, autres, nombreChoix - 1, aGarder) : melanges()))
        .slice(0, nombreChoix - 1)];
      if (ranges) boutons.sort((a, b) => lireNombre(a) - lireNombre(b));
      else if (ordre !== 'fixe') boutons = RM.melanger(boutons);
    }
    if (boutons.length < 2) throw new Error(`pas assez de pièges pour : ${enonce}`);
    const q = {
      type: 'choix',
      consigne,
      enonce: preparer(enonce),
      reponse: bonne,
      choix: boutons,
      solution: solution || solutionPar(enonce, aUneFraction(bonne) ? avecFractions(echapper(bonne)) : echapper(bonne)),
      explication,
    };
    // Les fractions des boutons s'écrivent l'une au-dessus de l'autre
    if (boutons.some(aUneFraction)) {
      q.etiquettes = {};
      boutons.forEach(b => { if (aUneFraction(b)) q.etiquettes[b] = avecFractions(echapper(b)); });
    }
    return q;
  }

  // Écrire un nombre au clavier. La réponse peut être tapée avec une virgule ou un point.
  // unite : s'affiche à côté de la case (« cm »), l'élève n'a que le nombre à taper
  // touches : les boutons d'aide sous la case (par défaut la virgule ; ajoute '−' pour les nombres relatifs)
  // prix : true pour un prix en euros (la réponse s'écrit 3,50 et le signe € est à côté de la case)
  // enFrancs : true pour un prix en francs (XPF) : un nombre entier, et « F » à côté de la case
  function nombre({ consigne, enonce, reponse, unite = '', explication, solution, touches = [','], prix = false, enFrancs = false }) {
    const valeur = net(reponse);
    const ecrit = prix ? euros(valeur).replace(ESPACE + '€', '') : ecrire(valeur);
    if (prix) unite = '€';
    if (enFrancs) { unite = 'F'; if (touches.length === 1 && touches[0] === ',') touches = []; }
    return {
      type: 'ecrire',
      saisie: 'nombre',
      consigne,
      enonce: preparer(enonce),
      reponse: ecrit,
      unite,
      touches,
      comparer: tape => egaux(lireNombre(tape), valeur),
      // Les bons chiffres, mais la virgule mal placée ou le signe oublié : Roxy le dit
      presque(tape) {
        const lu = lireNombre(tape);
        if (!Number.isFinite(lu) || lu === 0 || valeur === 0) return '';
        if (egaux(lu, -valeur)) return 'Presque ! Attention au signe.';
        const rapport = Math.log10(Math.abs(lu / valeur));
        if (Math.abs(rapport - Math.round(rapport)) < 1e-9 && Math.sign(lu) === Math.sign(valeur)) {
          return 'Presque ! Regarde bien la place de la virgule.';
        }
        return '';
      },
      // (si l'énoncé écrit déjà l'unité juste après le trou, on ne la répète pas)
      solution: solution || solutionPar(enonce, ecrit
        + (unite && !(enonce.split('___')[1] || '').trimStart().startsWith(unite) ? (unite === '°' ? '' : ESPACE) + unite : '')),
      explication,
    };
  }

  // Écrire une fraction au clavier (avec la barre /). La réponse attendue est n/d.
  // irreductible : true s'il faut la simplifier au maximum (6/8 ne suffit pas, il faut 3/4)
  function fraction({ consigne, enonce, n, d, irreductible = true, explication, solution, touches = ['/'] }) {
    const [a, b] = d < 0 ? [-n, -d] : [n, d];
    const ecrit = b === 1 ? ecrire(a) : fracTexte(a, b);
    const html = b === 1 ? ecrire(a) : frac(a, b);
    return {
      type: 'ecrire',
      saisie: 'fraction',
      consigne,
      enonce: preparer(enonce),
      reponse: ecrit,
      etiquettes: { [ecrit]: html },
      touches,
      comparer(tape) {
        const f = lireFraction(tape);
        if (!f) return false;
        return irreductible ? f.n === a && f.d === b : f.n * b === f.d * a;
      },
      presque(tape) {
        const f = lireFraction(tape);
        return f && irreductible && f.n * b === f.d * a ? 'Presque ! Tu peux encore simplifier ta fraction.' : '';
      },
      solution: solution || solutionPar(enonce, html),
      explication,
    };
  }

  // Vrai ou faux ?
  function vraiFaux({ consigne = 'Vrai ou faux ?', enonce, vrai, explication, solution }) {
    return {
      type: 'choix',
      consigne,
      enonce: preparer(enonce),
      choix: ['Vrai', 'Faux'],
      reponse: vrai ? 'Vrai' : 'Faux',
      solution: solution || `<b>${vrai ? 'Vrai' : 'Faux'}</b>`,
      explication,
    };
  }

  // ======================================================================
  // Les étapes
  // ======================================================================
  // banque : la liste des sortes de questions (on peut répéter une sorte pour qu'elle revienne plus souvent),
  //          ou des questions écrites à la main ;
  // creerQuestion(sorte) : fabrique une question de cette sorte (avec choix, nombre, fraction ou vraiFaux).
  // Le moteur pioche dans la banque sans répéter, et évite de poser deux fois la même question dans une partie.
  function ajouterEtape({ id, banque, creerQuestion, titreLecon, lecon }) {
    RM.etapes.push({
      id,
      titreLecon,
      lecon,
      creerQuestions(nombreDeQuestions) {
        let pioche = [];
        const questions = [];
        const dejaPosees = new Set();
        let essais = 0;
        while (questions.length < nombreDeQuestions) {
          if (pioche.length === 0) pioche = RM.melanger(banque);
          const q = creerQuestion(pioche.pop());
          const cle = `${q.consigne}|${q.enonce}|${q.reponse}`;
          if (dejaPosees.has(cle) && essais++ < 60) continue;
          dejaPosees.add(cle);
          questions.push(q);
        }
        return questions;
      },
    });
  }

  // ======================================================================
  // Les figures (des petits dessins en SVG)
  // ======================================================================
  // Les points sont des tableaux [x, y], en pixels ; y va vers le BAS (comme sur l'écran).
  // Les couleurs sont dans css/style.css : fig-trait (trait normal), fig-fin (trait léger),
  // fig-accent (en orange), fig-plein (l'intérieur coloré), fig-texte, fig-petit, fig-texte-accent.
  const r1 = x => Math.round(x * 10) / 10;
  const pts = liste => liste.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');

  const figures = {
    // Le dessin entier : largeur × hauteur en pixels (il rétrécit tout seul sur un petit écran)
    svg(largeur, hauteur, contenu, description = 'Figure') {
      return `<svg class="figure-maths" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}"`
        + ` role="img" aria-label="${description}">${contenu}</svg>`;
    },
    segment: (A, B, classe = 'fig-trait') =>
      `<line x1="${r1(A[0])}" y1="${r1(A[1])}" x2="${r1(B[0])}" y2="${r1(B[1])}" class="${classe}"/>`,
    ligne: (points, classe = 'fig-trait') => `<polyline points="${pts(points)}" class="${classe}"/>`,
    polygone: (points, classe = 'fig-trait fig-plein') => `<polygon points="${pts(points)}" class="${classe}"/>`,
    cercle: (centre, rayon, classe = 'fig-trait') =>
      `<circle cx="${r1(centre[0])}" cy="${r1(centre[1])}" r="${r1(rayon)}" class="${classe}"/>`,
    // Un texte ; ancre : 'start', 'middle' ou 'end'
    texte: (P, contenu, { classe = 'fig-texte', ancre = 'middle' } = {}) =>
      `<text x="${r1(P[0])}" y="${r1(P[1])}" text-anchor="${ancre}" dominant-baseline="central" class="${classe}">${contenu}</text>`,

    // Un point : une petite croix, et son nom écrit à côté (décalé de dx, dy)
    point(P, nom = '', { dx = 0, dy = -16, classe = 'fig-texte' } = {}) {
      const [x, y] = P;
      const t = 5;
      return figures.segment([x - t, y - t], [x + t, y + t], 'fig-croix') + figures.segment([x - t, y + t], [x + t, y - t], 'fig-croix')
        + (nom ? figures.texte([x + dx, y + dy], nom, { classe }) : '');
    },
    // Le petit carré de l'angle droit, au sommet S, entre les directions de A et de B
    angleDroit(S, A, B, taille = 14) {
      const u = unitaire(S, A);
      const v = unitaire(S, B);
      const p1 = [S[0] + u[0] * taille, S[1] + u[1] * taille];
      const p3 = [S[0] + v[0] * taille, S[1] + v[1] * taille];
      const p2 = [p1[0] + v[0] * taille, p1[1] + v[1] * taille];
      return `<polyline points="${pts([p1, p2, p3])}" class="fig-marque"/>`;
    },
    // Un arc pour marquer l'angle ASB (le plus petit des deux), avec un texte facultatif (« 40° », « ? »)
    arc(S, A, B, { rayon = 28, texte = '', classe = 'fig-accent', distanceTexte = 22 } = {}) {
      const a1 = Math.atan2(A[1] - S[1], A[0] - S[0]);
      const a2 = Math.atan2(B[1] - S[1], B[0] - S[0]);
      let ecart = a2 - a1;
      while (ecart <= -Math.PI) ecart += 2 * Math.PI;
      while (ecart > Math.PI) ecart -= 2 * Math.PI;
      const debut = [S[0] + rayon * Math.cos(a1), S[1] + rayon * Math.sin(a1)];
      const fin = [S[0] + rayon * Math.cos(a1 + ecart), S[1] + rayon * Math.sin(a1 + ecart)];
      const milieu = a1 + ecart / 2;
      const P = [S[0] + (rayon + distanceTexte) * Math.cos(milieu), S[1] + (rayon + distanceTexte) * Math.sin(milieu)];
      return `<path d="M ${r1(debut[0])} ${r1(debut[1])} A ${rayon} ${rayon} 0 0 ${ecart > 0 ? 1 : 0} ${r1(fin[0])} ${r1(fin[1])}" class="${classe}"/>`
        + (texte ? figures.texte(P, texte, { classe: 'fig-texte fig-texte-accent' }) : '');
    },
    // Des petits traits sur un segment, pour coder des longueurs égales (1, 2 ou 3 traits)
    codage(A, B, nombreDeTraits = 1) {
      const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      const u = unitaire(A, B);
      const n = [-u[1], u[0]];
      let html = '';
      for (let i = 0; i < nombreDeTraits; i++) {
        const decalage = (i - (nombreDeTraits - 1) / 2) * 6;
        const c = [m[0] + u[0] * decalage, m[1] + u[1] * decalage];
        html += figures.segment([c[0] - n[0] * 8, c[1] - n[1] * 8], [c[0] + n[0] * 8, c[1] + n[1] * 8], 'fig-marque');
      }
      return html;
    },
    // Écrire une longueur à côté d'un segment, au milieu (du côté « cote » : 1 ou −1).
    // Le texte s'écarte du trait : il commence juste à droite d'un trait vertical, finit juste à sa gauche, etc.
    longueur(A, B, texte, { cote = 1, distance = 10 } = {}) {
      const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      const u = unitaire(A, B);
      const n = [-u[1] * cote, u[0] * cote];
      const P = [m[0] + n[0] * distance, m[1] + n[1] * distance];
      const ancre = n[0] > 0.35 ? 'start' : (n[0] < -0.35 ? 'end' : 'middle');
      if (n[1] > 0.35) P[1] += 7;
      if (n[1] < -0.35) P[1] -= 7;
      return figures.texte(P, texte, { classe: 'fig-texte fig-petit-gras', ancre });
    },

    // Une droite graduée : de debut à fin, une graduation tous les « pas ».
    // etiquettes : les valeurs écrites sous la droite (par défaut : le début et la fin)
    // points : [{ valeur, nom }] marqués d'une flèche orange au-dessus
    droiteGraduee({ debut, fin, pas, largeur = 460, etiquettes = [debut, fin], points = [], sousGraduations = 0 }) {
      const marge = 30;
      const y = 50;
      const x = v => marge + (v - debut) / (fin - debut) * (largeur - 2 * marge);
      let html = figures.segment([marge - 12, y], [largeur - marge + 16, y]);
      html += `<polyline points="${pts([[largeur - marge + 8, y - 6], [largeur - marge + 16, y], [largeur - marge + 8, y + 6]])}" class="fig-trait"/>`;
      const nombreDePas = Math.round((fin - debut) / pas);
      for (let i = 0; i <= nombreDePas; i++) {
        const v = net(debut + i * pas);
        html += figures.segment([x(v), y - 11], [x(v), y + 11]);
        for (let j = 1; i < nombreDePas && j < sousGraduations; j++) {
          const w = v + j * pas / sousGraduations;
          html += figures.segment([x(w), y - 6], [x(w), y + 6], 'fig-marque');
        }
      }
      etiquettes.forEach(v => { html += figures.texte([x(v), y + 26], ecrire(v)); });
      points.forEach(({ valeur, nom }) => {
        html += `<polyline points="${pts([[x(valeur) - 7, y - 24], [x(valeur), y - 12], [x(valeur) + 7, y - 24]])}" class="fig-accent"/>`
          + figures.segment([x(valeur), y - 34], [x(valeur), y - 13], 'fig-accent')
          + figures.texte([x(valeur), y - 46], nom, { classe: 'fig-texte fig-texte-accent' });
      });
      return figures.svg(largeur, 90, html, 'Une droite graduée');
    },

    // Un repère : de xmin à xmax et de ymin à ymax (en unités), « unite » pixels par unité
    // (uniteY : pour l'axe vertical, s'il n'a pas la même unité : 8 kg en largeur, 24 € en hauteur).
    // points : [{ x, y, nom }] ; traces : [{ f: x => …, de, a }] (une fonction) ou [{ segment: [[x1, y1], [x2, y2]] }]
    // pasEtiquettes : on écrit un nombre toutes les combien de graduations
    repere({
      xmin, xmax, ymin, ymax, unite = 40, uniteY = unite, points = [], traces = [], pasEtiquettes = 1, nomAxes = ['', ''],
      pasX = 1, pasY = 1,
    }) {
      const marge = 26;
      const largeur = (xmax - xmin) * unite + 2 * marge;
      const hauteur = (ymax - ymin) * uniteY + 2 * marge;
      const X = v => marge + (v - xmin) * unite;
      const Y = v => marge + (ymax - v) * uniteY;
      let html = '';
      for (let v = xmin; v <= xmax + 1e-9; v += pasX) html += figures.segment([X(v), Y(ymin)], [X(v), Y(ymax)], 'fig-grille');
      for (let v = ymin; v <= ymax + 1e-9; v += pasY) html += figures.segment([X(xmin), Y(v)], [X(xmax), Y(v)], 'fig-grille');
      if (ymin <= 0 && ymax >= 0) html += figures.segment([X(xmin), Y(0)], [X(xmax) + 10, Y(0)], 'fig-axe');
      if (xmin <= 0 && xmax >= 0) html += figures.segment([X(0), Y(ymin)], [X(0), Y(ymax) - 10], 'fig-axe');
      let compteur = 0;
      for (let v = xmin; v <= xmax + 1e-9; v += pasX) {
        if (Math.abs(v) > 1e-9 && compteur++ % pasEtiquettes === 0) html += figures.texte([X(v), Y(0) + 14], ecrire(net(v)), { classe: 'fig-petit' });
      }
      compteur = 0;
      for (let v = ymin; v <= ymax + 1e-9; v += pasY) {
        if (Math.abs(v) > 1e-9 && compteur++ % pasEtiquettes === 0) html += figures.texte([X(0) - 8, Y(v)], ecrire(net(v)), { classe: 'fig-petit', ancre: 'end' });
      }
      // (le « 0 » de l'origine, un peu décalé pour ne pas se coller au « −1 » de l'axe horizontal)
      if (xmin <= 0 && ymin <= 0) html += figures.texte([X(0) - 5, Y(0) + 16], '0', { classe: 'fig-petit', ancre: 'end' });
      if (nomAxes[0]) html += figures.texte([X(xmax) + 6, Y(0) - 12], nomAxes[0], { classe: 'fig-petit', ancre: 'end' });
      if (nomAxes[1]) html += figures.texte([X(0) + 8, Y(ymax) - 4], nomAxes[1], { classe: 'fig-petit', ancre: 'start' });
      traces.forEach(t => {
        if (t.segment) {
          html += figures.segment([X(t.segment[0][0]), Y(t.segment[0][1])], [X(t.segment[1][0]), Y(t.segment[1][1])], t.classe || 'fig-courbe');
          return;
        }
        const de = t.de ?? xmin;
        const a = t.a ?? xmax;
        const liste = [];
        for (let i = 0; i <= 80; i++) {
          const x = de + (a - de) * i / 80;
          const y = t.f(x);
          if (y >= ymin - 0.5 && y <= ymax + 0.5) liste.push([X(x), Y(y)]);
        }
        html += figures.ligne(liste, t.classe || 'fig-courbe');
      });
      points.forEach(p => {
        html += figures.point([X(p.x), Y(p.y)], p.nom, { dx: p.dx ?? 12, dy: p.dy ?? -14 });
      });
      return figures.svg(largeur, hauteur, html, 'Un repère');
    },

    // Un diagramme en barres : donnees = [['lundi', 12], ['mardi', 8], …] ; pas = l'écart entre deux lignes
    barres({ donnees, max, pas, largeurBarre = 46, hauteur = 220, unite = '' }) {
      const marge = { gauche: 44, bas: 34, haut: unite ? 30 : 14 };
      const ecart = largeurBarre * 0.6;
      const largeur = marge.gauche + donnees.length * (largeurBarre + ecart) + ecart;
      const H = hauteur - marge.bas - marge.haut;
      const Y = v => marge.haut + H - v / max * H;
      let html = '';
      for (let v = 0; v <= max + 1e-9; v += pas) {
        html += figures.segment([marge.gauche, Y(v)], [largeur - 6, Y(v)], 'fig-grille');
        html += figures.texte([marge.gauche - 8, Y(v)], ecrire(net(v)), { classe: 'fig-petit', ancre: 'end' });
      }
      donnees.forEach(([nom, valeur], i) => {
        const x = marge.gauche + ecart + i * (largeurBarre + ecart);
        html += `<rect x="${r1(x)}" y="${r1(Y(valeur))}" width="${largeurBarre}" height="${r1(Y(0) - Y(valeur))}" rx="4" class="fig-barre"/>`;
        html += figures.texte([x + largeurBarre / 2, Y(0) + 16], nom, { classe: 'fig-petit' });
      });
      html += figures.segment([marge.gauche, Y(0)], [largeur - 6, Y(0)], 'fig-axe');
      // L'unité (ou le titre de l'axe) : en haut à gauche, au-dessus des graduations
      if (unite) html += figures.texte([6, 10], unite, { classe: 'fig-petit', ancre: 'start' });
      return figures.svg(largeur, hauteur, html, 'Un diagramme en barres');
    },

    // Un quadrillage de colonnes × lignes carreaux de « cote » pixels ; coin(c, l) donne le coin (c, l) en pixels
    // classe : 'fig-grille' (très léger) ou 'fig-fin' (plus visible, par-dessus une figure coloriée)
    quadrillage(colonnes, lignes, cote = 28, classe = 'fig-grille') {
      let html = '';
      for (let c = 0; c <= colonnes; c++) html += figures.segment([c * cote + 10, 10], [c * cote + 10, lignes * cote + 10], classe);
      for (let l = 0; l <= lignes; l++) html += figures.segment([10, l * cote + 10], [colonnes * cote + 10, l * cote + 10], classe);
      return {
        html,
        largeur: colonnes * cote + 20,
        hauteur: lignes * cote + 20,
        coin: (c, l) => [c * cote + 10, l * cote + 10],
      };
    },
  };

  function unitaire(A, B) {
    const dx = B[0] - A[0];
    const dy = B[1] - A[1];
    const n = Math.hypot(dx, dy) || 1;
    return [dx / n, dy / n];
  }

  RM.maths = {
    // le hasard
    entier, parmi, entierSauf, decimal,
    // les nombres
    MOINS, ESPACE, net, arrondir, ecrire, mesure, euros, francs, PRENOMS, LIEUX, decimalesDe, relatif, parentheses, lireNombre, egaux,
    // les fractions et les puissances
    pgcd, ppcm, simplifier, frac, fracTexte, avecFractions, lireFraction, puissance, puissanceTexte,
    // les angles et les tableaux
    angle, angleTexte, tableau,
    // les questions et les étapes
    choix, nombre, fraction, vraiFaux, ajouterEtape,
    // les figures
    figures,
  };
})();
