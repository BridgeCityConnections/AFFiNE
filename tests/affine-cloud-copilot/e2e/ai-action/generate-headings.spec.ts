import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/GenerateHeadings', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('should generate headings for selected content', async ({
    page,
    utils,
  }) => {
    const { generateHeadings } = await utils.editor.askAiWithText(
      page,
      'AFFiNE is a workspace with fully merged docs'
    );
    const { answer } = await generateHeadings();
    await Promise.race([
      answer.locator('h1').isVisible(),
      answer.locator('h2').isVisible(),
      answer.locator('h3').isVisible(),
    ]);
    await expect(answer).toHaveText(/AFFiNE/, { timeout: 10000 });
  });
});
