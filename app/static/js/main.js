// main.js
import { initConnexion, initSmokeAnimation, initParticles } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log("[INIT] DOMContentLoaded déclenché");

  // Effets visuels
  initSmokeAnimation();
  initParticles();

  // === Page de connexion ===
  if (document.getElementById('login-form')) {
    console.log("[PAGE] Login détecté");
    initConnexion();
    return;
  }

  // === Page de jeu ===
  if (document.getElementById('mana-fill')) {
    console.log("[PAGE] Jeu détecté");
    const { updateManaBar, updateVieBar, initialiserTalents } = await import('./player.js');
    const { chargerNouvelleCarte, resizeMapContainer, movePlayer, handleKeydown } = await import('./map.js');

    updateManaBar();
    updateVieBar();

    chargerNouvelleCarte(window.PLAYER_MAP || "P1");
    initialiserTalents();
    resizeMapContainer();

    window.addEventListener('resize', () => {
      resizeMapContainer();
      movePlayer();
    });

    window.addEventListener('keydown', handleKeydown);
    return;
  }

  // === Page du menu (sélecteur de classe) ===
  if (document.querySelector('form[action*="nouvelle-partie"]')) {
    console.log("[PAGE] Menu détecté");
  }
});

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
