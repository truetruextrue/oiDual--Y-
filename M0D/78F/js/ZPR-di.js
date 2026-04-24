di_setPreset("slot01", {
  target: "#app-root",
  mode: "replace",
  html: [
    `<div id="orb-core"></div>`,
    `<div id="brn-arch"></div>`
  ],
  css: [
    "https://kodux78k.github.io/oiDual--Y-/css/kob-dox-nanai-v4.css",
    "https://kodux78k.github.io/oiDual--Y-/css/kob-framefix.css"
  ],
  js: [
    "https://kodux78k.github.io/oiDual--Y-/js/koblluxv30.js",
    "https://kodux78k.github.io/oiDual--Y-/js/kodbrain-66.js"
  ],
  inlineJs: [
    `const ARCHETYPES = ["atlas","nova","vitalis","pulse","kaos","kodux","lumine","aion","kobllux","artemis","serena","genus","solus","rhea","uno","dual","trinity","infodose","horus","bllue", localStorage.getItem("di_userName") || "convidado"];`
  ]
});

window.DI_PRESETS = {
  slot01: {
    target: "#app-root",
    mode: "replace",
    html: [`<div id="orb-core"></div>`],
    css: [
      "https://kodux78k.github.io/oiDual--Y-/css/kob-dox-nanai-v4.css"
    ],
    js: [
      "https://kodux78k.github.io/oiDual--Y-/js/koblluxv30.js"
    ],
    inlineJs: [
      `console.log("slot01 pronto");`
    ]
  }
};
di_applyPreset("slot01");