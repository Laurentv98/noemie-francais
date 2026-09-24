// Renard Malin — Maths, niveau 4e : les 6 étapes de la Grotte des Nombres
//
// Les questions sont fabriquées au hasard : on tire des nombres, le moteur calcule la bonne réponse,
// et Roxy explique le calcul. Le moteur est dans js/moteur-maths.js.
// Les étapes : 1. multiplier des relatifs · 2. multiplier et diviser des fractions · 3. les puissances ·
// 4. la notation scientifique · 5. développer et réduire · 6. les équations

(function () {
  const {
    entier, parmi, decimal, decimalesDe, ecrire, net, lireNombre, egaux, parentheses, MOINS, ESPACE, mesure, euros,
    frac, fracTexte, simplifier, pgcd, ppcm, puissance, puissanceTexte, choix, nombre, fraction, vraiFaux, ajouterEtape,
  } = RM.maths;

  // ======================================================================
  // Des petites aides, pour toutes les étapes
  // ======================================================================
  // Les enfants des problèmes, avec leur pronom
  const ENFANTS = [['Léa', 'elle'], ['Tom', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Inès', 'elle'], ['Sami', 'il'], ['Lina', 'elle'], ['Noé', 'il']];
  const unEnfant = () => {
    const [nom, il] = parmi(ENFANTS);
    return { nom, il, Il: il === 'il' ? 'Il' : 'Elle' };
  };

  // Les touches sous la case : la virgule et le signe moins (pour toute une étape, jamais selon la réponse)
  const TOUCHES = [',', '−'];

  // Un nombre, avec des parenthèses s'il est négatif : P(−3) → « (−3) »
  const P = parentheses;
  // Une somme écrite simplement : plusSimple(−3, −20) → « −3 − 20 » ; plusSimple(5, 12) → « 5 + 12 »
  const plusSimple = (a, b) => `${ecrire(a)} ${b < 0 ? MOINS : '+'} ${ecrire(Math.abs(b))}`;
  // « 1 facteur négatif », « 3 facteurs négatifs » ; « 1 nombre négatif », « 2 nombres négatifs »
  const facteursNegatifs = k => `${k} facteur${k > 1 ? 's' : ''} négatif${k > 1 ? 's' : ''}`;
  const nombresNegatifs = k => `${k} nombre${k > 1 ? 's' : ''} négatif${k > 1 ? 's' : ''}`;

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

  // Les pièges d'une question à boutons : l'erreur classique dont parle l'explication est toujours proposée
  // (garder : le moteur place la bonne réponse autour d'elle), puis d'autres vraies erreurs
  function avecPieges(reponse, classique, autres) {
    const garder = vraisPieges(reponse, [classique]);
    return { garder, pieges: vraisPieges(reponse, autres, garder) };
  }

  // L'erreur classique quand on ajoute deux relatifs de signes contraires : ajouter leurs distances à zéro
  // (−8 + 3 → −11) ; null s'ils sont de même signe (ce ne serait pas une erreur)
  const sommeFausse = (a, b) => ((a < 0) !== (b < 0) ? Math.sign(a) * (Math.abs(a) + Math.abs(b)) : null);

  // ======================================================================
  // 1. Multiplier des relatifs : la règle des signes
  // ======================================================================
  // Deux facteurs, dont au moins un négatif : les tables (de 2 à 12), parfois un décimal simple (2,5 × 4)
  function deuxRelatifs() {
    const [x, y] = Math.random() < 0.8 ? [entier(2, 9), entier(2, 12)] : [parmi([0.5, 1.5, 2.5]), parmi([4, 6, 8])];
    const [sx, sy] = parmi([[-1, 1], [1, -1], [-1, -1]]);
    return Math.random() < 0.5 ? [sx * x, sy * y] : [sy * y, sx * x];
  }

  // La règle des signes pour deux nombres
  const regleDesSignes = (a, b, resultat = 'le produit') => ((a < 0) === (b < 0)
    ? `Deux nombres de <b>même signe</b> : ${resultat} est <b>positif</b>.`
    : `Deux nombres de <b>signes contraires</b> : ${resultat} est <b>négatif</b>.`);

  function expliquerProduit(a, b) {
    const p = net(a * b);
    return `${regleDesSignes(a, b)}<br>${ecrire(Math.abs(a))} × ${ecrire(Math.abs(b))} = ${ecrire(Math.abs(p))}, `
      + `donc ${P(a)} × ${P(b)} = <b>${ecrire(p)}</b>.`;
  }

  // Un calcul avec des priorités : { texte, valeur, explication, ordre (l'erreur « de gauche à droite », ou null),
  // ordreTexte (ce calcul-là), autres (d'autres vraies erreurs) }
  // « Puis a + (−20) = a − 20 » : l'étape du milieu n'est écrite que s'il y a une parenthèse à enlever
  const puis = (a, op, x, terme) => `Puis ${ecrire(a)} ${op} ${P(x)} = ${x < 0 ? `${plusSimple(a, terme)} = ` : ''}`;
  function calculAvecPriorites() {
    const signe = () => parmi([-1, 1]);
    return parmi([
      () => {
        // a + b × c ou a − b × c
        let [b, c] = [signe() * entier(2, 9), signe() * entier(2, 9)];
        if (b > 0 && c > 0) c = -c;
        const a = signe() * entier(2, 15);
        const plus = Math.random() < 0.5;
        const op = plus ? '+' : MOINS;
        const bc = b * c;
        const terme = plus ? bc : -bc;
        const valeur = a + terme;
        const ordre = (plus ? a + b : a - b) * c;
        return {
          texte: `${ecrire(a)} ${op} ${P(b)} × ${P(c)}`,
          valeur,
          ordre,
          ordreTexte: `(${ecrire(a)} ${op} ${P(b)}) × ${P(c)}`,
          explication: `On calcule d’abord le produit : ${P(b)} × ${P(c)} = ${ecrire(bc)}.<br>`
            + `${puis(a, op, bc, terme)}<b>${ecrire(valeur)}</b>.`,
          // Le signe du produit, les distances à zéro ajoutées (5 − 12 → 17 ; −8 + 3 → −11), + au lieu de ×
          autres: [a - terme, sommeFausse(a, terme), a + (plus ? b + c : -(b + c)), -ordre],
        };
      },
      () => {
        // a × b − c × d ou a × b + c × d
        const [a, c] = [signe() * entier(2, 9), entier(2, 9)];
        const [b, d] = [signe() * entier(2, 9), -entier(2, 9)];
        const plus = Math.random() < 0.4;
        const op = plus ? '+' : MOINS;
        const [ab, cd] = [a * b, c * d];
        const terme = plus ? cd : -cd;
        const valeur = ab + terme;
        return {
          texte: `${ecrire(a)} × ${P(b)} ${op} ${c} × ${P(d)}`,
          valeur,
          ordre: (plus ? ab + c : ab - c) * d,
          ordreTexte: `(${ecrire(ab)} ${op} ${c}) × ${P(d)}`,
          explication: `On calcule d’abord les deux produits : ${ecrire(a)} × ${P(b)} = ${ecrire(ab)} et ${c} × ${P(d)} = ${ecrire(cd)}.<br>`
            + `${puis(ab, op, cd, terme)}<b>${ecrire(valeur)}</b>.`,
          // Le signe d'un des deux produits, les distances à zéro ajoutées
          autres: [ab - terme, -ab + terme, sommeFausse(ab, terme)],
        };
      },
      () => {
        // a − b ÷ c ou a + b ÷ c (la division tombe juste ; toujours au moins un nombre négatif).
        // On choisit des nombres pour lesquels l'erreur de priorité (a ± b) ÷ c tombe juste aussi : c'est elle qu'on veut tester.
        let a;
        let b;
        let c;
        let q;
        let plus;
        let somme;
        do {
          [c, q, a] = [signe() * entier(2, 6), signe() * entier(2, 9), signe() * entier(2, 15)];
          if (a > 0 && c > 0 && q > 0) c = -c;
          b = c * q;
          plus = Math.random() < 0.5;
          somme = plus ? a + b : a - b;
        } while (somme % c !== 0);
        const op = plus ? '+' : MOINS;
        const terme = plus ? q : -q;
        const valeur = a + terme;
        const ordre = somme / c;
        return {
          texte: `${ecrire(a)} ${op} ${P(b)} ÷ ${P(c)}`,
          valeur,
          ordre,
          ordreTexte: `(${ecrire(a)} ${op} ${P(b)}) ÷ ${P(c)}`,
          explication: `On calcule d’abord le quotient : ${P(b)} ÷ ${P(c)} = ${ecrire(q)}.<br>`
            + `${puis(a, op, q, terme)}<b>${ecrire(valeur)}</b>.`,
          autres: [a - terme, sommeFausse(a, terme), -ordre, -valeur],
        };
      },
    ])();
  }

  // Un produit (ou un quotient) pour les boutons, avec k nombres négatifs : { texte : « (−3) × 8 », cle }
  // (cle : les mêmes nombres dans un autre ordre ont la même clé, pour ne pas proposer deux fois le même calcul)
  function operationDeSigne(nombreDeNegatifs, facteurs) {
    const signes = RM.melanger([...Array(nombreDeNegatifs).fill(-1), ...Array(facteurs - nombreDeNegatifs).fill(1)]);
    if (facteurs === 2 && Math.random() < 0.3) {
      const d = entier(2, 9);
      const D = signes[0] * d * entier(2, 9);
      return { texte: `${P(D)} ÷ ${P(signes[1] * d)}`, cle: `${D}÷${signes[1] * d}` };
    }
    const nombres = signes.map(s => s * entier(2, 9));
    return { texte: nombres.map(P).join(' × '), cle: [...nombres].sort((x, y) => x - y).join('×') };
  }

  ajouterEtape({
    id: '4e-nombres-relatifs-multiplication',
    banque: ['produit', 'produit', 'produit', 'quotient', 'quotient', 'signe', 'plusieurs', 'priorites', 'priorites',
      'lequel', 'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'produit') {
        const [a, b] = deuxRelatifs();
        const p = net(a * b);
        const facon = parmi(['calcul', 'choix', 'choix', 'trou']);
        if (facon === 'trou' && Number.isInteger(a) && Number.isInteger(b)) {
          return nombre({
            consigne: 'Quel nombre manque ?',
            enonce: `${P(a)} × ___ = ${ecrire(p)}`,
            reponse: b,
            touches: TOUCHES,
            solution: `${P(a)} × <b>${P(b)}</b> = ${ecrire(p)}`,
            explication: `${ecrire(Math.abs(a))} × ${ecrire(Math.abs(b))} = ${ecrire(Math.abs(p))}. Le résultat est ${p > 0 ? 'positif' : 'négatif'} : `
              + `les deux facteurs sont ${p > 0 ? 'de même signe' : 'de signes contraires'}. ${ecrire(a)} est ${a > 0 ? 'positif' : 'négatif'}, `
              + `donc le nombre qui manque est ${b > 0 ? 'positif' : 'négatif'}.<br>${P(a)} × <b>${P(b)}</b> = ${ecrire(p)}`,
          });
        }
        const commun = { enonce: `${P(a)} × ${P(b)} = ___`, reponse: p, explication: expliquerProduit(a, b) };
        if (facon === 'choix') {
          const [ua, ub] = [Math.abs(a), Math.abs(b)];
          return choix({
            ...commun,
            consigne: 'Choisis le bon résultat',
            // Le signe oublié (toujours proposé), et des erreurs de table (7 × 9 au lieu de 7 × 8)
            ...avecPieges(p, -p, [p + ua, p - ua, p + ub, p - ub]),
          });
        }
        return nombre({ ...commun, consigne: 'Calcule', touches: TOUCHES });
      }
      if (sorte === 'quotient') {
        const q = parmi([-1, 1]) * entier(2, 12);
        let d = parmi([-1, 1]) * entier(2, 9);
        if (q > 0 && d > 0) d = -d;
        const D = q * d;
        // Parfois écrit avec une barre de fraction : −56 sur −8
        const texte = Math.random() < 0.3 ? frac(ecrire(D), ecrire(d)) : `${P(D)} ÷ ${P(d)}`;
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${texte} = ___`,
          reponse: q,
          // Le signe oublié (toujours proposé), et des erreurs de table (56 ÷ 8 = 6 ou 8), avec ou sans le signe
          ...avecPieges(q, -q, [q + 1, q - 1, -(q + 1), -(q - 1)].filter(x => x !== 0)),
          explication: `${regleDesSignes(D, d, 'le quotient')}<br>${ecrire(Math.abs(D))} ÷ ${Math.abs(d)} = ${Math.abs(q)}, `
            + `donc ${texte} = <b>${ecrire(q)}</b>.`,
        });
      }
      if (sorte === 'signe') {
        const n = entier(4, 5);
        const negatif = Math.random() < 0.5;
        let k;
        do { k = entier(1, n); } while ((k % 2 === 1) !== negatif);
        const facteurs = RM.melanger([...Array(k).fill(-1), ...Array(n - k).fill(1)]).map(s => (s < 0 ? -entier(1, 9) : entier(2, 9)));
        return choix({
          consigne: 'La règle des signes (sans calculer)',
          enonce: `Le produit ${facteurs.map(P).join(' × ')} est ___.`,
          reponse: negatif ? 'négatif' : 'positif',
          choix: ['positif', 'négatif'],
          explication: `On compte les facteurs négatifs : il y en a <b>${k}</b>, un nombre ${k % 2 ? 'impair' : 'pair'}. `
            + `Le produit est donc <b>${negatif ? 'négatif' : 'positif'}</b>.<br>(Pas besoin de calculer : seul le nombre de signes − compte.)`,
        });
      }
      if (sorte === 'plusieurs') {
        const valeurs = parmi([
          () => [2, 5, entier(2, 9)],
          () => [entier(2, 6), entier(2, 6), entier(2, 4)],
          () => [1, entier(2, 9), entier(2, 9)],
          () => [2, entier(2, 3), entier(2, 5), 5],
        ])();
        const n0 = entier(1, valeurs.length);
        const signes = RM.melanger([...Array(n0).fill(-1), ...Array(valeurs.length - n0).fill(1)]);
        // (un facteur 1 est toujours écrit (−1) : « × 1 », ce serait trop facile)
        const facteurs = RM.melanger(valeurs).map((v, i) => (v === 1 ? -1 : v * signes[i]));
        const k = facteurs.filter(f => f < 0).length;
        const p = facteurs.reduce((x, y) => x * y, 1);
        const texte = facteurs.map(P).join(' × ');
        return nombre({
          consigne: 'Calcule',
          enonce: `${texte} = ___`,
          reponse: p,
          touches: TOUCHES,
          explication: `Il y a ${facteursNegatifs(k)} : un nombre ${k % 2 ? 'impair' : 'pair'}, donc le produit est <b>${p < 0 ? 'négatif' : 'positif'}</b>.<br>`
            + `${facteurs.map(f => Math.abs(f)).join(' × ')} = ${ecrire(Math.abs(p))}, donc ${texte} = <b>${ecrire(p)}</b>.`,
        });
      }
      if (sorte === 'priorites') {
        const c = calculAvecPriorites();
        return choix({
          consigne: 'Calcule (attention aux priorités)',
          enonce: `${c.texte} = ___`,
          reponse: c.valeur,
          // L'erreur de priorité (calculer de gauche à droite) est toujours proposée quand elle tombe juste
          ...avecPieges(c.valeur, c.ordre ?? c.autres[0], c.autres),
          explication: `${c.explication}<br>⚠️ × et ÷ passent avant + et −`
            + `${c.ordre === null ? '.' : ` : ce n’est pas ${c.ordreTexte} = ${ecrire(c.ordre)}.`}`,
        });
      }
      if (sorte === 'lequel') {
        const negatif = Math.random() < 0.5;
        // Le bon : un nombre impair de nombres négatifs (pour un résultat négatif), sinon un nombre pair
        // (toujours au moins un nombre négatif : « 3 × 7 », ce serait trop facile)
        const nombreDeFacteurs = () => (Math.random() < 0.75 ? 2 : 3);
        const deParite = (impair, n) => parmi(Array.from({ length: n }, (_, i) => i + 1).filter(i => (i % 2 === 1) === impair));
        let n = nombreDeFacteurs();
        const bonne = operationDeSigne(deParite(negatif, n), n);
        const bon = bonne.texte;
        // (pas deux fois le même calcul écrit dans un autre ordre : (−3) × (−7) et (−7) × (−3))
        const cles = new Set([bonne.cle]);
        const autres = [];
        while (autres.length < 3) {
          n = nombreDeFacteurs();
          const t = operationDeSigne(deParite(!negatif, n), n);
          if (!cles.has(t.cle)) { cles.add(t.cle); autres.push(t.texte); }
        }
        return choix({
          consigne: 'La règle des signes',
          enonce: `Lequel de ces calculs a un résultat ${negatif ? 'négatif' : 'positif'} ?`,
          reponse: bon,
          pieges: autres,
          explication: `Dans <b>${bon}</b>, il y a ${nombresNegatifs((bon.match(/−/g) || []).length)} : `
            + `un nombre ${negatif ? 'impair' : 'pair'}, donc le résultat est <b>${negatif ? 'négatif' : 'positif'}</b>.<br>`
            + `Les autres ont un nombre ${negatif ? 'pair' : 'impair'} de nombres négatifs.`,
        });
      }
      if (sorte === 'probleme') {
        const p1 = unEnfant();
        const pb = parmi([
          () => {
            let gain;
            let perte;
            let bonnes;
            let mauvaises;
            let score;
            // (pas un score de 1, 0 ou −1 : on écrirait « 1 points »)
            do {
              [gain, perte] = [parmi([2, 3, 4, 5]), parmi([1, 2, 3])];
              [bonnes, mauvaises] = [entier(2, 8), entier(2, 9)];
              score = bonnes * gain - mauvaises * perte;
            } while (Math.abs(score) <= 1);
            return {
              enonce: `Au jeu de Roxy, une bonne réponse rapporte ${gain} points et une mauvaise réponse fait perdre ${perte} point${perte > 1 ? 's' : ''}. `
                + `${p1.nom} commence à 0 et donne ${bonnes} bonnes réponses et ${mauvaises} mauvaises. Quel est son score ?`,
              reponse: score,
              unite: 'points',
              explication: `${bonnes} × ${gain} + ${mauvaises} × (${MOINS}${perte}) = ${bonnes * gain} ${MOINS} ${mauvaises * perte} = <b>${mesure(score, 'points')}</b>.`,
            };
          },
          () => {
            const [vitesse, duree] = [parmi([2, 3]), entier(4, 12)];
            return {
              enonce: `Un phoque part de la surface de l’eau (altitude 0) et descend de ${mesure(vitesse, 'm')} chaque seconde pendant ${duree} secondes. `
                + 'À quelle altitude arrive-t-il ?',
              reponse: -vitesse * duree,
              unite: 'm',
              explication: `Descendre de ${mesure(vitesse, 'm')}, c’est ${mesure(-vitesse, 'm')}. ${duree} × (${MOINS}${vitesse}) = <b>${ecrire(-vitesse * duree)}</b> : `
                + `le phoque est à l’altitude ${mesure(-vitesse * duree, 'm')} (sous la surface).`,
            };
          },
          () => {
            const [depart, heure] = [entier(1, 6), entier(17, 19)];
            const [baisse, fin] = [entier(1, 3), entier(22, 23)];
            const heures = fin - heure;
            const t = depart - baisse * heures;
            return {
              enonce: `À ${mesure(heure, 'h')}, il fait ${mesure(depart, '°C')}. La température baisse de ${mesure(baisse, '°C')} par heure `
                + `jusqu’à ${mesure(fin, 'h')}. Quelle température fait-il à ${mesure(fin, 'h')} ?`,
              reponse: t,
              unite: '°C',
              explication: `De ${mesure(heure, 'h')} à ${mesure(fin, 'h')}, il y a ${heures} heures : ${heures} × (${MOINS}${baisse}) = ${mesure(-baisse * heures, '°C')}.<br>`
                + `${depart} ${MOINS} ${baisse * heures} = <b>${mesure(t, '°C')}</b>.`,
            };
          },
        ])();
        return nombre({ consigne: 'Résous le problème', enonce: pb.enonce, reponse: pb.reponse, unite: pb.unite, touches: TOUCHES, explication: pb.explication });
      }
      // Vrai ou faux : un calcul, ou une règle
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.5) {
        const [a, b] = deuxRelatifs();
        const p = net(a * b);
        const division = Number.isInteger(a) && Number.isInteger(b) && Math.random() < 0.4;
        const [texte, juste] = division ? [`${P(p)} ÷ ${P(b)}`, a] : [`${P(a)} × ${P(b)}`, p];
        return vraiFaux({
          enonce: `${texte} = ${ecrire(vrai ? juste : -juste)}`,
          vrai,
          explication: division
            ? `${regleDesSignes(p, b, 'le quotient')}<br>${ecrire(Math.abs(p))} ÷ ${Math.abs(b)} = ${Math.abs(a)}, donc ${texte} = <b>${ecrire(a)}</b>.`
            : expliquerProduit(a, b),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['Le produit de deux nombres négatifs est positif.', 'deux nombres de même signe : le produit est positif. (−2) × (−3) = 6.'],
        ['Le quotient d’un nombre négatif par un nombre positif est négatif.', 'deux nombres de signes contraires : le quotient est négatif. (−12) ÷ 4 = −3.'],
        ['Un produit de trois facteurs négatifs est négatif.', 'trois facteurs négatifs, c’est un nombre impair : (−1) × (−2) × (−3) = −6.'],
        ['Un produit de quatre facteurs négatifs est positif.', 'quatre facteurs négatifs, c’est un nombre pair : (−1) × (−2) × (−1) × (−3) = 6.'],
      ] : [
        ['Le produit de deux nombres négatifs est négatif.', 'deux nombres de même signe : le produit est positif. (−2) × (−3) = 6.'],
        ['Le quotient de deux nombres négatifs est négatif.', 'deux nombres de même signe : le quotient est positif. (−12) ÷ (−4) = 3.'],
        ['Un produit de trois facteurs négatifs est positif.', 'trois facteurs négatifs, c’est un nombre impair : (−1) × (−2) × (−3) = −6.'],
        ['Un produit de quatre facteurs négatifs est négatif.', 'quatre facteurs négatifs, c’est un nombre pair : (−1) × (−2) × (−1) × (−3) = 6.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'Multiplier des relatifs',
    lecon: `
      <h4>La règle des signes</h4>
      <p>Pour multiplier (ou diviser) deux nombres relatifs, on multiplie (ou on divise) leurs <b>distances à zéro</b>,
        puis on trouve le signe :</p>
      <table>
        <tr><th>même signe</th><td>(+) × (+) et (−) × (−)</td><td>le résultat est <b>positif</b></td></tr>
        <tr><th>signes contraires</th><td>(+) × (−) et (−) × (+)</td><td>le résultat est <b>négatif</b></td></tr>
      </table>
      <p>👉 <i>(−7) × 8 = −56</i> · <i>(−6) × (−5) = 30</i> · <i>(−56) ÷ (−8) = 7</i> · <i>45 ÷ (−9) = −5</i> ·
        ${frac('−12', '4')} = −3</p>
      <h4>Plusieurs facteurs</h4>
      <p>On compte les facteurs <b>négatifs</b> : un nombre <b>pair</b> → le produit est positif ; un nombre <b>impair</b> → il est négatif.</p>
      <p>👉 <i>(−2) × 3 × (−5) = 30</i> (2 facteurs négatifs) · <i>(−1) × (−2) × (−4) = −8</i> (3 facteurs négatifs)</p>
      <h4>Les priorités</h4>
      <p>Comme toujours, × et ÷ passent <b>avant</b> + et − : <i>−3 + 4 × (−5) = −3 + (−20) = −3 − 20 = −23</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> « même signe → positif, signes contraires → négatif ».
        Et pour un long produit, compte les signes − !</div>
      <p>⚠️ Cette règle est pour × et ÷ : <i>(−3) × (−4) = 12</i>, mais <i>(−3) + (−4) = −7</i>.</p>
    `,
  });

  // ======================================================================
  // 2. Multiplier et diviser des fractions
  // ======================================================================
  const TOUCHES_FRACTIONS = ['/', '−'];

  // Une fraction en HTML, ou un entier si le dénominateur est 1 ; fracP : avec des parenthèses si elle est négative
  const fracOuEntier = (n, d) => (d === 1 ? ecrire(n) : frac(n, d));
  const fracP = (n, d) => (n * d < 0 ? `(${fracOuEntier(n, d)})` : fracOuEntier(n, d));
  // La même chose, en texte pour les boutons : « 3/4 », « −5/2 », « 3 »
  const fracBouton = (n, d) => (d === 1 ? ecrire(n) : fracTexte(n, d));

  // Une fraction a/b plus petite que 1 (a et b sans diviseur commun), b de 2 à dMax
  function fractionPropre(dMax = 9) {
    const b = entier(2, dMax);
    let a;
    do { a = entier(1, b - 1); } while (pgcd(a, b) !== 1);
    return [a, b];
  }

  // Une fraction a/b qui n'est pas un entier (parfois plus grande que 1)
  function fractionAuHasard(dMax = 9) {
    if (Math.random() < 0.7) return fractionPropre(dMax);
    let a;
    let b;
    do { [a, b] = [entier(3, 11), entier(2, Math.min(dMax, 7))]; } while (pgcd(a, b) !== 1 || a < b);
    return [a, b];
  }

  // Les pièges fractions [numérateur, dénominateur] : simplifiés, de valeurs différentes (et différentes de la réponse)
  function piegesFractions(n, d, pieges) {
    const vues = [n / d];
    return pieges
      .filter(([a, b]) => Number.isInteger(a) && Number.isInteger(b) && a !== 0 && b !== 0)
      .map(([a, b]) => simplifier(a, b))
      .filter(([a, b]) => {
        if (vues.some(v => Math.abs(v - a / b) < 1e-9)) return false;
        vues.push(a / b);
        return true;
      })
      .map(([a, b]) => fracBouton(a, b));
  }

  // Parfois un signe − : sur le premier nombre, ou sur le deuxième
  function avecUnSigne(a, c) {
    const r = Math.random();
    if (r < 0.15) return [-a, c];
    if (r < 0.3) return [a, -c];
    return [a, c];
  }

  // Multiplier a/b × c/d (b ou d peut valoir 1 : c'est un entier) : le calcul, puis le conseil « simplifier avant »
  function expliquerProduitFractions(a, b, c, d) {
    const [ua, uc] = [Math.abs(a), Math.abs(c)];
    const [n, m] = simplifier(a * c, b * d);
    const signe = a * c < 0 ? 'Signes contraires : le résultat est <b>négatif</b>.<br>' : '';
    const bas = [b, d].filter(x => x > 1).join(' × ');
    const simplifiable = pgcd(ua * uc, b * d) > 1;
    const conseils = [];
    if (pgcd(ua, d) > 1 && d > 1) conseils.push(`${ua} et ${d} par ${pgcd(ua, d)}`);
    if (pgcd(uc, b) > 1 && b > 1) conseils.push(`${uc} et ${b} par ${pgcd(uc, b)}`);
    return `${signe}On multiplie les numérateurs entre eux et les dénominateurs entre eux :<br>`
      + `${frac(`${ua} × ${uc}`, bas)} = ${simplifiable ? `${frac(ua * uc, b * d)} = ` : ''}<b>${fracOuEntier(Math.abs(n), m)}</b>`
      + `${a * c < 0 ? `, donc le résultat est <b>${fracOuEntier(n, m)}</b>` : ''}.`
      + (conseils.length ? `<br>💡 Plus rapide : on simplifie avant de multiplier (${conseils.join(' ; ')}).` : '');
  }

  // Deux fractions à multiplier (souvent, on peut simplifier avant), ou un entier et une fraction
  function produitDeFractions() {
    for (;;) {
      let [a, b] = fractionAuHasard();
      let [c, d] = fractionAuHasard();
      if (Math.random() < 0.25) [a, b] = [entier(2, 9), 1];
      if (a === c && b === d) continue;
      const croix = pgcd(a, d) > 1 || pgcd(c, b) > 1;
      if (!croix && Math.random() < 0.7) continue;
      const [n, m] = simplifier(a * c, b * d);
      if (m === 1 || m > 40 || n > 40) continue;
      [a, c] = avecUnSigne(a, c);
      if (Math.random() < 0.5 && b === 1) [a, b, c, d] = [c, d, a, b];
      return { a, b, c, d, n: n * Math.sign(a * c), m, texte: `${fracOuEntier(a, b)} × ${fracP(c, d)}` };
    }
  }

  // Une division : a/b ÷ c/d, a/b ÷ k ou k ÷ c/d (le quotient n'est pas un entier)
  function divisionDeFractions() {
    for (;;) {
      const facon = parmi(['ff', 'ff', 'ff', 'fk', 'kf']);
      let [a, b] = facon === 'kf' ? [entier(2, 9), 1] : fractionAuHasard();
      let [c, d] = facon === 'fk' ? [entier(2, 6), 1] : fractionAuHasard();
      if (a === c && b === d) continue;
      const [n, m] = simplifier(a * d, b * c);
      if (m === 1 || m > 40 || n > 40) continue;
      [a, c] = avecUnSigne(a, c);
      return { a, b, c, d, n: n * Math.sign(a * c), m, texte: `${fracOuEntier(a, b)} ÷ ${fracP(c, d)}` };
    }
  }

  function expliquerDivision({ a, b, c, d, n, m, texte }) {
    const inverse = fracP(d * Math.sign(c), Math.abs(c));
    const haut = [Math.abs(a), d].filter(x => x > 1).join(' × ') || '1';
    const bas = [b, Math.abs(c)].filter(x => x > 1).join(' × ') || '1';
    return `${a * c < 0 ? 'Signes contraires : le résultat est <b>négatif</b>.<br>' : ''}Diviser par ${fracP(c, d)}, c’est multiplier par son <b>inverse</b> ${inverse} :<br>`
      + `${texte} = ${fracOuEntier(a, b)} × ${inverse} = `
      // (le calcul « 4 × 5 / 9 × 3 » n'est écrit que s'il y a vraiment une multiplication à faire)
      + `${haut.includes('×') || bas.includes('×') ? `${a * c < 0 ? MOINS : ''}${frac(haut, bas)} = ` : ''}<b>${fracOuEntier(n, m)}</b>.`;
  }

  // « les 2/3 », « 1/4 », « la moitié »
  const lesFraction = (k, d) => (k === 1 ? (d === 2 ? 'la moitié' : frac(1, d)) : `les ${frac(k, d)}`);

  // Un calcul avec des priorités : f1 + f2 × f3 ou f1 − f2 × f3 (f1 est parfois 1)
  function prioritesFractions() {
    for (;;) {
      const moins = Math.random() < 0.4;
      const s = moins ? -1 : 1;
      const [a, b] = Math.random() < 0.25 ? [1, 1] : fractionPropre(6);
      const [c, d] = fractionPropre(6);
      const [e, f] = fractionAuHasard(6);
      const [pn, pd] = simplifier(c * e, d * f);
      const L = ppcm(b, pd);
      const somme = a * (L / b) + s * pn * (L / pd);
      const [rn, rd] = simplifier(somme, L);
      if (rn <= 0 || rd === 1 || rd > 30 || rn > 40) continue;
      // Les erreurs : calculer dans l'ordre (f1 ± f2) × f3, additionner « en haut et en bas », se tromper de signe
      const [gn, gd] = simplifier(a * d + s * c * b, b * d);
      const pieges = piegesFractions(rn, rd, [[gn * e, gd * f], [a + s * pn, b + pd], [a * pd - s * pn * b, b * pd], [pn, pd]]
        .filter(([x, y]) => x / y > 0 && y <= 60));
      // L'erreur de priorité, toujours proposée (et citée par l'explication)
      const ordre = piegesFractions(rn, rd, [[gn * e, gd * f]]);
      if (pieges.length < 3 || ordre.length === 0) continue;
      const op = moins ? MOINS : '+';
      const debut = `${fracOuEntier(a, b)} ${op} ${fracOuEntier(pn, pd)}`;
      return {
        texte: `${fracOuEntier(a, b)} ${op} ${frac(c, d)} × ${frac(e, f)}`,
        n: rn,
        d: rd,
        pieges,
        garder: ordre,
        explication: `On calcule d’abord le produit : ${frac(c, d)} × ${frac(e, f)} = ${fracOuEntier(pn, pd)}.<br>`
          + `Puis ${debut} = ${b === L && pd === L ? '' : `${frac(a * (L / b), L)} ${op} ${frac(pn * (L / pd), L)} = `}${frac(somme, L)}`
          + `${somme !== rn ? ` = ${frac(rn, rd)}` : ''}.<br>⚠️ La multiplication passe avant ${moins ? 'la soustraction' : 'l’addition'} : `
          + `ce n’est pas (${fracOuEntier(a, b)} ${op} ${frac(c, d)}) × ${frac(e, f)} = ${fracOuEntier(...simplifier(gn * e, gd * f))}.`,
      };
    }
  }

  ajouterEtape({
    id: '4e-nombres-fractions-multiplication',
    banque: ['produit', 'produitChoix', 'produitChoix', 'produitChoix', 'inverse', 'inverse', 'diviser', 'diviserChoix',
      'fractionDe', 'priorites', 'priorites', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'produit' || sorte === 'produitChoix') {
        const p = produitDeFractions();
        const explication = expliquerProduitFractions(p.a, p.b, p.c, p.d);
        if (sorte === 'produit') {
          return fraction({
            consigne: 'Calcule (donne une fraction irréductible)',
            enonce: `${p.texte} = ___`,
            n: p.n,
            d: p.m,
            touches: TOUCHES_FRACTIONS,
            explication,
          });
        }
        const [ua, uc] = [Math.abs(p.a), Math.abs(p.c)];
        const s = Math.sign(p.a * p.c);
        const pieges = [
          [s * ua * p.d, p.b * uc], // « en croix », comme pour une division
          [s * (ua + uc), p.b + p.d], // additionner en haut et en bas
          [-p.n, p.m], // le signe
        ];
        // Un entier × une fraction : multiplier aussi le dénominateur (3 × 2/5 → 6/15)
        if (p.b === 1) pieges.push([s * ua * uc, p.d * ua]);
        if (p.d === 1) pieges.push([s * ua * uc, p.b * uc]);
        if (s > 0) pieges.push([ua * uc, p.b + p.d], [ua + uc, p.b * p.d]);
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${p.texte} = ___`,
          reponse: fracBouton(p.n, p.m),
          // (un résultat négatif : on garde le piège du signe ; sinon, pas de négatif parmi les boutons)
          pieges: piegesFractions(p.n, p.m, pieges.filter(([x, y]) => s < 0 || x / y > 0)).slice(0, 3),
          explication: explication + (p.b === 1 || p.d === 1 ? '<br>⚠️ Avec un entier, seul le numérateur est multiplié.' : ''),
        });
      }
      if (sorte === 'inverse') {
        const facon = parmi(['entier', 'decimal', 'fraction']);
        if (facon === 'entier') {
          // L'inverse de 7 ou de −7 : 1/7 ou −1/7 (il garde le signe)
          const k = entier(2, 9);
          const s = Math.random() < 0.35 ? -1 : 1;
          const moins = s < 0 ? MOINS : '';
          return choix({
            consigne: 'L’inverse d’un nombre',
            enonce: `Quel est l’inverse de ${ecrire(s * k)} ?`,
            reponse: fracTexte(s, k),
            // L'opposé, le mauvais signe, et 0,7 pour 7
            pieges: [ecrire(-s * k), fracTexte(-s, k), `${moins}0,${k}`],
            explication: `L’inverse de ${ecrire(s * k)} est le nombre qui, multiplié par ${P(s * k)}, donne 1 : `
              + `${ecrire(s * k)} × ${fracP(s, k)} = 1. C’est <b>${fracOuEntier(s, k)}</b>${s < 0 ? ' (il garde le signe)' : ''}.<br>`
              + `⚠️ ${ecrire(-s * k)} est l’<b>opposé</b> de ${ecrire(s * k)}. Et ${moins}0,${k} × ${P(s * k)} = ${ecrire(k * k / 10)}, pas 1.`,
          });
        }
        if (facon === 'decimal') {
          // [le nombre, son inverse, l'erreur classique (la virgule déplacée ou les chiffres gardés), le nombre en fraction]
          const [x0, inv0, classique0, [p, q0]] = parmi([
            [0.5, 2, 5, [1, 2]], [0.25, 4, 25, [1, 4]], [0.2, 5, 2, [1, 5]], [0.4, 2.5, 4, [2, 5]], [0.8, 1.25, 8, [4, 5]],
            [2.5, 0.4, 0.25, [5, 2]], [4, 0.25, 0.4, [4, 1]], [5, 0.2, 0.5, [5, 1]], [2, 0.5, 0.2, [2, 1]],
            [0.125, 8, 125, [1, 8]], [8, 0.125, 0.8, [8, 1]], [1.25, 0.8, 0.125, [5, 4]], [0.1, 10, 1, [1, 10]],
            [10, 0.1, 0.01, [10, 1]], [20, 0.05, 0.2, [20, 1]], [0.05, 20, 5, [1, 20]],
          ]);
          // Parfois un nombre négatif : son inverse est négatif aussi
          const s = Math.random() < 0.3 ? -1 : 1;
          const [x, inv, classique, q] = [s * x0, s * inv0, s * classique0, q0];
          return choix({
            consigne: 'L’inverse d’un nombre',
            enonce: `Quel est l’inverse de ${ecrire(x)} ?`,
            reponse: inv,
            // L'opposé (toujours proposé), l'erreur classique, le mauvais signe, la virgule mal placée
            ...avecPieges(inv, -x, [classique, -inv, net(inv * 10), net(inv / 10)]),
            // 4 : son inverse est 1/4 = 0,25 ; 0,4 = 2/5 : son inverse est 5/2 = 2,5 ; 0,25 = 1/4 : son inverse est 4
            explication: (q === 1 ? `L’inverse de ${ecrire(x)} est ${fracOuEntier(s, x0)} = `
              : `${ecrire(x)} = ${fracOuEntier(s * p, q)}, donc son inverse est ${p === 1 ? '' : `${fracOuEntier(s * q, p)} = `}`)
              + `<b>${ecrire(inv)}</b>.<br>`
              + `Vérifie : ${ecrire(x)} × ${P(inv)} = 1. (L’opposé de ${ecrire(x)}, c’est ${ecrire(-x)} : ce n’est pas la même chose.)`,
          });
        }
        // L'inverse d'une fraction : à écrire (avec des boutons, la réponse serait la seule de son signe)
        const [a, b] = fractionAuHasard();
        const s = Math.random() < 0.4 ? -1 : 1;
        return fraction({
          consigne: 'L’inverse d’un nombre',
          enonce: `${fracP(s * a, b)} × ___ = 1`,
          n: s * b,
          d: a,
          touches: TOUCHES_FRACTIONS,
          // (avec des parenthèses : « × (−5) », jamais « × −5 »)
          solution: `${fracP(s * a, b)} × <b>${fracP(s * b, a)}</b> = 1`,
          explication: `On échange le numérateur et le dénominateur, et on garde le signe : l’inverse est <b>${fracOuEntier(s * b, a)}</b>.<br>`
            + `Vérifie : ${fracP(s * a, b)} × ${fracP(s * b, a)} = ${frac(a * b, a * b)} = 1.`
            + ` (${fracOuEntier(-s * a, b)} est l’<b>opposé</b> de ${fracOuEntier(s * a, b)}, pas son inverse.)`,
        });
      }
      if (sorte === 'diviser' || sorte === 'diviserChoix') {
        const q = divisionDeFractions();
        const explication = expliquerDivision(q);
        if (sorte === 'diviser') {
          return fraction({
            consigne: 'Calcule (donne une fraction irréductible)',
            enonce: `${q.texte} = ___`,
            n: q.n,
            d: q.m,
            touches: TOUCHES_FRACTIONS,
            explication,
          });
        }
        const [ua, uc] = [Math.abs(q.a), Math.abs(q.c)];
        const s = Math.sign(q.a * q.c);
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${q.texte} = ___`,
          reponse: fracBouton(q.n, q.m),
          // Multiplier au lieu de diviser, prendre l'inverse de la mauvaise fraction, se tromper de signe
          pieges: piegesFractions(q.n, q.m, [[s * ua * uc, q.b * q.d], [s * q.b * uc, ua * q.d], [s * q.b * q.d, ua * uc],
            ...(s < 0 ? [[-q.n, q.m]] : [])]).slice(0, 3),
          explication,
        });
      }
      if (sorte === 'fractionDe') {
        const [p, q] = fractionPropre(6);
        let r;
        let s;
        do { [r, s] = fractionPropre(6); } while (r === p && s === q);
        const [n, m] = simplifier(p * r, q * s);
        const enfant = unEnfant();
        const enonce = parmi([
          () => `Il reste ${lesFraction(p, q)} d’une tarte. ${enfant.nom} mange ${lesFraction(r, s)} de ce reste. `
            + `Quelle fraction de la tarte entière ${enfant.nom} a-t-${enfant.il} mangée ?`,
          () => `Dans une classe, ${lesFraction(p, q)} des élèves font du sport, et ${lesFraction(r, s)} de ces sportifs font du foot. `
            + 'Quelle fraction des élèves de la classe fait du foot ?',
          () => `Papi plante des légumes sur ${lesFraction(p, q)} de son jardin. Les carottes occupent ${lesFraction(r, s)} du coin des légumes. `
            + 'Quelle fraction du jardin est plantée de carottes ?',
          () => `Calcule ${lesFraction(r, s)} de ${frac(p, q)}.`,
        ])();
        return fraction({
          consigne: 'Une fraction d’une fraction',
          enonce,
          n,
          d: m,
          touches: TOUCHES_FRACTIONS,
          explication: `« ${lesFraction(r, s)} de ${frac(p, q)} », c’est ${frac(r, s)} × ${frac(p, q)} :<br>`
            + `${frac(`${r} × ${p}`, `${s} × ${q}`)} = ${m !== s * q ? `${frac(r * p, s * q)} = ` : ''}<b>${frac(n, m)}</b>.`,
        });
      }
      if (sorte === 'priorites') {
        const c = prioritesFractions();
        return choix({
          consigne: 'Calcule (attention aux priorités)',
          enonce: `${c.texte} = ___`,
          reponse: fracBouton(c.n, c.d),
          pieges: c.pieges,
          garder: c.garder,
          explication: c.explication,
        });
      }
      // Vrai ou faux : un produit (juste, ou fait « en croix »), ou une règle
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.5) {
        let p;
        let faux;
        do {
          p = produitDeFractions();
          faux = simplifier(Math.sign(p.a * p.c) * Math.abs(p.a) * p.d, p.b * Math.abs(p.c));
        } while (faux[0] * p.m === p.n * faux[1] || p.b === 1 || p.d === 1);
        return vraiFaux({
          enonce: `${p.texte} = ${vrai ? fracOuEntier(p.n, p.m) : fracOuEntier(faux[0], faux[1])}`,
          vrai,
          explication: expliquerProduitFractions(p.a, p.b, p.c, p.d),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        [`Diviser par ${frac(2, 3)}, c’est multiplier par ${frac(3, 2)}.`, `diviser par un nombre, c’est multiplier par son inverse, et l’inverse de ${frac(2, 3)} est ${frac(3, 2)}.`],
        [`L’inverse de 5 est ${frac(1, 5)}.`, `5 × ${frac(1, 5)} = 1.`],
        [`Multiplier par ${frac(1, 2)}, c’est diviser par 2.`, `l’inverse de ${frac(1, 2)} est 2 : prendre la moitié, c’est diviser par 2.`],
        [`L’inverse de ${frac(-3, 4)} est ${frac(-4, 3)}.`, `${frac(-3, 4)} × (${frac(-4, 3)}) = ${frac(12, 12)} = 1 (l’inverse garde le signe).`],
      ] : [
        [`Diviser par ${frac(2, 3)}, c’est multiplier par ${frac(2, 3)}.`, `on multiplie par l’<b>inverse</b> : diviser par ${frac(2, 3)}, c’est multiplier par ${frac(3, 2)}.`],
        ['L’inverse de 5 est −5.', `−5 est l’opposé de 5. L’inverse de 5 est ${frac(1, 5)} (5 × ${frac(1, 5)} = 1).`],
        ['L’inverse de 4 est 0,4.', `4 × 0,4 = 1,6. L’inverse de 4 est ${frac(1, 4)} = 0,25.`],
        [`L’inverse de ${frac(-3, 4)} est ${frac(4, 3)}.`, `${frac(-3, 4)} × ${frac(4, 3)} = −1. L’inverse garde le signe : c’est ${frac(-4, 3)}.`],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'Multiplier et diviser des fractions',
    lecon: `
      <h4>Multiplier des fractions</h4>
      <p>On multiplie les <b>numérateurs entre eux</b> et les <b>dénominateurs entre eux</b>, puis on simplifie :
        ${frac(2, 3)} × ${frac(5, 7)} = ${frac('2 × 5', '3 × 7')} = ${frac(10, 21)}.</p>
      <p>👉 Avec un entier : 3 × ${frac(2, 5)} = ${frac('3 × 2', 5)} = ${frac(6, 5)} (le dénominateur ne change pas).
        La règle des signes marche aussi : ${frac(-2, 3)} × ${frac(9, 4)} = ${frac(-3, 2)}.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> simplifie <b>avant</b> de multiplier :
        ${frac(4, 9)} × ${frac(3, 8)} = ${frac('4 × 3', '9 × 8')} = ${frac('4 × 3', '3 × 3 × 4 × 2')} = ${frac(1, 6)}.</div>
      <h4>L’inverse d’un nombre</h4>
      <p>Deux nombres sont <b>inverses</b> quand leur produit vaut 1. L’inverse de ${frac(3, 7)} est ${frac(7, 3)} ;
        l’inverse de 5 est ${frac(1, 5)} = 0,2 ; l’inverse de ${frac(-2, 5)} est ${frac(-5, 2)} (il garde son signe). 0 n’a pas d’inverse.</p>
      <p>⚠️ Ne confonds pas avec l’<b>opposé</b> : l’opposé de 5 est −5.</p>
      <h4>Diviser par une fraction</h4>
      <p>Diviser par un nombre, c’est <b>multiplier par son inverse</b> :
        ${frac(3, 4)} ÷ ${frac(5, 2)} = ${frac(3, 4)} × ${frac(2, 5)} = ${frac(6, 20)} = ${frac(3, 10)}.</p>
      <h4>Une fraction d’une fraction</h4>
      <p>« Les ${frac(2, 3)} de ${frac(3, 4)} », c’est ${frac(2, 3)} × ${frac(3, 4)} = ${frac(6, 12)} = ${frac(1, 2)}.
        Et comme toujours, × passe avant + et − : 1 − ${frac(1, 2)} × ${frac(2, 3)} = 1 − ${frac(1, 3)} = ${frac(2, 3)}.</p>
    `,
  });

  // ======================================================================
  // 3. Les puissances
  // ======================================================================
  // a × a × a… (n fois) : « 2 × 2 × 2 »
  const facteursEgaux = (a, n) => Array(n).fill(P(a)).join(' × ');
  // Une puissance d'un entier positif qui se calcule de tête : [base, exposant]
  const puissanceAuHasard = () => parmi([
    () => [2, entier(3, 7)],
    () => [3, entier(2, 4)],
    () => [4, entier(2, 3)],
    () => [5, entier(2, 3)],
    () => [entier(6, 9), 2],
    () => [6, 3],
  ])();
  const valeurPuissance = (a, n) => net(a ** n);

  // Un exposant d'une puissance de 10 écrit dans un calcul : 3 + (−5)
  const somme2 = (m, signe, n) => `${ecrire(m)} ${signe} ${P(n)}`;

  // 10^k écrit en toutes lettres : « 100 000 », « 0,001 »
  const dixPuissance = k => ecrire(net(10 ** k));
  function expliquerDix(k) {
    if (k === 0) return `${puissance(10, 0)} = <b>1</b> (tout nombre non nul à la puissance 0 vaut 1).`;
    if (k > 0) return `${puissance(10, k)}, c’est 1 suivi de ${k} zéro${k > 1 ? 's' : ''} : <b>${dixPuissance(k)}</b>.`;
    return `${puissance(10, k)} = ${frac(1, puissance(10, -k))} = ${frac(1, dixPuissance(-k))} = <b>${dixPuissance(k)}</b> : `
      + `le 1 est au ${-k === 1 ? '1er' : `${-k}e`} rang après la virgule.`;
  }

  // Un produit ou un quotient de puissances de 10, avec ses erreurs classiques
  function calculPuissancesDeDix() {
    let m;
    let n;
    do { [m, n] = [entier(-6, 8), entier(-6, 8)]; } while (m === 0 || n === 0 || (m > 0 && n > 0 && Math.random() < 0.7) || m === n);
    const fois = Math.random() < 0.55;
    const k = fois ? m + n : m - n;
    const signe = fois ? '+' : MOINS;
    // Chaque piège : [texte, exposant équivalent en base 10] (pour ne pas garder deux pièges de même valeur)
    const pieges = fois
      ? [[puissanceTexte(10, m * n), m * n], [puissanceTexte(10, m - n), m - n], [puissanceTexte(100, k), 2 * k], [puissanceTexte(10, -k), -k]]
      : [[puissanceTexte(10, m + n), m + n], [puissanceTexte(10, n - m), n - m], ...(m % n === 0 ? [[puissanceTexte(10, m / n), m / n]] : []), [puissanceTexte(10, -(m + n)), -(m + n)]];
    return {
      texte: `${puissance(10, m)} ${fois ? '×' : '÷'} ${puissance(10, n)}`,
      m, n, k, fois,
      pieges: pieges.filter(([, e], i) => e !== k && (e === null || pieges.findIndex(([, f]) => f === e) === i)),
      explication: `${fois ? 'Pour multiplier, on <b>additionne</b> les exposants' : 'Pour diviser, on <b>soustrait</b> les exposants'} :<br>`
        + `${puissance(10, m)} ${fois ? '×' : '÷'} ${puissance(10, n)} = ${puissance(10, somme2(m, signe, n))} = <b>${puissance(10, k)}</b>.`,
    };
  }

  // (−a)^n ou −a^n : { a, n, v, texte, explication }
  function puissanceSignee() {
    const [a, n] = parmi([[2, entier(2, 5)], [3, entier(2, 3)], [parmi([4, 5, 6, 7, 8, 9]), 2], [1, entier(3, 8)], [10, entier(2, 3)]]);
    // (−1)ⁿ toujours avec des parenthèses : −1⁷, ce serait bizarre
    const avecParentheses = a === 1 || Math.random() < 0.55;
    const v = avecParentheses ? valeurPuissance(-a, n) : -valeurPuissance(a, n);
    const texte = avecParentheses ? puissance(`(${MOINS}${a})`, n) : `${MOINS}${puissance(a, n)}`;
    const pair = n % 2 === 0;
    return {
      a, n, v, texte,
      explication: avecParentheses
        ? `${texte} = ${facteursEgaux(-a, n)} : ${n} facteurs négatifs, un nombre ${pair ? 'pair' : 'impair'}, `
          + `donc le résultat est ${pair ? 'positif' : 'négatif'} : <b>${ecrire(v)}</b>.`
        : `Sans parenthèses, seul ${a} est à la puissance ${n} : ${texte} = ${MOINS}(${facteursEgaux(a, n)}) = <b>${ecrire(v)}</b>.`
          + `${pair ? `<br>(Avec des parenthèses, ce serait différent : ${puissance(`(${MOINS}${a})`, n)} = ${ecrire(-v)}.)` : ''}`,
    };
  }

  ajouterEtape({
    id: '4e-nombres-puissances',
    banque: ['calcul', 'calcul', 'calcul', 'signe', 'signe', 'ecriture', 'dix', 'dix', 'produitDix', 'produitDix', 'exposant',
      'probleme', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'calcul') {
        // Parfois, à écrire, avec un nombre négatif : (−2)⁵, −3², (−1)⁶
        if (Math.random() < 0.15) {
          const s = puissanceSignee();
          return nombre({ consigne: 'Calcule', enonce: `${s.texte} = ___`, reponse: s.v, touches: TOUCHES, explication: s.explication });
        }
        const [a, n] = puissanceAuHasard();
        const v = valeurPuissance(a, n);
        const commun = {
          enonce: `${puissance(a, n)} = ___`,
          reponse: v,
          explication: `${puissance(a, n)} = ${facteursEgaux(a, n)} = <b>${ecrire(v)}</b> (${n} facteurs égaux à ${a}).<br>`
            + `⚠️ Ce n’est pas ${a} × ${n} = ${ecrire(a * n)} !`,
        };
        if (Math.random() < 0.3) return nombre({ ...commun, consigne: 'Calcule', touches: TOUCHES });
        return choix({
          ...commun,
          consigne: 'Choisis le bon résultat',
          // a × n (l'erreur citée par l'explication, toujours proposée), a + n, un facteur de trop ou de moins,
          // n puissance a, un facteur doublé au lieu de multiplié (2 × a^(n−1))
          garder: [a * n],
          pieges: [a + n, a ** (n - 1), a ** (n + 1), n ** a, 2 * a ** (n - 1)].filter(x => x > 1 && x < 5000),
        });
      }
      if (sorte === 'signe') {
        const s = puissanceSignee();
        const { a, n, v } = s;
        return choix({
          consigne: 'Attention au signe',
          enonce: `${s.texte} = ___`,
          reponse: v,
          // Le signe (toujours proposé), a × n au lieu de la puissance, un facteur de moins ou de trop
          ...avecPieges(v, -v, [a * n, -a * n, valeurPuissance(a, n - 1), -valeurPuissance(a, n - 1), v * a, -v * a]
            .filter(x => Math.abs(x) !== 1 || a === 1)),
          explication: s.explication,
        });
      }
      if (sorte === 'ecriture') {
        const facon = parmi(['produit', 'produit', 'negatif', 'dix']);
        if (facon === 'dix') {
          const k = parmi([-4, -3, -2, -1, 3, 4, 5, 6]);
          const pieges = [puissanceTexte(10, k + 1), puissanceTexte(10, k - 1), puissanceTexte(10, -k)];
          if (k > 0) pieges.push(puissanceTexte(k, 10));
          // Parfois écrit en fraction : 1/1 000 = 10⁻³
          if (k < 0 && Math.random() < 0.4) {
            return choix({
              consigne: 'Écris sous la forme d’une puissance de 10',
              enonce: `${frac(1, dixPuissance(-k))} = ___`,
              reponse: puissanceTexte(10, k),
              pieges,
              explication: `${dixPuissance(-k)} = ${puissance(10, -k)}, donc ${frac(1, dixPuissance(-k))} = ${frac(1, puissance(10, -k))} = <b>${puissance(10, k)}</b>.<br>`
                + `(C’est aussi ${dixPuissance(k)}.)`,
            });
          }
          return choix({
            consigne: 'Écris sous la forme d’une puissance de 10',
            enonce: `${dixPuissance(k)} = ___`,
            reponse: puissanceTexte(10, k),
            pieges,
            explication: expliquerDix(k).replace(/ : <b>.*<\/b>\.$/, '.').replace(/<b>|<\/b>/g, '')
              + `<br>Donc ${dixPuissance(k)} = <b>${puissance(10, k)}</b>.`,
          });
        }
        const negatif = facon === 'negatif';
        const a = negatif ? entier(2, 5) : entier(2, 9);
        const n = negatif ? 2 * entier(2, 3) : entier(3, 6);
        const base = negatif ? `(${MOINS}${a})` : String(a);
        // Chaque piège : [texte, valeur] (on enlève ceux qui valent autant que la réponse : 4² = 2⁴ !)
        const b = negatif ? -a : a;
        const pieges = (negatif
          ? [[`${MOINS}${puissanceTexte(a, n)}`, -(a ** n)], [puissanceTexte(base, n - 1), b ** (n - 1)], [puissanceTexte(base, n + 1), b ** (n + 1)]]
          : [[puissanceTexte(n, a), n ** a], [puissanceTexte(a, n - 1), a ** (n - 1)], [puissanceTexte(a, n + 1), a ** (n + 1)], [puissanceTexte(a + 1, n), (a + 1) ** n]])
          .filter(([, v]) => v !== b ** n).map(([texte]) => texte).slice(0, 3);
        return choix({
          consigne: 'Écris sous la forme d’une puissance',
          enonce: `${facteursEgaux(negatif ? -a : a, n)} = ___`,
          reponse: puissanceTexte(base, n),
          pieges,
          explication: `On compte les facteurs : il y en a <b>${n}</b>, tous égaux à ${negatif ? `${MOINS}${a}` : a}. `
            + `C’est <b>${puissance(base, n)}</b>.`
            + (negatif ? `<br>⚠️ Les parenthèses sont obligatoires : ${MOINS}${puissance(a, n)} = ${MOINS}${ecrire(a ** n)}, alors que ${puissance(base, n)} = ${ecrire(a ** n)}.` : ''),
        });
      }
      if (sorte === 'dix') {
        const k = parmi([-4, -3, -3, -2, -2, -1, 0, 2, 3, 4, 5, 6]);
        const commun = { enonce: `${puissance(10, k)} = ___`, reponse: net(10 ** k), explication: expliquerDix(k) };
        if (Math.random() < 0.5) {
          // À écrire : 10ᵏ, ou un produit (un quotient) de puissances de 10 à écrire en décimal
          if (Math.random() < 0.4) {
            let c;
            do { c = calculPuissancesDeDix(); } while (c.k < -4 || c.k > 6);
            return nombre({
              consigne: 'Écris en écriture décimale',
              enonce: `${c.texte} = ___`,
              reponse: net(10 ** c.k),
              touches: TOUCHES,
              explication: `${c.explication}<br>${expliquerDix(c.k).replace(/<b>|<\/b>/g, '')}`,
            });
          }
          return nombre({ ...commun, consigne: 'Écris en écriture décimale', touches: TOUCHES });
        }
        // Une erreur classique (toujours proposée), plus petite ou plus grande que la réponse (pour que sa place varie) :
        // 10⁻³ = −1 000 ou 1 000 (le signe − oublié) ; 10⁵ = 50 ou 1 000 000 (un zéro de trop) ; 10⁰ = 0 ou 10
        const dessous = Math.random() < 0.5;
        const classique = k < 0 ? (dessous ? -(10 ** -k) : 10 ** -k) : (k === 0 ? (dessous ? 0 : 10) : (dessous ? 10 * k : 10 ** (k + 1)));
        return choix({
          ...commun,
          consigne: 'Choisis la bonne écriture',
          ...avecPieges(net(10 ** k), classique, [k + 1, k - 1, k + 2, k - 2, k - 3, ...(k >= 0 ? [k + 3] : [])].map(j => net(10 ** j))
            .filter(x => x >= 1e-6 && x <= 1e9)),
        });
      }
      if (sorte === 'produitDix') {
        const c = calculPuissancesDeDix();
        return choix({
          consigne: 'Choisis le bon résultat',
          enonce: `${c.texte} = ___`,
          reponse: puissanceTexte(10, c.k),
          pieges: c.pieges.map(([t]) => t),
          explication: c.explication,
        });
      }
      if (sorte === 'exposant') {
        if (Math.random() < 0.6) {
          const c = calculPuissancesDeDix();
          return nombre({
            consigne: 'Trouve l’exposant',
            enonce: `${c.texte} = ${puissance(10, 'n')}. Quelle est la valeur de n ?`,
            reponse: c.k,
            touches: TOUCHES,
            solution: `n = <b>${ecrire(c.k)}</b>`,
            explication: c.explication,
          });
        }
        const k = parmi([-5, -4, -3, -2, -1, 2, 3, 4, 5, 6, 7]);
        // Parfois écrit en fraction : 1/1 000 = 10ⁿ
        if (k < 0 && k > -5 && Math.random() < 0.4) {
          return nombre({
            consigne: 'Trouve l’exposant',
            enonce: `${frac(1, dixPuissance(-k))} = ${puissance(10, 'n')}. Quelle est la valeur de n ?`,
            reponse: k,
            touches: TOUCHES,
            solution: `n = <b>${ecrire(k)}</b>`,
            explication: `${dixPuissance(-k)} = ${puissance(10, -k)}, donc ${frac(1, dixPuissance(-k))} = ${frac(1, puissance(10, -k))} = ${puissance(10, k)}.<br>`
              + `Donc n = <b>${ecrire(k)}</b>.`,
          });
        }
        return nombre({
          consigne: 'Trouve l’exposant',
          enonce: `${dixPuissance(k)} = ${puissance(10, 'n')}. Quelle est la valeur de n ?`,
          reponse: k,
          touches: TOUCHES,
          solution: `n = <b>${ecrire(k)}</b>`,
          explication: `${expliquerDix(k).replace(/<b>|<\/b>/g, '')}<br>Donc n = <b>${ecrire(k)}</b>.`,
        });
      }
      if (sorte === 'probleme') {
        const enfant = unEnfant();
        const pb = parmi([
          () => {
            // Un enfant a quelques dizaines de billes ; les grands nombres sont pour le magasin
            const b = entier(3, 5);
            return {
              enonce: `${enfant.nom} range ses billes dans ${b} boîtes. Chaque boîte contient ${b} sachets, et chaque sachet contient ${b} billes. Combien a-t-${enfant.il} de billes ?`,
              b, n: 3, unite: 'billes',
            };
          },
          () => {
            const [b, n] = parmi([[entier(6, 9), 3], [entier(3, 5), 4]]);
            return {
              enonce: n === 3
                ? `Au magasin, il y a ${b} cartons. Chaque carton contient ${b} boîtes, et chaque boîte contient ${b} billes. Combien y a-t-il de billes ?`
                : `Au magasin, il y a ${b} cartons. Chaque carton contient ${b} boîtes, chaque boîte ${b} sachets, et chaque sachet ${b} billes. Combien y a-t-il de billes ?`,
              b, n, unite: 'billes',
            };
          },
          () => {
            const [b, n] = parmi([[2, entier(4, 7)], [3, entier(3, 5)], [4, entier(3, 4)]]);
            return {
              enonce: `${enfant.nom} envoie une photo de Roxy à ${b} amis le 1er jour. Le 2e jour, chacun l’envoie à ${b} nouveaux amis, et ainsi de suite. `
                + `Combien de personnes reçoivent la photo le ${n}e jour ?`,
              b, n, unite: 'personnes',
            };
          },
          () => {
            const b = entier(2, 9);
            return { enonce: `Une boîte a la forme d’un cube d’arête ${mesure(b, 'cm')}. Quel est son volume ?`, b, n: 3, unite: 'cm³' };
          },
        ])();
        const v = pb.b ** pb.n;
        // La photo : on montre chaque jour (2 → 4 → 8…), pour voir pourquoi le 3e jour donne b³
        const jours = Array.from({ length: pb.n }, (_, i) => ecrire(pb.b ** (i + 1))).join(' → ');
        return nombre({
          consigne: 'Résous le problème',
          enonce: pb.enonce,
          reponse: v,
          unite: pb.unite,
          touches: TOUCHES,
          explication: pb.unite === 'personnes'
            ? `Chaque jour, le nombre de personnes est multiplié par ${pb.b} : ${jours}.<br>`
              + `Le ${pb.n}e jour : ${facteursEgaux(pb.b, pb.n)} = ${puissance(pb.b, pb.n)} = <b>${ecrire(v)}</b>.`
            : `${facteursEgaux(pb.b, pb.n)} = ${puissance(pb.b, pb.n)} = <b>${ecrire(v)}</b>`
              + `${pb.unite === 'cm³' ? ` : le volume est ${mesure(v, 'cm³')} (arête × arête × arête).` : '.'}`,
        });
      }
      // Vrai ou faux : une puissance, un signe, une puissance de 10
      const vrai = Math.random() < 0.5;
      const genre = parmi(['calcul', 'signe', 'dix']);
      if (genre === 'calcul') {
        const [a, n] = puissanceAuHasard();
        const v = valeurPuissance(a, n);
        return vraiFaux({
          enonce: `${puissance(a, n)} = ${ecrire(vrai ? v : (a === 1 ? n : a * n))}`,
          vrai,
          explication: `${puissance(a, n)} = ${facteursEgaux(a, n)} = <b>${ecrire(v)}</b>${vrai ? '' : ` (et pas ${a} × ${n})`}.`,
        });
      }
      if (genre === 'signe') {
        const [a, n] = parmi([[2, 2], [2, 4], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3]]);
        const avecParentheses = Math.random() < 0.5;
        const v = avecParentheses ? valeurPuissance(-a, n) : -valeurPuissance(a, n);
        const texte = avecParentheses ? puissance(`(${MOINS}${a})`, n) : `${MOINS}${puissance(a, n)}`;
        return vraiFaux({
          enonce: `${texte} = ${ecrire(vrai ? v : -v)}`,
          vrai,
          explication: avecParentheses
            ? `${texte} = ${facteursEgaux(-a, n)} = <b>${ecrire(v)}</b> (${n} facteurs négatifs : ${n % 2 ? 'impair, donc négatif' : 'pair, donc positif'}).`
            : `Sans parenthèses, seul ${a} est à la puissance ${n} : ${texte} = ${MOINS}(${facteursEgaux(a, n)}) = <b>${ecrire(v)}</b>.`,
        });
      }
      const k = parmi([-4, -3, -2, -1, 0, 2, 3, 4, 5]);
      const faux = k < 0 ? parmi([-(10 ** -k), net(10 ** (k - 1))]) : (k === 0 ? 0 : parmi([10 * k, 10 ** (k + 1)]));
      return vraiFaux({ enonce: `${puissance(10, k)} = ${ecrire(vrai ? net(10 ** k) : faux)}`, vrai, explication: expliquerDix(k) });
    },
    titreLecon: 'Les puissances',
    lecon: `
      <h4>La notation a<sup>n</sup></h4>
      <p>${puissance('a', 'n')} (« a exposant n ») est le produit de <b>n facteurs</b> égaux à a ; n est l’<b>exposant</b>.<br>
        👉 ${puissance(2, 5)} = 2 × 2 × 2 × 2 × 2 = 32 · ${puissance(7, 2)} = 49 (« 7 au carré ») · ${puissance(4, 3)} = 64 (« 4 au cube »)</p>
      <p>⚠️ ${puissance(2, 3)} = 2 × 2 × 2 = 8, et pas 2 × 3 = 6 !</p>
      <h4>Avec un nombre négatif</h4>
      <p>${puissance('(−3)', 2)} = (−3) × (−3) = 9, mais −${puissance(3, 2)} = −(3 × 3) = −9 : sans parenthèses, seul 3 est au carré.<br>
        ${puissance('(−2)', 3)} = (−2) × (−2) × (−2) = −8 : un exposant <b>pair</b> donne un résultat positif, un exposant <b>impair</b> garde le signe −.</p>
      <h4>Les puissances de 10</h4>
      <p>${puissance(10, 'n')} = 1 suivi de n zéros : ${puissance(10, 4)} = 10&nbsp;000 · ${puissance(10, 0)} = 1<br>
        ${puissance(10, '−n')} = ${frac(1, puissance(10, 'n'))} : ${puissance(10, -3)} = ${frac(1, '1&nbsp;000')} = 0,001 (le 1 est au 3e rang après la virgule).</p>
      <p>Pour <b>multiplier</b>, on additionne les exposants : ${puissance(10, 3)} × ${puissance(10, -5)} = ${puissance(10, '3 + (−5)')} = ${puissance(10, -2)}.<br>
        Pour <b>diviser</b>, on les soustrait : ${puissance(10, 4)} ÷ ${puissance(10, -2)} = ${puissance(10, '4 − (−2)')} = ${puissance(10, 6)}.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> ${puissance(10, -3)} = 0,001 s’écrit avec 3 zéros en tout
        (en comptant celui devant la virgule), et ${puissance(10, 3)} = 1&nbsp;000 aussi !</div>
    `,
  });

  // ======================================================================
  // 4. La notation scientifique
  // ======================================================================
  // a × 10^n : en HTML (sciHtml) ou en texte pour les boutons (sciTexte)
  const sciHtml = (a, n) => `${ecrire(a)} × ${puissance(10, n)}`;
  const sciTexte = (a, n) => `${ecrire(a)} × ${puissanceTexte(10, n)}`;
  const SIGNES = { '<': '&lt;', '>': '&gt;', '=': '=' };
  const rangs = k => `${k} rang${k > 1 ? 's' : ''}`;

  // Un nombre a × 10^n en notation scientifique (1 ≤ a < 10, 1 à 3 chiffres), et sa valeur
  // (pas plus de 9 chiffres avant la virgule, ni plus de 6 après)
  function scientifique(nMin = -5, nMax = 8) {
    for (;;) {
      const a = parmi([() => entier(1, 9), () => decimal(1, 9.9, 1), () => decimal(1, 9.9, 1), () => decimal(1, 9.99, 2)])();
      const n = entier(nMin, nMax);
      const valeur = net(a * 10 ** n);
      if (n !== 0 && decimalesDe(valeur) <= 6 && valeur < 1e9) return { a, n, valeur };
    }
  }

  // La notation scientifique d'un nombre positif : [a, n]
  function versScientifique(x) {
    const n = Math.floor(Math.log10(x) + 1e-9);
    return [net(x / 10 ** n), n];
  }

  // valeur : le nombre déjà écrit (par défaut, avec ecrire)
  function expliquerScientifique(a, n, valeur = ecrire(net(a * 10 ** n))) {
    return `On garde un seul chiffre (pas 0) avant la virgule : ${ecrire(a)}, qui est entre 1 et 10.<br>`
      + `De ${ecrire(a)} à ${valeur}, la virgule se décale de ${rangs(Math.abs(n))} vers la ${n > 0 ? 'droite' : 'gauche'} : `
      + `c’est × ${puissance(10, n)}.<br>${valeur} = <b>${sciHtml(a, n)}</b>`;
  }

  function expliquerDecimale(a, n) {
    const valeur = net(a * 10 ** n);
    const zeros = n < 0 || decimalesDe(a) < n ? ' (on complète avec des zéros)' : '';
    return `× ${puissance(10, n)} : la virgule se décale de ${rangs(Math.abs(n))} vers la ${n > 0 ? 'droite' : 'gauche'}${zeros}.<br>`
      + `${sciHtml(a, n)} = <b>${ecrire(valeur)}</b>`;
  }

  // Les pièges : une écriture égale mais pas scientifique (32 × 10³ ou 0,32 × 10⁵), et des exposants faux
  function piegesScientifiques(a, n) {
    const pasScientifique = parmi([sciTexte(net(a * 10), n - 1), sciTexte(net(a / 10), n + 1)]);
    return [pasScientifique, ...RM.melanger([sciTexte(a, n - 1), sciTexte(a, n + 1), sciTexte(a, -n)]).slice(0, 2)];
  }

  // Des grandeurs de la vie réelle (valeurs approchées)
  const GRANDEURS = [
    ['La distance de la Terre au Soleil est d’environ', 150000000, 'km'],
    ['La distance de la Terre à la Lune est d’environ', 384000, 'km'],
    ['Le diamètre de la Terre est d’environ', 12700, 'km'],
    ['En une seconde, la lumière parcourt environ', 300000, 'km'],
    ['La Terre compte environ', 8000000000, 'habitants'],
    ['La France compte environ', 68000000, 'habitants'],
    ['Au cours d’une vie, un cœur bat environ', 3000000000, 'fois'],
    ['Un éléphant d’Afrique pèse environ', 6000, 'kg'],
    ['Une fourmi mesure environ', 0.005, 'm'],
    ['Un grain de sable fin mesure environ', 0.0002, 'm'],
    ['Un cheveu a une épaisseur d’environ', 0.00007, 'm'],
    ['Un globule rouge mesure environ', 0.000007, 'm'],
    ['Une goutte d’eau pèse environ', 0.05, 'g'],
    ['Un grain de riz pèse environ', 0.02, 'g'],
    ['Une feuille de papier a une épaisseur d’environ', 0.0001, 'm'],
    ['Une bactérie mesure environ', 0.000002, 'm'],
    ['Un virus de la grippe mesure environ', 0.0000001, 'm'],
    ['Une personne a environ', 150000, 'cheveux'],
    ['Paris compte environ', 2100000, 'habitants'],
    ['Le diamètre du Soleil est d’environ', 1400000, 'km'],
    ['Une année dure environ', 31500000, 's'],
  ];
  // Un petit nombre écrit avec ses chiffres groupés par 3 après la virgule, pour mieux compter les zéros : 0,000 000 1
  function ecrireGroupe(x) {
    const [ent, dec] = ecrire(x).split(',');
    return dec ? `${ent},${dec.replace(/([0-9]{3})(?=[0-9])/g, `$1${ESPACE}`)}` : ent;
  }

  // Deux nombres à comparer : { texte, valeur } × 2, avec les pièges classiques
  function paireScientifique() {
    const facon = parmi(['exposants', 'exposants', 'negatifs', 'memeExposant', 'egaux']);
    let x;
    let y;
    if (facon === 'exposants' || facon === 'negatifs') {
      // Le plus grand exposant avec le plus petit nombre devant : 3,1 × 10⁵ > 8,7 × 10⁴
      const n1 = facon === 'negatifs' ? -entier(2, 6) : entier(2, 8);
      const n2 = n1 - entier(1, 2);
      const [a1, a2] = Math.random() < 0.7 ? [decimal(1.1, 4.9, 1), decimal(5.1, 9.9, 1)] : [decimal(1.1, 9.9, 1), decimal(1.1, 9.9, 1)];
      [x, y] = [{ a: a1, n: n1 }, { a: a2, n: n2 }];
    } else if (facon === 'memeExposant') {
      const n = entier(-5, 8) || 3;
      let a1;
      let a2;
      do { [a1, a2] = [decimal(1, 9.9, parmi([1, 2])), decimal(1, 9.9, parmi([1, 2]))]; } while (egaux(a1, a2));
      [x, y] = [{ a: a1, n }, { a: a2, n }];
    } else {
      // Deux écritures du même nombre : 4,5 × 10³ et 0,45 × 10⁴
      const { a, n } = scientifique(-4, 7);
      const autre = Math.random() < 0.5 ? { a: net(a / 10), n: n + 1 } : { a: net(a * 10), n: n - 1 };
      [x, y] = [{ a, n }, autre];
    }
    [x, y] = Math.random() < 0.5 ? [x, y] : [y, x];
    return [x, y].map(({ a, n }) => ({ a, n, texte: sciHtml(a, n), valeur: net(a * 10 ** n) }));
  }

  function expliquerComparaisonSci(x, y, s) {
    if (s === '=') {
      const [bon, autre] = x.a >= 1 && x.a < 10 ? [x, y] : [y, x];
      return `${autre.texte} = ${bon.texte} : on a seulement déplacé la virgule. Les deux nombres sont égaux (${ecrire(bon.valeur)}).`;
    }
    const conclusion = `<b>${x.texte} ${SIGNES[s]} ${y.texte}</b>`;
    if (x.n === y.n) return `Même puissance de 10 : on compare les nombres devant, ${ecrire(x.a)} ${SIGNES[s]} ${ecrire(y.a)}. Donc ${conclusion}.`;
    return `En notation scientifique, on compare d’abord les exposants : ${puissance(10, x.n)} ${SIGNES[s]} ${puissance(10, y.n)}. `
      + `Donc ${conclusion}`
      // (l'écriture décimale, seulement si elle n'est pas trop longue)
      + (decimalesDe(x.valeur) <= 5 && decimalesDe(y.valeur) <= 5 ? ` (${ecrire(x.valeur)} ${SIGNES[s]} ${ecrire(y.valeur)}).` : '.');
  }

  ajouterEtape({
    id: '4e-nombres-notation-scientifique',
    banque: ['ecrire', 'ecrire', 'morceau', 'morceau', 'decimal', 'decimal', 'est', 'comparer', 'comparer', 'vieReelle', 'vieReelle', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'ecrire') {
        const { a, n, valeur } = scientifique();
        return choix({
          consigne: 'La notation scientifique',
          enonce: `Quelle est la notation scientifique de ${ecrire(valeur)} ?`,
          reponse: sciTexte(a, n),
          pieges: piegesScientifiques(a, n),
          explication: expliquerScientifique(a, n),
        });
      }
      if (sorte === 'morceau') {
        const { a, n, valeur } = scientifique();
        if (Math.random() < 0.5) {
          return nombre({
            consigne: 'Complète la notation scientifique',
            enonce: `${ecrire(valeur)} = ___ × ${puissance(10, n)}`,
            reponse: a,
            touches: TOUCHES,
            explication: expliquerScientifique(a, n),
          });
        }
        return nombre({
          consigne: 'Complète la notation scientifique',
          enonce: `${ecrire(valeur)} = ${ecrire(a)} × ${puissance(10, 'n')}. Quelle est la valeur de n ?`,
          reponse: n,
          touches: TOUCHES,
          solution: `n = <b>${ecrire(n)}</b>`,
          explication: expliquerScientifique(a, n),
        });
      }
      if (sorte === 'decimal') {
        const { a, n, valeur } = scientifique(-4, 7);
        return nombre({
          consigne: 'Donne l’écriture décimale',
          enonce: `${sciHtml(a, n)} = ___`,
          reponse: valeur,
          touches: TOUCHES,
          explication: expliquerDecimale(a, n),
        });
      }
      if (sorte === 'est') {
        // Quatre écritures du même nombre : une seule est scientifique
        const { a, n } = scientifique(-4, 8);
        const autres = [[net(a * 10), n - 1], [net(a * 100), n - 2], [net(a / 10), n + 1], [net(a / 100), n + 2]];
        return choix({
          consigne: 'La notation scientifique',
          enonce: `Ces quatre écritures sont égales à ${ecrire(net(a * 10 ** n))}. Laquelle est la notation scientifique ?`,
          reponse: sciTexte(a, n),
          pieges: RM.melanger(autres).slice(0, 3).map(([b, m]) => sciTexte(b, m)),
          explication: `Ces quatre écritures sont égales à ${ecrire(net(a * 10 ** n))}, mais une seule a un nombre entre 1 et 10 devant la puissance de 10 : `
            + `<b>${sciHtml(a, n)}</b> (1 ≤ ${ecrire(a)} &lt; 10).`,
        });
      }
      if (sorte === 'comparer') {
        const [x, y] = paireScientifique();
        const s = egaux(x.valeur, y.valeur) ? '=' : (x.valeur < y.valeur ? '<' : '>');
        return choix({
          consigne: 'Compare ces deux nombres',
          enonce: `${x.texte} ___ ${y.texte}`,
          reponse: s,
          choix: ['<', '=', '>'],
          explication: expliquerComparaisonSci(x, y, s),
        });
      }
      if (sorte === 'vieReelle') {
        const [debut, valeur, unite] = parmi(GRANDEURS);
        const [a, n] = versScientifique(valeur);
        return choix({
          consigne: 'Écris en notation scientifique',
          enonce: `${debut} ${ecrireGroupe(valeur)}${ESPACE}${unite}, soit ___ ${unite}.`,
          reponse: sciTexte(a, n),
          pieges: piegesScientifiques(a, n),
          explication: expliquerScientifique(a, n, ecrireGroupe(valeur)),
        });
      }
      // Vrai ou faux : notation scientifique ou pas, écriture décimale
      const vrai = Math.random() < 0.5;
      const genre = parmi(['estScientifique', 'decimale', 'decimale', 'regle']);
      if (genre === 'estScientifique') {
        const { a, n, valeur } = scientifique(-4, 8);
        const [b, m] = vrai ? [a, n] : parmi([[net(a * 10), n - 1], [net(a / 10), n + 1]]);
        return vraiFaux({
          enonce: `${sciHtml(b, m)} est écrit en notation scientifique.`,
          vrai,
          explication: vrai
            ? `<b>Vrai</b> : ${ecrire(a)} est entre 1 et 10 (un seul chiffre, pas 0, avant la virgule).`
            : `<b>Faux</b> : ${ecrire(b)} n’est pas entre 1 et 10. La notation scientifique de ${ecrire(valeur)} est <b>${sciHtml(a, n)}</b>.`,
        });
      }
      if (genre === 'decimale') {
        const { a, n, valeur } = scientifique(-4, 7);
        const faux = parmi([net(valeur * 10), net(valeur / 10)].filter(x => decimalesDe(x) <= 6));
        return vraiFaux({ enonce: `${sciHtml(a, n)} = ${ecrire(vrai ? valeur : faux)}`, vrai, explication: expliquerDecimale(a, n) });
      }
      const [enonce, explication] = parmi(vrai ? [
        [`${sciHtml(5, -2)} est plus petit que 1.`, `${sciHtml(5, -2)} = 0,05 : c’est un petit nombre, entre 0 et 1.`],
        [`${sciHtml(2, 5)} est plus grand que ${sciHtml(9, 4)}.`, `on compare d’abord les exposants : 200&nbsp;000 &gt; 90&nbsp;000.`],
        [`${sciHtml(3, 4)} = 30&nbsp;000`, 'la virgule de 3 se décale de 4 rangs vers la droite.'],
      ] : [
        [`${sciHtml(5, -2)} est un nombre négatif.`, `${sciHtml(5, -2)} = 0,05 : l’exposant est négatif, mais le nombre est positif (entre 0 et 1).`],
        [`${sciHtml(2, 5)} est plus petit que ${sciHtml(9, 4)}.`, `on compare d’abord les exposants : 200&nbsp;000 &gt; 90&nbsp;000.`],
        [`${sciHtml(3, 4)} = 300&nbsp;000`, 'la virgule de 3 se décale de 4 rangs vers la droite : 30&nbsp;000.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'La notation scientifique',
    lecon: `
      <h4>Écrire en notation scientifique</h4>
      <p>Un nombre positif s’écrit en notation scientifique sous la forme <b>a × ${puissance(10, 'n')}</b>,
        avec <b>1 ≤ a &lt; 10</b> (un seul chiffre avant la virgule, et ce n’est pas 0) et n un nombre entier (positif ou négatif).</p>
      <p>👉 32&nbsp;000 = ${sciHtml(3.2, 4)} · 0,00045 = ${sciHtml(4.5, -4)} · 608&nbsp;000&nbsp;000 = ${sciHtml(6.08, 8)}</p>
      <p>⚠️ 32 × ${puissance(10, 3)} et 0,32 × ${puissance(10, 5)} sont bien égaux à 32&nbsp;000, mais ce ne sont pas
        des notations scientifiques : 32 et 0,32 ne sont pas entre 1 et 10.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> compte de combien de rangs la virgule se décale.
        De 3,2 à 32&nbsp;000 : 4 rangs vers la droite → ${puissance(10, 4)}. De 4,5 à 0,00045 : 4 rangs vers la gauche → ${puissance(10, -4)}.</div>
      <h4>Revenir à l’écriture décimale</h4>
      <p>👉 ${sciHtml(7.3, 5)} = 730&nbsp;000 (5 rangs vers la droite) · ${sciHtml(2.5, -3)} = 0,0025 (3 rangs vers la gauche).
        Un exposant négatif donne un petit nombre (entre 0 et 1), pas un nombre négatif !</p>
      <h4>Comparer</h4>
      <p>On compare d’abord les <b>exposants</b> : ${sciHtml(3.1, 5)} &gt; ${sciHtml(8.7, 4)}.
        S’ils sont égaux, on compare les nombres devant : ${sciHtml(4.2, 3)} &lt; ${sciHtml(5.1, 3)}.</p>
      <p>🌍 Terre–Soleil : ${sciHtml(1.5, 8)}&nbsp;km · la Terre : ${sciHtml(8, 9)} habitants · un cheveu : ${sciHtml(7, -5)}&nbsp;m d’épaisseur.</p>
    `,
  });

  // ======================================================================
  // 5. Développer et réduire
  // ======================================================================
  // Une expression écrite à partir de ses termes [coefficient, lettre] : [[3, 'x'], [−5, '']] → « 3x − 5 »
  // (les termes nuls sont enlevés ; 1x s'écrit x et −1x s'écrit −x)
  function expression(termes) {
    const t = termes.filter(([k]) => k !== 0);
    if (!t.length) return '0';
    return t.map(([k, L], i) => {
      const corps = L ? (Math.abs(k) === 1 ? L : `${ecrire(Math.abs(k))}${L}`) : ecrire(Math.abs(k));
      if (i === 0) return (k < 0 ? MOINS : '') + corps;
      return `${k < 0 ? MOINS : '+'} ${corps}`;
    }).join(' ');
  }
  const LETTRES = ['x', 'x', 'x', 'y', 't'];
  const nonNul = (min, max) => parmi([-1, 1]) * entier(min, max);
  // Un terme seul, pour écrire les produits de l'explication : terme(3, 'x') → « 3x » ; terme(−2, 'x') → « (−2x) » ; terme(−2, '') → « (−2) »
  const terme = (k, L) => (L ? (k < 0 ? `(${expression([[k, L]])})` : expression([[k, L]])) : P(k));

  // Des pièges : des expressions (listes de termes) différentes de la réponse et entre elles
  function piegesExpressions(bonne, pieges, combien = 3) {
    const vus = new Set([expression(bonne)]);
    const garde = [];
    RM.melanger(pieges).forEach(p => {
      const t = expression(p);
      if (t !== '0' && !vus.has(t) && garde.length < combien) { vus.add(t); garde.push(t); }
    });
    return garde;
  }

  // k(a + b) : k est un nombre (parfois négatif) ou la lettre elle-même ; la parenthèse a deux termes, dans un ordre ou dans l'autre
  // avant : un nombre écrit devant, pour « 5 − 2(x − 3) » (0 sinon)
  function produitSimple(facon) {
    const L = parmi(LETTRES);
    const p = parmi([1, 1, 2, 3, 4, 5]);
    const q = nonNul(1, 9);
    // (x(ax + b) toujours dans cet ordre : la réponse et les pièges s'écrivent alors avec x² en premier, comme une fois réduits)
    const facteur = Math.random() < 0.8 || facon === 'lettre' ? [[p, L], [q, '']] : [[q, ''], [-p, L]];
    let k;
    let avant = 0;
    if (facon === 'lettre') k = L;
    else if (facon === 'negatif') k = parmi([-1, -entier(2, 9), -entier(2, 9)]);
    else if (facon === 'soustraire') { k = entier(2, 6); avant = k + entier(1, 9); } // (avant > k : jamais « 0 × … »)
    else k = entier(2, 9);
    const fois = ([c, l]) => (k === L ? [c, l ? `${L}²` : L] : [k * c, l]);
    const dev = facteur.map(fois);
    const kTexte = k === L ? L : (k === -1 ? MOINS : ecrire(k));
    const texte = `${avant ? `${avant} ${MOINS} ` : ''}${kTexte}(${expression(facteur)})`;
    return { L, k, p, q, facteur, dev, avant, texte };
  }

  function expliquerSimple({ L, k, facteur, dev, avant, texte }) {
    const kk = k === L ? L : P(avant ? -k : k);
    const produits = facteur.map(([c, l], i) => {
      const resultat = avant ? [-dev[i][0], dev[i][1]] : dev[i];
      return `${kk} × ${terme(c, l)} = ${expression([resultat])}`;
    });
    if (avant) {
      const d = facteur.map(([c, l]) => [-k * c, l]);
      const reduit = reduireTermes([[avant, ''], ...d]);
      return `On développe d’abord (× passe avant −) : ${produits.join(' et ')}.<br>`
        + `${texte} = ${expression([[avant, ''], ...d])} = <b>${expression(reduit)}</b>.<br>`
        + `⚠️ On ne calcule pas ${avant} ${MOINS} ${k} d’abord !`;
    }
    return `On multiplie ${kk} par <b>chaque</b> terme de la parenthèse : ${produits.join(' et ')}.<br>`
      + `${texte} = <b>${expression(dev)}</b>`;
  }

  // Réduire : on regroupe les termes de même lettre (dans l'ordre x², x, nombre)
  function reduireTermes(termes) {
    const ordre = [...new Set(termes.map(([, l]) => l))].sort((u, v) => (v.endsWith('²') - u.endsWith('²')) || (v.length - u.length));
    return ordre.map(l => [termes.filter(([, m]) => m === l).reduce((s, [c]) => s + c, 0), l]);
  }

  // (ax + b)(cx + d) : les coefficients et le développement réduit
  // identite : (ax + b)(ax − b), dont les termes en x s'annulent (pour que les « Vrai » n'aient pas toujours 3 termes)
  function doubleDistributivite(identite = false) {
    const L = parmi(LETTRES);
    let a;
    let b;
    let c;
    let d;
    do {
      [a, c] = [parmi([1, 1, 1, 2, 3]), parmi([1, 1, 2, 3])];
      [b, d] = [nonNul(1, 9), nonNul(1, 9)];
    } while (a * d + b * c === 0 && Math.random() < 0.7);
    if (identite) [c, d] = [a, -b];
    const [L2, x] = [`${L}²`, L];
    return {
      L, a, b, c, d,
      texte: `(${expression([[a, x], [b, '']])})(${expression([[c, x], [d, '']])})`,
      quatre: [[a * c, L2], [a * d, x], [b * c, x], [b * d, '']],
      dev: [[a * c, L2], [a * d + b * c, x], [b * d, '']],
      // Les erreurs : oublier les « termes croisés », se tromper de signe, x × x = 2x, additionner les nombres
      pieges: [
        [[a * c, L2], [b * d, '']],
        [[a * c, L2], [a * d + b * c, x], [-b * d, '']],
        [[a * c, L2], [-(a * d + b * c), x], [b * d, '']],
        // (x × x = 2x : pas quand ce terme s'annule, il ne resterait qu'un nombre, que personne ne choisirait)
        ...(2 * a * c + a * d + b * c !== 0 ? [[[2 * a * c + a * d + b * c, x], [b * d, '']]] : []),
        [[a * c, L2], [a * d + b * c, x], [b + d, '']],
      ],
    };
  }

  function expliquerDouble({ L, texte, quatre, dev }) {
    return `Chaque terme de la 1re parenthèse multiplie chaque terme de la 2de :<br>`
      + `${texte} = ${expression(quatre)} = <b>${expression(dev)}</b>.<br>`
      + `(On réduit les deux termes en ${L} ; ${L} × ${L} = ${L}², pas 2${L}.)`;
  }

  // Une expression à réduire : 5x + 3 − 2x + 4, ou avec des x² : 3x² + 2x − x² + 5x
  // annuler : les nombres s'annulent (5x + 3 − 2x − 3 = 3x)
  function aReduire(annuler = false) {
    const L = parmi(LETTRES);
    const avecCarres = Math.random() < 0.35;
    const [l1, l2] = avecCarres ? [`${L}²`, L] : [L, ''];
    let t;
    do {
      t = [[nonNul(1, 9), l1], [nonNul(1, 9), l2], [nonNul(1, 9), l1], [nonNul(1, 9), l2]];
      if (annuler) t[3][0] = -t[1][0];
    } while (t[0][0] + t[2][0] === 0 || (t[1][0] + t[3][0] === 0 && !annuler) || t[0][0] < 0);
    const ordre = Math.random() < 0.5 ? t : [t[0], t[2], t[1], t[3]];
    const bonne = [[t[0][0] + t[2][0], l1], [t[1][0] + t[3][0], l2]];
    return {
      L, avecCarres, l1, l2,
      texte: expression(ordre),
      bonne,
      pieges: [
        [[t[0][0] + t[1][0] + t[2][0] + t[3][0], l1]], // tout ensemble : 3x + 7 → 10x
        [[t[0][0] - t[2][0], l1], [t[1][0] + t[3][0], l2]], // un signe oublié
        [[t[0][0] + t[2][0], l1], [t[1][0] - t[3][0], l2]],
        [[t[0][0] + t[1][0] + t[2][0] + t[3][0], avecCarres ? `${L}³` : `${L}²`]],
      ],
      explication: `On regroupe les termes de même sorte : ${expression([t[0], t[2]])} = ${expression([bonne[0]])} et `
        + `${expression([t[1], t[3]])} = ${expression([bonne[1]])}.<br>Donc ${expression(ordre)} = <b>${expression(bonne)}</b>.<br>`
        + (annuler ? `Les ${avecCarres ? `termes en ${L}` : 'nombres'} s’annulent : il ne reste que ${expression(bonne)}.`
          : `⚠️ ${avecCarres ? `${L}² et ${L}` : `${L} et un nombre`} ne s’ajoutent pas : ${expression(bonne)} ne se réduit plus.`),
    };
  }

  ajouterEtape({
    id: '4e-nombres-developper',
    banque: ['simple', 'simple', 'negatif', 'negatif', 'double', 'double', 'reduire', 'reduire', 'monomes',
      'complete', 'complete', 'complete', 'complete', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'simple' || sorte === 'negatif') {
        const facon = sorte === 'simple' ? parmi(['nombre', 'nombre', 'lettre']) : parmi(['negatif', 'negatif', 'soustraire']);
        const s = produitSimple(facon);
        const { L, k, facteur, dev, avant } = s;
        let bonne = dev;
        let pieges;
        if (avant) {
          // 5 − 2(x − 3) : le signe du 2e terme pas changé, (5 − 2) × (x − 3), la parenthèse oubliée
          const d = facteur.map(([c, l]) => [-k * c, l]);
          bonne = reduireTermes([[avant, ''], ...d]);
          pieges = [
            reduireTermes([[avant, ''], d[0], [-d[1][0], d[1][1]]]),
            reduireTermes(facteur.map(([c, l]) => [(avant - k) * c, l])),
            reduireTermes([[avant, ''], d[0], facteur[1]]),
            reduireTermes([[avant, ''], [-d[0][0], d[0][1]], d[1]]),
          ];
        } else if (k === L) {
          pieges = [
            [dev[0], facteur[1]], // la lettre oubliée sur le 2e terme
            [[dev[0][0] + dev[1][0], `${L}²`]],
            facteur.map(([c, l]) => [c, l ? `${L}²` : '']),
            reduireTermes(facteur.map(([c]) => [c, L])), // x × 2x = 2x (au lieu de 2x²) : 2x + 5x = 7x
          ];
        } else {
          pieges = [
            [dev[0], facteur[1]], // on n'a multiplié que le 1er terme
            [facteur[0], dev[1]],
            [dev[0], [-dev[1][0], dev[1][1]]], // une erreur de signe
            [[-dev[0][0], dev[0][1]], dev[1]],
          ];
          // additionner au lieu de multiplier : 3(x + 5) → 3x + 8
          if (facteur[1][1] === '' && k !== -1) pieges.push([dev[0], [k + facteur[1][0], '']]);
          // −(5x + 9) → 5x + 9 : le signe − oublié
          if (k === -1) pieges.push(facteur);
        }
        return choix({
          consigne: avant ? 'Développe et réduis' : 'Développe',
          enonce: `${s.texte} = ___`,
          reponse: expression(bonne),
          pieges: piegesExpressions(bonne, pieges),
          explication: expliquerSimple(s),
        });
      }
      if (sorte === 'double') {
        const q = doubleDistributivite();
        return choix({
          consigne: 'Développe et réduis',
          enonce: `${q.texte} = ___`,
          reponse: expression(q.dev),
          pieges: piegesExpressions(q.dev, q.pieges),
          explication: expliquerDouble(q),
        });
      }
      if (sorte === 'reduire') {
        const r = aReduire();
        return choix({
          consigne: 'Réduis',
          enonce: `${r.texte} = ___`,
          reponse: expression(r.bonne),
          pieges: piegesExpressions(r.bonne, r.pieges),
          explication: r.explication,
        });
      }
      if (sorte === 'monomes') {
        const L = parmi(LETTRES);
        const [p, q] = [nonNul(2, 9), entier(2, 9)];
        const deuxLettres = Math.random() < 0.6;
        const [a, b] = Math.random() < 0.5 ? [[p, L], [q, deuxLettres ? L : '']] : [[q, deuxLettres ? L : ''], [p, L]];
        const bonne = [[p * q, deuxLettres ? `${L}²` : L]];
        const facteur = t => (t[1] ? expression([t]) : ecrire(t[0]));
        return choix({
          consigne: 'Calcule',
          enonce: `${facteur(a)} × ${b[0] < 0 ? `(${facteur(b)})` : facteur(b)} = ___`,
          reponse: expression(bonne),
          pieges: piegesExpressions(bonne, deuxLettres
            ? [[[p * q, L]], [[p + q, `${L}²`]], [[p + q, L]], ...(p < 0 ? [[[-p * q, `${L}²`]]] : [])]
            : [[[p * q, `${L}²`]], [[p + q, L]], [[p * q, '']], ...(p < 0 ? [[[-p * q, L]]] : [])]),
          explication: `On multiplie les nombres entre eux et les lettres entre elles : ${ecrire(a[0])} × ${P(b[0])} = ${ecrire(p * q)}`
            + `${deuxLettres ? ` et ${L} × ${L} = ${L}²` : ''}.<br>${facteur(a)} × ${b[0] < 0 ? `(${facteur(b)})` : facteur(b)} = <b>${expression(bonne)}</b>`
            + `${deuxLettres ? `<br>⚠️ ${L} × ${L} = ${L}², pas 2${L}.` : ''}`,
        });
      }
      if (sorte === 'complete') {
        // Un coefficient du développement réduit, à écrire
        if (Math.random() < 0.6) {
          const q = doubleDistributivite();
          const [L2, x] = [`${q.L}²`, q.L];
          const possibles = [[q.dev[1][0], `le coefficient de ${x}`], [q.dev[2][0], `le nombre sans ${x}`]];
          if (q.dev[0][0] > 1) possibles.push([q.dev[0][0], `le coefficient de ${L2}`]);
          const [v, quoi] = parmi(possibles.filter(([c]) => c !== 0));
          return nombre({
            consigne: 'Développe et réduis',
            enonce: `Développe et réduis ${q.texte}. Quel est ${quoi} ?`,
            reponse: v,
            touches: TOUCHES,
            solution: `${q.texte} = ${expression(q.dev)} : ${quoi} est <b>${ecrire(v)}</b>.`,
            explication: expliquerDouble(q),
          });
        }
        const s = produitSimple(parmi(['nombre', 'negatif', 'soustraire']));
        const d = s.avant ? reduireTermes([[s.avant, ''], ...s.facteur.map(([c, l]) => [-s.k * c, l])]) : s.dev;
        const [v, quoi] = parmi(d.filter(([c]) => c !== 0).map(([c, l]) => [c, l ? `le coefficient de ${l}` : `le nombre sans ${s.L}`]));
        return nombre({
          consigne: 'Développe',
          enonce: `Développe${s.avant ? ' et réduis' : ''} ${s.texte}. Quel est ${quoi} ?`,
          reponse: v,
          touches: TOUCHES,
          solution: `${s.texte} = ${expression(d)} : ${quoi} est <b>${ecrire(v)}</b>.`,
          explication: expliquerSimple(s),
        });
      }
      // Vrai ou faux (pour tous les nombres) : un développement juste ou avec une erreur classique, ou une réduction
      const vrai = Math.random() < 0.5;
      const consigne = 'Vrai ou faux, pour tous les nombres ?';
      const genre = parmi(['simple', 'double', 'reduire']);
      if (genre === 'simple') {
        const s = produitSimple(parmi(['nombre', 'negatif']));
        const faux = parmi([[s.dev[0], s.facteur[1]], [s.dev[0], [-s.dev[1][0], s.dev[1][1]]]]);
        return vraiFaux({ consigne, enonce: `${s.texte} = ${expression(vrai ? s.dev : faux)}`, vrai, explication: expliquerSimple(s) });
      }
      if (genre === 'double') {
        const q = doubleDistributivite(vrai && Math.random() < 0.3);
        const faux = piegesExpressions(q.dev, q.pieges.slice(0, 3), 1)[0];
        return vraiFaux({ consigne, enonce: `${q.texte} = ${vrai ? expression(q.dev) : faux}`, vrai, explication: expliquerDouble(q) });
      }
      const r = aReduire(vrai && Math.random() < 0.35);
      return vraiFaux({
        consigne,
        enonce: `${r.texte} = ${vrai ? expression(r.bonne) : piegesExpressions(r.bonne, r.pieges.slice(0, 3), 1)[0]}`,
        vrai,
        explication: r.explication,
      });
    },
    titreLecon: 'Développer et réduire',
    lecon: `
      <h4>Réduire</h4>
      <p>On regroupe les termes <b>de même sorte</b> : les x² ensemble, les x ensemble, les nombres ensemble.<br>
        👉 <i>5x + 3 − 2x + 4 = 3x + 7</i> · <i>3x² + 2x − x² = 2x² + 2x</i> · <i>3x × 4x = 12x²</i></p>
      <p>⚠️ <i>3x + 7</i> ne se réduit pas (ce n’est pas 10x), et x² et x ne s’ajoutent pas. x × x = x², pas 2x.</p>
      <p>Dans <i>2x² − 5x + 3</i> : le <b>coefficient</b> de x² est 2, le coefficient de x est −5, et le nombre sans x est 3.</p>
      <h4>Développer k(a + b)</h4>
      <p>On multiplie k par <b>chaque</b> terme : <b>k(a + b) = ka + kb</b> et <b>k(a − b) = ka − kb</b>.<br>
        👉 <i>3(x + 5) = 3x + 15</i> · <i>x(2x − 1) = 2x² − x</i> · <i>−2(x − 4) = −2x + 8</i> (règle des signes : (−2) × (−4) = 8)</p>
      <p>Un signe − devant une parenthèse change tous les signes : <i>−(x − 5) = −x + 5</i>.
        Et × passe avant − : <i>5 − 2(x − 3) = 5 − 2x + 6 = −2x + 11</i>.</p>
      <h4>La double distributivité</h4>
      <p>Chaque terme de la 1re parenthèse multiplie chaque terme de la 2de : <b>(a + b)(c + d) = ac + ad + bc + bd</b>.<br>
        👉 <i>(x + 3)(x − 5) = x² − 5x + 3x − 15 = x² − 2x − 15</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dessine des flèches de chaque terme de la 1re parenthèse vers chaque terme de la 2de :
        il y a <b>4 produits</b>. Vérifie en remplaçant x par 1 : (1 + 3)(1 − 5) = −16 et 1 − 2 − 15 = −16 ✔</div>
    `,
  });

  // ======================================================================
  // 6. Les équations
  // ======================================================================
  // a × v + b écrit pour une vérification : « 3 × (−2) + 5 »
  const calculPour = (a, b, v) => `${a === 1 ? P(v) : (a === -1 ? `${MOINS}${P(v)}` : `${ecrire(a)} × ${P(v)}`)}${b ? ` ${b < 0 ? MOINS : '+'} ${Math.abs(b)}` : ''}`;
  // « On soustrait 7 » / « On ajoute 5 » (pour enlever b d'un membre)
  const enlever = b => (b > 0 ? `On soustrait ${b}` : `On ajoute ${-b}`);

  // Les pièges qui sont des nombres entiers (on enlève null et les divisions qui ne tombent pas juste)
  // (et pas trop grands : 9x − 9 = x − 33 ne peut pas donner −192)
  const entiers = liste => liste.filter(v => v !== null && Number.isInteger(v) && Math.abs(v) <= 60);

  // ax + b = c, avec une solution entière (parfois négative)
  function equationSimple() {
    for (;;) {
      const a = Math.random() < 0.1 ? 1 : nonNul(2, 9);
      const x = entier(-9, 12);
      const b = Math.random() < 0.15 ? 0 : nonNul(1, 20);
      if (x === 0 || (a === 1 && b === 0) || (a === 1 && x > 0 && b > 0)) continue;
      const c = a * x + b;
      if (Math.abs(c) > 99) continue;
      const gauche = Math.random() < 0.25 ? expression([[b, ''], [a, 'x']]) : expression([[a, 'x'], [b, '']]);
      const texte = Math.random() < 0.15 ? `${ecrire(c)} = ${gauche}` : `${gauche} = ${ecrire(c)}`;
      return { a, b, c, x, texte };
    }
  }

  function expliquerSimple1({ a, b, c, x }) {
    const etapes = [];
    if (b !== 0) etapes.push(`${enlever(b)} aux deux membres : ${expression([[a, 'x']])} = ${plusSimple(c, -b)} = ${ecrire(c - b)}.`);
    etapes.push(a === 1 ? `Donc x = <b>${ecrire(x)}</b>.` : `On divise les deux membres par ${P(a)} : x = ${ecrire(c - b)} ÷ ${P(a)} = <b>${ecrire(x)}</b>.`);
    return `${etapes.join('<br>')}<br>Vérifie : ${calculPour(a, b, x)} = ${ecrire(c)} ✔`;
  }

  // ax + b = cx + d, avec une solution entière
  function equationDouble() {
    for (;;) {
      const [a, c] = [nonNul(1, 9), nonNul(1, 9)];
      const x = entier(-8, 10);
      const b = nonNul(1, 15);
      const d = (a - c) * x + b;
      if (a === c || x === 0 || d === 0 || Math.abs(d) > 60) continue;
      return { a, b, c, d, x, k: a - c, texte: `${expression([[a, 'x'], [b, '']])} = ${expression([[c, 'x'], [d, '']])}` };
    }
  }

  function expliquerDouble2({ a, b, c, d, x, k }) {
    return `${c > 0 ? `On soustrait ${expression([[c, 'x']])}` : `On ajoute ${expression([[-c, 'x']])}`} aux deux membres : `
      + `${expression([[k, 'x'], [b, '']])} = ${ecrire(d)}.<br>`
      + (k === 1 ? `${enlever(b)} : x = <b>${ecrire(x)}</b>.<br>`
        : `${enlever(b)} : ${expression([[k, 'x']])} = ${ecrire(d - b)}. On divise par ${P(k)} : x = <b>${ecrire(x)}</b>.<br>`)
      + `Vérifie : ${calculPour(a, b, x)} = ${ecrire(a * x + b)} et ${calculPour(c, d, x)} = ${ecrire(c * x + d)} ✔`;
  }

  // Un problème à mettre en équation : { enonce, question, equation, traduction, pieges, x, unite, resolution }
  // Un piège qui a la même solution que la bonne équation serait une deuxième bonne réponse : on l'enlève
  // (ex. « 2x + 18 = 22 » et « x + 2 + 18 = 22 » ont toutes les deux x = 2).
  function problemeAMettreEnEquation() {
    for (;;) {
      const pb = unProblemeAuHasard();
      pb.pieges = pb.pieges.filter(([, solution]) => !egaux(solution, pb.x)).map(([texte]) => texte);
      if (pb.pieges.length >= 3) return pb;
    }
  }

  // Les pièges : [équation, sa solution]
  function unProblemeAuHasard() {
    const enfant = unEnfant();
    return parmi([
      () => {
        let a;
        let b;
        do { [a, b] = [entier(2, 9), entier(2, 20)]; } while (a === b);
        const x = entier(2, 15);
        const c = a * x + b;
        return {
          enonce: `Roxy pense à un nombre x. Elle le multiplie par ${a}, puis elle ajoute ${b} : elle trouve ${c}.`,
          question: 'Quel est ce nombre ?',
          equation: `${a}x + ${b} = ${c}`,
          traduction: `« Multiplier par ${a} » : ${a}x ; « puis ajouter ${b} » : ${a}x + ${b}.`,
          pieges: [[`${a}(x + ${b}) = ${c}`, c / a - b], [`${b}x + ${a} = ${c}`, (c - a) / b], [`${a}x = ${c} + ${b}`, (c + b) / a],
            [`x + ${a} + ${b} = ${c}`, c - a - b]],
          x,
          resolution: `${a}x = ${c} ${MOINS} ${b} = ${a * x}, puis x = ${a * x} ÷ ${a} = <b>${x}</b>.`,
        };
      },
      () => {
        let a;
        let b;
        do { [a, b] = [entier(2, 6), entier(2, 12)]; } while (a === b);
        const x = entier(1, 12);
        const c = a * (x + b);
        return {
          enonce: `Roxy pense à un nombre x. Elle lui ajoute ${b}, puis elle multiplie le résultat par ${a} : elle trouve ${c}.`,
          question: 'Quel est ce nombre ?',
          equation: `${a}(x + ${b}) = ${c}`,
          traduction: `« Ajouter ${b} » : x + ${b} ; « puis multiplier le résultat par ${a} » : ${a}(x + ${b}), avec des parenthèses.`,
          pieges: [[`${a}x + ${b} = ${c}`, (c - b) / a], [`${b}(x + ${a}) = ${c}`, c / b - a], [`x + ${b} × ${a} = ${c}`, c - a * b]],
          x,
          resolution: `x + ${b} = ${c} ÷ ${a} = ${x + b}, puis x = ${x + b} ${MOINS} ${b} = <b>${x}</b>.`,
        };
      },
      () => {
        let n;
        let p;
        do { [n, p] = [entier(2, 6), entier(4, 9)]; } while (n === p);
        const x = entier(2, 4);
        const T = n * x + p;
        return {
          enonce: `${enfant.nom} achète ${n} cahiers au même prix x € et une trousse à ${euros(p)}. ${enfant.Il} paie ${euros(T)} en tout.`,
          question: 'Quel est le prix d’un cahier ?',
          equation: `${n}x + ${p} = ${T}`,
          traduction: `${n} cahiers à x € coûtent ${n}x € ; avec la trousse : ${n}x + ${p}.`,
          pieges: [[`${p}x + ${n} = ${T}`, (T - n) / p], [`${n}(x + ${p}) = ${T}`, T / n - p], [`${n}x = ${T} + ${p}`, (T + p) / n]],
          x,
          unite: '€',
          resolution: `${n}x = ${T} ${MOINS} ${p} = ${n * x}, puis x = ${n * x} ÷ ${n} = <b>${x}</b> : un cahier coûte ${euros(x)}.`,
        };
      },
      () => {
        const w = entier(2, 9);
        const x = entier(w + 1, 20);
        const Pe = 2 * (x + w);
        return {
          enonce: `Un rectangle a une longueur de x cm et une largeur de ${mesure(w, 'cm')}. Son périmètre est ${mesure(Pe, 'cm')}.`,
          question: 'Quelle est sa longueur ?',
          equation: `2(x + ${w}) = ${Pe}`,
          traduction: `Le périmètre d’un rectangle, c’est 2 × (longueur + largeur) : 2(x + ${w}).`,
          pieges: [[`x + ${w} = ${Pe}`, Pe - w], [`2x + ${w} = ${Pe}`, (Pe - w) / 2], [`${w}x = ${Pe}`, Pe / w]],
          x,
          unite: 'cm',
          resolution: `x + ${w} = ${Pe} ÷ 2 = ${x + w}, puis x = ${x + w} ${MOINS} ${w} = <b>${x}</b> : la longueur est ${mesure(x, 'cm')}.`,
        };
      },
      () => {
        let k;
        let x;
        do { [k, x] = [entier(5, 7), entier(8, 14)]; } while (k * x < 55 || k * x > 85);
        const S = x + k * x;
        return {
          enonce: `${enfant.nom} a x ans. Papi a ${k} fois l’âge ${/^[AEIOUÉ]/.test(enfant.nom) ? 'd’' : 'de '}${enfant.nom}. À eux deux, ils ont ${S} ans.`,
          question: `Quel âge a ${enfant.nom} ?`,
          equation: `x + ${k}x = ${S}`,
          traduction: `Papi a ${k}x ans ; à eux deux : x + ${k}x.`,
          pieges: [[`${k}x = ${S}`, S / k], [`x + ${k} = ${S}`, S - k], [`x = ${k} × ${S}`, k * S]],
          x,
          unite: 'ans',
          resolution: `x + ${k}x = ${k + 1}x, donc ${k + 1}x = ${S} et x = ${S} ÷ ${k + 1} = <b>${x}</b> : ${enfant.nom} a ${x} ans.`,
        };
      },
    ])();
  }

  ajouterEtape({
    id: '4e-nombres-equations',
    banque: ['simple', 'simple', 'deuxCotes', 'deuxCotes', 'choixSolution', 'choixSolution', 'etape', 'etape',
      'mettre', 'mettre', 'probleme', 'vraiFaux', 'vraiFaux'],
    creerQuestion(sorte) {
      if (sorte === 'simple') {
        const e = equationSimple();
        return nombre({
          consigne: 'Résous l’équation',
          enonce: `${e.texte}<br>x = ___`,
          reponse: e.x,
          touches: TOUCHES,
          explication: expliquerSimple1(e),
        });
      }
      if (sorte === 'deuxCotes') {
        const e = equationDouble();
        return nombre({
          consigne: 'Résous l’équation',
          enonce: `${e.texte}<br>x = ___`,
          reponse: e.x,
          touches: TOUCHES,
          explication: expliquerDouble2(e),
        });
      }
      if (sorte === 'choixSolution') {
        if (Math.random() < 0.5) {
          const e = equationSimple();
          const { a, b, c, x } = e;
          return choix({
            consigne: 'Résous l’équation',
            enonce: `Quelle est la solution de ${e.texte} ?`,
            reponse: x,
            // Le signe (toujours proposé) ; b passé de l'autre côté sans changer de signe, soustraire a au lieu de diviser,
            // oublier de diviser, diviser avant d'enlever b, multiplier au lieu de diviser
            ...avecPieges(x, -x, entiers([(c + b) / a, a !== 1 ? c - b - a : null, a !== 1 ? c - b : null, c / a - b,
              Math.abs(a) > 1 ? (c - b) * a : null])),
            explication: expliquerSimple1(e),
          });
        }
        const e = equationDouble();
        const { a, b, c, d, x, k } = e;
        return choix({
          consigne: 'Résous l’équation',
          enonce: `Quelle est la solution de ${e.texte} ?`,
          reponse: x,
          // Le signe (toujours proposé) ; cx ou b passé de l'autre côté sans changer de signe, oublier de diviser,
          // multiplier au lieu de diviser, oublier le terme en x de droite
          ...avecPieges(x, -x, entiers([a + c !== 0 ? (d - b) / (a + c) : null, (d + b) / k, k !== 1 ? d - b : null,
            Math.abs(k) > 1 ? (d - b) * k : null, (d - b) / a])),
          explication: expliquerDouble2(e),
        });
      }
      if (sorte === 'etape') {
        if (Math.random() < 0.6) {
          // 3x + 7 = 19, donc 3x = 12
          let a;
          let b;
          let x;
          do { [a, b, x] = [entier(2, 9), nonNul(2, 15), entier(-6, 10)]; // (pas x = 1 ni a = x = 2 : un piège deviendrait juste, ex. 3x + 7 = 10 donne aussi 10x = 10)
          } while (x === 0 || x === 1 || (a === 2 && x === 2) || a + b === 0 || a + b === 1);
          const c = a * x + b;
          const ax = expression([[a, 'x']]);
          return choix({
            consigne: 'Résous pas à pas',
            enonce: `${expression([[a, 'x'], [b, '']])} = ${ecrire(c)}, donc ___`,
            reponse: `${ax} = ${ecrire(c - b)}`,
            pieges: [`${ax} = ${ecrire(c + b)}`, `${expression([[a + b, 'x']])} = ${ecrire(c)}`, `${expression([[1, 'x'], [b, '']])} = ${ecrire(c - a)}`],
            explication: `${enlever(b)} aux deux membres : ${ax} = ${plusSimple(c, -b)}, donc <b>${ax} = ${ecrire(c - b)}</b>.<br>`
              + `⚠️ ${ax} ${b > 0 ? '+' : MOINS} ${Math.abs(b)} ne fait pas ${expression([[a + b, 'x']])} : on ne mélange pas les x et les nombres.`,
          });
        }
        // −4x = 20, donc x = −5
        let a;
        let x;
        // (pas 2x = 4 : 4 − 2 donnerait aussi 2, et l'explication dirait « et pas 4 − 2 »)
        do { [a, x] = [nonNul(2, 9), nonNul(2, 9)]; } while ((a < 0 && Math.random() < 0.3) || (a === 2 && x === 2));
        const c = a * x;
        const candidats = [-x, c + a, ...(Math.abs(c * a) <= 150 ? [c * a] : [])].filter((v, i, t) => v !== x && v !== c - a && t.indexOf(v) === i);
        return choix({
          consigne: 'Résous pas à pas',
          enonce: `${expression([[a, 'x']])} = ${ecrire(c)}, donc ___`,
          reponse: `x = ${ecrire(x)}`,
          // c − a : l'erreur citée par l'explication, toujours proposée
          garder: [`x = ${ecrire(c - a)}`],
          pieges: candidats.map(v => `x = ${ecrire(v)}`),
          explication: `${expression([[a, 'x']])}, c’est ${P(a)} × x : on <b>divise</b> les deux membres par ${P(a)}.<br>`
            + `x = ${ecrire(c)} ÷ ${P(a)} = <b>${ecrire(x)}</b> (et pas ${ecrire(c)} ${a > 0 ? MOINS : '+'} ${Math.abs(a)}).`,
        });
      }
      if (sorte === 'mettre') {
        const pb = problemeAMettreEnEquation();
        return choix({
          consigne: 'Mets le problème en équation',
          enonce: `${pb.enonce} Quelle équation traduit ce problème ?`,
          reponse: pb.equation,
          pieges: RM.melanger(pb.pieges).slice(0, 3),
          explication: `${pb.traduction}<br>L’équation est donc <b>${pb.equation}</b> (sa solution est x = ${pb.x}).`,
        });
      }
      if (sorte === 'probleme') {
        const pb = problemeAMettreEnEquation();
        return nombre({
          consigne: 'Mets en équation, puis résous',
          enonce: `${pb.enonce} ${pb.question}`,
          reponse: pb.x,
          unite: pb.unite || '',
          prix: pb.unite === '€',
          touches: TOUCHES,
          explication: `${pb.traduction} L’équation est <b>${pb.equation}</b>.<br>${pb.resolution}`,
        });
      }
      // Vrai ou faux : tester une solution, ou une règle
      const vrai = Math.random() < 0.5;
      if (Math.random() < 0.7) {
        const deux = Math.random() < 0.5;
        const e = deux ? equationDouble() : equationSimple();
        const v = vrai ? e.x : parmi([e.x + 1, e.x - 1, -e.x]);
        const gauche = e.a * v + e.b;
        const droite = deux ? e.c * v + e.d : e.c;
        return vraiFaux({
          enonce: `${ecrire(v)} est une solution de l’équation ${e.texte}.`,
          vrai,
          explication: `Pour x = ${ecrire(v)} : ${calculPour(e.a, e.b, v)} = ${ecrire(gauche)}`
            + `${deux ? ` et ${calculPour(e.c, e.d, v)} = ${ecrire(droite)}` : ` et l’autre membre vaut ${ecrire(droite)}`}.<br>`
            + (vrai ? `Les deux membres sont égaux : <b>${ecrire(v)} est une solution</b>.`
              : `Les deux membres ne sont pas égaux : <b>${ecrire(v)} n’est pas une solution</b> (la solution est ${ecrire(e.x)}).`),
        });
      }
      const [enonce, explication] = parmi(vrai ? [
        ['Si 3x = 12, alors x = 12 ÷ 3.', '3x, c’est 3 × x : on divise les deux membres par 3, et x = 4.'],
        ['Si x + 5 = 2, alors x = −3.', 'on soustrait 5 aux deux membres : x = 2 − 5 = −3.'],
        ['Si −2x = 10, alors x = −5.', 'on divise les deux membres par −2 : x = 10 ÷ (−2) = −5.'],
      ] : [
        ['Si 3x = 12, alors x = 12 − 3.', '3x, c’est 3 × x : on divise par 3, et x = 4 (pas 9).'],
        ['Si x + 5 = 2, alors x = 7.', 'on soustrait 5 aux deux membres : x = 2 − 5 = −3.'],
        ['Si −2x = 10, alors x = 5.', 'on divise les deux membres par −2 : x = 10 ÷ (−2) = −5.'],
      ]);
      return vraiFaux({ enonce, vrai, explication: `<b>${vrai ? 'Vrai' : 'Faux'}</b> : ${explication}` });
    },
    titreLecon: 'Les équations',
    lecon: `
      <h4>Qu’est-ce qu’une équation ?</h4>
      <p><i>3x + 5 = 20</i> est une <b>équation</b> d’inconnue x. Une <b>solution</b> est une valeur de x qui rend l’égalité vraie.<br>
        👉 Tester 5 : 3 × 5 + 5 = 20 ✔, donc 5 est une solution.</p>
      <h4>Résoudre</h4>
      <p>Une équation ne change pas de solution si on <b>ajoute</b> ou <b>soustrait</b> le même nombre (ou le même terme en x)
        aux deux <b>membres</b> (les deux côtés du signe =), ou si on les <b>multiplie</b> ou les <b>divise</b> par le même nombre (pas 0).</p>
      <p>👉 <i>3x + 5 = 20</i> → 3x = 20 − 5 = 15 → x = 15 ÷ 3 = <b>5</b><br>
        👉 <i>5x − 3 = 2x + 9</i> → 5x − 2x − 3 = 9 → 3x = 9 + 3 = 12 → x = <b>4</b></p>
      <p>⚠️ 3x = 12 donne x = 12 ÷ 3 = 4 (pas 12 − 3). Et −2x = 10 donne x = 10 ÷ (−2) = −5.</p>
      <h4>Mettre en équation</h4>
      <p>On appelle x le nombre cherché, puis on traduit l’énoncé dans l’ordre :<br>
        « je multiplie x par 4, puis j’ajoute 7, je trouve 35 » → <i>4x + 7 = 35</i> ;
        « j’ajoute 7 à x, puis je multiplie par 4, je trouve 35 » → <i>4(x + 7) = 35</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> vérifie toujours ta solution en la remplaçant dans l’équation :
        les deux membres doivent être égaux !</div>
    `,
  });
})();
