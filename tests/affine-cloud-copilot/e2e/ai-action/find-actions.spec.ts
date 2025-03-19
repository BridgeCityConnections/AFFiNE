import { loginUser } from '@affine-test/kit/utils/cloud';
import { expect } from '@playwright/test';

import { test } from '../base/base-test';

test.describe('AIAction/FindActions', () => {
  test.beforeEach(async ({ page, utils }) => {
    const user = await utils.testUtils.getUser();
    await loginUser(page, user);
    await utils.testUtils.setupTestEnvironment(page);
    await utils.chatPanel.openChatPanel(page);
  });

  test('should find actions for selected content', async ({ page, utils }) => {
    const { findActions } = await utils.editor.askAiWithText(
      page,
      `Choose a Booking Platform
Enter Travel Details
Compare and Select Flights`
    );
    const { answer } = await findActions();
    const todos = await answer.locator('affine-list').all();

    const expectedTexts = [
      'Choose a Booking Platform',
      'Enter Travel Details',
      'Compare and Select Flights',
    ];

    await Promise.all(
      todos.map(async (todo, index) => {
        // 验证 todo 前缀
        await expect(
          todo.locator('.affine-list-block__todo-prefix')
        ).toBeVisible();
        // 验证内容是否匹配
        await expect(todo).toHaveText(expectedTexts[index]);
      })
    );
  });
});
