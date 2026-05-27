import type { AssetPreviewId, MapLocationData, SceneId } from '../game/types';

export type MapNavigationResult =
    | { type: 'changeScene'; sceneId: SceneId }
    | { type: 'preview'; previewId: AssetPreviewId }
    | { type: 'locked'; text: string };

export const findMapLocationAtPoint = (
    locations: MapLocationData[],
    x: number,
    y: number
) => locations.find((location) => (
    x >= location.x
    && x <= location.x + location.width
    && y >= location.y
    && y <= location.y + location.height
));

export const isMapLocationUnlocked = (
    location: MapLocationData,
    flags: Record<string, boolean>
) => location.initiallyUnlocked === true || (
    location.requiredFlag !== undefined && flags[location.requiredFlag] === true
);

export const resolveMapLocation = (
    location: MapLocationData,
    flags: Record<string, boolean>
): MapNavigationResult => {
    if (!isMapLocationUnlocked(location, flags)) {
        return {
            type: 'locked',
            text: location.lockedText
        };
    }

    if (location.targetScene) {
        return {
            type: 'changeScene',
            sceneId: location.targetScene
        };
    }

    if (location.previewId) {
        return {
            type: 'preview',
            previewId: location.previewId
        };
    }

    return {
        type: 'locked',
        text: location.lockedText
    };
};
