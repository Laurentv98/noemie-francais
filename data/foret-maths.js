// Renard Malin — le plan du côté maths des forêts : une forêt par niveau (6e, 5e, 4e, 3e)
//
// Comme pour le français (data/foret.js), chaque forêt a 4 chemins, et chaque chemin ses étapes,
// de la plus facile à la plus difficile. Ils suivent les 4 grands thèmes du programme de maths du collège :
// les nombres et le calcul, la géométrie, les grandeurs et les mesures, les données (et les fonctions).
// Les questions de chaque étape sont dans data/6e-nombres.js, data/6e-geometrie.js, etc.

(function () {
  // Chaque niveau a sa saison, comme dans la forêt du français
  const DECORS = {
    '6e': {
      nombres: ['🔢', '🐿️', '🌰', '🍄', '🐞', '🌼', '🐌', '🌱', '🌷'],
      geometrie: ['📐', '🦋', '🌷', '🔷', '🐝', '🌼', '🔶', '🐞', '🌿'],
      mesures: ['📏', '⚖️', '⏰', '🌾', '🐓', '🧺', '🌻', '🥛', '🐑'],
      donnees: ['📊', '🍓', '🥕', '🍎', '🧺', '🥖', '🍒', '🧀', '🍐'],
      clairs: ['#ECE6F7', '#DDF1EE', '#FBF1D6', '#FBE4DF'],
    },
    '5e': {
      nombres: ['🔢', '🌰', '🍂', '🦔', '🍄', '🍁', '🐿️', '🍂', '🌰'],
      geometrie: ['📐', '🍁', '🔶', '🦉', '🍂', '🔷', '🍄', '🔺', '🌰'],
      mesures: ['📏', '⚖️', '🎃', '⏰', '🍎', '🌽', '🧺', '🍐', '🥧'],
      donnees: ['📊', '🍎', '🍇', '🥧', '🧺', '🍐', '🌽', '🎃', '🍯'],
      clairs: ['#EDE4F1', '#E0EEEA', '#F6EBD3', '#F6E2DA'],
    },
    '4e': {
      nombres: ['🔢', '❄️', '🐧', '⛄', '🌨️', '🧊', '🦭', '❄️', '🦌'],
      geometrie: ['📐', '❄️', '🔷', '⛸️', '🔺', '🌲', '🔶', '❄️', '🏔️'],
      mesures: ['📏', '⚖️', '⏰', '🧣', '☕', '🧤', '🕯️', '🍪', '⛷️'],
      donnees: ['📊', '🍊', '🎁', '🍪', '☕', '🧁', '🍫', '🎄', '🥨'],
      clairs: ['#E9E7F5', '#DEEEF0', '#F1EDE0', '#F3E4E6'],
    },
    '3e': {
      nombres: ['🔢', '🌙', '⭐', '🦉', '✨', '🌟', '🦇', '💫', '🌙'],
      geometrie: ['📐', '✨', '🔷', '🌙', '🔺', '⭐', '🔶', '🌌', '💫'],
      mesures: ['📏', '🔭', '🌍', '⏰', '🌙', '🪐', '⭐', '🧭', '✨'],
      donnees: ['📊', '🌟', '🎲', '🌙', '📈', '✨', '🦉', '🎯', '💫'],
      clairs: ['#E5E1F3', '#DDE8EE', '#ECE8E0', '#EEE3EC'],
    },
  };

  const etape = (id, titre, sousTitre, options = {}) => ({ id, titre, sousTitre, ...options });

  const ETAPES = {
    '6e': {
      nombres: [
        etape('6e-nombres-grands-nombres', 'Les grands nombres', 'mille, million, milliard'),
        etape('6e-nombres-decimaux', 'Les nombres décimaux', 'dixièmes, centièmes, millièmes'),
        etape('6e-nombres-comparer', 'Comparer et arrondir', '2,5 < 2,51 · arrondir au dixième'),
        etape('6e-nombres-addition', 'Additionner et soustraire', 'avec des nombres décimaux'),
        etape('6e-nombres-fois-10', '× et ÷ par 10, 100, 1 000', '3,5 × 100 = 350'),
        etape('6e-nombres-multiplication', 'Multiplier', 'les tables et les nombres décimaux', { sixieme: true }),
        etape('6e-nombres-division', 'Diviser', 'quotient, reste et critères de divisibilité', { sixieme: true }),
        etape('6e-nombres-fractions', 'Les fractions', 'les ¾ d’une tarte, les fractions égales', { sixieme: true }),
      ],
      geometrie: [
        etape('6e-geometrie-vocabulaire', 'Points, droites et segments', '[AB], (AB), [AB)'),
        etape('6e-geometrie-perpendiculaires', 'Perpendiculaires et parallèles', 'les droites qui se croisent… ou jamais', { sixieme: true }),
        etape('6e-geometrie-angles', 'Les angles', 'aigu, droit, obtus', { sixieme: true }),
        etape('6e-geometrie-triangles', 'Triangles et quadrilatères', 'isocèle, losange, rectangle…'),
        etape('6e-geometrie-cercle', 'Le cercle', 'centre, rayon, diamètre'),
        etape('6e-geometrie-symetrie', 'La symétrie axiale', 'l’effet miroir', { sixieme: true }),
        etape('6e-geometrie-solides', 'Les solides', 'faces, arêtes et sommets'),
      ],
      mesures: [
        etape('6e-mesures-longueurs', 'Les longueurs', 'km, m, cm, mm'),
        etape('6e-mesures-masses-contenances', 'Masses et contenances', 'kg, g, L, cL'),
        etape('6e-mesures-durees', 'Les durées', 'heures, minutes, secondes'),
        etape('6e-mesures-perimetre', 'Le périmètre', 'faire le tour d’une figure'),
        etape('6e-mesures-aire', 'L’aire', 'cm², rectangle et triangle rectangle', { sixieme: true }),
        etape('6e-mesures-volume', 'Le volume', 'cm³, pavé droit et litres', { sixieme: true }),
      ],
      donnees: [
        etape('6e-donnees-tableaux', 'Tableaux et graphiques', 'lire un diagramme en barres'),
        etape('6e-donnees-problemes', 'Résoudre des problèmes', 'quelle opération choisir ?'),
        etape('6e-donnees-proportionnalite', 'La proportionnalité', 'est-ce proportionnel ?'),
        etape('6e-donnees-calculer', 'Calculer avec la proportionnalité', '3 gâteaux → 6 œufs, 5 gâteaux → ?'),
        etape('6e-donnees-pourcentages', 'Les pourcentages', '50 %, 25 %, 10 % d’un nombre', { sixieme: true }),
        etape('6e-donnees-echelles', 'Les échelles', 'sur le plan, 1 cm pour 1 km', { sixieme: true }),
      ],
    },
    '5e': {
      nombres: [
        etape('5e-nombres-priorites', 'Les priorités de calcul', '2 + 3 × 4 = 14'),
        etape('5e-nombres-relatifs', 'Les nombres relatifs', '−3 < 2, sur la droite graduée'),
        etape('5e-nombres-relatifs-addition', 'Additionner des relatifs', '(−5) + (+3) = −2'),
        etape('5e-nombres-fractions-egales', 'Fractions égales', 'simplifier et comparer'),
        etape('5e-nombres-fractions-addition', 'Additionner des fractions', '1/2 + 1/4 = 3/4'),
        etape('5e-nombres-calcul-litteral', 'Le calcul littéral', '3x + 2 quand x = 4'),
      ],
      geometrie: [
        etape('5e-geometrie-inegalite-triangulaire', 'Construire un triangle', 'l’inégalité triangulaire'),
        etape('5e-geometrie-angles-triangle', 'Les angles du triangle', 'leur somme fait 180°'),
        etape('5e-geometrie-angles-paralleles', 'Angles et parallèles', 'alternes-internes, correspondants'),
        etape('5e-geometrie-parallelogramme', 'Le parallélogramme', 'et ses propriétés'),
        etape('5e-geometrie-symetrie-centrale', 'La symétrie centrale', 'le demi-tour'),
        etape('5e-geometrie-reperage', 'Se repérer dans le plan', 'abscisse et ordonnée'),
      ],
      mesures: [
        etape('5e-mesures-aire-triangle', 'L’aire du triangle', 'base × hauteur ÷ 2'),
        etape('5e-mesures-aires', 'Aires : parallélogramme et figures', 'découper pour calculer'),
        etape('5e-mesures-cercle', 'Le cercle et le disque', 'périmètre et aire avec π'),
        etape('5e-mesures-prismes', 'Prismes et cylindres', 'aire de la base × hauteur'),
        etape('5e-mesures-conversions', 'Convertir des aires et des volumes', 'm², cm³ et litres'),
        etape('5e-mesures-durees', 'Calculer avec les durées', '1,5 h = 1 h 30 min'),
      ],
      donnees: [
        etape('5e-donnees-proportionnalite', 'La proportionnalité', 'le coefficient et le tableau'),
        etape('5e-donnees-pourcentages', 'Les pourcentages', 'appliquer et calculer un pourcentage'),
        etape('5e-donnees-ratios', 'Les ratios', 'partager dans le ratio 2 : 3'),
        etape('5e-donnees-effectifs', 'Effectifs et fréquences', 'lire une série statistique'),
        etape('5e-donnees-moyenne', 'La moyenne', 'la moyenne de ses notes'),
        etape('5e-donnees-probabilites', 'Le hasard', 'certain, impossible, une chance sur deux'),
      ],
    },
    '4e': {
      nombres: [
        etape('4e-nombres-relatifs-multiplication', 'Multiplier des relatifs', 'la règle des signes'),
        etape('4e-nombres-fractions-multiplication', 'Multiplier et diviser des fractions', 'multiplier par l’inverse'),
        etape('4e-nombres-puissances', 'Les puissances', '2⁵, 10⁻³'),
        etape('4e-nombres-notation-scientifique', 'La notation scientifique', '3,2 × 10⁴'),
        etape('4e-nombres-developper', 'Développer et réduire', 'k(a + b), (a + b)(c + d)'),
        etape('4e-nombres-equations', 'Les équations', '3x + 5 = 20'),
      ],
      geometrie: [
        etape('4e-geometrie-pythagore', 'Le théorème de Pythagore', 'calculer une longueur'),
        etape('4e-geometrie-reciproque-pythagore', 'Rectangle ou pas ?', 'la réciproque de Pythagore'),
        etape('4e-geometrie-cosinus', 'Le cosinus', 'côté adjacent ÷ hypoténuse'),
        etape('4e-geometrie-thales', 'Le théorème de Thalès', 'des triangles emboîtés'),
        etape('4e-geometrie-translation', 'La translation', 'faire glisser une figure'),
        etape('4e-geometrie-droites-remarquables', 'Les droites du triangle', 'médiatrice, hauteur, médiane'),
      ],
      mesures: [
        etape('4e-mesures-pyramide-cone', 'Pyramides et cônes', 'un tiers de base × hauteur'),
        etape('4e-mesures-aires', 'Les aires : révision', 'triangle, disque, parallélogramme…'),
        etape('4e-mesures-vitesse', 'La vitesse moyenne', 'distance ÷ durée'),
        etape('4e-mesures-conversions-vitesses', 'Convertir des vitesses', 'km/h et m/s'),
        etape('4e-mesures-grandeurs-quotients', 'Débits et prix', 'L/min, €/kg'),
        etape('4e-mesures-prefixes', 'Du nano au giga', 'les préfixes des unités'),
      ],
      donnees: [
        etape('4e-donnees-quatrieme-proportionnelle', 'La quatrième proportionnelle', 'le produit en croix'),
        etape('4e-donnees-graphiques', 'Proportionnalité et graphiques', 'une droite qui passe par l’origine'),
        etape('4e-donnees-pourcentages', 'Augmenter et diminuer', '+20 %, c’est × 1,2'),
        etape('4e-donnees-mediane', 'Moyenne et médiane', 'le milieu de la série'),
        etape('4e-donnees-probabilites', 'Les probabilités', 'calculer ses chances'),
        etape('4e-donnees-fonctions', 'La notion de fonction', 'image et antécédent'),
      ],
    },
    '3e': {
      nombres: [
        etape('3e-nombres-premiers', 'Les nombres premiers', '60 = 2² × 3 × 5'),
        etape('3e-nombres-fractions', 'Fractions irréductibles', 'simplifier au maximum'),
        etape('3e-nombres-developper', 'Développer', 'double distributivité, (a + b)²'),
        etape('3e-nombres-factoriser', 'Factoriser', 'facteur commun, a² − b²'),
        etape('3e-nombres-equations', 'Mettre en équation', 'résoudre un problème'),
        etape('3e-nombres-produit-nul', 'L’équation produit nul', '(x − 2)(x + 5) = 0'),
      ],
      geometrie: [
        etape('3e-geometrie-thales', 'Le théorème de Thalès', 'triangles emboîtés ou papillon'),
        etape('3e-geometrie-reciproque-thales', 'Parallèles ou pas ?', 'la réciproque de Thalès'),
        etape('3e-geometrie-trigonometrie', 'Cosinus, sinus, tangente', 'SOH CAH TOA'),
        etape('3e-geometrie-trigonometrie-calculs', 'Calculer avec la trigonométrie', 'une longueur, un angle'),
        etape('3e-geometrie-transformations', 'Les transformations', 'symétries, translation, rotation, homothétie'),
        etape('3e-geometrie-triangles-semblables', 'Les triangles semblables', 'mêmes angles, longueurs proportionnelles'),
      ],
      mesures: [
        etape('3e-mesures-sphere', 'La sphère et la boule', 'aire et volume'),
        etape('3e-mesures-agrandissement', 'Agrandir et réduire', 'aires × k², volumes × k³'),
        etape('3e-mesures-sections', 'Les sections de solides', 'couper un solide par un plan'),
        etape('3e-mesures-grandeurs-composees', 'Les grandeurs composées', 'vitesse, débit, conversions'),
        etape('3e-mesures-volumes', 'Les volumes : révision', 'tous les solides'),
        etape('3e-mesures-reperage', 'Se repérer dans l’espace', 'pavé droit, latitude et longitude'),
      ],
      donnees: [
        etape('3e-donnees-fonctions', 'Les fonctions', 'image, antécédent, graphique'),
        etape('3e-donnees-fonctions-lineaires', 'Les fonctions linéaires', 'f(x) = ax'),
        etape('3e-donnees-fonctions-affines', 'Les fonctions affines', 'f(x) = ax + b'),
        etape('3e-donnees-statistiques', 'Les statistiques', 'moyenne, médiane, étendue'),
        etape('3e-donnees-probabilites', 'Les probabilités', 'deux épreuves, des arbres'),
        etape('3e-donnees-evolutions', 'Les évolutions en pourcentage', 'le coefficient multiplicateur'),
      ],
    },
  };

  // Les 4 zones du côté maths d'une forêt, avec leurs étapes
  function foretMaths(niveau) {
    const decors = DECORS[niveau];
    const id = RM.idForet(niveau, 'maths');
    const avecFonctions = niveau === '4e' || niveau === '3e';
    const zones = [
      {
        id: 'nombres', nom: 'La Grotte des Nombres', nomCourt: 'Nombres et calculs', icone: '🔢',
        couleur: '#8E6CD1', couleurClaire: decors.clairs[0], decors: decors.nombres,
        etapes: ETAPES[niveau].nombres,
      },
      {
        id: 'geometrie', nom: 'La Clairière de la Géométrie', nomCourt: 'Géométrie', icone: '📐',
        couleur: '#26A69A', couleurClaire: decors.clairs[1], decors: decors.geometrie,
        etapes: ETAPES[niveau].geometrie,
      },
      {
        id: 'mesures', nom: 'Le Moulin des Mesures', nomCourt: 'Grandeurs et mesures', icone: '📏',
        couleur: '#D08A12', couleurClaire: decors.clairs[2], decors: decors.mesures,
        etapes: ETAPES[niveau].mesures,
      },
      {
        id: 'donnees', nom: 'Le Marché des Données', nomCourt: avecFonctions ? 'Données et fonctions' : 'Données et proportionnalité',
        icone: '📊', couleur: '#E5604E', couleurClaire: decors.clairs[3], decors: decors.donnees,
        etapes: ETAPES[niveau].donnees,
      },
    ];
    return zones.map(zone => ({ ...zone, niveau, matiere: 'maths', foret: id }));
  }

  RM.NIVEAUX.forEach(n => { RM.FORETS[RM.idForet(n.id, 'maths')] = foretMaths(n.id); });
})();
