// player_main_logic.js
// Gestion du joueur : stats, position, talents, animation, régénération, sauvegarde
// Refactorisé pour clarté, cohérence et maintenabilité

// === Variables globales et imports ===
let cooldowns = {};
let combat_actif = false;
let player_def = 0; // Stat de défense calculée par niveau
let player_xp = 0;
let xp_to_next_level = 100;
let regen_interval = null;
let is_game_over = false;

import { 
  get_talents,
  set_combat
} from './player_talents_logic.js';

import { 
  get_position_joueur,
  get_player_save_data,
  set_player_position,
  set_player_pv,
  set_player_mana,
  set_player_xp
} from './player_state_logic.js';

import { utiliser_talent_en_combat } from './input_handler_logic.js';

// === Stats ===
function initialiser_stats_joueur(level) {
  set_player_pv(get_max_vie(level));
  set_player_mana(get_max_mana(level));
  player_def = get_player_base_def(level);
}

// === XP et niveau ===
function gagner_xp(amount) {
  if (window.PLAYER_LEVEL >= 10) {
    const max_xp = get_xp_to_next_level(10);
    player_xp = Math.min(player_xp, max_xp);
    window.PLAYER_XP = player_xp;
    set_player_xp(player_xp);
    update_xp_bar();
    return;
  }
  player_xp += amount;
  set_player_xp(player_xp);
  while (player_xp >= xp_to_next_level) {
    level_up();
    if (window.PLAYER_LEVEL >= 10) {
      player_xp = get_xp_to_next_level(10);
      set_player_xp(player_xp);
      break;
    }
  }
  window.PLAYER_XP = player_xp;
  set_player_xp(player_xp);
  update_xp_bar();
}

