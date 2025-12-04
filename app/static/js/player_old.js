// player.js

// === Variables exportées (globales) ===
export const playerClass = window.PLAYER_CLASS;
export const talents = window.PLAYER_TALENTS;
export let cooldowns = {};  // cooldowns[index] = nombre de tours restants
let combatActif = false;
let monstreActuel = null;
let pvMonstre = 0;
let playerPv = 100;
let playerMaxPv = 100;
let shieldValue = 0;
let shieldTurns = 0;
let damageBoost = 1;
let damageBoostTurns = 0;
let evadeTurns = 0;
let poisonOnMonster = { damage: 0, turns: 0 };
let tourEnCours = false;  // Empêche les actions pendant le tour du monstre

// === SYSTÈME DE LEVELING ===
let playerLevel = 1;
let playerXp = 0;
let playerXpToNext = 100;  // XP requis pour le prochain niveau
let playerGold = 0;
let baseDamageBonus = 0;  // Bonus de dégâts permanent par niveau
let playerPotions = 0;    // Nombre de potions de vie

// Calcul XP requis pour un niveau
function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Getters pour le leveling
export function getPlayerLevel() { return playerLevel; }
export function getPlayerXp() { return playerXp; }
export function getPlayerXpToNext() { return playerXpToNext; }
export function getPlayerGold() { return playerGold; }
export function getBaseDamageBonus() { return baseDamageBonus; }
export function getPlayerPotions() { return playerPotions; }

// Utiliser une potion de vie
export function utiliserPotion() {
  if (playerPotions <= 0) {
    console.log("❌ Pas de potion disponible !");
    return false;
  }
  if (playerPv >= playerMaxPv) {
    console.log("❌ PV déjà au maximum !");
    return false;
  }
  
  playerPotions--;
  const soin = Math.floor(playerMaxPv * 0.5);  // Soigne 50% des PV max
  playerPv = Math.min(playerPv + soin, playerMaxPv);
  
  console.log(`🧪 Potion utilisée ! +${soin} PV (Reste: ${playerPotions} potions)`);
  createFloatingText(`+${soin} PV`, "#ff88ff");
  updateHealthBar();
  updateStatsDisplay();
  return true;
}

// === Getters pour les variables de combat (nécessaire pour les modules ES6) ===
export function isCombatActif() {
  return combatActif;
}

export function getMonstreActuel() {
  return monstreActuel;
}

export function getPvMonstre() {
  return pvMonstre;
}

export function getPlayerPv() {
  return playerPv;
}

export function getPlayerMaxPv() {
  return playerMaxPv;
}

export function setPlayerPv(pv, maxPv = null) {
  playerPv = pv;
  if (maxPv !== null) playerMaxPv = maxPv;
  updateHealthBar();
}

// === Fonctions utilitaires ===
export function setCombat(actif, monstre = null, pv = 0) {
  combatActif = actif;
  monstreActuel = monstre;
  pvMonstre = pv;
  
  // Afficher/masquer l'UI de combat
  const combatUI = document.getElementById("combat-ui");
  if (combatUI) {
    combatUI.style.display = actif ? "flex" : "none";
  }
  
  // Reset tourEnCours quand un nouveau combat commence
  if (actif) {
    tourEnCours = false;
    updateTurnIndicator(true);  // Tour du joueur
    updateBuffIcons();
    console.log(`⚔️ Nouveau combat ! tourEnCours = false`);
  }
}

// === UI Combat : Indicateur de tour ===
function updateTurnIndicator(isPlayerTurn) {
  const indicator = document.getElementById("turn-indicator");
  if (!indicator) return;
  
  if (isPlayerTurn) {
    indicator.textContent = "⚔️ Votre tour";
    indicator.className = "player-turn";
  } else {
    indicator.textContent = "👹 Tour du monstre";
    indicator.className = "monster-turn";
  }
}

