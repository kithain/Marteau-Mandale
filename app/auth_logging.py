"""
Module de logging pour le système d'authentification
"""
import logging
from pathlib import Path

# Configuration du système de logs
LOG_DIR = Path('logs')
LOG_DIR.mkdir(exist_ok=True)

logger = logging.getLogger('auth')
logger.setLevel(logging.DEBUG)

# Création du formatter
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# Handler pour fichier
file_handler = logging.FileHandler(LOG_DIR / 'auth.log')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# Handler pour console
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

def log_auth_attempt(username, success):
    """Log une tentative d'authentification"""
    status = "SUCCESS" if success else "FAILED"
    logger.info(f"Authentication attempt - User: {username} - Status: {status}")
