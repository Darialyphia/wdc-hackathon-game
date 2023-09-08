import type { CharacterId } from '@/game-logic/entity';
import type { FactionId } from '../enums';

export type SoldierData = {
  id: CharacterId;
  factionId: FactionId;
  name: string;
  cost: number;
};
