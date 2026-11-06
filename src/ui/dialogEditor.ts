import { type Editor } from '@tiptap/core';
import { type EditorAdapter } from '../editor/EditorAdapter.js';

export function createFullEditorDialog(adapter: EditorAdapter): {
  open: () => void;
  close: () => void;
} {
  let editor: Editor | null = null;
  let modal: HTMLElement | null = null;

  const close = () => {
    modal?.remove();
    document.querySelector('.fixed.inset-0.bg-black')?.remove();
  };

  return {
    open: () => {
      // Create modal backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
      backdrop.onclick = () => close();

      // Create modal dialog
      modal = document.createElement('div');
      modal.className = 'fixed inset-4 bg-white rounded-lg shadow-lg z-50 flex flex-col';

      // Dialog header
      const header = document.createElement('div');
      header.className = 'px-6 py-4 border-b border-slate-200 bg-slate-50';
      header.innerHTML = '<h2 class="text-lg font-bold">Full Text Editor</h2>';
      modal.appendChild(header);

      // Editor container
      const editorContainer = document.createElement('div');
      editorContainer.id = 'dialog-editor-container';
      editorContainer.className = 'flex-1 overflow-auto p-4';
      modal.appendChild(editorContainer);

      // Dialog footer
      const footer = document.createElement('div');
      footer.className = 'flex gap-2 p-4 border-t border-slate-200 bg-slate-50';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save & Close';
      saveBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
      saveBtn.onclick = async () => {
        if (editor && 'getHTML' in editor) {
          await adapter.onSave((editor as any).getHTML());
        }
        close();
      };

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Close';
      cancelBtn.className = 'px-4 py-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400';
      cancelBtn.onclick = () => close();

      footer.appendChild(saveBtn);
      footer.appendChild(cancelBtn);
      modal.appendChild(footer);

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);

      // TODO: Mount Tiptap editor into #dialog-editor-container
      // editor = createTipTapEditor({ adapter, ... })
    },

    close
  };
}
