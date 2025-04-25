// playerState.js
// Module centralisé pour l'état du joueur

let state = {
  level: 1,
  xp: 0,
  pv: 120,
  mana: 15,
  atk: 3,
  def: 2,
  classe: "Paladin",
  carte: "A1", // Ajout de la carte courante
  position: { x: 0, y: 0 },
  inventaire: [],
  talents: [],
  pvMax: 120,
  manaMax: 15,
  // Ajoute ici d'autres propriétés nécessaires
};

// --- Modificateurs de classes ---
const CLASS_MODIFIERS = {
  Paladin:   { atk: 0, def: 1, hp: 1, mana: 0, regenPV: 2, regenMana: 1 },
  Barbare:   { atk: 1, def: 0, hp: 1, mana: 0, regenPV: 1, regenMana: 0 },
  Mage:      { atk: 0, def: 0, hp: 0, mana: 2, regenPV: 0, regenMana: 3 },
  Voleur:    { atk: 1, def: 0, hp: 0, mana: 1, regenPV: 1, regenMana: 2 },
};

// --- Getters ---
export function getPlayerLevel() { return state.level; }
export function getPlayerXP() { return state.xp; }
export function getPlayerPV() { return state.pv; }
export function getPlayerMana() { return state.mana; }
export function getPlayerAtk() { return state.atk; }
export function getPlayerDef() { return state.def; }
export function getPlayerClass() { return state.classe; }
export function getPlayerPosition() { return { ...state.position }; }
export function getPlayerInventory() { return [...state.inventaire]; }
export function getPlayerTalents() { return [...state.talents]; }
export function getPlayerMap() { return state.carte; }

// Ajout : getter centralisé pour la position (pour modules.js)
export function getCentralPlayerPosition() { return { ...state.position }; }

export function getCurrentClassModifiers() {
  return CLASS_MODIFIERS[state.classe] || { atk: 0, def: 0, hp: 0, mana: 0 };
}

export function getPlayerEffectiveStats() {
  const mods = getCurrentClassModifiers();
  return {
    atk: state.atk + mods.atk,
    def: state.def + mods.def,
    pv: state.pv + mods.hp,
    mana: state.mana + mods.mana,
  };
}

// --- Régénération automatique ---
let regenInterval = null;

export function startRegen() {
  if (regenInterval) return;
  regenInterval = setInterval(() => {
    if (window.isGameOver || window.combatActif) return;
    const mods = getCurrentClassModifiers();
    // Calcul du bonus de base par classe
    const pvBonusClass = typeof mods.regenPV === 'number' ? mods.regenPV : 1;
    const manaBonusClass = typeof mods.regenMana === 'number' ? mods.regenMana : 1;
    // Calcul du bonus dynamique : 2% du max
    const pvBonusPercent = Math.max(1, Math.floor(getMaxPlayerPV() * 0.05));
    const manaBonusPercent = Math.max(1, Math.floor(getMaxPlayerMana() * 0.05));
    // Total
    const pvBonus = pvBonusClass + pvBonusPercent;
    const manaBonus = manaBonusClass + manaBonusPercent;
    setPlayerPV(Math.min(getPlayerPV() + pvBonus, getMaxPlayerPV()));
    setPlayerMana(Math.min(getPlayerMana() + manaBonus, getMaxPlayerMana()));
  }, 1000);
}

export function stopRegen() {
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}

// Helpers pour PV/mana max (à adapter si besoin)
export function getMaxPlayerPV() {
  // Peut être adapté pour inclure les modificateurs de classe
  return state.pvMax || 120;
}
export function getMaxPlayerMana() {
  return state.manaMax || 15;
}

// --- Setters ---
function emitPlayerStatsChanged() {
  window.dispatchEvent(new Event('playerStatsChanged'));
}
export function setPlayerLevel(lvl) { state.level = lvl; emitPlayerStatsChanged(); }
export function setPlayerXP(xp) { state.xp = xp; emitPlayerStatsChanged(); }
export function setPlayerPV(pv) { state.pv = pv; emitPlayerStatsChanged(); }
export function setPlayerMana(mana) { state.mana = mana; emitPlayerStatsChanged(); }
export function setPlayerAtk(atk) { state.atk = atk; emitPlayerStatsChanged(); }
export function setPlayerDef(def_) { state.def = def_; emitPlayerStatsChanged(); }
export function setPlayerClass(classe) { state.classe = classe; emitPlayerStatsChanged(); }
export function setPlayerPosition(x, y) { state.position = { x, y }; emitPlayerStatsChanged(); }
export function setPlayerInventory(inv) { state.inventaire = [...inv]; emitPlayerStatsChanged(); }
export function setPlayerTalents(tal) { state.talents = [...tal]; emitPlayerStatsChanged(); }
export function setPlayerMap(map) { state.carte = map; emitPlayerStatsChanged(); }

// --- Reset/Init ---
export function initPlayerState(initData = {}) {
  state = { ...state, ...initData };
}

// --- Pour la sauvegarde ---
export function getPlayerSaveData() {
  return { ...state };
}
