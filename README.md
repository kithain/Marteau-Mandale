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
├── 📄 app.py                   # Point d'entrée principal
├── 📄 requirements.txt         # Dépendances Python
│
├── 📁 app/                     # Application Flask
│   ├── 📄 __init__.py          
│   ├── 📄 routes.py            
│   ├── 📄 player_manager.py    
│   ├── 📄 utils.py             
│   │
│   ├── 📁 static/              # Assets statiques
│   │   ├── 📁 css/
│   │   ├── 📁 img/
│   │   └── 📁 js/
│   │
│   ├── 📁 templates/           # Templates HTML
│   │   ├── 📄 jeu.html
│   │   └── 📄 menu.html
│   │
│   └── 📁 save_data/           # Sauvegardes
│
└── 📄 README.md                # Ce fichier
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📜 Licence

[MIT](LICENSE)

## 🙏 Remerciements

- Merci à la communauté Flask
- Inspiration : Les vieux jeux zelda et dragon quest
