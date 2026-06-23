async function loadTraits() {
    const res = await fetch('./data/traits.json');
    const traits = await res.json();
    const grid = document.getElementById('traits-grid');

    grid.innerHTML = traits.map(t => `
        <div class="trait-card">
            <span class="trait-emoji">${t.emoji}</span>
            <h3 class="trait-title">${t.title}</h3>
            <p class="trait-desc">${t.description}</p>
        </div>
    `).join('');
}
