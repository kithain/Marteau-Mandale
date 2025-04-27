// input_handler_logic.js
// Gestion centralisée des entrées clavier du joueur
// Refactorisé pour plus de clarté et de maintenabilité

import { deplacerJoueur } from './player_main_logic.js';
import { demarrerCombat } from './combat_manager_logic.js';
import { getPositionJoueur } from './player_state_logic.js';
import { utiliserTalent, getTalents } from './player_talents_logic.js';

// --- Constantes globales ---
const TALENT_KEYS = ["&", "é", '"', "'", "(", "-", "è", "_", "ç", "à"];
const KEY_MAP = {
  "&": 0, "é": 1, '"': 2, "'": 3,
  "(": 4, "-": 5, "è": 6, "_": 7,
  "ç": 8, "à": 9
};
const DIRECTION_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

// --- Fonctions utilitaires privées ---
function detectMonsters(currentX, currentY) {
  const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
  let monstreSurCase = false;
  let monstreAdj = false;
  for (const monsterDiv of monsterElements) {
    const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
    const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
    if (currentX === monstreX && currentY === monstreY) monstreSurCase = true;
    if (Math.abs(currentX - monstreX) <= 1 && Math.abs(currentY - monstreY) <= 1) monstreAdj = true;
  }
  return { monstreSurCase, monstreAdj, monsterElements };
}

function triggerCombatIfNeeded(monstreSurCase, monstreAdj, monsterElements, currentX, currentY) {
  if ((monstreSurCase || monstreAdj) && !window.combatActif) {
    for (const monsterDiv of monsterElements) {
      const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
      const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
      if (Math.abs(currentX - monstreX) <= 1 && Math.abs(currentY - monstreY) <= 1) {
        const monstre = modules.getMonstreParId(monsterDiv.id.replace('combat-monstre-', ''));
        if (monstre && monstre.state) {
          // On s'assure d'avoir toutes les propriétés nécessaires
          const monstreData = {
            id: monstre.state.id,
            nom: monstre.state.nom,
            niveau: monstre.state.niveau,
            pv: monstre.state.pv,
            atk: monstre.state.atk,
            def: monstre.state.def,
            image: monsterDiv.style.backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1'),
            baseId: monstre.state.baseId
          };
          demarrerCombat(monstreData, monstreData.pv, monstreX, monstreY);
        }
      }
    }
    window.combatActif = true;
    console.log('Combat automatiquement déclenché car un monstre est présent sur la case ou en case adjacente.');
  }
}

function isMoveBlockedByMonster(newX, newY) {
  const monstres = window.monstresActifs || [];
  return monstres.find(m => {
    const mx = parseInt(m.element.style.left) / 64;
    const my = parseInt(m.element.style.top) / 64;
    return mx === newX && my === newY;
  });
}

// --- Fonction pour utiliser un talent en combat ---
function utiliserTalentEnCombat(talent) {
  if (!window.combatActif) {
    console.warn('[TALENT] Impossible d\'utiliser un talent hors combat');
    return false;
  }

  return utiliserTalent(talent);
}

// --- Gestionnaire principal ---
function handleKeydown(e) {
  // 1. Mémorise la direction
  if (DIRECTION_KEYS.includes(e.key)) {
    window.lastMoveDirection = e.key;
  }

  // 2. Activation d'un talent
  const talentIndex = KEY_MAP[e.key];
  const talentsData = getTalents();
  
  if (window.combatActif && talentIndex !== undefined) {
    const skills = Array.isArray(talentsData) ? talentsData : talentsData.talents;
    if (skills && skills[talentIndex]) {
      const talent = skills[talentIndex];
      utiliserTalentEnCombat(talent);
      return; // Empêche tout autre comportement pendant le combat
    }
  }

  // 3. Vérification de la présence de monstres
  const currentX = getPositionJoueur().x;
  const currentY = getPositionJoueur().y;
  const { monstreSurCase, monstreAdj, monsterElements } = detectMonsters(currentX, currentY);
  if (monstreSurCase || monstreAdj) {
    triggerCombatIfNeeded(monstreSurCase, monstreAdj, monsterElements, currentX, currentY);
    if (!window.furtif) {
      e.preventDefault();
      console.log('Déplacement bloqué : vous ne pouvez pas quitter la case tant qu\'un monstre est présent ou adjacent.');
      return;
    }
  }

  // 4. Calcul de la nouvelle position
  let newX = currentX;
  let newY = currentY;
  if (e.key === 'ArrowUp') newY--;
  if (e.key === 'ArrowDown') newY++;
  if (e.key === 'ArrowLeft') newX--;
  if (e.key === 'ArrowRight') newX++;

  // 5. Gestion des déplacements entre cartes
  if (newX < 0) return deplacerJoueur('gauche');
  if (newX >= 16) return deplacerJoueur('droite');
  if (newY < 0) return deplacerJoueur('haut');
  if (newY >= 16) return deplacerJoueur('bas');

  // 6. Vérification si la case est bloquée
  if (modules.isBlocked(newX, newY)) {
    console.log("Déplacement bloqué : case non accessible");
    return;
  }

  // 7. Vérification si la case cible contient un monstre
  const monstreSurCaseDeplacement = isMoveBlockedByMonster(newX, newY);
  if (monstreSurCaseDeplacement && !window.furtif) {
    console.log("Déplacement bloqué : case occupée par un monstre");
    return;
  }

  // 8. Mise à jour de la position du joueur
  if (newX !== currentX || newY !== currentY) {
    deplacerJoueur(newX, newY);
    modules.verifierRencontre();
    modules.verifierCombatAdjMonstre();
    modules.detecterSortie(modules.exitZones);
  }
}

// --- Exports publics à la fin ---
export {
  handleKeydown,
  utiliserTalentEnCombat,
  detectMonsters
};