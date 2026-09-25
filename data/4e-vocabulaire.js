// Renard Malin — Vocabulaire, niveau 4e : les 6 étapes du Jardin du Vocabulaire (d’hiver)
//
// Les phrases et les mots sont écrits à la main. Le mot à observer est écrit entre [[ et ]] :
// il apparaît souligné. Le moteur qui fabrique les questions est dans js/moteur-phrases.js.

(function () {
  const { question, ajouterEtape, ajouterClassement, fabriquer, tirerType } = RM.phrases;

  // ======================================================================
  // Les racines (latines et grecques) : deux sortes de questions
  // ======================================================================
  // Une ligne de la banque : [racine, sens, sorte du sens ('nom', 'verbe' ou 'autre'), mots de la famille, exemple]
  // 1. « Que veut dire cette racine ? » → le sens ; les pièges sont des sens de la même sorte.
  // 2. « Quel mot contient la racine qui veut dire… ? » → un mot de la famille ; les pièges sont des mots
  //    des autres familles.
  // Un mot peut contenir deux racines de la liste (géographie = géo + graph) : on l’écrit dans les deux
  // familles, et il n’est jamais proposé comme piège pour l’une ou pour l’autre.
  // proches : les couples de racines qu’on ne mélange pas, parce que leurs sens sont voisins (mer et bateau)
  // ou parce qu’un mot de l’une semble contenir l’autre (n-avi-guer et avis, s-omni-fère et omnis).
  // gloses : pour les mots dont le lien avec la racine ne se voit pas tout seul (piscine, courrier…),
  // une petite explication qui remplace l’exemple de la racine.
  function ajouterRacines({ id, langue, racines, proches, gloses = {}, titreLecon, lecon }) {
    // Chaque mot, avec toutes les racines de la liste qu'il contient
    const racinesDuMot = {};
    racines.forEach(([racine, , , mots]) => mots.forEach(mot => {
      racinesDuMot[mot] = (racinesDuMot[mot] || []).concat(racine);
    }));
    const tropProches = (a, b) => a === b || proches.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

    ajouterEtape({
      id,
      banque: racines,
      titreLecon,
      lecon,
      creerQuestion([racine, sens, sorte, mots, exemple]) {
        // Quatre mots de la famille au plus (avec le mot de la question en premier)
        const famille = liste => `Même famille : <i>${[...new Set(liste)].slice(0, 4).join(', ')}</i>.`;
        if (Math.random() < 0.5) {
          // 1. Le sens de la racine
          const pieges = RM.melanger(racines.filter(r => r[2] === sorte && !tropProches(r[0], racine)))
            .slice(0, 3).map(r => r[1]);
          return question({
            consigne: `Que veut dire cette racine ${langue} ?`,
            enonce: `[[${racine}]]`,
            reponse: sens,
            pieges,
            solution: `« ${racine} » = <b>${sens}</b>`,
            explication: `La racine ${langue} <b>${racine}</b> veut dire « ${sens} ». ${exemple}<br>${famille(mots)}`,
          });
        }
        // 2. Le mot qui contient la racine : un piège par famille, sans aucune racine trop proche
        const mot = RM.hasard(mots);
        const pieges = [];
        for (const autre of RM.melanger(racines)) {
          if (pieges.length === 3) break;
          if (tropProches(autre[0], racine)) continue;
          const possibles = autre[3].filter(m => !pieges.includes(m)
            && racinesDuMot[m].every(r => !tropProches(r, racine)));
          if (possibles.length) pieges.push(RM.hasard(possibles));
        }
        return question({
          consigne: `Quel mot contient la racine ${langue} qui veut dire…`,
          enonce: `« ${sens} » ?`,
          reponse: mot,
          pieges,
          solution: `<b>${mot}</b> (${racine} = ${sens})`,
          explication: `« ${mot} » contient la racine ${langue} <b>${racine}</b>, qui veut dire « ${sens} ». `
            + `${gloses[mot] || exemple}<br>${famille([mot, ...mots])}`,
        });
      },
    });
  }

  // Pour la leçon : un tableau compact (deux racines par ligne) avec le sens et un mot exemple (le premier de la famille)
  function tableauRacines(racines) {
    const cases = racines.map(([racine, sens, , mots]) => `<td><b>${racine}</b></td><td>${sens}</td><td><i>${mots[0]}</i></td>`);
    let lignes = '';
    for (let i = 0; i < cases.length; i += 2) lignes += `<tr>${cases[i]}${cases[i + 1] || '<td></td><td></td><td></td>'}</tr>`;
    return '<table><tr><th>racine</th><th>sens</th><th>exemple</th><th>racine</th><th>sens</th><th>exemple</th></tr>'
      + `${lignes}</table>`;
  }

  // ======================================================================
  // 1. Les racines latines
  // ======================================================================
  const RACINES_LATINES = [
    ['aqua', 'eau', 'nom', ['aquarium', 'aquatique', 'aquarelle', 'aqueduc'],
      'Un animal <i>aquatique</i> vit dans l’eau.'],
    ['terra', 'terre', 'nom', ['terrestre', 'terrain', 'territoire', 'souterrain'],
      'Un passage <i>souterrain</i> passe sous la terre.'],
    ['manus', 'main', 'nom', ['manuel', 'manette', 'manipuler', 'manœuvre'],
      'Un travail <i>manuel</i> se fait avec les mains.'],
    ['pes, pedis', 'pied', 'nom', ['pédestre', 'pédale', 'pédalo', 'quadrupède'],
      'Une randonnée <i>pédestre</i> se fait à pied.'],
    ['mater', 'mère', 'nom', ['maternel', 'maternité', 'maternelle'],
      'L’amour <i>maternel</i>, c’est l’amour d’une mère.'],
    ['pater', 'père', 'nom', ['paternel', 'paternité', 'patrie', 'patrimoine'],
      'Mon grand-père <i>paternel</i> est le père de mon père.'],
    ['frater', 'frère', 'nom', ['fraternel', 'fraternité', 'fratrie'],
      'La <i>fratrie</i>, ce sont tous les frères et sœurs d’une famille.'],
    ['vox, vocis', 'voix', 'nom', ['vocal', 'vocaliser', 'vociférer'],
      'Un message <i>vocal</i> s’enregistre avec la voix.'],
    ['lux, lucis', 'lumière', 'nom', ['luciole', 'lucide', 'translucide', 'élucider'],
      'La <i>luciole</i> est un insecte qui produit de la lumière.'],
    ['sol, solis', 'soleil', 'nom', ['solaire', 'parasol', 'tournesol', 'solstice'],
      'Un <i>parasol</i> protège du soleil.'],
    ['mare', 'mer', 'nom', ['marin', 'maritime', 'marée', 'amerrir'],
      '<i>Amerrir</i>, c’est se poser sur la mer.'],
    ['ager, agri', 'champ', 'nom', ['agriculteur', 'agricole', 'agraire'],
      'L’<i>agriculteur</i> cultive les champs.'],
    ['nox, noctis', 'nuit', 'nom', ['nocturne', 'noctambule', 'équinoxe'],
      'Un animal <i>nocturne</i> vit la nuit.'],
    ['navis', 'bateau', 'nom', ['naviguer', 'naval', 'navigateur', 'navette'],
      '<i>Naviguer</i>, c’est voyager en bateau.'],
    ['urbs, urbis', 'ville', 'nom', ['urbain', 'urbanisme', 'urbaniste'],
      'Un paysage <i>urbain</i> est un paysage de ville.'],
    ['domus', 'maison', 'nom', ['domicile', 'domestique'],
      'Un animal <i>domestique</i> vit auprès des humains (dans leur maison ou leur ferme).'],
    ['canis', 'chien', 'nom', ['canin', 'canine', 'canidé'],
      'Le renard est un <i>canidé</i> : il est de la famille du chien.'],
    ['equus', 'cheval', 'nom', ['équestre', 'équitation', 'équidé'],
      'L’<i>équitation</i>, c’est l’art de monter à cheval.'],
    ['piscis', 'poisson', 'nom', ['pisciculture', 'piscine', 'piscicole'],
      'La <i>pisciculture</i>, c’est l’élevage des poissons.'],
    ['avis', 'oiseau', 'nom', ['aviation', 'avion', 'aviculteur'],
      'Un <i>aviculteur</i> élève des oiseaux : des poules, des canards…'],
    ['somnus', 'sommeil', 'nom', ['somnifère', 'somnambule', 'insomnie', 'somnoler'],
      'L’<i>insomnie</i>, c’est quand le sommeil ne vient pas.'],
    ['frigus, frigoris', 'froid', 'nom', ['réfrigérateur', 'frigorifique', 'frigo'],
      'Un <i>réfrigérateur</i> garde les aliments au froid.'],
    ['vita', 'vie', 'nom', ['vital', 'vitalité', 'vitamine'],
      'Les <i>vitamines</i> sont indispensables à la vie.'],
    ['videre', 'voir', 'verbe', ['vision', 'visible', 'visuel', 'vidéo'],
      'Ce qui est <i>visible</i> peut être vu.'],
    ['audire', 'entendre', 'verbe', ['auditeur', 'audition', 'audible', 'auditoire'],
      'Un son <i>audible</i> peut être entendu.'],
    ['scribere', 'écrire', 'verbe', ['scribe', 'inscrire', 'description', 'transcrire'],
      'Dans l’Antiquité, le <i>scribe</i> était celui qui écrivait.'],
    ['portare', 'porter', 'verbe', ['transporter', 'exporter', 'portatif', 'apporter'],
      'Un objet <i>portatif</i> se porte facilement.'],
    ['dicere', 'dire', 'verbe', ['dictée', 'diction', 'dictionnaire', 'prédire'],
      '<i>Prédire</i>, c’est dire à l’avance ce qui va arriver.'],
    ['credere', 'croire', 'verbe', ['crédible', 'crédule', 'incrédule'],
      'Une histoire <i>crédible</i> peut être crue.'],
    ['currere', 'courir', 'verbe', ['parcours', 'excursion', 'concurrent', 'courrier'],
      'Des <i>concurrents</i>, à l’origine, ce sont des gens qui courent ensemble.'],
    ['omnis', 'tout', 'autre', ['omnivore', 'omniprésent'],
      'Un animal <i>omnivore</i> mange de tout.'],
    ['bene', 'bien', 'autre', ['bienfaiteur', 'bénévole', 'bénéfique'],
      'Un <i>bienfaiteur</i> fait du bien aux autres.'],
    ['male', 'mal', 'autre', ['maladroit', 'maléfique', 'malveillant', 'malhonnête'],
      'Une personne <i>maladroite</i> s’y prend mal.'],
    ['multus', 'nombreux', 'autre', ['multicolore', 'multitude', 'multiplier'],
      'Un ballon <i>multicolore</i> a de nombreuses couleurs.'],
  ];

  ajouterRacines({
    id: '4e-vocabulaire-racines-latines',
    langue: 'latine',
    racines: RACINES_LATINES,
    proches: [['aqua', 'mare'], ['mare', 'navis'], ['avis', 'navis'], ['sol, solis', 'lux, lucis'],
      ['nox, noctis', 'somnus'], ['nox, noctis', 'equus'], ['omnis', 'somnus'], ['terra', 'ager, agri'],
      ['terra', 'mater'], ['terra', 'pater'], ['terra', 'frater'], ['dicere', 'audire'],
      ['aqua', 'piscis'], ['mare', 'piscis'], ['videre', 'lux, lucis'], ['scribere', 'dicere'],
      ['vox, vocis', 'dicere'], ['vox, vocis', 'audire']],
    gloses: {
      équinoxe: '<i>Équinoxe</i> = <i>aequus</i> (égal) + <i>nox</i> : ce jour-là, la nuit dure autant que le jour. '
        + 'Rien à voir avec <i>equus</i> (cheval) !',
      piscine: 'À l’origine, une <i>piscine</i> était un bassin à poissons.',
      courrier: 'Le <i>courrier</i>, c’était celui qui courait porter les lettres.',
      patrie: 'La <i>patrie</i>, c’est le pays des pères, des ancêtres.',
      patrimoine: 'Le <i>patrimoine</i>, ce sont les biens hérités du père.',
      avion: 'Un <i>avion</i> vole comme un oiseau.',
      navette: 'À l’origine, une <i>navette</i> est un petit bateau.',
      élucider: '<i>Élucider</i> un mystère, c’est le mettre en lumière.',
    },
    titreLecon: 'Les racines latines',
    lecon: `
      <p>Le français vient en grande partie du <b>latin</b>, la langue des Romains. Beaucoup de mots sont
        construits sur une <b>racine latine</b>, qui leur donne leur sens.</p>
      <table>
        <tr><th>racine</th><th>sens</th><th>exemples</th></tr>
        <tr><td><b>aqua</b></td><td>eau</td><td>aquarium, aquatique</td></tr>
        <tr><td><b>terra</b></td><td>terre</td><td>terrestre, souterrain</td></tr>
        <tr><td><b>manus</b></td><td>main</td><td>manuel, manipuler</td></tr>
        <tr><td><b>pes, pedis</b></td><td>pied</td><td>pédestre, pédale</td></tr>
        <tr><td><b>sol, solis</b></td><td>soleil</td><td>solaire, parasol</td></tr>
        <tr><td><b>videre</b></td><td>voir</td><td>vision, visible</td></tr>
        <tr><td><b>audire</b></td><td>entendre</td><td>audition, audible</td></tr>
        <tr><td><b>scribere</b></td><td>écrire</td><td>scribe, inscrire</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> connaître une racine permet de deviner le sens d’un mot nouveau !
        <i>nox, noctis</i> = nuit → un animal <b>noct</b>urne vit la nuit.</div>
      <p>⚠️ Attention aux ressemblances trompeuses : <i>solitaire</i> vient de <i>solus</i> (seul), pas de <i>sol</i> (soleil) ;
        <i>pédagogue</i> vient du grec <i>paidos</i> (enfant), pas de <i>pes</i> (pied) !</p>
      <h4>Les autres racines</h4>
      ${tableauRacines(RACINES_LATINES.filter(([racine]) => !['aqua', 'terra', 'manus', 'pes, pedis', 'sol, solis',
    'videre', 'audire', 'scribere'].includes(racine)))}
    `,
  });

  // ======================================================================
  // 2. Les racines grecques
  // ======================================================================
  const RACINES_GRECQUES = [
    ['hydro', 'eau', 'nom', ['hydrater', 'hydraulique', 'déshydraté', 'hydravion'],
      'Un <i>hydravion</i> peut se poser sur l’eau.'],
    ['géo', 'terre', 'nom', ['géographie', 'géologie', 'géométrie'],
      'La <i>géographie</i> décrit la Terre.'],
    ['bio', 'vie', 'nom', ['biologie', 'biographie', 'antibiotique', 'biodiversité'],
      'Une <i>biographie</i> raconte la vie de quelqu’un.'],
    ['graph', 'écrire', 'autre',
      ['calligraphie', 'paragraphe', 'orthographe', 'photographie', 'géographie', 'biographie', 'autographe', 'démographie'],
      'La <i>calligraphie</i> est l’art de bien écrire, en formant de belles lettres.'],
    ['phone', 'son, voix', 'nom',
      ['xylophone', 'saxophone', 'francophone', 'téléphone', 'microphone', 'mégaphone', 'orthophoniste'],
      'Un <i>mégaphone</i> rend la voix plus forte.'],
    ['logie', 'science, étude', 'nom',
      ['archéologie', 'biologie', 'géologie', 'mythologie', 'zoologie', 'anthropologie', 'cardiologie', 'dermatologie',
        'chronologie'],
      'L’<i>archéologie</i> est l’étude des traces laissées par les hommes du passé.'],
    ['chrono', 'temps', 'nom', ['chronomètre', 'chronologie', 'synchroniser', 'anachronisme'],
      'Un <i>chronomètre</i> mesure le temps.'],
    ['thermo', 'chaleur', 'nom', ['thermomètre', 'thermique', 'isotherme', 'thermal'],
      'Un <i>thermomètre</i> mesure la chaleur (la température).'],
    ['micro', 'petit', 'autre', ['microscope', 'microphone', 'micro-ondes'],
      'Un <i>microscope</i> permet de voir de tout petits objets.'],
    ['méga', 'grand', 'autre', ['mégaphone', 'mégalithe', 'mégapole'],
      'Un <i>mégalithe</i> est un monument fait d’une ou de plusieurs très grandes pierres, comme un menhir.'],
    ['télé', 'loin', 'autre', ['télévision', 'téléphone', 'télescope', 'télécommande'],
      'Un <i>télescope</i> permet de voir très loin.'],
    ['auto', 'soi-même', 'autre', ['automobile', 'autonome', 'autoportrait', 'autographe'],
      'Un <i>autoportrait</i> est le portrait d’un peintre fait par lui-même.'],
    ['phile', 'qui aime', 'autre', ['cinéphile', 'philosophe', 'bibliophile', 'philanthrope'],
      'Un <i>cinéphile</i> aime le cinéma.'],
    ['phobe', 'peur', 'nom', ['claustrophobe', 'arachnophobe', 'phobie'],
      'Un <i>arachnophobe</i> a peur des araignées.'],
    ['poly', 'plusieurs', 'autre', ['polygone', 'polyglotte', 'polyvalent'],
      'Un <i>polygone</i> a plusieurs côtés.'],
    ['mono', 'un seul', 'autre', ['monocle', 'monorail', 'monotone', 'monoski'],
      'Un <i>monocle</i> est un verre de lunettes pour un seul œil.'],
    ['pan', 'tout', 'autre', ['panorama', 'panthéon', 'panoplie'],
      'Un <i>panorama</i> permet de voir tout le paysage.'],
    ['anthropo', 'être humain', 'nom', ['philanthrope', 'anthropologie', 'misanthrope'],
      'Un <i>philanthrope</i> aime les êtres humains et les aide.'],
    ['zoo', 'animal', 'nom', ['zoologie', 'zoo'],
      'La <i>zoologie</i> est l’étude des animaux.'],
    ['astro', 'astre, étoile', 'nom', ['astronaute', 'astronomie', 'astéroïde'],
      'L’<i>astronomie</i> est la science des astres.'],
    ['photo', 'lumière', 'nom', ['photographie', 'photocopie', 'photosynthèse'],
      'Par la <i>photosynthèse</i>, les plantes fabriquent leur nourriture grâce à la lumière du soleil.'],
    ['ortho', 'droit, correct', 'autre', ['orthographe', 'orthophoniste', 'orthodontiste'],
      'L’<i>orthographe</i>, c’est la façon correcte d’écrire les mots.'],
    ['derme', 'peau', 'nom', ['épiderme', 'pachyderme', 'dermatologie'],
      'Un <i>pachyderme</i>, comme l’éléphant, a la peau épaisse.'],
    ['hippo', 'cheval', 'nom', ['hippopotame', 'hippodrome', 'hippique'],
      'Un <i>hippodrome</i> est un terrain pour les courses de chevaux.'],
    ['cardio', 'cœur', 'nom', ['cardiaque', 'cardiologie', 'tachycardie'],
      'Le muscle <i>cardiaque</i>, c’est le cœur.'],
    ['cyclo', 'cercle, roue', 'nom', ['bicyclette', 'cyclone', 'recycler', 'tricycle'],
      'Un <i>tricycle</i> a trois roues.'],
    ['aéro', 'air', 'nom', ['aéroport', 'aérodrome', 'aéronautique'],
      'Un <i>aérodrome</i> est un terrain pour les avions, qui volent dans l’air.'],
    ['démo', 'peuple', 'nom', ['démocratie', 'démographie'],
      'La <i>démocratie</i>, c’est le pouvoir du peuple.'],
  ];

  ajouterRacines({
    id: '4e-vocabulaire-racines-grecques',
    langue: 'grecque',
    racines: RACINES_GRECQUES,
    proches: [['zoo', 'hippo'], ['zoo', 'derme'], ['zoo', 'phobe'], ['zoo', 'bio'], ['anthropo', 'démo'],
      ['hydro', 'cardio'], ['logie', 'graph'], ['logie', 'astro'], ['logie', 'géo'], ['phone', 'poly']],
    gloses: {
      hippopotame: 'L’<i>hippopotame</i>, c’est le « cheval du fleuve ».',
      cyclone: 'Un <i>cyclone</i> est un vent très violent qui tourne en cercle.',
      panoplie: 'À l’origine, une <i>panoplie</i> est l’armure complète d’un soldat : toutes ses armes.',
      panthéon: 'Le <i>panthéon</i> était le temple de tous les dieux.',
      antibiotique: 'Un <i>antibiotique</i> agit contre la vie des microbes.',
    },
    titreLecon: 'Les racines grecques',
    lecon: `
      <p>Beaucoup de mots français, surtout les mots des sciences et des techniques, sont construits avec des
        <b>racines grecques</b>. Un mot peut même en contenir deux : <b>géo</b> + <b>graph</b>ie = la description de la Terre.</p>
      <table>
        <tr><th>racine</th><th>sens</th><th>exemples</th></tr>
        <tr><td><b>hydro</b></td><td>eau</td><td>hydrater, hydravion</td></tr>
        <tr><td><b>bio</b></td><td>vie</td><td>biologie, biographie</td></tr>
        <tr><td><b>graph</b></td><td>écrire</td><td>paragraphe, orthographe</td></tr>
        <tr><td><b>phone</b></td><td>son, voix</td><td>microphone, xylophone</td></tr>
        <tr><td><b>logie</b></td><td>science, étude</td><td>zoologie, géologie</td></tr>
        <tr><td><b>chrono</b></td><td>temps</td><td>chronomètre</td></tr>
        <tr><td><b>télé</b> / <b>micro</b></td><td>loin / petit</td><td>télescope, microscope</td></tr>
        <tr><td><b>phile</b> / <b>phobe</b></td><td>qui aime / peur</td><td>cinéphile, claustrophobe</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> découpe le mot en morceaux !
        <i>thermo</i> (chaleur) + <i>mètre</i> (mesure) → un <b>thermomètre</b> mesure la chaleur.</div>
      <p>⚠️ Ne confonds pas <b>phile</b> (qui aime) et <b>phobe</b> (qui a peur) : un cinéphile adore le cinéma,
        un arachnophobe a peur des araignées !</p>
      <h4>Les autres racines</h4>
      ${tableauRacines(RACINES_GRECQUES.filter(([racine]) => !['hydro', 'géo', 'bio', 'graph', 'phone', 'logie', 'chrono',
    'thermo', 'micro', 'télé', 'phile', 'phobe'].includes(racine)))}
    `,
  });

  // ======================================================================
  // 3. Les paronymes
  // ======================================================================
  // [phrase, le bon mot, le paronyme piège (à la même forme), la paire (pour l’explication)]
  const PARONYMES = [
    ['Attention, le départ du train est ___ : montez vite !', 'imminent', 'éminent', 'imminent'],
    ['Ce savant ___ a reçu un grand prix pour ses découvertes.', 'éminent', 'imminent', 'imminent'],
    ['Le volcan est entré en ___ cette nuit.', 'éruption', 'irruption', 'eruption'],
    ['Le chien a fait ___ dans la cuisine en aboyant.', 'irruption', 'éruption', 'eruption'],
    ['L’arbitre a ___ une pénalité à l’équipe de Tom.', 'infligé', 'affligé', 'infliger'],
    ['Kylian était ___ par la défaite de son équipe préférée.', 'affligé', 'infligé', 'infliger'],
    ['La porte a été ouverte par ___ : la serrure est cassée.', 'effraction', 'infraction', 'effraction'],
    ['Ne pas s’arrêter au feu rouge est une ___ au code de la route.', 'infraction', 'effraction', 'effraction'],
    ['Ne mange pas ce champignon : il est ___ !', 'vénéneux', 'venimeux', 'veneneux'],
    ['La vipère est un serpent ___.', 'venimeux', 'vénéneux', 'veneneux'],
    ['Cette jolie baie rouge est ___ : ne la cueille pas !', 'vénéneuse', 'venimeuse', 'veneneux'],
    ['Ton déguisement de pieuvre est très ___ : personne n’y avait pensé !', 'original', 'originel', 'original'],
    ['Après une bonne nuit de sommeil, Roxy a ___ toutes ses forces.', 'recouvré', 'recouvert', 'recouvrer'],
    ['La neige a ___ tout le jardin pendant la nuit.', 'recouvert', 'recouvré', 'recouvrer'],
    ['La bougie s’est ___ lentement jusqu’au bout.', 'consumée', 'consommée', 'consumer'],
    ['Mon petit frère ___ beaucoup trop de bonbons.', 'consomme', 'consume', 'consumer'],
    ['Maman a été très ___ : elle ne nous a pas grondés pour le vase cassé.', 'compréhensive', 'compréhensible', 'comprehensif'],
    ['Cette explication est claire et facilement ___.', 'compréhensible', 'compréhensive', 'comprehensif'],
    ['Le match s’est terminé après les ___.', 'prolongations', 'prolongements', 'prolongation'],
    ['Les ouvriers commencent les travaux de ___ de la route jusqu’au village.', 'prolongement', 'prolongation', 'prolongation'],
    ['L’___ de la tour de Pise étonne les touristes.', 'inclinaison', 'inclination', 'inclinaison'],
    ['Depuis toute petite, Ilona a une ___ pour la musique.', 'inclination', 'inclinaison', 'inclinaison'],
    ['Nous avons attrapé le train de ___ !', 'justesse', 'justice', 'justesse'],
    ['Le juge est chargé de rendre la ___.', 'justice', 'justesse', 'justesse'],
    ['Ce parfum de lavande ___ pour Mamie ses vacances en Provence.', 'évoque', 'invoque', 'evoquer'],
    ['Avant la course, le héros prie et ___ les dieux : « Aidez-moi ! »', 'invoque', 'évoque', 'evoquer'],
    ['Le maire a prononcé une courte ___ pour la fête du village.', 'allocution', 'allocation', 'allocution'],
    ['Cette famille reçoit une ___ pour acheter les fournitures scolaires.', 'allocation', 'allocution', 'allocution'],
    ['Le jury a ___ le premier prix à Léa.', 'décerné', 'discerné', 'decerner'],
    ['Dans le brouillard, on ___ à peine la maison.', 'discerne', 'décerne', 'decerner'],
    ['Nous passons nos vacances sur le ___ atlantique.', 'littoral', 'littéral', 'litteral'],
    ['Au sens ___, « avoir un chat dans la gorge » voudrait dire avaler un chat !', 'littéral', 'littoral', 'litteral'],
    ['Samedi, nous allons ___ dans notre nouvel appartement.', 'emménager', 'aménager', 'emmenager'],
    ['Papa veut ___ le grenier pour en faire une chambre.', 'aménager', 'emménager', 'emmenager'],
    ['Le médecin lui a ___ un sirop à prendre trois fois par jour.', 'prescrit', 'proscrit', 'prescrire'],
    ['À la bibliothèque, les cris sont ___.', 'proscrits', 'prescrits', 'prescrire'],
  ];

  // Le sens des deux mots de chaque paire
  const SENS_PARONYMES = {
    imminent: '<b>imminent</b> = qui va arriver très bientôt ; <b>éminent</b> = remarquable, très important (un savant éminent).',
    eruption: '<b>éruption</b> = une sortie brusque (un volcan en éruption) ; '
      + '<b>irruption</b> = une entrée brusque (faire irruption dans une pièce).',
    infliger: '<b>infliger</b> = imposer une punition, une sanction ; <b>affliger</b> = rendre très triste.',
    effraction: '<b>effraction</b> = le fait de casser une porte, une serrure… pour entrer ; '
      + '<b>infraction</b> = le fait de ne pas respecter une loi, un règlement.',
    veneneux: '<b>vénéneux</b> = qui contient du poison (une plante, un champignon) ; '
      + '<b>venimeux</b> = qui a du venin (un animal qui pique ou qui mord).',
    original: '<b>original</b> = nouveau, qui ne ressemble à rien d’autre ; <b>originel</b> = qui date de l’origine, du tout début.',
    recouvrer: '<b>recouvrer</b> = retrouver, récupérer (recouvrer la santé, ses forces) ; <b>recouvrir</b> = couvrir entièrement.',
    consumer: '<b>consumer</b> = détruire peu à peu, surtout par le feu ; '
      + '<b>consommer</b> = utiliser, manger, boire, dépenser (de l’essence, de l’énergie).',
    comprehensif: '<b>compréhensif</b> = qui comprend les autres, indulgent (pour une personne) ; '
      + '<b>compréhensible</b> = qu’on peut comprendre (pour une chose).',
    prolongation: '<b>prolongation</b> = on allonge une <b>durée</b>, dans le temps ; '
      + '<b>prolongement</b> = on allonge dans l’<b>espace</b> (une route, une ligne).',
    inclinaison: '<b>inclinaison</b> = le fait d’être penché (pour une chose) ; '
      + '<b>inclination</b> = un penchant, un goût pour quelque chose (pour une personne).',
    justesse: '<b>justesse</b> = la précision (de justesse = de très peu) ; '
      + '<b>justice</b> = le respect du droit et des lois (le juge rend la justice).',
    evoquer: '<b>évoquer</b> = rappeler à la mémoire, faire penser à ; '
      + '<b>invoquer</b> = appeler à l’aide par une prière (invoquer les dieux).',
    allocution: '<b>allocution</b> = un petit discours ; <b>allocation</b> = une somme d’argent versée pour aider quelqu’un.',
    decerner: '<b>décerner</b> = donner, attribuer (un prix, une médaille) ; <b>discerner</b> = distinguer, apercevoir.',
    litteral: '<b>littéral</b> = qui suit les mots à la lettre (le sens littéral) ; <b>littoral</b> = le bord de mer, la côte.',
    emmenager: '<b>emménager</b> = s’installer dans un nouveau logement ; '
      + '<b>aménager</b> = arranger un lieu pour pouvoir l’utiliser.',
    prescrire: '<b>prescrire</b> = ordonner, recommander (le médecin prescrit un médicament) ; <b>proscrire</b> = interdire.',
  };

  ajouterEtape({
    id: '4e-vocabulaire-paronymes',
    banque: PARONYMES,
    creerQuestion: ([phrase, reponse, piege, paire]) => fabriquer(tirerType({ choix: 0.75, vraifaux: 0.25 }), {
      phrase,
      reponse,
      choix: RM.melanger([reponse, piege]),
      mauvais: [piege],
      explication: SENS_PARONYMES[paire],
      consigneChoix: 'Choisis le mot qui convient',
      consigneVraiFaux: 'Le mot surligné est-il bien choisi ?',
    }),
    titreLecon: 'Les paronymes',
    lecon: `
      <p>Des <b>paronymes</b> sont des mots qui se ressemblent beaucoup (à une ou deux lettres près)
        mais qui n’ont <b>pas le même sens</b>. Les confondre, c’est faire une erreur de vocabulaire !</p>
      <table>
        <tr><th>paronymes</th><th>sens</th></tr>
        <tr><td><b>éruption</b> / <b>irruption</b></td><td>une sortie brusque / une entrée brusque</td></tr>
        <tr><td><b>vénéneux</b> / <b>venimeux</b></td><td>qui contient du poison (plante) / qui a du venin (animal)</td></tr>
        <tr><td><b>imminent</b> / <b>éminent</b></td><td>qui va arriver très bientôt / remarquable</td></tr>
        <tr><td><b>infliger</b> / <b>affliger</b></td><td>imposer une punition / rendre très triste</td></tr>
        <tr><td><b>effraction</b> / <b>infraction</b></td><td>casser pour entrer / ne pas respecter une règle</td></tr>
        <tr><td><b>original</b> / <b>originel</b></td><td>nouveau, qui ne ressemble à rien / du tout début</td></tr>
        <tr><td><b>recouvrer</b> / <b>recouvrir</b></td><td>retrouver (la santé, ses forces) / couvrir entièrement</td></tr>
        <tr><td><b>consommer</b> / <b>consumer</b></td><td>utiliser, manger, boire / détruire (par le feu)</td></tr>
        <tr><td><b>compréhensif</b> / <b>compréhensible</b></td><td>qui comprend les autres / qu’on peut comprendre</td></tr>
        <tr><td><b>prolongation</b> / <b>prolongement</b></td><td>dans le temps / dans l’espace</td></tr>
        <tr><td><b>inclinaison</b> / <b>inclination</b></td><td>le fait d’être penché / un penchant, un goût</td></tr>
        <tr><td><b>justesse</b> / <b>justice</b></td><td>la précision (de justesse) / le respect des lois</td></tr>
        <tr><td><b>évoquer</b> / <b>invoquer</b></td><td>rappeler, faire penser à / appeler à l’aide (les dieux)</td></tr>
        <tr><td><b>allocution</b> / <b>allocation</b></td><td>un petit discours / une aide en argent</td></tr>
        <tr><td><b>décerner</b> / <b>discerner</b></td><td>attribuer (un prix) / distinguer, apercevoir</td></tr>
        <tr><td><b>littéral</b> / <b>littoral</b></td><td>mot à mot / le bord de mer</td></tr>
        <tr><td><b>emménager</b> / <b>aménager</b></td><td>s’installer dans un logement / arranger un lieu</td></tr>
        <tr><td><b>prescrire</b> / <b>proscrire</b></td><td>ordonner (un médicament) / interdire</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> regarde le début du mot !
        <b>ir-</b> (comme in-) peut vouloir dire « dans » : une <b>ir</b>ruption, c’est une entrée.
        <b>é-</b> (comme ex-) veut dire « hors de » : une <b>é</b>ruption, c’est une sortie.</div>
      <p>⚠️ En cas de doute, cherche le sens des deux mots dans le dictionnaire, puis relis la phrase.</p>
    `,
  });

  // ======================================================================
  // 4. Les figures de style
  // ======================================================================
  ajouterClassement({
    id: '4e-vocabulaire-figures-style',
    consigne: 'Quelle figure de style reconnais-tu dans cette phrase ?',
    categories: {
      comparaison: {
        nom: 'comparaison',
        regle: 'Une <b>comparaison</b> rapproche deux éléments grâce à un <b>outil de comparaison</b> : '
          + 'comme, tel, pareil à, semblable à, ressembler à…',
      },
      metaphore: {
        nom: 'métaphore',
        regle: 'Une <b>métaphore</b> rapproche deux éléments <b>sans outil de comparaison</b> : '
          + 'on dit directement que l’un « est » l’autre.',
      },
      personnification: {
        nom: 'personnification',
        regle: 'Une <b>personnification</b> donne à une chose, à un animal ou à une idée '
          + 'des actions ou des sentiments <b>humains</b>.',
      },
      hyperbole: {
        nom: 'hyperbole',
        regle: 'Une <b>hyperbole</b> est une <b>exagération</b> : elle grossit la réalité pour insister ou pour amuser.',
      },
    },
    // [phrase, figure, remarque de Roxy]
    banque: [
      ['Le lac est lisse comme un miroir.', 'comparaison',
        'Le lac est rapproché d’un miroir grâce à l’outil « <b>comme</b> ».'],
      ['Les flocons tombent, légers comme des plumes.', 'comparaison',
        'Les flocons sont rapprochés des plumes grâce à l’outil « <b>comme</b> ».'],
      ['Les nuages ressemblent à de gros moutons blancs.', 'comparaison',
        'L’outil de comparaison est le verbe « <b>ressembler à</b> ».'],
      ['Pareil à un grand oiseau, le cerf-volant monte dans le ciel.', 'comparaison',
        'L’outil de comparaison est « <b>pareil à</b> ».'],
      ['La lune, telle une lanterne, éclaire le chemin.', 'comparaison',
        'L’outil de comparaison est « <b>telle</b> ».'],
      ['Les cheveux de Maëva sont doux comme de la soie.', 'comparaison',
        'Les cheveux sont rapprochés de la soie grâce à l’outil « <b>comme</b> ».'],
      ['Le chaton dort, roulé en boule comme une pelote de laine.', 'comparaison',
        'Le chaton est rapproché d’une pelote de laine grâce à l’outil « <b>comme</b> ».'],
      ['Les étoiles brillent comme des diamants.', 'comparaison',
        'Les étoiles sont rapprochées des diamants grâce à l’outil « <b>comme</b> ».'],
      ['Ce lac est un miroir où se reflètent les montagnes.', 'metaphore',
        'Le lac est rapproché d’un miroir, mais <b>sans outil</b> : on dit directement qu’il « est » un miroir.'],
      ['Les étoiles sont les lampes de la nuit.', 'metaphore',
        'Les étoiles sont rapprochées de lampes, <b>sans outil</b> de comparaison.'],
      ['La neige est un grand drap blanc posé sur la forêt.', 'metaphore',
        'La neige est rapprochée d’un drap, <b>sans outil</b> de comparaison.'],
      ['Le champ de blé est un tapis doré.', 'metaphore',
        'Le champ est rapproché d’un tapis, <b>sans outil</b> de comparaison.'],
      ['Ma petite sœur est un rayon de soleil.', 'metaphore',
        'La petite sœur est rapprochée d’un rayon de soleil, <b>sans outil</b> de comparaison.'],
      ['Vue d’avion, la route est un long ruban gris.', 'metaphore',
        'La route est rapprochée d’un ruban, <b>sans outil</b> de comparaison.'],
      ['Le soleil est une grosse orange accrochée dans le ciel.', 'metaphore',
        'Le soleil est rapproché d’une orange, <b>sans outil</b> de comparaison.'],
      ['Dans le ciel d’hiver, la lune est une pièce d’argent.', 'metaphore',
        'La lune est rapprochée d’une pièce, <b>sans outil</b> de comparaison.'],
      ['Le vent murmure des secrets aux arbres.', 'personnification',
        'Le vent ne peut pas raconter de secrets : il agit comme une personne.'],
      ['La pluie tape à la fenêtre pour qu’on la laisse entrer.', 'personnification',
        'La pluie ne peut pas vouloir entrer : elle agit comme une personne.'],
      ['Le soleil sourit aux enfants qui jouent dans le parc.', 'personnification',
        'Le soleil ne peut pas sourire : on lui prête un geste humain.'],
      ['La vieille maison soupire quand le vent souffle.', 'personnification',
        'Une maison ne peut pas soupirer : on lui prête un geste humain.'],
      ['Ce matin, mon réveil a crié à sept heures pile.', 'personnification',
        'Un réveil ne crie pas : on lui prête une action humaine.'],
      ['Le ruisseau bavarde entre les cailloux.', 'personnification',
        'Un ruisseau ne peut pas bavarder : il agit comme une personne.'],
      ['Mon ordinateur boude : il refuse de s’allumer.', 'personnification',
        'Un ordinateur ne peut pas bouder : on lui prête un sentiment humain.'],
      ['Le Chêne un jour dit au Roseau : « Vous avez bien sujet d’accuser la Nature. » (La Fontaine)', 'personnification',
        'Dans cette fable, le chêne parle comme une personne.'],
      ['Je te l’ai déjà répété mille fois !', 'hyperbole',
        'Personne ne répète vraiment une chose mille fois : on <b>exagère</b> pour insister.'],
      ['Ce sac pèse une tonne !', 'hyperbole',
        'Un sac ne pèse pas une tonne (mille kilos !) : on <b>exagère</b> pour dire qu’il est lourd.'],
      ['J’ai attendu le bus pendant des siècles !', 'hyperbole',
        'Personne n’attend pendant des siècles : on <b>exagère</b> pour dire que c’était long.'],
      ['Il y avait des milliards de moustiques au bord du lac.', 'hyperbole',
        'Personne n’a compté des milliards de moustiques : on <b>exagère</b> pour dire qu’il y en avait beaucoup.'],
      ['Mon petit frère pose cent questions à la minute.', 'hyperbole',
        'C’est impossible : on <b>exagère</b> pour dire qu’il pose beaucoup de questions.'],
      ['Quand Hinano rit, on l’entend jusqu’à l’autre bout de la Terre.', 'hyperbole',
        'C’est impossible : on <b>exagère</b> pour dire que Hinano rit très fort.'],
      ['Ce gâteau est si gros qu’il pourrait nourrir toute la ville !', 'hyperbole',
        'C’est impossible : on <b>exagère</b> pour dire que le gâteau est énorme.'],
      ['J’ai tellement faim que je pourrais manger un éléphant !', 'hyperbole',
        'C’est impossible : on <b>exagère</b> pour dire qu’on a très faim.'],
    ],
    titreLecon: 'Les figures de style',
    lecon: `
      <p>Une <b>figure de style</b> est une façon de s’exprimer qui crée une image ou un effet, pour rendre un texte plus vivant.</p>
      <table>
        <tr><th>figure</th><th>ce qu’elle fait</th><th>exemple</th></tr>
        <tr><td><b>comparaison</b></td><td>rapproche deux éléments avec un <b>outil</b></td><td><i>Le lac est lisse <u>comme</u> un miroir.</i></td></tr>
        <tr><td><b>métaphore</b></td><td>rapproche deux éléments <b>sans outil</b></td><td><i>Ce lac est un miroir.</i></td></tr>
        <tr><td><b>personnification</b></td><td>fait agir une chose ou un animal comme un <b>humain</b></td><td><i>Le vent murmure.</i></td></tr>
        <tr><td><b>hyperbole</b></td><td><b>exagère</b> pour insister</td><td><i>Je te l’ai dit mille fois !</i></td></tr>
      </table>
      <div class="astuce">💡 <b>La méthode de Roxy :</b><br>
        1. Y a-t-il un outil (comme, tel, pareil à, semblable à, ressembler à…) ? → <b>comparaison</b>.<br>
        2. Dit-on qu’une chose « est » une autre, sans outil ? → <b>métaphore</b>.<br>
        3. Une chose ou un animal agit-il comme une personne ? → <b>personnification</b>.<br>
        4. Est-ce impossible tellement c’est exagéré ? → <b>hyperbole</b>.</div>
      <p>⚠️ « Léa est plus grande que Tom » n’est pas une figure de style : on compare deux tailles, sans créer d’image.</p>
    `,
  });

  // ======================================================================
  // 5. Les connecteurs logiques
  // ======================================================================
  // [phrase, le bon connecteur, les autres boutons, le rapport logique, remarque de Roxy]
  // Dans une même ligne, jamais deux connecteurs du même rapport (mais et pourtant, donc et c’est pourquoi,
  // car et en effet…), et jamais un piège qui pourrait se défendre.
  const CONNECTEURS = [
    // La cause
    ['Kalia met son chapeau, ___ le soleil tape fort.', 'car', ['c’est pourquoi', 'pourtant'], 'cause',
      'Pourquoi Kalia met-elle son chapeau ? Parce que le soleil tape fort.'],
    ['Tom a mis son réveil très tôt, ___ il part en voyage demain matin.', 'car', ['mais', 'c’est pourquoi'], 'cause',
      'Pourquoi Tom a-t-il mis son réveil très tôt ? Parce qu’il part en voyage.'],
    ['Les hirondelles partent vers le sud, ___ l’hiver approche.', 'car', ['mais', 'c’est pourquoi'], 'cause',
      'Pourquoi les hirondelles partent-elles ? Parce que l’hiver approche.'],
    ['Roxy ne sort pas aujourd’hui. ___, elle est enrhumée.', 'En effet', ['Pourtant', 'Par conséquent', 'Par exemple'], 'cause',
      'Pourquoi Roxy ne sort-elle pas ? Parce qu’elle est enrhumée.'],
    ['Sélène n’a pas pris son parapluie. ___, il faisait grand soleil ce matin.', 'En effet', ['Pourtant', 'Par conséquent'], 'cause',
      'Pourquoi Sélène n’a-t-elle pas pris son parapluie ? Parce qu’il faisait beau.'],
    ['Les élèves sont très contents. ___, les vacances commencent demain.', 'En effet', ['Pourtant', 'Par exemple', 'Par conséquent'], 'cause',
      'Pourquoi les élèves sont-ils contents ? Parce que les vacances commencent demain.'],
    // La conséquence
    ['Il pleut à verse, ___ nous restons à la maison.', 'donc', ['car', 'mais'], 'consequence',
      'La pluie a un résultat : nous restons à la maison.'],
    ['Il n’y a plus de lait, ___ Papa va en acheter.', 'donc', ['car', 'pourtant'], 'consequence',
      'Il n’y a plus de lait : le résultat, c’est que Papa va en acheter.'],
    ['Le magasin était fermé, ___ nous sommes rentrés sans rien acheter.', 'c’est pourquoi', ['car', 'mais'], 'consequence',
      'Le magasin était fermé : le résultat, c’est que nous sommes rentrés sans rien acheter.'],
    ['Le chemin était glissant, ___ nous avons marché très prudemment.', 'c’est pourquoi', ['car', 'pourtant'], 'consequence',
      'Le chemin était glissant : le résultat, c’est que nous avons marché prudemment.'],
    ['Le pont est fermé pour travaux. ___, nous devons faire un détour.', 'Par conséquent', ['En effet', 'Pourtant', 'Par exemple'], 'consequence',
      'Le pont est fermé : le résultat, c’est que nous devons faire un détour.'],
    ['Inès s’est entraînée tous les jours. ___, elle a gagné la course.', 'Par conséquent', ['Pourtant', 'Par exemple'], 'consequence',
      'Inès s’est entraînée : le résultat, c’est sa victoire.'],
    // L’opposition
    ['Roxy voulait jouer dehors, ___ il pleuvait trop.', 'mais', ['car', 'donc'], 'opposition',
      'Roxy avait envie de jouer dehors, et la pluie l’en empêche : les deux idées s’opposent.'],
    ['Ce gâteau a l’air délicieux, ___ il est beaucoup trop sucré.', 'mais', ['car', 'c’est pourquoi'], 'opposition',
      'On s’attend à un gâteau délicieux, et il est trop sucré : les deux idées s’opposent.'],
    ['Minh a révisé toute la soirée, ___ le lendemain, il avait tout oublié.', 'pourtant', ['car', 'donc'], 'opposition',
      'Après avoir révisé, on s’attend à savoir sa leçon : l’oubli est contraire à ce qu’on attendait.'],
    ['Hugo s’est couché très tard. ___, il est en pleine forme ce matin.', 'Pourtant', ['Par conséquent', 'En effet', 'Par exemple'], 'opposition',
      'Après une courte nuit, on s’attend à être fatigué : sa forme est contraire à ce qu’on attendait.'],
    ['Le chemin est long et difficile. ___, la vue au sommet est magnifique.', 'Cependant', ['En effet', 'Par exemple'], 'opposition',
      'Un chemin difficile, une vue magnifique : un défaut, puis une qualité qui s’y oppose.'],
    ['Les manchots ont des ailes. ___, ils ne savent pas voler.', 'Cependant', ['Par conséquent', 'Par exemple', 'En effet'], 'opposition',
      'Quand on a des ailes, on s’attend à voler : c’est le contraire de ce qu’on attendait.'],
    // L’addition
    ['Ce vélo est trop petit pour moi. ___, ses freins ne marchent plus.', 'De plus', ['Pourtant', 'Par conséquent'], 'addition',
      'On ajoute un deuxième défaut au premier.'],
    ['Roxy court très vite. ___, elle sait grimper aux arbres.', 'De plus', ['Pourtant', 'Par exemple'], 'addition',
      'On ajoute une deuxième qualité à la première.'],
    ['Pour la fête, Mamie a préparé des crêpes. ___, elle a fait un énorme gâteau au chocolat.', 'De plus', ['Pourtant', 'En effet', 'Par exemple'], 'addition',
      'On ajoute une deuxième gourmandise à la première.'],
    ['Les mangues sont délicieuses. ___, elles sont pleines de vitamines.', 'De plus', ['Par conséquent', 'Par exemple'], 'addition',
      'On ajoute une deuxième qualité à la première.'],
    // L’exemple
    ['Certains animaux dorment tout l’hiver. ___, la marmotte hiberne pendant six mois.', 'Par exemple', ['Pourtant', 'Par conséquent'], 'exemple',
      'La marmotte est un exemple d’animal qui dort tout l’hiver.'],
    ['Roxy connaît beaucoup de plantes de la forêt. ___, elle sait reconnaître l’ail des ours.', 'Par exemple', ['Pourtant', 'Ensuite'], 'exemple',
      'L’ail des ours est un exemple de plante que Roxy connaît.'],
    ['Certains mots français viennent de l’anglais. ___, « week-end » est un mot d’origine anglaise.', 'Par exemple', ['Pourtant', 'Ensuite'], 'exemple',
      '« Week-end » est un exemple de mot venu de l’anglais.'],
    ['Le renard mange de tout. ___, il aime les baies, les insectes et les œufs.', 'Par exemple', ['Cependant', 'Ensuite'], 'exemple',
      'Les baies, les insectes et les œufs sont des exemples de ce que mange le renard.'],
    // Le temps
    ['Roxy prépare la pâte à crêpes. ___, elle la laisse reposer une heure.', 'Ensuite', ['Pourtant', 'Par exemple'], 'temps',
      'Les deux actions se suivent : d’abord la pâte, ensuite le repos.'],
    ['D’abord, Sione lave les légumes. Puis il les épluche. ___, il les fait cuire.', 'Enfin', ['Pourtant', 'Par exemple', 'En effet'], 'temps',
      'C’est la dernière étape : d’abord, puis, <b>enfin</b>.'],
    ['Nous avons visité le château le matin. ___, nous avons pique-niqué au bord du lac.', 'Ensuite', ['Pourtant', 'En effet', 'Par exemple'], 'temps',
      'Les deux actions se suivent : d’abord la visite, ensuite le pique-nique.'],
    ['Pour planter une graine, creuse d’abord un petit trou. ___, pose la graine et recouvre-la de terre.', 'Ensuite', ['Cependant', 'Par exemple'], 'temps',
      'Les étapes se suivent : d’abord le trou, ensuite la graine.'],
  ];

  const RAPPORTS = {
    cause: 'Le rapport logique est la <b>cause</b> : la deuxième partie explique pourquoi. '
      + 'Connecteurs : <b>car</b>, <b>en effet</b>.',
    consequence: 'Le rapport logique est la <b>conséquence</b> : la deuxième partie donne le résultat de la première. '
      + 'Connecteurs : <b>donc</b>, <b>c’est pourquoi</b>, <b>par conséquent</b>.',
    opposition: 'Le rapport logique est l’<b>opposition</b> : la deuxième partie va contre la première, '
      + 'ou contre ce qu’on attendait. Connecteurs : <b>mais</b>, <b>pourtant</b>, <b>cependant</b>.',
    addition: 'Le rapport logique est l’<b>addition</b> : on ajoute une idée qui va dans le même sens. '
      + 'Connecteurs : <b>de plus</b>, <b>et</b>, <b>en outre</b>.',
    exemple: 'Le rapport logique est l’<b>exemple</b> : la deuxième phrase illustre la première. '
      + 'Connecteur : <b>par exemple</b>.',
    temps: 'Le rapport logique est le <b>temps</b> : les actions se suivent dans l’ordre. '
      + 'Connecteurs : <b>d’abord</b>, <b>puis</b>, <b>ensuite</b>, <b>enfin</b>.',
  };

  ajouterEtape({
    id: '4e-vocabulaire-connecteurs',
    banque: CONNECTEURS,
    creerQuestion: ([phrase, reponse, autres, rapport, remarque]) => fabriquer(tirerType({ choix: 0.8, vraifaux: 0.2 }), {
      phrase,
      reponse,
      choix: RM.melanger([reponse, ...autres]),
      mauvais: autres,
      explication: `${remarque}<br>${RAPPORTS[rapport]}`,
      consigneChoix: 'Choisis le connecteur logique qui convient',
      consigneVraiFaux: 'Le connecteur surligné est-il bien choisi ?',
    }),
    titreLecon: 'Les connecteurs logiques',
    lecon: `
      <p>Les <b>connecteurs logiques</b> relient deux idées et montrent le <b>rapport</b> entre elles.</p>
      <table>
        <tr><th>rapport</th><th>connecteurs</th><th>exemple</th></tr>
        <tr><td><b>cause</b> (pourquoi ?)</td><td>car, en effet</td><td><i>Je reste au chaud, <b>car</b> il neige.</i></td></tr>
        <tr><td><b>conséquence</b> (le résultat)</td><td>donc, c’est pourquoi, par conséquent</td><td><i>Il neige, <b>donc</b> je reste au chaud.</i></td></tr>
        <tr><td><b>opposition</b></td><td>mais, pourtant, cependant</td><td><i>Il neige, <b>pourtant</b> Tom sort en short.</i></td></tr>
        <tr><td><b>addition</b></td><td>de plus, et, en outre</td><td><i>Il neige. <b>De plus</b>, il y a du vent.</i></td></tr>
        <tr><td><b>exemple</b></td><td>par exemple</td><td><i>J’aime l’hiver. <b>Par exemple</b>, j’adore la luge.</i></td></tr>
        <tr><td><b>temps</b></td><td>d’abord, puis, ensuite, enfin</td><td><i>Je mets mes bottes, <b>puis</b> je sors.</i></td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> ne confonds pas la cause et la conséquence !<br>
        <i>Je prends mon parapluie, <b>car</b> il pleut.</i> → la pluie est la <b>cause</b>.<br>
        <i>Il pleut, <b>donc</b> je prends mon parapluie.</i> → le parapluie est la <b>conséquence</b>.</div>
      <p>⚠️ Pour trouver le bon connecteur, demande-toi : la deuxième partie explique-t-elle <b>pourquoi</b> ?
        Donne-t-elle le <b>résultat</b> ? Dit-elle le <b>contraire</b> de ce qu’on attendait ?</p>
    `,
  });

  // ======================================================================
  // 6. Mélioratif ou péjoratif ?
  // ======================================================================
  ajouterClassement({
    id: '4e-vocabulaire-melioratif-pejoratif',
    consigne: 'Le {mot} souligné est-il mélioratif ou péjoratif ?',
    nombreChoix: 2,
    categories: {
      melioratif: {
        nom: 'mélioratif',
        regle: 'Un mot <b>mélioratif</b> présente la chose de façon <b>positive</b> : il la met en valeur.',
      },
      pejoratif: {
        nom: 'péjoratif',
        regle: 'Un mot <b>péjoratif</b> présente la chose de façon <b>négative</b> : il la dévalorise.',
      },
    },
    // [phrase, sorte, remarque de Roxy avec le mot neutre]
    banque: [
      ['Mes grands-parents vivent dans une [[demeure]] au bord du lagon.', 'melioratif',
        'Une demeure est une belle et grande maison. Mot neutre : <b>maison</b>.'],
      ['Sur le circuit, Papa admire un [[bolide]] rouge.', 'melioratif',
        'Un bolide est une voiture très rapide, qu’on admire. Mot neutre : <b>voiture</b>.'],
      ['Pour l’anniversaire de Mamie, nous avons préparé un [[festin]].', 'melioratif',
        'Un festin est un repas abondant et délicieux. Mot neutre : <b>repas</b>.'],
      ['Les roses répandent leur [[senteur]] dans tout le jardin.', 'melioratif',
        'Une senteur est une odeur agréable. Mot neutre : <b>odeur</b>.'],
      ['Ce jus d’orange frais est un vrai [[nectar]] !', 'melioratif',
        'Un nectar est une boisson délicieuse. Mot neutre : <b>boisson</b>.'],
      ['Le pianiste de l’orchestre est un [[virtuose]].', 'melioratif',
        'Un virtuose est un musicien extrêmement doué. Mot neutre : <b>musicien</b>.'],
      ['Roxy [[se régale]] de myrtilles.', 'melioratif',
        'Se régaler, c’est manger avec beaucoup de plaisir. Mot neutre : <b>manger</b>.'],
      ['Papi [[savoure]] son chocolat chaud au coin du feu.', 'melioratif',
        'Savourer, c’est boire ou manger lentement, en appréciant le goût. Mot neutre : <b>boire</b>.'],
      ['Les lilas [[embaument]] tout le jardin.', 'melioratif',
        'Embaumer, c’est répandre une odeur agréable. Mot neutre : <b>sentir</b>.'],
      ['Zoé chante d’une voix [[mélodieuse]].', 'melioratif',
        'Une voix mélodieuse est agréable à entendre. Pour rester neutre, on dirait « une voix <b>aiguë</b> » ou « <b>grave</b> ».'],
      ['Quelle journée [[radieuse]] pour aller à la plage !', 'melioratif',
        'Radieuse = pleine de soleil et de lumière. Mot neutre : <b>ensoleillée</b>.'],
      ['Sous le soleil, le château [[resplendit]].', 'melioratif',
        'Resplendir, c’est briller d’un éclat magnifique. Mot neutre : <b>briller</b>.'],
      ['Ce matin, Wakana a réussi une [[prouesse]] au trampoline.', 'melioratif',
        'Une prouesse est une action remarquable. Mot neutre : <b>une figure</b>, <b>un exercice</b>.'],
      ['Ta soupe au potiron est un [[délice]] !', 'melioratif',
        'Un délice, c’est quelque chose de délicieux. Mot neutre : <b>une soupe</b>, <b>un plat</b>.'],
      ['Léa est un [[as]] du skateboard.', 'melioratif',
        'Un as est une personne qui excelle dans une activité. Mot neutre : <b>une skateuse</b>.'],
      ['Au fond du bois se cache une [[bicoque]] toute de travers.', 'pejoratif',
        'Une bicoque est une petite maison mal construite, en mauvais état. Mot neutre : <b>maison</b>.'],
      ['Le voisin roule dans un vieux [[tacot]] très bruyant.', 'pejoratif',
        'Un tacot est une vieille voiture qui marche mal. Mot neutre : <b>voiture</b>.'],
      ['Mon cousin est un vrai [[je-sais-tout]] : il a réponse à tout.', 'pejoratif',
        'Un je-sais-tout croit tout savoir et veut le montrer. Mot neutre : <b>une personne qui sait beaucoup de choses</b>.'],
      ['Quelle [[puanteur]] dans cette poubelle !', 'pejoratif',
        'Une puanteur est une très mauvaise odeur. Mot neutre : <b>odeur</b>.'],
      ['Un [[chauffard]] roulait beaucoup trop vite dans la rue.', 'pejoratif',
        'Un chauffard est un conducteur dangereux. Mot neutre : <b>conducteur</b>.'],
      ['Maman range la [[paperasse]] qui encombre son bureau.', 'pejoratif',
        'La paperasse, ce sont des papiers inutiles ou ennuyeux. Mot neutre : <b>papiers</b>.'],
      ['Je ne comprends rien à ce [[charabia]] !', 'pejoratif',
        'Du charabia est une façon de parler ou d’écrire impossible à comprendre. Mot neutre : <b>langage</b>.'],
      ['Ce film est un [[navet]] : je me suis ennuyé du début à la fin.', 'pejoratif',
        'Un navet est un très mauvais film. Mot neutre : <b>film</b>.'],
      ['Le fermier a gardé son vieux [[canasson]].', 'pejoratif',
        'Un canasson est un cheval vieux ou fatigué. Mot neutre : <b>cheval</b>.'],
      ['Au goûter, Tom [[s’empiffre]] de bonbons.', 'pejoratif',
        'S’empiffrer, c’est manger énormément, avec avidité et sans manières. Mot neutre : <b>manger</b>.'],
      ['Au lieu de travailler, Noa [[rêvasse]] en regardant par la fenêtre.', 'pejoratif',
        'Rêvasser, c’est rêver sans but, en perdant son temps. Mot neutre : <b>rêver</b>.'],
      ['Arrête de [[pleurnicher]] pour un rien !', 'pejoratif',
        'Pleurnicher, c’est pleurer sans vraie raison, en se plaignant. Mot neutre : <b>pleurer</b>.'],
      ['Les vieilles chaussettes de Sami [[empestent]] !', 'pejoratif',
        'Empester, c’est sentir très mauvais. Mot neutre : <b>sentir</b>.'],
      ['Depuis sa victoire, Hugo [[se pavane]] dans la cour.', 'pejoratif',
        'Se pavaner, c’est marcher en se montrant, très fier de soi. Mot neutre : <b>se promener</b>.'],
      ['Le perroquet répète tout d’une voix [[criarde]].', 'pejoratif',
        'Une voix criarde est aiguë et désagréable. Pour rester neutre, on dirait « une voix <b>aiguë</b> » ou « <b>forte</b> ».'],
    ],
    titreLecon: 'Mélioratif ou péjoratif ?',
    lecon: `
      <p>On peut nommer une même chose avec un mot <b>neutre</b>, ou avec un mot qui donne un <b>jugement</b> :</p>
      <p>• un mot <b>mélioratif</b> la présente de façon <b>positive</b> (il la met en valeur) ;<br>
         • un mot <b>péjoratif</b> la présente de façon <b>négative</b> (il la dévalorise).</p>
      <table>
        <tr><th>mélioratif</th><th>neutre</th><th>péjoratif</th></tr>
        <tr><td>une demeure</td><td>une maison</td><td>une bicoque</td></tr>
        <tr><td>un bolide</td><td>une voiture</td><td>un tacot</td></tr>
        <tr><td>une senteur</td><td>une odeur</td><td>une puanteur</td></tr>
        <tr><td>se régaler</td><td>manger</td><td>s’empiffrer</td></tr>
      </table>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par un mot neutre, et demande-toi ce qu’on a enlevé :
        de l’admiration → <b>mélioratif</b> ; de la moquerie ou du mépris → <b>péjoratif</b>.</div>
      <p>⚠️ Certains suffixes sont souvent péjoratifs : <b>-asse</b> (paperasse), <b>-ard</b> (chauffard),
        <b>-asser</b> (rêvasser), <b>-âtre</b> (douceâtre).</p>
    `,
  });
})();
