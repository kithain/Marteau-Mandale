document.addEventListener('mousemove', function(e) {
    const layers = document.querySelectorAll('.layer');
    layers.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 1;
        const x = (e.clientX / window.innerWidth - 0.5) * speed;
        const y = (e.clientY / window.innerHeight - 0.5) * speed;
        layer.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    });
});
