import { type EditorAdapter } from '../editor/EditorAdapter.js';
import { type ToolbarButton } from './toolbar.js';

export interface SidePanelOptions {
  adapter: EditorAdapter;
  cellReference?: string; // e.g., "A1"
  toolbar: ToolbarButton[];
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function createSidePanel(options: SidePanelOptions): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'side-panel flex flex-col h-full bg-white';

  // Header: cell reference
  const header = document.createElement('div');
  header.className = 'px-4 py-2 border-b border-slate-200 bg-slate-50';
  header.innerHTML = `
    <div class="text-sm font-medium text-slate-700">
      Editing: <span class="font-mono font-bold">${options.cellReference || 'Cell'}</span>
    </div>
  `;
  panel.appendChild(header);

  // Toolbar
  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'toolbar-container';
  panel.appendChild(toolbarContainer);

  // Editor area (placeholder - Tiptap mounts here)
  const editorContainer = document.createElement('div');
  editorContainer.id = 'editor-container';
  editorContainer.className = 'flex-1 overflow-auto p-2';
  panel.appendChild(editorContainer);

  // Footer: Save/Cancel buttons
  const footer = document.createElement('div');
  footer.className = 'flex gap-2 p-3 border-t border-slate-200 bg-slate-50';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
  saveBtn.onclick = async () => {
    await options.onSave();
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'px-4 py-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400';
  cancelBtn.onclick = () => options.onCancel();

  footer.appendChild(saveBtn);
  footer.appendChild(cancelBtn);
  panel.appendChild(footer);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      options.onSave();
    }
    if (e.key === 'Escape') {
      options.onCancel();
    }
  });

  return panel;
}
