from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
import json
import os
import re
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('routes', __name__)
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'save_data')


# === Gestion des utilisateurs ===
def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)


# === Page d'accueil ===
@bp.route('/')
def home():
    return render_template('index.html')


# === Page de menu après login ===
@bp.route('/menu')
def menu():
    if 'username' not in session:
        return redirect(url_for('routes.home'))
    return render_template('menu.html', username=session['username'])


# === Création de compte ===
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Validation du nom d'utilisateur
    if not username or not password:
        return jsonify({"message": "Champs vides"}), 400

    if not re.match(r'^[a-zA-Z0-9_-]{3,20}$', username):
        return jsonify({"message": "Nom d'utilisateur invalide (3-20 caractères, lettres, chiffres, _ ou -)"}), 400

    users = load_users()

    if username in users:
        return jsonify({"message": "Nom d'utilisateur déjà utilisé"}), 400

    # Hash du mot de passe
    hashed_password = generate_password_hash(password)
    users[username] = hashed_password
    save_users(users)

    return jsonify({"message": "Compte créé avec succès !"})


# === Connexion ===
@bp.route('/login', methods=['POST'])
def login():
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


# === Déconnexion ===
@bp.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('routes.home'))


# === Nouvelle partie ===
@bp.route('/nouvelle-partie', methods=['POST'])
def nouvelle_partie():
    if 'username' not in session:
        return redirect(url_for('routes.home'))

    username = session['username']
    classe = request.form.get('classe')  # ou request.json.get('classe') selon ton front

    if not classe or classe not in ['Paladin', 'Mage', 'Voleur', 'Barbare']:
        return "Classe invalide", 400

    # Statistiques initiales selon la classe
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
        "position": {"x": 0, "y": 0}
    }

    os.makedirs(SAVE_DIR, exist_ok=True)
    save_path = os.path.join(SAVE_DIR, f"{username}.json")

    with open(save_path, 'w') as f:
        json.dump(partie_initiale, f)

    return redirect(url_for('routes.jeu'))
# === charger partie ===
@bp.route('/charger-partie')
def charger_partie():
    # Fonction temporaire pour éviter l'erreur
    return "Fonctionnalité à venir !", 200

# === Page de jeu ===
@bp.route('/jeu')
def jeu():
    if 'username' not in session:
        return redirect(url_for('routes.home'))

    username = session['username']
    save_path = os.path.join(SAVE_DIR, f"{username}.json")

    # On récupère les infos de la sauvegarde
    if not os.path.exists(save_path):
        return "Aucune sauvegarde trouvée", 404

    with open(save_path, 'r') as f:
        save_data = json.load(f)

    player_class = save_data.get("classe", "paladin")  # valeur par défaut en cas d'oubli

    map_path = os.path.join(os.path.dirname(__file__), 'static', 'maps', 'map1.json')
    with open(map_path, 'r') as f:
        map_data = json.load(f)

    tiles = map_data['layers'][0]['data']
    width = map_data['width']
    height = map_data['height']
    rows = [tiles[i:i + width] for i in range(0, len(tiles), width)]

    return render_template('jeu.html', username=username, rows=rows, classe=player_class)
