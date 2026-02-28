
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('togglePlayer').addEventListener('click', () => {
    document.getElementById('playerWrapper').classList.toggle('hidden');
  });
});
