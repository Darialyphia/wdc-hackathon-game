import { skills, type SkillId } from '@/resources/skills';
import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { endTurn, getEntityById } from '../utils/entity.helpers';
import { getSkillById } from '../utils/skill.helper';
import { endTurnEvent } from './endTurn.event';

export const SKILL_USED = 'skill_used';

export type SkillUsedEvent = {
  type: typeof SKILL_USED;
  payload: { sourceId: EntityId; skillId: SkillId };
};

export const skillUsedEvent = defineEvent({
  create: (sourceId: EntityId, skillId: SkillId): SkillUsedEvent => ({
    type: SKILL_USED,
    payload: { sourceId, skillId }
  }),
  execute: (state, { sourceId, skillId }) => {
    // just here for event logging purpose
    const entity = getEntityById(state, sourceId)!;
    const skill = getSkillById(skillId)!;
    entity.ap -= skill.cost;

    return state;
  }
});
