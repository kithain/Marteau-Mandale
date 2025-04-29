// input_handler_logic.js
// Gestion des entrées clavier du joueur (déplacement, talents, détection combat)

// --- Imports ---
import { get_position_joueur, set_position_joueur } from './player_state_logic.js';
import { obtenir_monstres_actifs } from './monstre_main_logic.js';
import { demarrer_combat } from './combat_manager_logic.js';
import { utiliserTalent, get_talents } from './player_talents_logic.js';

// --- Constantes ---
const TOUCHES_DEPLACEMENT = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const TOUCHES_TALENTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const TAILLE_CARTE = 16;

// --- Détection d'un monstre sur ou adjacent ---
function detecter_monstre_proche(x, y) {
  const monstres = obtenir_monstres_actifs();
  let monstre_sur_case = null;
  let monstre_adjacent = null;

  for (const monstre of monstres) {
    const pos = monstre.state.position;
    if (pos.x === x && pos.y === y) {
      monstre_sur_case = monstre;
    }
    if (Math.abs(pos.x - x) <= 1 && Math.abs(pos.y - y) <= 1) {
      monstre_adjacent = monstre;
    }
  }
  return { monstre_sur_case, monstre_adjacent };
}

// --- Gestion des déplacements --- 
function gerer_deplacement(touche) {
  const joueur = get_position_joueur();
  let cible_x = joueur.x;
  let cible_y = joueur.y;

  if (touche === 'ArrowUp') cible_y--;
  if (touche === 'ArrowDown') cible_y++;
  if (touche === 'ArrowLeft') cible_x--;
  if (touche === 'ArrowRight') cible_x++;

  if (cible_x < 0 || cible_x >= TAILLE_CARTE || cible_y < 0 || cible_y >= TAILLE_CARTE) {
    console.log("[Déplacement] Hors des limites de la carte.");
    return;
  }

  const { monstre_sur_case, monstre_adjacent } = detecter_monstre_proche(cible_x, cible_y);

  if (monstre_sur_case && !window.furtif) {
    console.log("[Déplacement] Case bloquée par un monstre.");
    return;
  }

  if (monstre_adjacent && !window.combat_actif) {
    console.log("[Combat] Monstre proche détecté, démarrage du combat.");
    demarrer_combat(monstre_adjacent);
    return;
  }

  set_position_joueur(cible_x, cible_y);
}

// --- Gestion des talents --- 
function gerer_talent(touche) {
  const index = TOUCHES_TALENTS.indexOf(touche);
  if (index === -1) return;

  if (window.combat_actif) {
    const talents = get_talents();
    if (talents[index]) {
      utiliserTalent(talents[index]);
    }
  }
}

// --- Gestionnaire principal ---
function gerer_touche(evenement) {
  const touche = evenement.key;

  if (TOUCHES_DEPLACEMENT.includes(touche)) {
    evenement.preventDefault();
    gerer_deplacement(touche);
    return;
  }

  if (TOUCHES_TALENTS.includes(touche)) {
    evenement.preventDefault();
    gerer_talent(touche);
    return;
  }
}

// --- Initialisation ---
function initialiser_gestionnaire_entrees() {
  document.addEventListener('keydown', gerer_touche);
}

// --- Exports publics ---
export {
  initialiser_gestionnaire_entrees
};
