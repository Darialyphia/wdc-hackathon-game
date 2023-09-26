import type { Point } from '../../utils/geometry';
import { addSoldier, type CharacterId, type EntityId } from '../entity';
import { defineEvent } from '.';
import { getActiveEntity, getGeneral, isGeneral } from '../utils/entity.helpers';
import { soldiersLookup } from '../soldiers';
import { AnimatedSprite } from 'pixi.js';
import { CELL_SIZE } from '../constants';
import { createSpritesheetFrameObject } from '../../utils/sprite-utils';
import { applyAuras } from '../aura';
import { getIsoDepth, toIso } from '../utils/iso';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    sourceId: EntityId;
    characterId: CharacterId;
    position: Point;
    atbSeed: number;
    isExtraSummon?: boolean; // does the summon comes from a skill instead of a normal general summon
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (
    sourceId: EntityId,
    characterId: CharacterId,
    position: Point,
    atbSeed: number,
    isExtraSummon?: boolean
  ): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { sourceId, characterId, position, atbSeed, isExtraSummon }
  }),

  execute: (state, event) => {
    const activeEntity = getActiveEntity(state);
    if (!isGeneral(activeEntity)) return state;

    const general = getGeneral(state, activeEntity.owner);
    const blueprint = soldiersLookup[event.characterId as keyof typeof soldiersLookup];
    if (!blueprint) return state;

    if (!event.isExtraSummon) {
      general.ap -= blueprint.cost;
    }

    addSoldier(state, blueprint, {
      atbSeed: event.atbSeed,
      owner: activeEntity.owner,
      characterId: blueprint.characterId,
      position: event.position
    });

    applyAuras(state);

    return state;
  },

  sequence: (state, { payload }, { assets, fxContainer, screenMap }) =>
    new Promise(resolve => {
      const sheet = assets.resolveFx('summoningCircle');
      const summonCircle = new AnimatedSprite(
        createSpritesheetFrameObject('idle', sheet)
      );
      const isoPos = toIso({
        ...screenMap.getRotatedPosition(payload.position),
        z: 1
      });
      summonCircle.position.set(isoPos.isoX + CELL_SIZE / 2, isoPos.isoY);
      summonCircle.zIndex = getIsoDepth(isoPos);

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
