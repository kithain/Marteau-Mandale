//utils.js
export function initConnexion() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  if (loginBtn && registerBtn) {
    loginBtn.onclick = async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log("Tentative de login avec :", username, password);

      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      console.log("[LOGIN] Réponse reçue :", result); // ✅ log réponse serveur
      afficherMessage(result.message, response.ok ? 'success' : 'error');

      if (response.ok && result.redirect) {
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1000); // petit délai pour lire le message
      }
    };

    registerBtn.onclick = async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      afficherMessage(result.message, response.ok ? 'success' : 'error');
    };
  }
}

export function afficherMessage(message, type = 'info') {
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

export function initSmokeAnimation() {
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

export function afficherMobDegats(valeur) {
  const player = document.getElementById("player");
  if (!player) return;

  const texte = document.createElement("div");
  texte.textContent = `-${valeur}`;
  texte.style.position = "absolute";
  texte.style.left = player.style.left;
  texte.style.top = player.style.top;
  texte.style.transform = "translate(-50%, -100%)";
  texte.style.color = "red";
  texte.style.fontSize = "1.5em";
  texte.style.fontWeight = "bold";
  texte.style.zIndex = 20;
  texte.style.animation = "floatUpDelayed 2s ease-out";
  document.getElementById("map-inner").appendChild(texte);

  setTimeout(() => texte.remove(), 2000);
}

export function initParticles() {
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
