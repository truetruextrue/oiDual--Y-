(() => {
  const TARGET_URL = 'https://kodux78k.github.io/oiDual-idHome/';
  const btn = document.getElementById('btn-arch');
  const frame = document.getElementById('frame');

  if (!btn) return;

  let clickTimer = null;
  let holdTimer = null;
  let isHolding = false;

  // 🔹 HOLD (abre Fusion Card)
  btn.addEventListener('pointerdown', () => {
    isHolding = false;

    holdTimer = setTimeout(() => {
      isHolding = true;

      // 👉 chama teu sistema existente
      if (window.toggleFusionCard) {
        window.toggleFusionCard();
      } else {
        console.log('HOLD → Fusion Card');
      }

    }, 500); // tempo do hold
  });

  btn.addEventListener('pointerup', () => {
    clearTimeout(holdTimer);
  });

  btn.addEventListener('pointerleave', () => {
    clearTimeout(holdTimer);
  });

  // 🔹 CLICK + DOUBLE CLICK
  btn.addEventListener('click', () => {
    if (isHolding) return;

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;

      // 🔥 DOUBLE CLICK → HOME
      if (frame) {
        frame.src = TARGET_URL;
      } else {
        location.href = TARGET_URL;
      }

    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;

        // 🔹 SINGLE CLICK → ARQUÉTIPO
        if (window.nextArchetype) {
          window.nextArchetype();
        } else {
          console.log('CLICK → trocar arquétipo');
        }

      }, 220);
    }
  });
})();