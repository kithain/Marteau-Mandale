import {
  getPlayerPV, getMaxPlayerPV,
  getPlayerMana, getMaxPlayerMana,
  getPlayerXP, getPlayerLevel,
  getPlayerAtk, getPlayerDef,
  getPlayerClass
} from './playerState.js';
import { getXpToNextLevel } from './progression.js';

// Affiche uniquement les stats secondaires dans le panneau, pas PV/mana/xp
export function updatePlayerStatsPanel() {
  if (document.getElementById('stat-atk'))
    document.getElementById('stat-atk').textContent = `ATK : ${getPlayerAtk()}`;
  if (document.getElementById('stat-def'))
    document.getElementById('stat-def').textContent = `DEF : ${getPlayerDef()}`;
  if (document.getElementById('stat-class'))
    document.getElementById('stat-class').textContent = `Classe : ${getPlayerClass()}`;
  if (document.getElementById('stat-level'))
    document.getElementById('stat-level').textContent = `Niveau : ${getPlayerLevel()}`;
  // On n'affiche plus PV/mana/xp ici
}

export function updatePVBar() {
  const pv = getPlayerPV();
  const pvMax = getMaxPlayerPV();
  const percent = Math.floor((pv / pvMax) * 100);
  const fill = document.getElementById('vie-fill');
  const val = document.getElementById('vie-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${pv} / ${pvMax}`;
}

export function updateManaBar() {
  const mana = getPlayerMana();
  const manaMax = getMaxPlayerMana();
  const percent = Math.floor((mana / manaMax) * 100);
  const fill = document.getElementById('mana-fill');
  const val = document.getElementById('mana-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${mana} / ${manaMax}`;
}

export function updateXPBar() {
  const xp = getPlayerXP();
  const lvl = getPlayerLevel();
  const xpNext = getXpToNextLevel(lvl);
  const percent = Math.floor((xp / xpNext) * 100);
  const fill = document.getElementById('xp-fill');
  const val = document.getElementById('xp-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${xp} / ${xpNext}`;
}

export function updateAllPlayerUI() {
  updatePlayerStatsPanel();
  updatePVBar();
  updateManaBar();
  updateXPBar();
}

window.addEventListener('DOMContentLoaded', updateAllPlayerUI);
window.addEventListener('playerStatsChanged', updateAllPlayerUI);
