import { expect, test } from '@playwright/test';

test('loads directly into the office scene', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#game-container canvas')).toBeVisible();
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');
    await expect(page.getByTestId('action-toolbar')).toBeVisible();
});

test('clicking the phone hotspot opens and closes dialogue', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');

    await page.mouse.click(430, 410);

    const dialogueBox = page.getByTestId('dialogue-box');
    await expect(dialogueBox).toBeVisible();
    await expect(dialogueBox).toContainText('A ringing phone.');

    await page.keyboard.press('Escape');

    await expect(dialogueBox).toBeHidden();
});

test('clicking walkable floor moves Hazel and updates directional facing', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');
    await page.waitForFunction(() => (window as any).__CML_DEBUG__?.hazel?.state === 'idle');

    const start = await page.evaluate(() => (window as any).__CML_DEBUG__.hazel);

    await page.mouse.click(300, 500);
    await page.waitForFunction(
        (y) => (window as any).__CML_DEBUG__.hazel.y < y - 20,
        start.y
    );
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.facing)
    ).toBe('up');

    await page.mouse.click(300, 650);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.facing === 'down');

    await page.mouse.click(1050, 650);
    await page.waitForFunction(
        (x) => (window as any).__CML_DEBUG__.hazel.x > x + 20,
        start.x
    );
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.facing)
    ).toBe('right');

    await page.mouse.click(80, 650);
    await page.waitForFunction(() => (window as any).__CML_DEBUG__.hazel.facing === 'left');
    await expect.poll(
        async () => page.evaluate(() => (window as any).__CML_DEBUG__.hazel.x)
    ).toBeGreaterThanOrEqual(40);
});

test('clicking the office door moves to the street scene', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');

    await page.mouse.click(1050, 430);

    await expect(page.getByTestId('debug-panel')).toContainText('Scene: street');
});

test('toolbar exit button moves from office to street', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');

    await page.getByTestId('action-exit').click();

    await expect(page.getByTestId('debug-panel')).toContainText('Scene: street');
});

test('map opens from the office and can route to the street', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');

    await page.keyboard.press('M');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: map');

    await page.mouse.click(660, 210);

    await expect(page.getByTestId('debug-panel')).toContainText('Scene: street');
});

test('toolbar map button opens the map', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('debug-panel')).toContainText('Scene: office');

    await page.getByTestId('action-map').click();

    await expect(page.getByTestId('debug-panel')).toContainText('Scene: map');
});
