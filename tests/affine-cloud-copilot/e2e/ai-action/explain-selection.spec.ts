import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/ExplainSelection', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('support explaining the selected content.', async ({ page, utils }) => {
    const { explainSelection } = await utils.editor.askAiWithText(page, 'LLM');
    const { answer } = await explainSelection();
    await expect(answer).toHaveText(/Large Language Model/, { timeout: 10000 });
  });
});
