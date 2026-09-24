// Renard Malin — le moteur des étapes « à phrases » (commun à tous les niveaux)
//
// Pour ces étapes, les phrases sont écrites à la main dans une banque, avec ___ à la place
// du mot à trouver. Le moteur pioche dans la banque sans répéter et fabrique trois types
// de questions : choisir le bon mot, l'écrire, ou dire si la phrase est bien écrite.

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
  function creerEtape({ id, banque, creerQuestion, titreLecon, lecon }) {
    return {
      id,
      titreLecon,
      lecon,
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

  RM.phrases = {
    avecTrou, avecMot, indice, CASES, GENRES, NOMBRES, genreNombre, accorderCas, quatreFormes,
    tirerType, fabriquer, creerEtape, ajouterEtape, expliquerHomophone, ajouterHomophones,
  };
})();
