import type { GameState } from '.';
import type { Values } from '../utils/types';
import type { Entity } from './entity';
import { addModifier, removeModifier } from './modifier';
import { getEntityDistance } from './utils/entity.helpers';

export type AuraId = string;

export const AURA_TARGET_TYPES = {
  ENEMY: 'enemy',
  ALLY: 'ally',
  EVERYONE: 'everyone'
} as const;

export type AuraTargetType = Values<typeof AURA_TARGET_TYPES>;

export type Aura = {
  id: AuraId;
  range: number;
  name: string;
  description: string;
  applyToSelf: boolean;
  targetType: AuraTargetType;
  execute(state: GameState, entity: Entity): void;
  cleanup(state: GameState, entity: Entity): void;
};

export const applyAuras = (state: GameState) => {
  state.entities.forEach(entity => {
    entity.auras.forEach(aura => {
      state.entities.forEach(target => {
        const auraModifier = {
          from: entity.id,
          id: aura.id,
          duration: Infinity,
          execute: aura.execute,
          cleanup: aura.cleanup
        };

        if (target.id === entity.id && !aura.applyToSelf) return;

        const isInvalidTarget =
          (aura.targetType === AURA_TARGET_TYPES.ENEMY &&
            target.owner === entity.owner) ||
          (aura.targetType === AURA_TARGET_TYPES.ALLY && target.owner !== entity.owner);
        if (isInvalidTarget) return;

        const dist = getEntityDistance(entity, target);
        const isOutOfRange = dist.x > aura.range || dist.y > aura.range;

        if (isOutOfRange) return removeModifier(state, target, auraModifier);

        const hasAura = target.modifiers.some(
          modifier => modifier.id === aura.id && modifier.from === entity.id
        );

        if (hasAura) return;
        addModifier(state, target, auraModifier);
      });
    });
  });
};
