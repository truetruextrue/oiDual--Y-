/* ═══════════════════════════════════════════════════════════
   0x09 · MANIFESTAR · V · D6
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L4_0x09_svg-overlay_V_D6.js
   Opcode    : 0x09 · MANIFESTAR · ♾ · 963Hz
   V.E.E.B.  : Vibração
   Degrau    : D6 (section)
   Fórmula   : Vibração · f₉=963Hz · campo→forma visual · S² χ=2
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 4 · UTILITARIOS
   Opcode Δ  : 0x05 · Carregar na posição 4 da cadeia
   Nota      : Função utilitária (fallback)
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 1  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=963)
     χ = 1  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════
                                                                                                        OPCODE 0x09 — SVG OVERLAY (∞ ETERNIZAR)
                                                                                                        Visualização geométrica em tempo real
                                                                                                        ═══════════════════════════════════════════════════════════════════════════ */
                                                                                                        const SVG_OVERLAY = {
                                                                                                        svg: null,
                                                                                                        visible: false,
                                                                                                        /**
                                                                                                        * Cria overlay SVG
                                                                                                        */
                                                                                                        create: function() {
                                                                                                        // Remove overlay existente
                                                                                                        if(this.svg) this.svg.remove();
                                                                                                        // Cria novo SVG
                                                                                                        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                                                                                        this.svg.setAttribute('id', 'kobllux-geometry-overlay');
                                                                                                        this.svg.style.cssText = `
                                                                                                        position: fixed;
                                                                                                        inset: 0;
                                                                                                        width: 100vw;
                                                                                                        height: 100vh;
                                                                                                        pointer-events: none;
                                                                                                        z-index: 999999;
                                                                                                        opacity: 0;
                                                                                                        transition: opacity 0.3s ease;
                                                                                                        `;
                                                                                                        document.body.appendChild(this.svg);
                                                                                                        console.log('%c✓ SVG overlay criado', 'color:#39ffb6');
                                                                                                        },
                                                                                                        /**
                                                                                                        * Renderiza geometria no SVG
                                                                                                        */
                                                                                                        render: function() {
                                                                                                        if(!this.svg) this.create();
                                                                                                        // Limpa conteúdo anterior
                                                                                                        this.svg.innerHTML = '';
                                                                                                        // Obtém análise geométrica
                                                                                                        const analysis = KOBLLUX_GEOMETRY.analyze();
                                                                                                        // Renderiza PONTOS (●)
                                                                                                        analysis.pontos.forEach((el, i) => {
                                                                                                        const pos = KOBLLUX_GEOMETRY.PONTO.position(el);
                                                                                                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                                                                                        circle.setAttribute('cx', pos.x);
                                                                                                        circle.setAttribute('cy', pos.y);
                                                                                                        circle.setAttribute('r', '4');
                                                                                                        circle.setAttribute('fill', '#39ffb6');
                                                                                                        circle.setAttribute('opacity', '0.8');
                                                                                                        this.svg.appendChild(circle);
                                                                                                        // Label
                                                                                                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                                                                                                        text.setAttribute('x', pos.x + 8);
                                                                                                        text.setAttribute('y', pos.y - 8);
                                                                                                        text.setAttribute('fill', '#39ffb6');
                                                                                                        text.setAttribute('font-size', '10');
                                                                                                        text.setAttribute('font-family', 'monospace');
                                                                                                        text.textContent = `●${i}`;
                                                                                                        this.svg.appendChild(text);
                                                                                                        });
                                                                                                        // Renderiza RETAS (―)
                                                                                                        analysis.retas.forEach((reta, i) => {
                                                                                                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                                                                                                        line.setAttribute('x1', reta.from.x);
                                                                                                        line.setAttribute('y1', reta.from.y);
                                                                                                        line.setAttribute('x2', reta.to.x);
                                                                                                        line.setAttribute('y2', reta.to.y);
                                                                                                        line.setAttribute('stroke', '#ff52e5');
                                                                                                        line.setAttribute('stroke-width', '1');
                                                                                                        line.setAttribute('opacity', '0.5');
                                                                                                        this.svg.appendChild(line);
                                                                                                        });
                                                                                                        // Renderiza PLANOS (▢)
                                                                                                        analysis.planos.forEach((el, i) => {
                                                                                                        const rect = el.getBoundingClientRect();
                                                                                                        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                                                                                                        polygon.setAttribute('x', rect.left);
                                                                                                        polygon.setAttribute('y', rect.top);
                                                                                                        polygon.setAttribute('width', rect.width);
                                                                                                        polygon.setAttribute('height', rect.height);
                                                                                                        polygon.setAttribute('fill', 'none');
                                                                                                        polygon.setAttribute('stroke', '#00c5e5');
                                                                                                        polygon.setAttribute('stroke-width', '2');
                                                                                                        polygon.setAttribute('opacity', '0.4');
                                                                                                        polygon.setAttribute('stroke-dasharray', '4,4');
                                                                                                        this.svg.appendChild(polygon);
                                                                                                        // Label
                                                                                                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                                                                                                        text.setAttribute('x', rect.left + 4);
                                                                                                        text.setAttribute('y', rect.top + 14);
                                                                                                        text.setAttribute('fill', '#00c5e5');
                                                                                                        text.setAttribute('font-size', '10');
                                                                                                        text.setAttribute('font-family', 'monospace');
                                                                                                        text.setAttribute('font-weight', 'bold');
                                                                                                        text.textContent = `▢${i}`;
                                                                                                        this.svg.appendChild(text);
                                                                                                        });
                                                                                                        // Info box
                                                                                                        const infoBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                                                                                                        infoBox.innerHTML = `
                                                                                                      <rect x="10" y="10" width="280" height="120" fill="rgba(0,0,0,0.8)" stroke="#39ffb6" stroke-width="1"/>
                                                                                                      <text x="20" y="30" fill="#39ffb6" font-size="12" font-family="monospace" font-weight="bold">◇ KOBLLUX GEOMETRY OVERLAY</text>
                                                                                                        <text x="20" y="50" fill="#fff" font-size="10" font-family="monospace">● Pontos: ${analysis.stats.pontos}</text>
                                                                                                          <text x="20" y="65" fill="#fff" font-size="10" font-family="monospace">― Retas: ${analysis.stats.retas}</text>
                                                                                                            <text x="20" y="80" fill="#fff" font-size="10" font-family="monospace">▢ Planos: ${analysis.stats.planos}</text>
                                                                                                              <text x="20" y="95" fill="#fff" font-size="10" font-family="monospace">◇ Cristais: ${analysis.stats.cristais}</text>
                                                                                                                <text x="20" y="115" fill="#39ffb6" font-size="10" font-family="monospace">Pressione 'G' para ocultar</text>
                                                                                                                  `;
                                                                                                                  this.svg.appendChild(infoBox);
                                                                                                                  console.log('%c✓ Geometria renderizada no SVG', 'color:#39ffb6');
                                                                                                                  },
                                                                                                                  /**
                                                                                                                  * Alterna visibilidade do overlay
                                                                                                                  */
                                                                                                                  toggle: function() {
                                                                                                                  if(!this.svg) {
                                                                                                                  this.create();
                                                                                                                  this.render();
                                                                                                                  }
                                                                                                                  this.visible = !this.visible;
                                                                                                                  this.svg.style.opacity = this.visible ? '1' : '0';
                                                                                                                  console.log(`%c${this.visible ? '👁️ Overlay visível' : '🙈 Overlay oculto'}`, 'color:#39ffb6');
                                                                                                                  },
                                                                                                                  /**
                                                                                                                  * Atualiza overlay (resize, mudanças no DOM)
                                                                                                                  */
                                                                                                                  update: function() {
                                                                                                                  if(this.visible) {
                                                                                                                  this.render();
                                                                                                                  }
                                                                                                                  }
                                                                                                                  };