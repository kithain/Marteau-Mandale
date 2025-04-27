# Marteau-Mandale
_"Les Légendes Oubliées (et pas sans raison)" - Parce que certains héros auraient mieux fait de rester anonymes._

![Logo du Jeu](app/static/img/logo.jpg)

## 🎮 Description

Bienvenue dans **Marteaux & Mandales**, un dungeon crawler basé sur Flask et jouable dans le navigateur. 

## ✨ Fonctionnalités

- 🗺️ **Exploration des niveaux**
- ⚔️ **Combats tactiques**
- 🛡️ **4 Personnages uniques** - Chaque classe a des capacités spéciales
- 🔒 **Système de compte sécurisé** - Sauvegarde de la progression
- 🌟 **Effets visuels immersifs**


## 🛠 Technologies Utilisées

### Backend
- **Python 3**
- **Flask** - Framework web léger
- **Jinja2** - Moteur de templates
- **Cryptographie** :
  - BLAKE2b pour le hachage sécurisé
  - PBKDF2-HMAC-SHA256 pour les mots de passe (100 000 itérations)

### Frontend
- **HTML5, CSS3, JavaScript**
- **tsparticles** - Effets visuels
- **Responsive Design** - Compatible mobile

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-repo/Marteau-Mandale.git
cd Marteau-Mandale
```

2. Installez les dépendances :
```bash
pip install -r requirements.txt
```

3. Lancez le serveur :
```bash
flask run
```

4. Ouvrez votre navigateur à l'adresse : `http://localhost:5000`

## 📂 Structure du Projet

```
📁 Marteau-Mandale/
│
├── 📄 app.py                   # Point d'entrée principal - Initialise l'application Flask
├── 📄 requirements.txt         # Liste des dépendances Python nécessaires
├── 📄 LICENSE                  # Licence MIT
│
├── 📁 app/                     # Module principal de l'application
│   ├── 📄 __init__.py          # Initialise le package Flask et les extensions
│   ├── 📄 routes.py            # Contient toutes les routes de l'application
│   ├── 📄 player_manager.py    # Gère la création et l'authentification des joueurs
│   ├── 📄 utils.py             # Fonctions utilitaires partagées
│   ├── 📄 utils_liste_difficultes.py # Gestion des niveaux de difficulté
│   ├── 📄 utils_rencontres.py  # Gestion des rencontres avec monstres
│   │
│   ├── 📁 static/              # Contient tous les assets statiques
│   │   ├── 📁 css/
│   │   │   └── 📄 style.css    # Style principal de l'application
│   │   │
│   │   ├── 📁 img/             # Assets visuels du jeu
│   │   │   ├── 📁 classes/     # Sprites des personnages jouables
│   │   │   │   ├── 📄 barbare.png, barbare_attack.png, barbare_idle.png
│   │   │   │   ├── 📄 mage.png, mage_attack.png, mage_idle.png
│   │   │   │   ├── 📄 paladin.png, paladin_attack.png, paladin_idle.png
│   │   │   │   └── 📄 voleur.png, voleur_attack.png, voleur_idle.png
│   │   │   │
│   │   │   ├── 📁 monstres/    # Sprites des ennemis
│   │   │   │   ├── 📄 bandit.png, geunaude.png, ghost.png
│   │   │   │   ├── 📄 ghost_miner.png, gobelin.png, golem.png
│   │   │   │   └── 📄 [20+ autres sprites de monstres...]
│   │   │   │
│   │   │   ├── 📄 background.jpg # Arrière-plan
│   │   │   ├── 📄 logo.jpg     # Logo du jeu
│   │   │   ├── 📄 favicon.ico  # Icône du site
│   │   │   ├── 📄 fumee.png    # Effets visuels
│   │   │   └── 📄 spark1.png, spark2.png # Particules
│   │   │
│   │   ├── 📁 js/              # Logique JavaScript
│   │   │   ├── 📄 main_entry_point.js # Point d'entrée
│   │   │   ├── 📄 camera_main_logic.js # Gestion caméra
│   │   │   ├── 📄 combat_manager_logic.js # Système de combat
│   │   │   ├── 📄 [15+ autres fichiers de logique...]
│   │   │
│   │   ├── 📁 maps/            # Cartes du jeu (Tiled)
│   │   │   ├── 📄 A1.tmj à P8.tmj # Cartes des différents niveaux
│   │   │   ├── 📄 Sprite-foret.png # Tileset
│   │   │   └── 📄 Sprite-foret.tsx # Configuration Tiled
│   │   │
│   │   ├── 📁 monstres/        # Données des monstres
│   │   │   ├── 📄 monstres.json # Statistiques des monstres
│   │   │   └── 📄 talents_monstres.json # Capacités spéciales
│   │   │
│   │   ├── 📁 rencontres/      # Tables de rencontres
│   │   │   ├── 📄 difficulte_1.json à difficulte_10.json
│   │   │
│   │   └── 📁 talents/         # Système de talents
│   │       └── 📄 talents.json # Arbres de talents
│   │
│   ├── 📁 templates/           # Templates HTML
│   │   ├── 📄 index.html       # Page d'accueil
│   │   ├── 📄 jeu.html         # Interface de jeu
│   │   └── 📄 menu.html        # Menu principal
│   │
│   └── 📁 __pycache__/         # Cache Python (généré automatiquement)
│
└── 📄 README.md                # Documentation du projet
```

## 🤝 Contribution

Les contributions sont les bienvenues ! 
- Forkez le projet
- Créez une branche (`git checkout -b feature/ma-feature`)
- Committez (`git commit -m 'Ajout de ...'`)
- Poussez (`git push origin feature/ma-feature`)
- Ouvrez une Pull Request

## 📜 Licence

[MIT](LICENSE)

## 🙏 Remerciements

- Merci à la communauté Flask
- Inspiration : Les vieux jeux zelda et dragon quest
