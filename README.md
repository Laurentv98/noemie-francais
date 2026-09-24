# 🦊 Renard Malin

Une application pour réviser le français avant la 6e (conjugaison et orthographe), en jouant avec Roxy la renarde.

👉 **Jouer : https://laurentv98.github.io/noemie-francais/**

- 18 étapes sur une carte d'aventure : 9 de conjugaison, 9 d'orthographe, avec leurs leçons.
- Jusqu'à 5 étoiles par étape, une flamme qui grandit chaque jour de révision, un profil par enfant.
- Un espace parent protégé par un code, avec le suivi des progrès et une sauvegarde à exporter.
- En HTML, CSS et JavaScript, sans serveur ni compte : les progrès restent dans le navigateur de l'appareil.

## Installer sur l'iPad

Ouvrir le lien dans **Safari** → bouton **Partager** → **« Sur l'écran d'accueil »**.
Renard Malin s'ouvre alors en plein écran, avec l'icône de Roxy.

## Mettre à jour l'application

1. Modifier les fichiers.
2. Dans `index.html`, changer le numéro de version `?v=…` (partout dans le fichier), pour que l'iPad charge bien la nouvelle version.
3. Envoyer sur GitHub : `git add .`, `git commit -m "…"`, puis `git push`. Le site se met à jour en une ou deux minutes.

## Organisation des fichiers

| Dossier | Contenu |
|---|---|
| `data/` | le contenu : plan de la forêt, livre des verbes, étapes de conjugaison et d'orthographe |
| `js/` | le fonctionnement : quiz, carte, profils, flamme, sauvegarde, espace parent |
| `css/style.css` | les couleurs et la mise en page |
| `img/` | Roxy et les icônes |
