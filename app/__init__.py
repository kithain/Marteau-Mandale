from flask import Flask
from dotenv import load_dotenv
import os

# Charge les variables d'environnement
load_dotenv()

def create_app():
    """
    Factory d'application Flask
    Initialise et configure l'application principale
    """
    app = Flask(__name__)
    app.secret_key = os.getenv('FLASK_SECRET_KEY')
    
    if not app.secret_key:
        raise ValueError("Aucune clé secrète configurée. Veuillez définir FLASK_SECRET_KEY dans .env")
    
    from .routes import bp
    app.register_blueprint(bp)
    
    return app
