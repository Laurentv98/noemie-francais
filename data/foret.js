// Renard Malin — le plan de la forêt
//
// Chaque zone de la carte est un chemin d'étapes, de la plus facile à la plus difficile.
// Une étape qui n'a pas encore de questions apparaît avec un panneau 🚧 : Roxy la prépare.
// Pour la rendre jouable, il suffit d'ajouter une étape avec le même « id »
// dans data/conjugaison.js ou data/orthographe.js.

RM.FORET = [
  {
    id: 'conjugaison',
    nom: 'Le Sentier de la Conjugaison',
    matiere: 'Conjugaison',
    icone: '🌲',
    couleur: '#4E9A5A',
    couleurClaire: '#E3F1E0',
    decors: ['🌲', '🍄', '🌳', '🐿️', '🌼', '🦔', '🌲', '🍂', '🌳'],
    etapes: [
      { id: 'conjugaison-present-1', titre: 'Le présent', sousTitre: 'Verbes en -er, finir, être et avoir' },
      { id: 'conjugaison-present-2', titre: 'Le présent (2)', sousTitre: 'aller, faire, dire, venir, pouvoir…' },
      { id: 'conjugaison-imparfait', titre: 'L’imparfait', sousTitre: 'je chantais, nous finissions' },
      { id: 'conjugaison-futur', titre: 'Le futur', sousTitre: 'je chanterai, nous finirons' },
      { id: 'conjugaison-passe-compose-avoir', titre: 'Le passé composé (1)', sousTitre: 'avec avoir : j’ai chanté' },
      { id: 'conjugaison-passe-compose-etre', titre: 'Le passé composé (2)', sousTitre: 'avec être : je suis allée' },
      { id: 'conjugaison-passe-simple', titre: 'Le passé simple', sousTitre: 'il chanta, ils finirent', sixieme: true },
      { id: 'conjugaison-plus-que-parfait', titre: 'Le plus-que-parfait', sousTitre: 'j’avais chanté', sixieme: true },
      { id: 'conjugaison-imperatif', titre: 'L’impératif', sousTitre: 'chante ! finissons !', sixieme: true },
    ],
  },
  {
    id: 'orthographe',
    nom: 'La Rivière de l’Orthographe',
    matiere: 'Orthographe',
    icone: '🌊',
    couleur: '#3E8FD1',
    couleurClaire: '#DFECF8',
    decors: ['🐟', '💧', '🐸', '🦆', '🌿', '🐚', '💧', '🐢', '🐟'],
    etapes: [
      { id: 'orthographe-a-ou-a', titre: 'a ou à ?', sousTitre: 'Le verbe avoir ou le petit mot à' },
      { id: 'orthographe-et-ou-est', titre: 'et ou est ?', sousTitre: 'Le petit mot et ou le verbe être' },
      { id: 'orthographe-son-ou-sont', titre: 'son ou sont ?', sousTitre: 'son chat ou ils sont' },
      { id: 'orthographe-on-ou-ont', titre: 'on ou ont ?', sousTitre: 'on joue ou ils ont' },
      { id: 'orthographe-ou-ou-ou', titre: 'ou ou où ?', sousTitre: 'un choix ou un lieu' },
      { id: 'orthographe-ces-ou-ses', titre: 'ces ou ses ?', sousTitre: 'ces arbres-là ou ses affaires à lui' },
      { id: 'orthographe-accord-sujet-verbe', titre: 'Sujet et verbe', sousTitre: 'Les enfants jouent, il joue' },
      { id: 'orthographe-accords-groupe-nom', titre: 'Le groupe du nom', sousTitre: 'des petites renardes rousses' },
      { id: 'orthographe-participe-passe', titre: 'Le participe passé', sousTitre: 'elle est partie, ils sont venus' },
    ],
  },
  {
    id: 'grammaire',
    nom: 'La Colline de la Grammaire',
    matiere: 'Grammaire',
    icone: '⛰️',
    couleur: '#A67C52',
    couleurClaire: '#F1E6DA',
    bientot: true,
    etapes: [],
  },
  {
    id: 'vocabulaire',
    nom: 'Le Jardin du Vocabulaire',
    matiere: 'Vocabulaire',
    icone: '🌸',
    couleur: '#EC6F9B',
    couleurClaire: '#FBE3EC',
    bientot: true,
    etapes: [],
  },
];
