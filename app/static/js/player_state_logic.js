// player_state_logic.js
// Gestion centralisée de l'état du joueur (stats, position, classe, inventaire, etc.)
// Refactorisé pour clarté, cohérence et maintenabilité

// --- Constantes du joueur ---
const PLAYER_BASE_STATS = {
  pv: 120,
  mana: 15,
  atk: 3,
  def: 2,
  vitesse: 1
};

const PLAYER_START_POSITION = { x: 0, y: 0 };

const INVENTORY_SIZE = 20;

const TALENT_POINTS_PER_LEVEL = 1;

// --- Etat global du joueur ---
let state = {
  level: 1,
  xp: 0,
  pv: 120,
  mana: 15,
  atk: 3,
  def: 2,
  classe: "Paladin",
  carte: "A1",
  position: { x: 0, y: 0 },
  inventaire: [],
  talents: [],
  pv_max: 120,
  mana_max: 15,
};

// --- Modificateurs par classe ---
const CLASS_MODIFIERS = {
  Paladin:   { atk: 0, def: 1, hp: 1, mana: 0, regen_pv: 2, regen_mana: 1 },
  Barbare:   { atk: 1, def: 0, hp: 1, mana: 0, regen_pv: 1, regen_mana: 0 },
  Mage:      { atk: 0, def: 0, hp: 0, mana: 2, regen_pv: 0, regen_mana: 3 },
  Voleur:    { atk: 1, def: 0, hp: 0, mana: 1, regen_pv: 1, regen_mana: 2 },
};

// --- Getters d'état joueur ---
function get_player_level() { return state.level; } // Niveau
function get_player_xp() { return state.xp; } // XP
function get_player_pv() { return state.pv; } // Points de vie
function get_player_mana() { return state.mana; } // Mana
function get_player_atk() { return state.atk; } // Attaque
function get_player_def() { return state.def; } // Défense
function get_player_class() { return state.classe; } // Classe
function get_player_position() { return { ...state.position }; } // Position (copie)
function get_player_inventory() { return [...state.inventaire]; } // Inventaire (copie)
function get_player_talents() { return [...state.talents]; } // Talents (copie)
function get_player_map() { return state.carte; } // Carte courante
function get_central_player_position() { return { ...state.position }; } // Alias position
function get_position_joueur() { return state.position; }
function get_current_class_modifiers() { return CLASS_MODIFIERS[state.classe] || { atk: 0, def: 0, hp: 0, mana: 0 }; }
function get_player_effective_stats() {
  // Renvoie les stats effectives (base + bonus de classe)
  const mods = get_current_class_modifiers();
  return {
    atk: state.atk + mods.atk,
    def: state.def + mods.def,
    pv: state.pv + mods.hp,
    mana: state.mana + mods.mana,
  };
}

// --- Régénération automatique (PV/Mana) ---
let regen_interval = null;
function start_regen() {
  if (regen_interval) return;
  regen_interval = setInterval(() => {
    if (window.is_game_over || window.combat_actif) return;
    const mods = get_current_class_modifiers();
    const pv_bonus_class = typeof mods.regen_pv === 'number' ? mods.regen_pv : 1;
    const mana_bonus_class = typeof mods.regen_mana === 'number' ? mods.regen_mana : 1;
    const pv_bonus_percent = Math.max(1, Math.floor(get_max_player_pv() * 0.05));
    const mana_bonus_percent = Math.max(1, Math.floor(get_max_player_mana() * 0.05));
    const pv_bonus = pv_bonus_class + pv_bonus_percent;
    const mana_bonus = mana_bonus_class + mana_bonus_percent;
    set_player_pv(Math.min(get_player_pv() + pv_bonus, get_max_player_pv()));
    set_player_mana(Math.min(get_player_mana() + mana_bonus, get_max_player_mana()));
  }, 1000);
}
function stop_regen() {
  if (regen_interval) clearInterval(regen_interval);
  regen_interval = null;
}

