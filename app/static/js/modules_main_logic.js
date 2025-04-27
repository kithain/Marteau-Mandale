// Barrel file: modules_main_logic.js

// Imports globaux - À utiliser avec précaution car peut causer des conflits de noms
// export * from './player_main_logic.js';
// export * from './player_state_logic.js';
// export * from './progression_main_logic.js';
// export * from './monstre_main_logic.js';
// export * from './combat_manager_logic.js';
// export * from './map_main_logic.js';
// export * from './utils_main_logic.js';
// export * from './player_ui_logic.js';
// export * from './player_visual_utils.js';
// export * from './player_talents_logic.js';
// export * from './save_manager_logic.js';
// export * from './camera_main_logic.js';
// export * from './input_handler_logic.js'; 

// Centralise tous les exports publics de tes modules principaux

// camera_main_logic.js
export { movePlayer, resizeMapContainer } from './camera_main_logic.js';

// combat_manager_logic.js
export { 
  attaqueJoueur,
  attaqueMonstre,
  creerMonstreEtDemarrerCombat,
  demarrerCombat,
  finirCombat,
  getCombatActif,
  getCurrentMonstre,
  resetDeplacementSansRencontre,
  setDeplacementSansRencontre,
  getDeplacementSansRencontre,
  verifierCombatAdjMonstre,
  verifierRencontre,
  detecterSortie
} from './combat_manager_logic.js';

// input_handler_logic.js
export { handleKeydown, utiliserTalentEnCombat } from './input_handler_logic.js';

// map_main_logic.js
export { 
  currentMap, 
  exitZones, 
  tileSize, 
  blockedTiles, 
  maxTileCount, 
  isTransitioning, 
  getVisibleTileCount, 
  extraireCoordonneesCarte, 
  getBlockedKey, 
  isBlocked,
  setPlayerPosition as setPlayerPositionMap,
  deplacementVersCarte,
  chargerNouvelleCarte
} from './map_main_logic.js';

// monstre_main_logic.js
export { 
  creerMonstre,
  createMonsterElement,
  deplacerMonstre,
  deplacerTousMonstres,
  demarrerDeplacementMonstres,
  arreterDeplacementMonstres,
  getMonstreParId,
  getMonstresAdjacentsEtSurCase,
  getMonstresActifs,
  appliquerDegatsAuMonstre,
  appliquerSoinAuMonstre,
  appliquerBuffAuMonstre,
  appliquerDebuffAuMonstre,
  appliquerMissAuMonstre,
  appliquerPoison,
  appliquerStun,
  appliquerDebuffAtkMonstre,
  estEmpoisonne,
  retirerPoison,
  stopAllMonsters,
  getMonstrePV,
  supprimerMonstre
} from './monstre_main_logic.js';

// monstre_state_logic.js
export {
  createMonstreState,
  setMonstrePV,
  getMonstrePV as getMonstrePVState,
  setMonstrePosition,
  getMonstrePosition,
  setMonstreStatut,
  clearMonstreStatuts,
  resetMonstre,
  getMonstreSaveData,
  loadMonstreData,
  appliquerEffet,
  aEffet,
  retirerEffet,
  appliquerDebuffAtk
} from './monstre_state_logic.js';

// monstre_visual_utils.js
export {
  afficherDegatsMonstre,
  afficherSoinMonstre,
  afficherBuffMonstre,
  afficherDebuffMonstre,
  afficherMissMonstre
} from './monstre_visual_utils.js';

// player_main_logic.js
export { 
  cooldowns, 
  combatActif, 
  playerDef, 
  playerXP, 
  xpToNextLevel, 
  setPlayerPosition as setPlayerPositionPlayer, 
  getPlayerPosition as getPlayerPositionPlayer, 
  getPlayerX, 
  getPlayerY, 
  updateManaBar as updateManaBarPlayer, 
  updateVieBar as updateVieBarPlayer, 
  initialiserStatsJoueur, 
  gainXP, 
  levelUp, 
  updateXPBar as updateXPBarPlayer, 
  utiliserTalent, 
  initialiserTalents, 
  animerAttaque,
  dashBackwards,
  getPlayerSaveData as getPlayerSaveDataPlayer,
  loadPlayerData as loadPlayerDataPlayer,
  getPlayerClass as getPlayerClassPlayer,
  setCombat
} from './player_main_logic.js';

// player_state_logic.js
export {
  getPlayerLevel,
  getPlayerXP,
  getPlayerPV,
  getPlayerMana,
  getPlayerAtk,
  getPlayerDef,
  getPlayerClass as getPlayerClassState,
  getPlayerPosition as getPlayerPositionState,
  getPlayerInventory,
  getPlayerTalents,
  getPlayerMap,
  getCentralPlayerPosition,
  getCurrentClassModifiers,
  getPlayerEffectiveStats,
  startRegen,
  stopRegen,
  startRegen as startRegenState,
  stopRegen as stopRegenState,
  getMaxPlayerPV,
  getMaxPlayerMana,
  setPlayerLevel,
  setPlayerXP,
  setPlayerPV,
  setPlayerMana,
  setPlayerAtk,
  setPlayerDef,
  setPlayerClass as setPlayerClassState,
  setPlayerPosition as setPlayerPositionState,
  setPlayerInventory,
  setPlayerTalents,
  setPlayerMap,
  initPlayerState,
  getPlayerSaveData as getPlayerStateSaveData
} from './player_state_logic.js';

// player_talents_logic.js
export {
  getAllTalentsList,
  getTalentsFromIds,
  getTalents,
  utiliserTalent as utiliserTalentLogic,
  dashStealth,
  cooldowns as talentsCooldowns
} from './player_talents_logic.js';

// player_visual_utils.js
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
  startRegen as startRegenUtils, 
  stopRegen as stopRegenUtils,
  afficherSoin,
  afficherCritique,
  afficherEsquive,
  afficherParade,
  afficherBuff,
  afficherDebuff,
  afficherMiss
} from './player_visual_utils.js';

// progression_main_logic.js
export { 
  getXpToNextLevel, 
  filterTalentsByLevel, 
  onLevelUp, 
  getMaxVie, 
  getMaxMana, 
  getPlayerBaseAtk, 
  getPlayerBaseDef, 
  getMonsterPV, 
  getMonsterAtk, 
  getMonsterDef, 
  getMonsterXP 
} from './progression_main_logic.js';

// save_manager_logic.js
export { 
  loadPlayerData as loadPlayerDataSave, 
  getPlayerSaveData as getPlayerSaveDataSave 
} from './save_manager_logic.js';

// utils_main_logic.js
export { 
  initConnexion, 
  afficherMessage, 
  initSmokeAnimation, 
  initParticles 
} from './utils_main_logic.js';

// player_ui_logic.js
export { 
  updatePlayerStatsPanel, 
  updatePVBar, 
  updateManaBar, 
  updateXPBar, 
  updateAllPlayerUI 
} from './player_ui_logic.js';