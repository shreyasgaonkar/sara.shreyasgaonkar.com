function initParallax() {
    const clouds = document.querySelectorAll('.cloud');
    const speeds = [0.3, 0.15, 0.25, 0.1, 0.2];

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        clouds.forEach((cloud, i) => {
            const speed = speeds[i] || 0.2;
            cloud.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}
