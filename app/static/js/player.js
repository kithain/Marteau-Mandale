// player.js

// === Variables exportées (globales) ===
export let playerMana = 10;
export let playerPV = 10;
export let cooldowns = {};
export let combatActif = false;
export let playerShield = 0;

// === XP et Niveau ===
export let playerXP = 0;
export let xpToNextLevel = 100;

// Fonction utilitaire pour obtenir l'XP nécessaire pour atteindre le niveau donné
function getXpToNextLevel(level) {
  let xp = 100; // XP de base pour le niveau 1 (à ajuster si besoin)
  for (let i = 1; i < level; i++) {
    xp = Math.floor(xp * 1.5);
  }
  return xp;
}

import { getMaxVie, getMaxMana } from './progression.js';
import { getPlayerBaseAtk, filterTalentsByLevel } from './progression.js';
import { recevoirDegats, getMonstreActif, applyStatusEffect, stopAllMonsters } from './monstre.js';

// Récupère tous les talents disponibles (toutes classes)
function getAllTalentsList() {
  if (window.talentsDisponibles) {
    // Fusionne tous les talents de toutes les classes
    return Object.values(window.talentsDisponibles).flat();
  }
  return [];
}

// Retourne les objets talents débloqués à partir d'une liste d'IDs
function getTalentsFromIds(ids) {
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

// === Position du joueur ===
const playerPosition = { x: 0, y: 0 };

export function getPlayerPosition() {
  return { ...playerPosition };
}

export function setPlayerPosition(x, y) {
  playerPosition.x = x;
  playerPosition.y = y;
  window.PLAYER_POSITION = { x, y }; // Synchronisation pour la sauvegarde
}

export function getPlayerX() {
  return playerPosition.x;
}

export function getPlayerY() {
  return playerPosition.y;
}

// === Vie // Mana ===
export function updateManaBar() {
  const manaFill = document.getElementById("mana-fill");
  if (!manaFill) return;
  const percent = (playerMana / getMaxMana(window.PLAYER_LEVEL)) * 100;
  manaFill.style.width = percent + "%";
}

export function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  if (!vieFill) return;
  const percent = (playerPV / getMaxVie(window.PLAYER_LEVEL)) * 100;
  vieFill.style.width = percent + "%";
}

// === XP ===
export function gainXP(amount) {
  // Bloque l'XP au niveau 10
  if (window.PLAYER_LEVEL >= 10) {
    // On bloque l'XP au max requis pour le niveau 10
    const maxXP = getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
    window.PLAYER_XP = playerXP;
    updateXPBar();
    return;
  }
  playerXP += amount;
  while (playerXP >= xpToNextLevel) {
    levelUp();
    // Si on atteint le niveau 10, on bloque l'XP
    if (window.PLAYER_LEVEL >= 10) {
      playerXP = getXpToNextLevel(10);
      break;
    }
  }
  window.PLAYER_XP = playerXP;
  updateXPBar();
}

