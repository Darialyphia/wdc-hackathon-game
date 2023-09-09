import type { SkillData } from '.';
import { TARGET_TYPES } from './enums';

export const meleeAttack: SkillData = {
  id: 'melee_attack',
  name: 'Melee attack',
  cost: 1,
  range: 1,
  targetType: TARGET_TYPES.ENEMY,
  execute(state) {
    console.log('melee attack casted');
    return [];
  }
};
