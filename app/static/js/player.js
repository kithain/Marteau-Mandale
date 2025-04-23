// player.js

// === Variables exportées (globales) ===
export let playerMana = 10;
export let playerPV = 10;
export let cooldowns = {};
export let combatActif = false;
export let playerShield = 0;

// === XP et Niveau ===
export let playerXP = 0;
export let playerLevel = 1;
export let xpToNextLevel = 100;

import { getMaxVie, getMaxMana } from './progression.js';
import { getPlayerBaseAtk, filterTalentsByLevel } from './progression.js';
import { recevoirDegats, getMonstreActif, applyStatusEffect, stopAllMonsters } from './monstre.js';

// Lecture dynamique des talents depuis la page
export function getTalents() {
  return window.PLAYER_TALENTS || [];
}

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
  const percent = (playerMana / getMaxMana(playerLevel)) * 100;
  manaFill.style.width = percent + "%";
}

export function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  if (!vieFill) return;
  const percent = (playerPV / getMaxVie(playerLevel)) * 100;
  vieFill.style.width = percent + "%";
}

// === XP ===
export function gainXP(amount) {
  playerXP += amount;
  while (playerXP >= xpToNextLevel) {
    levelUp();
  }
  updateXPBar();
}

export function levelUp() {
  playerXP -= xpToNextLevel;
  playerLevel += 1;
  xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  // Ici, tu peux ajouter des effets : augmenter les stats, afficher un message, etc.
  createFloatingText(`Niveau ${playerLevel} !`, '#FFD700');
  initialiserTalents();
}

export function updateXPBar() {
  const xpFill = document.getElementById("xp-fill");
  if (!xpFill) return;
  const percent = (playerXP / xpToNextLevel) * 100;
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
      console.log(`[DEBUG] Talent zone détecté (\"${talent.zone}\"), appel de recevoirDegats pour tous les monstres autour`);
      import('./monstre.js').then(module => {
        let degats = talent.damage;
        if ((talent.niveauRequis || 1) === 1) {
          degats = getPlayerBaseAtk(playerLevel);
        }
        module.recevoirDegats(degats);
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
          degats = getPlayerBaseAtk(playerLevel);
        }
        recevoirDegats(degats, monstreActif.data.uniqueId);
        break;
      case "utility":
        if (talent.boostType === "stun") {
          applyStatusEffect(monstreActif.data.uniqueId, "stunned", talent.duration);
        } else if (talent.boostType === "poison") {
          applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration);
        } else if (talent.boostType === "burn") {
          applyStatusEffect(monstreActif.data.uniqueId, "burning", talent.duration);
        } else if (talent.boostType === "dot") {
          applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration);
        } else if (talent.boostType === "evasion") {
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
        } else if (talent.boostType === "debuff_atk") {
          applyStatusEffect(monstreActif.data.uniqueId, "debuff_atk", talent.duration, talent.value);
        }
        break;
      case "defense":
        if (talent.defenseType === "shield") {
          applyShield(talent.value, talent.duration);
        } else if (talent.defenseType === "dot") {
          applyStatusEffect(monstreActif.data.uniqueId, "poisoned", talent.duration, talent.value);
        }
        break;
    }
  }
}

// === Initialisation des talents ===
export function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  const talentsData = getTalents();
  const allTalents = Array.isArray(talentsData) ? talentsData : talentsData.talents;
  const skills = filterTalentsByLevel(allTalents, playerLevel);
  talentButtons.innerHTML = '';
  skills.forEach((talent, index) => {
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
  if (playerShield > 0) {
    const absorb = Math.min(playerShield, valeur);
    valeur -= absorb;
    playerShield -= absorb;
    console.log(`Bouclier absorbe ${absorb} dégâts, reste: ${playerShield} PV de bouclier.`);
  }
  
  setPlayerPV(Math.max(0, playerPV - valeur));
  console.log(`Le joueur reçoit ${valeur} dégâts. PV restant: ${playerPV}`);

  const player = document.getElementById("player");
  if (player) {
    player.style.filter = "brightness(50%)";
    setTimeout(() => player.style.filter = "", 300);
  }

  if (playerPV <= 0) {
    console.log("Le joueur est mort.");
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
  playerLevel = (saveData && typeof saveData.niveau === 'number') ? saveData.niveau : 1;

  if (isNewGame) {
    setPlayerPV(getMaxVie(playerLevel));
    setPlayerMana(getMaxMana(playerLevel));
  } else {
    if (saveData && typeof saveData.vie === 'number') {
      setPlayerPV(saveData.vie);
    } else {
      setPlayerPV(getMaxVie(playerLevel));
    }
    if (saveData && typeof saveData.mana === 'number') {
      setPlayerMana(saveData.mana);
    } else {
      setPlayerMana(getMaxMana(playerLevel));
    }
  }
  // Ajout : chargement XP et niveau
  if (saveData && typeof saveData.experience === 'number') {
    playerXP = saveData.experience;
  } else {
    playerXP = 0;
  }
  updateXPBar();
}

// Ajout : sauvegarde XP et niveau dans le format de sauvegarde
export function getPlayerSaveData() {
  return {
    vie: playerPV,
    mana: playerMana,
    experience: playerXP,
    niveau: playerLevel,
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
      const pvRegen = getMaxVie(playerLevel) * 0.02;
      const manaRegen = getMaxMana(playerLevel) * 0.02;
      if (playerPV < getMaxVie(playerLevel)) {
        setPlayerPV(Math.min(getMaxVie(playerLevel), playerPV + pvRegen));
        updated = true;
      }
      if (playerMana < getMaxMana(playerLevel)) {
        setPlayerMana(Math.min(getMaxMana(playerLevel), playerMana + manaRegen));
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
