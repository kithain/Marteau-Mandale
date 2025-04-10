
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
├── app/
│   ├── templates/
│   │   ├── index.html (Page de connexion)
│   │   ├── menu.html (Menu principal)
│   │   └── jeu.html (Interface du jeu)
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── player.js
│   │   │   ├── map.js
│   │   │   ├── monstre.js
│   │   │   └── utils.js
│   │   ├── img/
│   │   │   ├── logo.jpg
│   │   │   ├── background.jpg
│   │   │   └── ...
│   │   ├── maps/ (Cartes générées avec Tiled)
│   │   └── talents/
│   ├── routes.py
│   ├── utils.py
│   └── users.json
├── save_data/ (Données sauvegardées)
├── app.py
├── requirements.txt
├── README.md
└── LICENSE
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
