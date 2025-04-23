// monstre.js
import { infligerDegatsAuJoueur, setCombat, getPlayerX, getPlayerY, playerPV } from './player.js';
import { afficherMobDegats } from './utils.js';
import { getMonsterPV, getMonsterAtk, getMonsterDef, getMonsterXP, getPlayerBaseDef } from './progression.js';

const tileSize = 64;
let monstresActifs = [];

function createMonsterElement(image, uniqueId, posX = 0, posY = 0) {
  const monstreDiv = document.createElement('div');
  monstreDiv.id = `combat-monstre-${uniqueId}`;
  monstreDiv.className = 'monstre';
  monstreDiv.style.width = '64px';
  monstreDiv.style.height = '64px';
  monstreDiv.style.left = `${posX * tileSize}px`;
  monstreDiv.style.top = `${posY * tileSize}px`;
  monstreDiv.style.backgroundImage = `url(/static/img/monstres/${image})`;

  // Ajout de la barre de vie
  const healthBar = document.createElement('div');
  healthBar.className = 'monster-health-bar';
  const healthFill = document.createElement('div');
  healthFill.className = 'monster-health-fill';
  healthBar.appendChild(healthFill);
  monstreDiv.appendChild(healthBar);

  // Ajout du conteneur d'états
  const statusContainer = document.createElement('div');
  statusContainer.className = 'monster-status';
  monstreDiv.appendChild(statusContainer);

  document.getElementById("map-inner").appendChild(monstreDiv);
  return monstreDiv;
}

function updateMonsterStatus(monstre) {
  const statusContainer = monstre.element.querySelector('.monster-status');
  statusContainer.innerHTML = ''; // Réinitialise les états

  // Ajout des icônes d'état
  if (monstre.data.stunned) {
    const stunIcon = document.createElement('div');
    stunIcon.className = 'monster-status-icon monster-status-stunned';
    stunIcon.textContent = '⚡';
    statusContainer.appendChild(stunIcon);
  }

  if (monstre.data.poisoned) {
    const poisonIcon = document.createElement('div');
    poisonIcon.className = 'monster-status-icon monster-status-poisoned';
    poisonIcon.textContent = '☠';
    statusContainer.appendChild(poisonIcon);
  }

  if (monstre.data.burning) {
    const burnIcon = document.createElement('div');
    burnIcon.className = 'monster-status-icon monster-status-burning';
    burnIcon.textContent = '🔥';
    statusContainer.appendChild(burnIcon);
  }

  if (typeof monstre.data.atk === 'number' && monstre.data.atk < getMonsterAtk(monstre.data.difficulte || 1)) {
    const debuffIcon = document.createElement('div');
    debuffIcon.className = 'monster-status-icon monster-status-debuff-atk';
    debuffIcon.textContent = '↓';
    statusContainer.appendChild(debuffIcon);
  }
}

function applyAttackDebuff(monstre, value, duration) {
  if (!monstre || typeof monstre.data.atk !== 'number') return;
  const originalAtk = monstre.data.atk;
  monstre.data.atk += value; // value négatif pour debuff
  updateMonsterStatus(monstre);
  setTimeout(() => {
    monstre.data.atk = originalAtk;
    updateMonsterStatus(monstre);
  }, duration);
}

