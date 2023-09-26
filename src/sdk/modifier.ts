import type { GameState } from '.';
import type { Nullable } from '../utils/types';
import type { Entity, EntityId } from './entity';
import { getEntityById } from './utils/entity.helpers';

export type ModifierId = string;

export type ModifierData = {
  id: ModifierId;
  duration: number;
  name: string;
  description: string;
  execute(state: GameState, target: Entity, source: Entity): void;
  cleanup(state: GameState, entity: Entity, source: Nullable<Entity>): void;
};

export type Modifier = ModifierData & {
  from: EntityId;
};

export type SerializedModifier = {
  id: ModifierId;
  from: EntityId;
};

export const addModifier = ({
  state,
  source,
  target,
  modifier,
  canStack
}: {
  state: GameState;
  source: Entity;
  target: Entity;
  modifier: Omit<Modifier, 'from'>;
  canStack?: boolean;
}) => {
  const hasModifier = target.modifiers.some(
    m => m.id === modifier.id && m.from === source.id
  );

  if (!canStack && hasModifier) return;

  modifier.execute(state, target, source);
  target.modifiers.push({ ...modifier, from: source.id });
};

export const removeModifier = (state: GameState, entity: Entity, modifier: Modifier) => {
  const index = entity.modifiers.findIndex(
    m => m.id === modifier.id && m.from === modifier.from
  );
  if (index === -1) return;

  entity.modifiers[index]?.cleanup(state, entity, getEntityById(state, modifier.from));
  entity.modifiers.splice(index, 1);
};
