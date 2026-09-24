// Renard Malin — Conjugaison, niveau 3e : les 6 étapes du Sentier des étoiles
//
// Les étapes « à verbes » utilisent le moteur js/moteur-conjugaison.js ;
// les étapes « à phrases » utilisent js/moteur-phrases.js.
// Deux étapes sont spéciales : « Reconnaître un temps » et « La grande révision ».

(function () {
  const C = RM.conj;
  const { avecPronom, que, accorder, expliquerAccord, avecEtre, tempsCompose, astuceParticipe,
    nomAuxiliaire, auxiliaireDe, piegesCompose, sujetSimple, ETRE, AVOIR, ajouterEtape } = C;
  const P = RM.phrases;
  const V = RM.verbe;

  // ======================================================================
  // 1. Le passé antérieur
  // ======================================================================
  ajouterEtape({
    id: '3e-conjugaison-passe-anterieur',
    temps: 'au passé antérieur',
    partEcrire: 0.5,
    verbes: ['finir', 'manger', 'parler', 'chanter', 'faire', 'dire', 'prendre', 'voir', 'lire', 'écrire',
      'partir', 'arriver', 'sortir', 'rentrer', 'descendre', 'venir'],
    ...tempsCompose('passeSimple'),
    expliquer(verbe, s) {
      const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
      return `Le passé antérieur = l’auxiliaire <b>${nomAuxiliaire(verbe)}</b> au <b>passé simple</b> `
        + `(${auxiliaireDe(verbe).passeSimple[s.p]}) + le participe passé <b>${verbe.participe}</b>. `
        + 'Dans un récit, il montre une action terminée juste avant une autre : Quand il eut fini, il partit.'
        + (avecEtre(verbe) ? expliquerAccord(s, participe) : ' ' + astuceParticipe(verbe));
    },
    distracteurs: (verbe, s) => piegesCompose(verbe, s, 'passeSimple', ['imparfait', 'present']),
    titreLecon: 'Le passé antérieur',
    lecon: `
      <p>Le passé antérieur est le temps composé qui accompagne le <b>passé simple</b> dans les récits.
        Il montre une action <b>terminée juste avant</b> une autre :
        <i>Quand il <b>eut fini</b> son repas, il <b>partit</b>.</i></p>
      <p>Auxiliaire <b>avoir</b> ou <b>être</b> au <b>passé simple</b> + participe passé :</p>
      <table>
        <tr><th>avec avoir</th><th>avec être</th></tr>
        <tr><td>j’<b>eus</b> fini</td><td>je <b>fus</b> parti(e)</td></tr>
        <tr><td>tu <b>eus</b> fini</td><td>tu <b>fus</b> parti(e)</td></tr>
        <tr><td>il <b>eut</b> fini</td><td>elle <b>fut</b> partie</td></tr>
        <tr><td>nous <b>eûmes</b> fini</td><td>nous <b>fûmes</b> parti(e)s</td></tr>
        <tr><td>vous <b>eûtes</b> fini</td><td>vous <b>fûtes</b> parti(e)s</td></tr>
        <tr><td>ils <b>eurent</b> fini</td><td>elles <b>furent</b> parties</td></tr>
      </table>
      <div class="astuce">💡 On le trouve souvent après <b>quand, lorsque, dès que, après que, à peine</b> :
        <i>Dès qu’elle fut arrivée, la fête commença.</i><br>
        Ne le confonds pas avec le plus-que-parfait : il <b>avait</b> fini (une action antérieure, souvent avec l’imparfait) /
        il <b>eut</b> fini (juste avant une action au passé simple).</div>
    `,
  });

  // ======================================================================
  // 2. Le subjonctif imparfait (le reconnaître, surtout à la 3e personne)
  // ======================================================================
  // Chaque verbe avec la fin de sa phrase (« Il fallait qu’il fût prêt. »)
  const VERBES_SUBJ_IMPARFAIT = {
    chanter: 'une chanson', jouer: 'dehors', parler: 'plus fort', aimer: 'ce livre', manger: 'sa soupe',
    commencer: 'ses devoirs', arriver: 'à l’heure', finir: 'son travail', choisir: 'un cadeau',
    être: { il: 'prêt', elle: 'prête' }, avoir: 'raison', faire: 'ses devoirs', dire: 'la vérité',
    prendre: 'le train', venir: 'avec nous', voir: 'un médecin', pouvoir: 'partir', vouloir: 'bien venir',
    aller: 'à l’école', savoir: 'sa leçon',
  };

  P.ajouterEtape({
    id: '3e-conjugaison-subjonctif-imparfait',
    banque: Object.keys(VERBES_SUBJ_IMPARFAIT),
    creerQuestion(infinitif) {
      const verbe = V(infinitif);
      const pronom = RM.hasard(['il', 'elle']);
      const suite = VERBES_SUBJ_IMPARFAIT[infinitif];
      const complement = typeof suite === 'string' ? suite : suite[pronom];
      const reponse = verbe.subjonctifImparfait3;
      const passeSimple = verbe.passeSimple[2];
      const choix = [...new Set([reponse, passeSimple, verbe.imparfait[2], verbe.subjonctif[2]])];
      const explication = `On part du <b>passé simple</b> : ${pronom} ${passeSimple} → qu’${pronom} <b>${reponse}</b> : `
        + `on ajoute un <b>accent circonflexe</b>${passeSimple.endsWith('a') ? ' et un <b>t</b>' : ''}. `
        + 'Ce temps très littéraire se rencontre surtout dans les livres anciens.';
      return P.fabriquer(P.tirerType({ choix: 0.7, ecrire: 0.3 }), {
        phrase: `Il fallait qu’${pronom} ___ ${complement}.`,
        reponse,
        choix: RM.melanger(choix),
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Choisis le subjonctif imparfait',
        consigneEcrire: 'Écris le verbe au subjonctif imparfait',
      });
    },
    titreLecon: 'Le subjonctif imparfait',
    lecon: `
      <p>Le subjonctif imparfait est un temps <b>littéraire</b> : on le lit dans les romans anciens, après « que »,
        quand le verbe principal est au passé : <i>Il fallait qu’il <b>partît</b>.</i></p>
      <p>En 3e, il faut surtout savoir le <b>reconnaître</b> à la 3e personne du singulier.</p>
      <h4>🌟 Passé simple + accent circonflexe (+ t)</h4>
      <table>
        <tr><th>passé simple</th><th>subjonctif imparfait</th></tr>
        <tr><td>il chanta</td><td>qu’il chant<b>ât</b></td></tr>
        <tr><td>il finit</td><td>qu’il fin<b>ît</b></td></tr>
        <tr><td>il fut</td><td>qu’il f<b>ût</b></td></tr>
        <tr><td>il eut</td><td>qu’il e<b>ût</b></td></tr>
        <tr><td>il fit</td><td>qu’il f<b>ît</b></td></tr>
        <tr><td>il vint</td><td>qu’il v<b>înt</b></td></tr>
      </table>
      <div class="astuce">💡 Le petit chapeau fait toute la différence : <i>il fut</i> (passé simple) ≠ <i>qu’il fût</i> (subjonctif imparfait).</div>
    `,
  });

  // ======================================================================
  // 3. Si + plus-que-parfait → conditionnel passé
  // ======================================================================
  // [phrase, verbe, personne, temps attendu ('pqp' ou 'conditionnelPasse'), genre et nombre (avec être)]
  const SI_PLUS_QUE_PARFAIT = [
    ['Si j’___ la vérité, je serais venue.', 'savoir', 0, 'pqp'],
    ['Si tu ___ le bus, tu n’aurais pas été en retard.', 'prendre', 1, 'pqp'],
    ['Si nous ___ le match, nous aurions fait la fête.', 'gagner', 3, 'pqp'],
    ['S’il ___ beau, nous serions allés à la plage.', 'faire', 2, 'pqp'],
    ['Si Roxy ___ le loup, elle se serait cachée.', 'voir', 2, 'pqp'],
    ['Si vous ___ plus tôt, vous auriez pu jouer.', 'finir', 4, 'pqp'],
    ['Si les enfants ___ sages, ils auraient eu un bonbon.', 'être', 5, 'pqp'],
    ['Si j’___ le temps, je t’aurais aidée.', 'avoir', 0, 'pqp'],
    ['Si elle ___ la vérité, on l’aurait crue.', 'dire', 2, 'pqp'],
    ['Si nous ___ la maîtresse, nous aurions compris.', 'écouter', 3, 'pqp'],
    ['Si j’avais su, j’___ la vérité.', 'dire', 0, 'conditionnelPasse'],
    ['Si tu avais travaillé, tu ___.', 'réussir', 1, 'conditionnelPasse'],
    ['S’il avait fait beau, nous ___ dehors.', 'jouer', 3, 'conditionnelPasse'],
    ['Si Roxy avait eu faim, elle ___ une pomme.', 'manger', 2, 'conditionnelPasse'],
    ['Si vous étiez venus, vous ___ le spectacle.', 'voir', 4, 'conditionnelPasse'],
    ['Si les renards avaient trouvé le trésor, ils l’___.', 'prendre', 5, 'conditionnelPasse'],
    ['Si j’avais eu de l’argent, j’___ ce livre.', 'acheter', 0, 'conditionnelPasse'],
    ['Si elle avait su nager, elle ___ la rivière.', 'traverser', 2, 'conditionnelPasse'],
    ['Si nous étions partis plus tôt, nous ___ à l’heure.', 'arriver', 3, 'conditionnelPasse', 'mp'],
    ['Si tu nous avais appelés, nous ___ tout de suite.', 'venir', 3, 'conditionnelPasse', 'mp'],
  ];

  // Un temps composé écrit avec l'auxiliaire à un temps donné (pour les phrases de la banque)
  function compose(verbe, p, tempsAuxiliaire, cas) {
    if (!avecEtre(verbe)) return `${AVOIR[tempsAuxiliaire][p]} ${verbe.participe}`;
    return `${ETRE[tempsAuxiliaire][p]} ${P.accorderCas(verbe.participe, cas)}`;
  }

  P.ajouterEtape({
    id: '3e-conjugaison-si-plus-que-parfait',
    banque: SI_PLUS_QUE_PARFAIT,
    creerQuestion([phrase, infinitif, p, temps, cas]) {
      const verbe = V(infinitif);
      const formes = {
        pqp: compose(verbe, p, 'imparfait', cas),
        conditionnelPasse: compose(verbe, p, 'conditionnel', cas),
        futurAnterieur: compose(verbe, p, 'futur', cas),
      };
      const reponse = formes[temps];
      const choix = Object.values(formes);
      const explication = (temps === 'pqp'
        ? 'Quand « <b>si</b> » exprime une condition, jamais de futur ni de conditionnel juste après ! Pour une condition dans le passé : '
          + `si + <b>plus-que-parfait</b> → ${reponse}.`
        : 'Quand la condition est « si + plus-que-parfait », la conséquence se met au <b>conditionnel passé</b> : '
          + `${reponse}.`) + (avecEtre(verbe) ? ' Avec être, le participe s’accorde avec le sujet.' : '');
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix,
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Choisis le bon temps',
        // Pour la conséquence, on précise le temps attendu, pour qu'une seule réponse soit juste
        consigneEcrire: temps === 'pqp' ? 'Écris le verbe au bon temps' : 'Écris le verbe au conditionnel passé',
      });
    },
    titreLecon: 'Si + plus-que-parfait',
    lecon: `
      <p>Pour imaginer ce qui <b>aurait pu</b> se passer dans le passé (mais ne s’est pas passé), on associe :</p>
      <table>
        <tr><th>la condition</th><th>la conséquence</th></tr>
        <tr><td><b>si</b> + plus-que-parfait</td><td>conditionnel passé</td></tr>
        <tr><td>Si j’<b>avais su</b>,</td><td>je <b>serais venu(e)</b>.</td></tr>
        <tr><td>S’il <b>avait fait</b> beau,</td><td>nous <b>aurions joué</b> dehors.</td></tr>
      </table>
      <div class="astuce">💡 Rappel des trois systèmes avec « si » :<br>
        • si + présent → futur : <i>Si tu viens, je serai contente.</i><br>
        • si + imparfait → conditionnel présent : <i>Si tu venais, je serais contente.</i><br>
        • si + plus-que-parfait → conditionnel passé : <i>Si tu étais venu, j’aurais été contente.</i><br>
        Et quand « si » exprime une condition, jamais de « -rais » juste après !</div>
    `,
  });

  // ======================================================================
  // 4. Le discours indirect (la concordance des temps)
  // ======================================================================
  const CHANGEMENTS = {
    present: { cible: 'imparfait', texte: 'le <b>présent</b> devient <b>imparfait</b>' },
    futur: { cible: 'conditionnel', texte: 'le <b>futur</b> devient <b>conditionnel présent</b> (le « futur dans le passé »)' },
    passeCompose: { cible: 'pqp', texte: 'le <b>passé composé</b> devient <b>plus-que-parfait</b>' },
  };
  // [phrase, verbe, personne dans la phrase rapportée, temps des paroles de départ]
  const DISCOURS_INDIRECT = [
    ['Roxy a dit : « Je viendrai demain. » → Roxy a dit qu’elle ___ le lendemain.', 'venir', 2, 'futur'],
    ['Tom a dit : « J’ai faim. » → Tom a dit qu’il ___ faim.', 'avoir', 2, 'present'],
    ['Léa a annoncé : « J’ai gagné ! » → Léa a annoncé qu’elle ___.', 'gagner', 2, 'passeCompose'],
    ['Papa a promis : « Nous irons à la mer. » → Papa a promis que nous ___ à la mer.', 'aller', 3, 'futur'],
    ['Les enfants ont crié : « Nous sommes prêts ! » → Les enfants ont crié qu’ils ___ prêts.', 'être', 5, 'present'],
    ['Roxy a expliqué : « J’ai trouvé un trésor. » → Roxy a expliqué qu’elle ___ un trésor.', 'trouver', 2, 'passeCompose'],
    ['Le maître a dit : « Vous réussirez. » → Le maître a dit que nous ___.', 'réussir', 3, 'futur'],
    ['Zoé a crié : « J’ai froid ! » → Zoé a crié qu’elle ___ froid.', 'avoir', 2, 'present'],
    ['Mon frère a juré : « Je rangerai ma chambre. » → Mon frère a juré qu’il ___ sa chambre.', 'ranger', 2, 'futur'],
    ['Le guide a annoncé : « Nous sommes en retard. » → Le guide a annoncé que nous ___ en retard.', 'être', 3, 'present'],
    ['Maman a dit : « J’ai fini le gâteau. » → Maman a dit qu’elle ___ le gâteau.', 'finir', 2, 'passeCompose'],
    ['Tom a répondu : « Je peux venir. » → Tom a répondu qu’il ___ venir.', 'pouvoir', 2, 'present'],
    ['Les filles ont dit : « Nous ferons un spectacle. » → Les filles ont dit qu’elles ___ un spectacle.', 'faire', 5, 'futur'],
    ['Roxy a dit : « Je suis fatiguée. » → Roxy a dit qu’elle ___ fatiguée.', 'être', 2, 'present'],
    ['Léo a raconté : « J’ai vu un renard. » → Léo a raconté qu’il ___ un renard.', 'voir', 2, 'passeCompose'],
    ['Grand-mère a promis : « Je viendrai vous voir. » → Grand-mère a promis qu’elle ___ nous voir.', 'venir', 2, 'futur'],
  ];

  P.ajouterEtape({
    id: '3e-conjugaison-discours-indirect',
    banque: DISCOURS_INDIRECT,
    creerQuestion([phrase, infinitif, p, tempsDepart]) {
      const verbe = V(infinitif);
      const formes = {
        present: verbe.present[p], imparfait: verbe.imparfait[p],
        futur: verbe.futur[p], conditionnel: verbe.conditionnel[p],
        passeCompose: `${AVOIR.present[p]} ${verbe.participe}`, pqp: `${AVOIR.imparfait[p]} ${verbe.participe}`,
        conditionnelPasse: `${AVOIR.conditionnel[p]} ${verbe.participe}`,
      };
      const changement = CHANGEMENTS[tempsDepart];
      const reponse = formes[changement.cible];
      const troisieme = { imparfait: 'conditionnel', conditionnel: 'imparfait', pqp: 'conditionnelPasse' }[changement.cible];
      const choix = [...new Set([reponse, formes[tempsDepart], formes[troisieme]])];
      const explication = 'Quand le verbe qui rapporte les paroles est au <b>passé</b> (a dit, a promis…), '
        + `les temps changent : ${changement.texte} → <b>${reponse}</b>.`;
      return P.fabriquer(P.tirerType({ choix: 0.7, ecrire: 0.15, vraifaux: 0.15 }), {
        phrase,
        reponse,
        choix: RM.melanger(choix),
        mauvais: choix.filter(f => f !== reponse),
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Rapporte les paroles au discours indirect',
        consigneEcrire: 'Écris le verbe au discours indirect',
        consigneVraiFaux: 'La concordance des temps est-elle respectée ?',
      });
    },
    titreLecon: 'Le discours indirect',
    lecon: `
      <p>Au <b>discours direct</b>, on cite les paroles entre guillemets : <i>Roxy a dit : « Je viendrai. »</i><br>
         Au <b>discours indirect</b>, on les rapporte dans une phrase : <i>Roxy a dit qu’elle <b>viendrait</b>.</i></p>
      <h4>🌟 Quand le verbe qui introduit est au passé, les temps changent</h4>
      <table>
        <tr><th>discours direct</th><th>discours indirect</th></tr>
        <tr><td>présent : « Je <b>suis</b> fatiguée. »</td><td>imparfait : elle a dit qu’elle <b>était</b> fatiguée</td></tr>
        <tr><td>futur : « Je <b>viendrai</b>. »</td><td>conditionnel présent : qu’elle <b>viendrait</b></td></tr>
        <tr><td>passé composé : « J’<b>ai gagné</b>. »</td><td>plus-que-parfait : qu’elle <b>avait gagné</b></td></tr>
      </table>
      <div class="astuce">💡 Les pronoms changent aussi : « je » devient « il » ou « elle », « vous » peut devenir « nous »…
        et « demain » devient « le lendemain » !</div>
    `,
  });

  // ======================================================================
  // 5. Reconnaître un temps
  // ======================================================================
  const TEMPS_A_RECONNAITRE = [
    { nom: 'présent', simple: 'present', regle: 'un seul mot, avec les terminaisons du présent' },
    { nom: 'imparfait', simple: 'imparfait', regle: 'un seul mot, avec -ais, -ait, -ions, -iez, -aient' },
    { nom: 'futur simple', simple: 'futur', regle: 'un seul mot : l’infinitif (ou un radical spécial) + -ai, -as, -a, -ons, -ez, -ont' },
    { nom: 'passé simple', simple: 'passeSimple', regle: 'un seul mot, le temps du récit : -ai, -a, -èrent ; -is, -it, -irent ; -us, -ut, -urent…' },
    { nom: 'conditionnel présent', simple: 'conditionnel', regle: 'un seul mot : le radical du futur + les terminaisons de l’imparfait' },
    { nom: 'subjonctif présent', simple: 'subjonctif', que: true, regle: 'un seul mot, après « que » : -e, -es, -e, -ions, -iez, -ent' },
    { nom: 'passé composé', aux: 'present', auxNom: 'au présent' },
    { nom: 'plus-que-parfait', aux: 'imparfait', auxNom: 'à l’imparfait' },
    { nom: 'futur antérieur', aux: 'futur', auxNom: 'au futur' },
    { nom: 'passé antérieur', aux: 'passeSimple', auxNom: 'au passé simple' },
    { nom: 'conditionnel passé', aux: 'conditionnel', auxNom: 'au conditionnel présent' },
    { nom: 'subjonctif passé', aux: 'subjonctif', auxNom: 'au subjonctif présent', que: true },
  ];
  // Chaque temps simple a son « cousin » composé (même temps pour l'auxiliaire)
  const COUSIN = {
    present: 'passé composé', imparfait: 'plus-que-parfait', futur: 'futur antérieur', passeSimple: 'passé antérieur',
    conditionnel: 'conditionnel passé', subjonctif: 'subjonctif passé',
  };
  const AVEC_ARTICLE = {
    present: 'le présent', imparfait: 'l’imparfait', futur: 'le futur simple', passeSimple: 'le passé simple',
    conditionnel: 'le conditionnel présent', subjonctif: 'le subjonctif présent',
  };
  const VERBES_A_RECONNAITRE = ['chanter', 'finir', 'faire', 'prendre', 'venir', 'aller', 'être', 'avoir', 'voir',
    'dire', 'partir', 'pouvoir', 'manger', 'choisir'];

  // La forme verbale seule (sans pronom ni « que »), ex. « aurions chanté »
  function formeSeule(temps, verbe, p) {
    return temps.simple
      ? verbe[temps.simple][p]
      : `${auxiliaireDe(verbe)[temps.aux][p]} ${avecEtre(verbe) ? accorder(verbe.participe, sujetSimple(p)) : verbe.participe}`;
  }

  function afficherForme(temps, verbe, p) {
    const s = sujetSimple(p);
    return (temps.que ? que(s.pronom) : '') + avecPronom(s.pronom, formeSeule(temps, verbe, p));
  }

  function questionReconnaitre() {
    for (;;) {
      const verbe = V(RM.hasard(VERBES_A_RECONNAITRE));
      const p = Math.floor(Math.random() * 6);
      const temps = RM.hasard(TEMPS_A_RECONNAITRE);
      // Pas de forme qui existe à deux temps (« tu dis » : présent ET passé simple ;
      // « nous chantions » : imparfait ET subjonctif présent) : il y aurait deux bonnes réponses
      const forme = formeSeule(temps, verbe, p);
      if (TEMPS_A_RECONNAITRE.some(t => t !== temps && formeSeule(t, verbe, p) === forme)) continue;
      const affiche = afficherForme(temps, verbe, p);
      // Les « cousins » font de bons pièges : même forme d'auxiliaire, simple ou composé
      const cousin = temps.simple ? COUSIN[temps.simple]
        : TEMPS_A_RECONNAITRE.find(t => t.simple === temps.aux).nom;
      const memeSorte = TEMPS_A_RECONNAITRE.filter(t => t !== temps && t.nom !== cousin && !t.simple === !temps.simple);
      const pieges = [cousin, ...RM.melanger(memeSorte).slice(0, 2).map(t => t.nom)];
      const explication = temps.simple
        ? `« ${affiche} » : ${temps.regle} → <b>${temps.nom}</b>.`
        : `« ${affiche} » : l’auxiliaire <b>${nomAuxiliaire(verbe)}</b> ${temps.auxNom} + le participe passé `
          + `→ <b>${temps.nom}</b> (le temps composé qui va avec ${AVEC_ARTICLE[temps.aux]}).`;
      return {
        type: 'choix',
        consigne: 'À quel temps est ce verbe ?',
        enonce: `<span class="forme-a-reconnaitre">« ${affiche} »</span> <span class="indice">(${verbe.infinitif})</span>`,
        choix: RM.melanger([temps.nom, ...pieges]),
        reponse: temps.nom,
        solution: `« ${affiche} » : <b>${temps.nom}</b>`,
        explication,
      };
    }
  }

  RM.etapes.push({
    id: '3e-conjugaison-reconnaitre-temps',
    creerQuestions(nombre) {
      const questions = [];
      const vues = new Set();
      let essais = 0;
      while (questions.length < nombre) {
        const q = questionReconnaitre();
        if (vues.has(q.solution) && essais++ < 500) continue;
        vues.add(q.solution);
        questions.push(q);
      }
      return questions;
    },
    titreLecon: 'Reconnaître un temps',
    lecon: `
      <h4>1. Un mot ou deux ?</h4>
      <p>Un seul mot → un <b>temps simple</b> (je chante). Deux mots, auxiliaire + participe passé → un <b>temps composé</b> (j’ai chanté).</p>
      <h4>2. Les temps simples</h4>
      <table>
        <tr><td>présent</td><td>je chante, je finis</td></tr>
        <tr><td>imparfait</td><td>je chant<b>ais</b>, nous chant<b>ions</b></td></tr>
        <tr><td>futur simple</td><td>je chanter<b>ai</b>, il fer<b>a</b></td></tr>
        <tr><td>passé simple</td><td>il chant<b>a</b>, ils fin<b>irent</b>, il f<b>ut</b></td></tr>
        <tr><td>conditionnel présent</td><td>je chanter<b>ais</b>, nous fer<b>ions</b></td></tr>
        <tr><td>subjonctif présent</td><td>que je chante, que je fasse</td></tr>
      </table>
      <h4>3. Les temps composés : regarde le temps de l’auxiliaire !</h4>
      <table>
        <tr><th>auxiliaire au…</th><th>temps composé</th><th>exemple</th></tr>
        <tr><td>présent</td><td>passé composé</td><td>j’<b>ai</b> chanté</td></tr>
        <tr><td>imparfait</td><td>plus-que-parfait</td><td>j’<b>avais</b> chanté</td></tr>
        <tr><td>futur</td><td>futur antérieur</td><td>j’<b>aurai</b> chanté</td></tr>
        <tr><td>passé simple</td><td>passé antérieur</td><td>j’<b>eus</b> chanté</td></tr>
        <tr><td>conditionnel</td><td>conditionnel passé</td><td>j’<b>aurais</b> chanté</td></tr>
        <tr><td>subjonctif</td><td>subjonctif passé</td><td>que j’<b>aie</b> chanté</td></tr>
      </table>
    `,
  });

  // ======================================================================
  // 6. La grande révision : tous les temps, en désordre
  // ======================================================================
  const ETAPES_A_REVISER = [
    'conjugaison-present-1', 'conjugaison-present-2', 'conjugaison-imparfait', 'conjugaison-futur',
    'conjugaison-passe-compose-avoir', 'conjugaison-passe-compose-etre', 'conjugaison-plus-que-parfait',
    'conjugaison-imperatif', '5e-conjugaison-passe-simple', '5e-conjugaison-futur-anterieur',
    '5e-conjugaison-conditionnel', '5e-conjugaison-subjonctif', '4e-conjugaison-conditionnel-passe',
    '4e-conjugaison-subjonctif-passe', '3e-conjugaison-passe-anterieur',
  ];

  RM.etapes.push({
    id: '3e-conjugaison-grande-revision',
    creerQuestions(nombre) {
      const questions = [];
      const vues = new Set();
      let essais = 0;
      while (questions.length < nombre) {
        const id = RM.hasard(ETAPES_A_REVISER);
        const etape = RM.etapes.find(e => e.id === id);
        const q = etape.creerQuestions(1)[0];
        if (vues.has(q.solution) && essais++ < 500) continue;
        vues.add(q.solution);
        questions.push(q);
      }
      return questions;
    },
    titreLecon: 'La grande révision',
    lecon: `
      <p>Dans cette étape, tous les temps sont mélangés : lis bien la consigne, elle te dit quel temps utiliser !</p>
      <table>
        <tr><th>temps</th><th>avec chanter</th><th>avec partir</th></tr>
        <tr><td>présent</td><td>je chante</td><td>je pars</td></tr>
        <tr><td>imparfait</td><td>je chantais</td><td>je partais</td></tr>
        <tr><td>futur</td><td>je chanterai</td><td>je partirai</td></tr>
        <tr><td>passé simple</td><td>je chantai</td><td>je partis</td></tr>
        <tr><td>conditionnel présent</td><td>je chanterais</td><td>je partirais</td></tr>
        <tr><td>subjonctif présent</td><td>que je chante</td><td>que je parte</td></tr>
        <tr><td>impératif</td><td>chante !</td><td>pars !</td></tr>
        <tr><td>passé composé</td><td>j’ai chanté</td><td>je suis parti(e)</td></tr>
        <tr><td>plus-que-parfait</td><td>j’avais chanté</td><td>j’étais parti(e)</td></tr>
        <tr><td>futur antérieur</td><td>j’aurai chanté</td><td>je serai parti(e)</td></tr>
        <tr><td>passé antérieur</td><td>j’eus chanté</td><td>je fus parti(e)</td></tr>
        <tr><td>conditionnel passé</td><td>j’aurais chanté</td><td>je serais parti(e)</td></tr>
        <tr><td>subjonctif passé</td><td>que j’aie chanté</td><td>que je sois parti(e)</td></tr>
      </table>
      <div class="astuce">💡 Le bouton Aide de chaque niveau garde sa leçon détaillée : n’hésite pas à rejouer une étape !</div>
    `,
  });
})();
