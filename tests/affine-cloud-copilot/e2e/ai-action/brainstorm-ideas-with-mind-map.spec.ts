import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/BrainstormIdeasWithMindMap', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('should generate a mind map for the selected content', async ({
    page,
    utils,
  }) => {
    const { brainstormMindMap } = await utils.editor.askAiWithText(
      page,
      'Panda'
    );
    const { answer } = await brainstormMindMap();
    await expect(answer.locator('mini-mindmap-preview')).toBeVisible();
  });
});
