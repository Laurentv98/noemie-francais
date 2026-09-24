// Renard Malin — petites fonctions partagées par tous les fichiers.
// Ce fichier est chargé en premier : il crée l'objet RM qui relie tout le reste.

window.RM = {
  // Liste de toutes les étapes. Chaque fichier du dossier data/ y ajoute les siennes.
  etapes: [],

  // Ce qu'il faut préparer quand un écran s'affiche (rempli par app.js et profils.js)
  ecrans: {},

  // Un élément pris au hasard dans une liste
  hasard(liste) {
    return liste[Math.floor(Math.random() * liste.length)];
  },

  // Une copie de la liste, mélangée comme un jeu de cartes
  melanger(liste) {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  },

  // Les espaces avant ? ! : ; » et après « deviennent insécables : la ponctuation ne se retrouve
  // jamais seule au début d'une ligne (on ne touche qu'au texte, pas aux balises HTML)
  insecables(html) {
    return String(html).replace(/(^|>)([^<]+)/g, (tout, avant, texte) => avant + texte
      .replace(/ ([?!:;»])/g, ' $1')
      .replace(/« /g, '« '));
  },

  // Rend un texte tapé par un enfant (un prénom) sans danger à afficher dans la page
  echapper(texte) {
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
  },

  // Qui publie l'application (les mentions légales complètes sont dans infos.html).
  // Tant que l'adresse est vide, les liens « Signaler une erreur » restent cachés.
  EDITEUR: { nom: 'TechApply', email: 'hello.techapply@gmail.com' },

  // Le texte d'un bout de HTML, sans les balises (pour l'écrire dans un mail)
  texteSeul(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent.replace(/\s+/g, ' ').trim();
  },

  // Un lien qui ouvre un mail déjà rempli pour signaler une erreur, ou null sans adresse de contact
  lienSignalement(sujet, corps) {
    if (!RM.EDITEUR.email) return null;
    return `mailto:${RM.EDITEUR.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  },

  // Le petit rond avec l'animal du joueur, sur sa couleur
  htmlAvatar(profil, taille = '') {
    const couleur = RM.COULEURS.find(c => c.nom === profil.couleur) || RM.COULEURS[0];
    return `<span class="avatar ${taille}" style="--avatar-fonce:${couleur.fonce};--avatar-clair:${couleur.clair}">${profil.avatar}</span>`;
  },

  // Les animaux et les couleurs qu'on peut choisir pour son profil
  ANIMAUX: ['🦊', '🐰', '🐱', '🐶', '🐼', '🐨', '🐻', '🦁', '🐯', '🐸', '🦄', '🦉', '🐧', '🐹', '🐢', '🐙'],
  COULEURS: [
    { nom: 'orange', fonce: '#F28C28', clair: '#FFE3C7' },
    { nom: 'rose', fonce: '#EC6F9B', clair: '#FCDDE8' },
    { nom: 'violet', fonce: '#9575DB', clair: '#E9E1FA' },
    { nom: 'bleu', fonce: '#3E8FD1', clair: '#DCEBF8' },
    { nom: 'turquoise', fonce: '#26A69A', clair: '#D5F1EE' },
    { nom: 'vert', fonce: '#4E9A5A', clair: '#DDF0DF' },
    { nom: 'jaune', fonce: '#E8AE16', clair: '#FCF0C8' },
    { nom: 'rouge', fonce: '#E5604E', clair: '#FBDDD8' },
  ],
};
