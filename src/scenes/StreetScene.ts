import { Scene } from 'phaser';
import type { GameObjects, Input } from 'phaser';
import { getHazelAnimationKey, registerHazelAnimations } from '../game/characterAnimations';
import { DEBUG_HOTSPOTS, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { HAZEL_DISPLAY_SCALE, HAZEL_TEXTURE_KEY } from '../game/hazelAnimationConfig';
import type { DialogueView, GameSceneData, HotspotData, InteractionVerb, SceneExitData, SceneId } from '../game/types';
import { playAudioCue } from '../systems/AudioCueSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { toggleGameFullscreen } from '../systems/FullscreenSystem';
import { gameState } from '../systems/GameState';
import { findHotspotAtPoint, getVisibleHotspots } from '../systems/HotspotSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { resolveCustomInteraction } from '../systems/InteractionSystem';
import { findNavigationPath } from '../systems/NavigationSystem';
import { PlayerController2D } from '../systems/PlayerController2D';
import type { PlayerControllerSnapshot } from '../systems/PlayerController2D';
import { SaveGameSystem } from '../systems/SaveGameSystem';
import { findExitAtPoint, getAvailableExits } from '../systems/SceneExitSystem';
import { loadSceneData } from '../systems/SceneDataLoader';
import { fadeInScene, transitionToScene } from '../systems/SceneTransitionSystem';
import { ActionToolbar, isInteractionVerbAction } from '../ui/ActionToolbar';
import type { ToolbarAction } from '../ui/ActionToolbar';
import { DebugPanel } from '../ui/DebugPanel';
import { DialogueBox } from '../ui/DialogueBox';
import { InventoryBar } from '../ui/InventoryBar';

const HAZEL_MIN_X = 40;
const HAZEL_MAX_X = GAME_WIDTH - 40;
const HAZEL_WALK_SPEED_PIXELS_PER_SECOND = 520;

export class StreetScene extends Scene {
    private sceneData!: GameSceneData;
    private hazel!: GameObjects.Sprite;
    private playerController!: PlayerController2D;
    private hazelAnimationKey?: string;
    private dialogueSystem = new DialogueSystem();
    private inventorySystem = new InventorySystem(gameState);
    private saveGameSystem = new SaveGameSystem();
    private dialogueBox?: DialogueBox;
    private actionToolbar?: ActionToolbar;
    private inventoryBar?: InventoryBar;
    private debugPanel?: DebugPanel;
    private hoverLabel?: GameObjects.Text;
    private hoverHighlightGraphics?: GameObjects.Graphics;
    private hotspotSprites = new Map<string, GameObjects.Image>();

    constructor() {
        super('StreetScene');
    }

    create() {
        this.sceneData = loadSceneData('street');
        gameState.setCurrentScene('street');

        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.sceneData.backgroundKey)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.createHotspotSprites();
        registerHazelAnimations(this);
        this.createHazelSprite();
        this.createDomOverlays();
        this.createHoverLabel();

        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.keyboard?.on('keydown-ESC', this.closeDialogue, this);
        this.input.keyboard?.on('keydown-SPACE', this.advanceDialogue, this);
        this.input.keyboard?.on('keydown-F', () => {
            void this.toggleFullscreen();
        });
        this.input.keyboard?.on('keydown-M', this.openMap, this);
        this.input.keyboard?.on('keydown-S', this.saveGame, this);
        window.addEventListener('keydown', this.handleInventoryKeyDown);

        this.events.once('shutdown', this.destroyDomOverlays, this);
        this.events.once('destroy', this.destroyDomOverlays, this);
        fadeInScene(this);
        this.publishDebugState();
    }

    update(_time: number, delta: number) {
        this.playerController.update(delta);
        this.syncHazelSprite();
        this.actionToolbar?.setMuted(this.dialogueBox?.isOpen() ?? false);
        this.debugPanel?.update(gameState.getSnapshot());
        this.publishDebugState();
    }

    private createHazelSprite() {
        this.playerController = new PlayerController2D({
            x: this.sceneData.playerStart.x,
            y: this.sceneData.playerStart.y,
            minX: HAZEL_MIN_X,
            maxX: HAZEL_MAX_X,
            speedPixelsPerSecond: HAZEL_WALK_SPEED_PIXELS_PER_SECOND
        });

        this.hazel = this.add.sprite(
            this.sceneData.playerStart.x,
            this.sceneData.playerStart.y,
            HAZEL_TEXTURE_KEY,
            0
        )
            .setOrigin(0.5, 1)
            .setScale(HAZEL_DISPLAY_SCALE)
            .setDepth(5)
            .play(getHazelAnimationKey('idle', 'right'));

        this.syncHazelSprite();
    }

    private createDomOverlays() {
        const parent = this.game.canvas.parentElement ?? document.body;

        this.dialogueBox = new DialogueBox(parent, {
            onAdvance: () => this.advanceDialogue(),
            onChoice: this.chooseDialogueOption,
            onClose: this.handleDialogueClosed
        });
        this.actionToolbar = new ActionToolbar(parent, this.handleToolbarAction);
        this.inventoryBar = new InventoryBar(parent, this.handleInventoryItemSelected);
        this.refreshInventoryBar();

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

    private createHotspotSprites() {
        this.sceneData.hotspots.forEach((hotspot) => {
            if (!hotspot.sprite) {
                return;
            }

            const sprite = this.add.image(hotspot.sprite.x, hotspot.sprite.y, hotspot.sprite.key)
                .setOrigin(0.5, 1)
                .setDepth(hotspot.sprite.depth ?? 4);

            if (hotspot.sprite.width && hotspot.sprite.height) {
                sprite.setDisplaySize(hotspot.sprite.width, hotspot.sprite.height);
            } else if (hotspot.sprite.scale) {
                sprite.setScale(hotspot.sprite.scale);
            }

            this.hotspotSprites.set(hotspot.id, sprite);
        });

        this.syncHotspotSprites();
    }

    private syncHotspotSprites() {
        const visibleHotspotIds = new Set(
            getVisibleHotspots(this.sceneData.hotspots, gameState.getFlags())
                .map((hotspot) => hotspot.id)
        );

        this.hotspotSprites.forEach((sprite, hotspotId) => {
            sprite.setVisible(visibleHotspotIds.has(hotspotId));
        });
    }

    private handlePointerDown(pointer: Input.Pointer) {
        if (this.dialogueBox?.isOpen()) {
            this.dialogueBox.advance();
            return;
        }

        const hotspot = findHotspotAtPoint(
            this.sceneData.hotspots,
            pointer.worldX,
            pointer.worldY,
            gameState.getFlags()
        );

        if (hotspot && this.actionToolbar?.getActiveAction() !== 'walk') {
            const action = this.actionToolbar?.getActiveAction() ?? 'look';
            this.performHotspotInteraction(hotspot, isInteractionVerbAction(action) ? action : hotspot.defaultVerb);
            return;
        }

        const sceneExit = findExitAtPoint(
            this.sceneData.exits,
            pointer.worldX,
            pointer.worldY,
            gameState.getFlags()
        );

        if (sceneExit) {
            this.transitionToScene(sceneExit);
            return;
        }

        this.moveHazelTo(pointer.worldX, pointer.worldY);
    }

    private handlePointerMove(pointer: Input.Pointer) {
        if (this.dialogueBox?.isOpen()) {
            this.hideHoverLabel();
            return;
        }

        const hotspot = findHotspotAtPoint(
            this.sceneData.hotspots,
            pointer.worldX,
            pointer.worldY,
            gameState.getFlags()
        );

        if (hotspot) {
            this.game.canvas.style.cursor = 'pointer';
            this.showHoverHighlight(hotspot);
            this.positionHoverLabel(pointer, hotspot.name);
            return;
        }

        const sceneExit = findExitAtPoint(
            this.sceneData.exits,
            pointer.worldX,
            pointer.worldY,
            gameState.getFlags()
        );

        if (sceneExit) {
            this.game.canvas.style.cursor = 'pointer';
            this.showHoverHighlight(sceneExit);
            this.positionHoverLabel(pointer, 'Go to office');
            return;
        }

        this.hideHoverLabel();
    }

    private handleInventoryKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() === 'i') {
            this.toggleInventory();
        }
    };

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

    private performHotspotInteraction(hotspot: HotspotData, verb = hotspot.defaultVerb) {
        this.hideHoverLabel();
        const result = resolveCustomInteraction(this.getInteractionResult(hotspot, verb));

        this.renderDialogueView(
            this.dialogueSystem.resolveInteractionResult(result, hotspot.name)
        );
    }

    private getInteractionResult(hotspot: HotspotData, verb: InteractionVerb) {
        if (verb === 'use') {
            const itemUse = this.inventorySystem.useSelectedItemOnHotspot(hotspot);

            if (itemUse) {
                return itemUse.result;
            }

            if (!hotspot.interactions.use && hotspot.interactions.pickup) {
                return hotspot.interactions.pickup;
            }
        }

        return hotspot.interactions[verb];
    }

    private moveHazelTo(x: number, y: number) {
        const path = this.sceneData.navigation
            ? findNavigationPath(this.playerController.getPosition(), { x, y }, this.sceneData.navigation)
            : [{ x, y: this.sceneData.walkBaselineY }];

        if (!path) {
            return;
        }

        this.playerController.moveAlong(path);
        this.syncHazelSprite();
        this.publishDebugState();
    }

    private syncHazelSprite() {
        const snapshot = this.playerController.getSnapshot();
        this.hazel.setPosition(snapshot.x, snapshot.y);

        const animationKey = getHazelAnimationKey(snapshot.state, snapshot.facing);

        if (animationKey === this.hazelAnimationKey) {
            return;
        }

        this.hazelAnimationKey = animationKey;
        this.hazel.play(animationKey, true);
    }

    private transitionToScene(exit: SceneExitData) {
        this.hideHoverLabel();
        transitionToScene(this, this.getSceneKey(exit.targetScene));
    }

    private handleToolbarAction = (action: ToolbarAction) => {
        if (action === 'map') {
            this.openMap();
            return;
        }

        if (action === 'exit') {
            const sceneExit = getAvailableExits(this.sceneData.exits, gameState.getFlags())[0];

            if (sceneExit) {
                this.transitionToScene(sceneExit);
                return;
            }

            this.renderDialogueView(
                this.dialogueSystem.startText('Hazel', [
                    'I do not see a useful exit from here. Which is inconvenient, but thematic.'
                ])
            );
            return;
        }

        if (action === 'inventory') {
            this.toggleInventory();
            return;
        }

        if (action === 'save') {
            this.saveGame();
            return;
        }

        if (action === 'fullscreen') {
            void this.toggleFullscreen();
        }
    };

    private toggleInventory() {
        if (this.dialogueBox?.isOpen()) {
            return;
        }

        this.inventoryBar?.toggle();
        this.refreshInventoryBar();
    }

    private handleInventoryItemSelected = (itemId: string) => {
        const item = this.inventorySystem.selectItem(itemId);

        if (!item) {
            return;
        }

        this.actionToolbar?.setActiveAction('use');
        this.refreshInventoryBar();
        this.publishDebugState();
    };

    private refreshInventoryBar() {
        this.inventoryBar?.update(this.inventorySystem.getView());
    }

    private openMap() {
        this.hideHoverLabel();

        if (!gameState.hasFlag('map_unlocked')) {
            this.renderDialogueView(
                this.dialogueSystem.startText('Hazel', [
                    'The map can wait until the ringing phone stops being the plot.'
                ])
            );
            return;
        }

        transitionToScene(this, 'MapScene');
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
                    ? 'Progress saved. The clues are now slightly less likely to wander off.'
                    : 'The save file refused to cooperate. Suspicious.'
            ])
        );
    }

    private async toggleFullscreen() {
        if (this.dialogueBox?.isOpen()) {
            return;
        }

        try {
            const changed = await toggleGameFullscreen();

            if (!changed) {
                this.renderDialogueView(
                    this.dialogueSystem.startText('Hazel', [
                        'Fullscreen is unavailable in this browser window.'
                    ])
                );
            }
        } catch {
            this.renderDialogueView(
                this.dialogueSystem.startText('Hazel', [
                    'Fullscreen refused to cooperate. Very on brand.'
                ])
            );
        }
    }

    private getSceneKey(sceneId: SceneId) {
        if (sceneId === 'office') {
            return 'OfficeScene';
        }

        if (sceneId === 'map') {
            return 'MapScene';
        }

        return 'StreetScene';
    }

    private publishDebugState() {
        const debugWindow = window as Window & {
            __CML_DEBUG__?: {
                scene: string;
                hazel: PlayerControllerSnapshot;
                state: ReturnType<typeof gameState.getSnapshot>;
            };
        };

        debugWindow.__CML_DEBUG__ = {
            scene: 'street',
            hazel: this.playerController.getSnapshot(),
            state: gameState.getSnapshot()
        };
    }

    private closeDialogue() {
        if (!this.dialogueBox?.isOpen() && this.inventoryBar?.isOpen()) {
            this.inventoryBar.setOpen(false);
            return;
        }

        this.dialogueSystem.cancel();
        this.dialogueBox?.close();
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
            this.actionToolbar?.setMuted(false);
            this.refreshInventoryBar();
            this.syncHotspotSprites();
            this.debugPanel?.update(gameState.getSnapshot());
            this.publishDebugState();
            return;
        }

        this.dialogueBox?.show(view);
        this.actionToolbar?.setMuted(true);
        this.refreshInventoryBar();
        this.syncHotspotSprites();
        this.debugPanel?.update(gameState.getSnapshot());
        this.publishDebugState();
    }

    private handleDialogueClosed = () => {
        this.dialogueSystem.cancel();
        this.actionToolbar?.setMuted(false);
        this.debugPanel?.update(gameState.getSnapshot());
        this.publishDebugState();
    };

    private destroyDomOverlays() {
        this.dialogueBox?.destroy();
        this.dialogueBox = undefined;
        this.actionToolbar?.destroy();
        this.actionToolbar = undefined;
        this.inventoryBar?.destroy();
        this.inventoryBar = undefined;
        this.debugPanel?.destroy();
        this.debugPanel = undefined;
        window.removeEventListener('keydown', this.handleInventoryKeyDown);
        this.game.canvas.style.cursor = 'default';
    }
}
