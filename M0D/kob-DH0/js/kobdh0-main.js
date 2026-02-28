import {
} from './m0ds/kob-glue-dh10-4.js';


import {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype
} from './m0ds/kob-voice-engine-0.js';

registerArchetypes(ARCHETYPES);

// troca arquétipo
activateArchetype('atlas');

// fala sincronizada
speakWithCurrentArchetype('O sistema está vivo.');
