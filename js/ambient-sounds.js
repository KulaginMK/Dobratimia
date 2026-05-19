/**
 * Ambient-звуки для медитаций (дождь, ветер и т.д.)
 */
(function () {
    const AMBIENT = [
        { id: 'rain', label: 'Дождь', emoji: '🌧️', key: 'rain' },
        { id: 'wind', label: 'Ветер', emoji: '💨', key: 'wind' },
        { id: 'forest', label: 'Лес', emoji: '🌲', key: 'forest' },
        { id: 'waves', label: 'Волны', emoji: '🌊', key: 'waves' },
        { id: 'fire', label: 'Костёр', emoji: '🔥', key: 'fire' }
    ];

    let currentAudio = null;
    let currentId = null;

    function buildUI() {
        const host = document.getElementById('ambient-sounds-host');
        if (!host) return;

        host.innerHTML = `
            <h3 class="card-title">🎧 Ambient-звуки</h3>
            <p style="color: var(--text-light); margin-bottom: 0.5rem;">
                Положите MP3 в <code>assets/sounds/ambient/</code> (rain.mp3, wind.mp3…)
            </p>
            <div class="ambient-grid" id="ambient-grid"></div>
            <button type="button" class="btn btn-secondary" id="ambient-stop" style="margin-top: 1rem; width: auto;">
                ⏹ Остановить
            </button>
        `;

        const grid = document.getElementById('ambient-grid');
        AMBIENT.forEach((a) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ambient-btn';
            btn.dataset.id = a.id;
            btn.innerHTML = `<span>${a.emoji}</span>${a.label}`;
            btn.addEventListener('click', () => toggleAmbient(a));
            grid.appendChild(btn);
        });

        document.getElementById('ambient-stop')?.addEventListener('click', stopAmbient);
    }

    function toggleAmbient(item) {
        if (currentId === item.id) {
            stopAmbient();
            return;
        }
        stopAmbient();

        const paths = window.DOBRA_ASSETS?.sounds?.ambient;
        const src = paths?.[item.key];
        if (!src) return;

        currentAudio = new Audio(src);
        currentAudio.loop = true;
        currentAudio.volume = 0.45;
        currentAudio.play().catch(() => {
            window.showToast?.('🔇 Добавьте файл: ' + src);
        });
        currentId = item.id;

        document.querySelectorAll('.ambient-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.id === item.id);
        });
    }

    function stopAmbient() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        currentId = null;
        document.querySelectorAll('.ambient-btn').forEach((b) => b.classList.remove('active'));
    }

    document.addEventListener('DOMContentLoaded', buildUI);
})();
