// Renard Malin — le moteur de quiz
// Il affiche les questions une par une, vérifie les réponses et compte les points.
// Il marche pour toutes les étapes : il ne connaît pas le français, il suit juste les questions.

(function () {
  const POINTS_PAR_BONNE_REPONSE = 10;
  const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Trop fort !', 'Parfait !', 'Excellent !', 'Bien joué !'];
  const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ô'];
  const ETIQUETTES = { Vrai: '✔ Vrai', Faux: '✘ Faux' };

  const $ = id => document.getElementById(id);
  const P = RM.progression;
  let partie = null;

  RM.lancerPartie = function (etape, nombre) {
    partie = {
      etape,
      nombre,
      questions: etape.creerQuestions(nombre),
      index: 0,
      bonnes: 0,
      points: 0,
      repondu: false,
      debut: Date.now(), // pour compter le temps de jeu
    };
    RM.afficherEcran('quiz');
    afficherQuestion();
  };

  // Une partie spéciale (le défi du jour, le carnet de Roxy) : des questions de plusieurs étapes.
  // Chaque question sait de quelle étape elle vient (q.etape), pour l'aide et le carnet.
  RM.lancerPartieSpeciale = function ({ special, titre, questions }) {
    partie = {
      etape: null,
      special,
      titre,
      nombre: questions.length,
      questions,
      index: 0,
      bonnes: 0,
      points: 0,
      repondu: false,
      debut: Date.now(),
      resultatsEtapes: {}, // pour le carnet : chaque étape revue est-elle réussie ?
    };
    RM.afficherEcran('quiz');
    afficherQuestion();
  };

  const etapeDe = q => q.etape || partie.etape;

  function afficherQuestion() {
    const q = partie.questions[partie.index];
    partie.repondu = false;
    RM.voix.arreter();
    $('quiz-numero').textContent = (partie.special ? partie.titre + ' · ' : '') + `Question ${partie.index + 1} / ${partie.nombre}`;
    // Dans une partie spéciale, on rappelle d'où vient la question
    const origine = $('quiz-origine');
    origine.hidden = !partie.special;
    if (partie.special) {
      const etape = etapeDe(q);
      const matiere = RM.MATIERES.find(m => m.id === etape.zone.matiere);
      origine.textContent = `${matiere ? matiere.icone : etape.zone.icone} ${etape.titre}`;
    }
    $('quiz-barre').style.width = (partie.index / partie.nombre * 100) + '%';
    $('quiz-points').textContent = '✨ ' + partie.points;
    $('quiz-consigne').textContent = RM.insecables(q.consigne);
    $('quiz-enonce').innerHTML = RM.insecables(q.enonce);
    // Un long texte (une définition, un extrait) s'écrit un peu plus petit (le texte des figures ne compte pas)
    const longueurFigures = [...$('quiz-enonce').querySelectorAll('svg')].reduce((l, svg) => l + svg.textContent.length, 0);
    $('quiz-enonce').classList.toggle('enonce-long', $('quiz-enonce').textContent.length - longueurFigures > 90);
    $('quiz-retour').hidden = true;
    $('quiz-suivant').hidden = true;

    const zone = $('quiz-reponse');
    zone.innerHTML = '';
    if (q.type === 'ecrire') construireSaisie(zone, q);
    else construireChoix(zone, q);
    window.scrollTo(0, 0);
  }

  // Des gros boutons à toucher
  function construireChoix(zone, q) {
    const grille = document.createElement('div');
    grille.className = 'grille-choix';
    // Des réponses longues (des définitions) : une seule colonne, en plus petit
    if (q.choix.some(valeur => valeur.length > 20)) grille.classList.add('choix-longs');
    q.choix.forEach(valeur => {
      const bouton = document.createElement('button');
      bouton.className = 'bouton-choix';
      // En maths, une fraction s'écrit l'une au-dessus de l'autre (q.etiquettes donne le HTML du bouton)
      if (q.etiquettes?.[valeur]) bouton.innerHTML = q.etiquettes[valeur];
      else bouton.textContent = ETIQUETTES[valeur] || valeur;
      bouton.dataset.valeur = valeur;
      bouton.addEventListener('click', () => verifier(valeur));
      grille.appendChild(bouton);
    });
    zone.appendChild(grille);
  }

  // Une case pour écrire, avec des boutons d'accents (pénibles à taper sur iPad).
  // En maths (q.saisie) : le clavier des chiffres, l'unité à côté de la case, et les touches − , /
  function construireSaisie(zone, q) {
    const maths = Boolean(q.saisie);
    const touches = maths ? (q.touches || []) : ACCENTS;
    zone.innerHTML = `
      <form class="saisie" id="saisie-formulaire">
        <div class="saisie-case">
          <input id="saisie" type="text" autocomplete="off" autocorrect="off" autocapitalize="off"
                 spellcheck="false" enterkeyhint="done" aria-label="Ta réponse"
                 inputmode="${q.saisie === 'nombre' ? 'decimal' : 'text'}"
                 placeholder="${maths ? (q.saisie === 'fraction' ? 'ex. 3/4' : 'Ta réponse') : 'Écris ta réponse'}">
          ${q.unite ? `<span class="saisie-unite">${q.unite}</span>` : ''}
        </div>
        <button class="bouton bouton-principal" type="submit">Valider</button>
      </form>
      ${touches.length ? `<div class="accents">
        ${touches.map(a => `<button type="button" class="bouton-accent">${a}</button>`).join('')}
      </div>` : ''}`;
    const champ = $('saisie');
    zone.querySelectorAll('.bouton-accent').forEach(bouton => {
      bouton.addEventListener('mousedown', e => e.preventDefault()); // garde le clavier ouvert
      bouton.addEventListener('click', () => {
        const debut = champ.selectionStart ?? champ.value.length;
        const fin = champ.selectionEnd ?? champ.value.length;
        champ.setRangeText(bouton.textContent, debut, fin, 'end');
        champ.focus();
      });
    });
    $('saisie-formulaire').addEventListener('submit', e => {
      e.preventDefault();
      if (champ.value.trim()) verifier(champ.value);
    });
    champ.focus();
  }

  // Majuscules, espaces en trop, « ! » final et pronom tapé en plus ne comptent pas comme des fautes
  function nettoyer(texte) {
    return texte.toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\s*[!.?]+\s*$/, '')
      .trim()
      .replace(/^(que |qu')/, '')
      .replace(/^(je |j'|tu |il |elle |on |nous |vous |ils |elles )/, '')
      .trim();
  }

  const sansAccents = texte => texte.normalize('NFD').replace(/[̀-ͯ]/g, '');

  function verifier(valeur) {
    if (partie.repondu) return;
    partie.repondu = true;
    const q = partie.questions[partie.index];
    const ecrite = q.type === 'ecrire';
    // Quand on écrit, il peut y avoir plusieurs bonnes réponses (ex. deux synonymes).
    // En maths, la question sait elle-même comparer (3,5 = 3.5 = 3,50) : q.comparer
    const attendues = [q.reponse, ...(q.acceptees || [])].map(nettoyer);
    let juste = valeur === q.reponse;
    if (ecrite) juste = q.comparer ? q.comparer(valeur) : attendues.includes(nettoyer(valeur));

    // On fige la zone de réponse et on colorie
    if (ecrite) {
      const champ = $('saisie');
      champ.disabled = true;
      champ.classList.add(juste ? 'juste' : 'faux');
      champ.blur();
      document.querySelectorAll('#quiz-reponse button').forEach(b => { b.disabled = true; });
    } else {
      document.querySelectorAll('.bouton-choix').forEach(b => {
        b.disabled = true;
        if (b.dataset.valeur === q.reponse) b.classList.add('juste');
        else if (b.dataset.valeur === valeur) b.classList.add('faux');
      });
    }

    // Le « ? » de la phrase se remplit avec le bon mot
    RM.sons.jouer(juste ? 'juste' : 'faux');
    // Le carnet de Roxy : une erreur y range l'étape ; pendant une révision du carnet, on note si l'étape est réussie
    const etape = etapeDe(q);
    if (partie.special === 'carnet') {
      partie.resultatsEtapes[etape.id] = (partie.resultatsEtapes[etape.id] ?? true) && juste;
    } else if (!juste) {
      P.noterErreur(etape.id);
    }

    const trou = document.querySelector('#quiz-enonce .trou');
    if (trou) {
      if (q.etiquettes?.[q.reponse]) trou.innerHTML = q.etiquettes[q.reponse];
      else trou.textContent = q.reponse;
      trou.classList.add('rempli');
    }

    if (juste) {
      partie.bonnes++;
      partie.points += POINTS_PAR_BONNE_REPONSE;
    }
    // Presque : les accents oubliés (en français), la virgule mal placée ou le signe oublié (en maths)
    let presque = '';
    if (ecrite && !juste) {
      if (q.presque) presque = q.presque(valeur);
      else if (attendues.some(r => sansAccents(r) === sansAccents(nettoyer(valeur)))) presque = 'Presque ! Attention aux accents.';
    }
    montrerRetour(q, juste, presque);
    ajouterSignalement(q, valeur);
  }

  // Sous la bulle de Roxy, un petit lien pour signaler une erreur par mail, avec la question déjà recopiée
  // (jamais le prénom de l'enfant). Caché tant qu'il n'y a pas d'adresse de contact dans RM.EDITEUR.
  function ajouterSignalement(q, valeur) {
    const etape = etapeDe(q);
    const lien = RM.lienSignalement(`Renard Malin : une erreur dans « ${etape.titre} » ?`, [
      `Étape : ${etape.titre} (${etape.id})`,
      `Consigne : ${RM.texteSeul(q.consigne)}`,
      `Question : ${$('quiz-enonce').textContent.replace(/\s+/g, ' ').trim().slice(0, 400)}`,
      `Réponse donnée : ${valeur}`,
      `Réponse de l’appli : ${RM.texteSeul(q.solution || q.reponse)}`,
      '',
      'Qu’est-ce qui ne va pas ?',
      '',
    ].join('\n'));
    if (!lien) return;
    $('retour-bulle').insertAdjacentHTML('beforeend',
      `<a class="lien-signaler" href="${RM.echapper(lien)}">🚩 Une erreur dans cette question&nbsp;?</a>`);
  }

  // Roxy réagit : elle saute de joie, ou elle explique la règle
  function montrerRetour(q, juste, presque) {
    const retour = $('quiz-retour');
    if (juste) {
      RM.poserRoxy('retour-roxy', 'ouais');
      $('retour-bulle').innerHTML =
        `<p class="bulle-titre">${RM.hasard(BRAVOS)} <span class="gain">+${POINTS_PAR_BONNE_REPONSE} ✨</span></p>`;
    } else {
      RM.poserRoxy('retour-roxy', 'reflechit');
      $('retour-bulle').innerHTML = `
        <p class="bulle-titre">${presque || 'Oups, pas tout à fait…'}</p>
        <p class="solution">La bonne réponse&nbsp;: ${RM.insecables(q.solution)}</p>
        <div class="explication">${RM.insecables(q.explication)}</div>`;
    }
    retour.className = 'retour ' + (juste ? 'juste' : 'faux');
    retour.hidden = false;

    const derniere = partie.index === partie.nombre - 1;
    const suivant = $('quiz-suivant');
    suivant.textContent = derniere ? 'Voir mon résultat 🏆' : 'Suivant →';
    suivant.hidden = false;
    $('quiz-points').textContent = '✨ ' + partie.points;
    $('quiz-barre').style.width = ((partie.index + 1) / partie.nombre * 100) + '%';
    suivant.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function questionSuivante() {
    if (!partie.repondu) return;
    partie.index++;
    if (partie.index < partie.nombre) afficherQuestion();
    else RM.terminerPartie(partie);
  }

  $('quiz-suivant').addEventListener('click', questionSuivante);

  // Sur ordinateur : la touche Entrée passe à la question suivante
  document.addEventListener('keydown', e => {
    const quizVisible = $('ecran-quiz').classList.contains('actif');
    if (e.key === 'Enter' && quizVisible && partie?.repondu && $('aide').hidden) {
      e.preventDefault();
      questionSuivante();
    }
  });

  $('quiz-quitter').addEventListener('click', () => {
    if (confirm('Tu veux vraiment arrêter la partie ? Tes points de cette partie seront perdus.')) {
      RM.afficherEcran('carte');
    }
  });

  $('quiz-aide').addEventListener('click', () => RM.ouvrirAide(etapeDe(partie.questions[partie.index])));

  // 🗣️ Roxy lit la question (et les réponses possibles) ; après la réponse, elle lit son explication
  $('quiz-ecouter').hidden = !RM.voix.disponible;
  $('quiz-ecouter').addEventListener('click', () => {
    const q = partie.questions[partie.index];
    if (partie.repondu) {
      RM.voix.lire([$('retour-bulle').innerHTML], $('quiz-ecouter'));
      return;
    }
    const reponses = q.type === 'ecrire' ? '' : 'Réponses possibles : '
      + [...document.querySelectorAll('.bouton-choix')].map(b => RM.voix.aLire(b.innerHTML)).join(' ; ');
    RM.voix.lire([q.consigne, $('quiz-enonce').innerHTML, reponses], $('quiz-ecouter'));
  });
})();
