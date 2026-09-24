// Renard Malin — Conjugaison : les 9 étapes du Sentier
//
// Les verbes conjugués viennent du livre des verbes (data/verbes.js).
// Chaque étape dit : quels verbes, à quel temps, avec quelles personnes,
// ce que Roxy explique après une erreur, et la petite leçon du bouton Aide.
// Le titre et la place de chaque étape sur la carte sont dans data/foret.js.
//
// Une question est un objet comme celui-ci :
//   type        : 'ecrire' (taper la réponse) ou 'choix' (boutons)
//   consigne    : la petite phrase au-dessus de la question
//   enonce      : la question elle-même (en HTML)
//   choix       : les réponses proposées (pour 'choix')
//   reponse     : la bonne réponse
//   solution    : la bonne réponse telle qu'on l'affiche après une erreur
//   explication : ce que Roxy explique quand on se trompe

(function () {
  const V = RM.verbe;
  const ETRE = V('être');
  const AVOIR = V('avoir');
  const PRONOMS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
  const PRONOMS_REGLE = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'];
  const TOUTES_LES_PERSONNES = [0, 1, 2, 3, 4, 5];

  // « je » devient « j’ » devant une voyelle ou un h : j’aime, j’ai chanté
  const commenceParVoyelle = forme => /^[aeéèêiîoôuûh]/.test(forme);
  const avecPronom = (pronom, forme) =>
    (pronom === 'je' && commenceParVoyelle(forme) ? 'j’' : pronom + ' ') + forme;

  // ---------- Le sujet de la question ----------
  // Avec l'auxiliaire être, il faut savoir si l'on parle de filles ou de garçons : on le précise.
  function choisirSujet(p, { genre = false } = {}) {
    const sujet = { p, pronom: PRONOMS[p], feminin: false, pluriel: p >= 3, mixte: false, precision: '' };
    if (p === 2) sujet.pronom = RM.hasard(genre ? ['il', 'elle'] : ['il', 'elle', 'on']);
    if (p === 5) sujet.pronom = RM.hasard(['ils', 'elles']);
    sujet.feminin = sujet.pronom === 'elle' || sujet.pronom === 'elles';
    if (genre && (p === 0 || p === 1)) {
      sujet.feminin = Math.random() < 0.5;
      sujet.precision = `« ${sujet.pronom} » = ${sujet.feminin ? 'une fille 👧' : 'un garçon 👦'}`;
    }
    if (genre && (p === 3 || p === 4)) {
      const cas = RM.hasard(['filles', 'garcons', 'mixte']);
      sujet.feminin = cas === 'filles';
      sujet.mixte = cas === 'mixte';
      sujet.precision = `« ${sujet.pronom} » = `
        + { filles: 'des filles 👧👧', garcons: 'des garçons 👦👦', mixte: 'une fille et un garçon 👧👦' }[cas];
    }
    return sujet;
  }

  const sujetSimple = p => ({ p, pronom: PRONOMS[p], feminin: false, pluriel: p >= 3 });

  // Avec l'auxiliaire être, le participe passé s'accorde avec le sujet : + e (féminin), + s (pluriel)
  const accorder = (participe, sujet) => participe + (sujet.feminin ? 'e' : '') + (sujet.pluriel ? 's' : '');

  function expliquerAccord(sujet, participeAccorde) {
    const marques = [sujet.feminin && '+ e pour le féminin', sujet.pluriel && '+ s pour le pluriel']
      .filter(Boolean).join(', ') || 'rien à ajouter';
    const qui = sujet.mixte
      ? `« ${sujet.pronom} », c’est une fille et un garçon : le <b>masculin</b> l’emporte`
      : `« ${sujet.pronom} » est au ${sujet.feminin ? 'féminin' : 'masculin'} ${sujet.pluriel ? 'pluriel' : 'singulier'}`;
    return ` Avec être, le participe passé <b>s’accorde avec le sujet</b>. Ici, ${qui} : <b>${participeAccorde}</b> (${marques}).`;
  }

  // Dans les tableaux, les temps avec être s'écrivent : je suis allé(e), nous sommes allé(e)s…
  const MARQUES_TABLEAU = ['(e)', '(e)', '', '(e)s', '(e)s', 's'];
  const formeAvecEtre = auxiliaire => (verbe, i) => `${auxiliaire[i]} ${verbe.participe}${MARQUES_TABLEAU[i]}`;

  // ---------- Le moteur commun à toutes les étapes ----------

  function afficher(etape, sujet, forme) {
    return etape.sansSujet
      ? `<span class="indice">(${sujet.pronom})</span> ${forme} !`
      : avecPronom(sujet.pronom, forme);
  }

  // Le verbe conjugué en entier, avec la ligne de la question surlignée
  function tableau(etape, verbe, sujet, forme) {
    const cellule = i => {
      const texte = i === sujet.p
        ? afficher(etape, sujet, forme)
        : afficher(etape, sujetSimple(i), etape.formeTableau(verbe, i));
      return `<td class="${i === sujet.p ? 'cible' : ''}">${texte}</td>`;
    };
    if (etape.personnes.length === 6) {
      return `<table class="mini-tableau">
        <tr>${cellule(0)}${cellule(3)}</tr>
        <tr>${cellule(1)}${cellule(4)}</tr>
        <tr>${cellule(2)}${cellule(5)}</tr>
      </table>`;
    }
    return `<table class="mini-tableau"><tr>${etape.personnes.map(cellule).join('')}</tr></table>`;
  }

  function creerQuestion(etape, verbe, sujet) {
    const forme = etape.conjuguer(verbe, sujet);
    const debut = etape.sansSujet
      ? `<span class="indice">(${sujet.pronom})</span> `
      : (sujet.p === 0 && commenceParVoyelle(forme) ? 'j’' : sujet.pronom + ' ');
    const fin = etape.sansSujet ? ' !' : '';
    const precision = etape.precision ? etape.precision(sujet) : sujet.precision;
    const question = {
      enonce: `${debut}<span class="trou">?</span>${fin} <span class="indice">(${verbe.infinitif})</span>`
        + (precision ? `<span class="precision">${precision}</span>` : ''),
      reponse: forme,
      solution: `${debut}<b>${forme}</b>${fin}`,
      explication: etape.expliquer(verbe, sujet, forme) + tableau(etape, verbe, sujet, forme),
    };
    if (Math.random() < etape.partEcrire) {
      return { ...question, type: 'ecrire', consigne: `Écris le verbe ${etape.temps}` };
    }
    const pieges = [...new Set(etape.distracteurs(verbe, sujet, forme))].filter(f => f && f !== forme);
    const choix = RM.melanger([forme, ...RM.melanger(pieges).slice(0, 3)]);
    return { ...question, type: 'choix', consigne: `Choisis le verbe ${etape.temps}`, choix };
  }

  // Ajoute une étape au Sentier, avec des réglages par défaut
  function ajouterEtape(etape) {
    const liste = etape.verbes.map(v => (Array.isArray(v) ? { verbe: V(v[0]), poids: v[1] } : { verbe: V(v), poids: 1 }));
    const total = liste.reduce((somme, v) => somme + v.poids, 0);
    const tirerVerbe = () => {
      let tirage = Math.random() * total; // « poids » : plus il est grand, plus le verbe revient souvent
      return liste.find(v => (tirage -= v.poids) < 0).verbe;
    };

    etape.personnes = etape.personnes || TOUTES_LES_PERSONNES;
    etape.partEcrire = etape.partEcrire ?? 0.6; // écrire la réponse aide le mieux à mémoriser
    etape.formeTableau = etape.formeTableau || ((verbe, i) => etape.conjuguer(verbe, sujetSimple(i)));
    // Par défaut, les pièges sont les autres personnes du même verbe
    etape.distracteurs = etape.distracteurs
      || (verbe => etape.personnes.map(i => etape.conjuguer(verbe, sujetSimple(i))));

    etape.creerQuestions = function (nombre) {
      const dejaPosees = new Set();
      const questions = [];
      let essais = 0;
      while (questions.length < nombre) {
        const verbe = tirerVerbe();
        const p = RM.hasard(etape.personnes);
        if (dejaPosees.has(verbe.infinitif + p) && essais++ < 1000) continue;
        dejaPosees.add(verbe.infinitif + p);
        const genre = etape.genre ? etape.genre(verbe) : false;
        questions.push(creerQuestion(etape, verbe, choisirSujet(p, { genre })));
      }
      return questions;
    };

    RM.etapes.push(etape);
  }

  // ======================================================================
  // 1. Le présent : verbes en -er, finir, être et avoir
  // ======================================================================
  const TERMINAISONS_PRESENT = { premier: RM.FINS.present1, deuxieme: RM.FINS.present2 };

  ajouterEtape({
    id: 'conjugaison-present-1',
    temps: 'au présent',
    verbes: [['être', 4], ['avoir', 4], 'chanter', 'jouer', 'parler', 'danser', 'regarder', 'aimer',
      'écouter', 'dessiner', 'marcher', 'trouver', 'habiter', 'sauter', 'manger', 'nager', 'commencer',
      'lancer', 'finir', 'choisir', 'grandir', 'réussir', 'remplir', 'obéir', 'rougir'],
    conjuguer: (verbe, s) => verbe.present[s.p],
    expliquer(verbe, s) {
      if (verbe.groupe === 'etre-avoir') {
        return `« ${verbe.infinitif} » est un verbe <b>irrégulier</b> : il ne suit pas de règle, il faut le connaître par cœur !`;
      }
      const p = s.p;
      const groupe = verbe.groupe === 'premier' ? '1er groupe (en -er)' : '2e groupe (comme finir)';
      let texte = `« ${verbe.infinitif} » est un verbe du <b>${groupe}</b>. `
        + `Avec « ${PRONOMS_REGLE[p]} », la terminaison est <b>-${TERMINAISONS_PRESENT[verbe.groupe][p]}</b>.`;
      if (p === 5) texte += ' On ne l’entend pas, mais il faut l’écrire !';
      if (p === 3 && verbe.infinitif.endsWith('ger')) {
        texte += ` Attention : on garde le <b>e</b> après le g, sinon on lirait « ${verbe.infinitif.slice(0, -3)}gon » !`;
      }
      if (p === 3 && verbe.infinitif.endsWith('cer')) {
        texte += ` Attention : le c devient <b>ç</b>, sinon on lirait « ${verbe.infinitif.slice(0, -3)}kon » !`;
      }
      return texte;
    },
    titreLecon: 'Le présent',
    lecon: `
      <p>Le <b>présent</b> sert à dire ce qui se passe <b>maintenant</b> : <i>Roxy mange une pomme.</i></p>

      <h4>🌿 Les verbes en -er (1er groupe)</h4>
      <p>On garde le radical (<i>chant-</i>) et on ajoute la terminaison :</p>
      <table>
        <tr><td>je chant<span class="terminaison">e</span></td><td>nous chant<span class="terminaison">ons</span></td></tr>
        <tr><td>tu chant<span class="terminaison">es</span></td><td>vous chant<span class="terminaison">ez</span></td></tr>
        <tr><td>il chant<span class="terminaison">e</span></td><td>ils chant<span class="terminaison">ent</span></td></tr>
      </table>
      <div class="astuce">💡 Avec <b>tu</b>, le verbe se termine par <b>-s</b>.
        Avec <b>ils / elles</b>, on écrit <b>-ent</b>, même si on ne l’entend pas !</div>
      <p>⚠️ <b>manger → nous mangeons</b> : on garde le e.<br>
         ⚠️ <b>commencer → nous commençons</b> : le c devient ç.</p>

      <h4>🌳 Les verbes en -ir comme finir (2e groupe)</h4>
      <table>
        <tr><td>je fin<span class="terminaison">is</span></td><td>nous fin<span class="terminaison">issons</span></td></tr>
        <tr><td>tu fin<span class="terminaison">is</span></td><td>vous fin<span class="terminaison">issez</span></td></tr>
        <tr><td>il fin<span class="terminaison">it</span></td><td>ils fin<span class="terminaison">issent</span></td></tr>
      </table>
      <div class="astuce">💡 On reconnaît le 2e groupe grâce à « nous …<b>issons</b> » :
        nous finissons, nous choisissons, nous grandissons.</div>

      <h4>⭐ Être et avoir</h4>
      <table>
        <tr><th>être</th><th>avoir</th></tr>
        <tr><td>je suis</td><td>j’ai</td></tr>
        <tr><td>tu es</td><td>tu as</td></tr>
        <tr><td>il est</td><td>il a</td></tr>
        <tr><td>nous sommes</td><td>nous avons</td></tr>
        <tr><td>vous êtes</td><td>vous avez</td></tr>
        <tr><td>ils sont</td><td>ils ont</td></tr>
      </table>
      <div class="astuce">💡 Ce sont les deux verbes les plus importants ! Ils sont irréguliers :
        il faut les apprendre par cœur.</div>
    `,
  });

  // ======================================================================
  // 2. Le présent (2) : les verbes irréguliers très utiles
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-present-2',
    temps: 'au présent',
    verbes: ['aller', 'faire', 'dire', 'venir', 'pouvoir', 'voir', 'vouloir', 'prendre'],
    conjuguer: (verbe, s) => verbe.present[s.p],
    expliquer(verbe, s, forme) {
      const p = s.p;
      let texte = `« ${verbe.infinitif} » est un verbe <b>irrégulier</b> : il faut le connaître par cœur ! `;
      if (p <= 1) {
        texte += forme.endsWith('x')
          ? 'Avec « je » et « tu », pouvoir et vouloir finissent par un <b>x</b> : je peux, tu veux.'
          : 'Avec « je » et « tu », ces verbes finissent par un <b>s</b> : je fais, tu dis.';
      }
      if (p === 2) {
        if (forme.endsWith('d')) texte += 'Avec il / elle / on, prendre garde son <b>d</b> : il prend.';
        else if (forme === 'va') texte += 'Avec il / elle / on : il va, sans t à la fin !';
        else texte += 'Avec il / elle / on, ces verbes finissent par un <b>t</b> : il fait, il vient, il peut.';
      }
      if (p === 3) texte += 'Avec « nous », la terminaison est <b>-ons</b>.' + (forme.includes('y') ? ' Attention au <b>y</b> : nous voyons.' : '');
      if (p === 4) {
        texte += ['faites', 'dites'].includes(forme)
          ? 'Attention : vous fai<b>tes</b>, vous di<b>tes</b> (et pas « faisez » ni « disez » !).'
          : 'Avec « vous », la terminaison est <b>-ez</b>.' + (forme.includes('y') ? ' Attention au <b>y</b> : vous voyez.' : '');
      }
      if (p === 5) {
        if (/nnent$/.test(forme)) texte += 'Attention au <b>double n</b> : ils prennent, ils viennent.';
        else if (forme.endsWith('ont')) texte += 'ils vont, ils font : ils finissent en <b>-ont</b>, comme « ils ont » et « ils sont » !';
        else texte += 'Avec « ils / elles », la terminaison est <b>-ent</b> (on ne l’entend pas).';
      }
      return texte;
    },
    titreLecon: 'Le présent (2) : les verbes irréguliers',
    lecon: `
      <p>Certains verbes très utiles sont <b>irréguliers</b> : leur forme change beaucoup.
        Il faut les apprendre par cœur… mais ils ont des points communs !</p>

      <table>
        <tr><th></th><th>aller</th><th>faire</th><th>dire</th><th>prendre</th></tr>
        <tr><td>je</td><td>vais</td><td>fais</td><td>dis</td><td>prends</td></tr>
        <tr><td>tu</td><td>vas</td><td>fais</td><td>dis</td><td>prends</td></tr>
        <tr><td>il</td><td>va</td><td>fait</td><td>dit</td><td>prend</td></tr>
        <tr><td>nous</td><td>allons</td><td>faisons</td><td>disons</td><td>prenons</td></tr>
        <tr><td>vous</td><td>allez</td><td>faites</td><td>dites</td><td>prenez</td></tr>
        <tr><td>ils</td><td>vont</td><td>font</td><td>disent</td><td>prennent</td></tr>
      </table>

      <table>
        <tr><th></th><th>venir</th><th>voir</th><th>pouvoir</th><th>vouloir</th></tr>
        <tr><td>je</td><td>viens</td><td>vois</td><td>peux</td><td>veux</td></tr>
        <tr><td>tu</td><td>viens</td><td>vois</td><td>peux</td><td>veux</td></tr>
        <tr><td>il</td><td>vient</td><td>voit</td><td>peut</td><td>veut</td></tr>
        <tr><td>nous</td><td>venons</td><td>voyons</td><td>pouvons</td><td>voulons</td></tr>
        <tr><td>vous</td><td>venez</td><td>voyez</td><td>pouvez</td><td>voulez</td></tr>
        <tr><td>ils</td><td>viennent</td><td>voient</td><td>peuvent</td><td>veulent</td></tr>
      </table>

      <div class="astuce">💡 <b>Les points communs :</b><br>
        • avec <b>je</b> et <b>tu</b> : un <b>s</b> à la fin (je fais, tu dis)… sauf je peu<b>x</b>, tu veu<b>x</b> !<br>
        • avec <b>il / elle</b> : un <b>t</b> (il fait, il vient)… sauf il va et il pren<b>d</b>.<br>
        • vous fai<b>tes</b>, vous di<b>tes</b> : jamais « faisez » !<br>
        • ils <b>vont</b>, ils <b>font</b> : comme ils ont et ils sont.<br>
        • ils pre<b>nn</b>ent, ils vie<b>nn</b>ent : deux n.</div>
    `,
  });

  // ======================================================================
  // 3. L'imparfait
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-imparfait',
    temps: 'à l’imparfait',
    verbes: [['être', 3], ['avoir', 3], 'chanter', 'jouer', 'parler', 'regarder', 'aimer', 'écouter',
      'habiter', 'manger', 'nager', 'commencer', 'lancer', 'finir', 'choisir', 'grandir',
      'aller', 'faire', 'dire', 'prendre', 'venir', 'pouvoir', 'voir', 'vouloir'],
    conjuguer: (verbe, s) => verbe.imparfait[s.p],
    expliquer(verbe, s, forme) {
      const p = s.p;
      let texte = `À l’imparfait, <b>tous</b> les verbes ont les mêmes terminaisons. `
        + `Avec « ${PRONOMS_REGLE[p]} », c’est <b>-${RM.FINS.imparfait[p]}</b>.`;
      if (verbe.infinitif === 'être') return texte + ' Pour « être », le radical est spécial : <b>ét-</b> → j’étais.';
      texte += ` Le radical vient de « nous » au présent : nous ${verbe.present[3]} → ${avecPronom('je', verbe.imparfait[0])}.`;
      if (p === 3 || p === 4) {
        if (verbe.infinitif.endsWith('ger')) texte += ` Devant le i, plus besoin du e : ${PRONOMS[p]} ${forme}.`;
        if (verbe.infinitif.endsWith('cer')) texte += ` Devant le i, le ç redevient un c : ${PRONOMS[p]} ${forme}.`;
        if (verbe.infinitif === 'voir') texte += ` Attention : un <b>y</b> puis un <b>i</b> : ${PRONOMS[p]} ${forme} !`;
      }
      return texte;
    },
    titreLecon: 'L’imparfait',
    lecon: `
      <p>L’imparfait sert à raconter ce qui <b>durait</b> ou qui se <b>répétait</b> dans le passé :
        <i>Quand j’étais petite, je jouais souvent au parc.</i></p>

      <h4>🌟 Les mêmes terminaisons pour tous les verbes !</h4>
      <table>
        <tr><td>je chant<span class="terminaison">ais</span></td><td>nous chant<span class="terminaison">ions</span></td></tr>
        <tr><td>tu chant<span class="terminaison">ais</span></td><td>vous chant<span class="terminaison">iez</span></td></tr>
        <tr><td>il chant<span class="terminaison">ait</span></td><td>ils chant<span class="terminaison">aient</span></td></tr>
      </table>

      <div class="astuce">💡 <b>Le radical</b> vient de « nous » au présent :<br>
        nous finiss<u>ons</u> → je finissais · nous fais<u>ons</u> → je faisais · nous pren<u>ons</u> → je prenais.<br>
        Un seul verbe fait autrement : <b>être</b> → j’étais.</div>

      <table>
        <tr><th>être</th><th>avoir</th></tr>
        <tr><td>j’étais</td><td>j’avais</td></tr>
        <tr><td>tu étais</td><td>tu avais</td></tr>
        <tr><td>il était</td><td>il avait</td></tr>
        <tr><td>nous étions</td><td>nous avions</td></tr>
        <tr><td>vous étiez</td><td>vous aviez</td></tr>
        <tr><td>ils étaient</td><td>ils avaient</td></tr>
      </table>

      <p>⚠️ je mang<b>e</b>ais, mais nous mangions · je commen<b>ç</b>ais, mais nous commencions<br>
         ⚠️ nous vo<b>yi</b>ons, vous vo<b>yi</b>ez : un y puis un i !</p>
    `,
  });

  // ======================================================================
  // 4. Le futur
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-futur',
    temps: 'au futur',
    verbes: [['être', 3], ['avoir', 3], 'chanter', 'jouer', 'parler', 'danser', 'regarder', 'aimer',
      'écouter', 'manger', 'commencer', 'finir', 'choisir', 'grandir', 'réussir',
      ['aller', 2], ['faire', 2], 'venir', 'pouvoir', 'voir', 'vouloir', 'dire', 'prendre'],
    conjuguer: (verbe, s) => verbe.futur[s.p],
    expliquer(verbe, s, forme) {
      const fin = RM.FINS.futur[s.p];
      if (verbe.groupe === 'premier' || verbe.groupe === 'deuxieme') {
        return `Au futur, on garde l’infinitif en entier et on ajoute la terminaison : `
          + `<b>${verbe.infinitif}</b> + <b>${fin}</b> = ${forme}.`
          + (verbe.groupe === 'premier' ? ' Le e de l’infinitif reste, même si on l’entend à peine !' : '');
      }
      const radical = forme.slice(0, -fin.length);
      return `« ${verbe.infinitif} » a un radical spécial au futur : <b>${radical}-</b>`
        + (radical.endsWith('rr') ? ' (avec deux r !)' : '')
        + `. Les terminaisons, elles, sont les mêmes pour tous : avec « ${PRONOMS_REGLE[s.p]} », c’est <b>-${fin}</b>.`;
    },
    titreLecon: 'Le futur',
    lecon: `
      <p>Le futur sert à dire ce qui <b>va se passer</b> plus tard : <i>L’année prochaine, j’irai en 6e !</i></p>

      <h4>🌿 Verbes en -er et en -ir : l’infinitif + la terminaison</h4>
      <table>
        <tr><td>je chanter<span class="terminaison">ai</span></td><td>nous chanter<span class="terminaison">ons</span></td></tr>
        <tr><td>tu chanter<span class="terminaison">as</span></td><td>vous chanter<span class="terminaison">ez</span></td></tr>
        <tr><td>il chanter<span class="terminaison">a</span></td><td>ils chanter<span class="terminaison">ont</span></td></tr>
      </table>
      <div class="astuce">💡 Les terminaisons du futur ressemblent au verbe <b>avoir</b> au présent :
        j’<b>ai</b>, tu <b>as</b>, il <b>a</b>, nous (av)<b>ons</b>, vous (av)<b>ez</b>, ils <b>ont</b> !</div>
      <p>⚠️ Le e de l’infinitif reste, même si on l’entend à peine : je jou<b>e</b>rai, j’oubli<b>e</b>rai.</p>

      <h4>⭐ Les radicaux spéciaux à retenir</h4>
      <table>
        <tr><td>être → je <b>ser</b>ai</td><td>avoir → j’<b>aur</b>ai</td></tr>
        <tr><td>aller → j’<b>ir</b>ai</td><td>faire → je <b>fer</b>ai</td></tr>
        <tr><td>venir → je <b>viendr</b>ai</td><td>vouloir → je <b>voudr</b>ai</td></tr>
        <tr><td>pouvoir → je <b>pourr</b>ai</td><td>voir → je <b>verr</b>ai</td></tr>
        <tr><td>dire → je <b>dir</b>ai</td><td>prendre → je <b>prendr</b>ai</td></tr>
      </table>
      <div class="astuce">💡 pou<b>rr</b>ai et ve<b>rr</b>ai prennent <b>deux r</b> !</div>
    `,
  });

  // ======================================================================
  // 5. Le passé composé avec avoir
  // ======================================================================
  function astuceParticipe(verbe) {
    const participe = verbe.participe;
    if (verbe.groupe === 'premier') return 'Les verbes en -er ont un participe en <b>-é</b> (et pas -er !).';
    if (verbe.groupe === 'deuxieme') return `Les verbes comme finir ont un participe en <b>-i</b> : ${participe}.`;
    if (verbe.groupe === 'etre-avoir') return `Le participe de « ${verbe.infinitif} » est <b>${participe}</b> : à retenir !`;
    if (/[st]$/.test(participe)) {
      return `Pour trouver la lettre muette à la fin, mets le participe au féminin : ${participe}e → <b>${participe}</b>.`;
    }
    return `Le participe de « ${verbe.infinitif} » est <b>${participe}</b>. Beaucoup de verbes finissent en <b>-u</b> : vu, lu, bu, pu.`;
  }

  // Les erreurs d'auxiliaire les plus fréquentes : « tu a », « ils on »…
  const AUXILIAIRE_PIEGE = ['as', 'a', 'as', 'avez', 'avons', 'on'];

  ajouterEtape({
    id: 'conjugaison-passe-compose-avoir',
    temps: 'au passé composé',
    partEcrire: 0.5,
    verbes: ['chanter', 'jouer', 'manger', 'regarder', 'dessiner', 'écouter', 'trouver',
      'finir', 'choisir', 'grandir', 'réussir', 'être', 'avoir', 'faire', 'dire', 'prendre', 'voir',
      'pouvoir', 'vouloir', 'mettre', 'écrire', 'lire', 'boire', 'apprendre', 'ouvrir', 'perdre', 'répondre'],
    conjuguer: (verbe, s) => `${AVOIR.present[s.p]} ${verbe.participe}`,
    expliquer: (verbe, s) =>
      `Au passé composé, on met l’auxiliaire <b>avoir</b> au présent (${AVOIR.present[s.p]}) `
      + `+ le <b>participe passé</b> du verbe. ` + astuceParticipe(verbe),
    distracteurs(verbe, s) {
      const auxiliaire = AVOIR.present[s.p];
      const participe = verbe.participe;
      const pieges = [
        `${auxiliaire} ${verbe.infinitif}`,
        /[st]$/.test(participe) ? `${auxiliaire} ${participe.slice(0, -1)}` : `${auxiliaire} ${participe}s`,
        `${AUXILIAIRE_PIEGE[s.p]} ${participe}`,
      ];
      if (s.p !== 0) pieges.push(`${ETRE.present[s.p]} ${participe}`);
      return pieges;
    },
    titreLecon: 'Le passé composé avec avoir',
    lecon: `
      <p>Le passé composé raconte une action <b>terminée</b> : <i>Hier, j’ai gagné la course !</i></p>
      <p>Il est « composé » de <b>deux mots</b> : l’auxiliaire <b>avoir</b> au présent + le <b>participe passé</b>.</p>
      <table>
        <tr><td>j’<b>ai</b> chanté</td><td>nous <b>avons</b> chanté</td></tr>
        <tr><td>tu <b>as</b> chanté</td><td>vous <b>avez</b> chanté</td></tr>
        <tr><td>il <b>a</b> chanté</td><td>ils <b>ont</b> chanté</td></tr>
      </table>

      <h4>🔎 Trouver le participe passé</h4>
      <p>• verbes en -er → <b>-é</b> : chanté, joué, mangé<br>
         • verbes comme finir → <b>-i</b> : fini, choisi, grandi<br>
         • les autres, à retenir : été, eu, fait, dit, pris, mis, appris, écrit, ouvert, vu, pu, voulu, lu, bu, perdu, répondu</p>

      <div class="astuce">💡 <b>é ou er ?</b> Remplace par <b>vendu</b> :<br>
        J’ai <u>vendu</u> ✔ → j’ai chant<b>é</b>. (Si c’est « vendre » qui marche, on écrit -er.)</div>
      <div class="astuce">💡 <b>Une lettre muette à la fin ?</b> Mets le participe au féminin :<br>
        pri<b>s</b>e → pris · écri<b>t</b>e → écrit · fai<b>t</b>e → fait · mi<b>s</b>e → mis</div>
    `,
  });

  // ======================================================================
  // 6. Le passé composé avec être
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-passe-compose-etre',
    temps: 'au passé composé',
    partEcrire: 0.5,
    verbes: ['aller', 'venir', 'partir', 'sortir', 'arriver', 'entrer', 'tomber', 'rester', 'monter',
      'descendre', 'rentrer'],
    genre: () => true,
    conjuguer: (verbe, s) => `${ETRE.present[s.p]} ${accorder(verbe.participe, s)}`,
    formeTableau: formeAvecEtre(ETRE.present),
    expliquer: (verbe, s) =>
      `Avec « ${verbe.infinitif} », le passé composé se fait avec l’auxiliaire <b>être</b> au présent `
      + `(${ETRE.present[s.p]}) + le participe passé <b>${verbe.participe}</b>.`
      + expliquerAccord(s, accorder(verbe.participe, s)),
    distracteurs(verbe, s) {
      const auxiliaire = ETRE.present[s.p];
      const pieges = ['', 'e', 's', 'es'].map(marque => `${auxiliaire} ${verbe.participe}${marque}`);
      if (s.p !== 0) pieges.push(`${AVOIR.present[s.p]} ${verbe.participe}`);
      return pieges;
    },
    titreLecon: 'Le passé composé avec être',
    lecon: `
      <p>Quelques verbes utilisent l’auxiliaire <b>être</b> au lieu de avoir. Ce sont surtout des verbes
        de <b>mouvement</b> : aller, venir, partir, sortir, arriver, entrer, tomber, rester, monter,
        descendre, rentrer.</p>

      <h4>⭐ Avec être, le participe s’accorde avec le sujet !</h4>
      <table>
        <tr><td>je <b>suis</b> allé(e)</td><td>nous <b>sommes</b> allé(e)s</td></tr>
        <tr><td>tu <b>es</b> allé(e)</td><td>vous <b>êtes</b> allé(e)s</td></tr>
        <tr><td>il <b>est</b> allé<br>elle <b>est</b> allé<span class="terminaison">e</span></td>
            <td>ils <b>sont</b> allé<span class="terminaison">s</span><br>elles <b>sont</b> allé<span class="terminaison">es</span></td></tr>
      </table>

      <div class="astuce">💡 <b>+ e</b> si le sujet est féminin, <b>+ s</b> s’il est pluriel :<br>
        <i>Roxy est parti<b>e</b>. Les renards sont parti<b>s</b>. Les renardes sont parti<b>es</b>.</i></div>
      <div class="astuce">💡 Une fille et un garçon ensemble ? C’est le <b>masculin</b> qui l’emporte :
        <i>Léa et Tom sont parti<b>s</b>.</i></div>
    `,
  });

  // ======================================================================
  // 7. Le passé simple (nouveauté de 6e) : surtout avec il / elle et ils / elles
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-passe-simple',
    temps: 'au passé simple',
    personnes: [2, 5],
    verbes: [['être', 2], ['avoir', 2], 'chanter', 'jouer', 'parler', 'marcher', 'regarder', 'manger',
      'commencer', 'arriver', 'finir', 'choisir', 'grandir', 'aller', 'faire', 'dire', 'prendre',
      'venir', 'voir', 'pouvoir', 'vouloir'],
    conjuguer: (verbe, s) => verbe.passeSimple[s.p],
    expliquer(verbe) {
      let texte;
      if (verbe.groupe === 'premier' || verbe.infinitif === 'aller') {
        texte = 'Les verbes en -er font <b>-a</b> avec il / elle / on, et <b>-èrent</b> avec ils / elles.';
      } else if (verbe.groupe === 'deuxieme') {
        texte = 'Les verbes comme finir font <b>-it</b> avec il / elle / on, et <b>-irent</b> avec ils / elles.';
      } else {
        texte = `« ${verbe.infinitif} » est irrégulier au passé simple : il faut le retenir !`;
      }
      if (verbe.infinitif.endsWith('ger')) texte += ' On garde le e devant le a : il mangea.';
      if (verbe.infinitif.endsWith('cer')) texte += ' Le c prend une cédille devant le a : il commença.';
      return texte + ` Ne le confonds pas avec l’imparfait (il ${verbe.imparfait[2]}) !`;
    },
    distracteurs: (verbe, s) => [
      verbe.passeSimple[s.p === 2 ? 5 : 2], verbe.imparfait[s.p], verbe.present[s.p], verbe.futur[s.p],
    ],
    titreLecon: 'Le passé simple',
    lecon: `
      <p>Le passé simple sert surtout dans les <b>histoires</b> et les contes, pour raconter une action
        rapide ou soudaine : <i>Le renard sauta et attrapa la pomme.</i></p>
      <p>En 6e, on l’apprend surtout avec <b>il / elle / on</b> et <b>ils / elles</b>.</p>

      <table>
        <tr><th></th><th>il / elle</th><th>ils / elles</th></tr>
        <tr><td>verbes en -er</td><td>il chant<span class="terminaison">a</span></td><td>ils chant<span class="terminaison">èrent</span></td></tr>
        <tr><td>finir</td><td>il fin<span class="terminaison">it</span></td><td>ils fin<span class="terminaison">irent</span></td></tr>
        <tr><td>être</td><td>il fut</td><td>ils furent</td></tr>
        <tr><td>avoir</td><td>il eut</td><td>ils eurent</td></tr>
        <tr><td>aller</td><td>il alla</td><td>ils allèrent</td></tr>
        <tr><td>faire</td><td>il fit</td><td>ils firent</td></tr>
        <tr><td>dire</td><td>il dit</td><td>ils dirent</td></tr>
        <tr><td>prendre</td><td>il prit</td><td>ils prirent</td></tr>
        <tr><td>voir</td><td>il vit</td><td>ils virent</td></tr>
        <tr><td>venir</td><td>il vint</td><td>ils vinrent</td></tr>
        <tr><td>pouvoir</td><td>il put</td><td>ils purent</td></tr>
        <tr><td>vouloir</td><td>il voulut</td><td>ils voulurent</td></tr>
      </table>

      <div class="astuce">💡 <b>Passé simple ou imparfait ?</b><br>
        <i>Il chantait</i> : ça durait, c’est le décor de l’histoire.<br>
        <i>Il chanta</i> : c’est arrivé d’un coup, l’histoire avance !</div>
      <p>⚠️ il mang<b>e</b>a (on garde le e) · il commen<b>ç</b>a (c devient ç)</p>
    `,
  });

  // ======================================================================
  // 8. Le plus-que-parfait (nouveauté de 6e)
  // ======================================================================
  const avecEtre = verbe => verbe.auxiliaire === 'être';
  // Les erreurs de terminaison les plus fréquentes : « j’avait », « ils avait »…
  const PERSONNE_PIEGE = [2, 2, 0, 4, 3, 2];

  ajouterEtape({
    id: 'conjugaison-plus-que-parfait',
    temps: 'au plus-que-parfait',
    partEcrire: 0.5,
    verbes: ['chanter', 'jouer', 'manger', 'finir', 'choisir', 'faire', 'dire', 'prendre', 'voir',
      'écrire', 'lire', 'mettre', 'aller', 'venir', 'partir', 'arriver', 'tomber', 'rester'],
    genre: avecEtre,
    conjuguer: (verbe, s) => (avecEtre(verbe)
      ? `${ETRE.imparfait[s.p]} ${accorder(verbe.participe, s)}`
      : `${AVOIR.imparfait[s.p]} ${verbe.participe}`),
    formeTableau: (verbe, i) => (avecEtre(verbe)
      ? formeAvecEtre(ETRE.imparfait)(verbe, i)
      : `${AVOIR.imparfait[i]} ${verbe.participe}`),
    expliquer(verbe, s) {
      const auxiliaire = avecEtre(verbe) ? ETRE : AVOIR;
      const participe = avecEtre(verbe) ? accorder(verbe.participe, s) : verbe.participe;
      let texte = `Le plus-que-parfait = l’auxiliaire <b>${avecEtre(verbe) ? 'être' : 'avoir'}</b> à l’<b>imparfait</b> `
        + `(${auxiliaire.imparfait[s.p]}) + le participe passé <b>${verbe.participe}</b>. `
        + `C’est comme le passé composé (${avecPronom(s.pronom, auxiliaire.present[s.p] + ' ' + participe)}), `
        + `mais avec l’auxiliaire à l’imparfait.`;
      if (avecEtre(verbe)) texte += expliquerAccord(s, participe);
      return texte;
    },
    distracteurs(verbe, s) {
      const etre = avecEtre(verbe);
      const auxiliaire = etre ? ETRE : AVOIR;
      const participe = etre ? accorder(verbe.participe, s) : verbe.participe;
      const pieges = [`${auxiliaire.imparfait[PERSONNE_PIEGE[s.p]]} ${participe}`];
      if (!(etre && s.p === 0)) pieges.push(`${auxiliaire.present[s.p]} ${participe}`); // le passé composé
      if (etre) {
        pieges.push(...['', 'e', 's', 'es'].map(marque => `${ETRE.imparfait[s.p]} ${verbe.participe}${marque}`));
      } else {
        pieges.push(`${AVOIR.imparfait[s.p]} ${verbe.infinitif}`, `${ETRE.imparfait[s.p]} ${participe}`);
      }
      return pieges;
    },
    titreLecon: 'Le plus-que-parfait',
    lecon: `
      <p>Le plus-que-parfait raconte une action qui s’est passée <b>avant</b> une autre action passée :
        <i>Quand je suis arrivée, Roxy <b>avait</b> déjà <b>mangé</b> le gâteau !</i></p>
      <p>C’est comme le passé composé, mais l’auxiliaire est à l’<b>imparfait</b>.</p>

      <h4>Avec avoir</h4>
      <table>
        <tr><td>j’<b>avais</b> chanté</td><td>nous <b>avions</b> chanté</td></tr>
        <tr><td>tu <b>avais</b> chanté</td><td>vous <b>aviez</b> chanté</td></tr>
        <tr><td>il <b>avait</b> chanté</td><td>ils <b>avaient</b> chanté</td></tr>
      </table>

      <h4>Avec être (aller, venir, partir…)</h4>
      <table>
        <tr><td>j’<b>étais</b> parti(e)</td><td>nous <b>étions</b> parti(e)s</td></tr>
        <tr><td>tu <b>étais</b> parti(e)</td><td>vous <b>étiez</b> parti(e)s</td></tr>
        <tr><td>il <b>était</b> parti<br>elle <b>était</b> parti<span class="terminaison">e</span></td>
            <td>ils <b>étaient</b> parti<span class="terminaison">s</span><br>elles <b>étaient</b> parti<span class="terminaison">es</span></td></tr>
      </table>

      <div class="astuce">💡 Passé composé : j’<b>ai</b> chanté → plus-que-parfait : j’<b>avais</b> chanté.<br>
        Avec être, on accorde toujours le participe : <i>elle était parti<b>e</b></i>.</div>
    `,
  });

  // ======================================================================
  // 9. L'impératif (nouveauté de 6e) : pas de sujet, seulement tu, nous, vous
  // ======================================================================
  ajouterEtape({
    id: 'conjugaison-imperatif',
    temps: 'à l’impératif',
    personnes: [1, 3, 4],
    sansSujet: true,
    verbes: [['être', 2], ['avoir', 2], 'chanter', 'jouer', 'écouter', 'regarder', 'manger', 'ranger',
      'commencer', 'finir', 'choisir', 'obéir', ['aller', 2], ['faire', 2], 'dire', 'prendre', 'venir'],
    precision: s => ({
      1: '💬 On parle à une seule personne.',
      3: '💬 On parle à un groupe dont on fait partie.',
      4: '💬 On parle à plusieurs personnes.',
    })[s.p],
    conjuguer: (verbe, s) => verbe.imperatif[s.p],
    expliquer(verbe, s, forme) {
      const texte = 'À l’impératif, on donne un ordre ou un conseil. Il n’y a <b>pas de sujet</b>, '
        + 'et seulement 3 personnes : tu, nous, vous. ';
      if (verbe.groupe === 'etre-avoir') return texte + `« ${verbe.infinitif} » est irrégulier : il faut le retenir !`;
      if (s.p === 1 && (verbe.groupe === 'premier' || verbe.infinitif === 'aller')) {
        return texte + `Attention : avec « tu », les verbes en -er (et aller) n’ont <b>pas de s</b> : ${forme} ! `
          + `(Au présent, on écrit « tu ${verbe.present[1]} ».)`;
      }
      return texte + `C’est comme au présent, sans le sujet : ${PRONOMS[s.p]} ${verbe.present[s.p]} → <b>${forme}</b> !`;
    },
    distracteurs: (verbe, s) => [
      verbe.present[s.p], verbe.present[1], verbe.present[2], ...[1, 3, 4].map(i => verbe.imperatif[i]),
    ],
    titreLecon: 'L’impératif',
    lecon: `
      <p>L’impératif sert à donner un <b>ordre</b>, un <b>conseil</b> ou une consigne :
        <i>Range ta chambre ! Écoutons Roxy !</i></p>
      <p>Il n’y a <b>pas de sujet</b>, et seulement 3 personnes : tu, nous, vous.</p>

      <table>
        <tr><th></th><th>(tu)</th><th>(nous)</th><th>(vous)</th></tr>
        <tr><td>chanter</td><td>chant<span class="terminaison">e</span> !</td><td>chantons !</td><td>chantez !</td></tr>
        <tr><td>finir</td><td>finis !</td><td>finissons !</td><td>finissez !</td></tr>
        <tr><td>aller</td><td>va !</td><td>allons !</td><td>allez !</td></tr>
        <tr><td>faire</td><td>fais !</td><td>faisons !</td><td>faites !</td></tr>
        <tr><td>prendre</td><td>prends !</td><td>prenons !</td><td>prenez !</td></tr>
        <tr><td>être</td><td>sois !</td><td>soyons !</td><td>soyez !</td></tr>
        <tr><td>avoir</td><td>aie !</td><td>ayons !</td><td>ayez !</td></tr>
      </table>

      <div class="astuce">💡 Avec <b>tu</b>, les verbes en -er n’ont <b>pas de s</b> :
        <i>Chante ! Mange ! Écoute !</i> Et aussi : <i>Va !</i><br>
        (Au présent, on écrit pourtant « tu chantes ».)</div>
      <div class="astuce">💡 Pour les autres verbes, c’est comme au présent, sans le sujet :
        tu finis → <i>Finis !</i> · vous faites → <i>Faites !</i></div>
    `,
  });
})();
