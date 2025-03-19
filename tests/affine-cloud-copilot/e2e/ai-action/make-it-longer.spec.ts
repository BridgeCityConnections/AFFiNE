import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/MakeItLonger', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support making the selected content longer.', async ({
    page,
    utils,
  }) => {
    const { makeItLonger } = await utils.editor.askAiWithText(
      page,
      'AFFiNE is a workspace with fully merged docs'
    );
    const { answer } = await makeItLonger();
    await expect(answer).toHaveText(/AFFiNE/, { timeout: 10000 });
  });
});
