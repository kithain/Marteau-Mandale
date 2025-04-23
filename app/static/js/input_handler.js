// input_handler.js
import { utiliserTalent, getTalents } from './player.js';
import { setPlayerPosition, getPlayerX, getPlayerY } from './player.js';
import { deplacementVersCarte, exitZones, isBlocked } from './map.js';
import { getMonstreParId, demarrerCombat, getMonstreActif } from './monstre.js';
import { movePlayer } from './camera.js';
import { verifierRencontre, detecterSortie, verifierCombatAdjMonstre } from './combat_manager.js';

export function handleKeydown(e) {
  // Mémorise la direction pour d'autres fonctionnalités
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    window.lastMoveDirection = e.key;
  }
  
  // Liste des touches réservées pour lancer des talents
  const talentKeys = ["&", "é", '"', "'", "(", "-", "è", "_", "ç", "à"];
  
  // Gestion de l'activation d'un talent
  const keyMap = {
    "&": 0, "é": 1, '"': 2, "'": 3,
    "(": 4, "-": 5, "è": 6, "_": 7,
    "ç": 8, "à": 9
  };
  
  const talentIndex = keyMap[e.key];
  
  // Récupération des talents dynamiquement
  const talentsData = getTalents();
  if (!talentsData || talentsData.length === 0) {
    console.warn("Les talents ne sont pas encore chargés");
    return;
  }
  const skills = Array.isArray(talentsData) ? talentsData : talentsData.talents;
  
  if (talentIndex !== undefined && skills && skills[talentIndex]) {
    utiliserTalent(skills[talentIndex], talentIndex);
    return;
  }

  // Attaque de base avec la barre d'espace
  if (e.code === 'Space' || e.key === ' ') {
    // Animation d'attaque (optionnel)
    if (typeof animerAttaque === 'function') animerAttaque();
    // Inflige des dégâts à tous les monstres autour (adjacents ou sur la même case)
    import('./monstre.js').then(module => {
      module.recevoirDegats();
    });
    e.preventDefault();
    return;
  }

  let monstreSurCase = false;
  let monstreAdj = false;

  // Vérification : Empêcher de quitter la case si un monstre est présent
  const currentX = getPlayerX();
  const currentY = getPlayerY();
  const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
  for (const monsterDiv of monsterElements) {
    const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
    const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
    if (currentX === monstreX && currentY === monstreY) {
      monstreSurCase = true;
    }
    if (Math.abs(currentX - monstreX) <= 1 && Math.abs(currentY - monstreY) <= 1) {
      monstreAdj = true;
    }
  }
  if (monstreSurCase || monstreAdj) {
    // Si le combat n'est pas encore actif, le déclencher automatiquement.
    if (!window.combatActif) {
      // Démarrer le combat pour tous les monstres adjacents ou sur la case
      for (const monsterDiv of monsterElements) {
        const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
        const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
        if (Math.abs(currentX - monstreX) <= 1 && Math.abs(currentY - monstreY) <= 1) {
          const monstre = getMonstreParId(monsterDiv.id.replace('combat-monstre-', ''));
          if (monstre) {
            demarrerCombat(monstre.data, monstre.pv, monstreX, monstreY);
          }
        }
      }
      window.combatActif = true;
      console.log('Combat automatiquement déclenché car un monstre est présent sur la case ou en case adjacente.');
    }
    // Bloque le déplacement
    e.preventDefault();
    console.log('Déplacement bloqué : vous ne pouvez pas quitter la case tant qu\'un monstre est présent ou adjacent.');
    return;
  }
  
  // Calcul de la nouvelle position en fonction de la touche fléchée pressée
  let newX = currentX;
  let newY = currentY;
  if (e.key === 'ArrowUp') newY--;
  if (e.key === 'ArrowDown') newY++;
  if (e.key === 'ArrowLeft') newX--;
  if (e.key === 'ArrowRight') newX++;
  
  // Gestion des déplacements entre les cartes (bordures)
  if (newX < 0) return deplacementVersCarte('gauche');
  if (newX >= 16) return deplacementVersCarte('droite');
  if (newY < 0) return deplacementVersCarte('haut');
  if (newY >= 16) return deplacementVersCarte('bas');
  
  // Vérification si la case est bloquée
  if (isBlocked(newX, newY)) {
    console.log("Déplacement bloqué : case non accessible");
    return;
  }
  // Bloque le joueur si la case cible contient un monstre
  const monstres = window.monstresActifs || [];
  const monstreSurCaseDeplacement = monstres.find(m => {
    const mx = parseInt(m.element.style.left) / 64;
    const my = parseInt(m.element.style.top) / 64;
    return mx === newX && my === newY;
  });
  if (monstreSurCaseDeplacement) {
    console.log("Déplacement bloqué : case occupée par un monstre");
    return;
  }
  
  // Si la case d'arrivée n'est pas bloquée et que le joueur se déplace, on met à jour sa position
  if (newX !== currentX || newY !== currentY) {
    setPlayerPosition(newX, newY);
    movePlayer();
    verifierRencontre();
    verifierCombatAdjMonstre();
    detecterSortie(exitZones);
  }
} 