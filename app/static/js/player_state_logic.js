// player_state_logic.js
// Gestion centralisée de l'état du joueur (stats, position, classe, inventaire, etc.)
// Refactorisé pour clarté, cohérence et maintenabilité

// --- Etat global du joueur ---
let state = {
  level: 1,
  xp: 0,
  pv: 120,
  mana: 15,
  atk: 3,
  def: 2,
  classe: "Paladin",
  carte: "A1",
  position: { x: 0, y: 0 },
  inventaire: [],
  talents: [],
  pvMax: 120,
  manaMax: 15,
};

// --- Modificateurs par classe ---
const CLASS_MODIFIERS = {
  Paladin:   { atk: 0, def: 1, hp: 1, mana: 0, regenPV: 2, regenMana: 1 },
  Barbare:   { atk: 1, def: 0, hp: 1, mana: 0, regenPV: 1, regenMana: 0 },
  Mage:      { atk: 0, def: 0, hp: 0, mana: 2, regenPV: 0, regenMana: 3 },
  Voleur:    { atk: 1, def: 0, hp: 0, mana: 1, regenPV: 1, regenMana: 2 },
};

// --- Getters d'état joueur ---
function getPlayerLevel() { return state.level; } // Niveau
function getPlayerXP() { return state.xp; } // XP
function getPlayerPV() { return state.pv; } // Points de vie
function getPlayerMana() { return state.mana; } // Mana
function getPlayerAtk() { return state.atk; } // Attaque
function getPlayerDef() { return state.def; } // Défense
function getPlayerClass() { return state.classe; } // Classe
function getPlayerPosition() { return { ...state.position }; } // Position (copie)
function getPlayerInventory() { return [...state.inventaire]; } // Inventaire (copie)
function getPlayerTalents() { return [...state.talents]; } // Talents (copie)
function getPlayerMap() { return state.carte; } // Carte courante
function getCentralPlayerPosition() { return { ...state.position }; } // Alias position
function getCurrentClassModifiers() { return CLASS_MODIFIERS[state.classe] || { atk: 0, def: 0, hp: 0, mana: 0 }; }
function getPlayerEffectiveStats() {
  // Renvoie les stats effectives (base + bonus de classe)
  const mods = getCurrentClassModifiers();
  return {
    atk: state.atk + mods.atk,
    def: state.def + mods.def,
    pv: state.pv + mods.hp,
    mana: state.mana + mods.mana,
  };
}

// --- Régénération automatique (PV/Mana) ---
let regenInterval = null;
function startRegen() {
  if (regenInterval) return;
  regenInterval = setInterval(() => {
    if (window.isGameOver || window.combatActif) return;
    const mods = getCurrentClassModifiers();
    const pvBonusClass = typeof mods.regenPV === 'number' ? mods.regenPV : 1;
    const manaBonusClass = typeof mods.regenMana === 'number' ? mods.regenMana : 1;
    const pvBonusPercent = Math.max(1, Math.floor(getMaxPlayerPV() * 0.05));
    const manaBonusPercent = Math.max(1, Math.floor(getMaxPlayerMana() * 0.05));
    const pvBonus = pvBonusClass + pvBonusPercent;
    const manaBonus = manaBonusClass + manaBonusPercent;
    setPlayerPV(Math.min(getPlayerPV() + pvBonus, getMaxPlayerPV()));
    setPlayerMana(Math.min(getPlayerMana() + manaBonus, getMaxPlayerMana()));
  }, 1000);
}
function stopRegen() {
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}

// --- Helpers pour PV/Mana max ---
function getMaxPlayerPV() { return state.pvMax || 120; }
function getMaxPlayerMana() { return state.manaMax || 15; }

// --- Setters d'état joueur ---
import * as modules from './modules_main_logic.js';
function emitPlayerStatsChanged() {
  window.dispatchEvent(new Event('playerStatsChanged'));
}
function setPlayerLevel(lvl) { state.level = lvl; emitPlayerStatsChanged(); }
function setPlayerXP(xp) { state.xp = xp; emitPlayerStatsChanged(); }
function setPlayerPV(pv) {
  if (window.isGameOver) return;
  state.pv = pv;
  emitPlayerStatsChanged();
  if (state.pv <= 0 && typeof window.afficherGameOver === 'function') {
    window.afficherGameOver();
    if (typeof modules.setCombat === 'function') {
      modules.setCombat(false); // Force la fin du combat
    }
  }
}
function setPlayerMana(mana) { state.mana = mana; emitPlayerStatsChanged(); }
function setPlayerAtk(atk) { state.atk = atk; emitPlayerStatsChanged(); }
function setPlayerDef(def_) { state.def = def_; emitPlayerStatsChanged(); }
function setPlayerClass(classe) { state.classe = classe; emitPlayerStatsChanged(); }
function setPlayerPosition(x, y) { state.position = { x, y }; emitPlayerStatsChanged(); }
function setPlayerInventory(inv) { state.inventaire = [...inv]; emitPlayerStatsChanged(); }
function setPlayerTalents(tal) { state.talents = [...tal]; emitPlayerStatsChanged(); }
function setPlayerMap(map) { state.carte = map; emitPlayerStatsChanged(); }

// --- Initialisation / Reset ---
function initPlayerState(initData = {}) {
  state = { ...state, ...initData };
  emitPlayerStatsChanged();
}

// --- Sauvegarde ---
function getPlayerSaveData() {
  return { ...state };
}

// --- Exports publics à la fin ---
export {
  getPlayerLevel,
  getPlayerXP,
  getPlayerPV,
  getPlayerMana,
  getPlayerAtk,
  getPlayerDef,
  getPlayerClass,
  getPlayerPosition,
  getPlayerInventory,
  getPlayerTalents,
  getPlayerMap,
  getCentralPlayerPosition,
  getCurrentClassModifiers,
  getPlayerEffectiveStats,
  startRegen,
  stopRegen,
  getMaxPlayerPV,
  getMaxPlayerMana,
  setPlayerLevel,
  setPlayerXP,
  setPlayerPV,
  setPlayerMana,
  setPlayerAtk,
  setPlayerDef,
  setPlayerClass,
  setPlayerPosition,
  setPlayerInventory,
  setPlayerTalents,
  setPlayerMap,
  initPlayerState,
  getPlayerSaveData
};
