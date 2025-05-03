import os
import json

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