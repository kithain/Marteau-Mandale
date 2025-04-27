// combat_manager_logic.js
// Centralise toute la logique de combat et de rencontres du jeu
// Refactorisé pour clarté, maintenabilité et cohérence

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
  estempoisonne,
  retirer_poison,
  stop_all_monstres,
  get_monstre_pv,
  supprimer_monstre
} from './monstre_main_logic.js';

import { gain_xp } from './player_main_logic.js';

import { get_monster_atk } from './progression_main_logic.js';
import { afficher_mob_degats } from './player_visual_utils.js';
import { register_game_interval, clear_game_interval } from './player_visual_utils.js';

import { getPlayerX, getPlayerY, getPlayerPV } from './player_main_logic.js';
import { getPlayerDef, infligerDegatsAuJoueur } from './player_state_logic.js';
import { isBlocked } from './map_main_logic.js';

// --- Variables globales ---
const DEPLACEMENT_SANS_RENCONTRE_INIT = 3;
let deplacementSansRencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
let combatActif = false;
let currentMonstre = null;
let monstreInterval = null;

// Initialisation des variables globales window
window.combatActif = false;
window.currentMonstre = null;

// --- Fonctions de gestion du déplacement sans rencontre ---
function set_deplacement_sans_rencontre(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    deplacementSansRencontre = val;
    window.DEP_SANS_RENCONTRE = val;
  }
}

function get_deplacement_sans_rencontre() {
  return deplacementSansRencontre;
}

function reset_deplacement_sans_rencontre() {
  deplacementSansRencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
  window.DEP_SANS_RENCONTRE = DEPLACEMENT_SANS_RENCONTRE_INIT;
}

// --- Combat principal ---
function creer_monstre_et_demarrer_combat(monstre, pv, x, y) {
  // Création et affichage du monstre sur la carte
  const monstreObj = creer_monstre({
    ...monstre,
    pv,
    posX: x,
    posY: y
  });
  
  // Démarrer le combat immédiatement si le monstre est proche
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const dx = Math.abs(playerX - x);
  const dy = Math.abs(playerY - y);
  
  if (dx <= 1 && dy <= 1) {
    demarrer_combat(monstreObj);
  }
  
  return monstreObj;
}

function demarrer_combat(monstre) {
  if (window.combatActif || window.isGameOver) return;
  window.combatActif = true;
  window.currentMonstre = monstre;
  
  // Arrêter le déplacement des monstres
  arreter_deplacement_monstres();
  
  // Démarrer l'attaque automatique du monstre
  window.monstreAttackInterval = setInterval(() => {
    if (!window.combatActif || window.isGameOver) {
      clearInterval(window.monstreAttackInterval);
      return;
    }
    attaquer_joueur(monstre);
  }, 2000);
  
  document.dispatchEvent(new CustomEvent('combatStarted'));
}

function finir_combat() {
  window.currentMonstre = null;
  window.combatActif = false;
  
  if (window.monstreAttackInterval) {
    clearInterval(window.monstreAttackInterval);
    window.monstreAttackInterval = null;
  }
  
  document.dispatchEvent(new CustomEvent('combatEnded'));
}

// --- Attaques ---
function attaquer_joueur(monstre) {
  if (!window.currentMonstre || window.isGameOver) return;
  
  // Vérifier si le joueur est adjacent au monstre
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const monsterPos = get_monstre_position(monstre.state);
  const dx = Math.abs(playerX - monsterPos.x);
  const dy = Math.abs(playerY - monsterPos.y);
  
  // Si le monstre n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Utilise la bonne clé d'attaque (atk ou attaque)
  const atk = (monstre.state && (typeof monstre.state.atk === 'number' ? monstre.state.atk : monstre.state.attaque)) || 10;
  const def = getPlayerDef();
  const degats = Math.max(1, atk - def);
  infligerDegatsAuJoueur(degats);
  
  if (getPlayerPV() <= 0) {
    finir_combat();
  }
}

function attaquer_monstre(valeur) {
  if (!window.currentMonstre || window.isGameOver) return;
  
  // Vérifier si le joueur est adjacent au monstre
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const monsterPos = get_monstre_position(window.currentMonstre.state);
  const dx = Math.abs(playerX - monsterPos.x);
  const dy = Math.abs(playerY - monsterPos.y);
  
  // Si le joueur n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Si currentMonstre est bien {state, element}
  appliquer_degats_au_monstre(window.currentMonstre, valeur);
  if (get_monstre_pv(window.currentMonstre.state) <= 0) {
    finir_combat();
  }
}

