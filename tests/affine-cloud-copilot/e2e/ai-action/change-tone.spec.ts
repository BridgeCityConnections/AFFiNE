import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/ChangeTone', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support changing the tone of the selected content.', async ({
    page,
    utils,
  }) => {
    const { changeTone } = await utils.editor.askAiWithText(page, 'I Love U');
    const { answer } = await changeTone('informal');
    await expect(answer).toHaveText(/Love ya!/, { timeout: 10000 });
  });
});
