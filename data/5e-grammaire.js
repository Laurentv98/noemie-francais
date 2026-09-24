// Renard Malin — Grammaire, niveau 5e : les 6 étapes de la Colline de la Grammaire (d’automne)
//
// Les phrases sont écrites à la main. Le mot ou le groupe à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement } = RM.phrases;

  // ======================================================================
  // 1. Les classes de mots
  // ======================================================================
  // Huit classes, mais seulement 4 boutons tirés au hasard : chaque mot doit être
  // sans aucun doute dans sa classe (pas de « que », « tout », « même », « donc », « leur »…).
  ajouterClassement({
    id: '5e-grammaire-classes-mots',
    consigne: 'Quelle est la classe grammaticale du {mot} souligné ?',
    nombreChoix: 4,
    // Les pièges « jumeaux », toujours proposés avec cette réponse (le dernier bouton est tiré au hasard)
    toujoursProposer: cle => ({
      nom: ['verbe', 'adjectif'],               // le rire, le courage
      verbe: ['nom'],                           // il souffle / un souffle
      adjectif: ['adverbe', 'nom'],             // trop chaude, un petit lapin
      determinant: ['pronom', 'preposition'],   // je ramasse les noisettes / je les ramasse ; du pain / le vélo de Sami
      pronom: ['determinant'],
      adverbe: ['adjectif'],                    // il court vite
      preposition: ['conjonction', 'determinant'],
      conjonction: ['preposition', 'adverbe'],  // quand, si
    })[cle],
    categories: {
      nom: {
        nom: 'nom',
        regle: 'Le <b>nom</b> désigne une personne, un animal, une chose ou une idée. Il est souvent précédé d’un déterminant.',
      },
      verbe: {
        nom: 'verbe',
        regle: 'Le <b>verbe</b> exprime une action ou un état. Il se conjugue : il change selon le temps et la personne.',
      },
      adjectif: {
        nom: 'adjectif',
        regle: 'L’<b>adjectif</b> décrit le nom. Il s’accorde avec lui en genre et en nombre.',
      },
      determinant: {
        nom: 'déterminant',
        regle: 'Le <b>déterminant</b> se place devant le nom et l’annonce : le, une, du, mon, cette, chaque…',
      },
      pronom: {
        nom: 'pronom',
        regle: 'Le <b>pronom</b> remplace un nom, ou désigne une personne : je, nous, la, lui, qui, celui-ci…',
      },
      adverbe: {
        nom: 'adverbe',
        regle: 'L’<b>adverbe</b> est invariable. Il précise un verbe, un adjectif, un autre adverbe ou toute la phrase : '
          + 'vite, très, hier, toujours…',
      },
      preposition: {
        nom: 'préposition',
        regle: 'La <b>préposition</b> est invariable. Elle introduit un complément : à, de, dans, pour, avec, sous, sans…',
      },
      conjonction: {
        nom: 'conjonction',
        regle: 'La <b>conjonction</b> est invariable. Elle relie des mots ou des propositions : '
          + 'mais, ou, et, car (coordination) ; quand, lorsque, si (subordination).',
      },
    },
    // [phrase, classe, remarque de Roxy pour les mots qui piègent]
    banque: [
      ['Le [[hérisson]] dort sous les feuilles.', 'nom'],
      ['Roxy a trouvé une [[châtaigne]] dans l’herbe.', 'nom'],
      ['Le [[rire]] de Zoé est contagieux.', 'nom',
        'Ici, « rire » est précédé du déterminant « le » : c’est un nom (le rire, un rire).'],
      ['Roxy n’a jamais peur : elle a beaucoup de [[courage]].', 'nom',
        'Un nom peut aussi désigner une idée ou une qualité : le courage, la joie, la peur.'],
      ['Les feuilles [[tombent]] doucement.', 'verbe'],
      ['Roxy aime [[nager]] dans la rivière.', 'verbe',
        'Même à l’infinitif, « nager » est un verbe : il exprime une action.'],
      ['Hier, Léa [[semblait]] fatiguée.', 'verbe',
        '« Sembler » est un verbe d’état, comme « être » : il se conjugue (elle semble, elle semblait).'],
      ['Le vent [[souffle]] fort ce soir.', 'verbe',
        '« Souffle » pourrait être un nom (un souffle), mais ici il est conjugué avec le sujet « le vent » : c’est un verbe.'],
      ['Un renard [[roux]] traverse le pré.', 'adjectif'],
      ['Cette soupe est trop [[chaude]].', 'adjectif',
        'Placé après le verbe « être », l’adjectif est attribut du sujet… mais sa classe reste <b>adjectif</b> !'],
      ['Mamie porte une [[magnifique]] écharpe.', 'adjectif'],
      ['Le [[petit]] lapin se cache dans son terrier.', 'adjectif',
        'Placé devant le nom « lapin », « petit » le décrit : c’est un adjectif.'],
      ['[[Mon]] vélo est tout neuf.', 'determinant'],
      ['[[Cette]] pomme est bien mûre.', 'determinant'],
      ['Tom mange [[du]] pain au petit déjeuner.', 'determinant',
        'Ici, « du » annonce le nom « pain » (une quantité de pain) : c’est un déterminant, un article partitif.'],
      ['Roxy ramasse [[les]] noisettes.', 'determinant',
        'Ici, « les » est devant le nom « noisettes » : c’est un déterminant (un article défini).'],
      ['[[Chaque]] élève a son cahier.', 'determinant'],
      ['[[Nous]] partons en vacances demain.', 'pronom'],
      ['Les noisettes sont tombées : Roxy [[les]] ramasse une à une.', 'pronom',
        'Ici, « les » est devant le verbe « ramasse » : il remplace « les noisettes ». C’est un pronom.'],
      ['Le renard [[qui]] dort sous l’arbre s’appelle Roxy.', 'pronom',
        '« Qui » reprend le nom « renard » : c’est un pronom (un pronom relatif).'],
      ['Ce stylo est à Léa ; [[celui-ci]] est à moi.', 'pronom'],
      ['Tom [[lui]] prête sa gomme.', 'pronom'],
      ['La tortue avance [[lentement]].', 'adverbe'],
      ['Ce gâteau est [[très]] bon.', 'adverbe',
        '« Très » précise l’adjectif « bon » : c’est un adverbe, il est invariable.'],
      ['[[Hier]], Sami a perdu une dent.', 'adverbe'],
      ['Le lièvre court [[vite]].', 'adverbe',
        'Ici, « vite » précise le verbe « court » (on peut dire « rapidement ») : c’est un adverbe.'],
      ['Tom arrive [[toujours]] en avance.', 'adverbe'],
      ['Le chat dort [[sous]] la table.', 'preposition'],
      ['Zoé va à l’école [[avec]] son frère.', 'preposition'],
      ['Roxy a préparé un gâteau [[pour]] Mamie.', 'preposition'],
      ['Nous jouons [[dans]] le jardin.', 'preposition'],
      ['Le vélo [[de]] Sami est bleu.', 'preposition',
        'Ici, « de » introduit le complément « Sami » : c’est une préposition, pas un déterminant.'],
      ['Roxy est petite [[mais]] très courageuse.', 'conjonction'],
      ['Veux-tu une pomme [[ou]] une poire ?', 'conjonction'],
      ['Je prends mon parapluie [[car]] il pleut.', 'conjonction'],
      ['[[Lorsque]] la cloche sonne, les élèves sortent.', 'conjonction',
        '« Lorsque » relie deux propositions : c’est une conjonction de subordination.'],
      ['Roxy sort [[quand]] la nuit tombe.', 'conjonction',
        '« Quand » relie deux propositions : c’est une conjonction de subordination.'],
    ],
    titreLecon: 'Les classes de mots',
    lecon: `
      <p>Chaque mot a une <b>classe grammaticale</b> (on dit aussi sa <b>nature</b>). Voici les <b>huit classes principales</b> :</p>
      <table>
        <tr><th>classe</th><th>son rôle</th><th>exemples</th></tr>
        <tr><td><b>nom</b></td><td>désigne une personne, un animal, une chose, une idée</td><td><i>Roxy, un renard, le courage</i></td></tr>
        <tr><td><b>verbe</b></td><td>se conjugue ; exprime une action ou un état</td><td><i>court, semble, nager</i></td></tr>
        <tr><td><b>adjectif</b></td><td>décrit le nom et s’accorde avec lui</td><td><i>roux, petite, magnifiques</i></td></tr>
        <tr><td><b>déterminant</b></td><td>se place devant le nom</td><td><i>le, une, du, mon, cette, chaque</i></td></tr>
        <tr><td><b>pronom</b></td><td>remplace un nom ou désigne une personne (je, nous)</td><td><i>je, nous, la, lui, qui, celui-ci</i></td></tr>
        <tr><td><b>adverbe</b> 🔒</td><td>précise un verbe, un adjectif, un autre adverbe (<i>très vite</i>) ou une phrase</td><td><i>vite, très, hier, toujours</i></td></tr>
        <tr><td><b>préposition</b> 🔒</td><td>introduit un complément</td><td><i>à, de, dans, pour, avec, sous</i></td></tr>
        <tr><td><b>conjonction</b> 🔒</td><td>relie des mots ou des propositions</td><td><i>mais, ou, et, car · quand, si</i></td></tr>
      </table>
      <p>🔒 = <b>invariable</b> : ces mots ne s’accordent pas (sauf l’adverbe « tout » : <i>toute petite</i>).
        Il existe aussi l’<b>interjection</b>, qui exprime un cri ou une émotion : <i>oh ! aïe ! bravo !</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde ce qui suit le mot !<br>
        Devant un <b>nom</b>, « les » est un déterminant : <i>je ramasse <u>les</u> noisettes</i>.<br>
        Devant un <b>verbe</b>, « les » est un pronom : <i>je <u>les</u> ramasse</i>.</div>
      <p>⚠️ Autrefois, on disait « adjectif possessif » ou « adjectif démonstratif » : aujourd’hui,
        <i>mon, cette, chaque</i> sont des <b>déterminants</b>.<br>
        Les conjonctions de coordination : <b>mais, ou, et, or, ni, car</b>. On y ajoute souvent « donc »,
        que certaines grammaires rangent parmi les adverbes.</p>
    `,
  });

  // ======================================================================
  // 2. Les sortes de pronoms
  // ======================================================================
  ajouterClassement({
    id: '5e-grammaire-pronoms',
    consigne: 'De quelle sorte est le pronom souligné ?',
    categories: {
      personnel: {
        nom: 'personnel',
        regle: 'Le pronom <b>personnel</b> désigne une personne de la conjugaison ou remplace un nom : '
          + 'je, tu, il, elle, nous, le, la, les, lui, leur, moi…',
      },
      possessif: {
        nom: 'possessif',
        regle: 'Le pronom <b>possessif</b> remplace un nom et dit à qui il appartient : le mien, la tienne, le nôtre, les leurs…',
      },
      demonstratif: {
        nom: 'démonstratif',
        regle: 'Le pronom <b>démonstratif</b> montre ce dont on parle, ou remplace un nom en le montrant : '
          + 'celui-ci, celle, ceux-là, ceci, cela, ça…',
      },
      relatif: {
        nom: 'relatif',
        regle: 'Le pronom <b>relatif</b> reprend un <b>antécédent</b> (un nom ou un pronom placé avant lui, '
          + 'parfois après une préposition : la cabane dans laquelle…) et introduit une proposition : qui, que, dont, où, lequel…',
      },
    },
    // [phrase, sorte de pronom, remarque de Roxy]
    banque: [
      ['Zoé est au jardin : [[elle]] cueille des mûres.', 'personnel'],
      ['Mamie est au téléphone : je [[lui]] raconte ma journée.', 'personnel',
        '« Lui » remplace « Mamie » : je raconte ma journée <b>à Mamie</b>. C’est un pronom personnel.'],
      ['Ces biscuits sont délicieux : Tom [[les]] adore.', 'personnel',
        'Ici, « les » est devant le verbe « adore » et remplace « ces biscuits » : c’est un pronom personnel.'],
      ['[[Nous]] irons à la plage dimanche.', 'personnel'],
      ['Roxy, viens avec [[moi]] !', 'personnel'],
      ['Mes cousins sont en vacances : je [[leur]] écris une carte.', 'personnel',
        'Devant le verbe, « leur » remplace « à mes cousins » : c’est un pronom personnel. « Les leurs », lui, est possessif.'],
      ['Le matin, tu [[te]] lèves tôt.', 'personnel',
        '« Te » désigne la même personne que « tu » (tu te lèves) : c’est un pronom personnel.'],
      ['[[Vous]] avez bien travaillé, les enfants !', 'personnel'],
      ['Ce vélo rouge est [[le mien]].', 'possessif',
        '« Le mien » = « mon vélo » : il dit à qui est le vélo. C’est un pronom possessif.'],
      ['J’ai oublié ma gomme : tu me prêtes [[la tienne]] ?', 'possessif'],
      ['Tom a perdu sa casquette, alors Léa lui prête [[la sienne]].', 'possessif'],
      ['Nos parapluies sont mouillés, mais [[les vôtres]] sont secs.', 'possessif'],
      ['Ces billes ne sont pas à nous : ce sont [[les leurs]].', 'possessif',
        '« Les leurs » = « leurs billes » : il dit à qui sont les billes. C’est un pronom possessif.'],
      ['Ton dessin est joli, mais [[le nôtre]] est plus grand !', 'possessif'],
      ['Mon chien est petit ; [[le tien]] est énorme !', 'possessif'],
      ['Quel gâteau veux-tu ? Je voudrais [[celui-ci]].', 'demonstratif'],
      ['[[Celle]] qui a gagné la course s’appelle Inès.', 'demonstratif',
        '« Celle » désigne une personne en la montrant : c’est un pronom démonstratif. (Le « qui » qui suit, lui, est relatif.)'],
      ['[[Cela]] me fait très plaisir.', 'demonstratif'],
      ['Tu as entendu [[ça]] ?', 'demonstratif'],
      ['Mes bottes sont vertes ; [[celles]] de Sami sont rouges.', 'demonstratif',
        '« Celles » remplace « les bottes » : c’est un pronom démonstratif.'],
      ['[[Ceci]] est un secret entre nous.', 'demonstratif'],
      ['Ces livres-ci sont à moi, [[ceux-là]] sont à Hugo.', 'demonstratif'],
      ['Le livre [[que]] je lis est passionnant.', 'relatif',
        '« Que » reprend le nom « livre », son antécédent : c’est un pronom relatif.'],
      ['Roxy a un ami [[qui]] habite près de la rivière.', 'relatif',
        '« Qui » reprend le nom « ami », son antécédent : c’est un pronom relatif.'],
      ['Voici la forêt [[où]] vit Roxy.', 'relatif',
        '« Où » reprend le nom « forêt », son antécédent : c’est un pronom relatif.'],
      ['C’est le garçon [[dont]] je t’ai parlé.', 'relatif'],
      ['La cabane dans [[laquelle]] nous jouons est en bois.', 'relatif',
        '« Laquelle » reprend le nom « cabane », son antécédent : c’est un pronom relatif.'],
      ['Le gâteau [[que]] Mamie a préparé sent bon.', 'relatif'],
      ['L’écureuil [[qui]] vit dans ce chêne est très curieux.', 'relatif'],
    ],
    titreLecon: 'Les sortes de pronoms',
    lecon: `
      <p>Un <b>pronom</b> remplace un nom (ou un groupe nominal), pour éviter de le répéter.</p>
      <table>
        <tr><th>sorte</th><th>à quoi il sert</th><th>exemples</th></tr>
        <tr><td><b>personnel</b></td><td>désigne une personne ou remplace un nom</td><td><i>je, tu, il, nous, le, la, les, lui, leur, moi, toi…</i></td></tr>
        <tr><td><b>possessif</b></td><td>remplace un nom et dit à qui il est</td><td><i>le mien, la tienne, le sien, le nôtre, les vôtres, les leurs…</i></td></tr>
        <tr><td><b>démonstratif</b></td><td>montre ce dont on parle, ou remplace un nom en le montrant</td><td><i>celui, celle, ceux, celles (-ci, -là), ceci, cela, ça</i></td></tr>
        <tr><td><b>relatif</b></td><td>reprend un antécédent et introduit une proposition</td><td><i>qui, que, dont, où, lequel, laquelle…</i></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b><br>
        • <b>possessif</b> : remplace-le par « mon… », « ton… » : <i>ce vélo est <u>le mien</u></i> = <i>c’est <u>mon</u> vélo</i>.<br>
        • <b>relatif</b> : il reprend un antécédent (un nom ou un pronom placé avant lui, parfois après une préposition)
        et introduit une proposition : <i>le <b>livre</b> <u>que</u> je lis</i>, <i><b>celle</b> <u>qui</u> gagne</i>,
        <i>la <b>cabane</b> dans <u>laquelle</u> nous jouons</i>.</div>
      <p>⚠️ Devant un verbe, « leur » est un pronom <b>personnel</b> (<i>mes cousins ? je <u>leur</u> écris</i> = j’écris à mes cousins) ;
        « le leur », « les leurs » sont des pronoms <b>possessifs</b>.</p>
    `,
  });

  // ======================================================================
  // 3. Sujet, COD, COI ou attribut ?
  // ======================================================================
  // Pas de complément qui pourrait être circonstanciel, pas de verbe à deux compléments (COS).
  ajouterClassement({
    id: '5e-grammaire-fonctions',
    consigne: 'Quelle est la fonction du {mot} souligné ?',
    categories: {
      sujet: {
        nom: 'sujet',
        regle: 'Le <b>sujet</b> dit qui fait l’action (ou de qui on parle). Il répond à la question '
          + '« Qui est-ce qui… ? » ou « Qu’est-ce qui… ? », et le verbe s’accorde avec lui.',
      },
      cod: {
        nom: 'COD',
        regle: 'Le <b>COD</b> complète le verbe <b>sans préposition</b>. Il répond à la question « verbe + qui ? » ou « verbe + quoi ? ».',
      },
      coi: {
        nom: 'COI',
        regle: 'Le <b>COI</b> complète le verbe <b>avec une préposition</b> (à, de). '
          + 'Il répond à la question « à qui ? », « à quoi ? », « de qui ? » ou « de quoi ? ».',
      },
      attribut: {
        nom: 'attribut du sujet',
        regle: 'L’<b>attribut du sujet</b> suit un verbe d’état (être, sembler, devenir, paraître, rester…) : '
          + 'il donne une caractéristique du sujet.',
      },
    },
    // [phrase, fonction, remarque de Roxy]
    banque: [
      ['[[Des hirondelles]] nichent sous le toit.', 'sujet',
        'Qui est-ce qui niche sous le toit ? → des hirondelles. Ici, « des » est un déterminant, pas une préposition.'],
      ['Dans le terrier dort [[un petit renard]].', 'sujet',
        'Ici, le sujet est placé après le verbe (sujet inversé). Qui est-ce qui dort ? → un petit renard.'],
      ['« Où vas-tu ? » demande [[Mamie]].', 'sujet',
        'Ici, le sujet est placé après le verbe (sujet inversé). Qui est-ce qui demande ? → Mamie.'],
      ['[[Courir]] est le sport préféré de Sami.', 'sujet',
        'Un verbe à l’infinitif peut être sujet. Qu’est-ce qui est le sport préféré de Sami ? → courir.'],
      ['Aimes-[[tu]] les châtaignes ?', 'sujet',
        'Ici, le sujet est placé après le verbe (sujet inversé). Qui est-ce qui aime ? → tu.'],
      ['[[Le chat de la voisine]] dort sur le muret.', 'sujet'],
      ['Le matin, [[mes cousins]] prennent le bus.', 'sujet'],
      ['Au loin brillent [[les lumières du village]].', 'sujet',
        'Ici, le sujet est placé après le verbe (sujet inversé). Qu’est-ce qui brille ? → les lumières du village.'],
      ['Roxy croque [[une pomme]].', 'cod'],
      ['Tom mange [[du pain]] au goûter.', 'cod',
        'Ici, « du » est un déterminant (du pain = une quantité de pain), pas une préposition. Tom mange quoi ? → du pain.'],
      ['Léa cueille [[des mûres]].', 'cod',
        'Ici, « des » est un déterminant (une mûre, des mûres), pas une préposition. Léa cueille quoi ? → des mûres.'],
      ['Cette chanson est belle : Léa [[la]] chante souvent.', 'cod',
        '« La » remplace « cette chanson » : Léa chante quoi ? → la. C’est un COD placé avant le verbe.'],
      ['Les enfants construisent [[une cabane en bois]].', 'cod'],
      ['J’adore [[lire des bandes dessinées]].', 'cod',
        'Un infinitif peut être COD. J’adore quoi ? → lire des bandes dessinées.'],
      ['Mamie [[nous]] invite à dîner.', 'cod',
        '« Nous » est placé avant le verbe. Mamie invite qui ? → nous. C’est un COD.'],
      ['[[Quel livre]] as-tu choisi ?', 'cod',
        'Dans cette question, le COD est placé en tête. Tu as choisi quoi ? → quel livre.'],
      ['Sami a perdu [[ses clés]] ce matin.', 'cod'],
      ['Roxy téléphone [[à sa grand-mère]].', 'coi'],
      ['Tom pense souvent [[à ses vacances]].', 'coi'],
      ['Le chien de Sami [[lui]] obéit toujours.', 'coi',
        '« Lui » = « à Sami » : on obéit <b>à</b> quelqu’un. C’est un COI placé avant le verbe.'],
      ['Zoé se souvient [[de cette journée]].', 'coi'],
      ['Ce vélo appartient [[à mon frère]].', 'coi'],
      ['Mes grands-parents habitent loin : je [[leur]] écris souvent.', 'coi',
        '« Leur » = « à mes grands-parents » : on écrit <b>à</b> quelqu’un. C’est un COI placé avant le verbe.'],
      ['Hugo joue [[du piano]].', 'coi',
        'On dit « jouer <b>de</b> quelque chose » : « du » = « de le ». C’est un COI.'],
      ['Inès rêve [[d’un grand voyage]].', 'coi'],
      ['Roxy est [[rusée]].', 'attribut'],
      ['Ce gâteau semble [[délicieux]].', 'attribut'],
      ['Mon frère deviendra [[pilote]].', 'attribut',
        'Après le verbe d’état « devenir », « pilote » dit ce que sera le sujet : c’est un attribut du sujet.'],
      ['Les feuilles deviennent [[rouges]] en automne.', 'attribut'],
      ['Zoé paraît [[fatiguée]] ce soir.', 'attribut'],
      ['Hugo deviendra [[un grand pianiste]].', 'attribut',
        'Après le verbe d’état « devenir », le groupe nominal « un grand pianiste » dit ce que sera Hugo : c’est un attribut du sujet.'],
      ['La baleine est [[un mammifère]].', 'attribut',
        'Un groupe nominal peut être attribut : après « est », il dit ce qu’est la baleine.'],
      ['Tom restera [[calme]].', 'attribut',
        '« Rester » est ici un verbe d’état : « calme » donne une caractéristique de Tom.'],
    ],
    titreLecon: 'Sujet, COD, COI ou attribut ?',
    lecon: `
      <p>Autour du verbe, chaque groupe a une <b>fonction</b>. Pour la trouver, pose la bonne question :</p>
      <table>
        <tr><th>fonction</th><th>la question</th><th>exemple</th></tr>
        <tr><td><b>sujet</b></td><td>Qui est-ce qui… ? Qu’est-ce qui… ?</td><td><i><u>Roxy</u> mange.</i></td></tr>
        <tr><td><b>COD</b></td><td>verbe + qui ? quoi ? (sans préposition)</td><td><i>Roxy mange <u>une pomme</u>.</i></td></tr>
        <tr><td><b>COI</b></td><td>verbe + à qui ? à quoi ? de qui ? de quoi ?</td><td><i>Roxy parle <u>à Léa</u>.</i></td></tr>
        <tr><td><b>attribut du sujet</b></td><td>après être, sembler, devenir, paraître, rester…</td><td><i>Roxy est <u>rusée</u>.</i></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> méfie-toi de la place des mots !<br>
        • Le sujet peut être <b>après</b> le verbe : <i>« Où vas-tu ? » demande <u>Mamie</u>.</i><br>
        • Le COD et le COI peuvent être des pronoms <b>avant</b> le verbe :
        <i>Léa <u>la</u> chante</i> (COD), <i>Sami <u>lui</u> obéit</i> (COI : obéir <b>à</b> quelqu’un).</div>
      <p>⚠️ Entre le sujet et son attribut, on peut mettre un signe <b>=</b> : <i>Roxy est rusée</i> → Roxy = rusée.
        Avec un COD, c’est impossible : <i>Roxy mange une pomme</i> → Roxy ≠ une pomme.</p>
      <p>⚠️ « du » et « des » ne sont pas toujours des prépositions : dans <i>Tom mange <u>du pain</u></i>,
        « du » est un déterminant, et « du pain » est un <b>COD</b> (Tom mange quoi ?).</p>
    `,
  });

  // ======================================================================
  // 4. Les compléments circonstanciels
  // ======================================================================
  // Cause et but ne se mélangent pas : « à cause de », « grâce à », « par », « faute de » = cause ;
  // « pour » + infinitif, « afin de » = but. Pas de « pour » + nom, qui pourrait être les deux.
  ajouterClassement({
    id: '5e-grammaire-complements-circonstanciels',
    consigne: 'Le {mot} souligné est un complément circonstanciel de…',
    nombreChoix: 4,
    // Les pièges « jumeaux », toujours proposés avec cette réponse (les autres boutons sont tirés au hasard)
    toujoursProposer: cle => ({
      lieu: ['temps'],
      temps: ['lieu'],
      maniere: ['cause'],
      cause: ['but', 'maniere'],
      but: ['cause'],
    })[cle],
    categories: {
      lieu: {
        nom: 'lieu',
        regle: 'Le complément circonstanciel de <b>lieu</b> répond à la question « où ? ».',
      },
      temps: {
        nom: 'temps',
        regle: 'Le complément circonstanciel de <b>temps</b> répond à la question « quand ? ».',
      },
      maniere: {
        nom: 'manière',
        regle: 'Le complément circonstanciel de <b>manière</b> répond à la question « comment ? ».',
      },
      cause: {
        nom: 'cause',
        regle: 'Le complément circonstanciel de <b>cause</b> répond à la question « pour quelle raison ? » : '
          + 'il dit ce qui provoque l’action (à cause de, grâce à, par, faute de…).',
      },
      but: {
        nom: 'but',
        regle: 'Le complément circonstanciel de <b>but</b> répond à la question « dans quel but ? » : '
          + 'il dit ce qu’on veut obtenir (pour, afin de…).',
      },
    },
    // [phrase, circonstance, remarque de Roxy]
    banque: [
      ['Roxy se cache [[derrière un grand chêne]].', 'lieu'],
      ['Les canards nagent [[sur l’étang]].', 'lieu'],
      ['Nous pique-niquerons [[au bord de la rivière]].', 'lieu'],
      ['[[Ici]], les champignons poussent très vite.', 'lieu',
        'Un adverbe peut être complément circonstanciel. Où les champignons poussent-ils ? → ici.'],
      ['Les enfants jouent [[dans la cour]].', 'lieu'],
      ['Mamie a planté des tulipes [[devant la maison]].', 'lieu'],
      ['[[Hier]], nous avons ramassé des châtaignes.', 'temps',
        'Un adverbe peut être complément circonstanciel. Quand avons-nous ramassé des châtaignes ? → hier.'],
      ['Roxy se réveille [[au lever du soleil]].', 'temps'],
      ['[[Pendant les vacances]], Léa a appris à nager.', 'temps'],
      ['Nous goûterons [[à quatre heures]].', 'temps'],
      ['[[Chaque matin]], Sami promène son chien.', 'temps'],
      ['Les hirondelles reviendront [[au printemps]].', 'temps'],
      ['Tom lit une histoire [[avant de dormir]].', 'temps',
        'Quand Tom lit-il une histoire ? → avant de dormir. « Avant de » indique le temps.'],
      ['Le chat s’approche [[sans bruit]].', 'maniere'],
      ['La tortue avance [[lentement]].', 'maniere'],
      ['Zoé a répondu [[avec politesse]].', 'maniere'],
      ['Les élèves travaillent [[en silence]].', 'maniere'],
      ['Roxy traverse le pont [[prudemment]].', 'maniere'],
      ['Hugo a ouvert son cadeau [[avec impatience]].', 'maniere'],
      ['Inès chante [[à voix basse]].', 'maniere'],
      ['Le match est annulé [[à cause de la pluie]].', 'cause'],
      ['[[Grâce au beau temps]], nous avons pu pique-niquer.', 'cause',
        '« Grâce à » introduit une cause (une bonne cause !) : c’est parce qu’il faisait beau que nous avons pu pique-niquer.'],
      ['Le petit lapin tremble [[de froid]].', 'cause',
        '« De froid » donne la raison : le lapin tremble parce qu’il a froid.'],
      ['Tom a mangé tout le gâteau [[par gourmandise]].', 'cause',
        'Pour quelle raison Tom a-t-il tout mangé ? → parce qu’il est gourmand.'],
      ['Inès n’a rien dit [[par timidité]].', 'cause',
        'Pour quelle raison Inès n’a-t-elle rien dit ? → parce qu’elle est timide.'],
      ['[[Faute de temps]], nous n’avons pas terminé la partie.', 'cause',
        '« Faute de temps » = parce que nous n’avions pas assez de temps : c’est une cause.'],
      ['[[À cause du vent]], la porte a claqué.', 'cause'],
      ['Roxy se lève tôt [[pour cueillir des champignons]].', 'but',
        '« Pour » + infinitif : Roxy veut cueillir des champignons. C’est ce qu’elle cherche à obtenir.'],
      ['Sami s’entraîne [[afin de gagner la course]].', 'but'],
      ['Nous parlons bas [[pour ne pas réveiller le bébé]].', 'but'],
      ['[[Pour attraper le bus]], Tom court très vite.', 'but',
        'Dans quel but Tom court-il ? → pour attraper le bus. C’est ce qu’il veut obtenir.'],
      ['Mamie met ses lunettes [[afin de mieux lire]].', 'but'],
      ['Papi a construit un nichoir [[pour accueillir les mésanges]].', 'but'],
      ['Hugo se couche tôt [[afin d’être en forme demain]].', 'but'],
    ],
    titreLecon: 'Les compléments circonstanciels',
    lecon: `
      <p>Le <b>complément circonstanciel</b> (CC) précise les circonstances de l’action.
        En général, on peut le <b>déplacer</b> ou le <b>supprimer</b>.</p>
      <table>
        <tr><th>CC de…</th><th>la question</th><th>exemples</th></tr>
        <tr><td><b>lieu</b></td><td>où ?</td><td><i>dans la cour, sur l’étang, ici</i></td></tr>
        <tr><td><b>temps</b></td><td>quand ?</td><td><i>hier, au printemps, avant de dormir</i></td></tr>
        <tr><td><b>manière</b></td><td>comment ?</td><td><i>lentement, avec soin, sans bruit</i></td></tr>
        <tr><td><b>cause</b></td><td>pour quelle raison ?</td><td><i>à cause de la pluie, grâce au beau temps, de froid</i></td></tr>
        <tr><td><b>but</b></td><td>dans quel but ?</td><td><i>pour gagner, afin de réussir</i></td></tr>
      </table>
      <p>Un CC peut être un groupe nominal (<i>chaque matin</i>), un groupe prépositionnel (<i>dans la cour</i>),
        un adverbe (<i>lentement</i>) ou un infinitif avec une préposition (<i>pour gagner</i>).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> ne confonds pas la cause et le but !<br>
        La <b>cause</b>, c’est la raison qui a provoqué l’action : <i>Le lapin tremble <u>de froid</u>.</i><br>
        Le <b>but</b>, c’est ce qu’on veut obtenir : <i>Tom court <u>pour attraper le bus</u>.</i></div>
    `,
  });

  // ======================================================================
  // 5. Phrase simple ou complexe ?
  // ======================================================================
  // Toute la phrase est à classer (pas de souligné). La remarque compte les verbes conjugués.
  ajouterClassement({
    id: '5e-grammaire-phrase-complexe',
    consigne: 'Cette phrase est-elle simple ou complexe ?',
    categories: {
      simple: {
        nom: 'phrase simple',
        regle: 'Une phrase <b>simple</b> n’a qu’<b>un seul verbe conjugué</b> : elle ne contient qu’une proposition.',
      },
      complexe: {
        nom: 'phrase complexe',
        regle: 'Une phrase <b>complexe</b> a <b>plusieurs verbes conjugués</b> : '
          + 'elle contient autant de propositions que de verbes conjugués.',
      },
    },
    // [phrase, simple ou complexe, les verbes conjugués comptés par Roxy]
    banque: [
      ['Roxy a mangé toutes les mûres du buisson.', 'simple',
        'Un seul verbe conjugué : <b>a mangé</b>. Un temps composé compte pour un seul verbe.'],
      ['Je veux partir en vacances à la mer.', 'simple',
        'Un seul verbe conjugué : <b>veux</b>. « Partir » est à l’infinitif : il ne compte pas.'],
      ['Pendant les longues soirées d’hiver, Mamie tricote de jolies écharpes pour toute la famille.', 'simple',
        'Elle est longue, mais elle n’a qu’un seul verbe conjugué : <b>tricote</b>.'],
      ['Les enfants, fatigués par la randonnée, dorment déjà.', 'simple',
        'Un seul verbe conjugué : <b>dorment</b>. « Fatigués » est un participe passé employé seul : il ne compte pas.'],
      ['En sortant de l’école, Tom a rencontré son cousin.', 'simple',
        'Un seul verbe conjugué : <b>a rencontré</b>. « En sortant » est un gérondif : il ne compte pas.'],
      ['Le petit renard et sa mère traversent la rivière.', 'simple',
        'Deux sujets, mais un seul verbe conjugué : <b>traversent</b>.'],
      ['Sami aime lire, dessiner et jouer au football.', 'simple',
        'Un seul verbe conjugué : <b>aime</b>. « Lire », « dessiner » et « jouer » sont des infinitifs.'],
      ['Hier soir, nous sommes allés au cinéma avec nos cousins.', 'simple',
        'Un seul verbe conjugué : <b>sommes allés</b>. Un temps composé compte pour un seul verbe.'],
      ['Le vent a fait tomber toutes les pommes du verger.', 'simple',
        'Un seul verbe conjugué : <b>a fait</b>. « Tomber » est à l’infinitif : il ne compte pas.'],
      ['Range ta chambre avant le dîner.', 'simple',
        'Un seul verbe conjugué : <b>Range</b>, à l’impératif.'],
      ['Les élèves de la classe de Léa ont préparé un spectacle pour la fête de l’école.', 'simple',
        'Elle est longue, mais elle n’a qu’un seul verbe conjugué : <b>ont préparé</b>.'],
      ['Roxy se promène dans la forêt en chantant.', 'simple',
        'Un seul verbe conjugué : <b>se promène</b>. « En chantant » est un gérondif : il ne compte pas.'],
      ['Tom est parti sans dire au revoir.', 'simple',
        'Un seul verbe conjugué : <b>est parti</b>. « Dire » est à l’infinitif : il ne compte pas.'],
      ['Chaque automne, les écureuils cachent des noisettes sous les feuilles mortes.', 'simple',
        'Un seul verbe conjugué : <b>cachent</b>.'],
      ['Au bord de l’étang, un vieux crapaud attendait patiemment le retour du printemps.', 'simple',
        'Elle est longue, mais elle n’a qu’un seul verbe conjugué : <b>attendait</b>.'],
      ['Il pleut, je reste à la maison.', 'complexe',
        'Elle est courte, mais elle a deux verbes conjugués : <b>pleut</b> et <b>reste</b>. Deux propositions !'],
      ['Roxy court et Tom saute.', 'complexe',
        'Elle est courte, mais elle a deux verbes conjugués : <b>court</b> et <b>saute</b>. Deux propositions !'],
      ['Le chat dort pendant que la souris danse.', 'complexe',
        'Deux verbes conjugués : <b>dort</b> et <b>danse</b>. Deux propositions.'],
      ['Je pense que tu as raison.', 'complexe',
        'Deux verbes conjugués : <b>pense</b> et <b>as</b>. Deux propositions.'],
      ['Tom mange une pomme, Léa boit un jus d’orange.', 'complexe',
        'Deux verbes conjugués : <b>mange</b> et <b>boit</b>. Deux propositions.'],
      ['Quand la nuit tombe, les chouettes se réveillent.', 'complexe',
        'Deux verbes conjugués : <b>tombe</b> et <b>se réveillent</b>. Deux propositions.'],
      ['Le livre que tu m’as prêté est passionnant.', 'complexe',
        'Deux verbes conjugués : <b>as prêté</b> et <b>est</b>. Deux propositions.'],
      ['Sami voulait venir, mais il était malade.', 'complexe',
        'Deux verbes conjugués : <b>voulait</b> et <b>était</b>. « Venir » est à l’infinitif : il ne compte pas.'],
      ['Viens vite, le goûter est prêt !', 'complexe',
        'Deux verbes conjugués : <b>Viens</b> (à l’impératif) et <b>est</b>. Deux propositions.'],
      ['Je sais qui a mangé les cerises.', 'complexe',
        'Deux verbes conjugués : <b>sais</b> et <b>a mangé</b>. Deux propositions.'],
      ['Mamie cuisine, Papi met la table et les enfants jouent.', 'complexe',
        'Trois verbes conjugués : <b>cuisine</b>, <b>met</b> et <b>jouent</b>. Trois propositions !'],
      ['Si tu as faim, prends une pomme.', 'complexe',
        'Deux verbes conjugués : <b>as</b> et <b>prends</b> (à l’impératif). Deux propositions.'],
      ['Elle chante quand elle est heureuse.', 'complexe',
        'Deux verbes conjugués : <b>chante</b> et <b>est</b>. Deux propositions.'],
      ['Il faut que tu viennes.', 'complexe',
        'Elle est courte, mais elle a deux verbes conjugués : <b>faut</b> et <b>viennes</b> (au subjonctif).'],
      ['Nous avons ri, car le clown était drôle.', 'complexe',
        'Deux verbes conjugués : <b>avons ri</b> et <b>était</b>. Deux propositions.'],
    ],
    titreLecon: 'Phrase simple ou complexe ?',
    lecon: `
      <p>Une <b>proposition</b> est un groupe de mots construit autour d’un <b>verbe conjugué</b>.</p>
      <p>• La phrase <b>simple</b> a <b>un seul</b> verbe conjugué : <i>Roxy <b>mange</b> une pomme.</i><br>
         • La phrase <b>complexe</b> en a <b>plusieurs</b> : <i>Roxy <b>mange</b> une pomme, Tom <b>boit</b> du lait.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> compte les verbes conjugués.
        Autant de verbes conjugués, autant de propositions !</div>
      <h4>Ce qui ne compte pas</h4>
      <p>• l’<b>infinitif</b> : <i>Je veux <u>partir</u>.</i> (un seul verbe conjugué : veux)<br>
         • le <b>participe</b> employé seul : <i>Les enfants, <u>fatigués</u>, dorment.</i><br>
         • le <b>gérondif</b> : <i>Roxy se promène <u>en chantant</u>.</i></p>
      <p>⚠️ Un temps composé compte pour <b>un seul</b> verbe conjugué : <i>Il <b>a mangé</b>.</i>
        Et attention : une phrase longue peut être simple, et une phrase courte peut être complexe (<i>Roxy <b>court</b> et Tom <b>saute</b></i>).</p>
    `,
  });

  // ======================================================================
  // 6. Juxtaposées, coordonnées ou subordonnées ?
  // ======================================================================
  // Uniquement des phrases à DEUX propositions, reliées d'une seule façon.
  ajouterClassement({
    id: '5e-grammaire-propositions',
    consigne: 'Comment les deux propositions sont-elles reliées ?',
    categories: {
      juxtaposition: {
        nom: 'juxtaposition',
        regle: 'Des propositions <b>juxtaposées</b> sont séparées par un signe de ponctuation '
          + '(virgule, point-virgule, deux-points), sans mot de liaison.',
      },
      coordination: {
        nom: 'coordination',
        regle: 'Des propositions <b>coordonnées</b> sont reliées par une conjonction de coordination : mais, ou, et, or, ni, car.',
      },
      subordination: {
        nom: 'subordination',
        regle: 'Une proposition <b>subordonnée</b> dépend de la proposition principale : '
          + 'elle commence par un mot subordonnant (qui, que, où, quand, si, parce que…).',
      },
    },
    // [phrase, façon de relier, le signe ou le mot qui relie]
    banque: [
      ['Il pleut, Roxy reste dans son terrier.', 'juxtaposition',
        'Le signe qui relie : une <b>virgule</b>, sans mot de liaison.'],
      ['Le soleil se lève ; les oiseaux commencent à chanter.', 'juxtaposition',
        'Le signe qui relie : un <b>point-virgule</b>, sans mot de liaison.'],
      ['Tom est ravi : il a gagné la course.', 'juxtaposition',
        'Le signe qui relie : les <b>deux-points</b>, sans mot de liaison.'],
      ['Zoé lit, Hugo dessine.', 'juxtaposition',
        'Le signe qui relie : une <b>virgule</b>, sans mot de liaison.'],
      ['Je suis fatigué, je vais me coucher.', 'juxtaposition',
        'Le signe qui relie : une <b>virgule</b>, sans mot de liaison.'],
      ['Le vent souffle ; les feuilles s’envolent.', 'juxtaposition',
        'Le signe qui relie : un <b>point-virgule</b>, sans mot de liaison.'],
      ['Ne fais pas de bruit : le bébé dort.', 'juxtaposition',
        'Le signe qui relie : les <b>deux-points</b>, sans mot de liaison.'],
      ['La cloche sonne, les élèves sortent de la classe.', 'juxtaposition',
        'Le signe qui relie : une <b>virgule</b>, sans mot de liaison.'],
      ['Écoute bien : Roxy va te raconter une histoire.', 'juxtaposition',
        'Le signe qui relie : les <b>deux-points</b>, sans mot de liaison.'],
      ['Mamie prépare une tarte ; toute la maison sent la pomme.', 'juxtaposition',
        'Le signe qui relie : un <b>point-virgule</b>, sans mot de liaison.'],
      ['Roxy voulait sortir, mais il pleuvait.', 'coordination',
        'Le mot qui relie : <b>mais</b>, une conjonction de coordination. La virgule ne change rien.'],
      ['Tom range sa chambre et Léa fait ses devoirs.', 'coordination',
        'Le mot qui relie : <b>et</b>, une conjonction de coordination.'],
      ['Je reste à la maison car je suis malade.', 'coordination',
        'Le mot qui relie : <b>car</b>, une conjonction de coordination.'],
      ['Tu viens avec nous ou tu restes ici ?', 'coordination',
        'Le mot qui relie : <b>ou</b>, une conjonction de coordination.'],
      ['Sami a couru très vite, mais il a perdu la course.', 'coordination',
        'Le mot qui relie : <b>mais</b>, une conjonction de coordination. La virgule ne change rien.'],
      ['Le chat miaule et le chien aboie.', 'coordination',
        'Le mot qui relie : <b>et</b>, une conjonction de coordination.'],
      ['Prends ton manteau, car il fait froid.', 'coordination',
        'Le mot qui relie : <b>car</b>, une conjonction de coordination. La virgule ne change rien.'],
      ['Veux-tu jouer dehors ou préfères-tu lire ?', 'coordination',
        'Le mot qui relie : <b>ou</b>, une conjonction de coordination.'],
      ['Mamie a préparé un gâteau et Papi a acheté des bougies.', 'coordination',
        'Le mot qui relie : <b>et</b>, une conjonction de coordination.'],
      ['Hugo n’aime pas le chou, mais il adore les carottes.', 'coordination',
        'Le mot qui relie : <b>mais</b>, une conjonction de coordination. La virgule ne change rien.'],
      ['Quand la nuit tombe, les chouettes se réveillent.', 'subordination',
        'Le mot qui relie : <b>quand</b>, une conjonction de subordination. '
          + 'La proposition « quand la nuit tombe » ne peut pas former une phrase toute seule.'],
      ['Je pense que tu as raison.', 'subordination',
        'Le mot qui relie : <b>que</b>, une conjonction de subordination. La subordonnée « que tu as raison » complète le verbe « pense ».'],
      ['Le livre que tu lis est passionnant.', 'subordination',
        'Le mot qui relie : <b>que</b>, un pronom relatif. La subordonnée « que tu lis » complète le nom « livre ».'],
      ['Roxy a un ami qui habite près de la rivière.', 'subordination',
        'Le mot qui relie : <b>qui</b>, un pronom relatif. La subordonnée « qui habite près de la rivière » complète le nom « ami ».'],
      ['Si tu veux, nous irons au parc.', 'subordination',
        'Le mot qui relie : <b>si</b>, une conjonction de subordination.'],
      ['Tom est content parce qu’il a eu une bonne note.', 'subordination',
        'Le mot qui relie : <b>parce que</b> (écrit « parce qu’ » devant « il »), une conjonction de subordination.'],
      ['Zoé sourit quand elle voit son chat.', 'subordination',
        'Le mot qui relie : <b>quand</b>, une conjonction de subordination.'],
      ['Je sais où Roxy cache ses noisettes.', 'subordination',
        'Le mot qui relie : <b>où</b>, un mot subordonnant. La subordonnée « où Roxy cache ses noisettes » complète le verbe « sais ».'],
      ['Mamie veut que nous rentrions avant la nuit.', 'subordination',
        'Le mot qui relie : <b>que</b>, une conjonction de subordination.'],
      ['Puisque tu insistes, je viens avec toi.', 'subordination',
        'Le mot qui relie : <b>puisque</b>, une conjonction de subordination.'],
    ],
    titreLecon: 'Juxtaposées, coordonnées ou subordonnées ?',
    lecon: `
      <p>Dans une phrase complexe, les propositions peuvent être reliées de <b>trois façons</b> :</p>
      <table>
        <tr><th>propositions</th><th>reliées par…</th><th>exemple</th></tr>
        <tr><td><b>juxtaposées</b></td><td>la ponctuation seule (virgule, point-virgule, deux-points)</td><td><i>Il pleut<b>,</b> je reste ici.</i></td></tr>
        <tr><td><b>coordonnées</b></td><td>mais, ou, et, or, ni, car</td><td><i>Il pleut<b>, mais</b> je sors.</i></td></tr>
        <tr><td><b>subordonnées</b></td><td>qui, que, où, quand, si, parce que…</td><td><i>Je reste ici <b>parce qu’</b>il pleut.</i></td></tr>
      </table>
      <p>La proposition <b>subordonnée</b> dépend d’une autre, la proposition <b>principale</b> :
        elle ne peut pas former une phrase toute seule (<i>« Parce qu’il pleut. »</i> ✘).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> cherche ce qui relie les deux propositions.<br>
        Aucun mot, seulement une virgule, un point-virgule ou deux-points → <b>juxtaposition</b>.<br>
        Mais, ou, et, or, ni, car → <b>coordination</b>.<br>
        Qui, que, où, quand, si, parce que… → <b>subordination</b>.</div>
      <p>⚠️ Une virgule devant « mais » ou « car » ne change rien : c’est la conjonction qui relie → <b>coordination</b>.</p>
    `,
  });
})();
