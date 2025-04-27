// combat_manager_logic.js
// Centralise toute la logique de combat et de rencontres du jeu
// Refactorise pour clarte, maintenabilite et coherence

import { 
  creer_monstre,
  deplacer_monstre,
  get_monstre_par_id,
  appliquer_degats_au_monstre,
  demarrer_deplacement_monstres,
  arreter_deplacement_monstres,
  get_monstres_adjacents_et_case,
  get_monstres_actifs,
  appliquer_soin_au_monstre,
  appliquer_buff_au_monstre,
  appliquer_debuff_au_monstre,
  appliquer_miss_au_monstre,
  appliquer_poison,
  appliquer_stun,
  appliquer_debuff_atk_monstre,
  est_empoisonne,
  retirer_poison,
  supprimer_monstre
} from './monstre_main_logic.js';

import { 
  get_position_joueur,
  get_player_pv, 
  get_player_def, 
  get_player_class,
  get_player_effective_stats 
} from './player_state_logic.js';

import { infliger_degats_au_joueur } from './player_visual_utils.js';

import { 
  DEPLACEMENT_SANS_RENCONTRE_INIT 
} from './map_constants_logic.js';

// --- Variables globales ---
let deplacement_sans_rencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
let combat_actif = false;
let current_monstre = null;
let monstre_interval = null;

// Initialisation des variables globales window
window.combat_actif = false;
window.current_monstre = null;

// --- Fonctions de gestion du deplacement sans rencontre ---
function set_deplacement_sans_rencontre(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    deplacement_sans_rencontre = val;
    window.dep_sans_rencontre = val;
  }
}

function get_deplacement_sans_rencontre() {
  return deplacement_sans_rencontre;
}

function reset_deplacement_sans_rencontre() {
  deplacement_sans_rencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
  window.dep_sans_rencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
}

// --- Combat principal ---
function creer_monstre_et_demarrer_combat(monstre, pv, x, y) {
  // Creation et affichage du monstre sur la carte
  const monstre_obj = creer_monstre({
    ...monstre,
    pv,
    pos_x: x,
    pos_y: y
  });
  
  // Demarrer le combat immediatement si le monstre est proche
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  const dx = Math.abs(player_x - x);
  const dy = Math.abs(player_y - y);
  
  if (dx <= 1 && dy <= 1) {
    demarrer_combat(monstre_obj);
  }
  
  return monstre_obj;
}

function demarrer_combat(monstre) {
  if (window.combat_actif || window.is_game_over) return;
  window.combat_actif = true;
  window.current_monstre = monstre;
  
  // Arreter le deplacement des monstres
  arreter_deplacement_monstres();
  
  // Demarrer l'attaque automatique du monstre
  window.monstre_attack_interval = setInterval(() => {
    if (!window.combat_actif || window.is_game_over) {
      clearInterval(window.monstre_attack_interval);
      return;
    }
    attaquer_joueur(monstre);
  }, 2000);
  
  document.dispatchEvent(new CustomEvent('combatStarted'));
}

function finir_combat() {
  window.current_monstre = null;
  window.combat_actif = false;
  
  if (window.monstre_attack_interval) {
    clearInterval(window.monstre_attack_interval);
    window.monstre_attack_interval = null;
  }
  
  document.dispatchEvent(new CustomEvent('combatEnded'));
}

// --- Attaques ---
function attaquer_joueur(monstre) {
  if (!window.current_monstre || window.is_game_over) return;
  
  // Verifier si le joueur est adjacent au monstre
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  const monster_pos = get_monstre_position(monstre.state);
  const dx = Math.abs(player_x - monster_pos.x);
  const dy = Math.abs(player_y - monster_pos.y);
  
  // Si le monstre n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Utilise la bonne cle d'attaque (atk ou attaque)
  const atk = (monstre.state && (typeof monstre.state.atk === 'number' ? monstre.state.atk : monstre.state.attaque)) || 10;
  const def = get_player_def();
  const degats = Math.max(1, atk - def);
  infliger_degats_au_joueur(degats);
  
  if (get_player_pv() <= 0) {
    finir_combat();
  }
}

function attaquer_monstre(valeur) {
  if (!window.current_monstre || window.is_game_over) return;
  
  // Verifier si le joueur est adjacent au monstre
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  const monster_pos = get_monstre_position(window.current_monstre.state);
  const dx = Math.abs(player_x - monster_pos.x);
  const dy = Math.abs(player_y - monster_pos.y);
  
  // Si le joueur n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Si current_monstre est bien {state, element}
  appliquer_degats_au_monstre(window.current_monstre, valeur);
  if (get_monstre_pv(window.current_monstre.state) <= 0) {
    finir_combat();
  }
}

// --- Acces a l'etat du combat ---
function get_combat_actif() {
  return window.combat_actif;
}

function get_current_monstre() {
  return window.current_monstre;
}

