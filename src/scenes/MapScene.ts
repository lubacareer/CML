import { Scene } from 'phaser';
import type { GameObjects, Input } from 'phaser';
import { mapLocations } from '../data/mapLocations';
import { DEBUG_HOTSPOTS, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type { DialogueView } from '../game/types';
import { playAudioCue } from '../systems/AudioCueSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { gameState } from '../systems/GameState';
import { findMapLocationAtPoint, resolveMapLocation } from '../systems/MapNavigationSystem';
import { SaveGameSystem } from '../systems/SaveGameSystem';
import { getSceneKeyForSceneId } from '../systems/SceneKeySystem';
import { fadeInScene, transitionToScene } from '../systems/SceneTransitionSystem';
import { DebugPanel } from '../ui/DebugPanel';
import { DialogueBox } from '../ui/DialogueBox';

export class MapScene extends Scene {
    private dialogueSystem = new DialogueSystem();
    private saveGameSystem = new SaveGameSystem();
    private dialogueBox?: DialogueBox;
    private debugPanel?: DebugPanel;
    private hoverLabel?: GameObjects.Text;
    private hoverHighlightGraphics?: GameObjects.Graphics;

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
        this.input.keyboard?.on('keydown-S', this.saveGame, this);

        this.events.once('shutdown', this.destroyDomOverlays, this);
        this.events.once('destroy', this.destroyDomOverlays, this);
        fadeInScene(this);
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

        if (DEBUG_HOTSPOTS) {
            this.hoverHighlightGraphics = this.add.graphics().setDepth(19);
        }
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

        const result = resolveMapLocation(
            location,
            gameState.getFlags(),
            gameState.getSelectedItemId()
        );

        if (result.type === 'changeScene') {
            transitionToScene(this, getSceneKeyForSceneId(result.sceneId));
            return;
        }

        if (result.type === 'preview') {
            transitionToScene(this, 'AssetPreviewScene', {
                previewId: result.previewId
            });
            return;
        }

        if (result.type === 'interaction') {
            this.renderDialogueView(
                this.dialogueSystem.resolveInteractionResult(result.result, location.name)
            );
            return;
        }

        this.renderDialogueView(
            this.dialogueSystem.startText(
                'Hazel',
                [result.text]
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
        this.showHoverHighlight(location);
        this.positionHoverLabel(pointer, location.name);
    }

    private findLocationAtPoint(x: number, y: number) {
        return findMapLocationAtPoint(mapLocations, x, y);
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
        this.hoverHighlightGraphics?.clear();
        this.hoverLabel?.setVisible(false);
    }

    private showHoverHighlight(bounds: { x: number; y: number; width: number; height: number }) {
        if (!DEBUG_HOTSPOTS) {
            return;
        }

        this.hoverHighlightGraphics?.clear();
        this.hoverHighlightGraphics?.lineStyle(2, 0xf3c14b, 0.9);
        this.hoverHighlightGraphics?.fillStyle(0xf3c14b, 0.1);
        this.hoverHighlightGraphics?.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.hoverHighlightGraphics?.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    private returnToOffice() {
        if (this.dialogueBox?.isOpen()) {
            this.dialogueSystem.cancel();
            this.dialogueBox.close();
            return;
        }

        transitionToScene(this, 'OfficeScene');
    }

    private advanceDialogue() {
        if (this.dialogueBox?.completeLineIfTyping()) {
            return;
        }

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

    private saveGame() {
        if (this.dialogueBox?.isOpen()) {
            return;
        }

        const saved = this.saveGameSystem.save(gameState.getSnapshot());

        playAudioCue('save');
        this.renderDialogueView(
            this.dialogueSystem.startText('Hazel', [
                saved
                    ? 'Progress saved. The map promises to remember where it put itself.'
                    : 'The save file refused to cooperate. Suspicious.'
            ])
        );
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
        this.dialogueSystem.cancel();
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
