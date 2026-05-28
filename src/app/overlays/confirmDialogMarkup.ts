import { escapeHtml } from '../htmlEscape'

export type ConfirmDialogCopy = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export function buildConfirmDialogHtml(copy: ConfirmDialogCopy): string {
  const confirmLabel = copy.confirmLabel ?? 'Continue'
  const cancelLabel = copy.cancelLabel ?? 'Stay'
  return `<div class="reward-sheet reward-sheet--confirm" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <p class="section-heading" id="confirm-title">${escapeHtml(copy.title)}</p>
    <p class="reward-hero__copy" id="confirm-message">${escapeHtml(copy.message)}</p>
    <div class="echo-controls confirm-dialog__actions">
      <button type="button" class="ghost" id="btn-confirm-cancel">${escapeHtml(cancelLabel)}</button>
      <button type="button" class="primary" id="btn-confirm-ok">${escapeHtml(confirmLabel)}</button>
    </div>
  </div>`
}
