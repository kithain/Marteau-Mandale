// monstre_main_logic.js
// Gestion globale des monstres (création, boucle, interactions)
// Refactorisé pour utiliser monstreState.js et monstre_utils.js

import {
  set_monstre_pv,
  get_monstre_pv,
  set_monstre_position,
  get_monstre_position,
  set_monstre_statut,
  appliquer_effet,
  appliquer_debuff_atk,
  a_effet,
  retirer_effet
} from './monstre_state_logic.js';
import {
  afficher_degats_monstre,
  afficher_soin_monstre,
  afficher_buff_monstre,
  afficher_debuff_monstre,
  afficher_miss_monstre
} from './monstre_visual_utils.js';
import { register_game_interval, clear_game_interval } from './player_visual_utils.js';
import {
  get_position_joueur,
  get_player_def,
  infliger_degats_au_joueur,
  get_player_pv,
  is_blocked
} from './player_state_logic.js';
import { 
  demarrer_combat,
  finir_combat
} from './combat_manager_logic.js';

// --- Constantes ---
const tile_size = 64;

// --- Etat global (liste des monstres actifs) ---
let monstres_actifs = [];

// --- Création d'un monstre ---
function create_monstre_state(monstre_data) {
  return {
    pv: monstre_data.pv,
    position: { x: monstre_data.pos_x, y: monstre_data.pos_y },
    statut: 'normal',
    effets: []
  };
}

function creer_monstre({ id, nom, niveau, pv, atk, def, image, base_id, pos_x = 0, pos_y = 0 }) {
  // Fallback image : tente de retrouver dans la fiche de base
  if (!image) {
    let fiche_base = null;
    
    // 1. Essaie par base_id
    if (base_id && window.LISTE_MONSTRES_BASE) {
      fiche_base = window.LISTE_MONSTRES_BASE.find(m => m.id === base_id);
    }
    
    // 2. Si pas trouvé, essaie par nom (insensible à la casse)
    if (!fiche_base && nom && window.LISTE_MONSTRES_BASE) {
      fiche_base = window.LISTE_MONSTRES_BASE.find(m => 
        m.nom.toLowerCase() === nom.toLowerCase()
      );
    }
    
    // Récupère l'image si une fiche est trouvée
    if (fiche_base && fiche_base.image) {
      image = fiche_base.image;
    }
  }
  
  if (!image) {
    throw new Error(`[MONSTRE] Aucune image trouvée pour le monstre id=${id}, nom=${nom}, base_id=${base_id}`);
  }
  
  const monstre_state = create_monstre_state({ id, nom, niveau, pv, atk, def, pos_x, pos_y });
  const monstre_div = creer_element_monstre(image, id, pos_x, pos_y);
  set_monstre_position(monstre_state, pos_x, pos_y);
  
  const monstre_actif = { state: monstre_state, element: monstre_div };
  monstres_actifs.push(monstre_actif);

  // Vérifier si le monstre est à plus de 1 case du joueur
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  const dx = Math.abs(player_x - pos_x);
  const dy = Math.abs(player_y - pos_y);
  
  if (dx > 1 || dy > 1) {
    // Démarrer le déplacement des monstres si ce n'est pas déjà fait
    demarrer_deplacement_monstres();
  } else {
    // Si le monstre est proche, démarrer le combat directement
    // demarrer_combat(monstre_actif);
  }
  
  return monstre_actif;
}

// --- Création et gestion visuelle (DOM) ---
function creer_element_monstre(image, unique_id, pos_x = 0, pos_y = 0) {
  const monstre_div = document.createElement('div');
  monstre_div.id = `combat-monstre-${unique_id}`;
  monstre_div.className = 'monstre';
  monstre_div.style.width = '64px';
  monstre_div.style.height = '64px';
  monstre_div.style.left = `${pos_x * tile_size}px`;
  monstre_div.style.top = `${pos_y * tile_size}px`;
  
  // Correction du chemin de l'image
  const image_path = image.startsWith('/') ? image : `/static/img/monstres/${image}`;
  monstre_div.style.backgroundImage = `url(${image_path})`;
  
  // Barre de vie
  const health_bar = document.createElement('div');
  health_bar.className = 'monster-health-bar';
  const health_fill = document.createElement('div');
  health_fill.className = 'monster-health-fill';
  health_bar.appendChild(health_fill);
  monstre_div.appendChild(health_bar);
  
  // Conteneur d'états
  const status_container = document.createElement('div');
  status_container.className = 'monster-status';
  monstre_div.appendChild(status_container);
  
  document.getElementById('map-inner').appendChild(monstre_div);
  return monstre_div;
}

