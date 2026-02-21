(function bindFrameResize(card){
  const shell = card.querySelector('.frame-shell');
  if (!shell) return;

  const content = shell.querySelector('.frame-content');
  const handle  = shell.querySelector('.frame-resize');
  if (!content || !handle) return;

  let startY = 0, startH = 0, dragging = false;

  handle.addEventListener('pointerdown', ev => {
    dragging = true;
    startY = ev.clientY;
    startH = content.offsetHeight;
    handle.setPointerCapture(ev.pointerId);
  });

  handle.addEventListener('pointermove', ev => {
    if (!dragging) return;
    const dy = ev.clientY - startY;
    content.style.height = Math.max(120, startH + dy) + 'px';
  });

  const stop = () => dragging = false;
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
})(card);