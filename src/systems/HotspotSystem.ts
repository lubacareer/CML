import type { HotspotData } from '../game/types';

export const getVisibleHotspots = (
    hotspots: HotspotData[],
    flags: Record<string, boolean> = {}
) => hotspots.filter((hotspot) => {
    if (hotspot.requiredFlag && !flags[hotspot.requiredFlag]) {
        return false;
    }

    if (hotspot.hiddenWhenFlag && flags[hotspot.hiddenWhenFlag]) {
        return false;
    }

    return true;
});

export const pointIsInsideHotspot = (
    hotspot: HotspotData,
    x: number,
    y: number
) => (
    x >= hotspot.x
    && x <= hotspot.x + hotspot.width
    && y >= hotspot.y
    && y <= hotspot.y + hotspot.height
);

export const findHotspotAtPoint = (
    hotspots: HotspotData[],
    x: number,
    y: number,
    flags: Record<string, boolean> = {}
) => {
    const visibleHotspots = getVisibleHotspots(hotspots, flags);

    for (let index = visibleHotspots.length - 1; index >= 0; index -= 1) {
        const hotspot = visibleHotspots[index];

        if (pointIsInsideHotspot(hotspot, x, y)) {
            return hotspot;
        }
    }

    return undefined;
};
