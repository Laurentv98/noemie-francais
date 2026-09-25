// Renard Malin — Grammaire, niveau 4e : les 6 étapes de la Colline de la Grammaire (d’hiver)
//
// Les phrases sont écrites à la main. Le mot ou le groupe à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { ajouterEtape, ajouterClassement, fabriquer, tirerType, groupeSouligne } = RM.phrases;

  // ======================================================================
  // 1. Épithète, complément du nom ou apposition ?
  // ======================================================================
  // [phrase, fonction, le nom complété (pour l'apposition : l'être ou la chose qu'elle désigne)]
  // Pour l'apposition : seulement des groupes nominaux détachés. Pas d'adjectif détaché
  // (« Roxy, fatiguée, … ») : on l'appelle aujourd'hui « épithète détachée », on évite le cas.
  const EXPANSIONS = [
    ['Roxy agite sa queue [[touffue]].', 'epithete', 'queue'],
    ['Un [[petit]] lapin sort de son terrier.', 'epithete', 'lapin'],
    ['Papi a préparé une soupe [[délicieuse]].', 'epithete', 'soupe'],
    ['Teva a enfilé ses bottes [[jaunes]].', 'epithete', 'bottes'],
    ['Nous avons passé une [[belle]] journée à la plage.', 'epithete', 'journée'],
    ['Le hibou pousse un cri [[étrange]].', 'epithete', 'cri'],
    ['Zoé lit une histoire [[très drôle]].', 'epithete', 'histoire'],
    ['Les feuilles [[mortes]] craquent sous nos pieds.', 'epithete', 'feuilles'],
    ['Kylian a adopté un chaton [[noir]].', 'epithete', 'chaton'],
    ['Le [[vieux]] chêne abrite une famille d’écureuils.', 'epithete', 'chêne'],
    ['Inès porte une écharpe [[bleue]].', 'epithete', 'écharpe'],
    ['Roxy boit une tasse [[de chocolat]].', 'complement', 'tasse'],
    ['Le terrier [[du renard]] est bien caché.', 'complement', 'terrier'],
    ['Papi a acheté une machine [[à laver]].', 'complement', 'machine'],
    ['Ce pull [[en laine]] tient bien chaud.', 'complement', 'pull'],
    ['Mamie a fait une tarte [[aux pommes]].', 'complement', 'tarte'],
    ['La maison [[de Mamie]] se trouve près du lac.', 'complement', 'maison'],
    ['Le chemin [[de l’école]] longe la rivière.', 'complement', 'chemin'],
    ['Mei a perdu la clé [[du garage]].', 'complement', 'clé'],
    ['Tom range sa raquette [[de tennis]].', 'complement', 'raquette'],
    ['Hugo a dessiné une carte [[au trésor]].', 'complement', 'carte'],
    ['J’ai trouvé une plume [[de hibou]].', 'complement', 'plume'],
    ['Roxy, [[la renarde rusée]], se cache derrière un buisson.', 'apposition', 'Roxy'],
    ['[[Grand lecteur de romans]], Papi a une immense bibliothèque.', 'apposition', 'Papi'],
    ['Le hibou, [[gardien de la nuit]], ouvre ses grands yeux.', 'apposition', 'le hibou'],
    ['Nous avons visité Paris, [[la capitale de la France]].', 'apposition', 'Paris'],
    ['Mon frère, [[un grand sportif]], court tous les matins.', 'apposition', 'mon frère'],
    ['Hinano, [[la meilleure amie de Zoé]], arrive demain.', 'apposition', 'Hinano'],
    ['[[Excellente nageuse]], Anaïs a gagné la course.', 'apposition', 'Anaïs'],
    ['Voici Médor, [[le chien de nos voisins]].', 'apposition', 'Médor'],
    ['Le cagou, [[l’oiseau des forêts calédoniennes]], ne sait pas voler.', 'apposition', 'le cagou'],
    ['Sione, [[le capitaine de l’équipe]], encourage ses amis.', 'apposition', 'Sione'],
    ['Victor Hugo, [[un grand écrivain]], a écrit « Les Misérables ».', 'apposition', 'Victor Hugo'],
  ];

  // « du », « au », « aux » et « des » cachent une préposition
  const CONTRACTIONS = { du: 'de + le', au: 'à + le', aux: 'à + les', des: 'de + les' };

  // La remarque de Roxy, propre à chaque phrase
  function remarqueExpansion(texte, cle, nom) {
    const groupe = groupeSouligne(texte);
    if (cle === 'epithete') {
      const sorte = groupe.includes(' ') ? 'un groupe adjectival' : 'un adjectif';
      return `« ${groupe} » est ${sorte} qui complète directement le nom « ${nom} », sans virgule.`;
    }
    if (cle === 'complement') {
      const premier = groupe.split(/[\s’]/)[0];
      const lien = CONTRACTIONS[premier]
        ? `« ${premier} » (= ${CONTRACTIONS[premier]})`
        : `la préposition « ${premier} »`;
      return `« ${groupe} » est relié au nom « ${nom} » par ${lien}.`;
    }
    return `« ${groupe} » est un groupe nominal détaché par une virgule : c’est une autre façon de désigner ${nom}.`;
  }

  ajouterClassement({
    id: '4e-grammaire-expansions-nom',
    consigne: 'Quelle est la fonction de l’expansion soulignée ?',
    categories: {
      epithete: {
        nom: 'épithète',
        regle: 'L’<b>épithète</b> est un adjectif placé juste à côté du nom qu’il complète (avant ou après), '
          + 'sans virgule ni préposition.',
      },
      complement: {
        nom: 'complément du nom',
        regle: 'Le <b>complément du nom</b> est relié au nom par une <b>préposition</b> (de, à, en, pour, sans…) : '
          + 'une tasse <i>de chocolat</i>.',
      },
      apposition: {
        nom: 'apposition',
        regle: 'L’<b>apposition</b> est un groupe nominal <b>détaché</b> par une virgule. '
          + 'Il désigne la même personne ou la même chose que le nom : <i>Roxy, la renarde rusée</i>.',
      },
    },
    banque: EXPANSIONS.map(([texte, cle, nom]) => [texte, cle, remarqueExpansion(texte, cle, nom)]),
    titreLecon: 'Les expansions du nom',
    lecon: `
      <p>On peut enrichir un nom avec des <b>expansions</b> : elles précisent de qui ou de quoi l’on parle.</p>
      <table>
        <tr><th>fonction</th><th>comment la reconnaître</th><th>exemple</th></tr>
        <tr><td><b>épithète</b></td><td>un adjectif collé au nom, avant ou après</td><td>une <b>petite</b> renarde <b>rousse</b></td></tr>
        <tr><td><b>complément du nom</b></td><td>une préposition (de, à, en, pour, sans…) + un nom ou un infinitif</td>
          <td>une tasse <b>de chocolat</b>, une machine <b>à laver</b></td></tr>
        <tr><td><b>apposition</b></td><td>un groupe nominal détaché par une virgule</td><td>Roxy, <b>la renarde rusée</b>, …</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde le début du groupe et la ponctuation.<br>
        Une préposition (de, du, à, au, en…) → <b>complément du nom</b>.<br>
        Un groupe nominal séparé par une virgule → <b>apposition</b>. On peut dire : <i>Roxy <u>est</u> la renarde rusée</i>.<br>
        Un adjectif sans virgule → <b>épithète</b>.</div>
      <p>⚠️ Après un nom, « du », « des », « au » et « aux » cachent une préposition : du = de + le, des = de + les,
        au = à + le, aux = à + les (<i>la clé du garage, la maison des voisins</i>).</p>
      <p>⚠️ Un adjectif seul, détaché par des virgules (<i>Roxy, <b>fatiguée</b>, s’endort</i>), n’est pas une apposition :
        on l’appelle une <b>épithète détachée</b>.</p>
    `,
  });

  // ======================================================================
  // 2. Les pronoms relatifs
  // ======================================================================
  // [phrase avec ___, le pronom, la phrase refaite avec l'antécédent, lieu ou temps (pour « où ») ou une remarque]
  // Après chaque trou, un mot qui commence par une consonne (pas de h muet) : sinon « que » deviendrait « qu’ ».
  const RELATIFS = [
    ['La renarde ___ court dans le pré s’appelle Roxy.', 'qui', '<b>la renarde</b> court dans le pré'],
    ['J’ai un ami ___ parle trois langues.', 'qui', '<b>cet ami</b> parle trois langues'],
    ['Les oiseaux ___ chantent le matin me réveillent.', 'qui', '<b>les oiseaux</b> chantent le matin'],
    ['Roxy regarde la lune ___ brille dans le ciel.', 'qui', '<b>la lune</b> brille dans le ciel'],
    ['Je connais une fille ___ joue du violon.', 'qui', '<b>cette fille</b> joue du violon'],
    ['Le gâteau ___ sort du four sent bon.', 'qui', '<b>le gâteau</b> sort du four'],
    ['Prends le chemin ___ mène à la rivière.', 'qui', '<b>le chemin</b> mène à la rivière'],
    ['Les enfants ___ font du bruit réveillent le chat.', 'qui', '<b>les enfants</b> font du bruit'],
    ['Le livre ___ tu m’as prêté est passionnant.', 'que', 'tu m’as prêté <b>le livre</b>'],
    ['La chanson ___ nous chantons vient d’Italie.', 'que', 'nous chantons <b>la chanson</b>'],
    ['Voici la cabane ___ Papi a construite.', 'que', 'Papi a construit <b>la cabane</b>'],
    ['La soupe ___ prépare Mamie est délicieuse.', 'que', 'Mamie prépare <b>la soupe</b>',
      'Attention, le sujet « Mamie » est placé après le verbe.'],
    ['Je te prête le jeu ___ Sami m’a offert.', 'que', 'Sami m’a offert <b>le jeu</b>'],
    ['L’histoire ___ Papi raconte nous fait rire.', 'que', 'Papi raconte <b>l’histoire</b>'],
    ['Montre-moi le dessin ___ tu as fait.', 'que', 'tu as fait <b>le dessin</b>'],
    ['Raconte-moi ce ___ tu as vu.', 'que', 'tu as vu <b>cela</b>', 'Ici, l’antécédent est le pronom « ce ».'],
    ['Voici le livre ___ je t’ai parlé.', 'dont', 'je t’ai parlé <b>de ce livre</b>'],
    ['C’est le vélo ___ Sami rêve.', 'dont', 'Sami rêve <b>de ce vélo</b>'],
    ['Roxy est une renarde ___ la queue est très touffue.', 'dont', 'la queue <b>de cette renarde</b> est très touffue'],
    ['Voici les outils ___ Papi a besoin.', 'dont', 'Papi a besoin <b>de ces outils</b>'],
    ['C’est une chanson ___ je me souviens très bien.', 'dont', 'je me souviens très bien <b>de cette chanson</b>'],
    ['Le chien ___ Wakana a peur aboie très fort.', 'dont', 'Wakana a peur <b>de ce chien</b>'],
    ['C’est une médaille ___ Léa est très fière.', 'dont', 'Léa est très fière <b>de cette médaille</b>'],
    ['J’ai une amie ___ le père est pilote.', 'dont', 'le père <b>de cette amie</b> est pilote'],
    ['Voilà ce ___ nous avons besoin.', 'dont', 'nous avons besoin <b>de cela</b>', 'Ici, l’antécédent est le pronom « ce ».'],
    ['La forêt ___ Roxy se promène est immense.', 'où', 'Roxy se promène <b>dans la forêt</b>', 'lieu'],
    ['Voici le terrier ___ dorment les renardeaux.', 'où', 'les renardeaux dorment <b>dans le terrier</b>', 'lieu'],
    ['La plage ___ nous allons est magnifique.', 'où', 'nous allons <b>à la plage</b>', 'lieu'],
    ['La cabane ___ nous dormons l’été est secrète.', 'où', 'nous dormons <b>dans la cabane</b> l’été', 'lieu'],
    ['Le village ___ Papi est né est tout petit.', 'où', 'Papi est né <b>dans ce village</b>', 'lieu'],
    ['Je me souviens du jour ___ tu es né.', 'où', 'tu es né <b>ce jour-là</b>', 'temps'],
    ['C’était l’année ___ Maëva est entrée au collège.', 'où', 'Maëva est entrée au collège <b>cette année-là</b>', 'temps'],
    ['Au moment ___ la cloche a sonné, tout le monde est sorti.', 'où', 'la cloche a sonné <b>à ce moment-là</b>', 'temps'],
  ];

  const PRONOMS_RELATIFS = ['qui', 'que', 'dont', 'où'];
  const FONCTIONS_RELATIF = {
    qui: () => 'Le pronom est <b>sujet</b> du verbe de la relative → <b>qui</b>.',
    que: () => 'Le pronom est <b>COD</b> du verbe de la relative → <b>que</b>.',
    dont: () => 'Le pronom remplace un complément construit avec <b>de</b> → <b>dont</b>.',
    où: sorte => `Le pronom est un complément de <b>${sorte}</b> → <b>où</b>.`,
  };

  ajouterEtape({
    id: '4e-grammaire-pronoms-relatifs',
    banque: RELATIFS,
    creerQuestion([phrase, pronom, refaite, precision]) {
      const sorte = pronom === 'où' ? precision : '';
      const remarque = pronom === 'où' || !precision ? '' : ` ${precision}`;
      return fabriquer(tirerType({ choix: 0.75, vraifaux: 0.25 }), {
        phrase,
        reponse: pronom,
        choix: PRONOMS_RELATIFS,
        mauvais: PRONOMS_RELATIFS.filter(p => p !== pronom),
        explication: `Remets l’antécédent à la place du pronom : <i>${refaite}</i>.${remarque}<br>`
          + FONCTIONS_RELATIF[pronom](sorte),
        consigneChoix: 'Choisis le bon pronom relatif',
        consigneVraiFaux: 'Le pronom relatif est-il bien choisi ?',
      });
    },
    titreLecon: 'Les pronoms relatifs',
    lecon: `
      <p>Le <b>pronom relatif</b> commence une subordonnée relative. Il reprend un nom ou un pronom (ce, celui…)
        placé avant lui : son <b>antécédent</b>. Pour choisir le bon pronom, cherche sa <b>fonction</b> dans la relative :</p>
      <table>
        <tr><th>pronom</th><th>fonction</th><th>exemple</th></tr>
        <tr><td><b>qui</b></td><td>sujet</td><td>le renard <b>qui</b> court (le renard court)</td></tr>
        <tr><td><b>que</b></td><td>COD</td><td>le livre <b>que</b> je lis (je lis le livre)</td></tr>
        <tr><td><b>dont</b></td><td>complément construit avec « de »</td><td>le livre <b>dont</b> je parle (je parle de ce livre)</td></tr>
        <tr><td><b>où</b></td><td>complément de lieu ou de temps</td><td>la forêt <b>où</b> je me promène, le jour <b>où</b> tu es né</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> refais la phrase en remettant l’antécédent à la place du pronom.<br>
        <i>le livre … tu m’as prêté</i> → tu m’as prêté <u>le livre</u> : c’est un COD → <b>que</b>.<br>
        <i>le vélo … Sami rêve</i> → Sami rêve <u>de ce vélo</u> : il y a « de » → <b>dont</b>.</div>
      <p>⚠️ Devant une voyelle, « que » s’élide : <i>le livre <b>qu’</b>il lit</i>. « Qui » ne s’élide jamais.</p>
      <p>Il existe aussi des pronoms relatifs composés : <i>lequel, auquel, duquel…</i> (la table <b>sur laquelle</b> j’écris).</p>
    `,
  });

  // ======================================================================
  // 3. Relative, complétive ou circonstancielle ?
  // ======================================================================
  // Pas d'interrogative indirecte (« je me demande si… », « je sais où… ») : certains manuels la rangent
  // parmi les complétives. Pas de « l’idée que… » (complétive qui complète un nom), pas de « si… que » (seulement dans la leçon).
  ajouterClassement({
    id: '4e-grammaire-subordonnees',
    consigne: 'Quelle est la nature de la proposition subordonnée soulignée ?',
    categories: {
      relative: {
        nom: 'relative',
        regle: 'La subordonnée <b>relative</b> commence par un <b>pronom relatif</b> (qui, que, dont, où…) '
          + 'qui reprend un nom placé avant lui : son <b>antécédent</b>.',
      },
      completive: {
        nom: 'complétive',
        regle: 'La subordonnée <b>complétive</b> est le plus souvent introduite par la conjonction « que », '
          + '<b>sans antécédent</b>. Elle complète le plus souvent le verbe, en général comme COD (je pense quoi ?).',
      },
      circonstancielle: {
        nom: 'circonstancielle',
        regle: 'La subordonnée <b>circonstancielle</b> commence par une conjonction comme quand, parce que, si, '
          + 'pour que, bien que… Elle indique une <b>circonstance</b> (temps, cause, but…) : on peut souvent la déplacer.',
      },
    },
    banque: [
      ['Le livre [[que tu m’as prêté]] est passionnant.', 'relative',
        '« que » reprend le nom « livre », son antécédent : c’est un pronom relatif, COD du verbe « as prêté ».'],
      ['J’ai vu un renard [[qui traversait la clairière]].', 'relative',
        '« qui » reprend le nom « renard », son antécédent : c’est un pronom relatif, sujet du verbe « traversait ».'],
      ['La maison [[où Mamie a grandi]] est au bord de la mer.', 'relative',
        '« où » reprend le nom « maison », son antécédent : c’est un pronom relatif, complément de lieu.'],
      ['Voici l’ami [[dont je t’ai parlé]].', 'relative',
        '« dont » reprend le nom « ami », son antécédent : c’est un pronom relatif (je t’ai parlé de cet ami).'],
      ['Les crêpes [[que Papi prépare]] sont délicieuses.', 'relative',
        '« que » reprend le nom « crêpes », son antécédent : c’est un pronom relatif, COD du verbe « prépare ».'],
      ['Roxy connaît un sentier [[qui mène au lac]].', 'relative',
        '« qui » reprend le nom « sentier », son antécédent : c’est un pronom relatif, sujet du verbe « mène ».'],
      ['Je n’oublierai jamais le jour [[où nous nous sommes rencontrés]].', 'relative',
        '« où » reprend le nom « jour », son antécédent : c’est un pronom relatif, complément de temps.'],
      ['C’est un film [[dont tout le monde parle]].', 'relative',
        '« dont » reprend le nom « film », son antécédent : c’est un pronom relatif (tout le monde parle de ce film).'],
      ['Tom a retrouvé la balle [[qu’il avait perdue]].', 'relative',
        '« qu’ » reprend le nom « balle », son antécédent : c’est un pronom relatif, COD du verbe « avait perdue ».'],
      ['Je pense à la surprise [[que tu prépares]].', 'relative',
        '« que » reprend le nom « surprise », son antécédent : c’est un pronom relatif (tu prépares la surprise).'],
      ['La chanson [[que nous répétons]] parle de l’hiver.', 'relative',
        '« que » reprend le nom « chanson », son antécédent : c’est un pronom relatif, COD du verbe « répétons ».'],
      ['Je pense [[que tu prépares une surprise]].', 'completive',
        'Ici, « que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « pense » (je pense quoi ?).'],
      ['Roxy sait [[que l’hiver approche]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « sait » (Roxy sait quoi ?).'],
      ['Maman veut [[que nous rangions nos chambres]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « veut » (Maman veut quoi ?).'],
      ['Il faut [[que tu te reposes]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée complète le verbe « falloir » (il faut) : '
          + 'on ne peut pas la supprimer.'],
      ['Je crois [[qu’il va pleuvoir]].', 'completive',
        '« qu’ » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « crois » (je crois quoi ?).'],
      ['Kalia espère [[que ses amis viendront]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « espère » (Kalia espère quoi ?).'],
      ['Tom annonce [[que le spectacle va commencer]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « annonce » (Tom annonce quoi ?).'],
      ['Mamie souhaite [[que nous venions la voir]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « souhaite » (Mamie souhaite quoi ?).'],
      ['Nous avons appris [[que la classe partirait en voyage]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « avons appris » (nous avons appris quoi ?).'],
      ['Zoé remarque [[que le ciel se couvre]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « remarque » (Zoé remarque quoi ?).'],
      ['Je sais [[que Sami adore les énigmes]].', 'completive',
        '« que » n’a pas d’antécédent : c’est une conjonction. La subordonnée est COD du verbe « sais » (je sais quoi ?).'],
      ['Nous sortirons [[quand la pluie cessera]].', 'circonstancielle',
        '« quand » est une conjonction de temps : la subordonnée dit <b>quand</b> nous sortirons.'],
      ['Roxy se cache [[parce qu’elle entend un bruit]].', 'circonstancielle',
        '« parce que » est une conjonction de cause : la subordonnée dit <b>pourquoi</b> Roxy se cache.'],
      ['[[Si tu veux]], nous irons à la plage.', 'circonstancielle',
        '« si » est une conjonction de condition : la subordonnée dit <b>à quelle condition</b> nous irons à la plage.'],
      ['Papi parle fort [[pour que tout le monde l’entende]].', 'circonstancielle',
        '« pour que » est une conjonction de but : il y a « que », mais il fait partie de la conjonction « pour que ».'],
      ['Je t’appellerai [[dès que j’arriverai]].', 'circonstancielle',
        '« dès que » est une conjonction de temps : il y a « que », mais il fait partie de la conjonction « dès que ».'],
      ['[[Bien qu’il soit fatigué]], Noa termine ses devoirs.', 'circonstancielle',
        '« bien que » est une conjonction d’opposition : la subordonnée pourrait se placer après la principale.'],
      ['Range tes jouets [[avant que Maman rentre]].', 'circonstancielle',
        '« avant que » est une conjonction de temps : il y a « que », mais il fait partie de la conjonction « avant que ».'],
      ['[[Puisque tu as fini]], tu peux aller jouer.', 'circonstancielle',
        '« puisque » est une conjonction de cause : la subordonnée dit <b>pourquoi</b> tu peux aller jouer.'],
      ['[[Lorsque la nuit tombe]], les chouettes se réveillent.', 'circonstancielle',
        '« lorsque » est une conjonction de temps : la subordonnée dit <b>quand</b> les chouettes se réveillent.'],
      ['[[Comme il pleuvait]], nous sommes restés à la maison.', 'circonstancielle',
        '« comme » est ici une conjonction de cause (= parce que) : la subordonnée dit <b>pourquoi</b> nous sommes restés.'],
      ['Hugo s’entraîne chaque soir [[afin que son équipe gagne]].', 'circonstancielle',
        '« afin que » est une conjonction de but : il y a « que », mais il fait partie de la conjonction « afin que ».'],
    ],
    titreLecon: 'Les propositions subordonnées',
    lecon: `
      <p>Une <b>proposition subordonnée</b> dépend d’une proposition principale. Elle commence par un mot subordonnant.</p>
      <table>
        <tr><th>subordonnée</th><th>mot subordonnant</th><th>exemple</th></tr>
        <tr><td><b>relative</b></td><td>un pronom relatif (qui, que, dont, où…) qui reprend un nom : l’antécédent</td>
          <td>le livre <u>que tu lis</u></td></tr>
        <tr><td><b>complétive</b></td><td>le plus souvent la conjonction « que », sans antécédent ;
          elle complète le plus souvent le verbe</td>
          <td>je pense <u>que tu as raison</u></td></tr>
        <tr><td><b>circonstancielle</b></td><td>une conjonction : quand, parce que, si, pour que, bien que…</td>
          <td>je sors <u>quand il fait beau</u></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> devant « que », regarde le mot juste avant.<br>
        Un <b>nom</b> repris par « que » → <b>relative</b> : <i>la surprise <u>que tu prépares</u></i>
        (il manque un morceau : tu prépares… la surprise).<br>
        Un <b>verbe</b> (je pense, je sais, il faut…) → <b>complétive</b> : <i>je pense <u>que tu prépares une surprise</u></i>
        (la subordonnée est complète).<br>
        « parce », « pour », « dès », « avant », « bien »… → <b>circonstancielle</b> : « que » fait partie de la conjonction.</div>
      <p>⚠️ <b>si… que</b>, <b>tellement… que</b> → circonstancielle de <b>conséquence</b> :
        <i>Il faisait si froid <u>que le lac a gelé</u>.</i></p>
    `,
  });

  // ======================================================================
  // 4. Les subordonnées circonstancielles
  // ======================================================================
  // Cinq circonstances, quatre boutons : des conjonctions nettes, sans aucun doute possible.
  // Pas de « de sorte que » + subjonctif (le but), pas de « quand » qui voudrait dire « si ».
  ajouterClassement({
    id: '4e-grammaire-circonstancielles',
    consigne: 'Quelle circonstance exprime la subordonnée soulignée ?',
    nombreChoix: 4,
    // Les pièges « jumeaux », toujours proposés avec la bonne réponse
    toujoursProposer: cle => ({
      temps: ['condition'], cause: ['consequence'], consequence: ['cause', 'but'],
      but: ['consequence', 'cause'], condition: ['temps'],
    })[cle],
    categories: {
      temps: {
        nom: 'temps',
        regle: 'La subordonnée de <b>temps</b> répond à la question « quand ? » : quand, lorsque, dès que, avant que…',
      },
      cause: {
        nom: 'cause',
        regle: 'La subordonnée de <b>cause</b> répond à la question « pourquoi ? » : parce que, puisque, '
          + 'comme (en tête de phrase)…',
      },
      consequence: {
        nom: 'conséquence',
        regle: 'La subordonnée de <b>conséquence</b> dit le <b>résultat</b> de l’action : si bien que, de sorte que, '
          + 'si… que, tellement… que (+ indicatif).',
      },
      but: {
        nom: 'but',
        regle: 'La subordonnée de <b>but</b> dit ce que l’on <b>veut</b> obtenir : pour que, afin que (+ subjonctif).',
      },
      condition: {
        nom: 'condition',
        regle: 'La subordonnée de <b>condition</b> dit à quelle condition l’action se réalise : elle commence par <b>si</b>.',
      },
    },
    banque: [
      ['[[Quand Papi est arrivé]], nous avons ouvert les cadeaux.', 'temps',
        '« quand » situe l’action dans le temps : on a ouvert les cadeaux au moment de l’arrivée de Papi.'],
      ['[[Lorsque la nuit tombe]], les chouettes se réveillent.', 'temps', '« lorsque » veut dire « quand ».'],
      ['Roxy sort de son terrier [[dès que le soleil se lève]].', 'temps', '« dès que » veut dire « aussitôt que ».'],
      ['Rentre les chaises [[avant qu’il pleuve]].', 'temps', '« avant que » situe l’action dans le temps : avant la pluie.'],
      ['Les enfants ont applaudi [[quand le rideau s’est levé]].', 'temps',
        '« quand » situe l’action dans le temps : au moment où le rideau s’est levé.'],
      ['[[Dès que la cloche a sonné]], les élèves sont sortis.', 'temps', '« dès que » veut dire « aussitôt que ».'],
      ['[[Lorsque nous sommes arrivés à la plage]], la mer était calme.', 'temps', '« lorsque » veut dire « quand ».'],
      ['Roxy se cache [[parce qu’elle entend un bruit]].', 'cause',
        'Pourquoi Roxy se cache-t-elle ? Parce qu’elle entend un bruit : c’est la cause.'],
      ['[[Puisque tu as fini tes devoirs]], tu peux jouer.', 'cause',
        '« puisque » donne la raison : tu peux jouer parce que tes devoirs sont finis.'],
      ['[[Comme il pleut]], nous restons à la maison.', 'cause',
        'En tête de phrase, « comme » veut dire ici « parce que ».'],
      ['Léa est contente [[parce qu’elle a eu une bonne note]].', 'cause',
        'Pourquoi Léa est-elle contente ? Parce qu’elle a eu une bonne note : c’est la cause.'],
      ['[[Comme Sélène était malade]], elle n’est pas venue.', 'cause',
        'En tête de phrase, « comme » veut dire ici « parce que ».'],
      ['Nous prenons nos parapluies [[puisque le ciel est gris]].', 'cause',
        '« puisque » donne la raison : le ciel gris explique les parapluies.'],
      ['Wanir a très faim [[parce qu’il a beaucoup couru]].', 'cause',
        'Pourquoi Wanir a-t-il faim ? Parce qu’il a beaucoup couru : c’est la cause.'],
      ['Le cyclone approche, [[si bien que l’école est fermée]].', 'consequence',
        '« si bien que » : l’école fermée est le résultat de l’arrivée du cyclone.'],
      ['Il faisait si chaud [[que ma glace a fondu]].', 'consequence',
        '« si… que » : la glace fondue est le résultat de la grande chaleur.'],
      ['Roxy a tellement couru [[qu’elle est épuisée]].', 'consequence',
        '« tellement… que » : la fatigue est le résultat de la course.'],
      ['Tom parlait fort, [[de sorte que tout le monde l’entendait]].', 'consequence',
        '« de sorte que » + indicatif (entendait) : c’est un résultat bien réel.'],
      ['Le gâteau était si bon [[qu’il n’en est pas resté une miette]].', 'consequence',
        '« si… que » : il ne reste rien, c’est le résultat d’un gâteau si bon.'],
      ['Mei s’est entraînée tous les jours, [[si bien qu’elle a gagné la course]].', 'consequence',
        '« si bien que » : la victoire est le résultat de l’entraînement.'],
      ['La musique était tellement forte [[que nous n’entendions plus rien]].', 'consequence',
        '« tellement… que » : ne plus rien entendre est le résultat de la musique trop forte.'],
      ['Papi parle fort [[pour que tout le monde l’entende]].', 'but',
        '« pour que » + subjonctif : Papi <b>veut</b> que tout le monde l’entende.'],
      ['Mamie cache les bonbons [[afin que nous ne les mangions pas tous]].', 'but',
        '« afin que » + subjonctif : c’est ce que Mamie <b>veut</b> obtenir.'],
      ['Je t’explique la règle [[pour que tu la comprennes]].', 'but',
        '« pour que » + subjonctif : c’est ce que je <b>veux</b> obtenir.'],
      ['Roxy creuse un terrier profond [[afin que ses petits soient à l’abri]].', 'but',
        '« afin que » + subjonctif : c’est ce que Roxy <b>veut</b> obtenir.'],
      ['Le professeur écrit en grand [[pour que tous les élèves puissent lire]].', 'but',
        '« pour que » + subjonctif : c’est ce que le professeur <b>veut</b> obtenir.'],
      ['Nous chuchotons [[afin que le bébé ne se réveille pas]].', 'but',
        '« afin que » + subjonctif : c’est ce que nous <b>voulons</b> obtenir.'],
      ['[[Si tu te dépêches]], tu attraperas le bus.', 'condition',
        '« si » + présent : tu attraperas le bus, à condition de te dépêcher.'],
      ['[[Si j’avais des ailes]], je volerais jusqu’aux nuages.', 'condition',
        '« si » + imparfait : une condition imaginaire.'],
      ['Nous irons au parc [[s’il fait beau]].', 'condition',
        '« s’ » (si) + présent : nous irons au parc, à condition qu’il fasse beau.'],
      ['[[Si Roxy trouve des mûres]], elle en rapportera à ses petits.', 'condition',
        '« si » + présent : Roxy rapportera des mûres, à condition d’en trouver.'],
      ['Tu progresseras [[si tu t’entraînes chaque jour]].', 'condition',
        '« si » + présent : tu progresseras, à condition de t’entraîner.'],
      ['[[S’il neigeait demain]], nous ferions un bonhomme de neige.', 'condition',
        '« s’ » (si) + imparfait : une condition imaginée pour demain.'],
    ],
    titreLecon: 'Les subordonnées circonstancielles',
    lecon: `
      <p>La subordonnée circonstancielle joue le rôle d’un <b>complément circonstanciel</b>.
        Sa conjonction indique la circonstance :</p>
      <table>
        <tr><th>circonstance</th><th>question</th><th>conjonctions</th></tr>
        <tr><td><b>temps</b></td><td>quand ?</td><td>quand, lorsque, dès que, avant que…</td></tr>
        <tr><td><b>cause</b></td><td>pourquoi ?</td><td>parce que, puisque, comme (en tête de phrase)</td></tr>
        <tr><td><b>conséquence</b></td><td>avec quel résultat ?</td><td>si bien que, de sorte que, si… que, tellement… que</td></tr>
        <tr><td><b>but</b></td><td>pour obtenir quoi ?</td><td>pour que, afin que</td></tr>
        <tr><td><b>condition</b></td><td>à quelle condition ?</td><td>si</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> ne confonds pas la cause et la conséquence !<br>
        <i>Roxy est épuisée <u>parce qu’elle a couru</u></i> : la course est la <b>cause</b>.<br>
        <i>Roxy a tellement couru <u>qu’elle est épuisée</u></i> : la fatigue est la <b>conséquence</b>.</div>
      <p>⚠️ Le but est un résultat <b>voulu</b>, pas encore atteint : son verbe est au subjonctif (<i>pour qu’il <b>puisse</b></i>).
        C’est pourquoi « de sorte que » + subjonctif exprime le but, mais « de sorte que » + indicatif, la conséquence.</p>
    `,
  });

  // ======================================================================
  // 5. Les formes de phrase
  // ======================================================================
  // Chaque phrase n'a qu'UNE forme particulière : tout le reste est affirmatif, actif, neutre et personnel.
  // Pas de « ne… que » (restriction), pas d'état ambigu comme « la porte est fermée ».
  ajouterClassement({
    id: '4e-grammaire-formes-phrase',
    consigne: 'Quelle est la forme particulière de cette phrase ?',
    categories: {
      negative: {
        nom: 'négative',
        regle: 'La phrase <b>négative</b> contient une négation en deux parties : ne… pas, ne… jamais, ne… plus, '
          + 'ne… rien, ne… aucun(e), personne ne…',
      },
      passive: {
        nom: 'passive',
        regle: 'À la forme <b>passive</b>, le sujet <b>subit</b> l’action : être + participe passé, '
          + 'souvent avec un complément d’agent (par…).',
      },
      emphatique: {
        nom: 'emphatique',
        regle: 'La forme <b>emphatique</b> met un mot en valeur : avec « c’est… qui », « c’est… que », '
          + 'ou en le détachant en tête de phrase.',
      },
      impersonnelle: {
        nom: 'impersonnelle',
        regle: 'À la forme <b>impersonnelle</b>, le pronom « il » ne représente rien ni personne : il pleut, il faut, il y a…',
      },
    },
    banque: [
      ['Je ne viens pas ce soir.', 'negative', 'La négation : « ne… pas ».'],
      ['Roxy ne mange jamais de champignons.', 'negative', 'La négation : « ne… jamais ».'],
      ['Tom n’a rien entendu.', 'negative', 'La négation : « ne… rien » (« n’ » devant une voyelle).'],
      ['Personne n’a vu le hibou.', 'negative', 'La négation : « personne ne… ».'],
      ['Maëva n’aime plus les épinards.', 'negative', 'La négation : « ne… plus ».'],
      ['Sami n’a aucune envie de dormir.', 'negative', 'La négation : « ne… aucune ».'],
      ['Ce n’est pas une bonne idée.', 'negative',
        'La négation : « ne… pas ». Il n’y a ni « qui » ni « que » après « c’est » : la phrase n’est pas emphatique.'],
      ['Il n’a jamais vu la neige.', 'negative',
        'La négation : « ne… jamais ». Ici, « il » désigne quelqu’un (Papi n’a jamais vu la neige) : '
          + 'la phrase n’est pas impersonnelle.'],
      ['Sélène n’est pas encore rentrée.', 'negative',
        'La négation : « ne… pas ». « est rentrée » est le passé composé du verbe « rentrer » : ce n’est pas un passif.'],
      ['Le gâteau a été mangé par Roxy.', 'passive',
        'Le sujet « le gâteau » subit l’action ; « par Roxy » est le complément d’agent.'],
      ['La cabane a été construite par Papi.', 'passive',
        'Le sujet « la cabane » subit l’action ; « par Papi » est le complément d’agent.'],
      ['Les élèves sont accompagnés par leur professeur.', 'passive',
        'Le sujet « les élèves » subit l’action ; « par leur professeur » est le complément d’agent.'],
      ['Cette fable a été écrite par La Fontaine.', 'passive',
        'Le sujet « cette fable » subit l’action ; « par La Fontaine » est le complément d’agent.'],
      ['La souris est poursuivie par le chat.', 'passive',
        'Le sujet « la souris » subit l’action ; « par le chat » est le complément d’agent.'],
      ['Les lettres sont distribuées par le facteur.', 'passive',
        'Le sujet « les lettres » subit l’action ; « par le facteur » est le complément d’agent.'],
      ['Tom a été félicité par la directrice.', 'passive',
        'Le sujet « Tom » subit l’action ; « par la directrice » est le complément d’agent.'],
      ['Il a été choisi par l’entraîneur.', 'passive',
        'Ici, « il » désigne quelqu’un (Tom a été choisi) : la phrase n’est pas impersonnelle. '
          + 'Le sujet « il » subit l’action ; « par l’entraîneur » est le complément d’agent.'],
      ['Le trésor fut découvert par deux enfants.', 'passive',
        'Le sujet « le trésor » subit l’action ; « par deux enfants » est le complément d’agent.'],
      ['C’est Tom qui a gagné la course.', 'emphatique', '« C’est… qui » met « Tom » en valeur.'],
      ['C’est demain que nous partons en vacances.', 'emphatique', '« C’est… que » met « demain » en valeur.'],
      ['C’est à Roxy que je pense.', 'emphatique', '« C’est… que » met « à Roxy » en valeur.'],
      ['C’est ce livre que je préfère.', 'emphatique', '« C’est… que » met « ce livre » en valeur.'],
      ['Ce sont les enfants qui ont décoré le sapin.', 'emphatique', '« Ce sont… qui » met « les enfants » en valeur.'],
      ['C’est dans la forêt que Roxy se cache.', 'emphatique', '« C’est… que » met « dans la forêt » en valeur.'],
      ['Ce gâteau, je l’adore !', 'emphatique',
        '« Ce gâteau » est détaché en tête de phrase, puis repris par « l’ » : il est mis en valeur.'],
      ['Les énigmes, Sami les adore.', 'emphatique',
        '« Les énigmes » sont détachées en tête de phrase, puis reprises par « les » : elles sont mises en valeur.'],
      ['Lui, il adore la neige.', 'emphatique',
        '« Lui » est détaché en tête de phrase, puis repris par « il », qui désigne quelqu’un : il est mis en valeur.'],
      ['Il pleut depuis ce matin.', 'impersonnelle', '« Il » ne représente personne : on ne peut pas demander « qui pleut ? ».'],
      ['Il faut partir tout de suite.', 'impersonnelle',
        '« Il » ne représente rien ni personne : on ne peut pas dire « elle faut » ni « Tom faut ».'],
      ['Il fait très chaud aujourd’hui.', 'impersonnelle', '« Il » ne représente personne : on ne peut pas demander « qui fait chaud ? ».'],
      ['Il reste une part de gâteau.', 'impersonnelle',
        '« Il » ne représente rien : ce qui reste, c’est « une part de gâteau ».'],
      ['Il est arrivé une lettre pour toi.', 'impersonnelle',
        '« Il » ne représente rien : c’est la lettre qui est arrivée. Et « est arrivé » n’est pas un passif : '
          + 'c’est le passé composé du verbe « arriver ».'],
      ['Il y a un écureuil dans le jardin.', 'impersonnelle', '« Il y a » : ce « il » ne représente rien ni personne.'],
      ['Il est important de bien dormir.', 'impersonnelle',
        '« Il » ne représente rien : ce qui est important, c’est « de bien dormir ».'],
      ['Il manque deux élèves ce matin.', 'impersonnelle',
        '« Il » ne représente rien : ceux qui manquent, ce sont « deux élèves ».'],
    ],
    titreLecon: 'Les formes de phrase',
    lecon: `
      <p>Une phrase peut prendre plusieurs <b>formes</b>. Elles vont par deux :</p>
      <table>
        <tr><th>forme de base</th><th>forme particulière</th></tr>
        <tr><td>affirmative : <i>Je viens.</i></td><td><b>négative</b> : <i>Je <b>ne</b> viens <b>pas</b>.</i></td></tr>
        <tr><td>active : <i>Roxy a mangé le gâteau.</i></td><td><b>passive</b> : <i>Le gâteau <b>a été mangé</b> par Roxy.</i></td></tr>
        <tr><td>neutre : <i>Tom a gagné.</i></td><td><b>emphatique</b> : <i><b>C’est</b> Tom <b>qui</b> a gagné.</i></td></tr>
        <tr><td>personnelle : <i>Roxy dort.</i></td><td><b>impersonnelle</b> : <i><b>Il</b> pleut. <b>Il</b> faut partir.</i></td></tr>
      </table>
      <p>Une phrase peut cumuler plusieurs formes (<i>Ce n’est pas Tom qui a gagné</i> : négative et emphatique).
        Dans cet exercice, chaque phrase n’en a qu’une.</p>
      <p>La forme emphatique peut aussi <b>détacher</b> un mot en tête de phrase : <i>Ce gâteau, je l’adore !</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> attention aux pièges !<br>
        <i>Il est parti</i> n’est pas passif : c’est le passé composé de « partir », et « il » désigne quelqu’un.<br>
        <i>C’est un beau jour</i> n’est pas emphatique : il faut « c’est… <b>qui</b> » ou « c’est… <b>que</b> ».<br>
        Pour l’impersonnel, essaie de remplacer « il » par « elle » ou par un nom : c’est impossible !</div>
    `,
  });

  // ======================================================================
  // 6. Les modes du verbe
  // ======================================================================
  // Aucun conditionnel (la terminologie de 2020 le range parmi les temps de l'indicatif),
  // pas de gérondif, et des formes que la phrase rend sans aucun doute possible.
  ajouterClassement({
    id: '4e-grammaire-modes',
    consigne: 'À quel mode est le verbe souligné ?',
    nombreChoix: 4,
    // Les pièges « jumeaux », toujours proposés avec la bonne réponse
    toujoursProposer: cle => ({
      indicatif: ['subjonctif', 'imperatif'], subjonctif: ['indicatif'], imperatif: ['indicatif'],
      infinitif: ['participe'], participe: ['infinitif'],
    })[cle],
    categories: {
      indicatif: {
        nom: 'indicatif',
        regle: 'L’<b>indicatif</b> présente un fait comme <b>réel</b> (présent, imparfait, futur, passé composé…). '
          + 'Le verbe a un sujet.',
      },
      subjonctif: {
        nom: 'subjonctif',
        regle: 'Le <b>subjonctif</b> exprime un souhait, une obligation, un doute… Il suit souvent « que » : '
          + '<i>il faut que tu viennes</i>.',
      },
      imperatif: {
        nom: 'impératif',
        regle: 'L’<b>impératif</b> donne un ordre ou un conseil. Il n’a <b>pas de sujet</b> exprimé : <i>Range ta chambre !</i>',
      },
      infinitif: {
        nom: 'infinitif',
        regle: 'L’<b>infinitif</b> est la forme du verbe <b>non conjuguée</b> : chanter, finir, prendre, avoir mangé…',
      },
      participe: {
        nom: 'participe',
        regle: 'Le <b>participe</b> est une forme non conjuguée : participe présent en -ant (<i>voyant</i>), '
          + 'participe passé employé sans auxiliaire (<i>arrivé</i>).',
      },
    },
    banque: [
      ['Roxy [[dort]] au fond de son terrier.', 'indicatif',
        'Le verbe a un sujet, « Roxy », et présente un fait réel : présent de l’indicatif.'],
      ['Hier, nous [[sommes allés]] au cinéma.', 'indicatif',
        'Le verbe a un sujet, « nous », et raconte un fait réel : passé composé de l’indicatif.'],
      ['Je sais que tu [[viens]] ce soir.', 'indicatif',
        'Après « je sais que », le fait est sûr : indicatif. (Au subjonctif, on dirait « que tu viennes ».)'],
      ['Demain, Kalia [[prendra]] l’avion pour Lifou.', 'indicatif',
        'Le verbe a un sujet, « Kalia », et annonce un fait : futur de l’indicatif.'],
      ['Autrefois, Papi [[habitait]] à la campagne.', 'indicatif',
        'Le verbe a un sujet, « Papi », et présente un fait réel : imparfait de l’indicatif.'],
      ['Le renard [[sauta]] par-dessus la barrière.', 'indicatif',
        'Le verbe a un sujet, « le renard », et raconte un fait : passé simple de l’indicatif.'],
      ['Il faut que tu [[viennes]] avec nous.', 'subjonctif', '« Il faut que » exprime une obligation : subjonctif.'],
      ['Je veux que vous [[soyez]] à l’heure.', 'subjonctif', '« Je veux que » exprime une volonté : subjonctif.'],
      ['Bien qu’il [[fasse]] froid, nous sortons.', 'subjonctif', '« Bien que » est toujours suivi du subjonctif.'],
      ['Papi range l’atelier pour que nous [[puissions]] jouer.', 'subjonctif',
        '« Pour que » (le but) est toujours suivi du subjonctif.'],
      ['Mamie souhaite que j’[[aille]] la voir.', 'subjonctif', '« Mamie souhaite que » exprime un souhait : subjonctif.'],
      ['Je doute que Tom [[sache]] la réponse.', 'subjonctif', '« Je doute que » exprime un doute : subjonctif.'],
      ['Il est important que tu [[dormes]] bien.', 'subjonctif', '« Il est important que » exprime une nécessité : subjonctif.'],
      ['[[Range]] ta chambre, s’il te plaît.', 'imperatif', 'Pas de sujet exprimé, et c’est une demande : impératif.'],
      ['[[Venez]] voir le coucher du soleil !', 'imperatif', 'Pas de sujet « vous » : c’est une invitation, à l’impératif.'],
      ['[[Prenons]] le chemin de la rivière.', 'imperatif',
        'Pas de sujet « nous » : c’est l’impératif, à la 1<sup>re</sup> personne du pluriel.'],
      ['Ne [[touchez]] pas à ce champignon !', 'imperatif', 'Pas de sujet « vous » : c’est un conseil à l’impératif.'],
      ['[[Sois]] prudente sur la route.', 'imperatif', 'Ni sujet ni « que » : c’est l’impératif du verbe être.'],
      ['[[Écoute]] bien la consigne.', 'imperatif', 'Pas de sujet exprimé, et c’est un ordre : impératif.'],
      ['Roxy aime [[courir]] dans la neige.', 'infinitif', 'Le verbe n’est pas conjugué : il complète le verbe « aime ».'],
      ['Il faut [[rentrer]] avant la nuit.', 'infinitif', 'Après « il faut » sans « que », le verbe reste à l’infinitif.'],
      ['Avant de [[dormir]], Wakana lit une histoire.', 'infinitif', 'Après la préposition « de », le verbe est à l’infinitif.'],
      ['Nous allons [[visiter]] le château.', 'infinitif',
        'C’est « allons » qui est conjugué : le verbe souligné reste à l’infinitif.'],
      ['Teva apprend à [[nager]].', 'infinitif', 'Après la préposition « à », le verbe est à l’infinitif.'],
      ['Après [[avoir mangé]], nous irons nous promener.', 'infinitif',
        '« avoir mangé » est l’infinitif passé : avoir + participe passé, sans sujet.'],
      ['J’entends les oiseaux [[chanter]].', 'infinitif', 'Le verbe n’est pas conjugué : il complète « j’entends ».'],
      ['[[Voyant]] la pluie, Tom a pris son parapluie.', 'participe',
        'Forme en -ant, sans « en » devant : participe présent.'],
      ['Roxy, [[entendant]] un bruit, se cache derrière un arbre.', 'participe',
        'Forme en -ant, sans « en » devant : participe présent.'],
      ['Les élèves [[sortant]] de l’école courent vers le parc.', 'participe',
        'Forme en -ant, sans « en » devant : participe présent.'],
      ['J’ai aperçu Zoé [[traversant]] la cour.', 'participe',
        'Forme en -ant, sans « en » devant : participe présent.'],
      ['Le gâteau [[préparé]] par Mamie sent la vanille.', 'participe',
        'Participe passé employé seul, sans auxiliaire : ce n’est pas un temps composé.'],
      ['[[Épuisée]] par la course, Léa s’assoit dans l’herbe.', 'participe',
        'Participe passé employé seul, sans auxiliaire : ce n’est pas un temps composé.'],
      ['[[Arrivés]] au sommet, les randonneurs admirent la vue.', 'participe',
        'Participe passé employé seul, sans auxiliaire : ce n’est pas un temps composé.'],
    ],
    titreLecon: 'Les modes du verbe',
    lecon: `
      <p>Le <b>mode</b> indique la manière dont on présente l’action.</p>
      <h4>Les modes personnels : le verbe change selon la personne</h4>
      <table>
        <tr><th>mode</th><th>à quoi il sert</th><th>exemple</th></tr>
        <tr><td><b>indicatif</b></td><td>un fait réel</td><td>Roxy <b>dort</b>. Nous <b>sommes allés</b> au parc.</td></tr>
        <tr><td><b>subjonctif</b></td><td>un souhait, une obligation, un doute (souvent après « que »)</td><td>Il faut que tu <b>viennes</b>.</td></tr>
        <tr><td><b>impératif</b></td><td>un ordre, un conseil, sans sujet</td><td><b>Range</b> ta chambre !</td></tr>
      </table>
      <h4>Les modes non personnels : le verbe ne change pas selon la personne</h4>
      <p><b>infinitif</b> : <i>chanter, finir, prendre, avoir mangé</i><br>
        <b>participe</b> : <i>chantant</i> (présent), <i>chanté, pris</i> (passé, employé sans auxiliaire)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cherche les indices !<br>
        « il faut que », « je veux que », « pour que », « bien que »… → <b>subjonctif</b>.<br>
        Pas de sujet, un ordre → <b>impératif</b>.<br>
        Pas conjugué, après un verbe ou une préposition (de, à, pour…) → <b>infinitif</b>.<br>
        Une forme en -ant sans « en » → <b>participe présent</b> (avec « en », c’est le gérondif : <i>en chantant</i>).</div>
      <p>⚠️ On a longtemps appelé le conditionnel (<i>je chanterais</i>) un mode : aujourd’hui,
        on le range parmi les <b>temps de l’indicatif</b>.</p>
    `,
  });
})();
