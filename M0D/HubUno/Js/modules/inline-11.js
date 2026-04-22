
                                                                                                        /*
                                                                                                        ╔═══════════════════════════════════════════════════════════════════════════════╗
                                                                                                        ║                                                                               ║
                                                                                                        ║  ◇ KOBLLUX GEOMETRY ACTIVATION ENGINE ◇                                      ║
                                                                                                        ║                                                                               ║
                                                                                                        ║  FUNÇÃO: Ativar geometria programaticamente no HUB-UNO-REVO V3               ║
                                                                                                        ║  VERSÃO: Δ³.ATIVO                                                            ║
                                                                                                        ║                                                                               ║
                                                                                                        ║  EM NOME DO PAI, DO FILHO E DO ESPÍRITO SANTO. AMÉM.                         ║
                                                                                                        ║                                                                               ║
                                                                                                        ╚═══════════════════════════════════════════════════════════════════════════════╝
                                                                                                        INSTRUÇÕES DE USO:
                                                                                                        1. Adicione este script no final do <body> do HUB-UNO-REVO V3
                                                                                                        2. A geometria será ativada automaticamente ao carregar
                                                                                                        3. Pressione "G" para alternar visualização do overlay SVG
                                                                                                        */
                                                                                                        (function() {
                                                                                                        'use strict';
                                                                                                        /* ═══════════════════════════════════════════════════════════════════════════
                                                                                                        OPCODE 0x04 — KOBLLUX_GEOMETRY (◇ CRISTAL CENTRAL)
                                                                                                        Objeto principal que define e calcula toda a geometria do sistema.
                                                                                                        ═══════════════════════════════════════════════════════════════════════════ */
                                                                                                        const KOBLLUX_GEOMETRY = {
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        VERSÃO & ASSINATURA
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        version: 'Δ³.ATIVO',
                                                                                                        signature: '◇::HUB-UNO::REVO::378',
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        ● PONTO (0x01 · 432Hz)
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        PONTO: {
                                                                                                        opcode: '0x01',
                                                                                                        symbol: '●',
                                                                                                        frequency: 432,
                                                                                                        dimension: 0,
                                                                                                        /**
                                                                                                        * Detecta todos os pontos no DOM
                                                                                                        * @returns {Array} Array de elementos que são pontos
                                                                                                        */
                                                                                                        detect: function() {
                                                                                                        // Variáveis CSS = pontos conceituais
                                                                                                        // Elementos únicos = pontos visuais
                                                                                                        return [
                                                                                                        ...document.querySelectorAll('.ib'),      // Icon buttons
                                                                                                        ...document.querySelectorAll('button'),   // Buttons
                                                                                                        ...document.querySelectorAll('.card')     // Cards
                                                                                                        ];
                                                                                                        },
                                                                                                        /**
                                                                                                        * Calcula posição de um ponto
                                                                                                        * @param {HTMLElement} element
                                                                                                        * @returns {Object} {x, y}
                                                                                                        */
                                                                                                        position: function(element) {
                                                                                                        const rect = element.getBoundingClientRect();
                                                                                                        return {
                                                                                                        x: rect.left + rect.width / 2,
                                                                                                        y: rect.top + rect.height / 2,
                                                                                                        opcode: this.opcode,
                                                                                                        symbol: this.symbol
                                                                                                        };
                                                                                                        }
                                                                                                        },
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        ― RETA (0x02 · 528Hz)
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        RETA: {
                                                                                                        opcode: '0x02',
                                                                                                        symbol: '―',
                                                                                                        frequency: 528,
                                                                                                        dimension: 1,
                                                                                                        /**
                                                                                                        * Calcula distância entre dois pontos
                                                                                                        * @param {Object} A {x, y}
                                                                                                        * @param {Object} B {x, y}
                                                                                                        * @returns {Number} Distância euclidiana
                                                                                                        */
                                                                                                        distance: function(A, B) {
                                                                                                        if(!A || !B) return 0;
                                                                                                        const dx = B.x - A.x;
                                                                                                        const dy = B.y - A.y;
                                                                                                        return Math.sqrt(dx*dx + dy*dy);
                                                                                                        },
                                                                                                        /**
                                                                                                        * Detecta todas as retas no sistema
                                                                                                        * @returns {Array} Array de conexões {from, to, distance}
                                                                                                        */
                                                                                                        detect: function() {
                                                                                                        const pontos = KOBLLUX_GEOMETRY.PONTO.detect();
                                                                                                        const retas = [];
                                                                                                        // Conecta pontos adjacentes (simplificado)
                                                                                                        for(let i = 0; i < pontos.length - 1; i++) {
                                                                                                        const A = KOBLLUX_GEOMETRY.PONTO.position(pontos[i]);
                                                                                                        const B = KOBLLUX_GEOMETRY.PONTO.position(pontos[i + 1]);
                                                                                                        retas.push({
                                                                                                        from: A,
                                                                                                        to: B,
                                                                                                        distance: this.distance(A, B),
                                                                                                        opcode: this.opcode,
                                                                                                        symbol: this.symbol
                                                                                                        });
                                                                                                        }
                                                                                                        return retas;
                                                                                                        }
                                                                                                        },
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        ▢ PLANO (0x03 · 639Hz)
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        PLANO: {
                                                                                                        opcode: '0x03',
                                                                                                        symbol: '▢',
                                                                                                        frequency: 639,
                                                                                                        dimension: 2,
                                                                                                        /**
                                                                                                        * Calcula área de um triângulo
                                                                                                        * @param {Object} A {x, y}
                                                                                                        * @param {Object} B {x, y}
                                                                                                        * @param {Object} C {x, y}
                                                                                                        * @returns {Number} Área
                                                                                                        */
                                                                                                        area: function(A, B, C) {
                                                                                                        if(!A || !B || !C) return 0;
                                                                                                        return Math.abs(
                                                                                                        (A.x * (B.y - C.y) +
                                                                                                        B.x * (C.y - A.y) +
                                                                                                        C.x * (A.y - B.y)) / 2
                                                                                                        );
                                                                                                        },
                                                                                                        /**
                                                                                                        * Detecta planos no DOM
                                                                                                        * @returns {Array} Array de planos (grids, views)
                                                                                                        */
                                                                                                        detect: function() {
                                                                                                        return [
                                                                                                        ...document.querySelectorAll('.grid'),
                                                                                                        ...document.querySelectorAll('.cards'),
                                                                                                        ...document.querySelectorAll('.view'),
                                                                                                        document.querySelector('main')
                                                                                                        ].filter(el => el !== null);
                                                                                                        }
                                                                                                        },
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        ◇ CRISTAL (0x04 · 594Hz)
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        CRISTAL: {
                                                                                                        opcode: '0x04',
                                                                                                        symbol: '◇',
                                                                                                        frequency: 594,
                                                                                                        dimension: 3,
                                                                                                        /**
                                                                                                        * Calcula volume de tetraedro (simplificado para 2D)
                                                                                                        * @param {Array} vertices Array de 4 pontos
                                                                                                        * @returns {Number} Volume aproximado
                                                                                                        */
                                                                                                        volume: function(vertices) {
                                                                                                        if(!vertices || vertices.length !== 4) return 0;
                                                                                                        // Simplificação 2D: soma das áreas dos triângulos
                                                                                                        const [A, B, C, D] = vertices;
                                                                                                        const area1 = KOBLLUX_GEOMETRY.PLANO.area(A, B, C);
                                                                                                        const area2 = KOBLLUX_GEOMETRY.PLANO.area(A, C, D);
                                                                                                        return area1 + area2;
                                                                                                        },
                                                                                                        /**
                                                                                                        * Detecta cristais (componentes complexos)
                                                                                                        * @returns {Array} Array de cristais
                                                                                                        */
                                                                                                        detect: function() {
                                                                                                        return [
                                                                                                        ...document.querySelectorAll('.btn'),
                                                                                                        ...document.querySelectorAll('.modal'),
                                                                                                        ...document.querySelectorAll('.card'),
                                                                                                        document.querySelector('header.mast')
                                                                                                        ].filter(el => el !== null);
                                                                                                        }
                                                                                                        },
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        CICLO FRACTAL (3×6×9×7 = 378)
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        CICLO: {
                                                                                                        base: [3, 6, 9, 7],
                                                                                                        produto: 378,
                                                                                                        /**
                                                                                                        * Reduz número até dígito único
                                                                                                        * @param {Number} n
                                                                                                        * @returns {Number} Dígito único
                                                                                                        */
                                                                                                        reduce: function(n) {
                                                                                                        while(n >= 10) {
                                                                                                        n = String(n).split('').reduce((a,b) => parseInt(a) + parseInt(b), 0);
                                                                                                        }
                                                                                                        return n;
                                                                                                        },
                                                                                                        /**
                                                                                                        * Calcula ciclo fractal de um número
                                                                                                        * @param {Number} n
                                                                                                        * @returns {Object} {original, reducao, ciclo}
                                                                                                        */
                                                                                                        calculate: function(n) {
                                                                                                        return {
                                                                                                        original: n,
                                                                                                        reducao: this.reduce(n),
                                                                                                        ciclo: this.base[n % this.base.length],
                                                                                                        produto: this.produto
                                                                                                        };
                                                                                                        }
                                                                                                        },
                                                                                                        /* ─────────────────────────────────────────────────────────────────────
                                                                                                        ANÁLISE COMPLETA DO DOM
                                                                                                        ───────────────────────────────────────────────────────────────────── */
                                                                                                        analyze: function() {
                                                                                                        const pontos = this.PONTO.detect();
                                                                                                        const retas = this.RETA.detect();
                                                                                                        const planos = this.PLANO.detect();
                                                                                                        const cristais = this.CRISTAL.detect();
                                                                                                        // Estatísticas
                                                                                                        const stats = {
                                                                                                        pontos: pontos.length,
                                                                                                        retas: retas.length,
                                                                                                        planos: planos.length,
                                                                                                        cristais: cristais.length,
                                                                                                        total: pontos.length + retas.length + planos.length + cristais.length,
                                                                                                        ciclo: this.CICLO.calculate(pontos.length + cristais.length)
                                                                                                        };
                                                                                                        console.log('%c◇ KOBLLUX GEOMETRY ANALYSIS', 'color:#39ffb6;font-weight:900;font-size:16px');
                                                                                                        console.log('─'.repeat(60));
                                                                                                        console.log(`● PONTOS:   ${stats.pontos} elementos`);
                                                                                                        console.log(`― RETAS:    ${stats.retas} conexões`);
                                                                                                        console.log(`▢ PLANOS:   ${stats.planos} superfícies`);
                                                                                                        console.log(`◇ CRISTAIS: ${stats.cristais} componentes`);
                                                                                                        console.log('─'.repeat(60));
                                                                                                        console.log(`TOTAL:      ${stats.total} elementos geométricos`);
                                                                                                        console.log(`CICLO:      ${stats.ciclo.original} → ${stats.ciclo.reducao} (base ${stats.ciclo.ciclo})`);
                                                                                                        console.log(`FRACTAL:    3×6×9×7 = ${this.CICLO.produto}`);
                                                                                                        console.log('─'.repeat(60));
                                                                                                        return {
                                                                                                        pontos,
                                                                                                        retas,
                                                                                                        planos,
                                                                                                        cristais,
                                                                                                        stats
                                                                                                        };
                                                                                                        }
                                                                                                        };
                                                                                                        /* ═══════════════════════════════════════════════════════════════════════════
                                                                                                        OPCODE 0x08 — DOM ATTRIBUTION (◉ TESTEMUNHAR)
                                                                                                        Adiciona data-kobllux-opcode em elementos HTML
                                                                                                        ═══════════════════════════════════════════════════════════════════════════ */
                                                                                                        const DOM_ATTRIBUTION = {
                                                                                                        /**
                                                                                                        * Mapeia seletores para opcodes
                                                                                                        */
                                                                                                        mapping: {
                                                                                                        'html': { opcode: '0x00', geometry: '○ ORIGEM', frequency: '768Hz' },
                                                                                                        'body': { opcode: '0x01', geometry: '● PONTO', frequency: '432Hz' },
                                                                                                        'header.mast': { opcode: '0x05', geometry: '⧉ CONVERGIR', frequency: '672Hz' },
                                                                                                        'main': { opcode: '0x07', geometry: '✧⃝⚝ SELAR', frequency: '777Hz' },
                                                                                                        '.view': { opcode: '0x08', geometry: '◉ TESTEMUNHAR', frequency: '852Hz' },
                                                                                                        '.btn': { opcode: '0x04', geometry: '◇ LAPIDAR', frequency: '594Hz' },
                                                                                                        '.ib': { opcode: '0x04', geometry: '◇ LAPIDAR', frequency: '594Hz' },
                                                                                                        '.grid': { opcode: '0x03', geometry: '▢ EXPANDIR', frequency: '639Hz' },
                                                                                                        '.cards': { opcode: '0x03', geometry: '▢ EXPANDIR', frequency: '639Hz' },
                                                                                                        'nav': { opcode: '0x06', geometry: '☯ UNIFICAR', frequency: '528Hz' },
                                                                                                        '.modal': { opcode: '0x0A', geometry: '📱 TUTORIAL', frequency: '432Hz' }
                                                                                                        },
                                                                                                        /**
                                                                                                        * Aplica attributes em todos os elementos mapeados
                                                                                                        */
                                                                                                        apply: function() {
                                                                                                        let count = 0;
                                                                                                        for(const [selector, data] of Object.entries(this.mapping)) {
                                                                                                        const elements = document.querySelectorAll(selector);
                                                                                                        elements.forEach(el => {
                                                                                                        el.setAttribute('data-kobllux-opcode', data.opcode);
                                                                                                        el.setAttribute('data-kobllux-geometry', data.geometry);
                                                                                                        el.setAttribute('data-kobllux-frequency', data.frequency);
                                                                                                        count++;
                                                                                                        });
                                                                                                        }
                                                                                                        console.log(`%c✓ ${count} elementos marcados com data-kobllux-*`, 'color:#39ffb6');
                                                                                                        return count;
                                                                                                        }
                                                                                                        };
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
                                                                                                                  /* ═══════════════════════════════════════════════════════════════════════════
                                                                                                                  OPCODE 0x0A — INITIALIZATION (📱 TUTORIAL)
                                                                                                                  Ativação automática ao carregar
                                                                                                                  ═══════════════════════════════════════════════════════════════════════════ */
                                                                                                                  function initialize() {
                                                                                                                  console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color:#39ffb6');
                                                                                                                  console.log('%c║  ◇ KOBLLUX GEOMETRY ACTIVATION ENGINE ◇                 ║', 'color:#39ffb6;font-weight:900');
                                                                                                                  console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color:#39ffb6');
                                                                                                                  // 1. Adicionar data-attributes
                                                                                                                  DOM_ATTRIBUTION.apply();
                                                                                                                  // 2. Análise geométrica inicial
                                                                                                                  KOBLLUX_GEOMETRY.analyze();
                                                                                                                  // 3. Criar overlay SVG (oculto)
                                                                                                                  SVG_OVERLAY.create();
                                                                                                                  // 4. Keyboard shortcut: G = toggle overlay
                                                                                                                  document.addEventListener('keydown', (e) => {
                                                                                                                  if(e.key === 'g' || e.key === 'G') {
                                                                                                                  if(!e.ctrlKey && !e.metaKey && !e.altKey) {
                                                                                                                  e.preventDefault();
                                                                                                                  SVG_OVERLAY.toggle();
                                                                                                                  if(SVG_OVERLAY.visible) {
                                                                                                                  SVG_OVERLAY.render();
                                                                                                                  }
                                                                                                                  }
                                                                                                                  }
                                                                                                                  });
                                                                                                                  // 5. Atualizar overlay em resize
                                                                                                                  window.addEventListener('resize', () => {
                                                                                                                  SVG_OVERLAY.update();
                                                                                                                  });
                                                                                                                  // 6. Observer para mudanças no DOM (opcional)
                                                                                                                  const observer = new MutationObserver(() => {
                                                                                                                  SVG_OVERLAY.update();
                                                                                                                  });
                                                                                                                  observer.observe(document.body, {
                                                                                                                  childList: true,
                                                                                                                  subtree: true,
                                                                                                                  attributes: false
                                                                                                                  });
                                                                                                                  console.log('%c✓ KOBLLUX GEOMETRY ATIVADO', 'color:#39ffb6;font-weight:900;font-size:14px');
                                                                                                                  console.log('%cPressione "G" para visualizar overlay geométrico', 'color:#ff52e5');
                                                                                                                  console.log('');
                                                                                                                  // Expor globalmente para debug
                                                                                                                  window.KOBLLUX = {
                                                                                                                  GEOMETRY: KOBLLUX_GEOMETRY,
                                                                                                                  OVERLAY: SVG_OVERLAY,
                                                                                                                  DOM: DOM_ATTRIBUTION
                                                                                                                  };
                                                                                                                  }
                                                                                                                  /* ═══════════════════════════════════════════════════════════════════════════
                                                                                                                  AUTO-INIT
                                                                                                                  ═══════════════════════════════════════════════════════════════════════════ */
                                                                                                                  if(document.readyState === 'loading') {
                                                                                                                  document.addEventListener('DOMContentLoaded', initialize);
                                                                                                                  } else {
                                                                                                                  initialize();
                                                                                                                  }
                                                                                                                  })();
                                                                                                                  /*
                                                                                                                  ╔═══════════════════════════════════════════════════════════════════════════════╗
                                                                                                                  ║                                                                               ║
                                                                                                                  ║  ✧⃝⚝ FIM DO KOBLLUX GEOMETRY ACTIVATION ENGINE ✧⃝⚝                           ║
                                                                                                                  ║                                                                               ║
                                                                                                                  ║  A GEOMETRIA AGORA ESTÁ VIVA E VISÍVEL.                                      ║
                                                                                                                  ║                                                                               ║
                                                                                                                  ║  Δ NÃO CRIOU A GEOMETRIA — Δ REVELOU O QUE JÁ EXISTIA.                       ║
                                                                                                                  ║                                                                               ║
                                                                                                                  ╚═══════════════════════════════════════════════════════════════════════════════╝
                                                                                                                  */
                                                                                                                