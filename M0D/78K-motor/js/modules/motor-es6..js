
/**
 * KOBLLUX Engine - Versão Classe ES6
 * Design modular para integração em ecossistemas modernos.
 */
export class KoblluxFractalEngine {
    constructor(customArchetypes = []) {
        const baseArchetypes = [
            "atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine",
            "aion", "kobllux", "artemis", "serena", "genus", "solus",
            "rhea", "uno", "dual", "trinity", "infodose", "horus", "bllue"
        ];
        
        this.archetypes = [...baseArchetypes, ...customArchetypes];
        this._loadState();
    }

    _loadState() {
        this.step = parseInt(localStorage.getItem('kobllux_engine_step') || '0', 10);
        this.reverse = localStorage.getItem('kobllux_reverse_mode') === 'true';
        this.jump = parseInt(localStorage.getItem('kobllux_jump_step') || '0', 10);
        this.use3697 = localStorage.getItem('kobllux_cycle_3697') === 'true';
    }

    save() {
        localStorage.setItem('kobllux_engine_step', String(this.step));
        localStorage.setItem('kobllux_reverse_mode', String(this.reverse));
        localStorage.setItem('kobllux_jump_step', String(this.jump));
        localStorage.setItem('kobllux_cycle_3697', String(this.use3697));
    }

    /**
     * Gera uma sequência de vozes/arquétipos
     */
    generateSequence(startArchKey, count) {
        const total = this.archetypes.length;
        let index = this.archetypes.indexOf(startArchKey);
        if (index === -1) index = 0;

        const results = [];
        const pattern = this.use3697 ? [3, 6, 9, 7] : [this.step];

        for (let i = 0; i < count; i++) {
            results.push(this.archetypes[index]);
            
            let move = pattern[i % pattern.length];
            if (this.reverse) move *= -1;
            move += this.jump;

            index = (index + move) % total;
            if (index < 0) index += total;
        }

        return results;
    }

    // Facilita o toggle de modos
    toggleReverse() { this.reverse = !this.reverse; this.save(); return this.reverse; }
    toggleCycle3697() { this.use3697 = !this.use3697; this.save(); return this.use3697; }
    setStep(s) { this.step = s; this.save(); }
    setJump(j) { this.jump = j; this.save(); }
}
