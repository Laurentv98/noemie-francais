// Renard Malin — Vocabulaire, niveau 6e : les 8 étapes du Jardin du Vocabulaire
//
// Les phrases et les mots sont écrits à la main. Le mot à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement, tirerType } = RM.phrases;

  // Le mot souligné d'une phrase de la banque : « Roxy est [[contente]]. » → « contente »
  const motSouligne = phrase => RM.phrases.groupeSouligne(phrase);

  // ======================================================================
  // 1. Les synonymes
  // ======================================================================
  // [phrase avec le mot à remplacer, le synonyme (bien accordé), les pièges]
  const SYNONYMES = [
    ['Roxy est très [[contente]] de te voir.', 'heureuse', ['triste', 'fâchée', 'fatiguée']],
    ['Le lièvre court [[vite]].', 'rapidement', ['lentement', 'doucement', 'souvent']],
    ['Ce château est [[immense]].', 'gigantesque', ['minuscule', 'ancien', 'joli']],
    ['Le spectacle [[commence]] à huit heures.', 'débute', ['finit', 's’arrête', 'se termine']],
    ['Quel [[joli]] papillon !', 'beau', ['laid', 'petit', 'lent']],
    ['Le chien est [[effrayé]] par l’orage.', 'apeuré', ['calmé', 'réveillé', 'mouillé']],
    ['Tom a [[terminé]] ses devoirs.', 'fini', ['commencé', 'oublié', 'perdu']],
    ['Cette soupe est [[délicieuse]].', 'excellente', ['fade', 'froide', 'salée']],
    ['Mamie nous a [[donné]] un cadeau.', 'offert', ['pris', 'volé', 'caché']],
    ['Léa a [[bâti]] une cabane.', 'construit', ['détruit', 'dessiné', 'cherché']],
    ['Le renard est un animal [[rusé]].', 'malin', ['naïf', 'peureux', 'bruyant']],
    ['La pie a [[dérobé]] une bague.', 'volé', ['rendu', 'trouvé', 'acheté']],
    ['Ce film était vraiment [[drôle]].', 'amusant', ['triste', 'long', 'ennuyeux']],
    ['Les enfants [[bavardent]] dans la cour.', 'discutent', ['écoutent', 'dessinent', 'dorment']],
    ['Ce sac est très [[lourd]].', 'pesant', ['léger', 'grand', 'neuf']],
    ['Le chat [[observe]] l’oiseau.', 'regarde', ['ignore', 'attrape', 'entend']],
    ['Roxy [[aperçoit]] une lumière au loin.', 'voit', ['cache', 'éteint', 'entend']],
    ['Ce problème est [[facile]].', 'simple', ['difficile', 'long', 'bizarre']],
    ['J’ai [[trouvé]] la solution.', 'découvert', ['perdu', 'oublié', 'caché']],
    ['Tom [[habite]] près de l’école.', 'vit', ['joue', 'passe', 'court']],
    ['Le vent est très [[fort]] ce soir.', 'violent', ['faible', 'doux', 'chaud']],
    ['Mon voisin est [[timide]].', 'réservé', ['bavard', 'courageux', 'grand']],
    ['Le lapin [[bondit]] dans le pré.', 'saute', ['dort', 'mange', 'marche']],
    ['Cette pièce est très [[sombre]].', 'obscure', ['claire', 'grande', 'froide']],
    ['Cette histoire est [[vraie]].', 'réelle', ['inventée', 'longue', 'drôle']],
  ];

  ajouterEtape({
    id: '6e-vocabulaire-synonymes',
    banque: SYNONYMES,
    creerQuestion: ([phrase, synonyme, pieges]) => question({
      consigne: 'Quel mot peut remplacer le mot souligné, sans changer le sens ?',
      enonce: phrase,
      reponse: synonyme,
      pieges,
      solution: `« ${motSouligne(phrase)} » = <b>${synonyme}</b>`,
      explication: `« ${motSouligne(phrase)} » et « ${synonyme} » ont le même sens ici : ce sont des <b>synonymes</b>.`,
    }),
    titreLecon: 'Les synonymes',
    lecon: `
      <p>Des <b>synonymes</b> sont des mots qui ont <b>le même sens</b>, ou presque.</p>
      <p>👉 <i>content</i> = <i>heureux</i> · <i>vite</i> = <i>rapidement</i> · <i>commencer</i> = <i>débuter</i></p>
      <p>Un synonyme est de la <b>même nature</b> que le mot qu’il remplace : un adjectif se remplace par un adjectif,
        un verbe par un verbe.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot dans la phrase. Si la phrase garde le même sens,
        c’est un synonyme !<br><i>Roxy est <u>contente</u></i> → <i>Roxy est <u>heureuse</u></i> ✔</div>
      <p>⚠️ Les synonymes évitent les répétitions : c’est très utile quand on écrit une rédaction !</p>
    `,
  });

  // ======================================================================
  // 2. Les contraires
  // ======================================================================
  // [phrase avec le mot souligné, le contraire (bien accordé), un synonyme pour piéger (ou null), les autres pièges]
  const CONTRAIRES = [
    ['Cette valise est très [[lourde]].', 'légère', 'pesante', ['grande', 'neuve']],
    ['Le chien de Papi est très [[vieux]].', 'jeune', 'âgé', ['gros', 'sage']],
    ['Ce soir, la mer est [[calme]].', 'agitée', 'tranquille', ['bleue', 'froide']],
    ['Ce cheval est très [[rapide]].', 'lent', 'vif', ['beau', 'grand']],
    ['La soupe est encore [[chaude]].', 'froide', 'brûlante', ['salée', 'épaisse']],
    ['Le ciel est [[clair]] ce matin.', 'sombre', 'lumineux', ['bleu', 'immense']],
    ['Tom est un garçon [[courageux]].', 'peureux', 'brave', ['gentil', 'bavard']],
    ['Léa est toujours [[gaie]].', 'triste', 'joyeuse', ['polie', 'pressée']],
    ['Tes mains sont [[propres]].', 'sales', 'lavées', ['froides', 'petites']],
    ['La porte du jardin est [[ouverte]].', 'fermée', null, ['verte', 'lourde', 'neuve']],
    ['Ce roi était très [[riche]].', 'pauvre', 'fortuné', ['puissant', 'célèbre']],
    ['Cet exercice est [[difficile]].', 'facile', 'compliqué', ['long', 'nouveau']],
    ['Le voisin de Mamie est très [[gentil]].', 'méchant', 'aimable', ['grand', 'pressé']],
    ['Le chaton est tout [[mouillé]].', 'sec', 'trempé', ['petit', 'noir']],
    ['Ma tasse est [[pleine]].', 'vide', 'remplie', ['bleue', 'chaude']],
    ['Cet élève est très [[attentif]].', 'distrait', 'concentré', ['poli', 'jeune']],
    ['Roxy [[allume]] la lampe.', 'éteint', null, ['répare', 'porte', 'cherche']],
    ['Léa [[monte]] l’escalier.', 'descend', 'grimpe', ['balaie', 'regarde']],
    ['Le chat [[entre]] par la fenêtre.', 'sort', 'pénètre', ['saute', 'regarde']],
    ['Tom a [[gagné]] la course.', 'perdu', 'remporté', ['couru', 'regardé']],
    ['Nous [[achetons]] du pain.', 'vendons', null, ['mangeons', 'coupons', 'cherchons']],
    ['Le train [[arrive]] en retard.', 'part', null, ['roule', 'siffle', 'freine']],
    ['Inès [[aime]] les épinards.', 'déteste', 'adore', ['cuisine', 'achète']],
    ['Zoé [[trouve]] ses clés.', 'perd', 'retrouve', ['range', 'compte']],
    ['Les enfants [[chuchotent]].', 'crient', 'murmurent', ['jouent', 'lisent']],
    ['Roxy marche [[lentement]].', 'rapidement', 'doucement', ['souvent', 'encore']],
    ['Je me couche [[tôt]].', 'tard', 'de bonne heure', ['bien', 'souvent']],
    ['Léa dessine [[bien]].', 'mal', 'correctement', ['vite', 'souvent']],
    ['Le chat dort [[sous]] la table.', 'sur', null, ['devant', 'derrière', 'près de']],
    ['Roxy pleure de [[joie]].', 'tristesse', 'bonheur', ['fatigue', 'faim']],
    ['J’aime le [[silence]] de la forêt.', 'bruit', 'calme', ['parfum', 'feuillage']],
    ['Le match s’est terminé par une [[victoire]].', 'défaite', 'réussite', ['surprise', 'fête']],
    ['Tom et Hugo sont des [[amis]].', 'ennemis', 'copains', ['voisins', 'cousins']],
  ];

  ajouterEtape({
    id: '6e-vocabulaire-contraires',
    banque: CONTRAIRES,
    creerQuestion: ([phrase, contraire, synonyme, autres]) => question({
      consigne: 'Quel est le contraire du mot souligné ?',
      enonce: phrase,
      reponse: contraire,
      pieges: [synonyme, ...autres].filter(Boolean),
      solution: `« ${motSouligne(phrase)} » ≠ <b>${contraire}</b>`,
      explication: `« ${motSouligne(phrase)} » et « ${contraire} » ont des sens opposés : ce sont des <b>contraires</b>.`
        + (synonyme ? `<br>⚠️ « ${synonyme} » a le même sens (ou presque) : c’est un synonyme, pas un contraire !` : ''),
    }),
    titreLecon: 'Les contraires',
    lecon: `
      <p>Des <b>contraires</b> (on dit aussi des <b>antonymes</b>) sont des mots de <b>sens opposé</b>.</p>
      <p>👉 <i>grand</i> ≠ <i>petit</i> · <i>allumer</i> ≠ <i>éteindre</i> · <i>lentement</i> ≠ <i>rapidement</i></p>
      <p>Un contraire est de la <b>même nature</b> que le mot : un adjectif a pour contraire un adjectif,
        un verbe a pour contraire un verbe.</p>
      <p>On peut aussi former un contraire avec un <b>préfixe</b> : <i>heureux</i> ≠ <i>malheureux</i>, <i>faire</i> ≠ <i>défaire</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot dans la phrase. Si la phrase dit <b>l’inverse</b>,
        c’est le contraire !<br><i>Ma tasse est <u>pleine</u></i> → <i>Ma tasse est <u>vide</u></i> ✔</div>
      <p>⚠️ Ne confonds pas avec le <b>synonyme</b>, qui a le <b>même</b> sens : <i>pleine</i> = <i>remplie</i>.</p>
    `,
  });

  // ======================================================================
  // 3. Les familles de mots
  // ======================================================================
  // Deux sortes de questions :
  // - 'meme' : [sorte, le mot, son radical, le mot de la même famille, les pièges, la remarque de Roxy]
  // - 'intrus' : [sorte, le mot, son radical, l’intrus, les trois mots de la famille, la remarque de Roxy]
  // (L’étymologie de chaque mot a été vérifiée : les faux amis n’ont vraiment aucun lien avec le mot de départ.)
  const FAMILLES = [
    ['meme', 'dent', 'dent', 'dentiste', ['accident', 'bouche', 'prudent'],
      '« accident » et « prudent » contiennent les lettres « dent », mais ils n’ont rien à voir avec les dents !'],
    ['meme', 'terre', 'terr', 'souterrain', ['terrible', 'sol', 'tonnerre'],
      'Souterrain = sous la terre. Attention : « terrible » est de la famille de « terreur » (du latin <i>terrere</i>, effrayer), pas de « terre ».'],
    ['meme', 'fleur', 'fleur', 'fleuriste', ['fleuve', 'rose', 'flocon'],
      'Le fleuriste vend des fleurs. Le « fleuve » ressemble à « fleur », mais c’est un cours d’eau !'],
    ['meme', 'chant', 'chant', 'chanteur', ['chantier', 'musique', 'champ'],
      'Un « chantier » est un lieu où l’on construit : rien à voir avec le chant !'],
    ['meme', 'bois', 'bois', 'déboiser', ['boisson', 'arbre', 'poison'],
      'Déboiser, c’est couper les arbres d’un bois. La « boisson » vient de « boire », pas de « bois ».'],
    ['meme', 'chat', 'chat', 'chaton', ['château', 'souris', 'châtaigne'],
      '« château » et « châtaigne » commencent comme « chat », mais ils n’ont aucun lien avec cet animal.'],
    ['meme', 'vent', 'vent', 'éventail', ['ventre', 'tempête', 'vendeur'],
      'Un éventail sert à faire du vent ! Le « ventre » et le « vendeur » n’ont rien à voir avec le vent.'],
    ['meme', 'grand', 'grand', 'agrandir', ['grange', 'géant', 'grenier'],
      'Agrandir, c’est rendre plus grand. « géant » a un sens proche, mais pas le même radical.'],
    ['meme', 'lent', 'lent', 'ralentir', ['lentille', 'tortue', 'lancer'],
      'Ralentir, c’est aller plus lentement. La « lentille » est une petite graine : rien à voir !'],
    ['meme', 'poisson', 'poisson', 'poissonnier', ['poison', 'requin', 'boisson'],
      'Le poissonnier vend du poisson. Attention : « poison » ne s’écrit pas pareil et n’a pas le même sens !'],
    ['meme', 'jour', 'jour', 'journée', ['jouet', 'soir', 'joue'],
      'Le « jouet » vient de « jouer », pas de « jour ».'],
    ['meme', 'mouche', 'mouch', 'moucheron', ['mouchoir', 'abeille', 'mousse'],
      'Un moucheron est une petite mouche. Mais le « mouchoir » vient de « se moucher » !'],
    ['meme', 'fer', 'fer', 'ferraille', ['fermier', 'acier', 'fermer'],
      'La ferraille, ce sont de vieux morceaux de fer. Le « fermier » travaille à la ferme, et « fermer » vient d’un autre mot : rien à voir avec le fer !'],
    ['meme', 'cheval', 'cheval', 'chevalier', ['cheveu', 'poney', 'chèvre'],
      'Le chevalier, c’est celui qui va à cheval ! Le « cheveu » et la « chèvre » n’ont rien à voir.'],
    ['meme', 'sauter', 'saut', 'sursauter', ['saule', 'bondir', 'sauce'],
      'Sursauter, c’est faire un petit saut de surprise. Le « saule » est un arbre : rien à voir !'],
    ['meme', 'neige', 'neig', 'enneigé', ['flocon', 'nager', 'hiver'],
      'Enneigé = couvert de neige. Le « flocon » fait penser à la neige, mais il n’a pas le même radical.'],
    ['intrus', 'terre', 'terr', 'terrible', ['terrain', 'enterrer', 'terrasse'],
      'Ce mot est de la famille de « terreur » (du latin <i>terrere</i>, effrayer), pas de « terre ».'],
    ['intrus', 'dent', 'dent', 'accident', ['dentiste', 'dentifrice', 'édenté'],
      'Il contient les lettres « dent », mais un accident n’a rien à voir avec les dents.'],
    ['intrus', 'fleur', 'fleur', 'fleuve', ['fleurir', 'fleuriste', 'fleurette'],
      'Un fleuve est un grand cours d’eau : rien à voir avec les fleurs !'],
    ['intrus', 'chant', 'chant', 'chantier', ['chanteur', 'chanter', 'chantonner'],
      'Un chantier est un lieu où l’on construit : rien à voir avec le chant !'],
    ['intrus', 'bois', 'bois', 'boisson', ['boisé', 'déboiser', 'sous-bois'],
      'Ce mot vient de « boire », pas de « bois ».'],
    ['intrus', 'chat', 'chat', 'château', ['chaton', 'chatière', 'chatte'],
      'Il commence comme « chat », mais un château n’a rien à voir avec cet animal !'],
    ['intrus', 'vent', 'vent', 'ventre', ['venteux', 'paravent', 'éventail'],
      'Le ventre n’a rien à voir avec le vent !'],
    ['intrus', 'grand', 'grand', 'grange', ['grandir', 'grandeur', 'agrandir'],
      'Une grange est un bâtiment de ferme : rien à voir avec « grand ».'],
    ['intrus', 'lent', 'lent', 'lentille', ['lenteur', 'ralentir', 'lentement'],
      'La lentille est une petite graine : rien à voir avec « lent ».'],
    ['intrus', 'jour', 'jour', 'jouet', ['journée', 'bonjour', 'aujourd’hui'],
      'Ce mot vient de « jouer », pas de « jour ».'],
    ['intrus', 'froid', 'froid', 'froisser', ['froideur', 'refroidir', 'froidement'],
      'Froisser, c’est chiffonner : rien à voir avec le froid !'],
    ['intrus', 'rond', 'rond', 'ronce', ['arrondir', 'rondelle', 'rondeur'],
      'La ronce est une plante à épines : rien à voir avec « rond ».'],
    ['intrus', 'sauter', 'saut', 'saule', ['sursauter', 'sautiller', 'sauteur'],
      'Le saule est un arbre : rien à voir avec « sauter ».'],
    ['intrus', 'neige', 'neig', 'flocon', ['neiger', 'enneigé', 'déneiger'],
      'Le flocon fait penser à la neige, mais il n’a pas le même radical : un mot du même thème n’est pas forcément de la même famille !'],
    ['intrus', 'mur', 'mur', 'murmure', ['muraille', 'muret', 'murer'],
      'Un murmure est un bruit très léger : rien à voir avec un mur !'],
    ['intrus', 'rose', 'ros', 'roseau', ['rosier', 'rosé', 'roseraie'],
      'Le roseau est une plante qui pousse au bord de l’eau : rien à voir avec la rose !'],
  ];

  // Une liste de mots entre guillemets : « a », « b » et « c »
  const liste = mots => mots.map(m => `« ${m} »`).join(', ').replace(/, ([^,]*)$/, ' et $1');

  ajouterEtape({
    id: '6e-vocabulaire-familles',
    banque: FAMILLES,
    creerQuestion: ([sorte, mot, radical, reponse, autres, remarque]) => {
      if (sorte === 'meme') {
        return question({
          consigne: 'Cherche le radical !',
          enonce: `Quel mot est de la même famille que « ${mot} » ?`,
          reponse,
          pieges: autres,
          solution: `« ${mot} » → <b>${reponse}</b>`,
          explication: `« ${reponse} » est de la famille de « ${mot} » : on y retrouve le radical <b>${radical}</b>, `
            + `et le sens est lié.<br>${remarque}`,
        });
      }
      return question({
        consigne: 'Trouve l’intrus !',
        enonce: `Quel mot n’est pas de la famille de « ${mot} » ?`,
        reponse,
        pieges: autres,
        solution: `L’intrus : <b>${reponse}</b>`,
        explication: `« ${reponse} » n’est pas de la famille de « ${mot} ». ${remarque}<br>`
          + `${liste(autres)} ont le radical <b>${radical}</b> et un sens lié à « ${mot} ».`,
      });
    },
    titreLecon: 'Les familles de mots',
    lecon: `
      <p>Une <b>famille de mots</b> regroupe des mots formés sur le même <b>radical</b>, et qui ont un <b>sens lié</b>.</p>
      <p>👉 <i><b>terr</b>e, <b>terr</b>ain, <b>terr</b>asse, en<b>terr</b>er, sou<b>terr</b>ain</i></p>
      <p>Autour du radical, on ajoute un <b>préfixe</b> (devant) ou un <b>suffixe</b> (derrière) : <i>sou-terr-ain</i>.</p>
      <h4>⚠️ Attention aux faux amis !</h4>
      <p>Certains mots se ressemblent, mais n’ont <b>aucun lien de sens</b> : <i>terrible</i> est de la famille de « terreur »
        (du latin <i>terrere</i>, effrayer), pas de « terre » ; un <i>chantier</i> n’a rien à voir avec le chant.</p>
      <p>Et un mot du même <b>thème</b> n’est pas forcément de la même famille : <i>flocon</i> fait penser à la neige,
        mais il n’a pas le radical « neig ».</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> explique le mot avec le mot de départ.<br>
        Un <i>dentiste</i> soigne les <u>dents</u> ✔ Un <i>accident</i>… n’a rien à voir avec les dents ✘</div>
    `,
  });

  // ======================================================================
  // 4. Les préfixes
  // ======================================================================
  // Le sens d'un préfixe : [phrase (le préfixe entre [[ ]]), le préfixe, son sens, les pièges, l'explication]
  const SENS_PREFIXES = [
    ['Tom doit [[re]]faire son dessin.', 're', 'à nouveau', ['le contraire', 'avant', 'trop'],
      'Refaire, c’est faire <b>à nouveau</b>.'],
    ['Léa [[ré]]écrit sa phrase au propre.', 'ré', 'à nouveau', ['le contraire', 'en dessous', 'avec'],
      'Réécrire, c’est écrire <b>à nouveau</b>. Devant une voyelle, « re- » devient souvent « ré- » (réécrire) '
        + 'ou « r- » (rouvrir, rallumer).'],
    ['Hugo [[dé]]boutonne sa veste.', 'dé', 'le contraire', ['à nouveau', 'avec', 'au-dessus'],
      'Déboutonner, c’est <b>le contraire</b> de boutonner.'],
    ['Le petit chat est [[mal]]heureux.', 'mal', 'le contraire', ['trop', 'à nouveau', 'avant'],
      'Être malheureux, c’est <b>ne pas</b> être heureux : « mal- » donne <b>le contraire</b>.'],
    ['Un chat [[in]]connu dort dans le jardin.', 'in', 'le contraire', ['à nouveau', 'avant', 'avec'],
      'Inconnu, c’est <b>le contraire</b> de connu : qui n’est pas connu.'],
    ['Le chien [[dés]]obéit à son maître.', 'dés', 'le contraire', ['avec', 'trop', 'à nouveau'],
      'Désobéir, c’est <b>le contraire</b> d’obéir. Devant une voyelle, « dé- » devient souvent « dés- ».'],
    ['Les hommes de la [[pré]]histoire taillaient des silex.', 'pré', 'avant', ['après', 'à nouveau', 'contre'],
      'La préhistoire, c’est la période <b>avant</b> l’histoire, avant l’invention de l’écriture.'],
    ['Papa [[pré]]chauffe le four.', 'pré', 'avant', ['trop', 'le contraire', 'à nouveau'],
      'Préchauffer le four, c’est le chauffer <b>avant</b> d’y mettre le plat.'],
    ['Un avion [[sur]]vole la forêt.', 'sur', 'au-dessus', ['en dessous', 'avant', 'avec'],
      'Survoler, c’est voler <b>au-dessus</b>.'],
    ['Ce camion est [[sur]]chargé.', 'sur', 'trop', ['pas assez', 'avant', 'à nouveau'],
      'Un camion surchargé est <b>trop</b> chargé.'],
    ['Papi range ses outils au [[sous]]-sol.', 'sous', 'en dessous', ['au-dessus', 'avant', 'contre'],
      'Le sous-sol, c’est la partie de la maison qui est <b>en dessous</b> du sol.'],
    ['Hugo met un [[anti]]vol sur son vélo.', 'anti', 'contre', ['avec', 'avant', 'à nouveau'],
      'Un antivol protège <b>contre</b> le vol.'],
    ['Il pleut : prends ton [[para]]pluie !', 'para', 'contre', ['avec', 'avant', 'trop'],
      'Un parapluie protège <b>contre</b> la pluie.'],
    ['Le [[co]]pilote aide le pilote.', 'co', 'avec', ['contre', 'avant', 'le contraire'],
      'Le copilote pilote <b>avec</b> le pilote.'],
    ['Ma petite sœur roule en [[tri]]cycle.', 'tri', 'trois', ['deux', 'quatre', 'à nouveau'],
      'Un tricycle a <b>trois</b> roues.'],
  ];

  // Former le contraire avec un préfixe : [le mot, le préfixe, les préfixes proposés]
  // Le contraire s'écrit toujours préfixe + mot (im + possible → impossible). Une seule réponse possible.
  const IN = ['in', 'im', 'il', 'ir'];
  const DE = ['dé', 're', 'in', 'im'];
  const MAL = ['mal', 'in', 'dé', 'im'];
  const PREFIXES_CONTRAIRES = [
    ['possible', 'im', IN], ['patient', 'im', IN], ['mobile', 'im', IN],
    ['lisible', 'il', IN], ['légal', 'il', IN],
    ['réel', 'ir', IN], ['régulier', 'ir', IN],
    ['visible', 'in', IN], ['utile', 'in', IN],
    ['faire', 'dé', DE], ['coller', 'dé', DE],
    ['habiller', 'dés', ['dé', 'dés', 're', 'in']],
    ['adroit', 'mal', MAL], ['honnête', 'mal', MAL],
    ['content', 'mé', ['mé', 'in', 'dé', 'im']],
  ];
  // La règle de chaque préfixe, pour l'explication de Roxy
  const REGLES_PREFIXES = {
    in: (mot, contraire) => `« in- » veut dire « pas » : ${contraire} = pas ${mot}.`,
    im: () => 'Devant <b>m</b>, <b>b</b> ou <b>p</b>, « in- » devient <b>« im- »</b>.',
    il: () => 'Devant <b>l</b>, « in- » devient <b>« il- »</b> : on écrit deux l.',
    ir: () => 'Devant <b>r</b>, « in- » devient <b>« ir- »</b> : on écrit deux r.',
    dé: (mot, contraire) => `« dé- » donne le contraire d’un verbe : ${contraire}, c’est le contraire de ${mot}.`,
    dés: () => 'Devant une voyelle ou un h muet, « dé- » devient souvent <b>« dés- »</b>.',
    mal: (mot, contraire) => `« mal- » donne le contraire : ${contraire} = pas ${mot}.`,
    mé: (mot, contraire) => `« mé- » donne le contraire : ${contraire} = pas ${mot}.`,
  };

  ajouterEtape({
    id: '6e-vocabulaire-prefixes',
    banque: [
      ...SENS_PREFIXES.map(ligne => ['sens', ...ligne]),
      ...PREFIXES_CONTRAIRES.map(ligne => ['contraire', ...ligne]),
    ],
    creerQuestion: ([sorte, ...ligne]) => {
      if (sorte === 'sens') {
        const [phrase, prefixe, sens, pieges, explication] = ligne;
        return question({
          consigne: 'Que veut dire le préfixe souligné ?',
          enonce: phrase,
          reponse: sens,
          pieges,
          solution: `« ${prefixe}- » = <b>${sens}</b>`,
          explication,
        });
      }
      const [mot, prefixe, proposes] = ligne;
      const contraire = prefixe + mot;
      const explication = `« ${mot} » → <b>${contraire}</b> : c’est son contraire.<br>${REGLES_PREFIXES[prefixe](mot, contraire)}`;
      if (tirerType({ ecrire: 0.5, choix: 0.5 }) === 'ecrire') {
        return question({
          type: 'ecrire',
          consigne: 'Écris le contraire de ce mot, en ajoutant un préfixe.',
          enonce: `« ${mot} » → ___`,
          reponse: contraire,
          explication,
        });
      }
      return question({
        consigne: 'Quel préfixe faut-il ajouter pour former le contraire ?',
        enonce: `« ${mot} » → ___${mot}`,
        reponse: `${prefixe}-`,
        choix: proposes.map(p => `${p}-`),
        solution: `« ${mot} » → <b>${prefixe}</b>${mot}`,
        explication,
      });
    },
    titreLecon: 'Les préfixes',
    lecon: `
      <p>Un <b>préfixe</b> est un petit morceau qu’on ajoute <b>devant</b> un mot pour en fabriquer un nouveau.
        Il change le sens du mot.</p>
      <table>
        <tr><th>préfixe</th><th>sens</th><th>exemples</th></tr>
        <tr><td><b>re-</b>, <b>ré-</b></td><td>à nouveau</td><td>refaire, réécrire</td></tr>
        <tr><td><b>in-</b>, <b>im-</b>, <b>il-</b>, <b>ir-</b></td><td>le contraire</td><td>inconnu, impossible, illisible, irréel</td></tr>
        <tr><td><b>dé-</b>, <b>dés-</b></td><td>le contraire</td><td>défaire, désobéir</td></tr>
        <tr><td><b>mal-</b>, <b>mé-</b></td><td>le contraire</td><td>malheureux, mécontent</td></tr>
        <tr><td><b>pré-</b></td><td>avant</td><td>préhistoire, préchauffer</td></tr>
        <tr><td><b>sur-</b></td><td>au-dessus, trop</td><td>survoler, surchargé</td></tr>
        <tr><td><b>sous-</b></td><td>en dessous</td><td>sous-sol</td></tr>
        <tr><td><b>anti-</b>, <b>para-</b></td><td>contre</td><td>antivol, parapluie</td></tr>
        <tr><td><b>co-</b></td><td>avec</td><td>copilote</td></tr>
        <tr><td><b>tri-</b></td><td>trois</td><td>tricycle</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> « in- » change selon la lettre qui suit :
        <b>im-</b> devant m, b, p (<i>impossible</i>) ; <b>il-</b> devant l (<i>illisible</i>) ; <b>ir-</b> devant r (<i>irréel</i>).</div>
      <p>⚠️ Le début d’un mot n’est pas toujours un préfixe : un <i>renard</i>, ce n’est pas un « nard » à nouveau !</p>
    `,
  });

  // ======================================================================
  // 5. Les suffixes
  // ======================================================================
  // Le sens d'un suffixe : [phrase (le suffixe entre [[ ]]), le suffixe, son sens, l'explication]
  // Les pièges sont pris parmi les autres sens (ils ne peuvent pas convenir).
  const SENS_SUFFIXES_POSSIBLES = ['petit', 'la personne qui fait', 'qu’on peut', 'l’action de', 'un magasin'];
  const SENS_SUFFIXES = [
    ['Une fill[[ette]] joue à la marelle.', 'ette', 'petit', 'Une fillette, c’est une <b>petite</b> fille.'],
    ['La chatte lèche son chat[[on]].', 'on', 'petit', 'Un chaton, c’est un <b>petit</b> chat.'],
    ['Ce jouet est démont[[able]].', 'able', 'qu’on peut', 'Un jouet démontable, c’est un jouet <b>qu’on peut</b> démonter.'],
    ['Maman fait le nettoy[[age]] de la cuisine.', 'age', 'l’action de', 'Le nettoyage, c’est <b>l’action de</b> nettoyer.'],
    ['Nous achetons un gâteau à la pâtiss[[erie]].', 'erie', 'un magasin', 'La pâtisserie, c’est <b>le magasin</b> du pâtissier.'],
    ['Sami est un bon jou[[eur]] de tennis.', 'eur', 'la personne qui fait', 'Un joueur, c’est <b>la personne qui</b> joue.'],
  ];
  // Trouver le mot : [question, le mot, les pièges, l'explication]
  const MOTS_SUFFIXES = [
    ['Comment appelle-t-on la personne qui nage ?', 'nageur', ['nageoire', 'nage', 'natation'],
      'Le suffixe <b>-eur</b> désigne la personne qui fait l’action : nager → un nageur.'],
    ['Comment appelle-t-on la personne qui chante ?', 'chanteur', ['chanson', 'chantier', 'chant'],
      'Le suffixe <b>-eur</b> désigne la personne qui fait l’action : chanter → un chanteur.'],
    ['Comment appelle-t-on une femme qui danse ?', 'danseuse', ['danseur', 'danse', 'dansante'],
      'Au féminin, le suffixe <b>-eur</b> devient souvent <b>-euse</b> : un danseur, une danseuse.'],
    ['Comment appelle-t-on la personne qui vend des fleurs ?', 'fleuriste', ['fleurette', 'floraison', 'fleuri'],
      'Le suffixe <b>-iste</b> désigne souvent un métier : fleuriste, dentiste.'],
    ['Comment appelle-t-on la personne qui vend du lait ?', 'laitier', ['laitage', 'laiterie', 'laitue'],
      'Le suffixe <b>-ier</b> désigne souvent un métier : laitier, pâtissier, pompier.'],
    ['Comment appelle-t-on la personne qui s’occupe d’un jardin ?', 'jardinier', ['jardinet', 'jardinage', 'jardinerie'],
      'Le suffixe <b>-ier</b> désigne souvent un métier : jardinier, pâtissier, pompier.'],
    ['Comment appelle-t-on le magasin où l’on vend du pain ?', 'boulangerie', ['boulanger', 'boulangère', 'baguette'],
      'Le suffixe <b>-erie</b> désigne souvent un magasin : la boulangerie est le magasin du boulanger.'],
    ['Comment appelle-t-on le magasin où l’on vend de la viande ?', 'boucherie', ['boucher', 'bouchère', 'bouchée'],
      'Le suffixe <b>-erie</b> désigne souvent un magasin : la boucherie est le magasin du boucher.'],
    ['Comment appelle-t-on une petite maison ?', 'maisonnette', ['maisonnée', 'manoir', 'palais'],
      'Le suffixe <b>-ette</b> veut dire « petit » : une maisonnette est une petite maison. '
        + '(La maisonnée, ce sont les gens qui vivent dans la maison.)'],
    ['Comment appelle-t-on le petit du renard ?', 'renardeau', ['renarde', 'renardière', 'goupil'],
      'Le suffixe <b>-eau</b> veut dire « petit » : le renardeau est le petit du renard, comme l’éléphanteau pour l’éléphant.'],
    ['Comment appelle-t-on un petit camion ?', 'camionnette', ['camionneur', 'remorque', 'camion-citerne'],
      'Le suffixe <b>-ette</b> veut dire « petit » : une camionnette est un petit camion. (Le camionneur, c’est celui qui conduit le camion.)'],
    ['Comment appelle-t-on un petit jardin ?', 'jardinet', ['jardinier', 'jardinage', 'jardinerie'],
      'Le suffixe <b>-et</b> veut dire « petit » : un jardinet est un petit jardin.'],
    ['Un fruit qu’on peut manger est un fruit…', 'mangeable', ['mangé', 'mangeur', 'mangeoire'],
      'Le suffixe <b>-able</b> veut dire « qu’on peut » : mangeable = qu’on peut manger.'],
    ['Une écriture qu’on peut lire est une écriture…', 'lisible', ['lue', 'lectrice', 'liseuse'],
      'Le suffixe <b>-ible</b> veut dire « qu’on peut » : lisible = qu’on peut lire.'],
    ['Comment appelle-t-on l’action de laver ?', 'lavage', ['laveur', 'lavable', 'lavoir'],
      'Le suffixe <b>-age</b> désigne une action : le lavage, c’est l’action de laver.'],
    ['Comment appelle-t-on l’action de bricoler ?', 'bricolage', ['bricoleur', 'bricole', 'bricolé'],
      'Le suffixe <b>-age</b> désigne une action : le bricolage, c’est l’action de bricoler.'],
    ['Comment appelle-t-on l’arbre qui donne des pommes ?', 'pommier', ['pommeraie', 'pommette', 'compote'],
      'Le suffixe <b>-ier</b> sert aussi à nommer les arbres fruitiers : pommier, poirier, cerisier. '
        + '(Une pommeraie, c’est un verger de pommiers.)'],
    ['Comment appelle-t-on l’arbre qui donne des cerises ?', 'cerisier', ['cerisaie', 'griotte', 'noyau'],
      'Le suffixe <b>-ier</b> sert aussi à nommer les arbres fruitiers : cerisier, pommier, poirier. '
        + '(Une cerisaie, c’est un verger de cerisiers.)'],
  ];
  // Les adverbes en -ment : [l'adjectif, l'adverbe, les pièges, l'explication]
  const ADVERBES = [
    ['lent', 'lentement', ['lenteur', 'ralentir', 'lente'],
      'On met l’adjectif au féminin, « lente », et on ajoute <b>-ment</b> : lentement.'],
    ['doux', 'doucement', ['douceur', 'adoucir', 'douce'],
      'On met l’adjectif au féminin, « douce », et on ajoute <b>-ment</b> : doucement.'],
    ['joyeux', 'joyeusement', ['joie', 'joyeuse', 'réjouir'],
      'On met l’adjectif au féminin, « joyeuse », et on ajoute <b>-ment</b> : joyeusement.'],
    ['heureux', 'heureusement', ['bonheur', 'heureuse', 'joyeusement'],
      'On met l’adjectif au féminin, « heureuse », et on ajoute <b>-ment</b> : heureusement.'],
    ['facile', 'facilement', ['facilité', 'faciliter', 'rapidement'],
      '« facile » s’écrit pareil au féminin : on ajoute <b>-ment</b> : facilement.'],
    ['vrai', 'vraiment', ['vérité', 'vraie', 'véritable'],
      '« vrai » se termine par une voyelle : on ajoute directement <b>-ment</b>, sans e : vraiment.'],
    ['poli', 'poliment', ['politesse', 'polie', 'impoli'],
      '« poli » se termine par une voyelle : on ajoute directement <b>-ment</b>, sans e : poliment.'],
    ['gentil', 'gentiment', ['gentillesse', 'gentille', 'amabilité'],
      'Attention, c’est une exception : gentil → <b>gentiment</b> (sans l !).'],
  ];

  ajouterEtape({
    id: '6e-vocabulaire-suffixes',
    banque: [
      ...SENS_SUFFIXES.map(ligne => ['sens', ...ligne]),
      ...MOTS_SUFFIXES.map(ligne => ['mot', ...ligne]),
      ...ADVERBES.map(ligne => ['adverbe', ...ligne]),
    ],
    creerQuestion: ([sorte, ...ligne]) => {
      if (sorte === 'sens') {
        const [phrase, suffixe, sens, explication] = ligne;
        return question({
          consigne: 'Que veut dire le suffixe souligné ?',
          enonce: phrase,
          reponse: sens,
          pieges: RM.melanger(SENS_SUFFIXES_POSSIBLES.filter(s => s !== sens)).slice(0, 3),
          solution: `« -${suffixe} » = <b>${sens}</b>`,
          explication,
        });
      }
      if (sorte === 'mot') {
        const [enonce, reponse, pieges, explication] = ligne;
        return question({ consigne: 'Choisis le mot formé avec le bon suffixe.', enonce, reponse, pieges, explication });
      }
      const [adjectif, adverbe, pieges, explication] = ligne;
      const ecrire = tirerType({ ecrire: 0.5, choix: 0.5 }) === 'ecrire';
      return question({
        type: ecrire ? 'ecrire' : 'choix',
        consigne: ecrire ? 'Écris l’adverbe en -ment formé sur cet adjectif.' : 'Quel adverbe est formé sur cet adjectif ?',
        enonce: `« ${adjectif} » → ___`,
        reponse: adverbe,
        pieges,
        explication,
      });
    },
    titreLecon: 'Les suffixes',
    lecon: `
      <p>Un <b>suffixe</b> est un morceau qu’on ajoute <b>à la fin</b> d’un mot pour en fabriquer un nouveau.
        Il change le sens du mot, et souvent sa nature.</p>
      <table>
        <tr><th>suffixe</th><th>sens</th><th>exemples</th></tr>
        <tr><td><b>-eur</b>, <b>-euse</b>, <b>-iste</b></td><td>la personne qui fait</td><td>nageur, danseuse, fleuriste</td></tr>
        <tr><td><b>-ier</b></td><td>un métier, un arbre</td><td>jardinier, pommier</td></tr>
        <tr><td><b>-erie</b></td><td>un magasin</td><td>boulangerie</td></tr>
        <tr><td><b>-ette</b>, <b>-et</b>, <b>-eau</b>, <b>-on</b></td><td>petit</td><td>fillette, jardinet, renardeau, chaton</td></tr>
        <tr><td><b>-able</b>, <b>-ible</b></td><td>qu’on peut</td><td>lavable, lisible</td></tr>
        <tr><td><b>-age</b></td><td>l’action de</td><td>lavage, bricolage</td></tr>
        <tr><td><b>-ment</b></td><td>un adverbe (la manière)</td><td>lentement</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pour l’adverbe, prends l’adjectif au <b>féminin</b> et ajoute <b>-ment</b> :
        lente → <i>lentement</i>, douce → <i>doucement</i>.<br>
        Mais si l’adjectif finit par une voyelle : vrai → <i>vraiment</i>, poli → <i>poliment</i>. Et gentil → <i>gentiment</i> !</div>
    `,
  });

  // ======================================================================
  // 6. Les mots génériques
  // ======================================================================
  // Trouver le mot générique : [les mots spécifiques, le mot générique, les pièges, l'explication]
  const GENERIQUES = [
    ['pomme, poire, cerise', 'fruit', ['légume', 'arbre', 'fleur'],
      'La pomme, la poire et la cerise sont des <b>fruits</b>.'],
    ['carotte, poireau, navet', 'légume', ['fruit', 'céréale', 'fleur'],
      'La carotte, le poireau et le navet sont des <b>légumes</b>.'],
    ['rose, tulipe, marguerite', 'fleur', ['arbre', 'légume', 'fruit'],
      'La rose, la tulipe et la marguerite sont des <b>fleurs</b>.'],
    ['chêne, sapin, bouleau', 'arbre', ['fleur', 'légume', 'forêt'],
      'Le chêne, le sapin et le bouleau sont des <b>arbres</b>. (Une forêt, c’est un ensemble d’arbres.)'],
    ['marteau, scie, tournevis', 'outil', ['jouet', 'meuble', 'vêtement'],
      'Le marteau, la scie et le tournevis sont des <b>outils</b>.'],
    ['chaise, table, armoire', 'meuble', ['outil', 'jouet', 'vêtement'],
      'La chaise, la table et l’armoire sont des <b>meubles</b>.'],
    ['pantalon, jupe, chemise', 'vêtement', ['chaussure', 'meuble', 'bijou'],
      'Le pantalon, la jupe et la chemise sont des <b>vêtements</b>.'],
    ['bague, collier, bracelet', 'bijou', ['vêtement', 'jouet', 'outil'],
      'La bague, le collier et le bracelet sont des <b>bijoux</b>.'],
    ['rouge, vert, jaune', 'couleur', ['forme', 'saison', 'fleur'],
      'Le rouge, le vert et le jaune sont des <b>couleurs</b>.'],
    ['lundi, mardi, jeudi', 'jour', ['mois', 'saison', 'année'],
      'Lundi, mardi et jeudi sont des <b>jours</b> de la semaine.'],
    ['janvier, mars, juillet', 'mois', ['jour', 'saison', 'année'],
      'Janvier, mars et juillet sont des <b>mois</b>.'],
    ['guitare, flûte, violon', 'instrument de musique', ['outil', 'jouet', 'meuble'],
      'La guitare, la flûte et le violon sont des <b>instruments de musique</b>.'],
    ['football, tennis, natation', 'sport', ['métier', 'jouet', 'saison'],
      'Le football, le tennis et la natation sont des <b>sports</b>.'],
    ['moineau, merle, pigeon', 'oiseau', ['insecte', 'poisson', 'reptile'],
      'Le moineau, le merle et le pigeon sont des <b>oiseaux</b>.'],
    ['requin, truite, sardine', 'poisson', ['oiseau', 'insecte', 'reptile'],
      'Le requin, la truite et la sardine sont des <b>poissons</b>.'],
    ['fourmi, abeille, coccinelle', 'insecte', ['oiseau', 'poisson', 'reptile'],
      'La fourmi, l’abeille et la coccinelle sont des <b>insectes</b>.'],
    ['médecin, boulanger, pompier', 'métier', ['sport', 'outil', 'magasin'],
      'Médecin, boulanger et pompier sont des <b>métiers</b>.'],
    ['voiture, bus, train', 'véhicule', ['outil', 'meuble', 'jouet'],
      'La voiture, le bus et le train sont des <b>véhicules</b>.'],
  ];
  // Trouver l'intrus : [le groupe, les trois mots du groupe, l'intrus, l'explication]
  const INTRUS = [
    ['un outil', ['marteau', 'scie', 'tournevis'], 'tabouret',
      'Le tabouret est un <b>meuble</b>. Le marteau, la scie et le tournevis sont des outils.'],
    ['un fruit', ['banane', 'fraise', 'abricot'], 'carotte',
      'La carotte est un <b>légume</b>. La banane, la fraise et l’abricot sont des fruits.'],
    ['un légume', ['poireau', 'navet', 'chou'], 'framboise',
      'La framboise est un <b>fruit</b>. Le poireau, le navet et le chou sont des légumes.'],
    ['une fleur', ['tulipe', 'rose', 'pâquerette'], 'sapin',
      'Le sapin est un <b>arbre</b>. La tulipe, la rose et la pâquerette sont des fleurs.'],
    ['un oiseau', ['aigle', 'hirondelle', 'mésange'], 'papillon',
      'Le papillon vole, mais c’est un <b>insecte</b>. L’aigle, l’hirondelle et la mésange sont des oiseaux.'],
    ['un insecte', ['fourmi', 'papillon', 'mouche'], 'escargot',
      'L’escargot n’est pas un insecte : il n’a pas de pattes ! La fourmi, le papillon et la mouche sont des insectes.'],
    ['un poisson', ['saumon', 'truite', 'thon'], 'grenouille',
      'La grenouille vit souvent dans l’eau, mais ce n’est pas un poisson. Le saumon, la truite et le thon sont des poissons.'],
    ['un meuble', ['lit', 'commode', 'buffet'], 'casserole',
      'La casserole est un <b>ustensile de cuisine</b>. Le lit, la commode et le buffet sont des meubles.'],
    ['un vêtement', ['manteau', 'pull', 'robe'], 'valise',
      'La valise sert à transporter des vêtements, mais ce n’en est pas un. Le manteau, le pull et la robe sont des vêtements.'],
    ['un instrument de musique', ['flûte', 'trompette', 'tambour'], 'pinceau',
      'Le pinceau est un <b>outil</b> pour peindre. La flûte, la trompette et le tambour sont des instruments de musique.'],
    ['un mois', ['avril', 'mai', 'octobre'], 'mardi',
      'Mardi est un <b>jour</b> de la semaine. Avril, mai et octobre sont des mois.'],
    ['une couleur', ['bleu', 'vert', 'gris'], 'carré',
      'Le carré est une <b>forme</b>. Le bleu, le vert et le gris sont des couleurs.'],
    ['un métier', ['boulanger', 'facteur', 'coiffeur'], 'voisin',
      'Être voisin, ce n’est pas un métier ! Boulanger, facteur et coiffeur sont des métiers.'],
    ['un véhicule', ['camion', 'moto', 'tracteur'], 'garage',
      'Le garage est un <b>lieu</b> où l’on range les véhicules. Le camion, la moto et le tracteur sont des véhicules.'],
    ['un arbre', ['chêne', 'hêtre', 'érable'], 'marguerite',
      'La marguerite est une <b>fleur</b>. Le chêne, le hêtre et l’érable sont des arbres.'],
    ['un mammifère', ['vache', 'cheval', 'lapin'], 'poule',
      'La poule est un <b>oiseau</b> : elle a des plumes et pond des œufs. La vache, le cheval et le lapin sont des mammifères.'],
  ];

  ajouterEtape({
    id: '6e-vocabulaire-generiques',
    banque: [
      ...GENERIQUES.map(ligne => ['generique', ...ligne]),
      ...INTRUS.map(ligne => ['intrus', ...ligne]),
    ],
    creerQuestion: ([sorte, ...ligne]) => {
      if (sorte === 'generique') {
        const [mots, generique, pieges, explication] = ligne;
        return question({
          consigne: 'Quel mot générique regroupe tous ces mots ?',
          enonce: mots,
          reponse: generique,
          pieges,
          explication: `${explication}<br>« ${generique} » est le mot <b>générique</b> : il désigne toute la catégorie.`,
        });
      }
      const [groupe, membres, intrus, explication] = ligne;
      return question({
        consigne: 'Trouve l’intrus !',
        enonce: `Quel mot n’est pas ${groupe} ?`,
        reponse: intrus,
        pieges: membres,
        solution: `L’intrus : <b>${intrus}</b>`,
        explication,
      });
    },
    titreLecon: 'Les mots génériques',
    lecon: `
      <p>Un mot <b>générique</b> désigne toute une <b>catégorie</b>. Les mots <b>spécifiques</b> (ou particuliers)
        désignent chaque élément de cette catégorie.</p>
      <table>
        <tr><th>mot générique</th><th>mots spécifiques</th></tr>
        <tr><td><b>fruit</b></td><td>pomme, poire, cerise…</td></tr>
        <tr><td><b>outil</b></td><td>marteau, scie, tournevis…</td></tr>
        <tr><td><b>oiseau</b></td><td>moineau, merle, pigeon…</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> dis la phrase « Une pomme <b>est un</b>… ». Si elle est vraie,
        tu as trouvé le mot générique !<br><i>Une pomme est un légume</i> ✘ <i>Une pomme est un fruit</i> ✔</div>
      <p>⚠️ Méfie-toi des ressemblances : le papillon vole, mais ce n’est pas un oiseau, c’est un <b>insecte</b>.</p>
      <p>Le mot générique aide à éviter les répétitions : <i>J’ai cueilli des cerises. Ces <u>fruits</u> sont délicieux !</i></p>
    `,
  });

  // ======================================================================
  // 7. Sens propre ou sens figuré ?
  // ======================================================================
  ajouterClassement({
    id: '6e-vocabulaire-sens-propre-figure',
    consigne: 'Le {mot} souligné est-il employé au sens propre ou au sens figuré ?',
    nombreChoix: 2,
    categories: {
      propre: {
        nom: 'sens propre',
        regle: 'Au <b>sens propre</b>, le mot a son sens premier, concret : celui qu’on trouve en premier dans le dictionnaire.',
      },
      figure: {
        nom: 'sens figuré',
        regle: 'Au <b>sens figuré</b>, le sens devient imagé : on fait une comparaison avec le sens propre.',
      },
    },
    // [phrase, sens, ce que veut dire le mot ici] : le plus souvent, le même mot dans les deux sens
    banque: [
      ['Le chien a [[dévoré]] sa pâtée.', 'propre', 'Le chien a vraiment mangé sa pâtée, très vite.'],
      ['Léa a [[dévoré]] son livre en une soirée.', 'figure', 'Léa n’a pas mangé son livre : elle l’a lu très vite, avec passion.'],
      ['Une [[tempête]] souffle sur la mer.', 'propre', 'C’est une vraie tempête : un vent très violent.'],
      ['Une [[tempête]] de rires éclate dans la classe.', 'figure', 'Il n’y a pas de vent : les rires sont nombreux et bruyants, comme une tempête.'],
      ['Après la course, Tom sent son [[cœur]] battre fort.', 'propre', 'C’est le vrai cœur, qui bat dans la poitrine.'],
      ['Mamie a un [[cœur d’or]].', 'figure', 'Le groupe prend un sens imagé : le cœur de Mamie n’est pas en or, elle est très généreuse.'],
      ['Le soleil [[brille]] dans le ciel.', 'propre', 'Le soleil donne vraiment de la lumière.'],
      ['Inès [[brille]] en mathématiques.', 'figure', 'Inès ne donne pas de lumière : elle est très forte en mathématiques.'],
      ['Sami a les [[pieds]] mouillés.', 'propre', 'Ce sont les vrais pieds de Sami.'],
      ['Nous pique-niquons au [[pied]] de la montagne.', 'figure', 'La montagne n’a pas de pieds : c’est le bas de la montagne.'],
      ['La glace [[fond]] au soleil.', 'propre', 'La glace devient vraiment de l’eau.'],
      ['Zoé [[fond]] de tendresse devant le chaton.', 'figure', 'Zoé ne devient pas liquide : elle est très attendrie.'],
      ['Le feu [[brûle]] dans la cheminée.', 'propre', 'C’est un vrai feu.'],
      ['Hugo [[brûle]] d’impatience.', 'figure', 'Hugo ne brûle pas : il est très impatient.'],
      ['Papi [[coupe]] le pain.', 'propre', 'Papi coupe vraiment le pain, avec un couteau.'],
      ['Ne me [[coupe]] pas la parole !', 'figure', 'On ne coupe pas la parole avec un couteau : cela veut dire « interrompre ».'],
      ['Nous escaladons la [[montagne]].', 'propre', 'C’est une vraie montagne.'],
      ['Une [[montagne]] de cadeaux attend Zoé.', 'figure', 'Ce n’est pas une vraie montagne : il y a énormément de cadeaux.'],
      ['Le [[roi]] vit dans un grand château.', 'propre', 'C’est un vrai roi, qui gouverne un pays.'],
      ['Le lion est le [[roi]] des animaux.', 'figure', 'Le lion n’a pas de couronne : on veut dire qu’il est le plus fort, le plus admiré.'],
      ['Zoé [[caresse]] son chat.', 'propre', 'Zoé passe vraiment la main sur son chat.'],
      ['Le vent [[caresse]] les blés.', 'figure', 'Le vent n’a pas de main : il effleure doucement les blés.'],
      ['Les abeilles rentrent dans la [[ruche]].', 'propre', 'C’est la vraie maison des abeilles.'],
      ['Le jour de la fête, l’école est une vraie [[ruche]].', 'figure', 'Ce n’est pas une maison d’abeilles : l’école est pleine de gens qui s’agitent.'],
      ['Tom a les [[mains]] sales.', 'propre', 'Ce sont les vraies mains de Tom.'],
      ['Peux-tu me donner un [[coup de main]] ?', 'figure', 'Le groupe prend un sens imagé : donner un coup de main, ce n’est pas taper, c’est aider.'],
      ['Roxy a perdu la [[clé]] de la cabane.', 'propre', 'C’est une vraie clé, qui ouvre une serrure.'],
      ['Roxy a trouvé la [[clé]] du mystère.', 'figure', 'Ce n’est pas une vraie clé : c’est ce qui permet de comprendre le mystère.'],
      ['La [[pluie]] tombe depuis ce matin.', 'propre', 'C’est une vraie pluie : de l’eau qui tombe du ciel.'],
      ['Roxy reçoit une [[pluie]] de compliments.', 'figure', 'Il ne pleut pas : Roxy reçoit beaucoup de compliments à la fois.'],
      ['Les avions volent au-dessus des [[nuages]].', 'propre', 'Ce sont de vrais nuages, dans le ciel.'],
      ['Tom a toujours la tête dans les [[nuages]].', 'figure', 'Tom n’est pas dans le ciel : il est distrait, il rêve.'],
    ],
    titreLecon: 'Sens propre ou sens figuré ?',
    lecon: `
      <p>Un même mot peut avoir plusieurs sens.</p>
      <h4>Le sens propre</h4>
      <p>C’est le sens <b>premier</b>, concret : celui qu’on trouve en premier dans le dictionnaire.<br>
        👉 <i>Le chien a <b>dévoré</b> sa pâtée.</i> (il l’a vraiment mangée)</p>
      <h4>Le sens figuré</h4>
      <p>C’est un sens <b>imagé</b> : on fait une comparaison avec le sens propre.<br>
        👉 <i>Léa a <b>dévoré</b> son livre.</i> (elle l’a lu très vite, comme on mange quand on a très faim)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> demande-toi si c’est « pour de vrai ».
        Léa mange-t-elle vraiment son livre ? Non ! Alors c’est le <b>sens figuré</b>.</div>
      <p>Autres exemples : une tempête de neige (sens propre) / une tempête de rires (sens figuré) ;
        les pieds de Sami (sens propre) / le pied de la montagne (sens figuré).</p>
    `,
  });

  // ======================================================================
  // 8. Les niveaux de langue
  // ======================================================================
  // Les équivalents d'un mot dans les trois niveaux (null quand il n'y en a pas de simple)
  const equivalents = (familier, courant, soutenu) => [
    familier && `Familier : <i>${familier}</i>`,
    courant && `${familier ? 'courant' : 'Courant'} : <i>${courant}</i>`,
    soutenu && `soutenu : <i>${soutenu}</i>`,
  ].filter(Boolean).join(' · ');
  const LIVRE = equivalents('bouquin', 'livre', 'ouvrage');
  const VOITURE = equivalents('bagnole', 'voiture', null);
  const TRAVAIL = equivalents('boulot', 'travail', 'labeur');
  const MAISON = equivalents('baraque', 'maison', 'demeure');
  const PEUR = equivalents('trouille', 'peur', 'effroi');
  const SE_DEPECHER = equivalents('se grouiller', 'se dépêcher', 'se hâter');
  const VOLER = equivalents('piquer', 'voler', null);
  const RALER = equivalents('râler', 'protester', null);
  const COLERE = equivalents(null, 'colère', 'courroux');
  const AMI = equivalents('pote', 'ami', null);
  const LAID = equivalents('moche', 'laid', null);
  const ENFANT = equivalents('gamin', 'enfant', null);
  const LETTRE = equivalents(null, 'lettre', 'missive');
  const CIEL = equivalents(null, 'ciel', 'firmament');
  const PLAT = equivalents(null, 'plat', 'mets');
  const CADEAU = equivalents(null, 'cadeau', 'présent');

  ajouterClassement({
    id: '6e-vocabulaire-niveaux-langue',
    // Une consigne fixe : « grouille-toi » ou « se hâtent », ce n'est ni tout à fait un mot, ni tout à fait un groupe
    consigne: 'À quel niveau de langue appartient ce qui est souligné ?',
    nombreChoix: 3,
    categories: {
      familier: {
        nom: 'familier',
        regle: 'Le niveau <b>familier</b> s’emploie surtout à l’oral, avec la famille et les amis. On l’évite à l’écrit.',
      },
      courant: {
        nom: 'courant',
        regle: 'Le niveau <b>courant</b> convient partout, à l’oral comme à l’écrit : c’est celui de l’école.',
      },
      soutenu: {
        nom: 'soutenu',
        regle: 'Le niveau <b>soutenu</b> est recherché, élégant : on le trouve surtout dans les livres.',
      },
    },
    // [phrase (le reste de la phrase est au niveau courant), niveau du mot souligné, ses équivalents]
    banque: [
      ['Tom lit un [[bouquin]] sur les dinosaures.', 'familier', LIVRE],
      ['Hugo a oublié son [[livre]] à l’école.', 'courant', LIVRE],
      ['Cet [[ouvrage]] raconte la vie des chevaliers.', 'soutenu', LIVRE],
      ['Papa a garé sa [[bagnole]] devant l’école.', 'familier', VOITURE],
      ['La [[voiture]] de Mamie est rouge.', 'courant', VOITURE],
      ['Le cuisinier du roi prépare un [[mets]] délicieux.', 'soutenu', PLAT],
      ['Maman part au [[boulot]] à huit heures.', 'familier', TRAVAIL],
      ['Mon père aime beaucoup son [[travail]].', 'courant', TRAVAIL],
      ['Après une longue journée de [[labeur]], le paysan rentre chez lui.', 'soutenu', TRAVAIL],
      ['Mon oncle a acheté une grande [[baraque]] à la campagne.', 'familier', MAISON],
      ['Ma tante habite dans une [[maison]] près de la mer.', 'courant', MAISON],
      ['La princesse habite une [[demeure]] magnifique.', 'soutenu', MAISON],
      ['Sami a la [[trouille]] du noir.', 'familier', PEUR],
      ['Léa a eu [[peur]] pendant l’orage.', 'courant', PEUR],
      ['Le chevalier tremble d’[[effroi]] devant le dragon.', 'soutenu', PEUR],
      ['Tom, [[grouille-toi]] : le bus arrive !', 'familier', SE_DEPECHER],
      ['[[Dépêche-toi]], le film commence !', 'courant', SE_DEPECHER],
      ['Les voyageurs [[se hâtent]] vers la gare.', 'soutenu', SE_DEPECHER],
      ['Quelqu’un m’a [[piqué]] mon crayon.', 'familier', VOLER],
      ['Le chat a [[volé]] une sardine.', 'courant', VOLER],
      ['Le prince offre un [[présent]] à la reine.', 'soutenu', CADEAU],
      ['Papi [[râle]] contre le chat.', 'familier', RALER],
      ['Le roi est entré dans une grande [[colère]].', 'courant', COLERE],
      ['Rien ne peut calmer le [[courroux]] du roi.', 'soutenu', COLERE],
      ['Hugo est venu avec son [[pote]] Sami.', 'familier', AMI],
      ['Inès joue avec son [[ami]] Tom.', 'courant', AMI],
      ['Ce dessin est vraiment [[moche]].', 'familier', LAID],
      ['Le [[gamin]] joue dans le jardin.', 'familier', ENFANT],
      ['Les [[enfants]] jouent dans la cour.', 'courant', ENFANT],
      ['Mamie a reçu une [[lettre]] de sa cousine.', 'courant', LETTRE],
      ['Le facteur apporte une [[missive]] pour Mamie.', 'soutenu', LETTRE],
      ['Les étoiles brillent au [[firmament]].', 'soutenu', CIEL],
    ],
    titreLecon: 'Les niveaux de langue',
    lecon: `
      <p>On ne parle pas de la même façon à un copain et à la directrice ! Il existe trois <b>niveaux de langue</b>
        (on dit aussi « registres de langue ») :</p>
      <table>
        <tr><th>familier</th><th>courant</th><th>soutenu</th></tr>
        <tr><td>un bouquin</td><td>un livre</td><td>un ouvrage</td></tr>
        <tr><td>une baraque</td><td>une maison</td><td>une demeure</td></tr>
        <tr><td>avoir la trouille</td><td>avoir peur</td><td>trembler d’effroi</td></tr>
      </table>
      <p>• <b>familier</b> : à l’oral, entre amis ou en famille ;<br>
        • <b>courant</b> : partout, à l’oral comme à l’écrit : c’est celui de l’école ;<br>
        • <b>soutenu</b> : recherché, surtout dans les livres.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cherche d’abord le mot <b>courant</b>, celui que tu écrirais dans une rédaction.
        Le mot souligné est plus relâché ? Il est <b>familier</b>. Plus recherché ? Il est <b>soutenu</b>.</div>
    `,
  });
})();
