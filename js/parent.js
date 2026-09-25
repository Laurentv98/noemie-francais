// Renard Malin — l'espace parent : le code à 4 chiffres, le tableau de suivi et les réglages
//
// Le code évite que les enfants entrent ici par erreur. Ce n'est pas une vraie sécurité :
// il est rangé dans le navigateur de l'iPad, comme le reste des données.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;

  // ======================================================================
  // Le code à 4 chiffres
  // ======================================================================
  let deverrouille = false; // redevient faux dès qu'on quitte l'espace parent
  let mode = 'verifier';    // 'verifier', 'creer' ou 'confirmer'
  let saisie = '';
  let premierCode = '';

  const TEXTES_CODE = {
    verifier: ['Code parent', 'Tapez votre code à 4 chiffres.'],
    creer: ['Choisissez un code', 'Choisissez un code à 4 chiffres. Il protège l’espace parent.'],
    confirmer: ['Confirmez le code', 'Tapez le même code une deuxième fois.'],
  };

  RM.ouvrirEspaceParent = function () {
    if (deverrouille) return RM.afficherEcran('parent');
    preparerCode(P.codeParent() ? 'verifier' : 'creer');
    RM.afficherEcran('code');
  };

  function preparerCode(nouveauMode) {
    mode = nouveauMode;
    saisie = '';
    [$('code-titre').textContent, $('code-aide').textContent] = TEXTES_CODE[mode];
    $('code-oublie').hidden = mode !== 'verifier';
    $('code-erreur').hidden = true;
    $('code-retour').dataset.aller = deverrouille ? 'parent' : 'accueil';
    dessinerPoints();
  }

  function dessinerPoints() {
    [...$('code-points').children].forEach((point, i) => point.classList.toggle('rempli', i < saisie.length));
  }

  function taper(chiffre) {
    if (saisie.length >= 4) return;
    saisie += chiffre;
    $('code-erreur').hidden = true;
    dessinerPoints();
    if (saisie.length === 4) setTimeout(valider, 180); // on laisse voir le 4e point
  }

  function valider() {
    if (mode === 'verifier') {
      if (saisie === P.codeParent()) {
        deverrouille = true;
        RM.afficherEcran('parent');
      } else {
        erreurCode('Ce n’est pas le bon code.');
      }
    } else if (mode === 'creer') {
      premierCode = saisie;
      preparerCode('confirmer');
    } else if (saisie === premierCode) {
      P.changerCode(saisie);
      deverrouille = true;
      RM.afficherEcran('parent');
      RM.bulleInfo('🔒 Code enregistré&nbsp;!');
    } else {
      preparerCode('creer');
      erreurCode('Les deux codes sont différents. On recommence&nbsp;!');
    }
  }

  function erreurCode(message) {
    saisie = '';
    dessinerPoints();
    $('code-erreur').innerHTML = message;
    $('code-erreur').hidden = false;
    const points = $('code-points');
    points.classList.remove('secouer');
    points.getBoundingClientRect(); // relance l'animation
    points.classList.add('secouer');
  }

  // Le clavier : 1 à 9, puis 0 et « effacer »
  $('clavier').innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
    .map(t => (t ? `<button class="touche" data-touche="${t}" aria-label="${t === '⌫' ? 'Effacer' : t}">${t}</button>` : '<span></span>'))
    .join('');

  $('clavier').addEventListener('click', e => {
    const touche = e.target.closest('[data-touche]');
    if (!touche) return;
    if (touche.dataset.touche === '⌫') {
      saisie = saisie.slice(0, -1);
      dessinerPoints();
    } else {
      taper(touche.dataset.touche);
    }
  });

  // Sur ordinateur, on peut aussi taper le code au clavier
  document.addEventListener('keydown', e => {
    if (!$('ecran-code').classList.contains('actif')) return;
    if (/^[0-9]$/.test(e.key)) taper(e.key);
    if (e.key === 'Backspace') {
      saisie = saisie.slice(0, -1);
      dessinerPoints();
    }
  });

  // Code oublié : un calcul d'adulte pour en choisir un nouveau (un simple ralentisseur !)
  $('code-oublie').addEventListener('click', () => {
    const a = 120 + Math.floor(Math.random() * 860);
    const b = 13 + Math.floor(Math.random() * 85);
    const reponse = prompt(`Code oublié ? Pour en choisir un nouveau, répondez à ce calcul :\n\n${a} × ${b} = ?`);
    if (reponse === null) return;
    if (Number(reponse.replace(/[\s.]/g, '')) === a * b) preparerCode('creer');
    else erreurCode('Ce n’est pas le bon résultat.');
  });

  // Quitter l'espace parent : on le referme
  RM.ecrans.accueil = () => {
    deverrouille = false;
    niveauVu = null;
    matiereVue = null;
  };
  $('parent-quitter').addEventListener('click', () => RM.afficherEcran('accueil'));
  $('accueil-parent').addEventListener('click', () => RM.ouvrirEspaceParent());

  // ======================================================================
  // Le tableau de suivi
  // ======================================================================
  let profilVu = null;
  let niveauVu = null;   // le niveau dont on regarde le détail des étapes
  let matiereVue = null; // et la matière : le français ou les maths
  const tousLesChemins = () => Object.values(RM.FORETS).flat().filter(zone => !zone.bientot);
  const cheminsDe = foret => RM.FORETS[foret].filter(zone => !zone.bientot);
  // Les étoiles d'un niveau, français et maths ensemble
  const etoilesDuNiveau = (profil, niveau) => RM.MATIERES
    .map(m => RM.etoilesForet(profil, RM.idForet(niveau, m.id)))
    .reduce((somme, e) => ({ gagnees: somme.gagnees + e.gagnees, total: somme.total + e.total }), { gagnees: 0, total: 0 });
  // Le nom d'une étape avec son niveau : « 5e · 🌲 Le futur antérieur »
  const nomComplet = etape => `${etape.zone.niveau} · ${etape.zone.icone} ${etape.titre}`;
  const pluriel = n => (n > 1 ? 's' : '');
  const pourcent = (bonnes, questions) => Math.round(bonnes * 100 / questions);

  function duree(secondes) {
    const minutes = Math.round(secondes / 60);
    if (minutes < 1) return 'moins d’1 min';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
  }

  function quand(dateTexte) {
    if (!dateTexte) return 'jamais';
    const date = new Date(dateTexte);
    const maintenant = P.maintenant();
    const debutDuJour = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const ecart = Math.round((debutDuJour(maintenant) - debutDuJour(date)) / 86400000);
    if (ecart === 0) return 'aujourd’hui';
    if (ecart === 1) return 'hier';
    if (ecart < 7) return `il y a ${ecart} jours`;
    return 'le ' + date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  const statsEtape = (profil, etape) => profil.etapes[etape.id] || null;

  function miniEtoiles(nombre) {
    let html = '';
    for (let i = 1; i <= 5; i++) html += `<span class="etoile${i <= nombre ? ' gagnee' : ''}${i === 5 ? ' or' : ''}">★</span>`;
    return `<span class="mini-etoiles" aria-label="${nombre} étoile${pluriel(nombre)} sur 5">${html}</span>`;
  }

  function tuile(icone, valeur, libelle, detail = '') {
    return `<div class="tuile"><span class="tuile-libelle">${icone} ${libelle}</span>`
      + `<span class="tuile-valeur">${valeur}</span>${detail ? `<span class="tuile-detail">${detail}</span>` : ''}</div>`;
  }

  function htmlResume(profil) {
    let parties = 0, bonnes = 0, questions = 0;
    tousLesChemins().forEach(zone => zone.etapes.forEach(etape => {
      const s = statsEtape(profil, etape);
      if (!s) return;
      parties += s.parties || 0;
      bonnes += s.bonnes || 0;
      questions += s.questions || 0;
    }));
    const { gagnees, total } = etoilesDuNiveau(profil, niveauVu);
    const parMatiere = RM.MATIERES
      .map(m => `${m.icone} ${RM.etoilesForet(profil, RM.idForet(niveauVu, m.id)).gagnees}`).join(' · ');
    const flamme = P.flamme(profil);
    const derniere = RM.trouverEtape(profil.derniereEtape);
    return `<div class="tuiles">
      ${tuile('⏱️', duree(profil.tempsDeJeu || 0), 'Temps de jeu')}
      ${tuile('🎮', parties, 'Parties terminées')}
      ${tuile('✅', questions ? pourcent(bonnes, questions) + ' %' : '—', 'Réussite', questions ? `${bonnes} bonnes réponses sur ${questions}` : 'pas encore de partie')}
      ${tuile('★', `${gagnees} / ${total}`, `Étoiles en ${niveauVu}`, parMatiere)}
      ${tuile('🔥', `${flamme.jours} jour${pluriel(flamme.jours)}`, 'Flamme', `record : ${flamme.record} jour${pluriel(flamme.record)}`)}
      ${tuile('📅', quand(profil.dernierePartie), 'Dernière partie', derniere ? nomComplet(derniere) : '')}
    </div>`;
  }

  // Les 5 dernières semaines, du lundi au dimanche ; les jours joués portent une petite flamme
  function htmlCalendrier(profil) {
    const joues = new Set(P.joursJoues(profil));
    const maintenant = P.maintenant();
    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    const decalage = (aujourdhui.getDay() + 6) % 7; // lundi = 0
    const debut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - decalage - 28);
    let cases = '';
    let nombreJoues = 0;
    for (let i = 0; i < 35; i++) {
      const jour = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i);
      const joue = joues.has(P.jourDe(jour));
      if (joue) nombreJoues++;
      const classes = ['jour', joue && 'joue', +jour === +aujourdhui && 'aujourdhui', jour > aujourdhui && 'futur']
        .filter(Boolean).join(' ');
      const nom = jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      cases += `<span class="${classes}" title="${nom}${joue ? ' : a révisé' : ''}">`
        + `<b>${jour.getDate()}</b>${joue ? '<i>🔥</i>' : ''}</span>`;
    }
    const entetes = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(j => `<span class="jour-semaine">${j}</span>`).join('');
    return `<section class="carte bloc-parent">
      <h3>📅 Les 5 dernières semaines</h3>
      <p class="bloc-sous-titre">${nombreJoues} jour${pluriel(nombreJoues)} de révision · 🔥 = a révisé ce jour-là</p>
      <div class="calendrier">${entetes}${cases}</div>
    </section>`;
  }

  // Les étapes où il y a le plus d'erreurs (au moins 5 questions, moins de 70 % de réussite)
  function htmlARevoir(profil) {
    const etapes = tousLesChemins().flatMap(zone => zone.etapes);
    const jouees = etapes.filter(e => (statsEtape(profil, e)?.questions || 0) >= 5);
    const aRevoir = jouees
      .map(etape => ({ etape, taux: pourcent(statsEtape(profil, etape).bonnes, statsEtape(profil, etape).questions) }))
      .filter(x => x.taux < 70)
      .sort((a, b) => a.taux - b.taux)
      .slice(0, 3);
    let contenu;
    if (jouees.length === 0) {
      contenu = '<p class="bloc-sous-titre">Pas encore assez de parties pour le dire.</p>';
    } else if (aRevoir.length === 0) {
      contenu = '<p class="rien-a-signaler">✅ Rien à signaler : toutes les étapes jouées dépassent 70 % de réussite. Bravo&nbsp;!</p>';
    } else {
      contenu = '<ul class="liste-a-revoir">' + aRevoir.map(({ etape, taux }) => `<li>
          <span class="a-revoir-icone" aria-hidden="true">⚠️</span>
          <span><b>${nomComplet(etape)}</b> : ${taux} % de réussite
          (${statsEtape(profil, etape).questions} questions)</span></li>`).join('') + '</ul>'
        + '<p class="bloc-sous-titre">💡 Conseil : relire la leçon avec le bouton « Aide », puis rejouer une partie courte de 5 questions.</p>';
    }
    return `<section class="carte bloc-parent"><h3>🎯 À retravailler</h3>${contenu}</section>`;
  }

  // Chaque zone : la réussite étape par étape
  function htmlZone(profil, zone) {
    const lignes = zone.etapes.map(etape => {
      const s = statsEtape(profil, etape);
      const questions = s?.questions || 0;
      const detail = s ? `${s.parties} partie${pluriel(s.parties)}` : 'pas encore jouée';
      const reussite = questions
        ? `<span class="jauge" aria-hidden="true"><span style="width:${pourcent(s.bonnes, questions)}%"></span></span>`
          + `<b>${pourcent(s.bonnes, questions)} %</b>`
        : '<span class="sans-donnee">—</span>';
      return `<div class="ligne-stat${s ? '' : ' pas-jouee'}">
        <span class="ls-nom">
          <span>${etape.index + 1}. ${etape.titre}${etape.sixieme ? ' <span class="badge-6e-texte">6e</span>' : ''}</span>
          <small>${detail}</small></span>
        <span class="ls-etoiles">${miniEtoiles(s?.etoiles || 0)}</span>
        <span class="ls-reussite">${reussite}</span>
      </div>`;
    }).join('');
    return `<section class="carte bloc-parent zone-parent" style="--zone:${zone.couleur};--zone-clair:${zone.couleurClaire}">
      <h3>${zone.icone} ${zone.nomCourt}</h3>
      <div class="ligne-stat entete"><span>Étape</span><span>Meilleur score</span><span>Réussite</span></div>
      ${lignes}
    </section>`;
  }

  // ======================================================================
  // Les réglages : profils, sauvegarde, code
  // ======================================================================
  function htmlReglages(profils) {
    const derniere = P.derniereExport();
    const joursDepuis = derniere ? Math.floor((P.maintenant() - new Date(derniere)) / 86400000) : null;
    const aRappeler = profils.length > 0 && (joursDepuis === null || joursDepuis >= 14);
    const listeProfils = profils.length
      ? profils.map(p => `<li>${RM.htmlAvatar(p, 'petit')} <span class="reglage-prenom">${RM.echapper(p.prenom)}</span>
          <button class="bouton-reglage danger" data-action="supprimer" data-profil="${p.id}">🗑️ Supprimer</button></li>`).join('')
      : '<li class="bloc-sous-titre">Aucun profil.</li>';
    const signalement = RM.lienSignalement('Renard Malin : signaler une erreur',
      'Bonjour,\n\nÉtape concernée (niveau, matière, titre de l’étape) :\n\nCe qui ne va pas :\n\n');
    return `<section class="carte bloc-parent reglages">
      <h3>⚙️ Réglages</h3>

      <h4>Profils</h4>
      <ul class="liste-profils">${listeProfils}</ul>

      <h4>Sauvegarde</h4>
      <p class="bloc-sous-titre">Les progrès sont enregistrés dans le navigateur de cet appareil. Exportez-les de temps en temps :
        si le navigateur efface ses données, vous pourrez tout récupérer avec « Importer ».</p>
      <p class="derniere-sauvegarde${aRappeler ? ' a-faire' : ''}">
        ${aRappeler ? '⚠️ ' : '✅ '}Dernière sauvegarde : ${derniere ? quand(derniere) : 'jamais'}</p>
      <div class="boutons-reglages">
        <button class="bouton-reglage" data-action="exporter">📤 Exporter les progrès</button>
        <button class="bouton-reglage" data-action="importer">📥 Importer une sauvegarde</button>
      </div>

      <h4>Code parent</h4>
      <button class="bouton-reglage" data-action="code">🔑 Changer le code</button>

      <h4>À propos</h4>
      <p class="bloc-sous-titre">Renard Malin est gratuit, sans publicité et sans compte. Les questions et les leçons
        sont préparées avec soin, mais des erreurs peuvent subsister : l’application aide à réviser,
        elle ne remplace pas les cours des professeurs.</p>
      <div class="boutons-reglages">
        ${signalement ? `<a class="bouton-reglage" href="${RM.echapper(signalement)}">✉️ Signaler une erreur</a>` : ''}
        <a class="bouton-reglage" href="infos.html">📄 Mentions légales et confidentialité</a>
      </div>
    </section>`;
  }

  // Les onglets pour voir le détail d'un niveau (le niveau actuel de l'enfant est marqué 🎒),
  // puis ceux de la matière : le français ou les maths
  function htmlOngletsNiveaux(profil) {
    return `<nav class="onglets-niveaux" aria-label="Choisir un niveau">
      <span class="onglets-titre">Détail par étape :</span>
      ${RM.NIVEAUX.map(n => {
        const { gagnees, total } = etoilesDuNiveau(profil, n.id);
        const actuel = n.id === P.niveauDe(profil) ? ' 🎒' : '';
        return `<button class="onglet-niveau${n.id === niveauVu ? ' actif' : ''}" data-niveau-vu="${n.id}">`
          + `${n.nom}${actuel} <small>★ ${gagnees}/${total}</small></button>`;
      }).join('')}
    </nav>
    <nav class="onglets-niveaux" aria-label="Choisir une matière">
      ${RM.MATIERES.map(m => {
        const { gagnees, total } = RM.etoilesForet(profil, RM.idForet(niveauVu, m.id));
        return `<button class="onglet-niveau${m.id === matiereVue ? ' actif' : ''}" data-matiere-vue="${m.id}">`
          + `${m.icone} ${m.nom} <small>★ ${gagnees}/${total}</small></button>`;
      }).join('')}
    </nav>`;
  }

  RM.ecrans.parent = function () {
    if (!deverrouille) {
      RM.ouvrirEspaceParent();
      return;
    }
    const profils = P.profils();
    if (!profils.some(p => p.id === profilVu)) profilVu = profils[0]?.id || null;

    $('parent-onglets').innerHTML = profils.map(p => `
      <button class="onglet-profil${p.id === profilVu ? ' actif' : ''}" data-profil-vu="${p.id}">
        ${RM.htmlAvatar(p, 'petit')} ${RM.echapper(p.prenom)}</button>`).join('');

    const profil = profilVu && P.trouver(profilVu);
    if (profil && !niveauVu) niveauVu = P.niveauDe(profil);
    if (profil && !matiereVue) matiereVue = P.matiereDe(profil);
    const foretVue = RM.idForet(niveauVu, matiereVue);
    $('parent-tableau').innerHTML = profil
      ? htmlResume(profil) + htmlARevoir(profil) + htmlCalendrier(profil) + htmlOngletsNiveaux(profil)
        + cheminsDe(foretVue).map(z => htmlZone(profil, z)).join('') + RM.course.htmlParent(profil, foretVue)
      : '<section class="carte bloc-parent"><p>Aucun profil pour l’instant. Les enfants peuvent en créer un depuis l’accueil, avec « C’est parti ! ».</p></section>';
    $('parent-reglages').innerHTML = htmlReglages(profils);
  };

  function telecharger(texte, nomFichier) {
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }));
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
  }

  $('ecran-parent').addEventListener('click', e => {
    const onglet = e.target.closest('[data-profil-vu]');
    if (onglet) {
      profilVu = onglet.dataset.profilVu;
      niveauVu = null; // on repart du niveau (et de la matière) de cet enfant
      matiereVue = null;
      RM.ecrans.parent();
      return;
    }
    const ongletNiveau = e.target.closest('[data-niveau-vu], [data-matiere-vue]');
    if (ongletNiveau) {
      if (ongletNiveau.dataset.niveauVu) niveauVu = ongletNiveau.dataset.niveauVu;
      else matiereVue = ongletNiveau.dataset.matiereVue;
      const defilement = window.scrollY;
      RM.ecrans.parent();
      window.scrollTo(0, defilement);
      return;
    }
    const bouton = e.target.closest('[data-action]');
    if (!bouton) return;
    const action = bouton.dataset.action;

    if (action === 'supprimer') {
      const profil = P.trouver(bouton.dataset.profil);
      const question = `Supprimer le profil de ${profil.prenom} ?\n\n`
        + `Ses ${profil.points} points, ses étoiles et sa flamme seront perdus pour toujours.`;
      if (!confirm(question)) return;
      P.supprimerProfil(profil.id);
      RM.ecrans.parent();
      RM.bulleInfo(`🗑️ Le profil de ${RM.echapper(profil.prenom)} a été supprimé.`);
    }
    if (action === 'exporter') {
      telecharger(P.exporter(), `renard-malin-sauvegarde-${P.jourDe(P.maintenant())}.json`);
      RM.ecrans.parent();
      RM.bulleInfo('📤 Sauvegarde créée&nbsp;! Elle se range dans le dossier « Téléchargements » (sur iPad : app Fichiers).');
    }
    if (action === 'importer') $('parent-fichier').click();
    if (action === 'code') {
      preparerCode('creer');
      RM.afficherEcran('code');
    }
  });

  $('parent-fichier').addEventListener('change', async () => {
    const fichier = $('parent-fichier').files[0];
    $('parent-fichier').value = '';
    if (!fichier) return;
    const texte = await fichier.text();
    if (!confirm('Remplacer tous les progrès actuels par ceux de cette sauvegarde ?\n\nLes profils actuels seront remplacés.')) return;
    try {
      const nombre = P.importer(texte);
      profilVu = null;
      niveauVu = null;
      matiereVue = null;
      RM.ecrans.parent();
      RM.bulleInfo(`📥 Sauvegarde importée : ${nombre} profil${pluriel(nombre)}.`);
    } catch (erreur) {
      RM.bulleInfo(`⚠️ ${erreur.message}`);
    }
  });
})();