export function levelUp() {
  if (window.PLAYER_LEVEL >= 10) {
    // On ne monte plus de niveau
    return;
  }
  window.PLAYER_XP -= xpToNextLevel;
  window.PLAYER_LEVEL += 1;
  xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  createFloatingText(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiserTalents();
}

export function updateXPBar() {
  const xpFill = document.getElementById("xp-fill");
  if (!xpFill) return;
  let maxXP = xpToNextLevel;
  // Si niveau max, on bloque l'XP au seuil max
  if (window.PLAYER_LEVEL >= 10) {
    maxXP = getXpToNextLevel(10);
    playerXP = Math.min(playerXP, maxXP);
  }
  const percent = Math.min(100, (playerXP / maxXP) * 100);
  xpFill.style.width = percent + "%";
}

// === Utilisation d'un talent ===
export function utiliserTalent(talent, index) {
  if (cooldowns[index]) return;
  if (playerMana < talent.cost) return;

  console.log(`Le joueur utilise le talent: ${talent.name}`);

  animerAttaque();

  const player = document.getElementById("player");
  if (!player) return;

  // Effet visuel de couleur
  if (talent.color && talent.duration) {
    player.style.filter = `drop-shadow(0 0 6px ${talent.color})`;
    setTimeout(() => {
      player.style.filter = "";
    }, talent.duration);
  }

  // Opacité si spécifié
  if (talent.opacity !== undefined) {
    player.style.opacity = talent.opacity;
    setTimeout(() => {
      player.style.opacity = 1;
    }, 1000);
  }

  // Affichage d'un texte flottant
  if (talent.effectText) {
    createFloatingText(talent.effectText, talent.color || "white");
  }

  // Consommation de mana et mise à jour
  playerMana -= talent.cost;
  updateManaBar();

  cooldowns[index] = true;
  const btn = document.getElementById(`talent-btn-${index}`);
  if (btn) btn.disabled = true;

  setTimeout(() => {
    cooldowns[index] = false;
    if (btn) btn.disabled = false;
  }, talent.cooldown);

  // === Application des effets en combat ===
  if (combatActif) {
    // Gestion zone/mono-cible
    if (talent.zone === 'adjacent' || talent.zone === 'zone') {
      console.log(`[DEBUG] Talent zone détecté (\"${talent.zone}\"), application sur tous les monstres autour`);
      import('./monstre.js').then(module => {
        const monstres = module.getMonstresAdjacentsEtSurCase ? module.getMonstresAdjacentsEtSurCase() : [];
        monstres.forEach(monstre => {
          // --- Attaque ---
          if (talent.type === "attack") {
            let degats = talent.damage;
            if ((talent.niveauRequis || 1) === 1) {
              degats = getPlayerBaseAtk(window.PLAYER_LEVEL);
            }
            module.recevoirDegats(degats, monstre.data.uniqueId);
          }
          // --- Utility (stun, heal, poison, burn, debuff, evasion, etc.) ---
          else if (talent.type === "utility") {
            switch (talent.boostType) {
              case "stun":
                module.applyStatusEffect(monstre.data.uniqueId, "stunned", talent.duration);
                break;
              case "heal":
              case "soin":
                // Heal the player for the given value, but not above max HP
                setPlayerPV(Math.min(getMaxVie(window.PLAYER_LEVEL), playerPV + (talent.value || 0)));
                if (typeof afficherMessage === 'function') {
                  afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
                } else {
                  console.log(`[HEAL] +${talent.value || 0} PV soignés.`);
                }
                break;
              case "poison":
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration);
                break;
              case "burn":
                module.applyStatusEffect(monstre.data.uniqueId, "burning", talent.duration);
                break;
              case "dot":
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, talent.value);
                break;
              case "debuff_atk":
                module.applyStatusEffect(monstre.data.uniqueId, "debuff_atk", talent.duration, talent.value);
                break;
              case "evasion":
                // Appliquer un effet d'évasion sur le joueur (pas sur le monstre)
                dashBackwards();
                setCombat(false);
                stopAllMonsters();
                setTimeout(() => {
                  const currentX = getPlayerX();
                  const currentY = getPlayerY();
                  const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
                  for (const monsterDiv of monsterElements) {
                    const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
                    const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
                  }
                }, 100);
                if (typeof afficherMessage === 'function') {
                  afficherMessage("Vous vous échappez discrètement du combat !", "success");
                } else {
                  console.log("Boost d'évasion activé : Dash en arrière.");
                }
                break;
              default:
                console.warn(`[TALENT] Type utility inconnu ou non géré : ${talent.boostType}`);
                break;
            }
          }
          // --- Defense (bouclier sur joueur, dot sur monstre, etc.) ---
          else if (talent.type === "defense") {
            switch (talent.defenseType) {
              case "dot":
                // scaling DOT sur le niveau du joueur
                const dotScaling = talent.dotScaling !== undefined ? talent.dotScaling : 0.5;
                const dotValue = Math.max(1, Math.round(talent.value + (window.PLAYER_LEVEL - 1) * dotScaling));
                module.applyStatusEffect(monstre.data.uniqueId, "poisoned", talent.duration, dotValue);
                break;
              default:
                console.warn(`[TALENT] Type defense inconnu ou non géré : ${talent.defenseType}`);
                break;
            }
          }
          // --- Autre type non géré ---
          else {
            console.warn(`[TALENT] Type de talent non géré : ${talent.type}`);
          }
        });
      });
      return;
    }
    // Sinon, mono-cible : cible le monstre sur la case du joueur
    const monstreActif = getMonstreActif();
    if (!monstreActif) return;
    switch (talent.type) {
      case "attack":
        let degats = talent.damage;
        if ((talent.niveauRequis || 1) === 1) {
          degats = getPlayerBaseAtk(window.PLAYER_LEVEL);
        }
        recevoirDegats(degats, monstreActif.data.uniqueId);
        break;
      case "utility":
        switch (talent.boostType) {
          case "stun":
            applyStatusEffect(monstreActif.data.uniqueId, "stunned", talent.duration);
            break;
          case "heal":
          case "soin":
            setPlayerPV(Math.min(getMaxVie(window.PLAYER_LEVEL), playerPV + (talent.value || 0)));
            if (typeof afficherMessage === 'function') {
              afficherMessage(`+${talent.value || 0} PV soignés !`, "success");
            } else {
              console.log(`[HEAL] +${talent.value || 0} PV soignés.`);
            }
            break;
          case "poison":
            applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration);
            break;
          case "burn":
            applyStatusEffect(monstreActif.data.uniqueId, "burning", talent.duration);
            break;
          case "dot":
            applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, talent.value);
            break;
          case "debuff_atk":
            applyStatusEffect(monstreActif.data.uniqueId, "debuff_atk", talent.duration, talent.value);
            break;
          case "evasion":
            dashBackwards();
            setCombat(false);
            stopAllMonsters();
            setTimeout(() => {
              const currentX = getPlayerX();
              const currentY = getPlayerY();
              const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
              for (const monsterDiv of monsterElements) {
                const monstreX = Math.round(parseFloat(monsterDiv.style.left) / 64);
                const monstreY = Math.round(parseFloat(monsterDiv.style.top) / 64);
              }
            }, 100);
            if (typeof afficherMessage === 'function') {
              afficherMessage("Vous vous échappez discrètement du combat !", "success");
            } else {
              console.log("Boost d'évasion activé : Dash en arrière.");
            }
            break;
          default:
            console.warn(`[TALENT] Type utility inconnu ou non géré : ${talent.boostType}`);
            break;
        }
        break;
      case "defense":
        if (talent.defenseType === "shield") {
          applyShield(talent.value, talent.duration);
        } else if (talent.defenseType === "dot") {
          // scaling DOT sur le niveau du joueur
          const dotScaling = talent.dotScaling !== undefined ? talent.dotScaling : 0.5;
          const dotValue = Math.max(1, Math.round(talent.value + (window.PLAYER_LEVEL - 1) * dotScaling));
          applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, dotValue);
        }
        break;
    }
  }
}

