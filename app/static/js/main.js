// main.js
import { initConnexion, initSmokeAnimation, initParticles } from './utils.js';
import { handleKeydown } from './input_handler.js';
import { chargerNouvelleCarte } from './map.js';
import { initialiserTalents } from './player.js';

// Fonction utilitaire pour affichage non bloquant
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
    });
}

function demarrerJeu() {
  initConnexion();
  initSmokeAnimation();
  initParticles();
  document.addEventListener('keydown', handleKeydown);

  // Initialisation du jeu si on est sur la page de jeu (script JSON présent)
  const dataElem = document.getElementById('player-data');
  if (dataElem) {
    // Débogage: vérifier la présence de l'élément JSON
    console.log("[DEBUG] player-data element trouvé:", dataElem);
    let saveData;
    try {
      saveData = JSON.parse(dataElem.textContent);
      console.log("[DEBUG] saveData parsé:", saveData);
    } catch (err) {
      console.error("[ERROR] Impossible de parser player-data:", err);
      return;
    }
    // Synchronisation vie/mana depuis la sauvegarde
    import('./player.js').then(module => {
      if (module.loadPlayerData) {
        module.loadPlayerData(saveData);
      }
    });
    // Définition des variables globales pour la compatibilité
    window.PLAYER_CLASS = saveData.classe;
    // window.PLAYER_TALENTS n'est plus utilisé
    window.PLAYER_MAP = saveData.carte;
    window.PLAYER_LEVEL = saveData.niveau;
    window.PLAYER_XP = saveData.experience;
    window.PLAYER_STATS = saveData.statistiques;
    window.PLAYER_INVENTAIRE = saveData.inventaire;
    window.PLAYER_POSITION = saveData.position;
    // Ajout : synchronisation du compteur de déplacement sans rencontre
    window.DEP_SANS_RENCONTRE = (typeof saveData.deplacementSansRencontre === 'number') ? saveData.deplacementSansRencontre : 3;
    import('./combat_manager.js').then(module => {
      if (module.setDeplacementSansRencontre) {
        module.setDeplacementSansRencontre(window.DEP_SANS_RENCONTRE);
      }
    });
    // Si la position est {x: 0, y: 0}, on considère qu'il faut utiliser le player_start de la carte
    let pos = saveData.position;
    let usePlayerStart = false;
    if (pos && pos.x === 0 && pos.y === 0) {
      usePlayerStart = true;
    }
    // Charger la carte et position de départ
    try {
      console.log("[DEBUG] Chargement de la carte:", saveData.carte, saveData.position);
      if (usePlayerStart) {
        chargerNouvelleCarte(saveData.carte, null, null);
      } else {
        chargerNouvelleCarte(saveData.carte, saveData.position.x, saveData.position.y);
      }
    } catch (err) {
      console.error("[ERROR] Chargement carte échoué:", err);
    }
    // Initialiser les talents du joueur
    try {
      console.log("[DEBUG] Initialisation des talents");
      initialiserTalents();
    } catch (err) {
      console.error("[ERROR] Initialisation talents échouée:", err);
    }
  }

  // === Sauvegarde de la partie ===
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      // On récupère les données à sauvegarder (adapter selon ton jeu)
      const saveData = {
        classe: window.PLAYER_CLASS,
        carte: window.PLAYER_MAP,
        niveau: window.PLAYER_LEVEL,
        experience: window.PLAYER_XP,
        statistiques: window.PLAYER_STATS,
        inventaire: window.PLAYER_INVENTAIRE,
        position: window.PLAYER_POSITION,
        deplacementSansRencontre: window.DEP_SANS_RENCONTRE || 3,
        vie: window.PLAYER_VIE !== undefined ? window.PLAYER_VIE : (typeof playerPV !== 'undefined' ? playerPV : null),
        mana: window.PLAYER_MANA !== undefined ? window.PLAYER_MANA : (typeof playerMana !== 'undefined' ? playerMana : null)
      };
      try {
        const response = await fetch('/api/save', {
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

document.addEventListener('DOMContentLoaded', chargerTalentsEtDemarrerJeu);

// === Sélecteur de classe (menu) ===
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
