# ⚔️ Marteau & Mandales

Bienvenue dans **Marteau & Mandales**, un jeu de rôle (RPG) au tour par tour sur navigateur, développé avec Flask et JavaScript. Créez votre héros, choisissez votre classe et partez affronter des monstres pour gagner de l'expérience !

## 🌟 Fonctionnalités

- **Système de Classes** : Choisissez parmi 4 classes uniques, chacune avec ses propres statistiques de départ :
  - 🛡️ **Paladin** : Équilibré et résistant.
  - 🔮 **Mage** : Puissant mais fragile (Intelligence élevée).
  - 🗡️ **Voleur** : Rapide et agile (Agilité élevée).
  - 🪓 **Barbare** : Force brute et beaucoup de points de vie.

- **Combat au Tour par Tour** :
  - Attaques physiques et utilisation de talents.
  - Gestion de la vie (PV), des potions et des délais de récupération (cooldowns).
  - Système de fuite et butin (XP, Potions).
  - Monstres avec statistiques évolutives (Scaling) selon la difficulté.

- **Progression** :
  - **Niveaux** : Gagnez de l'XP pour monter de niveau (+10 PV Max, +2 Dégâts par niveau).
  - **Survie** : Lootez des potions pour survivre aux combats.
  - **Sauvegarde** : Sauvegarde automatique (toutes les 30s et après chaque combat) et persistance des données via fichiers JSON.

- **Interface Moderne** :
  - Design responsive (mobile-friendly).
  - Feedback visuel pour les combats (barres de vie, logs de combat, animations).

## 🛠️ Technologies Utilisées

- **Backend** : Python 3, Flask
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
  - Architecture modulaire JS : `combat_engine.js`, `ui_manager.js`, `api_client.js`
- **Persistance** : Système de fichiers JSON (pas de base de données SQL requise).

## 🚀 Installation et Lancement

1. **Prérequis** : Assurez-vous d'avoir Python installé sur votre machine.

2. **Installation des dépendances** :
   À la racine du projet, exécutez :
   ```bash
   pip install -r requirements.txt
   ```

3. **Lancement du jeu** :
   Lancez le serveur de développement :
   ```bash
   python app.py
   ```

4. **Accès** :
   Ouvrez votre navigateur et allez à l'adresse : `http://127.0.0.1:5000`

## 📂 Structure du Projet

```
Marteau-Mandale/
├── app.py                 # Point d'entrée de l'application
├── requirements.txt       # Liste des dépendances Python
├── app/
│   ├── routes.py          # Routes Flask et API
│   ├── config.py          # Configuration et équilibrage du jeu
│   ├── utils.py           # Fonctions utilitaires (gestion données, logique jeu)
│   ├── static/            # Fichiers statiques (JS, CSS, Images)
│   │   ├── js/            # Logique frontend (moteur de combat, UI)
│   │   └── css/           # Styles
│   └── templates/         # Templates HTML (Jinja2)
└── save_data/             # Dossier de stockage des sauvegardes joueurs (JSON)
```

## 🎮 Comment Jouer

1. **Inscription/Connexion** : Créez un compte depuis la page d'accueil.
2. **Création de Personnage** : Choisissez votre classe préférée.
3. **Aventure** :
   - Cliquez sur "Combattre" pour lancer une rencontre.
   - Utilisez vos compétences pour vaincre l'ennemi.
   - Surveillez vos PV et utilisez des potions si nécessaire.
4. **Sauvegarde** : Votre progression est sauvegardée automatiquement.

## 📝 Reste à Faire (RAF)

Consultez le fichier `app/RAF.txt` pour voir la liste des fonctionnalités implémentées et à venir.

---
*Projet développé avec passion pour les amateurs de mandales.*
git add .
git commit -m "UPDATE"
git push origin master
