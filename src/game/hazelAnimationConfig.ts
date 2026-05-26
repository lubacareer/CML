export const HAZEL_TEXTURE_KEY = 'hazel-4dir';

export const HAZEL_FRAME_WIDTH = 192;
export const HAZEL_FRAME_HEIGHT = 360;
export const HAZEL_FRAME_COUNT = 44;
export const HAZEL_SHEET_COLUMNS = 11;
export const HAZEL_SHEET_ROWS = 4;
export const HAZEL_DISPLAY_SCALE = 0.64;

export const HAZEL_ANIMATION_KEYS = {
    idleLeft: 'hazel-idle-left',
    idleRight: 'hazel-idle-right',
    idleUp: 'hazel-idle-up',
    idleDown: 'hazel-idle-down',
    walkLeft: 'hazel-walk-left',
    walkRight: 'hazel-walk-right',
    walkUp: 'hazel-walk-up',
    walkDown: 'hazel-walk-down',
    think: 'hazel-think',
    surprised: 'hazel-surprised',
    talk: 'hazel-talk'
} as const;

export const HAZEL_FRAMES = {
    idleRight: 0,
    walkRightStart: 1,
    walkRightEnd: 8,
    idleLeft: 9,
    walkLeftStart: 10,
    walkLeftEnd: 17,
    idleDownStart: 18,
    idleDownEnd: 19,
    walkDownStart: 20,
    walkDownEnd: 27,
    idleUpStart: 28,
    idleUpEnd: 29,
    walkUpStart: 30,
    walkUpEnd: 37,
    thinkStart: 38,
    thinkEnd: 39,
    surprisedStart: 40,
    surprisedEnd: 41,
    talkStart: 42,
    talkEnd: 43
} as const;
