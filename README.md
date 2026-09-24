# 🦊 Renard Malin

Une application pour réviser le français au collège (conjugaison, orthographe, grammaire et vocabulaire), en jouant avec Roxy la renarde.

👉 **Jouer : https://laurentv98.github.io/noemie-francais/**

- **4 niveaux au choix** : 6e (les bases du CM2 et les nouveautés de 6e), 5e, 4e et 3e, chacun avec sa forêt et sa saison 🌸🍂❄️🌙.
- **106 étapes** sur les cartes d'aventure, avec leurs leçons : conjugaison (du présent au subjonctif imparfait), orthographe (homophones, accords, participe passé, nombres…), grammaire (nature et fonction des mots, propositions, voix passive…) et vocabulaire (synonymes, familles de mots, figures de style, racines grecques et latines…).
- Jusqu'à 5 étoiles par étape, une flamme qui grandit chaque jour de révision, un profil par enfant.
- Un espace parent protégé par un code, avec le suivi des progrès par niveau et une sauvegarde à exporter.
- En HTML, CSS et JavaScript, sans serveur ni compte : les progrès restent dans le navigateur de l'appareil.

## Installer sur l'iPad

Ouvrir le lien dans **Safari** → bouton **Partager** → **« Sur l'écran d'accueil »**.
Renard Malin s'ouvre alors en plein écran, avec l'icône de Roxy.

## Mettre à jour l'application

1. Modifier les fichiers.
2. Dans `index.html`, changer le numéro de version `?v=…` (partout dans le fichier), pour que l'iPad charge bien la nouvelle version.
3. Envoyer sur GitHub : `git add .`, `git commit -m "…"`, puis `git push`. Le site se met à jour en une ou deux minutes.

## Organisation des fichiers

| Fichier ou dossier | Contenu |
|---|---|
| `data/foret.js` | le plan des 4 forêts : les niveaux, leurs étapes dans l'ordre, les décors |
| `data/verbes.js` | le livre des verbes : chaque verbe conjugué à tous les temps |
| `data/6e-…`, `5e-…`, `4e-…`, `3e-…` | le contenu de chaque niveau : conjugaison, orthographe, grammaire et vocabulaire, avec leurs leçons |
| `js/moteur-conjugaison.js` | le moteur qui fabrique les questions de conjugaison |
| `js/moteur-phrases.js` | le moteur des étapes à phrases (homophones, accords, mots soulignés à classer, grammaire, vocabulaire…) |
| `js/` (autres fichiers) | le fonctionnement : quiz, carte, niveaux, profils, flamme, sauvegarde, espace parent |
| `css/style.css` | les couleurs et la mise en page |
| `img/` | Roxy et les icônes |
