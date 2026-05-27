export type SceneId = 'office' | 'street' | 'map' | 'cafe' | 'police-kiosk';
export type AssetPreviewId = 'cafe' | 'police-kiosk' | 'alley';

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
    itemInteractions?: Partial<Record<string, InteractionResult>>;
    requiredFlag?: string;
    requiredFlags?: string[];
    hiddenWhenFlag?: string;
    sprite?: HotspotSpriteData;
}

export interface HotspotSpriteData {
    key: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    scale?: number;
    depth?: number;
}

export type InteractionVerb = 'look' | 'talk' | 'use' | 'pickup';

export type InteractionEffect =
    | { type: 'setFlag'; flag: string }
    | { type: 'addItem'; itemId: string };

export type InteractionResult =
    | { type: 'dialogue'; dialogueId: string }
    | { type: 'text'; text: string }
    | { type: 'addItem'; itemId: string; text?: string }
    | { type: 'setFlag'; flag: string; text?: string }
    | { type: 'effects'; effects: InteractionEffect[]; text: string }
    | { type: 'changeScene'; sceneId: SceneId }
    | { type: 'custom'; actionId: string };

export interface GameStateSnapshot {
    currentScene: SceneId;
    flags: Record<string, boolean>;
    inventory: string[];
    activeCaseId: string;
    selectedItemId?: string;
}

export interface InventoryItemData {
    id: string;
    displayName: string;
    description: string;
    iconKey: string;
    allowDuplicates?: boolean;
}

export interface InventoryItemView extends InventoryItemData {
    quantity: number;
    selected: boolean;
}

export interface InventoryView {
    items: InventoryItemView[];
    selectedItemId?: string;
}

export interface MapLocationData {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    initiallyUnlocked?: boolean;
    requiredFlag?: string;
    targetScene?: SceneId;
    previewId?: AssetPreviewId;
    itemInteractions?: Partial<Record<string, InteractionResult>>;
    lockedText: string;
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

export interface DialogueViewChoice {
    text: string;
    index: number;
}

export interface DialogueView {
    speaker: string;
    line: string;
    lineIndex: number;
    lineCount: number;
    choices: DialogueViewChoice[];
}
