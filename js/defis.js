// Renard Malin — le coin de Roxy, en haut de la carte :
// ⚡ le défi du jour (5 questions surprises, une fois par jour),
// 📒 le carnet de Roxy (les étapes où l'on s'est trompé, reposées quelques jours plus tard pour ne pas oublier),
// 🎩 le dressing (les accessoires gagnés).

(function () {
  const P = RM.progression;
  const QUESTIONS_DU_DEFI = 5;
  const MAX_CARNET = 10;
  const estPrete = etape => typeof etape.creerQuestions === 'function';

  // Les étapes ouvertes du niveau du joueur, côté français et côté maths
  function etapesOuvertes(profil) {
    const niveau = P.niveauDe(profil);
    return RM.MATIERES.flatMap(m => RM.FORETS[RM.idForet(niveau, m.id)] || [])
      .filter(zone => !zone.bientot)
      .flatMap(zone => zone.etapes)
      .filter(etape => estPrete(etape) && RM.etapeOuverte(profil, etape));
  }

  // Une question d'une étape, qui sait de quelle étape elle vient (pour l'aide et le carnet)
  function questionsDe(etape, nombre) {
    return RM.melanger(etape.creerQuestions(Math.max(5, nombre))).slice(0, nombre).map(q => ({ ...q, etape }));
  }

  // ---------- ⚡ Le défi du jour ----------
  // Surtout des étapes déjà jouées (on révise), et quelques autres si on n'en a pas assez
  function lancerDefi() {
    const profil = P.profilActif();
    if (P.defiFait(profil)) {
      RM.bulleInfo('⚡ Tu as déjà relevé le défi aujourd’hui&nbsp;! Reviens demain pour un nouveau défi.');
      return;
    }
    const ouvertes = etapesOuvertes(profil);
    const jouees = RM.melanger(ouvertes.filter(e => profil.etapes[e.id]?.parties));
    const autres = RM.melanger(ouvertes.filter(e => !profil.etapes[e.id]?.parties));
    let choisies = [...jouees, ...autres].slice(0, QUESTIONS_DU_DEFI);
    while (choisies.length < QUESTIONS_DU_DEFI) choisies.push(RM.hasard(ouvertes));
    choisies = RM.melanger(choisies);
    RM.lancerPartieSpeciale({
      special: 'defi',
      titre: '⚡ Défi du jour',
      questions: choisies.map(etape => questionsDe(etape, 1)[0]),
    });
  }

  // ---------- 📒 Le carnet de Roxy ----------
  function lancerCarnet() {
    const profil = P.profilActif();
    const etapes = P.aRevoir(profil).map(RM.trouverEtape).filter(e => e && estPrete(e)).slice(0, 5);
    if (!etapes.length) {
      RM.bulleInfo('📒 Rien à revoir pour l’instant. Quand tu te trompes, Roxy note l’étape ici pour te la reposer plus tard.');
      return;
    }
    const parEtape = Math.max(2, Math.min(4, Math.floor(MAX_CARNET / etapes.length)));
    RM.lancerPartieSpeciale({
      special: 'carnet',
      titre: '📒 Le carnet de Roxy',
      questions: RM.melanger(etapes.flatMap(etape => questionsDe(etape, parEtape))),
    });
  }

  // ---------- Les trois tuiles en haut de la carte ----------
  function htmlCoin(profil) {
    const defiFait = P.defiFait(profil);
    const aRevoir = P.aRevoir(profil).length;
    const nouveaux = RM.dressing.nouveaux(profil).length;
    const pluriel = n => (n > 1 ? 's' : '');
    return `
      <div class="coin-roxy">
        <button class="tuile-coin tuile-defi${defiFait ? ' fait' : ''}" data-coin="defi">
          <span class="tuile-icone">${defiFait ? '✅' : '⚡'}</span>
          <b>Défi du jour</b>
          <small>${defiFait ? 'Réussi ! Reviens demain' : '5 questions surprises'}</small>
        </button>
        <button class="tuile-coin tuile-carnet${aRevoir ? '' : ' vide'}" data-coin="carnet">
          <span class="tuile-icone">📒</span>
          <b>Carnet de Roxy</b>
          <small>${aRevoir ? `${aRevoir} étape${pluriel(aRevoir)} à revoir` : 'Rien à revoir 👍'}</small>
          ${aRevoir ? `<span class="pastille">${aRevoir}</span>` : ''}
        </button>
        <button class="tuile-coin tuile-dressing" data-aller="dressing">
          <span class="tuile-icone">🎩</span>
          <b>Dressing</b>
          <small>${nouveaux ? `${nouveaux} nouveau${nouveaux > 1 ? 'x' : ''} !` : 'Habille Roxy'}</small>
          ${nouveaux ? `<span class="pastille">${nouveaux}</span>` : ''}
        </button>
      </div>`;
  }

  document.addEventListener('click', e => {
    const tuile = e.target.closest('[data-coin]');
    if (!tuile) return;
    if (tuile.dataset.coin === 'defi') lancerDefi();
    else lancerCarnet();
  });

  // ---------- La fin d'une partie spéciale ----------
  function messageFin(partie, { sorties }) {
    const profil = P.profilActif();
    const prenom = RM.echapper(profil.prenom);
    const parfait = partie.bonnes === partie.nombre;
    if (partie.special === 'defi') {
      const faits = (profil.defis || []).length;
      const prochain = RM.dressing.ACCESSOIRES
        .filter(a => a.gagner.defis && a.gagner.defis > faits)
        .sort((a, b) => a.gagner.defis - b.gagner.defis)[0];
      const encore = prochain ? prochain.gagner.defis - faits : 0;
      return (parfait ? `Défi parfait, ${prenom}&nbsp;! ⚡` : `Défi relevé, ${prenom}&nbsp;! ⚡`)
        + `<span class="indice-deblocage">Tu as fait ${faits} défi${faits > 1 ? 's' : ''} du jour. Reviens demain pour un nouveau défi&nbsp;!`
        + (prochain ? ` Plus que ${encore} pour gagner ${prochain.emoji} ${prochain.nom.replace(/^(Le|La|Les) /, m => m.toLowerCase())}.` : '')
        + '</span>';
    }
    // Le carnet
    const revues = Object.keys(partie.resultatsEtapes);
    const reussies = revues.filter(id => partie.resultatsEtapes[id]);
    let texte = parfait ? `Bravo ${prenom}, tout est juste&nbsp;! 📒` : `Bien travaillé, ${prenom}&nbsp;! 📒`;
    texte += `<span class="indice-deblocage">${reussies.length} étape${reussies.length > 1 ? 's' : ''} réussie${reussies.length > 1 ? 's' : ''} sur ${revues.length}.`
      + (reussies.length ? ' Roxy te les reposera dans quelques jours, pour que tu ne les oublies pas.' : '')
      + (!reussies.length ? ' Pas grave&nbsp;: Roxy te les reposera demain.' : (reussies.length < revues.length ? ' Les autres reviennent demain.' : ''))
      + '</span>';
    sorties.forEach(id => {
      texte += `<span class="deblocage">🎉 «&nbsp;${RM.trouverEtape(id).titre}&nbsp;» sort du carnet&nbsp;: tu la connais&nbsp;!</span>`;
    });
    return texte;
  }

  RM.defis = { htmlCoin, lancerDefi, lancerCarnet, messageFin };
})();
