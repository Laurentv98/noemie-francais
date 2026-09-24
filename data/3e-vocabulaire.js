// Renard Malin — Vocabulaire, niveau 3e : les 6 étapes du Jardin du Vocabulaire (de nuit)
//
// Les phrases et les mots sont écrits à la main. Le mot à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement, fabriquer, indice } = RM.phrases;

  // ======================================================================
  // 1. Les figures de style
  // ======================================================================
  const FIGURES = {
    comparaison: {
      nom: 'comparaison',
      regle: 'La <b>comparaison</b> rapproche deux éléments grâce à un <b>outil de comparaison</b> : '
        + 'comme, tel, pareil à, semblable à, ressembler à…',
    },
    metaphore: {
      nom: 'métaphore',
      regle: 'La <b>métaphore</b> rapproche deux éléments <b>sans outil de comparaison</b> : « Tes yeux sont deux lacs ».',
    },
    personnification: {
      nom: 'personnification',
      regle: 'La <b>personnification</b> donne à un objet, un animal ou une idée des <b>traits humains</b> : '
        + 'il parle, sourit, soupire…',
    },
    hyperbole: {
      nom: 'hyperbole',
      regle: 'L’<b>hyperbole</b> <b>exagère</b> pour frapper les esprits : « Je te l’ai dit mille fois ! »',
    },
    antithese: {
      nom: 'antithèse',
      regle: 'L’<b>antithèse</b> oppose deux mots ou deux idées de sens contraire, placés dans <b>deux parties</b> de la phrase.',
    },
    oxymore: {
      nom: 'oxymore',
      regle: 'L’<b>oxymore</b> colle deux mots de sens contraire <b>dans le même groupe</b> : « une obscure clarté ».',
    },
    gradation: {
      nom: 'gradation',
      regle: 'La <b>gradation</b> enchaîne des mots de plus en plus forts (ou de plus en plus faibles).',
    },
    anaphore: {
      nom: 'anaphore',
      regle: 'L’<b>anaphore</b> répète le <b>même mot</b> ou le même groupe <b>au début</b> de plusieurs phrases, vers ou groupes.',
    },
    euphemisme: {
      nom: 'euphémisme',
      regle: 'L’<b>euphémisme</b> <b>adoucit</b> une réalité désagréable ou gênante.',
    },
  };
  // Deux figures trop proches ne sont jamais proposées ensemble :
  // la personnification est une sorte de métaphore, et une gradation finit parfois en exagération.
  const FIGURES_ECARTEES = { personnification: ['metaphore'], gradation: ['hyperbole'] };

  ajouterClassement({
    id: '3e-vocabulaire-figures-style',
    consigne: 'Quelle figure de style reconnais-tu ?',
    categories: FIGURES,
    nombreChoix: 4,
    choixPossibles: cle => Object.keys(FIGURES).filter(c => !(FIGURES_ECARTEES[cle] || []).includes(c)),
    // [extrait, figure, remarque de Roxy]
    banque: [
      ['Tom est rusé comme un renard.', 'comparaison', 'Tom est rapproché d’un renard grâce à l’outil « <b>comme</b> ».'],
      ['La neige, pareille à un tapis blanc, recouvre le jardin.', 'comparaison',
        'L’outil « <b>pareille à</b> » rapproche la neige et un tapis.'],
      ['Le lac, tel un miroir, reflète les montagnes.', 'comparaison', 'L’outil « <b>tel</b> » rapproche le lac et un miroir.'],
      ['Hugo dort comme un loir.', 'comparaison', 'Hugo est rapproché d’un loir grâce à l’outil « <b>comme</b> ».'],
      ['« Cette faucille d’or dans le champ des étoiles » (Hugo, « Booz endormi » ; le poète parle du croissant de lune)',
        'metaphore',
        'Le croissant de lune devient une « faucille d’or » et le ciel un champ, <b>sans outil</b> de comparaison.'],
      ['La cour de récréation est une ruche bourdonnante.', 'metaphore',
        'La cour est rapprochée d’une ruche <b>sans outil</b> de comparaison : il n’y a pas de « comme ».'],
      ['Ce livre est une fenêtre ouverte sur le monde.', 'metaphore',
        'Le livre est rapproché d’une fenêtre <b>sans outil</b> de comparaison.'],
      ['Tes yeux sont deux lacs bleus.', 'metaphore',
        'Le verbe « être » n’est pas un outil de comparaison : les yeux deviennent des lacs, c’est une <b>métaphore</b>.'],
      ['« Le Chêne un jour dit au Roseau… » (La Fontaine)', 'personnification',
        'Un arbre qui <b>parle</b>, comme un être humain : c’est une personnification.'],
      ['Le soleil sourit aux promeneurs.', 'personnification', 'Le soleil <b>sourit</b>, comme une personne.'],
      ['La vieille maison soupire quand le vent souffle.', 'personnification', 'La maison <b>soupire</b>, comme une personne.'],
      ['Les arbres tendent leurs bras vers le ciel.', 'personnification',
        'Les arbres ont des « <b>bras</b> » et les tendent, comme des êtres humains.'],
      ['Je te l’ai dit mille fois !', 'hyperbole', '« Mille fois » : c’est très <b>exagéré</b> !'],
      ['Je meurs de faim !', 'hyperbole', 'On ne meurt pas vraiment : on <b>exagère</b> pour dire qu’on a très faim.'],
      ['Ce sac pèse une tonne.', 'hyperbole', 'Une tonne, c’est mille kilos : c’est très <b>exagéré</b> !'],
      ['Inès attend son bus depuis des siècles.', 'hyperbole', 'Des siècles ? Elle attend depuis longtemps, mais c’est <b>exagéré</b> !'],
      ['« Elle était grande, et, moi, j’étais petit. » (Hugo)', 'antithese',
        '« Grande » et « petit » s’opposent, dans <b>deux parties</b> de la phrase.'],
      ['Le jour, Roxy dort ; la nuit, elle explore la forêt.', 'antithese',
        '« Le jour » et « la nuit », « dort » et « explore » s’opposent, dans <b>deux parties</b> de la phrase.'],
      ['Il faut savoir perdre pour apprendre à gagner.', 'antithese',
        '« Perdre » et « gagner » s’opposent, dans <b>deux parties</b> de la phrase.'],
      ['Dehors, tout est gelé ; près du feu, tout est chaud.', 'antithese',
        '« Gelé » et « chaud » s’opposent, dans <b>deux parties</b> de la phrase.'],
      ['« Cette obscure clarté qui tombe des étoiles » (Corneille)', 'oxymore',
        '« Obscure » et « clarté » sont contraires, et collés <b>dans le même groupe</b>.'],
      ['« Hâtez-vous lentement. » (Boileau)', 'oxymore',
        'Se hâter… « lentement » : deux mots contraires collés <b>dans le même groupe</b>.'],
      ['Un illustre inconnu a gagné le concours de poésie.', 'oxymore',
        '« Illustre » (très connu) et « inconnu » sont contraires, collés <b>dans le même groupe</b>.'],
      ['Quand le professeur est entré, il y a eu un silence assourdissant.', 'oxymore',
        'Un silence ne fait pas de bruit : « silence » et « assourdissant » sont contraires, <b>dans le même groupe</b>.'],
      ['« Va, cours, vole, et nous venge. » (Corneille)', 'gradation',
        '« Va », « cours », « vole » : des verbes de plus en plus <b>rapides</b>.'],
      ['Roxy sourit, rit, puis éclate de rire.', 'gradation', 'Sourire, rire, éclater de rire : c’est de plus en plus <b>fort</b>.'],
      ['Tom chuchote, parle, puis se met à crier.', 'gradation',
        'Chuchoter, parler, crier : la voix est de plus en plus <b>forte</b>.'],
      ['En janvier, l’air devient frais, froid, puis glacial.', 'gradation', 'Frais, froid, glacial : c’est de plus en plus <b>froid</b>.'],
      ['Je veux du chocolat, je veux des bonbons, je veux des gâteaux !', 'anaphore',
        '« Je veux » est <b>répété au début</b> de chaque groupe.'],
      ['Chaque matin, Roxy court ; chaque matin, elle chante ; chaque matin, elle rêve.', 'anaphore',
        '« Chaque matin » est <b>répété au début</b> de chaque partie de la phrase.'],
      ['Il y a des oiseaux dans les arbres, il y a des fleurs dans les prés, il y a du soleil partout.', 'anaphore',
        '« Il y a » est <b>répété au début</b> de chaque groupe.'],
      ['Plus de devoirs, plus de réveil, plus de cantine : vive les vacances !', 'anaphore',
        '« Plus de » est <b>répété au début</b> de chaque groupe.'],
      ['Mon grand-père est un peu dur d’oreille.', 'euphemisme',
        '« Dur d’oreille » est une façon <b>douce</b> de dire qu’il entend très mal.'],
      ['Ta rédaction est encore perfectible.', 'euphemisme',
        '« Perfectible » est une façon <b>polie</b> de dire qu’elle a des défauts.'],
      ['Notre vieille cabane aurait besoin d’un petit rafraîchissement.', 'euphemisme',
        'Une façon <b>douce</b> de dire que la cabane tombe en ruine !'],
      ['Ce roman a quelques longueurs.', 'euphemisme',
        '« Quelques longueurs » : une façon <b>polie</b> de dire qu’il est parfois ennuyeux.'],
    ],
    titreLecon: 'Les figures de style',
    lecon: `
      <p>Une <b>figure de style</b> est une façon de dire les choses qui frappe l’imagination du lecteur.</p>
      <table>
        <tr><th>figure</th><th>ce qu’elle fait</th><th>exemple</th></tr>
        <tr><td><b>comparaison</b></td><td>rapproche deux éléments avec un outil (comme, tel…)</td><td><i>rusé comme un renard</i></td></tr>
        <tr><td><b>métaphore</b></td><td>rapproche deux éléments sans outil</td><td><i>Tes yeux sont deux lacs.</i></td></tr>
        <tr><td><b>personnification</b></td><td>donne des traits humains à une chose</td><td><i>Le soleil sourit.</i></td></tr>
        <tr><td><b>hyperbole</b></td><td>exagère</td><td><i>Je meurs de faim !</i></td></tr>
        <tr><td><b>antithèse</b></td><td>oppose deux mots dans deux parties de la phrase</td><td><i>Le jour, il dort ; la nuit, il joue.</i></td></tr>
        <tr><td><b>oxymore</b></td><td>colle deux mots contraires dans un groupe</td><td><i>une obscure clarté</i></td></tr>
        <tr><td><b>gradation</b></td><td>des mots de plus en plus forts</td><td><i>Va, cours, vole !</i></td></tr>
        <tr><td><b>anaphore</b></td><td>répète un mot ou un groupe au début de plusieurs phrases, vers ou groupes</td><td><i>Je veux…, je veux…</i></td></tr>
        <tr><td><b>euphémisme</b></td><td>adoucit une réalité désagréable</td><td><i>dur d’oreille</i> (= sourd)</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> un outil de comparaison (comme, tel, pareil à…) ? C’est une <b>comparaison</b>.
        Une image sans outil ? C’est une <b>métaphore</b>.<br>
        Deux contraires collés dans le <b>même groupe</b> (<i>obscure clarté</i>) : <b>oxymore</b>.
        Dans deux parties de la phrase : <b>antithèse</b>.</div>
    `,
  });

  // ======================================================================
  // 2. Racines grecques et latines
  // ======================================================================
  // racine : ce qu'on montre ; mot : le mot grec ou latin d'origine (s'il est différent de la racine) ;
  // famille : deux racines de la même famille ont le même sens (hydro et aqua : l'eau),
  //   on ne les propose donc jamais l'une contre l'autre ;
  // mots : des mots formés avec cette racine, et avec AUCUNE autre racine de la liste
  //   (pas de « biographie » : bio + graphe) ; contraire : un piège tentant pour le sens ;
  // eviter : des familles trop proches, jamais proposées en piège (« sol » fait penser au sol, donc à la terre).
  const RACINES = [
    // Les racines grecques
    { racine: 'chrono', origine: 'grec', mot: '<i>chronos</i>', sens: 'le temps', famille: 'temps',
      mots: ['chronomètre', 'chronologie', 'synchroniser'] },
    { racine: 'bio', origine: 'grec', mot: '<i>bios</i>', sens: 'la vie', famille: 'vie',
      mots: ['biologie', 'biodiversité', 'antibiotique'] },
    { racine: 'poly', origine: 'grec', mot: '<i>polus</i>', sens: 'nombreux', famille: 'nombreux',
      mots: ['polygone', 'polyglotte', 'polyvalent'], contraire: 'un seul' },
    { racine: 'anthropo', origine: 'grec', mot: '<i>anthrôpos</i>', sens: 'l’être humain', famille: 'humain',
      mots: ['anthropologie', 'pithécanthrope', 'anthropomorphe'] },
    { racine: 'philo / phile', origine: 'grec', mot: '<i>philein</i>', sens: 'aimer', famille: 'aimer',
      mots: ['philosophie', 'cinéphile', 'bibliophile'], contraire: 'craindre' },
    { racine: 'phobe', origine: 'grec', mot: '<i>phobos</i> (la peur)', sens: 'craindre', famille: 'craindre',
      mots: ['claustrophobe', 'arachnophobe', 'xénophobe'], contraire: 'aimer' },
    { racine: 'pan', origine: 'grec', sens: 'tout', famille: 'tout',
      mots: ['pandémie', 'panthéon', 'panoplie'] },
    { racine: 'géo', origine: 'grec', mot: '<i>gê</i>', sens: 'la terre', famille: 'terre', eviter: ['soleil'],
      mots: ['géologie', 'géométrie'] },
    { racine: 'hydro', origine: 'grec', mot: '<i>hudôr</i>', sens: 'l’eau', famille: 'eau',
      mots: ['hydravion', 'hydrater', 'hydrogène'] },
    { racine: 'graphe', origine: 'grec', mot: '<i>graphein</i>', sens: 'écrire', famille: 'ecrire',
      mots: ['orthographe', 'paragraphe', 'graphique'] },
    { racine: 'phone', origine: 'grec', mot: '<i>phônê</i>', sens: 'la voix, le son', famille: 'son',
      mots: ['francophone', 'phonétique', 'aphone'] },
    { racine: 'télé', origine: 'grec', mot: '<i>têle</i>', sens: 'loin', famille: 'loin',
      mots: ['télécommande', 'télépathie', 'téléphérique'], contraire: 'près' },
    { racine: 'micro', origine: 'grec', mot: '<i>mikros</i>', sens: 'petit', famille: 'petit',
      mots: ['micro-ondes', 'microclimat', 'micro-organisme'], contraire: 'grand' },
    { racine: 'auto', origine: 'grec', mot: '<i>autos</i>', sens: 'soi-même', famille: 'soi',
      mots: ['automobile', 'autonome', 'autoportrait'], contraire: 'les autres' },
    { racine: 'hippo', origine: 'grec', mot: '<i>hippos</i>', sens: 'le cheval', famille: 'cheval',
      mots: ['hippodrome', 'hippique', 'hippomobile'] },
    { racine: 'cardio', origine: 'grec', mot: '<i>kardia</i>', sens: 'le cœur', famille: 'coeur',
      mots: ['cardiaque', 'cardiologue', 'tachycardie'] },
    { racine: 'thermo', origine: 'grec', mot: '<i>thermos</i> (chaud)', sens: 'la chaleur', famille: 'chaleur',
      eviter: ['soleil'], mots: ['thermomètre', 'thermique', 'isotherme'] },
    // Les racines latines
    { racine: 'omni', origine: 'latin', mot: '<i>omnis</i>', sens: 'tout', famille: 'tout',
      mots: ['omniprésent', 'omnisport', 'omniscient'] },
    { racine: 'multi', origine: 'latin', mot: '<i>multus</i>', sens: 'nombreux', famille: 'nombreux',
      mots: ['multicolore', 'multiplier', 'multitude'], contraire: 'un seul' },
    { racine: 'aqua', origine: 'latin', sens: 'l’eau', famille: 'eau',
      mots: ['aquarium', 'aquatique', 'aquarelle'] },
    { racine: 'terra', origine: 'latin', sens: 'la terre', famille: 'terre', eviter: ['soleil'],
      mots: ['terrestre', 'territoire', 'souterrain'] },
    { racine: 'manus', origine: 'latin', sens: 'la main', famille: 'main',
      mots: ['manucure', 'manipuler', 'manuel'] },
    { racine: 'video', origine: 'latin', mot: '<i>videre</i>', sens: 'voir', famille: 'voir',
      mots: ['vidéo', 'évident', 'visible'] },
    { racine: 'audio', origine: 'latin', mot: '<i>audire</i>', sens: 'entendre', famille: 'son',
      mots: ['auditeur', 'audition', 'audible'] },
    { racine: 'bene', origine: 'latin', sens: 'bien', famille: 'bien',
      mots: ['bénévole', 'bénéfique', 'bénédiction'], contraire: 'mal' },
    { racine: 'male', origine: 'latin', sens: 'mal', famille: 'mal',
      mots: ['malveillant', 'maladroit', 'malédiction'], contraire: 'bien' },
    { racine: 'vore', origine: 'latin', mot: '<i>vorare</i> (avaler)', sens: 'manger', famille: 'manger',
      mots: ['carnivore', 'herbivore', 'insectivore'] },
    { racine: 'sol', origine: 'latin', sens: 'le soleil', famille: 'soleil', eviter: ['terre', 'chaleur'],
      mots: ['solaire', 'parasol', 'tournesol'] },
  ];

  // « chrono » vient du grec chronos et veut dire « le temps » : chronomètre, chronologie…
  function histoireRacine(r) {
    const debut = r.mot ? `vient du ${r.origine} ${r.mot} et veut dire` : `est un mot ${r.origine} qui veut dire`;
    return `« ${r.racine} » ${debut} « <b>${r.sens}</b> » : <i>${r.mots.join(', ')}</i>.`;
  }

  // Les pièges : des sens ou des mots venus d'AUTRES familles de racines (ni trop proches)
  const autreFamille = (r, a) => a.famille !== r.famille && !(r.eviter || []).includes(a.famille);
  function sensPieges(r) {
    const autres = RACINES.filter(a => autreFamille(r, a)).map(a => a.sens);
    return [...new Set([r.contraire, ...RM.melanger(autres)].filter(Boolean))].slice(0, 3);
  }
  function motsPieges(r) {
    const pris = [];
    for (const autre of RM.melanger(RACINES)) {
      if (autreFamille(r, autre) && !pris.some(p => p.famille === autre.famille)) pris.push(autre);
    }
    return pris.slice(0, 3).map(autre => RM.hasard(autre.mots));
  }

  ajouterEtape({
    id: '3e-vocabulaire-etymologie',
    banque: RACINES,
    creerQuestion(r) {
      const tirage = Math.random();
      // Le sens d'une racine
      if (tirage < 0.4) {
        return question({
          consigne: 'Que veut dire cette racine ?',
          enonce: `« ${r.racine} »` + indice(`comme dans « ${RM.hasard(r.mots)} »`),
          reponse: r.sens,
          pieges: sensPieges(r),
          solution: `« ${r.racine} » = <b>${r.sens}</b>`,
          explication: histoireRacine(r),
        });
      }
      // Le mot formé avec une racine qui a ce sens
      if (tirage < 0.8) {
        const mot = RM.hasard(r.mots);
        return question({
          consigne: 'Quel mot est formé avec une racine qui veut dire…',
          enonce: `« ${r.sens} »`,
          reponse: mot,
          pieges: motsPieges(r),
          solution: `<b>${mot}</b> (« ${r.racine} » = ${r.sens})`,
          explication: `« ${mot} » est formé avec la racine « ${r.racine} ».<br>` + histoireRacine(r),
        });
      }
      // L'origine : grecque ou latine ?
      return question({
        consigne: 'Cette racine vient-elle du grec ou du latin ?',
        enonce: `« ${r.racine} »` + indice(r.sens),
        reponse: `du ${r.origine}`,
        choix: ['du grec', 'du latin'],
        solution: `« ${r.racine} » vient <b>du ${r.origine}</b>`,
        explication: histoireRacine(r),
      });
    },
    titreLecon: 'Racines grecques et latines',
    lecon: `
      <p>Beaucoup de mots français sont fabriqués avec des <b>racines</b> venues du <b>grec</b> ou du <b>latin</b>.
        Si tu connais la racine, tu devines le sens du mot !</p>
      <h4>Des racines grecques</h4>
      <p>chrono (le temps) · bio (la vie) · poly (nombreux) · anthropo (l’être humain) · philo / phile (aimer) ·
        phobe (craindre) · pan (tout) · géo (la terre) · hydro (l’eau) · graphe (écrire) · phone (la voix) ·
        télé (loin) · micro (petit) · auto (soi-même) · hippo (le cheval) · cardio (le cœur) · thermo (la chaleur)</p>
      <h4>Des racines latines</h4>
      <p>omni (tout) · multi (nombreux) · aqua (l’eau) · terra (la terre) · manus (la main) · video (voir) ·
        audio (entendre) · bene (bien) · male (mal) · vore (manger) · sol (le soleil)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> les lettres <b>ph</b>, <b>th</b>, <b>ch</b> (qui se dit « k ») et <b>y</b>
        trahissent souvent une racine <b>grecque</b> : <i>philo, thermo, chrono, poly</i>.</div>
      <p>⚠️ Le grec et le latin ont parfois chacun une racine pour le même sens : <i>hydro / aqua</i> (l’eau),
        <i>géo / terra</i> (la terre), <i>pan / omni</i> (tout), <i>poly / multi</i> (nombreux).</p>
    `,
  });

  // ======================================================================
  // 3. Des mots pour briller
  // ======================================================================
  // [mot, définition, pièges (de la même forme), exemple, remarque facultative]
  // Les mots presque synonymes (perspicace et sagace, laconique et taciturne, loquace et prolixe,
  // indolent et nonchalant, désuet et vétuste) ne servent jamais de pièges l'un pour l'autre.
  const MOTS_RARES = [
    ['éphémère', 'qui dure très peu de temps', ['qui dure toujours', 'qui revient chaque année', 'qui passe inaperçu'],
      'La neige de printemps est éphémère : elle fond dans la journée.', 'Du grec : « qui ne dure qu’un jour ».'],
    ['perspicace', 'qui perçoit ce qui est caché', ['qui se décourage vite', 'qui parle sans réfléchir', 'qui refuse de changer d’avis'],
      'Perspicace, l’inspectrice a vite trouvé le coupable.'],
    ['sagace', 'qui a un esprit fin et avisé', ['qui est sage et obéissant', 'qui a très mauvais caractère', 'qui raconte des légendes'],
      'Cette remarque sagace a fait avancer le débat.', 'Attention : « sagace » ne veut pas dire « sage » !'],
    ['indolent', 'qui évite le moindre effort', ['qui manque de politesse', 'qui se met vite en colère', 'qui travaille sans relâche'],
      'Indolent, le chat passe ses journées sur le canapé.',
      'Ne confonds pas <b>indolent</b> (qui évite l’effort) et <b>insolent</b> (impoli).'],
    ['nonchalant', 'qui agit mollement, sans hâte', ['qui s’inquiète de tout', 'qui se dépêche toujours', 'qui parle très fort'],
      'Il marchait d’un pas nonchalant, les mains dans les poches.'],
    ['prolixe', 'qui s’exprime trop longuement', ['qui s’exprime en peu de mots', 'qui a beaucoup d’enfants', 'qui écrit sans aucune faute'],
      'Ce conteur prolixe nous a parlé pendant trois heures.'],
    ['laconique', 'qui parle en très peu de mots', ['qui parle trop longuement', 'qui parle d’une voix forte', 'qui aime se moquer des autres'],
      'Sa réponse fut laconique : « Non. »',
      'Les Spartiates, qui vivaient en Laconie, étaient célèbres pour leurs réponses très courtes.'],
    ['taciturne', 'qui reste souvent silencieux', ['qui parle sans arrêt', 'qui travaille la nuit', 'qui ment souvent'],
      'Le vieux berger, taciturne, ne disait presque jamais un mot.'],
    ['loquace', 'qui parle beaucoup', ['qui parle très peu', 'qui a perdu la voix', 'qui parle plusieurs langues'],
      'Loquace, Sami raconte ses vacances à toute la classe.'],
    ['éloquent', 'qui sait convaincre en parlant', ['qui parle d’une voix aiguë', 'qui bégaie souvent', 'qui parle sans arrêt'],
      'Grâce à un discours éloquent, Zoé a été élue déléguée.'],
    ['véhément', 'qui parle avec force et passion', ['qui parle à voix basse', 'qui hésite beaucoup', 'qui s’exprime avec timidité'],
      'Véhément, l’orateur a dénoncé l’injustice sous les applaudissements.'],
    ['opiniâtre', 'qui ne renonce jamais', ['qui donne son avis sur tout', 'qui change souvent d’avis', 'qui se fâche pour un rien'],
      'Grâce à un travail opiniâtre, elle a réussi son brevet.'],
    ['magnanime', 'qui pardonne avec générosité', ['qui est grand et très fort', 'qui garde rancune', 'qui aime commander'],
      'Magnanime, le roi pardonna à ses ennemis.', 'Mot à mot : « à l’âme grande ».'],
    ['pusillanime', 'qui manque de courage', ['qui est plein d’audace', 'qui est tout petit', 'qui aime les animaux'],
      'Trop pusillanime, il n’a pas osé défendre son ami.',
      'Mot à mot : « à l’âme toute petite ». Son contraire : <b>magnanime</b>.'],
    ['intrépide', 'qui ne craint pas le danger', ['qui a peur de tout', 'qui ne tient pas en place', 'qui est très maladroit'],
      'L’intrépide exploratrice a traversé le désert à pied.'],
    ['altruiste', 'qui pense d’abord aux autres', ['qui ne pense qu’à lui-même', 'qui aime l’altitude', 'qui voyage beaucoup'],
      'Altruiste, Inès aide chaque samedi les personnes âgées de son quartier.',
      'Le mot est formé sur « autrui » : les autres. Son contraire : <b>égoïste</b>.'],
    ['cupide', 'qui aime trop l’argent', ['qui tombe vite amoureux', 'qui partage tout', 'qui a peur de tout'],
      'Le marchand cupide vendait ses pommes trois fois trop cher.'],
    ['prodigue', 'qui dépense sans compter', ['qui est extrêmement doué', 'qui économise chaque centime', 'qui a mauvais caractère'],
      'Prodigue, il a dépensé tout son argent de poche en une journée.',
      'Ne confonds pas <b>prodigue</b> (qui dépense trop) et <b>prodige</b> (un enfant prodige est très doué).'],
    ['frugal', 'simple et peu abondant', ['riche et très copieux', 'composé de fruits', 'préparé avec soin'],
      'Après la fête, nous avons pris un repas frugal : une soupe et une pomme.'],
    ['candide', 'qui est naïf et sans méfiance', ['qui est rusé et méfiant', 'qui se présente à une élection', 'qui est très savant'],
      'Candide, il a cru toutes les histoires de son grand frère.',
      'C’est aussi le nom du héros naïf d’un conte de Voltaire.'],
    ['affable', 'qui accueille avec gentillesse', ['qui a toujours faim', 'qui raconte des fables', 'qui est désagréable'],
      'La bibliothécaire, affable, nous a aidés à trouver notre livre.'],
    ['austère', 'qui est sévère, sans fantaisie', ['qui est gai et fantaisiste', 'qui est très riche', 'qui est très généreux'],
      'Le château avait une façade austère, sans aucune décoration.'],
    ['fallacieux', 'qui cherche à tromper', ['qui est obligatoire', 'qui manque de courage', 'qui est très facile'],
      'Méfie-toi de cette publicité aux promesses fallacieuses.'],
    ['sibyllin', 'dont le sens est mystérieux', ['dont le sens est très clair', 'dont la voix est sifflante', 'dont le ton est moqueur'],
      'L’oracle répondit par une phrase sibylline.',
      'Les sibylles étaient des prophétesses de l’Antiquité aux réponses mystérieuses.'],
    ['désuet', 'qui n’est plus à la mode', ['qui est à la dernière mode', 'qui ne sert qu’une seule fois', 'qui est très fragile'],
      'Mamie emploie des mots désuets, comme « chenapan ».'],
    ['vétuste', 'qui est vieux et abîmé', ['qui est tout neuf', 'qui est très vaste', 'qui est très bien décoré'],
      'Le gymnase est si vétuste qu’il faut le rénover.'],
    ['fastidieux', 'qui est long et ennuyeux', ['qui est d’un grand luxe', 'qui va très vite', 'qui est amusant et varié'],
      'Recopier cent fois la même phrase, c’est fastidieux !',
      'Ne confonds pas <b>fastidieux</b> (ennuyeux) et <b>fastueux</b> (luxueux).'],
    ['onéreux', 'qui coûte cher', ['qui est gratuit', 'qui fait rêver', 'qui est très honnête'],
      'Ce voyage est trop onéreux pour notre budget.'],
    ['inéluctable', 'qu’on ne peut pas éviter', ['qu’on ne peut pas comprendre', 'qu’on peut facilement éviter', 'qu’on ne peut pas lire'],
      'La fin des vacances est inéluctable…'],
    ['ubiquité', 'le fait d’être partout à la fois', ['le fait de tout savoir', 'le fait de ne jamais mentir', 'le fait d’être très rapide'],
      'Je n’ai pas le don d’ubiquité : je ne peux pas être au match et au concert !', 'Du latin <i>ubique</i> : partout.'],
    ['érudit', 'qui a de vastes connaissances', ['qui est très impoli', 'qui a une santé fragile', 'qui ne sait presque rien'],
      'Ce professeur érudit connaît l’histoire de chaque monument.'],
    ['placide', 'qui garde toujours son calme', ['qui s’énerve pour un rien', 'qui est très bavard', 'qui est très maladroit'],
      'Même sous l’orage, la vache restait placide.'],
  ];

  ajouterEtape({
    id: '3e-vocabulaire-mots-rares',
    banque: MOTS_RARES,
    creerQuestion: ([mot, definition, pieges, exemple, remarque]) => question({
      consigne: 'Que veut dire ce mot ?',
      enonce: `« ${mot} »`,
      reponse: definition,
      pieges,
      solution: `« ${mot} » = <b>${definition}</b>`,
      explication: `Exemple : <i>${exemple}</i>` + (remarque ? `<br>${remarque}` : ''),
    }),
    titreLecon: 'Des mots pour briller',
    lecon: `
      <p>Un mot <b>précis</b> rend une rédaction plus riche. Au lieu de « très bavard » ou « trop cher », choisis le mot juste !</p>
      <h4>Le caractère</h4>
      <p><b>altruiste</b> (pense aux autres) ≠ égoïste · <b>intrépide</b> (sans peur) ≠ <b>pusillanime</b> (sans courage) ·
        <b>cupide</b> (aime trop l’argent) · <b>magnanime</b>, <b>affable</b>, <b>opiniâtre</b>, <b>candide</b>, <b>perspicace</b>…</p>
      <h4>La parole</h4>
      <p><b>loquace</b> (bavard) · <b>prolixe</b> (trop long) ≠ <b>laconique</b> (en peu de mots) · <b>taciturne</b> (silencieux) ·
        <b>éloquent</b> (qui convainc) · <b>véhément</b> (avec force)</p>
      <h4>Les choses et le temps</h4>
      <p><b>éphémère</b> (qui dure peu) · <b>inéluctable</b> (inévitable) · <b>vétuste</b> (vieux et abîmé) ·
        <b>désuet</b> (démodé) · <b>onéreux</b> (cher) · <b>fastidieux</b> (long et ennuyeux)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> méfie-toi des mots qui se ressemblent !
        <b>prodigue</b> (qui dépense trop) ≠ prodige · <b>fastidieux</b> ≠ fastueux (luxueux) · <b>indolent</b> ≠ insolent.</div>
    `,
  });

  // ======================================================================
  // 4. Certitude ou doute ? (la modalisation)
  // ======================================================================
  // « certainement » n'est pas utilisé : aujourd'hui, il veut souvent dire « probablement ».
  const CONDITIONNEL = 'Le <b>conditionnel</b> des journalistes présente une information qui n’est <b>pas vérifiée</b>.';
  ajouterClassement({
    id: '3e-vocabulaire-modalisation',
    consigne: 'Le {mot} souligné exprime-t-il une certitude ou un doute ?',
    categories: {
      certitude: {
        nom: 'certitude',
        regle: 'Un modalisateur de <b>certitude</b> montre que celui qui parle est <b>sûr</b> de ce qu’il dit : '
          + 'sans aucun doute, assurément, il est évident que, je suis convaincu que…',
      },
      doute: {
        nom: 'doute',
        regle: 'Un modalisateur de <b>doute</b> montre que celui qui parle <b>n’est pas sûr</b> : '
          + 'peut-être, sans doute (= probablement), il semble que, le conditionnel…',
      },
    },
    // [phrase avec le modalisateur souligné, catégorie, remarque de Roxy]
    banque: [
      ['[[Sans aucun doute]], Roxy est la plus rapide de la forêt.', 'certitude',
        '« Sans <b>aucun</b> doute » : il n’y a aucun doute, c’est une certitude.'],
      ['[[Assurément]], ce gâteau sera délicieux.', 'certitude'],
      ['[[Il est évident que]] Tom a raison.', 'certitude'],
      ['[[Je suis convaincu que]] nous allons gagner le match.', 'certitude'],
      ['[[Il est certain que]] la Terre tourne autour du Soleil.', 'certitude'],
      ['Grâce à ce raccourci, nous arriverons [[à coup sûr]] avant la nuit.', 'certitude'],
      ['[[Évidemment]], Léa a gagné la course.', 'certitude'],
      ['[[Je sais que]] tu dis la vérité.', 'certitude'],
      ['[[Incontestablement]], c’est le meilleur livre de l’année.', 'certitude',
        '« Incontestablement » : personne ne peut le contester.'],
      ['[[Il ne fait aucun doute que]] Léa viendra.', 'certitude',
        'Le mot « doute » est là, mais « il ne fait <b>aucun</b> doute » veut dire : c’est sûr !'],
      ['[[Bien sûr]], nous t’aiderons à ranger.', 'certitude'],
      ['[[Je suis sûre que]] Zoé réussira son brevet.', 'certitude'],
      ['Ce film est [[indéniablement]] le plus drôle de l’année.', 'certitude', '« Indéniablement » : on ne peut pas le nier.'],
      ['[[De toute évidence]], Sami a oublié ses clés.', 'certitude'],
      ['Léa viendra [[peut-être]] ce soir.', 'doute'],
      ['Tom est [[sans doute]] déjà parti.', 'doute',
        'Piège ! « Sans doute » veut dire « <b>probablement</b> » : ce n’est pas tout à fait sûr.'],
      ['[[Sans doute]] a-t-il oublié l’heure.', 'doute',
        'Piège ! « Sans doute » veut dire « <b>probablement</b> » : celui qui parle n’en est pas tout à fait sûr.'],
      ['[[Il semble que]] la pluie se calme.', 'doute'],
      ['Nous arriverons [[probablement]] en retard.', 'doute'],
      ['Le voleur [[serait parti]] par la fenêtre.', 'doute', CONDITIONNEL],
      ['Selon la radio, le chanteur [[aurait annulé]] son concert.', 'doute', CONDITIONNEL],
      ['D’après la légende, le trésor [[serait caché]] sous le vieux chêne.', 'doute',
        'Le <b>conditionnel</b> montre que ce n’est pas sûr : c’est seulement ce que raconte la légende.'],
      ['[[Il est possible que]] le spectacle soit annulé.', 'doute'],
      ['[[Il se peut que]] Mamie arrive en avance.', 'doute'],
      ['[[Apparemment]], Hugo a perdu son écharpe.', 'doute',
        '« Apparemment » : d’après ce qu’on voit… mais ce n’est pas vérifié.'],
      ['[[Vraisemblablement]], il fera beau demain.', 'doute', '« Vraisemblablement » veut dire « probablement ».'],
      ['[[Il paraît que]] la cantine sert des frites demain.', 'doute',
        'On l’a entendu dire, mais ce n’est pas vérifié.'],
      ['[[J’ai l’impression que]] le bus est en retard.', 'doute'],
    ],
    titreLecon: 'Certitude ou doute ?',
    lecon: `
      <p>Un <b>modalisateur</b> montre si celui qui parle est <b>sûr</b> de ce qu’il dit, ou s’il <b>doute</b>.</p>
      <table>
        <tr><th>certitude</th><th>doute</th></tr>
        <tr><td>sans aucun doute, assurément, évidemment</td><td>peut-être, probablement, sans doute</td></tr>
        <tr><td>il est évident que, il est certain que</td><td>il semble que, il se peut que, il paraît que</td></tr>
        <tr><td>je suis convaincu que, je sais que</td><td>j’ai l’impression que</td></tr>
        <tr><td>il ne fait aucun doute que</td><td>le conditionnel : <i>Le voleur serait parti.</i></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> attention au piège ! <b>sans doute</b> = « probablement » :
        il reste un <b>doute</b>. Mais <b>sans aucun doute</b> = <b>certitude</b>.</div>
      <p>Le <b>conditionnel</b> des journalistes (<i>Le chanteur aurait annulé son concert</i>) présente une information
        <b>pas encore vérifiée</b>.</p>
      <p>⚠️ <b>certainement</b> est un mot piège : aujourd’hui, il veut souvent dire « très probablement »
        (<i>Il viendra certainement</i>). Selon la phrase, on peut hésiter : Roxy ne te le demandera donc pas !</p>
    `,
  });

  // ======================================================================
  // 5. Les registres
  // ======================================================================
  // Pas de registre pathétique : il est trop proche du tragique.
  ajouterClassement({
    id: '3e-vocabulaire-registres',
    consigne: 'Quel est le registre de cet extrait ?',
    nombreChoix: 4,
    categories: {
      comique: {
        nom: 'comique',
        regle: 'Le registre <b>comique</b> cherche à faire <b>rire</b> : maladresses, quiproquos, jeux de mots, personnages ridicules.',
      },
      tragique: {
        nom: 'tragique',
        regle: 'Le registre <b>tragique</b> montre un personnage pris au piège de son <b>destin</b> : '
          + 'il ne peut pas échapper au malheur.',
      },
      lyrique: {
        nom: 'lyrique',
        regle: 'Le registre <b>lyrique</b> exprime les <b>émotions du « je »</b> : amour, joie, nostalgie, '
          + 'émerveillement devant la nature…',
      },
      epique: {
        nom: 'épique',
        regle: 'Le registre <b>épique</b> raconte des <b>exploits</b> avec des exagérations : '
          + 'combats, foules immenses, héros plus grands que nature.',
      },
      fantastique: {
        nom: 'fantastique',
        regle: 'Le registre <b>fantastique</b> fait <b>hésiter</b> entre une explication normale et une explication surnaturelle.',
      },
      polemique: {
        nom: 'polémique',
        regle: 'Le registre <b>polémique</b> <b>attaque</b> une idée ou une personne pour la dénoncer : '
          + 'indignation, questions rhétoriques, impératifs.',
      },
    },
    // [extrait, registre, remarque de Roxy qui montre les indices]
    banque: [
      ['En voulant faire une grande révérence, le marquis s’inclina si bas que sa perruque tomba dans la soupe. '
        + 'Il la repêcha avec sa cuillère et déclara, très digne : « Délicieux potage ! »', 'comique',
      'Un personnage ridicule, une maladresse inattendue : on rit. C’est un comique de situation.'],
      ['Le professeur demanda : « Citez-moi un animal qui vit dans l’eau. » Tom leva la main : « Le poisson ! '
        + '— Très bien. Un autre ? — Un autre poisson ! »', 'comique',
      'La réponse naïve et le jeu sur « un autre » font rire : c’est un comique de mots.'],
      ['Papi cherchait ses lunettes depuis une heure. Il avait fouillé les tiroirs, le frigo et même la niche du chien… '
        + 'Elles étaient sur son nez.', 'comique',
      'La chute inattendue (les lunettes sur son nez !) fait rire : c’est un comique de situation.'],
      ['Monsieur Dupont voulut montrer à tous qu’il savait plonger. Il prit son élan, fit un saut magnifique… '
        + 'et s’aperçut, en pleine eau, qu’il avait gardé son chapeau et ses chaussures.', 'comique',
      'Un personnage vantard et une situation ridicule : tout est fait pour faire rire.'],
      ['Le prince se jeta à genoux pour demander la main de la princesse. Hélas, son pantalon trop serré craqua d’un coup. '
        + 'La princesse, pouffant de rire, dit oui entre deux hoquets.', 'comique',
      'Le moment solennel tourne au ridicule : c’est comique.'],
      ['Le roi avait juré devant les dieux de punir le coupable. Or le coupable était son propre fils. '
        + 'S’il tenait parole, il perdait son enfant ; s’il la trahissait, il perdait son honneur.', 'tragique',
      'Le roi est pris au piège : quel que soit son choix, il perdra. Ce dilemme sans issue est tragique.'],
      ['Le héros avait tout fait pour échapper à la prédiction de l’oracle. Mais chacun de ses pas le rapprochait '
        + 'du malheur annoncé : les dieux avaient écrit son histoire d’avance.', 'tragique',
      'Le héros ne peut pas échapper à son destin (c’est la <b>fatalité</b>) : c’est la marque du tragique.'],
      ['Les deux familles se haïssaient depuis toujours. Roméo et Juliette le savaient : leur amour était condamné '
        + 'd’avance, et aucune ruse ne pourrait les sauver de leur destin.', 'tragique',
      'Un amour « condamné d’avance », un destin plus fort que les personnages : c’est tragique.'],
      ['Antigone savait que le roi avait interdit ce qu’elle allait faire, et elle savait ce qu’elle risquait. '
        + 'Mais elle ne pouvait pas faire autrement : elle accepta son destin, la tête haute.', 'tragique',
      'Antigone sait qu’elle court au malheur, mais elle ne peut pas l’éviter : c’est tragique.'],
      ['Tout était joué d’avance. Le héros pouvait lutter, supplier, espérer : la fatalité l’avait pris au piège, '
        + 'et il le comprit enfin, mais trop tard.', 'tragique',
      'Les mots « joué d’avance », « fatalité », « trop tard » montrent un destin impossible à éviter.'],
      ['Ô ma forêt d’enfance, comme je t’aime ! Chaque automne, mon cœur s’émerveille devant tes feuilles d’or '
        + 'et ton doux silence.', 'lyrique',
      'Le « je » exprime son amour pour la nature, en lui parlant (« Ô ma forêt ») : c’est lyrique.'],
      ['Je me souviens de ces étés si doux chez Mamie : le parfum des roses, le chant des grillons… '
        + 'Mon cœur bat plus fort chaque fois que j’y repense.', 'lyrique',
      'Des souvenirs heureux, de la nostalgie et les émotions du « je » : c’est lyrique.'],
      ['Quand je te vois sourire, mon amie, le ciel devient plus bleu et mes soucis s’envolent. '
        + 'Tu es la lumière de mes jours.', 'lyrique',
      'Le « je » dit son affection et sa joie : c’est le registre lyrique.'],
      ['Mer immense, mer éternelle, je viens chaque soir te confier mes rêves. Ta voix apaise mon âme, '
        + 'et je me sens enfin moi-même.', 'lyrique',
      'Le « je » parle à la mer et lui confie ses sentiments : c’est lyrique.'],
      ['Ô temps qui passes trop vite, laisse-moi garder encore un peu ces heures heureuses ! '
        + 'Je voudrais que ce soir d’été ne finisse jamais.', 'lyrique',
      'Le « je » exprime son bonheur et le regret du temps qui passe : c’est lyrique.'],
      ['Mille cavaliers dévalèrent la colline dans un fracas de tonnerre. La terre trembla sous les sabots de leurs chevaux ; '
        + 'à leur tête, Roland, plus grand que tous, brandissait son épée étincelante.', 'epique',
      'Une foule immense, un bruit de tonnerre, un héros « plus grand que tous » : ces exagérations sont épiques.'],
      ['La tempête hurlait, les vagues hautes comme des montagnes s’abattaient sur le navire. '
        + 'Mais le capitaine, seul contre l’océan déchaîné, tenait la barre sans trembler.', 'epique',
      'Un héros seul face à une nature déchaînée, des vagues « hautes comme des montagnes » : c’est épique.'],
      ['Le chevalier leva son bouclier face aux cent guerriers qui l’encerclaient. D’un seul élan, il les repoussa tous, '
        + 'et son cri de victoire résonna jusqu’au bout du royaume.', 'epique',
      'Un héros qui repousse cent guerriers à lui seul : cette exagération guerrière est la marque de l’épique.'],
      ['Les pompiers s’élancèrent dans la forêt en flammes. Le feu rugissait comme mille bêtes furieuses, '
        + 'mais ces héros infatigables luttèrent toute la nuit et sauvèrent la vallée.', 'epique',
      'Des héros qui luttent contre un feu gigantesque (« mille bêtes furieuses ») : c’est un combat épique.'],
      ['Alors l’armée entière s’ébranla. Des milliers de boucliers brillèrent sous le soleil, et le chant des soldats, '
        + 'puissant comme l’orage, fit trembler les montagnes.', 'epique',
      'Des milliers de soldats, un chant qui fait trembler les montagnes : la grandeur et l’exagération sont épiques.'],
      ['Le portrait de mon arrière-grand-père semblait me suivre des yeux. Était-ce un effet de la lumière ? '
        + 'Je m’approchai : son sourire avait changé, j’en étais presque sûr.', 'fantastique',
      'Le narrateur <b>hésite</b> : effet de la lumière, ou portrait vivant ? Cette hésitation est la marque du fantastique.'],
      ['Chaque nuit, à minuit, le piano du salon jouait trois notes. Pourtant, la maison était vide. '
        + 'Le vent, peut-être ? Mais le couvercle du piano était fermé à clé…', 'fantastique',
      'Une explication normale (le vent) ou surnaturelle ? On <b>hésite</b> : c’est fantastique.'],
      ['Dans la forêt, j’entendis mon nom murmuré derrière moi. Je me retournai : personne. '
        + 'Était-ce le vent dans les feuilles, ou une voix venue d’ailleurs ?', 'fantastique',
      'Le vent… ou une voix mystérieuse ? Ce doute entre le réel et le surnaturel est fantastique.'],
      ['Ce matin-là, toutes les horloges du village s’étaient arrêtées à la même minute. Une panne, disait le maire. '
        + 'Pourquoi, alors, mon vieux réveil, dont j’avais retiré la pile depuis des années, s’était-il remis à sonner ?', 'fantastique',
      'Une panne, vraiment ? Le narrateur n’arrive pas à tout expliquer : il <b>hésite</b>, c’est fantastique.'],
      ['Sur la neige fraîche, des traces de pas menaient jusqu’au milieu du jardin… puis s’arrêtaient net. '
        + 'Je me frottai les yeux : avais-je rêvé ?', 'fantastique',
      'Des traces qui s’arrêtent net, un narrateur qui se demande s’il a rêvé : c’est fantastique.'],
      ['Combien de temps allons-nous accepter que des tonnes de nourriture finissent chaque jour à la poubelle ? '
        + 'C’est un scandale ! Réagissons enfin !', 'polemique',
      'Une question rhétorique, de l’indignation (« scandale ») et un appel à agir : c’est polémique.'],
      ['Vous qui jetez vos déchets dans la forêt, avez-vous pensé aux animaux qui y vivent ? '
        + 'Votre négligence est indigne. Il est temps d’ouvrir les yeux !', 'polemique',
      'L’auteur attaque directement ceux qu’il critique (« Vous qui jetez… ») : c’est polémique.'],
      ['Supprimer la récréation pour gagner du temps ? Quelle idée absurde ! Les élèves ont besoin de bouger, '
        + 'de rire, de respirer. Cette décision doit être annulée.', 'polemique',
      'L’auteur dénonce une décision et exige qu’on l’annule : c’est polémique.'],
      ['Est-il normal d’enfermer des animaux sauvages dans de minuscules cages pour amuser le public ? Non ! '
        + 'Ce spectacle est une honte, et nous devons le refuser.', 'polemique',
      'Une question rhétorique, une réponse indignée (« Non ! », « une honte ») : c’est polémique.'],
      ['On nous répète que la planète est en danger, et pourtant on continue de gaspiller l’eau et l’énergie. '
        + 'Assez de beaux discours ! Nous exigeons des actes, maintenant !', 'polemique',
      'L’auteur dénonce une contradiction et réclame des actes : c’est polémique.'],
    ],
    titreLecon: 'Les registres',
    lecon: `
      <p>Le <b>registre</b> d’un texte, c’est l’<b>effet</b> qu’il veut produire sur le lecteur.</p>
      <table>
        <tr><th>registre</th><th>effet</th><th>indices</th></tr>
        <tr><td><b>comique</b></td><td>faire rire</td><td>maladresses, quiproquos, jeux de mots</td></tr>
        <tr><td><b>tragique</b></td><td>montrer un héros écrasé par son destin</td><td>fatalité, dilemme, « trop tard »</td></tr>
        <tr><td><b>lyrique</b></td><td>partager des émotions</td><td>le « je », les sentiments, la nature, « Ô… ! »</td></tr>
        <tr><td><b>épique</b></td><td>faire admirer des exploits</td><td>foules, combats, exagérations</td></tr>
        <tr><td><b>fantastique</b></td><td>inquiéter, faire douter</td><td>hésitation entre le réel et le surnaturel</td></tr>
        <tr><td><b>polémique</b></td><td>dénoncer, attaquer</td><td>indignation, questions rhétoriques, impératifs</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> demande-toi ce que tu ressens en lisant : tu ris ? tu admires ?
        tu doutes ? tu t’indignes ?</div>
      <p>⚠️ Le registre <b>pathétique</b> cherche à émouvoir, à faire pleurer. Il ressemble au tragique, mais dans le
        <b>tragique</b>, c’est le <b>destin</b> qui écrase le héros.</p>
      <p>⚠️ Dans un conte de fées, la magie est normale : c’est le merveilleux. Dans le <b>fantastique</b>, on <b>hésite</b>.</p>
    `,
  });

  // ======================================================================
  // 6. Les expressions latines
  // ======================================================================
  // [expression, sens, pièges pour le sens, phrase avec ___, pièges pour la phrase, mot à mot (facultatif), remarque]
  // Les pièges de la phrase sont de la même sorte que la réponse (un nom pour un nom, un adverbe pour un adverbe),
  // mais n'ont aucun sens dans la phrase. On évite « a priori », « grosso modo », « in fine », « illico »,
  // « in extremis » comme pièges : ils passent presque partout.
  const LOCUTIONS = [
    ['a priori', 'au premier abord', ['après coup', 'à plus forte raison', 'pour toujours'],
      'Ce plat semble ___ un peu étrange, mais goûte-le avant de juger !', ['ex aequo', 'manu militari', 'vice versa'],
      'en partant de ce qui est avant', 'Son contraire : <b>a posteriori</b> (après coup). On l’écrit traditionnellement sans accent '
        + '(l’orthographe rectifiée de 1990 accepte aussi « à priori »).'],
    ['a posteriori', 'après coup', ['au premier abord', 'en gros, à peu près', 'tout de suite'],
      'C’est ___, en relisant son devoir, que Léa a vu son erreur.', ['ex aequo', 'ad vitam aeternam', 'manu militari'],
      'en partant de ce qui vient après', 'Son contraire : <b>a priori</b> (au premier abord).'],
    ['in extremis', 'au tout dernier moment', ['à égalité', 'pour toujours', 'de ses propres yeux'],
      'Tom a attrapé son train ___, juste avant la fermeture des portes.', ['ex aequo', 'de visu', 'vice versa'],
      'dans les derniers moments'],
    ['grosso modo', 'en gros, à peu près', ['au dernier moment', 'à égalité', 'de ses propres yeux'],
      'Raconte-moi ___ l’histoire du film, sans entrer dans les détails.', ['ex aequo', 'vice versa', 'manu militari']],
    ['ad vitam aeternam', 'pour toujours', ['au premier abord', 'après coup', 'tout de suite'],
      'Tu ne vas pas bouder ___ ! Viens plutôt jouer avec nous.', ['ex aequo', 'de visu', 'a fortiori'],
      'pour la vie éternelle'],
    ['mea culpa', 'c’est ma faute', ['je te pardonne', 'je n’y suis pour rien', 'profite du moment'],
      'Après avoir cassé le vase, Hugo a fait son ___ devant toute la famille.', ['alter ego', 'statu quo', 'nota bene'],
      'par ma faute', '« Faire son mea culpa », c’est reconnaître ses torts.'],
    ['ex aequo', 'à égalité', ['en gros, à peu près', 'au tout dernier moment', 'pour toujours'],
      'Léa et Inès ont fini la course ___ : elles partagent la première place.', ['vice versa', 'de visu', 'ad vitam aeternam'],
      '', 'En latin, <i>aequus</i> veut dire « égal », comme dans « équitable ».'],
    ['illico', 'tout de suite', ['après coup', 'pour toujours', 'en gros, à peu près'],
      'Dès qu’il a entendu la sonnerie, Sami a filé ___ vers la cantine.', ['ex aequo', 'a fortiori', 'intra-muros'],
      '', 'C’est un mot familier. On dit aussi « sur-le-champ ».'],
    ['sine qua non', 'indispensable', ['facultatif', 'interdit', 'inutile'],
      'Avoir son billet est une condition ___ pour monter dans l’avion.', ['ex aequo', 'vice versa', 'persona non grata'],
      'sans laquelle non', 'Une condition sine qua non, c’est une condition sans laquelle rien n’est possible.'],
    ['statu quo', 'une situation inchangée', ['un changement complet', 'un retour en arrière', 'une grosse dispute'],
      'Personne ne veut changer les règles du jeu : on garde le ___.', ['mea culpa', 'post-scriptum', 'nota bene'],
      'dans l’état où (étaient les choses)', '« Garder le statu quo », c’est ne rien changer.'],
    ['alter ego', 'un autre soi-même', ['un ennemi juré', 'un parfait inconnu', 'un chef sévère'],
      'Léa ne fait rien sans Zoé : Zoé est son ___, son double.', ['mea culpa', 'statu quo', 'post-scriptum'],
      'un autre moi', 'Un alter ego est un ami très proche, presque un double.'],
    ['vice versa', 'réciproquement', ['à peu près', 'à la fin', 'au premier abord'],
      'Tom prête ses feutres à Léa, et ___ : Léa prête les siens à Tom.', ['grosso modo', 'manu militari', 'ex nihilo'],
      'la place étant retournée'],
    ['nota bene', 'remarque bien', ['bon travail', 'à bientôt', 'lu et approuvé'],
      'Le professeur a écrit ___ en marge pour attirer notre attention sur un point important.',
      ['mea culpa', 'et cetera', 'carpe diem'], 'note bien', 'On l’abrège en « N.B. ».'],
    ['et cetera', 'et le reste', ['et pour finir', 'et surtout', 'et pourtant'],
      'Dans mon sac, il y a des cahiers, des stylos, une gomme, ___.', ['vice versa', 'ex aequo', 'a fortiori'],
      'et les autres choses', 'On l’abrège en « etc. » (et jamais « ect. » !).'],
    ['post-scriptum', 'un ajout après la signature', ['une formule de politesse', 'un résumé de la lettre', 'une signature officielle'],
      'Sous sa signature, Mamie a ajouté un petit ___ pour embrasser le chat.', ['statu quo', 'alter ego', 'curriculum vitae'],
      'écrit après', 'On l’abrège en « P.-S. ».'],
    ['a fortiori', 'à plus forte raison', ['au dernier moment', 'par erreur', 'de force'],
      'Si Tom n’arrive pas à soulever ce sac, ___ son petit frère n’y arrivera pas.', ['vice versa', 'ex aequo', 'illico'],
      'en partant d’une raison plus forte'],
    ['de visu', 'de ses propres yeux', ['par ouï-dire', 'de mémoire', 'de loin'],
      'Je ne crois pas les rumeurs : je veux constater ___ que ce trésor existe.', ['ex aequo', 'vice versa', 'manu militari'],
      'd’après ce qui a été vu', '⚠️ « Voir de visu » est une répétition inutile : on dit « constater de visu ».'],
    ['in fine', 'à la fin d’un texte', ['au début d’un texte', 'en secret', 'par hasard'],
      'L’auteur donne sa conclusion ___, dans le dernier paragraphe.', ['ex aequo', 'manu militari', 'vice versa'],
      '', '⚠️ Employer « in fine » pour dire « finalement » est critiqué : garde-le pour la fin d’un texte ou d’un discours.'],
    ['carpe diem', 'profite du jour présent', ['pense à demain', 'travaille sans relâche', 'méfie-toi du jour'],
      'La devise de Papi est « ___ » : il profite de chaque instant.', ['mea culpa', 'nota bene', 'statu quo'],
      'cueille le jour', 'C’est une formule du poète latin Horace.'],
    ['manu militari', 'par la force', ['à la main', 'avec politesse', 'en secret'],
      'Le chat refusait de quitter le canapé : Papi l’a sorti ___ !', ['ex aequo', 'vice versa', 'de visu'],
      'par la main militaire'],
    ['persona non grata', 'une personne indésirable', ['une personne célèbre', 'une personne très généreuse', 'une personne invitée'],
      'Depuis qu’il a mangé tout le gâteau, le chien est ___ dans la cuisine.', ['ex aequo', 'sine qua non', 'statu quo'],
      'personne non bienvenue'],
    ['ipso facto', 'automatiquement', ['par hasard', 'avec effort', 'en cachette'],
      'Si tu oublies ton maillot, tu es ___ privé de piscine.', ['ex aequo', 'vice versa', 'intra-muros'],
      'par le fait même'],
    ['ex nihilo', 'à partir de rien', ['à partir d’un modèle', 'petit à petit', 'en équipe'],
      'Ce village n’existait pas : ses habitants l’ont construit ___, en pleine forêt.', ['vice versa', 'de visu', 'a fortiori']],
    ['curriculum vitae', 'un résumé de son parcours', ['une lettre de motivation', 'un journal intime', 'un bulletin de notes'],
      'Pour son stage de troisième, Inès a envoyé son ___ à trois entreprises.', ['post-scriptum', 'mea culpa', 'alter ego'],
      'le déroulement de la vie', 'On l’abrège en « CV ».'],
    ['intra-muros', 'à l’intérieur de la ville', ['en dehors de la ville', 'le long des murs', 'au bord de la mer'],
      'Mon oncle habite Paris ___, pas en banlieue.', ['ex aequo', 'vice versa', 'de visu'],
      'à l’intérieur des murs', 'Son contraire : <b>extra-muros</b> (hors de la ville).'],
    ['idem', 'la même chose', ['le contraire', 'rien du tout', 'et le reste'],
      'Léa a choisi une glace à la fraise, et Tom ___ : il adore la fraise, lui aussi.', ['ex aequo', 'de visu', 'manu militari'],
      'le même', 'On l’abrège en « id. ».'],
    ['in situ', 'sur place', ['en laboratoire', 'en photo', 'au musée'],
      'Les archéologues étudient les objets ___, là où ils ont été trouvés.', ['ex aequo', 'vice versa', 'manu militari'],
      'dans le lieu'],
  ];

  // Le sens de chaque expression, pour expliquer un intrus : { 'ex aequo': 'à égalité', … }
  const SENS_LATIN = Object.fromEntries(LOCUTIONS.map(([locution, sens]) => [locution, sens]));

  ajouterEtape({
    id: '3e-vocabulaire-locutions-latines',
    banque: LOCUTIONS,
    creerQuestion([locution, sens, piegesSens, phrase, piegesPhrase, motAMot, remarque]) {
      const explication = `« ${locution} » veut dire « <b>${sens}</b> »`
        + (motAMot ? ` (mot à mot : « ${motAMot} »).` : '.')
        + (remarque ? `<br>${remarque}` : '');
      const tirage = Math.random();
      // Le sens de l'expression
      if (tirage < 0.4) {
        return question({
          consigne: 'Que veut dire cette expression latine ?',
          enonce: `« ${locution} »`,
          reponse: sens,
          pieges: piegesSens,
          solution: `« ${locution} » = <b>${sens}</b>`,
          explication,
        });
      }
      // La phrase à trou : choisir l'expression, ou dire si elle est bien employée
      // (en vrai ou faux, l'intrus est choisi ici pour pouvoir expliquer son sens)
      const intrus = RM.hasard(piegesPhrase);
      const q = fabriquer(tirage < 0.85 ? 'choix' : 'vraifaux', {
        phrase,
        reponse: locution,
        choix: RM.melanger([locution, ...piegesPhrase]),
        mauvais: [intrus],
        explication,
        consigneChoix: 'Choisis l’expression latine qui convient',
        consigneVraiFaux: 'L’expression latine est-elle bien employée ?',
      });
      if (q.reponse === 'Faux') {
        q.explication = `« ${intrus} » veut dire « <b>${SENS_LATIN[intrus]}</b> » : ça ne va pas dans cette phrase.<br>`
          + explication;
      }
      return q;
    },
    titreLecon: 'Les expressions latines',
    lecon: `
      <p>Le français a gardé beaucoup d’<b>expressions latines</b>. On les écrit traditionnellement sans accent :
        <b>a priori</b>, <b>a fortiori</b> (l’orthographe rectifiée de 1990 accepte aussi « à priori »).</p>
      <h4>Pour dire quand</h4>
      <p><b>a priori</b> (au premier abord) ≠ <b>a posteriori</b> (après coup) · <b>in extremis</b> (au dernier moment) ·
        <b>illico</b> (tout de suite) · <b>in fine</b> (à la fin d’un texte) · <b>ad vitam aeternam</b> (pour toujours)</p>
      <h4>Pour raisonner</h4>
      <p><b>a fortiori</b> (à plus forte raison) · <b>grosso modo</b> (en gros) · <b>vice versa</b> (réciproquement) ·
        <b>ipso facto</b> (automatiquement) · <b>sine qua non</b> (indispensable)</p>
      <h4>Des noms</h4>
      <p>un <b>mea culpa</b> (l’aveu de sa faute) · le <b>statu quo</b> (rien ne change) · un <b>alter ego</b> (un autre soi-même) ·
        un <b>curriculum vitae</b> (CV) · un <b>post-scriptum</b> (P.-S.) · un <b>nota bene</b> (N.B.)</p>
      <h4>Et aussi</h4>
      <p><b>ex aequo</b> (à égalité) · <b>de visu</b> (de ses propres yeux) · <b>ex nihilo</b> (à partir de rien) ·
        <b>in situ</b> (sur place) · <b>intra-muros</b> (dans la ville) · <b>manu militari</b> (par la force) ·
        <b>persona non grata</b> (indésirable) · <b>carpe diem</b> (profite du jour présent) · <b>idem</b> (la même chose) ·
        <b>et cetera</b> (etc.)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> le mot à mot aide souvent ! <i>post</i> = après, <i>scriptum</i> = écrit :
        un post-scriptum, c’est ce qu’on écrit <b>après</b> la signature.</div>
    `,
  });
})();