// --- Déplacement des monstres ---
function deplacer_monstre(monstre) {
  if (!monstre || !monstre.state || !monstre.element) return;
  
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  const monster_pos = get_monstre_position(monstre.state);
  
  // Calculer la direction vers le joueur
  const dx = player_x - monster_pos.x;
  const dy = player_y - monster_pos.y;
  
  // Déplacement en diagonale autorisé
  let new_x = monster_pos.x;
  let new_y = monster_pos.y;
  
  // Déplacement horizontal
  if (dx > 0) new_x++;
  else if (dx < 0) new_x--;
  
  // Déplacement vertical
  if (dy > 0) new_y++;
  else if (dy < 0) new_y--;
  
  // Vérifier si la nouvelle position est libre
  if (!is_blocked || !is_blocked(new_x, new_y)) {
    console.log('[MONSTRE] Déplacement', {
      from: monster_pos,
      to: { x: new_x, y: new_y }
    });
    
    // Mettre à jour la position dans le state et l'élément
    set_monstre_position(monstre.state, new_x, new_y);
    monstre.element.style.left = `${new_x * tile_size}px`;
    monstre.element.style.top = `${new_y * tile_size}px`;
  }
}

// Ajouter un gestionnaire pour déplacer tous les monstres
function deplacer_tous_monstres() {
  if (window.is_game_over) return;
  
  // S'il n'y a pas de monstres actifs, arrêter le déplacement
  if (monstres_actifs.length === 0) {
    arreter_deplacement_monstres();
    return;
  }
  
  // Si on est en combat, vérifier que le monstre est toujours adjacent
  if (window.current_monstre) {
    const player_x = get_position_joueur().x;
    const player_y = get_position_joueur().y;
    const monster_pos = get_monstre_position(window.current_monstre.state);
    const dx = Math.abs(player_x - monster_pos.x);
    const dy = Math.abs(player_y - monster_pos.y);
    
    // Si le monstre n'est plus adjacent, arrêter le combat
    if (dx > 1 || dy > 1) {
      // finir_combat();
    }
    return; // Ne pas déplacer les autres monstres pendant un combat
  }
  
  monstres_actifs.forEach(monstre => {
    // Vérifier si le monstre est adjacent au joueur
    const player_x = get_position_joueur().x;
    const player_y = get_position_joueur().y;
    const monster_pos = get_monstre_position(monstre.state);
    const dx = Math.abs(player_x - monster_pos.x);
    const dy = Math.abs(player_y - monster_pos.y);
    
    console.log('[DEBUG] État monstre', { 
      id: monstre.state.id,
      en_combat: window.current_monstre ? 1 : 0,
      stun: monstre.state.stun ? 1 : 0,
      distance_x: dx,
      distance_y: dy
    });
    
    // Si le monstre est adjacent au joueur, démarrer le combat
    if (dx <= 1 && dy <= 1) {
      // Démarrer le combat si le monstre est adjacent
      window.current_monstre = monstre;
      window.combat_actif = true;
      // demarrer_combat(monstre);
      return;
    }
    
    // Si pas en combat et pas étourdi, déplacer le monstre
    if (!monstre.state.stun) {
      console.log('[MONSTRE] Tentative de déplacement', { 
        id: monstre.state.id,
        position: monster_pos,
        distance_x: dx,
        distance_y: dy
      });
      deplacer_monstre(monstre);
    }
  });
}

// Initialiser un intervalle pour déplacer les monstres
let interval_deplacement_monstres = null;

function demarrer_deplacement_monstres() {
  if (!interval_deplacement_monstres) {
    interval_deplacement_monstres = setInterval(deplacer_tous_monstres, 1000);
    register_game_interval(interval_deplacement_monstres);
  }
}

function arreter_deplacement_monstres() {
  if (interval_deplacement_monstres) {
    clear_game_interval(interval_deplacement_monstres);
    interval_deplacement_monstres = null;
  }
}

// Initialiser le déplacement au démarrage
window.combat_actif = false; // Réinitialisation au démarrage
demarrer_deplacement_monstres();

// Ajouter un écouteur pour arrêter le déplacement si un combat commence
document.addEventListener('combatStarted', () => {
  // Ne pas arrêter le déplacement des autres monstres
  // arreter_deplacement_monstres();
});

