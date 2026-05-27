import type { Point2D, SceneNavigationData } from '../game/types';

const SEGMENT_SAMPLE_DISTANCE = 12;
const POINT_EPSILON = 0.001;
const BOUNDARY_NUDGE_DISTANCES = [24, 40, 64];

const distanceBetween = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y);

const pointIsInsidePolygon = (point: Point2D, polygon: Point2D[]) => {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
        const a = polygon[i];
        const b = polygon[j];
        const intersects = (
            (a.y > point.y) !== (b.y > point.y)
            && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
        );

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
};

export const pointIsInWalkableArea = (
    point: Point2D,
    navigation: SceneNavigationData
) => {
    const insideWalkableArea = navigation.walkableAreas.some((area) => (
        pointIsInsidePolygon(point, area.points)
    ));

    if (!insideWalkableArea) {
        return false;
    }

    return !(navigation.blockers ?? []).some((blocker) => (
        pointIsInsidePolygon(point, blocker.points)
    ));
};

export const segmentStaysInWalkableArea = (
    from: Point2D,
    to: Point2D,
    navigation: SceneNavigationData
) => {
    const distance = distanceBetween(from, to);
    const steps = Math.max(1, Math.ceil(distance / SEGMENT_SAMPLE_DISTANCE));

    for (let step = 0; step <= steps; step += 1) {
        const progress = step / steps;
        const point = {
            x: from.x + ((to.x - from.x) * progress),
            y: from.y + ((to.y - from.y) * progress)
        };

        if (!pointIsInWalkableArea(point, navigation)) {
            return false;
        }
    }

    return true;
};

const findNearestPointOnSegment = (point: Point2D, start: Point2D, end: Point2D) => {
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const segmentLengthSquared = (segmentX * segmentX) + (segmentY * segmentY);

    if (segmentLengthSquared <= POINT_EPSILON) {
        return start;
    }

    const progress = Math.max(0, Math.min(1, (
        ((point.x - start.x) * segmentX) + ((point.y - start.y) * segmentY)
    ) / segmentLengthSquared));

    return {
        x: start.x + (segmentX * progress),
        y: start.y + (segmentY * progress)
    };
};

const resolveBoundaryCandidate = (
    point: Point2D,
    candidate: Point2D,
    navigation: SceneNavigationData
) => {
    const deltaX = candidate.x - point.x;
    const deltaY = candidate.y - point.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= POINT_EPSILON) {
        const nearbyCandidates = [
            candidate,
            { x: candidate.x, y: candidate.y - 2 },
            { x: candidate.x + 2, y: candidate.y },
            { x: candidate.x, y: candidate.y + 2 },
            { x: candidate.x - 2, y: candidate.y }
        ];

        return nearbyCandidates.find((nearbyCandidate) => (
            pointIsInWalkableArea(nearbyCandidate, navigation)
        ));
    }

    const directionX = deltaX / distance;
    const directionY = deltaY / distance;

    return BOUNDARY_NUDGE_DISTANCES
        .map((nudgeDistance) => ({
            x: candidate.x + (directionX * nudgeDistance),
            y: candidate.y + (directionY * nudgeDistance)
        }))
        .find((nudgedCandidate) => pointIsInWalkableArea(nudgedCandidate, navigation));
};

const findNearestWalkableBoundaryPoint = (
    point: Point2D,
    navigation: SceneNavigationData
) => {
    let nearestPoint: Point2D | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const boundaryAreas = [
        ...navigation.walkableAreas,
        ...(navigation.blockers ?? [])
    ];

    boundaryAreas.forEach((area) => {
        area.points.forEach((start, index) => {
            const end = area.points[(index + 1) % area.points.length];
            const candidate = findNearestPointOnSegment(point, start, end);
            const walkableCandidate = resolveBoundaryCandidate(point, candidate, navigation);

            if (!walkableCandidate) {
                return;
            }

            const candidateDistance = distanceBetween(point, walkableCandidate);

            if (candidateDistance < nearestDistance) {
                nearestPoint = walkableCandidate;
                nearestDistance = candidateDistance;
            }
        });
    });

    return nearestPoint;
};

