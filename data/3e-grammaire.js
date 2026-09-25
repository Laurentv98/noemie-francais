// Renard Malin — Grammaire, niveau 3e : les 6 étapes de la Colline de la Grammaire (de nuit)
//
// Les phrases sont écrites à la main. Le mot ou le groupe à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement } = RM.phrases;

  // ======================================================================
  // 1. Les classes de mots : révision
  // ======================================================================
  ajouterClassement({
    id: '3e-grammaire-classes-revision',
    consigne: 'Quelle est la classe grammaticale de ce qui est souligné ?',
    nombreChoix: 4,
    // Pour un déterminant, on ne propose pas « adjectif » : les anciennes grammaires disaient « adjectif possessif, indéfini… »
    choixPossibles: cle => ['nom', 'verbe', 'adjectif', 'determinant', 'pronom', 'adverbe', 'preposition', 'coordination',
      'subordination'].filter(c => !(cle === 'determinant' && c === 'adjectif')),
    // Les pièges « jumeaux », toujours proposés (s'il y en a plus de 3, le moteur en tire 3 au hasard)
    toujoursProposer: cle => ({
      nom: ['verbe', 'adjectif'],
      verbe: ['nom', 'adjectif'],
      adjectif: ['nom', 'adverbe'],
      determinant: ['pronom'],
      pronom: ['determinant', 'adverbe', 'preposition', 'subordination'],
      adverbe: ['pronom', 'subordination'],
      preposition: ['pronom', 'subordination'],
      coordination: ['adverbe', 'subordination'],
      subordination: ['pronom', 'adverbe', 'preposition', 'coordination'],
    })[cle],
    categories: {
      nom: {
        nom: 'nom',
        regle: 'Un <b>nom</b> désigne une personne, un animal, une chose ou une idée. '
          + 'Il est en général précédé d’un déterminant (le, un, ce…).',
      },
      verbe: {
        nom: 'verbe',
        regle: 'Un <b>verbe</b> exprime une action ou un état. Il se conjugue : il change selon la personne et le temps.',
      },
      adjectif: {
        nom: 'adjectif',
        regle: 'Un <b>adjectif</b> précise une qualité d’un nom (ou d’un pronom). En général, il s’accorde avec lui.',
      },
      determinant: {
        nom: 'déterminant',
        regle: 'Un <b>déterminant</b> se place devant un nom et forme avec lui un groupe nominal : '
          + 'le, un, ce, mon, leur, chaque, quelques…',
      },
      pronom: {
        nom: 'pronom',
        regle: 'Un <b>pronom</b> remplace un nom ou un groupe nominal, ou désigne une personne : '
          + 'il, le, leur (devant un verbe), en, qui, que, dont…',
      },
      adverbe: {
        nom: 'adverbe',
        regle: 'Un <b>adverbe</b> modifie le sens d’un verbe, d’un adjectif, d’un autre adverbe ou de la phrase : '
          + 'très, souvent, hier, jamais, si (= tellement)…',
      },
      preposition: {
        nom: 'préposition',
        regle: 'Une <b>préposition</b> est un mot invariable qui introduit un complément : '
          + 'à, de, en, pour, sans, chez, malgré, pendant…',
      },
      coordination: {
        nom: 'conjonction de coordination',
        regle: 'Une <b>conjonction de coordination</b> relie deux mots, deux groupes ou deux propositions de même rang : '
          + 'mais, ou, et, or, ni, car.',
      },
      subordination: {
        nom: 'conjonction de subordination',
        regle: 'Une <b>conjonction de subordination</b> introduit une proposition subordonnée : '
          + 'que, quand, si, lorsque, puisque, parce que…',
      },
    },
    // [phrase, classe, remarque de Roxy pour les mots qui piègent]
    banque: [
      ['Le [[dîner]] sera prêt dans une heure.', 'nom', 'Ici, « dîner » est précédé du déterminant « le » : c’est un nom, pas un verbe.'],
      ['Ce [[devoir]] de français est facile.', 'nom', 'Précédé du déterminant « ce », « devoir » est ici un nom.'],
      ['Les [[rires]] des enfants résonnent dans la cour.', 'nom'],
      ['Roxy admire la [[beauté]] du ciel étoilé.', 'nom'],
      ['Chaque soir, la chouette [[chasse]] dans les bois.', 'verbe', 'Ici, « chasse » est conjugué : son sujet est « la chouette ». (Dans « la chasse », ce serait un nom.)'],
      ['Les étoiles [[brillent]] au-dessus de la colline.', 'verbe'],
      ['Il est temps de [[rentrer]] au terrier.', 'verbe', 'À l’infinitif, « rentrer » reste un verbe.'],
      ['Nous [[finirons]] ce puzzle demain.', 'verbe'],
      ['Un [[vieux]] hibou vit dans ce chêne.', 'adjectif'],
      ['Kylian a lu un roman [[passionnant]].', 'adjectif', 'Il s’accorde (une histoire passionnante) : c’est un adjectif, pas un verbe.'],
      ['Inès porte une écharpe [[violette]].', 'adjectif', 'Ici, « violette » décrit l’écharpe et s’accorde avec elle : c’est un adjectif de couleur. (Dans « une violette », ce serait le nom d’une fleur.)'],
      ['Ce soir, la mer est [[calme]].', 'adjectif', 'Sa fonction est attribut du sujet, mais sa classe est bien adjectif : il donne une qualité de la mer.'],
      ['Les renardeaux jouent devant [[leur]] terrier.', 'determinant', '« leur » est devant le nom « terrier » : c’est un déterminant possessif (au pluriel : leurs terriers).'],
      ['[[Chaque]] élève prépare un exposé.', 'determinant'],
      ['[[Ces]] étoiles forment la Grande Ourse.', 'determinant'],
      ['Tu as [[quelques]] minutes pour répondre.', 'determinant'],
      ['Je [[leur]] ai prêté mes jumelles.', 'pronom', '« leur » est devant le verbe et veut dire « à eux » : c’est un pronom personnel. Il ne prend jamais de s.'],
      ['Le livre [[que]] je lis parle des loups.', 'pronom', '« que » reprend le nom « livre » (je lis le livre) : c’est un pronom relatif.'],
      ['La cabane [[où]] nous jouions a été réparée.', 'pronom', '« où » reprend le nom « cabane » (nous jouions dans la cabane) : c’est un pronom relatif.'],
      ['[[Tout]] est prêt pour la fête.', 'pronom', 'Ici, « tout » est seul, sans nom, et il est sujet du verbe « est » : c’est un pronom (= toutes les choses).'],
      ['Ce gâteau ? Mamie [[le]] prépare chaque dimanche.', 'pronom', '« le » est devant un verbe et remplace « ce gâteau » : c’est un pronom personnel.'],
      ['Des mûres ? Zoé [[en]] a cueilli un panier.', 'pronom', '« en » est devant un verbe et remplace « des mûres » : c’est un pronom.'],
      ['La lune est [[si]] belle ce soir !', 'adverbe', 'Ici, « si » veut dire « tellement » et modifie l’adjectif « belle » : c’est un adverbe.'],
      ['Il parle [[tout]] doucement au bébé.', 'adverbe', 'Ici, « tout » veut dire « très » et modifie l’adverbe « doucement » : c’est un adverbe.'],
      ['[[Quand]] pars-tu en vacances ?', 'adverbe', 'Ici, « quand » pose une question sur le temps : c’est un adverbe interrogatif.'],
      ['[[Où]] as-tu caché la clé ?', 'adverbe', 'Ici, « où » pose une question sur le lieu : c’est un adverbe interrogatif (il ne reprend aucun nom).'],
      ['Hugo ne mange [[jamais]] de champignons.', 'adverbe', 'Avec « ne », « jamais » forme la négation : c’est un adverbe.'],
      ['Nous sortirons [[malgré]] la pluie.', 'preposition'],
      ['Les hirondelles partent [[en]] automne.', 'preposition', 'Ici, « en » introduit le nom « automne » : c’est une préposition. (Dans « j’en veux », ce serait un pronom.)'],
      ['Émeline est partie [[sans]] son parapluie.', 'preposition'],
      ['Roxy dort [[pendant]] la journée.', 'preposition'],
      ['Il pleut, [[mais]] nous sortirons quand même.', 'coordination'],
      ['Veux-tu du thé [[ou]] du chocolat ?', 'coordination'],
      ['Je reste à la maison, [[car]] je suis enrhumé.', 'coordination', '« car » exprime la cause, comme « parce que », mais c’est une conjonction de coordination.'],
      ['Roxy voulait sortir ; [[or]] la porte était fermée.', 'coordination'],
      ['Je pense [[que]] tu as raison.', 'subordination', 'Ici, « que » ne reprend aucun nom : il relie « tu as raison » au verbe « pense ». C’est une conjonction.'],
      ['[[Si]] tu viens demain, nous irons à la rivière.', 'subordination', 'Ici, « si » introduit une condition : c’est une conjonction de subordination.'],
      ['Nous rentrons [[parce que]] le vent se lève.', 'subordination', '« parce que » est une locution : ces deux mots forment une seule conjonction de subordination.'],
      ['[[Quand]] la nuit tombe, les chouettes s’éveillent.', 'subordination', 'Ici, « quand » introduit une proposition (la nuit tombe) : c’est une conjonction de subordination.'],
      ['[[Puisque]] tu es là, aide-moi à mettre la table.', 'subordination'],
    ],
    titreLecon: 'Les classes de mots',
    lecon: `
      <p>Chaque mot appartient à une <b>classe grammaticale</b> (on dit aussi sa <b>nature</b>).</p>
      <table>
        <tr><th>mots variables</th><th>mots invariables</th></tr>
        <tr><td><b>nom</b> : dîner, beauté</td><td><b>adverbe</b> : très, hier, jamais</td></tr>
        <tr><td><b>déterminant</b> : le, ce, leur, chaque</td><td><b>préposition</b> : à, en, sans, malgré</td></tr>
        <tr><td><b>adjectif</b> : vieux, calme</td><td><b>conjonction de coordination</b> : mais, ou, et, or, ni, car</td></tr>
        <tr><td><b>pronom</b> : il/elle, le/la/les, lequel/laquelle</td><td><b>conjonction de subordination</b> : que, quand, si, parce que</td></tr>
        <tr><td><b>verbe</b> : chasser, partir</td><td></td></tr>
      </table>
      <h4>Les mots caméléons</h4>
      <p>• <b>leur</b>, <b>le</b> : devant un nom → déterminant (<i>leur terrier</i>) ; devant un verbe → pronom (<i>je leur parle</i>).<br>
         • <b>que</b> : il reprend un nom → pronom relatif (<i>le livre que je lis</i>) ; il ne reprend rien → conjonction (<i>je pense que…</i>) ;
           dans une question (<i>Que veux-tu ?</i>) → pronom interrogatif.<br>
         • <b>si</b> : une condition → conjonction (<i>si tu viens</i>) ; « tellement » → adverbe (<i>si belle</i>).<br>
         • <b>quand</b>, <b>où</b> : dans une question → adverbe (<i>Où vas-tu ?</i>) ;
           « où » qui reprend un nom → pronom relatif (<i>la cabane où nous jouions</i>) ;
           « quand » qui introduit une proposition → conjonction de subordination (<i>Quand la nuit tombe, …</i>).<br>
         • <b>en</b> : devant un nom ou dans un gérondif (<i>en automne, en marchant</i>) → préposition ;
           devant un verbe conjugué, quand il remplace un groupe (<i>j’en veux</i>) → pronom.<br>
         • <b>tout</b> : seul → pronom (<i>Tout est prêt.</i>) ; « très » → adverbe (<i>tout doucement</i>).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> la classe d’un mot dépend de son <b>emploi</b> : regarde toujours le mot
        <b>dans sa phrase</b> et demande-toi ce qu’il accompagne ou ce qu’il remplace.</div>
      <p>⚠️ « donc » est rangé parmi les conjonctions de coordination dans certains manuels, parmi les adverbes dans d’autres.</p>
    `,
  });

  // ======================================================================
  // 2. Les fonctions : révision
  // ======================================================================
  ajouterClassement({
    id: '3e-grammaire-fonctions-revision',
    consigne: 'Quelle est la fonction de ce qui est souligné ?',
    nombreChoix: 4,
    // Les pièges « jumeaux », toujours proposés ; le dernier bouton est tiré au hasard
    toujoursProposer: cle => ({
      sujet: ['cod'],
      cod: ['sujet', 'coi'],
      coi: ['cod', 'circonstanciel'],
      attribut: ['cod', 'epithete'],
      circonstanciel: ['coi', 'agent'],
      agent: ['coi', 'circonstanciel'],
      cdn: ['coi', 'apposition'],
      epithete: ['attribut', 'apposition'],
      apposition: ['sujet', 'cdn'],
    })[cle],
    categories: {
      sujet: {
        nom: 'sujet',
        regle: 'Le <b>sujet</b> indique de qui ou de quoi l’on parle. On le trouve avec « c’est… qui ». Le verbe s’accorde avec lui.',
      },
      cod: {
        nom: 'COD',
        regle: 'Le <b>COD</b> complète le verbe <b>sans préposition</b> : on le trouve avec « qui ? » ou « quoi ? » après le verbe. '
          + 'En général, on ne peut pas le déplacer.',
      },
      coi: {
        nom: 'COI',
        regle: 'Le <b>COI</b> complète le verbe <b>avec une préposition</b> (à, de) : on le trouve avec « à qui ? », « à quoi ? », '
          + '« de qui ? », « de quoi ? ». On ne peut pas le déplacer.',
      },
      attribut: {
        nom: 'attribut du sujet',
        regle: 'L’<b>attribut du sujet</b> donne une caractéristique du sujet, grâce à un verbe d’état : '
          + 'être, paraître, sembler, devenir, rester…',
      },
      circonstanciel: {
        nom: 'complément circonstanciel',
        regle: 'Le <b>complément circonstanciel</b> précise les circonstances de l’action (lieu, temps, manière, cause…). '
          + 'On peut en général le déplacer ou le supprimer.',
      },
      agent: {
        nom: 'complément d’agent',
        regle: 'Le <b>complément d’agent</b> se trouve dans une phrase à la voix passive : il indique qui fait l’action. '
          + 'Il est introduit par « par » (parfois « de »).',
      },
      cdn: {
        nom: 'complément du nom',
        regle: 'Le <b>complément du nom</b> précise un nom ; il est relié à ce nom par une préposition (de, à, en…).',
      },
      epithete: {
        nom: 'épithète',
        regle: 'L’<b>épithète</b> est un adjectif placé juste à côté du nom qu’il qualifie, sans verbe entre les deux.',
      },
      apposition: {
        nom: 'apposition',
        regle: 'L’<b>apposition</b> est un groupe nominal détaché par une ou des virgules, '
          + 'qui désigne la même chose que le nom qu’il complète.',
      },
    },
    // [phrase, fonction, remarque de Roxy pour les groupes qui piègent]
    banque: [
      ['Dans la clairière dansaient [[les lucioles]].', 'sujet', 'C’est « les lucioles » qui dansaient : le sujet est placé après le verbe (sujet inversé).'],
      ['[[Le vieux hibou de la colline]] ouvre un œil.', 'sujet'],
      ['Chaque soir, [[mes grands-parents]] regardent les étoiles.', 'sujet'],
      ['[[Nager]] me détend après les cours.', 'sujet', 'Un verbe à l’infinitif peut être sujet : c’est « nager » qui me détend.'],
      ['Roxy observe [[les étoiles filantes]].', 'cod'],
      ['Ces jumelles ? Papi [[les]] a rangées dans le tiroir.', 'cod', '« les » remplace « ces jumelles » : Papi a rangé quoi ? les jumelles. C’est pour cela que « rangées » s’accorde.'],
      ['Au marché, Mamie achète [[des fraises]] pour le dessert.', 'cod'],
      ['Inès a écrit [[une longue lettre]] à sa cousine.', 'cod', 'Inès a écrit quoi ? une longue lettre, sans préposition : c’est le COD.'],
      ['Sione ressemble beaucoup [[à son grand frère]].', 'coi', 'On ressemble <b>à</b> quelqu’un : le groupe est construit avec une préposition, c’est le COI.'],
      ['Sami pense souvent [[à son ancienne école]].', 'coi', 'On pense <b>à</b> quelque chose : c’est le COI du verbe « penser ».'],
      ['Le chiot obéit [[à Zoé]].', 'coi'],
      ['Tom [[leur]] téléphone chaque dimanche.', 'coi', '« leur » veut dire « à eux » : on téléphone <b>à</b> quelqu’un. C’est le COI.'],
      ['Tu te souviens [[de cette promenade]] ?', 'coi', 'On se souvient <b>de</b> quelque chose : c’est le COI du verbe « se souvenir ».'],
      ['Ce sentier paraît [[interminable]].', 'attribut'],
      ['Plus tard, Wakana deviendra [[vétérinaire]].', 'attribut', 'Un nom peut aussi être attribut : « devenir » est un verbe d’état.'],
      ['Roxy est [[la plus rusée de la forêt]].', 'attribut'],
      ['Ce soir, la mer semble [[calme]].', 'attribut', 'Le verbe d’état « semble » relie l’adjectif au sujet : c’est un attribut (dans « une mer calme », ce serait une épithète).'],
      ['Le chat est sorti [[par la fenêtre]].', 'circonstanciel', '« est sorti » n’est pas un passif : c’est le passé composé de « sortir ». « par la fenêtre » indique le lieu.'],
      ['[[Au lever du soleil]], les oiseaux chantent.', 'circonstanciel'],
      ['Hugo a lu ce roman [[en deux jours]].', 'circonstanciel'],
      ['Nous sommes restés à l’intérieur [[à cause de l’orage]].', 'circonstanciel'],
      ['Le goûter a été préparé [[par Papi]].', 'agent', 'La phrase est au passif : c’est Papi qui a préparé le goûter.'],
      ['La forêt est éclairée [[par la pleine lune]].', 'agent', 'La phrase est au passif : c’est la pleine lune qui éclaire la forêt.'],
      ['Ce professeur est aimé [[de tous ses élèves]].', 'agent', 'La phrase est au passif : ce sont ses élèves qui aiment ce professeur. Ici, l’agent est introduit par « de ».'],
      ['Les copies seront corrigées [[par le professeur principal]].', 'agent'],
      ['J’ai trouvé l’entrée [[du terrier]].', 'cdn'],
      ['Le chant [[des baleines]] est mystérieux.', 'cdn'],
      ['Le bruit [[de la pluie]] m’endort.', 'cdn'],
      ['Zoé porte un pull [[en laine]].', 'cdn'],
      ['Une [[petite]] chouette nous observe.', 'epithete'],
      ['Nous avons marché par une nuit [[calme]].', 'epithete', 'L’adjectif est collé au nom « nuit », sans verbe entre les deux : c’est une épithète.'],
      ['Les feuilles [[mortes]] craquent sous nos pas.', 'epithete'],
      ['Roxy a un pelage [[roux]].', 'epithete'],
      ['Roxy, [[la renarde de la colline]], connaît tous les sentiers.', 'apposition', 'Ce groupe nominal est entre virgules et désigne Roxy elle-même : c’est une apposition.'],
      ['[[Grand amateur de livres]], Papi lit chaque soir.', 'apposition', 'Ce groupe nominal, détaché par une virgule, désigne Papi lui-même : c’est une apposition.'],
      ['Mon oncle, [[un marin breton]], connaît toutes les étoiles.', 'apposition'],
      ['Nous avons rencontré Wanir, [[le nouveau voisin]].', 'apposition', 'Wanir et « le nouveau voisin » désignent la même personne : c’est une apposition.'],
    ],
    titreLecon: 'Les fonctions',
    lecon: `
      <p>La <b>fonction</b> d’un mot ou d’un groupe, c’est son <b>rôle</b> dans la phrase.</p>
      <table>
        <tr><th>fonction</th><th>comment la trouver</th><th>exemple</th></tr>
        <tr><td><b>sujet</b></td><td>c’est… qui</td><td><u>Roxy</u> chasse.</td></tr>
        <tr><td><b>COD</b></td><td>verbe + qui ? quoi ?</td><td>Roxy observe <u>la lune</u>.</td></tr>
        <tr><td><b>COI</b></td><td>verbe + à qui ? de quoi ?…</td><td>Roxy pense <u>à son terrier</u>.</td></tr>
        <tr><td><b>attribut du sujet</b></td><td>après être, sembler, devenir…</td><td>Roxy est <u>rusée</u>.</td></tr>
        <tr><td><b>complément circonstanciel</b></td><td>où ? quand ? comment ? pourquoi ?</td><td><u>La nuit</u>, Roxy chasse.</td></tr>
        <tr><td><b>complément d’agent</b></td><td>phrase passive : qui fait l’action ?</td><td>La souris est vue <u>par Roxy</u>.</td></tr>
        <tr><td><b>complément du nom</b></td><td>nom + préposition + groupe</td><td>le terrier <u>de Roxy</u></td></tr>
        <tr><td><b>épithète</b></td><td>adjectif collé au nom</td><td>une renarde <u>rousse</u></td></tr>
        <tr><td><b>apposition</b></td><td>groupe nominal détaché, qui désigne la même chose</td><td>Roxy, <u>la renarde</u>, chasse.</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> épithète ou attribut ? S’il y a un <b>verbe d’état</b> entre le nom et l’adjectif,
        c’est un attribut : <i>une nuit calme</i> (épithète) / <i>la nuit est calme</i> (attribut).<br>
        COI ou complément circonstanciel ? Le COI ne se déplace pas. On peut parfois le supprimer, mais le sens du verbe change.
        Le vrai test : le verbe se construit avec cette préposition (<i>obéir à, penser à, se souvenir de</i>).</div>
      <p>⚠️ Un adjectif détaché (<i>Fatiguée, Roxy s’endort.</i>) est appelé « apposition » dans certains manuels,
        « épithète détachée » dans d’autres : ici, les appositions sont toujours des groupes nominaux.</p>
    `,
  });

  // ======================================================================
  // 3. Les propositions subordonnées
  // ======================================================================
  ajouterClassement({
    id: '3e-grammaire-subordonnees',
    consigne: 'Quelle est la nature de la subordonnée soulignée ?',
    categories: {
      relative: {
        nom: 'relative',
        regle: 'La subordonnée <b>relative</b> commence par un <b>pronom relatif</b> (qui, que, dont, où, lequel…) '
          + 'qui reprend un nom placé juste avant : son <b>antécédent</b>. Elle complète ce nom.',
      },
      completive: {
        nom: 'conjonctive complétive',
        regle: 'La subordonnée <b>conjonctive complétive</b> commence par la conjonction <b>que</b>, qui ne reprend aucun nom. '
          + 'Elle complète le verbe (souvent comme COD) : on ne peut ni la supprimer ni la déplacer.',
      },
      interrogative: {
        nom: 'interrogative indirecte',
        regle: 'La subordonnée <b>interrogative indirecte</b> rapporte une question, après un verbe comme demander, savoir, '
          + 'ignorer, dire… Elle commence par si, qui, où, quand, pourquoi, comment… et n’a pas de point d’interrogation.',
      },
      circonstancielle: {
        nom: 'circonstancielle',
        regle: 'La subordonnée <b>circonstancielle</b> donne une circonstance (temps, cause, but, condition, concession…). '
          + 'Elle commence par une conjonction (quand, parce que, si, pour que, bien que…) et on peut souvent la déplacer.',
      },
    },
    // [phrase, nature de la subordonnée, remarque de Roxy pour les phrases qui piègent]
    banque: [
      ['Le livre [[que tu m’as prêté]] est passionnant.', 'relative', '« que » reprend le nom « livre » (tu m’as prêté le livre) : c’est un pronom relatif.'],
      ['Je connais un endroit [[où poussent des fraises des bois]].', 'relative', '« où » reprend le nom « endroit » : la subordonnée complète ce nom, c’est une relative.'],
      ['La renarde [[qui vit sous ce chêne]] a trois petits.', 'relative'],
      ['Voici l’ami [[dont je t’ai parlé]].', 'relative'],
      ['Le jour [[où nous sommes partis]], il pleuvait.', 'relative', '« où » reprend le nom « jour » (son antécédent) : c’est une relative, même si elle parle de temps.'],
      ['Les fraises [[que Mamie a cueillies]] sont délicieuses.', 'relative', '« que » reprend le nom « fraises » (Mamie a cueilli les fraises) : c’est un pronom relatif.'],
      ['Les élèves [[qui ont fini]] peuvent sortir.', 'relative'],
      ['La cabane [[dans laquelle nous jouions]] a été réparée.', 'relative', '« laquelle » reprend le nom « cabane » : c’est un pronom relatif.'],
      ['Je pense [[que tu as raison]].', 'completive', '« que » ne reprend aucun nom : c’est une conjonction. La subordonnée est COD du verbe « pense ».'],
      ['Roxy espère [[que la nuit sera claire]].', 'completive'],
      ['Il faut [[que nous partions tôt]].', 'completive'],
      ['Tom a annoncé [[qu’il déménageait]].', 'completive'],
      ['Je souhaite [[que tu viennes à ma fête]].', 'completive'],
      ['Mamie dit souvent [[que la patience est une force]].', 'completive', '« que » ne reprend aucun nom : Mamie dit quoi ? que la patience est une force. C’est une complétive.'],
      ['Nous savons [[que la Terre tourne autour du Soleil]].', 'completive'],
      ['Je me demande [[si Noa viendra]].', 'interrogative', 'Ici, « si » ne pose pas de condition : il rapporte une question (Noa viendra-t-il ?).'],
      ['Dis-moi [[où tu vas]].', 'interrogative', '« où » ne reprend aucun nom : il rapporte la question « Où vas-tu ? ».'],
      ['Personne ne sait [[quand l’orage éclatera]].', 'interrogative', 'La subordonnée rapporte la question « Quand l’orage éclatera-t-il ? » : c’est une interrogative indirecte.'],
      ['Léa demande [[qui a gagné le match]].', 'interrogative', '« qui » ne reprend aucun nom : Léa pose la question « Qui a gagné le match ? ».'],
      ['J’ignore [[pourquoi Zoé est partie si tôt]].', 'interrogative'],
      ['Explique-moi [[comment tu as résolu l’énigme]].', 'interrogative'],
      ['Tom voulait savoir [[si la cabane était solide]].', 'interrogative', 'Ici, « si » rapporte une question (La cabane est-elle solide ?) : ce n’est pas une condition.'],
      ['Je ne sais pas [[quel chemin il faut prendre]].', 'interrogative'],
      ['[[Si tu te dépêches]], nous verrons le coucher du soleil.', 'circonstancielle', 'Ici, « si » introduit une condition : c’est une circonstancielle (de condition). On peut la déplacer.'],
      ['[[Quand la lune se lève]], les chouettes s’envolent.', 'circonstancielle', 'Ici, « quand » indique le moment : c’est une circonstancielle de temps.'],
      ['Nous rentrerons [[avant qu’il fasse nuit]].', 'circonstancielle'],
      ['Roxy se cache [[parce qu’elle a entendu un bruit]].', 'circonstancielle'],
      ['[[Bien qu’il soit fatigué]], Sami termine son exposé.', 'circonstancielle'],
      ['Parle plus fort [[pour que tout le monde t’entende]].', 'circonstancielle', '« pour que » exprime le but : ce n’est pas le « que » d’une complétive.'],
      ['[[Dès que la cloche sonne]], les élèves sortent.', 'circonstancielle'],
      ['[[Pendant que Mamie lisait]], le chat dormait sur ses genoux.', 'circonstancielle'],
    ],
    titreLecon: 'Les propositions subordonnées',
    lecon: `
      <p>Une <b>proposition subordonnée</b> dépend d’une proposition principale. On en étudie ici quatre sortes
        (il en existe d’autres, comme l’infinitive et la participiale) :</p>
      <table>
        <tr><th>nature</th><th>elle commence par…</th><th>exemple</th></tr>
        <tr><td><b>relative</b></td><td>un pronom relatif qui reprend un nom</td><td>le livre <u>que tu lis</u></td></tr>
        <tr><td><b>conjonctive complétive</b></td><td>la conjonction que</td><td>Je pense <u>que tu as raison</u>.</td></tr>
        <tr><td><b>interrogative indirecte</b></td><td>si, qui, où, quand, pourquoi…</td><td>Je me demande <u>si tu viendras</u>.</td></tr>
        <tr><td><b>circonstancielle</b></td><td>quand, parce que, si, pour que…</td><td><u>Quand il pleut</u>, je lis.</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> méfie-toi des mots pièges !<br>
        • <b>que</b> : il reprend un nom → relative ; il ne reprend rien → complétive ; il fait partie d’une locution
          (pour que, bien que, avant que, dès que, pendant que…) → circonstancielle.<br>
        • <b>où</b> : après un nom → relative ; après « dis-moi », « je sais »… → interrogative indirecte.<br>
        • <b>si</b> : une condition → circonstancielle ; une question (« je me demande si ») → interrogative indirecte.</div>
      <p>Pour vérifier une interrogative indirecte, transforme-la en vraie question :
        <i>Dis-moi où tu vas</i> → <i>Où vas-tu ?</i></p>
      <p>Certaines grammaires rangent l’interrogative indirecte parmi les complétives, car elle complète elle aussi le verbe.
        Ici, « conjonctive complétive » désigne seulement la subordonnée qui commence par la conjonction <b>que</b>.</p>
    `,
  });

  // ======================================================================
  // 4. Les rapports logiques
  // ======================================================================
  const RAPPORTS = {
    cause: {
      nom: 'cause',
      regle: 'La <b>cause</b> explique <b>pourquoi</b> un fait se produit : parce que, puisque, car, grâce à, à cause de…',
    },
    consequence: {
      nom: 'conséquence',
      regle: 'La <b>conséquence</b> présente le <b>résultat</b> d’un fait : donc, si bien que, c’est pourquoi, par conséquent, '
        + 'tellement… que…',
    },
    but: {
      nom: 'but',
      regle: 'Le <b>but</b> indique l’<b>objectif</b> visé, ce qu’on cherche à obtenir : pour, afin de, pour que, afin que…',
    },
    opposition: {
      nom: 'opposition',
      regle: 'L’<b>opposition</b> met deux faits en <b>contraste</b>, face à face : alors que, tandis que, au contraire, '
        + 'contrairement à…',
    },
    concession: {
      nom: 'concession',
      regle: 'La <b>concession</b> montre que le résultat attendu <b>ne se produit pas</b> : bien que, quoique, même si, '
        + 'malgré, pourtant, néanmoins…',
    },
    condition: {
      nom: 'condition',
      regle: 'La <b>condition</b> présente un fait dont un autre dépend : si, à condition que, à condition de, au cas où, en cas de…',
    },
  };

  ajouterClassement({
    id: '3e-grammaire-rapports-logiques',
    consigne: 'Quel rapport logique exprime la partie soulignée ?',
    nombreChoix: 4,
    categories: RAPPORTS,
    // Opposition et concession ne sont jamais proposées ensemble : les manuels ne les séparent pas tous de la même façon
    choixPossibles(cle) {
      const exclue = { opposition: 'concession', concession: 'opposition' }[cle] || RM.hasard(['opposition', 'concession']);
      return Object.keys(RAPPORTS).filter(c => c !== exclue);
    },
    // Les pièges « jumeaux », toujours proposés (sauf la catégorie écartée juste au-dessus)
    toujoursProposer: cle => ({
      cause: ['consequence', 'but'],
      consequence: ['cause', 'but'],
      but: ['cause', 'consequence'],
      opposition: ['cause'],
      concession: ['condition', 'cause'],
      condition: ['concession', 'cause'],
    })[cle],
    // [phrase, rapport, remarque de Roxy]
    banque: [
      ['Nous sommes restés à l’abri [[parce qu’il pleuvait]].', 'cause'],
      ['[[Puisque tu as fini tes devoirs]], tu peux aller jouer.', 'cause'],
      ['Le match a été annulé [[à cause de la tempête]].', 'cause'],
      ['[[Grâce à ton aide]], j’ai réussi l’exercice.', 'cause', '« grâce à » donne la raison de la réussite : c’est une cause (heureuse).'],
      ['Zoé ne viendra pas, [[car elle part en voyage]].', 'cause'],
      ['Il a plu toute la nuit, [[si bien que le chemin est boueux]].', 'consequence', 'Le chemin boueux est le <b>résultat</b> de la pluie : c’est une conséquence.'],
      ['Teva s’est entraîné tous les jours ; [[il a donc gagné la course]].', 'consequence'],
      ['Le radier était inondé ; [[par conséquent, le car n’est pas venu]].', 'consequence'],
      ['Roxy était tellement fatiguée [[qu’elle s’endormit aussitôt]].', 'consequence', '« tellement… que » : s’endormir est le <b>résultat</b> de la fatigue.'],
      ['Sami n’a pas entendu son réveil, [[c’est pourquoi il est arrivé en retard]].', 'consequence'],
      ['Mei révise chaque soir [[pour réussir son brevet]].', 'but', 'Réussir le brevet est l’<b>objectif</b> de Mei, pas encore atteint : c’est un but.'],
      ['Parle doucement [[afin de ne pas réveiller le bébé]].', 'but'],
      ['Papi a construit une cabane [[pour que ses petits-enfants puissent y jouer]].', 'but'],
      ['Nous partons à l’aube [[afin de voir le lever du soleil]].', 'but'],
      ['Mets ton chapeau [[pour ne pas attraper de coup de soleil]].', 'but'],
      ['Léa adore les maths, [[alors que son frère préfère le dessin]].', 'opposition', 'On compare deux faits qui s’opposent : Léa aime les maths, son frère le dessin.'],
      ['Le hérisson dort le jour, [[tandis que l’écureuil dort la nuit]].', 'opposition'],
      ['[[Contrairement à sa sœur]], Minh se lève tôt.', 'opposition'],
      ['Hugo adore la ville ; [[Anaïs, au contraire, préfère la brousse]].', 'opposition'],
      ['Papi se couche tôt, [[alors que Mamie lit jusqu’à minuit]].', 'opposition'],
      ['[[Bien qu’il soit fatigué]], Hugo termine la course.', 'concession', 'Fatigué, il devrait s’arrêter… et pourtant il termine : le résultat attendu ne se produit pas.'],
      ['[[Malgré la pluie]], nous sommes allés pique-niquer.', 'concession', 'Avec la pluie, on s’attend à rester à la maison… et pourtant on pique-nique.'],
      ['Il faisait très froid ; [[pourtant, Sélène est sortie sans manteau]].', 'concession'],
      ['[[Même si le chemin est long]], nous arriverons avant la nuit.', 'concession', '« même si » n’est pas une condition : le chemin est long, et pourtant nous arriverons à temps. C’est une concession.'],
      ['[[Quoiqu’elle soit timide]], Ilona a chanté devant toute l’école.', 'concession'],
      ['[[Si tu arroses cette plante]], elle fleurira.', 'condition'],
      ['[[En cas de pluie]], la fête aura lieu dans le gymnase.', 'condition'],
      ['Nous irons au lac [[à condition qu’il fasse beau]].', 'condition'],
      ['Tu pourras sortir [[à condition de finir tes devoirs]].', 'condition'],
      ['[[Si Roxy avait des ailes]], elle volerait jusqu’à la lune.', 'condition'],
    ],
    titreLecon: 'Les rapports logiques',
    lecon: `
      <p>Les <b>rapports logiques</b> relient des idées entre elles. On les exprime avec des <b>connecteurs</b> :
        conjonctions, prépositions, adverbes…</p>
      <table>
        <tr><th>rapport</th><th>l’idée</th><th>connecteurs</th></tr>
        <tr><td><b>cause</b></td><td>pourquoi ?</td><td>parce que, puisque, car, grâce à, à cause de</td></tr>
        <tr><td><b>conséquence</b></td><td>quel résultat ?</td><td>donc, si bien que, c’est pourquoi, par conséquent, tellement… que</td></tr>
        <tr><td><b>but</b></td><td>quel objectif ?</td><td>pour, afin de, pour que, afin que</td></tr>
        <tr><td><b>opposition</b></td><td>deux faits face à face</td><td>alors que, tandis que, au contraire, contrairement à</td></tr>
        <tr><td><b>concession</b></td><td>le résultat attendu ne vient pas</td><td>bien que, quoique, même si, malgré, pourtant, néanmoins</td></tr>
        <tr><td><b>condition</b></td><td>à quelle condition ?</td><td>si, à condition que, à condition de, au cas où, en cas de</td></tr>
      </table>
      <p>⚠️ « même si » ressemble à « si », mais il n’exprime pas une condition : c’est une <b>concession</b>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cause ou but ? La cause existe <b>déjà</b> (<i>parce qu’il pleut</i>) ;
        le but est un objectif <b>pas encore atteint</b> (<i>pour réussir</i>).</div>
      <p>⚠️ Opposition ou concession ? <i>Léa aime le sport, alors que Tom préfère lire</i> : deux faits en contraste (opposition).
        <i>Bien qu’il pleuve, nous sortons</i> : on devrait rester, et pourtant on sort (concession).
        Les manuels ne classent pas tous ces connecteurs de la même façon : ici, on ne te demande jamais de choisir entre les deux.</p>
    `,
  });

  // ======================================================================
  // 5. Les valeurs du présent
  // ======================================================================
  // Pour le présent de narration, on choisit des verbes dont le présent ne ressemble pas
  // au passé simple (il craque / il craqua, il apparaît / il apparut… et non « il surgit »).
  ajouterClassement({
    id: '3e-grammaire-valeurs-present',
    consigne: 'Quelle est la valeur de ce verbe au présent ?',
    nombreChoix: 4,
    categories: {
      enonciation: {
        nom: 'présent d’énonciation',
        regle: 'Le <b>présent d’énonciation</b> exprime une action qui se passe <b>au moment où l’on parle</b>.',
      },
      verite: {
        nom: 'vérité générale',
        regle: 'Le présent de <b>vérité générale</b> exprime un fait toujours vrai : une loi de la nature, '
          + 'une vérité scientifique, un proverbe.',
      },
      habitude: {
        nom: 'habitude',
        regle: 'Le présent d’<b>habitude</b> exprime une action qui se répète régulièrement : '
          + 'tous les matins, chaque été, d’habitude, toujours…',
      },
      narration: {
        nom: 'présent de narration',
        regle: 'Le <b>présent de narration</b> remplace le passé simple dans un récit au passé : '
          + 'il rend une action soudaine plus vivante, comme si on y était.',
      },
      futur: {
        nom: 'futur proche',
        regle: 'Le présent peut exprimer un <b>futur proche</b> : l’action aura lieu bientôt, et un mot le montre '
          + '(demain, ce soir, dans cinq minutes…).',
      },
      passe: {
        nom: 'passé récent',
        regle: 'Le présent peut exprimer un <b>passé récent</b> : l’action vient juste de se produire '
          + '(tout juste, juste, à peine…).',
      },
    },
    // [phrase, valeur, remarque de Roxy]
    banque: [
      ['Chut ! Le bébé [[dort]] en ce moment.', 'enonciation'],
      ['Regarde par la fenêtre : il [[pleut]] !', 'enonciation', 'Il pleut maintenant, au moment où l’on parle : c’est un présent d’énonciation.'],
      ['Tu entends ? Quelqu’un [[frappe]] à la porte.', 'enonciation'],
      ['En ce moment même, Roxy [[observe]] la lune depuis la colline.', 'enonciation'],
      ['Allô, Mamie ? Je t’[[appelle]] depuis le car.', 'enonciation'],
      ['L’eau [[gèle]] à zéro degré.', 'verite', 'C’est une loi de la nature, vraie partout et toujours.'],
      ['La Terre [[tourne]] autour du Soleil.', 'verite'],
      ['Petit à petit, l’oiseau [[fait]] son nid.', 'verite', 'C’est un proverbe : il exprime une vérité valable pour tout le monde.'],
      ['La nuit, tous les chats [[sont]] gris.', 'verite', 'C’est un proverbe : il exprime une vérité valable pour tout le monde.'],
      ['Les araignées [[ont]] huit pattes.', 'verite'],
      ['Tous les matins, Kalia [[prend]] le bus de 7 h 30.', 'habitude', '« Tous les matins » montre une action qui se répète : c’est une habitude de Kalia.'],
      ['Chaque été, nous [[allons]] chez Mamie à Lifou.', 'habitude'],
      ['Tous les mercredis, Sami [[joue]] au basket.', 'habitude'],
      ['Roxy [[fait]] toujours la sieste après le déjeuner.', 'habitude', 'C’est une habitude de Roxy, pas une vérité valable pour tout le monde.'],
      ['D’habitude, mon père [[rentre]] vers 19 heures.', 'habitude'],
      ['Roxy marchait tranquillement quand, soudain, un hibou [[apparaît]] devant elle.', 'narration', 'Le récit est au passé (marchait), puis il passe au présent pour une action soudaine.'],
      ['La nuit était calme. Tout à coup, une branche [[craque]] derrière nous.', 'narration'],
      ['Le chevalier traversait la forêt. Soudain, il [[aperçoit]] une lumière.', 'narration', 'Le récit est au passé (traversait), puis il passe au présent : au passé simple, on aurait « il aperçut ».'],
      ['Nous dormions depuis une heure quand, soudain, le téléphone [[sonne]].', 'narration'],
      ['Tom lisait dans son lit ; tout à coup, la lumière [[s’éteint]].', 'narration'],
      ['Les enfants jouaient dans le jardin. Soudain, un orage [[éclate]].', 'narration'],
      ['Je [[pars]] demain en sortie scolaire à l’île des Pins.', 'futur', '« demain » montre que l’action n’a pas encore eu lieu : le présent a ici une valeur de futur.'],
      ['Dépêche-toi : le car [[arrive]] dans cinq minutes !', 'futur'],
      ['La semaine prochaine, nous [[visitons]] le château de Versailles.', 'futur'],
      ['Demain soir, Papi nous [[emmène]] voir les étoiles.', 'futur'],
      ['Le brevet [[commence]] dans deux semaines.', 'futur'],
      ['Tu cherches Hugo ? Il [[sort]] tout juste d’ici : tu l’as manqué de peu !', 'passe', 'Hugo n’est plus là : il vient de sortir. Le présent a ici une valeur de passé récent.'],
      ['Nous [[rentrons]] tout juste de vacances : les valises sont encore pleines.', 'passe'],
      ['Je [[reviens]] juste de la boulangerie : le pain est encore chaud.', 'passe'],
      ['Émeline [[arrive]] à peine de Maré : laisse-la se reposer un peu.', 'passe'],
    ],
    titreLecon: 'Les valeurs du présent',
    lecon: `
      <p>Le présent de l’indicatif ne parle pas seulement de « maintenant » ! Selon le contexte, il a plusieurs <b>valeurs</b> :</p>
      <table>
        <tr><th>valeur</th><th>exemple</th><th>indice</th></tr>
        <tr><td><b>présent d’énonciation</b></td><td>Chut, le bébé <u>dort</u>.</td><td>au moment où l’on parle</td></tr>
        <tr><td><b>vérité générale</b></td><td>L’eau <u>bout</u> à 100 °C.</td><td>toujours vrai : science, proverbe</td></tr>
        <tr><td><b>habitude</b></td><td>Chaque matin, je <u>cours</u>.</td><td>tous les…, chaque…, toujours</td></tr>
        <tr><td><b>présent de narration</b></td><td>Il dormait quand, soudain, le vent <u>souffle</u>.</td><td>dans un récit au passé</td></tr>
        <tr><td><b>futur proche</b></td><td>Je <u>pars</u> demain.</td><td>demain, ce soir, dans une heure</td></tr>
        <tr><td><b>passé récent</b></td><td>Il <u>sort</u> tout juste d’ici : tu l’as manqué de peu !</td><td>tout juste, à peine</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le verbe seul ne suffit pas ! Cherche les <b>indices</b> autour de lui :
        un mot de temps, un récit au passé, un proverbe…</div>
      <p>On dit aussi « présent à valeur de futur proche » et « présent à valeur de passé récent ».</p>
    `,
  });

  // ======================================================================
  // 6. Voix active ou passive ? (et le complément d’agent)
  // ======================================================================
  const { souligner, groupeSouligne } = RM.phrases;

  // [phrase avec le verbe souligné, 'active' ou 'passive', remarque de Roxy]
  const PHRASES_VOIX = [
    ['Roxy [[est rentrée]] tard hier soir.', 'active', '« est rentrée » est le <b>passé composé</b> du verbe rentrer : c’est Roxy qui fait l’action.'],
    ['Les hirondelles [[sont revenues]] au printemps.', 'active', '« sont revenues » est le passé composé de revenir : ce sont les hirondelles qui font l’action.'],
    ['Le chat [[est passé]] par la fenêtre.', 'active', '« est passé » est le passé composé de passer : c’est le chat qui passe. « par la fenêtre » indique le lieu : ce n’est pas un complément d’agent.'],
    ['Nos cousins [[étaient partis]] avant l’aube.', 'active', '« étaient partis » est le <b>plus-que-parfait</b> de partir : ce sont nos cousins qui partent.'],
    ['Le fermier [[nourrit]] les poules chaque matin.', 'active', 'Le sujet « le fermier » fait l’action de nourrir ; « les poules » est le COD.'],
    ['Léa [[a reçu]] un prix pour son dessin.', 'active', '« a reçu » = avoir + participe passé : c’est le passé composé actif. Le passif serait « Un prix a été reçu par Léa ». '
      + 'Même si Léa « reçoit », la forme du verbe est active.'],
    ['Mamie [[est née]] dans un petit village.', 'active', '« est née » est le passé composé du verbe naître, qui se conjugue avec être. Ce verbe n’a jamais de COD : il ne peut pas être au passif.'],
    ['Les enfants [[ont construit]] une cabane dans le bois.', 'active', 'Ce sont les enfants qui construisent : « ont construit » est le passé composé actif.'],
    ['Hugo [[est arrivé]] le premier à la course.', 'active', '« est arrivé » est le passé composé du verbe arriver : c’est Hugo qui fait l’action.'],
    ['Les invités [[sont montés]] au grenier.', 'active', '« sont montés » est le passé composé du verbe monter : ce sont les invités qui montent.'],
    ['Au loin, la chouette [[appelle]] ses petits.', 'active', 'Le sujet « la chouette » fait l’action d’appeler.'],
    ['Le goûter [[a été préparé]] par Papi.', 'passive', 'Le goûter ne prépare rien : il <b>subit</b> l’action. À la voix active : « Papi a préparé le goûter. »'],
    ['Ce château [[fut construit]] au Moyen Âge.', 'passive', '« fut construit » = être au passé simple + participe passé : le château subit l’action. On ne dit pas qui l’a construit.'],
    ['Les copies [[seront corrigées]] demain.', 'passive', '« seront corrigées » = être au futur + participe passé : les copies subissent l’action.'],
    ['La souris [[est poursuivie]] par le chat.', 'passive', 'La souris subit l’action. À la voix active : « Le chat poursuit la souris. »'],
    ['Tom [[a été invité]] à l’anniversaire de Maëva.', 'passive', '« a été invité » = être au passé composé + participe passé : Tom subit l’action (quelqu’un l’a invité).'],
    ['Les poules [[sont nourries]] chaque matin par le fermier.', 'passive', 'À la voix active : « Le fermier nourrit les poules chaque matin. » Les poules subissent l’action.'],
    ['Le vainqueur [[sera récompensé]] par le maire.', 'passive', 'À la voix active : « Le maire récompensera le vainqueur. »'],
    ['Ce roman [[a été traduit]] en vingt langues.', 'passive', 'Le roman ne traduit rien : il subit l’action. On ne dit pas qui l’a traduit.'],
    ['La cabane [[a été construite]] par les enfants.', 'passive', 'À la voix active : « Les enfants ont construit la cabane. »'],
    ['Le prix [[a été remis]] à Léa par la directrice.', 'passive', 'À la voix active : « La directrice a remis le prix à Léa. »'],
    ['Les élèves [[ont été félicités]] pour leur travail.', 'passive', '« ont été félicités » = être au passé composé + participe passé : les élèves subissent l’action.'],
  ];

  // [phrase au passif, le complément d’agent, les autres groupes de la phrase (les pièges), la phrase à la voix active,
  //  remarque de Roxy facultative]
  const PHRASES_AGENT = [
    // Chaque phrase a au moins un autre groupe qui commence par « par » ou « de » : la forme seule ne suffit pas
    ['Dans la cuisine, le vase a été renversé par le chat d’un coup de patte.', 'par le chat',
      ['dans la cuisine', 'le vase', 'd’un coup de patte'], 'Dans la cuisine, le chat a renversé le vase d’un coup de patte.',
      '« d’un coup de patte » dit comment : c’est un complément circonstanciel de manière.'],
    ['Chaque soir, par sécurité, les poules sont enfermées par le fermier.', 'par le fermier',
      ['chaque soir', 'par sécurité', 'les poules'], 'Chaque soir, par sécurité, le fermier enferme les poules.',
      '« par sécurité » dit pourquoi : c’est un complément circonstanciel, pas celui qui fait l’action.'],
    ['Par erreur, la lettre a été déposée chez nous par le nouveau facteur.', 'par le nouveau facteur',
      ['par erreur', 'la lettre', 'chez nous'], 'Par erreur, le nouveau facteur a déposé la lettre chez nous.',
      '« par erreur » commence aussi par « par », mais il dit comment : c’est un complément circonstanciel.'],
    ['Depuis dix ans, ce professeur de musique est apprécié de tous ses élèves.', 'de tous ses élèves',
      ['depuis dix ans', 'ce professeur de musique', 'de musique'],
      'Depuis dix ans, tous ses élèves apprécient ce professeur de musique.',
      '« de musique » complète le nom « professeur » : c’est un complément du nom. '
        + 'Le complément d’agent peut être introduit par « de », surtout avec les verbes de sentiment (aimer, apprécier…).'],
    ['Par une nuit sans lune, le trésor fut découvert par deux enfants.', 'par deux enfants',
      ['par une nuit sans lune', 'le trésor'], 'Par une nuit sans lune, deux enfants découvrirent le trésor.',
      '« par une nuit sans lune » dit quand : c’est un complément circonstanciel de temps.'],
    ['De bon matin, Sami a été piqué par une guêpe dans le jardin.', 'par une guêpe',
      ['de bon matin', 'Sami', 'dans le jardin'], 'De bon matin, une guêpe a piqué Sami dans le jardin.',
      '« de bon matin » dit quand : c’est un complément circonstanciel de temps.'],
    ['Par grand vent, le château de sable a été emporté par une vague.', 'par une vague',
      ['par grand vent', 'le château de sable'], 'Par grand vent, une vague a emporté le château de sable.',
      '« par grand vent » dit dans quelles circonstances : c’est un complément circonstanciel.'],
    ['Par tradition, le spectacle de fin d’année est présenté par les élèves de 3e.', 'par les élèves de 3e',
      ['par tradition', 'le spectacle de fin d’année'], 'Par tradition, les élèves de 3e présentent le spectacle de fin d’année.',
      '« par tradition » ne désigne pas ceux qui présentent le spectacle : c’est un complément circonstanciel.'],
    ['Par la fenêtre, les étoiles sont observées par Papi et Léa.', 'par Papi et Léa', ['par la fenêtre', 'les étoiles'],
      'Par la fenêtre, Papi et Léa observent les étoiles.',
      '« par la fenêtre » dit par où : c’est un complément circonstanciel de lieu.'],
    ['Par ici, cette légende est connue de tous les villageois.', 'de tous les villageois',
      ['par ici', 'cette légende'], 'Par ici, tous les villageois connaissent cette légende.',
      '« par ici » indique le lieu : c’est un complément circonstanciel. Le complément d’agent, lui, est introduit ici par « de ».'],
    ['Par temps chaud, les jardins sont envahis par les pucerons.', 'par les pucerons', ['par temps chaud', 'les jardins'],
      'Par temps chaud, les pucerons envahissent les jardins.',
      '« par temps chaud » dit dans quelles circonstances : c’est un complément circonstanciel.'],
    ['Par surprise, Zoé a été invitée au restaurant par ses parents.', 'par ses parents',
      ['par surprise', 'Zoé', 'au restaurant'], 'Par surprise, ses parents ont invité Zoé au restaurant.',
      '« par surprise » dit comment : c’est un complément circonstanciel de manière.'],
    ['Par précaution, les fenêtres ont été fermées par le gardien.', 'par le gardien', ['par précaution', 'les fenêtres'],
      'Par précaution, le gardien a fermé les fenêtres.',
      '« par précaution » dit pourquoi : c’est un complément circonstanciel, pas celui qui fait l’action.'],
    ['Par un beau matin, Roxy fut réveillée par le chant d’un merle.', 'par le chant d’un merle',
      ['par un beau matin', 'Roxy'], 'Par un beau matin, le chant d’un merle réveilla Roxy.',
      '« par un beau matin » dit quand : c’est un complément circonstanciel de temps.'],
    ['Chaque dimanche, la tarte aux pommes est préparée de bon cœur par Mamie.', 'par Mamie',
      ['chaque dimanche', 'de bon cœur', 'la tarte aux pommes'], 'Chaque dimanche, Mamie prépare de bon cœur la tarte aux pommes.',
      '« de bon cœur » dit comment : c’est un complément circonstanciel de manière.'],
  ];

  const VOIX = { active: 'voix active', passive: 'voix passive' };
  const REGLE_VOIX = {
    active: 'À la voix <b>active</b>, le sujet <b>fait</b> l’action. Attention : être + participe passé peut être '
      + 'un simple temps composé (il est parti, elle est née).',
    passive: 'À la voix <b>passive</b>, le sujet <b>subit</b> l’action : le verbe est formé avec l’auxiliaire <b>être</b> '
      + '(au temps de la phrase) + le participe passé.',
  };
  const REGLE_AGENT = 'Dans une phrase passive, le <b>complément d’agent</b> désigne celui qui fait l’action. '
    + 'Il est introduit par la préposition « <b>par</b> » (parfois « <b>de</b> ») et devient le sujet à la voix active.';

  // a) La phrase est-elle à la voix active ou passive ?
  function questionVoix([phrase, voix, remarque]) {
    return question({
      consigne: 'Cette phrase est-elle à la voix active ou à la voix passive ?',
      enonce: phrase,
      reponse: VOIX[voix],
      choix: [VOIX.active, VOIX.passive],
      solution: `« ${groupeSouligne(phrase)} » : <b>${VOIX[voix]}</b>`,
      explication: `${remarque}<br>${REGLE_VOIX[voix]}`,
    });
  }

  // b) Quel est le complément d'agent ? (des groupes de la phrase en boutons)
  function questionAgent([phrase, agent, pieges, phraseActive, remarque]) {
    return question({
      consigne: 'Quel est le complément d’agent de cette phrase ?',
      enonce: phrase,
      reponse: agent,
      pieges,
      solution: souligner(phrase.replace(agent, `[[${agent}]]`)),
      explication: [remarque, `Qui fait l’action ? À la voix active, on dirait : <i>${phraseActive}</i>`, REGLE_AGENT]
        .filter(Boolean).join('<br>'),
    });
  }

  ajouterEtape({
    id: '3e-grammaire-voix-passive',
    banque: [...PHRASES_VOIX.map(ligne => ['voix', ligne]), ...PHRASES_AGENT.map(ligne => ['agent', ligne])],
    creerQuestion: ([sorte, ligne]) => (sorte === 'voix' ? questionVoix(ligne) : questionAgent(ligne)),
    titreLecon: 'Voix active ou passive ?',
    lecon: `
      <p>À la voix <b>active</b>, le sujet <b>fait</b> l’action : <i>Le chat renverse le vase.</i><br>
         À la voix <b>passive</b>, le sujet <b>subit</b> l’action : <i>Le vase est renversé par le chat.</i></p>
      <h4>🌟 Le passif : être (au temps de la phrase) + participe passé</h4>
      <table>
        <tr><th>voix active</th><th>voix passive</th></tr>
        <tr><td>Papi <b>prépare</b> le goûter.</td><td>Le goûter <b>est préparé</b> par Papi.</td></tr>
        <tr><td>Papi <b>a préparé</b> le goûter.</td><td>Le goûter <b>a été préparé</b> par Papi.</td></tr>
        <tr><td>Papi <b>préparera</b> le goûter.</td><td>Le goûter <b>sera préparé</b> par Papi.</td></tr>
      </table>
      <p>⚠️ Être + participe passé, ce n’est pas toujours le passif ! « <i>Roxy est partie</i> » est le <b>passé composé</b>
        (actif) du verbe partir : c’est Roxy qui part.<br>
        Et le sens ne suffit pas : regarde la <b>forme du verbe</b>. « <i>Léa a reçu un prix</i> » est actif (avoir + participe passé),
        même si Léa « reçoit ».</p>
      <h4>Le complément d’agent</h4>
      <p>Il désigne celui qui fait l’action. Il est introduit par la préposition « <b>par</b> » (parfois « <b>de</b> » : <i>aimé de tous</i>)
        et devient le <b>sujet</b> à la voix active. Il n’est pas toujours exprimé : <i>Ce château fut construit au Moyen Âge.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> demande-toi « <b>qui fait l’action ?</b> ». Si c’est le sujet, la phrase est active.
        Si le sujet <b>subit</b> l’action (être + participe passé), elle est passive. Attention : tout ce qui commence par « par » n’est pas
        un complément d’agent (<i>par la fenêtre, par erreur</i>).</div>
    `,
  });
})();
