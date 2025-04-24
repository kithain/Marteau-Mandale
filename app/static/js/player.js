// player.js

// === Variables exportées (globales) ===
// Ces variables sont initialisées à 0, puis mises à jour selon le niveau du joueur au chargement de la partie ou lors d'un level-up
export let cooldowns = {};
export let combatActif = false;
export let playerDef = 0; // Nouvelle stat de défense, calculée par niveau

import { getPlayerPV, setPlayerPV, getPlayerMana, setPlayerMana } from './playerState.js';

// Fonction pour initialiser les stats selon le niveau
export function initialiserStatsJoueur(level) {
  setPlayerPV(getMaxVie(level));
  setPlayerMana(getMaxMana(level));
  playerDef = getPlayerBaseDef(level);
}

// === XP et Niveau ===
export let playerXP = 0;
export let xpToNextLevel = 100;

import {
  createFloatingText,
  applyBoost,
  applyShield,
  applyStun,
  applyPoison,
  afficherDegats,
  infligerDegatsAuJoueur,
  afficherGameOver,
  startRegen,
  stopRegen
} from './player_utils.js';

export { createFloatingText, applyBoost, applyShield, applyStun, applyPoison, afficherDegats, infligerDegatsAuJoueur, afficherGameOver, startRegen, stopRegen };

import { getMaxVie, getMaxMana } from './progression.js';
import { getPlayerBaseAtk, filterTalentsByLevel } from './progression.js';
import { getPlayerBaseDef } from './progression.js'; // Import de la fonction getPlayerBaseDef
import { recevoirDegats, getMonstreActif, applyStatusEffect, stopAllMonsters } from './monstre.js';

import {
  getAllTalentsList,
  getTalentsFromIds,
  getTalents
} from './player_talents.js';

export { getAllTalentsList, getTalentsFromIds, getTalents };

export { dashStealth } from './player_talents.js';

// Fonction utilitaire pour obtenir l'XP nécessaire pour atteindre le niveau donné
function getXpToNextLevel(level) {
  let xp = 100; 
  for (let i = 1; i < level; i++) {
    xp = Math.floor(xp * 1.5);
  }
  return xp;
}

// === Position du joueur ===
const playerPosition = { x: 0, y: 0 };

export function getPlayerPosition() {
  return { ...playerPosition };
}

export function setPlayerPosition(x, y) {
  playerPosition.x = x;
  playerPosition.y = y;
  window.PLAYER_POSITION = { x, y }; 
}

export function getPlayerX() {
  return playerPosition.x;
}

export function getPlayerY() {
  return playerPosition.y;
}

// === Vie // Mana ===
export function updateManaBar() {
  const manaFill = document.getElementById("mana-fill");
  if (!manaFill) return;
  const percent = (getPlayerMana() / getMaxMana(window.PLAYER_LEVEL)) * 100;
  manaFill.style.width = percent + "%";
}

export function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  if (!vieFill) return;
  const percent = (getPlayerPV() / getMaxVie(window.PLAYER_LEVEL)) * 100;
  vieFill.style.width = percent + "%";
}

// === XP ===
export function gainXP(amount) {
  if (window.PLAYER_LEVEL >= 10) {
    const maxXP = getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
    window.PLAYER_XP = playerXP;
    updateXPBar();
    return;
  }
  playerXP += amount;
  while (playerXP >= xpToNextLevel) {
    levelUp();
    if (window.PLAYER_LEVEL >= 10) {
      playerXP = getXpToNextLevel(10);
      break;
    }
  }
  window.PLAYER_XP = playerXP;
  updateXPBar();
}

