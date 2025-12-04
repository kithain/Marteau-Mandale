from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
import re
from werkzeug.security import generate_password_hash, check_password_hash

from .config import CLASSES_DISPONIBLES
from .utils import (
    load_users, save_users, load_talents,
    creer_partie_initiale, load_game_data, save_game_data,
    generer_rencontre, charger_monstres, charger_talents_monstres
)

# === Création du blueprint Flask ===
bp = Blueprint('routes', __name__)

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

    if not classe or classe not in CLASSES_DISPONIBLES:
        return "Classe invalide", 400

    try:
        creer_partie_initiale(username, classe)
    except ValueError as e:
        return str(e), 400

    return redirect(url_for('routes.jeu'))

@bp.route('/charger-partie')
def charger_partie():
    return "Fonctionnalité à venir !", 200

@bp.route('/jeu')
def jeu():
    if 'username' not in session:
        return redirect(url_for('routes.home'))

    username = session['username']
    save_data = load_game_data(username)

    if not save_data:
        return "Aucune sauvegarde trouvée", 404

    # === AJOUT ICI POUR FORCER LES TALENTS SI ABSENTS ===
    if "talents" not in save_data or not save_data["talents"]:
        print(f"[INFO] Aucune donnée de talents pour {username}, rechargement...")
        save_data["talents"] = load_talents(save_data["classe"])

    save_data.setdefault("carte", "P1")
    save_data.setdefault("niveau", 1)
    save_data.setdefault("experience", 0)
    save_data.setdefault("potions", 0)
    save_data.setdefault("pv", save_data.get("statistiques", {}).get("vie", 100))
    save_data.setdefault("pvMax", save_data.get("statistiques", {}).get("vie", 100))
    save_data.setdefault("bonusDegats", 0)

    return render_template(
        'jeu.html',
        username=username,
        classe=save_data["classe"],
        save_data=save_data
    )

@bp.route('/api/save-stats', methods=['POST'])
def save_stats():
    """Sauvegarde les stats du joueur (niveau, XP, or, potions, PV)"""
    if 'username' not in session:
        return jsonify({"error": "Non connecté"}), 401
    
    username = session['username']
    save_data = load_game_data(username)
    
    if not save_data:
        return jsonify({"error": "Aucune sauvegarde"}), 404
    
    try:
        data = request.get_json()
        
        # === VALIDATION DES DONNEES ===
        # Empêcher les valeurs négatives ou absurdes
        
        # Validation Niveau (max 100 par sécurité, ou cohérent avec l'ancien)
        nouv_niveau = data.get('niveau')
        if nouv_niveau is not None:
            if not isinstance(nouv_niveau, int) or nouv_niveau < 1 or nouv_niveau > 100:
                 return jsonify({"error": "Niveau invalide"}), 400
            # On pourrait vérifier que le niveau n'a pas augmenté de plus de 1 d'un coup, 
            # mais laissons de la souplesse pour le debug ou les gains multiples.

        # Validation XP (positif)
        nouv_xp = data.get('xp')
        if nouv_xp is not None and (not isinstance(nouv_xp, int) or nouv_xp < 0):
            return jsonify({"error": "XP invalide"}), 400
        
        # Validation Potions (positif, max 50)
        nouv_potions = data.get('potions')
        if nouv_potions is not None and (not isinstance(nouv_potions, int) or nouv_potions < 0 or nouv_potions > 50):
             return jsonify({"error": "Nombre de potions invalide"}), 400

        # Validation PV (positif, ne doit pas dépasser PV Max + marge)
        nouv_pv = data.get('pv')
        nouv_pvMax = data.get('pvMax')
        
        # Si on met à jour PV Max, on vérifie qu'il est cohérent (>0 et < 10000)
        if nouv_pvMax is not None and (not isinstance(nouv_pvMax, int) or nouv_pvMax < 1 or nouv_pvMax > 10000):
             return jsonify({"error": "PV Max invalide"}), 400
             
        val_pv_max = nouv_pvMax if nouv_pvMax is not None else save_data.get('pvMax', 100)
        
        if nouv_pv is not None:
             if not isinstance(nouv_pv, int) or nouv_pv < 0 or nouv_pv > val_pv_max + 50: # +50 de marge pour buffs temporaires éventuels
                 return jsonify({"error": "PV invalides"}), 400

        # === FIN VALIDATION ===

        # Mettre à jour les stats
        champs_a_mettre_a_jour = [
            'niveau', 'experience', 'potions', 'pv', 'pvMax', 
            'bonusDegats', 'position', 'carte'
        ]

        for champ in champs_a_mettre_a_jour:
            # Mapping entre nom champ front et back (experience vs xp)
            cle_front = 'xp' if champ == 'experience' else champ
            
            if cle_front in data:
                save_data[champ] = data[cle_front]
        
        save_game_data(username, save_data)
        
        return jsonify({"success": True})
    
    except Exception as e:
        print(f"[ERREUR] save_stats: {e}")
        return jsonify({"error": str(e)}), 500

@bp.route('/api/rencontre')
def api_rencontre():
    try:
        try:
            x = int(request.args.get("x", "0"))
            y = int(request.args.get("y", "0"))
        except ValueError:
            return jsonify({"monstre": None, "error": "Coordonnées invalides"}), 400

        carte = request.args.get("carte", "P1")

        monstre_id, difficulte = generer_rencontre(x, y, carte)
        if not monstre_id:
            return jsonify({"monstre": None})

        monstres = charger_monstres()
        talents_monstres = charger_talents_monstres()

        monstre = next((m for m in monstres if m["id"] == monstre_id), None)
        if not monstre:
            return jsonify({"monstre": None, "error": "Monstre introuvable"}), 404

        # Copie du monstre pour éviter de modifier l'objet original
        monstre = {**monstre}
        # Ajouter la difficulté au monstre pour le scaling côté client
        monstre["difficulte"] = difficulte or 1
        
        # Calcul des PV Max scalés (PV de base * multiplicateur de difficulté)
        # Multiplicateur : 1.0 à diff 1, +15% par niveau de diff sup
        base_pv = monstre.get("pvBase", 30 + (difficulte * 5)) # Fallback si pas de pvBase
        scale_factor = 1 + (difficulte - 1) * 0.15
        monstre["pvMax"] = int(base_pv * scale_factor)
        monstre["pv"] = monstre["pvMax"] # PV actuels au max au début du combat

        # Utilisation de .get() pour éviter KeyError si un talent n'existe pas
        monstre["talents"] = [talents_monstres.get(t, {"nom": t, "effet": "inconnu"}) for t in monstre.get("talents", [])]
        return jsonify({"monstre": monstre})

    except Exception as e:
        print(f"[ERREUR API /rencontre] {e} | x={request.args.get('x')} y={request.args.get('y')} carte={request.args.get('carte')}")
        return jsonify({"monstre": None, "error": str(e)}), 500

