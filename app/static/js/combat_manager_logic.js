// combat_manager_logic.js
// Chef d'orchestre de la gestion du combat

// --- Imports principaux ---
import { infliger_degats_au_joueur } from './player_visual_utils.js';
import { infliger_degats_au_monstre, creer_monstre, supprimer_monstre, appliquer_poison, appliquer_stun, appliquer_soin_au_monstre } from './monstre_main_logic.js';
import { get_position_monstre , get_monstre_pv } from './monstre_state_logic.js';
import { get_player_pv, get_position_joueur, set_player_pv, get_player_pv, get_max_vie } from './player_state_logic.js';
import { DEPLACEMENT_SANS_RENCONTRE_INIT } from './map_constants_logic.js';

// --- Etats internes ---
let deplacement_sans_rencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
let combat_actif = false;
let monstre_actuel = null;

// Synchronisation globale
window.combat_actif = false;
window.monstre_actuel = null;

// --- Fonctions principales ---

function set_deplacement_sans_rencontre(valeur) {
  deplacement_sans_rencontre = Math.max(0, valeur);
}

function reset_deplacement_sans_rencontre() {
  deplacement_sans_rencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
}

function get_deplacement_sans_rencontre() {
  return deplacement_sans_rencontre;
}

function creer_monstre_et_preparer_combat(donnees_monstre, pv, x, y) {
  return creer_monstre({ ...donnees_monstre, pv, pos_x: x, pos_y: y });
}

function demarrer_combat(monstre) {
  if (combat_actif || window.is_game_over) return;
  combat_actif = true;
  monstre_actuel = monstre;

  window.combat_actif = true;
  window.monstre_actuel = monstre;

  document.dispatchEvent(new CustomEvent('combatStarted'));

  initialiser_attaque_monstre(monstre);
}

function finir_combat() {
  combat_actif = false;
  monstre_actuel = null;

  window.combat_actif = false;
  window.monstre_actuel = null;

  document.dispatchEvent(new CustomEvent('combatEnded'));
}

function attaquer_joueur(monstre) {
  if (!combat_actif || window.is_game_over) return;

  const joueur = get_position_joueur();
  const ennemi = get_position_monstre(monstre.state);

  const est_adjacent = Math.abs(joueur.x - ennemi.x) <= 1 && Math.abs(joueur.y - ennemi.y) <= 1;
  if (!est_adjacent) return;

  const attaque = monstre.state.atk || 10;
  infliger_degats_au_joueur(attaque);

  if (get_player_pv() <= 0) {
    finir_combat();
  }
}

function attaquer_monstre(valeur_degats) {
  if (!combat_actif || !monstre_actuel || window.is_game_over) return;

  const joueur = get_position_joueur();
  const ennemi = get_monstre_position(monstre_actuel.state);

  const est_adjacent = Math.abs(joueur.x - ennemi.x) <= 1 && Math.abs(joueur.y - ennemi.y) <= 1;
  if (!est_adjacent) return;

  infliger_degats_au_monstre(monstre_actuel, valeur_degats);

  if (get_monstre_pv(monstre_actuel.state) <= 0) {
    supprimer_monstre(monstre_actuel);
    finir_combat();
  }
}

function initialiser_attaque_monstre(monstre) {
  if (window.interval_attaque_monstre) {
    clearInterval(window.interval_attaque_monstre);
  }
  window.interval_attaque_monstre = setInterval(() => {
    attaquer_joueur(monstre);
  }, 2000);
}

// === Application d'effets de talents depuis player_talents_logic.js ===



function attaquer_monstre_par_talent(valeur) {
  if (!combat_actif || !monstre_actuel || window.is_game_over) return;
  attaquer_monstre(valeur);
}

function stun_monstre_par_talent(duree = 2000) {
  if (!combat_actif || !monstre_actuel || window.is_game_over) return;
  appliquer_stun(monstre_actuel, duree);
}

function empoisonner_monstre_par_talent(valeur = 2, duree = 4000) {
  if (!combat_actif || !monstre_actuel || window.is_game_over) return;
  appliquer_poison(monstre_actuel, valeur, duree);
}

function soigner_joueur_par_talent(valeur) {
  const pv_courant = get_player_pv();
  const pv_max = get_max_vie(window.PLAYER_LEVEL);
  set_player_pv(Math.min(pv_courant + valeur, pv_max));
}


// --- Export public ---
export {
  set_deplacement_sans_rencontre,
  reset_deplacement_sans_rencontre,
  get_deplacement_sans_rencontre,
  creer_monstre_et_preparer_combat,
  demarrer_combat,
  finir_combat,
  attaquer_joueur,
  attaquer_monstre,
  attaquer_monstre_par_talent,
  stun_monstre_par_talent,
  empoisonner_monstre_par_talent,
  soigner_joueur_par_talent
};