// --- Gestion des rencontres aleatoires ---
function verifier_rencontre() {
  if (get_combat_actif()) return;
  if (deplacement_sans_rencontre > 0) {
    deplacement_sans_rencontre--;
    window.dep_sans_rencontre = deplacement_sans_rencontre;
    return;
  }

  fetch(`/api/rencontre?x=${get_position_joueur().x}&y=${get_position_joueur().y}&carte=${modules.current_map}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur de reseau');
      return res.json();
    })
    .then(data => {
      console.log('[DEBUG] Reponse de /api/rencontre:', data);
      if (data.monstre) {
        const monstre = data.monstre;
        const pv = monstre.pv;
        // Ajoute base_id pour lier a la fiche de base
        let base_id = monstre.id;
        if (base_id && base_id.includes('_lvl')) {
          base_id = base_id.split('_lvl')[0];
        }
        monstre.base_id = base_id;
        // Cherche une case libre a distance 2 max pour le monstre
        const px = get_position_joueur().x;
        const py = get_position_joueur().y;
        let found = null;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            if (dx === 0 && dy === 0) continue; // ne pas pop sur la case du joueur
            const nx = px + dx;
            const ny = py + dy;
            if (!window.is_blocked || !window.is_blocked(nx, ny)) {
              found = {x: nx, y: ny};
              break;
            }
          }
          if (found) break;
        }
        // Si pas de case libre, spawn sur le joueur (fallback)
        const spawn_x = found ? found.x : px;
        const spawn_y = found ? found.y : py;
        const monstre_obj = creer_monstre_et_demarrer_combat(monstre, pv, spawn_x, spawn_y);
        deplacement_sans_rencontre = 5;
        window.dep_sans_rencontre = deplacement_sans_rencontre;
      } else {
        console.warn('[DEBUG] Aucun monstre genere:', data);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la verification des rencontres:', error);
    });
}

export function generer_rencontre() {
  // Implémentation de la logique de génération de rencontre
  return verifier_rencontre();
}

// --- Detection de sortie de zone ---
function detecter_sortie(exit_zones) {
  const sortie = exit_zones.find(zone =>
    get_position_joueur().x >= zone.x &&
    get_position_joueur().x < zone.x + zone.width &&
    get_position_joueur().y >= zone.y &&
    get_position_joueur().y < zone.y + zone.height
  );
  return sortie;
}

// --- Detection de monstre adjacent et demarrage du combat ---
function verifier_combat_adj_monstre() {
  // Ne detecte pas le combat si furtif
  if (window.furtif) return false;
  const px = get_position_joueur().x;
  const py = get_position_joueur().y;
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  const monstres_actifs = get_monstres_actifs();
  
  console.log('[DEBUG] Verification combat adjacent', {
    player_x: px, 
    player_y: py, 
    monstres_actifs: monstres_actifs.length,
    monstres_en_combat: monstres_actifs.filter(m => m === window.current_monstre).length
  });
  
  for (const monstre of monstres_actifs) {
    // Verification des donnees de position
    if (!monstre.element || !monstre.element.style.left || !monstre.element.style.top) {
      console.warn('[COMBAT] Element monstre sans position', monstre);
      continue;
    }
    
    const monster_pos = get_monstre_position(monstre.state);
    const monster_x = monster_pos.x;
    const monster_y = monster_pos.y;
    
    console.log('[DEBUG] Position monstre', { 
      id: monstre.state.id,
      monster_x, 
      monster_y, 
      player_x: px, 
      player_y: py,
      en_combat: (window.current_monstre && window.current_monstre.state.id === monstre.state.id) ? 1 : 0
    });
    
    // Verifie si le monstre est adjacent (dans une case adjacente)
    const is_adjacent = directions.some(([dx, dy]) => 
      monster_x === px + dx && monster_y === py + dy
    );
    
    if (is_adjacent) {
      // Si le monstre est deja en combat, ne pas demarrer un nouveau combat
      if (window.current_monstre && window.current_monstre.state.id === monstre.state.id) {
        continue;
      }
      
      // Demarrer le combat avec ce monstre
      demarrer_combat(monstre);
      return true;
    }
  }
  
  return false;
}

// --- Exports publics harmonises ---
export {
  reset_deplacement_sans_rencontre,
  set_deplacement_sans_rencontre,
  get_deplacement_sans_rencontre,
  creer_monstre_et_demarrer_combat,
  demarrer_combat,
  finir_combat,
  attaquer_joueur,
  attaquer_monstre,
  get_combat_actif,
  get_current_monstre,
  verifier_rencontre,
  generer_rencontre,
  detecter_sortie,
  verifier_combat_adj_monstre,
  get_monstre_pv,
  get_monstres_adjacents_et_case,
  get_monstres_actifs,
  appliquer_degats_au_monstre,
  appliquer_soin_au_monstre,
  appliquer_buff_au_monstre,
  appliquer_debuff_au_monstre,
  appliquer_miss_au_monstre,
  appliquer_poison,
  appliquer_stun,
  appliquer_debuff_atk_monstre,
  est_empoisonne,
  retirer_poison,
  stopper_tous_monstres,
  supprimer_monstre
};