// === UI Combat : Icônes de buffs ===
function updateBuffIcons() {
  const container = document.getElementById("buff-icons");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Rage (boost de dégâts)
  if (damageBoostTurns > 0) {
    container.innerHTML += `<div class="buff-icon rage" title="Rage x${damageBoost}">🔥<span class="buff-turns">${damageBoostTurns}</span></div>`;
  }
  
  // Bouclier
  if (shieldTurns > 0) {
    container.innerHTML += `<div class="buff-icon shield" title="Bouclier ${shieldValue}">🛡️<span class="buff-turns">${shieldTurns}</span></div>`;
  }
  
  // Esquive
  if (evadeTurns > 0) {
    container.innerHTML += `<div class="buff-icon evade" title="Esquive">💨<span class="buff-turns">${evadeTurns}</span></div>`;
  }
  
  // Poison sur monstre
  if (poisonOnMonster.turns > 0) {
    container.innerHTML += `<div class="buff-icon poison" title="Poison ${poisonOnMonster.damage}/tour">☠️<span class="buff-turns">${poisonOnMonster.turns}</span></div>`;
  }
}

// === Fuite du combat ===
export function fuirCombat() {
  if (!combatActif || tourEnCours) return false;
  
  // 60% de chance de fuir, -10% par niveau de difficulté du monstre
  const difficulte = monstreActuel?.difficulte || 1;
  const chanceFuite = Math.max(0.2, 0.6 - difficulte * 0.05);
  
  if (Math.random() < chanceFuite) {
    console.log("🏃 Fuite réussie !");
    createFloatingText("Fuite réussie !", "#44ff44");
    
    // Nettoyer le combat
    const monstreContainer = document.getElementById("combat-monstre-container");
    if (monstreContainer) monstreContainer.remove();
    const monstreDiv = document.getElementById("combat-monstre");
    if (monstreDiv) monstreDiv.remove();
    
    // Reset
    poisonOnMonster = { damage: 0, turns: 0 };
    for (let i in cooldowns) cooldowns[i] = 0;
    tourEnCours = false;
    setCombat(false);
    updateTalentButtons();
    return true;
  } else {
    console.log("❌ Fuite échouée !");
    createFloatingText("Fuite échouée !", "#ff4444");
    
    // Le monstre attaque
    tourEnCours = true;
    updateTurnIndicator(false);
    setTimeout(() => {
      if (combatActif && monstreActuel) {
        tourDuMonstre();
      }
    }, 500);
    return false;
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
}

export function getPlayerX() {
  return playerPosition.x;
}

export function getPlayerY() {
  return playerPosition.y;
}

// === Vie du joueur ===
export function updateHealthBar() {
  const healthFill = document.getElementById("health-fill");
  if (!healthFill) return;
  const percent = (playerPv / playerMaxPv) * 100;
  healthFill.style.width = percent + "%";
  
  // Changer la couleur selon les PV restants
  if (percent <= 25) {
    healthFill.style.backgroundColor = "#ff4444";
  } else if (percent <= 50) {
    healthFill.style.backgroundColor = "#ffaa00";
  } else {
    healthFill.style.backgroundColor = "#44ff44";
  }
}

// === Utilisation d'un talent (TOUR PAR TOUR) ===
export function utiliserTalent(talent, index) {
  // Vérifier si on peut agir
  if (tourEnCours) return;
  if (cooldowns[index] && cooldowns[index] > 0) return;
  if (!combatActif || !monstreActuel) return;

  tourEnCours = true;
  animerAttaque();

  const player = document.getElementById("player");
  if (!player) return;

  // Effet visuel
  if (talent.color) {
    player.style.filter = `drop-shadow(0 0 8px ${talent.color})`;
    setTimeout(() => { player.style.filter = ""; }, 500);
  }

  // Texte flottant
  if (talent.effectText) {
    createFloatingText(talent.effectText, talent.color || "white");
  }

  // Appliquer le cooldown en tours
  if (talent.cooldown > 0) {
    cooldowns[index] = talent.cooldown;
    updateTalentButtons();
  }

  // === TRAITEMENT DU TALENT ===
  let monstreVaincu = false;
  
  switch (talent.type) {
    case "attack":
      monstreVaincu = appliquerAttaqueJoueur(talent);
      break;
      
    case "heal":
      const soin = talent.healAmount || 20;
      playerPv = Math.min(playerPv + soin, playerMaxPv);
      console.log(`💚 Vous vous soignez de ${soin} PV !`);
      createFloatingText(`+${soin} PV`, "#44ff44");
      updateHealthBar();
      break;
      
    case "shield":
      shieldValue = talent.shieldValue || 20;
      shieldTurns = talent.shieldDuration || 2;
      console.log(`🛡️ Bouclier de ${shieldValue} pour ${shieldTurns} tours !`);
      break;
      
    case "buff":
      if (talent.boostType === "damage") {
        damageBoost = talent.boostValue || 1.5;
        damageBoostTurns = talent.boostDuration || 2;
        console.log(`💪 Dégâts x${damageBoost} pour ${damageBoostTurns} tours !`);
      }
      break;
      
    case "stun":
      monstreActuel.stunned = true;
      monstreActuel.stunnedTurns = talent.stunDuration || 1;
      console.log(`⚡ ${monstreActuel.nom} est étourdi pour ${monstreActuel.stunnedTurns} tour(s) !`);
      createFloatingTextOnMonstre("ÉTOURDI!", "#FFD700");
      break;
      
    case "evade":
      evadeTurns = talent.evadeTurns || 1;
      console.log(`💨 Vous esquiverez les attaques pendant ${evadeTurns} tour(s) !`);
      break;
      
    default:
      console.warn("Type de talent inconnu :", talent.type);
  }

  // Mettre à jour les icônes de buffs
  updateBuffIcons();

  // === FIN DU TOUR DU JOUEUR ===
  if (!monstreVaincu && combatActif) {
    // Appliquer le poison sur le monstre
    if (poisonOnMonster.turns > 0) {
      setTimeout(() => appliquerPoisonMonstre(), 400);
    }
    
    // Tour du monstre après un délai
    updateTurnIndicator(false);  // Tour du monstre
    setTimeout(() => {
      if (combatActif && monstreActuel) {
        tourDuMonstre();
      }
    }, 800);
  } else {
    tourEnCours = false;
  }
}

function appliquerAttaqueJoueur(talent) {
  // Vérifier esquive du monstre
  if (monstreActuel.dodgeNext) {
    monstreActuel.dodgeNext = false;
    console.log(`💨 ${monstreActuel.nom} esquive !`);
    createFloatingTextOnMonstre("Esquive!", "#CCCCCC");
    return false;
  }
  
  // Calculer les dégâts de base + bonus de niveau
  let degats = (talent.damage || 10) + baseDamageBonus;
  
  // Appliquer le boost de dégâts temporaire (Rage, etc.)
  degats = Math.floor(degats * damageBoost);
  
  // Vérifier critique (Voleur)
  let isCrit = false;
  if (talent.critChance && Math.random() < talent.critChance) {
    degats = Math.floor(degats * (talent.critMultiplier || 2));
    isCrit = true;
    console.log(`💥 CRITIQUE !`);
  }
  
  // Réduction si monstre intangible
  if (monstreActuel.intangible) {
    degats = Math.floor(degats * (monstreActuel.intangibleValue || 0.2));
  }
  
  // Réduction si monstre a peau dure
  if (monstreActuel.damageReduction) {
    degats = Math.floor(degats * monstreActuel.damageReduction);
  }
  
  // Appliquer les dégâts
  pvMonstre = Math.max(0, pvMonstre - degats);
  console.log(`🩸 ${monstreActuel.nom} perd ${degats} PV. Reste: ${pvMonstre}`);
  
  // Mettre à jour la barre de vie du monstre
  updateMonstreHealthBar();
  
  // Effets visuels
  const monstreDiv = document.getElementById("combat-monstre");
  if (monstreDiv) {
    monstreDiv.style.filter = "brightness(150%)";
    setTimeout(() => { monstreDiv.style.filter = ""; }, 300);
  }
  createFloatingTextOnMonstre(isCrit ? `CRIT -${degats}!` : `-${degats}`, isCrit ? "#FFD700" : "#ff4444");
  
  // Appliquer effet poison si présent
  if (talent.effect === "poison" && talent.poisonDamage) {
    poisonOnMonster = { damage: talent.poisonDamage, turns: talent.poisonTurns || 3 };
    console.log(`☠️ Poison appliqué: ${poisonOnMonster.damage} dmg/tour pour ${poisonOnMonster.turns} tours`);
    createFloatingTextOnMonstre("Empoisonné!", "#32CD32");
  }
  
  // Appliquer effet slow (Mage) - le monstre passe son prochain tour
  if (talent.effect === "slow" && talent.slowDuration) {
    monstreActuel.slowed = true;
    monstreActuel.slowedTurns = talent.slowDuration || 1;
    console.log(`❄️ ${monstreActuel.nom} est ralenti pour ${monstreActuel.slowedTurns} tour(s) !`);
    createFloatingTextOnMonstre("Ralenti!", "#00BFFF");
  }
  
  // Vérifier mort du monstre
  if (pvMonstre <= 0) {
    finCombatVictoire();
    return true;
  }
  return false;
}

function appliquerPoisonMonstre() {
  if (poisonOnMonster.turns <= 0) return;
  
  pvMonstre = Math.max(0, pvMonstre - poisonOnMonster.damage);
  poisonOnMonster.turns--;
  console.log(`☠️ Poison: -${poisonOnMonster.damage} PV. Reste: ${pvMonstre}`);
  createFloatingTextOnMonstre(`☠-${poisonOnMonster.damage}`, "#32CD32");
  updateMonstreHealthBar();
  
  if (pvMonstre <= 0) {
    finCombatVictoire();
  }
}

// Mise à jour de la barre de vie du monstre
function updateMonstreHealthBar() {
  const healthFill = document.getElementById("monstre-health-fill");
  if (healthFill && monstreActuel) {
    const percent = (pvMonstre / monstreActuel.pvMax) * 100;
    healthFill.style.width = `${percent}%`;
    // Couleur selon les PV
    if (percent <= 25) {
      healthFill.style.background = "#ff0000";
    } else if (percent <= 50) {
      healthFill.style.background = "#ff6600";
    } else {
      healthFill.style.background = "#ff4444";
    }
  }
}

function tourDuMonstre() {
  // Vérifier si le monstre est étourdi
  if (monstreActuel.stunned && monstreActuel.stunnedTurns > 0) {
    monstreActuel.stunnedTurns--;
    if (monstreActuel.stunnedTurns <= 0) {
      monstreActuel.stunned = false;
    }
    console.log(`⚡ ${monstreActuel.nom} est étourdi et passe son tour !`);
    createFloatingTextOnMonstre("Étourdi...", "#FFD700");
    finTour();
    return;
  }
  
  // Vérifier si le monstre est ralenti (slow du Mage)
  if (monstreActuel.slowed && monstreActuel.slowedTurns > 0) {
    monstreActuel.slowedTurns--;
    if (monstreActuel.slowedTurns <= 0) {
      monstreActuel.slowed = false;
    }
    console.log(`❄️ ${monstreActuel.nom} est ralenti et passe son tour !`);
    createFloatingTextOnMonstre("Ralenti...", "#00BFFF");
    finTour();
    return;
  }
  
  // Le monstre attaque
  riposteMonstre();
}

function finTour() {
  console.log("🔄 Fin du tour");
  
  // Décrémenter les cooldowns
  for (let i in cooldowns) {
    if (cooldowns[i] > 0) cooldowns[i]--;
  }
  
  // Décrémenter les buffs du joueur
  if (damageBoostTurns > 0) {
    damageBoostTurns--;
    if (damageBoostTurns <= 0) {
      damageBoost = 1;
      console.log("💪 Buff de dégâts terminé");
    }
  }
  if (shieldTurns > 0) {
    shieldTurns--;
    if (shieldTurns <= 0) {
      shieldValue = 0;
      console.log("🛡️ Bouclier terminé");
    }
  }
  if (evadeTurns > 0) {
    evadeTurns--;
    if (evadeTurns <= 0) console.log("💨 Esquive terminée");
  }
  
  // Décrémenter les effets du monstre
  if (monstreActuel) {
    if (monstreActuel.intangible && monstreActuel.intangibleTurns) {
      monstreActuel.intangibleTurns--;
      if (monstreActuel.intangibleTurns <= 0) monstreActuel.intangible = false;
    }
    if (monstreActuel.damageReductionTurns) {
      monstreActuel.damageReductionTurns--;
      if (monstreActuel.damageReductionTurns <= 0) monstreActuel.damageReduction = 1;
    }
  }
  
  // IMPORTANT: Remettre tourEnCours à false AVANT updateTalentButtons
  tourEnCours = false;
  updateTurnIndicator(true);  // Retour au tour du joueur
  updateBuffIcons();
  updateTalentButtons();
  console.log("✅ Tour terminé, prêt pour le prochain");
}

function updateTalentButtons() {
  const skills = Array.isArray(talents) ? talents : talents.talents;
  skills.forEach((talent, index) => {
    const btn = document.getElementById(`talent-btn-${index}`);
    if (btn) {
      const cd = cooldowns[index] || 0;
      btn.disabled = cd > 0 || tourEnCours;
      btn.textContent = cd > 0 ? `${talent.name} (${cd})` : talent.name;
    }
  });
}

function finCombatVictoire() {
  const difficulte = monstreActuel.difficulte || 1;
  const nomMonstre = monstreActuel.nom;
  console.log(`✅ ${nomMonstre} est vaincu !`);
  
  // Supprimer le conteneur du monstre (avec barre de vie)
  const monstreContainer = document.getElementById("combat-monstre-container");
  if (monstreContainer) {
    monstreContainer.classList.add("fade-out");
    setTimeout(() => monstreContainer.remove(), 500);
  }
  // Fallback si ancien format
  const monstreDiv = document.getElementById("combat-monstre");
  if (monstreDiv && !monstreContainer) {
    monstreDiv.classList.add("fade-out");
    setTimeout(() => monstreDiv.remove(), 500);
  }
  
  // === RÉCOMPENSES ===
  const xpGagne = Math.floor(10 + difficulte * 5 + Math.random() * 10);
  const orGagne = Math.floor(5 + difficulte * 3 + Math.random() * 5);
  const pvRecup = Math.floor(5 + difficulte * 2);
  
  // Drop de potion de vie (15% + 3% par niveau de difficulté)
  const dropChance = 0.15 + difficulte * 0.03;
  const potionDropped = Math.random() < dropChance;
  if (potionDropped) {
    playerPotions++;
    console.log(`🧪 Potion de vie trouvée ! (Total: ${playerPotions})`);
  }
  
  // Appliquer les récompenses
  playerGold += orGagne;
  playerPv = Math.min(playerPv + pvRecup, playerMaxPv);
  updateHealthBar();
  
  // Gagner de l'XP et vérifier level up
  const leveledUp = gagnerXp(xpGagne);
  
  // Afficher les récompenses
  console.log(`🎁 Récompenses: +${xpGagne} XP, +${orGagne} Or, +${pvRecup} PV`);
  afficherRecompenses(xpGagne, orGagne, pvRecup, leveledUp, potionDropped);
  
  // Mettre à jour l'interface
  updateXpBar();
  updateStatsDisplay();
  
  // Reset des états de combat
  poisonOnMonster = { damage: 0, turns: 0 };
  damageBoost = 1;
  damageBoostTurns = 0;
  evadeTurns = 0;
  shieldValue = 0;
  shieldTurns = 0;
  
  // Reset cooldowns
  for (let i in cooldowns) cooldowns[i] = 0;
  
  // IMPORTANT: Reset tourEnCours AVANT tout
  tourEnCours = false;
  
  setCombat(false);
  updateTalentButtons();
  
  // Sauvegarder après chaque victoire
  sauvegarderStats();
  
  console.log("🏆 Combat terminé, prêt pour le prochain !");
}

// === SYSTÈME DE LEVELING ===
function gagnerXp(xp) {
  playerXp += xp;
  let leveledUp = false;
  
  // Vérifier si on monte de niveau
  while (playerXp >= playerXpToNext) {
    playerXp -= playerXpToNext;
    playerLevel++;
    leveledUp = true;
    
    // Bonus par niveau
    const pvBonus = 10;  // +10 PV max par niveau
    const dmgBonus = 2;  // +2 dégâts par niveau
    
    playerMaxPv += pvBonus;
    playerPv = playerMaxPv;  // Full heal au level up
    baseDamageBonus += dmgBonus;
    
    // Calculer XP requis pour le prochain niveau
    playerXpToNext = xpRequiredForLevel(playerLevel);
    
    console.log(`🎉 LEVEL UP ! Niveau ${playerLevel} !`);
    console.log(`   +${pvBonus} PV max (total: ${playerMaxPv})`);
    console.log(`   +${dmgBonus} dégâts (bonus total: ${baseDamageBonus})`);
  }
  
  return leveledUp;
}

function afficherRecompenses(xp, or, pv, leveledUp = false, potionDropped = false) {
  const rewardDiv = document.createElement('div');
  rewardDiv.id = "reward-popup";
  rewardDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9); border: 2px solid ${leveledUp ? '#00ff00' : 'gold'}; border-radius: 10px;
    padding: 20px 30px; color: white; text-align: center; z-index: 1000;
    font-family: Arial, sans-serif;
  `;
  
  let potionHtml = '';
  if (potionDropped) {
    potionHtml = `<p style="margin: 5px 0; color: #ff88ff;">🧪 +1 Potion de vie !</p>`;
  }
  
  let levelUpHtml = '';
  if (leveledUp) {
    levelUpHtml = `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #444;">
        <h3 style="color: #00ff00; margin: 0;">🎉 LEVEL UP !</h3>
        <p style="color: #00ff00; margin: 5px 0;">Niveau ${playerLevel}</p>
        <p style="color: #88ffff; margin: 5px 0; font-size: 12px;">+10 PV max | +2 Dégâts</p>
      </div>
    `;
  }
  
  rewardDiv.innerHTML = `
    <h3 style="color: gold; margin: 0 0 15px 0;">🏆 Victoire !</h3>
    <p style="margin: 5px 0; color: #88ff88;">+${xp} XP</p>
    <p style="margin: 5px 0; color: #ffdd44;">+${or} Or (Total: ${playerGold})</p>
    <p style="margin: 5px 0; color: #ff8888;">+${pv} PV récupérés</p>
    ${potionHtml}
    ${levelUpHtml}
  `;
  document.body.appendChild(rewardDiv);
  
  // Disparaît après 2.5 secondes (plus long si level up ou potion)
  const duration = leveledUp ? 3500 : (potionDropped ? 2500 : 2000);
  setTimeout(() => {
    rewardDiv.style.opacity = "0";
    rewardDiv.style.transition = "opacity 0.5s";
    setTimeout(() => rewardDiv.remove(), 500);
  }, duration);
}

// Mise à jour de la barre d'XP
function updateXpBar() {
  const xpFill = document.getElementById("xp-fill");
  if (xpFill) {
    const percent = (playerXp / playerXpToNext) * 100;
    xpFill.style.width = `${percent}%`;
  }
  const xpText = document.getElementById("xp-text");
  if (xpText) {
    xpText.textContent = `${playerXp}/${playerXpToNext}`;
  }
}

// Mise à jour de l'affichage des stats
function updateStatsDisplay() {
  const levelDisplay = document.getElementById("player-level");
  if (levelDisplay) levelDisplay.textContent = playerLevel;
  
  const goldDisplay = document.getElementById("player-gold");
  if (goldDisplay) goldDisplay.textContent = playerGold;
  
  const potionDisplay = document.getElementById("player-potions");
  if (potionDisplay) potionDisplay.textContent = playerPotions;
  
  // Activer/désactiver le bouton potion
  const potionBtn = document.getElementById("potion-btn");
  if (potionBtn) {
    potionBtn.disabled = playerPotions <= 0 || playerPv >= playerMaxPv;
  }
  
  updateHealthBar();
}

// Initialiser les stats au chargement
export function initPlayerStats(stats) {
  if (stats) {
    playerLevel = stats.level || 1;
    playerXp = stats.xp || 0;
    playerGold = stats.gold || 0;
    playerPotions = stats.potions || 0;
    baseDamageBonus = stats.damageBonus || (playerLevel - 1) * 2;
    playerMaxPv = stats.maxPv || (100 + (playerLevel - 1) * 10);
    playerPv = stats.pv || playerMaxPv;
    playerXpToNext = xpRequiredForLevel(playerLevel);
  }
  updateXpBar();
  updateStatsDisplay();
  updateHealthBar();
  
  // Démarrer la sauvegarde automatique toutes les 30 secondes
  setInterval(sauvegarderStats, 30000);
}

// === SAUVEGARDE DES STATS ===
export async function sauvegarderStats() {
  try {
    const response = await fetch('/api/save-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niveau: playerLevel,
        xp: playerXp,
        or: playerGold,
        potions: playerPotions,
        pv: playerPv,
        pvMax: playerMaxPv,
        bonusDegats: baseDamageBonus
      })
    });
    
    if (response.ok) {
      console.log("💾 Stats sauvegardées");
    }
  } catch (e) {
    console.warn("⚠️ Erreur sauvegarde:", e);
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

// === RIPOSTE DU MONSTRE ===
function riposteMonstre() {
  if (!combatActif || !monstreActuel) {
    finTour();
    return;
  }
  
  // Vérifier si le joueur esquive
  if (evadeTurns > 0) {
    console.log(`💨 Vous esquivez l'attaque de ${monstreActuel.nom} !`);
    createFloatingText("Esquive!", "#696969");
    finTour();
    return;
  }
  
  // Multiplicateur de dégâts basé sur la difficulté de la zone
  const dmgMultiplier = monstreActuel.damageMultiplier || 1;
  
  // Attaque de base du monstre (scalée par difficulté)
  const attaqueBase = monstreActuel.attaque || 5;
  const degatsAttaqueBase = Math.floor(attaqueBase * dmgMultiplier);
  
  // Probabilité d'utiliser un talent (définie par monstre)
  const talentChance = monstreActuel.talentChance || 0.3;
  const monstreTalents = monstreActuel.talents || [];
  
  // Décider si le monstre utilise un talent ou une attaque de base
  if (monstreTalents.length === 0 || Math.random() > talentChance) {
    // Attaque de base
    console.log(`⚔️ ${monstreActuel.nom} attaque !`);
    createFloatingTextOnMonstre("Attaque!", "#ffffff");
    appliquerDegatsJoueur(degatsAttaqueBase, "Attaque");
    finTour();
    return;
  }
  
  // Utiliser un talent
  const talent = monstreTalents[Math.floor(Math.random() * monstreTalents.length)];
  console.log(`🎯 ${monstreActuel.nom} utilise ${talent.nom || "un talent"} !`);
  
  // Afficher le texte d'effet du talent
  afficherEffetMonstre(talent);
  
  // Appliquer l'effet selon le type de talent
  switch (talent.type) {
    case "attack":
      // Dégâts de base scalés par la difficulté
      let degats = Math.floor((talent.damage || 5) * dmgMultiplier);
      // Vérifier critique
      if (talent.critChance && Math.random() < talent.critChance) {
        degats = Math.floor(degats * (talent.critMultiplier || 2));
        console.log(`💥 CRITIQUE !`);
        createFloatingTextOnMonstre("CRIT!", "#FFD700");
      }
      appliquerDegatsJoueur(degats, talent.nom);
      
      // Effet de brûlure (également scalé)
      if (talent.effect === "burn" && talent.burnDamage && talent.burnTicks) {
        const burnDmg = Math.floor(talent.burnDamage * dmgMultiplier);
        appliquerBrulure(burnDmg, talent.burnTicks);
      }
      break;
      
    case "debuff":
      const debuffDmg = Math.floor((talent.damage || 0) * dmgMultiplier);
      appliquerDegatsJoueur(debuffDmg, talent.nom);
      console.log(`⚠️ Debuff appliqué: ${talent.effect}`);
      break;
      
    case "defense":
      // Le monstre se défend
      if (talent.effect === "dodge_next") {
        monstreActuel.dodgeNext = true;
        console.log(`💨 ${monstreActuel.nom} se prépare à esquiver !`);
      } else if (talent.effect === "intangible") {
        monstreActuel.intangible = true;
        monstreActuel.intangibleValue = talent.effectValue || 0.2;
        monstreActuel.intangibleTurns = 2;
      } else if (talent.effect === "damage_reduce") {
        monstreActuel.damageReduction = talent.effectValue || 0.5;
        monstreActuel.damageReductionTurns = 2;
        console.log(`🛡️ ${monstreActuel.nom} réduit les dégâts reçus !`);
      }
      break;
      
    case "heal":
      // Soin scalé par la difficulté
      const soin = Math.floor((talent.healAmount || 10) * dmgMultiplier);
      pvMonstre = Math.min(pvMonstre + soin, monstreActuel.pvMax || 100);
      console.log(`💚 ${monstreActuel.nom} se soigne de ${soin} PV !`);
      createFloatingTextOnMonstre(`+${soin}`, "#44ff44");
      break;
      
    default:
      // Attaque basique par défaut (scalée)
      const defaultDmg = Math.floor((talent.damage || 5) * dmgMultiplier);
      appliquerDegatsJoueur(defaultDmg, talent.nom || "Attaque");
  }
  
  finTour();
}

