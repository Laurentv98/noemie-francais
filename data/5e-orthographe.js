// Renard Malin — Orthographe, niveau 5e : les 6 étapes de la Rivière d'automne
//
// Les phrases sont écrites à la main, avec ___ à la place du mot à trouver.
// Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { fabriquer, tirerType, ajouterEtape, ajouterHomophones } = RM.phrases;

  // Le mot qui suit le trou (ex. « leur ___ chambre » → « chambre »)
  const motApres = phrase => phrase.split('___ ')[1].split(/[\s.,!?’-]/)[0];
  // La phrase où l'on a essayé un autre mot à la place du trou
  const essai = (phrase, mot) => `<i>${phrase.replace('___', `<u>${mot}</u>`)}</i>`;

  // ======================================================================
  // 1. ce ou se ?
  // ======================================================================
  ajouterHomophones({
    id: '5e-orthographe-ce-ou-se',
    choix: ['ce', 'se'],
    expliquer(phrase, reponse, sorte) {
      if (reponse === 'se') {
        return 'Ici, « se » est devant un <b>verbe</b> : c’est le pronom d’un verbe pronominal (se laver, se cacher…). '
          + 'Avec « je », on dirait « me » : il <b>se</b> lave → je <b>me</b> lave.';
      }
      if (sorte === 'nom') {
        return `Ici, « ce » est devant le nom « ${motApres(phrase)} » : c’est un déterminant qui <b>montre</b> `
          + '(ce livre-ci, ces livres). On l’écrit avec un <b>c</b>.';
      }
      return 'Ici, « ce » veut dire « <b>la chose</b> » (ce qui, ce que, ce dont) : c’est un pronom démonstratif, '
        + 'on l’écrit avec un <b>c</b>.';
    },
    phrases: {
      ce: [['J’adore ___ livre.', 'nom'], ['Regarde ___ nuage !', 'nom'], ['Tu connais ___ garçon ?', 'nom'],
        ['Je voudrais ___ gâteau.', 'nom'], ['Roxy a trouvé ___ trésor dans la forêt.', 'nom'],
        ['Pendant ___ temps, Kylian attendait.', 'nom'], ['À ___ moment-là, le téléphone sonna.', 'nom'],
        ['Je ne sais pas ___ qui s’est passé.', 'pronom'], ['Dis-moi ___ que tu veux.', 'pronom'],
        ['Voilà tout ___ que je sais.', 'pronom'], ['Il a oublié ___ dont il avait besoin.', 'pronom'],
        ['Fais ___ que tu peux.', 'pronom'], ['Raconte-moi ___ qui te rend triste.', 'pronom']],
      se: ['Roxy ___ lave les pattes.', 'Le chat ___ cache sous le lit.', 'Ils ___ promènent au parc.',
        'Elle ___ souvient de tout.', 'Il ___ lève tôt le matin.', 'Les enfants ___ reposent après la course.',
        'Le renard ___ couche dans son terrier.', 'Elles ___ parlent au téléphone.', 'Il faut ___ dépêcher !',
        'Le soleil ___ lève à l’est.', 'Tom ___ demande où tu es.', 'Les oiseaux ___ posent sur la branche.'],
    },
    titreLecon: 'ce ou se ?',
    lecon: `
      <h4>ce (avec un c) : il montre</h4>
      <p>• devant un <b>nom</b> : <i><b>ce</b> livre, <b>ce</b> nuage</i> (au pluriel : ces livres) ;<br>
         • devant <b>qui, que, dont</b> : <i><b>ce</b> qui s’est passé, <b>ce</b> que tu veux</i> (= la chose).</p>
      <h4>se (avec un s) : devant un verbe</h4>
      <p>C’est le pronom des verbes <b>pronominaux</b> : se laver, se cacher, se souvenir…</p>
      <p>👉 <i>Roxy <b>se</b> lave. Le chat <b>se</b> cache.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> conjugue avec « je ».<br>
        Si « se » devient « me », c’est un verbe pronominal → <b>se</b> : il se lave → je <u>me</u> lave.<br>
        Sinon, c’est <b>ce</b>.</div>
    `,
  });

  // ======================================================================
  // 2. c'est ou s'est ?
  // ======================================================================
  ajouterHomophones({
    id: '5e-orthographe-cest-ou-sest',
    choix: ['c’est', 's’est'],
    expliquer(phrase, reponse) {
      if (reponse === 'c’est') {
        return `Remplace par « c’était » : ${essai(phrase, 'c’était')} ✔<br>`
          + 'Ça marche : « c’est » veut dire « <b>cela est</b> ».';
      }
      return `Remplace par « c’était » : ${essai(phrase, 'c’était')} ✘<br>`
        + 'Ça ne marche pas : c’est un <b>verbe pronominal au passé composé</b> (se cacher → elle s’est cachée). '
        + 'Avec « je », on dirait « je <b>me suis</b>… ».';
    },
    phrases: {
      'c’est': ['Regarde, ___ Roxy !', 'Je crois que ___ l’heure de partir.', 'Ce gâteau, ___ le meilleur !',
        'Dis-moi si ___ vrai.', 'Oui, ___ moi !', 'Tu sais, ___ facile !', 'Le renard, ___ mon animal préféré.',
        'Aujourd’hui, ___ mon anniversaire !', 'Je pense que ___ une bonne idée.', 'Écoute : ___ la cloche de l’école.',
        'Ah, ___ toi ! Je ne t’avais pas reconnue.', 'Je trouve que ___ trop tard.'],
      's’est': ['Roxy ___ cachée derrière l’arbre.', 'Le chat ___ endormi sur le canapé.', 'Il ___ levé très tôt.',
        'Elle ___ promenée dans la forêt.', 'Noa ___ fait mal au genou.', 'La porte ___ ouverte toute seule.',
        'Le renard ___ approché doucement.', 'Ma sœur ___ trompée de chemin.', 'Il ___ souvenu de ton prénom.',
        'Le soleil ___ couché derrière la colline.', 'Maëva ___ bien amusée à la fête.', 'Le bébé ___ mis à pleurer.'],
    },
    titreLecon: 'c’est ou s’est ?',
    lecon: `
      <h4>c’est = cela est</h4>
      <p>👉 <i><b>C’est</b> Roxy ! <b>C’est</b> facile.</i> (au pluriel : ce sont)</p>
      <h4>s’est = un verbe pronominal au passé composé</h4>
      <p>Il est toujours suivi d’un <b>participe passé</b> : se cacher → elle <b>s’est</b> cachée.</p>
      <p>👉 <i>Roxy <b>s’est</b> cachée. Il <b>s’est</b> levé tôt.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace par <b>c’était</b>.<br>
        ✔ Ça marche → <b>c’est</b> : <i><u>C’était</u> facile.</i><br>
        ✘ Ça ne marche pas → <b>s’est</b>. Avec « je », on dirait « je me suis » : <i>je <u>me suis</u> cachée</i>.</div>
    `,
  });

  // ======================================================================
  // 3. leur ou leurs ?
  // ======================================================================
  ajouterHomophones({
    id: '5e-orthographe-leur-ou-leurs',
    choix: ['leur', 'leurs'],
    expliquer(phrase, reponse, sorte) {
      if (sorte === 'pronom') {
        return 'Ici, « leur » accompagne un <b>verbe</b> : c’est un pronom qui veut dire « à eux ». '
          + `Remplace par « lui » : ${essai(phrase, 'lui')} ✔<br>Ce « leur »-là ne prend <b>jamais</b> de s !`;
      }
      const nombre = reponse === 'leurs' ? 'pluriel : il prend un s' : 'singulier : pas de s';
      return `Ici, « ${reponse} » est devant le nom « ${motApres(phrase)} » : c’est un déterminant, `
        + `il s’accorde avec le nom, qui est au <b>${nombre}</b>.`;
    },
    phrases: {
      leur: [['Je ___ parle souvent.', 'pronom'], ['Roxy ___ a donné des pommes.', 'pronom'],
        ['Dis-___ bonjour de ma part !', 'pronom'], ['Nous ___ écrivons une lettre.', 'pronom'],
        ['La maîtresse ___ explique la leçon.', 'pronom'], ['Je vais ___ montrer mon dessin.', 'pronom'],
        ['Il ___ a prêté son vélo.', 'pronom'], ['Tu ___ as raconté une histoire ?', 'pronom'],
        ['Les enfants rangent ___ chambre.', 'nom'], ['Les renards retournent dans ___ terrier.', 'nom'],
        ['Mes voisins promènent ___ chien.', 'nom'], ['Les élèves attendent ___ maîtresse.', 'nom'],
        ['Mes parents adorent ___ maison.', 'nom']],
      leurs: [['Les enfants rangent ___ jouets.', 'nom'], ['Les roussettes nourrissent ___ petits.', 'nom'],
        ['Mes cousins m’ont prêté ___ vélos.', 'nom'], ['Les filles ont apporté ___ livres préférés.', 'nom'],
        ['Les élèves sortent ___ cahiers.', 'nom'], ['Les chats lèchent ___ pattes.', 'nom'],
        ['Mes voisins arrosent ___ fleurs.', 'nom'], ['Les joueurs retrouvent ___ amis.', 'nom'],
        ['Mes grands-parents racontent ___ souvenirs.', 'nom']],
    },
    titreLecon: 'leur ou leurs ?',
    lecon: `
      <h4>leur à côté d’un verbe : jamais de s</h4>
      <p>C’est un pronom qui veut dire « <b>à eux</b> » ou « <b>à elles</b> ». Il se place juste avant le verbe,
        ou juste après à l’impératif (dis-<b>leur</b>).</p>
      <p>👉 <i>Je <b>leur</b> parle. Roxy <b>leur</b> a donné des pommes. Dis-<b>leur</b> bonjour !</i></p>
      <div class="astuce">💡 On peut le remplacer par <b>lui</b> : <i>je <u>lui</u> parle</i> → <b>leur</b>, sans s.</div>
      <h4>leur ou leurs devant un nom : il s’accorde</h4>
      <p>👉 <i>Les élèves attendent <b>leur</b> maîtresse</i> (une seule maîtresse).<br>
         👉 <i>Les enfants rangent <b>leurs</b> jouets</i> (plusieurs jouets).</p>
      <div class="astuce">💡 Regarde le nom qui suit : singulier → <b>leur</b> ; pluriel → <b>leurs</b>.</div>
    `,
  });

  // ======================================================================
  // 4. la, l'a ou là ?
  // ======================================================================
  ajouterHomophones({
    id: '5e-orthographe-la-ou-la',
    choix: ['la', 'l’a', 'là'],
    expliquer(phrase, reponse) {
      const test = `Remplace par « l’avait » : ${essai(phrase, 'l’avait')}`;
      if (reponse === 'l’a') {
        return `${test} ✔<br>Ça marche : c’est le verbe <b>avoir</b>, avec « l’ » devant (= le ou la) → <b>l’a</b>.`;
      }
      if (reponse === 'la') {
        return `${test} ✘<br>Ici, « la » est devant un nom (la pomme) ou devant un verbe (je la connais) : `
          + 'c’est un article ou un pronom, <b>sans accent</b>.';
      }
      return `${test} ✘<br>Ici, « là » indique un <b>lieu</b> (on peut dire « ici »), ou il accompagne un mot `
        + 'avec un trait d’union (ce jour-là, là-bas) : <b>avec un accent</b> !';
    },
    phrases: {
      la: ['Roxy mange ___ pomme.', 'Ferme ___ porte, s’il te plaît.', 'Cette chanson, je ___ connais par cœur.',
        'Ta robe ? Je ___ trouve très jolie.', 'Il regarde ___ lune.', 'Ouvre ___ fenêtre !',
        'Ma sœur ? Je ___ vois demain.', 'J’ai perdu ___ clé.'],
      'l’a': ['Cette histoire, Tom ___ lue hier.', 'Le gâteau ? Roxy ___ mangé !', 'Mon livre, il me ___ rendu.',
        'La lettre, elle ___ écrite seule.', 'Le trésor ? Personne ne ___ trouvé.', 'Ce film, on ___ vu trois fois.',
        'La porte ? Le vent ___ ouverte.', 'Mon vélo, papa ___ réparé.'],
      là: ['Pose ton sac ___.', 'Je suis ___ !', 'Viens par ___ !', 'Ce jour-___, il y avait un cyclone.', 'Qui est ___ ?',
        'Reste ___, je reviens.', 'Regarde ___-bas !', 'Ce livre-___ est à moi.'],
    },
    titreLecon: 'la, l’a ou là ?',
    lecon: `
      <h4>la : article ou pronom</h4>
      <p>👉 <i><b>la</b> pomme, <b>la</b> porte</i> · <i>Cette chanson, je <b>la</b> connais.</i></p>
      <h4>l’a : le verbe avoir</h4>
      <p>👉 <i>Le gâteau ? Roxy <b>l’a</b> mangé !</i></p>
      <h4>là : un lieu</h4>
      <p>👉 <i>Pose ton sac <b>là</b>. Viens par <b>là</b> !</i> Et avec un trait d’union : <i>ce jour-<b>là</b>, <b>là</b>-bas</i>.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b><br>
        On peut dire « <b>l’avait</b> » → <b>l’a</b> : <i>Roxy <u>l’avait</u> mangé.</i><br>
        On peut dire « <b>ici</b> » → <b>là</b> : <i>Pose ton sac <u>ici</u>.</i><br>
        Sinon → <b>la</b>.</div>
    `,
  });

  // ======================================================================
  // 5. peu, peut ou peux ?
  // ======================================================================
  ajouterHomophones({
    id: '5e-orthographe-peu-ou-peut',
    choix: ['peu', 'peut', 'peux'],
    expliquer(phrase, reponse) {
      if (reponse === 'peut') {
        return `Remplace par « pouvait » : ${essai(phrase, 'pouvait')} ✔<br>`
          + 'C’est le verbe <b>pouvoir</b>. Avec il, elle, on (ou un nom), il se termine par un <b>t</b> : peut.';
      }
      if (reponse === 'peux') {
        return `Remplace par « pouvais » : ${essai(phrase, 'pouvais')} ✔<br>`
          + 'C’est le verbe <b>pouvoir</b>. Avec je et tu, il se termine par un <b>x</b> : peux.';
      }
      return `Remplace par « pouvait » : ${essai(phrase, 'pouvait')} ✘<br>`
        + 'Ici, « peu » veut dire « <b>pas beaucoup</b> » : c’est un adverbe, il ne change jamais.';
    },
    phrases: {
      peu: ['Roxy mange très ___.', 'Il reste un ___ de gâteau.', 'J’ai ___ de temps.', 'Attends un ___ !',
        'Il y a ___ de nuages aujourd’hui.', 'Elle parle ___.', 'Je suis un ___ fatiguée.', 'Ce film est ___ connu.'],
      peut: ['Roxy ___ sauter très haut.', 'On ___ jouer dehors ?', 'Il ne ___ pas venir.',
        'Ma sœur ___ nager longtemps.', 'Le chat ___ dormir toute la journée.', 'Elle ___ t’aider.',
        'Cela ___ arriver à tout le monde.', 'Qui ___ répondre ?'],
      peux: ['Je ___ venir avec toi ?', 'Tu ___ m’aider ?', 'Je ne ___ pas dormir.', 'Tu ___ entrer.',
        'Je ___ le faire toute seule.', 'Est-ce que je ___ sortir ?', 'Tu ne ___ pas tricher !', 'Je ___ courir très vite.'],
    },
    titreLecon: 'peu, peut ou peux ?',
    lecon: `
      <h4>peu : pas beaucoup</h4>
      <p>👉 <i>Roxy mange très <b>peu</b>. Attends un <b>peu</b> !</i></p>
      <h4>peut, peux : le verbe pouvoir</h4>
      <p>👉 <i>je <b>peux</b>, tu <b>peux</b></i> (avec un x) · <i>il <b>peut</b>, elle <b>peut</b>, on <b>peut</b></i> (avec un t)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace par <b>pouvait</b> (ou pouvais).<br>
        ✔ Ça marche → c’est le verbe pouvoir : <b>peut</b> ou <b>peux</b>, selon le sujet.<br>
        ✘ Ça ne marche pas → <b>peu</b>.</div>
    `,
  });

  // ======================================================================
  // 6. Le pluriel des noms
  // ======================================================================
  // [le nom au singulier, son pluriel, le pluriel faux le plus tentant, la règle]
  const PLURIELS = [
    ['un cheval', 'chevaux', 'chevals', 'al'], ['un journal', 'journaux', 'journals', 'al'],
    ['un animal', 'animaux', 'animals', 'al'], ['un hôpital', 'hôpitaux', 'hôpitals', 'al'],
    ['un métal', 'métaux', 'métals', 'al'],
    ['un festival', 'festivals', 'festivaux', 'al-exception'], ['un carnaval', 'carnavals', 'carnavaux', 'al-exception'],
    ['un chacal', 'chacals', 'chacaux', 'al-exception'], ['un récital', 'récitals', 'récitaux', 'al-exception'],
    ['un détail', 'détails', 'détaux', 'ail'], ['un éventail', 'éventails', 'éventaux', 'ail'],
    ['un portail', 'portails', 'portaux', 'ail'],
    ['un travail', 'travaux', 'travails', 'ail-exception'], ['un vitrail', 'vitraux', 'vitrails', 'ail-exception'],
    ['un corail', 'coraux', 'corails', 'ail-exception'],
    ['un trou', 'trous', 'troux', 'ou'], ['un clou', 'clous', 'cloux', 'ou'], ['un kangourou', 'kangourous', 'kangouroux', 'ou'],
    ['un bijou', 'bijoux', 'bijous', 'ou-exception'], ['un caillou', 'cailloux', 'caillous', 'ou-exception'],
    ['un chou', 'choux', 'chous', 'ou-exception'], ['un genou', 'genoux', 'genous', 'ou-exception'],
    ['un hibou', 'hiboux', 'hibous', 'ou-exception'], ['un joujou', 'joujoux', 'joujous', 'ou-exception'],
    ['un pou', 'poux', 'pous', 'ou-exception'],
    ['un bateau', 'bateaux', 'bateaus', 'eau'], ['un gâteau', 'gâteaux', 'gâteaus', 'eau'],
    ['un tuyau', 'tuyaux', 'tuyaus', 'eau'], ['un cheveu', 'cheveux', 'cheveus', 'eau'], ['un jeu', 'jeux', 'jeus', 'eau'],
    ['un pneu', 'pneus', 'pneux', 'eu-exception'], ['un bleu', 'bleus', 'bleux', 'eu-exception'],
    ['une souris', 'souris', 'sourises', 'sxz'], ['un prix', 'prix', 'prixs', 'sxz'], ['un nez', 'nez', 'nezs', 'sxz'],
    ['un œil', 'yeux', 'œils', 'irregulier'],
  ];

  const REGLES_PLURIEL = {
    al: 'Les noms en <b>-al</b> font leur pluriel en <b>-aux</b> : un cheval → des chevaux.',
    'al-exception': 'Attention, exception ! Quelques noms en -al prennent simplement un <b>s</b> : '
      + 'bal, carnaval, chacal, festival, récital, régal.',
    ail: 'Les noms en <b>-ail</b> prennent simplement un <b>s</b> : un détail → des détails.',
    'ail-exception': 'Attention, exception ! Quelques noms en -ail font <b>-aux</b> : '
      + 'bail, corail, émail, soupirail, travail, vitrail.',
    ou: 'Les noms en <b>-ou</b> prennent un <b>s</b> : un trou → des trous.',
    'ou-exception': 'Attention, exception ! Sept noms en -ou prennent un <b>x</b> : '
      + 'bijou, caillou, chou, genou, hibou, joujou, pou.',
    eau: 'Les noms en <b>-eau</b>, <b>-au</b> et <b>-eu</b> prennent un <b>x</b> : un gâteau → des gâteaux, un jeu → des jeux.',
    'eu-exception': 'Attention, exception ! Quelques noms en -eu ou -au prennent un <b>s</b> : '
      + 'pneu, bleu, émeu, landau, sarrau.',
    sxz: 'Les noms qui finissent déjà par <b>s</b>, <b>x</b> ou <b>z</b> ne changent pas au pluriel.',
    irregulier: 'Attention, c’est un pluriel tout à fait spécial : un œil → des <b>yeux</b> !',
  };

  ajouterEtape({
    id: '5e-orthographe-pluriel-noms',
    banque: PLURIELS,
    creerQuestion: ([singulier, pluriel, faux, regle]) => fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
      phrase: `${singulier} → des ___`,
      reponse: pluriel,
      choix: RM.melanger([pluriel, faux]),
      mauvais: [faux],
      explication: REGLES_PLURIEL[regle],
      consigneChoix: 'Choisis le bon pluriel',
      consigneEcrire: 'Écris le nom au pluriel',
    }),
    titreLecon: 'Le pluriel des noms',
    lecon: `
      <p>En général, on ajoute un <b>s</b> au pluriel : un chat → des chats. Mais certaines fins de mots ont leurs règles…</p>
      <table>
        <tr><th>fin du nom</th><th>règle</th><th>exceptions</th></tr>
        <tr><td>-al</td><td>→ <b>-aux</b> : chevaux</td><td>bals, carnavals, chacals, festivals, récitals, régals</td></tr>
        <tr><td>-ail</td><td>→ <b>-ails</b> : détails</td><td>baux, coraux, émaux, soupiraux, travaux, vitraux</td></tr>
        <tr><td>-ou</td><td>→ <b>-ous</b> : trous</td><td>bijoux, cailloux, choux, genoux, hiboux, joujoux, poux</td></tr>
        <tr><td>-eau, -au, -eu</td><td>→ <b>x</b> : gâteaux, jeux</td><td>pneus, bleus, émeus, landaus, sarraus</td></tr>
        <tr><td>-s, -x, -z</td><td>ne changent pas</td><td>des souris, des prix, des nez</td></tr>
      </table>
      <div class="astuce">💡 Pour retenir les 7 noms en -ou qui prennent un x, une phrase à apprendre :
        « Viens <b>mon chou</b>, <b>mon bijou</b>, <b>mon joujou</b>, sur mes <b>genoux</b>, et jette des <b>cailloux</b>
        à ce <b>hibou</b> plein de <b>poux</b> ! »</div>
      <p>⚠️ Un pluriel très spécial : un œil → des <b>yeux</b>.</p>
    `,
  });
})();
