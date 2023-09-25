import { z } from 'zod';
import { defineAction } from '.';
import { getActiveEntity, hasFinishedTurn } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { endTurnEvent } from '../events/endTurn.event';
import { getSkillById } from '../utils/skill.helpers';
import { createEntityAbility } from '../abilities/entity.ability';
import { createSkillAbility } from '../abilities/skill.ability';
import { skillUsedEvent } from '../events/skillUsed.event';
import type { SkillId } from '../utils/entityData';

export const skillActionInput = z.object({
  playerId: z.string(),
  skillId: z.string(),
  target: z.object({
    x: z.number(),
    y: z.number()
  })
});

export type SkillActionInput = z.infer<typeof skillActionInput>;

export const createSkillAction = defineAction({
  input: skillActionInput,
  handler: ({ input, state }) => {
    const entity = getActiveEntity(state);
    const skill = getSkillById(entity, input.skillId as SkillId);
    if (!skill) return;

    const playerAbility = createPlayerAbility(state, input.playerId);
    if (!entity || playerAbility.cannot('use_skill', subject('entity', entity))) {
      return;
    }

    const entityAbility = createEntityAbility(state, entity);
    if (entityAbility.cannot('cast', subject('skill', skill))) {
      return;
    }

    const skillAbility = createSkillAbility(state, skill, entity);
    if (skillAbility.cannot('target', subject('cell', input.target))) {
      return;
    }

    state.reducer(state, skillUsedEvent.create(entity.id, skill.id));
    skill.execute({ state, caster: entity, target: input.target });

    if (hasFinishedTurn(entity)) {
      state.reducer(state, endTurnEvent.create(state.activeEntityId));
    }
  }
});
