// Renard Malin — le livre des verbes de Roxy (comme un petit Bescherelle)
//
// Chaque verbe est conjugué à tous les temps dont les étapes ont besoin.
// - Les verbes réguliers (1er et 2e groupe) sont conjugués automatiquement, avec les règles.
// - Les verbes irréguliers sont écrits en entier.
// Dans chaque liste, l'ordre des personnes est toujours : je, tu, il, nous, vous, ils.

(function () {
  const FINS = {
    present1: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
    present2: ['is', 'is', 'it', 'issons', 'issez', 'issent'],
    imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
    futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
    passeSimple1: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
    passeSimple2: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  };
  RM.FINS = FINS;

  const avecFins = (radical, fins) => fins.map(fin => radical + fin);
  // L'impératif n'existe qu'avec tu, nous et vous
  const imperatif = (tu, nous, vous) => [null, tu, null, nous, vous, null];

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
      passeSimple: FINS.passeSimple1.map(fin => (fin.startsWith('è') ? radical : radicalDevantAO) + fin),
      participe: radical + 'é',
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
      passeSimple: avecFins(radical, FINS.passeSimple2),
      participe: radical + 'i',
      imperatif: imperatif(radical + 'is', radical + 'issons', radical + 'issez'),
    };
  }

  // Verbes irréguliers : écrits en entier.
  // L'imparfait et le futur se construisent avec un radical + les terminaisons de tout le monde.
  const IRREGULIERS = [
    { infinitif: 'être', groupe: 'etre-avoir', present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      radicalImparfait: 'ét', radicalFutur: 'ser',
      passeSimple: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'],
      participe: 'été', imperatif: imperatif('sois', 'soyons', 'soyez') },
    { infinitif: 'avoir', groupe: 'etre-avoir', present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      radicalImparfait: 'av', radicalFutur: 'aur',
      passeSimple: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'],
      participe: 'eu', imperatif: imperatif('aie', 'ayons', 'ayez') },
    { infinitif: 'aller', auxiliaire: 'être', present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
      radicalImparfait: 'all', radicalFutur: 'ir',
      passeSimple: ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'],
      participe: 'allé', imperatif: imperatif('va', 'allons', 'allez') },
    { infinitif: 'faire', present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
      radicalImparfait: 'fais', radicalFutur: 'fer',
      passeSimple: ['fis', 'fis', 'fit', 'fîmes', 'fîtes', 'firent'],
      participe: 'fait', imperatif: imperatif('fais', 'faisons', 'faites') },
    { infinitif: 'dire', present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
      radicalImparfait: 'dis', radicalFutur: 'dir',
      passeSimple: ['dis', 'dis', 'dit', 'dîmes', 'dîtes', 'dirent'],
      participe: 'dit', imperatif: imperatif('dis', 'disons', 'dites') },
    { infinitif: 'venir', auxiliaire: 'être', present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
      radicalImparfait: 'ven', radicalFutur: 'viendr',
      passeSimple: ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent'],
      participe: 'venu', imperatif: imperatif('viens', 'venons', 'venez') },
    { infinitif: 'pouvoir', present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      radicalImparfait: 'pouv', radicalFutur: 'pourr',
      passeSimple: ['pus', 'pus', 'put', 'pûmes', 'pûtes', 'purent'],
      participe: 'pu', imperatif: null },
    { infinitif: 'voir', present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
      radicalImparfait: 'voy', radicalFutur: 'verr',
      passeSimple: ['vis', 'vis', 'vit', 'vîmes', 'vîtes', 'virent'],
      participe: 'vu', imperatif: imperatif('vois', 'voyons', 'voyez') },
    { infinitif: 'vouloir', present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      radicalImparfait: 'voul', radicalFutur: 'voudr',
      passeSimple: ['voulus', 'voulus', 'voulut', 'voulûmes', 'voulûtes', 'voulurent'],
      participe: 'voulu', imperatif: null },
    { infinitif: 'prendre', present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
      radicalImparfait: 'pren', radicalFutur: 'prendr',
      passeSimple: ['pris', 'pris', 'prit', 'prîmes', 'prîtes', 'prirent'],
      participe: 'pris', imperatif: imperatif('prends', 'prenons', 'prenez') },
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

  // Verbes dont on n'utilise que le participe passé (pour le passé composé et le plus-que-parfait)
  const PARTICIPES_SEULS = {
    mettre: 'mis', 'écrire': 'écrit', lire: 'lu', boire: 'bu', apprendre: 'appris',
    ouvrir: 'ouvert', perdre: 'perdu', 'répondre': 'répondu',
  };

  RM.VERBES = {};

  ['chanter', 'jouer', 'parler', 'danser', 'regarder', 'aimer', 'écouter', 'dessiner', 'marcher',
   'trouver', 'habiter', 'sauter', 'manger', 'nager', 'ranger', 'commencer', 'lancer',
   'briller', 'voler', 'pousser', 'chercher', 'rouler', 'garder']
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
    };
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
