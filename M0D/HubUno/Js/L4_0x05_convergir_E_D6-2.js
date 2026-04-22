/* ═══════════════════════════════════════════════════════════
   0x05 · CONVERGIR · E · D6
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L4_0x05_convergir_E_D6-2.js
   Opcode    : 0x05 · CONVERGIR · ⧉ · 672Hz
   V.E.E.B.  : Energia
   Degrau    : D6 (section)
   Fórmula   : Energia · f₅=672Hz · fluxo convergente · L₁∩L₂=P*
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 4 · UTILITARIOS
   Opcode Δ  : 0x05 · Carregar na posição 4 da cadeia
   Nota      : Função utilitária (fallback)
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=672)
     χ = 2  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function() {
                                                                                                                      // Melhora o seletor de arquétipos com informações de sotaque
                                                                                                                      setTimeout(function() {
                                                                                                                      const select = document.getElementById('arch-select');
                                                                                                                      if (!select) return;
                                                                                                                      const VOICE_MAP = window.KOBLLUX?.VOZ?.map || {
                                                                                                                      'aion.html': { sotaque: 'inglês' },
                                                                                                                      'atlas.html': { sotaque: 'alemão' },
                                                                                                                      'elysha.html': { sotaque: 'nativo' },
                                                                                                                      'genus.html': { sotaque: 'alemão' },
                                                                                                                      'horus.html': { sotaque: 'lusitano' },
                                                                                                                      'ignyra.html': { sotaque: 'italiano' },
                                                                                                                      'kaion.html': { sotaque: 'alemão' },
                                                                                                                      'kaos.html': { sotaque: 'lusitano' },
                                                                                                                      'lumine.html': { sotaque: 'nativo' },
                                                                                                                      'luxara.html': { sotaque: 'nativo' },
                                                                                                                      'nova.html': { sotaque: 'nativo' },
                                                                                                                      'rhea.html': { sotaque: 'nativo' }
                                                                                                                      };
                                                                                                                      // Adiciona atributos de sotaque às options sem quebrar o funcionamento
                                                                                                                      Array.from(select.options).forEach(opt => {
                                                                                                                      const file = opt.value;
                                                                                                                      const archName = file.replace(/\.html$/i, '');
                                                                                                                      // Tenta encontrar o sotaque
                                                                                                                      let sotaque = 'nativo';
                                                                                                                      for (const [key, value] of Object.entries(VOICE_MAP)) {
                                                                                                                      if (key.toLowerCase().includes(archName.toLowerCase())) {
                                                                                                                      sotaque = value.sotaque || 'nativo';
                                                                                                                      break;
                                                                                                                      }
                                                                                                                      }
                                                                                                                      // Adiciona o sotaque como atributo (não altera o texto visível)
                                                                                                                      opt.setAttribute('data-sotaque', sotaque);
                                                                                                                      // Opcional: adiciona um pequeno ícone ou texto (comentado para não quebrar)
                                                                                                                      // opt.textContent = archName + ' (' + sotaque + ')';
                                                                                                                      });
                                                                                                                      console.log('✓ Seletor de arquétipos enriquecido com sotaques');
                                                                                                                      }, 1000);
                                                                                                                      })();