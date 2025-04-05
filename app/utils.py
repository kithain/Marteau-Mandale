import os
import json
import random

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
    """Charge les probabilités de rencontres d'une carte donnée."""
    path = os.path.join(MAPS_DIR, f'rencontres_{nom_carte}.json')
    return charger_json(path) if os.path.exists(path) else {"zones": []}

def generer_rencontre(x, y, nom_carte="map1"):
    """Génère un monstre selon la zone et les probabilités de la carte."""
    table = charger_table_rencontres(nom_carte)
    for zone in table.get("zones", []):
        if zone["x"][0] <= x <= zone["x"][1] and zone["y"][0] <= y <= zone["y"][1]:
            pool = [
                r["monstre_id"]
                for r in zone["rencontres"]
                for _ in range(r["probabilite"])
            ]
            return random.choice(pool) if pool else None
    return None
