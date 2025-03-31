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
📁 Marteau-Mandale/
│
├── 📄 app.py                   # Script principal pour lancer Flask
├── 📄 requirements.txt         # Dépendances Python
│
├── 📁 app                      # Dossier contenant les modules Flask
│   ├── 📄 __init__.py          # Initialisation du module Flask
│   ├── 📄 routes.py            # Routes HTTP du jeu
│   ├── 📄 utils.py             # Fonctions utilitaires générales
│   ├── 📄 users.json           # Données des utilisateurs
│   │
│   ├── 📁 templates            # Templates HTML pour les pages
│   │   ├── 📄 index.html       # Page d'accueil (connexion, inscription)
│   │   ├── 📄 menu.html        # Page du menu principal
│   │   └── 📄 jeu.html         # Interface du jeu
│   │
│   └── 📁 static               # Fichiers statiques (CSS, JS, Images)
│       │
│       ├── 📁 css
│       │   └── 📄 style.css    # Style principal de l'application
│       │
│       ├── 📁 js
│       │   └── 📄 particles-config.js  # Scripts JS complémentaires
│       │
│       ├── 📁 img              # Images générales du jeu
│       │   ├── 📁 classes
│       │   │   ├── 📄 paladin.png
│       │   │   ├── 📄 mage.png
│       │   │   ├── 📄 voleur.png
│       │   │   └── 📄 barbare.png
│       │   ├── 📄 background.jpg
│       │   ├── 📄 logo.jpg
│       │   └── 📄 favicon.ico
│       │
│       ├── 📁 maps             # Cartes générées avec Tiled
│       │   ├── 📄 map1.json
│       │   ├── 📄 Sprite-coline-0003.tsx
│       │   └── 📄 Sprite-coline-0003.png
│       │
│       └── 📁 talents          # ⚠️ NOUVEAU dossier pour les talents des classes
│           ├── 📄 paladin_talents.json   # Talents du Paladin
│           ├── 📄 mage_talents.json      # Talents du Mage
│           ├── 📄 voleur_talents.json    # Talents du Voleur
│           └── 📄 barbare_talents.json   # Talents du Barbare
│
├── 📁 save_data                # Stockage des données sauvegardées
│   └── 📄 partie1.json         # Exemple de fichier de sauvegarde d'une partie
│
├── 📄 README.md                # Description et documentation du projet
└── 📄 LICENSE                  # Licence du projet

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
