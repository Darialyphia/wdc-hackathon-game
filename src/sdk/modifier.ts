import type { GameState } from '.';
import type { AuraId } from './aura';
import type { Entity, EntityId } from './entity';
import type { SkillId } from './utils/entityData';

export type Modifier = {
  from: EntityId; // indicates the origin of the modifier so it can't be applied twice
  id: AuraId | SkillId;
  duration: number;
  execute(state: GameState, entity: Entity): void;
  cleanup(state: GameState, entity: Entity): void;
};

export const addModifier = (state: GameState, entity: Entity, modifier: Modifier) => {
  modifier.execute(state, entity);
  entity.modifiers.push(modifier);
};

export const removeModifier = (state: GameState, entity: Entity, modifier: Modifier) => {
  const index = entity.modifiers.findIndex(
    m => m.id === modifier.id && m.from === modifier.from
  );
  if (index === -1) return;

  entity.modifiers[index]?.cleanup(state, entity);
  entity.modifiers.splice(index, 1);
};
