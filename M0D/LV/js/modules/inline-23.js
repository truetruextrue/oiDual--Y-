
/* PATCH: substitui a função pickVoiceFor original pela versão com HOOK */
function pickVoiceFor(text){
  // se existir um hook externo (IA), tenta classificar primeiro
  try{
    if (window.KOB_TTS_VOICE_STYLE_HOOK) {
      const arch = window.KOB_TTS_VOICE_STYLE_HOOK(text);
      if (arch) {
        const ST = {
          atlas:{rate:.95,pitch:0.80}, nova:{rate:1.09,pitch:1.18},
          vitalis:{rate:1.08,pitch:1.34}, pulse:{rate:1.02,pitch:1.12},
          serena:{rate:.98,pitch:.96}, kaos:{rate:1.13,pitch:1.02},
          genus:{rate:1.00,pitch:1.00}, lumine:{rate:1.00,pitch:1.28},
          rhea:{rate:.97,pitch:0.78}, solus:{rate:.93,pitch:.95},
          aion:{rate:1.00,pitch:1.08}
        }[String(arch).toLowerCase()];
        if (ST) return { voice: baseVoice, rate: ST.rate, pitch: ST.pitch };
      }
    }
  }catch(e){}
  // fallback regex (v32)
  const st = voiceStyleFor(text);
  return { voice: baseVoice, rate: st.rate, pitch: st.pitch };
}
