// Renard Malin — Roxy lit à voix haute
// Le bouton 🗣️ lit la question (ou la leçon) avec la voix française de l'iPad (synthèse vocale du navigateur).
// Utile pour les enfants qui ont du mal à lire : rien n'est envoyé sur Internet.

(function () {
  const synthese = window.speechSynthesis;
  const disponible = Boolean(synthese && window.SpeechSynthesisUtterance);

  // La plus jolie voix française de l'appareil (sur iPad : Amélie, Thomas… selon ce qui est installé)
  function voixFrancaise() {
    const voix = synthese.getVoices().filter(v => /^fr(-|_|$)/i.test(v.lang));
    return voix.find(v => /fr-FR/i.test(v.lang) && /premium|enhanced|amélie|audrey|thomas|marie/i.test(v.name))
      || voix.find(v => /fr-FR/i.test(v.lang)) || voix[0] || null;
  }
  if (disponible) synthese.getVoices(); // certaines voix se chargent en retard

  // Du HTML de l'appli à une phrase qui se lit bien
  function aLire(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('svg, .lien-signaler, .pas-lu').forEach(el => el.remove());
    div.querySelectorAll('.trou').forEach(el => { el.textContent = ' … '; });
    div.querySelectorAll('.frac').forEach(el => {
      const [haut, bas] = [...el.children].map(c => c.textContent);
      el.textContent = ` ${haut} sur ${bas} `;
    });
    div.querySelectorAll('sup').forEach(el => {
      const n = el.textContent.trim();
      el.textContent = n === '2' ? ' au carré ' : n === '3' ? ' au cube ' : ` puissance ${n} `;
    });
    div.querySelectorAll('br, p, li, h4, tr, div').forEach(el => el.append(' . '));
    return div.textContent
      .replace(/×/g, ' fois ').replace(/÷/g, ' divisé par ')
      .replace(/(\d)\s*−\s*(\d)/g, '$1 moins $2').replace(/−/g, ' moins ')
      .replace(/≈/g, ' environ égal à ').replace(/≠/g, ' différent de ')
      .replace(/(^|\s)=(\s|$)/g, ' égale ').replace(/</g, ' inférieur à ').replace(/>/g, ' supérieur à ')
      .replace(/\?\s*\?/g, '?').replace(/_{2,}/g, ' … ')
      .replace(/[🔒🚧⭐🌟✨💡⚠️👉✔✘]/gu, '')
      .replace(/\s*\.\s*(\.\s*)+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  let boutonActif = null;
  let enCours = null; // la phrase lue en ce moment
  function finDeLecture() {
    boutonActif?.classList.remove('en-lecture');
    boutonActif = null;
  }

  RM.voix = {
    disponible,
    aLire,
    // Lire un ou plusieurs morceaux de HTML ; toucher encore le même bouton arrête la lecture
    lire(morceaux, bouton = null) {
      if (!disponible) return;
      const memeBouton = bouton && bouton === boutonActif;
      RM.voix.arreter();
      if (memeBouton) return;
      const texte = [].concat(morceaux).filter(Boolean).map(aLire).join('. ');
      if (!texte) return;
      const phrase = new SpeechSynthesisUtterance(texte);
      phrase.lang = 'fr-FR';
      const voix = voixFrancaise();
      if (voix) phrase.voice = voix;
      phrase.rate = 0.92;
      phrase.pitch = 1.1;
      // (cancel() déclenche plus tard le « onend » de l'ancienne phrase : on ne réagit qu'à la phrase en cours)
      enCours = phrase;
      phrase.onend = phrase.onerror = () => { if (enCours === phrase) finDeLecture(); };
      boutonActif = bouton;
      bouton?.classList.add('en-lecture');
      synthese.speak(phrase);
    },
    arreter() {
      if (!disponible) return;
      synthese.cancel();
      finDeLecture();
    },
  };

  // Quand l'appli passe en arrière-plan, Roxy se tait (changer d'écran l'arrête aussi : voir RM.afficherEcran)
  document.addEventListener('visibilitychange', () => { if (document.hidden) RM.voix.arreter(); });
})();