// === Initialisation des talents ===
export function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  const talentsData = getTalents();
  // Ne garde que les talents effectivement débloqués (présents et valides)
  const skills = Array.isArray(talentsData)
    ? talentsData.filter(t => t && t.id && (t.niveauRequis || 1) <= window.PLAYER_LEVEL)
    : [];
  talentButtons.innerHTML = '';
  skills.forEach((talent, index) => {
    if (!talent || !talent.name) return;
    const btn = document.createElement(`button`);
    btn.id = `talent-btn-${index}`;
    btn.textContent = `${index + 1}. ${talent.name}`;
    btn.onclick = () => utiliserTalent(talent, index);
    talentButtons.appendChild(btn);
  });
}

// === Animation attaque ===
function animerAttaque() {
  const player = document.getElementById("player");
  if (!player) return;

  const frameCount = 3;
  const frameWidth = 64;
  let frame = 0;

  player.style.backgroundImage = `url(/static/img/classes/${getPlayerClass().toLowerCase()}_attack.png)`;
  player.style.backgroundSize = `${frameCount * frameWidth}px 64px`;

  const interval = setInterval(() => {
    player.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
    frame++;
    if (frame >= frameCount) {
      clearInterval(interval);
      player.style.backgroundImage = `url(/static/img/classes/${getPlayerClass().toLowerCase()}_idle.png)`;
      player.style.backgroundSize = `64px 64px`;
      player.style.backgroundPosition = `0px 0px`;
    }
  }, 100);
}

