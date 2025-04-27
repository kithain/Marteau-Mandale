// player_main_logic.js
// Gestion du joueur : stats, position, talents, animation, régénération, sauvegarde
// Refactorisé pour clarté, cohérence et maintenabilité

// === Variables globales et imports ===
let cooldowns = {};
let combatActif = false;
let playerDef = 0; // Stat de défense calculée par niveau
let playerXP = 0;
let xpToNextLevel = 100;
let regenInterval = null;
let isGameOver = false;

import * as modules from './modules_main_logic.js';
import { setPlayerPosition as setPlayerPositionState, getCentralPlayerPosition } from './player_state_logic.js';

// === Stats ===
// Fonction pour initialiser les stats selon le niveau
function initialiserStatsJoueur(level) {
  modules.setPlayerPV(modules.getMaxVie(level));
  modules.setPlayerMana(modules.getMaxMana(level));
  playerDef = modules.getPlayerBaseDef(level);
}

// === XP et niveau ===
// Fonction pour gérer le gain d'XP et le niveau
function gainXP(amount) {
  if (window.PLAYER_LEVEL >= 10) {
    const maxXP = modules.getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
    window.PLAYER_XP = playerXP;
    modules.setPlayerXP(playerXP);
    updateXPBar();
    return;
  }
  playerXP += amount;
  modules.setPlayerXP(playerXP);
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

function levelUp() {
  if (window.PLAYER_LEVEL >= 10) return;
  window.PLAYER_XP -= xpToNextLevel;
  modules.setPlayerXP(window.PLAYER_XP);
  window.PLAYER_LEVEL += 1;
  xpToNextLevel = modules.getXpToNextLevel(window.PLAYER_LEVEL);
  initialiserStatsJoueur(window.PLAYER_LEVEL);
  modules.createFloatingText(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiserTalents();
}

function updateXPBar() {
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

// === Position du joueur ===
// Fonction pour définir la position du joueur
function setPlayerPosition(x, y) {
  setPlayerPositionState(x, y);
}
function getPlayerPosition() {
  return getCentralPlayerPosition();
}
function getPlayerX() {
  return getCentralPlayerPosition().x;
}
function getPlayerY() {
  return getCentralPlayerPosition().y;
}

// === Vie / Mana ===
// Fonction pour mettre à jour les barres de vie et de mana
function updateManaBar() {
  const manaFill = document.getElementById("mana-fill");
  if (!manaFill) return;
  const percent = (modules.getPlayerMana() / modules.getMaxMana(window.PLAYER_LEVEL)) * 100;
  manaFill.style.width = percent + "%";
}

function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  if (!vieFill) return;
  const percent = (modules.getPlayerPV() / modules.getMaxVie(window.PLAYER_LEVEL)) * 100;
  vieFill.style.width = percent + "%";
}

// === Talents ===
// Fonction pour utiliser un talent
function utiliserTalent(talent, index) {
  if (cooldowns[index]) return;
  if (modules.getPlayerMana() < talent.cost) return;
  animerAttaque();
  const player = document.getElementById("player");
  if (!player) return;
  if (talent.color && talent.duration) {
    player.style.filter = `drop-shadow(0 0 6px ${talent.color})`;
    setTimeout(() => { player.style.filter = ""; }, talent.duration);
  }
  if (talent.opacity !== undefined) {
    player.style.opacity = talent.opacity;
    setTimeout(() => { player.style.opacity = 1; }, 1000);
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
        }
        if (talent.type === "poison") {
          const dotValue = talent.dot || 1;
          modules.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, dotValue);
        }
      });
    } else if (talent.type === "heal") {
      modules.setPlayerPV(Math.min(modules.getPlayerPV() + (talent.heal || 1), modules.getMaxVie(window.PLAYER_LEVEL)));
      updateVieBar();
    } else if (talent.type === "boost") {
      modules.applyBoost(talent.boostType, talent.boostValue, talent.duration);
    }
  }
}

// === Initialisation des talents ===
// Fonction pour initialiser les talents
function initialiserTalents() {
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
    btn.onclick = () => {
      if (window.combatActif) {
        modules.utiliserTalentEnCombat(talent);
      }
    };
    talentButtons.appendChild(btn);
  });
}

// === Animation attaque ===
// Fonction pour animer l'attaque
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

// === Dash arrière ===
// Fonction pour réaliser le dash arrière
function dashBackwards() {
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
// Fonction pour gérer la régénération automatique
// ... (logique de régénération si présente)

// === Sauvegarde et chargement ===
// Fonction pour exporter les données du joueur
function getPlayerSaveData() {
  // ... (logique d'export des données du joueur)
}
// Fonction pour importer les données du joueur
function loadPlayerData(saveData) {
  // ... (logique d'import des données du joueur)
}

// === Classe et combat ===
// Fonction pour obtenir la classe du joueur
function getPlayerClass() {
  return window.PLAYER_CLASS || 'Aventurier';
}
// Fonction pour définir le combat
function setCombat(actif) {
  combatActif = actif;
  window.combatActif = actif;
}

// --- Exports publics à la fin ---
export {
  cooldowns,
  combatActif,
  playerDef,
  playerXP,
  xpToNextLevel,
  setPlayerPosition,
  getPlayerPosition,
  getPlayerX,
  getPlayerY,
  updateManaBar,
  updateVieBar,
  initialiserStatsJoueur,
  gainXP,
  levelUp,
  updateXPBar,
  utiliserTalent,
  initialiserTalents,
  animerAttaque,
  dashBackwards,
  getPlayerSaveData,
  loadPlayerData,
  getPlayerClass,
  setCombat
};
