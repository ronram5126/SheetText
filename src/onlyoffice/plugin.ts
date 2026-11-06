export interface OnlyOfficePluginContext {
  onSelectionChanged?: () => void;
  onCellSelection?: (cellText: string) => void;
}

export interface OnlyOfficePluginApi {
  plugin: {
    onSelectionChanged?: () => void;
    onCellSelection?: (cellText: string) => void;
    updateCellText?: (value: string) => void;
  };
}

import { type EditorAdapter } from '../editor/EditorAdapter.js';
import { sanitizeCellHtml } from '../editor/sanitize.js';

export function createOnlyOfficePlugin(): OnlyOfficePluginApi {
  const pluginApi = (globalThis as typeof globalThis & { Asc?: { plugin?: OnlyOfficePluginContext } }).Asc?.plugin;

  return {
    plugin: {
      onSelectionChanged: () => {
        if (typeof pluginApi?.onSelectionChanged === 'function') {
          pluginApi.onSelectionChanged();
        }
      },
      onCellSelection: (cellText: string) => {
        if (typeof pluginApi?.onCellSelection === 'function') {
          pluginApi.onCellSelection(cellText);
        }
      },
      updateCellText: (value: string) => {
        if (typeof pluginApi === 'object') {
          const target = pluginApi as typeof pluginApi & { setCellValue?: (value: string) => void };
          if (typeof target.setCellValue === 'function') {
            target.setCellValue(value);
          }
        }
      }
    }
  };
}

export class OnlyOfficeRichTextAdapter implements EditorAdapter {
  private basePlugin: OnlyOfficePluginApi;
  private originalCanonical: string;
  private currentCanonical: string;

  constructor() {
    this.basePlugin = createOnlyOfficePlugin();
    const initialValue = this.getValue();
    this.originalCanonical = sanitizeCellHtml(initialValue, undefined);
    this.currentCanonical = this.originalCanonical;
  }

  getValue(): string {
    const pluginApi = (globalThis as typeof globalThis & { Asc?: { plugin?: any } }).Asc?.plugin;
    return String(pluginApi?.getCellValue?.() ?? '');
  }

  setValue(value: string): void {
    this.basePlugin.plugin.updateCellText?.(value);
    this.currentCanonical = sanitizeCellHtml(value, undefined);
  }

  hasChanged(): boolean {
    return this.originalCanonical !== this.currentCanonical;
  }

  async onSave(value: string): Promise<void> {
    if (!this.hasChanged()) {
      return;
    }
    this.setValue(value);
  }

  getOriginalCanonical(): string {
    return this.originalCanonical;
  }

  getCurrentCanonical(): string {
    return this.currentCanonical;
  }
}

export const onlyOfficeConfig = {
  plugins: [
    {
      name: 'SheetText Rich Text',
      guid: 'SheetText.RichTextEditor',
      baseUrl: 'https://example.com/plugin',
      events: ['onSelectionChanged', 'onCellSelection']
    }
  ]
};

export const onlyOfficePluginScript = `
(function() {
  const plugin = window.Asc && window.Asc.plugin;
  if (!plugin) {
    return;
  }

  plugin.onSelectionChanged = function() {
    const selectedValue = plugin.getSelectedCellText ? plugin.getSelectedCellText() : '';
    plugin.onCellSelection && plugin.onCellSelection(selectedValue);
  };

  plugin.updateCellText = function(value) {
    plugin.setCellValue && plugin.setCellValue(value);
  };
})();
`;
