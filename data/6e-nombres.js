// Renard Malin — Maths, niveau 6e : les 8 étapes de la Grotte des Nombres
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. les grands nombres · 2. les nombres décimaux · 3. comparer et arrondir · 4. additionner et soustraire ·
// 5. × et ÷ par 10, 100, 1 000 · 6. multiplier ⭐ · 7. diviser ⭐ · 8. les fractions ⭐ (⭐ : les nouveautés de 6e)

(function () {
  const {
    entier, parmi, entierSauf, decimal, ecrire, decimalesDe, net, arrondir, euros, mesure, lireNombre, egaux,
    frac, fracTexte, simplifier, pgcd, choix, nombre, fraction, vraiFaux, ajouterEtape, figures,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes, avec leur pronom
  const ENFANTS = [['Léa', 'elle'], ['Tom', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Inès', 'elle'], ['Sami', 'il'], ['Lina', 'elle'], ['Noé', 'il']];
  // Deux enfants différents : { nom, il, Il, de } (de : « de Tom », « d’Inès »)
  const deuxEnfants = () => RM.melanger(ENFANTS).slice(0, 2)
    .map(([nom, il]) => ({ nom, il, Il: il === 'il' ? 'Il' : 'Elle', de: /^[AEIOUÉ]/.test(nom) ? `d’${nom}` : `de ${nom}` }));
  const unEnfant = () => deuxEnfants()[0];

  // Un prix de 5 en 5 centimes : prix(1, 4) → 2,35
  const prix = (min, max) => entier(Math.round(min * 20), Math.round(max * 20)) / 20;

  // Les pièges vraiment faux : ni égaux à la réponse (ni à un piège déjà choisi), ni égaux entre eux, ni négatifs
  const valeurDe = p => (typeof p === 'number' ? net(p) : lireNombre(p));
  function vraisPieges(reponse, pieges, deja = []) {
    const vues = [net(reponse), ...deja.map(valeurDe)];
    return pieges.filter(p => {
      const v = valeurDe(p);
      if (p === null || !Number.isFinite(v) || v < 0 || vues.some(w => egaux(v, w))) return false;
      vues.push(v);
      return true;
    });
  }

  // Les boutons de nombres sont rangés du plus petit au plus grand : pour que la bonne réponse ne soit pas toujours
  // au milieu (ou toujours au bout), on prend au hasard combien de pièges sont en dessous d'elle et combien au-dessus.
  // deja : les pièges déjà choisis (les erreurs classiques), à ne pas reprendre
  function piegesAutour(reponse, candidats, combien = 3, deja = []) {
    const vrais = vraisPieges(reponse, RM.melanger(candidats), deja);
    const dessous = vrais.filter(p => valeurDe(p) < reponse);
    const dessus = vrais.filter(p => valeurDe(p) > reponse);
    let k = Math.min(entier(0, combien), dessous.length);
    if (combien - k > dessus.length) k = Math.min(dessous.length, combien - dessus.length);
    return [...dessous.slice(0, k), ...dessus.slice(0, combien - k)];
  }

  // Une ou deux erreurs classiques (au hasard), puis d'autres pièges placés au hasard autour de la réponse
  function classiquesEtAutres(reponse, classiques, autres) {
    const choisies = vraisPieges(reponse, classiques).slice(0, entier(1, 2));
    return [...choisies, ...piegesAutour(reponse, autres.map(net).filter(p => p > 0), 3 - choisies.length, choisies)];
  }

  // Les pièges fractions [numérateur, dénominateur] : des fractions de valeurs toutes différentes → « 3/4 »
  function piegesFractions(n, d, pieges) {
    const vues = [n / d];
    return pieges.filter(([a, b]) => {
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 2) return false;
      if (vues.some(v => Math.abs(v - a / b) < 1e-9)) return false;
      vues.push(a / b);
      return true;
    }).map(([a, b]) => fracTexte(a, b));
  }

  // Les rangs des chiffres : 0 = unités, 1 = dizaines… ; −1 = dixièmes, −2 = centièmes, −3 = millièmes
  const NOMS_RANGS = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille',
    'unités de millions', 'dizaines de millions', 'centaines de millions'];
  const NOMS_DECIMAUX = ['dixièmes', 'centièmes', 'millièmes'];
  const nomDuRang = r => (r < 0 ? NOMS_DECIMAUX[-r - 1] : NOMS_RANGS[r]);

  // Le chiffre d'un rang : chiffreAuRang(472.658, -2) → 5
  function chiffreAuRang(x, rang) {
    const [ent, dec] = Math.abs(x).toFixed(3).split('.');
    if (rang < 0) return Number(dec[-rang - 1]);
    return Number(ent[ent.length - 1 - rang] || 0);
  }

  // Un nombre écrit avec le chiffre d'un rang en gras : 45 3<b>8</b>2 107
  function chiffreEnGras(x, rang) {
    const [ent, dec = ''] = ecrire(x).split(',');
    if (rang < 0) {
      const i = -rang - 1;
      return `${ent},${dec.slice(0, i)}<b>${dec[i]}</b>${dec.slice(i + 1)}`;
    }
    const caracteres = [...ent];
    let compte = -1;
    for (let i = caracteres.length - 1; i >= 0; i--) {
      if (/\d/.test(caracteres[i]) && ++compte === rang) {
        caracteres[i] = `<b>${caracteres[i]}</b>`;
        break;
      }
    }
    return caracteres.join('') + (dec ? `,${dec}` : '');
  }

  // Un nombre aux chiffres tous différents (le premier n'est pas 0) : pour que « le chiffre des… » n'ait qu'une réponse
  function chiffresDifferents(combien) {
    let c;
    do { c = RM.melanger([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, combien); } while (c[0] === 0);
    return c;
  }

  // x écrit avec exactement k chiffres après la virgule : avecDecimales(2.5, 2) → « 2,50 »
  function avecDecimales(x, k) {
    const [ent, dec = ''] = ecrire(x).split(',');
    return k === 0 ? ent : `${ent},${dec.padEnd(k, '0')}`;
  }

  // Placer la virgule dans un entier : virguleDans(12, 3) → « 0,012 » ; virguleDans(300, 2) → « 3,00 »
  function virguleDans(n, k) {
    if (k === 0) return ecrire(n);
    const s = String(n).padStart(k + 1, '0');
    return `${ecrire(Number(s.slice(0, -k)))},${s.slice(-k)}`;
  }

  // Des pièges 10, 100, 1 000 fois plus grands ou plus petits, pour l'ordre de grandeur d'un produit (jamais sous 1)
  const dixFoisPlus = valeur => [valeur / 1000, valeur / 100, valeur / 10, valeur * 10, valeur * 100, valeur * 1000].map(net).filter(p => p >= 1);

  // Un seul ou plusieurs : unOuPlus(1, 'chiffre') → « 1 chiffre » ; unOuPlus(2, 'chiffre') → « 2 chiffres »
  const unOuPlus = (k, mot) => `${ecrire(k)} ${mot}${k > 1 ? 's' : ''}`;

  const sommeDesChiffres = n => [...String(n)].reduce((s, c) => s + Number(c), 0);

  // ======================================================================
  // 1. Les grands nombres
  // ======================================================================
  const MOTS_UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const MOTS_DIZAINES = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

  // De 1 à 99, en orthographe traditionnelle : des traits d'union, sauf avec « et » (vingt et un, soixante et onze).
  // fin : rien ne suit (ou « millions », « milliards » suit) → quatre-vingts prend un s
  function moinsDeCent(n, fin) {
    if (n < 17) return MOTS_UNITES[n];
    if (n < 20) return `dix-${MOTS_UNITES[n - 10]}`;
    if (n < 70) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      if (u === 0) return MOTS_DIZAINES[d];
      return u === 1 ? `${MOTS_DIZAINES[d]} et un` : `${MOTS_DIZAINES[d]}-${MOTS_UNITES[u]}`;
    }
    if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${moinsDeCent(n - 60)}`;
    if (n === 80) return fin ? 'quatre-vingts' : 'quatre-vingt';
    return `quatre-vingt-${moinsDeCent(n - 80)}`; // quatre-vingt-un, quatre-vingt-onze : pas de « et »
  }

  // De 1 à 999 : « cent » prend un s s'il est multiplié et que rien ne le suit (deux cents, mais deux cent un, deux cent mille)
  function moinsDeMille(n, fin) {
    const c = Math.floor(n / 100);
    const r = n % 100;
    const mots = [];
    if (c === 1) mots.push('cent');
    if (c > 1) mots.push(`${MOTS_UNITES[c]} ${r === 0 && fin ? 'cents' : 'cent'}`);
    if (r > 0) mots.push(moinsDeCent(r, fin));
    return mots.join(' ');
  }

  // Un nombre entier en lettres : 3 004 005 → « trois millions quatre mille cinq ».
  // « mille » est invariable ; « million » et « milliard » sont des noms (un s au pluriel, et « deux cents millions »).
  function enLettres(n) {
    if (n === 0) return 'zéro';
    const [milliards, millions, milliers, unites] = classesDe(n);
    const mots = [];
    if (milliards) mots.push(`${moinsDeMille(milliards, true)} ${milliards > 1 ? 'milliards' : 'milliard'}`);
    if (millions) mots.push(`${moinsDeMille(millions, true)} ${millions > 1 ? 'millions' : 'million'}`);
    if (milliers) mots.push(milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`);
    if (unites) mots.push(moinsDeMille(unites, true));
    return mots.join(' ');
  }

  // Les 4 classes d'un nombre : [milliards, millions, mille, unités]
  const NOMS_CLASSES = ['milliards', 'millions', 'mille', 'unités'];
  function classesDe(n) {
    return [Math.floor(n / 1e9), Math.floor(n / 1e6) % 1000, Math.floor(n / 1e3) % 1000, n % 1000];
  }
  const deClasses = c => c[0] * 1e9 + c[1] * 1e6 + c[2] * 1e3 + c[3];

  // Pour « le nombre de… » : on dit « le nombre de milliers », « le nombre de millions »
  const NOMBRE_DE = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille', 'centaines de mille',
    'millions', 'dizaines de millions', 'centaines de millions'];

  // Une classe au hasard : souvent des zéros à écrire (004) ou des mots difficiles (quatre-vingts, deux cents…)
  const classeAuHasard = () => parmi([
    () => entier(1, 9),
    () => entier(11, 99),
    () => entier(101, 999),
    () => parmi([80, 200, 300, 500, 800, 280, 480, 21, 71, 81, 91, 100, 180, 201, 250]),
  ])();

  // Un grand nombre « à trous » : jusqu'aux centaines de millions (9 chiffres au plus), ou avec des milliards
  function grandNombre(avecMilliards = false) {
    const c = [0, 0, 0, 0];
    if (avecMilliards) {
      c[0] = parmi([entier(1, 9), entier(11, 99), parmi([20, 80, 200, 300])]);
      c[1] = Math.random() < 0.5 ? 0 : classeAuHasard();
      c[2] = Math.random() < 0.7 ? 0 : classeAuHasard();
    } else {
      c[1] = Math.random() < 0.2 ? 0 : classeAuHasard();
      c[2] = Math.random() < 0.3 ? 0 : classeAuHasard();
      c[3] = Math.random() < 0.3 ? 0 : classeAuHasard();
      if (c[1] === 0 && c[2] === 0) c[2] = classeAuHasard();
    }
    return deClasses(c);
  }

  // Écrire en chiffres, classe par classe : 3 (millions) · 004 (mille) · 005 (unités) → 3 004 005
  function expliquerClasses(n) {
    const c = classesDe(n);
    const premiere = c.findIndex(v => v > 0);
    const morceaux = c.slice(premiere).map((v, i) => `<b>${i === 0 ? v : String(v).padStart(3, '0')}</b> (${NOMS_CLASSES[premiere + i]})`);
    return 'On écrit classe par classe, avec <b>3 chiffres</b> dans chaque classe (on complète avec des zéros) :<br>'
      + `${morceaux.join(' · ')} → <b>${ecrire(n)}</b>`;
  }

  // Les erreurs classiques quand on écrit un grand nombre en chiffres
  function piegesClasses(n) {
    const c = classesDe(n);
    const premiere = c.findIndex(v => v > 0);
    // Oublier les zéros d'une classe : « trois millions quatre mille cinq » → 345
    const sansZeros = Number(c.slice(premiere).map((v, i) => (i > 0 && v === 0 ? '000' : String(v))).join(''));
    // Mettre les chiffres d'une classe à gauche : « deux millions trente mille » → 2 300 000
    const aGauche = deClasses(c.map((v, i) => (i > premiere && v > 0 ? Number(String(v).padEnd(3, '0')) : v)));
    // Oublier une classe vide : « sept millions trente-quatre mille » → 7 034
    const sansClasseVide = Number(c.slice(premiere).filter(v => v > 0).map((v, i) => (i === 0 ? String(v) : String(v).padStart(3, '0'))).join(''));
    const pieges = [sansZeros, aGauche, sansClasseVide];
    // Deux chiffres voisins échangés en lisant une classe : 9 473 672 → 9 437 672
    const chiffres = [...String(n)];
    for (let essai = 0; essai < 2; essai++) {
      const i = entier(1, chiffres.length - 2);
      const t = [...chiffres];
      [t[i], t[i + 1]] = [t[i + 1], t[i]];
      pieges.push(Number(t.join('')));
    }
    // Deux classes échangées : 9 473 672 → 9 672 473
    if (premiere < 2) {
      const j = entier(premiere + 1, 2);
      const echangees = [...c];
      [echangees[j], echangees[j + 1]] = [echangees[j + 1], echangees[j]];
      pieges.push(deClasses(echangees));
    }
    if (n < 1e10) pieges.push(n * 10); // (pas de nombre de 12 chiffres)
    if (n % 10 === 0) pieges.push(n / 10);
    if (n % 1000 === 0) pieges.push(n / 1000); // milliard ↔ million
    if (n < 1e9) pieges.push(n * 1000);
    return vraisPieges(n, pieges);
  }

  // Les fautes d'orthographe classiques (fausses aussi avec l'orthographe de 1990 : on ne touche pas aux traits d'union)
  function fautesDOrthographe(s) {
    return [
      s.replace(/\bcents\b/, 'cent'),
      s.replace(/\b(deux|trois|quatre|cinq|six|sept|huit|neuf) cent\b(?!s)/, '$1 cents'),
      s.replace(/quatre-vingts\b/, 'quatre-vingt'),
      s.replace(/quatre-vingt(?= |$)/, 'quatre-vingts'),
      s.replace(/(\S) mille\b/, '$1 milles'),
      s.replace(/millions/, 'million'),
      s.replace(/milliards/, 'milliard'),
      s.replace(/^un million\b/, 'un millions'),
    ].filter(f => f !== s);
  }

  // Les règles d'orthographe utiles pour ce nombre (deux au plus)
  function reglesDesLettres(s) {
    const regles = [];
    if (/\bcents\b/.test(s)) {
      regles.push('« cent » prend un s s’il est multiplié et que rien ne le suit (ou devant « millions ») : <i>deux cents</i>.');
    } else if (/\b(deux|trois|quatre|cinq|six|sept|huit|neuf) cent\b/.test(s)) {
      regles.push('« cent » ne prend pas de s quand un autre nombre le suit : <i>deux cent un, trois cent mille</i>.');
    }
    if (/quatre-vingts\b/.test(s)) regles.push('« quatre-vingts » prend un s si rien ne le suit (ou devant « millions »).');
    else if (/quatre-vingt\b/.test(s)) regles.push('« quatre-vingt » n’a pas de s quand un autre nombre le suit : <i>quatre-vingt mille</i>.');
    if (/\S mille\b/.test(s)) regles.push('« mille » est invariable : jamais de s.');
    if (/millions|milliards/.test(s)) regles.push('« million » et « milliard » sont des noms : ils prennent un s au pluriel.');
    return regles.slice(0, 2).join('<br>');
  }

  // Un nombre dont l'écriture en lettres tient sur un bouton (30 caractères au plus) et qui cache un piège d'orthographe
  function nombrePourLesLettres() {
    for (let essai = 0; essai < 200; essai++) {
      const n = parmi([
        () => parmi([200, 300, 400, 600, 800, 900, 80, 180, 280, 380, 480, 580, 780, 980]),
        () => parmi([2, 3, 5, 8, 20, 21, 80, 81, 100, 200, 300, 280, 400, 500]) * 1000
          + parmi([0, 80, 200, 300, 280, 1, 21, 81, 500, 900, 480, 101, 71]),
        () => parmi([2, 3, 4, 7, 20, 21, 80, 200, 300, 400]) * 1e6 + parmi([0, 0, 200, 80, 300, 2, 5, 9]) * 1000,
      ])();
      const s = enLettres(n);
      if (s.length <= 30 && fautesDOrthographe(s).filter(f => f.length <= 30).length >= 2) return n;
    }
    return 280000;
  }

  ajouterEtape({
    id: '6e-nombres-grands-nombres',
    banque: ['enChiffres', 'enChiffres', 'lettresBoutons', 'enLettres', 'enLettres', 'chiffreDes', 'nombreDe',
      'decomposition', 'comparer', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'enChiffres') {
        const n = grandNombre();
        return nombre({
          consigne: 'Écris ce nombre en chiffres',
          enonce: `« ${enLettres(n)} »`,
          reponse: n,
          explication: expliquerClasses(n),
        });
      }
      if (sorte === 'lettresBoutons') {
        const n = grandNombre(Math.random() < 0.4);
        return choix({
          consigne: 'Quel nombre est écrit en lettres ?',
          enonce: `« ${enLettres(n)} »`,
          reponse: n,
          pieges: piegesAutour(n, piegesClasses(n)),
          explication: expliquerClasses(n),
        });
      }
      if (sorte === 'enLettres') {
        const n = nombrePourLesLettres();
        const s = enLettres(n);
        // Deux fautes d'orthographe (ou une faute et un piège qui en cumule deux : « trois cents milles cinq cents »),
        // et un nombre mal lu
        const fautes = RM.melanger(fautesDOrthographe(s).filter(f => f.length <= 30));
        const doubles = RM.melanger([...new Set(fautes.flatMap(fautesDOrthographe))]
          .filter(t => t !== s && !fautes.includes(t) && t.length <= 30));
        const autresNombres = RM.melanger(piegesClasses(n).map(enLettres).filter(t => t.length <= 30));
        const debut = doubles.length && Math.random() < 0.5 ? [fautes[0], doubles[0]] : fautes.slice(0, 2);
        const pieges = [...new Set([...debut, ...autresNombres.slice(0, 1), ...fautes, ...autresNombres])].slice(0, 3);
        return choix({
          consigne: 'Choisis la bonne écriture en lettres',
          enonce: `Comment s’écrit ${ecrire(n)} en lettres ?`,
          reponse: s,
          pieges,
          explication: `${ecrire(n)} s’écrit <b>${s}</b>.<br>${reglesDesLettres(s)}`,
        });
      }
      if (sorte === 'chiffreDes') {
        const chiffres = chiffresDifferents(entier(6, 9));
        const n = Number(chiffres.join(''));
        const rang = entier(2, chiffres.length - 1);
        const bon = chiffreAuRang(n, rang);
        const nombreDe = Math.floor(n / 10 ** rang);
        return choix({
          consigne: 'Trouve le bon chiffre',
          enonce: `Dans ${ecrire(n)}, quel est le chiffre des ${NOMS_RANGS[rang]} ?`,
          reponse: bon,
          // Les chiffres des rangs voisins, et celui du même rang dans la classe voisine (dizaines ↔ dizaines de mille)
          pieges: [rang - 1, rang + 1, rang + 3, rang - 3, rang - 2].filter(r => r >= 0 && r < chiffres.length).map(r => chiffreAuRang(n, r)),
          explication: `${chiffreEnGras(n, rang)} : le chiffre des ${NOMS_RANGS[rang]} est <b>${bon}</b>.`
            + (nombreDe >= 10 ? `<br>(Le <b>nombre</b> de ${NOMBRE_DE[rang]}, lui, est ${ecrire(nombreDe)} : ce n’est pas la même question !)` : ''),
        });
      }
      if (sorte === 'nombreDe') {
        const longueur = entier(5, 8);
        const n = entier(10 ** (longueur - 1), 10 ** longueur - 1);
        const rang = entier(1, Math.min(6, longueur - 2));
        const combien = Math.floor(n / 10 ** rang);
        const chiffre = chiffreAuRang(n, rang);
        const reste = n - combien * 10 ** rang;
        const commun = {
          consigne: 'Chiffre ou nombre ?',
          enonce: `Combien y a-t-il de ${NOMBRE_DE[rang]} en tout dans ${ecrire(n)} ?`,
          reponse: combien,
          explication: `${ecrire(n)} = ${ecrire(combien)} × ${ecrire(10 ** rang)}${reste ? ` + ${ecrire(reste)}` : ''} : `
            + `il y a <b>${ecrire(combien)}</b> ${NOMBRE_DE[rang]} en tout.<br>`
            + `⚠️ Le <b>chiffre</b> des ${NOMS_RANGS[rang]} est seulement ${chiffre}.`,
        };
        if (Math.random() < 0.5) return nombre(commun);
        return choix({
          ...commun,
          // Toujours le chiffre (l'erreur classique), puis des nombres de dizaines, de milliers… au hasard
          pieges: [chiffre, ...piegesAutour(combien, [rang - 2, rang - 1, rang + 1, rang + 2].filter(r => r >= 0)
            .map(r => Math.floor(n / 10 ** r)).filter(p => p > 0), 2, [chiffre])],
        });
      }
      if (sorte === 'decomposition') {
        const facon = parmi(['classes', 'rangs', 'trou']);
        if (facon === 'classes') {
          // Au moins deux termes (« 52 × 1 000 000 = ___ » tout seul, c'est trop facile)
          let n;
          do { n = grandNombre(); } while (classesDe(n).filter(v => v > 0).length < 2);
          const c = classesDe(n);
          const termes = [1, 2, 3].filter(i => c[i] > 0).map(i => ({
            texte: i === 3 ? ecrire(c[i]) : `${ecrire(c[i])} × ${ecrire(1000 ** (3 - i))}`,
            valeur: c[i] * 1000 ** (3 - i),
          }));
          const ordre = Math.random() < 0.3 ? RM.melanger(termes) : termes;
          return nombre({
            consigne: 'Calcule',
            enonce: `${ordre.map(t => t.texte).join(' + ')} = ___`,
            reponse: n,
            explication: `${ordre.map(t => ecrire(t.valeur)).join(' + ')} = <b>${ecrire(n)}</b><br>`
              + 'Chaque classe a 3 chiffres : là où il n’y a rien, on écrit des zéros.',
          });
        }
        if (facon === 'rangs') {
          // Un nombre de 6 ou 7 chiffres avec des zéros : 4 × 100 000 + 5 × 1 000 + 2 × 10
          const longueur = entier(6, 7);
          let chiffres;
          do {
            chiffres = Array.from({ length: longueur }, (_, i) => (i === 0 ? entier(2, 9) : (Math.random() < 0.45 ? 0 : entier(1, 9))));
          } while (chiffres.filter(c => c > 0).length < 3 || !chiffres.includes(0));
          const n = Number(chiffres.join(''));
          const termes = chiffres.map((c, i) => ({ c, p: 10 ** (longueur - 1 - i) })).filter(t => t.c > 0);
          const ordre = Math.random() < 0.3 ? RM.melanger(termes) : termes;
          return nombre({
            consigne: 'Calcule',
            enonce: `${ordre.map(t => (t.p === 1 ? ecrire(t.c) : `${t.c} × ${ecrire(t.p)}`)).join(' + ')} = ___`,
            reponse: n,
            explication: `${ordre.map(t => ecrire(t.c * t.p)).join(' + ')} = <b>${ecrire(n)}</b><br>`
              + 'À chaque rang où il n’y a rien, on écrit un <b>0</b>.',
          });
        }
        // Le nombre qui manque dans la décomposition par classes
        let n;
        do { n = grandNombre(); } while (classesDe(n)[2] < 2 || classesDe(n)[1] === 0);
        const c = classesDe(n);
        const termes = [];
        if (c[1]) termes.push(`${ecrire(c[1])} × ${ecrire(1e6)}`);
        termes.push(`___ × ${ecrire(1000)}`);
        if (c[3]) termes.push(ecrire(c[3]));
        return nombre({
          consigne: 'Complète la décomposition',
          enonce: `${ecrire(n)} = ${termes.join(' + ')}`,
          reponse: c[2],
          explication: `Dans ${ecrire(n)}, la classe des mille est <b>${String(c[2]).padStart(3, '0')}</b>, `
            + `donc il y a <b>${ecrire(c[2])}</b> milliers : ${ecrire(c[2])} × ${ecrire(1000)} = ${ecrire(c[2] * 1000)}.`,
        });
      }
      if (sorte === 'comparer') {
        const plusGrand = Math.random() < 0.5;
        let nombres;
        let a;
        do {
          const longueur = entier(6, 8);
          a = entier(10 ** (longueur - 1), 10 ** longueur - 1);
          // b : deux chiffres voisins échangés
          const s = [...String(a)];
          const i = entier(1, longueur - 2);
          [s[i], s[i + 1]] = [s[i + 1], s[i]];
          const b = Number(s.join(''));
          const d = a + parmi([-1, 1]) * 10 ** entier(2, longueur - 2);
          // Le piège : un chiffre de moins (mais qui commence par 9), ou un chiffre de plus (mais qui commence par 10…)
          const e = plusGrand ? entier(9 * 10 ** (longueur - 2), 10 ** (longueur - 1) - 1) : entier(10 ** longueur, 1.05 * 10 ** longueur);
          nombres = [...new Set([a, b, d, e])];
        } while (nombres.length < 4);
        const ranges = [...nombres].sort((x, y) => x - y);
        const reponse = plusGrand ? ranges[3] : ranges[0];
        return choix({
          consigne: 'Compare',
          enonce: `Quel est le plus ${plusGrand ? 'grand' : 'petit'} de ces nombres ?`,
          reponse,
          pieges: nombres,
          ordre: 'melange',
          explication: `Du plus petit au plus grand : ${ranges.map(ecrire).join(' &lt; ')}.<br>`
            + 'On compte d’abord les chiffres (plus il y en a, plus le nombre est grand), puis on compare chiffre par chiffre depuis la gauche.',
        });
      }
      // Vrai ou faux : les classes, les chiffres, l'écriture en lettres, la comparaison
      const vrai = Math.random() < 0.5;
      const genre = parmi(['classes', 'chiffre', 'lettres', 'comparer']);
      if (genre === 'classes') {
        const [enonce, explication] = parmi(vrai ? [
          [`1 milliard = ${ecrire(1000)} millions`, 'Un milliard, c’est mille millions.'],
          [`1 million = ${ecrire(1000)} milliers`, 'Un million, c’est mille milliers.'],
          [`Un million s’écrit ${ecrire(1e6)}.`, 'Un million, c’est un 1 suivi de 6 zéros.'],
          [`${ecrire(1e9)}, c’est un milliard.`, 'Un milliard, c’est un 1 suivi de 9 zéros.'],
        ] : [
          [`1 million = ${ecrire(1e5)}`, `Un million, c’est mille milliers : ${ecrire(1e6)}. ${ecrire(1e5)}, c’est cent mille.`],
          [`1 milliard = ${ecrire(1e6)}`, `${ecrire(1e6)}, c’est un million. Un milliard, c’est mille millions : ${ecrire(1e9)}.`],
          ['1 milliard = 100 millions', `Un milliard, c’est <b>${ecrire(1000)}</b> millions.`],
          [`Un million s’écrit ${ecrire(1e5)}.`, `Un million s’écrit ${ecrire(1e6)} (6 zéros). ${ecrire(1e5)}, c’est cent mille.`],
        ]);
        return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication[0].toLowerCase()}${explication.slice(1)}` });
      }
      if (genre === 'chiffre') {
        const chiffres = chiffresDifferents(entier(6, 9));
        const n = Number(chiffres.join(''));
        const rang = entier(2, chiffres.length - 2);
        const bon = chiffreAuRang(n, rang);
        const dit = vrai ? bon : chiffreAuRang(n, rang + parmi([-1, 1]));
        return vraiFaux({
          enonce: `Dans ${ecrire(n)}, le chiffre des ${NOMS_RANGS[rang]} est ${dit}.`,
          vrai,
          explication: `${chiffreEnGras(n, rang)} : le chiffre des ${NOMS_RANGS[rang]} est <b>${bon}</b>.`,
        });
      }
      if (genre === 'lettres') {
        const n = nombrePourLesLettres();
        const s = enLettres(n);
        return vraiFaux({
          enonce: `${ecrire(n)} s’écrit « ${vrai ? s : parmi(fautesDOrthographe(s))} ».`,
          vrai,
          explication: `${ecrire(n)} s’écrit <b>${s}</b>.<br>${reglesDesLettres(s)}`,
        });
      }
      const longueur = entier(6, 8);
      const petit = entier(9 * 10 ** (longueur - 2), 10 ** (longueur - 1) - 1);
      const grand = entier(10 ** (longueur - 1), 1.2 * 10 ** (longueur - 1));
      return vraiFaux({
        enonce: vrai ? `${ecrire(grand)} &gt; ${ecrire(petit)}` : `${ecrire(petit)} &gt; ${ecrire(grand)}`,
        vrai,
        explication: `${ecrire(grand)} a <b>${longueur} chiffres</b>, ${ecrire(petit)} n’en a que ${longueur - 1} : `
          + `<b>${ecrire(grand)} &gt; ${ecrire(petit)}</b>.`,
      });
    },
    titreLecon: 'Les grands nombres',
    lecon: `
      <h4>Les classes</h4>
      <p>On groupe les chiffres par <b>3</b>, en partant de la droite : chaque groupe est une <b>classe</b>.</p>
      <table>
        <tr><th colspan="3">millions</th><th colspan="3">mille</th><th colspan="3">unités</th></tr>
        <tr><td>c</td><td>d</td><td>u</td><td>c</td><td>d</td><td>u</td><td>c</td><td>d</td><td>u</td></tr>
        <tr><td></td><td>4</td><td>5</td><td>3</td><td>8</td><td>2</td><td>1</td><td>0</td><td>7</td></tr>
      </table>
      <p>👉 <i>45&nbsp;382&nbsp;107</i> : « quarante-cinq millions trois cent quatre-vingt-deux mille cent sept ».
        Après les millions viennent les <b>milliards</b> : 1 milliard = 1&nbsp;000 millions = 1&nbsp;000&nbsp;000&nbsp;000.</p>
      <p>⚠️ Le <b>chiffre</b> des dizaines de mille de 45&nbsp;382&nbsp;107 est <b>8</b>, mais le <b>nombre</b> de dizaines de mille
        est <b>4&nbsp;538</b> (on garde tous les chiffres jusqu’à ce rang).</p>
      <h4>Écrire en lettres</h4>
      <p>Des traits d’union entre les mots plus petits que cent (<i>vingt-deux, quatre-vingt-dix</i>), sauf avec « et » (<i>vingt et un</i>).<br>
        <b>Cent</b> et <b>vingt</b> prennent un s s’ils sont multipliés et qu’ils terminent le nombre (ou qu’ils sont suivis
        de millions, milliards) : <i>deux cents, quatre-vingts, deux cents millions</i>, mais <i>deux cent un, quatre-vingt mille</i>.<br>
        <b>Mille</b> est invariable ; <b>million</b> et <b>milliard</b> prennent un s : <i>trois mille, deux millions</i>.<br>
        On peut aussi mettre des traits d’union partout (orthographe de 1990) : <i>deux-cent-quatre-vingts</i>.
        Les règles de cent, vingt et mille ne changent pas.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour écrire en chiffres, mets <b>3 chiffres</b> dans chaque classe :
        « trois millions quatre mille cinq » → 3 | 004 | 005 → <b>3&nbsp;004&nbsp;005</b>.</div>
      <p>Pour comparer, on compte d’abord les chiffres (999&nbsp;999 &lt; 1&nbsp;000&nbsp;000), puis on compare chiffre par chiffre depuis la gauche.</p>
    `,
  });

  // ======================================================================
  // 2. Les nombres décimaux
  // ======================================================================
  const PARTS_UNITE = { 10: ['dixième', 'dixièmes'], 100: ['centième', 'centièmes'], 1000: ['millième', 'millièmes'] };
  // Les unités de numération, de la plus grande à la plus petite
  const UNITES_NUMERATION = [['unité', 'unités'], ['dixième', 'dixièmes'], ['centième', 'centièmes'], ['millième', 'millièmes']];
  const quantite = (k, rang) => `${ecrire(k)} ${UNITES_NUMERATION[rang][k > 1 ? 1 : 0]}`;

  // Un nombre décimal aux chiffres tous différents : 2 ou 3 chiffres avant la virgule, 3 après (472,658)
  function decimalAuxChiffresDifferents() {
    const avant = entier(2, 3);
    let c;
    do { c = chiffresDifferents(avant + 3); } while (c[c.length - 1] === 0);
    return { x: Number(`${c.slice(0, avant).join('')}.${c.slice(avant).join('')}`), avant };
  }

  // Une fraction décimale au hasard : [numérateur, dénominateur], souvent avec des zéros à écrire (7/100 = 0,07)
  function fractionDecimale() {
    const d = parmi([10, 100, 100, 1000]);
    const n = parmi([
      () => entier(1, 9),
      () => entier(11, d === 10 ? 99 : 999),
      () => entier(101, 3 * d),
    ])();
    return n % 10 === 0 ? fractionDecimale() : [n, d];
  }

  // Une droite graduée : entre deux entiers (en dixièmes), sur deux unités, ou entre deux dixièmes (en centièmes)
  function droiteDecimale() {
    const facon = parmi(['dixiemes', 'dixiemes', 'deuxUnites', 'centiemes']);
    if (facon === 'dixiemes') {
      const k = entier(0, 20);
      const x = net(k + entier(1, 9) / 10);
      return {
        x,
        figure: figures.droiteGraduee({ debut: k, fin: k + 1, pas: 0.1, points: [{ valeur: x, nom: 'A' }] }),
        explication: `Entre ${k} et ${k + 1}, l’unité est partagée en <b>10</b> : chaque graduation vaut <b>0,1</b> (un dixième).<br>`
          + `A est à ${unOuPlus(Math.round((x - k) * 10), 'graduation')} de ${k} : son abscisse est <b>${ecrire(x)}</b>.`,
      };
    }
    if (facon === 'deuxUnites') {
      const k = entier(0, 15);
      let j;
      do { j = entier(1, 19); } while (j === 10);
      const x = net(k + j / 10);
      return {
        x,
        figure: figures.droiteGraduee({ debut: k, fin: k + 2, pas: 1, sousGraduations: 10, etiquettes: [k, k + 1, k + 2], points: [{ valeur: x, nom: 'A' }] }),
        explication: 'Chaque unité est partagée en <b>10</b> : une petite graduation vaut <b>0,1</b>.<br>'
          + `A est à ${j % 10 === 1 ? 'une petite graduation' : `${j % 10} petites graduations`} après ${Math.floor(x)} : `
          + `son abscisse est <b>${ecrire(x)}</b>.`,
      };
    }
    const a = net(entier(10, 99) / 10);
    const b = net(a + 0.1);
    const j = entier(1, 9);
    const x = net(a + j / 100);
    return {
      x,
      figure: figures.droiteGraduee({ debut: a, fin: b, pas: 0.01, points: [{ valeur: x, nom: 'A' }] }),
      explication: `Entre ${ecrire(a)} et ${ecrire(b)}, il y a <b>10</b> intervalles : chacun vaut <b>0,01</b> (un centième).<br>`
        + `A est à ${unOuPlus(j, 'graduation')} de ${ecrire(a)} : ${ecrire(a)} + ${ecrire(j / 100)} = <b>${ecrire(x)}</b>.`,
    };
  }

  ajouterEtape({
    id: '6e-nombres-decimaux',
    banque: ['chiffreDes', 'chiffreDes', 'rang', 'rang', 'versDecimal', 'versFraction', 'versFraction', 'decomposition',
      'partie', 'droite', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'chiffreDes') {
        const { x, avant } = decimalAuxChiffresDifferents();
        const rang = Math.random() < 0.75 ? -entier(1, 3) : entier(0, avant - 1);
        const bon = chiffreAuRang(x, rang);
        // Les pièges : les chiffres des autres rangs (les voisins, et le rang « miroir » : centièmes ↔ centaines)
        const rangs = [-3, -2, -1, 0, 1, 2].filter(r => r < avant && r !== rang);
        return choix({
          consigne: 'Trouve le bon chiffre',
          enonce: `Dans ${ecrire(x)}, quel est le chiffre des ${nomDuRang(rang)} ?`,
          reponse: bon,
          pieges: rangs.map(r => chiffreAuRang(x, r)),
          explication: `${chiffreEnGras(x, rang)} : le chiffre des ${nomDuRang(rang)} est <b>${bon}</b>.<br>`
            + 'Après la virgule : les <b>dixièmes</b>, puis les <b>centièmes</b>, puis les <b>millièmes</b>.',
        });
      }
      if (sorte === 'rang') {
        if (Math.random() < 0.5) {
          // Le chiffre 4 est le chiffre des… ?
          const { x, avant } = decimalAuxChiffresDifferents();
          const rang = Math.random() < 0.8 ? -entier(1, 3) : entier(0, avant - 1);
          const c = chiffreAuRang(x, rang);
          const autres = [-3, -2, -1, 0, 1, 2].filter(r => r !== rang && r < avant);
          return choix({
            consigne: 'Complète',
            enonce: `Dans ${ecrire(x)}, ${c} est le chiffre des ___.`,
            reponse: nomDuRang(rang),
            pieges: RM.melanger(autres).map(nomDuRang),
            explication: `${chiffreEnGras(x, rang)} : ${c} est le chiffre des <b>${nomDuRang(rang)}</b>.<br>`
              + 'Juste après la virgule : les dixièmes, puis les centièmes, puis les millièmes.',
          });
        }
        // 3 dixièmes = ___ centièmes ; 40 centièmes = ___ dixièmes
        let de;
        let vers;
        do { de = entier(0, 3); vers = entier(0, 3); } while (de === vers);
        const ecart = 10 ** Math.abs(vers - de);
        const k = vers > de ? entier(1, 9) : entier(2, 9) * ecart;
        const reponse = vers > de ? k * ecart : k / ecart;
        const [grande, petite] = vers > de ? [de, vers] : [vers, de];
        return choix({
          consigne: 'Complète',
          enonce: `${quantite(k, de)} = ___ ${UNITES_NUMERATION[vers][1]}`,
          reponse,
          pieges: piegesAutour(reponse, [reponse * 10, reponse / 10, reponse * 100, reponse / 100]),
          explication: `1 ${UNITES_NUMERATION[grande][0]} = ${quantite(ecart, petite)}.<br>`
            + `Donc ${quantite(k, de)} = <b>${quantite(reponse, vers)}</b>.`,
        });
      }
      if (sorte === 'versDecimal') {
        const [n, d] = fractionDecimale();
        const x = net(n / d);
        const [un, plusieurs] = PARTS_UNITE[d];
        return nombre({
          consigne: 'Écris en nombre décimal',
          enonce: `${frac(n, d)} = ___`,
          reponse: x,
          explication: `${frac(n, d)}, c’est ${ecrire(n)} ${n > 1 ? plusieurs : un} : ${ecrire(n)} ÷ ${ecrire(d)} = <b>${ecrire(x)}</b>.<br>`
            + `Le dernier chiffre (${n % 10}) est le chiffre des ${plusieurs}${n < d / 10 ? ' : on complète avec des zéros' : ''}.`,
        });
      }
      if (sorte === 'versFraction') {
        const [n, d] = fractionDecimale();
        const x = net(n / d);
        const [ent, dec] = ecrire(x).split(',');
        // Le mauvais dénominateur (10, 100, 1 000, 10 000), le numérateur × 10, ou la virgule prise pour la barre (3,47 → 3/47)
        const pieges = piegesFractions(n, d, [[n, d * 10], [n, d / 10], [n, d / 100], [n, d * 100], [n * 10, d],
          [Number(ent), Number(dec)]].filter(([, b]) => b <= 10000));
        return choix({
          consigne: 'Quelle fraction est égale à ce nombre ?',
          enonce: `${ecrire(x)} = ___`,
          reponse: fracTexte(n, d),
          pieges,
          explication: `Dans ${ecrire(x)}, le dernier chiffre est celui des <b>${PARTS_UNITE[d][1]}</b> : `
            + `${ecrire(x)} = ${ecrire(n)} ${n > 1 ? PARTS_UNITE[d][1] : PARTS_UNITE[d][0]} = <b>${frac(n, d)}</b>.`,
        });
      }
      if (sorte === 'decomposition') {
        // 3 + 4/10 + 7/100, ou « 5 unités et 3 centièmes » : souvent avec un rang vide
        let chiffres;
        do {
          chiffres = [entier(0, 25), entier(0, 9), entier(0, 9), Math.random() < 0.5 ? 0 : entier(1, 9)];
        } while (chiffres.slice(1).every(c => c === 0) || chiffres.filter(c => c > 0).length < 2
          || (chiffres[1] > 0 && chiffres[2] > 0 && Math.random() < 0.6));
        const dernier = chiffres.reduce((d, c, rang) => (c > 0 ? rang : d), 0);
        const x = net(chiffres[0] + chiffres[1] / 10 + chiffres[2] / 100 + chiffres[3] / 1000);
        const termes = chiffres.map((c, rang) => ({ c, rang })).filter(t => t.c > 0);
        const enMots = Math.random() < 0.4;
        const ordre = !enMots && Math.random() < 0.3 ? RM.melanger(termes) : termes;
        const enonce = enMots
          ? `${ordre.map(t => quantite(t.c, t.rang)).join(', ').replace(/, ([^,]*)$/, ' et $1')} = ___`
          : `${ordre.map(t => (t.rang === 0 ? ecrire(t.c) : frac(t.c, 10 ** t.rang))).join(' + ')} = ___`;
        // Les rangs vides (entre la virgule et le dernier chiffre) : on y écrit des 0
        const vides = [1, 2].filter(rang => rang < dernier && chiffres[rang] === 0).map(rang => UNITES_NUMERATION[rang][1]);
        const attention = vides.length === 2
          ? `<br>⚠️ Il n’y a ni ${vides[0]} ni ${vides[1]} : on écrit <b>deux 0</b> à leur place.`
          : vides.length === 1 ? `<br>⚠️ Il n’y a pas de ${vides[0]} : on écrit un <b>0</b> à leur place.` : '';
        return nombre({
          consigne: 'Écris en nombre décimal',
          enonce,
          reponse: x,
          explication: `On place chaque chiffre à son rang : ${termes.map(t => ecrire(t.c / 10 ** t.rang)).join(' + ')} = <b>${ecrire(x)}</b>.`
            + attention,
        });
      }
      if (sorte === 'partie') {
        const x = decimal(1, 99, parmi([2, 2, 3]));
        const ent = Math.floor(x);
        const dec = net(x - ent);
        const explication = `${ecrire(x)} = ${ecrire(ent)} + ${ecrire(dec)} : la partie entière est <b>${ecrire(ent)}</b>, `
          + `la partie décimale est <b>${ecrire(dec)}</b> (plus petite que 1).`;
        const facon = parmi(['trou', 'entiere', 'decimale']);
        if (facon === 'trou') {
          return nombre({ consigne: 'Complète', enonce: `${ecrire(x)} = ${ecrire(ent)} + ___`, reponse: dec, explication });
        }
        const decimaux = Number(ecrire(x).split(',')[1]);
        return choix({
          consigne: 'Partie entière et partie décimale',
          enonce: `Quelle est la partie ${facon === 'entiere' ? 'entière' : 'décimale'} de ${ecrire(x)} ?`,
          reponse: facon === 'entiere' ? ent : dec,
          pieges: piegesAutour(facon === 'entiere' ? ent : dec, (facon === 'entiere'
            ? [decimaux, dec, Math.floor(x / 10), Math.floor(x * 10), ent + 1]
            // (pas le piège « 57 » pour 38,57 : certains livres de CM2 appellent 57 la partie décimale)
            : [ent, net(ent / 100), net(dec * 10), net(dec / 10)]).filter(p => p > 0)),
          explication,
        });
      }
      if (sorte === 'droite') {
        const { x, figure, explication } = droiteDecimale();
        return nombre({
          consigne: 'Lis l’abscisse du point A',
          enonce: `${figure}Quelle est l’abscisse du point A ?`,
          reponse: x,
          explication,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['fraction', 'chiffre', 'unites', 'zeros']);
      if (genre === 'fraction') {
        const [n, d] = fractionDecimale();
        const x = net(n / d);
        const faux = parmi(d === 10 ? [d * 10] : [d * 10, d / 10]);
        return vraiFaux({
          enonce: `${ecrire(x)} = ${frac(n, vrai ? d : faux)}`,
          vrai,
          explication: `${ecrire(x)}, c’est ${ecrire(n)} ${n > 1 ? PARTS_UNITE[d][1] : PARTS_UNITE[d][0]} : <b>${ecrire(x)} = ${frac(n, d)}</b>.`,
        });
      }
      if (genre === 'chiffre') {
        const { x } = decimalAuxChiffresDifferents();
        const rang = -entier(1, 3);
        const dit = vrai ? rang : parmi([rang - 1, rang + 1, -rang].filter(r => r >= -3 && r !== rang));
        return vraiFaux({
          enonce: `Dans ${ecrire(x)}, ${chiffreAuRang(x, rang)} est le chiffre des ${nomDuRang(dit)}.`,
          vrai,
          explication: `${chiffreEnGras(x, rang)} : ${chiffreAuRang(x, rang)} est le chiffre des <b>${nomDuRang(rang)}</b>.`,
        });
      }
      if (genre === 'unites') {
        const de = entier(0, 2);
        const vers = entier(de + 1, 3);
        const ecart = 10 ** (vers - de);
        const [enonce, raison] = vrai
          ? [`1 ${UNITES_NUMERATION[de][0]} = ${quantite(ecart, vers)}`, '']
          : parmi([
            [`1 ${UNITES_NUMERATION[vers][0]} = ${quantite(ecart, de)}`, `C’est le contraire : `],
            [`1 ${UNITES_NUMERATION[de][0]} = ${quantite(ecart * 10, vers)}`, ''],
          ]);
        return vraiFaux({
          enonce,
          vrai,
          explication: `${raison}<b>1 ${UNITES_NUMERATION[de][0]} = ${quantite(ecart, vers)}</b>. `
            + 'Chaque rang vaut 10 fois le rang qui est à sa droite.',
        });
      }
      const x = decimal(1, 20, parmi([1, 2]));
      const [ent, dec] = ecrire(x).split(',');
      const [gauche, droite] = vrai
        ? parmi([[ecrire(x), `${ecrire(x)}0`], [`${ecrire(x)}0`, ecrire(x)], [ecrire(x), `${ecrire(x)}00`]])
        : [ecrire(x), `${ent},0${dec}`];
      return vraiFaux({
        enonce: `${gauche} = ${droite}`,
        vrai,
        explication: vrai
          ? `Ajouter des zéros <b>à la fin</b> de la partie décimale ne change pas le nombre : ${gauche} = ${droite}.`
          : `Un zéro <b>juste après la virgule</b> change le nombre : ${ent},0${dec} a ${quantite(Number(dec[0]), 2)}, `
            + `mais pas de dixièmes. ${ecrire(x)} ≠ ${ent},0${dec}.`,
      });
    },
    titreLecon: 'Les nombres décimaux',
    lecon: `
      <h4>Dixièmes, centièmes, millièmes</h4>
      <p>On partage l’unité en 10 : des <b>dixièmes</b> ; en 100 : des <b>centièmes</b> ; en 1&nbsp;000 : des <b>millièmes</b>.<br>
        1 unité = 10 dixièmes · 1 dixième = 10 centièmes · 1 centième = 10 millièmes</p>
      <table>
        <tr><th>dizaines</th><th>unités</th><th>,</th><th>dixièmes</th><th>centièmes</th><th>millièmes</th></tr>
        <tr><td>2</td><td>5</td><td>,</td><td>3</td><td>8</td><td>7</td></tr>
      </table>
      <p>👉 Dans <i>25,387</i> : la <b>partie entière</b> est 25, la <b>partie décimale</b> est 0,387 (25,387 = 25 + 0,387) ;
        le chiffre des centièmes est 8.</p>
      <h4>Les fractions décimales</h4>
      <p>👉 <i>3,47</i> = 347 centièmes = ${frac(347, 100)} = 3 + ${frac(4, 10)} + ${frac(7, 100)} · <i>0,07</i> = ${frac(7, 100)}</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde le <b>dernier chiffre</b> : dans 3,4<b>7</b>, le 7 est le chiffre
        des centièmes, donc 3,47 = ${frac(347, 100)}.</div>
      <p>⚠️ Quand un rang est vide, on écrit un 0 : 5 + ${frac(3, 100)} = <b>5,03</b> (et pas 5,3).</p>
      <p>Sur une droite graduée, compte en combien de parts l’unité est partagée : en 10 parts, chaque graduation vaut 0,1.
        Entre 8,1 et 8,2 partagé en 10, chaque graduation vaut 0,01 : la 3e graduation après 8,1, c’est 8,13.</p>
    `,
  });

  // ======================================================================
  // 3. Comparer et arrondir
  // ======================================================================
  const signe = (a, b) => (egaux(a, b) ? '=' : a < b ? '<' : '>');
  const SIGNES_HTML = { '<': '&lt;', '>': '&gt;', '=': '=' };

  // Deux décimaux à comparer, avec les pièges classiques : [valeur, écriture] × 2
  function paireAComparer() {
    const e = entier(0, 20);
    const paire = parmi([
      // 2,5 et 2,45 : le plus long n'est pas le plus grand
      () => { const d = entier(2, 9); return [e + d / 10, e + (d - 1) / 10 + entier(1, 9) / 100]; },
      // 3,08 et 3,8
      () => { const d = entier(1, 9); return [e + d / 100, e + d / 10]; },
      // 7,354 et 7,36
      () => { const c = entier(1, 8) * 10 + entier(1, 9); return [e + c / 100 + entier(1, 9) / 1000, e + (c + 1) / 100]; },
      // 12,3 et 9,87 : les parties entières d'abord
      () => [e + 10 + decimal(0.1, 0.9, 1), e + entier(1, 9) + decimal(0.01, 0.99, 2)],
      // 4,5 et 4,50 : égaux
      () => { const x = decimal(e, e + 1, 1); return [x, x, `${ecrire(x)}0`]; },
    ])();
    const [a, b, texteB] = [net(paire[0]), net(paire[1]), paire[2]];
    const gauche = { valeur: a, texte: ecrire(a) };
    const droite = { valeur: b, texte: texteB || ecrire(b) };
    return Math.random() < 0.5 ? [gauche, droite] : [droite, gauche];
  }

  function expliquerComparaison(a, b) {
    const s = SIGNES_HTML[signe(a.valeur, b.valeur)];
    const conclusion = `<b>${a.texte} ${s} ${b.texte}</b>`;
    if (egaux(a.valeur, b.valeur)) {
      return `Ajouter un zéro à la fin de la partie décimale ne change pas le nombre : ${conclusion}.`;
    }
    const [ea, eb] = [Math.floor(a.valeur), Math.floor(b.valeur)];
    if (ea !== eb) return `On compare d’abord les parties entières : ${ea} ${s} ${eb}. Donc ${conclusion}.`;
    const k = Math.max(decimalesDe(a.valeur), decimalesDe(b.valeur));
    const [pa, pb] = [avecDecimales(a.valeur, k), avecDecimales(b.valeur, k)];
    const plusLongPlusPetit = decimalesDe(a.valeur) !== decimalesDe(b.valeur)
      && (decimalesDe(a.valeur) > decimalesDe(b.valeur)) === (a.valeur < b.valeur);
    return `Même partie entière. Avec autant de chiffres après la virgule : ${pa} et ${pb}, `
      + `et ${Number(pa.split(',')[1])} ${s} ${Number(pb.split(',')[1])} ${NOMS_DECIMAUX[k - 1]}. Donc ${conclusion}.`
      + (plusLongPlusPetit ? '<br>⚠️ Le nombre qui a le plus de chiffres n’est pas forcément le plus grand !' : '');
  }

  // Quatre décimaux proches, qui ont la même partie entière (3,6 ; 3,54 ; 3,08 ; 3,615…)
  function decimauxProches(e) {
    const d = entier(1, 7);
    const valeurs = new Set();
    if (Math.random() < 0.4) valeurs.add(net(e + decimal(0.01, 0.09, 2)));
    while (valeurs.size < 4) {
      const k = parmi([1, 2, 2, 3]);
      valeurs.add(net(e + decimal(d / 10, (d + 2) / 10 - 10 ** -k, k)));
    }
    return RM.melanger([...valeurs]);
  }

  const RANG_ARRONDI = ['à l’unité', 'au dixième', 'au centième'];
  const CHIFFRE_SUIVANT = ['le chiffre des dixièmes', 'le chiffre des centièmes', 'le chiffre des millièmes'];

  // Un nombre à arrondir, et son arrondi (on évite 3,96 → 4,0, qui s'écrirait 4)
  function aArrondir() {
    for (;;) {
      const x = decimal(0.1, 99, parmi([2, 3, 3]));
      const rang = entier(0, decimalesDe(x) - 1);
      const arrondi = arrondir(x, rang);
      if (decimalesDe(arrondi) === rang && arrondi > 0) {
        const dessous = Math.floor(net(x * 10 ** rang)) / 10 ** rang;
        return { x, rang, arrondi, dessous: net(dessous), dessus: net(dessous + 10 ** -rang) };
      }
    }
  }

  function expliquerArrondi({ x, rang, arrondi, dessous, dessus }) {
    const suivant = chiffreAuRang(x, -rang - 1);
    return `${ecrire(x)} est entre ${avecDecimales(dessous, rang)} et ${avecDecimales(dessus, rang)}. On regarde ${CHIFFRE_SUIVANT[rang]} : <b>${suivant}</b>`
      + `${suivant >= 5 ? ' (5 ou plus : on prend le nombre du dessus)' : ' (moins de 5 : on garde le nombre du dessous)'}.<br>`
      + `L’arrondi ${RANG_ARRONDI[rang]} de ${ecrire(x)} est <b>${ecrire(arrondi)}</b>.`;
  }

  ajouterEtape({
    id: '6e-nombres-comparer',
    banque: ['comparer', 'comparer', 'plusGrand', 'ranger', 'intercaler', 'encadrer', 'encadrer', 'arrondir', 'arrondir',
      'arrondir', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'comparer') {
        const [a, b] = paireAComparer();
        return choix({
          consigne: 'Compare ces deux nombres',
          enonce: `${a.texte} ___ ${b.texte}`,
          reponse: signe(a.valeur, b.valeur),
          choix: ['<', '=', '>'],
          explication: expliquerComparaison(a, b),
        });
      }
      if (sorte === 'plusGrand') {
        const nombres = decimauxProches(entier(0, 20));
        const plusGrand = Math.random() < 0.5;
        const ranges = [...nombres].sort((x, y) => x - y);
        const reponse = plusGrand ? ranges[3] : ranges[0];
        const k = Math.max(...nombres.map(decimalesDe));
        return choix({
          consigne: 'Compare',
          enonce: `Quel est le plus ${plusGrand ? 'grand' : 'petit'} de ces nombres ?`,
          reponse,
          pieges: nombres,
          ordre: 'melange',
          explication: `Même partie entière : on compare les dixièmes, puis les centièmes, puis les millièmes `
            + `(${ranges.map(x => avecDecimales(x, k)).join(' ; ')}).<br>`
            + `Le plus ${plusGrand ? 'grand' : 'petit'} est <b>${ecrire(reponse)}</b>.`,
        });
      }
      if (sorte === 'ranger') {
        const nombres = decimauxProches(entier(0, 9));
        const croissant = Math.random() < 0.5;
        const sep = croissant ? ' < ' : ' > ';
        const trier = (liste, cle) => {
          const t = [...liste].sort((x, y) => cle(x) - cle(y) || x - y);
          return croissant ? t : t.reverse();
        };
        const bon = trier(nombres, x => x);
        // L'erreur classique : comparer les parties décimales comme des nombres entiers (4,7 < 4,65 car 7 < 65)
        const commeDesEntiers = trier(nombres, x => Number(ecrire(x).split(',')[1] || 0));
        const parLongueur = trier(nombres, x => decimalesDe(x) * 10 + x - Math.floor(x));
        const ecrireListe = liste => liste.map(ecrire).join(sep);
        const k = Math.max(...nombres.map(decimalesDe));
        // Une étourderie : deux nombres voisins échangés
        const echange = i => { const t = [...bon]; [t[i], t[i + 1]] = [t[i + 1], t[i]]; return t; };
        return choix({
          consigne: `Range dans l’ordre ${croissant ? 'croissant' : 'décroissant'}`,
          enonce: `Range ces nombres dans l’ordre ${croissant ? 'croissant' : 'décroissant'} : ${nombres.map(ecrire).join(' ; ')}`,
          reponse: ecrireListe(bon),
          pieges: [...new Set([ecrireListe(commeDesEntiers), ecrireListe([...bon].reverse()), ecrireListe(parLongueur),
            ...RM.melanger([0, 1, 2]).map(i => ecrireListe(echange(i)))])].filter(p => p !== ecrireListe(bon)).slice(0, 3),
          explication: `Même partie entière : on écrit les nombres avec ${k} chiffres après la virgule `
            + `(${nombres.map(x => avecDecimales(x, k)).join(' ; ')}) et on les compare.<br>`
            + `<b>${bon.map(ecrire).join(croissant ? ' &lt; ' : ' &gt; ')}</b>`,
        });
      }
      if (sorte === 'intercaler') {
        const e = entier(0, 20);
        let a;
        let pas;
        if (Math.random() < 0.6) {
          a = net(e + entier(1, 8) / 10);
          pas = 0.1;
        } else {
          a = net(e + entier(1, 8) / 10 + entier(1, 9) / 100);
          pas = 0.01;
        }
        const b = net(a + pas);
        const k = decimalesDe(a) + 1;
        const reponse = net(a + entier(1, 9) * pas / 10);
        // Les pièges sont en dehors : un peu en dessous de a (3,39 ; ou 3,04, la confusion entre 3,4 et 3,04), ou au-dessus de b
        const [j1, j2, j3] = RM.melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const dehors = [net(a - j1 * pas / 10), net(a - j2 * pas / 10), net(e + entier(1, 9) / 100),
          net(b + j1 * pas / 10), net(b + j3 * pas / 10), net(a + 2 * pas)];
        return choix({
          consigne: 'Intercale un nombre',
          enonce: `Quel nombre est compris entre ${ecrire(a)} et ${ecrire(b)} ?`,
          reponse,
          pieges: piegesAutour(reponse, dehors.filter(p => p < a - 1e-9 || p > b + 1e-9)),
          explication: `${ecrire(a)} = ${avecDecimales(a, k)} et ${ecrire(b)} = ${avecDecimales(b, k)}. Entre les deux, il y a `
            + `${avecDecimales(net(a + pas / 10), k)} ; ${avecDecimales(net(a + pas / 5), k)} ; … ; ${avecDecimales(net(b - pas / 10), k)}.<br>`
            + `<b>${ecrire(reponse)}</b> est compris entre ${ecrire(a)} et ${ecrire(b)}.`,
        });
      }
      if (sorte === 'encadrer') {
        const x = decimal(1, 99, parmi([2, 2, 3]));
        const auDixieme = Math.random() < 0.5;
        const pas = auDixieme ? 0.1 : 1;
        const bas = auDixieme ? net(Math.floor(net(x * 10)) / 10) : Math.floor(x);
        const haut = net(bas + pas);
        const trouEnBas = Math.random() < 0.5;
        const k = decimalesDe(x);
        // Au dixième, les bornes s'écrivent avec un chiffre après la virgule (85,0 et 85,1 ; 98,9 et 99,0)
        const borne = v => (auDixieme ? avecDecimales(v, 1) : ecrire(v));
        const encadrement = `${borne(bas)} &lt; ${ecrire(x)} &lt; ${borne(haut)}`;
        return nombre({
          consigne: auDixieme ? 'Encadre au dixième' : 'Encadre par deux entiers qui se suivent',
          enonce: trouEnBas ? `___ &lt; ${ecrire(x)} &lt; ${borne(haut)}` : `${borne(bas)} &lt; ${ecrire(x)} &lt; ___`,
          reponse: trouEnBas ? bas : haut,
          solution: `<b>${encadrement}</b>`,
          explication: (auDixieme
            ? `${ecrire(x)} est entre ${borne(bas)} et ${borne(haut)}, deux dixièmes qui se suivent `
              + `(${avecDecimales(bas, k)} &lt; ${ecrire(x)} &lt; ${avecDecimales(haut, k)}).<br>`
            : `${ecrire(x)} a pour partie entière ${bas} : il est entre ${bas} et ${haut}.<br>`)
            + `<b>${encadrement}</b>`,
        });
      }
      if (sorte === 'arrondir') {
        const a = aArrondir();
        const commun = {
          consigne: 'Arrondis',
          enonce: `L’arrondi de ${ecrire(a.x)} ${RANG_ARRONDI[a.rang]} est ___.`,
          reponse: a.arrondi,
          explication: expliquerArrondi(a),
        };
        if (Math.random() < 0.4) return nombre(commun);
        // Toujours l'autre voisin (arrondir du mauvais côté), puis d'autres rangs ou le nombre lui-même
        const pas = 10 ** -a.rang;
        const autres = [a.x, a.arrondi - pas, a.arrondi + pas, a.arrondi + 2 * pas, a.arrondi - 2 * pas];
        if (a.rang + 1 < decimalesDe(a.x)) autres.push(arrondir(a.x, a.rang + 1));
        if (a.rang > 0) autres.push(arrondir(a.x, a.rang - 1));
        return choix({ ...commun, pieges: classiquesEtAutres(a.arrondi, [egaux(a.arrondi, a.dessous) ? a.dessus : a.dessous], autres) });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['comparer', 'comparer', 'entre', 'arrondi']);
      if (genre === 'comparer') {
        let a;
        let b;
        do { [a, b] = paireAComparer(); } while (egaux(a.valeur, b.valeur));
        const bon = signe(a.valeur, b.valeur);
        const dit = vrai ? bon : (bon === '<' ? '>' : '<');
        return vraiFaux({ enonce: `${a.texte} ${SIGNES_HTML[dit]} ${b.texte}`, vrai, explication: expliquerComparaison(a, b) });
      }
      if (genre === 'entre') {
        const e = entier(0, 20);
        const a = net(e + entier(1, 8) / 10);
        const b = net(a + 0.1);
        const x = vrai ? net(a + entier(1, 9) / 100) : parmi([net(e + entier(1, 9) / 100), net(b + entier(1, 9) / 100)]);
        return vraiFaux({
          enonce: `${ecrire(x)} est compris entre ${ecrire(a)} et ${ecrire(b)}.`,
          vrai,
          explication: `${ecrire(a)} = ${avecDecimales(a, 2)} et ${ecrire(b)} = ${avecDecimales(b, 2)} : `
            + `${vrai ? `<b>${avecDecimales(x, 2)} est bien entre les deux</b>` : `<b>${avecDecimales(x, 2)} n’est pas entre les deux</b>`}.`,
        });
      }
      const a = aArrondir();
      return vraiFaux({
        enonce: `L’arrondi de ${ecrire(a.x)} ${RANG_ARRONDI[a.rang]} est ${ecrire(vrai ? a.arrondi : (egaux(a.arrondi, a.dessous) ? a.dessus : a.dessous))}.`,
        vrai,
        explication: expliquerArrondi(a),
      });
    },
    titreLecon: 'Comparer et arrondir',
    lecon: `
      <h4>Comparer deux nombres décimaux</h4>
      <p>1. On compare les <b>parties entières</b> : <i>12,3 &gt; 9,87</i> car 12 &gt; 9.<br>
        2. Si elles sont égales, on compare les <b>dixièmes</b>, puis les <b>centièmes</b>, puis les <b>millièmes</b>.</p>
      <p>👉 <i>2,5 &gt; 2,45</i> (5 dixièmes &gt; 4 dixièmes) · <i>3,08 &lt; 3,8</i> · <i>4,5 = 4,50</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> écris les deux nombres avec autant de chiffres après la virgule :
        2,5 = 2,<b>50</b> et 50 centièmes &gt; 45 centièmes, donc 2,5 &gt; 2,45.</div>
      <p>⚠️ Le nombre qui a le plus de chiffres n’est pas forcément le plus grand !</p>
      <h4>Intercaler et encadrer</h4>
      <p>Entre deux nombres décimaux, il y a toujours d’autres nombres : entre 3,4 et 3,5, il y a 3,41 ; 3,45 ; 3,49…<br>
        Encadrer 7,38 à l’unité : <i>7 &lt; 7,38 &lt; 8</i> ; au dixième : <i>7,3 &lt; 7,38 &lt; 7,4</i>.</p>
      <h4>Arrondir</h4>
      <p>On regarde le chiffre <b>juste après</b> le rang voulu : 0, 1, 2, 3 ou 4 → on garde le nombre du dessous ;
        5, 6, 7, 8 ou 9 → on prend le nombre du dessus.<br>
        👉 12,764 arrondi à l’unité : <b>13</b> · au dixième : <b>12,8</b> · au centième : <b>12,76</b></p>
    `,
  });

  // ======================================================================
  // 4. Additionner et soustraire
  // ======================================================================
  // Les calculs posés sont faits en entiers (en centièmes ou en millièmes), pour imiter les erreurs des élèves
  const enEntier = (x, k) => Math.round(x * 10 ** k);

  // L'addition posée SANS les retenues : 2,75 + 1,48 → 3,13
  function sansRetenue(a, b) {
    const k = Math.max(decimalesDe(a), decimalesDe(b));
    let [A, B] = [enEntier(a, k), enEntier(b, k)];
    let resultat = 0;
    let p = 1;
    while (A > 0 || B > 0) {
      const s = (A % 10) + (B % 10);
      A = Math.floor(A / 10);
      B = Math.floor(B / 10);
      resultat += (A > 0 || B > 0 ? s % 10 : s) * p;
      p *= 10;
    }
    return resultat / 10 ** k;
  }

  // Les virgules mal alignées : on aligne les chiffres à droite, comme pour des entiers (0,5 + 0,25 → 0,30)
  function virgulesMalAlignees(a, b, signeOp = 1) {
    const [da, db] = [decimalesDe(a), decimalesDe(b)];
    if (da === db) return null;
    const r = (enEntier(a, da) + signeOp * enEntier(b, db)) / 10 ** Math.max(da, db);
    return r > 0 ? r : null;
  }

  // La soustraction posée avec une erreur, colonne par colonne :
  // 'petitDuGrand' (dans chaque colonne, le plus grand moins le plus petit : 3 − 0,4 → 3,4),
  // 'petitDuGrandRetenue' (la même, avec une retenue quand même : 2,4), 'retenueOubliee' (10 − 4 = 6, sans la retenue : 3,6)
  function soustractionFausse(a, b, facon) {
    const k = Math.max(decimalesDe(a), decimalesDe(b));
    let [A, B] = [enEntier(a, k), enEntier(b, k)];
    let resultat = 0;
    let p = 1;
    let retenue = 0;
    while (A > 0 || B > 0) {
      const x = A % 10;
      const y = (B % 10) + (facon === 'petitDuGrandRetenue' ? retenue : 0);
      let chiffre;
      if (facon === 'retenueOubliee') chiffre = x >= y ? x - y : x + 10 - y;
      else chiffre = Math.abs(x - y);
      retenue = x < y ? 1 : 0;
      resultat += chiffre * p;
      A = Math.floor(A / 10);
      B = Math.floor(B / 10);
      p *= 10;
    }
    return resultat / 10 ** k;
  }

  // Une addition de décimaux, avec des retenues ou des nombres de chiffres différents après la virgule (sinon, c'est trop facile)
  function additionAuHasard() {
    let a;
    let b;
    do {
      [a, b] = parmi([
        () => [decimal(1, 60, 2), decimal(0.1, 30, 1)],
        () => [decimal(1, 50, 1), decimal(1, 50, 1)],
        () => [entier(2, 60), decimal(0.1, 20, parmi([1, 2]))],
        () => [decimal(0.1, 0.9, 1), decimal(0.01, 0.99, 2)],
        () => [decimal(1, 20, 2), decimal(1, 20, 2)],
      ])();
    } while (decimalesDe(a) === decimalesDe(b) && egaux(sansRetenue(a, b), a + b));
    return Math.random() < 0.5 ? [a, b] : [b, a];
  }

  // Une soustraction a − b, avec a plus grand que b
  function soustractionAuHasard() {
    return parmi([
      () => { const a = entier(2, 50); return [a, decimal(0.1, Math.min(a - 0.1, 30), parmi([1, 2]))]; },
      () => { const a = decimal(2, 60, 1); return [a, decimal(0.1, a - 0.1, 2)]; },
      () => { const a = decimal(2, 60, 2); return [a, decimal(0.1, a - 0.1, 2)]; },
      () => [entier(1, 9), decimal(0.1, 0.9, 1)],
    ])();
  }

  function expliquerAddition(a, b) {
    const k = Math.max(decimalesDe(a), decimalesDe(b));
    const s = net(a + b);
    const debut = decimalesDe(a) !== decimalesDe(b)
      ? `On aligne les virgules (on complète avec des zéros) : ${avecDecimales(a, k)} + ${avecDecimales(b, k)} = <b>${ecrire(s)}</b>.`
      : `On aligne les virgules : ${ecrire(a)} + ${ecrire(b)} = <b>${ecrire(s)}</b>.`;
    const piege = virgulesMalAlignees(a, b);
    if (piege !== null && decimalesDe(a) > 0 && decimalesDe(b) > 0) {
      return `${debut}<br>⚠️ On ajoute les dixièmes avec les dixièmes, les centièmes avec les centièmes : pas ${avecDecimales(piege, k)} !`;
    }
    return `${debut}<br>N’oublie pas les retenues !`;
  }

  function expliquerSoustraction(a, b) {
    const k = Math.max(decimalesDe(a), decimalesDe(b));
    const d = net(a - b);
    // La première colonne où le chiffre du haut est plus petit que celui du bas : il y faut une retenue
    const [haut, bas] = [String(enEntier(a, k)), String(enEntier(b, k)).padStart(String(enEntier(a, k)).length, '0')];
    let colonne = -1;
    for (let i = haut.length - 1; i >= 0 && colonne < 0; i--) if (Number(haut[i]) < Number(bas[i])) colonne = i;
    const zeros = decimalesDe(a) !== decimalesDe(b) ? ' (on complète avec des zéros)' : '';
    return `On aligne les virgules${zeros} : ${avecDecimales(a, k)} − ${avecDecimales(b, k)} = <b>${ecrire(d)}</b>.<br>`
      + (colonne >= 0 ? `⚠️ Quand le chiffre du haut est plus petit, il faut une retenue : ${haut[colonne]} − ${bas[colonne]}, ce n’est pas ${bas[colonne] - haut[colonne]} !<br>` : '')
      + `Vérifie : ${ecrire(d)} + ${ecrire(b)} = ${ecrire(a)}.`;
  }

  // Compléter à 1, à 10 ou à 100, par bonds : 7,4 + 0,6 = 8 ; 8 + 2 = 10
  function complementAuHasard() {
    const facon = parmi(['a10', 'a1', 'a100']);
    if (facon === 'a10') {
      const x = decimal(1.1, 9.9, 1);
      return { x, cible: 10, palier: Math.ceil(x) };
    }
    if (facon === 'a1') {
      const x = decimal(0.11, 0.89, 2);
      return { x, cible: 1, palier: net(Math.ceil(net(x * 10)) / 10) };
    }
    let x;
    do { x = entier(11, 89); } while (x % 10 === 0);
    return { x, cible: 100, palier: Math.ceil(x / 10) * 10 };
  }

  // L'erreur classique : compléter chaque chiffre à 10 (7,4 → 3,6 ; 63 → 47) ou à 9
  function chiffreParChiffre(x, a) {
    const k = decimalesDe(x);
    const chiffres = [...String(enEntier(x, k))].map(c => a - Number(c));
    if (chiffres.some(c => c < 0 || c > 9)) return null;
    return Number(chiffres.join('')) / 10 ** k;
  }

  ajouterEtape({
    id: '6e-nombres-addition',
    banque: ['somme', 'somme', 'somme', 'difference', 'difference', 'calcul', 'complement', 'complement',
      'ordreGrandeur', 'probleme', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'somme') {
        const [a, b] = additionAuHasard();
        const s = net(a + b);
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${ecrire(a)} + ${ecrire(b)} = ___`,
          reponse: s,
          pieges: classiquesEtAutres(s, RM.melanger([virgulesMalAlignees(a, b), sansRetenue(a, b)]), [s - 1, s - 0.1, s + 0.1, s + 1, s * 10, s / 10]),
          explication: expliquerAddition(a, b),
        });
      }
      if (sorte === 'difference') {
        const [a, b] = soustractionAuHasard();
        const d = net(a - b);
        const erreurs = [soustractionFausse(a, b, 'petitDuGrand'), soustractionFausse(a, b, 'retenueOubliee'),
          soustractionFausse(a, b, 'petitDuGrandRetenue'), virgulesMalAlignees(a, b, -1)];
        // 8 − 2,35 → 6,35 : on n'a soustrait que les parties entières
        if (Number.isInteger(a)) erreurs.push(net(a - Math.floor(b) + b - Math.floor(b)));
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${ecrire(a)} − ${ecrire(b)} = ___`,
          reponse: d,
          pieges: classiquesEtAutres(d, RM.melanger(erreurs), [d - 1, d - 0.1, d + 0.1, d + 1, d * 10, d / 10]),
          explication: expliquerSoustraction(a, b),
        });
      }
      if (sorte === 'calcul') {
        if (Math.random() < 0.5) {
          const [a, b] = additionAuHasard();
          return nombre({ consigne: 'Calcule', enonce: `${ecrire(a)} + ${ecrire(b)} = ___`, reponse: a + b, explication: expliquerAddition(a, b) });
        }
        const [a, b] = soustractionAuHasard();
        return nombre({ consigne: 'Calcule', enonce: `${ecrire(a)} − ${ecrire(b)} = ___`, reponse: a - b, explication: expliquerSoustraction(a, b) });
      }
      if (sorte === 'complement') {
        const { x, cible, palier } = complementAuHasard();
        const r = net(cible - x);
        const [bond1, bond2] = [net(palier - x), net(cible - palier)];
        const faux = chiffreParChiffre(x, 10);
        const explication = (bond2 > 0
          ? `Par bonds : ${ecrire(x)} + ${ecrire(bond1)} = ${ecrire(palier)} ; ${ecrire(palier)} + ${ecrire(bond2)} = ${ecrire(cible)}.<br>`
            + `Il manque ${ecrire(bond1)} + ${ecrire(bond2)} = <b>${ecrire(r)}</b>.`
          : `${ecrire(x)} + <b>${ecrire(r)}</b> = ${ecrire(cible)}.`)
          + (faux !== null && !egaux(faux, r) ? `<br>⚠️ Pas ${ecrire(faux)} : ${ecrire(x)} + ${ecrire(faux)} = ${ecrire(net(x + faux))}.` : '');
        const commun = { consigne: 'Complète', enonce: `${ecrire(x)} + ___ = ${ecrire(cible)}`, reponse: r, explication };
        if (Math.random() < 0.4) return nombre(commun);
        const pas = cible === 100 ? 10 : cible === 10 ? 1 : 0.1;
        return choix({
          ...commun,
          pieges: classiquesEtAutres(r, [faux, chiffreParChiffre(x, 9)], [r + pas, r - pas, r + pas / 10, r - pas / 10, r + 2 * pas]),
        });
      }
      if (sorte === 'ordreGrandeur') {
        const grand = Math.random() < 0.4;
        const pas = grand ? 100 : 10;
        const [ra, rb] = [entier(2, 9) * pas, entier(1, 8) * pas];
        const plus = Math.random() < 0.5 || ra <= rb;
        const a = decimal(ra - 0.24 * pas, ra + 0.24 * pas, 1);
        const b = decimal(rb - 0.24 * pas, rb + 0.24 * pas, 1);
        const r = plus ? ra + rb : ra - rb;
        const exact = net(plus ? a + b : a - b);
        return choix({
          consigne: 'Trouve l’ordre de grandeur (sans poser le calcul)',
          enonce: `${ecrire(a)} ${plus ? '+' : '−'} ${ecrire(b)} ≈ ___`,
          reponse: r,
          // Chaque nombre est à 0,24 pas au plus de son arrondi : le résultat exact s'arrondit toujours à r (pas d'ambiguïté)
          pieges: [r - 3 * pas, r - 2 * pas, r - pas, r + pas, r + 2 * pas, r + 3 * pas].filter(p => p > 0),
          explication: `${ecrire(a)} ≈ ${ecrire(ra)} et ${ecrire(b)} ≈ ${ecrire(rb)}, donc le résultat est proche de `
            + `${ecrire(ra)} ${plus ? '+' : '−'} ${ecrire(rb)} = <b>${ecrire(r)}</b>.<br>(Le calcul exact donne ${ecrire(exact)}.)`,
        });
      }
      if (sorte === 'probleme') {
        const [p1, p2] = deuxEnfants();
        const probleme = parmi([
          () => {
            const [a, b] = [prix(5, 15), prix(1, 4)];
            return { enonce: `${p1.nom} achète un livre à ${euros(a)} et un stylo à ${euros(b)}. Combien paie-t-${p1.il} en tout ?`,
              reponse: net(a + b), unite: '€', calcul: `${euros(a)} + ${euros(b)} = <b>${euros(net(a + b))}</b>` };
          },
          () => {
            const c = entier(20, 50);
            const a = prix(8, c - 2);
            return { enonce: `${p1.nom} a ${euros(c)} dans sa tirelire. ${p1.Il} achète un jeu à ${euros(a)}. Combien lui reste-t-il ?`,
              reponse: net(c - a), unite: '€', calcul: `${euros(c)} − ${euros(a)} = <b>${euros(net(c - a))}</b>` };
          },
          () => {
            const [a, b] = [prix(0.9, 1.5), prix(0.9, 1.6)];
            const billet = parmi([5, 10]);
            const r = net(billet - a - b);
            return { enonce: `${p1.nom} achète une baguette à ${euros(a)} et un croissant à ${euros(b)}. ${p1.Il} paie avec `
              + `un billet de ${euros(billet)}. Combien la boulangère lui rend-elle ?`,
              reponse: r, unite: '€',
              calcul: `${euros(a)} + ${euros(b)} = ${euros(net(a + b))}, puis ${euros(billet)} − ${euros(net(a + b))} = <b>${euros(r)}</b>` };
          },
          () => {
            const [a, b] = [decimal(0.5, 3, 2), decimal(0.2, 2, 1)];
            return { enonce: `Au marché, Mamie achète ${mesure(a, 'kg')} de pommes et ${mesure(b, 'kg')} de poires. `
              + 'Quelle masse de fruits a-t-elle achetée ?',
              reponse: net(a + b), unite: 'kg', calcul: `${mesure(a, 'kg')} + ${mesure(b, 'kg')} = <b>${mesure(net(a + b), 'kg')}</b>` };
          },
          () => {
            const a = decimal(2, 3, 2);
            const b = net(a + decimal(0.05, 0.6, 2));
            return { enonce: `Au saut en longueur, ${p1.nom} saute ${mesure(a, 'm')} et ${p2.nom} saute ${mesure(b, 'm')}. `
              + `De combien de mètres ${p2.nom} a-t-${p2.il} sauté plus loin ?`,
              reponse: net(b - a), unite: 'm', calcul: `${mesure(b, 'm')} − ${mesure(a, 'm')} = <b>${mesure(net(b - a), 'm')}</b>` };
          },
          () => {
            const a = parmi([1, 1.5, 2]);
            const b = decimal(0.1, 0.9, 2);
            return { enonce: `Une bouteille contient ${mesure(a, 'L')} d’eau. ${p1.nom} en boit ${mesure(b, 'L')}. Combien en reste-t-il ?`,
              reponse: net(a - b), unite: 'L', calcul: `${mesure(a, 'L')} − ${mesure(b, 'L')} = <b>${mesure(net(a - b), 'L')}</b>` };
          },
        ])();
        return nombre({
          consigne: 'Résous le problème',
          enonce: probleme.enonce,
          reponse: probleme.reponse,
          unite: probleme.unite,
          prix: probleme.unite === '€',
          explication: `${probleme.calcul}<br>On aligne bien les virgules, et on n’oublie pas les retenues.`,
        });
      }
      // Vrai ou faux : un calcul juste, ou avec une erreur classique
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.5) {
        let a;
        let b;
        let faux;
        do {
          [a, b] = additionAuHasard();
          faux = parmi([virgulesMalAlignees(a, b), sansRetenue(a, b)]);
        } while (faux === null || egaux(faux, a + b));
        return vraiFaux({
          enonce: `${ecrire(a)} + ${ecrire(b)} = ${ecrire(vrai ? net(a + b) : faux)}`,
          vrai,
          explication: expliquerAddition(a, b),
        });
      }
      let a;
      let b;
      let faux;
      do {
        [a, b] = soustractionAuHasard();
        faux = soustractionFausse(a, b, parmi(['petitDuGrand', 'retenueOubliee', 'petitDuGrandRetenue']));
      } while (egaux(faux, a - b));
      return vraiFaux({
        enonce: `${ecrire(a)} − ${ecrire(b)} = ${ecrire(vrai ? net(a - b) : faux)}`,
        vrai,
        explication: expliquerSoustraction(a, b),
      });
    },
    titreLecon: 'Additionner et soustraire',
    lecon: `
      <h4>Poser une addition ou une soustraction</h4>
      <p>On <b>aligne les virgules</b> : les unités sous les unités, les dixièmes sous les dixièmes…
        On peut compléter avec des <b>zéros</b> pour avoir autant de chiffres après la virgule.</p>
      <table>
        <tr><td></td><td>4</td><td>,</td><td>7</td><td>5</td></tr>
        <tr><td>+</td><td>2</td><td>,</td><td>6</td><td>0</td></tr>
        <tr><td>=</td><td>7</td><td>,</td><td>3</td><td>5</td></tr>
      </table>
      <p>👉 <i>0,5 + 0,25 = 0,50 + 0,25 = 0,75</i> (et pas 0,30 !) · <i>3 − 0,4 = 3,0 − 0,4 = 2,6</i></p>
      <p>⚠️ N’oublie pas les <b>retenues</b>. En soustraction, 0 − 4, ce n’est pas 4 : il faut une retenue.</p>
      <h4>Calculer de tête</h4>
      <p>Pour compléter, on avance par bonds : <i>7,4 + 0,6 = 8</i>, puis <i>8 + 2 = 10</i>. Donc 7,4 + <b>2,6</b> = 10.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> avant de calculer, cherche un <b>ordre de grandeur</b> :
        48,9 + 31,2 ≈ 50 + 30 = 80. Si ton résultat est loin de 80, recommence !</div>
    `,
  });

  // ======================================================================
  // 5. × et ÷ par 10, 100, 1 000
  // ======================================================================
  const PUISSANCES = [10, 100, 1000];
  const RANGS = { 10: 'd’un rang', 100: 'de 2 rangs', 1000: 'de 3 rangs' };
  const FOIS_PLUS = { 10: '10 fois', 100: '100 fois', 1000: '1&nbsp;000 fois' };
  // × 0,1 = ÷ 10 ; × 0,01 = ÷ 100 ; × 0,001 = ÷ 1 000
  const DIXIEMES = { 10: '0,1', 100: '0,01', 1000: '0,001' };
  const PARTS = { 10: 'un dixième', 100: 'un centième', 1000: 'un millième' };

  // Un nombre de départ : un entier ou un nombre décimal (pas d'entier d'un seul chiffre : 2 × 10, c'est trop facile)
  const nombreDeDepart = () => parmi([
    () => entier(11, 99),
    () => entier(101, 999),
    () => decimal(0.1, 9.9, 1),
    () => decimal(1, 99, 2),
    () => decimal(0.01, 0.99, 2),
    () => decimal(10, 99, 1),
  ])();

  // L'erreur classique : « × 100, j’ajoute deux zéros », même après la virgule (3,47 × 100 → 3,4700)
  const zerosAjoutes = (a, p) => ecrire(a) + String(p).slice(1);

  function expliquerFois(a, p) {
    return `Multiplier par ${ecrire(p)}, c’est rendre le nombre <b>${FOIS_PLUS[p]} plus grand</b> : `
      + `chaque chiffre avance ${RANGS[p]} vers la gauche (la virgule se décale ${RANGS[p]} vers la droite).<br>`
      + `${ecrire(a)} × ${ecrire(p)} = <b>${ecrire(net(a * p))}</b>`;
  }

  function expliquerDivise(a, p) {
    return `Diviser par ${ecrire(p)}, c’est rendre le nombre <b>${FOIS_PLUS[p]} plus petit</b> : `
      + `chaque chiffre recule ${RANGS[p]} vers la droite (la virgule se décale ${RANGS[p]} vers la gauche).<br>`
      + `${ecrire(a)} ÷ ${ecrire(p)} = <b>${ecrire(net(a / p))}</b>`;
  }

  ajouterEtape({
    id: '6e-nombres-fois-10',
    // Les sortes de questions (une sorte répétée revient plus souvent)
    banque: ['fois', 'fois', 'divise', 'choixFois', 'choixDivise', 'choixDivise', 'facteur', 'dixieme'],
    creerQuestion(sorte) {
      const a = nombreDeDepart();
      // Pas plus de 4 chiffres après la virgule : 0,47 ÷ 1 000 = 0,00047, c'est trop
      const p = parmi(PUISSANCES.filter(p => decimalesDe(a) + String(p).length - 1 <= 4));

      if (sorte === 'fois') {
        return nombre({
          consigne: 'Calcule',
          enonce: `${ecrire(a)} × ${ecrire(p)} = ___`,
          reponse: a * p,
          explication: expliquerFois(a, p),
        });
      }
      if (sorte === 'divise') {
        return nombre({
          consigne: 'Calcule',
          enonce: `${ecrire(a)} ÷ ${ecrire(p)} = ___`,
          reponse: a / p,
          explication: expliquerDivise(a, p),
        });
      }
      if (sorte === 'choixFois') {
        // Des pièges plus petits et plus grands que la réponse : le moteur en choisit pour varier sa place
        const pieges = [a / p, a * p * 10, a * p * 100];
        if (p > 10) pieges.push(a * p / 10); // (avec p = 10, ce serait le nombre de départ)
        if (!Number.isInteger(a)) pieges.push(zerosAjoutes(a, p));
        else pieges.push(a + p); // × 10 confondu avec + 10 : 87 × 10 → 97
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${ecrire(a)} × ${ecrire(p)} = ___`,
          reponse: a * p,
          pieges: pieges.filter(x => typeof x === 'string' || decimalesDe(x) <= 5),
          explication: expliquerFois(a, p)
            + (Number.isInteger(a) ? '' : `<br>⚠️ On n’ajoute pas de zéros après la virgule : ${zerosAjoutes(a, p)}, c’est toujours ${ecrire(a)} !`),
        });
      }
      if (sorte === 'choixDivise') {
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${ecrire(a)} ÷ ${ecrire(p)} = ___`,
          reponse: a / p,
          pieges: [a * p, a / p * 10, a / p * 100, a / p / 10, a / p / 100].filter(x => decimalesDe(x) <= 5),
          explication: expliquerDivise(a, p),
        });
      }
      if (sorte === 'facteur') {
        // Retrouver le nombre qui manque : 3,5 × ___ = 350
        const multiplier = Math.random() < 0.6;
        const resultat = multiplier ? net(a * p) : net(a / p);
        return choix({
          consigne: 'Quel nombre manque ?',
          enonce: `${ecrire(a)} ${multiplier ? '×' : '÷'} ___ = ${ecrire(resultat)}`,
          reponse: p,
          choix: PUISSANCES,
          explication: multiplier
            ? `${ecrire(resultat)} est ${FOIS_PLUS[p]} plus grand que ${ecrire(a)} : chaque chiffre a avancé ${RANGS[p]}. `
              + `On a donc multiplié par <b>${ecrire(p)}</b>.`
            : `${ecrire(resultat)} est ${FOIS_PLUS[p]} plus petit que ${ecrire(a)} : chaque chiffre a reculé ${RANGS[p]}. `
              + `On a donc divisé par <b>${ecrire(p)}</b>.`,
        });
      }
      // Nouveauté de 6e : multiplier par 0,1, c'est diviser par 10.
      // Vrai ou faux, avec « ÷ » ou avec la valeur (pour qu'on ne devine pas la réponse à la forme de l'égalité)
      const vrai = Math.random() < 0.5;
      const avecDivision = Math.random() < 0.5;
      const autreP = parmi(PUISSANCES.filter(x => x !== p && decimalesDe(a) + String(x).length - 1 <= 4));
      let droite;
      if (vrai) droite = avecDivision ? `${ecrire(a)} ÷ ${ecrire(p)}` : ecrire(net(a / p));
      else droite = avecDivision ? `${ecrire(a)} ÷ ${ecrire(autreP)}` : ecrire(net(a * p));
      return vraiFaux({
        enonce: `${ecrire(a)} × ${DIXIEMES[p]} = ${droite}`,
        vrai,
        explication: `Multiplier par ${DIXIEMES[p]}, c’est prendre ${PARTS[p]} du nombre : c’est <b>diviser par ${ecrire(p)}</b>`
          + `${vrai || avecDivision ? '' : ' (le nombre devient plus petit)'}.<br>`
          + `${ecrire(a)} × ${DIXIEMES[p]} = ${ecrire(a)} ÷ ${ecrire(p)} = <b>${ecrire(net(a / p))}</b>.`,
      });
    },
    titreLecon: '× et ÷ par 10, 100, 1 000',
    lecon: `
      <h4>Multiplier par 10, 100, 1&nbsp;000</h4>
      <p>Le nombre devient <b>10, 100 ou 1&nbsp;000 fois plus grand</b> : chaque chiffre avance de 1, 2 ou 3 rangs vers la gauche.</p>
      <table>
        <tr><th>centaines</th><th>dizaines</th><th>unités</th><th>,</th><th>dixièmes</th><th>centièmes</th></tr>
        <tr><td></td><td></td><td>3</td><td>,</td><td>4</td><td>7</td></tr>
        <tr><td>3</td><td>4</td><td>7</td><td></td><td></td><td></td></tr>
      </table>
      <p>👉 <i>3,47 × 100 = 347</i> · <i>25 × 10 = 250</i> · <i>1,2 × 1&nbsp;000 = 1&nbsp;200</i></p>
      <h4>Diviser par 10, 100, 1&nbsp;000</h4>
      <p>Le nombre devient <b>10, 100 ou 1&nbsp;000 fois plus petit</b> : chaque chiffre recule de 1, 2 ou 3 rangs vers la droite.</p>
      <p>👉 <i>347 ÷ 100 = 3,47</i> · <i>45 ÷ 10 = 4,5</i> · <i>8 ÷ 1&nbsp;000 = 0,008</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> compte les zéros ! × 100 → la virgule saute de <b>2 rangs vers la droite</b> ;
        ÷ 100 → de <b>2 rangs vers la gauche</b>. S’il manque des chiffres, on ajoute des zéros : 8 ÷ 1&nbsp;000 = 0,008.</div>
      <p>⚠️ <i>3,47 × 100</i>, ce n’est pas <i>3,4700</i> : ajouter des zéros après la virgule ne change pas le nombre !</p>
      <p>⭐ <b>Nouveau en 6e :</b> multiplier par 0,1, c’est diviser par 10 (et × 0,01, c’est ÷ 100).</p>
    `,
  });

  // ======================================================================
  // 6. Multiplier ⭐
  // ======================================================================
  // Un produit de deux décimaux qui se calcule de tête : 0,4 × 0,3 ; 0,5 × 1,2 ; 2,3 × 0,04…
  // A et B : les nombres sans virgule ; ia et jb : leurs chiffres après la virgule
  function produitDecimal() {
    for (;;) {
      const A = parmi([entier(2, 9), entier(2, 9), entier(11, 49)]);
      const B = parmi([entier(2, 9), entier(2, 9), parmi([12, 15, 25])]);
      const ia = Math.random() < 0.8 ? entier(1, 2) : 0;
      const jb = entier(1, 2);
      if (A % 10 === 0 || ia + jb > 3 || (A > 9 && B > 9)) continue;
      const p = net(A * B / 10 ** (ia + jb));
      const produit = { a: A / 10 ** ia, b: B / 10 ** jb, A, B, ia, jb, k: ia + jb, p };
      if (Math.random() < 0.5) return produit;
      return { ...produit, a: produit.b, b: produit.a, A: B, B: A, ia: jb, jb: ia };
    }
  }

  function expliquerProduit({ a, b, A, B, ia, jb, k, p }) {
    const avecZeros = virguleDans(A * B, k);
    return `On calcule sans les virgules : ${A} × ${B} = ${ecrire(A * B)}.<br>`
      + `Chiffres après la virgule : ${ia} dans ${ecrire(a)} et ${jb} dans ${ecrire(b)}, donc <b>${k}</b> dans le résultat.<br>`
      + `${ecrire(a)} × ${ecrire(b)} = ${avecZeros === ecrire(p) ? `<b>${avecZeros}</b>` : `${avecZeros} = <b>${ecrire(p)}</b>`}`;
  }

  // La virgule mal placée : 10, 100 ou 1 000 fois trop grand ou trop petit (pas plus de 4 chiffres après la virgule)
  const virgulesDeplacees = p => vraisPieges(p, [p * 10, p / 10, p * 100, p / 100].map(net)).filter(x => decimalesDe(x) <= 4);
  const virgulesAutour = p => piegesAutour(p, [p * 10, p / 10, p * 100, p / 100, p * 1000, p / 1000].map(net).filter(x => decimalesDe(x) <= 4));

  // Les tables : on insiste sur les plus difficiles (6, 7, 8, 9)
  function deuxFacteurs() {
    let a;
    let b;
    do { [a, b] = [entier(3, 9), entier(3, 9)]; } while (a < 6 && b < 6);
    return [a, b];
  }

  // Les astuces de calcul mental
  function calculMalin() {
    return parmi([
      () => {
        const k = entier(2, 9);
        return { calcul: `25 × ${4 * k}`, resultat: 100 * k, astuce: `${4 * k} = 4 × ${k} et 25 × 4 = 100, donc 25 × ${4 * k} = 100 × ${k}` };
      },
      () => {
        const k = entier(6, 24);
        return { calcul: `5 × ${2 * k}`, resultat: 10 * k, astuce: `${2 * k} = 2 × ${k} et 5 × 2 = 10, donc 5 × ${2 * k} = 10 × ${k}` };
      },
      () => {
        const k = entier(3, 19);
        return { calcul: `50 × ${2 * k}`, resultat: 100 * k, astuce: `${2 * k} = 2 × ${k} et 50 × 2 = 100, donc 50 × ${2 * k} = 100 × ${k}` };
      },
      () => {
        let a;
        do { a = entier(3, 29); } while (a % 10 === 0);
        const calcul = Math.random() < 0.5 ? `4 × ${a} × 25` : `25 × ${a} × 4`;
        return { calcul, resultat: 100 * a, astuce: `On regroupe 4 × 25 = 100 : ${calcul} = 100 × ${a}` };
      },
      () => {
        let a;
        do { a = entier(13, 99); } while (a % 10 === 0);
        const calcul = Math.random() < 0.5 ? `2 × ${a} × 5` : `5 × ${a} × 2`;
        return { calcul, resultat: 10 * a, astuce: `On regroupe 2 × 5 = 10 : ${calcul} = 10 × ${a}` };
      },
      () => {
        const a = entier(12, 40);
        return { calcul: `9 × ${a}`, resultat: 9 * a, astuce: `9 × ${a} = 10 × ${a} − ${a} = ${ecrire(10 * a)} − ${a}` };
      },
      () => {
        const a = entier(12, 45);
        return { calcul: `11 × ${a}`, resultat: 11 * a, astuce: `11 × ${a} = 10 × ${a} + ${a} = ${ecrire(10 * a)} + ${a}` };
      },
    ])();
  }

  // Un ordre de grandeur de produit : 49 × 21 ≈ 50 × 20 ; 5,9 × 31 ≈ 6 × 30 ; 398 × 7 ≈ 400 × 7
  function produitApproche() {
    const pres = (r, ecart) => r + parmi([-1, 1]) * entier(1, ecart);
    return parmi([
      () => { const [ra, rb] = [entier(2, 9) * 10, entier(2, 9) * 10]; return { a: pres(ra, 3), b: pres(rb, 3), ra, rb }; },
      () => { const [ra, rb] = [entier(2, 9), entier(2, 9) * 10]; return { a: net(ra + parmi([-1, 1]) * entier(1, 4) / 10), b: pres(rb, 3), ra, rb }; },
      () => { const [ra, rb] = [entier(2, 9) * 100, entier(3, 9)]; return { a: pres(ra, 30), b: rb, ra, rb }; },
    ])();
  }

  ajouterEtape({
    id: '6e-nombres-multiplication',
    banque: ['table', 'table', 'malin', 'entiers', 'entiers', 'decimaux', 'decimaux', 'decimaux', 'virgule', 'virgule',
      'ordreGrandeur', 'probleme', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'table') {
        const [a, b] = deuxFacteurs();
        const table = `Table de ${a} : ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`;
        if (Math.random() < 0.5) {
          return nombre({ consigne: 'Calcule', enonce: `${a} × ${b} = ___`, reponse: a * b, explication: `${table}<br>${a} × ${b} = <b>${a * b}</b>` });
        }
        return choix({
          consigne: 'Quel nombre manque ?',
          enonce: `${a} × ___ = ${a * b}`,
          reponse: b,
          pieges: piegesAutour(b, [b - 3, b - 2, b - 1, b + 1, b + 2, b + 3].filter(x => x >= 2 && x <= 10)),
          explication: `${table}<br>${a} × <b>${b}</b> = ${a * b}`,
        });
      }
      if (sorte === 'malin') {
        const { calcul, resultat, astuce } = calculMalin();
        return nombre({
          consigne: 'Calcule de tête (avec une astuce)',
          enonce: `${calcul} = ___`,
          reponse: resultat,
          explication: `${astuce} = <b>${ecrire(resultat)}</b>.`,
        });
      }
      if (sorte === 'entiers') {
        const choisir = Math.random() < 0.5;
        let a;
        let b;
        do {
          a = choisir ? entier(102, 989) : entier(12, 99);
          b = entier(12, 89);
        } while (a % 10 === 0 || b % 10 === 0);
        const [u, d] = [b % 10, Math.floor(b / 10)];
        const p = a * b;
        const explication = `${ecrire(a)} × ${u} = ${ecrire(a * u)}<br>`
          + `${ecrire(a)} × ${d * 10} = ${ecrire(a * d * 10)} (on décale : un 0 au bout)<br>`
          + `${ecrire(a * u)} + ${ecrire(a * d * 10)} = <b>${ecrire(p)}</b>`;
        if (!choisir) return nombre({ consigne: 'Pose et calcule', enonce: `${a} × ${b} = ___`, reponse: p, explication });
        // L'oubli du décalage (347 × 6 + 347 × 2), et des erreurs de retenue
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${ecrire(a)} × ${b} = ___`,
          reponse: p,
          pieges: [a * u + a * d, ...piegesAutour(p, [p + 1000, p - 1000, p + 100, p - 100, p + 10, p - 10], 2, [a * u + a * d])],
          explication,
        });
      }
      if (sorte === 'decimaux') {
        const produit = produitDecimal();
        const commun = {
          consigne: 'Calcule',
          enonce: `${ecrire(produit.a)} × ${ecrire(produit.b)} = ___`,
          reponse: produit.p,
          explication: expliquerProduit(produit),
        };
        if (Math.random() < 0.4) return nombre(commun);
        // L'erreur classique : les parties entières ensemble, les parties décimales ensemble (2,5 × 1,2 → 2,10 ; 3,7 × 0,4 → 0,28)
        const { a, b, p } = produit;
        const [ea, da = ''] = ecrire(a).split(',');
        const [eb, db = ''] = ecrire(b).split(',');
        let separees = da && db ? Number(`${Number(ea) * Number(eb)}.${Number(da) * Number(db)}`) : null;
        // (si ça ne donne qu'une virgule mal placée, ce n'est pas cette erreur-là : 0,08 × 0,2 → 0,16)
        if (separees !== null && Number.isInteger(Math.round(Math.log10(separees / p) * 1e9) / 1e9)) separees = null;
        return choix({
          ...commun,
          consigne: 'Choisis le bon résultat',
          pieges: separees !== null && !egaux(separees, p)
            ? [separees, ...piegesAutour(p, [p * 10, p / 10, p * 100, p / 100].map(net).filter(x => decimalesDe(x) <= 4), 2, [separees])]
            : virgulesAutour(p),
          explication: expliquerProduit(produit)
            + (separees !== null && !egaux(separees, p) ? ` (et pas ${ecrire(separees)} : on ne multiplie pas les parties entières et décimales à part).` : ''),
        });
      }
      if (sorte === 'virgule') {
        let A;
        let B;
        do { [A, B] = [entier(12, 99), entier(11, 49)]; } while (A % 10 === 0 || B % 10 === 0);
        let ia;
        let jb;
        do { [ia, jb] = [entier(0, 2), entier(0, 2)]; } while (ia + jb < 1 || ia + jb > 3);
        const k = ia + jb;
        const [a, b] = [A / 10 ** ia, B / 10 ** jb];
        const p = net(A * B / 10 ** k);
        const avecZeros = virguleDans(A * B, k);
        return choix({
          consigne: 'Place la virgule',
          enonce: `${A} × ${B} = ${ecrire(A * B)}, donc ${ecrire(a)} × ${ecrire(b)} = ___`,
          reponse: p,
          pieges: virgulesAutour(p),
          explication: `Chiffres après la virgule : ${ia} dans ${ecrire(a)} et ${jb} dans ${ecrire(b)}, donc <b>${k}</b> dans le résultat.<br>`
            + `On place la virgule dans ${ecrire(A * B)} : ${avecZeros === ecrire(p) ? `<b>${avecZeros}</b>` : `${avecZeros} = <b>${ecrire(p)}</b>`}`,
        });
      }
      if (sorte === 'ordreGrandeur') {
        const { a, b, ra, rb } = produitApproche();
        const r = ra * rb;
        return choix({
          consigne: 'Trouve l’ordre de grandeur (sans poser le calcul)',
          enonce: `${ecrire(a)} × ${ecrire(b)} ≈ ___`,
          reponse: r,
          pieges: dixFoisPlus(r),
          explication: `${ecrire(a)} ≈ ${ecrire(ra)}${b === rb ? '' : ` et ${ecrire(b)} ≈ ${ecrire(rb)}`}, donc le résultat est proche de `
            + `${ecrire(ra)} × ${ecrire(rb)} = <b>${ecrire(r)}</b>.<br>(Le calcul exact donne ${ecrire(net(a * b))}.)`,
        });
      }
      if (sorte === 'probleme') {
        const p1 = unEnfant();
        const pb = parmi([
          () => {
            const [a, n] = [prix(1, 4), entier(3, 8)];
            return { enonce: `Un cahier coûte ${euros(a)}. ${p1.nom} en achète ${n}. Combien paie-t-${p1.il} ?`, a, n, unite: '€' };
          },
          () => {
            const [a, n] = [parmi([0.75, 1.5, 0.25, 0.33]), entierSauf(2, 12, [10])];
            return { enonce: `Une bouteille contient ${mesure(a, 'L')} de jus. Combien de litres de jus y a-t-il dans ${n} bouteilles ?`, a, n, unite: 'L' };
          },
          () => {
            const [a, n] = [parmi([2, 4, 5, 6, 8]), parmi([1.5, 2.5, 0.5, 1.2, 3.5])];
            return { enonce: `Papi achète ${mesure(n, 'kg')} de cerises à ${euros(a)} le kilo. Combien paie-t-il ?`, a, n, unite: '€' };
          },
          () => {
            const [a, n] = [parmi([0.4, 0.25, 0.5, 0.8, 1.2]), entier(3, 9)];
            return { enonce: `Un tour de piste mesure ${mesure(a, 'km')}. ${p1.nom} fait ${n} tours. Quelle distance parcourt-${p1.il} ?`, a, n, unite: 'km' };
          },
          () => {
            const [a, n] = [parmi([6, 12]), entier(11, 25)];
            return { enonce: `Une boîte contient ${a} œufs. Combien d’œufs y a-t-il dans ${n} boîtes ?`, a, n, unite: 'œufs' };
          },
          () => {
            const [a, n] = [parmi([1.25, 0.75, 2.5, 1.5]), entier(3, 8)];
            return { enonce: `Une planche mesure ${mesure(a, 'm')}. On en met ${n} bout à bout. Quelle longueur obtient-on ?`, a, n, unite: 'm' };
          },
        ])();
        const r = net(pb.a * pb.n);
        const ecrit = x => (pb.unite === '€' ? euros(x) : mesure(x, pb.unite));
        const oeufs = pb.unite === 'œufs';
        const explication = `On multiplie : ${ecrit(pb.a)} × ${ecrire(pb.n)} = <b>${ecrit(r)}</b>.<br>`
          + (oeufs ? 'On a le même nombre d’œufs dans chaque boîte : c’est une multiplication.'
            : 'Vérifie avec un ordre de grandeur, et compte bien les chiffres après la virgule.');
        if (Math.random() < 0.5) {
          return nombre({
            consigne: 'Résous le problème',
            enonce: pb.enonce,
            reponse: r,
            unite: pb.unite,
            prix: pb.unite === '€',
            explication,
          });
        }
        return choix({
          consigne: 'Résous le problème',
          enonce: pb.enonce,
          reponse: ecrit(r),
          // Additionner au lieu de multiplier, la virgule mal placée, une fois de trop
          // (des œufs : pas de virgule dans les pièges)
          pieges: piegesAutour(r, [pb.a + pb.n, r * 10, r / 10, r + pb.a, r - pb.a].map(net).filter(p => !oeufs || Number.isInteger(p))).map(ecrit),
          explication,
        });
      }
      // Vrai ou faux : un produit de décimaux, juste ou avec la virgule mal placée
      const vrai = Math.random() < 0.5;
      const produit = produitDecimal();
      return vraiFaux({
        enonce: `${ecrire(produit.a)} × ${ecrire(produit.b)} = ${ecrire(vrai ? produit.p : parmi(virgulesDeplacees(produit.p).slice(0, 2)))}`,
        vrai,
        explication: expliquerProduit(produit),
      });
    },
    titreLecon: 'Multiplier',
    lecon: `
      <h4>Les tables et le calcul malin</h4>
      <p>Connaître ses tables par cœur, c’est la clé ! Des produits qui aident : <b>2 × 5 = 10</b> · <b>4 × 25 = 100</b> · <b>2 × 50 = 100</b>.</p>
      <p>👉 <i>5 × 18 = 5 × 2 × 9 = 10 × 9 = 90</i> · <i>25 × 12 = 25 × 4 × 3 = 300</i> · <i>9 × 13 = 130 − 13 = 117</i> · <i>11 × 37 = 370 + 37 = 407</i></p>
      <h4>Poser une multiplication</h4>
      <p>👉 <i>347 × 26</i> : 347 × 6 = 2&nbsp;082, puis 347 × 20 = 6&nbsp;940 (on décale : un 0 au bout).
        On ajoute : 2&nbsp;082 + 6&nbsp;940 = <b>9&nbsp;022</b>.</p>
      <h4>⭐ Nouveau en 6e : un décimal × un décimal</h4>
      <p>1. On calcule <b>sans les virgules</b>. 2. On compte les chiffres après la virgule dans <b>les deux</b> nombres.
        3. Le résultat en a <b>autant</b>.</p>
      <p>👉 <i>0,4 × 0,3</i> : 4 × 3 = 12, et 1 + 1 = 2 chiffres → <b>0,12</b> · <i>2,5 × 1,2</i> : 25 × 12 = 300 → 3,00 = <b>3</b></p>
      <p>⚠️ <i>0,4 × 0,3</i>, ce n’est pas 1,2 ! Quand on multiplie par un nombre plus petit que 1, le résultat est plus petit que l’autre nombre
        (0,12 &lt; 0,4).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie avec un <b>ordre de grandeur</b> : 5,9 × 31 ≈ 6 × 30 = 180.</div>
    `,
  });

  // ======================================================================
  // 7. Diviser ⭐
  // ======================================================================
  // Une division euclidienne : dividende = diviseur × quotient + reste (le reste est plus petit que le diviseur)
  function divisionEuclidienne(resteNulPossible = true) {
    const d = Math.random() < 0.8 ? entier(3, 9) : entier(11, 25);
    const q = d > 9 ? entier(3, 20) : entier(4, 99);
    const r = resteNulPossible && Math.random() < 0.15 ? 0 : entier(1, d - 1);
    return { D: d * q + r, d, q, r };
  }

  function expliquerEuclide({ D, d, q, r }) {
    return `${d} × ${q} = ${ecrire(d * q)} et ${d} × ${q + 1} = ${ecrire(d * (q + 1))} (c’est trop).<br>`
      + `${ecrire(D)} = ${d} × ${q} + ${r}, avec ${r} &lt; ${d} : le quotient est <b>${q}</b>, le reste est <b>${r}</b>.`;
  }

  // Les critères de divisibilité (l'explication dit pourquoi le nombre est divisible, ou pas)
  function critere(n, k) {
    const oui = n % k === 0;
    const u = n % 10;
    const est = `<b>${ecrire(n)} ${oui ? 'est' : 'n’est pas'} divisible par ${k}</b>`;
    if (k === 3 || k === 9) {
      const s = sommeDesChiffres(n);
      return `${[...String(n)].join(' + ')} = ${s}, et ${s} ${oui ? 'est' : 'n’est pas'} un multiple de ${k} : ${est}.`;
    }
    if (k === 4) {
      const fin = n % 100;
      return `Le nombre formé par les deux derniers chiffres est ${fin}, et ${fin} ${oui ? 'est' : 'n’est pas'} un multiple de 4 : ${est}.`;
    }
    if (k === 2) return `${ecrire(n)} se termine par ${u}, un chiffre ${oui ? 'pair' : 'impair'} : ${est}.`;
    if (k === 5) return `${ecrire(n)} se termine par ${u}${oui ? '' : ' (ni 0 ni 5)'} : ${est}.`;
    return `${ecrire(n)} se termine par ${u}${oui ? '' : ' (et pas par 0)'} : ${est}.`;
  }

  // Un nombre de 3 ou 4 chiffres qui vérifie une condition
  function nombreQui(condition) {
    let n;
    do { n = entier(100, 9999); } while (!condition(n));
    return n;
  }

  // Les pièges pour « divisible par k » : des nombres qui ne le sont pas, mais qui en ont l'air
  const FAUX_AMIS = {
    2: [n => n % 2 === 1 && Math.floor(n / 10) % 2 === 0, n => n % 2 === 1],
    3: [n => n % 10 === 3 && n % 3 !== 0, n => [6, 9].includes(n % 10) && n % 3 !== 0, n => n % 3 !== 0],
    // pour 4 : des nombres pairs, ou qui finissent par 4, mais pas divisibles par 4
    4: [n => n % 10 === 4 && n % 4 !== 0, n => n % 2 === 0 && n % 4 !== 0, n => n % 4 !== 0],
    5: [n => sommeDesChiffres(n) % 5 === 0 && n % 5 !== 0, n => Math.floor(n / 10) % 10 === 5 && n % 5 !== 0, n => n % 5 !== 0],
    9: [n => n % 3 === 0 && n % 9 !== 0, n => n % 10 === 9 && n % 9 !== 0, n => n % 3 === 0 && n % 9 !== 0],
    10: [n => n % 10 === 5, n => String(n).slice(0, -1).includes('0') && n % 10 !== 0, n => n % 10 !== 0],
  };

  // Une division décimale qui tombe juste : 15 ÷ 4 = 3,75 ; 12,6 ÷ 4 = 3,15
  function divisionDecimale() {
    if (Math.random() < 0.7) {
      const d = parmi([2, 4, 4, 5, 8]);
      let D;
      do { D = entier(d + 1, d === 8 ? 70 : 99); } while (D % d === 0);
      return { D, d, q: net(D / d) };
    }
    const d = entier(3, 6);
    const q = decimal(1, 20, parmi([1, 2]));
    return { D: net(q * d), d, q };
  }

  // La division posée, chiffre après chiffre : 15 ÷ 4 = 3 reste 3 → 30 ÷ 4 = 7 reste 2 → 20 ÷ 4 = 5
  function expliquerDivisionDecimale({ D, d, q }) {
    const [ent, dec = ''] = ecrire(D).replace(/\s/g, '').split(',');
    let reste = Number(ent) % d;
    const etapes = [`${ent} ÷ ${d} = ${Math.floor(Number(ent) / d)}${reste ? ` reste ${reste}` : ''}`];
    for (let i = 0; (reste > 0 || i < dec.length) && i < 4; i++) {
      const n = reste * 10 + Number(dec[i] || 0);
      reste = n % d;
      etapes.push(`${n} ÷ ${d} = ${Math.floor(n / d)}${reste ? ` reste ${reste}` : ''}`);
    }
    // (on ne parle des zéros ajoutés que si on en ajoute vraiment : 46,24 ÷ 4 n'en a pas besoin)
    const zeros = etapes.length - 1 > dec.length ? ' (on ajoute des zéros)' : '';
    return `On continue la division après la virgule${zeros} :<br>${etapes.join(' → ')}<br>`
      + `Donc <b>${ecrire(D)} ÷ ${d} = ${ecrire(q)}</b> (vérifie : ${ecrire(q)} × ${d} = ${ecrire(D)}).`;
  }

  ajouterEtape({
    id: '6e-nombres-division',
    banque: ['euclide', 'euclide', 'egalite', 'egalite', 'divisible', 'divisible', 'divisible', 'multiples', 'multiples',
      'decimale', 'decimale', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'euclide') {
        const div = divisionEuclidienne();
        const quoi = Math.random() < 0.5 ? 'quotient' : 'reste';
        return nombre({
          consigne: 'La division euclidienne',
          enonce: `Dans la division euclidienne de ${ecrire(div.D)} par ${div.d}, le ${quoi} est ___.`,
          reponse: quoi === 'quotient' ? div.q : div.r,
          explication: expliquerEuclide(div),
        });
      }
      if (sorte === 'egalite') {
        let div;
        do { div = divisionEuclidienne(false); } while (div.q < 2);
        const { D, d, q, r } = div;
        const egalite = (a, b, c, s = '+') => `${ecrire(D)} = ${a} × ${b} ${s} ${c}`;
        return choix({
          consigne: 'La division euclidienne',
          enonce: `Quelle égalité correspond à la division euclidienne de ${ecrire(D)} par ${d} ?`,
          reponse: egalite(d, q, r),
          // Toujours le piège « reste trop grand » (l'égalité est juste, mais ce n'est pas la division euclidienne)
          pieges: [egalite(d, q - 1, r + d), ...RM.melanger([egalite(d, q + 1, d - r, '−'), egalite(d, q, r + 1), egalite(d, q + 1, r)]).slice(0, 2)],
          explication: `Il faut ${ecrire(D)} = ${d} × quotient + reste, avec un reste <b>plus petit que ${d}</b> : <b>${egalite(d, q, r)}</b>.<br>`
            + `⚠️ ${egalite(d, q - 1, r + d)} est juste, mais le reste ${r + d} est plus grand que ${d}.`,
        });
      }
      if (sorte === 'divisible') {
        const k = parmi([2, 3, 3, 4, 4, 5, 9, 9, 10]);
        const n = nombreQui(x => x % k === 0);
        const pieges = [];
        FAUX_AMIS[k].forEach(condition => {
          let p;
          do { p = nombreQui(condition); } while (pieges.includes(p));
          pieges.push(p);
        });
        if (pieges.length < 3) pieges.push(nombreQui(x => x % k !== 0 && !pieges.includes(x)));
        return choix({
          consigne: 'Utilise les critères de divisibilité',
          enonce: `Lequel de ces nombres est divisible par ${k} ?`,
          reponse: n,
          pieges,
          explication: critere(n, k) + ({
            3: '<br>⚠️ Pour 3, regarder le dernier chiffre ne suffit pas : on additionne tous les chiffres.',
            4: '<br>⚠️ Pour 4, être pair ne suffit pas : on regarde le nombre formé par les deux derniers chiffres.',
            9: '<br>⚠️ Pour 9, la somme des chiffres doit être un multiple de 9 (un multiple de 3 ne suffit pas).',
            10: '<br>⚠️ Pour 10, il faut que le dernier chiffre soit 0.',
          }[k] || ''),
        });
      }
      if (sorte === 'multiples') {
        const facon = parmi(['multiple', 'diviseur', 'mots']);
        if (facon === 'multiple') {
          const k = parmi([6, 7, 8, 9, 12, 15, 25]);
          const n = k * entier(3, 12);
          const candidats = [n + 1, n - 1, n + 2, n - 2, n + 10, entier(1, 9) * 10 + (k % 10), n + Math.floor(k / 2)]
            .filter(x => x > 0 && x % k !== 0);
          return choix({
            consigne: 'Multiples et diviseurs',
            enonce: `Lequel de ces nombres est un multiple de ${k} ?`,
            reponse: n,
            pieges: vraisPieges(n, RM.melanger(candidats)),
            explication: `${ecrire(n)} = ${k} × ${n / k} : c’est un <b>multiple de ${k}</b> (il est dans la table de ${k}).<br>`
              + `Les autres nombres ne sont pas dans la table de ${k}.`,
          });
        }
        if (facon === 'diviseur') {
          const N = parmi([24, 36, 40, 42, 45, 48, 54, 56, 60, 63, 72, 84, 90, 96]);
          const diviseurs = [];
          for (let t = 3; t <= N / 2; t++) if (N % t === 0) diviseurs.push(t);
          const t = parmi(diviseurs);
          // Des non-diviseurs petits et grands (jusqu'à N ÷ 2), pour que la réponse ne soit pas « le seul grand nombre »
          const autres = [];
          for (let x = 3; x <= N / 2; x++) if (N % x !== 0) autres.push(x);
          return choix({
            consigne: 'Multiples et diviseurs',
            enonce: `Lequel de ces nombres est un diviseur de ${N} ?`,
            reponse: t,
            pieges: autres,
            explication: `${N} = ${t} × ${N / t} : <b>${t} est un diviseur de ${N}</b> (et ${N} est un multiple de ${t}).<br>`
              + `Avec les autres nombres, la division de ${N} ne tombe pas juste.`,
          });
        }
        const [a, b] = [entier(3, 9), entier(3, 12)];
        const N = a * b;
        const multiple = Math.random() < 0.5;
        return choix({
          consigne: 'Multiple ou diviseur ?',
          enonce: multiple ? `${N} = ${a} × ${b}, donc ${N} est un ___ de ${a}.` : `${N} = ${a} × ${b}, donc ${a} est un ___ de ${N}.`,
          reponse: multiple ? 'multiple' : 'diviseur',
          choix: ['multiple', 'diviseur'],
          explication: `${N} = ${a} × ${b} : ${N} est un <b>multiple</b> de ${a} (il est dans sa table), et ${a} est un <b>diviseur</b> de ${N}.`,
        });
      }
      if (sorte === 'decimale') {
        const div = divisionDecimale();
        const { D, d, q } = div;
        const commun = { consigne: 'Calcule (la division tombe juste)', enonce: `${ecrire(D)} ÷ ${d} = ___`, reponse: q, explication: expliquerDivisionDecimale(div) };
        if (Math.random() < 0.5) return nombre(commun);
        // Les pièges : écrire le reste après la virgule (15 ÷ 4 → 3,3), s'arrêter au quotient entier, la virgule mal placée
        const q0 = Math.floor(D / d);
        const r0 = Number.isInteger(D) ? D % d : null;
        return choix({
          ...commun,
          pieges: classiquesEtAutres(q, [r0 ? net(q0 + r0 / 10) : null, q0 > 0 ? q0 : null], [q * 10, q / 10, q0 + 1, q * 100]),
        });
      }
      if (sorte === 'probleme') {
        const p1 = unEnfant();
        const pb = parmi([
          () => {
            const d = entier(3, 6);
            const q = entier(4, 12);
            const r = entier(2, d - 1); // (au moins 2 : « il reste 1 bonbons » serait faux)
            const D = d * q + r;
            const quoi = Math.random() < 0.5;
            return {
              enonce: `Mamie partage ${D} bonbons entre ${d} enfants : chaque enfant reçoit le même nombre de bonbons, le plus possible. `
                + (quoi ? 'Combien de bonbons chaque enfant reçoit-il ?' : 'Combien de bonbons reste-t-il ?'),
              reponse: quoi ? q : r,
              unite: 'bonbons',
              explication: `${D} = ${d} × ${q} + ${r}, avec ${r} &lt; ${d} : chaque enfant reçoit <b>${q}</b> bonbons, et il en reste <b>${r}</b>.`,
            };
          },
          () => {
            const d = entier(4, 9);
            const q = entier(3, 15);
            const r = entier(1, d - 1);
            const D = d * q + r;
            return {
              enonce: `${p1.nom} range ${D} photos dans un album, ${d} photos par page. Combien de pages lui faut-il ?`,
              reponse: q + 1,
              unite: 'pages',
              explication: `${D} = ${d} × ${q} + ${r} : ${q} pages pleines, et <b>une page de plus</b> pour les ${r} dernières photos.<br>`
                + `Il faut <b>${q + 1}</b> pages.`,
            };
          },
          () => {
            const n = parmi([2, 4, 5]);
            let P;
            do { P = entier(9, 40); } while (P % n === 0);
            return {
              enonce: `${n} amis partagent le prix d’un gâteau de ${euros(P)} en parts égales. Combien paie chacun ?`,
              reponse: net(P / n),
              unite: '€',
              explication: `${ecrire(P)} ÷ ${n} = <b>${euros(net(P / n))}</b> (on continue la division après la virgule).<br>`
                + `Vérifie : ${euros(net(P / n))} × ${n} = ${euros(P)}.`,
            };
          },
          () => {
            const n = parmi([2, 4, 5, 8]);
            let L;
            do { L = entier(3, 15); } while (L % n === 0);
            return {
              enonce: `Un ruban de ${mesure(L, 'm')} est coupé en ${n} morceaux de même longueur. Quelle est la longueur d’un morceau ?`,
              reponse: net(L / n),
              unite: 'm',
              explication: `${ecrire(L)} ÷ ${n} = <b>${mesure(net(L / n), 'm')}</b> (on continue la division après la virgule).<br>`
                + `Vérifie : ${ecrire(net(L / n))} × ${n} = ${ecrire(L)}.`,
            };
          },
        ])();
        return nombre({
          consigne: 'Résous le problème',
          enonce: pb.enonce,
          reponse: pb.reponse,
          unite: pb.unite,
          prix: pb.unite === '€',
          explication: pb.explication,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['divisible', 'divisible', 'reste', 'regle']);
      if (genre === 'divisible') {
        const k = parmi([2, 3, 4, 5, 9, 10]);
        const n = vrai ? nombreQui(x => x % k === 0) : nombreQui(parmi(FAUX_AMIS[k]));
        return vraiFaux({ enonce: `${ecrire(n)} est divisible par ${k}.`, vrai, explication: critere(n, k) });
      }
      if (genre === 'reste') {
        let div;
        do { div = divisionEuclidienne(false); } while (div.q < 2);
        // Le faux reste : la moitié du temps trop grand (r + d), sinon un reste possible mais faux (r ± 1), pour qu'il faille calculer
        const tropGrand = Math.random() < 0.5;
        const faux = tropGrand ? div.r + div.d : parmi([div.r - 1, div.r + 1].filter(x => x >= 0 && x < div.d));
        return vraiFaux({
          enonce: `Dans la division euclidienne de ${ecrire(div.D)} par ${div.d}, le reste est ${vrai ? div.r : faux}.`,
          vrai,
          explication: expliquerEuclide(div)
            + (!vrai && tropGrand ? `<br>⚠️ ${faux} est plus grand que ${div.d} : ce ne peut pas être le reste.` : ''),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['Un nombre divisible par 9 est toujours divisible par 3.', 'Si la somme des chiffres est un multiple de 9, c’est aussi un multiple de 3 (9 = 3 × 3).'],
        ['Un nombre qui se termine par 0 est divisible par 2, par 5 et par 10.', 'Son dernier chiffre est 0 : les trois critères sont vérifiés.'],
        ['Dans une division euclidienne, le reste est toujours plus petit que le diviseur.', 'Sinon, on pourrait encore mettre le diviseur une fois de plus.'],
      ] : [
        ['Un nombre divisible par 3 est toujours divisible par 9.', 'Par exemple, 12 est divisible par 3 (1 + 2 = 3), mais pas par 9.'],
        ['Un nombre qui se termine par 5 est divisible par 10.', 'Par exemple, 25 n’est pas divisible par 10 : il faut que le dernier chiffre soit 0.'],
        ['Un nombre qui se termine par 3 est divisible par 3.', 'Par exemple, 13 n’est pas divisible par 3 : pour 3, on additionne tous les chiffres.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication[0].toLowerCase()}${explication.slice(1)}` });
    },
    titreLecon: 'Diviser',
    lecon: `
      <h4>La division euclidienne</h4>
      <p><i>47 = 6 × 7 + 5</i> : 47 est le <b>dividende</b>, 6 le <b>diviseur</b>, 7 le <b>quotient</b> et 5 le <b>reste</b>.</p>
      <p>⚠️ Le reste est toujours <b>plus petit que le diviseur</b>. 47 = 6 × 6 + 11 est juste, mais ce n’est pas la division
        euclidienne : 11 est plus grand que 6.</p>
      <h4>Multiples et diviseurs</h4>
      <p><i>56 = 7 × 8</i> : 56 est un <b>multiple</b> de 7 (il est dans la table de 7), 7 est un <b>diviseur</b> de 56,
        et 56 est <b>divisible</b> par 7.</p>
      <h4>Les critères de divisibilité</h4>
      <table>
        <tr><th>par 2</th><td>le dernier chiffre est 0, 2, 4, 6 ou 8</td></tr>
        <tr><th>par 5</th><td>le dernier chiffre est 0 ou 5</td></tr>
        <tr><th>par 10</th><td>le dernier chiffre est 0</td></tr>
        <tr><th>⭐ par 3</th><td>la somme des chiffres est un multiple de 3</td></tr>
        <tr><th>⭐ par 9</th><td>la somme des chiffres est un multiple de 9</td></tr>
        <tr><th>⭐ par 4</th><td>le nombre formé par les deux derniers chiffres est un multiple de 4</td></tr>
      </table>
      <p>👉 <i>4&nbsp;725</i> : 4 + 7 + 2 + 5 = 18, un multiple de 9 → divisible par 9 (et par 3), mais pas par 2 ni par 10.
        <i>1&nbsp;316</i> : 16 est un multiple de 4 → divisible par 4.</p>
      <h4>⭐ Une division qui tombe juste</h4>
      <p>On continue après la virgule, en ajoutant des zéros : <i>15 ÷ 4 = 3,75</i>
        (15 ÷ 4 = 3 reste 3 → 30 dixièmes ÷ 4 = 7 reste 2 → 20 centièmes ÷ 4 = 5).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie toujours : 6 × 7 + 5 = 47 ✔ et 3,75 × 4 = 15 ✔</div>
    `,
  });

  // ======================================================================
  // 8. Les fractions ⭐
  // ======================================================================
  // Une figure partagée en n parts égales, dont certaines sont coloriées en orange.
  // forme : 'bande' (n bandes), 'grille' (lignes × colonnes) ou 'disque' (n parts de tarte)
  function figurePartagee(forme, n, coloriees, colonnes = n) {
    const couleur = new Set(coloriees);
    let html = '';
    let largeur;
    let hauteur;
    if (forme === 'disque') {
      const C = [110, 105];
      const R = 90;
      const angle = i => -Math.PI / 2 + (2 * Math.PI * i) / n;
      const surLeCercle = a => [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)];
      html += figures.cercle(C, R, 'fig-plein');
      couleur.forEach(i => {
        const arc = Array.from({ length: 25 }, (_, j) => surLeCercle(angle(i) + (angle(i + 1) - angle(i)) * j / 24));
        html += figures.polygone([C, ...arc], 'fig-barre');
      });
      for (let i = 0; i < n; i++) html += figures.segment(C, surLeCercle(angle(i)));
      html += figures.cercle(C, R);
      [largeur, hauteur] = [220, 210];
    } else {
      const lignes = n / colonnes;
      const [x0, y0] = [20, 20];
      const [l, h] = forme === 'bande' ? [300 / n, 90] : [60, 50];
      const [L, H] = [l * colonnes, h * lignes];
      const rectangle = (x, y, w, z) => [[x, y], [x + w, y], [x + w, y + z], [x, y + z]];
      html += figures.polygone(rectangle(x0, y0, L, H), 'fig-plein');
      couleur.forEach(i => {
        html += figures.polygone(rectangle(x0 + (i % colonnes) * l, y0 + Math.floor(i / colonnes) * h, l, h), 'fig-barre');
      });
      for (let c = 1; c < colonnes; c++) html += figures.segment([x0 + c * l, y0], [x0 + c * l, y0 + H]);
      for (let r = 1; r < lignes; r++) html += figures.segment([x0, y0 + r * h], [x0 + L, y0 + r * h]);
      html += figures.polygone(rectangle(x0, y0, L, H), 'fig-trait');
      [largeur, hauteur] = [L + 40, H + 40];
    }
    return figures.svg(largeur, hauteur, html, 'Une figure partagée en parts égales');
  }

  // Une figure au hasard, avec k parts coloriées sur n
  function figureAuHasard() {
    const forme = parmi(['disque', 'bande', 'grille']);
    let n;
    let colonnes;
    if (forme === 'disque') n = parmi([3, 4, 5, 6, 8]);
    if (forme === 'bande') n = entier(3, 10);
    if (forme === 'grille') [n, colonnes] = parmi([[6, 3], [8, 4], [9, 3], [10, 5], [12, 4], [12, 6]]);
    const k = entier(1, n - 1);
    // Des parts qui se suivent (souvent), ou éparpillées
    const coloriees = Math.random() < 0.5 ? Array.from({ length: k }, (_, i) => i) : RM.melanger(Array.from({ length: n }, (_, i) => i)).slice(0, k);
    return { n, k, figure: figurePartagee(forme, n, coloriees, colonnes || n) };
  }

  // Une fraction k/d « simple » (k et d sans diviseur commun)
  function fractionSimple(dMax = 9, plusGrandeQueUn = false) {
    const d = entier(2, dMax);
    let k;
    do { k = plusGrandeQueUn ? entier(d + 1, 2 * d - 1) : entier(1, d - 1); } while (pgcd(k, d) !== 1);
    return [k, d];
  }

  // « les 3/4 de » ou « 1/4 de »
  const lesFraction = (k, d) => (k === 1 ? frac(1, d) : `les ${frac(k, d)}`);

  ajouterEtape({
    id: '6e-nombres-fractions',
    banque: ['figure', 'figure', 'quantite', 'quantite', 'egales', 'egales', 'compareUn', 'droite', 'quotient', 'quotient', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'figure') {
        const { n, k, figure } = figureAuHasard();
        const [a, b] = simplifier(k, n);
        const commun = {
          consigne: 'Observe la figure',
          enonce: `${figure}Quelle fraction de la figure est coloriée en orange ?`,
          explication: `La figure est partagée en <b>${n}</b> parts égales (le dénominateur), et <b>${k}</b> `
            + `${k > 1 ? 'sont coloriées' : 'est coloriée'} (le numérateur) : ${frac(k, n)}.${b !== n ? ` C’est aussi ${frac(a, b)}.` : ''}`,
        };
        if (Math.random() < 0.4) return fraction({ ...commun, n: k, d: n, irreductible: false });
        return choix({
          ...commun,
          reponse: fracTexte(k, n),
          pieges: piegesFractions(k, n, [[n - k, n], [k, n - k], [n, k], [k, n + 1]]),
        });
      }
      if (sorte === 'quantite') {
        const [k, d] = fractionSimple(parmi([4, 5, 6, 8, 10]));
        const [p1, p2] = deuxEnfants();
        // Chaque situation a ses nombres réalistes (un livre de 40 à 120 pages, une classe de 20 à 30 élèves…)
        const situations = [
          { min: 12, max: 60, texte: Q => `${p1.nom} a ${Q} billes. ${p1.Il} donne ${lesFraction(k, d)} de ses billes à ${p2.nom}. `
            + `Combien de billes donne-t-${p1.il} ?`, unite: 'billes' },
          { min: 40, max: 120, texte: Q => `Le livre ${p1.de} a ${Q} pages. ${p1.Il} en a lu ${lesFraction(k, d)}. Combien de pages a-t-${p1.il} lues ?`,
            unite: 'pages' },
          { min: 20, max: 30, texte: Q => `Dans la classe ${p1.de}, il y a ${Q} élèves. À la cantine, il y a ${lesFraction(k, d)} des élèves `
            + 'de la classe. Combien d’élèves de la classe mangent à la cantine ?', unite: 'élèves' },
          { min: 10, max: 60, texte: Q => `Mamie a cueilli ${Q} fraises. Elle en met ${lesFraction(k, d)} dans une tarte. `
            + 'Combien de fraises met-elle dans la tarte ?', unite: 'fraises' },
          { min: 6, max: 120, texte: Q => `Calcule ${lesFraction(k, d)} de ${Q}.`, unite: '' },
        ];
        if (60 % d === 0) situations.push({ min: 60, max: 60, texte: () => `Combien de minutes y a-t-il dans ${lesFraction(k, d)} d’une heure ?`, unite: 'min' });
        const situation = parmi(situations);
        const possibles = [];
        for (let q = d * Math.max(2, Math.ceil(situation.min / d)); q <= situation.max; q += d) possibles.push(q);
        const Q = parmi(possibles);
        const m = Q / d;
        const reponse = m * k;
        const contexte = { enonce: situation.texte(Q), unite: situation.unite };
        const explication = `${Q} ÷ ${d} = ${m} : c’est ${frac(1, d)} de ${Q}.`
          + (k > 1 ? `<br>Puis ${m} × ${k} = <b>${reponse}</b> : ce sont les ${frac(k, d)} de ${Q}.` : `<br>La réponse est <b>${reponse}</b>.`);
        if (Math.random() < 0.5) {
          return nombre({ consigne: 'Une fraction d’une quantité', enonce: contexte.enonce, reponse, unite: contexte.unite, explication });
        }
        return choix({
          consigne: 'Une fraction d’une quantité',
          enonce: `Combien font ${lesFraction(k, d)} de ${Q} ?`,
          reponse,
          // Une seule part, ce qui reste, oublier de diviser… et, pour 1/3, se tromper de fraction (la moitié, le quart)
          pieges: classiquesEtAutres(reponse, [k > 1 ? m : null, Q - reponse], [Q * k, Q % k === 0 ? Q / k : 0, reponse + m,
            Q % (d + 1) === 0 ? Q / (d + 1) : 0, d > 2 && Q % (d - 1) === 0 ? Q / (d - 1) : 0, Q, m % 2 === 0 ? m / 2 : 0,
            reponse + 1, reponse - 1, reponse + 2]),
          explication,
        });
      }
      if (sorte === 'egales') {
        const [a, b] = Math.random() < 0.3 ? fractionSimple(6, true) : fractionSimple(9);
        const f = entier(2, 5);
        const simplifie = Math.random() < 0.4;
        const [depart, arrivee] = simplifie ? [[a * f, b * f], [a, b]] : [[a, b], [a * f, b * f]];
        const regle = simplifie
          ? `On divise le numérateur <b>et</b> le dénominateur par ${f} : ${frac(a * f, b * f)} = ${frac(a, b)}.`
          : `On multiplie le numérateur <b>et</b> le dénominateur par ${f} : ${frac(a, b)} = ${frac(a * f, b * f)}.`;
        if (Math.random() < 0.5) {
          // Le nombre qui manque : 2/3 = ___/12
          const trouEnHaut = Math.random() < 0.6;
          // Le passage qu'on connaît (les dénominateurs si le trou est en haut, les numérateurs sinon)
          const [de, vers] = trouEnHaut ? [depart[1], arrivee[1]] : [depart[0], arrivee[0]];
          return nombre({
            consigne: 'Complète les fractions égales',
            enonce: `${frac(...depart)} = ${trouEnHaut ? frac('___', arrivee[1]) : frac(arrivee[0], '___')}`,
            reponse: trouEnHaut ? arrivee[0] : arrivee[1],
            explication: `${simplifie ? `${de} ÷ ${f} = ${vers}` : `${de} × ${f} = ${vers}`} : `
              + `${simplifie ? 'on divise' : 'on multiplie'} le numérateur et le dénominateur par <b>${f}</b>.<br>`
              + `${frac(...depart)} = <b>${frac(...arrivee)}</b>`,
          });
        }
        const [p, q] = depart;
        const pieges = simplifie
          ? [[a, q], [p, b], [p - (p - a), q - (p - a)], [b, a]] // 6/8 → 3/5 : on a enlevé 3 en haut et en bas
          : [[a + f, b + f], [a * f, b], [a, b * f], [b * f, a * f]]; // 2/3 → 4/5 : on a ajouté 2 en haut et en bas
        return choix({
          consigne: 'Des fractions égales',
          enonce: `Quelle fraction est égale à ${frac(p, q)} ?`,
          reponse: fracTexte(...arrivee),
          pieges: piegesFractions(arrivee[0], arrivee[1], pieges),
          explication: `${regle}<br>⚠️ Ajouter ou enlever le même nombre en haut et en bas ne donne pas une fraction égale.`,
        });
      }
      if (sorte === 'compareUn') {
        if (Math.random() < 0.6) {
          const d = entier(2, 12);
          const n = Math.random() < 0.15 ? d : entierSauf(1, 2 * d, [d]);
          const s = n < d ? '<' : n > d ? '>' : '=';
          return choix({
            consigne: 'Compare à 1',
            enonce: `${frac(n, d)} ___ 1`,
            reponse: s,
            choix: ['<', '=', '>'],
            explication: `${frac(d, d)} = 1 (toutes les parts de l’unité). `
              + (n === d ? `Donc <b>${frac(n, d)} = 1</b>.`
                : `${n} ${n < d ? '&lt;' : '&gt;'} ${d} : on prend ${n < d ? 'moins' : 'plus'} de parts qu’il n’en faut pour faire 1, `
                  + `donc <b>${frac(n, d)} ${n < d ? '&lt;' : '&gt;'} 1</b>.`),
          });
        }
        const plusGrande = Math.random() < 0.5;
        const bonne = fractionSimple(9, plusGrande);
        const autres = [];
        const d1 = entier(5, 12);
        autres.push([d1, d1]); // égale à 1 : ni plus grande, ni plus petite
        while (autres.length < 3) {
          const f = fractionSimple(12, !plusGrande);
          if (!autres.some(([x, y]) => x === f[0] && y === f[1])) autres.push(f);
        }
        return choix({
          consigne: 'Compare à 1',
          enonce: `Laquelle de ces fractions est plus ${plusGrande ? 'grande' : 'petite'} que 1 ?`,
          reponse: fracTexte(...bonne),
          pieges: autres.map(f => fracTexte(...f)),
          explication: `Une fraction est plus ${plusGrande ? 'grande' : 'petite'} que 1 quand son numérateur est plus `
            + `${plusGrande ? 'grand' : 'petit'} que son dénominateur (et égale à 1 quand ils sont égaux). `
            + `<b>${frac(...bonne)} ${plusGrande ? '&gt;' : '&lt;'} 1</b> car ${bonne[0]} ${plusGrande ? '&gt;' : '&lt;'} ${bonne[1]}.`,
        });
      }
      if (sorte === 'droite') {
        const d = parmi([2, 3, 4, 5, 6, 8]);
        const fin = d >= 6 ? 2 : parmi([2, 3]);
        let k;
        do { k = entier(1, fin * d - 1); } while (k % d === 0);
        const figure = figures.droiteGraduee({
          debut: 0, fin, pas: 1, sousGraduations: d, etiquettes: Array.from({ length: fin + 1 }, (_, i) => i), points: [{ valeur: k / d, nom: 'A' }],
        });
        const commun = {
          consigne: 'Repère une fraction',
          enonce: `${figure}Quelle est l’abscisse du point A ? Écris-la avec une fraction.`,
          explication: `L’unité est partagée en <b>${d}</b> parts égales : chaque petite graduation vaut ${frac(1, d)}.<br>`
            + `A est à <b>${k === 1 ? 'une petite graduation' : `${k} petites graduations`}</b> de 0 : `
            + `son abscisse est ${frac(k, d)}${k > d ? ' (plus grand que 1)' : ''}.`,
        };
        if (Math.random() < 0.5) return fraction({ ...commun, n: k, d, irreductible: false });
        return choix({
          ...commun,
          reponse: fracTexte(k, d),
          pieges: piegesFractions(k, d, [[k, d + 1], [k + 1, d], [k - 1, d], [d, k], [k, d - 1]]),
        });
      }
      if (sorte === 'quotient') {
        const facon = parmi(['facteur', 'facteur', 'decimal', 'ecrire']);
        if (facon === 'decimal') {
          // 3/4 = 0,75 : la fraction, c'est aussi une division
          // Des dénominateurs dont la division tombe juste : 2, 4, 5, 8, 10, 20, 25 (des numérateurs pas trop grands)
          const d = parmi([2, 4, 4, 5, 8, 10, 20, 25]);
          const maxi = { 2: 7, 4: 11, 5: 14, 8: 7, 10: 29, 20: 19, 25: 24 }[d];
          let n;
          do { n = entier(1, maxi); } while (n % d === 0);
          const x = net(n / d);
          return choix({
            consigne: 'Quel nombre décimal est égal à cette fraction ?',
            enonce: `${frac(n, d)} = ___`,
            reponse: x,
            // 3/4 → 3,4 ou 4,3 ou 0,34 : la barre de fraction prise pour une virgule
            pieges: classiquesEtAutres(x, RM.melanger([Number(`${n}.${d}`), Number(`${d}.${n}`), Number(`0.${n}${d}`)]), [x * 10, x / 10, x * 100, x / 100]),
            // (pour 20 et 25, on passe par les centièmes : 13/25 = 52/100 = 0,52)
            explication: `${frac(n, d)} = ${d === 20 || d === 25 ? frac(n * 100 / d, 100) : `${n} ÷ ${d}`} = <b>${ecrire(x)}</b> `
              + `(vérifie : ${ecrire(x)} × ${d} = ${n}).<br>⚠️ La barre de fraction n’est pas une virgule !`,
          });
        }
        // 3 × ___ = 7 : c'est 7/3 (le quotient de 7 par 3)
        const d = parmi([3, 6, 7, 9]);
        let n;
        do { n = entier(2, 5 * d); } while (pgcd(n, d) !== 1);
        const explication = `${frac(n, d)} est le nombre qui, multiplié par ${d}, donne ${n} : <b>${d} × ${frac(n, d)} = ${n}</b>.<br>`
          + `C’est le <b>quotient</b> de ${n} par ${d} : ${frac(n, d)} = ${n} ÷ ${d}.`;
        if (facon === 'ecrire') {
          return fraction({
            consigne: 'Complète avec une fraction',
            enonce: `${d} × ___ = ${n}`,
            n,
            d,
            irreductible: false,
            explication,
          });
        }
        const pieges = [fracTexte(d, n), n * d, Math.floor(n / d) + (n % d) / 10];
        if (n > d) pieges.push(n - d);
        return choix({
          consigne: 'Quel nombre manque ?',
          enonce: `${d} × ___ = ${n}`,
          reponse: fracTexte(n, d),
          pieges: pieges.filter(p => p !== 0 && p !== '0').map(p => (typeof p === 'number' ? ecrire(p) : p)),
          explication,
        });
      }
      // Vrai ou faux
      const vrai = Math.random() < 0.5;
      const genre = parmi(['egales', 'compareUn', 'quotient', 'quantite']);
      if (genre === 'egales') {
        const [a, b] = fractionSimple(9);
        const f = entier(2, 4);
        return vraiFaux({
          enonce: `${frac(a, b)} = ${vrai ? frac(a * f, b * f) : frac(a + f, b + f)}`,
          vrai,
          explication: vrai
            ? `On a multiplié le numérateur et le dénominateur par ${f} : <b>${frac(a, b)} = ${frac(a * f, b * f)}</b>.`
            : `Ajouter ${f} en haut et en bas ne donne pas une fraction égale. En multipliant par ${f} : ${frac(a, b)} = <b>${frac(a * f, b * f)}</b>.`,
        });
      }
      if (genre === 'compareUn') {
        const plusGrande = Math.random() < 0.5;
        const [n, d] = fractionSimple(9, plusGrande);
        const dit = vrai === plusGrande ? '&gt;' : '&lt;';
        return vraiFaux({
          enonce: `${frac(n, d)} ${dit} 1`,
          vrai,
          explication: `${n} ${plusGrande ? '&gt;' : '&lt;'} ${d} : le numérateur est plus ${plusGrande ? 'grand' : 'petit'} que le dénominateur, `
            + `donc <b>${frac(n, d)} ${plusGrande ? '&gt;' : '&lt;'} 1</b>.`,
        });
      }
      if (genre === 'quotient') {
        const d = parmi([3, 6, 7, 9]);
        let n;
        do { n = entier(2, 5 * d); } while (pgcd(n, d) !== 1);
        return vraiFaux({
          enonce: `${d} × ${vrai ? frac(n, d) : frac(d, n)} = ${n}`,
          vrai,
          explication: `${frac(n, d)} est le nombre qui, multiplié par ${d}, donne ${n} : <b>${d} × ${frac(n, d)} = ${n}</b>.`
            + (vrai ? '' : `<br>Avec ${frac(d, n)}, on a inversé le numérateur et le dénominateur.`),
        });
      }
      const [k, d] = fractionSimple(6);
      const Q = d * entier(2, 10);
      const m = Q / d;
      // Le piège : une seule part (pour 3/4), ou le reste (pour 1/4 : les 3/4 qui restent)
      const faux = k > 1 ? m : (d > 2 ? Q - m : m + 1);
      return vraiFaux({
        enonce: `${k === 1 ? frac(1, d) : `Les ${frac(k, d)}`} de ${Q}, c’est ${vrai ? m * k : faux}.`,
        vrai,
        explication: `${Q} ÷ ${d} = ${m}${k > 1 ? `, puis ${m} × ${k} = ${m * k}` : ''} : `
          + `${k === 1 ? frac(1, d) : `les ${frac(k, d)}`} de ${Q}, c’est <b>${m * k}</b>.`,
      });
    },
    titreLecon: 'Les fractions',
    lecon: `
      <h4>La fraction d’une figure</h4>
      ${figurePartagee('disque', 4, [0, 1, 2])}
      <p>La tarte est partagée en <b>4</b> parts égales (le <b>dénominateur</b>) et on en prend <b>3</b> (le <b>numérateur</b>) :
        c’est ${frac(3, 4)}, trois quarts.</p>
      <h4>La fraction d’une quantité</h4>
      <p>👉 Les ${frac(3, 4)} de 20 : 20 ÷ 4 = 5 (un quart), puis 5 × 3 = <b>15</b>.</p>
      <h4>Des fractions égales</h4>
      <p>On multiplie (ou on divise) le numérateur <b>et</b> le dénominateur par le <b>même nombre</b> :
        ${frac(1, 2)} = ${frac(2, 4)} = ${frac(4, 8)}.</p>
      <p>⚠️ Ajouter le même nombre en haut et en bas ne marche pas : ${frac(1, 2)} ≠ ${frac(2, 3)}.</p>
      <h4>Plus grande ou plus petite que 1 ?</h4>
      <p>${frac(3, 5)} &lt; 1 · ${frac(5, 5)} = 1 · ${frac(7, 5)} &gt; 1 : on compare le numérateur et le dénominateur.
        Sur une droite graduée, ${frac(7, 5)} est après 1.</p>
      <h4>⭐ Nouveau en 6e : la fraction, un quotient</h4>
      <p>${frac(7, 3)} est le nombre qui, multiplié par 3, donne 7 : <b>3 × ${frac(7, 3)} = 7</b>. C’est le quotient 7 ÷ 3.
        De même, ${frac(3, 4)} = 3 ÷ 4 = 0,75.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> sur une droite graduée, compte en combien de parts l’unité est partagée :
        c’est le dénominateur !</div>
    `,
  });
})();
