// player.js

// === Variables exportées (globales) ===
// Ces variables sont initialisées à 0, puis mises à jour selon le niveau du joueur au chargement de la partie ou lors d'un level-up
export let cooldowns = {};
export let combatActif = false;
export let playerDef = 0; // Nouvelle stat de défense, calculée par niveau

import * as modules from './modules.js';
import { setPlayerPosition as setPlayerPositionState } from './playerState.js';
import { getCentralPlayerPosition } from './playerState.js';

// Fonction pour initialiser les stats selon le niveau
export function initialiserStatsJoueur(level) {
  modules.setPlayerPV(modules.getMaxVie(level));
  modules.setPlayerMana(modules.getMaxMana(level));
  playerDef = modules.getPlayerBaseDef(level);
}

// === XP et Niveau ===
export let playerXP = 0;
export let xpToNextLevel = 100;

// === Position du joueur ===
export function setPlayerPosition(x, y) {
  setPlayerPositionState(x, y);
}
export function getPlayerPosition() {
  return getCentralPlayerPosition();
}
export function getPlayerX() {
  return getCentralPlayerPosition().x;
}
export function getPlayerY() {
  return getCentralPlayerPosition().y;
}

// === Vie // Mana ===
export function updateManaBar() {
  const manaFill = document.getElementById("mana-fill");
  if (!manaFill) return;
  const percent = (modules.getPlayerMana() / modules.getMaxMana(window.PLAYER_LEVEL)) * 100;
  manaFill.style.width = percent + "%";
}

export function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  if (!vieFill) return;
  const percent = (modules.getPlayerPV() / modules.getMaxVie(window.PLAYER_LEVEL)) * 100;
  vieFill.style.width = percent + "%";
}

// === XP ===
export function gainXP(amount) {
  if (window.PLAYER_LEVEL >= 10) {
    const maxXP = modules.getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
    window.PLAYER_XP = playerXP;
    modules.setPlayerXP(playerXP); // Synchronise le state centralisé
    updateXPBar();
    return;
  }
  playerXP += amount;
  modules.setPlayerXP(playerXP); // Synchronise le state centralisé
  while (playerXP >= xpToNextLevel) {
    levelUp();
    if (window.PLAYER_LEVEL >= 10) {
      playerXP = modules.getXpToNextLevel(10);
      modules.setPlayerXP(playerXP);
      break;
    }
  }
  window.PLAYER_XP = playerXP;
  modules.setPlayerXP(playerXP);
  updateXPBar();
}

