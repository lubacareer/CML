import type { Point2D } from '../game/types';

export type PlayerFacing = 'left' | 'right' | 'up' | 'down';
export type PlayerMovementState = 'idle' | 'walking';

export interface PlayerControllerOptions {
    x: number;
    y: number;
    minX: number;
    maxX: number;
    speedPixelsPerSecond: number;
}

export interface PlayerControllerSnapshot {
    x: number;
    y: number;
    targetX?: number;
    targetY?: number;
    pathLength: number;
    facing: PlayerFacing;
    state: PlayerMovementState;
}

const ARRIVAL_EPSILON = 1;

const getFacingForDelta = (
    deltaX: number,
    deltaY: number,
    fallback: PlayerFacing
): PlayerFacing => {
    if (Math.abs(deltaX) <= ARRIVAL_EPSILON && Math.abs(deltaY) <= ARRIVAL_EPSILON) {
        return fallback;
    }

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        return deltaX < 0 ? 'left' : 'right';
    }

    return deltaY < 0 ? 'up' : 'down';
};

export class PlayerController2D {
    private x: number;
    private y: number;
    private readonly minX: number;
    private readonly maxX: number;
    private readonly speedPixelsPerSecond: number;
    private path: Point2D[] = [];
    private facing: PlayerFacing = 'right';
    private arrivalFacing: PlayerFacing = 'right';
    private state: PlayerMovementState = 'idle';

    constructor(options: PlayerControllerOptions) {
        this.x = options.x;
        this.y = options.y;
        this.minX = options.minX;
        this.maxX = options.maxX;
        this.speedPixelsPerSecond = options.speedPixelsPerSecond;
    }

    moveTo(x: number, y = this.y) {
        this.moveAlong([{ x, y }]);
    }

    moveAlong(path: Point2D[]) {
        const clampedPath = path.map((point) => ({
            x: Math.max(this.minX, Math.min(this.maxX, point.x)),
            y: point.y
        })).filter((point) => (
            Math.abs(point.x - this.x) > ARRIVAL_EPSILON
            || Math.abs(point.y - this.y) > ARRIVAL_EPSILON
        ));

        if (clampedPath.length === 0) {
            this.path = [];
            this.state = 'idle';
            return;
        }

        const firstTarget = clampedPath[0];
        const finalTarget = clampedPath[clampedPath.length - 1];
        const finalStart = clampedPath[clampedPath.length - 2] ?? { x: this.x, y: this.y };

        this.facing = getFacingForDelta(firstTarget.x - this.x, firstTarget.y - this.y, this.facing);
        this.arrivalFacing = getFacingForDelta(
            finalTarget.x - finalStart.x,
            finalTarget.y - finalStart.y,
            this.facing
        );
        this.path = clampedPath;
        this.state = 'walking';
    }

    getPosition(): Point2D {
        return {
            x: this.x,
            y: this.y
        };
    }

    private get activeTarget() {
        return this.path[0];
    }

    update(deltaMs: number) {
        const target = this.activeTarget;

        if (!target) {
            return;
        }

        const distanceX = target.x - this.x;
        const distanceY = target.y - this.y;
        const distance = Math.hypot(distanceX, distanceY);
        const maxStep = this.speedPixelsPerSecond * (deltaMs / 1000);

        this.facing = getFacingForDelta(distanceX, distanceY, this.facing);

        if (distance <= maxStep || distance <= ARRIVAL_EPSILON) {
            this.x = target.x;
            this.y = target.y;
            this.path.shift();
            this.state = this.path.length > 0 ? 'walking' : 'idle';

            if (this.state === 'idle') {
                this.facing = this.arrivalFacing;
            }

            return;
        }

        const progress = maxStep / distance;
        this.x += distanceX * progress;
        this.y += distanceY * progress;
        this.state = 'walking';
    }

    getSnapshot(): PlayerControllerSnapshot {
        return {
            x: this.x,
            y: this.y,
            targetX: this.activeTarget?.x,
            targetY: this.activeTarget?.y,
            pathLength: this.path.length,
            facing: this.facing,
            state: this.state
        };
    }
}
