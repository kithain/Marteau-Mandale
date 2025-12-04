import os
import json
import random
from .config import STATS_PAR_CLASSE

# === Chemins de base ===
BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, 'static')
MONSTRE_DIR = os.path.join(STATIC_DIR, 'monstres')
MAPS_DIR = os.path.join(STATIC_DIR, 'maps')

USERS_FILE = os.path.join(BASE_DIR, 'users.json')
SAVE_DIR = os.path.join(BASE_DIR, '..', 'save_data')

# === Gestion des Utilisateurs et Sauvegardes ===

def load_users():
    """Charge la base de données des utilisateurs."""
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    """Sauvegarde la base de données des utilisateurs."""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def load_talents(classe):
    """Charge les talents spécifiques à une classe."""
    talents_path = os.path.join(STATIC_DIR, 'talents', 'talents.json')
    try:
        with open(talents_path, 'r', encoding='utf-8') as file:
            talents_data = json.load(file)
        # Recherche des talents correspondant à la classe (insensible à la casse)
        for item in talents_data.get("classes", []):
            if item.get("class", "").lower() == classe.lower():
                return item.get("talents", [])
    except FileNotFoundError:
        print(f"[WARN] Fichier de talents introuvable : {talents_path}")
    return []

def creer_partie_initiale(username, classe):
    """Crée et sauvegarde une nouvelle partie pour un utilisateur."""
    if classe not in STATS_PAR_CLASSE:
        raise ValueError("Classe invalide")

    partie_initiale = {
        "niveau": 1,
        "experience": 0,
        "classe": classe,
        "statistiques": STATS_PAR_CLASSE[classe],
        "inventaire": [],
        "talents": load_talents(classe),
        "position": None,
        "carte": "P7"  # carte de depart
    }

    os.makedirs(SAVE_DIR, exist_ok=True)
    save_path = os.path.join(SAVE_DIR, f"{username}.json")
    
    sauvegarder_json(save_path, partie_initiale)
    return partie_initiale

def get_save_path(username):
    """Retourne le chemin du fichier de sauvegarde d'un joueur."""
    return os.path.join(SAVE_DIR, f"{username}.json")

def load_game_data(username):
    """Charge les données de jeu d'un utilisateur."""
    path = get_save_path(username)
    if not os.path.exists(path):
        return None
    return charger_json(path)

def save_game_data(username, data):
    """Sauvegarde les données de jeu d'un utilisateur."""
    path = get_save_path(username)
    sauvegarder_json(path, data)

# === dernieres rencontres (par utilisateur) ===

def get_dernieres_rencontres():
    """Retourne le dictionnaire des dernières rencontres depuis la session Flask."""
    from flask import session
    if 'dernieres_rencontres' not in session:
        session['dernieres_rencontres'] = {}
    return session['dernieres_rencontres']

# === Fonctions utilitaires ===

