// Renard Malin — Conjugaison, niveau 4e : les 6 étapes du Sentier d'hiver
//
// Les étapes « à verbes » utilisent le moteur js/moteur-conjugaison.js ;
// les étapes « à phrases » (choisir le bon temps ou le bon mode) utilisent js/moteur-phrases.js.

(function () {
  const { avecPronom, que, accorder, expliquerAccord, avecEtre, tempsCompose, astuceParticipe,
    nomAuxiliaire, auxiliaireDe, piegesCompose, ETRE, ajouterEtape } = RM.conj;
  const P = RM.phrases;
  const V = RM.verbe;

  // ======================================================================
  // 1. Le conditionnel passé
  // ======================================================================
  ajouterEtape({
    id: '4e-conjugaison-conditionnel-passe',
    temps: 'au conditionnel passé',
    partEcrire: 0.5,
    verbes: ['aimer', 'chanter', 'manger', 'finir', 'choisir', 'faire', 'dire', 'prendre', 'voir', 'savoir',
      'pouvoir', 'vouloir', 'aller', 'venir', 'partir', 'arriver', 'rester', 'tomber'],
    ...tempsCompose('conditionnel'),
    expliquer(verbe, s) {
      const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
      return `Le conditionnel passé = l’auxiliaire <b>${nomAuxiliaire(verbe)}</b> au <b>conditionnel présent</b> `
        + `(${auxiliaireDe(verbe).conditionnel[s.p]}) + le participe passé <b>${verbe.participe}</b>. `
        + 'Il exprime ce qui aurait pu arriver, mais n’est pas arrivé.'
        + (avecEtre(verbe) ? expliquerAccord(s, participe) : ' ' + astuceParticipe(verbe));
    },
    distracteurs: (verbe, s) => piegesCompose(verbe, s, 'conditionnel', ['futur', 'imparfait']),
    titreLecon: 'Le conditionnel passé',
    lecon: `
      <p>Le conditionnel passé exprime ce qui <b>aurait pu arriver</b> dans le passé… mais n’est pas arrivé,
        ou un <b>regret</b> : <i>J’<b>aurais aimé</b> venir. Si j’avais su, je <b>serais venue</b>.</i></p>
      <p>C’est un temps composé : l’auxiliaire au <b>conditionnel présent</b> + le participe passé.</p>
      <table>
        <tr><th>avec avoir</th><th>avec être</th></tr>
        <tr><td>j’<b>aurais</b> aimé</td><td>je <b>serais</b> venu(e)</td></tr>
        <tr><td>tu <b>aurais</b> aimé</td><td>tu <b>serais</b> venu(e)</td></tr>
        <tr><td>il <b>aurait</b> aimé</td><td>elle <b>serait</b> venue</td></tr>
        <tr><td>nous <b>aurions</b> aimé</td><td>nous <b>serions</b> venu(e)s</td></tr>
        <tr><td>vous <b>auriez</b> aimé</td><td>vous <b>seriez</b> venu(e)s</td></tr>
        <tr><td>ils <b>auraient</b> aimé</td><td>elles <b>seraient</b> venues</td></tr>
      </table>
      <div class="astuce">💡 j’<b>aurais</b> aimé (conditionnel passé) ≠ j’<b>aurai</b> aimé (futur antérieur) ≠ j’<b>avais</b> aimé (plus-que-parfait).</div>
    `,
  });

  // ======================================================================
  // 2. Si + imparfait → conditionnel présent
  // ======================================================================
  // [phrase, verbe, personne, temps attendu]
  const SI_IMPARFAIT = [
    ['Si j’___ des ailes, je volerais.', 'avoir', 0, 'imparfait'],
    ['Si tu ___ avec nous, tu t’amuserais.', 'venir', 1, 'imparfait'],
    ['S’il ___ beau, nous irions à la plage.', 'faire', 2, 'imparfait'],
    ['Si nous ___ riches, nous achèterions un château.', 'être', 3, 'imparfait'],
    ['Si vous ___ le temps, vous pourriez nous aider.', 'avoir', 4, 'imparfait'],
    ['Si Roxy ___ nager, elle traverserait la rivière.', 'savoir', 2, 'imparfait'],
    ['Si les enfants ___ leur chambre, ils pourraient sortir.', 'ranger', 5, 'imparfait'],
    ['Si je ___ ce livre, je te le prêterais.', 'trouver', 0, 'imparfait'],
    ['Si tu ___ plus patient, tu réussirais.', 'être', 1, 'imparfait'],
    ['Si elle ___ mieux, elle gagnerait la partie.', 'jouer', 2, 'imparfait'],
    ['Si nous ___ à Paris, nous visiterions la tour Eiffel.', 'aller', 3, 'imparfait'],
    ['Si je ___ voler, je visiterais le monde entier.', 'pouvoir', 0, 'imparfait'],
    ['Si j’avais faim, je ___ une pomme.', 'manger', 0, 'conditionnel'],
    ['Si tu venais, nous ___ ensemble.', 'jouer', 3, 'conditionnel'],
    ['S’il pleuvait, nous ___ à la maison.', 'rester', 3, 'conditionnel'],
    ['Si j’étais une renarde, j’___ dans la forêt.', 'habiter', 0, 'conditionnel'],
    ['Si vous gagniez, vous ___ très contents.', 'être', 4, 'conditionnel'],
    ['Si elle savait, elle nous le ___.', 'dire', 2, 'conditionnel'],
    ['Si nous avions le temps, nous ___ un gâteau.', 'faire', 3, 'conditionnel'],
    ['Si tu avais des ailes, tu ___ jusqu’aux nuages.', 'voler', 1, 'conditionnel'],
    ['Si les oiseaux pouvaient parler, ils nous ___ des secrets.', 'dire', 5, 'conditionnel'],
    ['Si j’avais le choix, je ___ le chocolat.', 'choisir', 0, 'conditionnel'],
    ['Si Roxy trouvait un trésor, elle ___ très heureuse.', 'être', 2, 'conditionnel'],
    ['Si tu m’aidais, je ___ plus vite.', 'finir', 0, 'conditionnel'],
  ];

  P.ajouterEtape({
    id: '4e-conjugaison-si-imparfait',
    banque: SI_IMPARFAIT,
    creerQuestion([phrase, infinitif, p, temps]) {
      const verbe = V(infinitif);
      const reponse = verbe[temps][p];
      // Pas d'imparfait parmi les pièges de la conséquence : « Si j’avais faim, je mangeais » est juste
      // quand « si » veut dire « chaque fois que ».
      const choix = temps === 'imparfait'
        ? [verbe.imparfait[p], verbe.conditionnel[p], verbe.futur[p]]
        : [verbe.conditionnel[p], verbe.futur[p], verbe.present[p]];
      const explication = temps === 'imparfait'
        ? `Après « <b>si</b> » (la condition), on met l’<b>imparfait</b> : ${reponse}. Quand « si » exprime une condition, `
          + 'jamais de futur ni de conditionnel juste après : « si j’aurais » ou « si j’aurai » sont des erreurs, on dit « si j’avais » !'
        : `Quand la condition est « si + imparfait », la conséquence se met au <b>conditionnel présent</b> : ${reponse}.`;
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix,
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Choisis le bon temps',
        // Pour la conséquence, on précise le temps : « je mangeais » serait aussi juste au sens de « chaque fois que »
        consigneEcrire: temps === 'imparfait' ? 'Écris le verbe au bon temps' : 'Écris le verbe au conditionnel présent',
      });
    },
    titreLecon: 'Si + imparfait',
    lecon: `
      <p>Pour imaginer ce qui <b>pourrait</b> arriver, on utilise deux temps qui vont ensemble :</p>
      <table>
        <tr><th>la condition</th><th>la conséquence</th></tr>
        <tr><td><b>si</b> + imparfait</td><td>conditionnel présent</td></tr>
        <tr><td>Si j’<b>avais</b> des ailes,</td><td>je <b>volerais</b>.</td></tr>
        <tr><td>S’il <b>faisait</b> beau,</td><td>nous <b>irions</b> à la plage.</td></tr>
      </table>
      <div class="astuce">💡 <b>Les « si » n’aiment pas les « -rais » !</b><br>
        Quand « si » exprime une condition, jamais de conditionnel juste après : on ne dit pas « si j’aurais »,
        mais « si j’<b>avais</b> ». (Dans une question, c’est différent : « Dis-moi si tu viendras » est correct.)</div>
    `,
  });

  // ======================================================================
  // 3. Le subjonctif passé
  // ======================================================================
  ajouterEtape({
    id: '4e-conjugaison-subjonctif-passe',
    temps: 'au subjonctif passé',
    que: true,
    partEcrire: 0.5,
    verbes: ['chanter', 'manger', 'finir', 'choisir', 'faire', 'dire', 'prendre', 'voir', 'lire', 'écrire',
      'mettre', 'aller', 'venir', 'partir', 'arriver', 'rentrer'],
    ...tempsCompose('subjonctif'),
    expliquer(verbe, s) {
      const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
      const aux = auxiliaireDe(verbe).subjonctif[s.p];
      return `Le subjonctif passé = l’auxiliaire <b>${nomAuxiliaire(verbe)}</b> au <b>subjonctif présent</b> `
        + `(${que(s.pronom)}${avecPronom(s.pronom, aux)}) + le participe passé <b>${verbe.participe}</b>. `
        + 'Il montre une action terminée : Il faut que tu aies fini avant midi.'
        + (avecEtre(verbe) ? expliquerAccord(s, participe) : ' ' + astuceParticipe(verbe));
    },
    distracteurs: (verbe, s) => piegesCompose(verbe, s, 'subjonctif', ['present']),
    titreLecon: 'Le subjonctif passé',
    lecon: `
      <p>Le subjonctif passé montre une action <b>terminée</b>, après « que » :
        <i>Il faut que tu <b>aies fini</b> avant midi. Je suis contente qu’elle <b>soit venue</b>.</i></p>
      <p>C’est un temps composé : l’auxiliaire au <b>subjonctif présent</b> + le participe passé.</p>
      <table>
        <tr><th>avec avoir</th><th>avec être</th></tr>
        <tr><td>que j’<b>aie</b> fini</td><td>que je <b>sois</b> parti(e)</td></tr>
        <tr><td>que tu <b>aies</b> fini</td><td>que tu <b>sois</b> parti(e)</td></tr>
        <tr><td>qu’il <b>ait</b> fini</td><td>qu’elle <b>soit</b> partie</td></tr>
        <tr><td>que nous <b>ayons</b> fini</td><td>que nous <b>soyons</b> parti(e)s</td></tr>
        <tr><td>que vous <b>ayez</b> fini</td><td>que vous <b>soyez</b> parti(e)s</td></tr>
        <tr><td>qu’ils <b>aient</b> fini</td><td>qu’elles <b>soient</b> parties</td></tr>
      </table>
      <div class="astuce">💡 Attention à l’orthographe de l’auxiliaire : que j’<b>aie</b> (avec un e), qu’il <b>ait</b> (avec un t),
        que nous <b>ayons</b> (sans i !).</div>
    `,
  });

  // ======================================================================
  // 4. Indicatif ou subjonctif ?
  // ======================================================================
  const RAISONS = {
    obligation: 'une obligation', volonte: 'une volonté ou un souhait', doute: 'un doute',
    but: 'un but', concession: 'une opposition', avant: 'une action qui n’a pas encore eu lieu',
    certitude: 'une certitude', opinion: 'une opinion', cause: 'une cause', simultane: 'deux actions en même temps',
  };
  // [phrase, verbe, personne, mode attendu, le mot qui déclenche, la raison]
  const INDICATIF_OU_SUBJONCTIF = [
    ['Il faut que tu ___ tes devoirs.', 'faire', 1, 'subjonctif', 'il faut que', 'obligation'],
    ['Je veux que vous ___ à l’heure.', 'être', 4, 'subjonctif', 'je veux que', 'volonte'],
    ['Maman aimerait que nous ___ la vaisselle.', 'faire', 3, 'subjonctif', 'aimerait que', 'volonte'],
    ['Il faut qu’elle ___ son manteau.', 'prendre', 2, 'subjonctif', 'il faut que', 'obligation'],
    ['Bien qu’il ___ froid, nous sortons.', 'faire', 2, 'subjonctif', 'bien que', 'concession'],
    ['Je range ma chambre pour que tu ___ jouer.', 'pouvoir', 1, 'subjonctif', 'pour que', 'but'],
    ['Il faut que tu ___ chez le dentiste.', 'aller', 1, 'subjonctif', 'il faut que', 'obligation'],
    ['Je souhaite que tu ___ heureuse.', 'être', 1, 'subjonctif', 'je souhaite que', 'volonte'],
    ['Avant que nous ___, fais-nous un câlin.', 'partir', 3, 'subjonctif', 'avant que', 'avant'],
    ['Il est important que vous ___ la vérité.', 'savoir', 4, 'subjonctif', 'il est important que', 'obligation'],
    ['Je doute qu’il ___ ce soir.', 'venir', 2, 'subjonctif', 'je doute que', 'doute'],
    ['Il faut que l’élève ___ son travail.', 'finir', 2, 'subjonctif', 'il faut que', 'obligation'],
    ['Je sais que tu ___ tes devoirs.', 'faire', 1, 'present', 'je sais que', 'certitude'],
    ['Je pense que vous ___ à l’heure.', 'être', 4, 'present', 'je pense que', 'opinion'],
    ['Il est certain qu’elle ___ son manteau.', 'prendre', 2, 'present', 'il est certain que', 'certitude'],
    ['Parce qu’il ___ froid, nous restons dedans.', 'faire', 2, 'present', 'parce que', 'cause'],
    ['Je vois que tu ___ jouer.', 'pouvoir', 1, 'present', 'je vois que', 'certitude'],
    ['Je suis sûre que tu ___ heureuse.', 'être', 1, 'present', 'je suis sûre que', 'certitude'],
    ['Pendant que nous ___ la vaisselle, tu ranges.', 'faire', 3, 'present', 'pendant que', 'simultane'],
    ['Je crois qu’il ___ ce soir.', 'venir', 2, 'present', 'je crois que', 'opinion'],
    ['Tout le monde sait que vous ___ la vérité.', 'savoir', 4, 'present', 'tout le monde sait que', 'certitude'],
    ['Elle sait que tu ___ chez le dentiste.', 'aller', 1, 'present', 'elle sait que', 'certitude'],
    ['Il est évident que l’élève ___ son travail.', 'finir', 2, 'present', 'il est évident que', 'certitude'],
    ['Je suis certain que vous ___ raison.', 'avoir', 4, 'present', 'je suis certain que', 'certitude'],
  ];

  P.ajouterEtape({
    id: '4e-conjugaison-indicatif-ou-subjonctif',
    banque: INDICATIF_OU_SUBJONCTIF,
    creerQuestion([phrase, infinitif, p, mode, declencheur, raison]) {
      const verbe = V(infinitif);
      const reponse = verbe[mode][p];
      const autre = mode === 'subjonctif' ? verbe.present[p] : verbe.subjonctif[p];
      const explication = mode === 'subjonctif'
        ? `« ${declencheur} » exprime ${RAISONS[raison]} : on met le <b>subjonctif</b> → ${reponse}.`
        : `« ${declencheur} » exprime ${RAISONS[raison]} : on met l’<b>indicatif</b> (ici au présent) → ${reponse}.`;
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: [verbe.present[p], verbe.subjonctif[p]],
        mauvais: [autre],
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Indicatif ou subjonctif ?',
        consigneEcrire: 'Écris le verbe à l’indicatif présent ou au subjonctif présent',
      });
    },
    titreLecon: 'Indicatif ou subjonctif ?',
    lecon: `
      <p>Après « que », on met tantôt l’indicatif, tantôt le subjonctif. Tout dépend du <b>sens</b>.</p>
      <h4>L’indicatif : c’est réel, c’est sûr</h4>
      <p>je sais que, je vois que, il est certain que, je pense que, je crois que, parce que, pendant que…</p>
      <p>👉 <i>Je sais que tu <b>viens</b>.</i></p>
      <p>⚠️ « je pense que » et « je crois que » demandent l’indicatif à la forme affirmative…
        mais le plus souvent le subjonctif à la forme négative : <i>Je ne pense pas qu’il <b>vienne</b>.</i></p>
      <h4>Le subjonctif : c’est voulu, nécessaire, douteux</h4>
      <p>il faut que, je veux que, je souhaite que, je doute que, pour que, bien que, avant que…</p>
      <p>👉 <i>Il faut que tu <b>viennes</b>.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le verbe par « faire ».<br>
        <i>Il faut que tu <u>fasses</u></i> → subjonctif · <i>Je sais que tu <u>fais</u></i> → indicatif.</div>
    `,
  });

  // ======================================================================
  // 5. La voix passive
  // ======================================================================
  const AUX_PASSIF = {
    present: { nom: 'présent', auNom: 'au présent', s: 'est', p: 'sont' },
    imparfait: { nom: 'imparfait', auNom: 'à l’imparfait', s: 'était', p: 'étaient' },
    futur: { nom: 'futur', auNom: 'au futur', s: 'sera', p: 'seront' },
    passeCompose: { nom: 'passé composé', auNom: 'au passé composé', s: 'a été', p: 'ont été' },
  };
  // [phrase, verbe, sujet, genre et nombre du sujet, temps]
  const VOIX_PASSIVE = [
    ['Le gâteau ___ par Roxy.', 'manger', 'le gâteau', 'ms', 'present'],
    ['Les lettres ___ par Léa.', 'écrire', 'les lettres', 'fp', 'present'],
    ['La souris ___ par le chat.', 'voir', 'la souris', 'fs', 'passeCompose'],
    ['Les chatons ___ par les enfants.', 'regarder', 'les chatons', 'mp', 'present'],
    ['La porte ___ par le vent.', 'ouvrir', 'la porte', 'fs', 'passeCompose'],
    ['Les pommes ___ par les enfants.', 'manger', 'les pommes', 'fp', 'passeCompose'],
    ['Le trésor ___ par un pirate.', 'trouver', 'le trésor', 'ms', 'passeCompose'],
    ['Les chansons ___ par la chorale.', 'chanter', 'les chansons', 'fp', 'futur'],
    ['La chambre ___ par Tom.', 'ranger', 'la chambre', 'fs', 'futur'],
    ['Les dessins ___ par les élèves.', 'faire', 'les dessins', 'mp', 'imparfait'],
    ['Cette histoire ___ par mon grand-père.', 'écrire', 'cette histoire', 'fs', 'passeCompose'],
    ['Les moutons ___ par le chien.', 'garder', 'les moutons', 'mp', 'present'],
    ['La tarte ___ par Maman.', 'faire', 'la tarte', 'fs', 'present'],
    ['Le match ___ par notre équipe.', 'gagner', 'le match', 'ms', 'passeCompose'],
    ['Les fenêtres ___ chaque matin.', 'ouvrir', 'les fenêtres', 'fp', 'present'],
    ['Le renardeau ___ par sa mère.', 'garder', 'le renardeau', 'ms', 'present'],
    ['Les devoirs ___ avant le dîner.', 'finir', 'les devoirs', 'mp', 'futur'],
    ['La maison ___ par des ouvriers.', 'construire', 'la maison', 'fs', 'passeCompose'],
    ['Autrefois, les tableaux ___ par tout le monde.', 'regarder', 'les tableaux', 'mp', 'imparfait'],
    ['Le film ___ par des millions de personnes.', 'voir', 'le film', 'ms', 'passeCompose'],
    ['Les règles ___ par tous les élèves.', 'apprendre', 'les règles', 'fp', 'present'],
    ['La chanson ___ par toute la classe.', 'chanter', 'la chanson', 'fs', 'futur'],
    ['Les biscuits ___ par Roxy.', 'prendre', 'les biscuits', 'mp', 'passeCompose'],
    ['La réponse ___ par Zoé.', 'trouver', 'la réponse', 'fs', 'passeCompose'],
  ];

  P.ajouterEtape({
    id: '4e-conjugaison-voix-passive',
    banque: VOIX_PASSIVE,
    creerQuestion([phrase, infinitif, sujet, cas, temps]) {
      const participe = V(infinitif).participe;
      const aux = AUX_PASSIF[temps];
      const forme = c => `${aux[c[1]]} ${P.accorderCas(participe, c)}`;
      const reponse = forme(cas);
      const choix = [...new Set(['ms', 'fs', 'mp', 'fp'].map(forme))];
      const explication = `À la voix passive, le sujet <b>subit</b> l’action. On utilise l’auxiliaire <b>être</b> `
        + `${aux.auNom} (${aux[cas[1]]}) + le participe passé, qui <b>s’accorde avec le sujet</b> « ${sujet} » `
        + `(${P.genreNombre(cas)}) : <b>${reponse}</b>.`
        + (temps === 'passeCompose' ? ' Au passé composé, l’auxiliaire être devient « a été » ou « ont été ».' : '');
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.25, vraifaux: 0.15 }), {
        phrase,
        reponse,
        choix: RM.melanger(choix),
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(`${infinitif}, ${aux.nom}`),
        consigneChoix: 'Choisis le verbe à la voix passive',
        consigneEcrire: 'Écris le verbe à la voix passive',
      });
    },
    titreLecon: 'La voix passive',
    lecon: `
      <p>À la voix <b>active</b>, le sujet fait l’action : <i>Roxy mange le gâteau.</i><br>
         À la voix <b>passive</b>, le sujet <b>subit</b> l’action : <i>Le gâteau <b>est mangé</b> par Roxy.</i></p>
      <h4>🌟 être (au temps de la phrase active) + participe passé</h4>
      <table>
        <tr><th>temps</th><th>voix passive</th></tr>
        <tr><td>présent</td><td>le gâteau <b>est</b> mangé</td></tr>
        <tr><td>imparfait</td><td>le gâteau <b>était</b> mangé</td></tr>
        <tr><td>futur</td><td>le gâteau <b>sera</b> mangé</td></tr>
        <tr><td>passé composé</td><td>le gâteau <b>a été</b> mangé</td></tr>
      </table>
      <div class="astuce">💡 Comme toujours avec être, le participe passé <b>s’accorde avec le sujet</b> :
        <i>La tarte est mangé<b>e</b>. Les pommes ont été mangé<b>es</b>.</i></div>
    `,
  });

  // ======================================================================
  // 6. Le participe présent et le gérondif
  // ======================================================================
  const VERBES_PARTICIPE = ['chanter', 'jouer', 'manger', 'commencer', 'nager', 'lancer', 'écouter', 'finir',
    'choisir', 'grandir', 'faire', 'dire', 'prendre', 'venir', 'voir', 'vouloir', 'aller', 'partir',
    'savoir', 'être', 'avoir'];
  const EXCEPTIONS_PARTICIPE = ['être', 'avoir', 'savoir'];

  P.ajouterEtape({
    id: '4e-conjugaison-participe-present',
    banque: VERBES_PARTICIPE.flatMap(infinitif => [[infinitif, 'participe'], [infinitif, 'gerondif']]),
    creerQuestion([infinitif, forme]) {
      const verbe = V(infinitif);
      const reponse = verbe.participePresent;
      const choix = [...new Set([reponse, verbe.present[5], verbe.participe, verbe.imparfait[2]])];
      let explication = EXCEPTIONS_PARTICIPE.includes(infinitif)
        ? `Exception à retenir : ${infinitif} → <b>${reponse}</b>.`
        : `Le participe présent se forme avec le radical de « nous » au présent + <b>-ant</b> : `
          + `nous ${verbe.present[3]} → <b>${reponse}</b>.`;
      explication += ' Il est <b>invariable</b>.';
      if (forme === 'gerondif') explication += ' Le gérondif, c’est « en » + le participe présent : il montre une action faite en même temps.';
      return P.fabriquer(P.tirerType({ choix: 0.5, ecrire: 0.5 }), {
        phrase: forme === 'gerondif' ? 'en ___' : '___',
        reponse,
        choix: RM.melanger(choix),
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(infinitif),
        consigneChoix: forme === 'gerondif' ? 'Choisis le gérondif' : 'Choisis le participe présent',
        consigneEcrire: forme === 'gerondif' ? 'Écris le gérondif' : 'Écris le participe présent',
      });
    },
    titreLecon: 'Le participe présent et le gérondif',
    lecon: `
      <p>Le participe présent se termine toujours par <b>-ant</b> : <i>chantant, finissant, faisant</i>.
        Il est <b>invariable</b>.</p>
      <h4>🌟 Radical de « nous » au présent + -ant</h4>
      <table>
        <tr><td>nous chant<u>ons</u> → chant<b>ant</b></td><td>nous finiss<u>ons</u> → finiss<b>ant</b></td></tr>
        <tr><td>nous mange<u>ons</u> → mange<b>ant</b></td><td>nous commenç<u>ons</u> → commenç<b>ant</b></td></tr>
        <tr><td>nous fais<u>ons</u> → fais<b>ant</b></td><td>nous pren<u>ons</u> → pren<b>ant</b></td></tr>
      </table>
      <p>⚠️ Trois exceptions : être → <b>étant</b>, avoir → <b>ayant</b>, savoir → <b>sachant</b>.</p>
      <h4>Le gérondif = en + participe présent</h4>
      <p>Il montre une action faite <b>en même temps</b> qu’une autre : <i>Roxy chante <b>en marchant</b>.</i></p>
    `,
  });
})();
