// player_talents.js
// Fonctions de gestion des talents extraites de player.js

// Importe les setters/getters centralisés si besoin
import { setPlayerPV, getPlayerPV, setPlayerMana, getPlayerMana } from './playerState.js';

// Récupère tous les talents disponibles (toutes classes)
export function getAllTalentsList() {
  if (window.talentsDisponibles) {
    // Fusionne tous les talents de toutes les classes
    return Object.values(window.talentsDisponibles).flat();
  }
  return [];
}

// Retourne les objets talents débloqués à partir d'une liste d'IDs
export function getTalentsFromIds(ids) {
  const allTalents = getAllTalentsList();
  return ids.map(id => allTalents.find(t => t.id === id)).filter(Boolean);
}

// Lecture dynamique des talents selon le niveau et la classe
export function getTalents() {
  const classe = window.PLAYER_CLASS;
  const niveau = (typeof window.PLAYER_LEVEL === 'number') ? window.PLAYER_LEVEL : 1;
  if (!classe || !window.talentsDisponibles || !window.talentsDisponibles[classe]) return [];
  // Retourne TOUS les talents débloqués selon le niveau du joueur
  return window.talentsDisponibles[classe].filter(t => (t.niveauRequis || 1) <= niveau);
}

// Dash furtif intelligent : dash de 3 cases dans la direction qui maximise la distance au monstre le plus proche
export function dashStealth(dureeFurtivite = 2000) {
  import('./player.js').then(playerModule => {
    const getPlayerX = playerModule.getPlayerX;
    const getPlayerY = playerModule.getPlayerY;
    const setCombat = playerModule.setCombat;
    const stopAllMonsters = playerModule.stopAllMonsters || (()=>{});
    let currentX = getPlayerX();
    let currentY = getPlayerY();
    setCombat(false);
    stopAllMonsters();
    import('./map.js').then(module => {
      const { isBlocked, setPlayerPosition } = module;
      import('./monstre.js').then(monstreModule => {
        const monstresActifs = window.monstresActifs || [];
        // Directions (8)
        const directions = [
          { dx: 0, dy: -1 }, // haut
          { dx: 1, dy: -1 }, // haut-droite
          { dx: 1, dy: 0 },  // droite
          { dx: 1, dy: 1 },  // bas-droite
          { dx: 0, dy: 1 },  // bas
          { dx: -1, dy: 1 }, // bas-gauche
          { dx: -1, dy: 0 }, // gauche
          { dx: -1, dy: -1 } // haut-gauche
        ];
        let bestPath = null;
        let bestDist = -1;
        // Pour chaque direction, construit le chemin maximal (jusqu'à 3 cases)
        for (const dir of directions) {
          let path = [{ x: currentX, y: currentY }];
          let posX = currentX;
          let posY = currentY;
          for (let i = 1; i <= 3; i++) {
            const tryX = currentX + dir.dx * i;
            const tryY = currentY + dir.dy * i;
            // Vérifie blocage décor + monstre
            const monstreSurCase = monstresActifs.some(m => {
              const mx = parseInt(m.element.style.left) / 64;
              const my = parseInt(m.element.style.top) / 64;
              return mx === tryX && my === tryY;
            });
            if (!isBlocked(tryX, tryY) && !monstreSurCase) {
              posX = tryX;
              posY = tryY;
              path.push({ x: posX, y: posY });
            } else {
              break;
            }
          }
          // Calcule la distance minimale à un monstre depuis la case finale du chemin
          let minDist = Infinity;
          for (const m of monstresActifs) {
            const mx = parseInt(m.element.style.left) / 64;
            const my = parseInt(m.element.style.top) / 64;
            const dist = Math.abs(posX - mx) + Math.abs(posY - my);
            if (dist < minDist) minDist = dist;
          }
          if (path.length > 1 && minDist > bestDist) {
            bestDist = minDist;
            bestPath = path;
          }
        }
        // Déplacement : effectue le dash sur tout le chemin (jusqu'à 3 cases)
        if (bestPath && bestPath.length > 1) {
          const last = bestPath[bestPath.length - 1];
          setPlayerPosition(last.x, last.y);
          if (typeof afficherMessage === 'function') {
            afficherMessage("Vous êtes furtif pendant " + (dureeFurtivite/1000) + "s", "success");
          }
          setPlayerMana(getPlayerMana() - 10); // Utilise le setter pour modifier le mana
          window.furtif = true;
          setTimeout(() => {
            window.furtif = false;
            setCombat(true);
            import('./combat_manager.js').then(cm => {
              if (typeof cm.verifierCombatAdjMonstre === 'function') {
                cm.verifierCombatAdjMonstre();
              }
            });
            if (typeof afficherMessage === 'function') {
              afficherMessage("La furtivité est terminée !", "error");
            }
          }, dureeFurtivite);
        } else {
          if (typeof afficherMessage === 'function') {
            afficherMessage("Dash furtif impossible : aucune case libre pour s'éloigner !", "error");
          }
        }
      });
    });
  });
}
