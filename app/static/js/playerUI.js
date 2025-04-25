import * as modules from './modules.js';

// Affiche uniquement les stats secondaires dans le panneau, pas PV/mana/xp
export function updatePlayerStatsPanel() {
  if (document.getElementById('stat-atk'))
    document.getElementById('stat-atk').textContent = `ATK : ${modules.getPlayerAtk()}`;
  if (document.getElementById('stat-def'))
    document.getElementById('stat-def').textContent = `DEF : ${modules.getPlayerDef()}`;
  if (document.getElementById('stat-class'))
    document.getElementById('stat-class').textContent = `Classe : ${modules.getPlayerClassPlayer()}`;
  if (document.getElementById('stat-level'))
    document.getElementById('stat-level').textContent = `Niveau : ${modules.getPlayerLevel()}`;
  // On n'affiche plus PV/mana/xp ici
}

export function updatePVBar() {
  const pv = modules.getPlayerPV();
  const pvMax = modules.getMaxPlayerPV();
  const percent = Math.floor((pv / pvMax) * 100);
  const fill = document.getElementById('vie-fill');
  const val = document.getElementById('vie-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${pv} / ${pvMax}`;
}

export function updateManaBar() {
  const mana = modules.getPlayerMana();
  const manaMax = modules.getMaxPlayerMana();
  const percent = Math.floor((mana / manaMax) * 100);
  const fill = document.getElementById('mana-fill');
  const val = document.getElementById('mana-value');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = `${mana} / ${manaMax}`;
}

export function updateXPBar() {
  const xp = modules.getPlayerXP();
  const lvl = modules.getPlayerLevel();
  const xpNext = modules.getXpToNextLevel(lvl);
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
