// player_main_logic.js
// Gestion du joueur : stats, position, talents, animation, sauvegarde (hors logique combat)

// === Variables globales et imports ===
let cooldowns = {};
let player_def = 0;
let player_xp = 0;
let xp_to_next_level = 100;

import {
  obtenir_donnees_sauvegarde,
  get_position_joueur,
  set_player_position,
  set_player_pv,
  set_player_mana,
  set_player_xp,
  get_player_pv,
  get_player_mana
} from './player_state_logic.js';

import { get_max_vie, get_max_mana, get_player_base_def } from './progression_main_logic.js';
import { get_talents } from './player_talents_logic.js';
import { create_floating_text } from './player_visual_utils.js';

// === Stats du joueur ===
function initialiser_stats_joueur(niveau) {
  set_player_pv(get_max_vie(niveau));
  set_player_mana(get_max_mana(niveau));
  player_def = get_player_base_def(niveau);
}

// === Gestion de l'XP et montée de niveau ===
function gagner_xp(xp) {
  player_xp += xp;
  while (player_xp >= xp_to_next_level) {
    player_xp -= xp_to_next_level;
    level_up();
  }
  set_player_xp(player_xp);
  mettre_a_jour_barre_xp();
}

function level_up() {
  window.PLAYER_LEVEL = (window.PLAYER_LEVEL || 1) + 1;
  xp_to_next_level = get_xp_to_next_level(window.PLAYER_LEVEL);
  initialiser_stats_joueur(window.PLAYER_LEVEL);
  create_floating_text(`Niveau ${window.PLAYER_LEVEL} !`, '#FFD700');
  initialiser_talents();
}

function mettre_a_jour_barre_xp() {
  const xp_fill = document.getElementById('xp-fill');
  if (!xp_fill) return;
  const percent = (player_xp / xp_to_next_level) * 100;
  xp_fill.style.width = percent + '%';
}

// === Déplacement du joueur ===
function deplacer_joueur(x, y) {
  set_player_position(x, y);
}

// === Mise à jour des barres de vie et mana ===
function mettre_a_jour_barre_vie() {
  const vie_fill = document.getElementById('vie-fill');
  if (!vie_fill) return;
  const pourcentage = (get_player_pv() / get_max_vie(window.PLAYER_LEVEL)) * 100;
  vie_fill.style.width = pourcentage + '%';
}

function mettre_a_jour_barre_mana() {
  const mana_fill = document.getElementById('mana-fill');
  if (!mana_fill) return;
  const pourcentage = (get_player_mana() / get_max_mana(window.PLAYER_LEVEL)) * 100;
  mana_fill.style.width = pourcentage + '%';
}

// === Initialisation des talents à l'UI ===
function initialiser_talents() {
  const conteneur = document.getElementById('talents-buttons');
  if (!conteneur) return;
  conteneur.innerHTML = '';
  const talents = get_talents();
  talents.forEach((talent, index) => {
    const bouton = document.createElement('button');
    bouton.id = `talent-btn-${index}`;
    bouton.textContent = `${index + 1}. ${talent.nom}`;
    bouton.disabled = !talent.estDisponible();
    conteneur.appendChild(bouton);
  });
}

// === Exports publics ===
export {
  deplacer_joueur,
  initialiser_stats_joueur,
  gagner_xp,
  mettre_a_jour_barre_vie,
  mettre_a_jour_barre_mana,
  mettre_a_jour_barre_xp,
  initialiser_talents,
  obtenir_donnees_sauvegarde,
  get_position_joueur
};
