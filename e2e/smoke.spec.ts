import { expect, test } from '@playwright/test';

test('game shell loads with a visible Phaser canvas', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('game-root')).toBeVisible();
    await expect(page.locator('#game-container canvas')).toBeVisible();
});
