// Barrel file: modules.js

export * from './player.js';
export * from './playerState.js';
export * from './progression.js';
export * from './monstre.js';
export * from './combat_manager.js';
export * from './map.js';
export * from './utils.js';
export * from './playerUI.js';
export * from './player_utils.js';
export * from './player_talents.js';
export * from './saveManager.js';
export * from './camera.js';
export * from './input_handler.js'; 
// Centralise tous les exports publics de tes modules principaux

// camera.js
export { movePlayer, resizeMapContainer } from './camera.js';

// combat_manager.js
export { setDeplacementSansRencontre, getDeplacementSansRencontre, resetDeplacementSansRencontre, verifierRencontre, detecterSortie, verifierCombatAdjMonstre } from './combat_manager.js';

// input_handler.js
export { handleKeydown } from './input_handler.js';

// map.js
export { currentMap, exitZones, tileSize, blockedTiles, maxTileCount, isTransitioning, getVisibleTileCount, extraireCoordonneesCarte, getBlockedKey, isBlocked, setPlayerPosition as setPlayerPositionMap, deplacementVersCarte } from './map.js';

// monstre.js
// (Aucune fonction exportée explicitement trouvée, à ajouter si besoin)

// player.js
export { cooldowns, combatActif, playerDef, initialiserStatsJoueur, playerXP, xpToNextLevel, setPlayerPosition as setPlayerPositionPlayer, getPlayerPosition as getPlayerPositionPlayer, getPlayerX, getPlayerY, updateManaBar as updateManaBarPlayer, updateVieBar as updateVieBarPlayer, gainXP, levelUp, updateXPBar as updateXPBarPlayer, utiliserTalent, initialiserTalents, dashBackwards, getPlayerSaveData as getPlayerSaveDataPlayer, loadPlayerData as loadPlayerDataPlayer, getPlayerClass as getPlayerClassPlayer, setCombat } from './player.js';

// playerState.js
export { getPlayerLevel, getPlayerXP, getPlayerPV, getPlayerMana, getPlayerAtk, getPlayerDef, getPlayerClass as getPlayerClassState, getPlayerPosition as getPlayerPositionState, getPlayerInventory, getPlayerTalents, getPlayerMap, getCentralPlayerPosition, getCurrentClassModifiers, getPlayerEffectiveStats, startRegen as startRegenState, stopRegen as stopRegenState, getMaxPlayerPV, getMaxPlayerMana, setPlayerLevel, setPlayerXP, setPlayerPV, setPlayerMana, setPlayerAtk, setPlayerDef, setPlayerClass as setPlayerClassState, setPlayerPosition as setPlayerPositionState, setPlayerMap, setPlayerInventory, setPlayerTalents, startRegen, stopRegen } from './playerState.js';

// playerUI.js
export { updatePlayerStatsPanel, updatePVBar as updatePVBarUI, updateManaBar as updateManaBarUI, updateXPBar as updateXPBarUI, updateAllPlayerUI } from './playerUI.js';

// player_utils.js
export { createFloatingText, applyBoost, applyShield, applyStun, applyPoison, afficherDegats, infligerDegatsAuJoueur, afficherGameOver, startRegen as startRegenUtils, stopRegen as stopRegenUtils } from './player_utils.js';

// player_talents.js
export { getAllTalentsList, getTalentsFromIds, getTalents, dashStealth } from './player_talents.js';

// progression.js
export { getXpToNextLevel, filterTalentsByLevel, onLevelUp, getMaxVie, getMaxMana, getPlayerBaseAtk, getPlayerBaseDef, getMonsterPV, getMonsterAtk, getMonsterDef, getMonsterXP } from './progression.js';

// saveManager.js
export { loadPlayerData as loadPlayerDataSave, getPlayerSaveData as getPlayerSaveDataSave } from './saveManager.js';

// utils.js
export { initConnexion, afficherMessage, initSmokeAnimation, afficherMobDegats, initParticles } from './utils.js';