// Nouvelle fonction pour réaliser le dash arrière
export function dashBackwards() {
  // On récupère la position actuelle
  let currentX = getPlayerX();
  let currentY = getPlayerY();

  // Liste des directions autour du joueur (8 directions)
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

  // Importation dynamique pour éviter les problèmes de dépendance circulaire
  import('./map.js').then(module => {
    const { isBlocked, setPlayerPosition } = module;
    let found = false;
    for (const dir of directions) {
      const tryX = currentX + dir.dx;
      const tryY = currentY + dir.dy;
      if (!isBlocked(tryX, tryY)) {
        setPlayerPosition(tryX, tryY);
        found = true;
        console.log(`Dash effectué de (${currentX}, ${currentY}) à (${tryX}, ${tryY})`);
        break;
      }
    }
    if (!found) {
      console.log("Aucune case libre autour pour dash !");
    }
  });
}

// === Texte flottant ===
function createFloatingText(text, color) {
  const player = document.getElementById("player");
  const floatText = document.createElement("div");

  floatText.textContent = text;
  floatText.style.position = "absolute";
  floatText.style.left = player.style.left;
  floatText.style.top = player.style.top;
  floatText.style.transform = "translate(-50%, -100%)";
  floatText.style.color = color;
  floatText.style.fontWeight = "bold";
  floatText.style.zIndex = 25;
  floatText.style.pointerEvents = "none";
  floatText.style.animation = "floatUpDelayed 2s ease-out";

  document.getElementById("map-inner").appendChild(floatText);
  setTimeout(() => floatText.remove(), 2000);
}

function applyBoost(boostType, amount, duration) {
  if (boostType === "evasion") {
    console.log(`Boost d'évasion activé : libération du combat et +${amount * 100}% d'esquive temporaire.`);
    setCombat(false);
    setTimeout(() => {
      console.log("Le boost d'évasion est terminé.");
    }, duration);
  } else {
    console.log(`Boost appliqué : ${boostType} +${amount}`);
    setTimeout(() => {
      console.log(`Le boost ${boostType} est terminé.`);
    }, duration);
  }
}

function applyShield(value, duration) {
  // Active le bouclier du joueur pendant la durée indiquée
  playerShield = value;
  console.log(`Bouclier actif : absorbe ${value} PV pendant ${duration} ms.`);
  setTimeout(() => {
    playerShield = 0;
    console.log("Bouclier expiré.");
  }, duration);
}

function applyStun(monstre, duration) {
  // Optionnel : Si vous déplacez la logique d'étourdissement vers monstre.js, adaptez ici
  if (monstre) {
    monstre.stunned = true;
    setTimeout(() => {
      monstre.stunned = false;
      console.log("Le monstre n'est plus étourdi.");
    }, duration);
  }
}

