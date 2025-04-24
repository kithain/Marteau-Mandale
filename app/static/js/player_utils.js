// player_utils.js
// Fonctions utilitaires et effets visuels/statuts extraites de player.js

// --- IMPORTS ---
import { setPlayerPV, setPlayerMana, getPlayerPV, getPlayerMana } from './playerState.js';
import { getMaxVie, getMaxMana, getPlayerBaseDef } from './progression.js';

// === Texte flottant ===
export function createFloatingText(text, color) {
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

// === Boost temporaire ===
export function applyBoost(boostType, amount, duration) {
  // boostType: 'atk', 'def', etc.
  // amount: valeur du boost
  // duration: ms
  if (!window.PLAYER_STATS) window.PLAYER_STATS = {};
  if (!window.PLAYER_STATS[boostType]) window.PLAYER_STATS[boostType] = 0;
  window.PLAYER_STATS[boostType] += amount;
  setTimeout(() => {
    window.PLAYER_STATS[boostType] -= amount;
  }, duration);
}

// === Bouclier temporaire ===
export function applyShield(value, duration) {
  // Supprimé
}

// === Stun ===
export function applyStun(monstre, duration) {
  if (!monstre || !monstre.data) return;
  monstre.data.stunned = true;
  setTimeout(() => {
    monstre.data.stunned = false;
  }, duration);
}

// === Poison ===
export function applyPoison(duration) {
  if (!window.PLAYER_STATUS) window.PLAYER_STATUS = {};
  window.PLAYER_STATUS.poisoned = true;
  setTimeout(() => {
    window.PLAYER_STATUS.poisoned = false;
  }, duration);
}

// === Affichage des dégâts ===
export function afficherDegats(valeur) {
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

// === Dégâts au joueur ===
export function infligerDegatsAuJoueur(valeur) {
  setPlayerPV(getPlayerPV() - valeur);
}

// === Game Over ===
export function afficherGameOver(...args) {
  window.isGameOver = true;
  if (window.stopRegen) window.stopRegen();
  if (window.originalAfficherGameOver) {
    window.originalAfficherGameOver.apply(this, args);
  }
}

// --- Régénération automatique ---
let regenInterval = null;

// Nouvelle version : délègue la regen à playerState.js si disponible
export function startRegen() {
  if (typeof import('./playerState.js').then === 'function') {
    import('./playerState.js').then(mod => {
      if (mod && typeof mod.startRegen === 'function') mod.startRegen();
    });
    return;
  }
  if (regenInterval) return;
  regenInterval = setInterval(() => {
    if (window.isGameOver || window.combatActif) return;
    setPlayerPV(Math.min(getPlayerPV() + 1, getMaxVie(window.PLAYER_LEVEL)));
    setPlayerMana(Math.min(getPlayerMana() + 1, getMaxMana(window.PLAYER_LEVEL)));
  }, 2000);
}

export function stopRegen() {
  if (typeof import('./playerState.js').then === 'function') {
    import('./playerState.js').then(mod => {
      if (mod && typeof mod.stopRegen === 'function') mod.stopRegen();
    });
    return;
  }
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}
