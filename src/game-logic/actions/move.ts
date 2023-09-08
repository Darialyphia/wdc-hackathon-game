import { z } from 'zod';
import { defineAction } from '.';
import { getEntityById } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { entityMovedEvent } from '../events/entityMoved.event';
import { createPathFinder } from '../utils/pathfinding.helpers';

export const createMoveAction = defineAction({
  input: z.object({
    playerId: z.string(),
    entityId: z.number(),
    target: z.object({
      x: z.number(),
      y: z.number()
    })
  }),
  handler: ({ input, state }) => {
    const entity = getEntityById(state, input.entityId);
    const playerAbility = createPlayerAbility(state, input.playerId);

    if (!entity || playerAbility.cannot('move', subject('entity', entity))) {
      return [];
    }

    const path = createPathFinder(state, entity.id).findPath(
      entity?.position,
      input.target
    );
    if (path.length > entity.ap) return [];

    return path.map(([x, y]) => entityMovedEvent.create(input.entityId, { x, y }));
  }
});