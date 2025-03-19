import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/FixSpelling', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support fixing spelling errors in the selected content.', async ({
    page,
    utils,
  }) => {
    const { fixSpelling } = await utils.editor.askAiWithText(page, 'Appel MAC');
    const { answer } = await fixSpelling();
    await expect(answer).toHaveText(/Apple Mac/, { timeout: 10000 });
  });
});
