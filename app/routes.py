from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
import json
import os
import re
from werkzeug.security import generate_password_hash, check_password_hash

# === Import des fonctions utilitaires ===
from .utils import (
    generer_rencontre,
    charger_monstres,
    charger_talents_monstres
)

# === Création du blueprint Flask ===
bp = Blueprint('routes', __name__)

# === Chemins de fichiers ===
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'save_data')

# === Fonctions utilisateurs ===

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def load_talents(classe):
    talents_path = os.path.join(os.path.dirname(__file__), 'static', 'talents', f'{classe.lower()}_talents.json')
    with open(talents_path, 'r') as file:
        return json.load(file)

# === Routes ===

@bp.route('/')
def home():
    return render_template('index.html')

@bp.route('/menu')
def menu():
    if 'username' not in session:
        return redirect(url_for('routes.home'))
    return render_template('menu.html', username=session['username'])

@bp.route('/register', methods=['POST'])
def register():
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
    session.pop('username', None)
    return redirect(url_for('routes.home'))

@bp.route('/nouvelle-partie', methods=['POST'])
def nouvelle_partie():
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
    return "Fonctionnalité à venir !", 200

@bp.route('/jeu')
def jeu():
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

@bp.route('/api/rencontre')
def api_rencontre():
    try:
        x = int(request.args.get("x", 0))
        y = int(request.args.get("y", 0))
        carte = request.args.get("carte", "map1")

        monstre_id = generer_rencontre(x, y, carte)
        if not monstre_id:
            return jsonify({"monstre": None})

        monstres = charger_monstres()
        talents_monstres = charger_talents_monstres()

        monstre = next((m for m in monstres if m["id"] == monstre_id), None)
        if not monstre:
            return jsonify({"monstre": None})

        monstre["talents"] = [talents_monstres[t] for t in monstre.get("talents", [])]
        return jsonify({"monstre": monstre})
    except Exception as e:
        print(f"[ERREUR API /rencontre] {e}")
        return jsonify({"monstre": None, "error": str(e)}), 500
