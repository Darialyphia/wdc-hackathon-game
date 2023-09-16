import { skills, type SkillId } from '../../resources/skills';
import type { Entity } from '../entity';

export const getSkillById = (entity: Entity, skillId: SkillId) => {
  return entity.blueprint.skills.find(skill => skill.id === skillId);
};
