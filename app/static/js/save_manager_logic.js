// save_manager_logic.js
// Centralise et harmonise la gestion de la sauvegarde et du chargement du joueur
// Ce module fournit les fonctions de sauvegarde et de restauration de l'état joueur.

// --- Imports principaux ---
import { 
  set_player_position,
  set_player_inventory,
  set_player_talents,
  init_player_state,
  set_player_xp,
  set_player_level,
  set_player_atk,
  set_player_def,
  set_player_class,
  set_player_map,
  get_player_save_data // Utilisation de la fonction centrale
} from './player_state_logic.js';

// --- Sauvegarde de l'état du joueur ---
function save_player_state() {
  const saveData = get_player_save_data(); // Utilisation de la fonction importée
  localStorage.setItem('playerSave', JSON.stringify(saveData));
}

// --- Chargement de l'état du joueur ---
// Applique les données de sauvegarde au state du joueur
/**
 * Applique les données de sauvegarde au state du joueur
 * @param {object} saveData - Les données JSON à restaurer
 */
function load_player_data(saveData) {
  // Lecture niveau/xp (compatibilité noms)
  const level = (saveData && typeof saveData.niveau === 'number') ? saveData.niveau : (saveData && typeof saveData.level === 'number') ? saveData.level : 1;
  const xp = (saveData && typeof saveData.experience === 'number') ? saveData.experience : (saveData && typeof saveData.xp === 'number') ? saveData.xp : 0;
  // Initialise le state de base
  init_player_state({
    level,
    xp
  });
  set_player_xp(xp);
  // Carte courante
  if (saveData && (saveData.carte || saveData.map)) {
    set_player_map(saveData.carte || saveData.map);
  }
  // Position : toujours restaurer si présente
  if (saveData.position && typeof saveData.position.x === 'number' && typeof saveData.position.y === 'number') {
    set_player_position(saveData.position.x, saveData.position.y);
  }
  // Restaure PV/mana ou valeurs max si null/absent
  if (typeof saveData.vie === 'number' && saveData.vie !== null) {
    set_player_pv(saveData.vie);
  } else if (typeof saveData.pv === 'number' && saveData.pv !== null) {
    set_player_pv(saveData.pv);
  } else {
    set_player_pv(get_max_player_pv());
  }
  if (typeof saveData.mana === 'number' && saveData.mana !== null) {
    set_player_mana(saveData.mana);
  } else {
    set_player_mana(get_max_player_mana());
  }
  // Restaure inventaire, talents, etc. si présents
  if (Array.isArray(saveData.inventaire)) {
    set_player_inventory(saveData.inventaire);
  }
  if (Array.isArray(saveData.talents)) {
    set_player_talents(saveData.talents);
  }
  // Correction : utilise modules.startRegenUtils (alias de player_utils.js) pour la régénération
  start_regen();
}

// --- Exports publics à la fin ---
export {
  save_player_state,
  load_player_data
};
