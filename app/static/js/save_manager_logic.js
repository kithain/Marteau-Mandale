// save_manager_logic.js
// Centralise et harmonise la gestion de la sauvegarde et du chargement du joueur
// Ce module fournit les fonctions de sauvegarde et de restauration de l'état joueur.

// --- Imports principaux ---
import * as PlayerState from './player_state_logic.js';
const { start_regen } = PlayerState;

// --- Sauvegarde de l'état du joueur ---
function sauvegarder_etat_joueur() {
  const donneesSauvegarde = PlayerState.get_donnees_sauvegarde(); // Utilisation de la fonction importée
  localStorage.setItem('sauvegardeJoueur', JSON.stringify(donneesSauvegarde));
}

// --- Chargement de l'état du joueur ---
// Applique les données de sauvegarde au state du joueur
/**
 * Applique les données de sauvegarde au state du joueur
 * @param {object} donneesSauvegarde - Les données JSON à restaurer
 */
function charger_donnees_joueur(donneesSauvegarde) {
  // Lecture niveau/xp (compatibilité noms)
  const niveau = (donneesSauvegarde && typeof donneesSauvegarde.niveau === 'number') ? donneesSauvegarde.niveau : (donneesSauvegarde && typeof donneesSauvegarde.level === 'number') ? donneesSauvegarde.level : 1;
  const experience = (donneesSauvegarde && typeof donneesSauvegarde.experience === 'number') ? donneesSauvegarde.experience : (donneesSauvegarde && typeof donneesSauvegarde.xp === 'number') ? donneesSauvegarde.xp : 0;

  // Initialise le state de base
  PlayerState.set_experience_joueur(experience);

  // Carte courante
  if (donneesSauvegarde && (donneesSauvegarde.carte || donneesSauvegarde.map)) {
    PlayerState.set_carte_joueur(donneesSauvegarde.carte || donneesSauvegarde.map);
  }

  // Position : toujours restaurer si présente
  if (donneesSauvegarde.position && typeof donneesSauvegarde.position.x === 'number' && typeof donneesSauvegarde.position.y === 'number') {
    PlayerState.set_position_joueur(donneesSauvegarde.position.x, donneesSauvegarde.position.y);
  }

  // Restaure PV/mana ou valeurs max si null/absent
  if (typeof donneesSauvegarde.pv === 'number' && donneesSauvegarde.pv !== null) {
    PlayerState.set_pv_joueur(donneesSauvegarde.pv);
  } else {
    PlayerState.set_pv_joueur(PlayerState.get_pv_max_joueur());
  }

  if (typeof donneesSauvegarde.mana === 'number' && donneesSauvegarde.mana !== null) {
    PlayerState.set_mana_joueur(donneesSauvegarde.mana);
  } else {
    PlayerState.set_mana_joueur(PlayerState.get_mana_max_joueur());
  }

  // Restaure inventaire, talents, etc. si présents
  if (Array.isArray(donneesSauvegarde.inventaire)) {
    PlayerState.set_inventaire_joueur(donneesSauvegarde.inventaire);
  }

  if (Array.isArray(donneesSauvegarde.talents)) {
    PlayerState.set_talents_joueur(donneesSauvegarde.talents);
  }

  // Démarre la régénération
  start_regen();
}

// --- Exports publics à la fin ---
export {
  sauvegarder_etat_joueur,
  charger_donnees_joueur
};
