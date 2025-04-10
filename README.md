
# ⚔️ Marteaux & Mandales

**_"Les Légendes Oubliées (et pas sans raison)"_** – Parce que certains héros auraient mieux fait de rester anonymes.

![Logo du Jeu](app/static/img/logo.jpg)

---

## 🎯 Description du Projet

Bienvenue dans **Marteaux & Mandales**, un dungeon crawler humoristique basé sur Flask. Explorez des donjons, affrontez des ennemis absurdes, et incarnez des héros aux capacités loufoques.

## ✨ Fonctionnalités Principales

- **Exploration de Donjons :** Parcourez des cartes variées, remplies de trésors et de dangers inattendus.
- **Combats dynamiques :** Affrontez des monstres aux capacités uniques, gérez votre mana et utilisez des talents spéciaux.
- **Personnages Originaux :** Choisissez entre Paladin, Mage, Voleur ou Barbare, chacun avec ses propres talents.
- **Gestion des Comptes :** Inscription, connexion sécurisée et sauvegarde individuelle des parties.
- **Effets Visuels :** Particules animées et animations dynamiques avec `tsParticles`.

## 🚀 Technologie Utilisée

- **Backend :** Python, Flask
- **Frontend :** HTML5, CSS3, JavaScript
- **Animations :** tsParticles, CSS Animations
- **Sécurité :** bcrypt, sessions Flask sécurisées
- **Outils additionnels :** Jinja2 pour le templating, Tiled pour les cartes (.tmj)

## 🖥️ Installation et Lancement

### Pré-requis
- Python 3.x
- Pip (gestionnaire de paquets Python)

### Installation
```bash
git clone https://github.com/ton-utilisateur/Marteaux-Mandales.git
cd Marteaux-Mandales
pip install -r requirements.txt
```

### Lancer l'application
```bash
python app.py
# ou via flask
flask run
```

Ouvrez ensuite [http://localhost:5000](http://localhost:5000) dans votre navigateur.

## 📂 Structure du Projet

```
Marteaux-Mandales/
├── app/                          # Application principale
│   ├── templates/                # Fichiers HTML rendus via Flask
│   │   ├── index.html            # Page d'accueil : connexion/inscription
│   │   ├── menu.html             # Interface de sélection de classe
│   │   └── jeu.html              # Interface du jeu avec carte, barre de vie/mana, etc.
│   ├── static/                   # Ressources statiques (non modifiées par Flask)
│   │   ├── css/
│   │   │   └── style.css         # Feuilles de style principales
│   │   ├── js/                   # Scripts JavaScript côté client
│   │   │   ├── main.js           # Point d'entrée, initialise les pages
│   │   │   ├── player.js         # Gestion des actions du joueur (déplacement, talents, vie/mana...)
│   │   │   ├── map.js            # Logique liée au chargement et navigation dans les cartes
│   │   │   ├── monstre.js        # Gestion du comportement des monstres
│   │   │   └── utils.js          # Fonctions utilitaires JS (connexion, animations...)
│   │   ├── img/                  # Images diverses (background, logo, personnages, monstres...)
│   │   │   ├── logo.jpg
│   │   │   ├── background.jpg
│   │   │   └── ...
│   │   ├── maps/                 # Cartes au format TMJ (Tiled Map Editor)
│   │   └── talents/              # Fichiers JSON des talents par classe
│   ├── routes.py                 # Routes Flask (login, register, jeu, etc.)
│   ├── utils.py                  # Fonctions Python de support (rencontres, monstres, talents...)
│   └── users.json                # Stockage local des comptes utilisateurs
├── save_data/                   # Données de sauvegarde individuelles pour chaque joueur
├── app.py                       # Entrée principale de l'application Flask
├── requirements.txt             # Dépendances Python du projet
├── README.md                    # Documentation du projet
└── LICENSE                      # Licence MIT
```

## 🎮 Comment Jouer

1. Lancez le serveur.
2. Connectez-vous ou créez un compte.
3. Sélectionnez votre classe de héros.
4. Explorez, combattez, et gagnez de l'expérience.

## 💬 Contribuer au Projet

Vous êtes les bienvenus pour contribuer au développement du projet !

- Faites un fork du dépôt
- Créez une nouvelle branche (`git checkout -b feature/ma-super-fonctionnalité`)
- Faites vos modifications et validez-les (`git commit -m 'Ajout de fonctionnalité'`)
- Poussez vos modifications (`git push origin feature/ma-super-fonctionnalité`)
- Soumettez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Pour plus de détails, consultez le fichier [LICENSE](LICENSE).

---

🌟 **Bon jeu et n'oubliez pas : être un héros, c'est souvent apprendre à échouer avec panache !** 🌟
