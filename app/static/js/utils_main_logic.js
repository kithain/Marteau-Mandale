// utils_main_logic.js
// Fonctions utilitaires globales pour l'UI et l'animation (harmonisé)
// Ce module centralise les helpers pour l'UI, l'authentification, l'animation et les effets visuels.

// --- Connexion & Authentification ---
// Initialise les listeners pour la connexion et l'inscription utilisateur
/**
 * Initialise les listeners pour la connexion et l'inscription utilisateur
 */
function initConnexion() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  if (loginBtn && registerBtn) {
    loginBtn.onclick = async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log("Tentative de login avec :", username, password);
      const response = await fetch('/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      console.log("[LOGIN] Réponse reçue :", result);
      afficherMessage(result.message, response.ok ? 'success' : 'error');
      if (response.ok && result.redirect) {
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1000);
      }
    };

    // Permettre la validation du login par la touche entrée
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loginBtn.onclick();
      });
    }

    registerBtn.onclick = async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const response = await fetch('/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      afficherMessage(result.message, response.ok ? 'success' : 'error');
    };
  }
}

// --- Affichage de messages utilisateur ---
// Affiche un message de feedback à l'utilisateur (login/register)
/**
 * Affiche un message de feedback à l'utilisateur (login/register)
 * @param {string} message
 * @param {string} [type='info'] - success | error | info
 */
function afficherMessage(message, type = 'info') {
  let feedback = document.getElementById('feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.id = 'feedback';
    feedback.className = 'subtitle';
    document.getElementById('auth-container').appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.style.color = type === 'success' ? 'lightgreen' : type === 'error' ? 'salmon' : 'white';
}

// --- Animation de la fumée sur l'écran d'accueil ---
// Anime la fumée du parallax sur l'écran d'accueil
/**
 * Anime la fumée du parallax sur l'écran d'accueil
 */
function initSmokeAnimation() {
  document.addEventListener('DOMContentLoaded', () => {
    const smoke = document.getElementById('parallax-smoke');
    let t = 0;
    function animateSmokeOpacity() {
      if (!smoke) return;
      const min = 0.15;
      const max = 0.35;
      const amplitude = (max - min) / 2;
      const offset = min + amplitude;
      const opacity = offset + amplitude * Math.sin(t);
      smoke.style.opacity = opacity.toFixed(3);
      t += 0.01;
      requestAnimationFrame(animateSmokeOpacity);
    }
    animateSmokeOpacity();
  });
}

// --- Initialisation des particules décoratives ---
// Initialise l'effet de particules décoratives (tsParticles)
/**
 * Initialise l'effet de particules décoratives (tsParticles)
 */
function initParticles() {
  if (typeof tsParticles === 'undefined') {
    console.log('tsParticles non chargé : les particules sont désactivées sur cette page.');
    return;
  }
  const containerId = "particles-js";
  const container = document.getElementById(containerId);
  tsParticles.load(containerId, {
    particles: {
      number: {
        value: 60,
        density: { enable: true, value_area: 1000 }
      },
      shape: {
        type: ["image"],
        image: [
          {
            src: "/static/img/spark1.png",
            width: 32,
            height: 32
          },
          {
            src: "/static/img/spark2.png",
            width: 32,
            height: 32
          }
        ]
      },
      color: {
        value: ["#ffcc00", "#ffaa00"]
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        random: true,
        anim: { enable: true, speed: 2, opacity_min: 0.1, sync: false }
      },
      size: {
        value: 6,
        random: true
      },
      move: {
        enable: true,
        speed: 5,
        direction: "top",
        random: true,
        out_mode: "out"
      },
      line_linked: { enable: false }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false },
        onclick: { enable: false },
        resize: true
      }
    },
    retina_detect: true,
    background: {
      opacity: 0
    }
  });
}

// --- Effets de statut ---
/**
 * Applique un effet spécial au joueur (buff, debuff, poison, etc.)
 * @param {string} effect_type - Type d'effet à appliquer
 * @param {number} value - Valeur de l'effet
 * @param {number} duration - Durée en secondes
 */
function appliquer_effet(effect_type, value, duration) {
  console.log(`[EFFET] Application de ${effect_type} (valeur: ${value}, durée: ${duration}s)`);
  // Implémentation à compléter
}

// --- Exports publics à la fin ---
export {
  initConnexion,
  afficherMessage,
  initSmokeAnimation,
  initParticles,
  appliquer_effet
};
