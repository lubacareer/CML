import { Scene } from 'phaser';
import type { GameObjects, Input } from 'phaser';
import { DEBUG_HOTSPOTS, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type { DialogueView, SceneId } from '../game/types';
import type { AssetPreviewId } from './AssetPreviewScene';
import { DialogueSystem } from '../systems/DialogueSystem';
import { gameState } from '../systems/GameState';
import { DebugPanel } from '../ui/DebugPanel';
import { DialogueBox } from '../ui/DialogueBox';

interface MapLocation {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    targetScene?: SceneId;
    previewId?: AssetPreviewId;
    lockedText?: string;
}

const MAP_LOCATIONS: MapLocation[] = [
    {
        id: 'detective_agency',
        name: 'Detective Agency Office',
        x: 280,
        y: 80,
        width: 250,
        height: 220,
        targetScene: 'office'
    },
    {
        id: 'cozy_cafe',
        name: 'Cozy Cafe / Street',
        x: 555,
        y: 90,
        width: 280,
        height: 220,
        previewId: 'cafe'
    },
    {
        id: 'police_kiosk',
        name: 'Police kiosk',
        x: 910,
        y: 105,
        width: 235,
        height: 240,
        previewId: 'police-kiosk',
        lockedText: 'The police kiosk is locked behind paperwork. Terrifying paperwork.'
    },
    {
        id: 'oddities_museum',
        name: 'Oddities museum',
        x: 95,
        y: 330,
        width: 285,
        height: 230,
        lockedText: 'The museum is closed for an exhibit called Please Stop Touching That.'
    },
    {
        id: 'boarding_house',
        name: 'Boarding house',
        x: 715,
        y: 370,
        width: 315,
        height: 245,
        lockedText: 'The boarding house will matter once the case has more suspects.'
    },
    {
        id: 'narrow_alley',
        name: 'Narrow alley',
        x: 455,
        y: 455,
        width: 210,
        height: 220,
        previewId: 'alley',
        lockedText: 'The alley refuses to be investigated before it has a proper clue.'
    },
    {
        id: 'docks',
        name: 'The docks',
        x: 45,
        y: 560,
        width: 310,
        height: 145,
        lockedText: 'The docks are full of boats, fish, and future sprint work.'
    }
];

export class MapScene extends Scene {
    private dialogueSystem = new DialogueSystem();
    private dialogueBox?: DialogueBox;
    private debugPanel?: DebugPanel;
    private hoverLabel?: GameObjects.Text;

    constructor() {
        super('MapScene');
    }

    create() {
        gameState.setCurrentScene('map');

        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'map')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.createDomOverlays();
        this.createHoverLabel();

        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.keyboard?.on('keydown-ESC', this.returnToOffice, this);
        this.input.keyboard?.on('keydown-M', this.returnToOffice, this);
        this.input.keyboard?.on('keydown-SPACE', this.advanceDialogue, this);

        this.events.once('shutdown', this.destroyDomOverlays, this);
        this.events.once('destroy', this.destroyDomOverlays, this);
        this.publishDebugState();
    }

    private createDomOverlays() {
        const parent = this.game.canvas.parentElement ?? document.body;

        this.dialogueBox = new DialogueBox(parent, {
            onAdvance: () => this.advanceDialogue(),
            onChoice: this.chooseDialogueOption,
            onClose: this.handleDialogueClosed
        });

        if (DEBUG_HOTSPOTS) {
            this.debugPanel = new DebugPanel(parent);
            this.debugPanel.update(gameState.getSnapshot());
        }
    }

    private createHoverLabel() {
        this.hoverLabel = this.add.text(0, 0, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            color: '#f8f0dc',
            backgroundColor: '#111319',
            padding: {
                x: 8,
                y: 4
            }
        }).setDepth(30).setVisible(false);
    }

    private handlePointerDown(pointer: Input.Pointer) {
        if (this.dialogueBox?.isOpen()) {
            this.dialogueBox.advance();
            return;
        }

        const location = this.findLocationAtPoint(pointer.worldX, pointer.worldY);

        if (!location) {
            return;
        }

        if (location.targetScene) {
            this.scene.start(this.getSceneKey(location.targetScene));
            return;
        }

        if (location.previewId) {
            this.scene.start('AssetPreviewScene', {
                previewId: location.previewId
            });
            return;
        }

        this.renderDialogueView(
            this.dialogueSystem.startText(
                'Hazel',
                [location.lockedText ?? 'That part of the map is still arguing with production.']
            )
        );
    }

    private handlePointerMove(pointer: Input.Pointer) {
        if (this.dialogueBox?.isOpen()) {
            this.hideHoverLabel();
            return;
        }

        const location = this.findLocationAtPoint(pointer.worldX, pointer.worldY);

        if (!location) {
            this.hideHoverLabel();
            return;
        }

        this.game.canvas.style.cursor = 'pointer';
        this.positionHoverLabel(pointer, location.name);
    }

    private findLocationAtPoint(x: number, y: number) {
        return MAP_LOCATIONS.find((location) => (
            x >= location.x
            && x <= location.x + location.width
            && y >= location.y
            && y <= location.y + location.height
        ));
    }

    private positionHoverLabel(pointer: Input.Pointer, text: string) {
        this.hoverLabel?.setText(text);
        this.hoverLabel?.setVisible(true);
        const labelWidth = this.hoverLabel?.displayWidth ?? 0;
        const labelHeight = this.hoverLabel?.displayHeight ?? 0;
        const labelX = Math.min(pointer.worldX + 14, GAME_WIDTH - labelWidth - 10);
        const labelY = Math.max(pointer.worldY - 14, labelHeight + 10);
        this.hoverLabel?.setPosition(labelX, labelY);
    }

    private hideHoverLabel() {
        this.game.canvas.style.cursor = 'default';
        this.hoverLabel?.setVisible(false);
    }

    private returnToOffice() {
        if (this.dialogueBox?.isOpen()) {
            this.dialogueSystem.cancel();
            this.dialogueBox.close();
            return;
        }

        this.scene.start('OfficeScene');
    }

    private advanceDialogue() {
        this.renderDialogueView(this.dialogueSystem.advance());
    }

    private chooseDialogueOption = (choiceIndex: number) => {
        this.renderDialogueView(this.dialogueSystem.choose(choiceIndex));
    };

    private renderDialogueView(view: DialogueView | undefined) {
        if (!view) {
            this.dialogueBox?.close();
            this.debugPanel?.update(gameState.getSnapshot());
            this.publishDebugState();
            return;
        }

        this.dialogueBox?.show(view);
        this.debugPanel?.update(gameState.getSnapshot());
        this.publishDebugState();
    }

    private getSceneKey(sceneId: SceneId) {
        if (sceneId === 'street') {
            return 'StreetScene';
        }

        if (sceneId === 'map') {
            return 'MapScene';
        }

        return 'OfficeScene';
    }

    private publishDebugState() {
        const debugWindow = window as Window & {
            __CML_DEBUG__?: {
                scene: string;
                state: ReturnType<typeof gameState.getSnapshot>;
            };
        };

        debugWindow.__CML_DEBUG__ = {
            scene: 'map',
            state: gameState.getSnapshot()
        };
    }

    private handleDialogueClosed = () => {
        this.debugPanel?.update(gameState.getSnapshot());
        this.publishDebugState();
    };

    private destroyDomOverlays() {
        this.dialogueBox?.destroy();
        this.dialogueBox = undefined;
        this.debugPanel?.destroy();
        this.debugPanel = undefined;
        this.game.canvas.style.cursor = 'default';
    }
}
