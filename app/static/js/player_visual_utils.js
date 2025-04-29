// player_visual_utils.js
// Gestion des effets visuels pour le joueur (PV, Mana, Buffs, Dégâts)

// --- Imports ---
import { get_player_pv, get_pv_max_joueur, get_mana_joueur, get_mana_max_joueur, set_pv_joueur } from './player_state_logic.js';

// --- Affichage de textes flottants ---
function afficher_texte_flottant(contenu, couleur = 'white') {
  const joueur = document.getElementById('player');
  if (!joueur) return;

  const texte = document.createElement('div');
  texte.textContent = contenu;
  texte.style.position = 'absolute';
  texte.style.left = joueur.style.left;
  texte.style.top = joueur.style.top;
  texte.style.transform = 'translate(-50%, -100%)';
  texte.style.color = couleur;
  texte.style.fontSize = '1.5em';
  texte.style.fontWeight = 'bold';
  texte.style.zIndex = 30;
  texte.style.pointerEvents = 'none';
  texte.style.animation = 'floatUpDelayed 2s ease-out';

  const container = document.getElementById('map-inner');
  if (container) container.appendChild(texte);
  setTimeout(() => texte.remove(), 2000);
}

// --- Gestion des barres de vie et mana ---
function mettre_a_jour_barre_vie() {
  const barre_vie = document.getElementById('vie-fill');
  if (!barre_vie) return;
  const pourcentage = (get_player_pv() / get_pv_max_joueur()) * 100;
  barre_vie.style.width = `${pourcentage}%`;
}

function mettre_a_jour_barre_mana() {
  const barre_mana = document.getElementById('mana-fill');
  if (!barre_mana) return;
  const pourcentage = (get_mana_joueur() / get_mana_max_joueur()) * 100;
  barre_mana.style.width = `${pourcentage}%`;
}

// --- Application de dégâts au joueur ---
function infliger_degats_au_joueur(valeur) {
  const pv_avant = get_player_pv();
  set_pv_joueur(pv_avant - valeur);

  afficher_texte_flottant(`-${valeur}`, 'red');
  mettre_a_jour_barre_vie();

  const joueur = document.getElementById('player');
  if (joueur) {
    joueur.classList.add('take-damage');
    setTimeout(() => joueur.classList.remove('take-damage'), 300);
  }
}

// --- Gestion Game Over ---
function afficher_game_over() {
  window.is_game_over = true;
  const ecran_game_over = document.getElementById('game-over');
  if (ecran_game_over) {
    ecran_game_over.style.display = 'block';
  }
}

// --- Application de buffs/debuffs ---
function afficher_buff_joueur(nom_buff) {
  afficher_texte_flottant(`+${nom_buff}`, '#66ff99');
}

function afficher_debuff_joueur(nom_debuff) {
  afficher_texte_flottant(`-${nom_debuff}`, '#ff6666');
}

// --- Exports publics ---
export {
  afficher_texte_flottant,
  mettre_a_jour_barre_vie,
  mettre_a_jour_barre_mana,
  infliger_degats_au_joueur,
  afficher_game_over,
  afficher_buff_joueur,
  afficher_debuff_joueur
};
