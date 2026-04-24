
    (() => {
      const buttons = document.querySelectorAll('.switcher button');
      const panels = document.querySelectorAll('.tab-panel');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          panels.forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
        });
      });

      const nameBtn = document.getElementById('nameBtn');
      const names = [
        'Eco Código do Silêncio',
        'Espelho Vivo Infodose',
        'Silêncio em Loop',
        'Código que Sente',
        'Próximo Nível da Mente'
      ];
      let idx = 0;
      nameBtn?.addEventListener('click', () => {
        idx = (idx + 1) % names.length;
        const title = document.querySelector('.panel h3');
        if (title) title.textContent = names[idx];
        nameBtn.textContent = 'Nome: ' + names[idx];
      });
    })();
  