// player_visual_utils.js
// Utilitaires et effets visuels/statuts pour le joueur (harmonisé)
// Ce module fournit tous les effets visuels, statuts, et helpers pour le joueur.

// --- Imports principaux ---
import * as modules from './modules_main_logic.js';

// --- Texte flottant générique ---
// Affiche un texte flottant au-dessus du joueur
/**
 * Affiche un texte flottant au-dessus du joueur
 * @param {string} text - Texte à afficher
 * @param {string} color - Couleur du texte
 */
function createFloatingText(text, color) {
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
 * @param {string} boostType - Type de boost ('atk', 'def', ...)
 * @param {number} amount - Valeur du boost
 * @param {number} duration - Durée en ms
 */
function applyBoost(boostType, amount, duration) {
  if (!window.PLAYER_STATS) window.PLAYER_STATS = {};
  if (!window.PLAYER_STATS[boostType]) window.PLAYER_STATS[boostType] = 0;
  window.PLAYER_STATS[boostType] += amount;
  setTimeout(() => {
    window.PLAYER_STATS[boostType] -= amount;
  }, duration);
}

// --- Bouclier temporaire (placeholder) ---
// (Obsolète) Applique un bouclier temporaire (non utilisé)
/**
 * (Obsolète) Applique un bouclier temporaire
 * @param {number} value
 * @param {number} duration
 */
function applyShield(value, duration) {
  // Supprimé
}

// --- Stun sur monstre ---
// Applique un étourdissement à un monstre
/**
 * Applique un étourdissement à un monstre
 * @param {object} monstre - Objet monstre
 * @param {number} duration - Durée en ms
 */
function applyStun(monstre, duration) {
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
function applyPoison(duration) {
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
function afficherDegats(valeur) {
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
function afficherMobDegats(valeur) {
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
function infligerDegatsAuJoueur(valeur) {
  if (window.isGameOver) return;
  const pvAvant = modules.getPlayerPV();
  modules.setPlayerPV(pvAvant - valeur);
  const pvApres = modules.getPlayerPV();
  console.log(`[COMBAT][PV] Player PV: ${pvAvant} → ${pvApres} (dégâts: ${valeur})`);
  
  // Vérifier si le joueur est mort
  if (pvApres <= 0) {
    afficherGameOver();
  }
}

// --- Game Intervals ---
/**
 * Liste des intervalles de jeu actifs
 * @type {Set<number>}
 */
const gameIntervals = new Set();

/**
 * Enregistre un intervalle de jeu pour le nettoyage
 * @param {number} intervalId - ID de l'intervalle à enregistrer
 */
function registerGameInterval(intervalId) {
  if (intervalId) {
    gameIntervals.add(intervalId);
  }
}

/**
 * Nettoie un intervalle de jeu spécifique
 * @param {number} intervalId - ID de l'intervalle à nettoyer
 */
function clearGameInterval(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
    gameIntervals.delete(intervalId);
  }
}

/**
 * Nettoie tous les intervalles de jeu enregistrés
 */
function clearAllGameIntervals() {
  for (const intervalId of gameIntervals) {
    clearInterval(intervalId);
  }
  gameIntervals.clear();
}

// --- Game Over ---
/**
 * Affiche l'écran de Game Over et arrête la régénération
 */
function afficherGameOver() {
  if (window.isGameOver) return; // Éviter les appels multiples
  
  window.isGameOver = true;
  
  // Arrêter la régénération
  if (window.stopRegen) window.stopRegen();
  
  // Nettoyer tous les intervalles de jeu
  clearAllGameIntervals();
  
  // Désactiver les contrôles du joueur
  window.combatActif = false;
  
  // Afficher l'écran de Game Over
  const gameOverScreen = document.getElementById('game-over');
  if (gameOverScreen) {
    gameOverScreen.style.display = 'block';
  }
}

// Fonction utilitaire pour arrêter tous les intervalles
function clearAllIntervals() {
  // Nettoyer les intervalles connus
  if (window.monstreInterval) clearInterval(window.monstreInterval);
  if (window.regenInterval) clearInterval(window.regenInterval);
  if (window.intervalDeplacementMonstres) clearInterval(window.intervalDeplacementMonstres);
  
  // Nettoyer tous les autres intervalles par sécurité
  const highestId = window.setInterval(() => {}, 100000);
  for(let i = 0; i < highestId; i++) {
    window.clearInterval(i);
  }
}

// --- Régénération automatique (wrappers) ---
let regenInterval = null;
/**
 * Démarre la régénération automatique de PV/Mana (wrapper)
 */
function startRegen() {
  if (typeof import('./player_state_logic.js').then === 'function') {
    import('./player_state_logic.js').then(mod => {
      if (mod && typeof mod.startRegen === 'function') mod.startRegen();
    });
    return;
  }
  if (regenInterval) return;
  regenInterval = setInterval(() => {
    if (window.isGameOver || window.combatActif) return;
    modules.setPlayerPV(Math.min(modules.getPlayerPV() + 1, modules.getMaxVie(window.PLAYER_LEVEL)));
    modules.setPlayerMana(Math.min(modules.getPlayerMana() + 1, modules.getMaxMana(window.PLAYER_LEVEL)));
  }, 2000);
}
/**
 * Arrête la régénération automatique (wrapper)
 */
function stopRegen() {
  if (typeof import('./player_state_logic.js').then === 'function') {
    import('./player_state_logic.js').then(mod => {
      if (mod && typeof mod.stopRegen === 'function') mod.stopRegen();
    });
    return;
  }
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}

// --- Helpers visuels spécialisés (wrappers autour de createFloatingText) ---
/**
 * Affiche un texte flottant pour un soin reçu par le joueur
 * @param {number} valeur
 */
function afficherSoin(valeur) {
  createFloatingText(`+${valeur}`, 'lightgreen');
}
/**
 * Affiche un texte flottant pour un coup critique reçu ou infligé
 * @param {number} valeur
 */
function afficherCritique(valeur) {
  createFloatingText(`CRIT ! -${valeur}`, '#FFD700');
}
/**
 * Affiche un texte flottant pour une esquive du joueur
 */
function afficherEsquive() {
  createFloatingText('Esquive !', '#87CEEB');
}
/**
 * Affiche un texte flottant pour une parade du joueur
 */
function afficherParade() {
  createFloatingText('Parade !', '#00BFFF');
}
/**
 * Affiche un texte flottant pour un buff reçu par le joueur
 * @param {string} nomBuff
 */
function afficherBuff(nomBuff) {
  createFloatingText(`+${nomBuff}`, '#66ff99');
}
/**
 * Affiche un texte flottant pour un débuff reçu par le joueur
 * @param {string} nomDebuff
 */
function afficherDebuff(nomDebuff) {
  createFloatingText(`-${nomDebuff}`, '#ff6666');
}
/**
 * Affiche un texte flottant pour un coup manqué
 */
function afficherMiss() {
  createFloatingText('Miss !', '#bbb');
}

// --- Exports publics à la fin ---
export {
  createFloatingText,
  applyBoost,
  applyShield,
  applyStun,
  applyPoison,
  afficherDegats,
  afficherMobDegats,
  infligerDegatsAuJoueur,
  afficherGameOver,
  startRegen,
  stopRegen,
  afficherSoin,
  afficherCritique,
  afficherEsquive,
  afficherParade,
  afficherBuff,
  afficherDebuff,
  afficherMiss,
  registerGameInterval,
  clearGameInterval
};
