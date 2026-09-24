// Renard Malin — les écrans des profils : « Qui joue ? » et « Nouveau joueur »

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // ---------- Écran « Qui joue ? » ----------
  RM.ecrans.profils = function () {
    const grille = $('grille-profils');
    grille.innerHTML = '';

    P.profils().forEach(profil => {
      const carte = document.createElement('div');
      carte.className = 'carte-profil';
      carte.innerHTML = `
        <button class="carte-profil-jouer">
          ${RM.htmlAvatar(profil, 'grand')}
          <span class="profil-prenom">${RM.echapper(profil.prenom)}</span>
          <span class="profil-stats">✨ ${profil.points} &nbsp;·&nbsp; <span class="etoile gagnee">★</span> ${P.totalEtoiles(profil)}
            &nbsp;·&nbsp; ${RM.htmlFlamme(profil)}</span>
        </button>
        <button class="profil-modifier" aria-label="Modifier le profil de ${RM.echapper(profil.prenom)}">✏️</button>`;
      carte.querySelector('.carte-profil-jouer').addEventListener('click', () => {
        P.choisirProfil(profil.id);
        RM.afficherEcran('carte');
      });
      carte.querySelector('.profil-modifier').addEventListener('click', () => ouvrirFormulaire(profil));
      grille.appendChild(carte);
    });

    const nouveau = document.createElement('button');
    nouveau.className = 'carte-profil carte-profil-nouveau';
    nouveau.innerHTML = '<span class="avatar grand plus">+</span><span class="profil-prenom">Nouveau joueur</span>';
    nouveau.addEventListener('click', () => ouvrirFormulaire(null));
    grille.appendChild(nouveau);
  };

  // Depuis l'accueil : s'il n'y a encore personne, on crée directement le premier profil
  RM.commencer = function () {
    if (P.profils().length === 0) ouvrirFormulaire(null);
    else RM.afficherEcran('profils');
  };

  // ---------- Écran « Nouveau joueur » (ou « Modifier ») ----------
  let enCours = null; // le profil qu'on modifie (null = nouveau joueur)
  let avatarChoisi = RM.ANIMAUX[0];
  let couleurChoisie = RM.COULEURS[0].nom;

  function ouvrirFormulaire(profil) {
    enCours = profil;
    const premierJoueur = P.profils().length === 0;
    $('form-titre').textContent = profil ? 'Modifier mon profil' : (premierJoueur ? 'Bienvenue !' : 'Nouveau joueur');
    $('form-retour').dataset.aller = premierJoueur ? 'accueil' : 'profils';
    $('form-prenom').value = profil ? profil.prenom : '';
    $('form-erreur').hidden = true;
    $('form-valider').textContent = profil ? 'Enregistrer ✔' : 'C’est moi ! ✔';
    avatarChoisi = profil ? profil.avatar : RM.hasard(RM.ANIMAUX);
    couleurChoisie = profil ? profil.couleur : RM.hasard(RM.COULEURS).nom;
    construireChoix();
    RM.afficherEcran('profil-form');
  }

  function construireChoix() {
    $('form-avatars').innerHTML = RM.ANIMAUX.map(animal =>
      `<button type="button" class="choix-avatar${animal === avatarChoisi ? ' choisi' : ''}" data-animal="${animal}">${animal}</button>`
    ).join('');
    $('form-couleurs').innerHTML = RM.COULEURS.map(c =>
      `<button type="button" class="choix-couleur${c.nom === couleurChoisie ? ' choisi' : ''}" data-couleur="${c.nom}"
               style="--pastille:${c.fonce}" aria-label="${c.nom}"></button>`
    ).join('');
    $('form-apercu').innerHTML = RM.htmlAvatar({ avatar: avatarChoisi, couleur: couleurChoisie }, 'geant');
  }

  $('form-avatars').addEventListener('click', e => {
    const bouton = e.target.closest('[data-animal]');
    if (!bouton) return;
    avatarChoisi = bouton.dataset.animal;
    construireChoix();
  });

  $('form-couleurs').addEventListener('click', e => {
    const bouton = e.target.closest('[data-couleur]');
    if (!bouton) return;
    couleurChoisie = bouton.dataset.couleur;
    construireChoix();
  });

  function montrerErreur(message) {
    $('form-erreur').textContent = message;
    $('form-erreur').hidden = false;
  }

  $('form-prenom').addEventListener('input', () => { $('form-erreur').hidden = true; });

  $('form-profil').addEventListener('submit', e => {
    e.preventDefault();
    const prenom = $('form-prenom').value.trim().replace(/\s+/g, ' ');
    if (!prenom) return montrerErreur('Écris ton prénom 🙂');
    if (P.prenomDejaPris(prenom, enCours?.id)) return montrerErreur('Ce prénom est déjà pris !');
    $('form-prenom').blur();

    if (enCours) {
      P.modifierProfil(enCours.id, { prenom, avatar: avatarChoisi, couleur: couleurChoisie });
      RM.afficherEcran('profils');
    } else {
      P.creerProfil({ prenom, avatar: avatarChoisi, couleur: couleurChoisie });
      RM.afficherEcran('carte');
    }
  });
  // (Supprimer un profil se fait dans l'espace parent, protégé par le code)
})();