function appliquerDegatsJoueur(degatsBase, nomAttaque) {
  let degatsSubis = degatsBase;
  
  // Appliquer le bouclier si actif
  if (shieldValue > 0) {
    const absorbe = Math.min(shieldValue, degatsSubis);
    shieldValue -= absorbe;
    degatsSubis -= absorbe;
    console.log(`🛡️ Bouclier absorbe ${absorbe} dégâts. Bouclier restant: ${shieldValue}`);
  }
  
  if (degatsSubis > 0) {
    playerPv = Math.max(0, playerPv - degatsSubis);
    console.log(`💥 ${monstreActuel.nom} utilise ${nomAttaque} ! Vous perdez ${degatsSubis} PV. PV restant : ${playerPv}`);
    
    // Effet visuel sur le joueur
    const player = document.getElementById("player");
    if (player) {
      player.style.filter = "brightness(50%) sepia(100%) hue-rotate(-50deg)";
      setTimeout(() => {
        player.style.filter = "";
      }, 300);
    }
    
    // Afficher les dégâts reçus
    createFloatingTextOnPlayer(`-${degatsSubis}`, "#ff4444");
    
    updateHealthBar();
    
    // Vérifier si le joueur est mort
    if (playerPv <= 0) {
      console.log("☠️ Vous êtes mort !");
      tourEnCours = false;
      setCombat(false);
      afficherGameOver();
    }
  }
}

