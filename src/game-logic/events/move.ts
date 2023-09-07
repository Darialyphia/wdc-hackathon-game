import { z } from 'zod';
import { defineEventHandler } from '.';
import { getEntityById } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { isCellWalkable } from '../utils/map.helpers';
import { AStarFinder } from 'astar-typescript';

export const moveEvent = defineEventHandler({
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
      return;
    }

    const astarMatrix = state.map.cells.map(row =>
      row.map(cell => (isCellWalkable(state, cell) ? 0 : 1))
    );

    const astar = new AStarFinder({
      grid: {
        matrix: astarMatrix
      },
      diagonalAllowed: false,
      includeStartNode: false
    });

    const path = astar.findPath(entity?.position, input.target);
    if (!path.length) return;
    if (path.length > entity.ap) return;

    entity.ap -= path.length;
    entity.position = input.target;
  }
});
