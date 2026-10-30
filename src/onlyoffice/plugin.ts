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
