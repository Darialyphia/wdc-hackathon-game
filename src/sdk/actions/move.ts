import { z } from 'zod';
import { defineAction } from '.';
import { getActiveEntity } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { entityMovedEvent } from '../events/entityMoved.event';
import { createPathFinder } from '../utils/pathfinding.helpers';
import { endTurnEvent } from '../events/endTurn.event';

export const moveActionInput = z.object({
  playerId: z.string(),
  target: z.object({
    x: z.number(),
    y: z.number()
  })
});

export type MoveActionInput = z.infer<typeof moveActionInput>;

export const createMoveAction = defineAction({
  input: moveActionInput,
  handler: ({ input, state }) => {
    const entity = getActiveEntity(state);
    const playerAbility = createPlayerAbility(state, input.playerId);

    if (!entity || playerAbility.cannot('move', subject('entity', entity))) {
      return;
    }

    const path = createPathFinder(state, entity.id).findPath(
      entity.position,
      input.target
    );
    if (path.length > entity.ap) return;

    path.forEach(([x, y]) =>
      state.reducer(state, entityMovedEvent.create(entity.id, { x, y }))
    );

    if (entity.ap === 0) {
      state.reducer(state, endTurnEvent.create(state.activeEntityId));
    }
  }
});
