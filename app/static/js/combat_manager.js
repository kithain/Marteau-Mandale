// combat_manager.js
import { getPlayerX, getPlayerY, combatActif } from './player.js';
import { demarrerCombat } from './monstre.js';
import { currentMap } from './map.js';

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

export function verifierRencontre() {
  if (combatActif) return;
  if (deplacementSansRencontre > 0) {
    deplacementSansRencontre--;
    window.DEP_SANS_RENCONTRE = deplacementSansRencontre;
    return;
  }

  fetch(`/api/rencontre?x=${getPlayerX()}&y=${getPlayerY()}&carte=${currentMap}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur de réseau');
      return res.json();
    })
    .then(data => {
      if (data.monstre) {
        const monstre = data.monstre;
        const pv = monstre.pv;
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
        demarrerCombat(monstre, pv, spawnX, spawnY);
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
    getPlayerX() >= zone.x &&
    getPlayerX() < zone.x + zone.width &&
    getPlayerY() >= zone.y &&
    getPlayerY() < zone.y + zone.height
  );
  return sortie;
}

// Nouvelle fonction pour détecter un monstre adjacent et démarrer le combat

export function verifierCombatAdjMonstre() {
  const px = getPlayerX();
  const py = getPlayerY();
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
      if (!window.combatActif) {
        demarrerCombat(monstre.data, monstre.pv, nx, ny);
      }
      return true;
    }
  }
  return false;
}