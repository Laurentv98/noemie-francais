// Renard Malin — la flamme : elle grandit chaque jour où l'on révise
// (le calcul des jours est dans js/progression.js ; ici, c'est ce qu'on voit à l'écran)

(function () {
  const P = RM.progression;

  // Plus la série est longue, plus la flamme est grande
  const NIVEAUX = [
    { depuis: 30, nom: 'Feu magique', article: 'un', classe: 'niveau-5' },
    { depuis: 14, nom: 'Grand feu', article: 'un', classe: 'niveau-4' },
    { depuis: 7, nom: 'Belle flamme', article: 'une', classe: 'niveau-3' },
    { depuis: 3, nom: 'Petite flamme', article: 'une', classe: 'niveau-2' },
    { depuis: 1, nom: 'Étincelle', article: 'une', classe: 'niveau-1' },
  ];
  const ETEINTE = { nom: 'Flamme éteinte', classe: 'niveau-0' };
  const niveauDe = jours => NIVEAUX.find(n => jours >= n.depuis) || ETEINTE;
  const pluriel = n => (n > 1 ? 's' : '');

  // La flamme avec son nombre de jours (en haut de la carte, sur les cartes « Qui joue ? »)
  RM.htmlFlamme = function (profil) {
    const { jours, etat } = P.flamme(profil);
    return `<span class="flamme ${niveauDe(jours).classe} ${etat}">`
      + `<span class="flamme-icone">🔥</span><span class="flamme-jours">${jours}</span></span>`;
  };

  // Ce que dit la bulle quand on touche la flamme
  RM.expliquerFlamme = function (profil) {
    const { jours, etat, record } = P.flamme(profil);
    const texteRecord = record > jours && record > 1 ? `<br>Ton record : ${record} jours.` : '';
    if (etat === 'eteinte') {
      return '🔥 Ta flamme est éteinte. Termine une partie aujourd’hui pour l’allumer&nbsp;!' + texteRecord;
    }
    const suite = etat === 'en-attente'
      ? '<br>Termine une partie aujourd’hui pour qu’elle ne s’éteigne pas&nbsp;!'
      : '<br>Reviens demain pour qu’elle grandisse encore&nbsp;!';
    let serie = `tu as révisé <b>${jours}&nbsp;jours de suite</b>&nbsp;!`;
    if (jours === 1) serie = etat === 'allumee' ? 'ta flamme est allumée aujourd’hui&nbsp;!' : 'tu as révisé hier&nbsp;!';
    return `🔥 <b>${niveauDe(jours).nom}</b> : ${serie}` + suite + texteRecord;
  };

  // Le petit rappel de Roxy, sur la carte, quand la flamme attend la partie du jour
  RM.rappelFlamme = function (profil) {
    const { jours, etat } = P.flamme(profil);
    if (etat !== 'en-attente') return '';
    return `🔥 Ta flamme de ${jours}&nbsp;jour${pluriel(jours)} t’attend&nbsp;! Termine une partie aujourd’hui pour qu’elle grandisse.`;
  };

  // Le message de fin de partie, quand la flamme vient de grandir
  RM.htmlFlammeResultat = function (resultat) {
    if (!resultat || !resultat.grandi) return '';
    const { jours, nouveauRecord, ancienneSerie } = resultat;
    let texte;
    if (jours === 1 && ancienneSerie > 1) {
      texte = 'Ta flamme s’était éteinte… mais une nouvelle s’allume&nbsp;! Reviens demain pour qu’elle grandisse.';
    } else if (jours === 1) {
      texte = 'Ta flamme s’allume&nbsp;! Reviens demain pour qu’elle grandisse.';
    } else {
      texte = `Ta flamme grandit&nbsp;: <b>${jours}&nbsp;jours de suite</b>&nbsp;!`;
      const nouveauNiveau = NIVEAUX.find(n => n.depuis === jours);
      if (nouveauNiveau) texte += ` Elle devient ${nouveauNiveau.article} «&nbsp;${nouveauNiveau.nom}&nbsp;»&nbsp;!`;
      if (nouveauRecord) texte += ' C’est ton nouveau record&nbsp;! 🏆';
    }
    return `<div class="resultat-flamme ${niveauDe(jours).classe}">
      <span class="grande-flamme">🔥</span><span>${texte}</span>
    </div>`;
  };
})();
