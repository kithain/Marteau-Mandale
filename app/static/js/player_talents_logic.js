// player_talents_logic.js
// Gestion centralisée et harmonisée des talents du joueur

// --- Imports principaux ---
import { get_classe_joueur, get_mana_joueur, set_mana_joueur } from './player_state_logic.js';
import { attaquer_monstre_par_talent, stun_monstre_par_talent, empoisonner_monstre_par_talent, soigner_joueur_par_talent } from './combat_manager_logic.js';


// Initialisation du système de cooldowns
const cooldowns = {};

// --- Accès à la liste de tous les talents connus ---
function getAllTalentsList() {
  if (window.talentsDisponibles) {
    return Object.values(window.talentsDisponibles).flat();
  }
  return [];
}

// --- Conversion d'une liste d'IDs en objets talents ---
function getTalentsFromIds(ids) {
  const allTalents = getAllTalentsList();
  return ids.map(id => allTalents.find(t => t.id === id)).filter(Boolean);
}

// --- Talents accessibles selon classe et niveau ---
function get_talents() {
  const classe = window.PLAYER_CLASS;
  const niveau = typeof window.PLAYER_LEVEL === 'number' ? window.PLAYER_LEVEL : 1;
  if (!classe || !window.talentsDisponibles || !window.talentsDisponibles[classe]) return [];

  const talentsAccessibles = window.talentsDisponibles[classe].filter(t => (t.niveauRequis || 1) <= niveau);

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
function utiliser_talent(talent, index) {
  if (!talent) {
    console.warn('[TALENT] Talent non valide');
    return false;
  }

  if (!window.combat_actif) {
    console.warn('[TALENT] Les talents ne peuvent être utilisés qu\'en combat');
    return false;
  }

  const maintenant = Date.now();
  if (cooldowns[talent.id] && maintenant < cooldowns[talent.id]) {
    const tempsRestant = Math.ceil((cooldowns[talent.id] - maintenant) / 1000);
    console.warn(`[TALENT] Cooldown actif pour ${talent.nom}. Temps restant : ${tempsRestant}s`);
    return false;
  }

  const mana_actuel = get_mana_joueur();
  if (mana_actuel < (talent.cost || 0)) {
    console.warn(`[TALENT] Pas assez de mana pour ${talent.nom}`);
    return false;
  }

  // Réduction du mana
  set_mana_joueur(mana_actuel - (talent.cost || 0));

  // Mise en cooldown
  cooldowns[talent.id] = maintenant + (talent.cooldown || 3000);

  // Activation du talent
  utiliser_talent_en_combat(talent);

  // Gestion des types de talents
  switch (talent.type) {
    case 'attack':
      const currentMonstre = window.monstresActifs?.[0];
      if (currentMonstre) {
        const degats = talent.damage || 3;
        console.log(`[TALENT] ${talent.nom} inflige ${degats} dégâts`);
      }
      break;
    
    case 'utility':
      if (talent.boostType === 'stun') {
        console.log(`[TALENT] ${talent.nom} applique un étourdissement`);
      }
      break;
    
    case 'defense':
      if (talent.defenseType === 'dot') {
        console.log(`[TALENT] ${talent.nom} applique des dégâts sur la durée`);
      }
      break;
  }

  return true;
}
// --- Application directe de l'effet du talent ---
function appliquer_effet_talent(talent) {
  if (talent.type === 'attack') {
    attaquer_monstre_par_talent(talent.damage || 5);
  } else if (talent.type === 'utility' && talent.boostType === 'stun') {
    stun_monstre_par_talent(talent.duration || 2000);
  } else if (talent.type === 'defense' && talent.defenseType === 'dot') {
    empoisonner_monstre_par_talent(talent.dot || 2, talent.duration || 4000);
  } else if (talent.type === 'heal') {
    soigner_joueur_par_talent(talent.heal || 10);
  }
}

// --- Dash furtif spécial ---
function dashStealth(dureeFurtivite = 2000) {
  import('./player_module.js').then(playerModule => {
    const getPlayerX = playerModule.getPlayerX;
    const getPlayerY = playerModule.getPlayerY;
    const setCombat = playerModule.setCombat;
    const stopAllMonsters = playerModule.stopAllMonsters || (() => {});

    let currentX = getPlayerX();
    let currentY = getPlayerY();

    setCombat(false);
    stopAllMonsters();

    import('./map_module.js').then(mapModule => {
      const { isBlocked, setPlayerPosition } = mapModule;

      import('./monstre_module.js').then(monstreModule => {
        const monstresActifs = window.monstresActifs || [];

        const directions = [
          { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 },
          { dx: 0, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: 0 }, { dx: -1, dy: -1 }
        ];

        let bestPath = null;
        let bestDist = -1;

        for (const dir of directions) {
          let path = [{ x: currentX, y: currentY }];
          let posX = currentX;
          let posY = currentY;

          for (let i = 1; i <= 3; i++) {
            const tryX = currentX + dir.dx * i;
            const tryY = currentY + dir.dy * i;

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

        if (bestPath && bestPath.length > 1) {
          const last = bestPath[bestPath.length - 1];
          setPlayerPosition(last.x, last.y);
          window.furtif = true;

          setTimeout(() => {
            window.furtif = false;
            setCombat(true);
            import('./combat_manager_module.js').then(cm => {
              if (typeof cm.verifierCombatAdjMonstre === 'function') {
                cm.verifierCombatAdjMonstre();
              }
            });
          }, dureeFurtivite);
        } else {
          console.warn('[DASH] Aucun chemin libre trouvé pour dash furtif.');
        }
      });
    });
  });
}


// --- Exports publics ---
export {
  getAllTalentsList,
  getTalentsFromIds,
  get_talents,
  utiliser_talent,
  appliquer_effet_talent,
  dashStealth,
  cooldowns
};