function applyPoison(duration) {
  console.log(`Effet poison activé : 1 PV de dégâts par seconde pendant ${duration} ms.`);
  const poisonInterval = setInterval(() => {
    // Ici, on affecte le monstre actif en lui infligeant 1 dégât par intervalle de 1000 ms
    import('./monstre.js').then(module => {
      const monstre = module.getMonstreActif();
      if (monstre) {
        module.recevoirDegats(1);
        console.log("Poison : 1 PV de dégâts infligé au monstre.");
      }
    });
  }, 1000);
  setTimeout(() => {
    clearInterval(poisonInterval);
    console.log("Effet poison terminé.");
  }, duration);
}

export function infligerDegatsAuJoueur(valeur) {
  // Si un bouclier est actif, il absorbe une partie des dégâts
  let valeurInitiale = valeur;
  if (playerShield > 0) {
    const absorb = Math.min(playerShield, valeur);
    valeur -= absorb;
    playerShield -= absorb;
    console.log(`[COMBAT] Bouclier absorbe ${absorb} dégâts, reste: ${playerShield} PV de bouclier. Dégâts restants à appliquer: ${valeur}`);
  }
  const pvAvant = playerPV;
  setPlayerPV(Math.max(0, playerPV - valeur));
  console.log(`[COMBAT] Joueur reçoit une attaque ! Dégâts bruts=${valeurInitiale}, Dégâts après bouclier=${valeur}, PV avant=${pvAvant}, PV après=${playerPV}`);

  const player = document.getElementById("player");
  if (player) {
    player.style.filter = "brightness(50%)";
    setTimeout(() => player.style.filter = "", 300);
  }

  if (playerPV <= 0) {
    console.log("[COMBAT] Le joueur est mort.");
    setCombat(false);
    afficherGameOver();
  }
}

function afficherGameOver() {
  // Stopper toutes les attaques de monstres
  stopAllMonsters();
  const overlay = document.createElement("div");
  overlay.id = "game-over-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "999";

  const message = document.createElement("div");
  message.textContent = " R.I.P.";
  message.style.fontSize = "3em";
  message.style.color = "red";
  message.style.marginBottom = "20px";

  const bouton = document.createElement("button");
  bouton.textContent = "Retour au menu";
  bouton.onclick = () => {
    window.location.href = "/menu";
  };
  bouton.style.padding = "10px 20px";
  bouton.style.fontSize = "1.2em";
  bouton.style.backgroundColor = "#5d4037";
  bouton.style.color = "white";
  bouton.style.border = "none";
  bouton.style.borderRadius = "10px";
  bouton.style.cursor = "pointer";

  overlay.appendChild(message);
  overlay.appendChild(bouton);
  document.body.appendChild(overlay);
}

function afficherDegats(valeur) {
  const player = document.getElementById("player");
  if (!player) return;

  const texte = document.createElement("div");
  texte.textContent = `-${valeur}`;
  texte.style.position = "absolute";
  texte.style.left = player.style.left;
  texte.style.top = player.style.top;
  texte.style.transform = "translate(-50%, -100%)";
  texte.style.color = "red";
  texte.style.fontSize = "1.5em";
  texte.style.fontWeight = "bold";
  texte.style.zIndex = 20;
  texte.style.pointerEvents = "none";
  texte.style.animation = "floatUpDelayed 2s ease-out";

  document.getElementById("map-inner").appendChild(texte);

  setTimeout(() => texte.remove(), 2000);
}

export function setPlayerPV(val) {
  playerPV = val;
  window.PLAYER_VIE = val;
  updateVieBar();
}

export function setPlayerMana(val) {
  playerMana = val;
  window.PLAYER_MANA = val;
  updateManaBar();
}

