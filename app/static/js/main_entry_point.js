// main_entry_point.js
// Point d'entrée principal du jeu Marteaux & Mandales : initialisation, UI, chargement et sauvegarde

// --- Imports principaux ---
import { initialiser_stats_joueur, initialiser_talents } from './player_main_logic.js';
import { charger_carte_initiale, charger_nouvelle_carte } from './map_main_logic.js';
import { init_connexion, init_particles, init_smoke_animation } from './utils_main_logic.js';
import { initialiser_gestionnaire_entrees } from './input_handler_logic.js';
import { reset_deplacement_sans_rencontre, set_deplacement_sans_rencontre } from './combat_manager_logic.js';
import { update_all_player_ui } from './player_ui_logic.js';
import { obtenir_donnees_sauvegarde, charger_donnees_joueur } from './save_manager_logic.js';

// --- Utilitaire : affichage notifications ---
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
function chargerTalentsEtDemarrerJeu() {
  fetch('/static/talents/talents.json')
    .then(response => response.json())
    .then(talentsData => {
      window.talentsDisponibles = {};
      talentsData.classes.forEach(classeObj => {
        window.talentsDisponibles[classeObj.class] = classeObj.talents;
      });
      demarrerJeu();
    })
    .catch(err => console.error('[Erreur Talents] Impossible de charger talents.json', err));
}

// --- Initialisation et synchronisation du jeu ---
function demarrerJeu() {
  reset_deplacement_sans_rencontre();
  init_connexion();
  init_smoke_animation();
  document.addEventListener('keydown', initialiser_gestionnaire_entrees);

  const dataElem = document.getElementById('player-data');
  if (dataElem) {
    try {
      const saveData = JSON.parse(dataElem.textContent);
      if (saveData) {
        charger_donnees_joueur(saveData);

        window.PLAYER_CLASS = saveData.classe;
        window.PLAYER_MAP = saveData.carte;
        window.PLAYER_LEVEL = saveData.niveau;
        window.PLAYER_XP = saveData.experience;
        window.PLAYER_STATS = saveData.statistiques;
        window.PLAYER_INVENTAIRE = saveData.inventaire;
        window.PLAYER_POSITION = saveData.position;

        window.combatActif = false;

        window.DEP_SANS_RENCONTRE = (typeof saveData.deplacementSansRencontre === 'number') ? saveData.deplacementSansRencontre : 3;
        set_deplacement_sans_rencontre(window.DEP_SANS_RENCONTRE);

        let usePlayerStart = saveData.position?.x === 0 && saveData.position?.y === 0;
        if (usePlayerStart) {
          charger_carte_initiale(saveData.carte);
        } else {
          charger_nouvelle_carte(saveData.carte, saveData.position.x, saveData.position.y);
        }

        initialiser_talents();
        update_all_player_ui();
      }
    } catch (err) {
      console.error("[Erreur] Impossible de parser ou charger player-data:", err);
    }
  }

  // Gestion sauvegarde à la volée via bouton save
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const saveData = obtenir_donnees_sauvegarde();
      if (!saveData) return;
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
      } catch (error) {
        showToast('Erreur réseau lors de la sauvegarde.', '#c62828');
      }
    });
  }
}

// --- Détection page et lancement conditionnel ---
document.addEventListener('DOMContentLoaded', () => {
  const isPageSelectionClasse = !!document.getElementById('class-image');
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

// --- Exports publics ---
export {
  showToast,
  chargerTalentsEtDemarrerJeu,
  demarrerJeu
};
