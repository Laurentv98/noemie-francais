// Renard Malin — Maths, niveau 3e : les 6 étapes de la Grotte des Nombres
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. les nombres premiers · 2. fractions irréductibles · 3. développer · 4. factoriser ·
// 5. mettre en équation · 6. l’équation produit nul

(function () {
  const {
    entier, parmi, entierSauf, ecrire, decimalesDe, net, francs, mesure, lireNombre, egaux, MOINS, parentheses,
    frac, fracTexte, simplifier, pgcd, ppcm, puissance, puissanceTexte, choix, nombre, fraction, vraiFaux, ajouterEtape,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes, avec leur pronom (des prénoms de toutes les communautés de Nouvelle-Calédonie)
  const ENFANTS = [['Kalia', 'elle'], ['Teva', 'il'], ['Léa', 'elle'], ['Sione', 'il'], ['Wakana', 'elle'], ['Minh', 'il'],
    ['Anaïs', 'elle'], ['Noa', 'il'], ['Hinano', 'elle'], ['Wanir', 'il'], ['Maëva', 'elle'], ['Tom', 'il']];
  const voyelle = nom => /^[AEIOUÉ]/.test(nom);
  // Deux enfants différents : { nom, il, Il, de, que } (de : « de Tom », « d’Inès » ; que : « que Tom », « qu’Inès »)
  const deuxEnfants = () => RM.melanger(ENFANTS).slice(0, 2).map(([nom, il]) => ({
    nom, il, Il: il === 'il' ? 'Il' : 'Elle', de: voyelle(nom) ? `d’${nom}` : `de ${nom}`, que: voyelle(nom) ? `qu’${nom}` : `que ${nom}`,
  }));
  // « Combien de bouquets », « Combien d’élèves »
  const combienDe = mot => (/^[aeiouéèh]/i.test(mot) ? `Combien d’${mot}` : `Combien de ${mot}`);
  // « ils » ou « elles » pour deux enfants
  const ilsOuElles = (p1, p2) => (p1.il === 'elle' && p2.il === 'elle' ? 'elles' : 'ils');

  // Les touches sous la case : la virgule et le signe moins (pour toute une étape, jamais selon la réponse)
  const TOUCHES = [',', '−'];

  // Un entier non nul, positif ou négatif : nonNul(1, 9) → −7, 3…
  const nonNul = (min, max) => parmi([-1, 1]) * entier(min, max);
  // « 2, 3, 5 et 7 »
  const liste = l => (l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}` : String(l[0]));

  // Les pièges vraiment faux (les négatifs sont permis) : ni égaux à la réponse, ni égaux entre eux
  const valeurDe = p => (typeof p === 'number' ? net(p) : lireNombre(p));
  function vraisPieges(reponse, pieges, deja = []) {
    const vues = [valeurDe(reponse), ...deja.map(valeurDe)];
    return pieges.filter(p => {
      if (p === null || p === undefined) return false;
      const v = valeurDe(p);
      if (!Number.isFinite(v) || vues.some(w => egaux(v, w))) return false;
      vues.push(v);
      return true;
    });
  }

  // Les pièges d'une question à boutons de nombres, pour choix({ ...avecErreur(…) }) :
  // - garder : une erreur classique (l'explication en parle), toujours proposée : la première de « classiques »
  //   qui laisse la bonne réponse à la place tirée ;
  // - pieges : elle et deux autres erreurs crédibles. La place de la bonne réponse (1re, 2e, 3e ou 4e : les boutons
  //   de nombres sont rangés du plus petit au plus grand) est tirée au hasard, sinon on la devinerait.
  function avecErreur(reponse, classiques, autres) {
    const r = valeurDe(reponse);
    const nets = l => l.map(p => (typeof p === 'number' ? net(p) : p));
    const bonnes = vraisPieges(reponse, nets(classiques));
    const dessous = l => l.filter(p => valeurDe(p) < r);
    const dessus = l => l.filter(p => valeurDe(p) > r);
    for (const t of RM.melanger([0, 1, 2, 3])) { // t : le nombre de pièges plus petits que la réponse
      for (const g of bonnes.length ? bonnes : [null]) {
        const garder = g === null ? [] : [g];
        const reste = RM.melanger(vraisPieges(reponse, nets([...classiques, ...autres]), garder));
        const [gd, gh] = [dessous(garder).length, dessus(garder).length];
        if (t < gd || 3 - t < gh || t - gd > dessous(reste).length || 3 - t - gh > dessus(reste).length) continue;
        return { garder, pieges: [...garder, ...dessous(reste).slice(0, t - gd), ...dessus(reste).slice(0, 3 - t - gh)] };
      }
    }
    // (pas assez de pièges pour 4 boutons : on donne ce qu'on a)
    const garder = bonnes.slice(0, 1);
    return { garder, pieges: vraisPieges(reponse, nets([...classiques, ...autres]), garder).concat(garder) };
  }

  // Un nombre « simple » pour un bouton : pas plus de 2 chiffres après la virgule, pas trop grand
  const simple = v => v !== null && Number.isFinite(v) && Math.abs(v) <= 99 && decimalesDe(net(v)) <= 2;

  // ----- Le calcul littéral (étapes 3 à 6) -----
  // Un polynôme est la liste de ses coefficients : [nombre, coefficient de x, de x², de x³]
  const EXPOSANTS = ['', '', '²', '³', '⁴'];
  // Un monôme : monome(3) → « 3x » ; monome(−1) → « −x » ; monome(5, 2) → « 5x² » ; monome(4, 0) → « 4 »
  function monome(k, degre = 1) {
    if (degre === 0) return ecrire(k);
    const a = Math.abs(k);
    return `${k < 0 ? MOINS : ''}${a === 1 ? '' : ecrire(a)}x${EXPOSANTS[degre]}`;
  }
  // Une somme de termes [[coefficient, degré], …], dans cet ordre et sans réduire : « 2x² − 10x + 3x − 15 »
  function termes(t) {
    let texte = '';
    t.forEach(([k, degre]) => {
      if (!k) return;
      const corps = monome(Math.abs(k), degre);
      texte += texte ? ` ${k < 0 ? MOINS : '+'} ${corps}` : (k < 0 ? MOINS : '') + corps;
    });
    return texte || '0';
  }
  // Un polynôme réduit et ordonné : expr([−15, −7, 2]) → « 2x² − 7x − 15 »
  const expr = p => termes(p.map((k, degre) => [k, degre]).reverse());

  const reduit = p => { const q = [...p]; while (q.length > 1 && !q[q.length - 1]) q.pop(); return q.map(k => k || 0); };
  const memePoly = (p, q) => { const [a, b] = [reduit(p), reduit(q)]; return a.length === b.length && a.every((k, i) => k === b[i]); };
  function multiplier(p, q) {
    const r = Array(p.length + q.length - 1).fill(0);
    p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
    return r;
  }
  const additionner = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) + (q[i] || 0));

  // Des expressions { texte, poly } : on peut les écrire et vérifier qu'elles sont égales (ou pas) à la réponse
  // Un facteur ax + b entre parenthèses : « (2x − 3) » ; facteur(−1, 3) s'écrit « (3 − x) »
  const facteur = (a, b) => ({ texte: a === -1 && b > 0 ? `(${ecrire(b)} ${MOINS} x)` : `(${expr([b, a])})`, poly: [b, a] });
  const entreParentheses = p => ({ texte: `(${expr(p)})`, poly: p });
  // Des facteurs bout à bout : « (x + 1)(3x − 5) »
  const produitDe = (...fs) => ({ texte: fs.map(f => f.texte).join(''), poly: fs.reduce((p, f) => multiplier(p, f.poly), [1]) });
  // Un nombre ou un monôme devant : devant(3, 0, f) → « 3(2x + 5) » ; devant(3, 1, f) → « 3x(x − 4) »
  const devant = (k, degre, f) => ({
    texte: `${degre === 0 ? ecrire(k) : monome(k, degre)}${f.texte}`,
    poly: multiplier(f.poly, [...Array(degre).fill(0), k]),
  });
  const auCarre = f => ({ texte: `${f.texte}²`, poly: multiplier(f.poly, f.poly) });

  // Les pièges « expressions » : ni égaux à la réponse (même écrits autrement), ni en double.
  // Renvoie { garder (la première erreur classique valable), pieges (2 autres, au hasard) } en textes.
  function piegesExpressions(reponse, classiques, autres, combien = 3) {
    const vus = [reponse];
    const valable = c => {
      if (!c || c.texte.length > 30 || vus.some(v => v.texte === c.texte || memePoly(v.poly, c.poly))) return false;
      vus.push(c);
      return true;
    };
    const garde = classiques.find(valable) || null; // (find s'arrête à la première erreur classique valable)
    // (les erreurs classiques non gardées peuvent revenir parmi les autres pièges)
    const reste = RM.melanger([...classiques, ...autres]).filter(valable).slice(0, combien - (garde ? 1 : 0));
    const tous = garde ? [garde, ...reste] : reste;
    return { garde, garder: garde ? [garde.texte] : [], pieges: tous.map(g => g.texte) };
  }

  // ======================================================================
  // 1. Les nombres premiers
  // ======================================================================
  const PREMIERS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  function estPremier(n) {
    if (n < 2) return false;
    for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
    return true;
  }
  // Des nombres qui ont l'air premiers (impairs, pas terminés par 5), mais qui ne le sont pas
  const FAUX_PREMIERS = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];
  const plusPetitDiviseur = n => { for (let p = 2; p * p <= n; p++) if (n % p === 0) return p; return n; };
  // « 91 = 7 × 13 »
  const enDeux = n => `${ecrire(n)} = ${plusPetitDiviseur(n)} × ${ecrire(n / plusPetitDiviseur(n))}`;

  // La décomposition en facteurs premiers : 360 → [[2, 3], [3, 2], [5, 1]]
  function decomposer(n) {
    const f = [];
    let reste = n;
    for (let p = 2; p * p <= reste; p++) {
      let e = 0;
      while (reste % p === 0) { reste /= p; e++; }
      if (e) f.push([p, e]);
    }
    if (reste > 1) f.push([reste, 1]);
    return f;
  }
  // L'écrire : en HTML (2<sup>3</sup> × 3) ou en texte pour les boutons (2³ × 3)
  function ecrireFacteurs(f, html = true) {
    if (!f.length) return '1';
    return f.map(([p, e]) => (e === 1 ? ecrire(p) : (html ? puissance(p, e) : puissanceTexte(p, e)))).join(' × ');
  }
  const decomposition = (n, html = true) => ecrireFacteurs(decomposer(n), html);
  const valeurDesFacteurs = f => f.reduce((v, [p, e]) => v * p ** e, 1);

  // Pourquoi n est premier : on essaie les nombres premiers dont le carré ne dépasse pas n
  function expliquerPremier(n) {
    const essais = PREMIERS.filter(p => p * p <= n);
    const suivant = PREMIERS.find(p => p * p > n);
    return `On essaie ${liste(essais)} (${suivant} × ${suivant} = ${ecrire(suivant * suivant)} dépasse ${n}) : aucun ne divise ${n}.<br>`
      + `${n} n’a que deux diviseurs, 1 et ${n} : il est <b>premier</b>.`;
  }

  // Les divisions successives : « 360 ÷ 2 = 180 ; 180 ÷ 2 = 90 ; … »
  function divisionsSuccessives(n) {
    const etapes = [];
    let reste = n;
    decomposer(n).forEach(([p, e]) => {
      for (let i = 0; i < e; i++) { etapes.push(`${ecrire(reste)} ÷ ${p} = ${ecrire(reste / p)}`); reste /= p; }
    });
    return `On divise par les nombres premiers, du plus petit au plus grand : ${etapes.join(' ; ')}.`;
  }

  // Un nombre à décomposer (de 24 à max), avec au moins deux nombres premiers différents et (souvent) une puissance
  function nombreADecomposer(max = 1000, avecPuissance = true) {
    for (;;) {
      const f = [[2, entier(0, 4)], [3, entier(0, 3)], [5, entier(0, 2)], [7, parmi([0, 0, 1])], [11, parmi([0, 0, 0, 1])], [13, parmi([0, 0, 0, 1])]]
        .filter(([, e]) => e > 0);
      const n = valeurDesFacteurs(f);
      const total = f.reduce((s, [, e]) => s + e, 0);
      if (n < 24 || n > max || f.length < 2 || total < 3) continue;
      if (avecPuissance && !f.some(([, e]) => e >= 2)) continue;
      return n;
    }
  }

  // Les fausses décompositions de n :
  // - pasPremiers : la même valeur, mais un facteur n'est pas premier (2³ → 8 ; 3 × 5 → 15) ;
  // - fausses : une autre valeur (un exposant de trop ou de moins, un facteur oublié, les exposants oubliés).
  // Chacune : { texte (bouton), html, raison }
  function faussesDecompositions(n) {
    const f = decomposer(n);
    const ecrit = (g, raison = '') => ({ texte: ecrireFacteurs(g, false), html: ecrireFacteurs(g, true), raison, valeur: valeurDesFacteurs(g) });
    const pasPremiers = [];
    f.forEach(([p, e], i) => {
      if (e >= 2) pasPremiers.push(ecrit(f.map((x, j) => (j === i ? [p ** e, 1] : x)), `${ecrire(p ** e)} n’est pas premier`));
    });
    for (let i = 0; i + 1 < f.length; i++) {
      const [[p, e], [q, g]] = [f[i], f[i + 1]];
      const groupe = [...f.slice(0, i), ...(e > 1 ? [[p, e - 1]] : []), [p * q, 1], ...(g > 1 ? [[q, g - 1]] : []), ...f.slice(i + 2)];
      pasPremiers.push(ecrit(groupe, `${p * q} = ${p} × ${q} n’est pas premier`));
    }
    const fausses = [];
    f.forEach(([p, e], i) => {
      fausses.push(ecrit(f.map((x, j) => (j === i ? [p, e + 1] : x))));
      if (e >= 2) fausses.push(ecrit(f.map((x, j) => (j === i ? [p, e - 1] : x))));
      if (f.length > 2 || f[1 - i][1] > 1) fausses.push(ecrit(f.filter((_, j) => j !== i)));
    });
    if (f.some(([, e]) => e > 1)) fausses.push(ecrit(f.map(([p]) => [p, 1])));
    const bonne = ecrireFacteurs(f, false);
    const court = x => x.texte !== bonne && x.texte.length <= 16;
    return { pasPremiers: pasPremiers.filter(court), fausses: fausses.filter(court) };
  }

  // N = 2^a × 3^b (× 5) (× 7), pour chercher ses diviseurs
  function nombreN() {
    for (;;) {
      const f = [[2, entier(1, 3)], [3, entier(1, 2)], [5, entier(0, 1)], [7, entier(0, 1)]].filter(([, e]) => e > 0);
      if (f.length >= 3) return f;
    }
  }
  const MOTS = ['aucun', 'un seul', 'deux', 'trois', 'quatre'];
  // Pourquoi d ne divise pas N (N donné par ses facteurs) : le premier facteur premier qui manque ou qui est en trop
  function pourquoiPasDiviseur(d, fN) {
    const [p, e] = decomposer(d).find(([q, g]) => g > (fN.find(([r]) => r === q) || [q, 0])[1]);
    const dansN = (fN.find(([r]) => r === p) || [p, 0])[1];
    return dansN === 0 ? `il n’y a pas de facteur ${p} dans N`
      : `N n’a ${dansN === 1 ? 'qu’un seul facteur' : `que ${MOTS[dansN]} facteurs`} ${p}, et il en faut ${MOTS[e]}`;
  }

  ajouterEtape({
    id: '3e-nombres-premiers',
    banque: ['premier', 'premier', 'decomposition', 'decomposition', 'diviseur', 'plusPetit', 'completer', 'completer',
      'suivant', 'probleme', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'premier') {
        if (Math.random() < 0.6) {
          // Lequel est premier ? Les pièges ont l'air premiers
          const p = parmi(PREMIERS.filter(x => x >= 17));
          // (une fois sur deux, un faux ami multiple de 7 : sinon le critère de divisibilité par 3 suffirait souvent)
          const septs = RM.melanger([49, 77, 91]);
          const autres = RM.melanger(FAUX_PREMIERS.filter(x => Math.abs(x - p) <= 40 && ![49, 77, 91].includes(x)));
          const q = avecErreur(p, Math.random() < 0.5 ? [...septs, ...autres] : [...autres, ...septs], autres);
          const faux = q.garder[0];
          return choix({
            consigne: 'Les nombres premiers',
            enonce: 'Lequel de ces nombres est premier ?',
            reponse: p,
            ...q,
            explication: `${expliquerPremier(p)}<br>Les autres ne le sont pas : par exemple ${enDeux(faux)}.`,
          });
        }
        // Lequel n'est pas premier ?
        const n = parmi(FAUX_PREMIERS.filter(x => x > 30));
        return choix({
          consigne: 'Les nombres premiers',
          enonce: 'Lequel de ces nombres [[n’est pas]] premier ?',
          reponse: n,
          ...avecErreur(n, [], PREMIERS.filter(x => x >= 11 && Math.abs(x - n) <= 30)),
          explication: `<b>${enDeux(n)}</b> : il a d’autres diviseurs que 1 et ${n}, il n’est pas premier.<br>`
            + 'Les autres nombres n’ont que deux diviseurs, 1 et eux-mêmes : ils sont premiers.',
        });
      }
      if (sorte === 'decomposition') {
        const n = nombreADecomposer();
        const { pasPremiers, fausses } = faussesDecompositions(n);
        const garde = parmi(pasPremiers);
        const autres = RM.melanger([...new Map(fausses.map(x => [x.texte, x])).values()]).slice(0, 2);
        return choix({
          consigne: 'Décompose en produit de facteurs premiers',
          enonce: `Quelle est la décomposition de ${ecrire(n)} en produit de facteurs premiers ?`,
          reponse: decomposition(n, false),
          garder: [garde.texte],
          pieges: [garde.texte, ...autres.map(x => x.texte)],
          explication: `${divisionsSuccessives(n)}<br>Donc <b>${ecrire(n)} = ${decomposition(n)}</b>.<br>`
            + `⚠️ ${garde.html} vaut bien ${ecrire(n)}, mais ${garde.raison}.`,
        });
      }
      if (sorte === 'completer') {
        if (Math.random() < 0.5) {
          // L'exposant d'un facteur
          const n = nombreADecomposer();
          const [p, e] = parmi(decomposer(n).filter(([, g]) => g >= 2));
          return nombre({
            consigne: 'Décompose en produit de facteurs premiers',
            enonce: `Dans la décomposition de ${ecrire(n)} en produit de facteurs premiers, l’exposant de ${p} est ___.`,
            reponse: e,
            explication: `${divisionsSuccessives(n)}<br>Donc ${ecrire(n)} = ${decomposition(n)} : on a divisé ${MOTS[e]} fois par ${p}, `
              + `l’exposant de ${p} est <b>${e}</b>.`,
          });
        }
        // Le dernier facteur premier, qui manque
        let n;
        let f;
        do { n = nombreADecomposer(); f = decomposer(n); } while (f[f.length - 1][1] !== 1 || f[f.length - 1][0] < 5);
        const p = f[f.length - 1][0];
        const debut = f.slice(0, -1);
        return nombre({
          consigne: 'Complète la décomposition en facteurs premiers',
          enonce: `${ecrire(n)} = ${ecrireFacteurs(debut)} × ___`,
          reponse: p,
          explication: `${ecrireFacteurs(debut)} = ${ecrire(valeurDesFacteurs(debut))}, et ${ecrire(n)} ÷ ${ecrire(valeurDesFacteurs(debut))} = ${p}.<br>`
            + `${p} est premier : ${ecrire(n)} = ${ecrireFacteurs(debut)} × <b>${p}</b>.`,
        });
      }
      if (sorte === 'diviseur') {
        const fN = nombreN();
        const N = valeurDesFacteurs(fN);
        const diviseurs = [];
        const nonDiviseurs = [];
        for (let d = 4; d <= 100; d++) {
          if (estPremier(d) || d === N || !decomposer(d).every(([p]) => [2, 3, 5, 7, 11].includes(p))) continue;
          (N % d === 0 ? diviseurs : nonDiviseurs).push(d);
        }
        // (un diviseur pas trop petit, et des pièges du même ordre de grandeur, pour que la réponse change de place)
        const petits = diviseurs.filter(x => x >= 10 && x <= 60);
        const grands = diviseurs.filter(x => x > 60);
        const d = parmi(Math.random() < 0.6 && petits.length ? petits : (grands.length ? grands : diviseurs));
        const proches = nonDiviseurs.filter(x => x >= 6);
        // L'erreur classique : un facteur de trop (un exposant plus grand que dans N, ou un facteur absent de N)
        const exposantDansN = p => (fN.find(([q]) => q === p) || [p, 0])[1];
        const presque = nonDiviseurs.filter(x => {
          const enTrop = decomposer(x).filter(([p, e]) => e > exposantDansN(p));
          return enTrop.length === 1 && enTrop[0][1] === exposantDansN(enTrop[0][0]) + 1;
        });
        const p = avecErreur(d, RM.melanger(presque), proches);
        const faux = p.garder[0];
        return choix({
          consigne: 'Utilise la décomposition',
          enonce: `On donne N = ${ecrireFacteurs(fN)}. Lequel de ces nombres est un diviseur de N ?`,
          reponse: d,
          ...p,
          explication: `${d} = ${decomposition(d)} : ses facteurs premiers sont dans N (pas plus de fois), donc <b>${d} divise N</b>.<br>`
            + `Mais ${faux} = ${decomposition(faux)} ne divise pas N : ${pourquoiPasDiviseur(faux, fN)}.`,
        });
      }
      if (sorte === 'plusPetit') {
        const p = parmi([3, 3, 7, 7, 11, 13]);
        const q = parmi(PREMIERS.filter(x => x >= p && x !== 5 && p * x >= 49 && p * x <= 260));
        const n = p * q;
        const avant = PREMIERS.filter(x => x < p);
        const chiffres = [...String(n)].map(Number);
        const somme = chiffres.reduce((s, c) => s + c, 0);
        return choix({
          consigne: 'Les nombres premiers',
          enonce: `Quel est le plus petit diviseur premier de ${n} ?`,
          reponse: p,
          ...avecErreur(p, q !== p ? [q] : [], [1, 2, 3, 5, 7, 11, 13, 17, 19].filter(x => x !== p)),
          explication: (p === 3
            ? `${n} est impair, mais ${chiffres.join(' + ')} = ${somme} est un multiple de 3 : ${n} = 3 × ${q}.`
            : `${n} n’est divisible ni par ${avant.join(', ni par ')}, mais ${n} = ${p} × ${q}.`)
            + `<br>Son plus petit diviseur premier est <b>${p}</b>${q !== p ? ` (${q} est premier aussi, mais plus grand)` : ''}.`
            + '<br>(Rappel : 1 n’est pas un nombre premier.)',
        });
      }
      if (sorte === 'suivant') {
        const apres = Math.random() < 0.6;
        let n;
        let p;
        do {
          n = entier(20, 96);
          p = apres ? PREMIERS.find(x => x > n) : [...PREMIERS].reverse().find(x => x < n);
        } while (!p || Math.abs(p - n) < 2 || estPremier(n));
        const entre = [];
        for (let m = apres ? n + 1 : n - 1; m !== p; m += apres ? 1 : -1) entre.push(enDeux(m));
        return nombre({
          consigne: 'Les nombres premiers jusqu’à 100',
          enonce: `Quel est le plus ${apres ? 'petit' : 'grand'} nombre premier ${apres ? 'plus grand' : 'plus petit'} que ${n} ?`,
          reponse: p,
          explication: `${entre.join(' ; ')} : ${entre.length > 1 ? 'ils ne sont pas premiers' : 'il n’est pas premier'}.<br>`
            + `${p} n’a que deux diviseurs, 1 et ${p} : c’est le nombre cherché, <b>${p}</b>.`,
        });
      }
      if (sorte === 'probleme') {
        // Des paquets identiques, le plus possible : le plus grand diviseur commun
        let g;
        let a;
        let b;
        do {
          g = parmi([6, 8, 9, 10, 12, 14, 15, 16, 18, 21, 24]);
          [a, b] = [entier(2, 9), entier(2, 9)];
        } while (a === b || pgcd(a, b) !== 1 || a * g > 200 || b * g > 200);
        const [A, B] = [a * g, b * g];
        const [p1] = deuxEnfants();
        const situation = parmi([
          { texte: `Au marché, une vendeuse a ${A} mangues et ${B} avocats. Elle veut faire le plus grand nombre possible de tas identiques, avec tous les fruits.`,
            paquets: 'tas', chose1: 'mangues', chose2: 'avocats', ou: 'dans chaque tas' },
          { texte: `Un fleuriste a ${A} roses et ${B} orchidées. Il veut faire le plus grand nombre possible de bouquets identiques, avec toutes les fleurs.`,
            paquets: 'bouquets', chose1: 'roses', chose2: 'orchidées', ou: 'dans chaque bouquet' },
          { texte: `Mamie a ${A} bonbons à la fraise et ${B} bonbons au citron. Elle prépare le plus grand nombre possible de sachets identiques, avec tous les bonbons.`,
            paquets: 'sachets', chose1: 'bonbons à la fraise', chose2: 'bonbons au citron', ou: 'dans chaque sachet' },
          { texte: `Pour un tournoi, ${A} élèves de 4e et ${B} élèves de 3e forment le plus grand nombre possible d’équipes identiques, sans oublier personne.`,
            paquets: 'équipes', chose1: 'élèves de 4e', chose2: 'élèves de 3e', ou: 'dans chaque équipe' },
          { texte: `${p1.nom} a ${A} photos de ses vacances à Lifou et ${B} photos de la foire de Bourail. ${p1.Il} les colle sur le plus grand nombre possible de pages identiques, sans en laisser.`,
            paquets: 'pages', chose1: 'photos de Lifou', chose2: 'photos de la foire de Bourail', ou: 'sur chaque page' },
        ]);
        const quoi = parmi(['paquets', 'chose1', 'chose2']);
        const reponse = { paquets: g, chose1: a, chose2: b }[quoi];
        const question = quoi === 'paquets' ? `${combienDe(situation.paquets)} ?` : `${combienDe(situation[quoi])} ${situation.ou} ?`;
        const gras = (v, q) => (q === quoi ? `<b>${v}</b>` : v);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `${situation.texte} ${question}`,
          reponse,
          unite: (quoi === 'paquets' ? situation.paquets : situation[quoi]).split(' ')[0],
          explication: `${A} = ${decomposition(A)} et ${B} = ${decomposition(B)}.<br>`
            + `Le plus grand diviseur commun : ${decomposition(g)} = ${g}. Donc ${gras(g, 'paquets')} ${situation.paquets}, `
            + `avec ${A} ÷ ${g} = ${gras(a, 'chose1')} ${situation.chose1} et ${B} ÷ ${g} = ${gras(b, 'chose2')} ${situation.chose2} ${situation.ou}.`,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['premier', 'premier', 'regle', 'decomposition']);
      if (genre === 'premier') {
        const n = vrai ? parmi(PREMIERS.filter(x => x >= 17)) : parmi(FAUX_PREMIERS);
        return vraiFaux({
          enonce: `${n} est un nombre premier.`,
          vrai,
          explication: vrai ? expliquerPremier(n) : `<b>${enDeux(n)}</b> : ${n} a d’autres diviseurs que 1 et lui-même, il n’est pas premier.`,
        });
      }
      if (genre === 'decomposition') {
        const n = nombreADecomposer(500);
        const { pasPremiers, fausses } = faussesDecompositions(n);
        const faux = parmi([...pasPremiers, ...fausses]);
        return vraiFaux({
          enonce: `La décomposition de ${ecrire(n)} en produit de facteurs premiers est ${vrai ? decomposition(n) : faux.html}.`,
          vrai,
          explication: `${divisionsSuccessives(n)}<br>Donc <b>${ecrire(n)} = ${decomposition(n)}</b>.`
            + (vrai ? '' : (faux.raison ? `<br>⚠️ ${faux.html} vaut bien ${ecrire(n)}, mais ${faux.raison}.`
              : `<br>⚠️ ${faux.html} = ${ecrire(faux.valeur)}, pas ${ecrire(n)}.`)),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['2 est le seul nombre premier pair.', 'les autres nombres pairs sont divisibles par 2 (et par 1 et eux-mêmes) : ils ont au moins trois diviseurs.'],
        ['Un nombre premier a exactement deux diviseurs.', 'ses seuls diviseurs sont 1 et lui-même.'],
        ['Tous les nombres premiers plus grands que 2 sont impairs.', 'un nombre pair plus grand que 2 est divisible par 2 : il n’est pas premier.'],
        ['Un nombre entier plus grand que 1 peut s’écrire comme un produit de nombres premiers.',
          `c’est sa décomposition en produit de facteurs premiers, par exemple 60 = ${puissance(2, 2)} × 3 × 5.`],
      ] : [
        ['1 est un nombre premier.', '1 n’a qu’un seul diviseur (lui-même) : il n’est pas premier.'],
        ['Tous les nombres premiers sont impairs.', '2 est premier, et il est pair.'],
        ['Tous les nombres impairs sont premiers.', '9 = 3 × 3 est impair, mais il n’est pas premier.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'Les nombres premiers',
    lecon: `
      <h4>Les nombres premiers</h4>
      <p>Un nombre entier est <b>premier</b> s’il a exactement <b>deux diviseurs</b> : 1 et lui-même.
        👉 <i>7, 13, 29</i> sont premiers ; <i>15 = 3 × 5</i> ne l’est pas.</p>
      <p>⚠️ <b>1 n’est pas premier</b> (il n’a qu’un diviseur). <b>2</b> est le seul nombre premier pair.</p>
      <p>Jusqu’à 100 : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97.<br>
        ⚠️ Des faux amis : <i>51 = 3 × 17</i>, <i>57 = 3 × 19</i>, <i>91 = 7 × 13</i>.</p>
      <p>Pour savoir si un nombre est premier, on essaie de le diviser par 2, 3, 5, 7… tant que le carré du diviseur ne le dépasse pas :
        pour 83, on essaie 2, 3, 5 et 7 (11 × 11 = 121 dépasse 83) : aucun ne marche, 83 est premier.</p>
      <h4>Décomposer en produit de facteurs premiers</h4>
      <p>On divise par les nombres premiers, du plus petit au plus grand, autant de fois que possible :
        <i>60 ÷ 2 = 30 ; 30 ÷ 2 = 15 ; 15 ÷ 3 = 5 ; 5 ÷ 5 = 1</i>, donc <b>60 = ${puissance(2, 2)} × 3 × 5</b>.
        Cette décomposition est unique (à l’ordre près).</p>
      <p>⚠️ <i>60 = 4 × 3 × 5</i> n’est pas la décomposition : 4 n’est pas premier. L’<b>exposant</b> de 2 est 2 (on a divisé deux fois par 2).</p>
      <h4>Diviseurs communs</h4>
      <p>Un nombre divise N si tous ses facteurs premiers sont dans la décomposition de N (pas plus de fois) :
        <i>12 = ${puissance(2, 2)} × 3</i> divise 60 ; <i>9 = ${puissance(3, 2)}</i> non (il n’y a qu’un seul 3 dans 60).</p>
      <p>Le <b>plus grand diviseur commun</b> de 84 = ${puissance(2, 2)} × 3 × 7 et 60 = ${puissance(2, 2)} × 3 × 5 : on prend les facteurs communs,
        ${puissance(2, 2)} × 3 = <b>12</b>. 👉 Avec 84 roses et 60 tulipes, on fait au plus 12 bouquets identiques (7 roses et 5 tulipes chacun).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> les critères de divisibilité font gagner du temps : par 2 (dernier chiffre pair),
        par 3 (somme des chiffres multiple de 3), par 5 (dernier chiffre 0 ou 5).</div>
    `,
  });

  // ======================================================================
  // 2. Fractions irréductibles et calculs
  // ======================================================================
  // Une fraction est une paire [numérateur, dénominateur], toujours simplifiée (dénominateur positif)
  const fPlus = ([a, b], [c, d]) => simplifier(a * d + c * b, b * d);
  const fMoins = ([a, b], [c, d]) => simplifier(a * d - c * b, b * d);
  const fFois = ([a, b], [c, d]) => simplifier(a * c, b * d);
  const fDivise = ([a, b], [c, d]) => simplifier(a * d, b * c);
  const inverse = ([a, b]) => simplifier(b, a);
  const valeurF = ([a, b]) => a / b;
  // En HTML (l'une au-dessus de l'autre, ou un entier) et en texte pour les boutons
  const F = ([a, b]) => (b === 1 ? ecrire(a) : frac(a, b));
  const FT = ([a, b]) => fracTexte(a, b);
  // Une fraction négative dans un calcul s'écrit entre parenthèses : 2/3 × (−3/4)
  const FP = f => (f[0] < 0 ? `(${F(f)})` : F(f));
  const TOUCHES_FRACTIONS = ['/', '−'];

  // Une fraction positive irréductible, pas entière (dénominateur de 2 à dMax, numérateur de 1 à nMax)
  function fractionAuHasard(dMax = 9, nMax = dMax) {
    for (;;) {
      const [n, d] = [entier(1, nMax), entier(2, dMax)];
      if (pgcd(n, d) === 1) return [n, d];
    }
  }

  // Les pièges fractions : simplifiées, jamais entières, de valeurs toutes différentes (et différentes de la réponse).
  // La première erreur classique valable est gardée (l'explication en parle) ; au moins un piège a le signe de la réponse
  // (sinon on la reconnaîtrait à son signe). Renvoie { garde, garder, pieges } (garde : la fraction de l'erreur classique).
  function troisFractions(reponse, classiques, autres) {
    const vues = [valeurF(reponse)];
    const valables = [];
    [...classiques, ...autres].forEach((f, i) => {
      if (!f || !Number.isInteger(f[0]) || !Number.isInteger(f[1]) || f[1] === 0) return;
      const g = simplifier(f[0], f[1]);
      if (g[1] === 1 || Math.abs(g[0]) > 250 || g[1] > 250 || vues.some(v => egaux(v, valeurF(g)))) return;
      vues.push(valeurF(g));
      valables.push({ g, classique: i < classiques.length });
    });
    const premiere = valables.find(v => v.classique);
    const garde = premiere ? [premiere.g] : [];
    const reste = RM.melanger(valables.filter(v => v !== premiere)).map(v => v.g);
    let choisis = [...garde, ...reste.slice(0, 3 - garde.length)];
    const signe = Math.sign(valeurF(reponse));
    if (choisis.length === 3 && !choisis.some(f => Math.sign(valeurF(f)) === signe)) {
      const autre = reste.slice(3 - garde.length).find(f => Math.sign(valeurF(f)) === signe);
      if (autre) choisis = [...choisis.slice(0, 2), autre];
    }
    return { garde: garde[0] || null, garder: garde.map(FT), pieges: choisis.map(FT) };
  }

  // Une fraction à rendre irréductible : (a × g)/(b × g), avec g qui a plusieurs facteurs premiers
  function fractionAReduire() {
    for (;;) {
      const g = parmi([6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30, 35, 36, 42]);
      const [a, b] = [entier(1, 11), entier(2, 13)];
      if (pgcd(a, b) !== 1 || a * g > 300 || b * g > 300 || a * g < 12) continue;
      return { n: a * g, d: b * g, a, b, g };
    }
  }

  // Une fraction « cachée » : (h × a)/(h × b) avec h premier (3, 7, 11, 13…) : elle se simplifie, mais ça ne se voit pas
  function fractionCachee(h) {
    for (;;) {
      const a = entier(2, 12);
      const b = entier(a + 1, 16);
      if (pgcd(a, b) === 1 && h * a >= 12 && h * b <= 150) return { n: h * a, d: h * b, h };
    }
  }
  // Une fraction irréductible qui n'en a pas l'air (ni le numérateur ni le dénominateur n'est premier)
  function fractionIrreductible() {
    for (;;) {
      const n = entier(12, 90);
      const d = entier(n + 3, 150);
      if (pgcd(n, d) === 1 && !estPremier(n) && !estPremier(d)) return { n, d };
    }
  }

  // Une somme ou une différence : A ± B, dénominateurs différents (A est parfois un entier)
  function sommeAuHasard() {
    for (;;) {
      const A = Math.random() < 0.15 ? [entier(1, 3), 1] : fractionAuHasard(parmi([6, 9, 12]), 9);
      const B = fractionAuHasard(parmi([6, 9, 12]), 9);
      // (pas le même numérateur : a/b − a/d donnerait des pièges nuls)
      if (A[1] === B[1] || A[0] === B[0]) continue;
      const plus = Math.random() < 0.55;
      const R = plus ? fPlus(A, B) : fMoins(A, B);
      if (R[1] === 1 || R[0] === 0 || R[1] > 72 || Math.abs(R[0]) > 99) continue;
      return { A, B, plus, R, op: plus ? '+' : MOINS };
    }
  }
  // erreur : [numérateur, dénominateur] de l'erreur classique, telle que l'élève la calcule (pas simplifiée), ou null
  function expliquerSomme({ A, B, plus, R, op }, erreur = null) {
    const m = ppcm(A[1], B[1]);
    const [a, c] = [A[0] * m / A[1], B[0] * m / B[1]];
    const N = plus ? a + c : a - c;
    const simplifiee = R[1] !== m;
    return (A[1] === 1 ? `On écrit ${A[0]} avec le dénominateur ${m} : ${A[0]} = ${frac(a, m)}. Puis on ${plus ? 'ajoute' : 'soustrait'} les numérateurs :<br>`
      : `On met les deux fractions au même dénominateur ${m}, puis on ${plus ? 'ajoute' : 'soustrait'} les numérateurs :<br>`)
      + `${F(A)} ${op} ${F(B)} = ${frac(a, m)} ${op} ${frac(c, m)} = ${simplifiee ? `${frac(N, m)} = ` : ''}<b>${F(R)}</b>`
      + `${simplifiee ? ' (on simplifie)' : ''}.`
      + (erreur ? `<br>⚠️ Pas ${pasSimplifiee(erreur)} : ${A[1] === 1 ? `${A[0]} s’écrit ${frac(a, m)}, pas ${frac(A[0], m)}`
        : (erreur[1] === m ? `il faut aussi multiplier les numérateurs (${F(A)} = ${frac(a, m)})`
          : `${plus ? 'on n’ajoute' : 'on ne soustrait'} pas les dénominateurs`)}.` : '');
  }
  // Une fraction telle qu'on l'a calculée, et sa forme simplifiée si elle est différente : « 6/10 (= 3/5) »
  function pasSimplifiee([n, d]) {
    const g = simplifier(n, d);
    return g[0] === n && g[1] === d ? F([n, d]) : `${frac(n, d)} (= ${F(g)})`;
  }

  // Un produit (ou un quotient) qu'on peut simplifier avant de calculer ; parfois une fraction négative
  function produitAuHasard(diviser = false) {
    for (;;) {
      let A = fractionAuHasard(9, 15);
      let B = fractionAuHasard(9, 15);
      const Bu = diviser ? inverse(B) : B; // ce par quoi on multiplie vraiment
      if (pgcd(A[0], Bu[1]) === 1 && pgcd(Bu[0], A[1]) === 1) continue; // (rien à simplifier : trop facile)
      if (Math.random() < 0.35) { if (Math.random() < 0.5) A = [-A[0], A[1]]; else B = [-B[0], B[1]]; }
      const R = diviser ? fDivise(A, B) : fFois(A, B);
      if (R[1] === 1 || R[1] > 40 || Math.abs(R[0]) > 40 || egaux(Math.abs(valeurF(R)), 1)) continue;
      return { A, B, R, negatif: R[0] < 0 };
    }
  }

  // A + B × C (ou A − B × C, ou avec ÷) : la multiplication (ou la division) passe avant
  function prioritesAuHasard() {
    for (;;) {
      const [A, B, C] = [fractionAuHasard(6), fractionAuHasard(6), fractionAuHasard(6)];
      const plus = Math.random() < 0.5;
      const diviser = Math.random() < 0.3;
      const BC = diviser ? fDivise(B, C) : fFois(B, C);
      const R = plus ? fPlus(A, BC) : fMoins(A, BC);
      if (R[1] === 1 || R[0] === 0 || R[1] > 36 || Math.abs(R[0]) > 60 || BC[1] === 1 || BC[1] > 12) continue;
      const AB = plus ? fPlus(A, B) : fMoins(A, B);
      const gaucheADroite = diviser ? fDivise(AB, C) : fFois(AB, C);
      if ((A[0] === B[0] && A[1] === B[1]) || AB[0] === 0 || gaucheADroite[1] === 1 || egaux(valeurF(gaucheADroite), valeurF(R))) continue;
      return { A, B, C, plus, diviser, BC, R, gaucheADroite, texte: `${F(A)} ${plus ? '+' : MOINS} ${F(B)} ${diviser ? '÷' : '×'} ${F(C)}` };
    }
  }

  ajouterEtape({
    id: '3e-nombres-fractions',
    banque: ['irreductible', 'irreductible', 'laquelle', 'laquelle', 'somme', 'somme', 'produit', 'produit', 'quotient',
      'priorites', 'priorites', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'irreductible') {
        const { n, d, a, b, g } = fractionAReduire();
        return fraction({
          consigne: 'Rends la fraction irréductible',
          enonce: `${frac(n, d)} = ___`,
          n: a,
          d: b,
          touches: TOUCHES_FRACTIONS,
          explication: `${n} = ${decomposition(n)} et ${d} = ${decomposition(d)} : leurs facteurs communs font ${decomposition(g)} = ${g}.<br>`
            + `${frac(n, d)} = ${frac(`${a} × ${g}`, `${b} × ${g}`)} = <b>${F([a, b])}</b> : on a simplifié par ${g}, `
            + 'et il ne reste plus de facteur commun.',
        });
      }
      if (sorte === 'laquelle') {
        const bonne = fractionIrreductible();
        const hs = RM.melanger([3, 7, 7, 11, 13, 17, 19]).filter((h, i, t) => t.indexOf(h) === i).slice(0, 3);
        const cachees = hs.map(fractionCachee);
        return choix({
          consigne: 'Fractions irréductibles',
          enonce: 'Laquelle de ces fractions est irréductible ?',
          reponse: fracTexte(bonne.n, bonne.d),
          pieges: cachees.map(c => fracTexte(c.n, c.d)),
          explication: `${bonne.n} = ${decomposition(bonne.n)} et ${bonne.d} = ${decomposition(bonne.d)} n’ont aucun facteur premier commun : `
            + `<b>${frac(bonne.n, bonne.d)} est irréductible</b>.<br>`
            + `Les autres se simplifient : ${cachees.map(c => `${frac(c.n, c.d)} = ${frac(`${c.n / c.h} × ${c.h}`, `${c.d / c.h} × ${c.h}`)}`).join(' ; ')}.`,
        });
      }
      if (sorte === 'somme') {
        const aTaper = Math.random() < 0.5;
        for (;;) {
        const s = sommeAuHasard();
        const { A, B, plus, R } = s;
        const m = ppcm(A[1], B[1]);
        const commun = { consigne: 'Calcule (résultat irréductible)', enonce: `${F(A)} ${s.op} ${F(B)} = ___` };
        if (aTaper) {
          return fraction({ ...commun, n: R[0], d: R[1], touches: TOUCHES_FRACTIONS, explication: expliquerSomme(s) });
        }
        // L'erreur gardée : ajouter (soustraire) les numérateurs et les dénominateurs, sauf si cela donne un dénominateur
        // négatif (a/b − c/d avec b < d : personne n'écrit ça) : alors, soustraire les numérateurs sans les multiplier.
        // Avec un entier k : (k ± c)/d. Puis d'autres erreurs : oublier de multiplier les numérateurs, se tromper de signe…
        const op = (x, y) => (plus ? x + y : x - y);
        const erreur = A[1] === 1 ? [op(A[0], B[0]), B[1]] : (plus || A[1] > B[1] ? [op(A[0], B[0]), op(A[1], B[1])] : [op(A[0], B[0]), m]);
        // (et : multiplier chaque numérateur par le mauvais nombre, ou n'en multiplier qu'un ; l'entier écrit k/1 avec
        // les dénominateurs ajoutés ; le mauvais signe, seulement pour une soustraction)
        const p = troisFractions(R, [erreur], [
          [op(A[0], B[0]), m], [op(A[0] * m / A[1], B[0] * m / B[1]), A[1] * B[1]], [A[0] * B[0], A[1] * B[1]],
          [op(A[0] * m / B[1], B[0] * m / A[1]), m], [op(A[0] * m / A[1], B[0]), m], [op(A[0], B[0] * m / B[1]), m],
          A[1] === 1 ? [op(A[0], B[0]), 1 + B[1]] : null, plus ? null : [-R[0], R[1]],
        ]);
        if (p.pieges.length < 3) continue; // (pas assez d'erreurs différentes : on tire un autre calcul)
        return choix({ ...commun, reponse: FT(R), garder: p.garder, pieges: p.pieges, explication: expliquerSomme(s, p.garde ? erreur : null) });
        }
      }
      if (sorte === 'produit' || sorte === 'quotient') {
        const diviser = sorte === 'quotient';
        const { A, B, R, negatif } = produitAuHasard(diviser);
        const Bu = diviser ? inverse(B) : B;
        const commun = {
          consigne: 'Calcule (résultat irréductible)',
          enonce: `${F(A)} ${diviser ? '÷' : '×'} ${FP(B)} = ___`,
        };
        // On simplifie avant de multiplier : g1 est commun au 1er numérateur et au 2d dénominateur, g2 au 2d numérateur et au 1er dénominateur
        const [n1, n2] = [Math.abs(A[0]), Math.abs(Bu[0])];
        const [g1, g2] = [pgcd(n1, Bu[1]), pgcd(n2, A[1])];
        const signe = negatif ? MOINS : '';
        const par = [g1, g2].filter(g => g > 1).join(' et par ');
        // (après la simplification, on n'écrit pas les facteurs 1, ni l'étape si elle donne déjà le résultat)
        const [haut, bas] = [[n1 / g1, n2 / g2].filter(v => v !== 1), [A[1] / g2, Bu[1] / g1].filter(v => v !== 1)];
        const etape = haut.length > 1 || bas.length > 1 ? `${signe}${frac(haut.join(' × ') || '1', bas.join(' × ') || '1')} = ` : '';
        const calcul = `${signe}${frac(`${n1} × ${n2}`, `${A[1]} × ${Bu[1]}`)} = ${etape}<b>${F(R)}</b> (on a simplifié par ${par} avant de multiplier)`;
        const regle = diviser
          ? `Diviser par ${FP(B)}, c’est multiplier par son inverse ${FP(Bu)} :<br>${F(A)} ÷ ${FP(B)} = ${F(A)} × ${FP(Bu)} = ${calcul}`
          : `On multiplie les numérateurs entre eux et les dénominateurs entre eux :<br>${F(A)} × ${FP(B)} = ${calcul}`;
        const signes = negatif ? ' (un seul nombre négatif : le résultat est négatif)' : '';
        if (Math.random() < 0.5) {
          return fraction({ ...commun, n: R[0], d: R[1], touches: TOUCHES_FRACTIONS, explication: `${regle}${signes}.` });
        }
        // Les erreurs : pour ÷, oublier de prendre l'inverse ; pour ×, multiplier « en croix » (c'est pour diviser) ;
        // l'inverse de la réponse, le mauvais signe (seulement s'il y a un nombre négatif : sinon on devinerait au signe)
        const classique = diviser ? fFois(A, B) : [A[0] * B[1], A[1] * B[0]];
        // (et « simplifier en haut seulement » : on enlève le facteur commun du numérateur, pas du dénominateur)
        const g = pgcd(Math.abs(A[0]), Bu[1]) > 1 ? pgcd(Math.abs(A[0]), Bu[1]) : pgcd(Math.abs(Bu[0]), A[1]);
        const autres = [inverse(R), diviser ? inverse(fFois(A, B)) : fPlus(A, B), [A[0] * Bu[0] / g, A[1] * Bu[1]]];
        if (negatif) autres.push([-R[0], R[1]]);
        const p = troisFractions(R, [classique], autres);
        const attention = p.garde
          ? `<br>⚠️ Pas ${F(p.garde)} : ${diviser ? `il faut multiplier par l’inverse de ${FP(B)}` : 'on ne multiplie pas « en croix » (ça, c’est pour diviser)'}.`
          : '';
        return choix({ ...commun, reponse: FT(R), garder: p.garder, pieges: p.pieges, explication: `${regle}${signes}.${attention}` });
      }
      if (sorte === 'priorites') {
        for (;;) {
        const q = prioritesAuHasard();
        const { A, B, C, plus, diviser, BC, R, gaucheADroite } = q;
        const op = plus ? '+' : MOINS;
        const p = troisFractions(R, [gaucheADroite], [
          plus ? null : fPlus(A, BC), // le mauvais signe à la fin (pour une soustraction)
          diviser ? null : (plus ? fPlus : fMoins)(A, [B[0] * C[1], B[1] * C[0]]), // × fait « en croix »
          diviser ? (plus ? fPlus(A, fFois(B, C)) : fMoins(A, fFois(B, C))) : null, // ÷ sans prendre l'inverse
          plus ? [A[0] + BC[0], A[1] + BC[1]] : [A[0] - BC[0], A[1] - BC[1]], // les numérateurs ensemble, les dénominateurs ensemble
          plus ? fPlus(A, B) : fMoins(A, B),
        ]);
        if (p.pieges.length < 3) continue; // (pas assez d'erreurs différentes : on tire un autre calcul)
        return choix({
          consigne: 'Calcule en respectant les priorités',
          enonce: `${q.texte} = ___`,
          reponse: FT(R),
          garder: p.garder,
          pieges: p.pieges,
          explication: `${diviser ? 'La division' : 'La multiplication'} passe avant : ${F(B)} ${diviser ? '÷' : '×'} ${F(C)} = ${F(BC)}.<br>`
            + `Puis ${F(A)} ${op} ${F(BC)} = <b>${F(R)}</b>.`
            + (p.garde ? `<br>⚠️ Pas ${F(p.garde)} : c’est le calcul fait de gauche à droite, sans la priorité.` : ''),
        });
        }
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['irreductible', 'irreductible', 'somme', 'diviser']);
      if (genre === 'irreductible') {
        const f = vrai ? fractionIrreductible() : fractionCachee(parmi([3, 7, 11, 13, 17]));
        return vraiFaux({
          enonce: `La fraction ${frac(f.n, f.d)} est irréductible.`,
          vrai,
          explication: `${f.n} = ${decomposition(f.n)} et ${f.d} = ${decomposition(f.d)} : `
            + (vrai ? 'aucun facteur premier commun, <b>elle est irréductible</b>.'
              : `on peut simplifier par ${f.h} : ${frac(f.n, f.d)} = <b>${frac(f.n / f.h, f.d / f.h)}</b>.`),
        });
      }
      if (genre === 'somme') {
        let s;
        // (le faux (a + c)/(b + d) doit être irréductible : sinon, simplifié, on ne verrait plus d'où il vient)
        do { s = sommeAuHasard(); } while (!s.plus || s.A[1] === 1 || pgcd(s.A[0] + s.B[0], s.A[1] + s.B[1]) !== 1);
        const faux = [s.A[0] + s.B[0], s.A[1] + s.B[1]];
        return vraiFaux({
          enonce: `${F(s.A)} + ${F(s.B)} = ${vrai ? F(s.R) : F(faux)}`,
          vrai,
          explication: expliquerSomme(s, vrai ? null : faux),
        });
      }
      let [A, B] = [fractionAuHasard(9), fractionAuHasard(9)];
      while (A[0] === B[0] && A[1] === B[1]) B = fractionAuHasard(9);
      const R = fDivise(A, B);
      return vraiFaux({
        enonce: `${F(A)} ÷ ${F(B)} = ${vrai ? `${F(A)} × ${F(inverse(B))}` : `${F(inverse(A))} × ${F(B)}`}`,
        vrai,
        explication: `Diviser par ${F(B)}, c’est multiplier par <b>son inverse</b> ${F(inverse(B))} : `
          + `${F(A)} ÷ ${F(B)} = ${F(A)} × ${F(inverse(B))} = ${F(R)}.`
          + (vrai ? '' : `<br>On ne prend pas l’inverse de ${F(A)}.`),
      });
    },
    titreLecon: 'Fractions irréductibles',
    lecon: `
      <h4>Rendre une fraction irréductible</h4>
      <p>Une fraction est <b>irréductible</b> quand on ne peut plus la simplifier : le numérateur et le dénominateur
        n’ont plus de facteur premier commun. On décompose les deux nombres, puis on simplifie par les facteurs communs :<br>
        👉 ${frac(84, 126)} = ${frac(`${puissance(2, 2)} × 3 × 7`, `2 × ${puissance(3, 2)} × 7`)} = ${frac(2, 3)} (on a simplifié par 2 × 3 × 7 = 42).</p>
      <p>⚠️ Des facteurs cachés : ${frac(51, 85)} = ${frac('3 × 17', '5 × 17')} = ${frac(3, 5)}.</p>
      <h4>Additionner, soustraire</h4>
      <p>On met les fractions au <b>même dénominateur</b>, puis on ajoute (ou on soustrait) les numérateurs :
        ${frac(5, 6)} + ${frac(3, 4)} = ${frac(10, 12)} + ${frac(9, 12)} = ${frac(19, 12)}.
        ⚠️ On n’ajoute pas les dénominateurs : ${frac(5, 6)} + ${frac(3, 4)} n’est pas ${frac(8, 10)}.</p>
      <h4>Multiplier, diviser</h4>
      <p>${frac('a', 'b')} × ${frac('c', 'd')} = ${frac('a × c', 'b × d')}, en simplifiant avant de calculer :
        ${frac(4, 9)} × ${frac(15, 8)} = ${frac('4 × 3 × 5', '3 × 3 × 4 × 2')} = ${frac(5, 6)}.</p>
      <p>Diviser par une fraction, c’est <b>multiplier par son inverse</b> :
        ${frac(2, 3)} ÷ ${frac(4, 5)} = ${frac(2, 3)} × ${frac(5, 4)} = ${frac(10, 12)} = ${frac(5, 6)}.</p>
      <p>La règle des signes marche aussi : ${frac(-2, 3)} × ${frac(3, 4)} = ${frac(-1, 2)}.
        Et les priorités : × et ÷ passent avant + et − : ${frac(1, 3)} + ${frac(2, 3)} × ${frac(3, 4)} = ${frac(1, 3)} + ${frac(1, 2)} = ${frac(5, 6)}.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour savoir si une fraction est irréductible, décompose le plus petit des deux nombres,
        puis essaie ses facteurs premiers sur l’autre : ${frac(26, 141)} : 26 = 2 × 13, et 141 n’est divisible ni par 2 ni par 13,
        donc elle est irréductible. Fais-le aussi à la fin de chaque calcul !</div>
    `,
  });

  // ======================================================================
  // 3. Développer
  // ======================================================================
  // Un polynôme devenu expression { texte, poly }
  const enExpression = p => (p ? { texte: expr(p), poly: p } : null);

  // (ax + b)(cx + d) : l'expression, les quatre produits, le développement réduit et les erreurs classiques
  function doubleDistributivite() {
    let a;
    let b;
    let c;
    let d;
    do {
      [a, c] = [parmi([1, 1, 2, 3, 4, 5]), parmi([1, 1, 2, 3])];
      [b, d] = [nonNul(1, 9), nonNul(1, 9)];
    } while (a * d + b * c === 0 || (a === c && b === d));
    return {
      texte: `${facteur(a, b).texte}${facteur(c, d).texte}`,
      dev: [b * d, a * d + b * c, a * c],
      quatre: termes([[a * c, 2], [a * d, 1], [b * c, 1], [b * d, 0]]),
      croises: [a * d, b * c],
      // Oublier les deux produits « croisés » ; puis des erreurs de signe, ou additionner les nombres au lieu de les multiplier
      classiques: [[b * d, 0, a * c]],
      autres: [[b * d, -(a * d + b * c), a * c], [-b * d, a * d + b * c, a * c], [b * d, a * d - b * c, a * c],
        [b * d, b * c - a * d, a * c], [b + d, a * d + b * c, a * c]],
    };
  }
  function expliquerDouble(q, garde = null) {
    return `Chaque terme du 1er facteur multiplie chaque terme du 2d :<br>${q.texte} = ${q.quatre} = <b>${expr(q.dev)}</b>.`
      + (garde && memePoly(garde.poly, [q.dev[0], 0, q.dev[2]])
        ? `<br>⚠️ Pas ${garde.texte} : il manque les deux produits « croisés » ${monome(q.croises[0])} et ${monome(q.croises[1])}.` : '');
  }

  // Les trois identités remarquables : (ax + b)², (ax − b)², (ax + b)(ax − b)
  const IDENTITES = {
    somme: '(a + b)² = a² + 2ab + b²',
    difference: '(a − b)² = a² − 2ab + b²',
    produit: '(a + b)(a − b) = a² − b²',
  };
  function identite(forme = parmi(['somme', 'difference', 'produit'])) {
    const a = parmi([1, 1, 2, 3, 4, 5]);
    const b = entier(1, 9);
    const A = monome(a);
    const carreA = a === 1 ? 'x²' : `(${A})²`;
    const [a2, ab2, b2] = [a * a, 2 * a * b, b * b];
    if (forme === 'somme') {
      return {
        forme, a, b, A,
        texte: `${facteur(a, b).texte}²`,
        dev: [b2, ab2, a2],
        detail: `${carreA} + 2 × ${A} × ${b} + ${b}²`,
        // Oublier le double produit ; oublier le 2 ; ne pas mettre a au carré ; 2 × b au lieu de b²
        classiques: [[b2, 0, a2]],
        autres: [[b2, a * b, a2], [b2, ab2, a], [2 * b, ab2, a2], [b2, 2 * b, a2], [b2, -ab2, a2], [2 * b, 2 * b, a2]],
      };
    }
    if (forme === 'difference') {
      return {
        forme, a, b, A,
        texte: `${facteur(a, -b).texte}²`,
        dev: [b2, -ab2, a2],
        detail: `${carreA} − 2 × ${A} × ${b} + ${b}²`,
        // (a − b)² = a² − b² ; le signe de b² ; le signe du double produit ; oublier le 2 ; ne pas mettre a au carré
        classiques: [[-b2, 0, a2]],
        autres: [[-b2, -ab2, a2], [b2, ab2, a2], [b2, -a * b, a2], [b2, -ab2, a], [b2, 0, a2]],
      };
    }
    const [f1, f2] = RM.melanger([facteur(a, b), facteur(a, -b)]);
    return {
      forme, a, b, A,
      texte: `${f1.texte}${f2.texte}`,
      dev: [-b2, 0, a2],
      detail: `${carreA} − ${b}²`,
      // a² + b² ; (3x)² = 3x² ; un double produit en trop ; 2 × b au lieu de b²
      classiques: [a > 1 ? [-b2, 0, a] : [b2, 0, a2]],
      autres: [[b2, 0, a2], [-b2, 0, a], [b2, -ab2, a2], [-b2, -ab2, a2], [-2 * b, 0, a2]],
    };
  }
  function expliquerIdentite(q, garde = null) {
    let attention = '';
    if (garde) {
      if (q.forme === 'difference' && memePoly(garde.poly, [-q.dev[0], 0, q.dev[2]])) {
        attention = `⚠️ Pas ${garde.texte} : (a − b)² n’est pas a² − b². Il y a le double produit ${monome(q.dev[1])}, et b² = +${q.dev[0]} est positif.`;
      } else if (q.forme !== 'produit' && memePoly(garde.poly, [q.forme === 'somme' ? q.dev[0] : -q.dev[0], 0, q.dev[2]])) {
        attention = `⚠️ Pas ${garde.texte} : n’oublie pas le double produit 2 × ${q.A} × ${q.b} = ${monome(2 * q.a * q.b)}.`;
      } else if (q.forme === 'produit' && memePoly(garde.poly, [-q.b * q.b, 0, q.a])) {
        attention = `⚠️ Pas ${garde.texte} : (${q.A})² = ${q.A} × ${q.A} = ${monome(q.a * q.a, 2)}.`;
      } else if (q.forme === 'produit' && memePoly(garde.poly, [q.b * q.b, 0, q.a * q.a])) {
        attention = `⚠️ Pas ${garde.texte} : c’est a² <b>−</b> b².`;
      }
    }
    return `On utilise ${IDENTITES[q.forme]}, avec a = ${q.A} et b = ${q.b} :<br>`
      + `${q.texte} = ${q.detail} = <b>${expr(q.dev)}</b>.${attention ? `<br>${attention}` : ''}`;
  }

  // (x + p)² − (x + q)(x + r) : développer, puis enlever la parenthèse précédée d'un −
  function aReduire() {
    for (;;) {
      const [p, q, r] = [nonNul(1, 6), nonNul(1, 7), nonNul(1, 7)];
      const dev = [p * p - q * r, 2 * p - q - r];
      if (!dev[0] || !dev[1] || q === r) continue;
      const [A, B] = [auCarre(facteur(1, p)), produitDe(facteur(1, q), facteur(1, r))];
      return {
        p, q, r, dev,
        texte: `${A.texte} ${MOINS} ${B.texte}`,
        carre: [p * p, 2 * p, 1],
        produit: [q * r, q + r, 1],
        // Le − ne change que le signe de x² ; (x + p)² = x² + p² ; le signe du nombre ; les x² ajoutés au lieu d'être enlevés
        classiques: [[p * p + q * r, 2 * p + q + r]],
        autres: [[p * p - q * r, -(q + r)], [p * p + q * r, 2 * p - q - r], [p * p - q * r, 2 * p - q - r, 2]],
      };
    }
  }
  function expliquerReduire(q, garde = null) {
    const { p, r } = q;
    const tout = termes([[1, 2], [2 * p, 1], [p * p, 0], [-1, 2], [-(q.q + r), 1], [-q.q * r, 0]]);
    return `${auCarre(facteur(1, p)).texte} = ${expr(q.carre)} et ${produitDe(facteur(1, q.q), facteur(1, r)).texte} = ${expr(q.produit)}.<br>`
      + `${q.texte} = ${expr(q.carre)} ${MOINS} (${expr(q.produit)}) = ${tout} = <b>${expr(q.dev)}</b>.<br>`
      + `⚠️ Le − devant la parenthèse change <b>tous</b> les signes${garde && memePoly(garde.poly, q.classiques[0]) ? ` (sinon on trouve ${garde.texte})` : ''}.`;
  }

  // Une question de développement, au hasard : { texte, dev, classiques, autres, expliquer(garde) }
  function aDevelopper(sorte) {
    if (sorte === 'double') { const q = doubleDistributivite(); return { ...q, expliquer: g => expliquerDouble(q, g) }; }
    if (sorte === 'identite') { const q = identite(); return { ...q, expliquer: g => expliquerIdentite(q, g) }; }
    const q = aReduire();
    return { ...q, expliquer: g => expliquerReduire(q, g) };
  }

  ajouterEtape({
    id: '3e-nombres-developper',
    banque: ['double', 'double', 'identite', 'identite', 'identite', 'reduire', 'coefficient', 'coefficient',
      'calculMental', 'calculMental', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'double' || sorte === 'identite' || sorte === 'reduire') {
        const q = aDevelopper(sorte);
        const reponse = enExpression(q.dev);
        const p = piegesExpressions(reponse, q.classiques.map(enExpression), q.autres.map(enExpression));
        return choix({
          consigne: { double: 'Développe et réduis', identite: 'Développe avec une identité remarquable', reduire: 'Développe et réduis' }[sorte],
          enonce: `${q.texte} = ___`,
          reponse: reponse.texte,
          garder: p.garder,
          pieges: p.pieges,
          ordre: 'melange',
          explication: q.expliquer(p.garde),
        });
      }
      if (sorte === 'coefficient') {
        const q = aDevelopper(Math.random() < 0.6 ? 'double' : 'identite');
        const possibles = [[q.dev[1], 'le coefficient de x'], [q.dev[0], 'le nombre sans x']];
        if (q.dev[2] > 1) possibles.push([q.dev[2], 'le coefficient de x²']);
        const [v, quoi] = parmi(possibles.filter(([c]) => c !== 0));
        return nombre({
          consigne: 'Développe et réduis',
          enonce: `Développe et réduis ${q.texte}. Quel est ${quoi} ?`,
          reponse: v,
          touches: TOUCHES,
          solution: `${q.texte} = ${expr(q.dev)} : ${quoi} est <b>${ecrire(v)}</b>.`,
          explication: q.expliquer(),
        });
      }
      if (sorte === 'calculMental') {
        const base = parmi([20, 30, 40, 50, 60, 70, 80, 90, 100, 100, 200, 1000]);
        const r = entier(1, base >= 100 ? 3 : 2);
        const forme = parmi(['somme', 'difference', 'produit']);
        const [B, R] = [ecrire(base), ecrire(r)];
        let enonce;
        let calcul;
        let resultat;
        if (forme === 'produit') {
          resultat = base * base - r * r;
          enonce = `${ecrire(base - r)} × ${ecrire(base + r)} = ___`;
          calcul = `(${B} ${MOINS} ${R})(${B} + ${R}) = ${B}² ${MOINS} ${R}² = ${ecrire(base * base)} ${MOINS} ${ecrire(r * r)}`;
        } else {
          const plus = forme === 'somme';
          const n = plus ? base + r : base - r;
          resultat = n * n;
          enonce = `${ecrire(n)}² = ___`;
          calcul = `(${B} ${plus ? '+' : MOINS} ${R})² = ${B}² ${plus ? '+' : MOINS} 2 × ${B} × ${R} + ${R}² = `
            + `${ecrire(base * base)} ${plus ? '+' : MOINS} ${ecrire(2 * base * r)} + ${ecrire(r * r)}`;
        }
        return nombre({
          consigne: 'Calcule de tête, avec une identité remarquable',
          enonce,
          reponse: resultat,
          touches: TOUCHES,
          explication: `${enonce.replace(' = ___', '')} = ${calcul} = <b>${ecrire(resultat)}</b>.`,
        });
      }
      // Vrai ou faux (pour toutes les valeurs de x) : un développement juste, ou avec une erreur classique
      const vrai = Math.random() < 0.5;
      const q = aDevelopper(Math.random() < 0.6 ? 'identite' : 'double');
      const reponse = enExpression(q.dev);
      const faux = piegesExpressions(reponse, RM.melanger([...q.classiques, ...q.autres]).map(enExpression), [], 1).garde;
      return vraiFaux({
        consigne: 'Vrai ou faux, pour toutes les valeurs de x ?',
        enonce: `${q.texte} = ${vrai ? reponse.texte : faux.texte}`,
        vrai,
        explication: (() => {
          const e = q.expliquer(vrai ? null : faux);
          return vrai || e.includes('⚠️') ? e : `${e}<br>⚠️ On trouve ${expr(q.dev)}, pas ${faux.texte}.`;
        })(),
      });
    },
    titreLecon: 'Développer',
    lecon: `
      <h4>Développer, c’est transformer un produit en somme</h4>
      <p><b>k(a + b) = ka + kb</b>. La double distributivité : chaque terme du 1er facteur multiplie chaque terme du 2d,
        <b>(a + b)(c + d) = ac + ad + bc + bd</b>.<br>
        👉 <i>(2x + 3)(x − 5) = 2x² − 10x + 3x − 15 = 2x² − 7x − 15</i></p>
      <p>Réduire, c’est regrouper les termes de même sorte (les x² ensemble, les x ensemble, les nombres ensemble).
        Dans <i>2x² − 7x − 15</i>, le coefficient de x² est 2, le coefficient de x est −7, le nombre sans x est −15.</p>
      <h4>Les identités remarquables</h4>
      <table>
        <tr><td>(a + b)² = a² + 2ab + b²</td><td><i>(x + 3)² = x² + 6x + 9</i></td></tr>
        <tr><td>(a − b)² = a² − 2ab + b²</td><td><i>(2x − 5)² = 4x² − 20x + 25</i></td></tr>
        <tr><td>(a + b)(a − b) = a² − b²</td><td><i>(x + 4)(x − 4) = x² − 16</i></td></tr>
      </table>
      <p>⚠️ <i>(x + 3)²</i> n’est pas <i>x² + 9</i> : n’oublie pas le <b>double produit</b> 2ab.
        Et <i>(2x)² = 2x × 2x = 4x²</i> (pas 2x²).</p>
      <p>⚠️ Un − devant une parenthèse change <b>tous</b> les signes :
        <i>(x + 3)² − (x + 1)(x − 2) = x² + 6x + 9 − (x² − x − 2) = x² + 6x + 9 − x² + x + 2 = 7x + 11</i>.</p>
      <p>Pour calculer de tête : <i>101² = (100 + 1)² = 10&nbsp;000 + 200 + 1 = 10&nbsp;201</i> ;
        <i>49 × 51 = (50 − 1)(50 + 1) = 2&nbsp;500 − 1 = 2&nbsp;499</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie en remplaçant x par un nombre, par exemple 1 :
        (1 + 3)² = 16, et 1 + 6 + 9 = 16 ✔ (mais 1 + 9 = 10 ✘).</div>
    `,
  });

  // ======================================================================
  // 4. Factoriser
  // ======================================================================
  // La fin commune des explications : on vérifie un piège en le développant
  function verifierPiege(garde, commun = 'x') {
    if (!garde) return '';
    if (garde.raison) return `<br>⚠️ Pas ${garde.texte} : ${garde.raison}.`;
    if (garde.texte === `(${expr(garde.poly)})`) return `<br>⚠️ Pas ${garde.texte} : il manque le facteur commun ${commun}.`;
    return `<br>⚠️ Pas ${garde.texte} : en développant, on trouve ${expr(garde.poly)}.`;
  }
  const plusOuMoins = b => `${b < 0 ? MOINS : '+'} ${ecrire(Math.abs(b))}`;

  // kax + kb = k(ax + b) : le plus grand facteur commun est un nombre
  function factoriserNombre() {
    for (;;) {
      const [k, a, b] = [entier(2, 9), entier(1, 9), nonNul(1, 9)];
      if (pgcd(a, Math.abs(b)) !== 1 || (a === 1 && Math.random() < 0.5)) continue;
      const f = facteur(a, b);
      const reponse = devant(k, 0, f);
      const poly = [k * b, k * a];
      return {
        k, a, b, f, poly, reponse,
        texte: expr(poly),
        // Diviser un seul des deux termes par k ; mettre ka en facteur sans diviser b ; diviser par le mauvais nombre
        // (63x + 36 → 7(9x + 4)) ; le signe
        classiques: RM.melanger([devant(k, 0, facteur(k * a, b)), devant(k, 0, facteur(a, k * b))]),
        autres: [a > 1 ? devant(k * a, 0, facteur(1, k * b)) : null, a > 1 && a !== k ? devant(a, 0, facteur(k, b)) : null,
          devant(k, 0, facteur(a, -b))],
        expliquer: garde => `${k} est le plus grand facteur commun de ${k * a} et ${Math.abs(k * b)} :<br>`
          + `${expr(poly)} = ${k} × ${monome(a)} ${b < 0 ? MOINS : '+'} ${k} × ${Math.abs(b)} = <b>${reponse.texte}</b>.${verifierPiege(garde)}`,
      };
    }
  }

  // kax² + kbx = kx(ax + b) : x (et parfois un nombre) en facteur
  function factoriserX() {
    for (;;) {
      const [k, a, b] = [parmi([1, 1, 2, 3, 4, 5]), entier(1, 6), nonNul(1, 9)];
      if (pgcd(a, Math.abs(b)) !== 1) continue;
      const f = facteur(a, b);
      const reponse = devant(k, 1, f);
      const poly = [0, k * b, k * a];
      const K = monome(k);
      return {
        k, a, b, f, poly, reponse,
        texte: expr(poly),
        // Oublier le x ; laisser un x de trop (kx(ax² + b)) ; ne diviser le 2d terme que par x (ou que par k) ; le signe
        classiques: RM.melanger([k === 1 ? f : { ...devant(k, 0, f), raison: `il manque le x du facteur commun ${K}` },
          devant(k, 1, entreParentheses([b, 0, a]))]),
        // (et kax(x + b) : on n'a divisé que le 1er terme par kax)
        autres: [k > 1 ? devant(k, 1, facteur(a, k * b)) : null, k > 1 ? devant(1, 1, facteur(k * a, b)) : null, devant(k, 1, facteur(a, -b)),
          devant(k * a, 1, facteur(1, b))],
        expliquer: garde => `Le facteur commun est ${K}${k > 1 ? ` (${k} divise ${k * a} et ${Math.abs(k * b)}, et x est dans les deux termes)` : ''} :<br>`
          + `${expr(poly)} = ${K} × ${monome(a)} ${b < 0 ? MOINS : '+'} ${K} × ${Math.abs(b)} = <b>${reponse.texte}</b>.${verifierPiege(garde, K)}`,
      };
    }
  }

  // A × B ± A × C = A(B ± C), ou A² ± A × C = A(A ± C) : le facteur commun est une parenthèse
  function factoriserParenthese() {
    for (;;) {
      const A = facteur(parmi([1, 1, 2, 3]), nonNul(1, 7));
      if (pgcd(A.poly[1], Math.abs(A.poly[0])) !== 1) continue;
      const forme = parmi(['plus', 'moins', 'carre']);
      const signe = forme === 'plus' ? 1 : (forme === 'moins' ? -1 : parmi([1, -1]));
      const C = facteur(entier(1, 5), nonNul(1, 9));
      const B = forme === 'carre' ? A : facteur(entier(1, 5), nonNul(1, 9));
      const interieur = additionner(B.poly, C.poly.map(c => signe * c));
      if (interieur[1] <= 0 || interieur[0] === 0 || pgcd(interieur[1], Math.abs(interieur[0])) > 1 || memePoly(C.poly, A.poly) || (forme !== 'carre' && (memePoly(B.poly, A.poly) || memePoly(B.poly, C.poly)))) continue;
      const op = signe < 0 ? MOINS : '+';
      const texte = forme === 'carre' ? `${A.texte}² ${op} ${A.texte}${C.texte}` : `${A.texte}${B.texte} ${op} ${A.texte}${C.texte}`;
      const reponse = produitDe(A, entreParentheses(interieur));
      // (pas de parenthèse réduite à un seul terme, comme « (2) » ou « (−2x) »)
      const avecA = p => (p[0] && p[1] ? produitDe(A, entreParentheses(p)) : null);
      // Les erreurs : le − qui ne change que le 1er terme ; A² ± AC = A(1 ± C) ; A gardé deux fois ; tout multiplier ; le signe du nombre
      const classiques = [];
      if (signe < 0) classiques.push(avecA([B.poly[0] + C.poly[0], B.poly[1] - C.poly[1]]));
      if (forme === 'carre') {
        const faux = avecA([1 + signe * C.poly[0], signe * C.poly[1]]);
        if (faux) classiques.push({ ...faux, raison: `${A.texte}² = ${A.texte}${A.texte}, il reste ${A.texte} (et pas 1) dans le crochet` });
      }
      if (forme === 'plus') {
        classiques.push({ texte: `${A.texte}²(${expr(interieur)})`, poly: multiplier(multiplier(A.poly, A.poly), interieur),
          raison: `le facteur commun ${A.texte} ne s’écrit qu’une fois` });
      }
      const autres = [
        forme === 'carre' ? { texte: `${A.texte}²${C.texte}`, poly: multiplier(multiplier(A.poly, A.poly), C.poly) } : produitDe(A, B, C),
        avecA([-interieur[0], interieur[1]]),
        forme === 'plus' ? avecA(additionner(B.poly, C.poly.map(c => -c))) : avecA(additionner(B.poly, C.poly)),
      ];
      const dedans = `${B.texte} ${op} ${C.texte}`;
      const enleve = signe < 0 ? ` = ${A.texte}(${termes([[B.poly[1], 1], [B.poly[0], 0], [-C.poly[1], 1], [-C.poly[0], 0]])})` : '';
      return {
        texte, reponse, poly: reponse.poly, classiques, autres,
        expliquer: garde => `Le facteur commun est ${A.texte}${forme === 'carre' ? ` (car ${A.texte}² = ${A.texte}${A.texte})` : ''} :<br>`
          + `${texte} = ${A.texte}[${dedans}]${enleve} = <b>${reponse.texte}</b>.`
          + (signe < 0 ? '<br>⚠️ Le − devant la parenthèse change <b>tous</b> ses signes.' : verifierPiege(garde)),
      };
    }
  }

  // a² − b² = (a − b)(a + b)
  function differenceDeCarres(forme = parmi(['x', 'x', 'ax', 'decale', 'nombre'])) {
    if (forme === 'x') {
      const n = entier(2, 12);
      return {
        forme, n, a: 1,
        texte: `x² ${MOINS} ${n * n}`,
        reponse: produitDe(facteur(1, -n), facteur(1, n)),
        detail: `x² ${MOINS} ${n}²`,
        aEtB: `a = x et b = ${n}`,
        classiques: [auCarre(facteur(1, -n))],
        autres: [auCarre(facteur(1, n)), produitDe(facteur(1, -n * n), facteur(1, n * n)), produitDe(facteur(-1, n), facteur(1, n))],
      };
    }
    if (forme === 'ax') {
      let a;
      let n;
      do { [a, n] = [entier(2, 5), entier(1, 9)]; } while (pgcd(a, n) !== 1);
      return {
        forme, n, a,
        texte: `${a * a}x² ${MOINS} ${n * n}`,
        reponse: produitDe(facteur(a, -n), facteur(a, n)),
        detail: `(${a}x)² ${MOINS} ${n}²`,
        aEtB: `a = ${a}x et b = ${n}`,
        classiques: [{ ...produitDe(facteur(a * a, -n), facteur(a * a, n)), raison: `a = ${a}x, car ${a * a}x² = (${a}x)² (on prend ${a}x, pas ${a * a}x)` }],
        autres: [produitDe(facteur(a, -n * n), facteur(a, n * n)), auCarre(facteur(a, -n)), produitDe(facteur(1, -n), facteur(1, n))],
      };
    }
    if (forme === 'decale') {
      let p;
      let n;
      do { [p, n] = [nonNul(1, 6), entier(2, 7)]; } while (Math.abs(p) === n);
      const F1 = facteur(1, p);
      return {
        forme, n, p,
        texte: `${F1.texte}² ${MOINS} ${n * n}`,
        reponse: produitDe(facteur(1, p - n), facteur(1, p + n)),
        detail: `${F1.texte}² ${MOINS} ${n}² = (${expr([p, 1])} ${MOINS} ${n})(${expr([p, 1])} + ${n})`,
        aEtB: `a = ${expr([p, 1])} et b = ${n}`,
        // Oublier la racine : (x + p − n²)(x + p + n²) ; un carré ; le signe de p
        classiques: p - n * n !== 0 && p + n * n !== 0
          ? [{ ...produitDe(facteur(1, p - n * n), facteur(1, p + n * n)), raison: `b = ${n}, car ${n * n} = ${n}² (on prend ${n}, pas ${n * n})` }] : [],
        autres: [auCarre(facteur(1, p - n)), produitDe(facteur(1, -p - n), facteur(1, -p + n)), produitDe(facteur(1, p - n), facteur(1, -p - n))],
      };
    }
    const n = entier(2, 9);
    return {
      forme, n,
      texte: `${n * n} ${MOINS} x²`,
      reponse: produitDe(facteur(-1, n), { texte: `(${n} + x)`, poly: [n, 1] }),
      detail: `${n}² ${MOINS} x²`,
      aEtB: `a = ${n} et b = x`,
      classiques: [produitDe(facteur(1, -n), facteur(1, n))],
      autres: [auCarre(facteur(-1, n)), produitDe(facteur(-1, n * n), { texte: `(${n * n} + x)`, poly: [n * n, 1] })],
    };
  }
  function expliquerCarres(q, garde) {
    return `On reconnaît a² − b² = (a − b)(a + b), avec ${q.aEtB} :<br>`
      + `${q.texte} = ${q.detail} = <b>${q.reponse.texte}</b>.${verifierPiege(garde)}`;
  }

  // Une factorisation au hasard, pour les boutons et le vrai ou faux : { texte, reponse, classiques, autres, expliquer }
  function aFactoriser(sorte) {
    if (sorte === 'nombre') return factoriserNombre();
    if (sorte === 'x') return factoriserX();
    if (sorte === 'commun') return factoriserParenthese();
    const q = differenceDeCarres();
    return { ...q, expliquer: g => expliquerCarres(q, g) };
  }

  ajouterEtape({
    id: '3e-nombres-factoriser',
    banque: ['nombre', 'nombre', 'x', 'x', 'commun', 'commun', 'carres', 'carres', 'trou', 'trou', 'trou', 'trou', 'forme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (['nombre', 'x', 'commun', 'carres'].includes(sorte)) {
        let q;
        let p;
        do {
          q = aFactoriser(sorte);
          p = piegesExpressions(q.reponse, q.classiques, q.autres);
        } while (p.pieges.length < 3);
        return choix({
          consigne: sorte === 'carres' ? 'Factorise avec a² − b² = (a − b)(a + b)' : 'Factorise',
          enonce: `${q.texte} = ___`,
          reponse: q.reponse.texte,
          garder: p.garder,
          pieges: p.pieges,
          ordre: 'melange',
          explication: q.expliquer(p.garde),
        });
      }
      if (sorte === 'trou') {
        const facon = parmi(['k', 'b', 'x', 'carre']);
        if (facon === 'k' || facon === 'b') {
          let q;
          do { q = factoriserNombre(); } while (facon === 'b' && Math.abs(q.b) < 2);
          const { k, a, b } = q;
          return nombre({
            consigne: 'Complète la factorisation',
            enonce: facon === 'k' ? `${q.texte} = ___${q.f.texte}` : `${q.texte} = ${k}(${monome(a)} ${b < 0 ? MOINS : '+'} ___)`,
            reponse: facon === 'k' ? k : Math.abs(b),
            explication: q.expliquer(),
          });
        }
        if (facon === 'x') {
          let q;
          do { q = factoriserX(); } while (Math.abs(q.b) < 2);
          return nombre({
            consigne: 'Complète la factorisation',
            enonce: `${q.texte} = ${monome(q.k)}(${monome(q.a)} ${q.b < 0 ? MOINS : '+'} ___)`,
            reponse: Math.abs(q.b),
            explication: q.expliquer(),
          });
        }
        const q = differenceDeCarres(parmi(['x', 'ax']));
        const { a, n } = q;
        return nombre({
          consigne: 'Complète la factorisation',
          enonce: a === 1 ? `${q.texte} = (x ${MOINS} ___)(x + ${n})` : `${q.texte} = (${a}x ${MOINS} ${n})(___x + ${n})`,
          reponse: a === 1 ? n : a,
          explication: expliquerCarres(q),
        });
      }
      if (sorte === 'forme') {
        // (b et c sans diviseur commun : les produits ne peuvent pas être « factorisés davantage »)
        let [a, b, c, k] = [entier(1, 9), entier(2, 5), entier(1, 9), entier(2, 6)];
        while (pgcd(b, c) !== 1) c = entier(1, 9);
        const produits = [`(x + ${a})(${b}x ${MOINS} ${c})`, `${k}x(x ${MOINS} ${a})`, `(x ${MOINS} ${a})²`, `${k}(${b}x + ${c})`,
          `(${b}x ${MOINS} ${c})(${b}x + ${c})`];
        const sommes = [[`x(x + ${a}) + ${c}`, '+'], [`(x + ${a})² ${MOINS} ${c * c}`, '−'], [`${b}x² + ${monome(c)} ${MOINS} ${a}`, '−'],
          [`${k}(x + ${a}) ${MOINS} x`, '−'], [`(x ${MOINS} ${a})(x + ${a}) + ${c}`, '+']];
        if (Math.random() < 0.6) {
          const bonne = parmi(produits);
          return choix({
            consigne: 'Factorisée ou pas ?',
            enonce: 'Laquelle de ces expressions est factorisée (écrite comme un produit) ?',
            reponse: bonne,
            pieges: sommes.map(([s]) => s),
            explication: (bonne.endsWith('²') ? `<b>${bonne}</b> = ${bonne.slice(0, -1)}${bonne.slice(0, -1)} est un produit (un carré, c’est une <b>multiplication</b>).<br>`
              : `<b>${bonne}</b> est un produit : la dernière opération à faire est une <b>multiplication</b>.<br>`)
              + 'Les autres sont des sommes ou des différences : leur dernière opération est + ou −.',
          });
        }
        const [bonne, op] = parmi(sommes);
        return choix({
          consigne: 'Factorisée ou pas ?',
          enonce: 'Laquelle de ces expressions [[n’est pas]] factorisée ?',
          reponse: bonne,
          pieges: produits,
          explication: `<b>${bonne}</b> n’est pas un produit : la dernière opération à faire est ${op === '+' ? 'une addition' : 'une soustraction'} (${op}).<br>`
            + 'Les autres sont des produits : elles sont factorisées.',
        });
      }
      // Vrai ou faux (pour toutes les valeurs de x) : une factorisation juste, ou avec une erreur classique
      const vrai = Math.random() < 0.5;
      const q = aFactoriser(parmi(['nombre', 'x', 'carres']));
      const faux = piegesExpressions(q.reponse, RM.melanger([...q.classiques, ...q.autres]), [], 1).garde;
      return vraiFaux({
        consigne: 'Vrai ou faux, pour toutes les valeurs de x ?',
        enonce: `${q.texte} = ${vrai ? q.reponse.texte : faux.texte}`,
        vrai,
        explication: q.expliquer(vrai ? null : faux),
      });
    },
    titreLecon: 'Factoriser',
    lecon: `
      <h4>Factoriser, c’est transformer une somme en produit</h4>
      <p>On cherche un <b>facteur commun</b> à tous les termes (le plus grand possible) : <b>ka + kb = k(a + b)</b>.<br>
        👉 <i>6x + 15 = 3 × 2x + 3 × 5 = 3(2x + 5)</i> · <i>x² + 5x = x × x + 5 × x = x(x + 5)</i> ·
        <i>3x² − 12x = 3x × x − 3x × 4 = 3x(x − 4)</i></p>
      <p>Le facteur commun peut être une parenthèse :<br>
        👉 <i>(x + 1)(x + 2) + (x + 1)(2x − 7) = (x + 1)[(x + 2) + (2x − 7)] = (x + 1)(3x − 5)</i><br>
        👉 <i>(x + 1)² + (x + 1)(3x − 4) = (x + 1)[(x + 1) + (3x − 4)] = (x + 1)(4x − 3)</i>, car (x + 1)² = (x + 1)(x + 1).</p>
      <p>⚠️ Avec un − : <i>(2x + 1)(x + 3) − (2x + 1)(x − 5) = (2x + 1)[(x + 3) − (x − 5)] = (2x + 1)(x + 3 − x + 5) = 8(2x + 1)</i> :
        le − change <b>tous</b> les signes de la parenthèse.</p>
      <h4>La différence de deux carrés</h4>
      <p><b>a² − b² = (a − b)(a + b)</b> 👉 <i>x² − 49 = (x − 7)(x + 7)</i> · <i>9x² − 25 = (3x)² − 5² = (3x − 5)(3x + 5)</i> ·
        <i>(x + 2)² − 9 = (x + 2 − 3)(x + 2 + 3) = (x − 1)(x + 5)</i></p>
      <p>⚠️ <i>x² − 49</i> n’est pas <i>(x − 7)²</i>, qui vaut x² − 14x + 49.</p>
      <p>Une expression est <b>factorisée</b> quand c’est un produit : la dernière opération à faire est une multiplication.
        <i>(x + 3)(2x − 1)</i> est factorisée ; <i>x(x + 3) + 5</i> ne l’est pas (on finit par + 5).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour vérifier une factorisation, développe-la : tu dois retrouver l’expression de départ.</div>
    `,
  });

  // ======================================================================
  // 5. Mettre en équation
  // ======================================================================
  // a × v + b écrit pour une vérification : « 3 × (−2) + 5 »
  const calculPour = (a, b, v) => `${a === 1 ? ecrire(v) : (a === -1 ? `${MOINS}${parentheses(v)}` : `${ecrire(a)} × ${parentheses(v)}`)}`
    + `${b ? ` ${plusOuMoins(b)}` : ''}`;

  // ax + b = cx + d, avec une solution entière (ni 0 ni 1)
  function equationAuHasard() {
    for (;;) {
      const s = entierSauf(-8, 12, [0, 1]);
      const [a, c] = [nonNul(1, 9), nonNul(1, 8)];
      const b = nonNul(1, 15);
      const k = a - c;
      const d = k * s + b;
      if (k === 0 || d === 0 || Math.abs(d) > 60 || (a < 0 && c < 0)) continue;
      if (Math.abs(k) === 1 && Math.random() < 0.5) continue;
      return { a, b, c, d, s };
    }
  }
  const texteEquation = ({ a, b, c, d }) => `${expr([b, a])} = ${expr([d, c])}`;

  // Résoudre ax + b = cx + d : [la règle, le calcul]
  function resoudre({ a, b, c, d }) {
    const [k, D] = [a - c, d - b];
    return ['On regroupe les x à gauche et les nombres à droite (un terme qui change de côté change de signe) :',
      `${termes([[a, 1], [-c, 1]])} = ${termes([[d, 0], [-b, 0]])}, `
      + (k === 1 ? `soit <b>x = ${ecrire(D)}</b>.` : `soit ${monome(k)} = ${ecrire(D)}, donc x = ${ecrire(D)} ÷ ${parentheses(k)} = <b>${ecrire(D / k)}</b>.`)];
  }

  // Une équation avec des parenthèses, à développer d'abord : { texte, developpe, moins, eq }
  function equationParentheses() {
    for (;;) {
      const s = entierSauf(-6, 10, [0]);
      const forme = parmi(['kx', 'moins', 'devant', 'deux']);
      if (forme === 'kx') { // k(x + p) = mx + q
        const [k, p] = [entier(2, 6), nonNul(1, 9)];
        const m = entierSauf(0, 8, [k]);
        const q = k * (s + p) - m * s;
        if (q === 0 || Math.abs(q) > 60) continue;
        const [L, R] = [[k * p, k], [q, m]];
        return { s, texte: `${k}${facteur(1, p).texte} = ${expr(R)}`, developpe: `${expr(L)} = ${expr(R)}`, moins: false, eq: { a: k, b: k * p, c: m, d: q } };
      }
      if (forme === 'moins') { // k(x + p) − (x + r) = q
        const [k, p, r] = [entier(3, 6), nonNul(1, 9), nonNul(1, 9)];
        const q = (k - 1) * s + k * p - r;
        if (q === 0 || Math.abs(q) > 60 || k * p - r === 0) continue;
        return {
          s,
          texte: `${k}${facteur(1, p).texte} ${MOINS} ${facteur(1, r).texte} = ${ecrire(q)}`,
          developpe: `${termes([[k, 1], [k * p, 0], [-1, 1], [-r, 0]])} = ${ecrire(q)}, soit ${expr([k * p - r, k - 1])} = ${ecrire(q)}`,
          moins: true,
          eq: { a: k - 1, b: k * p - r, c: 0, d: q },
        };
      }
      if (forme === 'devant') { // q − k(x + p) = mx
        const [k, p, m] = [entier(2, 5), nonNul(1, 6), entier(1, 5)];
        const q = (m + k) * s + k * p;
        if (q <= 0 || q > 60 || q - k * p === 0) continue;
        return {
          s,
          texte: `${q} ${MOINS} ${k}${facteur(1, p).texte} = ${monome(m)}`,
          developpe: `${termes([[q, 0], [-k, 1], [-k * p, 0]])} = ${monome(m)}, soit ${termes([[q - k * p, 0], [-k, 1]])} = ${monome(m)}`,
          moins: true,
          eq: { a: -k, b: q - k * p, c: m, d: 0 },
        };
      }
      // k(ax + b) = j(cx + d)
      const [k, j] = RM.melanger([2, 3, 4, 5]).slice(0, 2);
      const [a, c, b] = [entier(1, 3), entier(1, 3), nonNul(1, 9)];
      const d = (k * a * s + k * b - j * c * s) / j;
      if (k * a === j * c || !Number.isInteger(d) || d === 0 || Math.abs(d) > 9) continue;
      const [L, R] = [[k * b, k * a], [j * d, j * c]];
      return {
        s, texte: `${k}${facteur(a, b).texte} = ${j}${facteur(c, d).texte}`, developpe: `${expr(L)} = ${expr(R)}`, moins: false,
        eq: { a: k * a, b: k * b, c: j * c, d: j * d },
      };
    }
  }

  // Un problème à mettre en équation : { situation, question, quoi, equation, eq, pieges, x, unite, enFrancs, traduction, resolution }
  // (eq et les pièges : [a, b, c, d] pour ax + b = cx + d ; null pour une équation qui n'est pas du premier degré)
  function problemeAuHasard() {
    const [p1, p2] = deuxEnfants();
    return parmi([
      () => {
        const [x, e] = [entier(8, 14), entier(2, 5)];
        const T = 2 * x + e;
        const ils = ilsOuElles(p1, p2);
        return {
          situation: `${p2.nom} a ${e} ans de plus ${p1.que}. À ${ils === 'elles' ? 'elles' : 'eux'} deux, ${ils} ont ${T} ans. On note x l’âge ${p1.de}.`,
          question: `Quel âge a ${p1.nom} ?`,
          equation: `x + (x + ${e}) = ${T}`,
          eq: [2, e, 0, T],
          pieges: [[`x + (x ${MOINS} ${e}) = ${T}`, [2, -e, 0, T]], [`x + ${e}x = ${T}`, [1 + e, 0, 0, T]], [`x + ${e} = ${T}`, [1, e, 0, T]],
            [`2x = ${T} + ${e}`, [2, 0, 0, T + e]]],
          x,
          unite: 'ans',
          traduction: `L’âge ${p2.de} est x + ${e} ; la somme des deux âges est x + (x + ${e}).`,
          resolution: `2x + ${e} = ${T}, donc 2x = ${T - e} et x = <b>${x}</b> : ${p1.nom} a ${x} ans (et ${p2.nom} ${x + e} ans).`,
        };
      },
      () => {
        let k;
        let x;
        do { [k, x] = [entier(5, 7), entier(8, 14)]; } while (k * x < 55 || k * x > 85);
        const S = x + k * x;
        const grand = parmi(['Papi', 'Mamie']);
        const ils = ilsOuElles(p1, { il: grand === 'Papi' ? 'il' : 'elle' });
        return {
          situation: `${grand} a ${k} fois l’âge ${p1.de}. À ${ils === 'elles' ? 'elles' : 'eux'} deux, ${ils} ont ${S} ans. On note x l’âge ${p1.de}.`,
          question: `Quel âge a ${p1.nom} ?`,
          equation: `x + ${k}x = ${S}`,
          eq: [1 + k, 0, 0, S],
          pieges: [[`${k}x = ${S}`, [k, 0, 0, S]], [`x + ${k} = ${S}`, [1, k, 0, S]], [`x + (x + ${k}) = ${S}`, [2, k, 0, S]]],
          x,
          unite: 'ans',
          traduction: `${grand} a ${k}x ans ; la somme des deux âges est x + ${k}x.`,
          resolution: `x + ${k}x = ${k + 1}x, donc ${k + 1}x = ${S} et x = ${S} ÷ ${k + 1} = <b>${x}</b> : ${p1.nom} a ${x} ans.`,
        };
      },
      () => {
        // Des prix en francs (XPF) : un cahier de 150 à 400 F, un classeur de 300 à 800 F
        const n = entier(2, 6);
        const x = parmi([150, 200, 250, 300, 350, 400]);
        const c = parmi([300, 400, 450, 500, 600, 750, 800].filter(v => v !== x));
        const T = n * x + c;
        const C = ecrire(c);
        return {
          situation: `${p1.nom} achète ${n} cahiers au même prix et un classeur à ${francs(c)}. ${p1.Il} paie ${francs(T)} en tout. `
            + 'On note x le prix d’un cahier, en francs.',
          question: 'Combien coûte un cahier ?',
          equation: `${n}x + ${C} = ${ecrire(T)}`,
          eq: [n, c, 0, T],
          pieges: [[`${n}(x + ${C}) = ${ecrire(T)}`, [n, n * c, 0, T]], [`x + ${C} = ${ecrire(T)}`, [1, c, 0, T]],
            [`${n}x = ${ecrire(T)} + ${C}`, [n, 0, 0, T + c]], [`${C}x + ${n} = ${ecrire(T)}`, [c, n, 0, T]]],
          x,
          unite: 'F',
          enFrancs: true,
          traduction: `${n} cahiers coûtent ${n}x F ; avec le classeur : ${n}x + ${C}.`,
          resolution: `${n}x = ${ecrire(T)} ${MOINS} ${C} = ${ecrire(n * x)}, donc x = ${ecrire(n * x)} ÷ ${n} = <b>${ecrire(x)}</b> : un cahier coûte ${francs(x)}.`,
        };
      },
      () => {
        const [x, e] = [entier(3, 15), entier(2, 9)];
        const P = 4 * x + 2 * e;
        return {
          situation: `La longueur d’un rectangle mesure ${mesure(e, 'cm')} de plus que sa largeur. Son périmètre est ${mesure(P, 'cm')}. `
            + 'On note x sa largeur, en cm.',
          question: 'Quelle est la largeur du rectangle ?',
          equation: `2x + 2(x + ${e}) = ${P}`,
          eq: [4, 2 * e, 0, P],
          pieges: [[`x + (x + ${e}) = ${P}`, [2, e, 0, P]], [`x(x + ${e}) = ${P}`, null], [`2x + 2x + ${e} = ${P}`, [4, e, 0, P]],
            [`2x + (x + ${e}) = ${P}`, [3, e, 0, P]]],
          x,
          unite: 'cm',
          traduction: `La longueur est x + ${e}. Le périmètre, c’est 2 × largeur + 2 × longueur : 2x + 2(x + ${e}).`,
          resolution: `4x + ${2 * e} = ${P}, donc 4x = ${4 * x} et x = <b>${x}</b> : la largeur est ${mesure(x, 'cm')}.`,
        };
      },
      () => {
        const [x, m] = [entier(10, 30), entier(2, 8)];
        const T = 3 * x - m;
        const ils = ilsOuElles(p1, p2);
        return {
          situation: `${p1.nom} a x billes. ${p2.nom} a ${m} billes de moins que le double du nombre de billes ${p1.de}. Ensemble, ${ils} ont ${T} billes.`,
          question: `Combien de billes a ${p1.nom} ?`,
          equation: `x + (2x ${MOINS} ${m}) = ${T}`,
          eq: [3, -m, 0, T],
          pieges: [[`x + (2x + ${m}) = ${T}`, [3, m, 0, T]], [`x + 2(x ${MOINS} ${m}) = ${T}`, [3, -2 * m, 0, T]], [`2x ${MOINS} ${m} = ${T}`, [2, -m, 0, T]],
            [`x + (x ${MOINS} ${m}) = ${T}`, [2, -m, 0, T]]],
          x,
          unite: 'billes',
          traduction: `${p2.nom} a 2x ${MOINS} ${m} billes ; ensemble : x + (2x ${MOINS} ${m}).`,
          resolution: `3x ${MOINS} ${m} = ${T}, donc 3x = ${T + m} et x = <b>${x}</b> : ${p1.nom} a ${x} billes.`,
        };
      },
      () => {
        let a;
        let b;
        do { [a, b] = [entier(2, 6), entier(2, 9)]; } while (a === b);
        const x = entierSauf(-8, 12, [0, -b]);
        const T = a * (x + b);
        return {
          situation: `Roxy pense à un nombre x. Elle lui ajoute ${b}, puis elle multiplie le résultat par ${a} : elle trouve ${ecrire(T)}.`,
          question: 'Quel est ce nombre ?',
          equation: `${a}(x + ${b}) = ${ecrire(T)}`,
          eq: [a, a * b, 0, T],
          pieges: [[`${a}x + ${b} = ${ecrire(T)}`, [a, b, 0, T]], [`x + ${b} × ${a} = ${ecrire(T)}`, [1, a * b, 0, T]],
            [`${b}(x + ${a}) = ${ecrire(T)}`, [b, a * b, 0, T]], [`x + ${b} + ${a} = ${ecrire(T)}`, [1, a + b, 0, T]]],
          x,
          unite: '',
          traduction: `« Ajouter ${b} » : x + ${b} ; « puis multiplier le résultat par ${a} » : ${a}(x + ${b}), avec des parenthèses.`,
          resolution: `x + ${b} = ${ecrire(T)} ÷ ${a} = ${ecrire(x + b)}, donc x = ${ecrire(x + b)} ${MOINS} ${b} = <b>${ecrire(x)}</b>.`,
        };
      },
      () => {
        let a;
        let b;
        let x;
        let F;
        // Des prix en francs : une place de 1 000 à 1 500 F, de 400 à 900 F avec la carte
        do {
          [a, b, x] = [100 * entier(10, 15), 100 * entier(4, 9), entier(4, 15)];
          F = (a - b) * x;
        } while (a - b < 300 || F > 9000 || F < 2000);
        const [A, B, Fe] = [ecrire(a), ecrire(b), ecrire(F)];
        return {
          situation: `Au cinéma, le tarif A coûte ${francs(a)} la séance. Le tarif B coûte ${francs(F)} par an, plus ${francs(b)} la séance. `
            + 'On note x le nombre de séances.',
          question: 'Pour combien de séances les deux tarifs coûtent-ils le même prix ?',
          quoi: 'Quelle équation traduit « les deux tarifs coûtent le même prix » ?',
          equation: `${A}x = ${Fe} + ${B}x`,
          eq: [a, 0, b, F],
          pieges: [[`${A}x = ${Fe}x + ${B}`, [a, 0, F, b]], [`${A} = ${Fe} + ${B}x`, [0, a, b, F]], [`${A}x + ${B}x = ${Fe}`, [a + b, 0, 0, F]]],
          x,
          unite: 'séances',
          traduction: `Avec le tarif A, x séances coûtent ${A}x F ; avec le tarif B, ${Fe} + ${B}x F.`,
          resolution: `${A}x ${MOINS} ${B}x = ${Fe}, soit ${ecrire(a - b)}x = ${Fe}, donc x = ${Fe} ÷ ${ecrire(a - b)} = <b>${x}</b> séances.`,
        };
      },
      () => {
        let e;
        do { e = equationAuHasard(); } while (e.a < 2 || e.c < 2);
        const { a, b, c, d, s } = e;
        const etape = (k, m) => `on multiplie par ${k}, puis on ${m > 0 ? 'ajoute' : 'soustrait'} ${Math.abs(m)}`;
        return {
          situation: `On choisit un nombre x. Programme A : ${etape(a, b)}. Programme B : ${etape(c, d)}.`,
          question: 'Pour quel nombre les deux programmes donnent-ils le même résultat ?',
          quoi: 'Quelle équation traduit « les deux programmes donnent le même résultat » ?',
          equation: texteEquation(e),
          eq: [a, b, c, d],
          pieges: [[`${expr([d, a])} = ${expr([b, c])}`, [a, d, c, b]], [`${a}(x ${plusOuMoins(b)}) = ${c}(x ${plusOuMoins(d)})`, [a, a * b, c, c * d]],
            [`${expr([b, c])} = ${expr([d, a])}`, [c, b, a, d]], [`${expr([b, a])} = ${expr([-d, c])}`, [a, b, c, -d]]],
          x: s,
          unite: '',
          traduction: `Programme A : ${expr([b, a])} ; programme B : ${expr([d, c])}.`,
          resolution: resoudre(e)[1],
        };
      },
    ])();
  }
  // La solution d'une équation [a, b, c, d] (null s'il n'y en a pas une seule)
  const solutionDe = ([a, b, c, d]) => (a === c ? null : (d - b) / (a - c));

  ajouterEtape({
    id: '3e-nombres-equations',
    banque: ['resoudre', 'parentheses', 'parentheses', 'equation', 'equation', 'equation', 'probleme', 'probleme',
      'solution', 'solution', 'transformer', 'transformer', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'resoudre') {
        const e = equationAuHasard();
        return nombre({
          consigne: 'Résous l’équation',
          enonce: `${texteEquation(e)}<br>x = ___`,
          reponse: e.s,
          touches: TOUCHES,
          explication: `${resoudre(e).join('<br>')}<br>Vérifie : ${calculPour(e.a, e.b, e.s)} = ${ecrire(e.a * e.s + e.b)} `
            + `et ${calculPour(e.c, e.d, e.s)} = ${ecrire(e.c * e.s + e.d)} ✔`,
        });
      }
      if (sorte === 'parentheses') {
        const q = equationParentheses();
        return nombre({
          consigne: 'Résous l’équation (développe d’abord)',
          enonce: `${q.texte}<br>x = ___`,
          reponse: q.s,
          touches: TOUCHES,
          explication: `On développe : ${q.developpe}.${q.moins ? ' (Le − devant la parenthèse change les signes.)' : ''}<br>${resoudre(q.eq)[1]}`,
        });
      }
      if (sorte === 'equation') {
        const pb = problemeAuHasard();
        // Les pièges : jamais une équation qui aurait la même solution (elle serait juste aussi)
        const pieges = pb.pieges.filter(([, eq]) => eq === null || solutionDe(eq) === null || !egaux(solutionDe(eq), pb.x)).map(([t]) => t);
        return choix({
          consigne: 'Mets le problème en équation',
          enonce: `${pb.situation} ${pb.quoi || 'Quelle équation traduit ce problème ?'}`,
          reponse: pb.equation,
          garder: pieges.slice(0, 1),
          pieges: [pieges[0], ...RM.melanger(pieges.slice(1)).slice(0, 2)],
          explication: `${pb.traduction}<br>L’équation est <b>${pb.equation}</b> (sa solution est x = ${ecrire(pb.x)}).`,
        });
      }
      if (sorte === 'probleme') {
        const pb = problemeAuHasard();
        return nombre({
          consigne: 'Mets en équation, puis résous',
          enonce: `${pb.situation} ${pb.question}`,
          reponse: pb.x,
          unite: pb.unite,
          enFrancs: Boolean(pb.enFrancs),
          touches: TOUCHES,
          explication: `${pb.traduction} Équation : ${pb.equation}.<br>${pb.resolution}`,
        });
      }
      if (sorte === 'solution') {
        const e = equationAuHasard();
        const { a, b, c, d, s } = e;
        const [k, D] = [a - c, d - b];
        // L'erreur classique : b passe de l'autre côté sans changer de signe ; puis le signe de cx, soustraire au lieu de diviser,
        // oublier de diviser, le signe du résultat. Seulement des entiers (la réponse en est un : sinon, on la reconnaîtrait)
        const entierSimple = v => simple(v) && Number.isInteger(net(v));
        const classique = (d + b) / k;
        const autres = [a + c !== 0 ? D / (a + c) : null, a + c !== 0 ? (d + b) / (a + c) : null, D - k, D, -s];
        return choix({
          consigne: 'Résous l’équation',
          enonce: `Quelle est la solution de ${texteEquation(e)} ?`,
          reponse: s,
          ...avecErreur(s, [classique].filter(entierSimple), autres.filter(entierSimple)),
          explication: resoudre(e).join('<br>')
            + (entierSimple(classique) ? `<br>⚠️ Pas ${ecrire(classique)} : quand ${ecrire(Math.abs(b))} change de côté, il change de signe.` : ''),
        });
      }
      if (sorte === 'transformer') {
        let e;
        do { e = equationAuHasard(); } while (e.a + e.c === 0);
        const { a, b, c, d, s } = e;
        const [k, D] = [a - c, d - b];
        const eq = (A, Dd) => (A !== 0 && !egaux(Dd / A, s) ? `${monome(A)} = ${ecrire(Dd)}` : null);
        const classique = eq(a + c, D);
        return choix({
          consigne: 'Regroupe les x à gauche et les nombres à droite',
          enonce: `${texteEquation(e)}, donc ___`,
          reponse: `${monome(k)} = ${ecrire(D)}`,
          garder: classique ? [classique] : [],
          pieges: [classique, eq(k, d + b), eq(a + c, d + b), eq(k, -D)].filter(Boolean),
          explication: `Un terme qui change de côté change de signe : ${termes([[a, 1], [-c, 1]])} = ${termes([[d, 0], [-b, 0]])}, `
            + `soit <b>${monome(k)} = ${ecrire(D)}</b>.`
            + (classique ? `<br>⚠️ Pas ${classique} : ${monome(c)} passe à gauche en devenant ${monome(-c)}.` : ''),
        });
      }
      // Vrai ou faux : tester une solution
      const vrai = Math.random() < 0.5;
      const e = equationAuHasard();
      const { a, b, c, d, s } = e;
      const fausses = [(d + b) / (a - c), -s, a + c !== 0 ? (d - b) / (a + c) : null].filter(v => v !== null && Number.isInteger(v) && v !== s);
      const v = vrai ? s : parmi(fausses);
      const [g, dr] = [a * v + b, c * v + d];
      return vraiFaux({
        enonce: `${ecrire(v)} est une solution de l’équation ${texteEquation(e)}.`,
        vrai,
        explication: `Pour x = ${ecrire(v)} : ${calculPour(a, b, v)} = ${ecrire(g)} et ${calculPour(c, d, v)} = ${ecrire(dr)}.<br>`
          + (vrai ? `Les deux côtés sont égaux : <b>${ecrire(v)} est une solution</b>.`
            : `Les deux côtés ne sont pas égaux : <b>${ecrire(v)} n’est pas une solution</b> (la solution est ${ecrire(s)}).`),
      });
    },
    titreLecon: 'Mettre en équation',
    lecon: `
      <h4>Résoudre une équation</h4>
      <p>On peut ajouter ou soustraire le même nombre (ou le même nombre de x) aux deux côtés, et multiplier ou diviser les deux côtés
        par un même nombre non nul. En pratique, un terme qui <b>change de côté change de signe</b>.<br>
        👉 <i>5x − 3 = 2x + 9</i> → 5x − 2x = 9 + 3 → 3x = 12 → x = 12 ÷ 3 = <b>4</b></p>
      <p>Avec des parenthèses, on développe d’abord :
        <i>3(x − 2) = 2x + 5</i> → 3x − 6 = 2x + 5 → 3x − 2x = 5 + 6 → x = <b>11</b>.<br>
        ⚠️ Un − devant une parenthèse change tous les signes : <i>−(x − 4) = −x + 4</i>.</p>
      <p>Pour savoir si un nombre est <b>solution</b>, on le met à la place de x : les deux côtés doivent être égaux.</p>
      <h4>Mettre un problème en équation</h4>
      <p>1. On choisit l’inconnue x (dire ce qu’elle représente). 2. On traduit l’énoncé par une équation.
        3. On la résout. 4. On vérifie et on répond par une phrase.</p>
      <p>👉 Teva a 3 ans de plus que Léa ; à eux deux, ils ont 29 ans. x = l’âge de Léa, donc Teva a x + 3 ans :
        <i>x + (x + 3) = 29</i> → 2x + 3 = 29 → 2x = 26 → x = 13. Léa a 13 ans, Teva 16 ans.</p>
      <p>Pour traduire : « le double » → 2x ; « 5 de plus » → x + 5 ; « j’ajoute 7, puis je multiplie le résultat par 3 » → 3(x + 7) ;
        le périmètre d’un rectangle → 2 × largeur + 2 × longueur.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie toujours ta solution dans l’énoncé de départ :
        13 + 16 = 29 ✔</div>
    `,
  });

  // ======================================================================
  // 6. L'équation produit nul
  // ======================================================================
  // Une solution est une fraction [n, d] simplifiée : « 3/2 », « −5 » dans les boutons ; en HTML pour les explications
  const racineTexte = r => (r[1] === 1 ? ecrire(r[0]) : fracTexte(r[0], r[1]));
  const racineHtml = r => (r[1] === 1 ? ecrire(r[0]) : frac(r[0], r[1]));
  const oppose = r => [-r[0], r[1]];
  // Deux solutions, dans l'ordre des facteurs (« 2 et −5 ») ou rangées de la plus petite à la plus grande
  const deux = (r1, r2) => `${racineTexte(r1)} et ${racineTexte(r2)}`;
  const deuxRangees = (r1, r2) => (valeurF(r1) <= valeurF(r2) ? deux(r1, r2) : deux(r2, r1));
  const deuxHtml = (r1, r2) => (valeurF(r1) <= valeurF(r2) ? `${racineHtml(r1)} et ${racineHtml(r2)}` : `${racineHtml(r2)} et ${racineHtml(r1)}`);
  // Les pièges « deux solutions » : pas la même paire que la réponse (dans n'importe quel ordre), pas de doublons
  const cle = rs => rs.map(r => net(valeurF(r))).sort((u, v) => u - v).join('|');
  function piegesSolutions(reponse, classiques, autres) {
    const vues = new Set([cle(reponse)]);
    const valable = p => {
      if (!p || vues.has(cle(p.rs))) return false;
      vues.add(cle(p.rs));
      return true;
    };
    const garde = classiques.find(valable) || null;
    const reste = RM.melanger([...classiques, ...autres]).filter(valable).slice(0, garde ? 2 : 3);
    return { garde, garder: garde ? [garde.texte] : [], pieges: [...(garde ? [garde] : []), ...reste].map(p => p.texte) };
  }
  // Une paire de solutions écrite dans l'ordre des facteurs, ou rangée ; une solution seule
  const paire = (r1, r2) => ({ rs: [r1, r2], texte: deux(r1, r2) });
  const paireRangee = (r1, r2) => ({ rs: [r1, r2], texte: deuxRangees(r1, r2) });
  const seule = r => ({ rs: [r], texte: racineTexte(r) });

  // Un facteur ax + b, dont la solution de « ax + b = 0 » est simple ; decimale : une solution décimale (pour la taper)
  function facteurNul(decimale = false) {
    const a = parmi(decimale ? [1, 1, 1, 2, 4, 5, -1] : [1, 1, 1, 2, 3, 4, 5, -1]);
    const b = a === -1 ? entier(1, 9) : nonNul(1, 9);
    return { a, b, f: facteur(a, b), r: simplifier(-b, a) };
  }
  // « 2x − 3 = 0 donne 2x = 3, x = 3/2 »
  function resoudreFacteur({ a, b, f, r }, decimale = false) {
    const t = f.texte.slice(1, -1);
    const valeur = decimale ? ecrire(net(-b / a)) : racineHtml(r);
    return Math.abs(a) === 1 ? `${t} = 0 donne x = ${valeur}` : `${t} = 0 donne ${monome(a)} = ${ecrire(-b)}, x = ${valeur}`;
  }
  // Deux facteurs dont les solutions sont différentes (et pas opposées : sinon, un piège de signe serait juste aussi)
  function deuxFacteurs(decimale = false, entiers = false) {
    for (;;) {
      const [F1, F2] = [facteurNul(decimale), facteurNul(decimale)];
      if (entiers && (Math.abs(F1.a) !== 1 || Math.abs(F2.a) !== 1)) continue;
      const [v1, v2] = [valeurF(F1.r), valeurF(F2.r)];
      if (!egaux(v1, v2) && !egaux(v1, -v2)) return [F1, F2];
    }
  }
  // Un facteur x + b (ou b − x) où l'on a remplacé x par v : « (−5 − 5) », « (6 − (−5)) »
  const remplacerX = ({ a, b }, v) => (a === -1 ? `(${b} ${MOINS} ${parentheses(v)})` : `(${ecrire(v)} ${plusOuMoins(b)})`);
  // La mise en garde sur les signes, s'il y a un facteur x + b (avec b positif)
  function attentionSignes(F1, F2) {
    const F = [F1, F2].find(G => G.a === 1 && G.b > 0);
    return F ? `<br>⚠️ Attention aux signes : ${F.f.texte.slice(1, -1)} = 0 donne x = ${ecrire(-F.b)}, et pas ${F.b}.` : '';
  }

  ajouterEtape({
    id: '3e-nombres-produit-nul',
    banque: ['solutions', 'solutions', 'factoriserPuis', 'factoriserPuis', 'carre', 'carre', 'plusGrande', 'plusGrande',
      'probleme', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'solutions') {
        const [F1, F2] = deuxFacteurs();
        const [r1, r2] = [F1.r, F2.r];
        // Les erreurs : les deux signes, un seul signe, oublier de diviser par a, diviser à l'envers
        const autres = [paire(oppose(r1), r2), paire(r1, oppose(r2))];
        if (Math.abs(F1.a) > 1) autres.push(paire([-F1.b, 1], r2), paire(simplifier(-F1.a, F1.b), r2));
        if (Math.abs(F2.a) > 1) autres.push(paire(r1, [-F2.b, 1]), paire(r1, simplifier(-F2.a, F2.b)));
        const p = piegesSolutions([r1, r2], [paire(oppose(r1), oppose(r2))], autres);
        return choix({
          consigne: 'Résous l’équation produit nul',
          enonce: `${F1.f.texte}${F2.f.texte} = 0`,
          reponse: deux(r1, r2),
          garder: p.garder,
          pieges: p.pieges,
          explication: `Un produit est nul si l’un de ses facteurs est nul :<br>${resoudreFacteur(F1)} ; ${resoudreFacteur(F2)}.`
            + ` Les solutions sont <b>${racineHtml(r1)} et ${racineHtml(r2)}</b>.${attentionSignes(F1, F2)}`,
        });
      }
      if (sorte === 'plusGrande') {
        const [F1, F2] = deuxFacteurs(true);
        const grande = Math.random() < 0.5;
        const [v1, v2] = [net(-F1.b / F1.a), net(-F2.b / F2.a)];
        const v = grande ? Math.max(v1, v2) : Math.min(v1, v2);
        return nombre({
          consigne: 'Résous l’équation produit nul',
          enonce: `L’équation ${F1.f.texte}${F2.f.texte} = 0 a deux solutions. Quelle est la plus ${grande ? 'grande' : 'petite'} ?`,
          reponse: v,
          touches: TOUCHES,
          explication: `Un produit est nul si l’un de ses facteurs est nul :<br>${resoudreFacteur(F1, true)} ; ${resoudreFacteur(F2, true)}.<br>`
            + `La plus ${grande ? 'grande' : 'petite'} solution est <b>${ecrire(v)}</b>.`,
        });
      }
      if (sorte === 'carre') {
        const a = entier(2, 12);
        const k = a * a;
        const negatif = Math.random() < 0.2;
        const forme = parmi(['simple', 'moins', 'plus']);
        let texte = `x² = ${ecrire(negatif ? -k : k)}`;
        let etape = '';
        let signeFaux = null; // x² + m = n : se tromper de signe en passant m de l'autre côté
        if (forme === 'moins') {
          texte = negatif ? `x² + ${k} = 0` : `x² ${MOINS} ${k} = 0`;
          etape = `${texte} donne x² = ${ecrire(negatif ? -k : k)}.<br>`;
        }
        if (forme === 'plus') {
          const m = entier(2, 20);
          const n = negatif ? m - k : m + k;
          texte = `x² + ${m} = ${ecrire(n)}`;
          etape = `${texte} donne x² = ${ecrire(n)} ${MOINS} ${m} = ${ecrire(n - m)}.<br>`;
          const faux = Math.sqrt(n + m);
          if (n + m > 0 && Number.isInteger(faux)) signeFaux = `${ecrire(-faux)} et ${faux}`;
        }
        const deuxSol = `${ecrire(-a)} et ${a}`;
        const sansRacine = `${ecrire(-k)} et ${k}`;
        const garder = negatif ? [deuxSol] : [String(a), sansRacine];
        const pieges = negatif
          ? [deuxSol, String(a), ecrire(-a), signeFaux]
          : [String(a), sansRacine, k % 2 === 0 && k / 2 !== a ? `${ecrire(-k / 2)} et ${ecrire(k / 2)}` : null, 'aucune solution', ecrire(-a), signeFaux];
        return choix({
          consigne: 'Résous l’équation',
          enonce: texte,
          reponse: negatif ? 'aucune solution' : deuxSol,
          garder,
          pieges: pieges.filter(Boolean),
          explication: negatif
            ? `${etape}Un carré n’est jamais négatif : x² = ${ecrire(-k)} n’a <b>aucune solution</b>.`
            : `${etape}Deux nombres ont pour carré ${k} : ${a} et ${ecrire(-a)} (car ${a}² = ${k} et (${ecrire(-a)})² = ${k}).<br>`
              + `Les solutions sont <b>${deuxSol}</b> (pas seulement ${a}, et pas ${sansRacine} : on cherche le nombre dont le carré vaut ${k}).`,
        });
      }
      if (sorte === 'factoriserPuis') {
        const forme = parmi(['x', 'x', 'carres', 'decale']);
        if (forme === 'x') {
          // ax² + bx = 0 (ou ax² = −bx) : x(ax + b) = 0, les solutions sont 0 et −b/a
          const [a, m] = [parmi([1, 1, 2, 3]), nonNul(2, 9)];
          const b = a * m;
          const r = -m;
          const egal = Math.random() < 0.5;
          const texte = egal ? `${monome(a, 2)} = ${monome(-b)}` : `${expr([0, b, a])} = 0`;
          const F = facteur(1, m);
          const p = piegesSolutions([[0, 1], [r, 1]], [seule([r, 1])],
            [paireRangee([0, 1], [-r, 1]), seule([-r, 1]), a > 1 ? paireRangee([0, 1], [-b, 1]) : null]);
          return choix({
            consigne: 'Factorise, puis résous',
            enonce: texte,
            reponse: deuxRangees([0, 1], [r, 1]),
            garder: p.garder,
            pieges: p.pieges,
            explication: `${egal ? `On passe tout à gauche : ${expr([0, b, a])} = 0, puis on` : 'On'} factorise : ${monome(a)}${F.texte} = 0.<br>`
              + `Donc ${monome(a)} = 0 ou ${F.texte.slice(1, -1)} = 0 : x = 0 ou x = ${ecrire(r)}. Les solutions sont <b>${deuxRangees([0, 1], [r, 1])}</b>.`
              + (egal ? '<br>⚠️ Ne divise pas les deux côtés par x : tu perdrais la solution 0.'
                : `<br>⚠️ Pas seulement ${ecrire(r)} : ${a === 1 ? 'le facteur x est nul aussi pour x = 0' : `${monome(a)} = 0 donne aussi x = 0`}.`),
          });
        }
        if (forme === 'carres') {
          // a²x² − n² = 0 : (ax − n)(ax + n) = 0, les solutions sont −n/a et n/a
          let a;
          let n;
          do { [a, n] = [entier(2, 5), entier(1, 9)]; } while (pgcd(a, n) !== 1);
          const r = [n, a];
          const p = piegesSolutions([oppose(r), r], [paireRangee([-n * n, a * a], [n * n, a * a])],
            [seule(r), paireRangee(simplifier(-a, n), simplifier(a, n)), paireRangee([-n, a * a], [n, a * a])]);
          return choix({
            consigne: 'Factorise, puis résous',
            enonce: `${a * a}x² ${MOINS} ${n * n} = 0`,
            reponse: deuxRangees(oppose(r), r),
            garder: p.garder,
            pieges: p.pieges,
            explication: `${a * a}x² ${MOINS} ${n * n} = (${a}x)² ${MOINS} ${n}² = (${a}x ${MOINS} ${n})(${a}x + ${n}) = 0.<br>`
              + `Donc ${a}x = ${n} ou ${a}x = ${ecrire(-n)} : x = ${racineHtml(r)} ou x = ${racineHtml(oppose(r))}. `
              + `Les solutions sont <b>${deuxHtml(oppose(r), r)}</b>.`
              + (p.garde && p.garde.rs.length === 2 && egaux(Math.abs(valeurF(p.garde.rs[0])), n * n / (a * a))
                ? `<br>⚠️ Pas ${p.garde.texte} : ${a * a}x² = (${a}x)² et ${n * n} = ${n}², on prend ${a}x et ${n}.` : ''),
          });
        }
        // (x + p)² − n² = 0 : (x + p − n)(x + p + n) = 0
        let p0;
        let n;
        do { [p0, n] = [nonNul(1, 6), entier(2, 7)]; } while (Math.abs(p0) === n);
        const [r1, r2] = [[n - p0, 1], [-n - p0, 1]];
        const q = piegesSolutions([r1, r2], [paireRangee([n * n - p0, 1], [-n * n - p0, 1])],
          [paireRangee(oppose(r1), oppose(r2)), seule(r1), seule(r2)]);
        const G = facteur(1, p0);
        return choix({
          consigne: 'Factorise, puis résous',
          enonce: `${G.texte}² ${MOINS} ${n * n} = 0`,
          reponse: deuxRangees(r1, r2),
          garder: q.garder,
          pieges: q.pieges,
          explication: `${G.texte}² ${MOINS} ${n}² = (${expr([p0, 1])} ${MOINS} ${n})(${expr([p0, 1])} + ${n}) = ${facteur(1, p0 - n).texte}${facteur(1, p0 + n).texte} = 0.<br>`
            + `Donc x = ${ecrire(r1[0])} ou x = ${ecrire(r2[0])}. Les solutions sont <b>${deuxRangees(r1, r2)}</b>.`
            + (q.garde && q.garde.rs.length === 2 ? `<br>⚠️ Pas ${q.garde.texte} : il faut ${n * n} = ${n}² (on prend ${n}, pas ${n * n}).` : ''),
        });
      }
      if (sorte === 'probleme') {
        const facon = parmi(['carre', 'disque', 'rectangle', 'negatif']);
        if (facon === 'carre') {
          const c = entier(4, 15);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Un jardin carré a une aire de ${mesure(c * c, 'm²')}. Quelle est la longueur de son côté ?`,
            reponse: c,
            unite: 'm',
            touches: TOUCHES,
            explication: `On note x le côté : x² = ${c * c}, donc x = ${c} ou x = ${ecrire(-c)}.<br>`
              + `Une longueur est positive : le côté mesure <b>${mesure(c, 'm')}</b>.`,
          });
        }
        if (facon === 'disque') {
          const r = entier(2, 10);
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Un disque a une aire de ${r * r}π&nbsp;cm² (l’aire d’un disque de rayon r est π × r²). Quel est son rayon ?`,
            reponse: r,
            unite: 'cm',
            touches: TOUCHES,
            explication: `π × r² = ${r * r}π, donc r² = ${r * r}, et r = ${r} ou r = ${ecrire(-r)}.<br>`
              + `Un rayon est positif : il mesure <b>${mesure(r, 'cm')}</b>.`,
          });
        }
        if (facon === 'rectangle') {
          const [k, x] = [parmi([2, 3]), entier(3, 9)];
          return nombre({
            consigne: 'Résous le problème',
            enonce: `Un rectangle est ${k === 2 ? 'deux' : 'trois'} fois plus long que large. Son aire est ${mesure(k * x * x, 'cm²')}. `
              + 'Quelle est sa largeur ?',
            reponse: x,
            unite: 'cm',
            touches: TOUCHES,
            explication: `On note x la largeur : la longueur est ${k}x, et l’aire ${k}x × x = ${k}x². ${k}x² = ${k * x * x}, donc x² = ${x * x}.<br>`
              + `x = ${x} ou x = ${ecrire(-x)} ; une longueur est positive : la largeur est <b>${mesure(x, 'cm')}</b>.`,
          });
        }
        const a = entier(2, 12);
        return nombre({
          consigne: 'Résous le problème',
          enonce: `Roxy pense à un nombre négatif. Son carré est égal à ${a * a}. Quel est ce nombre ?`,
          reponse: -a,
          touches: TOUCHES,
          explication: `x² = ${a * a} donne x = ${a} ou x = ${ecrire(-a)}.<br>Le nombre est négatif : c’est <b>${ecrire(-a)}</b>.`,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['solution', 'solution', 'carre', 'carre', 'regle']);
      if (genre === 'solution') {
        const [F1, F2] = deuxFacteurs(false, true);
        const racine = parmi([F1.r[0], F2.r[0]]);
        const v = vrai ? racine : -racine;
        const [u, w] = [F1.a * v + F1.b, F2.a * v + F2.b];
        return vraiFaux({
          enonce: `${ecrire(v)} est une solution de l’équation ${F1.f.texte}${F2.f.texte} = 0.`,
          vrai,
          explication: `Pour x = ${ecrire(v)} : ${remplacerX(F1, v)}${remplacerX(F2, v)} = ${parentheses(u)} × ${parentheses(w)} = ${ecrire(u * w)}.<br>`
            + (vrai ? `Le produit est nul : <b>${ecrire(v)} est une solution</b>.`
              : `Le produit n’est pas nul : <b>${ecrire(v)} n’est pas une solution</b> (les solutions sont ${ecrire(F1.r[0])} et ${ecrire(F2.r[0])}).`),
        });
      }
      if (genre === 'carre') {
        const a = entier(2, 12);
        const k = a * a;
        const [enonce, explication] = parmi(vrai ? [
          [`L’équation x² = ${k} a deux solutions : ${a} et ${ecrire(-a)}.`, `${a}² = ${k} et (${ecrire(-a)})² = ${k}.`],
          [`L’équation x² = ${ecrire(-k)} n’a pas de solution.`, 'un carré n’est jamais négatif.'],
        ] : [
          [`L’équation x² = ${k} a une seule solution : ${a}.`, `il y en a deux, ${a} et ${ecrire(-a)}, car (${ecrire(-a)})² = ${k} aussi.`],
          [`L’équation x² = ${ecrire(-k)} a deux solutions : ${a} et ${ecrire(-a)}.`, `${a}² = ${k} et (${ecrire(-a)})² = ${k}, pas ${ecrire(-k)} : un carré n’est jamais négatif, il n’y a pas de solution.`],
        ]);
        return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['Si A × B = 0, alors A = 0 ou B = 0.', 'un produit est nul si l’un (au moins) de ses facteurs est nul.'],
        ['Si un produit de deux facteurs est nul, alors l’un au moins des facteurs est nul.', 'c’est la règle du produit nul.'],
      ] : [
        ['Si A × B = 0, alors A = 0 et B = 0.', 'il suffit que l’un des deux soit nul : 0 × 5 = 0.'],
        ['Si A × B = 0, alors A = 0.', 'ce peut être B qui est nul : 5 × 0 = 0.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'L’équation produit nul',
    lecon: `
      <h4>La règle du produit nul</h4>
      <p>Un produit est nul si l’un (au moins) de ses facteurs est nul : <b>A × B = 0</b> équivaut à <b>A = 0 ou B = 0</b>.</p>
      <p>👉 <i>(x − 2)(x + 5) = 0</i> : x − 2 = 0 ou x + 5 = 0, donc x = 2 ou x = −5. Deux solutions : <b>2 et −5</b>.<br>
        👉 <i>(2x − 3)(x + 4) = 0</i> : 2x = 3, x = ${frac(3, 2)} ; ou x = −4.</p>
      <p>⚠️ Attention aux signes : x + 5 = 0 donne x = <b>−5</b> (pas 5), et 3 − x = 0 donne x = 3.</p>
      <h4>Factoriser d’abord</h4>
      <p>On met tout d’un côté (= 0), on factorise, puis on applique la règle :<br>
        👉 <i>x² = 5x</i> → x² − 5x = 0 → x(x − 5) = 0 → x = 0 ou x = 5.
        ⚠️ Ne divise pas par x : tu perdrais la solution 0.<br>
        👉 <i>4x² − 9 = 0</i> → (2x − 3)(2x + 3) = 0 → x = ${frac(3, 2)} ou x = ${frac(-3, 2)}.<br>
        👉 <i>(x + 1)² − 16 = 0</i> → (x + 1 − 4)(x + 1 + 4) = 0 → (x − 3)(x + 5) = 0 → x = 3 ou x = −5.</p>
      <h4>L’équation x² = k</h4>
      <table>
        <tr><th>k &gt; 0</th><td>deux solutions : x² = 9 donne x = 3 ou x = −3</td></tr>
        <tr><th>k = 0</th><td>une solution : x = 0</td></tr>
        <tr><th>k &lt; 0</th><td>aucune solution (un carré n’est jamais négatif)</td></tr>
      </table>
      <p>Dans un problème, une longueur est positive : un carré d’aire 49&nbsp;cm² a un côté de 7&nbsp;cm (on ne garde pas −7).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie chaque solution en la remplaçant : (2 − 2)(2 + 5) = 0 × 7 = 0 ✔</div>
    `,
  });
})();
