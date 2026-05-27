import { CANVAS, Scale, Types } from 'phaser';
import { AssetPreviewScene } from '../scenes/AssetPreviewScene';
import { BootScene } from '../scenes/BootScene';
import { MapScene } from '../scenes/MapScene';
import { OfficeScene } from '../scenes/OfficeScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { StreetScene } from '../scenes/StreetScene';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export const createGameConfig = (parent: string): Types.Core.GameConfig => ({
    type: CANVAS,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#151820',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        PreloadScene,
        OfficeScene,
        StreetScene,
        MapScene,
        AssetPreviewScene
    ]
});
