// Renard Malin — Orthographe, niveau 4e : les 6 étapes de la Rivière gelée
//
// Les phrases sont écrites à la main, avec ___ à la place du mot à trouver.
// Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { indice, fabriquer, tirerType, ajouterEtape, ajouterHomophones, accorderCas, quatreFormes,
    genreNombre } = RM.phrases;

  // ======================================================================
  // 1. Le participe passé avec avoir (COD placé avant)
  // ======================================================================
  // [phrase, verbe, le COD placé avant (ou null), son genre et nombre, le COD placé après (ou null)]
  const PARTICIPE_AVOIR = [
    ['Les fleurs que j’ai ___ sont belles.', 'cueillir', 'que (= les fleurs)', 'fp'],
    ['J’ai ___ des fleurs dans le jardin.', 'cueillir', null, null, 'des fleurs'],
    ['Ces histoires, je les ai ___ cent fois.', 'lire', 'les (= ces histoires)', 'fp'],
    ['J’ai ___ une histoire avant de dormir.', 'lire', null, null, 'une histoire'],
    ['La tarte que Roxy a ___ était délicieuse.', 'faire', 'que (= la tarte)', 'fs'],
    ['Roxy a ___ une tarte aux pommes.', 'faire', null, null, 'une tarte aux pommes'],
    ['Tes lunettes ? Je les ai ___ sur la table.', 'mettre', 'les (= tes lunettes)', 'fp'],
    ['Les amis que nous avons ___ sont très gentils.', 'inviter', 'que (= les amis)', 'mp'],
    ['Nous avons ___ nos amis à dîner.', 'inviter', null, null, 'nos amis'],
    ['La lettre que tu as ___ m’a fait plaisir.', 'écrire', 'que (= la lettre)', 'fs'],
    ['Tu as ___ une longue lettre.', 'écrire', null, null, 'une longue lettre'],
    ['Quelle robe as-tu ___ ?', 'choisir', 'quelle robe', 'fs'],
    ['Les chansons qu’elles ont ___ étaient joyeuses.', 'chanter', 'qu’ (= les chansons)', 'fp'],
    ['Elles ont ___ toute la soirée.', 'chanter', null, null, null],
    ['Tes cousins ? Je les ai ___ au parc.', 'voir', 'les (= tes cousins)', 'mp'],
    ['Les filles ont ___ des gâteaux.', 'manger', null, null, 'des gâteaux'],
    ['Les gâteaux que les filles ont ___ étaient bons.', 'manger', 'que (= les gâteaux)', 'mp'],
    ['Cette leçon, l’as-tu bien ___ ?', 'apprendre', 'l’ (= cette leçon)', 'fs'],
    ['Les élèves ont ___ la leçon par cœur.', 'apprendre', null, null, 'la leçon'],
    ['Les clés que tu as ___ sont à moi.', 'trouver', 'que (= les clés)', 'fp'],
    ['Ma sœur ? Je l’ai ___ à la gare.', 'voir', 'l’ (= ma sœur)', 'fs'],
    ['Les photos que papa a ___ sont floues.', 'prendre', 'que (= les photos)', 'fp'],
    ['Papa a ___ beaucoup de photos.', 'prendre', null, null, 'beaucoup de photos'],
    ['Combien de livres as-tu ___ cette année ?', 'lire', 'combien de livres', 'mp'],
  ];

  ajouterEtape({
    id: '4e-orthographe-participe-avoir',
    banque: PARTICIPE_AVOIR,
    creerQuestion([phrase, infinitif, cod, cas, apres]) {
      const participe = RM.verbe(infinitif).participe;
      const reponse = cod ? accorderCas(participe, cas) : participe;
      const formes = quatreFormes(participe);
      const explication = cod
        ? 'Avec l’auxiliaire <b>avoir</b>, le participe passé s’accorde avec le <b>COD</b> quand il est placé '
          + `<b>avant</b> le verbe. Ici, le COD « ${cod} » est avant, et il est ${genreNombre(cas)} → <b>${reponse}</b>.`
        : 'Avec l’auxiliaire <b>avoir</b>, le participe passé ne s’accorde <b>jamais avec le sujet</b>. Ici, '
          + (apres ? `le COD « ${apres} » est placé <b>après</b> le verbe` : 'il n’y a pas de COD')
          + ` → <b>${participe}</b>, sans accord.`;
      return fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: RM.melanger(formes),
        mauvais: formes.filter(f => f !== reponse),
        explication,
        aide: indice(infinitif),
        consigneChoix: 'Choisis le participe passé bien accordé',
        consigneEcrire: 'Écris le participe passé bien accordé',
      });
    },
    titreLecon: 'Le participe passé avec avoir',
    lecon: `
      <p>Avec l’auxiliaire <b>avoir</b>, le participe passé ne s’accorde <b>jamais avec le sujet</b> :
        <i>Les filles ont mangé.</i></p>
      <p>Mais il s’accorde avec le <b>COD</b> (le complément d’objet direct) quand celui-ci est placé <b>avant</b> le verbe.</p>
      <table>
        <tr><th>COD après : pas d’accord</th><th>COD avant : accord</th></tr>
        <tr><td>J’ai cueilli <u>des fleurs</u>.</td><td><u>Les fleurs</u> que j’ai cueilli<b>es</b>.</td></tr>
        <tr><td>J’ai lu <u>ces histoires</u>.</td><td>Ces histoires, je <u>les</u> ai lu<b>es</b>.</td></tr>
        <tr><td>Tu as choisi <u>une robe</u>.</td><td><u>Quelle robe</u> as-tu choisi<b>e</b> ?</td></tr>
      </table>
      <div class="astuce">💡 <b>La méthode de Roxy :</b><br>
        1. Pose la question « <b>quoi ?</b> » (ou « qui ? ») après le verbe : j’ai cueilli quoi ? → les fleurs.<br>
        2. Le COD est-il <b>avant</b> le verbe ? Souvent, c’est « que », « l’ », « les » ou « quel… ».<br>
        3. Si oui, accorde avec lui. Sinon, pas d’accord.</div>
    `,
  });

  // ======================================================================
  // 2. quel, quelle, quels, quelles ou qu'elle(s) ?
  // ======================================================================
  ajouterHomophones({
    id: '4e-orthographe-quel-ou-quelle',
    choix: reponse => (reponse.startsWith('qu’') ? ['qu’elle', 'qu’elles', 'quelle', 'quelles'] : ['quel', 'quelle', 'quels', 'quelles']),
    expliquer(phrase, reponse, info) {
      if (reponse.startsWith('qu’')) {
        const test = reponse === 'qu’elle' ? 'qu’il' : 'qu’ils';
        return `On peut remplacer par « ${test} » (en mettant la suite au masculin si besoin) : ✔ la phrase reste correcte.<br>`
          + `C’est donc « que » + « ${reponse.slice(3)} » → <b>${reponse}</b>, en deux mots.`;
      }
      const [nom, cas] = info;
      return `Ici, le mot se rapporte au nom « ${nom} », qui est ${genreNombre(cas)} : il s’accorde → <b>${reponse}</b>. `
        + '(Remplacer par « qu’il » ne marcherait pas.)';
    },
    phrases: {
      quel: [['Dis-moi ___ âge tu as.', ['âge', 'ms']], ['Je me demande de ___ pays tu viens.', ['pays', 'ms']],
        ['Par ___ chemin es-tu passée ?', ['chemin', 'ms']], ['Devine ___ est mon plat préféré.', ['plat', 'ms']]],
      quelle: [['Oh, ___ belle journée !', ['journée', 'fs']], ['À ___ heure pars-tu ?', ['heure', 'fs']],
        ['Dans ___ ville habites-tu ?', ['ville', 'fs']]],
      quels: [['Dis-moi ___ livres tu préfères.', ['livres', 'mp']], ['Je me demande ___ animaux vivent ici.', ['animaux', 'mp']]],
      quelles: [['Je ne sais pas ___ chaussures mettre.', ['chaussures', 'fp']], ['Regarde ___ jolies fleurs !', ['fleurs', 'fp']],
        ['Tu sais ___ sont ses couleurs préférées ?', ['couleurs', 'fp']]],
      'qu’elle': ['Je pense ___ viendra demain.', 'Il faut ___ se dépêche.', 'Roxy dit ___ a faim.',
        'Je sais ___ aime les chats.', 'C’est la chanson ___ préfère.', 'Il est temps ___ parte.',
        'Voici les fleurs ___ a cueillies.', 'Je vois bien ___ est fatiguée.'],
      'qu’elles': ['Je crois ___ sont parties.', 'Maman veut ___ rangent leur chambre.',
        'Les filles disent ___ ont gagné.', 'J’espère ___ vont bien.'],
    },
    titreLecon: 'quel, quelle ou qu’elle ?',
    lecon: `
      <h4>quel, quelle, quels, quelles : ils s’accordent avec le nom</h4>
      <p>👉 <i><b>quel</b> âge, <b>quelle</b> heure, <b>quels</b> livres, <b>quelles</b> fleurs</i><br>
         👉 <i><b>Quelles</b> sont tes couleurs préférées ?</i> (avec le nom « couleurs »)</p>
      <h4>qu’elle, qu’elles : « que » + « elle(s) »</h4>
      <p>👉 <i>Je pense <b>qu’elle</b> viendra. Je crois <b>qu’elles</b> sont parties.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace par « <b>qu’il</b> » (ou « qu’ils »).<br>
        ✔ Ça marche → <b>qu’elle</b> en deux mots : <i>Je pense <u>qu’il</u> viendra.</i><br>
        ✘ Ça ne marche pas → <b>quel(le)(s)</b>, accordé avec le nom.</div>
    `,
  });

  // ======================================================================
  // 3. sans ou s'en ?
  // ======================================================================
  ajouterHomophones({
    id: '4e-orthographe-sans-ou-sen',
    choix: ['sans', 's’en'],
    expliquer: (phrase, reponse) => (reponse === 'sans'
      ? 'Ici, « sans » veut dire « <b>pas avec</b> » (le contraire de « avec ») : c’est une préposition, elle ne change jamais.'
      : 'Ici, c’est « <b>se</b> » + « <b>en</b> », devant un verbe pronominal (s’en aller, s’en souvenir, s’en occuper…). '
        + 'Avec « je », on dirait « je <b>m’en</b>… » : il s’en va → je m’en vais.'),
    phrases: {
      sans: ['Roxy est partie ___ son foulard.', 'Je bois mon chocolat ___ sucre.', 'Il est sorti ___ faire de bruit.',
        'Ne pars pas ___ moi !', 'Elle a répondu ___ hésiter.', 'Un renard ___ queue, c’est rare.',
        'Nous avons marché ___ nous arrêter.', 'Un été ___ soleil, quelle tristesse !',
        'Tu as écrit ce texte ___ aucune faute.', 'Elle est venue ___ son frère.'],
      's’en': ['Il ___ va à l’école.', 'Roxy ___ souvient très bien.', 'Elle ___ occupe tous les jours.',
        'Le chat ___ est allé.', 'Il ne veut pas ___ séparer.', 'Ils ___ vont en vacances.',
        'Elle ___ moque complètement.', 'Il ___ veut d’avoir crié.', 'La maîtresse ___ est rendu compte.',
        'Le renard ___ approche doucement.', 'Il faut ___ méfier.'],
    },
    titreLecon: 'sans ou s’en ?',
    lecon: `
      <h4>sans : le contraire de « avec »</h4>
      <p>👉 <i>Un chocolat <b>sans</b> sucre. Il est parti <b>sans</b> dire au revoir.</i></p>
      <h4>s’en : « se » + « en », devant un verbe</h4>
      <p>On le trouve avec les verbes pronominaux : s’en aller, s’en souvenir, s’en occuper, s’en méfier…</p>
      <p>👉 <i>Il <b>s’en</b> va. Roxy <b>s’en</b> souvient.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> conjugue avec « je ».<br>
        Si ça donne « je <u>m’en</u>… », c’est <b>s’en</b> : <i>il s’en va → je <u>m’en</u> vais</i>.<br>
        Si on peut dire « avec » à la place (pour dire le contraire), c’est <b>sans</b>.</div>
    `,
  });

  // ======================================================================
  // 4. quand, quant ou qu'en ?
  // ======================================================================
  ajouterHomophones({
    id: '4e-orthographe-quand-quant',
    choix: ['quand', 'quant', 'qu’en'],
    expliquer(phrase, reponse) {
      if (reponse === 'quand') {
        return 'Ici, on parle d’un <b>moment</b> : on peut dire « lorsque » ou poser la question « à quel moment ? » → <b>quand</b> (avec un d).';
      }
      if (reponse === 'quant') {
        return 'Ici, c’est « <b>quant à</b> » (ou quant au, quant aux), qui veut dire « en ce qui concerne » → <b>quant</b> (avec un t).';
      }
      return 'Ici, c’est « <b>que</b> » + « <b>en</b> » : par exemple « ne … qu’en » = « seulement en », '
        + 'ou « ce qu’en pense… » → <b>qu’en</b>, en deux mots.';
    },
    phrases: {
      quand: ['Je t’appellerai ___ je serai arrivée.', 'Dis-moi ___ tu viendras.', 'Roxy dort ___ il fait nuit.',
        'Je souris ___ je te vois.', 'Depuis ___ habites-tu ici ?', 'On partira ___ tu seras prête.',
        'Il pleurait ___ il était petit.', 'Jusqu’à ___ restes-tu ?'],
      quant: ['Mes amis sont partis ; ___ à moi, je reste.', 'Léa aime la mer ; ___ à Tom, il préfère la montagne.',
        'Nous avons des doutes ___ à sa réponse.', 'Et ___ à toi, que veux-tu ?', 'J’ai une question ___ aux devoirs.',
        'Les parents sont d’accord ; ___ aux enfants, ils sont ravis.', 'Il n’a rien dit ___ à son départ.'],
      'qu’en': ['Je me demande ce ___ pense Roxy.', 'Il ne sort ___ cas de besoin.',
        'Ce n’est ___ travaillant qu’on progresse.', 'Il ne voyage ___ train.', 'Dis-moi ce ___ pensent tes parents.',
        'Elle ne parle ___ anglais.', 'On ne trouve ce singe ___ Afrique.'],
    },
    titreLecon: 'quand, quant ou qu’en ?',
    lecon: `
      <h4>quand (avec un d) : un moment</h4>
      <p>👉 <i>Je souris <b>quand</b> je te vois. Depuis <b>quand</b> es-tu là ?</i>
        (on peut souvent dire « lorsque », sinon « à quel moment ? »)</p>
      <h4>quant (avec un t) : toujours suivi de à, au, aux</h4>
      <p>👉 <i><b>Quant à</b> moi, je reste.</i> (= en ce qui me concerne)</p>
      <h4>qu’en : « que » + « en »</h4>
      <p>👉 <i>Il ne voyage <b>qu’en</b> train</i> (= seulement en train). <i>Je me demande ce <b>qu’en</b> pense Roxy.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> si le mot suivant est « à, au, aux », c’est presque toujours <b>quant</b>.
        Si on parle d’un moment (« lorsque », « à quel moment ? »), c’est <b>quand</b>.
        Si c’est « que » + « en » (« ne… qu’en » = seulement en, ou « ce qu’en pense… »), c’est <b>qu’en</b>.</div>
    `,
  });

  // ======================================================================
  // 5. tout, tous, toute ou toutes ?
  // ======================================================================
  const EXPLICATIONS_TOUT = {
    determinant: (rep, [, groupe, cas]) => `Ici, « tout » accompagne le groupe « ${groupe} », qui est ${genreNombre(cas)} : il s’accorde → <b>${rep}</b>.`,
    pronom: (rep, [, groupe]) => `Ici, « ${rep} » remplace « ${groupe} » (= ${rep === 'tous' ? 'eux tous' : 'elles toutes'}) : `
      + `c’est un pronom, il s’accorde → <b>${rep}</b>.`,
    neutre: () => 'Ici, « tout » veut dire « toutes les choses » : c’est un pronom neutre, il reste <b>tout</b>.',
    adverbe: (rep, [, mot]) => `Ici, « tout » veut dire « très » ou « tout à fait », devant « ${mot} » : c’est un adverbe, il ne s’accorde pas → <b>tout</b>.`,
    adverbeVoyelle: (rep, [, mot]) => `Ici, « tout » veut dire « tout à fait », devant « ${mot} » qui commence par une voyelle : il reste invariable → <b>tout</b>.`,
    adverbeConsonne: (rep, [, mot]) => `Ici, « tout » veut dire « tout à fait »… mais « ${mot} » est un adjectif <b>féminin</b> qui commence par une <b>consonne</b> (ou un h aspiré) : dans ce cas, il s’accorde → <b>${rep}</b>.`,
  };

  ajouterHomophones({
    id: '4e-orthographe-tout',
    choix: ['tout', 'toute', 'tous', 'toutes'],
    proportions: { choix: 0.8, vraifaux: 0.2 },
    expliquer: (phrase, reponse, info) => EXPLICATIONS_TOUT[info[0]](reponse, info),
    phrases: {
      tout: [['J’ai mangé ___ le gâteau.', ['determinant', 'le gâteau', 'ms']],
        ['Il pleut ___ le temps.', ['determinant', 'le temps', 'ms']],
        ['Tu as compris ? Oui, j’ai ___ compris.', ['neutre']],
        ['Il est ___ content.', ['adverbe', 'content']], ['Le ciel est ___ bleu.', ['adverbe', 'bleu']],
        ['Il habite ___ près d’ici.', ['adverbe', 'près']], ['Elle est ___ étonnée.', ['adverbeVoyelle', 'étonnée']],
        ['Cette histoire est restée ___ entière dans ma tête.', ['adverbeVoyelle', 'entière']]],
      toute: [['Roxy a dormi ___ la nuit.', ['determinant', 'la nuit', 'fs']],
        ['Nous avons marché ___ la journée.', ['determinant', 'la journée', 'fs']],
        ['Elle est ___ contente.', ['adverbeConsonne', 'contente']],
        ['La petite renarde était ___ seule.', ['adverbeConsonne', 'seule']],
        ['Ma robe est ___ neuve.', ['adverbeConsonne', 'neuve']]],
      tous: [['Je vais à l’école ___ les jours.', ['determinant', 'les jours', 'mp']],
        ['Il a lu ___ les livres de la bibliothèque.', ['determinant', 'les livres', 'mp']],
        ['Merci à ___ les élèves !', ['determinant', 'les élèves', 'mp']],
        ['Les enfants sont ___ là.', ['pronom', 'les enfants', 'mp']],
        ['Mes amis ? Je les invite ___.', ['pronom', 'mes amis', 'mp']]],
      toutes: [['Elle a invité ___ ses amies.', ['determinant', 'ses amies', 'fp']],
        ['J’ai rangé ___ mes affaires.', ['determinant', 'mes affaires', 'fp']],
        ['Elle connaît ___ les réponses.', ['determinant', 'les réponses', 'fp']],
        ['Les filles sont ___ venues.', ['pronom', 'les filles', 'fp']]],
    },
    titreLecon: 'tout, tous, toute ou toutes ?',
    lecon: `
      <h4>Devant un nom (avec le, la, les, mes…) : il s’accorde</h4>
      <p>👉 <i><b>tout</b> le gâteau, <b>toute</b> la nuit, <b>tous</b> les jours, <b>toutes</b> mes amies</i></p>
      <h4>À la place d’un nom : il s’accorde aussi</h4>
      <p>👉 <i>Les enfants sont <b>tous</b> là. Les filles sont <b>toutes</b> venues.</i><br>
         Mais quand il veut dire « toutes les choses », il reste <b>tout</b> : <i>J’ai <b>tout</b> compris.</i></p>
      <h4>Devant un adjectif ou un adverbe (= très, tout à fait) : il ne s’accorde pas…</h4>
      <p>👉 <i>Il est <b>tout</b> content. Elle est <b>tout</b> étonnée. Il habite <b>tout</b> près.</i></p>
      <div class="astuce">💡 <b>L’exception :</b> devant un adjectif <b>féminin</b> qui commence par une <b>consonne</b>
        (ou un h aspiré), on accorde, pour que ça sonne bien : <i>elle est <b>toute</b> contente, <b>toute</b> seule,
        <b>toute</b> honteuse</i>.</div>
    `,
  });

  // ======================================================================
  // 6. Les adjectifs de couleur
  // ======================================================================
  const NOMS_DE_COULEUR = {
    marron: 'le marron, le fruit du châtaignier', orange: 'l’orange, le fruit', turquoise: 'la turquoise, une pierre',
    argent: 'l’argent, un métal', crème: 'la crème', cerise: 'la cerise, le fruit',
  };
  // [groupe du nom, couleur, réponse, choix proposés, sorte, nom, genre et nombre]
  const COULEURS = [
    ['des robes ___', 'vert', 'vertes', ['vert', 'verts', 'vertes'], 'simple', 'robes', 'fp'],
    ['des yeux ___', 'marron', 'marron', ['marron', 'marrons'], 'nom'],
    ['des chaussures ___', 'orange', 'orange', ['orange', 'oranges'], 'nom'],
    ['des fleurs ___', 'rose', 'roses', ['rose', 'roses'], 'exception'],
    ['des pulls ___', 'bleu clair', 'bleu clair', ['bleu clair', 'bleus clairs'], 'compose'],
    ['des chemises ___', 'blanc', 'blanches', ['blanc', 'blancs', 'blanches'], 'simple', 'chemises', 'fp'],
    ['des feuilles ___', 'vert foncé', 'vert foncé', ['vert foncé', 'vertes foncées'], 'compose'],
    ['des rubans ___', 'mauve', 'mauves', ['mauve', 'mauves'], 'exception'],
    ['des voitures ___', 'noir', 'noires', ['noir', 'noirs', 'noires'], 'simple', 'voitures', 'fp'],
    ['des chaussettes ___', 'turquoise', 'turquoise', ['turquoise', 'turquoises'], 'nom'],
    ['des cheveux ___', 'châtain', 'châtains', ['châtain', 'châtains'], 'simple', 'cheveux', 'mp'],
    ['des murs ___', 'jaune pâle', 'jaune pâle', ['jaune pâle', 'jaunes pâles'], 'compose'],
    ['des jupes ___', 'kaki', 'kaki', ['kaki', 'kakis'], 'nom'],
    ['des renardes ___', 'roux', 'rousses', ['roux', 'rousse', 'rousses'], 'simple', 'renardes', 'fp'],
    ['des tulipes ___', 'rouge', 'rouges', ['rouge', 'rouges'], 'simple', 'tulipes', 'fp'],
    ['des bijoux ___', 'argent', 'argent', ['argent', 'argents'], 'nom'],
    ['des manteaux ___', 'bleu marine', 'bleu marine', ['bleu marine', 'bleus marines'], 'compose'],
    ['des pantalons ___', 'gris', 'gris', ['gris', 'grises'], 'simple', 'pantalons', 'mp'],
    ['des vestes ___', 'crème', 'crème', ['crème', 'crèmes'], 'nom'],
    ['des joues ___', 'écarlate', 'écarlates', ['écarlate', 'écarlates'], 'exception'],
    ['des étoiles ___', 'doré', 'dorées', ['doré', 'dorés', 'dorées'], 'simple', 'étoiles', 'fp'],
    ['des bonbons ___', 'violet', 'violets', ['violet', 'violets', 'violettes'], 'simple', 'bonbons', 'mp'],
    ['des nappes ___', 'cerise', 'cerise', ['cerise', 'cerises'], 'nom'],
    ['des yeux ___', 'bleu-vert', 'bleu-vert', ['bleu-vert', 'bleus-verts'], 'compose'],
  ];

  function expliquerCouleur(couleur, reponse, sorte, nom, cas) {
    if (sorte === 'simple') {
      return `« ${couleur} » est un vrai adjectif de couleur : il s’accorde avec le nom « ${nom} », `
        + `qui est ${genreNombre(cas)} → <b>${reponse}</b>.`;
    }
    if (couleur === 'kaki') {
      return `« kaki » vient d’un mot hindi qui veut dire « couleur de poussière » : il reste <b>invariable</b> → <b>${reponse}</b>.`;
    }
    if (sorte === 'nom') {
      return `« ${couleur} » est d’abord le nom d’une chose (${NOMS_DE_COULEUR[couleur]}) : `
        + `une couleur qui vient d’un nom reste <b>invariable</b> → <b>${reponse}</b>.`;
    }
    if (sorte === 'exception') {
      return `« ${couleur} » vient d’un nom, mais c’est une <b>exception</b> : rose, mauve, pourpre, fauve, écarlate `
        + `et incarnat s’accordent → <b>${reponse}</b>.`;
    }
    return `Une couleur en <b>deux mots</b> (${couleur}) reste <b>invariable</b> → <b>${reponse}</b>.`;
  }

  ajouterEtape({
    id: '4e-orthographe-couleurs',
    banque: COULEURS,
    creerQuestion: ([groupe, couleur, reponse, choix, sorte, nom, cas]) => fabriquer(
      tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase: groupe,
        reponse,
        choix: RM.melanger(choix),
        mauvais: choix.filter(c => c !== reponse),
        explication: expliquerCouleur(couleur, reponse, sorte, nom, cas),
        aide: indice(couleur),
        consigneChoix: 'Choisis la couleur bien écrite',
        consigneEcrire: 'Écris la couleur bien accordée',
      }),
    titreLecon: 'Les adjectifs de couleur',
    lecon: `
      <h4>1. Les vrais adjectifs de couleur s’accordent</h4>
      <p>👉 <i>des robes vert<b>es</b>, des chemises blanch<b>es</b>, des cheveux châtain<b>s</b></i></p>
      <h4>2. Les couleurs qui viennent d’un nom restent invariables</h4>
      <p>👉 <i>des yeux <b>marron</b>, des chaussures <b>orange</b>, des chaussettes <b>turquoise</b>, des vestes <b>crème</b></i>
        (le marron, l’orange, la turquoise, la crème sont des choses). <b>kaki</b>, un mot venu de l’hindi, reste aussi invariable.</p>
      <p>⚠️ Exceptions qui s’accordent quand même : <b>rose, mauve, pourpre, fauve, écarlate, incarnat</b> → <i>des fleurs roses</i>.</p>
      <h4>3. Les couleurs en deux mots restent invariables</h4>
      <p>👉 <i>des pulls <b>bleu clair</b>, des feuilles <b>vert foncé</b>, des yeux <b>bleu-vert</b></i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> demande-toi si la couleur est aussi le nom d’une chose
        (un fruit, une pierre, un métal…). Si oui, elle ne bouge pas… sauf rose, mauve et leurs amies !</div>
    `,
  });
})();
