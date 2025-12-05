// player.js
// Ce fichier agit maintenant comme le "Contrôleur" du jeu.
// Il gère l'état global et orchestre les interactions entre le moteur de combat, l'UI et l'API.

import { COLORS, GAME_BALANCE, DELAYS } from './constants.js';
import * as UI from './ui_manager.js';
import * as CombatEngine from './combat_engine.js';
import * as API from './api_client.js';

// === ETAT GLOBAL ===
export const playerClass = window.PLAYER_CLASS;
export const talents = window.PLAYER_TALENTS;
export let cooldowns = {};

let combatActif = false;
let monstreActuel = null;
let pvMonstre = 0;

let playerPv = 100;
let playerMaxPv = 100;
let playerLevel = 1;
let playerXp = 0;
let playerXpToNext = 100;
// playerGold supprimé
let playerPotions = 0;
let baseDamageBonus = 0;

// Buffs & Status
let shieldValue = 0;
let shieldTurns = 0;
let damageBoost = 1;
let damageBoostTurns = 0;
let evadeTurns = 0;
let poisonOnMonster = { damage: 0, turns: 0 };
let tourEnCours = false;

let currentMapName = "P1"; // Valeur par défaut, sera mise à jour par map.js
const playerPosition = { x: 0, y: 0 };

// === GETTERS (pour map.js ou autres) ===
export function getPlayerLevel() { return playerLevel; }
export function getPlayerXp() { return playerXp; }
export function getPlayerXpToNext() { return playerXpToNext; }
// getPlayerGold supprimé
export function getBaseDamageBonus() { return baseDamageBonus; }
export function getPlayerPotions() { return playerPotions; }
export function isCombatActif() { return combatActif; }
export function getMonstreActuel() { return monstreActuel; }
export function getPvMonstre() { return pvMonstre; }
export function getPlayerPv() { return playerPv; }
export function getPlayerMaxPv() { return playerMaxPv; }
export function getPlayerPosition() { return { ...playerPosition }; }
export function getPlayerX() { return playerPosition.x; }
export function getPlayerY() { return playerPosition.y; }

export function setPlayerPosition(x, y) {
  playerPosition.x = x;
  playerPosition.y = y;
}

export function setPlayerMap(mapName) {
  currentMapName = mapName;
}

export function setPlayerPv(pv, maxPv = null) {
  playerPv = pv;
  if (maxPv !== null) playerMaxPv = maxPv;
  UI.updateHealthBar(playerPv, playerMaxPv);
}

// Fonction de compatibilité pour main.js (appel sans arguments pour rafraîchir l'UI)
export function updateHealthBar() {
  UI.updateHealthBar(playerPv, playerMaxPv);
}

// === INITIALISATION ===

export function initPlayerStats(stats) {
  if (stats) {
    playerLevel = stats.level || 1;
    playerXp = stats.xp || 0;
    playerPotions = Math.min(stats.potions || 0, GAME_BALANCE.MAX_POTIONS); // Cap à l'init
    baseDamageBonus = stats.damageBonus || (playerLevel - 1) * GAME_BALANCE.LEVEL_DMG_BONUS;
    playerMaxPv = stats.maxPv || (100 + (playerLevel - 1) * GAME_BALANCE.LEVEL_PV_BONUS);
    playerPv = stats.pv || playerMaxPv;
    playerXpToNext = CombatEngine.xpRequiredForLevel(playerLevel);
  }
  
  updateAllUI();
  
  // Autosave
  setInterval(sauvegarderStats, 30000);
}

export function initialiserTalents() {
  UI.initTalentButtons(talents, utiliserTalent, playerLevel);
}

function updateAllUI() {
  // Calcul des dégâts affichés (approximation pour l'UI : dégâts de base + bonus)
  // On pourrait affiner en prenant la moyenne des attaques disponibles
  const displayedDamage = 10 + baseDamageBonus; 

  UI.updateXpBar(playerXp, playerXpToNext);
  UI.updateStatsDisplay(playerLevel, playerPotions, playerPv, playerMaxPv, displayedDamage);
  UI.updateHealthBar(playerPv, playerMaxPv);
}

// === ACTIONS JOUEUR ===

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
  const soin = Math.floor(playerMaxPv * GAME_BALANCE.POTION_HEAL_RATIO);
  playerPv = Math.min(playerPv + soin, playerMaxPv);
  
  console.log(`🧪 Potion utilisée ! +${soin} PV`);
  UI.createFloatingText(`+${soin} PV`, COLORS.POTION_TEXT);
  updateAllUI();
  return true;
}

