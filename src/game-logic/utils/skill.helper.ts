import { skills, type SkillId } from '../../resources/skills';

export const getSkillById = (skillId: SkillId) => {
  return Object.values(skills).find(s => s.id === skillId);
};
