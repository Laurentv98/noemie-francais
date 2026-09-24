// Renard Malin — Grammaire, niveau 6e : les 8 étapes de la Colline de la Grammaire
//
// Les phrases sont écrites à la main. Le mot ou le groupe à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement } = RM.phrases;

  // ======================================================================
  // 1. Les types de phrases
  // ======================================================================
  ajouterClassement({
    id: '6e-grammaire-types-phrases',
    consigne: 'Quel est le type de cette phrase ?',
    categories: {
      declarative: {
        nom: 'déclarative',
        regle: 'Une phrase <b>déclarative</b> donne une information. Elle se termine le plus souvent par un point.',
      },
      interrogative: {
        nom: 'interrogative',
        regle: 'Une phrase <b>interrogative</b> pose une question. Elle se termine par un point d’interrogation (?).',
      },
      exclamative: {
        nom: 'exclamative',
        regle: 'Une phrase <b>exclamative</b> exprime une émotion forte : la joie, la surprise, la colère… '
          + 'Elle se termine par un point d’exclamation (!).',
      },
      imperative: {
        nom: 'impérative',
        regle: 'Une phrase <b>impérative</b> donne un ordre ou un conseil. Son verbe est souvent à l’impératif, sans sujet.',
      },
    },
    // [phrase, type, remarque de Roxy pour les phrases qui piègent]
    banque: [
      ['Roxy habite dans la forêt.', 'declarative'],
      ['Le soleil se lève à l’est.', 'declarative'],
      ['Mon frère n’aime pas les épinards.', 'declarative', 'Même à la forme négative, elle donne une information.'],
      ['Les hirondelles reviennent au printemps.', 'declarative'],
      ['Je me demande où tu étais.', 'declarative', 'Elle parle d’une question, mais elle n’en pose pas : il n’y a pas de point d’interrogation.'],
      ['Nous partirons en vacances demain.', 'declarative'],
      ['Il pleut depuis ce matin.', 'declarative'],
      ['Où as-tu caché le trésor ?', 'interrogative'],
      ['Est-ce que tu viens jouer ?', 'interrogative'],
      ['Tu as fini tes devoirs ?', 'interrogative', 'Il n’y a pas de mot interrogatif, mais le point d’interrogation montre qu’on pose une question.'],
      ['Quel âge as-tu ?', 'interrogative'],
      ['Pourquoi le ciel est-il bleu ?', 'interrogative'],
      ['Qui a mangé mes cerises ?', 'interrogative'],
      ['Comment s’appelle ton chat ?', 'interrogative'],
      ['Quelle belle journée !', 'exclamative'],
      ['Comme tu as grandi !', 'exclamative'],
      ['Que ce gâteau est bon !', 'exclamative'],
      ['Quelle chance nous avons !', 'exclamative'],
      ['Quel courage tu as eu !', 'exclamative'],
      ['Comme la mer est belle ce soir !', 'exclamative'],
      ['Qu’il fait chaud aujourd’hui !', 'exclamative'],
      ['Range ta chambre, s’il te plaît.', 'imperative'],
      ['Ferme la porte !', 'imperative', 'Il y a un point d’exclamation, mais la phrase donne un ordre : elle est impérative.'],
      ['Prenons le chemin de la rivière.', 'imperative'],
      ['Ne touchez pas à ce champignon !', 'imperative', 'C’est un ordre (ou un conseil) : ne pas toucher au champignon.'],
      ['Écoute bien la consigne.', 'imperative'],
      ['Viens voir, Roxy !', 'imperative'],
      ['Mettez vos bottes avant de sortir.', 'imperative'],
    ],
    titreLecon: 'Les types de phrases',
    lecon: `
      <p>Une phrase commence par une <b>majuscule</b> et se termine par un <b>point</b> (. ou ? ou !).
        Selon ce qu’elle veut dire, elle a un <b>type</b> :</p>
      <table>
        <tr><th>type</th><th>à quoi elle sert</th><th>exemple</th></tr>
        <tr><td><b>déclarative</b></td><td>donner une information</td><td>Roxy dort<b>.</b></td></tr>
        <tr><td><b>interrogative</b></td><td>poser une question</td><td>Où dort Roxy <b>?</b></td></tr>
        <tr><td><b>exclamative</b></td><td>exprimer une émotion</td><td>Comme Roxy dort bien <b>!</b></td></tr>
        <tr><td><b>impérative</b></td><td>donner un ordre, un conseil</td><td>Dors, Roxy<b>.</b> (ou <b>!</b>)</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le point d’exclamation ne suffit pas !
        « Ferme la porte ! » donne un ordre : c’est une phrase <b>impérative</b>.
        « Quelle belle porte ! » exprime une émotion : c’est une phrase <b>exclamative</b>.</div>
      <p>La phrase exclamative commence souvent par <b>quel</b>, <b>comme</b> ou <b>que</b> :
        <i>Quelle chance ! Comme c’est beau ! Que tu es drôle !</i></p>
      <p>On dit aussi « phrase <b>injonctive</b> » pour la phrase impérative.</p>
      <p>Certains livres disent que l’exclamation est une <b>forme</b> de phrase, qui peut s’ajouter à un autre type :
        ici, on garde les quatre types.</p>
    `,
  });

  // Le mot ou le groupe souligné d'une phrase de la banque : « Roxy [[dort]]. » → « dort »
  const motSouligne = texte => RM.phrases.groupeSouligne(texte);

  // ======================================================================
  // 2. La nature des mots
  // ======================================================================
  ajouterClassement({
    id: '6e-grammaire-nature-mots',
    consigne: 'Quelle est la nature du {mot} souligné ?',
    categories: {
      nom: {
        nom: 'nom',
        regle: 'Un <b>nom</b> désigne une personne, un animal, une chose ou une idée. On peut mettre un déterminant devant : '
          + '<i>un renard, la joie</i>.',
      },
      verbe: {
        nom: 'verbe',
        regle: 'Un <b>verbe</b> dit ce que fait le sujet, ou ce qu’il est. Il se conjugue : on peut changer son temps '
          + '(<i>il marche → il marchait</i>).',
      },
      adjectif: {
        nom: 'adjectif',
        regle: 'Un <b>adjectif</b> décrit un nom et s’accorde avec lui. On peut souvent ajouter « très » devant : '
          + '<i>une queue très touffue</i>.',
      },
      determinant: {
        nom: 'déterminant',
        regle: 'Un <b>déterminant</b> se place devant le nom et l’annonce : <i>le, la, les, un, une, des, mon, ce, chaque…</i>',
      },
    },
    // [phrase avec le mot souligné, nature, remarque de Roxy pour les mots qui piègent]
    banque: [
      ['Roxy fait une longue [[marche]] dans la forêt.', 'nom',
        'Il y a un déterminant devant (« une longue marche ») : c’est un nom. Ne le confonds pas avec le verbe : <i>il marche</i>.'],
      ['Nous avons appris une nouvelle [[danse]].', 'nom',
        'On peut dire « une danse » : c’est un nom. Le verbe serait : <i>elle danse</i>.'],
      ['Le [[bleu]] est ma couleur préférée.', 'nom',
        'Ici, « bleu » a le déterminant « le » devant lui : c’est le nom d’une couleur.'],
      ['Le [[vol]] des oies sauvages est magnifique.', 'nom',
        'Il y a le déterminant « le » devant : c’est un nom. Le verbe serait : <i>les oies volent</i>.'],
      ['Le [[renard]] dort dans son terrier.', 'nom'],
      ['La [[joie]] de Léa fait plaisir à voir.', 'nom', 'Un nom peut aussi désigner une idée ou un sentiment : la joie, la peur…'],
      ['Tom range ses [[crayons]] dans sa trousse.', 'nom'],
      ['Roxy entend un [[bruit]] étrange.', 'nom'],
      ['Mon petit frère [[marche]] depuis un mois.', 'verbe',
        'Ici, « marche » se conjugue : <i>il marchait, il marchera</i>. C’est un verbe (le nom serait : <i>la marche</i>).'],
      ['Zoé [[danse]] dans la cour.', 'verbe', 'On peut changer le temps : <i>Zoé dansait</i>. C’est un verbe.'],
      ['Les oies sauvages [[volent]] vers le sud.', 'verbe'],
      ['Roxy [[cache]] ses noisettes sous une pierre.', 'verbe', 'On peut dire : <i>Roxy cachait ses noisettes</i>. C’est un verbe.'],
      ['Le soleil [[brille]] dans le ciel.', 'verbe'],
      ['Hugo [[est]] très bavard.', 'verbe',
        '« est », c’est le verbe <b>être</b> : il ne dit pas une action, mais un état. Il se conjugue : <i>Hugo était bavard</i>.'],
      ['Nous [[mangeons]] des pommes au goûter.', 'verbe'],
      ['Le chat [[semble]] content.', 'verbe', '« semble », c’est le verbe <b>sembler</b> : <i>le chat semblait content</i>.'],
      ['Le ciel est [[bleu]] aujourd’hui.', 'adjectif',
        'Même placé après le verbe « est », « bleu » décrit le ciel : c’est un adjectif (<i>le ciel est très bleu</i>).'],
      ['Roxy a une queue [[touffue]].', 'adjectif'],
      ['Une [[petite]] souris grignote un biscuit.', 'adjectif'],
      ['Mon chien est très [[gentil]].', 'adjectif',
        'Relié au nom « chien » par le verbe « est », il le décrit : c’est un adjectif.'],
      ['Léa porte une robe [[verte]].', 'adjectif'],
      ['Nous habitons dans une [[grande]] maison.', 'adjectif'],
      ['Cette histoire est vraiment [[drôle]].', 'adjectif'],
      ['Roxy a trouvé un champignon [[bizarre]].', 'adjectif'],
      ['[[Les]] hirondelles reviennent au printemps.', 'determinant'],
      ['Tom a perdu [[son]] bonnet.', 'determinant', '« son » est placé devant le nom « bonnet » : c’est un déterminant.'],
      ['Regarde [[ce]] papillon !', 'determinant'],
      ['Roxy croque [[une]] pomme.', 'determinant'],
      ['J’ai invité [[mes]] amis.', 'determinant'],
      ['[[Chaque]] matin, Hugo promène son chien.', 'determinant',
        '« Chaque » est placé devant le nom « matin » : c’est un déterminant.'],
      ['Il y a [[des]] nuages dans le ciel.', 'determinant'],
      ['Mamie a cueilli [[quelques]] fraises.', 'determinant'],
    ],
    titreLecon: 'La nature des mots',
    lecon: `
      <p>Chaque mot a une <b>nature</b> (on dit aussi une <b>classe grammaticale</b>). Voici quatre natures très importantes :</p>
      <table>
        <tr><th>nature</th><th>à quoi il sert</th><th>exemples</th></tr>
        <tr><td><b>nom</b></td><td>désigne une personne, un animal, une chose, une idée</td><td>Roxy, un renard, la joie</td></tr>
        <tr><td><b>verbe</b></td><td>dit ce que fait le sujet, ou ce qu’il est ; il se conjugue</td><td>Roxy court. Elle est rusée.</td></tr>
        <tr><td><b>adjectif</b></td><td>décrit un nom et s’accorde avec lui</td><td>une queue touffue</td></tr>
        <tr><td><b>déterminant</b></td><td>se place devant le nom et l’annonce</td><td>le, une, des, mes, ce, chaque</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un même mot peut changer de nature ! Regarde ses voisins.<br>
        <i><u>la</u> marche</i> → un déterminant devant : c’est un <b>nom</b>.<br>
        <i><u>il</u> marche</i> → on peut dire « il marchait » : c’est un <b>verbe</b>.</div>
      <p>⚠️ L’adjectif n’est pas toujours collé au nom : dans <i>Le ciel est <b>bleu</b></i>, « bleu » décrit le ciel,
        c’est un adjectif. Pour le reconnaître, essaie d’ajouter « très » : <i>le ciel est très bleu</i>.</p>
    `,
  });

  // ======================================================================
  // 3. Le sujet du verbe
  // ======================================================================
  // [phrase avec le verbe souligné, le sujet, les pièges (d'autres groupes de la même phrase,
  //  jamais un morceau du sujet), le test « c'est… qui » (le sujet entre [[ ]]), remarque de Roxy]
  const INVERSE = 'Ici, le sujet est placé <b>après</b> le verbe : on dit qu’il est <b>inversé</b>.';
  const SUJETS = [
    // Un nom propre ou un groupe nominal court
    ['Léa [[offre]] un livre à Tom.', 'Léa', ['un livre', 'Tom'], 'C’est [[Léa]] qui offre un livre.'],
    ['Le facteur [[apporte]] un colis à Inès.', 'le facteur', ['un colis', 'Inès'], 'C’est [[le facteur]] qui apporte un colis.'],
    ['Roxy [[cherche]] des mûres avec Hugo.', 'Roxy', ['des mûres', 'Hugo'], 'C’est [[Roxy]] qui cherche des mûres.',
      '« avec Hugo » n’est pas le sujet : Hugo accompagne Roxy. Si Hugo était sujet lui aussi, on dirait « Roxy et Hugo cherchent ».'],
    ['Mon oncle [[répare]] le vélo de Zoé dans le garage.', 'mon oncle', ['le vélo de Zoé', 'le garage'],
      'C’est [[mon oncle]] qui répare le vélo.'],
    ['Ce matin, le ciel [[est]] tout gris.', 'le ciel', ['ce matin', 'tout gris'], 'C’est [[le ciel]] qui est tout gris.'],
    ['Au goûter, les enfants [[boivent]] du chocolat chaud.', 'les enfants', ['au goûter', 'du chocolat chaud'],
      'Ce sont [[les enfants]] qui boivent du chocolat.'],
    ['Tous les jours, ma tante [[arrose]] ses fleurs.', 'ma tante', ['tous les jours', 'ses fleurs'],
      'C’est [[ma tante]] qui arrose ses fleurs.'],
    // Un groupe nominal long
    ['Les renards de la forêt [[chassent]] les souris pendant la nuit.', 'les renards de la forêt', ['les souris', 'la nuit'],
      'Ce sont [[les renards de la forêt]] qui chassent.', 'Le sujet, c’est tout le groupe, pas seulement « les renards ».'],
    ['Les élèves de la classe de Zoé [[préparent]] un spectacle pour Noël.', 'les élèves de la classe de Zoé',
      ['un spectacle', 'Noël'], 'Ce sont [[les élèves de la classe de Zoé]] qui préparent un spectacle.'],
    ['Le chien de la voisine [[aboie]] après le facteur tous les matins.', 'le chien de la voisine',
      ['le facteur', 'tous les matins'], 'C’est [[le chien de la voisine]] qui aboie.'],
    ['En automne, les feuilles du grand érable [[tombent]] sur la pelouse.', 'les feuilles du grand érable',
      ['en automne', 'la pelouse'], 'Ce sont [[les feuilles du grand érable]] qui tombent.'],
    ['Le vieux pommier du jardin [[donne]] de belles pommes chaque année.', 'le vieux pommier du jardin',
      ['de belles pommes', 'chaque année'], 'C’est [[le vieux pommier du jardin]] qui donne de belles pommes.'],
    // Un sujet inversé (placé après le verbe)
    ['Chaque soir, dans la clairière, [[dansent]] les lucioles.', 'les lucioles', ['chaque soir', 'la clairière'],
      'Ce sont [[les lucioles]] qui dansent.', INVERSE],
    ['Ce soir, derrière les nuages, [[apparaît]] la lune.', 'la lune', ['ce soir', 'les nuages'],
      'C’est [[la lune]] qui apparaît.', INVERSE],
    ['Dans la mare de la ferme [[nagent]] trois petits canards.', 'trois petits canards', ['la mare', 'la ferme'],
      'Ce sont [[trois petits canards]] qui nagent.', INVERSE],
    ['Dans le grand chêne, près de la rivière, [[chante]] un merle.', 'un merle', ['le grand chêne', 'la rivière'],
      'C’est [[un merle]] qui chante.', INVERSE],
    // Un sujet éloigné du verbe
    ['Mon cousin, avec ses amis, [[construit]] une cabane.', 'mon cousin', ['ses amis', 'une cabane'],
      'C’est [[mon cousin]] qui construit une cabane.',
      '« avec ses amis » sépare le sujet du verbe, mais ce n’est pas le sujet : ses amis accompagnent mon cousin. '
        + 'S’ils étaient sujets eux aussi, on dirait « Mon cousin et ses amis construisent ».'],
    ['Le chat de Zoé, chaque matin, [[attend]] le facteur.', 'le chat de Zoé', ['chaque matin', 'le facteur'],
      'C’est [[le chat de Zoé]] qui attend le facteur.', 'Le sujet est séparé du verbe par « chaque matin ».'],
    ['Hugo, après l’école, [[joue]] au football avec Sami.', 'Hugo', ['l’école', 'Sami'],
      'C’est [[Hugo]] qui joue au football.', 'Le sujet est séparé du verbe par « après l’école ».'],
    ['Les hirondelles, à l’automne, [[partent]] vers l’Afrique.', 'les hirondelles', ['l’automne', 'l’Afrique'],
      'Ce sont [[les hirondelles]] qui partent vers l’Afrique.', 'Le sujet est séparé du verbe par « à l’automne ».'],
    // Plusieurs sujets
    ['Cet été, Léa et Tom [[partent]] à la mer.', 'Léa et Tom', ['cet été', 'la mer'],
      'Ce sont [[Léa et Tom]] qui partent à la mer.', 'Le sujet est formé de deux noms reliés par « et » : le verbe est au pluriel.'],
    ['Sous le chêne, le lapin et l’écureuil [[partagent]] une noisette.', 'le lapin et l’écureuil', ['le chêne', 'une noisette'],
      'Ce sont [[le lapin et l’écureuil]] qui partagent une noisette.',
      'Le sujet est formé de deux noms reliés par « et » : le verbe est au pluriel.'],
    ['Le dimanche, mon frère et moi [[faisons]] des crêpes.', 'mon frère et moi', ['le dimanche', 'des crêpes'],
      'C’est [[mon frère et moi]] qui faisons des crêpes.', '« mon frère et moi », c’est « nous » : nous faisons.'],
    ['Inès, Zoé et Sami [[chantent]] dans la chorale de l’école.', 'Inès, Zoé et Sami', ['la chorale', 'l’école'],
      'Ce sont [[Inès, Zoé et Sami]] qui chantent.', 'Le sujet est formé de trois noms reliés par « et » : le verbe est au pluriel.'],
    // Un pronom sujet
    ['Le matin, il [[promène]] son chien dans le parc.', 'il', ['le matin', 'son chien', 'le parc'],
      'C’est [[lui]] qui promène son chien.', 'Avec « c’est… qui », le pronom « il » devient « lui ».'],
    ['Ce soir, nous [[regarderons]] les étoiles.', 'nous', ['ce soir', 'les étoiles'],
      'C’est [[nous]] qui regarderons les étoiles.'],
    ['Chaque hiver, elles [[tricotent]] des écharpes.', 'elles', ['chaque hiver', 'des écharpes'],
      'Ce sont [[elles]] qui tricotent des écharpes.'],
    ['Je [[range]] mes livres sur l’étagère.', 'je', ['mes livres', 'l’étagère'],
      'C’est [[moi]] qui range mes livres.', 'Avec « c’est… qui », le pronom « je » devient « moi ».'],
    ['Demain, tu [[prêteras]] ton vélo à Sami.', 'tu', ['demain', 'ton vélo', 'Sami'],
      'C’est [[toi]] qui prêteras ton vélo à Sami.', 'Avec « c’est… qui », le pronom « tu » devient « toi ».'],
    // Un petit mot collé au verbe… qui n'est pas le sujet
    ['Papi nous [[emmène]] au cinéma ce soir.', 'Papi', ['nous', 'ce soir'], 'C’est [[Papi]] qui nous emmène au cinéma.',
      '« nous » est juste devant le verbe, mais ce n’est pas le sujet : sinon, on dirait « nous emmenons ».'],
    ['Mamie leur [[raconte]] une histoire.', 'Mamie', ['leur', 'une histoire'], 'C’est [[Mamie]] qui leur raconte une histoire.',
      '« leur » est juste devant le verbe, mais il veut dire « à eux » : ce n’est pas le sujet.'],
    ['Ma sœur te [[prête]] sa trousse.', 'ma sœur', ['te', 'sa trousse'], 'C’est [[ma sœur]] qui te prête sa trousse.',
      '« te » est juste devant le verbe, mais il veut dire « à toi » : ce n’est pas le sujet.'],
  ];

  ajouterEtape({
    id: '6e-grammaire-sujet',
    banque: SUJETS,
    creerQuestion: ([phrase, sujet, pieges, test, remarque]) => question({
      consigne: 'Quel est le sujet du verbe souligné ?',
      enonce: phrase,
      reponse: sujet,
      pieges,
      solution: `<b>${sujet}</b> (sujet du verbe « ${motSouligne(phrase)} »)`,
      explication: `Le test « c’est… qui » : <i>${test.replace(/\[\[(.+?)\]\]/, '<b>$1</b>')}</i> ✔<br>`
        + (remarque ? `${remarque}<br>` : '')
        + 'Le <b>sujet</b> dit <b>qui</b> fait l’action, ou de qui (de quoi) on parle. Le verbe s’accorde avec lui.',
    }),
    titreLecon: 'Le sujet du verbe',
    lecon: `
      <p>Le <b>sujet</b> dit <b>qui</b> fait l’action du verbe, ou <b>de qui</b> (de quoi) on parle. Le verbe s’accorde avec lui.</p>
      <p>Le sujet peut être :<br>
        • un <b>nom propre</b> : <i><b>Roxy</b> dort.</i><br>
        • un <b>pronom</b> : <i><b>Elle</b> dort.</i><br>
        • un <b>groupe nominal</b>, parfois long : <i><b>Les renards de la forêt</b> dorment.</i><br>
        • <b>plusieurs</b> noms (ou groupes) reliés par « et » : <i><b>Léa et Tom</b> dorment.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> encadre avec « c’est… qui » (« ce sont… qui » au pluriel) :<br>
        <i>Ce sont <b>les renards de la forêt</b> qui dorment.</i> ✔<br>
        Avec un pronom : il → c’est <b>lui</b> qui ; je → c’est <b>moi</b> qui.</div>
      <p>⚠️ Le sujet n’est pas toujours juste avant le verbe :<br>
        • il peut être <b>après</b> le verbe : <i>Dans la clairière dansent <b>les lucioles</b>.</i><br>
        • il peut être <b>loin</b> du verbe : <i><b>Mon cousin</b>, avec ses amis, construit une cabane.</i><br>
        • le petit mot collé au verbe n’est pas toujours le sujet : <i><b>Papi</b> nous emmène au cinéma.</i></p>
    `,
  });

  // ======================================================================
  // 4. Les compléments circonstanciels
  // ======================================================================
  // Seulement des compléments qu'on peut déplacer ou supprimer (pas de « aller à l'école »).
  ajouterClassement({
    id: '6e-grammaire-complements-circonstanciels',
    consigne: 'Le {mot} souligné est un complément circonstanciel de…',
    categories: {
      lieu: {
        nom: 'lieu',
        regle: 'Le complément circonstanciel de <b>lieu</b> répond à la question <b>Où ?</b>',
      },
      temps: {
        nom: 'temps',
        regle: 'Le complément circonstanciel de <b>temps</b> répond à la question <b>Quand ?</b> '
          + '(ou « Depuis quand ? », « Depuis combien de temps ? », « Pendant combien de temps ? »).',
      },
      maniere: {
        nom: 'manière',
        regle: 'Le complément circonstanciel de <b>manière</b> répond à la question <b>Comment ?</b> (de quelle façon ?).',
      },
    },
    // [phrase avec le complément souligné, sorte, la question de Roxy]
    banque: [
      ['Roxy dort [[sous le grand chêne]].', 'lieu', 'Où Roxy dort-elle ? <b>Sous le grand chêne</b>.'],
      ['Les enfants jouent [[dans la cour]].', 'lieu', 'Où les enfants jouent-ils ? <b>Dans la cour</b>.'],
      ['Nous pique-niquons [[au bord de la rivière]].', 'lieu', 'Où pique-niquons-nous ? <b>Au bord de la rivière</b>.'],
      ['[[Dans la forêt]], les oiseaux chantent.', 'lieu', 'Où les oiseaux chantent-ils ? <b>Dans la forêt</b>.'],
      ['[[Ici]], on entend la mer.', 'lieu', 'Où entend-on la mer ? <b>Ici</b>.'],
      ['Le hérisson se cache [[derrière le tas de bois]].', 'lieu', 'Où le hérisson se cache-t-il ? <b>Derrière le tas de bois</b>.'],
      ['Mamie tricote [[dans son fauteuil]].', 'lieu', 'Où Mamie tricote-t-elle ? <b>Dans son fauteuil</b>.'],
      ['Hugo lit une bande dessinée [[à la bibliothèque]].', 'lieu', 'Où Hugo lit-il ? <b>À la bibliothèque</b>.'],
      ['Les canards nagent [[sur l’étang]].', 'lieu', 'Où les canards nagent-ils ? <b>Sur l’étang</b>.'],
      ['Nous fêtons Noël [[chez Papi et Mamie]].', 'lieu', 'Où fêtons-nous Noël ? <b>Chez Papi et Mamie</b>.'],
      ['Ce matin, Roxy joue [[dans la neige]].', 'lieu',
        'Où Roxy joue-t-elle ? <b>Dans la neige</b>. (« Ce matin » est un autre complément : il dit quand.)'],
      ['Nous nageons [[à la piscine]].', 'lieu',
        'Où nageons-nous ? <b>À la piscine</b>. Ici, « à » annonce un lieu.'],
      ['[[Hier]], nous avons vu un arc-en-ciel.', 'temps', 'Quand avons-nous vu un arc-en-ciel ? <b>Hier</b>.'],
      ['Roxy se réveille [[au lever du soleil]].', 'temps', 'Quand Roxy se réveille-t-elle ? <b>Au lever du soleil</b>.'],
      ['[[Chaque soir]], Papa nous lit une histoire.', 'temps', 'Quand Papa nous lit-il une histoire ? <b>Chaque soir</b>.'],
      ['Les hirondelles reviennent [[au printemps]].', 'temps', 'Quand les hirondelles reviennent-elles ? <b>Au printemps</b>.'],
      ['Léa fêtera son anniversaire [[samedi]].', 'temps', 'Quand Léa fêtera-t-elle son anniversaire ? <b>Samedi</b>.'],
      ['Il a neigé [[pendant toute la nuit]].', 'temps', 'Pendant combien de temps a-t-il neigé ? <b>Pendant toute la nuit</b>.'],
      ['[[Après l’école]], Inès fait ses devoirs.', 'temps',
        'Quand Inès fait-elle ses devoirs ? <b>Après l’école</b>. L’école est un lieu, mais « après l’école » dit <b>quand</b>.'],
      ['[[En hiver]], le hérisson dort beaucoup.', 'temps', 'Quand le hérisson dort-il beaucoup ? <b>En hiver</b>.'],
      ['Tom range sa chambre [[avant le dîner]].', 'temps', 'Quand Tom range-t-il sa chambre ? <b>Avant le dîner</b>.'],
      ['Sami apprend le piano [[depuis deux ans]].', 'temps', 'Depuis combien de temps Sami apprend-il le piano ? <b>Depuis deux ans</b>.'],
      ['[[Ce matin]], Roxy joue dans la neige.', 'temps',
        'Quand Roxy joue-t-elle dans la neige ? <b>Ce matin</b>. (« dans la neige » est un autre complément : il dit où.)'],
      ['Nous déjeunons [[à midi]].', 'temps', 'Quand déjeunons-nous ? <b>À midi</b>. Ici, « à » annonce un moment, pas un lieu.'],
      ['Roxy avance [[à pas de loup]].', 'maniere', 'Comment Roxy avance-t-elle ? <b>À pas de loup</b> (sans faire de bruit).'],
      ['Le lièvre court [[à toute vitesse]].', 'maniere', 'Comment le lièvre court-il ? <b>À toute vitesse</b>.'],
      ['Les élèves écoutent [[en silence]].', 'maniere', 'Comment les élèves écoutent-ils ? <b>En silence</b>.'],
      ['Zoé colorie son dessin [[avec soin]].', 'maniere', 'Comment Zoé colorie-t-elle son dessin ? <b>Avec soin</b>.'],
      ['La tortue marche [[lentement]].', 'maniere', 'Comment la tortue marche-t-elle ? <b>Lentement</b>.'],
      ['Nous parlons [[à voix basse]] dans la bibliothèque.', 'maniere',
        'Comment parlons-nous ? <b>À voix basse</b>. (« dans la bibliothèque » est un autre complément : il dit où.)'],
      ['[[Doucement]], Roxy sort de son terrier.', 'maniere', 'Comment Roxy sort-elle de son terrier ? <b>Doucement</b>.'],
      ['Les chiots mangent [[avec appétit]].', 'maniere', 'Comment les chiots mangent-ils ? <b>Avec appétit</b>.'],
      ['Le chat entre [[sans bruit]] dans la cuisine.', 'maniere', 'Comment le chat entre-t-il dans la cuisine ? <b>Sans bruit</b>.'],
      ['Tom a gagné la course [[facilement]].', 'maniere', 'Comment Tom a-t-il gagné la course ? <b>Facilement</b>.'],
      ['Mamie accueille ses invités [[avec le sourire]].', 'maniere',
        'Comment Mamie accueille-t-elle ses invités ? <b>Avec le sourire</b>.'],
    ],
    titreLecon: 'Les compléments circonstanciels',
    lecon: `
      <p>Un <b>complément circonstanciel</b> donne des précisions sur les <b>circonstances</b> de l’action :
        où, quand, comment elle se passe.</p>
      <table>
        <tr><th>complément circonstanciel de…</th><th>question</th><th>exemple</th></tr>
        <tr><td><b>lieu</b></td><td>Où ?</td><td>Roxy dort <b>sous le chêne</b>.</td></tr>
        <tr><td><b>temps</b></td><td>Quand ?</td><td><b>Ce matin</b>, il a neigé.</td></tr>
        <tr><td><b>manière</b></td><td>Comment ?</td><td>La tortue avance <b>lentement</b>.</td></tr>
      </table>
      <p>Il est souvent <b>déplaçable</b> et <b>supprimable</b> :<br>
        <i>Roxy dort sous le chêne.</i> → <i>Sous le chêne, Roxy dort.</i> → <i>Roxy dort.</i> La phrase a toujours du sens !</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pose la question <b>Où ?</b>, <b>Quand ?</b> ou <b>Comment ?</b><br>
        <i>Où Roxy dort-elle ?</i> → sous le chêne : c’est un complément circonstanciel de <b>lieu</b>.</div>
      <p>⚠️ Ne te fie pas au petit mot du début : « <b>à</b> midi » dit quand (temps), mais « <b>à</b> la piscine » dit où (lieu).</p>
      <p>Certains livres l’appellent aussi « complément de phrase ».</p>
    `,
  });

  // ======================================================================
  // 5. Déterminant ou pronom ?
  // ======================================================================
  // Les lignes sont fabriquées avec la remarque de Roxy : devant quel nom, ou quel nom remplacé
  const devantNom = (texte, nom, precision = '') =>
    [texte, 'determinant', `Ici, « ${motSouligne(texte)} » est placé devant le nom « ${nom} »${precision}.`];
  const remplace = (texte, groupe) => [texte, 'pronom', `Ici, « ${motSouligne(texte)} » remplace « ${groupe} ».`];

  ajouterClassement({
    id: '6e-grammaire-determinant-pronom',
    // Toujours « mot » : le moteur prendrait « l’ » pour un groupe à cause de l'apostrophe
    consigne: 'Quelle est la nature du mot souligné ?',
    categories: {
      determinant: {
        nom: 'déterminant',
        regle: 'Un <b>déterminant</b> est placé devant un <b>nom</b> (parfois avec un adjectif entre les deux) : '
          + '<i>le chat, le vieux château</i>.',
      },
      pronom: {
        nom: 'pronom',
        regle: 'Un <b>pronom</b> <b>remplace</b> un nom ou un groupe de mots. Il est souvent placé juste devant le verbe : '
          + '<i>je le vois</i>.',
      },
    },
    // Les deux formes de phrases (d'un seul bloc, ou en deux parties) servent aux deux natures,
    // avec des paires pièges : « Mes cousins arrivent : leur train… » / « Mes cousins arrivent : je leur prépare… »
    banque: [
      // Déterminants, dans une phrase d'un seul bloc
      devantNom('Roxy caresse [[le]] chat de la voisine.', 'chat'),
      devantNom('Papa répare [[la]] porte du garage.', 'porte'),
      devantNom('[[Les]] enfants jouent au loup.', 'enfants'),
      devantNom('Tom grimpe dans [[l’]]arbre.', 'arbre'),
      devantNom('Roxy a trouvé [[un]] trésor.', 'trésor'),
      devantNom('Regarde [[ce]] joli papillon !', 'papillon', ' (l’adjectif « joli » est entre les deux)'),
      devantNom('Nous visitons [[le]] vieux château.', 'château', ' (l’adjectif « vieux » est entre les deux)'),
      devantNom('Les élèves écoutent [[leur]] maîtresse.', 'maîtresse'),
      // Déterminants, dans une phrase en deux parties
      devantNom('Mes cousins arrivent : [[leur]] train a du retard.', 'train'),
      devantNom('Où est mon stylo ? Il est sous [[la]] table.', 'table'),
      devantNom('Les fraises sont mûres : Mamie remplit [[le]] panier.', 'panier'),
      devantNom('Ton dessin est beau : j’adore [[les]] couleurs.', 'couleurs'),
      devantNom('Tu connais Inès ? Elle habite dans [[la]] maison bleue.', 'maison'),
      devantNom('Il fait froid : ferme [[les]] volets !', 'volets'),
      devantNom('Le livre de Tom ? Il est resté sur [[l’]]étagère.', 'étagère'),
      devantNom('Les oiseaux chantent : [[leur]] nid est dans le cerisier.', 'nid'),
      // Pronoms, dans une phrase d'un seul bloc
      remplace('Zoé prend le chaton et [[le]] caresse.', 'le chaton'),
      remplace('Papa lave la voiture et [[la]] sèche.', 'la voiture'),
      remplace('Léa cherche son chat partout et [[le]] trouve enfin sous le lit.', 'son chat'),
      remplace('Sami ouvre la fenêtre et [[la]] referme aussitôt.', 'la fenêtre'),
      ['Tom écrit à ses cousins et [[leur]] envoie des photos.', 'pronom',
        'Ici, « leur » remplace « à ses cousins » (Tom envoie des photos <b>à ses cousins</b>).'],
      ['Mes grands-parents habitent loin, alors je [[leur]] téléphone souvent.', 'pronom',
        'Ici, « leur » remplace « à mes grands-parents » (je téléphone <b>à mes grands-parents</b>).'],
      ['[[Ce]] que tu racontes me fait rire.', 'pronom',
        'Ici, « Ce » n’est pas devant un nom : il est suivi de « que » et veut dire « la chose » (la chose que tu racontes).'],
      // Pronoms, dans une phrase en deux parties
      remplace('Où est mon stylo ? Je ne [[le]] trouve plus.', 'mon stylo'),
      ['Tes bottes sont sales : nettoie-[[les]] !', 'pronom',
        'Ici, « les » est placé après le verbe « nettoie » et remplace « tes bottes ».'],
      remplace('Ton dessin est beau : je [[l’]]accroche au mur.', 'ton dessin'),
      ['Mes cousins arrivent : je [[leur]] prépare un gâteau.', 'pronom',
        'Ici, « leur » remplace « à mes cousins » (je prépare un gâteau <b>à mes cousins</b>).'],
      remplace('Les fraises sont mûres : Mamie [[les]] cueille.', 'les fraises'),
      remplace('Le livre de Tom ? Il [[l’]]a oublié à l’école.', 'le livre de Tom'),
      remplace('Tu connais Inès ? Je [[la]] vois tous les jours.', 'Inès'),
      ['Tu as rangé ta chambre ? [[Cela]] me fait plaisir.', 'pronom',
        'Ici, « Cela » n’est pas devant un nom : il remplace toute une idée (tu as rangé ta chambre).'],
    ],
    titreLecon: 'Déterminant ou pronom ?',
    lecon: `
      <p>Les petits mots <b>le, la, les, l’, leur</b> peuvent être des <b>déterminants</b> ou des <b>pronoms</b>.
        Tout dépend de leur place !</p>
      <table>
        <tr><th>nature</th><th>comment le reconnaître</th><th>exemples</th></tr>
        <tr><td><b>déterminant</b></td><td>il est placé devant un <b>nom</b></td><td><b>le</b> chat, <b>la</b> porte, <b>leur</b> maison</td></tr>
        <tr><td><b>pronom</b></td><td>il <b>remplace</b> un nom ; il est souvent devant un <b>verbe</b></td>
          <td>je <b>le</b> vois, Papa <b>la</b> répare, je <b>leur</b> parle</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde le mot qui suit.<br>
        Un nom (ou un adjectif et un nom) → c’est un <b>déterminant</b> : <i><u>la</u> porte grince</i>.<br>
        Un verbe → c’est un <b>pronom</b>. Cherche le nom qu’il remplace : <i>Papa <u>la</u> répare</i> (la = la porte).</div>
      <p>⚠️ À l’impératif, le pronom se place <b>après</b> le verbe : <i>nettoie-<b>les</b></i>.</p>
      <p>⚠️ Le pronom <b>leur</b> (= à eux) ne prend jamais de s : <i>je leur parle</i>. Le déterminant, lui, s’accorde : <i>leurs jouets</i>.</p>
      <p>Le mot « <b>ce</b> » est un déterminant devant un nom (<i>ce livre</i>), mais un pronom devant « qui » ou « que »
        (<i>ce que tu dis</i>). Le mot « <b>cela</b> », lui, est toujours un pronom.</p>
    `,
  });

  // ======================================================================
  // 6. Les mots invariables
  // ======================================================================
  // Pas de « donc » (rangé parmi les adverbes depuis 2020) ni de mot qui change de nature (avant, bien…)
  ajouterClassement({
    id: '6e-grammaire-mots-invariables',
    consigne: 'Quelle est la nature du {mot} souligné ?',
    categories: {
      adverbe: {
        nom: 'adverbe',
        regle: 'Un <b>adverbe</b> précise le sens d’un verbe, d’un adjectif ou d’un autre adverbe : '
          + '<i>courir <b>vite</b>, <b>très</b> bon</i>. Il n’a pas besoin de complément.',
      },
      preposition: {
        nom: 'préposition',
        regle: 'Une <b>préposition</b> est toujours suivie d’un complément, qu’elle relie au reste de la phrase : '
          + '<i><b>dans</b> la forêt, <b>avec</b> Zoé, <b>pour</b> toi</i>.',
      },
      conjonction: {
        nom: 'conjonction',
        regle: 'Une <b>conjonction de coordination</b> relie deux mots, deux groupes ou deux phrases : '
          + '<b>mais, ou, et, or, ni, car</b>.',
      },
    },
    banque: [
      ['Ce gâteau est [[très]] bon.', 'adverbe', '« très » précise l’adjectif « bon ».'],
      ['Nous allons [[souvent]] à la piscine.', 'adverbe', '« souvent » précise le verbe « allons » : il dit à quelle fréquence.'],
      ['L’escargot avance [[lentement]].', 'adverbe'],
      ['[[Hier]], il a plu toute la journée.', 'adverbe', '« Hier » est un adverbe de temps : il ne change jamais et n’a pas de complément.'],
      ['Pose ton sac [[ici]].', 'adverbe', '« ici » est un adverbe de lieu : il n’a pas de complément après lui.'],
      ['Roxy aime [[beaucoup]] les mûres.', 'adverbe', '« beaucoup » précise le verbe « aime ».'],
      ['Les vacances arrivent [[bientôt]].', 'adverbe'],
      ['Le lièvre court [[vite]].', 'adverbe'],
      ['Cette soupe est [[trop]] chaude.', 'adverbe', '« trop » précise l’adjectif « chaude ».'],
      ['Tom a [[déjà]] fini ses devoirs.', 'adverbe'],
      ['Ouvre la boîte : ton cadeau est [[dedans]].', 'adverbe',
        '« dedans » n’a pas de complément après lui : c’est un adverbe. Avec un nom, on dirait « <b>dans</b> la boîte » (préposition).'],
      ['Soulève la pierre : la clé est [[dessous]].', 'adverbe',
        '« dessous » n’a pas de complément après lui : c’est un adverbe. Avec un nom, on dirait « <b>sous</b> la pierre » (préposition).'],
      ['Roxy se cache [[dans]] son terrier.', 'preposition'],
      ['Le chat dort [[sous]] la table.', 'preposition', '« sous » est suivi de son complément : « la table ».'],
      ['Je vais au parc [[avec]] Zoé.', 'preposition'],
      ['Ce cadeau est [[pour]] toi.', 'preposition'],
      ['Hugo boit son chocolat [[sans]] sucre.', 'preposition'],
      ['Ce soir, nous dormons [[chez]] Mamie.', 'preposition'],
      ['Le livre [[de]] Léa est sur la table.', 'preposition', '« de » relie le nom « livre » à son complément « Léa ».'],
      ['Le chat saute [[sur]] le lit.', 'preposition'],
      ['Tom parle [[à]] sa sœur.', 'preposition',
        'Avec un accent, « à » est une préposition (sans accent, « a » est le verbe avoir).'],
      ['Les oies volent [[vers]] le sud.', 'preposition'],
      ['Le chat entre [[par]] la fenêtre.', 'preposition'],
      ['Roxy marche [[entre]] Léa et Tom.', 'preposition'],
      ['J’aime les pommes [[et]] les poires.', 'conjonction'],
      ['Il fait beau, [[mais]] il fait froid.', 'conjonction'],
      ['Tu préfères le chocolat [[ou]] la vanille ?', 'conjonction',
        'Sans accent, « ou » veut dire « ou bien » : c’est une conjonction de coordination.'],
      ['Roxy se cache, [[car]] elle prépare une surprise.', 'conjonction'],
      ['Je voulais jouer dehors ; [[or]], il pleuvait.', 'conjonction',
        '« or » relie deux phrases : il ajoute un fait nouveau, souvent un obstacle.'],
      ['Tom n’aime ni les épinards [[ni]] les navets.', 'conjonction'],
      ['Léa [[et]] Inès sont amies.', 'conjonction'],
      ['Le renard est petit, [[mais]] il est très malin.', 'conjonction'],
      ['Veux-tu jouer aux cartes [[ou]] aux dominos ?', 'conjonction'],
      ['Je n’ai ni faim [[ni]] soif.', 'conjonction'],
      ['Prends ton manteau, [[car]] il fait froid.', 'conjonction'],
    ],
    titreLecon: 'Les mots invariables',
    lecon: `
      <p>Les <b>mots invariables</b> ne changent jamais : ni au féminin, ni au pluriel. En voici trois familles :</p>
      <table>
        <tr><th>nature</th><th>son rôle</th><th>exemples</th></tr>
        <tr><td><b>adverbe</b></td><td>précise un verbe, un adjectif ou un autre adverbe</td>
          <td>très, souvent, vite, lentement, hier, ici, beaucoup, bientôt</td></tr>
        <tr><td><b>préposition</b></td><td>introduit un complément : elle est toujours suivie d’un nom, d’un pronom…</td>
          <td>à, de, dans, sur, sous, avec, pour, sans, chez, vers, par</td></tr>
        <tr><td><b>conjonction de coordination</b></td><td>relie deux mots, deux groupes ou deux phrases</td>
          <td>mais, ou, et, or, ni, car</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> une préposition a toujours un complément après elle :
        <i>le chat est <b>sous</b> la table</i>. Sans complément, c’est un adverbe : <i>le chat est <b>dessous</b></i>.</div>
      <p>Pour retenir les conjonctions de coordination, on dit souvent : « Mais où est donc Ornicar ? »
        (attention, la conjonction « ou » s’écrit sans accent).</p>
      <p>⚠️ Aujourd’hui, « donc » est rangé parmi les <b>adverbes</b>, car on peut le déplacer : <i>Il est <b>donc</b> parti.</i></p>
    `,
  });

  // ======================================================================
  // 7. COD ou COI ?
  // ======================================================================
  // Pas de complément de lieu (« Il va à l'école ») ni de verbe à deux compléments
  ajouterClassement({
    id: '6e-grammaire-cod-coi',
    consigne: 'Quelle est la fonction du {mot} souligné ?',
    categories: {
      cod: {
        nom: 'COD',
        regle: 'Le <b>COD</b> (complément d’objet direct) se rattache au verbe <b>sans préposition</b>. '
          + 'Il répond à la question « <b>quoi ?</b> » ou « <b>qui ?</b> » posée juste après le verbe.',
      },
      coi: {
        nom: 'COI',
        regle: 'Le <b>COI</b> (complément d’objet indirect) se rattache au verbe par une <b>préposition</b> (à, de). '
          + 'Il répond aux questions « <b>à qui ? à quoi ?</b> » ou « <b>de qui ? de quoi ?</b> » posées juste après le verbe.',
      },
    },
    banque: [
      ['Je mange [[une pomme]].', 'cod', 'Je mange <b>quoi</b> ? → une pomme. Il n’y a pas de préposition.'],
      ['Roxy cueille [[des mûres]].', 'cod',
        'Roxy cueille <b>quoi</b> ? → des mûres. Ici, « des » est un déterminant, pas une préposition.'],
      ['Tom attend [[son frère]].', 'cod', 'Tom attend <b>qui</b> ? → son frère.'],
      ['Zoé lit [[un roman d’aventures]].', 'cod', 'Zoé lit <b>quoi</b> ? → un roman d’aventures.'],
      ['Papa répare [[le vélo de Léa]].', 'cod', 'Papa répare <b>quoi</b> ? → le vélo de Léa.'],
      ['Nous regardons [[les étoiles]].', 'cod', 'Nous regardons <b>quoi</b> ? → les étoiles.'],
      ['Hugo boit [[du jus d’orange]].', 'cod',
        'Hugo boit <b>quoi</b> ? → du jus d’orange. Ici, « du » est un déterminant (= un peu de), pas une préposition.'],
      ['Mamie tricote [[une écharpe]].', 'cod', 'Mamie tricote <b>quoi</b> ? → une écharpe.'],
      ['Le renard observe [[la lune]].', 'cod', 'Le renard observe <b>quoi</b> ? → la lune.'],
      ['J’aime [[les crêpes au chocolat]].', 'cod', 'J’aime <b>quoi</b> ? → les crêpes au chocolat.'],
      ['Léa danse : je [[la]] regarde.', 'cod',
        'Je regarde <b>qui</b> ? → la (= Léa). On dit « regarder quelqu’un », sans préposition.'],
      ['Ces fleurs sont belles : je [[les]] cueille.', 'cod',
        'Je cueille <b>quoi</b> ? → les (= ces fleurs). On dit « cueillir quelque chose », sans préposition.'],
      ['Maman [[nous]] appelle pour le dîner.', 'cod',
        'On dit « appeler quelqu’un », sans préposition : Maman appelle <b>qui</b> ? → nous.'],
      ['Mon chien [[me]] suit partout.', 'cod',
        'On dit « suivre quelqu’un », sans préposition : mon chien suit <b>qui</b> ? → moi.'],
      ['Roxy [[te]] cherche depuis ce matin.', 'cod',
        'On dit « chercher quelqu’un », sans préposition : Roxy cherche <b>qui</b> ? → toi.'],
      ['Je parle [[à Léa]].', 'coi', 'Je parle <b>à qui</b> ? → à Léa. Il y a la préposition « à ».'],
      ['Elle se souvient [[de ses vacances]].', 'coi',
        'Elle se souvient <b>de quoi</b> ? → de ses vacances. Il y a la préposition « de ».'],
      ['Tom pense [[à son anniversaire]].', 'coi', 'Tom pense <b>à quoi</b> ? → à son anniversaire.'],
      ['Roxy obéit [[à sa maman]].', 'coi', 'Roxy obéit <b>à qui</b> ? → à sa maman.'],
      ['Zoé téléphone [[à sa grand-mère]].', 'coi', 'Zoé téléphone <b>à qui</b> ? → à sa grand-mère.'],
      ['Sami ressemble [[à son père]].', 'coi', 'Sami ressemble <b>à qui</b> ? → à son père.'],
      ['Inès s’occupe [[de son petit frère]].', 'coi', 'Inès s’occupe <b>de qui</b> ? → de son petit frère.'],
      ['Le chiot rêve [[d’un gros os]].', 'coi',
        'Le chiot rêve <b>de quoi</b> ? → d’un gros os. « d’ », c’est la préposition « de ».'],
      ['Nous profitons [[du soleil]].', 'coi',
        'Nous profitons <b>de quoi</b> ? → du soleil. Ici, « du » veut dire « de le » : il contient la préposition « de ».'],
      ['Mamie sourit [[aux enfants]].', 'coi',
        'Mamie sourit <b>à qui</b> ? → aux enfants. « aux » veut dire « à les » : il contient la préposition « à ».'],
      ['Je m’intéresse [[aux dinosaures]].', 'coi',
        'Je m’intéresse <b>à quoi</b> ? → aux dinosaures. « aux » veut dire « à les ».'],
      ['Tom est triste : Léa [[lui]] parle doucement.', 'coi',
        'On dit « parler <b>à</b> quelqu’un » : « lui » veut dire « à lui ».'],
      ['Mes cousins sont loin : je [[leur]] téléphone souvent.', 'coi',
        'On dit « téléphoner <b>à</b> quelqu’un » : « leur » veut dire « à eux ».'],
      ['Papi [[nous]] téléphone chaque dimanche.', 'coi',
        'On dit « téléphoner <b>à</b> quelqu’un » : « nous » veut dire « à nous ».'],
      ['Ce jeu [[me]] plaît beaucoup.', 'coi', 'On dit « plaire <b>à</b> quelqu’un » : « me » veut dire « à moi ».'],
    ],
    titreLecon: 'COD ou COI ?',
    lecon: `
      <p>Le <b>COD</b> et le <b>COI</b> sont des <b>compléments du verbe</b> : ils complètent son sens.
        On ne peut pas les déplacer.</p>
      <table>
        <tr><th></th><th>relié au verbe…</th><th>question après le verbe</th><th>exemple</th></tr>
        <tr><td><b>COD</b></td><td>directement, sans préposition</td><td>quoi ? qui ?</td><td>Je mange <b>une pomme</b>.</td></tr>
        <tr><td><b>COI</b></td><td>par une préposition (à, de)</td><td>à qui ? à quoi ?<br>de qui ? de quoi ?</td>
          <td>Je parle <b>à Léa</b>.</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> pose la question juste après le verbe.<br>
        Je mange <b>quoi</b> ? → une pomme : <b>COD</b>. Je parle <b>à qui</b> ? → à Léa : <b>COI</b>.</div>
      <p>⚠️ Les pronoms aussi peuvent être COD ou COI : <i>je <b>la</b> regarde</i> (COD : regarder quelqu’un),
        <i>je <b>lui</b> parle</i> (COI : parler à quelqu’un). Pour « me, te, nous, vous », regarde le verbe !</p>
      <p>⚠️ <i>Je mange <b>du</b> pain</i> → COD (du = un peu de). <i>Je profite <b>du</b> soleil</i> → COI (du = de le).</p>
      <p>⚠️ <i>Je vais <b>à l’école</b></i> répond à « où ? » : c’est un complément de lieu, pas un COI.</p>
    `,
  });

  // ======================================================================
  // 8. L'attribut du sujet
  // ======================================================================
  // Pas de phrase passive, ni de temps composé avec « être » (« Il est parti »)
  ajouterClassement({
    id: '6e-grammaire-attribut',
    consigne: 'Quelle est la fonction du {mot} souligné ?',
    categories: {
      attribut: {
        nom: 'attribut du sujet',
        regle: 'L’<b>attribut du sujet</b> dit comment est le sujet, ou ce qu’il est. Il suit un <b>verbe d’état</b> '
          + '(être, paraître, sembler, devenir, rester, demeurer (= rester), avoir l’air). '
          + 'Quand c’est un adjectif, il s’accorde avec le sujet.',
      },
      cod: {
        nom: 'COD',
        regle: 'Le <b>COD</b> complète un verbe qui <b>n’est pas un verbe d’état</b> (manger, regarder, prendre…). '
          + 'Il désigne une autre personne ou une autre chose que le sujet : avec « être » à la place du verbe, '
          + 'la phrase dirait tout autre chose.',
      },
    },
    banque: [
      ['Roxy est [[une renarde curieuse]].', 'attribut', '« être » est un verbe d’état : « une renarde curieuse » dit ce qu’est Roxy.'],
      ['Le ciel devient [[tout noir]].', 'attribut', 'Remplace le verbe par « être » : <i>Le ciel est tout noir.</i> ✔ La phrase dit à peu près la même chose.'],
      ['Ce chien a l’air [[gentil]].', 'attribut', 'Remplace le verbe par « être » : <i>Ce chien est gentil.</i> ✔'],
      ['Ta sœur paraît [[contente]].', 'attribut',
        'Remplace le verbe par « être » : <i>Ta sœur est contente.</i> ✔ « contente » s’accorde avec « ta sœur ».'],
      ['Ce problème semble [[un jeu d’enfant]].', 'attribut',
        'Remplace le verbe par « être » : <i>Ce problème est un jeu d’enfant.</i> ✔ La phrase dit à peu près la même chose.'],
      ['La chenille deviendra [[un papillon]].', 'attribut',
        'Remplace le verbe par « être » : <i>La chenille sera un papillon.</i> ✔ C’est le même animal !'],
      ['Mon oncle est [[boulanger]].', 'attribut', '« boulanger » dit ce qu’est mon oncle : c’est son métier.'],
      ['Ce vieux chêne demeure [[le plus bel arbre de la forêt]].', 'attribut',
        '« demeurer » veut dire « rester » : c’est un verbe d’état. Le chêne et « le plus bel arbre », c’est le même arbre.'],
      ['Hugo reste [[silencieux]].', 'attribut', 'Remplace le verbe par « être » : <i>Hugo est silencieux.</i> ✔'],
      ['Léa est [[la meilleure amie d’Inès]].', 'attribut',
        'Léa et « la meilleure amie d’Inès », c’est la même personne.'],
      ['Ces cerises sont [[délicieuses]].', 'attribut',
        '« délicieuses » s’accorde avec le sujet « ces cerises » (féminin pluriel).'],
      ['Cette maison semble [[très ancienne]].', 'attribut',
        'Remplace le verbe par « être » : <i>Cette maison est très ancienne.</i> ✔'],
      ['Zoé deviendra [[une grande musicienne]].', 'attribut',
        'Remplace le verbe par « être » : <i>Zoé sera une grande musicienne.</i> ✔ C’est la même personne.'],
      ['Le hérisson est [[un animal nocturne]].', 'attribut', '« un animal nocturne » dit ce qu’est le hérisson.'],
      ['Hugo deviendra [[un bon nageur]].', 'attribut',
        'Remplace le verbe par « être » : <i>Hugo sera un bon nageur.</i> ✔ Hugo et le nageur, c’est la même personne.'],
      ['Papi reste [[le champion du village]].', 'attribut',
        'Papi et « le champion du village », c’est la même personne : « rester » est un verbe d’état.'],
      ['Roxy rencontre [[un hérisson curieux]].', 'cod',
        'Remplace le verbe par « être » : <i>Roxy est un hérisson curieux</i> ✘ Roxy et le hérisson sont deux animaux différents.'],
      ['La chenille mange [[une feuille]].', 'cod',
        'Remplace le verbe par « être » : <i>La chenille est une feuille</i> ✘ Ça ne veut plus rien dire !'],
      ['Léa invite [[la meilleure amie d’Inès]].', 'cod',
        'Ici, Léa et l’amie d’Inès sont deux personnes différentes : « inviter » est un verbe d’action.'],
      ['Mon oncle connaît [[le boulanger]].', 'cod',
        'Mon oncle et le boulanger sont deux personnes différentes : « connaître » n’est pas un verbe d’état.'],
      ['Le chat regarde [[un oiseau]].', 'cod',
        'Remplace le verbe par « être » : <i>Le chat est un oiseau</i> ✘ Ça ne veut plus rien dire !'],
      ['Tom dessine [[un grand bateau]].', 'cod', 'Tom dessine <b>quoi</b> ? → un grand bateau. « dessiner » est un verbe d’action.'],
      ['Zoé écoute [[une grande musicienne]].', 'cod',
        'Ici, Zoé écoute quelqu’un d’autre : ce sont deux personnes différentes. « écouter » n’est pas un verbe d’état.'],
      ['Le hérisson cherche [[des escargots]].', 'cod',
        'Le hérisson cherche <b>quoi</b> ? → des escargots. « chercher » n’est pas un verbe d’état.'],
      ['Inès prépare [[un gâteau au chocolat]].', 'cod',
        'Inès prépare <b>quoi</b> ? → un gâteau au chocolat. « préparer » est un verbe d’action.'],
      ['Hugo prend [[son parapluie]].', 'cod', 'Hugo prend <b>quoi</b> ? → son parapluie. « prendre » est un verbe d’action.'],
      ['Papi lit [[le journal]].', 'cod', 'Remplace le verbe par « être » : <i>Papi est le journal</i> ✘ Ça ne veut plus rien dire !'],
      ['Nous admirons [[le coucher du soleil]].', 'cod',
        'Nous admirons <b>quoi</b> ? → le coucher du soleil. « admirer » n’est pas un verbe d’état.'],
      ['Mamie cultive [[de belles tomates]].', 'cod',
        'Mamie cultive <b>quoi</b> ? → de belles tomates. « cultiver » est un verbe d’action.'],
      ['Roxy garde [[son calme]].', 'cod',
        '« garder » n’est pas un verbe d’état : Roxy garde <b>quoi</b> ? → son calme.'],
      ['Le vent emporte [[les feuilles mortes]].', 'cod',
        'Le vent emporte <b>quoi</b> ? → les feuilles mortes. « emporter » est un verbe d’action.'],
      ['Le chien ronge [[un gros os]].', 'cod', 'Remplace le verbe par « être » : <i>Le chien est un gros os</i> ✘ Ça ne veut plus rien dire !'],
    ],
    titreLecon: 'L’attribut du sujet',
    lecon: `
      <p>L’<b>attribut du sujet</b> dit comment est le sujet, ou ce qu’il est. Il est relié au sujet par un <b>verbe d’état</b> :
        <b>être, paraître, sembler, devenir, rester, demeurer</b> (= rester), <b>avoir l’air</b>.</p>
      <p>👉 <i>Roxy est <b>rusée</b>. La chenille devient <b>un papillon</b>.</i></p>
      <p>Le <b>COD</b>, lui, suit un verbe qui n’est pas un verbe d’état (un <b>verbe d’action</b>, le plus souvent) :
        il désigne une autre personne ou une autre chose que le sujet.<br>
        👉 <i>Roxy rencontre <b>un hérisson</b></i> (Roxy et le hérisson sont deux animaux différents).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le verbe par <b>être</b>.<br>
        ✔ La phrase dit à peu près la même chose → <b>attribut</b> : <i>Ta sœur paraît contente → Ta sœur <u>est</u> contente.</i><br>
        ✘ Elle dit tout autre chose → <b>COD</b> : <i>Le chat regarde un oiseau → Le chat <u>est</u> un oiseau ?!</i><br>
        Vérifie aussi : le sujet et le groupe souligné désignent-ils <b>la même personne</b> ou <b>la même chose</b> ?
        Oui → attribut. Non → COD.</div>
      <p>⚠️ L’adjectif attribut <b>s’accorde avec le sujet</b> : <i>Ma sœur est content<b>e</b>. Les cerises sont délicieu<b>ses</b>.</i></p>
    `,
  });
})();
