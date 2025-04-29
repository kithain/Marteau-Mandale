// main_entry_point.js
// Point d'entrée principal du jeu Marteau-Mandale (initialisation, UI, chargement, sauvegarde...)
// Refactorisé pour clarté, organisation et maintenabilité

import { 
  initialiser_stats_joueur,
  load_player_data,
  start_regen_utils
} from './player_main_logic.js';

import { 
  charger_carte_initiale, 
  chargerNouvelleCarte as charger_nouvelle_carte 
} from '/static/js/map_main_logic.js';

import { init_connexion, init_smoke_animation, init_particles } from './utils_main_logic.js';
import { handle_keydown } from './input_handler_logic.js';
import { reset_deplacement_sans_rencontre, set_deplacement_sans_rencontre, generer_rencontre } from './combat_manager_logic.js';
import { initialiser_talents } from './player_talents_logic.js';
import { update_all_player_ui } from './player_ui_logic.js';
import { get_player_save_data } from './player_state_logic.js';

// --- Fonctions utilitaires globales ---
/**
 * Affiche un message de notification non bloquant.
 * @param {string} message - Le message à afficher.
 * @param {string} [color='#333'] - La couleur de fond du message.
 */
function showToast(message, color = '#333') {
  let toast = document.getElementById('notif-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notif-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = color;
    toast.style.color = 'white';
    toast.style.padding = '12px 32px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1.1em';
    toast.style.zIndex = 9999;
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    toast.style.display = 'none';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.transition = 'opacity 0.6s';
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; toast.style.transition = ''; }, 600);
  }, 1800);
}

// --- Chargement dynamique des talents depuis talents.json ---
/**
 * Charge les talents depuis le fichier talents.json et démarre le jeu.
 */
function chargerTalentsEtDemarrerJeu() {
  fetch('/static/talents/talents.json')
    .then(response => response.json())
    .then(talentsData => {
      window.talentsDisponibles = {};
      talentsData.classes.forEach(classeObj => {
        window.talentsDisponibles[classeObj.class] = classeObj.talents;
      });
      demarrerJeu();
    });
}

// --- Initialisation et synchronisation du jeu ---
/**
 * Initialise et synchronise le jeu.
 */
function demarrerJeu() {
  reset_deplacement_sans_rencontre();
  init_connexion();
  init_smoke_animation();
  document.addEventListener('keydown', handle_keydown);

  // Initialisation du jeu si on est sur la page de jeu (script JSON présent)
  const dataElem = document.getElementById('player-data');
  if (dataElem) {
    let saveData;
    try {
      saveData = JSON.parse(dataElem.textContent);
    } catch (err) {
      console.error("[ERROR] Impossible de parser player-data:", err);
      return;
    }
    // Synchronisation vie/mana depuis la sauvegarde
    load_player_data(saveData);
    // Définition des variables globales pour la compatibilité
    window.PLAYER_CLASS = saveData.classe;
    // window.PLAYER_TALENTS n'est plus utilisé
    window.PLAYER_MAP = saveData.carte;
    window.PLAYER_LEVEL = saveData.niveau;
    window.PLAYER_XP = saveData.experience;
    window.PLAYER_STATS = saveData.statistiques;
    window.PLAYER_INVENTAIRE = saveData.inventaire;
    window.PLAYER_POSITION = saveData.position;
    // Initialiser l'état de combat à false au chargement
    window.combatActif = false;
    // Ajout : synchronisation du compteur de déplacement sans rencontre
    window.DEP_SANS_RENCONTRE = (typeof saveData.deplacementSansRencontre === 'number') ? saveData.deplacementSansRencontre : 3;
    set_deplacement_sans_rencontre(window.DEP_SANS_RENCONTRE);
    // Si la position est {x: 0, y: 0}, on considère qu'il faut utiliser le player_start de la carte
    let pos = saveData.position;
    let usePlayerStart = false;
    if (pos && pos.x === 0 && pos.y === 0) {
      usePlayerStart = true;
    }
    // Charger la carte et position de départ
    try {
      if (usePlayerStart) {
        charger_carte_initiale(saveData.carte, null, null);
      } else {
        charger_nouvelle_carte(saveData.carte, saveData.position.x, saveData.position.y);
      }
    } catch (err) {
      console.error("[ERROR] Chargement carte échoué:", err);
    }
    // Initialiser les talents du joueur
    try {
      initialiser_talents();
    } catch (err) {
      console.error("[ERROR] Initialisation talents échouée:", err);
    }
    // Mettre à jour l'interface utilisateur
    update_all_player_ui();
  }

  // === Sauvegarde de la partie ===
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const saveData = get_player_save_data();
      if (typeof saveData.vie !== 'number' || typeof saveData.mana !== 'number') {
        console.warn('[ALERTE] PV ou Mana non valides au moment de la sauvegarde !');
      }
      try {
        const response = await fetch('/api/sauvegarder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData)
        });
        if (response.ok) {
          showToast('Partie sauvegardée !', '#388e3c');
        } else {
          showToast('Erreur lors de la sauvegarde.', '#c62828');
        }
      } catch (err) {
        showToast('Erreur réseau lors de la sauvegarde.', '#c62828');
      }
    });
  }
}

// --- Exports publics ---
export {
  showToast,
  chargerTalentsEtDemarrerJeu,
  demarrerJeu
};

// --- Détection de la page et lancement conditionnel ---
document.addEventListener('DOMContentLoaded', () => {
  // Page de sélection de classe : présence de l'élément class-image
  const isPageSelectionClasse = !!document.getElementById('class-image');
  // Page de jeu : présence de l'élément player-data
  const isPageJeu = !!document.getElementById('player-data');
  const isPageLogin = !!document.getElementById('login-btn') && !!document.getElementById('register-btn');
  if (isPageSelectionClasse || isPageJeu) {
    chargerTalentsEtDemarrerJeu();
  }
  if (isPageLogin) {
    init_connexion();
    init_particles();
  }
});

// --- Sélecteur de classe (menu principal) ---
/**
 * Change la classe du joueur.
 * @param {number} direction - La direction de changement (1 pour aller à la classe suivante, -1 pour aller à la classe précédente).
 */
function changeClass(direction) {
  const classes = ["Paladin", "Mage", "Voleur", "Barbare"];
  const image = document.getElementById("class-image");
  const input = document.getElementById("classe");
  let currentIndex = classes.indexOf(input.value);
  currentIndex = (currentIndex + direction + classes.length) % classes.length;
  input.value = classes[currentIndex];
  image.src = `/static/img/classes/${classes[currentIndex].toLowerCase()}.png`;
}
window.changeClass = changeClass;
