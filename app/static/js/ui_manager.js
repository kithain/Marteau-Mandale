// ui_manager.js
import { COLORS, DELAYS } from './constants.js';

export function updateHealthBar(currentPv, maxPv) {
    const healthFill = document.getElementById("health-fill");
    if (!healthFill) return;
    
    const percent = Math.max(0, Math.min(100, (currentPv / maxPv) * 100));
    healthFill.style.width = percent + "%";
    
    // Couleur selon les PV restants
    if (percent <= 25) {
      healthFill.style.backgroundColor = COLORS.HEALTH_LOW;
    } else if (percent <= 50) {
      healthFill.style.backgroundColor = COLORS.HEALTH_MED;
    } else {
      healthFill.style.backgroundColor = COLORS.HEALTH_HIGH;
    }
}

export function updateMonstreHealthBar(currentPv, maxPv) {
    const healthFill = document.getElementById("monstre-health-fill");
    if (healthFill) {
      const percent = Math.max(0, Math.min(100, (currentPv / maxPv) * 100));
      healthFill.style.width = `${percent}%`;
      
      if (percent <= 25) {
        healthFill.style.background = "#ff0000"; // TODO: use constant if needed, slightly different red
      } else if (percent <= 50) {
        healthFill.style.background = "#ff6600";
      } else {
        healthFill.style.background = COLORS.HEALTH_LOW; // Monstre barre rouge de base
      }
    }
}

export function createFloatingText(text, color, targetElementId = "player") {
    const target = document.getElementById(targetElementId);
    if (!target) return;
    
    const floatText = document.createElement("div");
    floatText.textContent = text;
    floatText.style.position = "absolute";
    floatText.style.left = target.style.left;
    floatText.style.top = target.style.top;
    floatText.style.transform = "translate(-50%, -100%)";
    floatText.style.color = color;
    floatText.style.fontWeight = "bold";
    floatText.style.zIndex = 25;
    floatText.style.pointerEvents = "none";
    floatText.style.animation = "floatUpDelayed 2s ease-out"; // Need to check if CSS animation exists for this class
  
    document.getElementById("map-inner").appendChild(floatText);
    setTimeout(() => floatText.remove(), DELAYS.FLOAT_TEXT);
}

