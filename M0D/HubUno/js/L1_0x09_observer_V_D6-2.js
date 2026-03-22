/* ═══════════════════════════════════════════════════════════
   0x09 · MANIFESTAR · V · D6
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L1_0x09_observer_V_D6-2.js
   Opcode    : 0x09 · MANIFESTAR · ♾ · 963Hz
   V.E.E.B.  : Vibração
   Degrau    : D6 (section)
   Fórmula   : Vibração · f₉=963Hz · campo→forma visual · S² χ=2
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 1 · INFRA
   Opcode Δ  : 0x02 · Carregar na posição 1 da cadeia
   Nota      : Infraestrutura — depende só de DNA
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 1  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=963)
     χ = -2  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
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