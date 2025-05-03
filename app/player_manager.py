import json
import os
from pathlib import Path

SAVE_DIR = Path('save_data')

class PlayerManager:
    @staticmethod
    def obtenir_donnees_joueur(nom_utilisateur):
        """
        Récupère les données du joueur directement par nom de fichier
        """
        if not isinstance(nom_utilisateur, str) or not nom_utilisateur.strip():
            return None
            
        chemin_sauvegarde = SAVE_DIR / f"{nom_utilisateur}.json"
        
        try:
            if not chemin_sauvegarde.exists():
                return None
                
            with chemin_sauvegarde.open('r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(f"Erreur lecture sauvegarde {nom_utilisateur}: {e}")
            return None
