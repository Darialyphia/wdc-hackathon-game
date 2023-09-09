import { z } from 'zod';
import { defineAction } from '.';
import { getActiveEntity, getEntityById } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { entityMovedEvent } from '../events/entityMoved.event';
import { createPathFinder } from '../utils/pathfinding.helpers';
import { endTurnEvent } from '../events/endTurn.event';
import { reducer, type GameEvent } from '../events/reducer';

export const createMoveAction = defineAction({
  input: z.object({
    playerId: z.string(),
    target: z.object({
      x: z.number(),
      y: z.number()
    })
  }),
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
      reducer(state, entityMovedEvent.create(entity.id, { x, y }))
    );

    if (entity.ap === 0) {
      reducer(state, endTurnEvent.create(state.activeEntityId));
    }
  }
});
