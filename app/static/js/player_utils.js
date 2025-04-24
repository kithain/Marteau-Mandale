// player_utils.js
// Fonctions utilitaires et effets visuels/statuts extraites de player.js

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
  if (!window.playerShield) window.playerShield = 0;
  window.playerShield += value;
  setTimeout(() => {
    window.playerShield -= value;
    if (window.playerShield < 0) window.playerShield = 0;
  }, duration);
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
  if (window.playerShield && window.playerShield > 0) {
    const shieldAbsorb = Math.min(window.playerShield, valeur);
    window.playerShield -= shieldAbsorb;
    valeur -= shieldAbsorb;
    if (valeur <= 0) return;
  }
  if (typeof window.playerPV === 'number') {
    window.playerPV -= valeur;
    if (window.playerPV < 0) window.playerPV = 0;
    // Optionnel : mettre à jour la barre de vie ici si besoin
  }
}

// === Game Over ===
export function afficherGameOver(...args) {
  window.isGameOver = true;
  if (window.stopRegen) window.stopRegen();
  if (window.originalAfficherGameOver) {
    window.originalAfficherGameOver.apply(this, args);
  }
}

// === Régénération automatique ===
let regenInterval = null;
export function startRegen() {
  if (regenInterval) return;
  regenInterval = setInterval(() => {
    if (window.isGameOver || window.combatActif) return;
    if (typeof window.playerPV === 'number' && typeof window.getMaxVie === 'function') {
      window.playerPV = Math.min(window.playerPV + 1, window.getMaxVie(window.PLAYER_LEVEL));
    }
    if (typeof window.playerMana === 'number' && typeof window.getMaxMana === 'function') {
      window.playerMana = Math.min(window.playerMana + 1, window.getMaxMana(window.PLAYER_LEVEL));
    }
  }, 2000);
}
export function stopRegen() {
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}
