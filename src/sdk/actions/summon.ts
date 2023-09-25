import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { getGeneral, hasFinishedTurn } from '../utils/entity.helpers';
import { subject } from '@casl/ability';
import { soldierSummonedEvent } from '../events/soldierSummoned.event';
import { endTurnEvent } from '../events/endTurn.event';
import { soldiersLookup } from '../soldiers';

export const summonActionInput = z.object({
  playerId: z.string(),
  characterId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

export type SummonActionInput = z.infer<typeof summonActionInput>;

export const createSummonAction = defineAction({
  input: summonActionInput,
  handler: ({ input, state }) => {
    const playerAbility = createPlayerAbility(state, input.playerId);

    const general = getGeneral(state, input.playerId);

    const blueprint = soldiersLookup[input.characterId as keyof typeof soldiersLookup];
    if (playerAbility.cannot('summon', subject('soldier', blueprint))) {
      return;
    }

    if (playerAbility.cannot('summon_at', subject('position', input.position))) {
      return;
    }

    state.reducer(
      state,
      soldierSummonedEvent.create(
        state.activeEntityId,
        input.characterId,
        input.position,
        Math.random()
      )
    );

    if (hasFinishedTurn(general)) {
      state.reducer(state, endTurnEvent.create(state.activeEntityId));
    }
  }
});
