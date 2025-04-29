// monstre_state_logic.js
// Gestion interne de l'état des monstres (PV, Position, Effets)

// --- Création d'un état de monstre ---
function creer_etat_monstre({ id, nom, niveau = 1, difficulte_carte = 1 }) {
  return {
    id,
    nom,
    niveau,
    difficulte_carte,
    pv: calculer_pv_monstre(difficulte_carte),
    pv_max: calculer_pv_monstre(difficulte_carte),
    atk: calculer_atk_monstre(difficulte_carte),
    def: calculer_def_monstre(difficulte_carte),
    position: { x: 0, y: 0 },
    effets: {},
    statuts: []
  };
}

// --- Helpers de calcul ---
function calculer_pv_monstre(difficulte) {
  return Math.round(10 + (difficulte - 1) * 3.8);
}

function calculer_atk_monstre(difficulte) {
  return Math.round(14 + (difficulte - 1) * 5.2);
}

function calculer_def_monstre(difficulte) {
  return Math.round(2 + (difficulte - 1) * 1.1);
}

// --- Getters et Setters de base ---
function get_monstre_pv(monstre) { return monstre.pv; }
function definir_pv_monstre(monstre, valeur) { monstre.pv = Math.max(0, Math.min(valeur, monstre.pv_max)); }

function get_position_monstre(monstre) { return { ...monstre.position }; }
function definir_position_monstre(monstre, x, y) { monstre.position = { x, y }; }

function ajouter_statut_monstre(monstre, statut) { monstre.statuts.push(statut); }
function effacer_statuts_monstre(monstre) { monstre.statuts = []; }

// --- Gestion d'effets temporaires ---
function appliquer_effet(monstre, effet, { duree = 2000, valeur = 1, on_tick, on_end } = {}) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
  }
  monstre.effets[effet] = { actif: true };

  if (effet === 'poison' || effet === 'brulure') {
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

function effet_actif(monstre, effet) {
  return !!(monstre.effets[effet] && monstre.effets[effet].actif);
}

function retirer_effet(monstre, effet) {
  if (monstre.effets[effet]) {
    clearTimeout(monstre.effets[effet].timer);
    if (monstre.effets[effet].interval) clearInterval(monstre.effets[effet].interval);
    delete monstre.effets[effet];
  }
}

// --- Exports publics ---
export {
  creer_etat_monstre,
  calculer_pv_monstre,
  calculer_atk_monstre,
  calculer_def_monstre,
  get_monstre_pv,
  definir_pv_monstre,
  get_position_monstre,
  definir_position_monstre,
  ajouter_statut_monstre,
  effacer_statuts_monstre,
  appliquer_effet,
  effet_actif,
  retirer_effet
};
