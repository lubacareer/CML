import type { Scene } from 'phaser';
import {
    HAZEL_ANIMATION_KEYS,
    HAZEL_FRAMES,
    HAZEL_TEXTURE_KEY
} from './hazelAnimationConfig';
import type { PlayerFacing, PlayerMovementState } from '../systems/PlayerController2D';

const createAnimationIfMissing = (
    scene: Scene,
    key: string,
    frames: number[],
    frameRate: number,
    repeat: number
) => {
    if (scene.anims.exists(key)) {
        return;
    }

    scene.anims.create({
        key,
        frames: frames.map((frame) => ({
            key: HAZEL_TEXTURE_KEY,
            frame
        })),
        frameRate,
        repeat
    });
};

export const registerHazelAnimations = (scene: Scene) => {
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.idleRight,
        [HAZEL_FRAMES.idleRight],
        1,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.walkRight,
        Array.from(
            { length: HAZEL_FRAMES.walkRightEnd - HAZEL_FRAMES.walkRightStart + 1 },
            (_, index) => HAZEL_FRAMES.walkRightStart + index
        ),
        10,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.idleLeft,
        [HAZEL_FRAMES.idleLeft],
        1,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.walkLeft,
        Array.from(
            { length: HAZEL_FRAMES.walkLeftEnd - HAZEL_FRAMES.walkLeftStart + 1 },
            (_, index) => HAZEL_FRAMES.walkLeftStart + index
        ),
        10,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.idleDown,
        [HAZEL_FRAMES.idleDownStart, HAZEL_FRAMES.idleDownEnd],
        2,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.walkDown,
        Array.from(
            { length: HAZEL_FRAMES.walkDownEnd - HAZEL_FRAMES.walkDownStart + 1 },
            (_, index) => HAZEL_FRAMES.walkDownStart + index
        ),
        10,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.idleUp,
        [HAZEL_FRAMES.idleUpStart, HAZEL_FRAMES.idleUpEnd],
        2,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.walkUp,
        Array.from(
            { length: HAZEL_FRAMES.walkUpEnd - HAZEL_FRAMES.walkUpStart + 1 },
            (_, index) => HAZEL_FRAMES.walkUpStart + index
        ),
        10,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.think,
        [HAZEL_FRAMES.thinkStart, HAZEL_FRAMES.thinkEnd],
        2,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.surprised,
        [HAZEL_FRAMES.surprisedStart, HAZEL_FRAMES.surprisedEnd],
        4,
        -1
    );
    createAnimationIfMissing(
        scene,
        HAZEL_ANIMATION_KEYS.talk,
        [HAZEL_FRAMES.talkStart, HAZEL_FRAMES.talkEnd],
        4,
        -1
    );
};

export const getHazelAnimationKey = (
    state: PlayerMovementState,
    facing: PlayerFacing
) => {
    const animationKeyByFacing = state === 'walking'
        ? {
            left: HAZEL_ANIMATION_KEYS.walkLeft,
            right: HAZEL_ANIMATION_KEYS.walkRight,
            up: HAZEL_ANIMATION_KEYS.walkUp,
            down: HAZEL_ANIMATION_KEYS.walkDown
        }
        : {
            left: HAZEL_ANIMATION_KEYS.idleLeft,
            right: HAZEL_ANIMATION_KEYS.idleRight,
            up: HAZEL_ANIMATION_KEYS.idleUp,
            down: HAZEL_ANIMATION_KEYS.idleDown
        };

    return animationKeyByFacing[facing];
};
