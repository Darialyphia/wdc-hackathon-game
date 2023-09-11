import type { AnyObject, Entries } from './types';

export const objectEntries = <T extends AnyObject>(obj: T) =>
  Object.entries(obj) as Entries<T>;
