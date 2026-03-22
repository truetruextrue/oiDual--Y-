/* ═══════════════════════════════════════════════════════════
   0x01 · PULSAR · V · D5
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L4_0x01_inner_V_D5-6.js
   Opcode    : 0x01 · PULSAR · ● · 432Hz
   V.E.E.B.  : Vibração
   Degrau    : D5 (block)
   Fórmula   : Vibração · f₁=432Hz · P(t)=A·sin(2π·432·t) · impulso sonoro
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 4 · UTILITARIOS
   Opcode Δ  : 0x05 · Carregar na posição 4 da cadeia
   Nota      : Função utilitária (fallback)
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 1  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=432)
     χ = 3  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════
   KOBLLUX · M5 ARQUÉTIPO VOCAL + ESPELHO INVERSO ENGINE
   H₂O STATE · QUANTUM LEAP · WEB AUDIO · CANVAS
   3×6×9×7=1134 · ∆⁷ · AMÉM
   ══════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── Add VOZ + ESPELHO tab buttons dynamically ─── */
(function addTabs(){
  try {
    const inner = document.querySelector('nav.tabbar .inner');
    if (!inner) return;
        // voz+espelho in tabbar (ARQ-11)
    if (!inner.querySelector('[data-nav="espelho"]')) {
      inner.insertAdjacentHTML('beforeend', `
        <button class="tab fx-trans fx-press ring" data-nav="espelho" title="Espelho · Geometria">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <span style="display:none">Espelho</span><span class="ripple"></span>
        </button>`);
    }
  } catch(e) { console.warn('tabs:', e); }
})();