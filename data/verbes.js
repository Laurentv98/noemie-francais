// Renard Malin — le livre des verbes de Roxy (comme un petit Bescherelle)
//
// Chaque verbe est conjugué à tous les temps dont les étapes ont besoin, de la 6e à la 3e.
// - Les verbes réguliers (1er et 2e groupe) sont conjugués automatiquement, avec les règles.
// - Les verbes irréguliers sont écrits en entier (sauf ce qui se construit sans surprise).
// Dans chaque liste, l'ordre des personnes est toujours : je, tu, il, nous, vous, ils.

(function () {
  const FINS = {
    present1: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
    present2: ['is', 'is', 'it', 'issons', 'issez', 'issent'],
    imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
    futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
    passeSimple1: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
    passeSimple2: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
    subjonctif: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
  };
  RM.FINS = FINS;

  const avecFins = (radical, fins) => fins.map(fin => radical + fin);
  // L'impératif n'existe qu'avec tu, nous et vous
  const imperatif = (tu, nous, vous) => [null, tu, null, nous, vous, null];

  // Subjonctif imparfait (3e personne du singulier) : on part du passé simple
  // il chanta → qu'il chantât · il finit → qu'il finît · il fut → qu'il fût · il vint → qu'il vînt
  function subjonctifImparfait3(passeSimple3) {
    if (passeSimple3.endsWith('a')) return passeSimple3.slice(0, -1) + 'ât';
    const [, debut, voyelle, fin] = passeSimple3.match(/^(.*)([iu])(n?t)$/);
    return debut + { i: 'î', u: 'û' }[voyelle] + fin;
  }

  // Verbes en -er (1er groupe)
  function premierGroupe(infinitif, auxiliaire = 'avoir') {
    const radical = infinitif.slice(0, -2);                // chant-
    // Devant a et o : manger garde son e (mangeons), commencer prend une cédille (commençons)
    const radicalDevantAO = radical.endsWith('g') ? radical + 'e'
      : radical.endsWith('c') ? radical.slice(0, -1) + 'ç'
      : radical;
    const present = avecFins(radical, FINS.present1);
    present[3] = radicalDevantAO + 'ons';
    return {
      infinitif,
      groupe: 'premier',
      auxiliaire,
      present,
      imparfait: FINS.imparfait.map(fin => (fin.startsWith('i') ? radical : radicalDevantAO) + fin),
      futur: avecFins(infinitif, FINS.futur),
      conditionnel: avecFins(infinitif, FINS.imparfait),
      passeSimple: FINS.passeSimple1.map(fin => (fin.startsWith('è') ? radical : radicalDevantAO) + fin),
      subjonctif: avecFins(radical, FINS.subjonctif),
      participe: radical + 'é',
      participePresent: radicalDevantAO + 'ant',
      imperatif: imperatif(radical + 'e', present[3], present[4]),
    };
  }

  // Verbes en -ir comme finir (2e groupe)
  function deuxiemeGroupe(infinitif) {
    const radical = infinitif.slice(0, -2);                // fin-
    return {
      infinitif,
      groupe: 'deuxieme',
      auxiliaire: 'avoir',
      present: avecFins(radical, FINS.present2),
      imparfait: avecFins(radical + 'iss', FINS.imparfait),
      futur: avecFins(infinitif, FINS.futur),
      conditionnel: avecFins(infinitif, FINS.imparfait),
      passeSimple: avecFins(radical, FINS.passeSimple2),
      subjonctif: avecFins(radical + 'iss', FINS.subjonctif),
      participe: radical + 'i',
      participePresent: radical + 'issant',
      imperatif: imperatif(radical + 'is', radical + 'issons', radical + 'issez'),
    };
  }

  // Verbes irréguliers : écrits en entier.
  // L'imparfait, le futur et le conditionnel se construisent avec un radical + les terminaisons de tout le monde.
  // Le subjonctif n'est écrit que s'il ne se construit pas avec le radical de « ils » au présent.
  const IRREGULIERS = [
    { infinitif: 'être', groupe: 'etre-avoir', present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      radicalImparfait: 'ét', radicalFutur: 'ser',
      passeSimple: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'],
      subjonctif: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
      participe: 'été', participePresent: 'étant', imperatif: imperatif('sois', 'soyons', 'soyez') },
    { infinitif: 'avoir', groupe: 'etre-avoir', present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      radicalImparfait: 'av', radicalFutur: 'aur',
      passeSimple: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'],
      subjonctif: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
      participe: 'eu', participePresent: 'ayant', imperatif: imperatif('aie', 'ayons', 'ayez') },
    { infinitif: 'aller', auxiliaire: 'être', present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
      radicalImparfait: 'all', radicalFutur: 'ir',
      passeSimple: ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'],
      subjonctif: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
      participe: 'allé', imperatif: imperatif('va', 'allons', 'allez') },
    { infinitif: 'faire', present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
      radicalImparfait: 'fais', radicalFutur: 'fer',
      passeSimple: ['fis', 'fis', 'fit', 'fîmes', 'fîtes', 'firent'],
      subjonctif: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
      participe: 'fait', imperatif: imperatif('fais', 'faisons', 'faites') },
    { infinitif: 'dire', present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
      radicalImparfait: 'dis', radicalFutur: 'dir',
      passeSimple: ['dis', 'dis', 'dit', 'dîmes', 'dîtes', 'dirent'],
      participe: 'dit', imperatif: imperatif('dis', 'disons', 'dites') },
    { infinitif: 'venir', auxiliaire: 'être', present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
      radicalImparfait: 'ven', radicalFutur: 'viendr',
      passeSimple: ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent'],
      subjonctif: ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent'],
      participe: 'venu', imperatif: imperatif('viens', 'venons', 'venez') },
    { infinitif: 'pouvoir', present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      radicalImparfait: 'pouv', radicalFutur: 'pourr',
      passeSimple: ['pus', 'pus', 'put', 'pûmes', 'pûtes', 'purent'],
      subjonctif: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
      participe: 'pu', imperatif: null },
    { infinitif: 'voir', present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
      radicalImparfait: 'voy', radicalFutur: 'verr',
      passeSimple: ['vis', 'vis', 'vit', 'vîmes', 'vîtes', 'virent'],
      subjonctif: ['voie', 'voies', 'voie', 'voyions', 'voyiez', 'voient'],
      participe: 'vu', imperatif: imperatif('vois', 'voyons', 'voyez') },
    { infinitif: 'vouloir', present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      radicalImparfait: 'voul', radicalFutur: 'voudr',
      passeSimple: ['voulus', 'voulus', 'voulut', 'voulûmes', 'voulûtes', 'voulurent'],
      subjonctif: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
      participe: 'voulu', imperatif: null },
    { infinitif: 'prendre', present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
      radicalImparfait: 'pren', radicalFutur: 'prendr',
      passeSimple: ['pris', 'pris', 'prit', 'prîmes', 'prîtes', 'prirent'],
      subjonctif: ['prenne', 'prennes', 'prenne', 'prenions', 'preniez', 'prennent'],
      participe: 'pris', imperatif: imperatif('prends', 'prenons', 'prenez') },
    { infinitif: 'savoir', present: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
      radicalImparfait: 'sav', radicalFutur: 'saur',
      passeSimple: ['sus', 'sus', 'sut', 'sûmes', 'sûtes', 'surent'],
      subjonctif: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
      participe: 'su', participePresent: 'sachant', imperatif: imperatif('sache', 'sachons', 'sachez') },
    { infinitif: 'partir', auxiliaire: 'être', present: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
      radicalImparfait: 'part', radicalFutur: 'partir',
      passeSimple: ['partis', 'partis', 'partit', 'partîmes', 'partîtes', 'partirent'],
      participe: 'parti', imperatif: imperatif('pars', 'partons', 'partez') },
    { infinitif: 'sortir', auxiliaire: 'être', present: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
      radicalImparfait: 'sort', radicalFutur: 'sortir',
      passeSimple: ['sortis', 'sortis', 'sortit', 'sortîmes', 'sortîtes', 'sortirent'],
      participe: 'sorti', imperatif: imperatif('sors', 'sortons', 'sortez') },
    { infinitif: 'descendre', auxiliaire: 'être', present: ['descends', 'descends', 'descend', 'descendons', 'descendez', 'descendent'],
      radicalImparfait: 'descend', radicalFutur: 'descendr',
      passeSimple: ['descendis', 'descendis', 'descendit', 'descendîmes', 'descendîtes', 'descendirent'],
      participe: 'descendu', imperatif: imperatif('descends', 'descendons', 'descendez') },
  ];

  // Verbes dont on n'utilise que le participe passé (pour les temps composés et la voix passive)
  const PARTICIPES_SEULS = {
    mettre: 'mis', 'écrire': 'écrit', lire: 'lu', boire: 'bu', apprendre: 'appris',
    ouvrir: 'ouvert', perdre: 'perdu', 'répondre': 'répondu', acheter: 'acheté',
    cueillir: 'cueilli', construire: 'construit',
  };

  RM.VERBES = {};

  ['chanter', 'jouer', 'parler', 'danser', 'regarder', 'aimer', 'écouter', 'dessiner', 'marcher',
   'trouver', 'habiter', 'sauter', 'manger', 'nager', 'ranger', 'commencer', 'lancer',
   'briller', 'voler', 'pousser', 'chercher', 'rouler', 'garder', 'gagner', 'inviter', 'traverser']
    .forEach(inf => { RM.VERBES[inf] = premierGroupe(inf); });

  // Verbes en -er qui se conjuguent avec être au passé composé
  ['arriver', 'entrer', 'tomber', 'rester', 'monter', 'rentrer']
    .forEach(inf => { RM.VERBES[inf] = premierGroupe(inf, 'être'); });

  ['finir', 'choisir', 'grandir', 'réussir', 'remplir', 'obéir', 'rougir']
    .forEach(inf => { RM.VERBES[inf] = deuxiemeGroupe(inf); });

  IRREGULIERS.forEach(v => {
    RM.VERBES[v.infinitif] = {
      groupe: 'troisieme',
      auxiliaire: 'avoir',
      ...v,
      imparfait: avecFins(v.radicalImparfait, FINS.imparfait),
      futur: avecFins(v.radicalFutur, FINS.futur),
      conditionnel: avecFins(v.radicalFutur, FINS.imparfait),
      // Subjonctif régulier : radical de « ils » au présent (ils dis|ent → que je dise)
      subjonctif: v.subjonctif || avecFins(v.present[5].slice(0, -3), FINS.subjonctif),
      // Participe présent régulier : radical de « nous » au présent (nous fais|ons → faisant)
      participePresent: v.participePresent || v.present[3].slice(0, -3) + 'ant',
    };
  });

  Object.values(RM.VERBES).forEach(verbe => {
    verbe.subjonctifImparfait3 = subjonctifImparfait3(verbe.passeSimple[2]);
  });

  Object.entries(PARTICIPES_SEULS).forEach(([infinitif, participe]) => {
    RM.VERBES[infinitif] = { infinitif, groupe: 'troisieme', auxiliaire: 'avoir', participe };
  });

  // Chercher un verbe dans le livre (avec un message clair en cas de faute de frappe)
  RM.verbe = function (infinitif) {
    const verbe = RM.VERBES[infinitif];
    if (!verbe) throw new Error(`Le verbe « ${infinitif} » n'est pas dans data/verbes.js`);
    return verbe;
  };
})();
