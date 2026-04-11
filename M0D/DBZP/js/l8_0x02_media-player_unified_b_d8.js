/* ════════════════════════════════════════════════════════════════════════════════
   MEDIA PLAYER · JAVASCRIPT IMPLEMENTATION
   Opcode: 0x02 INTEGRAR · 528Hz
   Migração: SoundCloud Player → DualTube Standard Pattern
   Arquivo: l8_0x02_media-player_unified_b_d8.js
   ════════════════════════════════════════════════════════════════════════════════ */

'use strict';

/**
 * UNIFIED MEDIA PLAYER
 * Padrão DualTube com suporte a vídeo e áudio
 * Componentes: TopBar + Visualizer + Controls + Progress + Content
 */

const MediaPlayer = {
  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  state: {
    isExpanded: false,
    isMinimized: false,
    isVisible: true,
    currentProgress: 0,
    maxProgress: 100
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DOM ELEMENTS
  // ─────────────────────────────────────────────────────────────────────────────

  dom: {
    player: null,
    topbar: null,
    body: null,
    progressFill: null,
    progressValue: null,
    visualizer: null
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  init: function() {
    this.dom.player = document.getElementById('media-player');
    this.dom.topbar = document.querySelector('.media-player-topbar');
    this.dom.body = document.getElementById('media-player-body');
    this.dom.progressFill = document.getElementById('media-player-progress-fill');
    this.dom.progressValue = document.getElementById('media-player-progress-value');
    this.dom.visualizer = document.getElementById('media-player-visualizer');

    this.attachEventListeners();
    this.startVisualizerAnimation();
    this.startProgressAnimation();

    console.log('[MediaPlayer] Inicializado · Opcode 0x02 INTEGRAR · 528Hz');
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────────

  attachEventListeners: function() {
    // Topbar toggle
    if (this.dom.topbar) {
      this.dom.topbar.addEventListener('click', (e) => {
        if (!e.target.closest('.media-player-btn')) {
          this.toggle(e);
        }
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS · PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Toggle expand/collapse
   */
  toggle: function(event) {
    if (event) event.stopPropagation();
    
    if (this.state.isExpanded) {
      this.collapse();
    } else if (this.dom.body.style.display === 'none') {
      this.open();
    } else {
      this.collapse();
    }
  },

  /**
   * Expand to fullscreen
   */
  expand: function(event) {
    if (event) event.stopPropagation();

    this.state.isExpanded = true;
    this.dom.player.classList.add('expanded');
    this.dom.player.style.width = '100vw';
    this.dom.player.style.height = '100vh';
    this.dom.player.style.position = 'fixed';
    this.dom.player.style.top = '0';
    this.dom.player.style.left = '0';
    this.dom.player.style.zIndex = '999';
    this.dom.player.style.borderRadius = '0';
    this.dom.player.style.bottom = 'auto';
    this.dom.player.style.right = 'auto';

    // Ensure body is visible when expanding
    if (this.dom.body) {
      this.dom.body.style.display = 'block';
    }

    console.log('[MediaPlayer] Expandido para tela cheia');
  },

  /**
   * Minimize (collapse topbar only)
   */
  minimize: function(event) {
    if (event) event.stopPropagation();

    this.state.isMinimized = !this.state.isMinimized;

    if (this.state.isMinimized) {
      this.dom.player.classList.add('minimized');
      if (this.dom.body) {
        this.dom.body.style.display = 'none';
      }
    } else {
      this.dom.player.classList.remove('minimized');
      if (this.dom.body) {
        this.dom.body.style.display = 'block';
      }
    }

    console.log('[MediaPlayer] Minimizado:', this.state.isMinimized);
  },

  /**
   * Collapse (exit fullscreen + close body)
   */
  collapse: function() {
    this.state.isExpanded = false;
    this.dom.player.classList.remove('expanded');
    this.dom.player.style.width = '480px';
    this.dom.player.style.height = 'auto';
    this.dom.player.style.position = 'fixed';
    this.dom.player.style.top = 'auto';
    this.dom.player.style.left = 'auto';
    this.dom.player.style.bottom = '20px';
    this.dom.player.style.right = '20px';
    this.dom.player.style.zIndex = '100';
    this.dom.player.style.borderRadius = '16px';
    this.dom.player.style.maxHeight = '500px';

    if (this.dom.body) {
      this.dom.body.style.display = 'none';
    }

    console.log('[MediaPlayer] Colapsado');
  },

  /**
   * Open body (show details)
   */
  open: function() {
    if (this.dom.body) {
      this.dom.body.style.display = 'block';
    }
    this.state.isMinimized = false;
    this.dom.player.classList.remove('minimized');

    console.log('[MediaPlayer] Aberto');
  },

  /**
   * Close player completely
   */
  close: function(event) {
    if (event) event.stopPropagation();

    this.state.isVisible = false;
    this.dom.player.style.display = 'none';

    console.log('[MediaPlayer] Fechado');
  },

  /**
   * Update progress bar
   */
  updateProgress: function(percentage) {
    this.state.currentProgress = percentage;

    if (this.dom.progressFill) {
      this.dom.progressFill.style.width = percentage + '%';
    }

    if (this.dom.progressValue) {
      const value = ((percentage / 100) * 9001).toFixed(0);
      this.dom.progressValue.textContent = value;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ANIMATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Visualizer animation (continuous pulse)
   */
  startVisualizerAnimation: function() {
    if (!this.dom.visualizer) return;

    const bars = this.dom.visualizer.querySelectorAll('.media-player-vis-bar');
    
    setInterval(() => {
      bars.forEach((bar, index) => {
        const randomHeight = Math.random() * 100;
        const speed = 0.2 + Math.random() * 0.4;
        
        bar.style.setProperty('--bar-speed', speed + 's');
        bar.style.setProperty('--bar-max', (8 + randomHeight) + 'px');
      });
    }, 600);
  },

  /**
   * Progress bar animation (auto-increment for demo)
   */
  startProgressAnimation: function() {
    let direction = 1;
    let currentValue = 0;

    setInterval(() => {
      currentValue += direction * (Math.random() * 5 + 2);

      if (currentValue >= 100) {
        currentValue = 100;
        direction = -1;
      } else if (currentValue <= 0) {
        currentValue = 0;
        direction = 1;
      }

      this.updateProgress(currentValue);
    }, 1500);
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update track info
   */
  setTrackInfo: function(title, artist) {
    const titleEl = document.getElementById('media-player-title');
    const artistEl = document.querySelector('.media-player-artist');

    if (titleEl) titleEl.textContent = title;
    if (artistEl) artistEl.textContent = artist;
  },

  /**
   * Load iframe (SoundCloud, etc)
   */
  loadIframe: function(iframeSrc) {
    const iframe = document.getElementById('media-player-sc-iframe');
    if (iframe) {
      iframe.src = iframeSrc;
    }
  },

  /**
   * Expose for global access
   */
  show: function() {
    this.state.isVisible = true;
    if (this.dom.player) {
      this.dom.player.style.display = 'block';
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION ON DOM READY
// ─────────────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MediaPlayer.init();
  });
} else {
  MediaPlayer.init();
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL WINDOW OBJECT FOR HTML EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

window.MediaPlayer = {
  minimize: (e) => MediaPlayer.minimize(e),
  expand: (e) => MediaPlayer.expand(e),
  close: (e) => MediaPlayer.close(e),
  toggle: (e) => MediaPlayer.toggle(e)
};

/* ════════════════════════════════════════════════════════════════════════════════
   OPCODE: 0x02 INTEGRAR · 528Hz
   VERDADE×INTEGRAR÷Δ=∞
   
   Este arquivo implementa o Media Player Unificado que integra:
   - Padrão DualTube (video player)
   - SoundCloud Player (migrado para padrão)
   - Componentes: TopBar + Visualizer + Controls + Progress + Content
   
   Funcionalidades:
   ✓ Toggle expand/collapse
   ✓ Minimize (mostrar apenas topbar)
   ✓ Expand (tela cheia)
   ✓ Close (fechar)
   ✓ Progress bar (auto-animate)
   ✓ Visualizer (pulsante)
   ✓ Responsive design
   ════════════════════════════════════════════════════════════════════════════════ */
