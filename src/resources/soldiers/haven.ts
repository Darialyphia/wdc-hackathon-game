import type { SoldierData } from '.';
import { dealDamageEvent } from '../../game-logic/events/dealDamage.event';
import { entityDiedEvent } from '../../game-logic/events/entityDied.event';
import { getEntityAt } from '../../game-logic/utils/entity.helpers';
import { dealSingleTargetDamage } from '../../game-logic/utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../entity';
import { FACTIONS_IDS } from '../enums';

export const havenSoldiers: SoldierData[] = [
  {
    characterId: 'swordsman',
    spriteId: 'havenSwordsman',
    iconUrl: '/icons/haven_swordsman.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
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
  },
  {
    characterId: 'archer',
    spriteId: 'havenArcher',
    iconUrl: '/icons/haven_archer.gif',
    factionId: FACTIONS_IDS.HAVEN,
    name: 'Swordsman',
    cost: 2,
    initiative: 5,
    maxHp: 4,
    attack: 2,
    defense: 1,
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
          dealSingleTargetDamage(ctx, { basePower: 1 });
        }
      }
    ]
  }
];
