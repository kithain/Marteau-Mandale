"""
Utilitaires pour la gestion des cartes du jeu
"""
import os
import json

def est_tuile_bloquee(x, y, nom_carte):
    """Vérifie si la tuile est bloquée dans le calque obstacles de la map TMJ."""
    path = os.path.join(os.path.dirname(__file__), 'static', 'maps', f"{nom_carte}.tmj")
    if not os.path.exists(path):
        return False  # si on n’a pas la map, on suppose que c’est libre

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    largeur = data.get("width", 15)
    obstacle_layer = next((l for l in data["layers"] if l["name"] == "obstacles" and l["type"] == "tilelayer"), None)
    if not obstacle_layer:
        return False

    index = y * largeur + x
    return obstacle_layer["data"][index] != 0
