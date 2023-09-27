import type { Point } from '../../utils/geometry';
import type { EntityId } from '../entity';
import { defineEvent } from '.';
import { getEntityById } from '../utils/entity.helpers';
import { applyAuras } from '../aura';
import { addModifier, type ModifierId } from '../modifier';
import { modifiersLookup } from '../modifiers';

export const MODIFIER_ADDED = 'modifier_added';

export type ModifierAddedEvent = {
  type: typeof MODIFIER_ADDED;
  payload: {
    sourceId: EntityId;
    targetIds: EntityId[];
    modifierId: ModifierId;
  };
};

export const modifierAddedEvent = defineEvent({
  create: (
    sourceId: EntityId,
    targetIds: EntityId[],
    modifierId: ModifierId
  ): ModifierAddedEvent => ({
    type: MODIFIER_ADDED,
    payload: { targetIds, sourceId, modifierId }
  }),
  execute: (state, event) => {
    const entity = getEntityById(state, event.sourceId);
    if (!entity) return state;

    event.targetIds.forEach(targetId => {
      addModifier({
        state,
        source: getEntityById(state, event.sourceId)!,
        target: getEntityById(state, targetId)!,
        modifier: modifiersLookup[event.modifierId as keyof typeof modifiersLookup]
      });
    });

    applyAuras(state);

    return state;
  },
  sequence: () => {
    return Promise.resolve();
  }
});