export function levelUp() {
  if (window.PLAYER_LEVEL >= 10) {
    return;
  }
  window.PLAYER_XP -= xpToNextLevel;
  modules.setPlayerXP(window.PLAYER_XP); // Synchronise le state centralisé
  window.PLAYER_LEVEL += 1;
  xpToNextLevel = modules.getXpToNextLevel(window.PLAYER_LEVEL);
  initialiserStatsJoueur(window.PLAYER_LEVEL);
  modules.createFloatingText(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiserTalents();
}

export function updateXPBar() {
  const xpFill = document.getElementById("xp-fill");
  if (!xpFill) return;
  let maxXP = xpToNextLevel;
  if (window.PLAYER_LEVEL >= 10) {
    maxXP = modules.getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
  }
  const percent = Math.min(100, (playerXP / maxXP) * 100);
  xpFill.style.width = percent + "%";
}

// === Utilisation d'un talent ===
export function utiliserTalent(talent, index) {
  if (cooldowns[index]) return;
  if (modules.getPlayerMana() < talent.cost) return;

  animerAttaque();

  const player = document.getElementById("player");
  if (!player) return;

  if (talent.color && talent.duration) {
    player.style.filter = `drop-shadow(0 0 6px ${talent.color})`;
    setTimeout(() => {
      player.style.filter = "";
    }, talent.duration);
  }

  if (talent.opacity !== undefined) {
    player.style.opacity = talent.opacity;
    setTimeout(() => {
      player.style.opacity = 1;
    }, 1000);
  }

  if (talent.effectText) {
    modules.createFloatingText(talent.effectText, talent.color || "white");
  }

  modules.setPlayerMana(modules.getPlayerMana() - talent.cost);
  updateManaBar();

  cooldowns[index] = true;
  const btn = document.getElementById(`talent-btn-${index}`);
  if (btn) btn.disabled = true;

  setTimeout(() => {
    cooldowns[index] = false;
    if (btn) btn.disabled = false;
  }, talent.cooldown);

  if (combatActif) {
    if (talent.zone === 'adjacent' || talent.zone === 'zone') {
      modules.getMonstresAdjacentsEtSurCase().forEach(monstre => {
        if (talent.type === "attack") {
          let degats = talent.damage;
          if ((talent.niveauRequis || 1) === 1) {
            degats = modules.getPlayerBaseAtk(window.PLAYER_LEVEL);
          }
          modules.recevoirDegats(degats, monstre.data.uniqueId);
        } else if (talent.type === "utility") {
          switch (talent.boostType) {
            case "stun":
              modules.applyStatusEffect(monstre.data.uniqueId, "stunned", talent.duration);
              break;
            case "heal":
            case "soin":
              modules.setPlayerPV(Math.min(modules.getMaxVie(window.PLAYER_LEVEL), modules.getPlayerPV() + (talent.value || 0)));
              if (typeof afficherMessage === 'function') {
                afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
              }
              break;
            case "poison":
              modules.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration);
              break;
            case "burn":
              modules.applyStatusEffect(monstre.data.uniqueId, "burning", talent.duration);
              break;
            case "dot":
              modules.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, talent.value);
              break;
            case "debuff_atk":
              modules.applyStatusEffect(monstre.data.uniqueId, "debuff_atk", talent.duration, talent.value);
              break;
            case "evasion":
              dashBackwards();
              setCombat(false);
              modules.stopAllMonsters();
              setTimeout(() => {
                const currentX = getPlayerX();
                const currentY = getPlayerY();
                const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
                for (const monsterDiv of monsterElements) {
                  const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
                  const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
                }
              }, 100);
              if (typeof afficherMessage === 'function') {
                afficherMessage("Vous vous échappez discrètement du combat !", "success");
              }
              break;
            default:
              break;
          }
        } else if (talent.type === "defense") {
          switch (talent.defenseType) {
            case "dot":
              const dotScaling = talent.dotScaling !== undefined ? talent.dotScaling : 0.5;
              const dotValue = Math.max(1, Math.round(talent.value + (window.PLAYER_LEVEL - 1) * dotScaling));
              modules.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, dotValue);
              break;
            default:
              break;
          }
        }
      });
      return;
    }
    const monstreActif = modules.getMonstreActif();
    if (monstreActif) {
      switch (talent.type) {
        case "attack":
          let degats = talent.damage;
          if ((talent.niveauRequis || 1) === 1) {
            degats = modules.getPlayerBaseAtk(window.PLAYER_LEVEL);
          }
          modules.recevoirDegats(degats, monstreActif.data.uniqueId);
          break;
        case "utility":
          switch (talent.boostType) {
            case "stun":
              modules.applyStatusEffect(monstreActif.data.uniqueId, "stunned", talent.duration);
              break;
            case "heal":
            case "soin":
              modules.setPlayerPV(Math.min(modules.getMaxVie(window.PLAYER_LEVEL), modules.getPlayerPV() + (talent.value || 0)));
              if (typeof afficherMessage === 'function') {
                afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
              }
              break;
            case "poison":
              modules.applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration);
              break;
            case "burn":
              modules.applyStatusEffect(monstreActif.data.uniqueId, "burning", talent.duration);
              break;
            case "dot":
              modules.applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, talent.value);
              break;
            case "debuff_atk":
              modules.applyStatusEffect(monstreActif.data.uniqueId, "debuff_atk", talent.duration, talent.value);
              break;
            case "evasion":
              dashBackwards();
              setCombat(false);
              modules.stopAllMonsters();
              setTimeout(() => {
                const currentX = getPlayerX();
                const currentY = getPlayerY();
                const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
                for (const monsterDiv of monsterElements) {
                  const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
                  const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
                }
              }, 100);
              if (typeof afficherMessage === 'function') {
                afficherMessage("Vous vous échappez discrètement du combat !", "success");
              }
              break;
            default:
              break;
          }
          break;
        case "defense":
          if (talent.defenseType === "shield") {
            modules.applyShield(talent.value, talent.duration);
          } else if (talent.defenseType === "dot") {
            const dotScaling = talent.dotScaling !== undefined ? talent.dotScaling : 0.5;
            const dotValue = Math.max(1, Math.round(talent.value + (window.PLAYER_LEVEL - 1) * dotScaling));
            modules.applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, dotValue);
          }
          break;
      }
    }
  }
}