export function fuirCombat() {
  if (!combatActif || tourEnCours) return false;
  
  const difficulte = monstreActuel?.difficulte || 1;
  const success = CombatEngine.checkFleeSuccess(difficulte);
  
  if (success) {
    console.log("🏃 Fuite réussie !");
    UI.createFloatingText("Fuite réussie !", COLORS.HEALTH_HIGH);
    UI.removeMonstreUI();
    resetCombatState();
    return true;
  } else {
    console.log("❌ Fuite échouée !");
    UI.createFloatingText("Fuite échouée !", COLORS.HEALTH_LOW);
    
    tourEnCours = true;
    UI.updateTurnIndicator(false);
    setTimeout(() => {
      if (combatActif && monstreActuel) {
        tourDuMonstre();
      }
    }, 500);
    return false;
  }
}

// === COMBAT ===

export function setCombat(actif, monstre = null, pv = 0) {
  combatActif = actif;
  monstreActuel = monstre;
  pvMonstre = pv;
  
  UI.toggleCombatUI(actif);
  
  if (actif) {
    tourEnCours = false;
    UI.updateTurnIndicator(true);
    UI.updateBuffIcons(damageBoostTurns, damageBoost, shieldTurns, shieldValue, evadeTurns, poisonOnMonster);
    console.log(`⚔️ Nouveau combat !`);
    UI.afficherDebutCombat();
  }
}

export function utiliserTalent(talent, index) {
  if (tourEnCours) return;
  if (cooldowns[index] && cooldowns[index] > 0) return;
  if (!combatActif || !monstreActuel) return;

  tourEnCours = true;
  UI.applyPlayerAttackAnim(playerClass);

  // Feedback visuel
  if (talent.effectText) {
    UI.createFloatingText(talent.effectText, talent.color || "white");
  }

  // Cooldown
  if (talent.cooldown > 0) {
    cooldowns[index] = talent.cooldown;
    UI.updateTalentButtons(talents, cooldowns, tourEnCours);
  }

  // === LOGIQUE TALENT ===
  let monstreVaincu = false;

  switch (talent.type) {
    case "attack":
      monstreVaincu = executerAttaqueJoueur(talent);
      break;

    case "heal":
      const soin = talent.healAmount || 20;
      playerPv = Math.min(playerPv + soin, playerMaxPv);
      UI.createFloatingText(`+${soin} PV`, COLORS.TEXT_HEAL);
      UI.updateHealthBar(playerPv, playerMaxPv);
      break;

    case "shield":
      shieldValue = talent.shieldValue || 20;
      shieldTurns = talent.shieldDuration || 2;
      break;

    case "buff":
      if (talent.boostType === "damage") {
        damageBoost = talent.boostValue || 1.5;
        damageBoostTurns = talent.boostDuration || 2;
      }
      break;

    case "stun":
      monstreActuel.stunned = true;
      monstreActuel.stunnedTurns = talent.stunDuration || 1;
      UI.createFloatingTextOnMonstre("ÉTOURDI!", COLORS.TEXT_STUN);
      break;

    case "evade":
      evadeTurns = talent.evadeTurns || 1;
      break;

    default:
      console.warn("Type de talent inconnu :", talent.type);
  }

  UI.updateBuffIcons(damageBoostTurns, damageBoost, shieldTurns, shieldValue, evadeTurns, poisonOnMonster);

  if (!monstreVaincu && combatActif) {
    if (poisonOnMonster.turns > 0) {
      setTimeout(() => appliquerPoisonMonstre(), 400);
    }
    
    UI.updateTurnIndicator(false);
    setTimeout(() => {
      if (combatActif && monstreActuel) {
        tourDuMonstre();
      }
    }, DELAYS.TURN_MONSTER);
  } else {
    tourEnCours = false;
  }
}

