// Renard Malin — les sons
// Aucun fichier à télécharger : chaque son est fabriqué par l'iPad, note par note (Web Audio).
// Le bouton 🔊 / 🔇 coupe ou remet le son ; le choix est gardé sur l'appareil.

(function () {
  const CLE = 'renardMalin.son';
  let actif = true;
  try { actif = localStorage.getItem(CLE) !== 'non'; } catch (e) { /* stockage bloqué : le son reste allumé */ }

  let ctx = null;
  // Sur iPad, le son ne peut démarrer qu'après un premier toucher de l'écran
  function contexte() {
    if (!ctx) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return null;
      ctx = new Audio();
    }
    // (sur iPad, après un appel ou une autre appli, l'état est « interrupted »)
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(evenement =>
    document.addEventListener(evenement, () => { if (actif) contexte(); }, { passive: true }));

  // Une note : fréquence (Hz), départ et durée (en secondes), forme de l'onde, volume
  function note(frequence, depart, duree, { forme = 'triangle', volume = 0.18, glisseVers = null } = {}) {
    const c = contexte();
    if (!c) return;
    const t = c.currentTime + depart;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = forme;
    osc.frequency.setValueAtTime(frequence, t);
    if (glisseVers) osc.frequency.exponentialRampToValueAtTime(glisseVers, t + duree);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + duree + 0.05);
  }

  // Un petit bruit (un pas, un souffle) : du bruit blanc filtré
  function bruit(depart, duree, { frequence = 800, volume = 0.12 } = {}) {
    const c = contexte();
    if (!c) return;
    const t = c.currentTime + depart;
    const taille = Math.floor(c.sampleRate * duree);
    const tampon = c.createBuffer(1, taille, c.sampleRate);
    const donnees = tampon.getChannelData(0);
    for (let i = 0; i < taille; i++) donnees[i] = (Math.random() * 2 - 1) * (1 - i / taille);
    const source = c.createBufferSource();
    source.buffer = tampon;
    const filtre = c.createBiquadFilter();
    filtre.type = 'bandpass';
    filtre.frequency.value = frequence;
    const gain = c.createGain();
    gain.gain.value = volume;
    source.connect(filtre).connect(gain).connect(c.destination);
    source.start(t);
  }

  // Les notes de la gamme (do4 = 262 Hz)
  const DO = 523, RE = 587, MI = 659, FA = 698, SOL = 784, LA = 880, SI = 988, DO2 = 1047, MI2 = 1319, SOL2 = 1568;

  const SONS = {
    // Bonne réponse : deux notes qui montent, joyeuses
    juste() { note(MI, 0, 0.12); note(DO2, 0.09, 0.22); },
    // Erreur : un « bloup » tout doux qui descend (pas un buzzer qui gronde)
    faux() { note(330, 0, 0.28, { forme: 'sine', volume: 0.16, glisseVers: 220 }); },
    // Un petit clic de bouton
    clic() { note(1200, 0, 0.04, { forme: 'sine', volume: 0.06 }); },
    // Une étoile qui s'allume sur l'écran de fin (n = 1 à 5 : de plus en plus haut)
    etoile(n = 1) { note([DO, MI, SOL, DO2, MI2][Math.min(4, n - 1)], 0, 0.18, { forme: 'sine', volume: 0.14 }); },
    // L'étoile d'or et l'arrivée de la course : une petite fanfare
    fanfare() {
      [[DO, 0], [MI, 0.12], [SOL, 0.24], [DO2, 0.36]].forEach(([f, t]) => note(f, t, 0.2));
      note(DO2, 0.52, 0.5, { volume: 0.16 });
      note(MI2, 0.52, 0.5, { forme: 'sine', volume: 0.08 });
      [0.6, 0.7, 0.8].forEach((t, i) => note(SOL2 + i * 200, t, 0.1, { forme: 'sine', volume: 0.05 }));
    },
    // Une nouvelle étape s'ouvre : une cascade magique
    magie() { [DO2, SI, SOL, MI, SOL, DO2, MI2].forEach((f, i) => note(f, i * 0.06, 0.18, { forme: 'sine', volume: 0.08 })); },
    // Un cadeau (un nouvel accessoire) : ta-daa !
    cadeau() { note(SOL, 0, 0.1); note(DO2, 0.1, 0.4); note(MI2, 0.1, 0.4, { forme: 'sine', volume: 0.07 }); },
    // Les pas de Roxy sur le chemin
    pas() { for (let i = 0; i < 6; i++) bruit(i * 0.22, 0.06, { frequence: 500 + (i % 2) * 150, volume: 0.1 }); },
    // La flamme qui grandit : un souffle
    flamme() { bruit(0, 0.5, { frequence: 1200, volume: 0.08 }); note(FA, 0.15, 0.3, { forme: 'sine', volume: 0.06, glisseVers: LA }); },
    // La course : une étoile ramassée, la bonne porte, un tronc, un saut
    ramasser() { note(SOL2, 0, 0.08, { forme: 'sine', volume: 0.07 }); },
    bonnePorte() { note(SOL, 0, 0.1); note(DO2, 0.08, 0.1); note(MI2, 0.16, 0.25, { volume: 0.12 }); },
    mauvaisePorte() { note(RE, 0, 0.25, { forme: 'sine', volume: 0.12, glisseVers: 350 }); },
    choc() { bruit(0, 0.18, { frequence: 180, volume: 0.35 }); },
    saut() { note(400, 0, 0.16, { forme: 'sine', volume: 0.07, glisseVers: 800 }); },
  };

  // Les sons prévus pour plus tard (fin de partie) : on les annule quand on change d'écran
  let minuteurs = [];
  RM.sons = {
    plusTard(delai, nom, ...args) { minuteurs.push(setTimeout(() => RM.sons.jouer(nom, ...args), delai)); },
    annuler() { minuteurs.forEach(clearTimeout); minuteurs = []; },
    jouer(nom, ...args) {
      if (!actif || !SONS[nom]) return;
      try { SONS[nom](...args); } catch (e) { /* un son raté ne doit jamais bloquer le jeu */ }
    },
    actif: () => actif,
    basculer() {
      actif = !actif;
      try { localStorage.setItem(CLE, actif ? 'oui' : 'non'); } catch (e) { /* tant pis */ }
      if (actif) SONS.juste();
      RM.sons.majBoutons();
      return actif;
    },
    // Tous les boutons 🔊 de l'appli montrent le bon état
    majBoutons() {
      document.querySelectorAll('.bouton-son').forEach(b => {
        b.textContent = actif ? '🔊' : '🔇';
        b.setAttribute('aria-label', 'Son');
        b.setAttribute('aria-pressed', String(actif));
      });
    },
  };

  document.addEventListener('click', e => {
    if (e.target.closest('.bouton-son')) RM.sons.basculer();
  });
})();