// === Initialisation des talents ===
export function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  const talentsData = modules.getTalents();
  const skills = Array.isArray(talentsData)
    ? talentsData.filter(t => t && t.id && (t.niveauRequis || 1) <= window.PLAYER_LEVEL)
    : [];
  talentButtons.innerHTML = '';
  skills.forEach((talent, index) => {
    if (!talent || !talent.name) return;
    const btn = document.createElement(`button`);
    btn.id = `talent-btn-${index}`;
    btn.textContent = `${index + 1}. ${talent.name}`;
    btn.onclick = () => utiliserTalent(talent, index);
    talentButtons.appendChild(btn);
  });
}

// === Animation attaque ===
function animerAttaque() {
  const player = document.getElementById("player");
  if (!player) return;

  const frameCount = 3;
  const frameWidth = 64;
  let frame = 0;

  player.style.backgroundImage = `url(/static/img/classes/${getPlayerClass().toLowerCase()}_attack.png)`;
  player.style.backgroundSize = `${frameCount * frameWidth}px 64px`;

  const interval = setInterval(() => {
    player.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
    frame++;
    if (frame >= frameCount) {
      clearInterval(interval);
      player.style.backgroundImage = `url(/static/img/classes/${getPlayerClass().toLowerCase()}_idle.png)`;
      player.style.backgroundSize = `64px 64px`;
      player.style.backgroundPosition = `0px 0px`;
    }
  }, 100);
}

// Nouvelle fonction pour réaliser le dash arrière
export function dashBackwards() {
  let currentX = getPlayerX();
  let currentY = getPlayerY();

  const directions = [
    { dx: 0, dy: -1 }, 
    { dx: 1, dy: -1 }, 
    { dx: 1, dy: 0 },  
    { dx: 1, dy: 1 },  
    { dx: 0, dy: 1 },  
    { dx: -1, dy: 1 }, 
    { dx: -1, dy: 0 }, 
    { dx: -1, dy: -1 } 
  ];

  modules.isBlocked(currentX, currentY);
  let found = false;
  for (const dir of directions) {
    const tryX = currentX + dir.dx;
    const tryY = currentY + dir.dy;
    if (!modules.isBlocked(tryX, tryY)) {
      setPlayerPosition(tryX, tryY);
      found = true;
      break;
    }
  }
  if (!found) {
  }
}

// === Régénération automatique ===
let regenInterval = null;
let isGameOver = false;

import { startRegen as startRegenState } from './playerState.js';

startRegenState();

// Correction double déclaration : ne déclare originalAfficherGameOver qu'une seule fois
if (typeof originalAfficherGameOver === 'undefined') {
  var originalAfficherGameOver = typeof afficherGameOver === 'function' ? afficherGameOver : null;
}
window.afficherGameOver = function(...args) {
  isGameOver = true;
  modules.stopRegen();
  if (originalAfficherGameOver) {
    originalAfficherGameOver.apply(this, args);
  }
};

updateXPBar();

export function getPlayerSaveData() {
  return modules.getPlayerSaveData();
}

export async function loadPlayerData(saveData) {
  await modules.loadPlayerDataSave(saveData);
  updateXPBar();
}

export function getPlayerClass() {
  return window.PLAYER_CLASS;
}

startRegenState();

// Correction double déclaration : ne déclare originalAfficherGameOver qu'une seule fois
if (typeof originalAfficherGameOver === 'undefined') {
  var originalAfficherGameOver = typeof afficherGameOver === 'function' ? afficherGameOver : null;
}
window.afficherGameOver = function(...args) {
  isGameOver = true;
  modules.stopRegen();
  if (originalAfficherGameOver) {
    originalAfficherGameOver.apply(this, args);
  }
};

updateXPBar();

export function setCombat(actif) {
  combatActif = actif;
  if (!combatActif) {
    startRegenState();
  } else {
    modules.stopRegen();
  }
}
