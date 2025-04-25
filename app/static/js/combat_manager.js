// combat_manager.js
import * as modules from './modules.js';

let deplacementSansRencontre = 3;

export function setDeplacementSansRencontre(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    deplacementSansRencontre = val;
    window.DEP_SANS_RENCONTRE = val;
  }
}

export function getDeplacementSansRencontre() {
  return deplacementSansRencontre;
}

export function resetDeplacementSansRencontre() {
  deplacementSansRencontre = 3;
  window.DEP_SANS_RENCONTRE = 3;
}

export function verifierRencontre() {
  if (modules.combatActif) return;
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
      if (data.monstre) {
        const monstre = data.monstre;
        const pv = monstre.pv;
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
        modules.demarrerCombat(monstre, pv, spawnX, spawnY);
        deplacementSansRencontre = 5;
        window.DEP_SANS_RENCONTRE = deplacementSansRencontre;
      }
    })
    .catch(error => {
      console.error('Erreur lors de la vérification des rencontres:', error);
    });
}

export function detecterSortie(exitZones) {
  const sortie = exitZones.find(zone =>
    modules.getPlayerX() >= zone.x &&
    modules.getPlayerX() < zone.x + zone.width &&
    modules.getPlayerY() >= zone.y &&
    modules.getPlayerY() < zone.y + zone.height
  );
  return sortie;
}

// Nouvelle fonction pour détecter un monstre adjacent et démarrer le combat

export function verifierCombatAdjMonstre() {
  // Ajout : Ne détecte pas le combat si furtif
  if (window.furtif) return false;
  const px = modules.getPlayerX();
  const py = modules.getPlayerY();
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  const monstres = window.monstresActifs || [];
  for (const [dx,dy] of directions) {
    const nx = px+dx;
    const ny = py+dy;
    const monstre = monstres.find(m => {
      const mx = parseInt(m.element.style.left) / 64;
      const my = parseInt(m.element.style.top) / 64;
      return mx === nx && my === ny;
    });
    if (monstre) {
      // Démarre le combat si pas déjà actif
      if (!modules.combatActif) {
        modules.demarrerCombat(monstre.data, monstre.pv, nx, ny);
      }
      return true;
    }
  }
  return false;
}