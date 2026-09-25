// Renard Malin — la carte d'aventure : les chemins de la forêt, les étapes et Roxy.
// En haut, on choisit le côté de la forêt : 📖 le français ou 🔢 les maths.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  const HAUTEUR_LIGNE = 150; // espace entre deux étapes du chemin, en pixels
  const TAILLE_ROND = 86;
  const LARGEUR_ROXY = 76;
  // Le chemin serpente : position de chaque étape, en % de la largeur
  const POSITIONS = [50, 72, 76, 58, 34, 24, 38, 62, 74];

  // On relie chaque étape du plan (dans toutes les forêts) à son contenu : questions et leçon
  const toutesLesZones = Object.values(RM.FORETS).flat();
  toutesLesZones.forEach(zone => zone.etapes.forEach((etape, index) => {
    const contenu = RM.etapes.find(c => c.id === etape.id);
    if (contenu) Object.assign(etape, contenu);
    etape.zone = zone;
    etape.index = index;
  }));

  const toutesLesEtapes = toutesLesZones.flatMap(zone => zone.etapes);
  RM.trouverEtape = id => toutesLesEtapes.find(e => e.id === id);
  RM.niveau = id => RM.NIVEAUX.find(n => n.id === id);

  const estPrete = etape => typeof etape.creerQuestions === 'function';
  const positionX = etape => POSITIONS[etape.index % POSITIONS.length];

  // La première étape de chaque chemin est toujours ouverte.
  // Les suivantes s'ouvrent avec 3 étoiles à l'étape d'avant.
  function estOuverte(profil, etape) {
    if (etape.index === 0) return true;
    const precedente = etape.zone.etapes[etape.index - 1];
    return P.meilleuresEtoiles(profil, precedente.id) >= P.ETOILES_POUR_DEBLOQUER;
  }
  RM.etapeOuverte = estOuverte;

  // La dernière étape atteinte sur un chemin : la plus loin qui soit ouverte
  function derniereOuverte(profil, zone) {
    return zone.etapes.filter(e => estOuverte(profil, e)).pop();
  }

  const etoilesZone = (profil, zone) =>
    zone.etapes.reduce((somme, e) => somme + P.meilleuresEtoiles(profil, e.id), 0);
  RM.etoilesZone = etoilesZone;

  // ---------- Dessiner la carte ----------
  RM.ecrans.carte = function () {
    const profil = P.profilActif();
    const niveau = RM.niveau(P.niveauDe(profil));
    const matiere = P.matiereDe(profil);
    const foret = P.foretDe(profil);
    $('carte-titre').textContent = `La forêt de ${profil.prenom}`;
    $('carte-joueur').innerHTML = `${RM.htmlAvatar(profil, 'petit')}
      <span class="joueur-prenom">${RM.echapper(profil.prenom)}</span>
      <span class="joueur-points">✨ ${profil.points}</span>`;
    $('carte-flamme').innerHTML = RM.htmlFlamme(profil);

    // Les deux côtés de la forêt : le français et les maths, avec leurs étoiles
    $('choix-matiere').innerHTML = RM.MATIERES.map(m => {
      const { gagnees } = RM.etoilesForet(profil, RM.idForet(niveau.id, m.id));
      const actif = m.id === matiere;
      return `<button class="bouton-matiere${actif ? ' actif' : ''}" data-matiere="${m.id}" aria-pressed="${actif}">
          <span class="matiere-icone" aria-hidden="true">${m.icone}</span> ${m.nom} <b>★ ${gagnees}</b></button>`;
    }).join('');

    // Le premier bouton du haut : le niveau (on le touche pour en changer)
    $('raccourcis-zones').innerHTML = `
      <button class="raccourci raccourci-niveau" data-aller="niveau" aria-label="Changer de niveau">
        🎒 <b>${niveau.nom}</b> <span class="saison">${niveau.saison}</span> ▾
      </button>` + foret.map(zone => `
      <button class="raccourci" data-zone="${zone.id}" style="--zone:${zone.couleur}" aria-label="${zone.nomCourt}" title="${zone.nomCourt}">
        ${zone.icone} <span>${zone.nomCourt}</span>
        ${zone.bientot ? '🔒' : `<b>★ ${etoilesZone(profil, zone)}</b>`}
      </button>`).join('');

    // Les quatre chemins, puis la course de Roxy tout en bas de la forêt
    // En haut : le coin de Roxy (défi du jour, carnet, dressing)
    $('carte-aventure').innerHTML = RM.defis.htmlCoin(profil)
      + foret.map(zone => htmlZone(profil, zone)).join('') + RM.course.htmlCarte(profil, P.idForetDe(profil));
    foret.filter(zone => !zone.bientot).forEach(zone => tracerChemin(profil, zone));
    placerRoxy(profil, foret);
    RM.nouvelleEtape = null;

    // Si la flamme attend la partie du jour, Roxy le rappelle (une seule fois par visite)
    const rappel = RM.rappelFlamme(profil);
    if (rappel && !rappelsFaits.has(profil.id)) {
      rappelsFaits.add(profil.id);
      setTimeout(() => RM.bulleInfo(rappel), 900);
    }
  };

  const rappelsFaits = new Set();

  // Toucher la flamme : on voit sa série de jours
  $('carte-flamme').addEventListener('click', () => RM.bulleInfo(RM.expliquerFlamme(P.profilActif())));

  function htmlZone(profil, zone) {
    const style = `--zone:${zone.couleur};--zone-clair:${zone.couleurClaire}`;
    if (zone.bientot) {
      return `
        <section class="zone bientot" id="zone-${zone.id}" style="${style}">
          <header class="zone-entete">
            <span class="zone-icone">${zone.icone}</span>
            <div><h3>${zone.nom}</h3><p>🚧 Roxy construit cette partie de la forêt… Bientôt !</p></div>
          </header>
        </section>`;
    }
    const hauteur = (zone.etapes.length - 1) * HAUTEUR_LIGNE + 150;
    return `
      <section class="zone" id="zone-${zone.id}" style="${style}">
        <header class="zone-entete">
          <span class="zone-icone">${zone.icone}</span>
          <div><h3>${zone.nom}</h3><p>★ ${etoilesZone(profil, zone)} / ${zone.etapes.length * 5} étoiles</p></div>
        </header>
        <div class="chemin" style="height:${hauteur}px">
          <svg class="chemin-trace" aria-hidden="true"></svg>
          ${zone.etapes.map(etape => htmlEtape(profil, etape)).join('')}
        </div>
      </section>`;
  }

  function htmlEtape(profil, etape) {
    const x = positionX(etape);
    const etoiles = P.meilleuresEtoiles(profil, etape.id);
    const ouverte = estOuverte(profil, etape);
    let etat = 'ouverte';
    if (!ouverte) etat = 'verrouillee';
    else if (!estPrete(etape)) etat = 'en-travaux';
    else if (etoiles >= P.ETOILES_POUR_DEBLOQUER) etat = 'reussie';

    const classes = ['rond-etape', etat];
    if (ouverte && etape === derniereOuverte(profil, etape.zone)) classes.push('actuelle');
    if (etape.id === RM.nouvelleEtape) classes.push('nouvelle');

    const symbole = { verrouillee: '🔒', 'en-travaux': '🚧' }[etat] || etape.index + 1;
    const couronne = etoiles === 5 ? '<span class="couronne">👑</span>' : '';
    const badge6e = etape.sixieme ? '<span class="badge-6e">6e</span>' : '';
    const decor = etape.zone.decors[etape.index % etape.zone.decors.length];

    return `
      <div class="ligne-etape" style="top:${etape.index * HAUTEUR_LIGNE}px">
        <span class="decor" style="left:${x > 50 ? 9 : 91}%">${decor}</span>
        <button class="${classes.join(' ')}" data-etape="${etape.id}" style="left:${x}%"
                aria-label="Étape ${etape.index + 1} : ${etape.titre}">
          <span class="rond">${symbole}${couronne}${badge6e}</span>
          <span class="etape-nom">${etape.titre}</span>
          ${ouverte && estPrete(etape) ? htmlMiniEtoiles(etoiles) : ''}
        </button>
      </div>`;
  }

  function htmlMiniEtoiles(nombre) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="etoile${i <= nombre ? ' gagnee' : ''}${i === 5 ? ' or' : ''}">★</span>`;
    }
    return `<span class="mini-etoiles">${html}</span>`;
  }

  // Le chemin qui relie les étapes : en pointillés jusqu'à la dernière étape ouverte
  function tracerChemin(profil, zone) {
    const chemin = document.querySelector(`#zone-${zone.id} .chemin`);
    const largeur = chemin.clientWidth;
    const points = zone.etapes.map(e => [positionX(e) / 100 * largeur, e.index * HAUTEUR_LIGNE + TAILLE_ROND / 2]);
    const trace = nombre => points.slice(0, nombre).map(([x, y], i) => {
      if (i === 0) return `M ${x} ${y}`;
      const [xAvant, yAvant] = points[i - 1];
      const milieu = (yAvant + y) / 2;
      return `C ${xAvant} ${milieu}, ${x} ${milieu}, ${x} ${y}`;
    }).join(' ');

    const ouvertes = zone.etapes.filter(e => estOuverte(profil, e)).length;
    const svg = chemin.querySelector('.chemin-trace');
    svg.setAttribute('viewBox', `0 0 ${largeur} ${chemin.clientHeight}`);
    svg.innerHTML = `<path class="trace-fond" d="${trace(points.length)}"/>`
      + (ouvertes > 1 ? `<path class="trace-parcourue" d="${trace(ouvertes)}"/>` : '');
  }

  // ---------- Roxy sur la carte ----------
  // Roxy se tient à côté de la dernière étape atteinte, sur le chemin où l'on a joué en dernier.
  // Si une nouvelle étape vient de s'ouvrir, elle y marche depuis sa place d'avant.
  let anciennePlace = null;

  function placerRoxy(profil, foret) {
    const derniereJouee = RM.trouverEtape(profil.derniereEtape);
    // Si la dernière partie était dans une autre forêt (un autre niveau, ou l'autre matière),
    // Roxy attend au début du premier chemin
    const zone = derniereJouee && foret.includes(derniereJouee.zone) ? derniereJouee.zone : foret[0];
    const cible = derniereOuverte(profil, zone);
    const chemin = document.querySelector(`#zone-${zone.id} .chemin`);
    const largeur = chemin.clientWidth;

    const coordonnees = etape => {
      const x = positionX(etape) / 100 * largeur;
      const left = positionX(etape) > 50
        ? x - TAILLE_ROND / 2 - LARGEUR_ROXY - 2
        : x + TAILLE_ROND / 2 + 2;
      return { left: left + 'px', top: (etape.index * HAUTEUR_LIGNE + 4) + 'px' };
    };

    const roxy = document.createElement('div');
    roxy.className = 'roxy roxy-carte';
    roxy.dataset.pose = 'ouais';
    roxy.innerHTML = '<img class="roxy-image" src="img/roxy-ouais.png" alt="Roxy est ici">';
    chemin.appendChild(roxy);
    RM.poserRoxy(roxy, 'ouais'); // avec ses accessoires

    const memePlace = anciennePlace && anciennePlace.profil === profil.id && anciennePlace.zone === zone;
    const doitMarcher = memePlace && anciennePlace.index < cible.index;
    Object.assign(roxy.style, coordonnees(doitMarcher ? zone.etapes[anciennePlace.index] : cible));
    if (doitMarcher) {
      roxy.getBoundingClientRect(); // on laisse le navigateur placer Roxy au départ…
      roxy.classList.add('en-marche'); // …puis elle marche jusqu'à la nouvelle étape
      RM.sons.jouer('pas');
      Object.assign(roxy.style, coordonnees(cible));
    }
    anciennePlace = { profil: profil.id, zone, index: cible.index };

    // On fait défiler la carte pour que Roxy soit bien visible
    const haut = chemin.getBoundingClientRect().top + window.scrollY + cible.index * HAUTEUR_LIGNE;
    window.scrollTo({ top: Math.max(0, haut - window.innerHeight / 2 + 60), behavior: doitMarcher ? 'smooth' : 'auto' });
  }

  // ---------- Toucher une étape ----------
  $('carte-aventure').addEventListener('click', e => {
    const bouton = e.target.closest('[data-etape]');
    if (!bouton) return;
    const etape = RM.trouverEtape(bouton.dataset.etape);
    const profil = P.profilActif();
    if (!estOuverte(profil, etape)) {
      const precedente = etape.zone.etapes[etape.index - 1];
      RM.bulleInfo(`🔒 Gagne <b>${P.ETOILES_POUR_DEBLOQUER}&nbsp;étoiles</b> à l’étape «&nbsp;${precedente.titre}&nbsp;» pour ouvrir celle-ci&nbsp;!`);
    } else if (!estPrete(etape)) {
      RM.bulleInfo('🚧 Roxy prépare encore cette étape. Elle arrive bientôt&nbsp;!');
    } else {
      RM.choisirDuree(etape);
    }
  });

  // Changer de côté : le français ou les maths
  $('choix-matiere').addEventListener('click', e => {
    const bouton = e.target.closest('[data-matiere]');
    const profil = P.profilActif();
    if (!bouton || bouton.dataset.matiere === P.matiereDe(profil)) return;
    P.changerMatiere(profil, bouton.dataset.matiere);
    RM.ecrans.carte();
  });

  // Les boutons du haut : aller directement à une zone de la forêt
  $('raccourcis-zones').addEventListener('click', e => {
    const bouton = e.target.closest('[data-zone]');
    if (bouton) $('zone-' + bouton.dataset.zone).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Si l'iPad tourne (portrait ↔ paysage), on redessine la carte à la bonne largeur
  let minuteurTaille = null;
  let largeurAvant = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(minuteurTaille);
    minuteurTaille = setTimeout(() => {
      if (window.innerWidth === largeurAvant) return;
      largeurAvant = window.innerWidth;
      if ($('ecran-carte').classList.contains('actif')) RM.ecrans.carte();
    }, 200);
  });

  // ---------- Petite bulle d'information en bas de l'écran ----------
  let minuteurBulle = null;
  RM.bulleInfo = function (html) {
    const bulle = $('bulle-info');
    bulle.innerHTML = html;
    bulle.hidden = false;
    bulle.classList.remove('visible');
    bulle.getBoundingClientRect(); // relance l'animation
    bulle.classList.add('visible');
    clearTimeout(minuteurBulle);
    minuteurBulle = setTimeout(() => { bulle.hidden = true; }, 3500);
  };
})();
