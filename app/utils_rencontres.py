import json
import random
import os

def get_difficulty(ligne: str, colonne: int):
    ligne_index = ord(ligne.upper()) - ord('A') + 1  # 'A' = 1, ..., 'P' = 16
    colonne_index = colonne  # 1 to 8
    max_distance = (16 - 1) + (8 - 1)  # 15 + 7 = 22
    distance = (ligne_index - 1) + (colonne_index - 1)
    difficulty = 10 - (distance / max_distance) * 9
    return max(1, min(10, round(difficulty)))  # valeur entière de 1 à 10

def get_monstre_difficulty(monstre_id):
    # Cherche la difficulté du monstre dans monstres.json
    path = os.path.join(
        os.path.dirname(__file__),
        'static', 'monstres', 'monstres.json'
    )
    with open(path, encoding="utf-8") as f:
        monstres = json.load(f)
        for m in monstres:
            if m["id"] == monstre_id:
                return m["difficulte"]
    return 1  # défaut si non trouvé

def get_possible_monstres(difficulty):
    path = os.path.join(
        os.path.dirname(__file__),
        'static', 'rencontres', f'difficulte_{difficulty}.json'
    )
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def choisir_monstre(ligne, colonne):
    difficulty = get_difficulty(ligne, colonne)
    rencontres = get_possible_monstres(difficulty)
    population = [r["monstre_id"] for r in rencontres]
    weights = [r.get("probabilite", 1) for r in rencontres]
    return random.choices(population, weights=weights, k=1)[0]
