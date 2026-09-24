// Renard Malin — le plan des forêts : une forêt par niveau (6e, 5e, 4e, 3e)
//
// Chaque forêt a deux côtés : le français (ici) et les maths (data/foret-maths.js).
// Chaque côté a ses chemins (zones), et chaque chemin ses étapes, de la plus facile
// à la plus difficile. Une étape qui n'a pas encore de questions apparaît avec un panneau 🚧.
// Pour la rendre jouable, il suffit d'ajouter une étape avec le même « id »
// dans le fichier de contenu du niveau (data/5e-conjugaison.js, etc.).

(function () {
  RM.NIVEAUX = [
    // (  = une espace insécable : « 6e » ne se retrouve jamais seul au début d'une ligne)
    { id: '6e', nom: '6e', titre: 'Je prépare la 6e', description: 'Les bases du CM2 et les nouveautés de 6e', saison: '🌸' },
    { id: '5e', nom: '5e', titre: 'La 5e', description: 'Le programme de 5e', saison: '🍂' },
    { id: '4e', nom: '4e', titre: 'La 4e', description: 'Le programme de 4e', saison: '❄️' },
    { id: '3e', nom: '3e', titre: 'La 3e', description: 'Le programme de 3e, jusqu’au brevet', saison: '🌙' },
  ];

  // Chaque niveau a sa saison : printemps, automne, hiver, nuit étoilée
  const DECORS = {
    '6e': {
      conjugaison: ['🌲', '🍄', '🌳', '🐿️', '🌼', '🦔', '🌲', '🍂', '🌳'],
      orthographe: ['🐟', '💧', '🐸', '🦆', '🌿', '🐚', '💧', '🐢', '🐟'],
      grammaire: ['⛰️', '🐐', '🌼', '🦋', '🌾', '🐑', '🏔️', '🌻', '🐞'],
      vocabulaire: ['🌸', '🌷', '🐝', '🌹', '🦋', '🌺', '🐞', '🌻', '🌼'],
      clairs: ['#E3F1E0', '#DFECF8', '#F1E6DA', '#FBE3EC'],
    },
    '5e': {
      conjugaison: ['🍂', '🍁', '🌰', '🍄', '🦔', '🍁', '🎃', '🌰', '🍂'],
      orthographe: ['🍁', '💧', '🦆', '🍂', '🐟', '🌧️', '🍁', '🐸', '💧'],
      grammaire: ['⛰️', '🍂', '🍄', '🦊', '🌾', '🍁', '🐗', '🌰', '🏔️'],
      vocabulaire: ['🍎', '🍐', '🎃', '🌻', '🍇', '🐌', '🍁', '🌰', '🍄'],
      clairs: ['#F3EBD9', '#E2EAF1', '#EFE3D3', '#F7E3E0'],
    },
    '4e': {
      conjugaison: ['❄️', '🌲', '⛄', '🦌', '🌨️', '🌲', '🐧', '❄️', '🧣'],
      orthographe: ['🧊', '❄️', '🐧', '🦭', '⛸️', '🧊', '🐟', '❄️', '🌨️'],
      grammaire: ['🏔️', '❄️', '🐐', '⛷️', '🌨️', '🦅', '🏔️', '❄️', '⛄'],
      vocabulaire: ['🌲', '❄️', '🐦', '☃️', '🍊', '🌟', '🧤', '❄️', '🎁'],
      clairs: ['#E6F0F2', '#E0EAF7', '#EDE7E2', '#F4E6EE'],
    },
    '3e': {
      conjugaison: ['🌙', '⭐', '🦉', '🌲', '✨', '🦇', '🌟', '🌲', '🌙'],
      orthographe: ['🌙', '✨', '🐟', '⭐', '💫', '🌊', '🌟', '🦢', '✨'],
      grammaire: ['🌙', '🦉', '⛰️', '⭐', '🌌', '🐺', '✨', '🏔️', '🌟'],
      vocabulaire: ['🌙', '🌸', '🦇', '✨', '🌷', '⭐', '🌺', '💫', '🌙'],
      clairs: ['#E6E4F2', '#DEE3F4', '#EAE5EE', '#F1E3EF'],
    },
  };

  // Les deux matières : chaque forêt a son côté français et son côté maths
  RM.MATIERES = [
    { id: 'francais', nom: 'Français', icone: '📖' },
    { id: 'maths', nom: 'Maths', icone: '🔢' },
  ];
  RM.MATIERE_PAR_DEFAUT = 'francais';

  // Le nom d'une forêt : « 6e » pour le français (comme avant les maths), « 6e-maths » pour les maths
  RM.idForet = (niveau, matiere) => (matiere === 'maths' ? `${niveau}-maths` : niveau);

  const etape = (id, titre, sousTitre, options = {}) => ({ id, titre, sousTitre, ...options });

  const ETAPES = {
    '6e': {
      conjugaison: [
        etape('conjugaison-present-1', 'Le présent', 'Verbes en -er, finir, être et avoir'),
        etape('conjugaison-present-2', 'Le présent (2)', 'aller, faire, dire, venir, pouvoir…'),
        etape('conjugaison-imparfait', 'L’imparfait', 'je chantais, nous finissions'),
        etape('conjugaison-futur', 'Le futur', 'je chanterai, nous finirons'),
        etape('conjugaison-passe-compose-avoir', 'Le passé composé (1)', 'avec avoir : j’ai chanté'),
        etape('conjugaison-passe-compose-etre', 'Le passé composé (2)', 'avec être : je suis allée'),
        etape('conjugaison-passe-simple', 'Le passé simple', 'il chanta, ils finirent', { sixieme: true }),
        etape('conjugaison-plus-que-parfait', 'Le plus-que-parfait', 'j’avais chanté', { sixieme: true }),
        etape('conjugaison-imperatif', 'L’impératif', 'chante ! finissons !', { sixieme: true }),
      ],
      orthographe: [
        etape('orthographe-a-ou-a', 'a ou à ?', 'Le verbe avoir ou le petit mot à'),
        etape('orthographe-et-ou-est', 'et ou est ?', 'Le petit mot et ou le verbe être'),
        etape('orthographe-son-ou-sont', 'son ou sont ?', 'son chat ou ils sont'),
        etape('orthographe-on-ou-ont', 'on ou ont ?', 'on joue ou ils ont'),
        etape('orthographe-ou-ou-ou', 'ou ou où ?', 'un choix ou un lieu'),
        etape('orthographe-ces-ou-ses', 'ces ou ses ?', 'ces arbres-là ou ses affaires à lui'),
        etape('orthographe-accord-sujet-verbe', 'Sujet et verbe', 'Les enfants jouent, il joue'),
        etape('orthographe-accords-groupe-nom', 'Le groupe du nom', 'des petites renardes rousses'),
        etape('orthographe-participe-passe', 'Le participe passé', 'elle est partie, ils sont venus'),
      ],
      grammaire: [
        etape('6e-grammaire-types-phrases', 'Les types de phrases', 'déclarative, interrogative, exclamative, impérative'),
        etape('6e-grammaire-nature-mots', 'La nature des mots', 'nom, verbe, adjectif, déterminant'),
        etape('6e-grammaire-sujet', 'Le sujet du verbe', 'Qui est-ce qui… ?'),
        etape('6e-grammaire-complements-circonstanciels', 'Les compléments circonstanciels', 'où ? quand ? comment ?'),
        etape('6e-grammaire-determinant-pronom', 'Déterminant ou pronom ?', 'le chat, je le vois'),
        etape('6e-grammaire-mots-invariables', 'Les mots invariables', 'adverbe, préposition, conjonction', { sixieme: true }),
        etape('6e-grammaire-cod-coi', 'COD ou COI ?', 'je mange une pomme, je parle à Léa'),
        etape('6e-grammaire-attribut', 'L’attribut du sujet', 'Roxy est rusée', { sixieme: true }),
      ],
      vocabulaire: [
        etape('6e-vocabulaire-synonymes', 'Les synonymes', 'content = heureux'),
        etape('6e-vocabulaire-contraires', 'Les contraires', 'grand ≠ petit'),
        etape('6e-vocabulaire-familles', 'Les familles de mots', 'terre, terrain, enterrer'),
        etape('6e-vocabulaire-prefixes', 'Les préfixes', 'impossible, refaire, défaire'),
        etape('6e-vocabulaire-suffixes', 'Les suffixes', 'nageur, jardinage, fillette'),
        etape('6e-vocabulaire-generiques', 'Les mots génériques', 'une pomme est un fruit'),
        etape('6e-vocabulaire-sens-propre-figure', 'Sens propre ou sens figuré ?', 'une tempête de neige, une tempête de rires', { sixieme: true }),
        etape('6e-vocabulaire-niveaux-langue', 'Les niveaux de langue', 'familier, courant, soutenu', { sixieme: true }),
      ],
    },
    '5e': {
      conjugaison: [
        etape('5e-conjugaison-passe-simple', 'Le passé simple', 'je chantai, nous finîmes, ils prirent'),
        etape('5e-conjugaison-imparfait-ou-passe-simple', 'Imparfait ou passé simple ?', 'il marchait… soudain, il sauta'),
        etape('5e-conjugaison-futur-anterieur', 'Le futur antérieur', 'j’aurai fini, elle sera partie'),
        etape('5e-conjugaison-conditionnel', 'Le conditionnel présent', 'je chanterais, nous ferions'),
        etape('5e-conjugaison-futur-ou-conditionnel', 'Futur ou conditionnel ?', 'je chanterai ou je chanterais'),
        etape('5e-conjugaison-subjonctif', 'Le subjonctif présent', 'il faut que je fasse'),
      ],
      orthographe: [
        etape('5e-orthographe-ce-ou-se', 'ce ou se ?', 'ce livre, il se lave'),
        etape('5e-orthographe-cest-ou-sest', 'c’est ou s’est ?', 'c’est beau, elle s’est cachée'),
        etape('5e-orthographe-leur-ou-leurs', 'leur ou leurs ?', 'je leur parle, leurs jouets'),
        etape('5e-orthographe-la-ou-la', 'la, l’a ou là ?', 'la pomme, il l’a vue, viens là'),
        etape('5e-orthographe-peu-ou-peut', 'peu, peut ou peux ?', 'un peu, il peut, je peux'),
        etape('5e-orthographe-pluriel-noms', 'Le pluriel des noms', 'des chevaux, des bijoux, des pneus'),
      ],
      grammaire: [
        etape('5e-grammaire-classes-mots', 'Les classes de mots', 'les huit natures, en révision'),
        etape('5e-grammaire-pronoms', 'Les sortes de pronoms', 'personnel, possessif, démonstratif, relatif'),
        etape('5e-grammaire-fonctions', 'Sujet, COD, COI ou attribut ?', 'les fonctions autour du verbe'),
        etape('5e-grammaire-complements-circonstanciels', 'Les compléments circonstanciels', 'lieu, temps, manière, cause, but'),
        etape('5e-grammaire-phrase-complexe', 'Phrase simple ou complexe ?', 'un verbe conjugué, ou plusieurs'),
        etape('5e-grammaire-propositions', 'Juxtaposées, coordonnées ou subordonnées ?', 'relier les propositions'),
      ],
      vocabulaire: [
        etape('5e-vocabulaire-champ-lexical', 'Le champ lexical', 'les mots de la mer, de la peur…'),
        etape('5e-vocabulaire-homonymes', 'Les homonymes', 'un ver, un verre, vert'),
        etape('5e-vocabulaire-formation-mots', 'Préfixe, radical, suffixe', 'dé-plac-ement'),
        etape('5e-vocabulaire-polysemie', 'Les mots à plusieurs sens', 'une souris, deux sens'),
        etape('5e-vocabulaire-expressions', 'Les expressions imagées', 'avoir un chat dans la gorge'),
        etape('5e-vocabulaire-emotions', 'Le vocabulaire des émotions', 'joie, peur, colère, tristesse'),
      ],
    },
    '4e': {
      conjugaison: [
        etape('4e-conjugaison-conditionnel-passe', 'Le conditionnel passé', 'j’aurais aimé, elle serait venue'),
        etape('4e-conjugaison-si-imparfait', 'Si + imparfait', 'si j’avais… je ferais'),
        etape('4e-conjugaison-subjonctif-passe', 'Le subjonctif passé', 'que j’aie fini, qu’elle soit partie'),
        etape('4e-conjugaison-indicatif-ou-subjonctif', 'Indicatif ou subjonctif ?', 'je sais que tu viens, il faut que tu viennes'),
        etape('4e-conjugaison-voix-passive', 'La voix passive', 'le gâteau est mangé par Roxy'),
        etape('4e-conjugaison-participe-present', 'Le participe présent', 'chantant, en finissant'),
      ],
      orthographe: [
        etape('4e-orthographe-participe-avoir', 'Le participe passé avec avoir', 'les fleurs que j’ai cueillies'),
        etape('4e-orthographe-quel-ou-quelle', 'quel, quelle ou qu’elle ?', 'quelle histoire ! je crois qu’elle vient'),
        etape('4e-orthographe-sans-ou-sen', 'sans ou s’en ?', 'sans sucre, il s’en va'),
        etape('4e-orthographe-quand-quant', 'quand, quant ou qu’en ?', 'quand tu viens, quant à moi'),
        etape('4e-orthographe-tout', 'tout, tous, toute ou toutes ?', 'tous les jours, toute contente'),
        etape('4e-orthographe-couleurs', 'Les adjectifs de couleur', 'des robes vertes, des yeux marron'),
      ],
      grammaire: [
        etape('4e-grammaire-expansions-nom', 'Épithète, complément du nom ou apposition ?', 'les expansions du nom'),
        etape('4e-grammaire-pronoms-relatifs', 'Les pronoms relatifs', 'qui, que, dont, où'),
        etape('4e-grammaire-subordonnees', 'Relative, complétive ou circonstancielle ?', 'les propositions subordonnées'),
        etape('4e-grammaire-circonstancielles', 'Les subordonnées circonstancielles', 'temps, cause, conséquence, but, condition'),
        etape('4e-grammaire-formes-phrase', 'Les formes de phrase', 'négative, passive, emphatique, impersonnelle'),
        etape('4e-grammaire-modes', 'Les modes du verbe', 'indicatif, subjonctif, impératif…'),
      ],
      vocabulaire: [
        etape('4e-vocabulaire-racines-latines', 'Les racines latines', 'aqua, terra, manus…'),
        etape('4e-vocabulaire-racines-grecques', 'Les racines grecques', 'hydro, géo, phobie…'),
        etape('4e-vocabulaire-paronymes', 'Les paronymes', 'éruption ou irruption ?'),
        etape('4e-vocabulaire-figures-style', 'Les figures de style', 'comparaison, métaphore, personnification…'),
        etape('4e-vocabulaire-connecteurs', 'Les connecteurs logiques', 'donc, car, mais, pourtant…'),
        etape('4e-vocabulaire-melioratif-pejoratif', 'Mélioratif ou péjoratif ?', 'une demeure ou une bicoque'),
      ],
    },
    '3e': {
      conjugaison: [
        etape('3e-conjugaison-passe-anterieur', 'Le passé antérieur', 'quand il eut fini, il partit'),
        etape('3e-conjugaison-subjonctif-imparfait', 'Le subjonctif imparfait', 'qu’il chantât, qu’il fût'),
        etape('3e-conjugaison-si-plus-que-parfait', 'Si + plus-que-parfait', 'si j’avais su, je serais venu'),
        etape('3e-conjugaison-discours-indirect', 'Le discours indirect', 'il a dit qu’il viendrait'),
        etape('3e-conjugaison-reconnaitre-temps', 'Reconnaître un temps', '« nous aurions chanté » : quel temps ?'),
        etape('3e-conjugaison-grande-revision', 'La grande révision', 'tous les temps, en désordre !'),
      ],
      orthographe: [
        etape('3e-orthographe-participe-pronominaux', 'Participe passé des verbes pronominaux', 'elles se sont levées, elles se sont parlé'),
        etape('3e-orthographe-quelque', 'quelque ou quel que ?', 'quelques amis, quelle que soit ta réponse'),
        etape('3e-orthographe-adjectif-verbal', 'Participe présent ou adjectif verbal ?', 'fatiguant ou fatigant'),
        etape('3e-orthographe-nombres', 'Écrire les nombres', 'quatre-vingts, deux cents, mille'),
        etape('3e-orthographe-homophones', 'Les homophones : révision', 'tous les pièges, mélangés'),
        etape('3e-orthographe-participe-revision', 'Le participe passé : révision', 'être, avoir, verbes pronominaux'),
      ],
      grammaire: [
        etape('3e-grammaire-classes-revision', 'Les classes de mots : révision', 'la nature de chaque mot'),
        etape('3e-grammaire-fonctions-revision', 'Les fonctions : révision', 'sujet, COD, épithète, apposition…'),
        etape('3e-grammaire-subordonnees', 'Les propositions subordonnées', 'relative, complétive, interrogative indirecte…'),
        etape('3e-grammaire-rapports-logiques', 'Les rapports logiques', 'cause, conséquence, but, opposition, concession'),
        etape('3e-grammaire-valeurs-present', 'Les valeurs du présent', 'vérité générale, habitude, narration…'),
        etape('3e-grammaire-voix-passive', 'Voix active ou passive ?', 'et le complément d’agent'),
      ],
      vocabulaire: [
        etape('3e-vocabulaire-figures-style', 'Les figures de style', 'antithèse, oxymore, gradation…'),
        etape('3e-vocabulaire-etymologie', 'Racines grecques et latines', 'révision : chrono, bio, omni…'),
        etape('3e-vocabulaire-mots-rares', 'Des mots pour briller', 'éphémère, perspicace, indolent…'),
        etape('3e-vocabulaire-modalisation', 'Certitude ou doute ?', 'sans doute, peut-être, il semble…'),
        etape('3e-vocabulaire-registres', 'Les registres', 'comique, tragique, lyrique, épique…'),
        etape('3e-vocabulaire-locutions-latines', 'Les expressions latines', 'a priori, in extremis…'),
      ],
    },
  };

  // Les 4 zones du côté français d'une forêt, avec leurs étapes
  // (une zone marquée « bientot: true » apparaîtrait fermée, avec un panneau « Bientôt ! »)
  // nomCourt : le nom de la zone dans l'espace parent et sur les boutons du haut de la carte
  function foret(niveau) {
    const decors = DECORS[niveau];
    const zones = [
      {
        id: 'conjugaison', niveau, nom: 'Le Sentier de la Conjugaison', nomCourt: 'Conjugaison', icone: '🌲',
        couleur: '#4E9A5A', couleurClaire: decors.clairs[0], decors: decors.conjugaison,
        etapes: ETAPES[niveau].conjugaison,
      },
      {
        id: 'orthographe', niveau, nom: 'La Rivière de l’Orthographe', nomCourt: 'Orthographe', icone: '🌊',
        couleur: '#3E8FD1', couleurClaire: decors.clairs[1], decors: decors.orthographe,
        etapes: ETAPES[niveau].orthographe,
      },
      {
        id: 'grammaire', niveau, nom: 'La Colline de la Grammaire', nomCourt: 'Grammaire', icone: '⛰️',
        couleur: '#A67C52', couleurClaire: decors.clairs[2], decors: decors.grammaire,
        etapes: ETAPES[niveau].grammaire,
      },
      {
        id: 'vocabulaire', niveau, nom: 'Le Jardin du Vocabulaire', nomCourt: 'Vocabulaire', icone: '🌸',
        couleur: '#EC6F9B', couleurClaire: decors.clairs[3], decors: decors.vocabulaire,
        etapes: ETAPES[niveau].vocabulaire,
      },
    ];
    return zones.map(zone => ({ ...zone, matiere: 'francais', foret: niveau }));
  }

  // RM.FORETS : pour chaque forêt (« 6e », « 6e-maths »…), la liste de ses zones
  RM.FORETS = {};
  RM.NIVEAUX.forEach(n => { RM.FORETS[n.id] = foret(n.id); });
  RM.NIVEAU_PAR_DEFAUT = '6e';

  // Le niveau et la matière d'une forêt, d'après son nom
  RM.infosForet = function (id) {
    const zone = RM.FORETS[id]?.[0];
    if (!zone) return null;
    return {
      id,
      niveau: RM.NIVEAUX.find(n => n.id === zone.niveau),
      matiere: RM.MATIERES.find(m => m.id === zone.matiere),
    };
  };
})();
