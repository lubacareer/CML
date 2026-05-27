import type { Scene } from 'phaser';
import { playAudioCue } from './AudioCueSystem';

const FADE_DURATION_MS = 140;

export const fadeInScene = (scene: Scene) => {
    scene.cameras.main.fadeIn(FADE_DURATION_MS, 0, 0, 0);
};

export const transitionToScene = (
    scene: Scene,
    sceneKey: string,
    data?: object
) => {
    playAudioCue('transition');
    scene.cameras.main.fadeOut(FADE_DURATION_MS, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start(sceneKey, data);
    });
};
