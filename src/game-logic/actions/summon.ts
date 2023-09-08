import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { getGeneral, getSummonBlueprints } from '../utils/entity.helpers';
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
    const summonBlueprints = getSummonBlueprints(general);

    const blueprint = summonBlueprints[input.characterId];
    if (playerAbility.cannot('summon', subject('soldier', blueprint))) {
      return [];
    }

    if (playerAbility.cannot('summon_at', subject('position', input.position))) {
      return [];
    }

    return [soldierSummonedEvent.create(input.characterId, input.position)];
  }
});
