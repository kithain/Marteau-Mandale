from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
import json
import os
import re
from werkzeug.security import generate_password_hash, check_password_hash

# Création d'un Blueprint Flask nommé 'routes'
bp = Blueprint('routes', __name__)

# Chemins vers les fichiers de données utilisateurs et sauvegardes
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'save_data')

# ===== Fonctions utilitaires pour les utilisateurs =====

def load_users():
    """Charge les données des utilisateurs depuis un fichier JSON."""
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    """Sauvegarde les données des utilisateurs vers un fichier JSON."""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)


# ===== Chargement des talents =====
def load_talents(classe):
    """Charge les talents de la classe spécifiée depuis un fichier JSON."""
    talents_path = os.path.join(os.path.dirname(__file__), 'static', 'talents', f'{classe.lower()}_talents.json')
    with open(talents_path, 'r') as file:
        return json.load(file)


# ===== Routes de navigation =====

@bp.route('/')
def home():
    """Affiche la page d'accueil (connexion/inscription)."""
    return render_template('index.html')


@bp.route('/menu')
def menu():
    """Affiche le menu principal après la connexion."""
    if 'username' not in session:
        return redirect(url_for('routes.home'))
    return render_template('menu.html', username=session['username'])


# ===== Routes pour la gestion des utilisateurs =====

@bp.route('/register', methods=['POST'])
def register():
    """Route pour créer un nouveau compte utilisateur."""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"message": "Champs vides"}), 400

    if not re.match(r'^[a-zA-Z0-9_-]{3,20}$', username):
        return jsonify({"message": "Nom d'utilisateur invalide"}), 400

    users = load_users()
    if username in users:
        return jsonify({"message": "Nom d'utilisateur déjà utilisé"}), 400

    hashed_password = generate_password_hash(password)
    users[username] = hashed_password
    save_users(users)

    return jsonify({"message": "Compte créé avec succès !"})


@bp.route('/login', methods=['POST'])
def login():
    """Route pour connecter un utilisateur existant."""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    users = load_users()
    if username not in users:
        return jsonify({"message": "Nom d'utilisateur inconnu"}), 400

    if not check_password_hash(users[username], password):
        return jsonify({"message": "Mot de passe incorrect"}), 401

    session['username'] = username
    return jsonify({"message": "Connexion réussie !", "redirect": url_for('routes.menu')})


@bp.route('/logout')
def logout():
    """Route pour déconnecter l'utilisateur actuel."""
    session.pop('username', None)
    return redirect(url_for('routes.home'))


# ===== Routes pour les parties =====

@bp.route('/nouvelle-partie', methods=['POST'])
def nouvelle_partie():
    """Crée une nouvelle partie avec une classe choisie par l'utilisateur."""
    if 'username' not in session:
        return redirect(url_for('routes.home'))

    username = session['username']
    classe = request.form.get('classe')

    if not classe or classe not in ['Paladin', 'Mage', 'Voleur', 'Barbare']:
        return "Classe invalide", 400

    stats_par_classe = {
        "Paladin": {"force": 8, "intelligence": 4, "agilite": 3, "vie": 120},
        "Mage": {"force": 2, "intelligence": 10, "agilite": 4, "vie": 80},
        "Voleur": {"force": 4, "intelligence": 5, "agilite": 9, "vie": 100},
        "Barbare": {"force": 10, "intelligence": 2, "agilite": 4, "vie": 140}
    }

    partie_initiale = {
        "niveau": 1,
        "experience": 0,
        "classe": classe,
        "statistiques": stats_par_classe[classe],
        "inventaire": [],
        "talents": load_talents(classe),
        "position": {"x": 0, "y": 0}
    }

    os.makedirs(SAVE_DIR, exist_ok=True)
    save_path = os.path.join(SAVE_DIR, f"{username}.json")

    with open(save_path, 'w') as f:
        json.dump(partie_initiale, f)

    return redirect(url_for('routes.jeu'))


@bp.route('/charger-partie')
def charger_partie():
    """Charge une partie existante (fonctionnalité à implémenter)."""
    return "Fonctionnalité à venir !", 200


@bp.route('/jeu')
def jeu():
    """Charge et affiche la page du jeu avec les données utilisateur sauvegardées."""
    if 'username' not in session:
        return redirect(url_for('routes.home'))

    username = session['username']
    save_path = os.path.join(SAVE_DIR, f"{username}.json")

    if not os.path.exists(save_path):
        return "Aucune sauvegarde trouvée", 404

    with open(save_path, 'r') as f:
        save_data = json.load(f)

    with open(os.path.join(os.path.dirname(__file__), 'static', 'maps', 'map1.json')) as f:
        map_data = json.load(f)

    rows = [map_data['layers'][0]['data'][i:i + map_data['width']] for i in range(0, len(map_data['layers'][0]['data']), map_data['width'])]

    return render_template('jeu.html', username=username, rows=rows, classe=save_data["classe"], save_data=save_data)
