/**
 * Психообразование: интерактивная анатомия стресса
 */
(function () {
    const ORGAN_POSITIONS = {
        brain: { cx: 200, cy: 55, r: 38 },
        heart: { cx: 200, cy: 145, r: 28 },
        lungs: { cx: 200, cy: 130, r: 42 },
        stomach: { cx: 200, cy: 210, r: 32 },
        muscles: { cx: 200, cy: 280, r: 55 },
        adrenals: { cx: 175, cy: 195, r: 14 },
        immune: { cx: 225, cy: 195, r: 14 }
    };

    let organsData = [];

    function buildSvg() {
        const wrap = document.getElementById('anatomy-svg-wrap');
        if (!wrap) return;

        const bodyPath = `
            M 200 25
            C 170 25 155 50 155 75
            C 155 95 165 105 160 120
            L 130 320
            C 125 360 140 380 160 385
            L 175 385 L 175 420 L 225 420 L 225 385 L 240 385
            C 260 380 275 360 270 320
            L 240 120
            C 235 105 245 95 245 75
            C 245 50 230 25 200 25 Z
        `;

        let hotspots = '';
        organsData.forEach((o) => {
            const pos = ORGAN_POSITIONS[o.id];
            if (!pos) return;
            hotspots += `
                <circle class="anatomy-hotspot" data-id="${o.id}"
                    cx="${pos.cx}" cy="${pos.cy}" r="${pos.r}"
                    tabindex="0" role="button"
                    aria-label="${o.name}">
                    <title>${o.emoji} ${o.name}</title>
                </circle>`;
        });

        wrap.innerHTML = `
            <svg class="anatomy-svg" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-label="Схема тела">
                <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#e0f2fe"/>
                        <stop offset="100%" style="stop-color:#dbeafe"/>
                    </linearGradient>
                </defs>
                <path class="anatomy-body" d="${bodyPath}" fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="2"/>
                ${hotspots}
            </svg>
            <div class="anatomy-legend" id="anatomy-legend"></div>
        `;

        const legend = document.getElementById('anatomy-legend');
        if (legend) {
            legend.innerHTML = organsData.map((o) =>
                `<button type="button" class="anatomy-chip" data-id="${o.id}">${o.emoji} ${o.name}</button>`
            ).join('');
        }

        wrap.querySelectorAll('.anatomy-hotspot, .anatomy-chip').forEach((el) => {
            el.addEventListener('click', () => showOrgan(el.dataset.id));
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showOrgan(el.dataset.id);
                }
            });
        });
    }

    function showOrgan(id) {
        const organ = organsData.find((o) => o.id === id);
        const panel = document.getElementById('anatomy-info-panel');
        if (!organ || !panel) return;

        document.querySelectorAll('.anatomy-hotspot').forEach((c) => {
            c.classList.toggle('selected', c.dataset.id === id);
        });
        document.querySelectorAll('.anatomy-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.id === id);
        });

        const block1 = '<div class="anatomy-block"><h4>Что происходит при стрессе</h4><p>' + organ.during + '</p></div>';
        const block2 = '<div class="anatomy-block anatomy-coping"><h4>Как помочь себе</h4><p>' + organ.coping + '</p></div>';
        panel.innerHTML = '<h3>' + organ.emoji + ' ' + organ.name + '</h3>' + block1 + block2;
        panel.classList.add('visible');
    }

    async function loadData() {
        const url = window.DOBRA_ASSETS?.data?.anatomy || 'data/anatomy-stress.json';
        try {
            const res = await fetch(url);
            const json = await res.json();
            organsData = json.organs || [];
        } catch (e) {
            organsData = [
                {
                    id: 'brain',
                    name: 'Головной мозг',
                    emoji: '🧠',
                    during: 'Усиливается тревожная реакция, снижается концентрация.',
                    coping: 'Дыхание, сон, короткие перерывы.'
                }
            ];
        }
        buildSvg();
        if (organsData[0]) showOrgan(organsData[0].id);
    }

    window.initPsychoeducation = function () {
        loadData();
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('anatomy-svg-wrap')) {
            window.initPsychoeducation();
        }
    });
})();
