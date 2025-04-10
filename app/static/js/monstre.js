/* monstre.js */
import { infligerDegatsAuJoueur, setCombat, getPlayerX, getPlayerY } from './player.js';
import { afficherMobDegats } from './utils.js';

// Stockage du monstre actuellement engagé dans le combat
let monstreActif = null;
let attaqueInterval = null;

/**
 * Crée l'élément DOM pour le monstre en combat.
 * @param {string} image - Le nom de l'image du monstre.
 * @param {string} uniqueId - L'identifiant unique du monstre.
 * @param {number} posX - La coordonnée X pour le placement (par défaut 0).
 * @param {number} posY - La coordonnée Y pour le placement (par défaut 0).
 * @returns {HTMLElement} L'élément DOM créé.
 */
function createMonsterElement(image, uniqueId, posX = 0, posY = 0) {
  const monstreDiv = document.createElement('div');
  monstreDiv.id = `combat-monstre-${uniqueId}`;
  monstreDiv.className = 'monstre';
  monstreDiv.style.width = '64px';
  monstreDiv.style.height = '64px';
  monstreDiv.style.left = `${posX * 64}px`;
  monstreDiv.style.top = `${posY * 64}px`;
  monstreDiv.style.backgroundImage = `url(/static/img/monstres/${image})`;
  document.getElementById("map-inner").appendChild(monstreDiv);
  return monstreDiv;
}

export function demarrerCombat(monstreData, pvInitial, posX = 0, posY = 0) {
  // Si un monstre est déjà actif, le retirer avant de démarrer un nouveau combat
  if (monstreActif && monstreActif.element) {
    monstreActif.element.remove();
    clearInterval(attaqueInterval);
    monstreActif = null;
  }
  
  // Générer un identifiant unique pour ce combat
  const uniqueId = `${monstreData.id}-${Date.now()}`;
  monstreData.uniqueId = uniqueId;
  
  // Créer l'élément visuel du monstre
  const element = createMonsterElement(monstreData.image, uniqueId, posX, posY);
  
  // Stocker le monstre actif avec ses données et l'élément DOM associé
  monstreActif = {
    data: monstreData,
    pv: pvInitial,
    element: element,
  };

  setCombat(true);

  // Lancer l'attaque automatique du monstre toutes les 5 secondes
  attaqueInterval = setInterval(() => attaqueJoueur(), 5000);
}

/**
 * Gère l'attaque automatique du monstre sur le joueur.
 */
function attaqueJoueur() {
  if (!monstreActif) return;
  
  // Récupérer la position actuelle du joueur
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  
  // Calculer la position du monstre (en supposant que la taille d'une tuile est de 64 pixels)
  const monsterX = parseInt(monstreActif.element.style.left) / 64;
  const monsterY = parseInt(monstreActif.element.style.top) / 64;
  
  // Si le joueur n'est plus sur la même case, on annule l'attaque et termine le combat
  if (playerX !== monsterX || playerY !== monsterY) {
    console.log("Le joueur n'est plus sur la case du monstre, l'attaque est annulée.");
    suspendCombat();
    return;
  }
  
  // Si le monstre est étourdi, il n'attaque pas
  if (monstreActif.data.stunned) {
    console.log(`${monstreActif.data.nom} est étourdi et ne peut pas attaquer.`);
    return;
  }
  
  const degats = monstreActif.data.degats || 1;
  console.log(`${monstreActif.data.nom} attaque et inflige ${degats} dégâts !`);
  
  // Infliger les dégâts au joueur et afficher l'animation correspondante
  infligerDegatsAuJoueur(degats);
  afficherMobDegats(degats);
  
  // Appliquer l'animation d'attaque sur le monstre
  animerAttaqueMonstre(monstreActif.data.uniqueId);
}

/**
 * Anime l'attaque du monstre.
 * @param {string} uniqueId - L'identifiant unique du monstre.
 */
function animerAttaqueMonstre(uniqueId) {
  const monstreDiv = document.getElementById(`combat-monstre-${uniqueId}`);
  if (!monstreDiv) return;
  monstreDiv.style.transform = "translate(0, 0) scale(1.2)";
  setTimeout(() => {
    monstreDiv.style.transform = "translate(0, 0) scale(1)";
  }, 200);
}

/**
 * Fait réceptionner des dégâts au monstre.
 * @param {number} valeur - La valeur des dégâts (par défaut 1).
 */
export function recevoirDegats(valeur = 1) {
  if (!monstreActif) return;
  
  monstreActif.pv = Math.max(0, monstreActif.pv - valeur);
  console.log(`Le ${monstreActif.data.nom} reçoit ${valeur} dégâts, PV restant : ${monstreActif.pv}`);
  
  // Animation flash pour indiquer les dégâts
  if (monstreActif.element) {
    monstreActif.element.style.filter = "brightness(150%)";
    setTimeout(() => { 
      monstreActif.element.style.filter = ""; 
    }, 300);
  }
  
  // Si les PV sont épuisés, terminer le combat
  if (monstreActif.pv === 0) {
    console.log(`✅ Le ${monstreActif.data.nom} est vaincu !`);
    finCombat();
  }
}

function suspendCombat() {
  clearInterval(attaqueInterval);
  setCombat(false);
  // Le monstre reste affiché dans le DOM et monstreActif reste défini.
  console.log("Combat suspendu, le monstre reste sur la carte.");
}

export function finCombat() {
  // Arrête l'attaque automatique
  clearInterval(attaqueInterval);
  
  // Réactive la possibilité de déplacement
  setCombat(false);

  if (monstreActif) {
    // Si le monstre est vaincu (pv === 0), le retirer de la carte
    if (monstreActif.pv === 0) {
      if (monstreActif.element) {
        monstreActif.element.classList.add("fade-out");
        // Supprimer l'élément dès que l'animation est terminée
        monstreActif.element.addEventListener('animationend', () => {
          if (monstreActif && monstreActif.element) {
            monstreActif.element.remove();
          }
        });
        // En cas de souci, supprimer après un délai
       // setTimeout(() => {
       //   if (monstreActif && monstreActif.element && document.body.contains(monstreActif.element)) {
       //     monstreActif.element.remove();
       //   }
       // }, 600);
      }
      monstreActif = null;
    } else {
      // Si le monstre est encore vivant, l'indiquer dans la console (il reste affiché sur la carte)
      console.log("Combat terminé, mais le monstre est toujours vivant.");
    }
  }
}

export function getMonstreActif() { 
  return monstreActif; 
}
