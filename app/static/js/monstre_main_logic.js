// monstre_main_logic.js
// Gestion globale des monstres (création, boucle, interactions)
// Refactorisé pour utiliser monstreState.js et monstre_utils.js

import {
  createMonstreState,
  setMonstrePV,
  getMonstrePV,
  setMonstrePosition,
  getMonstrePosition,
  setMonstreStatut,
  appliquerEffet,
  appliquerDebuffAtk,
  aEffet,
  retirerEffet
} from './monstre_state_logic.js';
import {
  afficherDegatsMonstre,
  afficherSoinMonstre,
  afficherBuffMonstre,
  afficherDebuffMonstre,
  afficherMissMonstre
} from './monstre_visual_utils.js';
import { registerGameInterval, clearGameInterval } from './player_visual_utils.js';
import { 
  getPlayerX,
  getPlayerY,
  getPlayerDef,
  infligerDegatsAuJoueur,
  getPlayerPV,
  isBlocked
} from './player_main_logic.js';
import { 
  demarrerCombat,
  finirCombat
} from './combat_manager_logic.js';

// --- Constantes ---
const tileSize = 64;

// --- Etat global (liste des monstres actifs) ---
let monstresActifs = [];

// --- Création d'un monstre ---
function creerMonstre({ id, nom, niveau, pv, atk, def, image, baseId, posX = 0, posY = 0 }) {
  // Fallback image : tente de retrouver dans la fiche de base
  if (!image) {
    let ficheBase = null;
    
    // 1. Essaie par baseId
    if (baseId && window.LISTE_MONSTRES_BASE) {
      ficheBase = window.LISTE_MONSTRES_BASE.find(m => m.id === baseId);
    }
    
    // 2. Si pas trouvé, essaie par nom (insensible à la casse)
    if (!ficheBase && nom && window.LISTE_MONSTRES_BASE) {
      ficheBase = window.LISTE_MONSTRES_BASE.find(m => 
        m.nom.toLowerCase() === nom.toLowerCase()
      );
    }
    
    // Récupère l'image si une fiche est trouvée
    if (ficheBase && ficheBase.image) {
      image = ficheBase.image;
    }
  }
  
  if (!image) {
    throw new Error(`[MONSTRE] Aucune image trouvée pour le monstre id=${id}, nom=${nom}, baseId=${baseId}`);
  }
  
  const monstreState = createMonstreState({ id, nom, niveau, pv, atk, def });
  monstreState.position = { x: posX, y: posY }; // Stocker la position dans le state
  
  const monstreDiv = creerElementMonstre(image, id, posX, posY);
  setMonstrePosition(monstreState, posX, posY);
  
  const monstreActif = { state: monstreState, element: monstreDiv };
  monstresActifs.push(monstreActif);

  // Vérifier si le monstre est à plus de 1 case du joueur
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const dx = Math.abs(playerX - posX);
  const dy = Math.abs(playerY - posY);
  
  if (dx > 1 || dy > 1) {
    // Démarrer le déplacement des monstres si ce n'est pas déjà fait
    demarrerDeplacementMonstres();
  } else {
    // Si le monstre est proche, démarrer le combat directement
    // demarrerCombat(monstreActif);
  }
  
  return monstreActif;
}

// --- Création et gestion visuelle (DOM) ---
function creerElementMonstre(image, uniqueId, posX = 0, posY = 0) {
  const monstreDiv = document.createElement('div');
  monstreDiv.id = `combat-monstre-${uniqueId}`;
  monstreDiv.className = 'monstre';
  monstreDiv.style.width = '64px';
  monstreDiv.style.height = '64px';
  monstreDiv.style.left = `${posX * tileSize}px`;
  monstreDiv.style.top = `${posY * tileSize}px`;
  
  // Correction du chemin de l'image
  const imagePath = image.startsWith('/') ? image : `/static/img/monstres/${image}`;
  monstreDiv.style.backgroundImage = `url(${imagePath})`;
  
  // Barre de vie
  const healthBar = document.createElement('div');
  healthBar.className = 'monster-health-bar';
  const healthFill = document.createElement('div');
  healthFill.className = 'monster-health-fill';
  healthBar.appendChild(healthFill);
  monstreDiv.appendChild(healthBar);
  
  // Conteneur d'états
  const statusContainer = document.createElement('div');
  statusContainer.className = 'monster-status';
  monstreDiv.appendChild(statusContainer);
  
  document.getElementById('map-inner').appendChild(monstreDiv);
  return monstreDiv;
}

