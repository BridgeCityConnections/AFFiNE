import { getBlockSuiteEditorTitle } from '@affine-test/kit/utils/page-logic';
import { type Page } from '@playwright/test';

export class EditorUtils {
  public static async focusToEditor(page: Page) {
    const title = getBlockSuiteEditorTitle(page);
    await title.focus();
    await page.keyboard.press('Enter');
  }

  public static async getEditorContent(page: Page) {
    let content = '';
    let retry = 3;
    while (!content && retry > 0) {
      const lines = await page.$$('page-editor .inline-editor');
      const contents = await Promise.all(lines.map(el => el.innerText()));
      content = contents
        .map(c => c.replace(/\u200B/g, '').trim())
        .filter(c => !!c)
        .join('\n');
      if (!content) {
        await page.waitForTimeout(500);
        retry -= 1;
      }
    }
    return content;
  }

  public static async getNoteContent(page: Page) {
    const edgelessNode = await page.waitForSelector(
      'affine-edgeless-note .edgeless-note-page-content'
    );
    return (await edgelessNode.innerText()).replace(/\u200B/g, '').trim();
  }

  public static async switchToEdgelessMode(page: Page) {
    const editor = await page.waitForSelector('page-editor');
    await page.getByTestId('switch-edgeless-mode-button').click();
    editor.waitForElementState('hidden');
    await page.waitForSelector('edgeless-editor');
  }

  public static async switchToPageMode(page: Page) {
    await page.getByTestId('switch-page-mode-button').click();
    await page.waitForSelector('page-editor');
  }

  public static async isPageMode(page: Page) {
    return await page.waitForSelector('page-editor');
  }

  public static async isEdgelessMode(page: Page) {
    return await page.waitForSelector('edgeless-editor');
  }

  public static async getDocTitle(page: Page) {
    return page.getByTestId('title-edit-button').innerText();
  }

  public static async waitForAiAnswer(page: Page) {
    const answer = await page.getByTestId('ai-penel-answer');
    await answer.waitFor({
      state: 'visible',
      timeout: 20000,
    });
    return answer;
  }

  private static createAction(page: Page, action: () => Promise<void>) {
    return async () => {
      await action();
      return {
        answer: await this.waitForAiAnswer(page),
      };
    };
  }

  public static async askAiWithText(page: Page, text: string) {
    await this.focusToEditor(page);
    const texts = text.split('\n');
    texts.forEach(async (line, index) => {
      await page.keyboard.insertText(line);
      if (index !== texts.length - 1) {
        await page.keyboard.press('Enter');
      }
    });
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('ControlOrMeta+A');

    const askAI = await page.locator('page-editor editor-toolbar ask-ai-icon');
    await askAI.waitFor({
      state: 'attached',
      timeout: 5000,
    });
    await askAI.click();

    return {
      aiImageFilter: this.createAction(page, () =>
        page.getByTestId('action-ai-image-filter').click()
      ),
      brainstorm: this.createAction(page, () =>
        page.getByTestId('action-brainstorm').click()
      ),
      brainstormMindMap: this.createAction(page, () =>
        page.getByTestId('action-brainstorm-mind-map').click()
      ),
      changeTone: (
        tone: 'professional' | 'informal' | 'friendly' | 'critical' | 'humorous'
      ) =>
        this.createAction(page, async () => {
          await page.getByTestId('action-change-tone').hover();
          await page.getByTestId(`action-change-tone-${tone}`).click();
        })(),
      checkCodeError: this.createAction(page, () =>
        page.getByTestId('action-check-code-error').click()
      ),
      continueWithAi: this.createAction(page, () =>
        page.getByTestId('action-continue-with-ai').click()
      ),
      continueWriting: this.createAction(page, () =>
        page.getByTestId('action-continue-writing').click()
      ),
      createHeadings: this.createAction(page, () =>
        page.getByTestId('action-create-headings').click()
      ),
      expandMindMap: this.createAction(page, () =>
        page.getByTestId('action-expand-mind-map').click()
      ),
      explainSelection: this.createAction(page, () =>
        page.getByTestId('action-explain-selection').click()
      ),
      findActions: this.createAction(page, () =>
        page.getByTestId('action-find-actions').click()
      ),
      fixGrammar: this.createAction(page, () =>
        page.getByTestId('action-fix-grammar').click()
      ),
      fixSpelling: this.createAction(page, () =>
        page.getByTestId('action-fix-spelling').click()
      ),
      generateCaption: this.createAction(page, () =>
        page.getByTestId('action-generate-caption').click()
      ),
      generateHeadings: this.createAction(page, () =>
        page.getByTestId('action-generate-headings').click()
      ),
      generateImage: this.createAction(page, () =>
        page.getByTestId('action-generate-image').click()
      ),
      generateOutline: this.createAction(page, () =>
        page.getByTestId('action-generate-outline').click()
      ),
      generatePresentation: this.createAction(page, () =>
        page.getByTestId('action-generate-presentation').click()
      ),
      imageProcessing: this.createAction(page, () =>
        page.getByTestId('action-image-processing').click()
      ),
      improveGrammar: this.createAction(page, () =>
        page.getByTestId('action-improve-grammar').click()
      ),
      improveWriting: this.createAction(page, () =>
        page.getByTestId('action-improve-writing').click()
      ),
      makeItLonger: this.createAction(page, () =>
        page.getByTestId('action-make-it-longer').click()
      ),
      makeItReal: this.createAction(page, () =>
        page.getByTestId('action-make-it-real').click()
      ),
      makeItRealWithText: this.createAction(page, () =>
        page.getByTestId('action-make-it-real-with-text').click()
      ),
      makeItShorter: this.createAction(page, () =>
        page.getByTestId('action-make-it-shorter').click()
      ),
      summarize: this.createAction(page, () =>
        page.getByTestId('action-summarize').click()
      ),
      translate: (language: string) =>
        this.createAction(page, async () => {
          await page.getByTestId('action-translate').hover();
          await page.getByTestId(`action-translate-${language}`).click();
        })(),
      writeArticle: this.createAction(page, () =>
        page.getByTestId('action-write-article').click()
      ),
      writeBlogPost: this.createAction(page, () =>
        page.getByTestId('action-write-blog').click()
      ),
      writePoem: this.createAction(page, () =>
        page.getByTestId('action-write-poem').click()
      ),
      writeTwitterPost: this.createAction(page, () =>
        page.getByTestId('action-write-tweet').click()
      ),
    } as const;
  }
}
