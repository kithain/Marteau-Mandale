document.addEventListener("DOMContentLoaded", function () {
    tsParticles.load("particles-js", {
        "particles": {
            "number": {
                "value": 60,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "shape": {
                "type": ["image"],
                "image": [
                    {
                        "src": "assets/images/spark1.png",
                        "width": 32,
                        "height": 32
                    },
                    {
                        "src": "assets/images/spark2.png",
                        "width": 32,
                        "height": 32
                    }
                ]
            },
            "color": {
                "value": ["#ffcc00", "#ffaa00"]
            },
            "opacity": {
                "value": 1,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 5,
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
                "speed": 4,
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
        "retina_detect": true,
        "background": {
            "opacity": 0
        }
    });
});