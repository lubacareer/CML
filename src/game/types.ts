export type SceneId = 'office' | 'street' | 'map';

export interface Point2D {
    x: number;
    y: number;
}

export interface GameSceneData {
    id: SceneId;
    backgroundKey: string;
    playerStart: Point2D;
    walkBaselineY: number;
    navigation?: SceneNavigationData;
    exits: SceneExitData[];
    hotspots: HotspotData[];
}

export interface SceneExitData {
    id: string;
    targetScene: SceneId;
    x: number;
    y: number;
    width: number;
    height: number;
    requiredFlag?: string;
}

export interface WalkableAreaData {
    id: string;
    points: Point2D[];
}

export interface NavigationNodeData extends Point2D {
    id: string;
    links: string[];
}

export interface SceneNavigationData {
    walkableAreas: WalkableAreaData[];
    blockers?: WalkableAreaData[];
    nodes: NavigationNodeData[];
}

export interface HotspotData {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    defaultVerb: InteractionVerb;
    interactions: Partial<Record<InteractionVerb, InteractionResult>>;
    requiredFlag?: string;
    hiddenWhenFlag?: string;
}

export type InteractionVerb = 'look' | 'talk' | 'use' | 'pickup';

export type InteractionResult =
    | { type: 'dialogue'; dialogueId: string }
    | { type: 'text'; text: string }
    | { type: 'addItem'; itemId: string; text?: string }
    | { type: 'setFlag'; flag: string; text?: string }
    | { type: 'changeScene'; sceneId: SceneId }
    | { type: 'custom'; actionId: string };

export interface GameStateSnapshot {
    currentScene: SceneId;
    flags: Record<string, boolean>;
    inventory: string[];
    activeCaseId: string;
}

export interface DialogueChoice {
    text: string;
    next: string;
}

export type DialogueEffect = { type: 'setFlag'; flag: string };

export interface DialogueNode {
    speaker: string;
    lines: string[];
    choices?: DialogueChoice[];
    next?: string;
    effects?: DialogueEffect[];
}

export type DialogueData = Record<string, DialogueNode>;
