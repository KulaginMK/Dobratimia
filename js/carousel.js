/**
 * Мини-карусель разделов на главной
 */
(function () {
    const SLIDES = [
        {
            id: 'scream',
            icon: '🔥',
            title: 'Крик',
            desc: 'Анонимно выплесните эмоции — текстом или голосом',
            color: '#ef4444'
        },
        {
            id: 'dass',
            icon: '📋',
            title: 'DASS-21',
            desc: 'Оценка депрессии, тревоги и стресса за 5 минут',
            color: '#10b981'
        },
        {
            id: 'meditation',
            icon: '🧘',
            title: 'Медитации',
            desc: 'Дыхание, сон и ambient-звуки природы',
            color: '#3b82f6'
        },
        {
            id: 'psychoeducation',
            icon: '🧬',
            title: 'Анатомия стресса',
            desc: 'Что происходит с телом и как помочь себе',
            color: '#8b5cf6'
        },
        {
            id: 'techniques',
            icon: '💡',
            title: 'Техники',
            desc: 'Дыхание, дневник мыслей, Pomodoro',
            color: '#f59e0b'
        },
        {
            id: 'goodword',
            icon: '💌',
            title: 'Доброе слово',
            desc: 'Тёплая поддержка в один клик',
            color: '#ec4899'
        }
    ];

    let index = 0;
    let timer = null;

    function goTo(i) {
        index = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
        render();
    }

    function render() {
        const track = document.getElementById('home-carousel-track');
        const dots = document.getElementById('home-carousel-dots');
        if (!track) return;

        const s = SLIDES[index];
        track.innerHTML = `
            <article class="carousel-slide" style="--slide-accent: ${s.color}">
                <span class="carousel-slide-icon">${s.icon}</span>
                <h3>${s.title}</h3>
                <p>${s.desc}</p>
                <button type="button" class="btn btn-primary carousel-cta" data-goto="${s.id}">
                    Перейти →
                </button>
            </article>
        `;

        track.querySelector('.carousel-cta')?.addEventListener('click', () => {
            if (typeof window.showSection === 'function') {
                window.showSection(s.id);
            }
        });

        if (dots) {
            dots.innerHTML = SLIDES.map((_, i) =>
                `<button type="button" class="carousel-dot${i === index ? ' active' : ''}" aria-label="Слайд ${i + 1}" data-i="${i}"></button>`
            ).join('');
            dots.querySelectorAll('.carousel-dot').forEach((btn) => {
                btn.addEventListener('click', () => {
                    goTo(parseInt(btn.dataset.i, 10));
                    resetAutoplay();
                });
            });
        }
    }

    function resetAutoplay() {
        clearInterval(timer);
        timer = setInterval(() => goTo(index + 1), 6000);
    }

    window.initHomeCarousel = function () {
        const prev = document.getElementById('carousel-prev');
        const next = document.getElementById('carousel-next');
        prev?.addEventListener('click', () => { goTo(index - 1); resetAutoplay(); });
        next?.addEventListener('click', () => { goTo(index + 1); resetAutoplay(); });
        render();
        resetAutoplay();
    };

    function bindQuickCards() {
        document.querySelectorAll('.home-quick-card').forEach((card) => {
            const go = () => window.showSection?.(card.dataset.goto);
            card.addEventListener('click', go);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    go();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('home-carousel-track')) {
            window.initHomeCarousel();
            bindQuickCards();
        }
    });
})();
