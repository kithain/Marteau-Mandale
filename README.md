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
├── Marteau-Mandale/                  # Racine du projet
│
│   ├── LICENSE                       # Fichier de licence du projet (ex: MIT, GPL...)
│   ├── README.md                     # Documentation du projet (Markdown)
│   ├── README.txt                    # (Probablement ancien) README en texte simple
│   ├── favicon.ico                   # Icône par défaut pour navigateurs (racine)
│
│   ├── app/                          # Dossier principal de l'application Flask
│   │
│   │   ├── __init__.py               # Initialise le module Flask (crée app, etc.)
│   │   ├── routes.py                 # Toutes les routes HTTP (login, menu, jeu, etc.)
│   │   ├── utils.py                  # Fonctions utilitaires (ex: chargement de données, etc.)
│   │   ├── users.json                # Fichier de comptes utilisateurs (login / password hashés ?)
│   │
│   │   ├── __pycache__/              # Fichiers Python compilés (.pyc)
│   │   │   └── *.cpython-39.pyc      # Générés automatiquement par Python
│   │
│   │   ├── templates/                # Templates HTML utilisés par Flask (Jinja2)
│   │   │   ├── index.html            # Page de connexion / inscription
│   │   │   ├── menu.html             # Menu principal (choix classe, nouvelle partie, etc.)
│   │   │   └── jeu.html              # Interface principale du jeu
│   │
│   │   ├── static/                   # Contenu statique servi par Flask (CSS, JS, images…)
│   │   │
│   │   │   ├── css/
│   │   │   │   └── style.css         # Feuille de style principale du site
│   │   │
│   │   │   ├── js/
│   │   │   │   ├── game.js           # Scripts JS utilisés dans le jeu (mouvement, mana, etc.)
│   │   │   │   └── particles-config.js # Configuration du système de particules (tsParticles)
│   │   │
│   │   │   ├── img/                  # Images utilisées dans le jeu
│   │   │   │   ├── background.jpg        # Fond de l'application
│   │   │   │   ├── fumee.png             # Image utilisée pour l'effet de brume/parallax
│   │   │   │   ├── logo.jpg              # Logo du jeu
│   │   │   │   ├── favicon.ico           # Icône du site
│   │   │   │   ├── spark1.png / spark2.png # Particules feu/étincelles
│   │   │   │   └── classes/              # Illustrations des classes jouables
│   │   │   │       ├── barbare.png
│   │   │   │       ├── mage.png
│   │   │   │       ├── paladin.png
│   │   │   │       └── voleur.png
│   │   │
│   │   │   ├── maps/                 # Cartes générées avec Tiled (format JSON)
│   │   │   │   ├── map1.json              # Carte principale jouable
│   │   │   │   ├── Sprite-coline-0003.png # Tileset graphique utilisé
│   │   │   │   ├── Sprite-coline-0003.tsx # Définition du tileset pour Tiled
│   │   │   │   └── rencontres_map1.json   # Configuration des rencontres aléatoires pour cette carte
│   │   │
│   │   │   ├── monstres/            # Fichiers liés aux monstres
│   │   │   │   ├── monstres.json         # Données des monstres
│   │   │   │   └── talents_monstres.json # Talents utilisables par les monstres
│   │   │
│   │   │   └── talents/             # Talents des classes jouables
│   │   │       ├── barbare_talents.json
│   │   │       ├── mage_talents.json
│   │   │       ├── paladin_talents.json
│   │   │       └── voleur_talents.json
│
│   ├── app.py                       # Script principal qui lance l'app Flask (app.run)
│   ├── requirements.txt             # Liste des dépendances à installer (Flask, etc.)
│
│   └── save_data/                   # Sauvegardes de parties utilisateurs (format JSON)
│       ├── xxxxx.json
│       ├── xxxxx.json
│       ├── xxxx.json
│       └── xxxx.json

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
