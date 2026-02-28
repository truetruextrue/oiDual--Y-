import {
} from './m0ds/kob-glue-dh10-3.js';


import {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype
} from './m0ds/kob-voice-engine.js';

registerArchetypes(ARCHETYPES);

// troca arquétipo
activateArchetype('atlas');

// fala sincronizada
speakWithCurrentArchetype('O sistema está vivo.');
