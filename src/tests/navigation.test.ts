import { describe, expect, it } from 'vitest';
import {
    findNavigationPath,
    pointIsInWalkableArea,
    segmentStaysInWalkableArea
} from '../systems/NavigationSystem';
import { loadSceneData } from '../systems/SceneDataLoader';

describe('NavigationSystem', () => {
    const office = loadSceneData('office');
    const street = loadSceneData('street');

    const expectPathSegmentsToStayWalkable = (
        start: { x: number; y: number },
        path: { x: number; y: number }[]
    ) => {
        let previousPoint = start;

        path.forEach((pathPoint) => {
            expect(
                segmentStaysInWalkableArea(previousPoint, pathPoint, office.navigation!),
                `Expected segment ${JSON.stringify(previousPoint)} -> ${JSON.stringify(pathPoint)} to stay walkable`
            ).toBe(true);
            previousPoint = pathPoint;
        });
    };

    it('treats visible floor as walkable', () => {
        expect(pointIsInWalkableArea({ x: 520, y: 650 }, office.navigation!)).toBe(true);
    });

    it('does not treat the desk as walkable', () => {
        expect(pointIsInWalkableArea({ x: 600, y: 480 }, office.navigation!)).toBe(false);
        expect(pointIsInWalkableArea({ x: 560, y: 620 }, office.navigation!)).toBe(false);
    });

    it('does not treat the filing cabinet face as walkable', () => {
        expect(pointIsInWalkableArea({ x: 335, y: 430 }, office.navigation!)).toBe(false);
    });

    it('does not treat office chair seats as walkable', () => {
        expect(pointIsInWalkableArea({ x: 240, y: 610 }, office.navigation!)).toBe(false);
        expect(pointIsInWalkableArea({ x: 760, y: 610 }, office.navigation!)).toBe(false);
        expect(pointIsInWalkableArea({ x: 940, y: 610 }, office.navigation!)).toBe(false);
    });

    it('does not treat the coffee station as walkable', () => {
        expect(pointIsInWalkableArea({ x: 1120, y: 610 }, office.navigation!)).toBe(false);
        expect(pointIsInWalkableArea({ x: 1120, y: 690 }, office.navigation!)).toBe(false);
    });

    it('does not treat the office door panel as walkable', () => {
        expect(pointIsInWalkableArea({ x: 995, y: 470 }, office.navigation!)).toBe(false);
    });

    it('does not treat the street bicycle as walkable', () => {
        expect(pointIsInWalkableArea({ x: 900, y: 585 }, street.navigation!)).toBe(false);
    });

    it('snaps clicks on office chairs to nearby valid floor', () => {
        const path = findNavigationPath(
            { x: 520, y: 650 },
            { x: 240, y: 610 },
            office.navigation!
        );

        expect(path).toBeDefined();
        const target = path![path!.length - 1];
        expect(target).not.toMatchObject({ x: 240, y: 610 });
        expect(pointIsInWalkableArea(target, office.navigation!)).toBe(true);
    });

    it('keeps every office graph link inside walkable space', () => {
        const nodesById = Object.fromEntries(
            office.navigation!.nodes.map((node) => [node.id, node])
        );

        office.navigation!.nodes.forEach((node) => {
            node.links.forEach((linkedNodeId) => {
                const linkedNode = nodesById[linkedNodeId];

                expect(linkedNode, `Missing linked node ${linkedNodeId}`).toBeDefined();
                expect(
                    segmentStaysInWalkableArea(node, linkedNode, office.navigation!),
                    `Expected graph link ${node.id} -> ${linkedNodeId} to stay walkable`
                ).toBe(true);
            });
        });
    });

    it('snaps clicks on the desk front to nearby valid floor', () => {
        const path = findNavigationPath(
            { x: 520, y: 650 },
            { x: 560, y: 620 },
            office.navigation!
        );

        expect(path).toBeDefined();
        const target = path![path!.length - 1];
        expect(target).not.toMatchObject({ x: 560, y: 620 });
        expect(pointIsInWalkableArea(target, office.navigation!)).toBe(true);
    });

    it('snaps clicks on the coffee station to nearby valid floor', () => {
        const path = findNavigationPath(
            { x: 520, y: 650 },
            { x: 1120, y: 610 },
            office.navigation!
        );

        expect(path).toBeDefined();
        const target = path![path!.length - 1];
        expect(target).not.toMatchObject({ x: 1120, y: 610 });
        expect(pointIsInWalkableArea(target, office.navigation!)).toBe(true);
    });

    it('snaps clicks beside the office door down to the floor', () => {
        const path = findNavigationPath(
            { x: 520, y: 650 },
            { x: 995, y: 470 },
            office.navigation!
        );

        expect(path).toBeDefined();
        const target = path![path!.length - 1];
        expect(target).not.toMatchObject({ x: 995, y: 470 });
        expect(target.y).toBeGreaterThanOrEqual(590);
        expect(pointIsInWalkableArea(target, office.navigation!)).toBe(true);
    });

    it('does not route through middle chair blockers via graph links', () => {
        const start = { x: 540, y: 650 };
        const path = findNavigationPath(
            start,
            { x: 1025, y: 475 },
            office.navigation!
        );

        expect(segmentStaysInWalkableArea(
            { x: 540, y: 650 },
            { x: 900, y: 650 },
            office.navigation!
        )).toBe(false);
        expect(path).toBeDefined();
        expectPathSegmentsToStayWalkable(start, path!);
    });

    it('keeps every segment walkable when routing across the office chairs', () => {
        const start = { x: 520, y: 650 };
        const path = findNavigationPath(
            start,
            { x: 1120, y: 690 },
            office.navigation!
        );

        expect(path).toBeDefined();
        expectPathSegmentsToStayWalkable(start, path!);
    });

    it('snaps clicks on the street bicycle to nearby valid sidewalk', () => {
        const path = findNavigationPath(
            { x: 610, y: 650 },
            { x: 900, y: 585 },
            street.navigation!
        );

        expect(path).toBeDefined();
        const target = path![path!.length - 1];
        expect(target).not.toMatchObject({ x: 900, y: 585 });
        expect(pointIsInWalkableArea(target, street.navigation!)).toBe(true);
    });

    it('routes around the desk when moving toward the office door', () => {
        const path = findNavigationPath(
            { x: 520, y: 650 },
            { x: 1025, y: 475 },
            office.navigation!
        );

        expect(path).toBeDefined();
        expect(path!.length).toBeGreaterThan(1);
        expect(path![path!.length - 1]).not.toMatchObject({ x: 1025, y: 475 });
        expect(path![path!.length - 1].y).toBeGreaterThanOrEqual(590);
    });
});