export function levelUp() {
  if (window.PLAYER_LEVEL >= 10) {
    return;
  }
  window.PLAYER_XP -= xpToNextLevel;
  window.PLAYER_LEVEL += 1;
  xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  initialiserStatsJoueur(window.PLAYER_LEVEL);
  createFloatingText(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiserTalents();
}

export function updateXPBar() {
  const xpFill = document.getElementById("xp-fill");
  if (!xpFill) return;
  let maxXP = xpToNextLevel;
  if (window.PLAYER_LEVEL >= 10) {
    maxXP = getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
  }
  const percent = Math.min(100, (playerXP / maxXP) * 100);
  xpFill.style.width = percent + "%";
}

// === Utilisation d'un talent ===
export function utiliserTalent(talent, index) {
  if (cooldowns[index]) return;
  if (getPlayerMana() < talent.cost) return;

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
    createFloatingText(talent.effectText, talent.color || "white");
  }

  setPlayerMana(getPlayerMana() - talent.cost);
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
      import('./monstre.js').then(module => {
        const monstres = module.getMonstresAdjacentsEtSurCase ? module.getMonstresAdjacentsEtSurCase() : [];
        monstres.forEach(monstre => {
          if (talent.type === "attack") {
            let degats = talent.damage;
            if ((talent.niveauRequis || 1) === 1) {
              degats = getPlayerBaseAtk(window.PLAYER_LEVEL);
            }
            module.recevoirDegats(degats, monstre.data.uniqueId);
          } else if (talent.type === "utility") {
            switch (talent.boostType) {
              case "stun":
                module.applyStatusEffect(monstre.data.uniqueId, "stunned", talent.duration);
                break;
              case "heal":
              case "soin":
                setPlayerPV(Math.min(getMaxVie(window.PLAYER_LEVEL), getPlayerPV() + (talent.value || 0)));
                if (typeof afficherMessage === 'function') {
                  afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
                }
                break;
              case "poison":
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration);
                break;
              case "burn":
                module.applyStatusEffect(monstre.data.uniqueId, "burning", talent.duration);
                break;
              case "dot":
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, talent.value);
                break;
              case "debuff_atk":
                module.applyStatusEffect(monstre.data.uniqueId, "debuff_atk", talent.duration, talent.value);
                break;
              case "evasion":
                dashBackwards();
                setCombat(false);
                stopAllMonsters();
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
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, dotValue);
                break;
              default:
                break;
            }
          }
        });
      });
      return;
    }
    const monstreActif = getMonstreActif();
    if (!monstreActif) return;
    switch (talent.type) {
      case "attack":
        let degats = talent.damage;
        if ((talent.niveauRequis || 1) === 1) {
          degats = getPlayerBaseAtk(window.PLAYER_LEVEL);
        }
        recevoirDegats(degats, monstreActif.data.uniqueId);
        break;
      case "utility":
        switch (talent.boostType) {
          case "stun":
            applyStatusEffect(monstreActif.data.uniqueId, "stunned", talent.duration);
            break;
          case "heal":
          case "soin":
            setPlayerPV(Math.min(getMaxVie(window.PLAYER_LEVEL), getPlayerPV() + (talent.value || 0)));
            if (typeof afficherMessage === 'function') {
              afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
            }
            break;
          case "poison":
            applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration);
            break;
          case "burn":
            applyStatusEffect(monstreActif.data.uniqueId, "burning", talent.duration);
            break;
          case "dot":
            applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, talent.value);
            break;
          case "debuff_atk":
            applyStatusEffect(monstreActif.data.uniqueId, "debuff_atk", talent.duration, talent.value);
            break;
          case "evasion":
            dashBackwards();
            setCombat(false);
            stopAllMonsters();
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
          applyShield(talent.value, talent.duration);
        } else if (talent.defenseType === "dot") {
          const dotScaling = talent.dotScaling !== undefined ? talent.dotScaling : 0.5;
          const dotValue = Math.max(1, Math.round(talent.value + (window.PLAYER_LEVEL - 1) * dotScaling));
          applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, dotValue);
        }
        break;
    }
  }
}

// === Initialisation des talents ===
export function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  const talentsData = getTalents();
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

  import('./map.js').then(module => {
    const { isBlocked, setPlayerPosition } = module;
    let found = false;
    for (const dir of directions) {
      const tryX = currentX + dir.dx;
      const tryY = currentY + dir.dy;
      if (!isBlocked(tryX, tryY)) {
        setPlayerPosition(tryX, tryY);
        found = true;
        break;
      }
    }
    if (!found) {
    }
  });
}

// === Régénération automatique ===
let regenInterval = null;
let isGameOver = false;

startRegen();

// Correction double déclaration : ne déclare originalAfficherGameOver qu'une seule fois
if (typeof originalAfficherGameOver === 'undefined') {
  var originalAfficherGameOver = typeof afficherGameOver === 'function' ? afficherGameOver : null;
}
window.afficherGameOver = function(...args) {
  isGameOver = true;
  stopRegen();
  if (originalAfficherGameOver) {
    originalAfficherGameOver.apply(this, args);
  }
};

updateXPBar();

export function getPlayerSaveData() {
  return {
    vie: getPlayerPV(), // vie restante (actuelle)
    mana: getPlayerMana(), // mana restant (actuel)
    experience: playerXP,
    niveau: window.PLAYER_LEVEL,
    statistiques: {
      ...(window.PLAYER_STATS || {}),
      vie: getMaxVie(window.PLAYER_LEVEL) // vie max (calculée dynamiquement)
    },
    carte: window.PLAYER_CARTE || '',
    inventaire: window.PLAYER_INVENTAIRE || [],
    position: getPlayerPosition(),
    deplacementSansRencontre: (typeof window.DEP_SANS_RENCONTRE === 'number') ? window.DEP_SANS_RENCONTRE : undefined
  };
}

export async function updatePlayerStats(stats) {
  try {
    const response = await fetch('/api/player/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des statistiques');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

export function getPlayerClass() {
  return window.PLAYER_CLASS;
}

startRegen();

// Correction double déclaration : ne déclare originalAfficherGameOver qu'une seule fois
if (typeof originalAfficherGameOver === 'undefined') {
  var originalAfficherGameOver = typeof afficherGameOver === 'function' ? afficherGameOver : null;
}
window.afficherGameOver = function(...args) {
  isGameOver = true;
  stopRegen();
  if (originalAfficherGameOver) {
    originalAfficherGameOver.apply(this, args);
  }
};

updateXPBar();

export function setCombat(actif) {
  combatActif = actif;
  if (!combatActif) {
    startRegen();
  } else {
    stopRegen();
  }
}

export async function loadPlayerData(saveData) {
  const isNewGame = (saveData && saveData.niveau === 1 && saveData.experience === 0);
  window.PLAYER_LEVEL = (saveData && typeof saveData.niveau === 'number') ? saveData.niveau : 1;
  initialiserStatsJoueur(window.PLAYER_LEVEL);
  if (saveData && typeof saveData.experience === 'number') {
    window.PLAYER_XP = saveData.experience;
    playerXP = window.PLAYER_XP;
  } else {
    window.PLAYER_XP = 0;
    playerXP = 0;
  }
  // Correction : restaurer PV et mana si présents dans la sauvegarde et non nuls
  if (typeof saveData.vie === 'number' && saveData.vie !== null) {
    setPlayerPV(saveData.vie);
  }
  if (typeof saveData.mana === 'number' && saveData.mana !== null) {
    setPlayerMana(saveData.mana);
  }
  updateXPBar();
}
