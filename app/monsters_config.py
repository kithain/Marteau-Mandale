"""
Configuration des monstres et logique de sélection par difficulté
"""
import json
import random
import os
from .utils import MONSTRE_DIR  # Utilise le chemin centralisé

# Cache pour les données JSON
_MONSTRES_CACHE = None
_RENCONTRES_CACHE = {}

def get_difficulty(ligne: str, colonne: int) -> int:
    """
    Calcule la difficulté (1-10) basée sur la position géographique.
    Ex: 'A1' = difficile (10), 'P8' = facile (1)
    """
    ligne_index = ord(ligne.upper()) - ord('A') + 1
    distance = (ligne_index - 1) + (colonne - 1)
    difficulty = 10 - (distance / 22) * 9  # 22 = distance max (A1->P8)
    return max(1, min(10, round(difficulty)))

def _load_monstres():
    """Charge une fois le fichier monstres.json"""
    global _MONSTRES_CACHE
    if _MONSTRES_CACHE is None:
        path = os.path.join(MONSTRE_DIR, 'monstres.json')
        with open(path, encoding="utf-8") as f:
            _MONSTRES_CACHE = json.load(f)
    return _MONSTRES_CACHE

def get_monstre_difficulty(monstre_id: str) -> int:
    """Récupère la difficulté d'un monstre spécifique"""
    for m in _load_monstres():
        if m["id"] == monstre_id:
            return m["difficulte"]
    return 1  # défaut

def _load_rencontres(difficulty: int):
    """Charge le fichier de rencontres pour une difficulté"""
    if difficulty not in _RENCONTRES_CACHE:
        path = os.path.join(MONSTRE_DIR, f'difficulte_{difficulty}.json')
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                _RENCONTRES_CACHE[difficulty] = json.load(f)
    return _RENCONTRES_CACHE.get(difficulty, [])

def choisir_monstre(ligne: str, colonne: int) -> str:
    """
    Sélectionne un monstre adapté à la position donnée.
    Retourne un ID de monstre (ex: 'slime_lvl1')
    """
    difficulty = get_difficulty(ligne, colonne)
    rencontres = _load_rencontres(difficulty) or _load_rencontres(1)  # fallback
    
    population = [r["monstre_id"] for r in rencontres] if rencontres else ["slime_lvl1"]
    weights = [r.get("probabilite", 1) for r in rencontres] if rencontres else [1]
    
    return random.choices(population, weights=weights, k=1)[0]
