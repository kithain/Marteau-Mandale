"""
Gestion de l'authentification et des sauvegardes de parties
"""
from flask import Blueprint, request, jsonify, session, redirect, url_for
import os
import json
from functools import wraps

bp = Blueprint('auth', __name__)

# === Chemins de fichiers ===
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'save_data')
USERS_FILE = os.path.join(SAVE_DIR, 'users.json')

# === Décorateurs ===

def login_required(f):
    """Vérifie que l'utilisateur est connecté"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'nom_utilisateur' not in session:
            return redirect(url_for('auth.home'))
        return f(*args, **kwargs)
    return decorated

# === Fonctions utilisateurs ===

def charger_utilisateurs():
    """Charge la liste des utilisateurs"""
    if not os.path.exists(USERS_FILE):
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def sauvegarder_utilisateurs(utilisateurs):
    """Sauvegarde les utilisateurs"""
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, 'w') as f:
        json.dump(utilisateurs, f)

# === Routes ===

@bp.route('/inscription', methods=['POST'])
def inscription():
    data = request.get_json()
    nom_utilisateur = data.get('nom_utilisateur', '').strip()
    mot_de_passe = data.get('mot_de_passe', '').strip()

    if not nom_utilisateur or not mot_de_passe:
        return jsonify({"erreur": "Champs vides"}), 400

    utilisateurs = charger_utilisateurs()
    if nom_utilisateur in utilisateurs:
        return jsonify({"erreur": "Nom déjà pris"}), 400

    utilisateurs[nom_utilisateur] = {"mot_de_passe": mot_de_passe}
    sauvegarder_utilisateurs(utilisateurs)
    return jsonify({"message": "Compte créé !"})

@bp.route('/connexion', methods=['POST'])
def connexion():
    data = request.get_json()
    nom_utilisateur = data.get('nom_utilisateur', '').strip()
    mot_de_passe = data.get('mot_de_passe', '').strip()

    utilisateurs = charger_utilisateurs()
    utilisateur = utilisateurs.get(nom_utilisateur)

    if not utilisateur or utilisateur.get("mot_de_passe") != mot_de_passe:
        return jsonify({"erreur": "Identifiants incorrects"}), 401

    session['nom_utilisateur'] = nom_utilisateur
    return jsonify({"message": "Connexion réussie !", "redirect": url_for('routes.menu')})

@bp.route('/deconnexion')
def deconnexion():
    session.pop('nom_utilisateur', None)
    return redirect(url_for('routes.home'))

@bp.route('/nouvelle-partie', methods=['POST'])
@login_required
def nouvelle_partie():
    nom_utilisateur = session['nom_utilisateur']
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
        "position": {"x": 0, "y": 0},
        "carte": "P7"
    }

    os.makedirs(SAVE_DIR, exist_ok=True)
    chemin_sauvegarde = os.path.join(SAVE_DIR, f"{nom_utilisateur}.json")

    with open(chemin_sauvegarde, 'w') as f:
        json.dump(partie_initiale, f)

    return redirect(url_for('routes.jeu'))

@bp.route('/charger-partie')
@login_required
def charger_partie():
    """Charge une partie existante"""
    chemin_sauvegarde = os.path.join(SAVE_DIR, f"{session['nom_utilisateur']}.json")
    if not os.path.exists(chemin_sauvegarde):
        return "Aucune sauvegarde trouvée", 404
    return redirect(url_for('routes.jeu'))
