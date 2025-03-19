import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/FixGrammar', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support fixing grammatical errors in the selected content.', async ({
    page,
    utils,
  }) => {
    const { fixGrammar } = await utils.editor.askAiWithText(
      page,
      'I is a student'
    );
    const { answer } = await fixGrammar();
    await expect(answer).toHaveText(/I am a student/, { timeout: 10000 });
  });
});