function executerAttaqueJoueur(talent) {
  if (monstreActuel.dodgeNext) {
    monstreActuel.dodgeNext = false;
    UI.createFloatingTextOnMonstre("Esquive!", COLORS.TEXT_DODGE);
    return false;
  }

  const isCrit = talent.critChance && Math.random() < talent.critChance;
  let damage = CombatEngine.calculatePlayerDamage(
      talent.damage || 10,
      baseDamageBonus,
      damageBoost,
      isCrit,
      monstreActuel
  );

  if (isCrit) {
      damage = Math.floor(damage * (talent.critMultiplier || 2));
  }

  pvMonstre = Math.max(0, pvMonstre - damage);
  UI.updateMonstreHealthBar(pvMonstre, monstreActuel.pvMax);
  
  // Feedback
  const color = isCrit ? COLORS.TEXT_CRIT : COLORS.TEXT_DAMAGE_MONSTER;
  const text = isCrit ? `CRIT -${damage}!` : `-${damage}`;
  UI.createFloatingTextOnMonstre(text, color);

  // Side Effects
  if (talent.effect === "poison" && talent.poisonDamage) {
    poisonOnMonster = { damage: talent.poisonDamage, turns: talent.poisonTurns || 3 };
    UI.createFloatingTextOnMonstre("Empoisonné!", COLORS.TEXT_POISON);
  }
  if (talent.effect === "slow" && talent.slowDuration) {
    monstreActuel.slowed = true;
    monstreActuel.slowedTurns = talent.slowDuration || 1;
    UI.createFloatingTextOnMonstre("Ralenti!", COLORS.TEXT_SLOW);
  }

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
  
  UI.createFloatingTextOnMonstre(`☠-${poisonOnMonster.damage}`, COLORS.TEXT_POISON);
  UI.updateMonstreHealthBar(pvMonstre, monstreActuel.pvMax);
  UI.updateBuffIcons(damageBoostTurns, damageBoost, shieldTurns, shieldValue, evadeTurns, poisonOnMonster);

  if (pvMonstre <= 0) {
    finCombatVictoire();
  }
}

function tourDuMonstre() {
  // Stun check
  if (monstreActuel.stunned && monstreActuel.stunnedTurns > 0) {
    monstreActuel.stunnedTurns--;
    if (monstreActuel.stunnedTurns <= 0) monstreActuel.stunned = false;
    UI.createFloatingTextOnMonstre("Étourdi...", COLORS.TEXT_STUN);
    finTour();
    return;
  }

  // Slow check
  if (monstreActuel.slowed && monstreActuel.slowedTurns > 0) {
    monstreActuel.slowedTurns--;
    if (monstreActuel.slowedTurns <= 0) monstreActuel.slowed = false;
    UI.createFloatingTextOnMonstre("Ralenti...", COLORS.TEXT_SLOW);
    finTour();
    return;
  }

  // Action monstre
  // Pour simplifier, on appelle riposteMonstre qui gère la logique
  riposteMonstre();
}

function riposteMonstre() {
  if (!combatActif || !monstreActuel) {
    finTour();
    return;
  }

  if (evadeTurns > 0) {
    UI.createFloatingText("Esquive!", COLORS.TEXT_DODGE);
    finTour();
    return;
  }

  // IA Simple : Talent ou Attaque
  const talentChance = monstreActuel.talentChance || 0.3;
  const monstreTalents = monstreActuel.talents || [];

  if (monstreTalents.length > 0 && Math.random() < talentChance) {
    const talent = monstreTalents[Math.floor(Math.random() * monstreTalents.length)];
    // Afficher skill
    if (talent.effectText) UI.createFloatingTextOnMonstre(talent.effectText, talent.color || "white");
    
    executerTalentMonstre(talent);
  } else {
    // Attaque de base
    const dmgInfo = CombatEngine.calculateMonsterDamage(monstreActuel, monstreActuel.difficulte, shieldValue);
    appliquerDegatsSubis(dmgInfo.damage, dmgInfo.absorbed, "Attaque");
  }
  
  finTour();
}

function executerTalentMonstre(talent) {
  const diff = monstreActuel.difficulte || 1;
  const multiplier = monstreActuel.damageMultiplier || 1;

  switch(talent.type) {
      case "attack":
          let dmg = Math.floor((talent.damage || 5) * multiplier);
          // Crit simple check
          if (talent.critChance && Math.random() < talent.critChance) {
              dmg *= (talent.critMultiplier || 2);
              UI.createFloatingTextOnMonstre("CRIT!", COLORS.TEXT_CRIT);
          }
          
          const dmgInfo = { damage: dmg, absorbed: 0 };
          if (shieldValue > 0) {
            dmgInfo.absorbed = Math.min(shieldValue, dmg);
            dmgInfo.damage -= dmgInfo.absorbed;
            shieldValue -= dmgInfo.absorbed;
          }
          
          appliquerDegatsSubis(dmgInfo.damage, dmgInfo.absorbed, talent.nom);
          
          if (talent.effect === "burn" && talent.burnDamage) {
             appliquerBrulure(Math.floor(talent.burnDamage * multiplier), talent.burnTicks || 3);
          }
          break;
          
      case "heal":
          const soin = Math.floor((talent.healAmount || 10) * multiplier);
          pvMonstre = Math.min(pvMonstre + soin, monstreActuel.pvMax);
          UI.createFloatingTextOnMonstre(`+${soin}`, COLORS.TEXT_HEAL);
          UI.updateMonstreHealthBar(pvMonstre, monstreActuel.pvMax);
          break;
          
      case "defense":
          if (talent.effect === "dodge_next") monstreActuel.dodgeNext = true;
          if (talent.effect === "intangible") {
               monstreActuel.intangible = true;
               monstreActuel.intangibleValue = talent.effectValue || 0.2;
               monstreActuel.intangibleTurns = 2;
          }
          break;
          
      default:
          // Fallback as attack
          appliquerDegatsSubis(Math.floor((talent.damage||5)*multiplier), 0, talent.nom);
  }
}