// --- Helpers pour PV/Mana max ---
function get_max_player_pv() { return state.pv_max || 120; }
function get_max_player_mana() { return state.mana_max || 15; }

// --- Setters d'état joueur ---
import { appliquer_effet } from './utils_main_logic.js';
function emit_player_stats_changed() {
  window.dispatchEvent(new Event('playerStatsChanged'));
}
function set_player_level(lvl) { state.level = lvl; emit_player_stats_changed(); }
function set_player_xp(xp) { state.xp = xp; emit_player_stats_changed(); }
function set_player_pv(pv) {
  if (window.is_game_over) return;
  state.pv = pv;
  emit_player_stats_changed();
  if (state.pv <= 0 && typeof window.afficher_game_over === 'function') {
    window.afficher_game_over();
    if (typeof modules.set_combat === 'function') {
      modules.set_combat(false); // Force la fin du combat
    }
  }
}
function set_player_mana(mana) { state.mana = mana; emit_player_stats_changed(); }
function set_player_atk(atk) { state.atk = atk; emit_player_stats_changed(); }
function set_player_def(def_) { state.def = def_; emit_player_stats_changed(); }
function set_player_class(classe) { state.classe = classe; emit_player_stats_changed(); }
function update_player_position(x, y) {
  set_player_position(x, y);
}
function set_player_position(x, y, check_blocked = false) {
  if (check_blocked && isBlocked(x, y)) {
    // Si la case est bloquée, chercher autour
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const tryX = x + dx;
        const tryY = y + dy;
        if (!isBlocked(tryX, tryY)) {
          state.position.x = tryX;
          state.position.y = tryY;
          return true;
        }
      }
    }
    return false;
  }
  
  state.position.x = x;
  state.position.y = y;
  return true;
}
function set_player_inventory(inv) { state.inventaire = [...inv]; emit_player_stats_changed(); }
function set_player_talents(tal) { state.talents = [...tal]; emit_player_stats_changed(); }
function set_player_map(map) { state.carte = map; emit_player_stats_changed(); }

// --- Initialisation / Reset ---
function init_player_state(init_data = {}) {
  state = { ...state, ...init_data };
  emit_player_stats_changed();
}

// --- Sauvegarde ---
function get_player_save_data() {
  return { ...state };
}

// --- Régénération automatique ---
function start_regen() {
  if (regen_interval) return;
  regen_interval = setInterval(() => {
    if (window.is_game_over || window.combat_actif) return;
    set_player_pv(Math.min(get_player_pv() + 1, get_max_vie(window.PLAYER_LEVEL)));
    set_player_mana(Math.min(get_player_mana() + 1, get_max_mana(window.PLAYER_LEVEL)));
  }, 2000);
}

function stop_regen() {
  if (regen_interval) clearInterval(regen_interval);
  regen_interval = null;
}

// --- Exports publics à la fin ---
export {
  PLAYER_BASE_STATS,
  PLAYER_START_POSITION,
  INVENTORY_SIZE,
  TALENT_POINTS_PER_LEVEL,
  CLASS_MODIFIERS,
  get_player_level,
  get_player_xp,
  get_player_pv,
  get_player_mana,
  get_player_atk,
  get_player_def,
  get_player_class,
  get_player_position,
  get_position_joueur,
  get_player_inventory,
  get_player_talents,
  get_player_map,
  get_central_player_position,
  get_current_class_modifiers,
  get_player_effective_stats,
  start_regen,
  stop_regen,
  get_max_player_pv,
  get_max_player_mana,
  set_player_level,
  set_player_xp,
  set_player_pv,
  set_player_mana,
  set_player_atk,
  set_player_def,
  set_player_class,
  update_player_position,
  set_player_position,
  set_player_inventory,
  set_player_talents,
  set_player_map,
  init_player_state,
  get_player_save_data
};
