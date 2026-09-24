// Renard Malin — la course de Roxy : le petit jeu en 3D au bout de chaque forêt
//
// Roxy court sur le chemin de la forêt, dans le décor de la saison du niveau.
// On change de voie en glissant le doigt (ou avec les flèches), on saute par-dessus les troncs,
// on ramasse les étoiles… et quand une question arrive, on passe par la bonne porte !
// La 3D est dessinée avec Three.js, qu'on ne charge qu'au moment de lancer la course.

(function () {
  const $ = id => document.getElementById(id);
  const P = RM.progression;
  const ADRESSE_THREE = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

  // ======================================================================
  // Les réglages de la course
  // ======================================================================
  const VOIES = [-2.2, 0, 2.2];                    // les trois voies du chemin : gauche, milieu, droite
  const LONGUEUR = 1100;                            // la distance jusqu'à la ligne d'arrivée
  const PORTES = [160, 310, 460, 610, 760, 910];    // où se trouvent les portes des questions
  const RALENTI_QUESTION = 0.7;    // devant une porte, Roxy ralentit : on a le temps de lire
  const DISTANCE_QUESTION = 75;    // la question s'affiche quand la porte est à cette distance
  const VUE = 110;                 // jusqu'où l'on voit les objets devant Roxy
  const BONUS_PORTE = 5;           // les étoiles gagnées en passant par la bonne porte
  const PERTE_TRONC = 3;           // les étoiles perdues en trébuchant sur un tronc
  const DUREE_SAUT = 0.75;         // en secondes
  const HAUTEUR_SAUT = 2.2;

  // Chaque forêt a sa saison, comme sur la carte : printemps, automne, hiver, nuit étoilée
  const SAISONS = {
    '6e': {
      ciel: '#BDE5FF', herbe: '#8CCB6E', tache: '#78BA5C', chemin: '#EAD7AE', bord: '#D2B98A',
      feuillages: ['#63B45A', '#4FA052', '#F4A6C6', '#F8BFD6'], sapin: '#3E8C57', tronc: '#8A5A3B',
      particules: { couleur: '#F7B3CE', nombre: 140, chute: 1.1, taille: 0.3 },
    },
    '5e': {
      ciel: '#FFE2B8', herbe: '#C9A04E', tache: '#B68C40', chemin: '#E5CDA0', bord: '#C4A06A',
      feuillages: ['#E9772E', '#D6532C', '#F2B535', '#C0632B'], sapin: '#5E7F3E', tronc: '#7A4E33',
      particules: { couleur: '#E27A2E', nombre: 120, chute: 1.4, taille: 0.34 },
    },
    '4e': {
      ciel: '#DCEAF4', herbe: '#F3F7FA', tache: '#DCE7EF', chemin: '#D3DFE9', bord: '#B4C7D6',
      feuillages: ['#F7FAFC', '#E6EEF4'], sapin: '#2E6B52', tronc: '#6B4A36', neige: true,
      particules: { couleur: '#FFFFFF', nombre: 260, chute: 2.2, taille: 0.22 },
    },
    '3e': {
      ciel: '#1A2347', herbe: '#22385E', tache: '#1C2F50', chemin: '#4A567E', bord: '#39446A',
      feuillages: ['#2F5A6E', '#27495C'], sapin: '#1F4A4A', tronc: '#3E2E2A', nuit: true,
      particules: { couleur: '#FFE680', nombre: 90, chute: 0, taille: 0.3, lucioles: true },
    },
  };

  // ======================================================================
  // Quand la course s'ouvre
  // ======================================================================
  // Il faut autant d'étoiles que si l'on avait réussi toute la forêt : 3 étoiles par étape
  // (une forêt : « 6e » pour le français de 6e, « 6e-maths » pour les maths de 6e…)
  const etapesDe = foret => RM.FORETS[foret].filter(zone => !zone.bientot).flatMap(zone => zone.etapes);
  const etoilesPourOuvrir = foret => etapesDe(foret).length * P.ETOILES_POUR_DEBLOQUER;
  const estOuverte = (profil, foret) => RM.etoilesForet(profil, foret).gagnees >= etoilesPourOuvrir(foret);
  // « la forêt de 6e 🌸 », ou « la forêt des maths de 6e 🌸 »
  function nomDeLaForet(foret) {
    const { niveau, matiere } = RM.infosForet(foret);
    return `la forêt ${matiere.id === 'maths' ? 'des maths ' : ''}de ${niveau.nom}&nbsp;${niveau.saison}`;
  }

  // Le bloc de la course, tout en bas de la carte
  function htmlCarte(profil, foret) {
    const { gagnees } = RM.etoilesForet(profil, foret);
    const seuil = etoilesPourOuvrir(foret);
    const infos = P.courseDe(profil, foret);
    const contenu = gagnees >= seuil
      ? `<p class="course-texte">Roxy t’attend sur la ligne de départ&nbsp;! Ramasse les étoiles et passe par les bonnes portes.</p>
        <button class="bouton bouton-principal" data-course="${foret}">🏁 Jouer à la course</button>
        ${infos ? `<p class="course-record">🏅 Diplôme obtenu · record&nbsp;: <b>${infos.meilleur}&nbsp;⭐</b></p>` : ''}`
      : `<p class="course-texte">🔒 Gagne <b>${seuil}&nbsp;étoiles</b> dans cette forêt pour ouvrir la course.
          <small>C’est comme réussir toutes les étapes avec 3&nbsp;étoiles.</small></p>
        <div class="course-jauge" aria-hidden="true"><span style="width:${Math.min(100, Math.round(gagnees / seuil * 100))}%"></span></div>
        <p class="course-total">★ ${gagnees} / ${seuil}</p>`;
    return `
      <section class="zone zone-course" id="zone-course">
        <header class="zone-entete">
          <span class="zone-icone">🏁</span>
          <div><h3>La course de Roxy</h3><p>Le grand jeu de ${nomDeLaForet(foret)}</p></div>
        </header>
        <div class="course-contenu">${contenu}</div>
      </section>`;
  }

  // Le bloc de la course dans l'espace parent, avec un bouton pour l'essayer
  function htmlParent(profil, foret) {
    const { gagnees } = RM.etoilesForet(profil, foret);
    const seuil = etoilesPourOuvrir(foret);
    const infos = P.courseDe(profil, foret);
    const { niveau, matiere } = RM.infosForet(foret);
    const etat = gagnees >= seuil
      ? '✅ Ouverte'
      : `🔒 Fermée : ★ ${gagnees} / ${seuil} étoiles (il en faut 3 par étape)`;
    const bilan = infos
      ? `${infos.parties} course${infos.parties > 1 ? 's' : ''} · record ${infos.meilleur} ⭐`
        + ` · meilleur score aux portes ${infos.meilleuresPortes}/${PORTES.length}`
      : 'Pas encore jouée.';
    return `<section class="carte bloc-parent bloc-course">
      <h3>🏁 La course de Roxy (${niveau.nom}, ${matiere.icone} ${matiere.nom})</h3>
      <p class="course-etat">${etat}</p>
      <p class="bloc-sous-titre">${bilan}</p>
      <button class="bouton-reglage" data-course-essai="${foret}">▶️ Essayer la course</button>
      <p class="bloc-sous-titre">Un essai n’enregistre rien : c’est pour découvrir le jeu.</p>
    </section>`;
  }

  // ======================================================================
  // Les questions des portes : prises dans les étapes de la forêt
  // ======================================================================
  const texteSeul = html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent.replace(/\s+/g, ' ').trim();
  };

  // Des questions à choix, courtes, qui tiennent sur des panneaux de porte (3 portes au plus)
  // (pas de figure : elle serait trop petite pendant la course)
  function questionsPourLaCourse(foret, nombre = PORTES.length) {
    const etapes = RM.melanger(etapesDe(foret).filter(e => typeof e.creerQuestions === 'function'));
    const choisies = [];
    const dejaVues = new Set();
    for (let essai = 0; essai < 80 * nombre && choisies.length < nombre; essai++) {
      const etape = etapes[essai % etapes.length];
      // D'abord une question par étape, pour que ce soit varié
      if (essai < 30 * nombre && choisies.some(q => q.etape === etape)) continue;
      const q = etape.creerQuestions(1)[0];
      if (q.type !== 'choix' || !q.choix || q.choix.length < 2 || q.enonce.includes('<svg')) continue;
      if (q.choix.some(c => c.length > 16)) continue;
      const enonce = texteSeul(q.enonce);
      if (!enonce || enonce.length > 90 || dejaVues.has(enonce)) continue;
      dejaVues.add(enonce);
      let choix = q.choix;
      if (choix.length > 3) { // la bonne réponse et deux pièges, dans l'ordre des boutons
        const garder = new Set([q.reponse, ...RM.melanger(choix.filter(c => c !== q.reponse)).slice(0, 2)]);
        choix = choix.filter(c => garder.has(c));
      }
      choisies.push({ ...q, choix, etape });
    }
    return choisies;
  }

  // ======================================================================
  // L'écran de la course
  // ======================================================================
  let T = null;     // Three.js, une fois chargé
  let jeu = null;   // la course en cours

  // essai : on joue sans rien enregistrer ; retour : l'écran où l'on revient après la course
  async function lancer(foret, { essai = false, retour = essai ? 'parent' : 'carte' } = {}) {
    arreter();
    const profil = P.profilActif();
    jeu = {
      foret,
      options: { essai, retour }, // pour « Rejouer »
      essai: essai || !profil,
      prenom: profil ? profil.prenom : 'Renard malin',
      retour,
      etat: 'chargement',
    };
    const courseActuelle = jeu;
    const { niveau: n, matiere } = RM.infosForet(foret);
    $('course-depart-titre').textContent = `La course de Roxy · ${n.nom} ${n.saison}${matiere.id === 'maths' ? ' · 🔢 Maths' : ''}`;
    const infos = profil && !essai ? P.courseDe(profil, foret) : null;
    $('course-depart-record').innerHTML = infos ? `🏅 Ton record&nbsp;: <b>${infos.meilleur}&nbsp;⭐</b>` : '';
    $('course-depart-essai').hidden = !jeu.essai;
    $('course-partir').disabled = true;
    $('course-partir').textContent = 'Roxy lace ses baskets… ⏳';
    montrerPanneau('course-depart');
    $('course-etoiles').textContent = '⭐ 0';
    $('course-barre').style.width = '0%';
    $('course-question').hidden = true;
    $('course-message').hidden = true;
    document.body.classList.add('en-course');
    RM.afficherEcran('course');

    try {
      T = T || await import(ADRESSE_THREE);
      await document.fonts.load('600 48px Fredoka').catch(() => {});
    } catch (e) {
      return montrerErreur('La course a besoin d’internet pour se charger. Vérifie la connexion, puis réessaie&nbsp;!');
    }
    if (jeu !== courseActuelle) return; // on a quitté pendant le chargement
    try {
      construireMonde(foret);
    } catch (e) {
      return montrerErreur('Cet appareil n’arrive pas à dessiner la 3D. Désolée&nbsp;!');
    }
    jeu.etat = 'depart';
    $('course-partir').disabled = false;
    $('course-partir').textContent = 'C’est parti ! 🏁';
    jeu.avant = performance.now();
    jeu.raf = requestAnimationFrame(boucle);
  }

  function montrerPanneau(id) {
    ['course-depart', 'course-fin', 'course-erreur', 'course-pause'].forEach(p => { $(p).hidden = p !== id; });
  }

  function montrerErreur(html) {
    $('course-erreur-texte').innerHTML = html;
    montrerPanneau('course-erreur');
  }

  // On range tout : la boucle s'arrête et la 3D libère la mémoire de l'iPad
  function arreter() {
    if (!jeu) return;
    cancelAnimationFrame(jeu.raf);
    clearTimeout(jeu.minuteurMessage);
    if (jeu.monde) {
      jeu.monde.scene.traverse(objet => {
        objet.geometry?.dispose();
        [].concat(objet.material || []).forEach(m => { m.map?.dispose(); m.dispose(); });
      });
      jeu.monde.rendu.dispose();
      jeu.monde.rendu.domElement.remove();
    }
    document.body.classList.remove('en-course');
    jeu = null;
  }

  function quitter() {
    const retour = jeu ? jeu.retour : 'carte';
    arreter();
    RM.afficherEcran(retour);
  }

  // ======================================================================
  // Le monde en 3D
  // ======================================================================
  const aleatoire = (min, max) => min + Math.random() * (max - min);
  const auHasard = liste => liste[Math.floor(Math.random() * liste.length)];

  function textureDeCanvas(canvas, repetition) {
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    if (repetition) {
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.repeat.set(repetition[0], repetition[1]);
    }
    texture.anisotropy = 4;
    return texture;
  }

  function nouveauCanvas(largeur, hauteur) {
    const canvas = document.createElement('canvas');
    canvas.width = largeur;
    canvas.height = hauteur;
    return [canvas, canvas.getContext('2d')];
  }

  // Le chemin : trois voies séparées par des pointillés, des bords plus foncés et quelques cailloux
  function textureChemin(saison) {
    const [canvas, c] = nouveauCanvas(128, 256);
    c.fillStyle = saison.chemin;
    c.fillRect(0, 0, 128, 256);
    c.fillStyle = saison.bord;
    c.fillRect(0, 0, 9, 256);
    c.fillRect(119, 0, 9, 256);
    c.globalAlpha = 0.45;
    c.fillStyle = '#FFFFFF';
    [128 / 3, 256 / 3].forEach(x => { for (let y = 10; y < 256; y += 64) c.fillRect(x - 2, y, 4, 34); });
    c.globalAlpha = 0.25;
    c.fillStyle = saison.bord;
    for (let i = 0; i < 26; i++) {
      c.beginPath();
      c.arc(aleatoire(14, 114), aleatoire(0, 256), aleatoire(1.5, 3.5), 0, Math.PI * 2);
      c.fill();
    }
    return textureDeCanvas(canvas, [1, 260 / 8]);
  }

  // L'herbe (ou la neige) : des petites touffes qui défilent et donnent l'impression de vitesse
  function textureHerbe(saison) {
    const [canvas, c] = nouveauCanvas(128, 128);
    c.fillStyle = saison.herbe;
    c.fillRect(0, 0, 128, 128);
    c.fillStyle = saison.tache;
    for (let i = 0; i < 40; i++) {
      c.beginPath();
      c.ellipse(aleatoire(0, 128), aleatoire(0, 128), aleatoire(2, 6), aleatoire(1, 3), 0, 0, Math.PI * 2);
      c.fill();
    }
    return textureDeCanvas(canvas, [90 / 10, 260 / 10]);
  }

  // Un petit rond flou, pour que les particules soient rondes (et pas carrées)
  function textureRond() {
    const [canvas, c] = nouveauCanvas(64, 64);
    const degrade = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    degrade.addColorStop(0, 'rgba(255,255,255,1)');
    degrade.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    degrade.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = degrade;
    c.fillRect(0, 0, 64, 64);
    return textureDeCanvas(canvas);
  }

  // Un rectangle aux coins arrondis (c.roundRect n'existe pas sur les iPad un peu anciens)
  function rectangleArrondi(c, x, y, l, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + l, y, x + l, y + h, r);
    c.arcTo(x + l, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + l, y, r);
    c.closePath();
  }

  // Un panneau avec un mot : les portes des questions
  function dessinerPanneau(canvas, texte, { fond = '#FFF7EC', bord = '#F28C28', couleur = '#5A3521' } = {}) {
    const c = canvas.getContext('2d');
    const { width: l, height: h } = canvas;
    c.clearRect(0, 0, l, h);
    c.fillStyle = fond;
    c.strokeStyle = bord;
    c.lineWidth = 12;
    rectangleArrondi(c, 8, 8, l - 16, h - 16, 28);
    c.fill();
    c.stroke();
    c.fillStyle = couleur;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    let taille = 74;
    do {
      c.font = `600 ${taille}px Fredoka, Nunito, sans-serif`;
      taille -= 4;
    } while (c.measureText(texte).width > l - 48 && taille > 24);
    c.fillText(texte, l / 2, h / 2 + 4);
  }

  function construireMonde(foret) {
    const niveau = RM.infosForet(foret).niveau.id;
    const saison = SAISONS[niveau];
    const conteneur = $('course-scene');
    const rendu = new T.WebGLRenderer({ antialias: true });
    rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    conteneur.appendChild(rendu.domElement);

    const scene = new T.Scene();
    scene.background = new T.Color(saison.ciel);
    scene.fog = new T.Fog(saison.ciel, 38, VUE);
    const camera = new T.PerspectiveCamera(60, 1, 0.1, 220);

    // La lumière : le ciel et le soleil (ou la lune)
    scene.add(new T.HemisphereLight(saison.nuit ? '#7C8CC8' : '#FFFFFF', saison.nuit ? '#1A2340' : '#A08C68', saison.nuit ? 1.6 : 2.2));
    const soleil = new T.DirectionalLight(saison.nuit ? '#B8C8FF' : '#FFF4E0', saison.nuit ? 1.2 : 1.8);
    soleil.position.set(-5, 12, 6);
    scene.add(soleil);

    // Le sol : l'herbe, puis le chemin par-dessus
    const texHerbe = textureHerbe(saison);
    const herbe = new T.Mesh(new T.PlaneGeometry(90, 260), new T.MeshLambertMaterial({ map: texHerbe }));
    herbe.rotation.x = -Math.PI / 2;
    herbe.position.set(0, -0.02, -110);
    const texChemin = textureChemin(saison);
    const chemin = new T.Mesh(new T.PlaneGeometry(7.4, 260), new T.MeshLambertMaterial({ map: texChemin }));
    chemin.rotation.x = -Math.PI / 2;
    chemin.position.set(0, 0, -110);
    scene.add(herbe, chemin);

    // Les formes et les couleurs qu'on réutilise (c'est plus léger pour l'iPad)
    const geo = {
      cone: new T.ConeGeometry(1, 1.4, 8),
      cylindre: new T.CylinderGeometry(1, 1, 1, 8),
      tronc: new T.CylinderGeometry(0.36, 0.36, 1.8, 14),
      boule: new T.IcosahedronGeometry(1, 1),
      sphere: new T.SphereGeometry(1, 16, 12),
      etoile: geometrieEtoile(),
      rond: new T.CircleGeometry(1, 20),
    };
    const lambert = couleur => new T.MeshLambertMaterial({ color: couleur, flatShading: true });
    const mat = {
      tronc: lambert(saison.tronc),
      sapin: lambert(saison.sapin),
      neige: lambert('#FFFFFF'),
      feuillages: saison.feuillages.map(lambert),
      bois: lambert('#8A5A3B'),
      boisClair: lambert('#D9B38C'),
      etoile: new T.MeshLambertMaterial({ color: '#FFC23D', emissive: '#8A5A00', emissiveIntensity: saison.nuit ? 1.2 : 0.5 }),
      poteau: lambert('#F28C28'),
      ombre: new T.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.18, depthWrite: false }),
    };

    // Les arbres de chaque côté du chemin (ils reviennent au fond quand Roxy les a dépassés)
    const arbres = [];
    for (let i = 0; i < 46; i++) {
      const arbre = creerArbre(saison, geo, mat);
      placerArbre(arbre, aleatoire(-VUE - 10, 3));
      scene.add(arbre);
      arbres.push(arbre);
    }

    // La nuit : des étoiles dans le ciel et la lune
    if (saison.nuit) {
      const positions = [];
      for (let i = 0; i < 260; i++) positions.push(aleatoire(-120, 120), aleatoire(12, 70), aleatoire(-190, -150));
      const geoCiel = new T.BufferGeometry();
      geoCiel.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      scene.add(new T.Points(geoCiel, new T.PointsMaterial({ color: '#FFFFFF', size: 0.9, map: textureRond(), transparent: true, depthWrite: false, fog: false })));
      const lune = new T.Mesh(geo.sphere, new T.MeshBasicMaterial({ color: '#FFF3C4', fog: false }));
      lune.scale.setScalar(7);
      lune.position.set(-40, 42, -170);
      scene.add(lune);
    }

    const particules = creerParticules(saison);
    scene.add(particules);

    // Roxy et son ombre (la nuit, une petite lanterne la suit pour qu'on la voie bien)
    const roxy = creerRoxy();
    if (saison.nuit) {
      const lanterne = new T.PointLight('#FFD9A0', 9, 10, 1);
      lanterne.position.set(0, 2.6, 1.6);
      roxy.add(lanterne);
    }
    const ombre = new T.Mesh(geo.rond, mat.ombre);
    ombre.rotation.x = -Math.PI / 2;
    ombre.position.y = 0.02;
    ombre.scale.setScalar(0.62);
    scene.add(roxy, ombre);

    // Le parcours : les étoiles, les troncs, les portes et l'arrivée
    const questions = questionsPourLaCourse(foret);
    const monde = { rendu, scene, camera, saison, geo, mat, arbres, particules, roxy, ombre, texHerbe, texChemin };
    jeu.monde = monde;
    jeu.questions = questions;
    jeu.aVenir = construireParcours(questions);
    jeu.actifs = [];
    Object.assign(jeu, {
      parcouru: 0, vitesse: 0, voie: 1, x: 0, y: 0, saut: -1, invincible: 0, trebuche: 0,
      etoiles: 0, bonnes: 0, portesPassees: 0, temps: 0, animation: 0, premierTronc: true,
    });
    const indexNiveau = RM.NIVEAUX.findIndex(n => n.id === niveau);
    jeu.vitesseDepart = 11 + indexNiveau * 0.5;   // un peu plus vite à chaque niveau
    jeu.vitesseArrivee = 15 + indexNiveau * 0.8;
    roxy.rotation.y = Math.PI; // au départ, Roxy nous regarde
    redimensionner();
  }

  function placerArbre(arbre, z) {
    const cote = Math.random() < 0.5 ? -1 : 1;
    arbre.position.set(cote * aleatoire(6.2, 20), 0, z);
    arbre.rotation.y = aleatoire(0, Math.PI * 2);
  }

  function creerArbre(saison, geo, mat) {
    const arbre = new T.Group();
    const sapin = saison.neige || saison.nuit ? Math.random() < 0.7 : Math.random() < 0.4;
    const tronc = new T.Mesh(geo.cylindre, mat.tronc);
    if (sapin) {
      tronc.scale.set(0.22, 0.8, 0.22);
      tronc.position.y = 0.4;
      arbre.add(tronc);
      for (let i = 0; i < 3; i++) {
        const etage = new T.Mesh(geo.cone, mat.sapin);
        const r = 1.35 - i * 0.32;
        etage.scale.set(r, 1.1, r);
        etage.position.y = 1.3 + i * 0.8;
        arbre.add(etage);
      }
      if (saison.neige) {
        const chapeau = new T.Mesh(geo.cone, mat.neige);
        chapeau.scale.set(0.5, 0.5, 0.5);
        chapeau.position.y = 3.2;
        arbre.add(chapeau);
      }
    } else {
      tronc.scale.set(0.2, 1.5, 0.2);
      tronc.position.y = 0.75;
      arbre.add(tronc);
      const feuillage = auHasard(mat.feuillages);
      [[0, 2.3, 0, 1.25], [0.6, 1.9, 0.2, 0.8], [-0.55, 2, -0.2, 0.85]].forEach(([x, y, z, r]) => {
        const boule = new T.Mesh(geo.boule, feuillage);
        boule.position.set(x, y, z);
        boule.scale.setScalar(r);
        arbre.add(boule);
      });
    }
    arbre.scale.setScalar(aleatoire(0.8, 1.5));
    return arbre;
  }

  // Les pétales, les feuilles, les flocons ou les lucioles
  function creerParticules(saison) {
    const { nombre, couleur, taille } = saison.particules;
    const positions = new Float32Array(nombre * 3);
    for (let i = 0; i < nombre; i++) {
      positions[i * 3] = aleatoire(-22, 22);
      positions[i * 3 + 1] = aleatoire(0.3, 14);
      positions[i * 3 + 2] = aleatoire(-70, 8);
    }
    const geometrie = new T.BufferGeometry();
    geometrie.setAttribute('position', new T.BufferAttribute(positions, 3));
    const matiere = new T.PointsMaterial({
      color: couleur, size: taille, map: textureRond(), transparent: true, depthWrite: false,
      opacity: saison.particules.lucioles ? 0.95 : 0.85,
    });
    return new T.Points(geometrie, matiere);
  }

  function geometrieEtoile() {
    const forme = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.42 : 0.18;
      const angle = i / 10 * Math.PI * 2 + Math.PI / 2;
      if (i === 0) forme.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else forme.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    forme.closePath();
    const geometrie = new T.ExtrudeGeometry(forme, {
      depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 1,
    });
    geometrie.center();
    return geometrie;
  }

  // Roxy en 3D : une petite renarde toute ronde, avec son foulard rouge
  function creerRoxy() {
    const roxy = new T.Group();
    const lisse = couleur => new T.MeshLambertMaterial({ color: couleur });
    const orange = lisse('#F28C28');
    const creme = lisse('#FFF1DC');
    const brun = lisse('#5A3521');
    const rouge = lisse('#E5604E');
    const noir = lisse('#2B1B12');
    const boule = new T.SphereGeometry(1, 20, 16);
    const morceau = (geometrie, matiere, [x, y, z], [sx, sy, sz] = [1, 1, 1]) => {
      const m = new T.Mesh(geometrie, matiere);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      return m;
    };

    const corps = new T.Group(); // tout ce qui rebondit en courant
    corps.add(morceau(boule, orange, [0, 0.62, 0.05], [0.42, 0.38, 0.55]));
    corps.add(morceau(boule, creme, [0, 0.55, -0.3], [0.26, 0.26, 0.22]));
    // La tête, le museau, la truffe et les yeux (Roxy regarde vers l'avant : -z)
    corps.add(morceau(boule, orange, [0, 1.12, -0.32], [0.4, 0.37, 0.37]));
    corps.add(morceau(boule, creme, [0, 1.02, -0.62], [0.18, 0.14, 0.2]));
    corps.add(morceau(boule, noir, [0, 1.06, -0.8], [0.055, 0.05, 0.05]));
    [-0.15, 0.15].forEach(x => {
      corps.add(morceau(boule, noir, [x, 1.2, -0.64], [0.06, 0.07, 0.04]));
      corps.add(morceau(boule, lisse('#FFFFFF'), [x + 0.02, 1.23, -0.68], [0.02, 0.02, 0.02]));
      corps.add(morceau(boule, lisse('#F7A0A6'), [x * 1.6, 1.04, -0.56], [0.07, 0.04, 0.03]));
    });
    // Les oreilles
    const oreille = new T.ConeGeometry(0.16, 0.36, 4);
    [-0.22, 0.22].forEach(x => {
      const o = morceau(oreille, orange, [x, 1.5, -0.3]);
      o.rotation.z = -x * 0.9;
      corps.add(o);
      const bout = morceau(oreille, brun, [x * 1.1, 1.62, -0.3], [0.45, 0.4, 0.45]);
      bout.rotation.z = -x * 0.9;
      corps.add(bout);
    });
    // Le foulard rouge
    const foulard = morceau(new T.TorusGeometry(0.3, 0.07, 8, 20), rouge, [0, 0.86, -0.22]);
    foulard.rotation.x = Math.PI / 2 - 0.3;
    corps.add(foulard);
    roxy.add(corps);

    // La queue, bien touffue, avec le bout blanc
    const queue = new T.Group();
    queue.position.set(0, 0.7, 0.5);
    queue.add(morceau(boule, orange, [0, 0.2, 0.3], [0.22, 0.22, 0.45]));
    queue.add(morceau(boule, creme, [0, 0.36, 0.7], [0.15, 0.15, 0.18]));
    queue.rotation.x = -0.5;
    roxy.add(queue);

    // Les quatre pattes
    const patte = new T.CylinderGeometry(0.07, 0.06, 0.4, 8);
    const pattes = [[-0.2, -0.25], [0.2, -0.25], [-0.2, 0.3], [0.2, 0.3]].map(([x, z]) => {
      const p = new T.Group();
      p.position.set(x, 0.42, z);
      p.add(morceau(patte, brun, [0, -0.2, 0]));
      roxy.add(p);
      return p;
    });

    roxy.userData = { corps, queue, pattes };
    return roxy;
  }

  // Le parcours est tiré au hasard à chaque course : des files d'étoiles, des troncs, des arcs à sauter
  function construireParcours(questions) {
    const objets = [];
    questions.forEach((question, i) => objets.push({ d: PORTES[i], type: 'porte', question }));
    objets.push({ d: LONGUEUR, type: 'arrivee' });
    const presDUnePorte = d => PORTES.slice(0, questions.length).some(p => d > p - 48 && d < p + 10);
    const voieAuHasard = () => Math.floor(Math.random() * 3);
    let d = 45;
    while (d < LONGUEUR - 40) {
      if (presDUnePorte(d)) { d += 6; continue; }
      const tirage = Math.random();
      if (d < 110 || tirage < 0.4) {
        // Une file de 5 étoiles
        const voie = voieAuHasard();
        for (let k = 0; k < 5; k++) objets.push({ d: d + k * 2.4, type: 'etoile', voie, y: 0.95 });
        d += 16;
      } else if (tirage < 0.68) {
        // Un tronc… et parfois des étoiles au-dessus : il faut sauter pour les attraper
        const voie = voieAuHasard();
        objets.push({ d, type: 'tronc', voie });
        if (Math.random() < 0.6) objets.push({ d, type: 'etoile', voie, y: 2.7 });
        d += 16;
      } else if (tirage < 0.84 && d > 300) {
        // Deux troncs : une seule voie libre (ou on saute !)
        const libre = voieAuHasard();
        [0, 1, 2].filter(v => v !== libre).forEach(voie => objets.push({ d, type: 'tronc', voie }));
        objets.push({ d, type: 'etoile', voie: libre, y: 0.95 });
        d += 18;
      } else {
        // Un arc d'étoiles
        const voie = voieAuHasard();
        for (let k = 0; k < 5; k++) objets.push({ d: d + k * 1.8, type: 'etoile', voie, y: 0.95 + Math.sin(k / 4 * Math.PI) * 1.8 });
        d += 14;
      }
      d += aleatoire(6, 14);
    }
    return objets.sort((a, b) => a.d - b.d);
  }

  // ---------- Fabriquer les objets quand ils arrivent au bout du chemin ----------
  function creerObjet(objet) {
    const { geo, mat, scene } = jeu.monde;
    let maille;
    if (objet.type === 'etoile') {
      maille = new T.Mesh(geo.etoile, mat.etoile);
      maille.position.set(VOIES[objet.voie], objet.y, 0);
    } else if (objet.type === 'tronc') {
      maille = new T.Group();
      const bois = new T.Mesh(geo.tronc, mat.bois);
      bois.rotation.z = Math.PI / 2;
      maille.add(bois);
      [-0.9, 0.9].forEach(x => {
        const bout = new T.Mesh(geo.rond, mat.boisClair);
        bout.scale.setScalar(0.34);
        bout.position.x = x * 1.01;
        bout.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
        maille.add(bout);
      });
      maille.position.set(VOIES[objet.voie], 0.36, 0);
    } else if (objet.type === 'porte') {
      maille = creerPorte(objet);
    } else if (objet.type === 'arrivee') {
      maille = creerArrivee();
    }
    scene.add(maille);
    objet.maille = maille;
    jeu.actifs.push(objet);
  }

  // Une porte par réponse : 2 réponses → à gauche et à droite (un buisson au milieu), 3 réponses → une par voie
  function creerPorte(objet) {
    const { geo, mat } = jeu.monde;
    const { choix } = objet.question;
    const voies = choix.length === 2 ? [0, 2] : [0, 1, 2];
    objet.reponses = [null, null, null];
    objet.panneaux = [];
    const groupe = new T.Group();
    choix.forEach((mot, i) => {
      const voie = voies[i];
      objet.reponses[voie] = mot;
      const x = VOIES[voie];
      [-0.95, 0.95].forEach(dx => {
        const poteau = new T.Mesh(geo.cylindre, mat.poteau);
        poteau.scale.set(0.08, 3.1, 0.08);
        poteau.position.set(x + dx, 1.55, 0);
        groupe.add(poteau);
      });
      const [canvas] = nouveauCanvas(256, 128);
      dessinerPanneau(canvas, mot);
      const texture = textureDeCanvas(canvas);
      const panneau = new T.Mesh(new T.PlaneGeometry(1.95, 0.98), new T.MeshBasicMaterial({ map: texture, transparent: true, side: T.DoubleSide }));
      panneau.position.set(x, 2.85, 0);
      groupe.add(panneau);
      objet.panneaux[voie] = { canvas, texture, mot };
    });
    if (choix.length === 2) {
      // Un buisson au milieu : il faut choisir une porte !
      [[-0.45, 0.45, 0.55], [0.4, 0.4, 0.5], [0, 0.7, 0.5]].forEach(([dx, y, r]) => {
        const b = new T.Mesh(geo.boule, jeu.monde.mat.feuillages[0]);
        b.position.set(dx, y, 0);
        b.scale.setScalar(r);
        groupe.add(b);
      });
    }
    return groupe;
  }

  function creerArrivee() {
    const { geo, mat } = jeu.monde;
    const groupe = new T.Group();
    [-3.9, 3.9].forEach(x => {
      const poteau = new T.Mesh(geo.cylindre, mat.poteau);
      poteau.scale.set(0.12, 3.8, 0.12);
      poteau.position.set(x, 1.9, 0);
      groupe.add(poteau);
    });
    const [canvas, c] = nouveauCanvas(512, 96);
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 6; j++) {
        c.fillStyle = (i + j) % 2 ? '#FFFFFF' : '#2B1B12';
        c.fillRect(i * 16, j * 16, 16, 16);
      }
    }
    c.fillStyle = '#F28C28';
    rectangleArrondi(c, 150, 12, 212, 72, 20);
    c.fill();
    c.fillStyle = '#FFFFFF';
    c.font = '600 52px Fredoka, Nunito, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('ARRIVÉE', 256, 50);
    const banderole = new T.Mesh(new T.PlaneGeometry(7.8, 1.46), new T.MeshBasicMaterial({ map: textureDeCanvas(canvas), side: T.DoubleSide }));
    banderole.position.set(0, 3.5, 0);
    groupe.add(banderole);
    return groupe;
  }

  // ======================================================================
  // La boucle du jeu : 60 fois par seconde
  // ======================================================================
  function boucle(maintenant) {
    if (!jeu || !jeu.monde) return;
    // Si l'on a quitté l'écran de la course autrement (bouton retour…), on range tout
    if (!$('ecran-course').classList.contains('actif')) return arreter();
    jeu.raf = requestAnimationFrame(boucle);
    const dt = Math.min(0.05, Math.max(0, (maintenant - jeu.avant) / 1000));
    jeu.avant = maintenant;
    jeu.animation += dt;
    if (jeu.etat === 'course') avancer(dt);
    else if (jeu.etat === 'arrivee') finirDeCourir(dt);
    animer(dt);
    const { rendu, scene, camera } = jeu.monde;
    rendu.render(scene, camera);
  }

  function avancer(dt) {
    jeu.temps += dt;
    // La vitesse : Roxy accélère petit à petit, ralentit devant une porte et quand elle trébuche
    let cible = jeu.vitesseDepart + (jeu.vitesseArrivee - jeu.vitesseDepart) * (jeu.parcouru / LONGUEUR);
    const porte = jeu.aVenir.concat(jeu.actifs).find(o => o.type === 'porte' && !o.passee);
    if (porte && porte.d - jeu.parcouru < DISTANCE_QUESTION) cible *= RALENTI_QUESTION;
    if (jeu.trebuche > 0) cible *= 0.45;
    jeu.vitesse += (cible - jeu.vitesse) * Math.min(1, dt * 3);
    const pas = jeu.vitesse * dt;
    jeu.parcouru += pas;
    jeu.trebuche = Math.max(0, jeu.trebuche - dt);
    jeu.invincible = Math.max(0, jeu.invincible - dt);
    defiler(pas);

    // Les objets qui arrivent au bout du chemin
    while (jeu.aVenir.length && jeu.aVenir[0].d - jeu.parcouru < VUE) creerObjet(jeu.aVenir.shift());

    // Roxy change de voie et saute
    jeu.x += (VOIES[jeu.voie] - jeu.x) * Math.min(1, dt * 12);
    if (jeu.saut >= 0) {
      jeu.saut += dt;
      const t = jeu.saut / DUREE_SAUT;
      if (t >= 1) {
        jeu.saut = -1;
        jeu.y = 0;
      } else {
        jeu.y = 4 * HAUTEUR_SAUT * t * (1 - t);
      }
    }

    // Ce que Roxy touche : les étoiles, les troncs, les portes
    jeu.actifs.forEach(objet => {
      const z = -(objet.d - jeu.parcouru);
      objet.maille.position.z = z;
      if (objet.type === 'etoile' && !objet.pris
          && Math.abs(z) < 0.9 && Math.abs(jeu.x - VOIES[objet.voie]) < 0.95 && Math.abs(jeu.y + 0.8 - objet.y) < 1.05) {
        objet.pris = true;
        objet.maille.visible = false;
        gagnerEtoiles(1);
      }
      if (objet.type === 'tronc' && !objet.touche && jeu.invincible === 0
          && z > -0.6 && z < 0.55 && Math.abs(jeu.x - VOIES[objet.voie]) < 1.05 && jeu.y < 0.7) {
        objet.touche = true;
        trebucher();
      }
      if (objet.type === 'porte') {
        if (!objet.questionMontree && z > -DISTANCE_QUESTION) montrerQuestion(objet);
        if (!objet.passee && z > -0.1) passerLaPorte(objet);
      }
    });
    // On range les objets dépassés
    jeu.actifs = jeu.actifs.filter(objet => {
      const derriere = objet.d - jeu.parcouru < -9;
      if (derriere) jeu.monde.scene.remove(objet.maille);
      return !derriere;
    });

    $('course-barre').style.width = Math.min(100, jeu.parcouru / LONGUEUR * 100) + '%';
    if (jeu.parcouru >= LONGUEUR) arriver();
  }

  // Le décor défile : le sol, les arbres, les particules
  function defiler(pas) {
    const { texChemin, texHerbe, arbres, particules } = jeu.monde;
    texChemin.offset.y = (texChemin.offset.y + pas / 8) % 1;
    texHerbe.offset.y = (texHerbe.offset.y + pas / 10) % 1;
    arbres.forEach(arbre => {
      arbre.position.z += pas;
      if (arbre.position.z > 3) placerArbre(arbre, arbre.position.z - VUE - 13); // derrière Roxy : on le renvoie au fond
    });
    const positions = particules.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      let z = positions.getZ(i) + pas;
      if (z > 8) z -= 78;
      positions.setZ(i, z);
    }
  }

  // Ce qui bouge tout le temps, même avant le départ : Roxy, les étoiles, les particules, la caméra
  function animer(dt) {
    const { roxy, ombre, camera, particules, saison } = jeu.monde;
    const { corps, queue, pattes } = roxy.userData;
    const t = jeu.animation;
    const court = jeu.etat === 'course' && jeu.vitesse > 1;

    roxy.position.set(jeu.x, jeu.y, 0);
    if (court) {
      const phase = t * (8 + jeu.vitesse * 0.5);
      corps.position.y = Math.abs(Math.sin(phase)) * 0.08;
      pattes.forEach((p, i) => { p.rotation.x = jeu.y > 0 ? 0.9 : Math.sin(phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.8; });
      queue.rotation.y = Math.sin(phase * 0.5) * 0.35;
      roxy.rotation.z = (jeu.x - VOIES[jeu.voie]) * 0.12; // elle se penche dans les virages
    } else {
      corps.position.y = Math.abs(Math.sin(t * 3)) * 0.05;
      pattes.forEach(p => { p.rotation.x *= 0.9; });
      queue.rotation.y = Math.sin(t * 2) * 0.5;
      roxy.rotation.z = 0;
    }
    // Quand elle trébuche, Roxy clignote
    roxy.visible = jeu.invincible === 0 || Math.floor(t * 12) % 2 === 0;
    ombre.position.x = jeu.x;
    ombre.scale.setScalar(0.62 * (1 - Math.min(0.5, jeu.y / 5)));

    // Les étoiles tournent sur elles-mêmes
    jeu.actifs?.forEach(objet => { if (objet.type === 'etoile') objet.maille.rotation.y = t * 3 + objet.d; });

    // Les pétales tombent (et les lucioles flottent)
    const { chute, lucioles } = saison.particules;
    const positions = particules.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i);
      if (lucioles) {
        y += Math.sin(t * 1.5 + i) * dt * 0.4;
      } else {
        y -= chute * dt;
        if (y < 0) y += 14;
        positions.setX(i, positions.getX(i) + Math.sin(t + i) * dt * 0.4);
      }
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
    if (lucioles) particules.material.opacity = 0.7 + Math.sin(t * 4) * 0.25;

    // La caméra suit Roxy, un peu en arrière et au-dessus
    const portrait = camera.aspect < 0.7;
    camera.position.set(jeu.x * 0.45, portrait ? 3.9 : 3.3, portrait ? 8.2 : 6.8);
    camera.lookAt(jeu.x * 0.45, 1.1, -7);
  }

  // ======================================================================
  // Les événements de la course
  // ======================================================================
  function gagnerEtoiles(nombre) {
    jeu.etoiles += nombre;
    const compteur = $('course-etoiles');
    compteur.textContent = `⭐ ${jeu.etoiles}`;
    compteur.classList.remove('gagne');
    compteur.getBoundingClientRect(); // relance la petite animation
    compteur.classList.add('gagne');
  }

  function trebucher() {
    jeu.etoiles = Math.max(0, jeu.etoiles - PERTE_TRONC);
    $('course-etoiles').textContent = `⭐ ${jeu.etoiles}`;
    jeu.trebuche = 0.6;
    jeu.invincible = 1.3;
    montrerMessage(jeu.premierTronc
      ? `Aïe ! −${PERTE_TRONC} ⭐<br><small>Saute par-dessus les troncs avec ⬆️ (ou glisse ton doigt vers le haut)</small>`
      : `Aïe ! −${PERTE_TRONC} ⭐`, 'rate');
    jeu.premierTronc = false;
  }

  function montrerQuestion(porte) {
    porte.questionMontree = true;
    const q = porte.question;
    $('course-question').innerHTML = `
      <p class="course-consigne">${q.consigne}</p>
      <div class="course-enonce">${q.enonce}</div>
      <p class="course-indice">Passe par la bonne porte&nbsp;: ${q.choix.map(c => `<b>${q.etiquettes?.[c] || c}</b>`).join(' · ')}</p>`;
    $('course-question').hidden = false;
  }

  function passerLaPorte(porte) {
    porte.passee = true;
    jeu.portesPassees++;
    const voie = [0, 1, 2].reduce((meilleure, v) => (Math.abs(VOIES[v] - jeu.x) < Math.abs(VOIES[meilleure] - jeu.x) ? v : meilleure), 1);
    const choisie = porte.reponses[voie];
    const juste = choisie === porte.question.reponse;
    // Les panneaux changent de couleur : vert pour la bonne réponse, rouge pour une mauvaise porte choisie
    porte.panneaux.forEach((panneau, v) => {
      if (!panneau) return;
      if (panneau.mot === porte.question.reponse) dessinerPanneau(panneau.canvas, panneau.mot, { fond: '#DDF3E6', bord: '#3FA56B', couleur: '#1F6B42' });
      else if (v === voie) dessinerPanneau(panneau.canvas, panneau.mot, { fond: '#FDE3DE', bord: '#E5604E', couleur: '#A3352A' });
      panneau.texture.needsUpdate = true;
    });
    $('course-question').hidden = true;
    if (juste) {
      jeu.bonnes++;
      gagnerEtoiles(BONUS_PORTE);
      montrerMessage(`✔ ${RM.hasard(['Bravo', 'Super', 'Génial', 'Bien joué'])} ! +${BONUS_PORTE} ⭐`, 'juste');
    } else {
      const debut = choisie ? 'Oups !' : 'Il fallait choisir une porte !';
      montrerMessage(`${debut}<br><small>La bonne réponse&nbsp;: ${porte.question.solution}</small>`, 'rate', 3200);
    }
  }

  function montrerMessage(html, sorte, duree = 2000) {
    const message = $('course-message');
    message.innerHTML = html;
    message.className = 'course-message ' + sorte;
    message.hidden = false;
    clearTimeout(jeu.minuteurMessage);
    jeu.minuteurMessage = setTimeout(() => { message.hidden = true; }, duree);
  }

  // ---------- Les commandes ----------
  function commande(action) {
    if (!jeu || jeu.etat !== 'course') return;
    if (action === 'gauche') jeu.voie = Math.max(0, jeu.voie - 1);
    if (action === 'droite') jeu.voie = Math.min(2, jeu.voie + 1);
    if (action === 'saut' && jeu.saut < 0) jeu.saut = 0;
  }

  // ---------- Le départ : 3, 2, 1, partez ! ----------
  function partir() {
    if (!jeu || jeu.etat !== 'depart') return;
    montrerPanneau(null);
    jeu.etat = 'compte';
    const compte = $('course-compte');
    const etapes = ['3', '2', '1', 'Partez ! 🦊'];
    etapes.forEach((texte, i) => setTimeout(() => {
      if (!jeu) return;
      compte.textContent = texte;
      compte.hidden = false;
      compte.classList.remove('pop');
      compte.getBoundingClientRect();
      compte.classList.add('pop');
      if (i === 1) jeu.monde.roxy.rotation.y = 0; // Roxy se tourne vers le chemin
      if (i === etapes.length - 1) {
        jeu.etat = 'course';
        setTimeout(() => { compte.hidden = true; }, 700);
      }
    }, i * 750));
  }

  // ---------- L'arrivée ----------
  function arriver() {
    jeu.etat = 'arrivee';
    jeu.arrivee = 0;
    $('course-question').hidden = true;
    let resultat = null;
    if (!jeu.essai) resultat = P.enregistrerCourse(jeu.foret, { etoiles: jeu.etoiles, bonnes: jeu.bonnes, duree: jeu.temps });
    jeu.resultat = resultat;
    RM.lancerConfettis?.();
    setTimeout(montrerDiplome, 1800);
  }

  // Roxy ralentit, se retourne vers nous et saute de joie
  function finirDeCourir(dt) {
    jeu.arrivee += dt;
    jeu.vitesse *= Math.max(0, 1 - dt * 2.5);
    const pas = jeu.vitesse * dt;
    jeu.parcouru += pas;
    defiler(pas);
    jeu.actifs.forEach(objet => {
      objet.maille.position.z = -(objet.d - jeu.parcouru);
      // Une fois la ligne franchie, l'arche disparaît : elle cacherait Roxy qui fait la fête
      if (objet.type === 'arrivee' && objet.maille.position.z > -0.5) objet.maille.visible = false;
    });
    const roxy = jeu.monde.roxy;
    roxy.rotation.y += (Math.PI - roxy.rotation.y) * Math.min(1, dt * 3);
    jeu.y = Math.abs(Math.sin(jeu.arrivee * 5)) * 0.9;
  }

  function titreDuDiplome(bonnes, total) {
    if (total > 0 && bonnes === total) return 'Maître de la forêt 🏆';
    if (bonnes >= Math.ceil(total * 2 / 3)) return 'Renard malin 🦊';
    return 'Renardeau courageux 🌱';
  }

  function montrerDiplome() {
    if (!jeu) return;
    const total = jeu.portesPassees;
    const r = jeu.resultat;
    $('course-diplome').innerHTML = `
      <p class="diplome-entete">🏅 Diplôme${jeu.essai ? ' (essai)' : ''}</p>
      <p class="diplome-titre">${titreDuDiplome(jeu.bonnes, total)}</p>
      <p class="diplome-texte"><b>${RM.echapper(jeu.prenom)}</b> a terminé la course de Roxy
        dans ${nomDeLaForet(jeu.foret)}</p>
      <p class="diplome-score">⭐ <b>${jeu.etoiles}</b> étoiles · 🚪 <b>${jeu.bonnes}</b> bonne${jeu.bonnes > 1 ? 's' : ''} porte${jeu.bonnes > 1 ? 's' : ''} sur ${total}</p>
      ${r && r.record ? '<p class="record">🎉 Nouveau record !</p>' : ''}
      ${r && !r.record && !r.premiere ? `<p class="diplome-record">Ton record&nbsp;: ${r.meilleur}&nbsp;⭐</p>` : ''}
      ${jeu.essai ? '<p class="diplome-record">Un essai n’enregistre pas de score.</p>' : ''}`;
    $('course-retour').textContent = { parent: '↩️ Espace parent', accueil: '🏠 Accueil' }[jeu.retour] || '🗺️ La carte';
    montrerPanneau('course-fin');
  }

  // ======================================================================
  // La taille de l'écran, la pause et les boutons
  // ======================================================================
  function redimensionner() {
    if (!jeu || !jeu.monde) return;
    const { rendu, camera } = jeu.monde;
    const scene = $('course-scene');
    const largeur = scene.clientWidth || window.innerWidth;
    const hauteur = scene.clientHeight || window.innerHeight;
    rendu.setSize(largeur, hauteur, false); // false : c'est le CSS qui étire le dessin sur tout l'écran
    camera.aspect = largeur / hauteur;
    // En portrait, on élargit le champ de vision pour bien voir les trois voies
    const champ = 2 * Math.atan(Math.tan(32 * Math.PI / 180) / camera.aspect) * 180 / Math.PI;
    camera.fov = Math.min(82, Math.max(56, champ));
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', redimensionner);

  // Si l'on change d'application pendant la course, on met en pause
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && jeu && jeu.etat === 'course') mettreEnPause();
  });

  function mettreEnPause() {
    jeu.etat = 'pause';
    montrerPanneau('course-pause');
  }

  $('course-reprendre').addEventListener('click', () => {
    if (!jeu || jeu.etat !== 'pause') return;
    montrerPanneau(null);
    jeu.avant = performance.now();
    jeu.etat = 'course';
  });

  $('course-quitter').addEventListener('click', () => {
    if (jeu && jeu.etat === 'course') mettreEnPause();
    else quitter();
  });
  $('course-abandonner').addEventListener('click', quitter);
  $('course-erreur-retour').addEventListener('click', quitter);
  $('course-retour').addEventListener('click', quitter);
  $('course-partir').addEventListener('click', partir);
  $('course-rejouer').addEventListener('click', () => {
    if (!jeu) return;
    lancer(jeu.foret, jeu.options);
  });

  // Les flèches à l'écran (on réagit dès qu'on appuie, sans attendre qu'on lève le doigt)
  document.querySelectorAll('[data-commande]').forEach(bouton => {
    bouton.addEventListener('pointerdown', e => {
      e.preventDefault();
      commande(bouton.dataset.commande);
    });
  });

  // Glisser le doigt sur l'écran : à gauche, à droite, vers le haut pour sauter
  let debutGlisse = null;
  $('course-scene').addEventListener('pointerdown', e => { debutGlisse = { x: e.clientX, y: e.clientY }; });
  $('course-scene').addEventListener('pointerup', e => {
    if (!debutGlisse) return;
    const dx = e.clientX - debutGlisse.x;
    const dy = e.clientY - debutGlisse.y;
    debutGlisse = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) commande(dx < 0 ? 'gauche' : 'droite');
    else if (dy < 0) commande('saut');
  });

  // Sur ordinateur : les flèches du clavier et la barre d'espace
  document.addEventListener('keydown', e => {
    if (!jeu || !$('ecran-course').classList.contains('actif')) return;
    const touches = { ArrowLeft: 'gauche', ArrowRight: 'droite', ArrowUp: 'saut', ' ': 'saut' };
    if (touches[e.key]) {
      e.preventDefault();
      commande(touches[e.key]);
    }
    if (e.key === 'Enter' && jeu.etat === 'depart') partir();
  });

  // ---------- L'accès testeur, caché ----------
  // Un appui long (3 secondes) sur le titre « Renard Malin » de l'accueil ouvre un petit menu
  // pour lancer la course de n'importe quelle forêt, en mode essai : rien n'est enregistré.
  const titreAccueil = document.querySelector('#ecran-accueil .titre-appli');
  let minuteurTesteur = null;
  titreAccueil.addEventListener('pointerdown', () => {
    clearTimeout(minuteurTesteur);
    minuteurTesteur = setTimeout(() => {
      $('boutons-testeur').innerHTML = RM.NIVEAUX.flatMap(n => RM.MATIERES.map(m =>
        `<button class="bouton bouton-principal" data-course-testeur="${RM.idForet(n.id, m.id)}">${n.nom} ${n.saison} ${m.icone}</button>`)).join('');
      $('acces-testeur').hidden = false;
    }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evenement =>
    titreAccueil.addEventListener(evenement, () => clearTimeout(minuteurTesteur)));
  $('acces-testeur-fermer').addEventListener('click', () => { $('acces-testeur').hidden = true; });
  $('boutons-testeur').addEventListener('click', e => {
    const bouton = e.target.closest('[data-course-testeur]');
    if (!bouton) return;
    $('acces-testeur').hidden = true;
    lancer(bouton.dataset.courseTesteur, { essai: true, retour: 'accueil' });
  });

  // Les boutons « Jouer à la course » (sur la carte) et « Essayer » (dans l'espace parent)
  document.addEventListener('click', e => {
    const bouton = e.target.closest('[data-course], [data-course-essai]');
    if (!bouton) return;
    if (bouton.dataset.course) lancer(bouton.dataset.course);
    else lancer(bouton.dataset.courseEssai, { essai: true });
  });

  RM.course = {
    LONGUEUR, PORTES, etoilesPourOuvrir, estOuverte, htmlCarte, htmlParent, questionsPourLaCourse, lancer,
    // Pour les tests : l'état de la course en cours (et la course elle-même)
    etat: () => jeu && { etat: jeu.etat, parcouru: jeu.parcouru, etoiles: jeu.etoiles, bonnes: jeu.bonnes, voie: jeu.voie },
    interne: () => jeu,
  };
})();
