import { describe, expect, it } from 'vitest';
import { PlayerController2D } from '../systems/PlayerController2D';

const createController = () => new PlayerController2D({
    x: 300,
    y: 610,
    minX: 40,
    maxX: 1240,
    speedPixelsPerSecond: 520
});

describe('PlayerController2D', () => {
    it('sets a clamped movement target', () => {
        const controller = createController();

        controller.moveTo(500, 640);

        expect(controller.getSnapshot()).toMatchObject({
            targetX: 500,
            targetY: 640,
            state: 'walking'
        });
    });

    it('faces right when moving to the right', () => {
        const controller = createController();

        controller.moveTo(500);

        expect(controller.getSnapshot().facing).toBe('right');
    });

    it('faces left when moving to the left', () => {
        const controller = createController();

        controller.moveTo(100);

        expect(controller.getSnapshot().facing).toBe('left');
    });

    it('faces up when vertical movement is dominant', () => {
        const controller = createController();

        controller.moveTo(320, 450);

        expect(controller.getSnapshot().facing).toBe('up');
    });

    it('faces down when vertical movement is dominant', () => {
        const controller = createController();

        controller.moveTo(320, 700);

        expect(controller.getSnapshot().facing).toBe('down');
    });

    it('returns to idle after reaching the target', () => {
        const controller = createController();

        controller.moveTo(305, 630);
        controller.update(1000);

        expect(controller.getSnapshot()).toMatchObject({
            x: 305,
            y: 630,
            facing: 'down',
            targetX: undefined,
            targetY: undefined,
            state: 'idle'
        });
    });

    it('can follow a multi-point path', () => {
        const controller = createController();

        controller.moveAlong([
            { x: 300, y: 650 },
            { x: 500, y: 650 }
        ]);

        expect(controller.getSnapshot()).toMatchObject({
            targetX: 300,
            targetY: 650,
            pathLength: 2,
            state: 'walking'
        });
    });
});
