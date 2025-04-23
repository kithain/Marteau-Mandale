import os
import json
import random
from .utils_rencontres import choisir_monstre
# === dernieres rencontres ===
dernieres_rencontres = {}  # Clé = (x, y, carte), valeur = compte à rebours
# === Chemins de base ===
BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, 'static')
MONSTRE_DIR = os.path.join(STATIC_DIR, 'monstres')
MAPS_DIR = os.path.join(STATIC_DIR, 'maps')

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
    return data.get(nom_carte, {"zones": []})

def generer_rencontre(x, y, nom_carte="map1"):
    key = f"{x},{y},{nom_carte}"

    # 🔒 Anti-rencontre : délai
    if key in dernieres_rencontres and dernieres_rencontres[key] > 0:
        print(f"[DEBUG] ⏳ Rencontre temporairement désactivée ({key}) ({dernieres_rencontres[key]} restants)")
        dernieres_rencontres[key] -= 1
        return None

    if est_tuile_bloquee(x, y, nom_carte):
        print(f"[DEBUG] 🚫 Tuile bloquée à ({x}, {y}) sur {nom_carte}")
        return None

    # --- Nouvelle logique : sélection dynamique du monstre selon la difficulté calculée ---
    ligne = nom_carte[0]  # ex: 'O' pour 'O7'
    colonne = int(nom_carte[1:])  # ex: 7 pour 'O7'
    monstre_id = choisir_monstre(ligne, colonne)
    print(f"[DEBUG] Monstre choisi dynamiquement pour {nom_carte} ({ligne}{colonne}): {monstre_id}")
    cooldown = 3  # cooldown générique, à adapter si besoin
    dernieres_rencontres[key] = cooldown
    return monstre_id

def est_tuile_bloquee(x, y, nom_carte):
    """Vérifie si la tuile est bloquée dans le calque obstacles de la map TMJ."""
    path = os.path.join(MAPS_DIR, f"{nom_carte}.tmj")
    if not os.path.exists(path):
        return False  # si on n’a pas la map, on suppose que c’est libre... tristement.

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    largeur = data.get("width", 15)
    obstacle_layer = next((l for l in data["layers"] if l["name"] == "obstacles" and l["type"] == "tilelayer"), None)
    if not obstacle_layer:
        return False

    index = y * largeur + x
    return obstacle_layer["data"][index] != 0