export async function loadPlayerData(saveData) {
  const isNewGame = (saveData && saveData.niveau === 1 && saveData.experience === 0);
  window.PLAYER_LEVEL = (saveData && typeof saveData.niveau === 'number') ? saveData.niveau : 1;
  if (isNewGame) {
    setPlayerPV(getMaxVie(window.PLAYER_LEVEL));
    setPlayerMana(getMaxMana(window.PLAYER_LEVEL));
  } else {
    if (saveData && typeof saveData.vie === 'number') {
      setPlayerPV(saveData.vie);
    } else {
      setPlayerPV(getMaxVie(window.PLAYER_LEVEL));
    }
    if (saveData && typeof saveData.mana === 'number') {
      setPlayerMana(saveData.mana);
    } else {
      setPlayerMana(getMaxMana(window.PLAYER_LEVEL));
    }
  }
  if (saveData && typeof saveData.experience === 'number') {
    window.PLAYER_XP = saveData.experience;
    playerXP = window.PLAYER_XP;
  } else {
    window.PLAYER_XP = 0;
    playerXP = 0;
  }
  updateXPBar();
}

// Ajout : sauvegarde XP, niveau ET talents dans le format de sauvegarde
export function getPlayerSaveData() {
  return {
    vie: playerPV,
    mana: playerMana,
    experience: playerXP,
    niveau: window.PLAYER_LEVEL,
    statistiques: window.PLAYER_STATS || {},
    carte: window.PLAYER_CARTE || '',
    // autres champs si besoin
  };
}

export async function updatePlayerStats(stats) {
  try {
    const response = await fetch('/api/player/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des statistiques');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

// Classe du joueur (récupérée dynamiquement)
export function getPlayerClass() {
  return window.PLAYER_CLASS;
}

// --- Régénération automatique : toujours active sauf en combat ou game over ---
let regenInterval = null;
let isGameOver = false;

export function startRegen() {
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = setInterval(() => {
    // Arrête la régénération si pas de barre de vie/mana (ex: page index)
    const vieFill = document.getElementById("vie-fill");
    const manaFill = document.getElementById("mana-fill");
    if (!vieFill || !manaFill) {
      stopRegen();
      return;
    }
    if (isGameOver || playerPV <= 0) {
      stopRegen();
      return;
    }
    if (!combatActif) {
      let updated = false;
      // Régénération en pourcentage (ex: 2% du max toutes les 2s)
      const pvRegen = getMaxVie(window.PLAYER_LEVEL) * 0.2;
      const manaRegen = getMaxMana(window.PLAYER_LEVEL) * 0.02;
      if (playerPV < getMaxVie(window.PLAYER_LEVEL)) {
        setPlayerPV(Math.min(getMaxVie(window.PLAYER_LEVEL), playerPV + pvRegen));
        updated = true;
      }
      if (playerMana < getMaxMana(window.PLAYER_LEVEL)) {
        setPlayerMana(Math.min(getMaxMana(window.PLAYER_LEVEL), playerMana + manaRegen));
        updated = true;
      }
      if (updated) {
        console.log(`Régénération: PV=${playerPV}, Mana=${playerMana}`);
      }
    }
  }, 1000);
}

export function stopRegen() {
  if (regenInterval) clearInterval(regenInterval);
  regenInterval = null;
}

// S'assurer que startRegen N'EST APPELÉ QU'UNE FOIS au chargement du jeu
startRegen();

// Pour arrêter la régénération en cas de game over, on modifie afficherGameOver
const originalAfficherGameOver = typeof afficherGameOver === 'function' ? afficherGameOver : null;
window.afficherGameOver = function(...args) {
  isGameOver = true;
  stopRegen();
  if (originalAfficherGameOver) {
    originalAfficherGameOver.apply(this, args);
  }
};

// Appeler updateXPBar au chargement du script pour afficher la barre correctement
updateXPBar();

// On ne garde qu'une seule version de setCombat, qui met simplement à jour le flag du combat.
export function setCombat(actif) {
  combatActif = actif;
  console.log(`État du combat: ${combatActif ? "En cours" : "Terminé"}.`);
  if (!combatActif) {
    startRegen();
  } else {
    stopRegen();
  }
}
