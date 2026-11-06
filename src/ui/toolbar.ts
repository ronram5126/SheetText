import { Editor } from '@tiptap/core';

export interface ToolbarButton {
  name: string;
  label: string;
  icon: string; // Or use HTML entity or SVG
  command: () => void;
  isActive?: () => boolean;
}

export function createToolbar(editor: Editor): ToolbarButton[] {
  return [
    {
      name: 'bold',
      label: 'Bold',
      icon: 'B',
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold')
    },
    {
      name: 'italic',
      label: 'Italic',
      icon: 'I',
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic')
    },
    {
      name: 'link',
      label: 'Link',
      icon: '🔗',
      command: () => {
        const url = prompt('Enter URL:');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      isActive: () => editor.isActive('link')
    },
    {
      name: 'bulletList',
      label: 'Bullet List',
      icon: '•',
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList')
    },
    {
      name: 'orderedList',
      label: 'Ordered List',
      icon: '1.',
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList')
    },
    {
      name: 'h1',
      label: 'Heading 1',
      icon: 'H1',
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 })
    },
    {
      name: 'h2',
      label: 'Heading 2',
      icon: 'H2',
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 })
    },
    {
      name: 'h3',
      label: 'Heading 3',
      icon: 'H3',
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 })
    },
    {
      name: 'clear',
      label: 'Clear Formatting',
      icon: '✕',
      command: () => editor.chain().focus().clearNodes().run(),
      isActive: () => false
    }
  ];
}

export function renderToolbar(buttons: ToolbarButton[], container: HTMLElement): void {
  container.innerHTML = '';
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar flex gap-2 p-2 border-b border-slate-200 bg-slate-50';

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.label || btn.icon;
    button.className = `px-3 py-1 rounded border ${
      btn.isActive?.() ? 'bg-blue-500 text-white' : 'bg-white border-slate-300 hover:bg-slate-100'
    }`;
    button.onclick = () => btn.command();
    toolbar.appendChild(button);
  });

  container.appendChild(toolbar);
}
