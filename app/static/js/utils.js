// === Connexion ===
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  if (loginBtn && registerBtn) {
    loginBtn.onclick = async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok && result.redirect) {
        window.location.href = result.redirect;
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
      alert(result.message);
    };
  }

  // === Animation de la fumée ===
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


// === Particules spark (tsParticles) ===
document.addEventListener("DOMContentLoaded", function () {
  tsParticles.load("particles-js", {
    "particles": {
      "number": {
        "value": 60,
        "density": {
          "enable": true,
          "value_area": 1000
        }
      },
      "shape": {
        "type": ["image"],
        "image": [
          {
            "src": "/static/img/spark1.png",
            "width": 32,
            "height": 32
          },
          {
            "src": "/static/img/spark2.png",
            "width": 32,
            "height": 32
          }
        ]
      },
      "life": {
        "duration": {
          "sync": false,
          "value": { "min": 1, "max": 2.5 }
        }
      },
      "color": {
        "value": ["#ffcc00", "#ffaa00"]
      },
      "opacity": {
        "value": { "min": 0.1, "max": 0.5 },
        "random": true,
        "anim": {
          "enable": true,
          "speed": 2,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 6,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 5,
          "size_min": 3,
          "sync": false
        }
      },
      "line_linked": {
        "enable": false
      },
      "move": {
        "enable": true,
        "speed": 5,
        "direction": "top",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": false },
        "onclick": { "enable": false },
        "resize": true
      }
    },
    "emitters": [
      {
        "position": { "x": 85, "y": 85 },
        "rate": {
          "delay": 0.4,
          "quantity": 2
        },
        "size": {
          "width": 0,
          "height": 0
        },
        "particles": {
          "move": {
            "direction": "top",
            "speed": { "min": 1, "max": 3 },
            "random": true,
            "straight": false,
            "outModes": { "default": "out" }
          },
          "size": {
            "value": 6,
            "random": true
          },
          "color": {
            "value": ["#ffcc00", "#ffaa00"]
          },
          "opacity": {
            "value": 1,
            "random": true
          },
          "shape": {
            "type": "image",
            "image": [
              {
                "src": "/static/img/spark2.png",
                "width": 32,
                "height": 32
              }
            ]
          },
          "life": {
  "duration": {
    "sync": false,
    "value": { "min": 1, "max": 2 }
  }
}
        }
      }
    ],
    "retina_detect": true,
    "background": {
      "opacity": 0
    }
  });
});
