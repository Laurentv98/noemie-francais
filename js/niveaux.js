// Renard Malin — l'écran « Choisis ton niveau » (6e, 5e, 4e ou 3e)
// Chaque niveau a sa forêt (avec son côté français et son côté maths) ; les étoiles gagnées restent gardées dans chacune.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // Les étoiles gagnées et possibles dans une forêt (« 6e », « 6e-maths »…)
  RM.etoilesForet = function (profil, foret) {
    const chemins = RM.FORETS[foret].filter(zone => !zone.bientot);
    return {
      gagnees: chemins.reduce((somme, zone) => somme + RM.etoilesZone(profil, zone), 0),
      total: chemins.reduce((somme, zone) => somme + zone.etapes.length * 5, 0),
    };
  };

  RM.ecrans.niveau = function () {
    const profil = P.profilActif();
    const actuel = P.niveauDe(profil);
    $('grille-niveaux').innerHTML = RM.NIVEAUX.map(niveau => {
      // Les étoiles de chaque côté de la forêt : 📖 le français, 🔢 les maths
      const progres = RM.MATIERES.map(matiere => {
        const { gagnees, total } = RM.etoilesForet(profil, RM.idForet(niveau.id, matiere.id));
        return `<span>${matiere.icone} <span class="etoile gagnee">★</span> ${gagnees} / ${total}</span>`;
      }).join('');
      const estActuel = niveau.id === actuel;
      return `
        <button class="carte-niveau${estActuel ? ' actuel' : ''}" data-niveau="${niveau.id}">
          <span class="niveau-saison" aria-hidden="true">${niveau.saison}</span>
          <span class="niveau-nom">${niveau.nom}</span>
          <span class="niveau-titre">${niveau.titre}</span>
          <span class="niveau-description">${niveau.description}</span>
          <span class="niveau-progres">${progres}</span>
          ${estActuel ? '<span class="niveau-actuel">✔ Ton niveau</span>' : ''}
        </button>`;
    }).join('');
  };

  $('grille-niveaux').addEventListener('click', e => {
    const carte = e.target.closest('[data-niveau]');
    if (!carte) return;
    P.changerNiveau(P.profilActif(), carte.dataset.niveau);
    RM.afficherEcran('carte');
  });
})();
