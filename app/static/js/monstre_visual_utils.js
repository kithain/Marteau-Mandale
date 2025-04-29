// monstre_visual_utils.js
// Gestion des effets visuels pour les monstres (Dégâts, Soin, Buffs, Débuffs)

// --- Affichage d'un texte flottant sur un monstre ---
function afficher_texte_flottant_monstre(monstre_element, texte, couleur = 'white') {
  if (!monstre_element) return;

  const flottant = document.createElement('div');
  flottant.textContent = texte;
  flottant.style.position = 'absolute';
  flottant.style.left = monstre_element.style.left;
  flottant.style.top = monstre_element.style.top;
  flottant.style.transform = 'translate(-50%, -100%)';
  flottant.style.color = couleur;
  flottant.style.fontSize = '1.4em';
  flottant.style.fontWeight = 'bold';
  flottant.style.zIndex = 30;
  flottant.style.pointerEvents = 'none';
  flottant.style.animation = 'floatUpDelayed 2s ease-out';

  const container = document.getElementById('map-inner');
  if (container) container.appendChild(flottant);
  setTimeout(() => flottant.remove(), 2000);
}

// --- Effets visuels principaux ---
function afficher_degats_monstre(monstre_element, valeur) {
  afficher_texte_flottant_monstre(monstre_element, `-${valeur}`, 'red');
}

function afficher_soin_monstre(monstre_element, valeur) {
  afficher_texte_flottant_monstre(monstre_element, `+${valeur}`, 'lightgreen');
}

function afficher_buff_monstre(monstre_element, nom_buff) {
  afficher_texte_flottant_monstre(monstre_element, `+${nom_buff}`, '#66ff99');
}

function afficher_debuff_monstre(monstre_element, nom_debuff) {
  afficher_texte_flottant_monstre(monstre_element, `-${nom_debuff}`, '#ff6666');
}

function afficher_miss_monstre(monstre_element) {
  afficher_texte_flottant_monstre(monstre_element, 'Miss !', '#bbb');
}

// --- Exports publics ---
export {
  afficher_degats_monstre,
  afficher_soin_monstre,
  afficher_buff_monstre,
  afficher_debuff_monstre,
  afficher_miss_monstre
};
