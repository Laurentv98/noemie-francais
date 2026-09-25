// Renard Malin — l'accueil qui parle : Roxy dit bonjour sur l'écran d'accueil,
// et se présente la toute première fois qu'on ouvre l'appli.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // ---------- La bulle de Roxy sur l'accueil ----------
  function bonjour() {
    const heure = P.maintenant().getHours();
    if (heure < 5 || heure >= 18) return 'Bonsoir';
    if (heure < 12) return 'Bonjour';
    return 'Coucou';
  }

  // (l'espace parent se referme aussi en revenant à l'accueil : on garde ce que faisait parent.js)
  const accueilAvant = RM.ecrans.accueil;
  RM.ecrans.accueil = function () {
    accueilAvant?.();
    const profil = P.profilActif();
    let texte;
    if (!profil) {
      texte = `${bonjour()}&nbsp;! Moi, c’est Roxy 🦊`;
    } else {
      const prenom = RM.echapper(profil.prenom);
      const { etat } = P.flamme(profil);
      if (etat === 'en-attente') texte = `${bonjour()} ${prenom}&nbsp;! Ta flamme t’attend 🔥`;
      else if (!P.defiFait(profil)) texte = `${bonjour()} ${prenom}&nbsp;! Un défi t’attend ⚡`;
      else if (P.aRevoir(profil).length) texte = `${bonjour()} ${prenom}&nbsp;! On revoit ton carnet&nbsp;? 📒`;
      else texte = `${bonjour()} ${prenom}&nbsp;! On révise&nbsp;? 🦊`;
    }
    $('accueil-bulle').innerHTML = texte;
    RM.sons.majBoutons();
  };

  // ---------- La présentation de Roxy (la première fois) ----------
  const PAGES = [
    { texte: 'Salut&nbsp;! Moi, c’est <b>Roxy</b>, la renarde la plus maline de la forêt 🦊', pose: 'ouais' },
    { texte: 'Avec moi, tu vas réviser le <b>français</b> 📖 et les <b>maths</b> 🔢, étape par étape, dans la forêt.', pose: 'reflechit' },
    { texte: 'Chaque partie te fait gagner des <b>étoiles</b> ★. Avec 3&nbsp;étoiles, l’étape suivante s’ouvre&nbsp;!', pose: 'ouais' },
    { texte: 'Tes étoiles servent aussi à <b>m’habiller</b>&nbsp;: des chapeaux, des lunettes… et même un ami cagou&nbsp;!',
      pose: 'ouais', tenue: { tete: 'hibiscus', yeux: 'lunettes-soleil', ami: 'cagou' } },
    { texte: 'Reviens chaque jour pour faire grandir ta <b>flamme</b> 🔥. On y va&nbsp;?', pose: 'ouais', dernier: true },
  ];
  let page = 0;

  const commencerAvant = RM.commencer;
  RM.commencer = function () {
    if (P.profils().length > 0) return commencerAvant();
    page = 0;
    RM.afficherEcran('bienvenue');
    montrerPage();
  };

  let minuteurTexte = null;
  function montrerPage() {
    const p = PAGES[page];
    const roxy = $('bienvenue-roxy');
    roxy.dataset.tenueFixe = '';
    roxy.dataset.pose = p.pose;
    roxy.querySelector('.roxy-image').src = `img/roxy-${p.pose}.png`;
    RM.dressing.montrer(roxy, p.tenue || {});
    roxy.classList.remove('entree');
    roxy.getBoundingClientRect();
    roxy.classList.add('entree');

    // Le texte s'écrit petit à petit, comme si Roxy parlait
    const bulle = $('bienvenue-bulle');
    clearInterval(minuteurTexte);
    $('bienvenue-texte-lu').innerHTML = p.texte; // le texte entier, pour VoiceOver
    bulle.innerHTML = p.texte;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      RM.sons.jouer(page === 0 ? 'magie' : 'clic');
      $('bienvenue-points').innerHTML = PAGES.map((_, n) => `<span class="${n === page ? 'actif' : ''}"></span>`).join('');
      $('bienvenue-suivant').textContent = p.dernier ? 'On y va ! 🦊' : 'Suivant →';
      $('bienvenue-passer').hidden = Boolean(p.dernier);
      return;
    }
    const texteComplet = bulle.innerHTML;
    const morceaux = texteComplet.split(/(<[^>]+>|&nbsp;)/).filter(Boolean);
    let html = '';
    let i = 0;
    let lettre = 0;
    bulle.innerHTML = '';
    minuteurTexte = setInterval(() => {
      if (i >= morceaux.length) { clearInterval(minuteurTexte); return; }
      const morceau = morceaux[i];
      if (morceau.startsWith('<') || morceau === '&nbsp;') { html += morceau; i++; }
      else {
        const lettres = [...morceau];
        html += lettres[lettre++];
        if (lettre >= lettres.length) { i++; lettre = 0; }
      }
      bulle.innerHTML = html;
    }, 22);

    $('bienvenue-points').innerHTML = PAGES.map((_, n) => `<span class="${n === page ? 'actif' : ''}"></span>`).join('');
    $('bienvenue-suivant').textContent = p.dernier ? 'On y va ! 🦊' : 'Suivant →';
    $('bienvenue-passer').hidden = Boolean(p.dernier);
    RM.sons.jouer(page === 0 ? 'magie' : 'clic');
  }

  function finir() {
    clearInterval(minuteurTexte);
    commencerAvant();
  }

  $('bienvenue-suivant').addEventListener('click', () => {
    if (PAGES[page].dernier) return finir();
    page++;
    montrerPage();
  });
  $('bienvenue-passer').addEventListener('click', finir);

  // Au premier affichage
  RM.ecrans.accueil();
  RM.habillerToutesLesRoxy();
})();
