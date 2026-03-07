import {} from './m0ds/kob-glue-dh10-2-oai.js';
//* import {} from './m0ds/kob-hud-aa.js';
import {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype
} from './m0ds/kob-voice-engine-1.js';

registerArchetypes(ARCHETYPES);
activateArchetype('atlas');
speakWithCurrentArchetype('O sistema está vivo.');