function appliquerBrulure(damage, ticks) {
  let ticksRestants = ticks;
  const interval = setInterval(() => {
    if (!combatActif || ticksRestants <= 0) {
      clearInterval(interval);
      return;
    }
    ticksRestants--;
    playerPv = Math.max(0, playerPv - damage);
    console.log(`🔥 Brûlure ! -${damage} PV`);
    createFloatingTextOnPlayer(`🔥-${damage}`, "#FF8C00");
    updateHealthBar();
    
    if (playerPv <= 0) {
      clearInterval(interval);
      console.log("☠️ Vous êtes mort !");
      tourEnCours = false;
      setCombat(false);
      afficherGameOver();
    }
  }, 1000);
}

function afficherEffetMonstre(talent) {
  const monstreDiv = document.getElementById("combat-monstre");
  if (!monstreDiv || !talent.effectText) return;
  
  // Flash de couleur sur le monstre
  if (talent.color) {
    monstreDiv.style.filter = `drop-shadow(0 0 10px ${talent.color})`;
    setTimeout(() => {
      monstreDiv.style.filter = "";
    }, 500);
  }
  
  // Texte flottant
  createFloatingTextOnMonstre(talent.effectText, talent.color || "#ffffff");
}

function createFloatingTextOnMonstre(text, color) {
  const monstreDiv = document.getElementById("combat-monstre");
  if (!monstreDiv) return;
  
  const floatText = document.createElement("div");
  floatText.textContent = text;
  floatText.style.position = "absolute";
  floatText.style.left = monstreDiv.style.left;
  floatText.style.top = monstreDiv.style.top;
  floatText.style.transform = "translate(0%, -100%)";
  floatText.style.color = color;
  floatText.style.fontWeight = "bold";
  floatText.style.fontSize = "16px";
  floatText.style.zIndex = "30";
  floatText.style.pointerEvents = "none";
  floatText.style.textShadow = "2px 2px 2px black";
  floatText.style.animation = "floatUp 1.5s ease-out forwards";
  
  document.getElementById("map-inner").appendChild(floatText);
  setTimeout(() => floatText.remove(), 1500);
}