function moveMonsterTowardPlayer(monstre) {
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  let monstreX = parseInt(monstre.element.style.left) / tileSize;
  let monstreY = parseInt(monstre.element.style.top) / tileSize;

  // Détermine la direction de déplacement (priorité à l'axe le plus éloigné)
  let dx = playerX - monstreX;
  let dy = playerY - monstreY;
  let stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
  let stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

  // Si déjà adjacent, ne bouge pas
  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return;

  // Essaye d'avancer d'abord sur X, sinon sur Y
  let newX = monstreX + (Math.abs(dx) >= Math.abs(dy) ? stepX : 0);
  let newY = monstreY + (Math.abs(dx) < Math.abs(dy) ? stepY : 0);

  // Vérifie si la case est libre (pas un autre monstre ni un mur)
  // À adapter si tu as une fonction isBlocked ou similaire
  if (typeof window.isBlocked === 'function' && window.isBlocked(newX, newY)) {
    // Si bloqué, essaie l'autre axe
    newX = monstreX + (Math.abs(dx) < Math.abs(dy) ? stepX : 0);
    newY = monstreY + (Math.abs(dx) >= Math.abs(dy) ? stepY : 0);
    if (typeof window.isBlocked === 'function' && window.isBlocked(newX, newY)) {
      // Si toujours bloqué, ne bouge pas
      return;
    }
  }

  monstre.element.style.left = `${newX * tileSize}px`;
  monstre.element.style.top = `${newY * tileSize}px`;
}

export function demarrerCombat(monstreData, pvInitial, posX = 0, posY = 0) {
  // Vérifie s'il existe déjà un monstre actif sur la case
  const existing = monstresActifs.find(m => {
    const x = parseInt(m.element.style.left) / tileSize;
    const y = parseInt(m.element.style.top) / tileSize;
    return x === posX && y === posY;
  });
  if (existing) {
    // Si déjà actif, réactive juste son intervalle d'attaque
    if (!existing.interval) {
      existing.interval = setInterval(() => attaqueJoueur(existing.data.uniqueId), 1000);
    }
    if (!existing.chaseInterval) {
      existing.chaseInterval = setInterval(() => moveMonsterTowardPlayer(existing), 500);
    }
    setCombat(true);
    return;
  }

  const uniqueId = `${monstreData.id}-${Date.now()}`;
  monstreData.uniqueId = uniqueId;
  monstreData.stunned = false;
  monstreData.poisoned = false;
  monstreData.burning = false;

  // Ajout : compatibilité XP (xpValue)
  if (typeof monstreData.experience !== 'undefined') {
    monstreData.xpValue = monstreData.experience;
  }

  // Progression dynamique des stats du monstre selon sa difficulte (niveau)
  const niveau = Math.round(monstreData.difficulte || 1);
  const pvMonstre = getMonsterPV(niveau);
  const atkMonstre = getMonsterAtk(niveau);
  const defMonstre = getMonsterDef(niveau);
  monstreData.atk = atkMonstre;
  monstreData.defense = defMonstre;

  // Log initial du combat avec niveau du monstre
  const niveauMonstre = (typeof monstreData.niveau !== 'undefined') ? monstreData.niveau : (monstreData.difficulte || '?');
  console.log('[COMBAT] Monstre:', monstreData.nom || monstreData.id, `| Niveau: ${niveauMonstre}`);
  console.log(`[COMBAT] PV: ${pvMonstre}, ATK: ${atkMonstre}, DEF: ${defMonstre}`);

  const element = createMonsterElement(monstreData.image, uniqueId, posX, posY);

  const interval = setInterval(() => attaqueJoueur(uniqueId), 1000);
  const chaseInterval = setInterval(() => moveMonsterTowardPlayer(monstreObj), 500);
  const monstreObj = {
    data: monstreData,
    pv: pvMonstre,
    maxPv: pvMonstre,
    element,
    interval,
    chaseInterval
  };

  monstresActifs.push(monstreObj);
  updateMonsterStatus(monstreObj);
  setCombat(true);
}