document.addEventListener('combatEnded', () => {
  // S'assurer que l'intervalle est actif
  demarrer_deplacement_monstres();
});

// --- Helpers d'accès ---
function get_monstre_par_id(id) {
  return monstres_actifs.find(m => m.state.id === id);
}

function get_monstres_adjacents_et_case() {
  const player_x = get_position_joueur().x;
  const player_y = get_position_joueur().y;
  return monstres_actifs.filter(monstre => {
    const { x, y } = get_monstre_position(monstre.state);
    const dx = Math.abs(player_x - x);
    const dy = Math.abs(player_y - y);
    return (dx <= 1 && dy <= 1);
  });
}

function get_monstres_actifs() {
  return monstres_actifs;
}

// --- Application de dégâts et effets visuels ---
function appliquer_degats_au_monstre(monstre, valeur) {
  const pv_avant = get_monstre_pv(monstre.state);
  set_monstre_pv(monstre.state, pv_avant - valeur);
  const pv_apres = get_monstre_pv(monstre.state);
  console.log(`[DEGATS] ${monstre.state.nom} a reçu ${valeur} dégâts! (PV: ${pv_avant} → ${pv_apres})`);
  
  // Mise à jour de la barre de vie
  const health_fill = monstre.element.querySelector('.monster-health-fill');
  if (health_fill) {
    const pourcentage_vie = (pv_apres / monstre.state.pv_max) * 100;
    health_fill.style.width = `${Math.max(0, pourcentage_vie)}%`;
  }
  
  afficher_degats_monstre(monstre.element, valeur);
}

function appliquer_soin_au_monstre(monstre, valeur) {
  set_monstre_pv(monstre.state, Math.min(get_monstre_pv(monstre.state) + valeur, monstre.state.pv_max));
  afficher_soin_monstre(monstre.element, valeur);
}

function appliquer_buff_au_monstre(monstre, nom_buff) {
  set_monstre_statut(monstre.state, { type: 'buff', nom: nom_buff });
  afficher_buff_monstre(monstre.element, nom_buff);
}

function appliquer_debuff_au_monstre(monstre, nom_debuff) {
  set_monstre_statut(monstre.state, { type: 'debuff', nom: nom_debuff });
  afficher_debuff_monstre(monstre.element, nom_debuff);
}

function appliquer_miss_au_monstre(monstre) {
  afficher_miss_monstre(monstre.element);
}

function appliquer_poison(monstre, valeur = 2, duree = 4000) {
  appliquer_effet(monstre.state, 'poison', {
    duree,
    valeur,
    on_tick: () => {
      // Applique les dégâts à chaque tick
      set_monstre_pv(monstre.state, get_monstre_pv(monstre.state) - valeur);
      afficher_degats_monstre(monstre.element, valeur);
      // Ici tu peux ajouter d'autres effets visuels si besoin
    },
    on_end: () => {
      // Fin du poison, feedback visuel possible
      afficher_debuff_monstre(monstre.element, 'Poison terminé');
    }
  });
}

function appliquer_stun(monstre, duree = 2000) {
  appliquer_effet(monstre.state, 'stun', {
    duree,
    on_end: () => {
      afficher_buff_monstre(monstre.element, 'Stun fini');
    }
  });
}

function appliquer_debuff_atk_monstre(monstre, valeur = -2, duree = 3000) {
  appliquer_debuff_atk(monstre.state, valeur, duree);
  afficher_debuff_monstre(monstre.element, 'ATK↓');
}

function est_empoisonne(monstre) {
  return a_effet(monstre.state, 'poison');
}

function retirer_poison(monstre) {
  retirer_effet(monstre.state, 'poison');
}

// --- Suppression d'un monstre ---
function supprimer_monstre(monstre) {
  // Retirer du DOM
  if (monstre.element && monstre.element.parentNode) {
    monstre.element.parentNode.removeChild(monstre.element);
  }
  // Retirer de la liste des monstres actifs
  const index = monstres_actifs.findIndex(m => m === monstre);
  if (index !== -1) {
    monstres_actifs.splice(index, 1);
  }
}

// --- Nettoyage global ---
function stop_all_monstres() {
  arreter_deplacement_monstres();
  monstres_actifs = [];
  window.monstres_actifs = [];
  window.combat_actif = false;
  window.current_monstre = null;
}

// --- Exports publics à la fin ---
export {
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
  stop_all_monstres as stopper_tous_monstres,
  supprimer_monstre
};
