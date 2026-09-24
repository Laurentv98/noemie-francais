// Renard Malin — le plan des forêts : une forêt par niveau (6e, 5e, 4e, 3e)
//
// Chaque forêt a ses chemins (zones), et chaque chemin ses étapes, de la plus facile
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
      clairs: ['#E3F1E0', '#DFECF8'],
    },
    '5e': {
      conjugaison: ['🍂', '🍁', '🌰', '🍄', '🦔', '🍁', '🎃', '🌰', '🍂'],
      orthographe: ['🍁', '💧', '🦆', '🍂', '🐟', '🌧️', '🍁', '🐸', '💧'],
      clairs: ['#F3EBD9', '#E2EAF1'],
    },
    '4e': {
      conjugaison: ['❄️', '🌲', '⛄', '🦌', '🌨️', '🌲', '🐧', '❄️', '🧣'],
      orthographe: ['🧊', '❄️', '🐧', '🦭', '⛸️', '🧊', '🐟', '❄️', '🌨️'],
      clairs: ['#E6F0F2', '#E0EAF7'],
    },
    '3e': {
      conjugaison: ['🌙', '⭐', '🦉', '🌲', '✨', '🦇', '🌟', '🌲', '🌙'],
      orthographe: ['🌙', '✨', '🐟', '⭐', '💫', '🌊', '🌟', '🦢', '✨'],
      clairs: ['#E6E4F2', '#DEE3F4'],
    },
  };

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
    },
  };

  // Les 4 zones d'une forêt : deux chemins construits, deux « Bientôt ! »
  function foret(niveau) {
    const decors = DECORS[niveau];
    return [
      {
        id: 'conjugaison', niveau, nom: 'Le Sentier de la Conjugaison', matiere: 'Conjugaison', icone: '🌲',
        couleur: '#4E9A5A', couleurClaire: decors.clairs[0], decors: decors.conjugaison,
        etapes: ETAPES[niveau].conjugaison,
      },
      {
        id: 'orthographe', niveau, nom: 'La Rivière de l’Orthographe', matiere: 'Orthographe', icone: '🌊',
        couleur: '#3E8FD1', couleurClaire: decors.clairs[1], decors: decors.orthographe,
        etapes: ETAPES[niveau].orthographe,
      },
      {
        id: 'grammaire', niveau, nom: 'La Colline de la Grammaire', matiere: 'Grammaire', icone: '⛰️',
        couleur: '#A67C52', couleurClaire: '#F1E6DA', bientot: true, etapes: [],
      },
      {
        id: 'vocabulaire', niveau, nom: 'Le Jardin du Vocabulaire', matiere: 'Vocabulaire', icone: '🌸',
        couleur: '#EC6F9B', couleurClaire: '#FBE3EC', bientot: true, etapes: [],
      },
    ];
  }

  RM.FORETS = {};
  RM.NIVEAUX.forEach(n => { RM.FORETS[n.id] = foret(n.id); });
  RM.NIVEAU_PAR_DEFAUT = '6e';
})();