export function createFloatingTextOnMonstre(text, color) {
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

export function createFloatingTextOnPlayer(text, color) {
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

export function updateTurnIndicator(isPlayerTurn) {
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

export function updateBuffIcons(damageBoostTurns, damageBoost, shieldTurns, shieldValue, evadeTurns, poisonOnMonster) {
    const container = document.getElementById("buff-icons");
    if (!container) return;
    
    container.innerHTML = "";
    
    // Rage
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
    // Poison
    if (poisonOnMonster.turns > 0) {
      container.innerHTML += `<div class="buff-icon poison" title="Poison ${poisonOnMonster.damage}/tour">☠️<span class="buff-turns">${poisonOnMonster.turns}</span></div>`;
    }
}

export function updateTalentButtons(talents, cooldowns, tourEnCours, callbackUtiliserTalent) {
    const skills = Array.isArray(talents) ? talents : talents.talents;
    skills.forEach((talent, index) => {
      const btn = document.getElementById(`talent-btn-${index}`);
      if (btn) {
        const cd = cooldowns[index] || 0;
        btn.disabled = cd > 0 || tourEnCours;
        btn.textContent = cd > 0 ? `${talent.name} (${cd})` : talent.name;
        
        // On réattache l'event listener si besoin, mais idéalement il est attaché une fois à l'init
        // Ici on ne fait que mettre à jour l'état
      }
    });
}

export function initTalentButtons(talents, callbackUtiliserTalent) {
    const talentButtons = document.getElementById('talents-buttons');
    if (!talentButtons) return;
    talentButtons.innerHTML = ""; // Clean previous

    const skills = Array.isArray(talents) ? talents : talents.talents;
    skills.forEach((talent, index) => {
      const btn = document.createElement('button');
      btn.id = `talent-btn-${index}`;
      btn.textContent = `${index + 1}. ${talent.name}`;
      btn.onclick = () => callbackUtiliserTalent(talent, index);
      talentButtons.appendChild(btn);
    });
}

export function updateXpBar(playerXp, playerXpToNext) {
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

export function updateStatsDisplay(playerLevel, playerPotions, playerPv, playerMaxPv) {
    const levelDisplay = document.getElementById("player-level");
    if (levelDisplay) levelDisplay.textContent = playerLevel;
    
    // Or supprimé
    
    const potionDisplay = document.getElementById("player-potions");
    if (potionDisplay) potionDisplay.textContent = playerPotions;
    
    const potionBtn = document.getElementById("potion-btn");
    if (potionBtn) {
      potionBtn.disabled = playerPotions <= 0 || playerPv >= playerMaxPv;
    }
}

export function afficherRecompenses(xp, pv, leveledUp, potionDropped, playerLevel) {
    const rewardDiv = document.createElement('div');
    rewardDiv.id = "reward-popup";
    rewardDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9); border: 2px solid ${leveledUp ? COLORS.LEVEL_UP_BORDER : COLORS.REWARD_BORDER}; border-radius: 10px;
      padding: 20px 30px; color: white; text-align: center; z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    
    let potionHtml = '';
    if (potionDropped) {
      potionHtml = `<p style="margin: 5px 0; color: ${COLORS.POTION_TEXT};">🧪 +1 Potion de vie !</p>`;
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
    
    let pvHtml = '';
    if (pv > 0) {
      pvHtml = `<p style="margin: 5px 0; color: #ff8888;">+${pv} PV récupérés</p>`;
    }

    // Or supprimé

    rewardDiv.innerHTML = `
      <h3 style="color: gold; margin: 0 0 15px 0;">🏆 Victoire !</h3>
      <p style="margin: 5px 0; color: ${COLORS.XP_TEXT};">+${xp} XP</p>
      ${pvHtml}
      ${potionHtml}
      ${levelUpHtml}
    `;
    document.body.appendChild(rewardDiv);
    
    const duration = leveledUp ? DELAYS.REWARD_POPUP_LONG : (potionDropped ? 2500 : DELAYS.REWARD_POPUP);
    setTimeout(() => {
      rewardDiv.style.opacity = "0";
      rewardDiv.style.transition = "opacity 0.5s";
      setTimeout(() => rewardDiv.remove(), 500);
    }, duration);
}

export function afficherGameOver() {
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
    
    const btnMenu = document.createElement("button");
    btnMenu.textContent = "Retour au menu";
    btnMenu.style.padding = "15px 30px";
    btnMenu.style.fontSize = "18px";
    btnMenu.style.cursor = "pointer";
    btnMenu.onclick = () => window.location.href = "/menu";
    
    // === AJOUT BOUTON RECOMMENCER (RAF) ===
    const btnRetry = document.createElement("button");
    btnRetry.textContent = "Recommencer"; // Pour l'instant recharge juste la page, idéalement devrait reset la save
    btnRetry.style.padding = "15px 30px";
    btnRetry.style.fontSize = "18px";
    btnRetry.style.marginLeft = "20px";
    btnRetry.style.cursor = "pointer";
    // TODO: Implement real reset or redirect to new game route with same class
    btnRetry.onclick = () => {
        // Simple reload for now, or redirect to 'nouvelle-partie' logic if we can preserve class
        window.location.href = "/menu"; // Placeholder
    };

    const btnContainer = document.createElement("div");
    btnContainer.appendChild(btnMenu);
    btnContainer.appendChild(btnRetry);

    overlay.appendChild(title);
    overlay.appendChild(btnContainer);
    document.body.appendChild(overlay);
}

export function toggleCombatUI(actif) {
    const combatUI = document.getElementById("combat-ui");
    if (combatUI) {
      combatUI.style.display = actif ? "flex" : "none";
    }
}

export function removeMonstreUI() {
    const monstreContainer = document.getElementById("combat-monstre-container");
    if (monstreContainer) {
      monstreContainer.classList.add("fade-out");
      setTimeout(() => monstreContainer.remove(), 500);
    }
    const monstreDiv = document.getElementById("combat-monstre");
    if (monstreDiv && !monstreContainer) {
      monstreDiv.classList.add("fade-out");
      setTimeout(() => monstreDiv.remove(), 500);
    }
}

export function applyPlayerAttackAnim(playerClass) {
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
