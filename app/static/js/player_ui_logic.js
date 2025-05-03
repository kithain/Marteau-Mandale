// talents_ui_logic.js
// Mise à jour visuelle dynamique des talents (cooldown visible)

// --- Imports ---
import { get_talents } from './player_talents_logic.js';
import { utiliser_talent } from './player_talents_logic.js';

// --- Mise à jour visuelle des boutons de talents ---
function mettre_a_jour_boutons_talents() {
  const talents = get_talents();
  const conteneur = document.getElementById('talents-buttons');
  if (!conteneur) return;

  conteneur.innerHTML = '';

  talents.forEach((talent, index) => {
    const bouton = document.createElement('button');
    bouton.id = `talent-btn-${index}`;
    bouton.textContent = `${index + 1}. ${talent.nom}`;
    bouton.disabled = !talent.estDisponible();

    bouton.addEventListener('click', () => {
      if (window.combat_actif && talent.estDisponible()) {
        utiliser_talent(talent, index);
        mettre_a_jour_boutons_talents(); // Reforcer mise à jour après utilisation
      }
    });

    conteneur.appendChild(bouton);
  });
}

// --- Initialisation du joueur ---
function initialiser_joueur(niveau) {
  // Initialise les stats de base selon le niveau
  const pvBase = 100 + (niveau * 20);
  const manaBase = 30 + (niveau * 5);
  
  // Mettre à jour l'état du joueur (implémentation réelle à compléter)
  console.log(`[UI] Initialisation joueur - Niveau ${niveau}`);
  
  // Retourner les stats initiales
  return { pv: pvBase, mana: manaBase };
}

// --- Boucle de mise à jour automatique des cooldowns ---
function initialiser_mise_a_jour_talents() {
  setInterval(() => {
    mettre_a_jour_boutons_talents();
  }, 500); // Mettre à jour toutes les 0,5 seconde
}

// --- Initialisation des talents ---
function initialiser_talents() {
  mettre_a_jour_boutons_talents();
  initialiser_mise_a_jour_talents();
}

// --- Exports publics ---
export {
  initialiser_mise_a_jour_talents,
  mettre_a_jour_boutons_talents,
  initialiser_joueur,
  initialiser_talents
};
