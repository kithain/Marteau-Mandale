import json
import os
from pathlib import Path
from flask import session
from werkzeug.security import generate_password_hash
import hashlib
import binascii

SAVE_DIR = Path('save_data')

class PlayerManager:
    @staticmethod
    def obtenir_donnees_joueur(nom_utilisateur):
        """
        Récupère les données du joueur de manière sécurisée
        
        Args:
            nom_utilisateur (str): Identifiant du joueur
            
        Returns:
            dict: Données du joueur ou None si erreur
        """
        if not isinstance(nom_utilisateur, str) or not nom_utilisateur.strip():
            return None
            
        hash_fichier = PlayerManager._hasher_identifiant(nom_utilisateur)
        chemin_sauvegarde = SAVE_DIR / f"{hash_fichier}.json"
        
        try:
            if not chemin_sauvegarde.exists():
                return None
                
            with chemin_sauvegarde.open('r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(f"Erreur lecture sauvegarde {nom_utilisateur}: {e}")
            return None

    @staticmethod
    def sauvegarder_donnees_joueur(nom_utilisateur, data):
        """
        Sauvegarde les données du joueur avec validation
        
        Args:
            nom_utilisateur (str): Identifiant du joueur
            data (dict): Données à sauvegarder
            
        Returns:
            bool: True si sauvegarde réussie
        """
        if not PlayerManager.valider_donnees_joueur(data):
            return False
            
        try:
            SAVE_DIR.mkdir(exist_ok=True)
            hash_fichier = PlayerManager._hasher_identifiant(nom_utilisateur)
            chemin_sauvegarde = SAVE_DIR / f"{hash_fichier}.json"
            
            with chemin_sauvegarde.open('w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except (TypeError, OSError) as e:
            print(f"Erreur sauvegarde {nom_utilisateur}: {e}")
            return False

    @staticmethod
    def valider_donnees_joueur(data):
        """
        Valide les données du joueur
        
        Args:
            data (dict): Données à valider
            
        Returns:
            bool: True si données valides
        """
        if not isinstance(data, dict):
            return False
            
        champs_requis = {'niveau': int, 'experience': int, 'classe': str, 
                        'statistiques': dict, 'inventaire': list, 'talents': list}
        
        # Vérifie présence et type des champs
        for champ, type_ in champs_requis.items():
            if champ not in data or not isinstance(data[champ], type_):
                return False
                
        # Vérifie valeurs des statistiques
        stats = data['statistiques']
        if not all(isinstance(v, int) and 0 <= v <= 100 for v in stats.values()):
            return False
            
        return True

    @staticmethod
    def mettre_a_jour_stats_joueur(nom_utilisateur, data):
        """Met à jour les statistiques du joueur"""
        joueur_data = PlayerManager.obtenir_donnees_joueur(nom_utilisateur)
        if not joueur_data:
            return False
            
        # Validation des données
        if not PlayerManager.valider_donnees_joueur(data):
            return False
            
        # Mise à jour des stats
        joueur_data['statistiques'].update(data)
        return PlayerManager.sauvegarder_donnees_joueur(nom_utilisateur, joueur_data)

    @staticmethod
    def ajouter_experience(nom_utilisateur, xp):
        """Ajoute de l'expérience au joueur et gère le level up"""
        joueur_data = PlayerManager.obtenir_donnees_joueur(nom_utilisateur)
        if not joueur_data:
            return False
            
        joueur_data['experience'] += xp
        
        # Vérification level up
        experience_requise = 100 * joueur_data['niveau']
        if joueur_data['experience'] >= experience_requise:
            joueur_data['niveau'] += 1
            joueur_data['experience'] = 0
            
        return PlayerManager.sauvegarder_donnees_joueur(nom_utilisateur, joueur_data)

    @staticmethod
    def creer_utilisateur(nom_utilisateur, mot_de_passe):
        """
        Crée un nouvel utilisateur de manière sécurisée
        
        Args:
            nom_utilisateur (str): Identifiant
            mot_de_passe (str): Mot de passe en clair
            
        Returns:
            bool: True si création réussie
        """
        if not nom_utilisateur or not mot_de_passe:
            return False
            
        hash_fichier = PlayerManager._hasher_identifiant(nom_utilisateur)
        chemin_utilisateur = SAVE_DIR / f"{hash_fichier}.user"
        
        if chemin_utilisateur.exists():
            return False
            
        # Hachage sécurisé du mot de passe
        sel = os.urandom(16)
        hash_mdp = hashlib.pbkdf2_hmac(
            'sha256',
            mot_de_passe.encode('utf-8'),
            sel,
            100000
        )
        
        donnees_utilisateur = {
            'sel': binascii.hexlify(sel).decode(),
            'hash_mdp': binascii.hexlify(hash_mdp).decode(),
            'nom_affichage': nom_utilisateur  # Stocké uniquement pour affichage
        }
        
        try:
            with chemin_utilisateur.open('w', encoding='utf-8') as f:
                json.dump(donnees_utilisateur, f, indent=2)
            return True
        except (OSError, TypeError) as e:
            print(f"Erreur création utilisateur {nom_utilisateur}: {e}")
            return False

    @staticmethod
    def verifier_utilisateur(nom_utilisateur, mot_de_passe):
        """
        Vérifie les identifiants d'un utilisateur
        
        Args:
            nom_utilisateur (str): Identifiant
            mot_de_passe (str): Mot de passe en clair
            
        Returns:
            bool: True si identifiants valides
        """
        if not nom_utilisateur or not mot_de_passe:
            return False
            
        hash_fichier = PlayerManager._hasher_identifiant(nom_utilisateur)
        chemin_utilisateur = SAVE_DIR / f"{hash_fichier}.user"
        
        try:
            if not chemin_utilisateur.exists():
                return False
                
            with chemin_utilisateur.open('r', encoding='utf-8') as f:
                donnees = json.load(f)
                
            sel = binascii.unhexlify(donnees['sel'])
            nouveau_hash = hashlib.pbkdf2_hmac(
                'sha256',
                mot_de_passe.encode('utf-8'),
                sel,
                100000
            )
            return donnees['hash_mdp'] == binascii.hexlify(nouveau_hash).decode()
        except (OSError, KeyError, binascii.Error) as e:
            print(f"Erreur vérification {nom_utilisateur}: {e}")
            return False

    @staticmethod
    def _hasher_identifiant(identifiant):
        """
        Hash un identifiant de manière sécurisée pour usage dans les noms de fichiers
        
        Args:
            identifiant (str): Identifiant à hasher
            
        Returns:
            str: Hash hexadécimal sécurisé
        """
        sel = os.urandom(16)  # 16 bytes = 128 bits
        hash_obj = hashlib.blake2b(
            identifiant.encode('utf-8'), 
            key=sel,
            digest_size=32
        )
        return f"{binascii.hexlify(sel).decode()}_{hash_obj.hexdigest()}"