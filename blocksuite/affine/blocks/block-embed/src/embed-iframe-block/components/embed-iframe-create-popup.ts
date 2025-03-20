import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { CloseIcon } from '@blocksuite/icons/lit';
import { baseTheme } from '@toeverything/theme';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { EmbedIframeLinkInputBase } from './embed-iframe-link-input-base';

type EmbedModalVariant = 'default' | 'compact';

export class EmbedIframeCreatePopup extends EmbedIframeLinkInputBase {
  static override styles = css`
    .modal-main-wrapper {
      box-sizing: border-box;
      width: 340px;
      padding: 12px;
      border-radius: 8px;
      background: ${unsafeCSSVarV2('layer/background/overlayPanel')};
      box-shadow: ${unsafeCSSVar('overlayPanelShadow')};
      z-index: var(--affine-z-index-modal);
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    }

    .modal-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .modal-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: var(--affine-icon-color);
      border-radius: 4px;
    }
    .modal-close-button:hover {
      background-color: var(--affine-hover-color);
    }

    .title {
      /* Client/h6 */
      font-size: var(--affine-font-base);
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
      color: ${unsafeCSSVarV2('text/primary')};
    }

    .description {
      margin-top: 4px;
      font-feature-settings:
        'liga' off,
        'clig' off;
      font-size: var(--affine-font-sm);
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      color: ${unsafeCSSVarV2('text/secondary')};
    }

    .input-container {
      width: 100%;
      margin-top: 12px;

      .link-input {
        box-sizing: border-box;
        width: 100%;
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
        background: ${unsafeCSSVarV2('input/background')};
      }

      .link-input:focus {
        border-color: var(--affine-blue-700);
        box-shadow: var(--affine-active-shadow);
        outline: none;
      }
      .link-input::placeholder {
        color: var(--affine-placeholder-color);
      }
    }

    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 12px;

      .confirm-button {
        width: 100%;
        height: 32px;
        line-height: 32px;
        text-align: center;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background: ${unsafeCSSVarV2('button/primary')};
        border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};

        color: ${unsafeCSSVarV2('button/pureWhiteText')};
        /* Client/xsMedium */
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        cursor: pointer;
      }

      .confirm-button[disabled] {
        opacity: 0.5;
      }
    }

    .modal-main-wrapper.compact {
      padding: 12px 16px;

      .modal-content-wrapper {
        gap: 0;

        .icon-container {
          padding: 0;

          .icon-background {
            width: 56px;
            height: 56px;

            svg {
              width: 28px;
              height: 28px;
            }
          }
        }

        .title {
          padding: 10px 0;
          font-weight: 500;
        }

        .link-input {
          padding: 10px;
          font-size: 17px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: -0.43px;
        }

        .description,
        .input-container {
          margin-top: 0;
        }

        .title,
        .description {
          font-size: 17px;
          font-style: normal;
          line-height: 22px; /* 129.412% */
          letter-spacing: -0.43px;
        }

        .description {
          font-weight: 400;
          text-align: left;
          order: 2;
          padding: 10px 0;
          color: ${unsafeCSSVarV2('text/secondary')};
        }

        .input-container {
          order: 1;
        }
      }

      .button-container {
        padding: 4px 0;

        .confirm-button {
          height: 40px;
          line-height: 40px;
          font-size: 17px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: -0.43px;
        }
      }
    }
  `;

  private readonly _onClose = () => {
    this.abortController?.abort();
  };

  override render() {
    const { showCloseButton } = this;
    const { variant } = this;

    const modalMainWrapperClass = classMap({
      'modal-main-wrapper': true,
      compact: variant === 'compact',
    });

    return html`
      <div class=${modalMainWrapperClass}>
        ${showCloseButton
          ? html`
              <div class="modal-close-button" @click=${this._onClose}>
                ${CloseIcon({ width: '20', height: '20' })}
              </div>
            `
          : nothing}
        <div class="modal-content-wrapper">
          <div class="title">Embed Link</div>
          <div class="description">
            Works with links of Google Drive, Spotify…
          </div>
          <div class="input-container">
            <input
              class="link-input"
              type="text"
              placeholder="Paste in https://…"
              @input=${this.handleInput}
              @keydown=${this.handleKeyDown}
            />
          </div>
        </div>
        <div class="button-container">
          <div
            class="confirm-button"
            @click=${this.onConfirm}
            ?disabled=${this.isInputEmpty()}
          >
            Confirm
          </div>
        </div>
      </div>
    `;
  }

  @property({ attribute: false })
  accessor showCloseButton: boolean = true;

  @property({ attribute: false })
  accessor variant: EmbedModalVariant = 'default';
}
