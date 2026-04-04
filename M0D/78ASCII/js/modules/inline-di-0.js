/**
 * ============================================================================
 * KOBLLUX FUSION CORE V2 - MINI-CORE UNIVERSAL
 * Pluge em qualquer HTML para ativar data-arch, data-user, data-fusion e HUD sanfonada.
 * ============================================================================
 */
(function(global) {
  'use strict';

  const FusionCore = {
    version: '2.0',
    
    // Configurações padrão (podem ser sobrescritas)
    settings: {
      userStorageKey: 'di_userName',
      viewStorageKey: 'kob_view_closed',
      archInputs: '#sigil-name, #project-name, #arch-name',
      hudHeader: '#symbolBar, .win-hdr, .topbar', // Seletores flexíveis para qualquer app
      hudContent: '.wrap .content, .main-area, .win-frame'
    },

    // Arquétipos do Motor 78K
    archDB: [
      "atlas","nova","vitalis","pulse","kaos","kodux","lumine","aion",
      "kobllux","artemis","serena","genus","solus","rhea",
      "uno","dual","trinity","infodose","horus","bllue"
    ].reduce((acc, val) => { acc[val.toUpperCase()] = 1; return acc; }, {}),

    init: function(customSettings = {}) {
      this.settings = { ...this.settings, ...customSettings };
      this.injectStyles();
      this.bindUser();
      this.bindArchetype();
      this.bindAccordion();
      
      console.log(`%c[FUSION CORE V2] Ativo ✨ | User: ${this.currentUser} | Arch: ${this.currentArch}`, 'color:#6ee7ff; font-weight:bold;');
    },

    // 1. INJEÇÃO DE CSS UNIVERSAL E DINÂMICO
    injectStyles: function() {
      if (document.getElementById('fusion-core-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'fusion-core-styles';
      style.textContent = `
        /* Transições Globais do Motor */
        html { transition: background-color 0.5s ease; }
        
        /* Accordion Base */
        .fusion-accordion {
          transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), 
                      opacity 0.3s ease, 
                      transform 0.3s ease;
          overflow: hidden;
          max-height: 2500px;
          opacity: 1;
          transform: scale(1);
        }
        .fusion-accordion.closed {
          max-height: 0 !important;
          opacity: 0;
          transform: scale(0.98);
          pointer-events: none;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
        }
        
        /* Interatividade do Header */
        .fusion-header-trigger {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        /* OVERRIDES DE ARQUÉTIPO (Exemplos Universais) */
        html[data-arch="kobllux"] .fusion-header-trigger { box-shadow: 0 0 20px rgba(255, 180, 71, 0.25); }
        html[data-arch="kaos"] .fusion-header-trigger { filter: grayscale(1) contrast(1.4); }
        html[data-arch="aion"] .orb-core { box-shadow: 0 0 20px rgba(160, 32, 240, 0.6); }

        /* MÚLTIPLAS FUSÕES (Exemplo de uso: data-fusion="kobllux+aion") */
        html[data-fusion*="kobllux"] .status-dot { background: #ffb347; box-shadow: 0 0 10px #ffb347; }
        html[data-fusion*="aion"] .brand h1 { text-shadow: 0 0 8px #a020f0; }
      `;
      document.head.appendChild(style);
    },

    // 2. IDENTIDADE DO USUÁRIO
    bindUser: function() {
      const rawUser = localStorage.getItem(this.settings.userStorageKey) || "visitante";
      this.currentUser = rawUser.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (this.currentUser) {
        document.documentElement.setAttribute("data-user", this.currentUser);
      }
    },

    // 3. DETECÇÃO E APLICAÇÃO DE ARQUÉTIPOS
    detect: function(name) {
      if (global.detectArchetype) return global.detectArchetype(name); // Usa o motor externo se existir
      const up = String(name || "").toUpperCase().replace(/\s/g, '');
      return Object.keys(this.archDB).find(a => up.startsWith(a) || a.startsWith(up)) || null;
    },

    updateArch: function(nameStr) {
      const arch = this.detect(nameStr);
      this.currentArch = arch ? arch.toLowerCase() : null;

      if (this.currentArch) {
        document.documentElement.setAttribute("data-arch", this.currentArch);
        document.documentElement.setAttribute("data-arch-voice", this.currentArch);
        
        // Exemplo de Fusão Automática: Usuário + Arquétipo
        document.documentElement.setAttribute("data-fusion", `${this.currentUser}+${this.currentArch}`);
      } else {
        document.documentElement.removeAttribute("data-arch");
        document.documentElement.removeAttribute("data-arch-voice");
        document.documentElement.setAttribute("data-fusion", this.currentUser);
      }
    },

    bindArchetype: function() {
      const inputs = document.querySelectorAll(this.settings.archInputs);
      
      const resolveAndApply = () => {
        let nameToDetect = this.currentUser; // Fallback para o usuário
        for (let input of inputs) {
          if (input.value) { nameToDetect = input.value; break; }
        }
        this.updateArch(nameToDetect);
      };

      inputs.forEach(input => input.addEventListener('input', resolveAndApply));
      resolveAndApply(); // Applica no carregamento inicial
    },

    // 4. ACCORDION / HUD FÍSICA
    bindAccordion: function() {
      const header = document.querySelector(this.settings.hudHeader);
      const content = document.querySelector(this.settings.hudContent);

      if (!header || !content) return;

      header.classList.add('fusion-header-trigger');
      content.classList.add('fusion-accordion');

      // Restaura o estado anterior
      let isClosed = localStorage.getItem(this.settings.viewStorageKey) === 'true';
      if (isClosed) content.classList.add('closed');

      header.addEventListener('click', (e) => {
        // Ignora cliques em botões, links ou inputs dentro do header
        if (e.target.closest('button, a, input, select, .win-controls')) return;

        isClosed = !isClosed;
        content.classList.toggle('closed', isClosed);
        localStorage.setItem(this.settings.viewStorageKey, isClosed);
      });
    }
  };

  // Expõe para o mundo e auto-inicializa após o carregamento do DOM
  global.FusionCore = FusionCore;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FusionCore.init());
  } else {
    FusionCore.init();
  }

})(window);