function level_up() {
  if (window.PLAYER_LEVEL >= 10) return;
  window.PLAYER_XP -= xp_to_next_level;
  set_player_xp(window.PLAYER_XP);
  window.PLAYER_LEVEL += 1;
  xp_to_next_level = get_xp_to_next_level(window.PLAYER_LEVEL);
  initialiser_stats_joueur(window.PLAYER_LEVEL);
  create_floating_text(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiser_talents();
}

function update_xp_bar() {
  const xp_fill = document.getElementById("xp-fill");
  if (!xp_fill) return;
  let max_xp = xp_to_next_level;
  if (window.PLAYER_LEVEL >= 10) {
    max_xp = get_xp_to_next_level(10);
    player_xp = Math.min(player_xp, max_xp);
  }
  const percent = Math.min(100, (player_xp / max_xp) * 100);
  xp_fill.style.width = percent + "%";
}

// === Position du joueur ===
// Fonction pour définir la position du joueur
function deplacer_joueur(x, y) {
  set_player_position(x, y);
}

// === Vie / Mana ===
// Fonction pour mettre à jour les barres de vie et de mana
function update_mana_bar() {
  const mana_fill = document.getElementById("mana-fill");
  if (!mana_fill) return;
  const percent = (get_player_mana() / get_max_mana(window.PLAYER_LEVEL)) * 100;
  mana_fill.style.width = percent + "%";
}

function update_vie_bar() {
  const vie_fill = document.getElementById("vie-fill");
  if (!vie_fill) return;
  const percent = (get_player_pv() / get_max_vie(window.PLAYER_LEVEL)) * 100;
  vie_fill.style.width = percent + "%";
}

// === Talents ===
// Fonction pour utiliser un talent
function utiliser_talent(talent, index) {
  if (cooldowns[index]) return;
  if (get_player_mana() < talent.cost) return;
  animer_attaque();
  const player = document.getElementById("player");
  if (!player) return;
  if (talent.color && talent.duration) {
    player.style.filter = `drop-shadow(0 0 6px ${talent.color})`;
    setTimeout(() => { player.style.filter = ""; }, talent.duration);
  }
  if (talent.opacity !== undefined) {
    player.style.opacity = talent.opacity;
    setTimeout(() => { player.style.opacity = 1; }, 1000);
  }
  if (talent.effect_text) {
    create_floating_text(talent.effect_text, talent.color || "white");
  }
  set_player_mana(get_player_mana() - talent.cost);
  update_mana_bar();
  cooldowns[index] = true;
  const btn = document.getElementById(`talent-btn-${index}`);
  if (btn) btn.disabled = true;
  setTimeout(() => {
    cooldowns[index] = false;
    if (btn) btn.disabled = false;
  }, talent.cooldown);
  if (combat_actif) {
    if (talent.zone === 'adjacent' || talent.zone === 'zone') {
      get_monstres_adjacents_et_sur_case().forEach(monstre => {
        if (talent.type === "attack") {
          let degats = talent.damage;
          if ((talent.niveau_requis || 1) === 1) {
            degats = get_player_base_atk(window.PLAYER_LEVEL);
          }
          recevoir_degats(degats, monstre.data.unique_id);
        }
        if (talent.type === "poison") {
          const dot_value = talent.dot || 1;
          apply_status_effect(monstre.data.unique_id, "poisoned", talent.duration, dot_value);
        }
      });
    } else if (talent.type === "heal") {
      set_player_pv(Math.min(get_player_pv() + (talent.heal || 1), get_max_vie(window.PLAYER_LEVEL)));
      update_vie_bar();
    } else if (talent.type === "boost") {
      apply_boost(talent.boost_type, talent.boost_value, talent.duration);
    }
  }
}

// === Initialisation des talents ===
// Fonction pour initialiser les talents
function initialiser_talents() {
  const talent_buttons = document.getElementById('talents-buttons');
  const talents_data = get_talents();
  const skills = Array.isArray(talents_data)
    ? talents_data.filter(t => t && t.id && (t.niveau_requis || 1) <= window.PLAYER_LEVEL)
    : [];
  talent_buttons.innerHTML = '';
  skills.forEach((talent, index) => {
    if (!talent || !talent.name) return;
    const btn = document.createElement(`button`);
    btn.id = `talent-btn-${index}`;
    btn.textContent = `${index + 1}. ${talent.name}`;
    btn.onclick = () => {
      if (window.combat_actif) {
        utiliser_talent_en_combat(talent);
      }
    };
    talent_buttons.appendChild(btn);
  });
}

// === Animation attaque ===
// Fonction pour animer l'attaque
function animer_attaque() {
  const player = document.getElementById("player");
  if (!player) return;
  const frame_count = 3;
  const frame_width = 64;
  let frame = 0;
  player.style.backgroundImage = `url(/static/img/classes/${get_player_class().toLowerCase()}_attack.png)`;
  player.style.backgroundSize = `${frame_count * frame_width}px 64px`;
  const interval = setInterval(() => {
    player.style.backgroundPosition = `-${frame * frame_width}px 0px`;
    frame++;
    if (frame >= frame_count) {
      clearInterval(interval);
      player.style.backgroundImage = `url(/static/img/classes/${get_player_class().toLowerCase()}_idle.png)`;
      player.style.backgroundSize = `64px 64px`;
      player.style.backgroundPosition = `0px 0px`;
    }
  }, 100);
}

// === Dash arrière ===
// Fonction pour réaliser le dash arrière
function dash_backwards() {
  let current_x = get_position_joueur().x;
  let current_y = get_position_joueur().y;

  const directions = [
    { dx: 0, dy: -1 }, 
    { dx: 1, dy: -1 }, 
    { dx: 1, dy: 0 },  
    { dx: 1, dy: 1 },  
    { dx: 0, dy: 1 },  
    { dx: -1, dy: 1 }, 
    { dx: -1, dy: 0 }, 
    { dx: -1, dy: -1 } 
  ];

  is_blocked(current_x, current_y);
  let found = false;
  for (const dir of directions) {
    const try_x = current_x + dir.dx;
    const try_y = current_y + dir.dy;
    if (!is_blocked(try_x, try_y)) {
      deplacer_joueur(try_x, try_y);
      found = true;
      break;
    }
  }
  if (!found) {
  }
}

// === Régénération automatique ===
// Fonction pour gérer la régénération automatique
// ... (logique de régénération si présente)

// === Sauvegarde et chargement ===
// Fonction pour importer les données du joueur
function load_player_data(save_data) {
  // ... (logique d'import des données du joueur)
}

// === Classe et combat ===
// Fonction pour obtenir la classe du joueur
function get_player_class() {
  return window.PLAYER_CLASS || 'Aventurier';
}
// Fonction pour définir le combat
function set_combat(actif) {
  combat_actif = actif;
  window.combat_actif = actif;
}

// === Exports publics à la fin ---
export {
  deplacer_joueur,
  get_player_class,
  set_combat
};
