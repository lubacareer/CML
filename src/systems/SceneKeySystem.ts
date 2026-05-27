import type { SceneId } from '../game/types';

const sceneKeyById: Record<SceneId, string> = {
    office: 'OfficeScene',
    street: 'StreetScene',
    map: 'MapScene',
    cafe: 'CafeScene',
    'police-kiosk': 'PoliceKioskScene'
};

export const getSceneKeyForSceneId = (sceneId: SceneId) => sceneKeyById[sceneId];
