/**
 * Голосовой ввод для раздела «Крик» (Web Speech API)
 */
(function () {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    function getTextarea() {
        return document.getElementById('scream-text');
    }

    function setRecordingUI(active) {
        const startBtn = document.getElementById('scream-start-recording');
        const stopBtn = document.getElementById('scream-stop-recording');
        const explodeBtn = document.getElementById('scream-explode');
        const cancelBtn = document.getElementById('scream-cancel');
        const indicator = document.getElementById('scream-voice-indicator');

        if (startBtn) startBtn.classList.toggle('hidden', active);
        if (stopBtn) stopBtn.classList.toggle('hidden', !active);
        if (explodeBtn) explodeBtn.classList.toggle('hidden', active);
        if (cancelBtn) cancelBtn.classList.toggle('hidden', active);
        if (indicator) {
            indicator.classList.toggle('active', active);
            indicator.textContent = active
                ? '🔴 Слушаю… говорите свободно'
                : '🎤 Нажмите «Голос» или удерживайте кнопку микрофона';
        }
    }

    function initRecognition() {
        if (!SpeechRecognition) return null;

        const rec = new SpeechRecognition();
        rec.lang = 'ru-RU';
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (event) => {
            const ta = getTextarea();
            if (!ta) return;

            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t;
                else interim += t;
            }

            if (final) {
                const base = ta.dataset.voiceBase || ta.value;
                ta.dataset.voiceBase = (base + ' ' + final).trim();
                ta.value = ta.dataset.voiceBase;
            } else if (interim) {
                const base = ta.dataset.voiceBase || '';
                ta.value = (base + ' ' + interim).trim();
            }
        };

        rec.onerror = (e) => {
            console.warn('Speech recognition:', e.error);
            if (e.error === 'not-allowed') {
                window.showToast?.('🎤 Разрешите доступ к микрофону в настройках браузера');
            } else if (e.error !== 'aborted') {
                window.showToast?.('🎤 Голосовой ввод недоступен. Используйте текст.');
            }
            stopRecording();
        };

        rec.onend = () => {
            if (isListening) {
                try { rec.start(); } catch (_) { /* ignore */ }
            }
        };

        return rec;
    }

    window.startRecording = function () {
        if (!SpeechRecognition) {
            window.showToast?.('🎤 Голосовой ввод поддерживается в Chrome и Edge');
            return;
        }
        if (!recognition) recognition = initRecognition();
        if (!recognition) return;

        const ta = getTextarea();
        if (ta && !ta.dataset.voiceBase) {
            ta.dataset.voiceBase = ta.value.trim();
        }

        try {
            recognition.start();
            isListening = true;
            setRecordingUI(true);
        } catch (e) {
            if (e.message && e.message.includes('already')) {
                isListening = true;
                setRecordingUI(true);
            }
        }
    };

    window.stopRecording = function () {
        isListening = false;
        if (recognition) {
            try { recognition.stop(); } catch (_) { /* ignore */ }
        }
        const ta = getTextarea();
        if (ta) {
            ta.dataset.voiceBase = ta.value.trim();
        }
        setRecordingUI(false);
    };

    window.clearVoiceBase = function () {
        const ta = getTextarea();
        if (ta) delete ta.dataset.voiceBase;
    };

    document.addEventListener('DOMContentLoaded', () => {
        const holdBtn = document.getElementById('scream-hold-voice');
        if (!holdBtn || !SpeechRecognition) {
            if (holdBtn) holdBtn.style.display = 'none';
            return;
        }

        const start = (e) => {
            e.preventDefault();
            window.startRecording();
        };
        const stop = (e) => {
            e.preventDefault();
            window.stopRecording();
        };

        holdBtn.addEventListener('mousedown', start);
        holdBtn.addEventListener('touchstart', start, { passive: false });
        holdBtn.addEventListener('mouseup', stop);
        holdBtn.addEventListener('mouseleave', stop);
        holdBtn.addEventListener('touchend', stop);
        holdBtn.addEventListener('touchcancel', stop);
    });
})();
