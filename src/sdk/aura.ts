import type { GameState } from '.';
import type { Values } from '../utils/types';
import { addModifier, removeModifier, type ModifierData } from './modifier';
import { getEntityDistance, isAlly, isEnemy } from './utils/entity.helpers';

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
  modifier: ModifierData;
};

export const applyAuras = (state: GameState) => {
  state.entities.forEach(source => {
    source.auras.forEach(aura => {
      state.entities.forEach(target => {
        if (target.id === source.id && !aura.applyToSelf) return;

        const isValidTarget =
          //prettier-ignore
          (aura.targetType === AURA_TARGET_TYPES.ENEMY && isEnemy(source.owner, target)) ||
          (aura.targetType === AURA_TARGET_TYPES.ALLY && isAlly(source.owner, target));

        if (isValidTarget) return;

        const dist = getEntityDistance(source, target);
        const isOutOfRange = dist.x > aura.range || dist.y > aura.range;

        if (isOutOfRange) {
          return removeModifier(state, target, { ...aura.modifier, from: source.id });
        }

        const hasAura = target.modifiers.some(
          modifier => modifier.id === aura.id && modifier.from === source.id
        );

        if (hasAura) return;

        addModifier(state, source, target, aura.modifier);
      });
    });
  });
};
