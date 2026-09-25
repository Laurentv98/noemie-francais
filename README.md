# 🦊 Renard Malin

Une application pour réviser le français et les maths au collège, en jouant avec Roxy la renarde.

👉 **Jouer : https://laurentv98.github.io/renard-malin/**

- **4 niveaux au choix** : 6e (les bases du CM2 et les nouveautés de 6e), 5e, 4e et 3e, chacun avec sa forêt et sa saison 🌸🍂❄️🌙.
- **Deux côtés dans chaque forêt** : 📖 le français et 🔢 les maths. Un bouton en haut de la carte permet de passer de l'un à l'autre.
- **📖 Le français : 106 étapes** sur les cartes d'aventure, avec leurs leçons : conjugaison (du présent au subjonctif imparfait), orthographe (homophones, accords, participe passé, nombres…), grammaire (nature et fonction des mots, propositions, voix passive…) et vocabulaire (synonymes, familles de mots, figures de style, racines grecques et latines…).
- **🔢 Les maths : 99 étapes** (27 en 6e, 24 en 5e, 24 en 4e, 24 en 3e), avec leurs leçons, en 4 chemins : les nombres et le calcul (décimaux, fractions, relatifs, puissances, calcul littéral, équations…), la géométrie (angles, symétries, Pythagore, Thalès, trigonométrie…), les grandeurs et les mesures (conversions, périmètres, aires, volumes, vitesses…) et les données (proportionnalité, pourcentages, statistiques, probabilités, fonctions). Les questions sont fabriquées au hasard : elles sont toujours nouvelles, et la bonne réponse est calculée par l'application. On choisit la réponse, ou on la tape (3,5 ou 3.5, c'est pareil), avec des figures dessinées pour la géométrie et les graphiques.
- Jusqu'à 5 étoiles par étape, une flamme qui grandit chaque jour de révision, un profil par enfant.
- **⚡ Le défi du jour** : 5 questions surprises, prises dans toute la forêt (français et maths), une fois par jour.
- **📒 Le carnet de Roxy** : quand on se trompe, Roxy note l'étape et la repose plus tard (le jour même, puis 1, 3 et 7 jours après) pour ne pas oublier.
- **🎩 Le dressing de Roxy** : 17 accessoires (chapeaux, lunettes, et des amis comme la tortue ou le cagou) qui se gagnent **en jouant, jamais en payant** : avec les étoiles, la flamme, les défis du jour, les étoiles d'or et la course. Roxy les porte partout, même dans la course en 3D.
- **🌺 Faite pour la Nouvelle-Calédonie** : les prix en francs (XPF), des prénoms, des lieux et des situations d'ici (le lagon, Lifou, le marché, le va'a, le cagou…).
- **🔊 Des sons** fabriqués par l'appareil (bouton 🔊 / 🔇 sur l'accueil), et **🗣️ Roxy lit à voix haute** la question, son explication ou la leçon, avec la voix française de l'appareil.
- **Hors ligne** : après une première visite, l'appli s'ouvre même sans Internet (en brousse, sur les îles…).
- **La course de Roxy** 🏁 : au bout de chaque forêt (côté français et côté maths), un petit jeu en 3D (avec [Three.js](https://threejs.org)). Roxy court dans le décor de la saison, ramasse des étoiles, saute par-dessus les troncs et passe par la bonne porte quand une question arrive. À l'arrivée, un diplôme ! La course s'ouvre avec 3 étoiles par étape de la forêt ; l'espace parent permet de l'essayer.
- Un espace parent protégé par un code, avec le suivi des progrès par niveau et une sauvegarde à exporter.
- En HTML, CSS et JavaScript, sans serveur ni compte : les progrès restent dans le navigateur de l'appareil.

## Installer sur l'iPad

Ouvrir le lien dans **Safari** → bouton **Partager** → **« Sur l'écran d'accueil »**.
Renard Malin s'ouvre alors en plein écran, avec l'icône de Roxy.

## Mettre à jour l'application

1. Modifier les fichiers.
2. Dans `index.html`, changer le numéro de version `?v=…` (partout dans le fichier), **et le même numéro dans `sw.js`** (`VERSION`), pour que l'iPad charge bien la nouvelle version.
3. Envoyer sur GitHub : `git add .`, `git commit -m "…"`, puis `git push`. Le site se met à jour en une ou deux minutes.

## Organisation des fichiers

| Fichier ou dossier | Contenu |
|---|---|
| `data/foret.js` | le plan des 4 forêts : les niveaux, leurs étapes dans l'ordre, les décors |
| `data/verbes.js` | le livre des verbes : chaque verbe conjugué à tous les temps |
| `data/6e-…`, `5e-…`, `4e-…`, `3e-…` | le contenu de chaque niveau : conjugaison, orthographe, grammaire et vocabulaire, avec leurs leçons |
| `data/foret-maths.js` | le plan du côté maths des 4 forêts |
| `data/6e-nombres.js`, `…-geometrie.js`, `…-mesures.js`, `…-donnees.js` | les étapes de maths de chaque niveau : comment fabriquer les questions, et les leçons |
| `js/moteur-conjugaison.js` | le moteur qui fabrique les questions de conjugaison |
| `js/moteur-phrases.js` | le moteur des étapes à phrases (homophones, accords, mots soulignés à classer, grammaire, vocabulaire…) |
| `js/moteur-maths.js` | le moteur des maths : les nombres écrits à la française, les fractions, les questions et les figures |
| `js/course.js` | la course de Roxy : le jeu en 3D (Three.js est chargé depuis jsDelivr au lancement de la course) |
| `js/sons.js`, `js/voix.js` | les sons (fabriqués note par note) et la lecture à voix haute |
| `js/dressing.js` | le dressing de Roxy : les accessoires, comment les gagner, où les poser sur Roxy (et le dessin du cagou) |
| `js/defis.js` | le coin de Roxy en haut de la carte : le défi du jour et le carnet |
| `js/bienvenue.js` | la bulle de Roxy sur l'accueil et sa présentation à la première visite |
| `sw.js` | le « service worker » : la copie de l'appli gardée sur l'appareil, pour jouer sans Internet |
| `js/outils.js` | les petites fonctions partagées, et l'éditeur (`RM.EDITEUR`) avec l'adresse des liens « Signaler une erreur » |
| `js/` (autres fichiers) | le fonctionnement : quiz, carte, niveaux, profils, flamme, sauvegarde, espace parent |
| `infos.html` | les informations légales : mentions légales, conditions d'utilisation, confidentialité |
| `css/style.css` | les couleurs et la mise en page |
| `img/` | Roxy et les icônes |
