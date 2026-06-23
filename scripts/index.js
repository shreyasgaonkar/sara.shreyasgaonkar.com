loadTraits();
loadGrowthChart();
loadMilestones().then(() => {
    initScrollReveal();
    initActiveIndicator();
});
initParallax();
