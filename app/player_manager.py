import json
import os
from flask import session
from werkzeug.security import generate_password_hash

SAVE_DIR = 'save_data'

class PlayerManager:
    @staticmethod
    def get_player_data(username):
        """Récupère les données du joueur de manière sécurisée"""
        if not username:
            return None
            
        file_path = os.path.join(SAVE_DIR, f"{username}.json")
        if not os.path.exists(file_path):
            return None
            
        with open(file_path, 'r') as f:
            return json.load(f)

    @staticmethod
    def save_player_data(username, data):
        """Sauvegarde les données du joueur avec validation"""
        if not username:
            return False
            
        # Validation des données
        if not PlayerManager.validate_player_data(data):
            return False
            
        file_path = os.path.join(SAVE_DIR, f"{username}.json")
        with open(file_path, 'w') as f:
            json.dump(data, f)
        return True

    @staticmethod
    def validate_player_data(data):
        """Valide les données du joueur pour éviter la triche"""
        required_fields = ['niveau', 'experience', 'classe', 'statistiques', 'inventaire', 'talents']
        
        # Vérifie la présence des champs requis
        if not all(field in data for field in required_fields):
            return False
            
        # Vérifie les limites des statistiques
        stats = data['statistiques']
        if not all(0 <= value <= 100 for value in stats.values()):
            return False
            
        # Vérifie le niveau
        if not 1 <= data['niveau'] <= 100:
            return False
            
        # Vérifie l'expérience
        if not 0 <= data['experience'] <= 1000000:
            return False
            
        # Assure que niveau et experience sont numériques
        if not isinstance(data.get('niveau', None), int) or not isinstance(data.get('experience', None), int):
            return False
            
        return True

    @staticmethod
    def update_player_stats(username, stats_changes):
        """Met à jour les statistiques du joueur de manière sécurisée"""
        player_data = PlayerManager.get_player_data(username)
        if not player_data:
            return False
            
        # Applique les changements avec validation
        for stat, value in stats_changes.items():
            if stat in player_data['statistiques']:
                # Limite les valeurs à des plages raisonnables
                player_data['statistiques'][stat] = max(0, min(100, value))
                
        return PlayerManager.save_player_data(username, player_data)

    @staticmethod
    def add_experience(username, exp):
        data = PlayerManager.get_player_data(username)
        if not data:
            return False
        data['experience'] += exp
        # Calcule le seuil pour le level up (exemple: 100 * niveau)
        level = data.get('niveau', 1)
        xp_seuil = 100 * level
        # Montée de niveau tant que possible
        while data['experience'] >= xp_seuil:
            data['experience'] -= xp_seuil
            level += 1
            data['niveau'] = level
            xp_seuil = 100 * level
        return PlayerManager.save_player_data(username, data) 