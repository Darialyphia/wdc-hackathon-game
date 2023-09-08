import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { getGeneral } from '../utils/entity.helpers';
import { subject } from '@casl/ability';
import { soldierSummonedEvent } from '../events/soldierSummoned.event';

export const createSummonAction = defineAction({
  input: z.object({
    playerId: z.string(),
    characterId: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  }),
  handler: ({ input, state }) => {
    const playerAbility = createPlayerAbility(state, input.playerId);

    const general = getGeneral(state, input.playerId);
    if (!general.summonBlueprints[input.characterId]) {
      console.log('Unknown blueprint', input.characterId);
      return [];
    }

    const blueprint = general.summonBlueprints[input.characterId];
    if (playerAbility.cannot('summon', subject('soldier', blueprint))) {
      console.log('Summoning not allowed');
      return [];
    }

    if (playerAbility.cannot('summon_at', subject('position', input.position))) {
      console.log('Cannot summon on this cell', input.position);
      return [];
    }

    return [soldierSummonedEvent.create(blueprint, input.position)];
  }
});
