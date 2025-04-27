import pprint

def obtenir_difficulte(ligne: str, colonne: int):
    """Calcule la difficulté d'une case selon sa position"""
    index_ligne = ord(ligne.upper()) - ord('A') + 1
    index_colonne = colonne
    distance_max = (16 - 1) + (8 - 1)
    distance = (index_ligne - 1) + (index_colonne - 1)
    difficulte = 10 - (distance / distance_max) * 9
    return max(1, min(10, round(difficulte)))

if __name__ == "__main__":
    difficultes = {}
    for ligne in range(ord('A'), ord('P')+1):
        for colonne in range(1, 9):
            case = f"{chr(ligne)}{colonne}"
            diff = obtenir_difficulte(chr(ligne), colonne)
            difficultes[case] = diff
    pprint.pprint(difficultes)
