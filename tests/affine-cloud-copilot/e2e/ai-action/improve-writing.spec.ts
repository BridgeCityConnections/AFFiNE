import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/ImproveWriting', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support improving the writing of the selected content.', async ({
    page,
    utils,
  }) => {
    const { improveWriting } = await utils.editor.askAiWithText(
      page,
      'peace for love'
    );
    const { answer } = await improveWriting();
    await expect(answer).toHaveText(/Peace for love./, { timeout: 10000 });
  });
});
