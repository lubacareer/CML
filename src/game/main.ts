import { Game } from 'phaser';
import { createGameConfig } from './config';

const StartGame = (parent: string) => {
    return new Game(createGameConfig(parent));
};

export default StartGame;
