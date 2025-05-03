from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, send_from_directory
import os
import json
from .auth import bp as auth_bp
from .player_manager import PlayerManager
from .utils import (
    charger_monstres,
    charger_talents_monstres
)
from .encounters import (
    generer_rencontre,
    supprimer_monstre
)

# === Initialisation ===
bp = Blueprint('routes', __name__)
bp.register_blueprint(auth_bp, url_prefix='/auth')  # Préfixe pour les routes d'auth

# === Chemins ===
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'save_data')

# === Routes principales ===
@bp.route('/')
def home():
    return render_template('index.html')

@bp.route('/menu')
def menu():
    if 'nom_utilisateur' not in session:
        return redirect(url_for('routes.home'))
    return render_template('menu.html', nom_utilisateur=session['nom_utilisateur'])

@bp.route('/jeu')
def jeu():
    if 'nom_utilisateur' not in session:
        return redirect(url_for('routes.home'))

    nom_utilisateur = session['nom_utilisateur']
    chemin_sauvegarde = os.path.join(SAVE_DIR, f"{nom_utilisateur}.json")

    if not os.path.exists(chemin_sauvegarde):
        return "Aucune sauvegarde trouvée", 404

    with open(chemin_sauvegarde, 'r') as f:
        donnees_sauvegarde = json.load(f)

    donnees_sauvegarde.setdefault("carte", "P1")

    return render_template(
        'jeu.html',
        nom_utilisateur=nom_utilisateur,
        classe=donnees_sauvegarde["classe"],
        donnees_sauvegarde=donnees_sauvegarde
    )

# === API ===
@bp.route('/api/rencontre')
def api_rencontre():
    try:
        try:
            x = int(request.args.get("x", "0"))
            y = int(request.args.get("y", "0"))
        except ValueError:
            return jsonify({"monstre": None, "erreur": "Coordonnées invalides"}), 400

        carte = request.args.get("carte", "P1")

      # Forcer un monstre si aucun n'est généré
        monstre_id = generer_rencontre(x, y, carte)
        if not monstre_id:
            print(f"[DEBUG] Aucun monstre généré pour x={x}, y={y}, carte={carte}")
            # Génération forcée d'un monstre de base
            monstre_id = "slime_lvl1"
            print(f"[DEBUG] Monstre forcé : {monstre_id}")

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
            print(f"[DEBUG] Race de monstre introuvable: {race_id}")
            # Fallback sur un slime si la race n'est pas trouvée
            monstre_race = next(m for m in monstres if m["id"] == "slime")
            print(f"[DEBUG] Utilisation du fallback : {monstre_race}")

        # On construit l'objet monstre final avec les stats dynamiques
        monstre = dict(monstre_race)
        monstre["id"] = monstre_id
        monstre["niveau"] = niveau
        monstre["talents"] = [talents_monstres[t] for t in monstre.get("talents", [])]
        # Les PV, ATK, DEF sont à calculer côté JS selon le niveau

        return jsonify({"monstre": monstre})

    except Exception as e:
        print(f"[ERREUR API /rencontre] {e} | x={request.args.get('x')} y={request.args.get('y')} carte={request.args.get('carte')}")
        # Dernier fallback : retourner un slime de niveau 1
        monstres = charger_monstres()
        monstre_fallback = next(m for m in monstres if m["id"] == "slime")
        monstre_fallback["id"] = "slime_lvl1"
        monstre_fallback["niveau"] = 1
        return jsonify({"monstre": monstre_fallback}), 500

@bp.route('/api/joueur/stats', methods=['GET'])
def get_joueur_stats():
    if 'nom_utilisateur' not in session:
        return jsonify({"erreur": "Non authentifié"}), 401
        
    joueur_data = PlayerManager.obtenir_donnees_joueur(session['nom_utilisateur'])
    if not joueur_data:
        return jsonify({"erreur": "Données du joueur non trouvées"}), 404
        
    return jsonify(joueur_data)

@bp.route('/api/joueur/stats', methods=['POST'])
def mettre_a_jour_joueur_stats():
    if 'nom_utilisateur' not in session:
        return jsonify({"erreur": "Non authentifié"}), 401
        
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Données invalides"}), 400
        
    if PlayerManager.mettre_a_jour_stats_joueur(session['nom_utilisateur'], data):
        return jsonify({"message": "Statistiques mises à jour avec succès"})
    else:
        return jsonify({"erreur": "Échec de la mise à jour des statistiques"}), 400

# --- Ajout d'expérience ---
@bp.route('/api/joueur/ajouter_xp', methods=['POST'])
def api_ajouter_xp():
    if 'nom_utilisateur' not in session:
        return jsonify({"erreur": "Non authentifié"}), 401
    data = request.get_json() or {}
    x = data.get('x')
    y = data.get('y')
    carte = data.get('carte')
    xp = int(data.get('xp', 0))
    # Supprimer le monstre actif après victoire
    supprimer_monstre(x, y, carte)
    # Ajoute l'expérience et effectue le level up
    if PlayerManager.ajouter_experience(session['nom_utilisateur'], xp):
        donnees_joueur = PlayerManager.obtenir_donnees_joueur(session['nom_utilisateur'])
        return jsonify({
            "niveau": donnees_joueur.get('niveau'),
            "experience": donnees_joueur.get('experience')
        })
    else:
        return jsonify({"erreur": "Impossible d'ajouter l'expérience"}), 400

@bp.route('/api/sauvegarder', methods=['POST'])
def api_sauvegarder():
    if 'nom_utilisateur' not in session:
        return jsonify({'erreur': 'Non authentifié'}), 401
    donnees_sauvegarde = request.get_json()
    if not donnees_sauvegarde:
        return jsonify({'erreur': 'Données manquantes'}), 400
    nom_utilisateur = session['nom_utilisateur']
    chemin_sauvegarde = os.path.join(SAVE_DIR, f"{nom_utilisateur}.json")
    try:
        os.makedirs(SAVE_DIR, exist_ok=True)
        with open(chemin_sauvegarde, 'w') as f:
            json.dump(donnees_sauvegarde, f, indent=2, ensure_ascii=False)
        return jsonify({'succes': True})
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

@bp.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(bp.root_path, 'static', 'js'), filename)
