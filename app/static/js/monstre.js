// monstre.js

import { infligerDegatsAuJoueur, combatActif } from './player.js';
import { afficherMobDegats } from './utils.js';

let monstre = null;
let pv = 0;
let attaqueInterval = null;

export function demarrerCombat(monstreData, pvInitial) {
  monstre = monstreData;
  pv = pvInitial;
  creerMonstreVisuel(monstre.image);
  attaqueInterval = setInterval(attaqueJoueur, 2000);
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

export function recevoirDegats(valeur = 1) {
  if (!monstre) return;
  pv -= valeur;

  const monstreDiv = document.getElementById("combat-monstre");
  if (monstreDiv) {
    monstreDiv.style.filter = "brightness(150%)";
    setTimeout(() => monstreDiv.style.filter = "", 300);
  }

  if (pv <= 0) {
    console.log(`✅ Le ${monstre.nom} est vaincu !`);
    finCombat();
  }
}

export function finCombat() {
  clearInterval(attaqueInterval);
  attaqueInterval = null;
  monstre = null;

  const monstreDiv = document.getElementById("combat-monstre");
  if (monstreDiv) {
    monstreDiv.classList.add("fade-out");
    setTimeout(() => monstreDiv.remove(), 500);
  }
}

function creerMonstreVisuel(image) {
  const monstreDiv = document.createElement('div');
  monstreDiv.id = 'combat-monstre';
  monstreDiv.className = 'monstre';
  monstreDiv.style.width = monstreDiv.style.height = `64px`;
  monstreDiv.style.left = `${0}px`; // à ajuster selon position
  monstreDiv.style.top = `${0}px`;
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

