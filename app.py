from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')

USER_DB = 'users.json'  # Le fichier sera créé à la racine

def load_users():
    if not os.path.exists(USER_DB):
        with open(USER_DB, 'w') as f:
            json.dump({}, f)
    with open(USER_DB, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USER_DB, 'w') as f:
        json.dump(users, f)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    users = load_users()

    if username in users and users[username] == password:
        return jsonify({'success': True, 'message': 'Connexion réussie'})
    return jsonify({'success': False, 'message': 'Nom d’utilisateur ou mot de passe incorrect'})

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    users = load_users()

    if username in users:
        return jsonify({'success': False, 'message': 'Nom d’utilisateur déjà pris'})
    users[username] = password
    save_users(users)
    return jsonify({'success': True, 'message': 'Compte créé avec succès'})

if __name__ == '__main__':
    app.run(debug=True)
