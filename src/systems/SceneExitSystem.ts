import type { SceneExitData } from '../game/types';

export const getAvailableExits = (
    exits: SceneExitData[],
    flags: Record<string, boolean> = {}
) => exits.filter((exit) => !exit.requiredFlag || flags[exit.requiredFlag]);

export const pointIsInsideExit = (
    exit: SceneExitData,
    x: number,
    y: number
) => (
    x >= exit.x
    && x <= exit.x + exit.width
    && y >= exit.y
    && y <= exit.y + exit.height
);

export const findExitAtPoint = (
    exits: SceneExitData[],
    x: number,
    y: number,
    flags: Record<string, boolean> = {}
) => getAvailableExits(exits, flags).find((exit) => pointIsInsideExit(exit, x, y));
