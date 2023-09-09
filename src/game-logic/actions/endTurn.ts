import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { endTurnEvent } from '../events/endTurn.event';

export const createEndTurnAction = defineAction({
  input: z.object({
    playerId: z.string()
  }),
  handler: ({ input, state }) => {
    const playerAbility = createPlayerAbility(state, input.playerId);

    if (playerAbility.cannot('end_turn', 'turn')) return [];

    return [endTurnEvent.create()];
  }
});
