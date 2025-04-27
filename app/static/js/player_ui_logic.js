// player_ui_logic.js
// Gestion centralisée et harmonisée de l'interface utilisateur du joueur (UI)
// Ce module gère l'affichage et la mise à jour des éléments UI liés au joueur.

// --- Imports principaux ---
import * as modules from './modules_main_logic.js';

// --- Mise à jour du panneau de stats secondaires ---
// Met à jour l'affichage des stats secondaires (ATK, DEF, classe, niveau)
/**
 * Met à jour l'affichage des stats secondaires (ATK, DEF, classe, niveau)
 */
function updatePlayerStatsPanel() {
  if (document.getElementById('stat-atk'))
    document.getElementById('stat-atk').textContent = `ATK : ${modules.getPlayerAtk()}`;
  if (document.getElementById('stat-def'))
    document.getElementById('stat-def').textContent = `DEF : ${modules.getPlayerDef()}`;
  if (document.getElementById('stat-class'))
    document.getElementById('stat-class').textContent = `Classe : ${modules.getPlayerClassPlayer()}`;
  if (document.getElementById('stat-level'))
    document.getElementById('stat-level').textContent = `Niveau : ${modules.getPlayerLevel()}`;
  // PV/mana/xp ne sont pas affichés ici
}

// --- Mise à jour de la barre de vie ---
// Met à jour la barre de vie du joueur
/**
 * Met à jour la barre de vie du joueur
 */
function updatePVBar() {
  const pv = modules.getPlayerPV();
  const pvMax = modules.getMaxPlayerPV();
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
function updateManaBar() {
  const mana = modules.getPlayerMana();
  const manaMax = modules.getMaxPlayerMana();
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
function updateXPBar() {
  const xp = modules.getPlayerXP();
  const lvl = modules.getPlayerLevel();
  const xpNext = modules.getXpToNextLevel(lvl);
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
function updateAllPlayerUI() {
  updatePlayerStatsPanel();
  updatePVBar();
  updateManaBar();
  updateXPBar();
}

window.addEventListener('DOMContentLoaded', updateAllPlayerUI);
window.addEventListener('playerStatsChanged', updateAllPlayerUI);

// --- Exports publics à la fin ---
export {
  updatePlayerStatsPanel,
  updatePVBar,
  updateManaBar,
  updateXPBar,
  updateAllPlayerUI
};
