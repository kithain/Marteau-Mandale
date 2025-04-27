// monstre_state_logic.js
// Centralise la gestion d'état et des statuts des monstres
// Refactorisé pour clarté, cohérence et maintenabilité

import { get_monster_atk } from './progression_main_logic.js';

/**
 * Crée un objet état pour un monstre
 * @param {object} params - Attributs du monstre (id, nom, niveau, pv, atk, def, etc.)
 * @returns {object} état du monstre
 */
function creer_etat_monstre({ id, nom, niveau, pv, atk, def, ...autres }) {
  return {
    id,
    nom,
    niveau: niveau || 1,
    pv: pv || 10,
    pv_max: pv || 10,
    atk: (typeof atk === 'number') ? atk : get_monster_atk(niveau || 1),
    def: def || 0,
    position: { x: 0, y: 0 }, // Position par défaut
    statuts: [], // [{type: 'poison', duree: 2000, valeur: 2}, ...]
    effets: {}, // Pour les effets temporaires (clé: nom effet, valeur: {timer, ...})
    ...autres
  };
}

// --- Getters/Setters de base ---
function set_monstre_pv(monstre, pv) { monstre.pv = pv; }
function get_monstre_pv(monstre) { return monstre.pv; }
function set_monstre_position(monstre, x, y) { monstre.position = { x, y }; }
function get_monstre_position(monstre) { return { ...monstre.position }; }
function set_monstre_statut(monstre, statut) { monstre.statuts.push(statut); }
function clear_monstre_statuts(monstre) { monstre.statuts = []; }

// --- Reset/init ---
function reset_monstre(monstre, params = {}) {
  monstre.pv = params.pv || monstre.pv_max;
  monstre.atk = params.atk || monstre.atk;
  monstre.def = params.def || monstre.def;
  monstre.position = params.position || { x: 0, y: 0 };
  monstre.statuts = [];
  monstre.effets = {};
}

// --- Sérialisation (sauvegarde/chargement) ---
function get_monstre_save_data(monstre) {
  return { ...monstre };
}
function load_monstre_data(monstre, data) {
  Object.assign(monstre, data);
}

// --- Gestion avancée des effets/statuts ---
/**
 * Applique un effet temporaire/statut au monstre (stun, poison, burning, debuff, etc.)
 * Gère la durée, la suppression automatique, et les callbacks optionnels
 */
function appliquer_effet(monstre, effet, { duree = 2000, valeur = 1, on_tick, on_end } = {}) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
  }
  monstre.effets[effet] = { actif: true };
  if (effet === 'poison' || effet === 'burning') {
    // Tick chaque seconde
    monstre.effets[effet].interval = setInterval(() => {
      if (on_tick) on_tick();
    }, 1000);
  }
  monstre.effets[effet].timer = setTimeout(() => {
    monstre.effets[effet].actif = false;
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
    if (on_end) on_end();
  }, duree);
}

function a_effet(monstre, effet) {
  return !!(monstre.effets[effet] && monstre.effets[effet].actif);
}

function retirer_effet(monstre, effet) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
    delete monstre.effets[effet];
  }
}

/**
 * Applique un debuff temporaire sur l'attaque du monstre
 */
function appliquer_debuff_atk(monstre, valeur, duree) {
  const original_atk = monstre.atk;
  monstre.atk += valeur; // valeur négative pour debuff
  appliquer_effet(monstre, 'debuff_atk', {
    duree,
    on_end: () => { monstre.atk = original_atk; }
  });
}

// --- Exports publics à la fin ---
export {
  creer_etat_monstre,
  set_monstre_pv,
  get_monstre_pv,
  set_monstre_position,
  get_monstre_position,
  set_monstre_statut,
  clear_monstre_statuts,
  reset_monstre,
  get_monstre_save_data,
  load_monstre_data,
  appliquer_effet,
  a_effet,
  retirer_effet,
  appliquer_debuff_atk
};
