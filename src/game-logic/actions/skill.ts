import { z } from 'zod';
import { defineAction } from '.';
import { getActiveEntity } from '../utils/entity.helpers';
import { createPlayerAbility } from '../abilities/player.ability';
import { subject } from '@casl/ability';
import { endTurnEvent } from '../events/endTurn.event';
import { reducer } from '../events/reducer';
import { getSkillById } from '../utils/skill.helper';
import { createEntityAbility } from '../abilities/entity.ability';
import { createSkillAbility } from '../abilities/skill.ability';
import { skillUsedEvent } from '../events/skillUsed.event';
import type { SkillId } from '../../resources/skills';

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
    const skill = getSkillById(input.skillId as SkillId);
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

    reducer(state, skillUsedEvent.create(entity.id, skill.id));
    skill.execute(reducer, state, entity, input.target);

    if (entity.ap === 0) {
      reducer(state, endTurnEvent.create(state.activeEntityId));
    }
  }
});
