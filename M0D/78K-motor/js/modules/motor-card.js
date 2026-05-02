/**
 * KOBLLUX Renderer - Nebula Pro Edition
 * Responsável por injetar a lógica do motor nos componentes visuais.
 */
const KoblluxRenderer = {
    // Configurações de seletor
    dom: {
        container: document.getElementById('outputContainer'),
    },

    /**
     * Renderiza os fractais no DOM
     * @param {string} rawText - Texto bruto para fragmentar
     * @param {string} startArch - Arquétipo inicial (ex: 'atlas')
     */
    render(rawText, startArch) {
        if (!this.dom.container) return;

        // 1. Fragmentação e Sequenciamento via Motor[span_3](start_span)[span_3](end_span)
        const sentences = rawText.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
        const sequence = KoblluxEngine.getSequence(startArch, sentences.length);
        
        // 2. Limpeza do container
        this.dom.container.innerHTML = '';

        // 3. Geração dos Blocos Nebula[span_4](start_span)[span_4](end_span)
        sentences.forEach((text, i) => {
            const arch = sequence[i];
            const fractalBlock = this.createFractalNode(text.trim(), arch, i);
            this.dom.container.appendChild(fractalBlock);
        });
    },

    /**
     * Cria a estrutura HTML baseada no Patch Nebula[span_5](start_span)[span_5](end_span)
     */
    createFractalNode(text, arch, index) {
        const block = document.createElement('div');
        
        // Utiliza a classe .stack-card para o efeito de glassmorphism[span_6](start_span)[span_6](end_span)
        block.className = 'stack-card callout info'; 
        block.style.marginBottom = '1.5rem';
        block.style.animation = `nebulaPulse 0.6s ease-out ${index * 0.1}s both`;

        // Cores dinâmicas injetadas no tema Nebula
        const archDisplay = arch.toUpperCase();

        block.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <!-- Tag estilo Chip Nebula[span_7](start_span)[span_7](end_span) -->
                <span class="chip"><strong>${archDisplay}</strong> · Δ</span>
                <span style="font-size: 0.7rem; opacity: 0.5;">0x0${index.toString(16)}</span>
            </div>
            <!-- Conteúdo em bloco de leitura[span_8](start_span)[span_8](end_span) -->
            <div class="content-inner" style="line-height: 1.6; color: var(--nebula-chip-ink);">
                ${text}
            </div>
        `;

        return block;
    }
};

// CSS de Animação complementar para os blocos
const style = document.createElement('style');
style.textContent = `
    @keyframes nebulaPulse {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
`;
document.head.appendChild(style);
