
document.addEventListener("DOMContentLoaded", () => {
  const trackAudio = new Audio();
  const binauralAudio = new Audio();

  const toggleBtn = document.getElementById("togglePlayer");
  const controls = document.getElementById("playerControls");
  const playPauseBtn = document.getElementById("playPause");
  const trackSelect = document.getElementById("trackSelect");
  const binauralSelect = document.getElementById("binauralSelect");
  const trackVolume = document.getElementById("trackVolume");
  const binauralVolume = document.getElementById("binauralVolume");

  const presetSelect = document.createElement("select");
  presetSelect.id = "presetSelect";
  const savePresetBtn = document.createElement("button");
  savePresetBtn.textContent = "💾 Salvar Preset";
  controls.appendChild(presetSelect);
  controls.appendChild(savePresetBtn);

  function fadeAudio(audio, targetVolume, duration = 1000) {
    const start = audio.volume;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;
    const step = () => {
      currentStep++;
      audio.volume = start + (targetVolume - start) * (currentStep / steps);
      if (currentStep < steps) setTimeout(step, stepTime);
    };
    step();
  }

  toggleBtn.addEventListener("click", () => {
    controls.style.display = controls.style.display === "flex" ? "none" : "flex";
    loadPresets();
  });

  playPauseBtn.addEventListener("click", () => {
    [trackAudio, binauralAudio].forEach(audio => {
      if (audio.src) {
        if (audio.paused) {
          fadeAudio(audio, parseFloat(audio.dataset.targetVolume || 1));
          audio.play();
        } else {
          fadeAudio(audio, 0);
          setTimeout(() => audio.pause(), 1000);
        }
      }
    });
    setTimeout(() => {
      playPauseBtn.textContent = (trackAudio.paused && binauralAudio.paused) ? "►" : "⏸";
    }, 1000);
  });

  function loadTrack(src, volume) {
    fadeAudio(trackAudio, 0);
    setTimeout(() => {
      trackAudio.src = src;
      trackAudio.loop = true;
      trackAudio.volume = 0;
      trackAudio.dataset.targetVolume = volume;
      trackAudio.play();
      fadeAudio(trackAudio, volume);
    }, 1000);
  }

  function loadBinaural(src, volume) {
    fadeAudio(binauralAudio, 0);
    setTimeout(() => {
      binauralAudio.src = src;
      binauralAudio.loop = true;
      binauralAudio.volume = 0;
      binauralAudio.dataset.targetVolume = volume;
      binauralAudio.play();
      fadeAudio(binauralAudio, volume);
    }, 1000);
  }

  trackSelect.addEventListener("change", () => {
    if (trackSelect.value) {
      loadTrack(`assets/sounds/trilhas/${trackSelect.value}.mp3`, trackVolume.value);
      playPauseBtn.textContent = "⏸";
    } else {
      fadeAudio(trackAudio, 0);
      setTimeout(() => trackAudio.pause(), 1000);
    }
  });

  binauralSelect.addEventListener("change", () => {
    if (binauralSelect.value) {
      loadBinaural(`assets/sounds/binaural/${binauralSelect.value}.wav`, binauralVolume.value);
    } else {
      fadeAudio(binauralAudio, 0);
      setTimeout(() => binauralAudio.pause(), 1000);
    }
  });

  trackVolume.addEventListener("input", () => {
    trackAudio.dataset.targetVolume = trackVolume.value;
    trackAudio.volume = trackVolume.value;
  });

  binauralVolume.addEventListener("input", () => {
    binauralAudio.dataset.targetVolume = binauralVolume.value;
    binauralAudio.volume = binauralVolume.value;
  });

  savePresetBtn.addEventListener("click", () => {
    const presets = JSON.parse(localStorage.getItem("koblluxPresets") || "[]");
    const name = prompt("Nome do preset:");
    if (!name) return;
    presets.push({
      name,
      track: trackSelect.value,
      binaural: binauralSelect.value,
      trackVol: trackVolume.value,
      binauralVol: binauralVolume.value
    });
    localStorage.setItem("koblluxPresets", JSON.stringify(presets));
    loadPresets();
  });

  presetSelect.addEventListener("change", () => {
    const presets = JSON.parse(localStorage.getItem("koblluxPresets") || "[]");
    const preset = presets[presetSelect.selectedIndex - 1];
    if (!preset) return;
    trackSelect.value = preset.track;
    binauralSelect.value = preset.binaural;
    trackVolume.value = preset.trackVol;
    binauralVolume.value = preset.binauralVol;
    if (preset.track) loadTrack(`assets/sounds/trilhas/${preset.track}.mp3`, preset.trackVol);
    if (preset.binaural) loadBinaural(`assets/sounds/binaural/${preset.binaural}.wav`, preset.binauralVol);
  });

  function loadPresets() {
    presetSelect.innerHTML = '<option>🎛️ Presets salvos...</option>';
    const presets = JSON.parse(localStorage.getItem("koblluxPresets") || "[]");
    presets.forEach(p => {
      const opt = document.createElement("option");
      opt.textContent = p.name;
      presetSelect.appendChild(opt);
    });
  }

  loadPresets();
});
