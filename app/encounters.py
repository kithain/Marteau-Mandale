"""
Gestion des rencontres avec les monstres dans le jeu
"""
import os
import json
import random
from .monsters_config import choisir_monstre

# === dernieres rencontres ===
dernieres_rencontres = {}  # Clé = (x, y, carte), valeur = compte à rebours

# Dictionnaire pour suivre les monstres actifs (clé: position, valeur: True)
monstres_actifs = {}

def charger_table_rencontres(nom_carte):
    """Charge la table des rencontres pour une carte donnée"""
    path = os.path.join(os.path.dirname(__file__), 'static', 'maps', 'rencontres_global.json')
    if not os.path.exists(path):
        print("[DEBUG] ❌ Fichier rencontres_global.json introuvable")
        return {"zones": []}
    data = json.load(open(path, 'r', encoding='utf-8'))
    print(f"[DEBUG] 🔍 Lecture des rencontres pour la carte {nom_carte}")
    return data.get(nom_carte, {"zones": []})

def generer_rencontre(x, y, nom_carte="map1"):
    """Génère une rencontre avec un monstre à la position donnée"""
    key = f"{x},{y},{nom_carte}"
    print(f"[DEBUG] 🎲 Génération de rencontre : {key}")

    # Vérifier s'il y a déjà un monstre actif sur la carte
    if any(monstres_actifs.values()):
        print(f"[DEBUG] ⚠️ Un monstre est déjà présent sur la carte - pas de nouvelle génération")
        return None

    # Anti-rencontre : délai
    if key in dernieres_rencontres and dernieres_rencontres[key] > 0:
        print(f"[DEBUG] ⏳ Rencontre temporairement désactivée ({key}) ({dernieres_rencontres[key]} restants)")
        dernieres_rencontres[key] -= 1
        return None

    # Probabilité de rencontre
    if random.random() < 0.5:  # 50% de chance de rencontre
        print(f"[DEBUG] 🎲 Pas de rencontre cette fois")
        return None

    monstre_id = choisir_monstre(nom_carte[0], int(nom_carte[1:]))
    print(f"[DEBUG] Monstre choisi dynamiquement pour {nom_carte}: {monstre_id}")
    cooldown = 3  # cooldown générique
    dernieres_rencontres[key] = cooldown
    monstres_actifs[key] = True
    return monstre_id

def supprimer_monstre(x, y, nom_carte):
    """Supprime un monstre actif après sa défaite"""
    key = f"{x},{y},{nom_carte}"
    if key in monstres_actifs:
        del monstres_actifs[key]
        print(f"[DEBUG] Monstre à {key} supprimé des actifs")
    else:
        print(f"[DEBUG] Aucun monstre actif trouvé à {key}")
