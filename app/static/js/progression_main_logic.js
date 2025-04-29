// progression_main_logic.js
// Centralise et harmonise toute la logique de progression du joueur et des monstres
// Ce module fournit les calculs d'XP, de stats, et la gestion de la montee de niveau.

// --- Imports ---
import { get_difficulty_carte } from '/js/map_main_logic.js';

// --- XP et progression de niveau ---
// Calcule l'XP necessaire pour passer au niveau suivant
/**
 * Calcule l'XP necessaire pour passer au niveau suivant
 * @param {number} niveau
 * @returns {number}
 */
function get_xp_to_next_level(niveau) {
    // Progression exponentielle simple, a ajuster selon l'equilibrage
    return Math.floor(10 * Math.pow(1.5, niveau - 1));
}

// --- Talents et montee de niveau ---
// Filtre les talents accessibles selon le niveau du joueur
/**
 * Filtre les talents accessibles selon le niveau du joueur
 * @param {Array} tous_les_talents
 * @param {number} niveau_joueur
 * @returns {Array}
 */
function filtrer_talents_par_niveau(tous_les_talents, niveau_joueur) {
    return tous_les_talents.filter(talent => (talent.niveau_requis || 1) <= niveau_joueur);
}

// Fonction a appeler quand le joueur monte de niveau
/**
 * Fonction a appeler quand le joueur monte de niveau
 * @param {number} niveau_joueur
 * @param {Array} tous_les_talents
 * @param {function} callback_nouveau_talent
 */
function niveau_suivant(niveau_joueur, tous_les_talents, callback_nouveau_talent) {
    // Recupere les talents debloques a ce niveau
    const nouveaux_talents = tous_les_talents.filter(t => t.niveau_requis === niveau_joueur);
    // Appelle un callback pour chaque talent debloque (affichage, notification, etc.)
    nouveaux_talents.forEach(callback_nouveau_talent);
}

// --- Progression des stats joueur ---
// Vie max : 120 de base, +40 par niveau
/**
 * Vie max : 120 de base, +40 par niveau
 */
function get_vie_max(niveau) {
    return Math.round(120 + (niveau - 1) * 40);
}
// Mana max : 15 de base, +5 par niveau
/**
 * Mana max : 15 de base, +5 par niveau
 */
function get_mana_max(niveau) {
    return Math.round(15 + (niveau - 1) * 5);
}
// Degats de base du joueur (attaque niveau 1), progression boostee
const degats_base_joueur = 3;
/**
 * Degats de base du joueur
 */
function get_degats_base_joueur(niveau) {
    return Math.round(degats_base_joueur + (niveau - 1) * 1.6);
}
// Defense de base du joueur : 2, progression boostee
const defense_base_joueur = 2;
/**
 * Defense de base du joueur
 */
function get_defense_base_joueur(niveau) {
    return Math.round(defense_base_joueur + (niveau - 1) * 1.22);
}

// --- Progression des stats des monstres ---
// PV du monstre selon difficulté de la carte
/**
 * PV du monstre selon difficulté de la carte
 */
function get_pv_monstre(difficulte_carte) {
    return Math.round(10 + (difficulte_carte - 1) * 3.8);
}
/**
 * ATK du monstre selon difficulté de la carte
 */
function get_atk_monstre(difficulte_carte) {
    return Math.round(14 + (difficulte_carte - 1) * 5.2);
}
/**
 * DEF du monstre selon difficulté de la carte
 */
function get_def_monstre(difficulte_carte) {
    return Math.round(2 + (difficulte_carte - 1) * 1.1);
}
/**
 * XP donnée par un monstre selon difficulté de la carte
 */
function get_xp_monstre(difficulte_carte) {
    return Math.round(10 + (difficulte_carte - 1) * 4.7);
}
/**
 * Calcule l'XP à attribuer pour un monstre sur une carte donnée
 */
function calculer_xp_monstre(nom_carte) {
    const difficulte = get_difficulty_carte(nom_carte) || 1;
    return get_xp_monstre(difficulte);
}

// --- Exports publics ---
export {
  get_xp_to_next_level,
  filtrer_talents_par_niveau,
  niveau_suivant,
  get_vie_max,
  get_mana_max,
  get_degats_base_joueur,
  get_defense_base_joueur,
  get_pv_monstre,
  get_atk_monstre,
  get_def_monstre,
  get_xp_monstre,
  calculer_xp_monstre
};
