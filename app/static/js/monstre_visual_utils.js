// monstre_visual_utils.js
// Centralise les effets visuels pour les monstres
// Refactorisé pour clarté, cohérence et maintenabilité

/**
 * Affiche un texte flottant de dégâts subis par un monstre
 * @param {HTMLElement} monstreDiv - L'élément DOM du monstre
 * @param {number} valeur
 */
function afficherDegatsMonstre(monstreDiv, valeur) {
  if (!monstreDiv) return;
  const texte = document.createElement('div');
  texte.textContent = `-${valeur}`;
  texte.style.position = 'absolute';
  texte.style.left = monstreDiv.style.left;
  texte.style.top = monstreDiv.style.top;
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
 * @param {HTMLElement} monstreDiv
 * @param {number} valeur
 */
function afficherSoinMonstre(monstreDiv, valeur) {
  if (!monstreDiv) return;
  const texte = document.createElement('div');
  texte.textContent = `+${valeur}`;
  texte.style.position = 'absolute';
  texte.style.left = monstreDiv.style.left;
  texte.style.top = monstreDiv.style.top;
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
 * @param {HTMLElement} monstreDiv
 * @param {string} nomBuff
 */
function afficherBuffMonstre(monstreDiv, nomBuff) {
  if (!monstreDiv) return;
  const texte = document.createElement('div');
  texte.textContent = `+${nomBuff}`;
  texte.style.position = 'absolute';
  texte.style.left = monstreDiv.style.left;
  texte.style.top = monstreDiv.style.top;
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
 * @param {HTMLElement} monstreDiv
 * @param {string} nomDebuff
 */
function afficherDebuffMonstre(monstreDiv, nomDebuff) {
  if (!monstreDiv) return;
  const texte = document.createElement('div');
  texte.textContent = `-${nomDebuff}`;
  texte.style.position = 'absolute';
  texte.style.left = monstreDiv.style.left;
  texte.style.top = monstreDiv.style.top;
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
 * @param {HTMLElement} monstreDiv
 */
function afficherMissMonstre(monstreDiv) {
  if (!monstreDiv) return;
  const texte = document.createElement('div');
  texte.textContent = 'Miss !';
  texte.style.position = 'absolute';
  texte.style.left = monstreDiv.style.left;
  texte.style.top = monstreDiv.style.top;
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
  afficherDegatsMonstre,
  afficherSoinMonstre,
  afficherBuffMonstre,
  afficherDebuffMonstre,
  afficherMissMonstre
};
