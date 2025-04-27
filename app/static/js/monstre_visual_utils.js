// monstre_visual_utils.js
// Centralise les effets visuels pour les monstres
// Refactorisé pour clarté, cohérence et maintenabilité

/**
 * Affiche un texte flottant de dégâts subis par un monstre
 * @param {HTMLElement} monstre_div - L'élément DOM du monstre
 * @param {number} valeur
 */
function afficher_degats_monstre(monstre_div, valeur) {
  if (!monstre_div) return;
  const texte = document.createElement('div');
  texte.textContent = `-${valeur}`;
  texte.style.position = 'absolute';
  texte.style.left = monstre_div.style.left;
  texte.style.top = monstre_div.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = 'red';
  texte.style.fontSize = '1.5em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';
  document.getElementById('map-inner').appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

/**
 * Affiche un texte flottant de soin reçu par un monstre
 * @param {HTMLElement} monstre_div
 * @param {number} valeur
 */
function afficher_soin_monstre(monstre_div, valeur) {
  if (!monstre_div) return;
  const texte = document.createElement('div');
  texte.textContent = `+${valeur}`;
  texte.style.position = 'absolute';
  texte.style.left = monstre_div.style.left;
  texte.style.top = monstre_div.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = 'lightgreen';
  texte.style.fontSize = '1.5em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';
  document.getElementById('map-inner').appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

/**
 * Affiche un texte flottant pour un buff appliqué au monstre
 * @param {HTMLElement} monstre_div
 * @param {string} nom_buff
 */
function afficher_buff_monstre(monstre_div, nom_buff) {
  if (!monstre_div) return;
  const texte = document.createElement('div');
  texte.textContent = `+${nom_buff}`;
  texte.style.position = 'absolute';
  texte.style.left = monstre_div.style.left;
  texte.style.top = monstre_div.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = '#66ff99';
  texte.style.fontSize = '1.3em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';
  document.getElementById('map-inner').appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

/**
 * Affiche un texte flottant pour un débuff appliqué au monstre
 * @param {HTMLElement} monstre_div
 * @param {string} nom_debuff
 */
function afficher_debuff_monstre(monstre_div, nom_debuff) {
  if (!monstre_div) return;
  const texte = document.createElement('div');
  texte.textContent = `-${nom_debuff}`;
  texte.style.position = 'absolute';
  texte.style.left = monstre_div.style.left;
  texte.style.top = monstre_div.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = '#ff6666';
  texte.style.fontSize = '1.3em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';
  document.getElementById('map-inner').appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

/**
 * Affiche un texte flottant pour un coup manqué sur le monstre
 * @param {HTMLElement} monstre_div
 */
function afficher_miss_monstre(monstre_div) {
  if (!monstre_div) return;
  const texte = document.createElement('div');
  texte.textContent = 'Miss !';
  texte.style.position = 'absolute';
  texte.style.left = monstre_div.style.left;
  texte.style.top = monstre_div.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = '#bbb';
  texte.style.fontSize = '1.3em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';
  document.getElementById('map-inner').appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

// --- Exports publics à la fin ---
export {
  afficher_degats_monstre,
  afficher_soin_monstre,
  afficher_buff_monstre,
  afficher_debuff_monstre,
  afficher_miss_monstre
};