function createFloatingTextOnPlayer(text, color) {
  const player = document.getElementById("player");
  if (!player) return;
  
  const floatText = document.createElement("div");
  floatText.textContent = text;
  floatText.style.position = "absolute";
  floatText.style.left = player.style.left;
  floatText.style.top = player.style.top;
  floatText.style.transform = "translate(50%, -50%)";
  floatText.style.color = color;
  floatText.style.fontWeight = "bold";
  floatText.style.fontSize = "20px";
  floatText.style.zIndex = "30";
  floatText.style.pointerEvents = "none";
  floatText.style.textShadow = "2px 2px 2px black";
  floatText.style.animation = "floatUp 1s ease-out forwards";
  
  document.getElementById("map-inner").appendChild(floatText);
  setTimeout(() => floatText.remove(), 1000);
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
  overlay.style.zIndex = "1000";
  
  const title = document.createElement("h1");
  title.textContent = "GAME OVER";
  title.style.color = "#ff4444";
  title.style.fontSize = "48px";
  title.style.marginBottom = "20px";
  
  const btn = document.createElement("button");
  btn.textContent = "Retour au menu";
  btn.style.padding = "15px 30px";
  btn.style.fontSize = "18px";
  btn.style.cursor = "pointer";
  btn.onclick = () => window.location.href = "/menu";
  
  overlay.appendChild(title);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}
