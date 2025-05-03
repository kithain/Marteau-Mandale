// input_handler_logic.js
// Gestion des entrées clavier du joueur (déplacement, talents, détection combat)

// --- Imports ---
import { get_position_joueur, set_position_joueur } from './player_state_logic.js';
import { obtenir_monstres_actifs } from './monstre_main_logic.js';
import { demarrer_combat, generer_rencontre, creer_monstre_et_preparer_combat } from './combat_manager_logic.js';
import { utiliser_talent, get_talents } from './player_talents_logic.js';
import { isBlocked, charger_nouvelle_carte, deplacementVersCarte } from './map_main_logic.js';

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

// --- Vérification des obstacles ---
// Supprimé - utilisation exclusive de la fonction importée depuis map_main_logic.js

// --- Gestion des déplacements --- 
function gerer_deplacement(touche) {
  const joueur = get_position_joueur();
  let direction = null;
  let cible_x = joueur.x;
  let cible_y = joueur.y;

  // Correspondance pour deplacementVersCarte
  if (touche === 'ArrowUp') { direction = 'haut'; cible_y--; }
  if (touche === 'ArrowDown') { direction = 'bas'; cible_y++; }
  if (touche === 'ArrowLeft') { direction = 'gauche'; cible_x--; }
  if (touche === 'ArrowRight') { direction = 'droite'; cible_x++; }

  // Si hors limites, changer de carte
  if (cible_x < 0 || cible_x >= TAILLE_CARTE || 
      cible_y < 0 || cible_y >= TAILLE_CARTE) {
    deplacementVersCarte(direction);
    return;
  }

  // Vérification des obstacles
  if (isBlocked(cible_x, cible_y)) {
    console.log("[Déplacement] Case bloquée par un obstacle");
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

  // --- DEBUG avant génération de rencontre ---
  console.log('[DEBUG] Valeur de window.PLAYER_MAP avant rencontre:', window.PLAYER_MAP);
  console.log('[DEBUG] Difficulté calculée:', window.get_difficulty_carte ? window.get_difficulty_carte(window.PLAYER_MAP) : 'get_difficulty_carte non dispo');

  // --- Génération de rencontre aléatoire après déplacement ---
  const rencontre = generer_rencontre(cible_x, cible_y, window.PLAYER_MAP);
  if (rencontre) {
    // --- Extraction id/level depuis monstre_id (ex: slime_lvl1) ---
    const match = rencontre.match(/^(.*)_lvl(\d+)$/);
    if (!match) {
      console.warn('[RENCONTRE] Format monstre_id invalide:', rencontre);
      return;
    }
    const id = match[1];
    const niveau = parseInt(match[2], 10);

    // Déterminer la difficulté de la carte
    const difficulte_carte = window.get_difficulty_carte ? window.get_difficulty_carte(window.PLAYER_MAP) : 1;
    console.log(`[RENCONTRE] Difficulté de la carte: ${difficulte_carte}`);

    // Charger les données du monstre depuis monstres.json
    let monstreData = null;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/static/monstres/monstres.json', false);
      xhr.send(null);
      if (xhr.status === 200) {
        const allMonstres = JSON.parse(xhr.responseText);
        monstreData = allMonstres.find(m => m.id === id);
      }
    } catch (e) {
      console.warn('[RENCONTRE] Impossible de charger monstres.json');
      return;
    }
    if (!monstreData) {
      console.warn(`[RENCONTRE] Monstre inconnu: ${id}`);
      return;
    }

    // Préparer les données pour la création du monstre
    const donnees_monstre = {
      id: id,
      nom: monstreData.nom,
      niveau: niveau,
      difficulte_carte: difficulte_carte,
      image: `/static/img/monstres/${monstreData.image}`,
      talents: monstreData.talents
    };
    console.log(`[RENCONTRE] Apparition du monstre: ${donnees_monstre.nom} (id: ${donnees_monstre.id}, niveau: ${donnees_monstre.niveau})`);
    console.log(`[RENCONTRE] Stats: difficulte_carte=${donnees_monstre.difficulte_carte}, talents=[${donnees_monstre.talents.join(', ')}], image=${donnees_monstre.image}`);
    const monstre = creer_monstre_et_preparer_combat(donnees_monstre, null, cible_x, cible_y);
    demarrer_combat(monstre);
  }
}

// --- Gestion des talents --- 
function gerer_talent(touche) {
  const index = TOUCHES_TALENTS.indexOf(touche);
  if (index === -1) return;

  if (window.combat_actif) {
    const talents = get_talents();
    if (talents[index]) {
      utiliser_talent(talents[index]);
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
