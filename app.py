from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Démarrage de l'application Marteau-Mandale...")
    app.run(host='127.0.0.1', port=5000, debug=True)
