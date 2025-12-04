// constants.js

export const COLORS = {
    HEALTH_HIGH: "#44ff44", // > 50%
    HEALTH_MED: "#ffaa00",  // > 25%
    HEALTH_LOW: "#ff4444",  // <= 25%
    
    TEXT_HEAL: "#44ff44",
    TEXT_DAMAGE_PLAYER: "#ff4444",
    TEXT_DAMAGE_MONSTER: "#ff4444",
    TEXT_CRIT: "#FFD700",
    TEXT_POISON: "#32CD32",
    TEXT_SLOW: "#00BFFF",
    TEXT_STUN: "#FFD700",
    TEXT_DODGE: "#CCCCCC",
    TEXT_BURN: "#FF8C00",
    
    XP_TEXT: "#88ff88",
    REWARD_BORDER: "gold", // On garde le nom pour compatibilité mais on pourrait renommer
    LEVEL_UP_BORDER: "#00ff00",
    POTION_TEXT: "#ff88ff"
};

export const GAME_BALANCE = {
    XP_BASE: 150, // 150
    XP_EXPONENT: 2.0, // Passage à 2.0 pour doubler l'XP requise à chaque niveau (150 -> 300 -> 600...)
    LEVEL_PV_BONUS: 5,
    LEVEL_DMG_BONUS: 1,
    POTION_HEAL_RATIO: 0.4,
    MAX_POTIONS: 2,
    DROP_CHANCE_BASE: 0.10,
    DROP_CHANCE_PER_DIFF: 0.02,
    FUITE_BASE_CHANCE: 0.5,
    FUITE_MIN_CHANCE: 0.1,
    FUITE_PENALTY_PER_DIFF: 0.05
};

export const DELAYS = {
    TURN_MONSTER: 800, // délai avant tour du monstre
    ATTACK_ANIM: 500,
    FLOAT_TEXT: 2000,
    REWARD_POPUP: 2000,
    REWARD_POPUP_LONG: 3500
};
