// progression_main_logic.js
// Centralise et harmonise toute la logique de progression du joueur et des monstres
// Ce module fournit les calculs d'XP, de stats, et la gestion de la montée de niveau.

// --- XP et progression de niveau ---
// Calcule l'XP nécessaire pour passer au niveau suivant
/**
 * Calcule l'XP nécessaire pour passer au niveau suivant
 * @param {number} level
 * @returns {number}
 */
function getXpToNextLevel(level) {
    // Progression exponentielle simple, à ajuster selon l'équilibrage
    return Math.floor(10 * Math.pow(1.5, level - 1));
}

function get_xp_to_next_level(level) {
    return getXpToNextLevel(level);
}

// --- Talents et montée de niveau ---
// Filtre les talents accessibles selon le niveau du joueur
/**
 * Filtre les talents accessibles selon le niveau du joueur
 * @param {Array} allTalents
 * @param {number} playerLevel
 * @returns {Array}
 */
function filterTalentsByLevel(allTalents, playerLevel) {
    return allTalents.filter(talent => (talent.niveauRequis || 1) <= playerLevel);
}

// Fonction à appeler quand le joueur monte de niveau
/**
 * Fonction à appeler quand le joueur monte de niveau
 * @param {number} playerLevel
 * @param {Array} allTalents
 * @param {function} callbackNewTalent
 */
function onLevelUp(playerLevel, allTalents, callbackNewTalent) {
    // Récupère les talents débloqués à ce niveau
    const newTalents = allTalents.filter(t => t.niveauRequis === playerLevel);
    // Appelle un callback pour chaque talent débloqué (affichage, notification, etc.)
    newTalents.forEach(callbackNewTalent);
}

// --- Progression des stats joueur ---
// Vie max : 120 de base, +40 par niveau
/**
 * Vie max : 120 de base, +40 par niveau
 */
function getMaxVie(level) {
    return Math.round(120 + (level - 1) * 40);
}
// Mana max : 15 de base, +5 par niveau
/**
 * Mana max : 15 de base, +5 par niveau
 */
function getMaxMana(level) {
    return Math.round(15 + (level - 1) * 5);
}
// Dégâts de base du joueur (attaque niveau 1), progression boostée
const BASE_PLAYER_ATK = 3;
/**
 * Dégâts de base du joueur
 */
function getPlayerBaseAtk(level) {
    return Math.round(BASE_PLAYER_ATK + (level - 1) * 1.6);
}
// Défense de base du joueur : 2, progression boostée
const BASE_PLAYER_DEF = 2;
/**
 * Défense de base du joueur
 */
function getPlayerBaseDef(level) {
    return Math.round(BASE_PLAYER_DEF + (level - 1) * 1.22);
}

// --- Progression des stats des monstres ---
// PV du monstre selon niveau
/**
 * PV du monstre selon niveau
 */
function getMonsterPV(level) {
    return Math.round(10 + (level - 1) * 3.8);
}
/**
 * ATK du monstre selon niveau
 */
function getMonsterAtk(level) {
    return Math.round(14 + (level - 1) * 5.2);
}
/**
 * DEF du monstre selon niveau
 */
function getMonsterDef(level) {
    return Math.round(2 + (level - 1) * 1.1);
}
/**
 * XP donnée par un monstre selon niveau
 */
function getMonsterXP(level) {
    return Math.round(10 + (level - 1) * 4.7);
}
/**
 * Calcule l'XP à attribuer pour un monstre donné (utilise niveau ou difficulte)
 */
function calculerXPMonstre(monstre) {
    const lvl = monstre.niveau || monstre.difficulte || 1;
    return getMonsterXP(lvl);
}

// --- Exports publics à la fin ---
export {
  getXpToNextLevel,
  get_xp_to_next_level,
  filterTalentsByLevel,
  onLevelUp,
  getMaxVie,
  getMaxMana,
  getPlayerBaseAtk,
  getPlayerBaseDef,
  getMonsterPV,
  getMonsterAtk,
  getMonsterDef,
  getMonsterXP,
  calculerXPMonstre
};
