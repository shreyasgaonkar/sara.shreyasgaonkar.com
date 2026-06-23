async function loadGrowthChart() {
    const res = await fetch('./data/growth.json');
    const data = await res.json();
    const container = document.getElementById('growth-chart');

    const maxHeight = Math.max(...data.map(d => d.height));
    const minHeight = Math.min(...data.map(d => d.height));
    const maxMonth = Math.max(...data.map(d => d.month));
    const range = maxHeight - minHeight || 1;
    const yMin = minHeight - range * 0.15;
    const yMax = maxHeight + range * 0.2;
    const yRange = yMax - yMin;

    const svgWidth = 500;
    const svgHeight = 180;
    const padding = { top: 20, right: 45, bottom: 28, left: 55 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    function xPos(month) {
        return padding.left + 15 + (month / maxMonth) * (chartW - 15);
    }

    function yPos(height) {
        return padding.top + chartH - ((height - yMin) / yRange) * chartH;
    }

    // Dotted grid lines
    const gridSteps = 3;
    let gridLines = '';
    for (let i = 0; i <= gridSteps; i++) {
        const val = yMin + yRange * (i / gridSteps);
        const y = padding.top + chartH - (i / gridSteps) * chartH;
        gridLines += `<line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="#e8e0e8" stroke-width="0.8" stroke-dasharray="3 5"/>`;
        gridLines += `<text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" class="chart-axis-label">${Math.round(val)}</text>`;
    }

    // X-axis labels
    let xLabels = '';
    data.forEach(d => {
        const label = d.month === 0 ? 'Birth' : `Month ${d.month}`;
        xLabels += `<text x="${xPos(d.month)}" y="${svgHeight - 12}" text-anchor="middle" class="chart-axis-label">${label}</text>`;
    });

    // Smooth curve through points (catmull-rom to bezier)
    function smoothPath(pts) {
        if (pts.length < 2) return '';
        if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
            const cp1y = pts[i].y + (pts[i + 1].y - pts[i].y) / 3;
            const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
            const cp2y = pts[i + 1].y - (pts[i + 1].y - pts[i].y) / 3;
            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1].x},${pts[i + 1].y}`;
        }
        return path;
    }

    const pts = data.map(d => ({ x: xPos(d.month), y: yPos(d.height) }));
    const linePath = smoothPath(pts);

    // Area under curve
    const areaPath = linePath +
        ` L ${pts[pts.length - 1].x},${padding.top + chartH}` +
        ` L ${pts[0].x},${padding.top + chartH} Z`;

    // Calculate approximate line length
    let lineLength = 0;
    for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        lineLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Data points with animated labels
    let dataPoints = '';
    const totalDrawTime = 1.4;
    data.forEach((d, i) => {
        const px = xPos(d.month);
        const py = yPos(d.height);
        const progress = data.length > 1 ? d.month / maxMonth : 0;
        const pointDelay = progress * totalDrawTime;
        dataPoints += `
            <g class="chart-point" style="--delay: ${pointDelay.toFixed(2)}s">
                <circle cx="${px}" cy="${py}" r="7" class="chart-dot-bg"/>
                <circle cx="${px}" cy="${py}" r="4.5" class="chart-dot"/>
                <text x="${px}" y="${py - 16}" text-anchor="middle" class="chart-value">${d.height} cm</text>
            </g>
        `;
    });

    container.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="growth-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff69b4" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#ff69b4" stop-opacity="0.02"/>
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#ffb6c1"/>
                    <stop offset="100%" stop-color="#ff69b4"/>
                </linearGradient>
            </defs>
            ${gridLines}
            ${xLabels}
            <path d="${areaPath}" class="chart-area"/>
            <path d="${linePath}" class="chart-line" style="--line-length: ${Math.ceil(lineLength + 20)}"/>
            ${dataPoints}
        </svg>
    `;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            container.classList.add('visible');
            observer.disconnect();
        }
    }, { threshold: 0.4 });
    observer.observe(container);
}
