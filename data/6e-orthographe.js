// Renard Malin — Orthographe, niveau 6e : les 9 étapes de la Rivière
//
// Ici, les phrases sont écrites à la main. Pour en ajouter une, il suffit d'ajouter une ligne
// dans la bonne liste, avec ___ à la place du mot à trouver.
// Le moteur qui fabrique les questions est dans js/moteur-phrases.js.
// Le titre et la place de chaque étape sur la carte sont dans data/foret.js.

(function () {
  const {
    indice, CASES, GENRES, NOMBRES, tirerType, fabriquer, ajouterEtape, ajouterHomophones,
    accorderCas: accorder,
  } = RM.phrases;

  // ---------- 1. a ou à ----------
  ajouterHomophones({
    id: 'orthographe-a-ou-a',
    choix: ['a', 'à'],
    motTeste: 'a',
    test: 'avait',
    verdicts: {
      a: 'C’est le verbe <b>avoir</b>, donc on écrit <b>a</b> sans accent.',
      à: 'Ce n’est pas le verbe avoir, donc on écrit <b>à</b> avec un accent.',
    },
    phrases: {
      a: ['Roxy ___ un joli foulard rouge.', 'Mon frère ___ peur du noir.', 'Le renard ___ une longue queue touffue.',
        'Léa ___ mangé toute la tarte.', 'Mon chat ___ faim le matin.', 'Papa ___ oublié ses clés.',
        'La maîtresse ___ corrigé nos cahiers.', 'Ce livre ___ beaucoup d’images.', 'Tom ___ gagné la course.',
        'Elle ___ trouvé un trésor dans le jardin.', 'Mon amie ___ un chien très gentil.', 'Le bébé ___ souri à sa maman.',
        'On ___ bien travaillé aujourd’hui.', 'Ma sœur ___ dix ans.', 'Le boulanger ___ cuit du pain frais.',
        'Le renard ___ vu un lapin.', 'Maman ___ acheté des croissants.'],
      à: ['Je vais ___ l’école en bus.', 'Nous jouons ___ cache-cache.', 'Roxy habite ___ côté de la rivière.',
        'J’ai une tarte ___ la fraise.', 'Il pense ___ ses vacances.', 'Le cours commence ___ huit heures.',
        'Ma grand-mère habite ___ Paris.', 'Nous partons ___ la mer demain.', 'Elle parle ___ son amie.',
        'C’est une brosse ___ dents.', 'Il fait du vélo ___ la campagne.', 'Le renard dort ___ l’ombre d’un arbre.',
        'Je donne une carotte ___ mon lapin.', 'Mon cahier ___ spirale est bleu.', 'On se retrouve ___ la récré !',
        'Roxy apprend ___ lire.'],
    },
    titreLecon: 'a ou à ?',
    lecon: `
      <p><b>a</b> et <b>à</b> se prononcent pareil, mais ce ne sont pas du tout les mêmes mots !</p>
      <h4>a (sans accent)</h4>
      <p>C’est le verbe <b>avoir</b> : <i>il a, elle a, on a</i>.</p>
      <p>👉 <i>Roxy <b>a</b> un foulard.</i> &nbsp; 👉 <i>Tom <b>a</b> gagné.</i></p>
      <h4>à (avec un accent)</h4>
      <p>C’est un petit mot qui ne change jamais. Il indique un lieu, un moment, une façon de faire…</p>
      <p>👉 <i>Je vais <b>à</b> l’école.</i> &nbsp; 👉 <i>Rendez-vous <b>à</b> midi.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par <b>avait</b>.<br>
        ✔ Si la phrase a du sens, on écrit <b>a</b> : <i>Roxy <u>avait</u> un foulard.</i><br>
        ✘ Si ça ne veut rien dire, on écrit <b>à</b> : <i>Je vais <u>avait</u> l’école.</i></div>
    `,
  });

  // ---------- 2. et ou est ----------
  ajouterHomophones({
    id: 'orthographe-et-ou-est',
    choix: ['et', 'est'],
    motTeste: 'est',
    test: 'était',
    autreTest: 'et puis',
    verdicts: {
      est: 'C’est le verbe <b>être</b>, donc on écrit <b>est</b>.',
      et: 'C’est le petit mot qui <b>relie</b> deux choses, donc on écrit <b>et</b>.',
    },
    phrases: {
      est: ['Le ciel ___ tout bleu aujourd’hui.', 'Roxy ___ une renarde très curieuse.', 'Mon cartable ___ trop lourd.',
        'Ce gâteau ___ délicieux.', 'La porte ___ ouverte.', 'Mon frère ___ plus grand que moi.',
        'Le chat ___ caché sous le lit.', 'Cette histoire ___ vraiment drôle.', 'Ma trousse ___ dans mon sac.',
        'La maîtresse ___ contente de nous.', 'Le renard ___ très rusé.', 'Il ___ déjà huit heures.',
        'L’eau de la rivière ___ froide.', 'Ce vélo ___ tout neuf.'],
      et: ['J’ai un chat ___ un chien.', 'Léa ___ Tom jouent ensemble.', 'Roxy saute ___ danse de joie.',
        'Je prends du pain ___ du fromage.', 'Il pleut ___ il fait froid.', 'Mon sac est bleu ___ vert.',
        'Nous chantons ___ nous rions.', 'Prends ta veste ___ ton bonnet.', 'Le renard ___ le lapin sont amis.',
        'Elle ouvre la porte ___ elle sort.', 'J’aime les fraises ___ les cerises.', 'Papa ___ maman arrivent ce soir.',
        'Il mange ___ il boit.'],
    },
    titreLecon: 'et ou est ?',
    lecon: `
      <h4>est</h4>
      <p>C’est le verbe <b>être</b> : <i>il est, elle est</i>.</p>
      <p>👉 <i>Roxy <b>est</b> rusée.</i> &nbsp; 👉 <i>Le ciel <b>est</b> bleu.</i></p>
      <h4>et</h4>
      <p>C’est un petit mot qui <b>relie</b> deux mots ou deux idées.</p>
      <p>👉 <i>Un chat <b>et</b> un chien.</i> &nbsp; 👉 <i>Il pleut <b>et</b> il fait froid.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par <b>était</b>.<br>
        ✔ Si la phrase a du sens, on écrit <b>est</b> : <i>Roxy <u>était</u> rusée.</i><br>
        ✘ Sinon, on écrit <b>et</b>. On peut souvent dire « et puis » : <i>un chat <u>et puis</u> un chien.</i></div>
    `,
  });

  // ---------- 3. son ou sont ----------
  ajouterHomophones({
    id: 'orthographe-son-ou-sont',
    choix: ['son', 'sont'],
    motTeste: 'sont',
    test: 'étaient',
    autreTest: 'mon',
    verdicts: {
      sont: 'C’est le verbe <b>être</b> (ils sont), donc on écrit <b>sont</b>.',
      son: 'Ça veut dire « à lui » ou « à elle », donc on écrit <b>son</b>.',
    },
    phrases: {
      sont: ['Les enfants ___ dans la cour.', 'Mes amis ___ très gentils.', 'Les renards ___ des animaux rusés.',
        'Les fleurs ___ jolies au printemps.', 'Ils ___ partis en vacances.', 'Mes chaussures ___ trop petites.',
        'Les biscuits ___ dans la boîte.', 'Où ___ mes lunettes ?', 'Elles ___ arrivées en retard.',
        'Tes dessins ___ magnifiques.', 'Les feuilles ___ tombées.', 'Les élèves ___ très attentifs.',
        'Mes cousins ___ venus me voir.'],
      son: ['Léo range ___ cartable.', 'Roxy cherche ___ foulard.', 'Elle a perdu ___ crayon.',
        'Mon chat aime ___ panier.', 'Tom promène ___ chien.', 'Léa fête ___ anniversaire.',
        'Le bébé boit ___ biberon.', 'Il prend ___ vélo pour aller à l’école.', 'Papa met ___ pull.',
        'La maîtresse ouvre ___ livre.', 'Le renard retourne dans ___ terrier.', 'Julie téléphone à ___ oncle.',
        'Le chien mange dans ___ bol.'],
    },
    titreLecon: 'son ou sont ?',
    lecon: `
      <h4>sont</h4>
      <p>C’est le verbe <b>être</b> : <i>ils sont, elles sont</i>.</p>
      <p>👉 <i>Les renards <b>sont</b> rusés.</i></p>
      <h4>son</h4>
      <p>Il se place devant un nom et veut dire « <b>à lui</b> » ou « <b>à elle</b> ».</p>
      <p>👉 <i>Léo range <b>son</b> cartable</i> (le cartable de Léo).</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par <b>étaient</b>.<br>
        ✔ Si la phrase a du sens, on écrit <b>sont</b> : <i>Les renards <u>étaient</u> rusés.</i><br>
        ✘ Sinon, on écrit <b>son</b>. On peut dire « mon » : <i>Léo range <u>mon</u> cartable.</i></div>
    `,
  });

  // ---------- 4. on ou ont ----------
  ajouterHomophones({
    id: 'orthographe-on-ou-ont',
    choix: ['on', 'ont'],
    motTeste: 'ont',
    test: 'avaient',
    autreTest: 'il',
    verdicts: {
      ont: 'C’est le verbe <b>avoir</b> (ils ont), donc on écrit <b>ont</b>.',
      on: 'C’est le sujet du verbe, comme « il » : on écrit <b>on</b>.',
    },
    phrases: {
      ont: ['Les enfants ___ faim.', 'Mes voisins ___ un grand jardin.', 'Les renards ___ une queue touffue.',
        'Ils ___ gagné le match.', 'Elles ___ fini leurs devoirs.', 'Tes parents ___ une voiture rouge.',
        'Les élèves ___ bien travaillé.', 'Les oiseaux ___ construit un nid.', 'Mes amis ___ peur des araignées.',
        'Les chats ___ des moustaches.', 'Mes grands-parents ___ un chien.', 'Les filles ___ mangé des crêpes.',
        'Les pompiers ___ éteint le feu.'],
      on: ['Demain, ___ ira à la piscine.', 'Le soir, ___ regarde les étoiles.', 'À la récré, ___ joue au loup.',
        'Quand il pleut, ___ reste à la maison.', 'Chez moi, ___ mange à midi.', 'Si tu veux, ___ peut jouer au ballon.',
        'En hiver, ___ met un bonnet.', 'Dans la forêt, ___ entend les oiseaux.', 'Le dimanche, ___ fait des crêpes.',
        'Pendant les vacances, ___ se baigne.', 'Au cinéma, ___ ne parle pas.', 'Avec Roxy, ___ apprend en s’amusant.',
        'Le matin, ___ prend le bus.'],
    },
    titreLecon: 'on ou ont ?',
    lecon: `
      <h4>ont</h4>
      <p>C’est le verbe <b>avoir</b> : <i>ils ont, elles ont</i>.</p>
      <p>👉 <i>Les renards <b>ont</b> faim.</i></p>
      <h4>on</h4>
      <p>C’est un <b>pronom sujet</b>, comme il ou elle. Il veut dire « quelqu’un » ou « nous ».</p>
      <p>👉 <i>Demain, <b>on</b> ira à la piscine.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par <b>avaient</b>.<br>
        ✔ Si la phrase a du sens, on écrit <b>ont</b> : <i>Les renards <u>avaient</u> faim.</i><br>
        ✘ Sinon, on écrit <b>on</b>. On peut dire « il » : <i>Demain, <u>il</u> ira à la piscine.</i></div>
    `,
  });

  // ---------- 5. ou ou où ----------
  ajouterHomophones({
    id: 'orthographe-ou-ou-ou',
    choix: ['ou', 'où'],
    motTeste: 'ou',
    test: 'ou bien',
    verdicts: {
      ou: 'C’est un <b>choix</b> entre deux choses, donc on écrit <b>ou</b> sans accent.',
      où: 'On parle d’un <b>lieu</b> ou d’un <b>moment</b>, donc on écrit <b>où</b> avec un accent.',
    },
    phrases: {
      ou: ['Tu veux du jus ___ du lait ?', 'On joue au foot ___ au basket ?', 'Je mets ma robe bleue ___ ma robe verte.',
        'Il viendra lundi ___ mardi.', 'Tu préfères les chats ___ les chiens ?', 'Prends une pomme ___ une poire.',
        'On part à pied ___ à vélo ?', 'C’est vrai ___ c’est faux ?', 'Tu dessines ___ tu lis ?',
        'Je vais à la piscine ___ au parc.', 'Rouge ___ jaune, quelle couleur choisis-tu ?', 'Tu écris au crayon ___ au stylo ?',
        'C’est maintenant ___ jamais !'],
      où: ['Dis-moi ___ tu habites.', 'Je sais ___ se cache Roxy.', 'Voici la maison ___ je suis née.',
        'C’est le jour ___ je suis partie.', 'Le parc ___ nous jouons est grand.', 'Tu sais ___ sont mes clés ?',
        'La forêt ___ vit Roxy est magique.', 'Je ne sais pas ___ aller.', 'Montre-moi ___ tu as mal.',
        'Au moment ___ la cloche sonne, on sort.', 'Voilà l’école ___ va mon frère.', 'Il rêve du pays ___ il fait toujours chaud.',
        'Par ___ passe-t-on ?'],
    },
    titreLecon: 'ou ou où ?',
    lecon: `
      <h4>ou (sans accent)</h4>
      <p>Il indique un <b>choix</b> entre deux choses.</p>
      <p>👉 <i>Tu veux du jus <b>ou</b> du lait ?</i></p>
      <h4>où (avec un accent)</h4>
      <p>Il indique un <b>lieu</b> ou un <b>moment</b>.</p>
      <p>👉 <i>Dis-moi <b>où</b> tu habites.</i> &nbsp; 👉 <i>C’est le jour <b>où</b> je suis partie.</i></p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> remplace le mot par <b>ou bien</b>.<br>
        ✔ Si la phrase a du sens, on écrit <b>ou</b> : <i>du jus <u>ou bien</u> du lait ?</i><br>
        ✘ Sinon, c’est un lieu ou un moment : on écrit <b>où</b>.</div>
    `,
  });

  // ---------- 6. ces ou ses ----------
  // Ici, chaque phrase donne aussi le mot au singulier : c'est lui qui aide à choisir.
  ajouterHomophones({
    id: 'orthographe-ces-ou-ses',
    choix: ['ces', 'ses'],
    expliquer(phrase, reponse, singulier) {
      return reponse === 'ses'
        ? `Mets au singulier : on dirait « <b>${singulier}</b> ». Ça <b>appartient</b> à quelqu’un (à lui ou à elle), donc on écrit <b>ses</b>.`
        : `Mets au singulier : on dirait « <b>${singulier}</b> ». On <b>montre</b> quelque chose, donc on écrit <b>ces</b>.`;
    },
    phrases: {
      ses: [['Roxy lave ___ pattes.', 'sa patte'], ['Tom brosse ___ dents.', 'sa dent'],
        ['Le bébé tend ___ bras vers sa maman.', 'son bras'], ['Le renard protège ___ petits.', 'son petit'],
        ['Léa embrasse ___ grands-parents.', 'son grand-père'], ['Le chat lèche ___ moustaches.', 'sa moustache'],
        ['Julie invite ___ amies à son anniversaire.', 'son amie'], ['Papa cherche ___ clés partout.', 'sa clé'],
        ['Le chien enterre ___ os dans le jardin.', 'son os'], ['Grand-père arrose ___ tomates.', 'sa tomate'],
        ['Mon frère met ___ chaussettes.', 'sa chaussette'], ['Chaque matin, Zoé coiffe ___ cheveux.', 'son cheveu'],
        ['Le petit garçon a perdu ___ dents de lait.', 'sa dent de lait']],
      ces: [['Regarde ___ nuages !', 'ce nuage'], ['Tu vois ___ oiseaux, là-bas ?', 'cet oiseau'],
        ['Je voudrais ___ bonbons-là, s’il vous plaît.', 'ce bonbon-là'], ['Écoute ___ grenouilles qui chantent !', 'cette grenouille'],
        ['Comme ___ fleurs sentent bon !', 'cette fleur'], ['Ne touche pas ___ champignons, ils sont dangereux !', 'ce champignon'],
        ['Tu as vu ___ éclairs ? Il y a de l’orage.', 'cet éclair'], ['Combien coûtent ___ baskets ?', 'cette basket'],
        ['Qui a laissé ___ miettes sur la table ?', 'cette miette'], ['À qui sont ___ gants ?', 'ce gant'],
        ['Je ne connais pas ___ enfants-là.', 'cet enfant-là'], ['Oh ! Admire ___ papillons !', 'ce papillon'],
        ['Dans ___ montagnes-là, il neige souvent.', 'cette montagne-là']],
    },
    titreLecon: 'ces ou ses ?',
    lecon: `
      <h4>ces</h4>
      <p>On l’utilise pour <b>montrer</b> quelque chose. Au singulier, il devient <b>ce, cet</b> ou <b>cette</b>.</p>
      <p>👉 <i>Regarde <b>ces</b> nuages !</i> (→ ce nuage)</p>
      <h4>ses</h4>
      <p>Il veut dire « <b>à lui</b> » ou « <b>à elle</b> ». Au singulier, il devient <b>son</b> ou <b>sa</b>.</p>
      <p>👉 <i>Roxy lave <b>ses</b> pattes.</i> (→ sa patte : la patte de Roxy)</p>
      <div class="astuce">💡 <b>L’astuce de Roxy :</b> mets le mot au singulier.<br>
        ✔ Ça donne <b>ce / cet / cette</b> ? → on écrit <b>ces</b>. On peut souvent ajouter « -là » : <i>ces nuages-là</i>.<br>
        ✔ Ça donne <b>son / sa</b> ? → on écrit <b>ses</b>.</div>
    `,
  });

  // ======================================================================
  // 7. L'accord sujet-verbe
  // ======================================================================
  // [phrase, verbe à l'infinitif, pronom qui remplace le sujet, le sujet, piège éventuel]
  const PERSONNE_DU_PRONOM = { il: 2, elle: 2, nous: 3, ils: 5, elles: 5 };
  const SUJET_VERBE = [
    ['Les feuilles de l’arbre ___ en automne.', 'tomber', 'elles', 'les feuilles', 'Le sujet n’est pas « l’arbre » : ce sont les feuilles qui tombent !'],
    ['Le chat de mes voisins ___ sur le mur.', 'sauter', 'il', 'le chat', 'Le sujet n’est pas « mes voisins » : c’est le chat qui saute !'],
    ['Léa et Tom ___ au ballon.', 'jouer', 'ils', 'Léa et Tom', 'Deux personnes, ça fait un sujet pluriel !'],
    ['Dans la forêt ___ des renards.', 'habiter', 'ils', 'des renards', 'Ici, le sujet est placé après le verbe !'],
    ['Les enfants ___ dans la cour.', 'jouer', 'ils', 'les enfants'],
    ['Ma sœur ___ très bien.', 'dessiner', 'elle', 'ma sœur'],
    ['Les oiseaux ___ vers le sud.', 'voler', 'ils', 'les oiseaux'],
    ['Le soleil ___ dans le ciel.', 'briller', 'il', 'le soleil'],
    ['Les étoiles ___ la nuit.', 'briller', 'elles', 'les étoiles'],
    ['Roxy et ses amis ___ la rivière.', 'regarder', 'ils', 'Roxy et ses amis', 'Roxy et ses amis : ça fait plusieurs, donc un sujet pluriel !'],
    ['Le bus des élèves ___ à huit heures.', 'arriver', 'il', 'le bus', 'Le sujet n’est pas « des élèves » : c’est le bus qui arrive !'],
    ['Les fleurs du jardin ___ vite.', 'pousser', 'elles', 'les fleurs', 'Le sujet n’est pas « le jardin » : ce sont les fleurs qui poussent !'],
    ['Mon frère et moi ___ à la piscine.', 'aller', 'nous', 'mon frère et moi', '« Mon frère et moi », c’est « nous » !'],
    ['Les élèves de la classe ___ le car.', 'prendre', 'ils', 'les élèves', 'Le sujet n’est pas « la classe » : ce sont les élèves qui prennent le car !'],
    ['Le chien ___ sa balle.', 'chercher', 'il', 'le chien'],
    ['Mes parents ___ au travail à vélo.', 'aller', 'ils', 'mes parents'],
    ['Les pages de ce livre ___ jaunes.', 'être', 'elles', 'les pages', 'Le sujet n’est pas « ce livre » : ce sont les pages qui sont jaunes !'],
    ['Le gâteau et la tarte ___ délicieux.', 'être', 'ils', 'le gâteau et la tarte', 'Deux choses, ça fait un sujet pluriel !'],
    ['Tous les matins, mon père ___ le bus.', 'prendre', 'il', 'mon père'],
    ['Les renards ___ faim en hiver.', 'avoir', 'ils', 'les renards'],
    ['Ma cousine ___ un vélo rouge.', 'avoir', 'elle', 'ma cousine'],
    ['Sur la branche ___ deux oiseaux.', 'chanter', 'ils', 'deux oiseaux', 'Ici, le sujet est placé après le verbe !'],
    ['Les voitures ___ lentement.', 'rouler', 'elles', 'les voitures'],
    ['Mon petit frère ___ ses jouets.', 'ranger', 'il', 'mon petit frère'],
    ['Les élèves ___ leurs exercices.', 'finir', 'ils', 'les élèves'],
    ['Les tomates ___ au soleil.', 'rougir', 'elles', 'les tomates'],
    ['Chaque soir, Roxy ___ la lune.', 'regarder', 'elle', 'Roxy'],
    ['Le maître et les élèves ___ en sortie.', 'partir', 'ils', 'le maître et les élèves', 'Le maître et les élèves : ça fait plusieurs, donc un sujet pluriel !'],
    ['Les chiens de la ferme ___ les moutons.', 'garder', 'ils', 'les chiens', 'Le sujet n’est pas « la ferme » : ce sont les chiens qui gardent les moutons !'],
    ['Léa et moi ___ un gâteau.', 'faire', 'nous', 'Léa et moi', '« Léa et moi », c’est « nous » !'],
  ];

  ajouterEtape({
    id: 'orthographe-accord-sujet-verbe',
    banque: SUJET_VERBE,
    creerQuestion([phrase, infinitif, pronom, sujet, piege]) {
      const present = RM.verbe(infinitif).present;
      const p = PERSONNE_DU_PRONOM[pronom];
      const reponse = present[p];
      const formes = [...new Set(pronom === 'nous' ? [present[2], present[3], present[5]] : [present[2], present[5]])];
      const explication = (piege ? `⚠️ ${piege}<br>` : '')
        + `Pour trouver le sujet, demande-toi : qui est-ce qui fait l’action ? → « ${sujet} ». `
        + `On peut le remplacer par « ${pronom} » : ${pronom} <b>${reponse}</b>.`;
      return fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: RM.melanger(formes),
        mauvais: formes.filter(f => f !== reponse),
        explication,
        aide: indice(infinitif),
        consigneChoix: 'Choisis le verbe bien accordé',
        consigneEcrire: 'Écris le verbe au présent',
      });
    },
    titreLecon: 'L’accord sujet-verbe',
    lecon: `
      <p>Le verbe s’accorde toujours avec son <b>sujet</b> : <i>le renard cour<b>t</b></i>, <i>les renards cour<b>ent</b></i>.</p>

      <h4>🔎 Trouver le sujet</h4>
      <p>Pose la question « <b>Qui est-ce qui</b> … ? » devant le verbe.<br>
        👉 <i>Les feuilles de l’arbre tombent.</i> Qui est-ce qui tombe ? → <b>les feuilles</b>.</p>
      <div class="astuce">💡 Remplace le sujet par <b>il, elle, ils</b> ou <b>elles</b> :<br>
        les feuilles → <b>elles</b> tombent · le chat → <b>il</b> saute</div>

      <h4>⚠️ Les pièges</h4>
      <p>• <b>Le sujet est loin du verbe</b> : <i>Les feuilles <u>de l’arbre</u> tombent.</i> (ce n’est pas l’arbre qui tombe !)<br>
         • <b>Le sujet est après le verbe</b> : <i>Dans la forêt habitent <b>des renards</b>.</i><br>
         • <b>Il y a plusieurs sujets</b> : <i><b>Léa et Tom</b> jouent.</i> → ils jouent<br>
         • <b>« … et moi »</b> : <i><b>Mon frère et moi</b> allons à la piscine.</i> → nous allons</p>
    `,
  });

  // ======================================================================
  // 8. Les accords dans le groupe du nom
  // ======================================================================
  // Les 4 formes de chaque adjectif : masculin singulier, féminin singulier, masculin pluriel, féminin pluriel
  const ADJECTIFS = {
    petit: ['petit', 'petite', 'petits', 'petites'],
    grand: ['grand', 'grande', 'grands', 'grandes'],
    vert: ['vert', 'verte', 'verts', 'vertes'],
    noir: ['noir', 'noire', 'noirs', 'noires'],
    joli: ['joli', 'jolie', 'jolis', 'jolies'],
    bleu: ['bleu', 'bleue', 'bleus', 'bleues'],
    gris: ['gris', 'grise', 'gris', 'grises'],
    roux: ['roux', 'rousse', 'roux', 'rousses'],
    blanc: ['blanc', 'blanche', 'blancs', 'blanches'],
    bon: ['bon', 'bonne', 'bons', 'bonnes'],
    gentil: ['gentil', 'gentille', 'gentils', 'gentilles'],
    gros: ['gros', 'grosse', 'gros', 'grosses'],
    beau: ['beau', 'belle', 'beaux', 'belles'],
    nouveau: ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles'],
    heureux: ['heureux', 'heureuse', 'heureux', 'heureuses'],
    'délicieux': ['délicieux', 'délicieuse', 'délicieux', 'délicieuses'],
    rouge: ['rouge', 'rouge', 'rouges', 'rouges'],
    rapide: ['rapide', 'rapide', 'rapides', 'rapides'],
    'drôle': ['drôle', 'drôle', 'drôles', 'drôles'],
    doux: ['doux', 'douce', 'doux', 'douces'],
    long: ['long', 'longue', 'longs', 'longues'],
    sportif: ['sportif', 'sportive', 'sportifs', 'sportives'],
  };

  // [groupe du nom avec ___, adjectif, nom, genre et nombre du nom]
  const GROUPES_NOM = [
    ['des ___ renardes', 'petit', 'renardes', 'fp'], ['une robe ___', 'vert', 'robe', 'fs'],
    ['les chats ___', 'noir', 'chats', 'mp'], ['une ___ fleur', 'joli', 'fleur', 'fs'],
    ['des souris ___', 'gris', 'souris', 'fp'], ['une renarde ___', 'roux', 'renarde', 'fs'],
    ['des moutons ___', 'blanc', 'moutons', 'mp'], ['une ___ idée', 'bon', 'idée', 'fs'],
    ['des chiens ___', 'gentil', 'chiens', 'mp'], ['une ___ surprise', 'gros', 'surprise', 'fs'],
    ['de ___ papillons', 'beau', 'papillons', 'mp'], ['une ___ maison', 'beau', 'maison', 'fs'],
    ['mes ___ chaussures', 'nouveau', 'chaussures', 'fp'], ['des enfants ___', 'heureux', 'enfants', 'mp'],
    ['des pommes ___', 'rouge', 'pommes', 'fp'], ['une voiture ___', 'rapide', 'voiture', 'fs'],
    ['des yeux ___', 'bleu', 'yeux', 'mp'], ['une couverture ___', 'doux', 'couverture', 'fs'],
    ['de ___ cheveux', 'long', 'cheveux', 'mp'], ['des filles ___', 'sportif', 'filles', 'fp'],
    ['un ___ chaton', 'petit', 'chaton', 'ms'], ['les ___ maisons', 'grand', 'maisons', 'fp'],
    ['des tartes ___', 'délicieux', 'tartes', 'fp'], ['une chemise ___', 'blanc', 'chemise', 'fs'],
    ['la ___ girafe', 'grand', 'girafe', 'fs'], ['des histoires ___', 'drôle', 'histoires', 'fp'],
    ['des lunettes ___', 'noir', 'lunettes', 'fp'], ['un ___ ballon', 'gros', 'ballon', 'ms'],
    ['des amies ___', 'gentil', 'amies', 'fp'], ['un ___ vélo', 'nouveau', 'vélo', 'ms'],
  ];

  function tableauAdjectif(formes, cible) {
    const cellule = i => `<td class="${i === cible ? 'cible' : ''}">${formes[i]}</td>`;
    return `<table class="mini-tableau">
      <tr><td></td><td><b>masculin</b></td><td><b>féminin</b></td></tr>
      <tr><td><b>singulier</b></td>${cellule(0)}${cellule(1)}</tr>
      <tr><td><b>pluriel</b></td>${cellule(2)}${cellule(3)}</tr>
    </table>`;
  }

  function expliquerGroupeNom(adjectif, nom, cas) {
    const formes = ADJECTIFS[adjectif];
    const forme = formes[CASES[cas]];
    let texte = `« ${nom} » est un nom <b>${GENRES[cas[0]]} ${NOMBRES[cas[1]]}</b> : l’adjectif s’accorde avec lui → <b>${forme}</b>.<br>`;
    if (cas[0] === 'f') {
      if (formes[1] === formes[0]) texte += ` « ${adjectif} » finit déjà par un e : il ne change pas au féminin.`;
      else if (formes[1] !== adjectif + 'e') texte += ` Attention : au féminin, « ${adjectif} » devient « ${formes[1]} » !`;
    }
    if (cas === 'mp') {
      if (formes[2] === formes[0]) texte += ` « ${adjectif} » finit déjà par un ${adjectif.slice(-1)} : il ne change pas au pluriel.`;
      else if (formes[2] !== adjectif + 's') texte += ` Attention : au pluriel, « ${adjectif} » devient « ${formes[2]} » !`;
    }
    return texte + tableauAdjectif(formes, CASES[cas]);
  }

  ajouterEtape({
    id: 'orthographe-accords-groupe-nom',
    banque: GROUPES_NOM,
    creerQuestion([groupe, adjectif, nom, cas]) {
      const formes = [...new Set(ADJECTIFS[adjectif])];
      const reponse = ADJECTIFS[adjectif][CASES[cas]];
      return fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
        phrase: groupe,
        reponse,
        choix: formes,
        mauvais: formes.filter(f => f !== reponse),
        explication: expliquerGroupeNom(adjectif, nom, cas),
        aide: indice(adjectif),
        consigneChoix: 'Choisis l’adjectif bien accordé',
        consigneEcrire: 'Écris l’adjectif bien accordé',
      });
    },
    titreLecon: 'Les accords dans le groupe du nom',
    lecon: `
      <p>Dans un groupe du nom, l’<b>adjectif</b> s’accorde avec le <b>nom</b> : il prend son genre
        (masculin ou féminin) et son nombre (singulier ou pluriel).</p>

      <table>
        <tr><th></th><th>masculin</th><th>féminin</th></tr>
        <tr><td>singulier</td><td>un chat noir</td><td>une chatte noir<span class="terminaison">e</span></td></tr>
        <tr><td>pluriel</td><td>des chats noir<span class="terminaison">s</span></td><td>des chattes noir<span class="terminaison">es</span></td></tr>
      </table>
      <div class="astuce">💡 <b>+ e</b> pour le féminin, <b>+ s</b> pour le pluriel. Le déterminant aide à savoir :
        <i>une, la, cette</i> → féminin · <i>des, les, mes</i> → pluriel.</div>

      <h4>⚠️ Les adjectifs spéciaux</h4>
      <p>• Il finit déjà par <b>e</b> ? Rien ne change au féminin : <i>un ballon rouge, une pomme rouge</i>.<br>
         • Il finit par <b>s</b> ou <b>x</b> ? Rien ne change au masculin pluriel : <i>des chats gris, des enfants heureux</i>.</p>
      <table>
        <tr><td>blanc → blanche</td><td>gentil → gentille</td></tr>
        <tr><td>gros → grosse</td><td>bon → bonne</td></tr>
        <tr><td>roux → rousse</td><td>doux → douce</td></tr>
        <tr><td>long → longue</td><td>sportif → sportive</td></tr>
        <tr><td>heureux → heureuse</td><td>délicieux → délicieuse</td></tr>
        <tr><td>beau → belle, beaux</td><td>nouveau → nouvelle, nouveaux</td></tr>
      </table>
    `,
  });

  // ======================================================================
  // 9. L'accord du participe passé
  // ======================================================================
  // Avec être : [phrase, verbe, sujet, genre et nombre du sujet, remarque éventuelle]
  // Avec avoir : [phrase, verbe]
  const PARTICIPES = [
    ['Les filles sont ___ à la plage.', 'aller', 'les filles', 'fp'],
    ['Léa a ___ une pomme.', 'manger'],
    ['Mes cousins sont ___ hier soir.', 'arriver', 'mes cousins', 'mp'],
    ['Roxy est ___ du terrier.', 'sortir', 'Roxy', 'fs'],
    ['Les enfants ont ___ leurs devoirs.', 'finir'],
    ['La maîtresse a ___ une histoire.', 'lire'],
    ['Ma sœur est ___ de vélo.', 'tomber', 'ma sœur', 'fs'],
    ['Les oiseaux sont ___ vers le sud.', 'partir', 'les oiseaux', 'mp'],
    ['Tom a ___ un gâteau.', 'faire'],
    ['Les feuilles sont ___ de l’arbre.', 'tomber', 'les feuilles', 'fp'],
    ['Nous avons ___ un beau film.', 'voir'],
    ['Mes amies sont ___ me voir.', 'venir', 'mes amies', 'fp'],
    ['Mon père est ___ au grenier.', 'monter', 'mon père', 'ms'],
    ['Les élèves ont ___ la leçon.', 'apprendre'],
    ['Léa et Zoé sont ___ tard.', 'rentrer', 'Léa et Zoé', 'fp'],
    ['Papa a ___ la fenêtre.', 'ouvrir'],
    ['Les chattes sont ___ dans le jardin.', 'rester', 'les chattes', 'fp'],
    ['Grand-mère a ___ une lettre.', 'écrire'],
    ['Le train est ___ en retard.', 'arriver', 'le train', 'ms'],
    ['Mes frères ont ___ au foot.', 'jouer'],
    ['La petite fille est ___ dans la classe.', 'entrer', 'la petite fille', 'fs'],
    ['Les garçons sont ___ du bus.', 'descendre', 'les garçons', 'mp'],
    ['Elles ont ___ une chanson.', 'chanter'],
    ['Ma tante est ___ en vacances.', 'partir', 'ma tante', 'fs'],
    ['Les renardeaux sont ___ au terrier.', 'rentrer', 'les renardeaux', 'mp'],
    ['Roxy a ___ le bon chemin.', 'choisir'],
    ['Les filles ont ___ leur chambre.', 'ranger'],
    ['Léo et Léa sont ___ au cinéma.', 'aller', 'Léo et Léa', 'mp', 'Un garçon et une fille ensemble : c’est le masculin qui l’emporte !'],
  ];

  ajouterEtape({
    id: 'orthographe-participe-passe',
    banque: PARTICIPES,
    creerQuestion([phrase, infinitif, sujet, cas, remarque]) {
      const verbe = RM.verbe(infinitif);
      const participe = verbe.participe;
      const auxiliaire = phrase.split('___')[0].trim().split(' ').pop(); // le mot juste avant le trou
      let reponse, formes, explication;
      if (cas) {
        reponse = accorder(participe, cas);
        formes = ['ms', 'fs', 'mp', 'fp'].map(c => accorder(participe, c));
        const marques = [cas[0] === 'f' && '+ e pour le féminin', cas[1] === 'p' && '+ s pour le pluriel']
          .filter(Boolean).join(', ') || 'rien à ajouter';
        explication = (remarque ? `⚠️ ${remarque}<br>` : '')
          + `Ici, l’auxiliaire est <b>être</b> (« ${auxiliaire} »). Avec être, le participe passé <b>s’accorde avec le sujet</b> : `
          + `le sujet « ${sujet} » est au ${GENRES[cas[0]]} ${NOMBRES[cas[1]]} → <b>${reponse}</b> (${marques}).`;
      } else {
        reponse = participe;
        formes = [participe, participe + 'e', /s$/.test(participe) ? participe.slice(0, -1) + 't' : participe + 's', infinitif];
        explication = `Ici, l’auxiliaire est <b>avoir</b> (« ${auxiliaire} »). Avec avoir, le participe passé `
          + `<b>ne s’accorde pas</b> avec le sujet : <b>${participe}</b>.`
          + (verbe.groupe === 'premier' ? ' Et c’est bien <b>-é</b>, pas -er : on pourrait dire « vendu ».' : '');
      }
      formes = [...new Set(formes)];
      return fabriquer(tirerType({ choix: 0.5, ecrire: 0.3, vraifaux: 0.2 }), {
        phrase,
        reponse,
        choix: RM.melanger(formes),
        mauvais: formes.filter(f => f !== reponse),
        explication,
        aide: indice(infinitif),
        consigneChoix: 'Choisis le bon participe passé',
        consigneEcrire: 'Écris le participe passé',
      });
    },
    titreLecon: 'L’accord du participe passé',
    lecon: `
      <p>Au passé composé, le verbe a deux mots : l’<b>auxiliaire</b> (être ou avoir) + le <b>participe passé</b>.
        Tout dépend de l’auxiliaire !</p>

      <h4>Avec être : on accorde avec le sujet</h4>
      <p>👉 <i>Roxy est parti<b>e</b>.</i> (féminin : + e)<br>
         👉 <i>Les oiseaux sont parti<b>s</b>.</i> (pluriel : + s)<br>
         👉 <i>Les filles sont allé<b>es</b>.</i> (féminin pluriel : + es)</p>
      <div class="astuce">💡 Un garçon et une fille ensemble ? C’est le <b>masculin</b> qui l’emporte :
        <i>Léo et Léa sont allé<b>s</b>.</i></div>

      <h4>Avec avoir : on n’accorde pas avec le sujet</h4>
      <p>👉 <i>Les filles <b>ont</b> rangé leur chambre.</i> (pas de e, pas de s !)</p>
      <div class="astuce">💡 <b>é ou er ?</b> Remplace par <b>vendu</b> : <i>Elle a <u>vendu</u></i> ✔ → <i>Elle a mang<b>é</b></i>.</div>
    `,
  });
})();
