/* =========================================================
   MOOD MANAGER — SOLUS ∴ TIME AWARENESS
   Integração: di_.modules.mood
   ========================================================= */

(function(di_) {
    "use strict";

    di_.register("mood", function() {

        const els = {
            time: document.getElementById('timeNow'),
            mood: document.getElementById('moodLabel'),
            greet: document.getElementById('heroGreeting'),
            sub: document.getElementById('heroSubtitle'),
            range: document.getElementById('timeRange')
        };

        const MOOD_LABELS = {
            manha: ['Manhã focada', 'Primeiro passo'],
            tarde: ['Tarde produtiva', 'Checkpoint do foco'],
            noite: ['Noite tranquila', 'Desacelera']
        };

        function getMood(h) {
            if(h >= 5 && h < 12) return 'manha';
            if(h >= 12 && h < 18) return 'tarde';
            return 'noite';
        }

        function updateClock() {
            const now = new Date();
            const h = now.getHours();
            if(els.time) els.time.textContent = `${String(h).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            const mood = getMood(h);
            const user = di_.state.userName || 'Dual';
            
            if(els.greet) els.greet.textContent = `Boa ${mood}, ${user}`;
            if(els.mood) els.mood.textContent = MOOD_LABELS[mood][0];
        }

        // Init
        setInterval(updateClock, 60000);
        updateClock();
        
        // Listen for name changes
        di_.bus.on('state-change', (d) => {
            if(d.key === 'di_userName') updateClock();
        });

        return { updateClock };
    });

})(window.di_);

