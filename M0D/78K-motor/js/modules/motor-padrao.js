
/**
 * KOBLLUX Engine - Versão Funcional Isolada
 * Responsável pela lógica de sequenciamento 3-6-9 e persistência.
 */
const KoblluxEngine = {
    // Configurações Iniciais / Estado
    state: {
        archetypes: [
            "atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine",
            "aion", "kobllux", "artemis", "serena", "genus", "solus",
            "rhea", "uno", "dual", "trinity", "infodose", "horus", "bllue"
        ],
        step: parseInt(localStorage.getItem('kobllux_engine_step') || '0', 10),
        reverse: localStorage.getItem('kobllux_reverse_mode') === 'true',
        jump: parseInt(localStorage.getItem('kobllux_jump_step') || '0', 10),
        use3697: localStorage.getItem('kobllux_cycle_3697') === 'true'
    },

    // Sincroniza estado com LocalStorage
    save() {
        localStorage.setItem('kobllux_engine_step', String(this.state.step));
        localStorage.setItem('kobllux_reverse_mode', String(this.state.reverse));
        localStorage.setItem('kobllux_jump_step', String(this.state.jump));
        localStorage.setItem('kobllux_cycle_3697', String(this.state.use3697));
    },

    // Adiciona o nome do usuário à base de arquétipos
    setUserName(name) {
        const userKey = name.trim().toLowerCase();
        if (userKey && !this.state.archetypes.includes(userKey)) {
            this.state.archetypes.push(userKey);
        }
    },

    /**
     * O Coração do Motor: Gera a sequência fractal
     * @param {string} startArch - Nome do arquétipo inicial
     * @param {number} length - Quantidade de sentenças/fractais
     * @returns {string[]} Lista de nomes de arquétipos sequenciados
     */
    getSequence(startArch, length) {
        const total = this.state.archetypes.length;
        const sequence = [];
        let startIndex = this.state.archetypes.indexOf(startArch);
        if (startIndex === -1) startIndex = 0;

        let currentIndex = startIndex;
        const pattern = this.state.use3697 ? [3, 6, 9, 7] : [this.state.step];

        for (let i = 0; i < length; i++) {
            sequence.push(this.state.archetypes[currentIndex]);
            
            let currentStep = pattern[i % pattern.length];
            if (this.state.reverse) currentStep *= -1;
            
            // Aplica salto (offset)
            currentStep += this.state.jump;

            // Cálculo do Índice com Wrap-around (módulo)
            currentIndex = (currentIndex + currentStep) % total;
            if (currentIndex < 0) currentIndex += total;
        }
        return sequence;
    },

    // Getters/Setters Rápidos
    updateConfig(key, value) {
        if (this.state.hasOwnProperty(key)) {
            this.state[key] = value;
            this.save();
        }
    }
};
