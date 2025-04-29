// player_progression.js
// Gère toute la logique de progression du joueur et des monstres

// --- Imports ---
import { get_difficulty_carte } from '/js/map_main_logic.js';

// --- XP et progression de niveau ---
function get_xp_to_next_level(niveau) {
    return Math.floor(10 * Math.pow(1.5, niveau - 1));
}

function filtrer_talents_par_niveau(tous_les_talents, niveau_joueur) {
    return tous_les_talents.filter(talent => (talent.niveau_requis || 1) <= niveau_joueur);
}

function niveau_suivant(niveau_joueur, tous_les_talents, callback_nouveau_talent) {
    const nouveaux_talents = tous_les_talents.filter(t => t.niveau_requis === niveau_joueur);
    nouveaux_talents.forEach(callback_nouveau_talent);
}

// --- Progression des stats joueur ---
function get_vie_max(niveau) {
    return Math.round(120 + (niveau - 1) * 40);
}

function get_mana_max(niveau) {
    return Math.round(15 + (niveau - 1) * 5);
}

const degats_base_joueur = 3;
function get_degats_base_joueur(niveau) {
    return Math.round(degats_base_joueur + (niveau - 1) * 1.6);
}

const defense_base_joueur = 2;
function get_defense_base_joueur(niveau) {
    return Math.round(defense_base_joueur + (niveau - 1) * 1.22);
}

// --- Progression des stats des monstres ---
function get_pv_monstre(difficulte_carte) {
    return Math.round(10 + (difficulte_carte - 1) * 3.8);
}

function get_atk_monstre(difficulte_carte) {
    return Math.round(14 + (difficulte_carte - 1) * 5.2);
}

function get_def_monstre(difficulte_carte) {
    return Math.round(2 + (difficulte_carte - 1) * 1.1);
}

function get_xp_monstre(difficulte_carte) {
    return Math.round(10 + (difficulte_carte - 1) * 4.7);
}

function calculer_xp_monstre(nom_carte) {
    const difficulte = get_difficulty_carte(nom_carte) || 1;
    return get_xp_monstre(difficulte);
}

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
