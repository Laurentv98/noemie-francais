// Renard Malin — les écrans, les étoiles et la fin de partie

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // ---------- Changer d'écran ----------
  RM.afficherEcran = function (nom) {
    // Pas de carte (ni de niveau) sans joueur : on passe d'abord par « Qui joue ? »
    if ((nom === 'carte' || nom === 'niveau') && !P.profilActif()) nom = 'profils';
    // Changer d'écran : Roxy se tait et les sons prévus sont annulés
    RM.voix.arreter();
    RM.sons.annuler();
    document.querySelectorAll('.ecran').forEach(ecran => {
      ecran.classList.toggle('actif', ecran.id === 'ecran-' + nom);
    });
    window.scrollTo(0, 0);
    // On prépare l'écran une fois visible : la carte a besoin de connaître sa largeur
    RM.ecrans[nom]?.();
    // Roxy porte ses accessoires sur tous les écrans
    RM.habillerToutesLesRoxy();
  };

  document.addEventListener('click', e => {
    const bouton = e.target.closest('[data-aller]');
    if (bouton) RM.afficherEcran(bouton.dataset.aller);
  });

  $('accueil-commencer').addEventListener('click', () => RM.commencer());

  // ---------- Les étoiles ----------
  // 1 étoile par tranche de 20 % de bonnes réponses.
  // La 5e, l'étoile d'or, n'arrive qu'avec 100 % : zéro faute !
  function htmlEtoiles(nombre, classe) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const gagnee = i <= nombre ? ' gagnee' : '';
      const or = i === 5 ? ' or' : '';
      html += `<span class="etoile${gagnee}${or}">★</span>`;
    }
    return `<span class="${classe}" aria-label="${nombre} étoile${nombre > 1 ? 's' : ''} sur 5">${html}</span>`;
  }

  // ---------- Choisir le nombre de questions ----------
  let etapeChoisie = null;

  RM.choisirDuree = function (etape) {
    etapeChoisie = etape;
    $('duree-titre').textContent = etape.zone.icone + ' ' + etape.titre;
    $('duree-sous-titre').textContent = etape.sousTitre;
    RM.afficherEcran('duree');
  };

  document.querySelectorAll('[data-duree]').forEach(bouton => {
    bouton.addEventListener('click', () => RM.lancerPartie(etapeChoisie, Number(bouton.dataset.duree)));
  });

  // ---------- Fin de partie ----------
  const MESSAGES = [
    p => `Pas grave ${p}, on apprend en se trompant ! Relis la leçon avec le bouton 💡 Aide, puis réessaie.`,
    p => `C’est un début, ${p} ! Relis la leçon avec le bouton 💡 Aide et retente ta chance.`,
    p => `Tu progresses, ${p} ! Encore un petit effort.`,
    p => `Bien joué, ${p} ! Tu connais bien ta leçon.`,
    p => `Super, ${p} ! Plus qu’une étoile pour décrocher l’étoile d’or !`,
    p => `ZÉRO FAUTE, ${p} ! Tu as gagné l’étoile d’or ! 🌟`,
  ];

  let dernierePartie = null;

  RM.terminerPartie = function (partie) {
    dernierePartie = partie;
    if (partie.special) return terminerPartieSpeciale(partie);
    const foret = partie.etape.zone.foret;
    const courseFermee = !RM.course.estOuverte(P.profilActif(), foret);
    const avant = RM.dressing.gagnes(P.profilActif());
    const { etoiles, record, ancienMeilleur, flamme } = P.enregistrerPartie(partie);
    const cadeaux = RM.dressing.gagnes(P.profilActif()).filter(id => !avant.includes(id));
    const prenom = RM.echapper(P.profilActif().prenom);

    // Est-ce que cette partie ouvre l'étape suivante du chemin ?
    const seuil = P.ETOILES_POUR_DEBLOQUER;
    const suivante = partie.etape.zone.etapes[partie.etape.index + 1];
    let deblocage = '';
    if (suivante && ancienMeilleur < seuil && etoiles >= seuil) {
      RM.nouvelleEtape = suivante.id;
      const enTravaux = typeof suivante.creerQuestions === 'function' ? '' : '<br><small>(Roxy la prépare encore 🚧)</small>';
      deblocage = `<span class="deblocage">🔓 Nouvelle étape débloquée&nbsp;: ${suivante.titre}&nbsp;!${enTravaux}</span>`;
    } else if (suivante && Math.max(ancienMeilleur, etoiles) < seuil) {
      deblocage = `<span class="indice-deblocage">Il faut ${seuil} étoiles pour ouvrir l’étape suivante.</span>`;
    }

    // Assez d'étoiles dans la forêt : la course de Roxy s'ouvre !
    if (courseFermee && RM.course.estOuverte(P.profilActif(), foret)) {
      deblocage += '<span class="deblocage">🏁 La course de Roxy est ouverte, tout en bas de la forêt&nbsp;!</span>';
    }

    const pluriel = partie.bonnes > 1 ? 's' : '';
    $('resultat-rejouer').hidden = false;
    RM.poserRoxy('resultat-roxy', etoiles >= 3 ? 'ouais' : 'reflechit');
    $('resultat-etoiles').innerHTML = htmlEtoiles(etoiles, 'etoiles-grandes');
    $('resultat-score').innerHTML =
      `<b>${partie.bonnes}</b> bonne${pluriel} réponse${pluriel} sur ${partie.nombre} · <b>+${partie.points}</b> ✨`;
    $('resultat-message').innerHTML = MESSAGES[etoiles](prenom)
      + (record ? '<span class="record">🎉 Nouveau record !</span>' : '')
      + deblocage
      + RM.dressing.htmlCadeaux(cadeaux);
    $('resultat-flamme').innerHTML = RM.htmlFlammeResultat(flamme);
    RM.afficherEcran('resultats');
    jouerSonsDeFin({ etoiles, deblocage: Boolean(RM.nouvelleEtape), flamme, cadeaux });
    if (etoiles === 5) lancerConfettis();
  };

  // Les sons de l'écran de fin : une note par étoile, puis la fanfare, la magie, la flamme, le cadeau
  function jouerSonsDeFin({ etoiles, deblocage, flamme, cadeaux, parfait = etoiles === 5 }) {
    const plus = RM.sons.plusTard;
    let t = 250;
    for (let i = 1; i <= etoiles; i++, t += 220) plus(t, 'etoile', i);
    if (parfait) { plus(t, 'fanfare'); t += 1100; }
    if (deblocage) { plus(t, 'magie'); t += 600; }
    if (flamme?.grandi) { plus(t, 'flamme'); t += 600; }
    if (cadeaux.length) plus(t, 'cadeau');
  }

  // ---------- Fin du défi du jour ou d'une révision du carnet ----------
  function terminerPartieSpeciale(partie) {
    const profil = P.profilActif();
    const avant = RM.dressing.gagnes(profil);
    const { flamme } = P.enregistrerPartieSpeciale(partie);
    const sorties = partie.special === 'carnet' ? P.reviserCarnet(partie.resultatsEtapes) : [];
    const cadeaux = RM.dressing.gagnes(profil).filter(id => !avant.includes(id));
    const parfait = partie.bonnes === partie.nombre;
    const pluriel = partie.bonnes > 1 ? 's' : '';

    RM.poserRoxy('resultat-roxy', partie.bonnes * 2 >= partie.nombre ? 'ouais' : 'reflechit');
    $('resultat-etoiles').innerHTML = `<span class="resultat-special">${partie.titre}</span>`;
    $('resultat-score').innerHTML =
      `<b>${partie.bonnes}</b> bonne${pluriel} réponse${pluriel} sur ${partie.nombre} · <b>+${partie.points}</b> ✨`;
    $('resultat-message').innerHTML = RM.defis.messageFin(partie, { sorties }) + RM.dressing.htmlCadeaux(cadeaux);
    $('resultat-flamme').innerHTML = RM.htmlFlammeResultat(flamme);
    $('resultat-rejouer').hidden = true;
    RM.afficherEcran('resultats');
    jouerSonsDeFin({ etoiles: 0, deblocage: sorties.length > 0, flamme, cadeaux, parfait });
    if (parfait) lancerConfettis();
  }

  $('resultat-rejouer').addEventListener('click', () => {
    RM.lancerPartie(dernierePartie.etape, dernierePartie.nombre);
  });

  // ---------- La fenêtre d'aide ----------
  RM.ouvrirAide = function (etape) {
    $('aide-titre').textContent = etape.titreLecon;
    $('aide-contenu').innerHTML = RM.insecables(etape.lecon);
    $('aide').hidden = false;
    $('aide-contenu').scrollTop = 0;
  };

  // 🗣️ Roxy lit la leçon
  $('aide-ecouter').hidden = !RM.voix.disponible;
  $('aide-ecouter').addEventListener('click', () => {
    RM.voix.lire([$('aide-titre').textContent, $('aide-contenu').innerHTML], $('aide-ecouter'));
  });

  const fermerAide = () => { $('aide').hidden = true; RM.voix.arreter(); };
  $('quiz-suivant').addEventListener('click', () => RM.voix.arreter());
  $('aide-fermer').addEventListener('click', fermerAide);
  $('aide').addEventListener('click', e => { if (e.target.id === 'aide') fermerAide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerAide(); });

  // ---------- Confettis pour l'étoile d'or (et pour l'arrivée de la course) ----------
  RM.lancerConfettis = lancerConfettis;
  function lancerConfettis() {
    const couleurs = ['#F28C28', '#FFC23D', '#3E8FD1', '#4E9A5A', '#F27BA0'];
    for (let i = 0; i < 70; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = couleurs[i % couleurs.length];
      confetti.style.animationDelay = Math.random() * 0.8 + 's';
      confetti.style.animationDuration = 2 + Math.random() * 1.5 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4500);
    }
  }

  // ---------- Hors ligne ----------
  // Le « service worker » garde une copie de l'appli sur l'iPad : elle s'ouvre même sans Internet
  // (en brousse, sur les îles, à l'école quand le wifi est capricieux).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* tant pis : l'appli marche en ligne */ }));
  }

  RM.sons.majBoutons();
})();
