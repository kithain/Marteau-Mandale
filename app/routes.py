from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
import json
import os
import re
from werkzeug.security import generate_password_hash, check_password_hash
from .player_manager import PlayerManager

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
    talents_path = os.path.join(os.path.dirname(__file__), 'static', 'talents', 'talents.json')
    with open(talents_path, 'r', encoding='utf-8') as file:
        talents_data = json.load(file)
    # Recherche des talents correspondant à la classe (insensible à la casse)
    for item in talents_data.get("classes", []):
        if item.get("class", "").lower() == classe.lower():
            return item.get("talents", [])
    return []

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
        "position": {"x": 0, "y": 0},
        "carte": "P7"  # carte de depart !
    }

    os.makedirs(SAVE_DIR, exist_ok=True)
    save_path = os.path.join(SAVE_DIR, f"{username}.json")

    with open(save_path, 'w') as f:
        json.dump(partie_initiale, f)

    return redirect(url_for('routes.jeu'))

@bp.route('/charger-partie')
def charger_partie():
    # Vérifie que l'utilisateur est connecté
    if 'username' not in session:
        return redirect(url_for('routes.home'))
    # Vérifie l'existence de la sauvegarde
    save_path = os.path.join(SAVE_DIR, f"{session['username']}.json")
    if not os.path.exists(save_path):
        return "Aucune sauvegarde trouvée", 404
    # Redirige vers le jeu avec la sauvegarde existante
    return redirect(url_for('routes.jeu'))

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

    # === AJOUT ICI POUR FORCER LES TALENTS SI ABSENTS ===
    if "talents" not in save_data or not save_data["talents"]:
        print(f"[INFO] Aucune donnée de talents pour {username}, rechargement...")
        save_data["talents"] = load_talents(save_data["classe"])

    save_data.setdefault("carte", "P1")

    return render_template(
        'jeu.html',
        username=username,
        classe=save_data["classe"],
        save_data=save_data
    )

@bp.route('/api/rencontre')
def api_rencontre():
    try:
        try:
            x = int(request.args.get("x", "0"))
            y = int(request.args.get("y", "0"))
        except ValueError:
            return jsonify({"monstre": None, "error": "Coordonnées invalides"}), 400

        carte = request.args.get("carte", "P1")

        monstre_id = generer_rencontre(x, y, carte)
        if not monstre_id:
            return jsonify({"monstre": None})

        # --- NOUVELLE LOGIQUE ---
        # monstre_id est du type idRace_lvlX (ex: gobelin_lvl3)
        # On extrait la race et le niveau
        if "_lvl" in monstre_id:
            race_id, niveau_str = monstre_id.rsplit("_lvl", 1)
            try:
                niveau = int(niveau_str)
            except ValueError:
                niveau = 1
        else:
            race_id = monstre_id
            niveau = 1

        monstres = charger_monstres()
        talents_monstres = charger_talents_monstres()

        # On cherche la race dans monstres.json
        monstre_race = next((m for m in monstres if m["id"] == race_id), None)
        if not monstre_race:
            return jsonify({"monstre": None, "error": "Race de monstre introuvable"}), 404

        # On construit l'objet monstre final avec les stats dynamiques
        monstre = dict(monstre_race)
        monstre["id"] = monstre_id
        monstre["niveau"] = niveau
        monstre["talents"] = [talents_monstres[t] for t in monstre.get("talents", [])]
        # Les PV, ATK, DEF sont à calculer côté JS selon le niveau

        return jsonify({"monstre": monstre})

    except Exception as e:
        print(f"[ERREUR API /rencontre] {e} | x={request.args.get('x')} y={request.args.get('y')} carte={request.args.get('carte')}")
        return jsonify({"monstre": None, "error": str(e)}), 500

@bp.route('/api/player/stats', methods=['GET'])
def get_player_stats():
    if 'username' not in session:
        return jsonify({"error": "Non authentifié"}), 401
        
    player_data = PlayerManager.get_player_data(session['username'])
    if not player_data:
        return jsonify({"error": "Données du joueur non trouvées"}), 404
        
    return jsonify(player_data)

@bp.route('/api/player/stats', methods=['POST'])
def update_player_stats():
    if 'username' not in session:
        return jsonify({"error": "Non authentifié"}), 401
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données invalides"}), 400
        
    if PlayerManager.update_player_stats(session['username'], data):
        return jsonify({"message": "Statistiques mises à jour avec succès"})
    else:
        return jsonify({"error": "Échec de la mise à jour des statistiques"}), 400

# --- Ajout d'expérience ---
@bp.route('/api/player/add_xp', methods=['POST'])
def api_add_xp():
    if 'username' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    data = request.get_json() or {}
    xp = int(data.get('xp', 0))
    # Ajoute l'expérience et effectue le level up
    if PlayerManager.add_experience(session['username'], xp):
        pd = PlayerManager.get_player_data(session['username'])
        return jsonify({
            "niveau": pd.get('niveau'),
            "experience": pd.get('experience')
        })
    else:
        return jsonify({"error": "Impossible d'ajouter l'expérience"}), 400

@bp.route('/api/save', methods=['POST'])
def api_save():
    if 'username' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    save_data = request.get_json()
    if not save_data:
        return jsonify({'error': 'Données manquantes'}), 400
    username = session['username']
    save_path = os.path.join(SAVE_DIR, f"{username}.json")
    try:
        os.makedirs(SAVE_DIR, exist_ok=True)
        with open(save_path, 'w') as f:
            json.dump(save_data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
