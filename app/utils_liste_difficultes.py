import pprint

def get_difficulty(ligne: str, colonne: int):
    ligne_index = ord(ligne.upper()) - ord('A') + 1
    colonne_index = colonne
    max_distance = (16 - 1) + (8 - 1)
    distance = (ligne_index - 1) + (colonne_index - 1)
    difficulty = 10 - (distance / max_distance) * 9
    return max(1, min(10, round(difficulty)))

if __name__ == "__main__":
    difficulties = {}
    for ligne in range(ord('A'), ord('P')+1):
        for colonne in range(1, 9):
            case = f"{chr(ligne)}{colonne}"
            diff = get_difficulty(chr(ligne), colonne)
            difficulties[case] = diff
    pprint.pprint(difficulties)
