// main.js
document.addEventListener('DOMContentLoaded', async () => {
  console.log("[INIT] DOMContentLoaded déclenché");

  initSmokeAnimation();
  initParticles();

  if (document.getElementById('login-form')) {
    console.log("[PAGE] Login détecté");
    initConnexion();
    return;
  }

  if (document.getElementById('health-fill')) {
    console.log("[PAGE] Jeu détecté");
  
    // Importer les fonctions nécessaires
    const { updateHealthBar, setPlayerPv, initialiserTalents, initPlayerStats, utiliserPotion, fuirCombat } = await import('./player.js');
    const { chargerNouvelleCarte, resizeMapContainer, movePlayer, handleKeydown } = await import('./map.js');
  
    // Initialiser les stats du joueur (niveau, XP, or, PV, potions)
    const stats = window.PLAYER_STATS || {};
    initPlayerStats({
      level: stats.niveau || 1,
      xp: stats.xp || 0,
      gold: stats.or || 0,
      potions: stats.potions || 0,
      pv: stats.pv || stats.vie || 100,
      maxPv: stats.pvMax || stats.vie || 100,
      damageBonus: stats.bonusDegats || 0
    });
    
    updateHealthBar();
    
    // Utiliser la position sauvegardée si disponible
    const startMap = window.PLAYER_MAP || "P1";
    const startX = stats.position ? stats.position.x : null;
    const startY = stats.position ? stats.position.y : null;
    
    chargerNouvelleCarte(startMap, startX, startY);
    initialiserTalents();
    resizeMapContainer();
    
    // Bouton potion
    const potionBtn = document.getElementById('potion-btn');
    if (potionBtn) {
      potionBtn.addEventListener('click', utiliserPotion);
    }
    
    // Bouton fuite
    const fleeBtn = document.getElementById('flee-btn');
    if (fleeBtn) {
      fleeBtn.addEventListener('click', fuirCombat);
    }
  
    window.addEventListener('resize', () => {
      resizeMapContainer();
      movePlayer();
    });
  
    // Ajouter l'écouteur pour le clavier
    window.addEventListener('keydown', handleKeydown);
  }
});

import { initConnexion, initSmokeAnimation, initParticles } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("[INIT] DOMContentLoaded déclenché");

  // Fumée & particules
  initSmokeAnimation();
  initParticles();
  console.log("[INIT] Fumée & particules initialisées");

  // === PAGE ACCUEIL ===
  if (document.getElementById('login-form')) {
    console.log("[PAGE] Accueil détectée");
    initConnexion();
  }

  // === PAGE MENU ===
  if (document.querySelector('form[action*="nouvelle-partie"]')) {
    console.log("[PAGE] Menu détecté");
  }
//);
//  // === PAGE JEU ===
//  if (document.getElementById('mana-fill')) {
//    //console.log("[PAGE] Jeu détecté");
//    //updateManaBar();
//    //console.log("[JEU] Mana bar mise à jour");
//
//    //console.log("[JEU] Chargement de la carte :", window.PLAYER_MAP);
//    //chargerNouvelleCarte(window.PLAYER_MAP || "P1");
//
//    initialiserTalents();
//    console.log("[JEU] Talents initialisés");
//
//    resizeMapContainer();
//    console.log("[JEU] Taille de carte ajustée");
//
//    window.addEventListener('resize', () => {
//      console.log("[EVT] Redimensionnement fenêtre");
//      resizeMapContainer();
//      movePlayer();
//    });
//    window.addEventListener('keydown', handleKeydown);
//
//  } else {
//    console.warn("[WARN] Élément #mana-fill non trouvé : page jeu non détectée !"
});
// Ajout de la fonction changeClass pour la sélection de classe dans le menu
const classData = {
  "Paladin": { talents: "Frappe Sacrée • Lumière Divine • Aura Protectrice" },
  "Mage": { talents: "Boule de Feu • Rayon de Givre • Bouclier Arcanique" },
  "Voleur": { talents: "Coup Sournois • Lame Empoisonnée • Pas de l'Ombre" },
  "Barbare": { talents: "Charge Brutale • Rage • Cri de Guerre" }
};

function changeClass(direction) {
  const classes = ["Paladin", "Mage", "Voleur", "Barbare"];
  const image = document.getElementById("class-image");
  const input = document.getElementById("classe");
  const nameEl = document.getElementById("class-name");
  const descEl = document.getElementById("class-desc");
  
  let currentIndex = classes.indexOf(input.value);
  currentIndex = (currentIndex + direction + classes.length) % classes.length;
  
  const selectedClass = classes[currentIndex];
  input.value = selectedClass;
  image.src = `/static/img/classes/${selectedClass.toLowerCase()}.png`;
  
  if (nameEl) nameEl.textContent = selectedClass;
  if (descEl) descEl.textContent = classData[selectedClass].talents;
}

// Rendre changeClass accessible globalement
window.changeClass = changeClass;

// Navigation clavier pour le sélecteur de classe (flèches gauche/droite)
document.addEventListener('keydown', (e) => {
  // Seulement sur la page menu (si le sélecteur existe)
  if (!document.getElementById("class-selector")) return;
  
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    changeClass(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    changeClass(1);
  }
});