// Renard Malin — le moteur des étapes de conjugaison (commun à tous les niveaux)
//
// Une étape dit : quels verbes, à quel temps, avec quelles personnes, ce que Roxy explique
// après une erreur, et la petite leçon du bouton Aide. Le moteur fabrique les questions.
// Les verbes conjugués viennent du livre des verbes (data/verbes.js).
//
// Une question est un objet comme celui-ci :
//   type        : 'ecrire' (taper la réponse), 'choix' (boutons) ou 'vraifaux'
//   consigne    : la petite phrase au-dessus de la question
//   enonce      : la question elle-même (en HTML)
//   choix       : les réponses proposées (pour 'choix' et 'vraifaux')
//   reponse     : la bonne réponse
//   solution    : la bonne réponse telle qu'on l'affiche après une erreur
//   explication : ce que Roxy explique quand on se trompe

(function () {
  const V = RM.verbe;
  const ETRE = V('être');
  const AVOIR = V('avoir');
  const PRONOMS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
  const PRONOMS_REGLE = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'];
  const TOUTES_LES_PERSONNES = [0, 1, 2, 3, 4, 5];

  // « je » devient « j’ » devant une voyelle ou un h : j’aime, j’ai chanté
  const commenceParVoyelle = forme => /^[aeéèêiîoôuûh]/.test(forme);
  const avecPronom = (pronom, forme) =>
    (pronom === 'je' && commenceParVoyelle(forme) ? 'j’' : pronom + ' ') + forme;
  // « que » devient « qu’ » devant il, elle, on, ils, elles : qu’il chante (mais : que j’aie)
  const que = pronom => (/^[eio]/.test(pronom) ? 'qu’' : 'que ');

  // ---------- Le sujet de la question ----------
  // Avec l'auxiliaire être, il faut savoir si l'on parle de filles ou de garçons : on le précise.
  function choisirSujet(p, { genre = false } = {}) {
    const sujet = { p, pronom: PRONOMS[p], feminin: false, pluriel: p >= 3, mixte: false, precision: '' };
    if (p === 2) sujet.pronom = RM.hasard(genre ? ['il', 'elle'] : ['il', 'elle', 'on']);
    if (p === 5) sujet.pronom = RM.hasard(['ils', 'elles']);
    sujet.feminin = sujet.pronom === 'elle' || sujet.pronom === 'elles';
    if (genre && (p === 0 || p === 1)) {
      sujet.feminin = Math.random() < 0.5;
      sujet.precision = `« ${sujet.pronom} » = ${sujet.feminin ? 'une fille 👧' : 'un garçon 👦'}`;
    }
    if (genre && (p === 3 || p === 4)) {
      const cas = RM.hasard(['filles', 'garcons', 'mixte']);
      sujet.feminin = cas === 'filles';
      sujet.mixte = cas === 'mixte';
      sujet.precision = `« ${sujet.pronom} » = `
        + { filles: 'des filles 👧👧', garcons: 'des garçons 👦👦', mixte: 'une fille et un garçon 👧👦' }[cas];
    }
    return sujet;
  }

  const sujetSimple = p => ({ p, pronom: PRONOMS[p], feminin: false, pluriel: p >= 3 });

  // Accorder un participe passé : + e (féminin), + s (pluriel)… sauf s'il finit déjà par s (pris, mis)
  function accorder(participe, sujet) {
    const marqueFeminin = sujet.feminin ? 'e' : '';
    const marquePluriel = sujet.pluriel && !(!sujet.feminin && participe.endsWith('s')) ? 's' : '';
    return participe + marqueFeminin + marquePluriel;
  }

  function expliquerAccord(sujet, participeAccorde) {
    const marques = [sujet.feminin && '+ e pour le féminin', sujet.pluriel && '+ s pour le pluriel']
      .filter(Boolean).join(', ') || 'rien à ajouter';
    const qui = sujet.mixte
      ? `« ${sujet.pronom} », c’est une fille et un garçon : le <b>masculin</b> l’emporte`
      : `« ${sujet.pronom} » est au ${sujet.feminin ? 'féminin' : 'masculin'} ${sujet.pluriel ? 'pluriel' : 'singulier'}`;
    return ` Avec être, le participe passé <b>s’accorde avec le sujet</b>. Ici, ${qui} : <b>${participeAccorde}</b> (${marques}).`;
  }

  // Dans les tableaux, les temps avec être s'écrivent : je suis allé(e), nous sommes allé(e)s…
  const MARQUES_TABLEAU = ['(e)', '(e)', '', '(e)s', '(e)s', 's'];
  const formeAvecEtre = auxiliaire => (verbe, i) => `${auxiliaire[i]} ${verbe.participe}${MARQUES_TABLEAU[i]}`;

  const avecEtre = verbe => verbe.auxiliaire === 'être';
  const nomAuxiliaire = verbe => (avecEtre(verbe) ? 'être' : 'avoir');
  const auxiliaireDe = verbe => (avecEtre(verbe) ? ETRE : AVOIR);

  // Pièges pour un temps composé : l'auxiliaire à d'autres temps (ex. aurai / aurais),
  // un accord oublié ou en trop avec être, l'infinitif à la place du participe avec avoir
  function piegesCompose(verbe, s, tempsAuxiliaire, autresTemps) {
    const aux = auxiliaireDe(verbe);
    const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
    const pieges = autresTemps.map(t => `${aux[t][s.p]} ${participe}`);
    if (avecEtre(verbe)) {
      pieges.push(...['', 'e', 's', 'es'].map(marque => `${ETRE[tempsAuxiliaire][s.p]} ${verbe.participe}${marque}`));
    } else {
      pieges.push(`${AVOIR[tempsAuxiliaire][s.p]} ${verbe.infinitif}`);
    }
    return pieges;
  }

  // Un temps composé = l'auxiliaire (avoir ou être) à un temps simple + le participe passé
  // ex. tempsCompose('futur') → j’aurai chanté, je serai parti(e)
  function tempsCompose(tempsAuxiliaire) {
    return {
      genre: avecEtre,
      conjuguer: (verbe, s) => (avecEtre(verbe)
        ? `${ETRE[tempsAuxiliaire][s.p]} ${accorder(verbe.participe, s)}`
        : `${AVOIR[tempsAuxiliaire][s.p]} ${verbe.participe}`),
      formeTableau: (verbe, i) => (avecEtre(verbe)
        ? formeAvecEtre(ETRE[tempsAuxiliaire])(verbe, i)
        : `${AVOIR[tempsAuxiliaire][i]} ${verbe.participe}`),
    };
  }

  function astuceParticipe(verbe) {
    const participe = verbe.participe;
    if (verbe.groupe === 'premier') return 'Les verbes en -er ont un participe en <b>-é</b> (et pas -er !).';
    if (verbe.groupe === 'deuxieme') return `Les verbes comme finir ont un participe en <b>-i</b> : ${participe}.`;
    if (verbe.groupe === 'etre-avoir') return `Le participe de « ${verbe.infinitif} » est <b>${participe}</b> : à retenir !`;
    if (/[st]$/.test(participe)) {
      return `Pour trouver la lettre muette à la fin, mets le participe au féminin : ${participe}e → <b>${participe}</b>.`;
    }
    return `Le participe de « ${verbe.infinitif} » est <b>${participe}</b>. Beaucoup de participes passés finissent en <b>-u</b> : vu, lu, bu, pu.`;
  }

  // ---------- Fabriquer les questions ----------

  function debutDeLaPhrase(etape, sujet, forme) {
    if (etape.sansSujet) return `<span class="indice">(${sujet.pronom})</span> `;
    const pronom = sujet.p === 0 && commenceParVoyelle(forme) ? 'j’' : sujet.pronom + ' ';
    return (etape.que ? que(sujet.pronom) : '') + pronom;
  }

  function afficher(etape, sujet, forme) {
    return debutDeLaPhrase(etape, sujet, forme) + forme + (etape.sansSujet ? ' !' : '');
  }

  // Le verbe conjugué en entier, avec la ligne de la question surlignée
  function tableau(etape, verbe, sujet, forme) {
    const cellule = i => {
      const texte = i === sujet.p
        ? afficher(etape, sujet, forme)
        : afficher(etape, sujetSimple(i), etape.formeTableau(verbe, i));
      return `<td class="${i === sujet.p ? 'cible' : ''}">${texte}</td>`;
    };
    if (etape.personnes.length === 6) {
      return `<table class="mini-tableau">
        <tr>${cellule(0)}${cellule(3)}</tr>
        <tr>${cellule(1)}${cellule(4)}</tr>
        <tr>${cellule(2)}${cellule(5)}</tr>
      </table>`;
    }
    return `<table class="mini-tableau"><tr>${etape.personnes.map(cellule).join('')}</tr></table>`;
  }

  function creerQuestion(etape, verbe, sujet) {
    const forme = etape.conjuguer(verbe, sujet);
    const debut = debutDeLaPhrase(etape, sujet, forme);
    const fin = etape.sansSujet ? ' !' : '';
    const precision = etape.precision ? etape.precision(sujet) : sujet.precision;
    const question = {
      enonce: `${debut}<span class="trou">?</span>${fin} <span class="indice">(${verbe.infinitif})</span>`
        + (precision ? `<span class="precision">${precision}</span>` : ''),
      reponse: forme,
      solution: `${debut}<b>${forme}</b>${fin}`,
      explication: etape.expliquer(verbe, sujet, forme) + tableau(etape, verbe, sujet, forme),
    };
    if (Math.random() < etape.partEcrire) {
      return { ...question, type: 'ecrire', consigne: `Écris le verbe ${etape.temps}` };
    }
    let pieges = [...new Set(etape.distracteurs(verbe, sujet, forme))].filter(f => f && f !== forme);
    // Avec « je », la phrase affiche déjà « je » ou « j’ » : un piège qui ne va pas avec
    // (« j’vais », « je étais ») se repérerait sans réfléchir au temps, alors on l'enlève.
    if (sujet.p === 0 && !etape.sansSujet) {
      pieges = pieges.filter(f => commenceParVoyelle(f) === commenceParVoyelle(forme));
    }
    if (pieges.length === 0) {
      return { ...question, type: 'ecrire', consigne: `Écris le verbe ${etape.temps}` };
    }
    const choix = RM.melanger([forme, ...RM.melanger(pieges).slice(0, 3)]);
    return { ...question, type: 'choix', consigne: `Choisis le verbe ${etape.temps}`, choix };
  }

  // Prépare une étape (sans l'ajouter à la carte), avec des réglages par défaut
  function creerEtape(etape) {
    const liste = etape.verbes.map(v => (Array.isArray(v) ? { verbe: V(v[0]), poids: v[1] } : { verbe: V(v), poids: 1 }));
    const total = liste.reduce((somme, v) => somme + v.poids, 0);
    const tirerVerbe = () => {
      let tirage = Math.random() * total; // « poids » : plus il est grand, plus le verbe revient souvent
      return liste.find(v => (tirage -= v.poids) < 0).verbe;
    };

    etape.personnes = etape.personnes || TOUTES_LES_PERSONNES;
    etape.partEcrire = etape.partEcrire ?? 0.6; // écrire la réponse aide le mieux à mémoriser
    etape.formeTableau = etape.formeTableau || ((verbe, i) => etape.conjuguer(verbe, sujetSimple(i)));
    // Par défaut, les pièges sont les autres personnes du même verbe
    etape.distracteurs = etape.distracteurs
      || (verbe => etape.personnes.map(i => etape.conjuguer(verbe, sujetSimple(i))));

    etape.creerQuestions = function (nombre) {
      const dejaPosees = new Set();
      const questions = [];
      let essais = 0;
      while (questions.length < nombre) {
        const verbe = tirerVerbe();
        const p = RM.hasard(etape.personnes);
        if (dejaPosees.has(verbe.infinitif + p) && essais++ < 1000) continue;
        dejaPosees.add(verbe.infinitif + p);
        const genre = etape.genre ? etape.genre(verbe) : false;
        questions.push(creerQuestion(etape, verbe, choisirSujet(p, { genre })));
      }
      return questions;
    };
    return etape;
  }

  // Ajoute une étape sur la carte
  const ajouterEtape = etape => RM.etapes.push(creerEtape(etape));

  RM.conj = {
    ETRE, AVOIR, PRONOMS, PRONOMS_REGLE, TOUTES_LES_PERSONNES,
    commenceParVoyelle, avecPronom, que, choisirSujet, sujetSimple,
    accorder, expliquerAccord, formeAvecEtre, avecEtre, nomAuxiliaire, auxiliaireDe, piegesCompose,
    tempsCompose, astuceParticipe, creerEtape, ajouterEtape,
  };
})();