// --- Déplacement des monstres ---
function deplacerMonstre(monstre) {
  if (!monstre || !monstre.state || !monstre.element) return;
  
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const monsterPos = getMonstrePosition(monstre.state);
  
  // Calculer la direction vers le joueur
  const dx = playerX - monsterPos.x;
  const dy = playerY - monsterPos.y;
  
  // Déplacement en diagonale autorisé
  let newX = monsterPos.x;
  let newY = monsterPos.y;
  
  // Déplacement horizontal
  if (dx > 0) newX++;
  else if (dx < 0) newX--;
  
  // Déplacement vertical
  if (dy > 0) newY++;
  else if (dy < 0) newY--;
  
  // Vérifier si la nouvelle position est libre
  if (!isBlocked || !isBlocked(newX, newY)) {
    console.log('[MONSTRE] Déplacement', {
      from: monsterPos,
      to: { x: newX, y: newY }
    });
    
    // Mettre à jour la position dans le state et l'élément
    setMonstrePosition(monstre.state, newX, newY);
    monstre.element.style.left = `${newX * tileSize}px`;
    monstre.element.style.top = `${newY * tileSize}px`;
  }
}

// Ajouter un gestionnaire pour déplacer tous les monstres
function deplacerTousMonstres() {
  if (window.isGameOver) return;
  
  // S'il n'y a pas de monstres actifs, arrêter le déplacement
  if (monstresActifs.length === 0) {
    arreterDeplacementMonstres();
    return;
  }
  
  // Si on est en combat, vérifier que le monstre est toujours adjacent
  if (window.currentMonstre) {
    const playerX = getPlayerX();
    const playerY = getPlayerY();
    const monsterPos = getMonstrePosition(window.currentMonstre.state);
    const dx = Math.abs(playerX - monsterPos.x);
    const dy = Math.abs(playerY - monsterPos.y);
    
    // Si le monstre n'est plus adjacent, arrêter le combat
    if (dx > 1 || dy > 1) {
      // finirCombat();
    }
    return; // Ne pas déplacer les autres monstres pendant un combat
  }
  
  monstresActifs.forEach(monstre => {
    // Vérifier si le monstre est adjacent au joueur
    const playerX = getPlayerX();
    const playerY = getPlayerY();
    const monsterPos = getMonstrePosition(monstre.state);
    const dx = Math.abs(playerX - monsterPos.x);
    const dy = Math.abs(playerY - monsterPos.y);
    
    console.log('[DEBUG] État monstre', { 
      id: monstre.state.id,
      enCombat: window.currentMonstre ? 1 : 0,
      stun: monstre.state.stun ? 1 : 0,
      distanceX: dx,
      distanceY: dy
    });
    
    // Si le monstre est adjacent au joueur, démarrer le combat
    if (dx <= 1 && dy <= 1) {
      // Démarrer le combat si le monstre est adjacent
      window.currentMonstre = monstre;
      window.combatActif = true;
      // demarrerCombat(monstre);
      return;
    }
    
    // Si pas en combat et pas étourdi, déplacer le monstre
    if (!monstre.state.stun) {
      console.log('[MONSTRE] Tentative de déplacement', { 
        id: monstre.state.id,
        position: monsterPos,
        distanceX: dx,
        distanceY: dy
      });
      deplacerMonstre(monstre);
    }
  });
}

// Initialiser un intervalle pour déplacer les monstres
let intervalDeplacementMonstres = null;

function demarrerDeplacementMonstres() {
  if (!intervalDeplacementMonstres) {
    intervalDeplacementMonstres = setInterval(deplacerTousMonstres, 1000);
    registerGameInterval(intervalDeplacementMonstres);
  }
}

function arreterDeplacementMonstres() {
  if (intervalDeplacementMonstres) {
    clearGameInterval(intervalDeplacementMonstres);
    intervalDeplacementMonstres = null;
  }
}

// Initialiser le déplacement au démarrage
window.combatActif = false; // Réinitialisation au démarrage
demarrerDeplacementMonstres();

// Ajouter un écouteur pour arrêter le déplacement si un combat commence
document.addEventListener('combatStarted', () => {
  // Ne pas arrêter le déplacement des autres monstres
  // arreterDeplacementMonstres();
});

document.addEventListener('combatEnded', () => {
  // S'assurer que l'intervalle est actif
  demarrerDeplacementMonstres();
});

// --- Helpers d'accès ---
function getMonstreParId(id) {
  return monstresActifs.find(m => m.state.id === id);
}

function getMonstresAdjacentsEtSurCase() {
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  return monstresActifs.filter(monstre => {
    const { x, y } = getMonstrePosition(monstre.state);
    const dx = Math.abs(playerX - x);
    const dy = Math.abs(playerY - y);
    return (dx <= 1 && dy <= 1);
  });
}