function appliquerDegatsSubis(damage, absorbed, sourceName) {
    if (absorbed > 0) {
        console.log(`Bouclier absorbe ${absorbed}`);
    }
    
    if (damage > 0) {
        playerPv = Math.max(0, playerPv - damage);
        UI.createFloatingTextOnPlayer(`-${damage}`, COLORS.TEXT_DAMAGE_PLAYER);
        UI.updateHealthBar(playerPv, playerMaxPv);
        
        if (playerPv <= 0) {
            tourEnCours = false;
            setCombat(false);
            UI.afficherGameOver();
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
        UI.createFloatingTextOnPlayer(`🔥-${damage}`, COLORS.TEXT_BURN);
        UI.updateHealthBar(playerPv, playerMaxPv);
        
        if (playerPv <= 0) {
            clearInterval(interval);
            tourEnCours = false;
            setCombat(false);
            UI.afficherGameOver();
        }
    }, 1000);
}

function finTour() {
    // Decrement cooldowns
    for (let i in cooldowns) {
        if (cooldowns[i] > 0) cooldowns[i]--;
    }
    
    // Decrement buffs
    if (damageBoostTurns > 0) damageBoostTurns--;
    if (damageBoostTurns <= 0) damageBoost = 1;
    
    if (shieldTurns > 0) shieldTurns--;
    if (shieldTurns <= 0) shieldValue = 0;
    
    if (evadeTurns > 0) evadeTurns--;
    
    // Decrement monster effects
    if (monstreActuel) {
        if (monstreActuel.intangibleTurns) {
            monstreActuel.intangibleTurns--;
            if (monstreActuel.intangibleTurns <= 0) monstreActuel.intangible = false;
        }
    }
    
    tourEnCours = false;
    UI.updateTurnIndicator(true);
    UI.updateBuffIcons(damageBoostTurns, damageBoost, shieldTurns, shieldValue, evadeTurns, poisonOnMonster);
    UI.updateTalentButtons(talents, cooldowns, tourEnCours, utiliserTalent);
}

function finCombatVictoire() {
    UI.removeMonstreUI();
    
    const rewards = CombatEngine.processRewards(monstreActuel.difficulte || 1);
    
    if (rewards.potion) playerPotions++;
    
    // Or supprimé
    playerPv = Math.min(playerPv + rewards.pv, playerMaxPv);
    
    const leveledUp = gagnerXp(rewards.xp);
    
    if (leveledUp) {
        initialiserTalents();
    }
    
    UI.afficherRecompenses(rewards.xp, rewards.pv, leveledUp, rewards.potion, playerLevel);
    updateAllUI();
    
    resetCombatState();
    sauvegarderStats();
}

function resetCombatState() {
    poisonOnMonster = { damage: 0, turns: 0 };
    damageBoost = 1; damageBoostTurns = 0;
    evadeTurns = 0; shieldValue = 0; shieldTurns = 0;
    for (let i in cooldowns) cooldowns[i] = 0;
    tourEnCours = false;
    
    setCombat(false);
    UI.updateTalentButtons(talents, cooldowns, tourEnCours, utiliserTalent);
}

function gagnerXp(amount) {
    playerXp += amount;
    let leveledUp = false;
    while (playerXp >= playerXpToNext) {
        playerXp -= playerXpToNext;
        playerLevel++;
        leveledUp = true;
        
        playerMaxPv += GAME_BALANCE.LEVEL_PV_BONUS;
        playerPv = playerMaxPv;
        baseDamageBonus += GAME_BALANCE.LEVEL_DMG_BONUS;
        
        playerXpToNext = CombatEngine.xpRequiredForLevel(playerLevel);
    }
    return leveledUp;
}

export async function sauvegarderStats() {
    const stats = {
        niveau: playerLevel,
        xp: playerXp,
        // or supprimé
        potions: playerPotions,
        pv: playerPv,
        pvMax: playerMaxPv,
        bonusDegats: baseDamageBonus,
        position: playerPosition,
        carte: currentMapName
    };
    await API.saveStatsToBackend(stats);
}
