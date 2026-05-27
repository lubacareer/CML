import { expect, test, type Page } from '@playwright/test';

const waitForScene = async (page: Page, scene: string) => {
    await page.waitForFunction(
        (sceneId) => (window as any).__CML_DEBUG__?.scene === sceneId,
        scene
    );
};

type TrailPoint = {
    x: number;
    y: number;
};

const middleChairBounds = [
    { minX: 675, maxX: 930, minY: 505, maxY: 690 },
    { minX: 860, maxX: 1050, minY: 505, maxY: 690 }
];

const officeFurnitureBounds = [
    ...middleChairBounds,
    { minX: 355, maxX: 900, minY: 350, maxY: 640 },
    { minX: 1085, maxX: 1235, minY: 480, maxY: 710 }
];

const officeDoorPanelBounds = { minX: 930, maxX: 1125, minY: 130, maxY: 590 };

const isInsideMiddleChairBounds = (point: TrailPoint) => (
    middleChairBounds.some((bounds) => (
        point.x >= bounds.minX
        && point.x <= bounds.maxX
        && point.y >= bounds.minY
        && point.y <= bounds.maxY
    ))
);

const isInsideOfficeFurnitureBounds = (point: TrailPoint) => (
    officeFurnitureBounds.some((bounds) => (
        point.x >= bounds.minX
        && point.x <= bounds.maxX
        && point.y >= bounds.minY
        && point.y <= bounds.maxY
    ))
);

const isInsideOfficeDoorPanelBounds = (point: TrailPoint) => (
    point.x >= officeDoorPanelBounds.minX
    && point.x <= officeDoorPanelBounds.maxX
    && point.y >= officeDoorPanelBounds.minY
    && point.y <= officeDoorPanelBounds.maxY
);

const startHazelTrail = async (page: Page) => {
    await page.evaluate(() => {
        const debugWindow = window as any;
        window.clearInterval(debugWindow.__CML_TEST_TRAIL_TIMER__);
        debugWindow.__CML_TEST_TRAIL__ = [];
        debugWindow.__CML_TEST_TRAIL_TIMER__ = window.setInterval(() => {
            const hazel = debugWindow.__CML_DEBUG__?.hazel;

            if (hazel) {
                debugWindow.__CML_TEST_TRAIL__.push({ x: hazel.x, y: hazel.y });
            }
        }, 16);
    });
};

const stopHazelTrail = async (page: Page): Promise<TrailPoint[]> => (
    page.evaluate(() => {
        const debugWindow = window as any;
        window.clearInterval(debugWindow.__CML_TEST_TRAIL_TIMER__);

        return debugWindow.__CML_TEST_TRAIL__ ?? [];
    })
);

test('loads directly into the office scene', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#game-container canvas')).toBeVisible();
    await waitForScene(page, 'office');
    await expect(page.getByTestId('action-toolbar')).toBeVisible();
});

test('clicking the phone hotspot opens and closes dialogue', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.mouse.click(430, 410);

    const dialogueBox = page.getByTestId('dialogue-box');
    await expect(dialogueBox).toBeVisible();
    await expect(dialogueBox).toContainText('A ringing phone.');

    await page.keyboard.press('Escape');

    await expect(dialogueBox).toBeHidden();
});

test('clicking walkable floor moves Hazel and updates directional facing', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    const start = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    await page.mouse.click(1120, 690);
    await page.waitForFunction(
        (x) => (window as any).__CML_DEBUG__.hazel.x > x + 100,
        start.x
    );
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.facing)
    ).toBe('right');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const rightSide = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    await page.mouse.click(1060, 620);
    await page.waitForFunction(
        (y) => (window as any).__CML_DEBUG__.hazel.y < y - 20,
        rightSide.y
    );
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.facing)
    ).toBe('up');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    await page.mouse.click(1060, 700);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.facing === 'down');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const lowerRight = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    await page.mouse.click(390, 690);
    await page.waitForFunction(
        (x) => (window as any).__CML_DEBUG__.hazel.x < x - 100,
        lowerRight.x
    );
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.facing)
    ).toBe('left');
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.x)
    ).toBeGreaterThanOrEqual(40);
});

test('clicking office chairs does not place Hazel on the chair seats', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    await page.mouse.click(240, 610);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const hazel = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);
    const isOnLeftChair = hazel.x >= 120 && hazel.x <= 335 && hazel.y >= 440 && hazel.y <= 690;

    expect(isOnLeftChair).toBe(false);
});

test('clicking the desk does not place Hazel on the desk', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    await page.mouse.click(560, 620);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const hazel = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    expect(isInsideOfficeFurnitureBounds(hazel)).toBe(false);
});

test('clicking the coffee station does not place Hazel on the coffee machine', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    await page.mouse.click(1120, 690);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const hazel = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    expect(isInsideOfficeFurnitureBounds(hazel)).toBe(false);
});

test('clicking beside the office door does not place Hazel on the door panel', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    await page.mouse.click(995, 470);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const hazel = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    expect(isInsideOfficeDoorPanelBounds(hazel)).toBe(false);
    expect(hazel.y).toBeGreaterThanOrEqual(590);
});

test('crossing the office keeps Hazel out of the middle chair blockers', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    await startHazelTrail(page);
    await page.mouse.click(1120, 690);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const trail = await stopHazelTrail(page);

    expect(trail.length).toBeGreaterThan(3);
    expect(trail.some(isInsideMiddleChairBounds)).toBe(false);
});

test('clicking the street bicycle does not place Hazel on the bicycle', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.getByTestId('action-exit').click();
    await waitForScene(page, 'street');

    await page.mouse.click(900, 585);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'walking');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.state === 'idle');

    const hazel = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);
    const isOnBicycle = hazel.x >= 745 && hazel.x <= 1040 && hazel.y >= 455 && hazel.y <= 625;

    expect(isOnBicycle).toBe(false);
});

test('clicking the office door moves to the street scene', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.mouse.click(1050, 430);

    await waitForScene(page, 'street');
});

test('toolbar exit button moves from office to street', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.getByTestId('action-exit').click();

    await waitForScene(page, 'street');
});

test('map opens from the office and can route to the street', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.keyboard.press('M');
    await waitForScene(page, 'map');

    await page.mouse.click(660, 210);

    await waitForScene(page, 'street');
});

test('toolbar map button opens the map', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'office');

    await page.getByTestId('action-map').click();

    await waitForScene(page, 'map');
});
