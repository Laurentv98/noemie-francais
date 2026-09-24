// Renard Malin — la sauvegarde : les profils, les points et les étoiles de chaque joueur.
// Tout est rangé dans le navigateur de l'iPad (localStorage), comme dans un tiroir par enfant.

(function () {
  const CLE = 'renardMalin.v2';
  const ANCIENNE_CLE = 'renardMalin.v1'; // la mini-version, avant les profils

  function lire(cle) {
    try {
      return JSON.parse(localStorage.getItem(cle));
    } catch (e) {
      return null; // navigation privée ou stockage bloqué
    }
  }

  function enregistrer() {
    try {
      localStorage.setItem(CLE, JSON.stringify(donnees));
    } catch (e) { /* tant pis, on joue sans sauvegarde */ }
  }

  const donnees = lire(CLE) || { profils: [], profilActif: null };

  // Les points et étoiles gagnés avec la mini-version iront au premier profil créé
  let heritage = donnees.profils.length === 0 ? lire(ANCIENNE_CLE) : null;

  const trouver = id => donnees.profils.find(p => p.id === id);
  const nouvelId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const calculerEtoiles = (bonnes, total) => Math.floor(bonnes * 5 / total);

  // Le niveau du joueur (6e, 5e, 4e ou 3e) ; les profils d'avant les niveaux sont en 6e
  const niveauValide = niveau => RM.NIVEAUX.some(n => n.id === niveau);
  const niveauDe = profil => (niveauValide(profil.niveau) ? profil.niveau : RM.NIVEAU_PAR_DEFAUT);

  function creerProfil({ prenom, avatar, couleur, niveau }) {
    const profil = {
      id: nouvelId(),
      prenom,
      avatar,
      couleur,
      niveau: niveauValide(niveau) ? niveau : RM.NIVEAU_PAR_DEFAUT,
      points: 0,
      etapes: {},        // pour chaque étape : meilleures étoiles, parties, bonnes réponses, questions
      courses: {},       // pour chaque forêt : le record de la course de Roxy
      tempsDeJeu: 0,     // en secondes, pour l'espace parent
      creeLe: new Date().toISOString(),
    };
    if (heritage) {
      profil.points = heritage.points || 0;
      profil.etapes = heritage.etapes || {};
      heritage = null;
      try { localStorage.removeItem(ANCIENNE_CLE); } catch (e) { /* rien à faire */ }
    }
    donnees.profils.push(profil);
    donnees.profilActif = profil.id;
    enregistrer();
    return profil;
  }

  // ---------- La flamme : la série de jours où l'on a révisé ----------
  // Les jours sont ceux de l'iPad (heure locale), écrits comme « 2026-09-24 ».
  const deuxChiffres = n => String(n).padStart(2, '0');
  const jourDe = date => `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`;
  const veilleDe = date => new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

  function aujourdhuiEtHier() {
    const maintenant = RM.progression.maintenant();
    return { aujourdhui: jourDe(maintenant), hier: jourDe(veilleDe(maintenant)) };
  }

  function serieDe(profil) {
    // Les profils créés avant la flamme : on démarre avec le jour de leur dernière partie
    if (!profil.serie) {
      const jour = profil.dernierePartie ? jourDe(new Date(profil.dernierePartie)) : null;
      profil.serie = { actuelle: jour ? 1 : 0, record: jour ? 1 : 0, dernierJour: jour, jours: jour ? [jour] : [] };
    }
    return profil.serie;
  }

  // Ce que montre la flamme aujourd'hui :
  // « allumee » (on a joué aujourd'hui), « en-attente » (joué hier, pas encore aujourd'hui) ou « eteinte »
  function flamme(profil) {
    const serie = serieDe(profil);
    const { aujourdhui, hier } = aujourdhuiEtHier();
    if (serie.dernierJour === aujourdhui) return { jours: serie.actuelle, etat: 'allumee', record: serie.record };
    if (serie.dernierJour === hier) return { jours: serie.actuelle, etat: 'en-attente', record: serie.record };
    return { jours: 0, etat: 'eteinte', record: serie.record };
  }

  // À la fin d'une partie, la flamme grandit… une seule fois par jour
  function nourrirFlamme(profil) {
    const serie = serieDe(profil);
    const { aujourdhui, hier } = aujourdhuiEtHier();
    if (serie.dernierJour === aujourdhui) return { grandi: false, jours: serie.actuelle };

    const ancienneSerie = serie.dernierJour === hier ? 0 : serie.actuelle; // une flamme qui s'était éteinte
    if (serie.dernierJour === hier) {
      serie.actuelle++;
    } else {
      serie.actuelle = 1;
      serie.recordABattre = serie.record; // le record de la flamme d'avant
    }
    // On fête le record le jour où l'on dépasse celui d'une flamme précédente (pas chaque jour de la 1re série)
    const aBattre = serie.recordABattre || 0;
    const nouveauRecord = aBattre >= 2 && serie.actuelle === aBattre + 1;
    serie.record = Math.max(serie.record, serie.actuelle);
    serie.dernierJour = aujourdhui;
    if (!serie.jours.includes(aujourdhui)) serie.jours.push(aujourdhui);
    return { grandi: true, jours: serie.actuelle, nouveauRecord, ancienneSerie };
  }

  // À la fin d'une partie : on range le score dans le tiroir du joueur
  function enregistrerPartie(partie) {
    const profil = trouver(donnees.profilActif);
    const etoiles = calculerEtoiles(partie.bonnes, partie.nombre);
    const infos = profil.etapes[partie.etape.id] || { etoiles: 0, parties: 0 };
    const ancienMeilleur = infos.etoiles;
    const record = infos.parties > 0 && etoiles > infos.etoiles;

    infos.etoiles = Math.max(infos.etoiles, etoiles);
    infos.parties++;
    infos.bonnes = (infos.bonnes || 0) + partie.bonnes;
    infos.questions = (infos.questions || 0) + partie.nombre;
    profil.etapes[partie.etape.id] = infos;
    profil.points += partie.points;
    profil.tempsDeJeu += Math.round((Date.now() - partie.debut) / 1000);
    profil.dernierePartie = new Date().toISOString();
    profil.derniereEtape = partie.etape.id; // pour savoir sur quel chemin placer Roxy
    const resultatFlamme = nourrirFlamme(profil);
    enregistrer();
    return { etoiles, record, ancienMeilleur, flamme: resultatFlamme };
  }

  // ---------- La course de Roxy, au bout de chaque forêt ----------
  // On garde le record (les étoiles ramassées), les bonnes portes et le nombre de courses.
  // La course ne nourrit pas la flamme : c'est la récompense, pas la révision du jour.
  function enregistrerCourse(niveau, { etoiles, bonnes, duree }) {
    const profil = trouver(donnees.profilActif);
    profil.courses = profil.courses || {};
    const infos = profil.courses[niveau] || { meilleur: 0, meilleuresPortes: 0, parties: 0 };
    const record = infos.parties > 0 && etoiles > infos.meilleur;
    infos.meilleur = Math.max(infos.meilleur, etoiles);
    infos.meilleuresPortes = Math.max(infos.meilleuresPortes, bonnes);
    infos.parties++;
    profil.courses[niveau] = infos;
    profil.tempsDeJeu += Math.round(duree);
    enregistrer();
    return { record, meilleur: infos.meilleur, premiere: infos.parties === 1 };
  }

  // ---------- Pour l'espace parent : le code, l'export et l'import ----------
  const reglages = () => (donnees.parent = donnees.parent || { code: null, derniereExport: null });

  function exporter() {
    reglages().derniereExport = new Date().toISOString();
    enregistrer();
    // Le code parent n'est pas dans la sauvegarde : seulement les profils des enfants
    return JSON.stringify({
      application: 'Renard Malin',
      version: 2,
      exporteLe: reglages().derniereExport,
      profils: donnees.profils,
    }, null, 2);
  }

  // Un fichier importé peut venir de n'importe où : on ne garde que ce qu'on connaît, bien rangé
  const JOUR_VALIDE = /^\d{4}-\d{2}-\d{2}$/;
  const nombre = valeur => (Number.isFinite(valeur) && valeur >= 0 ? valeur : 0);

  function nettoyerProfil(p, idsDejaVus) {
    const etapes = {};
    Object.entries(p.etapes).forEach(([id, e]) => {
      if (!e || typeof e !== 'object') return;
      etapes[id] = {
        etoiles: Math.min(5, nombre(e.etoiles)),
        parties: nombre(e.parties),
        bonnes: nombre(e.bonnes),
        questions: nombre(e.questions),
      };
    });
    let serie;
    if (p.serie && Array.isArray(p.serie.jours)) {
      serie = {
        actuelle: nombre(p.serie.actuelle),
        record: nombre(p.serie.record),
        recordABattre: nombre(p.serie.recordABattre),
        dernierJour: JOUR_VALIDE.test(p.serie.dernierJour) ? p.serie.dernierJour : null,
        jours: p.serie.jours.filter(jour => JOUR_VALIDE.test(jour)),
      };
    }
    const courses = {};
    if (p.courses && typeof p.courses === 'object') {
      Object.entries(p.courses).forEach(([niveau, c]) => {
        if (!niveauValide(niveau) || !c || typeof c !== 'object') return;
        courses[niveau] = {
          meilleur: nombre(c.meilleur),
          meilleuresPortes: nombre(c.meilleuresPortes),
          parties: nombre(c.parties),
        };
      });
    }
    const id = typeof p.id === 'string' && !idsDejaVus.has(p.id) ? p.id : nouvelId();
    idsDejaVus.add(id);
    const dateValide = d => (typeof d === 'string' && !isNaN(new Date(d)) ? d : undefined);
    return {
      id,
      prenom: p.prenom.trim().slice(0, 12) || 'Joueur',
      avatar: RM.ANIMAUX.includes(p.avatar) ? p.avatar : RM.ANIMAUX[0],
      couleur: RM.COULEURS.some(c => c.nom === p.couleur) ? p.couleur : RM.COULEURS[0].nom,
      niveau: niveauValide(p.niveau) ? p.niveau : RM.NIVEAU_PAR_DEFAUT,
      points: nombre(p.points),
      etapes,
      courses,
      tempsDeJeu: nombre(p.tempsDeJeu),
      creeLe: dateValide(p.creeLe),
      dernierePartie: dateValide(p.dernierePartie),
      derniereEtape: typeof p.derniereEtape === 'string' ? p.derniereEtape : undefined,
      serie,
    };
  }

  // Remplace tous les profils par ceux de la sauvegarde (le code parent, lui, ne change pas)
  function importer(texte) {
    let lu = null;
    try { lu = JSON.parse(texte); } catch (e) { /* pas du JSON */ }
    const profils = lu && Array.isArray(lu.profils) ? lu.profils : null;
    const valide = profils && profils.every(p => p && typeof p.prenom === 'string' && p.etapes && typeof p.etapes === 'object');
    if (!valide) throw new Error('Ce fichier n’est pas une sauvegarde de Renard Malin.');
    const idsDejaVus = new Set();
    donnees.profils = profils.map(p => nettoyerProfil(p, idsDejaVus));
    donnees.profilActif = null;
    enregistrer();
    return donnees.profils.length;
  }

  RM.progression = {
    ETOILES_POUR_DEBLOQUER: 3,
    maintenant: () => new Date(), // on peut la remplacer pour tester des jours différents
    calculerEtoiles,
    flamme,
    jourDe,
    niveauDe,
    foretDe: profil => RM.FORETS[niveauDe(profil)],
    changerNiveau(profil, niveau) {
      if (!niveauValide(niveau)) return;
      profil.niveau = niveau;
      enregistrer();
    },
    joursJoues: profil => serieDe(profil).jours,
    codeParent: () => reglages().code,
    changerCode(code) {
      reglages().code = code;
      enregistrer();
    },
    derniereExport: () => reglages().derniereExport,
    exporter,
    importer,
    creerProfil,
    enregistrerPartie,
    enregistrerCourse,
    courseDe: (profil, niveau) => profil.courses?.[niveau] || null,

    profils: () => donnees.profils,
    profilActif: () => trouver(donnees.profilActif) || null,
    trouver,

    choisirProfil(id) {
      donnees.profilActif = id;
      enregistrer();
    },

    prenomDejaPris(prenom, saufId) {
      return donnees.profils.some(p => p.id !== saufId && p.prenom.toLowerCase() === prenom.toLowerCase());
    },

    modifierProfil(id, changements) {
      Object.assign(trouver(id), changements);
      enregistrer();
    },

    supprimerProfil(id) {
      donnees.profils = donnees.profils.filter(p => p.id !== id);
      if (donnees.profilActif === id) donnees.profilActif = null;
      enregistrer();
    },

    meilleuresEtoiles: (profil, idEtape) => profil.etapes[idEtape]?.etoiles || 0,
    totalEtoiles: profil => Object.values(profil.etapes).reduce((somme, e) => somme + e.etoiles, 0),
  };
})();
