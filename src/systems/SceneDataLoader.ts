import officeSceneData from '../data/scenes/office.json';
import streetSceneData from '../data/scenes/street.json';
import type { GameSceneData, SceneId } from '../game/types';

const sceneDataById: Partial<Record<SceneId, GameSceneData>> = {
    office: officeSceneData as unknown as GameSceneData,
    street: streetSceneData as unknown as GameSceneData
};

export const loadSceneData = (sceneId: SceneId): GameSceneData => {
    const sceneData = sceneDataById[sceneId];

    if (!sceneData) {
        throw new Error(`Scene data not found: ${sceneId}`);
    }

    return sceneData;
};
