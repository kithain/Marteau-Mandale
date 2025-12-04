
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.secret_key = 't0nSuP3rS3cr3tKey!@$'  # 🔒 à personnaliser
    from .routes import bp
    app.register_blueprint(bp)
    return app
