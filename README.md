# Meme Studio - Générateur de Mèmes Responsive

Une application web moderne, légère et interactive permettant de créer, personnaliser et gérer des mèmes en temps réel. Développée en JavaScript natif (Vanilla JS) avec l'API HTML5 Canvas, l'application est entièrement responsive et optimisée pour une utilisation fluide sur PC, tablettes et smartphones.

Lien de l'application en ligne : https://meme-generator-eta-mauve.vercel.app/

---

## Fonctionnalités

### Édition et Personnalisation
* Moteur de rendu Canvas : Incrustation en temps réel des textes (haut/bas) et des stickers sur l'image de votre choix.
* Drag and Drop Avancé : Déplacement des éléments textuels et des stickers à la souris (Desktop) ou via les événements tactiles (Mobile).
* Contrôle du Style : Personnalisation complète (taille de la police, couleur du texte, couleur de la bordure, alignement, choix de la typographie).
* Filtres d'Image : Application de filtres graphiques instantanés (Grayscale, Sepia, Invert, Blur) sur l'image de fond.

### Sauvegarde et Partage
* Téléchargement Direct : Exportation du mème généré au format JPEG haute qualité.
* Partage Natif (Web Share API) : Partage de la création sur les réseaux sociaux et applications de messagerie directement depuis les appareils compatibles.
* Galerie de Créations Locale : Sauvegarde des mèmes dans une galerie intégrée. Grâce au LocalStorage, les créations sont conservées après fermeture du navigateur.
* Réédition et Suppression : Option pour supprimer un mème de la galerie ou pour le recharger instantanément dans l'éditeur afin d'y apporter des modifications.

---

## Technologies Utilisées

* Front-end : HTML5 (Canvas API), CSS3 (Flexbox, Grid, Variables CSS), JavaScript ES6+ (Événements tactiles et souris).
* Hébergement et Déploiement : Vercel (Intégration continue via GitHub).
* Stockage : LocalStorage (Gestion d'état et persistance côté client).

---

## Structure du Projet

```text
mon-projet/
│
├── css/
│   └── style.css          # Styles de l'application, mise en page et responsive design
│
├── js/
│   └── app.js             # Logique applicative, gestion du Canvas, drag and drop et galerie
│
├── index.html             # Structure HTML5 de l'éditeur et de la galerie
├── README.md              # Documentation du projet
└── .gitignore             # Fichiers à ignorer par Git
