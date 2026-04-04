//<script>
  (function() {
    'use strict';

    // ==================== 1. ARQUÉTIPOS (fallback local, caso não exista global) ====================
    const ARCHETYPES = [
      "kobllux", "kodux", "atlas", "nova", "vitalis", "pulse", "kaos", "lumine", "aion",
       "artemis", "serena", "genus", "solus", "rhea",
      "uno", "dual", "trinity", "infodose", "horus", "bllue"
    ];

    const ARCHETYPES_DB = Object.fromEntries(ARCHETYPES.map(a => [a.toUpperCase(), true]));

    function stripVowels(str) {
      return String(str || "").toUpperCase().replace(/[AEIOUÁÉÍÓÚÂÊÎÔÛÃÕÄËÏÖÜ]/g, '');
    }

    function detectArchetype(name) {
      const up = String(name || "").toUpperCase().replace(/\s/g, '');
      return Object.keys(ARCHETYPES_DB).find(a => a === up || up.startsWith(a) || a.startsWith(up)) || null;
    }

    // Usa função global se existir, senão usa a local
    const _detectArchetype = window.detectArchetype || detectArchetype;

    // ==================== 2. LER USERNAME DO LOCALSTORAGE ====================
    let userName = localStorage.getItem("di_userName") || "Visitante";
    // Sanitiza para usar como atributo (apenas letras minúsculas e números)
    const userAttr = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (userAttr) {
      document.documentElement.setAttribute("data-user", userAttr);
    }
    // Opcional: exibir nome em algum lugar (se existir um elemento .user-name)
    const userNameSpan = document.querySelector('.user-name, #user-name-display');
    if (userNameSpan) userNameSpan.textContent = userName;

    // ==================== 3. ATUALIZAR DATA-ARCH BASEADO EM UM NOME ====================
    // Tenta encontrar um campo de entrada de nome (pode ser #project-name, #sigil-name, etc.)
    // Se não existir, usa o próprio userName como base.
    let nameSource = null;
    const possibleInputs = ['#project-name', '#sigil-name', '#arch-name', '#user-name-input'];
    for (let sel of possibleInputs) {
      const el = document.querySelector(sel);
      if (el) { nameSource = el; break; }
    }

    function updateArchetypeAttribute() {
      let rawName = userName; // fallback
      if (nameSource && nameSource.value) {
        rawName = nameSource.value;
      }
      const arch = _detectArchetype(rawName);
      if (arch) {
        document.documentElement.setAttribute("data-arch", arch);
        // Também define data-arch-voice para casos específicos
        document.documentElement.setAttribute("data-arch-voice", arch);
      } else {
        document.documentElement.removeAttribute("data-arch");
        document.documentElement.removeAttribute("data-arch-voice");
      }
    }

    if (nameSource) {
      nameSource.addEventListener('input', updateArchetypeAttribute);
    }
    updateArchetypeAttribute();

    // ==================== 4. ACCORDION SANFONADO NO HEADER ====================
    // Procura o elemento que será o "header" clicável. Por padrão, usa o primeiro elemento com a classe
    // '.topbar', '.header', ou o próprio '.symbol-bar' (se você quiser que a barra minimize o conteúdo).
    // Você pode customizar o seletor trocando a variável abaixo.
    const headerSelector = '.topbar, .main-header, .wrap > :first-child'; // Ajuste conforme seu HTML
    const contentSelector = '.main-area, .content, .wrap .content'; // O que será minimizado

    const header = document.querySelector(headerSelector);
    const contentToToggle = document.querySelector(contentSelector);

    if (header && contentToToggle) {
      // Cria estilo para o accordion
      const style = document.createElement('style');
      style.textContent = `
        /* Transição suave */
        .accordion-content {
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.2s;
          overflow: hidden;
          max-height: 2000px; /* valor grande o suficiente */
          opacity: 1;
        }
        .accordion-content.collapsed {
          max-height: 0 !important;
          opacity: 0;
          padding-top: 0;
          padding-bottom: 0;
          margin-top: 0;
          margin-bottom: 0;
          pointer-events: none;
        }
        /* Indicador visual de clique no header */
        .accordion-header {
          cursor: pointer;
          transition: background 0.2s;
        }
        .accordion-header:hover {
          background: rgba(110, 231, 255, 0.1);
        }
      `;
      document.head.appendChild(style);

      // Adiciona classe ao header e ao conteúdo
      header.classList.add('accordion-header');
      contentToToggle.classList.add('accordion-content');

      // Estado inicial (expandido)
      let isCollapsed = false;

      header.addEventListener('click', (e) => {
        // Evita que clique em botões internos dispare o accordion
        if (e.target.closest('button, .symbol-button, a, input, select')) return;
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          contentToToggle.classList.add('collapsed');
        } else {
          contentToToggle.classList.remove('collapsed');
        }
        // Opcional: salvar estado no localStorage
        localStorage.setItem('kob_accordion_collapsed', isCollapsed);
      });

      // Restaurar estado salvo
      const saved = localStorage.getItem('kob_accordion_collapsed');
      if (saved === 'true') {
        isCollapsed = true;
        contentToToggle.classList.add('collapsed');
      }
    } else {
      console.warn('Accordion: não encontrou header ou conteúdo. Selecione outros seletores manualmente.');
    }

    // ==================== 5. PEQUENO HELPER PARA DEBUG ====================
    console.log(`[KOBLLUX PATCH] Usuário: ${userName} | Arquétipo: ${document.documentElement.getAttribute('data-arch')}`);
  })();
// </script>
