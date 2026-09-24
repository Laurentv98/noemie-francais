// Renard Malin — Orthographe, niveau 3e : les 6 étapes de la Rivière des étoiles
//
// Les phrases sont écrites à la main, avec ___ à la place du mot à trouver.
// Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { indice, fabriquer, tirerType, ajouterEtape, ajouterHomophones, accorderCas, quatreFormes,
    genreNombre } = RM.phrases;

  // ======================================================================
  // 1. Le participe passé des verbes pronominaux
  // ======================================================================
  const EXPLICATIONS_PRONOMINAUX = {
    // « se » est COD : accord avec le sujet
    cod: (rep, [sujet, cas]) => `Ici, « se » est <b>COD</b> (le sujet fait l’action sur lui-même) : le participe s’accorde avec le sujet `
      + `« ${sujet} », qui est ${genreNombre(cas)} → <b>${rep}</b>.`,
    // verbes qui n'existent qu'à la forme pronominale : accord avec le sujet
    essentiel: (rep, [sujet, cas, infinitif]) => `« ${infinitif} » n’existe qu’à la forme pronominale : le participe `
      + `s’accorde avec le sujet « ${sujet} », qui est ${genreNombre(cas)} → <b>${rep}</b>.`,
    // « se » est COI (parler À quelqu'un) : pas d'accord
    coi: (rep, [construction]) => `Ici, « se » est <b>COI</b> (${construction}) : il n’y a pas de COD avant le verbe, `
      + `donc <b>pas d’accord</b> → <b>${rep}</b>.`,
    // un COD est placé après le verbe : pas d'accord
    codApres: (rep, [cod, sens]) => `Ici, le COD « ${cod} » est placé <b>après</b> le verbe (« se » veut dire « ${sens} ») : `
      + `<b>pas d’accord</b> → <b>${rep}</b>.`,
    // un COD est placé avant le verbe : accord avec lui
    codAvant: (rep, [cod, cas]) => `Ici, le COD « ${cod} » est placé <b>avant</b> le verbe : le participe s’accorde avec lui `
      + `(${genreNombre(cas)}) → <b>${rep}</b>.`,
  };
  // [phrase, participe passé, sorte de règle, infos pour l'explication, genre et nombre pour l'accord]
  const PRONOMINAUX = [
    ['Les filles se sont ___ tôt.', 'levé', 'cod', ['les filles', 'fp'], 'fp'],
    ['Roxy s’est ___ derrière un arbre.', 'caché', 'cod', ['Roxy', 'fs'], 'fs'],
    ['Mes cousins se sont ___ dans le parc.', 'promené', 'cod', ['mes cousins', 'mp'], 'mp'],
    ['Elle s’est ___ les mains.', 'lavé', 'codApres', ['les mains', 'à elle-même']],
    ['Elles se sont ___ au téléphone.', 'parlé', 'coi', ['parler à quelqu’un']],
    ['Les oiseaux se sont ___.', 'envolé', 'essentiel', ['les oiseaux', 'mp', 's’envoler'], 'mp'],
    ['Ils se sont ___ toute la soirée.', 'téléphoné', 'coi', ['téléphoner à quelqu’un']],
    ['Les deux amies se sont ___.', 'souri', 'coi', ['sourire à quelqu’un']],
    ['Ma grand-mère s’est ___ de mon anniversaire.', 'souvenu', 'essentiel', ['ma grand-mère', 'fs', 'se souvenir'], 'fs'],
    ['Léa s’est ___ les cheveux.', 'brossé', 'codApres', ['les cheveux', 'à elle-même']],
    ['Les garçons se sont bien ___.', 'amusé', 'cod', ['les garçons', 'mp'], 'mp'],
    ['Elles se sont ___ de nous.', 'moqué', 'essentiel', ['elles', 'fp', 'se moquer'], 'fp'],
    ['Les chats se sont ___ sur le canapé.', 'couché', 'cod', ['les chats', 'mp'], 'mp'],
    ['Elle s’est ___ le genou contre la table.', 'cogné', 'codApres', ['le genou', 'à elle-même']],
    ['Les voleurs se sont ___.', 'enfui', 'essentiel', ['les voleurs', 'mp', 's’enfuir'], 'mp'],
    ['Les jours se sont ___.', 'succédé', 'coi', ['succéder à quelque chose']],
    ['Les deux sœurs se sont ___ des lettres.', 'écrit', 'codApres', ['des lettres', 'l’une à l’autre']],
    ['Les lettres qu’elles se sont ___ sont touchantes.', 'écrit', 'codAvant', ['qu’ (= les lettres)', 'fp'], 'fp'],
    ['Elle s’est ___ à six heures.', 'réveillé', 'cod', ['elle', 'fs'], 'fs'],
    ['Ils s’en sont ___ sans dire au revoir.', 'allé', 'essentiel', ['ils', 'mp', 's’en aller'], 'mp'],
    ['Roxy et Léa se sont ___ tout de suite.', 'plu', 'coi', ['plaire à quelqu’un']],
    ['Elle s’est ___ une jolie robe.', 'acheté', 'codApres', ['une jolie robe', 'pour elle-même']],
    ['La robe qu’elle s’est ___ est jolie.', 'acheté', 'codAvant', ['qu’ (= la robe)', 'fs'], 'fs'],
  ];

  ajouterEtape({
    id: '3e-orthographe-participe-pronominaux',
    banque: PRONOMINAUX,
    creerQuestion([phrase, participe, sorte, infos, cas]) {
      const reponse = cas ? accorderCas(participe, cas) : participe;
      const formes = quatreFormes(participe);
      return fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: RM.melanger(formes),
        mauvais: formes.filter(f => f !== reponse),
        explication: EXPLICATIONS_PRONOMINAUX[sorte](reponse, infos),
        consigneChoix: 'Choisis le participe passé bien accordé',
        consigneEcrire: 'Écris le participe passé bien accordé',
      });
    },
    titreLecon: 'Le participe passé des verbes pronominaux',
    lecon: `
      <p>Les verbes pronominaux (se laver, se parler…) se conjuguent avec <b>être</b>… mais leur participe passé
        suit presque la règle de l’auxiliaire <b>avoir</b>. Voici la méthode en 3 questions :</p>
      <h4>1. Le verbe existe-t-il seulement à la forme pronominale ?</h4>
      <p>s’enfuir, s’envoler, se souvenir, se moquer, s’en aller… → accord avec le <b>sujet</b> :
        <i>Les oiseaux se sont envol<b>és</b>.</i></p>
      <h4>2. « se » est-il COD ?</h4>
      <p>Elle a levé qui ? elle-même → « se » est COD, il est avant → accord avec le sujet :
        <i>Les filles se sont lev<b>ées</b>.</i></p>
      <h4>3. « se » est-il COI (parler <u>à</u> quelqu’un) ?</h4>
      <p>se parler, se téléphoner, se sourire, se plaire, se succéder… → <b>pas d’accord</b> :
        <i>Elles se sont parl<b>é</b>.</i></p>
      <div class="astuce">💡 Et s’il y a un <b>COD après</b> le verbe, pas d’accord : <i>Elle s’est lavé <u>les mains</u>.</i><br>
        Mais s’il est <b>avant</b>, on accorde avec lui : <i><u>La robe</u> qu’elle s’est achet<b>ée</b>.</i></div>
    `,
  });

  // ======================================================================
  // 2. quelque ou quel que ?
  // ======================================================================
  ajouterHomophones({
    id: '3e-orthographe-quelque',
    choix: reponse => (reponse.includes(' que')
      ? ['quel que', 'quelle que', 'quels que', 'quelles que']
      : ['quelque', 'quelques', 'quel que', 'quels que']),
    proportions: { choix: 0.8, vraifaux: 0.2 },
    expliquer(phrase, reponse, info) {
      if (reponse === 'quelques') {
        return `Ici, « quelques » est devant le nom pluriel « ${info} » et veut dire « <b>plusieurs</b> » → quelques, avec un s.`;
      }
      if (reponse === 'quelque') {
        return `Ici, « quelque » est devant un nom au <b>singulier</b> (« ${info} ») et veut dire « un certain, un peu de » → quelque, sans s.`;
      }
      const [sujet, cas] = info;
      return 'Devant le verbe <b>être au subjonctif</b> (soit, soient), on écrit « quel que » en <b>deux mots</b>. '
        + `« Quel » s’accorde avec le sujet du verbe, « ${sujet} », qui est ${genreNombre(cas)} → <b>${reponse}</b>.`;
    },
    phrases: {
      quelque: [['Tu as ___ chose à me dire ?', 'chose'], ['Depuis ___ temps, Roxy est triste.', 'temps'],
        ['Il a eu ___ difficulté à répondre.', 'difficulté']],
      quelques: [['J’ai invité ___ amis.', 'amis'], ['Il reste ___ bonbons.', 'bonbons'], ['Attends ___ minutes !', 'minutes'],
        ['Roxy a vu ___ lapins.', 'lapins'], ['Il a fait ___ fautes.', 'fautes'], ['Dans ___ jours, ce sont les vacances.', 'jours']],
      'quel que': [['Nous partirons, ___ soit le temps.', ['le temps', 'ms']], ['Je t’aiderai, ___ soit ton problème.', ['ton problème', 'ms']]],
      'quelle que': [['Je t’aimerai, ___ soit ta décision.', ['ta décision', 'fs']], ['Tu viendras, ___ soit l’heure.', ['l’heure', 'fs']]],
      'quels que': [['Je t’écouterai, ___ soient tes arguments.', ['tes arguments', 'mp']],
        ['Elle sourit toujours, ___ soient ses soucis.', ['ses soucis', 'mp']]],
      'quelles que': [['Il réussira, ___ soient les difficultés.', ['les difficultés', 'fp']],
        ['Nous resterons amis, ___ soient nos disputes.', ['nos disputes', 'fp']]],
    },
    titreLecon: 'quelque ou quel que ?',
    lecon: `
      <h4>quelque(s) : devant un nom</h4>
      <p>• au pluriel, il veut dire « <b>plusieurs</b> » : <i><b>quelques</b> amis, <b>quelques</b> minutes</i> ;<br>
         • au singulier, « <b>un certain</b> » : <i><b>quelque</b> chose, depuis <b>quelque</b> temps</i>.</p>
      <h4>quel que : devant le verbe être au subjonctif</h4>
      <p>Il s’écrit en <b>deux mots</b>, et « quel » s’accorde avec le sujet de « soit / soient » :</p>
      <p>👉 <i><b>quel que</b> soit le temps · <b>quelle que</b> soit ta décision · <b>quels que</b> soient tes arguments ·
        <b>quelles que</b> soient les difficultés</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> si le mot suivant est « <b>soit</b> » ou « <b>soient</b> », c’est « quel que »
        en deux mots, accordé avec le nom qui vient après le verbe.</div>
    `,
  });

  // ======================================================================
  // 3. Participe présent ou adjectif verbal ?
  // ======================================================================
  // [phrase, réponse, l'autre forme, sorte ('adjectif' ou 'participe'), nom décrit, verbe]
  const ADJECTIFS_VERBAUX = [
    ['C’est un travail ___.', 'fatigant', 'fatiguant', 'adjectif', 'travail', 'fatiguer'],
    ['Il est rentré tard, ___ ses parents.', 'fatiguant', 'fatigant', 'participe', null, 'fatiguer'],
    ['Voici un argument ___.', 'convaincant', 'convainquant', 'adjectif', 'argument', 'convaincre'],
    ['Il a gagné en ___ le jury.', 'convainquant', 'convaincant', 'participe', null, 'convaincre'],
    ['Il a fait une remarque ___.', 'provocante', 'provoquant', 'adjectif', 'remarque', 'provoquer'],
    ['Il s’est enfui en ___ ses camarades.', 'provoquant', 'provocant', 'participe', null, 'provoquer'],
    ['Les jours ___ l’examen, elle a beaucoup révisé.', 'précédant', 'précédents', 'participe', null, 'précéder'],
    ['Le jour ___, il avait plu.', 'précédent', 'précédant', 'adjectif', 'jour', 'précéder'],
    ['C’est un élève ___.', 'négligent', 'négligeant', 'adjectif', 'élève', 'négliger'],
    ['En ___ ses devoirs, il a eu de mauvaises notes.', 'négligeant', 'négligent', 'participe', null, 'négliger'],
    ['Nous avons des avis ___.', 'différents', 'différant', 'adjectif', 'avis', 'différer'],
    ['Nos avis ___ sur ce point, nous avons discuté.', 'différant', 'différents', 'participe', null, 'différer'],
    ['Ce film est vraiment ___.', 'intrigant', 'intriguant', 'adjectif', 'film', 'intriguer'],
    ['Il s’est fait des ennemis en ___ contre ses voisins.', 'intriguant', 'intrigant', 'participe', null, 'intriguer'],
    ['Le personnel ___ de l’avion est prêt.', 'navigant', 'naviguant', 'adjectif', 'personnel', 'naviguer'],
    ['En ___ sur la rivière, Roxy a vu un castor.', 'naviguant', 'navigant', 'participe', null, 'naviguer'],
    ['Il fait une chaleur ___.', 'suffocante', 'suffoquant', 'adjectif', 'chaleur', 'suffoquer'],
    ['Il est sorti de la pièce en ___.', 'suffoquant', 'suffocant', 'participe', null, 'suffoquer'],
    ['Ces deux pièces sont ___.', 'communicantes', 'communiquant', 'adjectif', 'pièces', 'communiquer'],
    ['Il garde le contact en ___ par lettres.', 'communiquant', 'communicant', 'participe', null, 'communiquer'],
    ['C’est un homme très ___.', 'influent', 'influant', 'adjectif', 'homme', 'influer'],
    ['Ces résultats, ___ sur notre choix, sont importants.', 'influant', 'influents', 'participe', null, 'influer'],
    ['C’est une idée ___.', 'excellente', 'excellant', 'adjectif', 'idée', 'exceller'],
    ['En ___ en maths, elle a gagné le concours.', 'excellant', 'excellent', 'participe', null, 'exceller'],
  ];

  ajouterEtape({
    id: '3e-orthographe-adjectif-verbal',
    banque: ADJECTIFS_VERBAUX,
    creerQuestion([phrase, reponse, autre, sorte, nom, verbe]) {
      const explication = sorte === 'adjectif'
        ? `Ici, le mot <b>décrit</b> le nom « ${nom} », comme un adjectif : c’est l’<b>adjectif verbal</b>. `
          + `Il s’accorde, et son orthographe change : <b>${reponse}</b> (et pas ${autre}).`
        : `Ici, le mot ${/en ___/.test(phrase) ? 'vient après « en » (c’est un gérondif)' : 'est suivi d’un complément'} : `
          + `c’est le <b>participe présent</b>. Il est invariable et garde l’orthographe du verbe « ${verbe} » → <b>${reponse}</b>.`;
      return fabriquer(tirerType({ choix: 0.7, vraifaux: 0.3 }), {
        phrase,
        reponse,
        choix: RM.melanger([reponse, autre]),
        mauvais: [autre],
        explication,
        aide: indice(verbe),
        consigneChoix: 'Participe présent ou adjectif verbal ?',
      });
    },
    titreLecon: 'Participe présent ou adjectif verbal ?',
    lecon: `
      <p>Certains verbes ont deux formes en -ant (ou -ent) qui se prononcent pareil… mais ne s’écrivent pas pareil !</p>
      <h4>Le participe présent : une action</h4>
      <p>Il est <b>invariable</b>, souvent suivi d’un complément ou après « en ». Il garde l’orthographe du verbe :
        <i>en fatig<b>u</b>ant ses parents, en convain<b>qu</b>ant le jury</i>.</p>
      <h4>L’adjectif verbal : une qualité</h4>
      <p>Il <b>décrit</b> un nom et <b>s’accorde</b> avec lui : <i>un travail fatigant, une remarque provocante</i>.</p>
      <table>
        <tr><th>participe présent</th><th>adjectif verbal</th></tr>
        <tr><td>fatiguant</td><td>fatigant</td></tr>
        <tr><td>convainquant, provoquant, communiquant, suffoquant</td><td>convaincant, provocant, communicant, suffocant</td></tr>
        <tr><td>intriguant, naviguant</td><td>intrigant, navigant</td></tr>
        <tr><td>précédant, différant, excellant, influant</td><td>précédent, différent, excellent, influent</td></tr>
        <tr><td>négligeant</td><td>négligent</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> essaie de mettre le mot au féminin ou de dire « très » devant.
        Si ça marche (une remarque <u>très</u> provocante), c’est l’adjectif verbal.</div>
    `,
  });

  // ======================================================================
  // 4. Écrire les nombres (vingt, cent, mille)
  // ======================================================================
  const REGLES_NOMBRES = {
    vingtFin: '« vingt » prend un <b>s</b> quand il est <b>multiplié</b> (quatre × vingt) <b>et</b> qu’il termine le nombre : quatre-vingts.',
    vingtSuivi: '« vingt » est multiplié, mais il est <b>suivi</b> d’un autre nombre : <b>pas de s</b> (quatre-vingt-deux, quatre-vingt-dix).',
    vingtSeul: '« vingt » n’est pas multiplié : <b>pas de s</b>.',
    centFin: '« cent » prend un <b>s</b> quand il est <b>multiplié</b> (deux × cent) <b>et</b> qu’il termine le nombre : deux cents.',
    centSuivi: '« cent » est multiplié, mais il est <b>suivi</b> d’un autre nombre : <b>pas de s</b> (deux cent cinq).',
    centSeul: '« cent » tout seul n’est pas multiplié : <b>pas de s</b>.',
    centVingt: '« cent » est suivi d’un autre nombre : pas de s. Mais « quatre-vingts » termine le nombre : il garde son s.',
    centSeulVingt: '« cent » tout seul n’est pas multiplié : pas de s. Et « quatre-vingts » termine le nombre : il garde son s.',
    mille: '« mille » est <b>invariable</b> : il ne prend jamais de s.',
    milleVingt: '« mille » est toujours invariable, et « quatre-vingts » termine le nombre : il garde son s.',
    milleCent: '« mille » est toujours invariable, et « cents » est multiplié et termine le nombre : il prend un s.',
  };
  // [phrase, nombre en chiffres, réponse, pièges, règle]
  const NOMBRES = [
    ['Roxy a compté ___ moutons.', '80', 'quatre-vingts', ['quatre-vingt'], 'vingtFin'],
    ['Il y a ___ élèves dans le collège.', '82', 'quatre-vingt-deux', ['quatre-vingts-deux'], 'vingtSuivi'],
    ['Ce livre a ___ pages.', '200', 'deux cents', ['deux cent'], 'centFin'],
    ['Le trajet dure ___ minutes.', '205', 'deux cent cinq', ['deux cents cinq'], 'centSuivi'],
    ['Ce vélo coûte ___ euros.', '1000', 'mille', ['milles'], 'mille'],
    ['La montagne mesure ___ mètres.', '3000', 'trois mille', ['trois milles'], 'mille'],
    ['Le stade compte ___ places.', '300', 'trois cents', ['trois cent'], 'centFin'],
    ['Il a parcouru ___ kilomètres.', '380', 'trois cent quatre-vingts', ['trois cents quatre-vingts', 'trois cent quatre-vingt'], 'centVingt'],
    ['Cette forêt a ___ ans.', '1080', 'mille quatre-vingts', ['mille quatre-vingt', 'milles quatre-vingts'], 'milleVingt'],
    ['Il y a ___ arbres dans le parc.', '520', 'cinq cent vingt', ['cinq cents vingt', 'cinq cent vingts'], 'centSuivi'],
    ['Le spectacle a attiré ___ personnes.', '180', 'cent quatre-vingts', ['cents quatre-vingts', 'cent quatre-vingt'], 'centSeulVingt'],
    ['La ville compte ___ habitants.', '2400', 'deux mille quatre cents', ['deux milles quatre cents', 'deux mille quatre cent'], 'milleCent'],
    ['Mon grand-père a ___ ans.', '90', 'quatre-vingt-dix', ['quatre-vingts-dix'], 'vingtSuivi'],
    ['J’ai lu ___ pages cet été.', '600', 'six cents', ['six cent'], 'centFin'],
    ['Le château a ___ fenêtres.', '1200', 'mille deux cents', ['mille deux cent', 'milles deux cents'], 'milleCent'],
    ['Il y a ___ bonbons dans le sac.', '100', 'cent', ['cents'], 'centSeul'],
    ['Cette baleine pèse ___ kilos.', '4080', 'quatre mille quatre-vingts', ['quatre milles quatre-vingts', 'quatre mille quatre-vingt'], 'milleVingt'],
    ['La course fait ___ mètres.', '5000', 'cinq mille', ['cinq milles'], 'mille'],
    ['Ce jeu coûte ___ euros.', '20', 'vingt', ['vingts'], 'vingtSeul'],
    ['Le train transporte ___ voyageurs.', '700', 'sept cents', ['sept cent'], 'centFin'],
    ['Il y a ___ marches jusqu’en haut.', '120', 'cent vingt', ['cents vingt', 'cent vingts'], 'centSeul'],
    ['L’avion vole à ___ kilomètres à l’heure.', '800', 'huit cents', ['huit cent'], 'centFin'],
    ['Mon arrière-grand-mère a ___ ans.', '99', 'quatre-vingt-dix-neuf', ['quatre-vingts-dix-neuf'], 'vingtSuivi'],
    ['Ce trésor contient ___ pièces d’or.', '480', 'quatre cent quatre-vingts', ['quatre cents quatre-vingts', 'quatre cent quatre-vingt'], 'centVingt'],
  ];

  ajouterEtape({
    id: '3e-orthographe-nombres',
    banque: NOMBRES,
    creerQuestion: ([phrase, nombre, reponse, pieges, regle]) => fabriquer(tirerType({ choix: 0.8, vraifaux: 0.2 }), {
      phrase,
      reponse,
      choix: RM.melanger([reponse, ...pieges]),
      mauvais: pieges,
      explication: REGLES_NOMBRES[regle],
      aide: indice(nombre),
      consigneChoix: 'Choisis le nombre bien écrit',
    }),
    titreLecon: 'Écrire les nombres',
    lecon: `
      <h4>vingt et cent : un s… parfois</h4>
      <p>Ils prennent un <b>s</b> quand ils sont <b>multipliés</b> et qu’ils <b>terminent</b> le nombre :</p>
      <table>
        <tr><th>avec un s</th><th>sans s</th></tr>
        <tr><td>quatre-vingt<b>s</b> (80)</td><td>quatre-vingt-deux (82), quatre-vingt-dix (90)</td></tr>
        <tr><td>deux cent<b>s</b> (200)</td><td>deux cent cinq (205), cent (100)</td></tr>
        <tr><td>trois cent quatre-vingt<b>s</b> (380)</td><td>cinq cent vingt (520)</td></tr>
      </table>
      <h4>mille : jamais de s</h4>
      <p>👉 <i>deux <b>mille</b>, trois <b>mille</b> quatre cents</i></p>
      <div class="astuce">💡 Les traits d’union : on les met traditionnellement entre les nombres plus petits que cent
        (quatre-vingt-deux), sauf avec « et » (vingt et un, soixante et onze). Depuis 1990, on peut aussi relier
        tous les mots d’un nombre (deux-cent-cinq) : les deux écritures sont acceptées.
        Ici, on utilise l’écriture traditionnelle.</div>
    `,
  });

  // ======================================================================
  // 5. Les homophones : grande révision
  // ======================================================================
  const PAIRES = {
    a: ['a', 'à'], et: ['et', 'est'], son: ['son', 'sont'], on: ['on', 'ont'], ou: ['ou', 'où'],
    ces: ['ces', 'ses', 'c’est', 's’est'], ce: ['ce', 'se'], leur: ['leur', 'leurs'], la: ['la', 'l’a', 'là'],
    peu: ['peu', 'peut', 'peux'], quel: ['quel', 'quelle', 'qu’elle'], sans: ['sans', 's’en'],
    quand: ['quand', 'quant', 'qu’en'], ni: ['ni', 'n’y'],
  };
  const RAPPELS = {
    a: '<b>a</b> = le verbe avoir (on peut dire « avait ») ; <b>à</b> = le petit mot invariable.',
    et: '<b>est</b> = le verbe être (on peut dire « était ») ; <b>et</b> = le mot qui relie (« et puis »).',
    son: '<b>sont</b> = le verbe être (on peut dire « étaient ») ; <b>son</b> = à lui, à elle (on peut dire « mon »).',
    on: '<b>ont</b> = le verbe avoir (on peut dire « avaient ») ; <b>on</b> = le pronom sujet (on peut dire « il »).',
    ou: '<b>ou</b> = un choix (« ou bien ») ; <b>où</b> = un lieu ou un moment.',
    ces: '<b>ces</b> = on montre (ce, cette) ; <b>ses</b> = à lui, à elle (son, sa) ; <b>c’est</b> = cela est (« c’était ») ; '
      + '<b>s’est</b> = un verbe pronominal au passé composé (je me suis…).',
    ce: '<b>se</b> = devant un verbe pronominal (avec « je » : me) ; <b>ce</b> = il montre (ce livre, ce que…).',
    leur: '<b>leur</b> devant un verbe = « lui », jamais de s ; <b>leur(s)</b> devant un nom s’accorde avec ce nom.',
    la: '<b>l’a</b> = « l’avait » ; <b>là</b> = un lieu (« ici ») ; <b>la</b> = un article ou un pronom.',
    peu: '<b>peut</b>, <b>peux</b> = le verbe pouvoir (« pouvait ») : il peut, je peux ; <b>peu</b> = pas beaucoup.',
    quel: '<b>qu’elle</b> = « qu’il » au féminin ; <b>quel(le)(s)</b> s’accorde avec le nom.',
    sans: '<b>sans</b> = le contraire de « avec » ; <b>s’en</b> = se + en (je m’en vais).',
    quand: '<b>quand</b> = un moment (« lorsque ») ; <b>quant à</b> = en ce qui concerne ; <b>qu’en</b> = que + en.',
    ni: '<b>ni</b> = pour relier dans une phrase négative (ni… ni…) ; <b>n’y</b> = ne + y (il n’y a pas).',
  };
  // [phrase, réponse, famille d'homophones]
  const HOMOPHONES = [
    ['Roxy ___ un foulard rouge.', 'a', 'a'], ['Il pense ___ ses vacances.', 'à', 'a'],
    ['Le ciel ___ couvert ce matin.', 'est', 'et'], ['Les pommes ___ mûres.', 'sont', 'son'],
    ['Léo range ___ vélo.', 'son', 'son'], ['Les enfants ___ gagné.', 'ont', 'on'],
    ['Demain, ___ partira tôt.', 'on', 'on'], ['Tu préfères le bleu ___ le vert ?', 'ou', 'ou'],
    ['Dis-moi ___ tu vas.', 'où', 'ou'], ['Regarde ___ nuages noirs !', 'ces', 'ces'],
    ['Tom a fêté ___ douze ans.', 'ses', 'ces'], ['Je crois que ___ l’heure.', 'c’est', 'ces'],
    ['Il ___ trompé de chemin.', 's’est', 'ces'], ['Le chat ___ cache sous le lit.', 'se', 'ce'],
    ['Dis-moi ___ que tu penses.', 'ce', 'ce'], ['Je ___ ai donné des bonbons.', 'leur', 'leur'],
    ['Les oiseaux nourrissent ___ petits.', 'leurs', 'leur'], ['Le gâteau ? Roxy ___ mangé !', 'l’a', 'la'],
    ['Viens par ___ !', 'là', 'la'], ['Ferme ___ porte.', 'la', 'la'], ['Il ___ nager très vite.', 'peut', 'peu'],
    ['Je mange très ___.', 'peu', 'peu'], ['Tu ___ venir si tu veux.', 'peux', 'peu'],
    ['Je pense ___ viendra.', 'qu’elle', 'quel'], ['À ___ heure commence le film ?', 'quelle', 'quel'],
    ['Il est parti ___ son sac.', 'sans', 'sans'], ['Il ___ va sans rien dire.', 's’en', 'sans'],
    ['Je t’appellerai ___ je serai rentrée.', 'quand', 'quand'], ['Et ___ à moi, je reste ici.', 'quant', 'quand'],
    ['Il n’a ni frère ___ sœur.', 'ni', 'ni'], ['Il ___ a personne dans la rue.', 'n’y', 'ni'],
  ];

  ajouterEtape({
    id: '3e-orthographe-homophones',
    banque: HOMOPHONES,
    creerQuestion: ([phrase, reponse, famille]) => fabriquer(tirerType({ choix: 0.75, vraifaux: 0.25 }), {
      phrase,
      reponse,
      choix: PAIRES[famille],
      mauvais: PAIRES[famille].filter(m => m !== reponse),
      explication: `La bonne réponse est « <b>${reponse}</b> ». Rappel : ${RAPPELS[famille]}`,
      consigneChoix: 'Choisis le bon mot',
    }),
    titreLecon: 'Les homophones : révision',
    lecon: `
      <p>Toutes les astuces de Roxy, rassemblées :</p>
      <table>
        <tr><td><b>a / à</b></td><td>a → « avait »</td></tr>
        <tr><td><b>et / est</b></td><td>est → « était »</td></tr>
        <tr><td><b>son / sont</b></td><td>sont → « étaient » ; son → « mon »</td></tr>
        <tr><td><b>on / ont</b></td><td>ont → « avaient » ; on → « il »</td></tr>
        <tr><td><b>ou / où</b></td><td>ou → « ou bien » ; où → un lieu, un moment</td></tr>
        <tr><td><b>ces / ses / c’est / s’est</b></td><td>ces → on montre ; ses → à lui, à elle ; c’est → « c’était » ; s’est → « je me suis »</td></tr>
        <tr><td><b>ce / se</b></td><td>se → « me » avec je</td></tr>
        <tr><td><b>leur / leurs</b></td><td>leur + verbe → « lui » ; leur(s) + nom → accord</td></tr>
        <tr><td><b>la / l’a / là</b></td><td>l’a → « l’avait » ; là → « ici »</td></tr>
        <tr><td><b>peu / peut / peux</b></td><td>peut, peux → « pouvait »</td></tr>
        <tr><td><b>quelle / qu’elle</b></td><td>qu’elle → « qu’il »</td></tr>
        <tr><td><b>sans / s’en</b></td><td>s’en → « je m’en »</td></tr>
        <tr><td><b>quand / quant / qu’en</b></td><td>quand → « lorsque » ; quant → « quant à »</td></tr>
        <tr><td><b>ni / n’y</b></td><td>n’y → « ne… y » (il n’y a pas)</td></tr>
      </table>
    `,
  });

  // ======================================================================
  // 6. Le participe passé : grande révision (être, avoir, verbes pronominaux)
  // ======================================================================
  const ETAPES_PARTICIPE = ['orthographe-participe-passe', '4e-orthographe-participe-avoir', '3e-orthographe-participe-pronominaux'];

  RM.etapes.push({
    id: '3e-orthographe-participe-revision',
    creerQuestions(nombre) {
      const questions = [];
      const vues = new Set();
      let essais = 0;
      while (questions.length < nombre) {
        const id = RM.hasard(ETAPES_PARTICIPE);
        const etape = RM.etapes.find(e => e.id === id);
        const q = etape.creerQuestions(1)[0];
        if (vues.has(q.solution) && essais++ < 500) continue;
        vues.add(q.solution);
        questions.push(q);
      }
      return questions;
    },
    titreLecon: 'Le participe passé : révision',
    lecon: `
      <p>Les trois règles du participe passé, à connaître pour le brevet :</p>
      <h4>1. Avec être : accord avec le sujet</h4>
      <p>👉 <i>Les filles sont parti<b>es</b>.</i></p>
      <h4>2. Avec avoir : accord avec le COD… s’il est placé avant</h4>
      <p>👉 <i>J’ai cueilli des fleurs.</i> mais <i>Les fleurs que j’ai cueilli<b>es</b>.</i></p>
      <h4>3. Les verbes pronominaux</h4>
      <p>👉 <i>Elles se sont lev<b>ées</b></i> (« se » COD) · <i>Elles se sont parlé</i> (« se » COI) ·
        <i>Elle s’est lavé les mains</i> (COD après).</p>
      <div class="astuce">💡 Et pour savoir si c’est « é » ou « er » : remplace par « vendu » (participe) ou « vendre » (infinitif) !</div>
    `,
  });
})();
