// Renard Malin — le moteur de quiz
// Il affiche les questions une par une, vérifie les réponses et compte les points.
// Il marche pour toutes les étapes : il ne connaît pas le français, il suit juste les questions.

(function () {
  const POINTS_PAR_BONNE_REPONSE = 10;
  const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Trop fort !', 'Parfait !', 'Excellent !', 'Bien joué !'];
  const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ô'];
  const ETIQUETTES = { Vrai: '✔ Vrai', Faux: '✘ Faux' };

  const $ = id => document.getElementById(id);
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

  function afficherQuestion() {
    const q = partie.questions[partie.index];
    partie.repondu = false;
    $('quiz-numero').textContent = `Question ${partie.index + 1} / ${partie.nombre}`;
    $('quiz-barre').style.width = (partie.index / partie.nombre * 100) + '%';
    $('quiz-points').textContent = '✨ ' + partie.points;
    $('quiz-consigne').textContent = q.consigne;
    $('quiz-enonce').innerHTML = q.enonce;
    // Un long texte (une définition, un extrait) s'écrit un peu plus petit
    $('quiz-enonce').classList.toggle('enonce-long', $('quiz-enonce').textContent.length > 90);
    $('quiz-retour').hidden = true;
    $('quiz-suivant').hidden = true;

    const zone = $('quiz-reponse');
    zone.innerHTML = '';
    if (q.type === 'ecrire') construireSaisie(zone);
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
      bouton.textContent = ETIQUETTES[valeur] || valeur;
      bouton.dataset.valeur = valeur;
      bouton.addEventListener('click', () => verifier(valeur));
      grille.appendChild(bouton);
    });
    zone.appendChild(grille);
  }

  // Une case pour écrire, avec des boutons d'accents (pénibles à taper sur iPad)
  function construireSaisie(zone) {
    zone.innerHTML = `
      <form class="saisie" id="saisie-formulaire">
        <input id="saisie" type="text" autocomplete="off" autocorrect="off" autocapitalize="off"
               spellcheck="false" enterkeyhint="done" placeholder="Écris ta réponse" aria-label="Ta réponse">
        <button class="bouton bouton-principal" type="submit">Valider</button>
      </form>
      <div class="accents">
        ${ACCENTS.map(a => `<button type="button" class="bouton-accent">${a}</button>`).join('')}
      </div>`;
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
    // Quand on écrit, il peut y avoir plusieurs bonnes réponses (ex. deux synonymes)
    const attendues = [q.reponse, ...(q.acceptees || [])].map(nettoyer);
    const juste = ecrite ? attendues.includes(nettoyer(valeur)) : valeur === q.reponse;

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
    const trou = document.querySelector('#quiz-enonce .trou');
    if (trou) {
      trou.textContent = q.reponse;
      trou.classList.add('rempli');
    }

    if (juste) {
      partie.bonnes++;
      partie.points += POINTS_PAR_BONNE_REPONSE;
    }
    const presque = ecrite && !juste && attendues.some(r => sansAccents(r) === sansAccents(nettoyer(valeur)));
    montrerRetour(q, juste, presque);
  }

  // Roxy réagit : elle saute de joie, ou elle explique la règle
  function montrerRetour(q, juste, presque) {
    const retour = $('quiz-retour');
    const roxy = $('retour-roxy');
    if (juste) {
      roxy.src = 'img/roxy-ouais.png';
      $('retour-bulle').innerHTML =
        `<p class="bulle-titre">${RM.hasard(BRAVOS)} <span class="gain">+${POINTS_PAR_BONNE_REPONSE} ✨</span></p>`;
    } else {
      roxy.src = 'img/roxy-reflechit.png';
      $('retour-bulle').innerHTML = `
        <p class="bulle-titre">${presque ? 'Presque ! Attention aux accents.' : 'Oups, pas tout à fait…'}</p>
        <p class="solution">La bonne réponse : ${q.solution}</p>
        <div class="explication">${q.explication}</div>`;
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

  $('quiz-aide').addEventListener('click', () => RM.ouvrirAide(partie.etape));
})();
