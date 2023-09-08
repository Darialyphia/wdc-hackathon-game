import { haven } from './haven';
import { necro } from './necro';
import type { FactionId } from '../enums';

export type FactionData = {
  id: FactionId;
  name: string;
};

export const factions = { haven, necro } satisfies Record<string, FactionData>;
