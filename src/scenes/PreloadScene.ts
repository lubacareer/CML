import { Scene } from 'phaser';
import {
    HAZEL_FRAME_HEIGHT,
    HAZEL_FRAME_WIDTH,
    HAZEL_TEXTURE_KEY
} from '../game/hazelAnimationConfig';

export class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('office', 'assets/backgrounds/office.png');
        this.load.image('street', 'assets/backgrounds/street.png');
        this.load.image('map', 'assets/backgrounds/map.png');
        this.load.spritesheet(HAZEL_TEXTURE_KEY, 'assets/characters/hazel-4dir.png', {
            frameWidth: HAZEL_FRAME_WIDTH,
            frameHeight: HAZEL_FRAME_HEIGHT
        });
    }

    create() {
        this.scene.start('OfficeScene');
    }
}