function attaqueJoueur(uniqueId) {
  // Si le joueur est mort, on arrête tous les monstres
  if (playerPV <= 0) {
    stopAllMonsters();
    return;
  }

  const monstre = monstresActifs.find(m => m.data.uniqueId === uniqueId);
  if (!monstre) return;

  // Empêche le monstre d'agir s'il est stun
  if (monstre.data.stunned) {
    console.log(`[STUN] ${monstre.data.nom} est étourdi et ne peut pas agir.`);
    return;
  }

  const playerX = getPlayerX();
  const playerY = getPlayerY();
  const monsterX = parseInt(monstre.element.style.left) / tileSize;
  const monsterY = parseInt(monstre.element.style.top) / tileSize;

  // NOUVEAU : le monstre attaque si il est adjacent OU sur la même case
  const dx = Math.abs(playerX - monsterX);
  const dy = Math.abs(playerY - monsterY);
  if ((dx <= 1 && dy <= 1)) {
    // Attaque si adjacent
    const atk = monstre.data.atk ?? 0;
    // Récupère la défense réelle du joueur
    let playerDefense = 0;
    if (typeof getPlayerBaseDef === 'function' && typeof window.PLAYER_LEVEL !== 'undefined') {
      playerDefense = getPlayerBaseDef(window.PLAYER_LEVEL);
    }
    const degats = Math.max(0, atk - playerDefense);
    console.log(`[COMBAT] ${monstre.data.nom} attaque le joueur ! ATK=${atk}, DEF joueur=${playerDefense}, dégâts infligés=${degats}`);
    if (degats === 0) {
      console.log(`${monstre.data.nom} est trop affaibli pour infliger des dégâts ! (ATK=${atk})`);
    }
    infligerDegatsAuJoueur(degats);
    afficherMobDegats(degats);
    animerAttaqueMonstre(monstre.data.uniqueId);
  }
}

function animerAttaqueMonstre(uniqueId) {
  const monstreDiv = document.getElementById(`combat-monstre-${uniqueId}`);
  if (!monstreDiv) return;
  monstreDiv.style.transform = "translate(0, 0) scale(1.2)";
  setTimeout(() => {
    monstreDiv.style.transform = "translate(0, 0) scale(1)";
  }, 200);
}

export function recevoirDegats(valeur = 1) {
  monstresActifs.forEach(monstre => {
    const playerX = getPlayerX();
    const playerY = getPlayerY();
    const monstreX = parseInt(monstre.element.style.left) / tileSize;
    const monstreY = parseInt(monstre.element.style.top) / tileSize;
    // Modif : accepte monstre sur case adjacente OU sur la même case
    const dx = Math.abs(playerX - monstreX);
    const dy = Math.abs(playerY - monstreY);
    if ((dx <= 1 && dy <= 1)) { // autorise aussi dx==0 && dy==0 (sur la même case)
      // Calcul des dégâts en tenant compte de la défense
      const defense = monstre.data.defense ?? 0;
      const dmgInfliges = Math.max(0, valeur - defense);
      const pvAvant = monstre.pv;
      monstre.pv = Math.max(0, monstre.pv - dmgInfliges);
      console.log(`[COMBAT] ${monstre.data.nom} reçoit une attaque ! Dégâts bruts=${valeur}, DEF=${defense}, Dégâts infligés=${dmgInfliges}, PV avant=${pvAvant}, PV après=${monstre.pv}`);
      // Mise à jour de la barre de vie
      const healthFill = monstre.element.querySelector('.monster-health-fill');
      if (healthFill) {
        healthFill.style.width = `${(monstre.pv / monstre.maxPv) * 100}%`;
      }
      if (monstre.element) {
        monstre.element.style.filter = "brightness(150%)";
        setTimeout(() => {
          monstre.element.style.filter = "";
        }, 300);
      }
      if (monstre.pv === 0) {
        console.log(`[COMBAT] ${monstre.data.nom} est vaincu !`);
        finCombat(monstre.data.uniqueId);
      }
    }
  });
}

export function finCombat(uniqueId) {
  const index = monstresActifs.findIndex(m => m.data.uniqueId === uniqueId);
  if (index === -1) return;

  const monstre = monstresActifs[index];
  clearInterval(monstre.interval);
  if (monstre.chaseInterval) clearInterval(monstre.chaseInterval);

  // Attribution de l'XP au joueur si le monstre est mort
  if (monstre.pv === 0 && monstre.element) {
    // On suppose que monstre.data.xpValue existe, sinon mettre une valeur par défaut
    import('./player.js').then(({ gainXP }) => {
      gainXP(monstre.data.xpValue || 10);
    });
    monstre.element.classList.add("fade-out");
    monstre.element.addEventListener('animationend', () => {
      monstre.element.remove();
    });
  }

  monstresActifs.splice(index, 1);

  if (monstresActifs.length === 0) {
    setCombat(false);
  }
}

