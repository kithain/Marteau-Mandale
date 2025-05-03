// monstre_talents_logic.js
// Gestion des effets et talents des monstres

// --- Imports principaux ---
import { infliger_degats_au_monstre, soigner_monstre } from './monstre_main_logic.js';
import { afficher_debuff_monstre, afficher_buff_monstre } from './monstre_visual_utils.js';

// --- Effets de statut ---
function appliquer_poison(monstre_objet, valeur = 2, duree = 4000) {
  if (!monstre_objet || !monstre_objet.state) return;
  
  afficher_debuff_monstre(monstre_objet.element, 'poison');
  
  // Appliquer des dégâts périodiques
  const intervalle = 1000; // Toutes les secondes
  let temps_ecoule = 0;
  
  const poison_interval = setInterval(() => {
    temps_ecoule += intervalle;
    infliger_degats_au_monstre(monstre_objet, valeur);
    
    if (temps_ecoule >= duree) {
      clearInterval(poison_interval);
    }
  }, intervalle);
}

function appliquer_stun(monstre_objet, duree = 2000) {
  if (!monstre_objet || !monstre_objet.state || !monstre_objet.element) return;
  
  afficher_debuff_monstre(monstre_objet.element, 'stun');
  
  // Appliquer l'effet visuel de stun
  monstre_objet.element.classList.add('stunned');
  
  // Retirer l'effet après la durée
  setTimeout(() => {
    if (monstre_objet && monstre_objet.element) {
      monstre_objet.element.classList.remove('stunned');
    }
  }, duree);
}

function appliquer_soin_au_monstre(monstre_objet, valeur) {
  if (!monstre_objet) return;
  soigner_monstre(monstre_objet, valeur);
  afficher_buff_monstre(monstre_objet.element, 'soin');
}

// --- Exports publics ---
export {
  appliquer_poison,
  appliquer_stun,
  appliquer_soin_au_monstre
};
