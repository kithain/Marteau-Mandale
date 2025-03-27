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
Marteau-Mandale/
├── LICENSE                       # Licence MIT du projet
├── README.md                     # Documentation du projet (version complète générée)
├── app.py                        # Fichier principal pour lancer l'application Flask
├── requirements.txt              # Liste des dépendances Python (Flask, bcrypt, etc.)
├── save_data/                    # Dossier des fichiers de sauvegarde des joueurs
│   └── (ex: joueur1.json)        # Sauvegardes individuelles par utilisateur
├── app/                          # Dossier principal de l'application Flask
│   ├── __init__.py               # Initialise l'application Flask et le blueprint
│   ├── routes.py                 # Contient les routes (login, register, menu, jeu)
│   ├── utils.py                  # Fonctions utilitaires : hash de mot de passe, etc.
│   ├── users.json                # Fichier contenant les utilisateurs enregistrés
│   ├── static/                   # Fichiers statiques (images, JS, CSS)
│   │   ├── css/
│   │   │   └── style.css         # Feuille de style principale
│   │   ├── js/
│   │   │   └── particles-config.js # Script JS pour les effets d'étincelles
│   │   └── img/                  # Images du jeu
│   │       ├── background.jpg    # Fond d'écran
│   │       ├── logo.jpg          # Logo du jeu
│   │       ├── spark1.png        # Image pour particules
│   │       └── spark2.png        # Image pour particules
│   └── templates/                # Templates HTML (rendus par Flask via Jinja2)
│       ├── index.html            # Page de connexion/inscription
│       ├── menu.html             # Page du menu principal (nouvelle partie, charger)
│       └── jeu.html              # Interface du jeu (à venir)
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
