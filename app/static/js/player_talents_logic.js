// player_talents_logic.js
// Gestion centralisée et harmonisée des talents du joueur
// Ce module fournit les accès, utilitaires et actions liés aux talents.

// --- Imports principaux ---
import { utiliserTalentEnCombat } from './input_handler_logic.js';
import { getPlayerClassState, getPlayerEffectiveStats } from './player_state_logic.js';

// Initialisation du système de cooldowns
const cooldowns = {};

// --- Accès à la liste de tous les talents connus (toutes classes) ---
/**
 * Retourne la liste de tous les talents disponibles (toutes classes).
 */
function getAllTalentsList() {
  if (window.talentsDisponibles) {
    return Object.values(window.talentsDisponibles).flat();
  }
  return [];
}

// --- Conversion d'une liste d'IDs en objets talents ---
/**
 * Retourne les objets talents débloqués à partir d'une liste d'IDs.
 * @param {Array} ids - Liste d'identifiants de talents
 * @returns {Array} Objets talents correspondants
 */
function getTalentsFromIds(ids) {
  const allTalents = getAllTalentsList();
  return ids.map(id => allTalents.find(t => t.id === id)).filter(Boolean);
}

// --- Talents accessibles selon classe et niveau du joueur ---
/**
 * Retourne les talents accessibles pour la classe et le niveau du joueur.
 */
function getTalents() {
  const classe = window.PLAYER_CLASS;
  const niveau = (typeof window.PLAYER_LEVEL === 'number') ? window.PLAYER_LEVEL : 1;
  if (!classe || !window.talentsDisponibles || !window.talentsDisponibles[classe]) return [];
  
  // Filtrer les talents par niveau et classe
  const talentsAccessibles = window.talentsDisponibles[classe].filter(t => (t.niveauRequis || 1) <= niveau);
  
  // Ajouter des informations de cooldown et de disponibilité
  return talentsAccessibles.map(talent => ({
    ...talent,
    estDisponible: () => {
      const maintenant = Date.now();
      return !cooldowns[talent.id] || maintenant >= cooldowns[talent.id];
    },
    tempsRestantCooldown: () => {
      const maintenant = Date.now();
      const cooldownRestant = cooldowns[talent.id] ? cooldowns[talent.id] - maintenant : 0;
      return Math.max(0, cooldownRestant);
    }
  }));
}

// --- Utilisation d'un talent ---
/**
 * Utilise un talent spécifique.
 * @param {Object} talent - Le talent à utiliser
 * @param {number} index - L'index du talent
 */
function utiliserTalent(talent, index) {
  // Vérification des conditions d'utilisation
  if (!talent) {
    console.warn('[TALENT] Talent non valide');
    return false;
  }

  // Vérification du combat
  if (!window.combatActif) {
    console.warn('[TALENT] Les talents ne peuvent être utilisés qu\'en combat');
    return false;
  }

  // Vérification des cooldowns
  const maintenant = Date.now();
  if (cooldowns[talent.id] && maintenant < cooldowns[talent.id]) {
    const tempsRestant = Math.ceil((cooldowns[talent.id] - maintenant) / 1000);
    console.warn(`[TALENT] Cooldown actif pour ${talent.name}. Temps restant : ${tempsRestant}s`);
    return false;
  }

  // Gestion des coûts de mana
  const manaActuel = getPlayerEffectiveStats().mana;
  if (talent.cost > manaActuel) {
    console.warn(`[TALENT] Pas assez de mana pour ${talent.name}`);
    return false;
  }

  // Réduction du mana
  getPlayerClassState().mana -= talent.cost;

  // Mise à jour du cooldown
  cooldowns[talent.id] = maintenant + talent.cooldown;

  // Utilisation du talent via player_main_logic
  utiliserTalentEnCombat(talent);

  // Logique d'application du talent selon son type
  switch (talent.type) {
    case 'attack':
      const currentMonstre = window.monstresActifs[0];
      if (currentMonstre) {
        const degats = talent.damage || 3;
        console.log(`[TALENT] ${talent.name} inflige ${degats} dégâts`);
      }
      break;
    
    case 'utility':
      switch (talent.boostType) {
        case 'stun':
          console.log(`[TALENT] ${talent.name} applique un étourdissement`);
          break;
      }
      break;
    
    case 'defense':
      switch (talent.defenseType) {
        case 'dot':
          console.log(`[TALENT] ${talent.name} applique des dégâts sur la durée`);
          break;
      }
      break;
  }

  return true;
}

// --- Talent actif : dash furtif ---
/**
 * Dash furtif intelligent : dash de 3 cases dans la direction qui maximise la distance au monstre le plus proche.
 * Utilise la map et la liste des monstres actifs pour déterminer la meilleure direction.
 * @param {number} dureeFurtivite - Durée de la furtivité en ms
 */
function dashStealth(dureeFurtivite = 2000) {
  import('./player_module.js').then(playerModule => {
    const getPlayerX = playerModule.getPlayerX;
    const getPlayerY = playerModule.getPlayerY;
    const setCombat = playerModule.setCombat;
    const stopAllMonsters = playerModule.stopAllMonsters || (()=>{});
    let currentX = getPlayerX();
    let currentY = getPlayerY();
    setCombat(false);
    stopAllMonsters();
    import('./map_module.js').then(module => {
      const { isBlocked, setPlayerPosition } = module;
      import('./monstre_module.js').then(monstreModule => {
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
          getPlayerClassState().mana -= 10; // Utilise le setter pour modifier le mana
          window.furtif = true;
          setTimeout(() => {
            window.furtif = false;
            setCombat(true);
            import('./combat_manager_module.js').then(cm => {
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

// Exports pour utilisation dans d'autres modules
export { 
  getAllTalentsList, 
  getTalentsFromIds, 
  getTalents, 
  utiliserTalent,
  dashStealth,
  cooldowns
};
