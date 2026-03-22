// ========== ORB DRAG & MERGE (V7 – Fusion + SymbolBar) ==========
(function() {
  const STORAGE_BAR_MERGE = 'kob_orb_merged_into_bar';
  const STORAGE_CARD_MERGE = 'kob_orb_merged_into_card';

  let orb = document.getElementById('unoOrbWrap');
  let bar = document.getElementById('symbolBar');
  let card = document.getElementById('mainCard'); // Card do Fusion OS

  if (!orb) return; // Sem orbe, nada a fazer

  // ---------- 1. Prepara elementos para drop ----------
  const dropZones = [];
  if (bar) dropZones.push({ element: bar, type: 'bar' });
  if (card) dropZones.push({ element: card, type: 'card' });

  if (dropZones.length === 0) return;

  // ---------- 2. Estado de arrasto ----------
  let isDragging = false;
  let startX = 0, startY = 0;
  let dragOffsetX = 0, dragOffsetY = 0;
  let pointerId = null;
  let currentOrbClone = null; // usado para drag visual

  // ---------- 3. Torna o orbe arrastável (pointer events) ----------
  orb.addEventListener('pointerdown', (e) => {
    // Evita conflitos com o clique original do orbe
    e.stopPropagation();
    if (e.button !== 0) return;

    isDragging = true;
    pointerId = e.pointerId;
    try { orb.setPointerCapture(pointerId); } catch (err) {}

    const rect = orb.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    // Clona o orbe para o cursor durante o arrasto (efeito visual)
    currentOrbClone = orb.cloneNode(true);
    currentOrbClone.style.position = 'fixed';
    currentOrbClone.style.opacity = '0.6';
    currentOrbClone.style.pointerEvents = 'none';
    currentOrbClone.style.zIndex = '10000';
    currentOrbClone.style.width = rect.width + 'px';
    currentOrbClone.style.height = rect.height + 'px';
    document.body.appendChild(currentOrbClone);
    currentOrbClone.style.left = e.clientX - dragOffsetX + 'px';
    currentOrbClone.style.top = e.clientY - dragOffsetY + 'px';

    // Adiciona classes de feedback visual
    dropZones.forEach(zone => zone.element.classList.add('drop-zone-active'));

    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    // Move o clone
    if (currentOrbClone) {
      currentOrbClone.style.left = e.clientX - dragOffsetX + 'px';
      currentOrbClone.style.top = e.clientY - dragOffsetY + 'px';
    }

    // Realça a zona de drop sob o cursor
    let hoverZone = null;
    for (let zone of dropZones) {
      const rect = zone.element.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        hoverZone = zone;
        break;
      }
    }
    dropZones.forEach(zone => zone.element.classList.toggle('drop-zone-hover', zone === hoverZone));
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;

    // Determina a zona de drop sob o cursor
    let targetZone = null;
    for (let zone of dropZones) {
      const rect = zone.element.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetZone = zone;
        break;
      }
    }

    if (targetZone) {
      if (targetZone.type === 'bar') {
        mergeOrbIntoBar();
      } else if (targetZone.type === 'card') {
        mergeOrbIntoCard();
      }
    }

    // Limpeza
    if (currentOrbClone) currentOrbClone.remove();
    dropZones.forEach(zone => {
      zone.element.classList.remove('drop-zone-active', 'drop-zone-hover');
    });
    isDragging = false;
    if (pointerId !== null) {
      try { orb.releasePointerCapture(pointerId); } catch (err) {}
    }
    pointerId = null;
  });

  // ---------- 4. Long‑press no orbe (sem arrastar) ----------
  let pressTimer;
  orb.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pressTimer = setTimeout(() => {
      // Pergunta onde fundir (barra ou card)
      if (bar && card) {
        const choice = confirm('Fundir orbe na barra lateral ou no card? (OK = barra, Cancelar = card)');
        if (choice) mergeOrbIntoBar();
        else mergeOrbIntoCard();
      } else if (bar) mergeOrbIntoBar();
      else if (card) mergeOrbIntoCard();
    }, 600); // 600ms
  });
  orb.addEventListener('pointerup', () => clearTimeout(pressTimer));
  orb.addEventListener('pointercancel', () => clearTimeout(pressTimer));

  // ---------- 5. Função: fundir orbe na symbolBar ----------
  function mergeOrbIntoBar() {
    if (!bar) return;
    // Evita múltiplas fusões
    if (bar.querySelector('.custom-orb-button')) return;

    // Remove todos os botões, exceto o toggle (#toggleBtn)
    const allBtns = Array.from(bar.querySelectorAll('.symbol-button:not(#toggleBtn)'));
    allBtns.forEach(btn => btn.remove());

    // Clona o orbe e insere
    const orbClone = orb.cloneNode(true);
    orbClone.classList.add('custom-orb-button', 'symbol-button');
    orbClone.setAttribute('draggable', 'false');
    orbClone.style.cursor = 'pointer';

    // Mantém a funcionalidade de troca de arquétipo (se houver)
    const archBtn = document.getElementById('btn-arch');
    if (archBtn && archBtn.onclick) orbClone.onclick = archBtn.onclick;
    else {
      // Fallback: chama o updateArchetype do KOBLLUX
      orbClone.addEventListener('click', () => {
        if (window.KOBLLUX && window.KOBLLUX.updateArchetype) {
          const archs = window.KOBLLUX.getArchetypes?.() || window.KOBLLUX_ARCHETYPES || [];
          if (archs.length) {
            let idx = (window.KOBLLUX.state?.archIdx || 0) + 1;
            window.KOBLLUX.updateArchetype(idx % archs.length);
          }
        }
      });
    }

    bar.appendChild(orbClone);
    orb.style.display = 'none'; // esconde o original

    // Salva estado
    localStorage.setItem(STORAGE_BAR_MERGE, 'true');
    toast('Orbe fundido à barra!', 1200);
  }

  // ---------- 6. Função: fundir orbe no card do Fusion OS ----------
  function mergeOrbIntoCard() {
    if (!card) return;
    // Procura o avatar dentro do card (pode ser #avatarTarget ou outro)
    const avatarContainer = card.querySelector('#avatarTarget');
    if (!avatarContainer) {
      toast('Elemento de avatar não encontrado no card', 1500);
      return;
    }

    // Clona o orbe e adapta para avatar
    const orbClone = orb.cloneNode(true);
    orbClone.style.width = '80px';
    orbClone.style.height = '80px';
    orbClone.style.cursor = 'pointer';
    orbClone.classList.add('card-orb-avatar');

    // Substitui o conteúdo do avatar
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(orbClone);

    // Sincroniza com o sistema de chaves (opcional: atualizar nome etc.)
    // Pode também salvar no storage do Fusion
    localStorage.setItem(STORAGE_CARD_MERGE, 'true');
    orb.style.display = 'none';
    toast('Orbe integrado ao card!', 1200);
  }

  // ---------- 7. Restaurar estados salvos ----------
  function restoreMergedStates() {
    if (localStorage.getItem(STORAGE_BAR_MERGE) === 'true') {
      // Se a barra já estava fundida, executa a fusão novamente (se não estiver)
      if (bar && !bar.querySelector('.custom-orb-button')) mergeOrbIntoBar();
    }
    if (localStorage.getItem(STORAGE_CARD_MERGE) === 'true') {
      if (card && !card.querySelector('.card-orb-avatar')) mergeOrbIntoCard();
    }
  }

  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreMergedStates);
  } else {
    restoreMergedStates();
  }

})();