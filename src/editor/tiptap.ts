import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { type EditorAdapter, type EditorAdapterInit } from './EditorAdapter';
import { normalizeHtmlForEditor, sanitizeCellHtml } from './sanitize';

export interface RichTextEditorOptions {
  adapter: EditorAdapter;
  placeholder?: string;
  className?: string;
  windowObject?: Window;
}

export function toWordPressCompatibleHtml(value: string, windowObject: Window): string {
  const sanitized = sanitizeCellHtml(value, windowObject);
  return sanitized
    .replace(/<strong>(.*?)<\/strong>/gi, '<b>$1</b>')
    .replace(/<em>(.*?)<\/em>/gi, '<i>$1</i>')
    .replace(/<p><br><\/p>/gi, '<p></p>')
    .trim();
}

export function parseWordPressHtml(value: string, windowObject: Window): string {
  const normalized = normalizeHtmlForEditor(value, windowObject);
  return normalized
    .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
    .replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>');
}

export function createTipTapEditor(options: RichTextEditorOptions): { editor: Editor; onSave: () => Promise<void> } {
  const rootWindow = options.windowObject ?? (typeof window !== 'undefined' ? window : (globalThis as unknown as Window));

  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank'
        }
      })
    ],
    content: parseWordPressHtml(options.adapter.getValue(), rootWindow),
    editorProps: {
      attributes: {
        class: [
          'prose',
          'max-w-none',
          'focus:outline-none',
          'min-h-[150px]',
          'p-3',
          'rounded-md',
          'border',
          'border-slate-200',
          'bg-white'
        ].join(' '),
        'data-placeholder': options.placeholder ?? 'Start typing…'
      }
    },
    onUpdate: ({ editor }) => {
      const html = toWordPressCompatibleHtml(editor.getHTML(), rootWindow);
      options.adapter.setValue(html);
    }
  });

  const onSave = async (): Promise<void> => {
    const html = toWordPressCompatibleHtml(editor.getHTML(), rootWindow);
    await Promise.resolve(options.adapter.onSave(html));
  };

  return { editor, onSave };
}

export function createEditorAdapterContract(initialValue: string): EditorAdapter {
  let currentValue = initialValue ?? '';

  return {
    getValue: () => currentValue,
    setValue: (value: string) => {
      currentValue = value;
    },
    onSave: async (value: string) => {
      currentValue = value;
    }
  };
}

export const editorContractDefaults: Required<EditorAdapterInit> = {
  initialValue: ''
};
