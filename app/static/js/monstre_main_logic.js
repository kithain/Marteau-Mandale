// monstre_main_logic.js
// Gestion globale des monstres (Création, Déplacement, Combat)

// --- Imports ---
import { creer_etat_monstre, get_monstre_pv, definir_pv_monstre, get_position_monstre, definir_position_monstre } from './monstre_state_logic.js';
import { afficher_degats_monstre, afficher_soin_monstre, afficher_buff_monstre, afficher_debuff_monstre, afficher_miss_monstre } from './monstre_visual_utils.js';

// --- Etat global ---
let monstres_actifs = [];

// --- Création d'un monstre ---
function creer_monstre({ id, nom, niveau, difficulte_carte = 1, image, pos_x = 0, pos_y = 0 }) {
  const monstre = creer_etat_monstre({ id, nom, niveau, difficulte_carte });
  definir_position_monstre(monstre, pos_x, pos_y);
  const element = creer_element_monstre(monstre, image);
  monstres_actifs.push({ state: monstre, element });
  return { state: monstre, element };
}

function creer_element_monstre(monstre, image) {
  const div = document.createElement('div');
  div.id = `monstre-${monstre.id}`;
  div.className = 'monstre';
  div.style.position = 'absolute';
  div.style.width = '64px';
  div.style.height = '64px';
  div.style.left = `${monstre.position.x * 64}px`;
  div.style.top = `${monstre.position.y * 64}px`;
  div.style.backgroundImage = `url(${image || '/static/img/monstre_default.png'})`;
  div.style.backgroundSize = 'cover';
  div.style.zIndex = 20;

  const container = document.getElementById('map-inner');
  if (container) container.appendChild(div);

  return div;
}

// --- Gestion des dégâts ---
function infliger_degats_au_monstre(monstre_objet, valeur) {
  if (!monstre_objet || !monstre_objet.state) return;
  const pv_avant = get_monstre_pv(monstre_objet.state);
  definir_pv_monstre(monstre_objet.state, pv_avant - valeur);
  afficher_degats_monstre(monstre_objet.element, valeur);
}

function soigner_monstre(monstre_objet, valeur) {
  if (!monstre_objet || !monstre_objet.state) return;
  definir_pv_monstre(monstre_objet.state, get_monstre_pv(monstre_objet.state) + valeur);
  afficher_soin_monstre(monstre_objet.element, valeur);
}

// --- Suppression d'un monstre ---
function supprimer_monstre(monstre_objet) {
  if (!monstre_objet) return;
  monstres_actifs = monstres_actifs.filter(m => m !== monstre_objet);
  if (monstre_objet.element && monstre_objet.element.parentNode) {
    monstre_objet.element.parentNode.removeChild(monstre_objet.element);
  }
}

// --- Accès rapide ---
function obtenir_monstres_actifs() {
  return monstres_actifs;
}

// --- Exports publics ---
export {
  creer_monstre,
  infliger_degats_au_monstre,
  soigner_monstre,
  supprimer_monstre,
  obtenir_monstres_actifs
};
