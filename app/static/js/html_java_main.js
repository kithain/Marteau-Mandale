// html_java_main.js
// Gère uniquement les pages index.html (connexion) et menu.html (sélection classe)

// --- Animations décoratives ---
// Anime la fumée du parallax.

function initSmokeAnimation() {
  const smoke = document.getElementById('parallax-smoke');
  if (!smoke) return;
  let t = 0;

  function animateSmokeOpacity() {
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
}

// Initialise les particules décoratives avec tsParticles.

function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  tsParticles.load('particles-js', {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 1000 } },
      shape: {
        type: ['image'],
        image: [
          { src: '/static/img/spark1.png', width: 32, height: 32 },
          { src: '/static/img/spark2.png', width: 32, height: 32 }
        ]
      },
      color: { value: ['#ffcc00', '#ffaa00'] },
      opacity: { value: { min: 0.1, max: 0.5 }, random: true, anim: { enable: true, speed: 2, opacity_min: 0.1, sync: false } },
      size: { value: 6, random: true },
      move: { enable: true, speed: 5, direction: 'top', random: true, out_mode: 'out' },
      line_linked: { enable: false }
    },
    interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false }, resize: true } },
    retina_detect: true,
    background: { opacity: 0 }
  });
}

// --- Gestion connexion / inscription ---
// Initialise les événements de connexion et inscription.
function initConnexion() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  if (!loginBtn || !registerBtn) return;

  loginBtn.onclick = async () => {
    const nom_utilisateur = document.getElementById('nom_utilisateur').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;

    const response = await fetch('/connexion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_utilisateur: nom_utilisateur, mot_de_passe: mot_de_passe })
    });

    const result = await response.json();
    afficherMessage(result.message, response.ok ? 'success' : 'error');
    if (response.ok && result.redirect) {
      setTimeout(() => { window.location.href = result.redirect; }, 1000);
    }
  };

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await loginBtn.onclick();
    });
  }

  registerBtn.onclick = async () => {
    const nom_utilisateur = document.getElementById('nom_utilisateur').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;

    const response = await fetch('/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_utilisateur, mot_de_passe })
    });

    const result = await response.json();
    afficherMessage(result.message, response.ok ? 'success' : 'error');
  };
}

// Affiche un message à l'utilisateur (succès, erreur, info).

function afficherMessage(message, type = 'info') {
  let feedback = document.getElementById('feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.id = 'feedback';
    feedback.className = 'subtitle';
    document.getElementById('menu-container')?.appendChild(feedback);
  }

  feedback.textContent = message;
  feedback.style.color = type === 'success' ? 'lightgreen' : type === 'error' ? 'salmon' : 'white';
}

// --- Gestion changement de classe ---

function changeClass(direction) {
  const classes = ['Paladin', 'Mage', 'Voleur', 'Barbare'];
  const image = document.getElementById('class-image');
  const input = document.getElementById('classe');
  if (!image || !input) return;

  let currentIndex = classes.indexOf(input.value);
  currentIndex = (currentIndex + direction + classes.length) % classes.length;

  input.value = classes[currentIndex];
  image.src = `/static/img/classes/${classes[currentIndex].toLowerCase()}.png`;
}
window.changeClass = changeClass;

// --- Initialisation globale selon la page ---

document.addEventListener('DOMContentLoaded', () => {
  const isPageLogin = document.getElementById('login-btn') && document.getElementById('register-btn');

  initSmokeAnimation();
  initParticles();

  if (isPageLogin) initConnexion();
});

// --- Exports publics ---
export {
  initConnexion,
  afficherMessage,
  initSmokeAnimation,
  initParticles,
  changeClass
};