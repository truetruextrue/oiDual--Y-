import {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype
} from '.m0ds/kob-voice-engine.js';

registerArchetypes(ARCHETYPES);

// troca arquétipo
activateArchetype('atlas');

// fala sincronizada
speakWithCurrentArchetype('O sistema está vivo.');
