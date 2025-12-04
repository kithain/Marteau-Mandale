
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Debug mode actif pour rechargement auto
    app.run(debug=True)
