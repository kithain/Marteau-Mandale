// combat_manager_logic.js
// Centralise toute la logique de combat et de rencontres du jeu
// Refactorisé pour clarté, maintenabilité et cohérence

import * as modules from './modules_main_logic.js';
import { calculerXPMonstre } from './progression_main_logic.js';
import { gainXP } from './player_main_logic.js';
import { afficherMobDegats } from './player_visual_utils.js';
import { registerGameInterval, clearGameInterval } from './player_visual_utils.js';

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
function setDeplacementSansRencontre(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    deplacementSansRencontre = val;
    window.DEP_SANS_RENCONTRE = val;
  }
}

function getDeplacementSansRencontre() {
  return deplacementSansRencontre;
}

function resetDeplacementSansRencontre() {
  deplacementSansRencontre = DEPLACEMENT_SANS_RENCONTRE_INIT;
  window.DEP_SANS_RENCONTRE = DEPLACEMENT_SANS_RENCONTRE_INIT;
}

// --- Combat principal ---
function creerMonstreEtDemarrerCombat(monstre, pv, x, y) {
  // Création et affichage du monstre sur la carte
  const monstreObj = modules.creerMonstre({
    ...monstre,
    pv,
    posX: x,
    posY: y
  });
  
  // Démarrer le combat immédiatement si le monstre est proche
  const playerX = modules.getPlayerX();
  const playerY = modules.getPlayerY();
  const dx = Math.abs(playerX - x);
  const dy = Math.abs(playerY - y);
  
  if (dx <= 1 && dy <= 1) {
    demarrerCombat(monstreObj);
  }
  
  return monstreObj;
}

function demarrerCombat(monstre) {
  if (window.currentMonstre) return; // Ne pas démarrer un nouveau combat si déjà en combat
  
  window.currentMonstre = monstre;
  window.combatActif = true;
  
  // Démarrer l'intervalle d'attaque du monstre
  if (!window.monstreAttackInterval) {
    window.monstreAttackInterval = setInterval(() => {
      if (!window.currentMonstre) {
        clearInterval(window.monstreAttackInterval);
        window.monstreAttackInterval = null;
        return;
      }
      attaqueJoueur();
    }, 2000);
  }
  
  // Déclencher l'événement de début de combat
  document.dispatchEvent(new CustomEvent('combatStarted'));
}

function finirCombat() {
  window.currentMonstre = null;
  window.combatActif = false;
  
  if (window.monstreAttackInterval) {
    clearInterval(window.monstreAttackInterval);
    window.monstreAttackInterval = null;
  }
  
  // Déclencher l'événement de fin de combat
  document.dispatchEvent(new CustomEvent('combatEnded'));
}

// --- Attaques ---
function attaqueJoueur(monstre) {
  if (!window.currentMonstre || window.isGameOver) return;
  
  // Vérifier si le joueur est adjacent au monstre
  const playerX = modules.getPlayerX();
  const playerY = modules.getPlayerY();
  const monsterPos = modules.getMonstrePosition(monstre.state);
  const dx = Math.abs(playerX - monsterPos.x);
  const dy = Math.abs(playerY - monsterPos.y);
  
  // Si le monstre n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Utilise la bonne clé d'attaque (atk ou attaque)
  const atk = (monstre.state && (typeof monstre.state.atk === 'number' ? monstre.state.atk : monstre.state.attaque)) || 10;
  const def = modules.getPlayerDef();
  const degats = Math.max(1, atk - def);
  modules.infligerDegatsAuJoueur(degats);
  
  if (modules.getPlayerPV() <= 0) {
    finirCombat();
  }
}

function attaqueMonstre(valeur) {
  if (!window.currentMonstre || window.isGameOver) return;
  
  // Vérifier si le joueur est adjacent au monstre
  const playerX = modules.getPlayerX();
  const playerY = modules.getPlayerY();
  const monsterPos = modules.getMonstrePosition(window.currentMonstre.state);
  const dx = Math.abs(playerX - monsterPos.x);
  const dy = Math.abs(playerY - monsterPos.y);
  
  // Si le joueur n'est pas adjacent, ne pas attaquer
  if (dx > 1 || dy > 1) {
    return;
  }
  
  // Si currentMonstre est bien {state, element}
  modules.appliquerDegatsAuMonstre(window.currentMonstre, valeur);
  if (modules.getMonstrePV(window.currentMonstre.state) <= 0) {
    finirCombat();
  }
}

// --- Accès à l'état du combat ---
function getCombatActif() {
  return window.combatActif;
}

function getCurrentMonstre() {
  return window.currentMonstre;
}

// --- Gestion des rencontres aléatoires ---
function verifierRencontre() {
  if (getCombatActif()) return;
  if (deplacementSansRencontre > 0) {
    deplacementSansRencontre--;
    window.DEP_SANS_RENCONTRE = deplacementSansRencontre;
    return;
  }

  fetch(`/api/rencontre?x=${modules.getPlayerX()}&y=${modules.getPlayerY()}&carte=${modules.currentMap}`)
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
        const px = modules.getPlayerX();
        const py = modules.getPlayerY();
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
        const monstreObj = creerMonstreEtDemarrerCombat(monstre, pv, spawnX, spawnY);
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
function detecterSortie(exitZones) {
  const sortie = exitZones.find(zone =>
    modules.getPlayerX() >= zone.x &&
    modules.getPlayerX() < zone.x + zone.width &&
    modules.getPlayerY() >= zone.y &&
    modules.getPlayerY() < zone.y + zone.height
  );
  return sortie;
}

// --- Détection de monstre adjacent et démarrage du combat ---
function verifierCombatAdjMonstre() {
  // Ne détecte pas le combat si furtif
  if (window.furtif) return false;
  const px = modules.getPlayerX();
  const py = modules.getPlayerY();
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  const monstresActifs = modules.getMonstresActifs();
  
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
    
    const monsterPos = modules.getMonstrePosition(monstre.state);
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
      demarrerCombat(monstre);
      return true;
    }
  }
  
  return false;
}

// --- Exports publics harmonisés ---
export {
  attaqueJoueur,
  attaqueMonstre,
  creerMonstreEtDemarrerCombat,
  demarrerCombat,
  finirCombat,
  finirCombat as finCombat, // Alias pour la compatibilité
  getCombatActif,
  getCurrentMonstre,
  resetDeplacementSansRencontre,
  setDeplacementSansRencontre,
  getDeplacementSansRencontre,
  verifierCombatAdjMonstre,
  verifierRencontre,
  detecterSortie
};