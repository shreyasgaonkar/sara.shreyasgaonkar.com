async function loadMilestones() {
    const res = await fetch('./data/milestones.json');
    const milestones = await res.json();
    const timeline = document.getElementById('timeline');

    milestones.sort((a, b) => b.month - a.month);

    timeline.innerHTML = milestones.map(m => `
        <div class="milestone-card">
            <div class="card-header">
                <span class="month-badge">Month ${m.month}</span>
                <span class="card-title">${m.title}</span>
            </div>
            <div class="card-body">
                ${m.milestones.length ? `
                <div class="card-section milestones">
                    <h3>Milestones</h3>
                    <ul>${m.milestones.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>` : ''}
                ${m.moments && m.moments.length ? `
                <div class="card-section moments">
                    <h3>Moments</h3>
                    <ul>${m.moments.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>` : ''}
                ${m.loves && m.loves.length ? `
                <div class="card-section loves">
                    <h3>Loves</h3>
                    <ul>${m.loves.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>` : ''}
                ${m.dislikes && m.dislikes.length ? `
                <div class="card-section dislikes">
                    <h3>Not a Fan</h3>
                    <ul>${m.dislikes.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>` : ''}
                ${m.personality ? `
                <div class="card-section personality">
                    <h3>Personality</h3>
                    <p>${m.personality}</p>
                </div>` : ''}
            </div>
        </div>
    `).join('');
}

function initScrollReveal() {
    const cards = document.querySelectorAll('.milestone-card');
    let revealQueue = [];
    let isRevealing = false;

    function revealNext() {
        if (revealQueue.length === 0) {
            isRevealing = false;
            return;
        }
        isRevealing = true;
        const card = revealQueue.shift();
        card.classList.add('visible');
        setTimeout(revealNext, 300);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                revealQueue.push(entry.target);
                observer.unobserve(entry.target);
            }
        });
        if (!isRevealing && revealQueue.length > 0) {
            revealNext();
        }
    }, { threshold: 0.4, rootMargin: '0px 0px -100px 0px' });

    cards.forEach(card => observer.observe(card));
}

function initActiveIndicator() {
    const cards = document.querySelectorAll('.milestone-card');
    const lastCard = cards[cards.length - 1];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach(c => c.classList.remove('active'));
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.3, rootMargin: '-20% 0px -50% 0px' });

    const lastObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach(c => c.classList.remove('active'));
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

    cards.forEach(card => {
        if (card === lastCard) {
            lastObserver.observe(card);
        } else {
            observer.observe(card);
        }
    });
}
