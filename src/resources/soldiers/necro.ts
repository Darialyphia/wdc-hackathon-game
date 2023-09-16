import type { SoldierData } from '.';
import { dealSingleTargetDamage } from '../../game-logic/utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../entity';
import { FACTIONS_IDS } from '../enums';

export const necroSoldiers: SoldierData[] = [
  {
    characterId: 'skeleton',
    spriteId: 'necroSkeleton',
    iconUrl: '/icons/necro_skeleton.gif',
    factionId: FACTIONS_IDS.NECRO,
    name: 'Skeleton',
    cost: 2,
    initiative: 5,
    maxHp: 6,
    attack: 2,
    defense: 1,
    skills: [
      {
        id: 'melee_attack',
        iconUrl: '/icons/melee_attack.png',
        name: 'Melee attack',
        cost: 2,
        minRange: 0,
        range: 1,
        targetZone: TARGET_ZONES.RADIUS,
        targetType: TARGET_TYPES.ENEMY,
        execute(ctx) {
          dealSingleTargetDamage(ctx, { basePower: 1 });
        }
      }
    ]
  }
];
