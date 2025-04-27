// player_visual_utils.js
// Utilitaires et effets visuels/statuts pour le joueur (harmonisé)
// Ce module fournit tous les effets visuels, statuts, et helpers pour le joueur.

// --- Imports principaux ---
import { 
  get_player_pv,
  get_player_mana,
  get_player_xp
} from './player_state_logic.js';

import { get_xp_to_next_level } from './progression_main_logic.js';

import { 
  set_player_pv,
  set_player_mana
} from './player_main_logic.js';

import { get_player_pv } from './player_state_logic.js';

// --- Texte flottant générique ---
// Affiche un texte flottant au-dessus du joueur
/**
 * Affiche un texte flottant au-dessus du joueur
 * @param {string} text - Texte à afficher
 * @param {string} color - Couleur du texte
 */
function create_floating_text(text, color) {
  const player = document.getElementById("player");
  if (!player) return;
  const texte = document.createElement("div");
  texte.textContent = text;
  texte.style.position = "absolute";
  texte.style.left = player.style.left;
  texte.style.top = player.style.top;
  texte.style.transform = "translate(-50%, -100%)";
  texte.style.color = color || "white";
  texte.style.fontSize = "1.5em";
  texte.style.fontWeight = "bold";
  texte.style.zIndex = 20;
  texte.style.pointerEvents = "none";
  texte.style.animation = "floatUpDelayed 2s ease-out";
  document.getElementById("map-inner").appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

// --- Boost temporaire sur stat joueur ---
// Applique un boost temporaire à une statistique du joueur
/**
 * Applique un boost temporaire à une statistique du joueur
 * @param {string} boost_type - Type de boost ('atk', 'def', ...)
 * @param {number} amount - Valeur du boost
 * @param {number} duration - Durée en ms
 */
function apply_boost(boost_type, amount, duration) {
  if (!window.PLAYER_STATS) window.PLAYER_STATS = {};
  if (!window.PLAYER_STATS[boost_type]) window.PLAYER_STATS[boost_type] = 0;
  window.PLAYER_STATS[boost_type] += amount;
  setTimeout(() => {
    window.PLAYER_STATS[boost_type] -= amount;
  }, duration);
}

// --- Bouclier temporaire (placeholder) ---
// (Obsolète) Applique un bouclier temporaire (non utilisé)
/**
 * (Obsolète) Applique un bouclier temporaire
 * @param {number} value
 * @param {number} duration
 */
function apply_shield(value, duration) {
  // Supprimé
}

// --- Stun sur monstre ---
// Applique un étourdissement à un monstre
/**
 * Applique un étourdissement à un monstre
 * @param {object} monstre - Objet monstre
 * @param {number} duration - Durée en ms
 */
function apply_stun(monstre, duration) {
  if (!monstre || !monstre.data) return;
  monstre.data.stunned = true;
  setTimeout(() => {
    monstre.data.stunned = false;
  }, duration);
}

// --- Poison joueur ---
// Applique un effet de poison au joueur
/**
 * Applique un effet de poison au joueur
 * @param {number} duration - Durée en ms
 */
function apply_poison(duration) {
  if (!window.PLAYER_STATUS) window.PLAYER_STATUS = {};
  window.PLAYER_STATUS.poisoned = true;
  setTimeout(() => {
    window.PLAYER_STATUS.poisoned = false;
  }, duration);
}

// --- Affichage des dégâts subis ---
// Affiche les dégâts subis par le joueur (mob → joueur)
/**
 * @param {number} valeur - Valeur des dégâts
 */
function afficher_degats(valeur) {
  const player = document.getElementById("player");
  if (!player) return;
  const texte = document.createElement("div");
  texte.textContent = `-${valeur}`;
  texte.style.position = "absolute";
  texte.style.left = player.style.left;
  texte.style.top = player.style.top;
  texte.style.transform = "translate(-50%, -100%)";
  texte.style.color = "red";
  texte.style.fontSize = "1.5em";
  texte.style.fontWeight = "bold";
  texte.style.zIndex = 20;
  texte.style.pointerEvents = "none";
  texte.style.animation = "floatUpDelayed 2s ease-out";
  document.getElementById("map-inner").appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

// --- Affichage des dégâts reçus (mob → joueur) ---
// Affiche un texte flottant de dégâts reçus par le joueur
/**
 * Affiche un texte flottant de dégâts reçus par le joueur
 * @param {number} valeur
 */
function afficher_mob_degats(valeur) {
  const player = document.getElementById("player");
  if (!player) return;
  const texte = document.createElement("div");
  texte.textContent = `-${valeur}`;
  texte.style.position = "absolute";
  texte.style.left = player.style.left;
  texte.style.top = player.style.top;
  texte.style.transform = "translate(-50%, -100%)";
  texte.style.color = "red";
  texte.style.fontSize = "1.5em";
  texte.style.fontWeight = "bold";
  texte.style.zIndex = 20;
  texte.style.animation = "floatUpDelayed 2s ease-out";
  document.getElementById("map-inner").appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

// --- Dégâts au joueur (logique) ---
// Inflige des dégâts au joueur et met à jour ses PV
/**
 * Inflige des dégâts au joueur et met à jour ses PV
 * @param {number} valeur - Valeur des dégâts
 */
function infliger_degats_au_joueur(valeur) {
  if (window.is_game_over) return;
  const pv_avant = get_player_pv();
  set_player_pv(pv_avant - valeur);
  const pv_apres = get_player_pv();
  console.log(`[COMBAT][PV] Player PV: ${pv_avant} → ${pv_apres} (dégâts: ${valeur})`);
  
  // Vérifier si le joueur est mort
  if (pv_apres <= 0) {
    afficher_game_over();
  }
}

// --- Game Intervals ---
/**
 * Liste des intervalles de jeu actifs
 * @type {Set<number>}
 */
const game_intervals = new Set();

/**
 * Enregistre un intervalle de jeu pour le nettoyage
 * @param {number} interval_id - ID de l'intervalle à enregistrer
 */
function register_game_interval(interval_id) {
  if (interval_id) {
    game_intervals.add(interval_id);
  }
}

/**
 * Nettoie un intervalle de jeu spécifique
 * @param {number} interval_id - ID de l'intervalle à nettoyer
 */
function clear_game_interval(interval_id) {
  if (interval_id) {
    clearInterval(interval_id);
    game_intervals.delete(interval_id);
  }
}

/**
 * Nettoie tous les intervalles de jeu enregistrés
 */
function clear_all_game_intervals() {
  for (const interval_id of game_intervals) {
    clearInterval(interval_id);
  }
  game_intervals.clear();
}

// --- Game Over ---
/**
 * Affiche l'écran de Game Over et arrête la régénération
 */
function afficher_game_over() {
  if (window.is_game_over) return; // Éviter les appels multiples
  
  window.is_game_over = true;
  
  // Arrêter la régénération
  if (window.stop_regen) window.stop_regen();
  
  // Nettoyer tous les intervalles de jeu
  clear_all_game_intervals();
  
  // Désactiver les contrôles du joueur
  window.combat_actif = false;
  
  // Afficher l'écran de Game Over
  const game_over_screen = document.getElementById('game-over');
  if (game_over_screen) {
    game_over_screen.style.display = 'block';
  }
}

// Fonction utilitaire pour arrêter tous les intervalles
function clear_all_intervals() {
  // Nettoyer les intervalles connus
  if (window.monstre_interval) clearInterval(window.monstre_interval);
  if (window.regen_interval) clearInterval(window.regen_interval);
  if (window.interval_deplacement_monstres) clearInterval(window.interval_deplacement_monstres);
  
  // Nettoyer tous les autres intervalles par sécurité
  const highest_id = window.setInterval(() => {}, 100000);
  for(let i = 0; i < highest_id; i++) {
    window.clearInterval(i);
  }
}

// --- Régénération automatique (wrappers) ---
let regen_interval = null;
/**
 * Démarre la régénération automatique de PV/Mana (wrapper)
 */
function start_regen() {
  if (typeof import('./player_state_logic.js').then === 'function') {
    import('./player_state_logic.js').then(mod => {
      if (mod && typeof mod.start_regen === 'function') mod.start_regen();
    });
    return;
  }
  if (regen_interval) return;
  regen_interval = setInterval(() => {
    if (window.is_game_over || window.combat_actif) return;
    set_player_pv(Math.min(get_player_pv() + 1, get_max_vie(window.PLAYER_LEVEL)));
    set_player_mana(Math.min(get_player_mana() + 1, get_max_mana(window.PLAYER_LEVEL)));
  }, 2000);
}
/**
 * Arrête la régénération automatique (wrapper)
 */
function stop_regen() {
  if (typeof import('./player_state_logic.js').then === 'function') {
    import('./player_state_logic.js').then(mod => {
      if (mod && typeof mod.stop_regen === 'function') mod.stop_regen();
    });
    return;
  }
  if (regen_interval) clearInterval(regen_interval);
  regen_interval = null;
}

// --- Helpers visuels spécialisés (wrappers autour de create_floating_text) ---
/**
 * Affiche un texte flottant pour un soin reçu par le joueur
 * @param {number} valeur
 */
function afficher_soin(valeur) {
  create_floating_text(`+${valeur}`, 'lightgreen');
}
/**
 * Affiche un texte flottant pour un coup critique reçu ou infligé
 * @param {number} valeur
 */
function afficher_critique(valeur) {
  create_floating_text(`CRIT ! -${valeur}`, '#FFD700');
}
/**
 * Affiche un texte flottant pour une esquive du joueur
 */
function afficher_esquive() {
  create_floating_text('Esquive !', '#87CEEB');
}
/**
 * Affiche un texte flottant pour une parade du joueur
 */
function afficher_parade() {
  create_floating_text('Parade !', '#00BFFF');
}
/**
 * Affiche un texte flottant pour un buff reçu par le joueur
 * @param {string} nom_buff
 */
function afficher_buff(nom_buff) {
  create_floating_text(`+${nom_buff}`, '#66ff99');
}
/**
 * Affiche un texte flottant pour un débuff reçu par le joueur
 * @param {string} nom_debuff
 */
function afficher_debuff(nom_debuff) {
  create_floating_text(`-${nom_debuff}`, '#ff6666');
}
/**
 * Affiche un texte flottant pour un coup manqué
 */
function afficher_miss() {
  create_floating_text('Miss !', '#bbb');
}

// --- Exports publics à la fin ---
export {
  create_floating_text,
  apply_boost,
  apply_shield,
  apply_stun,
  apply_poison,
  afficher_degats,
  afficher_mob_degats,
  infliger_degats_au_joueur,
  afficher_game_over,
  start_regen,
  stop_regen,
  afficher_soin,
  afficher_critique,
  afficher_esquive,
  afficher_parade,
  afficher_buff,
  afficher_debuff,
  afficher_miss,
  register_game_interval,
  clear_game_interval
};