export const resolveWalkableTarget = (
    point: Point2D,
    navigation: SceneNavigationData
) => {
    if (pointIsInWalkableArea(point, navigation)) {
        return point;
    }

    return findNearestWalkableBoundaryPoint(point, navigation);
};

const reconstructPath = (
    previousNodeById: Record<string, string | undefined>,
    endNodeId: string
) => {
    const path: string[] = [];
    let currentNodeId: string | undefined = endNodeId;

    while (currentNodeId) {
        path.unshift(currentNodeId);
        currentNodeId = previousNodeById[currentNodeId];
    }

    return path;
};

export const findNavigationPath = (
    from: Point2D,
    rawTarget: Point2D,
    navigation: SceneNavigationData
): Point2D[] | undefined => {
    const target = resolveWalkableTarget(rawTarget, navigation);

    if (!target) {
        return undefined;
    }

    if (segmentStaysInWalkableArea(from, target, navigation)) {
        return [target];
    }

    const reachableFromStart = navigation.nodes.filter((node) => (
        segmentStaysInWalkableArea(from, node, navigation)
    ));
    const reachableFromTarget = navigation.nodes.filter((node) => (
        segmentStaysInWalkableArea(node, target, navigation)
    ));

    if (reachableFromStart.length === 0 || reachableFromTarget.length === 0) {
        return undefined;
    }

    const nodeById = Object.fromEntries(navigation.nodes.map((node) => [node.id, node]));
    const targetNodeIds = new Set(reachableFromTarget.map((node) => node.id));
    const openNodeIds = new Set<string>();
    const distanceById: Record<string, number> = {};
    const previousNodeById: Record<string, string | undefined> = {};

    navigation.nodes.forEach((node) => {
        distanceById[node.id] = Number.POSITIVE_INFINITY;
        openNodeIds.add(node.id);
    });

    reachableFromStart.forEach((node) => {
        distanceById[node.id] = distanceBetween(from, node);
    });

    while (openNodeIds.size > 0) {
        const currentNodeId = [...openNodeIds].reduce((bestId, candidateId) => (
            distanceById[candidateId] < distanceById[bestId] ? candidateId : bestId
        ));
        const currentNode = nodeById[currentNodeId];

        openNodeIds.delete(currentNodeId);

        if (!currentNode || distanceById[currentNodeId] === Number.POSITIVE_INFINITY) {
            break;
        }

        currentNode.links.forEach((linkedNodeId) => {
            if (!openNodeIds.has(linkedNodeId)) {
                return;
            }

            const linkedNode = nodeById[linkedNodeId];

            if (!linkedNode) {
                return;
            }

            if (!segmentStaysInWalkableArea(currentNode, linkedNode, navigation)) {
                return;
            }

            const nextDistance = distanceById[currentNodeId] + distanceBetween(currentNode, linkedNode);

            if (nextDistance < distanceById[linkedNodeId]) {
                distanceById[linkedNodeId] = nextDistance;
                previousNodeById[linkedNodeId] = currentNodeId;
            }
        });
    }

    const bestTargetNode = reachableFromTarget.reduce((bestNode, candidateNode) => {
        const bestDistance = distanceById[bestNode.id] + distanceBetween(bestNode, target);
        const candidateDistance = distanceById[candidateNode.id] + distanceBetween(candidateNode, target);

        return candidateDistance < bestDistance ? candidateNode : bestNode;
    });

    if (
        !targetNodeIds.has(bestTargetNode.id)
        || distanceById[bestTargetNode.id] === Number.POSITIVE_INFINITY
    ) {
        return undefined;
    }

    const nodePath = reconstructPath(previousNodeById, bestTargetNode.id)
        .map((nodeId) => nodeById[nodeId])
        .filter(Boolean);

    return [
        ...nodePath.map((node) => ({ x: node.x, y: node.y })),
        target
    ];
};
