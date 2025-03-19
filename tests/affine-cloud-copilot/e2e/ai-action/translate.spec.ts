import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/Translate', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support translating the selected content.', async ({ page, utils }) => {
    const { translate } = await utils.editor.askAiWithText(page, 'Apple');
    const { answer } = await translate('German');
    await expect(answer).toHaveText(/Apfel/, { timeout: 10000 });
  });

  // test.todo('support show chat history in chat panel', async ({ page, utils }) => {
  //   const { translate } = await utils.editor.askAiWithText(page, 'Apple');
  // });
});
