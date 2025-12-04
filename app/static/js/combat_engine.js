// combat_engine.js
// Ce module gère la logique mathématique du combat (calcul de dégâts, XP, etc.)
// Il ne doit PAS manipuler le DOM directement, mais retourner des résultats ou appeler des callbacks UI.

import { GAME_BALANCE } from './constants.js';

export function xpRequiredForLevel(level) {
    return Math.floor(GAME_BALANCE.XP_BASE * Math.pow(GAME_BALANCE.XP_EXPONENT, level - 1));
}

export function calculatePlayerDamage(baseDamage, bonusDamage, damageBoost, isCrit, monstre) {
    let damage = baseDamage + bonusDamage;
    damage = Math.floor(damage * damageBoost);
    
    if (isCrit) {
        // Logique critique gérée par l'appelant pour l'instant ou ici si on passe les params crit
    }
    
    // Réductions
    if (monstre.intangible) {
        damage = Math.floor(damage * (monstre.intangibleValue || 0.2));
    }
    if (monstre.damageReduction) {
        damage = Math.floor(damage * monstre.damageReduction);
    }
    
    return damage;
}

export function calculateMonsterDamage(monstre, difficulte, shieldValue) {
    const dmgMultiplier = monstre.damageMultiplier || 1;
    const attaqueBase = monstre.attaque || 5;
    let rawDamage = Math.floor(attaqueBase * dmgMultiplier);
    
    let absorbed = 0;
    if (shieldValue > 0) {
        absorbed = Math.min(shieldValue, rawDamage);
        rawDamage -= absorbed;
    }
    
    return { damage: rawDamage, absorbed: absorbed };
}

export function checkFleeSuccess(difficulte) {
    const chance = Math.max(
        GAME_BALANCE.FUITE_MIN_CHANCE, 
        GAME_BALANCE.FUITE_BASE_CHANCE - difficulte * GAME_BALANCE.FUITE_PENALTY_PER_DIFF
    );
    return Math.random() < chance;
}

export function processRewards(difficulte) {
    // XP exponentielle en fonction de la difficulté du monstre
    // Formule: XP = 15 * (1.3 ^ (difficulte - 1))
    // Correspondance exacte avec le tableau utilisateur :
    // Diff 1: 15 XP
    // Diff 5: 43 XP
    // Diff 10: 159 XP
    const xpBase = 15;
    const xpExponent = 1.3;
    let xp = Math.floor(xpBase * Math.pow(xpExponent, difficulte - 1));
    
    // Ajout d'une petite variance aléatoire (+/- 10%)
    const variance = 0.9 + Math.random() * 0.2;
    xp = Math.max(1, Math.floor(xp * variance));

    const or = 0; // Plus de gain d'or
    const pv = 0; // Plus de régénération automatique, utilisation des potions uniquement
    
    const dropChance = GAME_BALANCE.DROP_CHANCE_BASE + difficulte * GAME_BALANCE.DROP_CHANCE_PER_DIFF;
    const potion = Math.random() < dropChance;
    
    return { xp, or, pv, potion };
}
