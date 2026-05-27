import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { gameState } from '../systems/GameState';

export type AssetPreviewId = 'cafe' | 'police-kiosk' | 'alley';

interface AssetPreviewSprite {
    key: string;
    x: number;
    y: number;
    scale: number;
    depth: number;
}

interface AssetPreviewDefinition {
    id: AssetPreviewId;
    title: string;
    backgroundKey: string;
    sprites: AssetPreviewSprite[];
}

interface AssetPreviewPayload {
    previewId?: AssetPreviewId;
}

const assetPreviews: Record<AssetPreviewId, AssetPreviewDefinition> = {
    cafe: {
        id: 'cafe',
        title: "Daisy's Cafe",
        backgroundKey: 'cafe',
        sprites: [
            { key: 'cafe-owner', x: 1045, y: 705, scale: 0.24, depth: 8 },
            { key: 'invalid-alibi', x: 240, y: 635, scale: 0.08, depth: 9 }
        ]
    },
    'police-kiosk': {
        id: 'police-kiosk',
        title: 'Police Kiosk',
        backgroundKey: 'police-kiosk',
        sprites: [
            { key: 'invalid-alibi', x: 960, y: 635, scale: 0.1, depth: 8 }
        ]
    },
    alley: {
        id: 'alley',
        title: 'Narrow Alley',
        backgroundKey: 'alley',
        sprites: [
            { key: 'overly-rational-pigeon', x: 910, y: 650, scale: 0.18, depth: 8 },
            { key: 'invalid-alibi', x: 1080, y: 655, scale: 0.075, depth: 9 }
        ]
    }
};

export class AssetPreviewScene extends Scene {
    private previewId: AssetPreviewId = 'cafe';

    constructor() {
        super('AssetPreviewScene');
    }

    create(data: AssetPreviewPayload) {
        this.previewId = data.previewId ?? 'cafe';
        const preview = assetPreviews[this.previewId];

        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, preview.backgroundKey)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        preview.sprites.forEach((sprite) => {
            this.add.image(sprite.x, sprite.y, sprite.key)
                .setOrigin(0.5, 1)
                .setScale(sprite.scale)
                .setDepth(sprite.depth);
        });

        this.add.text(24, 24, preview.title, {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 28,
            color: '#f7efe2',
            backgroundColor: 'rgba(18, 20, 28, 0.72)',
            padding: {
                x: 12,
                y: 8
            }
        }).setDepth(20);

        this.input.on('pointerdown', this.returnToMap, this);
        this.input.keyboard?.on('keydown-ESC', this.returnToMap, this);
        this.input.keyboard?.on('keydown-M', this.returnToMap, this);

        this.events.once('shutdown', this.cleanup, this);
        this.events.once('destroy', this.cleanup, this);
        this.publishDebugState();
    }

    private returnToMap() {
        this.scene.start('MapScene');
    }

    private publishDebugState() {
        const debugWindow = window as Window & {
            __CML_DEBUG__?: {
                scene: string;
                previewId: AssetPreviewId;
                state: ReturnType<typeof gameState.getSnapshot>;
            };
        };

        debugWindow.__CML_DEBUG__ = {
            scene: 'asset-preview',
            previewId: this.previewId,
            state: gameState.getSnapshot()
        };
    }

    private cleanup() {
        this.game.canvas.style.cursor = 'default';
    }
}
