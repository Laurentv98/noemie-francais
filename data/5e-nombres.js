// Renard Malin — Maths, niveau 5e : les 6 étapes de la Grotte des Nombres
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. les priorités de calcul · 2. les nombres relatifs · 3. additionner des relatifs ·
// 4. fractions égales · 5. additionner des fractions · 6. le calcul littéral

(function () {
  const {
    entier, parmi, entierSauf, decimal, ecrire, net, euros, mesure, lireNombre, egaux, relatif,
    frac, fracTexte, simplifier, pgcd, choix, nombre, fraction, vraiFaux, ajouterEtape, figures,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes, avec leur pronom
  const ENFANTS = [['Léa', 'elle'], ['Tom', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Inès', 'elle'], ['Sami', 'il'], ['Lina', 'elle'], ['Noé', 'il']];
  // Deux enfants différents : { nom, il, Il }
  const deuxEnfants = () => RM.melanger(ENFANTS).slice(0, 2)
    .map(([nom, il]) => ({ nom, il, Il: il === 'il' ? 'Il' : 'Elle' }));
  const unEnfant = () => deuxEnfants()[0];

  // Les pièges vraiment faux : ni égaux à la réponse (ni à un piège déjà choisi), ni égaux entre eux.
  // negatifs : true pour garder les nombres négatifs (les relatifs) ; sinon, on les enlève (et le zéro aussi)
  const valeurDe = p => (typeof p === 'number' ? net(p) : lireNombre(p));
  function vraisPieges(reponse, pieges, deja = [], negatifs = false) {
    const vues = [valeurDe(reponse), ...deja.map(valeurDe)];
    return pieges.filter(p => {
      const v = valeurDe(p);
      if (p === null || !Number.isFinite(v) || (!negatifs && v <= 0) || vues.some(w => egaux(v, w))) return false;
      vues.push(v);
      return true;
    });
  }

  // Les pièges d'une question à boutons, pour choix({ ...avecErreur(…) }) :
  // - garder : l'erreur classique dont parle l'explication (la première valable de « classiques »), toujours proposée ;
  // - pieges : d'autres erreurs crédibles, des deux côtés de la réponse (le moteur les choisit autour de l'erreur gardée,
  //   pour que la bonne réponse change de place) ; « secours » ne sert que s'il n'y a pas assez d'erreurs valables.
  function avecErreur(reponse, classiques, autres, secours = [], negatifs = false) {
    const garder = vraisPieges(reponse, classiques.map(p => (typeof p === 'number' ? net(p) : p)), [], negatifs).slice(0, 1);
    let pieges = vraisPieges(reponse, autres.map(p => (typeof p === 'number' ? net(p) : p)), garder, negatifs);
    if (garder.length + pieges.length < 3) pieges = [...pieges, ...vraisPieges(reponse, secours.map(net), [...garder, ...pieges], negatifs)];
    return { garder, pieges };
  }

  // Les pièges fractions [numérateur, dénominateur] : des fractions de valeurs toutes différentes → « 3/4 »
  // egalesPermises : des fractions égales à la réponse mais qui restent fausses (pas simplifiées au maximum)
  function piegesFractions(n, d, pieges, egalesPermises = []) {
    const vues = [n / d];
    const textes = new Set([fracTexte(n, d)]);
    const garder = [];
    egalesPermises.forEach(([a, b]) => {
      if (a > 0 && b > 1 && !textes.has(fracTexte(a, b))) { textes.add(fracTexte(a, b)); garder.push(fracTexte(a, b)); }
    });
    pieges.forEach(([a, b]) => {
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 2) return;
      if (vues.some(v => Math.abs(v - a / b) < 1e-9) || textes.has(fracTexte(a, b))) return;
      vues.push(a / b);
      textes.add(fracTexte(a, b));
      garder.push(fracTexte(a, b));
    });
    return garder;
  }

  // Un seul ou plusieurs : unOuPlus(1, 'étage') → « 1 étage » ; unOuPlus(3, 'étage') → « 3 étages »
  const unOuPlus = (k, mot) => `${ecrire(k)} ${mot}${Math.abs(k) > 1 ? 's' : ''}`;

  // Les signes : < et > s'écrivent &lt; et &gt; dans les textes HTML
  const HTML = { '<': '&lt;', '>': '&gt;', '=': '=' };
  const signe = (a, b) => (egaux(a, b) ? '=' : a < b ? '<' : '>');

  // ======================================================================
  // 1. Les priorités de calcul
  // ======================================================================
  const NOM_OPERATION = { '+': 'une addition', '−': 'une soustraction', '×': 'une multiplication', '÷': 'une division' };

  // Un calcul : son écriture, sa valeur, les étapes du calcul (pour l'explication), la règle,
  // le résultat de l'erreur classique (faux : calculer de gauche à droite, ou oublier les parenthèses ; null s'il n'y en a pas),
  // et d'autres erreurs crédibles pour les boutons (autres) : un autre ordre de calcul, un nombre oublié,
  // une erreur de table (b × c pris pour b × (c + 1)…), qui tombent des deux côtés de la réponse
  const PRIORITAIRES = [
    () => {
      const [a, b, c] = [entier(2, 20), entier(2, 9), entier(2, 9)];
      const v = a + b * c;
      return { texte: `${a} + ${b} × ${c}`, valeur: v, etapes: [`${b} × ${c} = ${b * c}`, `${a} + ${b * c} = ${v}`],
        regle: 'la multiplication passe avant l’addition', faux: (a + b) * c, erreur: `(${a} + ${b}) × ${c}`,
        autres: [a + b + c, a * b + c, v - b, v + b] };
    },
    () => {
      const [b, c] = [entier(2, 9), entier(2, 9)];
      const a = b * c + entier(2, 20);
      const v = a - b * c;
      return { texte: `${a} − ${b} × ${c}`, valeur: v, etapes: [`${b} × ${c} = ${b * c}`, `${a} − ${b * c} = ${v}`],
        regle: 'la multiplication passe avant la soustraction', faux: (a - b) * c, erreur: `(${a} − ${b}) × ${c}`,
        autres: [a - b - c, v - b, v + b, v - c, v + c] };
    },
    () => {
      const [a, b, c, d] = [entier(2, 9), entier(2, 9), entier(2, 9), entier(2, 9)];
      const v = a * b + c * d;
      return { texte: `${a} × ${b} + ${c} × ${d}`, valeur: v,
        etapes: [`${a} × ${b} = ${a * b}`, `${c} × ${d} = ${c * d}`, `${a * b} + ${c * d} = ${v}`],
        regle: 'les multiplications passent avant l’addition', faux: (a * b + c) * d, erreur: `(${a * b} + ${c}) × ${d}`,
        autres: [a * b + c + d, a + b + c * d, v - a, v + a, v - c, v + c] };
    },
    () => {
      const [c, q] = [entier(2, 9), entier(2, 9)];
      const [a, b] = [entier(2, 30), c * q];
      const v = a + q;
      return { texte: `${a} + ${b} ÷ ${c}`, valeur: v, etapes: [`${b} ÷ ${c} = ${q}`, `${a} + ${q} = ${v}`],
        regle: 'la division passe avant l’addition', faux: (a + b) % c === 0 ? (a + b) / c : null, erreur: `(${a} + ${b}) ÷ ${c}`,
        autres: [a + b, a + b - c, q, v - 1, v + 1] };
    },
    () => {
      const [c, q] = [entier(2, 9), entier(2, 9)];
      const b = c * q;
      const a = b + c * entier(1, 4) + (Math.random() < 0.5 ? 0 : entier(1, c - 1));
      const v = a - q;
      return { texte: `${a} − ${b} ÷ ${c}`, valeur: v, etapes: [`${b} ÷ ${c} = ${q}`, `${a} − ${q} = ${v}`],
        regle: 'la division passe avant la soustraction', faux: (a - b) % c === 0 ? (a - b) / c : null, erreur: `(${a} − ${b}) ÷ ${c}`,
        autres: [a - b, a - b + c, a + q, v - 1, v + 1] };
    },
    () => {
      let a, b, c, d;
      do { [a, b, c, d] = [entier(3, 9), entier(3, 9), entier(2, 6), entier(2, 6)]; } while (a * b <= c * d + 1);
      const v = a * b - c * d;
      return { texte: `${a} × ${b} − ${c} × ${d}`, valeur: v,
        etapes: [`${a} × ${b} = ${a * b}`, `${c} × ${d} = ${c * d}`, `${a * b} − ${c * d} = ${v}`],
        regle: 'les multiplications passent avant la soustraction', faux: (a * b - c) * d, erreur: `(${a * b} − ${c}) × ${d}`,
        autres: [a * b - c - d, v - a, v + a, v - c, v + c] };
    },
    () => {
      const [b, c] = [entier(2, 12), entier(2, 12)];
      const a = b + c + entier(1, 25);
      const v = a - b + c;
      return { texte: `${a} − ${b} + ${c}`, valeur: v, etapes: [`${a} − ${b} = ${a - b}`, `${a - b} + ${c} = ${v}`],
        regle: 'il n’y a que des + et des − : on calcule <b>de gauche à droite</b>', faux: a - b - c, erreur: `${a} − (${b} + ${c})`,
        autres: [a + b + c, a + b - c, a - b] };
    },
    () => {
      // (b et c différents : 48 ÷ 4 × 4 redonnerait 48, qu'on trouverait sans calculer)
      let b, c;
      do { [b, c] = [entier(2, 6), entier(2, 4)]; } while (b === c);
      const m = entier(1, 4);
      const a = b * c * m;
      const v = c * m * c;
      return { texte: `${a} ÷ ${b} × ${c}`, valeur: v, etapes: [`${a} ÷ ${b} = ${c * m}`, `${c * m} × ${c} = ${v}`],
        regle: 'il n’y a que des × et des ÷ : on calcule <b>de gauche à droite</b>', faux: m, erreur: `${a} ÷ (${b} × ${c})`,
        autres: [c * m, a * c, v - c, v + c] };
    },
  ];

  const AVEC_PARENTHESES = [
    () => {
      const [a, b, c] = [entier(2, 15), entier(2, 15), entier(2, 9)];
      const v = (a + b) * c;
      return { texte: `(${a} + ${b}) × ${c}`, valeur: v, etapes: [`${a} + ${b} = ${a + b}`, `${a + b} × ${c} = ${v}`],
        regle: 'on calcule d’abord entre parenthèses', faux: a + b * c, erreur: `${a} + ${b} × ${c}`,
        autres: [a * c + b, a + b + c, v - c, v + c] };
    },
    () => {
      const [a, c] = [entier(2, 9), entier(2, 9)];
      const b = c + entier(2, 9);
      const v = a * (b - c);
      return { texte: `${a} × (${b} − ${c})`, valeur: v, etapes: [`${b} − ${c} = ${b - c}`, `${a} × ${b - c} = ${v}`],
        regle: 'on calcule d’abord entre parenthèses', faux: a * b - c, erreur: `${a} × ${b} − ${c}`,
        autres: [a * b, a * (b + c), v - a, v + a] };
    },
    () => {
      const [c, q, b] = [entier(2, 9), entier(2, 9), entier(2, 20)];
      const a = b + c * q;
      return { texte: `(${a} − ${b}) ÷ ${c}`, valeur: q, etapes: [`${a} − ${b} = ${a - b}`, `${a - b} ÷ ${c} = ${q}`],
        regle: 'on calcule d’abord entre parenthèses', faux: b % c === 0 && a - b / c > 0 ? a - b / c : null, erreur: `${a} − ${b} ÷ ${c}`,
        autres: [a - b, (a + b) % c === 0 ? (a + b) / c : null, q - 1, q + 1] };
    },
    () => {
      const [b, c] = [entier(2, 15), entier(2, 15)];
      const a = b + c + entier(2, 30);
      const v = a - b - c;
      return { texte: `${a} − (${b} + ${c})`, valeur: v, etapes: [`${b} + ${c} = ${b + c}`, `${a} − ${b + c} = ${v}`],
        regle: 'on calcule d’abord entre parenthèses', faux: a - b + c, erreur: `${a} − ${b} + ${c}`,
        autres: [a + b + c, a - b, b + c, v - 1] };
    },
    () => {
      const [a, b, c] = [entier(2, 6), entier(2, 9), entier(2, 9)];
      const d = entier(2, a * b + c - 1);
      const v = a * (b + c) - d;
      return { texte: `${a} × (${b} + ${c}) − ${d}`, valeur: v,
        etapes: [`${b} + ${c} = ${b + c}`, `${a} × ${b + c} = ${a * (b + c)}`, `${a * (b + c)} − ${d} = ${v}`],
        regle: 'on calcule d’abord entre parenthèses, puis la multiplication', faux: a * b + c - d, erreur: `${a} × ${b} + ${c} − ${d}`,
        autres: [a * (b + c), a * (b + c - d), v - a, v + a] };
    },
    // Des parenthèses dans des parenthèses : on commence par les plus intérieures
    () => {
      const [k, b, c] = [entier(2, 5), entier(2, 9), entier(2, 9)];
      const a = b + c + entier(1, 10);
      const [s, t] = [b + c, a - b - c];
      return { texte: `${k} × (${a} − (${b} + ${c}))`, valeur: k * t,
        etapes: [`${b} + ${c} = ${s}`, `${a} − ${s} = ${t}`, `${k} × ${t} = ${k * t}`],
        regle: 'on commence par les parenthèses les plus intérieures', faux: k * (a - b + c), erreur: `${k} × (${a} − ${b} + ${c})`,
        autres: [t, k * a - b - c, k * t - k, k * t + k] };
    },
    () => {
      const [k, c] = [entier(2, 5), entier(2, 9)];
      const b = c + entier(2, 9);
      const a = b + entier(2, 12);
      const [s, t] = [b - c, a - b + c];
      return { texte: `(${a} − (${b} − ${c})) × ${k}`, valeur: t * k,
        etapes: [`${b} − ${c} = ${s}`, `${a} − ${s} = ${t}`, `${t} × ${k} = ${t * k}`],
        regle: 'on commence par les parenthèses les plus intérieures', faux: (a - b - c) * k > 0 ? (a - b - c) * k : null,
        erreur: `(${a} − ${b} − ${c}) × ${k}`, autres: [t, (a - b) * k + c, t * k - k, t * k + k] };
    },
  ];

  // Roxy détaille le calcul, étape par étape, et dit pourquoi l'erreur classique est fausse
  function expliquerCalcul(c, montrerErreur = true) {
    const debut = c.etapes.length === 3
      ? `On calcule d’abord ${c.etapes[0]}, puis ${c.etapes[1]}, enfin <b>${c.etapes[2]}</b>.`
      : `On calcule d’abord ${c.etapes[0]}, puis <b>${c.etapes[1]}</b>.`;
    const regle = `<br>Ici, ${c.regle}.`;
    const erreur = montrerErreur && c.faux !== null ? `<br>⚠️ Pas ${ecrire(c.faux)} : ce serait ${c.erreur}.` : '';
    return debut + regle + erreur;
  }

  // Par quel calcul commence-t-on ? Une expression de 3 opérations, les 3 calculs « voisins » et le bon
  function expressionAOrdonner() {
    let n;
    do { n = [entier(2, 20), entier(2, 9), entier(2, 9), entier(2, 9)]; } while (new Set(n).size < 4);
    const [a, b, c, d] = n;
    return parmi([
      () => ({ texte: `${a + 10} + ${b} × ${c} − ${d}`, calculs: [`${a + 10} + ${b}`, `${b} × ${c}`, `${c} − ${d}`], bon: 1,
        raison: 'la multiplication passe avant l’addition et la soustraction' }),
      () => ({ texte: `${a + 10} − ${b} + ${c} × ${d}`, calculs: [`${a + 10} − ${b}`, `${b} + ${c}`, `${c} × ${d}`], bon: 2,
        raison: 'la multiplication passe avant l’addition et la soustraction' }),
      () => ({ texte: `${a + 20} − ${b} + ${c} − ${d}`, calculs: [`${a + 20} − ${b}`, `${b} + ${c}`, `${c} − ${d}`], bon: 0,
        raison: 'il n’y a que des + et des − : on calcule <b>de gauche à droite</b>' }),
      () => ({ texte: `${b * c * 2} ÷ ${b} × ${c} + ${d}`, calculs: [`${b * c * 2} ÷ ${b}`, `${b} × ${c}`, `${c} + ${d}`], bon: 0,
        raison: '× et ÷ passent avant + ; entre × et ÷, on calcule <b>de gauche à droite</b>' }),
      () => ({ texte: `(${a} + ${b}) × ${c} − ${d}`, calculs: [`${a} + ${b}`, `${b} × ${c}`, `${c} − ${d}`], bon: 0,
        raison: 'on calcule d’abord entre parenthèses' }),
      () => ({ texte: `${a} × (${b + c} − ${c}) + ${d}`, calculs: [`${a} × ${b + c}`, `${b + c} − ${c}`, `${c} + ${d}`], bon: 1,
        raison: 'on calcule d’abord entre parenthèses' }),
      () => ({ texte: `${a} + ${b} × (${c} + ${d})`, calculs: [`${a} + ${b}`, `${b} × ${c}`, `${c} + ${d}`], bon: 2,
        raison: 'on calcule d’abord entre parenthèses' }),
    ])();
  }

  // Traduire une phrase par un calcul : 4 façons de ranger les mêmes nombres avec les mêmes opérations
  const ADDITIFS = { '+': { nom: 'somme', signe: '+' }, '−': { nom: 'différence', signe: '−' } };
  const MULTIPLICATIFS = { '×': { nom: 'produit', signe: '×', verbe: 'multiplie' }, '÷': { nom: 'quotient', signe: '÷', verbe: 'divise' } };
  function phraseATraduire() {
    const [s, m] = parmi([['+', '×'], ['+', '×'], ['−', '×'], ['+', '÷']]);
    const A = ADDITIFS[s];
    const M = MULTIPLICATIFS[m];
    let a, b, c;
    do {
      // Avec une différence, tous les calculs restent positifs : a plus grand que b × c
      [a, b, c] = s === '−' ? [entier(13, 20), entier(3, 4), entier(2, 3)] : [entier(5, 20), entier(2, 9), entier(2, 9)];
    } while (new Set([a, b, c]).size < 3 || (s === '−' && b <= c));
    const formes = [
      { calcul: `${a} ${A.signe} ${b} ${M.signe} ${c}`, phrase: `la ${A.nom} de ${a} et du ${M.nom} de ${b} par ${c}`,
        explication: `C’est une <b>${A.nom}</b> : son premier terme est ${a}, son second terme est le ${M.nom} ${b} ${M.signe} ${c}. `
          + `Pas besoin de parenthèses : ${M.signe} passe avant ${A.signe}.` },
      { calcul: `(${a} ${A.signe} ${b}) ${M.signe} ${c}`, phrase: `le ${M.nom} de la ${A.nom} de ${a} et ${b} par ${c}`,
        explication: `C’est un <b>${M.nom}</b> : on ${M.verbe} la ${A.nom} ${a} ${A.signe} ${b} par ${c}. `
          + 'Il faut des parenthèses pour calculer la ' + `${A.nom} d’abord.` },
      { calcul: `${a} ${M.signe} ${b} ${A.signe} ${c}`, phrase: `la ${A.nom} du ${M.nom} de ${a} par ${b} et de ${c}`,
        explication: `C’est une <b>${A.nom}</b> : son premier terme est le ${M.nom} ${a} ${M.signe} ${b}, son second terme est ${c}.` },
      { calcul: `${a} ${M.signe} (${b} ${A.signe} ${c})`, phrase: `le ${M.nom} de ${a} par la ${A.nom} de ${b} et ${c}`,
        explication: `C’est un <b>${M.nom}</b> : on ${M.verbe} ${a} par la ${A.nom} ${b} ${A.signe} ${c}, `
          + 'écrite entre parenthèses pour la calculer d’abord.' },
    ];
    const bonne = parmi(formes);
    return { bonne, autres: formes.filter(f => f !== bonne).map(f => f.calcul) };
  }

  // La nature d'une expression : le nom de la dernière opération qu'on effectue
  const NATURES = ['somme', 'différence', 'produit', 'quotient'];
  const ARTICLE = { somme: 'une', différence: 'une', produit: 'un', quotient: 'un' };
  function expressionANommer() {
    const nature = parmi(NATURES);
    const [a, b, c] = [entier(2, 9), entier(2, 9), entier(2, 9)];
    const grand = b * c + entier(3, 20);
    const modeles = {
      somme: [[`${a + 10} + ${b} × ${c}`, `${b} × ${c}`, '+'], [`${a} × ${b} + ${c}`, `${a} × ${b}`, '+'],
        [`${b * c} ÷ ${b} + ${a}`, `${b * c} ÷ ${b}`, '+']],
      différence: [[`${grand} − ${b} × ${c}`, `${b} × ${c}`, '−'], [`${a} × ${b} − ${c}`, `${a} × ${b}`, '−'],
        [`${grand} − (${b} + ${c})`, `${b} + ${c}`, '−']],
      produit: [[`(${a} + ${b}) × ${c}`, `${a} + ${b}`, '×'], [`${a} × (${b + c} − ${c})`, `${b + c} − ${c}`, '×'],
        [`(${a + b} − ${b}) × ${c}`, `${a + b} − ${b}`, '×']],
      quotient: [[`(${b * c} + ${c * a}) ÷ ${c}`, `${b * c} + ${c * a}`, '÷'], [`${b * c * 2} ÷ (${c + 2} − 2)`, `${c + 2} − 2`, '÷'],
        [`(${b * c + a} − ${a}) ÷ ${b}`, `${b * c + a} − ${a}`, '÷']],
    };
    const [texte, premier, derniere] = parmi(modeles[nature]);
    return { nature, texte, premier, derniere };
  }

  // Des problèmes : le bon calcul, et les calculs faux (mêmes nombres, parenthèses ou priorités mal placées)
  function problemeDeCalcul() {
    const p = unEnfant();
    return parmi([
      () => {
        // (n et b différents : avec 6 cahiers et une trousse à 6 €, « 6 + 4 × 6 » serait juste aussi)
        const [n, a] = [entier(3, 6), entier(2, 4)];
        const b = entierSauf(5, 9, [n]);
        return { enonce: `${p.nom} achète ${n} cahiers à ${euros(a)} l’un et une trousse à ${euros(b)}. Combien paie-t-${p.il} en tout ?`,
          bon: `${n} × ${a} + ${b}`, valeur: n * a + b, unite: '€',
          faux: [`${n} × (${a} + ${b})`, `${n} + ${a} × ${b}`, `(${n} + ${a}) × ${b}`],
          detail: `${n} cahiers coûtent ${n} × ${a} = ${euros(n * a)}, plus la trousse : ${n * a} + ${b} = ${euros(n * a + b)}` };
      },
      () => {
        const [n, a] = [entier(3, 5), entier(2, 3)];
        const c = parmi([10, 20]) + (n * a >= 10 ? 10 : 0);
        return { enonce: `${p.nom} a ${euros(c)}. ${p.Il} achète ${n} stylos à ${euros(a)} l’un. Combien lui reste-t-il ?`,
          bon: `${c} − ${n} × ${a}`, valeur: c - n * a, unite: '€',
          faux: [`(${c} − ${n}) × ${a}`, `${c} − ${n} + ${a}`, `${n} × ${a} − ${c}`],
          detail: `les stylos coûtent ${n} × ${a} = ${euros(n * a)}, et ${c} − ${n * a} = ${euros(c - n * a)}` };
      },
      () => {
        const [n, a, b] = [entier(3, 5), parmi([6, 8, 10, 12]), entier(2, 5)];
        return { enonce: `Un paquet contient ${a} biscuits. ${p.nom} achète ${n} paquets, puis mange ${b} biscuits. `
          + 'Combien de biscuits lui reste-t-il ?',
          bon: `${n} × ${a} − ${b}`, valeur: n * a - b, unite: 'biscuits',
          faux: [`${n} × (${a} − ${b})`, `${n} × ${a} + ${b}`, `${n} + ${a} − ${b}`],
          detail: `${n} paquets contiennent ${n} × ${a} = ${n * a} biscuits, et ${n * a} − ${b} = ${n * a - b}` };
      },
      () => {
        const [n, a, m, b] = [entier(8, 15), entier(3, 6), entier(2, 4), entier(7, 12)];
        return { enonce: `Pour une sortie au zoo, ${n} enfants paient ${euros(a)} chacun et ${m} adultes paient ${euros(b)} chacun. `
          + 'Quel est le prix total ?',
          bon: `${n} × ${a} + ${m} × ${b}`, valeur: n * a + m * b, unite: '€',
          faux: [`(${n} + ${m}) × (${a} + ${b})`, `${n} × ${a} + ${b}`, `(${n} × ${a} + ${m}) × ${b}`],

          detail: `enfants : ${n} × ${a} = ${euros(n * a)} ; adultes : ${m} × ${b} = ${euros(m * b)} ; en tout ${euros(n * a + m * b)}` };
      },
    ])();
  }

  ajouterEtape({
    id: '5e-nombres-priorites',
    banque: ['calcul', 'calcul', 'calcul', 'choix', 'choix', 'parentheses', 'parentheses', 'ordre', 'traduire', 'traduire',
      'nature', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'calcul') {
        const c = parmi(PRIORITAIRES)();
        return nombre({ consigne: 'Calcule en respectant les priorités', enonce: `${c.texte} = ___`, reponse: c.valeur, explication: expliquerCalcul(c) });
      }
      if (sorte === 'choix' || sorte === 'parentheses') {
        let c;
        do { c = parmi(sorte === 'choix' ? PRIORITAIRES : AVEC_PARENTHESES)(); } while (sorte === 'choix' && c.faux === null);
        if (sorte === 'parentheses' && Math.random() < 0.5) {
          return nombre({ consigne: 'Calcule', enonce: `${c.texte} = ___`, reponse: c.valeur, explication: expliquerCalcul(c) });
        }
        const v = c.valeur;
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${c.texte} = ___`,
          reponse: v,
          // L'erreur de priorité (celle dont parle Roxy) est toujours là ; les autres sont d'autres erreurs de calcul
          ...avecErreur(v, [c.faux], c.autres, [v - 10, v + 10]),
          explication: expliquerCalcul(c),
        });
      }
      if (sorte === 'ordre') {
        const e = expressionAOrdonner();
        return choix({
          consigne: 'Par quel calcul commence-t-on ?',
          enonce: e.texte,
          reponse: e.calculs[e.bon],
          pieges: e.calculs.filter((_, i) => i !== e.bon),
          explication: `Dans ${e.texte}, ${e.raison}.<br>On commence donc par <b>${e.calculs[e.bon]}</b>.`,
        });
      }
      if (sorte === 'traduire') {
        const { bonne, autres } = phraseATraduire();
        return choix({
          consigne: 'Quel calcul correspond à cette phrase ?',
          enonce: `« ${bonne.phrase} »`,
          reponse: bonne.calcul,
          pieges: autres,
          explication: `${bonne.explication}<br>Le calcul est <b>${bonne.calcul}</b>.`,
        });
      }
      if (sorte === 'nature') {
        const e = expressionANommer();
        return choix({
          consigne: 'Somme, différence, produit ou quotient ?',
          enonce: `L’expression ${e.texte} est ___.`,
          reponse: `${ARTICLE[e.nature]} ${e.nature}`,
          choix: ['une somme', 'une différence', 'un produit', 'un quotient'],
          explication: `On calcule d’abord ${e.premier}, et on termine par ${NOM_OPERATION[e.derniere]} : `
            + `c’est ${ARTICLE[e.nature]} <b>${e.nature}</b>.<br>`
            + 'Une expression porte le nom de la <b>dernière</b> opération effectuée.',
        });
      }
      if (sorte === 'probleme') {
        const pb = problemeDeCalcul();
        const resultat = pb.unite === '€' ? euros(pb.valeur) : `${ecrire(pb.valeur)} ${pb.unite}`;
        if (Math.random() < 0.5) {
          return nombre({
            consigne: 'Résous le problème',
            enonce: pb.enonce,
            reponse: pb.valeur,
            unite: pb.unite,
            prix: pb.unite === '€',
            explication: `Le calcul est <b>${pb.bon}</b> : ${pb.detail}.<br>La réponse est <b>${resultat}</b>.`,
          });
        }
        return choix({
          consigne: 'Quel calcul donne la réponse ?',
          enonce: pb.enonce,
          reponse: pb.bon,
          pieges: pb.faux,
          explication: `${pb.detail[0].toUpperCase()}${pb.detail.slice(1)}.<br>En un seul calcul : <b>${pb.bon}</b> `
            + '(la multiplication passe avant, pas besoin de parenthèses).',
        });
      }
      // Vrai ou faux : un calcul juste ou fait de gauche à droite, ou des parenthèses utiles… ou pas
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.65) {
        let c;
        do { c = parmi([...PRIORITAIRES, ...AVEC_PARENTHESES])(); } while (c.faux === null);
        return vraiFaux({ enonce: `${c.texte} = ${ecrire(vrai ? c.valeur : c.faux)}`, vrai, explication: expliquerCalcul(c, !vrai) });
      }
      const [a, b, c] = [entier(2, 12), entier(2, 9), entier(2, 9)];
      if (Math.random() < 0.5) {
        // (a + b) × c et a + (b × c), comparés à a + b × c
        const [gauche, valeurGauche] = vrai ? [`${a} + (${b} × ${c})`, a + b * c] : [`(${a} + ${b}) × ${c}`, (a + b) * c];
        return vraiFaux({
          enonce: `${gauche} = ${a} + ${b} × ${c}`,
          vrai,
          explication: `${gauche} = ${valeurGauche} et ${a} + ${b} × ${c} = ${a} + ${b * c} = ${a + b * c}.<br>`
            + (vrai ? 'Ces parenthèses sont inutiles : la multiplication se calcule déjà en premier.'
              : 'Ici, les parenthèses changent l’ordre des calculs, donc le résultat.'),
        });
      }
      const [gauche, valeurGauche] = vrai ? [`(${a} × ${b}) + ${c}`, a * b + c] : [`${a} × (${b} + ${c})`, a * (b + c)];
      return vraiFaux({
        enonce: `${gauche} = ${a} × ${b} + ${c}`,
        vrai,
        explication: `${gauche} = ${valeurGauche} et ${a} × ${b} + ${c} = ${a * b} + ${c} = ${a * b + c}.<br>`
          + (vrai ? 'Ces parenthèses sont inutiles : la multiplication se calcule déjà en premier.'
            : 'Ici, les parenthèses changent l’ordre des calculs, donc le résultat.'),
      });
    },
    titreLecon: 'Les priorités de calcul',
    lecon: `
      <h4>Dans quel ordre calculer ?</h4>
      <p>1. D’abord ce qui est <b>entre parenthèses</b> (en commençant par les parenthèses les plus intérieures) ;<br>
        2. puis les <b>multiplications</b> et les <b>divisions</b> ;<br>
        3. enfin les <b>additions</b> et les <b>soustractions</b>.<br>
        Entre des opérations de même priorité (seulement + et −, ou seulement × et ÷), on calcule <b>de gauche à droite</b>.</p>
      <p>👉 <i>2 + 3 × 4 = 2 + 12 = 14</i> (et pas 20 !) · <i>(2 + 3) × 4 = 5 × 4 = 20</i><br>
        👉 <i>20 − 5 + 3 = 15 + 3 = 18</i> · <i>24 ÷ 4 × 2 = 6 × 2 = 12</i><br>
        👉 <i>3 × (10 − (2 + 5)) = 3 × (10 − 7) = 3 × 3 = 9</i></p>
      <h4>Somme, différence, produit, quotient</h4>
      <table>
        <tr><th>somme</th><td>le résultat d’une addition : 5 + 3 (5 et 3 sont les <b>termes</b>)</td></tr>
        <tr><th>différence</th><td>le résultat d’une soustraction : 9 − 4</td></tr>
        <tr><th>produit</th><td>le résultat d’une multiplication : 6 × 7 (6 et 7 sont les <b>facteurs</b>)</td></tr>
        <tr><th>quotient</th><td>le résultat d’une division : 12 ÷ 3</td></tr>
      </table>
      <p>Une expression porte le nom de la <b>dernière opération</b> effectuée : <i>5 + 3 × 4</i> est une <b>somme</b>,
        <i>(5 + 3) × 4</i> est un <b>produit</b>.<br>
        « la somme de 5 et du produit de 3 par 4 » s’écrit <i>5 + 3 × 4</i> ; « le produit de la somme de 5 et 3 par 4 » s’écrit <i>(5 + 3) × 4</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> repère d’abord le calcul prioritaire, fais-le, puis recopie le reste de la ligne.
        Une étape par ligne, et pas d’erreur !</div>
    `,
  });

  // ======================================================================
  // 2. Les nombres relatifs
  // ======================================================================
  // Les touches du clavier pour toute l'étape (le « − » est toujours là, pour ne rien dévoiler)
  const TOUCHES_RELATIFS = [',', '−'];
  const cote = x => (x < 0 ? 'à gauche' : 'à droite');

  // Une droite graduée avec un point A : graduée de 1 en 1, de 2 en 2, ou de 0,5 en 0,5
  function droiteRelative() {
    const facon = parmi(['unites', 'unites', 'deux', 'demis']);
    if (facon === 'unites') {
      const debut = -entier(3, 8);
      const fin = debut + 10;
      let x;
      do { x = Math.random() < 0.7 ? entier(debut + 1, -1) : entier(1, fin - 1); } while (x === 0);
      return {
        x,
        figure: figures.droiteGraduee({ debut, fin, pas: 1, etiquettes: [debut, 0, fin], points: [{ valeur: x, nom: 'A' }] }),
        explication: `D’une graduation à la suivante, on avance de <b>1</b>. A est à ${unOuPlus(Math.abs(x), 'intervalle')} ${cote(x)} de 0 : `
          + `son abscisse est <b>${ecrire(x)}</b>.`,

      };
    }
    if (facon === 'deux') {
      const debut = -2 * entier(3, 6);
      const fin = debut + 20;
      let x;
      do { x = 2 * (Math.random() < 0.7 ? entier(debut / 2 + 1, -1) : entier(1, fin / 2 - 1)); } while (x === 0);
      return {
        x,
        figure: figures.droiteGraduee({ debut, fin, pas: 2, etiquettes: [debut, 0, fin], points: [{ valeur: x, nom: 'A' }] }),
        explication: `De 0 à ${fin}, il y a ${fin / 2} intervalles : ${fin} ÷ ${fin / 2} = 2. D’une graduation à la suivante, on avance de <b>2</b>.<br>`
          + `A est à ${unOuPlus(Math.abs(x) / 2, 'intervalle')} ${cote(x)} de 0, soit ${ecrire(Math.abs(x) / 2)} × 2 = ${ecrire(Math.abs(x))} unités : `
          + `son abscisse est <b>${ecrire(x)}</b>.`,
      };
    }
    const debut = -entier(2, 4);
    const fin = debut + 5;
    const x = net(entier(debut, fin - 1) + 0.5);
    return {
      x,
      figure: figures.droiteGraduee({
        debut, fin, pas: 0.5, etiquettes: Array.from({ length: 6 }, (_, i) => debut + i), points: [{ valeur: x, nom: 'A' }],
      }),
      explication: 'Chaque unité est partagée en <b>2</b> : une graduation vaut <b>0,5</b>.<br>'
        + `A est au milieu, entre ${ecrire(net(x - 0.5))} et ${ecrire(net(x + 0.5))} : son abscisse est <b>${ecrire(x)}</b>.`,
    };
  }

  // Deux nombres relatifs à comparer : [a, b, texte de b] (le texte de b sert pour −4,5 et −4,50)
  function paireRelative() {
    return parmi([
      () => { const [a, b] = RM.melanger([entier(1, 9), entier(10, 20)]); return [-a, -b]; },
      () => { let a, b; do { [a, b] = [entier(1, 15), entier(1, 15)]; } while (a === b); return [-a, -b]; },
      () => [-entier(5, 15), entier(1, 4)],
      () => [0, -entier(1, 9)],
      () => { const d = entier(2, 9); const e = entier(1, 9); return [-net(e + d / 10), -net(e + (d - 1) / 10 + entier(1, 9) / 100)]; },
      () => { const x = -decimal(1, 9, 1); return [x, x, `${ecrire(x)}0`]; },
      // Qui ressemblent à une égalité, mais n'en sont pas : −4,5 et −4,05
      () => { const [e, d] = [entier(1, 9), entier(1, 9)]; return [-net(e + d / 10), -net(e + d / 100)]; },
    ])();
  }

  function expliquerComparaisonRelative(a, b) {
    const s = signe(a, b);
    const [petit, grand] = a < b ? [a, b] : [b, a];
    if (s === '=') return 'Un zéro à la fin de la partie décimale ne change pas le nombre : les deux nombres sont <b>égaux</b>.';
    // (la conclusion suit l'ordre de la question : −1 > −2)
    const conclusion = `<b>${ecrire(a)} ${HTML[s]} ${ecrire(b)}</b>`;
    if (grand === 0) return `0 est plus grand que tous les autres nombres négatifs : ${conclusion}.`;
    if (grand > 0) return `Un nombre négatif est plus petit qu’un nombre positif : ${conclusion}.`;
    return 'Deux nombres négatifs : le plus petit est celui qui est le <b>plus loin de zéro</b>.<br>'
      + `${ecrire(-petit)} &gt; ${ecrire(-grand)}, donc ${conclusion}.`;
  }

  // Quatre relatifs différents, avec au moins deux nombres négatifs (pour que la comparaison soit piégeuse)
  function quatreRelatifs() {
    let n;
    do {
      n = [-entier(1, 12), -entier(1, 12), parmi([-entier(1, 12), 0, entier(1, 9)]), parmi([entier(1, 12), -entier(1, 12)])];
    } while (new Set(n).size < 4 || n.filter(x => x < 0).length < 2);
    return RM.melanger(n);
  }

  ajouterEtape({
    id: '5e-nombres-relatifs',
    banque: ['droite', 'placer', 'placer', 'comparer', 'comparer', 'ranger', 'plusGrand', 'oppose', 'oppose', 'situation',
      'situation', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'droite') {
        const { x, figure, explication } = droiteRelative();
        return nombre({ consigne: 'Lis l’abscisse du point A', enonce: `${figure}Quelle est l’abscisse du point A ?`, reponse: x, explication,
          touches: TOUCHES_RELATIFS });
      }
      if (sorte === 'placer') {
        // Le point cherché, son opposé (l'erreur de signe), un voisin et un autre point
        const debut = -entier(4, 6);
        const fin = debut + 10;
        // (t et son opposé doivent tenir sur la droite : de −3 à 3)
        const t = (Math.random() < 0.7 ? -1 : 1) * entier(1, 3);
        let valeurs;
        do {
          valeurs = [t, -t, t + parmi([-1, 1]), entier(debut + 1, fin - 1)];
        } while (new Set(valeurs).size < 4 || valeurs.includes(0) || valeurs.some(v => v <= debut || v >= fin));
        const noms = RM.melanger(['A', 'B', 'C', 'D']);
        const bon = noms[0];
        return choix({
          consigne: 'Repère le point',
          enonce: figures.droiteGraduee({ debut, fin, pas: 1, etiquettes: [debut, 0, fin], points: valeurs.map((v, i) => ({ valeur: v, nom: noms[i] })) })
            + `Quel point a pour abscisse ${ecrire(t)} ?`,
          reponse: bon,
          choix: ['A', 'B', 'C', 'D'],
          explication: `Le point d’abscisse ${ecrire(t)} est à ${unOuPlus(Math.abs(t), 'graduation')} ${cote(t)} de 0 : c’est le point <b>${bon}</b>.<br>`
            + `⚠️ Le point ${noms[1]}, ${cote(-t)} de 0, a pour abscisse ${ecrire(-t)} : c’est l’opposé.`,
        });
      }
      if (sorte === 'comparer') {
        let [a, b, texteB] = paireRelative();
        if (Math.random() < 0.5 && !texteB) [a, b] = [b, a];
        // (l'égalité −7,9 = −7,90 : le zéro de plus, à gauche ou à droite)
        const [gauche, droite] = texteB && Math.random() < 0.5 ? [texteB, ecrire(a)] : [ecrire(a), texteB || ecrire(b)];
        return choix({
          consigne: 'Compare ces deux nombres',
          enonce: `${gauche} ___ ${droite}`,
          reponse: signe(a, b),
          choix: ['<', '=', '>'],
          explication: expliquerComparaisonRelative(a, b),
        });
      }
      if (sorte === 'ranger') {
        const n = quatreRelatifs();
        const croissant = Math.random() < 0.5;
        const trier = cle => {
          const t = [...n].sort((x, y) => cle(x) - cle(y) || x - y);
          return croissant ? t : t.reverse();
        };
        const liste = t => t.map(ecrire).join(croissant ? ' < ' : ' > ');
        const bon = trier(x => x);
        // Les erreurs classiques : ranger selon la distance à zéro, ou les négatifs à l'envers (−1 < −5 car 1 < 5)
        const echange = i => { const t = [...bon]; [t[i], t[i + 1]] = [t[i + 1], t[i]]; return t; };
        // (pas la liste à l'envers : avec deux positifs dans le mauvais ordre, on l'élimine sans rien savoir des relatifs)
        const pieges = [liste(trier(Math.abs)), liste(trier(x => (x < 0 ? -100 - x : x))),
          ...RM.melanger([0, 1, 2]).map(i => liste(echange(i)))];
        return choix({
          consigne: `Range dans l’ordre ${croissant ? 'croissant' : 'décroissant'}`,
          enonce: `Range ces nombres dans l’ordre ${croissant ? 'croissant' : 'décroissant'} : ${n.map(ecrire).join(' ; ')}`,
          reponse: liste(bon),
          pieges: [...new Set(pieges)].filter(p => p !== liste(bon)).slice(0, 3),
          explication: (croissant ? 'Les négatifs d’abord, du plus loin de zéro au plus proche ; puis 0 et les positifs.<br>'
            : 'Les positifs d’abord, puis 0, puis les négatifs, du plus proche de zéro au plus loin.<br>')
            + `<b>${bon.map(ecrire).join(croissant ? ' &lt; ' : ' &gt; ')}</b>`,
        });
      }
      if (sorte === 'plusGrand') {
        const n = quatreRelatifs();
        const plusGrand = Math.random() < 0.4;
        const ranges = [...n].sort((x, y) => x - y);
        const reponse = plusGrand ? ranges[3] : ranges[0];
        return choix({
          consigne: 'Compare',
          enonce: `Quel est le plus ${plusGrand ? 'grand' : 'petit'} de ces nombres ?`,
          reponse,
          pieges: n,
          ordre: 'melange',
          explication: `Du plus petit au plus grand : ${ranges.map(ecrire).join(' &lt; ')}.<br>`
            + (plusGrand ? `Le plus grand est <b>${ecrire(reponse)}</b>.`
              : `Le plus petit est <b>${ecrire(reponse)}</b> : parmi les négatifs, c’est le plus loin de zéro.`),
        });
      }
      if (sorte === 'oppose') {
        const x = parmi([() => entierSauf(-20, 20, [0, 1, -1]), () => (Math.random() < 0.6 ? -1 : 1) * decimal(0.5, 9.5, 1)])();
        if (Math.random() < 0.55) {
          return nombre({
            consigne: 'L’opposé d’un nombre',
            enonce: `L’opposé de ${ecrire(x)} est ___.`,
            reponse: -x,
            touches: TOUCHES_RELATIFS,
            explication: `Deux nombres opposés ont la <b>même distance à zéro</b> et des <b>signes contraires</b>.<br>`
              + `L’opposé de ${ecrire(x)} est <b>${ecrire(-x)}</b>.`,
          });
        }
        return nombre({
          consigne: 'La distance à zéro',
          enonce: `La distance à zéro de ${ecrire(x)} est ___.`,
          reponse: Math.abs(x),
          touches: TOUCHES_RELATIFS,
          explication: `${ecrire(x)} est à ${ecrire(Math.abs(x))} ${Math.abs(x) >= 2 ? 'unités' : 'unité'} de 0 sur la droite graduée : sa distance à zéro est `
            + `<b>${ecrire(Math.abs(x))}</b>.<br>C’est le nombre sans son signe : une distance n’est jamais négative.`,
        });
      }
      if (sorte === 'situation') {
        if (Math.random() < 0.5) {
          // Chez qui fait-il le plus froid (ou le moins froid) ? Quatre amis qui habitent dans des villes différentes
          const villes = RM.melanger(ENFANTS.map(([nom]) => nom)).slice(0, 4);
          let t;
          do { t = [-entier(1, 15), -entier(1, 15), entier(-3, 8), entier(-15, 5)]; } while (new Set(t).size < 4);
          t = RM.melanger(t);
          const froid = Math.random() < 0.6;
          const i = t.indexOf(froid ? Math.min(...t) : Math.max(...t));
          const liste = villes.map((v, k) => `${mesure(t[k], '°C')} chez ${v}`);
          return choix({
            consigne: 'Compare les températures',
            enonce: `Ce matin, quatre amis notent la température chez eux : ${liste.slice(0, 3).join(', ')} et ${liste[3]}. `
              + `Chez qui fait-il le plus ${froid ? 'froid' : 'chaud'} ?`,
            reponse: villes[i],
            pieges: villes.filter((_, k) => k !== i),
            explication: `Du plus froid au plus chaud : ${[...t].sort((x, y) => x - y).map(x => mesure(x, '°C')).join(' &lt; ')}.<br>`
              + `Il fait le plus ${froid ? 'froid' : 'chaud'} chez <b>${villes[i]}</b> (${mesure(t[i], '°C')}).`,
          });
        }
        const s = parmi([
          () => {
            const k = entier(2, 15);
            const dessous = Math.random() < 0.7;
            return { enonce: `Le thermomètre indique ${unOuPlus(k, 'degré')} ${dessous ? 'sous' : 'au-dessus de'} zéro. Écris cette température avec un nombre relatif.`,
              reponse: dessous ? -k : k, unite: '°C',
              explication: dessous ? `Sous zéro, la température est <b>négative</b> : ${mesure(-k, '°C')}.` : `Au-dessus de zéro, la température est <b>positive</b> : ${mesure(k, '°C')}.` };
          },
          () => {
            const [k, animal] = parmi([[entier(3, 30), 'Un plongeur nage'], [entier(2, 15), 'Une tortue nage'], [entier(2, 10), 'Un poisson nage']]);
            return { enonce: `${animal} à ${mesure(k, 'm')} sous le niveau de la mer. Quelle est son altitude ?`, reponse: -k, unite: 'm',
              explication: `Le niveau de la mer est l’altitude 0. Sous la mer, l’altitude est <b>négative</b> : ${mesure(-k, 'm')}.` };
          },
          () => {
            const k = entier(1, 3);
            const noms = ['', 'premier', 'deuxième', 'troisième'];
            return { enonce: `Dans un immeuble, le rez-de-chaussée est l’étage 0. Le ${noms[k]} sous-sol est l’étage ___.`, reponse: -k, unite: '',
              explication: `Les étages sous le rez-de-chaussée ont des numéros <b>négatifs</b> : le ${noms[k]} sous-sol est l’étage <b>${ecrire(-k)}</b>.` };
          },
          () => {
            const k = entier(2, 12);
            return { enonce: `Dans un jeu, Roxy perd ${k} points alors qu’elle en avait 0. Quel est son score ?`, reponse: -k, unite: 'points',
              explication: `Partir de 0 et perdre ${k} points, c’est descendre sous zéro : le score est <b>${ecrire(-k)}</b>.` };
          },
        ])();
        return nombre({ consigne: 'Les relatifs dans la vie', enonce: s.enonce, reponse: s.reponse, unite: s.unite, touches: TOUCHES_RELATIFS,
          explication: s.explication });
      }
      // Vrai ou faux : une comparaison, ou une règle
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.6) {
        let a, b;
        do { [a, b] = paireRelative(); } while (egaux(a, b));
        if (Math.random() < 0.5) [a, b] = [b, a];
        const s = signe(a, b);
        const dit = vrai ? s : (s === '<' ? '>' : '<');
        return vraiFaux({ enonce: `${ecrire(a)} ${HTML[dit]} ${ecrire(b)}`, vrai, explication: expliquerComparaisonRelative(a, b) });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['Un nombre négatif (autre que 0) est toujours plus petit qu’un nombre positif (autre que 0).',
          'Les négatifs sont à gauche de 0, les positifs à droite.'],
        ['Deux nombres opposés ont la même distance à zéro.', 'Par exemple, −6 et 6 sont tous les deux à 6 unités de 0.'],
        ['Entre deux nombres négatifs, le plus petit est le plus loin de zéro.', 'Par exemple, −9 &lt; −2 : il fait plus froid à −9 °C qu’à −2 °C.'],
      ] : [
        ['Entre deux nombres négatifs, le plus grand est le plus loin de zéro.', 'C’est le contraire : −9 &lt; −2, car −9 est plus loin de zéro.'],
        ['La distance à zéro d’un nombre négatif est négative.', 'Une distance n’est jamais négative : la distance à zéro de −7 est 7.'],
        ['L’opposé d’un nombre négatif est aussi un nombre négatif.', 'L’opposé de −5 est 5 : il est positif.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication[0].toLowerCase()}${explication.slice(1)}` });
    },
    titreLecon: 'Les nombres relatifs',
    lecon: `
      <h4>Des nombres positifs et négatifs</h4>
      <p>Un nombre <b>négatif</b> s’écrit avec le signe − : <i>−5</i> (« moins cinq »), <i>−2,5</i>. Un nombre <b>positif</b> s’écrit avec
        ou sans le signe + : <i>+3 = 3</i>. Zéro est à la fois positif et négatif.</p>
      ${figures.droiteGraduee({ debut: -5, fin: 5, pas: 1, etiquettes: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], points: [{ valeur: -3, nom: 'A' }, { valeur: 2, nom: 'B' }] })}
      <p>Sur une droite graduée, les négatifs sont <b>à gauche</b> de 0. L’<b>abscisse</b> de A est −3, celle de B est 2.</p>
      <h4>Opposé et distance à zéro</h4>
      <p><i>−3</i> et <i>3</i> sont <b>opposés</b> : ils sont à la même distance de 0, de chaque côté. La <b>distance à zéro</b> de −3 est 3 :
        c’est le nombre sans son signe.</p>
      <h4>Comparer</h4>
      <p>• Un négatif est plus petit qu’un positif (0 mis à part) : <i>−8 &lt; 2</i> ; et <i>−4 &lt; 0</i>.<br>

        • Entre deux négatifs, le plus petit est le <b>plus loin de zéro</b> : <i>−7 &lt; −3</i> (car 7 &gt; 3) ; <i>−2,5 &lt; −2,45</i>.<br>
        👉 Dans l’ordre croissant : <i>−7 &lt; −3 &lt; −0,5 &lt; 0 &lt; 2</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pense au thermomètre ! À −7 °C, il fait plus froid qu’à −3 °C : −7 &lt; −3.</div>
      <p>Dans la vie : les températures (−5 °C, 5 degrés sous zéro), les altitudes (−20 m, 20 m sous le niveau de la mer),
        les étages (−1, le premier sous-sol).</p>
    `,
  });

  // ======================================================================
  // 3. Additionner et soustraire des relatifs
  // ======================================================================
  // Un relatif pour les calculs : un entier non nul (souvent), ou un décimal à un chiffre après la virgule
  const relatifAuHasard = (max = 15) => (Math.random() < 0.85 ? entierSauf(-max, max, [0]) : (Math.random() < 0.6 ? -1 : 1) * decimal(0.5, 9.5, 1));

  // Deux termes, pas tous les deux positifs (sinon, c'est une addition de 6e)
  function deuxRelatifs() {
    let a, b;
    do { [a, b] = [relatifAuHasard(), relatifAuHasard()]; } while ((a > 0 && b > 0) || (!Number.isInteger(a) && !Number.isInteger(b)));
    return [a, b];
  }

  // a + b, écrit avec les parenthèses (−5) + (+3), ou en écriture simplifiée −5 + 3
  const ecrireSomme = (a, b, simple) => (simple ? `${ecrire(a)} ${b < 0 ? '−' : '+'} ${ecrire(Math.abs(b))}` : `${relatif(a)} + ${relatif(b)}`);

  // La règle, appliquée à a + b
  function expliquerSomme(a, b) {
    const [da, db] = [Math.abs(a), Math.abs(b)];
    const s = net(a + b);
    if (egaux(a, -b)) return `${ecrire(a)} et ${ecrire(b)} sont <b>opposés</b> : leur somme est <b>0</b>.`;
    if (a * b > 0) {
      return `Même signe : on additionne les distances à zéro (${ecrire(da)} + ${ecrire(db)} = ${ecrire(net(da + db))}) `
        + `et on garde le signe ${a < 0 ? '−' : '+'} : <b>${ecrire(s)}</b>.`;
    }
    const [loin, pres] = da > db ? [a, b] : [b, a];
    return `Signes contraires : on soustrait les distances à zéro (${ecrire(Math.abs(loin))} − ${ecrire(Math.abs(pres))} = ${ecrire(Math.abs(s))}) `
      + `et on prend le signe du plus loin de zéro (${ecrire(loin)}) : <b>${ecrire(s)}</b>.`;
  }

  // Les erreurs classiques pour a + b : le mauvais signe, ou les distances additionnées au lieu d'être soustraites (et l'inverse)
  function erreursSomme(a, b) {
    const [da, db] = [Math.abs(a), Math.abs(b)];
    const s = net(a + b);
    const erreurs = [-s];
    if (a * b < 0) erreurs.push(net(da + db), -net(da + db));
    else erreurs.push(net(Math.abs(da - db)) * Math.sign(a), -net(Math.abs(da - db)) * Math.sign(a));
    return erreurs.map(net).filter(x => !egaux(x, s));
  }

  // Une situation de la vie (température, étage, altitude, score)
  function situationRelative() {
    const p = unEnfant();
    return parmi([
      () => {
        const monte = Math.random() < 0.5;
        const t0 = monte ? entierSauf(-10, 5, [0]) : entierSauf(-6, 8, [0]);
        const k = monte ? entier(3, 15) : entier(3, 10);
        const t1 = monte ? t0 + k : t0 - k;
        return { enonce: `Le matin, il fait ${mesure(t0, '°C')}. Dans la journée, la température ${monte ? 'monte' : 'baisse'} de ${mesure(k, '°C')}. `
          + 'Quelle température fait-il ensuite ?',
          reponse: t1, unite: '°C', calcul: `${relatif(t0)} + ${relatif(monte ? k : -k)}`,
          faux: [t0 + (monte ? -k : k), -t1, -(t0 + (monte ? -k : k)), Math.abs(t0) + k, -(Math.abs(t0) + k)] };
      },
      () => {
        const [froid, chaud] = [-entier(2, 12), entier(2, 15)];
        return { enonce: `La nuit, il fait ${mesure(froid, '°C')} ; l’après-midi, il fait ${mesure(chaud, '°C')}. `
          + 'De combien de degrés la température a-t-elle monté ?',
          reponse: chaud - froid, unite: '°C', calcul: `${relatif(chaud)} − ${relatif(froid)} = ${relatif(chaud)} + ${relatif(-froid)}`,
          faux: [chaud + froid, -(chaud + froid), froid - chaud] };
      },
      () => {
        const e0 = entier(1, 5);
        const k = entier(2, e0 + 3);
        return { enonce: `Le rez-de-chaussée est l’étage 0. ${p.nom} est à l’étage ${e0} ; ${p.il} descend de ${k} étages en ascenseur. `
          + `À quel étage arrive-t-${p.il} ?`,
          // (e0 − k ± 1 : on compte l'étage de départ, ou on oublie le rez-de-chaussée)
          reponse: e0 - k, unite: '', calcul: `${relatif(e0)} + ${relatif(-k)}`, faux: [k - e0, e0 + k, -(e0 + k), e0 - k + 1, e0 - k - 1] };
      },
      () => {
        const z0 = -entier(8, 30);
        const k = entier(3, -z0 - 2);
        return { enonce: `Un plongeur est à l’altitude ${mesure(z0, 'm')}. Il remonte de ${mesure(k, 'm')}. Quelle est sa nouvelle altitude ?`,
          reponse: z0 + k, unite: 'm', calcul: `${relatif(z0)} + ${relatif(k)}`, faux: [z0 - k, -(z0 + k), k - z0, z0 + k - 10, z0 + k + 10] }; // (± 10 : une retenue oubliée)

      },
      () => {
        const s0 = -entier(2, 9);
        // (q différent de g : « gagne 11 points, puis perd 11 points » redonnerait le score de départ)
        const g = entier(3, 12);
        const q = entierSauf(2, 12, [g]);
        return { enonce: `Dans un jeu, ${p.nom} a ${ecrire(s0)} points. ${p.Il} gagne ${g} points, puis perd ${q} points. Quel est son score ?`,
          reponse: s0 + g - q, unite: 'points', calcul: `${relatif(s0)} + ${relatif(g)} + ${relatif(-q)}`,
          // (les erreurs de signe, et les oublis : le score de départ, le gain ou la perte)
          faux: [-s0 + g - q, s0 - g + q, s0 + g + q, s0 - g - q, g - q, s0 - q, s0 + g] };

      },
    ])();
  }

  ajouterEtape({
    id: '5e-nombres-relatifs-addition',
    banque: ['somme', 'somme', 'sommeChoix', 'sommeChoix', 'sommeChoix', 'difference', 'difference', 'transformer', 'plusieurs',
      'situation', 'situation', 'trou', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'somme' || sorte === 'sommeChoix') {
        const [a, b] = deuxRelatifs();
        const s = net(a + b);
        // (l'écriture simplifiée seulement quand le premier nombre est négatif : « 14 − 6 », c'est un calcul de 6e)
        const simple = a < 0 && Math.random() < 0.4;
        // En écriture simplifiée, Roxy montre d'abord les deux nombres qu'on additionne : −4,7 − 2, c'est (−4,7) + (−2)
        const commun = {
          consigne: 'Calcule',
          enonce: `${ecrireSomme(a, b, simple)} = ___`,
          reponse: s,
          explication: (simple ? `${ecrireSomme(a, b, true)}, c’est ${relatif(a)} + ${relatif(b)}.<br>` : '') + expliquerSomme(a, b),
        };
        if (sorte === 'somme') return nombre({ ...commun, touches: TOUCHES_RELATIFS });
        // Les pièges : les erreurs de signe et de distances (l'une d'elles toujours gardée)
        const erreurs = erreursSomme(a, b);
        // (secours, pour la somme de deux opposés : un seul des deux nombres, avec ou sans son signe)
        return choix({
          ...commun,
          consigne: 'Choisis le bon résultat',
          ...avecErreur(s, RM.melanger(erreurs), erreurs, [s - 10, s + 10, Math.abs(a), -Math.abs(a)], true),
        });
      }
      if (sorte === 'difference') {
        let a, b;
        do { [a, b] = deuxRelatifs(); } while (Math.random() < 0.6 && b > 0);
        if (Math.random() < 0.3) [a, b] = [Math.abs(a), -Math.abs(b)];
        const d = net(a - b);
        const explication = `Soustraire, c’est <b>ajouter l’opposé</b> : ${relatif(a)} − ${relatif(b)} = ${relatif(a)} + ${relatif(-b)}.<br>`
          + expliquerSomme(a, -b);
        const commun = { consigne: 'Calcule', enonce: `${relatif(a)} − ${relatif(b)} = ___`, reponse: d, explication };
        if (Math.random() < 0.5) return nombre({ ...commun, touches: TOUCHES_RELATIFS });
        // L'erreur classique : garder le signe de b (a + b au lieu de a − b), ou se tromper de signe
        return choix({
          ...commun,
          consigne: 'Choisis le bon résultat',
          ...avecErreur(d, [net(a + b)], [-d, -net(a + b), ...erreursSomme(a, -b)], [d - 10, d + 10], true),
        });
      }
      if (sorte === 'transformer') {
        let a, b;
        do { [a, b] = [entierSauf(-12, 12, [0]), entierSauf(-12, 12, [0])]; } while (Math.abs(a) === Math.abs(b));
        const ecritures = [[a, -b], [a, b], [-a, -b], [-a, b]].map(([x, y]) => `${relatif(x)} + ${relatif(y)}`);
        return choix({
          consigne: 'Écris la soustraction comme une addition',
          enonce: `${relatif(a)} − ${relatif(b)} = ___`,
          reponse: ecritures[0],
          pieges: ecritures.slice(1),
          explication: `Soustraire ${relatif(b)}, c’est ajouter son <b>opposé</b> ${relatif(-b)}. Le premier nombre ne change pas :<br>`
            + `${relatif(a)} − ${relatif(b)} = <b>${ecritures[0]}</b> = ${ecrire(a - b)}.`,
        });
      }
      if (sorte === 'plusieurs') {
        let termes;
        do { termes = Array.from({ length: entier(3, 5) }, () => entierSauf(-9, 9, [0])); } while (!termes.some(x => x > 0) || !termes.some(x => x < 0));
        const simple = Math.random() < 0.5;
        const ecrit = simple
          ? termes.map((x, i) => (i === 0 ? ecrire(x) : `${x < 0 ? '−' : '+'} ${Math.abs(x)}`)).join(' ')
          : termes.map(relatif).join(' + ');
        const [pos, neg] = [termes.filter(x => x > 0), termes.filter(x => x < 0)];
        const [sp, sn] = [pos.reduce((u, v) => u + v, 0), neg.reduce((u, v) => u + v, 0)];
        const total = sp + sn;
        return nombre({
          consigne: 'Calcule',
          enonce: `${ecrit} = ___`,
          reponse: total,
          touches: TOUCHES_RELATIFS,
          explication: `On regroupe les positifs : ${pos.length > 1 ? `${pos.join(' + ')} = ` : ''}${sp} ; `
            + `les négatifs : ${neg.length > 1 ? `${neg.map(relatif).join(' + ')} = ` : ''}${ecrire(sn)}.<br>`
            + `Puis ${relatif(sp)} + ${relatif(sn)} = <b>${ecrire(total)}</b>.`,
        });
      }
      if (sorte === 'situation') {
        const s = situationRelative();
        const unite = s.unite ? ` ${s.unite}` : '';
        // (« 1 point », « −1 point », « 0 point », mais « 5 points »)
        const resultat = s.unite === 'points' ? unOuPlus(s.reponse, 'point') : `${ecrire(s.reponse)}${unite}`;
        const explication = `On calcule ${s.calcul} = <b>${resultat}</b>.`;
        if (Math.random() < 0.5) {
          return nombre({ consigne: 'Résous le problème', enonce: s.enonce, reponse: s.reponse, unite: s.unite, touches: TOUCHES_RELATIFS, explication,
            solution: s.unite === 'points' ? `<b>${resultat}</b>` : undefined });
        }
        const bouton = x => (s.unite && s.unite !== 'points' ? mesure(x, s.unite) : ecrire(x));
        // (l'explication ne parle d'aucune erreur en particulier : on garde l'une d'elles, au hasard)
        const { garder, pieges } = avecErreur(s.reponse, RM.melanger(s.faux), s.faux, [s.reponse - 2, s.reponse + 2], true);
        return choix({
          consigne: 'Résous le problème',
          enonce: s.enonce,
          reponse: bouton(s.reponse),
          garder: garder.map(bouton),
          pieges: pieges.map(bouton),
          explication,
        });
      }
      if (sorte === 'trou') {
        let a, c;
        do { [a, c] = [entierSauf(-12, 12, [0]), entierSauf(-12, 12, [0])]; } while (a === c || a === -c || (a > 0 && c > a));
        const x = c - a;
        return choix({
          consigne: 'Quel nombre manque ?',
          enonce: `${relatif(a)} + ___ = ${relatif(c)}`,
          reponse: relatif(x),
          pieges: vraisPieges(x, [-x, c + a, -(c + a)], [], true).map(relatif),
          explication: `On cherche ce qu’il faut ajouter à ${relatif(a)} pour arriver à ${relatif(c)} : `
            + `${relatif(c)} − ${relatif(a)} = ${relatif(c)} + ${relatif(-a)} = <b>${relatif(x)}</b>.<br>`
            + `Vérifie : ${relatif(a)} + ${relatif(x)} = ${relatif(c)}.`,
        });
      }
      // Vrai ou faux : un calcul, ou une règle
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.6) {
        const [a, b] = deuxRelatifs();
        return vraiFaux({
          enonce: `${relatif(a)} + ${relatif(b)} = ${ecrire(vrai ? net(a + b) : parmi(erreursSomme(a, b)))}`,
          vrai,
          explication: expliquerSomme(a, b),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['La somme de deux nombres négatifs est négative.', 'On ajoute les distances à zéro et on garde le signe − : (−4) + (−3) = −7.'],
        ['La somme de deux nombres opposés est égale à 0.', 'Par exemple, (−8) + (+8) = 0.'],
        ['Soustraire un nombre négatif, c’est ajouter un nombre positif.', 'On ajoute l’opposé : (+2) − (−5) = (+2) + (+5) = 7.'],
      ] : [
        ['La somme de deux nombres négatifs est positive.', 'On garde le signe − : (−4) + (−3) = −7.'],
        ['La somme d’un nombre positif et d’un nombre négatif est toujours négative.', 'Par exemple, (+9) + (−2) = 7 : on prend le signe du plus loin de zéro.'],
        ['Soustraire un nombre négatif, c’est ajouter un nombre négatif.', 'On ajoute l’opposé : (+2) − (−5) = (+2) + (+5) = 7.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication[0].toLowerCase()}${explication.slice(1)}` });
    },
    titreLecon: 'Additionner des relatifs',
    lecon: `
      <h4>Additionner deux nombres relatifs</h4>
      <p>• <b>Même signe</b> : on additionne les distances à zéro et on garde le signe.<br>
        👉 <i>(−5) + (−3) = −8</i> · <i>(+4) + (+2) = 6</i><br>
        • <b>Signes contraires</b> : on soustrait les distances à zéro (la plus grande moins la plus petite)
        et on prend le signe du nombre le <b>plus loin de zéro</b>.<br>
        👉 <i>(−5) + (+3) = −2</i> · <i>(−4) + (+9) = 5</i><br>
        • Deux nombres <b>opposés</b> ont une somme nulle : <i>(−7) + (+7) = 0</i>.</p>
      <h4>Soustraire</h4>
      <p>Soustraire un nombre, c’est <b>ajouter son opposé</b> :<br>
        👉 <i>(+3) − (−5) = (+3) + (+5) = 8</i> · <i>(−2) − (+6) = (−2) + (−6) = −8</i></p>
      <h4>Plusieurs nombres, l’écriture simplifiée</h4>
      <p>On enlève les parenthèses et les signes + inutiles : <i>(−3) + (+8) + (−5) + (+2) = −3 + 8 − 5 + 2</i>.<br>
        On regroupe les positifs (8 + 2 = 10) et les négatifs (−3 − 5 = −8) : 10 − 8 = <b>2</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pense à un thermomètre. Avec +, la température monte ; avec −, elle baisse.
        (−5) + (+3) : il fait −5 °C et ça monte de 3 degrés → <b>−2 °C</b>.</div>
    `,
  });

  // ======================================================================
  // 4. Fractions égales
  // ======================================================================
  // Une fraction k/d « simple » (k et d sans diviseur commun), plus petite que 1, ou entre 1 et 2
  function fractionSimple(dMax = 9, plusGrandeQueUn = false) {
    const d = entier(2, dMax);
    let k;
    do { k = plusGrandeQueUn ? entier(d + 1, 2 * d - 1) : entier(1, d - 1); } while (pgcd(k, d) !== 1);
    return [k, d];
  }

  // « les 3/4 de » ou « 1/4 de »
  const lesFraction = (k, d) => (k === 1 ? frac(1, d) : `les ${frac(k, d)}`);

  // Les diviseurs de k plus grands que 1 et plus petits que k (pour simplifier en plusieurs fois)
  const diviseursPropres = k => Array.from({ length: k }, (_, i) => i).filter(m => m > 1 && k % m === 0);

  // Comparer deux fractions : même dénominateur, dénominateurs multiples l'un de l'autre, ou avec 1.
  // Renvoie [n1, d1, n2, d2] (n2/d2 peut être 1/1 : on écrit alors « 1 »)
  function deuxFractions() {
    const genre = parmi(['meme', 'meme', 'multiple', 'multiple', 'multiple', 'un']);
    if (genre === 'meme') {
      const d = entier(3, 12);
      let n1, n2;
      do { [n1, n2] = [entier(1, 2 * d), entier(1, 2 * d)]; } while (n1 === n2 || n1 % d === 0 || n2 % d === 0);
      return [n1, d, n2, d];
    }
    if (genre === 'multiple') {
      const d = entier(2, 6);
      const k = entier(2, d <= 3 ? 4 : 3);
      let n1;
      do { n1 = entier(1, 2 * d - 1); } while (n1 === d || pgcd(n1, d) !== 1);
      // (souvent tout près : 2/3 et 5/6 ; parfois égales : 2/3 et 4/6)
      const n2 = Math.random() < 0.2 ? k * n1 : k * n1 + parmi([-2, -1, 1, 2].filter(e => k * n1 + e > 0));
      const paire = [n1, d, n2, k * d];
      return Math.random() < 0.5 ? paire : [n2, k * d, n1, d];
    }
    const d = entier(2, 12);
    const n = entierSauf(1, 2 * d, [d]);
    return [n, d, 1, 1];
  }

  const ecrireFraction = (n, d) => (d === 1 ? ecrire(n) : frac(n, d));

  function expliquerComparaisonFractions([n1, d1, n2, d2]) {
    const s = signe(n1 / d1, n2 / d2);
    const conclusion = `<b>${ecrireFraction(n1, d1)} ${HTML[s]} ${ecrireFraction(n2, d2)}</b>`;
    if (d2 === 1) {
      return `${frac(d1, d1)} = 1 : on compare le numérateur et le dénominateur. ${n1} ${HTML[signe(n1, d1)]} ${d1}, donc ${conclusion}.`;
    }
    if (d1 === d2) return `Même dénominateur : on compare les numérateurs. ${n1} ${HTML[s]} ${n2}, donc ${conclusion}.`;
    // On écrit la fraction qui a le plus petit dénominateur avec l'autre dénominateur
    const [petit, grand] = d1 < d2 ? [[n1, d1], [n2, d2]] : [[n2, d2], [n1, d1]];
    const k = grand[1] / petit[1];
    const [a, b] = d1 < d2 ? [n1 * k, n2] : [n1, n2 * k];
    return `${grand[1]} = ${petit[1]} × ${k} : ${frac(...petit)} = ${frac(petit[0] * k, grand[1])}.<br>`
      + `Même dénominateur ${grand[1]} : ${a} ${HTML[s]} ${b}, donc ${conclusion}.`;
  }

  ajouterEtape({
    id: '5e-nombres-fractions-egales',
    banque: ['completer', 'completer', 'egale', 'egale', 'simplifier', 'simplifier', 'comparer', 'comparer', 'decimal', 'quantite',
      'plusGrande', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'completer' || sorte === 'egale') {
        const [a, b] = Math.random() < 0.3 ? fractionSimple(6, true) : fractionSimple(9);
        const f = entier(2, 6);
        const simplifie = Math.random() < 0.4;
        const [depart, arrivee] = simplifie ? [[a * f, b * f], [a, b]] : [[a, b], [a * f, b * f]];
        if (sorte === 'completer') {
          // Le nombre qui manque : 3/5 = ___/20
          const trouEnHaut = Math.random() < 0.6;
          const [de, vers] = trouEnHaut ? [depart[1], arrivee[1]] : [depart[0], arrivee[0]];
          return nombre({
            consigne: 'Complète les fractions égales',
            enonce: `${frac(...depart)} = ${trouEnHaut ? frac('___', arrivee[1]) : frac(arrivee[0], '___')}`,
            reponse: trouEnHaut ? arrivee[0] : arrivee[1],
            explication: `${simplifie ? `${de} ÷ ${f} = ${vers}` : `${de} × ${f} = ${vers}`} : `
              + `${simplifie ? 'on divise' : 'on multiplie'} le numérateur <b>et</b> le dénominateur par <b>${f}</b>.<br>`
              + `${frac(...depart)} = <b>${frac(...arrivee)}</b>`,
          });
        }
        const [p, q] = depart;
        const pieges = simplifie
          ? [[a, q], [p, b], [p - (p - a), q - (p - a)], [b, a], [a + 1, b]] // 6/8 → 3/5 : on a enlevé 3 en haut et en bas
          : [[a + f, b + f], [a * f, b], [a, b * f], [b * f, a * f], [a * f + 1, b * f]]; // 2/3 → 4/5 : on a ajouté 2 en haut et en bas
        return choix({
          consigne: 'Des fractions égales',
          enonce: `Quelle fraction est égale à ${frac(p, q)} ?`,
          reponse: fracTexte(...arrivee),
          pieges: piegesFractions(arrivee[0], arrivee[1], pieges),
          explication: `On ${simplifie ? 'divise' : 'multiplie'} le numérateur <b>et</b> le dénominateur par ${f} : `
            + `${frac(p, q)} = <b>${frac(...arrivee)}</b>.<br>⚠️ Ajouter ou enlever le même nombre en haut et en bas ne donne pas une fraction égale.`,
        });
      }
      if (sorte === 'simplifier') {
        let a, b, k;
        do {
          [a, b] = Math.random() < 0.25 ? fractionSimple(5, true) : fractionSimple(9);
          k = parmi([2, 3, 4, 5, 6, 6, 8, 9, 10, 12]);
        } while (b * k > 99);
        const [p, q] = [a * k, b * k];
        const partiels = diviseursPropres(k);
        const explication = `${p} et ${q} sont tous les deux dans la table de ${k} : on les divise par <b>${k}</b>.<br>`
          + `${frac(p, q)} = <b>${frac(a, b)}</b>, et ${a} et ${b} n’ont plus de diviseur commun (à part 1) : c’est irréductible.`
          + (partiels.length ? `<br>(On peut aussi simplifier en plusieurs fois : par ${partiels[0]}, puis par ${k / partiels[0]}.)` : '');
        if (Math.random() < 0.5) {
          return fraction({ consigne: 'Simplifie au maximum', enonce: `${frac(p, q)} = ___`, n: a, d: b, irreductible: true, explication });
        }
        // Une simplification pas finie (égale, mais pas irréductible), et des erreurs
        const [m] = RM.melanger(partiels);
        const autres = RM.melanger(piegesFractions(a, b, [[a, q], [p, b], [b, a], [a + 1, b], [a, b + 1]]));
        const egale = m ? piegesFractions(a, b, [], [[p / m, q / m]]) : [];
        return choix({
          consigne: 'Simplifie au maximum',
          enonce: `Quelle est la fraction irréductible égale à ${frac(p, q)} ?`,
          reponse: fracTexte(a, b),
          pieges: [...egale, ...autres].slice(0, 3),
          explication: explication + (m ? `<br>⚠️ ${frac(p / m, q / m)} est égale, mais on peut encore la simplifier.` : ''),
        });
      }
      if (sorte === 'comparer') {
        const f = deuxFractions();
        return choix({
          consigne: 'Compare ces deux nombres',
          enonce: `${ecrireFraction(f[0], f[1])} ___ ${ecrireFraction(f[2], f[3])}`,
          reponse: signe(f[0] / f[1], f[2] / f[3]),
          choix: ['<', '=', '>'],
          explication: expliquerComparaisonFractions(f),
        });
      }
      if (sorte === 'decimal') {
        if (Math.random() < 0.5) {
          // 3/4 = 0,75 : la fraction est un quotient
          const d = parmi([2, 4, 4, 5, 10, 20, 25]);
          const maxi = { 2: 9, 4: 15, 5: 14, 10: 29, 20: 19, 25: 24 }[d];
          let n;
          do { n = entier(1, maxi); } while (n % d === 0);
          const x = net(n / d);
          return choix({
            consigne: 'Quel nombre décimal est égal à cette fraction ?',
            enonce: `${frac(n, d)} = ___`,
            reponse: x,
            // 3/4 → 3,4 (la barre de fraction prise pour une virgule : l'erreur dont parle Roxy, toujours là),
            // 4,3 ou 0,34, ou la virgule mal placée
            // (3,4 est toujours plus grand que la réponse et 0,34 plus petit : on garde l'un ou l'autre, pour varier sa place)
            ...avecErreur(x, RM.melanger([Number(`${n}.${d}`), Number(`0.${n}${d}`)]),
              [Number(`${n}.${d}`), Number(`${d}.${n}`), Number(`0.${n}${d}`), x * 10, x / 10, Number(`0.${n}`)]),
            explication: `${frac(n, d)} = ${d === 20 || d === 25 ? frac(n * 100 / d, 100) : `${n} ÷ ${d}`} = <b>${ecrire(x)}</b> `
              + `(vérifie : ${ecrire(x)} × ${d} = ${n}).<br>⚠️ La barre de fraction n’est pas une virgule !`,
          });
        }
        // 0,75 = ___/4
        const d = parmi([2, 4, 5, 10]);
        let n;
        do { n = entier(1, 3 * d); } while (n % d === 0);
        const x = net(n / d);
        return nombre({
          consigne: 'Complète',
          enonce: `${ecrire(x)} = ${frac('___', d)}`,
          reponse: n,
          explication: `${ecrire(x)} × ${d} = ${n}, donc ${ecrire(x)} = ${n} ÷ ${d} = <b>${frac(n, d)}</b>.`,
        });
      }
      if (sorte === 'quantite') {
        const [k, d] = fractionSimple(parmi([4, 5, 6, 8, 10]));
        const p = unEnfant();
        const situations = [
          { min: 12, max: 60, texte: Q => `${p.nom} a ${Q} billes. ${p.Il} en donne ${lesFraction(k, d)} à sa sœur. Combien de billes donne-t-${p.il} ?`,
            unite: 'billes' },
          { min: 40, max: 160, texte: Q => `Un livre a ${Q} pages. ${p.nom} en a lu ${lesFraction(k, d)}. Combien de pages a-t-${p.il} lues ?`, unite: 'pages' },
          { min: 20, max: 30, texte: Q => `Dans une classe de ${Q} élèves, ${lesFraction(k, d)} des élèves mangent à la cantine. Combien d’élèves cela fait-il ?`,
            unite: 'élèves' },
          { min: 20, max: 120, texte: Q => `Calcule ${lesFraction(k, d)} de ${Q}.`, unite: '' },
        ];
        if (60 % d === 0) situations.push({ min: 60, max: 60, texte: () => `Combien de minutes y a-t-il dans ${lesFraction(k, d)} d’une heure ?`, unite: 'min' });
        const situation = parmi(situations);
        const possibles = [];
        for (let q = d * Math.max(2, Math.ceil(situation.min / d)); q <= situation.max; q += d) possibles.push(q);
        const Q = parmi(possibles);
        const m = Q / d;
        const reponse = m * k;
        const explication = `${Q} ÷ ${d} = ${m} : c’est ${frac(1, d)} de ${Q}.`
          + (k > 1 ? `<br>Puis ${m} × ${k} = <b>${reponse}</b> : ce sont les ${frac(k, d)} de ${Q}.` : `<br>La réponse est <b>${reponse}</b>.`);
        if (Math.random() < 0.5) {
          return nombre({ consigne: 'Une fraction d’une quantité', enonce: situation.texte(Q), reponse, unite: situation.unite, explication });
        }
        return choix({
          consigne: 'Une fraction d’une quantité',
          enonce: `Combien font ${lesFraction(k, d)} de ${Q} ?`,
          reponse,
          // Toujours « une seule part » (ou « ce qui reste » pour 1/d), puis d'autres erreurs : ce qui reste, diviser par le numérateur,
          // la fraction retournée (Q × d ÷ k), oublier de diviser, une part de trop ou de moins, se tromper de fraction (1/3 ↔ 1/4)
          // (pour 1/d, l'erreur gardée est « ce qui reste » ou « la mauvaise fraction » (1/3 ↔ 1/4), au hasard)
          ...avecErreur(reponse, k > 1 ? [m] : RM.melanger([Q - reponse, Q % (d + 1) === 0 ? Q / (d + 1) : null,
            d > 2 && Q % (d - 1) === 0 ? Q / (d - 1) : null]), [Q - reponse, k > 1 && Q % k === 0 ? Q / k : null,
            k > 1 && (Q * d) % k === 0 ? Q * d / k : null, Q * k, reponse + m, reponse - m,
            Q % (d + 1) === 0 ? Q / (d + 1) : null, d > 2 && Q % (d - 1) === 0 ? Q / (d - 1) : null,
            // pour 1/d : multiplier au lieu de diviser, ou soustraire d
            k === 1 ? Q * d : null, k === 1 ? Q - d : null], [Q, reponse + d]),
          explication,
        });
      }
      if (sorte === 'plusGrande') {
        // 4 fractions dont les dénominateurs sont multiples l'un de l'autre (3 et 6, 4 et 8…)
        const d0 = entier(2, 5);
        const D = d0 * (d0 <= 3 ? parmi([2, 3, 4]) : 2);
        let liste;
        do {
          liste = Array.from({ length: 4 }, (_, i) => {
            const den = i < 2 ? D : parmi([d0, D]);
            let n;
            do { n = entier(1, 2 * den - 1); } while (n % den === 0 || pgcd(n, den) !== 1);
            return [n, den];
          });
        } while (new Set(liste.map(([n, den]) => n * D / den)).size < 4 || !liste.some(([, den]) => den === d0));
        const plusGrande = Math.random() < 0.5;
        const valeur = ([n, den]) => n * D / den;
        const rangees = [...liste].sort((u, v) => valeur(u) - valeur(v));
        const bonne = plusGrande ? rangees[3] : rangees[0];
        return choix({
          consigne: 'Compare les fractions',
          enonce: `Quelle est la plus ${plusGrande ? 'grande' : 'petite'} de ces fractions ?`,
          reponse: fracTexte(...bonne),
          pieges: liste.filter(f => f !== bonne).map(f => fracTexte(...f)),
          explication: `Avec le même dénominateur ${D} : ${liste.map(([n, den]) => (den === D ? frac(n, den) : `${frac(n, den)} = ${frac(n * D / den, D)}`)).join(' ; ')}.<br>`
            + `La plus ${plusGrande ? 'grande' : 'petite'} est <b>${frac(...bonne)}</b>.`,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['egales', 'egales', 'decimal', 'comparer']);
      if (genre === 'egales') {
        const [a, b] = fractionSimple(9);
        const f = entier(2, 5);
        return vraiFaux({
          enonce: `${frac(a, b)} = ${vrai ? frac(a * f, b * f) : frac(a + f, b + f)}`,
          vrai,
          explication: vrai
            ? `On a multiplié le numérateur et le dénominateur par ${f} : <b>${frac(a, b)} = ${frac(a * f, b * f)}</b>.`
            : `Ajouter ${f} en haut et en bas ne donne pas une fraction égale. En multipliant par ${f} : ${frac(a, b)} = <b>${frac(a * f, b * f)}</b>.`,
        });
      }
      if (genre === 'decimal') {
        const d = parmi([2, 4, 5]);
        let n;
        do { n = entier(1, 3 * d); } while (n % d === 0);
        const x = net(n / d);
        // La barre prise pour une virgule (3/4 → 3,4), ou la virgule mal placée (7,5 ou 0,075)
        const faux = parmi([Number(`${n}.${d}`), Number(`${n}.${d}`), net(x * 10), net(x / 10)]);
        return vraiFaux({
          enonce: `${frac(n, d)} = ${ecrire(vrai ? x : faux)}`,
          vrai,
          explication: `${frac(n, d)} = ${n} ÷ ${d} = <b>${ecrire(x)}</b>.`
            + (!vrai && egaux(faux, Number(`${n}.${d}`)) ? '<br>⚠️ La barre de fraction n’est pas une virgule !' : ''),
        });
      }
      let f;
      do { f = deuxFractions(); } while (egaux(f[0] / f[1], f[2] / f[3]));
      const s = signe(f[0] / f[1], f[2] / f[3]);
      const dit = vrai ? s : (s === '<' ? '>' : '<');
      return vraiFaux({
        enonce: `${ecrireFraction(f[0], f[1])} ${HTML[dit]} ${ecrireFraction(f[2], f[3])}`,
        vrai,
        explication: expliquerComparaisonFractions(f),
      });
    },
    titreLecon: 'Fractions égales',
    lecon: `
      <h4>Des fractions égales</h4>
      <p>Une fraction ne change pas si on <b>multiplie</b> (ou si on <b>divise</b>) son numérateur <b>et</b> son dénominateur
        par le même nombre (pas zéro).</p>
      <p>👉 ${frac(3, 5)} = ${frac(12, 20)} (× 4) · ${frac(18, 24)} = ${frac(3, 4)} (÷ 6)</p>
      <p>⚠️ Ajouter le même nombre en haut et en bas ne marche pas : ${frac(1, 2)} ≠ ${frac(2, 3)}.</p>
      <h4>Simplifier</h4>
      <p>Simplifier, c’est diviser le numérateur et le dénominateur par un même nombre. Une fraction est <b>irréductible</b>
        quand on ne peut plus la simplifier : ${frac(18, 24)} = ${frac(9, 12)} = ${frac(3, 4)} (irréductible).</p>
      <h4>Comparer</h4>
      <p>• Même dénominateur : on compare les numérateurs. ${frac(3, 7)} &lt; ${frac(5, 7)}<br>
        • Un dénominateur multiple de l’autre : on les écrit avec le même dénominateur. ${frac(2, 3)} = ${frac(4, 6)}, et ${frac(4, 6)} &lt; ${frac(5, 6)}<br>
        • Comparer à 1 : ${frac(3, 5)} &lt; 1 · ${frac(5, 5)} = 1 · ${frac(7, 5)} &gt; 1 (numérateur plus grand que le dénominateur)</p>
      <h4>Fraction et nombre décimal, fraction d’une quantité</h4>
      <p>Une fraction est un quotient : ${frac(3, 4)} = 3 ÷ 4 = <b>0,75</b> · ${frac(7, 5)} = 1,4 · ${frac(1, 2)} = 0,5<br>
        Les ${frac(3, 5)} de 40 : 40 ÷ 5 = 8, puis 8 × 3 = <b>24</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour simplifier, pense aux tables et aux critères de divisibilité :
        18 et 24 sont pairs → ÷ 2 ; 9 et 12 sont dans la table de 3 → ÷ 3. Continue tant que c’est possible !</div>
    `,
  });

  // ======================================================================
  // 5. Additionner et soustraire des fractions
  // ======================================================================
  // La fin de l'explication : le résultat, et sa forme simplifiée s'il y en a une
  function resultatFraction(n, d) {
    const [a, b] = simplifier(n, d);
    if (b === d) return `<b>${frac(n, d)}</b>`;
    return `<b>${frac(n, d)}</b>${b === 1 ? ` = ${a}` : ` (on peut simplifier : ${frac(n, d)} = ${frac(a, b)})`}`;
  }

  // Deux fractions dont un dénominateur est multiple de l'autre : a/d et b/D, avec D = k × d
  // (dans un ordre ou dans l'autre ; soustraction : le résultat est positif)
  function fractionsMultiples(plus) {
    for (;;) {
      const d = entier(2, 6);
      const k = entier(2, d <= 3 ? 4 : 3);
      const D = k * d;
      const a = entier(1, d - 1);
      const b = entier(1, D - 1);
      // (des fractions qu'on ne peut pas simplifier : pas 2/4 + 2/8)
      if (pgcd(a, d) === 1 && pgcd(b, D) === 1) {
        const premiereGrande = Math.random() < 0.5; // b/D en premier ?
        const [n1, d1, n2, d2] = premiereGrande ? [b, D, a, d] : [a, d, b, D];
        const total = plus ? k * a + b : (premiereGrande ? b - k * a : k * a - b);
        if (total > 0) return { d, D, k, a, b, n1, d1, n2, d2, total };
      }
    }
  }

  function expliquerMultiples({ d, D, k, a, n1, d1, n2, d2, total }, plus) {
    const op = plus ? '+' : '−';
    const [m1, m2] = [d1 === d ? k * n1 : n1, d2 === d ? k * n2 : n2];
    return `${D} = ${d} × ${k} : on écrit ${frac(a, d)} = ${frac(k * a, D)}.<br>`
      + `${frac(n1, d1)} ${op} ${frac(n2, d2)} = ${frac(m1, D)} ${op} ${frac(m2, D)} = ${resultatFraction(total, D)}`;
  }

  // Les situations des problèmes : deux parts d'un tout (la tarte, le trajet, le jardin, la bouteille)
  function problemeDeFractions() {
    const [p1, p2] = deuxEnfants();
    let f;
    do { f = fractionsMultiples(true); } while (f.total >= f.D);
    const reste = Math.random() < 0.4;
    const [x, y] = [frac(f.n1, f.d1), frac(f.n2, f.d2)];
    const situation = parmi([
      { texte: `${p1.nom} mange ${x} d’une tarte et ${p2.nom} en mange ${y}.`,
        question: reste ? 'Quelle fraction de la tarte reste-t-il ?' : 'Quelle fraction de la tarte ont-ils mangée en tout ?' },
      { texte: `Pour aller chez Mamie, ${p1.nom} fait ${x} du trajet à vélo le matin et ${y} du trajet l’après-midi.`,
        question: reste ? 'Quelle fraction du trajet lui reste-t-il à faire ?' : 'Quelle fraction du trajet a-t-il fait en tout ?' },
      { texte: `Papi plante des tomates sur ${x} de son jardin et des salades sur ${y} du jardin.`,
        question: reste ? 'Quelle fraction du jardin n’est pas plantée ?' : 'Quelle fraction du jardin est plantée ?' },
      { texte: `${p1.nom} boit ${x} d’une bouteille de jus et ${p2.nom} en boit ${y}.`,
        question: reste ? 'Quelle fraction de la bouteille reste-t-il ?' : 'Quelle fraction de la bouteille ont-ils bue en tout ?' },
    ]);
    // On accorde avec les enfants : « a-t-elle faite », « ont-elles mangée »
    const ils = p1.il === 'elle' && p2.il === 'elle' ? 'elles' : 'ils';
    const question = situation.question.replace('a-t-il fait', `a-t-${p1.il} faite`).replace('ont-ils', `ont-${ils}`);
    const n = reste ? f.D - f.total : f.total;
    const explication = expliquerMultiples(f, true)
      + (reste ? `.<br>Le tout, c’est ${frac(f.D, f.D)} : ${frac(f.D, f.D)} − ${frac(f.total, f.D)} = ${resultatFraction(n, f.D)}` : '');
    return { enonce: `${situation.texte} ${question}`, n, D: f.D, f, reste, explication: `${explication}.` };
  }

  ajouterEtape({
    id: '5e-nombres-fractions-addition',
    banque: ['memeDeno', 'memeDeno', 'multiples', 'multiples', 'choix', 'choix', 'choix', 'entier', 'probleme', 'probleme', 'convertir',
      'vraiFaux'],
    creerQuestion(sorte) {
      const plus = Math.random() < 0.6;
      const op = plus ? '+' : '−';
      if (sorte === 'memeDeno' || (sorte === 'choix' && Math.random() < 0.4)) {
        const d = entier(3, 12);
        let n1, n2;
        do { [n1, n2] = [entier(1, 2 * d - 1), entier(1, d - 1)]; } while ((!plus && n1 <= n2) || n1 === d);
        const n = plus ? n1 + n2 : n1 - n2;
        const explication = `Même dénominateur : on ${plus ? 'additionne' : 'soustrait'} les numérateurs et on <b>garde</b> le dénominateur.<br>`
          + `${frac(n1, d)} ${op} ${frac(n2, d)} = ${frac(`${n1} ${op} ${n2}`, d)} = ${resultatFraction(n, d)}.`
          + (plus ? `<br>⚠️ Pas ${frac(n, 2 * d)} : on n’additionne pas les dénominateurs !` : '');
        if (sorte === 'memeDeno' && Math.random() < 0.5) {
          return fraction({ consigne: 'Calcule (inutile de simplifier)', enonce: `${frac(n1, d)} ${op} ${frac(n2, d)} = ___`, n, d, irreductible: false, explication });
        }
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${frac(n1, d)} ${op} ${frac(n2, d)} = ___`,
          reponse: fracTexte(n, d),
          // Pour +, toujours l'erreur dont parle Roxy (les dénominateurs additionnés), puis d'autres :
          // les dénominateurs multipliés (13/49), une erreur de calcul, soustraire au lieu d'additionner (ou l'inverse)
          garder: plus ? piegesFractions(n, d, [[n, 2 * d]]) : [],
          pieges: piegesFractions(n, d, plus
            ? [[n, 2 * d], [n, d * d], [n + 1, d], [n - 1, d], [n1 - n2, d]]
            : [[n1 + n2, d], [n + 1, d], [n - 1, d], [n + 2, d], [n1 + n2, 2 * d], [n + 3, d]]),

          explication,
        });
      }
      if (sorte === 'multiples' || sorte === 'choix') {
        const f = fractionsMultiples(plus);
        const enonce = `${frac(f.n1, f.d1)} ${op} ${frac(f.n2, f.d2)} = ___`;
        const [a, b] = simplifier(f.total, f.D);
        if (sorte === 'multiples' && Math.random() < 0.5) {
          // Parfois, on demande de simplifier au maximum (seulement si c'est possible)
          const irreductible = b !== f.D && Math.random() < 0.5;
          return fraction({
            consigne: irreductible ? 'Calcule et simplifie au maximum' : 'Calcule (inutile de simplifier)',
            enonce,
            n: irreductible ? a : f.total,
            d: irreductible ? b : f.D,
            irreductible,
            explication: expliquerMultiples(f, plus) + '.',
          });
        }
        // Les erreurs classiques : additionner les numérateurs et les dénominateurs, oublier de changer le numérateur
        const faux = plus
          ? [[f.n1 + f.n2, f.d1 + f.d2], [f.n1 + f.n2, f.D], [f.n1 + f.n2, f.d1 * f.d2], [f.total + 1, f.D], [f.total, f.D + f.d]]
          : [[Math.abs(f.n1 - f.n2), Math.abs(f.d1 - f.d2)], [Math.abs(f.n1 - f.n2), f.D], [f.total + 1, f.D], [f.total - 1, f.D],
            [f.total + 2, f.D], [f.total, f.D + f.d], [f.n1 + f.n2, f.D]];
        const tous = piegesFractions(f.total, f.D, faux);
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce,
          reponse: fracTexte(f.total, f.D),
          pieges: [...tous.slice(0, 2), ...RM.melanger(tous.slice(2))].slice(0, 3),
          explication: expliquerMultiples(f, plus) + (plus ? `.<br>⚠️ Pas ${frac(f.n1 + f.n2, f.d1 + f.d2)} : on n’additionne pas les dénominateurs !` : '.'),
        });
      }
      if (sorte === 'entier') {
        const e = entier(1, 3);
        const [a, b] = fractionSimple(9);
        const n = plus ? e * b + a : e * b - a;
        const explication = `On écrit ${e} avec le dénominateur ${b} : ${e} = ${frac(e * b, b)} (car ${e} × ${b} = ${e * b}).<br>`
          + `${e} ${op} ${frac(a, b)} = ${frac(e * b, b)} ${op} ${frac(a, b)} = <b>${frac(n, b)}</b>.`;
        const enonce = `${e} ${op} ${frac(a, b)} = ___`;
        if (Math.random() < 0.5) return fraction({ consigne: 'Calcule (inutile de simplifier)', enonce, n, d: b, irreductible: false, explication });
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce,
          reponse: fracTexte(n, b),
          // 2 + 3/4 → 5/4 (l'entier ajouté au numérateur), 5/5 (ajouté en haut et en bas)
          pieges: piegesFractions(n, b, [[plus ? e + a : Math.abs(e - a), b], [plus ? e + a : Math.abs(e - a), b + 1],
            ...RM.melanger([[n + 1, b], [n - 1, b], [plus ? e * b - a : e * b + a, b]]), [n + 2, b]]).slice(0, 3),
          explication,
        });
      }
      if (sorte === 'probleme') {
        const pb = problemeDeFractions();
        if (Math.random() < 0.5) {
          return fraction({ consigne: 'Résous le problème (inutile de simplifier)', enonce: pb.enonce, n: pb.n, d: pb.D, irreductible: false,
            explication: pb.explication });
        }
        const { f } = pb;
        // Additionner les dénominateurs, oublier de changer une fraction, donner le total au lieu du reste (ou l'inverse)
        return choix({
          consigne: 'Résous le problème',
          enonce: pb.enonce,
          reponse: fracTexte(pb.n, pb.D),
          pieges: piegesFractions(pb.n, pb.D, [pb.reste ? [f.total, f.D] : [f.D - f.total, f.D], [f.n1 + f.n2, f.d1 + f.d2],
            ...RM.melanger([[f.n1 + f.n2, f.D], [pb.n + 1, pb.D], [pb.n - 1, pb.D]])]).slice(0, 3),
          explication: pb.explication,
        });
      }
      if (sorte === 'convertir') {
        const f = fractionsMultiples(plus);
        const [petite, grande] = f.d1 === f.d ? [[f.n1, f.d1], [f.n2, f.d2]] : [[f.n2, f.d2], [f.n1, f.d1]];
        const trou = frac('___', f.D);
        const ecrit = f.d1 === f.d ? `${trou} ${op} ${frac(...grande)}` : `${frac(...grande)} ${op} ${trou}`;
        return nombre({
          consigne: 'Mets au même dénominateur',
          enonce: `${frac(f.n1, f.d1)} ${op} ${frac(f.n2, f.d2)} = ${ecrit}`,
          reponse: f.k * petite[0],
          explication: `${f.D} = ${f.d} × ${f.k} : on multiplie le numérateur <b>et</b> le dénominateur de ${frac(...petite)} par ${f.k}.<br>`
            + `${frac(...petite)} = ${frac(`${petite[0]} × ${f.k}`, `${f.d} × ${f.k}`)} = <b>${frac(f.k * petite[0], f.D)}</b>`,
        });
      }
      // Vrai ou faux : additionner les dénominateurs, l'erreur classique
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.5) {
        const d = entier(3, 9);
        const [n1, n2] = [entier(1, d - 1), entier(1, d - 1)];
        return vraiFaux({
          enonce: `${frac(n1, d)} + ${frac(n2, d)} = ${vrai ? frac(n1 + n2, d) : frac(n1 + n2, 2 * d)}`,
          vrai,
          explication: `Même dénominateur : on additionne les numérateurs et on <b>garde</b> le dénominateur : `
            + `${frac(n1, d)} + ${frac(n2, d)} = <b>${frac(n1 + n2, d)}</b>.`,
        });
      }
      const f = fractionsMultiples(true);
      return vraiFaux({
        enonce: `${frac(f.n1, f.d1)} + ${frac(f.n2, f.d2)} = ${vrai ? frac(f.total, f.D) : frac(f.n1 + f.n2, f.d1 + f.d2)}`,
        vrai,
        explication: `${expliquerMultiples(f, true)}.${vrai ? '' : '<br>⚠️ On n’additionne pas les dénominateurs !'}`,
      });
    },
    titreLecon: 'Additionner des fractions',
    lecon: `
      <h4>Même dénominateur</h4>
      <p>On additionne (ou on soustrait) les <b>numérateurs</b>, et on <b>garde</b> le dénominateur :<br>
        👉 ${frac(3, 7)} + ${frac(2, 7)} = ${frac(5, 7)} · ${frac(5, 9)} − ${frac(2, 9)} = ${frac(3, 9)}</p>
      <p>⚠️ On n’additionne pas les dénominateurs : ${frac(3, 7)} + ${frac(2, 7)} ≠ ${frac(5, 14)} !</p>
      <h4>Un dénominateur multiple de l’autre</h4>
      <p>On écrit d’abord les deux fractions avec le <b>même dénominateur</b> :<br>
        👉 ${frac(1, 2)} + ${frac(1, 4)} = ${frac(2, 4)} + ${frac(1, 4)} = ${frac(3, 4)} · ${frac(2, 3)} − ${frac(1, 6)} = ${frac(4, 6)} − ${frac(1, 6)} = ${frac(3, 6)}</p>
      <h4>Un entier et une fraction</h4>
      <p>On écrit l’entier comme une fraction : 👉 2 + ${frac(3, 4)} = ${frac(8, 4)} + ${frac(3, 4)} = ${frac(11, 4)} · 1 − ${frac(2, 5)} = ${frac(5, 5)} − ${frac(2, 5)} = ${frac(3, 5)}</p>
      <h4>Faut-il simplifier ?</h4>
      <p>Si la consigne dit « simplifie au maximum », on simplifie jusqu’à la fraction <b>irréductible</b> : ${frac(3, 6)} = ${frac(1, 2)}.
        Sinon, une fraction égale au résultat est juste aussi.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pense à une tarte coupée en 8 ! ${frac(1, 4)} + ${frac(3, 8)} = ${frac(2, 8)} + ${frac(3, 8)} = ${frac(5, 8)}
        de la tarte, et il en reste ${frac(8, 8)} − ${frac(5, 8)} = ${frac(3, 8)}.</div>
    `,
  });

  // ======================================================================
  // 6. Le calcul littéral
  // ======================================================================
  const LETTRES = ['x', 'x', 'x', 'a', 'n', 'y', 't'];
  // 1x s'écrit x : terme(1, 'x') → « x » ; terme(3, 'x') → « 3x »
  const terme = (k, L) => (k === 1 ? L : `${k}${L}`);
  // 3 et 4 écrits l'un contre l'autre : collés(3, 4) → 34 (l'erreur de « 3x pour x = 4 »)
  const colles = (a, v) => Number(`${a}${v}`);

  // Une expression avec une lettre, sa valeur pour lettre = v, le calcul détaillé et les erreurs classiques
  function expressionAvecLettre() {
    const L = parmi(LETTRES);
    const v = entier(2, 9);
    const e = parmi([
      () => {
        const [a, b] = [entier(2, 9), entier(1, 15)];
        return { texte: `${a}${L} + ${b}`, valeur: a * v + b, detail: `${a} × ${v} + ${b} = ${a * v} + ${b}`,
          faux: [colles(a, v) + b, a + v + b, a * (v + b), a * v - b, a * v + b + a, a * v + b - a],
          attention: `${a}${L}, c’est ${a} × ${L} : pas ${colles(a, v)} !` };
      },
      () => {
        const a = entier(2, 9);
        const b = entier(1, Math.min(15, a * v - 1));
        return { texte: `${a}${L} − ${b}`, valeur: a * v - b, detail: `${a} × ${v} − ${b} = ${a * v} − ${b}`,
          faux: [colles(a, v) - b, a + v - b, v > b ? a * (v - b) : null, a * v + b, a * v - b + a, a * v - b - a],
          attention: `${a}${L}, c’est ${a} × ${L} : pas ${colles(a, v)} !` };
      },
      () => {
        // (pas la valeur 2 : 2² = 2 × 2 = 2 + 2, l'erreur classique serait juste)
        const b = entier(1, 20);
        const w = entier(3, 9);
        return { v: w, texte: `${L}² + ${b}`, valeur: w * w + b, detail: `${w} × ${w} + ${b} = ${w * w} + ${b}`,
          faux: [2 * w + b, w + 2 + b, w * w + b + w, w * w + b - w, w * w - b], attention: `${L}², c’est ${L} × ${L} : pas 2 × ${L} !` };
      },
      () => {
        const a = entier(2, 5);
        const w = entier(3, 6);
        return { v: w, texte: `${a}${L}²`, valeur: a * w * w, detail: `${a} × ${w} × ${w} = ${a} × ${w * w}`,
          faux: [(a * w) * (a * w), 2 * a * w, a * w, a * w * w + a * w, a * w * w - a * w],
          attention: `${a}${L}², c’est ${a} × ${L}² : seul ${L} est au carré (pas ${a * w} × ${a * w} = ${a * w * a * w}).` };
      },
      () => {
        const [a, b] = [entier(2, 9), entier(1, 9)];
        return { texte: `${a}(${L} + ${b})`, valeur: a * (v + b), detail: `${a} × (${v} + ${b}) = ${a} × ${v + b}`,
          faux: [a * v + b, colles(a, v) + b, a + v + b, a * (v + b) + a, a * (v + b) - a],
          attention: `${a}(${L} + ${b}), c’est ${a} × (${L} + ${b}) : pas ${a} × ${v} + ${b} = ${a * v + b} !` };
      },
      () => {
        const a = entier(2, 9);
        const b = entier(1, v - 1);
        return { texte: `${a}(${L} − ${b})`, valeur: a * (v - b), detail: `${a} × (${v} − ${b}) = ${a} × ${v - b}`,
          faux: [a * v - b, colles(a, v) - b, a + v - b, a * (v - b) + a, a * (v - b) - a],
          attention: `${a}(${L} − ${b}), c’est ${a} × (${L} − ${b}) : pas ${a} × ${v} − ${b} = ${a * v - b} !` };
      },
    ])();
    return { L, v, ...e };
  }

  const expliquerValeur = e => `On remplace ${e.L} par ${e.v} : ${e.texte} = ${e.detail} = <b>${e.valeur}</b>.<br>⚠️ ${e.attention}`;

  // Une égalité a × x + b = c × x + d, vraie pour une seule valeur s de x (de 2 à 7)
  function egaliteATester() {
    const [c, s] = [entier(1, 5), entier(2, 7)];
    const a = c + entier(1, 4);
    const b = entier(1, 15);
    const d = (a - c) * s + b;
    const membre = (k, n, x) => `${k === 1 ? '' : `${k} × `}${x} + ${n} = ${k * x + n}`;
    return {
      s,
      gauche: `${terme(a, 'x')} + ${b}`,
      droite: `${terme(c, 'x')} + ${d}`,
      valeurs: x => [a * x + b, c * x + d],
      membres: x => `${membre(a, b, x)} et ${membre(c, d, x)}`,
    };
  }


  // Traduire une phrase par une expression littérale (une seule bonne écriture parmi les boutons)
  const MULTIPLES = { 2: 'double', 3: 'triple', 4: 'quadruple' };
  function phraseAEcrire() {
    return parmi([
      () => ({ phrase: 'le périmètre d’un carré de côté c', bon: '4c', pieges: ['c + 4', 'c²', '2c'],
        aide: 'Un carré a 4 côtés de longueur c : c + c + c + c = 4 × c = <b>4c</b>.' }),
      () => ({ phrase: 'l’aire d’un carré de côté c', bon: 'c²', pieges: ['4c', '2c', 'c + 2'],
        aide: 'Aire du carré : côté × côté = c × c = <b>c²</b>.' }),
      () => ({ phrase: 'le périmètre d’un rectangle de longueur a et de largeur b', bon: '2a + 2b', pieges: ['a + b', 'ab', '2ab'],
        aide: 'On fait le tour : a + b + a + b = <b>2a + 2b</b>.' }),
      () => ({ phrase: 'l’aire d’un rectangle de longueur a et de largeur b', bon: 'ab', pieges: ['2a + 2b', 'a + b', '2ab'],
        aide: 'Aire du rectangle : longueur × largeur = a × b = <b>ab</b>.' }),
      () => ({ phrase: 'le périmètre d’un triangle équilatéral de côté x', bon: '3x', pieges: ['x³', 'x + 3', 'x²'],
        aide: 'Trois côtés de longueur x : x + x + x = <b>3x</b>. (x³, c’est x × x × x.)' }),
      () => ({ phrase: 'le double de x', bon: '2x', pieges: ['x²', 'x + 2', 'x ÷ 2'],
        aide: 'Le double, c’est 2 fois : 2 × x = <b>2x</b>. (x², c’est le carré de x.)' }),
      () => ({ phrase: 'le carré de x', bon: 'x²', pieges: ['2x', 'x + 2', 'x³'],
        aide: 'Le carré de x, c’est x × x = <b>x²</b>. (2x, c’est le double de x.)' }),
      () => ({ phrase: 'la moitié de n', bon: 'n ÷ 2', pieges: ['2n', 'n − 2', 'n²'],
        aide: 'La moitié, c’est n divisé par 2 : <b>n ÷ 2</b>.' }),
      () => {
        const k = entier(2, 4);
        const m = entierSauf(1, 9, [k]);
        return { phrase: `le ${MULTIPLES[k]} de x, augmenté de ${m}`, bon: `${k}x + ${m}`, pieges: [`${k}(x + ${m})`, `${k} + x + ${m}`, `${m}x + ${k}`],
          aide: `Le ${MULTIPLES[k]} de x, c’est ${k}x ; on lui ajoute ${m} : <b>${k}x + ${m}</b>.` };
      },
      () => {
        const p = entier(2, 6);
        return { phrase: `le prix en euros de n cahiers à ${euros(p)} l’un`, bon: `${p}n`, pieges: [`n + ${p}`, `n ÷ ${p}`, `${p}n + ${p}`],
          aide: `Un cahier coûte ${euros(p)}, n cahiers coûtent ${p} × n = <b>${p}n</b> euros.` };
      },
      () => {
        const k = entier(2, 12);
        return { phrase: `l’âge de Roxy dans ${k} ans, si elle a n ans aujourd’hui`, bon: `n + ${k}`, pieges: [`${k}n`, `n − ${k}`, `${k} − n`],
          aide: `Dans ${k} ans, Roxy aura ${k} ans de plus : <b>n + ${k}</b>.` };
      },
    ])();
  }

  // Les conventions d'écriture : dans un sens (écrire plus simplement) ou dans l'autre (que veut dire…)
  function conventionAuHasard() {
    const [k, m] = [entier(2, 9), entier(2, 9)];
    return parmi([
      () => ({ question: `Comment écrire ${k} × x plus simplement ?`, bon: `${k}x`, pieges: [`${k} + x`, `x${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}`, `${k}x²`],
        aide: `On peut enlever le signe × devant une lettre : ${k} × x = <b>${k}x</b>.` }),
      () => ({ question: 'Comment écrire x × x plus simplement ?', bon: 'x²', pieges: ['2x', 'x + x', '2x²'],
        aide: 'x × x, c’est « x au carré » : <b>x²</b>. (2x, c’est x + x.)' }),
      () => ({ question: 'Comment écrire x × x × x plus simplement ?', bon: 'x³', pieges: ['3x', 'x + 3', '3x³'],
        aide: 'x × x × x, c’est « x au cube » : <b>x³</b>. (3x, c’est x + x + x.)' }),
      () => ({ question: 'Comment écrire a × b plus simplement ?', bon: 'ab', pieges: ['a + b', '2ab', 'a²b'],
        aide: 'On peut enlever le signe × entre deux lettres : a × b = <b>ab</b>.' }),
      () => ({ question: `Comment écrire ${k} × (x + ${m}) plus simplement ?`, bon: `${k}(x + ${m})`, pieges: [`${k}x + ${m}`, `${k} + x + ${m}`, `x + ${k * m}`],
        aide: `On peut enlever le signe × devant une parenthèse : ${k} × (x + ${m}) = <b>${k}(x + ${m})</b>. ${k}x + ${m}, c’est autre chose !` }),
      () => ({ question: `Que veut dire ${k}x² ?`, bon: `${k} × x × x`, pieges: [`${k} × x × 2`, `${k} × x + x`, `(${k} × x)²`],
        aide: `${k}x² = ${k} × x², et x² = x × x : <b>${k}x² = ${k} × x × x</b>. Seul x est au carré.` }),
      () => ({ question: `Que veut dire ${k}x + ${m} ?`, bon: `${k} × x + ${m}`, pieges: [`${k} × (x + ${m})`, `${k} + x + ${m}`, `${k} × x × ${m}`],
        aide: `${k}x, c’est ${k} × x ; on ajoute ensuite ${m} : <b>${k} × x + ${m}</b>.` }),
      () => ({ question: `Que veut dire ${k}ab ?`, bon: `${k} × a × b`, pieges: [`${k} + a + b`, `${k} × a + b`, `${k}a + ${k}b`],
        aide: `Entre un nombre et des lettres, les × sont cachés : <b>${k}ab = ${k} × a × b</b>.` }),
    ])();
  }

  ajouterEtape({
    id: '5e-nombres-calcul-litteral',
    banque: ['valeur', 'valeur', 'valeurChoix', 'valeurChoix', 'valeurChoix', 'convention', 'produire', 'produire', 'tester',
      'reduire', 'reduire', 'distributivite', 'distributivite', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'valeur' || sorte === 'valeurChoix') {
        const e = expressionAvecLettre();
        const commun = { consigne: 'Calcule la valeur de l’expression', enonce: `Pour ${e.L} = ${e.v}, ${e.texte} = ___`, reponse: e.valeur,
          explication: expliquerValeur(e) };
        if (sorte === 'valeur') return nombre(commun);
        const r = e.valeur;
        // L'erreur dont parle Roxy (3x lu 34, x² lu 2x…) est toujours là ; les autres sont d'autres erreurs de lecture ou de table
        return choix({ ...commun, ...avecErreur(r, e.faux.slice(0, 1), e.faux.slice(1), [r + 10, r - 10]) });
      }
      if (sorte === 'convention') {
        const c = conventionAuHasard();
        return choix({ consigne: 'Les règles d’écriture', enonce: c.question, reponse: c.bon, pieges: c.pieges, ordre: 'melange', explication: c.aide });
      }
      if (sorte === 'produire') {
        const p = phraseAEcrire();
        return choix({
          consigne: 'Écris une expression', enonce: `Quelle expression donne ${p.phrase} ?`, reponse: p.bon, pieges: p.pieges, ordre: 'melange', explication: p.aide,
        });
      }
      if (sorte === 'tester') {
        const t = egaliteATester();
        const autre = t.s - 1;
        return choix({
          consigne: 'Teste l’égalité',
          enonce: `Pour quelle valeur de x l’égalité ${t.gauche} = ${t.droite} est-elle vraie ?`,
          reponse: t.s,
          // (d'autres valeurs de x, des deux côtés : le moteur les choisit pour varier la place de la réponse)
          pieges: [t.s - 3, t.s - 2, t.s - 1, t.s + 1, t.s + 2, t.s + 3].filter(v => v > 0),
          explication: `Pour x = ${t.s} : ${t.membres(t.s)}. Les deux membres sont égaux : <b>x = ${t.s}</b>.<br>`
            + `Pour x = ${autre}, on trouve ${t.valeurs(autre).join(' et ')} : ce n’est pas égal.`,
        });
      }
      if (sorte === 'reduire') {
        const L = parmi(LETTRES);
        let p, q;
        // (pas 2 et 2 : 2 + 2 = 2 × 2, deux pièges se confondraient)
        do { [p, q] = [entier(2, 9), entier(2, 9)]; } while (p === 2 && q === 2);
        const r = entierSauf(1, 9, [q]);
        const facon = parmi(['plus', 'plus', 'moins', 'avecNombre', 'avecNombre', 'produit']);
        if (facon === 'plus' || facon === 'moins') {
          const [grand, petit] = [Math.max(p, q) + (p === q ? 1 : 0), Math.min(p, q)];
          const [x, y, res] = facon === 'plus' ? [p, q, p + q] : [grand, petit, grand - petit];
          const op = facon === 'plus' ? '+' : '−';
          const texte = `${x}${L} ${op} ${y}${L}`;
          const explication = `${texte}, c’est ${x} fois ${L} ${facon === 'plus' ? 'plus' : 'moins'} ${y} fois ${L}, `
            + `soit ${x} ${op} ${y} = ${res} fois ${L} : <b>${texte} = ${terme(res, L)}</b>.`;
          if (Math.random() < 0.5 && res > 1) return nombre({ consigne: 'Réduis', enonce: `${texte} = ___${L}`, reponse: res, explication });
          return choix({
            consigne: 'Réduis',
            ordre: 'melange', // (« 5x » ressemble à un nombre avec une unité : on mélange)
            enonce: `${texte} = ___`,
            reponse: terme(res, L),
            garder: facon === 'plus' ? [`${terme(res, L)}²`] : [],
            pieges: [...new Set([`${terme(res, L)}²`, `${x * y}${L}`, facon === 'plus' ? `${res}` : `${x + y}${L}`, `${res + 1}${L}`])]
              .filter(t => t !== terme(res, L)),
            explication: explication + (facon === 'plus' ? `<br>⚠️ Pas ${res}${L}² : on ne multiplie pas ${L} par ${L}, on compte les ${L}.` : ''),
          });
        }
        if (facon === 'avecNombre') {
          // 2x + 3 + 4x = 6x + 3 (et pas 9x !)
          const texte = `${p}${L} + ${r} + ${q}${L}`;
          const bon = `${p + q}${L} + ${r}`;
          return choix({
            consigne: 'Réduis',
            ordre: 'melange', // (« 5x » ressemble à un nombre avec une unité : on mélange)
            enonce: `${texte} = ___`,
            reponse: bon,
            pieges: [`${p + q + r}${L}`, `${p + q}${L}² + ${r}`, `${p + r}${L} + ${q}`],
            explication: `On regroupe les termes en ${L} : ${p}${L} + ${q}${L} = ${p + q}${L}. Le nombre ${r} reste seul : <b>${bon}</b>.<br>`
              + `⚠️ ${p + q}${L} + ${r} ne se réduit pas : ce n’est pas ${p + q + r}${L} !`,
          });
        }
        // Un produit : 3 × x × 4 = 12x
        return choix({
          consigne: 'Réduis',
          ordre: 'melange',
          enonce: `${p} × ${L} × ${q} = ___`,
          reponse: `${p * q}${L}`,
          pieges: [...new Set([`${p + q}${L}`, `${p * q}${L}²`, `${p}${q}${L}`])],
          explication: `On multiplie les nombres entre eux : ${p} × ${q} = ${p * q}. Donc ${p} × ${L} × ${q} = <b>${p * q}${L}</b>.`,
        });
      }
      if (sorte === 'distributivite') {
        if (Math.random() < 0.5) {
          // Développer k(x + b) ou k(x − b)
          const L = parmi(LETTRES);
          let k, b;
          // (pas k = b : « le 3 multiplie aussi le 3 » serait confus ; et 2 + 2 = 2 × 2 rendrait un piège juste)
          do { [k, b] = [entier(2, 9), entier(2, 9)]; } while (k === b);
          const s = Math.random() < 0.4 ? '−' : '+';
          const texte = `${k}(${L} ${s} ${b})`;
          const bon = `${k}${L} ${s} ${k * b}`;
          const explication = `On multiplie ${k} par <b>chaque</b> terme de la parenthèse : ${k} × ${L} ${s} ${k} × ${b} = <b>${bon}</b>.<br>`
            + `⚠️ Pas ${k}${L} ${s} ${b} : le ${k} multiplie aussi le ${b} !`;
          if (Math.random() < 0.3) return nombre({ consigne: 'Développe', enonce: `${texte} = ${k}${L} ${s} ___`, reponse: k * b, explication });
          return choix({
            consigne: 'Développe',
            ordre: 'melange',
            enonce: `${texte} = ___`,
            reponse: bon,
            pieges: s === '+' ? [`${k}${L} + ${b}`, `${L} + ${k * b}`, `${k}${L} + ${k + b}`] : [`${k}${L} − ${b}`, `${k}${L} + ${k * b}`, `${L} − ${k * b}`],
            explication,
          });
        }
        // Le calcul astucieux : 7 × 102 = 7 × 100 + 7 × 2
        const k = entier(3, 9);
        const calcul = parmi([
          () => {
            const m = entier(1, 9);
            return { texte: `${k} × ${100 + m}`, valeur: k * (100 + m),
              detail: `${k} × (100 + ${m}) = ${k} × 100 + ${k} × ${m} = ${100 * k} + ${k * m}` };
          },
          () => {
            const m = entier(1, 3);
            return { texte: `${k} × ${100 - m}`, valeur: k * (100 - m),
              detail: `${k} × (100 − ${m}) = ${k} × 100 − ${k} × ${m} = ${100 * k} − ${k * m}` };
          },
          () => {
            const total = parmi([10, 100, 100]);
            const a = total === 10 ? entier(2, 8) : entier(11, 89);
            return { texte: `${k} × ${a} + ${k} × ${total - a}`, valeur: k * total,
              detail: `${k} × (${a} + ${total - a}) = ${k} × ${total}` };
          },
        ])();
        return nombre({
          consigne: 'Calcule astucieusement (avec la distributivité)',
          enonce: `${calcul.texte} = ___`,
          reponse: calcul.valeur,
          explication: `${calcul.detail} = <b>${ecrire(calcul.valeur)}</b>.<br>La distributivité : k × (a + b) = k × a + k × b `
            + '(et k × (a − b) = k × a − k × b).',
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const L = parmi(LETTRES);
      const genre = parmi(['reduire', 'carre', 'distrib', 'valeur', 'tester']);
      if (genre === 'tester') {
        // « L'égalité … est-elle vraie pour x = … ? », vraie une fois sur deux
        const t = egaliteATester();
        const x = vrai ? t.s : t.s + parmi([-1, 1]);
        return vraiFaux({
          enonce: `L’égalité ${t.gauche} = ${t.droite} est vraie pour x = ${x}.`,
          vrai,
          explication: `Pour x = ${x} : ${t.membres(x)}.<br>`
            + (vrai ? 'Les deux membres sont égaux : <b>l’égalité est vraie</b>.' : 'Les deux membres ne sont pas égaux : <b>l’égalité est fausse</b>.'),
        });
      }
      if (genre === 'reduire') {
        const [p, q] = [entier(2, 9), entier(2, 9)];
        return vraiFaux({
          enonce: `${p}${L} + ${q}${vrai ? L : ''} peut s’écrire ${p + q}${L}.`,
          vrai,
          explication: vrai
            ? `${p} fois ${L} plus ${q} fois ${L}, cela fait ${p + q} fois ${L} : <b>${p}${L} + ${q}${L} = ${p + q}${L}</b>.`
            : `On ne peut pas ajouter des ${L} et des nombres seuls : <b>${p}${L} + ${q}</b> ne se réduit pas.`
              + `<br>Pour ${L} = 2 : ${p}${L} + ${q} = ${2 * p + q}, mais ${p + q}${L} = ${2 * (p + q)}.`,
        });
      }
      if (genre === 'carre') {
        const v = entier(3, 9);
        return vraiFaux({
          enonce: `Pour ${L} = ${v}, ${L}² = ${vrai ? v * v : 2 * v}.`,
          vrai,
          explication: `${L}² = ${L} × ${L}, donc pour ${L} = ${v} : ${L}² = ${v} × ${v} = <b>${v * v}</b>.`
            + (vrai ? '' : `<br>⚠️ ${2 * v}, c’est 2 × ${v} : le double, pas le carré.`),
        });
      }
      if (genre === 'distrib') {
        const [k, b] = [entier(2, 9), entier(2, 9)];
        return vraiFaux({
          enonce: `${k}(${L} + ${b}) = ${k}${L} + ${vrai ? k * b : b}`,
          vrai,
          explication: `On multiplie ${k} par chaque terme : ${k} × ${L} + ${k} × ${b} = <b>${k}${L} + ${k * b}</b>.`,
        });
      }
      const e = expressionAvecLettre();
      const faux = vraisPieges(e.valeur, e.faux)[0];
      return vraiFaux({
        enonce: `Pour ${e.L} = ${e.v}, ${e.texte} = ${vrai || faux === undefined ? e.valeur : faux}.`,
        vrai: vrai || faux === undefined,
        explication: expliquerValeur(e),
      });
    },
    titreLecon: 'Le calcul littéral',
    lecon: `
      <h4>Des lettres à la place des nombres</h4>
      <p>Une <b>expression littérale</b> contient des lettres qui remplacent des nombres. Le périmètre d’un carré de côté c est
        <i>4 × c</i>, quelle que soit la longueur c.</p>
      <h4>Les règles d’écriture</h4>
      <p>On peut enlever le signe × devant une lettre ou une parenthèse : <i>4 × c = 4c</i> · <i>a × b = ab</i> · <i>3 × (x + 2) = 3(x + 2)</i><br>
        <i>x × x = x²</i> (« x au carré ») · <i>x × x × x = x³</i> (« x au cube »)<br>
        ⚠️ <i>x²</i>, c’est x × x, pas 2 × x ! Le <b>double</b> de x, c’est 2x ; son <b>carré</b>, c’est x².</p>
      <h4>Calculer pour une valeur</h4>
      <p>On remplace la lettre par le nombre, et on remet les × : pour x = 4, <i>3x + 2 = 3 × 4 + 2 = 14</i> (et pas 34 !) ·
        <i>x² + 1 = 4 × 4 + 1 = 17</i> · <i>2(x + 1) = 2 × 5 = 10</i></p>
      <p><b>Tester une égalité</b> : les deux <b>membres</b> d’une égalité sont ce qui est à gauche et à droite du signe =.
        2x + 5 = 4x − 1 est-elle vraie pour x = 3 ? On calcule chaque membre :
        2 × 3 + 5 = 11 et 4 × 3 − 1 = 11. Ils sont égaux : oui !</p>
      <h4>Réduire et développer</h4>
      <p><b>Réduire</b>, c’est écrire une expression avec le moins de termes possible. <b>Développer</b>, c’est transformer
        un produit en somme : <i>3(x + 4) = 3x + 12</i>.</p>
      <p><i>2x + 3x = 5x</i> (2 fois x plus 3 fois x, cela fait 5 fois x) · <i>7a − 2a = 5a</i> · <i>3 × x × 4 = 12x</i><br>
        ⚠️ <i>2x + 3</i> ne se réduit pas : ce n’est pas 5x !</p>
      <p>La <b>distributivité</b> : <i>k(a + b) = ka + kb</i> et <i>k(a − b) = ka − kb</i>. 👉 <i>3(x + 4) = 3x + 12</i><br>
        Pour calculer de tête : <i>7 × 102 = 7 × 100 + 7 × 2 = 714</i> · <i>6 × 37 + 6 × 63 = 6 × 100 = 600</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour vérifier un calcul, remplace x par un nombre. Pour x = 2 :
        2x + 3 = 7, mais 5x = 10. Pas pareil : 2x + 3 ≠ 5x !</div>
    `,
  });

  // (fin des étapes)
})();
