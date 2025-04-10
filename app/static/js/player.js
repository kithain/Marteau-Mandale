// player.js

// === Variables exportées (globales) ===
export const playerClass = window.PLAYER_CLASS;
export const talents = window.PLAYER_TALENTS;
export let playerMana = 100;
export const maxMana = 100;
export let playerPV = 10;
export const maxPV = 10;
export let cooldowns = {};
export let combatActif = false;

// Importation de la fonction qui gère les dégâts sur le monstre (centralisée dans monstre.js)
import { recevoirDegats } from './monstre.js';

// On ne garde qu'une seule version de setCombat, qui met simplement à jour le flag du combat.
export function setCombat(actif) {
  combatActif = actif;
  console.log(`État du combat: ${combatActif ? "En cours" : "Terminé"}.`);
}

// === Position du joueur ===
const playerPosition = { x: 0, y: 0 };

export function getPlayerPosition() {
  return { ...playerPosition };
}

export function setPlayerPosition(x, y) {
  playerPosition.x = x;
  playerPosition.y = y;
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
  const percent = (playerMana / maxMana) * 100;
  manaFill.style.width = percent + "%";
}

export function updateVieBar() {
  const vieFill = document.getElementById("vie-fill");
  const percent = (playerPV / maxPV) * 100;
  vieFill.style.width = percent + "%";
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
  if (talent.color) {
    player.style.filter = `drop-shadow(0 0 6px ${talent.color})`;
    setTimeout(() => {
      player.style.filter = "";
    }, 500);
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
  // Application des effets en combat
  if (combatActif) {
    switch (talent.type) {
      case "attack":
        recevoirDegats(talent.damage);
        break;
      case "utility":
        if (talent.boostType === "evasion") {
          // Plutôt que d'annuler le combat, le joueur dèche d'une case en arrière
          console.log(`Boost d'évasion activé : Dash en arrière.`);
          dashBackwards();
          setCombat(false);
          // Le boost peut perdurer pour un effet temporaire si besoin
          setTimeout(() => {
            console.log("Le boost d'évasion est terminé.");
          }, talent.duration);
        } else {
          console.log(`Boost appliqué : ${talent.boostType} +${talent.boostAmount}`);
          setTimeout(() => {
            console.log(`Le boost ${talent.boostType} est terminé.`);
          }, talent.duration);
        }
        break;
      case "defense":
        if (talent.defenseType === "shield") {
          console.log(`Bouclier actif : absorbe ${talent.value} points de dégâts pendant ${talent.duration} ms`);
          applyShield(talent.value, talent.duration);
        } else if (talent.defenseType === "stun") {
          console.log(`Tentative d'étourdir le monstre pendant ${talent.duration} ms`);
          // Ajouter ici une logique d'étourdissement si souhaité
        }
        break;
      default:
        console.warn("Type de talent inconnu :", talent);
    }
  }
}


// === Initialisation des talents ===
export function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  const skills = Array.isArray(talents) ? talents : talents.talents;
  skills.forEach((talent, index) => {
    const btn = document.createElement('button');
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

  player.style.backgroundImage = `url(/static/img/classes/${playerClass.toLowerCase()}_attack.png)`;
  player.style.backgroundSize = `${frameCount * frameWidth}px 64px`;

  const interval = setInterval(() => {
    player.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
    frame++;
    if (frame >= frameCount) {
      clearInterval(interval);
      player.style.backgroundImage = `url(/static/img/classes/${playerClass.toLowerCase()}_idle.png)`;
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

  // Utilisation de la dernière direction stockée globalement (dans window.lastMoveDirection)
  let direction = window.lastMoveDirection || 'ArrowLeft';
  let newX = currentX;
  let newY = currentY;

  switch(direction) {
    case 'ArrowUp':
      newY = currentY + 1;
      break;
    case 'ArrowDown':
      newY = currentY - 1;
      break;
    case 'ArrowLeft':
      newX = currentX + 1;
      break;
    case 'ArrowRight':
      newX = currentX - 1;
      break;
    default:
      newX = currentX + 1;
      break;
  }

  // Optionnel : vérifier que le nouveau positionnement est dans les limites de la carte ou pas bloqué
  setPlayerPosition(newX, newY);
  
  // Pour mettre à jour la position dans l'interface, on appelle movePlayer.
  // Ici, nous importons movePlayer depuis map.js.
  import('./map.js').then(module => {
    module.movePlayer();
  });

  console.log(`Dash effectué de (${currentX}, ${currentY}) à (${newX}, ${newY})`);
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
  console.log(`Bouclier de ${value} points activé pendant ${duration} ms.`);
  setTimeout(() => {
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

export function infligerDegatsAuJoueur(valeur) {
  playerPV = Math.max(0, playerPV - valeur);
  updateVieBar();
  afficherDegats(valeur);

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
  message.textContent = "💀 R.I.P.💀";
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
