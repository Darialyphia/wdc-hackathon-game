import type { Point } from './geometry';

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const random = (max: number) => Math.random() * max;

export const randomInt = (max: number) => Math.round(random(max));

export const mapRange = (
  num: number,
  inRange: [number, number],
  outRange: [number, number]
) => {
  const mapped: number =
    ((num - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) +
    outRange[0];

  return clamp(mapped, outRange[0], outRange[1]);
};

export const sat = (num: number) => clamp(num, 0, 1);

export const deg2Rad = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const rad2Deg = (radians: number) => {
  return (180 * radians) / Math.PI;
};

export const smootherStep = (x: number) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

export const smootherlerp = (num: number, [min, max]: [number, number]) => {
  return min + smootherStep(num) * (max - min);
};

export const lerp = (num: number, [min, max]: [number, number]) => {
  return min + num * (max - min);
};

export const dist = (p1: Point, p2: Point) => {
  const diffX = p2.x - p1.x;
  const diffY = p2.y - p1.y;

  return Math.sqrt(diffX ** 2 + diffY ** 2);
};

export const fastDistCheck = (p1: Point, p2: Point, limit: number) => {
  const diffX = Math.abs(p2.x - p1.x);
  const diffY = Math.abs(p2.y - p1.y);

  return diffX ** 2 + diffY ** 2 <= limit ** 2;
};
