import json
import random
import os

def get_difficulty(ligne: str, colonne: int):
    ligne_index = ord(ligne.upper()) - ord('A') + 1  # 'A' = 1, ..., 'P' = 16
    colonne_index = colonne  # 1 to 8
    max_distance = (16 - 1) + (8 - 1)  # 15 + 7 = 22
    distance = (ligne_index - 1) + (colonne_index - 1)
    
    # Calcul détaillé pour le débogage
    print(f"[DEBUG] Calcul de difficulté:")
    print(f"  Ligne: {ligne} (index: {ligne_index})")
    print(f"  Colonne: {colonne} (index: {colonne_index})")
    print(f"  Distance max: {max_distance}")
    print(f"  Distance calculée: {distance}")
    
    difficulty = 10 - (distance / max_distance) * 9
    result = max(1, min(10, round(difficulty)))
    
    print(f"  Difficulté calculée: {difficulty}")
    print(f"  Difficulté finale: {result}")
    
    return result

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
    print(f"[DEBUG] Calcul de difficulté pour {ligne}{colonne}: {difficulty}")
    
    try:
        rencontres = get_possible_monstres(difficulty)
        print(f"[DEBUG] Rencontres possibles (difficulté {difficulty}):", rencontres)
        
        # Si aucune rencontre, force à la difficulté 1
        if not rencontres:
            print("[DEBUG] Aucune rencontre trouvée, forçage à difficulté 1")
            difficulty = 1
            rencontres = get_possible_monstres(difficulty)
        
        # Toujours générer un monstre
        population = [r["monstre_id"] for r in rencontres] or ["slime_lvl1"]
        weights = [r.get("probabilite", 1) for r in rencontres] or [1]
        
        monstre_choisi = random.choices(population, weights=weights, k=1)[0]
        print(f"[DEBUG] Monstre choisi: {monstre_choisi}")
        
        return monstre_choisi
    except Exception as e:
        print(f"[ERREUR] Échec de sélection de monstre : {e}")
        return "slime_lvl1"  # Monstre par défaut en cas d'erreur
