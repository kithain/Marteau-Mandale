// html_java_jeu.js
// Gère uniquement la page jeu.html
// Point d'entrée principal du jeu, peut appeler tous les modules logiques et visuels

// --- Imports globaux de tous les modules utiles ---
import { charger_carte_initiale } from './map_main_logic.js';
import { initialiser_talents } from './player_ui_logic.js';
import { initialiser_gestionnaire_entrees } from './input_handler_logic.js';
import { initialiser_mise_a_jour_talents } from './player_ui_logic.js';
import { charger_donnees_joueur } from './save_manager_logic.js';
import { get_position_joueur, get_classe_joueur, get_niveau_joueur, initialiser_joueur, set_classe_joueur } from './player_state_logic.js';
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
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.erreur) throw new Error(data.erreur);

      // 2. Appliquer les données de sauvegarde au state joueur
      charger_donnees_joueur(data);

      // 3. Initialiser les stats et talents selon le niveau/classe
      const niveau = get_niveau_joueur();
      const classe = data.classe || 'Paladin';
      initialiser_joueur(niveau);
      set_classe_joueur(classe); // Force la mise à jour de la classe
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
      console.error('[ERREUR INIT] Détails:', err.message, err.stack);
      alert("Erreur lors du chargement de la partie : " + err.message);
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