export function getMonstreActif() {
  // Retourne le premier monstre actif sur la case du joueur
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  return monstresActifs.find(monstre => {
    const x = parseInt(monstre.element.style.left) / tileSize;
    const y = parseInt(monstre.element.style.top) / tileSize;
    return x === playerX && y === playerY;
  });
}

export function getMonstreParId(id) {
  return monstresActifs.find(monstre => monstre.data.uniqueId === id);
}

export function applyStatusEffect(monsterId, effect, duration, value = 1) {
  const monstre = monstresActifs.find(m => m.data.uniqueId === monsterId);
  if (!monstre) return;

  if (effect === "stunned") {
    console.log(`[DEBUG] Application du stun sur ${monstre.data.nom} (${monsterId}) pour ${duration} ms.`);
  }

  if (effect === "debuff_atk") {
    applyAttackDebuff(monstre, value, duration);
    return;
  }

  monstre.data[effect] = true;
  updateMonsterStatus(monstre);

  let intervalId;
  // Appliquer les dégâts sur la durée pour les effets poison et burning
  if (effect === "poisoned" || effect === "burning") {
    intervalId = setInterval(() => {
      recevoirDegats(value);
      console.log(`${effect} : ${value} dégâts appliqués au monstre.`);
    }, 1000);
  }

  setTimeout(() => {
    if (effect === "stunned") {
      console.log(`[DEBUG] Fin du stun sur ${monstre.data.nom} (${monsterId}).`);
    }
    monstre.data[effect] = false;
    updateMonsterStatus(monstre);
    if (intervalId) clearInterval(intervalId);
  }, duration);
}

export function getMonstresAdjacentsEtSurCase() {
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  return monstresActifs.filter(monstre => {
    const monstreX = parseInt(monstre.element.style.left) / tileSize;
    const monstreY = parseInt(monstre.element.style.top) / tileSize;
    const dx = Math.abs(playerX - monstreX);
    const dy = Math.abs(playerY - monstreY);
    return (dx <= 1 && dy <= 1);
  });
}

// Fonction pour arrêter tous les monstres et leurs intervalles
export function stopAllMonsters() {
  monstresActifs.forEach(m => {
    if (m.interval) {
      clearInterval(m.interval);
      m.interval = null;
    }
    if (m.chaseInterval) {
      clearInterval(m.chaseInterval);
      m.chaseInterval = null;
    }
  });
  setCombat(false);
}

// --- Utilitaire pour parser monstre_id au format id_lvlX ---
function parseMonstreId(monstre_id) {
  const match = monstre_id.match(/^(.*)_lvl(\d+)$/);
  if (match) {
    return { id: match[1], niveau: parseInt(match[2], 10) };
  } else {
    return { id: monstre_id, niveau: 1 };
  }
}

// --- Lors de la génération d'un monstre, utiliser le niveau parsé ---
// Exemple d'adaptation pour la fonction qui crée un monstre à partir d'un id :
export function creerMonstreDepuisId(monstre_id) {
  const { id, niveau } = parseMonstreId(monstre_id);
  // On récupère les données du monstre de base (sans le niveau)
  const monstreData = window.MONSTRES.find(m => m.id === id);
  if (!monstreData) {
    console.error('Monstre inconnu:', monstre_id);
    return null;
  }
  // On applique la progression dynamique avec le niveau parsé
  return {
    ...monstreData,
    pv: getMonsterPV(niveau),
    maxPv: getMonsterPV(niveau),
    atk: getMonsterAtk(niveau),
    def: getMonsterDef(niveau),
    xpValue: getMonsterXP(niveau),
    difficulte: niveau,
    niveau: niveau
  };
}
