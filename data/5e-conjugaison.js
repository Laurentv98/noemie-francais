// Renard Malin — Conjugaison, niveau 5e : les 6 étapes du Sentier d'automne
//
// Les étapes « à verbes » utilisent le moteur js/moteur-conjugaison.js ;
// les étapes « à phrases » (choisir le bon temps selon le sens) utilisent js/moteur-phrases.js.

(function () {
  const { PRONOMS_REGLE, avecPronom, que, accorder, expliquerAccord, avecEtre, tempsCompose,
    astuceParticipe, nomAuxiliaire, auxiliaireDe, piegesCompose, ajouterEtape } = RM.conj;
  const P = RM.phrases;
  const V = RM.verbe;

  // ======================================================================
  // 1. Le passé simple, à toutes les personnes
  // ======================================================================
  // La « famille » d'un verbe irrégulier au passé simple : je fis (-is), je fus (-us), je vins (-ins)
  function familleIrreguliere(verbe) {
    const je = verbe.passeSimple[0];
    if (je.endsWith('ins')) return '-ins, -ins, -int, -înmes, -întes, -inrent';
    if (je.endsWith('us')) return '-us, -us, -ut, -ûmes, -ûtes, -urent';
    return '-is, -is, -it, -îmes, -îtes, -irent';
  }

  ajouterEtape({
    id: '5e-conjugaison-passe-simple',
    temps: 'au passé simple',
    verbes: [['être', 2], ['avoir', 2], 'chanter', 'jouer', 'parler', 'marcher', 'regarder', 'manger',
      'commencer', 'arriver', 'trouver', 'finir', 'choisir', 'grandir', 'réussir', 'aller', 'faire',
      'dire', 'prendre', 'venir', 'voir', 'pouvoir', 'vouloir', 'savoir'],
    conjuguer: (verbe, s) => verbe.passeSimple[s.p],
    expliquer(verbe, s) {
      const p = s.p;
      const accent = p === 3 || p === 4 ? ' N’oublie pas l’<b>accent circonflexe</b> avec nous et vous !' : '';
      if (verbe.groupe === 'premier' || verbe.infinitif === 'aller') {
        const groupe = verbe.infinitif === 'aller'
          ? 'Au passé simple, « aller » se conjugue comme les verbes du 1er groupe'
          : `« ${verbe.infinitif} » est un verbe du 1er groupe`;
        let texte = `${groupe} : -ai, -as, -a, -âmes, -âtes, -èrent. `
          + `Avec « ${PRONOMS_REGLE[p]} », c’est <b>-${RM.FINS.passeSimple1[p]}</b>.` + accent;
        if (p === 0) texte += ' Attention : « je chantai » (passé simple) n’a pas de s, alors que « je chantais » (imparfait) en a un !';
        if (verbe.infinitif.endsWith('ger') && p !== 5) texte += ' On garde le e devant le a : il mangea, nous mangeâmes.';
        if (verbe.infinitif.endsWith('cer') && p !== 5) texte += ' Le c prend une cédille devant le a : il commença, nous commençâmes.';
        return texte;
      }
      if (verbe.groupe === 'deuxieme') {
        return `Les verbes comme finir font -is, -is, -it, -îmes, -îtes, -irent. Avec « ${PRONOMS_REGLE[p]} », `
          + `c’est <b>-${RM.FINS.passeSimple2[p]}</b>.` + accent;
      }
      return `« ${verbe.infinitif} » est irrégulier : son passé simple suit la famille <b>${familleIrreguliere(verbe)}</b> `
        + `(${avecPronom('je', verbe.passeSimple[0])}, nous ${verbe.passeSimple[3]}).` + accent;
    },
    distracteurs: (verbe, s) => [...verbe.passeSimple, verbe.imparfait[s.p], verbe.present[s.p]],
    titreLecon: 'Le passé simple',
    lecon: `
      <p>Le passé simple est le temps des <b>récits</b> : il raconte les actions rapides, qui font avancer l’histoire.
        En 5e, on l’apprend à <b>toutes les personnes</b>.</p>
      <table>
        <tr><th></th><th>chanter</th><th>finir</th><th>faire</th><th>être</th><th>venir</th></tr>
        <tr><td>je</td><td>chant<span class="terminaison">ai</span></td><td>fin<span class="terminaison">is</span></td><td>f<span class="terminaison">is</span></td><td>f<span class="terminaison">us</span></td><td>v<span class="terminaison">ins</span></td></tr>
        <tr><td>tu</td><td>chant<span class="terminaison">as</span></td><td>fin<span class="terminaison">is</span></td><td>f<span class="terminaison">is</span></td><td>f<span class="terminaison">us</span></td><td>v<span class="terminaison">ins</span></td></tr>
        <tr><td>il</td><td>chant<span class="terminaison">a</span></td><td>fin<span class="terminaison">it</span></td><td>f<span class="terminaison">it</span></td><td>f<span class="terminaison">ut</span></td><td>v<span class="terminaison">int</span></td></tr>
        <tr><td>nous</td><td>chant<span class="terminaison">âmes</span></td><td>fin<span class="terminaison">îmes</span></td><td>f<span class="terminaison">îmes</span></td><td>f<span class="terminaison">ûmes</span></td><td>v<span class="terminaison">înmes</span></td></tr>
        <tr><td>vous</td><td>chant<span class="terminaison">âtes</span></td><td>fin<span class="terminaison">îtes</span></td><td>f<span class="terminaison">îtes</span></td><td>f<span class="terminaison">ûtes</span></td><td>v<span class="terminaison">întes</span></td></tr>
        <tr><td>ils</td><td>chant<span class="terminaison">èrent</span></td><td>fin<span class="terminaison">irent</span></td><td>f<span class="terminaison">irent</span></td><td>f<span class="terminaison">urent</span></td><td>v<span class="terminaison">inrent</span></td></tr>
      </table>
      <div class="astuce">💡 Il y a <b>4 familles</b> : en <b>-a</b> (tous les verbes en -er, et aller),
        en <b>-i</b> (finir, faire, dire, prendre, voir…), en <b>-u</b> (être, avoir, pouvoir, vouloir, savoir…)
        et en <b>-in</b> (venir, tenir).</div>
      <div class="astuce">💡 Avec <b>nous</b> et <b>vous</b>, toujours un <b>accent circonflexe</b> : nous chantâmes, vous fîtes, nous fûmes.</div>
      <p>⚠️ je chant<b>ai</b> (passé simple) ≠ je chant<b>ais</b> (imparfait)</p>
    `,
  });

  // ======================================================================
  // 2. Imparfait ou passé simple ? (on choisit selon le sens)
  // ======================================================================
  // [phrase, verbe, personne (0 = je … 5 = ils), temps attendu, l'indice dans la phrase]
  const IMPARFAIT_OU_PASSE_SIMPLE = [
    ['Chaque matin, Roxy ___ au bord de la rivière.', 'marcher', 2, 'imparfait', 'chaque matin'],
    ['Autrefois, des renards ___ dans cette forêt.', 'habiter', 5, 'imparfait', 'autrefois'],
    ['Le soleil ___ et les oiseaux chantaient.', 'briller', 2, 'imparfait', 'c’est la description du décor'],
    ['Tous les soirs, grand-mère ___ une berceuse.', 'chanter', 2, 'imparfait', 'tous les soirs'],
    ['Il ___ beau et les enfants jouaient dehors.', 'faire', 2, 'imparfait', 'c’est la description du décor'],
    ['Quand j’étais petite, je ___ souvent à la plage.', 'jouer', 0, 'imparfait', 'souvent'],
    ['Le vieux château ___ immense et sombre.', 'être', 2, 'imparfait', 'c’est la description du château'],
    ['D’habitude, les enfants ___ leurs devoirs après le goûter.', 'finir', 5, 'imparfait', 'd’habitude'],
    ['Chaque soir, Roxy ___ les étoiles.', 'regarder', 2, 'imparfait', 'chaque soir'],
    ['La nuit ___ calme, et tout le monde dormait.', 'être', 2, 'imparfait', 'c’est la description de la nuit'],
    ['Le dimanche, nous ___ toujours au marché.', 'aller', 3, 'imparfait', 'le dimanche, toujours'],
    ['Le petit renard ___ toujours faim.', 'avoir', 2, 'imparfait', 'toujours'],
    ['Soudain, Roxy ___ dans la rivière.', 'sauter', 2, 'passeSimple', 'soudain'],
    ['Tout à coup, un loup ___ dans la clairière.', 'arriver', 2, 'passeSimple', 'tout à coup'],
    ['Un jour, le prince ___ un trésor.', 'trouver', 2, 'passeSimple', 'un jour'],
    ['Le lendemain, ils ___ très tôt.', 'partir', 5, 'passeSimple', 'le lendemain'],
    ['À cet instant, le vase ___ par terre.', 'tomber', 2, 'passeSimple', 'à cet instant'],
    ['Brusquement, les enfants ___ de la classe.', 'sortir', 5, 'passeSimple', 'brusquement'],
    ['Ce matin-là, Roxy ___ une grande décision et partit.', 'prendre', 2, 'passeSimple', 'une seule fois, ce matin-là'],
    ['Soudain, elle ___ un cri.', 'pousser', 2, 'passeSimple', 'soudain'],
    ['Alors le roi se leva et ___ : « Entrez ! »', 'dire', 2, 'passeSimple', 'une action qui fait avancer l’histoire'],
    ['Un matin, je ___ un petit renard dans le jardin.', 'voir', 0, 'passeSimple', 'un matin'],
    ['Enfin, les invités ___.', 'arriver', 5, 'passeSimple', 'enfin'],
    ['Tout à coup, nous ___ une ombre derrière la porte.', 'voir', 3, 'passeSimple', 'tout à coup'],
  ];

  P.ajouterEtape({
    id: '5e-conjugaison-imparfait-ou-passe-simple',
    banque: IMPARFAIT_OU_PASSE_SIMPLE,
    creerQuestion([phrase, infinitif, p, temps, indiceSens]) {
      const verbe = V(infinitif);
      const reponse = verbe[temps][p];
      const explication = temps === 'imparfait'
        ? `Ici, l’action <b>dure</b> ou se <b>répète</b> : c’est le décor ou une habitude (${indiceSens}). `
          + `On utilise l’<b>imparfait</b> : ${reponse}.`
        : `Ici, l’action est <b>soudaine</b> ou arrive <b>une seule fois</b>, et elle fait avancer l’histoire (${indiceSens}). `
          + `On utilise le <b>passé simple</b> : ${reponse}.`;
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: [verbe.imparfait[p], verbe.passeSimple[p]],
        mauvais: [temps === 'imparfait' ? verbe.passeSimple[p] : verbe.imparfait[p]],
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Imparfait ou passé simple ?',
        consigneEcrire: 'Écris le verbe à l’imparfait ou au passé simple',
      });
    },
    titreLecon: 'Imparfait ou passé simple ?',
    lecon: `
      <p>Dans un récit au passé, les deux temps travaillent ensemble :</p>
      <h4>L’imparfait : le décor</h4>
      <p>Il décrit ce qui <b>dure</b> ou ce qui se <b>répète</b> : le décor, les personnages, les habitudes.</p>
      <p>👉 <i>Le soleil <b>brillait</b>. Chaque matin, Roxy <b>marchait</b> au bord de la rivière.</i></p>
      <h4>Le passé simple : l’action</h4>
      <p>Il raconte les actions <b>soudaines</b>, qui arrivent <b>une fois</b> et font avancer l’histoire.</p>
      <p>👉 <i>Soudain, Roxy <b>sauta</b> dans la rivière.</i></p>
      <div class="astuce">💡 <b>Les mots qui aident :</b><br>
        imparfait → chaque matin, tous les soirs, souvent, toujours, d’habitude, autrefois…<br>
        passé simple → soudain, tout à coup, un jour, le lendemain, brusquement, enfin, à cet instant…</div>
    `,
  });

  // ======================================================================
  // 3. Le futur antérieur
  // ======================================================================
  ajouterEtape({
    id: '5e-conjugaison-futur-anterieur',
    temps: 'au futur antérieur',
    partEcrire: 0.5,
    verbes: ['chanter', 'manger', 'finir', 'choisir', 'faire', 'dire', 'prendre', 'voir', 'écrire', 'lire',
      'mettre', 'aller', 'venir', 'partir', 'arriver', 'rentrer', 'sortir'],
    ...tempsCompose('futur'),
    expliquer(verbe, s) {
      const aux = auxiliaireDe(verbe);
      const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
      return `Le futur antérieur = l’auxiliaire <b>${nomAuxiliaire(verbe)}</b> au <b>futur</b> (${aux.futur[s.p]}) `
        + `+ le participe passé <b>${verbe.participe}</b>. Il montre une action qui sera <b>terminée</b> avant une autre.`
        + (avecEtre(verbe) ? expliquerAccord(s, participe) : ' ' + astuceParticipe(verbe));
    },
    distracteurs: (verbe, s) => piegesCompose(verbe, s, 'futur', ['present', 'conditionnel']),
    titreLecon: 'Le futur antérieur',
    lecon: `
      <p>Le futur antérieur montre une action qui sera <b>terminée avant</b> une autre action future :
        <i>Quand tu <b>auras fini</b> tes devoirs, tu pourras jouer.</i></p>
      <p>C’est un temps composé : l’auxiliaire <b>avoir</b> ou <b>être</b> au <b>futur</b> + le participe passé.</p>
      <table>
        <tr><th>avec avoir</th><th>avec être</th></tr>
        <tr><td>j’<b>aurai</b> fini</td><td>je <b>serai</b> parti(e)</td></tr>
        <tr><td>tu <b>auras</b> fini</td><td>tu <b>seras</b> parti(e)</td></tr>
        <tr><td>il <b>aura</b> fini</td><td>elle <b>sera</b> partie</td></tr>
        <tr><td>nous <b>aurons</b> fini</td><td>nous <b>serons</b> parti(e)s</td></tr>
        <tr><td>vous <b>aurez</b> fini</td><td>vous <b>serez</b> parti(e)s</td></tr>
        <tr><td>ils <b>auront</b> fini</td><td>elles <b>seront</b> parties</td></tr>
      </table>
      <div class="astuce">💡 j’<b>aurai</b> fini (futur antérieur) ≠ j’<b>aurais</b> fini (conditionnel passé).
        Avec être, on accorde toujours le participe : <i>elle sera parti<b>e</b></i>.</div>
    `,
  });

  // ======================================================================
  // 4. Le conditionnel présent
  // ======================================================================
  ajouterEtape({
    id: '5e-conjugaison-conditionnel',
    temps: 'au conditionnel présent',
    verbes: [['être', 2], ['avoir', 2], 'chanter', 'jouer', 'aimer', 'manger', 'finir', 'choisir',
      ['aller', 2], ['faire', 2], 'dire', 'prendre', 'venir', 'voir', 'pouvoir', 'vouloir', 'savoir'],
    conjuguer: (verbe, s) => verbe.conditionnel[s.p],
    expliquer(verbe, s, forme) {
      const radical = verbe.futur[0].slice(0, -2);
      const special = verbe.groupe === 'premier' || verbe.groupe === 'deuxieme' ? '' : ', un radical spécial';
      let texte = `Le conditionnel présent = le radical du <b>futur</b> (${radical}-${special}) `
        + `+ les terminaisons de l’<b>imparfait</b> (-ais, -ais, -ait, -ions, -iez, -aient). `
        + `Avec « ${PRONOMS_REGLE[s.p]} » : <b>${forme}</b>.`;
      if (s.p === 0) texte += ` Ne confonds pas : ${avecPronom('je', verbe.futur[0])} (futur) ≠ ${avecPronom('je', forme)} (conditionnel).`;
      return texte;
    },
    distracteurs: (verbe, s) => [...verbe.conditionnel, verbe.futur[s.p], verbe.imparfait[s.p]],
    titreLecon: 'Le conditionnel présent',
    lecon: `
      <p>Le conditionnel présent exprime ce qui est <b>imaginé</b>, <b>souhaité</b> ou <b>poli</b> :
        <i>Si j’avais des ailes, je <b>volerais</b>. Je <b>voudrais</b> un chocolat, s’il te plaît.</i></p>
      <h4>🌟 Radical du futur + terminaisons de l’imparfait</h4>
      <table>
        <tr><td>je chanter<span class="terminaison">ais</span></td><td>nous chanter<span class="terminaison">ions</span></td></tr>
        <tr><td>tu chanter<span class="terminaison">ais</span></td><td>vous chanter<span class="terminaison">iez</span></td></tr>
        <tr><td>il chanter<span class="terminaison">ait</span></td><td>ils chanter<span class="terminaison">aient</span></td></tr>
      </table>
      <div class="astuce">💡 Les verbes qui ont un radical spécial au futur le gardent au conditionnel :
        je <b>ser</b>ais, j’<b>aur</b>ais, j’<b>ir</b>ais, je <b>fer</b>ais, je <b>pourr</b>ais, je <b>verr</b>ais,
        je <b>voudr</b>ais, je <b>viendr</b>ais, je <b>saur</b>ais.</div>
      <p>⚠️ je chanter<b>ai</b> (futur) ≠ je chanter<b>ais</b> (conditionnel)</p>
    `,
  });

  // ======================================================================
  // 5. Futur ou conditionnel ? (-rai ou -rais)
  // ======================================================================
  const FUTUR_OU_CONDITIONNEL = [
    ['Demain, je ___ mes grands-parents.', 'voir', 0, 'futur', 'demain'],
    ['L’année prochaine, j’___ en 4e.', 'aller', 0, 'futur', 'l’année prochaine'],
    ['Ce soir, je ___ mes devoirs avant le dîner.', 'finir', 0, 'futur', 'ce soir'],
    ['Quand je serai grande, je ___ vétérinaire.', 'être', 0, 'futur', 'quand je serai grande'],
    ['La semaine prochaine, je ___ un gâteau.', 'faire', 0, 'futur', 'la semaine prochaine'],
    ['Promis, je ___ ma chambre demain !', 'ranger', 0, 'futur', 'promis… demain'],
    ['Dans deux jours, nous ___ en vacances.', 'partir', 3, 'futur', 'dans deux jours'],
    ['Samedi, j’___ à la plage avec Hinano.', 'aller', 0, 'futur', 'samedi'],
    ['Demain, il ___ beau.', 'faire', 2, 'futur', 'demain'],
    ['Je ___ demain si j’ai réussi mon contrôle.', 'savoir', 0, 'futur', 'demain'],
    ['Tout à l’heure, je ___ avec toi.', 'jouer', 0, 'futur', 'tout à l’heure'],
    ['Quand tu viendras, nous ___ ensemble.', 'chanter', 3, 'futur', 'quand tu viendras'],
    ['Si j’avais des ailes, je ___ jusqu’à la lune.', 'voler', 0, 'conditionnel', 'si j’avais'],
    ['Je ___ un chocolat chaud, s’il te plaît.', 'vouloir', 0, 'conditionnel', 'une demande polie'],
    ['Si j’étais une renarde, j’___ dans la forêt.', 'habiter', 0, 'conditionnel', 'si j’étais'],
    ['Si tu le voulais, tu ___ gagner.', 'pouvoir', 1, 'conditionnel', 'si tu le voulais'],
    ['Si nous avions le temps, nous ___ au cinéma.', 'aller', 3, 'conditionnel', 'si nous avions'],
    ['À ta place, je ___ la vérité.', 'dire', 0, 'conditionnel', 'à ta place'],
    ['J’___ tellement voir la neige !', 'aimer', 0, 'conditionnel', 'un souhait'],
    ['S’il faisait beau, nous ___ dehors.', 'jouer', 3, 'conditionnel', 's’il faisait beau'],
    ['Si je pouvais, j’___ un chien.', 'avoir', 0, 'conditionnel', 'si je pouvais'],
    ['Si tu travaillais davantage, tu ___.', 'réussir', 1, 'conditionnel', 'si tu travaillais'],
    ['Je ___ si heureuse si tu venais !', 'être', 0, 'conditionnel', 'si tu venais'],
    ['Si elle avait faim, elle ___ une pomme.', 'manger', 2, 'conditionnel', 'si elle avait faim'],
  ];

  P.ajouterEtape({
    id: '5e-conjugaison-futur-ou-conditionnel',
    banque: FUTUR_OU_CONDITIONNEL,
    creerQuestion([phrase, infinitif, p, temps, indiceSens]) {
      const verbe = V(infinitif);
      const reponse = verbe[temps][p];
      const astuce = ` Astuce : avec « il », on entend la différence : il ${verbe.futur[2]} (futur) / il ${verbe.conditionnel[2]} (conditionnel).`;
      const explication = (temps === 'futur'
        ? `Ici, l’action est <b>sûre</b> : elle aura lieu (${indiceSens}). On utilise le <b>futur</b> : ${reponse}.`
        : `Ici, c’est <b>imaginé</b>, une <b>condition</b>, un souhait ou une demande polie (${indiceSens}). `
          + `On utilise le <b>conditionnel</b> : ${reponse}.`) + astuce;
      return P.fabriquer(P.tirerType({ choix: 0.6, ecrire: 0.2, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: [verbe.futur[p], verbe.conditionnel[p]],
        mauvais: [temps === 'futur' ? verbe.conditionnel[p] : verbe.futur[p]],
        explication,
        aide: P.indice(infinitif),
        consigneChoix: 'Futur ou conditionnel ?',
        consigneEcrire: 'Écris le verbe au futur ou au conditionnel',
      });
    },
    titreLecon: 'Futur ou conditionnel ?',
    lecon: `
      <p>Avec <b>je</b>, le futur et le conditionnel se prononcent presque pareil… mais ne s’écrivent pas pareil !</p>
      <h4>Futur : -rai (c’est sûr)</h4>
      <p>👉 <i>Demain, je chanter<b>ai</b>.</i> L’action aura lieu.</p>
      <h4>Conditionnel : -rais (c’est imaginé)</h4>
      <p>👉 <i>Si j’avais une guitare, je chanter<b>ais</b>.</i> C’est une condition, un souhait ou une demande polie.</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace « je » par « il », et écoute !<br>
        Demain, je chanter… → demain, <u>il chantera</u> → futur → je chanter<b>ai</b>.<br>
        Si j’avais une guitare, je chanter… → s’il avait une guitare, <u>il chanterait</u> → conditionnel → je chanter<b>ais</b>.</div>
      <p>⚠️ Après « si » + imparfait, on met le conditionnel : <i>Si j’avais faim, je mangerais.</i></p>
    `,
  });

  // ======================================================================
  // 6. Le subjonctif présent
  // ======================================================================
  // Régulier = les 6 personnes suivent la règle (venir ne l'est pas : que je vienne, mais que nous venions)
  const subjonctifRegulier = verbe => verbe.subjonctif
    .every((forme, i) => forme === verbe.present[5].slice(0, -3) + RM.FINS.subjonctif[i]);

  ajouterEtape({
    id: '5e-conjugaison-subjonctif',
    temps: 'au subjonctif présent',
    que: true,
    verbes: [['être', 2], ['avoir', 2], 'chanter', 'parler', 'manger', 'finir', 'choisir', ['faire', 2],
      ['aller', 2], 'pouvoir', 'savoir', 'vouloir', 'venir', 'prendre', 'dire', 'voir', 'partir'],
    conjuguer: (verbe, s) => verbe.subjonctif[s.p],
    expliquer(verbe, s, forme) {
      let texte;
      if (subjonctifRegulier(verbe)) {
        const radical = verbe.present[5].slice(0, -3);
        texte = `Au subjonctif présent, on prend le radical de « ils » au présent (ils ${verbe.present[5]} → ${radical}-) `
          + `et on ajoute -e, -es, -e, -ions, -iez, -ent : ${que(s.pronom)}${avecPronom(s.pronom, forme)}.`;
      } else {
        texte = `« ${verbe.infinitif} » a un subjonctif <b>irrégulier</b> : `
          + `${que('je')}${avecPronom('je', verbe.subjonctif[0])}, que nous ${verbe.subjonctif[3]}… à retenir !`;
      }
      if (/i(ons|ez)$/.test(forme)) texte += ' Avec nous et vous, pense au <b>i</b> : que nous …ions, que vous …iez.';
      return texte;
    },
    distracteurs: (verbe, s) => [...verbe.subjonctif, verbe.present[s.p], verbe.imparfait[s.p]],
    titreLecon: 'Le subjonctif présent',
    lecon: `
      <p>Le subjonctif s’emploie après « <b>que</b> », pour dire ce qu’on <b>veut</b>, ce qui est <b>nécessaire</b>,
        ce qu’on <b>souhaite</b> ou ce dont on <b>doute</b> : <i>Il faut que tu <b>viennes</b>. Je veux que tu <b>sois</b> là.</i></p>
      <h4>🌟 Les verbes réguliers</h4>
      <p>On prend le radical de « ils » au présent (ils <u>chant</u>ent, ils <u>finiss</u>ent) et on ajoute :</p>
      <table>
        <tr><td>que je chant<span class="terminaison">e</span></td><td>que nous chant<span class="terminaison">ions</span></td></tr>
        <tr><td>que tu chant<span class="terminaison">es</span></td><td>que vous chant<span class="terminaison">iez</span></td></tr>
        <tr><td>qu’il chant<span class="terminaison">e</span></td><td>qu’ils chant<span class="terminaison">ent</span></td></tr>
      </table>
      <h4>⭐ Les irréguliers à connaître</h4>
      <table>
        <tr><td>être → que je <b>sois</b>, que nous <b>soyons</b></td><td>avoir → que j’<b>aie</b>, que nous <b>ayons</b></td></tr>
        <tr><td>faire → que je <b>fasse</b></td><td>aller → que j’<b>aille</b>, que nous <b>allions</b></td></tr>
        <tr><td>pouvoir → que je <b>puisse</b></td><td>savoir → que je <b>sache</b></td></tr>
        <tr><td>vouloir → que je <b>veuille</b>, que nous <b>voulions</b></td><td>venir → que je <b>vienne</b>, que nous <b>venions</b></td></tr>
      </table>
      <div class="astuce">💡 Pour vérifier qu’un verbe est au subjonctif, remplace-le par « faire » :
        <i>il faut que tu <u>fasses</u></i> → subjonctif.</div>
    `,
  });
})();
