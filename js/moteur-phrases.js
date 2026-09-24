// Renard Malin — le moteur des étapes « à phrases » (commun à tous les niveaux)
//
// Pour ces étapes, les phrases sont écrites à la main dans une banque, avec ___ à la place
// du mot à trouver. Le moteur pioche dans la banque sans répéter et fabrique trois types
// de questions : choisir le bon mot, l'écrire, ou dire si la phrase est bien écrite.
// La grammaire et le vocabulaire s'en servent aussi, avec des mots soulignés à classer.

(function () {
  const avecTrou = phrase => phrase.replace('___', '<span class="trou">?</span>');
  const avecMot = (phrase, mot, classe) =>
    phrase.replace('___', classe ? `<span class="${classe}">${mot}</span>` : `<b>${mot}</b>`);
  const indice = mot => ` <span class="indice">(${mot})</span>`;

  // Genre et nombre, écrits en deux lettres : ms, fs, mp, fp (masculin/féminin, singulier/pluriel)
  const CASES = { ms: 0, fs: 1, mp: 2, fp: 3 };
  const GENRES = { m: 'masculin', f: 'féminin' };
  const NOMBRES = { s: 'singulier', p: 'pluriel' };
  const genreNombre = cas => `${GENRES[cas[0]]} ${NOMBRES[cas[1]]}`;

  // Accorder un participe passé ou un adjectif selon le cas (ms, fs, mp, fp) :
  // + e au féminin, + s au pluriel… sauf au masculin pluriel s'il finit déjà par s (pris → pris)
  function accorderCas(mot, cas) {
    const feminin = cas[0] === 'f';
    const pluriel = cas[1] === 'p';
    return mot + (feminin ? 'e' : '') + (pluriel && !(!feminin && mot.endsWith('s')) ? 's' : '');
  }
  const quatreFormes = mot => [...new Set(['ms', 'fs', 'mp', 'fp'].map(cas => accorderCas(mot, cas)))];

  // Tire un type de question selon les proportions voulues, ex. { choix: 0.7, vraifaux: 0.3 }
  function tirerType(proportions) {
    let tirage = Math.random();
    for (const [type, part] of Object.entries(proportions)) {
      if ((tirage -= part) < 0) return type;
    }
    return 'choix';
  }

  // Fabrique la question d'un des trois types, à partir d'une phrase avec ___
  function fabriquer(type, {
    phrase, reponse, choix, mauvais, explication, aide = '', consigneChoix, consigneEcrire,
    consigneVraiFaux = 'Cette phrase est-elle bien écrite ?',
  }) {
    const commun = { reponse, solution: avecMot(phrase, reponse), explication };
    if (type === 'ecrire') {
      return { ...commun, type, consigne: consigneEcrire, enonce: avecTrou(phrase) + aide };
    }
    if (type === 'vraifaux') {
      const bienEcrite = Math.random() < 0.5;
      return {
        ...commun,
        type,
        consigne: consigneVraiFaux,
        enonce: avecMot(phrase, bienEcrite ? reponse : RM.hasard(mauvais), 'mot-teste'),
        choix: ['Vrai', 'Faux'],
        reponse: bienEcrite ? 'Vrai' : 'Faux',
      };
    }
    return { ...commun, type: 'choix', consigne: consigneChoix, enonce: avecTrou(phrase) + aide, choix };
  }

  // Prépare une étape : on pioche dans la banque de phrases sans les répéter
  // (categories : pour les étapes « à classer », la liste des catégories, utile pour les vérifier)
  function creerEtape({ id, banque, creerQuestion, titreLecon, lecon, categories }) {
    return {
      id,
      titreLecon,
      lecon,
      categories,
      creerQuestions(nombre) {
        let pioche = [];
        const questions = [];
        while (questions.length < nombre) {
          if (pioche.length === 0) pioche = RM.melanger(banque);
          questions.push(creerQuestion(pioche.pop()));
        }
        return questions;
      },
    };
  }
  const ajouterEtape = def => RM.etapes.push(creerEtape(def));

  // ---------- Les homophones : des mots qui se prononcent pareil ----------
  // L'astuce de Roxy : on remplace le mot par un autre, et on regarde si la phrase a du sens.
  function expliquerHomophone(def, phrase, reponse) {
    const essai = mot => `<i>${phrase.replace('___', `<u>${mot}</u>`)}</i>`;
    let html = `Remplace par « ${def.test} » : ${essai(def.test)}<br>`;
    if (reponse === def.motTeste) return html + `✔ Ça marche ! ${def.verdicts[reponse]}`;
    html += '✘ Ça ne veut rien dire ! ';
    if (def.autreTest) html += `Essaie plutôt « ${def.autreTest} » : ${essai(def.autreTest)} ✔<br>`;
    return html + def.verdicts[reponse];
  }

  // def.phrases : { reponse: [phrase, …] } ou { reponse: [[phrase, extra], …] }
  // def.choix : la liste des mots proposés (ou une fonction qui la donne selon la réponse)
  function ajouterHomophones(def) {
    const banque = Object.entries(def.phrases).flatMap(([reponse, liste]) => liste.map(entree => {
      const [phrase, extra] = Array.isArray(entree) ? entree : [entree];
      return { phrase, reponse, extra };
    }));
    ajouterEtape({
      id: def.id,
      banque,
      titreLecon: def.titreLecon,
      lecon: def.lecon,
      creerQuestion: ({ phrase, reponse, extra }) => {
        const choix = typeof def.choix === 'function' ? def.choix(reponse) : def.choix;
        return fabriquer(tirerType(def.proportions || { choix: 0.7, vraifaux: 0.3 }), {
          phrase,
          reponse,
          choix,
          mauvais: choix.filter(mot => mot !== reponse),
          explication: def.expliquer ? def.expliquer(phrase, reponse, extra) : expliquerHomophone(def, phrase, reponse),
          consigneChoix: 'Choisis le bon mot',
          consigneEcrire: 'Écris le bon mot',
        });
      },
    });
  }

  // ---------- La grammaire et le vocabulaire ----------
  // Dans les banques, le mot ou le groupe à observer est écrit entre [[ et ]] : il sera souligné.
  const souligner = texte => texte.replace(/\[\[(.+?)\]\]/g, '<span class="souligne">$1</span>');
  const groupeSouligne = texte => (texte.match(/\[\[(.+?)\]\]/) || [])[1];

  // Une question toute simple : un énoncé, la bonne réponse et les pièges.
  // L'énoncé peut contenir [[…]] (souligné) ou ___ (un trou à remplir).
  // choix : pour garder les boutons dans un ordre fixe (sinon, on mélange réponse et pièges)
  // acceptees : d'autres réponses justes, quand on écrit la réponse
  function question({ type = 'choix', consigne, enonce, reponse, pieges = [], choix, explication, solution, acceptees }) {
    const trou = enonce.includes('___');
    const q = {
      type,
      consigne,
      enonce: souligner(trou ? avecTrou(enonce) : enonce),
      reponse,
      solution: solution || (trou ? souligner(avecMot(enonce, reponse)) : `<b>${reponse}</b>`),
      explication,
    };
    if (acceptees) q.acceptees = acceptees;
    if (type === 'choix') q.choix = choix || RM.melanger([reponse, ...pieges]);
    return q;
  }

  // Classer : « Quelle est la nature du mot souligné ? » → nom, verbe, adjectif…
  // def.categories : { cle: { nom: 'adjectif', regle: 'la règle, en une phrase' } }, dans l'ordre des boutons
  // def.banque : [texte (avec [[…]] autour du mot à observer), cle, remarque facultative]
  // def.consigne : la question ; « {mot} » y devient « mot » ou « groupe » selon ce qui est souligné
  // def.nombreChoix : le nombre de boutons (4 par défaut) ; def.choixPossibles(cle) : les clés à proposer
  // def.toujoursProposer(cle) (facultatif) : les clés à proposer à coup sûr avec cette réponse (les pièges « jumeaux »)
  // def.montrerSouligne(groupe, cle) (facultatif) : comment écrire la partie soulignée dans la solution (ex. « in- »)
  function ajouterClassement(def) {
    const cles = Object.keys(def.categories);
    ajouterEtape({
      id: def.id,
      banque: def.banque,
      titreLecon: def.titreLecon,
      lecon: def.lecon,
      categories: cles.map(c => def.categories[c].nom),
      creerQuestion([texte, cle, remarque]) {
        const categorie = def.categories[cle];
        const possibles = def.choixPossibles ? def.choixPossibles(cle) : cles;
        // Les « jumeaux » (ex. épithète ↔ attribut) sont toujours proposés : ce sont les pièges qui font réfléchir
        const jumeaux = (def.toujoursProposer ? def.toujoursProposer(cle) : [])
          .filter(c => c !== cle && possibles.includes(c));
        const autres = [...RM.melanger(jumeaux), ...RM.melanger(possibles.filter(c => c !== cle && !jumeaux.includes(c)))]
          .slice(0, (def.nombreChoix || 4) - 1);
        const groupe = groupeSouligne(texte);
        // « l’arbre » est un groupe, mais « l’ » tout seul est un mot
        const estUnGroupe = groupe && (/\s/.test(groupe) || /[’'][a-zà-ÿœ]/i.test(groupe));
        return question({
          consigne: def.consigne.replace('{mot}', estUnGroupe ? 'groupe' : 'mot'),
          enonce: texte,
          reponse: categorie.nom,
          // Les boutons restent dans l'ordre de la leçon : c'est plus facile de s'y retrouver
          choix: possibles.filter(c => c === cle || autres.includes(c)).map(c => def.categories[c].nom),
          solution: (groupe ? `« ${def.montrerSouligne ? def.montrerSouligne(groupe, cle) : groupe} » : ` : '')
            + `<b>${categorie.nom}</b>`,
          explication: [remarque, categorie.regle].filter(Boolean).join('<br>'),
        });
      },
    });
  }

  RM.phrases = {
    avecTrou, avecMot, indice, CASES, GENRES, NOMBRES, genreNombre, accorderCas, quatreFormes,
    tirerType, fabriquer, creerEtape, ajouterEtape, expliquerHomophone, ajouterHomophones,
    souligner, groupeSouligne, question, ajouterClassement,
  };
})();