function getMonstresActifs() {
  return monstresActifs;
}

// --- Application de dégâts et effets visuels ---
function appliquerDegatsAuMonstre(monstre, valeur) {
  const pvAvant = getMonstrePV(monstre.state);
  setMonstrePV(monstre.state, pvAvant - valeur);
  const pvApres = getMonstrePV(monstre.state);
  console.log(`[DEGATS] ${monstre.state.nom} a reçu ${valeur} dégâts! (PV: ${pvAvant} → ${pvApres})`);
  
  // Mise à jour de la barre de vie
  const healthFill = monstre.element.querySelector('.monster-health-fill');
  if (healthFill) {
    const pourcentageVie = (pvApres / monstre.state.pvMax) * 100;
    healthFill.style.width = `${Math.max(0, pourcentageVie)}%`;
  }
  
  afficherDegatsMonstre(monstre.element, valeur);
}

function appliquerSoinAuMonstre(monstre, valeur) {
  setMonstrePV(monstre.state, Math.min(getMonstrePV(monstre.state) + valeur, monstre.state.pvMax));
  afficherSoinMonstre(monstre.element, valeur);
}

function appliquerBuffAuMonstre(monstre, nomBuff) {
  setMonstreStatut(monstre.state, { type: 'buff', nom: nomBuff });
  afficherBuffMonstre(monstre.element, nomBuff);
}

function appliquerDebuffAuMonstre(monstre, nomDebuff) {
  setMonstreStatut(monstre.state, { type: 'debuff', nom: nomDebuff });
  afficherDebuffMonstre(monstre.element, nomDebuff);
}

function appliquerMissAuMonstre(monstre) {
  afficherMissMonstre(monstre.element);
}

// --- Application d'un effet de statut avancé sur un monstre (exemple poison, stun, debuff) ---
// Exemple : Appliquer le poison à un monstre
function appliquerPoison(monstre, valeur = 2, duree = 4000) {
  appliquerEffet(monstre.state, 'poison', {
    duree,
    valeur,
    onTick: () => {
      // Applique les dégâts à chaque tick
      setMonstrePV(monstre.state, getMonstrePV(monstre.state) - valeur);
      afficherDegatsMonstre(monstre.element, valeur);
      // Ici tu peux ajouter d'autres effets visuels si besoin
    },
    onEnd: () => {
      // Fin du poison, feedback visuel possible
      afficherDebuffMonstre(monstre.element, 'Poison terminé');
    }
  });
}

// Exemple : Appliquer un stun
function appliquerStun(monstre, duree = 2000) {
  appliquerEffet(monstre.state, 'stun', {
    duree,
    onEnd: () => {
      afficherBuffMonstre(monstre.element, 'Stun fini');
    }
  });
}

// Exemple : Appliquer un debuff d'attaque temporaire
function appliquerDebuffAtkMonstre(monstre, valeur = -2, duree = 3000) {
  appliquerDebuffAtk(monstre.state, valeur, duree);
  afficherDebuffMonstre(monstre.element, 'ATK↓');
}

// Exemple : Vérifier si un monstre est sous un effet
function estempoisonne(monstre) {
  return aEffet(monstre.state, 'poison');
}

// Exemple : Retirer un effet manuellement
function retirerPoison(monstre) {
  retirerEffet(monstre.state, 'poison');
}

// --- Suppression d'un monstre ---
function supprimerMonstre(monstre) {
  // Retirer du DOM
  if (monstre.element && monstre.element.parentNode) {
    monstre.element.parentNode.removeChild(monstre.element);
  }
  // Retirer de la liste des monstres actifs
  const index = monstresActifs.findIndex(m => m === monstre);
  if (index !== -1) {
    monstresActifs.splice(index, 1);
  }
}

// --- Nettoyage global ---
function stopAllMonsters() {
  arreterDeplacementMonstres();
  monstresActifs = [];
  window.monstresActifs = [];
  window.combatActif = false;
  window.currentMonstre = null;
}

// --- Exports publics à la fin ---
export {
  creerMonstre,
  creerElementMonstre,
  deplacerMonstre,
  deplacerTousMonstres,
  demarrerDeplacementMonstres,
  arreterDeplacementMonstres,
  getMonstreParId,
  getMonstresAdjacentsEtSurCase,
  getMonstresActifs,
  appliquerDegatsAuMonstre,
  appliquerSoinAuMonstre,
  appliquerBuffAuMonstre,
  appliquerDebuffAuMonstre,
  appliquerMissAuMonstre,
  appliquerPoison,
  appliquerStun,
  appliquerDebuffAtkMonstre,
  estempoisonne,
  retirerPoison,
  supprimerMonstre,
  stopAllMonsters
};
