(function() {
      'use strict';

      // ==========================================
      // 1. CARREGAMENTO DE USUÁRIO (localStorage)
      // ==========================================
      const userName = localStorage.getItem("di_userName") || "Visitante";
      const userAttr = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Seta no HTML: <html data-user="arkhan">
      if (userAttr) document.documentElement.setAttribute("data-user", userAttr);
      
      // Atualiza o crachá visual
      const userDisplay = document.getElementById("user-name-display");
      if (userDisplay) userDisplay.innerText = userName;

      // Inicia os ícones Lucide
      if (window.lucide) lucide.createIcons();

      // ==========================================
      // 2. DETECÇÃO DE ARQUÉTIPO (Motor 78K/VEEB)
      // ==========================================
      function updateArchetypeAttribute() {
        const nameInput = document.getElementById("sigil-name");
        const rawName = (nameInput && nameInput.value) ? nameInput.value : userName;
        let arch = null;

        // Usa função detectArchetype do script inline-0-2 se existir
        if (typeof window.detectArchetype === "function") {
          arch = window.detectArchetype(rawName);
        } else if (rawName) {
          // Fallback básico
          arch = rawName.slice(0, 8).toLowerCase();
        }

        if (arch) {
          document.documentElement.setAttribute("data-arch", arch);
          document.documentElement.setAttribute("data-arch-voice", arch);
        } else {
          document.documentElement.removeAttribute("data-arch");
          document.documentElement.removeAttribute("data-arch-voice");
        }
      }

      function updateVeebDisplay() {
        const nameInput = document.getElementById("sigil-name");
        const name = nameInput ? nameInput.value : "FUSION";
        if (typeof window.getVeebSimulation === "function") {
          const veebHtml = window.getVeebSimulation(name);
          const veebContainer = document.getElementById("veeb-content");
          if (veebContainer) veebContainer.innerHTML = veebHtml;
        }
      }

      // Função exposta para o HTML chamar oninput
      window.updateArchetypeAndVeeb = function() {
        updateArchetypeAttribute();
        updateVeebDisplay();
        
        // Atualiza State global do motor
        if (typeof window.detectArchetype === "function" && window.State) {
          const name = document.getElementById("sigil-name")?.value || "FUSION";
          State.currentArchetype = window.detectArchetype(name);
        }
      };

      // ==========================================
      // 3. EFEITO SANFONA (ACCORDION) NO HEADER
      // ==========================================
      const header = document.getElementById('main-header');
      const content = document.getElementById('main-content');

      if (header && content) {
        // Checa se o usuário já havia deixado minimizado
        let isCollapsed = localStorage.getItem('kob_accordion_collapsed') === 'true';
        if (isCollapsed) {
          content.classList.add('collapsed');
        }

        header.addEventListener('click', (e) => {
          // Ignora cliques que sejam em inputs, botões ou links dentro do header
          if (e.target.closest('button, a, input, select')) return;
          
          isCollapsed = !isCollapsed;
          content.classList.toggle('collapsed', isCollapsed);
          
          // Salva preferência no storage
          localStorage.setItem('kob_accordion_collapsed', isCollapsed);
        });
      }

      // ==========================================
      // 4. INICIALIZAÇÃO
      // ==========================================
      updateArchetypeAttribute();

      // Como o inline-0-2.js pode demorar uns milissegundos, aguardamos ele
      if (typeof window.getVeebSimulation === "undefined") {
        const checkInterval = setInterval(() => {
          if (typeof window.getVeebSimulation === "function") {
            clearInterval(checkInterval);
            updateVeebDisplay();
            updateArchetypeAttribute();
          }
        }, 100);
      } else {
        updateVeebDisplay();
      }

      console.log(`[KOBLLUX PATCH] Inicializado. Usuário: ${userName} | Arquétipo: ${document.documentElement.getAttribute('data-arch')}`);

    })();
