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
        this.load.image('cafe', 'assets/backgrounds/cafe.png');
        this.load.image('police-kiosk', 'assets/backgrounds/police-kiosk.png');
        this.load.image('alley', 'assets/backgrounds/alley.png');
        this.load.image('cafe-owner', 'assets/characters/npcs/cafe_owner.png');
        this.load.image('overly-rational-pigeon', 'assets/characters/npcs/overly_rational_pigeon.png');
        this.load.image('cold-coffee', 'assets/items/cold-coffee.png');
        this.load.image('invalid-alibi', 'assets/items/invalid_alibi.png');
        this.load.spritesheet(HAZEL_TEXTURE_KEY, 'assets/characters/hazel-4dir.png', {
            frameWidth: HAZEL_FRAME_WIDTH,
            frameHeight: HAZEL_FRAME_HEIGHT
        });
    }

    create() {
        this.scene.start('TitleScene');
    }
}
