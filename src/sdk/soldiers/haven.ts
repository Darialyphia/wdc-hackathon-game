import type { SoldierData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';

export const havenSoldiers: SoldierData[] = [
  {
    characterId: 'swordsman',
    spriteId: 'havenSwordsman',
    iconUrl: '/icons/haven_swordsman.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 7,
    maxHp: 6,
    attack: 2,
    defense: 1,
    triggers: [],
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
          dealSingleTargetDamage(ctx, {
            to: getEntityAt(ctx.state, ctx.target)!.id,
            basePower: 1
          });
        }
      }
    ]
  },
  {
    characterId: 'archer',
    spriteId: 'havenArcher',
    iconUrl: '/icons/haven_archer.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 6,
    maxHp: 4,
    attack: 2,
    defense: 0,
    triggers: [],
    skills: [
      {
        id: 'ranged_attack',
        iconUrl: '/icons/ranged_attack.png',
        name: 'Ranged attack',
        cost: 2,
        range: 5,
        minRange: 2,
        targetZone: TARGET_ZONES.LINE,
        targetType: TARGET_TYPES.ENEMY,
        execute(ctx) {
          dealSingleTargetDamage(ctx, {
            to: getEntityAt(ctx.state, ctx.target)!.id,
            basePower: 1
          });
        }
      }
    ]
  }
];
