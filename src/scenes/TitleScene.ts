import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type { SceneId } from '../game/types';
import { playAudioCue } from '../systems/AudioCueSystem';
import { gameState } from '../systems/GameState';
import { SaveGameSystem } from '../systems/SaveGameSystem';
import { fadeInScene, transitionToScene } from '../systems/SceneTransitionSystem';

export class TitleScene extends Scene {
    private root?: HTMLElement;
    private readonly saveGameSystem = new SaveGameSystem();

    constructor() {
        super('TitleScene');
    }

    create() {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'map')
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
            .setAlpha(0.72);

        this.createTitleDom();
        fadeInScene(this);
        this.events.once('shutdown', this.destroyTitleDom, this);
        this.events.once('destroy', this.destroyTitleDom, this);
        this.publishDebugState();
    }

    private createTitleDom() {
        const parent = this.game.canvas.parentElement ?? document.body;
        const savedSnapshot = this.saveGameSystem.load();
        const root = document.createElement('section');
        root.className = 'title-screen';
        root.setAttribute('data-testid', 'title-screen');

        const title = document.createElement('h1');
        title.className = 'title-screen__title';
        title.textContent = 'The Case of the Missing Logic';

        const actions = document.createElement('div');
        actions.className = 'title-screen__actions';

        const startButton = document.createElement('button');
        startButton.className = 'title-screen__button';
        startButton.type = 'button';
        startButton.textContent = 'Start Game';
        startButton.setAttribute('data-testid', 'title-start');
        startButton.addEventListener('click', this.startNewGame);

        const continueButton = document.createElement('button');
        continueButton.className = 'title-screen__button';
        continueButton.type = 'button';
        continueButton.textContent = 'Continue';
        continueButton.disabled = savedSnapshot === undefined;
        continueButton.setAttribute('data-testid', 'title-continue');
        continueButton.addEventListener('click', this.continueGame);

        actions.append(startButton, continueButton);
        root.append(title, actions);
        parent.append(root);
        this.root = root;
    }

    private startNewGame = () => {
        playAudioCue('ui');
        gameState.reset();
        transitionToScene(this, 'OfficeScene');
    };

    private continueGame = () => {
        const snapshot = this.saveGameSystem.load();

        playAudioCue('ui');

        if (!snapshot) {
            this.refreshContinueState(false);
            return;
        }

        gameState.restore(snapshot);
        transitionToScene(this, this.getSceneKey(snapshot.currentScene));
    };

    private refreshContinueState(enabled: boolean) {
        this.root
            ?.querySelector<HTMLButtonElement>('[data-testid="title-continue"]')
            ?.toggleAttribute('disabled', !enabled);
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
            scene: 'title',
            state: gameState.getSnapshot()
        };
    }

    private destroyTitleDom() {
        this.root?.remove();
        this.root = undefined;
    }
}
