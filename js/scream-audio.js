/**
 * Звук при нажатии «Отпустить»: MP3 из assets или синтез через Web Audio API
 */
(function () {
    let audioCtx = null;

    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSyntheticRelease() {
        const ctx = getCtx();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.95);

        const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.12, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        noise.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
    }

    function tryPlayFile(path) {
        return new Promise((resolve) => {
            const audio = new Audio(path);
            audio.volume = 0.7;
            audio.oncanplaythrough = () => {
                audio.play().then(() => resolve(true)).catch(() => resolve(false));
            };
            audio.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 400);
            audio.load();
        });
    }

    window.playScreamReleaseSound = async function () {
        const paths = window.DOBRA_ASSETS?.sounds;
        const candidates = [
            paths?.screamRelease,
            paths?.screamWhoosh
        ].filter(Boolean);

        for (const p of candidates) {
            const ok = await tryPlayFile(p);
            if (ok) return;
        }
        playSyntheticRelease();
    };
})();
