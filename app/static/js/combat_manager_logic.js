// combat_manager_logic.js
// Chef d'orchestre de la gestion du combat

// --- Imports principaux ---
import { infliger_degats_au_joueur } from './player_visual_utils.js';
import { infliger_degats_au_monstre, creer_monstre, supprimer_monstre } from './monstre_main_logic.js';
import { appliquer_poison, appliquer_stun, appliquer_soin_au_monstre } from './monstre_talents_logic.js';
import { get_position_monstre , get_monstre_pv } from './monstre_state_logic.js';
import { get_pv_joueur, get_position_joueur, set_pv_joueur, get_pv_max_joueur } from './player_state_logic.js';
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

  if (get_pv_joueur() <= 0) {
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
  const pv_courant = get_pv_joueur();
  const pv_max = get_pv_max_joueur();
  set_pv_joueur(Math.min(pv_courant + valeur, pv_max));
}

// --- Génération de rencontres ---
/**
 * Génère une rencontre aléatoire selon la difficulté de la carte et les probabilités du fichier JSON rencontres/difficulte_X.json
 * Retourne l'ID du monstre sélectionné (ex: slime_lvl1) ou null si pas de rencontre
 */
function generer_rencontre(x, y, carte) {
  // Réduire le compteur de déplacement sans rencontre
  set_deplacement_sans_rencontre(get_deplacement_sans_rencontre() - 1);

  // Si le compteur est toujours positif, pas de rencontre
  if (get_deplacement_sans_rencontre() > 0) {
    return null;
  }

  // Réinitialiser le compteur pour la prochaine rencontre
  reset_deplacement_sans_rencontre();

  // Déterminer la difficulté de la carte (1 à 10)
  let difficulte_carte = 1;
  try {
    if (typeof carte === 'string') {
      // Si c'est un nom de carte (ex: "A1"), utiliser get_difficulty_carte si dispo
      if (window.get_difficulty_carte) {
        difficulte_carte = window.get_difficulty_carte(carte);
      } else {
        difficulte_carte = parseInt(carte.replace(/[^0-9]/g, '') || '1', 10);
      }
    } else if (typeof carte === 'number') {
      difficulte_carte = carte;
    }
    difficulte_carte = Math.max(1, Math.min(10, difficulte_carte));
  } catch (e) {
    difficulte_carte = 1;
  }

  // LOG: Difficulté de carte utilisée et fichier de rencontre ciblé
  console.log(`[RENCONTRE] Difficulté de carte: ${difficulte_carte} (argument carte:`, carte, ", typeof:", typeof carte, ")");
  const rencontrePath = `/static/rencontres/difficulte_${difficulte_carte}.json`;
  console.log(`[RENCONTRE] Chargement du fichier: ${rencontrePath}`);

  // Note: fetch est async, mais on force ici un mode synchrone via XHR pour compatibilité (sinon, refactorer l'appelant en async/await)
  let rencontreData = null;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', rencontrePath, false); // sync
    xhr.send(null);
    if (xhr.status === 200) {
      rencontreData = JSON.parse(xhr.responseText);
    }
  } catch (e) {
    console.warn(`[RENCONTRE] Impossible de charger ${rencontrePath}`);
    return null;
  }
  if (!Array.isArray(rencontreData) || rencontreData.length === 0) {
    console.warn(`[RENCONTRE] Fichier vide ou invalide: ${rencontrePath}`);
    return null;
  }

  // LOG: Liste brute des monstres candidats pour cette difficulté
  console.log(`[RENCONTRE] Liste des monstres candidats pour difficulte_${difficulte_carte}:`, rencontreData.map(m => m.monstre_id).join(', '));

  // Tirage au sort selon les probabilités du JSON
  const total = rencontreData.reduce((acc, m) => acc + (m.probabilite || 0), 0);
  let rand = Math.random() * total;
  let selected = rencontreData[0].monstre_id;
  for (let i = 0; i < rencontreData.length; i++) {
    rand -= rencontreData[i].probabilite || 0;
    if (rand <= 0) {
      selected = rencontreData[i].monstre_id;
      // LOG: Monstre sélectionné à ce tour
      console.log(`[RENCONTRE] Sélection intermédiaire: ${selected} (proba: ${rencontreData[i].probabilite})`);
      break;
    }
  }
  // LOG: Monstre sélectionné et fichier source
  console.log(`[RENCONTRE] Monstre sélectionné: ${selected} (issu de difficulte_${difficulte_carte}.json)`);
  return selected;
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
  soigner_joueur_par_talent,
  generer_rencontre
};
