# Marteau-Mandale
_"Les Légendes Oubliées (et pas sans raison)" – Parce que certains héros auraient mieux fait de rester anonymes._

![Logo du Jeu](app/static/img/logo.jpg)

## 📖 Présentation

**Marteau & Mandale** est un jeu web en pixel art inspiré des mécaniques de Donjons & Dragons (D20). Développé en Python avec Flask, ce projet propose :

- Une interface en ligne avec création/connexion de compte
- Un système de classes jouables (Paladin, Mage, Barbare, Voleur)
- Une carte exploratoire dynamique (vue 5x5 centrée sur le joueur)
- Des combats contre des monstres aléatoires
- Des talents, cooldowns, effets visuels et système de mana
- Des sauvegardes locales pour chaque joueur

---

## 🧰 Technologies

- Python 3.9+
- Flask
- HTML5 / CSS3
- JavaScript (vanilla)
- JSON (pour les données de jeu)
- [Tiled](https://www.mapeditor.org/) (pour les cartes)

---

## 📁 Arborescence principale

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

---

## 🧙 Classes jouables

- **🛡️ Paladin** – Guerrier défensif
- **🔥 Mage** – Lanceuse de sorts à distance
- **🏹 Voleur** – Archer agile
- **💪 Barbare** – DPS de mêlée brutal

---

## 💾 Système de sauvegarde

Chaque joueur possède un fichier de sauvegarde dans le dossier `save_data/`.

---

## 🧟 Gestion des monstres

- Données dans `static/monstres/monstres.json`
- Talents dans `static/monstres/talents_monstres.json`
- Rencontres définies par carte dans `maps/rencontres_*.json`

---

## ⚔️ Mécaniques de jeu

- Vue 5x5 centrée sur le joueur
- Talents avec cooldown et mana
- Effets visuels configurables par JSON

---

## 🚀 Lancer le jeu

```bash
python -m venv venv
source venv/bin/activate  # ou .\venv\Scripts\activate sur Windows
pip install -r requirements.txt
python app.py
```

---

## 📜 Licence

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](LICENSE).

---

## 👾 Crédits

- Code, graphismes, maps : [Ton nom ici]
- Tileset : *Sprite-coline-0003* (via Tiled)
- Framework : [Flask](https://flask.palletsprojects.com/)
