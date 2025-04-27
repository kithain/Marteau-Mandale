// player_ui_logic.js
// Gestion centralisée et harmonisée de l'interface utilisateur du joueur (UI)
// Ce module gère l'affichage et la mise à jour des éléments UI liés au joueur.

// --- Imports principaux ---
import { 
  get_player_atk,
  get_player_def,
  get_player_class,
  get_player_level,
  get_player_pv,
  get_max_player_pv,
  get_player_mana,
  get_max_player_mana,
  get_player_xp,
  get_xp_to_next_level
} from './player_state_logic.js';

// --- Mise à jour du panneau de stats secondaires ---
// Met à jour l'affichage des stats secondaires (ATK, DEF, classe, niveau)
/**
 * Met à jour l'affichage des stats secondaires (ATK, DEF, classe, niveau)
 */
function update_player_stats_panel() {
  if (document.getElementById('stat-atk'))
    document.getElementById('stat-atk').textContent = `ATK : ${get_player_atk()}`;
  if (document.getElementById('stat-def'))
    document.getElementById('stat-def').textContent = `DEF : ${get_player_def()}`;
  if (document.getElementById('stat-class'))
    document.getElementById('stat-class').textContent = `Classe : ${get_player_class()}`;
  if (document.getElementById('stat-level'))
    document.getElementById('stat-level').textContent = `Niveau : ${get_player_level()}`;
  // PV/mana/xp ne sont pas affichés ici
}

// --- Mise à jour de la barre de vie ---
// Met à jour la barre de vie du joueur
/**
 * Met à jour la barre de vie du joueur
 */
function update_pv_bar() {
  const pv = get_player_pv();
  const pvMax = get_max_player_pv();
  const percent = Math.floor((pv / pvMax) * 100);
  const fill = document.getElementById('vie-fill');
  const val = document.getElementById('vie-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${pv} / ${pvMax}`;
}

// --- Mise à jour de la barre de mana ---
// Met à jour la barre de mana du joueur
/**
 * Met à jour la barre de mana du joueur
 */
function update_mana_bar() {
  const mana = get_player_mana();
  const manaMax = get_max_player_mana();
  const percent = Math.floor((mana / manaMax) * 100);
  const fill = document.getElementById('mana-fill');
  const val = document.getElementById('mana-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${mana} / ${manaMax}`;
}

// --- Mise à jour de la barre d'expérience ---
// Met à jour la barre d'expérience du joueur
/**
 * Met à jour la barre d'expérience du joueur
 */
function update_xp_bar() {
  const xp = get_player_xp();
  const lvl = get_player_level();
  const xpNext = get_xp_to_next_level(lvl);
  const percent = Math.floor((xp / xpNext) * 100);
  const fill = document.getElementById('xp-fill');
  const val = document.getElementById('xp-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${xp} / ${xpNext}`;
}

// --- Mise à jour globale de l'UI joueur ---
// Met à jour tous les éléments de l'UI liés au joueur
/**
 * Met à jour tous les éléments de l'UI liés au joueur
 */
function update_all_player_ui() {
  update_player_stats_panel();
  update_pv_bar();
  update_mana_bar();
  update_xp_bar();
}

window.addEventListener('DOMContentLoaded', update_all_player_ui);
window.addEventListener('playerStatsChanged', update_all_player_ui);

// --- Exports publics à la fin ---
export {
  update_player_stats_panel,
  update_pv_bar,
  update_mana_bar,
  update_xp_bar,
  update_all_player_ui
};
