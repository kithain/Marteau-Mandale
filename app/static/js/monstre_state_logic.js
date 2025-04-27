// monstre_state_logic.js
// Centralise la gestion d'état et des statuts des monstres
// Refactorisé pour clarté, cohérence et maintenabilité

import { getMonsterAtk } from './progression_main_logic.js';

/**
 * Crée un objet état pour un monstre
 * @param {object} params - Attributs du monstre (id, nom, niveau, pv, atk, def, etc.)
 * @returns {object} état du monstre
 */
function createMonstreState({ id, nom, niveau, pv, atk, def, ...autres }) {
  return {
    id,
    nom,
    niveau: niveau || 1,
    pv: pv || 10,
    pvMax: pv || 10,
    atk: (typeof atk === 'number') ? atk : getMonsterAtk(niveau || 1),
    def: def || 0,
    position: { x: 0, y: 0 }, // Position par défaut
    statuts: [], // [{type: 'poison', duree: 2000, valeur: 2}, ...]
    effets: {}, // Pour les effets temporaires (clé: nom effet, valeur: {timer, ...})
    ...autres
  };
}

// --- Getters/Setters de base ---
function setMonstrePV(monstre, pv) { monstre.pv = pv; }
function getMonstrePV(monstre) { return monstre.pv; }
function setMonstrePosition(monstre, x, y) { monstre.position = { x, y }; }
function getMonstrePosition(monstre) { return { ...monstre.position }; }
function setMonstreStatut(monstre, statut) { monstre.statuts.push(statut); }
function clearMonstreStatuts(monstre) { monstre.statuts = []; }

// --- Reset/init ---
function resetMonstre(monstre, params = {}) {
  monstre.pv = params.pv || monstre.pvMax;
  monstre.atk = params.atk || monstre.atk;
  monstre.def = params.def || monstre.def;
  monstre.position = params.position || { x: 0, y: 0 };
  monstre.statuts = [];
  monstre.effets = {};
}

// --- Sérialisation (sauvegarde/chargement) ---
function getMonstreSaveData(monstre) {
  return { ...monstre };
}
function loadMonstreData(monstre, data) {
  Object.assign(monstre, data);
}

// --- Gestion avancée des effets/statuts ---
/**
 * Applique un effet temporaire/statut au monstre (stun, poison, burning, debuff, etc.)
 * Gère la durée, la suppression automatique, et les callbacks optionnels
 */
function appliquerEffet(monstre, effet, { duree = 2000, valeur = 1, onTick, onEnd } = {}) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
  }
  monstre.effets[effet] = { actif: true };
  if (effet === 'poison' || effet === 'burning') {
    // Tick chaque seconde
    monstre.effets[effet].interval = setInterval(() => {
      if (onTick) onTick();
    }, 1000);
  }
  monstre.effets[effet].timer = setTimeout(() => {
    monstre.effets[effet].actif = false;
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
    if (onEnd) onEnd();
  }, duree);
}

function aEffet(monstre, effet) {
  return !!(monstre.effets[effet] && monstre.effets[effet].actif);
}

function retirerEffet(monstre, effet) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
    delete monstre.effets[effet];
  }
}

/**
 * Applique un debuff temporaire sur l'attaque du monstre
 */
function appliquerDebuffAtk(monstre, valeur, duree) {
  const originalAtk = monstre.atk;
  monstre.atk += valeur; // valeur négative pour debuff
  appliquerEffet(monstre, 'debuff_atk', {
    duree,
    onEnd: () => { monstre.atk = originalAtk; }
  });
}

// --- Exports publics à la fin ---
export {
  createMonstreState,
  setMonstrePV,
  getMonstrePV,
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
};
