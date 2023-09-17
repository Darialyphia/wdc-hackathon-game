import type { GameState } from '.';
import type { Values } from '../utils/types';
import type { Entity } from './entity';
import { getEntityDistance } from './utils/entity.helpers';

export type AuraId = string;

export const AURA_TARGET_TYPES = {
  ENEMY: 'enemy',
  ALLY: 'ally',
  EVERYONE: 'everyone'
} as const;

export type AuraTargetType = Values<typeof AURA_TARGET_TYPES>;

export type Aura = {
  stat: 'attack' | 'defense' | 'initiative';
  id: AuraId;
  value: number;
  range: number;
  name: string;
  description: string;
  applyToSelf: boolean;
  targetType: AuraTargetType;
};

export const applyAuras = (state: GameState) => {
  state.entities.forEach(entity => {
    entity.auras.forEach(aura => {
      state.entities.forEach(target => {
        if (target.id === entity.id && !aura.applyToSelf) return;
        if (
          aura.targetType === AURA_TARGET_TYPES.ENEMY &&
          target.owner === entity.owner
        ) {
          return;
        }
        if (aura.targetType === AURA_TARGET_TYPES.ALLY && target.owner !== entity.owner) {
          return;
        }

        const dist = getEntityDistance(entity, target);
        const isOutOfRange = dist.x > aura.range || dist.y > aura.range;
        if (isOutOfRange) {
          target.modifiers = target.modifiers.filter(
            modifier => modifier.id !== aura.id && modifier.from !== entity.id
          );
          return;
        }

        const hasAura = target.modifiers.some(
          modifier => modifier.id === aura.id && modifier.from === entity.id
        );

        if (hasAura) return;
        target.modifiers.push({
          from: entity.id,
          id: aura.id,
          stat: aura.stat,
          value: aura.value,
          duration: Infinity
        });
      });
    });
  });
};
