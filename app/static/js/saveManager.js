// saveManager.js
// Centralise la gestion de la sauvegarde et du chargement du joueur

import * as modules from './modules.js';

/**
 * Récupère les données de sauvegarde du joueur (état complet)
 */
export function getPlayerSaveData() {
  // Ajoute la carte courante dans la sauvegarde
  const data = modules.getCentralPlayerSaveData();
  return {
    ...data,
    carte: data.carte // pour compatibilité JSON
  };
}

/**
 * Applique les données de sauvegarde au state du joueur
 * @param {object} saveData - Les données JSON à restaurer
 */
export function loadPlayerData(saveData) {
  const level = (saveData && typeof saveData.niveau === 'number') ? saveData.niveau : (saveData && typeof saveData.level === 'number') ? saveData.level : 1;
  const xp = (saveData && typeof saveData.experience === 'number') ? saveData.experience : (saveData && typeof saveData.xp === 'number') ? saveData.xp : 0;
  // Initialise le state de base
  modules.initPlayerState({
    level,
    xp
  });
  modules.setPlayerXP(xp);
  // Carte courante
  if (saveData && (saveData.carte || saveData.map)) {
    modules.setPlayerMap(saveData.carte || saveData.map);
  }
  // Position : toujours restaurer si présente
  if (saveData.position && typeof saveData.position.x === 'number' && typeof saveData.position.y === 'number') {
    modules.setPlayerPositionPlayer(saveData.position.x, saveData.position.y);
  }
  // Restaure PV/mana ou valeurs max si null/absent
  if (typeof saveData.vie === 'number' && saveData.vie !== null) {
    modules.setPlayerPV(saveData.vie);
  } else if (typeof saveData.pv === 'number' && saveData.pv !== null) {
    modules.setPlayerPV(saveData.pv);
  } else {
    modules.setPlayerPV(modules.getMaxPlayerPV());
  }
  if (typeof saveData.mana === 'number' && saveData.mana !== null) {
    modules.setPlayerMana(saveData.mana);
  } else {
    modules.setPlayerMana(modules.getMaxPlayerMana());
  }
  // Correction : utilise modules.startRegenUtils (alias de player_utils.js) pour la régénération
  modules.startRegenUtils();
}
