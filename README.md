# Marteau-Mandale
_"Les Légendes Oubliées (et pas sans raison)" – Parce que certains héros auraient mieux fait de rester anonymes._

![Logo du Jeu](app/static/img/logo.jpg)

## Description

Bienvenue dans **Marteaux & Mandales**, un dungeon crawler humoristique basé sur Flask et jouable dans le navigateur.

## Fonctionnalités

- 🗺️ **Exploration de Donjons** : Parcourez des niveaux remplis de pièges et de trésors.
- ⚔️ **Combats Simples** : Affrontez des ennemis dans un style RPG.
- 😂 **Personnages Hauts en Couleur** : Héros aux capacités uniques et dialogues absurdes.
- 💾 **Sauvegardes Utilisateurs** : Connexion, inscription, et sauvegardes individuelles.
- 🌟 **Effets Visuels** : Particules animées avec tsparticles.

## Technologies Utilisées

- **Flask** : Backend Python léger.
- **HTML, CSS, JS** : Pour l'interface utilisateur.
- **tsparticles** : Effet d'étincelles.
- **bcrypt** : Pour le hachage des mots de passe.
- **Jinja2** : Moteur de templates Flask.

## Comment Jouer

1. Lance le serveur Flask (`python app.py` ou `flask run`)
2. Ouvre le navigateur sur `http://localhost:5000`
3. Crée un compte ou connecte-toi
4. Lance une nouvelle partie ou charge ta sauvegarde

## Arborescence du Projet

```
├── Marteau-Mandale                     # Dossier racine du projet Flask "Marteau & Mandale"
│
│   ├── LICENSE                         # Licence du projet (ex: MIT, GPL), définit les conditions d’utilisation
│   ├── README.md                       # Documentation principale du projet (format Markdown)
│
│   ├── app/                            # Dossier principal de l'application Flask
│   │
│   │   ├── __init__.py                 # Initialise l'application Flask (création de l'objet `app`, configuration)
│   │
│   │   ├── __pycache__/                # Cache Python automatique (fichiers compilés .pyc)
│   │   │   ├── __init__.cpython-39.pyc
│   │   │   ├── routes.cpython-39.pyc
│   │   │   └── utils.cpython-39.pyc
│   │
│   │   ├── routes.py                   # Définition des routes Flask (pages, logique HTTP)
│   │
│   │   ├── static/                     # Fichiers statiques (images, CSS, JS, JSON de données)
│   │   │
│   │   │   ├── css/
│   │   │   │   └── style.css           # Feuille de style principale (design, couleurs, mise en page)
│   │   │
│   │   │   ├── img/                    # Ressources graphiques (illustrations du jeu)
│   │   │   │   ├── background.jpg      # Fond d’écran du jeu
│   │   │   │   ├── classes/            # Portraits des classes jouables
│   │   │   │   │   ├── barbare.png
│   │   │   │   │   ├── mage.png
│   │   │   │   │   ├── paladin.png
│   │   │   │   │   └── voleur.png
│   │   │   │   ├── favicon.ico         # Icône du site web
│   │   │   │   ├── fumee.png           # Image de brume (effet visuel en overlay)
│   │   │   │   ├── logo.jpg            # Logo du jeu
│   │   │   │   ├── monstres/           # Illustrations des ennemis
│   │   │   │   │   ├── gobelin.png
│   │   │   │   │   └── slime.png
│   │   │   │   ├── spark1.png          # Effet visuel de particule (étincelle)
│   │   │   │   └── spark2.png          # Variante de particule
│   │   │
│   │   │   ├── js/
│   │   │   │   ├── game.js             # Script principal du jeu (déplacements, mana, talents...)
│   │   │   │   └── utils.js            # Scripts utilitaires JS (login, interface...)
│   │   │
│   │   │   ├── maps/                   # Cartes de jeu générées via Tiled
│   │   │   │   ├── Sprite-coline-0003.png  # Image du tileset
│   │   │   │   ├── Sprite-coline-0003.tsx  # Définition Tiled du tileset
│   │   │   │   ├── map1.json               # Carte principale jouable (format JSON)
│   │   │   │   └── rencontres_map1.json    # Configuration des rencontres aléatoires (PNJ, monstres)
│   │   │
│   │   │   ├── monstres/
│   │   │   │   ├── monstres.json           # Données des ennemis (nom, stats, image, talents...)
│   │   │   │   └── talents_monstres.json   # Capacités spécifiques aux monstres
│   │   │
│   │   │   └── talents/                # Talents de chaque classe jouable
│   │   │       ├── barbare_talents.json
│   │   │       ├── mage_talents.json
│   │   │       ├── paladin_talents.json
│   │   │       └── voleur_talents.json
│   │
│   │   ├── templates/                 # Pages HTML servies par Flask (Jinja2)
│   │   │   ├── index.html             # Page d’accueil (login / création de compte)
│   │   │   ├── jeu.html               # Interface du jeu (affichage de la carte, HUD…)
│   │   │   └── menu.html              # Menu principal (nouvelle partie, chargement...)
│   │
│   │   ├── users.json                 # Comptes utilisateurs (login + mot de passe hashé ou non)
│   │   └── utils.py                   # Fonctions utilitaires backend (gestion JSON, joueurs, classes...)
│
│   ├── app.py                         # Point d’entrée de l’application Flask (app.run())
│
│   └── save_data/                     # Sauvegardes de parties utilisateurs
│       ├── user1.json                 # Sauvegarde d'un joueur
│       ├── user2.json
│       ├── test.json                  # Données de test
│       └── user3.json
│
├── README.txt                         # Ancienne version du README ? (format texte brut)
└── favicon.ico                        # Icône redondante à celle du dossier static/img (compatibilité ?)
```

## Contribution

- Forkez le projet
- Créez une branche (`git checkout -b feature/ma-feature`)
- Committez (`git commit -m 'Ajout de ...'`)
- Poussez (`git push origin feature/ma-feature`)
- Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE).

---

🎲 Amusez-vous bien dans **Marteaux & Mandales** ! Et rappelez-vous : même les héros ont le droit de se tromper (souvent).
