import type { AuraId } from './aura';
import type { Entity, EntityId } from './entity';
import type { SkillId } from './utils/entityData';

export type Modifier = {
  from: EntityId; // indicates the origin of the modifier so it can't be applied twice
  id: AuraId | SkillId;
  stat: 'attack' | 'defense' | 'initiative';
  value: number;
  duration: number;
};

export const applyModifier = (entity: Entity, stat: Modifier['stat']) => {
  const base = entity.blueprint[stat];

  return entity.modifiers.reduce((total, modifier) => {
    if (modifier.stat !== stat) return total;

    return total + modifier.value;
  }, base);
};
