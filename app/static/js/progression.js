// progression.js
// Centralise toute la logique de progression du joueur et des monstres

// Fonction pour calculer l'XP nécessaire pour passer au niveau suivant
export function getXpToNextLevel(level) {
    // Progression exponentielle simple, à ajuster selon l'équilibrage
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Filtrer les talents accessibles selon le niveau du joueur
export function filterTalentsByLevel(allTalents, playerLevel) {
    return allTalents.filter(talent => (talent.niveauRequis || 1) <= playerLevel);
}

// Fonction à appeler quand le joueur monte de niveau
export function onLevelUp(playerLevel, allTalents, callbackNewTalent) {
    // Récupère les talents débloqués à ce niveau
    const newTalents = allTalents.filter(t => t.niveauRequis === playerLevel);
    // Appelle un callback pour chaque talent débloqué (affichage, notification, etc.)
    newTalents.forEach(callbackNewTalent);
}

// --- Progression des stats joueur ---
// Vie : 120 de base, +40 par niveau
export function getMaxVie(level) {
    return Math.round(120 + (level - 1) * 40);
}
// Mana : 15 de base, +5 par niveau
export function getMaxMana(level) {
    return Math.round(15 + (level - 1) * 5);
}
// Dégâts de base du joueur (attaque niveau 1), progression boostée
const BASE_PLAYER_ATK = 3;
export function getPlayerBaseAtk(level) {
    return Math.round(BASE_PLAYER_ATK + (level - 1) * 1.6);
}
// Défense de base du joueur : 2, progression boostée
const BASE_PLAYER_DEF = 2;
export function getPlayerBaseDef(level) {
    return Math.round(BASE_PLAYER_DEF + (level - 1) * 1.22);
}

// --- Progression des stats des monstres ---
export function getMonsterPV(level) {
    return Math.round(10 + (level - 1) * 3.8);
}
export function getMonsterAtk(level) {
    return Math.round(14 + (level - 1) * 5.2);
}
export function getMonsterDef(level) {
    return Math.round(1 + (level - 1) * 0.8);
}
export function getMonsterXP(level) {
    return Math.round(10 + (level - 1) * 4.7);
}

// Exemple d'utilisation :
// import { filterTalentsByLevel, onLevelUp, getMaxVie, getMaxMana, getPlayerBaseAtk, getMonsterPV, getMonsterAtk, getMonsterDef } from './progression.js';
// const talentsDisponibles = filterTalentsByLevel(tousLesTalents, playerLevel);
// onLevelUp(playerLevel, tousLesTalents, (talent) => { ...afficher notification... });
// const vieMax = getMaxVie(playerLevel);
// const manaMax = getMaxMana(playerLevel);
// const atkBase = getPlayerBaseAtk(playerLevel);
// const pvMonstre = getMonsterPV(monstreLevel);
// const atkMonstre = getMonsterAtk(monstreLevel);
// const defMonstre = getMonsterDef(monstreLevel);