def charger_json(path):
    """Ouvre et retourne le contenu d’un fichier JSON."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def sauvegarder_json(path, data):
    """Sauvegarde des données dans un fichier JSON."""
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# === Monstres ===

def charger_monstres():
    """Charge la liste complète des monstres depuis monstres.json."""
    return charger_json(os.path.join(MONSTRE_DIR, 'monstres.json'))

def charger_talents_monstres():
    """Charge tous les talents possibles pour les monstres."""
    return charger_json(os.path.join(MONSTRE_DIR, 'talents_monstres.json'))

# === Rencontres ===

def charger_table_rencontres(nom_carte):
    path = os.path.join(MAPS_DIR, 'rencontres_global.json')
    if not os.path.exists(path):
        print("[DEBUG] ❌ Fichier rencontres_global.json introuvable")
        return {"zones": []}
    data = charger_json(path)
    print(f"[DEBUG] 🔍 Lecture des rencontres pour la carte {nom_carte}")
    # Nouveau format simplifié: {"A1": 10, "A2": 9, ...}
    return data.get(nom_carte, 1)  # Retourne directement la difficulté

# Table des monstres par difficulté (définie une seule fois)
MONSTRES_PAR_DIFFICULTE = {
    1: [("slime", 70), ("gobelin", 30)],
    2: [("slime", 60), ("gobelin", 35), ("bandit", 5)],
    3: [("slime", 40), ("gobelin", 40), ("bandit", 15), ("skull", 5)],
    4: [("gobelin", 30), ("bandit", 30), ("homme_lezard", 25), ("skull", 15)],
    5: [("bandit", 25), ("homme_lezard", 25), ("orc", 20), ("ghost", 15), ("skull", 15)],
    6: [("orc", 25), ("homme_lezard", 20), ("ghost", 20), ("ghost_miner", 15), ("geunaude", 20)],
    7: [("orc", 20), ("homme_arbre", 25), ("ghost_miner", 20), ("geunaude", 20), ("élémentaire_eau", 15)],
    8: [("homme_arbre", 20), ("golem", 15), ("éfrit", 20), ("élémentaire_feu", 20), ("élémentaire_air", 25)],
    9: [("golem", 25), ("éfrit", 25), ("élémentaire_feu", 20), ("élémentaire_terre", 20), ("élémentaire_air", 10)],
    10: [("golem", 30), ("éfrit", 25), ("élémentaire_feu", 15), ("élémentaire_terre", 20), ("élémentaire_eau", 10)],
}

def generer_rencontre(x, y, nom_carte="map1"):
    """Génère une rencontre et retourne (monstre_id, difficulte) ou (None, None)."""
    from flask import session
    key = nom_carte  # Cooldown par carte, pas par tuile
    dernieres_rencontres = get_dernieres_rencontres()

    # 🔒 Anti-rencontre : délai
    if key in dernieres_rencontres and dernieres_rencontres[key] > 0:
        dernieres_rencontres[key] -= 1
        session['dernieres_rencontres'] = dernieres_rencontres
        return None, None

    if est_tuile_bloquee(x, y, nom_carte):
        return None, None

    # Récupérer la difficulté de la carte (nouveau format simplifié)
    difficulte = charger_table_rencontres(nom_carte)
    
    # Chance: 30% + 7% par niveau (Diff 1=37%, Diff 10=100%)
    chance = min(0.30 + 0.07 * difficulte, 1.0)
    if random.random() > chance:
        return None, None

    # Sélection du monstre
    monstres = MONSTRES_PAR_DIFFICULTE.get(difficulte, MONSTRES_PAR_DIFFICULTE[1])
    pool = [m for m, p in monstres for _ in range(p)]
    choisi = random.choice(pool)
    
    # Cooldown scalé: plus la difficulté est haute, moins on attend
    # Diff 1 = 5 pas, Diff 10 = 2 pas (linéaire)
    cooldown = max(2, 6 - (difficulte // 2))
    
    print(f"[DEBUG] 🎲 {choisi} (diff {difficulte}, cooldown {cooldown})")
    dernieres_rencontres[key] = cooldown
    session['dernieres_rencontres'] = dernieres_rencontres
    return choisi, difficulte



def est_tuile_bloquee(x, y, nom_carte):
    """Vérifie si la tuile est bloquée dans le calque obstacles de la map TMJ."""
    path = os.path.join(MAPS_DIR, f"{nom_carte}.tmj")
    if not os.path.exists(path):
        return False  # si on n’a pas la map, on suppose que c’est libre... tristement.

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    largeur = data.get("width", 15)
    hauteur = data.get("height", 15)
    
    # Vérification des limites
    if x < 0 or x >= largeur or y < 0 or y >= hauteur:
        return True  # Hors limites = bloqué
    
    obstacle_layer = next((l for l in data["layers"] if l["name"] == "obstacles" and l["type"] == "tilelayer"), None)
    if not obstacle_layer:
        return False

    index = y * largeur + x
    if index < 0 or index >= len(obstacle_layer["data"]):
        return True  # Index invalide = bloqué
    
    return obstacle_layer["data"][index] != 0