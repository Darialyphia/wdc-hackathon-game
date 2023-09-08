import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { getGeneral } from '../utils/entity.helpers';

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
      return [];
    }

    const blueprint = general.summonBlueprints[input.characterId];
    if (playerAbility.cannot('summon', blueprint)) {
      return [];
    }

    if (playerAbility.cannot('summon_at', input.position)) return [];

    return [
      {
        type: 'soldier_summoned',
        payload: {
          blueprint,
          position: input.position
        }
      }
    ];
  }
});
