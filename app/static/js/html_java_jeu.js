// html_java_jeu.js
// Gère uniquement la page jeu.html
// Point d'entrée principal du jeu, peut appeler tous les modules logiques et visuels

// --- Imports globaux de tous les modules utiles ---
import { charger_carte_initiale } from './map_main_logic.js';
import { initialiser_stats_joueur, initialiser_talents } from './player_main_logic.js';
import { initialiser_gestionnaire_entrees } from './input_handler_logic.js';
import { initialiser_mise_a_jour_talents } from './player_ui_logic.js';
import { load_player_data } from './save_manager_logic.js';
import { get_player_class, get_niveau_joueur } from './player_state_logic.js';
import { movePlayer } from './camera_main_logic.js';

// --- Initialisation du jeu ---

/**
 * Initialise les composants principaux du jeu.
 * Ce fichier agit comme point central pour lancer toutes les logiques de gameplay.
 */
function initialiserJeu() {
  console.log('[JEU] Initialisation en cours...');

  // 1. Chargement des données sauvegardées du joueur (depuis backend)
  fetch('/api/joueur/stats')
    .then(res => res.json())
    .then(data => {
      if (data.erreur) throw new Error(data.erreur);

      // 2. Appliquer les données de sauvegarde au state joueur
      load_player_data(data);

      // 3. Initialiser les stats et talents selon le niveau/classe
      const niveau = get_niveau_joueur();
      initialiser_stats_joueur(niveau);
      initialiser_talents();

      // 4. Charger la carte et placer le joueur
      return charger_carte_initiale();
    })
    .then(() => {
      // 5. Positionnement initial de la caméra sur le joueur
      movePlayer();

      // 6. Activation du système de contrôle clavier
      initialiser_gestionnaire_entrees();

      // 7. Lancement de la mise à jour visuelle des talents
      initialiser_mise_a_jour_talents();

      console.log('[JEU] Initialisation terminée');
    })
    .catch(err => {
      console.error('[ERREUR INIT]', err);
      alert("Erreur lors du chargement de la partie.");
    });
}

// --- Lancement automatique après chargement DOM ---
document.addEventListener('DOMContentLoaded', () => {
  initialiserJeu();
});

// --- Export public ---
export {
  initialiserJeu
};
