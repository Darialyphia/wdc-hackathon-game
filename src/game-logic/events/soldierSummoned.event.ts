import type { Point } from '../../utils/geometry';
import { addSoldier, type CharacterId, type EntityId } from '../entity';
import { defineEvent } from '.';
import {
  getActiveEntity,
  getEntityById,
  getGeneral,
  isGeneral
} from '../utils/entity.helpers';
import { getSoldierById } from '../../resources/soldiers';
import { AnimatedSprite } from 'pixi.js';
import { CELL_SIZE } from '../constants';
import { createSpritesheetFrameObject } from '../../utils/sprite-utils';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    sourceId: EntityId;
    characterId: CharacterId;
    position: Point;
    atbSeed: number;
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (
    sourceId: EntityId,
    characterId: CharacterId,
    position: Point,
    atbSeed: number
  ): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { sourceId, characterId, position, atbSeed }
  }),

  execute: (state, event) => {
    const activeEntity = getActiveEntity(state);
    if (!isGeneral(activeEntity)) return state;

    const general = getGeneral(state, activeEntity.owner);
    const blueprint = getSoldierById(event.characterId);
    if (!blueprint) return state;

    general.ap -= blueprint.cost;

    addSoldier(state, blueprint, {
      atbSeed: event.atbSeed,
      owner: activeEntity.owner,
      characterId: blueprint.characterId,
      position: event.position
    });

    activeEntity.hasSummonned = true;

    return state;
  },

  sequence: (state, { payload }, { assets, fxContainer }) =>
    new Promise(resolve => {
      const entity = getEntityById(state, payload.sourceId)!;

      const ap = entity.ap;
      gsap.to(entity, {
        duration: 0.3,
        ease: Power2.easeOut,
        delay: 0,
        onComplete: () => {
          // set back hp to old value because the game reducer will decrease it as well
          entity.ap = ap;
        },
        ap: entity.ap - getSoldierById(payload.characterId)!.cost
      });

      const sheet = assets.resolveFx('summoningCircle');
      const summonCircle = new AnimatedSprite(
        createSpritesheetFrameObject('idle', sheet)
      );
      summonCircle.position.set(
        payload.position.x * CELL_SIZE + CELL_SIZE / 2,
        payload.position.y * CELL_SIZE + CELL_SIZE / 2
      );
      summonCircle.loop = false;
      summonCircle.onFrameChange = frame => {
        if (frame > summonCircle.totalFrames / 2) {
          resolve();
          summonCircle.onFrameChange = undefined;
        }
      };
      summonCircle.onComplete = () => {
        summonCircle.destroy();
      };
      summonCircle.anchor.set(0.5);

      fxContainer.addChild(summonCircle);
      summonCircle.play();
    })
});
