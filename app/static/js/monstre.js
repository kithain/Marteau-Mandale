// monstre.js

import { infligerDegatsAuJoueur, combatActif } from './player.js';
import { afficherMobDegats } from './utils.js';

let monstre = null;
let pv = 0;
let attaqueInterval = null;

export function demarrerCombat(monstreData, pvInitial) {
  monstre = monstreData;
  pv = pvInitial;
  // Générer un id unique et l'enregistrer dans l'objet monstre
  const uniqueId = `${monstreData.id}-${Date.now()}`;
  monstre.uniqueId = uniqueId;
  creerMonstreVisuel(monstreData.image, uniqueId);
  attaqueInterval = setInterval(attaqueJoueur, 5000);
}

function attaqueJoueur() {
    if (!monstre || !combatActif) return;
  
    if (monstre.stunned) {
      console.log(`${monstre.nom} est étourdi et ne peut pas attaquer.`);
      return;
    }
  
    const degats = monstre.degats || 1;
    console.log(`${monstre.nom} attaque et inflige ${degats} dégâts !`);
    
    infligerDegatsAuJoueur(degats);
    afficherMobDegats(degats);
    animerAttaqueMonstre(); 
    
    const monstreDiv = document.getElementById("combat-monstre");
    if (monstreDiv) {
      monstreDiv.classList.add("secousse-monstre");
      setTimeout(() => monstreDiv.classList.remove("secousse-monstre"), 200);
    }
  }

  export function recevoirDegats(uniqueId, valeur = 1) {
    // Vérifie si le monstre avec cet uniqueId existe dans l'objet global
    if (!window.monstresActifs || !window.monstresActifs[uniqueId]) return;
    
    // Met à jour les PV du monstre
    window.monstresActifs[uniqueId].pv -= valeur;
    console.log(`Le monstre ${window.monstresActifs[uniqueId].data.nom} (ID: ${uniqueId}) reçoit ${valeur} dégâts. PV restant: ${window.monstresActifs[uniqueId].pv}`);

  
    const monstreDiv = window.monstresActifs[uniqueId].element;
    if (monstreDiv) {
      monstreDiv.style.filter = "brightness(150%)";
      setTimeout(() => monstreDiv.style.filter = "", 300);
    }
  
    // Si les PV sont épuisés, on déclenche la fin du combat pour ce monstre
    if (window.monstresActifs[uniqueId].pv === 0) {
      console.log(`✅ Le ${window.monstresActifs[uniqueId].data.nom} est vaincu !`);
      finCombat(uniqueId);
    }
  }
  

  export function finCombat(uniqueId) {
    const monstre = window.monstresActifs[uniqueId];
    if (!monstre) return;
    
    const monstreDiv = monstre.element;
    if (monstreDiv) {
      // Applique l'animation de disparition
      monstreDiv.classList.add("fade-out");
      monstreDiv.addEventListener('animationend', () => {
      monstreDiv.remove();
      });
    }
    // Supprime le monstre de l'objet global
    delete window.monstresActifs[uniqueId];
  }
  

function creerMonstreVisuel(image, uniqueId, posX = 0, posY = 0) {
  const monstreDiv = document.createElement('div');
  monstreDiv.id = uniqueId ? `combat-monstre-${uniqueId}` : 'combat-monstre';
  monstreDiv.className = 'monstre';
  monstreDiv.style.width = '64px';
  monstreDiv.style.height = '64px';
  monstreDiv.style.left = `${posX * 64}px`;
  monstreDiv.style.top = `${posY * 64}px`;
  monstreDiv.style.backgroundImage = `url(/static/img/monstres/${image})`;
  document.getElementById("map-inner").appendChild(monstreDiv);
}

function animerAttaqueMonstre() {
    const monstreDiv = document.getElementById("combat-monstre");
    if (monstreDiv) {
      monstreDiv.style.transform = "translate(0, 0) scale(1.2)";
      setTimeout(() => {
        monstreDiv.style.transform = "translate(0, 0) scale(1)";
      }, 200);
    }
  }

