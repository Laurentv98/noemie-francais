// Renard Malin — Vocabulaire, niveau 5e : les 6 étapes du Jardin du Vocabulaire (d’automne)
//
// Les phrases et les mots sont écrits à la main. Le mot à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement, fabriquer, tirerType } = RM.phrases;

  // Une liste de mots entre guillemets : « vague », « marée » et « écume »
  const liste = mots => mots.map(mot => `« ${mot} »`).join(', ').replace(/, ([^,]*)$/, ' et $1');

  // ======================================================================
  // 1. Le champ lexical
  // ======================================================================
  // « le sport » → « du sport », « la mer » → « de la mer », « l’hiver » → « de l’hiver »
  const du = theme => (theme.startsWith('le ') ? 'du ' + theme.slice(3) : 'de ' + theme);
  // « le sport » → « au sport », « la mer » → « à la mer »
  const au = theme => (theme.startsWith('le ') ? 'au ' + theme.slice(3) : 'à ' + theme);
  const REGLE_CHAMP = 'Un <b>champ lexical</b>, c’est l’ensemble des mots qui se rapportent à un même thème.';

  // Deux sortes de questions :
  // ['intrus', thème, les 3 mots du thème, l'intrus, pourquoi c'est l'intrus]
  // ['theme', thème, les 4 mots du thème, les 3 thèmes proposés comme pièges]
  const CHAMPS_LEXICAUX = [
    ['intrus', 'la mer', ['vague', 'marée', 'écume'], 'cascade', 'c’est une chute d’eau douce, sur une rivière ou en montagne'],
    ['intrus', 'la peur', ['épouvante', 'terrifié', 'frayeur'], 'furieux', 'il fait penser à la colère'],
    ['intrus', 'l’école', ['cahier', 'récréation', 'professeur'], 'crèche', 'c’est là qu’on garde les bébés, avant l’âge de l’école'],
    ['intrus', 'l’hiver', ['flocon', 'verglas', 'givre'], 'canicule', 'c’est une très forte chaleur, en été'],
    ['intrus', 'la musique', ['mélodie', 'refrain', 'violon'], 'aquarelle', 'c’est une peinture à l’eau'],
    ['intrus', 'le sport', ['match', 'entraîneur', 'compétition'], 'concert', 'c’est un spectacle de musique'],
    ['intrus', 'la cuisine', ['casserole', 'recette', 'four'], 'aspirateur', 'il sert à faire le ménage, pas à cuisiner'],
    ['intrus', 'la forêt', ['chêne', 'clairière', 'sous-bois'], 'prairie', 'c’est un grand terrain couvert d’herbe, sans arbres'],
    ['intrus', 'le théâtre', ['scène', 'rideau', 'comédien'], 'écran', 'on regarde un film sur un écran, au cinéma'],
    ['intrus', 'la ferme', ['étable', 'poulailler', 'tracteur'], 'girafe', 'la girafe vit dans la savane, ou au zoo'],
    ['intrus', 'l’espace', ['fusée', 'planète', 'astronaute'], 'avion', 'un avion vole dans le ciel, pas dans l’espace'],
    ['intrus', 'le château fort', ['donjon', 'chevalier', 'pont-levis'], 'gratte-ciel', 'c’est un immeuble très haut des villes modernes'],
    ['intrus', 'le feu', ['braise', 'étincelle', 'flamme'], 'radiateur', 'il chauffe sans flamme, avec l’électricité ou l’eau chaude'],
    ['intrus', 'le cirque', ['clown', 'acrobate', 'jongleur'], 'marionnette', 'c’est une poupée qu’on fait bouger avec des fils ou avec la main'],
    ['intrus', 'la médecine', ['ordonnance', 'infirmier', 'soigner'], 'coiffeur', 'il coupe les cheveux, il ne soigne pas'],
    ['theme', 'la mer', ['coquillage', 'algue', 'mouette', 'marin'], ['la montagne', 'la cuisine', 'l’école']],
    ['theme', 'la peur', ['trembler', 'angoisse', 'cauchemar', 'effrayant'], ['la joie', 'le sport', 'la musique']],
    ['theme', 'l’école', ['élève', 'trousse', 'dictée', 'cantine'], ['le cirque', 'la ferme', 'l’espace']],
    ['theme', 'l’hiver', ['neige', 'moufle', 'grelotter', 'glacial'], ['la mer', 'l’école', 'la musique']],
    ['theme', 'la musique', ['orchestre', 'chanteur', 'piano', 'rythme'], ['la forêt', 'la cuisine', 'la ferme']],
    ['theme', 'le sport', ['arbitre', 'stade', 'équipe', 'médaille'], ['la cuisine', 'la forêt', 'la ferme']],
    ['theme', 'la cuisine', ['éplucher', 'poêle', 'mijoter', 'saladier'], ['le sport', 'l’école', 'le théâtre']],
    ['theme', 'la forêt', ['bûcheron', 'feuillage', 'écorce', 'sentier'], ['la mer', 'le sport', 'la musique']],
    ['theme', 'le théâtre', ['acteur', 'décor', 'spectateur', 'entracte'], ['la ferme', 'l’hiver', 'la forêt']],
    ['theme', 'la ferme', ['vache', 'grange', 'traire', 'fermier'], ['l’école', 'la mer', 'le théâtre']],
    ['theme', 'l’espace', ['galaxie', 'étoile', 'satellite', 'comète'], ['la ferme', 'la cuisine', 'le sport']],
    ['theme', 'le château fort', ['remparts', 'douves', 'seigneur', 'armure'], ['la ferme', 'l’école', 'la mer']],
    ['theme', 'le feu', ['fumée', 'cendres', 'brûlant', 'allumette'], ['la mer', 'l’école', 'la musique']],
    ['theme', 'le cirque', ['chapiteau', 'trapéziste', 'piste', 'funambule'], ['la cuisine', 'la forêt', 'l’école']],
    ['theme', 'la médecine', ['médecin', 'pansement', 'fièvre', 'vaccin'], ['la musique', 'la ferme', 'le théâtre']],
  ];

  ajouterEtape({
    id: '5e-vocabulaire-champ-lexical',
    banque: CHAMPS_LEXICAUX,
    creerQuestion([sorte, theme, mots, intrusOuPieges, raison]) {
      if (sorte === 'intrus') {
        return question({
          consigne: 'Trouve l’intrus',
          enonce: `Quel mot n’appartient pas au champ lexical <b>${du(theme)}</b> ?`,
          reponse: intrusOuPieges,
          pieges: mots,
          explication: `${liste(mots)} font penser ${au(theme)}. Mais pas <b>« ${intrusOuPieges} »</b> : ${raison} !<br>${REGLE_CHAMP}`,
        });
      }
      return question({
        consigne: 'À quel champ lexical appartiennent ces mots ?',
        enonce: `<i>${mots.join(', ')}</i>`,
        reponse: theme,
        pieges: intrusOuPieges,
        explication: `${liste(mots)} font tous penser <b>${au(theme)}</b> : ils forment son champ lexical.`,
      });
    },
    titreLecon: 'Le champ lexical',
    lecon: `
      <p>Un <b>champ lexical</b>, c’est l’ensemble des mots qui se rapportent à un même <b>thème</b>.</p>
      <p>👉 Le champ lexical de <b>la mer</b> : <i>plage, bateau, naviguer, phare, houle, salé…</i></p>
      <p>On y trouve des noms, mais aussi des verbes et des adjectifs :
        la peur → <i>frayeur, trembler, effrayant</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> demande-toi « De quoi parlent tous ces mots ? ».
        Pour trouver l’<b>intrus</b>, cherche le mot qui te fait penser à autre chose :
        <i>sommet, neige, chalet, <u>coquillage</u></i> → le coquillage, c’est pour la mer !</div>
      <p>✍️ Les écrivains choisissent un champ lexical pour créer une <b>ambiance</b> : les mots de la nuit
        et de la peur pour une histoire qui fait frissonner…</p>
      <p>⚠️ Ne confonds pas avec la <b>famille de mots</b>, où les mots ont le même radical :
        <i>terre, terrain, enterrer</i>.</p>
    `,
  });

  // ======================================================================
  // 2. Les homonymes
  // ======================================================================
  // Le sens de chaque homonyme (Roxy les donne tous dans son explication)
  const SENS = {
    ver: 'un petit animal tout mou, sans pattes',
    verre: 'un récipient pour boire',
    vert: 'une couleur',
    vers: 'en direction de, ou une ligne d’un poème',
    mer: 'une grande étendue d’eau salée',
    mère: 'une maman',
    maire: 'la personne qui dirige la commune',
    sang: 'le liquide rouge qui circule dans le corps',
    cent: 'le nombre 100',
    sans: 'le contraire de « avec »',
    pain: 'un aliment fait avec de la farine',
    pin: 'un arbre à aiguilles',
    peint: 'le verbe peindre (il a peint)',
    cou: 'la partie du corps entre la tête et les épaules',
    coup: 'un choc, un geste rapide',
    coût: 'le prix',
    sel: 'une poudre blanche pour saler les plats',
    selle: 'le siège du cavalier sur le cheval',
    celle: 'un pronom (celle-ci, celle de…)',
    voix: 'le son qui sort de la bouche quand on parle',
    voie: 'un chemin, une route ou des rails (ou le verbe voir : qu’il voie)',
    vois: 'le verbe voir avec je ou tu (je vois, tu vois)',
    conte: 'une histoire merveilleuse (ou le verbe conter = raconter)',
    compte: 'un calcul, un compte en banque, ou le verbe compter (il compte)',
    comte: 'un noble, le mari de la comtesse',
    chêne: 'un grand arbre qui donne des glands',
    chaîne: 'des anneaux attachés ensemble, ou une chaîne de télévision',
    cour: 'un espace en plein air, entouré de murs',
    cours: 'une leçon, ou le verbe courir avec je ou tu (je cours, tu cours)',
    court: 'le contraire de long, le verbe courir avec il ou elle (il court), ou un terrain de tennis',
    fois: 'un moment où une chose arrive (une fois, deux fois)',
    foie: 'un organe du corps, qui aide à digérer',
    foi: 'le fait de croire, la confiance',
    saut: 'un bond',
    seau: 'un récipient avec une anse',
    sot: 'bête, pas malin',
    sceau: 'un cachet imprimé dans la cire',
    poids: 'ce que pèse une chose',
    pois: 'une petite graine ronde, ou un petit rond',
    poix: 'une sorte de colle noire, faite avec de la résine',
    vin: 'une boisson faite avec du raisin',
    vingt: 'le nombre 20',
    vain: 'inutile (en vain = pour rien)',
  };

  // [les mots proposés, [[phrase avec ___, le bon mot, son sens exact dans cette phrase (facultatif)], …]]
  // Le sens exact peut commencer par une virgule (« , dans l’expression… ») : il suit alors directement le mot.
  const HOMONYMES = [
    [['ver', 'verre', 'vert', 'vers'], [
      ['Le merle a attrapé un ___ de terre.', 'ver'],
      ['Roxy boit un ___ de jus de pomme.', 'verre'],
      ['Le petit bonhomme passe au ___ : on peut traverser.', 'vert'],
      ['Le renard trotte ___ la rivière.', 'vers', 'en direction de'],
      ['Récite le premier ___ du poème.', 'vers', 'une ligne d’un poème'],
    ]],
    [['mer', 'mère', 'maire'], [
      ['L’été, nous nous baignons dans la ___.', 'mer'],
      ['Le soir, la ___ de Hinano lui fait un câlin et lui lit une histoire.', 'mère'],
      ['Le ___ a inauguré la nouvelle bibliothèque du village.', 'maire'],
    ]],
    [['sang', 'cent', 'sans'], [
      ['Le cœur envoie le ___ dans tout le corps.', 'sang'],
      ['Mon arrière-grand-mère a fêté ses ___ ans !', 'cent'],
      ['Roxy boit son chocolat ___ sucre.', 'sans'],
    ]],
    [['pain', 'pin', 'peint'], [
      ['Papi achète du ___ à la boulangerie.', 'pain'],
      ['Un écureuil grimpe dans le grand ___.', 'pin'],
      ['Ce mur est ___ en bleu.', 'peint', 'le verbe peindre (il est peint)'],
    ]],
    [['cou', 'coup', 'coût'], [
      ['La girafe a un très long ___.', 'cou'],
      ['Sione a marqué le but d’un ___ de tête.', 'coup'],
      ['Donne-moi un ___ de main pour porter ce carton.', 'coup', ', dans l’expression « un coup de main », qui veut dire une aide'],
      ['Le ___ du voyage est trop élevé.', 'coût'],
    ]],
    [['sel', 'selle', 'celle'], [
      ['Ajoute une pincée de ___ dans la soupe.', 'sel'],
      ['La cavalière ajuste la ___ de son cheval.', 'selle'],
      ['Ta trousse est bleue ; ___ de Zoé est rouge.', 'celle', 'un pronom qui remplace « la trousse »'],
    ]],
    [['voix', 'voie', 'vois'], [
      ['Le chanteur a une ___ grave et puissante.', 'voix'],
      ['Le train arrive sur la ___ numéro 2.', 'voie', 'les rails sur lesquels roule le train'],
      ['Je ___ un écureuil sur la branche.', 'vois'],
    ]],
    [['conte', 'compte', 'comte'], [
      ['Mamie me lit un ___ de fées.', 'conte', 'une histoire merveilleuse'],
      ['Papi a ouvert un ___ à la banque.', 'compte', 'un compte en banque'],
      ['À la fin de la partie, Wanir ___ ses points.', 'compte', 'le verbe compter (il compte)'],
      ['Le ___ et la comtesse vivent dans un château.', 'comte'],
    ]],
    [['chêne', 'chaîne'], [
      ['Un écureuil a fait son nid dans le vieux ___.', 'chêne'],
      ['Le vélo de Tom a perdu sa ___.', 'chaîne', 'des anneaux de métal attachés ensemble'],
      ['Change de ___, ce dessin animé est trop long !', 'chaîne', 'une chaîne de télévision'],
    ]],
    [['cour', 'cours', 'court'], [
      ['Les élèves jouent dans la ___ de récréation.', 'cour'],
      ['Le ___ de musique commence à dix heures.', 'cours', 'une leçon'],
      ['Ce chemin est plus ___ que l’autre.', 'court', 'le contraire de long'],
      ['Le lièvre ___ très vite.', 'court', 'le verbe courir avec il ou elle (il court)'],
      ['Le match de tennis se joue sur un ___ en terre battue.', 'court', 'un terrain de tennis'],
    ]],
    [['fois', 'foie', 'foi'], [
      ['Il était une ___ une petite renarde.', 'fois'],
      ['Le ___ est un organe qui aide à digérer.', 'foie'],
      ['Il a agi de bonne ___ : il ne voulait pas tricher.', 'foi', ', dans l’expression « de bonne foi », qui veut dire sincèrement'],
    ]],
    [['saut', 'seau', 'sot', 'sceau'], [
      ['Le kangourou fait un ___ immense.', 'saut'],
      ['Roxy remplit son ___ d’eau à la fontaine.', 'seau'],
      ['Le corbeau fut bien ___ de lâcher son fromage.', 'sot'],
      ['La lettre du roi porte son ___ de cire rouge.', 'sceau'],
    ]],
    [['poids', 'pois', 'poix'], [
      ['Le ___ de ce sac est de cinq kilos.', 'poids'],
      ['Roxy adore les petits ___ au beurre.', 'pois', 'une petite graine ronde qu’on mange'],
      ['Mei porte une robe à ___.', 'pois', 'des petits ronds (une robe à pois)'],
    ]],
    [['vin', 'vingt', 'vain'], [
      ['Les vendanges servent à faire du ___.', 'vin'],
      ['Mon grand frère a ___ ans.', 'vingt'],
      ['Il a cherché ses clés en ___.', 'vain', ', dans l’expression « en vain », qui veut dire pour rien'],
    ]],
  ];

  const PHRASES_HOMONYMES = HOMONYMES.flatMap(([mots, phrases]) =>
    phrases.map(([phrase, reponse, sensIci]) => ({ phrase, reponse, mots, sensIci })));

  ajouterEtape({
    id: '5e-vocabulaire-homonymes',
    banque: PHRASES_HOMONYMES,
    creerQuestion: ({ phrase, reponse, mots, sensIci }) => fabriquer(tirerType({ choix: 0.7, vraifaux: 0.3 }), {
      phrase,
      reponse,
      choix: mots,
      mauvais: mots.filter(mot => mot !== reponse),
      explication: `Ici, c’est « <b>${reponse}</b> »`
        + (sensIci && sensIci.startsWith(',') ? `${sensIci}.` : ` : ${sensIci || SENS[reponse]}.`)
        + mots.filter(mot => mot !== reponse).map(mot => `<br>• <i>${mot}</i> : ${SENS[mot]}`).join(''),
      consigneChoix: 'Choisis le bon mot',
    }),
    titreLecon: 'Les homonymes',
    lecon: `
      <p>Des <b>homonymes</b> sont des mots qui se <b>prononcent pareil</b>, mais qui n’ont <b>pas le même sens</b>.</p>
      <p>👉 un <b>ver</b> de terre · un <b>verre</b> d’eau · un pull <b>vert</b> · marcher <b>vers</b> la forêt</p>
      <p>Le plus souvent, ils ne s’écrivent pas de la même façon. Parfois, si :
        le <b>vers</b> d’un poème et marcher <b>vers</b> la forêt.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cherche d’abord le <b>sens</b> de la phrase.
        Puis pense à un mot de la même famille, qui fait entendre la fin du mot :<br>
        <i>vert → verte, verdure</i> · <i>sang → sanguin</i> · <i>cent → centaine</i> ·
        <i>saut → sauter</i> · <i>court → courte</i> · <i>sot → sotte</i></div>
      <p>⚠️ Le déterminant aide aussi : <i><b>le</b> chêne / <b>la</b> chaîne</i>, <i><b>le</b> sel / <b>la</b> selle</i>.</p>
    `,
  });

  // ======================================================================
  // 3. Préfixe, radical, suffixe
  // ======================================================================
  ajouterClassement({
    id: '5e-vocabulaire-formation-mots',
    consigne: 'Dans ce mot, la partie soulignée est…',
    nombreChoix: 3,
    // Dans la solution : « in- » pour un préfixe, « -able » pour un suffixe
    montrerSouligne: (partie, cle) => ({ prefixe: `${partie}-`, suffixe: `-${partie}` })[cle] || partie,
    categories: {
      prefixe: {
        nom: 'préfixe',
        regle: 'Le <b>préfixe</b> se place <b>avant</b> le radical. Il change le sens du mot : content → <b>mé</b>content.',
      },
      radical: {
        nom: 'radical',
        regle: 'Le <b>radical</b> est le cœur du mot : il porte son sens principal. '
          + 'On le retrouve dans toute la famille : <b>cass</b>er, in<b>cass</b>able.',
      },
      suffixe: {
        nom: 'suffixe',
        regle: 'Le <b>suffixe</b> se place <b>après</b> le radical. Il forme un nouveau mot, '
          + 'souvent d’une autre classe : lent → lent<b>eur</b>.',
      },
    },
    // [le mot avec la partie à observer entre [[ ]], la sorte de partie, ce qu'elle veut dire]
    banque: [
      ['[[in]]cassable', 'prefixe', '« in- » veut dire « pas » : incassable, qu’on ne peut pas casser.'],
      ['[[dé]]montable', 'prefixe', '« dé- » indique le contraire : démonter, c’est défaire ce qui est monté.'],
      ['[[im]]buvable', 'prefixe', '« im- » veut dire « pas » : imbuvable, qu’on ne peut pas boire. « in- » devient « im- » devant b, m, p.'],
      ['[[ir]]réparable', 'prefixe', '« ir- » veut dire « pas » : irréparable, qu’on ne peut pas réparer. « in- » devient « ir- » devant r.'],
      ['[[mal]]heureux', 'prefixe', '« mal- » donne le sens contraire : malheureux = pas heureux.'],
      ['[[trans]]porteur', 'prefixe', '« trans- » veut dire « à travers, de l’autre côté » : transporter, c’est porter d’un endroit à un autre.'],
      ['[[ex]]portation', 'prefixe', '« ex- » veut dire « hors de » : exporter, c’est vendre hors du pays.'],
      ['[[pré]]historique', 'prefixe', '« pré- » veut dire « avant » : la préhistoire, c’est avant l’histoire.'],
      ['[[re]]cyclage', 'prefixe', '« re- » veut dire « de nouveau » : on recycle une matière pour l’utiliser de nouveau.'],
      ['[[mé]]content', 'prefixe', '« mé- » donne le sens contraire : mécontent = pas content.'],
      ['[[super]]marché', 'prefixe', '« super- » veut dire « au-dessus, plus grand » : un supermarché est un très grand magasin.'],
      ['in[[cass]]able', 'radical', '« cass » porte le sens du mot : on le retrouve dans casser, une cassure.'],
      ['dé[[mont]]able', 'radical', '« mont » vient du verbe monter : monter, le montage, démonter.'],
      ['im[[buv]]able', 'radical', '« buv » vient du verbe boire : nous buvons, un buveur. Le radical peut changer de forme !'],
      ['mal[[heur]]eux', 'radical', '« heur » est un vieux mot qui veut dire « la chance » : bonheur, malheur.'],
      ['dé[[coll]]age', 'radical', '« coll » : on le retrouve dans coller, la colle, décoller.'],
      ['trans[[port]]eur', 'radical', '« port » vient du verbe porter : porter, portable, transporter.'],
      ['in[[oubli]]able', 'radical', '« oubli » : on le retrouve dans oublier, un oubli.'],
      ['in[[égal]]ité', 'radical', '« égal » : on le retrouve dans égalité, également, égaliser.'],
      ['dé[[color]]ation', 'radical', '« color » est une forme de « couleur » : colorier, coloré, décolorer.'],
      ['[[jardin]]ier', 'radical', 'Ici, le radical est un mot entier : jardin. Ce mot n’a pas de préfixe.'],
      ['incass[[able]]', 'suffixe', '« -able » veut dire « qu’on peut » : incassable, qu’on ne peut pas casser.'],
      ['malheur[[eux]]', 'suffixe', '« -eux » forme un adjectif : malheureux, qui est dans le malheur.'],
      ['inégal[[ité]]', 'suffixe', '« -ité » forme un nom à partir d’un adjectif : égal → égalité.'],
      ['décoll[[age]]', 'suffixe', '« -age » indique une action : le décollage, c’est l’action de décoller.'],
      ['transport[[eur]]', 'suffixe', '« -eur » indique celui qui fait l’action : un transporteur transporte des marchandises.'],
      ['export[[ation]]', 'suffixe', '« -ation » indique une action : l’exportation, c’est l’action d’exporter.'],
      ['préhistor[[ique]]', 'suffixe', '« -ique » forme un adjectif : préhistorique, qui date de la préhistoire.'],
      ['fleur[[iste]]', 'suffixe', '« -iste » indique souvent un métier : le fleuriste vend des fleurs.'],
      ['fill[[ette]]', 'suffixe', '« -ette » veut dire « petit » : une fillette est une petite fille.'],
      ['ours[[on]]', 'suffixe', '« -on » désigne souvent le petit d’un animal : l’ourson est le petit de l’ours.'],
      ['jaun[[âtre]]', 'suffixe', '« -âtre » veut dire « presque, pas tout à fait » : jaunâtre, d’un jaune pas très net.'],
      ['lis[[ible]]', 'suffixe', '« -ible » veut dire « qu’on peut » : lisible, qu’on peut lire.'],
    ],
    titreLecon: 'Préfixe, radical, suffixe',
    lecon: `
      <p>Beaucoup de mots sont fabriqués avec plusieurs <b>morceaux</b> :</p>
      <table>
        <tr><th>préfixe</th><th>radical</th><th>suffixe</th></tr>
        <tr><td><b>in</b></td><td><b>cass</b></td><td><b>able</b></td></tr>
        <tr><td><b>trans</b></td><td><b>port</b></td><td><b>eur</b></td></tr>
      </table>
      <p>• Le <b>radical</b> est le cœur du mot : il porte son sens. On le retrouve dans toute la famille
        (<i>casser, cassure, incassable</i>). Il peut changer de forme : boire → im<b>buv</b>able.<br>
        • Le <b>préfixe</b> se place <b>avant</b> : il change le sens. <i>in-, im-, ir-, dé-, mal-</i> = le contraire ;
        <i>re-</i> = de nouveau ; <i>pré-</i> = avant.<br>
        • Le <b>suffixe</b> se place <b>après</b> : il fait un nouveau mot, souvent d’une autre classe.
        <i>-able, -ible</i> = qu’on peut ; <i>-eur</i> = celui qui fait ; <i>-age, -ation</i> = l’action ; <i>-ette, -on</i> = petit.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> trouve d’abord le <b>radical</b> en cherchant un mot de la même famille.
        Ce qui est avant, c’est le préfixe ; ce qui est après, c’est le suffixe.</div>
      <p>⚠️ Un mot n’a pas toujours les trois : <i>jardin-ier</i> n’a pas de préfixe, <i>mé-content</i> n’a pas de suffixe.</p>
    `,
  });

  // ======================================================================
  // 4. Les mots à plusieurs sens (la polysémie)
  // ======================================================================
  // Les sens de chaque mot (les boutons)
  const SENS_POLYSEMIE = {
    bouton: {
      fleur: 'une fleur pas encore ouverte',
      attache: 'une attache de vêtement',
      peau: 'une petite bosse sur la peau',
      touche: 'une touche à presser',
    },
    pièce: {
      salle: 'une salle d’un logement',
      monnaie: 'une monnaie en métal',
      theatre: 'une œuvre de théâtre',
      jeu: 'un morceau d’un jeu',
    },
    carte: {
      plan: 'un plan d’une région',
      menu: 'la liste des plats',
      jeu: 'un carton pour jouer',
      postale: 'une image avec un message',
    },
    glace: { dessert: 'un dessert glacé', miroir: 'un miroir', eau: 'de l’eau gelée' },
    note: {
      son: 'un son de musique',
      resultat: 'un résultat à un contrôle',
      ecrit: 'quelques mots écrits',
      addition: 'la somme à payer',
    },
    temps: { meteo: 'la météo', duree: 'une durée', verbe: 'le présent, l’imparfait…' },
    queue: { animal: 'le bout du dos d’un animal', file: 'une file d’attente', manche: 'le manche d’un ustensile' },
    pied: { corps: 'le bout de la jambe, pour marcher', meuble: 'le support d’un meuble', montagne: 'le bas d’une montagne' },
    plateau: { plat: 'un support pour porter', relief: 'un terrain plat en hauteur', tele: 'le lieu d’une émission' },
    baguette: { pain: 'un pain long et fin', fee: 'un bâton magique', manger: 'un bâtonnet pour manger' },
    souris: { rongeur: 'un petit rongeur', ordinateur: 'un objet de l’ordinateur' },
    grue: { oiseau: 'un grand oiseau', engin: 'un engin de chantier' },
    feuille: { plante: 'une partie d’une plante', papier: 'un morceau de papier' },
  };

  // [phrase avec le mot souligné, le mot (au singulier), la clé du bon sens, l'indice dans la phrase]
  const POLYSEMIE = [
    ['Au printemps, les [[boutons]] de rose s’ouvrent un à un.', 'bouton', 'fleur', 'au printemps, ils « s’ouvrent un à un »'],
    ['Maman recoud un [[bouton]] de ma chemise.', 'bouton', 'attache', 'Maman le « recoud », et il est « de ma chemise »'],
    ['Tom a un gros [[bouton]] sur le nez.', 'bouton', 'peau', 'il est « sur le nez »'],
    ['Appuie sur le [[bouton]] rouge pour allumer la radio.', 'bouton', 'touche', 'on appuie dessus « pour allumer la radio »'],
    ['Notre appartement a quatre [[pièces]].', 'pièce', 'salle', 'on parle d’un « appartement »'],
    ['Papi m’a donné une [[pièce]] de cent francs.', 'pièce', 'monnaie', 'elle vaut « cent francs »'],
    ['Les élèves jouent une [[pièce]] de Molière.', 'pièce', 'theatre', 'les élèves la « jouent », et « Molière » écrivait pour le théâtre'],
    ['Il manque une [[pièce]] à mon puzzle !', 'pièce', 'jeu', 'on parle d’un « puzzle »'],
    ['Regarde la [[carte]] pour trouver le chemin.', 'carte', 'plan', 'on la regarde « pour trouver le chemin »'],
    ['Au restaurant, Kalia choisit son dessert sur la [[carte]].', 'carte', 'menu', 'Kalia y « choisit son dessert »'],
    ['Hugo a gagné avec l’as de cœur : quelle bonne [[carte]] !', 'carte', 'jeu', 'l’« as de cœur » est une carte à jouer'],
    ['Mamie m’écrit une [[carte]] depuis ses vacances à la mer.', 'carte', 'postale', 'Mamie « m’écrit » une carte « depuis ses vacances »'],
    ['Au dessert, Maëva a pris une [[glace]] à la fraise.', 'glace', 'dessert', 'elle est « à la fraise », pour le dessert'],
    ['Roxy se regarde dans la [[glace]] de l’entrée.', 'glace', 'miroir', 'Roxy « se regarde » dedans'],
    ['En hiver, la [[glace]] recouvre le lac.', 'glace', 'eau', 'elle « recouvre le lac » en hiver'],
    ['Inès a eu une bonne [[note]] en maths.', 'note', 'resultat', 'Inès « a eu » une bonne note « en maths »'],
    ['Le do est la première [[note]] de la gamme.', 'note', 'son', '« do » et « gamme » sont des mots de la musique'],
    ['Pendant la visite, Minh prend des [[notes]] dans son carnet.', 'note', 'ecrit', 'Minh les écrit « dans son carnet »'],
    ['À la fin du repas, papa demande la [[note]] au serveur.', 'note', 'addition', 'papa la demande « au serveur », à la fin du repas'],
    ['Quel beau [[temps]] aujourd’hui : pas un nuage !', 'temps', 'meteo', '« pas un nuage »'],
    ['Je n’ai pas le [[temps]] de jouer, je dois partir.', 'temps', 'duree', '« je dois partir », il ne reste plus assez de minutes pour jouer'],
    ['À quel [[temps]] est conjugué le verbe « nous chantions » ?', 'temps', 'verbe', 'on parle d’un verbe « conjugué »'],
    ['Le chien remue la [[queue]] quand il est content.', 'queue', 'animal', 'le « chien » la « remue »'],
    ['Il y a une longue [[queue]] devant le cinéma.', 'queue', 'file', 'des gens attendent « devant le cinéma »'],
    ['Attrape la casserole par la [[queue]].', 'queue', 'manche', 'on attrape la « casserole » par là'],
    ['Wakana trempe ses [[pieds]] dans le lagon.', 'pied', 'corps', 'Wakana les « trempe » « dans le lagon »'],
    ['Cette table a quatre [[pieds]].', 'pied', 'meuble', 'on parle d’une « table »'],
    ['Le chalet est au [[pied]] de la montagne.', 'pied', 'montagne', 'on parle de « la montagne »'],
    ['Le serveur apporte les verres sur un [[plateau]].', 'plateau', 'plat', 'le serveur « apporte les verres » dessus'],
    ['Du haut du [[plateau]], on voit toute la vallée.', 'plateau', 'relief', 'du haut, « on voit toute la vallée »'],
    ['Le présentateur arrive sur le [[plateau]] de télévision.', 'plateau', 'tele', 'on parle de « télévision »'],
    ['Va acheter une [[baguette]] à la boulangerie.', 'baguette', 'pain', 'on l’achète « à la boulangerie »'],
    ['La fée agite sa [[baguette]] et fait apparaître un carrosse.', 'baguette', 'fee', 'c’est une « fée » qui l’agite'],
    ['Au restaurant chinois, Tom mange avec des [[baguettes]].', 'baguette', 'manger', 'Tom « mange avec »'],
    ['Le chat guette la [[souris]] derrière le placard.', 'souris', 'rongeur', 'le « chat » la « guette »'],
    ['Clique deux fois avec la [[souris]] pour ouvrir le fichier.', 'souris', 'ordinateur', 'on clique avec elle « pour ouvrir le fichier »'],
    ['Une [[grue]] soulève les poutres du nouvel immeuble.', 'grue', 'engin', 'elle « soulève les poutres du nouvel immeuble »'],
    ['En automne, les [[grues]] cendrées volent vers le sud.', 'grue', 'oiseau', 'elles « volent vers le sud » en automne'],
    ['En automne, les [[feuilles]] tombent des arbres.', 'feuille', 'plante', 'elles « tombent des arbres »'],
    ['Prenez une [[feuille]] et écrivez votre nom en haut.', 'feuille', 'papier', 'la consigne dit « écrivez votre nom en haut »'],
  ];

  ajouterEtape({
    id: '5e-vocabulaire-polysemie',
    banque: POLYSEMIE,
    creerQuestion([phrase, mot, cle, indice]) {
      const sens = SENS_POLYSEMIE[mot];
      const autres = Object.keys(sens).filter(c => c !== cle).map(c => sens[c]);
      return question({
        consigne: 'Dans cette phrase, que veut dire le mot souligné ?',
        enonce: phrase,
        reponse: sens[cle],
        pieges: RM.melanger(autres).slice(0, 2),
        // Le mot au singulier, même si la phrase l’a au pluriel
        solution: `« ${mot} » : <b>${sens[cle]}</b>`,
        // Pas de point après des points de suspension (« le présent, l’imparfait… »)
        explication: `Ici, « ${mot} » veut dire <b>${sens[cle]}</b>${sens[cle].endsWith('…') ? '' : '.'} L’indice : ${indice}.<br>`
          + `Le mot « ${mot} » a plusieurs sens : c’est un mot <b>polysémique</b>. C’est la phrase qui dit lequel choisir.`,
      });
    },
    titreLecon: 'Les mots à plusieurs sens',
    lecon: `
      <p>Beaucoup de mots ont <b>plusieurs sens</b> : on dit qu’ils sont <b>polysémiques</b>.</p>
      <p>👉 une <b>souris</b> : un petit rongeur, ou l’objet qui guide la flèche de l’ordinateur.<br>
        👉 un <b>bouton</b> : une fleur pas encore ouverte, une attache de chemise, une petite bosse sur la peau,
        une touche à presser.</p>
      <p>Ces sens ont souvent un lien : la souris de l’ordinateur, avec son fil, ressemble à une petite souris et sa queue !</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> c’est la phrase (le <b>contexte</b>) qui dit quel sens choisir.
        Cherche les mots-indices :<br><i>Le chat guette la <u>souris</u></i> → le rongeur ;
        <i>Clique avec la <u>souris</u></i> → l’ordinateur.</div>
      <p>⚠️ Ne confonds pas avec les <b>homonymes</b> : ce sont des mots différents qui se prononcent pareil
        (<i>ver, verre, vert</i>).</p>
    `,
  });

  // ======================================================================
  // 5. Les expressions imagées
  // ======================================================================
  // [l'expression, son sens, les pièges (un sens au pied de la lettre, un autre sens faux), l'explication]
  const EXPRESSIONS = [
    ['avoir un chat dans la gorge', 'être enroué', ['être allergique aux chats', 'avoir envie de pleurer'],
      'On a la voix rauque, qui accroche : il faut s’éclaircir la gorge.'],
    ['avoir la tête dans les nuages', 'être distrait, rêveur', ['être très grand', 'avoir mal à la tête'],
      'On rêve au lieu d’écouter : l’esprit est ailleurs, très loin.'],
    ['poser un lapin', 'ne pas venir à un rendez-vous', ['offrir un lapin', 'faire une farce'],
      'On attend quelqu’un… qui ne vient jamais !'],
    ['coûter les yeux de la tête', 'coûter très cher', ['fatiguer les yeux', 'être très rare'],
      'C’est si cher qu’il faudrait payer avec ce qu’on a de plus précieux : ses yeux !'],
    ['il tombe des cordes', 'il pleut très fort', ['des cordes tombent du ciel', 'il y a beaucoup de vent'],
      'La pluie est si forte que les gouttes forment de longs fils, comme des cordes.'],
    ['avoir la chair de poule', 'avoir des frissons', ['avoir envie de poulet', 'être très fatigué'],
      'Quand on a froid ou peur, la peau se couvre de petits boutons, comme la peau d’une poule sans ses plumes.'],
    ['mettre la main à la pâte', 'participer au travail', ['faire un gâteau', 'toucher à tout'],
      'Au sens propre, c’est pétrir soi-même la pâte, comme le boulanger : on ne regarde pas, on aide !'],
    ['avoir un poil dans la main', 'être paresseux', ['avoir les mains sales', 'être maladroit'],
      'La main travaille si peu qu’un poil a eu le temps d’y pousser !'],
    ['donner sa langue au chat', 'renoncer à deviner', ['parler à son chat', 'garder un secret'],
      'On le dit quand on ne trouve pas la réponse d’une devinette : « Je ne sais pas, dis-moi ! »'],
    ['avoir le cœur sur la main', 'être généreux', ['avoir mal au cœur', 'être amoureux'],
      'On est prêt à tout donner, comme si on tendait son cœur dans sa main.'],
    ['être sur son trente et un', 'être très bien habillé', ['avoir trente et un ans', 'être très en avance'],
      'On a mis ses plus beaux habits, comme pour une fête.'],
    ['avoir une faim de loup', 'avoir très faim', ['avoir peur des loups', 'hurler très fort'],
      'On a aussi faim qu’un loup affamé, prêt à tout dévorer !'],
    ['mettre les pieds dans le plat', 'dire une chose maladroite', ['marcher dans son assiette', 'manger trop vite'],
      'On parle sans réfléchir d’un sujet qui gêne tout le monde.'],
    ['avoir le cafard', 'être triste', ['avoir un insecte chez soi', 'avoir peur du noir'],
      'On a le moral à zéro : on se sent triste, sans trop savoir pourquoi.'],
    ['tourner autour du pot', 'ne pas aller droit au but', ['faire la cuisine', 'être perdu'],
      'On parle longtemps sans oser dire ce qu’on veut vraiment dire.'],
    ['avoir la main verte', 'être doué pour le jardinage', ['avoir les mains peintes', 'être jaloux'],
      'Les plantes poussent très bien chez les personnes qui ont la main verte !'],
    ['prendre ses jambes à son cou', 's’enfuir en courant', ['faire de la gymnastique', 'être très souple'],
      'On part très vite, en courant, pour échapper à quelque chose.'],
    ['être comme un poisson dans l’eau', 'être très à l’aise', ['savoir bien nager', 'ne rien dire'],
      'Le poisson est parfaitement bien dans l’eau : on se sent à sa place.'],
    ['se lever du pied gauche', 'être de mauvaise humeur', ['être gaucher', 'être en retard'],
      'Dès le réveil, on est grognon : la journée commence mal !'],
    ['mettre la puce à l’oreille', 'faire naître un doute', ['gratter l’oreille', 'dire un secret'],
      'Un petit détail nous rend méfiant : on se doute de quelque chose.'],
    ['couper la poire en deux', 'trouver un compromis', ['partager un fruit', 'se disputer'],
      'Chacun fait un pas vers l’autre pour se mettre d’accord.'],
    ['avoir les yeux plus gros que le ventre', 'prendre trop à manger', ['avoir de grands yeux', 'être très curieux'],
      'Tout a l’air si bon qu’on se sert trop… mais on ne peut pas tout finir !'],
    ['faire la grasse matinée', 'dormir tard le matin', ['manger gras le matin', 'se lever très tôt'],
      'On reste longtemps au lit, le matin.'],
    ['revenir à ses moutons', 'revenir au sujet', ['rentrer à la ferme', 'compter pour s’endormir'],
      'Elle vient d’une pièce du Moyen Âge, <i>La Farce de Maître Pathelin</i>, où un juge ramène sans cesse '
        + 'la discussion à une histoire de moutons.'],
    ['avoir un coup de foudre', 'tomber amoureux tout de suite', ['être touché par un éclair', 'se mettre en colère'],
      'L’amour arrive d’un coup, aussi vite que la foudre.'],
    ['mettre la charrue avant les bœufs', 'ne pas suivre le bon ordre', ['labourer un champ', 'travailler trop lentement'],
      'Ce sont les bœufs qui tirent la charrue : il faut les mettre devant, sinon rien n’avance !'],
    ['avoir la langue bien pendue', 'être très bavard', ['tirer la langue', 'être gourmand'],
      'On parle sans arrêt, avec beaucoup de facilité.'],
    ['être haut comme trois pommes', 'être tout petit', ['être très grand', 'aimer les pommes'],
      'Trois pommes posées l’une sur l’autre, ce n’est pas bien haut !'],
    ['passer une nuit blanche', 'ne pas dormir de la nuit', ['voir tomber la neige', 'faire un cauchemar'],
      'On reste éveillé toute la nuit, sans fermer l’œil.'],
    ['ne pas être dans son assiette', 'ne pas se sentir bien', ['ne pas être à table', 'ne pas avoir faim'],
      'Autrefois, le mot « assiette » voulait dire la position, la façon d’être assis : on n’est pas bien installé.'],
    ['être dans de beaux draps', 'avoir de gros ennuis', ['être bien au lit', 'être bien habillé'],
      'Attention, c’est ironique : ces « beaux draps » ne sont pas beaux du tout !'],
    ['mettre son grain de sel', 'se mêler de la conversation', ['saler un plat', 'aider à cuisiner'],
      'On donne son avis alors que personne ne l’a demandé.'],
    ['faire d’une pierre deux coups', 'réussir deux choses à la fois', ['casser une pierre', 'se tromper deux fois'],
      'Une seule action suffit pour obtenir deux résultats.'],
    ['avoir la moutarde qui monte au nez', 'commencer à se fâcher', ['avoir envie d’éternuer', 'avoir très faim'],
      'La colère monte, aussi piquante que la moutarde forte !'],
  ];

  ajouterEtape({
    id: '5e-vocabulaire-expressions',
    banque: EXPRESSIONS,
    creerQuestion: ([expression, sens, pieges, explication]) => question({
      consigne: 'Que veut dire cette expression ?',
      enonce: `« ${expression} »`,
      reponse: sens,
      pieges,
      solution: `« ${expression} » = <b>${sens}</b>`,
      explication: `« ${expression} » veut dire : <b>${sens}</b>.<br>${explication}`,
    }),
    titreLecon: 'Les expressions imagées',
    lecon: `
      <p>Une <b>expression imagée</b> est un groupe de mots qui ne se comprend <b>pas mot à mot</b> :
        il faut connaître son sens.</p>
      <p>👉 « Tomber dans les pommes » ne veut pas dire tomber dans un tas de fruits, mais <b>s’évanouir</b>.</p>
      <p>Elles rendent la langue vivante et amusante. Beaucoup parlent d’animaux (« une faim de loup », « poser un lapin »)
        ou du corps (« avoir le cœur sur la main »).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> méfie-toi du sens « au pied de la lettre » : c’est presque toujours un piège !
        Imagine plutôt la situation où l’on dit cette phrase.</div>
      <p>Certaines ont une longue histoire : « revenir à ses moutons » vient d’une pièce de théâtre du Moyen Âge,
        <i>La Farce de Maître Pathelin</i>.</p>
    `,
  });

  // ======================================================================
  // 6. Le vocabulaire des émotions
  // ======================================================================
  ajouterClassement({
    id: '5e-vocabulaire-emotions',
    consigne: 'Quelle émotion ressent le personnage ?',
    nombreChoix: 4,
    // Les émotions « jumelles » sont toujours proposées ensemble : ce sont elles qui font réfléchir
    toujoursProposer: cle => ({
      joie: ['surprise'], peur: ['surprise'], colere: ['tristesse'], tristesse: ['colere'], surprise: ['peur', 'joie'],
    })[cle],
    categories: {
      joie: {
        nom: 'la joie',
        regle: 'La <b>joie</b> se voit au sourire, au rire, à l’envie de bouger, de chanter, de partager.',
      },
      peur: {
        nom: 'la peur',
        regle: 'La <b>peur</b> fait trembler, pâlir, battre le cœur : on a envie de fuir ou de se cacher.',
      },
      colere: {
        nom: 'la colère',
        regle: 'La <b>colère</b> fait rougir, serrer les poings et les dents, crier ou claquer les portes.',
      },
      tristesse: {
        nom: 'la tristesse',
        regle: 'La <b>tristesse</b> fait pleurer, soupirer, baisser la tête : on n’a plus envie de rien.',
      },
      surprise: {
        nom: 'la surprise',
        regle: 'La <b>surprise</b> fait écarquiller les yeux et ouvrir la bouche : on ne s’attendait pas du tout à ça !',
      },
    },
    // [phrase, émotion, les indices]
    banque: [
      ['Kalia saute partout en riant et serre tous ses amis dans ses bras.', 'joie',
        'Les indices : elle « saute partout », « en riant », et « serre tous ses amis dans ses bras ».'],
      ['Tom rentre de l’école en chantonnant, avec un sourire jusqu’aux oreilles.', 'joie',
        'Les indices : il rentre « en chantonnant », « avec un sourire jusqu’aux oreilles ».'],
      ['Anaïs court montrer son bulletin à ses parents en sautillant et en riant.', 'joie',
        'Les indices : elle court montrer son bulletin « en sautillant » et « en riant ».'],
      ['Sami rit aux éclats et applaudit de toutes ses forces.', 'joie',
        'Les indices : il « rit aux éclats » et « applaudit de toutes ses forces ».'],
      ['Sélène sifflote en arrosant les fleurs, le sourire aux lèvres.', 'joie',
        'Les indices : elle « sifflote », « le sourire aux lèvres ».'],
      ['Hugo danse au milieu du salon et chante à tue-tête.', 'joie',
        'Les indices : il « danse » et « chante à tue-tête ».'],
      ['Léa tremble, le cœur battant, et n’ose plus faire un pas dans le noir.', 'peur',
        'Les indices : elle « tremble », a « le cœur battant » et « n’ose plus faire un pas » dans le noir.'],
      ['Pendant l’orage, Teva se cache sous sa couette, les jambes en coton.', 'peur',
        'Les indices : il « se cache » pendant l’orage et a « les jambes en coton ».'],
      ['Devant la porte de la cave, Kylian a des sueurs froides et claque des dents.', 'peur',
        'Les indices : il a « des sueurs froides » et « claque des dents » devant la cave.'],
      ['Inès entend des pas au grenier : elle retient son souffle, sans oser bouger.', 'peur',
        'Les indices : elle « retient son souffle », « sans oser bouger ».'],
      ['Quand le loup hurle au loin, Zoé a la chair de poule et se serre contre son père.', 'peur',
        'Les indices : elle a « la chair de poule » et « se serre contre son père ».'],
      ['Sami devient tout pâle et recule lentement devant le gros chien qui grogne.', 'peur',
        'Les indices : il « devient tout pâle » et « recule lentement » devant le chien.'],
      ['Noa serre les poings, devient tout rouge et claque la porte de sa chambre.', 'colere',
        'Les indices : il « serre les poings », devient « tout rouge » et « claque la porte ».'],
      ['Les sourcils froncés, Inès tape du pied et crie : « Ce n’est pas juste ! »', 'colere',
        'Les indices : les « sourcils froncés », elle « tape du pied » et « crie ».'],
      ['Enzo grogne, serre les dents et froisse son brouillon en boule.', 'colere',
        'Les indices : il « grogne », « serre les dents » et « froisse son brouillon ».'],
      ['Le visage écarlate, Papi grogne et tape du poing sur la table.', 'colere',
        'Les indices : le visage « écarlate » (tout rouge), il « grogne » et « tape du poing ».'],
      ['Sami a les yeux qui lancent des éclairs et la voix qui gronde.', 'colere',
        'Les indices : il a « les yeux qui lancent des éclairs » et « la voix qui gronde ».'],
      ['Maëva croise les bras, fusille son frère du regard et refuse de lui parler.', 'colere',
        'Les indices : elle « croise les bras », « fusille son frère du regard » et « refuse de lui parler ».'],
      ['Léa regarde la pluie par la fenêtre, les yeux pleins de larmes : son amie a déménagé.', 'tristesse',
        'Les indices : elle a « les yeux pleins de larmes », car « son amie a déménagé ».'],
      ['Hugo baisse la tête, la gorge serrée ; il n’a plus envie de rien.', 'tristesse',
        'Les indices : il « baisse la tête », « la gorge serrée », et « n’a plus envie de rien ».'],
      ['Après le match perdu, Sione rentre tête basse, les épaules tombantes, sans un mot.', 'tristesse',
        'Les indices : « tête basse », « les épaules tombantes », « sans un mot ».'],
      ['Hinano soupire, le regard perdu, et laisse son goûter sans y toucher.', 'tristesse',
        'Les indices : elle « soupire », « le regard perdu », et laisse son goûter « sans y toucher ».'],
      ['Wanir regarde son cerf-volant déchiré ; une grosse larme roule sur sa joue.', 'tristesse',
        'Les indices : son cerf-volant est « déchiré » et « une grosse larme roule sur sa joue ».'],
      ['C’est la fin des vacances : Ilona fait sa valise en soupirant, le cœur gros.', 'tristesse',
        'Les indices : elle fait sa valise « en soupirant », « le cœur gros ».'],
      ['Bouche bée, les yeux ronds, Tom découvre qu’il a neigé en plein mois de juin !', 'surprise',
        'Les indices : « Bouche bée, les yeux ronds »… et de la neige en juin, c’est inattendu !'],
      ['Un pigeon entre dans la classe par la fenêtre : Mei en reste bouche bée, les sourcils levés.', 'surprise',
        'Les indices : elle « en reste bouche bée », « les sourcils levés », devant une chose inattendue.'],
      ['Sami ouvre le placard à balais et écarquille les yeux : un canard est caché dedans !', 'surprise',
        'Les indices : il « écarquille les yeux » ; un canard dans un placard, c’est inattendu !'],
      ['Les sourcils levés, Émeline regarde l’horloge : déjà midi ? Elle n’a pas vu le temps passer !', 'surprise',
        'Les indices : « Les sourcils levés », « déjà midi ? » ; elle ne s’attendait pas à ce qu’il soit si tard.'],
      ['Papi en laisse tomber son journal, la bouche ouverte : le chat vient d’ouvrir le frigo tout seul !', 'surprise',
        'Les indices : il « laisse tomber son journal », « la bouche ouverte », devant une chose inattendue.'],
      ['Ethan se frotte les yeux et n’en revient pas : un paon se promène dans la cour de l’école !', 'surprise',
        'Les indices : il « se frotte les yeux » et « n’en revient pas » : un paon à l’école, c’est inattendu !'],
    ],
    titreLecon: 'Le vocabulaire des émotions',
    lecon: `
      <p>Pour montrer une émotion, un écrivain ne la nomme pas toujours : il décrit le <b>corps</b>
        et le <b>comportement</b> du personnage.</p>
      <table>
        <tr><th>émotion</th><th>du plus faible au plus fort</th><th>les indices</th></tr>
        <tr><td><b>la joie</b></td><td>content, joyeux, ravi, fou de joie</td><td>sourire, rire, sauter, chanter</td></tr>
        <tr><td><b>la peur</b></td><td>inquiet, effrayé, terrifié</td><td>trembler, pâlir, se cacher</td></tr>
        <tr><td><b>la colère</b></td><td>agacé, fâché, furieux, hors de soi</td><td>rougir, serrer les poings, crier</td></tr>
        <tr><td><b>la tristesse</b></td><td>déçu, triste, malheureux, désespéré</td><td>pleurer, soupirer, baisser la tête</td></tr>
        <tr><td><b>la surprise</b></td><td>surpris, stupéfait, sidéré</td><td>bouche bée, yeux ronds</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cherche les indices dans le corps : le cœur, les yeux,
        la bouche, les mains… Ils trahissent l’émotion du personnage !</div>
      <p>⚠️ Lis toute la phrase : on peut aussi pleurer de joie ou trembler de froid !</p>
    `,
  });
})();