// --- Accès à l'état du combat ---
function get_combat_actif() {
  return window.combatActif;
}

function get_current_monstre() {
  return window.currentMonstre;
}

// --- Gestion des rencontres aléatoires ---
function verifier_rencontre() {
  if (get_combat_actif()) return;
  if (deplacementSansRencontre > 0) {
    deplacementSansRencontre--;
    window.DEP_SANS_RENCONTRE = deplacementSansRencontre;
    return;
  }

  fetch(`/api/rencontre?x=${getPlayerX()}&y=${getPlayerY()}&carte=${modules.currentMap}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur de réseau');
      return res.json();
    })
    .then(data => {
      console.log('[DEBUG] Réponse de /api/rencontre:', data);
      if (data.monstre) {
        const monstre = data.monstre;
        const pv = monstre.pv;
        // Ajoute baseId pour lier à la fiche de base
        let baseId = monstre.id;
        if (baseId && baseId.includes('_lvl')) {
          baseId = baseId.split('_lvl')[0];
        }
        monstre.baseId = baseId;
        // Cherche une case libre à distance 2 max pour le monstre
        const px = getPlayerX();
        const py = getPlayerY();
        let found = null;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            if (dx === 0 && dy === 0) continue; // ne pas pop sur la case du joueur
            const nx = px + dx;
            const ny = py + dy;
            if (!window.isBlocked || !window.isBlocked(nx, ny)) {
              found = {x: nx, y: ny};
              break;
            }
          }
          if (found) break;
        }
        // Si pas de case libre, spawn sur le joueur (fallback)
        const spawnX = found ? found.x : px;
        const spawnY = found ? found.y : py;
        const monstreObj = creer_monstre_et_demarrer_combat(monstre, pv, spawnX, spawnY);
        deplacementSansRencontre = 5;
        window.DEP_SANS_RENCONTRE = deplacementSansRencontre;
      } else {
        console.warn('[DEBUG] Aucun monstre généré:', data);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la vérification des rencontres:', error);
    });
}

// --- Détection de sortie de zone ---
function detecter_sortie(exitZones) {
  const sortie = exitZones.find(zone =>
    getPlayerX() >= zone.x &&
    getPlayerX() < zone.x + zone.width &&
    getPlayerY() >= zone.y &&
    getPlayerY() < zone.y + zone.height
  );
  return sortie;
}

// --- Détection de monstre adjacent et démarrage du combat ---
function verifier_combat_adj_monstre() {
  // Ne détecte pas le combat si furtif
  if (window.furtif) return false;
  const px = getPlayerX();
  const py = getPlayerY();
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  const monstresActifs = get_monstres_actifs();
  
  console.log('[DEBUG] Vérification combat adjacent', {
    playerX: px, 
    playerY: py, 
    monstresActifs: monstresActifs.length,
    monstresEnCombat: monstresActifs.filter(m => m === window.currentMonstre).length
  });
  
  for (const monstre of monstresActifs) {
    // Vérification des données de position
    if (!monstre.element || !monstre.element.style.left || !monstre.element.style.top) {
      console.warn('[COMBAT] Élément monstre sans position', monstre);
      continue;
    }
    
    const monsterPos = get_monstre_position(monstre.state);
    const monsterX = monsterPos.x;
    const monsterY = monsterPos.y;
    
    console.log('[DEBUG] Position monstre', { 
      id: monstre.state.id,
      monsterX, 
      monsterY, 
      playerX: px, 
      playerY: py,
      enCombat: (window.currentMonstre && window.currentMonstre.state.id === monstre.state.id) ? 1 : 0
    });
    
    // Vérifie si le monstre est adjacent (dans une case adjacente)
    const isAdjacent = directions.some(([dx, dy]) => 
      monsterX === px + dx && monsterY === py + dy
    );
    
    if (isAdjacent) {
      // Si le monstre est déjà en combat, ne pas démarrer un nouveau combat
      if (window.currentMonstre && window.currentMonstre.state.id === monstre.state.id) {
        continue;
      }
      
      // Démarrer le combat avec ce monstre
      demarrer_combat(monstre);
      return true;
    }
  }
  
  return false;
}

// --- Exports publics harmonisés ---
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
  estempoisonne,
  retirer_poison,
  stop_all_monstres,
  supprimer_monstre
};